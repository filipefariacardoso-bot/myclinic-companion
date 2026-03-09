import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getSignedUrl } from "@/lib/storage";
import DocumentViewer from "@/components/DocumentViewer";

export default function ViewCartilha() {
  const { id } = useParams<{ id: string }>();
  const [cartilha, setCartilha] = useState<{ title: string; file_url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartilha();
  }, [id]);

  const loadCartilha = async () => {
    try {
      const { data, error } = await supabase
        .from("cartilhas")
        .select("title, file_url")
        .eq("id", id)
        .single();

      if (error) throw error;

      const signedUrl = await getSignedUrl(data.file_url, "cartilhas");
      setCartilha({ ...data, file_url: signedUrl });
    } catch (error) {
      console.error("Erro ao carregar cartilha:", error);
      toast.error("Erro ao carregar cartilha");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rosa-bebe/30 via-azul-claro/30 to-verde-menta/30">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rosa-bebe to-azul-claro rounded-full animate-pulse" />
          <p className="text-muted-foreground font-rounded">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!cartilha) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rosa-bebe/30 via-azul-claro/30 to-verde-menta/30">
        <div className="text-center">
          <p className="text-lg text-muted-foreground font-rounded">Cartilha não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <DocumentViewer
      fileUrl={cartilha.file_url}
      title={cartilha.title}
      backPath="/cartilhas"
    />
  );
}
