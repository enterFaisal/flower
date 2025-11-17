import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { backupUsersFile } from "../../lib/backupUsers";

const usersFilePath = path.join(process.cwd(), "data", "users.json");

function getUsers() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading users file:", error);
  }
  return [];
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

function updateUserWithFlower(flowerData) {
  try {
    const users = getUsers();
    let userIndex = -1;

    if (flowerData.userId) {
      userIndex = users.findIndex((u) => u.id === flowerData.userId);
    }

    if (userIndex === -1 && flowerData.phone) {
      const sanitizedPhone = flowerData.phone
        ? flowerData.phone.trim().replace(/\s+/g, "")
        : null;
      if (sanitizedPhone) {
        userIndex = users.findIndex((u) => u.phone === sanitizedPhone);
      }
    }

    if (userIndex !== -1) {
      const user = users[userIndex];

      // Initialize flower object if it doesn't exist
      if (!user.flower) {
        user.flower = {};
      }

      // CRITICAL: Update level FIRST and ensure it's always preserved
      // This must happen before any flower object updates to prevent overwriting
      let targetLevel = null;
      if (typeof flowerData.level === "number") {
        const currentLevel =
          typeof user.flower.level === "number" ? user.flower.level : 0;
        targetLevel = Math.max(currentLevel, flowerData.level);
        user.flower.level = targetLevel;
        console.log(
          `[Socket Update] Level set to ${targetLevel} (was ${currentLevel}, requested ${flowerData.level})`
        );
      } else {
        targetLevel =
          typeof user.flower.level === "number" ? user.flower.level : 0;
      }

      // Update flower properties, but ALWAYS preserve the level that was just set
      if (flowerData.seedName || flowerData.flowerImage) {
        const { level: flowerLevel, ...flowerWithoutLevel } = {
          seedName: flowerData.seedName,
          flowerImage: flowerData.flowerImage,
        };
        user.flower = {
          ...user.flower,
          ...flowerWithoutLevel,
        };
        // CRITICAL: Always restore/update level after spreading flower object
        if (typeof targetLevel === "number") {
          const currentLevelAfterSpread =
            typeof user.flower.level === "number" ? user.flower.level : 0;
          user.flower.level = Math.max(targetLevel, currentLevelAfterSpread);
        }
      }

      // Update commitmentPercentage if provided
      if (typeof flowerData.commitmentPercentage === "number") {
        user.commitmentPercentage = flowerData.commitmentPercentage;
      }

      if (flowerData.userName) {
        user.name = flowerData.userName;
      }
      user.updatedAt = new Date().toISOString();
      users[userIndex] = user;

      // Write users file atomically
      writeUsers(users);

      console.log(
        `[Socket Update] Successfully updated user: ${
          user.name || user.phone
        }, level: ${user.flower.level}`
      );
      return { success: true, user, finalLevel: user.flower.level };
    } else {
      console.error("User not found for provided identifiers:", {
        userId: flowerData.userId,
        phone: flowerData.phone,
      });
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error saving flower data to user:", error);
    return { success: false, error: error.message };
  }
}

const SocketHandler = (req, res) => {
  try {
    if (res.socket.server.io) {
      console.log("Socket is already running");
      res
        .status(200)
        .json({ success: true, message: "Socket already initialized" });
    } else {
      console.log("Socket is initializing");
      const io = new Server(res.socket.server, {
        path: "/api/socket",
        addTrailingSlash: false,
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });
      res.socket.server.io = io;

      io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // This is no longer the source of truth for the live display
        // but can be kept for other potential real-time features.
        // For the live-display, it will poll the /api/live-data endpoint.

        socket.on("flower:new", (data) => {
          console.log("New flower received, updating user data:", data);
          const result = updateUserWithFlower(data);
          // Broadcast to all connected clients.
          // The live display will get this, but it will also poll.
          // This provides a real-time push for any client that wants it.
          io.emit("flower:new", data);
          // Send confirmation back to the sender
          if (result.success) {
            socket.emit("flower:update:success", {
              success: true,
              finalLevel: result.finalLevel,
            });
          } else {
            socket.emit("flower:update:error", {
              success: false,
              error: result.error,
            });
          }
        });

        socket.on("level:update", (data) => {
          console.log("Level update received via socket:", data);
          const result = updateUserWithFlower({
            userId: data.userId,
            phone: data.phone,
            level: data.level,
            commitmentPercentage: data.commitmentPercentage,
          });
          // Send confirmation back to the sender
          if (result.success) {
            socket.emit("level:update:success", {
              success: true,
              finalLevel: result.finalLevel,
              levelUpdated: typeof data.level === "number",
            });
          } else {
            socket.emit("level:update:error", {
              success: false,
              error: result.error,
            });
          }
        });

        socket.on("disconnect", () => {
          console.log("Client disconnected:", socket.id);
        });
      });

      res.status(200).json({ success: true, message: "Socket initialized" });
    }
  } catch (error) {
    console.error("Socket initialization error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default SocketHandler;
