import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserRecord,
  UsersResponse,
} from "@shared/api";
import { users, nextId, seedPromise, type MemUser } from "../db/memory-store";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toUserRecord(u: MemUser): UserRecord {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    createdAt: new Date(u.createdAt).toISOString().split("T")[0],
  };
}

export const handleGetUsers: RequestHandler = async (_req, res) => {
  try {
    await seedPromise;
    const response: UsersResponse = {
      users: [...users].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(toUserRecord),
    };
    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to load users: ${message}` });
  }
};

export const handleCreateUser: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const body = req.body as CreateUserRequest;
    const email = normalizeEmail(body.email ?? "");
    const fullName = (body.fullName ?? "").trim();
    const password = body.password ?? "";

    if (!email || !fullName || !password)
      return res.status(400).json({ error: "email, fullName and password are required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    if (users.find((u) => u.email === email))
      return res.status(409).json({ error: "Email already exists" });

    const newUser: MemUser = {
      id: nextId(),
      email,
      fullName,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    };
    users.push(newUser);

    return res.status(201).json({ user: toUserRecord(newUser) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to create user: ${message}` });
  }
};

export const handleUpdateUser: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const requesterId = req.authUser?.userId;

    if (!targetId || !requesterId)
      return res.status(400).json({ error: "Invalid request" });

    if (targetId === requesterId)
      return res.status(403).json({ error: "You cannot update your own account from this screen" });

    const user = users.find((u) => u.id === targetId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const body = req.body as UpdateUserRequest;

    if (body.email) {
      const newEmail = normalizeEmail(body.email);
      if (users.find((u) => u.email === newEmail && u.id !== targetId))
        return res.status(409).json({ error: "Email already exists" });
      user.email = newEmail;
    }
    if (body.fullName) user.fullName = body.fullName.trim();
    if (body.password) {
      if (body.password.length < 6)
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      user.passwordHash = await bcrypt.hash(body.password, 10);
    }

    return res.status(200).json({ user: toUserRecord(user) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to update user: ${message}` });
  }
};

export const handleDeleteUser: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const requesterId = req.authUser?.userId;

    if (!targetId || !requesterId)
      return res.status(400).json({ error: "Invalid request" });

    if (targetId === requesterId)
      return res.status(403).json({ error: "You cannot delete your own account from this screen" });

    const idx = users.findIndex((u) => u.id === targetId);
    if (idx === -1) return res.status(404).json({ error: "User not found" });

    users.splice(idx, 1);
    return res.status(200).json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to delete user: ${message}` });
  }
};
