"use server";

import { siteConfig } from "@/lib/config";

export async function askAuraAssistant(prompt: string, context?: string) {
    const apiKey = siteConfig.AI.API_KEY;
    const model = siteConfig.AI.MODELS.DEFAULT;
    const systemPrompt = siteConfig.AI.SYSTEM_PROMPTS.GENTLEMAN_SELLER;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Contextual Info: ${context || "N/A"}\n\nUser Request: ${prompt}` }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        const data = await response.json();
        return { success: true, answer: data.choices[0].message.content };
    } catch (error) {
        console.error("Groq AI Error:", error);
        return { success: false, error: "L'Assistant Aura est momentanément indisponible." };
    }
}
