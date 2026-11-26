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
import {
    allAccounts,
    balances,
    refetchAllAccounts,
    refetchBalances,
} from "#/libs/store/accounts.ts";
import {
    refetchUnarchivedContacts,
    unarchivedContacts,
} from "#/libs/store/contacts.ts";
import {
    refetchUnarchivedFundTypes,
    unarchivedFundTypes,
} from "#/libs/store/fundType.ts";
import { dateToYearMonth } from "#/libs/dateToMonthYear.ts";
import { offsetMonthYear } from "#/libs/offsetMonthYear.ts";
import {
    refetchTransactionsAtMonth,
    transactionsAtMonth,
} from "#/libs/store/transactions.ts";
import type {
    AccountChange,
    Investment_Lots,
    Investments,
    TransactionByTime,
} from "#/types.d.ts";
import { accountsInTransactions } from "#/libs/accountsInTransactions.ts";
import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";
import {
    refetchInvestments,
    unarchivedInvestments,
} from "#/libs/store/investments.ts";
import {
    allHeldLots,
    refetchInvestmentLots,
} from "#/libs/store/investmentLots.ts";
import Layout from "#/components/Layout.tsx";
import Categories from "./Categories/Categories";
import Accounts from "./Accounts/Accounts";
import Contacts from "./Contacts/Contacts";
import FundTypes from "./FundTypes/FundTypes";

const RECEIVABLE_ACCOUNT_ID = 1;
const DEBT_ACCOUNT_ID = 2;
const INVESTMENT_ACCOUNT_ID = 3;

const Ledger = () => {
    const accountChanges = useSignal<AccountEntry[]>([{
        accountId: 1,
        value: "",
    }]);

    const selectedDate = useSignal(dateToYearMonth(new Date()));
    const newLotSelectedAssetId = useSignal<number | null>(null);
    const selectedAccountId = useSignal<number | null>(null);
    const existingLotSelectedAssetId = useSignal<number | null>(null);
    const existingLotSelectedLotId = useSignal<number | null>(null);

    const newLotselectedAsset = useComputed<Investments | null>(() => {
        const id = newLotSelectedAssetId.value;
        if (!id) return null;
        return unarchivedInvestments.value.find((asset) => asset.id === id) ||
            null;
    });

    const existingLotSelectedAsset = useComputed<Investment_Lots | null>(() => {
        const id = existingLotSelectedAssetId.value;
        if (!id) return null;
        return allHeldLots.value.find((l) => l.id === id) ||
            null;
    });

    const entriesRequireContact = useComputed(() => {
        return accountChanges.value.some((change) =>
            change.accountId === RECEIVABLE_ACCOUNT_ID ||
            change.accountId === DEBT_ACCOUNT_ID
        );
    });

    const totalChange = useComputed<number>(() => {
        return accountChanges.value.reduce((acc, curr) => {
            if (curr.accountId === DEBT_ACCOUNT_ID) {
                return acc - (Number(curr.value) || 0);
            }
            return acc + (Number(curr.value) || 0);
        }, 0);
    });

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

    const calculateEquity = (balanceMap: Record<number, number>) => {
        return Object.entries(balanceMap).reduce((acc, [id, val]) => {
            return Number(id) === DEBT_ACCOUNT_ID ? acc - val : acc + val;
        }, 0);
    };

    // Compute non-system visible columns once so headers and rows always stay aligned
    const visibleCustomAccounts = useComputed(() => {
        return accountsInTransactions(
            transactionsAtMonth.value,
            allAccounts.value,
        ).filter((account) => account.id > 3);
    });

    const startingBalanceMap = useComputed<Record<number, number>>(() => {
        const map: Record<number, number> = {};
        for (const acc of balances.value) {
            map[acc.id] = acc.balance;
        }
        return map;
    });

    const startingEquity = useComputed(() =>
        calculateEquity(startingBalanceMap.value)
    );

    // Group transactions by day and compute end-of-day running balances (prefix sum)
    const dailyLedgers = useComputed(() => {
        const runningBalances: Record<number, number> = {
            ...startingBalanceMap.value,
        };

        const days: {
            dayLabel: string;
            transactions: TransactionByTime[];
            endOfDayBalances: Record<number, number>;
            endOfDayEquity: number;
        }[] = [];

        for (const tx of transactionsGroupedByTime.value) {
            const dayLabel = formatIsoToDayMonth(tx.date);
            let currentDay = days[days.length - 1];

            if (!currentDay || currentDay.dayLabel !== dayLabel) {
                currentDay = {
                    dayLabel,
                    transactions: [],
                    endOfDayBalances: {},
                    endOfDayEquity: 0,
                };
                days.push(currentDay);
            }

            currentDay.transactions.push(tx);

            for (const change of tx.changes) {
                runningBalances[change.accountId] =
                    (runningBalances[change.accountId] ?? 0) + change.value;
            }

            // Snapshot cumulative state at the end of this transaction (final snapshot = end of day)
            currentDay.endOfDayBalances = { ...runningBalances };
            currentDay.endOfDayEquity = calculateEquity(runningBalances);
        }

        return days;
    });

    const startingDayLabel = useComputed(() =>
        formatIsoToDayMonth(new Date(selectedDate.value).toISOString())
    );

    const hasFirstDayTransactions = useComputed(() =>
        dailyLedgers.value[0]?.dayLabel === startingDayLabel.value
    );

    useEffect(() => {
        refetchAllCategories();
        refetchAllAccounts();
        refetchUnarchivedContacts();
        refetchUnarchivedFundTypes();
        refetchInvestments();
        refetchInvestmentLots();
    }, []);

    useEffect(() => {
        const split = selectedDate.value.split("-");
        const year = Number(split[0]);
        const month = Number(split[1]);
        refetchTransactionsAtMonth(month, year);
        refetchBalances(month, year);
    }, [selectedDate.value]);

    return (
        <Layout name={`Ledger`}>
            <Categories />
            <Accounts />
            <Contacts />
            <FundTypes />
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
                                    <th>Date</th>
                                    {visibleCustomAccounts.value.map((
                                        account,
                                    ) => (
                                        <th key={account.id}>
                                            {account.name}
                                        </th>
                                    ))}
                                    <th>Investment</th>
                                    <th>Receivable</th>
                                    <th>Debt</th>
                                    <th>Equity</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Starting Balance Row */}
                                <tr>
                                    <td>{startingDayLabel.value}</td>
                                    {visibleCustomAccounts.value.map((
                                        account,
                                    ) => (
                                        <td key={account.id}>
                                            {startingBalanceMap
                                                .value[account.id] ?? 0}
                                        </td>
                                    ))}
                                    <td>
                                        {startingBalanceMap
                                            .value[INVESTMENT_ACCOUNT_ID] ??
                                            0}
                                    </td>
                                    <td>
                                        {startingBalanceMap
                                            .value[RECEIVABLE_ACCOUNT_ID] ??
                                            0}
                                    </td>
                                    <td>
                                        {startingBalanceMap
                                            .value[DEBT_ACCOUNT_ID] ?? 0}
                                    </td>
                                    <td>{startingEquity.value}</td>
                                    <td>-</td>
                                    <td>Starting Balance</td>
                                </tr>
                                {/* Only render a standalone Balance row for day 1 if no transactions occurred on day 1 */}
                                {!hasFirstDayTransactions.value && (
                                    <tr>
                                        <td>Balance</td>
                                        {visibleCustomAccounts.value.map((
                                            account,
                                        ) => (
                                            <td key={account.id}>
                                                {startingBalanceMap
                                                    .value[account.id] ?? 0}
                                            </td>
                                        ))}
                                        <td>
                                            {startingBalanceMap
                                                .value[
                                                    INVESTMENT_ACCOUNT_ID
                                                ] ?? 0}
                                        </td>
                                        <td>
                                            {startingBalanceMap
                                                .value[
                                                    RECEIVABLE_ACCOUNT_ID
                                                ] ?? 0}
                                        </td>
                                        <td>
                                            {startingBalanceMap
                                                .value[DEBT_ACCOUNT_ID] ??
                                                0}
                                        </td>
                                        <td>{startingEquity.value}</td>
                                        <td>-</td>
                                        <td>-</td>
                                    </tr>
                                )}
                                {/* Daily Transactions + End-of-Day Balance Rows */}
                                {dailyLedgers.value.map((day) => (
                                    <>
                                        {day.transactions.map(
                                            (transaction) => {
                                                const receivableChange =
                                                    transaction.changes
                                                        .find(
                                                            (change) =>
                                                                change
                                                                    .accountId ===
                                                                    RECEIVABLE_ACCOUNT_ID,
                                                        );
                                                const debtChange = transaction
                                                    .changes
                                                    .find(
                                                        (change) =>
                                                            change
                                                                .accountId ===
                                                                DEBT_ACCOUNT_ID,
                                                    );
                                                const investmentChange =
                                                    transaction.changes
                                                        .find(
                                                            (change) =>
                                                                change
                                                                    .accountId ===
                                                                    INVESTMENT_ACCOUNT_ID,
                                                        );
                                                return (
                                                    <tr
                                                        key={transaction
                                                            .date}
                                                    >
                                                        <td>
                                                            {day.dayLabel}
                                                        </td>
                                                        {visibleCustomAccounts
                                                            .value.map((
                                                                account,
                                                            ) => (
                                                                <td
                                                                    key={account
                                                                        .id}
                                                                >
                                                                    {transaction
                                                                        .changes
                                                                        .find(
                                                                            (
                                                                                change,
                                                                            ) => change
                                                                                .accountId ===
                                                                                account
                                                                                    .id,
                                                                        )?.value}
                                                                </td>
                                                            ))}
                                                        <td>
                                                            {investmentChange
                                                                ?.value}
                                                        </td>
                                                        <td>
                                                            {receivableChange
                                                                ?.value}
                                                        </td>
                                                        <td>
                                                            {debtChange
                                                                ?.value}
                                                        </td>
                                                        <td>
                                                            {transaction
                                                                .changes
                                                                .reduce(
                                                                    (
                                                                        acc,
                                                                        curr,
                                                                    ) => curr
                                                                            .accountId ===
                                                                            DEBT_ACCOUNT_ID
                                                                        ? acc -
                                                                            curr.value
                                                                        : acc +
                                                                            curr.value,
                                                                    0,
                                                                )}
                                                        </td>
                                                        <td>
                                                            {allCategories
                                                                .value.find(
                                                                    (
                                                                        category,
                                                                    ) => category
                                                                        .id ===
                                                                        transaction
                                                                            .category,
                                                                )?.name}
                                                        </td>
                                                        <td>
                                                            {transaction
                                                                .description}
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )}
                                        {/* End-of-Day Running Balance Row */}
                                        <tr key={`balance-${day.dayLabel}`}>
                                            <td>Balance</td>
                                            {visibleCustomAccounts.value
                                                .map((account) => (
                                                    <td key={account.id}>
                                                        {day.endOfDayBalances[
                                                            account.id
                                                        ] ?? 0}
                                                    </td>
                                                ))}
                                            <td>
                                                {day.endOfDayBalances[
                                                    INVESTMENT_ACCOUNT_ID
                                                ] ?? 0}
                                            </td>
                                            <td>
                                                {day.endOfDayBalances[
                                                    RECEIVABLE_ACCOUNT_ID
                                                ] ?? 0}
                                            </td>
                                            <td>
                                                {day.endOfDayBalances[
                                                    DEBT_ACCOUNT_ID
                                                ] ?? 0}
                                            </td>
                                            <td>{day.endOfDayEquity}</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </>
                                ))}
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
                    <label htmlFor="transaction_category_element">
                        Category
                        <select
                            name="transaction_category"
                            id="transaction_category_element"
                        >
                            {allCategories.value.map((category) => {
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
                        if the equity change is 0, the category will be
                        "Transfer" automatically.
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
                                    {allAccounts.value.filter((a) =>
                                        a.id !== INVESTMENT_ACCOUNT_ID
                                    ).map(
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
                                        updateEntry(
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
                    {entriesRequireContact.value &&
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
                            defaultValue={new Date()
                                .toISOString()
                                .slice(0, 16)}
                            type="datetime-local"
                            name="transaction_date"
                            id="transaction_date_element"
                            step="1"
                        />
                    </label>
                    {/* For refetch */}
                    <input
                        type="hidden"
                        name="selected_date"
                        value={selectedDate.value}
                    />
                    {/* For flipping category to "Transfer" */}
                    <input
                        type="hidden"
                        name="transaction_equity_change"
                        value={totalChange.value}
                    />
                    <p>{totalChange.value}</p>
                </GenericForm>
            </section>
            <section>
                <h2>Investment Assets</h2>
                <ul>
                    {unarchivedInvestments.value.map((asset) => (
                        <li key={asset.id}>
                            {asset.name}{" "}
                            ({unarchivedFundTypes.value.find((fundType) =>
                                fundType.id === asset.fund_type_id
                            )?.name}) [{formatIsoToDayMonth(
                                asset.last_updated,
                            )}: {asset.unit} = {asset.current_bid}]
                        </li>
                    ))}
                </ul>
                <GenericForm
                    options={{
                        formName: "investment_asset",
                        onSubmit: handleSubmit,
                    }}
                >
                    <label htmlFor="investment_asset_fund_type_element">
                        Fund Type
                        <select
                            name="investment_asset_fund_type"
                            id="investment_asset_fund_type_element"
                        >
                            {unarchivedFundTypes.value.map((fund_type) => {
                                return (
                                    <option
                                        key={fund_type.id}
                                        value={fund_type.id}
                                    >
                                        {fund_type.name}
                                    </option>
                                );
                            })}
                        </select>
                    </label>
                    <label htmlFor="investment_asset_name_element">
                        Name
                        <input
                            required
                            type="text"
                            name="investment_asset_name"
                            id="investment_asset_name_element"
                        />
                    </label>
                    <label htmlFor="investment_asset_unit_element">
                        Unit
                        <input
                            required
                            type="text"
                            name="investment_asset_unit"
                            id="investment_asset_unit_element"
                            placeholder="Ex: 1 mBTC"
                        />
                    </label>
                    <label htmlFor="investment_asset_current_bid_element">
                        Current Bid Price
                        <input
                            required
                            type="number"
                            min={Number.MIN_VALUE}
                            name="investment_asset_current_bid"
                            id="investment_asset_current_bid_element"
                            step="any"
                        />
                    </label>
                </GenericForm>
            </section>
            <section>
                <h2>Investment Lots</h2>
                <h3>Manage Lots</h3>
                <form>
                    {unarchivedInvestments.value.map((asset) => {
                        return (
                            <div key={asset.id}>
                                <label
                                    htmlFor={`existing_lot_asset_id_${asset.id}_element`}
                                >
                                    <input
                                        type="radio"
                                        name={`existing_lot_asset_id`}
                                        id={`existing_lot_asset_id_${asset.id}_element`}
                                        value={asset.id}
                                        checked={existingLotSelectedAssetId
                                            .value ===
                                            asset.id}
                                        onChange={(e) => {
                                            existingLotSelectedAssetId
                                                .value = Number(
                                                    e.currentTarget
                                                        .value,
                                                );
                                        }}
                                    />
                                    {asset.name}
                                </label>
                                {existingLotSelectedAssetId.value ===
                                        asset.id &&
                                    (
                                        <>
                                            {allHeldLots.value.filter((
                                                lot,
                                            ) => lot.investment_id ===
                                                asset.id
                                            ).map((lot) => {
                                                return (
                                                    <div key={lot.id}>
                                                        <label
                                                            htmlFor={`existing_lot_id_${lot.id}_element`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`existing_lot_id_${lot.id}`}
                                                                id={`existing_lot_id_${lot.id}_element`}
                                                                value={lot
                                                                    .id}
                                                                checked={existingLotSelectedLotId
                                                                    .value ===
                                                                    lot.id}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    existingLotSelectedLotId
                                                                        .value =
                                                                            Number(
                                                                                e.currentTarget
                                                                                    .value,
                                                                            );
                                                                }}
                                                            />
                                                            {lot.remaining_quantity}/{lot
                                                                .initial_quantity}
                                                            {" "}
                                                            unit
                                                            [{formatIsoToDayMonth(
                                                                lot.purchased_at,
                                                            )}:{" "}
                                                            {lot.unit_cost}/unit]
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                            <div>
                                                <label htmlFor="existing_lot_quantity_element">
                                                    Quantity to Sell
                                                    <input
                                                        required
                                                        disabled={!Boolean(
                                                            existingLotSelectedAssetId
                                                                .value,
                                                        )}
                                                        type="number"
                                                        min={Number
                                                            .MIN_VALUE}
                                                        max={existingLotSelectedAsset
                                                            .value
                                                            ?.remaining_quantity}
                                                        step="any"
                                                        name="existing_lot_quantity"
                                                        id="existing_lot_quantity_element"
                                                    />
                                                </label>
                                                <label htmlFor="existing_lot_current_price_element">
                                                    Current Price
                                                    <input
                                                        required
                                                        disabled={!Boolean(
                                                            existingLotSelectedAssetId
                                                                .value,
                                                        )}
                                                        type="number"
                                                        min={Number
                                                            .MIN_VALUE}
                                                        defaultValue={unarchivedInvestments
                                                            .value.find((
                                                                a,
                                                            ) => a.id ===
                                                                existingLotSelectedAsset
                                                                    .value
                                                                    ?.investment_id
                                                            )?.current_bid}
                                                        step="any"
                                                        name="existing_lot_current_price"
                                                        id="existing_lot_current_price_element"
                                                    />
                                                </label>
                                                <label htmlFor="existing_lot_date_element">
                                                    Sold at
                                                    <input
                                                        required
                                                        disabled={!Boolean(
                                                            existingLotSelectedAssetId
                                                                .value,
                                                        )}
                                                        type="datetime-local"
                                                        name="existing_lot_date"
                                                        id="existing_lot_date_element"
                                                        defaultValue={new Date()
                                                            .toISOString()
                                                            .slice(0, 16)}
                                                    />
                                                </label>
                                                <button
                                                    type="submit"
                                                    disabled={!Boolean(
                                                        existingLotSelectedAssetId
                                                            .value,
                                                    )}
                                                >
                                                    Sell
                                                </button>
                                            </div>
                                        </>
                                    )}
                            </div>
                        );
                    })}
                </form>
                <h3>New Lot</h3>
                <GenericForm
                    options={{
                        formName: "investment_lot",
                        onSubmit: handleSubmit,
                    }}
                >
                    <label htmlFor="lot_asset_element">
                        Asset
                        <select
                            required
                            name="lot_asset"
                            id="lot_asset_element"
                            value={String(newLotSelectedAssetId.value)}
                            onChange={(e) => {
                                newLotSelectedAssetId.value = Number(
                                    e.currentTarget.value,
                                );
                            }}
                        >
                            {unarchivedInvestments.value.map(
                                (asset) => {
                                    return (
                                        <option
                                            key={asset.id}
                                            value={asset.id}
                                        >
                                            {asset.name}
                                        </option>
                                    );
                                },
                            )}
                        </select>
                    </label>
                    <label htmlFor="lot_quantity_element">
                        Quantity
                        <input
                            required
                            disabled={!Boolean(newLotselectedAsset.value)}
                            type="number"
                            step="any"
                            min={Number.MIN_VALUE}
                            name="lot_quantity"
                            id="lot_quantity_element"
                        />
                    </label>
                    <label htmlFor="lot_current_price_element">
                        Current Price {!newLotselectedAsset.value
                            ? ""
                            : `(${newLotselectedAsset.value.unit})`}
                        <input
                            required
                            disabled={!Boolean(newLotselectedAsset.value)}
                            type="number"
                            step="any"
                            min={Number.MIN_VALUE}
                            name="lot_current_price"
                            id="lot_current_price_element"
                            defaultValue={newLotselectedAsset.value
                                ?.current_bid}
                        />
                    </label>
                    <label htmlFor="lot_source_account_element">
                        Source Account
                        <select
                            required
                            disabled={!Boolean(newLotselectedAsset.value)}
                            name="lot_source_account"
                            id="lot_source_account_element"
                            value={String(selectedAccountId.value)}
                            onChange={(e) => {
                                selectedAccountId.value = Number(
                                    e.currentTarget.value,
                                );
                            }}
                        >
                            {allAccounts.value.filter((a) =>
                                !a.archived &&
                                a.id !== INVESTMENT_ACCOUNT_ID
                            )
                                .map(
                                    (account) => {
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
                    {/* TODO: Only show unique assets in the Investment Lots preview. Show specific lots for one asset when focused */}
                    {selectedAccountId.value &&
                        (selectedAccountId.value === DEBT_ACCOUNT_ID ||
                            selectedAccountId.value ===
                                RECEIVABLE_ACCOUNT_ID) &&
                        (
                            <label htmlFor="lot_source_contact_element">
                                Contact
                                <select
                                    required
                                    disabled={!Boolean(
                                        newLotselectedAsset.value,
                                    )}
                                    name="lot_source_contact"
                                    id="lot_source_contact_element"
                                >
                                    {unarchivedContacts.value.map(
                                        (contact) => {
                                            return (
                                                <option
                                                    key={contact.id}
                                                    value={contact.id}
                                                >
                                                    {contact.name}
                                                </option>
                                            );
                                        },
                                    )}
                                </select>
                            </label>
                        )}
                    {newLotselectedAsset.value && (
                        <p>
                            Changing the current price will update the asset
                            unit price.
                        </p>
                    )}
                    {/* For refetch */}
                    <input
                        type="hidden"
                        name="selected_date"
                        value={selectedDate.value}
                    />
                </GenericForm>
            </section>
        </Layout>
    );
};

export default Ledger;
