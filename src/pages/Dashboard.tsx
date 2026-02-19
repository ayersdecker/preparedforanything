import { Link } from 'react-router-dom';
import { AlertTriangle, Package, Map, FileText, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getRisksForState } from '../lib/riskData';

export default function Dashboard() {
  const { currentUser, userProfile, isDemoMode } = useAuth();

  const displayName = userProfile?.displayName ?? currentUser?.displayName ?? 'there';
  const primaryLocation = userProfile?.locations?.find((l) => l.isPrimary) ?? userProfile?.locations?.[0];
  const household = userProfile?.household;
  const risks = primaryLocation ? getRisksForState(primaryLocation.state) : [];
  const severityOrder: Record<string, number> = { extreme: 4, high: 3, moderate: 2, low: 1 };
  const highestSeverity = risks.reduce((acc, r) => {
    return (severityOrder[r.severity] ?? 0) > (severityOrder[acc] ?? 0) ? r.severity : acc;
  }, 'low' as string);

  const severityLabel: Record<string, string> = {
    extreme: 'Extreme',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
  };

  const severityColor: Record<string, string> = {
    extreme: 'text-danger',
    high: 'text-primary',
    moderate: 'text-warning',
    low: 'text-success',
  };

  const totalPeople = (household?.adults ?? 1) + (household?.children ?? 0) + (household?.infants ?? 0);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Welcome back, {displayName.split(' ')[0]}! 👋
          </h1>
          <p className="text-text-secondary mt-1">
            {primaryLocation
              ? `Your plan is based on ${primaryLocation.city}, ${primaryLocation.state}`
              : 'Complete your profile to get your personalized preparedness plan.'}
          </p>
        </div>

        {isDemoMode && (
          <div className="bg-warning/10 border border-warning/30 rounded-card p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-warning font-medium text-sm">Demo Mode</p>
              <p className="text-text-secondary text-sm">
                Firebase is not configured. Data is not being saved. Set up your <code>.env</code> file to enable full functionality.
              </p>
            </div>
          </div>
        )}

        {!primaryLocation && (
          <div className="bg-primary/10 border border-primary/30 rounded-card p-4 mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-primary font-medium">Complete your profile</p>
              <p className="text-text-secondary text-sm">Add your location and household details to get personalized recommendations.</p>
            </div>
            <Link to="/profile-setup">
              <Button size="sm">Set Up Profile</Button>
            </Link>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-danger/10 rounded-btn">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <span className="text-sm font-medium text-text-secondary">Risk Level</span>
            </div>
            <div className={`text-2xl font-bold ${severityColor[highestSeverity] ?? 'text-text-primary'}`}>
              {severityLabel[highestSeverity] ?? 'Unknown'}
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {primaryLocation ? `${risks.length} risk types identified` : 'Set up location'}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-btn">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-text-secondary">Kit Status</span>
            </div>
            <div className="text-2xl font-bold text-text-primary">0%</div>
            <div className="w-full bg-surface-2 rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '0%' }} />
            </div>
            <p className="text-xs text-text-secondary mt-1">Not started</p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-info/10 rounded-btn">
                <Map className="w-5 h-5 text-info" />
              </div>
              <span className="text-sm font-medium text-text-secondary">Evacuation Plan</span>
            </div>
            <div className="text-2xl font-bold text-text-secondary">—</div>
            <p className="text-xs text-text-secondary mt-1">Not yet created</p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-success/10 rounded-btn">
                <FileText className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm font-medium text-text-secondary">Documents</span>
            </div>
            <div className="text-2xl font-bold text-text-secondary">0</div>
            <p className="text-xs text-text-secondary mt-1">0 documents</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <TrendingUp className="w-5 h-5 text-danger" />, label: 'View Risk Assessment', to: '/risk-assessment', color: 'border-danger/30 hover:border-danger' },
            { icon: <Package className="w-5 h-5 text-primary" />, label: 'Build Emergency Kit', to: '/kit-builder', color: 'border-primary/30 hover:border-primary' },
            { icon: <Map className="w-5 h-5 text-info" />, label: 'Plan Evacuation', to: '/dashboard', color: 'border-info/30 hover:border-info' },
            { icon: <FileText className="w-5 h-5 text-success" />, label: 'Upload Documents', to: '/dashboard', color: 'border-success/30 hover:border-success' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className={`bg-surface border ${action.color} rounded-card p-4 flex items-center justify-between group transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-2 rounded-btn">{action.icon}</div>
                <span className="text-sm font-medium text-text-primary">{action.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
            </Link>
          ))}
        </div>

        {/* Household Summary */}
        {household && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold text-text-primary mb-4">Household Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total people</span>
                  <span className="text-text-primary font-medium">{totalPeople}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Adults</span>
                  <span className="text-text-primary">{household.adults}</span>
                </div>
                {household.children > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Children</span>
                    <span className="text-text-primary">{household.children}</span>
                  </div>
                )}
                {household.infants > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Infants</span>
                    <span className="text-text-primary">{household.infants}</span>
                  </div>
                )}
                {household.pets.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Pets</span>
                    <span className="text-text-primary">
                      {household.pets.map((p) => `${p.count} ${p.type}`).join(', ')}
                    </span>
                  </div>
                )}
                {household.specialNeeds.length > 0 && (
                  <div>
                    <span className="text-text-secondary block mb-1">Special needs</span>
                    <div className="flex flex-wrap gap-1">
                      {household.specialNeeds.map((n) => (
                        <span key={n} className="text-xs bg-surface-2 text-text-secondary px-2 py-0.5 rounded-full">{n}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-text-primary mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                {[
                  { icon: '✅', text: 'Profile setup completed', time: 'Just now' },
                  { icon: '📍', text: `Location set to ${primaryLocation?.city ?? 'N/A'}, ${primaryLocation?.state ?? ''}`, time: 'Just now' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-base">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-text-primary">{item.text}</p>
                      <p className="text-xs text-text-secondary">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
