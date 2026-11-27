import type { Claim, Contacts } from "#/types.d.ts";
import { formatIsoToDayMonth } from "#/libs/ISOToDateMonth.ts";
import { useComputed } from "@preact/signals";

interface ClaimsTable {
    caption: "Receivables" | "Debts";
    claims: Claim[];
    contact: Contacts;
}
const ClaimsTable = ({ caption, claims, contact }: ClaimsTable) => {
    const totalClaims = useComputed<number>(() => {
        return claims
            .filter((claim) => claim.contact_id === contact.id)
            .reduce((acc, curr) => acc + curr.value, 0);
    });

    const empty = !claims.some((claim) => claim.contact_id === contact.id);

    if (empty) return <p>No {caption}</p>;
    else {
        return (
            <table>
                <caption>{caption}</caption>
                <thead>
                    <tr>
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
                        <td colSpan={2}>Total</td>
                        <td>{totalClaims}</td>
                    </tr>
                </tfoot>
            </table>
        );
    }
};

export default ClaimsTable;
