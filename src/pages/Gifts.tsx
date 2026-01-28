import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Instagram, Globe } from "lucide-react";

export default function Gifts() {
  const navigate = useNavigate();

  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/vivalumipediatria", "_blank");
  };

  const handleWebsiteClick = () => {
    // Site ainda será criado
    window.open("https://vivalumipediatria.com.br", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rosa-bebe/20 to-roxo-suave/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-rosa-bebe to-roxo-suave p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button 
            onClick={() => navigate("/")} 
            variant="ghost" 
            size="sm"
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              🎁
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Presentes e Mimos</h1>
              <p className="text-sm text-white/90">Confira nossas redes sociais</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <Card className="bg-gradient-to-r from-rosa-bebe/30 to-roxo-suave/30 border-2 border-rosa-bebe/30">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">✨ Confira nossos presentes e mimos especiais!</h2>
            <p className="text-muted-foreground">
              Acompanhe nossas redes sociais para ficar por dentro das novidades
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Instagram Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-pink-400/30 hover:border-pink-400"
            onClick={handleInstagramClick}
          >
            <CardHeader className="bg-gradient-to-r from-pink-500/20 to-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Instagram</CardTitle>
                  <p className="text-sm text-muted-foreground">@vivalumipediatria</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Siga nosso Instagram para ver fotos, dicas de saúde infantil e muito mais!
              </p>
              <Button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                <Instagram className="w-4 h-4 mr-2" />
                Seguir no Instagram
              </Button>
            </CardContent>
          </Card>

          {/* Website Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-azul-claro/30 hover:border-azul-claro"
            onClick={handleWebsiteClick}
          >
            <CardHeader className="bg-azul-claro/20">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-azul-claro rounded-full flex items-center justify-center shadow-md">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Site Oficial</CardTitle>
                  <p className="text-sm text-muted-foreground">Em breve!</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                Visite nosso site para mais informações sobre a clínica e nossos serviços.
              </p>
              <Button className="w-full mt-4" variant="outline">
                <Globe className="w-4 h-4 mr-2" />
                Visitar Site
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
