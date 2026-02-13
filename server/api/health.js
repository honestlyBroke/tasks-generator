import { getSpecCount, runMigrations } from '../database.js';

let migrated = false;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const checks = {
    backend: { status: 'ok', detail: 'Serverless function running' },
    database: { status: 'checking', detail: '' },
    openrouter: { status: 'checking', detail: '' },
    ollama: { status: 'checking', detail: '' },
  };

  // Check Database
  try {
    if (!migrated) {
      await runMigrations();
      migrated = true;
    }
    const count = await getSpecCount();
    checks.database = { status: 'ok', detail: `SQLite connected (${count} specs stored)` };
  } catch (err) {
    checks.database = { status: 'error', detail: `Database error: ${err.message}` };
  }

  // Check OpenRouter
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      checks.openrouter = { status: 'error', detail: 'OPENROUTER_API_KEY not set' };
    } else {
      const resp = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (resp.ok) {
        checks.openrouter = { status: 'ok', detail: 'Connected, key valid' };
      } else {
        checks.openrouter = { status: 'error', detail: `HTTP ${resp.status}` };
      }
    }
  } catch (err) {
    checks.openrouter = { status: 'error', detail: err.message };
  }

  // Check Ollama
  try {
    const ollamaUrl = process.env.OLLAMA_URL;
    if (!ollamaUrl) {
      checks.ollama = { status: 'warn', detail: 'OLLAMA_URL not configured' };
    } else {
      const resp = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        const data = await resp.json();
        const modelCount = data.models?.length || 0;
        checks.ollama = { status: 'ok', detail: `Connected (${modelCount} models available)` };
      } else {
        checks.ollama = { status: 'error', detail: `HTTP ${resp.status}` };
      }
    }
  } catch (err) {
    checks.ollama = { status: 'error', detail: err.message };
  }

  return res.status(200).json(checks);
}
