import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("CRITICAL: Supabase environment variables missing in Webhook Handler");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const bodyText = await req.text();
    const headerList = headers();
    let eventType = "unknown";
    let transactionId = "";
    let provider = "";
    let status = "pending";

    console.log("Webhook received");

    try {
        const payload = JSON.parse(bodyText); // Attempt generic parse once

        // ---------------------------------------------------------
        // 1. IDENTIFY PROVIDER & EVENT
        // ---------------------------------------------------------

        // PAYPAL (Priority Check)
        if (payload.event_type && (payload.event_type.startsWith("PAYMENT.") || payload.event_type.startsWith("CHECKOUT."))) {
            provider = "paypal";
            // We care about CAPTURE.COMPLETED for immediate payment confirmation
            if (payload.event_type === "PAYMENT.CAPTURE.COMPLETED") {
                eventType = "payment_success";
                transactionId = payload.resource.id; // Capture ID
                // PayPal creates a new ID for the capture. The Order ID is usually in supplement data
                // But often we store the PayPal Order ID.
                // We need to look at payload.resource.supplementary_data.related_ids.order_id if available
                const orderIdRef = payload.resource.supplementary_data?.related_ids?.order_id;
                if (orderIdRef) transactionId = orderIdRef;
            }
        }
        // STRIPE
        else if (headerList.get("stripe-signature")) {
            provider = "stripe";
            // Ideally verify signature here
            if (payload.type === "checkout.session.completed") {
                eventType = "payment_success";
                transactionId = payload.data.object.id;
            }
        }
        // FEDAPAY
        else if (headerList.get("x-fedapay-signature") || (payload.entity && payload.entity.currency && payload.name)) {
            provider = "fedapay";
            if (payload.name === "transaction.approved") {
                eventType = "payment_success";
                transactionId = payload.entity.id.toString();
            }
        }
        // KKIAPAY
        else if (payload.transactionId && payload.isPaymentSucess !== undefined) {
            provider = "kkiapay";
            if (payload.isPaymentSucess === true) {
                eventType = "payment_success";
                transactionId = payload.transactionId;
            }
        }
        // CINETPAY
        else if (payload.cpm_trans_id) {
            provider = "cinetpay";
            // CinetPay success
            if (payload.cpm_result === "00") { // '00' is success code
                eventType = "payment_success";
                transactionId = payload.cpm_trans_id;
            }
        }

        console.log(`Webhook Identified: ${provider} | Event: ${eventType} | ID: ${transactionId}`);

        // ---------------------------------------------------------
        // 2. PROCESS ORDER UPDATE
        // ---------------------------------------------------------

        if (eventType === "payment_success" && transactionId) {

            // Try matching provider_order_id first
            let { data: order } = await supabaseAdmin
                .from("orders")
                .select("id, status, notes")
                .eq("provider_order_id", transactionId)
                .maybeSingle();

            // If not found, try searching in notes (legacy support)
            if (!order) {
                const { data: matchedOrders } = await supabaseAdmin
                    .from("orders")
                    .select("id, status, notes")
                    .ilike("notes", `%${transactionId}%`)
                    .limit(1);

                if (matchedOrders && matchedOrders.length > 0) {
                    order = matchedOrders[0];
                }
            }

            if (!order) {
                console.warn(`Order not found for transaction: ${transactionId}`);
                return NextResponse.json({ message: "Order not found, no action taken" }, { status: 200 });
            }

            // Update Status if not already paid
            if (order.status !== "confirmed" && order.status !== "delivered") {
                const { error: updateError } = await supabaseAdmin
                    .from("orders")
                    .update({
                        status: "confirmed", // Mark as Paid
                        payment_status: "paid", // Explicit payment status field if columns exist
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", order.id);

                if (updateError) {
                    // Fallback to minimal update if payment_status column fails
                    await supabaseAdmin.from("orders").update({ status: "confirmed" }).eq("id", order.id);
                }

                console.log(`SUCCESS: Order ${order.id} confirmed via ${provider} webhook.`);
            } else {
                console.log(`Order ${order.id} was already confirmed. Skipping.`);
            }
        }

        return NextResponse.json({ received: true });

    } catch (err: any) {
        // Fallback for non-JSON bodies (some IPNs are form-encoded)
        if (bodyText.includes("cpm_trans_id")) {
            // Handle CinetPay Form Data legacy...
            return NextResponse.json({ received: true });
        }
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Handler Error: ${err.message}` }, { status: 400 });
    }
}
