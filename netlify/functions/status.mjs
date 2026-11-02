// GET /.netlify/functions/status?id=...  → estado del análisis: pending | done (con la sesión) | error
import { json, preflight, authError, jobStore } from './lib/core.mjs';

export default async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'GET') return json({ error: 'Método no permitido' }, 405);
  const bad = authError(req);
  if (bad) return bad;

  const id = new URL(req.url).searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/.test(id)) return json({ error: 'Identificador no válido.' }, 400);

  const store = await jobStore();
  const job = await store.get('job-' + id);
  if (!job) return json({ status: 'error', error: 'No encuentro ese análisis.' }, 404);
  if (job.status === 'pending' && Date.now() - job.created > 10 * 60 * 1000) {
    return json({ status: 'error', error: 'El análisis tardó demasiado. Inténtalo de nuevo.' });
  }
  return json(job);
};
