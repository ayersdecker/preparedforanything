import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/?tab=map', label: 'Disaster Map' },
    { to: '/?tab=area', label: 'Explore Your Area' },
    { to: '/emergency-kit', label: 'Emergency Kit' },
    { to: '/resources', label: 'Local Resources' },
  ];

  const isActive = (path: string) => path.startsWith('/?')
    ? location.pathname === '/' && (new URLSearchParams(location.search).get('tab') || 'area') === new URLSearchParams(path.split('?')[1]).get('tab')
    : location.pathname === path;

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
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? 'page' : undefined}
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

          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-btn text-text-secondary hover:text-text-primary hover:bg-surface-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
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
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? 'page' : undefined}
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
          </div>
        </div>
      )}
    </header>
  );
}
