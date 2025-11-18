import { openDb } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
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

      res.status(200).json(formattedUsers);
    } catch (error) {
      console.error("Error fetching live data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
