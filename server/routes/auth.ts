import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { AuthResponse, LoginRequest, RegisterRequest, UserRecord } from "@shared/api";
import { getMongoDb } from "../db/mongodb";
import { signAuthToken } from "../auth/jwt";

interface UserDocument {
  _id?: ObjectId;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: Date;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapUserDocument(user: UserDocument): UserRecord {
  return {
    id: user._id?.toString() ?? "",
    email: user.email,
    fullName: user.fullName,
    createdAt: new Date(user.createdAt).toISOString().split("T")[0],
  };
}

export const handleRegister: RequestHandler = async (req, res) => {
  try {
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

    const db = await getMongoDb();
    const users = db.collection<UserDocument>("users");

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date();

    const insertResult = await users.insertOne({
      email,
      fullName,
      passwordHash,
      createdAt,
    });

    const userRecord: UserRecord = {
      id: insertResult.insertedId.toString(),
      email,
      fullName,
      createdAt: createdAt.toISOString().split("T")[0],
    };

    const response: AuthResponse = {
      token: signAuthToken(userRecord),
      user: userRecord,
    };

    return res.status(201).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to register user: ${message}` });
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const body = req.body as LoginRequest;
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const db = await getMongoDb();
    const users = db.collection<UserDocument>("users");

    const foundUser = await users.findOne({ email });
    if (!foundUser) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const userRecord = mapUserDocument(foundUser);

    const response: AuthResponse = {
      token: signAuthToken(userRecord),
      user: userRecord,
    };

    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to login: ${message}` });
  }
};

export const handleMe: RequestHandler = async (req, res) => {
  try {
    const authUserId = req.authUser?.userId;
    if (!authUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!ObjectId.isValid(authUserId)) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const db = await getMongoDb();
    const users = db.collection<UserDocument>("users");

    const user = await users.findOne({ _id: new ObjectId(authUserId) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: mapUserDocument(user) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to load current user: ${message}` });
  }
};
