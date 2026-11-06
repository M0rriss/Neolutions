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
    gsap.to(mock, {
      y: 120,
      ease: "none",
      scrollTrigger: { trigger: first, start: "top top", end: "bottom top", scrub: 0.6 },
    });
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

/** Pasos: una banda de luz recorre el riel y solo el paso activo se enciende. */
function initProcess() {
  const section = document.querySelector<HTMLElement>("#g-process");
  const band = section?.querySelector<HTMLElement>("[data-rail-fill]");
  const steps = section ? gsap.utils.toArray<HTMLElement>("[data-step]") : [];
  if (!section || !band) return;

  gsap.matchMedia().add("(min-width: 1024px)", () => {
    // El número sigue encendido: solo se atenúa el texto de cada paso.
    const textOf = (step: HTMLElement) => step.querySelectorAll(":scope > :not(.number)");
    steps.slice(1).forEach((step) => gsap.set(textOf(step), { opacity: 0.35 }));
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "+=180%", pin: true, scrub: 0.6 },
    });
    timeline.fromTo(
      band,
      { yPercent: -100 },
      { yPercent: 300, ease: "none", duration: steps.length },
      0,
    );
    steps.forEach((step, index) => {
      if (index > 0) {
        timeline.to(textOf(step), { opacity: 1, duration: 0.3, ease: "none" }, index - 0.15);
      }
      if (index < steps.length - 1) {
        timeline.to(textOf(step), { opacity: 0.45, duration: 0.3, ease: "none" }, index + 0.7);
      }
    });
  });
}

/** Destellos de puntos en las tarjetas; solo se anima opacity. */
function initSparkles() {
  const hosts = document.querySelectorAll<HTMLElement>(
    ".panel-beam, .card, .channel, .guided, a.tile, article.tile, li.tile, .frame, .final .panel, .plan",
  );
  hosts.forEach((host) => {
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    const layer = document.createElement("span");
    layer.className = "sparkles";
    layer.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 18; i += 1) {
      const dot = document.createElement("span");
      dot.className = "sparkle";
      dot.style.left = `${4 + Math.floor(Math.random() * 12) * 3.2}%`;
      dot.style.top = `${4 + Math.floor(Math.random() * 7) * 7}%`;
      dot.style.animationDelay = `${(-Math.random() * 2.4).toFixed(2)}s`;
      layer.append(dot);
    }
    host.prepend(layer);
  });
}

/** Resplandor de tarjetas y luz del botón: siguen al cursor con una sola escucha. */
function initPointerEffects() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const selector = ".card, .channel, a.tile, article.tile, .action, .row, .item, .plan";
  document.querySelectorAll<HTMLElement>(selector).forEach((item) => {
    item.dataset.spot = "";
    if (getComputedStyle(item).position === "static") item.style.position = "relative";
  });
  document.addEventListener(
    "pointermove",
    (event) => {
      const element = event.target instanceof Element ? event.target : null;
      const target = element?.closest<HTMLElement>("[data-spot]");
      if (target) {
        const box = target.getBoundingClientRect();
        target.style.setProperty("--x", `${event.clientX - box.left}px`);
        target.style.setProperty("--y", `${event.clientY - box.top}px`);
      }
      // Los formularios React aparecen después: se buscan en cada movimiento cercano.
      document.querySelectorAll<HTMLElement>(".btn--primary").forEach((button) => {
        const box = button.getBoundingClientRect();
        if (Math.abs(event.clientY - (box.top + box.height / 2)) > 120) return;
        const position = gsap.utils.clamp(0, 100, ((event.clientX - box.left) / box.width) * 100);
        button.style.setProperty("--lx", `${position}%`);
      });
    },
    { passive: true },
  );
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
  const isHome = Boolean(document.querySelector("#g-hold"));
  // Fuera de la portada la escena aparece solo al llegar a los pasos.
  if (!isHome) Object.assign(sceneState, { opacity: 0, mix: 0, y: 0, scale: 0.95, spin: 0 });
  await startScene(canvas);
  document.documentElement.classList.add("has-scene");
  gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.2 });

  // Cada tramo declara su inicio: si no, GSAP tomaría el valor inicial de la página
  // y la escena saltaría al entrar en un tramo nuevo.
  const segment = (
    trigger: string,
    start: string,
    end: string,
    from: gsap.TweenVars,
    to: gsap.TweenVars,
  ) => {
    if (!document.querySelector(trigger)) return;
    gsap.fromTo(sceneState, from, {
      ...to,
      ease: "none",
      immediateRender: false,
      scrollTrigger: { trigger, start, end, scrub: 1 },
    });
  };

  segment(
    "#g-hold",
    "top 75%",
    "top top",
    { y: -2.15, scale: 1.6, spin: -0.75 },
    { y: 0.02, scale: 1.42, spin: 0 },
  );
  segment(
    "#g-services",
    "top 80%",
    "top 5%",
    { mix: 0, y: 0.02, scale: 1.42 },
    { mix: 1, y: -0.12, scale: 1.08 },
  );
  segment("#g-table", "top 90%", "top 30%", { opacity: 1 }, { opacity: 0.12 });
  segment(
    "#g-process",
    "top 90%",
    "top top",
    isHome ? { mix: 1, opacity: 0.12, y: -0.12, scale: 1.08 } : { opacity: 0 },
    isHome ? { mix: 0, opacity: 1, y: 0, scale: 0.95 } : { opacity: 1 },
  );
  segment(isHome ? "#g-why" : ".final", "top 90%", "top 40%", { opacity: 1 }, { opacity: 0 });
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
  initSparkles();
  initPointerEffects();
  document.fonts.ready.then(() => {
    initPageEntrance();
    initHeadings();
    initReveals();
    initCounters();
    initProcess();
    initCarousels();
    initOrbs();
    ScrollTrigger.refresh();
    void initCandles();
    void initScene();
  });
}
