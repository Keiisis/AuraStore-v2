import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Init Admin Client (Bypass RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function POST(req: Request) {
    const bodyText = await req.text();
    const headerList = headers();
    let eventType = "unknown";
    let transactionId = "";
    let provider = "";
    let status = "pending";

    console.log("Webhook received");

    try {
        // ---------------------------------------------------------
        // 1. IDENTIFY PROVIDER
        // ---------------------------------------------------------

        // STRIPE
        if (headerList.get("stripe-signature")) {
            provider = "stripe";
            const stripeSignature = headerList.get("stripe-signature");
            // In production, verify signature with Stripe SDK
            // const event = stripe.webhooks.constructEvent(bodyText, stripeSignature, endpointSecret);
            const event = JSON.parse(bodyText);

            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                eventType = "payment_success";
                // We stored the session ID in the order notes or metadata
                // Ideally Stripe Session ID is in `session.id`
                transactionId = session.id;
                status = "paid";
            }
        }
        // FEDAPAY
        else if (headerList.get("x-fedapay-signature") || bodyText.includes("v1/transactions")) {
            provider = "fedapay";
            // FedaPay sends the event object
            const event = JSON.parse(bodyText);

            // FedaPay events: transaction.approved, transaction.canceled
            if (event.name === "transaction.approved") {
                eventType = "payment_success";
                transactionId = event.entity.id.toString();
                status = "paid";
            }
        }
        // CINETPAY IPN
        else if (bodyText.includes("cpm_trans_id") || bodyText.includes("cpm_site_id")) {
            provider = "cinetpay";
            // CinetPay sends data as form-urlencoded sometimes, but let's handle if it's JSON or convert
            try {
                const data = bodyText.includes("{") ? JSON.parse(bodyText) : Object.fromEntries(new URLSearchParams(bodyText));
                eventType = "payment_success";
                transactionId = data.cpm_trans_id || data.transaction_id;
                status = "paid";
            } catch (e) {
                console.error("CinetPay Parsing Error:", e);
            }
        }
        // KKIAPAY (IPN)
        else if (bodyText.includes("transactionId") && bodyText.includes("isPaymentSucess")) {
            provider = "kkiapay";
            const data = JSON.parse(bodyText);
            if (data.isPaymentSucess) {
                eventType = "payment_success";
                transactionId = data.transactionId;
                status = "paid";
            }
        }
        // PAYPAL WEBHOOK
        else if (bodyText.includes("resource_type") && bodyText.includes("checkout-order")) {
            provider = "paypal";
            const event = JSON.parse(bodyText);
            if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
                eventType = "payment_success";
                transactionId = event.resource.id;
                status = "paid";
            }
        }

        // ---------------------------------------------------------
        // 2. PROCESS ORDER UPDATE
        // ---------------------------------------------------------

        if (eventType === "payment_success" && transactionId) {
            console.log(`Processing ${provider} success for ID: ${transactionId}`);

            // Find Order by ID using 'notes' field pattern match
            // Pattern used in frontend: "Provider Transaction ID: <ID>"
            // Stripe: "Stripe Session ID: <ID>"
            // FedaPay: "FedaPay Transaction ID: <ID>"

            const { data: order, error: searchError } = await supabaseAdmin
                .from("orders")
                .select("id, status")
                .eq("provider_order_id", transactionId)
                .maybeSingle();

            if (searchError) {
                console.error("Order Search Error:", searchError);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
            }

            if (!order) {
                console.warn(`Order not found for transaction: ${transactionId}`);
                // Return 200 anyway to stop retries from provider if it's an orphan payment
                return NextResponse.json({ message: "Order not found, ignored" }, { status: 200 });
            }

            // Update Status
            if (order.status !== "confirmed" && order.status !== "delivered") {
                const { error: updateError } = await supabaseAdmin
                    .from("orders")
                    .update({
                        status: "confirmed", // 'confirmed' means paid in your logic usually
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", order.id);

                if (updateError) {
                    console.error("Update Error:", updateError);
                    return NextResponse.json({ error: "Update failed" }, { status: 500 });
                }
                console.log(`Order ${order.id} marked as confirmed (paid).`);
            }
        }

        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Handler Error: ${err.message}` }, { status: 400 });
    }
}
