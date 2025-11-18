-- Up
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    employeeId TEXT NOT NULL,
    registeredAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    flower_seedName TEXT,
    flower_flowerImage TEXT,
    flower_level INTEGER DEFAULT 0,
    commitmentPercentage INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_name ON users (phone, name);
