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

    if (typeof level === "number") {
      if (!user.flower) {
        user.flower = {};
      }
      const currentLevel =
        typeof user.flower.level === "number" ? user.flower.level : 0;
      user.flower.level = Math.max(currentLevel, level);
    }

    if (flower && typeof flower === "object") {
      user.flower = {
        ...(user.flower || {}),
        ...flower,
      };
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
