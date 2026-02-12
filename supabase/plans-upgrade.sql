-- MIGRATION: Ajout des fonctionnalités avancées et quotas aux plans
DO $$ 
BEGIN 
    -- 1. Ajout des Booleans (Features Flags)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_plans' AND column_name='has_marketing_hub') THEN
        ALTER TABLE public.subscription_plans ADD COLUMN has_marketing_hub boolean DEFAULT false;
        ALTER TABLE public.subscription_plans ADD COLUMN has_remove_branding boolean DEFAULT false;
        ALTER TABLE public.subscription_plans ADD COLUMN has_priority_support boolean DEFAULT false;
        ALTER TABLE public.subscription_plans ADD COLUMN has_custom_themes boolean DEFAULT false;
        ALTER TABLE public.subscription_plans ADD COLUMN has_multi_admin boolean DEFAULT false;
    END IF;

    -- 2. Ajout des Quotas (Limites)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_plans' AND column_name='max_ai_generations') THEN
        ALTER TABLE public.subscription_plans ADD COLUMN max_ai_generations integer DEFAULT 10;
        ALTER TABLE public.subscription_plans ADD COLUMN max_vto_requests integer DEFAULT 0;
    END IF;

    -- 3. Ajout des Finances
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_plans' AND column_name='commission_rate') THEN
        ALTER TABLE public.subscription_plans ADD COLUMN commission_rate numeric(5,2) DEFAULT 0.00;
        ALTER TABLE public.subscription_plans ADD COLUMN transaction_fee integer DEFAULT 0;
    END IF;
END $$;
