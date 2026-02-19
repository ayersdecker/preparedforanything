import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-surface-2 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-text-primary">Prepared For Anything</span>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
            <Link to="/dashboard" className="hover:text-text-primary transition-colors">Dashboard</Link>
            <Link to="/kit-builder" className="hover:text-text-primary transition-colors">Kit Builder</Link>
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t border-surface-2 space-y-2">
          <p className="text-xs text-text-secondary">
            <strong className="text-warning">Disclaimer:</strong> The information provided by Prepared For Anything is for general
            informational and educational purposes only. It is not a substitute for professional emergency management advice.
            Always follow guidance from local authorities and emergency management officials during a disaster.
          </p>
          <p className="text-xs text-text-secondary">
            <strong className="text-warning">Affiliate Disclosure:</strong> Some links on this platform may be affiliate links.
            We may earn a commission if you purchase through these links at no additional cost to you. We only recommend
            products we believe are useful for emergency preparedness.
          </p>
          <p className="text-xs text-text-secondary mt-4">
            © {new Date().getFullYear()} Prepared For Anything. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
