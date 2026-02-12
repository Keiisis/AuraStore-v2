-- AuraStore - Payment System Synchronization Script
-- Run this in your Supabase SQL Editor to support the new gateways

-- 1. Update Payment Method Enum
-- NOTE: PostgreSQL doesn't allow adding values to ENUM inside a transaction easily
-- Better to use ALTER TYPE ... ADD VALUE if it exists, or just recreate.
-- Re-creating for safety.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_v2') THEN
        CREATE TYPE payment_method_v2 AS ENUM (
            'whatsapp', 'stripe', 'cash', 'paypal', 
            'flutterwave', 'fedapay', 'kkiapay', 
            'cinetpay', 'zeyow', 'moneco', 
            'mtn_money', 'moov_money'
        );
    END IF;
END
$$;

-- 2. Add Provider Reference Column to Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_meta JSONB;

-- 3. Update existing orders to use the new type (Migration)
-- This is complex if data already exists, but for a dev/new site:
-- ALTER TABLE orders ALTER COLUMN payment_method TYPE payment_method_v2 USING payment_method::text::payment_method_v2;

-- 4. Improve Search Performance
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON orders(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);

-- 5. Add Trigger for Updated At on Orders
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
