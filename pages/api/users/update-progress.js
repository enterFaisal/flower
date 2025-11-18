import { openDb } from "../../../lib/db";
import { backupDatabase } from "../../../lib/backupDb";

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

    const db = await openDb();
    const sanitizedPhone = phone ? phone.trim().replace(/\s+/g, "") : null;

    // Find user by ID or phone
    const user = await db.get("SELECT * FROM users WHERE id = ? OR phone = ?", [
      userId,
      sanitizedPhone,
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateFields = [];
    const updateValues = [];

    // --- Prepare fields for update ---

    // Handle level update: always take the highest level
    if (typeof level === "number") {
      const currentLevel = user.flower_level || 0;
      const targetLevel = Math.max(currentLevel, level);
      if (targetLevel !== user.flower_level) {
        updateFields.push("flower_level = ?");
        updateValues.push(targetLevel);
        user.flower_level = targetLevel;
      }
    }

    // Handle flower object update (seedName, flowerImage)
    if (flower && typeof flower === "object") {
      if (flower.seedName && flower.seedName !== user.flower_seedName) {
        updateFields.push("flower_seedName = ?");
        updateValues.push(flower.seedName);
        user.flower_seedName = flower.seedName;
      }
      if (
        flower.flowerImage &&
        flower.flowerImage !== user.flower_flowerImage
      ) {
        updateFields.push("flower_flowerImage = ?");
        updateValues.push(flower.flowerImage);
        user.flower_flowerImage = flower.flowerImage;
      }
    }

    // Handle commitment percentage
    if (
      typeof commitmentPercentage === "number" &&
      commitmentPercentage !== user.commitmentPercentage
    ) {
      updateFields.push("commitmentPercentage = ?");
      updateValues.push(commitmentPercentage);
      user.commitmentPercentage = commitmentPercentage;
    }

    // If there are fields to update, run the query
    if (updateFields.length > 0) {
      updateFields.push("updatedAt = ?");
      updateValues.push(new Date().toISOString());

      const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
      updateValues.push(user.id);

      await db.run(query, updateValues);
      await backupDatabase();
    }

    // Reconstruct user object for the response to match frontend expectations
    const responseUser = {
      ...user,
      flower: {
        seedName: user.flower_seedName,
        flowerImage: user.flower_flowerImage,
        level: user.flower_level,
      },
    };
    // remove flat flower properties
    delete responseUser.flower_seedName;
    delete responseUser.flower_flowerImage;
    delete responseUser.flower_level;

    return res.status(200).json({
      success: true,
      user: responseUser,
      levelUpdated: typeof level === "number",
      finalLevel: responseUser.flower.level,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
