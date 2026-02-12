import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = createClient();

    // Create or Update the master admin
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'chefkeiis377@gmail.com',
        password: 'Degagebb1226',
        email_confirm: true,
        user_metadata: {
            role: 'admin',
            full_name: 'Master Admin'
        }
    });

    if (error) {
        // If it exists, let's update the role to admin just in case
        return NextResponse.json({ message: "Admin setup triggered", details: error.message });
    }

    return NextResponse.json({ message: "Master Admin created successfully", user: data.user });
}
