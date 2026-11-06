import { z } from "zod";
import { leadMessages as m } from "./messages";

export const leadSchema = z.object({
  name: z.string().trim().min(2, m.name).max(80, m.name),
  phone: z
    .string()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(z.string().regex(/^9\d{8}$/, m.phone)),
  service: z.string().min(1, m.service),
  message: z.string().trim().min(10, m.message).max(1000, m.messageLong),
  // Zod 4 ignora errorMap: el mensaje propio va en `error`.
  consent: z.literal(true, { error: m.consent }),
  // Campo trampa: no valida aquí para que un bot no reciba ninguna pista.
  website: z.string().optional(),
});

export type LeadFormValues = z.input<typeof leadSchema>;
export type LeadInput = z.output<typeof leadSchema>;
