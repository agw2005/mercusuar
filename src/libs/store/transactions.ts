import { signal } from "@preact/signals";
import { db } from "#/libs/db.ts";
import type { AccountChange, Transactions } from "#/types.d.ts";
import type { QueryResult } from "@tauri-apps/plugin-sql";
import { receivablesQuery } from "./receivables";
import { dateISORange } from "#/libs/dateISORange.ts";
import { debtsQuery } from "./debts";

export const transactionsAtMonth = signal<Transactions[]>([]);

export const refetchTransactionsAtMonth = async (m: number, y: number) => {
    try {
        transactionsAtMonth.value = await transactionsQuery.get.at_month(m, y);
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
    }
};

export const transactionsQuery = {
    get: {
        at_month: (m: number, y: number) => {
            const [start, end] = dateISORange(m, y);
            return db.select<Transactions[]>(
                `SELECT * FROM Transactions WHERE date >= $1 AND date < $2;`,
                [start, end],
            );
        },
    },
    post: async (
        category: number,
        changes: AccountChange[],
        contact: number | null,
        desc: number,
        date: string,
    ) => {
        const receivableId = 1;
        const debtId = 2;

        for (const change of changes) {
            const needsContact = change.accountId === receivableId ||
                change.accountId === debtId;

            if (needsContact && contact === null) {
                return; // TODO: wrap loop in a DB transaction and roll back on early exit
            }

            const result: QueryResult = await db.execute(
                `INSERT INTO Transactions (category_id, account_id, value, description, date) VALUES ($1,$2,$3,$4,$5)`,
                [category, change.accountId, change.value, desc, date],
            );

            if (!result.lastInsertId) {
                return; // TODO: wrap loop in a DB transaction and roll back on early exit
            }

            if (change.accountId === receivableId && contact !== null) {
                await receivablesQuery.post(result.lastInsertId, contact);
            } else if (change.accountId === debtId && contact !== null) {
                await debtsQuery.post(result.lastInsertId, contact);
            }
        }
    },
};
