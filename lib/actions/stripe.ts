"use server";

import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function createStripeCheckoutSession({
    storeId,
    items,
    currency = "xof",
    customerEmail,
    successUrl,
    cancelUrl,
}: {
    storeId: string;
    items: any[];
    currency?: string;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
}) {
    try {
        // Initialize Admin client immediately for secure server-side ops
        const { createClient: createAdminClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        // 1. Get Store Config
        const { data: store, error } = await supabaseAdmin
            .from("stores")
            .select("name, payment_config")
            .eq("id", storeId)
            .maybeSingle();

        if (error || !store) {
            console.error("Store not found:", error);
            return { error: "Boutique introuvable." };
        }

        const config = store.payment_config as any;
        const secretKey = config?.stripe_secret_key;

        if (!secretKey) {
            return { error: "Le vendeur n'a pas configuré sa clé Stripe (Secret Key manquante)." };
        }

        // 2. Initialize Stripe with VENDOR'S Secret Key
        const stripe = new Stripe(secretKey, {
            apiVersion: "2023-10-16",
        });

        // 3. SECURE PRICE VERIFICATION (Anti-Tampering)
        const productIds = items.map(item => item.id).filter(id => id);

        const { data: dbProducts } = await supabaseAdmin
            .from("products")
            .select("id, price, name")
            .in("id", productIds)
            .eq("store_id", storeId);

        const dbProductMap = new Map(dbProducts?.map(p => [p.id, p]) || []);

        const lineItems = items.map((item) => {
            // TRUSTED SOURCE: Get price from DB, fallback to 0 if not found (security safety)
            const dbProduct = dbProductMap.get(item.id);
            if (!dbProduct) {
                console.warn(`SECURITY ALERT: Product ${item.id} not found in DB or store mismatch. Skipping.`);
                return null;
            }

            const itemName = dbProduct.name || item.name || "Article Aura";
            const trustedPrice = Number(dbProduct.price); // Use DB price, ignore client price

            // Image handling: Stripe requires valid URLs
            const images = item.image && item.image.startsWith("http") ? [item.image] : [];

            // Amount handling
            let unitAmount = Math.round(trustedPrice);
            const zeroDecimalCurrencies = ["xof", "xaf", "jpy", "clp", "gnf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv"];

            if (!zeroDecimalCurrencies.includes(currency.toLowerCase())) {
                unitAmount = Math.round(trustedPrice * 100);
            }

            return {
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: {
                        name: itemName,
                        images: images,
                        description: item.variant ? `Variante: ${item.variant}` : undefined,
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity || 1,
            };
        }).filter(item => item !== null); // Filter out hacked/invalid items

        if (lineItems.length === 0) {
            return { error: "Erreur de sécurité: Aucun produit valide identifié." };
        }

        // 4. Create Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
            customer_email: customerEmail,
            metadata: {
                store_id: storeId,
                store_name: store.name,
            },
        });

        return {
            url: session.url,
            sessionId: session.id
        };
    } catch (err: any) {
        console.error("Stripe Session Error:", err);
        return { error: `Erreur Stripe: ${err.message}` };
    }
}
