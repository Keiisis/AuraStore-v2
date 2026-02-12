import { PricingEditor } from "@/components/admin/pricing-editor";

export const dynamic = "force-dynamic";

export default function PricingPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <PricingEditor />
        </div>
    );
}
