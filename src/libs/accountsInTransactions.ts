import type { Accounts, Transactions } from "#/types.d.ts";

export const accountsInTransactions = <T extends Accounts>(
  t: Transactions[],
  a: T[],
): T[] => {
  const accountIdsInTransactions = new Set(t.map((t) => t.account_id));
  const notArchivedOrInTransactions = a.filter(
    (acc) => !acc.archived || accountIdsInTransactions.has(acc.id),
  );
  return notArchivedOrInTransactions;
};
