/* Girounivers · utilidades de interfaz */
window.G = window.G || {};
(function (G) {
  G.$ = (s, r) => (r || document).querySelector(s);
  G.$$ = (s, r) => [...(r || document).querySelectorAll(s)];
  G.h = function (tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'value') e.value = v;
      else if (v === true) e.setAttribute(k, '');
      else e.setAttribute(k, v);
    }
    for (const c of kids.flat(3)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
    return e;
  };
  const h = G.h;

  // Pila para el botón “atrás” de Android
  G.backStack = [];
  G.back = function () {
    const f = G.backStack.pop();
    if (f) { f(); return true; }
    return false;
  };

  G.toast = function (msg, ms) {
    let t = G.$('#toast');
    if (!t) { t = h('div', { id: 'toast' }); document.body.append(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(G._tt); G._tt = setTimeout(() => t.classList.remove('show'), ms || 2600);
  };

  // Modal tipo hoja inferior
  G.modal = function (opts) {
    const back = h('div', { class: 'modal-back' });
    const sheet = h('div', { class: 'modal' + (opts.full ? ' full' : '') });
    const head = h('div', { class: 'modal-head' }, h('h3', null, opts.title || ''), h('button', { class: 'icon-btn', 'aria-label': 'Cerrar', onclick: () => close() }, '✕'));
    const body = h('div', { class: 'modal-body' });
    if (opts.body) body.append(opts.body);
    sheet.append(head, body);
    if (opts.actions) sheet.append(h('div', { class: 'modal-actions' }, opts.actions));
    back.append(sheet);
    document.body.append(back);
    requestAnimationFrame(() => back.classList.add('open'));
    let closed = false;
    const guard = () => { if (opts.onBack) { opts.onBack(); } else close(true); };
    G.backStack.push(guard);
    function close(fromBack) {
      if (closed) return; closed = true;
      if (!fromBack) { const i = G.backStack.lastIndexOf(guard); if (i >= 0) G.backStack.splice(i, 1); }
      back.classList.remove('open');
      setTimeout(() => back.remove(), 220);
      if (opts.onClose) opts.onClose();
    }
    back.addEventListener('pointerdown', e => { if (e.target === back) close(); });
    return { close, el: sheet, body };
  };

  G.confirm = function (msg, okText, cb) {
    const m = G.modal({
      title: 'Confirmar', body: h('p', { class: 'muted' }, msg),
      actions: [h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancelar'),
        h('button', { class: 'btn danger', onclick: () => { m.close(); cb(); } }, okText || 'Aceptar')]
    });
  };

  const pad = n => String(n).padStart(2, '0');
  G.pad = pad;
  G.toLocalInput = function (d) { d = d instanceof Date ? d : new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  G.fmtDate = function (d, withTime) {
    d = d instanceof Date ? d : new Date(d);
    if (isNaN(d)) return '';
    const o = { day: 'numeric', month: 'short', year: 'numeric' };
    if (withTime) { o.hour = '2-digit'; o.minute = '2-digit'; }
    return d.toLocaleString('es-ES', o);
  };
  G.fmtTime = d => d ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '—';
  G.fmtNum = (n, dec) => Number(n).toLocaleString('es-ES', { maximumFractionDigits: dec == null ? 1 : dec });

  // Guardar archivos (puente nativo en Android; descarga normal en navegador)
  G.saveFile = async function (name, mime, blob) {
    if (window.GuFile) {
      try {
        GuFile.open(name, mime);
        const CH = 3 * 256 * 1024; // múltiplo de 3 para base64 sin relleno intermedio
        for (let o = 0; o < blob.size; o += CH) {
          const buf = new Uint8Array(await blob.slice(o, o + CH).arrayBuffer());
          let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
          GuFile.write(btoa(s));
        }
        const where = GuFile.close();
        G.toast('Guardado en Descargas: ' + name);
        return where;
      } catch (e) { console.error(e); G.toast('No se pudo guardar el archivo'); return null; }
    }
    const a = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    return name;
  };

  G.debounce = (f, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };
})(window.G);
