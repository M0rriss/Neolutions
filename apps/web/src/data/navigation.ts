export const mainNav = [
  { label: "Inicio", href: "/", enabled: true },
  { label: "Servicios", href: "/servicios", enabled: true, hasMenu: true },
  { label: "Proyectos", href: "/proyectos", enabled: false },
  { label: "Nosotros", href: "/nosotros", enabled: true },
  { label: "Blog", href: "/blog", enabled: false },
  { label: "Contacto", href: "/contacto", enabled: true },
] as const;

export const legalNav = [
  { label: "Política de privacidad", href: "/legal/privacidad" },
  { label: "Términos y condiciones", href: "/legal/terminos" },
  { label: "Política de cookies", href: "/legal/cookies" },
  { label: "Libro de Reclamaciones", href: "/legal/libro-de-reclamaciones" },
] as const;
