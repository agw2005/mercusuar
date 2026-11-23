import Database from "@tauri-apps/plugin-sql";

export const db = await Database.load("sqlite:test.db");

export const get = {
    categories: {
        all_unarchived: `SELECT * FROM Categories WHERE archived = 0;`,
    },
};

export const post = {
    category: `INSERT INTO Categories (name) VALUES ($1)`,
};
