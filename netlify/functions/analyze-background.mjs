// Función en segundo plano (el sufijo -background la hace de hasta 15 min). Llama a la IA y guarda el resultado.
import { authError, jobStore, callAI, parseModelJson, sanitizeSession } from './lib/core.mjs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('', { status: 405 });
  const bad = authError(req);
  if (bad) return bad;

  let jobId = '';
  try { jobId = (await req.json()).jobId; } catch (e) { return new Response('', { status: 400 }); }
  if (!/^[0-9a-f-]{36}$/.test(jobId || '')) return new Response('', { status: 400 });

  const store = await jobStore();
  try {
    const input = await store.get('in-' + jobId);
    if (!input) throw new Error('No encuentro las imágenes de este análisis.');
    const text = await callAI(input);
    const session = sanitizeSession(parseModelJson(text), { fecha: input.fecha, nota: input.nota, fuente: input.fuente });
    await store.set('job-' + jobId, { status: 'done', created: Date.now(), session });
  } catch (e) {
    await store.set('job-' + jobId, { status: 'error', created: Date.now(), error: String(e && e.message || e).slice(0, 300) });
  } finally {
    try { await store.del('in-' + jobId); } catch (e) { /* ignorar */ }
  }
  return new Response('', { status: 202 });
};
