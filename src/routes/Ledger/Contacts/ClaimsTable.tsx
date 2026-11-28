import type { Claim, Contacts } from "#/types.d.ts";
import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";

interface ClaimsTableProps {
  claims: Claim[];
  contact: Contacts;
}

const ClaimsTable = ({ claims, contact }: ClaimsTableProps) => {
  const contactClaims = claims.filter(
    (claim) => claim.contact_id === contact.id,
  );

  if (contactClaims.length === 0) {
    return <p>No claims.</p>;
  }

  const totalClaims = contactClaims.reduce((acc, curr) => {
    return curr.claim_type === "r" ? acc + curr.value : acc - curr.value;
  }, 0);

  return (
    <table>
      <thead>
        <tr>
          <th>Claim</th>
          <th>Date</th>
          <th>Description</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        {contactClaims.map((claim) => (
          <tr key={`${claim.claim_type}-${claim.id}`}>
            <td>
              {claim.claim_type === "d" ? "Debt" : "Receivable"}
            </td>
            <td>{formatIsoToDayMonth(claim.date)}</td>
            <td>{claim.description}</td>
            <td>{claim.value}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          {totalClaims === 0
            ? (
              <>
                <td colSpan={3}>
                  Nothing owed or obligated.
                </td>
                <td>{totalClaims}</td>
              </>
            )
            : (
              <>
                <td colSpan={3}>
                  Amount {totalClaims < 0 ? "Owed" : "Obligated"}
                </td>
                <td>{Math.abs(totalClaims)}</td>
              </>
            )}
        </tr>
      </tfoot>
    </table>
  );
};

export default ClaimsTable;
