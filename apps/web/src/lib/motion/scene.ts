import * as THREE from "three";

/** Valores que mueve el scroll; el bucle de render solo los lee. */
export const sceneState = { y: -1.66, scale: 1.55, mix: 0, opacity: 1, spin: -0.75 };

const LIMA_ROTATION = { y: 1.344, x: -0.21 };
const HALO = 7600;
const DUST = 5000;
const SPARKS = 1100;
const LIMA = 1;

const vertex = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aSeed;
  attribute float aKind;
  uniform float uTime;
  uniform float uMix;
  uniform float uSize;
  uniform float uGlow;
  varying float vAlpha;
  varying float vKind;

  void main() {
    float t = clamp(uMix * 1.5 - aSeed * 0.5, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 source = position;
    if (aKind > 0.5 && aKind < 1.5) {
      source *= 1.0 + 0.02 * sin(uTime * 0.7 + aSeed * 40.0);
    }
    vec3 point = mix(source, aTarget, t);
    point += normalize(point + 0.001) * sin(t * 3.14159) * (aSeed - 0.3) * 0.7;

    vec4 view = modelViewMatrix * vec4(point, 1.0);
    vec3 normal = normalize(normalMatrix * normalize(source));
    float front = smoothstep(-0.25, 0.55, normal.z);
    float rim = pow(1.0 - abs(normal.z), 3.0);
    // Luz fija desde arriba a la izquierda: el globo tiene un lado encendido, como un planeta
    float lit = smoothstep(-0.45, 0.65, dot(normal, normalize(vec3(-0.15, 0.4, 0.9))));

    float globeAlpha = aKind > 1.5 && aKind < 2.5
      ? 0.2 * front
      : aKind > 0.5 && aKind < 1.5
        ? (0.14 + 0.95 * pow(1.0 - abs(normal.z), 2.0)) * (0.4 + 0.6 * aSeed)
        : (0.3 + 0.62 * lit) * mix(0.3, 1.0, smoothstep(0.05, 0.55, normal.z)) + 0.1 * rim * front;
    float size = uSize * (aKind > 0.5 && aKind < 1.5 ? 0.45 + aSeed * 0.4 : 0.95 + aSeed * 0.15);
    if (aKind > 3.5) {
      // Puntos blancos sueltos sobre el globo
      globeAlpha = (0.35 + 0.65 * abs(sin(uTime * (0.6 + aSeed) + aSeed * 30.0))) * front;
      size = uSize * 0.8;
    } else if (aKind > 2.5) {
      float pulse = 0.5 + 0.5 * sin(uTime * 2.4 - aSeed * 6.0);
      size *= 2.2 + 1.6 * pulse * (1.0 - t);
      globeAlpha = 0.5 + 0.5 * pulse;
    }
    float shimmer = 0.93 + 0.07 * sin(uTime * 1.6 + aSeed * 50.0);
    vAlpha = mix(globeAlpha, 0.35 + 0.65 * aSeed, t) * shimmer;
    vKind = aKind;
    gl_PointSize = size / -view.z;
    gl_Position = projectionMatrix * view;

    // Capa de brillo: solo la tierra, con puntos grandes y muy tenues que rellenan los continentes
    if (uGlow > 0.5) {
      if (aKind > 0.5) gl_Position = vec4(3.0, 3.0, 3.0, 1.0);
      gl_PointSize = size * 6.0 / -view.z;
      vAlpha *= 0.03;
    }
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uOpacity;
  uniform float uGlow;
  varying float vAlpha;
  varying float vKind;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float dot = uGlow > 0.5 ? pow(max(0.0, 1.0 - d * 2.0), 2.0) : smoothstep(0.5, 0.42, d);
    vec3 color = vKind > 2.5 ? uHot : uColor;
    if (vKind > 0.5 && vKind < 1.5) color = mix(uColor, uHot, 0.25);
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
  const total = landCount + HALO + DUST + SPARKS + LIMA;

  const position = new Float32Array(total * 3);
  const target = new Float32Array(total * 3);
  const seed = new Float32Array(total);
  const kind = new Float32Array(total);

  for (let i = 0; i < landCount; i += 1) {
    // Un poco de azar borra el dibujo en espiral del muestreo.
    const jitter = () => (Math.random() - 0.5) * 0.0012;
    position.set(
      [
        land[i * 3] / 32767 + jitter(),
        land[i * 3 + 1] / 32767 + jitter(),
        land[i * 3 + 2] / 32767 + jitter(),
      ],
      i * 3,
    );
  }
  for (let i = landCount; i < landCount + HALO; i += 1) {
    const [x, y, z] = randomUnit();
    const wave = Math.sin(Math.atan2(y, x) * 5 + z * 3) * 0.05;
    const radius = 1.19 + wave + (Math.random() - 0.5) * 0.022;
    position.set([x * radius, y * radius, z * radius], i * 3);
    kind[i] = 1;
  }
  for (let i = landCount + HALO; i < landCount + HALO + DUST; i += 1) {
    position.set(randomUnit(), i * 3);
    kind[i] = 2;
  }
  for (let i = total - LIMA - SPARKS; i < total - LIMA; i += 1) {
    position.set(
      randomUnit().map((value) => value * 1.005),
      i * 3,
    );
    kind[i] = 4;
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
    uGlow: { value: 0 },
    uSize: { value: 9 },
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
  const glowMaterial = material.clone();
  glowMaterial.uniforms = { ...uniforms, uGlow: { value: 1 } };
  const glow = new THREE.Points(geometry, glowMaterial);
  glow.frustumCulled = false;
  scene.add(glow);

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const mirrorMaterial = material.clone();
  mirrorMaterial.uniforms = { ...uniforms, uOpacity: { value: 0.09 } };
  mirrorMaterial.side = THREE.DoubleSide;
  const mirror = new THREE.Points(geometry, mirrorMaterial);
  mirror.frustumCulled = false;
  scene.add(mirror);


  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  // Si el navegador pierde el contexto gráfico, se ve la imagen fija hasta que vuelva.
  canvas.addEventListener("webglcontextlost", () => {
    document.documentElement.classList.remove("has-scene");
  });
  canvas.addEventListener("webglcontextrestored", () => {
    document.documentElement.classList.add("has-scene");
  });
  const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(pixelRatio);

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = 15 * pixelRatio * (window.innerHeight / 900);
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
    tiltX = lerp(tiltX, pointer.y * 0.3, 0.06);
    tiltY = lerp(tiltY, pointer.x * 0.5, 0.06);
    (canvas.parentElement as HTMLElement).style.setProperty(
      "--scene-opacity",
      String(sceneState.opacity),
    );
    const { mix, y, scale, opacity, spin } = sceneState;
    const sway = Math.sin(time * 0.16) * 0.06;
    points.rotation.y =
      lerp(LIMA_ROTATION.y + sway + spin, -0.42 + Math.sin(time * 0.5) * 0.14, mix) + tiltY;
    points.rotation.x = lerp(LIMA_ROTATION.x, -0.62 + Math.cos(time * 0.4) * 0.08, mix) + tiltX;
    points.rotation.z = lerp(0, 0.12, mix);
    points.position.y = y;
    points.position.x = tiltY * 0.25;
    points.scale.setScalar(scale);
    glow.visible = mix < 0.4;
    glow.rotation.copy(points.rotation);
    glow.position.copy(points.position);
    glow.scale.copy(points.scale);
    // Reflejo bajo el globo, solo cuando está centrado y a tamaño de pasos
    mirror.visible = mix < 0.5 && scale < 1.2;
    mirror.rotation.copy(points.rotation);
    mirror.position.set(points.position.x, y - scale * 2.02, 0);
    mirror.scale.set(scale, -scale * 0.5, scale);
    uniforms.uTime.value = time;
    uniforms.uMix.value = mix;
    uniforms.uOpacity.value = opacity;
    mirrorMaterial.uniforms.uOpacity.value = opacity * 0.09;
    renderer.render(scene, camera);
  });
}

const candleVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  varying float vAlpha;

  void main() {
    vec3 point = position;
    point += normalize(position + 0.001) * sin(uTime * (0.7 + aSeed) + aSeed * 30.0) * 0.012;
    vec4 view = modelViewMatrix * vec4(point, 1.0);
    vAlpha = 0.2 + 0.55 * abs(sin(uTime * (0.5 + aSeed) + aSeed * 20.0));
    gl_PointSize = uSize * (0.7 + aSeed * 0.6) / -view.z;
    gl_Position = projectionMatrix * view;
  }
`;

const candleFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float dot = smoothstep(0.5, 0.05, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(uColor, dot * vAlpha);
  }
`;

/** Velas de partículas que suben: el cierre de cada página. */
export function startCandles(canvas: HTMLCanvasElement) {
  const CANDLES = 6;
  const PER_CANDLE = 2600;
  const BODIES = [1.5, 1.05, 0.95, 1.4, 0.8, 1.1];
  const total = CANDLES * PER_CANDLE;
  const position = new Float32Array(total * 3);
  const seed = new Float32Array(total);
  for (let i = 0; i < total; i += 1) {
    const candle = i % CANDLES;
    const x = (candle - (CANDLES - 1) / 2) * 0.68;
    const center = -0.8 + (candle / (CANDLES - 1)) * 1.75 + (candle % 2 ? -0.12 : 0);
    const body = BODIES[candle];
    const wick = Math.random() < 0.16;
    const angle = Math.random() * Math.PI * 2;
    // Cáscara hueca con extremos redondeados: la vela se lee como una botella de luz
    const along = Math.random() - 0.5;
    const taper = Math.sqrt(Math.max(0, 1 - (2 * along) ** 8));
    const radius = (wick ? 0.06 : 0.13 * taper) * Math.sqrt(0.82 + Math.random() * 0.18);
    const height = (wick ? body + 0.6 : body) * along;
    position.set([x + Math.cos(angle) * radius, center + height, Math.sin(angle) * radius], i * 3);
    seed[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const material = new THREE.ShaderMaterial({
    vertexShader: candleVertex,
    fragmentShader: candleFragment,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 9 },
      uColor: { value: new THREE.Color("#1fd8c4") },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 20);
  camera.position.z = 6.3;
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  const ratio = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(ratio);
  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  material.uniforms.uSize.value = 7.5 * ratio * (height / 350);

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
  let visible = false;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(canvas);
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const time = clock.getElapsedTime();
    points.rotation.y = THREE.MathUtils.lerp(
      points.rotation.y,
      0.42 + Math.sin(time * 0.3) * 0.12 + pointer.x * 0.12,
      0.05,
    );
    points.rotation.x = THREE.MathUtils.lerp(points.rotation.x, pointer.y * 0.16, 0.05);
    material.uniforms.uTime.value = time;
    renderer.render(scene, camera);
  });
}
