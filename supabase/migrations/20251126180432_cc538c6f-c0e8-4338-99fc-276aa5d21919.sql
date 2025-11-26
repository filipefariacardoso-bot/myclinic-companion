-- Add DELETE policy for medical_questionnaires table
-- Only admins can delete medical records
CREATE POLICY "Admins can delete questionnaires"
ON public.medical_questionnaires
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));