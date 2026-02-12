# AuraStore SaaS - BMAD Project Context & Handover

## 1. Project Vision
**Product Name:** AuraStore (SaaS Platform)
**Goal:** Build a "WordPress-like" specialized e-commerce builder that allows users (Sellers) to create stunning, high-vibe online stores in seconds.
**Unique Selling Point:**
- **"Volcanic Luxe" Aesthetic:** Distinctive dark mode, neon gradients (Orange/Red/Yellow), glassmorphism.
- **AI-First:** Native integration for product descriptions and VTO (Virtual Try-On).
- **Simplicity:** No drag-and-drop hell; themes are "Vibes" that are instantly applied.

## 2. The "Pre-History" (Failure Analysis)
We previously attempted this on a **PHP Vanilla + InfinityFree** stack.
**Why it failed (Pain Points to Avoid):**
- **Infrastructure Hell:** Connection timeouts, FTP manual uploads, lost files.
- **Database Friction:** Manual SQL migrations, connection string hell (`root` vs `if0_...`).
- **Dev Experience:** No component reusability, massive CSS files found difficult to maintain.
- **Result:** We spent 90% of time debugging connections and 10% on features.

## 3. The New Stack (Non-Negotiable)
- **Framework:** Next.js 14+ (App Router, Server Components).
- **Database/Auth:** Supabase (PostgreSQL).
- **Styling:** Tailwind CSS + Framer Motion (for the "Wow" factor).
- **Deployment:** Vercel (CD/CI automated).
- **State Management:** Zustand (simple, effective).

## 4. Design & UX Requirements (UI/UX Pro Max)
- **Visual Identity:** Must replicate the "Volcanic Luxe" look *pixel-perfectly*.
    - **Primary:** #FE7501 (Lava Orange)
    - **Secondary:** #0A0A0A (Deep Void)
    - **Effect:** Subtly moving gradients, "Liquid" UI elements.
- **Dashboard:** Must feel like a cockpit. Fast, reactive, instant saves.
- **Storefronts:** Must be insanely fast (Lighthouse 100).

## 5. Architectural Requirements (The "Digital Product" Standard)
This codebase itself is a product. It needs to be clean enough to be sold as a white-label solution.
- **Modular Themes:** The theme engine must be separate from core logic.
- **Multi-Tenancy:** One codebase, thousands of stores (subdomain based: `store.aurastore.com` or `custom-domain.com`).
- **Configuration-First:** Like WordPress `wp-config`, platform settings should be centralized.

## 6. Immediate Mission for BMAD
1.  **Orchestrator:** Initialize the project structure.
2.  **System Architect:** Define the Supabase Schema (Users, Stores, Products, Settings).
3.  **UI/UX Designer:** Re-create the key "Vibe" tokens in Tailwind config.
4.  **Developer:** Scaffold the Next.js App using `create-next-app`.

**Let's build the Ferrari of e-commerce builders, not another Corolla.**
