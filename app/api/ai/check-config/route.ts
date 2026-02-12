import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { storeId } = await req.json();
        const supabase = createClient();

        const { data: store } = await supabase
            .from("stores")
            .select("payment_config")
            .eq("id", storeId)
            .single();

        const config = store?.payment_config as any;
        const hasKey = !!(config?.FAL_KEY || process.env.FAL_KEY || config?.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN);

        return NextResponse.json({ hasKey });
    } catch (e) {
        return NextResponse.json({ hasKey: false });
    }
}
