"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ThemeConfig, ThemeTokens, DEFAULT_THEME } from "./types";

interface ThemeContextValue {
    theme: ThemeConfig;
    tokens: ThemeTokens;
    setTheme: (theme: ThemeConfig) => void;
    updateTokens: (tokens: Partial<ThemeTokens>) => void;

    // Layout Actions
    updateLayout: (layout: BlockConfig[]) => void;
    addBlock: (block: BlockConfig) => void;
    removeBlock: (blockId: string) => void;
    updateBlock: (blockId: string, props: Record<string, any>) => void;
    reorderBlocks: (fromIndex: number, toIndex: number) => void;
    resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

import { BlockConfig } from "./types";

// Convert tokens to CSS variables
function tokensToCSSVariables(tokens: ThemeTokens): Record<string, string> {
    return {
        "--theme-primary": tokens.primary,
        "--theme-secondary": tokens.secondary,
        "--theme-accent": tokens.accent,
        "--theme-background": tokens.background,
        "--theme-surface": tokens.surface,
        "--theme-text": tokens.text,
        "--theme-text-muted": tokens.textMuted,
        "--theme-font-display": tokens.fontDisplay,
        "--theme-font-body": tokens.fontBody,
        "--theme-radius": tokens.radius,
        "--theme-radius-lg": tokens.radiusLg,
        "--theme-radius-full": tokens.radiusFull,
    };
}

// Apply CSS variables to document
function applyCSSVariables(tokens: ThemeTokens) {
    if (typeof document === "undefined") return;

    const variables = tokensToCSSVariables(tokens);
    const root = document.documentElement;

    Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
}

interface ThemeProviderProps {
    children: ReactNode;
    initialTheme?: ThemeConfig;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<ThemeConfig>(initialTheme || DEFAULT_THEME);

    // Apply CSS variables whenever tokens change
    useEffect(() => {
        applyCSSVariables(theme.tokens);
    }, [theme.tokens]);

    const setTheme = (newTheme: ThemeConfig) => {
        setThemeState(newTheme);
    };

    const updateTokens = (newTokens: Partial<ThemeTokens>) => {
        setThemeState((prev) => ({
            ...prev,
            tokens: { ...prev.tokens, ...newTokens },
        }));
    };

    const updateLayout = (layout: BlockConfig[]) => {
        setThemeState((prev) => ({
            ...prev,
            layout_home: layout,
        }));
    };

    const addBlock = (block: BlockConfig) => {
        setThemeState((prev) => ({
            ...prev,
            layout_home: [...prev.layout_home, block],
        }));
    };

    const removeBlock = (blockId: string) => {
        setThemeState((prev) => ({
            ...prev,
            layout_home: prev.layout_home.filter((b) => b.id !== blockId),
        }));
    };

    const updateBlock = (blockId: string, props: Record<string, any>) => {
        setThemeState((prev) => ({
            ...prev,
            layout_home: prev.layout_home.map((b) =>
                b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b
            ),
        }));
    };

    const reorderBlocks = (fromIndex: number, toIndex: number) => {
        setThemeState((prev) => {
            const layout = [...prev.layout_home];
            const [movedBlock] = layout.splice(fromIndex, 1);
            layout.splice(toIndex, 0, movedBlock);
            return {
                ...prev,
                layout_home: layout,
            };
        });
    };

    const resetTheme = () => {
        setThemeState(DEFAULT_THEME);
        applyCSSVariables(DEFAULT_THEME.tokens);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                tokens: theme.tokens,
                setTheme,
                updateTokens,
                updateLayout,
                addBlock,
                removeBlock,
                updateBlock,
                reorderBlocks,
                resetTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

// ... (existing exports)

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

// Hook for accessing just the tokens
export function useThemeTokens() {
    const { tokens } = useTheme();
    return tokens;
}
