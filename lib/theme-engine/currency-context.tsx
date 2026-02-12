"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrencyCode, CURRENCIES } from "../currency-engine";

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>("XOF");

    useEffect(() => {
        const saved = localStorage.getItem("aura_currency") as CurrencyCode;
        if (saved && CURRENCIES[saved]) {
            setCurrencyState(saved);
        } else {
            // Auto-detect based on IP
            const detectCurrency = async () => {
                try {
                    const res = await fetch("https://ipapi.co/json/");
                    const data = await res.json();

                    const countryCurrency = data.currency as string;
                    if (countryCurrency === "EUR") setCurrency("EUR");
                    else if (countryCurrency === "USD") setCurrency("USD");
                    else setCurrency("XOF"); // Default
                } catch (err) {
                    console.log("Geo-IP detection failed, using default XOF");
                }
            };
            detectCurrency();
        }
    }, []);

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyState(code);
        localStorage.setItem("aura_currency", code);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}
