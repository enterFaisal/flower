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

export default function handler(req, res) {
  if (req.method === "GET") {
    const users = getUsers();
    res.status(200).json(users);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
