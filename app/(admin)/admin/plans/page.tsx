import { getPlans } from "@/lib/actions/plans";
import { PlansManager } from "@/components/admin/plans-manager";

export default async function AdminPlansPage() {
    const { plans } = await getPlans();

    return <PlansManager plans={plans} />;
}
