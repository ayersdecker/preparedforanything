import { Link } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 border border-primary/30 rounded-full p-5">
            <Shield className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-text-primary mb-3">Page Not Found</h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          This page doesn't exist. Don't worry — we'll help you get back on track and stay prepared.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-btn transition-colors"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-surface-2 hover:border-primary/50 text-text-primary font-semibold px-6 py-3 rounded-btn transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
