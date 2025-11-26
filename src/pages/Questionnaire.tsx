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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";

const questionnaireSchema = z.object({
  childName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  childAge: z.string().min(1).max(50),
  childSex: z.enum(["masculino", "feminino"]),
  mainComplaint: z.string().min(1),
  complaintDetails: z.string().max(1000).optional(),
  healthHistory: z.string().max(500).optional(),
  medications: z.string().max(500).optional(),
  birthWeight: z.string().max(20).optional(),
  deliveryType: z.enum(["normal", "cesarea"]).optional(),
  pregnancyComplications: z.string().max(500).optional()
});

export default function Questionnaire() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    childName: "",
    childAge: "",
    childSex: "",
    mainComplaint: "",
    complaintDetails: "",
    healthHistory: "",
    medications: "",
    birthWeight: "",
    deliveryType: "",
    pregnancyComplications: ""
  });
  const [errors, setErrors] = useState<any>({});
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: undefined }));
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
        main_complaint: validatedData.mainComplaint,
        complaint_details: validatedData.complaintDetails,
        health_history: validatedData.healthHistory,
        medications: validatedData.medications,
        birth_weight: validatedData.birthWeight,
        delivery_type: validatedData.deliveryType,
        pregnancy_complications: validatedData.pregnancyComplications
      });

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
          description: "Verifique os campos e tente novamente"
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
              <h2 className="text-2xl font-bold">
                {step === 1 && "Informações Pessoais"}
                {step === 2 && "Queixa Principal"}
                {step === 3 && "Histórico de Saúde"}
                {step === 4 && "Dados do Nascimento"}
              </h2>
            </div>
          </div>

          {/* Step 1 */}
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
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Qual é a principal preocupação? *</Label>
                <RadioGroup 
                  value={formData.mainComplaint} 
                  onValueChange={(value) => updateField("mainComplaint", value)}
                  className="mt-2 space-y-2"
                >
                  {["Febre", "Tosse", "Vômito/Diarreia", "Dor abdominal", "Consulta de rotina", "Outros"].map((option) => (
                    <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border-2 border-verde-menta/30 hover:border-verde-menta cursor-pointer">
                      <RadioGroupItem value={option.toLowerCase()} id={option} />
                      <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {formData.mainComplaint === "outros" && (
                <div>
                  <Label htmlFor="complaintDetails">Detalhes</Label>
                  <Textarea
                    id="complaintDetails"
                    value={formData.complaintDetails}
                    onChange={(e) => updateField("complaintDetails", e.target.value)}
                    rows={3}
                    className="border-2 border-verde-menta/30"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Histórico de saúde</Label>
                <RadioGroup 
                  value={formData.healthHistory} 
                  onValueChange={(value) => updateField("healthHistory", value)}
                  className="mt-2 space-y-2"
                >
                  {["Primeira consulta", "Seguimento de tratamento", "Check-up preventivo"].map((option) => (
                    <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border-2 border-amarelo-suave/30 hover:border-amarelo-suave cursor-pointer">
                      <RadioGroupItem value={option.toLowerCase()} id={option} />
                      <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="medications">Medicamentos em uso</Label>
                <Textarea
                  id="medications"
                  placeholder="Liste os medicamentos, se houver"
                  value={formData.medications}
                  onChange={(e) => updateField("medications", e.target.value)}
                  rows={3}
                  className="border-2 border-amarelo-suave/30"
                />
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="birthWeight">Peso ao nascer</Label>
                <Input
                  id="birthWeight"
                  placeholder="Ex: 3.2 kg"
                  value={formData.birthWeight}
                  onChange={(e) => updateField("birthWeight", e.target.value)}
                  className="border-2 border-roxo-suave/30"
                />
              </div>

              <div>
                <Label>Tipo de parto</Label>
                <RadioGroup 
                  value={formData.deliveryType} 
                  onValueChange={(value) => updateField("deliveryType", value)}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-roxo-suave/30 hover:border-roxo-suave cursor-pointer">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="cursor-pointer flex-1">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border-2 border-roxo-suave/30 hover:border-roxo-suave cursor-pointer">
                    <RadioGroupItem value="cesarea" id="cesarea" />
                    <Label htmlFor="cesarea" className="cursor-pointer flex-1">Cesárea</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="pregnancyComplications">Complicações na gestação</Label>
                <Textarea
                  id="pregnancyComplications"
                  placeholder="Liste complicações, se houver"
                  value={formData.pregnancyComplications}
                  onChange={(e) => updateField("pregnancyComplications", e.target.value)}
                  rows={3}
                  className="border-2 border-roxo-suave/30"
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