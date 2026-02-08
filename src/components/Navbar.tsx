/**
 * Inventa - Navigation Bar Component
 * Responsive navbar with authentication-aware menu items
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldSearchIcon } from './ShieldSearchIcon';
import { Menu, X, LogOut, LayoutDashboard, Upload, Search, Home } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Shield viewed through magnifying glass */}
          <Link 
            to="/" 
            className="flex items-center gap-3 text-white no-underline hover:opacity-90 transition-opacity"
          >
            <ShieldSearchIcon size={40} variant="default" />
            <span className="font-bold text-xl tracking-tight text-white">Inventa</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors no-underline font-medium ${
                    isActive('/dashboard')
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-white hover:text-orange-400 hover:bg-neutral-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors no-underline font-medium ${
                    isActive('/upload')
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-white hover:text-orange-400 hover:bg-neutral-800'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Link>
                <Link
                  to="/verify"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors no-underline font-medium ${
                    isActive('/verify')
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-white hover:text-orange-400 hover:bg-neutral-800'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Verify
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-neutral-700">
                  <span className="text-neutral-300 text-sm">
                    Welcome, <span className="text-orange-400 font-semibold">{user?.username}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/verify"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors no-underline font-medium ${
                    isActive('/verify')
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-white hover:text-orange-400 hover:bg-neutral-800'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Verify Document
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:text-orange-400 transition-colors no-underline font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all no-underline font-semibold shadow-lg shadow-orange-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:text-orange-400 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-800">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-white hover:text-orange-400 hover:bg-neutral-800 rounded-lg no-underline font-medium"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-white hover:text-orange-400 hover:bg-neutral-800 rounded-lg no-underline font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/upload"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-white hover:text-orange-400 hover:bg-neutral-800 rounded-lg no-underline font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Link>
                  <Link
                    to="/verify"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-white hover:text-orange-400 hover:bg-neutral-800 rounded-lg no-underline font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Verify Document
                  </Link>
                  <div className="border-t border-neutral-800 mt-2 pt-2">
                    <div className="px-4 py-2 text-neutral-300 text-sm">
                      Signed in as <span className="text-orange-400 font-semibold">{user?.username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-white hover:text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/verify"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-white hover:text-orange-400 hover:bg-neutral-800 rounded-lg no-underline font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Verify Document
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-white hover:text-orange-400 hover:bg-neutral-800 rounded-lg no-underline font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 mx-2 mt-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-lg no-underline font-semibold text-center justify-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
