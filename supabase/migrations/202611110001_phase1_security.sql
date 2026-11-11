-- Phase 1 security hardening
-- Apply after backing up the database. Staff accounts must be linked to Supabase Auth users.

alter table public.user_accounts
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade,
  add column if not exists role_key text,
  add column if not exists is_active boolean not null default true;

DO $phase1$
BEGIN
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_accounts_role_key_check'
      and conrelid = 'public.user_accounts'::regclass
  ) then
    alter table public.user_accounts
      add constraint user_accounts_role_key_check
      check (role_key is null or role_key in ('admin', 'manager', 'cashier'));
  end if;
END;
$phase1$;

create index if not exists idx_user_accounts_auth_user_id
  on public.user_accounts(auth_user_id);

create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select ua.role_key
  from public.user_accounts ua
  where ua.auth_user_id = (select auth.uid())
    and ua.is_active = true
  limit 1
$$;

revoke all on function public.current_staff_role() from public;
revoke all on function public.current_staff_role() from anon;
grant execute on function public.current_staff_role() to authenticated;

-- Ensure RLS is enabled even if the original schema was only partially applied.
alter table public.customers enable row level security;
alter table public.installment_schedules enable row level security;
alter table public.transactions enable row level security;
alter table public.expenses enable row level security;
alter table public.stock_products enable row level security;
alter table public.user_accounts enable row level security;

-- Remove the previous world-readable/world-writable policies.
drop policy if exists "Public full access on customers" on public.customers;
drop policy if exists "Public full access on installment_schedules" on public.installment_schedules;
drop policy if exists "Public full access on transactions" on public.transactions;
drop policy if exists "Public full access on expenses" on public.expenses;
drop policy if exists "Public full access on stock_products" on public.stock_products;
drop policy if exists "Public full access on user_accounts" on public.user_accounts;

-- Grants and RLS are both required: anon receives no table privileges.
revoke all on table public.customers, public.installment_schedules,
  public.transactions, public.expenses, public.stock_products, public.user_accounts
  from anon, authenticated;

grant select, insert, update, delete on public.customers,
  public.installment_schedules, public.transactions to authenticated;
grant select, insert, update, delete on public.expenses, public.stock_products to authenticated;
grant select, insert, update, delete on public.user_accounts to authenticated;

-- A staff member can access shared shop data only while their server-managed
-- user_accounts record is active. Role checks are enforced inside Postgres.
create policy "Staff read customers" on public.customers for select to authenticated
  using (public.current_staff_role() in ('admin', 'manager', 'cashier'));
create policy "Staff insert customers" on public.customers for insert to authenticated
  with check (public.current_staff_role() in ('admin', 'manager', 'cashier'));
create policy "Staff update customers" on public.customers for update to authenticated
  using (public.current_staff_role() in ('admin', 'manager', 'cashier'))
  with check (public.current_staff_role() in ('admin', 'manager', 'cashier'));
create policy "Staff delete customers" on public.customers for delete to authenticated
  using (public.current_staff_role() = 'admin');

create policy "Staff read installments" on public.installment_schedules for select to authenticated
  using (public.current_staff_role() in ('admin', 'manager', 'cashier'));
create policy "Staff insert installments" on public.installment_schedules for insert to authenticated
  with check (public.current_staff_role() in ('admin', 'manager', 'cashier'));
create policy "Staff update installments" on public.installment_schedules for update to authenticated
  using (public.current_staff_role() in ('admin', 'manager', 'cashier'))
  with check (public.current_staff_role() in ('admin', 'manager', 'cashier'));
create policy "Staff delete installments" on public.installment_schedules for delete to authenticated
  using (public.current_staff_role() = 'admin');

create policy "Staff read transactions" on public.transactions for select to authenticated
  using (public.current_staff_role() in ('admin', 'manager', 'cashier'));
create policy "Staff insert transactions" on public.transactions for insert to authenticated
  with check (public.current_staff_role() in ('admin', 'manager', 'cashier'));
create policy "Staff update transactions" on public.transactions for update to authenticated
  using (public.current_staff_role() in ('admin', 'manager', 'cashier'))
  with check (public.current_staff_role() in ('admin', 'manager', 'cashier'));
create policy "Staff delete transactions" on public.transactions for delete to authenticated
  using (public.current_staff_role() = 'admin');

create policy "Authorised staff read expenses" on public.expenses for select to authenticated
  using (public.current_staff_role() in ('admin', 'cashier'));
create policy "Authorised staff insert expenses" on public.expenses for insert to authenticated
  with check (public.current_staff_role() in ('admin', 'cashier'));
create policy "Authorised staff update expenses" on public.expenses for update to authenticated
  using (public.current_staff_role() in ('admin', 'cashier'))
  with check (public.current_staff_role() in ('admin', 'cashier'));
create policy "Admin delete expenses" on public.expenses for delete to authenticated
  using (public.current_staff_role() = 'admin');

create policy "Authorised staff read stock" on public.stock_products for select to authenticated
  using (public.current_staff_role() in ('admin', 'manager'));
create policy "Authorised staff insert stock" on public.stock_products for insert to authenticated
  with check (public.current_staff_role() in ('admin', 'manager'));
create policy "Authorised staff update stock" on public.stock_products for update to authenticated
  using (public.current_staff_role() in ('admin', 'manager'))
  with check (public.current_staff_role() in ('admin', 'manager'));
create policy "Admin delete stock" on public.stock_products for delete to authenticated
  using (public.current_staff_role() = 'admin');

create policy "Staff read own account or admin reads all" on public.user_accounts for select to authenticated
  using (auth_user_id = (select auth.uid()) or public.current_staff_role() = 'admin');
create policy "Admin inserts staff accounts" on public.user_accounts for insert to authenticated
  with check (public.current_staff_role() = 'admin');
create policy "Admin updates staff accounts" on public.user_accounts for update to authenticated
  using (public.current_staff_role() = 'admin')
  with check (public.current_staff_role() = 'admin');
create policy "Admin deletes staff accounts" on public.user_accounts for delete to authenticated
  using (public.current_staff_role() = 'admin');

-- Default privileges: newly-created tables in public must not be open to anon.
alter default privileges in schema public revoke all on tables from anon;

-- Per-user Gemini quota: 20 requests per rolling hour.
create table if not exists public.api_usage_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0
);
alter table public.api_usage_limits enable row level security;
revoke all on table public.api_usage_limits from anon, authenticated;
create or replace function public.consume_gemini_quota(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    return false;
  end if;
  insert into public.api_usage_limits(user_id, window_started_at, request_count)
  values (p_user_id, now(), 1)
  on conflict (user_id) do update
    set window_started_at = case
      when public.api_usage_limits.window_started_at < now() - interval '1 hour' then now()
      else public.api_usage_limits.window_started_at end,
    request_count = case
      when public.api_usage_limits.window_started_at < now() - interval '1 hour' then 1
      else public.api_usage_limits.request_count + 1 end
  returning request_count into current_count;
  return current_count <= 20;
end;
$$;
revoke all on function public.consume_gemini_quota(uuid) from public, anon;
grant execute on function public.consume_gemini_quota(uuid) to authenticated;
