/**
 * Development + Docker production server.
 * - In dev: serves API only (frontend via Vite)
 * - In Docker/production: serves API + static frontend from dist/
 * Run: node server.js
 */
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './database.js';
import generateHandler from './api/generate.js';
import healthHandler from './api/health.js';
import specsHandler from './api/specs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS - restrict origin in production
app.use((req, res, next) => {
  const allowedOrigin = process.env.NODE_ENV === 'production' && process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN
    : '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// API routes (Express 5 handles req.query automatically)
app.post('/api/generate', generateHandler);
app.get('/api/health', healthHandler);
app.get('/api/specs', specsHandler);
app.post('/api/specs', specsHandler);
app.delete('/api/specs', specsHandler);

// In production (Docker), serve static frontend from dist/
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Initialize database then start server
runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
    console.log(`OpenRouter key: ${process.env.OPENROUTER_API_KEY ? 'configured' : 'MISSING'}`);
    console.log(`Database: SQLite (data/tasks.db)`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
