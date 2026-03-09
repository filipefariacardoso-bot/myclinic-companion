
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('appointment', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins can see all notifications
CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert notifications
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  TO public
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));
