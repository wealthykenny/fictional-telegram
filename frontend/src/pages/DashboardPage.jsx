import { useEffect, useState } from 'react';
import { RankCard } from '../components/RankCard';
import { apiFetch } from '../lib/api';

const sections = ['Rank', 'Guild Hall', 'Missions', 'Messenger', 'Certificate', 'Orders'];

export function DashboardPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    apiFetch('/.netlify/functions/session').then(setProfile).catch(() => setProfile(null));
  }, []);

  if (!profile) {
    return <p className="text-center">Summoning your dossier...</p>;
  }

  return (
    <div className="space-y-6">
      <RankCard
        currentRank={profile.currentRankLabel}
        title={profile.knightTitle}
        organization={profile.organizationName}
      />
      <section className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <article key={section} className="rounded-xl border border-gold/40 bg-slate-900/70 p-4">
            <h3 className="font-cinzel text-xl text-gold">{section}</h3>
            <p className="text-sm text-slate-200">Operational module available for production workflows.</p>
          </article>
        ))}
      </section>
    </div>
  );
}
