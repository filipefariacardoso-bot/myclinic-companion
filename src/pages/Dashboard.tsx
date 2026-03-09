import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ConsentDialog from "@/components/ConsentDialog";

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConsent();
  }, [user]);

  const checkConsent = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("consent_given")
        .eq("id", user.id)
        .single();

      if (!error && data && !data.consent_given) {
        setShowConsent(true);
      }
    } catch (error) {
      console.error("Erro ao verificar consentimento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isAdmin) {
    navigate("/admin");
    return null;
  }

  if (loading) {
    return null;
  }

  return (
    <>
      <ConsentDialog 
        open={showConsent} 
        onConsentGiven={() => setShowConsent(false)} 
      />
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-rosa-bebe/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-azul-claro to-rosa-bebe p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              🏥
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">CuidarBem Pediatria</h1>
              <p className="text-sm text-muted-foreground">Olá, {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white"
            >
              <User className="w-4 h-4 mr-2" />
              Perfil
            </Button>
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm"
              className="bg-white/90 hover:bg-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-verde-menta to-amarelo-suave border-2 border-verde-menta/30">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo! 👋</h2>
            <p className="text-muted-foreground">
              Estamos prontos para cuidar da saúde do seu pequeno
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-azul-claro/30 hover:border-azul-claro"
            onClick={() => navigate("/questionnaire")}
          >
            <CardHeader className="bg-azul-claro/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-azul-claro rounded-full flex items-center justify-center text-2xl">
                  📋
                </div>
                <CardTitle>Questionário Médico</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Preencha as informações de saúde da criança
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-verde-menta/30 hover:border-verde-menta"
            onClick={() => navigate("/cartilhas")}
          >
            <CardHeader className="bg-verde-menta/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-verde-menta rounded-full flex items-center justify-center text-2xl">
                  📚
                </div>
                <CardTitle>Cartilhas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Materiais educativos sobre saúde infantil
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-roxo-suave/30 hover:border-roxo-suave"
            onClick={() => navigate("/ebooks")}
          >
            <CardHeader className="bg-roxo-suave/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-roxo-suave rounded-full flex items-center justify-center text-2xl">
                  📖
                </div>
                <CardTitle>E-books</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Biblioteca digital de saúde infantil
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-rosa-bebe/30 hover:border-rosa-bebe"
            onClick={() => navigate("/partners")}
          >
            <CardHeader className="bg-rosa-bebe/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rosa-bebe rounded-full flex items-center justify-center text-2xl">
                  🤝
                </div>
                <CardTitle>Parceiros</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Profissionais e colaboradores
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-amarelo-suave/30 hover:border-amarelo-suave"
            onClick={() => navigate("/location")}
          >
            <CardHeader className="bg-amarelo-suave/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amarelo-suave rounded-full flex items-center justify-center text-2xl">
                  📍
                </div>
                <CardTitle>Localização/Contato</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Como chegar e falar conosco
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-rosa-bebe/30 hover:border-rosa-bebe"
            onClick={() => navigate("/gifts")}
          >
            <CardHeader className="bg-rosa-bebe/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rosa-bebe rounded-full flex items-center justify-center text-2xl">
                  🎁
                </div>
                <CardTitle>Presentes e Mimos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Nossas redes sociais
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-azul-claro/30 hover:border-azul-claro"
            onClick={() => navigate("/schedule")}
          >
            <CardHeader className="bg-azul-claro/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-azul-claro rounded-full flex items-center justify-center text-2xl">
                  📆
                </div>
                <CardTitle>Agendar Consulta</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Escolha data e horário com a Dra. Michelle Caires
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-azul-claro/30 hover:border-azul-claro"
            onClick={() => navigate("/appointments")}
          >
            <CardHeader className="bg-azul-claro/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-azul-claro rounded-full flex items-center justify-center text-2xl">
                  📅
                </div>
                <CardTitle>Minhas Consultas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Veja suas consultas agendadas
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-verde-menta/30 hover:border-verde-menta"
            onClick={() => navigate("/payment")}
          >
            <CardHeader className="bg-verde-menta/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-verde-menta rounded-full flex items-center justify-center text-2xl">
                  💳
                </div>
                <CardTitle>Pagamento</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Informações para pagamento
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-laranja-suave/30 hover:border-laranja-suave"
            onClick={() => navigate("/satisfaction")}
          >
            <CardHeader className="bg-laranja-suave/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-laranja-suave rounded-full flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <CardTitle>Avaliação</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Avalie nosso atendimento
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-azul-claro/30 hover:border-azul-claro"
            onClick={() => navigate("/exam-results")}
          >
            <CardHeader className="bg-azul-claro/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-azul-claro rounded-full flex items-center justify-center text-2xl">
                  🔬
                </div>
                <CardTitle>Resultado de Exames</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Veja seus resultados de exames
              </p>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
    </>
  );
}