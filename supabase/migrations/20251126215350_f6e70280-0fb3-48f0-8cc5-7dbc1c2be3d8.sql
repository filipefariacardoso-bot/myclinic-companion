-- Criar bucket de storage para cartilhas
INSERT INTO storage.buckets (id, name, public)
VALUES ('cartilhas', 'cartilhas', true);

-- Criar tabela de cartilhas
CREATE TABLE public.cartilhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cartilhas ENABLE ROW LEVEL SECURITY;

-- Policy para clientes visualizarem
CREATE POLICY "Clientes podem visualizar cartilhas"
ON public.cartilhas
FOR SELECT
TO authenticated
USING (true);

-- Policy para admin inserir
CREATE POLICY "Admin pode inserir cartilhas"
ON public.cartilhas
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policy para admin atualizar
CREATE POLICY "Admin pode atualizar cartilhas"
ON public.cartilhas
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Policy para admin deletar
CREATE POLICY "Admin pode deletar cartilhas"
ON public.cartilhas
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cartilhas_updated_at
BEFORE UPDATE ON public.cartilhas
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Policies de storage para o bucket cartilhas
CREATE POLICY "Todos podem visualizar cartilhas no storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'cartilhas');

CREATE POLICY "Admin pode fazer upload de cartilhas"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cartilhas' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode atualizar cartilhas no storage"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'cartilhas' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar cartilhas no storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'cartilhas' AND has_role(auth.uid(), 'admin'));