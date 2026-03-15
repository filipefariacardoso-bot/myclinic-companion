import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pill, Calendar, Printer, Paperclip, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  attachment_url: string | null;
  attachment_name: string | null;
}

interface ClinicSettings {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
}

export default function Prescriptions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [presRes, clinicRes] = await Promise.all([
        supabase.from("prescriptions" as any).select("*").eq("user_id", user?.id).order("prescription_date", { ascending: false }),
        supabase.from("clinic_location").select("name, address, city, state, phone").eq("is_active", true).maybeSingle(),
      ]);
      if (presRes.error) throw presRes.error;

      // Generate signed URLs for attachments
      const rawPresc = (presRes.data as unknown as Prescription[]) || [];
      const prescWithUrls = await Promise.all(rawPresc.map(async (p) => {
        if (!p.attachment_url) return p;
        const { data: signed } = await supabase.storage.from("prescriptions").createSignedUrl(p.attachment_url, 3600);
        return { ...p, attachment_url: signed?.signedUrl ?? null };
      }));
      setPrescriptions(prescWithUrls);

      if (clinicRes.data) setClinicSettings(clinicRes.data as ClinicSettings);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível carregar as receitas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setTimeout(() => window.print(), 300);
  };

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
      <div className="min-h-screen bg-gradient-to-br from-background via-verde-menta/20 to-azul-claro/20 print:hidden">
        <header className="bg-gradient-to-r from-verde-menta to-azul-claro p-6 rounded-b-3xl shadow-lg">
          <div className="max-w-6xl mx-auto">
            <Button onClick={() => navigate("/")} variant="ghost" size="sm" className="mb-4 text-foreground hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">💊</div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Minhas Receitas</h1>
                <p className="text-sm text-muted-foreground">Receitas médicas emitidas pelo médico</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-verde-menta to-azul-claro rounded-full animate-pulse" />
              <p className="text-muted-foreground">Carregando receitas...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <Card className="border-2 border-verde-menta/30">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">💊</div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma receita disponível</h3>
                <p className="text-muted-foreground">Suas receitas aparecerão aqui quando o médico as emitir.</p>
              </CardContent>
            </Card>
          ) : (
            prescriptions.map(prescription => (
              <Card key={prescription.id} className="border-2 border-verde-menta/30 hover:border-verde-menta transition-all">
                <CardHeader className="bg-verde-menta/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="w-6 h-6 text-verde-menta" />
                      <div>
                        <CardTitle className="text-lg">Receita Médica</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(prescription.prescription_date).toLocaleDateString("pt-BR")}
                          <span>· {prescription.medications.length} medicamento(s)</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePrint(prescription)}>
                      <Printer className="w-4 h-4 mr-1" /> Imprimir
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {prescription.medications.map((med, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/40">
                        <span className="w-5 h-5 rounded-full bg-verde-menta/20 text-verde-menta flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <div className="text-sm">
                          <span className="font-semibold">{med.name}</span>
                          {med.dosage && <span className="text-muted-foreground"> — {med.dosage}</span>}
                          {med.frequency && <span className="text-muted-foreground"> · {med.frequency}</span>}
                          {med.duration && <span className="text-muted-foreground"> · {med.duration}</span>}
                          {med.instructions && <p className="text-muted-foreground italic text-xs mt-0.5">{med.instructions}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {prescription.notes && (
                    <p className="mt-3 text-sm text-muted-foreground border-t pt-2">{prescription.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </main>
      </div>
    </>
  );
}
