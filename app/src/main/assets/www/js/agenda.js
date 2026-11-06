/* Girounivers · agenda de eventos cósmicos (calculados en el propio móvil) */
window.G = window.G || {};
(function (G) {
  const h = G.h, A = G.astro, DEG = A.DEG, RAD = A.RAD;
  const TYPES = [['todo', 'Todo'], ['lluvia', '☄ Lluvias'], ['luna', '☾ Luna'], ['planeta', '◉ Planetas'], ['eclipse', '◐ Eclipses'], ['estacion', '☀ Estaciones'], ['mio', '★ Míos']];
  const PN = { mercury: 'Mercurio', venus: 'Venus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Neptuno' };
  const ICON = { lluvia: '☄', luna: '☾', planeta: '◉', eclipse: '◐', estacion: '☀', mio: '★' };
  if (G.lang === 'en') Object.keys(PN).forEach(k => { PN[k] = G.t(PN[k]); });
  const state = { f: 'todo', cache: null, cacheDay: '' };
  let list, chips;
  const saveCustom = () => G.kv.set('events', G.customEvents);

  function compute() {
    const day = new Date().toDateString();
    if (state.cache && state.cacheDay === day) return state.cache;
    const ev = [];
    const t0 = new Date(); t0.setHours(0, 0, 0, 0); t0.setDate(t0.getDate() - 1);
    const HOURS = 24 * 400, step = 3600000;
    const rows = new Array(HOURS + 1);
    for (let i = 0; i <= HOURS; i++) { const t = new Date(t0.getTime() + i * step); const b = A.bodies(t); rows[i] = { t, b }; }
    const at = t => A.bodies(t);
    const refine = (ia, fn) => { // bisección entre rows[ia] y rows[ia+1] donde fn cambia de signo
      let lo = rows[ia].t.getTime(), hi = rows[ia + 1].t.getTime();
      const flo = fn(at(new Date(lo)));
      for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2; const fm = fn(at(new Date(mid))); if ((fm < 0) === (flo < 0)) lo = mid; else hi = mid; }
      return new Date((lo + hi) / 2);
    };

    // fases lunares y estaciones
    const moonQ = b => Math.floor(b.moon.elong / 90);
    const sunQ = b => Math.floor(b.sun.lon / 90);
    const MN = ['Luna nueva', 'Cuarto creciente', 'Luna llena', 'Cuarto menguante'];
    const SN = ['Equinoccio de primavera', 'Solsticio de verano', 'Equinoccio de otoño', 'Solsticio de invierno'];
    for (let i = 0; i < HOURS; i++) {
      const a = rows[i].b, c = rows[i + 1].b;
      const qa = moonQ(a), qc = moonQ(c);
      if (qa !== qc) {
        const q = (qa + 1) % 4; const target = q * 90;
        const t = refineAngle(i, b => b.moon.elong, target);
        ev.push({ t, type: 'luna', title: G.t(MN[q]), desc: G.x('Fase lunar (hora local; precisión de pocas horas).', 'Moon phase (local time; accurate to within a few hours).') + (q === 2 ? G.x(' Noche muy luminosa: ideal para fotografiar la Luna, mala para cielo profundo.', ' Very bright night: great for photographing the Moon, poor for deep sky.') : q === 0 ? G.x(' Cielo oscuro: buen momento para Vía Láctea y objetos débiles.', ' Dark sky: a good time for the Milky Way and faint objects.') : '') });
      }
      const sa = sunQ(a), sc = sunQ(c);
      if (sa !== sc) {
        const q = (sa + 1) % 4; const t = refineAngle(i, b => b.sun.lon, q * 90);
        ev.push({ t, type: 'estacion', title: G.t(SN[q]), desc: G.x('Inicio astronómico de la ' + ['primavera', 'verano', 'otoño', 'invierno'][q] + ' en el hemisferio norte.', 'Astronomical start of ' + ['spring', 'summer', 'autumn', 'winter'][q] + ' in the northern hemisphere.') });
      }
    }
    function refineAngle(ia, get, target) {
      const f = b => A.norm180(get(b) - target);
      let lo = rows[ia].t.getTime(), hi = rows[ia + 1].t.getTime();
      for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2; if (f(at(new Date(mid))) < 0) lo = mid; else hi = mid; }
      return new Date((lo + hi) / 2);
    }

    // oposiciones (planetas exteriores)
    ['mars', 'jupiter', 'saturn', 'uranus', 'neptune'].forEach(n => {
      const f = b => A.norm180(b[n].lon - b.sun.lon - 180);
      for (let i = 0; i < HOURS; i += 24) {
        const j = Math.min(HOURS - 1, i + 24);
        const fa = f(rows[i].b), fb = f(rows[j].b);
        if (fa < 0 && fb >= 0 && Math.abs(fa) < 90) {
          let lo = rows[i].t.getTime(), hi = rows[j].t.getTime();
          for (let k = 0; k < 16; k++) { const mid = (lo + hi) / 2; if (f(at(new Date(mid))) < 0) lo = mid; else hi = mid; }
          const t = new Date((lo + hi) / 2), b = at(t)[n];
          ev.push({ t, type: 'planeta', title: G.x(PN[n] + ' en oposición', PN[n] + ' at opposition'), desc: G.x(`${PN[n]} está en el punto opuesto al Sol: sale al anochecer, brilla toda la noche y está lo más cerca de la Tierra (${G.fmtNum(b.dist, 2)} UA, magnitud ${G.fmtNum(b.mag, 1)}). El mejor momento del año para observarlo.`, `${PN[n]} is opposite the Sun: it rises at dusk, shines all night and is closest to Earth (${G.fmtNum(b.dist, 2)} AU, magnitude ${G.fmtNum(b.mag, 1)}). The best time of the year to observe it.`) });
        }
      }
    });

    // máxima elongación de Mercurio y Venus (día a día)
    ['mercury', 'venus'].forEach(n => {
      const e = i => A.norm180(rows[i].b[n].lon - rows[i].b.sun.lon);
      for (let i = 24; i < HOURS - 24; i += 24) {
        const a = Math.abs(e(i - 24)), b = Math.abs(e(i)), c = Math.abs(e(i + 24));
        if (b > a && b >= c && b > 14) {
          // afinar con muestras horarias
          let best = i, bv = b;
          for (let k = i - 24; k <= i + 24; k++) { const v = Math.abs(e(k)); if (v > bv) { bv = v; best = k; } }
          const east = e(best) > 0;
          ev.push({ t: rows[best].t, type: 'planeta', title: G.x(`${PN[n]} en máxima elongación ${east ? 'este' : 'oeste'} (${Math.round(bv)}°)`, `${PN[n]} at greatest ${east ? 'eastern' : 'western'} elongation (${Math.round(bv)}°)`), desc: east ? G.x(`Mejor momento para ver ${PN[n]} al atardecer, bajo en el horizonte oeste tras la puesta del Sol.`, `Best time to see ${PN[n]} in the evening, low in the west after sunset.`) : G.x(`Mejor momento para ver ${PN[n]} antes del amanecer, bajo en el horizonte este.`, `Best time to see ${PN[n]} before dawn, low in the east.`) });
        }
      }
    });

    // conjunciones planeta–planeta y Luna–planeta (mínimos de separación)
    const bright = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    for (let x = 0; x < bright.length; x++) for (let y = x + 1; y < bright.length; y++) {
      const a = bright[x], b = bright[y];
      const sep = i => { const r = rows[i].b; return A.sep(r[a].ra, r[a].dec, r[b].ra, r[b].dec); };
      for (let i = 24; i < HOURS - 24; i += 6) {
        const s0 = sep(i - 6), s1 = sep(i), s2 = sep(i + 6);
        if (s1 <= s0 && s1 < s2 && s1 < 3.5) {
          let best = i, bv = s1; for (let k = i - 6; k <= i + 6; k++) { const v = sep(k); if (v < bv) { bv = v; best = k; } }
          const sunE = A.sep(rows[best].b[a].ra, rows[best].b[a].dec, rows[best].b.sun.ra, rows[best].b.sun.dec);
          if (sunE < 14) continue; // demasiado cerca del Sol
          ev.push({ t: rows[best].t, type: 'planeta', title: G.x(`Conjunción: ${PN[a]} y ${PN[b]}`, `Conjunction: ${PN[a]} and ${PN[b]}`), desc: G.x(`Se acercan a ${G.fmtNum(bv, 1)}° en el cielo. A ${Math.round(sunE)}° del Sol.`, `They come within ${G.fmtNum(bv, 1)}° of each other. ${Math.round(sunE)}° from the Sun.`) });
        }
      }
    }
    bright.forEach(n => {
      const sep = i => { const r = rows[i].b; return A.sep(r.moon.ra, r.moon.dec, r[n].ra, r[n].dec); };
      for (let i = 1; i < HOURS - 1; i++) {
        const s0 = sep(i - 1), s1 = sep(i), s2 = sep(i + 1);
        if (s1 <= s0 && s1 < s2 && s1 < 3) {
          const r = rows[i].b, sunE = A.sep(r[n].ra, r[n].dec, r.sun.ra, r.sun.dec);
          if (sunE < 18) continue;
          ev.push({ t: rows[i].t, type: 'planeta', title: G.x(`Luna y ${PN[n]} juntos`, `Moon and ${PN[n]} together`), desc: G.x(`Separación mínima de ${G.fmtNum(s1, 1)}° (vista desde el centro de la Tierra; desde tu ubicación puede variar hasta 1°). La Luna estará ${Math.round(r.moon.illum * 100)}% iluminada.`, `Minimum separation of ${G.fmtNum(s1, 1)}° (seen from Earth's centre; from your location it can differ by up to 1°). The Moon will be ${Math.round(r.moon.illum * 100)}% illuminated.`) });
        }
      }
    });

    // lluvias de estrellas
    const y0 = t0.getFullYear();
    for (const yr of [y0, y0 + 1]) {
      G.showers.forEach(s => {
        const t = new Date(Date.UTC(yr, s[0] - 1, s[1], 22, 0)); // pico nocturno aprox.
        if (t < t0 || t > rows[HOURS].t) return;
        const m = A.bodies(t).moon, ill = Math.round(m.illum * 100);
        const q = G.x(ill < 35 ? 'favorable' : ill < 65 ? 'regular' : 'poco favorable', ill < 35 ? 'favourable' : ill < 65 ? 'fair' : 'poor');
        ev.push({ t, type: 'lluvia', title: G.t(s[2]), desc: G.x(`Máximo hacia el ${s[1]}/${s[0]} · hasta ~${s[3]} meteoros/hora (ZHR) · radiante en ${s[5]} · origen: ${s[4]}. Luna ${ill}% iluminada: condiciones ${q}.`, `Peak around ${s[1]}/${s[0]} · up to ~${s[3]} meteors/hour (ZHR) · radiant in ${G.t(s[5])} · source: ${G.t(s[4])}. Moon ${ill}% illuminated: ${q} conditions.`) });
      });
    }
    // eclipses
    G.eclipses.forEach((e, ei) => {
      const t = new Date(e[0] + 'T12:00:00Z');
      const en = G.lang === 'en' && G.ECL[ei];
      if (t >= t0 && t <= rows[HOURS].t) ev.push({ t, type: 'eclipse', title: en ? en[0] : e[1], desc: (en ? en[1] : e[2]) + G.x(' · Comprueba hora y visibilidad exactas en fuentes oficiales.', ' · Check exact times and visibility in official sources.') });
    });
    ev.sort((a, b) => a.t - b.t);
    state.cache = ev; state.cacheDay = day; return ev;
  }

  function all() {
    const mine = (G.customEvents || []).map(e => ({ t: new Date(e.date), type: 'mio', title: e.title, desc: e.desc || '', id: e.id }));
    return compute().concat(mine).sort((a, b) => a.t - b.t);
  }

  function ics(e) {
    const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const end = new Date(e.t.getTime() + 3600000);
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Girounivers//ES', 'BEGIN:VEVENT', 'UID:' + f(e.t) + '-' + G.slug(e.title) + '@girounivers', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(e.t), 'DTEND:' + f(end), 'SUMMARY:' + e.title.replace(/[,;]/g, ' '), 'DESCRIPTION:' + e.desc.replace(/\n/g, ' ').replace(/[,;]/g, ' '), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }

  function detail(e) {
    const days = Math.round((e.t - new Date()) / 86400000);
    const m = G.modal({
      title: e.title,
      body: h('div', null,
        h('div', { class: 'muted' }, G.fmtDate(e.t, e.type !== 'lluvia' && e.type !== 'eclipse' ? true : false)),
        h('div', { class: 'muted small' }, days === 0 ? G.t('Hoy') : days > 0 ? G.x('Faltan ' + days + (days === 1 ? ' día' : ' días'), days + (days === 1 ? ' day' : ' days') + ' to go') : G.x('Hace ' + (-days) + (days === -1 ? ' día' : ' días'), (-days) + (days === -1 ? ' day' : ' days') + ' ago')),
        h('p', { class: 'prose' }, e.desc || 'Sin descripción.')),
      actions: [e.id ? h('button', { class: 'btn danger ghost', onclick: () => { m.close(); G.customEvents = G.customEvents.filter(x => x.id !== e.id); saveCustom(); render(); } }, 'Eliminar') : null,
        h('button', { class: 'btn primary', onclick: () => G.saveFile(G.slug(e.title) + '.ics', 'text/calendar', new Blob([ics(e)], { type: 'text/calendar' })) }, '📅 Añadir al calendario')]
    });
  }

  function render() {
    const evs = all().filter(e => state.f === 'todo' || e.type === state.f);
    const nodes = []; let cur = '';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcoming = evs.filter(e => e.t >= today);
    const past = evs.filter(e => e.t < today);
    const mk = e => {
      const days = Math.ceil((e.t - today) / 86400000);
      return h('button', { class: 'ev t-' + e.type, onclick: () => detail(e) },
        h('div', { class: 'ev-date' }, h('b', null, e.t.getDate()), h('small', null, e.t.toLocaleString(G.locale, { month: 'short' }))),
        h('div', { class: 'ev-main' }, h('b', null, ICON[e.type] + ' ' + e.title), h('small', { class: 'muted' }, e.t.toLocaleString(G.locale, { weekday: 'long' }) + (e.type === 'luna' || e.type === 'estacion' || e.type === 'planeta' ? ' · ' + G.fmtTime(e.t) : ''))),
        h('div', { class: 'ev-in' }, days <= 0 ? G.t('hoy') : days === 1 ? G.t('mañana') : G.x('en ' + days + ' d', 'in ' + days + ' d')));
    };
    upcoming.forEach(e => {
      const k = e.t.toLocaleString(G.locale, { month: 'long', year: 'numeric' }).replace(/^./, c => c.toUpperCase());
      if (k !== cur) { cur = k; nodes.push(h('h4', { class: 'month' }, k)); }
      nodes.push(mk(e));
    });
    if (!upcoming.length) nodes.push(h('div', { class: 'empty' }, 'No hay eventos de este tipo.'));
    list.replaceChildren(...nodes);
  }

  function newEvent() {
    const t = h('input', { type: 'text', placeholder: 'Título (p. ej. Salida a Montsec)' });
    const d = h('input', { type: 'datetime-local', value: G.toLocalInput(new Date(Date.now() + 86400000)) });
    const n = h('textarea', { rows: 3, placeholder: 'Notas (opcional)' });
    const m = G.modal({
      title: 'Nuevo evento propio', body: h('div', { class: 'form' }, h('label', null, 'Título', t), h('label', null, 'Fecha y hora', d), h('label', null, 'Notas', n)),
      actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancelar'),
        h('button', { class: 'btn primary', onclick: () => {
          if (!t.value.trim() || !d.value) { G.toast('Falta título o fecha'); return; }
          G.customEvents.push({ id: 'ev' + Date.now(), date: new Date(d.value).toISOString(), title: t.value.trim(), desc: n.value.trim() });
          saveCustom(); m.close(); render();
        } }, 'Guardar')]
    });
  }

  G.agenda = {
    init() {
      const root = G.$('#view-agenda');
      chips = h('div', { class: 'chips' }, TYPES.map(([k, n]) => h('button', { class: 'chip' + (k === 'todo' ? ' on' : ''), onclick: ev => { state.f = k; G.$$('.chip', chips).forEach(x => x.classList.toggle('on', x === ev.currentTarget)); render(); } }, n)));
      list = h('div', { class: 'ev-list' }, h('div', { class: 'empty' }, 'Calculando el cielo…'));
      const fab = h('button', { class: 'fab', 'aria-label': 'Nuevo evento', onclick: newEvent }, '＋');
      root.append(h('div', { class: 'scroll' }, h('div', { class: 'catalog-top' }, chips, h('div', { class: 'muted small count' }, 'Lluvias de estrellas, fases lunares, oposiciones y conjunciones de los próximos 13 meses, calculadas en tu móvil.')), list), fab);
    },
    show() { setTimeout(render, 30); },
    compute
  };
})(window.G);
