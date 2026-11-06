import { afterEach, describe, expect, it, vi } from "vitest";
import { leadSchema } from "./schema";
import { submitLead } from "./submitLead";

const valid = {
  name: "Ana Pérez",
  phone: "913 578 930",
  service: "paginas-web",
  message: "Necesito una web para mi tienda",
  consent: true as const,
};

const issue = (data: unknown) => leadSchema.safeParse(data).error?.issues[0]?.message;

describe("leadSchema", () => {
  it("acepta datos válidos y quita espacios del celular", () => {
    expect(leadSchema.parse(valid).phone).toBe("913578930");
  });

  it("rechaza celulares que no empiezan en 9", () => {
    expect(issue({ ...valid, phone: "813578930" })).toBe("Escribe un celular válido de 9 dígitos");
  });

  it("muestra el mensaje propio si falta la autorización", () => {
    expect(issue({ ...valid, consent: false })).toBe(
      "Necesitamos tu autorización para responderte",
    );
  });

  it("exige un mensaje de al menos 10 caracteres", () => {
    expect(issue({ ...valid, message: "corto" })).toBe(
      "Cuéntanos un poco más (mínimo 10 caracteres)",
    );
  });
});

describe("submitLead", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("con la trampa llena no llama a la API", async () => {
    vi.stubEnv("PUBLIC_API_URL", "https://api.test");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await submitLead({ ...leadSchema.parse(valid), website: "http://spam" });
    expect(result.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envía a la API sin el campo trampa", async () => {
    vi.stubEnv("PUBLIC_API_URL", "https://api.test");
    const fetchMock = vi.fn().mockResolvedValue({ status: 201 });
    vi.stubGlobal("fetch", fetchMock);
    const result = await submitLead(leadSchema.parse({ ...valid, website: "" }));
    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/api/v1/leads");
    expect(JSON.parse(init.body)).not.toHaveProperty("website");
  });

  it("un error 500 o de red no se reporta como éxito", async () => {
    vi.stubEnv("PUBLIC_API_URL", "https://api.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 500 }));
    expect((await submitLead(leadSchema.parse(valid))).ok).toBe(false);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("red")));
    expect((await submitLead(leadSchema.parse(valid))).ok).toBe(false);
  });
});
