import { refetchTransactionsAtMonth } from "#/libs/store/transactions.ts";
import { refetchBalances } from "#/libs/store/accounts.ts";
import { useEffect } from "preact/hooks";
import { selectedDate } from "../selectedDate";
import TransactionsTable from "./TransactionsTable/TransactionsTable";
import NewTransactions from "./NewTransactions/NewTransactions";

const Transactions = () => {
    useEffect(() => {
        const split = selectedDate.value.split("-");
        const year = Number(split[0]);
        const month = Number(split[1]);
        refetchTransactionsAtMonth(month, year);
        refetchBalances(month, year);
    }, [selectedDate.value]);

    return (
        <section>
            <h2>Transactions</h2>

            <TransactionsTable />

            <NewTransactions />
        </section>
    );
};

export default Transactions;
