/**
 * Database configuration using Knex.js + SQLite.
 * Stores generated specs persistently instead of just localStorage.
 */
import knex from 'knex';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = knex({
  client: 'better-sqlite3',
  connection: {
    filename: path.join(__dirname, '..', 'data', 'tasks.db'),
  },
  useNullAsDefault: true,
});

export default db;
