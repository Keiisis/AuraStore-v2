// Server-side verification of KkiaPay transaction
export async function verifyKkTransaction(
    transactionId: string,
    publicKey: string,
    privateKey: string,
    sandbox: boolean = false
): Promise<{ success: boolean; amount?: number; currency?: string; metadata?: any }> {
    try {
        const url = sandbox
            ? `https://api.kkiapay.me/api/v1/transactions/verify`
            : `https://api.kkiapay.me/api/v1/transactions/verify`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "x-api-key": publicKey,
                "x-private-key": privateKey
            },
            body: JSON.stringify({ transactionId })
        });

        const data = await response.json();

        if (data.status === "SUCCESS") {
            return {
                success: true,
                amount: data.amount,
                currency: "XOF", // Often implicitly XOF
                metadata: data.clientData
            };
        } else {
            return { success: false };
        }
    } catch (e: any) {
        console.error("KkiaPay Verify Error:", e);
        return { success: false };
    }
}
