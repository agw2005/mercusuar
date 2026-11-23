import { signal } from "@preact/signals";
import { db } from "#/libs/db.ts";
import type { FundTypes } from "#/types.d.ts";

export const unarchivedFundTypes = signal<FundTypes[]>([]);

export const refetchUnarchivedFundTypes = async () => {
    try {
        unarchivedFundTypes.value = await fundTypesQuery.get.all_unarchived;
    } catch (error) {
        console.error("Failed to fetch unarchived fund types:", error);
    }
};

export const fundTypesQuery = {
    get: {
        all_unarchived: db.select<FundTypes[]>(
            `SELECT * FROM Fund_Types WHERE archived = 0;`,
        ),
    },
    post: (s: string) =>
        db.execute(`INSERT INTO Fund_Types (name) VALUES ($1)`, [s]),
};
