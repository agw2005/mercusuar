import { db } from "#/libs/db.ts";

export const debtsQuery = {
    post: (t: number, c: number) =>
        db.execute(
            `INSERT INTO Debts (transaction_id, contact_id) VALUES ($1, $2)`,
            [t, c],
        ),
};
