/* Prepara dibujos y vídeos en el navegador: reduce imágenes y extrae fotogramas. Nada sale del equipo hasta que pulsas "Analizar". */
(function (root) {
  function drawScaled(src, w, h, maxDim, q) {
    const k = Math.min(1, maxDim / Math.max(w, h));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(src, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', q);
  }

  function loadImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { res({ img, done: () => URL.revokeObjectURL(url) }); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('No puedo abrir la imagen ' + file.name)); };
      img.src = url;
    });
  }

  async function imageFrame(file, big, thumb) {
    const { img, done } = await loadImage(file);
    const out = { big: drawScaled(img, img.naturalWidth, img.naturalHeight, big, 0.78), thumb: drawScaled(img, img.naturalWidth, img.naturalHeight, thumb, 0.6) };
    done();
    return out;
  }

  const NO_VIDEO = 'No puedo leer ese vídeo en este navegador. Haz 4-6 capturas de pantalla del vídeo y súbelas como imágenes.';

  function seek(v, t) {
    return new Promise((res, rej) => {
      let done = false;
      const fin = fn => { if (done) return; done = true; clearTimeout(to); v.removeEventListener('seeked', ok); v.removeEventListener('error', no); fn(); };
      const ok = () => fin(res), no = () => fin(() => rej(new Error(NO_VIDEO)));
      const to = setTimeout(no, 7000);
      v.addEventListener('seeked', ok); v.addEventListener('error', no);
      v.currentTime = t;
    });
  }

  async function videoFrames(file, n, big, thumb, onProgress) {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.src = url;
    try {
      await new Promise((res, rej) => {
        const to = setTimeout(() => rej(new Error(NO_VIDEO)), 15000);
        v.addEventListener('loadeddata', () => { clearTimeout(to); res(); }, { once: true });
        v.addEventListener('error', () => { clearTimeout(to); rej(new Error(NO_VIDEO)); }, { once: true });
      });
      // Algunos móviles (iOS) no dejan buscar fotogramas hasta que el vídeo ha arrancado una vez.
      try { await Promise.race([v.play(), new Promise(r => setTimeout(r, 1500))]); v.pause(); } catch (e) { /* ignorar */ }
      const d = v.duration;
      if (!isFinite(d) || d <= 0 || !v.videoWidth) throw new Error(NO_VIDEO);
      const frames = [];
      for (let i = 0; i < n; i++) {
        await seek(v, Math.min(d - 0.05, (i + 0.5) / n * d));
        frames.push({ big: drawScaled(v, v.videoWidth, v.videoHeight, big, 0.75), thumb: drawScaled(v, v.videoWidth, v.videoHeight, thumb, 0.6) });
        if (onProgress) onProgress(i + 1, n);
      }
      return frames;
    } finally { URL.revokeObjectURL(url); v.removeAttribute('src'); v.load(); }
  }

  /* files: FileList. Devuelve {tipo, big:[dataURL], evidencia:[dataURL ≤3]} */
  async function prepare(files, onProgress) {
    const list = Array.from(files);
    const video = list.find(f => f.type.startsWith('video/'));
    let frames = [], tipo = 'dibujo';
    if (video) {
      tipo = 'video';
      frames = await videoFrames(video, 8, 900, 480, onProgress);
    } else {
      const imgs = list.filter(f => f.type.startsWith('image/')).slice(0, 6);
      if (!imgs.length) throw new Error('Sube una imagen (foto del dibujo) o un vídeo.');
      for (const f of imgs) frames.push(await imageFrame(f, 1100, 480));
    }
    const pick = frames.length <= 3 ? frames : [frames[1], frames[Math.floor(frames.length / 2)], frames[frames.length - 2]];
    return { tipo, big: frames.map(f => f.big), evidencia: pick.map(f => f.thumb) };
  }

  root.FutsalMedia = { prepare };
})(window);
