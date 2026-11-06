/* Girounivers · retos de astrofotografía */
window.G = window.G || {};
(function (G) {
  const h = G.h;
  const LVL = { 1: 'Fácil', 2: 'Medio', 3: 'Difícil' };
  const state = { f: 'todos', open: null, counts: {} };
  let list, sumEl, chips;
  const save = G.debounce(() => G.kv.set('challenges', G.challenges), 300);

  async function loadCounts() {
    const all = await G.photos.all(); state.counts = {}; state.last = {};
    all.filter(p => p.owner.startsWith('c:')).forEach(p => {
      const id = p.owner.slice(2); state.counts[id] = (state.counts[id] || 0) + 1;
      if (!state.last[id] || new Date(p.date) > new Date(state.last[id].date)) state.last[id] = p;
    });
  }

  async function render() {
    await loadCounts();
    const total = G.challenges.length, done = G.challenges.filter(c => state.counts[c.id]).length;
    sumEl.replaceChildren(
      h('div', { class: 'ring', style: `--p:${total ? done / total * 100 : 0}` }, h('b', null, done + '/' + total)),
      h('div', null, h('div', { class: 'sky-info-title' }, done === total && total ? '¡Todos los retos completados!' : 'Tu progreso'),
        h('div', { class: 'muted small' }, 'Sube al menos una foto a un reto para completarlo.')));
    const f = state.f;
    const items = G.challenges.filter(c => f === 'todos' || (f === 'pendientes' && !state.counts[c.id]) || (f === 'hechos' && state.counts[c.id]) || (['1', '2', '3'].includes(f) && String(c.lvl) === f));
    list.replaceChildren(...items.map(card));
    if (!items.length) list.append(h('div', { class: 'empty' }, 'Nada por aquí todavía.'));
  }

  function card(c) {
    const n = state.counts[c.id] || 0, open = state.open === c.id;
    const el = h('div', { class: 'chal' + (n ? ' done' : '') + (open ? ' open' : '') },
      h('button', { class: 'chal-head', onclick: () => { state.open = open ? null : c.id; render(); } },
        h('span', { class: 'check' }, n ? '✓' : ''),
        h('div', { class: 'chal-title' }, h('b', null, c.title), h('small', { class: 'muted' }, LVL[c.lvl] + (n ? ' · ' + n + (n === 1 ? ' foto' : ' fotos') : ''))),
        h('span', { class: 'stars lv' + c.lvl }, '★'.repeat(c.lvl)), h('span', { class: 'chev' }, open ? '▾' : '▸')));
    if (open) {
      const body = h('div', { class: 'chal-body' },
        h('p', null, c.how), c.tip ? h('p', { class: 'tip' }, '💡 ', c.tip) : null,
        G.gallery('c:' + c.id, { emptyText: 'Aún sin fotos — ¡sube la primera!', onChange: () => { loadCounts().then(updateHead); } }));
      if (!c.seed) body.append(h('div', { class: 'row-btns end' }, h('button', { class: 'btn danger ghost small', onclick: () => G.confirm('¿Eliminar este reto?', 'Eliminar', () => { G.challenges = G.challenges.filter(x => x !== c); save(); state.open = null; render(); }) }, 'Eliminar reto')));
      el.append(body);
    }
    return el;
  }
  // refresca solo la cabecera y contadores sin cerrar la tarjeta abierta
  function updateHead() {
    const total = G.challenges.length, done = G.challenges.filter(c => state.counts[c.id]).length;
    const ring = G.$('.ring', sumEl); if (ring) { ring.style.setProperty('--p', total ? done / total * 100 : 0); ring.firstChild.textContent = done + '/' + total; }
    G.$$('.chal', list).forEach((el, i) => {
      const id = state.open; if (!el.classList.contains('open')) return;
      const n = state.counts[id] || 0; el.classList.toggle('done', !!n);
      G.$('.check', el).textContent = n ? '✓' : '';
      G.$('.chal-title small', el).textContent = LVL[G.challenges.find(c => c.id === id).lvl] + (n ? ' · ' + n + (n === 1 ? ' foto' : ' fotos') : '');
    });
  }

  G.challengesUI = {
    init() {
      const root = G.$('#view-retos');
      sumEl = h('div', { class: 'summary' });
      chips = h('div', { class: 'chips' }, [['todos', 'Todos'], ['pendientes', 'Pendientes'], ['hechos', 'Hechos'], ['1', '★ Fácil'], ['2', '★★ Medio'], ['3', '★★★ Difícil']].map(([k, n]) =>
        h('button', { class: 'chip' + (k === 'todos' ? ' on' : ''), onclick: ev => { state.f = k; G.$$('.chip', chips).forEach(x => x.classList.toggle('on', x === ev.currentTarget)); render(); } }, n)));
      list = h('div', { class: 'chal-list' });
      const fab = h('button', { class: 'fab', 'aria-label': 'Nuevo reto', onclick: newChallenge }, '＋');
      root.append(h('div', { class: 'scroll' }, h('div', { class: 'catalog-top' }, sumEl, chips), list), fab);
      render();
    },
    show() { render(); }
  };

  function newChallenge() {
    const t = h('input', { type: 'text', placeholder: 'Título del reto' });
    const d = h('textarea', { rows: 3, placeholder: 'Descripción: qué quieres fotografiar' });
    const tip = h('input', { type: 'text', placeholder: 'Consejo (opcional)' });
    const l = h('select', null, [1, 2, 3].map(i => h('option', { value: i }, LVL[i]))); l.value = 2;
    const m = G.modal({
      title: 'Nuevo reto', body: h('div', { class: 'form' }, h('label', null, 'Título', t), h('label', null, 'Descripción', d), h('label', null, 'Consejo', tip), h('label', null, 'Dificultad', l)),
      actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancelar'),
        h('button', { class: 'btn primary', onclick: () => {
          if (!t.value.trim()) { G.toast('Pon un título'); return; }
          let id = 'mi-' + (G.slug(t.value) || 'reto'); while (G.challenges.some(x => x.id === id)) id += '-2';
          G.challenges.push({ id, lvl: +l.value, title: t.value.trim(), how: d.value.trim(), tip: tip.value.trim() });
          save(); state.open = id; m.close(); render();
        } }, 'Crear reto')]
    });
  }
})(window.G);
