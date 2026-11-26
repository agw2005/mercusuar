import GenericForm from "#/components/GenericForm.tsx";
import handleSubmit from "#view/Ledger/handleSubmit.ts";

const NewFundType = () => {
    return (
        <>
            <h3>New Fund Type</h3>
            <GenericForm
                options={{
                    formName: "fund_type",
                    onSubmit: handleSubmit,
                }}
            >
                <label htmlFor="fund_type_name_element">
                    Name
                    <input
                        required
                        type="text"
                        name="fund_type_name"
                        id="fund_type_name_element"
                    />
                </label>
            </GenericForm>
        </>
    );
};

export default NewFundType;
