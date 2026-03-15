import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, ClipboardList, Calendar, Printer } from "lucide-react";
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

interface ExamOrder {
  id: string;
  user_id: string;
  patient_name: string;
  exam_type: string;
  order_date: string;
  preparation_instructions: string | null;
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

export default function AdminExamOrders() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<ExamOrder[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ExamOrder | null>(null);
  const [filterPatient, setFilterPatient] = useState("all");

  const [formData, setFormData] = useState({
    user_id: "",
    patient_name: "",
    exam_type: "",
    order_date: new Date().toISOString().split("T")[0],
    preparation_instructions: "",
    notes: "",
  });

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [ordersRes, profilesRes, clinicRes] = await Promise.all([
        supabase.from("exam_orders" as any).select("*").order("order_date", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
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

  const handleSubmit = async () => {
    if (!formData.user_id || !formData.exam_type || !formData.order_date) {
      toast({ title: "Campos obrigatórios", description: "Preencha paciente, tipo de exame e data.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("exam_orders" as any).insert({
        user_id: formData.user_id,
        patient_name: formData.patient_name,
        exam_type: formData.exam_type,
        order_date: formData.order_date,
        preparation_instructions: formData.preparation_instructions || null,
        notes: formData.notes || null,
      });
      if (error) throw error;
      toast({ title: "Pedido criado!", description: "Pedido de exame adicionado com sucesso." });
      setDialogOpen(false);
      setFormData({ user_id: "", patient_name: "", exam_type: "", order_date: new Date().toISOString().split("T")[0], preparation_instructions: "", notes: "" });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível salvar o pedido.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido?")) return;
    try {
      const { error } = await supabase.from("exam_orders" as any).delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Excluído!", description: "Pedido removido com sucesso." });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível excluir.", variant: "destructive" });
    }
  };

  const handlePrint = (order: ExamOrder) => {
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filteredOrders = filterPatient === "all"
    ? orders
    : orders.filter(o => o.user_id === filterPatient);

  if (!isAdmin) return null;

  return (
    <>
      {/* Print Layout */}
      {selectedOrder && (
        <div className="hidden print:block print-area p-8 font-sans">
          <div className="border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{clinicSettings?.name || "CuidarBem Pediatria"}</h1>
            <p className="text-sm text-gray-600">{clinicSettings ? `${clinicSettings.address}, ${clinicSettings.city} - ${clinicSettings.state}` : ""}</p>
            {clinicSettings?.phone && <p className="text-sm text-gray-600">Tel: {clinicSettings.phone}</p>}
          </div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">PEDIDO DE EXAME</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><span className="font-semibold">Paciente:</span> {selectedOrder.patient_name}</div>
            <div><span className="font-semibold">Data:</span> {new Date(selectedOrder.order_date).toLocaleDateString("pt-BR")}</div>
          </div>
          <div className="border-2 border-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide">Exame Solicitado</h3>
            <p className="text-lg font-semibold">{selectedOrder.exam_type}</p>
          </div>
          {selectedOrder.preparation_instructions && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Instruções de Preparo</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap border border-gray-300 rounded p-3">{selectedOrder.preparation_instructions}</p>
            </div>
          )}
          {selectedOrder.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Observações</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedOrder.notes}</p>
            </div>
          )}
          <div className="mt-16 pt-4 border-t border-gray-400 text-center">
            <p className="text-sm text-gray-600">Assinatura do Médico / Carimbo</p>
          </div>
        </div>
      )}

      {/* Screen Layout */}
      <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-verde-menta/10 print:hidden">
        <header className="bg-gradient-to-r from-azul-claro to-verde-menta p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <Button onClick={() => navigate("/admin")} variant="ghost" size="sm" className="mb-4 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
            </Button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">🧪</div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Pedidos de Exames</h1>
                  <p className="text-sm text-white/90">Gerencie pedidos de exames por paciente</p>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-azul-claro hover:bg-white/90">
                    <Plus className="w-4 h-4 mr-2" /> Novo Pedido
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Novo Pedido de Exame</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Paciente *</Label>
                      <Select value={formData.user_id} onValueChange={(v) => {
                        const p = profiles.find(x => x.id === v);
                        setFormData(prev => ({ ...prev, user_id: v, patient_name: p?.full_name || "" }));
                      }}>
                        <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                        <SelectContent>
                          {profiles.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.full_name} ({p.email})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tipo de Exame *</Label>
                      <Input value={formData.exam_type} onChange={e => setFormData(prev => ({ ...prev, exam_type: e.target.value }))} placeholder="Ex: Hemograma Completo, Ultrassom Abdominal" />
                    </div>
                    <div>
                      <Label>Data do Pedido *</Label>
                      <Input type="date" value={formData.order_date} onChange={e => setFormData(prev => ({ ...prev, order_date: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Instruções de Preparo</Label>
                      <Textarea value={formData.preparation_instructions} onChange={e => setFormData(prev => ({ ...prev, preparation_instructions: e.target.value }))} placeholder="Jejum de 8 horas, não ingerir líquidos..." rows={3} />
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Informações adicionais..." rows={2} />
                    </div>
                    <Button onClick={handleSubmit} className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Criar Pedido
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6">
          {/* Filter */}
          <div className="mb-6 flex items-center gap-4">
            <Label className="whitespace-nowrap">Filtrar por paciente:</Label>
            <Select value={filterPatient} onValueChange={setFilterPatient}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
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
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-verde-menta rounded-full animate-pulse" />
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="border-2 border-dashed border-azul-claro/30">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🧪</div>
                <h3 className="text-xl font-semibold mb-2">Nenhum pedido cadastrado</h3>
                <p className="text-muted-foreground">Clique em "Novo Pedido" para criar um pedido de exame.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map(order => (
                <Card key={order.id} className="border-2 border-azul-claro/30">
                  <CardHeader className="bg-azul-claro/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ClipboardList className="w-6 h-6 text-azul-claro" />
                        <div>
                          <CardTitle className="text-lg">{order.exam_type}</CardTitle>
                          <p className="text-sm text-muted-foreground">Paciente: {order.patient_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.order_date).toLocaleDateString("pt-BR")}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handlePrint(order)}>
                          <Printer className="w-4 h-4 mr-1" /> Imprimir
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {(order.preparation_instructions || order.notes) && (
                    <CardContent className="pt-4 space-y-2">
                      {order.preparation_instructions && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Preparo</p>
                          <p className="text-sm">{order.preparation_instructions}</p>
                        </div>
                      )}
                      {order.notes && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
                          <p className="text-sm text-muted-foreground">{order.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
