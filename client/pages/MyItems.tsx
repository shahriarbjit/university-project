import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar,
  Trash2,
  Plus,
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

export default function MyItems() {
  const { isAuthenticated, token, authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!token) return;
    loadMyItems();
  }, [token]);

  async function loadMyItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/items/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load items");
      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/lost-found" className="text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Package className="w-6 h-6 text-orange-600" />
            <h1 className="text-lg font-bold text-gray-900">My Items</h1>
          </div>
          <Link to="/lost-found/report">
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="w-4 h-4 mr-1" /> Report Item
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No items yet</h3>
            <p className="text-gray-500 mb-6">You haven't reported any lost or found items.</p>
            <Link to="/lost-found/report">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500">
                <Plus className="w-4 h-4 mr-2" /> Report an Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.lost;
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border p-5 flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {item.type === "lost" ? (
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={`/lost-found/item/${item.id}`}
                        className="font-semibold text-gray-900 hover:text-orange-600 truncate"
                      >
                        {item.title}
                      </Link>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.date}
                      </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <Link to={`/lost-found/item/${item.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
