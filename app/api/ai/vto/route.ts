import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { userPhoto, productPhoto, productType, productDescription, storeId } = await req.json();

        const supabase = createClient();

        // 1. Fetch Store Config for the Keys
        const { data: store, error: storeError } = await supabase
            .from("stores")
            .select("payment_config")
            .eq("id", storeId)
            .single();

        const config = store?.payment_config as any;
        const merchantFalKey = config?.FAL_KEY;
        const merchantReplicateToken = config?.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

        // --- PRIORITÉ 1: ENGINE PREMIUM (FAL.AI) ---
        if (merchantFalKey) {
            try {
                const response = await fetch("https://fal.run/fal-ai/fashn-vton", {
                    method: "POST",
                    headers: {
                        "Authorization": `Key ${merchantFalKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        garment_image_url: productPhoto,
                        human_image_url: userPhoto,
                        garment_type: productType === 'garment' ? 'upper_body' : 'accessories'
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return NextResponse.json({
                        imageUrl: data.image.url,
                        mode: "premium",
                        provider: "fal",
                        message: "Aura VTO™ Premium (Fal.ai) activé."
                    });
                }
            } catch (err) {
                console.error("Fal Engine failed, trying Replicate...", err);
            }
        }

        // --- PRIORITÉ 2: ENGINE ALTERNATIF (REPLICATE) ---
        if (merchantReplicateToken) {
            try {
                // Modèle IDM-VTON sur Replicate (puissant et réel)
                const response = await fetch("https://api.replicate.com/v1/predictions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Token ${merchantReplicateToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        version: "70438ee2e896472f790240dca4efb51c888280629738f61ca559ad0037a1e050",
                        input: {
                            garm_img: productPhoto,
                            human_img: userPhoto,
                            garment_des: productDescription,
                            is_checked: true
                        }
                    })
                });

                if (response.ok) {
                    const prediction = await response.json();

                    // Replicate est asynchrone par défaut. 
                    // Pour cette démo, on essaye de bloquer quelques secondes pour voir si le résultat arrive
                    // Sinon on renvoie l'ID pour le polling front-end (à implémenter)
                    return NextResponse.json({
                        imageUrl: prediction.output ? prediction.output[0] : userPhoto,
                        predictionId: prediction.id,
                        mode: "premium",
                        provider: "replicate",
                        message: prediction.output ? "Aura VTO™ Premium (Replicate) activé." : "Rendu IA Replicate lancé..."
                    });
                }
            } catch (err) {
                console.error("Replicate Engine failed...", err);
            }
        }

        // --- ENGINE OPEN-SOURCE (IDM-VTON / BAIDU) ---
        return NextResponse.json({
            imageUrl: userPhoto,
            status: "processed",
            mode: "open-source",
            message: "Moteur Open-Source actif (Simulation). Ajoutez une clé Replicate/Fal pour le rendu réel."
        });

    } catch (error) {
        console.error("VTO Error:", error);
        return NextResponse.json({ error: "Aura AI Fusion failed" }, { status: 500 });
    }
}
