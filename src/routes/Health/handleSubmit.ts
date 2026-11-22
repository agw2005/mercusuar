const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const formType = form.dataset.formType;

    switch (formType) {
        case "weight":
            {
                const rawDate = String(formData.get("weight_date"));
                const value = String(formData.get("weight_value"));

                const date = new Date(rawDate).toISOString();

                console.log({
                    form: formType,
                    data: {
                        date,
                        value,
                    },
                });
            }
            break;
        case "sleep":
            {
                const rawStart = String(formData.get("sleep_start"));
                const rawEnd = String(formData.get("sleep_end"));

                const start = new Date(rawStart).toISOString();
                const end = new Date(rawEnd).toISOString();

                console.log({
                    form: formType,
                    data: {
                        start,
                        end,
                    },
                });
            }
            break;
        case "target":
            {
                const weight = Number(formData.get("target_weight"));
                const bodyFat = Number(formData.get("target_body_fat"));

                const date = new Date().toISOString();

                console.log({
                    form: formType,
                    data: {
                        weight,
                        bodyFat,
                        date,
                    },
                });
            }
            break;
        case "progress":
            {
                const rawDate = String(formData.get("progress_date"));
                const age = Number(formData.get("progress_age"));
                const height = Number(formData.get("progress_height"));
                const weight = Number(formData.get("progress_weight"));
                const neck = Number(formData.get("progress_neck"));
                const waist = Number(formData.get("progress_waist"));
                const bodyFat = Number(formData.get("progress_body_fat"));

                const date = new Date(rawDate).toISOString();

                console.log({
                    form: formType,
                    data: {
                        date,
                        age,
                        height,
                        weight,
                        neck,
                        waist,
                        bodyFat,
                    },
                });
            }
            break;
        case "exercise":
            {
                const categoryId = Number(formData.get("transaction_category"));
                const affectedAccounts = formData.getAll("transaction_account");
                const values = formData.getAll("transaction_value");
                const signs = formData.getAll("transaction_value_sign");
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
                    value: Number(values[index]),
                    sign: Boolean(Number(signs[index])),
                }));

                console.log({
                    form: formType,
                    data: {
                        categoryId,
                        changes,
                        description,
                        date,
                    },
                });
            }
            break;
        case "entry":
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
