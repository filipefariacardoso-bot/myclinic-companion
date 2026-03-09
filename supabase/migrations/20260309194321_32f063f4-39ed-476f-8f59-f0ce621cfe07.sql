
-- Create questionnaire_fields table for dynamic form management
CREATE TABLE public.questionnaire_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 0,
  field_label TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  field_options JSONB,
  is_required BOOLEAN NOT NULL DEFAULT false,
  field_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  placeholder TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questionnaire_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view active fields"
  ON public.questionnaire_fields FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert questionnaire fields"
  ON public.questionnaire_fields FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update questionnaire fields"
  ON public.questionnaire_fields FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete questionnaire fields"
  ON public.questionnaire_fields FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_questionnaire_fields_updated_at
  BEFORE UPDATE ON public.questionnaire_fields
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed: All existing questionnaire fields organized by section
INSERT INTO public.questionnaire_fields (section_name, section_order, field_label, field_key, field_type, is_required, field_order, placeholder) VALUES
('Informações Pessoais', 1, 'Nome da criança', 'childName', 'text', true, 1, 'Nome completo da criança'),
('Informações Pessoais', 1, 'Idade', 'childAge', 'text', true, 2, 'Ex: 2 anos e 6 meses'),
('Informações Pessoais', 1, 'Sexo', 'childSex', 'radio', true, 3, NULL),
('Informações Pessoais', 1, 'Nome da Mãe', 'motherName', 'text', true, 4, 'Nome completo da mãe'),
('Informações Pessoais', 1, 'Nome do Pai', 'fatherName', 'text', false, 5, 'Nome completo do pai'),
('Motivo da Consulta', 2, 'Motivo Principal da Consulta', 'consultationReason', 'radio', true, 1, NULL),
('Motivo da Consulta', 2, 'Sintomas Principais', 'mainSymptoms', 'checkbox', false, 2, NULL),
('Motivo da Consulta', 2, 'Duração dos Sintomas', 'symptomsDuration', 'radio', false, 3, NULL),
('Motivo da Consulta', 2, 'História da Moléstia Atual', 'currentIllnessHistory', 'textarea', false, 4, 'Descreva quando começou, como evoluiu...'),
('Motivo da Consulta', 2, 'Nível de Urgência', 'urgencyLevel', 'radio', false, 5, NULL),
('Histórico Médico', 3, 'Medicamentos em Uso', 'currentMedications', 'textarea', false, 1, 'Liste: Nome, Dose, Frequência, Desde quando'),
('Histórico Médico', 3, 'Doenças Recentes (último ano)', 'recentDiseases', 'textarea', false, 2, 'Ex: Março/2024 - Gripe tratada com...'),
('Histórico Médico', 3, 'Histórico Médico Anterior', 'pastMedicalHistory', 'textarea', false, 3, 'Problemas de saúde passados, condições crônicas...'),
('Histórico Médico', 3, 'Alergias Conhecidas', 'knownAllergies', 'textarea', false, 4, 'Medicamentos, alimentos, outras...'),
('Hospitalizações e Cirurgias', 4, 'Já foi hospitalizado?', 'hasBeenHospitalized', 'boolean', false, 1, NULL),
('Hospitalizações e Cirurgias', 4, 'Detalhes das Hospitalizações', 'hospitalizationDetails', 'textarea', false, 2, 'Ex: 15/03/2023 - Pneumonia - Hospital Regional'),
('Hospitalizações e Cirurgias', 4, 'Já fez cirurgias?', 'hasHadSurgeries', 'boolean', false, 3, NULL),
('Hospitalizações e Cirurgias', 4, 'Detalhes das Cirurgias', 'surgeryDetails', 'textarea', false, 4, 'Ex: 25/05/2023 - Apendicectomia'),
('Desenvolvimento Infantil', 5, 'Idade das Primeiras Palavras', 'firstWordsAge', 'text', false, 1, 'Ex: 12 meses'),
('Desenvolvimento Infantil', 5, 'Idade dos Primeiros Passos', 'firstStepsAge', 'text', false, 2, 'Ex: 14 meses'),
('Desenvolvimento Infantil', 5, 'Controle de Esfíncter', 'sphincterControlAge', 'text', false, 3, 'Ex: 2 anos e 6 meses'),
('Desenvolvimento Infantil', 5, 'Percepção do Desenvolvimento', 'developmentPerception', 'radio', false, 4, NULL),
('Desenvolvimento Infantil', 5, 'Observações sobre Desenvolvimento', 'developmentObservations', 'textarea', false, 5, 'Habilidades especiais, dificuldades observadas...'),
('Dados do Nascimento', 6, 'Peso ao Nascer', 'birthWeight', 'text', false, 1, 'Ex: 3.2 kg'),
('Dados do Nascimento', 6, 'Idade Gestacional', 'gestationalAge', 'radio', false, 2, NULL),
('Dados do Nascimento', 6, 'Tipo de Parto', 'deliveryType', 'radio', false, 3, NULL),
('Dados do Nascimento', 6, 'Complicações na Gestação', 'pregnancyComplications', 'textarea', false, 4, 'Ex: Diabetes gestacional, pré-eclâmpsia...'),
('Dados do Nascimento', 6, 'Complicações no Parto', 'deliveryComplications', 'textarea', false, 5, 'Ex: Sofrimento fetal, fórceps...'),
('Vacinação', 7, 'Cartão de Vacinas', 'vaccinationCardStatus', 'radio', false, 1, NULL),
('Vacinação', 7, 'Detalhes de Vacinação', 'vaccinationDetails', 'textarea', false, 2, 'Vacinas em atraso, dúvidas sobre calendário vacinal...'),
('Vacinação', 7, 'Última Vacina', 'lastVaccinationDate', 'text', false, 3, 'Ex: Março de 2024'),
('Antecedentes Familiares', 8, 'Histórico Familiar de Doenças', 'familyMedicalHistory', 'textarea', false, 1, 'Ex: Diabetes (avó paterna), Asma (pai)...'),
('Antecedentes Familiares', 8, 'Consanguinidade dos Pais', 'parentsConsanguinity', 'boolean', false, 2, NULL),
('Antecedentes Familiares', 8, 'Grau de Consanguinidade', 'consanguinityDegree', 'text', false, 3, 'Ex: Primo e prima'),
('Informações Finais', 9, 'Preocupações dos Pais', 'parentsConcerns', 'textarea', false, 1, 'Dúvidas que gostariam de abordar com o pediatra...'),
('Informações Finais', 9, 'Perguntas Específicas', 'specificQuestions', 'textarea', false, 2, 'Alimentação, sono, comportamento, crescimento...'),
('Informações Finais', 9, 'Observações Adicionais', 'additionalObservations', 'textarea', false, 3, 'Qualquer informação adicional relevante...');

-- Also add the new columns to medical_questionnaires for fatherName and motherName
ALTER TABLE public.medical_questionnaires
  ADD COLUMN IF NOT EXISTS father_name TEXT,
  ADD COLUMN IF NOT EXISTS mother_name TEXT;
