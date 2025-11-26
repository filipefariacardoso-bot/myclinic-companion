import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, FileText, MapPin, Heart, Users } from "lucide-react";

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isAdmin) {
    navigate("/admin");
    return null;
  }

  return (
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

          <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-rosa-bebe/30 hover:border-rosa-bebe">
            <CardHeader className="bg-rosa-bebe/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rosa-bebe rounded-full flex items-center justify-center text-2xl">
                  💰
                </div>
                <CardTitle>Serviços e Preços</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Consultas, exames e procedimentos
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-verde-menta/30 hover:border-verde-menta">
            <CardHeader className="bg-verde-menta/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-verde-menta rounded-full flex items-center justify-center text-2xl">
                  📚
                </div>
                <CardTitle>Cartilha</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Dicas para antes, durante e após a consulta
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-amarelo-suave/30 hover:border-amarelo-suave">
            <CardHeader className="bg-amarelo-suave/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amarelo-suave rounded-full flex items-center justify-center text-2xl">
                  📍
                </div>
                <CardTitle>Localização</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Como chegar na clínica
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-roxo-suave/30 hover:border-roxo-suave">
            <CardHeader className="bg-roxo-suave/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-roxo-suave rounded-full flex items-center justify-center text-2xl">
                  💳
                </div>
                <CardTitle>Pagamento PIX</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Faça seu pagamento de forma rápida
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-laranja-suave/30 hover:border-laranja-suave">
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
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Onde Estamos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                Av. Artemia Postes, 8220
              </p>
              <p className="text-sm text-muted-foreground">
                Horário: Segunda a Sexta, 8h às 18h
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-success" />
                Próxima Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                Você não tem consultas agendadas
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Agendar Consulta
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}