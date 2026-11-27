import { useEffect } from "preact/hooks";
import { refetchAllCategories } from "#/libs/store/categories.ts";
import { refetchAllAccounts } from "#/libs/store/accounts.ts";
import {
    refetchClaims,
    refetchUnarchivedContacts,
} from "#/libs/store/contacts.ts";
import { refetchUnarchivedFundTypes } from "#/libs/store/fundType.ts";
import { refetchInvestments } from "#/libs/store/investments.ts";
import { refetchInvestmentLots } from "#/libs/store/investmentLots.ts";
import Layout from "#/components/Layout.tsx";
import Categories from "./Categories/Categories";
import Accounts from "./Accounts/Accounts";
import Contacts from "./Contacts/Contacts";
import FundTypes from "./FundTypes/FundTypes";
import Transactions from "./Transactions/Transactions";
import InvestmentsSection from "./Investments/Investments";
import InvestmentLots from "./InvestmentLots/InvestmentLots";

const Ledger = () => {
    useEffect(() => {
        refetchAllCategories();
        refetchAllAccounts();
        refetchUnarchivedContacts();
        refetchUnarchivedFundTypes();
        refetchInvestments();
        refetchInvestmentLots();
        refetchClaims();
    }, []);

    return (
        <Layout name={`Ledger`}>
            <Categories />
            <Accounts />
            <Contacts />
            <FundTypes />
            <Transactions />
            <InvestmentsSection />
            <InvestmentLots />
        </Layout>
    );
};

export default Ledger;
