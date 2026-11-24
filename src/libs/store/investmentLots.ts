import { signal } from "@preact/signals";
import type { Investment_Lots } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const unarchivedInvestmentLots = signal<Investment_Lots[]>([]);

export const refetchInvestmentLots = async () => {
    try {
        unarchivedInvestmentLots.value = await investmentLotsQuery.get
            .all();
    } catch (error) {
        console.error("Failed to fetch all investment lots:", error);
    }
};

export const investmentLotsQuery = {
    get: {
        all: () => invoke<Investment_Lots[]>("get_all_holdings"),
    },
    post: (
        investmentId: number,
        quantity: number,
        unitCost: number,
        purchasedAt: string,
        sourceAccount: number,
        sourceContact: number | null,
    ) => invoke<number>("purchase_lot", {
        investmentId,
        quantity,
        unitCost,
        purchasedAt,
        sourceAccount,
        sourceContact,
    }),
};
