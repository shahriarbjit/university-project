import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserRecord,
  UsersResponse,
} from "@shared/api";
import { getMongoDb } from "../db/mongodb";

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

export const handleGetUsers: RequestHandler = async (_req, res) => {
  try {
    const db = await getMongoDb();
    const usersCollection = db.collection<UserDocument>("users");

    const usersFromDb = await usersCollection
      .find({}, { projection: { email: 1, fullName: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    const response: UsersResponse = {
      users: usersFromDb.map(mapUserDocument),
    };

    return res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to load users: ${message}` });
  }
};

export const handleCreateUser: RequestHandler = async (req, res) => {
  try {
    const body = req.body as CreateUserRequest;
    const email = normalizeEmail(body.email ?? "");
    const fullName = (body.fullName ?? "").trim();
    const password = body.password ?? "";

    if (!email || !fullName || !password) {
      return res.status(400).json({ error: "email, fullName and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const db = await getMongoDb();
    const usersCollection = db.collection<UserDocument>("users");

    const existing = await usersCollection.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const insert = await usersCollection.insertOne({
      email,
      fullName,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    });

    const created = await usersCollection.findOne({ _id: insert.insertedId });
    if (!created) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    return res.status(201).json({ user: mapUserDocument(created) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to create user: ${message}` });
  }
};

export const handleUpdateUser: RequestHandler = async (req, res) => {
  try {
    const paramId = req.params.id;
    const targetId = Array.isArray(paramId) ? paramId[0] : paramId;
    const requesterId = req.authUser?.userId;

    if (!targetId || !requesterId || !ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (targetId === requesterId) {
      return res.status(403).json({ error: "You cannot update your own account from this screen" });
    }

    const body = req.body as UpdateUserRequest;
    const updateDoc: Partial<UserDocument> = {};

    if (body.email) {
      updateDoc.email = normalizeEmail(body.email);
    }

    if (body.fullName) {
      updateDoc.fullName = body.fullName.trim();
    }

    if (body.password) {
      if (body.password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      updateDoc.passwordHash = await bcrypt.hash(body.password, 10);
    }

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const db = await getMongoDb();
    const usersCollection = db.collection<UserDocument>("users");

    if (updateDoc.email) {
      const duplicate = await usersCollection.findOne({
        email: updateDoc.email,
        _id: { $ne: new ObjectId(targetId) },
      });
      if (duplicate) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    const updateResult = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(targetId) },
      { $set: updateDoc },
      { returnDocument: "after" },
    );

    if (!updateResult) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: mapUserDocument(updateResult) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to update user: ${message}` });
  }
};

export const handleDeleteUser: RequestHandler = async (req, res) => {
  try {
    const paramId = req.params.id;
    const targetId = Array.isArray(paramId) ? paramId[0] : paramId;
    const requesterId = req.authUser?.userId;

    if (!targetId || !requesterId || !ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (targetId === requesterId) {
      return res.status(403).json({ error: "You cannot delete your own account from this screen" });
    }

    const db = await getMongoDb();
    const usersCollection = db.collection<UserDocument>("users");

    const deleteResult = await usersCollection.deleteOne({ _id: new ObjectId(targetId) });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to delete user: ${message}` });
  }
};
