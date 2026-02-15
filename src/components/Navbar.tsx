import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Upload, Search, Home, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShieldSearchIcon } from './ShieldSearchIcon';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/upload', label: 'Upload', icon: Upload },
        { path: '/verify', label: 'Verify', icon: Search },
      ]
    : [
        { path: '/', label: 'Home', icon: Home },
        { path: '/verify', label: 'Verify', icon: Search },
      ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-neutral-900/95 backdrop-blur-xl border-b border-[#86862d]/30 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2 sm:gap-3 group no-underline"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#86862d]/40 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <ShieldSearchIcon size={36} variant="default" className="relative" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#86862d] transition-colors duration-300 no-underline">
              Inventa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    relative px-4 py-2 rounded-xl font-medium transition-all duration-300
                    no-underline border border-transparent
                    ${isActive(link.path)
                      ? 'text-[#86862d] bg-[#86862d]/10 border-[#86862d]/50 shadow-[0_0_15px_rgba(134,134,45,0.3)]'
                      : 'text-white hover:text-[#86862d] hover:border-[#86862d]/50 hover:bg-[#86862d]/5 hover:shadow-[0_0_20px_rgba(134,134,45,0.25)]'
                    }
                  `}
                  style={{ textDecoration: 'none' }}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* User Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#86862d]/10 border border-[#86862d]/30">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#86862d] to-[#4D4D1A] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-white leading-tight">{user?.username}</p>
                    <p className="text-neutral-400 text-xs leading-tight">{user?.email}</p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white
                    border border-transparent hover:border-red-500/50 hover:bg-red-500/10 
                    hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]
                    transition-all duration-300 no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl font-medium text-white
                    border border-transparent hover:border-[#86862d]/50 hover:bg-[#86862d]/5
                    hover:shadow-[0_0_20px_rgba(134,134,45,0.25)]
                    transition-all duration-300 no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="relative px-5 py-2.5 rounded-xl font-semibold text-neutral-900
                    bg-gradient-to-r from-[#86862d] to-[#a8a835]
                    hover:shadow-[0_0_25px_rgba(134,134,45,0.5)]
                    transition-all duration-300 overflow-hidden group no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#a8a835] to-[#86862d] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-white border border-transparent
              hover:border-[#86862d]/50 hover:bg-[#86862d]/10 hover:shadow-[0_0_15px_rgba(134,134,45,0.25)]
              transition-all duration-300"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
        
        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-x-0 top-16 sm:top-20 z-50 transition-all duration-300 transform ${
            isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="mx-4 mt-2 p-4 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-[#86862d]/30 shadow-2xl shadow-black/50">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
                      no-underline border border-transparent
                      ${isActive(link.path)
                        ? 'text-[#86862d] bg-[#86862d]/10 border-[#86862d]/50 shadow-[0_0_15px_rgba(134,134,45,0.3)]'
                        : 'text-white hover:text-[#86862d] hover:border-[#86862d]/50 hover:bg-[#86862d]/5'
                      }
                    `}
                    style={{ textDecoration: 'none' }}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              
              <div className="pt-4 mt-4 border-t border-[#86862d]/20 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#86862d]/10 border border-[#86862d]/30">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#86862d] to-[#4D4D1A] flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user?.username}</p>
                        <p className="text-sm text-neutral-400">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium 
                        text-white border border-transparent
                        hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400
                        transition-all duration-300 no-underline"
                      style={{ textDecoration: 'none' }}
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium
                        text-white border border-[#86862d]/30
                        hover:border-[#86862d]/50 hover:bg-[#86862d]/10
                        transition-all duration-300 no-underline"
                      style={{ textDecoration: 'none' }}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold
                        text-neutral-900 bg-gradient-to-r from-[#86862d] to-[#a8a835]
                        hover:shadow-[0_0_25px_rgba(134,134,45,0.5)]
                        transition-all duration-300 no-underline"
                      style={{ textDecoration: 'none' }}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
