import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Search,
  Package,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Link2,
  LogOut,
} from "lucide-react";

export default function Index() {
  const { isAuthenticated, currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-7 h-7 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">NSU Lost & Found</h1>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/lost-found">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    Go to Dashboard
                  </Button>
                </Link>
                <span className="text-sm text-gray-500 hidden sm:block">
                  {currentUser?.fullName}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <Package className="w-4 h-4" />
              University Lost & Found Platform
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Lost Something on Campus?{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                We'll Help You Find It
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Report lost or found items, search the database, and let our smart
              matching algorithm connect you with what you're looking for.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {isAuthenticated ? (
                <>
                  <Link to="/lost-found/report">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg"
                    >
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Report an Item
                    </Button>
                  </Link>
                  <Link to="/lost-found">
                    <Button size="lg" variant="outline" className="text-lg">
                      <Search className="w-5 h-5 mr-2" />
                      Browse Items
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg"
                    >
                      Create Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="text-lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-200 rounded-full opacity-20 blur-3xl"></div>

              {/* Hero cards */}
              <div className="relative z-10 space-y-4">
                {/* Lost item card */}
                <div className="bg-white rounded-xl shadow-lg border p-5 ml-8 transform rotate-1">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Lost</span>
                        <span className="text-xs text-gray-400">2 hours ago</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">Black iPhone 15 Pro</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> Library 2nd Floor
                      </p>
                    </div>
                  </div>
                </div>

                {/* Match indicator */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-200 p-4 mx-4">
                  <div className="flex items-center justify-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-orange-600 text-lg">87% Match Found!</span>
                    <Link2 className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>

                {/* Found item card */}
                <div className="bg-white rounded-xl shadow-lg border p-5 mr-8 transform -rotate-1">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Found</span>
                        <span className="text-xs text-gray-400">1 hour ago</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">iPhone Found in Library</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> Library Study Area
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-lg text-gray-600">
              Three simple steps to recover your lost belongings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-sm font-bold text-orange-500 mb-2">STEP 1</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Report</h4>
              <p className="text-gray-600">
                Report a lost or found item with details like category, location, date, and description
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-sm font-bold text-orange-500 mb-2">STEP 2</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Match</h4>
              <p className="text-gray-600">
                Our smart algorithm compares items by category, description, location, and timing to find matches
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-sm font-bold text-orange-500 mb-2">STEP 3</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Recover</h4>
              <p className="text-gray-600">
                Confirm the match and connect with the finder to get your item back safely
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h3>
          <p className="text-lg text-gray-600">
            Everything you need to find lost items on campus
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border border-gray-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Smart Search</h4>
            <p className="text-gray-600">
              Search by keyword, filter by category, type, location, and date range
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border border-gray-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-yellow-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Auto-Matching</h4>
            <p className="text-gray-600">
              AI-powered algorithm scores potential matches based on 5 weighted criteria
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Secure & Private</h4>
            <p className="text-gray-600">
              JWT-authenticated access. Only verified students can report and browse items
            </p>
          </div>
        </div>
      </div>

      {/* Core Features List */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Everything Included</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Report Lost Items</h4>
                <p className="text-gray-600 text-sm">Describe what you lost with category, location, and date</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Report Found Items</h4>
                <p className="text-gray-600 text-sm">Help others by reporting items you've found on campus</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Smart Matching</h4>
                <p className="text-gray-600 text-sm">Algorithm matches lost with found items automatically</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">9 Item Categories</h4>
                <p className="text-gray-600 text-sm">Electronics, clothing, keys, bags, books, and more</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Match Confirmation</h4>
                <p className="text-gray-600 text-sm">Confirm or reject suggested matches with one click</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Contact Info</h4>
                <p className="text-gray-600 text-sm">View reporter email and phone to arrange pickup</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-12 text-center text-white">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Create your account and start reporting lost or found items on campus today.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-lg">
                Create Your Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-6 h-6 text-orange-400" />
                <span className="font-bold">NSU Lost & Found</span>
              </div>
              <p className="text-gray-400 text-sm">
                North South University campus lost and found platform. Report, search, and recover.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/lost-found" className="hover:text-white transition">Browse Items</Link></li>
                <li><Link to="/lost-found/report" className="hover:text-white transition">Report Item</Link></li>
                <li><Link to="/lost-found/matches" className="hover:text-white transition">My Matches</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
                <li><Link to="/lost-found/my-items" className="hover:text-white transition">My Items</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 NSU Lost & Found. North South University. Built with React & Node.js.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
