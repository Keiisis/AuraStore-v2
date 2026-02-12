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
        const lineItems = items.map((item) => {
            // Image handling: Stripe requires valid URLs
            // If local/relative, try to make absolute or skip
            const images = item.image && item.image.startsWith("http") ? [item.image] : [];

            // Amount handling for Zero-Decimal currencies (XOF, XAF, JPY, etc.)
            // XOF is effectively zero-decimal in Stripe (1 XOF = 1 unit)
            // EUR/USD are 2-decimal (1.00 = 100 units)
            let unitAmount = Math.round(item.price);
            const zeroDecimalCurrencies = ["xof", "xaf", "jpy", "clp", "gnf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv"];

            if (!zeroDecimalCurrencies.includes(currency.toLowerCase())) {
                unitAmount = Math.round(item.price * 100);
            }

            return {
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: {
                        name: item.name,
                        images: images,
                        description: item.variant ? `Variante: ${item.variant}` : undefined,
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
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
