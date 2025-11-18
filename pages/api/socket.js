import { Server } from "socket.io";
import { openDb } from "../../lib/db";

function SocketHandler(req, res) {
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

        socket.on("flower:new", async (data) => {
          console.log("New flower received, updating user data:", data);
          const result = await updateUserWithFlower(data);
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

        socket.on("level:update", async (data) => {
          console.log("Level update received via socket:", data);
          const result = await updateUserWithFlower({
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
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default SocketHandler;

async function updateUserWithFlower(flowerData) {
  try {
    const db = await openDb();

    let user = null;
    if (flowerData.userId) {
      user = await db.get("SELECT * FROM users WHERE id = ?", [
        flowerData.userId,
      ]);
    }

    if (!user && flowerData.phone) {
      const sanitizedPhone = flowerData.phone.trim().replace(/\s+/g, "");
      user = await db.get("SELECT * FROM users WHERE phone = ?", [
        sanitizedPhone,
      ]);
    }

    if (user) {
      const updateFields = [];
      const updateValues = [];

      // Handle level update
      if (typeof flowerData.level === "number") {
        const currentLevel = user.flower_level || 0;
        const targetLevel = Math.max(currentLevel, flowerData.level);
        if (targetLevel !== user.flower_level) {
          updateFields.push("flower_level = ?");
          updateValues.push(targetLevel);
        }
      }

      // Handle other flower properties
      if (flowerData.seedName) {
        updateFields.push("flower_seedName = ?");
        updateValues.push(flowerData.seedName);
      }
      if (flowerData.flowerImage) {
        updateFields.push("flower_flowerImage = ?");
        updateValues.push(flowerData.flowerImage);
      }

      // Handle commitment percentage
      if (typeof flowerData.commitmentPercentage === "number") {
        updateFields.push("commitmentPercentage = ?");
        updateValues.push(flowerData.commitmentPercentage);
      }

      // Handle user name
      if (flowerData.userName) {
        updateFields.push("name = ?");
        updateValues.push(flowerData.userName);
      }

      if (updateFields.length > 0) {
        updateFields.push("updatedAt = ?");
        updateValues.push(new Date().toISOString());

        const query = `UPDATE users SET ${updateFields.join(
          ", "
        )} WHERE id = ?`;
        updateValues.push(user.id);

        await db.run(query, updateValues);

        // Refetch user to get the final state
        const updatedUser = await db.get("SELECT * FROM users WHERE id = ?", [
          user.id,
        ]);

        console.log(
          `[Socket Update] Successfully updated user: ${updatedUser.name}, level: ${updatedUser.flower_level}`
        );
        return {
          success: true,
          user: updatedUser,
          finalLevel: updatedUser.flower_level,
        };
      } else {
        // No fields to update
        return { success: true, user, finalLevel: user.flower_level };
      }
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
