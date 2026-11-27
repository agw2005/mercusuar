import { allClaims, unarchivedContacts } from "#/libs/store/contacts.ts";
import type { Contacts } from "#/types.d.ts";
import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { closeModalOutsideBox } from "#/libs/closeModalOutsideBox.ts";
import ClaimsTable from "./ClaimsTable";

const ManageContacts = () => {
    const modalContact = useSignal<Contacts | null>(null);
    const checkboxContacts = useSignal<number[]>([]);

    const modal = useRef<HTMLDialogElement>(null);
    return (
        <>
            <h3>Manage Contacts</h3>
            <form>
                {unarchivedContacts.value.map((contact) => {
                    const isChecked = checkboxContacts.value.includes(
                        contact.id,
                    );

                    return (
                        <div key={contact.id}>
                            <label
                                htmlFor={`edit_contact_id_${contact.id}_element`}
                            >
                                <input
                                    type="checkbox"
                                    name={`edit_contact_id`}
                                    id={`edit_contact_id_${contact.id}_element`}
                                    value={contact.id}
                                    checked={isChecked}
                                    onChange={(e) => {
                                        if (e.currentTarget.checked) {
                                            if (
                                                !checkboxContacts.value
                                                    .includes(contact.id)
                                            ) {
                                                checkboxContacts.value = [
                                                    ...checkboxContacts.value,
                                                    contact.id,
                                                ];
                                            }
                                        } else {
                                            checkboxContacts.value =
                                                checkboxContacts.value.filter(
                                                    (id) => id !== contact.id,
                                                );
                                        }
                                    }}
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
                            {isChecked && (
                                <ClaimsTable
                                    claims={allClaims.value}
                                    contact={contact}
                                />
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
