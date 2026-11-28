import { startingDayLabel } from "#view/Ledger/selectedDate.ts";
import { ACCOUNT } from "#/libs/systemsId.ts";
import type { Accounts } from "#/types.d.ts";

interface RowStartOfMonthBalanceProps {
  balanceMap: Record<number, number>;
  nonSystemAccounts: Accounts[];
  startingEquity: number;
}

const RowStartOfMonthBalance = (
  { balanceMap, nonSystemAccounts, startingEquity }:
    RowStartOfMonthBalanceProps,
) => {
  return (
    <tr>
      <td>{startingDayLabel.value}</td>
      {nonSystemAccounts.map((account) => (
        <td key={account.id}>
          {balanceMap[account.id] ?? 0}
        </td>
      ))}
      <td>
        {balanceMap[ACCOUNT.INVESTMENT] ?? 0}
      </td>
      <td>
        {balanceMap[ACCOUNT.RECEIVABLE] ?? 0}
      </td>
      <td>
        {balanceMap[ACCOUNT.DEBT] ?? 0}
      </td>
      <td>
        {startingEquity}
      </td>
      <td>-</td>
      <td>Starting Balance</td>
    </tr>
  );
};

export default RowStartOfMonthBalance;
