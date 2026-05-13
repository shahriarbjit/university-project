import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  Link2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
import type { MatchRecord } from "@shared/api";

export default function Matches() {
  const { isAuthenticated, token, authLoading } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!token) return;
    loadMatches();
  }, [token]);

  async function loadMatches() {
    setLoading(true);
    try {
      const res = await fetch("/api/matches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load matches");
      const data = await res.json();
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function updateMatchStatus(matchId: string, status: "confirmed" | "rejected") {
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      loadMatches();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update match");
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/lost-found" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link2 className="w-6 h-6 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900">My Matches</h1>
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
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Link2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches yet</h3>
            <p className="text-gray-500 mb-6">
              Report an item and run the matching algorithm to find potential matches.
            </p>
            <Link to="/lost-found">
              <Button variant="outline">Browse Items</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const isPending = match.status === "pending";
              const isConfirmed = match.status === "confirmed";
              const isRejected = match.status === "rejected";

              return (
                <div
                  key={match.id}
                  className={`bg-white rounded-xl shadow-sm border p-5 ${
                    isConfirmed
                      ? "border-green-200"
                      : isRejected
                      ? "border-red-200 opacity-60"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-lg font-bold text-orange-600">{match.score}%</span>
                      <span className="text-sm text-gray-400">match score</span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        isConfirmed
                          ? "bg-green-100 text-green-700"
                          : isRejected
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : isRejected ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {match.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs text-red-400 mb-1 font-medium">LOST ITEM</p>
                      <Link
                        to={`/lost-found/item/${match.lostItemId}`}
                        className="font-medium text-gray-900 hover:text-red-600"
                      >
                        {match.lostItemTitle}
                      </Link>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-400 mb-1 font-medium">FOUND ITEM</p>
                      <Link
                        to={`/lost-found/item/${match.foundItemId}`}
                        className="font-medium text-gray-900 hover:text-green-600"
                      >
                        {match.foundItemTitle}
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {match.reasons.map((reason, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>

                  {isPending && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() => updateMatchStatus(match.id, "confirmed")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Confirm Match
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMatchStatus(match.id, "rejected")}
                        className="text-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
