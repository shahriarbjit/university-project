import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Lock,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Shield,
  Zap,
} from "lucide-react";

export default function Index() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
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
            {isAuthenticated ? (
              <Link to="/users">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Manage Your Student Profile With Ease
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              UniPortal is a modern student management system designed to streamline
              your academic journey. Sign up, connect with peers, and manage your
              university profile in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {isAuthenticated ? (
                <Link to="/users">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg">
                    View Student Directory
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg"
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

            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Demo Account:</span> Use email{" "}
                  <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono">safal@northsouth.edu</code> and password{" "}
                  <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono">demo123</code>
                </p>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              {/* Decorative gradient circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>

              {/* Hero illustration placeholder */}
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-3/4"></div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                      <div className="space-y-1 flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-purple-200 rounded-full"></div>
                      <div className="space-y-1 flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-pink-200 rounded-full"></div>
                      <div className="space-y-1 flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose UniPortal?</h3>
          <p className="text-lg text-gray-600">
            Everything you need for a better academic experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Secure & Safe</h4>
            <p className="text-gray-600">
              Your data is protected with industry-standard security practices
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Connect with Peers</h4>
            <p className="text-gray-600">
              Easily browse and find other students in your university community
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border border-gray-200">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-pink-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Fast & Reliable</h4>
            <p className="text-gray-600">
              Lightning-fast performance and 99.9% uptime guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Core Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Authentication System</h4>
                <p className="text-gray-600 text-sm">
                  Secure login and registration with password validation
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Student Directory</h4>
                <p className="text-gray-600 text-sm">
                  Browse and search through all registered students
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">User Profiles</h4>
                <p className="text-gray-600 text-sm">
                  View detailed profiles with email and registration date
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Search Functionality</h4>
                <p className="text-gray-600 text-sm">
                  Find students by name or email address instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of students using UniPortal to manage their academic
              profiles and connect with peers.
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd06ffa43e72e464cb894aea9b7a49da7%2F0d9288f2cb6f429182d072aafd61b6cf?format=webp&width=800&height=1200"
                  alt="NSU Logo"
                  className="w-6 h-6 rounded"
                />
                <span className="font-bold">NSU Portal</span>
              </div>
              <p className="text-gray-400 text-sm">
                North South University Student Management System
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 NSU Portal. All rights reserved. Built with React & Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
