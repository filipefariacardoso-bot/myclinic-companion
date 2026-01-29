import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface ExamResult {
  id: string;
  exam_name: string;
  exam_date: string;
  file_url: string | null;
  notes: string | null;
  patient_name: string;
}

export default function ExamResults() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("exam_results")
        .select("*")
        .eq("user_id", user?.id)
        .order("exam_date", { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-verde-menta/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-azul-claro to-verde-menta p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button 
            onClick={() => navigate("/")} 
            variant="ghost" 
            size="sm"
            className="mb-4 text-foreground hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              🔬
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resultado de Exames</h1>
              <p className="text-sm text-muted-foreground">Seus resultados de exames</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-verde-menta rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando resultados...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="border-2 border-azul-claro/30">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum resultado disponível</h3>
              <p className="text-muted-foreground">
                Seus resultados de exames aparecerão aqui quando estiverem disponíveis.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {results.map((result) => (
              <Card key={result.id} className="border-2 border-azul-claro/30 hover:border-azul-claro transition-all">
                <CardHeader className="bg-azul-claro/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-azul-claro" />
                      <div>
                        <CardTitle className="text-lg">{result.exam_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Paciente: {result.patient_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(result.exam_date)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {result.notes && (
                    <p className="text-sm text-muted-foreground mb-4">{result.notes}</p>
                  )}
                  {result.file_url && (
                    <Button 
                      onClick={() => window.open(result.file_url!, "_blank")}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Resultado
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
