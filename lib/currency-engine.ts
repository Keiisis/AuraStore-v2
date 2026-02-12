export type CurrencyCode = "XOF" | "EUR" | "USD";

export interface Currency {
    code: CurrencyCode;
    symbol: string;
    label: string;
    rate: number; // Rate relative to XOF (base)
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
    XOF: {
        code: "XOF",
        symbol: "FCFA",
        label: "Franc CFA",
        rate: 1,
    },
    EUR: {
        code: "EUR",
        symbol: "€",
        label: "Euro",
        rate: 655.957, // Fixed XOF to EUR
    },
    USD: {
        code: "USD",
        symbol: "$",
        label: "US Dollar",
        rate: 600, // Approximate
    },
};

/**
 * Intelligent Price Formatter
 * Handles conversion and regional formatting
 */
export function formatPrice(amount: number, currencyCode: CurrencyCode = "XOF") {
    const currency = CURRENCIES[currencyCode];

    // Convert from base (XOF) to target currency
    // If input is already in XOF, and target is EUR, we divide by rate
    const convertedAmount = currencyCode === "XOF" ? amount : amount / currency.rate;

    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currencyCode === "XOF" ? "XOF" : currencyCode,
        currencyDisplay: "symbol",
        minimumFractionDigits: currencyCode === "XOF" ? 0 : 2,
    }).format(convertedAmount).replace("XOF", "FCFA");
}
