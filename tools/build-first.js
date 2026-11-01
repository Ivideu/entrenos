/* Genera docs/sessions.json con la primera sesión y valida los datos de las escenas. Uso: node build-first.js */
const path = require('path');
const fs = require('fs');
const root = path.resolve(process.argv[2] || '/tmp/futsal-web');
const Lib = require(path.join(root, 'mister', 'library.js'));

// 1) Validar todas las escenas de la biblioteca
let problems = 0;
function checkPath(name, p) {
  if (!Array.isArray(p) || p.length < 2) { console.log('✗', name, 'camino vacío'); problems++; return; }
  if (p[0][0] !== 0) { console.log('✗', name, 'no empieza en t=0'); problems++; }
  if (p[p.length - 1][0] !== 1) { console.log('✗', name, 'no acaba en t=1 (último t=' + p[p.length - 1][0] + ')'); problems++; }
  for (let i = 1; i < p.length; i++) {
    if (p[i][0] < p[i - 1][0]) { console.log('✗', name, 'tiempos no crecientes en', i); problems++; }
    const [, x, y] = p[i];
    if (x < 5 || x > 395 || y < 5 || y > 195) { console.log('✗', name, 'fuera de pista', x, y); problems++; }
  }
}
for (const [tag, t] of Object.entries(Lib.TAGS)) {
  ['mal', 'bien'].forEach(k => {
    const sc = t.escena[k];
    sc.actors.forEach(a => checkPath(tag + '.' + k + '.' + a.id, a.path));
    checkPath(tag + '.' + k + '.ball', sc.ball);
    if (!sc.notes.length) { console.log('✗ sin notas', tag, k); problems++; }
  });
  if (t.bloques.length !== 4 || t.preguntas.length !== 3) { console.log('✗ estructura mister', tag); problems++; }
}
console.log(problems ? problems + ' problemas' : 'Escenas OK: ' + Object.keys(Lib.TAGS).length + ' diagnósticos × 2 escenas');

// 2) Primera sesión: lo que ha contado el míster
const s = Lib.buildSession({
  tags: ['bloque', 'estatico'],
  idea: 'Se mueven en bloque, sin crear espacios y se quedan estáticos esperando el balón.',
  fecha: '2026-11-02'
});
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'sessions.json'), JSON.stringify([Lib.publicVersion(s)], null, 1));
fs.writeFileSync(path.join(root, 'mister', 'ejemplo-sesion-completa.json'), JSON.stringify(s, null, 1));
console.log('sessions.json escrito:', s.id, '| escenas:', s.jugador.escenas.length, '| preguntas:', s.mister.preguntas.length);
process.exit(problems ? 1 : 0);
