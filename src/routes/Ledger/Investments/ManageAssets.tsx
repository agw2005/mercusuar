import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";
import { allFundTypes } from "#/libs/store/fundType.ts";
import { unarchivedInvestments } from "#/libs/store/investments.ts";

const ManageAssets = () => {
  return (
    <section>
      <h3>Manage Assets</h3>
      <ul>
        {unarchivedInvestments.value.map((asset) => (
          <li key={asset.id}>
            {asset.name}{" "}
            ({allFundTypes.value.find((fundType) =>
              fundType.id === asset.fund_type_id
            )?.name}) [{formatIsoToDayMonth(
              asset.last_updated,
            )}: {asset.unit} = {asset.current_bid}]
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ManageAssets;
