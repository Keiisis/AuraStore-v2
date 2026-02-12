"use client";

import { ComponentType } from "react";
import { BlockConfig, BlockType } from "./types";

// Block Registry - Maps block types to React components
type BlockComponent = ComponentType<{ config: BlockConfig }>;

const blockRegistry: Partial<Record<BlockType, BlockComponent>> = {};

// Register a block component
export function registerBlock(type: BlockType, component: BlockComponent) {
    blockRegistry[type] = component;
}

// Get a block component by type
export function getBlock(type: BlockType): BlockComponent | null {
    return blockRegistry[type] || null;
}

// Render a single block
interface BlockRendererProps {
    config: BlockConfig;
    [key: string]: any;
}

export function BlockRenderer({ config, ...rest }: BlockRendererProps) {
    const Component = getBlock(config.type);

    if (!Component) {
        // Development fallback - show placeholder for unregistered blocks
        if (process.env.NODE_ENV === "development") {
            return (
                <div className="p-8 border-2 border-dashed border-white/20 rounded-xl text-center">
                    <p className="text-white/40 font-mono text-sm">
                        Block not found: <span className="text-primary">{config.type}</span>
                    </p>
                    <p className="text-white/20 text-xs mt-2">
                        ID: {config.id}
                    </p>
                </div>
            );
        }
        return null;
    }

    // Pass all extra props to the block component
    return <Component config={config} {...rest} />;
}

// Render a layout (array of blocks)
interface LayoutRendererProps {
    layout: BlockConfig[];
    className?: string;
    [key: string]: any;
}

export function LayoutRenderer({ layout, className = "", ...rest }: LayoutRendererProps) {
    return (
        <div className={`flex flex-col ${className}`}>
            {layout.map((block) => (
                <BlockRenderer key={block.id} config={block} {...rest} />
            ))}
        </div>
    );
}


// Export registry for external registration
export { blockRegistry };
