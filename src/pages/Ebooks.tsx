import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/storage";
import { toast } from "sonner";

interface Ebook {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  file_url: string;
  cover_image_url: string | null;
  category: string | null;
  created_at: string;
}

export default function Ebooks() {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEbooks();
  }, []);

  const loadEbooks = async () => {
    try {
      const { data, error} = await supabase
        .from("ebooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEbooks(data || []);
    } catch (error) {
      console.error("Erro ao carregar e-books:", error);
      toast.error("Erro ao carregar e-books");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    navigate(`/ebooks/${id}`);
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast.error("Erro ao baixar arquivo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-roxo-suave/20 to-azul-claro/20">
      <header className="bg-gradient-to-r from-roxo-suave to-azul-claro p-6 rounded-b-3xl shadow-lg">
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
              📖
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Biblioteca de E-books</h1>
              <p className="text-sm text-muted-foreground">
                Conteúdos digitais sobre saúde infantil
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-roxo-suave to-azul-claro rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : ebooks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum e-book disponível</h3>
              <p className="text-muted-foreground">
                Em breve disponibilizaremos conteúdos digitais
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ebooks.map((ebook) => (
              <Card
                key={ebook.id}
                className="hover:shadow-lg transition-all border-2 border-roxo-suave/30 hover:border-roxo-suave"
              >
                {ebook.cover_image_url ? (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={ebook.cover_image_url}
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-roxo-suave/20 flex items-center justify-center rounded-t-lg">
                    <BookOpen className="w-16 h-16 text-roxo-suave" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{ebook.title}</CardTitle>
                  {ebook.author && (
                    <p className="text-sm text-muted-foreground">Por {ebook.author}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {ebook.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {ebook.description}
                    </p>
                  )}
                  {ebook.category && (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-roxo-suave/20 text-roxo-suave">
                      {ebook.category}
                    </span>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleView(ebook.id)}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ler
                    </Button>
                    <Button
                      onClick={() => handleDownload(ebook.file_url, ebook.title)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
