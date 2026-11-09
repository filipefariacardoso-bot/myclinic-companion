// Server-to-server shared-secret auth helpers.
export const jsonHeaders = { "Content-Type": "application/json" };

export function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

export function timingSafeEqual(a: string, b: string): boolean {
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

/**
 * Generic fail-closed shared-secret check.
 * 503 if the secret env var is missing, 401 if the header is missing/wrong, null if OK.
 * If `bearer` is true, the header value must be "Bearer <secret>".
 */
export function checkSharedSecret(
  req: Request,
  secretName: string,
  headerName: string,
  bearer = false,
): Response | null {
  const expected = Deno.env.get(secretName);
  if (!expected) return json({ error: "Service unavailable" }, 503);
  let provided = req.headers.get(headerName) ?? "";
  if (bearer) {
    const m = /^Bearer ([^\s,]+)$/.exec(provided);
    provided = m?.[1] ?? "";
  }
  if (!provided || !timingSafeEqual(provided, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

/** Returns an error Response if the caller is not authorized, otherwise null. Fails closed. */
export function checkIntegrationSecret(req: Request): Response | null {
  return checkSharedSecret(req, "WHATSAPP_INTEGRATION_SECRET", "x-integration-secret");
}
