import { openDb } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const db = await openDb();
    // Fetch users who have reached level 3
    const eligibleUsers = await db.all(
      "SELECT * FROM users WHERE flower_level = 3 ORDER BY updatedAt DESC"
    );

    // Reconstruct the nested flower object for each user
    const formattedUsers = eligibleUsers.map((user) => {
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

    res.status(200).json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length,
    });
  } catch (error) {
    console.error("Error fetching eligible users:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
