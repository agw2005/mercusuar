-- no-transaction
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- 1. Drop triggers that reference Transactions so ALTER TABLE validation succeeds
DROP TRIGGER IF EXISTS trg_archive_or_delete_category;
DROP TRIGGER IF EXISTS trg_archive_or_delete_account;

-- 2. Rebuild Transactions with REAL affinity
CREATE TABLE Transactions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    value REAL NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (account_id) REFERENCES Accounts(id)
);

INSERT INTO Transactions_new (id, category_id, account_id, value, description, date)
SELECT id, category_id, account_id, CAST(value AS REAL), description, date
FROM Transactions;

DROP TABLE Transactions;
ALTER TABLE Transactions_new RENAME TO Transactions;

-- 3. Recreate all indexes on Transactions
CREATE INDEX idx_transactions_category_id ON Transactions(category_id);
CREATE INDEX idx_transactions_account_id ON Transactions(account_id);
CREATE INDEX idx_transactions_date ON Transactions(date);
CREATE INDEX idx_transactions_account_date_value ON Transactions(account_id, date, value);

-- 4. Recreate the triggers
CREATE TRIGGER trg_archive_or_delete_category
BEFORE DELETE ON Categories
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Transactions WHERE category_id = OLD.id)
BEGIN
    UPDATE Categories SET archived = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;

CREATE TRIGGER trg_archive_or_delete_account
BEFORE DELETE ON Accounts
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Transactions WHERE account_id = OLD.id)
BEGIN
    UPDATE Accounts SET archived = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;

COMMIT;

PRAGMA foreign_keys = ON;