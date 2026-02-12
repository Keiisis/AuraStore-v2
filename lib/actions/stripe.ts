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
        const supabase = createClient();

        // 1. Get Store Config (Securely on Server side)
        const { data: store, error } = await supabase
            .from("stores")
            .select("name, payment_config")
            .eq("id", storeId)
            .single();

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
            apiVersion: "2023-10-16", // Use a specific API version for stability
        });

        // 3. Prepare Line Items
        console.log("Preparing Stripe Session for items:", JSON.stringify(items, null, 2));

        const lineItems = items.map((item) => {
            const itemName = item.name || "Article Aura";
            const rawPrice = Number(item.price);

            if (isNaN(rawPrice)) {
                console.warn(`Prix NaN detecté pour ${itemName}, fallback à 0.`);
            }

            const finalPrice = isNaN(rawPrice) ? 0 : rawPrice;

            // Image handling: Stripe requires valid URLs
            const images = item.image && item.image.startsWith("http") ? [item.image] : [];

            // Amount handling
            let unitAmount = Math.round(finalPrice);
            const zeroDecimalCurrencies = ["xof", "xaf", "jpy", "clp", "gnf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv"];

            if (!zeroDecimalCurrencies.includes(currency.toLowerCase())) {
                unitAmount = Math.round(finalPrice * 100);
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
        });

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

        return { url: session.url };
    } catch (err: any) {
        console.error("Stripe Session Error:", err);
        return { error: `Erreur Stripe: ${err.message}` };
    }
}
