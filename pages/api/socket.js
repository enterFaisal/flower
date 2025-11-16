import { Server } from "socket.io";
import fs from "fs";
import path from "path";

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

function updateUserWithFlower(flowerData) {
  try {
    const users = getUsers();
    let userIndex = -1;

    if (flowerData.userId) {
      userIndex = users.findIndex((u) => u.id === flowerData.userId);
    }

    if (userIndex === -1 && flowerData.phone) {
      userIndex = users.findIndex((u) => u.phone === flowerData.phone);
    }

    if (userIndex !== -1) {
      users[userIndex].flower = {
        seedName: flowerData.seedName,
        flowerImage: flowerData.flowerImage,
        level: flowerData.level,
      };
      if (flowerData.userName) {
        users[userIndex].name = flowerData.userName;
      }
      users[userIndex].updatedAt = new Date().toISOString();

      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } else {
      console.error("User not found for provided identifiers:", {
        userId: flowerData.userId,
        phone: flowerData.phone,
      });
    }
  } catch (error) {
    console.error("Error saving flower data to user:", error);
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
          updateUserWithFlower(data);
          // Broadcast to all connected clients.
          // The live display will get this, but it will also poll.
          // This provides a real-time push for any client that wants it.
          io.emit("flower:new", data);
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
