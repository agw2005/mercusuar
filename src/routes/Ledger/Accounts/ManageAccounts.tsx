import { allAccounts } from "#/libs/store/accounts.ts";

const ManageAccounts = () => {
    return (
        <>
            <h3>Manage Accounts</h3>
            <ul>
                {allAccounts.value.map((account) => {
                    return <li key={account.id}>{account.name}</li>;
                })}
            </ul>
        </>
    );
};

export default ManageAccounts;
