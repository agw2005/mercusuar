import { useComputed, useSignal } from "@preact/signals";
import GenericForm from "#/components/GenericForm.tsx";
import handleSubmit from "#view/Ledger/handleSubmit.ts";
import { useEffect } from "preact/hooks";
import { refetchAllCategories } from "#/libs/store/categories.ts";
import { allAccounts, refetchAllAccounts } from "#/libs/store/accounts.ts";
import {
    refetchUnarchivedContacts,
    unarchivedContacts,
} from "#/libs/store/contacts.ts";
import { refetchUnarchivedFundTypes } from "#/libs/store/fundType.ts";
import type { Investment_Lots, Investments } from "#/types.d.ts";
import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";
import {
    refetchInvestments,
    unarchivedInvestments,
} from "#/libs/store/investments.ts";
import {
    allHeldLots,
    refetchInvestmentLots,
} from "#/libs/store/investmentLots.ts";
import Layout from "#/components/Layout.tsx";
import Categories from "./Categories/Categories";
import Accounts from "./Accounts/Accounts";
import Contacts from "./Contacts/Contacts";
import FundTypes from "./FundTypes/FundTypes";
import Transactions from "./Transactions/Transactions";
import { ACCOUNT } from "#/libs/systemsId.ts";
import { selectedDate } from "./selectedDate";
import InvestmentsSection from "./Investments/Investments";

const Ledger = () => {
    const newLotSelectedAssetId = useSignal<number | null>(null);
    const selectedAccountId = useSignal<number | null>(null);
    const existingLotSelectedAssetId = useSignal<number | null>(null);
    const existingLotSelectedLotId = useSignal<number | null>(null);

    const newLotselectedAsset = useComputed<Investments | null>(() => {
        const id = newLotSelectedAssetId.value;
        if (!id) return null;
        return unarchivedInvestments.value.find((asset) => asset.id === id) ||
            null;
    });

    const existingLotSelectedAsset = useComputed<Investment_Lots | null>(() => {
        const id = existingLotSelectedAssetId.value;
        if (!id) return null;
        return allHeldLots.value.find((l) => l.id === id) ||
            null;
    });

    useEffect(() => {
        refetchAllCategories();
        refetchAllAccounts();
        refetchUnarchivedContacts();
        refetchUnarchivedFundTypes();
        refetchInvestments();
        refetchInvestmentLots();
    }, []);

    return (
        <Layout name={`Ledger`}>
            <Categories />
            <Accounts />
            <Contacts />
            <FundTypes />
            <Transactions />
            <InvestmentsSection />
            <section>
                <h2>Investment Lots</h2>
                <h3>Manage Lots</h3>
                <form>
                    {unarchivedInvestments.value.map((asset) => {
                        return (
                            <div key={asset.id}>
                                <label
                                    htmlFor={`existing_lot_asset_id_${asset.id}_element`}
                                >
                                    <input
                                        type="radio"
                                        name={`existing_lot_asset_id`}
                                        id={`existing_lot_asset_id_${asset.id}_element`}
                                        value={asset.id}
                                        checked={existingLotSelectedAssetId
                                            .value ===
                                            asset.id}
                                        onChange={(e) => {
                                            existingLotSelectedAssetId
                                                .value = Number(
                                                    e.currentTarget
                                                        .value,
                                                );
                                        }}
                                    />
                                    {asset.name}
                                </label>
                                {existingLotSelectedAssetId.value ===
                                        asset.id &&
                                    (
                                        <>
                                            {allHeldLots.value.filter((
                                                lot,
                                            ) => lot.investment_id ===
                                                asset.id
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
                                                                checked={existingLotSelectedLotId
                                                                    .value ===
                                                                    lot.id}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    existingLotSelectedLotId
                                                                        .value =
                                                                            Number(
                                                                                e.currentTarget
                                                                                    .value,
                                                                            );
                                                                }}
                                                            />
                                                            {lot.remaining_quantity}/{lot
                                                                .initial_quantity}
                                                            {" "}
                                                            unit
                                                            [{formatIsoToDayMonth(
                                                                lot.purchased_at,
                                                            )}:{" "}
                                                            {lot.unit_cost}/unit]
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                            <div>
                                                <label htmlFor="existing_lot_quantity_element">
                                                    Quantity to Sell
                                                    <input
                                                        required
                                                        disabled={!Boolean(
                                                            existingLotSelectedAssetId
                                                                .value,
                                                        )}
                                                        type="number"
                                                        min={Number
                                                            .MIN_VALUE}
                                                        max={existingLotSelectedAsset
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
                                                        disabled={!Boolean(
                                                            existingLotSelectedAssetId
                                                                .value,
                                                        )}
                                                        type="number"
                                                        min={Number
                                                            .MIN_VALUE}
                                                        defaultValue={unarchivedInvestments
                                                            .value.find((
                                                                a,
                                                            ) => a.id ===
                                                                existingLotSelectedAsset
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
                                                        disabled={!Boolean(
                                                            existingLotSelectedAssetId
                                                                .value,
                                                        )}
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
                                                    disabled={!Boolean(
                                                        existingLotSelectedAssetId
                                                            .value,
                                                    )}
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
                            value={String(newLotSelectedAssetId.value)}
                            onChange={(e) => {
                                newLotSelectedAssetId.value = Number(
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
                            disabled={!Boolean(newLotselectedAsset.value)}
                            type="number"
                            step="any"
                            min={Number.MIN_VALUE}
                            name="lot_quantity"
                            id="lot_quantity_element"
                        />
                    </label>
                    <label htmlFor="lot_current_price_element">
                        Current Price {!newLotselectedAsset.value
                            ? ""
                            : `(${newLotselectedAsset.value.unit})`}
                        <input
                            required
                            disabled={!Boolean(newLotselectedAsset.value)}
                            type="number"
                            step="any"
                            min={Number.MIN_VALUE}
                            name="lot_current_price"
                            id="lot_current_price_element"
                            defaultValue={newLotselectedAsset.value
                                ?.current_bid}
                        />
                    </label>
                    <label htmlFor="lot_source_account_element">
                        Source Account
                        <select
                            required
                            disabled={!Boolean(newLotselectedAsset.value)}
                            name="lot_source_account"
                            id="lot_source_account_element"
                            value={String(selectedAccountId.value)}
                            onChange={(e) => {
                                selectedAccountId.value = Number(
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
                    {selectedAccountId.value &&
                        (selectedAccountId.value === ACCOUNT.DEBT ||
                            selectedAccountId.value ===
                                ACCOUNT.RECEIVABLE) &&
                        (
                            <label htmlFor="lot_source_contact_element">
                                Contact
                                <select
                                    required
                                    disabled={!Boolean(
                                        newLotselectedAsset.value,
                                    )}
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
                    {newLotselectedAsset.value && (
                        <p>
                            Changing the current price will update the asset
                            unit price.
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
        </Layout>
    );
};

export default Ledger;
