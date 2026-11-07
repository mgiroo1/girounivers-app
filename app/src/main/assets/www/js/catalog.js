/* Girounivers · catálogo: fichas editables para rellenar tú mismo */
window.G = window.G || {};
(function (G) {
  const h = G.h;
  const CAT_COLORS = { planeta: '#ffb86b', satelite: '#c9d4ff', estrella: '#fff0a8', constelacion: '#8fb3ff', cometa: '#9ff0ff', objeto: '#ff9fe0', galaxia: '#c39bff', nebulosa: '#ff8fb8', cumulo: '#ffd98a', agujero: '#9aa4c7' };
  const state = { cat: 'todo', q: '', covers: {}, sort: 'tipo', closed: {} };
  let grid, chips, countEl, sortEl;

  G.catalogHas = id => !!G.entries.find(e => e.id === id);
  const save = G.debounce(() => G.kv.set('entries', G.entries), 300);
  const catOf = id => G.CATS.find(c => c.id === id) || G.CATS[G.CATS.length - 1];

  // icono de Saturno (planetas) o glifo de texto (resto)
  let sid = 0;
  G.catIcon = function (cat) {
    const c = catOf(cat);
    if (cat !== 'planeta') return c.icon;
    const id = 'sat' + (sid++), NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 48 48'); svg.setAttribute('class', 'saturn-ico'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs><clipPath id="${id}b"><rect x="0" y="0" width="48" height="24"/></clipPath><clipPath id="${id}f"><rect x="0" y="24" width="48" height="24"/></clipPath></defs>` +
      `<g transform="rotate(-28 24 24)"><ellipse cx="24" cy="24" rx="21" ry="6.2" fill="none" stroke="currentColor" stroke-width="2.2" clip-path="url(#${id}b)"/>` +
      `<circle cx="24" cy="24" r="9.5" fill="currentColor"/><ellipse cx="24" cy="24" rx="21" ry="6.2" fill="none" stroke="#0a0d1f" stroke-width="5.4" clip-path="url(#${id}f)"/>` +
      `<ellipse cx="24" cy="24" rx="21" ry="6.2" fill="none" stroke="currentColor" stroke-width="2.2" clip-path="url(#${id}f)"/></g>`;
    return svg;
  };

  // foto de portada de cada ficha: la elegida por ti (e.cover) o, si no hay, la primera que subiste
  async function loadCovers() {
    state.covers = {};
    let all = [];
    try { all = await G.photos.all(); } catch (e) { console.error(e); return; }
    const by = {};
    all.filter(p => p.owner.startsWith('e:')).sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(p => { (by[p.owner.slice(2)] = by[p.owner.slice(2)] || []).push(p); });
    Object.keys(by).forEach(id => {
      const e = G.entries.find(x => x.id === id);
      state.covers[id] = (e && e.cover != null && by[id].find(p => p.id === e.cover)) || by[id][0];
    });
  }
  async function renderGrid() {
    await loadCovers();
    const q = state.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const isM = state.cat === 'messier';
    let list = G.entries.filter(e => (state.cat === 'todo' || (isM ? e.messier != null : e.cat === state.cat)) && (!q || (G.t(e.name) + ' ' + e.name + ' ' + e.sub).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)));
    const nm = e => G.t(e.name);
    const byName = (a, b) => nm(a).localeCompare(nm(b), G.lang, { sensitivity: 'base', numeric: true });
    const obs = list.filter(e => e.observed).length;
    countEl.textContent = isM ? G.x(obs + ' de ' + list.length + ' objetos Messier observados', obs + ' of ' + list.length + ' Messier objects observed')
      : G.x(list.length + ' fichas · ' + G.entries.filter(e => e.observed).length + ' observadas', list.length + ' entries · ' + G.entries.filter(e => e.observed).length + ' observed');
    function card(e) {
      const cov = state.covers[e.id];
      const el = h('button', { class: 'card' + (cov ? ' has-cover' : ''), style: `background-image:radial-gradient(circle at 70% 25%, ${CAT_COLORS[e.cat]}33, transparent 55%)`, onclick: () => G.openEntry(e.id) },
        e.observed ? h('span', { class: 'badge' }, '✓') : null,
        cov ? null : h('span', { class: 'glyph', style: 'color:' + CAT_COLORS[e.cat] }, G.catIcon(e.cat)),
        h('div', { class: 'card-txt' }, h('b', null, e.name), h('small', null, G.td(e.sub) || catOf(e.cat).name)));
      if (cov) G.photos.dataURL(cov, 'thumb').then(u => { if (u) el.style.backgroundImage = `linear-gradient(180deg,rgba(4,5,12,0) 35%,rgba(4,5,12,.88)),url("${u}")`; }).catch(() => { });
      return el;
    }
    // grupos según el orden elegido
    const groups = [];   // { key, title, items }
    const put = (key, title, e) => { let g = groups.find(x => x.key === key); if (!g) groups.push(g = { key, title, items: [] }); g.items.push(e); };
    let mode = state.sort;
    if (mode === 'tipo') {
      if (isM) { list.sort((a, b) => a.messier - b.messier); put('m', null, null); groups[0].items = list; }
      else { list.sort(byName); G.CATS.forEach(c => list.filter(e => e.cat === c.id).forEach(e => put(c.id, c.name, e))); }
    } else if (mode === 'az') {
      list.sort(byName);
      list.forEach(e => { const L = nm(e).normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase(); const k = /[A-Z]/.test(L) ? L : '#'; put(k, k, e); });
    } else {
      list.sort(isM ? (a, b) => a.messier - b.messier : byName);
      const keyed = list.map(e => ({ e, c: G.conOf(e) }));
      const names = [...new Set(keyed.map(x => x.c))].sort((a, b) => a === G.SOLAR_NAME ? -1 : b === G.SOLAR_NAME ? 1 : a === G.NOCON_NAME ? 1 : b === G.NOCON_NAME ? -1 : G.t(a).localeCompare(G.t(b), G.lang));
      names.forEach(n => keyed.filter(x => x.c === n).forEach(x => put(n, n, x.e)));
    }
    const nodes = [];
    groups.forEach(g => {
      const shut = !!g.title && !q && state.closed[mode + g.key];
      if (g.title) {
        const hd = h('button', { class: 'grp-h' + (shut ? ' shut' : ''), onclick: () => { state.closed[mode + g.key] = !state.closed[mode + g.key]; renderGrid(); } },
          h('span', { class: 'chev' }, shut ? '▸' : '▾'), h('span', null, G.t(g.title)), h('em', null, String(g.items.length)));
        nodes.push(hd);
      }
      if (!shut) g.items.forEach(e => nodes.push(card(e)));
    });
    grid.replaceChildren(...nodes);
    if (!list.length) grid.append(h('div', { class: 'empty' }, 'No hay fichas que coincidan. Pulsa ＋ para crear una.'));
  }

  function field(label, k, e, multi, hint) {
    const el = multi ? h('textarea', { rows: 5, placeholder: hint || '' }, e[k] || '') : h('input', { type: 'text', placeholder: hint || '', value: e[k] || '' });
    el.dataset.k = k;
    return h('label', null, label, el);
  }

  G.openEntry = function (id, create) {
    let e = G.entries.find(x => x.id === id);
    if (!e) {
      if (!create) { G.toast('Esta ficha aún no existe'); return; }
      e = { id, cat: 'objeto', name: id.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()), sub: '', desc: '', info: '', myth: '', size: '', period: '', distSun: '', distLy: '', extra: [], notes: '', observed: false };
      G.entries.push(e); save();
    }
    let edit = !!create;
    const body = h('div', { class: 'entry' });
    const m = G.modal({ title: e.name, full: true, body, onClose: () => { renderGrid(); } });
    const titleEl = G.$('.modal-head h3', m.el);
    function viewKV(label, v) { return v && v.trim() ? h('div', { class: 'kv' }, h('span', { class: 'muted' }, label), h('b', null, G.td(v))) : null; }
    function section(title, text) {
      return h('section', { class: 'sec' }, h('h4', null, title), text && text.trim() ? h('p', { class: 'prose' }, text) : h('p', { class: 'placeholder' }, 'Sin rellenar · pulsa “Editar” para escribir aquí.'));
    }
    function render() {
      titleEl.textContent = G.t(e.name);
      const cat = catOf(e.cat);
      const nodes = [];
      nodes.push(h('div', { class: 'entry-head' },
        h('span', { class: 'glyph big', style: 'color:' + CAT_COLORS[e.cat] }, G.catIcon(e.cat)),
        h('div', null, h('div', { class: 'muted small' }, cat.name), h('div', { class: 'muted' }, G.td(e.sub) || ' '))));
      nodes.push(h('div', { class: 'row-btns' },
        h('button', { class: 'btn small' + (e.observed ? ' primary' : ''), onclick: () => { e.observed = !e.observed; save(); render(); } }, e.observed ? '✓ Observado' : 'Marcar como observado'),
        skyBtn(), edit ? null : h('button', { class: 'btn small', onclick: () => { edit = true; render(); } }, '✎ Editar')));
      nodes.push(h('section', { class: 'sec' }, h('h4', null, 'Fotos'), G.gallery('e:' + e.id, { emptyText: 'Añade fotos tuyas o de referencia', coverId: () => e.cover, onCover: id => { e.cover = id; save(); } })));
      if (!edit) {
        const tx = k => (e.seed && G.lang === 'en' && G.SEEDEN && G.SEEDEN[e.id] && G.SEEDEN[e.id][k]) || e[k];
        nodes.push(section('Descripción', tx('desc')), section('Información', tx('info')), section('Historia y mitología', tx('myth')));
        const kvs = [viewKV('Tamaño', e.size), viewKV('Periodo orbital', e.period), viewKV('Distancia al Sol', e.distSun), viewKV('Distancia en años luz', e.distLy)].concat((e.extra || []).map(x => viewKV(x.k, x.v))).filter(Boolean);
        nodes.push(h('section', { class: 'sec' }, h('h4', null, 'Datos'), kvs.length ? h('div', { class: 'kvs' }, kvs) : h('p', { class: 'placeholder' }, 'Tamaño, periodo orbital, distancia al Sol o años luz… rellénalos en “Editar”.')));
        nodes.push(section('Mis notas', e.notes));
        nodes.push(h('div', { class: 'row-btns end' }, h('button', { class: 'btn danger ghost small', onclick: () => G.confirm(G.x('¿Eliminar la ficha “' + e.name + '”? Sus fotos se mantendrán en tu copia pero ya no se mostrarán.', 'Delete the entry “' + e.name + '”? Its photos stay in your backup but will no longer be shown.'), 'Eliminar', () => { G.entries = G.entries.filter(x => x !== e); save(); m.close(); }) }, 'Eliminar ficha')));
      } else {
        const form = h('div', { class: 'form' },
          h('label', null, 'Nombre', h('input', { type: 'text', 'data-k': 'name', value: e.name })),
          h('label', null, 'Categoría', (() => { const s = h('select', { 'data-k': 'cat' }, G.CATS.map(c => h('option', { value: c.id }, c.name))); s.value = e.cat; return s; })()),
          field('Subtítulo / tipo', 'sub', e, false, 'p. ej. Planeta gaseoso, Estrella gigante azul…'),
          field('Descripción', 'desc', e, true, 'Qué es, cómo se ve, por qué es especial…'),
          field('Información', 'info', e, true, 'Composición, temperatura, curiosidades…'),
          field('Historia y mitología', 'myth', e, true, 'Descubrimiento, culturas, mitos asociados…'),
          field('Tamaño', 'size', e, false, 'p. ej. 12 742 km de diámetro'),
          field('Periodo orbital al Sol', 'period', e, false, 'p. ej. 365,25 días'),
          field('Distancia al Sol (sistema solar)', 'distSun', e, false, 'p. ej. 1 UA · 149,6 millones de km'),
          field('Distancia en años luz (fuera del sistema solar)', 'distLy', e, false, 'p. ej. 8,6 años luz'),
          h('div', { id: 'extra-wrap' }),
          h('button', { class: 'btn small', type: 'button', onclick: () => { addExtra(); } }, '＋ Añadir otro dato'),
          field('Mis notas', 'notes', e, true, 'Tus observaciones personales'));
        const wrap = G.$('#extra-wrap', form);
        const extras = [];
        function addExtra(k, v) {
          const row = h('div', { class: 'row2 extra' }, h('input', { type: 'text', placeholder: 'Nombre (p. ej. Masa)', value: k || '' }), h('input', { type: 'text', placeholder: 'Valor', value: v || '' }), h('button', { type: 'button', class: 'icon-btn', onclick: () => { row.remove(); extras.splice(extras.indexOf(row), 1); } }, '✕'));
          extras.push(row); wrap.append(row);
        }
        (e.extra || []).forEach(x => addExtra(x.k, x.v));
        nodes.push(form);
        nodes.push(h('div', { class: 'row-btns end' },
          h('button', { class: 'btn ghost', onclick: () => { edit = false; render(); } }, 'Cancelar'),
          h('button', { class: 'btn primary', onclick: () => {
            G.$$('[data-k]', form).forEach(i => { e[i.dataset.k] = i.value.trim(); });
            if (!e.name) e.name = 'Sin nombre';
            e.extra = extras.map(r => { const i = G.$$('input', r); return { k: i[0].value.trim(), v: i[1].value.trim() }; }).filter(x => x.k || x.v);
            delete e.seed; save(); edit = false; render(); G.toast('Ficha guardada');
          } }, 'Guardar ficha')));
      }
      body.replaceChildren(...nodes.filter(Boolean));
    }
    function skyBtn() {
      const inSky = (G.starById && G.starById[e.id]) || G.cons.some(c => c.id === e.id) || G.dsos.some(o => o.id === e.id) || Object.values(G.BODY_IDS).includes(e.id);
      const inSolar = G.solar.has(e.id);
      const els = [];
      if (inSky && e.id !== 'tierra') els.push(h('button', { class: 'btn small', onclick: () => { m.close(); G.sky.focusOn(e.id); } }, '✦ Ver en el cielo'));
      if (inSolar) els.push(h('button', { class: 'btn small', onclick: () => { m.close(); G.solar.focusOn(e.id); } }, '◉ Ver en el sistema solar'));
      return els.length ? h('span', { class: 'inline' }, els) : null;
    }
    render();
  };

  G.catalog = {
    async init() {
      try { const s = await G.kv.get('catsort'); if (s === 'az' || s === 'con' || s === 'tipo') state.sort = s; } catch (e) { }
      const root = G.$('#view-catalogo');
      const search = h('input', { type: 'search', placeholder: 'Buscar en el catálogo…', oninput: e => { state.q = e.target.value; renderGrid(); } });
      chips = h('div', { class: 'chips' }, [{ id: 'todo', name: 'Todo' }, { id: 'messier', name: 'Messier' }].concat(G.CATS).map(c => h('button', { class: 'chip' + (c.id === 'todo' ? ' on' : ''), 'data-c': c.id, onclick: ev => { state.cat = c.id; G.$$('.chip', chips).forEach(x => x.classList.toggle('on', x === ev.currentTarget)); renderGrid(); } }, c.name)));
      countEl = h('div', { class: 'muted small count' });
      sortEl = h('div', { class: 'sortbar' }, h('span', { class: 'muted small' }, 'Ordenar'),
        [['tipo', 'Por tipo'], ['az', 'A–Z'], ['con', 'Constelación']].map(([k, n]) => h('button', { class: 'seg' + (k === state.sort ? ' on' : ''), 'data-s': k, onclick: () => { state.sort = k; G.kv.set('catsort', k); G.$$('.seg', sortEl).forEach(x => x.classList.toggle('on', x.dataset.s === k)); renderGrid(); } }, n)));
      grid = h('div', { class: 'grid' });
      const fab = h('button', { class: 'fab', 'aria-label': 'Nueva ficha', onclick: newEntry }, '＋');
      root.append(h('div', { class: 'scroll' }, h('div', { class: 'catalog-top' }, search, chips, sortEl, countEl), grid), fab);
      renderGrid();
    },
    refresh: () => renderGrid(),
    show() { renderGrid(); }
  };

  function newEntry() {
    const name = h('input', { type: 'text', placeholder: 'Nombre (p. ej. Cometa NEOWISE)' });
    const cat = h('select', null, G.CATS.map(c => h('option', { value: c.id }, c.name)));
    if (state.cat !== 'todo' && state.cat !== 'messier') cat.value = state.cat;
    const m = G.modal({
      title: 'Nueva ficha', body: h('div', { class: 'form' }, h('label', null, 'Nombre', name), h('label', null, 'Categoría', cat)),
      actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancelar'),
        h('button', { class: 'btn primary', onclick: () => {
          const n = name.value.trim(); if (!n) { G.toast('Escribe un nombre'); return; }
          let id = G.slug(n) || 'ficha'; while (G.entries.some(x => x.id === id)) id += '-2';
          G.entries.push({ id, cat: cat.value, name: n, sub: '', desc: '', info: '', myth: '', size: '', period: '', distSun: '', distLy: '', extra: [], notes: '', observed: false });
          save(); m.close(); renderGrid(); setTimeout(() => G.openEntry(id), 240);
        } }, 'Crear')]
    });
    setTimeout(() => name.focus(), 260);
  }
})(window.G);
