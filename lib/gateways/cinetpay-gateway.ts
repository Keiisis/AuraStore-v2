import { PaymentIntent, PaymentResult } from "./definitions";

// CinetPay constants
const CINETPAY_BASE_URL = "https://api-checkout.cinetpay.com/v2/payment";

export async function createCinetPayTransaction(
    intent: PaymentIntent,
    config: { apiKey: string; siteId: string }
): Promise<PaymentResult> {
    try {
        const transactionId = `CP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const body = JSON.stringify({
            apikey: config.apiKey,
            site_id: config.siteId,
            transaction_id: transactionId,
            amount: Math.round(intent.amount),
            currency: intent.currency.toUpperCase(),
            description: intent.description,
            customer_name: intent.name || "Client",
            customer_surname: "Aura",
            customer_email: intent.email,
            customer_phone_number: intent.phone || "00000000",
            customer_address: "Aura Store",
            customer_city: "Abidjan",
            customer_country: "CI",
            customer_state: "CI",
            customer_zip_code: "0000",
            notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks`, // Your universal webhook
            return_url: intent.successUrl,
            channels: "ALL", // Enable all available (Mobile Money, Card)
            metadata: JSON.stringify(intent.metadata || {})
        });

        const response = await fetch(CINETPAY_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body
        });

        const data = await response.json();

        if (data.code === "201" || data.data?.payment_url) {
            return {
                transactionId,
                status: 'pending',
                url: data.data.payment_url,
                rawResponse: data
            };
        } else {
            throw new Error(data.message || "Erreur CinetPay API");
        }

    } catch (error: any) {
        console.error("CinetPay Error:", error);
        return {
            transactionId: "",
            status: "failed",
            error: error.message
        };
    }
}
