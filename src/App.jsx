import { useState, useCallback, useEffect } from 'react';
import HomePage from './components/HomePage';
import SpecForm from './components/SpecForm';
import TaskList from './components/TaskList';
import ExportPanel from './components/ExportPanel';
import RiskSection from './components/RiskSection';
import HistoryPanel from './components/HistoryPanel';
import StatusPage from './components/StatusPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateSpec } from './utils/taskTemplates';

const MAX_HISTORY = 5;
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

function App() {
  const [page, setPage] = useState('home');
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useLocalStorage('spec-history', []);
  const [dbHistory, setDbHistory] = useState([]);

  // Fetch history from database on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/specs`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setDbHistory(Array.isArray(data) ? data : []))
      .catch(() => setDbHistory([]));
  }, []);

  // Merge localStorage + DB history, deduplicate by createdAt, newest first
  const mergedHistory = (() => {
    const all = [...history, ...dbHistory];
    const seen = new Set();
    return all
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .filter((s) => {
        const key = `${s.createdAt}-${s.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 20);
  })();

  const saveSpecToDb = useCallback(async (spec) => {
    try {
      await fetch(`${API_BASE}/api/specs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spec),
      });
      // Refresh DB history
      const res = await fetch(`${API_BASE}/api/specs`);
      if (res.ok) {
        const data = await res.json();
        setDbHistory(Array.isArray(data) ? data : []);
      }
    } catch {
      // DB save failed — localStorage still has it
    }
  }, []);

  const saveSpec = useCallback((newSpec) => {
    setSpec(newSpec);
    setHistory((prev) => [newSpec, ...prev].slice(0, MAX_HISTORY));
  }, [setHistory]);

  const handleGenerate = useCallback(async (formData) => {
    setError(null);

    // Template mode — instant, no API call
    if (formData.provider === 'template') {
      const newSpec = generateSpec(formData);
      saveSpec(newSpec);
      saveSpecToDb(newSpec);
      return;
    }

    // LLM mode — call serverless API (auto-saved to DB server-side)
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Server error (${res.status})`);
        return;
      }

      setSpec(data);
      // Refresh DB history (spec was already auto-saved server-side, no localStorage needed)
      fetch(`${API_BASE}/api/specs`)
        .then((r) => r.ok ? r.json() : [])
        .then((d) => setDbHistory(Array.isArray(d) ? d : []))
        .catch(() => {});
    } catch (err) {
      setError(`Failed to connect: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [saveSpec, saveSpecToDb]);

  const handleLoadSpec = useCallback((savedSpec) => {
    setSpec(savedSpec);
    setError(null);
    setPage('generator');
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'generator', label: 'Generator' },
    { id: 'history', label: 'History' },
    { id: 'status', label: 'Status' },
  ];

  return (
    <div className="app-wrapper">
      <header className="nes-container is-dark" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', margin: 0 }}>
          <i className="nes-icon trophy is-small" style={{ marginRight: '0.5rem' }} />
          Tasks Generator
        </h1>
        <p style={{ fontSize: '0.7rem', margin: '0.5rem 0 0', color: '#aaa' }}>
          Describe a feature. Get user stories, tasks, and risks.
        </p>
      </header>

      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nes-btn ${page === item.id ? 'is-primary' : ''}`}
            onClick={() => setPage(item.id)}
            style={{ flex: 1, fontSize: '0.75rem' }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main>
        {page === 'home' && (
          <HomePage onGetStarted={() => setPage('generator')} />
        )}

        {page === 'generator' && (
          <>
            <SpecForm onGenerate={handleGenerate} loading={loading} />

            {loading && (
              <div className="nes-container" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>Generating with AI...</p>
                <progress className="nes-progress is-primary" style={{ width: '100%' }} />
              </div>
            )}

            {error && (
              <div className="nes-container" style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#f8d7da', textAlign: 'center' }}>
                <p className="nes-text is-error" style={{ fontSize: '0.7rem', margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            {spec && !loading && (
              <>
                <div className="nes-container" style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#d4edda', textAlign: 'center' }}>
                  <p className="nes-text is-success" style={{ fontSize: '0.75rem', margin: 0 }}>
                    {spec.title}
                    {spec.source === 'llm' && ' (AI-generated)'}
                  </p>
                </div>

                <TaskList spec={spec} onUpdateSpec={setSpec} />
                <RiskSection spec={spec} onUpdateSpec={setSpec} />
                <ExportPanel spec={spec} />
              </>
            )}
          </>
        )}

        {page === 'history' && (
          <HistoryPanel history={mergedHistory} onLoadSpec={handleLoadSpec} />
        )}

        {page === 'status' && (
          <StatusPage apiBase={API_BASE} />
        )}
      </main>

      <footer style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem' }}>
        <p className="nes-text is-disabled" style={{ fontSize: '0.7rem' }}>
          Built by Apoorav Choudhary
        </p>
      </footer>
    </div>
  );
}

export default App;
