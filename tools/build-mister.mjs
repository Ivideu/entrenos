// Genera el panel del míster en UN solo archivo y lo coloca en docs/panel/index.html (se publica en /panel/ protegido por contraseña)
// y también como PANEL-MISTER.html (por si lo abres desde el ordenador).
// Uso: node tools/build-mister.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
let html = read('mister/index.html');

const css = read('docs/style.css');
html = html.replace('<link rel="stylesheet" href="../docs/style.css">', () => '<style>\n' + css + '\n</style>');

for (const src of ['../docs/anim.js', '../docs/render.js', 'library.js', 'media.js']) {
  const tag = '<script src="' + src + '"></script>';
  if (!html.includes(tag)) throw new Error('No encuentro ' + tag);
  const code = read(src.startsWith('..') ? src.slice(3) : 'mister/' + src);
  if (/<\/script/i.test(code)) throw new Error(src + ' contiene </script>');
  html = html.replace(tag, () => '<script>\n' + code + '\n</script>');
}
if (/<(script|link)[^>]+(src|href)="(\.\.|[^h#"][^"]*\.(js|css))"/.test(html)) throw new Error('Quedan referencias externas');

fs.mkdirSync(path.join(root, 'docs', 'panel'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'panel', 'index.html'), html);
fs.writeFileSync(path.join(root, 'PANEL-MISTER.html'), html);
console.log('docs/panel/index.html y PANEL-MISTER.html generados (' + Math.round(html.length / 1024) + ' KB)');
