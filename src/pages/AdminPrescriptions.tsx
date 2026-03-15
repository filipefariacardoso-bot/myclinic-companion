import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Pill, Calendar, Printer, X } from "lucide-react";
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

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  user_id: string;
  patient_name: string;
  prescription_date: string;
  medications: Medication[];
  notes: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface ClinicSettings {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
}

const emptyMed: Medication = { name: "", dosage: "", frequency: "", duration: "", instructions: "" };

export default function AdminPrescriptions() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [filterPatient, setFilterPatient] = useState("all");

  const [formData, setFormData] = useState({
    user_id: "",
    patient_name: "",
    prescription_date: new Date().toISOString().split("T")[0],
    medications: [{ ...emptyMed }] as Medication[],
    notes: "",
  });

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [presRes, profilesRes, clinicRes] = await Promise.all([
        supabase.from("prescriptions" as any).select("*").order("prescription_date", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("clinic_location").select("name, address, city, state, phone").eq("is_active", true).maybeSingle(),
      ]);
      if (presRes.error) throw presRes.error;
      if (profilesRes.error) throw profilesRes.error;
      setPrescriptions((presRes.data as unknown as Prescription[]) || []);
      setProfiles(profilesRes.data || []);
      if (clinicRes.data) setClinicSettings(clinicRes.data as ClinicSettings);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setFormData(prev => ({ ...prev, medications: [...prev.medications, { ...emptyMed }] }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({ ...prev, medications: prev.medications.filter((_, i) => i !== index) }));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    setFormData(prev => {
      const meds = [...prev.medications];
      meds[index] = { ...meds[index], [field]: value };
      return { ...prev, medications: meds };
    });
  };

  const handleSubmit = async () => {
    if (!formData.user_id || !formData.prescription_date) {
      toast({ title: "Campos obrigatórios", description: "Selecione o paciente e a data.", variant: "destructive" });
      return;
    }
    if (formData.medications.some(m => !m.name)) {
      toast({ title: "Nome do medicamento obrigatório", description: "Preencha o nome de todos os medicamentos.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("prescriptions" as any).insert({
        user_id: formData.user_id,
        patient_name: formData.patient_name,
        prescription_date: formData.prescription_date,
        medications: formData.medications,
        notes: formData.notes || null,
      });
      if (error) throw error;
      toast({ title: "Receita criada!", description: "Receita médica adicionada com sucesso." });
      setDialogOpen(false);
      setFormData({ user_id: "", patient_name: "", prescription_date: new Date().toISOString().split("T")[0], medications: [{ ...emptyMed }], notes: "" });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível salvar a receita.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return;
    try {
      const { error } = await supabase.from("prescriptions" as any).delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Excluída!", description: "Receita removida com sucesso." });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível excluir.", variant: "destructive" });
    }
  };

  const handlePrint = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setTimeout(() => window.print(), 300);
  };

  const filteredPrescriptions = filterPatient === "all"
    ? prescriptions
    : prescriptions.filter(p => p.user_id === filterPatient);

  if (!isAdmin) return null;

  return (
    <>
      {/* Print Layout */}
      {selectedPrescription && (
        <div className="hidden print:block p-8 font-sans max-w-2xl mx-auto">
          <div className="border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{clinicSettings?.name || "CuidarBem Pediatria"}</h1>
            <p className="text-sm text-gray-600">{clinicSettings ? `${clinicSettings.address}, ${clinicSettings.city} - ${clinicSettings.state}` : ""}</p>
            {clinicSettings?.phone && <p className="text-sm text-gray-600">Tel: {clinicSettings.phone}</p>}
          </div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">RECEITA MÉDICA</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><span className="font-semibold">Paciente:</span> {selectedPrescription.patient_name}</div>
            <div><span className="font-semibold">Data:</span> {new Date(selectedPrescription.prescription_date).toLocaleDateString("pt-BR")}</div>
          </div>
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 uppercase text-sm tracking-wide border-b border-gray-400 pb-1">Medicamentos</h3>
            <div className="space-y-4">
              {selectedPrescription.medications.map((med, i) => (
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
          {selectedPrescription.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Observações</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedPrescription.notes}</p>
            </div>
          )}
          <div className="mt-16 pt-4 border-t border-gray-400 text-center">
            <p className="text-sm text-gray-600">Assinatura do Médico / Carimbo</p>
          </div>
        </div>
      )}

      {/* Screen Layout */}
      <div className="min-h-screen bg-gradient-to-br from-background via-verde-menta/10 to-azul-claro/10 print:hidden">
        <header className="bg-gradient-to-r from-verde-menta to-azul-claro p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <Button onClick={() => navigate("/admin")} variant="ghost" size="sm" className="mb-4 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
            </Button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">💊</div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Receitas Médicas</h1>
                  <p className="text-sm text-white/90">Crie e gerencie receitas por paciente</p>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-verde-menta hover:bg-white/90">
                    <Plus className="w-4 h-4 mr-2" /> Nova Receita
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Receita Médica</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Paciente *</Label>
                        <Select value={formData.user_id} onValueChange={(v) => {
                          const p = profiles.find(x => x.id === v);
                          setFormData(prev => ({ ...prev, user_id: v, patient_name: p?.full_name || "" }));
                        }}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {profiles.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Data *</Label>
                        <Input type="date" value={formData.prescription_date} onChange={e => setFormData(prev => ({ ...prev, prescription_date: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Medicamentos *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                          <Plus className="w-3 h-3 mr-1" /> Adicionar
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {formData.medications.map((med, i) => (
                          <div key={i} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-muted-foreground">Medicamento {i + 1}</span>
                              {formData.medications.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMedication(i)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            <Input placeholder="Nome do medicamento *" value={med.name} onChange={e => updateMedication(i, "name", e.target.value)} />
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder="Dosagem (ex: 500mg)" value={med.dosage} onChange={e => updateMedication(i, "dosage", e.target.value)} />
                              <Input placeholder="Frequência (ex: 8/8h)" value={med.frequency} onChange={e => updateMedication(i, "frequency", e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder="Duração (ex: 7 dias)" value={med.duration} onChange={e => updateMedication(i, "duration", e.target.value)} />
                              <Input placeholder="Instruções especiais" value={med.instructions} onChange={e => updateMedication(i, "instructions", e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Observações Gerais</Label>
                      <Textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Observações adicionais..." rows={2} />
                    </div>
                    <Button onClick={handleSubmit} className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Criar Receita
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Label className="whitespace-nowrap">Filtrar por paciente:</Label>
            <Select value={filterPatient} onValueChange={setFilterPatient}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pacientes</SelectItem>
                {profiles.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-verde-menta to-azul-claro rounded-full animate-pulse" />
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <Card className="border-2 border-dashed border-verde-menta/30">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">💊</div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma receita cadastrada</h3>
                <p className="text-muted-foreground">Clique em "Nova Receita" para criar.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPrescriptions.map(prescription => (
                <Card key={prescription.id} className="border-2 border-verde-menta/30">
                  <CardHeader className="bg-verde-menta/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Pill className="w-6 h-6 text-verde-menta" />
                        <div>
                          <CardTitle className="text-lg">Receita — {prescription.patient_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{prescription.medications.length} medicamento(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(prescription.prescription_date).toLocaleDateString("pt-BR")}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handlePrint(prescription)}>
                          <Printer className="w-4 h-4 mr-1" /> Imprimir
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(prescription.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-1">
                      {prescription.medications.map((med, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-verde-menta/20 text-verde-menta flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                          <span className="font-medium">{med.name}</span>
                          {med.dosage && <span className="text-muted-foreground">— {med.dosage}</span>}
                          {med.frequency && <span className="text-muted-foreground">· {med.frequency}</span>}
                          {med.duration && <span className="text-muted-foreground">· {med.duration}</span>}
                        </div>
                      ))}
                    </div>
                    {prescription.notes && (
                      <p className="mt-2 text-sm text-muted-foreground border-t pt-2">{prescription.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
