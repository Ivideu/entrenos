// Pruebas de las funciones sin navegador: node tools/test-functions.mjs
import assert from 'node:assert/strict';
import { startServer, aiCalls } from './mock-server.mjs';

const PORT = 8811, base = 'http://localhost:' + PORT + '/.netlify/functions/';
const server = await startServer(PORT);
const jpeg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD';
const H = { 'content-type': 'application/json', 'x-mister-key': 'secreto' };
let ok = 0; const t = (name, cond) => { assert.ok(cond, name); ok++; console.log('✓', name); };

// 1) Seguridad
let r = await fetch(base + 'start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
t('sin contraseña → 401', r.status === 401);
r = await fetch(base + 'start', { method: 'POST', headers: { ...H, 'x-mister-key': 'mala' }, body: '{}' });
t('contraseña mala → 401', r.status === 401);
r = await fetch(base + 'status?id=00000000-0000-0000-0000-000000000000', { headers: { 'x-mister-key': 'mala' } });
t('status con contraseña mala → 401', r.status === 401);
r = await fetch(base + 'start', { method: 'OPTIONS' });
t('preflight CORS → 204 con Allow-Origin', r.status === 204 && r.headers.get('access-control-allow-origin') === '*');

// 2) Validación de entrada
r = await fetch(base + 'start', { method: 'POST', headers: H, body: JSON.stringify({ imagenes: [] }) });
t('sin imágenes → 400', r.status === 400);
r = await fetch(base + 'start', { method: 'POST', headers: H, body: JSON.stringify({ imagenes: ['data:image/png;base64,AAAA'] }) });
t('PNG rechazado → 400', r.status === 400);
r = await fetch(base + 'start', { method: 'POST', headers: H, body: JSON.stringify({ imagenes: [jpeg + 'A'.repeat(6 * 1024 * 1024)] }) });
t('demasiado grande → 413', r.status === 413);
r = await fetch(base + 'status?id=../../etc', { headers: H });
t('id raro → 400', r.status === 400);

// 3) Flujo completo con IA simulada
r = await fetch(base + 'start', { method: 'POST', headers: H, body: JSON.stringify({ imagenes: [jpeg, jpeg, jpeg], nota: 'Quiero que se muevan', tipo: 'video', fecha: '2026-11-03' }) });
const { jobId } = await r.json();
t('start devuelve jobId', /^[0-9a-f-]{36}$/.test(jobId));
let st; for (let i = 0; i < 30; i++) { st = await (await fetch(base + 'status?id=' + jobId, { headers: H })).json(); if (st.status !== 'pending') break; await new Promise(r => setTimeout(r, 200)); }
t('análisis termina en done', st.status === 'done');
t('Gemini recibió 3 imágenes y la clave en cabecera', aiCalls.length === 1 && aiCalls[0].nImages === 3 && aiCalls[0].headers['x-goog-api-key'] === 'gk-test' && !aiCalls[0].url.includes('gk-test'));
t('modelo por defecto gemini-3.8-flash', aiCalls[0].model === 'gemini-3.8-flash');
t('pide JSON y deja margen de tokens', aiCalls[0].cfg.responseMimeType === 'application/json' && aiCalls[0].cfg.maxOutputTokens >= 8000);
t('el prompt incluye la metodología del manual UEFA', ['zona despejada', 'zona tapada', 'desmarque de ruptura', 'extremadamente negativo', 'sub-14/sub-15'].every(k => aiCalls[0].system.toLowerCase().includes(k)));
t('el prompt exige 4 jugadores + 2 porteros y formato de escenas', aiCalls[0].system.includes('4 jugadores de campo') && aiCalls[0].system.includes('x crece hacia la portería rival'));
t('la IA vio la nota del míster', aiCalls[0].tail.includes('Quiero que se muevan'));
const s = st.session;
t('sesión: fecha e id', s.fecha === '2026-11-03' && s.id.startsWith('2026-11-03-ia-'));
t('sesión: 4 bloques y 3 preguntas', s.mister.bloques.length === 4 && s.mister.preguntas.length === 3);
t('escena rota descartada (queda 1)', s.jugador.escenas.length === 1);
const bien = s.jugador.escenas[0].bien;
t('coordenadas dentro de la pista', bien.actors.every(a => a.path.every(p => p[1] >= 8 && p[1] <= 392 && p[2] >= 8 && p[2] <= 192)));
t('caminos empiezan en t=0 y acaban en t=1', [...bien.actors].every(a => a.path[0][0] === 0 && a.path.at(-1)[0] === 1 && a.path.length >= 2));
t('equipo raro → "a" y label recortado', bien.actors.find(a => a.id === 'zz').team === 'a' && bien.actors.find(a => a.id === 'zz').label.length <= 2);
t('zona recortada al campo', bien.zones[0].x + bien.zones[0].w <= 395);
t('última nota llega a 1.01', bien.notes.at(-1).to === 1.01);
t('no se filtra la clave ni el pensamiento del modelo', !JSON.stringify(s).includes('gk-test') && !JSON.stringify(s).includes('razonando'));

// 4) Fallos de Gemini se comunican bien
const realFetch = globalThis.fetch;
async function failWith(resp) {
  globalThis.fetch = async (url, o) => String(url).startsWith('https://generativelanguage.googleapis.com/') ? new Response(JSON.stringify(resp.body), { status: resp.status || 200 }) : realFetch(url, o);
  const r = await fetch(base + 'start', { method: 'POST', headers: H, body: JSON.stringify({ imagenes: [jpeg] }) });
  const id = (await r.json()).jobId; let st;
  for (let i = 0; i < 30; i++) { st = await (await fetch(base + 'status?id=' + id, { headers: H })).json(); if (st.status !== 'pending') break; await new Promise(r => setTimeout(r, 200)); }
  globalThis.fetch = realFetch; return st;
}
let e = await failWith({ status: 429, body: { error: { message: 'Quota exceeded' } } });
t('429 de Gemini → error con mensaje', e.status === 'error' && /429/.test(e.error) && /Quota/.test(e.error));
e = await failWith({ body: { promptFeedback: { blockReason: 'PROHIBITED_CONTENT' } } });
t('imágenes bloqueadas → error claro', e.status === 'error' && /bloque/.test(e.error));
e = await failWith({ body: { candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: '{"titu' }] } }] } });
t('respuesta cortada → error claro', e.status === 'error' && /cort/.test(e.error));
e = await failWith({ body: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'Lo siento, no puedo.' }] } }] } });
t('texto sin JSON → error claro', e.status === 'error' && /JSON/.test(e.error));

console.log('\n' + ok + ' comprobaciones OK');
server.close(); process.exit(0);
