/* Girounivers · catálogo: fichas editables para rellenar tú mismo */
window.G = window.G || {};
(function (G) {
  const h = G.h;
  const CAT_COLORS = { planeta: '#ffb86b', satelite: '#c9d4ff', estrella: '#fff0a8', constelacion: '#8fb3ff', cometa: '#9ff0ff', objeto: '#ff9fe0', galaxia: '#c39bff' };
  const state = { cat: 'todo', q: '', covers: {} };
  let grid, chips, countEl;

  G.catalogHas = id => !!G.entries.find(e => e.id === id);
  const save = G.debounce(() => G.kv.set('entries', G.entries), 300);
  const catOf = id => G.CATS.find(c => c.id === id) || G.CATS[5];
  const filled = e => ['desc', 'info', 'myth', 'size', 'period', 'distSun', 'distLy'].filter(k => e[k] && e[k].trim()).length;

  async function loadCovers() {
    const all = await G.photos.all(); state.covers = {};
    all.filter(p => p.owner.startsWith('e:')).sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(p => { const id = p.owner.slice(2); if (!state.covers[id]) state.covers[id] = p.thumb; });
  }
  let urls = [];
  async function renderGrid() {
    await loadCovers();
    urls.forEach(u => URL.revokeObjectURL(u)); urls = [];
    const q = state.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const list = G.entries.filter(e => (state.cat === 'todo' || e.cat === state.cat) && (!q || (e.name + ' ' + e.sub).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)));
    countEl.textContent = list.length + ' fichas · ' + G.entries.filter(e => e.observed).length + ' observadas';
    grid.replaceChildren(...list.map(e => {
      const cov = state.covers[e.id]; let style = '';
      if (cov) { const u = URL.createObjectURL(cov); urls.push(u); style = `background-image:linear-gradient(180deg,rgba(4,5,12,0) 30%,rgba(4,5,12,.85)),url(${u})`; }
      else style = `background-image:radial-gradient(circle at 70% 25%, ${CAT_COLORS[e.cat]}33, transparent 55%)`;
      const f = filled(e);
      return h('button', { class: 'card', style, onclick: () => G.openEntry(e.id) },
        e.observed ? h('span', { class: 'badge' }, '✓') : null,
        cov ? null : h('span', { class: 'glyph', style: 'color:' + CAT_COLORS[e.cat] }, catOf(e.cat).icon),
        h('div', { class: 'card-txt' }, h('b', null, e.name), h('small', null, e.sub || catOf(e.cat).name),
          h('div', { class: 'dots' }, [0, 1, 2, 3, 4].map(i => h('i', { class: i < Math.ceil(f / 7 * 5) ? 'on' : '' })))));
    }));
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
    function viewKV(label, v) { return v && v.trim() ? h('div', { class: 'kv' }, h('span', { class: 'muted' }, label), h('b', null, v)) : null; }
    function section(title, text) {
      return h('section', { class: 'sec' }, h('h4', null, title), text && text.trim() ? h('p', { class: 'prose' }, text) : h('p', { class: 'placeholder' }, 'Sin rellenar · pulsa “Editar” para escribir aquí.'));
    }
    function render() {
      titleEl.textContent = e.name;
      const cat = catOf(e.cat);
      const nodes = [];
      nodes.push(h('div', { class: 'entry-head' },
        h('span', { class: 'glyph big', style: 'color:' + CAT_COLORS[e.cat] }, cat.icon),
        h('div', null, h('div', { class: 'muted small' }, cat.name), h('div', { class: 'muted' }, e.sub || ' '))));
      nodes.push(h('div', { class: 'row-btns' },
        h('button', { class: 'btn small' + (e.observed ? ' primary' : ''), onclick: () => { e.observed = !e.observed; save(); render(); } }, e.observed ? '✓ Observado' : 'Marcar como observado'),
        skyBtn(), edit ? null : h('button', { class: 'btn small', onclick: () => { edit = true; render(); } }, '✎ Editar')));
      nodes.push(h('section', { class: 'sec' }, h('h4', null, 'Fotos'), G.gallery('e:' + e.id, { emptyText: 'Añade fotos tuyas o de referencia' })));
      if (!edit) {
        nodes.push(section('Descripción', e.desc), section('Información', e.info), section('Historia y mitología', e.myth));
        const kvs = [viewKV('Tamaño', e.size), viewKV('Periodo orbital', e.period), viewKV('Distancia al Sol', e.distSun), viewKV('Distancia en años luz', e.distLy)].concat((e.extra || []).map(x => viewKV(x.k, x.v))).filter(Boolean);
        nodes.push(h('section', { class: 'sec' }, h('h4', null, 'Datos'), kvs.length ? h('div', { class: 'kvs' }, kvs) : h('p', { class: 'placeholder' }, 'Tamaño, periodo orbital, distancia al Sol o años luz… rellénalos en “Editar”.')));
        nodes.push(section('Mis notas', e.notes));
        nodes.push(h('div', { class: 'row-btns end' }, h('button', { class: 'btn danger ghost small', onclick: () => G.confirm('¿Eliminar la ficha “' + e.name + '”? Sus fotos se mantendrán en tu copia pero ya no se mostrarán.', 'Eliminar', () => { G.entries = G.entries.filter(x => x !== e); save(); m.close(); }) }, 'Eliminar ficha')));
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
      const inSolar = ['sol', 'mercurio', 'venus', 'tierra', 'marte', 'jupiter', 'saturno', 'urano', 'neptuno'].includes(e.id);
      const els = [];
      if (inSky && e.id !== 'tierra') els.push(h('button', { class: 'btn small', onclick: () => { m.close(); G.sky.focusOn(e.id); } }, '✦ Ver en el cielo'));
      if (inSolar) els.push(h('button', { class: 'btn small', onclick: () => { m.close(); G.solar.focusOn(e.id); } }, '◉ Ver en el sistema solar'));
      return els.length ? h('span', { class: 'inline' }, els) : null;
    }
    render();
  };

  G.catalog = {
    init() {
      const root = G.$('#view-catalogo');
      const search = h('input', { type: 'search', placeholder: 'Buscar en el catálogo…', oninput: e => { state.q = e.target.value; renderGrid(); } });
      chips = h('div', { class: 'chips' }, [{ id: 'todo', name: 'Todo' }].concat(G.CATS).map(c => h('button', { class: 'chip' + (c.id === 'todo' ? ' on' : ''), 'data-c': c.id, onclick: ev => { state.cat = c.id; G.$$('.chip', chips).forEach(x => x.classList.toggle('on', x === ev.currentTarget)); renderGrid(); } }, c.name)));
      countEl = h('div', { class: 'muted small count' });
      grid = h('div', { class: 'grid' });
      const fab = h('button', { class: 'fab', 'aria-label': 'Nueva ficha', onclick: newEntry }, '＋');
      root.append(h('div', { class: 'scroll' }, h('div', { class: 'catalog-top' }, search, chips, countEl), grid), fab);
      renderGrid();
    },
    refresh: () => renderGrid(),
    show() { renderGrid(); }
  };

  function newEntry() {
    const name = h('input', { type: 'text', placeholder: 'Nombre (p. ej. Cometa NEOWISE)' });
    const cat = h('select', null, G.CATS.map(c => h('option', { value: c.id }, c.name)));
    if (state.cat !== 'todo') cat.value = state.cat;
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
