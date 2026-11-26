import { ACCOUNT } from "#/libs/systemsId.ts";
import { transactionsTableData } from "./tableData";

interface RowBalanceProps {
    endOfDayBalance: Record<number, number>;
    endOfDayEquity: number;
    key?: string;
}

const RowBalance = (
    { endOfDayBalance, endOfDayEquity, key }: RowBalanceProps,
) => {
    return (
        <tr key={key}>
            <td>Balance</td>
            {transactionsTableData.nonSystemAccounts
                .value
                .map((account) => (
                    <td key={account.id}>
                        {endOfDayBalance[account.id] ?? 0}
                    </td>
                ))}
            <td>
                {endOfDayBalance[
                    ACCOUNT.INVESTMENT
                ] ?? 0}
            </td>
            <td>
                {endOfDayBalance[
                    ACCOUNT.RECEIVABLE
                ] ?? 0}
            </td>
            <td>
                {endOfDayBalance[ACCOUNT.DEBT] ??
                    0}
            </td>
            <td>
                {endOfDayEquity}
            </td>
            <td>-</td>
            <td>-</td>
        </tr>
    );
};

export default RowBalance;
