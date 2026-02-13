/**
 * Serverless endpoint for spec CRUD operations.
 * GET  /api/specs       — list all specs (newest first)
 * GET  /api/specs?id=X  — get single spec by ID
 * POST /api/specs       — save a new spec
 * DELETE /api/specs?id=X — delete a spec
 *
 * Note: In Vercel serverless, we initialize DB on each cold start.
 * For local dev, server.js handles the persistent connection.
 */
import { runMigrations, saveSpec, getSpecs, getSpecById, deleteSpec } from '../database.js';

let migrated = false;

async function ensureMigrated() {
  if (!migrated) {
    await runMigrations();
    migrated = true;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await ensureMigrated();

    if (req.method === 'GET') {
      const id = req.query?.id;
      if (id) {
        const spec = await getSpecById(Number(id));
        if (!spec) return res.status(404).json({ error: 'Spec not found' });
        return res.status(200).json(spec);
      }
      const specs = await getSpecs(20);
      return res.status(200).json(specs);
    }

    if (req.method === 'POST') {
      const spec = req.body;
      if (!spec || !spec.title) {
        return res.status(400).json({ error: 'Invalid spec data' });
      }
      const id = await saveSpec(spec);
      return res.status(201).json({ id, message: 'Spec saved' });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id;
      if (!id) return res.status(400).json({ error: 'Missing id parameter' });
      const deleted = await deleteSpec(Number(id));
      if (!deleted) return res.status(404).json({ error: 'Spec not found' });
      return res.status(200).json({ message: 'Spec deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Specs API error:', err);
    return res.status(500).json({ error: `Database error: ${err.message}` });
  }
}
