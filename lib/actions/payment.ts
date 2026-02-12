"use server";

import { createClient } from "@/lib/supabase/server";
import { PaymentIntent, PaymentMethod, PaymentResult } from "@/lib/gateways/definitions";
import { createFedaPayTransaction } from "@/lib/gateways/fedapay-gateway";
import { verifyKkkTransaction } from "@/lib/gateways/kkiapay-verify"; // Imported later (mock for now or I create file next)
import { createOrder } from "@/lib/actions/order"; // Reuse existing order creation logic
import { revalidatePath } from "next/cache";

// Environment variables are fetched DYNAMICALLY from store config
async function getStorePaymentConfig(storeId: string) {
    const supabase = createClient();
    const { data: store } = await supabase
        .from("stores")
        .select("payment_config")
        .eq("id", storeId)
        .single();

    return (store?.payment_config as any) || {};
}

// 1. Create a Payment Intent (Called BEFORE user pays)
export async function createPaymentIntent(
    method: PaymentMethod,
    storeId: string,
    items: any[],
    totalAmount: number,
    customer: { name: string; email: string; phone?: string; address?: string },
    currency: string = "XOF" // African default
): Promise<{ success: boolean; data?: PaymentResult; error?: string }> {

    const config = await getStorePaymentConfig(storeId);

    // Construct the intent object
    const intent: PaymentIntent = {
        amount: totalAmount,
        currency,
        description: `Commande ${storeId.slice(0, 8)} - ${items.length} articles`,
        email: customer.email,
        phone: customer.phone,
        name: customer.name,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/cart`,
        storeId
    };

    try {
        switch (method) {
            case 'fedapay':
                if (!config.fedapay_secret_key) return { success: false, error: "FedaPay non configuré sur cette boutique" };

                const fedaResult = await createFedaPayTransaction(intent, {
                    secretKey: config.fedapay_secret_key,
                    publicKey: config.fedapay_public_key,
                    env: config.fedapay_env || 'sandbox'
                });
                return { success: true, data: fedaResult };

            case 'cinetpay':
                if (!config.cinetpay_api_key || !config.cinetpay_site_id) {
                    return { success: false, error: "CinetPay non configuré" };
                }
                const { createCinetPayTransaction } = await import("@/lib/gateways/cinetpay-gateway");
                const cinetResult = await createCinetPayTransaction(intent, {
                    apiKey: config.cinetpay_api_key,
                    siteId: config.cinetpay_site_id
                });
                return { success: true, data: cinetResult };

            case 'paypal':
                if (!config.paypal_client_id || !config.paypal_client_secret) {
                    return { success: false, error: "PayPal non configuré" };
                }
                const { createPayPalOrder } = await import("@/lib/gateways/paypal-gateway");
                const paypalResult = await createPayPalOrder(intent, {
                    clientId: config.paypal_client_id,
                    clientSecret: config.paypal_client_secret,
                    sandbox: config.paypal_env !== 'live'
                });
                return { success: true, data: paypalResult };

            case 'kkiapay':
                // Kkia doesn't need a server-side creation for redirect flow usually,
                // BUT we can return the public key to the client securely here.
                if (!config.kkiapay_public_key) return { success: false, error: "KkiaPay non configuré" };
                return {
                    success: true,
                    data: {
                        transactionId: "client_side_init",
                        status: "pending",
                        // We pass the key back so client can use it
                        rawResponse: { publicKey: config.kkiapay_public_key }
                    }
                };

            case 'stripe':
                // Keeping existing stripe logic separate or integrating here later
                // For now, let's return a "use_existing" signal
                return { success: false, error: "Use existing stripe action" };

            default:
                return { success: false, error: "Méthode non supportée via l'adaptateur universel" };
        }
    } catch (e: any) {
        console.error("Payment Creation Error:", e);
        return { success: false, error: e.message };
    }
}

// 2. Confirm Payment (Called AFTER user pays, e.g. from Success Page or Webhook)
export async function confirmPayment(
    method: PaymentMethod,
    transactionId: string,
    storeId: string
): Promise<{ success: boolean; paid: boolean }> {
    const config = await getStorePaymentConfig(storeId);

    if (method === 'kkiapay') {
        // Verify KkiaPay transaction
        // Need private key
        if (!config.kkiapay_private_key) return { success: false, paid: false };
        // Import dynamic verification logic
        const { verifyKkTransaction } = await import("@/lib/gateways/kkiapay-verify");
        const verification = await verifyKkTransaction(
            transactionId,
            config.kkiapay_public_key,
            config.kkiapay_private_key,
            false // Assuming live or sandbox environment variable check
        );
        return { success: true, paid: verification.success };
    }

    return { success: false, paid: false };
}
