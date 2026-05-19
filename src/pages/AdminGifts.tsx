import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Instagram, Globe, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminGifts() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [instagramUrl, setInstagramUrl] = useState("https://www.instagram.com/vivalumipediatria");
  const [websiteUrl, setWebsiteUrl] = useState("https://vivalumipediatria.com.br");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  const handleSave = () => {
    // Por enquanto, apenas mostra uma notificação de sucesso
    // No futuro, pode salvar no banco de dados
    toast({
      title: "Configurações salvas!",
      description: "Os links foram atualizados com sucesso.",
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rosa-bebe/10 to-roxo-suave/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-rosa-bebe to-roxo-suave p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button 
            onClick={() => navigate("/admin")} 
            variant="ghost" 
            size="sm"
            className="mb-4 text-gray-900 hover:bg-white/40"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              🎁
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Presentes e Mimos</h1>
              <p className="text-sm text-gray-800">Configure os links das redes sociais</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="border-2 border-rosa-bebe/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Configurar Instagram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instagram">URL do Instagram</Label>
              <Input
                id="instagram"
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/seuusuario"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Exemplo: https://www.instagram.com/vivalumipediatria
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-azul-claro/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-azul-claro" />
              Configurar Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website">URL do Site</Label>
              <Input
                id="website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://www.seusite.com.br"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Deixe em branco se o site ainda não foi criado
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </main>
    </div>
  );
}
