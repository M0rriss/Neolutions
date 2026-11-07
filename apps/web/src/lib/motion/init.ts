import { gsap, ScrollTrigger } from "./gsap";
import { breathe, firstChance, nearScreen, showFallback } from "./idle";
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
  // Bloques cuyo texto entra en cascada mientras su fondo queda quieto
  document.querySelectorAll<HTMLElement>("[data-rise]").forEach((block) => {
    [...block.children].forEach((part, index) => riseIn(part, index * 0.09, block));
  });
}

/** Una sección se fija solo si cabe entera en la pantalla; si no, debe poder leerse completa. */
const fitsScreen = (section: HTMLElement) => section.offsetHeight <= window.innerHeight + 4;

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
    // El panel de la portada solo asoma: baja acelerando mientras el planeta sube
    const peek = mock.matches(".console");
    // Inicio explícito: con gsap.to tomaría los 240 px de la entrada y saltaría al primer scroll.
    gsap.fromTo(
      mock,
      { y: 0 },
      {
        y: () => (peek ? window.innerHeight * 0.75 : 120),
        ease: peek ? (t: number) => t ** 1.4 : "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: first,
          start: "top top",
          end: () => (peek ? `+=${window.innerHeight * 0.33}` : "bottom top"),
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      },
    );
    if (peek) {
      // Ya fuera de pantalla: se oculta para que no reaparezca al seguir bajando
      ScrollTrigger.create({
        trigger: first,
        start: () => `top+=${window.innerHeight * 0.45} top`,
        onEnter: () => gsap.set(mock, { visibility: "hidden" }),
        onLeaveBack: () => gsap.set(mock, { visibility: "visible" }),
      });
    } else {
      gsap.to(first.querySelector(".copy"), {
        y: -70,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: first, start: "top top", end: "45% top", scrub: 0.6 },
      });
    }
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
        const rise = item.matches("tr") ? 0 : 40;
        const from = side ? { x: side === "left" ? -60 : 60, y: 0 } : { x: 0, y: rise };
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
  if (!section || !rows.length || !fitsScreen(section)) return;

  // Se monta sobre el final del hero: aparece en su sitio, no sube desde abajo de la pantalla
  gsap.set(section, { marginTop: "-35svh" });
  gsap.set(rows, { opacity: 0 });
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=91%", pin: true, scrub: 0.6 },
  });
  const content = Array.from(section.children);
  timeline.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: "none" }, 0);
  // Las filas se encienden una tras otra
  rows.forEach((row, index) => {
    timeline.to(row, { opacity: 1, duration: 0.1, ease: "none" }, 0.13 + index * 0.072);
  });
  // Se apaga antes de soltarse: el planeta queda solo y luego se deshace
  timeline.to(content, { opacity: 0, duration: 0.2, ease: "none" }, 0.8);
}

/** Accesos: sus piezas las mueve el scroll, no las entradas por tiempo. */
function claimServices() {
  const section = document.querySelector<HTMLElement>("#g-services");
  if (!section) return;
  section.querySelector("h2")?.removeAttribute("data-split");
  section.querySelectorAll<HTMLElement>(".reveal").forEach((tile) => {
    tile.classList.remove("reveal");
    tile.dataset.tile = "";
  });
}

/**
 * Accesos: la sección espera fija sobre la pantalla vacía mientras el planeta se deshace;
 * el título aparece en su sitio y las tarjetas entran por filas con el scroll.
 */
function initServices() {
  const section = document.querySelector<HTMLElement>("#g-services");
  if (!section) return;

  const title = section.querySelector<HTMLElement>("h2");
  const tiles = gsap.utils.toArray<HTMLElement>(section.querySelectorAll("[data-tile]"));

  gsap.set(section, { marginTop: "-100svh" });
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=133%", pin: true, scrub: 0.6 },
  });
  if (title) {
    timeline.fromTo(title, { opacity: 0 }, { opacity: 1, duration: 0.09, ease: "none" }, 0.71);
  }
  tiles.forEach((tile) => {
    const row = tile.matches("li")
      ? Array.from(tile.parentElement?.children ?? []).indexOf(tile)
      : 3;
    const side = tile.dataset.slide;
    // En pantallas angostas solo sube: desplazar a los lados recortaría las tarjetas
    const wide = window.innerWidth >= 1024;
    const x = side && wide ? (side === "left" ? -60 : 60) : 0;
    timeline.fromTo(
      tile,
      { x, y: x ? 0 : 40, opacity: 0 },
      { x: 0, y: 0, opacity: 1, duration: 0.1, ease: "none" },
      0.76 + row * 0.06,
    );
  });
}

/** Soluciones: la sección queda fija y cada panel se funde en el siguiente al hacer scroll. */
function initShowcase() {
  const section = document.querySelector<HTMLElement>("#g-showcase");
  if (!section) return;
  const shots = gsap.utils.toArray<HTMLElement>("[data-shot]");
  const features = gsap.utils.toArray<HTMLElement>("[data-feature]");

  gsap.set(features.slice(1), { opacity: 0.2 });
  const pin = fitsScreen(section);
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: pin ? "top top" : "top 40%",
      end: pin ? "+=200%" : "bottom 80%",
      pin,
      scrub: 0.6,
    },
  });
  shots.slice(1).forEach((shot, index) => {
    timeline.to(shot, { opacity: 1, duration: 0.5, ease: "none" }, index + 0.5);
    timeline.to(features[index + 1], { opacity: 1, duration: 0.5, ease: "none" }, index + 0.5);
  });
  timeline.to({}, { duration: 0.5 });
}

/** Pasos: una banda de luz recorre el riel y solo el paso activo se enciende. */
function initProcess() {
  const section = document.querySelector<HTMLElement>("#g-process");
  const band = section?.querySelector<HTMLElement>("[data-rail]");
  const steps = section ? gsap.utils.toArray<HTMLElement>("[data-step]") : [];
  if (!section || !band) return;

  // Número y etiqueta siguen encendidos: solo se atenúan título y descripción.
  const textOf = (step: HTMLElement) => step.querySelectorAll("h3, .text");
  steps.forEach((step) => gsap.set(textOf(step), { opacity: 0.4 }));
  // En pantallas angostas la sección se desplaza junto con el planeta
  const pin = fitsScreen(section) && window.innerWidth >= 1024;
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: pin ? "top top" : "top 55%",
      end: pin ? "+=100%" : "bottom 70%",
      pin,
      scrub: 0.6,
    },
  });
  const BAND_START = -16;
  const BAND_END = 116;
  timeline.fromTo(
    band,
    { "--band": `${BAND_START}%` },
    { "--band": `${BAND_END}%`, ease: "none", duration: 1 },
    0,
  );

  // Momento del recorrido en que la banda llega a cada número
  const rail = band.getBoundingClientRect();
  const numbers = steps.map((step) => step.querySelector<HTMLElement>(".number"));
  const arrivals = numbers.map((number) => {
    const box = number?.getBoundingClientRect();
    const center = box ? box.top + box.height / 2 : rail.top;
    const percent = ((center - rail.top) / rail.height) * 100;
    return (percent - BAND_START) / (BAND_END - BAND_START);
  });

  steps.forEach((step, index) => {
    const arrival = arrivals[index];
    // Cada paso sigue encendido hasta que la banda llega al siguiente
    const leave = arrivals[index + 1] ?? 0.95;
    timeline.to(textOf(step), { opacity: 1, duration: 0.04, ease: "none" }, arrival - 0.03);
    timeline.to(textOf(step), { opacity: 0.4, duration: 0.04, ease: "none" }, leave - 0.03);
    const number = numbers[index];
    if (number) {
      timeline.to(number, { "--glow": 1, duration: 0.04, ease: "none" }, arrival - 0.04);
      timeline.to(number, { "--glow": 0, duration: 0.06, ease: "none" }, arrival + 0.03);
    }
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

/** Versión 2D de las figuras, fija, para movimiento reducido y equipos sin WebGL. */
async function drawFigure2d(canvas: HTMLCanvasElement) {
  const { figurePoints } = await import("./particleFigures");
  const ready = prepare2d(canvas, "--color-accent-400");
  if (!ready) return;
  const { context, width, height } = ready;
  const name = canvas.dataset.figure as Parameters<typeof figurePoints>[0];
  const { position, count, tilt } = figurePoints(name, 0.5);
  const scale = Math.min(width, height) / 2.9;
  const [sinZ, cosZ] = [Math.sin(tilt.z), Math.cos(tilt.z)];
  const flatten = Math.cos(tilt.x);
  for (let i = 0; i < count; i += 1) {
    const x = position[i * 3];
    const y = position[i * 3 + 1];
    context.globalAlpha = 0.35 + Math.random() * 0.65;
    context.fillRect(
      width / 2 + (x * cosZ - y * sinZ) * scale,
      height / 2 - (x * sinZ + y * cosZ) * flatten * scale,
      1.4,
      1.4,
    );
  }
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

let webglSupport: boolean | null = null;

function hasWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const context = document.createElement("canvas").getContext("webgl2");
    webglSupport = Boolean(context);
    // Solo era una prueba: libera el contexto, el navegador admite pocos a la vez
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/** Respeta el ahorro de datos y las conexiones muy lentas: ahí se queda la imagen fija. */
function canUse3d() {
  const { connection } = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (connection?.saveData || connection?.effectiveType?.includes("2g")) return false;
  return hasWebGL();
}

/** Cada figura trae Three.js cuando está a una pantalla de distancia. */
function initFigures() {
  document.querySelectorAll<HTMLCanvasElement>("[data-figure]").forEach((canvas) => {
    void nearScreen(canvas, "100%").then(async () => {
      if (!canUse3d()) {
        void drawFigure2d(canvas);
        return;
      }
      const { startFigure } = await import("./figureScene");
      startFigure(canvas);
    });
  });
}

async function initScene() {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-scene]");
  if (!canvas) return;
  if (!canUse3d()) {
    showFallback();
    return;
  }

  // Portada: en cuanto el navegador se libera o el usuario se mueve.
  // Subpáginas: el globo solo sale en los pasos, se carga al acercarse a ellos.
  const isHome = Boolean(document.querySelector("#g-stats"));
  const steps = document.querySelector("#g-process");
  if (isHome) await firstChance();
  else if (steps) await nearScreen(steps);
  else return;

  // Código y datos a la vez: el modelo no espera a que termine de bajar Three.js
  const loaded = await Promise.all([
    import("./scene"),
    fetch("/data/globe.bin").then((response) => response.arrayBuffer()),
  ]).catch(() => null);
  if (!loaded) {
    showFallback();
    return;
  }
  const [{ sceneState, startScene }, landData] = loaded;
  // Fuera de la portada la escena aparece solo al llegar a los pasos.
  if (!isHome) Object.assign(sceneState, { opacity: 0, mix: 0, y: 0, scale: 0.95, spin: 0 });
  let updatePose: ((delta: number) => void) | null = null;
  await startScene(canvas, landData, (delta) => updatePose?.(delta));
  document.documentElement.classList.add("has-scene");
  gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.2 });

  // Una sola función del scroll: cada posición da siempre el mismo estado del globo.
  // Evita que varias animaciones escriban la misma propiedad y dejen un resultado distinto
  // según la velocidad del scroll.
  type Pose = Pick<
    typeof sceneState,
    "y" | "scale" | "spin" | "mix" | "opacity" | "floor" | "speed" | "water"
  >;
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
    // En pantallas angostas el planeta se ajusta al ancho
    const aspect = window.innerWidth / vh;
    const fit = Math.min(1, 0.23 + 0.79 * aspect);
    const add = (at: number | null, offset: number, pose: Pose) => {
      if (at !== null) {
        stops.push({ at: at + offset * vh, pose: { ...pose, scale: pose.scale * fit } });
      }
    };
    // Altura visible de la escena en el plano del globo: mover esto equivale a una pantalla
    const screen = 2 * 5 * Math.tan((22.5 * Math.PI) / 180);
    const narrow = window.innerWidth < 1024;

    /** Pantallas angostas: el planeta va en el hueco de los pasos y se desplaza con la sección. */
    const followProcess = (pose: Pose) => {
      const section = document.querySelector<HTMLElement>("#g-process");
      const top = topOf("#g-process");
      if (!section || top === null) return;
      const copy = section.querySelector(".copy")?.getBoundingClientRect();
      const list = section.querySelector(".steps")?.getBoundingClientRect();
      if (!copy || !list) return;
      const slot = (copy.bottom + list.top) / 2 - section.getBoundingClientRect().top;
      const sunk = pose.y - pose.floor;
      const at = (scroll: number, opacity: number) => {
        const y = (0.5 - (top - scroll + slot) / vh) * screen;
        add(scroll, 0, { ...pose, y, floor: y - sunk * fit, opacity });
      };
      const enter = top - vh;
      const leave = top + section.offsetHeight;
      at(enter - 0.1 * vh, 0);
      at(enter, 0.92);
      at(leave, 0.92);
      at(leave + 0.1 * vh, 0);
    };
    if (isHome) {
      const free = { spin: -0.75, opacity: 1, floor: -9, speed: 0.17, water: 0 };
      // Al inicio el planeta asoma justo debajo de los botones del hero
      const actions = document.querySelector(".hero .actions")?.getBoundingClientRect();
      const copyEnd = actions ? (actions.bottom + window.scrollY) / vh : 0.44;
      const horizon = Math.min(-0.11, (0.5 - copyEnd) * screen - 0.12);
      const hero = { ...free, y: horizon - 1.4 * fit, scale: 1.4, mix: 0 };
      const center = { ...free, y: -0.12, scale: 1.3, mix: 0 };
      const chip = { ...free, y: -0.12, scale: 1.08, mix: 1 };
      // En los pasos el planeta gira con el scroll y su base se hunde en el reflejo
      const steps = {
        y: 0.12,
        scale: 0.9,
        spin: -0.75,
        mix: 0,
        opacity: 0.92,
        floor: -0.55,
        speed: 0.03,
        water: 0.45,
      };
      const rising = { ...steps, y: steps.y - screen, floor: steps.floor - screen };
      // El planeta se deshace en una cúpula, se recoge sobre el agua y forma el chip
      const dome = { ...center, mix: 0.36, floor: -1.1, water: 0.5 };
      const pool = { ...center, y: 0.35, scale: 0.52, mix: 0.55, floor: -0.3, water: 1.4 };
      const release = endOf("#g-stats");
      add(0, 0, hero);
      // Con el texto encima, en pantallas angostas el planeta se atenúa para poder leer
      const reading = { ...center, opacity: narrow ? 0.4 : 1 };
      add(0, 0.55, reading);
      add(release, -0.1, reading);
      add(release, 0.05, center);
      add(release, 0.55, dome);
      add(release, 0.82, pool);
      add(release, 1.08, chip);
      // En angosto las tarjetas van apiladas: el chip se apaga para no cruzarse con ellas
      const chipEnd = narrow ? endOf("#g-services") : topOf("#g-table");
      add(chipEnd, narrow ? 0 : -1, chip);
      add(chipEnd, narrow ? 0.45 : -0.45, { ...chip, opacity: 0 });
      if (narrow) {
        followProcess({ ...steps, opacity: 0 });
      } else {
        // Oculto cambia de forma; después sube pegado a la sección de pasos
        add(topOf("#g-process"), -1.1, { ...rising, opacity: 0 });
        add(topOf("#g-process"), -1, { ...rising, opacity: 0.35 });
        add(topOf("#g-process"), 0, steps);
        add(endOf("#g-process"), 0, { ...steps, spin: -0.25 });
        add(topOf("#g-showcase"), -0.9, { ...steps, spin: -0.2 });
        add(topOf("#g-showcase"), -0.15, { ...steps, spin: -0.15, opacity: 0 });
      }
    } else {
      const on = {
        y: 0.12,
        scale: 0.98,
        spin: 0,
        mix: 0,
        opacity: 0.92,
        floor: -0.55,
        speed: 0.03,
        water: 0.45,
      };
      if (narrow) {
        followProcess({ ...on, opacity: 0 });
      } else {
        add(topOf("#g-process"), -0.9, { ...on, opacity: 0 });
        add(topOf("#g-process"), 0, on);
        add(endOf("#g-process"), 0, { ...on, spin: 0.5 });
        add(topOf(".final"), -0.9, { ...on, spin: 0.55 });
        add(topOf(".final"), -0.4, { ...on, spin: 0.6, opacity: 0 });
      }
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
  // Arranca ya en su sitio: sin esto el planeta se deslizaría desde la pose de escritorio
  Object.assign(sceneState, sample(stops, window.scrollY));
  ScrollTrigger.addEventListener("refresh", () => {
    stops = buildStops();
  });
  // Suavizado por tiempo real: igual en un monitor de 60 Hz que en uno de 144 Hz
  updatePose = (delta) => {
    const target = sample(stops, window.scrollY);
    if (!target) return;
    const follow = 1 - Math.exp(-5.66 * delta);
    for (const key of Object.keys(target) as (keyof Pose)[]) {
      sceneState[key] += (target[key] - sceneState[key]) * follow;
    }
  };
}

declare global {
  interface Window {
    __motion?: boolean;
  }
}

if (prefersReducedMotion()) {
  document.documentElement.classList.add("no-motion");
  showFallback();
  // Con movimiento reducido las figuras quedan quietas, pero se ven
  document
    .querySelectorAll<HTMLCanvasElement>("[data-figure]")
    .forEach((canvas) => void drawFigure2d(canvas));
} else {
  window.__motion = true;
  initLenis();
  // Por tramos: entre uno y otro el navegador puede pintar y atender al usuario
  void document.fonts.ready.then(async () => {
    initPageEntrance();
    await breathe();
    claimServices();
    await breathe();
    // Primero los fijados, en orden de página: ScrollTrigger calcula en el orden de creación,
    // y todo lo creado antes ignoraría el espacio que añaden y se dispararía demasiado pronto
    initStats();
    initServices();
    initProcess();
    initShowcase();
    await breathe();
    initHeadings();
    initReveals();
    initCounters();
    initCarousels();
    initOrbs();
    ScrollTrigger.refresh();
    initFigures();
    void initScene();
  });
}
