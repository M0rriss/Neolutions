import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  CustomBlending,
  DoubleSide,
  MathUtils,
  OneFactor,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  ZeroFactor,
} from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { gsap } from "./gsap";
import { showFallback, whenIdle } from "./idle";

/** Valores que mueve el scroll; el bucle de render solo los lee. */
export const sceneState = {
  y: -1.51,
  scale: 1.4,
  mix: 0,
  opacity: 1,
  spin: -0.75,
  floor: -9,
  speed: 0.17,
  water: 0,
};

const LIMA_ROTATION = { y: 1.344, x: -0.21 };
const HALO = 17000;
const DUST = 16000;
const SPARKS = 340;
const LIMA = 1;
const MIN_PIXEL_RATIO = 0.75;

/** Equipos modestos y celulares reciben menos puntos y menor resolución desde el inicio. */
function pickQuality() {
  const { deviceMemory = 8 } = navigator as Navigator & { deviceMemory?: number };
  const low = navigator.hardwareConcurrency <= 4 || deviceMemory <= 4 || window.innerWidth < 768;
  return {
    halo: low ? 9000 : HALO,
    dust: low ? 7000 : DUST,
    ratio: Math.min(window.devicePixelRatio, low ? 1.25 : 1.5),
    mirror: low ? 256 : 512,
  };
}

const vertex = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aSeed;
  attribute float aKind;
  uniform float uTime;
  uniform float uMix;
  uniform float uSize;
  uniform float uGlow;
  uniform float uFloor;
  varying float vAlpha;
  varying float vKind;
  varying float vHot;

  // Envolvente: casi nada de onda larga para que siga redonda;
  // la aspereza del borde sale de ondas cortas enlazadas entre sí
  float ripple(vec3 d, float time) {
    float wide = sin(d.x * 1.7 + 1.3 * sin(d.y * 2.1 + time * 0.23) + time * 0.31)
      + sin(d.y * 2.3 + 1.1 * sin(d.z * 1.9 - time * 0.19) - time * 0.27 + 1.7);
    float mid = sin(d.x * 4.3 + d.y * 3.1 + 1.2 * sin(d.z * 3.7 + time * 0.4) - time * 0.55)
      + sin(d.y * 5.1 - d.z * 4.2 + 1.1 * sin(d.x * 4.6 - time * 0.33) + time * 0.62);
    float fine = sin(d.x * 8.3 + d.z * 6.1 + 1.3 * sin(d.y * 7.0 + time * 0.5) + time * 0.7)
      + sin(d.y * 9.7 - d.x * 5.3 + 1.2 * sin(d.z * 8.1 - time * 0.45) - time * 0.6);
    return wide * 0.012 + mid * 0.03 + fine * 0.012;
  }

  // Hebras: líneas finas y sinuosas sobre la envolvente, donde los puntos se ven más claros
  float strand(vec3 d, float time) {
    float line = sin(d.x * 3.1 + d.y * 2.3 + 1.4 * sin(d.z * 3.3 + time * 0.3) + time * 0.2);
    return pow(1.0 - abs(line), 9.0);
  }

  void main() {
    float t = clamp(uMix * 1.5 - aSeed * 0.5, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 source = position;
    float hot = 0.0;
    if (aKind > 0.5 && aKind < 1.5) {
      vec3 direction = normalize(position);
      hot = strand(direction, uTime * 1.6);
      // Cada punto se separa un poco distinto: el borde queda deshilachado, no es una línea
      source *= 1.0 + ripple(direction, uTime * 1.6) + (aSeed - 1.0) * 0.035;
    }
    vec3 point = mix(source, aTarget, t);
    point += normalize(point + 0.001) * sin(t * 3.14159) * (aSeed - 0.25) * 1.5;

    vec4 view = modelViewMatrix * vec4(point, 1.0);
    vec3 normal = normalize(normalMatrix * normalize(source));
    float front = smoothstep(-0.25, 0.55, normal.z);
    float rim = pow(1.0 - abs(normal.z), 3.0);
    // Luz fija desde arriba a la izquierda: el globo tiene un lado encendido, como un planeta
    float lit = smoothstep(-0.2, 0.9, dot(normal, normalize(vec3(-0.35, 0.5, 0.8))));

    float globeAlpha = aKind > 1.5 && aKind < 2.5
      ? (0.07 + 0.08 * pow(1.0 - max(normal.z, 0.0), 1.5)) * front * smoothstep(0.0, 0.3, normal.z)
      : aKind > 0.5 && aKind < 1.5
        ? (0.03 + 0.8 * pow(1.0 - abs(normal.z), 2.4)) * (0.55 + 0.45 * aSeed) * (1.0 + 1.6 * hot)
        : mix(0.12, (0.85 + 0.3 * lit) * mix(0.75, 1.0, smoothstep(0.0, 0.5, abs(normal.z))), smoothstep(-0.3, -0.04, normal.z));
    float size = uSize * (aKind > 1.5 && aKind < 2.5 ? 0.85 : aKind > 0.5 && aKind < 1.5 ? 0.66 + aSeed * 0.3 + hot * 0.25 : 0.8 + aSeed * 0.18);
    if (aKind > 3.5) {
      // Puntos blancos sueltos sobre el globo
      globeAlpha = (0.35 + 0.65 * abs(sin(uTime * (0.6 + aSeed) + aSeed * 30.0))) * front;
      size = uSize * 0.62;
    } else if (aKind > 2.5) {
      float pulse = 0.5 + 0.5 * sin(uTime * 2.4 - aSeed * 6.0);
      size *= 2.2 + 1.6 * pulse * (1.0 - t);
      globeAlpha = (0.5 + 0.5 * pulse) * front;
    }
    float shimmer = 0.93 + 0.07 * sin(uTime * 1.6 + aSeed * 50.0);
    vAlpha = mix(globeAlpha, 0.35 + 0.65 * aSeed, t) * shimmer * (1.0 - 0.55 * sin(t * 3.14159));
    // La base del planeta se funde en la oscuridad sobre su reflejo
    vAlpha *= smoothstep(uFloor - 0.03, uFloor + 0.5, (modelMatrix * vec4(point, 1.0)).y);
    vKind = aKind;
    vHot = hot;
    gl_PointSize = size / -view.z;
    gl_Position = projectionMatrix * view;

    // Capa de brillo: solo la tierra, con puntos grandes y muy tenues que rellenan los continentes
    if (uGlow > 0.5) {
      gl_PointSize = size * 4.0 / -view.z;
      vAlpha *= 0.42 * mix(0.7, 1.0, smoothstep(0.0, 0.5, abs(normal.z)));
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
  varying float vHot;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float dot = uGlow > 0.5 ? pow(max(0.0, 1.0 - d * 2.0), 2.0) : smoothstep(0.52, 0.4, d);
    vec3 color = vKind > 2.5 ? uHot : uColor;
    if (vKind > 0.5 && vKind < 1.5) color = mix(uColor, uHot, 0.04 + vHot * 0.42);
    gl_FragColor = vec4(color, dot * vAlpha * uOpacity);
  }
`;

const waterShader = {
  name: "AguaOscura",
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    uTime: { value: 0 },
    uStrength: { value: 0 },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec3 vWorld;

    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uStrength;
    varying vec4 vUv;
    varying vec3 vWorld;

    void main() {
      float t = uTime;
      vec2 p = vWorld.xz * vec2(1.0, 2.4);
      // Oleaje lento y enlazado: rompe el reflejo en manchas, no en líneas
      float swell = sin(p.x * 3.1 + sin(p.y * 2.3 + t * 0.4) * 1.6 + t * 0.3)
        + sin(p.y * 5.7 + sin(p.x * 2.7 - t * 0.33) * 1.4 - t * 0.5);
      float chop = sin(p.x * 7.0 + swell * 2.0 + t * 0.6) * sin(p.y * 11.0 - swell * 1.5 - t * 0.7);

      vec4 uv = vUv;
      uv.xy += vec2(swell * 0.016 + chop * 0.012, chop * 0.009) * uv.w;
      vec3 reflection = texture2DProj(tDiffuse, uv).rgb;

      float broken = smoothstep(-0.25, 0.85, swell * 0.5 + chop * 0.7);
      float fade = smoothstep(3.4, 0.5, vWorld.z) * smoothstep(-1.2, -0.1, vWorld.z);
      gl_FragColor = vec4(reflection * broken * fade * uStrength, 1.0);
    }
  `,
};

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

export async function startScene(
  canvas: HTMLCanvasElement,
  landData: ArrayBuffer,
  onFrame: (delta: number) => void,
) {
  const quality = pickQuality();
  const land = new Int16Array(landData);
  const landCount = land.length / 3;
  const total = landCount + quality.halo + quality.dust + SPARKS + LIMA;

  const position = new Float32Array(total * 3);
  const target = new Float32Array(total * 3);
  const seed = new Float32Array(total);
  const kind = new Float32Array(total);

  for (let i = 0; i < landCount; i += 1) {
    // Un poco de azar borra el dibujo en espiral del muestreo.
    const jitter = () => 0;
    position.set(
      [
        land[i * 3] / 32767 + jitter(),
        land[i * 3 + 1] / 32767 + jitter(),
        land[i * 3 + 2] / 32767 + jitter(),
      ],
      i * 3,
    );
  }
  for (let i = landCount; i < landCount + quality.halo; i += 1) {
    const [x, y, z] = randomUnit();
    const radius = 1.13;
    position.set([x * radius, y * radius, z * radius], i * 3);
    kind[i] = 1;
  }
  for (let i = landCount + quality.halo; i < total - SPARKS - LIMA; i += 1) {
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
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  const targetAttribute = new BufferAttribute(target, 3);
  geometry.setAttribute("aTarget", targetAttribute);
  geometry.setAttribute("aSeed", new BufferAttribute(seed, 1));
  geometry.setAttribute("aKind", new BufferAttribute(kind, 1));

  const uniforms = {
    uTime: { value: 0 },
    uMix: { value: 0 },
    uOpacity: { value: 1 },
    uGlow: { value: 0 },
    uFloor: { value: -9 },
    uSize: { value: 9 },
    uColor: { value: new Color("#1fdcc6") },
    uHot: { value: new Color("#ffffff") },
  };
  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 30);
  camera.position.z = 5;
  const glowMaterial = material.clone();
  glowMaterial.uniforms = { ...uniforms, uGlow: { value: 1 } };
  // El brillo solo rellena los continentes: comparte datos y se limita a los puntos de tierra
  const glowGeometry = new BufferGeometry();
  glowGeometry.setAttribute("position", geometry.getAttribute("position"));
  glowGeometry.setAttribute("aTarget", geometry.getAttribute("aTarget"));
  glowGeometry.setAttribute("aSeed", geometry.getAttribute("aSeed"));
  glowGeometry.setAttribute("aKind", geometry.getAttribute("aKind"));
  glowGeometry.setDrawRange(0, landCount);
  const glow = new Points(glowGeometry, glowMaterial);
  glow.frustumCulled = false;
  scene.add(glow);

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  // Charco: mancha de luz bajo la nube cuando se recoge sobre el agua.
  // A ras de agua el reflejo real se aplasta, así que aquí se dibuja la nube invertida y difusa.
  const puddleMaterial = material.clone();
  const puddleOpacity = { value: 0 };
  puddleMaterial.uniforms = {
    ...uniforms,
    uGlow: { value: 1 },
    uFloor: { value: -9 },
    uOpacity: puddleOpacity,
  };
  puddleMaterial.side = DoubleSide;
  const puddle = new Points(geometry, puddleMaterial);
  puddle.frustumCulled = false;
  puddle.visible = false;
  scene.add(puddle);

  // Agua: refleja la misma escena; solo suma luz, el resto sigue transparente
  const water = new Reflector(new PlaneGeometry(24, 24), {
    textureWidth: quality.mirror,
    textureHeight: quality.mirror,
    clipBias: 0.002,
    shader: waterShader,
  });
  water.rotation.x = -Math.PI / 2;
  water.visible = false;
  const waterMaterial = water.material as ShaderMaterial;
  waterMaterial.transparent = true;
  waterMaterial.depthWrite = false;
  waterMaterial.depthTest = false;
  waterMaterial.blending = CustomBlending;
  waterMaterial.blendSrc = OneFactor;
  waterMaterial.blendDst = OneFactor;
  waterMaterial.blendSrcAlpha = ZeroFactor;
  waterMaterial.blendDstAlpha = OneFactor;
  scene.add(water);

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    // Sin búfer de profundidad: los puntos no lo usan y ahorra memoria de video
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  // Si el navegador pierde el contexto gráfico, se ve la imagen fija hasta que vuelva.
  canvas.addEventListener("webglcontextlost", () => {
    document.documentElement.classList.remove("has-scene");
    showFallback();
  });
  canvas.addEventListener("webglcontextrestored", () => {
    document.documentElement.classList.add("has-scene");
  });

  let pixelRatio = quality.ratio;
  const applySize = () => {
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    const reference = Math.min(window.innerHeight, window.innerWidth * 1.6);
    uniforms.uSize.value = 14 * pixelRatio * (reference / 900);
  };
  const resize = () => {
    applySize();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  });

  // Si el equipo no llega a unos 40 cuadros por segundo, baja la resolución por pasos
  const watch = { time: 0, frames: 0 };
  const govern = (delta: number) => {
    watch.time += delta;
    watch.frames += 1;
    if (watch.frames < 60) return;
    const average = watch.time / watch.frames;
    watch.time = 0;
    watch.frames = 0;
    if (average > 1 / 40 && pixelRatio > MIN_PIXEL_RATIO) {
      pixelRatio = Math.max(MIN_PIXEL_RATIO, pixelRatio - 0.25);
      applySize();
    }
  };

  const lerp = MathUtils.lerp;
  const stage = canvas.parentElement as HTMLElement;
  // Giro propio del planeta, en radianes; se detiene mientras se transforma en el chip
  let turn = 0;
  let asleep = false;

  // El chip aparece mucho más abajo: sus posiciones se calculan con el navegador libre
  let chipReady = false;
  const buildChip = () => {
    if (chipReady) return;
    chipReady = true;
    for (let i = 0; i < total; i += 1) chipPoint(target, i);
    targetAttribute.needsUpdate = true;
  };
  whenIdle(buildChip, 2000);

  // Compila todo sin bloquear, también el agua: así no hay tirón la primera vez que aparece
  water.visible = true;
  puddle.visible = true;
  await renderer.compileAsync(scene, camera);
  water.visible = false;
  puddle.visible = false;

  // Un solo reloj: GSAP mueve Lenis, la pose y el dibujo en el mismo cuadro
  gsap.ticker.add((time, deltaMs) => {
    const delta = Math.min(deltaMs / 1000, 0.1);
    onFrame(delta);
    const { mix, y, scale, opacity, spin, speed, floor, water: shine } = sceneState;
    const sleeping = opacity < 0.01;
    if (sleeping !== asleep) {
      asleep = sleeping;
      canvas.style.visibility = sleeping ? "hidden" : "visible";
    }
    stage.style.setProperty("--scene-opacity", opacity.toFixed(3));
    if (sleeping || document.hidden) return;

    govern(delta);
    if (mix > 0) buildChip();
    if (mix < 0.01) {
      turn += speed * delta;
      if (turn > Math.PI) turn -= Math.PI * 2;
    }
    points.rotation.y = lerp(
      LIMA_ROTATION.y + spin + turn,
      -0.42 + Math.sin(time * 0.5) * 0.14,
      mix,
    );
    points.rotation.x = lerp(LIMA_ROTATION.x, -0.62 + Math.cos(time * 0.4) * 0.08, mix);
    points.rotation.z = lerp(0, 0.12, mix);
    points.position.y = y;
    points.scale.setScalar(scale);
    glow.visible = mix < 0.5;
    glow.rotation.copy(points.rotation);
    glow.position.copy(points.position);
    glow.scale.copy(points.scale);
    const puddleLight = MathUtils.smoothstep(shine, 0.6, 1.3);
    puddle.visible = puddleLight > 0.01;
    if (puddle.visible) {
      puddleOpacity.value = puddleLight * 1.2;
      puddle.rotation.copy(points.rotation);
      puddle.position.y = floor * 2 - y;
      puddle.scale.set(scale * 1.15, -scale * 0.62, scale * 1.15);
    }
    // El agua vuelve a dibujar toda la escena: solo existe mientras se ve
    water.visible = shine > 0.01;
    water.position.y = floor;
    waterMaterial.uniforms.uTime.value = time;
    waterMaterial.uniforms.uStrength.value = shine * opacity;
    uniforms.uTime.value = time;
    uniforms.uMix.value = mix;
    uniforms.uFloor.value = floor;
    uniforms.uOpacity.value = opacity;
    renderer.render(scene, camera);
  });
}
