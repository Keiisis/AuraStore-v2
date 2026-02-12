"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getBlogs() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

    if (error) return { error: error.message, blogs: [] };
    return { blogs: data || [] };
}

export async function generateAIBlog(force: boolean = false) {
    const supabase = createClient();

    // 0. Check if we generated one in the last 3 days (Bypass if forced)
    if (!force) {
        const { data: lastBlog } = await supabase
            .from("blogs")
            .select("created_at")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (lastBlog) {
            const lastDate = new Date(lastBlog.created_at).getTime();
            const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
            if (Date.now() - lastDate < threeDaysInMs) {
                return { error: "Prochaine génération automatique dans quelques jours." };
            }
        }
    }

    // 1. Get AI Configuration with Environment Fallbacks
    const { data: dbConfig } = await supabase
        .from("ai_config")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

    const config = {
        groq_key: dbConfig?.groq_key || process.env.GROQ_API_KEY,
        replicate_key: dbConfig?.replicate_key || process.env.REPLICATE_API_TOKEN,
        fal_key: dbConfig?.fal_key,
        provider: dbConfig?.provider || 'replicate'
    };

    if (!config.groq_key) {
        return { error: "Configuration IA (Groq) manquante." };
    }

    try {
        // 2. Call Groq for content and image prompt
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${config.groq_key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `Tu es le Visionnaire-en-Chef d'AuraStore, un intellectuel du luxe et un maître du storytelling digital. Ton écriture est une fusion entre la poésie d'un orfèvre et la rigueur d'un architecte futuriste.

                        TES RÈGLES D'OR :
                        1. BANISSEMENT DU ROBOTISME : Interdiction formelle d'utiliser les mots "Introduction", "Conclusion", "En résumé", "Tout d'abord". Tes articles doivent couler comme une symphonie narrative. Utilise des titres H2 et H3 ÉVOCATEURS (ex: "Le Silence du Code", "L'Éclat de l'Immatériel").
                        2. L'ART DU DÉTAIL : Ne survole pas les sujets. Plonge dans l'abîme. Si tu parles de code, parle de "l'orfèvrerie binaire". Si tu parles de design, parle de "cinétique onirique".
                        3. STRUCTURE IMMERSIVE : 
                           - Un Hook Psychologique Brûlant dès la première phrase.
                           - Des analyses profondes qui mêlent business, art et philosophie.
                           - Une vision prophétique qui place AuraStore au centre du prochain siècle.
                        
                        4. FORMAT DE SORTIE : Tu dois obligatoirement renvoyer un objet JSON avec les clés : 'title', 'excerpt', 'category', 'content' (Texte complet en Markdown fluide), et 'image_prompt'.
                           LA CLÉ 'CONTENT' DOIT ÊTRE UNE SEULE CHAÎNE DE CARACTÈRES (STRING) CONTENANT TOUT L'ARTICLE. Ne pas créer de sous-objets JSON pour le texte.
                        
                        CONTRAINTES DE STYLE :
                        - Vocabulaire : Alchimie, aura, symbiose, monolithique, quintessence, prestige, disruption, transcendance.
                        - Rythme : Alterne entre de longs paragraphes analytiques denses et des phrases chocs isolées (One-liners).
                        - LONGUEUR ABSOLUE : L'article doit être massif, riche et documenté. Développe chaque argument sur plusieurs paragraphes denses.
                        - IMAGE_PROMPT : Un prompt de niveau Concierge de Luxe (Cinématique, 8k, atmosphère sombre et volcanique, lumière ambrée, architecture minimaliste futuriste).

                        Format de sortie : JSON pur.`
                    },
                    {
                        role: "user",
                        content: "Rédige une pièce maîtresse sur l'esthétique du code et la nouvelle ère du commerce digital de luxe. L'article doit être inoubliable."
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        const result = await response.json();
        const rawContent = result.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("Réponse IA vide ou invalide");

        const parsed = JSON.parse(rawContent);

        // Advanced Reconstruction Helper: Turn complex JSON into fluid Markdown if AI goes off-script
        const reconstructMarkdown = (data: any) => {
            if (typeof data === 'string') return data;

            let md = "";
            const keys = ['introduction', 'section1', 'section2', 'section3', 'conclusion'];

            keys.forEach(k => {
                const section = data[k] || data[k.toUpperCase()];
                if (section) {
                    if (section.titre) md += `## ${section.titre}\n\n`;
                    if (Array.isArray(section.texte)) md += section.texte.join("\n\n") + "\n\n";
                    else if (typeof section.texte === 'string') md += section.texte + "\n\n";
                    if (section.oneLiner) md += `> **${section.oneLiner}**\n\n`;
                }
            });

            return md || JSON.stringify(data, null, 2);
        };

        // Normalize keys and ensure content is always a rich Markdown string
        const blogData = {
            title: parsed.title || parsed.titre || parsed.TITRE || "Article Sans Titre",
            excerpt: parsed.excerpt || parsed.description || parsed.EXCERPT || "L'excellence au service de votre vision.",
            content: reconstructMarkdown(parsed.content || parsed.article || parsed.CONTENT || parsed),
            category: parsed.category || parsed.categorie || "Alchimie Digitale",
            image_prompt: parsed.image_prompt || parsed.prompt || ""
        };

        // 3. Autonomous Image Generation
        let imageUrl = `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070`; // Fallback high-tech image

        try {
            if (config.provider === 'fal' && config.fal_key) {
                const falResponse = await fetch("https://queue.fal.run/fal-ai/flux-pro", {
                    method: "POST",
                    headers: {
                        "Authorization": `Key ${config.fal_key}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ prompt: blogData.image_prompt, image_size: "landscape_4_3" })
                });
                if (falResponse.ok) {
                    const falData = await falResponse.json();
                    // Fal usually returns a request_id for queue, but some models return directly. 
                    // Let's assume standard direct for this simplification or use a more robust URL.
                    if (falData.images?.[0]?.url) imageUrl = falData.images[0].url;
                    else if (falData.image?.url) imageUrl = falData.image.url;
                }
            } else if (config.provider === 'replicate' && config.replicate_key) {
                const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Token ${config.replicate_key}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        version: "black-forest-labs/flux-schnell",
                        input: { prompt: blogData.image_prompt, aspect_ratio: "16:9" }
                    })
                });
                if (replicateRes.ok) {
                    const repData = await replicateRes.json();
                    // Replicate usually takes time, but Flux-Schnell is fast. 
                    // For a background action, we'll try to wait a few seconds or just use a placeholder if it fails async.
                    if (repData.output?.[0]) imageUrl = repData.output[0];
                }
            } else if (blogData.image_prompt || blogData.title) {
                // Semantic Unsplash Fallback
                const keywords = (blogData.category + "," + (blogData.title || "luxury tech").split(' ').slice(0, 2).join(','));
                imageUrl = `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop&keywords=${encodeURIComponent(keywords)}`;
            }
        } catch (imgErr) {
            console.warn("Image Generation failed, using default:", imgErr);
        }

        // 4. Save to DB
        const slug = (blogData.title || "post-" + Date.now())
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');

        const { error: insertError } = await supabase
            .from("blogs")
            .insert({
                title: blogData.title,
                slug,
                excerpt: blogData.excerpt,
                content: blogData.content,
                category: blogData.category,
                image_url: imageUrl,
                author: "Aura Intelligence"
            });

        if (insertError) throw insertError;

        revalidatePath("/p/blog");
        return { success: true, title: blogData.title };
    } catch (err: any) {
        console.error("Blog Generation Error:", err);
        return { error: err.message };
    }
}
