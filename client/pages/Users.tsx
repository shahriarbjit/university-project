import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, Calendar, User, Search } from "lucide-react";
import { useState, useMemo } from "react";

export default function Users() {
  const { isAuthenticated, currentUser, logout, users } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not authenticated
  if (!isAuthenticated || !currentUser) {
    navigate("/login");
    return null;
  }

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
        {filteredUsers.length > 0 ? (
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

                  {user.id === currentUser.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                        You
                      </span>
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
      </div>
    </div>
  );
}
