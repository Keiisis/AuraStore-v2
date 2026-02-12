-- ============================================================
-- REPAIR MIGRATION: Fix Orphan Users & Strengthen Trigger
-- ============================================================

-- 1. Fix specific reported orphan user
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    '05b49cec-dcf2-4161-9868-5939939b3d3c',
    'nayrichard.so.n.83.0@gmail.com',
    'Vendeur AuraStore',
    'seller'
)
ON CONFLICT (id) DO UPDATE
SET role = 'seller';

-- 2. Generic Fix: Sync all existing auth users missing from profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Utilisateur'), 
    'seller' -- Default to seller for recovery
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;

-- 3. Strengthen Trigger Logic (Robustness)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nouveau Vendeur'),
        'seller' -- Default role explicitly set
    )
    ON CONFLICT (id) DO NOTHING; -- Idempotency check
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger to be sure
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
