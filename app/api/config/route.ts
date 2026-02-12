import { NextResponse } from "next/server";
import { getFrontendConfig } from "@/lib/actions/frontend";

export async function GET() {
    try {
        const config = await getFrontendConfig();
        return NextResponse.json(config);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
