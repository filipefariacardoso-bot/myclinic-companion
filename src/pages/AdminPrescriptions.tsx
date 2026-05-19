import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pill, Calendar, Printer, Trash2, User, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface ClinicSettings {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
}

export default function AdminPrescriptions() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [printPrescription, setPrintPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [presRes, profilesRes, clinicRes] = await Promise.all([
        supabase.from("prescriptions" as any).select("*").order("prescription_date", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email, phone"),
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

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta receita?")) return;
    try {
      const { error } = await supabase.from("prescriptions" as any).delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Excluída!", description: "Receita removida." });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handlePrint = (p: Prescription) => {
    setPrintPrescription(p);
    setTimeout(() => window.print(), 300);
  };

  const filteredProfiles = profiles.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) return null;

  return (
    <>
      {/* Print layout */}
      {printPrescription && (
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
            <div><span className="font-semibold">Paciente:</span> {printPrescription.patient_name}</div>
            <div><span className="font-semibold">Data:</span> {new Date(printPrescription.prescription_date).toLocaleDateString("pt-BR")}</div>
          </div>
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 uppercase text-sm tracking-wide border-b border-gray-400 pb-1">Medicamentos</h3>
            <div className="space-y-4">
              {printPrescription.medications.map((med, i) => (
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
          {printPrescription.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Observações</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{printPrescription.notes}</p>
            </div>
          )}
          <div className="mt-16 pt-4 border-t border-gray-400 text-center">
            <p className="text-sm text-gray-600">Assinatura do Médico / Carimbo</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-background via-verde-menta/10 to-azul-claro/10 print:hidden">
        <header className="bg-gradient-to-r from-verde-menta to-azul-claro p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <Button onClick={() => navigate("/admin")} variant="ghost" size="sm" className="mb-4 text-gray-900 hover:bg-white/40">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">💊</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Receitas Médicas</h1>
                <p className="text-sm text-gray-800">Selecione um paciente para criar ou visualizar receitas</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Patient list */}
          <Card className="border-2 border-verde-menta/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-verde-menta" /> Pacientes
              </CardTitle>
              <Input
                placeholder="Buscar paciente por nome ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum paciente encontrado.</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProfiles.map(profile => {
                    const initials = profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                    const count = prescriptions.filter(p => p.user_id === profile.id).length;
                    return (
                      <Card
                        key={profile.id}
                        className="border border-verde-menta/20 hover:border-verde-menta/60 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/admin/patient/${profile.id}?tab=prescriptions`)}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarFallback className="bg-verde-menta/20 text-verde-menta font-bold text-sm">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                            <p className="text-xs text-verde-menta mt-0.5">{count} receita(s)</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All prescriptions overview */}
          <Card className="border-2 border-verde-menta/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-verde-menta" /> Todas as Receitas ({prescriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Nenhuma receita cadastrada ainda.</p>
              ) : (
                <div className="grid gap-3">
                  {prescriptions.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-verde-menta/10 bg-verde-menta/5">
                      <div>
                        <p className="font-medium text-sm">{p.patient_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {new Date(p.prescription_date).toLocaleDateString("pt-BR")}
                          &nbsp;·&nbsp; {p.medications.length} medicamento(s)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/patient/${p.user_id}?tab=prescriptions`)}>
                          Ver paciente
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handlePrint(p)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
