import type { Claim, Contacts } from "#/types.d.ts";
import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";
import { useComputed } from "@preact/signals";

interface ClaimsTable {
    claims: Claim[];
    contact: Contacts;
}
const ClaimsTable = ({ claims, contact }: ClaimsTable) => {
    const totalClaims = useComputed<number>(() => {
        return claims
            .filter((claim) => claim.contact_id === contact.id)
            .reduce((acc, curr) => {
                return curr.claim_type === "r"
                    ? acc + curr.value
                    : acc - curr.value;
            }, 0);
    });

    const empty = !claims.some((claim) => claim.contact_id === contact.id);

    if (empty) return <p>No claims.</p>;
    else {
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
                    {claims
                        .filter((claim) =>
                            claim.contact_id ===
                                contact.id
                        )
                        .map((claim) => (
                            <tr key={claim.id}>
                                <td>
                                    {claim.claim_type === "d"
                                        ? "Debt"
                                        : "Receivable"}
                                </td>
                                <td>
                                    {formatIsoToDayMonth(
                                        claim.date,
                                    )}
                                </td>
                                <td>
                                    {claim.description}
                                </td>
                                <td>{claim.value}</td>
                            </tr>
                        ))}
                </tbody>
                <tfoot>
                    <tr>
                        {totalClaims.value === 0
                            ? (
                                <>
                                    <td colSpan={3}>
                                        Nothing owned or obligated.
                                    </td>
                                    <td>{totalClaims.value}</td>
                                </>
                            )
                            : (
                                <>
                                    <td colSpan={3}>
                                        Amount {totalClaims.value < 0
                                            ? "Owed"
                                            : "Obligated"}
                                    </td>
                                    <td>{Math.abs(totalClaims.value)}</td>
                                </>
                            )}
                    </tr>
                </tfoot>
            </table>
        );
    }
};

export default ClaimsTable;
