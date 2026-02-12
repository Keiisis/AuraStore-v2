import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserPlanLimits, getActivePlans } from "@/lib/actions/plans";
import { SubscriptionDashboard } from "@/components/dashboard/subscription-dashboard";

export default async function SubscriptionPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Get user's current plan limits
    const currentPlan = await getUserPlanLimits(user.id);

    // Get user's subscription details
    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Get all available plans
    const allPlans = await getActivePlans();

    // Get user's store count
    const { count: storeCount } = await supabase
        .from("stores")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id);

    return (
        <SubscriptionDashboard
            currentPlan={currentPlan}
            subscription={subscription}
            allPlans={allPlans}
            storeCount={storeCount || 0}
        />
    );
}
