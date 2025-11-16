import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const generateUserId = () => {
  try {
    return randomUUID();
  } catch (error) {
    return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, phone, employeeId } = req.body;

    // Validate input
    if (!name || !phone || !employeeId) {
      return res.status(400).json({ error: "Name, phone, and employee ID are required" });
    }

    const trimmedName = name.trim();
    const sanitizedPhone = phone.trim().replace(/\s+/g, "");
    const trimmedEmployeeId = employeeId.trim();

    // Validate that name has exactly 3 parts
    const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
    if (nameParts.length !== 3) {
      return res.status(400).json({ 
        error: "Name must consist of exactly 3 parts (first name, middle name, last name)" 
      });
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Path to users data file
    const usersFile = path.join(dataDir, "users.json");

    // Read existing users or create empty array
    let users = [];
    if (fs.existsSync(usersFile)) {
      const fileContent = fs.readFileSync(usersFile, "utf8");
      users = JSON.parse(fileContent);
    }

    const now = new Date().toISOString();

    // Match only when the same participant registers again (same name & phone)
    const existingUserIndex = users.findIndex(
      (u) => u.phone === sanitizedPhone && u.name === trimmedName
    );

    let userData;

    if (existingUserIndex >= 0) {
      userData = {
        ...users[existingUserIndex],
        name: trimmedName,
        phone: sanitizedPhone,
        employeeId: trimmedEmployeeId,
        updatedAt: now,
      };
      users[existingUserIndex] = userData;
    } else {
      userData = {
        id: generateUserId(),
        name: trimmedName,
        phone: sanitizedPhone,
        employeeId: trimmedEmployeeId,
        registeredAt: now,
        updatedAt: now,
      };
      users.push(userData);
    }

    // Save to file
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");

    return res.status(200).json({
      success: true,
      user: userData,
      message:
        existingUserIndex >= 0
          ? "User updated"
          : "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
