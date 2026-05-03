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
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/me", requireAuth, handleMe);

  app.get("/api/users", requireAuth, handleGetUsers);
  app.post("/api/users", requireAuth, handleCreateUser);
  app.put("/api/users/:id", requireAuth, handleUpdateUser);
  app.delete("/api/users/:id", requireAuth, handleDeleteUser);

  return app;
}
