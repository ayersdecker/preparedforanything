import { useAuth } from '../contexts/AuthContext';
import { getRisksForState, MONTH_NAMES, SEVERITY_COLORS, SAFETY_TIPS } from '../lib/riskData';
import type { RiskItem } from '../types';
import Card from '../components/ui/Card';
import { AlertTriangle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

function SeverityBadge({ severity }: { severity: RiskItem['severity'] }) {
  const classes: Record<string, string> = {
    extreme: 'bg-danger text-white',
    high: 'bg-primary text-white',
    moderate: 'bg-warning text-black',
    low: 'bg-success text-white',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${classes[severity] ?? 'bg-surface-2 text-text-secondary'}`}>
      {severity}
    </span>
  );
}

export default function RiskAssessment() {
  const { userProfile } = useAuth();
  const primaryLocation = userProfile?.locations?.find((l) => l.isPrimary) ?? userProfile?.locations?.[0];

  const stateCode = primaryLocation?.state;
  const risks = stateCode ? getRisksForState(stateCode) : [];

  // Sort: extreme > high > moderate > low
  const severityOrder = { extreme: 4, high: 3, moderate: 2, low: 1 };
  const sortedRisks = [...risks].sort((a, b) => (severityOrder[b.severity] ?? 0) - (severityOrder[a.severity] ?? 0));

  // Top risk types for safety tips
  const topRisks = sortedRisks.slice(0, 3).map((r) => r.type);

  if (!primaryLocation) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No Location Set</h2>
          <p className="text-text-secondary mb-6">
            Please set up your profile with your location to see your personalized risk assessment.
          </p>
          <Link to="/profile-setup" className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 rounded-btn transition-colors">
            Set Up Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <MapPin className="w-4 h-4" />
            <span>{primaryLocation.city}, {primaryLocation.state} {primaryLocation.zip}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Risk Assessment</h1>
          <p className="text-text-secondary mt-1">
            Based on your location, here are the disasters that could affect your area.
          </p>
        </div>

        {/* Risk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {sortedRisks.map((risk) => {
            const cardClass = SEVERITY_COLORS[risk.severity] ?? 'bg-surface-2 border-surface-2 text-text-primary';
            return (
              <div key={risk.type} className={`rounded-card border p-5 ${cardClass}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{risk.icon}</span>
                    <div>
                      <h3 className="font-bold text-base">{risk.type}</h3>
                      <SeverityBadge severity={risk.severity} />
                    </div>
                  </div>
                </div>
                <p className="text-sm opacity-90 mb-3">{risk.description}</p>
                {risk.seasonalMonths.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wide">Peak months</p>
                    <div className="flex flex-wrap gap-1">
                      {MONTH_NAMES.map((m, i) => (
                        <span
                          key={m}
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            risk.seasonalMonths.includes(i + 1)
                              ? 'bg-white/20 text-current font-bold'
                              : 'bg-black/10 opacity-50'
                          }`}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Seasonal Risk Calendar */}
        <Card className="mb-10">
          <h2 className="font-bold text-text-primary text-lg mb-4">Seasonal Risk Calendar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-text-secondary font-medium py-1 pr-4 whitespace-nowrap">Disaster Type</th>
                  {MONTH_NAMES.map((m) => (
                    <th key={m} className="text-center text-text-secondary font-medium py-1 px-1 min-w-[32px]">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRisks.map((risk) => (
                  <tr key={risk.type} className="border-t border-surface-2">
                    <td className="text-text-primary py-2 pr-4 whitespace-nowrap">
                      {risk.icon} {risk.type}
                    </td>
                    {MONTH_NAMES.map((m, i) => (
                      <td key={m} className="text-center py-2 px-1">
                        {risk.seasonalMonths.includes(i + 1) ? (
                          <div className={`w-6 h-6 rounded mx-auto flex items-center justify-center ${
                            risk.severity === 'extreme' ? 'bg-danger' :
                            risk.severity === 'high' ? 'bg-primary' :
                            risk.severity === 'moderate' ? 'bg-warning' : 'bg-success'
                          }`} />
                        ) : (
                          <div className="w-6 h-6 rounded mx-auto bg-surface-2 opacity-30" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {[['extreme','bg-danger','Extreme'],['high','bg-primary','High'],['moderate','bg-warning','Moderate'],['low','bg-success','Low']].map(([,cls,label]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <div className={`w-3 h-3 rounded ${cls}`} />
                {label}
              </div>
            ))}
          </div>
        </Card>

        {/* Safety Tips */}
        <div>
          <h2 className="font-bold text-text-primary text-lg mb-4">Safety Tips for Your Top Risks</h2>
          <div className="space-y-4">
            {topRisks.map((riskType) => {
              const tips = SAFETY_TIPS[riskType];
              const risk = risks.find((r) => r.type === riskType);
              if (!tips || !risk) return null;
              return (
                <Card key={riskType}>
                  <h3 className="font-bold text-text-primary mb-3">
                    {risk.icon} {riskType} Safety Tips
                  </h3>
                  <ul className="space-y-2">
                    {tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-primary font-bold flex-shrink-0">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
