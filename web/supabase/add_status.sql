-- Adiciona a coluna status na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid'));
