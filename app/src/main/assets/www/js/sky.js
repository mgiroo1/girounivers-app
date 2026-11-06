/* Girounivers · mapa del cielo (proyección estereográfica, estilo planetario) */
window.G = window.G || {};
(function (G) {
  const h = G.h, A = G.astro, RAD = A.RAD, DEG = A.DEG;
  const NAMES = { sun: 'Sol', moon: 'Luna', mercury: 'Mercurio', venus: 'Venus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Neptuno' };
  const IDS = { sun: 'sol', moon: 'luna', mercury: 'mercurio', venus: 'venus', mars: 'marte', jupiter: 'jupiter', saturn: 'saturno', uranus: 'urano', neptune: 'neptuno' };
  const COLORS = { sun: '#ffd36b', moon: '#e9ecf5', mercury: '#c9c1b6', venus: '#fff1c9', mars: '#ff7b52', jupiter: '#ffd9a8', saturn: '#f4dca0', uranus: '#9fe3e8', neptune: '#7aa2ff' };
  G.BODY_NAMES = NAMES; G.BODY_IDS = IDS; G.BODY_COLORS = COLORS;

  const S = {
    az0: 180, alt0: 38, fov: 95, offset: 0, anim: false,
    layers: { cons: true, names: true, planets: true, dso: true, grid: false, eclip: true, milky: true, below: true },
    sel: null, dirty: true, gyro: false, picks: [], active: false
  };
  let cv, ctx, W = 0, Hh = 0, dpr = 1, bodiesCache = null, bodiesKey = -1, infoEl, timeEl;

  const now = () => new Date(Date.now() + S.offset);
  function getBodies(t) {
    const k = Math.floor(t.getTime() / 20000);
    if (k !== bodiesKey) { bodiesCache = A.bodies(t); bodiesKey = k; }
    return bodiesCache;
  }
  const scale = () => (Math.min(W, Hh) / 2) / (2 * Math.tan(S.fov * RAD / 4));

  // proyección estereográfica centrada en (az0, alt0)
  let P = null;
  function setupProj() {
    P = { sc: scale(), sa0: Math.sin(S.alt0 * RAD), ca0: Math.cos(S.alt0 * RAD), A0: S.az0 * RAD, cx: W / 2, cy: Hh / 2 };
  }
  function proj(alt, az, out) {
    const a = alt * RAD, dA = az * RAD - P.A0;
    const sa = Math.sin(a), ca = Math.cos(a), cd = Math.cos(dA);
    const cosc = P.sa0 * sa + P.ca0 * ca * cd;
    if (cosc < -0.92) return null;
    const k = 2 / (1 + cosc);
    const x = k * ca * Math.sin(dA), y = k * (P.ca0 * sa - P.sa0 * ca * cd);
    const o = out || {};
    o.x = P.cx + x * P.sc; o.y = P.cy - y * P.sc;
    return o;
  }
  function eclPoint(lon, d) {
    const e = (23.4393 - 3.563e-7 * d) * RAD, l = lon * RAD;
    const x = Math.cos(l), y = Math.sin(l) * Math.cos(e), z = Math.sin(l) * Math.sin(e);
    return { ra: A.norm(Math.atan2(y, x) * DEG), dec: Math.asin(z) * DEG };
  }

  function drawPath(pts, close) {
    ctx.beginPath(); let pen = false;
    for (const p of pts) {
      if (!p) { pen = false; continue; }
      if (!pen) { ctx.moveTo(p.x, p.y); pen = true; } else ctx.lineTo(p.x, p.y);
    }
    if (close) ctx.closePath();
    ctx.stroke();
  }

  function render() {
    if (!cv || !S.active) return;
    S.dirty = false;
    const t = now(), loc = G.loc;
    const lst = A.lst(t, loc.lon), B = getBodies(t);
    setupProj();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, Hh);

    // fondo
    const g = ctx.createRadialGradient(W / 2, Hh / 2, 10, W / 2, Hh / 2, Math.max(W, Hh) * 0.75);
    const sunAlt = A.eqToHor(B.sun.ra, B.sun.dec, lst, loc.lat).alt;
    const day = Math.max(0, Math.min(1, (sunAlt + 12) / 12));
    g.addColorStop(0, `rgb(${6 + 20 * day | 0},${8 + 28 * day | 0},${20 + 55 * day | 0})`);
    g.addColorStop(1, `rgb(${2 + 8 * day | 0},${3 + 12 * day | 0},${9 + 26 * day | 0})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);

    const hor = (ra, dec) => A.eqToHor(ra, dec, lst, loc.lat);
    S.picks = [];
    const zf = Math.min(1.9, Math.pow(95 / S.fov, 0.38));

    // Vía Láctea
    if (S.layers.milky) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const widths = [0.42, 0.28, 0.16], alphas = [0.035, 0.045, 0.05];
      for (let pass = 0; pass < 3; pass++) {
        for (let seg = 0; seg < 12; seg++) {
          const pts = [];
          for (let l = seg * 30; l <= seg * 30 + 30; l += 5) { const q = A.galToEq(l, 0); const a = hor(q.ra, q.dec); pts.push(proj(a.alt, a.az)); }
          const c = Math.abs(A.norm180(seg * 30 + 15));
          const boost = c < 60 ? 1.9 : c < 100 ? 1.2 : 0.8;
          ctx.strokeStyle = `rgba(150,170,255,${alphas[pass] * boost})`;
          ctx.lineWidth = Math.max(4, P.sc * widths[pass]);
          drawPath(pts);
        }
      }
    }

    // rejilla ecuatorial
    if (S.layers.grid) {
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(120,150,255,0.16)';
      for (let dec = -60; dec <= 60; dec += 30) { const pts = []; for (let ra = 0; ra <= 360; ra += 5) { const a = hor(ra, dec); pts.push(proj(a.alt, a.az)); } drawPath(pts); }
      for (let ra = 0; ra < 360; ra += 30) { const pts = []; for (let dec = -85; dec <= 85; dec += 5) { const a = hor(ra, dec); pts.push(proj(a.alt, a.az)); } drawPath(pts); }
      ctx.strokeStyle = 'rgba(120,150,255,0.35)';
      { const pts = []; for (let ra = 0; ra <= 360; ra += 4) { const a = hor(ra, 0); pts.push(proj(a.alt, a.az)); } drawPath(pts); }
    }
    // eclíptica
    if (S.layers.eclip) {
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,210,138,0.28)'; ctx.setLineDash([6, 6]);
      const pts = []; for (let l = 0; l <= 360; l += 4) { const q = eclPoint(l, B.d); const a = hor(q.ra, q.dec); pts.push(proj(a.alt, a.az)); }
      drawPath(pts); ctx.setLineDash([]);
    }

    // estrellas: posiciones horizontales y proyectadas
    const st = G.stars;
    for (const s of st) { const a = hor(s.ra, s.dec); s._alt = a.alt; s._az = a.az; s._pp = proj(a.alt, a.az); }

    // constelaciones
    if (S.layers.cons) {
      ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(140,170,255,0.32)';
      for (const c of G.cons) {
        ctx.beginPath();
        for (const pl of c.lines) {
          let pen = false;
          for (const s of pl) {
            const p = s._pp;
            if (!p || (!S.layers.below && s._alt < 0)) { pen = false; continue; }
            if (!pen) { ctx.moveTo(p.x, p.y); pen = true; } else ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }
    }

    // estrellas
    for (const s of st) {
      const p = s._pp; if (!p) continue;
      if (p.x < -20 || p.y < -20 || p.x > W + 20 || p.y > Hh + 20) continue;
      const below = s._alt < 0;
      if (below && !S.layers.below) continue;
      const r = Math.max(0.7, (0.9 + (4.6 - s.mag) * 0.62) * zf);
      const a = below ? 0.35 : 1;
      if (s.mag < 2.5) {
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
        gr.addColorStop(0, `rgba(210,225,255,${0.35 * a})`); gr.addColorStop(1, 'rgba(210,225,255,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.2, 0, 6.3); ctx.fill();
      }
      ctx.fillStyle = `rgba(245,248,255,${a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.3); ctx.fill();
      S.picks.push({ kind: 'star', o: s, x: p.x, y: p.y, w: 3 - s.mag * 0.3 });
    }

    // objetos de cielo profundo
    if (S.layers.dso) {
      for (const o of G.dsos) {
        const a = hor(o.ra, o.dec); o._alt = a.alt; o._az = a.az;
        const p = proj(a.alt, a.az); if (!p) continue;
        if (a.alt < 0 && !S.layers.below) continue;
        if (p.x < -20 || p.y < -20 || p.x > W + 20 || p.y > Hh + 20) continue;
        const al = a.alt < 0 ? 0.3 : 0.85;
        ctx.strokeStyle = `rgba(255,170,230,${al})`; ctx.fillStyle = `rgba(255,170,230,${al * 0.18})`; ctx.lineWidth = 1.2;
        const r = Math.max(4, 5 * zf);
        ctx.beginPath();
        if (o.type === 'galaxy') ctx.ellipse(p.x, p.y, r * 1.5, r * 0.8, -0.5, 0, 6.3);
        else if (o.type === 'nebula') ctx.rect(p.x - r, p.y - r, r * 2, r * 2);
        else if (o.type === 'globular') { ctx.arc(p.x, p.y, r, 0, 6.3); }
        else { ctx.arc(p.x, p.y, r, 0, 6.3); ctx.setLineDash([2, 2]); }
        ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
        if (o.type === 'globular') { ctx.beginPath(); ctx.moveTo(p.x - r, p.y); ctx.lineTo(p.x + r, p.y); ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x, p.y + r); ctx.stroke(); }
        o._pp = p;
        S.picks.push({ kind: 'dso', o, x: p.x, y: p.y, w: 1.5 });
      }
    }

    // etiquetas de constelaciones
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (S.layers.names) {
      ctx.font = `600 ${Math.round(10 + zf * 2)}px system-ui, sans-serif`;
      for (const c of G.cons) {
        const a = hor(c.ra, c.dec); const p = proj(a.alt, a.az); if (!p) continue;
        if (!S.layers.below && a.alt < -2) continue;
        if (p.x < 0 || p.y < 0 || p.x > W || p.y > Hh) continue;
        ctx.fillStyle = `rgba(160,185,255,${a.alt < 0 ? 0.25 : 0.62})`;
        ctx.fillText(c.name.toUpperCase().split('').join(' '), p.x, p.y);
        S.picks.push({ kind: 'constellation', o: c, x: p.x, y: p.y, w: 0.4 });
      }
      // nombres de estrellas
      const lim = 2.3 + Math.max(0, (95 - S.fov) / 28);
      ctx.font = `${Math.round(10 + zf)}px system-ui, sans-serif`; ctx.textAlign = 'left';
      for (const s of st) {
        const p = s._pp; if (!p || s.mag > lim || /^[α-ωΑ-Ω]|^[βγδεζηθικλμνξοπρστυφχψω]/.test(s.name)) continue;
        if (p.x < 0 || p.y < 0 || p.x > W || p.y > Hh) continue;
        if (s._alt < 0 && !S.layers.below) continue;
        ctx.fillStyle = s._alt < 0 ? 'rgba(200,210,240,0.25)' : 'rgba(215,225,250,0.78)';
        ctx.fillText(s.name, p.x + 6 + zf * 2, p.y - 4);
      }
      if (S.fov < 50) {
        ctx.fillStyle = 'rgba(255,170,230,0.8)';
        for (const o of G.dsos) { const p = o._pp; if (!p || o._alt < 0 || p.x < 0 || p.y < 0 || p.x > W || p.y > Hh) continue; ctx.fillText(o.alias, p.x + 10, p.y - 6); }
      }
    }

    // Sol, Luna y planetas
    const bods = ['sun', 'moon'].concat(S.layers.planets ? A.PLANETS : []);
    ctx.textAlign = 'left';
    for (const n of bods) {
      const b = B[n]; const a = hor(b.ra, b.dec); b._alt = a.alt; b._az = a.az;
      const p = proj(a.alt, a.az); b._pp = p; if (!p) continue;
      if (a.alt < -1 && !S.layers.below && n !== 'sun' && n !== 'moon') continue;
      if (p.x < -40 || p.y < -40 || p.x > W + 40 || p.y > Hh + 40) continue;
      const alpha = a.alt < 0 ? 0.45 : 1;
      ctx.globalAlpha = alpha;
      if (n === 'sun') {
        const r = Math.max(9, 11 * zf);
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        gr.addColorStop(0, 'rgba(255,214,120,0.55)'); gr.addColorStop(1, 'rgba(255,214,120,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, r * 4, 0, 6.3); ctx.fill();
        ctx.fillStyle = COLORS.sun; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.3); ctx.fill();
      } else if (n === 'moon') {
        const r = Math.max(9, 11 * zf);
        drawMoon(p, r, B, t);
      } else {
        const r = Math.max(2.6, (3.2 - b.mag * 0.7) * zf * 0.9);
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);
        gr.addColorStop(0, COLORS[n] + '88'); gr.addColorStop(1, COLORS[n] + '00');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.5, 0, 6.3); ctx.fill();
        ctx.fillStyle = COLORS[n]; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.3); ctx.fill();
        if (n === 'saturn') { ctx.strokeStyle = COLORS[n]; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 2.1, r * 0.7, -0.45, 0, 6.3); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
      ctx.font = '600 11px system-ui, sans-serif'; ctx.fillStyle = n === 'sun' || n === 'moon' ? '#ffe9b0' : '#ffe2b8';
      ctx.fillText(NAMES[n], p.x + 12 + zf * 3, p.y + 4);
      S.picks.push({ kind: 'body', id: n, o: b, x: p.x, y: p.y, w: 6 });
    }

    // horizonte y puntos cardinales
    ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,210,138,0.55)';
    { const pts = []; for (let az = 0; az <= 360; az += 3) pts.push(proj(0, az)); drawPath(pts); }
    ctx.font = '700 13px system-ui, sans-serif'; ctx.textAlign = 'center';
    [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SO', 225], ['O', 270], ['NO', 315]].forEach(([l, az]) => {
      const p = proj(2.5, az); if (!p) return;
      if (p.x < 8 || p.y < 8 || p.x > W - 8 || p.y > Hh - 8) return;
      ctx.fillStyle = l.length === 1 ? '#ffd28a' : 'rgba(255,210,138,0.55)';
      ctx.fillText(l, p.x, p.y);
    });
    // zenit
    { const p = proj(90, 0); if (p && p.x > 0 && p.y > 0 && p.x < W && p.y < Hh) { ctx.strokeStyle = 'rgba(255,210,138,0.35)'; ctx.beginPath(); ctx.moveTo(p.x - 5, p.y); ctx.lineTo(p.x + 5, p.y); ctx.moveTo(p.x, p.y - 5); ctx.lineTo(p.x, p.y + 5); ctx.stroke(); } }

    // selección
    if (S.sel) {
      const pk = S.picks.find(k => k.o === S.sel.o);
      const p = pk ? { x: pk.x, y: pk.y } : null;
      if (p) {
        ctx.strokeStyle = '#86c9ff'; ctx.lineWidth = 1.5;
        const r = 16 + Math.sin(Date.now() / 300) * 1.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.3); ctx.stroke();
        ctx.beginPath(); [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(d => { ctx.moveTo(p.x + d[0] * (r + 2), p.y + d[1] * (r + 2)); ctx.lineTo(p.x + d[0] * (r + 8), p.y + d[1] * (r + 8)); }); ctx.stroke();
        S.dirty = true; // animar el aro
      }
    }
    if (S.gyro) { ctx.strokeStyle = 'rgba(134,201,255,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(W / 2, Hh / 2, 18, 0, 6.3); ctx.stroke(); }

    // etiqueta de hora
    if (timeEl) timeEl.textContent = t.toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + (S.offset ? '' : ' · ahora');
    G.$('#sky-fov').textContent = Math.round(S.fov) + '°';
  }

  function drawMoon(p, r, B, t) {
    const m = B.moon, sun = B.sun;
    // dirección hacia el Sol en pantalla
    const sp = sunPoint(B);
    const ang = sp ? Math.atan2(sp.y - p.y, sp.x - p.x) : -Math.PI / 2;
    const elong = m.elong;
    const i = (180 - elong) * RAD; // ángulo de fase
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang);
    const gl = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 3);
    gl.addColorStop(0, 'rgba(230,236,255,0.25)'); gl.addColorStop(1, 'rgba(230,236,255,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, r * 3, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#262b42'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#eef1fa'; ctx.beginPath();
    for (let a = -90; a <= 90; a += 6) ctx.lineTo(r * Math.cos(a * RAD), r * Math.sin(a * RAD));
    for (let a = 90; a >= -90; a -= 6) ctx.lineTo(-r * Math.cos(i) * Math.cos(a * RAD), r * Math.sin(a * RAD));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function sunPoint(B) { const s = B.sun; if (s._pp === undefined) return null; return s._pp; }

  // ---------- interacción ----------
  const ptrs = new Map();
  let downInfo = null, lastPinch = 0;
  function clampView() { S.alt0 = Math.max(-35, Math.min(90, S.alt0)); S.az0 = A.norm(S.az0); S.fov = Math.max(6, Math.min(130, S.fov)); }
  function bindCanvas() {
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
      downInfo = ptrs.size === 1 ? { x: e.offsetX, y: e.offsetY, t: Date.now(), moved: 0 } : null;
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; lastPinch = Math.hypot(a.x - b.x, a.y - b.y); }
      if (S.gyro) setGyro(false);
    });
    cv.addEventListener('pointermove', e => {
      const p = ptrs.get(e.pointerId); if (!p) return;
      const dx = e.offsetX - p.x, dy = e.offsetY - p.y;
      p.x = e.offsetX; p.y = e.offsetY;
      if (ptrs.size === 1) {
        if (downInfo) downInfo.moved += Math.abs(dx) + Math.abs(dy);
        const sc = scale();
        S.az0 -= dx / (sc * Math.max(0.25, Math.cos(S.alt0 * RAD))) * DEG;
        S.alt0 += dy / sc * DEG;
      } else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch) S.fov *= lastPinch / d; lastPinch = d;
      }
      clampView(); S.dirty = true;
    });
    const up = e => {
      const had = ptrs.delete(e.pointerId);
      if (downInfo && ptrs.size === 0 && had && downInfo.moved < 8 && Date.now() - downInfo.t < 500) tap(e.offsetX, e.offsetY);
      if (ptrs.size < 2) lastPinch = 0; downInfo = null;
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { e.preventDefault(); S.fov *= Math.exp(e.deltaY * 0.0012); clampView(); S.dirty = true; }, { passive: false });
  }

  function tap(x, y) {
    let best = null, bd = 1e9;
    for (const k of S.picks) {
      const d = Math.hypot(k.x - x, k.y - y) - k.w;
      const lim = k.kind === 'constellation' ? 34 : 26;
      if (d < lim && d < bd) { bd = d; best = k; }
    }
    if (best) select(best); else { S.sel = null; infoEl.classList.remove('open'); S.dirty = true; }
  }

  function describe(k) {
    const t = now(), loc = G.loc;
    const fmtAA = (alt, az) => `Altura ${Math.round(alt)}° · Azimut ${Math.round(az)}°` + (alt < 0 ? ' (bajo el horizonte)' : '');
    let title, sub, lines = [], id = null, eqGet = null, rsName = '';
    if (k.kind === 'star') {
      const s = k.o; title = s.name; sub = 'Estrella · constelación ' + s.con; id = s.id;
      lines.push('Magnitud ' + G.fmtNum(s.mag, 2)); lines.push(fmtAA(s._alt, s._az)); eqGet = () => s;
    } else if (k.kind === 'dso') {
      const o = k.o; title = o.name; sub = ({ galaxy: 'Galaxia', nebula: 'Nebulosa', cluster: 'Cúmulo abierto', globular: 'Cúmulo globular' })[o.type] + ' · ' + o.alias; id = o.id;
      lines.push('Magnitud ' + G.fmtNum(o.mag, 1)); lines.push(fmtAA(o._alt, o._az)); eqGet = () => o;
    } else if (k.kind === 'constellation') {
      const c = k.o; title = c.name; sub = 'Constelación · ' + c.abbr; id = c.id;
      const a = A.eqToHor(c.ra, c.dec, A.lst(t, loc.lon), loc.lat); lines.push(fmtAA(a.alt, a.az)); lines.push(c.lines.length + ' trazos · ' + new Set(c.lines.flat()).size + ' estrellas dibujadas');
    } else {
      const n = k.id, b = k.o; title = NAMES[n]; id = IDS[n]; rsName = n;
      eqGet = tt => A.bodies(tt)[n];
      if (n === 'sun') { sub = 'Nuestra estrella'; lines.push('⚠ Nunca mires al Sol sin filtro solar homologado.'); }
      else if (n === 'moon') { sub = 'Satélite natural de la Tierra'; lines.push(b.phaseName + ' · ' + Math.round(b.illum * 100) + '% iluminada'); lines.push('Distancia: ' + G.fmtNum(b.distKm, 0) + ' km'); }
      else { sub = 'Planeta'; lines.push('Magnitud ' + G.fmtNum(b.mag, 1) + ' · distancia a la Tierra ' + G.fmtNum(b.dist, 2) + ' UA'); }
      lines.push(fmtAA(b._alt, b._az));
    }
    if (eqGet) {
      const rs = A.riseSet(rsName, t, loc.lat, loc.lon, eqGet);
      lines.push('Sale ' + G.fmtTime(rs.rise) + ' · se pone ' + G.fmtTime(rs.set) + ' (hoy)');
    }
    return { title, sub, lines, id };
  }

  function select(k) {
    S.sel = k; S.dirty = true;
    const d = describe(k);
    infoEl.replaceChildren(
      h('div', { class: 'sky-info-main' },
        h('div', null, h('div', { class: 'sky-info-title' }, d.title), h('div', { class: 'muted small' }, d.sub)),
        h('button', { class: 'icon-btn', onclick: () => { S.sel = null; infoEl.classList.remove('open'); S.dirty = true; } }, '✕')),
      h('div', { class: 'sky-info-lines' }, d.lines.map(l => h('div', null, l))),
      h('div', { class: 'row-btns' },
        G.catalogHas && G.catalogHas(d.id) ? h('button', { class: 'btn primary small', onclick: () => G.openEntry(d.id) }, 'Ver ficha') : (d.id ? h('button', { class: 'btn small', onclick: () => G.openEntry(d.id, true) }, 'Crear ficha') : null),
        h('button', { class: 'btn small', onclick: () => centerOn(k) }, 'Centrar')));
    infoEl.classList.add('open');
  }

  function posOf(k) {
    if (k.kind === 'constellation') return A.eqToHor(k.o.ra, k.o.dec, A.lst(now(), G.loc.lon), G.loc.lat);
    if (k.kind === 'body') { const b = A.bodies(now())[k.id]; return A.eqToHor(b.ra, b.dec, A.lst(now(), G.loc.lon), G.loc.lat); }
    return A.eqToHor(k.o.ra, k.o.dec, A.lst(now(), G.loc.lon), G.loc.lat);
  }
  function centerOn(k) {
    const a = posOf(k);
    animateTo(a.az, a.alt, k.kind === 'constellation' ? 55 : Math.min(S.fov, 40));
  }
  function animateTo(az, alt, fov) {
    const from = { az: S.az0, alt: S.alt0, fov: S.fov }; const dAz = A.norm180(az - from.az);
    const t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - k, 3);
      S.az0 = from.az + dAz * e; S.alt0 = from.alt + (alt - from.alt) * e; S.fov = from.fov + (fov - from.fov) * e;
      clampView(); S.dirty = true;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  // ---- brújula / giroscopio ----
  let gyroHandler = null;
  function setGyro(on) {
    S.gyro = on; G.$('#btn-gyro').classList.toggle('on', on);
    if (on) {
      const start = () => {
        gyroHandler = e => {
          let az, alt;
          if (e.alpha == null) return;
          const a = e.alpha * RAD, b = (e.beta || 0) * RAD, g = (e.gamma || 0) * RAD;
          const zx = Math.cos(a) * Math.sin(g) + Math.sin(a) * Math.sin(b) * Math.cos(g);
          const zy = Math.sin(a) * Math.sin(g) - Math.cos(a) * Math.sin(b) * Math.cos(g);
          const zz = Math.cos(b) * Math.cos(g);
          const E = -zx, N = -zy, U = -zz; // dirección de la cámara trasera
          az = Math.atan2(E, N) * DEG; alt = Math.asin(Math.max(-1, Math.min(1, U))) * DEG;
          if (e.webkitCompassHeading != null && e.alpha != null) az = A.norm(az + (e.webkitCompassHeading - A.norm(360 - e.alpha)));
          S.az0 = A.norm(S.az0 + A.norm180(az - S.az0) * 0.18);
          S.alt0 = S.alt0 + (alt - S.alt0) * 0.18; clampView(); S.dirty = true;
        };
        window.addEventListener('deviceorientationabsolute', gyroHandler, true);
        if (!('ondeviceorientationabsolute' in window)) window.addEventListener('deviceorientation', gyroHandler, true);
        G.toast('Apunta el móvil al cielo (trasera hacia arriba)');
      };
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(r => r === 'granted' ? start() : setGyro(false)).catch(() => setGyro(false));
      } else start();
    } else if (gyroHandler) {
      window.removeEventListener('deviceorientationabsolute', gyroHandler, true);
      window.removeEventListener('deviceorientation', gyroHandler, true); gyroHandler = null;
    }
  }

  // ---- búsqueda ----
  function openSearch() {
    const list = h('div', { class: 'list' });
    const inp = h('input', { type: 'search', placeholder: 'Buscar estrella, planeta, constelación…', autofocus: true });
    const items = [];
    Object.keys(NAMES).forEach(n => items.push({ name: NAMES[n], sub: 'Sistema solar', k: { kind: 'body', id: n, o: {} } }));
    G.cons.forEach(c => items.push({ name: c.name, sub: 'Constelación', k: { kind: 'constellation', o: c } }));
    G.stars.filter(s => s.mag < 3.6 && !/^[^\x00-\x7F]/.test(s.name)).forEach(s => items.push({ name: s.name, sub: 'Estrella · ' + s.con, k: { kind: 'star', o: s } }));
    G.dsos.forEach(o => items.push({ name: o.name, sub: 'Cielo profundo', k: { kind: 'dso', o } }));
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const m = G.modal({ title: 'Buscar en el cielo', body: h('div', null, inp, list) });
    const fill = () => {
      const q = norm(inp.value.trim());
      list.replaceChildren(...items.filter(i => !q || norm(i.name).includes(q)).slice(0, 40).map(i => h('button', { class: 'list-item', onclick: () => { m.close(); goTo(i.k); } }, h('b', null, i.name), h('span', { class: 'muted small' }, i.sub))));
    };
    inp.addEventListener('input', fill); fill(); setTimeout(() => inp.focus(), 250);
  }
  function goTo(k) {
    if (k.kind === 'body') { k.o = A.bodies(now())[k.id]; }
    centerOn(k);
    setTimeout(() => {
      const found = S.picks.find(p => (p.o === k.o) || (k.kind === 'body' && p.kind === 'body' && p.id === k.id) || (p.o && k.o && p.o.id && p.o.id === k.o.id));
      select(found || k);
    }, 560);
  }

  // ---- capas ----
  function openLayers() {
    const defs = [['cons', 'Líneas de constelaciones'], ['names', 'Nombres'], ['planets', 'Planetas'], ['dso', 'Galaxias, nebulosas y cúmulos'], ['milky', 'Vía Láctea'], ['eclip', 'Eclíptica'], ['grid', 'Rejilla ecuatorial'], ['below', 'Mostrar bajo el horizonte']];
    const body = h('div', { class: 'toggles' }, defs.map(([k, label]) => {
      const cb = h('input', { type: 'checkbox' }); cb.checked = S.layers[k];
      cb.addEventListener('change', () => { S.layers[k] = cb.checked; S.dirty = true; G.kv.set('skyLayers', S.layers); });
      return h('label', { class: 'toggle' }, h('span', null, label), cb, h('i'));
    }));
    G.modal({ title: 'Capas del mapa', body });
  }

  function step(ms) { S.offset += ms; bodiesKey = -1; S.dirty = true; }

  G.sky = {
    async init() {
      const saved = await G.kv.get('skyLayers'); if (saved) Object.assign(S.layers, saved);
      const root = G.$('#view-cielo');
      cv = h('canvas', { id: 'sky-canvas' });
      infoEl = h('div', { id: 'sky-info', class: 'sheet' });
      timeEl = h('span', { id: 'sky-time' });
      const tb = h('div', { class: 'sky-top' },
        h('button', { class: 'chip-btn', onclick: openSearch, 'aria-label': 'Buscar' }, '🔍 Buscar'),
        h('button', { class: 'chip-btn', onclick: openLayers }, '☰ Capas'),
        h('button', { class: 'chip-btn', id: 'btn-gyro', onclick: () => setGyro(!S.gyro) }, '🧭 Brújula'));
      const zoom = h('div', { class: 'sky-zoom' },
        h('button', { class: 'icon-btn round', onclick: () => { S.fov = S.fov / 1.35; clampView(); S.dirty = true; } }, '＋'),
        h('span', { id: 'sky-fov', class: 'small muted' }, ''),
        h('button', { class: 'icon-btn round', onclick: () => { S.fov = S.fov * 1.35; clampView(); S.dirty = true; } }, '－'));
      const bar = h('div', { class: 'sky-time' },
        h('button', { onclick: () => step(-86400000) }, '«'), h('button', { onclick: () => step(-3600000) }, '‹'),
        h('div', { class: 'tcenter', onclick: () => { S.offset = 0; S.anim = false; bodiesKey = -1; S.dirty = true; } }, timeEl, h('small', null, 'toca para volver a ahora')),
        h('button', { onclick: () => step(3600000) }, '›'), h('button', { onclick: () => step(86400000) }, '»'),
        h('button', { id: 'btn-anim', onclick: e => { S.anim = !S.anim; e.currentTarget.classList.toggle('on', S.anim); } }, '▶'));
      root.append(cv, tb, zoom, bar, infoEl);
      ctx = cv.getContext('2d');
      bindCanvas();
      new ResizeObserver(() => this.resize()).observe(root);
      let last = performance.now(), lastMin = 0;
      const loop = t => {
        if (S.active) {
          if (S.anim) { S.offset += (t - last) * 600; bodiesKey = -1; S.dirty = true; }
          if (S.offset === 0 && t - lastMin > 15000) { lastMin = t; S.dirty = true; bodiesKey = -1; }
          if (S.dirty) render();
        }
        last = t; requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    },
    resize() {
      const r = G.$('#view-cielo').getBoundingClientRect(); if (!r.width) return;
      dpr = Math.min(2.5, window.devicePixelRatio || 1);
      W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr; cv.style.width = W + 'px'; cv.style.height = Hh + 'px';
      S.dirty = true;
    },
    show(on) { S.active = on; if (on) { this.resize(); S.dirty = true; } else setGyro(false); },
    focusOn(id) {
      const body = Object.keys(IDS).find(k => IDS[k] === id);
      let k = null;
      if (body) k = { kind: 'body', id: body, o: {} };
      else if (G.starById && G.starById[id]) k = { kind: 'star', o: G.starById[id] };
      else { const c = G.cons.find(x => x.id === id); if (c) k = { kind: 'constellation', o: c }; else { const d = G.dsos.find(x => x.id === id); if (d) k = { kind: 'dso', o: d }; } }
      if (!k) return false;
      G.showTab('cielo'); setTimeout(() => goTo(k), 60); return true;
    },
    state: S
  };
  G.starById = {}; G.stars.forEach(s => { G.starById[s.id] = s; });
})(window.G);
