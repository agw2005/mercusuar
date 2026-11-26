import { allCategories } from "#/libs/store/categories.ts";
import { transactionsAtMonth } from "#/libs/store/transactions.ts";
import { ACCOUNT } from "#/libs/systemsId.ts";
import DatePicker from "./DatePicker";
import TableHead from "./TableHead";
import RowBalance from "./RowBalance";
import RowStartingBalance from "./RowStartingBalance";
import {
    dailyLedgers,
    startingBalanceMap,
    transactionsTableData,
} from "./tableData";

const TransactionsTable = () => {
    return (
        <>
            <DatePicker />
            {transactionsAtMonth.value.length === 0
                ? <h3>No transaction at this month and year.</h3>
                : (
                    <table>
                        <TableHead />
                        <tbody>
                            <RowStartingBalance />

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
                                            const receivableChange = transaction
                                                .changes
                                                .find(
                                                    (change) =>
                                                        change
                                                            .accountId ===
                                                            ACCOUNT.RECEIVABLE,
                                                );
                                            const debtChange = transaction
                                                .changes
                                                .find(
                                                    (change) =>
                                                        change
                                                            .accountId ===
                                                            ACCOUNT.DEBT,
                                                );
                                            const investmentChange = transaction
                                                .changes
                                                .find(
                                                    (change) =>
                                                        change
                                                            .accountId ===
                                                            ACCOUNT.INVESTMENT,
                                                );
                                            return (
                                                <tr
                                                    key={transaction
                                                        .date}
                                                >
                                                    <td>
                                                        {day.dayLabel}
                                                    </td>
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
                                                                        ACCOUNT
                                                                            .DEBT
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
                                    <RowBalance
                                        endOfDayBalance={day.endOfDayBalances}
                                        endOfDayEquity={day.endOfDayEquity}
                                        key={`balance-${day.dayLabel}`}
                                    />
                                </>
                            ))}
                        </tbody>
                    </table>
                )}
        </>
    );
};

export default TransactionsTable;
