// Block Components Registry
import { registerBlock } from "@/lib/theme-engine/renderer";
import { HeroV1 } from "./hero-v1";
import { ProductGrid } from "./product-grid";
import { Marquee } from "./marquee";
import { ImageBanner } from "./image-banner";

// Register all blocks
export function registerAllBlocks() {
    registerBlock("hero_v1", HeroV1);
    registerBlock("product_grid", ProductGrid);
    registerBlock("marquee", Marquee);
    registerBlock("image_banner", ImageBanner);
}

// Export individual blocks
export { HeroV1 } from "./hero-v1";
export { ProductGrid } from "./product-grid";
export { Marquee } from "./marquee";
export { ImageBanner } from "./image-banner";
