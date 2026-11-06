import { z } from "zod";

const required = (message: string) => z.string().trim().min(1, message);

export const reclamoSchema = z
  .object({
    fullName: required("Escribe tus nombres y apellidos"),
    documentType: z.enum(["DNI", "CE", "Pasaporte"], { error: "Elige un tipo de documento" }),
    documentNumber: required("Escribe tu número de documento"),
    address: required("Escribe tu domicilio"),
    phone: required("Escribe tu teléfono"),
    email: z.email("Escribe un correo válido"),
    isMinor: z.boolean(),
    guardianName: z.string().trim().optional(),
    guardianDocument: z.string().trim().optional(),
    itemType: z.enum(["producto", "servicio"], { error: "Elige producto o servicio" }),
    amount: z.string().trim().optional(),
    itemDescription: required("Describe el producto o servicio"),
    claimType: z.enum(["reclamo", "queja"], { error: "Elige reclamo o queja" }),
    detail: required("Cuéntanos el detalle"),
    request: required("Cuéntanos qué solicitas"),
    consent: z.literal(true, { error: "Necesitamos tu autorización para registrar tu reclamo" }),
  })
  .superRefine((data, context) => {
    if (!data.isMinor) return;
    if (!data.guardianName) {
      context.addIssue({
        code: "custom",
        path: ["guardianName"],
        message: "Escribe el nombre del padre, madre o apoderado",
      });
    }
    if (!data.guardianDocument) {
      context.addIssue({
        code: "custom",
        path: ["guardianDocument"],
        message: "Escribe el documento del padre, madre o apoderado",
      });
    }
  });

export type ReclamoFormValues = z.input<typeof reclamoSchema>;
export type ReclamoInput = z.output<typeof reclamoSchema>;
