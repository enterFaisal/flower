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
  try {
    // Write to a temporary file first, then rename (atomic operation)
    const tempFilePath = usersFilePath + ".tmp";
    fs.writeFileSync(tempFilePath, JSON.stringify(users, null, 2), "utf8");
    fs.renameSync(tempFilePath, usersFilePath);
    // Create backup after writing
    backupUsersFile(usersFilePath);
  } catch (error) {
    console.error("Error writing users file:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, phone, level, flower, commitmentPercentage } =
      req.body || {};

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
      `[Update Progress] User: ${
        user.name || user.phone
      }, Current level: ${currentLevelBefore}, New level: ${level}`
    );

    // CRITICAL: Update level FIRST and ensure it's always preserved
    // This must happen before any flower object updates to prevent overwriting
    let targetLevel = null;
    if (typeof level === "number") {
      const currentLevel =
        typeof user.flower.level === "number" ? user.flower.level : 0;
      targetLevel = Math.max(currentLevel, level);
      // Set level immediately and ensure it's not overwritten
      user.flower.level = targetLevel;
      console.log(
        `[Update Progress] Level set to ${targetLevel} (was ${currentLevel}, requested ${level})`
      );
    } else {
      // Preserve existing level if no new level provided
      targetLevel =
        typeof user.flower.level === "number" ? user.flower.level : 0;
    }

    // Update flower properties, but ALWAYS preserve the level that was just set
    // This prevents the flower object from overwriting a higher level
    if (flower && typeof flower === "object") {
      // Remove level from flower object if present to prevent conflicts
      const { level: flowerLevel, ...flowerWithoutLevel } = flower;
      user.flower = {
        ...user.flower,
        ...flowerWithoutLevel,
      };
      // CRITICAL: Always restore/update level after spreading flower object
      // This ensures level is never decreased
      if (typeof targetLevel === "number") {
        const currentLevelAfterSpread =
          typeof user.flower.level === "number" ? user.flower.level : 0;
        user.flower.level = Math.max(targetLevel, currentLevelAfterSpread);
        console.log(
          `[Update Progress] Level preserved after flower update: ${user.flower.level}`
        );
      }
    }

    if (typeof commitmentPercentage === "number") {
      user.commitmentPercentage = commitmentPercentage;
    }

    user.updatedAt = new Date().toISOString();
    users[userIndex] = user;

    // Write users file and verify it was written correctly
    try {
      writeUsers(users);

      // Verify the write by reading back and checking the level
      const verifyUsers = readUsers();
      const verifyUser = verifyUsers.find((u) => {
        if (userId && u.id === userId) return true;
        if (sanitizedPhone && u.phone === sanitizedPhone) return true;
        return false;
      });

      if (verifyUser && verifyUser.flower) {
        const verifiedLevel = verifyUser.flower.level || 0;
        console.log(
          `[Update Progress] Verification: Level in file is ${verifiedLevel}, expected ${user.flower.level}`
        );
        if (typeof targetLevel === "number" && verifiedLevel !== targetLevel) {
          console.error(
            `[Update Progress] WARNING: Level mismatch! File has ${verifiedLevel}, expected ${targetLevel}`
          );
          // Try to fix it
          verifyUser.flower.level = targetLevel;
          verifyUser.updatedAt = new Date().toISOString();
          const verifyUserIndex = verifyUsers.findIndex((u) => {
            if (userId && u.id === userId) return true;
            if (sanitizedPhone && u.phone === sanitizedPhone) return true;
            return false;
          });
          if (verifyUserIndex !== -1) {
            verifyUsers[verifyUserIndex] = verifyUser;
            writeUsers(verifyUsers);
            console.log(
              `[Update Progress] Fixed level mismatch, retried write`
            );
          }
        }
      }
    } catch (writeError) {
      console.error("[Update Progress] Error writing users file:", writeError);
      throw writeError;
    }

    return res.status(200).json({
      success: true,
      user,
      levelUpdated: typeof level === "number",
      finalLevel: user.flower.level,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
