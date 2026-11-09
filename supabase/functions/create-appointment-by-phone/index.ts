import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { checkIntegrationSecret, json } from "../_shared/integration-auth.ts";

const APPOINTMENT_TYPES = [
  "Consulta Pediátrica",
  "Consulta Gastro/Hepato Pediátrica",
  "Retorno",
  "Consulta de Urgência",
] as const;

const BodySchema = z.object({
  phone: z.string().trim().min(8).max(20),
  patient_name: z.string().trim().min(1).max(120),
  appointment_date: z.string().refine((v) => {
    const d = new Date(v);
    return /^\d{4}-\d{2}-\d{2}T/.test(v) && !isNaN(d.getTime()) && d.getTime() > Date.now();
  }, "appointment_date deve ser uma data ISO válida no futuro"),
  appointment_type: z.enum(APPOINTMENT_TYPES),
  notes: z.string().max(1000).optional().nullable(),
});

function formatBrasilia(d: Date): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${g("day")}/${g("month")}/${g("year")} às ${g("hour")}:${g("minute")}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const authError = checkIntegrationSecret(req);
  if (authError) return authError;

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: parsed.error.flatten().fieldErrors }, 400);
  }
  const { phone, patient_name, appointment_type, notes } = parsed.data;
  const appointmentDate = new Date(parsed.data.appointment_date);
  const isoDate = appointmentDate.toISOString();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("whatsapp_phone", phone)
    .maybeSingle();

  if (profileError) {
    console.error("create-appointment-by-phone: profile lookup failed");
    return json({ error: "Erro interno" }, 500);
  }
  if (!profile) return json({ error: "Perfil não encontrado" }, 404);

  // Slot conflict check (any non-cancelled appointment at the same time)
  const { data: conflicts, error: conflictError } = await supabase
    .from("appointments")
    .select("id")
    .eq("appointment_date", isoDate)
    .neq("status", "cancelled")
    .limit(1);

  if (conflictError) {
    console.error("create-appointment-by-phone: conflict check failed");
    return json({ error: "Erro interno" }, 500);
  }
  if (conflicts && conflicts.length > 0) {
    return json({ error: "Horário já ocupado" }, 409);
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      user_id: profile.id,
      patient_name,
      appointment_date: isoDate,
      appointment_type,
      notes: notes || null,
      status: "scheduled",
    })
    .select("id, appointment_date, appointment_type, status")
    .single();

  if (appointmentError) {
    console.error("create-appointment-by-phone: insert failed");
    return json({ error: "Erro interno" }, 500);
  }

  // Same in-app notification the scheduling page creates
  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: profile.id,
    title: "Nova Solicitação de Consulta",
    message: `Paciente: ${patient_name} | ${appointment_type} | ${formatBrasilia(appointmentDate)}`,
    type: "appointment",
  });
  if (notifError) console.error("create-appointment-by-phone: notification insert failed");

  return json({ appointment }, 201);
});
