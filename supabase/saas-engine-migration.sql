-- ============================================================
-- AURASTORE SaaS ENGINE — Complete Migration
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    price numeric NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'XOF',
    billing_cycle text NOT NULL DEFAULT 'monthly',
    is_custom_price boolean NOT NULL DEFAULT false,
    max_stores integer NOT NULL DEFAULT 1,
    max_products_per_store integer NOT NULL DEFAULT 50,
    max_photos_sync integer NOT NULL DEFAULT 10,
    has_analytics boolean NOT NULL DEFAULT false,
    has_seo_ai boolean NOT NULL DEFAULT false,
    has_viral_hub boolean NOT NULL DEFAULT false,
    has_vto_3d boolean NOT NULL DEFAULT false,
    has_api_access boolean NOT NULL DEFAULT false,
    has_custom_domain boolean NOT NULL DEFAULT false,
    has_multi_admin boolean NOT NULL DEFAULT false,
    has_dedicated_manager boolean NOT NULL DEFAULT false,
    whatsapp_sales boolean NOT NULL DEFAULT true,
    support_level text NOT NULL DEFAULT 'email',
    icon_name text DEFAULT 'Zap',
    accent_color text DEFAULT 'white',
    is_popular boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    features_list jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. SUBSCRIPTION STATUS ENUM
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'trial', 'past_due', 'cancelled', 'expired');
    END IF;
END $$;

-- 3. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
    status subscription_status NOT NULL DEFAULT 'trial',
    payment_method text,
    payment_reference text,
    started_at timestamp with time zone DEFAULT now(),
    current_period_start timestamp with time zone DEFAULT now(),
    current_period_end timestamp with time zone DEFAULT (now() + interval '30 days'),
    trial_ends_at timestamp with time zone DEFAULT (now() + interval '14 days'),
    cancelled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- 4. PAYMENT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.payment_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    plan_id uuid REFERENCES public.subscription_plans(id),
    amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'XOF',
    payment_method text NOT NULL,
    payment_reference text,
    status text NOT NULL DEFAULT 'pending',
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. ENABLE RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES
-- Plans: everyone can read
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manages plans" ON public.subscription_plans;
CREATE POLICY "Admin manages plans" ON public.subscription_plans
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Subscriptions
DROP POLICY IF EXISTS "Users view own subscription" ON public.subscriptions;
CREATE POLICY "Users view own subscription" ON public.subscriptions
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "System manages subscriptions" ON public.subscriptions;
CREATE POLICY "System manages subscriptions" ON public.subscriptions
FOR ALL TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Payment History
DROP POLICY IF EXISTS "Users view own payments" ON public.payment_history;
CREATE POLICY "Users view own payments" ON public.payment_history
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "System inserts payments" ON public.payment_history;
CREATE POLICY "System inserts payments" ON public.payment_history
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. SEED DEFAULT PLANS
INSERT INTO public.subscription_plans 
    (name, slug, description, price, is_custom_price, max_stores, max_products_per_store, max_photos_sync, has_analytics, has_seo_ai, has_viral_hub, has_vto_3d, has_api_access, has_custom_domain, has_multi_admin, has_dedicated_manager, support_level, icon_name, accent_color, is_popular, display_order, features_list)
VALUES
    (
        'Starter', 'starter', 'Pour tester l''impact IA',
        9900, false, 1, 50, 10,
        false, false, false, false, false, false, false, false,
        'email', 'Zap', 'white', false, 1,
        '["1 boutique active", "Aura Sync (10 photos/mois)", "Ventes WhatsApp illimitées", "Support email"]'::jsonb
    ),
    (
        'Pro', 'pro', 'L''outil des boutiques d''élite',
        24900, false, 3, 200, -1,
        true, true, true, false, false, true, false, false,
        'priority', 'Target', 'primary', true, 2,
        '["3 boutiques actives", "Aura Sync illimité", "Viral Content Hub", "Analytics Premium", "SEO Opti IA"]'::jsonb
    ),
    (
        'Empire', 'empire', 'Solutions sur mesure',
        0, true, -1, -1, -1,
        true, true, true, true, true, true, true, true,
        'dedicated', 'Crown', 'accent', false, 3,
        '["Boutiques illimitées", "API Custom", "Virtual Try-On 3D", "Account Manager dédié", "Multi-comptes Admin"]'::jsonb
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    features_list = EXCLUDED.features_list,
    updated_at = now();

-- Done! ✅
