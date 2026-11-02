// Pruebas de las funciones sin navegador: node tools/test-functions.mjs
import assert from 'node:assert/strict';
import { startServer, aiCalls } from './mock-server.mjs';
import { retry } from '../netlify/functions/lib/core.mjs';
retry.delays = [5, 5];   // esperas cortas en las pruebas

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
t('429 persistente → error claro con los modelos probados', e.status === 'error' && /saturado/.test(e.error) && /429/.test(e.error) && /gemini-3.8-flash, gemini-3.6-flash, gemini-3.5-flash-lite/.test(e.error));
e = await failWith({ body: { promptFeedback: { blockReason: 'PROHIBITED_CONTENT' } } });
t('imágenes bloqueadas → error claro', e.status === 'error' && /bloque/.test(e.error));
e = await failWith({ body: { candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: '{"titu' }] } }] } });
t('respuesta cortada → error claro', e.status === 'error' && /cort/.test(e.error));
e = await failWith({ body: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'Lo siento, no puedo.' }] } }] } });
t('texto sin JSON → error claro', e.status === 'error' && /JSON/.test(e.error));

// 4b) Reintentos y modelos de respaldo
const GURL = 'https://generativelanguage.googleapis.com/';
const r503 = () => new Response(JSON.stringify({ error: { message: 'This model is currently experiencing high demand.' } }), { status: 503 });
function scripted(handler) {
  const calls = [];
  globalThis.fetch = async (url, o) => {
    if (String(url).startsWith(GURL)) { const m = decodeURIComponent(String(url).match(/models\/([^:]+):/)[1]); calls.push(m); const out = handler(m, calls.filter(x => x === m).length); if (out) return out; }
    return realFetch(url, o);
  };
  return calls;
}
async function runJob() {
  const id = (await (await fetch(base + 'start', { method: 'POST', headers: H, body: JSON.stringify({ imagenes: [jpeg] }) })).json()).jobId; let st;
  for (let i = 0; i < 60; i++) { st = await (await fetch(base + 'status?id=' + id, { headers: H })).json(); if (st.status !== 'pending') break; await new Promise(r => setTimeout(r, 100)); }
  globalThis.fetch = realFetch; return st;
}
let calls = scripted((m, n) => (n <= 2 ? r503() : null));
let j = await runJob();
t('503 dos veces y luego bien → reintenta el mismo modelo', j.status === 'done' && j.modelo === 'gemini-3.8-flash' && calls.length === 3);
calls = scripted(m => (m === 'gemini-3.8-flash' ? r503() : null));
j = await runJob();
t('modelo principal saturado → usa el de respaldo y lo dice', j.status === 'done' && j.modelo === 'gemini-3.6-flash' && calls.filter(x => x === 'gemini-3.8-flash').length === 3);
calls = scripted(m => (m === 'gemini-3.8-flash' ? new Response(JSON.stringify({ error: { message: 'not found' } }), { status: 404 }) : null));
j = await runJob();
t('modelo inexistente (404) → salta al siguiente sin reintentar', j.status === 'done' && j.modelo === 'gemini-3.6-flash' && calls.filter(x => x === 'gemini-3.8-flash').length === 1);
calls = scripted(() => new Response(JSON.stringify({ error: { message: 'API key not valid' } }), { status: 400 }));
j = await runJob();
t('clave inválida (400) → error inmediato, sin reintentos', j.status === 'error' && /400/.test(j.error) && calls.length === 1);
calls = scripted(() => new Response('{}', { status: 404 }));
j = await runJob();
t('ningún modelo existe → mensaje que explica GEMINI_MODEL', j.status === 'error' && /GEMINI_MODEL/.test(j.error) && calls.length === 3);
process.env.GEMINI_MODEL = 'gemini-mio-1';
calls = scripted(null || (() => null));
j = await runJob(); delete process.env.GEMINI_MODEL;
t('GEMINI_MODEL manda sobre el modelo por defecto', j.status === 'done' && j.modelo === 'gemini-mio-1' && calls[0] === 'gemini-mio-1');
process.env.GEMINI_FALLBACK_MODELS = '';
calls = scripted(() => r503());
j = await runJob(); delete process.env.GEMINI_FALLBACK_MODELS;
t('sin modelos de respaldo configurados → solo prueba el principal', j.status === 'error' && new Set(calls).size === 1);

// 5) Evaluación y fuente llegan a la sesión
const j3 = (await (await fetch(base + 'start', { method: 'POST', headers: H, body: JSON.stringify({ imagenes: [jpeg], fuente: 'https://www.instagram.com/reel/abc/', fecha: '2026-11-04' }) })).json()).jobId;
let st3; for (let i = 0; i < 30; i++) { st3 = await (await fetch(base + 'status?id=' + j3, { headers: H })).json(); if (st3.status !== 'pending') break; await new Promise(r => setTimeout(r, 200)); }
t('la evaluación del ejercicio llega a la sesión', st3.status === 'done' && st3.session.mister.evaluacion.puntosMejorar[0].includes('parados'));
t('el enlace de referencia se guarda en la parte del míster', st3.session.mister.fuente === 'https://www.instagram.com/reel/abc/' && !('fuente' in st3.session.jugador));

// 6) Guardar / publicar / leer (manage + sessions)
const M = (body) => fetch(base + 'manage', { method: 'POST', headers: H, body: JSON.stringify(body) });
r = await fetch(base + 'manage'); t('manage sin contraseña → 401', r.status === 401);
r = await fetch(base + 'sessions'); let pub = await r.json();
t('antes de publicar, la web pública está vacía', r.status === 200 && pub.sesion === null && pub.lista.length === 0);

const sess = { ...st3.session, jugador: { ...st3.session.jugador, evidencia: [jpeg, 'data:image/png;base64,AAAA', 'http://evil'] } };
sess.mister.evidencia = [jpeg];
r = await M({ action: 'save', session: sess }); let d = await r.json();
t('guardar sesión (sin publicar)', r.status === 200 && d.publicada === false);
pub = await (await fetch(base + 'sessions')).json();
t('guardada pero NO publicada → los jugadores no la ven', pub.sesion === null);
r = await M({ action: 'save', session: { ...sess, id: '../../x' } });
t('id malicioso rechazado', r.status === 400);
r = await M({ action: 'save', session: { ...sess, fecha: 'ayer' } });
t('fecha mala rechazada', r.status === 400);

r = await M({ action: 'publish', id: sess.id, publish: true });
t('publicar', r.status === 200);
const resPub = await fetch(base + 'sessions'); pub = await resPub.json();
t('ahora los jugadores la ven', pub.sesion && pub.sesion.id === sess.id && pub.lista.length === 1);
t('la parte del míster NO se publica', !('mister' in pub.sesion) && !JSON.stringify(pub).includes('Rondo de 4') && !JSON.stringify(pub).includes('instagram.com') && !JSON.stringify(pub).includes('Quiero que se muevan'));
t('solo miniaturas JPEG válidas en la ficha pública', pub.sesion.jugador.evidencia.length === 1 && pub.sesion.jugador.evidencia[0].startsWith('data:image/jpeg;base64,'));
t('la lectura pública es accesible desde cualquier origen y se cachea', resPub.headers.get('access-control-allow-origin') === '*' && /max-age/.test(resPub.headers.get('cache-control')));
r = await fetch(base + 'sessions?id=' + sess.id); t('abrir una publicada por id', r.status === 200);
r = await fetch(base + 'sessions?id=../etc'); t('id raro en lectura pública → 404/400', r.status >= 400);

d = await (await fetch(base + 'manage?id=' + sess.id, { headers: H })).json();
t('el míster recupera la sesión completa (con su parte privada)', d.session.mister.evaluacion && d.publicada === true && d.session.mister.evidencia.length === 1);
d = await (await fetch(base + 'manage', { headers: H })).json();
t('lista del míster con estado', d.sesiones.length === 1 && d.sesiones[0].publicada === true);

// una sesión de la biblioteca sin IA (formato offline) también se guarda bien
const { createRequire } = await import('node:module'); const req = createRequire(import.meta.url);
const Lib = req('../mister/library.js');
const lib = Lib.buildSession({ tags: ['bloque', 'estatico'], idea: 'prueba', fecha: '2026-11-05' });
r = await M({ action: 'save', session: lib, publish: true }); d = await r.json();
pub = await (await fetch(base + 'sessions')).json();
t('sesión del generador offline: guardada y publicada, con sus pizarras', r.status === 200 && pub.sesion.id === lib.id && pub.sesion.jugador.escenas.length === 2 && pub.lista.length === 2);

r = await M({ action: 'publish', id: sess.id, publish: false });
pub = await (await fetch(base + 'sessions')).json();
t('despublicar la retira de la lista pública', pub.lista.length === 1 && pub.lista[0].id === lib.id);
r = await M({ action: 'delete', id: lib.id });
pub = await (await fetch(base + 'sessions')).json();
t('borrar la elimina', pub.sesion === null && (await (await fetch(base + 'manage', { headers: H })).json()).sesiones.length === 1);

console.log('\n' + ok + ' comprobaciones OK');
server.close(); process.exit(0);
