/** Ejecuta `task` cuando el navegador quede libre, sin esperar más de `timeout` ms. */
export function whenIdle(task: () => void, timeout = 1200) {
  // Safari aún no lo tiene en todas sus versiones
  const idle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
  if (idle) idle(task, { timeout });
  else window.setTimeout(task, 200);
}

/** Cede el turno para que el navegador pinte y responda entre dos tareas largas. */
export function breathe() {
  const { scheduler } = window as Window & { scheduler?: { yield?: () => Promise<void> } };
  if (scheduler?.yield) return scheduler.yield();
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

/** Resuelve con el navegador libre o con el primer gesto del usuario, lo que llegue antes. */
export function firstChance() {
  return new Promise<void>((resolve) => {
    const gestures = ["scroll", "wheel", "pointerdown", "touchstart", "keydown"];
    const finish = () => {
      gestures.forEach((name) => window.removeEventListener(name, finish));
      resolve();
    };
    gestures.forEach((name) => window.addEventListener(name, finish, { passive: true }));
    whenIdle(finish);
  });
}

/** Resuelve cuando el elemento esté a menos de `margin` de la pantalla. */
export function nearScreen(element: Element, margin = "150%") {
  return new Promise<void>((resolve) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        resolve();
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(element);
  });
}

/** La imagen de respaldo solo se descarga si de verdad se va a mostrar. */
export function showFallback() {
  document.querySelectorAll<HTMLImageElement>("img[data-src]").forEach((image) => {
    image.src = image.dataset.src ?? "";
    image.removeAttribute("data-src");
  });
}
