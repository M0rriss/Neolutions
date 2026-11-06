import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  reclamoSchema,
  type ReclamoFormValues,
  type ReclamoInput,
} from "@/features/compliance/reclamoSchema";
import { submitReclamo, type ReclamoResult } from "@/features/compliance/submitReclamo";
import { whatsappLink } from "@/lib/whatsapp";
import { Field, focusFirstError } from "./Field";
import styles from "./Form.module.css";

type Done = Extract<ReclamoResult, { ok: true }>;

export default function ReclamoForm() {
  const [done, setDone] = useState<Done | null>(null);
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReclamoFormValues, unknown, ReclamoInput>({
    resolver: zodResolver(reclamoSchema),
    shouldFocusError: false,
    defaultValues: { isMinor: false },
  });
  const isMinor = watch("isMinor");

  const onSubmit = async (data: ReclamoInput) => {
    setFailed(false);
    const result = await submitReclamo(data);
    if (result.ok) setDone(result);
    else setFailed(true);
  };

  if (done) {
    return (
      <div className={styles.summary} role="status">
        {done.simulated && (
          <p className={styles.notice}>
            Simulación: este reclamo no se guardó porque todavía no hay backend.
          </p>
        )}
        <p>
          <strong>Hoja de reclamación N.° {done.number}</strong>
        </p>
        <p>Fecha: {done.date}</p>
        <p>Registramos tu solicitud. Guarda o imprime esta hoja.</p>
        <button
          className={`${styles.submit} ${styles.noPrint}`}
          type="button"
          onClick={() => window.print()}
        >
          Imprimir hoja
        </button>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit, focusFirstError)}
      noValidate
      aria-busy={isSubmitting}
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>1. Consumidor</legend>
        <Field id="fullName" label="Nombres y apellidos" error={errors.fullName?.message}>
          {(a11y) => (
            <input
              {...a11y}
              {...register("fullName")}
              className={styles.input}
              autoComplete="name"
            />
          )}
        </Field>
        <Field id="documentType" label="Tipo de documento" error={errors.documentType?.message}>
          {(a11y) => (
            <select
              {...a11y}
              {...register("documentType")}
              className={styles.input}
              defaultValue=""
            >
              <option value="" disabled>
                Elige una opción
              </option>
              <option value="DNI">DNI</option>
              <option value="CE">Carné de extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          )}
        </Field>
        <Field
          id="documentNumber"
          label="Número de documento"
          error={errors.documentNumber?.message}
        >
          {(a11y) => <input {...a11y} {...register("documentNumber")} className={styles.input} />}
        </Field>
        <Field id="address" label="Domicilio" error={errors.address?.message}>
          {(a11y) => (
            <input
              {...a11y}
              {...register("address")}
              className={styles.input}
              autoComplete="street-address"
            />
          )}
        </Field>
        <Field id="reclamo-phone" label="Teléfono" error={errors.phone?.message}>
          {(a11y) => (
            <input
              {...a11y}
              {...register("phone")}
              className={styles.input}
              type="tel"
              autoComplete="tel"
            />
          )}
        </Field>
        <Field id="email" label="Correo electrónico" error={errors.email?.message}>
          {(a11y) => (
            <input
              {...a11y}
              {...register("email")}
              className={styles.input}
              type="email"
              autoComplete="email"
            />
          )}
        </Field>
        <label className={styles.check}>
          <input {...register("isMinor")} type="checkbox" />
          <span>Soy menor de edad</span>
        </label>
        {isMinor && (
          <>
            <Field
              id="guardianName"
              label="Nombre del padre, madre o apoderado"
              error={errors.guardianName?.message}
            >
              {(a11y) => <input {...a11y} {...register("guardianName")} className={styles.input} />}
            </Field>
            <Field
              id="guardianDocument"
              label="Documento del padre, madre o apoderado"
              error={errors.guardianDocument?.message}
            >
              {(a11y) => (
                <input {...a11y} {...register("guardianDocument")} className={styles.input} />
              )}
            </Field>
          </>
        )}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>2. Bien contratado</legend>
        <Field id="itemType" label="Tipo" error={errors.itemType?.message}>
          {(a11y) => (
            <select {...a11y} {...register("itemType")} className={styles.input} defaultValue="">
              <option value="" disabled>
                Elige una opción
              </option>
              <option value="producto">Producto</option>
              <option value="servicio">Servicio</option>
            </select>
          )}
        </Field>
        <Field id="amount" label="Monto reclamado (opcional)" error={errors.amount?.message}>
          {(a11y) => (
            <input {...a11y} {...register("amount")} className={styles.input} inputMode="decimal" />
          )}
        </Field>
        <Field id="itemDescription" label="Descripción" error={errors.itemDescription?.message}>
          {(a11y) => (
            <textarea
              {...a11y}
              {...register("itemDescription")}
              className={styles.input}
              rows={3}
            />
          )}
        </Field>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>3. Detalle</legend>
        <Field id="claimType" label="Tipo de solicitud" error={errors.claimType?.message}>
          {(a11y) => (
            <select {...a11y} {...register("claimType")} className={styles.input} defaultValue="">
              <option value="" disabled>
                Elige una opción
              </option>
              <option value="reclamo">Reclamo</option>
              <option value="queja">Queja</option>
            </select>
          )}
        </Field>
        <p className={styles.hint}>
          Reclamo: disconformidad con el producto o servicio. Queja: disconformidad con la atención,
          no relacionada con el producto o servicio.
        </p>
        <Field id="detail" label="Detalle" error={errors.detail?.message}>
          {(a11y) => (
            <textarea {...a11y} {...register("detail")} className={styles.input} rows={4} />
          )}
        </Field>
        <Field id="request" label="Pedido del consumidor" error={errors.request?.message}>
          {(a11y) => (
            <textarea {...a11y} {...register("request")} className={styles.input} rows={3} />
          )}
        </Field>
      </fieldset>

      <div className={styles.field}>
        <label className={styles.check}>
          <input
            {...register("consent")}
            type="checkbox"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "reclamo-consent-error" : undefined}
          />
          <span>
            Autorizo el uso de mis datos para atender este reclamo, según la{" "}
            <a href="/legal/privacidad">Política de privacidad</a>.
          </span>
        </label>
        {errors.consent && (
          <p className={styles.error} id="reclamo-consent-error" role="alert">
            {errors.consent.message}
          </p>
        )}
      </div>

      {failed && (
        <div className={styles.alert} role="alert">
          <p>No pudimos registrar tu reclamo. Escríbenos por WhatsApp.</p>
          <a className={styles.secondary} href={whatsappLink()} target="_blank" rel="noopener">
            Escribir por WhatsApp
          </a>
        </div>
      )}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar reclamo"}
      </button>
    </form>
  );
}
