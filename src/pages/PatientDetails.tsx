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
  // Novos campos da expansão
  consultation_reason: string | null;
  main_symptoms: string[] | null;
  symptoms_duration: string | null;
  current_illness_history: string | null;
  urgency_level: string | null;
  current_medications: string | null;
  recent_diseases: string | null;
  past_medical_history: string | null;
  known_allergies: string | null;
  has_been_hospitalized: boolean | null;
  hospitalization_details: string | null;
  has_had_surgeries: boolean | null;
  surgery_details: string | null;
  first_words_age: string | null;
  first_steps_age: string | null;
  sphincter_control_age: string | null;
  development_perception: string | null;
  development_observations: string | null;
  gestational_age: string | null;
  delivery_complications: string | null;
  vaccination_card_status: string | null;
  vaccination_details: string | null;
  last_vaccination_date: string | null;
  family_medical_history: string | null;
  parents_consanguinity: boolean | null;
  consanguinity_degree: string | null;
  parents_concerns: string | null;
  specific_questions: string | null;
  additional_observations: string | null;
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
              <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
              <p className="text-sm text-gray-800">Informações Completas do Paciente</p>
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
                    className="p-6 border-2 border-rosa-bebe/20 rounded-lg space-y-6"
                  >
                    {/* Cabeçalho */}
                    <div className="flex justify-between items-start pb-4 border-b">
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

                    {/* ETAPA 1: Informações Pessoais */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-primary text-lg">📋 Informações Pessoais</h4>
                      <div className="grid md:grid-cols-3 gap-4">
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
                      </div>
                    </div>

                    {/* ETAPA 2: Motivo da Consulta */}
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-bold text-primary text-lg">🩺 Motivo da Consulta</h4>
                      <div className="space-y-4">
                        {q.consultation_reason && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Motivo Principal</p>
                            <p className="font-semibold capitalize">{q.consultation_reason}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Queixa Principal</p>
                          <p className="font-semibold capitalize">{q.main_complaint}</p>
                        </div>
                        {q.main_symptoms && q.main_symptoms.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Sintomas Principais</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {q.main_symptoms.map((symptom, i) => (
                                <span key={i} className="px-3 py-1 bg-rosa-bebe/20 text-rosa-bebe rounded-full text-sm">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {q.symptoms_duration && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Duração dos Sintomas</p>
                            <p className="font-semibold">{q.symptoms_duration}</p>
                          </div>
                        )}
                        {q.current_illness_history && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">História da Moléstia Atual</p>
                            <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.current_illness_history}</p>
                          </div>
                        )}
                        {q.urgency_level && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Nível de Urgência</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              q.urgency_level === 'alta' ? 'bg-destructive/20 text-destructive' :
                              q.urgency_level === 'média' ? 'bg-warning/20 text-warning' :
                              'bg-success/20 text-success'
                            }`}>
                              {q.urgency_level.charAt(0).toUpperCase() + q.urgency_level.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ETAPA 3: Histórico Médico */}
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-bold text-primary text-lg">💊 Histórico Médico</h4>
                      <div className="space-y-4">
                        {q.current_medications && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Medicamentos em Uso</p>
                            <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.current_medications}</p>
                          </div>
                        )}
                        {q.recent_diseases && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Doenças Recentes (últimos 6 meses)</p>
                            <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.recent_diseases}</p>
                          </div>
                        )}
                        {q.past_medical_history && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">História Patológica Pregressa</p>
                            <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.past_medical_history}</p>
                          </div>
                        )}
                        {q.known_allergies && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Alergias Conhecidas</p>
                            <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.known_allergies}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ETAPA 4: Hospitalizações e Cirurgias */}
                    {(q.has_been_hospitalized || q.has_had_surgeries) && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-bold text-primary text-lg">🏥 Hospitalizações e Cirurgias</h4>
                        <div className="space-y-4">
                          {q.has_been_hospitalized && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Já foi hospitalizado(a)</p>
                              <p className="font-semibold">Sim</p>
                              {q.hospitalization_details && (
                                <p className="mt-2 bg-muted/50 p-3 rounded-lg">{q.hospitalization_details}</p>
                              )}
                            </div>
                          )}
                          {q.has_had_surgeries && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Já foi submetido(a) a cirurgias</p>
                              <p className="font-semibold">Sim</p>
                              {q.surgery_details && (
                                <p className="mt-2 bg-muted/50 p-3 rounded-lg">{q.surgery_details}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ETAPA 5: Desenvolvimento Infantil */}
                    {(q.first_words_age || q.first_steps_age || q.sphincter_control_age || q.development_observations) && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-bold text-primary text-lg">👶 Desenvolvimento Infantil</h4>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            {q.first_words_age && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Primeiras Palavras</p>
                                <p className="font-semibold">{q.first_words_age}</p>
                              </div>
                            )}
                            {q.first_steps_age && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Primeiros Passos</p>
                                <p className="font-semibold">{q.first_steps_age}</p>
                              </div>
                            )}
                            {q.sphincter_control_age && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Controle dos Esfíncteres</p>
                                <p className="font-semibold">{q.sphincter_control_age}</p>
                              </div>
                            )}
                          </div>
                          {q.development_perception && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Percepção dos Pais</p>
                              <p className="font-semibold capitalize">{q.development_perception}</p>
                            </div>
                          )}
                          {q.development_observations && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Observações sobre Desenvolvimento</p>
                              <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.development_observations}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ETAPA 6: Dados do Nascimento */}
                    {(q.birth_weight || q.gestational_age || q.delivery_type || q.pregnancy_complications || q.delivery_complications) && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-bold text-primary text-lg">🍼 Dados do Nascimento</h4>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            {q.birth_weight && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Peso ao Nascer</p>
                                <p className="font-semibold">{q.birth_weight}</p>
                              </div>
                            )}
                            {q.gestational_age && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Idade Gestacional</p>
                                <p className="font-semibold capitalize">{q.gestational_age}</p>
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
                              <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.pregnancy_complications}</p>
                            </div>
                          )}
                          {q.delivery_complications && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Complicações no Parto</p>
                              <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.delivery_complications}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ETAPA 7: Vacinação */}
                    {(q.vaccination_card_status || q.vaccination_details || q.last_vaccination_date) && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-bold text-primary text-lg">💉 Vacinação</h4>
                        <div className="space-y-4">
                          {q.vaccination_card_status && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Status do Cartão de Vacinas</p>
                              <p className="font-semibold capitalize">{q.vaccination_card_status}</p>
                            </div>
                          )}
                          {q.last_vaccination_date && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Última Vacinação</p>
                              <p className="font-semibold">{q.last_vaccination_date}</p>
                            </div>
                          )}
                          {q.vaccination_details && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Detalhes da Vacinação</p>
                              <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.vaccination_details}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ETAPA 8: Antecedentes Familiares */}
                    {(q.family_medical_history || q.parents_consanguinity) && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-bold text-primary text-lg">👨‍👩‍👧‍👦 Antecedentes Familiares</h4>
                        <div className="space-y-4">
                          {q.family_medical_history && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Histórico Familiar de Doenças</p>
                              <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.family_medical_history}</p>
                            </div>
                          )}
                          {q.parents_consanguinity && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Consanguinidade dos Pais</p>
                              <p className="font-semibold">Sim</p>
                              {q.consanguinity_degree && (
                                <p className="mt-2 bg-muted/50 p-3 rounded-lg">{q.consanguinity_degree}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ETAPA 9: Informações Finais */}
                    {(q.parents_concerns || q.specific_questions || q.additional_observations) && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-bold text-primary text-lg">📝 Informações Finais</h4>
                        <div className="space-y-4">
                          {q.parents_concerns && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Preocupações dos Pais</p>
                              <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.parents_concerns}</p>
                            </div>
                          )}
                          {q.specific_questions && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Questões Específicas</p>
                              <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.specific_questions}</p>
                            </div>
                          )}
                          {q.additional_observations && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Observações Adicionais</p>
                              <p className="mt-1 bg-muted/50 p-3 rounded-lg">{q.additional_observations}</p>
                            </div>
                          )}
                        </div>
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