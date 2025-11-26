-- Criar tabela de parceiros
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  specialty text,
  phone text,
  email text,
  image_url text,
  website text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem visualizar parceiros"
ON public.partners
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin pode inserir parceiros"
ON public.partners
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode atualizar parceiros"
ON public.partners
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar parceiros"
ON public.partners
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Criar tabela de informações de pagamento
CREATE TABLE public.payment_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  pix_key text,
  pix_key_type text,
  bank_info text,
  instructions text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payment_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem visualizar informações de pagamento"
ON public.payment_info
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admin pode gerenciar informações de pagamento"
ON public.payment_info
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Criar tabela de localização da clínica
CREATE TABLE public.clinic_location (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text,
  phone text,
  email text,
  opening_hours text,
  map_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.clinic_location ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem visualizar localização"
ON public.clinic_location
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admin pode gerenciar localização"
ON public.clinic_location
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Criar tabela de consultas agendadas
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  patient_name text NOT NULL,
  appointment_date timestamp with time zone NOT NULL,
  appointment_type text NOT NULL,
  notes text,
  status text DEFAULT 'scheduled',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias consultas"
ON public.appointments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias consultas"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin pode ver todas as consultas"
ON public.appointments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode atualizar consultas"
ON public.appointments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar consultas"
ON public.appointments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Criar tabela de e-books
CREATE TABLE public.ebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  author text,
  file_url text NOT NULL,
  cover_image_url text,
  category text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem visualizar e-books"
ON public.ebooks
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin pode gerenciar e-books"
ON public.ebooks
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Criar bucket de storage para e-books
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', true);

CREATE POLICY "Todos podem visualizar e-books no storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'ebooks');

CREATE POLICY "Admin pode fazer upload de e-books"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ebooks' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar e-books no storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ebooks' AND has_role(auth.uid(), 'admin'));

-- Criar bucket para imagens de parceiros
INSERT INTO storage.buckets (id, name, public)
VALUES ('partners', 'partners', true);

CREATE POLICY "Todos podem visualizar imagens de parceiros"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'partners');

CREATE POLICY "Admin pode fazer upload de imagens de parceiros"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'partners' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar imagens de parceiros"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'partners' AND has_role(auth.uid(), 'admin'));

-- Triggers para atualizar updated_at
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payment_info_updated_at
BEFORE UPDATE ON public.payment_info
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_clinic_location_updated_at
BEFORE UPDATE ON public.clinic_location
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_ebooks_updated_at
BEFORE UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();