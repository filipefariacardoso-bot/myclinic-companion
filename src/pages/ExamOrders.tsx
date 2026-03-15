import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ClipboardList, Calendar, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExamOrder {
  id: string;
  patient_name: string;
  exam_type: string;
  order_date: string;
  preparation_instructions: string | null;
  notes: string | null;
}

interface ClinicSettings {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
}

export default function ExamOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<ExamOrder[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ExamOrder | null>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersRes, clinicRes] = await Promise.all([
        supabase.from("exam_orders" as any).select("*").eq("user_id", user?.id).order("order_date", { ascending: false }),
        supabase.from("clinic_location").select("name, address, city, state, phone").eq("is_active", true).maybeSingle(),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      setOrders((ordersRes.data as unknown as ExamOrder[]) || []);
      if (clinicRes.data) setClinicSettings(clinicRes.data as ClinicSettings);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível carregar os pedidos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (order: ExamOrder) => {
    setSelectedOrder(order);
    setTimeout(() => window.print(), 300);
  };

  return (
    <>
      {/* Print Layout */}
      {selectedOrder && (
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
      <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-verde-menta/20 print:hidden">
        <header className="bg-gradient-to-r from-azul-claro to-verde-menta p-6 rounded-b-3xl shadow-lg">
          <div className="max-w-6xl mx-auto">
            <Button onClick={() => navigate("/")} variant="ghost" size="sm" className="mb-4 text-foreground hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">🧪</div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Meus Pedidos de Exames</h1>
                <p className="text-sm text-muted-foreground">Pedidos de exames emitidos pelo médico</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-verde-menta rounded-full animate-pulse" />
              <p className="text-muted-foreground">Carregando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card className="border-2 border-azul-claro/30">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🧪</div>
                <h3 className="text-xl font-semibold mb-2">Nenhum pedido disponível</h3>
                <p className="text-muted-foreground">Seus pedidos de exames aparecerão aqui quando o médico os emitir.</p>
              </CardContent>
            </Card>
          ) : (
            orders.map(order => (
              <Card key={order.id} className="border-2 border-azul-claro/30 hover:border-azul-claro transition-all">
                <CardHeader className="bg-azul-claro/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-6 h-6 text-azul-claro" />
                      <div>
                        <CardTitle className="text-lg">{order.exam_type}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.order_date).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePrint(order)}>
                      <Printer className="w-4 h-4 mr-1" /> Imprimir
                    </Button>
                  </div>
                </CardHeader>
                {(order.preparation_instructions || order.notes) && (
                  <CardContent className="pt-4 space-y-3">
                    {order.preparation_instructions && (
                      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                        <p className="text-xs font-semibold text-warning uppercase tracking-wide mb-1">⚠️ Instruções de Preparo</p>
                        <p className="text-sm whitespace-pre-wrap">{order.preparation_instructions}</p>
                      </div>
                    )}
                    {order.notes && (
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </main>
      </div>
    </>
  );
}
