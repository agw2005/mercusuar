import GenericForm from "#/components/GenericForm.tsx";
import { allAccounts } from "#/libs/store/accounts.ts";
import { unarchivedContacts } from "#/libs/store/contacts.ts";
import { unarchivedInvestments } from "#/libs/store/investments.ts";
import { ACCOUNT } from "#/libs/systemsId.ts";
import handleSubmit from "#view/Ledger/handleSubmit.ts";
import { selectedDate } from "#view/Ledger/selectedDate.ts";
import { useComputed, useSignal } from "@preact/signals";
import type { Investments } from "#/types.d.ts";

const NewLot = () => {
  const assetId = useSignal<number | null>(null);
  const accountId = useSignal<number | null>(null);

  const asset = useComputed<Investments | null>(() => {
    const id = assetId.value;
    if (!id) return null;
    return unarchivedInvestments.value.find((asset) => asset.id === id) ||
      null;
  });

  return (
    <section>
      <h3>New Lot</h3>
      <GenericForm
        options={{
          formName: "investment_lot",
          onSubmit: handleSubmit,
        }}
      >
        <label htmlFor="lot_asset_element">
          Asset
          <select
            required
            name="lot_asset"
            id="lot_asset_element"
            value={String(assetId.value)}
            onChange={(e) => {
              assetId.value = Number(
                e.currentTarget.value,
              );
            }}
          >
            {unarchivedInvestments.value.map(
              (asset) => {
                return (
                  <option
                    key={asset.id}
                    value={asset.id}
                  >
                    {asset.name}
                  </option>
                );
              },
            )}
          </select>
        </label>
        <label htmlFor="lot_quantity_element">
          Quantity
          <input
            required
            disabled={!asset.value}
            type="number"
            step="any"
            min={Number.MIN_VALUE}
            name="lot_quantity"
            id="lot_quantity_element"
          />
        </label>
        <label htmlFor="lot_current_price_element">
          Current Price {!asset.value ? "" : `(${asset.value.unit})`}
          <input
            required
            disabled={!asset.value}
            type="number"
            step="any"
            min={Number.MIN_VALUE}
            name="lot_current_price"
            id="lot_current_price_element"
            defaultValue={asset.value
              ?.current_bid}
          />
        </label>
        <label htmlFor="lot_source_account_element">
          Source Account
          <select
            required
            disabled={!asset.value}
            name="lot_source_account"
            id="lot_source_account_element"
            value={String(accountId.value)}
            onChange={(e) => {
              accountId.value = Number(
                e.currentTarget.value,
              );
            }}
          >
            {allAccounts.value.filter((a) =>
              !a.archived &&
              a.id !== ACCOUNT.INVESTMENT
            )
              .map(
                (account) => {
                  return (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.name}
                    </option>
                  );
                },
              )}
          </select>
        </label>
        {accountId.value &&
          (accountId.value === ACCOUNT.DEBT ||
            accountId.value ===
              ACCOUNT.RECEIVABLE) &&
          (
            <label htmlFor="lot_source_contact_element">
              Contact
              <select
                required
                disabled={!asset.value}
                name="lot_source_contact"
                id="lot_source_contact_element"
              >
                {unarchivedContacts.value.map(
                  (contact) => {
                    return (
                      <option
                        key={contact.id}
                        value={contact.id}
                      >
                        {contact.name}
                      </option>
                    );
                  },
                )}
              </select>
            </label>
          )}

        {asset.value && (
          <p>
            Changing the current price will update the asset unit price.
          </p>
        )}

        {/* For refetch */}
        <input
          type="hidden"
          name="selected_date"
          value={selectedDate.value}
        />
      </GenericForm>
    </section>
  );
};

export default NewLot;
