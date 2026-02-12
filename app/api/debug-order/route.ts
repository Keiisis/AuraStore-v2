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

        // TEST RPC
        const { data: rpcResult, error: rpcError } = await supabaseAdmin
            .rpc('get_order_by_provider_id', { p_provider_id: sessionId });

        return NextResponse.json({
            status: "rpc_diagnostic",
            timestamp: new Date().toISOString(),
            env: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            },
            rpc: {
                success: !!rpcResult,
                data: rpcResult,
                error: rpcError
            },
            searchID: sessionId
        });
    } catch (e: any) {
        return NextResponse.json({
            status: "exception",
            error: e.message,
            stack: e.stack
        });
    }
}
