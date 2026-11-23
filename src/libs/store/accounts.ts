import { signal } from "@preact/signals";
import { db } from "#/libs/db.ts";
import type { Accounts } from "#/types.d.ts";

export const unarchivedAccounts = signal<Accounts[]>([]);

export const getUnarchivedAccounts = async () => {
    try {
        unarchivedAccounts.value = await accountsQuery.get.all_unarchived;
    } catch (error) {
        console.error("Failed to fetch unarchived categories:", error);
    }
};

export const accountsQuery = {
    get: {
        all_unarchived: db.select<Accounts[]>(
            `SELECT * FROM Accounts WHERE archived = 0;`,
        ),
    },
    post: (s: string) =>
        db.execute(`INSERT INTO Accounts (name) VALUES ($1)`, [s]),
};
