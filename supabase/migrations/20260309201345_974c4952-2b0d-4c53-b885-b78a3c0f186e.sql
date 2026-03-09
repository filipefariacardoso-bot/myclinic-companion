
-- 1. Create a dedicated private bucket for exam results
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-results', 'exam-results', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Tighten ebooks storage policy to exclude exam-results/ path
DROP POLICY IF EXISTS "Todos podem visualizar e-books no storage" ON storage.objects;

CREATE POLICY "Authenticated users can view ebooks (not exam-results)"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ebooks'
    AND (storage.foldername(name))[1] != 'exam-results'
  );

-- 3. Patients can only read their own exam result files (stored under their user_id folder)
CREATE POLICY "Patients can view their own exam results"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'exam-results'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Admins can read all exam results
CREATE POLICY "Admins can view all exam results in storage"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'exam-results'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- 5. Admins can upload exam results
CREATE POLICY "Admins can upload exam results"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exam-results'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- 6. Admins can delete exam results
CREATE POLICY "Admins can delete exam results"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exam-results'
    AND has_role(auth.uid(), 'admin'::app_role)
  );
