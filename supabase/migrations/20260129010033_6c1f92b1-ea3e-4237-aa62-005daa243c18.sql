-- Create exam_results table
CREATE TABLE public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  patient_name TEXT NOT NULL,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own results
CREATE POLICY "Users can view their own exam results"
ON public.exam_results
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all exam results"
ON public.exam_results
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_exam_results_updated_at
BEFORE UPDATE ON public.exam_results
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();