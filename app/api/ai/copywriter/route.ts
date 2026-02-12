import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { productName, customerName } = await req.json();

        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            // Fallback content if API key is not configured
            return NextResponse.json({
                message: `Tu vois comment c'est magnifique sur toi, ${customerName} ? ✨ ${productName} est fait pour toi. Lance ta commande maintenant !`
            });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an elite fashion copywriter for AuraStore. Your goal is to write a single, ultra-persuasive, short (max 15 words) marketing sentence in French to convince a customer to buy the product they just tried on virtually. Use a dynamic, flattering, and luxurious tone. Address the customer by name if provided. Use the user's name to make it personal. Focus on how good they look."
                    },
                    {
                        role: "user",
                        content: `Product: ${productName}, Customer Name: ${customerName || 'Client'}. Generate the final punchline.`
                    }
                ],
                temperature: 0.8,
                max_tokens: 60
            })
        });

        const data = await response.json();
        const aiMessage = data.choices?.[0]?.message?.content?.replace(/"/g, '') || `C'est incroyable sur toi, ${customerName} !`;

        return NextResponse.json({ message: aiMessage });

    } catch (error) {
        console.error("Copywriter Error:", error);
        return NextResponse.json({
            message: "C'est absolument sublime sur vous ! Finalisez votre look dès maintenant."
        });
    }
}
