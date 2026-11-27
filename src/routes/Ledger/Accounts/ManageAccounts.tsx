import { allAccounts } from "#/libs/store/accounts.ts";
import type { Accounts } from "#/types.d.ts";
import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import handleSubmit from "#view/Ledger/handleSubmit.ts";

const ManageAccounts = () => {
    const modal = useRef<HTMLDialogElement>(null);
    const form = useRef<HTMLFormElement>(null);
    const selectedAccount = useSignal<Accounts | null>(null);

    return (
        <>
            <h3>Manage Accounts</h3>
            <ul>
                {allAccounts.value
                    .filter((account) =>
                        !account.is_system && !account.archived
                    )
                    .map((account) => (
                        <li key={account.id}>
                            <button
                                type="button"
                                onClick={() => {
                                    selectedAccount.value = account;
                                    modal.current?.showModal();
                                }}
                            >
                                &#9998;
                            </button>
                            {account.name}
                        </li>
                    ))}
            </ul>

            <dialog
                ref={modal}
                onClose={() => {
                    form.current?.reset();
                    selectedAccount.value = null;
                }}
                onClick={(e) => {
                    if (!modal.current) return;
                    const modalDimensions = modal
                        .current
                        .getBoundingClientRect();
                    if (
                        e.clientX < modalDimensions.left ||
                        e.clientX > modalDimensions.right ||
                        e.clientY < modalDimensions.top ||
                        e.clientY > modalDimensions.bottom
                    ) {
                        modal.current.close();
                    }
                }}
            >
                <form
                    ref={form}
                    data-form-type="edit_account"
                    onSubmit={handleSubmit}
                >
                    <label htmlFor="edit_account_account_id_element">
                        ID{" "}
                        <input
                            type="number"
                            readOnly
                            value={selectedAccount.value?.id}
                            placeholder={String(selectedAccount.value?.id)}
                            name="edit_account_account_id"
                            id="edit_account_account_id_element"
                        />
                    </label>

                    <input
                        type="hidden"
                        value={selectedAccount.value?.name}
                        name="edit_account_account_name"
                    />

                    <label htmlFor="edit_account_new_name_element">
                        Name{" "}
                        <input
                            type="text"
                            name="edit_account_new_name"
                            id="edit_account_new_name_element"
                            placeholder={selectedAccount.value?.name}
                        />
                    </label>

                    <input
                        type="hidden"
                        value={selectedAccount.value?.color}
                        name="edit_account_account_color"
                    />

                    <label htmlFor="edit_account_new_color_element">
                        Color{" "}
                        <input
                            type="color"
                            name="edit_account_new_color"
                            id="edit_account_new_color_element"
                            defaultValue={selectedAccount.value?.color}
                        />
                    </label>

                    <button
                        type="submit"
                        formMethod="dialog"
                        formNoValidate
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        name="edit_account_save"
                        value="true"
                    >
                        Save
                    </button>
                    <button
                        type="submit"
                        name="edit_account_save"
                        value=""
                        formNoValidate
                    >
                        Delete
                    </button>
                </form>
            </dialog>
        </>
    );
};

export default ManageAccounts;
