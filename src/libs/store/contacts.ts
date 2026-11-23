import { signal } from "@preact/signals";
import type { Contacts } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const unarchivedContacts = signal<Contacts[]>([]);

export const refetchUnarchivedContacts = async () => {
    try {
        unarchivedContacts.value = await contactsQuery.get.all_unarchived();
    } catch (error) {
        console.error("Failed to fetch unarchived contacts:", error);
    }
};

export const contactsQuery = {
    get: {
        all_unarchived: () => invoke<Contacts[]>("get_unarchived_contacts"),
    },
    post: (name: string) => invoke<number>("create_contact", { name }),
};
