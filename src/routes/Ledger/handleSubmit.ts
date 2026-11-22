import { invoke } from "@tauri-apps/api/core";

const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const formType = form.dataset.formType;

    switch (formType) {
        case "category":
            {
                const name = String(formData.get("category_name") ?? "").trim();
                console.log({
                    form: formType,
                    data: {
                        name,
                    },
                });
            }
            break;
        case "account":
            {
                const name = String(formData.get("account_name") ?? "").trim();
                console.log({
                    form: formType,
                    data: {
                        name,
                    },
                });
            }
            break;
        case "contact":
            {
                const name = String(formData.get("contact_name") ?? "").trim();
                console.log({
                    form: formType,
                    data: {
                        name,
                    },
                });
            }
            break;
        case "fund_type":
            {
                const name = String(formData.get("fund_type_name") ?? "")
                    .trim();
                console.log({
                    form: formType,
                    data: {
                        name,
                    },
                });
            }
            break;
        case "transaction":
            {
                const categoryId = Number(formData.get("transaction_category"));
                const affectedAccounts = formData.getAll("transaction_account");
                const values = formData.getAll("transaction_value");
                const signs = formData.getAll("transaction_value_sign");
                const rawContact = formData.get("transaction_contact");
                const description = String(
                    formData.get("transaction_description"),
                );
                const rawDate = String(formData.get("transaction_date"));

                const date = rawDate.trim() === ""
                    ? new Date().toISOString()
                    : new Date(rawDate).toISOString();

                const changes = affectedAccounts.map((
                    accountId,
                    index,
                ) => ({
                    accountId: Number(accountId),
                    value: Number(values[index]) *
                        (Boolean(Number(signs[index])) ? -1 : 1),
                }));

                const contact = rawContact === null ? null : Number(rawContact);

                console.log({
                    form: formType,
                    data: {
                        categoryId,
                        changes,
                        contact,
                        description,
                        date,
                    },
                });
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

    invoke("ledger_ping");
    form.reset();
};

export default handleSubmit;
