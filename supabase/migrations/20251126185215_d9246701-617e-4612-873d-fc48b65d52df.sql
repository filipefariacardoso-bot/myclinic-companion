-- Adicionar campo de consentimento na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN consent_given boolean DEFAULT false NOT NULL,
ADD COLUMN consent_date timestamp with time zone;

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.consent_given IS 'Indica se o paciente consentiu com o acesso do médico aos seus dados médicos';
COMMENT ON COLUMN public.profiles.consent_date IS 'Data e hora em que o consentimento foi dado';