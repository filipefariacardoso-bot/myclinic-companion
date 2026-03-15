
-- Add attachment columns to prescriptions
ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_name text;

-- Create prescriptions storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: admins can do everything in the prescriptions bucket
CREATE POLICY "Admins can manage prescription files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'prescriptions'
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'prescriptions'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- RLS: patients can only read files in their own folder
CREATE POLICY "Patients can read their own prescription files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'prescriptions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
