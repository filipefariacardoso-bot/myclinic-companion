import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";

const questionnaireSchema = z.object({
  // Etapa 1: Informações Pessoais
  childName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  childAge: z.string().min(1).max(50),
  childSex: z.enum(["masculino", "feminino"]),
  
  // Etapa 2: Pré-Consulta - Motivo da Consulta
  consultationReason: z.string().min(1, "Selecione o motivo da consulta"),
  mainSymptoms: z.array(z.string()).optional(),
  symptomsDuration: z.string().optional(),
  currentIllnessHistory: z.string().max(2000).optional(),
  urgencyLevel: z.string().optional(),
  
  // Etapa 3: Histórico Médico
  currentMedications: z.string().max(1000).optional(),
  recentDiseases: z.string().max(1000).optional(),
  pastMedicalHistory: z.string().max(1000).optional(),
  knownAllergies: z.string().max(1000).optional(),
  
  // Etapa 4: Hospitalizações e Cirurgias
  hasBeenHospitalized: z.boolean().optional(),
  hospitalizationDetails: z.string().max(1000).optional(),
  hasHadSurgeries: z.boolean().optional(),
  surgeryDetails: z.string().max(1000).optional(),
  
  // Etapa 5: Desenvolvimento Infantil
  firstWordsAge: z.string().max(50).optional(),
  firstStepsAge: z.string().max(50).optional(),
  sphincterControlAge: z.string().max(50).optional(),
  developmentPerception: z.string().optional(),
  developmentObservations: z.string().max(1000).optional(),
  
  // Etapa 6: Dados do Nascimento
  birthWeight: z.string().max(20).optional(),
  gestationalAge: z.string().optional(),
  deliveryType: z.enum(["normal", "cesarea"]).optional(),
  pregnancyComplications: z.string().max(1000).optional(),
  deliveryComplications: z.string().max(1000).optional(),
  
  // Etapa 7: Vacinação
  vaccinationCardStatus: z.string().optional(),
  vaccinationDetails: z.string().max(1000).optional(),
  lastVaccinationDate: z.string().max(100).optional(),
  
  // Etapa 8: Antecedentes Familiares
  familyMedicalHistory: z.string().max(1000).optional(),
  parentsConsanguinity: z.boolean().optional(),
  consanguinityDegree: z.string().max(200).optional(),
  
  // Etapa 9: Informações Finais
  parentsConcerns: z.string().max(2000).optional(),
  specificQuestions: z.string().max(2000).optional(),
  additionalObservations: z.string().max(2000).optional()
});

export default function Questionnaire() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    childName: "",
    childAge: "",
    childSex: "",
    motherName: "",
    fatherName: "",
    consultationReason: "",
    mainSymptoms: [] as string[],
    symptomsDuration: "",
    currentIllnessHistory: "",
    urgencyLevel: "",
    currentMedications: "",
    recentDiseases: "",
    pastMedicalHistory: "",
    knownAllergies: "",
    hasBeenHospitalized: false,
    hospitalizationDetails: "",
    hasHadSurgeries: false,
    surgeryDetails: "",
    firstWordsAge: "",
    firstStepsAge: "",
    sphincterControlAge: "",
    developmentPerception: "",
    developmentObservations: "",
    birthWeight: "",
    gestationalAge: "",
    deliveryType: "",
    pregnancyComplications: "",
    deliveryComplications: "",
    vaccinationCardStatus: "",
    vaccinationDetails: "",
    lastVaccinationDate: "",
    familyMedicalHistory: "",
    parentsConsanguinity: false,
    consanguinityDegree: "",
    parentsConcerns: "",
    specificQuestions: "",
    additionalObservations: ""
  });
  const [errors, setErrors] = useState<any>({});
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 9;
  const progress = (step / totalSteps) * 100;

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      mainSymptoms: prev.mainSymptoms.includes(symptom)
        ? prev.mainSymptoms.filter(s => s !== symptom)
        : [...prev.mainSymptoms, symptom]
    }));
  };

  const handleSubmit = async () => {
    try {
      const validatedData = questionnaireSchema.parse({
        ...formData,
        childSex: formData.childSex as "masculino" | "feminino",
        deliveryType: formData.deliveryType || undefined
      });

      const { error } = await supabase.from("medical_questionnaires").insert({
        user_id: user!.id,
        child_name: validatedData.childName,
        child_age: validatedData.childAge,
        child_sex: validatedData.childSex,
        mother_name: (formData as any).motherName || null,
        father_name: (formData as any).fatherName || null,
        consultation_reason: validatedData.consultationReason,
        main_symptoms: validatedData.mainSymptoms,
        symptoms_duration: validatedData.symptomsDuration,
        current_illness_history: validatedData.currentIllnessHistory,
        urgency_level: validatedData.urgencyLevel,
        current_medications: validatedData.currentMedications,
        recent_diseases: validatedData.recentDiseases,
        past_medical_history: validatedData.pastMedicalHistory,
        known_allergies: validatedData.knownAllergies,
        has_been_hospitalized: validatedData.hasBeenHospitalized,
        hospitalization_details: validatedData.hospitalizationDetails,
        has_had_surgeries: validatedData.hasHadSurgeries,
        surgery_details: validatedData.surgeryDetails,
        first_words_age: validatedData.firstWordsAge,
        first_steps_age: validatedData.firstStepsAge,
        sphincter_control_age: validatedData.sphincterControlAge,
        development_perception: validatedData.developmentPerception,
        development_observations: validatedData.developmentObservations,
        birth_weight: validatedData.birthWeight,
        gestational_age: validatedData.gestationalAge,
        delivery_type: validatedData.deliveryType,
        pregnancy_complications: validatedData.pregnancyComplications,
        delivery_complications: validatedData.deliveryComplications,
        vaccination_card_status: validatedData.vaccinationCardStatus,
        vaccination_details: validatedData.vaccinationDetails,
        last_vaccination_date: validatedData.lastVaccinationDate,
        family_medical_history: validatedData.familyMedicalHistory,
        parents_consanguinity: validatedData.parentsConsanguinity,
        consanguinity_degree: validatedData.consanguinityDegree,
        parents_concerns: validatedData.parentsConcerns,
        specific_questions: validatedData.specificQuestions,
        additional_observations: validatedData.additionalObservations,
        // Campos legados para compatibilidade
        main_complaint: validatedData.consultationReason,
        complaint_details: validatedData.currentIllnessHistory,
        health_history: validatedData.pastMedicalHistory,
        medications: validatedData.currentMedications
      } as any);

      if (error) throw error;

      toast({
        title: "Questionário enviado! ✅",
        description: "Suas informações foram salvas com sucesso."
      });
      
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          variant: "destructive",
          title: "Erro de validação",
          description: "Verifique os campos obrigatórios e tente novamente"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao enviar",
          description: "Tente novamente"
        });
      }
    }
  };

  const stepTitles = [
    "Informações Pessoais",
    "Motivo da Consulta",
    "Histórico Médico",
    "Hospitalizações e Cirurgias",
    "Desenvolvimento Infantil",
    "Dados do Nascimento",
    "Vacinação",
    "Antecedentes Familiares",
    "Informações Finais"
  ];

  const symptomOptions = [
    "Febre", "Tosse", "Coriza/Nariz Entupido", "Vômitos", 
    "Diarreia", "Dor (qualquer localização)", "Irritabilidade/Choro Excessivo",
    "Perda de Apetite", "Dificuldade para Respirar", "Convulsões",
    "Manchas/Rash na Pele", "Dor de Ouvido"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azul-claro/20 to-rosa-bebe/20 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 shadow-xl border-2 border-azul-claro/30">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => step === 1 ? navigate("/") : setStep(step - 1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-azul-claro h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-azul-claro to-primary rounded-full flex items-center justify-center text-white font-bold">
                {step}
              </div>
              <h2 className="text-2xl font-bold">{stepTitles[step - 1]}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Etapa {step} de {totalSteps}
              </p>
            </div>
          </div>

          {/* ETAPA 1: Informações Pessoais */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="childName">Nome da criança *</Label>
                <Input
                  id="childName"
                  value={formData.childName}
                  onChange={(e) => updateField("childName", e.target.value)}
                  className="border-2 border-azul-claro/30"
                />
                {errors.childName && (
                  <p className="text-sm text-destructive mt-1">{errors.childName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="childAge">Idade *</Label>
                <Input
                  id="childAge"
                  placeholder="Ex: 2 anos e 6 meses"
                  value={formData.childAge}
                  onChange={(e) => updateField("childAge", e.target.value)}
                  className="border-2 border-azul-claro/30"
                />
                {errors.childAge && (
                  <p className="text-sm text-destructive mt-1">{errors.childAge}</p>
                )}
              </div>

              <div>
                <Label>Sexo *</Label>
                <RadioGroup 
                  value={formData.childSex} 
                  onValueChange={(value) => updateField("childSex", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-azul-claro/30 hover:border-azul-claro cursor-pointer">
                    <RadioGroupItem value="masculino" id="masculino" />
                    <Label htmlFor="masculino" className="cursor-pointer flex-1">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-rosa-bebe/30 hover:border-rosa-bebe cursor-pointer">
                    <RadioGroupItem value="feminino" id="feminino" />
                    <Label htmlFor="feminino" className="cursor-pointer flex-1">Feminino</Label>
                  </div>
                </RadioGroup>
                {errors.childSex && (
                  <p className="text-sm text-destructive mt-1">{errors.childSex}</p>
                )}
              </div>

              <div>
                <Label htmlFor="motherName">Nome da Mãe *</Label>
                <Input
                  id="motherName"
                  placeholder="Nome completo da mãe"
                  value={(formData as any).motherName}
                  onChange={(e) => updateField("motherName", e.target.value)}
                  className="border-2 border-azul-claro/30"
                />
              </div>

              <div>
                <Label htmlFor="fatherName">Nome do Pai</Label>
                <Input
                  id="fatherName"
                  placeholder="Nome completo do pai"
                  value={(formData as any).fatherName}
                  onChange={(e) => updateField("fatherName", e.target.value)}
                  className="border-2 border-azul-claro/30"
                />
              </div>
            </div>
          )}

          {/* ETAPA 2: Motivo da Consulta */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Motivo Principal da Consulta *</Label>
                <RadioGroup 
                  value={formData.consultationReason} 
                  onValueChange={(value) => updateField("consultationReason", value)}
                  className="mt-2 space-y-2"
                >
                  {["Consulta de Rotina", "Sintomas/Queixas", "Vacinação", "Emergencial", "Retorno", "Outro"].map((option) => (
                    <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border-2 border-verde-menta/30 hover:border-verde-menta cursor-pointer">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.consultationReason && (
                  <p className="text-sm text-destructive mt-1">{errors.consultationReason}</p>
                )}
              </div>

              {formData.consultationReason === "Sintomas/Queixas" && (
                <>
                  <div>
                    <Label>Sintomas Principais (selecione todos que se aplicam)</Label>
                    <div className="mt-2 space-y-2">
                      {symptomOptions.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-accent">
                          <Checkbox
                            id={symptom}
                            checked={formData.mainSymptoms.includes(symptom)}
                            onCheckedChange={() => toggleSymptom(symptom)}
                          />
                          <Label htmlFor={symptom} className="cursor-pointer flex-1">{symptom}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="symptomsDuration">Duração dos Sintomas</Label>
                    <RadioGroup 
                      value={formData.symptomsDuration} 
                      onValueChange={(value) => updateField("symptomsDuration", value)}
                      className="mt-2 space-y-2"
                    >
                      {["Menos de 6 horas", "6 a 24 horas", "1 a 3 dias", "4 a 7 dias", "1 a 2 semanas", "Mais de 2 semanas", "1 a 3 meses", "Mais de 3 meses"].map((duration) => (
                        <div key={duration} className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-accent cursor-pointer">
                          <RadioGroupItem value={duration} id={duration} />
                          <Label htmlFor={duration} className="cursor-pointer flex-1 text-sm">{duration}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="currentIllnessHistory">História da Moléstia Atual</Label>
                    <Textarea
                      id="currentIllnessHistory"
                      placeholder="Descreva quando começou, como evoluiu, o que piora/melhora, medicamentos já utilizados..."
                      value={formData.currentIllnessHistory}
                      onChange={(e) => updateField("currentIllnessHistory", e.target.value)}
                      rows={4}
                      className="border-2 border-verde-menta/30"
                    />
                  </div>

                  <div>
                    <Label>Nível de Urgência</Label>
                    <RadioGroup 
                      value={formData.urgencyLevel} 
                      onValueChange={(value) => updateField("urgencyLevel", value)}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-success/30 hover:border-success cursor-pointer">
                        <RadioGroupItem value="baixa" id="baixa" />
                        <Label htmlFor="baixa" className="cursor-pointer flex-1">Baixa (pode aguardar)</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-warning/30 hover:border-warning cursor-pointer">
                        <RadioGroupItem value="media" id="media" />
                        <Label htmlFor="media" className="cursor-pointer flex-1">Média (prefiro hoje)</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-destructive/30 hover:border-destructive cursor-pointer">
                        <RadioGroupItem value="alta" id="alta" />
                        <Label htmlFor="alta" className="cursor-pointer flex-1">Alta (urgente)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ETAPA 3: Histórico Médico */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentMedications">Medicamentos em Uso</Label>
                <Textarea
                  id="currentMedications"
                  placeholder="Liste: Nome, Dose, Frequência, Desde quando&#10;Ex: Paracetamol 200mg, 1x ao dia, há 2 dias"
                  value={formData.currentMedications}
                  onChange={(e) => updateField("currentMedications", e.target.value)}
                  rows={3}
                  className="border-2 border-amarelo-suave/30"
                />
              </div>

              <div>
                <Label htmlFor="recentDiseases">Histórico de Doenças Recentes (últimos 6 meses)</Label>
                <Textarea
                  id="recentDiseases"
                  placeholder="Ex: Março/2024 - Gripe tratada com Oseltamivir"
                  value={formData.recentDiseases}
                  onChange={(e) => updateField("recentDiseases", e.target.value)}
                  rows={3}
                  className="border-2 border-amarelo-suave/30"
                />
              </div>

              <div>
                <Label htmlFor="pastMedicalHistory">História Patológica Pregressa</Label>
                <Textarea
                  id="pastMedicalHistory"
                  placeholder="Problemas de saúde passados, condições crônicas, episódios importantes..."
                  value={formData.pastMedicalHistory}
                  onChange={(e) => updateField("pastMedicalHistory", e.target.value)}
                  rows={3}
                  className="border-2 border-amarelo-suave/30"
                />
              </div>

              <div>
                <Label htmlFor="knownAllergies">Alergias Conhecidas</Label>
                <Textarea
                  id="knownAllergies"
                  placeholder="Medicamentos (ex: Dipirona, Penicilina)&#10;Alimentos (ex: Ovo, Leite, Castanhas)&#10;Outras (ex: Pólen, produtos de limpeza)"
                  value={formData.knownAllergies}
                  onChange={(e) => updateField("knownAllergies", e.target.value)}
                  rows={3}
                  className="border-2 border-amarelo-suave/30"
                />
              </div>
            </div>
          )}

          {/* ETAPA 4: Hospitalizações e Cirurgias */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label>A criança já foi hospitalizada?</Label>
                <RadioGroup 
                  value={formData.hasBeenHospitalized ? "sim" : "nao"}
                  onValueChange={(value) => updateField("hasBeenHospitalized", value === "sim")}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-roxo-suave/30 hover:border-roxo-suave cursor-pointer">
                    <RadioGroupItem value="sim" id="hosp-sim" />
                    <Label htmlFor="hosp-sim" className="cursor-pointer flex-1">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-roxo-suave/30 hover:border-roxo-suave cursor-pointer">
                    <RadioGroupItem value="nao" id="hosp-nao" />
                    <Label htmlFor="hosp-nao" className="cursor-pointer flex-1">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.hasBeenHospitalized && (
                <div>
                  <Label htmlFor="hospitalizationDetails">Detalhes das Hospitalizações</Label>
                  <Textarea
                    id="hospitalizationDetails"
                    placeholder="Ex: 15/03/2023 - Pneumonia - Hospital Regional"
                    value={formData.hospitalizationDetails}
                    onChange={(e) => updateField("hospitalizationDetails", e.target.value)}
                    rows={3}
                    className="border-2 border-roxo-suave/30"
                  />
                </div>
              )}

              <div>
                <Label>A criança já foi submetida a cirurgias?</Label>
                <RadioGroup 
                  value={formData.hasHadSurgeries ? "sim" : "nao"}
                  onValueChange={(value) => updateField("hasHadSurgeries", value === "sim")}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-roxo-suave/30 hover:border-roxo-suave cursor-pointer">
                    <RadioGroupItem value="sim" id="surg-sim" />
                    <Label htmlFor="surg-sim" className="cursor-pointer flex-1">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-roxo-suave/30 hover:border-roxo-suave cursor-pointer">
                    <RadioGroupItem value="nao" id="surg-nao" />
                    <Label htmlFor="surg-nao" className="cursor-pointer flex-1">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.hasHadSurgeries && (
                <div>
                  <Label htmlFor="surgeryDetails">Detalhes das Cirurgias</Label>
                  <Textarea
                    id="surgeryDetails"
                    placeholder="Ex: 25/05/2023 - Apendicectomia aos 8 anos"
                    value={formData.surgeryDetails}
                    onChange={(e) => updateField("surgeryDetails", e.target.value)}
                    rows={3}
                    className="border-2 border-roxo-suave/30"
                  />
                </div>
              )}
            </div>
          )}

          {/* ETAPA 5: Desenvolvimento Infantil */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstWordsAge">Primeiras Palavras (idade aproximada)</Label>
                <Input
                  id="firstWordsAge"
                  placeholder="Ex: 12 meses"
                  value={formData.firstWordsAge}
                  onChange={(e) => updateField("firstWordsAge", e.target.value)}
                  className="border-2 border-verde-menta/30"
                />
              </div>

              <div>
                <Label htmlFor="firstStepsAge">Primeiros Passos (idade aproximada)</Label>
                <Input
                  id="firstStepsAge"
                  placeholder="Ex: 14 meses"
                  value={formData.firstStepsAge}
                  onChange={(e) => updateField("firstStepsAge", e.target.value)}
                  className="border-2 border-verde-menta/30"
                />
              </div>

              <div>
                <Label htmlFor="sphincterControlAge">Controle dos Esfíncteres (idade aproximada)</Label>
                <Input
                  id="sphincterControlAge"
                  placeholder="Ex: 2 anos e 6 meses"
                  value={formData.sphincterControlAge}
                  onChange={(e) => updateField("sphincterControlAge", e.target.value)}
                  className="border-2 border-verde-menta/30"
                />
              </div>

              <div>
                <Label>Percepção dos Pais sobre o Desenvolvimento</Label>
                <RadioGroup 
                  value={formData.developmentPerception} 
                  onValueChange={(value) => updateField("developmentPerception", value)}
                  className="mt-2 space-y-2"
                >
                  {["Adequado para a idade", "Um pouco avançado", "Algumas preocupações"].map((option) => (
                    <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border-2 border-verde-menta/30 hover:border-verde-menta cursor-pointer">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="developmentObservations">Observações sobre o Desenvolvimento</Label>
                <Textarea
                  id="developmentObservations"
                  placeholder="Habilidades especiais, dificuldades observadas, marcos importantes..."
                  value={formData.developmentObservations}
                  onChange={(e) => updateField("developmentObservations", e.target.value)}
                  rows={3}
                  className="border-2 border-verde-menta/30"
                />
              </div>
            </div>
          )}

          {/* ETAPA 6: Dados do Nascimento */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="birthWeight">Peso ao Nascer</Label>
                <Input
                  id="birthWeight"
                  placeholder="Ex: 3.2 kg"
                  value={formData.birthWeight}
                  onChange={(e) => updateField("birthWeight", e.target.value)}
                  className="border-2 border-rosa-bebe/30"
                />
              </div>

              <div>
                <Label>Idade Gestacional</Label>
                <RadioGroup 
                  value={formData.gestationalAge} 
                  onValueChange={(value) => updateField("gestationalAge", value)}
                  className="mt-2 space-y-2"
                >
                  {["Pré-termo (antes de 37 semanas)", "Termo precoce (37-38 semanas)", "Termo cheio (39-40 semanas)", "Termo tardio (após 40 semanas)"].map((option) => (
                    <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border-2 border-rosa-bebe/30 hover:border-rosa-bebe cursor-pointer">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Tipo de Parto</Label>
                <RadioGroup 
                  value={formData.deliveryType} 
                  onValueChange={(value) => updateField("deliveryType", value)}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-rosa-bebe/30 hover:border-rosa-bebe cursor-pointer">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="cursor-pointer flex-1">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-rosa-bebe/30 hover:border-rosa-bebe cursor-pointer">
                    <RadioGroupItem value="cesarea" id="cesarea" />
                    <Label htmlFor="cesarea" className="cursor-pointer flex-1">Cesárea</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="pregnancyComplications">Complicações na Gestação</Label>
                <Textarea
                  id="pregnancyComplications"
                  placeholder="Ex: Diabetes gestacional, pré-eclâmpsia, placenta prévia..."
                  value={formData.pregnancyComplications}
                  onChange={(e) => updateField("pregnancyComplications", e.target.value)}
                  rows={3}
                  className="border-2 border-rosa-bebe/30"
                />
              </div>

              <div>
                <Label htmlFor="deliveryComplications">Complicações no Parto</Label>
                <Textarea
                  id="deliveryComplications"
                  placeholder="Ex: Sofrimento fetal, fórceps, UTI neonatal..."
                  value={formData.deliveryComplications}
                  onChange={(e) => updateField("deliveryComplications", e.target.value)}
                  rows={3}
                  className="border-2 border-rosa-bebe/30"
                />
              </div>
            </div>
          )}

          {/* ETAPA 7: Vacinação */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <Label>Cartão de Vacinas Atualizado?</Label>
                <RadioGroup 
                  value={formData.vaccinationCardStatus} 
                  onValueChange={(value) => updateField("vaccinationCardStatus", value)}
                  className="mt-2 space-y-2"
                >
                  {["Sim, está em dia", "Atrasada, mas tenho o cartão", "Não tenho certeza"].map((option) => (
                    <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border-2 border-azul-claro/30 hover:border-azul-claro cursor-pointer">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {(formData.vaccinationCardStatus === "Atrasada, mas tenho o cartão" || formData.vaccinationCardStatus === "Não tenho certeza") && (
                <div>
                  <Label htmlFor="vaccinationDetails">Detalhes sobre Vacinação</Label>
                  <Textarea
                    id="vaccinationDetails"
                    placeholder="Vacinas em atraso, dúvidas sobre calendário vacinal..."
                    value={formData.vaccinationDetails}
                    onChange={(e) => updateField("vaccinationDetails", e.target.value)}
                    rows={3}
                    className="border-2 border-azul-claro/30"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="lastVaccinationDate">Última Consulta de Vacinação</Label>
                <Input
                  id="lastVaccinationDate"
                  placeholder="Ex: Março de 2024"
                  value={formData.lastVaccinationDate}
                  onChange={(e) => updateField("lastVaccinationDate", e.target.value)}
                  className="border-2 border-azul-claro/30"
                />
              </div>
            </div>
          )}

          {/* ETAPA 8: Antecedentes Familiares */}
          {step === 8 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="familyMedicalHistory">Histórico Familiar de Doenças Importantes</Label>
                <Textarea
                  id="familyMedicalHistory"
                  placeholder="Ex: Diabetes na família (avó paterna), Asma (pai e avô materno), problemas cardíacos, alergias importantes..."
                  value={formData.familyMedicalHistory}
                  onChange={(e) => updateField("familyMedicalHistory", e.target.value)}
                  rows={4}
                  className="border-2 border-amarelo-suave/30"
                />
              </div>

              <div>
                <Label>Consanguinidade dos Pais (casamento entre parentes)</Label>
                <RadioGroup 
                  value={formData.parentsConsanguinity ? "sim" : "nao"}
                  onValueChange={(value) => updateField("parentsConsanguinity", value === "sim")}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-amarelo-suave/30 hover:border-amarelo-suave cursor-pointer">
                    <RadioGroupItem value="nao" id="cons-nao" />
                    <Label htmlFor="cons-nao" className="cursor-pointer flex-1">Não</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-amarelo-suave/30 hover:border-amarelo-suave cursor-pointer">
                    <RadioGroupItem value="sim" id="cons-sim" />
                    <Label htmlFor="cons-sim" className="cursor-pointer flex-1">Sim</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.parentsConsanguinity && (
                <div>
                  <Label htmlFor="consanguinityDegree">Grau de Parentesco</Label>
                  <Input
                    id="consanguinityDegree"
                    placeholder="Ex: Primo e prima"
                    value={formData.consanguinityDegree}
                    onChange={(e) => updateField("consanguinityDegree", e.target.value)}
                    className="border-2 border-amarelo-suave/30"
                  />
                </div>
              )}
            </div>
          )}

          {/* ETAPA 9: Informações Finais */}
          {step === 9 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="parentsConcerns">Principais Preocupações dos Pais/Cuidadores</Label>
                <Textarea
                  id="parentsConcerns"
                  placeholder="Dúvidas que gostariam de abordar com o pediatra..."
                  value={formData.parentsConcerns}
                  onChange={(e) => updateField("parentsConcerns", e.target.value)}
                  rows={4}
                  className="border-2 border-primary/30"
                />
              </div>

              <div>
                <Label htmlFor="specificQuestions">Questões Específicas</Label>
                <Textarea
                  id="specificQuestions"
                  placeholder="Alimentação, sono, comportamento, crescimento, dúvidas sobre desenvolvimento..."
                  value={formData.specificQuestions}
                  onChange={(e) => updateField("specificQuestions", e.target.value)}
                  rows={4}
                  className="border-2 border-primary/30"
                />
              </div>

              <div>
                <Label htmlFor="additionalObservations">Observações Adicionais Importantes</Label>
                <Textarea
                  id="additionalObservations"
                  placeholder="Qualquer informação adicional relevante que não foi mencionada..."
                  value={formData.additionalObservations}
                  onChange={(e) => updateField("additionalObservations", e.target.value)}
                  rows={4}
                  className="border-2 border-primary/30"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex gap-3">
            {step < totalSteps ? (
              <Button 
                onClick={() => setStep(step + 1)} 
                className="flex-1 bg-gradient-to-r from-primary to-azul-claro hover:opacity-90 text-white py-6"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-gradient-to-r from-success to-verde-menta hover:opacity-90 text-white py-6"
              >
                Finalizar Questionário
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}