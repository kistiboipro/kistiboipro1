# Phase 1 security deployment

This branch replaces the demo PIN login with Supabase Auth, removes browser-controlled role/session claims, protects the shop tables with role-based RLS, and restricts the Gemini endpoint.

## Before deployment

1. Take a verified Supabase database backup.
2. Keep the current production deployment available for rollback.
3. Confirm the Supabase project URL and **publishable/anon** key are set as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Set `GEMINI_API_KEY` only as a server-side secret. Never use a `NEXT_PUBLIC_` prefix for it.
5. Do not add a Supabase service-role/secret key to browser code or public environment variables.

## Apply the database migration

Run `supabase/migrations/202611110001_phase1_security.sql` in the Supabase SQL Editor after taking the backup. This removes the old public full-access policies. Anonymous users will lose direct table access; authenticated staff will be subject to role checks.

**The app will not permit staff sign-in until each staff member has a Supabase Auth user linked to an active `user_accounts` row with a valid `role_key`.**

## Create and link staff accounts

1. In Supabase Dashboard → Authentication → Users, invite/create each real staff member using their real email address and a strong unique password.
2. Copy the Auth user's UUID.
3. Link the UUID to the intended existing staff row and set the role from the allowed values. Example (replace the values; do not use the example UUID):

```sql
update public.user_accounts
set auth_user_id = '00000000-0000-0000-0000-000000000000',
    role_key = 'admin',
    is_active = true
where id = 'YOUR_EXISTING_STAFF_ROW_ID';
```

Allowed roles: `admin`, `manager`, `cashier`. Only an administrator should be able to manage staff rows through the app. Confirm the first administrator mapping directly in the SQL Editor before staff begin signing in. Do not create a shared/default password.

If the old demo staff rows are not real employees, leave them unlinked and inactive or remove them after verifying they are not referenced elsewhere. Existing rows with no `auth_user_id` or `role_key` cannot sign in.

## Verification checklist

- Anonymous requests to each of the six business tables are denied.
- A valid Auth user without an active staff mapping cannot enter the dashboard.
- An inactive staff member is denied.
- A cashier cannot read/write expenses unless the policy explicitly permits it, and cannot access stock/admin-only operations.
- A manager/cashier cannot change their own role or create another admin.
- A valid admin can manage staff and use the admin-only database operations.
- Gemini requests without a valid bearer token return 401; unauthorised roles return 403; more than 20 calls in an hour return 429.
- Sign out clears the Supabase Auth session and the dashboard returns to login.

## Important rollout notes

- This migration protects the six existing shared shop tables. It does **not** implement multi-store/tenant isolation.
- The existing frontend still contains demo/sample business records and local UI state. Remove demo data before using the live store; this phase does not migrate all app data handling to server actions.
- The Gemini endpoint validates identity, role, request size and a per-user hourly quota. Add infrastructure-level IP throttling/WAF limits for broader abuse protection.
- Do not consider production secured until the migration is applied, real Auth users are linked, and the verification checklist passes against the deployed Supabase project.
