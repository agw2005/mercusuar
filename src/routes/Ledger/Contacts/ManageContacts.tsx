import { unarchivedContacts } from "#/libs/store/contacts.ts";

const ManageContacts = () => {
    return (
        <>
            <h3>Manage Contacts</h3>
            <ul>
                {unarchivedContacts.value.map((contact) => {
                    return <li key={contact.id}>{contact.name}</li>;
                })}
            </ul>
        </>
    );
};

export default ManageContacts;
