import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const predictionId = searchParams.get("id");

        if (!predictionId) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

        // On récupère le token depuis les variables d'environnement (plus sûr ici)
        const merchantReplicateToken = process.env.REPLICATE_API_TOKEN;

        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { "Authorization": `Token ${merchantReplicateToken}` }
        });

        const prediction = await response.json();

        return NextResponse.json({
            status: prediction.status,
            audioUrl: prediction.output
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
