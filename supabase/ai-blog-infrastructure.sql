-- AuraStore AI & Blog Infrastructure Migration
-- This script ensures the AI powerhouse and Plume IA columns are correctly set up.

-- 1. AI Configuration Stability
CREATE TABLE IF NOT EXISTS public.ai_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'fal',
    fal_key TEXT,
    replicate_key TEXT,
    groq_key TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure columns exist if table was already there
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_config' AND column_name='groq_key') THEN
        ALTER TABLE public.ai_config ADD COLUMN groq_key TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_config' AND column_name='is_active') THEN
        ALTER TABLE public.ai_config ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Enable RLS for ai_config
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

-- Simple Policy: Admins can do anything, others nothing
CREATE POLICY "Admins can manage AI config" 
ON public.ai_config 
FOR ALL 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
));

-- 2. Blog Logic
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    image_url TEXT,
    author TEXT DEFAULT 'Aura Intelligence',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for blogs
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Read policy for everyone (public)
CREATE POLICY "Public can read blogs" 
ON public.blogs 
FOR SELECT 
TO public 
USING (is_published = true);

-- Manage policy for admins
CREATE POLICY "Admins can manage blogs" 
ON public.blogs 
FOR ALL 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
));
