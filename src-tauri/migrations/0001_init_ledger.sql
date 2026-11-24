PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Fund_Types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    value DECIMAL NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (account_id) REFERENCES Accounts(id)
);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON Transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON Transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON Transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_account_date_value
ON Transactions(account_id, date, value);

CREATE TABLE IF NOT EXISTS Receivables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES Transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES Contacts(id)
);
CREATE INDEX IF NOT EXISTS idx_receivables_transaction_id ON Receivables(transaction_id);
CREATE INDEX IF NOT EXISTS idx_receivables_contact_id ON Receivables(contact_id);

CREATE TABLE IF NOT EXISTS Debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES Transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES Contacts(id)
);
CREATE INDEX IF NOT EXISTS idx_debts_transaction_id ON Debts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_debts_contact_id ON Debts(contact_id);

CREATE TABLE IF NOT EXISTS Investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fund_type_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity DECIMAL NOT NULL,
    ask DECIMAL NOT NULL,
    bid DECIMAL NOT NULL,
    status BOOLEAN NOT NULL DEFAULT 1,
    last_updated DATETIME NOT NULL,
    FOREIGN KEY (fund_type_id) REFERENCES Fund_Types(id)
);
CREATE INDEX IF NOT EXISTS idx_investments_fund_type_id ON Investments(fund_type_id);

/*
Seed the database & protect initial value from deletion/modification
*/

INSERT OR IGNORE INTO Categories (id, name, archived, is_system) VALUES 
    (1, 'Transfer', 0, 1),
    (2, 'Investment', 0, 1);

INSERT OR IGNORE INTO Accounts (id, name, archived, is_system) VALUES 
    (1, 'Receivable', 0, 1),
    (2, 'Debt', 0, 1),
    (3, 'Investment', 0, 1);

CREATE TRIGGER IF NOT EXISTS trg_protect_system_category_update
BEFORE UPDATE ON Categories
FOR EACH ROW
WHEN OLD.is_system = 1
BEGIN
    SELECT RAISE(ABORT, 'Default categories cannot be modified');
END;

CREATE TRIGGER IF NOT EXISTS trg_protect_system_category_delete
BEFORE DELETE ON Categories
FOR EACH ROW
WHEN OLD.is_system = 1
BEGIN
    SELECT RAISE(ABORT, 'Default categories cannot be deleted');
END;

CREATE TRIGGER IF NOT EXISTS trg_protect_system_account_update
BEFORE UPDATE ON Accounts
FOR EACH ROW
WHEN OLD.is_system = 1
BEGIN
    SELECT RAISE(ABORT, 'Default accounts cannot be modified');
END;

CREATE TRIGGER IF NOT EXISTS trg_protect_system_account_delete
BEFORE DELETE ON Accounts
FOR EACH ROW
WHEN OLD.is_system = 1
BEGIN
    SELECT RAISE(ABORT, 'Default accounts cannot be deleted');
END;

/*
You can run `DELETE FROM ... WHERE id = ?` without a separate conditional logic to check for usage first.
*/

-- On Categories deletion
CREATE TRIGGER IF NOT EXISTS trg_archive_or_delete_category
BEFORE DELETE ON Categories
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Transactions WHERE category_id = OLD.id)
BEGIN
    UPDATE Categories SET archived = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;

-- On Accounts deletion
CREATE TRIGGER IF NOT EXISTS trg_archive_or_delete_account
BEFORE DELETE ON Accounts
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Transactions WHERE account_id = OLD.id)
BEGIN
    UPDATE Accounts SET archived = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;

-- On Contacts deletion
CREATE TRIGGER IF NOT EXISTS trg_archive_or_delete_contact
BEFORE DELETE ON Contacts
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Receivables WHERE contact_id = OLD.id)
  OR EXISTS (SELECT 1 FROM Debts WHERE contact_id = OLD.id)
BEGIN
    UPDATE Contacts SET archived = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;

-- On Fund_Types deletion
CREATE TRIGGER IF NOT EXISTS trg_archive_or_delete_fund_type
BEFORE DELETE ON Fund_Types
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Investments WHERE fund_type_id = OLD.id)
BEGIN
    UPDATE Fund_Types SET archived = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;