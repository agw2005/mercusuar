import GenericForm from "#/components/GenericForm.tsx";
import handleSubmit from "#view/Ledger/handleSubmit.ts";

const NewContact = () => {
  return (
    <>
      <h3>New Contact</h3>
      <GenericForm
        options={{
          formName: "contact",
          onSubmit: handleSubmit,
        }}
      >
        <label htmlFor="contact_name_element">
          Name
          <input
            required
            type="text"
            name="contact_name"
            id="contact_name_element"
          />
        </label>
      </GenericForm>
    </>
  );
};

export default NewContact;
