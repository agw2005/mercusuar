import { allCategories } from "#/libs/store/categories.ts";

const ManageCategories = () => {
    return (
        <>
            <h3>Manage Categories</h3>
            <ul>
                {allCategories.value.map((category) => {
                    return <li key={category.id}>{category.name}</li>;
                })}
            </ul>
        </>
    );
};

export default ManageCategories;
