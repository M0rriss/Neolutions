import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { leadMessages } from "@/features/leads/messages";
import { leadSchema, type LeadFormValues, type LeadInput } from "@/features/leads/schema";
import { submitLead } from "@/features/leads/submitLead";
import { whatsappLink } from "@/lib/whatsapp";
import { Field, focusFirstError } from "./Field";
import styles from "./Form.module.css";

type Props = {
  services: { slug: string; title: string }[];
  defaultService?: string;
};

export default function ContactForm({ services, defaultService = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues, unknown, LeadInput>({
    resolver: zodResolver(leadSchema),
    shouldFocusError: false,
    defaultValues: { service: defaultService, website: "" },
  });

  const onSubmit = async (lead: LeadInput) => {
    setFailed(false);
    const { ok } = await submitLead(lead);
    if (ok) {
      window.location.assign(`/gracias?servicio=${encodeURIComponent(lead.service)}`);
    } else {
      setFailed(true);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit, focusFirstError)}
      noValidate
      aria-busy={isSubmitting}
    >
      <Field id="name" label="Nombre" error={errors.name?.message}>
        {(a11y) => (
          <input
            {...a11y}
            {...register("name")}
            className={styles.input}
            type="text"
            autoComplete="name"
          />
        )}
      </Field>

      <Field id="phone" label="Celular" error={errors.phone?.message}>
        {(a11y) => (
          <input
            {...a11y}
            {...register("phone")}
            className={styles.input}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
          />
        )}
      </Field>

      <Field id="service" label="Servicio" error={errors.service?.message}>
        {(a11y) => (
          <select {...a11y} {...register("service")} className={styles.input}>
            <option value="">Elige un servicio</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
            <option value="otro">Otro</option>
          </select>
        )}
      </Field>

      <Field id="message" label="Mensaje" error={errors.message?.message}>
        {(a11y) => (
          <textarea {...a11y} {...register("message")} className={styles.input} rows={4} />
        )}
      </Field>

      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="website">Sitio web</label>
        <input {...register("website")} id="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.field}>
        <label className={styles.check}>
          <input
            {...register("consent")}
            type="checkbox"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span>
            Autorizo a Neolutions Tecnology a usar mis datos para responder mi solicitud, según la{" "}
            <a href="/legal/privacidad">Política de privacidad</a>.
          </span>
        </label>
        {errors.consent && (
          <p className={styles.error} id="consent-error" role="alert">
            {errors.consent.message}
          </p>
        )}
      </div>

      {failed && (
        <div className={styles.alert} role="alert">
          <p>{leadMessages.submitFailed}</p>
          <a className={styles.submit} href={whatsappLink()} target="_blank" rel="noopener">
            Cotiza gratis por WhatsApp
          </a>
        </div>
      )}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
