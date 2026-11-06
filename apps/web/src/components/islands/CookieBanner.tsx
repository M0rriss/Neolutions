import { useEffect, useRef, useState } from "react";
import { getConsent, loadAnalytics, setConsent, type Consent } from "@/lib/analytics";
import styles from "./CookieBanner.module.css";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (visible) {
      root.dataset.cookieBanner = "open";
      const height = (ref.current?.offsetHeight ?? 0) + 32;
      root.style.setProperty("--cookie-banner-height", `${height}px`);
    } else {
      delete root.dataset.cookieBanner;
    }
  }, [visible]);

  if (!visible) return null;

  const choose = (value: Consent) => {
    setConsent(value);
    if (value === "accepted") loadAnalytics();
    setVisible(false);
  };

  return (
    <section ref={ref} className={styles.banner} aria-label="Uso de cookies">
      <p className={styles.text}>
        Usamos cookies para medir las visitas y mejorar nuestros anuncios. Conoce más en la{" "}
        <a href="/legal/cookies">Política de cookies</a>.
      </p>
      <div className={styles.buttons}>
        <button type="button" className={styles.secondary} onClick={() => choose("necessary")}>
          Solo necesarias
        </button>
        <button type="button" className={styles.primary} onClick={() => choose("accepted")}>
          Aceptar
        </button>
      </div>
    </section>
  );
}
