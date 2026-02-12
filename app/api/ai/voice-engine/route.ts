import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { text, storeId } = await req.json();

        if (!text) return NextResponse.json({ error: "Texte manquant" }, { status: 400 });

        const supabase = createClient();
        const { data: store } = await supabase
            .from("stores")
            .select("payment_config")
            .eq("id", storeId)
            .single();

        const config = store?.payment_config as any;
        const merchantReplicateToken = config?.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

        if (!merchantReplicateToken) {
            return NextResponse.json({ error: "Moteur vocal désactivé (Token manquant)" }, { status: 400 });
        }

        // --- CONVERT TEXT TO SPEECH (via Resemble.ai on Replicate) ---
        // 1. Start Prediction
        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${merchantReplicateToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                version: "3af7053e192ff1502444c9b9866e4a2cd358e0a300d6ef19830573e0477028ed",
                input: { input: text }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Erreur Initiation Voice");
        }

        let prediction = await response.json();

        // 2. Poll for Status (Wait up to 10 seconds for sync-like experience)
        // TTS is usually fast (2-4 seconds)
        let attempts = 0;
        const maxAttempts = 10;

        while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { "Authorization": `Token ${merchantReplicateToken}` }
            });
            prediction = await pollResponse.json();
            attempts++;
        }

        if (prediction.status === "failed") {
            throw new Error("Génération audio échouée sur Replicate.");
        }

        return NextResponse.json({
            predictionId: prediction.id,
            status: prediction.status,
            audioUrl: prediction.output
        });

    } catch (error: any) {
        console.error("Voice Engine Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
