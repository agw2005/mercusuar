import { startingDayLabel } from "#view/Ledger/selectedDate.ts";
import { ACCOUNT } from "#/libs/systemsId.ts";
import { startingBalanceMap, transactionsTableData } from "./tableData";

const RowStartingBalance = () => {
    return (
        <tr>
            <td>{startingDayLabel.value}</td>
            {transactionsTableData.nonSystemAccounts.value
                .map((
                    account,
                ) => (
                    <td key={account.id}>
                        {startingBalanceMap
                            .value[account.id] ?? 0}
                    </td>
                ))}
            <td>
                {startingBalanceMap
                    .value[ACCOUNT.INVESTMENT] ??
                    0}
            </td>
            <td>
                {startingBalanceMap
                    .value[ACCOUNT.RECEIVABLE] ??
                    0}
            </td>
            <td>
                {startingBalanceMap
                    .value[ACCOUNT.DEBT] ?? 0}
            </td>
            <td>
                {transactionsTableData.startingEquity.value}
            </td>
            <td>-</td>
            <td>Starting Balance</td>
        </tr>
    );
};

export default RowStartingBalance;
