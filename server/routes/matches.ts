import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getMongoDb } from "../db/mongodb";
import type { MatchRecord, ItemCategory } from "@shared/api";

interface ItemDocument {
  _id?: ObjectId;
  type: "lost" | "found";
  status: string;
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  date: Date;
  reportedBy: ObjectId;
}

interface MatchDocument {
  _id?: ObjectId;
  lostItemId: ObjectId;
  foundItemId: ObjectId;
  lostItemTitle: string;
  foundItemTitle: string;
  score: number;
  reasons: string[];
  status: "pending" | "confirmed" | "rejected";
  createdAt: Date;
}

function mapMatchDocument(doc: MatchDocument): MatchRecord {
  return {
    id: doc._id?.toString() ?? "",
    lostItemId: doc.lostItemId.toString(),
    foundItemId: doc.foundItemId.toString(),
    lostItemTitle: doc.lostItemTitle,
    foundItemTitle: doc.foundItemTitle,
    score: doc.score,
    reasons: doc.reasons,
    status: doc.status,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

// ─── Matching Algorithm ──────────────────────────────────────

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function computeMatchScore(
  lost: ItemDocument,
  found: ItemDocument
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category match (30 points)
  if (lost.category === found.category) {
    score += 30;
    reasons.push(`Same category: ${lost.category}`);
  }

  // 2. Title similarity (25 points)
  const titleSim = jaccardSimilarity(tokenize(lost.title), tokenize(found.title));
  const titleScore = Math.round(titleSim * 25);
  if (titleScore > 5) {
    score += titleScore;
    reasons.push(`Title similarity: ${Math.round(titleSim * 100)}%`);
  }

  // 3. Description similarity (20 points)
  const descSim = jaccardSimilarity(
    tokenize(lost.description),
    tokenize(found.description)
  );
  const descScore = Math.round(descSim * 20);
  if (descScore > 3) {
    score += descScore;
    reasons.push(`Description similarity: ${Math.round(descSim * 100)}%`);
  }

  // 4. Location match (15 points)
  const lostLoc = lost.location.toLowerCase().trim();
  const foundLoc = found.location.toLowerCase().trim();
  if (lostLoc === foundLoc) {
    score += 15;
    reasons.push(`Exact location match: ${lost.location}`);
  } else {
    const locSim = jaccardSimilarity(tokenize(lost.location), tokenize(found.location));
    const locScore = Math.round(locSim * 15);
    if (locScore > 3) {
      score += locScore;
      reasons.push(`Location similarity: ${Math.round(locSim * 100)}%`);
    }
  }

  // 5. Date proximity (10 points)
  const daysDiff = Math.abs(
    (new Date(found.date).getTime() - new Date(lost.date).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  if (daysDiff <= 1) {
    score += 10;
    reasons.push("Found within 1 day of being lost");
  } else if (daysDiff <= 3) {
    score += 7;
    reasons.push("Found within 3 days of being lost");
  } else if (daysDiff <= 7) {
    score += 4;
    reasons.push("Found within 1 week of being lost");
  } else if (daysDiff <= 14) {
    score += 2;
    reasons.push("Found within 2 weeks of being lost");
  }

  return { score: Math.min(score, 100), reasons };
}

// ─── Routes ──────────────────────────────────────────────────

// POST /api/matches/run — run matching algorithm for an item
export const handleRunMatches: RequestHandler = async (req, res) => {
  try {
    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { itemId } = req.body as { itemId?: string };
    if (!itemId || !ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Valid itemId is required" });
    }

    const db = await getMongoDb();
    const itemsCol = db.collection<ItemDocument>("items");
    const matchesCol = db.collection<MatchDocument>("matches");

    const sourceItem = await itemsCol.findOne({ _id: new ObjectId(itemId) });
    if (!sourceItem) return res.status(404).json({ error: "Item not found" });

    // Find opposite-type items that are active (not resolved)
    const oppositeType = sourceItem.type === "lost" ? "found" : "lost";
    const candidates = await itemsCol
      .find({
        type: oppositeType,
        status: { $in: [oppositeType, "matched"] },
      })
      .toArray();

    const MATCH_THRESHOLD = 25;
    const newMatches: MatchDocument[] = [];

    for (const candidate of candidates) {
      const { score, reasons } = computeMatchScore(
        sourceItem.type === "lost" ? sourceItem : candidate,
        sourceItem.type === "found" ? sourceItem : candidate
      );

      if (score >= MATCH_THRESHOLD) {
        const lostId =
          sourceItem.type === "lost" ? sourceItem._id! : candidate._id!;
        const foundId =
          sourceItem.type === "found" ? sourceItem._id! : candidate._id!;

        // Check if match already exists
        const existing = await matchesCol.findOne({
          lostItemId: lostId,
          foundItemId: foundId,
        });
        if (existing) continue;

        const matchDoc: MatchDocument = {
          lostItemId: lostId,
          foundItemId: foundId,
          lostItemTitle:
            sourceItem.type === "lost" ? sourceItem.title : candidate.title,
          foundItemTitle:
            sourceItem.type === "found" ? sourceItem.title : candidate.title,
          score,
          reasons,
          status: "pending",
          createdAt: new Date(),
        };

        const result = await matchesCol.insertOne(matchDoc);
        matchDoc._id = result.insertedId;
        newMatches.push(matchDoc);
      }
    }

    return res.status(200).json({
      matches: newMatches.map(mapMatchDocument),
      message: `Found ${newMatches.length} new match(es)`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Matching failed: ${msg}` });
  }
};

// GET /api/matches — get matches for current user's items
export const handleGetMatches: RequestHandler = async (req, res) => {
  try {
    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const db = await getMongoDb();

    // Get all item IDs belonging to current user
    const userItems = await db
      .collection<ItemDocument>("items")
      .find(
        { reportedBy: new ObjectId(userId) },
        { projection: { _id: 1 } }
      )
      .toArray();

    const userItemIds = userItems.map((i) => i._id!);

    if (userItemIds.length === 0) {
      return res.status(200).json({ matches: [] });
    }

    const matches = await db
      .collection<MatchDocument>("matches")
      .find({
        $or: [
          { lostItemId: { $in: userItemIds } },
          { foundItemId: { $in: userItemIds } },
        ],
      })
      .sort({ score: -1, createdAt: -1 })
      .toArray();

    return res.status(200).json({ matches: matches.map(mapMatchDocument) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch matches: ${msg}` });
  }
};

// GET /api/matches/item/:id — get matches for a specific item
export const handleGetItemMatches: RequestHandler = async (req, res) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const db = await getMongoDb();
    const oid = new ObjectId(id);
    const matches = await db
      .collection<MatchDocument>("matches")
      .find({
        $or: [{ lostItemId: oid }, { foundItemId: oid }],
      })
      .sort({ score: -1 })
      .toArray();

    return res.status(200).json({ matches: matches.map(mapMatchDocument) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch matches: ${msg}` });
  }
};

// PUT /api/matches/:id — update match status (confirm/reject)
export const handleUpdateMatch: RequestHandler = async (req, res) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.body as { status?: string };
    if (!status || !["confirmed", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be 'confirmed' or 'rejected'" });
    }

    const db = await getMongoDb();
    const matchesCol = db.collection<MatchDocument>("matches");
    const match = await matchesCol.findOne({ _id: new ObjectId(id) });
    if (!match) return res.status(404).json({ error: "Match not found" });

    // Verify the user owns one of the matched items
    const userItems = await db
      .collection<ItemDocument>("items")
      .find(
        { reportedBy: new ObjectId(userId) },
        { projection: { _id: 1 } }
      )
      .toArray();
    const userItemIds = new Set(userItems.map((i) => i._id!.toString()));

    if (
      !userItemIds.has(match.lostItemId.toString()) &&
      !userItemIds.has(match.foundItemId.toString())
    ) {
      return res
        .status(403)
        .json({ error: "You can only manage matches for your own items" });
    }

    await matchesCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status as "confirmed" | "rejected" } }
    );

    // If confirmed, mark both items as resolved
    if (status === "confirmed") {
      const itemsCol = db.collection("items");
      await itemsCol.updateOne(
        { _id: match.lostItemId },
        { $set: { status: "resolved", updatedAt: new Date() } }
      );
      await itemsCol.updateOne(
        { _id: match.foundItemId },
        { $set: { status: "resolved", updatedAt: new Date() } }
      );
    }

    const updated = await matchesCol.findOne({ _id: new ObjectId(id) });
    return res.status(200).json({ match: mapMatchDocument(updated!) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to update match: ${msg}` });
  }
};
