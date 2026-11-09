/* Girounivers · mapa de contaminación lumínica de Catalunya (imágenes nocturnas VIIRS de la NASA; necesita internet) */
window.G = window.G || {};
(function (G) {
  const h = G.h;
  // límites de Catalunya (el mapa no se puede mover fuera)
  const BBOX = { w: -0.1, e: 3.6, s: 40.35, n: 43.0 };
  const MINZ = 7, MAXZ = 10;
  // contorno aproximado de Catalunya [lon, lat]
  const OUTLINE = [[3.17, 42.43], [3.32, 42.32], [3.20, 42.20], [3.13, 42.12], [3.20, 41.95], [3.13, 41.85], [2.95, 41.72], [2.80, 41.67], [2.62, 41.60], [2.44, 41.54], [2.19, 41.38], [1.95, 41.27], [1.80, 41.22], [1.55, 41.17], [1.25, 41.10], [1.05, 41.06], [0.85, 40.95], [0.80, 40.88], [0.88, 40.78], [0.90, 40.72], [0.72, 40.65], [0.59, 40.62], [0.48, 40.54], [0.33, 40.52], [0.23, 40.60], [0.17, 40.72], [0.24, 40.88], [0.30, 41.00], [0.28, 41.15], [0.38, 41.30], [0.34, 41.42], [0.36, 41.60], [0.46, 41.72], [0.57, 41.83], [0.50, 41.95], [0.60, 42.05], [0.70, 42.10], [0.66, 42.25], [0.70, 42.40], [0.68, 42.60], [0.65, 42.70], [0.68, 42.84], [0.80, 42.88], [0.95, 42.80], [1.10, 42.78], [1.33, 42.72], [1.43, 42.62], [1.45, 42.43], [1.73, 42.48], [1.98, 42.43], [2.12, 42.38], [2.33, 42.40], [2.45, 42.35], [2.67, 42.35], [2.87, 42.45], [2.97, 42.46], [3.17, 42.43]];
  // [nombre, lon, lat, rango (1 = siempre visible)]
  const CITIES = [['Barcelona', 2.17, 41.39, 1], ['Girona', 2.82, 41.98, 1], ['Lleida', 0.62, 41.62, 1], ['Tarragona', 1.25, 41.12, 1], ['Tortosa', 0.52, 40.81, 2], ['Reus', 1.11, 41.15, 3], ['Manresa', 1.83, 41.73, 2], ['Vic', 2.25, 41.93, 3], ['Figueres', 2.94, 42.27, 2], ['Vielha', 0.80, 42.70, 2], ['La Seu d’Urgell', 1.46, 42.36, 2], ['Puigcerdà', 1.93, 42.43, 3], ['Tremp', 0.89, 42.17, 3], ['Balaguer', 0.81, 41.79, 3], ['Cervera', 1.27, 41.67, 3], ['Igualada', 1.62, 41.58, 3], ['Vilafranca', 1.70, 41.35, 3], ['Mataró', 2.44, 41.54, 3], ['Olot', 2.49, 42.18, 3], ['Ripoll', 2.19, 42.20, 3], ['Berga', 1.85, 42.10, 3], ['Solsona', 1.52, 41.99, 3], ['Amposta', 0.58, 40.71, 3], ['Falset', 0.82, 41.15, 3], ['Sabadell', 2.11, 41.55, 3], ['Blanes', 2.79, 41.68, 3]];
  const SPECIAL = { id: 'montsec', name: 'Parc Astronòmic del Montsec', lat: 42.0516, lon: 0.7290, note: 'Reserva Starlight' };
  // capas candidatas (se usa la primera que responda)
  const LAYERS = [
    z => `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/GoogleMapsCompatible_Level8/${z.z}/${z.y}/${z.x}.png`,
    z => `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/${z.z}/${z.y}/${z.x}.png`
  ];
  const S = { lng: 1.7, lat: 41.7, zoom: 7.1, layer: 0, dirty: true, sel: null, spots: [], tiles: new Map(), fails: 0, oks: 0 };
  let cv, ctx, W = 0, Hh = 0, sheet, root, active = false;

  const WORLD = z => 256 * Math.pow(2, z);
  const mx = (lng, z) => (lng + 180) / 360 * WORLD(z);
  const my = (lat, z) => { const s = Math.sin(lat * Math.PI / 180); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * WORLD(z); };
  const ilng = (x, z) => x / WORLD(z) * 360 - 180;
  const ilat = (y, z) => { const n = Math.PI - 2 * Math.PI * y / WORLD(z); return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))); };
  const toScr = (lng, lat) => ({ x: W / 2 + mx(lng, S.zoom) - mx(S.lng, S.zoom), y: Hh / 2 + my(lat, S.zoom) - my(S.lat, S.zoom) });
  const toGeo = (x, y) => ({ lng: ilng(mx(S.lng, S.zoom) + x - W / 2, S.zoom), lat: ilat(my(S.lat, S.zoom) + y - Hh / 2, S.zoom) });
  function clamp() {
    S.zoom = Math.max(MINZ, Math.min(MAXZ, S.zoom));
    S.lng = Math.max(BBOX.w, Math.min(BBOX.e, S.lng)); S.lat = Math.max(BBOX.s, Math.min(BBOX.n, S.lat));
  }
  const km = (a, b, c, d) => { const R = 6371, r = Math.PI / 180, dl = (c - a) * r, dp = (d - b) * r; const x = Math.sin(dp / 2) ** 2 + Math.cos(b * r) * Math.cos(d * r) * Math.sin(dl / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };

  function tile(z, x, y) {
    const k = z + '/' + x + '/' + y; let t = S.tiles.get(k); if (t) return t;
    t = { img: new Image(), ok: false, bad: false, layer: S.layer }; S.tiles.set(k, t);
    t.img.onload = () => { t.ok = true; S.oks++; S.dirty = true; };
    t.img.onerror = () => {
      t.bad = true; S.fails++;
      if (!S.oks && S.layer < LAYERS.length - 1 && S.fails >= 2) { S.layer++; S.fails = 0; S.tiles.clear(); }
      S.dirty = true;
    };
    t.img.src = LAYERS[S.layer]({ z, x, y });
    if (S.tiles.size > 300) { const first = S.tiles.keys().next().value; S.tiles.delete(first); }
    return t;
  }

  function draw() {
    S.dirty = false;
    ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, W, Hh);
    const tz = Math.min(8, Math.floor(S.zoom)), sc = Math.pow(2, S.zoom - tz), n = Math.pow(2, tz);
    const cx = mx(S.lng, tz), cy = my(S.lat, tz);
    const x0 = Math.floor(cx - W / 2 / sc) , x1 = Math.floor(cx + W / 2 / sc), y0 = Math.floor(cy - Hh / 2 / sc), y1 = Math.floor(cy + Hh / 2 / sc);
    const T0 = Math.floor(x0 / 256), T1 = Math.floor(x1 / 256), U0 = Math.floor(y0 / 256), U1 = Math.floor(y1 / 256);
    let pending = 0;
    for (let ty = U0; ty <= U1; ty++) for (let tx = T0; tx <= T1; tx++) {
      if (ty < 0 || ty >= n) continue; const txw = ((tx % n) + n) % n;
      const t = tile(tz, txw, ty);
      const dx = W / 2 + (tx * 256 - cx) * sc, dy = Hh / 2 + (ty * 256 - cy) * sc;
      if (t.ok) ctx.drawImage(t.img, dx, dy, 256 * sc + 0.5, 256 * sc + 0.5); else if (!t.bad) pending++;
    }
    // contorno de Catalunya
    ctx.save(); ctx.strokeStyle = 'rgba(134,201,255,.75)'; ctx.lineWidth = 1.4; ctx.setLineDash([6, 4]); ctx.beginPath();
    OUTLINE.forEach((p, i) => { const q = toScr(p[0], p[1]); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }); ctx.stroke(); ctx.restore();
    // ciudades
    ctx.font = '12px system-ui, sans-serif'; ctx.textBaseline = 'middle';
    const maxRank = S.zoom >= 9 ? 3 : S.zoom >= 8 ? 2 : 1;
    CITIES.forEach(c => {
      if (c[3] > maxRank) return; const p = toScr(c[1], c[2]); if (p.x < -40 || p.x > W + 40 || p.y < -10 || p.y > Hh + 10) return;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 6.3); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(2,3,10,.85)'; ctx.strokeText(c[0], p.x + 6, p.y); ctx.fillStyle = 'rgba(233,236,250,.95)'; ctx.fillText(c[0], p.x + 6, p.y);
    });
    // lugares guardados y Montsec
    const pins = [SPECIAL].concat(S.spots);
    pins.forEach(s => { const p = toScr(s.lon, s.lat); if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > Hh + 20) return;
      ctx.fillStyle = s.id === 'montsec' ? '#6be3a0' : '#ffd28a'; ctx.strokeStyle = '#02030a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y - 8); ctx.lineTo(p.x + 6, p.y); ctx.lineTo(p.x, p.y + 8); ctx.lineTo(p.x - 6, p.y); ctx.closePath(); ctx.stroke(); ctx.fill();
      if (S.zoom >= 8.5 || s.id === 'montsec' && S.zoom >= 8) { ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(2,3,10,.85)'; ctx.strokeText(s.name, p.x + 9, p.y - 8); ctx.fillStyle = ctx.fillStyle; ctx.fillText(s.name, p.x + 9, p.y - 8); } });
    // mi ubicación
    if (G.loc) { const p = toScr(G.loc.lon, G.loc.lat); if (p.x > -10 && p.x < W + 10 && p.y > -10 && p.y < Hh + 10) { ctx.strokeStyle = '#86c9ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 6.3); ctx.stroke(); ctx.fillStyle = '#86c9ff'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 6.3); ctx.fill(); } }
    if (S.sel) { const p = toScr(S.sel.lon, S.sel.lat); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, 6.3); ctx.moveTo(p.x - 14, p.y); ctx.lineTo(p.x - 5, p.y); ctx.moveTo(p.x + 5, p.y); ctx.lineTo(p.x + 14, p.y); ctx.moveTo(p.x, p.y - 14); ctx.lineTo(p.x, p.y - 5); ctx.moveTo(p.x, p.y + 5); ctx.lineTo(p.x, p.y + 14); ctx.stroke(); }
    // estado
    const lost = S.oks === 0 && S.layer === LAYERS.length - 1 && S.fails >= 2;
    if (lost) { ctx.fillStyle = 'rgba(2,3,10,.8)'; ctx.fillRect(20, Hh / 2 - 36, W - 40, 72); ctx.fillStyle = '#ffd28a'; ctx.textAlign = 'center'; ctx.fillText(G.x('Sin conexión: el mapa necesita internet.', 'Offline: the map needs internet.'), W / 2, Hh / 2 - 8); ctx.fillStyle = '#8d95bd'; ctx.fillText(G.x('Se verá cuando vuelvas a tener datos.', 'It will show when you are back online.'), W / 2, Hh / 2 + 14); ctx.textAlign = 'left'; }
    if (pending) S.dirty = false;
  }

  function resize() { if (!cv) return; const r = root.getBoundingClientRect(); const d = Math.min(2, window.devicePixelRatio || 1); W = Math.max(1, r.width); Hh = Math.max(1, r.height); cv.width = W * d; cv.height = Hh * d; cv.style.width = W + 'px'; cv.style.height = Hh + 'px'; ctx.setTransform(d, 0, 0, d, 0, 0); S.dirty = true; }

  function nearest(lat, lon) { let b = null; CITIES.forEach(c => { const d = km(lon, lat, c[1], c[2]); if (!b || d < b.d) b = { d, n: c[0] }; }); return b; }
  function pick(sx, sy) {
    const g = toGeo(sx, sy); const lat = g.lat, lon = g.lng;
    if (lat < BBOX.s || lat > BBOX.n || lon < BBOX.w || lon > BBOX.e) return;
    S.sel = { lat, lon }; S.dirty = true;
    // ¿toca un lugar guardado?
    const near = [SPECIAL].concat(S.spots).find(s => { const p = toScr(s.lon, s.lat); return Math.hypot(p.x - sx, p.y - sy) < 18; });
    const n = nearest(lat, lon);
    const title = near ? near.name : G.x('Punto del mapa', 'Map point');
    sheet.replaceChildren(...[
      h('div', { class: 'lz-row' }, h('b', null, title), h('button', { class: 'icon-btn', onclick: () => { S.sel = null; sheet.classList.remove('open'); S.dirty = true; } }, '✕')),
      near && near.note ? h('div', { class: 'small', style: 'color:#6be3a0' }, '★ ' + near.note) : null,
      h('div', { class: 'muted small' }, `${(near || { lat }).lat.toFixed(4)}°, ${(near || { lon }).lon.toFixed(4)}°`),
      h('div', { class: 'small' }, G.x(`Núcleo más cercano: ${n.n} (a ${G.fmtNum(n.d, 0)} km). Cuanto más lejos de las ciudades y más oscura se vea la zona en el mapa, mejor cielo.`, `Nearest main town: ${n.n} (${G.fmtNum(n.d, 0)} km away). The farther from towns and the darker the area looks on the map, the better the sky.`)),
      h('div', { class: 'row-btns' },
        (near && near.id !== 'montsec') ? h('button', { class: 'btn small', onclick: () => delSpot(near) }, G.x('Quitar lugar', 'Remove place')) : near ? '' : h('button', { class: 'btn small primary', onclick: () => saveSpot(lat, lon) }, '★ ' + G.x('Guardar lugar', 'Save place')),
        h('button', { class: 'btn small', onclick: () => { const a = (near || { lat }).lat, o = (near || { lon }).lon; location.href = `geo:${a},${o}?q=${a},${o}`; } }, G.x('Abrir en mapas', 'Open in maps')))].filter(Boolean));
    sheet.classList.add('open');
  }

  const saveSpots = () => G.kv.set('spots', S.spots);
  function saveSpot(lat, lon) {
    const name = h('input', { type: 'text', placeholder: G.x('Nombre del lugar', 'Place name') }), note = h('textarea', { rows: 3, placeholder: G.x('Notas (acceso, horizonte, cielo…)', 'Notes (access, horizon, sky…)') });
    const m = G.modal({ title: G.x('Guardar lugar', 'Save place'), body: h('div', { class: 'form' }, h('label', null, G.x('Nombre', 'Name'), name), h('label', null, G.x('Notas', 'Notes'), note)),
      actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, G.x('Cancelar', 'Cancel')), h('button', { class: 'btn primary', onclick: () => {
        const nm = name.value.trim() || G.x('Mi lugar', 'My place'); S.spots.push({ id: 's' + Date.now(), name: nm, lat, lon, note: note.value.trim() }); saveSpots(); S.sel = null; sheet.classList.remove('open'); S.dirty = true; m.close(); G.toast(G.x('Lugar guardado', 'Place saved')); } }, G.x('Guardar', 'Save'))] });
  }
  function delSpot(s) { S.spots = S.spots.filter(x => x.id !== s.id); saveSpots(); S.sel = null; sheet.classList.remove('open'); S.dirty = true; G.toast(G.x('Lugar eliminado', 'Place removed')); }
  function listSpots() {
    const all = [SPECIAL].concat(S.spots);
    const m = G.modal({ title: G.x('Lugares de observación', 'Observing places'), body: h('div', { class: 'form' }, all.map(s => h('button', { class: 'wx-night', onclick: () => { m.close(); S.lng = s.lon; S.lat = s.lat; S.zoom = Math.max(S.zoom, 9); clamp(); pick(W / 2, Hh / 2); } },
      h('span', { class: 'wx-day', style: 'text-transform:none' }, (s.id === 'montsec' ? '★ ' : '') + s.name, s.note ? h('div', { class: 'muted small' }, s.note) : null)))), actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, G.x('Cerrar', 'Close'))] });
  }

  function bind() {
    const ptr = new Map(); let moved = 0, startT = 0, pinch = 0;
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; startT = Date.now(); if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
    cv.addEventListener('pointermove', e => {
      const p = ptr.get(e.pointerId); if (!p) return;
      if (ptr.size === 2) { ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); const [a, b] = [...ptr.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) { S.zoom += Math.log2(d / pinch); clamp(); S.dirty = true; } pinch = d; moved = 99; return; }
      const dx = e.clientX - p.x, dy = e.clientY - p.y; moved += Math.abs(dx) + Math.abs(dy); p.x = e.clientX; p.y = e.clientY;
      S.lng = ilng(mx(S.lng, S.zoom) - dx, S.zoom); S.lat = ilat(my(S.lat, S.zoom) - dy, S.zoom); clamp(); S.dirty = true;
    });
    const up = e => { const had = ptr.delete(e.pointerId); pinch = 0; if (had && ptr.size === 0 && moved < 8 && Date.now() - startT < 500) { const r = cv.getBoundingClientRect(); pick(e.clientX - r.left, e.clientY - r.top); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { ptr.delete(e.pointerId); pinch = 0; });
    cv.addEventListener('wheel', e => { e.preventDefault(); S.zoom += e.deltaY < 0 ? 0.4 : -0.4; clamp(); S.dirty = true; }, { passive: false });
  }

  G.luz = {
    async init() {
      root = G.$('#view-luz');
      cv = h('canvas', { id: 'lz-canvas' }); ctx = cv.getContext('2d');
      sheet = h('div', { class: 'lz-sheet' });
      const zoom = d => () => { S.zoom += d; clamp(); S.dirty = true; };
      const legend = h('div', { class: 'lz-legend' }, h('span', null, G.x('Oscuro', 'Dark')), h('i'), h('span', null, G.x('Más luz', 'Brighter')));
      const tools = h('div', { class: 'lz-tools' },
        h('button', { class: 'chip-btn', onclick: zoom(0.7) }, '＋'), h('button', { class: 'chip-btn', onclick: zoom(-0.7) }, '－'),
        h('button', { class: 'chip-btn', onclick: () => { S.lng = G.loc.lon; S.lat = G.loc.lat; S.zoom = Math.max(S.zoom, 8.5); clamp(); S.dirty = true; } }, '⌖'),
        h('button', { class: 'chip-btn', onclick: listSpots }, '★'));
      const note = h('div', { class: 'lz-note' }, G.x('Catalunya · brillo nocturno (NASA VIIRS). Necesita internet.', 'Catalonia · night-time brightness (NASA VIIRS). Needs internet.'));
      root.append(cv, legend, tools, note, sheet);
      try { S.spots = (await G.kv.get('spots')) || []; } catch (e) { }
      bind(); addEventListener('resize', resize);
      (function frame() { requestAnimationFrame(frame); if (active && S.dirty && W) draw(); })();
    },
    show(on) { active = on; if (on) { if (!S.oks) { S.layer = 0; S.fails = 0; S.tiles.clear(); } setTimeout(() => { resize(); clamp(); S.dirty = true; }, 30); } },
    state: S
  };
})(window.G);
