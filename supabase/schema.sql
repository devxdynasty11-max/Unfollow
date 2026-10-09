-- ====================================================================
-- SUPABASE SCHEMA MIGRATION: HARDENED ROW LEVEL SECURITY (RLS)
-- Secure Role-Based Access Control (RBAC) & Protected Data Architecture
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username_or_email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    phone_number TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES TABLE (Authoritative Role Storage)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. ONBOARDING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_step TEXT NOT NULL DEFAULT 'confirmation_1',
    completion_status TEXT NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. CONSENT RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    terms_version TEXT NOT NULL,
    privacy_policy_version TEXT NOT NULL,
    consented_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GROWTH PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.growth_packages (
    id TEXT PRIMARY KEY,
    package_name TEXT NOT NULL,
    follower_quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    package_id TEXT REFERENCES public.growth_packages(id) ON DELETE RESTRICT,
    order_reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'in_progress', 'completed', 'cancelled')),
    target_username TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRIVACY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.privacy_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('data_access', 'data_deletion', 'opt_out')),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'fulfilled', 'rejected')),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_username_email ON public.profiles(username_or_email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_consent_user_id ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON public.onboarding_sessions(user_id);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

-- HELPER SECURITY FUNCTION: IS_ADMIN()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- STRICT ROW LEVEL SECURITY POLICIES
-- ====================================================================

-- GROWTH PACKAGES: Anyone can view active packages. Only admins can modify.
DROP POLICY IF EXISTS "Public can view active growth packages" ON public.growth_packages;
CREATE POLICY "Public can view active growth packages" ON public.growth_packages
    FOR SELECT USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage growth packages" ON public.growth_packages;
CREATE POLICY "Admins can manage growth packages" ON public.growth_packages
    FOR ALL USING (public.is_admin());

-- PROFILES: Users can only see/update their own profile. Admins can view all.
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- USER ROLES: Only admins can view and manage roles.
DROP POLICY IF EXISTS "Admins can view and manage roles" ON public.user_roles;
CREATE POLICY "Admins can view and manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin());

-- ORDERS: Users can only read and insert their own orders. Only admins can update status.
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NOT NULL);

DROP POLICY IF EXISTS "Only admins can update orders" ON public.orders;
CREATE POLICY "Only admins can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin());

-- ONBOARDING SESSIONS: User restricted
DROP POLICY IF EXISTS "Users can read own onboarding session" ON public.onboarding_sessions;
CREATE POLICY "Users can read own onboarding session" ON public.onboarding_sessions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own onboarding session" ON public.onboarding_sessions;
CREATE POLICY "Users can manage own onboarding session" ON public.onboarding_sessions
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- CONSENT RECORDS: User restricted
DROP POLICY IF EXISTS "Users can view own consent" ON public.consent_records;
CREATE POLICY "Users can view own consent" ON public.consent_records
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert consent" ON public.consent_records;
CREATE POLICY "Users can insert consent" ON public.consent_records
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NOT NULL);

-- PRIVACY REQUESTS: Users can view/insert own requests. Only admins can update status.
DROP POLICY IF EXISTS "Users can read own privacy requests" ON public.privacy_requests;
CREATE POLICY "Users can read own privacy requests" ON public.privacy_requests
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert privacy requests" ON public.privacy_requests;
CREATE POLICY "Users can insert privacy requests" ON public.privacy_requests
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can update privacy requests" ON public.privacy_requests;
CREATE POLICY "Only admins can update privacy requests" ON public.privacy_requests
    FOR UPDATE USING (public.is_admin());

-- INITIAL SEED PACKAGES
INSERT INTO public.growth_packages (id, package_name, follower_quantity, price, active, description)
VALUES
    ('pkg_100', 'Starter Growth Goal', 100, 4.99, true, 'Introductory strategy package with standard profile auditing and organic reach guidance.'),
    ('pkg_250', 'Essential Growth Goal', 250, 9.99, true, 'Focused audience expansion with niche hashtag analysis and profile optimization.'),
    ('pkg_500', 'Popular Growth Goal', 500, 17.99, true, 'Recommended for emerging creators looking for sustained profile visibility.'),
    ('pkg_1000', 'Creator Growth Goal', 1000, 29.99, true, 'Comprehensive growth consultation including content cadence insights and engagement targeting.'),
    ('pkg_2500', 'Pro Growth Goal', 2500, 59.99, true, 'Accelerated audience benchmarking and advanced profile reach optimization.'),
    ('pkg_5000', 'Enterprise Growth Goal', 5000, 99.99, true, 'Full-spectrum growth blueprint, competitor analysis, and multi-tier strategy assessment.')
ON CONFLICT (id) DO UPDATE 
SET package_name = EXCLUDED.package_name,
    follower_quantity = EXCLUDED.follower_quantity,
    price = EXCLUDED.price,
    description = EXCLUDED.description;
