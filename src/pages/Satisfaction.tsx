import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Satisfaction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor, selecione uma avaliação");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("satisfaction_surveys")
        .insert({
          user_id: user.id,
          rating,
          comments: comments || null,
        });

      if (error) throw error;

      toast.success("Avaliação enviada com sucesso! Obrigado pelo feedback! 💚");
      setRating(0);
      setComments("");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast.error("Erro ao enviar avaliação");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-laranja-suave/20 to-amarelo-suave/20">
      <header className="bg-gradient-to-r from-laranja-suave to-amarelo-suave p-6 rounded-b-3xl shadow-lg">
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
              ⭐
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pesquisa de Satisfação</h1>
              <p className="text-sm text-muted-foreground">
                Sua opinião é muito importante para nós
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <Card className="border-2 border-laranja-suave/30">
          <CardHeader className="bg-laranja-suave/20">
            <CardTitle className="text-center">Como foi sua experiência?</CardTitle>
            <p className="text-center text-muted-foreground text-sm mt-2">
              💬 Deixe aqui sua avaliação, caso queira. Sua opinião é muito importante para nós!
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-center">
                Avalie nosso atendimento:
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoveredRating || rating)
                          ? "fill-laranja-suave text-laranja-suave"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {rating === 5 && "Excelente! ⭐"}
                  {rating === 4 && "Muito bom! 😊"}
                  {rating === 3 && "Bom 👍"}
                  {rating === 2 && "Regular 😐"}
                  {rating === 1 && "Ruim 😞"}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">
                ✍️ Escreva sua opinião (opcional):
              </label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Compartilhe conosco o que achou do atendimento, sugestões de melhoria, elogios ou críticas. Queremos ouvir você! 💚"
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-center">
                Suas sugestões nos ajudam a melhorar nossos serviços cada vez mais!
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="w-full"
              size="lg"
            >
              {submitting ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
