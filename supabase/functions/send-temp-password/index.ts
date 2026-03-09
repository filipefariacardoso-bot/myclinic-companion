import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;

  let pwd = "";
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 0; i < 5; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  // Shuffle
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "E-mail obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user exists
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.users.find((u) => u.email === email);
    if (!user) {
      // Return success anyway to avoid email enumeration
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newPassword = generatePassword();

    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateError) throw updateError;

    // Send email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY não configurada");

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CuidarBem Pediatria <onboarding@resend.dev>",
        to: [email],
        subject: "🔑 Sua nova senha - CuidarBem Pediatria",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">🏥</div>
              <h1 style="color: #1d4ed8; font-size: 22px; margin: 8px 0;">CuidarBem Pediatria</h1>
            </div>
            <h2 style="color: #111827; font-size: 18px;">Sua nova senha foi gerada</h2>
            <p style="color: #6b7280; font-size: 15px;">Recebemos sua solicitação de recuperação de acesso. Sua nova senha temporária é:</p>
            <div style="background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1d4ed8; font-family: monospace;">${newPassword}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Acesse o sistema com esta senha e altere-a nas configurações de perfil assim que entrar.</p>
            <div style="text-align: center; margin-top: 28px;">
              <a href="https://myclinic-companion.lovable.app/auth" style="background: #1d4ed8; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">Acessar o sistema</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">Se você não solicitou esta recuperação, ignore este e-mail.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      throw new Error(`Erro ao enviar e-mail: ${errText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
