export default function HistoryPanel({ history, onLoadSpec }) {
  if (history.length === 0) {
    return (
      <section className="nes-container with-title is-rounded">
        <p className="title">Recent Specs</p>
        <p className="nes-text is-disabled" style={{ fontSize: '0.85rem' }}>
          No specs generated yet. Fill out the form and generate one!
        </p>
      </section>
    );
  }

  return (
    <section className="nes-container with-title is-rounded">
      <p className="title">Recent Specs</p>
      {history.map((spec, i) => {
        const date = new Date(spec.createdAt);
        const timeStr = date.toLocaleString();
        const goalPreview = spec.goal.length > 80 ? spec.goal.slice(0, 80) + '...' : spec.goal;

        return (
          <div
            key={spec.createdAt}
            className="nes-container is-rounded"
            style={{ marginBottom: '0.75rem', padding: '0.75rem', cursor: 'pointer' }}
            onClick={() => onLoadSpec(spec)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
              <span className="nes-text is-primary" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                #{history.length - i} {spec.templateLabel}
              </span>
              <span className="nes-text is-disabled" style={{ fontSize: '0.65rem' }}>
                {timeStr}
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', margin: '0.25rem 0 0', color: '#444' }}>
              {goalPreview}
            </p>
            <p className="nes-text is-disabled" style={{ fontSize: '0.6rem', margin: '0.25rem 0 0' }}>
              {spec.userStories.length} stories, {spec.tasks.length} tasks, {spec.risks.length} risks
            </p>
          </div>
        );
      })}
    </section>
  );
}
