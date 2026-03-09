import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const { patientName, appointmentDate, appointmentType, notes, clientEmail } = await req.json();

    // Format date in Brazilian Portuguese
    const date = new Date(appointmentDate);
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

    // 1. Send notification to clinic
    const clinicEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Clínica CuidarBem <onboarding@resend.dev>',
        to: ['michellecaires2@hotmail.com'],
        subject: `📅 Novo Agendamento: ${patientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #93c5fd, #6ee7b7); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📅 Novo Agendamento</h1>
              <p style="color: white; margin: 8px 0 0; opacity: 0.9;">Clínica CuidarBem</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <p style="color: #374151; font-size: 16px; margin-top: 0;">Dra. Michelle, um novo agendamento foi realizado:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%;">👤 Paciente</td>
                  <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">${patientName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">📆 Data</td>
                  <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px; text-transform: capitalize;">${formattedDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">🕐 Horário</td>
                  <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">${formattedTime}h (Horário de Brasília)</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">🩺 Tipo</td>
                  <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">${appointmentType}</td>
                </tr>
                ${notes ? `
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px; vertical-align: top;">📝 Observações</td>
                  <td style="padding: 12px 0; color: #374151; font-size: 14px;">${notes}</td>
                </tr>
                ` : ''}
              </table>

              <div style="background: #eff6ff; border-radius: 12px; padding: 16px; margin-top: 16px;">
                <p style="margin: 0; color: #1d4ed8; font-size: 13px;">💡 Acesse o sistema para confirmar ou gerenciar este agendamento.</p>
              </div>
            </div>
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">Clínica CuidarBem — Sistema de Agendamentos</p>
          </div>
        `,
      }),
    });

    if (!clinicEmailRes.ok) {
      const err = await clinicEmailRes.text();
      console.error('Clinic email error:', err);
    }

    // 2. Send confirmation to client (if email provided)
    if (clientEmail) {
      const clientEmailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Clínica CuidarBem <onboarding@resend.dev>',
          to: [clientEmail],
          subject: `✅ Consulta agendada — ${formattedDate.split(',')[0]}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background: linear-gradient(135deg, #93c5fd, #6ee7b7); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                <h1 style="color: white; margin: 0; font-size: 24px;">Consulta Agendada!</h1>
                <p style="color: white; margin: 8px 0 0; opacity: 0.9;">Clínica CuidarBem</p>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <p style="color: #374151; font-size: 16px; margin-top: 0;">Olá! Sua consulta foi agendada com sucesso. Confira os detalhes:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%;">👩‍⚕️ Médica</td>
                    <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">Dra. Michelle Caires</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">👤 Paciente</td>
                    <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">${patientName}</td>
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
                    <td style="padding: 12px 0; color: #111827; font-weight: 600; font-size: 14px;">${appointmentType}</td>
                  </tr>
                </table>

                <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-top: 16px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">⚠️ Aguarde a confirmação da clínica.</p>
                  <p style="margin: 6px 0 0; color: #78350f; font-size: 13px;">Em caso de dúvidas ou necessidade de cancelamento, entre em contato com a clínica.</p>
                </div>
                
                <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">Você receberá um lembrete 24 horas antes da sua consulta. 😊</p>
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">Clínica CuidarBem — Sistema de Agendamentos</p>
            </div>
          `,
        }),
      });

      if (!clientEmailRes.ok) {
        const err = await clientEmailRes.text();
        console.error('Client confirmation email error:', err);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
