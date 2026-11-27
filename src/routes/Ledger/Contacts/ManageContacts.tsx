import { unarchivedContacts } from "#/libs/store/contacts.ts";
import type { Claim, Contacts } from "#/types.d.ts";
import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { closeModalOutsideBox } from "#/libs/closeModalOutsideBox.ts";
import ClaimsTable from "./ClaimsTable";

const ManageContacts = () => {
    const modalContact = useSignal<Contacts | null>(null);
    const radioContactId = useSignal<number | null>(null);

    const modal = useRef<HTMLDialogElement>(null);

    const placeholderAllReceivablesForSelectedContact: Claim[] = [{
        id: 1,
        transaction_id: 3,
        contact_id: 2,
        name: "Friend B",
        date: "2026-11-24T17:49:59.368Z",
        description: "Purchase Gold (2)",
        value: -4312256.0,
    }];

    return (
        <>
            <h3>Manage Contacts</h3>
            <form>
                {unarchivedContacts.value.map((contact) => {
                    return (
                        <div key={contact.id}>
                            <label
                                htmlFor={`edit_contact_id_${contact.id}_element`}
                            >
                                <input
                                    type="radio"
                                    name={`edit_contact_id_${contact.id}`}
                                    id={`edit_contact_id_${contact.id}_element`}
                                    value={contact.id}
                                    checked={radioContactId.value ===
                                        contact.id}
                                    onChange={() =>
                                        radioContactId.value = contact.id}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        modalContact.value = contact;
                                        modal.current?.showModal();
                                    }}
                                >
                                    &#9998;
                                </button>
                                {contact.name}
                            </label>
                            {radioContactId.value === contact.id && (
                                <div>
                                    <ClaimsTable
                                        caption="Receivables"
                                        claims={placeholderAllReceivablesForSelectedContact}
                                        contact={contact}
                                    />

                                    <ClaimsTable
                                        caption="Debts"
                                        claims={placeholderAllReceivablesForSelectedContact}
                                        contact={contact}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </form>

            <dialog
                ref={modal}
                onClose={() => {
                    modalContact.value = null;
                }}
                onClick={(e) => closeModalOutsideBox(e, modal)}
            >
                Hello World
            </dialog>
        </>
    );
};

export default ManageContacts;
