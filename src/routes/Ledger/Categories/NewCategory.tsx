import GenericForm from "#/components/GenericForm.tsx";
import handleSubmit from "#view/Ledger/handleSubmit.ts";

const NewCategory = () => {
    return (
        <>
            <h3>New Category</h3>
            <GenericForm
                options={{
                    formName: "category",
                    onSubmit: handleSubmit,
                }}
            >
                <label htmlFor="category_name_element">
                    Name
                    <input
                        required
                        type="text"
                        name="category_name"
                        id="category_name_element"
                    />
                </label>
            </GenericForm>
        </>
    );
};

export default NewCategory;
