/* Girounivers · agrupación del catálogo: tipo de objeto y constelación */
window.G = window.G || {};
(function (G) {
  // abreviatura | español | nombre latino
  const C88 = `And|Andrómeda|Andromeda;Ant|Máquina Neumática|Antlia;Aps|Ave del Paraíso|Apus;Aqr|Acuario|Aquarius;Aql|Águila|Aquila;Ara|Altar|Ara;Ari|Aries|Aries;Aur|Auriga|Auriga;Boo|Boyero|Bootes;Cae|Cincel|Caelum;Cam|Jirafa|Camelopardalis;Cnc|Cáncer|Cancer;CVn|Perros de Caza|Canes Venatici;CMa|Can Mayor|Canis Major;CMi|Can Menor|Canis Minor;Cap|Capricornio|Capricornus;Car|Quilla|Carina;Cas|Casiopea|Cassiopeia;Cen|Centauro|Centaurus;Cep|Cefeo|Cepheus;Cet|Ballena|Cetus;Cha|Camaleón|Chamaeleon;Cir|Compás|Circinus;Col|Paloma|Columba;Com|Cabellera de Berenice|Coma Berenices;CrA|Corona Austral|Corona Australis;CrB|Corona Boreal|Corona Borealis;Crv|Cuervo|Corvus;Crt|Copa|Crater;Cru|Cruz del Sur|Crux;Cyg|Cisne|Cygnus;Del|Delfín|Delphinus;Dor|Dorado|Dorado;Dra|Dragón|Draco;Equ|Caballito|Equuleus;Eri|Erídano|Eridanus;For|Horno|Fornax;Gem|Géminis|Gemini;Gru|Grulla|Grus;Her|Hércules|Hercules;Hor|Reloj|Horologium;Hya|Hidra|Hydra;Hyi|Hidra Macho|Hydrus;Ind|Indio|Indus;Lac|Lagarto|Lacerta;Leo|Leo|Leo;LMi|León Menor|Leo Minor;Lep|Liebre|Lepus;Lib|Libra|Libra;Lup|Lobo|Lupus;Lyn|Lince|Lynx;Lyr|Lira|Lyra;Men|Mesa|Mensa;Mic|Microscopio|Microscopium;Mon|Unicornio|Monoceros;Mus|Mosca|Musca;Nor|Escuadra|Norma;Oct|Octante|Octans;Oph|Ofiuco|Ophiuchus;Ori|Orión|Orion;Pav|Pavo|Pavo;Peg|Pegaso|Pegasus;Per|Perseo|Perseus;Phe|Fénix|Phoenix;Pic|Pintor|Pictor;Psc|Piscis|Pisces;PsA|Pez Austral|Piscis Austrinus;Pup|Popa|Puppis;Pyx|Brújula|Pyxis;Ret|Retículo|Reticulum;Sge|Flecha|Sagitta;Sgr|Sagitario|Sagittarius;Sco|Escorpio|Scorpius;Scl|Escultor|Sculptor;Sct|Escudo|Scutum;Ser|Serpiente|Serpens;Sex|Sextante|Sextans;Tau|Tauro|Taurus;Tel|Telescopio|Telescopium;Tri|Triángulo|Triangulum;TrA|Triángulo Austral|Triangulum Australe;Tuc|Tucán|Tucana;UMa|Osa Mayor|Ursa Major;UMi|Osa Menor|Ursa Minor;Vel|Vela|Vela;Vir|Virgo|Virgo;Vol|Pez Volador|Volans;Vul|Zorrita|Vulpecula`;
  const BY = {}, norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  C88.split(';').forEach(l => { const p = l.split('|'); const o = { abbr: p[0], es: p[1], la: p[2] }; BY[norm(p[0])] = o; BY[norm(p[1])] = o; BY[norm(p[2])] = o; });
  G.conByName = s => BY[norm(s)] || null;

  const SOLAR = { planeta: 1, satelite: 1, cometa: 1 };
  G.SOLAR_NAME = 'Sistema solar'; G.NOCON_NAME = 'Sin constelación';
  // nombre (es) de la constelación de una ficha
  G.conOf = function (e) {
    if (e.cat === 'constelacion') return (BY[norm(e.name)] || {}).es || e.name;
    if (SOLAR[e.cat] || e.id === 'sol' || /^cintur[oó]n/.test(norm(e.id)) || /sistema solar/i.test(e.sub || '')) return G.SOLAR_NAME;
    const m = /·\s*([A-Za-z]{2,4})\s*$/.exec(e.sub || '');
    if (m && BY[norm(m[1])]) return BY[norm(m[1])].es;
    const x = (e.extra || []).find(z => norm(z.k) === 'constelacion');
    if (x && BY[norm(x.v)]) return BY[norm(x.v)].es;
    return G.NOCON_NAME;
  };

  // categoría correcta según el tipo escrito en el subtítulo
  G.deriveCat = function (e) {
    const s = norm(e.sub);
    if (/agujero negro|cuasar/.test(s)) return 'agujero';
    if (/^nebulosa|resto de supernova/.test(s)) return 'nebulosa';
    if (/^cumulo|^doble cumulo|estrella doble|binari|sistema de/.test(s)) return 'cumulo';
    return e.cat;
  };

  // ---- planetas enanos y sondas Voyager ----
  const NEW = [
    { id: 'ceres', cat: 'planeta', name: 'Ceres', sub: 'Planeta enano · cinturón de asteroides', size: '939 km de diámetro', period: '4,60 años', distSun: '2,77 UA (414 M km)',
      es: { desc: 'El mayor objeto del cinturón de asteroides y el único planeta enano del sistema solar interior. Contiene cerca de un tercio de la masa de todo el cinturón.', info: 'Superficie oscura con manchas brillantes de sales en el cráter Occator. Probablemente tiene un manto rico en hielo de agua. Explorado por la sonda Dawn (2015–2018).', myth: 'Descubierto por Giuseppe Piazzi el 1 de enero de 1801 desde Palermo. Fue considerado el octavo planeta durante medio siglo, hasta que se hallaron más asteroides. Lleva el nombre de Ceres, diosa romana de la agricultura.' },
      en: { desc: 'The largest object in the asteroid belt and the only dwarf planet in the inner solar system. It holds about a third of the belt’s total mass.', info: 'Dark surface with bright salt spots in Occator crater. Probably has a mantle rich in water ice. Explored by the Dawn probe (2015–2018).', myth: 'Discovered by Giuseppe Piazzi on 1 January 1801 from Palermo. It was counted as the eighth planet for half a century, until more asteroids were found. Named after Ceres, the Roman goddess of agriculture.' } },
    { id: 'pluto', cat: 'planeta', name: 'Plutón', sub: 'Planeta enano · cinturón de Kuiper', size: '2 377 km de diámetro', period: '247,9 años', distSun: '39,5 UA de media (entre 29,7 y 49,3 UA)',
      es: { desc: 'El planeta enano más conocido, en el cinturón de Kuiper. Su órbita es muy excéntrica e inclinada, y durante unos 20 años de cada vuelta está más cerca del Sol que Neptuno.', info: 'Tiene una atmósfera tenue de nitrógeno y una gran llanura de hielo de nitrógeno (Sputnik Planitia) con forma de corazón. Su mayor satélite, Caronte, es tan grande que ambos giran alrededor de un punto exterior a Plutón. Tiene otros 4 satélites pequeños. Lo sobrevoló la sonda New Horizons en julio de 2015.', myth: 'Descubierto por Clyde Tombaugh en 1930 en el observatorio Lowell. El nombre lo propuso Venetia Burney, una niña de 11 años de Oxford. Fue el noveno planeta hasta 2006, cuando la UAI lo reclasificó como planeta enano. Plutón es el dios romano del inframundo.' },
      en: { desc: 'The best-known dwarf planet, in the Kuiper belt. Its orbit is very eccentric and tilted, and for about 20 years of each revolution it is closer to the Sun than Neptune.', info: 'It has a thin nitrogen atmosphere and a large heart-shaped plain of nitrogen ice (Sputnik Planitia). Its largest moon, Charon, is so big that the two orbit a point outside Pluto. It has 4 other small moons. The New Horizons probe flew past it in July 2015.', myth: 'Discovered by Clyde Tombaugh in 1930 at Lowell Observatory. The name was suggested by Venetia Burney, an 11-year-old girl from Oxford. It was the ninth planet until 2006, when the IAU reclassified it as a dwarf planet. Pluto is the Roman god of the underworld.' } },
    { id: 'voyager-1', cat: 'objeto', name: 'Voyager 1', sub: 'Sonda espacial · Sistema solar exterior', size: '', period: '', distSun: 'aprox. 173 UA (en 2026), alejándose a unos 17 km/s', distLy: '',
      es: { desc: 'La sonda construida por el ser humano que más lejos ha llegado. Lanzada el 5 de septiembre de 1977, cruzó la heliopausa en agosto de 2012 y navega por el espacio interestelar rumbo a la constelación de Ofiuco. El 18 de noviembre de 2026 alcanzará una distancia de un día-luz de la Tierra.', info: 'Visitó Júpiter (1979) y Saturno (1980), y sacó la imagen del “Punto azul pálido” en 1990. Sigue funcionando con un generador nuclear (RTG) cada vez más débil y se comunica con la Red del Espacio Profundo de la NASA; sus señales tardan casi 24 horas en llegar.', myth: 'Lleva el Disco de Oro, con sonidos, imágenes y saludos de la Tierra, pensado como mensaje para una posible civilización extraterrestre.' },
      en: { desc: 'The farthest human-made object. Launched on 5 September 1977, it crossed the heliopause in August 2012 and is travelling through interstellar space towards the constellation Ophiuchus. On 18 November 2026 it will reach a distance of one light-day from Earth.', info: 'It visited Jupiter (1979) and Saturn (1980), and took the “Pale Blue Dot” image in 1990. It still runs on an ever-weaker nuclear generator (RTG) and talks to NASA’s Deep Space Network; its signals take almost 24 hours to arrive.', myth: 'It carries the Golden Record, with sounds, images and greetings from Earth, meant as a message for a possible extraterrestrial civilisation.' } },
    { id: 'voyager-2', cat: 'objeto', name: 'Voyager 2', sub: 'Sonda espacial · Sistema solar exterior', size: '', period: '', distSun: 'aprox. 144 UA (en 2026), alejándose a unos 15 km/s', distLy: '',
      es: { desc: 'Lanzada el 20 de agosto de 1977, dieciséis días antes que su gemela. Es la única sonda que ha visitado Urano y Neptuno. Cruzó la heliopausa en noviembre de 2018 y se dirige hacia la constelación del Telescopio.', info: 'Aprovechó una alineación planetaria que se da cada ~175 años: Júpiter (1979), Saturno (1981), Urano (1986) y Neptuno (1989). Sus mediciones del plasma al salir de la heliosfera completaron las de Voyager 1.', myth: 'También lleva un Disco de Oro con saludos en 55 idiomas y música de todo el mundo.' },
      en: { desc: 'Launched on 20 August 1977, sixteen days before its twin. It is the only probe to have visited Uranus and Neptune. It crossed the heliopause in November 2018 and is heading towards the constellation Telescopium.', info: 'It used a planetary alignment that happens about every 175 years: Jupiter (1979), Saturn (1981), Uranus (1986) and Neptune (1989). Its plasma measurements on leaving the heliosphere complemented those of Voyager 1.', myth: 'It also carries a Golden Record with greetings in 55 languages and music from around the world.' } }
  ];
  G.SEEDEN = G.SEEDEN || {};
  NEW.forEach(b => {
    if (G.catalogSeeds.some(s => s.id === b.id)) return;
    G.catalogSeeds.push({ id: b.id, cat: b.cat, name: b.name, sub: b.sub, desc: b.es.desc, info: b.es.info, myth: b.es.myth, size: b.size, period: b.period, distSun: b.distSun, distLy: b.distLy, extra: [], notes: '', observed: false, seed: true });
    G.SEEDEN[b.id] = b.en;
  });
  G.catalogSeeds.forEach(s => { if (s.cat === 'objeto' || s.cat === 'galaxia') s.cat = G.deriveCat(s); });

  // al arrancar: mueve las fichas existentes a su nueva categoría (una sola vez)
  G.migrateCats = function (entries) {
    const by = {}; G.catalogSeeds.forEach(s => by[s.id] = s);
    entries.forEach(e => { const s = by[e.id]; if (s && (e.cat === 'objeto' || e.cat === 'galaxia') && s.cat !== e.cat) e.cat = s.cat; });
  };

  Object.assign(G.D, { 'Contaminación lumínica': 'Light pollution', 'Retos': 'Challenges', 'Tiempo': 'Weather', '☍ Oposiciones': '☍ Oppositions', '⌖ Posiciones': '⌖ Positions', 'Lluvias de estrellas, fases lunares, oposiciones, conjunciones y posiciones relativas de los próximos 13 meses, calculadas en tu móvil.': 'Meteor showers, Moon phases, oppositions, conjunctions and relative positions for the next 13 months, computed on your phone.', 'Ceres': 'Ceres', 'Voyager 1': 'Voyager 1', 'Voyager 2': 'Voyager 2', '◇ Voyager': '◇ Voyager', 'Planeta enano · cinturón de asteroides': 'Dwarf planet · asteroid belt', 'Planeta enano · cinturón de Kuiper': 'Dwarf planet · Kuiper belt', 'Sonda espacial · Sistema solar exterior': 'Space probe · outer solar system', 'Plutón': 'Pluto', 'Distancia al Sol (aprox.)': 'Distance to the Sun (approx.)', 'Luz tarda en llegar': 'Light travel time', 'Lanzamiento': 'Launch', 'Entró en el espacio interestelar': 'Entered interstellar space', 'Nebulosas': 'Nebulae', 'Cúmulos y sistemas': 'Clusters & systems', 'Agujeros negros': 'Black holes', 'Otros objetos': 'Other objects',
    'Sistema solar': 'Solar system', 'Sin constelación': 'No constellation', 'Por tipo': 'By type', 'A–Z': 'A–Z', 'Constelación': 'Constellation', 'Ordenar': 'Sort' });
})(window.G);
