// lib/backupUsers.js - Utility to backup users.json file

import fs from "fs";
import path from "path";

/**
 * Creates a backup of users.json in the parent directory of parent directory (../../)
 * @param {string} usersFilePath - Full path to the users.json file
 */
export function backupUsersFile(usersFilePath) {
  try {
    // Check if users.json exists
    if (!fs.existsSync(usersFilePath)) {
      console.warn("Users file does not exist, skipping backup");
      return;
    }

    // Get the backup directory (../../ from data/users.json)
    const backupDir = path.resolve(usersFilePath, "../../");

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create/locate today's backup file (one file per day)
    const now = new Date();
    const isoTimestamp = now.toISOString();
    const dailyStamp = isoTimestamp.split("T")[0]; // e.g. 2025-11-17
    const dailyBackupFileName = `users-${dailyStamp}.json`;
    const dailyBackupPath = path.join(backupDir, dailyBackupFileName);

    // Also create a latest backup without timestamp
    const latestBackupPath = path.join(backupDir, "users.json.backup");

    // Read the current users.json
    const usersData = fs.readFileSync(usersFilePath, "utf8");
    let usersJson;

    try {
      usersJson = JSON.parse(usersData);
    } catch (parseError) {
      console.error(
        "❌ Failed to parse users.json, skipping backup append:",
        parseError
      );
      return;
    }

    // Load existing daily backups (array of snapshots) if present
    let dailySnapshots = [];
    if (fs.existsSync(dailyBackupPath)) {
      try {
        const existingDailyData = fs.readFileSync(dailyBackupPath, "utf8");
        const parsedDailyData = JSON.parse(existingDailyData);
        if (Array.isArray(parsedDailyData)) {
          dailySnapshots = parsedDailyData;
        }
      } catch (dailyReadError) {
        console.warn(
          "⚠️ Unable to read today's backup file, creating a new one:",
          dailyReadError
        );
      }
    }

    // Append the current snapshot (timestamp + full users data)
    dailySnapshots.push({
      timestamp: isoTimestamp,
      data: usersJson,
    });

    fs.writeFileSync(
      dailyBackupPath,
      JSON.stringify(dailySnapshots, null, 2),
      "utf8"
    );

    // Write latest backup
    fs.writeFileSync(latestBackupPath, usersData, "utf8");

    console.log(`✅ Daily backup updated: ${dailyBackupPath}`);
    console.log(`✅ Latest backup: ${latestBackupPath}`);
  } catch (error) {
    console.error("❌ Error creating backup:", error);
    // Don't throw - backup failure shouldn't break the main operation
  }
}
