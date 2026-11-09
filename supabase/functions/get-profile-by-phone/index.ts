import { createClient } from "npm:@supabase/supabase-js@2";
import { checkIntegrationSecret, json } from "../_shared/integration-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const authError = checkIntegrationSecret(req);
  if (authError) return authError;

  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const phone = new URL(req.url).searchParams.get("phone")?.trim();
  if (!phone || phone.length < 8 || phone.length > 20) {
    return json({ error: "Parâmetro 'phone' inválido ou ausente" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("whatsapp_phone", phone)
    .maybeSingle();

  if (error) {
    console.error("get-profile-by-phone: query failed");
    return json({ error: "Erro interno" }, 500);
  }
  if (!data) return json({ error: "Perfil não encontrado" }, 404);

  const firstName = (data.full_name ?? "").trim().split(/\s+/)[0] ?? "";
  return json({ profile: { id: data.id, first_name: firstName } }, 200);
});
