/* Girounivers · motor astronómico (efemérides simplificadas, precisión ~ minutos de arco) */
window.G = window.G || {};
(function (G) {
  const RAD = Math.PI / 180, DEG = 180 / Math.PI;
  const sin = a => Math.sin(a * RAD), cos = a => Math.cos(a * RAD);
  const norm = a => ((a % 360) + 360) % 360;
  const norm180 = a => { a = norm(a); return a > 180 ? a - 360 : a; };

  // [N0,N1, i0,i1, w0,w1, a0,a1, e0,e1, M0,M1]  (d = días desde 2000 Jan 0.0)
  const EL = {
    sun:     [0, 0, 0, 0, 282.9404, 4.70935e-5, 1, 0, 0.016709, -1.151e-9, 356.0470, 0.9856002585],
    moon:    [125.1228, -0.0529538083, 5.1454, 0, 318.0634, 0.1643573223, 60.2666, 0, 0.0549, 0, 115.3654, 13.0649929509],
    mercury: [48.3313, 3.24587e-5, 7.0047, 5.00e-8, 29.1241, 1.01444e-5, 0.387098, 0, 0.205635, 5.59e-10, 168.6562, 4.0923344368],
    venus:   [76.6799, 2.46590e-5, 3.3946, 2.75e-8, 54.8910, 1.38374e-5, 0.723330, 0, 0.006773, -1.302e-9, 48.0052, 1.6021302244],
    mars:    [49.5574, 2.11081e-5, 1.8497, -1.78e-8, 286.5016, 2.92961e-5, 1.523688, 0, 0.093405, 2.516e-9, 18.6021, 0.5240207766],
    jupiter: [100.4542, 2.76854e-5, 1.3030, -1.557e-7, 273.8777, 1.64505e-5, 5.20256, 0, 0.048498, 4.469e-9, 19.8950, 0.0830853001],
    saturn:  [113.6634, 2.38980e-5, 2.4886, -1.081e-7, 339.3939, 2.97661e-5, 9.55475, 0, 0.055546, -9.499e-9, 316.9670, 0.0334442282],
    uranus:  [74.0005, 1.3978e-5, 0.7733, 1.9e-8, 96.6612, 3.0565e-5, 19.18171, -1.55e-8, 0.047318, 7.45e-9, 142.5905, 0.011725806],
    neptune: [131.7806, 3.0173e-5, 1.7700, -2.55e-7, 272.8461, -6.027e-6, 30.05826, 3.313e-8, 0.008606, 2.15e-9, 260.2471, 0.005995147],
    // planetas enanos (elementos medios en J2000, sin variación secular: precisión de unos grados)
    ceres:   [80.27, 0, 10.59, 0, 73.60, 0, 2.7675, 0, 0.0758, 0, 95.67, 0.21421],
    pluto:   [110.30, 0, 17.14, 0, 113.76, 0, 39.4817, 0, 0.2488, 0, 14.85, 0.003975]
  };
  const PLANETS = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

  const A = {
    RAD, DEG, norm, norm180, PLANETS,
    jd(date) { return (date instanceof Date ? date.getTime() : date) / 86400000 + 2440587.5; },
    d(date) { return A.jd(date) - 2451543.5; },
    dateFromD(d) { return new Date((d + 2451543.5 - 2440587.5) * 86400000); }
  };

  function elems(name, d) {
    const e = EL[name];
    return { N: e[0] + e[1] * d, i: e[2] + e[3] * d, w: e[4] + e[5] * d, a: e[6] + e[7] * d, e: e[8] + e[9] * d, M: norm(e[10] + e[11] * d) };
  }
  function kepler(M, e) {
    let E = M + DEG * e * sin(M) * (1 + e * cos(M));
    for (let k = 0; k < 8; k++) {
      const dE = (E - DEG * e * sin(E) - M) / (1 - e * cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-7) break;
    }
    return E;
  }
  // posición orbital desde E (grados) → heliocéntrica eclíptica
  function fromE(el, E) {
    const xv = el.a * (cos(E) - el.e), yv = el.a * Math.sqrt(1 - el.e * el.e) * sin(E);
    const v = norm(Math.atan2(yv, xv) * DEG), r = Math.hypot(xv, yv);
    const vw = v + el.w;
    return {
      r, v,
      x: r * (cos(el.N) * cos(vw) - sin(el.N) * sin(vw) * cos(el.i)),
      y: r * (sin(el.N) * cos(vw) + cos(el.N) * sin(vw) * cos(el.i)),
      z: r * sin(vw) * sin(el.i)
    };
  }
  function eclToEq(x, y, z, d) {
    const ecl = 23.4393 - 3.563e-7 * d;
    const xe = x, ye = y * cos(ecl) - z * sin(ecl), ze = y * sin(ecl) + z * cos(ecl);
    return { ra: norm(Math.atan2(ye, xe) * DEG), dec: Math.atan2(ze, Math.hypot(xe, ye)) * DEG };
  }

  function sunGeo(d) {
    const el = elems('sun', d), p = fromE(el, kepler(el.M, el.e));
    const lon = norm(p.v + el.w);
    const x = p.r * cos(lon), y = p.r * sin(lon);
    const q = eclToEq(x, y, 0, d);
    return { x, y, z: 0, lon, lat: 0, dist: p.r, ra: q.ra, dec: q.dec, Ls: norm(el.M + el.w) };
  }

  function moonGeo(d) {
    const el = elems('moon', d), s = elems('sun', d);
    const p = fromE(el, kepler(el.M, el.e));
    let lon = Math.atan2(p.y, p.x) * DEG, lat = Math.atan2(p.z, Math.hypot(p.x, p.y)) * DEG, r = p.r;
    const Ms = s.M, Mm = el.M, Ls = norm(s.M + s.w), Lm = norm(el.M + el.w + el.N);
    const D = Lm - Ls, F = Lm - el.N;
    lon += -1.274 * sin(Mm - 2 * D) + 0.658 * sin(2 * D) - 0.186 * sin(Ms) - 0.059 * sin(2 * Mm - 2 * D) - 0.057 * sin(Mm - 2 * D + Ms) +
      0.053 * sin(Mm + 2 * D) + 0.046 * sin(2 * D - Ms) + 0.041 * sin(Mm - Ms) - 0.035 * sin(D) - 0.031 * sin(Mm + Ms) -
      0.015 * sin(2 * F - 2 * D) + 0.011 * sin(Mm - 4 * D);
    lat += -0.173 * sin(F - 2 * D) - 0.055 * sin(Mm - F - 2 * D) - 0.046 * sin(Mm + F - 2 * D) + 0.033 * sin(F + 2 * D) + 0.017 * sin(2 * Mm + F);
    r += -0.58 * cos(Mm - 2 * D) - 0.46 * cos(2 * D);
    lon = norm(lon);
    const x = r * cos(lat) * cos(lon), y = r * cos(lat) * sin(lon), z = r * sin(lat);
    const q = eclToEq(x, y, z, d);
    return { x, y, z, lon, lat, dist: r, distKm: r * 6371, ra: q.ra, dec: q.dec };
  }

  function planetGeo(name, d, sun) {
    const el = elems(name, d);
    const E = kepler(el.M, el.e);
    const p = fromE(el, E);
    let lonH = Math.atan2(p.y, p.x) * DEG, latH = Math.atan2(p.z, Math.hypot(p.x, p.y)) * DEG, r = p.r;
    if (name === 'jupiter' || name === 'saturn' || name === 'uranus') {
      const Mj = elems('jupiter', d).M, Ms = elems('saturn', d).M, Mu = elems('uranus', d).M;
      if (name === 'jupiter') lonH += -0.332 * sin(2 * Mj - 5 * Ms - 67.6) - 0.056 * sin(2 * Mj - 2 * Ms + 21) + 0.042 * sin(3 * Mj - 5 * Ms + 21) -
        0.036 * sin(Mj - 2 * Ms) + 0.022 * cos(Mj - Ms) + 0.023 * sin(2 * Mj - 3 * Ms + 52) - 0.016 * sin(Mj - 5 * Ms - 69);
      if (name === 'saturn') {
        lonH += 0.812 * sin(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sin(Mj - 2 * Ms - 3) + 0.046 * sin(2 * Mj - 6 * Ms - 69) + 0.014 * sin(Mj - 3 * Ms + 32);
        latH += -0.020 * cos(2 * Mj - 4 * Ms - 2) + 0.018 * sin(2 * Mj - 6 * Ms - 49);
      }
      if (name === 'uranus') lonH += 0.040 * sin(Ms - 2 * Mu + 6) + 0.035 * sin(Ms - 3 * Mu + 33) - 0.015 * sin(Mj - Mu + 20);
    }
    const xh = r * cos(latH) * cos(lonH), yh = r * cos(latH) * sin(lonH), zh = r * sin(latH);
    const xg = xh + sun.x, yg = yh + sun.y, zg = zh;
    const dist = Math.sqrt(xg * xg + yg * yg + zg * zg);
    const q = eclToEq(xg, yg, zg, d);
    const lon = norm(Math.atan2(yg, xg) * DEG), lat = Math.atan2(zg, Math.hypot(xg, yg)) * DEG;
    // magnitud aproximada
    const FV = Math.acos(Math.max(-1, Math.min(1, (r * r + dist * dist - sun.dist * sun.dist) / (2 * r * dist)))) * DEG;
    const lg = 5 * Math.log10(r * dist);
    const mag = ({
      mercury: -0.36 + lg + 0.027 * FV + 2.2e-13 * Math.pow(FV, 6),
      venus: -4.34 + lg + 0.013 * FV + 4.2e-7 * Math.pow(FV, 3),
      mars: -1.51 + lg + 0.016 * FV,
      jupiter: -9.25 + lg + 0.014 * FV,
      saturn: -8.9 + lg + 0.044 * FV,
      uranus: -7.15 + lg + 0.001 * FV,
      neptune: -6.90 + lg + 0.001 * FV
    })[name];
    return { x: xh, y: yh, z: zh, r, lon, lat, dist, ra: q.ra, dec: q.dec, mag, phaseAngle: FV, helioLon: norm(lonH) };
  }

  // Todos los cuerpos de golpe
  A.bodies = function (date) {
    const d = typeof date === 'number' && date < 1e6 ? date : A.d(date);
    const sun = sunGeo(d);
    const out = { d, sun: Object.assign({ mag: -26.7 }, sun), moon: Object.assign({ mag: -12.6 }, moonGeo(d)) };
    PLANETS.forEach(n => { out[n] = planetGeo(n, d, sun); });
    out.earth = { x: -sun.x, y: -sun.y, z: 0, r: sun.dist };
    // fase de la Luna
    const elong = norm(out.moon.lon - sun.lon);
    const phaseAngle = 180 - elong; // aprox.
    out.moon.elong = elong;
    out.moon.illum = (1 - cos(elong)) / 2;
    out.moon.phaseName = A.phaseName(elong);
    return out;
  };
  A.phaseName = function (elong) {
    if (elong < 11.25 || elong >= 348.75) return 'Luna nueva';
    if (elong < 78.75) return 'Creciente';
    if (elong < 101.25) return 'Cuarto creciente';
    if (elong < 168.75) return 'Gibosa creciente';
    if (elong < 191.25) return 'Luna llena';
    if (elong < 258.75) return 'Gibosa menguante';
    if (elong < 281.25) return 'Cuarto menguante';
    return 'Menguante';
  };

  // órbita (para dibujar): puntos heliocéntricos eclípticos
  A.orbit = function (name, d, n) {
    n = n || 180;
    const pts = [];
    if (name === 'earth') {
      const el = elems('sun', d);
      for (let k = 0; k <= n; k++) { const p = fromE(el, k * 360 / n); const lon = norm(p.v + el.w + 180); pts.push({ x: p.r * cos(lon), y: p.r * sin(lon) }); }
      return pts;
    }
    const el = elems(name, d);
    for (let k = 0; k <= n; k++) { const p = fromE(el, k * 360 / n); pts.push({ x: p.x, y: p.y, z: p.z }); }
    return pts;
  };
  A.helio = function (name, d) { const el = elems(name, d); const p = fromE(el, kepler(el.M, el.e)); return { x: p.x, y: p.y, z: p.z, r: p.r }; };
  A.orbitInfo = function (name, d) { const el = elems(name === 'earth' ? 'sun' : name, d); return { a: el.a, e: el.e }; };

  // tiempo sidéreo local (grados)
  A.lst = function (date, lonDeg) {
    const jd = A.jd(date);
    return norm(280.46061837 + 360.98564736629 * (jd - 2451545.0) + lonDeg);
  };
  // ecuatoriales → horizontales (grados)
  A.eqToHor = function (ra, dec, lst, lat) {
    const H = (lst - ra) * RAD, dr = dec * RAD, la = lat * RAD;
    const sa = Math.sin(dr) * Math.sin(la) + Math.cos(dr) * Math.cos(la) * Math.cos(H);
    const alt = Math.asin(Math.max(-1, Math.min(1, sa)));
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(la) - Math.tan(dr) * Math.cos(la));
    return { alt: alt * DEG, az: norm(az * DEG + 180) };
  };
  A.sep = function (ra1, dec1, ra2, dec2) {
    const c = sin(dec1) * sin(dec2) + cos(dec1) * cos(dec2) * cos(ra1 - ra2);
    return Math.acos(Math.max(-1, Math.min(1, c))) * DEG;
  };
  // precesión aproximada J2000 → fecha (grados)
  A.precess = function (ra, dec, years) {
    const dra = (3.075 + 1.336 * sin(ra) * Math.tan(dec * RAD)) * years / 240; // seg → grados
    const ddec = 20.04 * cos(ra) * years / 3600;
    return { ra: norm(ra + dra), dec: dec + ddec };
  };
  // galáctico → ecuatorial J2000
  A.galToEq = function (l, b) {
    const aG = 192.85948, dG = 27.12825, lN = 122.93192;
    const sd = sin(b) * sin(dG) + cos(b) * cos(dG) * cos(lN - l);
    const dec = Math.asin(sd) * DEG;
    const ra = aG + Math.atan2(cos(b) * sin(lN - l), sin(b) * cos(dG) - cos(b) * sin(dG) * cos(lN - l)) * DEG;
    return { ra: norm(ra), dec };
  };
  // salida/puesta/tránsito aproximados (horas locales del día de `date`), búsqueda numérica
  A.riseSet = function (name, date, lat, lon, getEq) {
    const out = { rise: null, set: null };
    const t0 = new Date(date); t0.setHours(0, 0, 0, 0);
    let prev = null;
    for (let m = 0; m <= 1440; m += 10) {
      const t = new Date(t0.getTime() + m * 60000);
      const eq = getEq(t);
      const h = A.eqToHor(eq.ra, eq.dec, A.lst(t, lon), lat).alt - (name === 'sun' ? 0.83 : name === 'moon' ? 0.2 : 0.57);
      if (prev !== null) {
        if (prev < 0 && h >= 0 && !out.rise) out.rise = t;
        if (prev >= 0 && h < 0 && !out.set) out.set = t;
      }
      prev = h;
    }
    return out;
  };

  G.astro = A;
})(window.G);
