import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ variant: "destructive", title: "Atenção", description: "Digite seu e-mail para recuperar a senha." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://myclinic-companion.lovable.app/reset-password",
    });
    setLoading(false);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-azul-claro via-background to-rosa-bebe p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-2 border-azul-claro/30">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-rosa-bebe rounded-full flex items-center justify-center text-4xl shadow-lg">
            🔑
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Recuperar Senha</h1>
          <p className="text-muted-foreground">CuidarBem Pediatria</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="rounded-lg bg-muted border border-border p-4">
              <p className="text-foreground font-medium">✅ E-mail enviado!</p>
              <p className="text-muted-foreground text-sm mt-1">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="w-full border-azul-claro/30"
            >
              Voltar ao Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Digite o e-mail cadastrado e enviaremos um link para você criar uma nova senha.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="border-2 border-azul-claro/30 focus:border-primary"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-azul-claro hover:opacity-90 text-gray-900 font-semibold py-6"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="text-primary hover:underline text-sm"
              >
                Voltar ao login
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
