import {
  categoriesQuery,
  refetchAllCategories,
} from "#/libs/store/categories.ts";
import {
  accountsQuery,
  refetchAllAccounts,
  refetchBalances,
} from "#/libs/store/accounts.ts";
import {
  contactsQuery,
  refetchClaims,
  refetchUnarchivedContacts,
} from "#/libs/store/contacts.ts";
import { fundTypesQuery, refetchAllFundTypes } from "#/libs/store/fundType.ts";
import type {
  AccountChange,
  Accounts,
  Categories,
  Contacts,
} from "#/types.d.ts";
import {
  refetchTransactionsAtMonth,
  transactionsQuery,
} from "#/libs/store/transactions.ts";
import {
  investmentsQuery,
  refetchInvestments,
} from "#/libs/store/investments.ts";
import {
  investmentLotsQuery,
  refetchInvestmentLots,
} from "#/libs/store/investmentLots.ts";
import { ACCOUNT, CATEGORY } from "#/libs/systemsId.ts";
import { selectedDate } from "./selectedDate.ts";

const handleSubmit = async (e: SubmitEvent) => {
  const submitter = e.submitter as
    | HTMLButtonElement
    | HTMLInputElement
    | null;
  if (submitter?.formMethod === "dialog") return;

  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const formData = new FormData(form, e.submitter);
  const formType = form.dataset.formType;

  switch (formType) {
    case "category":
      {
        const name = String(formData.get("category_name")).trim();
        await categoriesQuery.post(name);
        await refetchAllCategories();
      }
      break;
    case "account":
      {
        const name = String(formData.get("account_name")).trim();
        await accountsQuery.post(name);
        await refetchAllAccounts();
      }
      break;
    case "contact":
      {
        const name = String(formData.get("contact_name")).trim();
        await contactsQuery.post(name);
        await refetchUnarchivedContacts();
      }
      break;
    case "fund_type":
      {
        const name = String(formData.get("fund_type_name")).trim();
        await fundTypesQuery.post(name);
        await refetchAllFundTypes();
      }
      break;
    case "transaction":
      {
        const totalChange = Number(
          formData.get("transaction_equity_change"),
        );
        const category = totalChange === 0
          ? CATEGORY.TRANSFER
          : Number(formData.get("transaction_category"));
        const affectedAccounts = formData.getAll("transaction_account");
        const values = formData.getAll("transaction_value");
        const rawContact = formData.get("transaction_contact");
        const description = String(
          formData.get("transaction_description"),
        );
        const rawDate = String(formData.get("transaction_date"));
        const rawSelectedDate = String(formData.get("selected_date"));

        const date = rawDate.trim() === ""
          ? new Date().toISOString()
          : new Date(rawDate).toISOString();

        const changes: AccountChange[] = affectedAccounts.map((
          accountId,
          index,
        ) => ({
          accountId: Number(accountId),
          value: Number(values[index]),
        }));

        const contact = rawContact === null ? null : Number(rawContact);

        await transactionsQuery.post(
          category,
          changes,
          contact,
          description,
          date,
        );

        const split = rawSelectedDate.split("-");
        const year = Number(split[0]);
        const month = Number(split[1]);
        await refetchTransactionsAtMonth(month, year);
        await refetchBalances(month, year);
      }
      break;
    case "investment_asset":
      {
        const fundTypeId = Number(
          formData.get("investment_asset_fund_type"),
        );
        const name = String(formData.get("investment_asset_name"));
        const unit = String(formData.get("investment_asset_unit"));
        const currentBid = Number(
          formData.get("investment_asset_current_bid"),
        );
        const lastUpdated = new Date().toISOString();

        await investmentsQuery.post(
          fundTypeId,
          name,
          unit,
          currentBid,
          lastUpdated,
        );
        await refetchInvestments();
      }
      break;
    case "investment_lot":
      {
        const investmentId = Number(formData.get("lot_asset"));
        const quantity = Number(formData.get("lot_quantity"));
        const unitCost = Number(formData.get("lot_current_price"));
        const sourceAccount = Number(
          formData.get("lot_source_account"),
        );
        const sourceContact = formData.get("lot_source_contact")
          ? Number(formData.get("lot_source_contact"))
          : null;

        const purchasedAt = new Date().toISOString();
        const rawSelectedDate = String(formData.get("selected_date"));

        await investmentLotsQuery.post(
          investmentId,
          quantity,
          unitCost,
          purchasedAt,
          sourceAccount,
          sourceContact,
        );

        const split = rawSelectedDate.split("-");
        const year = Number(split[0]);
        const month = Number(split[1]);
        await refetchTransactionsAtMonth(month, year);
        await refetchInvestmentLots();
        await refetchInvestments();
      }
      break;
    case "edit_category": {
      const categoryId = Number(
        formData.get("edit_category_category_id"),
      );
      const isSave = Boolean(formData.get("edit_category_save"));

      if (!isSave) {
        if (categoryId) await categoriesQuery.delete(categoryId);
        await refetchAllCategories();
        form.closest("dialog")?.close();
        break;
      }

      const oldName = formData.get("edit_category_category_name")?.toString()
        .trim() ?? "";
      const newName =
        formData.get("edit_category_new_name")?.toString().trim() ?? "";

      const oldColor = formData.get("edit_category_category_color")?.toString()
        .trim() ?? "";
      const newColor =
        formData.get("edit_category_new_color")?.toString().trim() ??
          "";

      const updates: Partial<Pick<Categories, "name" | "color">> = {};

      if (newName && newName !== oldName) {
        updates.name = newName;
      }

      if (newColor && newColor !== oldColor) {
        updates.color = newColor;
      }

      if (Object.keys(updates).length === 0) {
        console.log("No changes detected.");
      } else {
        const data = { id: categoryId, ...updates };

        await categoriesQuery.patch(data);

        await refetchAllCategories();
      }

      form.closest("dialog")?.close();
      break;
    }
    case "edit_account": {
      const accountId = Number(formData.get("edit_account_account_id"));

      const oldName = formData.get("edit_account_account_name")?.toString()
        .trim() ?? "";
      const newName =
        formData.get("edit_account_new_name")?.toString().trim() ?? "";

      const oldColor = formData.get("edit_account_account_color")?.toString()
        .trim() ?? "";
      const newColor =
        formData.get("edit_account_new_color")?.toString().trim() ??
          "";

      const updates: Partial<Pick<Accounts, "name" | "color">> = {};

      if (newName && newName !== oldName) {
        updates.name = newName;
      }

      if (newColor && newColor !== oldColor) {
        updates.color = newColor;
      }

      if (Object.keys(updates).length === 0) {
        console.log("No changes detected.");
      } else {
        const data = { id: accountId, ...updates };

        await accountsQuery.patch(data);

        await refetchAllAccounts();
      }

      form.closest("dialog")?.close();
      break;
    }
    case "delete_account": {
      const id = Number(formData.get("delete_account_id"));
      const rawDest = formData.get("delete_account_destination_account");
      const rawContact = formData.get("delete_account_contact");

      await accountsQuery.delete({
        id,
        destinationAccountId: rawDest === null ? null : Number(rawDest),
        contactId: rawContact === null ? null : Number(rawContact),
        date: new Date().toISOString(),
      });

      const [year, month] = selectedDate.value.split("-").map(Number);
      await refetchTransactionsAtMonth(month, year);
      await refetchBalances(month, year);
      await refetchAllAccounts();

      form.closest("dialog")?.close();
      break;
    }
    case "edit_contact": {
      const contactId = Number(formData.get("edit_contact_contact_id"));

      const oldName = formData.get("edit_contact_contact_name")?.toString()
        .trim() ?? "";
      const newName =
        formData.get("edit_contact_new_name")?.toString().trim() ?? "";

      const oldColor = formData.get("edit_contact_contact_color")?.toString()
        .trim() ?? "";
      const newColor =
        formData.get("edit_contact_new_color")?.toString().trim() ??
          "";

      const updates: Partial<Pick<Contacts, "name" | "color">> = {};

      if (newName && newName !== oldName) {
        updates.name = newName;
      }

      if (newColor && newColor !== oldColor) {
        updates.color = newColor;
      }

      if (Object.keys(updates).length === 0) {
        console.log("No changes detected.");
      } else {
        const data = { id: contactId, ...updates };

        await contactsQuery.patch(data);

        await refetchClaims();
        await refetchUnarchivedContacts();
      }

      form.closest("dialog")?.close();
      break;
    }
    case "delete_contact": {
      const id = Number(formData.get("delete_contact_id"));
      const rawDest = formData.get("delete_contact_destination_account");

      await contactsQuery.delete({
        id,
        destinationAccountId: rawDest === null ? null : Number(rawDest),
        date: new Date().toISOString(),
      });

      const [year, month] = selectedDate.value.split("-").map(Number);
      await refetchTransactionsAtMonth(month, year);
      await refetchBalances(month, year);
      await refetchClaims();
      await refetchUnarchivedContacts();

      form.closest("dialog")?.close();
      break;
    }
    case "edit_fund_type": {
      const fundTypeId = Number(
        formData.get("edit_fund_type_fund_type_id"),
      );
      const isSave = Boolean(formData.get("edit_fund_type_save"));

      if (!isSave) {
        if (fundTypeId) await fundTypesQuery.delete(fundTypeId);
        await refetchAllFundTypes();
        form.closest("dialog")?.close();
        break;
      }

      const oldName = formData.get("edit_fund_type_fund_type_name")?.toString()
        .trim() ?? "";
      const newName =
        formData.get("edit_fund_type_new_name")?.toString().trim() ??
          "";

      const oldColor =
        formData.get("edit_fund_type_fund_type_color")?.toString()
          .trim() ?? "";
      const newColor =
        formData.get("edit_fund_type_new_color")?.toString().trim() ??
          "";

      const updates: Partial<Pick<Categories, "name" | "color">> = {};

      if (newName && newName !== oldName) {
        updates.name = newName;
      }

      if (newColor && newColor !== oldColor) {
        updates.color = newColor;
      }

      if (Object.keys(updates).length === 0) {
        console.log("No changes detected.");
      } else {
        const data = { id: fundTypeId, ...updates };

        await fundTypesQuery.patch(data);

        await refetchAllFundTypes();
      }

      form.closest("dialog")?.close();
      break;
    }
    case "edit_transaction": {
      const transactionsDate =
        formData.get("edit_tx_date")?.toString().trim() ?? "";
      const transactionIds = formData.getAll("edit_tx_id");
      const accountIds = formData.getAll("edit_tx_account_id");
      const values = formData.getAll("edit_tx_value");
      const rawContact = formData.get("edit_tx_contact");
      const description =
        formData.get("edit_tx_description")?.toString().trim() ?? "";
      const contactId = rawContact === null ? null : Number(rawContact);

      const changes: (AccountChange & { transactionId: number })[] = accountIds
        .map((
          accountId,
          index,
        ) => ({
          accountId: Number(accountId),
          value: Number(values[index]),
          transactionId: Number(transactionIds[index]),
        }));

      const equityChange = changes.reduce((acc, curr) => {
        return curr.accountId === ACCOUNT.DEBT
          ? acc - curr.value
          : acc + curr.value;
      }, 0);

      const categoryId = equityChange === 0
        ? CATEGORY.TRANSFER
        : Number(formData.get("edit_tx_category"));

      await transactionsQuery.patch(
        transactionsDate,
        categoryId,
        changes,
        contactId,
        description,
      );

      const [year, month] = selectedDate.value.split("-").map(Number);
      await refetchTransactionsAtMonth(month, year);
      await refetchBalances(month, year);
      await refetchClaims();

      form.closest("dialog")?.close();
      break;
    }
    case "delete_transaction": {
      const transactionsDate =
        formData.get("delete_tx_date")?.toString().trim() ?? "";
      const transactionIds = formData.getAll("delete_tx_id").map((id) =>
        Number(id)
      );

      await transactionsQuery.delete(transactionsDate, transactionIds);

      const [year, month] = selectedDate.value.split("-").map(Number);
      await refetchTransactionsAtMonth(month, year);
      await refetchBalances(month, year);
      await refetchClaims();

      form.closest("dialog")?.close();
      break;
    }
    default:
      console.error("No form of that name exists.");
  }

  form.reset();
};

export default handleSubmit;
