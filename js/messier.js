/* Girounivers · catálogo Messier (110), agujeros negros y cinturones del sistema solar.
   Distancias y magnitudes aproximadas (valores habituales de catálogo). */
window.G = window.G || {};
(function (G) {
  // tipos: sn=resto de supernova, gl=cúmulo globular, oc=cúmulo abierto, sp=galaxia espiral, sb=espiral barrada, el=elíptica, le=lenticular,
  //        ir=irregular, em=nebulosa de emisión, pl=nebulosa planetaria, re=nebulosa de reflexión, as=asterismo, ns=nube estelar, db=estrella doble
  const T = { sn: 'Resto de supernova', gl: 'Cúmulo globular', oc: 'Cúmulo abierto', sp: 'Galaxia espiral', sb: 'Galaxia espiral barrada', el: 'Galaxia elíptica', le: 'Galaxia lenticular', ir: 'Galaxia irregular', em: 'Nebulosa de emisión', pl: 'Nebulosa planetaria', re: 'Nebulosa de reflexión', as: 'Asterismo', ns: 'Nube estelar', db: 'Estrella doble' };
  // n | tipo | constelación | magnitud | distancia (años luz, o 'M' = millones) | nombre común [es] | nombre común [en]
  const TXT = `
1|sn|Tau|8.4|6500|Nebulosa del Cangrejo|Crab Nebula
2|gl|Aqr|6.5|37500
3|gl|CVn|6.2|33900
4|gl|Sco|5.6|7200
5|gl|Ser|5.6|24500
6|oc|Sco|4.2|1600|Cúmulo de la Mariposa|Butterfly Cluster
7|oc|Sco|3.3|980|Cúmulo de Ptolomeo|Ptolemy's Cluster
8|em|Sgr|6.0|4100|Nebulosa de la Laguna|Lagoon Nebula
9|gl|Oph|7.7|25800
10|gl|Oph|6.6|14300
11|oc|Sct|6.3|6200|Cúmulo del Pato Salvaje|Wild Duck Cluster
12|gl|Oph|6.7|15700
13|gl|Her|5.8|22200|Cúmulo de Hércules|Hercules Cluster
14|gl|Oph|7.6|30300
15|gl|Peg|6.2|33600
16|em|Ser|6.0|7000|Nebulosa del Águila|Eagle Nebula
17|em|Sgr|6.0|5500|Nebulosa Omega|Omega Nebula
18|oc|Sgr|6.9|4900
19|gl|Oph|6.8|28700
20|em|Sgr|6.3|5200|Nebulosa Trífida|Trifid Nebula
21|oc|Sgr|5.9|4250
22|gl|Sgr|5.1|10600
23|oc|Sgr|5.5|2150
24|ns|Sgr|4.6|10000|Nube Estelar de Sagitario|Sagittarius Star Cloud
25|oc|Sgr|4.6|2000
26|oc|Sct|8.0|5000
27|pl|Vul|7.5|1250|Nebulosa Dumbbell|Dumbbell Nebula
28|gl|Sgr|6.8|18000
29|oc|Cyg|6.6|4000
30|gl|Cap|7.2|27000
31|sp|And|3.4|M2.5|Galaxia de Andrómeda|Andromeda Galaxy
32|el|And|8.1|M2.5
33|sp|Tri|5.7|M2.7|Galaxia del Triángulo|Triangulum Galaxy
34|oc|Per|5.5|1500
35|oc|Gem|5.3|2800
36|oc|Aur|6.0|4100
37|oc|Aur|5.6|4500
38|oc|Aur|6.4|4200
39|oc|Cyg|4.6|800
40|db|UMa|8.4|510|Winnecke 4|Winnecke 4
41|oc|CMa|4.5|2300
42|em|Ori|4.0|1344|Nebulosa de Orión|Orion Nebula
43|em|Ori|9.0|1600|Nebulosa de De Mairan|De Mairan's Nebula
44|oc|Cnc|3.7|600|El Pesebre|Beehive Cluster
45|oc|Tau|1.6|444|Las Pléyades|Pleiades
46|oc|Pup|6.1|5400
47|oc|Pup|4.4|1600
48|oc|Hya|5.8|2500
49|el|Vir|8.4|M56
50|oc|Mon|5.9|3200
51|sp|CVn|8.4|M23|Galaxia del Remolino|Whirlpool Galaxy
52|oc|Cas|6.9|5000
53|gl|Com|7.6|58000
54|gl|Sgr|7.6|87000
55|gl|Sgr|6.3|17600
56|gl|Lyr|8.3|32900
57|pl|Lyr|8.8|2300|Nebulosa del Anillo|Ring Nebula
58|sb|Vir|9.7|M62
59|el|Vir|9.6|M60
60|el|Vir|8.8|M55
61|sp|Vir|9.7|M52
62|gl|Oph|6.5|22500
63|sp|CVn|8.6|M27|Galaxia del Girasol|Sunflower Galaxy
64|sp|Com|8.5|M17|Galaxia del Ojo Negro|Black Eye Galaxy
65|sp|Leo|9.3|M35
66|sp|Leo|8.9|M36
67|oc|Cnc|6.9|2700
68|gl|Hya|7.8|33600
69|gl|Sgr|7.7|29700
70|gl|Sgr|7.8|29400
71|gl|Sge|8.2|12000
72|gl|Aqr|9.3|53000
73|as|Aqr|9.0|2500
74|sp|Psc|9.4|M32
75|gl|Sgr|8.6|67500
76|pl|Per|10.1|2500|Pequeña Nebulosa Dumbbell|Little Dumbbell Nebula
77|sp|Cet|8.9|M47
78|re|Ori|8.3|1600
79|gl|Lep|7.7|41000
80|gl|Sco|7.3|32600
81|sp|UMa|6.9|M12|Galaxia de Bode|Bode's Galaxy
82|ir|UMa|8.4|M12|Galaxia del Cigarro|Cigar Galaxy
83|sb|Hya|7.5|M15|Molinillo Austral|Southern Pinwheel Galaxy
84|le|Vir|9.1|M55
85|le|Com|9.1|M60
86|le|Vir|8.9|M52
87|el|Vir|8.6|M53|Galaxia Virgo A|Virgo A Galaxy
88|sp|Com|9.6|M47
89|el|Vir|9.8|M50
90|sp|Vir|9.5|M58
91|sb|Com|10.2|M63
92|gl|Her|6.4|26700
93|oc|Pup|6.2|3600
94|sp|CVn|8.2|M16
95|sb|Leo|9.7|M33
96|sp|Leo|9.2|M31
97|pl|UMa|9.9|2030|Nebulosa del Búho|Owl Nebula
98|sp|Com|10.1|M44
99|sp|Com|9.9|M50
100|sp|Com|9.3|M55
101|sp|UMa|7.9|M21|Galaxia del Molinete|Pinwheel Galaxy
102|le|Dra|9.9|M44|Galaxia del Huso (NGC 5866)|Spindle Galaxy (NGC 5866)
103|oc|Cas|7.4|8500
104|sp|Vir|8.0|M29|Galaxia del Sombrero|Sombrero Galaxy
105|el|Leo|9.3|M32
106|sp|CVn|8.4|M24
107|gl|Oph|7.9|20900
108|sb|UMa|10.0|M46
109|sb|UMa|9.8|M83
110|el|And|8.5|M2.7`.trim().split('\n');

  const fmtLy = v => {
    if (String(v).startsWith('M')) { const x = parseFloat(String(v).slice(1)); return 'aprox. ' + String(x).replace('.', ',') + ' millones de años luz'; }
    return 'aprox. ' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' años luz';
  };
  const have = new Set();
  G.catalogSeeds.forEach(s => { if (s.messier != null) have.add(s.messier); });
  // los objetos del mapa del cielo que ya son Messier reciben su número (evita duplicados)
  G.dsos.forEach(o => {
    const m = /^M(\d+)$/.exec(o.alias || ''); if (!m) return;
    const s = G.catalogSeeds.find(x => x.id === o.id); if (s) { s.messier = +m[1]; have.add(+m[1]); }
  });

  G.messierCount = 110;
  G.messierSub = {};
  TXT.forEach(line => { const p = line.split('|'); G.messierSub[+p[0]] = T[p[1]] + ' · ' + p[2]; });
  G.catalogSeeds.forEach(s => { if (s.messier != null && G.messierSub[s.messier]) s.sub = G.messierSub[s.messier]; });
  TXT.forEach(line => {
    const p = line.split('|'), n = +p[0];
    if (have.has(n)) return;
    const common = p[5] || '', commonEn = p[6] || '';
    const name = common ? common + ' (M' + n + ')' : 'Messier ' + n;
    if (common && commonEn) G.D[name] = commonEn + ' (M' + n + ')';
    const galaxy = ['sp', 'sb', 'el', 'le', 'ir'].includes(p[1]);
    G.catalogSeeds.push({
      id: 'm' + n, cat: galaxy ? 'galaxia' : 'objeto', name, sub: T[p[1]] + ' · ' + p[2], messier: n,
      desc: '', info: '', myth: '', size: '', period: '', distSun: '', distLy: fmtLy(p[4]),
      extra: [{ k: 'Magnitud aparente', v: String(p[3]).replace('.', ',') }], notes: '', observed: false, seed: true
    });
  });

  // ---- agujeros negros y objetos extremos ----
  G.SEEDEN = G.SEEDEN || {};
  const BH = [
    { id: 'ton-618', name: 'TON 618', sub: 'Cuásar hiperluminoso · agujero negro supermasivo', size: 'Radio de Schwarzschild aprox. 1 300 UA', distLy: 'aprox. 10 800 millones de años luz', mass: 'aprox. 66 mil millones de masas solares', con: 'Canes Venatici',
      es: { desc: 'Cuásar hiperluminoso que alberga uno de los agujeros negros más masivos que se conocen.', info: 'Su agujero negro central tiene unos 66 mil millones de masas solares y un radio de Schwarzschild de unas 1 300 UA (más de 40 veces la distancia del Sol a Neptuno). El cuásar brilla unos 140 billones de veces más que el Sol, alimentado por gas que cae en espiral hacia el agujero negro. Su luz tardó unos 10 800 millones de años en llegar hasta nosotros (corrimiento al rojo z ≈ 2,2).', myth: 'Su nombre viene del catálogo de objetos azules del observatorio de Tonantzintla (México), publicado a finales de los años 50.' },
      en: { desc: 'A hyperluminous quasar housing one of the most massive black holes known.', info: 'Its central black hole has about 66 billion solar masses and a Schwarzschild radius of roughly 1,300 AU (more than 40 times the Sun–Neptune distance). The quasar shines about 140 trillion times brighter than the Sun, powered by gas spiralling into the black hole. Its light took about 10.8 billion years to reach us (redshift z ≈ 2.2).', myth: 'Its name comes from the catalogue of blue objects of the Tonantzintla observatory (Mexico), published in the late 1950s.' } },
    { id: 'sagitario-a', name: 'Sagitario A*', sub: 'Agujero negro supermasivo', size: 'Radio de Schwarzschild aprox. 12,7 millones de km', distLy: 'aprox. 26 700 años luz', mass: 'aprox. 4,3 millones de masas solares', con: 'Sagittarius',
      es: { desc: 'El agujero negro supermasivo del centro de nuestra galaxia, la Vía Láctea.', info: 'Tiene unos 4,3 millones de masas solares y un radio de Schwarzschild de unos 12,7 millones de km (≈ 0,08 UA, dentro de la órbita de Mercurio). Estrellas como S2 giran a su alrededor a miles de km/s.', myth: 'La fuente de radio se descubrió en 1974. Reinhard Genzel y Andrea Ghez recibieron el Nobel de Física 2020 por demostrar que allí hay un objeto compacto supermasivo. El Event Horizon Telescope publicó su imagen en 2022.' },
      en: { desc: 'The supermassive black hole at the centre of our galaxy, the Milky Way.', info: 'It has about 4.3 million solar masses and a Schwarzschild radius of about 12.7 million km (≈ 0.08 AU, inside Mercury’s orbit). Stars such as S2 orbit it at thousands of km/s.', myth: 'The radio source was discovered in 1974. Reinhard Genzel and Andrea Ghez shared the 2020 Nobel Prize in Physics for showing a supermassive compact object lives there. The Event Horizon Telescope published its image in 2022.' } },
    { id: 'm87-estrella', name: 'M87*', sub: 'Agujero negro supermasivo', size: 'Radio de Schwarzschild aprox. 130 UA', distLy: 'aprox. 53 millones de años luz', mass: 'aprox. 6,5 mil millones de masas solares', con: 'Virgo',
      es: { desc: 'Agujero negro supermasivo en el centro de la galaxia elíptica gigante M87, en el cúmulo de Virgo.', info: 'Unos 6,5 mil millones de masas solares; su radio de Schwarzschild es de unas 130 UA. Lanza un chorro (jet) de partículas casi a la velocidad de la luz que se extiende unos 5 000 años luz.', myth: 'En abril de 2019 el Event Horizon Telescope publicó la primera imagen directa de la sombra de un agujero negro (observaciones de 2017).' },
      en: { desc: 'The supermassive black hole at the centre of the giant elliptical galaxy M87, in the Virgo Cluster.', info: 'About 6.5 billion solar masses; its Schwarzschild radius is roughly 130 AU. It launches a jet of particles at nearly the speed of light that stretches about 5,000 light-years.', myth: 'In April 2019 the Event Horizon Telescope published the first direct image of a black hole’s shadow (observations from 2017).' } },
    { id: 'cygnus-x-1', name: 'Cygnus X-1', sub: 'Agujero negro estelar', size: 'Radio de Schwarzschild aprox. 62 km', distLy: 'aprox. 7 200 años luz', mass: 'aprox. 21 masas solares', con: 'Cygnus',
      es: { desc: 'Fuente de rayos X y uno de los primeros candidatos sólidos a agujero negro de masa estelar.', info: 'Un agujero negro de unas 21 masas solares arranca gas de una supergigante azul compañera (HDE 226868); ambos se orbitan cada 5,6 días. Su radio de Schwarzschild es de unos 62 km.', myth: 'Detectada como fuente de rayos X en 1964 con cohetes sonda. En 1974 Stephen Hawking apostó con Kip Thorne a que NO era un agujero negro; admitió la derrota en 1990.' },
      en: { desc: 'An X-ray source and one of the first solid candidates for a stellar-mass black hole.', info: 'A black hole of about 21 solar masses strips gas from a blue supergiant companion (HDE 226868); they orbit each other every 5.6 days. Its Schwarzschild radius is about 62 km.', myth: 'Detected as an X-ray source in 1964 with sounding rockets. In 1974 Stephen Hawking bet Kip Thorne it was NOT a black hole; he conceded in 1990.' } },
    { id: 'gaia-bh1', name: 'Gaia BH1', sub: 'Agujero negro estelar', size: 'Radio de Schwarzschild aprox. 28 km', distLy: 'aprox. 1 560 años luz', mass: 'aprox. 9,6 masas solares', con: 'Ophiuchus',
      es: { desc: 'El agujero negro conocido más cercano a la Tierra cuando se anunció, en 2022.', info: 'Unas 9,6 masas solares, acompañado por una estrella parecida al Sol con la que orbita cada 185,6 días. Se detectó por el movimiento de la estrella (astrometría de Gaia), sin emitir rayos X: es un agujero negro “dormido”.', myth: 'Anunciado en noviembre de 2022 a partir de datos de la misión Gaia de la ESA.' },
      en: { desc: 'The closest known black hole to Earth when it was announced, in 2022.', info: 'About 9.6 solar masses, paired with a Sun-like star it orbits every 185.6 days. It was found from the star’s motion (Gaia astrometry), without emitting X-rays: a “dormant” black hole.', myth: 'Announced in November 2022 from data of ESA’s Gaia mission.' } },
    { id: 'gaia-bh3', name: 'Gaia BH3', sub: 'Agujero negro estelar', size: 'Radio de Schwarzschild aprox. 97 km', distLy: 'aprox. 1 930 años luz', mass: 'aprox. 33 masas solares', con: 'Aquila',
      es: { desc: 'El agujero negro de masa estelar más masivo conocido en la Vía Láctea.', info: 'Unas 33 masas solares. Su compañera es una gigante muy pobre en metales que lo orbita en unos 11,6 años. Se descubrió por el bamboleo de esa estrella.', myth: 'Anunciado en abril de 2024 a partir de datos de la misión Gaia.' },
      en: { desc: 'The most massive stellar-mass black hole known in the Milky Way.', info: 'About 33 solar masses. Its companion is a very metal-poor giant that orbits it in about 11.6 years. It was found from that star’s wobble.', myth: 'Announced in April 2024 from Gaia mission data.' } },
    { id: 'ngc-4889', name: 'NGC 4889', sub: 'Galaxia elíptica gigante · agujero negro supermasivo', size: 'Radio de Schwarzschild aprox. 415 UA', distLy: 'aprox. 308 millones de años luz', mass: 'aprox. 21 mil millones de masas solares', con: 'Coma Berenices',
      es: { desc: 'La galaxia más brillante del Cúmulo de Coma, con uno de los agujeros negros más masivos medidos.', info: 'Masa estimada de unos 21 mil millones de masas solares (medición de 2011, con incertidumbre); radio de Schwarzschild de unas 415 UA.', myth: '' },
      en: { desc: 'The brightest galaxy of the Coma Cluster, with one of the most massive black holes ever measured.', info: 'Estimated mass of about 21 billion solar masses (2011 measurement, with uncertainty); Schwarzschild radius of roughly 415 AU.', myth: '' } },
    { id: 'holm-15a', name: 'Holm 15A', sub: 'Galaxia elíptica gigante · agujero negro supermasivo', size: 'Radio de Schwarzschild aprox. 790 UA', distLy: 'aprox. 700 millones de años luz', mass: 'aprox. 40 mil millones de masas solares', con: 'Cetus',
      es: { desc: 'Galaxia central del cúmulo Abell 85, con uno de los agujeros negros más masivos medidos directamente.', info: 'Unas 40 mil millones de masas solares (medido en 2019 con la dinámica de sus estrellas); radio de Schwarzschild de unas 790 UA. Su núcleo es inusualmente poco brillante para su tamaño.', myth: '' },
      en: { desc: 'Central galaxy of the Abell 85 cluster, with one of the most massive black holes measured directly.', info: 'About 40 billion solar masses (measured in 2019 from stellar dynamics); Schwarzschild radius of roughly 790 AU. Its core is unusually faint for its size.', myth: '' } }
  ];
  Object.assign(G.D, { 'Sagitario A*': 'Sagittarius A*' });
  BH.forEach(b => {
    G.SEEDEN[b.id] = b.en;
    G.catalogSeeds.push({
      id: b.id, cat: 'objeto', name: b.name, sub: b.sub, desc: b.es.desc, info: b.es.info, myth: b.es.myth, size: b.size, period: '', distSun: '', distLy: b.distLy,
      extra: [{ k: 'Masa', v: b.mass }, { k: 'Constelación', v: b.con }], notes: '', observed: false, seed: true
    });
  });

  // ---- cinturones del sistema solar ----
  G.catalogSeeds.push(
    { id: 'cinturon-asteroides', cat: 'objeto', name: 'Cinturón de asteroides', sub: 'Región del sistema solar', desc: '', info: '', myth: '', size: '', period: '', distSun: 'entre 2,1 y 3,3 UA (entre Marte y Júpiter)', distLy: '', extra: [], notes: '', observed: false, seed: true },
    { id: 'cinturon-kuiper', cat: 'objeto', name: 'Cinturón de Kuiper', sub: 'Región del sistema solar', desc: '', info: '', myth: '', size: '', period: '', distSun: 'entre 30 y 50 UA (más allá de Neptuno)', distLy: '', extra: [], notes: '', observed: false, seed: true });
  Object.assign(G.D, { 'Cinturón de asteroides': 'Asteroid belt', 'Cinturón de Kuiper': 'Kuiper belt', 'Orbita alrededor de': 'Orbits', 'Distancia media al planeta': 'Mean distance to its planet', 'Posición orbital ilustrativa (no real)': 'Illustrative orbital position (not real)', 'Nota': 'Note', 'Fase': 'Phase',
    'Los puntos son ilustrativos, no asteroides reales': 'The dots are illustrative, not real asteroids', '⌖ Seguir': '⌖ Follow', 'Dejar de seguir': 'Stop following',
    'Masa': 'Mass', 'Magnitud aparente': 'Apparent magnitude', 'Constelación': 'Constellation', '☆ Usar como portada': '☆ Use as cover', '★ Portada actual': '★ Current cover', 'Portada quitada': 'Cover removed', 'Foto de portada guardada': 'Cover photo saved' });
})(window.G);
