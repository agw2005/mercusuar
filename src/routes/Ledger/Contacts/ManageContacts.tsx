import { allClaims, unarchivedContacts } from "#/libs/store/contacts.ts";
import type { Contacts } from "#/types.d.ts";
import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { closeModalOutsideBox } from "#/libs/closeModalOutsideBox.ts";
import ClaimsTable from "./ClaimsTable";
import handleSubmit from "#view/Ledger/handleSubmit.ts";

const ManageContacts = () => {
    const modalContact = useSignal<Contacts | null>(null);
    const checkboxContacts = useSignal<number[]>([]);

    const modal = useRef<HTMLDialogElement>(null);
    const editForm = useRef<HTMLFormElement>(null);

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
                onClose={() => modalContact.value = null}
                onClick={(e) => closeModalOutsideBox(e, modal)}
            >
                <form
                    ref={editForm}
                    data-form-type="edit_contact"
                    onSubmit={handleSubmit}
                >
                    <h4>Edit Contact</h4>

                    <label htmlFor="edit_contact_contact_id_element">
                        ID{" "}
                        <input
                            type="number"
                            readOnly
                            value={modalContact.value?.id}
                            name="edit_contact_contact_id"
                            id="edit_contact_contact_id_element"
                        />
                    </label>

                    <input
                        type="hidden"
                        value={modalContact.value?.name}
                        name="edit_contact_contact_name"
                    />

                    <label htmlFor="edit_contact_new_name_element">
                        Name{" "}
                        <input
                            type="text"
                            name="edit_contact_new_name"
                            id="edit_contact_new_name_element"
                            placeholder={modalContact.value?.name}
                        />
                    </label>

                    <input
                        type="hidden"
                        value={modalContact.value?.color}
                        name="edit_contact_contact_color"
                    />

                    <label htmlFor="edit_contact_new_color_element">
                        Color{" "}
                        <input
                            type="color"
                            name="edit_contact_new_color"
                            id="edit_contact_new_color_element"
                            defaultValue={modalContact.value?.color}
                        />
                    </label>

                    <button type="submit">Save</button>
                </form>

                <hr />

                <button
                    type="button"
                    onClick={() => modal.current?.close()}
                >
                    Cancel
                </button>
            </dialog>
        </>
    );
};

export default ManageContacts;
