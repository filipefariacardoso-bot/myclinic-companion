import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkSharedSecret, json } from "../_shared/integration-auth.ts";

// Called only by the managed scheduler (Authorization: Bearer <LOVABLE_CRON_SECRET>). No CORS.
serve(async (req) => {
  const authError = checkSharedSecret(req, 'LOVABLE_CRON_SECRET', 'authorization', true);
  if (authError) return authError;

  try {
    const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL');
    if (!RESEND_FROM_EMAIL) {
      console.error('send-appointment-reminder: configuração pendente — secret RESEND_FROM_EMAIL não definido; nenhum e-mail enviado.');
      return json({ error: 'Email sender not configured' }, 503);
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');
    if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find appointments happening in the next 24-25 hours (window to avoid duplicate sends)
    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23h from now
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // 25h from now

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_name,
        appointment_date,
        appointment_type,
        notes,
        user_id,
        status
      `)
      .gte('appointment_date', windowStart.toISOString())
      .lte('appointment_date', windowEnd.toISOString())
      .in('status', ['scheduled', 'confirmed']);

    if (error) throw error;
    if (!appointments || appointments.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: 'No appointments in window' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let sentCount = 0;

    for (const appointment of appointments) {
      // Get client email from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', appointment.user_id)
        .single();

      if (!profile?.email) {
        console.log(`No email for appointment ${appointment.id}, skipping reminder`);
        continue;
      }

      const date = new Date(appointment.appointment_date);
      const formattedDate = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo',
      });
      const formattedTime = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      });

      // Sanitize values to prevent HTML injection
      const safeName = (profile.full_name || 'responsável').replace(/[<>&"']/g, (c) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
      }[c] || c));
      const safePatientName = (appointment.patient_name || '').replace(/[<>&"']/g, (c) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
      }[c] || c));
      const safeAppointmentType = (appointment.appointment_type || '').replace(/[<>&"']/g, (c) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
      }[c] || c));

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: [profile.email],
          subject: `🔔 Lembrete: Consulta amanhã — ${formattedTime}h`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background: linear-gradient(135deg, #f9a8d4, #c4b5fd); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🔔</div>
                <h1 style="color: white; margin: 0; font-size: 24px;">Lembrete de Consulta</h1>
                <p style="color: white; margin: 8px 0 0; opacity: 0.9;">Sua consulta é amanhã!</p>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <p style="color: #374151; font-size: 16px; margin-top: 0;">Olá, <strong>${safeName}</strong>! 😊</p>
                <p style="color: #374151; font-size: 15px;">Este é um lembrete que você tem uma consulta <strong>amanhã</strong>. Confira os detalhes:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%;">👩‍⚕️ Médica</td>
                    <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">Dra. Michelle Caires</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">👤 Paciente</td>
                    <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">${safePatientName}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">📆 Data</td>
                    <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px; text-transform: capitalize;">${formattedDate}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">🕐 Horário</td>
                    <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">${formattedTime}h (Horário de Brasília)</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">🩺 Tipo</td>
                    <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">${safeAppointmentType}</td>
                  </tr>
                </table>

                <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin-top: 8px; border-left: 4px solid #22c55e;">
                  <p style="margin: 0; color: #15803d; font-size: 13px; font-weight: 600;">✅ Dicas para sua consulta:</p>
                  <ul style="margin: 8px 0 0; color: #166534; font-size: 13px; padding-left: 20px;">
                    <li>Chegue com 10 minutos de antecedência</li>
                    <li>Traga a carteirinha de vacinação da criança</li>
                    <li>Leve exames anteriores, se houver</li>
                  </ul>
                </div>

                <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">Em caso de imprevistos, entre em contato com a clínica o quanto antes para cancelar ou remarcar.</p>
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">Clínica CuidarBem — Sistema de Agendamentos</p>
            </div>
          `,
        }),
      });

      if (emailRes.ok) {
        sentCount++;
        console.log(`Reminder sent to appointment ${appointment.id}`);
      } else {
        const err = await emailRes.text();
        console.error(`Failed to send reminder for appointment ${appointment.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ success: true, sent: sentCount, total: appointments.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Log details server-side only; return a generic message to the caller
    console.error('Error in reminder function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
