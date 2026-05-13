import { RequestHandler } from "express";
import type { MatchRecord, ItemCategory } from "@shared/api";
import {
  items,
  matches,
  nextId,
  seedPromise,
  type MemItem,
  type MemMatch,
} from "../db/memory-store";

function toMatchRecord(doc: MemMatch): MatchRecord {
  return {
    id: doc.id,
    lostItemId: doc.lostItemId,
    foundItemId: doc.foundItemId,
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
  lost: MemItem,
  found: MemItem
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (lost.category === found.category) {
    score += 30;
    reasons.push(`Same category: ${lost.category}`);
  }

  const titleSim = jaccardSimilarity(tokenize(lost.title), tokenize(found.title));
  const titleScore = Math.round(titleSim * 25);
  if (titleScore > 5) {
    score += titleScore;
    reasons.push(`Title similarity: ${Math.round(titleSim * 100)}%`);
  }

  const descSim = jaccardSimilarity(tokenize(lost.description), tokenize(found.description));
  const descScore = Math.round(descSim * 20);
  if (descScore > 3) {
    score += descScore;
    reasons.push(`Description similarity: ${Math.round(descSim * 100)}%`);
  }

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

  const daysDiff = Math.abs(
    (new Date(found.date).getTime() - new Date(lost.date).getTime()) / (1000 * 60 * 60 * 24)
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

// POST /api/matches/run
export const handleRunMatches: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { itemId } = req.body as { itemId?: string };
    if (!itemId) return res.status(400).json({ error: "Valid itemId is required" });

    const sourceItem = items.find((i) => i.id === itemId);
    if (!sourceItem) return res.status(404).json({ error: "Item not found" });

    const oppositeType = sourceItem.type === "lost" ? "found" : "lost";
    const candidates = items.filter(
      (i) => i.type === oppositeType && (i.status === oppositeType || i.status === "matched")
    );

    const MATCH_THRESHOLD = 25;
    const newMatches: MemMatch[] = [];

    for (const candidate of candidates) {
      const lost = sourceItem.type === "lost" ? sourceItem : candidate;
      const found = sourceItem.type === "found" ? sourceItem : candidate;
      const { score, reasons } = computeMatchScore(lost, found);

      if (score >= MATCH_THRESHOLD) {
        const lostId = lost.id;
        const foundId = found.id;

        const existing = matches.find(
          (m) => m.lostItemId === lostId && m.foundItemId === foundId
        );
        if (existing) continue;

        const matchDoc: MemMatch = {
          id: nextId(),
          lostItemId: lostId,
          foundItemId: foundId,
          lostItemTitle: lost.title,
          foundItemTitle: found.title,
          score,
          reasons,
          status: "pending",
          createdAt: new Date(),
        };
        matches.push(matchDoc);
        newMatches.push(matchDoc);
      }
    }

    return res.status(200).json({
      matches: newMatches.map(toMatchRecord),
      message: `Found ${newMatches.length} new match(es)`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Matching failed: ${msg}` });
  }
};

// GET /api/matches
export const handleGetMatches: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const userItemIds = new Set(items.filter((i) => i.reportedBy === userId).map((i) => i.id));
    if (userItemIds.size === 0) return res.status(200).json({ matches: [] });

    const result = matches
      .filter((m) => userItemIds.has(m.lostItemId) || userItemIds.has(m.foundItemId))
      .sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime());

    return res.status(200).json({ matches: result.map(toMatchRecord) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch matches: ${msg}` });
  }
};

// GET /api/matches/item/:id
export const handleGetItemMatches: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = matches
      .filter((m) => m.lostItemId === id || m.foundItemId === id)
      .sort((a, b) => b.score - a.score);

    return res.status(200).json({ matches: result.map(toMatchRecord) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch matches: ${msg}` });
  }
};

// PUT /api/matches/:id
export const handleUpdateMatch: RequestHandler = async (req, res) => {
  try {
    await seedPromise;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.authUser?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.body as { status?: string };
    if (!status || !["confirmed", "rejected"].includes(status))
      return res.status(400).json({ error: "Status must be 'confirmed' or 'rejected'" });

    const match = matches.find((m) => m.id === id);
    if (!match) return res.status(404).json({ error: "Match not found" });

    const userItemIds = new Set(items.filter((i) => i.reportedBy === userId).map((i) => i.id));
    if (!userItemIds.has(match.lostItemId) && !userItemIds.has(match.foundItemId))
      return res.status(403).json({ error: "You can only manage matches for your own items" });

    match.status = status as "confirmed" | "rejected";

    if (status === "confirmed") {
      const lostItem = items.find((i) => i.id === match.lostItemId);
      const foundItem = items.find((i) => i.id === match.foundItemId);
      if (lostItem) { lostItem.status = "resolved"; lostItem.updatedAt = new Date(); }
      if (foundItem) { foundItem.status = "resolved"; foundItem.updatedAt = new Date(); }
    }

    return res.status(200).json({ match: toMatchRecord(match) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to update match: ${msg}` });
  }
};
