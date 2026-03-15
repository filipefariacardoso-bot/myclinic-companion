import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Calendar, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const { toast } = useToast();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    exam_name: "",
    exam_date: new Date().toISOString().split("T")[0],
    notes: "",
    file_url: "",
    patient_name: "",
  });

  useEffect(() => {
    if (user) fetchResults();
  }, [user]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("exam_results" as any)
        .select("*")
        .eq("user_id", user?.id)
        .order("exam_date", { ascending: false });

      if (error) throw error;

      const resultsWithUrls = await Promise.all(
        ((data as unknown as ExamResult[]) || []).map(async (result) => {
          if (!result.file_url) return result;
          const { data: signedData } = await supabase.storage
            .from("exam-results")
            .createSignedUrl(result.file_url, 3600);
          return { ...result, file_url: signedData?.signedUrl ?? null };
        })
      );

      setResults(resultsWithUrls);
    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("exam-results").upload(filePath, file);
      if (uploadError) throw uploadError;
      setFormData(prev => ({ ...prev, file_url: filePath }));
      toast({ title: "Arquivo enviado!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao enviar arquivo", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.exam_name || !formData.exam_date) {
      toast({ title: "Campos obrigatórios", description: "Preencha o nome do exame e a data.", variant: "destructive" });
      return;
    }
    try {
      // Get patient name from profile
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user?.id).single();
      const { error } = await supabase.from("exam_results" as any).insert({
        user_id: user?.id,
        exam_name: formData.exam_name,
        exam_date: formData.exam_date,
        patient_name: profile?.full_name || "Paciente",
        notes: formData.notes || null,
        file_url: formData.file_url || null,
      });
      if (error) throw error;
      toast({ title: "Resultado adicionado!" });
      setDialogOpen(false);
      setFormData({ exam_name: "", exam_date: new Date().toISOString().split("T")[0], notes: "", file_url: "", patient_name: "" });
      fetchResults();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar resultado", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este resultado?")) return;
    try {
      const { error } = await supabase.from("exam_results" as any).delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Resultado removido." });
      fetchResults();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-verde-menta/20">
      <header className="bg-gradient-to-r from-azul-claro to-verde-menta p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button onClick={() => navigate("/")} variant="ghost" size="sm" className="mb-4 text-foreground hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">🔬</div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Resultados de Exames</h1>
                <p className="text-sm text-muted-foreground">Adicione e visualize seus resultados</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-azul-claro hover:bg-white/90">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Resultado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Resultado de Exame</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome do Exame *</Label>
                    <Input value={formData.exam_name} onChange={e => setFormData(prev => ({ ...prev, exam_name: e.target.value }))} placeholder="Ex: Hemograma Completo" />
                  </div>
                  <div>
                    <Label>Data do Exame *</Label>
                    <Input type="date" value={formData.exam_date} onChange={e => setFormData(prev => ({ ...prev, exam_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Resultado / Observações</Label>
                    <Textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Valores, observações do resultado..." rows={3} />
                  </div>
                  <div>
                    <Label>Anexar Arquivo (opcional)</Label>
                    <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={uploading} />
                    {uploading && <p className="text-sm text-muted-foreground mt-1">Enviando...</p>}
                    {formData.file_url && !uploading && <p className="text-sm text-success mt-1">✓ Arquivo carregado</p>}
                  </div>
                  <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
                    <Plus className="w-4 h-4 mr-2" /> Salvar Resultado
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-verde-menta rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando resultados...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="border-2 border-azul-claro/30">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum resultado adicionado</h3>
              <p className="text-muted-foreground mb-4">Clique em "Adicionar Resultado" para registrar seus exames.</p>
            </CardContent>
          </Card>
        ) : (
          results.map(result => (
            <Card key={result.id} className="border-2 border-azul-claro/30 hover:border-azul-claro transition-all">
              <CardHeader className="bg-azul-claro/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-azul-claro" />
                    <div>
                      <CardTitle className="text-lg">{result.exam_name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(result.exam_date).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(result.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              {(result.notes || result.file_url) && (
                <CardContent className="pt-4 space-y-3">
                  {result.notes && <p className="text-sm">{result.notes}</p>}
                  {result.file_url && (
                    <a href={result.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="w-4 h-4" /> Ver arquivo anexado
                      </Button>
                    </a>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
