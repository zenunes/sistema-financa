-- Migration: Adiciona a coluna start_month na tabela de transações recorrentes
ALTER TABLE public.recurring_transactions 
ADD COLUMN IF NOT EXISTS start_month date;
