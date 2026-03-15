import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, Trash2, Printer, X, Mail, Phone, Calendar,
  Pill, ClipboardList, FlaskConical, Upload, FileText, Paperclip, Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  patient_name: string;
  prescription_date: string;
  medications: Medication[];
  notes: string | null;
}

interface ExamOrder {
  id: string;
  patient_name: string;
  exam_type: string;
  order_date: string;
  preparation_instructions: string | null;
  notes: string | null;
}

interface ExamResult {
  id: string;
  patient_name: string;
  exam_name: string;
  exam_date: string;
  notes: string | null;
  file_url: string | null;
}

interface ClinicSettings {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
}

const emptyMed: Medication = { name: "", dosage: "", frequency: "", duration: "", instructions: "" };

// ─── Print layouts ─────────────────────────────────────────────────────────────

function PrintPrescription({ prescription, clinic }: { prescription: Prescription; clinic: ClinicSettings | null }) {
  return (
    <div className="hidden print:block p-8 font-sans max-w-2xl mx-auto">
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{clinic?.name || "CuidarBem Pediatria"}</h1>
        <p className="text-sm text-gray-600">{clinic ? `${clinic.address}, ${clinic.city} - ${clinic.state}` : ""}</p>
        {clinic?.phone && <p className="text-sm text-gray-600">Tel: {clinic.phone}</p>}
      </div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">RECEITA MÉDICA</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div><span className="font-semibold">Paciente:</span> {prescription.patient_name}</div>
        <div><span className="font-semibold">Data:</span> {new Date(prescription.prescription_date).toLocaleDateString("pt-BR")}</div>
      </div>
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 mb-3 uppercase text-sm tracking-wide border-b border-gray-400 pb-1">Medicamentos</h3>
        <div className="space-y-4">
          {prescription.medications.map((med, i) => (
            <div key={i} className="border-l-4 border-gray-800 pl-3">
              <p className="font-bold text-base">{i + 1}. {med.name}</p>
              {med.dosage && <p className="text-sm"><span className="font-medium">Dosagem:</span> {med.dosage}</p>}
              {med.frequency && <p className="text-sm"><span className="font-medium">Frequência:</span> {med.frequency}</p>}
              {med.duration && <p className="text-sm"><span className="font-medium">Duração:</span> {med.duration}</p>}
              {med.instructions && <p className="text-sm text-gray-600 italic">{med.instructions}</p>}
            </div>
          ))}
        </div>
      </div>
      {prescription.notes && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Observações</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{prescription.notes}</p>
        </div>
      )}
      <div className="mt-16 pt-4 border-t border-gray-400 text-center">
        <p className="text-sm text-gray-600">Assinatura do Médico / Carimbo</p>
      </div>
    </div>
  );
}

function PrintExamOrder({ order, clinic }: { order: ExamOrder; clinic: ClinicSettings | null }) {
  return (
    <div className="hidden print:block p-8 font-sans max-w-2xl mx-auto">
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{clinic?.name || "CuidarBem Pediatria"}</h1>
        <p className="text-sm text-gray-600">{clinic ? `${clinic.address}, ${clinic.city} - ${clinic.state}` : ""}</p>
        {clinic?.phone && <p className="text-sm text-gray-600">Tel: {clinic.phone}</p>}
      </div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">PEDIDO DE EXAME</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div><span className="font-semibold">Paciente:</span> {order.patient_name}</div>
        <div><span className="font-semibold">Data:</span> {new Date(order.order_date).toLocaleDateString("pt-BR")}</div>
      </div>
      <div className="border-2 border-gray-800 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide">Exame Solicitado</h3>
        <p className="text-lg font-semibold">{order.exam_type}</p>
      </div>
      {order.preparation_instructions && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Instruções de Preparo</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap border border-gray-300 rounded p-3">{order.preparation_instructions}</p>
        </div>
      )}
      {order.notes && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Observações</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}
      <div className="mt-16 pt-4 border-t border-gray-400 text-center">
        <p className="text-sm text-gray-600">Assinatura do Médico / Carimbo</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminPatientProfile() {
  const { id: patientId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "prescriptions";
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [examOrders, setExamOrders] = useState<ExamOrder[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Print state
  const [printPrescription, setPrintPrescription] = useState<Prescription | null>(null);
  const [printOrder, setPrintOrder] = useState<ExamOrder | null>(null);

  // Forms visibility
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showExamOrderForm, setShowExamOrderForm] = useState(false);
  const [showExamResultForm, setShowExamResultForm] = useState(false);

  // Uploading
  const [uploading, setUploading] = useState(false);

  // Prescription form
  const [prescForm, setPrescForm] = useState({
    prescription_date: new Date().toISOString().split("T")[0],
    medications: [{ ...emptyMed }] as Medication[],
    notes: "",
  });

  // Exam order form
  const [orderForm, setOrderForm] = useState({
    exam_type: "",
    order_date: new Date().toISOString().split("T")[0],
    preparation_instructions: "",
    notes: "",
  });

  // Exam result form
  const [resultForm, setResultForm] = useState({
    exam_name: "",
    exam_date: new Date().toISOString().split("T")[0],
    notes: "",
    file_url: "",
  });

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    if (!patientId) return;
    fetchAll();
  }, [isAdmin, patientId, navigate]);

  const fetchAll = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const [profileRes, prescRes, ordersRes, clinicRes, resultsRaw] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, phone, created_at").eq("id", patientId).single(),
        supabase.from("prescriptions" as any).select("*").eq("user_id", patientId).order("prescription_date", { ascending: false }),
        supabase.from("exam_orders" as any).select("*").eq("user_id", patientId).order("order_date", { ascending: false }),
        supabase.from("clinic_location").select("name, address, city, state, phone").eq("is_active", true).maybeSingle(),
        supabase.from("exam_results" as any).select("*").eq("user_id", patientId).order("exam_date", { ascending: false }),
      ]);

      if (profileRes.error) throw profileRes.error;
      setPatient(profileRes.data as Patient);
      setPrescriptions((prescRes.data as unknown as Prescription[]) || []);
      setExamOrders((ordersRes.data as unknown as ExamOrder[]) || []);
      if (clinicRes.data) setClinicSettings(clinicRes.data as ClinicSettings);

      // Signed URLs for exam results files
      const rawResults = (resultsRaw.data as unknown as ExamResult[]) || [];
      const withUrls = await Promise.all(rawResults.map(async (r) => {
        if (!r.file_url) return r;
        const { data: signed } = await supabase.storage.from("exam-results").createSignedUrl(r.file_url, 3600);
        return { ...r, file_url: signed?.signedUrl ?? null };
      }));
      setExamResults(withUrls);
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Prescription handlers ─────────────────────────────────────────────────

  const handleCreatePrescription = async () => {
    if (!prescForm.prescription_date || prescForm.medications.some(m => !m.name)) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("prescriptions" as any).insert({
        user_id: patientId,
        patient_name: patient?.full_name || "",
        prescription_date: prescForm.prescription_date,
        medications: prescForm.medications,
        notes: prescForm.notes || null,
      });
      if (error) throw error;
      toast({ title: "Receita criada!" });
      setShowPrescriptionForm(false);
      setPrescForm({ prescription_date: new Date().toISOString().split("T")[0], medications: [{ ...emptyMed }], notes: "" });
      fetchAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao salvar receita", variant: "destructive" });
    }
  };

  const handleDeletePrescription = async (id: string) => {
    if (!confirm("Excluir esta receita?")) return;
    await supabase.from("prescriptions" as any).delete().eq("id", id);
    fetchAll();
  };

  const handlePrintPrescription = (p: Prescription) => {
    setPrintOrder(null);
    setPrintPrescription(p);
    setTimeout(() => window.print(), 300);
  };

  // ─── Exam order handlers ───────────────────────────────────────────────────

  const handleCreateOrder = async () => {
    if (!orderForm.exam_type || !orderForm.order_date) {
      toast({ title: "Preencha tipo de exame e data", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("exam_orders" as any).insert({
        user_id: patientId,
        patient_name: patient?.full_name || "",
        exam_type: orderForm.exam_type,
        order_date: orderForm.order_date,
        preparation_instructions: orderForm.preparation_instructions || null,
        notes: orderForm.notes || null,
      });
      if (error) throw error;
      toast({ title: "Pedido criado!" });
      setShowExamOrderForm(false);
      setOrderForm({ exam_type: "", order_date: new Date().toISOString().split("T")[0], preparation_instructions: "", notes: "" });
      fetchAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao salvar pedido", variant: "destructive" });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Excluir este pedido?")) return;
    await supabase.from("exam_orders" as any).delete().eq("id", id);
    fetchAll();
  };

  const handlePrintOrder = (o: ExamOrder) => {
    setPrintPrescription(null);
    setPrintOrder(o);
    setTimeout(() => window.print(), 300);
  };

  // ─── Exam result handlers ──────────────────────────────────────────────────

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patientId) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${patientId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("exam-results").upload(filePath, file);
      if (error) throw error;
      setResultForm(prev => ({ ...prev, file_url: filePath }));
      toast({ title: "Arquivo enviado!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar arquivo", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateResult = async () => {
    if (!resultForm.exam_name || !resultForm.exam_date) {
      toast({ title: "Preencha nome e data do exame", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("exam_results" as any).insert({
        user_id: patientId,
        patient_name: patient?.full_name || "",
        exam_name: resultForm.exam_name,
        exam_date: resultForm.exam_date,
        notes: resultForm.notes || null,
        file_url: resultForm.file_url || null,
      });
      if (error) throw error;
      toast({ title: "Resultado adicionado!" });
      setShowExamResultForm(false);
      setResultForm({ exam_name: "", exam_date: new Date().toISOString().split("T")[0], notes: "", file_url: "" });
      fetchAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao salvar resultado", variant: "destructive" });
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!confirm("Excluir este resultado?")) return;
    await supabase.from("exam_results" as any).delete().eq("id", id);
    fetchAll();
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-azul-claro/10 to-rosa-bebe/10">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-rosa-bebe rounded-full animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!patient) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Paciente não encontrado.</p>
    </div>
  );

  const initials = patient.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      {/* Print layers */}
      {printPrescription && <PrintPrescription prescription={printPrescription} clinic={clinicSettings} />}
      {printOrder && <PrintExamOrder order={printOrder} clinic={clinicSettings} />}

      <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-rosa-bebe/10 print:hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-azul-claro p-6 shadow-lg">
          <div className="max-w-5xl mx-auto">
            <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-4 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                <AvatarFallback className="bg-white text-primary text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">{patient.full_name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-white/80 text-sm">
                    <Mail className="w-3 h-3" /> {patient.email}
                  </span>
                  {patient.phone && (
                    <span className="flex items-center gap-1 text-white/80 text-sm">
                      <Phone className="w-3 h-3" /> {patient.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-white/80 text-sm">
                    <Calendar className="w-3 h-3" /> Cadastro: {format(new Date(patient.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <main className="max-w-5xl mx-auto p-6">
          <Tabs defaultValue={defaultTab}>
            <TabsList className="mb-6 h-12">
              <TabsTrigger value="prescriptions" className="gap-2 px-5">
                <Pill className="w-4 h-4" /> Receitas ({prescriptions.length})
              </TabsTrigger>
              <TabsTrigger value="exam-orders" className="gap-2 px-5">
                <ClipboardList className="w-4 h-4" /> Pedidos de Exames ({examOrders.length})
              </TabsTrigger>
              <TabsTrigger value="exam-results" className="gap-2 px-5">
                <FlaskConical className="w-4 h-4" /> Resultados ({examResults.length})
              </TabsTrigger>
            </TabsList>

            {/* ─── RECEITAS ─────────────────────────────────────────────────── */}
            <TabsContent value="prescriptions">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Receitas Médicas</h2>
                <Button onClick={() => setShowPrescriptionForm(v => !v)} variant={showPrescriptionForm ? "outline" : "default"}>
                  {showPrescriptionForm ? <><X className="w-4 h-4 mr-2" /> Cancelar</> : <><Plus className="w-4 h-4 mr-2" /> Nova Receita</>}
                </Button>
              </div>

              {showPrescriptionForm && (
                <Card className="mb-6 border-2 border-primary/30">
                  <CardHeader><CardTitle className="text-base">Nova Receita para {patient.full_name}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Data da Receita *</Label>
                      <Input type="date" value={prescForm.prescription_date} onChange={e => setPrescForm(p => ({ ...p, prescription_date: e.target.value }))} className="max-w-xs" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Medicamentos *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPrescForm(p => ({ ...p, medications: [...p.medications, { ...emptyMed }] }))}>
                          <Plus className="w-3 h-3 mr-1" /> Adicionar
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {prescForm.medications.map((med, i) => (
                          <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-muted-foreground">Medicamento {i + 1}</span>
                              {prescForm.medications.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPrescForm(p => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }))}>
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            <Input placeholder="Nome do medicamento *" value={med.name} onChange={e => setPrescForm(p => { const m = [...p.medications]; m[i] = { ...m[i], name: e.target.value }; return { ...p, medications: m }; })} />
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder="Dosagem (ex: 500mg)" value={med.dosage} onChange={e => setPrescForm(p => { const m = [...p.medications]; m[i] = { ...m[i], dosage: e.target.value }; return { ...p, medications: m }; })} />
                              <Input placeholder="Frequência (ex: 8/8h)" value={med.frequency} onChange={e => setPrescForm(p => { const m = [...p.medications]; m[i] = { ...m[i], frequency: e.target.value }; return { ...p, medications: m }; })} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder="Duração (ex: 7 dias)" value={med.duration} onChange={e => setPrescForm(p => { const m = [...p.medications]; m[i] = { ...m[i], duration: e.target.value }; return { ...p, medications: m }; })} />
                              <Input placeholder="Instruções especiais" value={med.instructions} onChange={e => setPrescForm(p => { const m = [...p.medications]; m[i] = { ...m[i], instructions: e.target.value }; return { ...p, medications: m }; })} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Observações Gerais</Label>
                      <Textarea value={prescForm.notes} onChange={e => setPrescForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observações adicionais..." rows={2} />
                    </div>
                    <Button onClick={handleCreatePrescription} className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Salvar Receita
                    </Button>
                  </CardContent>
                </Card>
              )}

              {prescriptions.length === 0 ? (
                <Card className="border-2 border-dashed border-primary/20">
                  <CardContent className="p-10 text-center text-muted-foreground">
                    <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma receita ainda. Clique em "Nova Receita" para criar.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {prescriptions.map(p => (
                    <Card key={p.id} className="border border-primary/20">
                      <CardHeader className="py-4 px-5 bg-primary/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-base">Receita — {p.medications.length} medicamento(s)</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" /> {new Date(p.prescription_date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePrintPrescription(p)}>
                              <Printer className="w-4 h-4 mr-1" /> Imprimir
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePrescription(p.id)} className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3 px-5">
                        <div className="space-y-1">
                          {p.medications.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                              <span className="font-medium">{m.name}</span>
                              {m.dosage && <span className="text-muted-foreground">— {m.dosage}</span>}
                              {m.frequency && <span className="text-muted-foreground">· {m.frequency}</span>}
                            </div>
                          ))}
                        </div>
                        {p.notes && <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{p.notes}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── PEDIDOS DE EXAMES ─────────────────────────────────────────── */}
            <TabsContent value="exam-orders">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Pedidos de Exames</h2>
                <Button onClick={() => setShowExamOrderForm(v => !v)} variant={showExamOrderForm ? "outline" : "default"}>
                  {showExamOrderForm ? <><X className="w-4 h-4 mr-2" /> Cancelar</> : <><Plus className="w-4 h-4 mr-2" /> Novo Pedido</>}
                </Button>
              </div>

              {showExamOrderForm && (
                <Card className="mb-6 border-2 border-azul-claro/30">
                  <CardHeader><CardTitle className="text-base">Novo Pedido para {patient.full_name}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo de Exame *</Label>
                        <Input value={orderForm.exam_type} onChange={e => setOrderForm(p => ({ ...p, exam_type: e.target.value }))} placeholder="Ex: Hemograma Completo" />
                      </div>
                      <div>
                        <Label>Data do Pedido *</Label>
                        <Input type="date" value={orderForm.order_date} onChange={e => setOrderForm(p => ({ ...p, order_date: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Instruções de Preparo</Label>
                      <Textarea value={orderForm.preparation_instructions} onChange={e => setOrderForm(p => ({ ...p, preparation_instructions: e.target.value }))} placeholder="Jejum de 8 horas..." rows={3} />
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea value={orderForm.notes} onChange={e => setOrderForm(p => ({ ...p, notes: e.target.value }))} placeholder="Informações adicionais..." rows={2} />
                    </div>
                    <Button onClick={handleCreateOrder} className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Salvar Pedido
                    </Button>
                  </CardContent>
                </Card>
              )}

              {examOrders.length === 0 ? (
                <Card className="border-2 border-dashed border-azul-claro/20">
                  <CardContent className="p-10 text-center text-muted-foreground">
                    <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Nenhum pedido ainda. Clique em "Novo Pedido" para criar.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {examOrders.map(o => (
                    <Card key={o.id} className="border border-azul-claro/20">
                      <CardHeader className="py-4 px-5 bg-azul-claro/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-base">{o.exam_type}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" /> {new Date(o.order_date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePrintOrder(o)}>
                              <Printer className="w-4 h-4 mr-1" /> Imprimir
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(o.id)} className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {(o.preparation_instructions || o.notes) && (
                        <CardContent className="py-3 px-5 space-y-2">
                          {o.preparation_instructions && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Preparo</p>
                              <p className="text-sm">{o.preparation_instructions}</p>
                            </div>
                          )}
                          {o.notes && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
                              <p className="text-sm text-muted-foreground">{o.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── RESULTADOS DE EXAMES ─────────────────────────────────────── */}
            <TabsContent value="exam-results">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Resultados de Exames</h2>
                <Button onClick={() => setShowExamResultForm(v => !v)} variant={showExamResultForm ? "outline" : "default"}>
                  {showExamResultForm ? <><X className="w-4 h-4 mr-2" /> Cancelar</> : <><Plus className="w-4 h-4 mr-2" /> Adicionar Resultado</>}
                </Button>
              </div>

              {showExamResultForm && (
                <Card className="mb-6 border-2 border-verde-menta/30">
                  <CardHeader><CardTitle className="text-base">Adicionar Resultado para {patient.full_name}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Exame *</Label>
                        <Input value={resultForm.exam_name} onChange={e => setResultForm(p => ({ ...p, exam_name: e.target.value }))} placeholder="Ex: Hemograma Completo" />
                      </div>
                      <div>
                        <Label>Data do Exame *</Label>
                        <Input type="date" value={resultForm.exam_date} onChange={e => setResultForm(p => ({ ...p, exam_date: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Observações / Resultado em texto</Label>
                      <Textarea value={resultForm.notes} onChange={e => setResultForm(p => ({ ...p, notes: e.target.value }))} placeholder="Valores encontrados, interpretação..." rows={3} />
                    </div>
                    <div>
                      <Label>Arquivo (PDF / Imagem)</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                          <Upload className="w-4 h-4" />
                          {uploading ? "Enviando..." : "Escolher arquivo"}
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                        </label>
                        {resultForm.file_url && <span className="text-sm text-success font-medium">✓ Arquivo carregado</span>}
                      </div>
                    </div>
                    <Button onClick={handleCreateResult} className="w-full" disabled={uploading}>
                      <Plus className="w-4 h-4 mr-2" /> Salvar Resultado
                    </Button>
                  </CardContent>
                </Card>
              )}

              {examResults.length === 0 ? (
                <Card className="border-2 border-dashed border-verde-menta/20">
                  <CardContent className="p-10 text-center text-muted-foreground">
                    <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Nenhum resultado registrado ainda.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {examResults.map(r => (
                    <Card key={r.id} className="border border-verde-menta/20">
                      <CardHeader className="py-4 px-5 bg-verde-menta/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-base">{r.exam_name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" /> {new Date(r.exam_date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteResult(r.id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      {(r.notes || r.file_url) && (
                        <CardContent className="py-3 px-5 space-y-2">
                          {r.notes && <p className="text-sm text-muted-foreground">{r.notes}</p>}
                          {r.file_url && (
                            <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                              <FileText className="w-4 h-4" /> Ver arquivo anexado
                            </a>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
