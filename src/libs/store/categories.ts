import { signal } from "@preact/signals";
import { db } from "#/libs/db.ts";
import type { Categories } from "#/types.d.ts";

export const unarchivedCategories = signal<Categories[]>([]);

export const refetchUnarchivedCategories = async () => {
    try {
        unarchivedCategories.value = await categoriesQuery.get.all_unarchived;
    } catch (error) {
        console.error("Failed to fetch unarchived categories:", error);
    }
};

export const categoriesQuery = {
    get: {
        all_unarchived: db.select<Categories[]>(
            `SELECT * FROM Categories WHERE archived = 0;`,
        ),
    },
    post: (s: string) =>
        db.execute(`INSERT INTO Categories (name) VALUES ($1)`, [s]),
};
