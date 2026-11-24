import type { Accounts, Transactions } from "#/types.d.ts";

export const accountsInTransactions = (
    t: Transactions[],
    a: Accounts[],
): Accounts[] => {
    const accountIdsInTransactions = new Set(t.map((t) => t.account_id));
    const notArchivedOrInTransactions = a.filter(
        (acc) => !acc.archived || accountIdsInTransactions.has(acc.id),
    );
    return notArchivedOrInTransactions;
};
