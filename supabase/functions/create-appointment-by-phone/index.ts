import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { phone, patient_name, appointment_date, appointment_type, notes } = body as Record<string, string>;

  if (!phone || !patient_name || !appointment_date || !appointment_type) {
    return new Response(
      JSON.stringify({ error: "Campos obrigatórios: phone, patient_name, appointment_date, appointment_type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find user by whatsapp_phone
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("whatsapp_phone", phone.trim())
    .maybeSingle();

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!profile) {
    return new Response(JSON.stringify({ error: "Perfil não encontrado para este número de WhatsApp" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Create appointment
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      user_id: profile.id,
      patient_name,
      appointment_date,
      appointment_type,
      notes: notes || null,
      status: "confirmed",
    })
    .select()
    .single();

  if (appointmentError) {
    return new Response(JSON.stringify({ error: appointmentError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ appointment }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
