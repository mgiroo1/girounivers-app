/* Girounivers · notificaciones de la agenda (solo en la app de Android; usa alarmas del sistema, funcionan con la app cerrada) */
window.G = window.G || {};
(function (G) {
  const h = G.h;
  const TYPE_NAMES = { lluvia: ['☄ Lluvias de estrellas', '☄ Meteor showers'], eclipse: ['◐ Eclipses', '◐ Eclipses'], oposicion: ['☍ Oposiciones', '☍ Oppositions'], planeta: ['◉ Conjunciones y elongaciones', '◉ Conjunctions & elongations'],
    posicion: ['⌖ Posiciones relativas', '⌖ Relative positions'], luna: ['☾ Luna (fases y superlunas)', '☾ Moon (phases & supermoons)'], estacion: ['☀ Solsticios y equinoccios', '☀ Solstices & equinoxes'], mio: ['★ Mis eventos', '★ My events'] };
  const DEFAULT = { on: false, when: 'day', types: { lluvia: true, eclipse: true, oposicion: true, planeta: true, estacion: true, mio: true, posicion: false, luna: false } };
  const SHOW_TIME = { lluvia: 1, luna: 1, planeta: 1, oposicion: 1, posicion: 1, mio: 1 };
  let cfg = JSON.parse(JSON.stringify(DEFAULT));
  const native = () => !!(window.GuNotify && window.GuNotify.schedule);

  const save = () => { try { G.kv.set('notif', cfg); } catch (e) { } };
  // hora a la que se avisa de un evento
  function whenOf(t, mode) {
    const d = new Date(t), night = d.getHours() < 6;           // un evento de madrugada se avisa la tarde anterior
    const base = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (night ? 1 : 0), 0, 0, 0, 0);
    if (mode === 'hour') return t.getTime() - 3600000;
    if (mode === 'eve') { base.setDate(base.getDate() - 1); base.setHours(20, 0, 0, 0); return base.getTime(); }
    base.setHours(18, 0, 0, 0); return Math.min(base.getTime(), t.getTime() - 2 * 3600000);
  }
  function build() {
    const now = Date.now(), list = [];
    const evs = G.agenda && G.agenda.all ? G.agenda.all() : [];
    evs.forEach(e => {
      if (!cfg.types[e.type]) return;
      const w = whenOf(e.t, cfg.when); if (w <= now + 60000 || e.t.getTime() < now) return;
      const when = SHOW_TIME[e.type] ? G.fmtDate(e.t) + ' · ' + G.fmtTime(e.t) : G.fmtDate(e.t);
      const desc = String(e.desc || '').replace(/\s+/g, ' ').slice(0, 170);
      list.push({ when: w, title: (e.type === 'mio' ? '★ ' : '') + e.title, text: when + (desc ? ' — ' + desc : '') });
    });
    list.sort((a, b) => a.when - b.when);
    return list.slice(0, 60).map((o, i) => Object.assign({ id: 100000 + i }, o));
  }
  function sync() {
    if (!native()) return 0;
    try {
      if (!cfg.on || !window.GuNotify.canNotify()) { window.GuNotify.cancelAll(); return 0; }
      const l = build(); window.GuNotify.schedule(JSON.stringify(l)); return l.length;
    } catch (e) { console.error(e); return 0; }
  }
  window.GUnotif = { perm(ok) { if (ok) { G.toast(G.x('Notificaciones activadas', 'Notifications enabled')); sync(); } else { cfg.on = false; save(); G.toast(G.x('Sin permiso de notificaciones. Actívalo en los ajustes del móvil.', 'No notification permission. Enable it in the phone settings.'), 5000); } G.notify.refreshPanel && G.notify.refreshPanel(); } };

  G.notify = {
    async init() { try { const c = await G.kv.get('notif'); if (c) cfg = Object.assign({}, DEFAULT, c, { types: Object.assign({}, DEFAULT.types, c.types || {}) }); } catch (e) { } },
    sync, build, cfg: () => cfg,
    panel() {
      const box = h('div', { class: 'form notif-panel' });
      const render = () => {
        if (!native()) { box.replaceChildren(h('p', { class: 'muted small' }, G.x('Las notificaciones solo funcionan en la app de Android.', 'Notifications only work in the Android app.'))); return; }
        const sw = h('input', { type: 'checkbox', checked: cfg.on ? 'checked' : null, onchange: e => {
          cfg.on = e.target.checked; save();
          if (cfg.on && !window.GuNotify.canNotify()) window.GuNotify.requestPermission(); else { const n = sync(); G.toast(cfg.on ? G.x(`${n} avisos programados`, `${n} reminders scheduled`) : G.x('Avisos desactivados', 'Reminders off')); }
          render();
        } });
        const when = h('select', { onchange: e => { cfg.when = e.target.value; save(); sync(); } },
          [['day', G.x('El mismo día, a las 18:00', 'Same day, at 18:00')], ['eve', G.x('La víspera, a las 20:00', 'The evening before, at 20:00')], ['hour', G.x('1 hora antes', '1 hour before')]].map(([v, n]) => h('option', { value: v }, n)));
        when.value = cfg.when;
        const types = Object.keys(TYPE_NAMES).map(k => h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: cfg.types[k] ? 'checked' : null, onchange: e => { cfg.types[k] = e.target.checked; save(); sync(); } }), ' ' + G.x(TYPE_NAMES[k][0], TYPE_NAMES[k][1])));
        box.replaceChildren(...[
          h('label', { class: 'chk big' }, sw, ' ' + G.x('Avisarme de los eventos de la agenda', 'Notify me about agenda events')),
          cfg.on ? h('div', { class: 'form' }, h('label', null, G.x('Cuándo avisar', 'When to notify'), when), h('div', { class: 'muted small' }, G.x('De qué eventos', 'Which events')), ...types,
            h('p', { class: 'muted small' }, G.x('Se programan los 60 avisos más próximos y se actualizan cada vez que abres la app. Si el móvil ahorra batería, la hora puede variar unos minutos.', 'The 60 nearest reminders are scheduled and refreshed each time you open the app. If the phone is saving battery, timing may vary by a few minutes.')),
            h('button', { class: 'btn small', onclick: () => window.GuNotify.test('Girounivers', G.x('Así se verán los avisos de la agenda ✨', 'This is how agenda reminders will look ✨')) }, G.x('Enviar notificación de prueba', 'Send a test notification'))) : null].filter(Boolean));
      };
      G.notify.refreshPanel = render; render(); return box;
    }
  };
})(window.G);
