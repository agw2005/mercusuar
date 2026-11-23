import { signal } from "@preact/signals";
import type { Accounts } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const unarchivedAccounts = signal<Accounts[]>([]);

export const refetchUnarchivedAccounts = async () => {
    try {
        unarchivedAccounts.value = await accountsQuery.get.all_unarchived();
    } catch (error) {
        console.error("Failed to fetch unarchived accounts:", error);
    }
};

export const accountsQuery = {
    get: {
        all_unarchived: () => invoke<Accounts[]>("get_unarchived_accounts"),
    },
    post: (name: string) => invoke<number>("create_account", { name }),
};
