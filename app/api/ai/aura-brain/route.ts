import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, storeId, context = "admin", audioPrompt = false } = body;

        console.log(`[Aura Brain] Request received: message="${message}", storeId="${storeId}", context="${context}"`);

        const isSuperAdmin = context === "super-admin";

        if (!message || (!storeId && !isSuperAdmin)) {
            return NextResponse.json({ error: "Message ou StoreID manquant" }, { status: 400 });
        }

        if (!process.env.GROQ_API_KEY) {
            console.error("[Aura Brain] Missing GROQ_API_KEY");
            return NextResponse.json({ error: "Configuration IA manquante (API Key)" }, { status: 500 });
        }

        const supabase = createClient();

        // Initialize Groq client via OpenAI-compatible SDK
        const groq = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1",
        });

        // 1. DATA GATHERING (The "Arsenal")
        console.log(`[Aura Brain] Context: ${context}, StoreID: ${storeId}`);

        let store: any = null;
        let products: any[] = [];
        let recentOrders: any[] = [];
        let leads: any[] = [];
        let platformStats: any = null;

        if (isSuperAdmin) {
            // Global Platform Data for Super Admin
            const [usersCount, storesCount, allOrders] = await Promise.all([
                supabase.from("profiles").select("*", { count: 'exact', head: true }),
                supabase.from("stores").select("*", { count: 'exact', head: true }),
                supabase.from("orders").select("total")
            ]);
            platformStats = {
                users: usersCount.count || 0,
                stores: storesCount.count || 0,
                totalRevenue: allOrders.data?.reduce((acc: number, o: any) => acc + (o.total || 0), 0) || 0
            };
        } else {
            // Standard Store Data
            const [
                storeResult,
                productsResult,
                ordersResult,
                leadsResult
            ] = await Promise.all([
                supabase.from("stores").select("*").eq("id", storeId).maybeSingle(),
                supabase.from("products").select("name, price, stock, category").eq("store_id", storeId).limit(30),
                supabase.from("orders").select("total, status, created_at, customer_email").eq("store_id", storeId).order('created_at', { ascending: false }).limit(10),
                supabase.from("vto_leads").select("*").eq("store_id", storeId).limit(10)
            ]);
            store = storeResult.data;
            products = productsResult.data || [];
            recentOrders = ordersResult.data || [];
            leads = leadsResult.data || [];
        }

        const totalSales = recentOrders.reduce((acc, order) => acc + (order.total || 0), 0) || 0;
        const lowStock = products.filter(p => p.stock < 5).map(p => p.name).join(", ") || "Aucun";

        // 2. SYSTEM PROMPT SELECTION
        let systemPrompt = "";

        if (isSuperAdmin) {
            systemPrompt = `Tu es Aura Core Intelligence™, le cerveau central de la plateforme SaasAura.
            TON PROFIL: Architecte Visionnaire, Élite, Impitoyable sur la croissance.
            
            DONNÉES PLATEFORME:
            - Utilisateurs totaux: ${platformStats.users}.
            - Boutiques actives: ${platformStats.stores}.
            - Volume d'affaires total du réseau: ${platformStats.totalRevenue}€.
            
            DIRECTIVES:
            - Tu t'adresses au Créateur de la plateforme.
            - Sois stratégique, parle de scalabilité et de domination du marché.
            - STYLE: Futuriste, Minimaliste, High-Vibe.`;
        } else {
            systemPrompt = `Tu es Aura Intelligence™, l'Expert en Clôture de Ventes et Stratégie Marketing de "${store?.name || 'la boutique'}".
            TON PROFIL: Maître en PNL et "Closer" Élite. Ton langage est magnétique, direct et orienté vers le gain.
            
            ARSENAL DE DONNÉES EN TEMPS RÉEL:
            - Ventes récentes: ${totalSales}€.
            - Stocks Critiques: ${lowStock}.
            - Catalogue: ${products.length > 0 ? products.map(p => `${p.name} (${p.price}€)`).join(", ") : 'Aucun produit actif'}.
            - Leads VTO récents: ${leads.length} leads.
            
            DIRECTIVES:
            - Pour l'ADMIN (Vendeur) : Sois un général de guerre économique.
            - Pour le CLIENT : Sois un concierge influent.
            - CONCISION : Max 3 phrases percutantes.
            - STYLE : Alpha, Luxe, Élite.`;
        }

        console.log("[Aura Brain] Calling Groq API...");

        // 3. GENERATE DYNAMIC RESPONSE
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.8,
            max_tokens: 500,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "Je recalibre ma vision stratégique...";
        console.log("[Aura Brain] AI Response generated successfully.");

        return NextResponse.json({
            text: aiResponse,
            context: context
        });

    } catch (error: any) {
        console.error("Aura Brain Critical Error:", error);
        return NextResponse.json({
            error: "Erreur interne du Cerveau Aura",
            details: error.message
        }, { status: 500 });
    }
}
