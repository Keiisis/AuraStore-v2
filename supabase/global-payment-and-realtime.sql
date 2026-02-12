-- 1. Expansive Payment Registry for Elite Infrastructure
-- Incorporating: Stripe, CinetPay, PayPal, FedaPay, Kkiapay, Zeyow, Moneco, MTN, MOOV, WhatsApp

-- Add missing providers to system_payment_configs
INSERT INTO public.system_payment_configs (provider, config_data, is_active)
VALUES 
    (
        'paypal', 
        '{
            "client_id": "",
            "client_secret": "",
            "mode": "sandbox",
            "webhook_id": ""
        }'::jsonb, 
        false
    ),
    (
        'kkiapay', 
        '{
            "public_key": "",
            "private_key": "",
            "secret": "",
            "mode": "test"
        }'::jsonb, 
        false
    ),
    (
        'zeyow', 
        '{
            "api_key": "",
            "merchant_id": "",
            "app_id": ""
        }'::jsonb, 
        false
    ),
    (
        'moneco', 
        '{
            "api_key": "",
            "secret_key": ""
        }'::jsonb, 
        false
    ),
    (
        'mtn_money', 
        '{
            "api_user": "",
            "subscription_key": "",
            "target_environment": "sandbox"
        }'::jsonb, 
        false
    ),
    (
        'moov_money', 
        '{
            "client_id": "",
            "client_secret": "",
            "merchant_id": ""
        }'::jsonb, 
        false
    )
ON CONFLICT (provider) DO UPDATE 
SET config_data = EXCLUDED.config_data;

-- 2. Realtime Messaging Enablement
-- Ensure the admin_messages table is ready for Realtime presence and broadcasting
ALTER TABLE public.admin_messages REPLICA IDENTITY FULL;

-- Check if publication exists for realtime
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_messages;

-- 3. Message Status Tracking (for "Read" / "WhatsApp Style" ticks)
ALTER TABLE public.admin_messages 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read'
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
