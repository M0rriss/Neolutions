import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power3.out", duration: 0.8 });
// En celular, la barra del navegador al esconderse no recalcula todas las animaciones
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
