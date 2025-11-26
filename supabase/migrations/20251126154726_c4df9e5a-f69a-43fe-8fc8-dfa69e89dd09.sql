-- Tabela de perfis de usuários (clientes)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de questionários médicos
CREATE TABLE public.medical_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Informações Pessoais
  child_name TEXT NOT NULL,
  child_age TEXT NOT NULL,
  child_sex TEXT NOT NULL CHECK (child_sex IN ('masculino', 'feminino')),
  -- Queixa Principal
  main_complaint TEXT NOT NULL,
  complaint_details TEXT,
  -- Histórico de Saúde
  health_history TEXT,
  medications TEXT,
  -- Dados Neonatais
  birth_weight TEXT,
  delivery_type TEXT CHECK (delivery_type IN ('normal', 'cesarea')),
  pregnancy_complications TEXT,
  -- Metadados
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'completed'))
);

-- Tabela de pesquisas de satisfação
CREATE TABLE public.satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de roles de usuário (admin vs cliente)
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'client',
  UNIQUE(user_id, role)
);

-- Função para verificar se usuário tem role específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger para profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para medical_questionnaires
CREATE POLICY "Users can view their own questionnaires"
  ON public.medical_questionnaires FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaires"
  ON public.medical_questionnaires FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all questionnaires"
  ON public.medical_questionnaires FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all questionnaires"
  ON public.medical_questionnaires FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para satisfaction_surveys
CREATE POLICY "Users can view their own surveys"
  ON public.satisfaction_surveys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own surveys"
  ON public.satisfaction_surveys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all surveys"
  ON public.satisfaction_surveys FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Função para criar profile automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    NEW.email
  );
  
  -- Atribuir role de cliente por padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Índices para melhor performance
CREATE INDEX idx_medical_questionnaires_user_id ON public.medical_questionnaires(user_id);
CREATE INDEX idx_medical_questionnaires_submitted_at ON public.medical_questionnaires(submitted_at DESC);
CREATE INDEX idx_satisfaction_surveys_user_id ON public.satisfaction_surveys(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);