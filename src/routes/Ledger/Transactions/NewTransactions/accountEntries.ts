import { computed, Signal, signal } from "@preact/signals";
import { allAccounts } from "#/libs/store/accounts.ts";
import { ACCOUNT } from "#/libs/systemsId.ts";
import type { AccountEntry } from "#/types.d.ts";

export const accountChanges = signal<AccountEntry[]>([{
    accountId: 1,
    value: "",
}]);

export const requireContact = computed(() => {
    return accountChanges.value.some((change) =>
        change.accountId === ACCOUNT.RECEIVABLE ||
        change.accountId === ACCOUNT.DEBT
    );
});

export const totalChange = computed<number>(() => {
    return accountChanges.value.reduce((acc, curr) => {
        if (curr.accountId === ACCOUNT.DEBT) {
            return acc - (Number(curr.value) || 0);
        }
        return acc + (Number(curr.value) || 0);
    }, 0);
});

export const setChanges = {
    addAccount: (entries: Signal<AccountEntry[]>) => {
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
    },
    removeAccount: (
        entries: Signal<AccountEntry[]>,
        rowIndex: number,
    ) => {
        entries.value = entries.value.filter(
            (_, i) => i !== rowIndex,
        );
    },
    updateEntry: (
        entries: Signal<AccountEntry[]>,
        rowIndex: number,
        patch: Partial<AccountEntry>,
    ) => {
        entries.value = entries.value.map((entry, i) =>
            i === rowIndex ? { ...entry, ...patch } : entry
        );
    },
    resetAccounts: (entries: Signal<AccountEntry[]>) => {
        entries.value = [{
            accountId: 1,
            value: "",
        }];
    },
};
