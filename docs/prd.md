# PRD - AuraStore SaaS Platform

## 1. Vision
Créer le "WordPress du e-commerce High-Vibe". Une plateforme SaaS qui permet à n'importe quel créateur de lancer une boutique au design **Volcanic Luxe** (Dark mode, Néon, Glassmorphism) en moins de 60 secondes.
Contrairement à Shopify qui est "neutre", AuraStore a une opinion esthétique forte : **L'Aura avant tout.**

## 2. Architecture du Produit (Le "Digital Asset")
Pour être vendu comme produit digital, le code doit être :
1.  **Multi-Tenant Native** : Une seule instance Next.js sert 1000 boutiques via Middleware (`store.aurastore.com` -> `db query(slug=store)`).
2.  **Theme Engine (The "Wordpress" Part)** :
    -   Les pages ne sont pas hardcodées.
    -   La structure des pages (Home, Product) est stockée en JSON dans la DB (`page_layouts`).
    -   Le Frontend est un "Renderer" de composants React (Hero, Grid, Marquee) mappés sur ce JSON.
3.  **Clean Code** : Architecture Hexagonale ou Feature-based folders.

## 3. User Personas
-   **Le Vendeur (Seller)** : Veut du "Wow" sans effort. Ne sait pas coder. Veut que ça marche sur WhatsApp.
-   **L'Admin (Owner)** : Gère les abonnements, voit les stats globales.
-   **Le Client (Shopper)** : Expérience fluide, mobile-first, VTO (Virtual Try-On).

## 4. Fonctionnalités Clés (Epics)

### Epic 1 : Onboarding & "Vibe check"
-   Sing-up email magic link (Supabase).
-   "Choose your Vibe" : Sélection parmi 10 presets (Streetwear, Luxury, etc.) qui injectent des tokens CSS variables.
-   Génération automatique du sous-domaine.

### Epic 2 : Le "Cockpit" (Dashboard)
-   Interface style "Minority Report". Rapide, sombre, données en temps réel.
-   **Vibe Editor** : Panneau latéral pour changer les couleurs/fonts en temps réel (Preview immédiate).
-   **AI Product** : Upload photo -> Llama 3 génère description + tags.

### Epic 3 : Le Storefront (Public)
-   Performance extrême (Next.js SSR + Partial Prerendering).
-   Navigation fluide (View Transitions API).
-   Checkout flottant (Panier latéral) -> Redirection WhatsApp ou Stripe.

### Epic 4 : Virtual Try-On (VTO)
-   Module IA isolé.
-   Upload photo utilisateur -> Overlay vêtement.

## 5. Spécifications Techniques (Stack Vercel/Supabase)

### Base de Données (Supabase)
-   **Tables** : `profiles`, `stores`, `products`, `orders`, `theme_config`.
-   **RLS (Row Level Security)** : CRITIQUE. Un vendeur ne doit JAMAIS voir les données d'un autre.
    -   `create policy "View own store" on products using (store_id = current_store_id());`

### Frontend (Next.js 14+)
-   **App Router**
-   **Server Actions** pour toutes les mutations (plus d'API externe complexe).
-   **Zod** pour validation.
-   **Tailwind** avec `tailwindcss-animate` et variables CSS dynamiques pour le theming.

### UI/UX Guidelines (Pro Max)
-   **Palette** : Volcanic (#FE7501, #0A0A0A).
-   **Interactions** : Tout doit avoir un feedback (hover, click, load).
-   **Typography** : Sora (Titres) + DM Sans (Corps).

## 6. Roadmap Implementation (BMAD)
1.  **Setup** : Scaffold Next.js + Supabase types.
2.  **Core** : Auth + Multi-tenancy Middleware.
3.  **Themes** : Création du "Theme Engine" (Context + CSS Variables).
4.  **Dashboard** : CRUD Produits + Settings.
5.  **Storefront** : Rendu dynamique des boutiques.
