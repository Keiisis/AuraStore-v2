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

    // Try to fetch RECENT orders to see what's visible
    try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        // Fetch last 5 orders globally
        const { data: recentOrders, error: listError } = await supabaseAdmin
            .from("orders")
            .select("id, customer_name, total, provider_order_id, created_at")
            .order("created_at", { ascending: false })
            .limit(5);

        // specific search
        const { data: exactMatch } = await supabaseAdmin
            .from("orders")
            .select("id")
            .eq("provider_order_id", sessionId)
            .maybeSingle();

        return NextResponse.json({
            status: "deep_diagnostic",
            timestamp: new Date().toISOString(),
            env: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 15),
                hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10)
            },
            search: {
                targetId: sessionId,
                foundExact: !!exactMatch,
            },
            recentOrders: recentOrders || [],
            listError: listError?.message
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "exception",
            error: e.message,
            stack: e.stack
        });
    }
}
