-- AuraStore Infrastructure: Master Payment Gateways
-- Run this in Supabase SQL Editor

-- 1. Create the system_payment_configs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_payment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL UNIQUE, -- 'stripe', 'fedapay', 'cinetpay', 'whatsapp'
    config_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.system_payment_configs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Admin only)
DROP POLICY IF EXISTS "Admin manages system payments" ON public.system_payment_configs;
CREATE POLICY "Admin manages system payments" ON public.system_payment_configs
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Seed Default Gateways (Master Level)
-- Use ON CONFLICT to avoid duplicates if re-run
INSERT INTO public.system_payment_configs (provider, config_data, is_active)
VALUES 
    (
        'stripe', 
        '{
            "publishable_key": "",
            "secret_key": "",
            "webhook_secret": "",
            "mode": "test"
        }'::jsonb, 
        true
    ),
    (
        'fedapay', 
        '{
            "public_key": "",
            "secret_key": "",
            "environment": "sandbox"
        }'::jsonb, 
        true
    ),
    (
        'cinetpay', 
        '{
            "site_id": "",
            "api_key": ""
        }'::jsonb, 
        true
    ),
    (
        'whatsapp', 
        '{
            "phone_number": "",
            "display_name": "Aura Support"
        }'::jsonb, 
        true
    )
ON CONFLICT (provider) DO NOTHING;

-- 5. Notify for schema reload
NOTIFY pgrst, 'reload schema';
