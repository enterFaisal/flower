import { openDb } from "../../lib/db";

export default async function handler(req, res) {
  try {
    const db = await openDb();
    const users = await db.all("SELECT * FROM users");

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

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="users-${new Date().toISOString()}.json"`
    );
    res.status(200).send(JSON.stringify(formattedUsers, null, 2));
  } catch (error) {
    console.error("Error downloading users:", error);
    res.status(500).json({ message: "Error reading the users file." });
  }
}
