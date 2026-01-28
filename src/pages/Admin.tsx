import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Users, FileText, Calendar, TrendingUp, Eye, BookOpen } from "lucide-react";
import { format, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyStats {
  date: string;
  count: number;
}

interface Questionnaire {
  id: string;
  child_name: string;
  child_age: string;
  main_complaint: string;
  submitted_at: string;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface PatientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  consent_given: boolean;
}

export default function Admin() {
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [dailyRegistrations, setDailyRegistrations] = useState<DailyStats[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [allPatients, setAllPatients] = useState<PatientProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    fetchAdminData();
  }, [isAdmin, navigate]);

  const fetchAdminData = async () => {
    // Fetch daily registrations for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return startOfDay(date).toISOString();
    }).reverse();

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!profilesError && profiles) {
      setAllPatients(profiles);
      setTotalUsers(profiles.length);

      // Count registrations by day
      const dailyStats: DailyStats[] = last7Days.map(dateStr => {
        const count = profiles.filter(p => {
          const profileDate = startOfDay(new Date(p.created_at)).toISOString();
          return profileDate === dateStr;
        }).length;

        return {
          date: format(new Date(dateStr), "dd/MM", { locale: ptBR }),
          count
        };
      });

      setDailyRegistrations(dailyStats);

      // Today's count
      const today = startOfDay(new Date()).toISOString();
      const todayRegistrations = profiles.filter(p => 
        startOfDay(new Date(p.created_at)).toISOString() === today
      ).length;
      setTodayCount(todayRegistrations);
    }

    // Fetch questionnaires
    const { data: questData, error: questError } = await supabase
      .from("medical_questionnaires")
      .select(`
        id,
        child_name,
        child_age,
        main_complaint,
        submitted_at,
        status,
        profiles!medical_questionnaires_user_id_fkey (
          full_name,
          email
        )
      `)
      .order("submitted_at", { ascending: false })
      .limit(10);

    if (!questError && questData) {
      setQuestionnaires(questData as any);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-rosa-bebe/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-azul-claro p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              👨‍⚕️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Administrativo</h1>
              <p className="text-sm text-white/90">CuidarBem Pediatria</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            size="sm"
            className="bg-white/90 hover:bg-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-success/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cadastros Hoje</CardTitle>
              <Calendar className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{todayCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Novos registros</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Questionários</CardTitle>
              <FileText className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{questionnaires.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-verde-menta/30 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/admin/cartilhas")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cartilhas</CardTitle>
              <BookOpen className="w-4 h-4 text-verde-menta" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Gerenciar materiais</p>
            </CardContent>
          </Card>
        </div>

        {/* Gerenciamento Rápido */}
        <Card className="border-2 border-azul-claro/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚙️ Gerenciamento de Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => navigate("/admin/cartilhas")}
              >
                <span className="text-2xl">📚</span>
                <span className="text-sm">Cartilhas</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => navigate("/admin/ebooks")}
              >
                <span className="text-2xl">📖</span>
                <span className="text-sm">E-books</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => navigate("/admin/partners")}
              >
                <span className="text-2xl">🤝</span>
                <span className="text-sm">Parceiros</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => navigate("/admin/payment")}
              >
                <span className="text-2xl">💳</span>
                <span className="text-sm">Pagamento</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => navigate("/admin/location")}
              >
                <span className="text-2xl">📍</span>
                <span className="text-sm">Localização</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => navigate("/admin/appointments")}
              >
                <span className="text-2xl">📅</span>
                <span className="text-sm">Consultas</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => navigate("/admin/satisfaction")}
              >
                <span className="text-2xl">⭐</span>
                <span className="text-sm">Avaliações</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Registrations Chart */}
        <Card className="border-2 border-azul-claro/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Cadastros nos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 gap-2">
              {dailyRegistrations.map((stat, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-azul-claro rounded-t-lg transition-all"
                    style={{ height: `${(stat.count / Math.max(...dailyRegistrations.map(s => s.count), 1)) * 100}%` }}
                  />
                  <div className="mt-2 text-sm font-semibold text-primary">{stat.count}</div>
                  <div className="text-xs text-muted-foreground">{stat.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Todos os Pacientes */}
        <Card className="border-2 border-azul-claro/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-azul-claro" />
              Todos os Pacientes Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allPatients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum paciente cadastrado
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome Completo</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Consentimento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.full_name}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phone || "-"}</TableCell>
                        <TableCell>
                          {format(new Date(patient.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {patient.consent_given ? (
                            <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
                              ✓ Sim
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium">
                              ⚠ Não
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/patient/${patient.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Questionnaires */}
        <Card className="border-2 border-rosa-bebe/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rosa-bebe" />
              Queixas Médicas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionnaires.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum questionário enviado ainda
                </p>
              ) : (
                questionnaires.map((q) => (
                  <div key={q.id} className="p-4 border-2 border-rosa-bebe/20 rounded-lg hover:border-rosa-bebe/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{q.child_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {q.profiles?.full_name} ({q.profiles?.email})
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        q.status === 'pending' ? 'bg-warning/20 text-warning' :
                        q.status === 'reviewed' ? 'bg-info/20 text-info' :
                        'bg-success/20 text-success'
                      }`}>
                        {q.status === 'pending' ? 'Pendente' :
                         q.status === 'reviewed' ? 'Em revisão' : 'Completo'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Idade:</span> {q.child_age}</p>
                      <p><span className="font-medium">Queixa:</span> {q.main_complaint}</p>
                      <p className="text-muted-foreground">
                        {format(new Date(q.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}