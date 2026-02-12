import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import { UserManagementClient } from "@/components/admin/users-management-client";
import { getAllUsers } from "@/lib/actions/users";
import { getPlans } from "@/lib/actions/plans";

export default async function AdminUsersPage() {
    const supabase = createClient();
    const { data: { user: admin } } = await supabase.auth.getUser();

    // Fetch users via server action for nested joins handling
    const { users } = await getAllUsers();
    const { plans } = await getPlans();

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    Utilisateurs & Registre Nexus
                </h2>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">Management, Accreditions & Direct Communication</p>
            </div>

            <UserManagementClient
                initialUsers={users}
                plans={plans}
                currentAdminId={admin?.id || ""}
            />
        </div>
    );
}
