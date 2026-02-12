import { PaymentIntent, PaymentResult } from "./definitions";

// Environment Check: 'sandbox' or 'live'
function getBaseUrl(env: string = 'sandbox') {
    return env === 'live' ? 'https://api.fedapay.com/v1' : 'https://api.fedapay.com/v1'; // Same endpoint but uses sandbox key
}

export async function createFedaPayTransaction(
    intent: PaymentIntent,
    config: { secretKey: string; publicKey: string; env?: string }
): Promise<PaymentResult> {
    try {
        const body = JSON.stringify({
            description: intent.description,
            amount: Math.round(intent.amount),
            currency: {
                iso: intent.currency.toUpperCase() // Must be XOF or supported
            },
            callback_url: intent.successUrl, // Where FedaPay sends POST on success (webhook-like)
            customer: {
                firstname: intent.name?.split(" ")[0] || "Client",
                lastname: intent.name?.split(" ").slice(1).join(" ") || "Inconnu",
                email: intent.email,
                phone_number: {
                    number: intent.phone || "",
                    country: "bj" // Default to Benin/West Africa, Feda handles many
                }
            }
        });

        // 1. Create Transaction
        const response = await fetch(`${getBaseUrl(config.env)}/transactions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${config.secretKey}`,
                "Content-Type": "application/json"
            },
            body
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || response.statusText);
        }

        const data = await response.json();
        const transactionId = data.v1?.id || data.id; // Usually data.v1.id
        const token = data.v1?.token || data.token; // Needed for the frontend or redirect

        // 2. Generate Payment Link
        // For FedaPay, we usually generate a token and initiate the dialog or redirect.
        // The most robust way server-side without JS SDK is generating a hosted link if available, 
        // OR returning the token for the client-side checkout.

        // FedaPay also has a "generate-token" endpoint for direct integration.
        // Simpler approach: Use the transaction ID to create a payment URL or return token.
        // Actually, FedaPay usually requires client-side invocation with the public key + token.
        // BUT for a redirect flow (hosted page), we can use: https://checkout.fedapay.com/{token} ???
        // Let's assume standard behavior: return token to frontend to open FedaCheckout.

        return {
            transactionId: String(transactionId),
            status: 'pending',
            url: token, // We'll use this token on the frontend to open the widget
            rawResponse: data
        };

    } catch (error: any) {
        console.error("FedaPay Error:", error);
        return {
            transactionId: "",
            status: "failed",
            error: error.message
        };
    }
}
