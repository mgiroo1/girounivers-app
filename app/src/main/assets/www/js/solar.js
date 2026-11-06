/* Girounivers · sistema solar interactivo en tiempo real */
window.G = window.G || {};
(function (G) {
  const h = G.h, A = G.astro, RAD = A.RAD;
  const ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const NAME = { sun: 'Sol', mercury: 'Mercurio', venus: 'Venus', earth: 'Tierra', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Neptuno' };
  const ID = { sun: 'sol', mercury: 'mercurio', venus: 'venus', earth: 'tierra', mars: 'marte', jupiter: 'jupiter', saturn: 'saturno', uranus: 'urano', neptune: 'neptuno' };
  if (G.lang === 'en') Object.keys(NAME).forEach(k => { NAME[k] = G.t(NAME[k]); });
  const COL = { sun: '#ffd36b', mercury: '#b9b1a6', venus: '#f6dfa8', earth: '#5aa7ff', mars: '#ff7b52', jupiter: '#e8b98a', saturn: '#f1d79a', uranus: '#9fe3e8', neptune: '#6f93ff' };
  const RPX = { sun: 10, mercury: 3, venus: 4.6, earth: 4.8, mars: 3.6, jupiter: 8.5, saturn: 7.2, uranus: 5.6, neptune: 5.4 };
  const PERIOD = { mercury: '87,97 días', venus: '224,7 días', earth: '365,26 días', mars: '687 días', jupiter: '11,86 años', saturn: '29,45 años', uranus: '84 años', neptune: '164,8 años' };
  const SPEEDS = [['Tiempo real', 1], ['1 día/s', 86400], ['10 días/s', 864000], ['1 mes/s', 2629800], ['1 año/s', 31557600]];

  const S = { zoom: 1, px: 0, py: 0, mode: 'comprimida', simOffset: 0, speed: 1, tilt: 0.78, sel: null, active: false, dirty: true, trails: true };
  let cv, ctx, W = 0, Hh = 0, dpr = 1, info, belt = [], lastT = 0, speedIdx = 0, dateEl, spLabel;

  for (let i = 0; i < 520; i++) belt.push({ r: 2.15 + Math.random() * 1.1, a: Math.random() * 360, s: 0.9 + Math.random() * 0.2 });
  const simDate = () => new Date(Date.now() + S.simOffset);

  // distancia compresiva: de UA a unidades de pantalla
  function rad(r) {
    if (S.mode === 'lineal') return r * 22;
    return Math.pow(r, 0.55) * 36; // comprimida: Neptuno ≈ 232, Mercurio ≈ 21
  }
  function toScreen(x, y) {
    const r = Math.hypot(x, y); if (r < 1e-6) return { x: W / 2 + S.px, y: Hh / 2 + S.py };
    const k = rad(r) / r * S.zoom * baseScale();
    return { x: W / 2 + S.px + x * k, y: Hh / 2 + S.py + y * k * S.tilt };
  }
  function baseScale() {
    const maxR = S.mode === 'lineal' ? 22 * 30.5 : rad(31);
    return Math.min(W / 2, Hh / 2 / S.tilt) * 0.92 / maxR;
  }

  function render() {
    if (!cv || !S.active) return;
    S.dirty = false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, Hh);
    const d = A.d(simDate()), B = A.bodies(d);
    const pos = { sun: { x: 0, y: 0 } };
    ORDER.forEach(n => { pos[n] = n === 'earth' ? B.earth : B[n]; });

    // cinturón de asteroides (decorativo)
    ctx.fillStyle = 'rgba(170,175,200,0.45)';
    const tmin = d * 0.00018;
    belt.forEach(b => {
      const ang = (b.a + tmin * 360 / Math.pow(b.r, 1.5) * b.s * 20) * RAD;
      const p = toScreen(b.r * Math.cos(ang), b.r * Math.sin(ang));
      ctx.fillRect(p.x, p.y, 1.1, 1.1);
    });

    // órbitas
    ORDER.forEach(n => {
      const pts = A.orbit(n, d, 140).map(p => toScreen(p.x, p.y));
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.strokeStyle = S.sel === n ? 'rgba(255,210,138,0.75)' : 'rgba(150,170,230,0.22)'; ctx.lineWidth = S.sel === n ? 1.6 : 1; ctx.stroke();
    });

    // Sol
    const sp = toScreen(0, 0);
    let g = ctx.createRadialGradient(sp.x, sp.y, 2, sp.x, sp.y, 46);
    g.addColorStop(0, 'rgba(255,214,120,0.9)'); g.addColorStop(0.25, 'rgba(255,190,90,0.35)'); g.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sp.x, sp.y, 46, 0, 6.3); ctx.fill();
    ctx.fillStyle = COL.sun; ctx.beginPath(); ctx.arc(sp.x, sp.y, RPX.sun, 0, 6.3); ctx.fill();
    S.hits = [{ id: 'sun', x: sp.x, y: sp.y, r: 16 }];

    // planetas (los más lejanos primero → los cercanos dibujados encima)
    ORDER.forEach(n => {
      const p = toScreen(pos[n].x, pos[n].y), r = RPX[n];
      S.hits.push({ id: n, x: p.x, y: p.y, r: Math.max(16, r + 8) });
      g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      g.addColorStop(0, COL[n] + '55'); g.addColorStop(1, COL[n] + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3, 0, 6.3); ctx.fill();
      if (n === 'saturn') { ctx.strokeStyle = 'rgba(241,215,154,0.85)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 2.1, r * 0.75, -0.4, 0, 6.3); ctx.stroke(); }
      ctx.fillStyle = COL[n]; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.3); ctx.fill();
      if (n === 'earth') {
        // Luna con radio exagerado
        const mo = B.moon, ang = mo.lon * RAD;
        const mr = 12 + 0;
        const mx = p.x + Math.cos(ang) * mr, my = p.y + Math.sin(ang) * mr * S.tilt;
        ctx.strokeStyle = 'rgba(220,225,240,0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p.x, p.y, mr, mr * S.tilt, 0, 0, 6.3); ctx.stroke();
        ctx.fillStyle = '#e9ecf5'; ctx.beginPath(); ctx.arc(mx, my, 1.8, 0, 6.3); ctx.fill();
      }
      if (S.sel === n) { ctx.strokeStyle = '#86c9ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, r + 7, 0, 6.3); ctx.stroke(); }
      ctx.font = '600 11px system-ui, sans-serif'; ctx.fillStyle = '#dfe6ff'; ctx.textAlign = 'left';
      ctx.fillText(NAME[n], p.x + r + 7, p.y + 4);
    });
    ctx.fillStyle = '#ffe9b0'; ctx.font = '600 11px system-ui, sans-serif'; ctx.fillText(NAME.sun, sp.x + 14, sp.y + 4);
    if (S.sel === 'sun') { ctx.strokeStyle = '#86c9ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sp.x, sp.y, RPX.sun + 7, 0, 6.3); ctx.stroke(); }

    // escala/leyenda
    dateEl.textContent = simDate().toLocaleString(G.locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + (S.simOffset === 0 && S.speed === 1 ? G.x(' · en vivo', ' · live') : '');
    if (S.sel) refreshInfo(B);
  }

  function refreshInfo(B) {
    const n = S.sel;
    const p = n === 'sun' ? { x: 0, y: 0, r: 0 } : (n === 'earth' ? B.earth : B[n]);
    const rAU = n === 'sun' ? 0 : Math.hypot(p.x, p.y);
    const dEarth = n === 'sun' ? B.sun.dist : n === 'earth' ? 0 : B[n].dist;
    const rows = n === 'sun'
      ? [['Distancia a la Tierra', G.fmtNum(dEarth, 3) + G.x(' UA', ' AU')]]
      : [['Distancia al Sol', G.fmtNum(rAU, 3) + G.x(' UA · ', ' AU · ') + G.fmtNum(rAU * 149.5978707, 1) + ' M km'], n === 'earth' ? null : ['Distancia a la Tierra', G.fmtNum(dEarth, 3) + G.x(' UA', ' AU')], ['Periodo orbital', G.td(PERIOD[n])]];
    info._rows.replaceChildren(...rows.filter(Boolean).map(r => h('div', { class: 'kv' }, h('span', { class: 'muted' }, r[0]), h('b', null, r[1]))));
    info._title.textContent = NAME[n];
  }

  // interacción
  const ptrs = new Map(); let down = null, lastPinch = 0;
  function bind() {
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
      down = ptrs.size === 1 ? { x: e.offsetX, y: e.offsetY, t: Date.now(), m: 0 } : null;
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; lastPinch = Math.hypot(a.x - b.x, a.y - b.y); }
    });
    cv.addEventListener('pointermove', e => {
      const p = ptrs.get(e.pointerId); if (!p) return;
      const dx = e.offsetX - p.x, dy = e.offsetY - p.y; p.x = e.offsetX; p.y = e.offsetY;
      if (ptrs.size === 1) { S.px += dx; S.py += dy; if (down) down.m += Math.abs(dx) + Math.abs(dy); }
      else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const dd = Math.hypot(a.x - b.x, a.y - b.y); if (lastPinch) S.zoom = Math.max(0.4, Math.min(12, S.zoom * dd / lastPinch)); lastPinch = dd; }
      S.dirty = true;
    });
    const up = e => {
      const had = ptrs.delete(e.pointerId);
      if (down && had && ptrs.size === 0 && down.m < 8 && Date.now() - down.t < 500) tap(e.offsetX, e.offsetY);
      if (ptrs.size < 2) lastPinch = 0; down = null;
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); S.zoom = Math.max(0.4, Math.min(12, S.zoom * Math.exp(-e.deltaY * 0.0012))); S.dirty = true; }, { passive: false });
  }
  function tap(x, y) {
    let best = null, bd = 1e9;
    (S.hits || []).forEach(k => { const d = Math.hypot(k.x - x, k.y - y); if (d < k.r && d < bd) { bd = d; best = k; } });
    if (best) select(best.id); else { S.sel = null; info.classList.remove('open'); S.dirty = true; }
  }
  function select(id) { S.sel = id; info.classList.add('open'); info._btn.onclick = () => G.openEntry(ID[id]); S.dirty = true; }

  G.solar = {
    init() {
      const root = G.$('#view-sistema');
      cv = h('canvas', { id: 'solar-canvas' });
      dateEl = h('span', { id: 'solar-date' });
      const top = h('div', { class: 'sky-top' },
        h('button', { class: 'chip-btn', id: 'sc-mode', onclick: e => { S.mode = S.mode === 'comprimida' ? 'lineal' : 'comprimida'; e.currentTarget.textContent = G.t('Escala: ' + S.mode); S.dirty = true; } }, 'Escala: comprimida'),
        h('button', { class: 'chip-btn', onclick: () => { S.zoom = 1; S.px = 0; S.py = 0; S.dirty = true; } }, '⌖ Centrar'),
        h('button', { class: 'chip-btn', onclick: () => { S.tilt = S.tilt > 0.9 ? 0.5 : S.tilt + 0.17; S.dirty = true; } }, '⟲ Inclinar'));
      const bar = h('div', { class: 'sky-time' },
        h('button', { onclick: () => { speedIdx = Math.max(0, speedIdx - 1); S.speed = SPEEDS[speedIdx][1]; spLabel.textContent = G.t(SPEEDS[speedIdx][0]); } }, '−'),
        h('div', { class: 'tcenter', onclick: () => { S.simOffset = 0; speedIdx = 0; S.speed = 1; spLabel.textContent = G.t(SPEEDS[0][0]); S.dirty = true; } }, dateEl, h('small', null, 'velocidad: ', (spLabel = h('b', { id: 'sp-label' }, 'Tiempo real')), ' · toca para volver a ahora')),
        h('button', { onclick: () => { speedIdx = Math.min(SPEEDS.length - 1, speedIdx + 1); S.speed = SPEEDS[speedIdx][1]; spLabel.textContent = G.t(SPEEDS[speedIdx][0]); } }, '+'),
        h('button', { onclick: () => { S.simOffset -= 30 * 86400000; S.dirty = true; } }, '−1m'),
        h('button', { onclick: () => { S.simOffset += 30 * 86400000; S.dirty = true; } }, '+1m'));
      info = h('div', { id: 'solar-info', class: 'sheet' });
      info._title = h('div', { class: 'sky-info-title' });
      info._rows = h('div', { class: 'kvs' });
      info._btn = h('button', { class: 'btn primary small' }, 'Ver ficha');
      info.append(h('div', { class: 'sky-info-main' }, info._title, h('button', { class: 'icon-btn', onclick: () => { S.sel = null; info.classList.remove('open'); S.dirty = true; } }, '✕')), info._rows, h('div', { class: 'row-btns' }, info._btn));
      root.append(cv, top, bar, info, h('div', { class: 'solar-note' }, 'Tamaños y distancias no están a escala real'));
      ctx = cv.getContext('2d'); bind();
      new ResizeObserver(() => this.resize()).observe(root);
      const loop = t => {
        if (S.active) {
          const dt = Math.min(100, t - lastT);
          if (S.speed !== 1) { S.simOffset += dt * S.speed; S.dirty = true; }
          else if (!S.dirty && (t % 2000) < 20) S.dirty = true; // refresco suave en tiempo real
          if (S.dirty) render();
        }
        lastT = t; requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    },
    resize() { const r = G.$('#view-sistema').getBoundingClientRect(); if (!r.width) return; dpr = Math.min(2.5, window.devicePixelRatio || 1); W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr; cv.style.width = W + 'px'; cv.style.height = Hh + 'px'; S.dirty = true; },
    show(on) { S.active = on; if (on) { this.resize(); S.dirty = true; } },
    focusOn(id) { const n = Object.keys(ID).find(k => ID[k] === id); if (!n) return false; G.showTab('sistema'); setTimeout(() => select(n), 60); return true; },
    state: S
  };
})(window.G);
