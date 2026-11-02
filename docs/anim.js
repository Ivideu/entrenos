/* Motor de pizarra táctica animada (SVG, sin dependencias) */
(function (root) {
  const NS = 'http://www.w3.org/2000/svg';
  const active = new Set();

  // Ayudante DOM (HTML)
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const k in (attrs || {})) {
      const v = attrs[k];
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    kids.flat().forEach(c => {
      if (c == null || c === false) return;
      e.append(c.nodeType ? c : document.createTextNode(String(c)));
    });
    return e;
  }
  function s(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  const COLORS = { a: '#3b82f6', b: '#ef4444', gk: '#facc15', c: '#a855f7' };

  function drawCourt(svg) {
    const L = { stroke: '#ffffff', 'stroke-width': 1.5, fill: 'none', opacity: 0.85 };
    s('rect', { x: 5, y: 5, width: 390, height: 190, ...L }, svg);
    s('line', { x1: 200, y1: 5, x2: 200, y2: 195, ...L }, svg);
    s('circle', { cx: 200, cy: 100, r: 30, ...L }, svg);
    s('path', { d: 'M5 25 A60 60 0 0 1 65 85 L65 115 A60 60 0 0 1 5 175', ...L }, svg);
    s('path', { d: 'M395 25 A60 60 0 0 0 335 85 L335 115 A60 60 0 0 0 395 175', ...L }, svg);
    s('rect', { x: 1, y: 85, width: 4, height: 30, ...L }, svg);
    s('rect', { x: 395, y: 85, width: 4, height: 30, ...L }, svg);
  }

  function pos(path, t) {
    if (!path || !path.length) return [0, 0];
    if (t <= path[0][0]) return [path[0][1], path[0][2]];
    for (let i = 1; i < path.length; i++) {
      if (t <= path[i][0]) {
        const a = path[i - 1], b = path[i];
        const k = (t - a[0]) / ((b[0] - a[0]) || 1);
        return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
      }
    }
    const l = path[path.length - 1];
    return [l[1], l[2]];
  }

  function moved(path) {
    let d = 0;
    for (let i = 1; i < path.length; i++) d += Math.hypot(path[i][1] - path[i - 1][1], path[i][2] - path[i - 1][2]);
    return d;
  }

  // scene: {dur, actors:[{id,team,label,path,emoji}], ball:{path}|[path], zones:[], notes:[]}
  function mount(box, scene, opts) {
    opts = opts || {};
    box.replaceChildren();
    const svg = s('svg', { viewBox: '0 0 400 200', class: 'pitch', role: 'img', 'aria-label': opts.label || 'Pizarra táctica animada' });
    drawCourt(svg);

    const zoneEls = (scene.zones || []).map(z => {
      const g = s('g', { opacity: 0 }, svg);
      s('rect', { x: z.x, y: z.y, width: z.w, height: z.h, rx: 8, fill: '#2ee6a6', 'fill-opacity': 0.28, stroke: '#2ee6a6', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, g);
      if (z.label) {
        const t = s('text', { x: z.x + z.w / 2, y: z.y + z.h / 2 + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#eafff6' }, g);
        t.textContent = z.label;
      }
      return { g, z };
    });

    scene.actors.forEach(a => {
      if (moved(a.path) > 15) {
        const pts = a.path.map(p => p[1] + ',' + p[2]).join(' ');
        s('polyline', { points: pts, fill: 'none', stroke: COLORS[a.team] || '#fff', 'stroke-width': 2, 'stroke-dasharray': '3 5', opacity: 0.45, 'stroke-linecap': 'round' }, svg);
      }
    });

    const actorEls = scene.actors.map(a => {
      const g = s('g', {}, svg);
      s('circle', { r: 9, fill: COLORS[a.team] || '#fff', stroke: '#fff', 'stroke-width': 1.5 }, g);
      const t = s('text', { 'text-anchor': 'middle', y: 3.5, 'font-size': 9.5, 'font-weight': 800, fill: a.team === 'gk' ? '#222' : '#fff' }, g);
      t.textContent = a.label || '';
      const em = s('text', { 'text-anchor': 'middle', y: -13, 'font-size': 13, opacity: 0 }, g);
      return { a, g, em };
    });

    const ballPath = Array.isArray(scene.ball) ? scene.ball : (scene.ball && scene.ball.path);
    const ballG = s('g', {}, svg);
    s('circle', { r: 4.6, fill: '#fff', stroke: '#111', 'stroke-width': 1.2 }, ballG);

    const cap = h('div', { class: 'cap', 'aria-live': 'polite' });
    const reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let playing = !reduce, t0 = 0, pausedAt = 0, raf = 0;
    const PAUSE = 1400;
    const dur = scene.dur || 6000;

    const btnPlay = h('button', { class: 'btn', type: 'button', onclick: () => toggle() }, playing ? '⏸ Pausa' : '▶ Play');
    const btnRe = h('button', { class: 'btn', type: 'button', onclick: () => { t0 = performance.now(); pausedAt = 0; } }, '↻ Otra vez');
    box.append(svg, cap, h('div', { class: 'ctrl' }, btnPlay, btnRe));

    function toggle() {
      if (playing) { playing = false; pausedAt = performance.now() - t0; }
      else { playing = true; t0 = performance.now() - pausedAt; }
      btnPlay.textContent = playing ? '⏸ Pausa' : '▶ Play';
    }

    function frame(p, now) {
      actorEls.forEach(o => {
        const [x, y] = pos(o.a.path, p);
        o.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')');
        const e = (o.a.emoji || []).find(m => p >= m.from && p < m.to);
        if (e) { o.em.textContent = e.text; o.em.setAttribute('opacity', 1); } else o.em.setAttribute('opacity', 0);
      });
      if (ballPath) {
        const [bx, by] = pos(ballPath, p);
        ballG.setAttribute('transform', 'translate(' + bx.toFixed(1) + ',' + by.toFixed(1) + ')');
      } else ballG.setAttribute('opacity', 0);
      zoneEls.forEach(o => {
        const on = p >= (o.z.from || 0) && p < (o.z.to == null ? 1.01 : o.z.to);
        o.g.setAttribute('opacity', on ? (0.7 + 0.3 * Math.sin(now / 160)).toFixed(2) : 0);
      });
      const n = (scene.notes || []).find(n => p >= n.from && p < n.to) || (scene.notes || [])[(scene.notes || []).length - 1];
      const txt = n ? n.text : '';
      if (cap.textContent !== txt) cap.textContent = txt;
    }

    function tick(now) {
      raf = requestAnimationFrame(tick);
      if (!box.isConnected) { stop(); return; }
      if (!svg.getClientRects().length) return;
      const el = playing ? (now - t0) : pausedAt;
      const t = el % (dur + PAUSE);
      frame(Math.min(1, t / dur), now);
    }

    t0 = performance.now();
    if (reduce) { frame(0.85, 0); }
    raf = requestAnimationFrame(tick);
    function stop() { cancelAnimationFrame(raf); active.delete(ctrl); }
    const ctrl = { stop };
    active.add(ctrl);
    return ctrl;
  }

  function stopAll() { active.forEach(c => c.stop()); active.clear(); }

  root.FutsalAnim = { mount, stopAll, h, s, COLORS };
})(typeof window !== 'undefined' ? window : globalThis);
