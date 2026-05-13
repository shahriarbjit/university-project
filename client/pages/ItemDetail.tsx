import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Tag,
  Mail,
  Phone,
  User,
  Trash2,
  Edit,
  Zap,
  Package,
  AlertTriangle,
  CheckCircle2,
  Link2,
} from "lucide-react";
import type { ItemRecord, MatchRecord, ItemCategory } from "@shared/api";

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
  lost: { label: "Lost", color: "bg-red-100 text-red-700 border-red-200" },
  found: { label: "Found", color: "bg-green-100 text-green-700 border-green-200" },
  matched: { label: "Matched", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  resolved: { label: "Resolved", color: "bg-blue-100 text-blue-700 border-blue-200" },
};

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<ItemRecord | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchMessage, setMatchMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    loadItem();
    loadMatches();
  }, [token, id]);

  async function loadItem() {
    try {
      const res = await fetch(`/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Item not found");
      const data = await res.json();
      setItem(data.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load item");
    } finally {
      setLoading(false);
    }
  }

  async function loadMatches() {
    try {
      const res = await fetch(`/api/matches/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches);
      }
    } catch {
      // Matches are optional, don't show error
    }
  }

  async function runMatching() {
    setMatchLoading(true);
    setMatchMessage("");
    try {
      const res = await fetch("/api/matches/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMatchMessage(data.message);
      loadMatches();
    } catch (err) {
      setMatchMessage(err instanceof Error ? err.message : "Matching failed");
    } finally {
      setMatchLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this item? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      navigate("/lost-found");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link to="/lost-found" className="text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Item Not Found</h1>
          </div>
        </nav>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{error || "Item not found"}</p>
          <Link to="/lost-found">
            <Button variant="outline" className="mt-4">
              Back to Items
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === item.reportedBy;
  const statusConf = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.lost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/lost-found" className="text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Package className="w-6 h-6 text-orange-600" />
            <h1 className="text-lg font-bold text-gray-900">Item Details</h1>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {deleting ? "..." : "Delete"}
              </Button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {item.type === "lost" ? (
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              )}
              <div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConf.color}`}>
                  {statusConf.label}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
              <Tag className="w-3 h-3 inline mr-1" />
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>

          {item.imageUrl && (
            <div className="mb-6">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full max-h-80 object-cover rounded-lg border"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{item.type === "lost" ? "Lost on" : "Found on"} {item.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <User className="w-4 h-4 text-gray-400" />
              <span>
                {item.reportedByName}
                {isOwner && <span className="ml-1 text-xs text-orange-500 font-medium">(You)</span>}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{item.contactEmail}</span>
            </div>
            {item.contactPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{item.contactPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Matching Section */}
        {isOwner && item.status !== "resolved" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Find Matches
              </h3>
              <Button
                size="sm"
                onClick={runMatching}
                disabled={matchLoading}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {matchLoading ? "Searching..." : "Run Matching"}
              </Button>
            </div>
            {matchMessage && (
              <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                {matchMessage}
              </p>
            )}
          </div>
        )}

        {/* Matches List */}
        {matches.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-500" />
              Potential Matches ({matches.length})
            </h3>
            <div className="space-y-3">
              {matches.map((match) => {
                const isLost = item.type === "lost";
                const otherTitle = isLost ? match.foundItemTitle : match.lostItemTitle;
                const otherId = isLost ? match.foundItemId : match.lostItemId;

                return (
                  <div
                    key={match.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        to={`/lost-found/item/${otherId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {otherTitle}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            match.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : match.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {match.status}
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {match.score}%
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {match.reasons.map((reason, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
