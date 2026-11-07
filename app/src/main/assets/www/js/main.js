/* Girounivers · arranque, navegación y ajustes */
window.G = window.G || {};
(function (G) {
  const h = G.h;
  const TABS = {
    cielo: { title: 'Cielo', mod: () => G.sky },
    sistema: { title: 'Sistema solar', mod: () => G.solar },
    catalogo: { title: 'Catálogo', mod: () => G.catalog },
    retos: { title: 'Retos', mod: () => G.challengesUI },
    agenda: { title: 'Agenda', mod: () => G.agenda }
  };
  let current = null;

  G.showTab = function (id) {
    if (current === id) return;
    if (current && TABS[current].mod().show) TABS[current].mod().show(false);
    current = id;
    G.$$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + id));
    G.$$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    G.$('#page-title').textContent = G.t(TABS[id].title);
    const m = TABS[id].mod(); if (m.show) m.show(true);
    G.kv.set('tab', id);
  };

  function starfield() {
    const c = G.$('#bg'), x = c.getContext('2d'); let W, H, stars = [];
    function size() {
      const d = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0);
      stars = Array.from({ length: Math.round(W * H / 5200) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + 0.2, p: Math.random() * 6.3, s: 0.4 + Math.random() * 1.4 }));
    }
    size(); addEventListener('resize', size);
    let last = 0;
    (function frame(t) {
      requestAnimationFrame(frame);
      if (document.hidden || t - last < 60) return; last = t;
      x.clearRect(0, 0, W, H);
      for (const s of stars) { const a = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t / 1000 * s.s + s.p)); x.fillStyle = `rgba(225,232,255,${a})`; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.3); x.fill(); }
    })(0);
  }

  function settings() {
    const lat = h('input', { type: 'number', step: 'any', value: G.loc.lat.toFixed(4) });
    const lon = h('input', { type: 'number', step: 'any', value: G.loc.lon.toFixed(4) });
    const gps = h('button', { class: 'btn small', onclick: async () => {
      gps.textContent = 'Buscando…';
      try { const p = await G.getPosition(); lat.value = p.lat.toFixed(4); lon.value = p.lon.toFixed(4); } catch (e) { G.toast('No se pudo obtener la ubicación'); }
      gps.textContent = 'Usar GPS';
    } }, 'Usar GPS');
    const file = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none', onchange: async e => {
      const f = e.target.files[0]; if (!f) return;
      try { await G.backup.import(f); G.toast('Copia restaurada. Reiniciando…'); setTimeout(() => location.reload(), 900); } catch (err) { G.toast('Archivo no válido'); }
    } });
    const langSel = h('select', { onchange: e => G.setLang(e.target.value) }, h('option', { value: 'es' }, 'Español'), h('option', { value: 'en' }, 'English'));
    langSel.value = G.lang;
    const m = G.modal({
      title: 'Ajustes',
      body: h('div', { class: 'form' },
        h('h4', null, 'Idioma'), langSel,
        h('h4', null, 'Mi ubicación de observación'), h('div', { class: 'row2' }, h('label', null, 'Latitud', lat), h('label', null, 'Longitud', lon)), gps,
        h('p', { class: 'muted small' }, 'Se usa para calcular altura y azimut, salidas y puestas. Por defecto se intenta usar el GPS.'),
        h('h4', null, 'Copia de seguridad'),
        h('p', { class: 'muted small' }, 'Fichas, retos, eventos y todas tus fotos se guardan solo en este móvil. Exporta una copia de vez en cuando.'),
        h('div', { class: 'row-btns' }, h('button', { class: 'btn small', onclick: () => { G.toast('Preparando copia…'); G.backup.export(); } }, '⬇ Exportar copia'), h('button', { class: 'btn small', onclick: () => file.click() }, '⬆ Importar copia'), file),
        h('h4', null, 'Acerca de'),
        h('p', { class: 'muted small' }, 'Girounivers · app personal de astronomía. Efemérides calculadas en el dispositivo (precisión de unos minutos de arco), sin conexión a internet. Catálogo estelar: ~220 estrellas brillantes y 21 objetos de cielo profundo.')),
      actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cerrar'),
        h('button', { class: 'btn primary', onclick: () => {
          const la = parseFloat(lat.value), lo = parseFloat(lon.value);
          if (isNaN(la) || isNaN(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) { G.toast('Coordenadas no válidas'); return; }
          G.loc = { lat: la, lon: lo, auto: false }; G.kv.set('loc', G.loc); G.sky.state.dirty = true; m.close(); G.toast('Ubicación guardada');
        } }, 'Guardar ubicación')]
    });
  }

  async function boot() {
    starfield();
    G.loc = (await G.kv.get('loc')) || { lat: 41.39, lon: 2.17, auto: true };
    let ent = (await G.kv.get('entries')) || [];
    const have = new Set(ent.map(e => e.id));
    G.catalogSeeds.forEach(s => { if (!have.has(s.id)) ent.push(JSON.parse(JSON.stringify(s))); });
    ent.forEach(e => { if (e.messier == null) { const s = G.catalogSeeds.find(x => x.id === e.id && x.messier != null); if (s) e.messier = s.messier; } if (e.seed && e.messier != null && G.messierSub[e.messier]) e.sub = G.messierSub[e.messier]; });
    if (!(await G.kv.get('catmig2'))) { G.migrateCats(ent); G.kv.set('catmig2', 1); }
    G.entries = ent; G.kv.set('entries', ent);
    let ch = (await G.kv.get('challenges')) || [];
    const hc = new Set(ch.map(c => c.id));
    G.challengeSeeds.forEach(s => { if (!hc.has(s.id)) ch.push(Object.assign({}, s)); });
    G.challenges = ch; G.kv.set('challenges', ch);
    G.customEvents = (await G.kv.get('events')) || [];

    await G.sky.init(); G.solar.init(); G.catalog.init(); G.challengesUI.init(); G.agenda.init();
    G.$$('#nav button').forEach(b => { b.addEventListener('click', () => G.showTab(b.dataset.tab)); const lab = G.t(TABS[b.dataset.tab].title); b.setAttribute('aria-label', lab); b.setAttribute('title', lab); });
    G.$('#btn-settings').addEventListener('click', settings);
    const first = (await G.kv.get('tab')) || 'cielo';
    G.showTab(TABS[first] ? first : 'cielo');
    G.$('#splash').classList.add('hide'); setTimeout(() => G.$('#splash').remove(), 700);

    // ubicación automática (silenciosa)
    if (G.loc.auto && navigator.geolocation) {
      G.getPosition().then(p => { G.loc = { lat: p.lat, lon: p.lon, auto: true }; G.kv.set('loc', G.loc); G.sky.state.dirty = true; }).catch(() => {});
    }
    if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !/GirouniversApp/.test(navigator.userAgent)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  // botón atrás de Android: devuelve true si la web lo ha gestionado
  window.GU = { back: () => { if (G.back()) return true; if (current !== 'cielo') { G.showTab('cielo'); return true; } return false; } };
  window.addEventListener('DOMContentLoaded', () => boot().catch(e => { console.error(e); document.body.append(h('pre', { style: 'color:#f88;padding:20px;position:fixed;z-index:99;background:#000;inset:0;overflow:auto' }, String(e && e.stack || e))); }));
})(window.G);
