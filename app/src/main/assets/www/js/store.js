/* Girounivers · almacenamiento local (IndexedDB), EXIF y fotos */
window.G = window.G || {};
(function (G) {
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const rq = indexedDB.open('girounivers', 1);
      rq.onupgradeneeded = () => {
        const db = rq.result;
        db.createObjectStore('kv');
        const ph = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        ph.createIndex('owner', 'owner');
      };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
    return dbp;
  }
  function tx(store, mode, fn) {
    return open().then(db => new Promise((res, rej) => {
      const t = db.transaction(store, mode), s = t.objectStore(store);
      const r = fn(s);
      t.oncomplete = () => res(r && r.result !== undefined ? r.result : undefined);
      t.onerror = () => rej(t.error);
    }));
  }
  G.kv = {
    get: k => tx('kv', 'readonly', s => s.get(k)),
    set: (k, v) => tx('kv', 'readwrite', s => s.put(v, k))
  };

  // ---- EXIF mínimo: fecha original y GPS ----
  async function readExif(file) {
    const out = {};
    try {
      const buf = await file.slice(0, 262144).arrayBuffer();
      const dv = new DataView(buf);
      if (dv.getUint16(0) !== 0xFFD8) return out;
      let off = 2;
      while (off < dv.byteLength - 4) {
        const marker = dv.getUint16(off), len = dv.getUint16(off + 2);
        if (marker === 0xFFE1 && dv.getUint32(off + 4) === 0x45786966) { parseTiff(dv, off + 10, out); break; }
        if ((marker & 0xFF00) !== 0xFF00) break;
        off += 2 + len;
      }
    } catch (e) { /* sin EXIF */ }
    return out;
  }
  function parseTiff(dv, base, out) {
    const le = dv.getUint16(base) === 0x4949;
    const u16 = o => dv.getUint16(base + o, le), u32 = o => dv.getUint32(base + o, le);
    const ascii = (o, n) => { let s = ''; for (let i = 0; i < n - 1; i++) s += String.fromCharCode(dv.getUint8(base + o + i)); return s; };
    const rat = o => u32(o) / (u32(o + 4) || 1);
    function ifd(o, cb) {
      const n = u16(o);
      for (let i = 0; i < n; i++) {
        const e = o + 2 + i * 12, tag = u16(e), type = u16(e + 2), cnt = u32(e + 4);
        const sz = ({ 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 })[type] || 1;
        const valOff = sz * cnt > 4 ? u32(e + 8) : e + 8;
        cb(tag, type, cnt, valOff, e + 8);
      }
    }
    let exifOff = 0, gpsOff = 0;
    ifd(u32(4), (tag, type, cnt, vo, inl) => { if (tag === 0x8769) exifOff = u32(inl); if (tag === 0x8825) gpsOff = u32(inl); });
    if (exifOff) ifd(exifOff, (tag, type, cnt, vo) => {
      if ((tag === 0x9003 || tag === 0x9004) && type === 2) {
        const m = ascii(vo, cnt).match(/(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)/);
        if (m) out.date = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
      }
    });
    if (gpsOff) {
      let latRef = 'N', lonRef = 'E', lat = null, lon = null;
      ifd(gpsOff, (tag, type, cnt, vo, inl) => {
        if (tag === 1) latRef = String.fromCharCode(dv.getUint8(base + inl));
        if (tag === 3) lonRef = String.fromCharCode(dv.getUint8(base + inl));
        if (tag === 2 && cnt === 3) lat = rat(vo) + rat(vo + 8) / 60 + rat(vo + 16) / 3600;
        if (tag === 4 && cnt === 3) lon = rat(vo) + rat(vo + 8) / 60 + rat(vo + 16) / 3600;
      });
      if (lat != null && lon != null && (lat || lon)) { out.lat = latRef === 'S' ? -lat : lat; out.lon = lonRef === 'W' ? -lon : lon; }
    }
  }

  async function resize(file, max, q) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(file));
      const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', q));
      if (!blob || !blob.size) return null;
      return { blob, w: c.width, h: c.height };
    } catch (e) { return null; }
  }

  // Las imágenes se guardan como bytes (ArrayBuffer) y se muestran como data: URL;
  // así no dependen de Blobs en IndexedDB ni de URLs blob: (que dan problemas en algunos WebView).
  const readAs = (b, how) => new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(f.result); f.onerror = () => rej(f.error || new Error('lectura')); f[how](b); });
  const toBuf = async b => b ? { buf: await readAs(b, 'readAsArrayBuffer'), type: b.type || 'image/jpeg' } : null;
  const asBlob = s => !s ? null : (s instanceof Blob ? s : (s.buf ? new Blob([s.buf], { type: s.type || 'image/jpeg' }) : null));
  const thumbCache = new Map();

  G.photos = {
    readExif,
    async process(file) {
      const exif = await readExif(file);
      const big = await resize(file, 2200, 0.88);
      const th = await resize(file, 360, 0.8);
      const bigBlob = big ? big.blob : file, thBlob = th ? th.blob : bigBlob;
      return {
        blob: bigBlob, thumb: thBlob, w: big ? big.w : 0, h: big ? big.h : 0,
        date: exif.date || (file.lastModified ? new Date(file.lastModified) : new Date()),
        lat: exif.lat, lon: exif.lon, fromExif: !!exif.date
      };
    },
    blobOf(rec, which) { return which === 'thumb' ? (asBlob(rec.th || rec.thumb) || asBlob(rec.img || rec.blob)) : asBlob(rec.img || rec.blob); },
    async dataURL(rec, which) {
      const key = rec.id != null && which === 'thumb' ? rec.id : null;
      if (key != null && thumbCache.has(key)) return thumbCache.get(key);
      const b = G.photos.blobOf(rec, which); if (!b) return '';
      const u = await readAs(b, 'readAsDataURL');
      if (key != null) thumbCache.set(key, u);
      return u;
    },
    async prep(rec) {
      const r = Object.assign({}, rec);
      if (r.blob instanceof Blob) { r.img = await toBuf(r.blob); }
      if (r.thumb instanceof Blob) { r.th = await toBuf(r.thumb); }
      if (r.img || r.th) { delete r.blob; delete r.thumb; }
      return r;
    },
    async add(rec) { const r = await G.photos.prep(rec); delete r.id; return tx('photos', 'readwrite', s => s.add(r)); },
    async put(rec) { const r = await G.photos.prep(rec); thumbCache.delete(r.id); return tx('photos', 'readwrite', s => s.put(r)); },
    del: id => { thumbCache.delete(id); return tx('photos', 'readwrite', s => s.delete(id)); },
    list: owner => tx('photos', 'readonly', s => s.index('owner').getAll(owner)).then(a => (a || []).sort((x, y) => new Date(x.date) - new Date(y.date))),
    all: () => tx('photos', 'readonly', s => s.getAll()),
    clear: () => tx('photos', 'readwrite', s => s.clear()),
    count: owner => tx('photos', 'readonly', s => s.index('owner').count(owner))
  };

  // ---- Copia de seguridad ----
  const dataURLToBlob = async u => (await fetch(u)).blob();
  G.backup = {
    async export() {
      const photos = await G.photos.all();
      const ph = [];
      for (const p of photos) {
        const o = Object.assign({}, p);
        o.blob = await G.photos.dataURL(p, 'full'); o.thumb = await G.photos.dataURL(p, 'thumb');
        delete o.img; delete o.th; ph.push(o);
      }
      const data = { app: 'girounivers', v: 2, date: new Date().toISOString(), kv: { entries: G.entries, challenges: G.challenges, events: G.customEvents, loc: G.loc }, photos: ph };
      const name = 'girounivers-copia-' + new Date().toISOString().slice(0, 10) + '.json';
      await G.saveFile(name, 'application/json', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    },
    async import(file) {
      const data = JSON.parse(await file.text());
      if (data.app !== 'girounivers') throw new Error('Archivo no válido');
      for (const k of ['entries', 'challenges', 'events', 'loc']) if (data.kv[k]) await G.kv.set(k, data.kv[k]);
      await G.photos.clear();
      for (const p of data.photos || []) {
        delete p.id;
        if (p.blob) p.blob = await dataURLToBlob(p.blob);
        if (p.thumb) p.thumb = await dataURLToBlob(p.thumb);
        await G.photos.add(p);
      }
    }
  };
})(window.G);
