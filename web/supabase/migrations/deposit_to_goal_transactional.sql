-- Migration: Cria a RPC deposit_to_goal_transactional para depósitos atômicos em metas
CREATE OR REPLACE FUNCTION deposit_to_goal_transactional(
  p_goal_id UUID,
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_date DATE
) RETURNS void AS $$
BEGIN
  -- 1. Incrementar o saldo da meta atomicamente
  UPDATE public.goals
  SET current_amount = current_amount + p_amount
  WHERE id = p_goal_id AND user_id = p_user_id;

  -- 2. Inserir a transação de despesa correspondente
  INSERT INTO public.transactions (
    user_id,
    description,
    amount,
    type,
    status,
    transaction_date
  ) VALUES (
    p_user_id,
    p_description,
    p_amount,
    'expense',
    'paid',
    p_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
