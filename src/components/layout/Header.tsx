import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Header() {
  const { currentUser, userProfile, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/risk-assessment', label: 'Risk Assessment' },
    { to: '/kit-builder', label: 'Kit Builder' },
  ];

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors">
            <Shield className="w-7 h-7 text-primary" />
            <span className="font-bold text-lg hidden sm:block">Prepared For Anything</span>
            <span className="font-bold text-lg sm:hidden">PFA</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {(currentUser || isDemoMode) && navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-btn text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isDemoMode && (
              <span className="hidden sm:block text-xs bg-warning/20 text-warning px-2 py-1 rounded-btn">
                Demo Mode
              </span>
            )}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-btn bg-surface-2 hover:bg-surface border border-surface-2 transition-colors text-sm"
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {(userProfile?.displayName ?? currentUser.email ?? 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-text-primary max-w-24 truncate">
                    {userProfile?.displayName ?? currentUser.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-surface-2 rounded-card shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-surface-2">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {userProfile?.displayName ?? 'User'}
                      </p>
                      <p className="text-xs text-text-secondary truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-danger hover:bg-surface-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : !isDemoMode ? (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-btn transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : null}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-btn text-text-secondary hover:text-text-primary hover:bg-surface-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-2 bg-surface">
          <div className="px-4 py-3 space-y-1">
            {(currentUser || isDemoMode) && navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-btn text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!currentUser && !isDemoMode && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-btn text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-btn text-sm font-medium bg-primary text-white hover:bg-primary-dark"
                >
                  Get Started
                </Link>
              </>
            )}
            {currentUser && (
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-btn text-sm font-medium text-danger hover:bg-surface-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  );
}
