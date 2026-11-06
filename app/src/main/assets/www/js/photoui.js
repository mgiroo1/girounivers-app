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

  // Formulario de datos de una foto (nueva o existente)
  function photoForm(rec, onSave, title) {
    const date = h('input', { type: 'datetime-local', value: G.toLocalInput(rec.date) });
    const lat = h('input', { type: 'number', step: 'any', placeholder: 'Latitud', value: rec.lat != null ? rec.lat.toFixed(5) : '' });
    const lon = h('input', { type: 'number', step: 'any', placeholder: 'Longitud', value: rec.lon != null ? rec.lon.toFixed(5) : '' });
    const place = h('input', { type: 'text', placeholder: 'Lugar (p. ej. Montseny, terraza de casa…)', value: rec.place || '' });
    const note = h('textarea', { rows: 3, placeholder: 'Notas: equipo, ajustes, condiciones del cielo…' }, rec.note || '');
    const gps = h('button', { class: 'btn small', type: 'button', onclick: async () => {
      gps.textContent = 'Buscando…';
      try { const p = await G.getPosition(); lat.value = p.lat.toFixed(5); lon.value = p.lon.toFixed(5); } catch (e) { G.toast('No se pudo obtener la ubicación'); }
      gps.textContent = 'Usar mi ubicación actual';
    } }, 'Usar mi ubicación actual');
    const img = h('img', { class: 'form-photo', src: URL.createObjectURL(rec.thumb || rec.blob) });
    const m = G.modal({
      title: title || 'Datos de la foto',
      body: h('div', { class: 'form' }, img,
        h('label', null, 'Fecha y hora de la foto', date),
        h('label', null, 'Ubicación', h('div', { class: 'row2' }, lat, lon), gps),
        h('label', null, 'Lugar', place),
        h('label', null, 'Notas', note)),
      actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancelar'),
        h('button', { class: 'btn primary', onclick: async () => {
          rec.date = date.value ? new Date(date.value) : new Date();
          rec.lat = lat.value !== '' ? parseFloat(lat.value) : null;
          rec.lon = lon.value !== '' ? parseFloat(lon.value) : null;
          rec.place = place.value.trim(); rec.note = note.value.trim();
          m.close(); await onSave(rec);
        } }, 'Guardar')]
    });
  }

  function viewer(rec, list, idx, refresh) {
    const url = URL.createObjectURL(rec.blob);
    const loc = rec.lat != null && rec.lon != null;
    const meta = h('div', { class: 'photo-meta' },
      h('div', null, '📅 ', G.fmtDate(rec.date, true)),
      loc ? h('div', null, '📍 ', rec.lat.toFixed(5) + ', ' + rec.lon.toFixed(5), ' ',
        h('a', { href: 'https://www.openstreetmap.org/?mlat=' + rec.lat + '&mlon=' + rec.lon + '#map=14/' + rec.lat + '/' + rec.lon, target: '_blank', rel: 'noopener' }, 'ver mapa')) : h('div', { class: 'muted' }, '📍 Sin ubicación'),
      rec.place ? h('div', null, '🏷 ', rec.place) : null,
      rec.note ? h('p', { class: 'note' }, rec.note) : null);
    const m = G.modal({
      title: 'Foto', full: true, onClose: () => URL.revokeObjectURL(url),
      body: h('div', null, h('img', { class: 'photo-big', src: url }), meta),
      actions: [
        h('button', { class: 'btn danger ghost', onclick: () => G.confirm('¿Eliminar esta foto?', 'Eliminar', async () => { m.close(); await G.photos.del(rec.id); refresh(); }) }, 'Eliminar'),
        h('button', { class: 'btn', onclick: () => { m.close(); photoForm(rec, async r => { await G.photos.put(r); refresh(); }, 'Editar datos'); } }, 'Editar datos')]
    });
  }

  // owner: 'c:<id>' (reto) | 'e:<id>' (ficha)
  G.gallery = function (owner, opts) {
    opts = opts || {};
    const wrap = h('div', { class: 'gallery' });
    const grid = h('div', { class: 'thumbs' });
    const input = h('input', { type: 'file', accept: 'image/*', multiple: true, style: 'display:none' });
    const add = h('button', { class: 'btn primary small', onclick: () => input.click() }, '＋ Subir foto');
    wrap.append(grid, h('div', { class: 'gallery-actions' }, add, input));
    let urls = [];
    async function refresh() {
      urls.forEach(u => URL.revokeObjectURL(u)); urls = [];
      const list = await G.photos.list(owner);
      grid.replaceChildren(...list.map((p, i) => {
        const u = URL.createObjectURL(p.thumb); urls.push(u);
        return h('button', { class: 'thumb', onclick: () => viewer(p, list, i, refresh), 'aria-label': 'Foto ' + (i + 1) },
          h('img', { src: u, alt: '' }), h('span', null, G.fmtDate(p.date)));
      }));
      if (!list.length) grid.append(h('div', { class: 'empty-thumbs' }, opts.emptyText || 'Aún no hay fotos'));
      if (opts.onChange) opts.onChange(list.length);
    }
    input.addEventListener('change', async () => {
      const files = [...input.files]; input.value = '';
      for (const f of files) {
        G.toast('Procesando foto…');
        const p = await G.photos.process(f);
        await new Promise(done => {
          photoForm({ owner, blob: p.blob, thumb: p.thumb, date: p.date, lat: p.lat, lon: p.lon, place: '', note: '', w: p.w, h: p.h }, async rec => { await G.photos.add(rec); done(); }, p.fromExif ? 'Foto añadida (datos leídos de la imagen)' : 'Datos de la foto');
          // si el usuario cancela, seguimos con la siguiente
          const mm = G.$$('.modal-back').pop();
          const obs = new MutationObserver(() => { if (!document.body.contains(mm)) { obs.disconnect(); done(); } });
          obs.observe(document.body, { childList: true });
        });
        await refresh();
      }
    });
    wrap.refresh = refresh;
    refresh();
    return wrap;
  };
})(window.G);
