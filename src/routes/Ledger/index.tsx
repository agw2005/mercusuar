import { useEffect } from "preact/hooks";
import { refetchAllCategories } from "#/libs/store/categories.ts";
import { refetchAllAccounts } from "#/libs/store/accounts.ts";
import {
  refetchClaims,
  refetchUnarchivedContacts,
} from "#/libs/store/contacts.ts";
import { refetchAllFundTypes } from "#/libs/store/fundType.ts";
import { refetchInvestments } from "#/libs/store/investments.ts";
import { refetchInvestmentLots } from "#/libs/store/investmentLots.ts";
import Layout from "#/components/Layout.tsx";
import Categories from "./Categories/Categories.tsx";
import Accounts from "./Accounts/Accounts.tsx";
import Contacts from "./Contacts/Contacts.tsx";
import FundTypes from "./FundTypes/FundTypes.tsx";
import Transactions from "./Transactions/Transactions.tsx";
import InvestmentsSection from "./Investments/Investments.tsx";
import InvestmentLots from "./InvestmentLots/InvestmentLots.tsx";

const Ledger = () => {
  useEffect(() => {
    refetchAllCategories();
    refetchAllAccounts();
    refetchUnarchivedContacts();
    refetchAllFundTypes();
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
