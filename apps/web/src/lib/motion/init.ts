import { gsap, ScrollTrigger, SplitText } from "./gsap";
import { initLenis } from "./lenis";
import { prefersReducedMotion } from "./reducedMotion";

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
          yPercent: 110,
          stagger: 0.1,
          duration: 0.9,
          scrollTrigger: isHero ? undefined : { trigger: element, start: "top 85%", once: true },
        }),
    });
  });
}

function initCounters() {
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((element) => {
    const end = Number(element.dataset.count);
    const value = { current: 0 };
    gsap.to(value, {
      current: end,
      duration: 1,
      snap: { current: 1 },
      scrollTrigger: { trigger: element, start: "top 85%", once: true },
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

/** Barras de partículas que crecen: el cierre de cada página. */
function drawBars() {
  document.querySelectorAll<HTMLCanvasElement>("[data-bars]").forEach((canvas) => {
    const context = canvas.getContext("2d");
    if (!context) return;
    const ratio = Math.min(window.devicePixelRatio, 2);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
      "--color-accent-400",
    );
    context.shadowColor = context.fillStyle;
    context.shadowBlur = 8;
    const BARS = 6;
    const slot = width / BARS;
    for (let bar = 0; bar < BARS; bar += 1) {
      const top = height * (0.72 - (bar / (BARS - 1)) * 0.68) + (bar % 2 ? height * 0.07 : 0);
      const body = height * 0.34;
      const center = slot * (bar + 0.5);
      const half = Math.min(slot * 0.2, 14);
      for (let i = 0; i < 1500; i += 1) {
        const wick = Math.random() < 0.16;
        const y = top + Math.random() * (body + (wick ? 50 : 0)) - (wick ? 26 : 0);
        const x = center + (Math.random() * 2 - 1) * (wick ? 2 : half);
        context.globalAlpha = 0.25 + Math.random() * 0.75;
        context.fillRect(x, y, 1.8, 1.8);
      }
    }
    gsap.from(canvas, {
      opacity: 0,
      y: 24,
      scrollTrigger: { trigger: canvas, start: "top 90%", once: true },
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

if (!prefersReducedMotion()) {
  initLenis();
  document.fonts.ready.then(() => {
    initSplits();
    initCounters();
    initProcess();
    drawBars();
    ScrollTrigger.refresh();
    void initScene();
  });
}
