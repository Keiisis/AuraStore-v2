import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Fichier audio manquant" }, { status: 400 });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        // --- WHISPER TRANSCRIPTION (Groq) ---
        // Ultra-rapide et précis sur tous les navigateurs
        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3",
            language: "fr",
            response_format: "json",
        });

        return NextResponse.json({ text: transcription.text });

    } catch (error: any) {
        console.error("STT Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
