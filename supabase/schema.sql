-- ==============================================================================
-- KISTIBOI - SUPABASE DATABASE SCHEMA
-- Project ID: hlbabxaenpuzipsdttbn
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/hlbabxaenpuzipsdttbn/sql/new
-- ==============================================================================

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Installment',
    primary_mobile TEXT,
    second_mobile TEXT,
    workplace TEXT,
    work_address TEXT,
    address TEXT,
    family_member_name TEXT,
    family_member_mobile TEXT,
    landlord_name TEXT,
    landlord_mobile TEXT,
    guarantors JSONB DEFAULT '[]'::jsonb,
    has_nid BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Active',
    avatar_bg TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INSTALLMENT SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.installment_schedules (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    product_name TEXT,
    installment_no INTEGER DEFAULT 1,
    total_installments INTEGER DEFAULT 12,
    due_date TEXT,
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'upcoming',
    last_payment_date TEXT,
    last_payment_amount NUMERIC,
    paid_date TEXT,
    paid_amount NUMERIC,
    collector_name TEXT,
    avatar_bg TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    down_payment NUMERIC DEFAULT 0,
    remaining_due NUMERIC DEFAULT 0,
    customer_or_dealer TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    amount NUMERIC DEFAULT 0,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STOCK PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    purchase_price NUMERIC DEFAULT 0,
    set_selling_price BOOLEAN DEFAULT false,
    selling_price NUMERIC DEFAULT 0,
    dealer_name TEXT,
    quantity INTEGER DEFAULT 0,
    for_retail_sale BOOLEAN DEFAULT true,
    movements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    shop_name TEXT DEFAULT 'KistiBoi Store',
    role TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & ALLOW ANON ACCESS (FOR ANON / PUBLISHABLE KEY)
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for application operations using publishable/anon key
DROP POLICY IF EXISTS "Public full access on customers" ON public.customers;
CREATE POLICY "Public full access on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on installment_schedules" ON public.installment_schedules;
CREATE POLICY "Public full access on installment_schedules" ON public.installment_schedules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on transactions" ON public.transactions;
CREATE POLICY "Public full access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on expenses" ON public.expenses;
CREATE POLICY "Public full access on expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on stock_products" ON public.stock_products;
CREATE POLICY "Public full access on stock_products" ON public.stock_products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on user_accounts" ON public.user_accounts;
CREATE POLICY "Public full access on user_accounts" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);

-- Indexes for lightning fast queries and filtering
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON public.customers(primary_mobile);
CREATE INDEX IF NOT EXISTS idx_installments_due ON public.installment_schedules(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_customer ON public.installment_schedules(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
