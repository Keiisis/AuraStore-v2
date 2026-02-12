-- AuraStore Infrastructure: Users & Elite Messaging
-- To be run in Supabase SQL Editor

-- 1. Profiles Enhancement
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'customer';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='plan_id') THEN
        ALTER TABLE public.profiles ADD COLUMN plan_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_suspended') THEN
        ALTER TABLE public.profiles ADD COLUMN is_suspended BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Admin <-> Seller Messaging
CREATE TABLE IF NOT EXISTS public.admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Security & RLS
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages Exchange Policy" ON public.admin_messages;
CREATE POLICY "Messages Exchange Policy" ON public.admin_messages
    FOR ALL
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = sender_id);

-- 4. Registry for Global Messaging Visibility (Optional but recommended for Admin)
-- Admin can see ALL messages
DROP POLICY IF EXISTS "Admin Universal Access" ON public.admin_messages;
-- Note: Admin role check should be robust
-- CREATE POLICY "Admin Universal Access" ON public.admin_messages
--    FOR SELECT USING (
--        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
--    );

-- 5. Trigger for Realtime (Ensure tables are included in replication)
ALTER TABLE public.admin_messages REPLICA IDENTITY FULL;

-- Notify for schema reload
NOTIFY pgrst, 'reload schema';
