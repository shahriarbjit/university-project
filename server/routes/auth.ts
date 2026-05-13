import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { AuthResponse, LoginRequest, RegisterRequest, UserRecord } from "@shared/api";
import { signAuthToken } from "../auth/jwt";
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

export const handleRegister: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const body = req.body as RegisterRequest;
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";
    const fullName = (body.fullName ?? "").trim();

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "email, password and fullName are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const newUser: MemUser = {
      id: nextId(),
      email,
      fullName,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    };
    users.push(newUser);

    const userRecord = toUserRecord(newUser);
    const response: AuthResponse = { token: signAuthToken(userRecord), user: userRecord };
    return res.status(201).json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to register user: ${msg}` });
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const body = req.body as LoginRequest;
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const userRecord = toUserRecord(user);
    const response: AuthResponse = { token: signAuthToken(userRecord), user: userRecord };
    return res.status(200).json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to login: ${msg}` });
  }
};

export const handleMe: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const authUserId = req.authUser?.userId;
    if (!authUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = users.find((u) => u.id === authUserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: toUserRecord(user) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to load current user: ${msg}` });
  }
};
