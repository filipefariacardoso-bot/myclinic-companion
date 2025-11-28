-- Expandir tabela medical_questionnaires com novos campos do questionário completo

-- Adicionar novos campos para ETAPA 2: MOTIVO DA CONSULTA (expandido)
ALTER TABLE medical_questionnaires 
ADD COLUMN IF NOT EXISTS consultation_reason VARCHAR(50),
ADD COLUMN IF NOT EXISTS main_symptoms TEXT[],
ADD COLUMN IF NOT EXISTS symptoms_duration VARCHAR(50),
ADD COLUMN IF NOT EXISTS current_illness_history TEXT,
ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(20);

-- Adicionar novos campos para ETAPA 3: HISTÓRICO MÉDICO
ALTER TABLE medical_questionnaires
ADD COLUMN IF NOT EXISTS current_medications TEXT,
ADD COLUMN IF NOT EXISTS recent_diseases TEXT,
ADD COLUMN IF NOT EXISTS past_medical_history TEXT,
ADD COLUMN IF NOT EXISTS known_allergies TEXT;

-- Adicionar novos campos para ETAPA 4: HOSPITALIZAÇÕES E CIRURGIAS
ALTER TABLE medical_questionnaires
ADD COLUMN IF NOT EXISTS has_been_hospitalized BOOLEAN,
ADD COLUMN IF NOT EXISTS hospitalization_details TEXT,
ADD COLUMN IF NOT EXISTS has_had_surgeries BOOLEAN,
ADD COLUMN IF NOT EXISTS surgery_details TEXT;

-- Adicionar novos campos para ETAPA 5: DESENVOLVIMENTO INFANTIL
ALTER TABLE medical_questionnaires
ADD COLUMN IF NOT EXISTS first_words_age VARCHAR(50),
ADD COLUMN IF NOT EXISTS first_steps_age VARCHAR(50),
ADD COLUMN IF NOT EXISTS sphincter_control_age VARCHAR(50),
ADD COLUMN IF NOT EXISTS development_perception VARCHAR(50),
ADD COLUMN IF NOT EXISTS development_observations TEXT;

-- Adicionar novos campos para ETAPA 6: DADOS DO NASCIMENTO (expandido)
ALTER TABLE medical_questionnaires
ADD COLUMN IF NOT EXISTS gestational_age VARCHAR(50),
ADD COLUMN IF NOT EXISTS pregnancy_complications TEXT,
ADD COLUMN IF NOT EXISTS delivery_complications TEXT;

-- Adicionar novos campos para ETAPA 7: VACINAÇÃO
ALTER TABLE medical_questionnaires
ADD COLUMN IF NOT EXISTS vaccination_card_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS vaccination_details TEXT,
ADD COLUMN IF NOT EXISTS last_vaccination_date VARCHAR(50);

-- Adicionar novos campos para ETAPA 8: ANTECEDENTES FAMILIARES
ALTER TABLE medical_questionnaires
ADD COLUMN IF NOT EXISTS family_medical_history TEXT,
ADD COLUMN IF NOT EXISTS parents_consanguinity BOOLEAN,
ADD COLUMN IF NOT EXISTS consanguinity_degree TEXT;

-- Adicionar novos campos para ETAPA 9: INFORMAÇÕES FINAIS
ALTER TABLE medical_questionnaires
ADD COLUMN IF NOT EXISTS parents_concerns TEXT,
ADD COLUMN IF NOT EXISTS specific_questions TEXT,
ADD COLUMN IF NOT EXISTS additional_observations TEXT;

-- Atualizar comentário da tabela
COMMENT ON TABLE medical_questionnaires IS 'Questionário de pré-consulta pediátrica expandido com 9 etapas completas';