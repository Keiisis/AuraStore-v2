# System Architecture - AuraStore Next

## 1. Directory Structure (Feature-First)
```
/app
  /(auth)           # Routes d'authentification (login/register)
  /(dashboard)      # Espace Vendeur (privé)
    /[storeSlug]    # Contexte de la boutique active
      /products
      /settings
      /editor       # Le "Theme Customizer"
  /(storefront)     # Espace Public (client)
    /[domain]       # Middleware rewrite pour subdomains
      /page.tsx     # Rendu dynamique via Theme Engine
  /api              # Route handlers (webhooks, ai)

/components
  /ui               # Primitives (Button, Input) - Shadcn/ui
  /blocks           # "Lego" blocks pour le Theme Engine (Hero, Grid...)
  /providers        # Contexts (Theme, Auth)

/lib
  /supabase         # Client & Server utils
  /theme-engine     # Logique de rendu dynamique
  /actions          # Server Actions (Mutations)
```

## 2. The Theme Engine (Core IP)
C'est le cœoeur du produit.
- **Tokens** : CSS Variables injectées au runtime dans `<body>`.
- **Registry** : Map de composants `BlockType -> ReactComponent`.
- **Persistence** : JSON stocké dans Supabase `stores.theme_config`.

## 3. Database Schema (Supabase PostgreSQL)

```sql
-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  created_at timestamptz default now()
);

-- STORES (Les boutiques)
create table stores (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null, -- 'nba-store' -> nba-store.aurastore.com
  custom_domain text unique, -- 'monstore.com'
  
  -- THEME CONFIG (Le "State" visuel)
  theme_config jsonb default '{
    "tokens": { "primary": "#FE7501", "font": "Sora", "radius": "16px" },
    "layout_home": [
      { "id": "1", "type": "hero_v1", "props": { "title": "Welcome" } },
      { "id": "2", "type": "product_grid", "props": { "limit": 4 } }
    ]
  }'::jsonb,
  
  created_at timestamptz default now()
);

-- PRODUCTS
create table products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  price decimal(10,2) not null,
  images text[], -- Array d'URLs
  vto_enabled boolean default false,
  stock int default 0,
  created_at timestamptz default now()
);

-- RLS POLICIES (Security)
alter table stores enable row level security;
-- Policy: Owners can update their own store. Public can Select.
```

## 4. Middleware logic
1. Intercepte la requête `x.aurastore.com`
2. Extrait `x` (subdomain)
3. Rewrite URL vers `/app/(storefront)/[x]/...`
4. Injecte `x` comme header pour Supabase SSR.
