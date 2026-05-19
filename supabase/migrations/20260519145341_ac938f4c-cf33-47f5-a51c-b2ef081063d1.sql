ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS patient_phone text,
  ADD COLUMN IF NOT EXISTS appointment_time time,
  ADD COLUMN IF NOT EXISTS specialty_or_professional text;