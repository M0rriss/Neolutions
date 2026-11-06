# 20 · Backend (siguiente etapa)

El backend se construye **después** de terminar el frontend (F12). Este archivo resume lo acordado; cuando empiece la etapa, se dividirá en archivos detallados como el frontend.

## Stack

- Java 21, Spring Boot 3, Maven multi-módulo (`./mvnw`).
- Arquitectura hexagonal, monolito modular.
- PostgreSQL + Flyway.
- RabbitMQ para eventos entre módulos.
- Pruebas: JUnit 5, Testcontainers, ArchUnit.

## Estructura

```text
backend/
├── pom.xml
├── bootstrap/          # único ejecutable, config global
├── shared-kernel/      # AggregateRoot, DomainEvent, EventPublisher (puerto)
└── modules/
    ├── leads/          # fase 1: recibe ContactForm
    ├── notifications/  # fase 1: correo al equipo y al cliente
    ├── compliance/     # fase 1: Libro de Reclamaciones, consentimientos
    ├── catalog/        # fase 2
    └── identity/ quoting/ support/ billing/   # fase 3
```

Cada módulo: `domain/`, `application/port/in`, `application/port/out`, `application/service`, `infrastructure/adapter/{in,out}`, `infrastructure/config`.

## Contrato con el frontend

| Endpoint | Uso | Isla |
| --- | --- | --- |
| `POST /api/v1/leads` | Formulario de contacto | `ContactForm` |
| `POST /api/v1/claims` | Libro de Reclamaciones | `ReclamoForm` |

Cuando existan, basta con definir `PUBLIC_API_URL` en `.env`: las funciones `submitLead` y `submitReclamo` dejan de simular y llaman a la API.

## Eventos

- Exchange `neo.events` (topic).
- `leads.lead.created` → `notifications.lead-created.q`
- `compliance.claim.registered` → `notifications.claim-registered.q`
- Cada cola con DLQ y 3 reintentos.

Detalle completo en el documento "Arquitectura técnica de la web de Neolutions".
