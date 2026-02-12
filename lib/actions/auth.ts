"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function signIn(formData: z.infer<typeof authSchema>) {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function signUp(formData: z.infer<typeof authSchema>) {
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true, message: "Inscription réussie ! Vérifiez vos emails." };
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
}

export async function updateProfile(data: { full_name?: string; email?: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Non autorisé" };

    const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

    if (error) return { error: error.message };

    // If email is being changed, it requires confirmation in Supabase by default
    if (data.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: data.email });
        if (emailError) return { error: emailError.message };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/admin/settings");
    return { success: true };
}

export async function updatePassword(password: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return { success: true };
}
