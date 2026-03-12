import React from 'react';

export default function TrustBadge({ badge }) {
  const badges = {
    superhost: { icon: '🏆', label: 'Superhost', color: 'bg-amber-100 text-amber-800' },
    trusted: { icon: '✅', label: 'Trusted', color: 'bg-blue-100 text-blue-800' },
    verified: { icon: '🛡️', label: 'Verified', color: 'bg-emerald-100 text-emerald-800' },
    'top-tenant': { icon: '🌟', label: 'Top Tenant', color: 'bg-purple-100 text-purple-800' },
    none: null
  };

  if (!badges[badge]) return null;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badges[badge].color}`} title={badges[badge].label}>
      {badges[badge].icon} {badges[badge].label}
    </div>
  );
}
