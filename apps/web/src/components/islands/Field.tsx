import type { ReactNode } from "react";
import styles from "./Form.module.css";

type Props = {
  id: string;
  label: string;
  error?: string;
  children: (a11y: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
};

/** Lleva el foco al primer campo con error, ya pintado por React. */
export function focusFirstError(): void {
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>('form [aria-invalid="true"]')?.focus();
  });
}

/** Une etiqueta, control y error con los atributos que anuncian el error. */
export function Field({ id, label, error, children }: Props) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
