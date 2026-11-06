import { describe, expect, it } from "vitest";
import { absoluteUrl, jsonLdString, pageTitle } from "./seo";

describe("pageTitle", () => {
  it("agrega la marca cuando cabe", () => {
    expect(pageTitle("Contacto")).toBe("Contacto · Neolutions");
  });

  it("no pasa de 60 caracteres", () => {
    const title = "Instalación de cámaras de seguridad en Lima y Callao";
    expect(pageTitle(title)).toBe(title);
  });
});

describe("absoluteUrl", () => {
  it("no deja barra final", () => {
    expect(absoluteUrl("/", "https://neo.pe")).toBe("https://neo.pe");
    expect(absoluteUrl("/servicios/", "https://neo.pe")).toBe("https://neo.pe/servicios");
  });
});

describe("jsonLdString", () => {
  it("no permite cerrar el script", () => {
    expect(jsonLdString({ a: "</script>" })).not.toContain("</script>");
  });
});
