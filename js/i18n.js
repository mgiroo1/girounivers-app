/* Girounivers · idiomas (es / en). El texto escrito por ti nunca se traduce. */
window.G = window.G || {};
(function (G) {
  let lang = 'es';
  try { lang = localStorage.getItem('gu_lang') || 'es'; } catch (e) { }
  G.lang = lang === 'en' ? 'en' : 'es';
  G.locale = G.lang === 'en' ? 'en-GB' : 'es-ES';
  G.setLang = l => { try { localStorage.setItem('gu_lang', l); } catch (e) { } location.reload(); };
  document.documentElement.lang = G.lang;
  // texto según idioma, para frases con datos intercalados
  G.x = (es, en) => G.lang === 'en' ? en : es;

  const D = {
    // navegación y cabeceras
    'Cielo': 'Sky', 'Sistema solar': 'Solar System', 'Sistema': 'Solar System', 'Catálogo': 'Catalogue', 'Retos': 'Challenges', 'Agenda': 'Agenda', 'Ajustes': 'Settings',
    // genérico
    'Cerrar': 'Close', 'Confirmar': 'Confirm', 'Cancelar': 'Cancel', 'Aceptar': 'OK', 'Guardar': 'Save', 'Eliminar': 'Delete', 'Crear': 'Create', 'Editar': 'Edit', '✎ Editar': '✎ Edit',
    'Buscando…': 'Searching…', 'No se pudo obtener la ubicación': 'Could not get your location', 'No se pudo guardar el archivo': 'Could not save the file',
    // ajustes
    'Idioma': 'Language', 'Mi ubicación de observación': 'My observing location', 'Latitud': 'Latitude', 'Longitud': 'Longitude', 'Usar GPS': 'Use GPS',
    'Se usa para calcular altura y azimut, salidas y puestas. Por defecto se intenta usar el GPS.': 'Used to compute altitude and azimuth, rise and set times. GPS is tried by default.',
    'Copia de seguridad': 'Backup', 'Fichas, retos, eventos y todas tus fotos se guardan solo en este móvil. Exporta una copia de vez en cuando.': 'Entries, challenges, events and all your photos are stored only on this phone. Export a backup now and then.',
    '⬇ Exportar copia': '⬇ Export backup', '⬆ Importar copia': '⬆ Import backup', 'Acerca de': 'About',
    'Girounivers · app personal de astronomía. Efemérides calculadas en el dispositivo (precisión de unos minutos de arco), sin conexión a internet. Catálogo estelar: ~220 estrellas brillantes y 21 objetos de cielo profundo.': 'Girounivers · personal astronomy app. Ephemerides computed on the device (accuracy of a few arcminutes), no internet needed. Star catalogue: ~200 bright stars and 21 deep-sky objects.',
    'Guardar ubicación': 'Save location', 'Coordenadas no válidas': 'Invalid coordinates', 'Ubicación guardada': 'Location saved', 'Preparando copia…': 'Preparing backup…', 'Copia restaurada. Reiniciando…': 'Backup restored. Restarting…', 'Archivo no válido': 'Invalid file',
    // cielo
    '🔍 Buscar': '🔍 Search', '☰ Capas': '☰ Layers', '🧭 Brújula': '🧭 Compass', 'Buscar': 'Search', 'toca para volver a ahora': 'tap to return to now', 'ahora': 'now', ' · ahora': ' · now',
    'Buscar en el cielo': 'Search the sky', 'Buscar estrella, planeta, constelación…': 'Search star, planet, constellation…', 'Capas del mapa': 'Map layers',
    'Líneas de constelaciones': 'Constellation lines', 'Nombres': 'Names', 'Planetas': 'Planets', 'Galaxias, nebulosas y cúmulos': 'Galaxies, nebulae and clusters', 'Vía Láctea': 'Milky Way', 'Eclíptica': 'Ecliptic', 'Rejilla ecuatorial': 'Equatorial grid', 'Mostrar bajo el horizonte': 'Show below the horizon',
    'Ver ficha': 'View entry', 'Crear ficha': 'Create entry', 'Centrar': 'Center', 'Nuestra estrella': 'Our star', 'Satélite natural de la Tierra': "Earth's natural satellite", 'Planeta': 'Planet', 'Sistema solar ': 'Solar System ',
    '⚠ Nunca mires al Sol sin filtro solar homologado.': '⚠ Never look at the Sun without a certified solar filter.',
    'Apunta el móvil al cielo (trasera hacia arriba)': 'Point the phone at the sky (back camera facing up)', 'Cielo profundo': 'Deep sky',
    'Luna nueva': 'New Moon', 'Creciente': 'Waxing crescent', 'Cuarto creciente': 'First quarter', 'Gibosa creciente': 'Waxing gibbous', 'Luna llena': 'Full Moon', 'Gibosa menguante': 'Waning gibbous', 'Cuarto menguante': 'Last quarter', 'Menguante': 'Waning crescent',
    'Sol': 'Sun', 'Luna': 'Moon', 'Mercurio': 'Mercury', 'Marte': 'Mars', 'Júpiter': 'Jupiter', 'Saturno': 'Saturn', 'Urano': 'Uranus', 'Neptuno': 'Neptune', 'Tierra': 'Earth',
    'Fobos': 'Phobos', 'Deimos': 'Deimos', 'Ío': 'Io', 'Ganímedes': 'Ganymede', 'Calisto': 'Callisto', 'Titán': 'Titan', 'Encélado': 'Enceladus', 'Tritón': 'Triton',
    // sistema solar
    'Escala: comprimida': 'Scale: compressed', 'Escala: lineal': 'Scale: linear', 'comprimida': 'compressed', 'lineal': 'linear', '⌖ Centrar': '⌖ Center', '⟲ Inclinar': '⟲ Tilt',
    'Tamaños y distancias no están a escala real': 'Sizes and distances are not to real scale', 'Tiempo real': 'Real time', '1 día/s': '1 day/s', '10 días/s': '10 days/s', '1 mes/s': '1 month/s', '1 año/s': '1 year/s',
    'velocidad: ': 'speed: ', ' · toca para volver a ahora': ' · tap to return to now', 'Distancia al Sol': 'Distance to the Sun', 'Distancia a la Tierra': 'Distance to Earth', 'Periodo orbital': 'Orbital period',
    // catálogo
    'Todo': 'All', 'Estrellas': 'Stars', 'Constelaciones': 'Constellations', 'Cometas': 'Comets', 'Objetos': 'Objects', 'Galaxias': 'Galaxies', 'Satélites': 'Moons',
    'Buscar en el catálogo…': 'Search the catalogue…', 'No hay fichas que coincidan. Pulsa ＋ para crear una.': 'No entries match. Tap ＋ to create one.',
    'Nueva ficha': 'New entry', 'Nombre (p. ej. Cometa NEOWISE)': 'Name (e.g. Comet NEOWISE)', 'Nombre': 'Name', 'Categoría': 'Category', 'Escribe un nombre': 'Enter a name', 'Esta ficha aún no existe': 'This entry does not exist yet',
    '✓ Observado': '✓ Observed', 'Marcar como observado': 'Mark as observed', 'Fotos': 'Photos', 'Añade fotos tuyas o de referencia': 'Add your own or reference photos',
    'Descripción': 'Description', 'Información': 'Information', 'Historia y mitología': 'History and mythology', 'Datos': 'Data', 'Mis notas': 'My notes',
    'Sin rellenar · pulsa “Editar” para escribir aquí.': 'Empty · tap “Edit” to write here.', 'Tamaño, periodo orbital, distancia al Sol o años luz… rellénalos en “Editar”.': 'Size, orbital period, distance to the Sun or light-years… fill them in “Edit”.',
    'Tamaño': 'Size', 'Distancia en años luz': 'Distance in light-years', 'Eliminar ficha': 'Delete entry', 'Guardar ficha': 'Save entry', 'Ficha guardada': 'Entry saved',
    'Subtítulo / tipo': 'Subtitle / type', 'p. ej. Planeta gaseoso, Estrella gigante azul…': 'e.g. Gas giant, Blue giant star…', 'Qué es, cómo se ve, por qué es especial…': 'What it is, how it looks, why it is special…', 'Composición, temperatura, curiosidades…': 'Composition, temperature, curiosities…',
    'Descubrimiento, culturas, mitos asociados…': 'Discovery, cultures, associated myths…', 'p. ej. 12 742 km de diámetro': 'e.g. 12,742 km in diameter', 'Periodo orbital al Sol': 'Orbital period around the Sun', 'p. ej. 365,25 días': 'e.g. 365.25 days',
    'Distancia al Sol (sistema solar)': 'Distance to the Sun (Solar System)', 'p. ej. 1 UA · 149,6 millones de km': 'e.g. 1 AU · 149.6 million km', 'Distancia en años luz (fuera del sistema solar)': 'Distance in light-years (outside the Solar System)', 'p. ej. 8,6 años luz': 'e.g. 8.6 light-years',
    '＋ Añadir otro dato': '＋ Add another field', 'Tus observaciones personales': 'Your personal observations', 'Nombre (p. ej. Masa)': 'Name (e.g. Mass)', 'Valor': 'Value',
    '✦ Ver en el cielo': '✦ See in the sky', '◉ Ver en el sistema solar': '◉ See in the Solar System',
    // retos
    'Tu progreso': 'Your progress', '¡Todos los retos completados!': 'All challenges completed!', 'Sube al menos una foto a un reto para completarlo.': 'Upload at least one photo to a challenge to complete it.',
    'Todos': 'All', 'Pendientes': 'Pending', 'Hechos': 'Done', '★ Fácil': '★ Easy', '★★ Medio': '★★ Medium', '★★★ Difícil': '★★★ Hard', 'Fácil': 'Easy', 'Medio': 'Medium', 'Difícil': 'Hard',
    'Nada por aquí todavía.': 'Nothing here yet.', 'Aún sin fotos — ¡sube la primera!': 'No photos yet — upload the first one!', 'Eliminar reto': 'Delete challenge', '¿Eliminar este reto?': 'Delete this challenge?',
    'Nuevo reto': 'New challenge', 'Título del reto': 'Challenge title', 'Título': 'Title', 'Descripción: qué quieres fotografiar': 'Description: what do you want to photograph', 'Consejo (opcional)': 'Tip (optional)', 'Consejo': 'Tip', 'Dificultad': 'Difficulty', 'Crear reto': 'Create challenge', 'Pon un título': 'Enter a title',
    // fotos
    'Sin geolocalización': 'No geolocation', 'Usar mi ubicación actual': 'Use my current location', 'Datos de la foto': 'Photo details', 'Fecha y hora de la foto': 'Photo date and time', 'Ubicación': 'Location', 'Lugar': 'Place',
    'Lugar (p. ej. Montseny, terraza de casa…)': 'Place (e.g. Montseny, home terrace…)', 'Notas': 'Notes', 'Notas: equipo, ajustes, condiciones del cielo…': 'Notes: gear, settings, sky conditions…', 'Foto': 'Photo', 'Editar datos': 'Edit details',
    '¿Eliminar esta foto?': 'Delete this photo?', 'Sin ubicación': 'No location', 'ver mapa': 'view map', '＋ Subir foto': '＋ Upload photo', 'Aún no hay fotos': 'No photos yet', 'Procesando foto…': 'Processing photo…', 'Foto añadida (datos leídos de la imagen)': 'Photo added (details read from the image)', 'Editar datos ': 'Edit details',
    // agenda
    '☄ Lluvias': '☄ Showers', '☾ Luna': '☾ Moon', '◉ Planetas': '◉ Planets', '◐ Eclipses': '◐ Eclipses', '☀ Estaciones': '☀ Seasons', '★ Míos': '★ Mine',
    'Lluvias de estrellas, fases lunares, oposiciones y conjunciones de los próximos 13 meses, calculadas en tu móvil.': 'Meteor showers, Moon phases, oppositions and conjunctions for the next 13 months, computed on your phone.',
    'Calculando el cielo…': 'Computing the sky…', 'No hay eventos de este tipo.': 'No events of this type.', 'Sin descripción.': 'No description.', 'Nuevo evento propio': 'New personal event', 'Título (p. ej. Salida a Montsec)': 'Title (e.g. Trip to Montsec)', 'Fecha y hora': 'Date and time', 'Notas (opcional)': 'Notes (optional)', 'Falta título o fecha': 'Missing title or date',
    '📅 Añadir al calendario': '📅 Add to calendar', 'Hoy': 'Today', 'hoy': 'today', 'mañana': 'tomorrow',
    'Equinoccio de primavera': 'March equinox', 'Solsticio de verano': 'June solstice', 'Equinoccio de otoño': 'September equinox', 'Solsticio de invierno': 'December solstice',
    // lluvias
    'Cuadrántidas': 'Quadrantids', 'Líridas': 'Lyrids', 'Eta Acuáridas': 'Eta Aquariids', 'Delta Acuáridas del Sur': 'Southern Delta Aquariids', 'Perseidas': 'Perseids', 'Oriónidas': 'Orionids', 'Táuridas del Sur': 'Southern Taurids', 'Leónidas': 'Leonids', 'Gemínidas': 'Geminids', 'Úrsidas': 'Ursids',
    'Boyero': 'Boötes', 'Lira': 'Lyra', 'Acuario': 'Aquarius', 'Perseo': 'Perseus', 'Orión': 'Orion', 'Tauro': 'Taurus', 'Géminis': 'Gemini', 'Osa Menor': 'Ursa Minor', 'Cometa Halley': "Halley's Comet",
    // constelaciones
    'Osa Mayor': 'Ursa Major', 'Casiopea': 'Cassiopeia', 'Cefeo': 'Cepheus', 'Cisne': 'Cygnus', 'Águila': 'Aquila', 'Escorpio': 'Scorpius', 'Can Mayor': 'Canis Major', 'Can Menor': 'Canis Minor', 'Corona Boreal': 'Corona Borealis', 'Hércules': 'Hercules', 'Dragón': 'Draco', 'Andrómeda': 'Andromeda', 'Pegaso': 'Pegasus',
    'Cruz del Sur': 'Southern Cross', 'Centauro': 'Centaurus', 'Sagitario': 'Sagittarius', 'Capricornio': 'Capricornus', 'Triángulo Austral': 'Triangulum Australe', 'Virgo': 'Virgo', 'Auriga': 'Auriga', 'Aries': 'Aries', 'Libra': 'Libra', 'Leo': 'Leo', 'Orión ': 'Orion ',
    // cielo profundo
    'Galaxia de Andrómeda (M31)': 'Andromeda Galaxy (M31)', 'Galaxia del Triángulo (M33)': 'Triangulum Galaxy (M33)', 'Galaxia de Bode (M81)': "Bode's Galaxy (M81)", 'Galaxia del Remolino (M51)': 'Whirlpool Galaxy (M51)', 'Gran Nube de Magallanes': 'Large Magellanic Cloud', 'Pequeña Nube de Magallanes': 'Small Magellanic Cloud',
    'Nebulosa de Orión (M42)': 'Orion Nebula (M42)', 'Nebulosa de la Laguna (M8)': 'Lagoon Nebula (M8)', 'Nebulosa Dumbbell (M27)': 'Dumbbell Nebula (M27)', 'Nebulosa del Anillo (M57)': 'Ring Nebula (M57)', 'Nebulosa del Cangrejo (M1)': 'Crab Nebula (M1)', 'Nebulosa de Eta Carinae': 'Eta Carinae Nebula',
    'Pléyades (M45)': 'Pleiades (M45)', 'Pesebre (M44)': 'Beehive Cluster (M44)', 'Cúmulo de Hércules (M13)': 'Hercules Cluster (M13)', 'Cúmulo globular M22': 'Globular cluster M22', 'Cúmulo globular M4': 'Globular cluster M4', 'Cúmulo de Ptolomeo (M7)': "Ptolemy's Cluster (M7)", 'Doble Cúmulo de Perseo': 'Perseus Double Cluster',
    'entre 2,1 y 3,3 UA (entre Marte y Júpiter)': 'between 2.1 and 3.3 AU (between Mars and Jupiter)', 'entre 30 y 50 UA (más allá de Neptuno)': 'between 30 and 50 AU (beyond Neptune)',
    'Estrella de tipo G2V': 'G2V-type star', 'Planeta del sistema solar': 'Solar System planet', 'Cometa periódico': 'Periodic comet'
  };

  // fragmentos para datos semilla (tamaños, periodos, distancias, subtítulos)
  const FR = [
    ['mil millones de masas solares', 'billion solar masses'], ['millones de masas solares', 'million solar masses'], ['masas solares', 'solar masses'], ['Radio de Schwarzschild', 'Schwarzschild radius'],
    ['Galaxia elíptica gigante', 'Giant elliptical galaxy'], ['Agujero negro supermasivo', 'Supermassive black hole'], ['agujero negro supermasivo', 'supermassive black hole'], ['Agujero negro estelar', 'Stellar-mass black hole'], ['Cuásar hiperluminoso', 'Hyperluminous quasar'],
    ['Región del sistema solar', 'Solar System region'], ['mil millones de años luz', 'billion light-years'],
    ['Galaxia espiral barrada', 'Barred spiral galaxy'], ['Galaxia espiral', 'Spiral galaxy'], ['Galaxia elíptica', 'Elliptical galaxy'], ['Galaxia lenticular', 'Lenticular galaxy'], ['Galaxia irregular', 'Irregular galaxy'],
    ['Resto de supernova', 'Supernova remnant'], ['Nebulosa de emisión', 'Emission nebula'], ['Nebulosa planetaria', 'Planetary nebula'], ['Nebulosa de reflexión', 'Reflection nebula'], ['Asterismo', 'Asterism'], ['Nube estelar', 'Star cloud'], ['Estrella doble', 'Double star'],
    ['Planeta del sistema solar', 'Solar System planet'], ['Satélite natural de la Tierra', "Earth's natural satellite"], ['Satélite de la Tierra', 'Moon of Earth'], ['Satélite de ', 'Moon of '],
    ['Estrella · ', 'Star · '], ['Constelación · ', 'Constellation · '], ['Cúmulo abierto', 'Open cluster'], ['Cúmulo globular', 'Globular cluster'], ['Galaxia', 'Galaxy'], ['Nebulosa', 'Nebula'], ['Cometa periódico', 'Periodic comet'],
    ['alrededor de la Tierra', 'around the Earth'], ['de la Tierra', 'from Earth'], ['de diámetro', 'in diameter'], ['es el centro', 'is the centre'], ['próximo perihelio', 'next perihelion'], ['aprox.', 'approx.'],
    ['millones de años luz', 'million light-years'], ['años luz', 'light-years'], ['año luz', 'light-year'], ['años', 'years'], ['días', 'days'], ['día', 'day'], ['millones', 'million'], [' UA', ' AU']
  ];
  const PL = { 'Tierra': 'Earth', 'Marte': 'Mars', 'Júpiter': 'Jupiter', 'Saturno': 'Saturn', 'Neptuno': 'Neptune', 'Urano': 'Uranus', 'Mercurio': 'Mercury' };

  G.t = s => (G.lang === 'en' && typeof s === 'string' && D[s] !== undefined) ? D[s] : s;
  // datos semilla con números
  G.td = s => {
    if (G.lang !== 'en' || typeof s !== 'string' || !s) return s;
    if (D[s] !== undefined) return D[s];
    let r = s;
    FR.forEach(f => { r = r.split(f[0]).join(f[1]); });
    r = r.replace(/(Moon of )([^\s·,]+)/g, (m, a, p) => a + (PL[p] || p));
    r = r.replace(/(\d),(\d)/g, '$1.$2');
    for (let i = 0; i < 3; i++) r = r.replace(/(\d) (\d{3})(?!\d)/g, '$1,$2');
    return r;
  };
  G.D = D;
  // retos: id → [título, cómo, consejo]
  G.CH = {
    'luna-llena': ['Full Moon', 'Photograph the full Moon with the naked eye or zoom.', 'ISO 100, f/8, 1/250 s. On a phone, use manual mode and lower the exposure.'],
    'fases-luna': ['Moon phases', 'Collect at least 4 different phases on different days.', 'Use the same framing every night so you can make a collage.'],
    'luna-ceniza': ['Earthshine', 'A thin crescent Moon with its dark side faintly lit.', 'Best at dusk, with a tripod and 1–2 s exposure.'],
    'venus': ['Bright Venus', 'Morning or evening star, the brightest object after the Sun and Moon.', 'It appears near the horizon, so look for a nice landscape.'],
    'orion-cinturon': ['Orion and its belt', 'The constellation Orion with the three belt stars clearly visible.', 'ISO 1600–3200, 15–20 s, wide-angle lens wide open.'],
    'osa-mayor-polaris': ['Ursa Major and Polaris', 'Find Polaris using the end stars of the Plough.', 'Take the chance to shoot a star trail around Polaris.'],
    'casiopea': ['Cassiopeia’s W', 'The “W” of Cassiopeia in a dark sky.', '20 s at ISO 1600 without the stars trailing.'],
    'estrella-fugaz': ['A shooting star', 'Capture a meteor during a meteor shower.', 'Continuous 15–20 s shooting, wide angle, aim away from the radiant.'],
    'pleyades': ['The Pleiades', 'The M45 cluster, with the naked eye or binoculars.', 'Best in autumn and winter; 10 s with a light telephoto lens.'],
    'jupiter-lunas': ['Jupiter and its Galilean moons', 'Jupiter with at least two of its moons visible.', 'Stabilised binoculars or a small telescope; low ISO.'],
    'saturno-anillos': ['Saturn and its rings', 'The planet with its rings recognisable.', 'Needs a telescope of 60 mm or more and about 100× magnification.'],
    'marte': ['Reddish Mars', 'Mars as a bright orange dot, or with a visible disc.', 'Much better near opposition.'],
    'conjuncion': ['Close conjunction', 'The Moon and a planet, or two planets, very close together in the sky.', 'Check the Agenda for dates.'],
    'via-lactea': ['The Milky Way', 'A band of the Milky Way from a dark sky.', 'Far from cities, ISO 3200, f/2.8, 15–20 s, no Moon.'],
    'nebulosa-orion': ['Orion Nebula (M42)', 'The nebula below Orion’s sword.', '200 mm+ telephoto and several stacked shots.'],
    'andromeda': ['Andromeda Galaxy (M31)', 'An elongated smudge visible on dark nights.', 'Best in autumn; telephoto and several stacked exposures.'],
    'traza-estelar': ['Star trails', 'Circles of stars spinning around Polaris.', 'Many 30 s shots over 1–2 hours, then stack them.'],
    'doble-cumulo': ['Perseus Double Cluster', 'Two clusters together between Perseus and Cassiopeia.', 'Binoculars or a telescope at low magnification.'],
    'iss': ['The Space Station', 'A pass of the ISS as a bright line.', '20–30 s exposure at the moment of the pass (Heavens-Above, NASA Spot the Station).'],
    'eclipse': ['An eclipse', 'Any solar (with a filter) or lunar eclipse.', 'Never look at the Sun without a certified solar filter.'],
    'cometa': ['A comet', 'A comet with its tail, even a faint one.', 'When one is visible, check up-to-date ephemerides.'],
    'sol-manchas': ['Sunspots', 'The Sun through a solar filter showing a sunspot.', 'Only with a certified filter in front of the lens.']
  };
  // eclipses: [título, descripción] en el mismo orden que G.eclipses
  G.ECL = [
    ['Annular solar eclipse', 'Annular from southern South America, partial over the south Atlantic and west Africa.'],
    ['Penumbral lunar eclipse', 'Visible from the Americas, Europe and Africa (very subtle).'],
    ['Penumbral lunar eclipse', 'Visible from Asia, Australia and part of the Americas (very subtle).'],
    ['Total solar eclipse', 'Total over north Africa and southern Iberia/the Strait of Gibraltar; partial across much of Europe. Check the exact path.'],
    ['Penumbral lunar eclipse', 'Visible from the Americas (very subtle).'],
    ['Partial lunar eclipse', 'Visible from the Americas, Europe and Africa.'],
    ['Annular solar eclipse', 'Annular over the Atlantic and southern Europe (check visibility); partial from the Iberian Peninsula.'],
    ['Partial lunar eclipse', 'Visible from Europe, Africa and Asia.'],
    ['Total solar eclipse', 'Total over Australia and New Zealand.'],
    ['Total lunar eclipse', 'Visible from Europe, Africa and Asia.']
  ];
})(window.G);
