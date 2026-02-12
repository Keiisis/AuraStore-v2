-- ============================================================
-- FRONTEND CONFIGURATION TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.frontend_config (
    id integer PRIMARY KEY DEFAULT 1,
    
    -- Hero Section
    hero_title text DEFAULT 'La Plateforme E-commerce Ultime pour l''Afrique',
    hero_subtitle text DEFAULT 'Créez votre boutique en ligne en 30 secondes. Intelligence Artificielle intégrée. Paiements locaux.',
    hero_cta_primary text DEFAULT 'Commencer Gratuitement',
    hero_cta_secondary text DEFAULT 'Voir Démo',
    
    -- Brand & Global
    brand_name text DEFAULT 'AuraStore',
    logo_url text,
    primary_color text DEFAULT '#00ff9d',
    
    -- NEW: Gradient Brand
    brand_color_start text DEFAULT '#00ff9d',
    brand_color_end text DEFAULT '#ffffff',
    
    -- Sections Visibility
    show_hero boolean DEFAULT true,
    show_features boolean DEFAULT true,
    show_themes boolean DEFAULT true,
    show_steps boolean DEFAULT true,
    show_pricing boolean DEFAULT true,
    show_footer boolean DEFAULT true,
    
    -- Stats
    show_live_stats boolean DEFAULT true,
    
    -- SEO Metadata
    seo_title text DEFAULT 'AuraStore - E-commerce AI',
    seo_description text DEFAULT 'Plateforme e-commerce nouvelle génération.',
    
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT singleton_row CHECK (id = 1)
);

-- UPDATE EXISTING TABLE IF EXISTS (MIGRATION)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='frontend_config' AND column_name='brand_color_start') THEN
        ALTER TABLE public.frontend_config ADD COLUMN brand_color_start text DEFAULT '#00ff9d';
        ALTER TABLE public.frontend_config ADD COLUMN brand_color_end text DEFAULT '#ffffff';
    END IF;
END $$;

-- RLS
ALTER TABLE public.frontend_config ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public view frontend config" ON public.frontend_config;
CREATE POLICY "Public view frontend config" ON public.frontend_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update frontend config" ON public.frontend_config;
CREATE POLICY "Admin update frontend config" ON public.frontend_config 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Initial Seed
INSERT INTO public.frontend_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
