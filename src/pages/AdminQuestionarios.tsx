import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QuestionnaireResponse {
  id: string;
  child_name: string;
  child_age: string;
  child_sex: string;
  main_complaint: string;
  consultation_reason: string | null;
  main_symptoms: string[] | null;
  symptoms_duration: string | null;
  current_illness_history: string | null;
  urgency_level: string | null;
  current_medications: string | null;
  recent_diseases: string | null;
  past_medical_history: string | null;
  known_allergies: string | null;
  has_been_hospitalized: boolean | null;
  hospitalization_details: string | null;
  has_had_surgeries: boolean | null;
  surgery_details: string | null;
  first_words_age: string | null;
  first_steps_age: string | null;
  sphincter_control_age: string | null;
  development_perception: string | null;
  development_observations: string | null;
  birth_weight: string | null;
  gestational_age: string | null;
  delivery_type: string | null;
  pregnancy_complications: string | null;
  delivery_complications: string | null;
  vaccination_card_status: string | null;
  vaccination_details: string | null;
  last_vaccination_date: string | null;
  family_medical_history: string | null;
  parents_consanguinity: boolean | null;
  consanguinity_degree: string | null;
  parents_concerns: string | null;
  specific_questions: string | null;
  additional_observations: string | null;
  status: string | null;
  submitted_at: string | null;
  user_id: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

const questionSteps = [
  {
    step: 1,
    title: "Informações Pessoais",
    questions: [
      { key: "child_name", label: "Nome da criança" },
      { key: "child_age", label: "Idade" },
      { key: "child_sex", label: "Sexo" },
    ],
  },
  {
    step: 2,
    title: "Motivo da Consulta",
    questions: [
      { key: "consultation_reason", label: "Motivo Principal da Consulta" },
      { key: "main_symptoms", label: "Sintomas Principais" },
      { key: "symptoms_duration", label: "Duração dos Sintomas" },
      { key: "current_illness_history", label: "História da Moléstia Atual" },
      { key: "urgency_level", label: "Nível de Urgência" },
    ],
  },
  {
    step: 3,
    title: "Histórico Médico",
    questions: [
      { key: "current_medications", label: "Medicamentos em Uso" },
      { key: "recent_diseases", label: "Doenças Recentes (último ano)" },
      { key: "past_medical_history", label: "Histórico Médico Anterior" },
      { key: "known_allergies", label: "Alergias Conhecidas" },
    ],
  },
  {
    step: 4,
    title: "Hospitalizações e Cirurgias",
    questions: [
      { key: "has_been_hospitalized", label: "Já foi hospitalizado?" },
      { key: "hospitalization_details", label: "Detalhes das Hospitalizações" },
      { key: "has_had_surgeries", label: "Já fez cirurgias?" },
      { key: "surgery_details", label: "Detalhes das Cirurgias" },
    ],
  },
  {
    step: 5,
    title: "Desenvolvimento Infantil",
    questions: [
      { key: "first_words_age", label: "Idade das Primeiras Palavras" },
      { key: "first_steps_age", label: "Idade dos Primeiros Passos" },
      { key: "sphincter_control_age", label: "Controle de Esfíncter" },
      { key: "development_perception", label: "Percepção do Desenvolvimento" },
      { key: "development_observations", label: "Observações sobre Desenvolvimento" },
    ],
  },
  {
    step: 6,
    title: "Dados do Nascimento",
    questions: [
      { key: "birth_weight", label: "Peso ao Nascer" },
      { key: "gestational_age", label: "Idade Gestacional" },
      { key: "delivery_type", label: "Tipo de Parto" },
      { key: "pregnancy_complications", label: "Intercorrências na Gravidez" },
      { key: "delivery_complications", label: "Intercorrências no Parto" },
    ],
  },
  {
    step: 7,
    title: "Vacinação",
    questions: [
      { key: "vaccination_card_status", label: "Cartão de Vacinas" },
      { key: "vaccination_details", label: "Detalhes de Vacinação" },
      { key: "last_vaccination_date", label: "Última Vacina" },
    ],
  },
  {
    step: 8,
    title: "Antecedentes Familiares",
    questions: [
      { key: "family_medical_history", label: "Histórico Familiar de Doenças" },
      { key: "parents_consanguinity", label: "Consanguinidade dos Pais" },
      { key: "consanguinity_degree", label: "Grau de Consanguinidade" },
    ],
  },
  {
    step: 9,
    title: "Informações Finais",
    questions: [
      { key: "parents_concerns", label: "Preocupações dos Pais" },
      { key: "specific_questions", label: "Perguntas Específicas" },
      { key: "additional_observations", label: "Observações Adicionais" },
    ],
  },
];

function formatFieldValue(key: string, value: any): string {
  if (value === null || value === undefined || value === "") return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "Nenhum";
  if (key === "child_sex") return value === "masculino" ? "Masculino" : "Feminino";
  if (key === "delivery_type") return value === "normal" ? "Normal" : value === "cesarea" ? "Cesárea" : value;
  if (key === "urgency_level") {
    if (value === "baixa") return "Baixa (pode aguardar)";
    if (value === "media") return "Média (prefiro hoje)";
    if (value === "alta") return "Alta (urgente)";
  }
  return String(value);
}

export default function AdminQuestionarios() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPatient, setSearchPatient] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedResponse, setSelectedResponse] = useState<QuestionnaireResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    setLoading(true);
    // Fetch questionnaires first, then enrich with profile data separately
    // (no declared FK between medical_questionnaires and profiles)
    const { data, error } = await supabase
      .from("medical_questionnaires")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Erro ao carregar respostas", description: error.message });
      setLoading(false);
      return;
    }

    const rows = data || [];

    // Fetch distinct profile data for all user_ids in the result
    const userIds = [...new Set(rows.map((r: any) => r.user_id))];
    let profileMap: Record<string, { full_name: string; email: string }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds as string[]);

      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.id] = { full_name: p.full_name, email: p.email };
        });
      }
    }

    const enriched = rows.map((r: any) => ({
      ...r,
      profiles: profileMap[r.user_id] || null,
    }));

    setResponses(enriched as any);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("medical_questionnaires")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erro ao atualizar status" });
    } else {
      toast({ title: "Status atualizado!" });
      fetchResponses();
      if (selectedResponse?.id === id) {
        setSelectedResponse(prev => prev ? { ...prev, status } : null);
      }
    }
  };

  const filteredResponses = responses.filter((r) => {
    const patientMatch =
      searchPatient === "" ||
      r.child_name.toLowerCase().includes(searchPatient.toLowerCase()) ||
      r.profiles?.full_name?.toLowerCase().includes(searchPatient.toLowerCase());

    const dateMatch =
      filterDate === "" ||
      (r.submitted_at && r.submitted_at.startsWith(filterDate));

    const statusMatch =
      filterStatus === "all" || r.status === filterStatus;

    return patientMatch && dateMatch && statusMatch;
  });

  const statusLabel = (status: string | null) => {
    if (status === "reviewed") return { label: "Em Revisão", cls: "bg-info/20 text-info" };
    if (status === "completed") return { label: "Concluído", cls: "bg-success/20 text-success" };
    return { label: "Pendente", cls: "bg-warning/20 text-warning" };
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-rosa-bebe/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-azul-claro p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin")}
              className="bg-white/90 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">📋 Questionários</h1>
              <p className="text-sm text-white/90">Gerenciar perguntas e visualizar respostas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <Tabs defaultValue="respostas">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="respostas" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Respostas dos Pacientes
            </TabsTrigger>
            <TabsTrigger value="perguntas" className="flex-1">
              📝 Estrutura do Questionário
            </TabsTrigger>
          </TabsList>

          {/* ABA: RESPOSTAS */}
          <TabsContent value="respostas" className="space-y-4">
            {/* Filtros */}
            <Card className="border-2 border-azul-claro/30">
              <CardHeader>
                <CardTitle className="text-base">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por paciente..."
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    placeholder="Filtrar por data"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="reviewed">Em Revisão</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de respostas */}
            <Card className="border-2 border-azul-claro/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Respostas Enviadas ({filteredResponses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">Carregando...</div>
                ) : filteredResponses.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma resposta encontrada</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Paciente (criança)</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Motivo</TableHead>
                          <TableHead>Data de Envio</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResponses.map((r) => {
                          const st = statusLabel(r.status);
                          return (
                            <TableRow key={r.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{r.child_name}</div>
                                  <div className="text-xs text-muted-foreground">{r.child_age}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm">{r.profiles?.full_name || "—"}</div>
                                  <div className="text-xs text-muted-foreground">{r.profiles?.email || "—"}</div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate text-sm">
                                {r.consultation_reason || r.main_complaint || "—"}
                              </TableCell>
                              <TableCell className="text-sm whitespace-nowrap">
                                {r.submitted_at
                                  ? format(new Date(r.submitted_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.cls}`}>
                                  {st.label}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedResponse(r);
                                    setDetailOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA: ESTRUTURA DO QUESTIONÁRIO */}
          <TabsContent value="perguntas" className="space-y-4">
            <div className="grid gap-4">
              {questionSteps.map((step) => (
                <Card key={step.step} className="border-2 border-azul-claro/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-azul-claro flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {step.step}
                      </div>
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {step.questions.map((q, idx) => (
                        <div
                          key={q.key}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border"
                        >
                          <span className="text-xs text-muted-foreground w-5 text-right">{idx + 1}.</span>
                          <span className="text-sm flex-1">{q.label}</span>
                          <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-0.5 rounded">
                            {q.key}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border text-sm text-muted-foreground">
              ℹ️ A estrutura do questionário é fixada no código do aplicativo. Para alterar perguntas, edite o arquivo <code className="font-mono bg-background px-1 rounded">src/pages/Questionnaire.tsx</code>.
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Detalhes */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Respostas de {selectedResponse?.child_name}
            </DialogTitle>
          </DialogHeader>

          {selectedResponse && (
            <div className="space-y-6">
              {/* Info rápida */}
              <div className="flex flex-wrap gap-3 p-4 bg-muted/40 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium">Responsável:</span>
                  <span>{selectedResponse.profiles?.full_name || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">Enviado em:</span>
                  <span>
                    {selectedResponse.submitted_at
                      ? format(new Date(selectedResponse.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Alterar status */}
              <div className="flex items-center gap-3">
                <Label>Status:</Label>
                <Select
                  value={selectedResponse.status || "pending"}
                  onValueChange={(v) => updateStatus(selectedResponse.id, v)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="reviewed">Em Revisão</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Todas as respostas por etapa */}
              {questionSteps.map((step) => {
                const hasData = step.questions.some((q) => {
                  const val = (selectedResponse as any)[q.key];
                  return val !== null && val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0);
                });
                if (!hasData) return null;

                return (
                  <div key={step.step}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-azul-claro flex items-center justify-center text-white text-xs font-bold">
                        {step.step}
                      </div>
                      <h3 className="font-semibold text-sm">{step.title}</h3>
                    </div>
                    <div className="space-y-2 ml-8">
                      {step.questions.map((q) => {
                        const val = (selectedResponse as any)[q.key];
                        const formatted = formatFieldValue(q.key, val);
                        if (formatted === "Não informado") return null;
                        return (
                          <div key={q.key} className="text-sm">
                            <span className="font-medium text-muted-foreground">{q.label}: </span>
                            <span>{formatted}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
