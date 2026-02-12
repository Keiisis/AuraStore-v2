-- ============================================================
-- AURASTORE SECURITY HARDENING -- "KAGE LEVEL PROTECTION"
-- ============================================================

-- 1. PROTECT THE 'ROLE' COLUMN (Privilege Escalation Prevention)
-- Create a function that prevents users from unauthorized role changes
CREATE OR REPLACE FUNCTION public.check_role_update()
RETURNS TRIGGER AS $$
DECLARE
    current_role text;
BEGIN
    -- Get the role of the user attempting the change
    SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();

    -- If the NEW role is 'admin' AND the updater is NOT an admin AND not service role
    IF NEW.role = 'admin' AND OLD.role != 'admin' 
       AND current_role != 'admin' 
       AND auth.role() != 'service_role' THEN
        RAISE EXCEPTION 'UNAUTHORIZED: You cannot promote yourself to Admin.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS protect_role_change ON public.profiles;
CREATE TRIGGER protect_role_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_role_update();


-- 2. ENSURE RLS IS ACTIVE ON ALL CRITICAL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;


-- 3. SECURE PROFILES TYPE (Add role if missing)
-- This ensures the column exists for our logic above
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN 
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'customer';
    END IF;
END $$;


-- 4. HARDENED PAYMENT CONFIG (Prevent tampering)
-- Ensure system payment configs are read-only for normal users if RLS exists
ALTER TABLE IF EXISTS public.system_payment_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage payment configs" ON public.system_payment_configs;
CREATE POLICY "Admins can manage payment configs" 
    ON public.system_payment_configs
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone can read active payment configs" ON public.system_payment_configs;
CREATE POLICY "Anyone can read active payment configs" 
    ON public.system_payment_configs
    FOR SELECT TO authenticated
    USING (is_active = true);

