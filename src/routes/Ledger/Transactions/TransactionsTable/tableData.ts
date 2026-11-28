import { computed } from "@preact/signals";
import type {
  AccountChange,
  TransactionByTime,
  TransactionsAtDay,
} from "#/types.d.ts";
import { transactionsAtMonth } from "#/libs/store/transactions.ts";
import { ACCOUNT } from "#/libs/systemsId.ts";
import { accountsInTransactions } from "#/libs/accountsInTransactions.ts";
import { allAccounts, balances } from "#/libs/store/accounts.ts";
import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";
import { startingDayLabel } from "#view/Ledger/selectedDate.ts";

export const startingBalanceMap = computed<Record<number, number>>(() => {
  const map: Record<number, number> = {};
  for (const acc of balances.value) {
    map[acc.id] = acc.balance;
  }
  return map;
});

// Group transactions by day and compute end-of-day running balances (prefix sum)
export const dailyLedgers = computed<TransactionsAtDay[]>(() => {
  const runningBalances: Record<number, number> = {
    ...startingBalanceMap.value,
  };

  const days: {
    dayLabel: string;
    transactions: TransactionByTime[];
    endOfDayBalances: Record<number, number>;
    endOfDayEquity: number;
  }[] = [];

  for (const tx of transactionsTableData.groupedByTime.value) {
    const dayLabel = formatIsoToDayMonth(tx.date);
    let currentDay = days[days.length - 1];

    if (!currentDay || currentDay.dayLabel !== dayLabel) {
      currentDay = {
        dayLabel,
        transactions: [],
        endOfDayBalances: {},
        endOfDayEquity: 0,
      };
      days.push(currentDay);
    }

    currentDay.transactions.push(tx);

    for (const change of tx.changes) {
      runningBalances[change.accountId] =
        (runningBalances[change.accountId] ?? 0) + change.value;
    }

    // Snapshot cumulative state at the end of this transaction (final snapshot = end of day)
    currentDay.endOfDayBalances = { ...runningBalances };
    currentDay.endOfDayEquity = calculateEquity(runningBalances);
  }

  return days;
});

const calculateEquity = (balanceMap: Record<number, number>) => {
  return Object.entries(balanceMap).reduce((acc, [id, val]) => {
    return Number(id) === ACCOUNT.DEBT ? acc - val : acc + val;
  }, 0);
};

export const transactionsTableData = {
  groupedByTime: computed<TransactionByTime[]>(
    () => {
      return transactionsAtMonth.value.reduce<TransactionByTime[]>(
        (acc, curr) => {
          const existingGroup = acc.find((item) => item.date === curr.date);

          const change: AccountChange & { transactionId: number } = {
            accountId: curr.account_id,
            value: curr.value,
            transactionId: curr.id,
          };

          if (existingGroup) {
            existingGroup.changes.push(change);
          } else {
            acc.push({
              category: curr.category_id,
              description: curr.description,
              date: curr.date,
              changes: [change],
            });
          }

          return acc;
        },
        [],
      );
    },
  ),
  // Compute non-system visible columns once so headers and rows always stay aligned
  nonSystemAccounts: computed(() => {
    return accountsInTransactions(
      transactionsAtMonth.value,
      allAccounts.value,
    ).filter((account) => account.id > 3);
  }),
  startingEquity: computed(() => calculateEquity(startingBalanceMap.value)),
  hasFirstDayTransactions: computed(() =>
    dailyLedgers.value[0]?.dayLabel === startingDayLabel.value
  ),
};
