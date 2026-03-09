
-- Drop the overly restrictive SELECT policy that only shows active fields to everyone
DROP POLICY IF EXISTS "All authenticated users can view active fields" ON public.questionnaire_fields;

-- Policy for regular patients: only see active fields
CREATE POLICY "Clients can view active fields"
  ON public.questionnaire_fields
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND NOT has_role(auth.uid(), 'admin'::app_role)
  );

-- Policy for admins: see ALL fields (active and inactive) for full management
CREATE POLICY "Admins can view all fields"
  ON public.questionnaire_fields
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
