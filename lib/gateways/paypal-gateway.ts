import { PaymentIntent, PaymentResult } from "./definitions";

async function getPayPalAccessToken(clientId: string, clientSecret: string, sandbox: boolean) {
    const baseUrl = sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();
    return data.access_token;
}

export async function createPayPalOrder(
    intent: PaymentIntent,
    config: { clientId: string; clientSecret: string; sandbox: boolean }
): Promise<PaymentResult> {
    try {
        const accessToken = await getPayPalAccessToken(config.clientId, config.clientSecret, config.sandbox);
        const baseUrl = config.sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

        const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: intent.currency.toUpperCase() === "XOF" ? "USD" : intent.currency.toUpperCase(), // PayPal doesn't support XOF
                            value: intent.currency.toUpperCase() === "XOF" ? (intent.amount / 600).toFixed(2) : intent.amount.toString(),
                        },
                        description: intent.description,
                    },
                ],
                application_context: {
                    return_url: intent.successUrl,
                    cancel_url: intent.cancelUrl,
                },
            }),
        });

        const data = await response.json();
        const approvalUrl = data.links.find((link: any) => link.rel === "approve")?.href;

        if (approvalUrl) {
            return {
                transactionId: data.id,
                status: "pending",
                url: approvalUrl,
                rawResponse: data,
            };
        } else {
            throw new Error(data.message || "Erreur PayPal API");
        }
    } catch (error: any) {
        console.error("PayPal Error:", error);
        return {
            transactionId: "",
            status: "failed",
            error: error.message,
        };
    }
}
