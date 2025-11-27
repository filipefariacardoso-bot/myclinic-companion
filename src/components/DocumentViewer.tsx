import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);

  useEffect(() => {
    // Detectar se é PDF pela URL ou extensão
    const urlLower = fileUrl.toLowerCase();
    const isPDFFile = urlLower.endsWith('.pdf') || urlLower.includes('.pdf?');
    setIsPDF(isPDFFile);
    
    if (!isPDFFile) {
      loadDocument();
    } else {
      setLoading(false);
    }
    
    // Calcular largura da página baseado na tela
    const updateWidth = () => {
      const container = document.getElementById('pdf-container');
      if (container) {
        setPageWidth(Math.min(container.clientWidth - 32, 900));
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
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

      {/* Documento tipo revista digital */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 print:p-8 relative z-10" id="pdf-container">
        {loading ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-rosa-bebe via-roxo-suave to-azul-claro rounded-full animate-pulse shadow-2xl" />
            <p className="text-2xl text-foreground font-rounded font-bold animate-pulse">Carregando documento...</p>
          </div>
        ) : isPDF ? (
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden print:shadow-none">
            <div className="p-6 md:p-10">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="text-center py-32">
                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-rosa-bebe via-roxo-suave to-azul-claro rounded-full animate-pulse shadow-2xl" />
                    <p className="text-2xl text-foreground font-rounded font-bold animate-pulse">Carregando PDF...</p>
                  </div>
                }
                error={
                  <div className="text-center py-32">
                    <p className="text-xl text-destructive font-rounded font-bold">Erro ao carregar PDF</p>
                    <p className="text-muted-foreground mt-4">Tente fazer o download do arquivo</p>
                  </div>
                }
              >
                <div className="flex flex-col items-center space-y-6">
                  <Page
                    pageNumber={pageNumber}
                    width={pageWidth || 800}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-2xl rounded-xl overflow-hidden"
                  />
                  
                  {numPages > 1 && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-rosa-bebe/20 to-azul-claro/20 px-6 py-4 rounded-2xl shadow-lg print:hidden">
                      <Button
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                        variant="outline"
                        size="lg"
                        className="bg-white/90 hover:bg-white hover:scale-105 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <p className="text-lg font-rounded font-bold text-foreground min-w-[120px] text-center">
                        Página {pageNumber} de {numPages}
                      </p>
                      <Button
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages}
                        variant="outline"
                        size="lg"
                        className="bg-white/90 hover:bg-white hover:scale-105 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </Document>
            </div>
          </Card>
        ) : (
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden print:shadow-none">
            <div className="p-6 md:p-10 lg:p-16">
              <article className="
                prose prose-xl max-w-none
...
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </article>
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
