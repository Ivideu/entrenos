// Servidor local que imita Netlify (funciones + estáticos) y una IA simulada. Solo para pruebas.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.env.MISTER_PASSWORD = 'secreto';
process.env.GEMINI_API_KEY = 'gk-test';
delete process.env.GEMINI_MODEL;

const mem = new Map();
globalThis.__TEST_STORE = {
  get: async k => (mem.has(k) ? structuredClone(mem.get(k)) : null),
  set: async (k, v) => { mem.set(k, structuredClone(v)); },
  del: async k => { mem.delete(k); }
};

export const aiCalls = [];
const realFetch = globalThis.fetch;
// Respuesta "de la IA": con ruido a propósito (texto alrededor, coordenadas fuera de pista, campos que faltan)
const fakeSession = {
  titulo: 'Sal del bloque y ocupa el hueco',
  analisis: 'Se ven tres jugadores en el mismo carril y el cuarto lejos: el rival defiende con dos.',
  jugador: {
    concepto: 'Si os separáis, el rival tiene que elegir. ¡Y llega tarde!',
    reto: '¿Quién ocupa el carril libre?',
    conBalon: ['Levanta la cabeza', 'Pasa al libre', 'Conduce al hueco'],
    sinBalon: ['Sepárate', 'Pide en movimiento', 'Ocupa el hueco'],
    debate: ['¿Cuántos jugadores hay en el mismo carril?', '¿Dónde estaba el espacio?'],
    escenas: [{
      titulo: 'Del bloque al ancho y profundo', clave: 'Uno ancho, uno cerca, uno profundo',
      mal: { dur: 6000, actors: [
        { id: 'a1', team: 'a', label: '1', path: [[0, 140, 90], [1, 142, 92]] },
        { id: 'a2', team: 'a', label: '2', path: [[0, 165, 110], [1, 166, 111]] },
        { id: 'b1', team: 'b', label: 'R', path: [[0, 215, 98], [0.5, 212, 92], [1, 215, 98]] }
      ], ball: [[0, 140, 90], [1, 165, 110]], notes: [{ from: 0, to: 1.01, text: '❌ Todos juntos' }] },
      bien: { dur: 6500, actors: [
        { id: 'a1', team: 'a', label: '1', path: [[0.2, 110, 35], [1, 250, 500]] },   // empieza tarde y se sale de la pista
        { id: 'a2', team: 'a', label: '2', path: [[0, 150, 100], [0.5, 210, 65], [1, 265, 55]], emoji: [{ from: 0, to: 0.5, text: '👀' }] },
        { id: 'zz', team: 'x', label: 'LARGO', path: [[0, 300, 100]] }                // equipo raro, label largo, 1 punto
      ], ball: [[0, 150, 100], [1, 265, 55]], zones: [{ x: 195, y: 40, w: 900, h: 50, label: 'HUECO', from: 0.3, to: 0.7 }], notes: [{ from: 0, to: 0.5, text: '1️⃣ Nos abrimos' }, { from: 0.5, to: 0.9, text: '2️⃣ Pase al hueco' }] }
    }, { titulo: 'Escena rota (se descarta)', mal: { actors: [] }, bien: null }]
  },
  mister: {
    evaluacion: { ejercicioObservado: 'Rondo de 4 con un defensor.', puntosFuertes: ['Mucho ritmo', 'Muchos toques'], puntosMejorar: ['Se quedan parados tras pasar'], adaptacion: 'Pasa a 3 toques y obliga a cambiar de carril.' },
    bloques: [
      { nombre: 'Calentamiento', min: 12, tarea: 'Pases por carriles', reglas: ['Nunca dos en el mismo carril'] },
      { nombre: 'Progresión 1', min: 20, tarea: '2v1 + comodín', reglas: ['Gol solo tras pase abierto'] },
      { nombre: 'Progresión 2', min: 25, tarea: '3v3 + comodín', reglas: ['Gol doble con 3 carriles'] },
      { nombre: 'Transferencia', min: 15, tarea: '4v4 con porteros', reglas: ['Vale doble'] }
    ],
    preguntas: ['¿Quién está pegado a otro?', '¿Dónde está el hueco?', '¿Qué cambia si te mueves?']
  }
};

globalThis.fetch = async (url, opts) => {
  if (String(url).startsWith('https://generativelanguage.googleapis.com/')) {
    const body = JSON.parse(opts.body);
    const parts = body.contents[0].parts;
    aiCalls.push({
      url: String(url), headers: opts.headers,
      model: decodeURIComponent(String(url).match(/models\/([^:]+):generateContent/)[1]),
      nImages: parts.filter(p => p.inline_data && p.inline_data.mime_type === 'image/jpeg').length,
      tail: parts.at(-1).text,
      system: body.systemInstruction.parts[0].text,
      cfg: body.generationConfig
    });
    await new Promise(r => setTimeout(r, 300));
    return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'razonando…', thought: true }, { text: JSON.stringify(fakeSession) }] } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return realFetch(url, opts);
};

const handlers = {};
for (const n of ['start', 'status', 'analyze-background', 'manage', 'sessions']) handlers[n] = (await import(`../netlify/functions/${n}.mjs`)).default;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

export function startServer(port) {
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://localhost:' + port);
    const m = u.pathname.match(/^\/\.netlify\/functions\/([\w-]+)$/);
    if (m && handlers[m[1]]) {
      const chunks = []; for await (const c of req) chunks.push(c);
      const body = ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks);
      const r = new Request(u, { method: req.method, headers: req.headers, body });
      if (m[1] === 'analyze-background') {            // Netlify responde 202 al instante y sigue trabajando
        handlers[m[1]](r).catch(e => console.error('bg error', e));
        res.writeHead(202); return res.end();
      }
      const out = await handlers[m[1]](r);
      res.writeHead(out.status, Object.fromEntries(out.headers));
      return res.end(Buffer.from(await out.arrayBuffer()));
    }
    let f = path.join(root, 'docs', decodeURIComponent(u.pathname));   // Netlify publica la carpeta docs
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!f.startsWith(path.join(root, 'docs')) || !fs.existsSync(f)) { res.writeHead(404); return res.end('no'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => server.listen(port, () => r(server)));
}
