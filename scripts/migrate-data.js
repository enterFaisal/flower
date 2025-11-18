import fs from "fs/promises";
import path from "path";
import { openDb } from "../lib/db";

async function migrate() {
  const db = await openDb();
  const usersFilePath = path.join(process.cwd(), "data", "users.json");

  try {
    const data = await fs.readFile(usersFilePath, "utf8");
    const users = JSON.parse(data);

    if (!users || users.length === 0) {
      console.log("No users found in users.json to migrate.");
      return;
    }

    console.log(`Found ${users.length} users to migrate.`);

    await db.run("BEGIN TRANSACTION;");

    const stmt = await db.prepare(
      "INSERT OR REPLACE INTO users (id, name, phone, employeeId, registeredAt, updatedAt, flower_seedName, flower_flowerImage, flower_level, commitmentPercentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    for (const user of users) {
      await stmt.run(
        user.id,
        user.name,
        user.phone,
        user.employeeId,
        user.registeredAt,
        user.updatedAt,
        user.flower ? user.flower.seedName : null,
        user.flower ? user.flower.flowerImage : null,
        user.flower ? user.flower.level : null,
        user.commitmentPercentage
      );
    }

    await stmt.finalize();
    await db.run("COMMIT;");

    console.log("Data migration completed successfully.");

    // Rename the old users.json file to prevent it from being used again.
    await fs.rename(usersFilePath, `${usersFilePath}.migrated`);
    console.log(`Renamed ${usersFilePath} to ${usersFilePath}.migrated`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(
        "users.json not found, skipping migration. This is normal if migration has already run."
      );
    } else {
      await db.run("ROLLBACK;");
      console.error("Failed to migrate data:", error);
    }
  } finally {
    await db.close();
  }
}

migrate();
