PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    positive BOOLEAN NOT NULL DEFAULT 1,
    stackable BOOLEAN NOT NULL DEFAULT 0,
    metric TEXT,
    quantity DECIMAL,
    output DECIMAL NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Trackers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date DATETIME NOT NULL,
    quantity DECIMAL NOT NULL,
    description TEXT,
    FOREIGN KEY (habit_id) REFERENCES Habits(id)
);
CREATE INDEX IF NOT EXISTS idx_tracker_habit_id ON Trackers(habit_id);
CREATE INDEX IF NOT EXISTS idx_tracker_date ON Trackers(date);

/*
You can run `DELETE FROM ... WHERE id = ?` without a separate conditional logic to check for usage first.
*/

-- On Habits deletion
CREATE TRIGGER IF NOT EXISTS trg_archive_or_delete_habit
BEFORE DELETE ON Habits
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Trackers WHERE habit_id = OLD.id)
BEGIN
    UPDATE Habits SET archived = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;