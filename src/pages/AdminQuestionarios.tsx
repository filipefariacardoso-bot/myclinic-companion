import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Search, Eye, FileText, Calendar, User,
  Pencil, Trash2, Plus, GripVertical, Save, X, ChevronDown, ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionnaireField {
  id: string;
  section_name: string;
  section_order: number;
  field_label: string;
  field_key: string;
  field_type: string;
  field_options: any;
  is_required: boolean;
  field_order: number;
  is_active: boolean;
  placeholder: string | null;
}

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
  father_name: string | null;
  mother_name: string | null;
  status: string | null;
  submitted_at: string | null;
  user_id: string;
  profiles?: { full_name: string; email: string } | null;
}

const FIELD_TYPES = [
  { value: "text", label: "Texto curto" },
  { value: "textarea", label: "Texto longo" },
  { value: "radio", label: "Seleção única (radio)" },
  { value: "checkbox", label: "Múltipla escolha (checkbox)" },
  { value: "select", label: "Lista suspensa (select)" },
  { value: "boolean", label: "Sim / Não" },
  { value: "date", label: "Data" },
];

const SECTIONS = [
  "Informações Pessoais",
  "Motivo da Consulta",
  "Histórico Médico",
  "Hospitalizações e Cirurgias",
  "Desenvolvimento Infantil",
  "Dados do Nascimento",
  "Vacinação",
  "Antecedentes Familiares",
  "Informações Finais",
];

// ─── Response display helpers ─────────────────────────────────────────────────

const questionSteps = [
  { step: 1, title: "Informações Pessoais", questions: [
    { key: "child_name", label: "Nome da criança" },
    { key: "child_age", label: "Idade" },
    { key: "child_sex", label: "Sexo" },
    { key: "mother_name", label: "Nome da Mãe" },
    { key: "father_name", label: "Nome do Pai" },
  ]},
  { step: 2, title: "Motivo da Consulta", questions: [
    { key: "consultation_reason", label: "Motivo Principal da Consulta" },
    { key: "main_symptoms", label: "Sintomas Principais" },
    { key: "symptoms_duration", label: "Duração dos Sintomas" },
    { key: "current_illness_history", label: "História da Moléstia Atual" },
    { key: "urgency_level", label: "Nível de Urgência" },
  ]},
  { step: 3, title: "Histórico Médico", questions: [
    { key: "current_medications", label: "Medicamentos em Uso" },
    { key: "recent_diseases", label: "Doenças Recentes" },
    { key: "past_medical_history", label: "Histórico Médico Anterior" },
    { key: "known_allergies", label: "Alergias Conhecidas" },
  ]},
  { step: 4, title: "Hospitalizações e Cirurgias", questions: [
    { key: "has_been_hospitalized", label: "Já foi hospitalizado?" },
    { key: "hospitalization_details", label: "Detalhes das Hospitalizações" },
    { key: "has_had_surgeries", label: "Já fez cirurgias?" },
    { key: "surgery_details", label: "Detalhes das Cirurgias" },
  ]},
  { step: 5, title: "Desenvolvimento Infantil", questions: [
    { key: "first_words_age", label: "Primeiras Palavras" },
    { key: "first_steps_age", label: "Primeiros Passos" },
    { key: "sphincter_control_age", label: "Controle de Esfíncter" },
    { key: "development_perception", label: "Percepção do Desenvolvimento" },
    { key: "development_observations", label: "Observações de Desenvolvimento" },
  ]},
  { step: 6, title: "Dados do Nascimento", questions: [
    { key: "birth_weight", label: "Peso ao Nascer" },
    { key: "gestational_age", label: "Idade Gestacional" },
    { key: "delivery_type", label: "Tipo de Parto" },
    { key: "pregnancy_complications", label: "Complicações na Gestação" },
    { key: "delivery_complications", label: "Complicações no Parto" },
  ]},
  { step: 7, title: "Vacinação", questions: [
    { key: "vaccination_card_status", label: "Cartão de Vacinas" },
    { key: "vaccination_details", label: "Detalhes de Vacinação" },
    { key: "last_vaccination_date", label: "Última Vacina" },
  ]},
  { step: 8, title: "Antecedentes Familiares", questions: [
    { key: "family_medical_history", label: "Histórico Familiar de Doenças" },
    { key: "parents_consanguinity", label: "Consanguinidade dos Pais" },
    { key: "consanguinity_degree", label: "Grau de Consanguinidade" },
  ]},
  { step: 9, title: "Informações Finais", questions: [
    { key: "parents_concerns", label: "Preocupações dos Pais" },
    { key: "specific_questions", label: "Perguntas Específicas" },
    { key: "additional_observations", label: "Observações Adicionais" },
  ]},
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

// ─── Empty field template ─────────────────────────────────────────────────────
const emptyField = (): Omit<QuestionnaireField, "id" | "created_at" | "updated_at"> => ({
  section_name: SECTIONS[0],
  section_order: 1,
  field_label: "",
  field_key: "",
  field_type: "text",
  field_options: null,
  is_required: false,
  field_order: 99,
  is_active: true,
  placeholder: "",
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminQuestionarios() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Responses tab state ---
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(true);
  const [searchPatient, setSearchPatient] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedResponse, setSelectedResponse] = useState<QuestionnaireResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // --- Editor tab state ---
  const [fields, setFields] = useState<QuestionnaireField[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [editingField, setEditingField] = useState<QuestionnaireField | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newField, setNewField] = useState(emptyField());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Drag-and-drop state
  const dragItem = useRef<{ id: string; section: string; order: number } | null>(null);
  const dragOverItem = useRef<{ id: string; section: string; order: number } | null>(null);

  useEffect(() => {
    fetchResponses();
    fetchFields();
  }, []);

  // ── Responses ──────────────────────────────────────────────────────────────

  const fetchResponses = async () => {
    setLoadingResponses(true);
    const { data, error } = await supabase
      .from("medical_questionnaires")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Erro ao carregar respostas", description: error.message });
      setLoadingResponses(false);
      return;
    }
    const rows = data || [];
    const userIds = [...new Set(rows.map((r: any) => r.user_id))];
    let profileMap: Record<string, { full_name: string; email: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles").select("id, full_name, email").in("id", userIds as string[]);
      if (profiles) profiles.forEach((p: any) => { profileMap[p.id] = { full_name: p.full_name, email: p.email }; });
    }
    setResponses(rows.map((r: any) => ({ ...r, profiles: profileMap[r.user_id] || null })));
    setLoadingResponses(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("medical_questionnaires").update({ status }).eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao atualizar status" });
    } else {
      toast({ title: "Status atualizado!" });
      fetchResponses();
      if (selectedResponse?.id === id) setSelectedResponse(prev => prev ? { ...prev, status } : null);
    }
  };

  const filteredResponses = responses.filter((r) => {
    const patientMatch = searchPatient === "" ||
      r.child_name.toLowerCase().includes(searchPatient.toLowerCase()) ||
      r.profiles?.full_name?.toLowerCase().includes(searchPatient.toLowerCase());
    const dateMatch = filterDate === "" || (r.submitted_at && r.submitted_at.startsWith(filterDate));
    const statusMatch = filterStatus === "all" || r.status === filterStatus;
    return patientMatch && dateMatch && statusMatch;
  });

  const statusLabel = (status: string | null) => {
    if (status === "reviewed") return { label: "Em Revisão", cls: "bg-info/20 text-info" };
    if (status === "completed") return { label: "Concluído", cls: "bg-success/20 text-success" };
    return { label: "Pendente", cls: "bg-warning/20 text-warning" };
  };

  // ── Fields CRUD ───────────────────────────────────────────────────────────

  const fetchFields = async () => {
    setLoadingFields(true);
    const { data, error } = await supabase
      .from("questionnaire_fields")
      .select("*")
      .order("section_order", { ascending: true })
      .order("field_order", { ascending: true });

    if (error) {
      toast({ variant: "destructive", title: "Erro ao carregar campos", description: error.message });
    } else {
      setFields((data || []) as QuestionnaireField[]);
    }
    setLoadingFields(false);
  };

  const handleSaveField = async () => {
    if (!editingField) return;
    setSaving(true);
    const { id, created_at, updated_at, ...payload } = editingField as any;
    const { error } = await supabase
      .from("questionnaire_fields")
      .update(payload)
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erro ao salvar campo", description: error.message });
    } else {
      toast({ title: "Campo atualizado! ✅" });
      setEditDialogOpen(false);
      fetchFields();
    }
    setSaving(false);
  };

  const handleAddField = async () => {
    if (!newField.field_label.trim() || !newField.field_key.trim()) {
      toast({ variant: "destructive", title: "Preencha o nome e a chave do campo" });
      return;
    }
    setSaving(true);
    // Auto-set section_order from SECTIONS list
    const sectionIdx = SECTIONS.indexOf(newField.section_name);
    const payload = { ...newField, section_order: sectionIdx + 1 };
    const { error } = await supabase.from("questionnaire_fields").insert(payload);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao adicionar campo", description: error.message });
    } else {
      toast({ title: "Campo adicionado! ✅" });
      setAddDialogOpen(false);
      setNewField(emptyField());
      fetchFields();
    }
    setSaving(false);
  };

  const handleDeleteField = async (id: string) => {
    const { error } = await supabase.from("questionnaire_fields").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao excluir campo", description: error.message });
    } else {
      toast({ title: "Campo excluído!" });
      setDeleteConfirmId(null);
      fetchFields();
    }
  };

  // ── Drag and drop ─────────────────────────────────────────────────────────

  const handleDragStart = (f: QuestionnaireField) => {
    dragItem.current = { id: f.id, section: f.section_name, order: f.field_order };
  };

  const handleDragEnter = (f: QuestionnaireField) => {
    dragOverItem.current = { id: f.id, section: f.section_name, order: f.field_order };
  };

  const handleDrop = async (sectionName: string) => {
    if (!dragItem.current || !dragOverItem.current) return;
    if (dragItem.current.section !== dragOverItem.current.section) {
      toast({ variant: "destructive", title: "Arraste apenas dentro da mesma seção" });
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    const sectionFields = fields
      .filter(f => f.section_name === sectionName)
      .sort((a, b) => a.field_order - b.field_order);

    const fromIdx = sectionFields.findIndex(f => f.id === dragItem.current!.id);
    const toIdx = sectionFields.findIndex(f => f.id === dragOverItem.current!.id);
    if (fromIdx === toIdx) { dragItem.current = null; dragOverItem.current = null; return; }

    const reordered = [...sectionFields];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Optimistic update
    const updated = reordered.map((f, i) => ({ ...f, field_order: i + 1 }));
    setFields(prev => {
      const other = prev.filter(f => f.section_name !== sectionName);
      return [...other, ...updated].sort((a, b) => a.section_order - b.section_order || a.field_order - b.field_order);
    });

    // Persist
    await Promise.all(updated.map(f =>
      supabase.from("questionnaire_fields").update({ field_order: f.field_order }).eq("id", f.id)
    ));

    dragItem.current = null;
    dragOverItem.current = null;
    toast({ title: "Ordem salva! ✅" });
  };

  // ── Grouped fields by section ─────────────────────────────────────────────

  const groupedFields = fields.reduce((acc, f) => {
    if (!acc[f.section_name]) acc[f.section_name] = [];
    acc[f.section_name].push(f);
    return acc;
  }, {} as Record<string, QuestionnaireField[]>);

  const sortedSectionNames = Object.keys(groupedFields).sort((a, b) => {
    const ao = groupedFields[a][0]?.section_order ?? 99;
    const bo = groupedFields[b][0]?.section_order ?? 99;
    return ao - bo;
  });

  const toggleSection = (name: string) =>
    setCollapsedSections(prev => ({ ...prev, [name]: !prev[name] }));

  const fieldTypeLabel = (type: string) =>
    FIELD_TYPES.find(t => t.value === type)?.label ?? type;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-rosa-bebe/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-azul-claro p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin")}
              className="bg-white/90 hover:bg-white">
              <ArrowLeft className="w-4 h-4 mr-2" />Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📋 Questionários</h1>
              <p className="text-sm text-gray-800">Gerenciar perguntas e visualizar respostas dos pacientes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <Tabs defaultValue="respostas">
          <TabsList className="w-full max-w-lg">
            <TabsTrigger value="respostas" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />Respostas dos Pacientes
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex-1">
              <Pencil className="w-4 h-4 mr-2" />Editar Questionário
            </TabsTrigger>
          </TabsList>

          {/* ───────────────── ABA RESPOSTAS ───────────────── */}
          <TabsContent value="respostas" className="space-y-4">
            <Card className="border-2 border-azul-claro/30">
              <CardHeader><CardTitle className="text-base">Filtros</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar por paciente..." value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)} className="pl-9" />
                  </div>
                  <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
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

            <Card className="border-2 border-azul-claro/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Respostas Enviadas ({filteredResponses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingResponses ? (
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
                                <div className="font-medium">{r.child_name}</div>
                                <div className="text-xs text-muted-foreground">{r.child_age}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{r.profiles?.full_name || "—"}</div>
                                <div className="text-xs text-muted-foreground">{r.profiles?.email || "—"}</div>
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
                                <Button size="sm" variant="outline"
                                  onClick={() => { setSelectedResponse(r); setDetailOpen(true); }}>
                                  <Eye className="w-4 h-4 mr-1" />Ver
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

          {/* ───────────────── ABA EDITOR ───────────────── */}
          <TabsContent value="editor" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Estrutura do Questionário</h2>
                <p className="text-sm text-muted-foreground">
                  Arraste para reordenar. Clique em ✏️ para editar ou 🗑️ para excluir.
                </p>
              </div>
              <Button onClick={() => setAddDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-azul-claro text-gray-900">
                <Plus className="w-4 h-4 mr-2" />Adicionar Campo
              </Button>
            </div>

            {loadingFields ? (
              <div className="py-12 text-center text-muted-foreground">Carregando campos...</div>
            ) : (
              <div className="space-y-4">
                {sortedSectionNames.map((sectionName) => {
                  const sectionFields = groupedFields[sectionName]
                    .sort((a, b) => a.field_order - b.field_order);
                  const collapsed = collapsedSections[sectionName];
                  const sectionOrder = sectionFields[0]?.section_order ?? 0;

                  return (
                    <Card key={sectionName} className="border-2 border-azul-claro/20"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(sectionName)}>
                      <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection(sectionName)}>
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-azul-claro flex items-center justify-center text-gray-900 text-sm font-bold shrink-0">
                              {sectionOrder}
                            </div>
                            <span>{sectionName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {sectionFields.filter(f => f.is_active).length} campo(s)
                            </Badge>
                          </div>
                          {collapsed
                            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                        </CardTitle>
                      </CardHeader>

                      {!collapsed && (
                        <CardContent>
                          <div className="space-y-2">
                            {sectionFields.map((field) => (
                              <div key={field.id}
                                draggable
                                onDragStart={() => handleDragStart(field)}
                                onDragEnter={() => handleDragEnter(field)}
                                onDragEnd={() => handleDrop(sectionName)}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-grab active:cursor-grabbing
                                  ${field.is_active ? "bg-background border-border hover:border-azul-claro/50" : "bg-muted/40 border-border opacity-50"}`}>
                                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-xs text-muted-foreground w-5 text-right">{field.field_order}.</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium truncate">{field.field_label}</span>
                                    {field.is_required && (
                                      <Badge variant="destructive" className="text-xs px-1 py-0">Obrigatório</Badge>
                                    )}
                                    {!field.is_active && (
                                      <Badge variant="outline" className="text-xs px-1 py-0">Inativo</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                      {field.field_key}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {fieldTypeLabel(field.field_type)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button size="sm" variant="ghost"
                                    onClick={() => { setEditingField({ ...field }); setEditDialogOpen(true); }}
                                    className="h-8 w-8 p-0">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost"
                                    onClick={() => setDeleteConfirmId(field.id)}
                                    className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* ───── Modal: Ver Resposta ───── */}
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
              <div className="flex items-center gap-3">
                <Label>Status:</Label>
                <Select value={selectedResponse.status || "pending"}
                  onValueChange={(v) => updateStatus(selectedResponse.id, v)}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="reviewed">Em Revisão</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {questionSteps.map((stepDef) => {
                const hasData = stepDef.questions.some((q) => {
                  const val = (selectedResponse as any)[q.key];
                  return val !== null && val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0);
                });
                if (!hasData) return null;
                return (
                  <div key={stepDef.step}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-azul-claro flex items-center justify-center text-gray-900 text-xs font-bold">
                        {stepDef.step}
                      </div>
                      <h3 className="font-semibold text-sm">{stepDef.title}</h3>
                    </div>
                    <div className="space-y-2 ml-8">
                      {stepDef.questions.map((q) => {
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

      {/* ───── Modal: Editar Campo ───── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />Editar Campo
            </DialogTitle>
          </DialogHeader>
          {editingField && (
            <div className="space-y-4">
              <div>
                <Label>Nome do Campo (label) *</Label>
                <Input value={editingField.field_label}
                  onChange={(e) => setEditingField(prev => prev ? { ...prev, field_label: e.target.value } : null)} />
              </div>
              <div>
                <Label>Chave interna (field_key) *</Label>
                <Input value={editingField.field_key}
                  onChange={(e) => setEditingField(prev => prev ? { ...prev, field_key: e.target.value } : null)}
                  className="font-mono text-sm" placeholder="camelCase, sem espaços" />
                <p className="text-xs text-muted-foreground mt-1">Identificador único. Use camelCase (ex: motherName).</p>
              </div>
              <div>
                <Label>Tipo do Campo</Label>
                <Select value={editingField.field_type}
                  onValueChange={(v) => setEditingField(prev => prev ? { ...prev, field_type: v } : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Seção</Label>
                <Select value={editingField.section_name}
                  onValueChange={(v) => setEditingField(prev => prev ? {
                    ...prev,
                    section_name: v,
                    section_order: SECTIONS.indexOf(v) + 1
                  } : null)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Placeholder (texto de ajuda)</Label>
                <Input value={editingField.placeholder || ""}
                  onChange={(e) => setEditingField(prev => prev ? { ...prev, placeholder: e.target.value } : null)} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label className="font-medium">Obrigatório</Label>
                  <p className="text-xs text-muted-foreground">O paciente deve preencher este campo</p>
                </div>
                <Switch checked={editingField.is_required}
                  onCheckedChange={(v) => setEditingField(prev => prev ? { ...prev, is_required: v } : null)} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label className="font-medium">Ativo</Label>
                  <p className="text-xs text-muted-foreground">Exibir este campo no formulário</p>
                </div>
                <Switch checked={editingField.is_active}
                  onCheckedChange={(v) => setEditingField(prev => prev ? { ...prev, is_active: v } : null)} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button onClick={handleSaveField} disabled={saving}
              className="bg-gradient-to-r from-primary to-azul-claro text-gray-900">
              <Save className="w-4 h-4 mr-1" />{saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Modal: Adicionar Campo ───── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />Adicionar Novo Campo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Campo (label) *</Label>
              <Input value={newField.field_label}
                onChange={(e) => setNewField(prev => ({ ...prev, field_label: e.target.value }))} />
            </div>
            <div>
              <Label>Chave interna (field_key) *</Label>
              <Input value={newField.field_key}
                onChange={(e) => setNewField(prev => ({ ...prev, field_key: e.target.value }))}
                className="font-mono text-sm" placeholder="camelCase, sem espaços" />
              <p className="text-xs text-muted-foreground mt-1">Identificador único. Use camelCase (ex: motherName).</p>
            </div>
            <div>
              <Label>Tipo do Campo</Label>
              <Select value={newField.field_type}
                onValueChange={(v) => setNewField(prev => ({ ...prev, field_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Seção</Label>
              <Select value={newField.section_name}
                onValueChange={(v) => setNewField(prev => ({
                  ...prev, section_name: v, section_order: SECTIONS.indexOf(v) + 1
                }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Placeholder (texto de ajuda)</Label>
              <Input value={newField.placeholder || ""}
                onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label className="font-medium">Obrigatório</Label>
                <p className="text-xs text-muted-foreground">O paciente deve preencher este campo</p>
              </div>
              <Switch checked={newField.is_required}
                onCheckedChange={(v) => setNewField(prev => ({ ...prev, is_required: v }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setAddDialogOpen(false); setNewField(emptyField()); }}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button onClick={handleAddField} disabled={saving}
              className="bg-gradient-to-r from-primary to-azul-claro text-gray-900">
              <Plus className="w-4 h-4 mr-1" />{saving ? "Adicionando..." : "Adicionar Campo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Modal: Confirmar Exclusão ───── */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />Excluir Campo
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir este campo? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDeleteField(deleteConfirmId)}>
              <Trash2 className="w-4 h-4 mr-1" />Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
