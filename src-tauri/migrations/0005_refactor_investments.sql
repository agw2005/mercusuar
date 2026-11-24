-- no-transaction
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- 1. Drop trigger referencing the old Investments table
DROP TRIGGER IF EXISTS trg_archive_or_delete_fund_type;

-- 2. Rebuild Investments as the shared Asset table (using REAL affinity)
CREATE TABLE Investments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fund_type_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_bid REAL NOT NULL,
    last_updated DATETIME NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (fund_type_id) REFERENCES Fund_Types(id)
);

-- Preserve any existing asset metadata (maps old status=0 to archived=1)
INSERT INTO Investments_new (id, fund_type_id, name, unit, current_bid, last_updated, archived)
SELECT
    id,
    fund_type_id,
    name,
    unit,
    CAST(bid AS REAL),
    last_updated,
    CASE WHEN status = 0 THEN 1 ELSE 0 END
FROM Investments;

DROP TABLE Investments;
ALTER TABLE Investments_new RENAME TO Investments;

CREATE INDEX idx_investments_fund_type_id ON Investments(fund_type_id);

-- 3. Create Investment_Lots (individual purchases / tax lots)
CREATE TABLE Investment_Lots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investment_id INTEGER NOT NULL,
    buy_transaction_id INTEGER NOT NULL,
    initial_quantity REAL NOT NULL CHECK (initial_quantity > 0),
    remaining_quantity REAL NOT NULL CHECK (remaining_quantity >= 0 AND remaining_quantity <= initial_quantity),
    unit_cost REAL NOT NULL,
    holding BOOLEAN NOT NULL DEFAULT 1,
    purchased_at DATETIME NOT NULL,
    FOREIGN KEY (investment_id) REFERENCES Investments(id),
    FOREIGN KEY (buy_transaction_id) REFERENCES Transactions(id) ON DELETE CASCADE
);
CREATE INDEX idx_lots_investment_id ON Investment_Lots(investment_id);
CREATE INDEX idx_lots_buy_transaction_id ON Investment_Lots(buy_transaction_id);
CREATE INDEX idx_lots_holding ON Investment_Lots(holding);

-- 4. Create Investment_Sales (partial or full sales against a specific lot)
CREATE TABLE Investment_Sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lot_id INTEGER NOT NULL,
    proceeds_transaction_id INTEGER NOT NULL, -- The +$ cash entering destination account
    basis_transaction_id INTEGER NOT NULL,    -- The -$ cost basis leaving investment account
    quantity_sold REAL NOT NULL CHECK (quantity_sold > 0),
    unit_price REAL NOT NULL,                 -- Actual bid price at time of sale
    sold_at DATETIME NOT NULL,
    FOREIGN KEY (lot_id) REFERENCES Investment_Lots(id),
    FOREIGN KEY (proceeds_transaction_id) REFERENCES Transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (basis_transaction_id) REFERENCES Transactions(id) ON DELETE CASCADE
);
CREATE INDEX idx_sales_lot_id ON Investment_Sales(lot_id);
CREATE INDEX idx_sales_proceeds_transaction_id ON Investment_Sales(proceeds_transaction_id);
CREATE INDEX idx_sales_basis_transaction_id ON Investment_Sales(basis_transaction_id);

-- 5. Recreate Fund_Types deletion trigger & add Investments protection trigger
CREATE TRIGGER trg_archive_or_delete_fund_type
BEFORE DELETE ON Fund_Types
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Investments WHERE fund_type_id = OLD.id)
BEGIN
    UPDATE Fund_Types SET archived = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;

CREATE TRIGGER trg_archive_or_delete_investment
BEFORE DELETE ON Investments
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Investment_Lots WHERE investment_id = OLD.id)
BEGIN
    UPDATE Investments SET archived = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;

COMMIT;

PRAGMA foreign_keys = ON;