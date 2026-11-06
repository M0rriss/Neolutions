export const groupIds = ["soporte-infraestructura", "seguridad", "desarrollo-digital"] as const;
export type GroupId = (typeof groupIds)[number];

export const serviceGroups = [
  {
    id: "soporte-infraestructura",
    title: "Soporte e infraestructura",
    description: "Equipos y redes funcionando para que tu negocio no se detenga.",
    icon: "support",
    whatsappMessage: "Hola Neolutions, quiero cotizar soporte e infraestructura para mi negocio.",
  },
  {
    id: "seguridad",
    title: "Seguridad",
    description: "Vigila tu local y revisa todo desde el celular.",
    icon: "camera",
    whatsappMessage: "Hola Neolutions, quiero cotizar seguridad para mi negocio.",
  },
  {
    id: "desarrollo-digital",
    title: "Desarrollo y marketing digital",
    description: "Web, apps y sistemas para vender más y trabajar mejor.",
    icon: "web",
    whatsappMessage:
      "Hola Neolutions, quiero cotizar desarrollo y marketing digital para mi negocio.",
  },
] as const;
