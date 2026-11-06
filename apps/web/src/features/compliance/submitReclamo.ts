import type { ReclamoInput } from "./reclamoSchema";

export type ReclamoResult =
  { ok: true; number: string; simulated: boolean; date: string } | { ok: false };

export async function submitReclamo(reclamo: ReclamoInput): Promise<ReclamoResult> {
  const apiUrl = import.meta.env.PUBLIC_API_URL;
  const date = new Date().toLocaleDateString("es-PE");

  if (!apiUrl) {
    if (import.meta.env.DEV) console.info("[submitReclamo] envío simulado", reclamo);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { ok: true, number: "SIMULADO-0001", simulated: true, date };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/claims`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reclamo),
    });
    if (response.status !== 201) return { ok: false };
    const { number } = (await response.json()) as { number: string };
    return { ok: true, number, simulated: false, date };
  } catch {
    return { ok: false };
  }
}
