import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";
import { allHeldLots } from "#/libs/store/investmentLots.ts";
import { unarchivedInvestments } from "#/libs/store/investments.ts";
import { useComputed, useSignal } from "@preact/signals";
import type { Investment_Lots } from "#/types.d.ts";

const ManageLots = () => {
  const lotId = useSignal<number | null>(null);
  const assetId = useSignal<number | null>(null);

  const asset = useComputed<Investment_Lots | null>(() => {
    const id = assetId.value;
    if (!id) return null;
    return allHeldLots.value.find((l) => l.id === id) ||
      null;
  });

  return (
    <section>
      <h3>Manage Lots</h3>
      <form>
        {unarchivedInvestments.value.map((unarchivedAsset) => {
          return (
            <div key={unarchivedAsset.id}>
              <label
                htmlFor={`existing_lot_asset_id_${unarchivedAsset.id}_element`}
              >
                <input
                  type="radio"
                  name={`existing_lot_asset_id`}
                  id={`existing_lot_asset_id_${unarchivedAsset.id}_element`}
                  value={unarchivedAsset.id}
                  checked={assetId
                    .value ===
                    unarchivedAsset.id}
                  onChange={(e) => {
                    assetId
                      .value = Number(
                        e.currentTarget
                          .value,
                      );
                  }}
                />
                {unarchivedAsset.name}
              </label>
              {assetId.value ===
                  unarchivedAsset.id &&
                (
                  <>
                    {allHeldLots.value.filter((
                      lot,
                    ) =>
                      lot.investment_id ===
                        unarchivedAsset.id
                    ).map((lot) => {
                      return (
                        <div key={lot.id}>
                          <label
                            htmlFor={`existing_lot_id_${lot.id}_element`}
                          >
                            <input
                              type="radio"
                              name={`existing_lot_id_${lot.id}`}
                              id={`existing_lot_id_${lot.id}_element`}
                              value={lot
                                .id}
                              checked={lotId
                                .value ===
                                lot.id}
                              onChange={(
                                e,
                              ) => {
                                lotId
                                  .value = Number(
                                    e.currentTarget
                                      .value,
                                  );
                              }}
                            />
                            {lot.remaining_quantity}/{lot
                              .initial_quantity} unit [{formatIsoToDayMonth(
                                lot.purchased_at,
                              )}: {lot.unit_cost}/unit]
                          </label>
                        </div>
                      );
                    })}
                    <div>
                      <label htmlFor="existing_lot_quantity_element">
                        Quantity to Sell
                        <input
                          required
                          disabled={!assetId.value}
                          type="number"
                          min={Number
                            .MIN_VALUE}
                          max={asset
                            .value
                            ?.remaining_quantity}
                          step="any"
                          name="existing_lot_quantity"
                          id="existing_lot_quantity_element"
                        />
                      </label>
                      <label htmlFor="existing_lot_current_price_element">
                        Current Price
                        <input
                          required
                          disabled={!assetId.value}
                          type="number"
                          min={Number
                            .MIN_VALUE}
                          defaultValue={unarchivedInvestments
                            .value.find((
                              a,
                            ) =>
                              a.id ===
                                asset
                                  .value
                                  ?.investment_id
                            )?.current_bid}
                          step="any"
                          name="existing_lot_current_price"
                          id="existing_lot_current_price_element"
                        />
                      </label>
                      <label htmlFor="existing_lot_date_element">
                        Sold at
                        <input
                          required
                          disabled={!assetId.value}
                          type="datetime-local"
                          name="existing_lot_date"
                          id="existing_lot_date_element"
                          defaultValue={new Date()
                            .toISOString()
                            .slice(0, 16)}
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={!assetId.value}
                      >
                        Sell
                      </button>
                    </div>
                  </>
                )}
            </div>
          );
        })}
      </form>
    </section>
  );
};

export default ManageLots;
