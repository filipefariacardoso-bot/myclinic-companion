import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  patient_name: string;
  appointment_date: string;
  appointment_type: string;
  notes: string | null;
  status: string;
}

export default function Appointments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user!.id)
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
      toast.error("Erro ao carregar consultas");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-azul-claro/20 text-azul-claro";
      case "confirmed":
        return "bg-success/20 text-success";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendada";
      case "confirmed":
        return "Confirmada";
      case "completed":
        return "Realizada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-verde-menta/20">
      <header className="bg-gradient-to-r from-azul-claro to-verde-menta p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              📅
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Minhas Consultas</h1>
              <p className="text-sm text-muted-foreground">
                Consultas agendadas e histórico
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-verde-menta rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma consulta agendada</h3>
              <p className="text-muted-foreground">
                Entre em contato com a clínica para agendar sua consulta
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="border-2 border-azul-claro/30 hover:shadow-lg transition-all"
              >
                <CardHeader className="bg-azul-claro/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {appointment.patient_name}
                    </CardTitle>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(
                        new Date(appointment.appointment_date),
                        "EEEE, dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(new Date(appointment.appointment_date), "HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Tipo de consulta:</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.appointment_type}
                    </p>
                  </div>
                  {appointment.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Observações:</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
