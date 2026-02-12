import { NextResponse } from "next/server";
import { getAIConfig, updateAIConfig } from "@/lib/actions/system";

export async function GET() {
    try {
        const result = await getAIConfig();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const result = await updateAIConfig(body);
        if (result.error) {
            // Check for missing table in error message
            if (result.error.includes("Could not find the table") || result.error.includes("relation \"ai_config\" does not exist")) {
                return NextResponse.json({
                    error: "Table 'ai_config' manquante. Veuillez exécuter le script 'supabase/ai-blog-infrastructure.sql' dans votre éditeur SQL Supabase."
                }, { status: 400 });
            }
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
