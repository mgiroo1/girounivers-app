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
      const img = h('img', { class: 'form-photo' }); setImg(img, rec, 'thumb');
      m = G.modal({
        title: title || 'Datos de la foto',
        onClose: () => { if (!saving) resolve(false); },
        body: h('div', { class: 'form' }, img,
          h('label', null, 'Fecha y hora de la foto', date),
          h('label', null, 'Ubicación', h('div', { class: 'row2' }, lat, lon), gps),
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
  G.gallery = function (owner, opts) {
    opts = opts || {};
    const wrap = h('div', { class: 'gallery' });
    const grid = h('div', { class: 'thumbs' });
    const input = h('input', { type: 'file', accept: 'image/*', multiple: true, style: 'display:none' });
    const add = h('button', { class: 'btn primary small', onclick: () => input.click() }, '＋ Subir foto');
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
    input.addEventListener('change', async () => {
      const files = [...input.files]; input.value = '';
      for (const f of files) {
        try {
          G.toast('Procesando foto…');
          const p = await G.photos.process(f);
          await photoForm({ owner, blob: p.blob, thumb: p.thumb, date: p.date, lat: p.lat, lon: p.lon, place: '', note: '', w: p.w, h: p.h },
            async rec => { await G.photos.add(rec); }, p.fromExif ? 'Foto añadida (datos leídos de la imagen)' : 'Datos de la foto');
        } catch (err) { console.error(err); G.toast(G.x('No se pudo añadir la foto: ', 'Could not add the photo: ') + (err && err.message || err), 6000); }
        await refresh();
      }
    });
    wrap.refresh = refresh;
    refresh();
    return wrap;
  };
})(window.G);
