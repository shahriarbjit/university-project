import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  Tag,
  ArrowRight,
  Package,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  User,
  Link2,
} from "lucide-react";
import type { ItemRecord, ItemCategory } from "@shared/api";

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  electronics: "Electronics",
  clothing: "Clothing",
  accessories: "Accessories",
  documents: "Documents",
  keys: "Keys",
  bags: "Bags",
  books: "Books",
  sports: "Sports",
  other: "Other",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  lost: { label: "Lost", color: "bg-red-100 text-red-700" },
  found: { label: "Found", color: "bg-green-100 text-green-700" },
  matched: { label: "Matched", color: "bg-yellow-100 text-yellow-700" },
  resolved: { label: "Resolved", color: "bg-blue-100 text-blue-700" },
};

export default function LostFound() {
  const { isAuthenticated, currentUser, token, logout, authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<ItemRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "");
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get("category") || "");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!token) return;
    loadItems();
  }, [token, typeFilter, categoryFilter]);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (typeFilter) params.set("type", typeFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      params.set("limit", "50");

      const res = await fetch(`/api/items?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load items");
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (typeFilter) params.set("type", typeFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    setSearchParams(params);
    loadItems();
  }

  const lostCount = useMemo(() => items.filter((i) => i.type === "lost").length, [items]);
  const foundCount = useMemo(() => items.filter((i) => i.type === "found").length, [items]);
  const resolvedCount = useMemo(() => items.filter((i) => i.status === "resolved").length, [items]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Package className="w-7 h-7 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">Lost & Found</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/lost-found/my-items">
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-1" /> My Items
              </Button>
            </Link>
            <Link to="/lost-found/matches">
              <Button variant="ghost" size="sm">
                <Link2 className="w-4 h-4 mr-1" /> Matches
              </Button>
            </Link>
            <Link to="/lost-found/report">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Plus className="w-4 h-4 mr-1" /> Report Item
              </Button>
            </Link>
            <span className="text-sm text-gray-500 hidden sm:block">
              {currentUser?.fullName}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-sm text-gray-500">Total Items</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{lostCount}</p>
            <p className="text-sm text-red-500">Lost</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{foundCount}</p>
            <p className="text-sm text-green-500">Found</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{resolvedCount}</p>
            <p className="text-sm text-blue-500">Resolved</p>
          </div>
        </div>

        {/* Search & Filters */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search items by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Button type="submit">Search</Button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || typeFilter || categoryFilter
                ? "Try adjusting your search filters."
                : "Be the first to report a lost or found item."}
            </p>
            <Link to="/lost-found/report">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Plus className="w-4 h-4 mr-2" /> Report an Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/lost-found/item/${item.id}`}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      STATUS_CONFIG[item.status]?.color ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.type === "lost" ? (
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    )}
                    {STATUS_CONFIG[item.status]?.label ?? item.status}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    by {item.reportedByName}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
