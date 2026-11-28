import { signal } from "@preact/signals";
import type { Claim, Contacts } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const unarchivedContacts = signal<Contacts[]>([]);
export const allClaims = signal<Claim[]>([]);

export const refetchUnarchivedContacts = async () => {
  try {
    unarchivedContacts.value = await contactsQuery.get.all_unarchived();
  } catch (error) {
    console.error("Failed to fetch unarchived contacts:", error);
  }
};

export const refetchClaims = async () => {
  try {
    allClaims.value = await contactsQuery.get.all_claims();
  } catch (error) {
    console.error("Failed to fetch claims:", error);
  }
};

export const contactsQuery = {
  get: {
    all_unarchived: () => invoke<Contacts[]>("get_unarchived_contacts"),
    all_claims: () => invoke<Claim[]>("get_all_claims"),
  },
  post: (name: string) => invoke<number>("create_contact", { name }),
  patch: (data: Partial<Pick<Contacts, "name" | "color">>) =>
    invoke("modify_contact", { data }),
  delete: (data: {
    id: number;
    destinationAccountId: number | null;
    date: string;
  }) => invoke<number>("delete_contact", { data }),
};
