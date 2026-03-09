import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check URL hash for recovery token FIRST (before any async calls)
    const hash = window.location.hash;
    const isRecoveryLink =
      hash.includes("type=recovery") ||
      hash.includes("access_token");

    // Register listener BEFORE getSession so we don't miss events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
        setChecking(false);
      } else if (event === "SIGNED_IN" && session) {
        setSessionReady(true);
        setChecking(false);
      } else if (event === "SIGNED_OUT") {
        setSessionReady(false);
        setChecking(false);
      }
    });

    // Check existing session (covers case where token was processed before mount)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
        setChecking(false);
      } else if (isRecoveryLink) {
        // Hash present but session not yet established — keep checking briefly
        // Supabase SDK will process the hash and fire onAuthStateChange
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s) setSessionReady(true);
            setChecking(false);
          });
        }, 1500);
      } else {
        setChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({ variant: "destructive", title: "Senha muito curta", description: "A senha deve ter pelo menos 8 caracteres." });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Erro", description: "As senhas não coincidem." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      let description = error.message;
      if (error.message.includes("same password")) {
        description = "A nova senha não pode ser igual à senha atual.";
      } else if (error.message.includes("weak") || error.message.includes("pwned") || error.message.includes("breached")) {
        description = "Esta senha é muito comum ou fraca. Use letras, números e símbolos.";
      } else if (error.message.includes("session") || error.message.includes("Auth") || error.message.includes("missing")) {
        description = "Sessão expirada. Solicite um novo link de recuperação de senha.";
      }
      toast({ variant: "destructive", title: "Erro ao redefinir senha", description });
    } else {
      toast({ title: "Senha redefinida! ✅", description: "Sua senha foi atualizada com sucesso." });
      await supabase.auth.signOut();
      navigate("/auth");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-azul-claro via-background to-rosa-bebe p-4">
        <Card className="w-full max-w-md p-8 shadow-xl border-2 border-azul-claro/30 text-center">
          <p className="text-muted-foreground">Verificando link de recuperação...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-azul-claro via-background to-rosa-bebe p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-2 border-azul-claro/30">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-rosa-bebe rounded-full flex items-center justify-center text-4xl shadow-lg">
            🔐
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Nova Senha</h1>
          <p className="text-muted-foreground">Digite sua nova senha abaixo</p>
        </div>

        {sessionReady ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              🔑 Use uma senha com <strong>pelo menos 8 caracteres</strong>, misturando letras e números. Evite senhas simples como "123456".
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="border-2 border-azul-claro/30 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="border-2 border-azul-claro/30 focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-azul-claro hover:opacity-90 text-white font-semibold py-6"
            >
              {loading ? "Salvando..." : "Salvar Nova Senha"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Link inválido ou expirado. Solicite um novo link de recuperação de senha.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="border-azul-claro/30"
            >
              Voltar ao Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
