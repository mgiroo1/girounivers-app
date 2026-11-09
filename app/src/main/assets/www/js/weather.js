/* Girounivers · tiempo para observar (única sección que usa internet; sin conexión muestra la última previsión guardada) */
window.G = window.G || {};
(function (G) {
  const h = G.h, A = G.astro;
  const API = 'https://api.open-meteo.com/v1/forecast';
  const state = { data: null, nights: [], sel: 0, loading: false, err: '' };
  let root, body;

  const label = s => s >= 80 ? [G.x('Excelente', 'Excellent'), '#6be3a0'] : s >= 60 ? [G.x('Buena', 'Good'), '#86c9ff'] : s >= 35 ? [G.x('Regular', 'Fair'), '#ffd28a'] : [G.x('Mala', 'Poor'), '#ff7b8b'];

  // puntuación 0-100 de una hora (solo tiempo atmosférico; la Luna se muestra aparte)
  function hourScore(o) {
    let s = 100 - (o.cloud * 0.8 + o.low * 0.2);
    if (o.precip >= 70) s -= 45; else if (o.precip >= 40) s -= 25;
    if (o.gust >= 45) s -= 15; else if (o.wind >= 25) s -= 8;
    if (o.hum >= 95 || o.temp - o.dew < 1.5) s -= 8;
    if (o.vis != null && o.vis < 5000) s -= 15; else if (o.vis != null && o.vis < 10000) s -= 5;
    return Math.max(0, Math.min(100, Math.round(s)));
  }

  function analyse(raw) {
    const H = raw.hourly, n = H.time.length, lat = G.loc.lat, lon = G.loc.lon;
    const hours = [];
    for (let i = 0; i < n; i++) {
      const t = new Date(H.time[i] * 1000), b = A.bodies(t), lst = A.lst(t, lon);
      const sun = A.eqToHor(b.sun.ra, b.sun.dec, lst, lat).alt, moon = A.eqToHor(b.moon.ra, b.moon.dec, lst, lat).alt;
      const o = { t, sun, moon, illum: b.moon.illum, cloud: H.cloud_cover[i], low: H.cloud_cover_low[i], mid: H.cloud_cover_mid[i], high: H.cloud_cover_high[i],
        temp: H.temperature_2m[i], hum: H.relative_humidity_2m[i], dew: H.dew_point_2m[i], wind: H.wind_speed_10m[i], gust: H.wind_gusts_10m[i], vis: H.visibility ? H.visibility[i] : null, precip: H.precipitation_probability ? (H.precipitation_probability[i] || 0) : 0 };
      if ([o.cloud, o.low, o.temp, o.wind].some(v => v == null)) continue;
      o.score = hourScore(o); hours.push(o);
    }
    // agrupa por noche (el día local de t-12h) usando las horas con Sol bajo el horizonte
    const map = new Map();
    const dark = x => x.sun < -12;
    hours.forEach(o => {
      const k = new Date(o.t.getTime() - 12 * 3600000).toDateString();
      if (!map.has(k)) map.set(k, []); map.get(k).push(o);
    });
    const nights = [];
    map.forEach(list => {
      let hs = list.filter(dark); if (hs.length < 2) hs = list.filter(o => o.sun < -6); if (hs.length < 2) return;
      const avg = k => hs.reduce((a, o) => a + o[k], 0) / hs.length;
      let best = null; const W = Math.min(3, hs.length);
      for (let i = 0; i + W <= hs.length; i++) { const sc = hs.slice(i, i + W).reduce((a, o) => a + o.score, 0) / W; if (!best || sc > best.sc) best = { sc, a: hs[i].t, b: new Date(hs[i + W - 1].t.getTime() + 3600000) }; }
      const moonUp = hs.filter(o => o.moon > 0).length / hs.length;
      nights.push({ start: hs[0].t, hours: hs, score: Math.round(avg('score')), cloud: Math.round(avg('cloud')), tmin: Math.min(...hs.map(o => o.temp)), wind: Math.max(...hs.map(o => o.wind)),
        hum: Math.round(avg('hum')), illum: hs[Math.floor(hs.length / 2)].illum, moonUp, best });
    });
    nights.sort((a, b) => a.start - b.start);
    // descarta noches ya terminadas
    const now = Date.now();
    return nights.filter(nt => nt.hours[nt.hours.length - 1].t.getTime() + 3600000 > now);
  }

  async function load(force) {
    if (state.loading) return; state.loading = true; state.err = ''; render();
    const lat = G.loc.lat, lon = G.loc.lon;
    let cache = null; try { cache = await G.kv.get('weather'); } catch (e) { }
    const fresh = cache && Math.abs(cache.lat - lat) < 0.05 && Math.abs(cache.lon - lon) < 0.05 && Date.now() - cache.at < 30 * 60000;
    if (fresh && !force) { state.data = cache; }
    else {
      try {
        const url = `${API}?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_gusts_10m,visibility,precipitation_probability&wind_speed_unit=kmh&timeformat=unixtime&forecast_days=7&timezone=auto`;
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 15000);
        const r = await fetch(url, { signal: ctl.signal }); clearTimeout(to);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const raw = await r.json(); if (!raw.hourly || !raw.hourly.time) throw new Error('bad data');
        state.data = { at: Date.now(), lat, lon, raw }; G.kv.set('weather', state.data);
      } catch (e) {
        state.data = cache && cache.raw ? cache : null; state.err = state.data ? 'cache' : 'none';
      }
    }
    try { state.nights = state.data ? analyse(state.data.raw) : []; } catch (e) { console.error(e); state.nights = []; state.err = 'none'; }
    state.sel = Math.min(state.sel, Math.max(0, state.nights.length - 1));
    state.loading = false; render();
  }

  const ago = at => { const m = Math.round((Date.now() - at) / 60000); return m < 2 ? G.x('hace un momento', 'just now') : m < 90 ? G.x(`hace ${m} min`, `${m} min ago`) : m < 2880 ? G.x(`hace ${Math.round(m / 60)} h`, `${Math.round(m / 60)} h ago`) : G.x(`hace ${Math.round(m / 1440)} días`, `${Math.round(m / 1440)} days ago`); };
  const dayName = d => d.toLocaleDateString(G.locale, { weekday: 'short', day: 'numeric', month: 'short' });
  const moonGlyph = i => i < .08 ? '🌑' : i < .35 ? '🌒' : i < .65 ? '🌓' : i < .92 ? '🌔' : '🌕';

  function moonText(nt) {
    const pct = Math.round(nt.illum * 100);
    if (nt.moonUp < .15 || nt.illum < .15) return G.x(`Luna ${pct}%: cielo oscuro, buena noche para objetos débiles y Vía Láctea.`, `Moon ${pct}%: dark sky, a good night for faint objects and the Milky Way.`);
    if (nt.illum > .6) return G.x(`Luna ${pct}% sobre el horizonte parte de la noche: mejor para planetas y la propia Luna que para cielo profundo.`, `Moon ${pct}% above the horizon for part of the night: better for planets and the Moon itself than for deep sky.`);
    return G.x(`Luna ${pct}% parte de la noche: aceptable para casi todo.`, `Moon ${pct}% for part of the night: fine for most targets.`);
  }

  function render() {
    if (!body) return;
    const nodes = [];
    const top = h('div', { class: 'wx-top' },
      h('div', null, h('b', null, G.x('Tiempo para observar', 'Observing weather')), h('div', { class: 'muted small' }, `${G.loc.lat.toFixed(2)}°, ${G.loc.lon.toFixed(2)}° · ` + (state.data ? G.x('actualizado ', 'updated ') + ago(state.data.at) : G.x('sin datos', 'no data')))),
      h('button', { class: 'btn small', onclick: () => { if (!state.loading) load(true); } }, state.loading ? G.x('Cargando…', 'Loading…') : '⟳ ' + G.x('Actualizar', 'Refresh')));
    nodes.push(top);
    if (state.err === 'cache') nodes.push(h('div', { class: 'wx-warn' }, G.x('Sin conexión: se muestra la última previsión guardada.', 'Offline: showing the last saved forecast.')));
    if (!state.nights.length) {
      nodes.push(h('div', { class: 'empty' }, state.loading ? G.x('Descargando la previsión…', 'Downloading the forecast…') : state.err === 'none' ? G.x('No se pudo descargar la previsión. Esta es la única sección que necesita internet. Comprueba la conexión y pulsa Actualizar.', 'Could not download the forecast. This is the only section that needs internet. Check your connection and tap Refresh.') : G.x('No hay noches con datos.', 'No nights with data.')));
      body.replaceChildren(...nodes); return;
    }
    const nt = state.nights[state.sel], [lab, col] = label(nt.score);
    const circ = 2 * Math.PI * 40;
    const ring = h('div', { class: 'wx-ring' });
    ring.innerHTML = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(150,170,255,.16)" stroke-width="9"/><circle cx="50" cy="50" r="40" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(circ * nt.score / 100).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 50 50)"/><text x="50" y="57" text-anchor="middle" fill="#e9ecfa" font-size="24" font-weight="700">${nt.score}</text></svg>`;
    nodes.push(h('div', { class: 'wx-hero' },
      ring,
      h('div', { class: 'wx-hero-txt' },
        h('div', { class: 'muted small' }, (state.sel === 0 ? (nt.start.getTime() <= Date.now() ? G.x('Esta noche · ', 'Tonight · ') : G.x('Próxima noche · ', 'Next night · ')) : '') + dayName(nt.start)),
        h('div', { class: 'wx-label', style: 'color:' + col }, lab),
        h('div', { class: 'small' }, G.x(`Nubes ${nt.cloud}% · ${Math.round(nt.tmin)}°C · viento ${Math.round(nt.wind)} km/h`, `Cloud ${nt.cloud}% · ${Math.round(nt.tmin)}°C · wind ${Math.round(nt.wind)} km/h`)),
        h('div', { class: 'small' }, G.x('Mejor franja: ', 'Best window: ') + G.fmtTime(nt.best.a) + '–' + G.fmtTime(nt.best.b)))));
    nodes.push(h('p', { class: 'muted small wx-moon' }, moonGlyph(nt.illum) + ' ' + moonText(nt)));
    if (nt.hum >= 85) nodes.push(h('p', { class: 'muted small' }, '💧 ' + G.x(`Humedad alta (${nt.hum}%): posible rocío en la óptica; lleva una funda o un secador.`, `High humidity (${nt.hum}%): dew may form on optics; bring a cover or a dew heater.`)));
    // horas de la noche seleccionada
    const bars = h('div', { class: 'wx-bars' }, h('div', { class: 'wx-sp' }), nt.hours.map(o => {
      const [, c] = label(o.score);
      return h('div', { class: 'wx-col' }, h('div', { class: 'wx-bar' }, h('i', { style: `height:${Math.max(4, o.cloud)}%;background:${c}` })), h('small', null, String(o.t.getHours()).padStart(2, '0')), h('small', { class: 'muted' }, Math.round(o.cloud) + '%'));
    }));
    const row = (name, f) => h('tr', null, h('th', null, name), nt.hours.map(o => h('td', null, f(o))));
    nodes.push(h('div', { class: 'wx-card' }, h('div', { class: 'muted small' }, G.x('Nubosidad por horas (altura = % de cielo cubierto)', 'Hourly cloud cover (height = % of sky covered)')),
      h('div', { class: 'wx-scroll' }, bars, h('table', { class: 'wx-tbl' }, row('°C', o => Math.round(o.temp)), row(G.x('Viento', 'Wind'), o => Math.round(o.wind)), row(G.x('Humed.', 'Humid.'), o => Math.round(o.hum) + '%'), row(G.x('Lluvia', 'Rain'), o => Math.round(o.precip) + '%'), row('☾', o => o.moon > 0 ? '↑' : '·')))));
    // lista de noches
    nodes.push(h('div', { class: 'wx-h' }, G.x('Próximas noches', 'Coming nights')));
    nodes.push(h('div', { class: 'wx-nights' }, state.nights.map((n, i) => {
      const [, c] = label(n.score);
      return h('button', { class: 'wx-night' + (i === state.sel ? ' on' : ''), onclick: () => { state.sel = i; render(); } },
        h('span', { class: 'wx-day' }, dayName(n.start)), h('span', { class: 'wx-sc', style: `background:${c}22;color:${c};border-color:${c}66` }, n.score), h('span', { class: 'muted small' }, `☁ ${n.cloud}%`), h('span', { class: 'muted small' }, moonGlyph(n.illum) + ' ' + Math.round(n.illum * 100) + '%'));
    })));
    nodes.push(h('p', { class: 'muted small' }, G.x('Previsión de Open-Meteo (open-meteo.com). La puntuación combina nubosidad, lluvia, viento, humedad y visibilidad durante las horas de noche astronómica; la Luna se indica aparte. Las previsiones a más de 3 días son orientativas.', 'Forecast from Open-Meteo (open-meteo.com). The score combines cloud, rain, wind, humidity and visibility during astronomical night; the Moon is shown separately. Forecasts beyond 3 days are indicative.')));
    body.replaceChildren(...nodes);
  }

  G.weather = {
    init() { root = G.$('#view-tiempo'); body = h('div', { class: 'wx' }); root.append(h('div', { class: 'scroll' }, body)); render(); },
    show(on) { if (on) load(false); },
    analyse, hourScore
  };
})(window.G);
