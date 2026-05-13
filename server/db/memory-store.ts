import bcrypt from "bcryptjs";

// ─── Types ───────────────────────────────────────────────────

export interface MemUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: Date;
}

export interface MemItem {
  id: string;
  type: "lost" | "found";
  status: "lost" | "found" | "matched" | "resolved";
  title: string;
  description: string;
  category: string;
  location: string;
  date: Date;
  imageUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  reportedBy: string;
  reportedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  lostItemTitle: string;
  foundItemTitle: string;
  score: number;
  reasons: string[];
  status: "pending" | "confirmed" | "rejected";
  createdAt: Date;
}

// ─── ID generator ────────────────────────────────────────────

let idCounter = 100;
export function nextId(): string {
  return String(++idCounter).padStart(24, "0");
}

// ─── In-memory stores ────────────────────────────────────────

export const users: MemUser[] = [];
export const items: MemItem[] = [];
export const matches: MemMatch[] = [];

// ─── Seed dummy data ─────────────────────────────────────────

const DEMO_PASSWORD = "demo1234";

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ── Demo Users ──
  const u1: MemUser = {
    id: nextId(),
    email: "demo@nsu.edu",
    fullName: "Demo User",
    passwordHash: hash,
    createdAt: new Date("2026-04-01"),
  };
  const u2: MemUser = {
    id: nextId(),
    email: "safal@nsu.edu",
    fullName: "Mohaiminul Safal",
    passwordHash: hash,
    createdAt: new Date("2026-04-05"),
  };
  const u3: MemUser = {
    id: nextId(),
    email: "ashraf@nsu.edu",
    fullName: "Ashraf Khan",
    passwordHash: hash,
    createdAt: new Date("2026-04-10"),
  };
  const u4: MemUser = {
    id: nextId(),
    email: "nadia@nsu.edu",
    fullName: "Nadia Rahman",
    passwordHash: hash,
    createdAt: new Date("2026-04-12"),
  };
  const u5: MemUser = {
    id: nextId(),
    email: "tanvir@nsu.edu",
    fullName: "Tanvir Hossain",
    passwordHash: hash,
    createdAt: new Date("2026-04-15"),
  };

  users.push(u1, u2, u3, u4, u5);

  // ── Demo Lost Items ──
  const now = new Date();

  items.push(
    {
      id: nextId(),
      type: "lost",
      status: "lost",
      title: "Black iPhone 15 Pro",
      description:
        "Lost my black iPhone 15 Pro with a clear case. Has a small scratch on the top-left corner of the screen. Last seen near the library.",
      category: "electronics",
      location: "Library 2nd Floor",
      date: new Date("2026-05-10"),
      contactEmail: u1.email,
      contactPhone: "01712345678",
      reportedBy: u1.id,
      reportedByName: u1.fullName,
      createdAt: new Date("2026-05-10T10:30:00"),
      updatedAt: new Date("2026-05-10T10:30:00"),
    },
    {
      id: nextId(),
      type: "lost",
      status: "lost",
      title: "Blue Laptop Bag with Dell Laptop",
      description:
        "Navy blue laptop bag containing a Dell Inspiron 15 laptop, charger, mouse, and some notebooks. Brand: Targus.",
      category: "bags",
      location: "SAC Building Cafeteria",
      date: new Date("2026-05-11"),
      contactEmail: u2.email,
      reportedBy: u2.id,
      reportedByName: u2.fullName,
      createdAt: new Date("2026-05-11T14:00:00"),
      updatedAt: new Date("2026-05-11T14:00:00"),
    },
    {
      id: nextId(),
      type: "lost",
      status: "lost",
      title: "Student ID Card - Nadia Rahman",
      description:
        "NSU student ID card. Name: Nadia Rahman, ID: 2012345678. Lost somewhere between NAC and the main gate.",
      category: "documents",
      location: "NAC Building",
      date: new Date("2026-05-12"),
      contactEmail: u4.email,
      contactPhone: "01898765432",
      reportedBy: u4.id,
      reportedByName: u4.fullName,
      createdAt: new Date("2026-05-12T09:15:00"),
      updatedAt: new Date("2026-05-12T09:15:00"),
    },
    {
      id: nextId(),
      type: "lost",
      status: "lost",
      title: "Silver Watch - Casio",
      description:
        "Silver Casio digital watch with metal band. It has a small dent on the side. Sentimental value.",
      category: "accessories",
      location: "Gym / Sports Complex",
      date: new Date("2026-05-09"),
      contactEmail: u5.email,
      reportedBy: u5.id,
      reportedByName: u5.fullName,
      createdAt: new Date("2026-05-09T17:00:00"),
      updatedAt: new Date("2026-05-09T17:00:00"),
    },
    {
      id: nextId(),
      type: "lost",
      status: "lost",
      title: "Car Keys with Batman Keychain",
      description:
        "A set of car keys (Toyota) with a black Batman keychain and two other house keys attached.",
      category: "keys",
      location: "Parking Lot B",
      date: new Date("2026-05-13"),
      contactEmail: u3.email,
      contactPhone: "01556677889",
      reportedBy: u3.id,
      reportedByName: u3.fullName,
      createdAt: new Date("2026-05-13T08:00:00"),
      updatedAt: new Date("2026-05-13T08:00:00"),
    }
  );

  // ── Demo Found Items ──
  items.push(
    {
      id: nextId(),
      type: "found",
      status: "found",
      title: "iPhone Found Near Library",
      description:
        "Found a black iPhone with clear case on a desk in the library study area. Screen has a scratch. Turned in to the front desk.",
      category: "electronics",
      location: "Library Study Area",
      date: new Date("2026-05-10"),
      contactEmail: u3.email,
      reportedBy: u3.id,
      reportedByName: u3.fullName,
      createdAt: new Date("2026-05-10T12:00:00"),
      updatedAt: new Date("2026-05-10T12:00:00"),
    },
    {
      id: nextId(),
      type: "found",
      status: "found",
      title: "Blue Bag Found in Cafeteria",
      description:
        "Found a navy blue Targus laptop bag left under a cafeteria table. Contains a Dell laptop and charger.",
      category: "bags",
      location: "SAC Cafeteria",
      date: new Date("2026-05-11"),
      contactEmail: u5.email,
      reportedBy: u5.id,
      reportedByName: u5.fullName,
      createdAt: new Date("2026-05-11T16:30:00"),
      updatedAt: new Date("2026-05-11T16:30:00"),
    },
    {
      id: nextId(),
      type: "found",
      status: "found",
      title: "NSU Student ID Card Found",
      description:
        "Found an NSU student ID card near the NAC building entrance. The name on it is Nadia.",
      category: "documents",
      location: "NAC Entrance",
      date: new Date("2026-05-12"),
      contactEmail: u1.email,
      reportedBy: u1.id,
      reportedByName: u1.fullName,
      createdAt: new Date("2026-05-12T11:00:00"),
      updatedAt: new Date("2026-05-12T11:00:00"),
    },
    {
      id: nextId(),
      type: "found",
      status: "found",
      title: "Set of Keys with Keychain",
      description:
        "Found car keys with a Batman keychain in parking lot. Has Toyota logo and two extra keys.",
      category: "keys",
      location: "Parking Lot B",
      date: new Date("2026-05-13"),
      contactEmail: u4.email,
      contactPhone: "01898765432",
      reportedBy: u4.id,
      reportedByName: u4.fullName,
      createdAt: new Date("2026-05-13T09:30:00"),
      updatedAt: new Date("2026-05-13T09:30:00"),
    },
    {
      id: nextId(),
      type: "found",
      status: "found",
      title: "Textbook - Data Structures & Algorithms",
      description:
        "Found a DSA textbook by Cormen (CLRS) in classroom NAC 301. Has some highlighted pages. No name written inside.",
      category: "books",
      location: "NAC 301",
      date: new Date("2026-05-08"),
      contactEmail: u2.email,
      reportedBy: u2.id,
      reportedByName: u2.fullName,
      createdAt: new Date("2026-05-08T15:00:00"),
      updatedAt: new Date("2026-05-08T15:00:00"),
    }
  );

  // ── Demo Matches (pre-computed for the iPhone pair) ──
  const lostIphone = items.find(
    (i) => i.type === "lost" && i.title.includes("iPhone")
  )!;
  const foundIphone = items.find(
    (i) => i.type === "found" && i.title.includes("iPhone")
  )!;

  matches.push({
    id: nextId(),
    lostItemId: lostIphone.id,
    foundItemId: foundIphone.id,
    lostItemTitle: lostIphone.title,
    foundItemTitle: foundIphone.title,
    score: 87,
    reasons: [
      "Same category: electronics",
      "Title similarity: 60%",
      "Description similarity: 45%",
      "Location similarity: 80%",
      "Found within 1 day of being lost",
    ],
    status: "pending",
    createdAt: new Date("2026-05-10T12:30:00"),
  });
}

// Run seed on module load
export const seedPromise = seed();
