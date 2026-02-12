// Standard Payment Interface
export interface PaymentIntent {
    amount: number;
    currency: string;
    description: string;
    email: string;
    phone?: string;
    name?: string;
    metadata?: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
    storeId: string;
}

export type PaymentMethod =
    | 'stripe'
    | 'paypal'
    | 'cinetpay'
    | 'fedapay'
    | 'kkiapay'
    | 'zeyow'
    | 'moneco'
    | 'mtn_money'
    | 'moov_money';

export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'succeeded'
    | 'failed'
    | 'canceled'
    | 'requires_action';

export interface PaymentResult {
    transactionId: string; // The ID from the payment provider (e.g. Stripe PI)
    url?: string;          // Redirect URL if needed
    status: PaymentStatus;
    error?: string;
    rawResponse?: any;
}

// Environment Constants for Gateways
// We'll retrieve these dynamically from the store's config in the DB
// But here are the ENV VAR key patterns we expect to find in `store.payment_config`
export const ENV_KEYS = {
    FEDAPAY: {
        PUBLIC: 'fedapay_public_key',
        SECRET: 'fedapay_secret_key',
        ENV: 'fedapay_env' // 'sandbox' or 'live'
    },
    KKIAPAY: {
        PUBLIC: 'kkiapay_public_key',
        SECRET: 'kkiapay_private_key',
        THEME: 'kkiapay_theme' // hex color
    },
    CINETPAY: {
        API_KEY: 'cinetpay_api_key',
        SITE_ID: 'cinetpay_site_id',
    },
    // Add others as needed
};
