import { accountsQuery, allAccounts } from "#/libs/store/accounts.ts";
import type { AccountBalance } from "#/types.d.ts";
import { useComputed, useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import handleSubmit from "#view/Ledger/handleSubmit.ts";
import { ACCOUNT } from "#/libs/systemsId.ts";
import { unarchivedContacts } from "#/libs/store/contacts.ts";
import { closeModalOutsideBox } from "#/libs/closeModalOutsideBox.ts";

const ManageAccounts = () => {
  const modal = useRef<HTMLDialogElement>(null);
  const editForm = useRef<HTMLFormElement>(null);
  const deleteForm = useRef<HTMLFormElement>(null);

  const selectedSourceAccount = useSignal<AccountBalance | null>(null);
  const destinationAccountId = useSignal<number | null>(null);

  const hasBalance = useComputed(() =>
    (selectedSourceAccount.value?.balance ?? 0) !== 0
  );

  const validDestinationAccounts = useComputed(() =>
    allAccounts.value.filter((account) =>
      !account.archived &&
      account.id !== ACCOUNT.INVESTMENT &&
      account.id !== selectedSourceAccount.value?.id
    )
  );

  const needContact = useComputed(() =>
    hasBalance.value &&
    (destinationAccountId.value === ACCOUNT.DEBT ||
      destinationAccountId.value === ACCOUNT.RECEIVABLE)
  );

  return (
    <section>
      <h3>Manage Accounts</h3>
      <ul>
        {allAccounts.value
          .filter((account) => !account.is_system && !account.archived)
          .map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={async () => {
                  const fetched = await accountsQuery
                    .get
                    .one(account.id);
                  selectedSourceAccount.value = fetched;
                  destinationAccountId.value =
                    validDestinationAccounts.value[0]?.id ??
                      null;
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
          editForm.current?.reset();
          deleteForm.current?.reset();
          selectedSourceAccount.value = null;
          destinationAccountId.value = null;
        }}
        onClick={(e) => closeModalOutsideBox(e, modal)}
      >
        <form
          ref={editForm}
          data-form-type="edit_account"
          onSubmit={handleSubmit}
        >
          <h4>Edit Account</h4>

          <label htmlFor="edit_account_account_id_element">
            ID{" "}
            <input
              type="number"
              readOnly
              value={selectedSourceAccount.value?.id}
              name="edit_account_account_id"
              id="edit_account_account_id_element"
            />
          </label>

          <input
            type="hidden"
            value={selectedSourceAccount.value?.name}
            name="edit_account_account_name"
          />

          <label htmlFor="edit_account_new_name_element">
            Name{" "}
            <input
              type="text"
              name="edit_account_new_name"
              id="edit_account_new_name_element"
              placeholder={selectedSourceAccount.value?.name}
            />
          </label>

          <input
            type="hidden"
            value={selectedSourceAccount.value?.color}
            name="edit_account_account_color"
          />

          <label htmlFor="edit_account_new_color_element">
            Color{" "}
            <input
              type="color"
              name="edit_account_new_color"
              id="edit_account_new_color_element"
              defaultValue={selectedSourceAccount.value?.color}
            />
          </label>

          <button type="submit">Save</button>
        </form>

        <hr />

        <form
          ref={deleteForm}
          data-form-type="delete_account"
          onSubmit={handleSubmit}
        >
          <h4>Close Account</h4>

          <input
            type="hidden"
            value={selectedSourceAccount.value?.id}
            name="delete_account_id"
          />

          {hasBalance.value && (
            <>
              <p>
                Remaining balance (
                {selectedSourceAccount.value?.balance}) will be transferred
                before closing.
              </p>

              <label htmlFor="delete_account_destination_element">
                Destination Account{" "}
                <select
                  required
                  name="delete_account_destination_account"
                  id="delete_account_destination_element"
                  value={destinationAccountId.value ?? ""}
                  onChange={(e) => {
                    destinationAccountId.value = Number(
                      e.currentTarget.value,
                    );
                  }}
                >
                  {validDestinationAccounts.value.map(
                    (account) => (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {account.name}
                      </option>
                    ),
                  )}
                </select>
              </label>

              {needContact.value && (
                <label htmlFor="delete_account_contact_element">
                  Contact{" "}
                  <select
                    required
                    name="delete_account_contact"
                    id="delete_account_contact_element"
                  >
                    {unarchivedContacts.value.map(
                      (contact) => (
                        <option
                          key={contact.id}
                          value={contact.id}
                        >
                          {contact.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              )}
            </>
          )}

          <button type="submit">Close Account</button>
        </form>

        <hr />

        <button
          type="button"
          onClick={() => modal.current?.close()}
        >
          Cancel
        </button>
      </dialog>
    </section>
  );
};

export default ManageAccounts;
