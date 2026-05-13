import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleMe, handleRegister } from "./routes/auth";
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetUsers,
  handleUpdateUser,
} from "./routes/users";
import {
  handleGetItems,
  handleGetItem,
  handleCreateItem,
  handleUpdateItem,
  handleDeleteItem,
  handleGetMyItems,
} from "./routes/items";
import {
  handleRunMatches,
  handleGetMatches,
  handleGetItemMatches,
  handleUpdateMatch,
} from "./routes/matches";
import { requireAuth } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/me", requireAuth, handleMe);

  // User routes
  app.get("/api/users", requireAuth, handleGetUsers);
  app.post("/api/users", requireAuth, handleCreateUser);
  app.put("/api/users/:id", requireAuth, handleUpdateUser);
  app.delete("/api/users/:id", requireAuth, handleDeleteUser);

  // Lost & Found item routes
  app.get("/api/items/my", requireAuth, handleGetMyItems);
  app.get("/api/items", requireAuth, handleGetItems);
  app.get("/api/items/:id", requireAuth, handleGetItem);
  app.post("/api/items", requireAuth, handleCreateItem);
  app.put("/api/items/:id", requireAuth, handleUpdateItem);
  app.delete("/api/items/:id", requireAuth, handleDeleteItem);

  // Match routes
  app.post("/api/matches/run", requireAuth, handleRunMatches);
  app.get("/api/matches", requireAuth, handleGetMatches);
  app.get("/api/matches/item/:id", requireAuth, handleGetItemMatches);
  app.put("/api/matches/:id", requireAuth, handleUpdateMatch);

  return app;
}
