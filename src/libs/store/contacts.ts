import { signal } from "@preact/signals";
import { db } from "#/libs/db.ts";
import type { Contacts } from "#/types.d.ts";

export const unarchivedContacts = signal<Contacts[]>([]);

export const refetchUnarchivedContacts = async () => {
    try {
        unarchivedContacts.value = await contactsQuery.get.all_unarchived;
    } catch (error) {
        console.error("Failed to fetch unarchived categories:", error);
    }
};

export const contactsQuery = {
    get: {
        all_unarchived: db.select<Contacts[]>(
            `SELECT * FROM Contacts WHERE archived = 0;`,
        ),
    },
    post: (s: string) =>
        db.execute(`INSERT INTO Contacts (name) VALUES ($1)`, [s]),
};
