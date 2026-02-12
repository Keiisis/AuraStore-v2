# 🔥 AuraStore - High-Vibe E-Commerce SaaS

> The "WordPress of e-commerce" for creators who want stunning stores without the complexity.

![AuraStore](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue?style=for-the-badge&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-purple?style=for-the-badge&logo=framer)

## ✨ Features

- **🎨 Volcanic Luxe Design** - Dark mode with fiery orange gradients, glassmorphism effects
- **✨ Advanced Animations** - Particle effects, floating orbs, smooth transitions with Framer Motion
- **🏪 Multi-Tenant Architecture** - One codebase, thousands of stores via subdomains
- **🎭 Theme Engine** - Dynamic theming with "Vibes" (pre-configured themes)
- **🔐 Magic Link Auth** - Passwordless authentication via Supabase
- **📱 Mobile-First** - Responsive design optimized for all devices
- **⚡ Blazing Fast** - Next.js 14 with Server Components & Partial Prerendering
- **🤖 AI-Ready** - Architecture prepared for AI product descriptions & VTO

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### 1. Clone & Install

```bash
git clone <your-repo>
cd aurastore-next
npm install
```

### 2. Setup Supabase

Follow the detailed guide in [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md):

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:
   ```bash
   # Copy contents of supabase/schema.sql and paste in SQL Editor
   ```
3. Get your API keys from Settings > API

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DOMAIN=localhost
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   └── auth/callback/
│   ├── (dashboard)/         # Seller dashboard (protected)
│   │   └── dashboard/
│   ├── store/[slug]/        # Public storefront
│   └── page.tsx             # Landing page
│
├── components/
│   ├── ui/                  # Shadcn/ui primitives
│   ├── blocks/              # Theme Engine blocks (Hero, Grid, etc.)
│   ├── dashboard/           # Dashboard components
│   ├── storefront/          # Storefront components
│   └── effects/             # Visual effects (Particles, Orbs, Grid)
│
├── lib/
│   ├── supabase/            # Supabase client & types
│   ├── theme-engine/        # Dynamic theming system
│   ├── actions/             # Server Actions
│   └── utils.ts             # Utility functions
│
├── supabase/
│   └── schema.sql           # Database schema
│
└── docs/                    # BMAD documentation
```

## 🎨 Design System

### Volcanic Luxe Theme

```css
--primary: #FE7501;      /* Lava Orange */
--secondary: #B4160B;    /* Magma Red */
--accent: #FFE946;       /* Sulfur Yellow */
--background: #0A0A0A;   /* Deep Void */
--surface: #111111;      /* Dark Surface */
```

### Visual Effects

- **Particles** - Animated particle network with connections
- **Floating Orbs** - Gradient orbs with smooth animations
- **Glassmorphism** - Frosted glass cards with blur effects
- **Shimmer** - Subtle shimmer animations on hover
- **Glow** - Text and element glow effects

### Animations

- `animate-gradient-x` - Animated gradient background
- `animate-float` - Floating animation
- `animate-pulse-glow` - Pulsing glow effect
- `animate-shimmer` - Shimmer effect
- `animate-blob-pulse` - Blob pulse animation

## 🎭 Theme Engine

The Theme Engine is the core IP of AuraStore. It allows dynamic theming through:

### Tokens (CSS Variables)
```typescript
const tokens = {
  primary: "#FE7501",
  secondary: "#B4160B",
  accent: "#FFE946",
  // ... more tokens
};
```

### Blocks (React Components)
- `hero_v1` - Full-screen hero with animated background
- `product_grid` - Responsive product grid
- `marquee` - Animated scrolling text
- More coming soon...

### Vibes (Pre-configured Themes)
- Volcanic Luxe (default)
- Midnight Ocean
- Neon Streetwear
- Minimal Luxury
- Forest Earth

## 🔐 Authentication

AuraStore uses Supabase Auth with Magic Links:

1. User enters email
2. Receives magic link via email
3. Clicks link → authenticated
4. Profile auto-created via database trigger

## 🏪 Multi-Tenancy

Stores are accessed via subdomains:
- `mystore.aurastore.com` → Store "mystore"
- `custom-domain.com` → Custom domain support

The middleware handles routing:
```typescript
// middleware.ts
const subdomain = getSubdomain(request);
if (subdomain) {
  // Rewrite to /store/[slug]
}
```

## 📊 Database Schema

### Tables
- `profiles` - User profiles (extends auth.users)
- `stores` - Store configurations & theme settings
- `products` - Product catalog
- `orders` - Order management

### Row Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only access their own data
- Public can view active stores/products
- Strict ownership verification for mutations

## 🛠️ Development

### Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Blocks

1. Create component in `components/blocks/`
2. Register in `components/blocks/index.ts`
3. Add type to `lib/theme-engine/types.ts`

```typescript
// components/blocks/my-block.tsx
export function MyBlock({ config }: { config: BlockConfig }) {
  return <div>...</div>;
}

// components/blocks/index.ts
registerBlock("my_block", MyBlock);
```

### Adding New Effects

Create visual effects in `components/effects/`:

```typescript
// components/effects/my-effect.tsx
export function MyEffect() {
  return <div>...</div>;
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_APP_URL=https://aurastore.com
NEXT_PUBLIC_APP_DOMAIN=aurastore.com
```

## 📚 Documentation

- [PRD](docs/prd.md) - Product Requirements Document
- [Architecture](docs/architecture.md) - System Architecture
- [Supabase Setup](docs/SUPABASE_SETUP.md) - Database Configuration Guide
- [BMAD Context](bmad_context.md) - Project Vision & Context

## 🎯 Roadmap

### Phase 1: Core ✅
- [x] Project scaffold
- [x] Supabase integration
- [x] Authentication
- [x] Theme Engine
- [x] Basic blocks
- [x] Dashboard layout

### Phase 2: Features 🚧
- [ ] Product management pages
- [ ] Theme Editor UI
- [ ] Order management
- [ ] Analytics dashboard
- [ ] Custom domain support

### Phase 3: Advanced 🔮
- [ ] AI product descriptions
- [ ] Virtual Try-On (VTO)
- [ ] Stripe integration
- [ ] WhatsApp checkout
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with 🔥 by the AuraStore Team
