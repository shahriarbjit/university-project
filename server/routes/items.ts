import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getMongoDb } from "../db/mongodb";
import type {
  CreateItemRequest,
  UpdateItemRequest,
  ItemRecord,
  ItemStatus,
  ItemCategory,
} from "@shared/api";

interface ItemDocument {
  _id?: ObjectId;
  type: "lost" | "found";
  status: ItemStatus;
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  date: Date;
  imageUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  reportedBy: ObjectId;
  reportedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

function mapItemDocument(doc: ItemDocument): ItemRecord {
  return {
    id: doc._id?.toString() ?? "",
    type: doc.type,
    status: doc.status,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    location: doc.location,
    date: new Date(doc.date).toISOString().split("T")[0],
    imageUrl: doc.imageUrl,
    contactEmail: doc.contactEmail,
    contactPhone: doc.contactPhone,
    reportedBy: doc.reportedBy.toString(),
    reportedByName: doc.reportedByName,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

const VALID_CATEGORIES: ItemCategory[] = [
  "electronics",
  "clothing",
  "accessories",
  "documents",
  "keys",
  "bags",
  "books",
  "sports",
  "other",
];

// GET /api/items — list & search items
export const handleGetItems: RequestHandler = async (req, res) => {
  try {
    const db = await getMongoDb();
    const col = db.collection<ItemDocument>("items");

    const {
      q,
      type,
      category,
      status,
      location,
      dateFrom,
      dateTo,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string | undefined>;

    const filter: Record<string, unknown> = {};

    if (type === "lost" || type === "found") filter.type = type;
    if (category && VALID_CATEGORIES.includes(category as ItemCategory))
      filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: "i" };

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);
      filter.date = dateFilter;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).toArray(),
      col.countDocuments(filter),
    ]);

    return res.status(200).json({
      items: items.map(mapItemDocument),
      total,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch items: ${msg}` });
  }
};

// GET /api/items/:id — get single item
export const handleGetItem: RequestHandler = async (req, res) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const db = await getMongoDb();
    const doc = await db
      .collection<ItemDocument>("items")
      .findOne({ _id: new ObjectId(id) });

    if (!doc) return res.status(404).json({ error: "Item not found" });

    return res.status(200).json({ item: mapItemDocument(doc) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch item: ${msg}` });
  }
};

// POST /api/items — create item
export const handleCreateItem: RequestHandler = async (req, res) => {
  try {
    const body = req.body as CreateItemRequest;
    const userId = req.authUser?.userId;
    const userEmail = req.authUser?.email;

    if (!userId || !userEmail) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!body.type || !["lost", "found"].includes(body.type)) {
      return res.status(400).json({ error: "Type must be 'lost' or 'found'" });
    }
    if (!body.title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!body.description?.trim()) {
      return res.status(400).json({ error: "Description is required" });
    }
    if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
      return res.status(400).json({ error: "Valid category is required" });
    }
    if (!body.location?.trim()) {
      return res.status(400).json({ error: "Location is required" });
    }
    if (!body.date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const db = await getMongoDb();

    // Get user's full name
    const userDoc = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    const reportedByName = userDoc?.fullName ?? userEmail;

    const now = new Date();
    const doc: ItemDocument = {
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
      reportedBy: new ObjectId(userId),
      reportedByName,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<ItemDocument>("items").insertOne(doc);
    doc._id = result.insertedId;

    return res.status(201).json({ item: mapItemDocument(doc) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to create item: ${msg}` });
  }
};

// PUT /api/items/:id — update item
export const handleUpdateItem: RequestHandler = async (req, res) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const db = await getMongoDb();
    const col = db.collection<ItemDocument>("items");
    const existing = await col.findOne({ _id: new ObjectId(id) });

    if (!existing) return res.status(404).json({ error: "Item not found" });

    // Only the reporter can update their item
    if (existing.reportedBy.toString() !== userId) {
      return res.status(403).json({ error: "You can only edit your own items" });
    }

    const body = req.body as UpdateItemRequest;
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.title?.trim()) updates.title = body.title.trim();
    if (body.description?.trim()) updates.description = body.description.trim();
    if (body.category && VALID_CATEGORIES.includes(body.category))
      updates.category = body.category;
    if (body.location?.trim()) updates.location = body.location.trim();
    if (body.date) updates.date = new Date(body.date);
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl?.trim() || undefined;
    if (body.contactPhone !== undefined)
      updates.contactPhone = body.contactPhone?.trim() || undefined;
    if (body.status) updates.status = body.status;

    await col.updateOne({ _id: new ObjectId(id) }, { $set: updates });
    const updated = await col.findOne({ _id: new ObjectId(id) });

    return res.status(200).json({ item: mapItemDocument(updated!) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to update item: ${msg}` });
  }
};

// DELETE /api/items/:id — delete item
export const handleDeleteItem: RequestHandler = async (req, res) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const db = await getMongoDb();
    const col = db.collection<ItemDocument>("items");
    const existing = await col.findOne({ _id: new ObjectId(id) });

    if (!existing) return res.status(404).json({ error: "Item not found" });

    // Only the reporter can delete their item
    if (existing.reportedBy.toString() !== userId) {
      return res.status(403).json({ error: "You can only delete your own items" });
    }

    await col.deleteOne({ _id: new ObjectId(id) });

    // Also remove any matches referencing this item
    await db.collection("matches").deleteMany({
      $or: [
        { lostItemId: new ObjectId(id) },
        { foundItemId: new ObjectId(id) },
      ],
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to delete item: ${msg}` });
  }
};

// GET /api/items/my — get current user's items
export const handleGetMyItems: RequestHandler = async (req, res) => {
  try {
    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const db = await getMongoDb();
    const items = await db
      .collection<ItemDocument>("items")
      .find({ reportedBy: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({ items: items.map(mapItemDocument), total: items.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch your items: ${msg}` });
  }
};
