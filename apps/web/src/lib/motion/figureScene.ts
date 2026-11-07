import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { figurePoints, type FigureName } from "./particleFigures";

const vertex = /* glsl */ `
  attribute vec3 aStart;
  attribute float aSeed;
  attribute float aKind;
  attribute float aPhase;
  uniform float uTime;
  uniform float uReveal;
  uniform float uSize;
  uniform float uGlow;
  varying float vAlpha;
  varying float vHeat;

  void main() {
    float t = uTime;
    // Entrada: los puntos llegan desde una nube, unos antes que otros
    float arrive = clamp(uReveal * 1.6 - aSeed * 0.6, 0.0, 1.0);
    arrive = arrive * arrive * (3.0 - 2.0 * arrive);
    vec3 point = mix(aStart, position, arrive);

    float alpha = 0.6 + 0.3 * aSeed;
    float heat = 0.0;
    float size = 0.85 + aSeed * 0.3;

    if (aKind > 3.5) {
      // Contornos encendidos
      alpha = 1.0;
      heat = 0.18 + 0.14 * sin(t * 1.4 + aPhase * 4.0);
    } else if (aKind > 2.5) {
      // Núcleo: un pulso de energía sale del centro
      float wave = sin(length(position.xy) * 11.0 - t * 2.6);
      float pulse = pow(0.5 + 0.5 * wave, 3.0);
      alpha = 0.6 + 0.6 * pulse;
      heat = pulse * 0.55;
    } else if (aKind > 1.5) {
      // Chispas que suben y se apagan
      float life = fract(t * (0.1 + aSeed * 0.14) + aPhase);
      point.z += life * 0.9;
      point.xy += 0.05 * vec2(sin(t * 0.7 + aSeed * 30.0), cos(t * 0.6 + aSeed * 40.0));
      alpha = sin(life * 3.14159) * (0.25 + 0.75 * aSeed);
      heat = 0.5;
      size = 0.7 + aSeed * 0.5;
    } else if (aKind > 0.5) {
      // Pistas: pulsos de luz viajan hacia afuera
      float pulse = pow(fract(aPhase * 1.4 - t * 0.42), 9.0);
      alpha = 0.55 + 1.2 * pulse;
      heat = pulse;
      size += pulse * 1.3;
    }
    point += 0.006 * vec3(sin(t * 0.9 + aSeed * 40.0), cos(t * 0.8 + aSeed * 55.0), 0.0);

    vec4 view = modelViewMatrix * vec4(point, 1.0);
    vAlpha = alpha * (0.35 + 0.65 * arrive);
    vHeat = heat;
    gl_PointSize = uSize * size / -view.z;
    gl_Position = projectionMatrix * view;
    // Brillo: los mismos puntos, grandes y muy tenues; más barato que un filtro CSS
    if (uGlow > 0.5) {
      gl_PointSize *= 6.0;
      vAlpha *= 0.1;
    }
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uGlow;
  varying float vAlpha;
  varying float vHeat;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float dot = uGlow > 0.5 ? pow(max(0.0, 1.0 - d * 2.0), 2.0) : smoothstep(0.5, 0.3, d);
    gl_FragColor = vec4(mix(uColor, uHot, clamp(vHeat, 0.0, 1.0)), dot * vAlpha);
  }
`;

const REVEAL_SECONDS = 2;

/** Dibuja una figura en su lienzo; solo gasta mientras se ve. */
export function startFigure(canvas: HTMLCanvasElement) {
  const name = canvas.dataset.figure as FigureName;
  const { deviceMemory = 8 } = navigator as Navigator & { deviceMemory?: number };
  const low = navigator.hardwareConcurrency <= 4 || deviceMemory <= 4 || window.innerWidth < 768;
  const figure = figurePoints(name, low ? 0.6 : 1);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(figure.position, 3));
  geometry.setAttribute("aStart", new BufferAttribute(figure.start, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(figure.seed, 1));
  geometry.setAttribute("aKind", new BufferAttribute(figure.kind, 1));
  geometry.setAttribute("aPhase", new BufferAttribute(figure.phase, 1));

  const shared = {
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uSize: { value: 8 },
    uColor: { value: new Color("#1fdcc6") },
    uHot: { value: new Color("#f2fffb") },
  };
  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: { ...shared, uGlow: { value: 0 } },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: AdditiveBlending,
  });
  const glowMaterial = material.clone();
  glowMaterial.uniforms = { ...shared, uGlow: { value: 1 } };

  const group = new Group();
  const glow = new Points(geometry, glowMaterial);
  const points = new Points(geometry, material);
  glow.frustumCulled = false;
  points.frustumCulled = false;
  group.add(glow, points);
  group.rotation.set(figure.tilt.x, 0, figure.tilt.z);
  const scene = new Scene();
  scene.add(group);

  const camera = new PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.z = 4.5;

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "default",
  });
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio, low ? 1.25 : 1.5);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Se ajusta al ancho en lienzos angostos
    group.scale.setScalar(Math.min(1, camera.aspect * 0.82) * (figure.tilt.fit ?? 1));
    shared.uSize.value = 7 * ratio * (height / 435) * (height < 300 ? 1.3 : 1);
  };
  resize();
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  });

  let appeared = 0;
  const draw = (time: number) => {
    const seconds = time / 1000;
    if (!appeared) appeared = seconds;
    shared.uReveal.value = Math.min(1, (seconds - appeared) / REVEAL_SECONDS);
    shared.uTime.value = seconds;
    // Balanceo lento: deja ver el volumen sin marear
    group.rotation.y = Math.sin(seconds * 0.33) * 0.18;
    group.rotation.x = figure.tilt.x + Math.cos(seconds * 0.27) * 0.04;
    renderer.render(scene, camera);
  };
  new IntersectionObserver(
    ([entry]) => {
      renderer.setAnimationLoop(entry.isIntersecting ? draw : null);
    },
    { threshold: 0.2 },
  ).observe(canvas);
}
