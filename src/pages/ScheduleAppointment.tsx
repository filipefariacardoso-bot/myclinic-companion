import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, CalendarDays, Clock, User, Stethoscope, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isBefore, startOfDay, isWeekend, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Brasilia timezone offset: UTC-3
const BRASILIA_OFFSET = -3 * 60; // in minutes

function getBrasiliaDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + BRASILIA_OFFSET * 60000);
}

const MORNING_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00"];
const AFTERNOON_SLOTS = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];
const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

const APPOINTMENT_TYPES = [
  "Consulta Pediátrica",
  "Consulta Gastro/Hepato Pediátrica",
  "Retorno",
  "Consulta de Urgência",
];

export default function ScheduleAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [appointmentType, setAppointmentType] = useState(APPOINTMENT_TYPES[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = getBrasiliaDate();
  const todayStart = startOfDay(today);

  // When a date is selected, load booked slots for that day
  useEffect(() => {
    if (!selectedDate) return;
    loadBookedSlots(selectedDate);
    setSelectedSlot("");
  }, [selectedDate]);

  const loadBookedSlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date")
        .gte("appointment_date", dayStart.toISOString())
        .lte("appointment_date", dayEnd.toISOString())
        .not("status", "eq", "cancelled");

      if (error) throw error;

      const slots = (data || []).map((a) =>
        format(new Date(a.appointment_date), "HH:mm")
      );
      setBookedSlots(slots);
    } catch (err) {
      console.error("Erro ao carregar horários:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    // Disable weekends
    if (isWeekend(date)) return true;
    // Disable past days
    if (isBefore(startOfDay(date), todayStart)) return true;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDate || !selectedSlot || !patientName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const [hours, minutes] = selectedSlot.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const { error } = await supabase.from("appointments").insert({
        user_id: user.id,
        patient_name: patientName,
        appointment_date: appointmentDate.toISOString(),
        appointment_type: appointmentType,
        notes: notes || null,
        status: "scheduled",
      });

      if (error) throw error;

      // Save in-app notification for the admin
      const dateLabel = format(appointmentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Nova Solicitação de Consulta",
        message: `Paciente: ${patientName} | ${appointmentType} | ${dateLabel}`,
        type: "appointment",
      });

      setSuccess(true);
    } catch (err) {
      console.error("Erro ao agendar:", err);
      toast.error("Erro ao agendar consulta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-verde-menta/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center border-2 border-success/40 shadow-xl">
          <CardContent className="pt-10 pb-10 space-y-4">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-success">Solicitação Enviada! ✅</h2>

            {/* Prominent confirmation banner */}
            <div className="bg-success/10 border-2 border-success/30 rounded-xl p-4 text-left space-y-1">
              <p className="text-success font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Sua consulta foi solicitada com sucesso!
              </p>
              <p className="text-success/80 text-sm">Aguarde a confirmação da clínica.</p>
            </div>

            {selectedDate && selectedSlot && (
              <div className="bg-azul-claro/10 rounded-xl p-4 space-y-2 text-sm text-left">
                <p className="font-semibold">
                  📅 {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="font-semibold">🕐 {selectedSlot}h (Horário de Brasília)</p>
                <p className="text-muted-foreground">Paciente: {patientName}</p>
                <p className="text-muted-foreground">{appointmentType}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Em caso de dúvidas, entre em contato com a clínica.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button onClick={() => navigate("/appointments")} variant="outline">
                Minhas Consultas
              </Button>
              <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-azul-claro to-verde-menta">
                Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-verde-menta/20">
      {/* Header */}
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
              📆
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agendar Consulta</h1>
              <p className="text-sm text-muted-foreground">
                Escolha o melhor dia e horário para você
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Doctor Info Card */}
        <Card className="border-2 border-azul-claro/30 bg-gradient-to-r from-azul-claro/10 to-verde-menta/10">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-azul-claro to-verde-menta rounded-full flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                👩‍⚕️
              </div>
              <div>
                <h3 className="font-bold text-lg">Dra. Michelle Caires</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-azul-claro/20 text-azul-claro rounded-full text-xs font-medium">
                    <Stethoscope className="w-3 h-3" /> Pediatra
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-verde-menta/20 text-verde-menta rounded-full text-xs font-medium">
                    <Stethoscope className="w-3 h-3" /> Gastro/Hepato Pediatra
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" /> Segunda a Sexta
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> Manhã: 08h às 11h
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> Tarde: 14h às 19h
              </span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Calendar */}
            <Card className="border-2 border-azul-claro/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-azul-claro" />
                  1. Escolha a data
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  locale={ptBR}
                  className={cn("pointer-events-auto rounded-md")}
                  fromDate={today}
                  toDate={addDays(today, 60)}
                />
              </CardContent>
            </Card>

            {/* Right: Time slots + Form */}
            <div className="space-y-4">
              {/* Time Slots */}
              <Card className={cn("border-2", selectedDate ? "border-verde-menta/30" : "border-muted/30 opacity-60")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-verde-menta" />
                    2. Escolha o horário
                  </CardTitle>
                  {selectedDate && (
                    <p className="text-xs text-muted-foreground">
                      {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {!selectedDate ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Selecione uma data primeiro
                    </p>
                  ) : loadingSlots ? (
                    <div className="text-center py-4">
                      <div className="w-8 h-8 mx-auto bg-azul-claro/30 rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Manhã</p>
                      <div className="grid grid-cols-4 gap-2">
                        {MORNING_SLOTS.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          const isSelected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                "py-2 rounded-lg text-sm font-medium transition-all border-2",
                                isBooked
                                  ? "bg-muted/40 text-muted-foreground border-muted/30 cursor-not-allowed line-through"
                                  : isSelected
                                  ? "bg-azul-claro text-white border-azul-claro shadow-md scale-105"
                                  : "bg-background hover:bg-azul-claro/10 border-azul-claro/30 hover:border-azul-claro"
                              )}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">Tarde</p>
                      <div className="grid grid-cols-4 gap-2">
                        {AFTERNOON_SLOTS.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          const isSelected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                "py-2 rounded-lg text-sm font-medium transition-all border-2",
                                isBooked
                                  ? "bg-muted/40 text-muted-foreground border-muted/30 cursor-not-allowed line-through"
                                  : isSelected
                                  ? "bg-verde-menta text-white border-verde-menta shadow-md scale-105"
                                  : "bg-background hover:bg-verde-menta/10 border-verde-menta/30 hover:border-verde-menta"
                              )}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-azul-claro inline-block" /> Disponível (manhã)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-muted inline-block" /> Ocupado
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Patient Form */}
              <Card className={cn("border-2", selectedSlot ? "border-rosa-bebe/30" : "border-muted/30 opacity-60")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-5 h-5 text-rosa-bebe" />
                    3. Dados do paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome do Paciente *</label>
                    <Input
                      placeholder="Nome completo da criança"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      disabled={!selectedSlot}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo de Consulta *</label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value)}
                      disabled={!selectedSlot}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {APPOINTMENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Observações (opcional)</label>
                    <Textarea
                      placeholder="Descreva brevemente o motivo da consulta..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={!selectedSlot}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Summary + Submit */}
          {selectedDate && selectedSlot && patientName && (
            <Card className="border-2 border-azul-claro/40 bg-gradient-to-r from-azul-claro/10 to-verde-menta/10 mt-6">
              <CardContent className="pt-5 pb-5">
                <h3 className="font-semibold mb-3">Resumo do agendamento</h3>
                <div className="grid sm:grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-azul-claro" />
                    <span>{format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-verde-menta" />
                    <span>{selectedSlot}h (Horário de Brasília)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-rosa-bebe" />
                    <span>{patientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-muted-foreground" />
                    <span>{appointmentType}</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-azul-claro to-verde-menta text-white font-semibold h-12 text-base"
                >
                  {submitting ? "Agendando..." : "✅ Confirmar Agendamento"}
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
      </main>
    </div>
  );
}
