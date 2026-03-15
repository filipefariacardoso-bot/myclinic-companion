import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ClipboardList, Calendar, Printer, Trash2, User, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ExamOrder {
  id: string;
  user_id: string;
  patient_name: string;
  exam_type: string;
  order_date: string;
  preparation_instructions: string | null;
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

export default function AdminExamOrders() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<ExamOrder[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [printOrder, setPrintOrder] = useState<ExamOrder | null>(null);

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [ordersRes, profilesRes, clinicRes] = await Promise.all([
        supabase.from("exam_orders" as any).select("*").order("order_date", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email, phone"),
        supabase.from("clinic_location").select("name, address, city, state, phone").eq("is_active", true).maybeSingle(),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      if (profilesRes.error) throw profilesRes.error;
      setOrders((ordersRes.data as unknown as ExamOrder[]) || []);
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
    if (!confirm("Excluir este pedido?")) return;
    try {
      const { error } = await supabase.from("exam_orders" as any).delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Excluído!" });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handlePrint = (o: ExamOrder) => {
    setPrintOrder(o);
    setTimeout(() => window.print(), 300);
  };

  const filteredProfiles = profiles.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) return null;

  return (
    <>
      {printOrder && (
        <div className="hidden print:block p-8 font-sans max-w-2xl mx-auto">
          <div className="border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{clinicSettings?.name || "CuidarBem Pediatria"}</h1>
            <p className="text-sm text-gray-600">{clinicSettings ? `${clinicSettings.address}, ${clinicSettings.city} - ${clinicSettings.state}` : ""}</p>
            {clinicSettings?.phone && <p className="text-sm text-gray-600">Tel: {clinicSettings.phone}</p>}
          </div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">PEDIDO DE EXAME</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><span className="font-semibold">Paciente:</span> {printOrder.patient_name}</div>
            <div><span className="font-semibold">Data:</span> {new Date(printOrder.order_date).toLocaleDateString("pt-BR")}</div>
          </div>
          <div className="border-2 border-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide">Exame Solicitado</h3>
            <p className="text-lg font-semibold">{printOrder.exam_type}</p>
          </div>
          {printOrder.preparation_instructions && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Instruções de Preparo</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap border border-gray-300 rounded p-3">{printOrder.preparation_instructions}</p>
            </div>
          )}
          {printOrder.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Observações</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{printOrder.notes}</p>
            </div>
          )}
          <div className="mt-16 pt-4 border-t border-gray-400 text-center">
            <p className="text-sm text-gray-600">Assinatura do Médico / Carimbo</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-verde-menta/10 print:hidden">
        <header className="bg-gradient-to-r from-azul-claro to-verde-menta p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <Button onClick={() => navigate("/admin")} variant="ghost" size="sm" className="mb-4 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">🧪</div>
              <div>
                <h1 className="text-2xl font-bold text-white">Pedidos de Exames</h1>
                <p className="text-sm text-white/90">Selecione um paciente para criar ou visualizar pedidos</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          <Card className="border-2 border-azul-claro/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-azul-claro" /> Pacientes
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
                    const count = orders.filter(o => o.user_id === profile.id).length;
                    return (
                      <Card
                        key={profile.id}
                        className="border border-azul-claro/20 hover:border-azul-claro/60 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/admin/patient/${profile.id}?tab=exam-orders`)}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarFallback className="bg-azul-claro/20 text-azul-claro font-bold text-sm">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                            <p className="text-xs text-azul-claro mt-0.5">{count} pedido(s)</p>
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

          <Card className="border-2 border-azul-claro/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-azul-claro" /> Todos os Pedidos ({orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Nenhum pedido cadastrado ainda.</p>
              ) : (
                <div className="grid gap-3">
                  {orders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-azul-claro/10 bg-azul-claro/5">
                      <div>
                        <p className="font-medium text-sm">{o.patient_name} — {o.exam_type}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {new Date(o.order_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/patient/${o.user_id}?tab=exam-orders`)}>
                          Ver paciente
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handlePrint(o)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)} className="text-destructive hover:bg-destructive/10">
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
