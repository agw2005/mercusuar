import { signal } from "@preact/signals";
import type { AccountChange, Transactions } from "#/types.d.ts";
import { dateISORange } from "#/libs/dateISORange.ts";
import { invoke } from "@tauri-apps/api/core";

export const transactionsAtMonth = signal<Transactions[]>([]);

export const refetchTransactionsAtMonth = async (m: number, y: number) => {
    try {
        transactionsAtMonth.value = await transactionsQuery.get.at_month(m, y);
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
    }
};

export const transactionsQuery = {
    get: {
        at_month: (m: number, y: number) => {
            const [start, end] = dateISORange(m, y);
            return invoke<Transactions[]>("get_transactions_at_month", {
                start,
                end,
            });
        },
    },
    post: (
        category: number,
        changes: AccountChange[],
        contact: number | null,
        description: string,
        date: string,
    ) => invoke<number[]>("create_transaction", {
        category,
        changes,
        contact,
        description,
        date,
    }),
};
