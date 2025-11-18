import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// Singleton instance to ensure only one database connection is opened.
let db = null;

export async function openDb() {
  if (db) {
    return db;
  }

  try {
    const dbPath = path.join(process.cwd(), "data", "database.sqlite");

    // Open the database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log("Database connection established.");

    // Run migrations to create the necessary tables.
    // The 'force' option is removed to prevent re-running migrations on every start.
    await db.migrate({
      migrationsPath: path.join(process.cwd(), "migrations"),
    });

    console.log("Database migrations applied successfully.");

    return db;
  } catch (error) {
    console.error("Failed to open or migrate database:", error);
    throw new Error("Could not initialize the database.");
  }
}
