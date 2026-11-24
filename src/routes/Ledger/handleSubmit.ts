import {
    categoriesQuery,
    refetchAllCategories,
} from "#/libs/store/categories.ts";
import { accountsQuery, refetchAllAccounts } from "#/libs/store/accounts.ts";
import {
    contactsQuery,
    refetchUnarchivedContacts,
} from "#/libs/store/contacts.ts";
import {
    fundTypesQuery,
    refetchUnarchivedFundTypes,
} from "#/libs/store/fundType.ts";
import type { AccountChange } from "#/types.d.ts";
import {
    refetchTransactionsAtMonth,
    transactionsQuery,
} from "#/libs/store/transactions.ts";

const TRANSFER_CATEGORY_ID = 1;
// const INVESTMENT_CATEGORY_ID = 2;

const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
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
                await refetchUnarchivedFundTypes();
            }
            break;
        case "transaction":
            {
                const totalChange = Number(
                    formData.get("transaction_equity_change"),
                );
                const category = totalChange === 0
                    ? TRANSFER_CATEGORY_ID
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
            }
            break;
        case "investment":
            {
                const fundTypeId = Number(formData.get("investment_fund_type"));
                const name = String(formData.get("investment_name"));
                const unit = String(formData.get("investment_unit"));
                const quantity = Number(formData.get("investment_quantity"));
                const ask = Number(formData.get("investment_ask"));
                const bid = Number(formData.get("investment_ask"));
                const status = true;
                const lastUpdated = new Date().toISOString();

                console.log({
                    form: formType,
                    data: {
                        fundTypeId,
                        name,
                        unit,
                        quantity,
                        ask,
                        bid,
                        status,
                        lastUpdated,
                    },
                });
            }
            break;
        default:
            console.error("No form of that name exists.");
    }

    form.reset();
};

export default handleSubmit;
