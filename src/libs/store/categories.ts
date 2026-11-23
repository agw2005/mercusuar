import { signal } from "@preact/signals";
import { db, get } from "#/libs/db.ts";
import type { Categories } from "#/types.d.ts";

export const categories = signal<Categories[]>([]);

export const refreshCategories = async () => {
    try {
        categories.value = await db.select<Categories[]>(
            get.categories.all_unarchived,
        );
    } catch (error) {
        console.error("Failed to fetch categories:", error);
    }
};
