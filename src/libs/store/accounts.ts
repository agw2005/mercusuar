import { signal } from "@preact/signals";
import type { Accounts } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const allAccounts = signal<Accounts[]>([]);

export const refetchAllAccounts = async () => {
    try {
        allAccounts.value = await accountsQuery.get.all();
    } catch (error) {
        console.error("Failed to fetch all accounts:", error);
    }
};

export const accountsQuery = {
    get: {
        all: () => invoke<Accounts[]>("get_all_accounts"),
    },
    post: (name: string) => invoke<number>("create_account", { name }),
};
