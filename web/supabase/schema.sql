create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  type text not null check (type in ('income', 'expense')),
  transaction_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  due_date date,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

drop policy if exists "category_select_own" on public.categories;
drop policy if exists "category_insert_own" on public.categories;
drop policy if exists "category_update_own" on public.categories;
drop policy if exists "category_delete_own" on public.categories;
create policy "category_select_own" on public.categories for select using (auth.uid() = user_id);
create policy "category_insert_own" on public.categories for insert with check (auth.uid() = user_id);
create policy "category_update_own" on public.categories for update using (auth.uid() = user_id);
create policy "category_delete_own" on public.categories for delete using (auth.uid() = user_id);

drop policy if exists "transaction_select_own" on public.transactions;
drop policy if exists "transaction_insert_own" on public.transactions;
drop policy if exists "transaction_update_own" on public.transactions;
drop policy if exists "transaction_delete_own" on public.transactions;
create policy "transaction_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transaction_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transaction_update_own" on public.transactions for update using (auth.uid() = user_id);
create policy "transaction_delete_own" on public.transactions for delete using (auth.uid() = user_id);

drop policy if exists "goal_select_own" on public.goals;
drop policy if exists "goal_insert_own" on public.goals;
drop policy if exists "goal_update_own" on public.goals;
drop policy if exists "goal_delete_own" on public.goals;
create policy "goal_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goal_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goal_update_own" on public.goals for update using (auth.uid() = user_id);
create policy "goal_delete_own" on public.goals for delete using (auth.uid() = user_id);

create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(transaction_date desc);
create index if not exists idx_goals_user_id on public.goals(user_id);
