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
import {
    investmentsQuery,
    refetchInvestments,
} from "#/libs/store/investments.ts";
import {
    investmentLotsQuery,
    refetchInvestmentLots,
} from "#/libs/store/investmentLots.ts";

const TRANSFER_CATEGORY_ID = 1;

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
        default:
            console.error("No form of that name exists.");
    }

    form.reset();
};

export default handleSubmit;
