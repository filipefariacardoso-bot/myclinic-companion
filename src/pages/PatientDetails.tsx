import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, FileText, Calendar, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/lib/auth";

interface PatientData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  consent_given: boolean;
  consent_date: string | null;
}

interface QuestionnaireData {
  id: string;
  child_name: string;
  child_age: string;
  child_sex: string;
  main_complaint: string;
  complaint_details: string | null;
  health_history: string | null;
  medications: string | null;
  birth_weight: string | null;
  delivery_type: string | null;
  pregnancy_complications: string | null;
  submitted_at: string;
  status: string;
}

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchPatientData();
  }, [id, isAdmin, navigate]);

  const fetchPatientData = async () => {
    try {
      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;
      setPatient(profileData);

      // Buscar questionários do paciente
      const { data: questData, error: questError } = await supabase
        .from("medical_questionnaires")
        .select("*")
        .eq("user_id", id)
        .order("submitted_at", { ascending: false });

      if (questError) throw questError;
      setQuestionnaires(questData || []);
    } catch (error) {
      console.error("Erro ao buscar dados do paciente:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin || loading) {
    return null;
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-rosa-bebe/10 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">Paciente não encontrado</p>
          <Button onClick={() => navigate("/admin")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/10 to-rosa-bebe/10">
      <header className="bg-gradient-to-r from-primary to-azul-claro p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button 
            onClick={() => navigate("/admin")} 
            variant="outline"
            size="sm"
            className="mb-4 bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{patient.full_name}</h1>
              <p className="text-sm text-white/90">Informações Completas do Paciente</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Informações de Cadastro */}
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Dados de Cadastro
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome Completo</p>
              <p className="font-semibold">{patient.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {patient.email}
              </p>
            </div>
            {patient.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {patient.phone}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Data de Cadastro</p>
              <p className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(patient.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Consentimento</p>
              <div className="flex items-center gap-2 mt-1">
                {patient.consent_given ? (
                  <>
                    <span className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                      ✓ Consentimento Dado
                    </span>
                    {patient.consent_date && (
                      <span className="text-sm text-muted-foreground">
                        em {format(new Date(patient.consent_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-sm font-medium">
                    ⚠ Aguardando Consentimento
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questionários Médicos */}
        <Card className="border-2 border-rosa-bebe/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rosa-bebe" />
              Questionários Médicos ({questionnaires.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionnaires.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum questionário preenchido
              </p>
            ) : (
              <div className="space-y-6">
                {questionnaires.map((q, index) => (
                  <div 
                    key={q.id} 
                    className="p-6 border-2 border-rosa-bebe/20 rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">Questionário #{questionnaires.length - index}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(q.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nome da Criança</p>
                        <p className="font-semibold">{q.child_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Idade</p>
                        <p className="font-semibold">{q.child_age}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Sexo</p>
                        <p className="font-semibold capitalize">{q.child_sex}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Queixa Principal</p>
                        <p className="font-semibold capitalize">{q.main_complaint}</p>
                      </div>
                    </div>

                    {q.complaint_details && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Detalhes da Queixa</p>
                        <p className="mt-1">{q.complaint_details}</p>
                      </div>
                    )}

                    {q.health_history && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Histórico de Saúde</p>
                        <p className="mt-1 capitalize">{q.health_history}</p>
                      </div>
                    )}

                    {q.medications && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Medicamentos em Uso</p>
                        <p className="mt-1">{q.medications}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                      {q.birth_weight && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Peso ao Nascer</p>
                          <p className="font-semibold">{q.birth_weight}</p>
                        </div>
                      )}
                      {q.delivery_type && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Tipo de Parto</p>
                          <p className="font-semibold capitalize">{q.delivery_type}</p>
                        </div>
                      )}
                    </div>

                    {q.pregnancy_complications && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Complicações na Gestação</p>
                        <p className="mt-1">{q.pregnancy_complications}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}