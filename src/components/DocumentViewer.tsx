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
  const [isPDF, setIsPDF] = useState(false);
  const [isMarkdown, setIsMarkdown] = useState(false);

  useEffect(() => {
    const urlLower = fileUrl.toLowerCase();
    const pdf = urlLower.endsWith(".pdf") || urlLower.includes(".pdf?");
    const md = urlLower.endsWith(".md") || urlLower.endsWith(".markdown");

    setIsPDF(pdf);
    setIsMarkdown(md);

    if (md) {
      loadDocument();
    } else {
      setLoading(false);
    }
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

  const handleOpenNewTab = () => {
    window.open(fileUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rosa-bebe/30 via-roxo-suave/30 via-azul-claro/30 to-verde-menta/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-rosa-bebe/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-azul-claro/20 rounded-full blur-3xl translate-x-1/2" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-verde-menta/20 rounded-full blur-3xl translate-y-1/2" />
      
      {/* Header - não imprime */}
      <header className="bg-white/80 backdrop-blur-xl border-b-4 border-rosa-bebe/30 p-4 md:p-6 shadow-2xl print:hidden sticky top-0 z-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              onClick={() => navigate(backPath)}
              variant="outline"
              size="lg"
              className="bg-gradient-to-r from-rosa-bebe to-roxo-suave text-white border-0 hover:shadow-2xl hover:scale-105 transition-all font-rounded font-bold text-base shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl md:text-3xl font-rounded font-black bg-gradient-to-r from-rosa-bebe via-roxo-suave to-azul-claro bg-clip-text text-transparent flex-1 text-center hidden md:block drop-shadow-sm">
              {title}
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-azul-claro to-verde-menta text-white border-0 hover:shadow-2xl hover:scale-105 transition-all font-rounded font-bold text-base shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-verde-menta to-amarelo-suave text-white border-0 hover:shadow-2xl hover:scale-105 transition-all font-rounded font-bold text-base shadow-lg"
              >
                <Printer className="w-5 h-5 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Documento tipo revista digital ou visualização simples de PDF */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 print:p-8 relative z-10" id="pdf-container">
        {loading ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-rosa-bebe via-roxo-suave to-azul-claro rounded-full animate-pulse shadow-2xl" />
            <p className="text-2xl text-foreground font-rounded font-bold animate-pulse">Carregando documento...</p>
          </div>
        ) : isPDF ? (
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden print:shadow-none">
            <div className="p-2 md:p-4 lg:p-6 h-[calc(100vh-220px)]">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + fileUrl)}&embedded=true`}
                title={title}
                className="w-full h-full rounded-2xl border-0 shadow-2xl bg-white"
              />
              <p className="mt-4 text-center text-sm text-muted-foreground print:hidden">
                Se o documento não aparecer, toque em "Baixar" para abrir no seu aplicativo de PDF.
              </p>
            </div>
          </Card>
        ) : isMarkdown ? (
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden print:shadow-none">
            <div className="p-6 md:p-10 lg:p-16">
              <article className="
                prose prose-xl max-w-none
                font-rounded
                
                [&>*]:animate-fade-in
                
                prose-headings:font-rounded prose-headings:font-black
                
                prose-h1:text-4xl md:prose-h1:text-6xl lg:prose-h1:text-7xl
                prose-h1:text-center prose-h1:mb-16 prose-h1:mt-8
                prose-h1:p-10 md:prose-h1:p-16 prose-h1:rounded-3xl
                prose-h1:bg-gradient-to-br prose-h1:from-rosa-bebe/90 prose-h1:via-roxo-suave/90 prose-h1:to-azul-claro/90
                prose-h1:text-white prose-h1:shadow-2xl prose-h1:leading-tight
                prose-h1:border-8 prose-h1:border-white/50
                prose-h1:transform prose-h1:hover:scale-[1.02] prose-h1:transition-transform prose-h1:duration-300
                
                prose-h2:text-3xl md:prose-h2:text-5xl lg:prose-h2:text-6xl
                prose-h2:font-black prose-h2:mt-16 prose-h2:mb-8
                prose-h2:p-8 md:prose-h2:p-10 prose-h2:rounded-2xl prose-h2:shadow-2xl
                prose-h2:bg-gradient-to-br prose-h2:from-azul-claro/20 prose-h2:via-verde-menta/20 prose-h2:to-amarelo-suave/20
                prose-h2:border-l-[12px] prose-h2:border-azul-claro
                prose-h2:text-azul-claro prose-h2:leading-tight
                prose-h2:backdrop-blur-sm
                
                prose-h3:text-2xl md:prose-h3:text-4xl
                prose-h3:font-bold prose-h3:mt-12 prose-h3:mb-6
                prose-h3:text-verde-menta prose-h3:pl-6 
                prose-h3:border-l-8 prose-h3:border-verde-menta
                prose-h3:bg-verde-menta/10 prose-h3:p-6 prose-h3:rounded-xl
                prose-h3:shadow-lg
                
                prose-h4:text-xl md:prose-h4:text-3xl
                prose-h4:font-bold prose-h4:mt-8 prose-h4:mb-4
                prose-h4:text-roxo-suave 
                prose-h4:bg-gradient-to-r prose-h4:from-roxo-suave/20 prose-h4:to-rosa-bebe/20
                prose-h4:p-5 prose-h4:rounded-xl prose-h4:shadow-md
                
                prose-p:text-lg md:prose-p:text-xl prose-p:leading-relaxed prose-p:mb-6
                prose-p:text-foreground/90 prose-p:bg-white/60 
                prose-p:p-6 md:prose-p:p-8 prose-p:rounded-2xl 
                prose-p:shadow-md prose-p:backdrop-blur-sm
                prose-p:border-l-4 prose-p:border-rosa-bebe/30
                
                prose-strong:text-primary prose-strong:font-black 
                prose-strong:text-xl md:prose-strong:text-2xl
                prose-strong:bg-amarelo-suave/30 prose-strong:px-2 prose-strong:py-1 
                prose-strong:rounded prose-strong:shadow-sm
                
                prose-em:italic prose-em:text-muted-foreground 
                prose-em:text-lg prose-em:font-medium
                
                prose-a:text-azul-claro prose-a:font-bold 
                prose-a:underline prose-a:decoration-4 prose-a:decoration-azul-claro/50
                hover:prose-a:text-roxo-suave hover:prose-a:decoration-roxo-suave
                hover:prose-a:scale-105 prose-a:inline-block prose-a:transition-all
                
                prose-ul:my-8 prose-ul:space-y-4 prose-ul:list-none
                prose-ul:bg-gradient-to-br prose-ul:from-rosa-bebe/15 prose-ul:to-amarelo-suave/15
                prose-ul:p-8 md:prose-ul:p-10 prose-ul:rounded-3xl 
                prose-ul:shadow-xl prose-ul:backdrop-blur-sm
                prose-ul:border-4 prose-ul:border-rosa-bebe/20
                
                prose-ol:my-8 prose-ol:space-y-4 prose-ol:list-none
                prose-ol:bg-gradient-to-br prose-ol:from-verde-menta/15 prose-ol:to-azul-claro/15
                prose-ol:p-8 md:prose-ol:p-10 prose-ol:rounded-3xl 
                prose-ol:shadow-xl prose-ol:backdrop-blur-sm
                prose-ol:border-4 prose-ol:border-verde-menta/20
                
                prose-li:mb-4 prose-li:pl-16 prose-li:relative 
                prose-li:text-lg md:prose-li:text-xl
                prose-li:bg-white/80 prose-li:p-5 md:prose-li:p-6 
                prose-li:rounded-xl prose-li:shadow-md
                prose-li:border-l-4 prose-li:border-azul-claro/30
                prose-li:backdrop-blur-sm
                prose-li:hover:scale-[1.02] prose-li:transition-transform
                prose-li:before:content-['✨'] prose-li:before:absolute 
                prose-li:before:left-5 prose-li:before:text-3xl 
                prose-li:before:top-4 prose-li:before:drop-shadow-lg
                
                prose-table:border-collapse prose-table:w-full 
                prose-table:my-10 prose-table:shadow-2xl
                prose-table:rounded-2xl prose-table:overflow-hidden
                prose-table:bg-white
                
                prose-thead:bg-gradient-to-r prose-thead:from-rosa-bebe 
                prose-thead:via-roxo-suave prose-thead:to-azul-claro
                
                prose-th:p-6 prose-th:text-left prose-th:font-black 
                prose-th:text-white prose-th:text-xl prose-th:border-0
                
                prose-td:p-6 prose-td:border-0 prose-td:text-lg 
                prose-td:bg-white/90 prose-td:font-medium
                
                prose-tr:even:bg-gradient-to-r prose-tr:even:from-azul-claro/10 
                prose-tr:even:to-verde-menta/10
                prose-tr:hover:bg-rosa-bebe/10 prose-tr:transition-colors
                
                prose-blockquote:border-l-[12px] prose-blockquote:border-verde-menta
                prose-blockquote:pl-8 prose-blockquote:pr-8 prose-blockquote:py-6
                prose-blockquote:my-8 prose-blockquote:italic 
                prose-blockquote:font-semibold prose-blockquote:text-xl
                prose-blockquote:bg-gradient-to-r prose-blockquote:from-verde-menta/20 
                prose-blockquote:to-azul-claro/20
                prose-blockquote:rounded-r-2xl prose-blockquote:shadow-2xl
                prose-blockquote:backdrop-blur-sm
                
                prose-code:bg-amarelo-suave/60 prose-code:px-4 prose-code:py-2
                prose-code:rounded-xl prose-code:text-lg prose-code:font-bold
                prose-code:border-2 prose-code:border-amarelo-suave/50
                prose-code:shadow-md
                
                prose-hr:border-0 prose-hr:h-3 prose-hr:my-16
                prose-hr:bg-gradient-to-r prose-hr:from-rosa-bebe 
                prose-hr:via-roxo-suave prose-hr:via-azul-claro 
                prose-hr:to-verde-menta
                prose-hr:rounded-full prose-hr:shadow-xl
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </article>
            </div>
          </Card>
        ) : (
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden print:shadow-none">
            <div className="p-8 md:p-12 lg:p-16 space-y-6 text-center">
              <p className="text-lg text-muted-foreground">
                Este tipo de arquivo não pode ser visualizado aqui.
              </p>
              <p className="text-md text-muted-foreground">
                Toque em "Baixar" para abrir no aplicativo adequado no seu celular ou computador.
              </p>
              <Button
                onClick={handleOpenNewTab}
                variant="outline"
                size="lg"
                className="mt-4"
              >
                Abrir em nova aba
              </Button>
            </div>
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
