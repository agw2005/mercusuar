import GenericForm from "#/components/GenericForm.tsx";
import { allFundTypes } from "#/libs/store/fundType.ts";
import handleSubmit from "#view/Ledger/handleSubmit.ts";

const NewAsset = () => {
  return (
    <>
      <h3>New Asset</h3>
      <GenericForm
        options={{
          formName: "investment_asset",
          onSubmit: handleSubmit,
        }}
      >
        <label htmlFor="investment_asset_fund_type_element">
          Fund Type
          <select
            name="investment_asset_fund_type"
            id="investment_asset_fund_type_element"
          >
            {allFundTypes.value
              .filter((fund_type) => !fund_type.archived)
              .map((fund_type) => {
                return (
                  <option
                    key={fund_type.id}
                    value={fund_type.id}
                  >
                    {fund_type.name}
                  </option>
                );
              })}
          </select>
        </label>
        <label htmlFor="investment_asset_name_element">
          Name
          <input
            required
            type="text"
            name="investment_asset_name"
            id="investment_asset_name_element"
          />
        </label>
        <label htmlFor="investment_asset_unit_element">
          Unit
          <input
            required
            type="text"
            name="investment_asset_unit"
            id="investment_asset_unit_element"
            placeholder="Ex: 1 mBTC"
          />
        </label>
        <label htmlFor="investment_asset_current_bid_element">
          Current Bid Price
          <input
            required
            type="number"
            min={Number.MIN_VALUE}
            name="investment_asset_current_bid"
            id="investment_asset_current_bid_element"
            step="any"
          />
        </label>
      </GenericForm>
    </>
  );
};

export default NewAsset;
