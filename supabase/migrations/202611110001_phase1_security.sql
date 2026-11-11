-- Phase 1 security hardening
-- Apply after backing up the database. Staff accounts must be linked to Supabase Auth users.

alter table public.user_accounts
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade,
  add column if not exists role_key text,
  add column if not exists is_active boolean not null default true;

alter table public.user_accounts
  add constraint user_accounts_role_key_check
  check (role_key is null or role_key in ('admin', 'manager', 'cashier'));

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
