// Lógica compartida de las funciones: prompt, llamada a la IA, saneado y utilidades.
import { timingSafeEqual, randomBytes } from 'node:crypto';
import { MANUAL_UEFA } from './knowledge.mjs';

// Modelo de Gemini: se puede cambiar en Netlify con la variable GEMINI_MODEL sin tocar el código.
export const MODEL = () => process.env.GEMINI_MODEL || 'gemini-3.8-flash';

/* ───────────── CORS + respuestas ───────────── */
export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-mister-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};
export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...CORS } });
export const preflight = () => new Response(null, { status: 204, headers: CORS });

/* ───────────── Contraseña del míster ───────────── */
export function authError(req) {
  const expected = process.env.MISTER_PASSWORD;
  if (!expected) return json({ error: 'Falta configurar MISTER_PASSWORD en Netlify.' }, 500);
  const got = req.headers.get('x-mister-key') || '';
  const a = Buffer.from(got), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return json({ error: 'Contraseña incorrecta.' }, 401);
  return null;
}

/* ───────────── Almacén de trabajos (Netlify Blobs) ───────────── */
export async function jobStore() {
  if (globalThis.__TEST_STORE) return globalThis.__TEST_STORE; // para pruebas locales
  const { getStore } = await import('@netlify/blobs');
  const s = getStore('futsal-jobs');
  return {
    get: k => s.get(k, { type: 'json' }),
    set: (k, v) => s.setJSON(k, v),
    del: k => s.delete(k)
  };
}

/* ───────────── Prompt ───────────── */
export const SYSTEM_PROMPT = `Eres el mejor entrenador y metodólogo de fútbol sala del mundo (licencia UEFA Pro, especialista en etapas de formación y desarrollo cognitivo). Trabajas con un equipo Infantil de 2º año (13-15 años): 4 jugadores de campo por equipo y 2 porteros. Problemas recurrentes del equipo: estatismo, falta de movilidad sin balón y lentitud en la lectura de espacios.

Recibes imágenes y una nota opcional del míster. Las imágenes pueden ser:
(A) un DIBUJO o pizarra táctica hecha a mano: interpreta posiciones, flechas de movimiento, líneas discontinuas de pase y quién tiene el balón;
(B) FOTOGRAMAS de un vídeo de entrenamiento o partido, en orden cronológico: describe con prudencia lo que se ve (posiciones, si se mueven o están parados, distancia entre compañeros, espacios libres). No inventes lo que no se ve; si algo no se aprecia, dilo en "analisis".

Con eso detectas la idea o el problema táctico y devuelves UNA sesión completa: una ficha para los jugadores (lenguaje cercano, motivador, para 13-15 años) y el diseño de la sesión para el míster.

FORMATO DE SALIDA: responde SOLO con un objeto JSON válido (sin markdown, sin comentarios, sin texto antes ni después), en español, con esta forma:
{
 "titulo": "título corto y motivador",
 "analisis": "3-5 frases: qué se ve en el dibujo/vídeo y cuál es el problema o la idea táctica",
 "jugador": {
   "concepto": "3 frases, cercano y motivador, por qué los hará mejores jugadores",
   "reto": "una regla de oro o pregunta que resolver mentalmente durante la sesión",
   "conBalon": ["3 consejos"],
   "sinBalon": ["3 consejos"],
   "debate": ["2-3 preguntas para analizar entre todos mirando el dibujo/vídeo"],
   "escenas": [ { "titulo": "...", "clave": "frase clave", "mal": ESCENA, "bien": ESCENA } ]
 },
 "mister": {
   "bloques": [
     {"nombre":"Calentamiento / Activación cognitiva","min":12,"tarea":"...","reglas":["..."]},
     {"nombre":"Progresión 1 · Tarea condicionada","min":20,"tarea":"...","reglas":["..."]},
     {"nombre":"Progresión 2 · Tarea táctica principal","min":25,"tarea":"...","reglas":["..."]},
     {"nombre":"Situación real · Transferencia","min":15,"tarea":"...","reglas":["... (el objetivo del día vale doble)"]}
   ],
   "preguntas": ["3 preguntas socráticas para los parones, para que ellos mismos detecten si se quedan parados"]
 }
}

Las tareas usan formatos libres y variados (1v1, 2v1, 2v2, 3v2, 3v3 con comodín, transiciones…), con reglas de inducción concretas que arruinen el estatismo (límite de toques, penalización por estar parado, puntuación doble…). Adapta todo a 4 jugadores de campo por equipo + porteros.

ESCENAS ANIMADAS (1 o 2 como máximo; "mal" muestra el error observado y "bien" la corrección con movimiento). Cada ESCENA es:
{ "dur": 6500,
  "actors": [ {"id":"a1","team":"a","label":"1","path":[[0,110,100],[0.4,150,60],[1,230,50]],"emoji":[{"from":0.1,"to":0.4,"text":"👀"}]} ],
  "ball": [[0,110,100],[0.4,150,60],[1,230,50]],
  "zones": [ {"x":195,"y":85,"w":55,"h":45,"label":"HUECO","from":0.3,"to":0.7} ],
  "notes": [ {"from":0,"to":0.5,"text":"1️⃣ ..."}, {"from":0.5,"to":1.01,"text":"2️⃣ ..."} ] }
Reglas de las escenas:
- Pista de 400 x 200. x crece hacia la portería rival (atacamos hacia la derecha). x entre 10 y 390, y entre 10 y 190.
- team: "a" = nuestro equipo (azul), "b" = rivales (rojo), "c" = comodín (morado), "gk" = portero. 3-6 actores por escena. "label" de 1 carácter.
- Cada path es una lista de [t,x,y] con t creciente de 0 a 1: el primer punto con t=0 y el último con t=1. Para que un jugador esté parado, repite su posición con pequeñas variaciones de 1-2 px.
- La pelota ("ball") sigue siempre al jugador que la tiene y viaja de uno a otro en los pases (mismas coordenadas que el receptor al llegar).
- "zones" (opcional) marca huecos o espacios; "emoji" (opcional) 👀 🧍 🏃 sobre el jugador.
- "notes": 2-3 textos cortos con from/to entre 0 y 1; el último con "to":1.01.
- Las escenas deben ser fieles a lo que se ve en el dibujo/vídeo cuando se pueda, y si no, a la idea del míster.
${MANUAL_UEFA}`;

export function buildUserParts({ imagenes, nota, tipo }) {
  const parts = [];
  imagenes.forEach((img, i) => {
    parts.push({ text: tipo === 'video' ? `Fotograma ${i + 1} de ${imagenes.length}:` : `Imagen ${i + 1} de ${imagenes.length}:` });
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: img.replace(/^data:image\/jpeg;base64,/, '') } });
  });
  parts.push({
    text: (tipo === 'video'
      ? 'Los fotogramas anteriores son de un vídeo, en orden cronológico.'
      : 'Las imágenes anteriores son un dibujo o pizarra táctica.') +
      '\nNota del míster: ' + (nota && nota.trim() ? nota.trim() : '(sin nota)') +
      '\nDevuelve solo el JSON.'
  });
  return parts;
}

/* ───────────── Llamada a la API de Gemini ───────────── */
export async function callAI(input) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Falta configurar GEMINI_API_KEY en Netlify.');
  const model = MODEL();
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: buildUserParts(input) }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 16000, temperature: 0.7 }
    }),
    signal: AbortSignal.timeout(300000)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Gemini respondió con error ' + res.status + (data && data.error && data.error.message ? ': ' + String(data.error.message).slice(0, 200) : ''));
  if (data.promptFeedback && data.promptFeedback.blockReason) throw new Error('Gemini bloqueó las imágenes (' + data.promptFeedback.blockReason + '). Prueba con otro dibujo o con menos fotogramas.');
  const cand = (data.candidates || [])[0];
  if (!cand) throw new Error('Gemini no devolvió ninguna respuesta.');
  if (cand.finishReason === 'MAX_TOKENS') throw new Error('La respuesta de la IA se cortó. Prueba con menos imágenes.');
  if (cand.finishReason === 'SAFETY') throw new Error('Gemini bloqueó la respuesta por seguridad. Prueba con otro dibujo.');
  const text = ((cand.content && cand.content.parts) || []).filter(p => typeof p.text === 'string' && !p.thought).map(p => p.text).join('');
  if (!text) throw new Error('Gemini devolvió una respuesta vacía.');
  return text;
}

export function parseModelJson(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('La IA no devolvió un JSON válido.');
  return JSON.parse(text.slice(a, b + 1));
}

/* ───────────── Saneado (nunca fiarse de la salida del modelo) ───────────── */
const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const str = (v, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const strs = (v, n, max = 400) => (Array.isArray(v) ? v.map(x => str(x, max)).filter(Boolean).slice(0, n) : []);

export function cleanPath(p) {
  if (!Array.isArray(p)) return null;
  let pts = p
    .filter(q => Array.isArray(q) && q.length >= 3)
    .map(q => [clamp(num(q[0], 0), 0, 1), clamp(num(q[1], 200), 8, 392), clamp(num(q[2], 100), 8, 192)])
    .sort((a, b) => a[0] - b[0]);
  if (!pts.length) return null;
  if (pts[0][0] > 0) pts.unshift([0, pts[0][1], pts[0][2]]);
  const last = pts[pts.length - 1];
  if (last[0] < 1) pts.push([1, last[1], last[2]]);
  if (pts.length < 2) pts.push([1, pts[0][1], pts[0][2]]);
  return pts.slice(0, 40).map(q => [+q[0].toFixed(3), +q[1].toFixed(1), +q[2].toFixed(1)]);
}

export function cleanScene(sc) {
  if (!sc || typeof sc !== 'object') return null;
  const actors = (Array.isArray(sc.actors) ? sc.actors : []).slice(0, 8).map((a, i) => {
    const path = cleanPath(a && a.path);
    if (!path) return null;
    const team = ['a', 'b', 'c', 'gk'].includes(a.team) ? a.team : 'a';
    const emoji = (Array.isArray(a.emoji) ? a.emoji : []).slice(0, 4)
      .map(e => ({ from: clamp(num(e && e.from, 0), 0, 1), to: clamp(num(e && e.to, 1), 0, 1.01), text: str(e && e.text, 4) }))
      .filter(e => e.text);
    return { id: str(a.id, 8) || 'x' + i, team, label: str(a.label, 2), path, emoji };
  }).filter(Boolean);
  if (!actors.length) return null;
  const ball = cleanPath(Array.isArray(sc.ball) ? sc.ball : sc.ball && sc.ball.path);
  const zones = (Array.isArray(sc.zones) ? sc.zones : []).slice(0, 4).map(z => {
    const x = clamp(num(z && z.x, 0), 5, 390), y = clamp(num(z && z.y, 0), 5, 190);
    return { x, y, w: clamp(num(z && z.w, 40), 10, 395 - x), h: clamp(num(z && z.h, 40), 10, 195 - y), label: str(z && z.label, 14), from: clamp(num(z && z.from, 0), 0, 1), to: clamp(num(z && z.to, 1.01), 0, 1.01) };
  });
  let notes = (Array.isArray(sc.notes) ? sc.notes : []).slice(0, 4)
    .map(n => ({ from: clamp(num(n && n.from, 0), 0, 1), to: clamp(num(n && n.to, 1.01), 0, 1.01), text: str(n && n.text, 140) }))
    .filter(n => n.text);
  if (!notes.length) notes = [{ from: 0, to: 1.01, text: '' }];
  notes[notes.length - 1].to = 1.01;
  return { dur: clamp(num(sc.dur, 6500), 4000, 10000), actors, ball: ball || undefined, zones, notes };
}

export function sanitizeSession(raw, { fecha, nota } = {}) {
  if (!raw || typeof raw !== 'object') throw new Error('Sesión vacía.');
  const j = raw.jugador || {}, m = raw.mister || {};
  const escenas = (Array.isArray(j.escenas) ? j.escenas : []).slice(0, 2).map(e => {
    const mal = cleanScene(e && e.mal), bien = cleanScene(e && e.bien);
    if (!mal || !bien) return null;
    return { titulo: str(e.titulo, 90) || 'Escena', clave: str(e.clave, 300), mal, bien };
  }).filter(Boolean);
  const bloques = (Array.isArray(m.bloques) ? m.bloques : []).slice(0, 5).map(b => ({
    nombre: str(b && b.nombre, 90), min: clamp(Math.round(num(b && b.min, 15)), 1, 60),
    tarea: str(b && b.tarea, 500), reglas: strs(b && b.reglas, 6, 300)
  })).filter(b => b.nombre && b.tarea);
  if (!bloques.length) throw new Error('La IA no devolvió el diseño de la sesión.');
  const titulo = str(raw.titulo, 90) || 'Entrenamiento a partir de tu análisis';
  const f = /^\d{4}-\d{2}-\d{2}$/.test(fecha || '') ? fecha : new Date().toISOString().slice(0, 10);
  return {
    id: f + '-ia-' + randomBytes(3).toString('hex'),
    fecha: f,
    titulo,
    tags: ['ia'],
    jugador: {
      analisis: str(raw.analisis, 900),
      concepto: str(j.concepto, 700),
      reto: str(j.reto, 300),
      conBalon: strs(j.conBalon, 4),
      sinBalon: strs(j.sinBalon, 4),
      debate: strs(j.debate, 3),
      escenas
    },
    mister: { contexto: str(nota, 600), analisis: str(raw.analisis, 900), bloques, preguntas: strs(m.preguntas, 3) }
  };
}
