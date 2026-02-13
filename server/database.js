/**
 * Database layer — migrations + CRUD for specs.
 * Uses Knex.js with better-sqlite3.
 */
import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ── Migrations ──────────────────────────────────────────────

export async function runMigrations() {
  // Specs table — stores complete generated specs
  const hasSpecs = await db.schema.hasTable('specs');
  if (!hasSpecs) {
    await db.schema.createTable('specs', (t) => {
      t.increments('id').primary();
      t.string('title').notNullable();
      t.string('template_type').defaultTo('web');
      t.string('template_label').defaultTo('Web App');
      t.text('goal').notNullable();
      t.text('users').defaultTo('');
      t.text('constraints').defaultTo('');
      t.string('source').defaultTo('template'); // 'template' | 'llm' | 'llm-error'
      t.string('model').defaultTo('');
      t.text('user_stories').defaultTo('[]');   // JSON array
      t.text('tasks').defaultTo('[]');           // JSON array
      t.text('risks').defaultTo('[]');           // JSON array
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created specs table');
  }

  console.log('Database migrations complete');
}

// ── Spec CRUD ───────────────────────────────────────────────

export async function saveSpec(spec) {
  const [id] = await db('specs').insert({
    title: spec.title || 'Untitled Spec',
    template_type: spec.templateType || 'web',
    template_label: spec.templateLabel || 'Web App',
    goal: spec.goal || '',
    users: spec.users || '',
    constraints: spec.constraints || '',
    source: spec.source || 'template',
    model: spec.model || '',
    user_stories: JSON.stringify(spec.userStories || []),
    tasks: JSON.stringify(spec.tasks || []),
    risks: JSON.stringify(spec.risks || []),
    created_at: new Date().toISOString(),
  });
  return id;
}

export async function getSpecs(limit = 20) {
  const rows = await db('specs')
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(limit);

  return rows.map(rowToSpec);
}

export async function getSpecById(id) {
  const row = await db('specs').where({ id }).first();
  if (!row) return null;
  return rowToSpec(row);
}

export async function deleteSpec(id) {
  const deleted = await db('specs').where({ id }).del();
  return deleted > 0;
}

export async function getSpecCount() {
  const result = await db('specs').count('* as count').first();
  return result.count;
}

// ── Helpers ─────────────────────────────────────────────────

function rowToSpec(row) {
  return {
    id: row.id,
    title: row.title,
    templateType: row.template_type,
    templateLabel: row.template_label,
    goal: row.goal,
    users: row.users,
    constraints: row.constraints,
    source: row.source,
    model: row.model,
    userStories: JSON.parse(row.user_stories || '[]'),
    tasks: JSON.parse(row.tasks || '[]'),
    risks: JSON.parse(row.risks || '[]'),
    createdAt: new Date(row.created_at).getTime(),
  };
}
