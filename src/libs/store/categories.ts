import { signal } from "@preact/signals";
import type { Categories } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const allCategories = signal<Categories[]>([]);

export const refetchAllCategories = async () => {
    try {
        allCategories.value = await categoriesQuery.get.all();
    } catch (error) {
        console.error("Failed to fetch all categories:", error);
    }
};

export const categoriesQuery = {
    get: {
        all: () => invoke<Categories[]>("get_all_categories"),
    },
    post: (name: string) => invoke<number>("create_category", { name }),
    patch: (data: Partial<Pick<Categories, "name" | "color">>) =>
        invoke("modify_category", { data }),
};
