import { transactionsTableData } from "./tableData";

const TableHead = () => {
    return (
        <thead>
            <tr>
                <th>Date</th>
                {transactionsTableData.nonSystemAccounts.value
                    .map((
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
    );
};

export default TableHead;
