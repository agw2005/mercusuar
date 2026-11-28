import ManageContacts from "./ManageContacts.tsx";
import NewContact from "./NewContact.tsx";

const Contacts = () => {
  return (
    <section>
      <h2>Contacts</h2>
      <ManageContacts />
      <NewContact />
    </section>
  );
};

export default Contacts;
