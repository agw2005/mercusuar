import { allCategories } from "#/libs/store/categories.ts";
import { useRef } from "preact/hooks";
import type { Categories } from "#/types.d.ts";
import { useSignal } from "@preact/signals";
import handleSubmit from "#view/Ledger/handleSubmit.ts";

const ManageCategories = () => {
    const editCategoryModal = useRef<HTMLDialogElement>(null);
    const editCategoryForm = useRef<HTMLFormElement>(null);
    const focusedCategory = useSignal<Categories | null>(null);

    return (
        <>
            <h3>Manage Categories</h3>
            <ul>
                {allCategories.value
                    .filter((category) =>
                        !category.is_system && !category.archived
                    )
                    .map((category) => (
                        <li key={category.id}>
                            <button
                                type="button"
                                onClick={() => {
                                    focusedCategory.value = category;
                                    editCategoryModal.current?.showModal();
                                }}
                            >
                                &#9998;
                            </button>
                            {category.name}
                        </li>
                    ))}
            </ul>

            <dialog
                ref={editCategoryModal}
                onClose={() => {
                    editCategoryForm.current?.reset();
                    focusedCategory.value = null;
                }}
                onClick={(e) => {
                    if (!editCategoryModal.current) return;
                    const modalDimensions = editCategoryModal
                        .current
                        .getBoundingClientRect();
                    if (
                        e.clientX < modalDimensions.left ||
                        e.clientX > modalDimensions.right ||
                        e.clientY < modalDimensions.top ||
                        e.clientY > modalDimensions.bottom
                    ) {
                        editCategoryModal.current.close();
                    }
                }}
            >
                <form
                    ref={editCategoryForm}
                    data-form-type="edit_category"
                    onSubmit={handleSubmit}
                >
                    <label htmlFor="edit_category_category_id_element">
                        ID{" "}
                        <input
                            type="number"
                            readOnly
                            value={focusedCategory.value?.id}
                            placeholder={String(focusedCategory.value?.id)}
                            name="edit_category_category_id"
                            id="edit_category_category_id_element"
                        />
                    </label>

                    <input
                        type="hidden"
                        value={focusedCategory.value?.name}
                        name="edit_category_category_name"
                    />

                    <label htmlFor="edit_category_new_name_element">
                        Name{" "}
                        <input
                            type="text"
                            name="edit_category_new_name"
                            id="edit_category_new_name_element"
                            placeholder={focusedCategory.value?.name}
                        />
                    </label>

                    <input
                        type="hidden"
                        value={focusedCategory.value?.color}
                        name="edit_category_category_color"
                    />

                    <label htmlFor="edit_category_new_color_element">
                        Color{" "}
                        <input
                            type="color"
                            name="edit_category_new_color"
                            id="edit_category_new_color_element"
                            defaultValue={focusedCategory.value?.color}
                        />
                    </label>

                    <button
                        type="submit"
                        formMethod="dialog"
                        formNoValidate
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        name="edit_category_save"
                        value="true"
                    >
                        Save
                    </button>
                    <button
                        type="submit"
                        name="edit_category_save"
                        value=""
                        formNoValidate
                    >
                        Delete
                    </button>
                </form>
            </dialog>
        </>
    );
};

export default ManageCategories;
