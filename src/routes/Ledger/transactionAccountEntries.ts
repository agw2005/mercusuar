import { Signal } from "@preact/signals";
import { placeholder } from "#/libs/placeholder.ts";

export interface AccountEntry {
    accountId: number;
    value: number;
    sign: boolean;
}

export const addAccount = (entries: Signal<AccountEntry[]>) => {
    const usedIds = entries.value.map((entry) => entry.accountId);
    const nextAvailable = placeholder.accounts.findIndex(
        (_, idx) => !usedIds.includes(idx),
    );
    if (nextAvailable !== -1) {
        entries.value = [
            ...entries.value,
            { accountId: nextAvailable, value: 0, sign: false },
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
    entries.value = [{ accountId: 0, value: 0, sign: false }];
};
