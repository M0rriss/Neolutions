import { gsap, ScrollTrigger, SplitText } from "./gsap";
import { initLenis } from "./lenis";
import { prefersReducedMotion } from "./reducedMotion";

const EASE = "expo.out";

function initSplits() {
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((element) => {
    const isHero = element.tagName === "H1";
    SplitText.create(element, {
      type: "lines",
      mask: "lines",
      linesClass: "metal",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 115,
          stagger: 0.12,
          duration: 1.2,
          ease: EASE,
          scrollTrigger: isHero ? undefined : { trigger: element, start: "top 88%", once: true },
        }),
    });
  });
}

/** Entrada de la primera pantalla: cada pieza llega escalonada al cargar. */
function initPageEntrance() {
  const first = document.querySelector("main section");
  if (!first) return;
  const items = first.querySelectorAll(
    ".copy > :not(h1), .info > :not(h1), .intro > :not(h1), .panel, .search, .side, .item",
  );
  gsap.fromTo(
    items,
    { opacity: 0, y: 34 },
    { opacity: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.07, delay: 0.15 },
  );

  const mock = first.querySelector(".console, .mock");
  if (mock) {
    // Sale del sistema .reveal: dos animaciones sobre su opacidad la dejarían oculta.
    mock.classList.remove("reveal");
    gsap.fromTo(
      mock,
      { y: 170, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.3, ease: EASE, delay: 0.3 },
    );
    // Se queda atrás mientras la página sube, como un panel flotando.
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

/** Todo lo marcado .reveal entra por grupos, un elemento tras otro. */
function initReveals() {
  // Un bloque con título se anima por dentro: si no, entraría de una sola pieza.
  document.querySelectorAll(".reveal:has(> .heading)").forEach((wrapper) => {
    wrapper.classList.remove("reveal");
    wrapper.querySelectorAll(".heading > :not(h2)").forEach((item) => item.classList.add("reveal"));
  });
  document.querySelectorAll(".heading > :not(h2)").forEach((item) => item.classList.add("reveal"));

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
    start: "top 90%",
    once: true,
    interval: 0.08,
    batchMax: 6,
    onEnter: (batch) => {
      batch.forEach((item, index) => {
        const side = (item as HTMLElement).dataset.slide;
        const from = side ? { x: side === "left" ? -100 : 100, y: 0 } : { x: 0, y: 72 };
        gsap.fromTo(
          item,
          { ...from, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 1.25,
            ease: EASE,
            delay: index * 0.1,
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

function initProcess() {
  const section = document.querySelector<HTMLElement>("#g-process");
  const fill = section?.querySelector<HTMLElement>("[data-rail-fill]");
  const steps = section ? gsap.utils.toArray<HTMLElement>("[data-step]") : [];
  if (!section || !fill) return;

  gsap.matchMedia().add("(min-width: 1024px)", () => {
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "+=160%", pin: true, scrub: 0.6 },
    });
    timeline.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", duration: steps.length }, 0);
    steps.forEach((step, index) => {
      timeline.fromTo(step, { opacity: 0.35 }, { opacity: 1, duration: 0.4, ease: "none" }, index);
    });
  });
}

/** Destellos de puntos en las tarjetas; solo se anima opacity, sin coste de layout. */
function initSparkles() {
  const hosts = document.querySelectorAll<HTMLElement>(
    ".panel-beam, .card, .channel, .guided, a.tile, article.tile, li.tile, .frame, .final .panel",
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

/** Resplandor que sigue al cursor. Una sola escucha para todas las tarjetas. */
function initSpotlight() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const selector = ".card, .channel, a.tile, article.tile, .action, .row, .item";
  document.querySelectorAll<HTMLElement>(selector).forEach((item) => {
    item.dataset.spot = "";
    if (getComputedStyle(item).position === "static") item.style.position = "relative";
  });
  document.addEventListener(
    "pointermove",
    (event) => {
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>("[data-spot]") : null;
      if (!target) return;
      const box = target.getBoundingClientRect();
      target.style.setProperty("--x", `${event.clientX - box.left}px`);
      target.style.setProperty("--y", `${event.clientY - box.top}px`);
    },
    { passive: true },
  );
}

/** El botón principal se acerca al cursor hasta 6 px. */
function initMagnetic() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll<HTMLElement>(".btn--primary.btn--lg").forEach((button) => {
    const x = gsap.quickTo(button, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(button, "y", { duration: 0.5, ease: "power3" });
    button.addEventListener("pointermove", (event) => {
      const box = button.getBoundingClientRect();
      x(((event.clientX - box.left) / box.width - 0.5) * 12);
      y(((event.clientY - box.top) / box.height - 0.5) * 12);
    });
    button.addEventListener("pointerleave", () => {
      x(0);
      y(0);
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
        ease: EASE,
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

/** Barras de partículas que crecen; viven solo mientras están en pantalla. */
function initBars() {
  document.querySelectorAll<HTMLCanvasElement>("[data-bars]").forEach((canvas) => {
    const context = canvas.getContext("2d");
    if (!context) return;
    const ratio = Math.min(window.devicePixelRatio, 1.5);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
      "--color-accent-400",
    );

    const BARS = 6;
    const slot = width / BARS;
    const points = Array.from({ length: BARS * 800 }, (_, i) => {
      const bar = i % BARS;
      const top = height * (0.72 - (bar / (BARS - 1)) * 0.68) + (bar % 2 ? height * 0.07 : 0);
      const body = height * 0.34;
      const half = Math.min(slot * 0.2, 14);
      const wick = Math.random() < 0.16;
      return {
        x: slot * (bar + 0.5) + (Math.random() * 2 - 1) * (wick ? 2 : half),
        y: top + Math.random() * (body + (wick ? 50 : 0)) - (wick ? 26 : 0),
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.4,
      };
    });

    let visible = false;
    const draw = (time: number) => {
      if (!visible) return;
      const t = time / 1000;
      context.clearRect(0, 0, width, height);
      for (const point of points) {
        const wave = Math.sin(t * point.speed + point.phase);
        context.globalAlpha = 0.3 + 0.7 * Math.abs(wave);
        context.fillRect(point.x, point.y + wave * 3, 1.8, 1.8);
      }
      requestAnimationFrame(draw);
    };
    new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible) requestAnimationFrame(draw);
    }).observe(canvas);
  });
}

function hasWebGL() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

async function initScene() {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-scene]");
  if (!canvas || window.innerWidth < 1024 || !hasWebGL()) return;

  // Three.js llega aparte: en celular nunca se descarga.
  const { sceneState, startScene } = await import("./scene");
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
    { mix: 1, opacity: 0.12, y: -0.12, scale: 1.08 },
    { mix: 0, opacity: 1, y: 0, scale: 0.95 },
  );
  segment("#g-why", "top 90%", "top 40%", { opacity: 1 }, { opacity: 0 });
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
  initSpotlight();
  initMagnetic();
  document.fonts.ready.then(() => {
    initSplits();
    initPageEntrance();
    initReveals();
    initCounters();
    initProcess();
    initCarousels();
    initBars();
    ScrollTrigger.refresh();
    void initScene();
  });
}
