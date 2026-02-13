import { useState } from 'react';
import { getTemplateOptions } from '../utils/taskTemplates';

const templateOptions = getTemplateOptions();

const MODELS = [
  { id: 'template', label: 'Template (No AI)', provider: 'template', description: 'Instant, no API needed' },
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', provider: 'openrouter', description: 'Fast, free tier ✅' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'openrouter', description: 'Best quality ✅' },
  { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat', provider: 'openrouter', description: 'Fast, free ✅' },
  { id: 'deepseek/deepseek-r1-0528:free', label: 'DeepSeek R1', provider: 'openrouter', description: 'Reasoning, free ✅' },
  { id: 'ollama/tinyllama', label: 'Ollama: TinyLlama', provider: 'ollama', description: 'Local, fast ✅' },
];

export default function SpecForm({ onGenerate, loading }) {
  const [goal, setGoal] = useState('');
  const [users, setUsers] = useState('');
  const [constraints, setConstraints] = useState('');
  const [template, setTemplate] = useState('web');
  const [model, setModel] = useState('google/gemini-2.0-flash-001');
  const [errors, setErrors] = useState({});

  const selectedModel = MODELS.find(m => m.id === model);
  const isTemplate = selectedModel?.provider === 'template';

  const validate = () => {
    const newErrors = {};
    if (!goal.trim()) {
      newErrors.goal = 'Goal is required. Describe what the feature should do.';
    } else if (goal.trim().length < 10) {
      newErrors.goal = 'Please provide a more detailed goal (at least 10 characters).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const provider = selectedModel?.provider || 'template';
    const actualModel = model.startsWith('ollama/') ? model.replace('ollama/', '') : model;

    onGenerate({
      goal: goal.trim(),
      users: users.trim() || 'user',
      constraints: constraints.trim(),
      template,
      model: actualModel,
      provider,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <section className="nes-container with-title is-rounded" style={{ marginBottom: '1.5rem' }}>
        <p className="title">Feature Idea</p>

        {/* Model selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="model" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Generation Mode
          </label>
          <div className="nes-select">
            <select id="model" value={model} onChange={(e) => setModel(e.target.value)}>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} — {m.description}
                </option>
              ))}
            </select>
          </div>
          <p className="nes-text is-disabled" style={{ fontSize: '0.5rem', marginTop: '0.25rem' }}>
            {isTemplate
              ? 'Uses pre-built templates. Instant, no API call.'
              : selectedModel?.provider === 'ollama'
                ? 'Requires Ollama running locally on port 11434.'
                : 'Uses OpenRouter API. May take a few seconds.'}
          </p>
        </div>

        {/* Project type */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="template" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Project Type
          </label>
          <div className="nes-select">
            <select id="template" value={template} onChange={(e) => setTemplate(e.target.value)}>
              {templateOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Goal */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="goal" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Goal *
          </label>
          <textarea
            id="goal"
            className={`nes-textarea ${errors.goal ? 'is-error' : ''}`}
            rows={3}
            value={goal}
            onChange={(e) => { setGoal(e.target.value); if (errors.goal) setErrors(prev => ({ ...prev, goal: null })); }}
            placeholder="What does this feature do? e.g. 'Allow users to track their daily expenses and see monthly summaries'"
            required
          />
          {errors.goal && (
            <p className="nes-text is-error" style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>
              {errors.goal}
            </p>
          )}
        </div>

        {/* Target Users */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="users" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Target Users
          </label>
          <input
            id="users"
            className="nes-input"
            type="text"
            value={users}
            onChange={(e) => setUsers(e.target.value)}
            placeholder="e.g. 'small business owners', 'students', 'developers'"
          />
          <p className="nes-text is-disabled" style={{ fontSize: '0.55rem', marginTop: '0.25rem' }}>
            Defaults to "user" if left empty.
          </p>
        </div>

        {/* Constraints */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="constraints" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
            Constraints (optional)
          </label>
          <textarea
            id="constraints"
            className="nes-textarea"
            rows={2}
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="e.g. 'Must work offline, budget under $500, launch in 2 weeks'"
          />
        </div>

        <button
          type="submit"
          className={`nes-btn ${goal.trim().length >= 10 && !loading ? 'is-success' : 'is-disabled'}`}
          disabled={goal.trim().length < 10 || loading}
          style={{ width: '100%', fontSize: '0.85rem' }}
        >
          {loading ? 'Generating...' : isTemplate ? 'Generate Spec (Template)' : 'Generate Spec (AI)'}
        </button>
      </section>
    </form>
  );
}
