import { NextResponse } from "next/server";

// TEMPORARY DIAGNOSTIC ENDPOINT - Remove after testing
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const serviceKeyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) || "MISSING";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING";

    if (!sessionId) {
        return NextResponse.json({
            status: "diagnostic",
            hasServiceKey,
            serviceKeyPrefix: serviceKeyPrefix + "...",
            supabaseUrl,
            allEnvKeys: Object.keys(process.env).filter(k => k.includes("SUPABASE")),
        });
    }

    // Try to fetch the order
    try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        const { data, error } = await supabaseAdmin
            .from("orders")
            .select("id, customer_name, total, items, provider_order_id")
            .eq("provider_order_id", sessionId)
            .maybeSingle();

        return NextResponse.json({
            status: "query_result",
            hasServiceKey,
            serviceKeyPrefix: serviceKeyPrefix + "...",
            found: !!data,
            error: error?.message || null,
            order: data ? {
                id: data.id,
                customer: data.customer_name,
                total: data.total,
                itemCount: data.items?.length || 0,
                providerMatch: data.provider_order_id === sessionId
            } : null
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "exception",
            hasServiceKey,
            error: e.message
        });
    }
}
