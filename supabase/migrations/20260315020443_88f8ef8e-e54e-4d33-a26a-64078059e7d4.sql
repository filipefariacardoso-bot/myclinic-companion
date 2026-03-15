
-- ============================================================
-- 1. EXAM ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exam_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  preparation_instructions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.exam_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all exam orders"
  ON public.exam_orders FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can view their own exam orders"
  ON public.exam_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 2. PRESCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  medications JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all prescriptions"
  ON public.prescriptions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can view their own prescriptions"
  ON public.prescriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. Update exam_results: allow patient to INSERT their own
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage all exam results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can view their own exam results" ON public.exam_results;

CREATE POLICY "Admins can manage all exam results"
  ON public.exam_results FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can view their own exam results"
  ON public.exam_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own exam results"
  ON public.exam_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can delete their own exam results"
  ON public.exam_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
