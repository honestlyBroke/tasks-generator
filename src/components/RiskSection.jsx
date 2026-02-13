import { useState } from 'react';

export default function RiskSection({ spec, onUpdateSpec }) {
  if (!spec || !spec.risks) return null;

  const handleEditRisk = (riskId, field, value) => {
    onUpdateSpec({
      ...spec,
      risks: spec.risks.map(r => r.id === riskId ? { ...r, [field]: value } : r),
    });
  };

  const handleRemoveRisk = (riskId) => {
    onUpdateSpec({
      ...spec,
      risks: spec.risks.filter(r => r.id !== riskId),
    });
  };

  return (
    <section className="nes-container with-title is-rounded" style={{ marginBottom: '1.5rem', borderColor: '#e76e55' }}>
      <p className="title">Risks & Unknowns</p>
      {spec.risks.length === 0 ? (
        <p className="nes-text is-disabled" style={{ fontSize: '0.75rem' }}>No risks identified.</p>
      ) : (
        spec.risks.map((risk) => (
          <RiskItem
            key={risk.id}
            risk={risk}
            onEdit={handleEditRisk}
            onRemove={handleRemoveRisk}
          />
        ))
      )}
    </section>
  );
}

function RiskItem({ risk, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [editRisk, setEditRisk] = useState(risk.risk);
  const [editMitigation, setEditMitigation] = useState(risk.mitigation);

  if (editing) {
    return (
      <div className="nes-container is-rounded" style={{ marginBottom: '0.5rem', padding: '0.75rem' }}>
        <label style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.25rem' }}>Risk</label>
        <textarea
          className="nes-textarea"
          rows={2}
          value={editRisk}
          onChange={(e) => setEditRisk(e.target.value)}
          style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}
        />
        <label style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.25rem' }}>Mitigation</label>
        <textarea
          className="nes-textarea"
          rows={2}
          value={editMitigation}
          onChange={(e) => setEditMitigation(e.target.value)}
          style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}
        />
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="nes-btn is-success" onClick={() => { onEdit(risk.id, 'risk', editRisk); onEdit(risk.id, 'mitigation', editMitigation); setEditing(false); }} style={{ fontSize: '0.65rem' }}>Save</button>
          <button className="nes-btn" onClick={() => { setEditRisk(risk.risk); setEditMitigation(risk.mitigation); setEditing(false); }} style={{ fontSize: '0.65rem' }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nes-container is-rounded" style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.7rem', margin: '0 0 0.25rem', color: '#e76e55' }}>
            <strong>Risk:</strong> {risk.risk}
          </p>
          <p style={{ fontSize: '0.7rem', margin: 0, color: '#92cc41' }}>
            <strong>Mitigation:</strong> {risk.mitigation}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
          <button className="nes-btn" onClick={() => setEditing(true)} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>✎</button>
          <button className="nes-btn is-error" onClick={() => onRemove(risk.id)} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>✕</button>
        </div>
      </div>
    </div>
  );
}
