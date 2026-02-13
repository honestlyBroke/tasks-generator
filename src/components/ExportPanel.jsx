import { useState } from 'react';
import { specToMarkdown } from '../utils/taskTemplates';

export default function ExportPanel({ spec }) {
  const [copied, setCopied] = useState(false);

  if (!spec) return null;

  const markdown = specToMarkdown(spec);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = markdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spec.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="nes-container with-title is-rounded" style={{ marginBottom: '1.5rem' }}>
      <p className="title">Export</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className={`nes-btn ${copied ? 'is-success' : 'is-primary'}`} onClick={handleCopy} style={{ fontSize: '0.75rem' }}>
          {copied ? 'Copied!' : 'Copy as Markdown'}
        </button>
        <button className="nes-btn is-warning" onClick={handleDownload} style={{ fontSize: '0.75rem' }}>
          Download .md
        </button>
      </div>
      <details>
        <summary style={{ fontSize: '0.75rem', cursor: 'pointer', marginBottom: '0.5rem' }}>Preview Markdown</summary>
        <pre style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: '0.65rem',
          maxHeight: '300px',
          overflow: 'auto',
          background: '#212529',
          color: '#f8f9fa',
          padding: '0.75rem',
          borderRadius: '4px',
        }}>
          {markdown}
        </pre>
      </details>
    </section>
  );
}
