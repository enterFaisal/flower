import { openDb } from "../../../lib/db";

// API endpoint to get all users (for admin purposes)
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await openDb();
    const users = await db.all(
      "SELECT * FROM users ORDER BY registeredAt DESC"
    );

    // Reconstruct the nested flower object for each user
    const formattedUsers = users.map((user) => {
      const { flower_seedName, flower_flowerImage, flower_level, ...rest } =
        user;
      return {
        ...rest,
        flower: {
          seedName: flower_seedName,
          flowerImage: flower_flowerImage,
          level: flower_level,
        },
      };
    });

    // Return all users with count
    return res.status(200).json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
