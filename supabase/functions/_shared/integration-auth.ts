// Server-to-server auth for the external WhatsApp integration.
export const jsonHeaders = { "Content-Type": "application/json" };

export function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

/** Returns an error Response if the caller is not authorized, otherwise null. Fails closed. */
export function checkIntegrationSecret(req: Request): Response | null {
  const expected = Deno.env.get("WHATSAPP_INTEGRATION_SECRET");
  if (!expected) return json({ error: "Service unavailable" }, 503);
  const provided = req.headers.get("x-integration-secret");
  if (!provided || !timingSafeEqual(provided, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}
