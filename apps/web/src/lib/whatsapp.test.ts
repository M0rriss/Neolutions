import { describe, expect, it } from "vitest";
import { whatsappLink } from "./whatsapp";
import { site } from "@/data/site";

const prefix = "https://wa.me/51913578930?text=";

describe("whatsappLink", () => {
  it("usa el número y codifica el mensaje", () => {
    const link = whatsappLink({ message: "Hola, ¿cotizan cámaras?" });
    expect(link).toBe(prefix + encodeURIComponent("Hola, ¿cotizan cámaras?"));
    expect(link).not.toContain(" ");
  });

  it("usa el mensaje del servicio", () => {
    const service = { title: "Cámaras", whatsappMessage: "Quiero cámaras" };
    expect(whatsappLink({ service })).toBe(prefix + encodeURIComponent("Quiero cámaras"));
  });

  it("el mensaje explícito gana al del servicio", () => {
    const service = { title: "Cámaras", whatsappMessage: "del servicio" };
    expect(whatsappLink({ message: "explícito", service })).toBe(
      prefix + encodeURIComponent("explícito"),
    );
  });

  it("sin opciones usa el mensaje general", () => {
    expect(whatsappLink()).toBe(prefix + encodeURIComponent(site.whatsapp.defaultMessage));
  });
});
