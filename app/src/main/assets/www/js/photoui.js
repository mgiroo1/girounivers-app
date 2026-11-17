/* Girounivers · galería de fotos reutilizable (retos y fichas) */
window.G = window.G || {};
(function (G) {
  const h = G.h;

  G.getPosition = function () {
    return new Promise((res, rej) => {
      if (!navigator.geolocation) return rej(new Error('Sin geolocalización'));
      navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lon: p.coords.longitude }), rej, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    });
  };

  // pone la imagen (como data: URL) sin que un fallo rompa nada
  function setImg(img, rec, which) {
    G.photos.dataURL(rec, which).then(u => { if (u) img.src = u; else img.classList.add('broken'); }).catch(() => img.classList.add('broken'));
  }
  G.setPhotoImg = setImg;
  G.photoViewer = (rec, opts, refresh) => viewer(rec, opts || {}, refresh || (() => { }));


  // ---------- Recortar / mover / girar una foto dentro de la app ----------
  const fileToURL = b => new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(f.result); f.onerror = () => rej(f.error); f.readAsDataURL(b); });
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('imagen')); i.src = src; });
  const canvasBlob = (cv, q) => new Promise(res => cv.toBlob(b => res(b), 'image/jpeg', q));
  // Devuelve { blob, thumb, w, h } o null si se cancela
  function cropper(srcBlob) {
    return new Promise(async resolve => {
      let img;
      try { img = await loadImg(await fileToURL(srcBlob)); } catch (e) { G.toast(G.x('No se pudo abrir la foto para recortar', 'Could not open the photo to crop'), 4000); return resolve(null); }
      const S = { rot: 0, asp: 0, z: 1, ox: 0, oy: 0 };           // asp: 0 = original, si no ancho/alto
      let fw = 300, fh = 300, applied = false, m;
      const cv = h('canvas', { class: 'crop-cv' }), ctx = cv.getContext('2d');
      const dims = () => (S.rot % 2 ? { w: img.naturalHeight, h: img.naturalWidth } : { w: img.naturalWidth, h: img.naturalHeight });
      function frame() {
        const d = dims(), asp = S.asp || d.w / d.h, maxW = Math.min(360, innerWidth - 56), maxH = Math.round(innerHeight * 0.46);
        fw = maxW; fh = fw / asp; if (fh > maxH) { fh = maxH; fw = fh * asp; }
        fw = Math.round(fw); fh = Math.round(fh);
        const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = fw * dpr; cv.height = fh * dpr; cv.style.width = fw + 'px'; cv.style.height = fh + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const scale = () => { const d = dims(); return Math.max(fw / d.w, fh / d.h) * S.z; };
      function clamp() { const d = dims(), s = scale(); const mx = Math.max(0, (d.w * s - fw) / 2), my = Math.max(0, (d.h * s - fh) / 2); S.ox = Math.max(-mx, Math.min(mx, S.ox)); S.oy = Math.max(-my, Math.min(my, S.oy)); }
      function paint() {
        clamp(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, fw, fh);
        ctx.save(); ctx.translate(fw / 2 + S.ox, fh / 2 + S.oy); ctx.rotate(S.rot * Math.PI / 2); const s = scale(); ctx.scale(s, s); ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2); ctx.restore();
        // rejilla de tercios
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 1; i < 3; i++) { ctx.moveTo(fw * i / 3, 0); ctx.lineTo(fw * i / 3, fh); ctx.moveTo(0, fh * i / 3); ctx.lineTo(fw, fh * i / 3); } ctx.stroke();
      }
      function relayout(keepZoom) { frame(); if (!keepZoom) { S.z = 1; S.ox = 0; S.oy = 0; zoom.value = 1; } paint(); }
      const zoom = h('input', { type: 'range', min: 1, max: 5, step: 0.01, value: 1, 'aria-label': 'Zoom', oninput: e => { S.z = +e.target.value; paint(); } });
      const asps = [[0, G.x('Original', 'Original')], [1, '1:1'], [4 / 3, '4:3'], [3 / 4, '3:4'], [16 / 9, '16:9']];
      const chips = h('div', { class: 'crop-chips' }, asps.map(([a, n]) => h('button', { type: 'button', class: 'seg' + (a === S.asp ? ' on' : ''), 'data-a': a, onclick: e => { S.asp = a; G.$$('.seg', chips).forEach(x => x.classList.toggle('on', +x.dataset.a === a)); relayout(false); } }, n)));
      const rot = h('button', { type: 'button', class: 'btn small', onclick: () => { S.rot = (S.rot + 1) % 4; relayout(false); } }, '⟳ ' + G.x('Girar', 'Rotate'));
      const reset = h('button', { type: 'button', class: 'btn small', onclick: () => { S.asp = 0; G.$$('.seg', chips).forEach(x => x.classList.toggle('on', +x.dataset.a === 0)); S.rot = 0; relayout(false); } }, G.x('Restablecer', 'Reset'));
      // gestos: arrastrar para mover, pellizcar o rueda para ampliar
      const ptr = new Map(); let pinch = 0;
      cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
      cv.addEventListener('pointermove', e => {
        const p = ptr.get(e.pointerId); if (!p) return;
        if (ptr.size === 2) { ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); const [a, b] = [...ptr.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) { S.z = Math.max(1, Math.min(5, S.z * d / pinch)); zoom.value = S.z; paint(); } pinch = d; return; }
        S.ox += e.clientX - p.x; S.oy += e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; paint();
      });
      const end = e => { ptr.delete(e.pointerId); pinch = 0; };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      cv.addEventListener('wheel', e => { e.preventDefault(); S.z = Math.max(1, Math.min(5, S.z * (e.deltaY < 0 ? 1.1 : 0.9))); zoom.value = S.z; paint(); }, { passive: false });

      async function apply() {
        applied = true;
        try {
          const d = dims(), s = scale(), outW = Math.max(16, Math.min(2200, Math.round(fw / s))), k = outW / fw, outH = Math.max(16, Math.round(fh * k));
          const oc = document.createElement('canvas'); oc.width = outW; oc.height = outH; const c2 = oc.getContext('2d');
          c2.fillStyle = '#000'; c2.fillRect(0, 0, outW, outH); c2.translate(outW / 2 + S.ox * k, outH / 2 + S.oy * k); c2.rotate(S.rot * Math.PI / 2); c2.scale(s * k, s * k); c2.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
          const blob = await canvasBlob(oc, 0.9); if (!blob) throw new Error('canvas');
          const tw = Math.min(360, outW), tk = tw / outW, tc = document.createElement('canvas'); tc.width = tw; tc.height = Math.max(1, Math.round(outH * tk)); tc.getContext('2d').drawImage(oc, 0, 0, tc.width, tc.height);
          const thumb = await canvasBlob(tc, 0.8) || blob;
          m.close(); resolve({ blob, thumb, w: outW, h: outH });
        } catch (err) { console.error(err); applied = false; G.toast(G.x('No se pudo recortar: ', 'Could not crop: ') + (err && err.message || err), 5000); }
      }
      m = G.modal({ title: G.x('Recortar y mover', 'Crop and move'), full: true, onClose: () => { if (!applied) resolve(null); },
        body: h('div', { class: 'crop-wrap' }, h('p', { class: 'muted small' }, G.x('Arrastra la foto para moverla, pellizca o usa el control para ampliar.', 'Drag the photo to move it; pinch or use the slider to zoom.')), cv, h('label', { class: 'crop-zoom' }, '🔍', zoom), chips, h('div', { class: 'row-btns' }, rot, reset)),
        actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, G.x('Cancelar', 'Cancel')), h('button', { class: 'btn primary', onclick: apply }, G.x('Aplicar', 'Apply'))] });
      relayout(false);
    });
  }

  // Formulario de datos de una foto (nueva o existente). Devuelve una promesa: true si se guardó.
  function photoForm(rec, onSave, title) {
    return new Promise(resolve => {
      let saving = false, m;
      const date = h('input', { type: 'datetime-local', value: G.toLocalInput(rec.date) });
      const lat = h('input', { type: 'number', step: 'any', placeholder: 'Latitud', value: rec.lat != null ? rec.lat.toFixed(5) : '' });
      const lon = h('input', { type: 'number', step: 'any', placeholder: 'Longitud', value: rec.lon != null ? rec.lon.toFixed(5) : '' });
      const place = h('input', { type: 'text', placeholder: 'Lugar (p. ej. Montseny, terraza de casa…)', value: rec.place || '' });
      const note = h('textarea', { rows: 3, placeholder: 'Notas: equipo, ajustes, condiciones del cielo…' }, rec.note || '');
      const gps = h('button', { class: 'btn small', type: 'button', onclick: async () => {
        gps.textContent = G.t('Buscando…');
        try { const p = await G.getPosition(); lat.value = p.lat.toFixed(5); lon.value = p.lon.toFixed(5); } catch (e) { G.toast('No se pudo obtener la ubicación'); }
        gps.textContent = G.t('Usar mi ubicación actual');
      } }, 'Usar mi ubicación actual');
      const pickMap = h('button', { class: 'btn small', type: 'button', onclick: async () => {
        const r = await G.luzPick({ lat: parseFloat(lat.value), lon: parseFloat(lon.value) });
        if (r) { lat.value = r.lat.toFixed(5); lon.value = r.lon.toFixed(5); if (r.name && !place.value.trim()) place.value = r.name; }
      } }, '📍 ' + G.x('Elegir en el mapa', 'Choose on the map'));
      const img = h('img', { class: 'form-photo' }); setImg(img, rec, 'thumb');
      const cropBtn = h('button', { class: 'btn small', type: 'button', onclick: async () => {
        const src = G.photos.blobOf(rec, 'full'); if (!src) { G.toast(G.x('Esta foto no se puede recortar', 'This photo cannot be cropped')); return; }
        const r = await cropper(src); if (!r) return;
        rec.blob = r.blob; rec.thumb = r.thumb; rec.img = null; rec.th = null; rec.w = r.w; rec.h = r.h;
        img.classList.remove('broken'); try { img.src = await fileToURL(r.thumb); } catch (e) { }
        G.toast(G.x('Recorte aplicado. Pulsa Guardar para conservarlo.', 'Crop applied. Tap Save to keep it.'), 3500);
      } }, '✂ ' + G.x('Recortar / mover', 'Crop / move'));
      m = G.modal({
        title: title || 'Datos de la foto',
        onClose: () => { if (!saving) resolve(false); },
        body: h('div', { class: 'form' }, img, h('div', { class: 'row-btns' }, cropBtn),
          h('label', null, 'Fecha y hora de la foto', date),
          h('label', null, 'Ubicación', h('div', { class: 'row2' }, lat, lon), h('div', { class: 'row-btns' }, gps, pickMap)),
          h('label', null, 'Lugar', place),
          h('label', null, 'Notas', note)),
        actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancelar'),
          h('button', { class: 'btn primary', onclick: async () => {
            saving = true;
            rec.date = date.value ? new Date(date.value) : new Date();
            rec.lat = lat.value !== '' ? parseFloat(lat.value) : null;
            rec.lon = lon.value !== '' ? parseFloat(lon.value) : null;
            rec.place = place.value.trim(); rec.note = note.value.trim();
            m.close();
            try { await onSave(rec); resolve(true); }
            catch (err) { console.error(err); G.toast(G.x('No se pudo guardar la foto: ', 'Could not save the photo: ') + (err && err.message || err), 6000); resolve(false); }
          } }, 'Guardar')]
      });
    });
  }

  function viewer(rec, opts, refresh) {
    const loc = rec.lat != null && rec.lon != null;
    const big = h('img', { class: 'photo-big' }); setImg(big, rec, 'full');
    const meta = h('div', { class: 'photo-meta' },
      h('div', null, '📅 ', G.fmtDate(rec.date, true)),
      loc ? h('div', null, '📍 ', rec.lat.toFixed(5) + ', ' + rec.lon.toFixed(5), ' ',
        h('a', { href: 'https://www.openstreetmap.org/?mlat=' + rec.lat + '&mlon=' + rec.lon + '#map=14/' + rec.lat + '/' + rec.lon, target: '_blank', rel: 'noopener' }, 'ver mapa')) : h('div', { class: 'muted' }, '📍 Sin ubicación'),
      rec.place ? h('div', null, '🏷 ', rec.place) : null,
      rec.note ? h('p', { class: 'note' }, rec.note) : null);
    const isCover = opts.coverId && opts.coverId() === rec.id;
    const actions = [
      h('button', { class: 'btn danger ghost', onclick: () => G.confirm('¿Eliminar esta foto?', 'Eliminar', async () => { m.close(); try { await G.photos.del(rec.id); } catch (e) { G.toast('Error: ' + e.message); } if (opts.coverId && opts.coverId() === rec.id) opts.onCover(null); refresh(); }) }, 'Eliminar'),
      h('button', { class: 'btn', onclick: () => { m.close(); photoForm(rec, async r => { await G.photos.put(r); }, 'Editar datos').then(refresh); } }, 'Editar datos')];
    if (opts.onCover) actions.unshift(h('button', { class: 'btn' + (isCover ? ' primary' : ''), onclick: () => { opts.onCover(isCover ? null : rec.id); m.close(); G.toast(isCover ? 'Portada quitada' : 'Foto de portada guardada'); refresh(); } }, isCover ? '★ Portada actual' : '☆ Usar como portada'));
    const m = G.modal({ title: 'Foto', full: true, body: h('div', null, big, meta), actions });
  }

  // owner: 'c:<id>' (reto) | 'e:<id>' (ficha). opts: emptyText, onChange, coverId(), onCover(id)
  // Recepción de fotos desde el selector nativo de Android (llega en trozos base64)
  const parts = {};
  window.GUpick = {
    owner: null,
    chunk(name, mime, mod, total, idx, b64) {
      const k = name + '|' + total; const a = parts[k] || (parts[k] = []);
      try {
        const bin = atob(b64), u = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        a[idx] = u;
      } catch (e) { G.toast(G.x('Error al recibir la foto', 'Error receiving the photo')); delete parts[k]; return; }
      if (a.filter(Boolean).length === total) {
        delete parts[k];
        const file = new File(a, name, { type: mime || 'image/jpeg', lastModified: mod || Date.now() });
        const g = window.GUpick.owner; if (g && g.take) g.take([file]);
      }
    },
    error(msg) { if (msg) G.toast(G.x('No se pudo leer la foto: ', 'Could not read the photo: ') + msg, 5000); }
  };

  G.gallery = function (owner, opts) {
    opts = opts || {};
    const wrap = h('div', { class: 'gallery' });
    const grid = h('div', { class: 'thumbs' });
    const input = h('input', { type: 'file', accept: 'image/*', multiple: true, style: 'display:none' });
    const native = !!(window.GuFile && window.GuFile.pickImages);
    const add = h('button', { class: 'btn primary small', onclick: () => {
      if (native) { try { window.GUpick.owner = handle; window.GuFile.pickImages(); return; } catch (e) { console.error(e); } }
      input.click();
    } }, '＋ Subir foto');
    wrap.append(grid, h('div', { class: 'gallery-actions' }, add, input));
    async function refresh() {
      let list = [];
      try { list = await G.photos.list(owner); } catch (e) { console.error(e); G.toast(G.x('No se pudieron leer las fotos: ', 'Could not read the photos: ') + e.message, 5000); }
      const cover = opts.coverId ? opts.coverId() : null;
      grid.replaceChildren(...list.map((p, i) => {
        const img = h('img', { alt: '' }); setImg(img, p, 'thumb');
        return h('button', { class: 'thumb', onclick: () => viewer(p, opts, refresh), 'aria-label': G.t('Foto') + ' ' + (i + 1) },
          img, cover === p.id ? h('i', { class: 'cover-star' }, '★') : null, h('span', null, G.fmtDate(p.date)));
      }));
      if (!list.length) grid.append(h('div', { class: 'empty-thumbs' }, opts.emptyText || 'Aún no hay fotos'));
      if (opts.onChange) opts.onChange(list.length);
    }
    let queue = Promise.resolve();
    async function handle(files) {
      for (const f of files) {
        try {
          G.toast(G.x('Procesando foto…', 'Processing photo…'));
          const p = await G.photos.process(f);
          await photoForm({ owner, blob: p.blob, thumb: p.thumb, date: p.date, lat: p.lat, lon: p.lon, place: '', note: '', w: p.w, h: p.h },
            async rec => { await G.photos.add(rec); }, p.fromExif ? 'Foto añadida (datos leídos de la imagen)' : 'Datos de la foto');
        } catch (err) { console.error(err); G.toast(G.x('No se pudo añadir la foto: ', 'Could not add the photo: ') + (err && err.message || err), 6000); }
        await refresh();
      }
    }
    const take = files => { queue = queue.then(() => handle(files)); };
    take.owner = handle; handle.take = take;
    input.addEventListener('change', () => { const files = [...input.files]; if (!files.length) return; take(files); setTimeout(() => { try { input.value = ''; } catch (e) {} }, 1500); });
    wrap.refresh = refresh;
    refresh();
    return wrap;
  };
})(window.G);
