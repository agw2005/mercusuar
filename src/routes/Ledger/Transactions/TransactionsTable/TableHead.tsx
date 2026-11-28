import { transactionsTableData } from "./tableData.ts";

const TableHead = () => {
  return (
    <thead>
      <tr>
        <th>Date</th>
        {transactionsTableData.nonSystemAccounts.value
          .map((
            account,
          ) => (
            <th
              key={account.id}
              title={account.archived ? "Archived" : void 0}
            >
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
  );
};

export default TableHead;
