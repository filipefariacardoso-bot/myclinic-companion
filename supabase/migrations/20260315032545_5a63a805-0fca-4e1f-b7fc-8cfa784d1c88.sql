-- Fix: Change medical_questionnaires RLS policies from 'public' role to 'authenticated' role
-- This adds explicit authentication enforcement, eliminating reliance on auth.uid() null-checks

-- Drop existing public-role policies
DROP POLICY IF EXISTS "Admins can delete questionnaires" ON public.medical_questionnaires;
DROP POLICY IF EXISTS "Admins can update all questionnaires" ON public.medical_questionnaires;
DROP POLICY IF EXISTS "Admins can view all questionnaires" ON public.medical_questionnaires;
DROP POLICY IF EXISTS "Users can insert their own questionnaires" ON public.medical_questionnaires;
DROP POLICY IF EXISTS "Users can view their own questionnaires" ON public.medical_questionnaires;

-- Recreate with 'authenticated' role
CREATE POLICY "Admins can delete questionnaires"
ON public.medical_questionnaires FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all questionnaires"
ON public.medical_questionnaires FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all questionnaires"
ON public.medical_questionnaires FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own questionnaires"
ON public.medical_questionnaires FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own questionnaires"
ON public.medical_questionnaires FOR SELECT
TO authenticated
USING (auth.uid() = user_id);