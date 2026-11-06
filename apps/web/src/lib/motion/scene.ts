import * as THREE from "three";

/** Valores que mueve el scroll; el bucle de render solo los lee. */
export const sceneState = { y: -2.15, scale: 1.6, mix: 0, opacity: 1, spin: -0.75 };

const LIMA_ROTATION = { y: 1.344, x: -0.21 };
const HALO = 5200;
const DUST = 1800;
const LIMA = 1;

const vertex = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aSeed;
  attribute float aKind;
  uniform float uTime;
  uniform float uMix;
  uniform float uSize;
  varying float vAlpha;
  varying float vKind;

  void main() {
    float t = clamp(uMix * 1.5 - aSeed * 0.5, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 source = position;
    if (aKind > 0.5 && aKind < 1.5) {
      source *= 1.0 + 0.035 * sin(uTime * 0.7 + aSeed * 40.0);
    }
    vec3 point = mix(source, aTarget, t);
    point += normalize(point + 0.001) * sin(t * 3.14159) * (aSeed - 0.3) * 0.7;

    vec4 view = modelViewMatrix * vec4(point, 1.0);
    vec3 normal = normalize(normalMatrix * normalize(source));
    float front = smoothstep(-0.25, 0.55, normal.z);
    float rim = pow(1.0 - abs(normal.z), 3.0);

    float globeAlpha = aKind > 1.5 && aKind < 2.5
      ? 0.14
      : aKind > 0.5 && aKind < 1.5
        ? 0.14 + 0.28 * aSeed
        : 0.2 + 0.8 * front + 1.1 * rim * front;
    float size = uSize * (0.7 + aSeed * 0.8);
    if (aKind > 2.5) {
      float pulse = 0.5 + 0.5 * sin(uTime * 2.4 - aSeed * 6.0);
      size *= 2.2 + 1.6 * pulse * (1.0 - t);
      globeAlpha = 0.5 + 0.5 * pulse;
    }
    vAlpha = mix(globeAlpha, 0.35 + 0.65 * aSeed, t);
    vKind = aKind;
    gl_PointSize = size / -view.z;
    gl_Position = projectionMatrix * view;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vKind;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float dot = smoothstep(0.5, 0.05, d);
    vec3 color = vKind > 2.5 ? uHot : uColor;
    gl_FragColor = vec4(color, dot * vAlpha * uOpacity);
  }
`;

function randomUnit() {
  const y = Math.random() * 2 - 1;
  const r = Math.sqrt(1 - y * y);
  const theta = Math.random() * Math.PI * 2;
  return [Math.cos(theta) * r, y, Math.sin(theta) * r];
}

/** Chip con retícula nítida: marco, núcleo, pistas y patas. */
function chipPoint(out: Float32Array, index: number) {
  const STEP = 0.042;
  const side = 1.0;
  const snap = (value: number) => Math.round(value / STEP) * STEP;
  const pick = (limit: number) => snap((Math.random() * 2 - 1) * limit);
  const roll = Math.random();
  const pin = (-3.5 + Math.floor(Math.random() * 8)) * 0.26;
  const dir = Math.random() > 0.5 ? 1 : -1;
  const horizontal = Math.random() > 0.5;
  let x = 0;
  let y = 0;
  let z = 0;
  if (roll < 0.34) {
    // Núcleo: bloque denso y elevado
    x = pick(0.5);
    y = pick(0.5);
    z = 0.26;
  } else if (roll < 0.46) {
    // Marco doble del encapsulado
    const edge = (Math.random() > 0.5 ? side : side - 0.09) * dir;
    x = horizontal ? edge : pick(side);
    y = horizontal ? pick(side) : edge;
  } else if (roll < 0.74) {
    // Pistas: del núcleo hacia cada pata
    const along = (0.56 + Math.random() * (side - 0.56)) * dir;
    x = horizontal ? along : pin;
    y = horizontal ? pin : along;
  } else {
    // Patas: dos filas de puntos fuera del encapsulado
    const along = (side + 0.04 + Math.random() * 0.34) * dir;
    const width = (Math.random() > 0.5 ? 1 : -1) * 0.04;
    x = horizontal ? along : pin + width;
    y = horizontal ? pin + width : along;
    z = -0.06;
  }
  out.set([x, y, z], index * 3);
}

export async function startScene(canvas: HTMLCanvasElement) {
  const response = await fetch("/data/globe.bin");
  const land = new Int16Array(await response.arrayBuffer());
  const landCount = land.length / 3;
  const total = landCount + HALO + DUST + LIMA;

  const position = new Float32Array(total * 3);
  const target = new Float32Array(total * 3);
  const seed = new Float32Array(total);
  const kind = new Float32Array(total);

  for (let i = 0; i < landCount; i += 1) {
    position.set([land[i * 3] / 32767, land[i * 3 + 1] / 32767, land[i * 3 + 2] / 32767], i * 3);
  }
  for (let i = landCount; i < landCount + HALO; i += 1) {
    const radius = 1.13 + Math.random() * 0.2;
    position.set(
      randomUnit().map((value) => value * radius),
      i * 3,
    );
    kind[i] = 1;
  }
  for (let i = landCount + HALO; i < landCount + HALO + DUST; i += 1) {
    position.set(randomUnit(), i * 3);
    kind[i] = 2;
  }
  // Lima y Callao: 12° S, 77° O
  const lat = (-12 * Math.PI) / 180;
  const lon = (-77 * Math.PI) / 180;
  for (let i = total - LIMA; i < total; i += 1) {
    const dLat = lat;
    const dLon = lon;
    position.set(
      [Math.cos(dLat) * Math.sin(dLon), Math.sin(dLat), Math.cos(dLat) * Math.cos(dLon)],
      i * 3,
    );
    kind[i] = 3;
  }
  for (let i = 0; i < total; i += 1) {
    seed[i] = Math.random();
    chipPoint(target, i);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geometry.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));

  const uniforms = {
    uTime: { value: 0 },
    uMix: { value: 0 },
    uOpacity: { value: 1 },
    uSize: { value: 13 },
    uColor: { value: new THREE.Color("#1fc4b3") },
    uHot: { value: new THREE.Color("#ffffff") },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 30);
  camera.position.z = 5;
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(pixelRatio);

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = 13 * pixelRatio * (window.innerHeight / 900);
  };
  resize();
  window.addEventListener("resize", resize);

  const pointer = { x: 0, y: 0 };
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );

  const clock = new THREE.Clock();
  const lerp = THREE.MathUtils.lerp;
  let tiltX = 0;
  let tiltY = 0;

  renderer.setAnimationLoop(() => {
    if (document.hidden || sceneState.opacity < 0.01) {
      clock.getDelta();
      return;
    }
    const time = clock.getElapsedTime();
    tiltX = lerp(tiltX, pointer.y * 0.12, 0.05);
    tiltY = lerp(tiltY, pointer.x * 0.18, 0.05);
    const { mix, y, scale, opacity, spin } = sceneState;
    const sway = Math.sin(time * 0.15) * 0.07 * (1 + Math.abs(spin));
    points.rotation.y = lerp(LIMA_ROTATION.y + sway + spin, -0.42, mix) + tiltY;
    points.rotation.x = lerp(LIMA_ROTATION.x, -0.62, mix) + tiltX;
    points.rotation.z = lerp(0, 0.12, mix);
    points.position.y = y;
    points.scale.setScalar(scale);
    uniforms.uTime.value = time;
    uniforms.uMix.value = mix;
    uniforms.uOpacity.value = opacity;
    renderer.render(scene, camera);
  });
}
