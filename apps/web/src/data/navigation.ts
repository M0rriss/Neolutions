import { serviceGroups } from "./serviceGroups";

type NavLink = { label: string; href: string };
type NavItem = NavLink & { children?: readonly NavLink[]; services?: boolean };

export const mainNav: readonly NavItem[] = [
  {
    label: "Soluciones",
    href: "/servicios",
    children: serviceGroups.map((group) => ({
      label: group.title,
      href: `/servicios#${group.id}`,
    })),
  },
  { label: "Servicios", href: "/servicios", services: true },
  { label: "Clientes", href: "/clientes" },
  {
    label: "Asistencia",
    href: "/ayuda",
    children: [
      { label: "Centro de ayuda", href: "/ayuda" },
      { label: "Contáctanos", href: "/contacto" },
      { label: "Nosotros", href: "/nosotros" },
      { label: "Legal", href: "/legal" },
    ],
  },
];

export const legalNav = [
  {
    label: "Política de privacidad",
    href: "/legal/privacidad",
    text: "Cómo tratamos tus datos personales según la Ley 29733.",
  },
  {
    label: "Términos y condiciones",
    href: "/legal/terminos",
    text: "Alcance de los servicios, cotizaciones, garantías, pagos y plazos.",
  },
  {
    label: "Política de cookies",
    href: "/legal/cookies",
    text: "Qué cookies usamos y cómo desactivarlas.",
  },
  {
    label: "Libro de Reclamaciones",
    href: "/legal/libro-de-reclamaciones",
    text: "Registra aquí tu reclamo o queja.",
  },
] as const;

export const companyNav = [
  { label: "Clientes", href: "/clientes" },
  { label: "Nosotros", href: "/nosotros" },
] as const;

export const helpNav = [
  { label: "Centro de ayuda", href: "/ayuda" },
  { label: "Contáctanos", href: "/contacto" },
  { label: "Legal", href: "/legal" },
] as const;
