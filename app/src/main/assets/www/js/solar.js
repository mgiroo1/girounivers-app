/* Girounivers · sistema solar interactivo en tiempo real */
window.G = window.G || {};
(function (G) {
  const h = G.h, A = G.astro, RAD = A.RAD;
  const ORDER = ['mercury', 'venus', 'earth', 'mars', 'ceres', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const DWARF = { ceres: 1, pluto: 1 };
  const NAME = { sun: 'Sol', mercury: 'Mercurio', venus: 'Venus', earth: 'Tierra', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Neptuno', ceres: 'Ceres', pluto: 'Plutón', voyager1: 'Voyager 1', voyager2: 'Voyager 2', belt1: 'Cinturón de asteroides', belt2: 'Cinturón de Kuiper' };
  const ID = { sun: 'sol', mercury: 'mercurio', venus: 'venus', earth: 'tierra', mars: 'marte', jupiter: 'jupiter', saturn: 'saturno', uranus: 'urano', neptune: 'neptuno', ceres: 'ceres', pluto: 'pluto', voyager1: 'voyager-1', voyager2: 'voyager-2', belt1: 'cinturon-asteroides', belt2: 'cinturon-kuiper' };
  // satélites principales: radio de órbita en píxeles (ilustrativo), periodo en días (negativo = retrógrado), distancia media real en km
  const MOONS = [
    { id: 'luna', parent: 'earth', es: 'Luna', per: 27.32, km: 384400, r: 13, col: '#e9ecf5' },
    { id: 'fobos', parent: 'mars', es: 'Fobos', per: 0.319, km: 9376, r: 10, col: '#c9b8a8' },
    { id: 'deimos', parent: 'mars', es: 'Deimos', per: 1.263, km: 23463, r: 16, col: '#d8c9b8' },
    { id: 'io', parent: 'jupiter', es: 'Ío', per: 1.769, km: 421700, r: 15, col: '#ffe08a' },
    { id: 'europa', parent: 'jupiter', es: 'Europa', per: 3.551, km: 671000, r: 21, col: '#e8dccb' },
    { id: 'ganimedes', parent: 'jupiter', es: 'Ganímedes', per: 7.155, km: 1070400, r: 27, col: '#cbbfae' },
    { id: 'calisto', parent: 'jupiter', es: 'Calisto', per: 16.689, km: 1882700, r: 34, col: '#9c9288' },
    { id: 'encelado', parent: 'saturn', es: 'Encélado', per: 1.370, km: 238000, r: 21, col: '#f4fbff' },
    { id: 'titan', parent: 'saturn', es: 'Titán', per: 15.945, km: 1221900, r: 29, col: '#f0b968' },
    { id: 'triton', parent: 'neptune', es: 'Tritón', per: -5.877, km: 354800, r: 14, col: '#d9c7d6' }
  ];
  const MOON_BY = {};
  MOONS.forEach((m, i) => { m.ph = i * 61; MOON_BY[m.id] = m; NAME[m.id] = m.es; ID[m.id] = m.id; });
  if (G.lang === 'en') Object.keys(NAME).forEach(k => { NAME[k] = G.t(NAME[k]); });
  const COL = { sun: '#ffd36b', mercury: '#b9b1a6', venus: '#f6dfa8', earth: '#5aa7ff', mars: '#ff7b52', jupiter: '#e8b98a', saturn: '#f1d79a', uranus: '#9fe3e8', neptune: '#6f93ff', ceres: '#c4b6a8', pluto: '#e0c9a8' };
  const RPX = { sun: 10, mercury: 3, venus: 4.6, earth: 4.8, mars: 3.6, jupiter: 8.5, saturn: 7.2, uranus: 5.6, neptune: 5.4, ceres: 2.6, pluto: 3 };
  const PERIOD = { mercury: '87,97 días', venus: '224,7 días', earth: '365,26 días', mars: '687 días', jupiter: '11,86 años', saturn: '29,45 años', uranus: '84 años', neptune: '164,8 años', ceres: '4,60 años', pluto: '247,9 años' };
  // Voyager: distancia aproximada al Sol y dirección (longitud eclíptica); referencia: 18-nov-2026
  const T0 = Date.UTC(2026, 10, 18, 10, 16);
  const VOY = { voyager1: { d0: 173.1, v: 3.57, lon: 255.8, col: '#ff9f6b', yr: '1977', exit: '2012' }, voyager2: { d0: 144, v: 3.25, lon: 288.9, col: '#7ee0c3', yr: '1977', exit: '2018' } };
  const voyDist = (k, t) => VOY[k].d0 + VOY[k].v * (t - T0) / (365.25 * 86400000);
  const SPEEDS = [['Tiempo real', 1], ['1 día/s', 86400], ['10 días/s', 864000], ['1 mes/s', 2629800], ['1 año/s', 31557600]];

  // cinturones: nube de puntos decorativa con la geometría real (UA)
  function mkBelt(n, r0, r1, power) {
    const a = []; for (let i = 0; i < n; i++) a.push({ r: r0 + Math.pow(Math.random(), power || 1) * (r1 - r0), a: Math.random() * 360 });
    return a;
  }
  const BELTS = {
    belt1: { r0: 2.1, r1: 3.3, dots: mkBelt(750, 2.1, 3.3), col: 'rgba(176,181,206,0.55)', labAng: 300, labR: 3.5, txt: ['2,1 – 3,3 UA', '2.1 – 3.3 AU'], size: 1.15 },
    belt2: { r0: 30, r1: 50, dots: mkBelt(1200, 33, 50, 0.8), col: 'rgba(122,168,255,0.5)', labAng: 322, labR: 51, txt: ['30 – 50 UA', '30 – 50 AU'], size: 1.1 }
  };

  const S = { zoom: 1, px: 0, py: 0, mode: 'comprimida', simOffset: 0, speed: 1, tilt: 0.78, sel: null, follow: null, active: false, dirty: true };
  let cv, ctx, W = 0, Hh = 0, dpr = 1, info, lastT = 0, speedIdx = 0, dateEl, spLabel;
  const simDate = () => new Date(Date.now() + S.simOffset);

  // distancia compresiva: de UA a unidades de pantalla
  function rad(r) {
    if (S.mode === 'lineal') return r * 22;
    return Math.pow(r, 0.55) * 36; // comprimida
  }
  function toScreen(x, y) {
    const r = Math.hypot(x, y); if (r < 1e-6) return { x: W / 2 + S.px, y: Hh / 2 + S.py };
    const k = rad(r) / r * S.zoom * baseScale();
    return { x: W / 2 + S.px + x * k, y: Hh / 2 + S.py + y * k * S.tilt };
  }
  function baseScale() {
    const maxR = S.mode === 'lineal' ? 22 * 55 : rad(55); // se ve hasta el cinturón de Kuiper
    return Math.min(W / 2, Hh / 2 / S.tilt) * 0.92 / maxR;
  }
  const parentOfSel = () => S.sel && MOON_BY[S.sel] ? MOON_BY[S.sel].parent : null;

  function pill(text, x, y, active) {
    ctx.font = '600 10.5px system-ui, sans-serif';
    const w = ctx.measureText(text).width + 14, hh = 18;
    ctx.fillStyle = 'rgba(10,13,31,0.82)'; ctx.strokeStyle = active ? '#86c9ff' : 'rgba(150,170,255,0.38)'; ctx.lineWidth = active ? 1.5 : 1;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - hh / 2, w, hh, 9) : ctx.rect(x - w / 2, y - hh / 2, w, hh); ctx.fill(); ctx.stroke();
    ctx.fillStyle = active ? '#bfe3ff' : '#c9cfee'; ctx.textAlign = 'center'; ctx.fillText(text, x, y + 3.6); ctx.textAlign = 'left';
    return { w, h: hh };
  }

  function render() {
    if (!cv || !S.active) return;
    S.dirty = false;
    const d = A.d(simDate()), B = A.bodies(d);
    const pos = { sun: { x: 0, y: 0 } };
    ORDER.forEach(n => { pos[n] = n === 'earth' ? B.earth : DWARF[n] ? A.helio(n, d) : B[n]; });

    // seguir un cuerpo: lo mantiene centrado (por encima de la hoja de información)
    if (S.follow && pos[S.follow]) {
      const p0 = toScreen(pos[S.follow].x, pos[S.follow].y);
      const dx = W / 2 - p0.x, dy = Hh * 0.32 - p0.y;
      S.px += dx * 0.3; S.py += dy * 0.3;
      if (Math.abs(dx) + Math.abs(dy) > 0.6) S.dirty = true;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, Hh);
    S.hits = [];

    // cinturones
    Object.keys(BELTS).forEach(k => {
      const b = BELTS[k]; ctx.fillStyle = b.col;
      b.dots.forEach(o => {
        const ang = (o.a + 360 * d / (365.25 * Math.pow(o.r, 1.5))) * RAD;
        const p = toScreen(o.r * Math.cos(ang), o.r * Math.sin(ang));
        ctx.fillRect(p.x, p.y, b.size, b.size);
      });
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
    S.hits.push({ id: 'sun', x: sp.x, y: sp.y, r: 16 });

    // planetas y sus satélites
    const ppos = {};
    ORDER.forEach(n => {
      const p = toScreen(pos[n].x, pos[n].y), r = RPX[n]; ppos[n] = p;
      S.hits.push({ id: n, x: p.x, y: p.y, r: Math.max(16, r + 8) });
      g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      g.addColorStop(0, COL[n] + '55'); g.addColorStop(1, COL[n] + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3, 0, 6.3); ctx.fill();
      if (n === 'saturn') { ctx.strokeStyle = 'rgba(241,215,154,0.85)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 2.1, r * 0.75, -0.4, 0, 6.3); ctx.stroke(); }
      ctx.fillStyle = COL[n]; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.3); ctx.fill();
      if (S.sel === n) { ctx.strokeStyle = '#86c9ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, r + 7, 0, 6.3); ctx.stroke(); }
      ctx.font = '600 11px system-ui, sans-serif'; ctx.fillStyle = '#dfe6ff'; ctx.textAlign = 'left';
      ctx.fillText(NAME[n], p.x + r + 7, p.y + 4);
    });
    ctx.fillStyle = '#ffe9b0'; ctx.font = '600 11px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(NAME.sun, sp.x + 14, sp.y + 4);
    if (S.sel === 'sun') { ctx.strokeStyle = '#86c9ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sp.x, sp.y, RPX.sun + 7, 0, 6.3); ctx.stroke(); }

    // satélites principales (órbita ilustrativa; la Luna usa su posición real)
    const par = parentOfSel();
    MOONS.forEach(m => {
      const p = ppos[m.parent]; if (!p) return;
      const big = S.zoom >= 2.4 || S.sel === m.parent || par === m.parent || S.sel === m.id;
      const ang = (m.id === 'luna' ? B.moon.lon : (d / m.per) * 360 + m.ph) * RAD;
      const mx = p.x + Math.cos(ang) * m.r, my = p.y + Math.sin(ang) * m.r * S.tilt;
      if (big) { ctx.strokeStyle = 'rgba(220,225,240,0.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p.x, p.y, m.r, m.r * S.tilt, 0, 0, 6.3); ctx.stroke(); }
      const rr = S.sel === m.id ? 3.2 : (big ? 2.5 : 1.8);
      ctx.fillStyle = m.col; ctx.beginPath(); ctx.arc(mx, my, rr, 0, 6.3); ctx.fill();
      if (S.sel === m.id) { ctx.strokeStyle = '#86c9ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mx, my, 8, 0, 6.3); ctx.stroke(); }
      if (big) { ctx.font = '10.5px system-ui, sans-serif'; ctx.fillStyle = '#cdd4f5'; ctx.textAlign = 'left'; ctx.fillText(NAME[m.id], mx + 6, my - 5); }
      S.hits.push({ id: m.id, x: mx, y: my, r: 10 });
    });

    // etiquetas de los cinturones (pulsables)
    Object.keys(BELTS).forEach(k => {
      const b = BELTS[k], a = b.labAng * RAD;
      const p = toScreen(b.labR * Math.cos(a), b.labR * Math.sin(a));
      const box = pill(NAME[k], p.x, p.y, S.sel === k);
      S.hits.push({ id: k, x: p.x, y: p.y, box: true, w: box.w, h: box.h + 8 });
    });

    // sondas Voyager (a su distancia real; solo se ven al alejar el zoom)
    Object.keys(VOY).forEach(k => {
      const v = VOY[k], r = voyDist(k, simDate().getTime()), a = v.lon * RAD;
      const p = toScreen(r * Math.cos(a), r * Math.sin(a));
      if (p.x < -60 || p.x > W + 60 || p.y < -30 || p.y > Hh + 30) return;
      ctx.strokeStyle = v.col + '66'; ctx.setLineDash([3, 5]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sp.x, sp.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = v.col; ctx.beginPath(); ctx.moveTo(p.x, p.y - 5); ctx.lineTo(p.x + 5, p.y); ctx.lineTo(p.x, p.y + 5); ctx.lineTo(p.x - 5, p.y); ctx.closePath(); ctx.fill();
      const box = pill(NAME[k], p.x, p.y - 17, S.sel === k);
      S.hits.push({ id: k, x: p.x, y: p.y - 6, r: 22 });
    });

    dateEl.textContent = simDate().toLocaleString(G.locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + (S.simOffset === 0 && S.speed === 1 ? G.x(' · en vivo', ' · live') : '');
    if (S.sel) refreshInfo(B);
  }

  const kvRow = (a, b) => h('div', { class: 'kv' }, h('span', { class: 'muted' }, a), h('b', null, b));
  function refreshInfo(B) {
    const n = S.sel; let rows = [];
    if (MOON_BY[n]) {
      const m = MOON_BY[n];
      rows = [['Orbita alrededor de', NAME[m.parent]],
        ['Periodo orbital', G.fmtNum(Math.abs(m.per), Math.abs(m.per) < 1 ? 3 : 2) + G.x(' días', ' days') + (m.per < 0 ? G.x(' (retrógrada)', ' (retrograde)') : '')],
        ['Distancia media al planeta', G.fmtNum(n === 'luna' ? B.moon.distKm : m.km, 0) + ' km']];
      if (n === 'luna') rows.push(['Fase', G.t(B.moon.phaseName) + ' · ' + Math.round(B.moon.illum * 100) + '%']);
    } else if (VOY[n]) {
      const dd = voyDist(n, simDate().getTime()), lh = dd * 499.005 / 3600;
      rows = [['Distancia al Sol (aprox.)', G.fmtNum(dd, 1) + G.x(' UA · ', ' AU · ') + G.fmtNum(dd * 149.5978707, 0) + ' M km'],
        ['Luz tarda en llegar', G.fmtNum(lh, 1) + G.x(' horas', ' hours')],
        ['Lanzamiento', VOY[n].yr], ['Entró en el espacio interestelar', VOY[n].exit]];
    } else if (BELTS[n]) {
      rows = [['Distancia al Sol', G.x(BELTS[n].txt[0], BELTS[n].txt[1])]];
    } else {
      const p = n === 'sun' ? { x: 0, y: 0 } : (n === 'earth' ? B.earth : DWARF[n] ? A.helio(n, B.d) : B[n]);
      const rAU = n === 'sun' ? 0 : Math.hypot(p.x, p.y);
      const dEarth = n === 'sun' ? B.sun.dist : n === 'earth' ? 0 : DWARF[n] ? Math.hypot(p.x - B.earth.x, p.y - B.earth.y, p.z || 0) : B[n].dist;
      rows = n === 'sun'
        ? [['Distancia a la Tierra', G.fmtNum(dEarth, 3) + G.x(' UA', ' AU')]]
        : [['Distancia al Sol', G.fmtNum(rAU, 3) + G.x(' UA · ', ' AU · ') + G.fmtNum(rAU * 149.5978707, 1) + ' M km'], n === 'earth' ? null : ['Distancia a la Tierra', G.fmtNum(dEarth, 3) + G.x(' UA', ' AU')], ['Periodo orbital', G.td(PERIOD[n])]];
    }
    info._rows.replaceChildren(...rows.filter(Boolean).map(r => kvRow(r[0], r[1])));
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
      if (ptrs.size === 1) { S.px += dx; S.py += dy; if (down) { down.m += Math.abs(dx) + Math.abs(dy); if (down.m > 8 && S.follow) setFollow(null); } }
      else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const dd = Math.hypot(a.x - b.x, a.y - b.y); if (lastPinch) S.zoom = Math.max(0.4, Math.min(14, S.zoom * dd / lastPinch)); lastPinch = dd; }
      S.dirty = true;
    });
    const up = e => {
      const had = ptrs.delete(e.pointerId);
      if (down && had && ptrs.size === 0 && down.m < 8 && Date.now() - down.t < 500) tap(e.offsetX, e.offsetY);
      if (ptrs.size < 2) lastPinch = 0; down = null;
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); S.zoom = Math.max(0.4, Math.min(14, S.zoom * Math.exp(-e.deltaY * 0.0012))); S.dirty = true; }, { passive: false });
  }
  function tap(x, y) {
    let best = null, bd = 1e9;
    (S.hits || []).forEach(k => {
      let score = 1e9;
      if (k.box) { if (Math.abs(k.x - x) < k.w / 2 && Math.abs(k.y - y) < k.h / 2) score = 0.99; }
      else { const dd = Math.hypot(k.x - x, k.y - y) / k.r; if (dd < 1) score = dd; }
      if (score < bd) { bd = score; best = k; }
    });
    if (best) select(best.id); else { S.sel = null; setFollow(null); info.classList.remove('open'); S.dirty = true; }
  }

  const followKey = id => MOON_BY[id] ? MOON_BY[id].parent : (ORDER.includes(id) ? id : null);
  function setFollow(k) {
    S.follow = k; S.dirty = true;
    if (info && info._follow) info._follow.textContent = G.t(k ? 'Dejar de seguir' : '⌖ Seguir');
  }
  function select(id) {
    S.sel = id; info.classList.add('open');
    info._btn.onclick = () => G.openEntry(ID[id]);
    const fk = followKey(id);
    info._follow.style.display = fk ? '' : 'none';
    info._follow.onclick = () => { if (S.follow) setFollow(null); else { setFollow(fk); S.zoom = Math.max(S.zoom, 3); } };
    if (S.follow && fk !== S.follow) setFollow(null); else setFollow(S.follow);
    const ms = MOONS.filter(m => m.parent === id);
    info._moons.replaceChildren(...ms.map(m => h('button', { class: 'btn small', onclick: () => select(m.id) }, NAME[m.id])));
    info._moons.style.display = ms.length ? '' : 'none';
    S.dirty = true;
  }

  G.solar = {
    init() {
      const root = G.$('#view-sistema');
      cv = h('canvas', { id: 'solar-canvas' });
      dateEl = h('span', { id: 'solar-date' });
      const top = h('div', { class: 'sky-top' },
        h('button', { class: 'chip-btn', id: 'sc-mode', onclick: e => { S.mode = S.mode === 'comprimida' ? 'lineal' : 'comprimida'; e.currentTarget.textContent = G.t('Escala: ' + S.mode); S.dirty = true; } }, 'Escala: comprimida'),
        h('button', { class: 'chip-btn', onclick: () => { S.zoom = 1; S.px = 0; S.py = 0; setFollow(null); S.dirty = true; } }, '⌖ Centrar'),
        h('button', { class: 'chip-btn', onclick: () => { S.mode = 'comprimida'; const b = G.$('#sc-mode'); if (b) b.textContent = G.t('Escala: comprimida'); S.zoom = 0.42; S.px = 0; S.py = 0; setFollow(null); S.dirty = true; } }, '◇ Voyager'),
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
      info._moons = h('div', { class: 'row-btns' });
      info._btn = h('button', { class: 'btn primary small' }, 'Ver ficha');
      info._follow = h('button', { class: 'btn small' }, '⌖ Seguir');
      info.append(h('div', { class: 'sky-info-main' }, info._title, h('button', { class: 'icon-btn', onclick: () => { S.sel = null; setFollow(null); info.classList.remove('open'); S.dirty = true; } }, '✕')), info._rows, info._moons, h('div', { class: 'row-btns' }, info._btn, info._follow));
      root.append(cv, top, bar, info);
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
    has: id => Object.values(ID).includes(id),
    focusOn(id) { const n = Object.keys(ID).find(k => ID[k] === id); if (!n) return false; G.showTab('sistema'); setTimeout(() => select(n), 60); return true; },
    state: S
  };
})(window.G);
