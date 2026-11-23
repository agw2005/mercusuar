import { signal } from "@preact/signals";
import type { Categories } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const unarchivedCategories = signal<Categories[]>([]);

export const refetchUnarchivedCategories = async () => {
    try {
        unarchivedCategories.value = await categoriesQuery.get.all_unarchived();
    } catch (error) {
        console.error("Failed to fetch unarchived categories:", error);
    }
};

export const categoriesQuery = {
    get: {
        all_unarchived: () => invoke<Categories[]>("get_unarchived_categories"),
    },
    post: (name: string) => invoke<number>("create_category", { name }),
};
