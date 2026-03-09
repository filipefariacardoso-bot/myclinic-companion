import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/storage";
import { toast } from "sonner";

interface Cartilha {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  created_at: string;
}

export default function Cartilhas() {
  const navigate = useNavigate();
  const [cartilhas, setCartilhas] = useState<Cartilha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartilhas();
  }, []);

  const loadCartilhas = async () => {
    try {
      const { data, error } = await supabase
        .from("cartilhas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCartilhas(data || []);
    } catch (error) {
      console.error("Erro ao carregar cartilhas:", error);
      toast.error("Erro ao carregar cartilhas");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (id: string) => {
    navigate(`/cartilhas/${id}`);
  };

  const handleDownloadFile = async (fileUrl: string, title: string) => {
    try {
      const signedUrl = await getSignedUrl(fileUrl, "cartilhas");
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast.error("Erro ao baixar arquivo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-verde-menta/20 to-amarelo-suave/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-verde-menta to-amarelo-suave p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              📚
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cartilhas Informativas</h1>
              <p className="text-sm text-muted-foreground">
                Materiais educativos sobre saúde infantil
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-verde-menta to-amarelo-suave rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando cartilhas...</p>
          </div>
        ) : cartilhas.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma cartilha disponível</h3>
              <p className="text-muted-foreground">
                Em breve disponibilizaremos materiais educativos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartilhas.map((cartilha) => (
              <Card
                key={cartilha.id}
                className="hover:shadow-lg transition-all border-2 border-verde-menta/30 hover:border-verde-menta"
              >
                <CardHeader className="bg-verde-menta/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-verde-menta rounded-full flex items-center justify-center text-2xl">
                      📄
                    </div>
                    <CardTitle className="text-lg">{cartilha.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {cartilha.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {cartilha.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewFile(cartilha.id)}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button
                      onClick={() => handleDownloadFile(cartilha.file_url, cartilha.title)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Adicionado em {new Date(cartilha.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
