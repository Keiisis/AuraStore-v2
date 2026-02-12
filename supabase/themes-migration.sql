-- Migration pour le Design System avec les 10 Identités Visuelles
DELETE FROM public.store_themes;

INSERT INTO public.store_themes (name, slug, description, image_url, colors, display_order)
VALUES 
('Streetwear Elite', 'streetwear', 'Identité sombre et brute, contrastes néons pour les marques urbaines.', 'https://images.unsplash.com/photo-1523398384497-b7330222f716', '["#0A0A0A", "#FF4D00", "#FFFFFF"]', 1),
('Techwear Future', 'techwear', 'Cyberpunk, noir profond et bleus électriques pour la tech.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f', '["#050505", "#00F0FF", "#180C2E"]', 2),
('Tradition Luxe', 'traditionnel', 'Émeraudes et dorures valorisant l''héritage et l''artisanat.', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482', '["#064e3b", "#f59e0b", "#fef3c7"]', 3),
('Sneakers Hub', 'sneakers', 'Vibrant, énergique, typographie audacieuse pour les collectionneurs.', 'https://images.unsplash.com/photo-1552346154-21d32810abb1', '["#000000", "#ef4444", "#ffffff"]', 4),
('Bijoux & Or', 'bijoux', 'Minimalisme épuré, teintes crème et reflets métalliques précieux.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338', '["#fafaf9", "#d4af37", "#1c1917"]', 5),
('Cosmétique Éclat', 'cosmetiques', 'Dégradés doux, pastels vibrants et pureté visuelle.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9', '["#fdf2f8", "#ec4899", "#831843"]', 6),
('Maroquinerie', 'sacs', 'Cuirs profonds, ambiances terreuses et élégance intemporelle.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', '["#1c1917", "#78350f", "#fef3c7"]', 7),
('Accessoires Mode', 'accessoires', 'Palette équilibrée et moderne pour les petits objets de luxe.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3', '["#0c0a09", "#8b5cf6", "#fafaf9"]', 8),
('Y2K Retro', 'y2k', 'Acid colors, chrome et esthétique futuriste des années 2000.', 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400', '["#2e1065", "#d946ef", "#00ffff"]', 9),
('Design Minimalist', 'minimalist', 'Noir et blanc absolu, focalisation sur le produit et l''espace.', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85', '["#ffffff", "#000000", "#71717a"]', 10)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    colors = EXCLUDED.colors,
    display_order = EXCLUDED.display_order;
