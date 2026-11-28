import GenericForm from "#/components/GenericForm.tsx";
import handleSubmit from "#view/Ledger/handleSubmit.ts";

const NewAccount = () => {
  return (
    <section>
      <h3>New Account</h3>
      <GenericForm
        options={{
          formName: "account",
          onSubmit: handleSubmit,
        }}
      >
        <label htmlFor="account_name_element">
          Name
          <input
            required
            type="text"
            name="account_name"
            id="account_name_element"
          />
        </label>
      </GenericForm>
    </section>
  );
};

export default NewAccount;
