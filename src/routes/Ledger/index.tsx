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
    allCategories,
    refetchAllCategories,
} from "#/libs/store/categories.ts";
import { allAccounts, refetchAllAccounts } from "#/libs/store/accounts.ts";
import {
    refetchUnarchivedContacts,
    unarchivedContacts,
} from "#/libs/store/contacts.ts";
import {
    refetchUnarchivedFundTypes,
    unarchivedFundTypes,
} from "#/libs/store/fundType.ts";
import { dateToMonthYear } from "#/libs/dateToMonthYear.ts";
import { offsetMonthYear } from "#/libs/offsetMonthYear.ts";
import {
    refetchTransactionsAtMonth,
    transactionsAtMonth,
} from "#/libs/store/transactions.ts";
import type { AccountChange, TransactionByTime } from "#/types.d.ts";
import { accountsInTransactions } from "#/libs/accountsInTransactions.ts";
import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";

const RECEIVABLE_ACCOUNT_ID = 1;
const DEBT_ACCOUNT_ID = 2;
const INVESTMENT_ACCOUNT_ID = 3;

const Ledger = () => {
    const accountChanges = useSignal<AccountEntry[]>([{
        accountId: 1,
        value: "",
        sign: false,
    }]);

    const contactRequired = useComputed(() => {
        return accountChanges.value.some((change) =>
            change.accountId === RECEIVABLE_ACCOUNT_ID ||
            change.accountId === DEBT_ACCOUNT_ID
        );
    });

    const selectedDate = useSignal(dateToMonthYear(new Date()));

    const transactionsGroupedByTime = useComputed<TransactionByTime[]>(() => {
        return transactionsAtMonth.value.reduce<TransactionByTime[]>(
            (acc, curr) => {
                const existingGroup = acc.find((item) =>
                    item.date === curr.date
                );

                const change: AccountChange & { transactionId: number } = {
                    accountId: curr.account_id,
                    value: curr.value,
                    transactionId: curr.id,
                };

                if (existingGroup) {
                    existingGroup.changes.push(change);
                } else {
                    acc.push({
                        category: curr.category_id,
                        description: curr.description,
                        date: curr.date,
                        changes: [change],
                    });
                }

                return acc;
            },
            [],
        );
    });

    useEffect(() => {
        refetchAllCategories();
        refetchAllAccounts();
        refetchUnarchivedContacts();
        refetchUnarchivedFundTypes();
    }, []);

    useEffect(() => {
        const split = selectedDate.value.split("-");
        const year = Number(split[0]);
        const month = Number(split[1]);
        refetchTransactionsAtMonth(month, year);
    }, [selectedDate.value]);

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
                        {allCategories.value.map((category) => {
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
                        {allAccounts.value.map((account) => {
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
                        {unarchivedFundTypes.value.map((fund_type) => {
                            return <li key={fund_type.id}>{fund_type.name}</li>;
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
                    <button
                        type="button"
                        onClick={() => {
                            selectedDate.value = offsetMonthYear.decrement(
                                selectedDate.value,
                            );
                        }}
                    >
                        &#8592;
                    </button>
                    <input
                        type="month"
                        name="month-picker"
                        id="month-picker-element"
                        value={selectedDate.value}
                        onChange={(e) => {
                            selectedDate.value = e.currentTarget.value;
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            selectedDate.value = offsetMonthYear.increment(
                                selectedDate.value,
                            );
                        }}
                    >
                        &#8594;
                    </button>

                    {transactionsAtMonth.value.length === 0
                        ? <h3>No transaction at this month and year.</h3>
                        : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>{" "}
                                        {/* Iterate through all unarchived accounts + archived accounts that is inside the transactions array */}
                                        {accountsInTransactions(
                                            transactionsAtMonth.value,
                                            allAccounts.value,
                                        ).map(
                                            (account) => {
                                                return account.id > 3
                                                    ? (
                                                        <th key={account.id}>
                                                            {account.name}
                                                        </th>
                                                    )
                                                    : void 0;
                                            },
                                        )}
                                        <th>Investment</th>
                                        <th>Receivable</th>
                                        <th>Debt</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionsGroupedByTime.value.map((
                                        transaction,
                                    ) => {
                                        const receivableChange = transaction
                                            .changes
                                            .find((change) =>
                                                change.accountId ===
                                                    RECEIVABLE_ACCOUNT_ID
                                            );
                                        const debtChange = transaction.changes
                                            .find((change) =>
                                                change.accountId ===
                                                    DEBT_ACCOUNT_ID
                                            );
                                        const investmentChange = transaction
                                            .changes
                                            .find((change) =>
                                                change.accountId ===
                                                    INVESTMENT_ACCOUNT_ID
                                            );
                                        return (
                                            <tr key={transaction.date}>
                                                <td>
                                                    {formatIsoToDayMonth(
                                                        transaction.date,
                                                    )}
                                                </td>
                                                {/* Prints out value or a padding <td> if no value exist in that account */}
                                                {/* Except system accounts */}
                                                {accountsInTransactions(
                                                    transactionsAtMonth.value,
                                                    allAccounts.value,
                                                ).map((account) => {
                                                    return account.id <= 3
                                                        ? void 0
                                                        : (
                                                            <td
                                                                key={account.id}
                                                            >
                                                                {transaction
                                                                    .changes
                                                                    .find((
                                                                        change,
                                                                    ) => change
                                                                        .accountId ===
                                                                        account
                                                                            .id
                                                                    )?.value}
                                                            </td>
                                                        );
                                                })}
                                                <td>
                                                    {investmentChange &&
                                                        investmentChange.value}
                                                </td>
                                                <td>
                                                    {receivableChange &&
                                                        receivableChange.value}
                                                </td>
                                                <td>
                                                    {debtChange &&
                                                        debtChange.value}
                                                </td>
                                                <td>
                                                    {allCategories.value
                                                        .find((category) =>
                                                            category.id ===
                                                                transaction
                                                                    .category
                                                        )?.name}
                                                </td>
                                                <td>
                                                    {transaction.description}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    <GenericForm
                        options={{
                            formName: "transaction",
                            onSubmit: handleSubmit,
                            onReset: () => resetAccounts(accountChanges),
                        }}
                    >
                        <input
                            type="hidden"
                            name="selected_date"
                            value={selectedDate.value}
                        />
                        <label htmlFor="transaction_category_element">
                            Category
                            <select
                                name="transaction_category"
                                id="transaction_category_element"
                            >
                                {allCategories.value.map((category) => {
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
                                        {allAccounts.value.map(
                                            (account) => {
                                                const alreadyExist =
                                                    accountChanges.value.some(
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
