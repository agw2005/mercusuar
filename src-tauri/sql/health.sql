CREATE TABLE IF NOT EXISTS Weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    weight DECIMAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_weights_date ON Weights(date);

CREATE TABLE IF NOT EXISTS Sleeps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start DATETIME NOT NULL,
    end DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sleeps_date ON Sleeps(end);

CREATE TABLE IF NOT EXISTS Targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    weight DECIMAL NOT NULL,
    body_fat DECIMAL NOT NULL
);

CREATE TABLE IF NOT EXISTS Progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    age INTEGER NOT NULL,
    height DECIMAL NOT NULL,
    weight DECIMAL NOT NULL,
    neck DECIMAL NOT NULL,
    waist DECIMAL NOT NULL,
    body_fat DECIMAL NOT NULL
);

CREATE TABLE IF NOT EXISTS Exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    active BOOLEAN NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    archive BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL,
    date DATE NOT NULL,
    bar INTEGER NOT NULL DEFAULT 0,
    kilogram DECIMAL NOT NULL,
    pound DECIMAL NOT NULL,
    repetition INTEGER NOT NULL,
    seconds INTEGER NOT NULL,
    rpe INTEGER NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES Exercises(id)
);
CREATE INDEX IF NOT EXISTS idx_entry_habit_id ON Entries(exercise_id);
CREATE INDEX IF NOT EXISTS idx_entry_date ON Entries(date);

/*
You can run `DELETE FROM ... WHERE id = ?` without a separate conditional logic to check for usage first.
*/

-- On Exercises deletion
CREATE TRIGGER IF NOT EXISTS trg_archive_or_delete_exercise
BEFORE DELETE ON Exercises
FOR EACH ROW
WHEN EXISTS (SELECT 1 FROM Entries WHERE exercise_id = OLD.id)
BEGIN
    UPDATE Exercises SET archive = 1 WHERE id = OLD.id;
    SELECT RAISE(IGNORE);
END;