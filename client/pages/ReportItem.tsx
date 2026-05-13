import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CreateItemRequest, ItemCategory } from "@shared/api";

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "accessories", label: "Accessories" },
  { value: "documents", label: "Documents" },
  { value: "keys", label: "Keys" },
  { value: "bags", label: "Bags" },
  { value: "books", label: "Books" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
];

export default function ReportItem() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState<"lost" | "found">("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory>("electronics");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [contactPhone, setContactPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Title is required");
    if (!description.trim()) return setError("Description is required");
    if (!location.trim()) return setError("Location is required");
    if (!date) return setError("Date is required");

    setSubmitting(true);
    try {
      const body: CreateItemRequest = {
        type,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        date,
        contactPhone: contactPhone.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      };

      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create item");
      }

      const { item } = await res.json();
      navigate(`/lost-found/item/${item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/lost-found" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Package className="w-6 h-6 text-orange-600" />
          <h1 className="text-lg font-bold text-gray-900">Report an Item</h1>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setType("lost")}
            className={`p-6 rounded-xl border-2 text-center transition-all ${
              type === "lost"
                ? "border-red-400 bg-red-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <AlertTriangle
              className={`w-8 h-8 mx-auto mb-2 ${
                type === "lost" ? "text-red-500" : "text-gray-400"
              }`}
            />
            <p className={`font-semibold ${type === "lost" ? "text-red-700" : "text-gray-600"}`}>
              I Lost Something
            </p>
            <p className="text-xs text-gray-400 mt-1">Report an item you've lost</p>
          </button>
          <button
            type="button"
            onClick={() => setType("found")}
            className={`p-6 rounded-xl border-2 text-center transition-all ${
              type === "found"
                ? "border-green-400 bg-green-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <CheckCircle2
              className={`w-8 h-8 mx-auto mb-2 ${
                type === "found" ? "text-green-500" : "text-gray-400"
              }`}
            />
            <p className={`font-semibold ${type === "found" ? "text-green-700" : "text-gray-600"}`}>
              I Found Something
            </p>
            <p className="text-xs text-gray-400 mt-1">Report an item you've found</p>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="title">Item Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Black iPhone 15, Blue Notebook..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the item in detail — color, size, brand, any identifying marks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                className="w-full border rounded-md px-3 py-2 text-sm bg-white mt-1"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="date">
                Date {type === "lost" ? "Lost" : "Found"} *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g. Library 2nd Floor, Science Lab Building..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Contact Phone (optional)</Label>
              <Input
                id="phone"
                placeholder="+880 1XXX-XXXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className={`flex-1 ${
                type === "lost"
                  ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              }`}
            >
              {submitting
                ? "Submitting..."
                : type === "lost"
                ? "Report Lost Item"
                : "Report Found Item"}
            </Button>
            <Link to="/lost-found">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
