import { NextResponse } from "next/server";
import { getSystemPaymentConfigs, updateSystemPaymentConfig } from "@/lib/actions/system";

export async function GET() {
    try {
        const result = await getSystemPaymentConfigs();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, config_data } = await req.json();
        const result = await updateSystemPaymentConfig(id, config_data);
        if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
