import { allCategories } from "#/libs/store/categories.ts";
import { useRef } from "preact/hooks";
import type { Categories } from "#/types.d.ts";
import { useSignal } from "@preact/signals";
import handleSubmit from "#view/Ledger/handleSubmit.ts";
import { closeModalOutsideBox } from "#/libs/closeModalOutsideBox.ts";

const ManageCategories = () => {
  const modal = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const selectedCategory = useSignal<Categories | null>(null);

  return (
    <section>
      <h3>Manage Categories</h3>
      <ul>
        {allCategories.value
          .filter((category) => !category.is_system && !category.archived)
          .map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => {
                  selectedCategory.value = category;
                  modal.current?.showModal();
                }}
              >
                &#9998;
              </button>
              {category.name}
            </li>
          ))}
      </ul>

      <dialog
        ref={modal}
        onClose={() => {
          form.current?.reset();
          selectedCategory.value = null;
        }}
        onClick={(e) => closeModalOutsideBox(e, modal)}
      >
        <form
          ref={form}
          data-form-type="edit_category"
          onSubmit={handleSubmit}
        >
          <label htmlFor="edit_category_category_id_element">
            ID{" "}
            <input
              type="number"
              readOnly
              value={selectedCategory.value?.id}
              placeholder={String(selectedCategory.value?.id)}
              name="edit_category_category_id"
              id="edit_category_category_id_element"
            />
          </label>

          <input
            type="hidden"
            value={selectedCategory.value?.name}
            name="edit_category_category_name"
          />

          <label htmlFor="edit_category_new_name_element">
            Name{" "}
            <input
              type="text"
              name="edit_category_new_name"
              id="edit_category_new_name_element"
              placeholder={selectedCategory.value?.name}
            />
          </label>

          <input
            type="hidden"
            value={selectedCategory.value?.color}
            name="edit_category_category_color"
          />

          <label htmlFor="edit_category_new_color_element">
            Color{" "}
            <input
              type="color"
              name="edit_category_new_color"
              id="edit_category_new_color_element"
              defaultValue={selectedCategory.value?.color}
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
    </section>
  );
};

export default ManageCategories;
