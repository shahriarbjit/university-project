import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, Calendar, User, Search, Pencil, Trash2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { UserRecord, UsersResponse } from "@shared/api";

export default function Users() {
  const { isAuthenticated, currentUser, logout, token, authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createFullName, setCreateFullName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editPassword, setEditPassword] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !currentUser)) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, currentUser, navigate]);

  if (authLoading || !currentUser || !token) {
    return null;
  }

  const loadUsers = async (signal?: AbortSignal) => {
    try {
      setIsLoadingUsers(true);
      setLoadError("");

      const response = await fetch("/api/users", {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load users: ${response.status}`);
      }

      const data = (await response.json()) as UsersResponse;
      setUsers(data.users);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setLoadError("Could not load users from the database.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadUsers(controller.signal);
    return () => controller.abort();
  }, [token]);

  const handleCreateUser = async () => {
    try {
      setActionError("");
      setIsSaving(true);

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: createEmail,
          fullName: createFullName,
          password: createPassword,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionError(data.error ?? "Failed to create user");
        return;
      }

      setCreateEmail("");
      setCreateFullName("");
      setCreatePassword("");
      await loadUsers();
    } catch (_error) {
      setActionError("Failed to create user");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (user: UserRecord) => {
    setEditingUserId(user.id);
    setEditEmail(user.email);
    setEditFullName(user.fullName);
    setEditPassword("");
    setActionError("");
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) {
      return;
    }

    try {
      setActionError("");
      setIsSaving(true);

      const body: { email?: string; fullName?: string; password?: string } = {
        email: editEmail,
        fullName: editFullName,
      };
      if (editPassword.trim()) {
        body.password = editPassword;
      }

      const response = await fetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionError(data.error ?? "Failed to update user");
        return;
      }

      setEditingUserId(null);
      await loadUsers();
    } catch (_error) {
      setActionError("Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setActionError("");
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionError(data.error ?? "Failed to delete user");
        return;
      }

      await loadUsers();
    } catch (_error) {
      setActionError("Failed to delete user");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fd06ffa43e72e464cb894aea9b7a49da7%2F0d9288f2cb6f429182d072aafd61b6cf?format=webp&width=800&height=1200"
              alt="NSU Logo"
              className="w-8 h-8 rounded-lg"
            />
            <h1 className="text-xl font-bold text-gray-900">NSU Portal</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-900">{currentUser.fullName}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Directory</h2>
          <p className="text-gray-600">
            Browse all registered students in the university portal
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create User
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={createFullName}
              onChange={(e) => setCreateFullName(e.target.value)}
              placeholder="Full name"
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="Email"
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder="Password"
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleCreateUser} disabled={isSaving}>
              {isSaving ? "Saving..." : "Create User"}
            </Button>
          </div>

          {actionError && <p className="text-sm text-red-700 mt-3">{actionError}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-medium">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
            <p className="text-gray-600 text-sm font-medium">Search Results</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{filteredUsers.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-600">
            <p className="text-gray-600 text-sm font-medium">Your Status</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">Active</p>
          </div>
        </div>

        {/* Users Grid */}
        {isLoadingUsers ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-700">Loading students from MongoDB...</p>
          </div>
        ) : loadError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-md p-12 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load students</h3>
            <p className="text-red-700">{loadError}</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-200 overflow-hidden border border-gray-200 hover:border-blue-300"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-20"></div>
                <div className="p-6 -mt-12 relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full border-4 border-white mx-auto mb-4 shadow-md">
                    <User className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                    {user.fullName}
                  </h3>

                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm text-gray-700 break-all">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Joined</p>
                        <p className="text-sm text-gray-700">{user.createdAt}</p>
                      </div>
                    </div>
                  </div>

                  {user.email === currentUser.email && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                        You
                      </span>
                    </div>
                  )}

                  {user.email !== currentUser.email && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(user)}>
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Delete ${user.fullName}?`)) {
                            void handleDeleteUser(user.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria to find the student you're looking for.
            </p>
          </div>
        )}

        {editingUserId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit User</h3>

              <div className="space-y-3">
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="New password (optional)"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {actionError && <p className="text-sm text-red-700 mt-3">{actionError}</p>}

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingUserId(null)}>
                  Cancel
                </Button>
                <Button onClick={() => void handleUpdateUser()} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
