import { RequestHandler } from "express";
import type {
  CreateItemRequest,
  UpdateItemRequest,
  ItemRecord,
  ItemCategory,
} from "@shared/api";
import {
  items,
  users,
  matches,
  nextId,
  seedPromise,
  type MemItem,
} from "../db/memory-store";

function toItemRecord(doc: MemItem): ItemRecord {
  return {
    id: doc.id,
    type: doc.type,
    status: doc.status,
    title: doc.title,
    description: doc.description,
    category: doc.category as ItemCategory,
    location: doc.location,
    date: new Date(doc.date).toISOString().split("T")[0],
    imageUrl: doc.imageUrl,
    contactEmail: doc.contactEmail,
    contactPhone: doc.contactPhone,
    reportedBy: doc.reportedBy,
    reportedByName: doc.reportedByName,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

const VALID_CATEGORIES: ItemCategory[] = [
  "electronics", "clothing", "accessories", "documents",
  "keys", "bags", "books", "sports", "other",
];

// GET /api/items
export const handleGetItems: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const { q, type, category, status, location, dateFrom, dateTo, page = "1", limit = "20" } =
      req.query as Record<string, string | undefined>;

    let result = [...items];

    if (type === "lost" || type === "found") result = result.filter((i) => i.type === type);
    if (category && VALID_CATEGORIES.includes(category as ItemCategory))
      result = result.filter((i) => i.category === category);
    if (status) result = result.filter((i) => i.status === status);
    if (location) {
      const loc = location.toLowerCase();
      result = result.filter((i) => i.location.toLowerCase().includes(loc));
    }
    if (dateFrom) {
      const d = new Date(dateFrom);
      result = result.filter((i) => new Date(i.date) >= d);
    }
    if (dateTo) {
      const d = new Date(dateTo);
      result = result.filter((i) => new Date(i.date) <= d);
    }
    if (q) {
      const ql = q.toLowerCase();
      result = result.filter(
        (i) => i.title.toLowerCase().includes(ql) || i.description.toLowerCase().includes(ql)
      );
    }

    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const total = result.length;
    const paged = result.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({ items: paged.map(toItemRecord), total });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch items: ${msg}` });
  }
};

// GET /api/items/:id
export const handleGetItem: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = items.find((i) => i.id === id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    return res.status(200).json({ item: toItemRecord(item) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch item: ${msg}` });
  }
};

// POST /api/items
export const handleCreateItem: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const body = req.body as CreateItemRequest;
    const userId = req.authUser?.userId;
    const userEmail = req.authUser?.email;
    if (!userId || !userEmail) return res.status(401).json({ error: "Unauthorized" });

    if (!body.type || !["lost", "found"].includes(body.type))
      return res.status(400).json({ error: "Type must be 'lost' or 'found'" });
    if (!body.title?.trim()) return res.status(400).json({ error: "Title is required" });
    if (!body.description?.trim()) return res.status(400).json({ error: "Description is required" });
    if (!body.category || !VALID_CATEGORIES.includes(body.category))
      return res.status(400).json({ error: "Valid category is required" });
    if (!body.location?.trim()) return res.status(400).json({ error: "Location is required" });
    if (!body.date) return res.status(400).json({ error: "Date is required" });

    const userDoc = users.find((u) => u.id === userId);
    const now = new Date();

    const newItem: MemItem = {
      id: nextId(),
      type: body.type,
      status: body.type === "lost" ? "lost" : "found",
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category,
      location: body.location.trim(),
      date: new Date(body.date),
      imageUrl: body.imageUrl?.trim() || undefined,
      contactEmail: userEmail,
      contactPhone: body.contactPhone?.trim() || undefined,
      reportedBy: userId,
      reportedByName: userDoc?.fullName ?? userEmail,
      createdAt: now,
      updatedAt: now,
    };
    items.push(newItem);

    return res.status(201).json({ item: toItemRecord(newItem) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to create item: ${msg}` });
  }
};

// PUT /api/items/:id
export const handleUpdateItem: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const item = items.find((i) => i.id === id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.reportedBy !== userId)
      return res.status(403).json({ error: "You can only edit your own items" });

    const body = req.body as UpdateItemRequest;
    if (body.title?.trim()) item.title = body.title.trim();
    if (body.description?.trim()) item.description = body.description.trim();
    if (body.category && VALID_CATEGORIES.includes(body.category)) item.category = body.category;
    if (body.location?.trim()) item.location = body.location.trim();
    if (body.date) item.date = new Date(body.date);
    if (body.imageUrl !== undefined) item.imageUrl = body.imageUrl?.trim() || undefined;
    if (body.contactPhone !== undefined) item.contactPhone = body.contactPhone?.trim() || undefined;
    if (body.status) item.status = body.status;
    item.updatedAt = new Date();

    return res.status(200).json({ item: toItemRecord(item) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to update item: ${msg}` });
  }
};

// DELETE /api/items/:id
export const handleDeleteItem: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ error: "Item not found" });
    if (items[idx].reportedBy !== userId)
      return res.status(403).json({ error: "You can only delete your own items" });

    items.splice(idx, 1);

    // Remove related matches
    for (let m = matches.length - 1; m >= 0; m--) {
      if (matches[m].lostItemId === id || matches[m].foundItemId === id) {
        matches.splice(m, 1);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to delete item: ${msg}` });
  }
};

// GET /api/items/my
export const handleGetMyItems: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const myItems = items
      .filter((i) => i.reportedBy === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return res.status(200).json({ items: myItems.map(toItemRecord), total: myItems.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch your items: ${msg}` });
  }
};
