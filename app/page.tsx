import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingShowcase } from "@/components/landing/showcase";
import { LandingSteps } from "@/components/landing/steps";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";
import { LandingStats } from "@/components/landing/stats";
import { DynamicBackground } from "@/components/landing/dynamic-background";
import { getFrontendConfig } from "@/lib/actions/frontend";

export const dynamic = "force-dynamic";

export default async function Home() {
    // Fetch dynamic frontend config (DB-Driven)
    const config = await getFrontendConfig();

    return (
        <div className="min-h-screen selection:bg-primary/20 selection:text-primary">
            <DynamicBackground />
            <LandingHeader config={config} />

            <main>
                {config.show_hero && <LandingHero config={config} />}
                {config.show_live_stats && <LandingStats config={config} />}
                {config.show_features && <LandingFeatures />}
                {config.show_themes && <LandingShowcase />}
                {config.show_steps && <LandingSteps />}
                {config.show_pricing && <LandingPricing />}
            </main>

            {config.show_footer && <LandingFooter config={config} />}
        </div>
    );
}
