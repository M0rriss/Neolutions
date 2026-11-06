import type { LeadInput } from "./schema";

const SIMULATED_DELAY_MS = 800;

export type SubmitResult = { ok: boolean };

export async function submitLead(lead: LeadInput): Promise<SubmitResult> {
  // Trampa llena: se descarta en silencio y el bot ve un éxito normal.
  if (lead.website) return { ok: true };

  const { website: _website, ...payload } = lead;
  const apiUrl = import.meta.env.PUBLIC_API_URL;

  if (!apiUrl) {
    if (import.meta.env.DEV) console.info("[submitLead] envío simulado", payload);
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    return { ok: true };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: response.status === 201 };
  } catch {
    return { ok: false };
  }
}
