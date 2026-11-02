// POST /.netlify/functions/start  → guarda las imágenes, lanza el análisis en segundo plano y devuelve un jobId.
import { randomUUID } from 'node:crypto';
import { json, preflight, authError, jobStore } from './lib/core.mjs';

const MAX_IMAGES = 10;
const MAX_TOTAL = 5.2 * 1024 * 1024; // el límite de Netlify es 6 MB por petición

export default async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  const bad = authError(req);
  if (bad) return bad;

  let body;
  try { body = await req.json(); } catch (e) { return json({ error: 'Petición no válida.' }, 400); }
  const imagenes = Array.isArray(body.imagenes) ? body.imagenes : [];
  if (!imagenes.length || imagenes.length > MAX_IMAGES) return json({ error: 'Envía entre 1 y ' + MAX_IMAGES + ' imágenes.' }, 400);
  if (!imagenes.every(s => typeof s === 'string' && s.startsWith('data:image/jpeg;base64,'))) return json({ error: 'Las imágenes deben ser JPEG.' }, 400);
  if (imagenes.reduce((n, s) => n + s.length, 0) > MAX_TOTAL) return json({ error: 'Las imágenes pesan demasiado. Prueba con menos.' }, 413);

  const jobId = randomUUID();
  const store = await jobStore();
  await store.set('in-' + jobId, {
    imagenes,
    nota: typeof body.nota === 'string' ? body.nota.slice(0, 1500) : '',
    tipo: body.tipo === 'video' ? 'video' : 'dibujo',
    fecha: typeof body.fecha === 'string' ? body.fecha : '',
    fuente: typeof body.fuente === 'string' ? body.fuente.slice(0, 300) : ''
  });
  await store.set('job-' + jobId, { status: 'pending', created: Date.now() });

  // Lanza el trabajo largo en una función en segundo plano (hasta 15 min).
  const url = new URL('/.netlify/functions/analyze-background', req.url);
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-mister-key': process.env.MISTER_PASSWORD },
      body: JSON.stringify({ jobId })
    });
  } catch (e) {
    await store.set('job-' + jobId, { status: 'error', error: 'No se pudo lanzar el análisis.' });
    return json({ error: 'No se pudo lanzar el análisis.' }, 502);
  }
  return json({ jobId });
};
