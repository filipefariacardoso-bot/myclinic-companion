import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Trash2, Plus, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  patient_name: string;
  appointment_date: string;
  appointment_type: string;
  status: string | null;
  notes: string | null;
  user_id: string;
}

export default function AdminAppointments() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_name: "",
    appointment_date: "",
    appointment_type: "",
    notes: "",
    status: "scheduled",
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadAppointments();
  }, [isAdmin, navigate]);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("appointments")
          .update({
            patient_name: formData.patient_name,
            appointment_date: formData.appointment_date,
            appointment_type: formData.appointment_type,
            notes: formData.notes || null,
            status: formData.status,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Consulta atualizada!");
      } else {
        const { error } = await supabase.from("appointments").insert({
          patient_name: formData.patient_name,
          appointment_date: formData.appointment_date,
          appointment_type: formData.appointment_type,
          notes: formData.notes || null,
          status: formData.status,
          user_id: user.id,
        });

        if (error) throw error;

        // Save in-app notification for admin
        const dateLabel = format(new Date(formData.appointment_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Nova Consulta Agendada",
          message: `Paciente: ${formData.patient_name} | ${formData.appointment_type} | ${dateLabel}`,
          type: "appointment",
        });

        toast.success("Consulta agendada!");
      }

      resetForm();
      loadAppointments();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar consulta");
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      patient_name: appointment.patient_name,
      appointment_date: appointment.appointment_date.slice(0, 16),
      appointment_type: appointment.appointment_type,
      notes: appointment.notes || "",
      status: appointment.status || "scheduled",
    });
    setEditingId(appointment.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      patient_name: "",
      appointment_date: "",
      appointment_type: "",
      notes: "",
      status: "scheduled",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success("Status atualizado!");
      loadAppointments();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta consulta?")) return;

    try {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Consulta excluída!");
      loadAppointments();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir");
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "confirmed": return "bg-success/20 text-success";
      case "cancelled": return "bg-destructive/20 text-destructive";
      case "completed": return "bg-info/20 text-info";
      default: return "bg-warning/20 text-warning";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "confirmed": return "Confirmada";
      case "cancelled": return "Cancelada";
      case "completed": return "Realizada";
      default: return "Pendente";
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rosa-bebe/20 to-roxo-suave/20">
      <header className="bg-gradient-to-r from-rosa-bebe to-roxo-suave p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
                📅
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gerenciar Consultas</h1>
                <p className="text-sm text-white/90">Visualize e gerencie agendamentos</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-white text-rosa-bebe hover:bg-white/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {showForm && (
          <Card className="border-2 border-rosa-bebe/30">
            <CardHeader>
              <CardTitle>{editingId ? "Editar Consulta" : "Nova Consulta"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Nome do Paciente"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  required
                />
                <Input
                  type="datetime-local"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  required
                />
                <Input
                  placeholder="Tipo de Consulta (ex: Consulta Pediátrica, Retorno)"
                  value={formData.appointment_type}
                  onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Observações (opcional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button type="submit">{editingId ? "Atualizar" : "Agendar"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rosa-bebe to-roxo-suave rounded-full animate-pulse" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma consulta agendada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="border-2 border-rosa-bebe/20">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.patient_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.appointment_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <span className="inline-block mt-1 px-2 py-1 bg-rosa-bebe/20 text-rosa-bebe text-xs rounded-full">
                        {appointment.appointment_type}
                      </span>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">{appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                      <div className="flex gap-2 mt-2 flex-wrap justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(appointment)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(appointment.id, "confirmed")}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(appointment.id, "completed")}
                        >
                          Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
