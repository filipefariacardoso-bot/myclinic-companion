import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExamResult {
  id: string;
  exam_name: string;
  exam_date: string;
  file_url: string | null;
  notes: string | null;
  patient_name: string;
  user_id: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

export default function AdminExamResults() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [results, setResults] = useState<ExamResult[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    user_id: "",
    exam_name: "",
    exam_date: "",
    patient_name: "",
    notes: "",
    file_url: ""
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [resultsRes, profilesRes] = await Promise.all([
        supabase.from("exam_results" as any).select("*").order("exam_date", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email")
      ]);

      if (resultsRes.error) throw resultsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setResults((resultsRes.data as unknown as ExamResult[]) || []);
      setProfiles(profilesRes.data || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!formData.user_id) {
      toast({
        title: "Selecione o paciente primeiro",
        description: "Escolha o paciente antes de enviar o arquivo.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      // Store under patient's user_id folder so RLS scopes access correctly
      const filePath = `${formData.user_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("exam-results")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store only the relative path — never a public URL for medical files
      setFormData(prev => ({ ...prev, file_url: filePath }));
      toast({
        title: "Arquivo enviado!",
        description: "O arquivo foi carregado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.user_id || !formData.exam_name || !formData.exam_date || !formData.patient_name) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from("exam_results" as any).insert({
        user_id: formData.user_id,
        exam_name: formData.exam_name,
        exam_date: formData.exam_date,
        patient_name: formData.patient_name,
        notes: formData.notes || null,
        file_url: formData.file_url || null
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Resultado de exame adicionado."
      });
      
      setDialogOpen(false);
      setFormData({
        user_id: "",
        exam_name: "",
        exam_date: "",
        patient_name: "",
        notes: "",
        file_url: ""
      });
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o resultado.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este resultado?")) return;

    try {
      const { error } = await supabase.from("exam_results" as any).delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Excluído!",
        description: "Resultado removido com sucesso."
      });
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o resultado.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-verde-menta/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-azul-claro to-verde-menta p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button 
            onClick={() => navigate("/admin")} 
            variant="ghost" 
            size="sm"
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
                🔬
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gerenciar Resultados de Exames</h1>
                <p className="text-sm text-white/90">Adicione e gerencie resultados de exames</p>
              </div>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-azul-claro hover:bg-white/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Resultado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Resultado de Exame</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Paciente *</Label>
                    <Select 
                      value={formData.user_id} 
                      onValueChange={(value) => {
                        const profile = profiles.find(p => p.id === value);
                        setFormData(prev => ({ 
                          ...prev, 
                          user_id: value,
                          patient_name: profile?.full_name || ""
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name} ({profile.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Nome do Exame *</Label>
                    <Input
                      value={formData.exam_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, exam_name: e.target.value }))}
                      placeholder="Ex: Hemograma Completo"
                    />
                  </div>

                  <div>
                    <Label>Data do Exame *</Label>
                    <Input
                      type="date"
                      value={formData.exam_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, exam_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observações sobre o exame..."
                    />
                  </div>

                  <div>
                    <Label>Arquivo do Resultado (PDF)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </div>
                    {formData.file_url && (
                      <p className="text-sm text-success mt-1">✓ Arquivo carregado</p>
                    )}
                  </div>

                  <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Resultado
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-verde-menta rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="border-2 border-dashed border-azul-claro/30">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum resultado cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Clique no botão "Novo Resultado" para adicionar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {results.map((result) => (
              <Card key={result.id} className="border-2 border-azul-claro/30">
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
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(result.exam_date)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(result.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {(result.notes || result.file_url) && (
                  <CardContent className="pt-4">
                    {result.notes && (
                      <p className="text-sm text-muted-foreground mb-2">{result.notes}</p>
                    )}
                    {result.file_url && (
                      <a 
                        href={result.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-azul-claro hover:underline"
                      >
                        📎 Ver arquivo anexado
                      </a>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
