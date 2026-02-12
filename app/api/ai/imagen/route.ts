import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { prompt, storeId, aspectRatio = "1:1", model = "imagen" } = await req.json();

        const supabase = createClient();
        const { data: store } = await supabase
            .from("stores")
            .select("payment_config")
            .eq("id", storeId)
            .single();

        const config = store?.payment_config as any;
        const merchantReplicateToken = config?.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

        if (!merchantReplicateToken) {
            return NextResponse.json({ error: "Clé Replicate manquante." }, { status: 400 });
        }

        // --- MODEL SELECTION (Imagen 4 vs Flux 2 Pro) ---
        let version;
        let input;

        if (model === "flux") {
            // black-forest-labs/flux-2-pro
            version = "black-forest-labs/flux-2-pro";
            input = {
                prompt: prompt,
                aspect_ratio: aspectRatio,
                output_format: "webp",
                output_quality: 90
            };
        } else {
            // google/imagen-4
            version = "3167195744cb897285f1c905380590a2a16c7028ed8347e30349a5676b7e6417";
            input = {
                prompt: prompt,
                aspect_ratio: aspectRatio,
                safety_filter_level: "block_medium_and_above",
                person_generation: "allow_adult"
            };
        }

        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${merchantReplicateToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                version: version.includes('/') ? undefined : version,
                model: version.includes('/') ? version : undefined,
                input: input
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Erreur Replicate");
        }

        const prediction = await response.json();

        return NextResponse.json({
            predictionId: prediction.id,
            status: prediction.status,
            output: prediction.output ? (Array.isArray(prediction.output) ? prediction.output[0] : prediction.output) : null
        });

    } catch (error: any) {
        console.error("Imagen 4 Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
