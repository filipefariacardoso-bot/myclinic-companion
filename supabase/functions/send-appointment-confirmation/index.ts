import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RECIPIENT = "vivalumirecepcao@gmail.com";

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      patient_name,
      patient_phone,
      appointment_date,
      appointment_time,
      appointment_type,
      specialty_or_professional,
      notes,
      action, // "created" | "updated"
    } = body ?? {};

    if (!patient_name || !appointment_date) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios ausentes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dateLabel = escapeHtml(appointment_date);
    const timeLabel = escapeHtml(appointment_time ?? "");
    const verb = action === "updated" ? "Atualização" : "Confirmação";
    const subject = `${verb} de Agendamento - ${patient_name} - ${appointment_date}${appointment_time ? " " + appointment_time : ""}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6b46c1;">${escapeHtml(verb)} de Agendamento</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Paciente:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(patient_name)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Telefone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(patient_phone ?? "—")}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Data:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${dateLabel}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Horário:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${timeLabel || "—"}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tipo:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(appointment_type ?? "—")}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Especialidade/Profissional:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(specialty_or_professional ?? "—")}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: top;"><strong>Observações:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; white-space: pre-wrap;">${escapeHtml(notes ?? "—")}</td></tr>
        </table>
        <p style="margin-top: 24px; color: #666; font-size: 12px;">Email automático — Lumi Clínica Pediátrica</p>
      </div>
    `;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Lumi Agenda <onboarding@resend.dev>",
        to: [RECIPIENT],
        subject,
        html,
      }),
    });

    const result = await resp.json();
    if (!resp.ok) {
      console.error("Resend error", result);
      return new Response(JSON.stringify({ error: result?.message || "Falha ao enviar email", details: result }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});