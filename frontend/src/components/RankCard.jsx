export function RankCard({ currentRank, title, organization }) {
  return (
    <section className="parchment-panel">
      <h2 className="font-cinzel text-2xl text-royal">Heraldic Profile</h2>
      <dl className="mt-4 space-y-2 text-lg">
        <div>
          <dt className="font-semibold">Knight Title</dt>
          <dd>{title}</dd>
        </div>
        <div>
          <dt className="font-semibold">Current Rank</dt>
          <dd>{currentRank}</dd>
        </div>
        <div>
          <dt className="font-semibold">Guild</dt>
          <dd>{organization || 'Unassigned'}</dd>
        </div>
      </dl>
    </section>
  );
}
