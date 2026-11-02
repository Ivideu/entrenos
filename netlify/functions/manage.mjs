// Gestión privada de sesiones (con contraseña): listar, guardar, publicar/despublicar y borrar.
//   GET  /.netlify/functions/manage            → lista (sin contenido pesado)
//   GET  /.netlify/functions/manage?id=XXX     → sesión completa (incluye parte del míster)
//   POST {action:'save', session, publish?}  |  {action:'publish', id, publish}  |  {action:'delete', id}
import { json, preflight, authError, jobStore, cleanStored, isValidId } from './lib/core.mjs';

const MAX_BYTES = 1.5 * 1024 * 1024;
const MAX_SESSIONS = 150;

export default async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  const bad = authError(req);
  if (bad) return bad;
  const store = await jobStore();
  let index = (await store.get('index')) || [];

  if (req.method === 'GET') {
    const id = new URL(req.url).searchParams.get('id');
    if (id) {
      if (!isValidId(id)) return json({ error: 'Identificador no válido.' }, 400);
      const s = await store.get('sess-' + id);
      if (!s) return json({ error: 'No existe esa sesión.' }, 404);
      return json({ session: s, publicada: !!(index.find(e => e.id === id) || {}).publicada });
    }
    return json({ sesiones: index });
  }

  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  let body;
  try { body = await req.json(); } catch (e) { return json({ error: 'Petición no válida.' }, 400); }

  if (body.action === 'save') {
    let s;
    try { s = cleanStored(body.session); } catch (e) { return json({ error: e.message }, 400); }
    if (JSON.stringify(s).length > MAX_BYTES) return json({ error: 'La sesión pesa demasiado.' }, 413);
    const prev = index.find(e => e.id === s.id);
    const publicada = typeof body.publish === 'boolean' ? body.publish : !!(prev && prev.publicada);
    await store.set('sess-' + s.id, s);
    const entry = { id: s.id, fecha: s.fecha, titulo: s.titulo, publicada, actualizada: Date.now() };
    index = [entry, ...index.filter(e => e.id !== s.id)].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || b.actualizada - a.actualizada);
    while (index.length > MAX_SESSIONS) {
      const k = index.map(e => e.publicada).lastIndexOf(false);
      if (k < 0) break;
      const [old] = index.splice(k, 1);
      try { await store.del('sess-' + old.id); } catch (e) { /* ignorar */ }
    }
    await store.set('index', index);
    return json({ ok: true, publicada });
  }

  if (body.action === 'publish' || body.action === 'delete') {
    if (!isValidId(body.id)) return json({ error: 'Identificador no válido.' }, 400);
    const prev = index.find(e => e.id === body.id);
    if (!prev) return json({ error: 'No existe esa sesión.' }, 404);
    if (body.action === 'publish') {
      index = index.map(e => (e.id === body.id ? { ...e, publicada: !!body.publish } : e));
    } else {
      index = index.filter(e => e.id !== body.id);
      try { await store.del('sess-' + body.id); } catch (e) { /* ignorar */ }
    }
    await store.set('index', index);
    return json({ ok: true });
  }
  return json({ error: 'Acción no válida.' }, 400);
};
