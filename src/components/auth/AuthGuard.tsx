import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export default function AuthGuard({ children, requireProfile = false }: AuthGuardProps) {
  const { currentUser, userProfile, loading, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isDemoMode) {
    return <>{children}</>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireProfile && userProfile && !userProfile.profileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
}
