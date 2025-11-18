import fs from "fs/promises";
import path from "path";

const sourceDbPath = path.join(process.cwd(), "data", "database.sqlite");
const backupDbPath = path.join(process.cwd(), "data", "database.sqlite.backup");

export async function backupDatabase() {
  try {
    await fs.copyFile(sourceDbPath, backupDbPath);
    // console.log("Database backup created successfully."); // This might be too noisy
  } catch (error) {
    console.error("Failed to create database backup:", error);
  }
}
