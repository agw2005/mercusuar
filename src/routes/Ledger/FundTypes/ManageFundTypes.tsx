import { unarchivedFundTypes } from "#/libs/store/fundType.ts";

const ManageFundTypes = () => {
    return (
        <>
            <h3>Manage Fund Types</h3>
            <ul>
                {unarchivedFundTypes.value.map((fund_type) => {
                    return <li key={fund_type.id}>{fund_type.name}</li>;
                })}
            </ul>
        </>
    );
};

export default ManageFundTypes;
