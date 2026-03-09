import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido (mínimo 10 dígitos)").regex(/^\(?\d{2}\)?[\s\-]?\d{4,5}[\s\-]?\d{4}$/, "Formato inválido. Ex: (75) 99999-9999"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

type View = "login" | "signup";

export default function Auth() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (view === "login") {
        const validatedData = loginSchema.parse({ email, password });
        const { error } = await signIn(validatedData.email, validatedData.password);
        if (!error) {
          navigate("/");
        }
      } else {
        const validatedData = signupSchema.parse({ email, password, fullName, phone, confirmPassword });
        const { error } = await signUp(validatedData.email, validatedData.password, validatedData.fullName);
        if (!error) {
          // Save phone to profile after signup
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("profiles").update({ phone: validatedData.phone }).eq("id", user.id);
          }
          setView("login");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-azul-claro via-background to-rosa-bebe p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-2 border-azul-claro/30">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-rosa-bebe rounded-full flex items-center justify-center text-4xl shadow-lg">
            🏥
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">CuidarBem Pediatria</h1>
          <p className="text-muted-foreground">Cuidado especializado para seu filho</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-2 border-azul-claro/30 focus:border-primary"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>
          )}

          {view === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone / WhatsApp <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(XX) XXXXX-XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-2 border-azul-claro/30 focus:border-primary"
              />
              {errors.phone ? (
                <p className="text-sm text-destructive">{errors.phone}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Obrigatório para receber confirmações de consulta
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-azul-claro/30 focus:border-primary"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              {view === "login" && (
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-azul-claro/30 focus:border-primary"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {view === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-2 border-azul-claro/30 focus:border-primary"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-azul-claro hover:opacity-90 text-white font-semibold py-6"
          >
            {view === "login" ? "Entrar" : "Cadastrar"}
          </Button>

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => { setView(view === "login" ? "signup" : "login"); setErrors({}); }}
              className="text-primary hover:underline text-sm"
            >
              {view === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
