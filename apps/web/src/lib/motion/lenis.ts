import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

export function initLenis() {
  const lenis = new Lenis({
    duration: 1.15,
    wheelMultiplier: 0.75,
    smoothWheel: true,
    // El dedo también pasa por Lenis: la escena 3D y las secciones fijas van en el mismo cuadro
    syncTouch: true,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      const target = id && id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    });
  });
  return lenis;
}
