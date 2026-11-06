// TODO: completar con clientes y partners reales, con su autorización para usar el logo.
// Mientras estén vacíos, estas secciones solo se ven como espacios en desarrollo.
export type LogoItem = { name: string; logo: string };

export const clients: LogoItem[] = [];
export const licensePartners: LogoItem[] = [];

export const clientsPage = {
  title: "Clientes",
  description: "Negocios de Lima y Callao que trabajan con Neolutions y los partners de licencias.",
  badge: "Clientes",
  headline: "Negocios que crecen con nosotros",
  text: "Acompañamos a pequeñas empresas y emprendedores con tecnología confiable y un trato cercano.",
  sectorsTitle: "A quién atendemos",
  sectorsText: "Tiendas, oficinas, consultorios, restaurantes y talleres sin área de sistemas.",
  clientsTitle: "Nuestros clientes",
  clientsText: "Negocios que confían su tecnología a nuestro equipo.",
  whyTitle: "Por qué trabajar con nosotros",
  partnersTitle: "Partners de licencias",
  partnersText: "Marcas con las que trabajamos para entregarte tecnología con respaldo.",
  slots: 8,
} as const;
