import { signal } from "@preact/signals";
import type { AccountBalance, Accounts } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";
import { dateISORange } from "../dateISORange";

export const allAccounts = signal<Accounts[]>([]);
export const balances = signal<AccountBalance[]>([]);

export const refetchAllAccounts = async () => {
    try {
        allAccounts.value = await accountsQuery.get.all();
    } catch (error) {
        console.error("Failed to fetch all accounts:", error);
    }
};

export const refetchBalances = async (m: number, y: number) => {
    try {
        balances.value = await accountsQuery.get.starting_balance(m, y);
    } catch (error) {
        console.error("Failed to fetch balances:", error);
    }
};

export const accountsQuery = {
    get: {
        all: () => invoke<Accounts[]>("get_all_accounts"),
        starting_balance: (m: number, y: number) => {
            const [start, _end] = dateISORange(m, y);
            return invoke<AccountBalance[]>("balances_until_date", { start });
        },
    },
    post: (name: string) => invoke<number>("create_account", { name }),
    patch: (data: Partial<Pick<Accounts, "name" | "color">>) =>
        invoke("modify_account", { data }),
    delete: (id: number) => invoke("delete_account", { id }),
};
