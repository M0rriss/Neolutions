# 15 · Páginas internas

## `/nosotros`

| Bloque | Contenido |
| --- | --- |
| Hero | Eyebrow "Nosotros", H1 "Crecemos junto a los negocios que confían en nosotros", párrafo de quiénes somos |
| Quiénes somos | Neolutions Tecnology es una empresa de tecnología con base en el Callao, Perú. Acompañamos a pequeñas empresas y emprendedores con soluciones de soporte técnico, redes, seguridad, desarrollo de software y presencia digital, para que puedan crecer con tecnología confiable y al alcance de su presupuesto. |
| Misión y visión | Dos tarjetas lado a lado |
| Valores | 5 tarjetas pequeñas con ícono |
| Equipo | Tarjeta del fundador + una por colaborador (foto, nombre, rol, frase) |
| Llamado final | `FinalCta` |

**Misión:** Apoyar a pequeñas empresas y emprendedores para que crezcan, ofreciéndoles soluciones tecnológicas confiables, accesibles y hechas a su medida, con un trato cercano y un acompañamiento que continúa después de la entrega.

**Visión:** Ser el aliado tecnológico de referencia de las pequeñas empresas del Perú, reconocido porque crecemos junto a nuestros clientes y por la calidad de cada solución que entregamos.

**Valores:** Compromiso, Cercanía, Calidad, Transparencia, Innovación (textos en el documento de contenidos).

**Fundador:** Joel Huarag Aranda, Ingeniero de Sistemas. Foto: `TODO:` `public/images/equipo/joel.webp`.

Los textos viven en `src/content/paginas/nosotros.md` o en `data/about.ts`, no dentro del componente.

## `/contacto`

Dos columnas desde 1024px:

| Izquierda | Derecha |
| --- | --- |
| H1 "Hablemos de tu proyecto", texto corto, `WhatsAppButton` grande, datos: WhatsApp, zona de atención, horario (`TODO:`), redes | `ContactForm` (isla React, ver `17-islas-react.md`) dentro de una `Card` |

Debajo: mapa solo si hay dirección pública (`TODO:`); si no, el texto "Atendemos en Lima y Callao".

## `/gracias`

- `noindex`.
- H1 "¡Recibimos tu solicitud!"
- Texto: "Te escribiremos pronto. Si es urgente, escríbenos directo por WhatsApp."
- `WhatsAppButton` + enlace a Inicio.
- Dispara el evento de conversión `lead_submitted` (fase 2).

## Legales (`/legal/*`)

Usan fondo claro (`--color-surface-light`, texto `--color-text-dark`) para lectura cómoda, ancho máximo 760px.

| Página | Contenido |
| --- | --- |
| `privacidad` | Política alineada a la Ley 29733 de Protección de Datos Personales: responsable, datos recogidos, finalidad, plazo, derechos ARCO y cómo ejercerlos |
| `terminos` | Alcance de los servicios, cotizaciones, garantías, formas de pago y plazos |
| `cookies` | Qué cookies se usan (analítica y píxel de Meta) y cómo desactivarlas |
| `libro-de-reclamaciones` | `ReclamoForm` (isla React) con los campos del formato oficial |

Todos los textos legales llevan al inicio un aviso interno `TODO: revisar con abogado` que se elimina antes de publicar. Fecha de última actualización visible.

## `/404`

H1 "No encontramos esta página", enlaces a Inicio y Servicios, `WhatsAppButton`.

## Criterios de aceptación

- `/gracias` y `/404` llevan `noindex`.
- Las páginas legales son legibles a 375px sin zoom.
- Ninguna página interna contiene datos inventados; los faltantes aparecen como `TODO:`.
