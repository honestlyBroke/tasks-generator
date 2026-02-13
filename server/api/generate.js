import { saveSpec as dbSaveSpec, runMigrations } from '../database.js';

let migrated = false;

const SYSTEM_PROMPT = `You are a senior software architect and project planner. Given a feature idea, generate a structured project spec.

You MUST respond with valid JSON only — no markdown, no code fences, no explanation. The JSON must match this exact schema:

{
  "title": "Short spec title",
  "userStories": [
    { "id": "us-1", "story": "As a ..., I want to ... so that ...", "priority": "high|medium|low" }
  ],
  "tasks": [
    { "id": "t-1", "title": "Task title", "group": "Frontend|Backend|Testing|DevOps|Documentation|Planning", "priority": "high|medium|low", "description": "Brief description" }
  ],
  "risks": [
    { "id": "r-1", "risk": "Risk description", "mitigation": "How to mitigate" }
  ]
}

Guidelines:
- Generate 5-8 user stories with realistic acceptance criteria
- Generate 10-15 engineering tasks grouped by category
- Generate 3-5 risks with practical mitigations
- Priorities: ~30% high, ~50% medium, ~20% low
- Tasks should cover the full development lifecycle
- Be specific to the feature described, not generic`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { goal, users, constraints, template, model, provider } = req.body;

  if (!goal || typeof goal !== 'string' || goal.trim().length < 10) {
    return res.status(400).json({ error: 'Goal is required (minimum 10 characters)' });
  }

  // Sanitize inputs - truncate to prevent token overflow and cost issues
  const safeGoal = goal.trim().slice(0, 1000);
  const safeUsers = users ? users.trim().slice(0, 500) : '';
  const safeConstraints = constraints ? constraints.trim().slice(0, 500) : '';

  const userPrompt = [
    `Feature Goal: ${safeGoal}`,
    `Project Type: ${template || 'web'}`,
    safeUsers ? `Target Users: ${safeUsers}` : '',
    safeConstraints ? `Constraints: ${safeConstraints}` : '',
    '',
    'Generate the full project spec as JSON.',
  ].filter(Boolean).join('\n');

  try {
    let response;

    if (provider === 'ollama') {
      // Direct call to Ollama (user's local instance or Ollama cloud)
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'llama3.2',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(502).json({ error: `Ollama error: ${errText}` });
      }

      const data = await response.json();
      const content = data.message?.content || '';
      const spec = parseSpec(content, goal, template, users, constraints);
      spec.model = model || 'llama3.2';
      await autoSave(spec);
      return res.status(200).json(spec);

    } else {
      // OpenRouter
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured on server' });
      }

      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173',
          'X-Title': 'Tasks Generator',
        },
        body: JSON.stringify({
          model: model || 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return res.status(502).json({
          error: `OpenRouter error: ${errData.error?.message || response.statusText}`,
        });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const spec = parseSpec(content, goal, template, users, constraints);
      spec.model = model || 'google/gemini-2.0-flash-001';
      await autoSave(spec);
      return res.status(200).json(spec);
    }
  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}

async function autoSave(spec) {
  try {
    if (!migrated) {
      await runMigrations();
      migrated = true;
    }
    await dbSaveSpec(spec);
  } catch (err) {
    console.error('Auto-save to DB failed (non-fatal):', err.message);
  }
}

function parseSpec(content, goal, template, users, constraints) {
  // Try to extract JSON from the response (handle markdown fences)
  let jsonStr = content;
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1];
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr.trim());
  } catch (err) {
    // If JSON parsing fails, log for debugging and return a structured error spec
    console.error('LLM JSON parse error:', err.message);
    console.error('Raw LLM response (first 500 chars):', content.slice(0, 500));
    return {
      title: `Spec: ${goal}`,
      templateType: template || 'web',
      templateLabel: template || 'Web App',
      goal,
      users: users || 'user',
      constraints: constraints || '',
      userStories: [{ id: 'us-1', story: 'LLM response could not be parsed. Try again or use template mode.', priority: 'high' }],
      tasks: [{ id: 't-1', title: 'Retry generation', group: 'Planning', priority: 'high', description: 'The LLM response was not valid JSON. Try a different model or use template mode.' }],
      risks: [{ id: 'r-1', risk: 'LLM output was unparseable', mitigation: 'Switch to template mode or try a different model' }],
      createdAt: Date.now(),
      source: 'llm-error',
    };
  }

  const templateLabels = { web: 'Web App', mobile: 'Mobile App', internal: 'Internal Tool', api: 'API Service' };

  return {
    title: parsed.title || `Spec: ${goal}`,
    templateType: template || 'web',
    templateLabel: templateLabels[template] || template || 'Web App',
    goal,
    users: users || 'user',
    constraints: constraints || '',
    userStories: (parsed.userStories || []).map((s, i) => ({
      id: s.id || `us-${i + 1}`,
      story: s.story || '',
      priority: s.priority || 'medium',
    })),
    tasks: (parsed.tasks || []).map((t, i) => ({
      id: t.id || `t-${i + 1}`,
      title: t.title || '',
      group: t.group || 'Planning',
      priority: t.priority || 'medium',
      description: t.description || '',
    })),
    risks: (parsed.risks || []).map((r, i) => ({
      id: r.id || `r-${i + 1}`,
      risk: r.risk || '',
      mitigation: r.mitigation || '',
    })),
    createdAt: Date.now(),
    source: 'llm',
  };
}
