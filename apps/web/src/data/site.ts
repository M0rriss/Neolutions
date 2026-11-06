export const site = {
  name: "Neolutions Tecnology",
  shortName: "Neolutions",
  tagline: "Tecnología para hacer crecer tu negocio",
  url: import.meta.env.PUBLIC_SITE_URL || "https://TODO-dominio.pe",
  whatsapp: {
    number: import.meta.env.PUBLIC_WHATSAPP_NUMBER || "51913578930",
    display: "913 578 930",
    defaultMessage: "Hola Neolutions, quiero una cotización para mi negocio.",
  },
  social: {
    tiktok: "https://www.tiktok.com/@neo.soluciones",
    facebook: "https://www.facebook.com/NeolutionsTecnology",
  },
  area: "Lima y Callao",
  schedule: "TODO: horario de atención",
  legal: { businessName: "", ruc: "" }, // TODO: completar cuando existan
  announcement: { enabled: true },
} as const;
