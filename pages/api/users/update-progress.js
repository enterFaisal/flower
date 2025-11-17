import fs from "fs";
import path from "path";
import { backupUsersFile } from "../../../lib/backupUsers";

const usersFilePath = path.join(process.cwd(), "data", "users.json");

function readUsers() {
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }

  const data = fs.readFileSync(usersFilePath, "utf8");
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse users file:", error);
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
  // Create backup after writing
  backupUsersFile(usersFilePath);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      userId,
      phone,
      level,
      flower,
      commitmentPercentage,
    } = req.body || {};

    if (!userId && !phone) {
      return res.status(400).json({ error: "userId or phone is required" });
    }

    const sanitizedPhone = phone ? phone.trim().replace(/\s+/g, "") : null;
    const users = readUsers();

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userIndex = users.findIndex((user) => {
      if (userId && user.id === userId) {
        return true;
      }
      if (sanitizedPhone && user.phone === sanitizedPhone) {
        return true;
      }
      return false;
    });

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[userIndex];

    // Initialize flower object if it doesn't exist
    if (!user.flower) {
      user.flower = {};
    }

    // Log current state
    const currentLevelBefore =
      typeof user.flower.level === "number" ? user.flower.level : 0;
    console.log(
      `[Update Progress] User: ${user.name || user.phone}, Current level: ${currentLevelBefore}, New level: ${level}`
    );

    // Update level first using Math.max to ensure it only increases
    if (typeof level === "number") {
      const currentLevel =
        typeof user.flower.level === "number" ? user.flower.level : 0;
      const newLevel = Math.max(currentLevel, level);
      user.flower.level = newLevel;
      console.log(
        `[Update Progress] Level updated from ${currentLevel} to ${newLevel}`
      );
    }

    // Update flower properties, but preserve the level that was just set
    // This prevents the flower object from overwriting a higher level
    if (flower && typeof flower === "object") {
      const preservedLevel = user.flower.level; // Save current level
      user.flower = {
        ...user.flower,
        ...flower,
      };
      // Restore level if it was decreased by the spread
      if (typeof preservedLevel === "number") {
        const newLevel = user.flower.level || 0;
        user.flower.level = Math.max(preservedLevel, newLevel);
      }
    }

    if (typeof commitmentPercentage === "number") {
      user.commitmentPercentage = commitmentPercentage;
    }

    user.updatedAt = new Date().toISOString();
    users[userIndex] = user;
    writeUsers(users);

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Update progress error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
