import { useComputed, useSignal } from "@preact/signals";
import { placeholder } from "#/libs/placeholder.ts";
import GenericForm from "#/components/GenericForm.tsx";
import {
    AccountEntry,
    addAccount,
    removeAccount,
    resetAccounts,
    updateEntry,
} from "#view/Ledger/transactionAccountEntries.ts";
import handleSubmit from "#view/Ledger/handleSubmit.ts";
import { useEffect } from "preact/hooks";
import {
    refetchUnarchivedCategories,
    unarchivedCategories,
} from "#/libs/store/categories.ts";
import {
    refetchUnarchivedAccounts,
    unarchivedAccounts,
} from "#/libs/store/accounts.ts";
import {
    refetchUnarchivedContacts,
    unarchivedContacts,
} from "#/libs/store/contacts.ts";

const Ledger = () => {
    const accountChanges = useSignal<AccountEntry[]>([{
        accountId: 0,
        value: "",
        sign: false,
    }]);

    const contactRequired = useComputed(() => {
        return accountChanges.value.some((change) =>
            change.accountId === 0 || change.accountId === 1
        );
    });

    useEffect(() => {
        refetchUnarchivedCategories();
        refetchUnarchivedAccounts();
        refetchUnarchivedContacts();
    }, []);

    return (
        <>
            <header>
                <h1>Ledger</h1>
                <a href="/">Home</a>
                <a href="/habit">Habit</a>
                <a href="/health">Health</a>
            </header>
            <main>
                <section>
                    <h2>Categories</h2>
                    <ul>
                        {unarchivedCategories.value.map((category) => {
                            return <li key={category.id}>{category.name}</li>;
                        })}
                    </ul>
                    <GenericForm
                        options={{
                            formName: "category",
                            onSubmit: handleSubmit,
                        }}
                    >
                        <label htmlFor="category_name_element">
                            Name
                            <input
                                type="text"
                                name="category_name"
                                id="category_name_element"
                            />
                        </label>
                    </GenericForm>
                </section>
                <section>
                    <h2>Accounts</h2>
                    <ul>
                        {unarchivedAccounts.value.map((account) => {
                            return <li key={account.id}>{account.name}</li>;
                        })}
                    </ul>
                    <GenericForm
                        options={{
                            formName: "account",
                            onSubmit: handleSubmit,
                        }}
                    >
                        <label htmlFor="account_name_element">
                            Name
                            <input
                                type="text"
                                name="account_name"
                                id="account_name_element"
                            />
                        </label>
                    </GenericForm>
                </section>
                <section>
                    <h2>Contacts</h2>
                    <ul>
                        {unarchivedContacts.value.map((contact) => {
                            return <li key={contact.id}>{contact.name}</li>;
                        })}
                    </ul>
                    <GenericForm
                        options={{
                            formName: "contact",
                            onSubmit: handleSubmit,
                        }}
                    >
                        <label htmlFor="contact_name_element">
                            Name
                            <input
                                type="text"
                                name="contact_name"
                                id="contact_name_element"
                            />
                        </label>
                    </GenericForm>
                </section>
                <section>
                    <h2>Fund Types</h2>
                    <ul>
                        {placeholder.fund_types.map((fund_type, i) => {
                            return <li key={i}>{fund_type}</li>;
                        })}
                    </ul>
                    <GenericForm
                        options={{
                            formName: "fund_type",
                            onSubmit: handleSubmit,
                        }}
                    >
                        <label htmlFor="fund_type_name_element">
                            Name
                            <input
                                type="text"
                                name="fund_type_name"
                                id="fund_type_name_element"
                            />
                        </label>
                    </GenericForm>
                </section>
                <section>
                    <h2>Transactions</h2>
                    <GenericForm
                        options={{
                            formName: "transaction",
                            onSubmit: handleSubmit,
                            onReset: () => resetAccounts(accountChanges),
                        }}
                    >
                        <label htmlFor="transaction_category_element">
                            Category
                            <select
                                name="transaction_category"
                                id="transaction_category_element"
                            >
                                {placeholder.categories.map((category, i) => {
                                    return (
                                        <option key={i} value={i}>
                                            {category}
                                        </option>
                                    );
                                })}
                            </select>
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
                                            updateEntry(
                                                accountChanges,
                                                rowIndex,
                                                {
                                                    accountId: Number(
                                                        e.currentTarget.value,
                                                    ),
                                                },
                                            )}
                                    >
                                        {placeholder.accounts.map(
                                            (account, accountIdx) => {
                                                const alreadyExist =
                                                    accountChanges.value.some(
                                                        (other, otherIdx) =>
                                                            otherIdx !==
                                                                rowIndex &&
                                                            other.accountId ===
                                                                accountIdx,
                                                    );

                                                if (alreadyExist) {
                                                    return null;
                                                }

                                                return (
                                                    <option
                                                        key={accountIdx}
                                                        value={accountIdx}
                                                    >
                                                        {account}
                                                    </option>
                                                );
                                            },
                                        )}
                                    </select>
                                </label>

                                <input
                                    type="hidden"
                                    name="transaction_value_sign"
                                    id={`transaction_value_sign_element_${rowIndex}`}
                                    value={Number(entry.sign)}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateEntry(
                                            accountChanges,
                                            rowIndex,
                                            { sign: !entry.sign },
                                        )}
                                >
                                    {entry.sign ? "-" : "+"}
                                </button>

                                <label
                                    htmlFor={`transaction_value_element_${rowIndex}`}
                                >
                                    Value
                                    <input
                                        type="number"
                                        step="any"
                                        name="transaction_value"
                                        id={`transaction_value_element_${rowIndex}`}
                                        value={entry.value}
                                        onInput={(e) =>
                                            updateEntry(
                                                accountChanges,
                                                rowIndex,
                                                {
                                                    value:
                                                        e.currentTarget.value,
                                                },
                                            )}
                                    />
                                </label>

                                {accountChanges.value.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeAccount(
                                                accountChanges,
                                                rowIndex,
                                            )}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}

                        {accountChanges.value.length <
                                placeholder.accounts.length && (
                            <button
                                type="button"
                                onClick={() => {
                                    addAccount(accountChanges);
                                }}
                            >
                                Add affected account
                            </button>
                        )}

                        {contactRequired.value &&
                            (
                                <label htmlFor="transaction_contact_element">
                                    Contact
                                    <select
                                        name="transaction_contact"
                                        id="transaction_contact_element"
                                    >
                                        {placeholder.contacts.map((
                                            contact,
                                            i,
                                        ) => (
                                            <option key={i} value={i}>
                                                {contact}
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
                                type="datetime-local"
                                name="transaction_date"
                                id="transaction_date_element"
                                step="1"
                            />
                        </label>
                    </GenericForm>
                </section>
                <section>
                    <h2>Investments</h2>
                    <GenericForm
                        options={{
                            formName: "investment",
                            onSubmit: handleSubmit,
                        }}
                    >
                        <label htmlFor="investment_fund_type_element">
                            Fund Type
                            <select
                                name="investment_fund_type"
                                id="investment_fund_type_element"
                            >
                                {placeholder.fund_types.map((fund_type, i) => {
                                    return (
                                        <option key={i} value={i}>
                                            {fund_type}
                                        </option>
                                    );
                                })}
                            </select>
                        </label>
                        <label htmlFor="investment_name_element">
                            Name
                            <input
                                type="text"
                                name="investment_name"
                                id="investment_name_element"
                            />
                        </label>
                        <label htmlFor="investment_unit_element">
                            Unit
                            <input
                                type="text"
                                name="investment_unit"
                                id="investment_unit_element"
                            />
                        </label>
                        <label htmlFor="investment_quantity_element">
                            Quantity
                            <input
                                type="number"
                                name="investment_quantity"
                                id="investment_quantity_element"
                                step="any"
                            />
                        </label>
                        <label htmlFor="investment_ask_element">
                            Ask
                            <input
                                type="number"
                                name="investment_ask"
                                id="investment_ask_element"
                                step="any"
                            />
                        </label>
                    </GenericForm>
                </section>
            </main>
        </>
    );
};

export default Ledger;
