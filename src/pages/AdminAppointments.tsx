import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Loader2, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { DailyAppointmentsReport } from "@/components/DailyAppointmentsReport";

interface Appointment {
  id: string;
  user_id: string;
  patient_name: string;
  patient_phone: string | null;
  appointment_date: string; // ISO timestamptz
  appointment_time: string | null; // HH:mm:ss
  appointment_type: string; // "Consulta" | "Procedimento"
  specialty_or_professional: string | null;
  notes: string | null;
  status: string | null;
}

type ViewMode = "month" | "week" | "day";

const PROFESSIONAL_OPTIONS = [
  "Consulta com Pediatra",
  "Consulta com Hematologista",
  "Consulta com Gastroenterologista",
  "Consulta com a Dra. Michelle",
  "Consulta com a Dra. Moniky",
];

const APPOINTMENT_TYPES = ["Consulta", "Procedimento"];

const emptyForm = {
  patient_name: "",
  patient_phone: "",
  appointment_date: "",
  appointment_time: "",
  appointment_type: "Consulta",
  specialty_or_professional: "",
  notes: "",
  status: "confirmed",
};

function typeBadge(type: string) {
  if (type === "Procedimento") {
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Procedimento</Badge>;
  }
  return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Consulta</Badge>;
}

function typeDotClass(type: string) {
  return type === "Procedimento" ? "bg-emerald-500" : "bg-blue-500";
}

function combineDateTime(dateStr: string, timeStr: string): string {
  // dateStr: yyyy-MM-dd, timeStr: HH:mm
  const t = timeStr && timeStr.length >= 4 ? timeStr : "00:00";
  return new Date(`${dateStr}T${t}:00`).toISOString();
}

function formatTime(a: Appointment): string {
  if (a.appointment_time) return a.appointment_time.slice(0, 5);
  try {
    return format(new Date(a.appointment_date), "HH:mm");
  } catch {
    return "";
  }
}

export default function AdminAppointments() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<Date>(new Date());

  const [dayPanel, setDayPanel] = useState<Date | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const [detailsAppt, setDetailsAppt] = useState<Appointment | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadAppointments();
  }, [isAdmin, navigate]);

  async function loadAppointments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true });
    if (error) {
      console.error(error);
      toast.error("Erro ao carregar agenda");
    } else {
      setAppointments((data as unknown as Appointment[]) || []);
    }
    setLoading(false);
  }

  function openNewForm(prefillDate?: Date) {
    setEditingId(null);
    setForm({
      ...emptyForm,
      appointment_date: prefillDate ? format(prefillDate, "yyyy-MM-dd") : "",
    });
    setFormOpen(true);
  }

  function openEditForm(a: Appointment) {
    setEditingId(a.id);
    const d = new Date(a.appointment_date);
    setForm({
      patient_name: a.patient_name,
      patient_phone: a.patient_phone ?? "",
      appointment_date: format(d, "yyyy-MM-dd"),
      appointment_time: a.appointment_time ? a.appointment_time.slice(0, 5) : format(d, "HH:mm"),
      appointment_type: a.appointment_type,
      specialty_or_professional: a.specialty_or_professional ?? "",
      notes: a.notes ?? "",
      status: a.status ?? "confirmed",
    });
    setDetailsAppt(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.patient_name || !form.appointment_date || !form.appointment_time || !form.appointment_type) {
      toast.error("Preencha paciente, data, horário e tipo");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        patient_name: form.patient_name,
        patient_phone: form.patient_phone || null,
        appointment_date: combineDateTime(form.appointment_date, form.appointment_time),
        appointment_time: form.appointment_time + ":00",
        appointment_type: form.appointment_type,
        specialty_or_professional: form.specialty_or_professional || null,
        notes: form.notes || null,
        status: form.status || "confirmed",
      };

      if (editingId) {
        const { error } = await supabase
          .from("appointments")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("appointments")
          .insert({ ...payload, user_id: user.id });
        if (error) throw error;
      }

      toast.success(editingId ? "Agendamento atualizado" : "Agendamento gravado");

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar agendamento");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao cancelar");
      return;
    }
    toast.success("Agendamento cancelado");
    setConfirmDeleteId(null);
    setDetailsAppt(null);
    loadAppointments();
  }

  // ---- Calendar helpers ----
  const apptsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const k = format(new Date(a.appointment_date), "yyyy-MM-dd");
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(a);
    }
    for (const list of map.values()) {
      list.sort((x, y) => formatTime(x).localeCompare(formatTime(y)));
    }
    return map;
  }, [appointments]);

  function dayAppts(d: Date): Appointment[] {
    return apptsByDay.get(format(d, "yyyy-MM-dd")) ?? [];
  }

  function goPrev() {
    if (view === "month") setCursor(subMonths(cursor, 1));
    else if (view === "week") setCursor(subWeeks(cursor, 1));
    else setCursor(addDays(cursor, -1));
  }
  function goNext() {
    if (view === "month") setCursor(addMonths(cursor, 1));
    else if (view === "week") setCursor(addWeeks(cursor, 1));
    else setCursor(addDays(cursor, 1));
  }

  const monthLabel = format(cursor, "MMMM 'de' yyyy", { locale: ptBR });

  // Build month grid
  const monthGrid = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rosa-bebe/10 to-roxo-suave/10">
      <header className="bg-gradient-to-r from-rosa-bebe to-roxo-suave p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agenda da Clínica</h1>
              <p className="text-sm text-gray-800">Visualize e gerencie os agendamentos</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setReportOpen(true)}
                variant="outline"
                className="bg-white/90 text-gray-900 hover:bg-white"
              >
                <FileDown className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Exportar Relatório do Dia</span>
                <span className="sm:hidden">Relatório</span>
              </Button>
              <Button onClick={() => openNewForm()} className="bg-white text-gray-900 hover:bg-white/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        {/* Toolbar */}
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goPrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={goNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="ml-2 text-lg font-semibold capitalize">
                {view === "day"
                  ? format(cursor, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : view === "week"
                  ? `${format(weekDays[0], "dd/MM")} – ${format(weekDays[6], "dd/MM/yyyy")}`
                  : monthLabel}
              </div>
            </div>
            <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="month">Mensal</TabsTrigger>
                <TabsTrigger value="week">Semanal</TabsTrigger>
                <TabsTrigger value="day">Diária</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando agenda...</div>
        ) : view === "month" ? (
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-900 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                  <div key={d} className="py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((d) => {
                  const inMonth = isSameMonth(d, cursor);
                  const isToday = isSameDay(d, new Date());
                  const list = dayAppts(d);
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => setDayPanel(d)}
                      className={`min-h-[88px] md:min-h-[110px] p-1.5 rounded-lg border text-left flex flex-col gap-1 transition-colors hover:bg-accent/50 ${
                        inMonth ? "bg-card" : "bg-muted/30 text-muted-foreground"
                      } ${isToday ? "border-rosa-bebe border-2 ring-2 ring-rosa-bebe/30" : "border-border"}`}
                    >
                      <div className={`text-xs font-semibold text-gray-900`}>
                        {format(d, "d")}
                      </div>
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        {list.slice(0, 3).map((a) => (
                          <span
                            key={a.id}
                            className="text-[10px] md:text-xs truncate px-1 py-0.5 rounded"
                            style={{}}
                            title={`${formatTime(a)} ${a.patient_name} - ${a.appointment_type}`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${typeDotClass(a.appointment_type)}`} />
                            <span className="text-foreground">
                              {formatTime(a)} {a.patient_name}
                            </span>
                          </span>
                        ))}
                        {list.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{list.length - 3} mais</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : view === "week" ? (
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((d) => {
                  const isToday = isSameDay(d, new Date());
                  const list = dayAppts(d);
                  return (
                    <div
                      key={d.toISOString()}
                      className={`min-h-[260px] p-2 rounded-lg border flex flex-col gap-2 ${
                        isToday ? "border-rosa-bebe border-2" : "border-border"
                      }`}
                    >
                      <button
                        onClick={() => { setCursor(d); setView("day"); }}
                        className="text-left"
                      >
                        <div className="text-xs text-muted-foreground uppercase">{format(d, "EEE", { locale: ptBR })}</div>
                        <div className={`text-lg font-bold text-gray-900`}>{format(d, "dd/MM")}</div>
                      </button>
                      <div className="flex flex-col gap-1 overflow-y-auto">
                        {list.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => setDetailsAppt(a)}
                            className="text-left text-xs p-2 rounded border bg-card hover:bg-accent"
                          >
                            <div className="flex items-center gap-1 font-semibold">
                              <span className={`inline-block w-2 h-2 rounded-full ${typeDotClass(a.appointment_type)}`} />
                              {formatTime(a)}
                            </div>
                            <div className="truncate">{a.patient_name}</div>
                            {a.specialty_or_professional && (
                              <div className="truncate text-[10px] text-muted-foreground">{a.specialty_or_professional}</div>
                            )}
                          </button>
                        ))}
                        {list.length === 0 && <div className="text-xs text-muted-foreground">—</div>}
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => openNewForm(d)}>
                        <Plus className="w-3 h-3 mr-1" /> Novo
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Day view
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize">
                  {format(cursor, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <Button size="sm" onClick={() => openNewForm(cursor)}>
                  <Plus className="w-4 h-4 mr-1" /> Novo
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {dayAppts(cursor).length === 0 && (
                  <div className="text-sm text-muted-foreground py-8 text-center">Sem agendamentos neste dia</div>
                )}
                {dayAppts(cursor).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setDetailsAppt(a)}
                    className="text-left p-3 rounded-lg border hover:bg-accent flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-semibold text-gray-900 w-14">{formatTime(a)}</div>
                      <div>
                        <div className="font-medium">{a.patient_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {a.specialty_or_professional ?? "—"}
                        </div>
                      </div>
                    </div>
                    {typeBadge(a.appointment_type)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Day panel dialog */}
      <Dialog open={!!dayPanel} onOpenChange={(o) => !o && setDayPanel(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {dayPanel && format(dayPanel, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>Agendamentos do dia</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {dayPanel && dayAppts(dayPanel).length === 0 && (
              <div className="text-sm text-muted-foreground py-4 text-center">Nenhum agendamento</div>
            )}
            {dayPanel &&
              dayAppts(dayPanel).map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setDayPanel(null); setDetailsAppt(a); }}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono font-semibold text-gray-900 w-14">{formatTime(a)}</div>
                    <div>
                      <div className="font-medium">{a.patient_name}</div>
                      <div className="text-xs text-muted-foreground">{a.specialty_or_professional ?? "—"}</div>
                    </div>
                  </div>
                  {typeBadge(a.appointment_type)}
                </button>
              ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (dayPanel) {
                  const d = dayPanel;
                  setDayPanel(null);
                  openNewForm(d);
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Agendamento neste dia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details modal */}
      <Dialog open={!!detailsAppt} onOpenChange={(o) => !o && setDetailsAppt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {detailsAppt && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">{typeBadge(detailsAppt.appointment_type)}</div>
              <div><strong>Paciente:</strong> {detailsAppt.patient_name}</div>
              <div><strong>Telefone:</strong> {detailsAppt.patient_phone ?? "—"}</div>
              <div>
                <strong>Data:</strong>{" "}
                {format(new Date(detailsAppt.appointment_date), "dd/MM/yyyy")} às {formatTime(detailsAppt)}
              </div>
              <div>
                <strong>Especialidade/Profissional:</strong> {detailsAppt.specialty_or_professional ?? "—"}
              </div>
              <div><strong>Observações:</strong> {detailsAppt.notes ?? "—"}</div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-wrap">
            {detailsAppt && (
              <>
                <Button variant="outline" onClick={() => openEditForm(detailsAppt)}>
                  <Pencil className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button variant="destructive" onClick={() => setConfirmDeleteId(detailsAppt.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Cancelar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form modal */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditingId(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{editingId ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="space-y-3 px-6 py-4 overflow-y-auto flex-1">
            <div>
              <Label>Nome do paciente *</Label>
              <Input
                value={form.patient_name}
                onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={form.patient_phone}
                onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
                placeholder="(opcional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Horário *</Label>
                <Input
                  type="time"
                  value={form.appointment_time}
                  onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select
                value={form.appointment_type}
                onValueChange={(v) => setForm({ ...form, appointment_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Especialidade / Profissional</Label>
              <Input
                list="professional-options"
                value={form.specialty_or_professional}
                onChange={(e) => setForm({ ...form, specialty_or_professional: e.target.value })}
                placeholder="Selecione ou digite..."
              />
              <datalist id="professional-options">
                {PROFESSIONAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            </div>
            <DialogFooter className="flex-row gap-2 px-6 py-4 border-t bg-background sticky bottom-0">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => { setFormOpen(false); setEditingId(null); }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none sm:min-w-[200px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingId ? "Atualizar Agendamento" : "Confirmar Agendamento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DailyAppointmentsReport
        open={reportOpen}
        onOpenChange={setReportOpen}
        appointments={appointments}
        professionalOptions={PROFESSIONAL_OPTIONS}
        userName={user?.user_metadata?.full_name || user?.email || "Admin"}
      />
    </div>
  );
}