import { signal } from "@preact/signals";
import type { FundTypes } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const allFundTypes = signal<FundTypes[]>([]);

export const refetchAllFundTypes = async () => {
    try {
        allFundTypes.value = await fundTypesQuery.get.all();
    } catch (error) {
        console.error("Failed to fetch all fund types:", error);
    }
};

export const fundTypesQuery = {
    get: {
        all: () => invoke<FundTypes[]>("get_all_fund_types"),
    },
    post: (name: string) => invoke<number>("create_fund_type", { name }),
    patch: (data: Partial<Pick<FundTypes, "name" | "color">>) =>
        invoke("modify_fund_type", { data }),
    delete: (id: number) => invoke("delete_fund_type", { id }),
};
