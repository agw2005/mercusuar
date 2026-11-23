import { db } from "#/libs/db.ts";

export const receivablesQuery = {
    post: (t: number, c: number) =>
        db.execute(
            `INSERT INTO Receivables (transaction_id, contact_id) VALUES ($1, $2)`,
            [t, c],
        ),
};
