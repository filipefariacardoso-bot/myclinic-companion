import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DocumentViewer from "@/components/DocumentViewer";

export default function ViewEbook() {
  const { id } = useParams<{ id: string }>();
  const [ebook, setEbook] = useState<{ title: string; file_url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEbook();
  }, [id]);

  const loadEbook = async () => {
    try {
      const { data, error } = await supabase
        .from("ebooks")
        .select("title, file_url")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEbook(data);
    } catch (error) {
      console.error("Erro ao carregar e-book:", error);
      toast.error("Erro ao carregar e-book");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-roxo-suave/30 via-azul-claro/30 to-rosa-bebe/30">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-roxo-suave to-azul-claro rounded-full animate-pulse" />
          <p className="text-muted-foreground font-rounded">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-roxo-suave/30 via-azul-claro/30 to-rosa-bebe/30">
        <div className="text-center">
          <p className="text-lg text-muted-foreground font-rounded">E-book não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <DocumentViewer
      fileUrl={ebook.file_url}
      title={ebook.title}
      backPath="/ebooks"
    />
  );
}
