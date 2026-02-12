import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { productImage, storeId } = await req.json();

        const supabase = createClient();

        // 1. Fetch Store Config to get FAL_KEY
        const { data: store, error: storeError } = await supabase
            .from("stores")
            .select("payment_config")
            .eq("id", storeId)
            .single();

        const config = store?.payment_config as any;
        const merchantFalKey = config?.FAL_KEY || process.env.FAL_KEY;

        if (!merchantFalKey) {
            return NextResponse.json({
                error: "Configuration Aura IA incomplète : FAL_KEY manquante. Veuillez l'ajouter dans vos paramètres de boutique ou votre environnement."
            }, { status: 400 });
        }

        // 2. Call Fal.ai Hunyuan3D v2
        const response = await fetch("https://fal.run/fal-ai/hunyuan3d/v2/image-to-3d", {
            method: "POST",
            headers: {
                "Authorization": `Key ${merchantFalKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                image_url: productImage
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Fal API error: ${error}`);
        }

        const data = await response.json();

        // The GLB URL is usually in data.model_mesh.url or similar for Hunyuan3D v2
        // We'll return the whole data for now and handle it client side or mapping here
        const glbUrl = data?.model_mesh?.url || data?.file?.url;

        return NextResponse.json({ glbUrl: glbUrl });

    } catch (error) {
        console.error("3D Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate 3D model" }, { status: 500 });
    }
}
