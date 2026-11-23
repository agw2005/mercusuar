import { signal } from "@preact/signals";
import type { FundTypes } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const unarchivedFundTypes = signal<FundTypes[]>([]);

export const refetchUnarchivedFundTypes = async () => {
    try {
        unarchivedFundTypes.value = await fundTypesQuery.get.all_unarchived();
    } catch (error) {
        console.error("Failed to fetch unarchived fund types:", error);
    }
};

export const fundTypesQuery = {
    get: {
        all_unarchived: () => invoke<FundTypes[]>("get_unarchived_fund_types"),
    },
    post: (name: string) => invoke<number>("create_fund_type", { name }),
};
