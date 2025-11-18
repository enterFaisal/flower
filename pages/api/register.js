import { randomUUID } from "crypto";
import { openDb } from "../../lib/db";
import { backupDatabase } from "../../lib/backupDb";

const generateUserId = () => {
  try {
    return randomUUID();
  } catch (error) {
    // Fallback for environments without crypto.randomUUID
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
      return res
        .status(400)
        .json({ error: "Name, phone, and employee ID are required" });
    }

    const trimmedName = name.trim();
    const sanitizedPhone = phone.trim().replace(/\s+/g, "");
    const trimmedEmployeeId = employeeId.trim();

    // Validate that name has exactly 3 parts
    const nameParts = trimmedName
      .split(/\s+/)
      .filter((part) => part.length > 0);
    if (nameParts.length !== 3) {
      return res.status(400).json({
        error:
          "Name must consist of exactly 3 parts (first name, middle name, last name)",
      });
    }

    const db = await openDb();
    const now = new Date().toISOString();

    // Check if user exists
    let user = await db.get(
      "SELECT * FROM users WHERE phone = ? AND name = ?",
      [sanitizedPhone, trimmedName]
    );

    let message = "";

    if (user) {
      // User exists, update their info
      await db.run(
        "UPDATE users SET employeeId = ?, updatedAt = ? WHERE id = ?",
        [trimmedEmployeeId, now, user.id]
      );
      user.employeeId = trimmedEmployeeId;
      user.updatedAt = now;
      message = "User updated";
    } else {
      // User does not exist, create new one
      user = {
        id: generateUserId(),
        name: trimmedName,
        phone: sanitizedPhone,
        employeeId: trimmedEmployeeId,
        registeredAt: now,
        updatedAt: now,
      };
      await db.run(
        "INSERT INTO users (id, name, phone, employeeId, registeredAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
        [
          user.id,
          user.name,
          user.phone,
          user.employeeId,
          user.registeredAt,
          user.updatedAt,
        ]
      );
      message = "User registered successfully";
    }

    await backupDatabase();

    // The backup logic for json is no longer needed.
    // Database backup should be handled at the file level (e.g., copying database.sqlite)

    return res.status(200).json({
      success: true,
      user: user,
      message: message,
    });
  } catch (error) {
    console.error("Registration error:", error);
    // Check for unique constraint error
    if (error.code === "SQLITE_CONSTRAINT") {
      return res
        .status(409)
        .json({ error: "A user with this phone number already exists." });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
