import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { toast } from "sonner";

interface DocumentViewerProps {
  fileUrl: string;
  title: string;
  backPath?: string;
}

export default function DocumentViewer({ fileUrl, title, backPath = "/" }: DocumentViewerProps) {
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [fileUrl]);

  const loadDocument = async () => {
    try {
      const response = await fetch(fileUrl);
      const text = await response.text();
      setContent(text);
    } catch (error) {
      console.error("Erro ao carregar documento:", error);
      toast.error("Erro ao carregar documento");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-roxo-suave/20 via-rosa-bebe/20 to-azul-claro/20">
      {/* Header - não imprime */}
      <header className="bg-gradient-to-r from-rosa-bebe via-roxo-suave to-azul-claro p-4 md:p-6 shadow-2xl print:hidden sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              onClick={() => navigate(backPath)}
              variant="outline"
              size="sm"
              className="bg-white/95 hover:bg-white shadow-lg font-rounded font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl md:text-2xl font-rounded font-bold text-white drop-shadow-lg flex-1 text-center hidden md:block">
              {title}
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="bg-white/95 hover:bg-white shadow-lg font-rounded font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="bg-white/95 hover:bg-white shadow-lg font-rounded font-semibold"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Documento tipo apresentação */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 print:p-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rosa-bebe via-roxo-suave to-azul-claro rounded-full animate-pulse" />
            <p className="text-xl text-muted-foreground font-rounded font-semibold">Carregando documento...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <article className="
              prose prose-lg max-w-none
              font-rounded
              
              prose-headings:font-rounded
              
              prose-h1:text-5xl prose-h1:md:text-6xl prose-h1:font-black prose-h1:text-center 
              prose-h1:mb-12 prose-h1:mt-8 prose-h1:p-8 prose-h1:rounded-3xl
              prose-h1:bg-gradient-to-r prose-h1:from-rosa-bebe prose-h1:via-roxo-suave prose-h1:to-azul-claro
              prose-h1:text-white prose-h1:shadow-2xl prose-h1:leading-tight
              
              prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 
              prose-h2:p-6 prose-h2:rounded-2xl prose-h2:shadow-xl
              prose-h2:bg-gradient-to-r prose-h2:from-azul-claro/30 prose-h2:to-verde-menta/30
              prose-h2:border-l-8 prose-h2:border-azul-claro
              prose-h2:text-azul-claro prose-h2:leading-tight
              
              prose-h3:text-2xl prose-h3:md:text-3xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4
              prose-h3:text-verde-menta prose-h3:pl-4 prose-h3:border-l-4 prose-h3:border-verde-menta/50
              
              prose-h4:text-xl prose-h4:md:text-2xl prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-3
              prose-h4:text-roxo-suave prose-h4:bg-roxo-suave/10 prose-h4:p-3 prose-h4:rounded-lg
              
              prose-p:text-lg prose-p:leading-relaxed prose-p:mb-4 prose-p:text-foreground/90
              prose-p:bg-white/50 prose-p:p-4 prose-p:rounded-xl prose-p:shadow-sm
              
              prose-strong:text-primary prose-strong:font-bold prose-strong:text-xl
              
              prose-em:italic prose-em:text-muted-foreground prose-em:text-base
              
              prose-a:text-azul-claro prose-a:font-semibold prose-a:underline prose-a:decoration-2
              hover:prose-a:text-roxo-suave hover:prose-a:decoration-4
              
              prose-ul:my-6 prose-ul:space-y-3 prose-ul:list-none
              prose-ul:bg-gradient-to-br prose-ul:from-rosa-bebe/10 prose-ul:to-amarelo-suave/10
              prose-ul:p-6 prose-ul:rounded-2xl prose-ul:shadow-lg
              
              prose-ol:my-6 prose-ol:space-y-3 prose-ol:list-none prose-ol:counter-reset-[item]
              prose-ol:bg-gradient-to-br prose-ol:from-verde-menta/10 prose-ol:to-azul-claro/10
              prose-ol:p-6 prose-ol:rounded-2xl prose-ol:shadow-lg
              
              prose-li:mb-3 prose-li:pl-12 prose-li:relative prose-li:text-lg
              prose-li:bg-white/60 prose-li:p-4 prose-li:rounded-xl prose-li:shadow-sm
              prose-li:before:content-['✨'] prose-li:before:absolute prose-li:before:left-4 
              prose-li:before:text-2xl prose-li:before:top-3
              
              prose-table:border-collapse prose-table:w-full prose-table:my-8 prose-table:shadow-2xl
              prose-table:rounded-2xl prose-table:overflow-hidden
              
              prose-thead:bg-gradient-to-r prose-thead:from-rosa-bebe prose-thead:to-azul-claro
              
              prose-th:p-5 prose-th:text-left prose-th:font-black prose-th:text-white
              prose-th:text-lg prose-th:border-0
              
              prose-td:p-5 prose-td:border-0 prose-td:text-base prose-td:bg-white/80
              
              prose-tr:even:bg-azul-claro/5
              
              prose-blockquote:border-l-8 prose-blockquote:border-verde-menta 
              prose-blockquote:pl-6 prose-blockquote:pr-6 prose-blockquote:py-4
              prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:font-medium
              prose-blockquote:bg-gradient-to-r prose-blockquote:from-verde-menta/20 prose-blockquote:to-azul-claro/20
              prose-blockquote:rounded-r-2xl prose-blockquote:shadow-xl prose-blockquote:text-lg
              
              prose-code:bg-amarelo-suave/50 prose-code:px-3 prose-code:py-1 
              prose-code:rounded-lg prose-code:text-base prose-code:font-semibold
              prose-code:border-2 prose-code:border-amarelo-suave
              
              prose-hr:border-0 prose-hr:h-2 prose-hr:my-12
              prose-hr:bg-gradient-to-r prose-hr:from-rosa-bebe prose-hr:via-roxo-suave prose-hr:to-azul-claro
              prose-hr:rounded-full prose-hr:shadow-lg
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </main>

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
