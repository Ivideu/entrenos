/* Pinta la ficha del jugador a partir de una sesión (JSON) */
(function (root) {
  const { h, mount, stopAll } = root.FutsalAnim;

  function bullets(list) {
    return h('ul', { class: 'clean' }, (list || []).map(t => h('li', {}, t)));
  }

  function fmtFecha(f) {
    try {
      const d = new Date(f + 'T12:00:00');
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch (e) { return f || ''; }
  }

  function renderPlayer(rootEl, session) {
    stopAll();
    rootEl.replaceChildren();
    const j = session.jugador;

    // 👀 Lo que hemos visto (dibujo o vídeo analizado) + debate en equipo
    const evid = (j.evidencia || []).filter(src => typeof src === 'string' && src.startsWith('data:image/jpeg;base64,'));
    if (j.analisis || evid.length) {
      rootEl.append(h('div', { class: 'card seen' },
        h('h2', {}, '👀 Lo que hemos visto'),
        evid.length ? h('div', { class: 'evid' }, evid.map(src => h('img', { src, alt: 'Imagen del análisis', loading: 'lazy' }))) : null,
        j.analisis ? h('p', { style: 'margin:10px 0 0' }, j.analisis) : null,
        (j.debate && j.debate.length) ? h('div', { class: 'key' }, h('b', {}, '🗣 Analicémoslo juntos:'), bullets(j.debate)) : null
      ));
    }

    rootEl.append(
      h('div', { class: 'card concept' }, h('h2', {}, '💡 Concepto clave del día'), h('p', { style: 'margin:0' }, j.concepto)),
      h('div', { class: 'card reto' }, h('h2', {}, '🧠 El reto de hoy'), h('div', { class: 'big' }, j.reto)),
      h('div', { class: 'grid2' },
        h('div', { class: 'card with' }, h('h2', {}, '⚽ CON balón'), bullets(j.conBalon)),
        h('div', { class: 'card without' }, h('h2', {}, '🏃 SIN balón'), bullets(j.sinBalon))
      )
    );

    const board = h('div', { class: 'card' },
      h('h2', {}, '🎬 Pizarra en movimiento'),
      h('div', { class: 'legend' },
        h('span', {}, h('i', { class: 'dot', style: 'background:#3b82f6' }), 'Tu equipo'),
        h('span', {}, h('i', { class: 'dot', style: 'background:#ef4444' }), 'Rivales'),
        h('span', {}, h('i', { class: 'dot', style: 'background:#a855f7' }), 'Comodín'),
        h('span', {}, '⚪ Balón'),
        h('span', {}, '┈ Camino que recorre el jugador')
      )
    );
    rootEl.append(board);

    (j.escenas || []).forEach(esc => {
      const boxNo = h('div'), boxYes = h('div');
      board.append(
        h('h3', { style: 'margin:18px 0 8px' }, esc.titulo),
        h('div', { class: 'grid2' },
          h('div', { class: 'scene no' }, h('h3', {}, '❌ Así NO'), boxNo),
          h('div', { class: 'scene yes' }, h('h3', {}, '✅ Así SÍ'), boxYes)
        ),
        esc.clave ? h('div', { class: 'key' }, '🔑 ', esc.clave) : null
      );
      mount(boxNo, esc.mal, { label: esc.titulo + ' · así no' });
      mount(boxYes, esc.bien, { label: esc.titulo + ' · así sí' });
    });
  }

  root.FutsalRender = { renderPlayer, fmtFecha };
})(typeof window !== 'undefined' ? window : globalThis);
