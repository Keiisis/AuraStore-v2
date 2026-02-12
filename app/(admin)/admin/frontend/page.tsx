import { getFrontendConfig } from "@/lib/actions/frontend";
import { FrontendEditor } from "@/components/admin/frontend-editor";

export default async function AdminFrontendPage() {
    const config = await getFrontendConfig();
    return <FrontendEditor config={config} />;
}
