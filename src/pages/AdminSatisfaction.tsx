import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Survey {
  id: string;
  rating: number;
  comments: string | null;
  submitted_at: string;
  user_id: string;
}

export default function AdminSatisfaction() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadSurveys();
  }, [isAdmin, navigate]);

  const loadSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("satisfaction_surveys")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setSurveys(data || []);

      if (data && data.length > 0) {
        const avg = data.reduce((sum, s) => sum + s.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      toast.error("Erro ao carregar avaliações");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;

    try {
      const { error } = await supabase.from("satisfaction_surveys").delete().eq("id", id);
      if (error) throw error;
      toast.success("Avaliação excluída!");
      loadSurveys();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? "fill-laranja-suave text-laranja-suave" : "text-muted-foreground"}`}
      />
    ));
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-laranja-suave/20 to-amarelo-suave/20">
      <header className="bg-gradient-to-r from-laranja-suave to-amarelo-suave p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              ⭐
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Avaliações de Satisfação</h1>
              <p className="text-sm text-muted-foreground">
                {surveys.length} avaliações • Média: {averageRating}/5
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-2 border-laranja-suave/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total de Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{surveys.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-amarelo-suave/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Média Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-gray-900">{averageRating}</p>
                <Star className="w-6 h-6 fill-amarelo-suave text-amarelo-suave" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-success/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">5 Estrelas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">
                {surveys.filter(s => s.rating === 5).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-laranja-suave to-amarelo-suave rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : surveys.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma avaliação recebida</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {surveys.map((survey) => (
              <Card key={survey.id} className="border-2 border-laranja-suave/20">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-1 mb-2">
                        {renderStars(survey.rating)}
                      </div>
                      {survey.comments && (
                        <p className="text-sm mt-2">{survey.comments}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(survey.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(survey.id)}
                    >
                      <Trash2 className="w-4 h-4" />
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
