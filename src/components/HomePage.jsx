export default function HomePage({ onGetStarted }) {
  return (
    <div>
      <section className="nes-container with-title" style={{ marginBottom: '1.5rem' }}>
        <p className="title">How It Works</p>
        <div style={{ fontSize: '0.75rem', lineHeight: '2' }}>
          <p>
            <span className="nes-text is-primary" style={{ fontWeight: 'bold' }}>Step 1:</span>{' '}
            Pick a project type (Web App, Mobile, Internal Tool, or API).
          </p>
          <p>
            <span className="nes-text is-primary" style={{ fontWeight: 'bold' }}>Step 2:</span>{' '}
            Describe your feature idea — the goal, who it's for, and any constraints.
          </p>
          <p>
            <span className="nes-text is-primary" style={{ fontWeight: 'bold' }}>Step 3:</span>{' '}
            Hit "Generate" to get user stories, engineering tasks, and risks.
          </p>
          <p>
            <span className="nes-text is-primary" style={{ fontWeight: 'bold' }}>Step 4:</span>{' '}
            Edit, reorder, or remove tasks. Group them by category.
          </p>
          <p>
            <span className="nes-text is-primary" style={{ fontWeight: 'bold' }}>Step 5:</span>{' '}
            Export as Markdown — copy to clipboard or download a .md file.
          </p>
        </div>
      </section>

      <section className="nes-container" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', marginTop: 0 }}>Features</h3>
        <ul className="nes-list is-disc" style={{ fontSize: '0.7rem', lineHeight: '2.2' }}>
          <li>4 project templates with tailored tasks and risks</li>
          <li>Priority badges (HIGH / MED / LOW) on every item</li>
          <li>Inline editing of stories, tasks, and risks</li>
          <li>Group tasks by category (Frontend, Backend, Testing, DevOps)</li>
          <li>Last 5 specs saved automatically — reload anytime</li>
          <li>Export to Markdown with one click</li>
        </ul>
      </section>

      <div style={{ textAlign: 'center' }}>
        <button className="nes-btn is-success" onClick={onGetStarted} style={{ fontSize: '0.85rem' }}>
          Get Started
        </button>
      </div>
    </div>
  );
}
