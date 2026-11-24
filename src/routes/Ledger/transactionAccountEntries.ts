import { Signal } from "@preact/signals";
import { allAccounts } from "#/libs/store/accounts.ts";

export interface AccountEntry {
    accountId: number;
    value: string;
}

export const addAccount = (entries: Signal<AccountEntry[]>) => {
    const usedIds = entries.value.map((entry) => entry.accountId);
    const nextAvailableAccount = allAccounts.value.find(
        (account) => !usedIds.includes(account.id),
    );
    if (nextAvailableAccount) {
        entries.value = [
            ...entries.value,
            {
                accountId: nextAvailableAccount.id,
                value: "",
            },
        ];
    }
};

export const removeAccount = (
    entries: Signal<AccountEntry[]>,
    rowIndex: number,
) => {
    entries.value = entries.value.filter(
        (_, i) => i !== rowIndex,
    );
};

export const updateEntry = (
    entries: Signal<AccountEntry[]>,
    rowIndex: number,
    patch: Partial<AccountEntry>,
) => {
    entries.value = entries.value.map((entry, i) =>
        i === rowIndex ? { ...entry, ...patch } : entry
    );
};

export const resetAccounts = (entries: Signal<AccountEntry[]>) => {
    entries.value = [{
        accountId: 1,
        value: "",
    }];
};
