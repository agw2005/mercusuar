import type { RefObject } from "preact";
import { closeModalOutsideBox } from "#/libs/closeModalOutsideBox.ts";
import type { TransactionByTime } from "#/types.d.ts";
import { allCategories } from "#/libs/store/categories.ts";
import { allAccounts } from "#/libs/store/accounts.ts";
import { allClaims, unarchivedContacts } from "#/libs/store/contacts.ts";
import { ACCOUNT } from "#/libs/systemsId.ts";
import handleSubmit from "#view/Ledger/handleSubmit.ts";
import { isoToDateTimeInput } from "#/libs/isoToDateTimeInput.ts";

interface EditModalProps {
    modalRef: RefObject<HTMLDialogElement>;
    transaction: TransactionByTime | null;
    onClose: () => void;
}

const EditModal = ({ modalRef, transaction, onClose }: EditModalProps) => {
    const needsContact = transaction?.changes.some(
        (c) =>
            c.accountId === ACCOUNT.DEBT ||
            c.accountId === ACCOUNT.RECEIVABLE,
    ) ?? false;

    const existingContactId = needsContact && transaction
        ? allClaims.value.find((claim) =>
            transaction.changes.some(
                (c) => c.transactionId === claim.transaction_id,
            )
        )?.contact_id
        : undefined;

    return (
        <dialog
            ref={modalRef}
            onClose={onClose}
            onClick={(e) => closeModalOutsideBox(e, modalRef)}
        >
            {transaction && (
                <>
                    <form
                        key={`edit-${transaction.date}`}
                        data-form-type="edit_transaction"
                        onSubmit={handleSubmit}
                    >
                        <h4>Edit Transaction</h4>

                        <input
                            type="hidden"
                            name="edit_tx_date"
                            value={transaction.date}
                        />

                        <label htmlFor="edit_tx_datetime_display">
                            Date{" "}
                            <input
                                type="datetime-local"
                                step="1"
                                id="edit_tx_datetime_display"
                                value={isoToDateTimeInput(
                                    new Date(transaction.date),
                                )}
                                readOnly
                            />
                        </label>

                        <label htmlFor="edit_tx_category">
                            Category{" "}
                            <select
                                required
                                name="edit_tx_category"
                                id="edit_tx_category"
                                defaultValue={transaction.category}
                            >
                                {allCategories.value
                                    .filter((c) =>
                                        !c.is_system &&
                                        (!c.archived ||
                                            c.id === transaction.category)
                                    )
                                    .map((c) => (
                                        <option
                                            key={c.id}
                                            value={c.id}
                                            selected={c.id ===
                                                transaction.category}
                                        >
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                        </label>

                        <p>
                            If the equity change is 0, the category will be
                            "Transfer" automatically.
                        </p>

                        <fieldset>
                            <legend>Account Changes</legend>
                            {transaction.changes.map((change) => {
                                const accountName = allAccounts.value.find(
                                    (a) => a.id === change.accountId,
                                )?.name ?? `Account #${change.accountId}`;

                                return (
                                    <div key={change.transactionId}>
                                        <input
                                            type="hidden"
                                            name="edit_tx_id"
                                            value={change.transactionId}
                                        />
                                        <input
                                            type="hidden"
                                            name="edit_tx_account_id"
                                            value={change.accountId}
                                        />
                                        <label
                                            htmlFor={`edit_tx_val_${change.transactionId}`}
                                        >
                                            {accountName}{" "}
                                            <input
                                                required
                                                type="number"
                                                step="any"
                                                name="edit_tx_value"
                                                id={`edit_tx_val_${change.transactionId}`}
                                                defaultValue={change.value}
                                            />
                                        </label>
                                    </div>
                                );
                            })}
                        </fieldset>

                        {needsContact && (
                            <label htmlFor="edit_tx_contact">
                                Contact{" "}
                                <select
                                    required
                                    name="edit_tx_contact"
                                    id="edit_tx_contact"
                                    defaultValue={existingContactId !==
                                            undefined
                                        ? String(existingContactId)
                                        : undefined}
                                >
                                    {unarchivedContacts.value.map((contact) => (
                                        <option
                                            key={contact.id}
                                            value={contact.id}
                                        >
                                            {contact.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        <label htmlFor="edit_tx_description">
                            Description{" "}
                            <textarea
                                name="edit_tx_description"
                                id="edit_tx_description"
                                defaultValue={transaction.description}
                            />
                        </label>

                        <button type="submit">Save Changes</button>
                    </form>

                    <hr />

                    <form
                        key={`delete-${transaction.date}`}
                        data-form-type="delete_transaction"
                        onSubmit={handleSubmit}
                    >
                        <h4>Delete Transaction</h4>

                        <input
                            type="hidden"
                            name="delete_tx_date"
                            value={transaction.date}
                        />

                        {transaction.changes.map((change) => (
                            <input
                                key={change.transactionId}
                                type="hidden"
                                name="delete_tx_id"
                                value={change.transactionId}
                            />
                        ))}

                        <button type="submit">Delete Transaction</button>
                    </form>

                    <hr />

                    <button
                        type="button"
                        onClick={() => modalRef.current?.close()}
                    >
                        Cancel
                    </button>
                </>
            )}
        </dialog>
    );
};

export default EditModal;
