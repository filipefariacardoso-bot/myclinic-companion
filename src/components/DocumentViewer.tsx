import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-gradient-to-br from-rosa-bebe/30 via-azul-claro/30 to-verde-menta/30">
      {/* Header - não imprime */}
      <header className="bg-gradient-to-r from-rosa-bebe to-azul-claro p-6 rounded-b-3xl shadow-lg print:hidden sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              onClick={() => navigate(backPath)}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Documento */}
      <main className="max-w-4xl mx-auto p-6 print:p-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rosa-bebe to-azul-claro rounded-full animate-pulse" />
            <p className="text-muted-foreground font-rounded">Carregando documento...</p>
          </div>
        ) : (
          <Card className="p-8 md:p-12 bg-white/95 backdrop-blur shadow-xl border-4 border-rosa-bebe/30 rounded-3xl print:shadow-none print:border-0">
            <article className="prose prose-lg max-w-none
              prose-headings:font-rounded prose-headings:text-primary
              prose-h1:text-4xl prose-h1:font-bold prose-h1:text-center prose-h1:mb-8 prose-h1:text-rosa-bebe
              prose-h2:text-3xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-azul-claro prose-h2:border-b-4 prose-h2:border-verde-menta/30 prose-h2:pb-2
              prose-h3:text-2xl prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-verde-menta
              prose-p:text-base prose-p:leading-relaxed prose-p:mb-4 prose-p:text-foreground
              prose-strong:text-primary prose-strong:font-semibold
              prose-a:text-azul-claro prose-a:no-underline hover:prose-a:underline
              prose-ul:my-4 prose-ul:list-none
              prose-li:mb-2 prose-li:pl-6 prose-li:relative
              prose-li:before:content-['🌟'] prose-li:before:absolute prose-li:before:left-0
              prose-table:border-collapse prose-table:w-full prose-table:my-6
              prose-th:bg-rosa-bebe/20 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border-2 prose-th:border-rosa-bebe/30
              prose-td:p-3 prose-td:border-2 prose-td:border-azul-claro/20
              prose-tr:even:bg-azul-claro/10
              prose-blockquote:border-l-4 prose-blockquote:border-verde-menta prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-verde-menta/10 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
              prose-code:bg-amarelo-suave/30 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-hr:border-rosa-bebe/30 prose-hr:my-8
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
          </Card>
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
