import handleSubmit from "#view/Ledger/handleSubmit.ts";
import GenericForm from "#/components/GenericForm.tsx";
import {
  accountChanges,
  requireContact,
  setChanges,
  totalChange,
} from "./accountEntries.ts";
import { allCategories } from "#/libs/store/categories.ts";
import { allAccounts } from "#/libs/store/accounts.ts";
import { ACCOUNT } from "#/libs/systemsId.ts";
import { unarchivedContacts } from "#/libs/store/contacts.ts";
import { selectedDate } from "#view/Ledger/selectedDate.ts";
import { isoToDateTimeInput } from "#/libs/isoToDateTimeInput.ts";

const NewTransactions = () => {
  return (
    <section>
      <h3>New Transaction</h3>
      <GenericForm
        options={{
          formName: "transaction",
          onSubmit: handleSubmit,
          onReset: () => setChanges.resetAccounts(accountChanges),
        }}
      >
        <label htmlFor="transaction_category_element">
          Category
          <select
            name="transaction_category"
            id="transaction_category_element"
          >
            {allCategories.value
              .filter((category) => !category.archived)
              .map((category) => {
                if (category.is_system) return void 0;
                return (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                );
              })}
          </select>
          if the equity change is 0, the category will be "Transfer"
          automatically.
        </label>
        {accountChanges.value.map((entry, rowIndex) => (
          <div key={rowIndex}>
            <label
              htmlFor={`transaction_account_element_${rowIndex}`}
            >
              Account {rowIndex + 1}
              <select
                name="transaction_account"
                id={`transaction_account_element_${rowIndex}`}
                value={entry.accountId}
                onChange={(e) =>
                  setChanges.updateEntry(
                    accountChanges,
                    rowIndex,
                    {
                      accountId: Number(
                        e.currentTarget.value,
                      ),
                    },
                  )}
              >
                {allAccounts.value
                  .filter((a) =>
                    a.id !== ACCOUNT.INVESTMENT &&
                    !a.archived
                  )
                  .map(
                    (account) => {
                      const alreadyExist = accountChanges
                        .value.some(
                          (other) =>
                            account.id !==
                              entry
                                .accountId &&
                            other.accountId ===
                              account.id,
                        );
                      if (alreadyExist) {
                        return null;
                      }
                      return (
                        <option
                          key={account.id}
                          value={account.id}
                        >
                          {account.name}
                        </option>
                      );
                    },
                  )}
              </select>
            </label>
            <label
              htmlFor={`transaction_value_element_${rowIndex}`}
            >
              Value
              <input
                required
                type="number"
                step="any"
                min={Number.MIN_VALUE}
                name="transaction_value"
                id={`transaction_value_element_${rowIndex}`}
                value={entry.value}
                onInput={(e) =>
                  setChanges.updateEntry(
                    accountChanges,
                    rowIndex,
                    {
                      value: e.currentTarget.value,
                    },
                  )}
              />
            </label>
            {accountChanges.value.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setChanges.removeAccount(
                    accountChanges,
                    rowIndex,
                  )}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {accountChanges.value.length === 0 && (
          <button
            type="button"
            onClick={() => {
              setChanges.addAccount(accountChanges);
            }}
          >
            Add affected account
          </button>
        )}
        {requireContact.value &&
          (
            <label htmlFor="transaction_contact_element">
              Contact
              <select
                name="transaction_contact"
                id="transaction_contact_element"
              >
                {unarchivedContacts.value.map((
                  contact,
                ) => (
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
        <label htmlFor="transaction_description_element">
          Description
          <textarea
            name="transaction_description"
            id="transaction_description_element"
          >
          </textarea>
        </label>
        <label htmlFor="transaction_date_element">
          Date
          <input
            required
            defaultValue={isoToDateTimeInput(new Date())}
            type="datetime-local"
            name="transaction_date"
            id="transaction_date_element"
            step="1"
          />
        </label>

        {/* For refetch after submission */}
        <input
          type="hidden"
          name="selected_date"
          value={selectedDate.value}
        />

        {/* For flipping category to "Transfer" if total equity doesn't change */}
        <input
          type="hidden"
          name="transaction_equity_change"
          value={totalChange.value}
        />
        <p>{totalChange.value}</p>
      </GenericForm>
    </section>
  );
};

export default NewTransactions;
