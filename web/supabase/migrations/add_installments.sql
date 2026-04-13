ALTER TABLE public.recurring_transactions 
ADD COLUMN IF NOT EXISTS installments integer;

ALTER TABLE public.recurring_transactions 
ADD COLUMN IF NOT EXISTS generated_installments integer NOT NULL DEFAULT 0;
