/** Un valor pendiente de confirmar por el negocio empieza con "TODO". */
export function isPending(value: string | undefined | null): boolean {
  return !value || /^\s*TODO\b/.test(value);
}

/** Lo pendiente se ve resaltado en desarrollo y nunca llega a producción. */
export function shouldShow(value: string | undefined | null): boolean {
  return import.meta.env.DEV || !isPending(value);
}
