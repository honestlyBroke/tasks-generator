import { useState, useEffect } from 'react';

function StatusItem({ label, status, detail }) {
  const colorClass = status === 'ok' ? 'is-success' : status === 'warn' ? 'is-warning' : 'is-error';

  return (
    <div className="nes-container is-rounded" style={{ marginBottom: '0.75rem', padding: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{label}</span>
          <p className="nes-text is-disabled" style={{ fontSize: '0.6rem', margin: '0.25rem 0 0' }}>
            {detail}
          </p>
        </div>
        <span className={`nes-text ${colorClass}`} style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
          {status === 'ok' ? 'ONLINE' : status === 'warn' ? 'N/A' : status === 'checking' ? '...' : 'OFFLINE'}
        </span>
      </div>
    </div>
  );
}

export default function StatusPage({ apiBase }) {
  const [checks, setChecks] = useState({
    frontend: { status: 'ok', detail: 'React app loaded successfully' },
    localStorage: { status: 'checking', detail: 'Checking...' },
    backend: { status: 'checking', detail: 'Checking...' },
    openrouter: { status: 'checking', detail: 'Checking...' },
    ollama: { status: 'checking', detail: 'Checking...' },
    database: { status: 'checking', detail: 'Checking...' },
  });

  useEffect(() => {
    // Check localStorage
    try {
      const testKey = '__status_check__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      setChecks((prev) => ({ ...prev, localStorage: { status: 'ok', detail: 'Read/write working' } }));
    } catch {
      setChecks((prev) => ({ ...prev, localStorage: { status: 'error', detail: 'localStorage unavailable' } }));
    }

    // Check backend + LLM via health endpoint
    const checkApi = async () => {
      try {
        const res = await fetch(`${apiBase}/api/health`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setChecks((prev) => ({
          ...prev,
          backend: data.backend || { status: 'ok', detail: 'API responding' },
          database: data.database || { status: 'warn', detail: 'Unknown' },
          openrouter: data.openrouter || { status: 'warn', detail: 'Unknown' },
          ollama: data.ollama || { status: 'warn', detail: 'Unknown' },
        }));
      } catch (err) {
        setChecks((prev) => ({
          ...prev,
          backend: { status: 'error', detail: `Cannot reach API: ${err.message}` },
          database: { status: 'error', detail: 'Backend unreachable' },
          openrouter: { status: 'error', detail: 'Backend unreachable' },
          ollama: { status: 'warn', detail: 'Ollama runs locally — cannot check from browser' },
        }));
      }
    };

    checkApi();
  }, [apiBase]);

  return (
    <section className="nes-container with-title is-rounded">
      <p className="title">System Status</p>

      <StatusItem label="Frontend" status={checks.frontend.status} detail={checks.frontend.detail} />
      <StatusItem label="Local Storage" status={checks.localStorage.status} detail={checks.localStorage.detail} />
      <StatusItem label="Backend API" status={checks.backend.status} detail={checks.backend.detail} />
      <StatusItem label="Database" status={checks.database.status} detail={checks.database.detail} />
      <StatusItem label="OpenRouter (LLM)" status={checks.openrouter.status} detail={checks.openrouter.detail} />
      <StatusItem label="Ollama (Local LLM)" status={checks.ollama.status} detail={checks.ollama.detail} />

      <p className="nes-text is-disabled" style={{ fontSize: '0.6rem', marginTop: '1rem' }}>
        Last checked: {new Date().toLocaleString()}
      </p>
    </section>
  );
}
