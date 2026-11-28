import { allCategories } from "#/libs/store/categories.ts";
import { transactionsAtMonth } from "#/libs/store/transactions.ts";
import { ACCOUNT, CATEGORY } from "#/libs/systemsId.ts";
import DatePicker from "./DatePicker";
import TableHead from "./TableHead";
import RowBalance from "./RowBalance";
import RowStartOfMonthBalance from "./RowStartOfMonthBalance";
import {
    dailyLedgers,
    startingBalanceMap,
    transactionsTableData,
} from "./tableData";
import { useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import type { TransactionByTime } from "#/types.d.ts";
import EditModal from "./EditModal";

const TransactionsTable = () => {
    const modal = useRef<HTMLDialogElement>(null);
    const modalTransaction = useSignal<TransactionByTime | null>(null);

    return (
        <>
            <DatePicker />
            {transactionsAtMonth.value.length === 0
                ? <h3>No transaction at this month and year.</h3>
                : (
                    <>
                        <table>
                            <TableHead />
                            <tbody>
                                <RowStartOfMonthBalance
                                    balanceMap={startingBalanceMap.value}
                                    nonSystemAccounts={transactionsTableData
                                        .nonSystemAccounts.value}
                                    startingEquity={transactionsTableData
                                        .startingEquity.value}
                                />

                                {/* Only render a standalone Balance row for day 1 if no transactions occurred on day 1 */}
                                {!transactionsTableData
                                    .hasFirstDayTransactions
                                    .value &&
                                    (
                                        <RowBalance
                                            endOfDayBalance={startingBalanceMap
                                                .value}
                                            endOfDayEquity={transactionsTableData
                                                .startingEquity
                                                .value}
                                        />
                                    )}

                                {/* Daily Transactions + End-of-Day Balance Rows */}
                                {dailyLedgers.value.map((day) => (
                                    <>
                                        {day.transactions.map(
                                            (transaction) => {
                                                const receivableChange =
                                                    transaction
                                                        .changes
                                                        .find(
                                                            (change) =>
                                                                change
                                                                    .accountId ===
                                                                    ACCOUNT
                                                                        .RECEIVABLE,
                                                        )?.value;
                                                const debtChange = transaction
                                                    .changes
                                                    .find(
                                                        (change) =>
                                                            change
                                                                .accountId ===
                                                                ACCOUNT.DEBT,
                                                    )?.value;
                                                const investmentChange =
                                                    transaction
                                                        .changes
                                                        .find(
                                                            (change) =>
                                                                change
                                                                    .accountId ===
                                                                    ACCOUNT
                                                                        .INVESTMENT,
                                                        )?.value;
                                                const equityChange = transaction
                                                    .changes
                                                    .reduce(
                                                        (
                                                            acc,
                                                            curr,
                                                        ) => curr
                                                                .accountId ===
                                                                ACCOUNT
                                                                    .DEBT
                                                            ? acc -
                                                                curr.value
                                                            : acc +
                                                                curr.value,
                                                        0,
                                                    );
                                                const category = allCategories
                                                    .value.find(
                                                        (
                                                            category,
                                                        ) => category
                                                            .id ===
                                                            transaction
                                                                .category,
                                                    )?.name;
                                                const description = transaction
                                                    .description;
                                                return (
                                                    <tr key={transaction.date}>
                                                        <td>{day.dayLabel}</td>
                                                        {transactionsTableData
                                                            .nonSystemAccounts
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
                                                            {investmentChange}
                                                        </td>
                                                        <td>
                                                            {receivableChange}
                                                        </td>
                                                        <td>{debtChange}</td>
                                                        <td>{equityChange}</td>
                                                        <td>{category}</td>
                                                        <td>{description}</td>
                                                        {transaction
                                                                    .category !==
                                                                CATEGORY
                                                                    .INVESTMENT &&
                                                            (
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            modalTransaction
                                                                                .value =
                                                                                    transaction;
                                                                            modal
                                                                                .current
                                                                                ?.showModal();
                                                                        }}
                                                                    >
                                                                        &#9998;
                                                                    </button>
                                                                </td>
                                                            )}
                                                    </tr>
                                                );
                                            },
                                        )}

                                        {/* End-of-Day Running Balance Row */}
                                        <RowBalance
                                            endOfDayBalance={day
                                                .endOfDayBalances}
                                            endOfDayEquity={day.endOfDayEquity}
                                            key={`balance-${day.dayLabel}`}
                                        />
                                    </>
                                ))}
                            </tbody>
                        </table>

                        <EditModal
                            modalRef={modal}
                            transaction={modalTransaction.value}
                            onClose={() => {
                                modalTransaction.value = null;
                            }}
                        />
                    </>
                )}
        </>
    );
};

export default TransactionsTable;
