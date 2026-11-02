// Parte PÚBLICA: lo que ven los jugadores. Solo sesiones publicadas y sin la parte del míster.
//   GET /.netlify/functions/sessions           → { sesion: la más reciente, lista: [{id,fecha,titulo}] }
//   GET /.netlify/functions/sessions?id=XXX    → { sesion }
import { json, preflight, jobStore, publicSession, isValidId } from './lib/core.mjs';

const cache = r => { r.headers.set('cache-control', 'public, max-age=20'); return r; };

export default async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'GET') return json({ error: 'Método no permitido' }, 405);
  const store = await jobStore();
  const index = ((await store.get('index')) || []).filter(e => e.publicada);
  const lista = index.map(e => ({ id: e.id, fecha: e.fecha, titulo: e.titulo }));

  const id = new URL(req.url).searchParams.get('id') || (index[0] && index[0].id);
  if (!id) return cache(json({ sesion: null, lista: [] }));
  if (!isValidId(id) || !index.some(e => e.id === id)) return json({ error: 'No existe esa sesión.' }, 404);
  const s = await store.get('sess-' + id);
  if (!s) return json({ error: 'No existe esa sesión.' }, 404);
  return cache(json({ sesion: publicSession(s), lista }));
};
