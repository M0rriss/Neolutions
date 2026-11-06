import { gsap, ScrollTrigger } from "./gsap";
import { initLenis } from "./lenis";
import { prefersReducedMotion } from "./reducedMotion";

const RISE = "power3.out";
// La opacidad llega tarde respecto al movimiento: el texto sube casi invisible.
const lateFade = (t: number) => t ** 2.4;

function riseIn(target: gsap.TweenTarget, delay: number, trigger: Element) {
  const scrollTrigger = { trigger, start: "top 96%", once: true };
  gsap.fromTo(
    target,
    { y: 200 },
    { y: 0, duration: 1.4, ease: RISE, delay, scrollTrigger, clearProps: "transform" },
  );
  gsap.fromTo(
    target,
    { opacity: 0 },
    { opacity: 1, duration: 1.4, ease: lateFade, delay, scrollTrigger },
  );
}

/** Títulos y su texto: entran enteros, desde lejos, uno tras otro. */
function initHeadings() {
  const first = document.querySelector("main section");
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((heading) => {
    if (heading.closest("main section") === first) return;
    const group = heading.closest(".heading");
    const parts = group ? [...group.children] : [heading];
    parts.forEach((part, index) => riseIn(part, index * 0.09, heading));
  });
}

/** Entrada de la primera pantalla: cada pieza llega escalonada al cargar. */
function initPageEntrance() {
  const first = document.querySelector("main section");
  if (!first) return;
  const items = first.querySelectorAll(
    "h1, .copy > :not(h1), .info > :not(h1), .intro > :not(h1), .panel, .search, .side, .item",
  );
  gsap.fromTo(
    items,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 1, ease: RISE, stagger: 0.06, delay: 0.1 },
  );

  const mock = first.querySelector(".console, .mock");
  if (mock) {
    // Sale del sistema .reveal: dos animaciones sobre su opacidad la dejarían oculta.
    mock.classList.remove("reveal");
    gsap.fromTo(
      mock,
      { y: 240, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: RISE, delay: 0.25 },
    );
    // Inicio explícito: con gsap.to tomaría los 240 px de la entrada y saltaría al primer scroll.
    gsap.fromTo(
      mock,
      { y: 0 },
      {
        y: 120,
        ease: "none",
        immediateRender: false,
        scrollTrigger: { trigger: first, start: "top top", end: "bottom top", scrub: 0.6 },
      },
    );
    gsap.to(first.querySelector(".copy"), {
      y: -70,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: first, start: "top top", end: "45% top", scrub: 0.6 },
    });
  }
}

/** Tarjetas y filas: 40 px de subida, o 60 px desde el lado en data-slide. */
function initReveals() {
  document.querySelectorAll(".reveal:has(> .heading)").forEach((wrapper) => {
    wrapper.classList.remove("reveal");
    (wrapper as HTMLElement).style.opacity = "1";
  });

  // Con un filtro en la URL las filas ya cambiaron de sitio: entran sin animación.
  if (location.hash) {
    document.querySelectorAll<HTMLElement>("tr.reveal").forEach((row) => {
      row.classList.remove("reveal");
      row.style.opacity = "1";
    });
  }

  const items = gsap.utils.toArray<HTMLElement>(".reveal");
  gsap.set(items, { opacity: 0 });
  ScrollTrigger.batch(items, {
    start: "top 94%",
    once: true,
    interval: 0.06,
    batchMax: 6,
    onEnter: (batch) => {
      batch.forEach((item, index) => {
        const side = (item as HTMLElement).dataset.slide;
        const from = side ? { x: side === "left" ? -60 : 60, y: 0 } : { x: 0, y: 40 };
        gsap.fromTo(
          item,
          { ...from, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: RISE,
            delay: index * 0.09,
            clearProps: "transform",
          },
        );
      });
    },
  });
}

function initCounters() {
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((element) => {
    const end = Number(element.dataset.count);
    const value = { current: 0 };
    gsap.to(value, {
      current: end,
      duration: 1.2,
      snap: { current: 1 },
      scrollTrigger: { trigger: element, start: "top 88%", once: true },
      onUpdate: () => {
        element.textContent = String(value.current);
      },
    });
  });
}

/** Estadísticas: la sección queda fija y cada fila se enciende con el scroll. */
function initStats() {
  const section = document.querySelector<HTMLElement>("#g-stats");
  const rows = section ? gsap.utils.toArray<HTMLElement>("[data-stat]") : [];
  if (!section || !rows.length) return;

  gsap.matchMedia().add("(min-width: 1024px)", () => {
    gsap.set(rows.slice(1), { opacity: 0.25 });
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "+=150%", pin: true, scrub: 0.6 },
    });
    rows.slice(1).forEach((row, index) => {
      timeline.to(row, { opacity: 1, duration: 0.3, ease: "none" }, index * 0.6);
    });
    // Tramo final con todas encendidas, antes de soltar la sección.
    timeline.to({}, { duration: 0.5 });
  });
}

/** Soluciones: la sección queda fija y cada panel se funde en el siguiente al hacer scroll. */
function initShowcase() {
  const section = document.querySelector<HTMLElement>("#g-showcase");
  if (!section) return;
  const shots = gsap.utils.toArray<HTMLElement>("[data-shot]");
  const features = gsap.utils.toArray<HTMLElement>("[data-feature]");

  gsap.matchMedia().add("(min-width: 1024px)", () => {
    gsap.set(features.slice(1), { opacity: 0.2 });
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "+=200%", pin: true, scrub: 0.6 },
    });
    shots.slice(1).forEach((shot, index) => {
      timeline.to(shot, { opacity: 1, duration: 0.5, ease: "none" }, index + 0.5);
      timeline.to(features[index + 1], { opacity: 1, duration: 0.5, ease: "none" }, index + 0.5);
    });
    timeline.to({}, { duration: 0.5 });
  });
}

/** Pasos: una banda de luz recorre el riel y solo el paso activo se enciende. */
function initProcess() {
  const section = document.querySelector<HTMLElement>("#g-process");
  const band = section?.querySelector<HTMLElement>("[data-rail]");
  const steps = section ? gsap.utils.toArray<HTMLElement>("[data-step]") : [];
  if (!section || !band) return;

  gsap.matchMedia().add("(min-width: 1024px)", () => {
    // Número y etiqueta siguen encendidos: solo se atenúan título y descripción.
    const textOf = (step: HTMLElement) => step.querySelectorAll("h3, .text");
    steps.slice(1).forEach((step) => gsap.set(textOf(step), { opacity: 0.4 }));
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "+=180%", pin: true, scrub: 0.6 },
    });
    timeline.fromTo(
      band,
      { "--band": "-16%" },
      { "--band": "116%", ease: "none", duration: steps.length },
      0,
    );
    steps.forEach((step, index) => {
      if (index > 0) {
        timeline.to(textOf(step), { opacity: 1, duration: 0.3, ease: "none" }, index - 0.15);
      }
      if (index < steps.length - 1) {
        timeline.to(textOf(step), { opacity: 0.4, duration: 0.3, ease: "none" }, index + 0.7);
      }
    });
  });
}

function initCarousels() {
  document.querySelectorAll<HTMLElement>("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector<HTMLElement>("[data-carousel-track]");
    const progress = carousel.querySelector<HTMLElement>("[data-carousel-progress]");
    const slides = track ? [...track.children] : [];
    if (!track || !progress || slides.length < 2) return;

    const HOLD = 3.5;
    let index = 0;
    const go = (next: number) => {
      index = (next + slides.length) % slides.length;
      const slide = slides[index] as HTMLElement;
      const max = track.scrollWidth - (track.parentElement?.clientWidth ?? 0);
      gsap.to(track, {
        x: -Math.min(slide.offsetLeft, Math.max(max, 0)),
        duration: 0.9,
        ease: RISE,
      });
      timer.restart();
    };
    const timer = gsap.fromTo(
      progress,
      { scaleX: 0 },
      { scaleX: 1, duration: HOLD, ease: "none", onComplete: () => go(index + 1) },
    );
    carousel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => go(index - 1));
    carousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => go(index + 1));
    carousel.addEventListener("pointerenter", () => timer.pause());
    carousel.addEventListener("pointerleave", () => timer.play());
    carousel.addEventListener("focusin", () => timer.pause());
    carousel.addEventListener("focusout", () => timer.play());
  });
}

/** Ejecuta `draw` solo mientras el canvas se ve en pantalla. */
function whileVisible(canvas: HTMLCanvasElement, draw: (seconds: number) => void) {
  let visible = false;
  const loop = (time: number) => {
    if (!visible) return;
    draw(time / 1000);
    requestAnimationFrame(loop);
  };
  new IntersectionObserver(([entry]) => {
    const wasVisible = visible;
    visible = entry.isIntersecting;
    if (visible && !wasVisible) requestAnimationFrame(loop);
  }).observe(canvas);
}

function prepare2d(canvas: HTMLCanvasElement, color: string) {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const ratio = Math.min(window.devicePixelRatio, 1.5);
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.scale(ratio, ratio);
  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(color);
  return { context, width, height };
}

/** Versión 2D de las velas, para celular y equipos sin WebGL. */
function drawBars2d(canvas: HTMLCanvasElement) {
  const ready = prepare2d(canvas, "--color-accent-400");
  if (!ready) return;
  const { context, width, height } = ready;
  const BARS = 6;
  const slot = width / BARS;
  const points = Array.from({ length: BARS * 800 }, (_, i) => {
    const bar = i % BARS;
    const top = height * (0.72 - (bar / (BARS - 1)) * 0.68) + (bar % 2 ? height * 0.07 : 0);
    const half = Math.min(slot * 0.2, 14);
    const wick = Math.random() < 0.16;
    return {
      x: slot * (bar + 0.5) + (Math.random() * 2 - 1) * (wick ? 2 : half),
      y: top + Math.random() * (height * 0.34 + (wick ? 50 : 0)) - (wick ? 26 : 0),
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
    };
  });
  whileVisible(canvas, (t) => {
    context.clearRect(0, 0, width, height);
    for (const point of points) {
      const wave = Math.sin(t * point.speed + point.phase);
      context.globalAlpha = 0.3 + 0.7 * Math.abs(wave);
      context.fillRect(point.x, point.y + wave * 3, 1.8, 1.8);
    }
  });
}

/** Orbe de partículas que gira. */
function initOrbs() {
  document.querySelectorAll<HTMLCanvasElement>("[data-orb]").forEach((canvas) => {
    const ready = prepare2d(canvas, "--color-violet-400");
    if (!ready) return;
    const { context, width, height } = ready;
    const COUNT = 900;
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const radius = Math.min(width, height) * 0.46;
    whileVisible(canvas, (t) => {
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < COUNT; i += 1) {
        const y = 1 - (i / (COUNT - 1)) * 2;
        const ring = Math.sqrt(1 - y * y);
        const angle = GOLDEN * i + t * 0.35;
        const z = Math.sin(angle) * ring;
        const wobble = 1 + Math.sin(t * 1.1 + i * 0.04) * 0.04;
        context.globalAlpha = 0.12 + 0.88 * ((z + 1) / 2) ** 2;
        context.fillRect(
          width / 2 + Math.cos(angle) * ring * radius * wobble,
          height / 2 + y * radius * wobble,
          1.8,
          1.8,
        );
      }
    });
  });
}

function hasWebGL() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

const canUse3d = () => window.innerWidth >= 1024 && hasWebGL();

async function initCandles() {
  const canvases = [...document.querySelectorAll<HTMLCanvasElement>("[data-bars]")];
  if (!canvases.length) return;
  if (!canUse3d()) {
    canvases.forEach(drawBars2d);
    return;
  }
  const { startCandles } = await import("./scene");
  canvases.forEach(startCandles);
}

async function initScene() {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-scene]");
  if (!canvas || !canUse3d()) return;

  // Three.js llega aparte: en celular nunca se descarga.
  const { sceneState, startScene } = await import("./scene");
  const isHome = Boolean(document.querySelector("#g-stats"));
  // Fuera de la portada la escena aparece solo al llegar a los pasos.
  if (!isHome) Object.assign(sceneState, { opacity: 0, mix: 0, y: 0, scale: 0.95, spin: 0 });
  await startScene(canvas);
  document.documentElement.classList.add("has-scene");
  gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.2 });

  // Una sola función del scroll: cada posición da siempre el mismo estado del globo.
  // Evita que varias animaciones escriban la misma propiedad y dejen un resultado distinto
  // según la velocidad del scroll.
  type Pose = Pick<typeof sceneState, "y" | "scale" | "spin" | "mix" | "opacity">;
  type Stop = { at: number; pose: Pose };

  const topOf = (selector: string) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) return null;
    const box = (element.closest(".pin-spacer") ?? element).getBoundingClientRect();
    return box.top + window.scrollY;
  };
  const endOf = (selector: string) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) return null;
    const spacer = element.closest<HTMLElement>(".pin-spacer");
    const top = topOf(selector) ?? 0;
    return spacer ? top + spacer.offsetHeight - element.offsetHeight : top;
  };

  const buildStops = (): Stop[] => {
    const vh = window.innerHeight;
    const stops: Stop[] = [];
    const add = (at: number | null, offset: number, pose: Pose) => {
      if (at !== null) stops.push({ at: at + offset * vh, pose });
    };
    if (isHome) {
      const hero = { y: -1.66, scale: 1.55, spin: -0.75, mix: 0, opacity: 1 };
      const center = { y: 0.02, scale: 1.3, spin: -0.55, mix: 0, opacity: 1 };
      const turned = { ...center, spin: -0.35 };
      const chip = { y: -0.12, scale: 1.08, spin: -0.35, mix: 1, opacity: 1 };
      const steps = { y: 0, scale: 0.95, spin: 2.2, mix: 0, opacity: 1 };
      add(topOf("#g-stats"), -0.85, hero);
      add(topOf("#g-stats"), 0, center);
      add(endOf("#g-stats"), 0, turned);
      add(topOf("#g-services"), -0.8, turned);
      add(topOf("#g-services"), -0.05, chip);
      add(topOf("#g-table"), -1, chip);
      add(topOf("#g-table"), -0.6, { ...chip, opacity: 0.04 });
      add(topOf("#g-process"), -0.5, { ...chip, opacity: 0.04 });
      add(topOf("#g-process"), 0, steps);
      add(topOf("#g-showcase"), -0.9, steps);
      add(topOf("#g-showcase"), -0.4, { ...steps, opacity: 0 });
    } else {
      const on = { y: 0, scale: 0.95, spin: 0, mix: 0, opacity: 1 };
      add(topOf("#g-process"), -0.9, { ...on, opacity: 0 });
      add(topOf("#g-process"), 0, on);
      add(topOf(".final"), -0.9, on);
      add(topOf(".final"), -0.4, { ...on, opacity: 0 });
    }
    return stops.sort((a, b) => a.at - b.at);
  };

  const sample = (stops: Stop[], position: number): Pose | null => {
    if (!stops.length) return null;
    if (position <= stops[0].at) return stops[0].pose;
    for (let i = 1; i < stops.length; i += 1) {
      const next = stops[i];
      if (position > next.at) continue;
      const previous = stops[i - 1];
      const span = next.at - previous.at || 1;
      const t = (position - previous.at) / span;
      const mixed = {} as Pose;
      for (const key of Object.keys(next.pose) as (keyof Pose)[]) {
        mixed[key] = previous.pose[key] + (next.pose[key] - previous.pose[key]) * t;
      }
      return mixed;
    }
    return stops[stops.length - 1].pose;
  };

  let stops = buildStops();
  ScrollTrigger.addEventListener("refresh", () => {
    stops = buildStops();
  });
  gsap.ticker.add(() => {
    const target = sample(stops, window.scrollY);
    if (!target) return;
    for (const key of Object.keys(target) as (keyof Pose)[]) {
      sceneState[key] += (target[key] - sceneState[key]) * 0.09;
    }
  });
  ScrollTrigger.refresh();
}

declare global {
  interface Window {
    __motion?: boolean;
  }
}

if (prefersReducedMotion()) {
  document.documentElement.classList.add("no-motion");
} else {
  window.__motion = true;
  initLenis();
  document.fonts.ready.then(() => {
    initPageEntrance();
    initHeadings();
    initReveals();
    initCounters();
    initStats();
    initProcess();
    initShowcase();
    initCarousels();
    initOrbs();
    ScrollTrigger.refresh();
    void initCandles();
    void initScene();
  });
}
