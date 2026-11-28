import { allFundTypes } from "#/libs/store/fundType.ts";
import type { FundTypes } from "#/types.d.ts";
import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { closeModalOutsideBox } from "#/libs/closeModalOutsideBox.ts";
import handleSubmit from "#view/Ledger/handleSubmit.ts";

const ManageFundTypes = () => {
  const modal = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const modalFundType = useSignal<FundTypes | null>(null);

  return (
    <section>
      <h3>Manage Fund Types</h3>
      <ul>
        {allFundTypes.value
          .filter((fund_type) => !fund_type.archived)
          .map((fund_type) => {
            return (
              <li key={fund_type.id}>
                <button
                  type="button"
                  onClick={() => {
                    modalFundType.value = fund_type;
                    modal.current?.showModal();
                  }}
                >
                  &#9998;
                </button>
                {fund_type.name}
              </li>
            );
          })}
      </ul>

      <dialog
        ref={modal}
        onClose={() => {
          form.current?.reset();
          modalFundType.value = null;
        }}
        onClick={(e) => closeModalOutsideBox(e, modal)}
      >
        <form
          ref={form}
          data-form-type="edit_fund_type"
          onSubmit={handleSubmit}
        >
          <label htmlFor="edit_fund_type_fund_type_id_element">
            ID{" "}
            <input
              type="number"
              readOnly
              value={modalFundType.value?.id}
              placeholder={String(modalFundType.value?.id)}
              name="edit_fund_type_fund_type_id"
              id="edit_fund_type_fund_type_id_element"
            />
          </label>

          <input
            type="hidden"
            value={modalFundType.value?.name}
            name="edit_fund_type_fund_type_name"
          />

          <label htmlFor="edit_fund_type_new_name_element">
            Name{" "}
            <input
              type="text"
              name="edit_fund_type_new_name"
              id="edit_fund_type_new_name_element"
              placeholder={modalFundType.value?.name}
            />
          </label>

          <input
            type="hidden"
            value={modalFundType.value?.color}
            name="edit_fund_type_fund_type_color"
          />

          <label htmlFor="edit_fund_type_new_color_element">
            Color{" "}
            <input
              type="color"
              name="edit_fund_type_new_color"
              id="edit_fund_type_new_color_element"
              defaultValue={modalFundType.value?.color}
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
            name="edit_fund_type_save"
            value="true"
          >
            Save
          </button>
          <button
            type="submit"
            name="edit_fund_type_save"
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

export default ManageFundTypes;
