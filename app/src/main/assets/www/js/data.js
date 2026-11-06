/* Girounivers · datos: estrellas, constelaciones, objetos de cielo profundo, semillas de catálogo y retos */
window.G = window.G || {};
(function (G) {
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  G.slug = slug;

  // nombre | AR (h m) | Dec (° ')  | magnitud | constelación
  const STAR_TXT = `
Sirius|06 45.1|-16 43|-1.46|CMa
Canopus|06 24.0|-52 42|-0.74|Car
Arcturus|14 15.7|19 11|-0.05|Boo
Rigil Kent|14 39.6|-60 50|-0.01|Cen
Vega|18 36.9|38 47|0.03|Lyr
Capella|05 16.7|46 00|0.08|Aur
Rigel|05 14.5|-08 12|0.13|Ori
Procyon|07 39.3|05 14|0.34|CMi
Betelgeuse|05 55.2|07 24|0.42|Ori
Achernar|01 37.7|-57 14|0.46|Eri
Hadar|14 03.8|-60 22|0.61|Cen
Altair|19 50.8|08 52|0.76|Aql
Acrux|12 26.6|-63 06|0.76|Cru
Aldebaran|04 35.9|16 31|0.85|Tau
Antares|16 29.4|-26 26|0.96|Sco
Spica|13 25.2|-11 10|0.97|Vir
Pollux|07 45.3|28 02|1.14|Gem
Fomalhaut|22 57.7|-29 37|1.16|PsA
Deneb|20 41.4|45 17|1.25|Cyg
Mimosa|12 47.7|-59 41|1.25|Cru
Regulus|10 08.4|11 58|1.35|Leo
Adhara|06 58.6|-28 58|1.50|CMa
Castor|07 34.6|31 53|1.58|Gem
Gacrux|12 31.2|-57 07|1.64|Cru
Shaula|17 33.6|-37 06|1.62|Sco
Bellatrix|05 25.1|06 21|1.64|Ori
Elnath|05 26.3|28 36|1.65|Tau
Miaplacidus|09 13.2|-69 43|1.67|Car
Alnilam|05 36.2|-01 12|1.69|Ori
Alnair|22 08.2|-46 58|1.74|Gru
Alnitak|05 40.8|-01 57|1.77|Ori
Alioth|12 54.0|55 58|1.76|UMa
Dubhe|11 03.7|61 45|1.79|UMa
Mirfak|03 24.3|49 52|1.79|Per
Wezen|07 08.4|-26 24|1.84|CMa
Sargas|17 37.3|-43 00|1.86|Sco
Kaus Australis|18 24.2|-34 23|1.85|Sgr
Avior|08 22.5|-59 31|1.86|Car
Alkaid|13 47.5|49 19|1.86|UMa
Menkalinan|05 59.5|44 57|1.90|Aur
Atria|16 48.7|-69 02|1.92|TrA
Alhena|06 37.7|16 24|1.93|Gem
Peacock|20 25.6|-56 44|1.94|Pav
Mirzam|06 22.7|-17 57|1.98|CMa
Alphard|09 27.6|-08 40|1.98|Hya
Polaris|02 31.8|89 16|1.98|UMi
Hamal|02 07.2|23 27|2.00|Ari
Algieba|10 20.0|19 50|2.01|Leo
Diphda|00 43.6|-17 59|2.04|Cet
Mizar|13 23.9|54 56|2.04|UMa
Nunki|18 55.3|-26 18|2.05|Sgr
Menkent|14 06.7|-36 22|2.06|Cen
Mirach|01 09.7|35 37|2.06|And
Alpheratz|00 08.4|29 05|2.06|And
Rasalhague|17 34.9|12 34|2.07|Oph
Kochab|14 50.7|74 09|2.07|UMi
Saiph|05 47.8|-09 40|2.06|Ori
Denebola|11 49.1|14 34|2.14|Leo
Algol|03 08.2|40 57|2.10|Per
Tiaki|22 42.7|-46 53|2.10|Gru
Almach|02 03.9|42 20|2.10|And
Naos|08 03.6|-40 00|2.25|Pup
Eltanin|17 56.6|51 29|2.23|Dra
Schedar|00 40.5|56 32|2.24|Cas
Caph|00 09.2|59 09|2.27|Cas
γ Cas|00 56.7|60 43|2.47|Cas
Ruchbah|01 25.8|60 14|2.68|Cas
Segin|01 54.4|63 40|3.38|Cas
Sadr|20 22.2|40 15|2.20|Cyg
Gienah|20 46.2|33 58|2.46|Cyg
Albireo|19 30.7|27 58|3.18|Cyg
δ Cyg|19 45.0|45 08|2.87|Cyg
Merak|11 01.8|56 23|2.37|UMa
Phecda|11 53.8|53 41|2.44|UMa
Megrez|12 15.4|57 02|3.31|UMa
Meissa|05 35.1|09 56|3.39|Ori
Mintaka|05 32.0|-00 18|2.23|Ori
ζ Tau|05 37.6|21 09|3.0|Tau
ε Tau|04 28.6|19 11|3.53|Tau
γ Tau|04 19.8|15 38|3.65|Tau
Mebsuda|06 43.9|25 08|3.06|Gem
Tejat|06 22.9|22 31|2.88|Gem
Wasat|07 20.1|21 59|3.53|Gem
Mekbuda|07 04.1|20 34|3.79|Gem
Propus|06 14.9|22 30|3.31|Gem
Zosma|11 14.1|20 31|2.56|Leo
Chertan|11 14.2|15 26|3.34|Leo
Rasalas|09 53.9|26 00|3.88|Leo
η Leo|10 07.3|16 46|3.52|Leo
Adhafera|10 16.7|23 25|3.44|Leo
ε Leo|09 45.9|23 46|2.98|Leo
Graffias|16 05.4|-19 48|2.62|Sco
Dschubba|16 00.3|-22 37|2.32|Sco
π Sco|15 58.9|-26 07|2.89|Sco
σ Sco|16 21.2|-25 36|2.89|Sco
τ Sco|16 35.9|-28 13|2.82|Sco
ε Sco|16 50.2|-34 17|2.29|Sco
μ Sco|16 51.9|-38 03|3.04|Sco
ζ Sco|16 54.6|-42 22|3.62|Sco
η Sco|17 12.2|-43 14|3.33|Sco
ι Sco|17 47.6|-40 08|3.03|Sco
Girtab|17 42.5|-39 01|2.41|Sco
Lesath|17 30.8|-37 18|2.69|Sco
Kaus Media|18 21.0|-29 50|2.70|Sgr
Kaus Borealis|18 28.0|-25 25|2.81|Sgr
Ascella|19 02.6|-29 53|2.60|Sgr
τ Sgr|19 06.9|-27 40|3.32|Sgr
φ Sgr|18 45.7|-26 59|3.17|Sgr
Alnasl|18 05.8|-30 25|2.99|Sgr
Aludra|07 24.1|-29 18|2.45|CMa
Furud|06 20.3|-30 03|3.02|CMa
Muliphein|07 03.8|-15 38|4.10|CMa
Gomeisa|07 27.2|08 17|2.89|CMi
Mahasim|05 59.7|37 13|2.62|Aur
Hassaleh|04 57.0|33 10|2.69|Aur
Izar|14 45.0|27 04|2.37|Boo
Seginus|14 32.1|38 18|3.04|Boo
Nekkar|15 01.9|40 23|3.50|Boo
Muphrid|13 54.7|18 24|2.68|Boo
ρ Boo|14 31.8|30 22|3.58|Boo
δ Boo|15 15.5|33 19|3.47|Boo
Porrima|12 41.7|-01 27|2.74|Vir
Vindemiatrix|13 02.2|10 57|2.83|Vir
Zavijava|11 50.7|01 46|3.59|Vir
Heze|13 34.7|-00 36|3.37|Vir
Zaniah|12 19.9|-00 40|3.89|Vir
Minelauva|12 55.6|03 24|3.38|Vir
Sheliak|18 50.1|33 22|3.52|Lyr
Sulafat|18 58.8|32 41|3.25|Lyr
δ Lyr|18 54.5|36 54|4.30|Lyr
ζ Lyr|18 44.8|37 36|4.36|Lyr
Tarazed|19 46.3|10 37|2.72|Aql
Alshain|19 55.3|06 24|3.71|Aql
δ Aql|19 25.5|03 07|3.36|Aql
ζ Aql|19 05.0|13 52|2.99|Aql
θ Aql|20 11.2|-00 49|3.23|Aql
λ Aql|19 06.2|-04 53|3.44|Aql
Alderamin|21 18.6|62 35|2.51|Cep
Alfirk|21 28.7|70 33|3.23|Cep
Errai|23 39.3|77 38|3.21|Cep
ι Cep|22 49.7|66 12|3.52|Cep
ζ Cep|22 10.9|58 12|3.35|Cep
Pherkad|15 20.7|71 50|3.05|UMi
Yildun|17 32.2|86 35|4.36|UMi
ε UMi|16 46.0|82 02|4.21|UMi
ζ UMi|15 44.1|77 47|4.32|UMi
η UMi|16 17.5|75 45|4.95|UMi
Rastaban|17 30.4|52 18|2.79|Dra
Grumium|17 53.5|56 52|3.75|Dra
ν Dra|17 32.2|55 11|4.88|Dra
Thuban|14 04.4|64 23|3.65|Dra
Altais|19 12.9|67 39|3.07|Dra
Aldhibah|17 08.8|65 43|3.17|Dra
Atik|03 54.1|31 53|2.85|Per
ε Per|03 57.9|40 01|2.89|Per
δ Per|03 42.9|47 47|3.01|Per
γ Per|03 04.8|53 30|2.93|Per
η Per|02 50.7|55 54|3.76|Per
δ And|00 39.3|30 51|3.27|And
μ And|00 56.7|38 30|3.87|And
ν And|00 49.1|41 05|4.53|And
Markab|23 04.8|15 12|2.49|Peg
Scheat|23 03.8|28 05|2.42|Peg
Algenib|00 13.2|15 11|2.83|Peg
Enif|21 44.2|09 53|2.39|Peg
Homam|22 41.5|10 50|3.40|Peg
Sheratan|01 54.6|20 48|2.64|Ari
Mesarthim|01 53.5|19 18|3.88|Ari
Imai|12 15.1|-58 45|2.80|Cru
Muhlifain|12 41.5|-48 58|2.17|Cen
ε Cen|13 39.9|-53 28|2.30|Cen
ζ Cen|13 55.5|-47 17|2.55|Cen
η Cen|14 35.5|-42 09|2.31|Cen
Alphecca|15 34.7|26 43|2.23|CrB
Nusakan|15 27.8|29 06|3.68|CrB
θ CrB|15 32.9|31 21|4.14|CrB
γ CrB|15 42.7|26 18|3.84|CrB
δ CrB|15 49.0|26 04|4.63|CrB
ε CrB|15 57.6|26 53|4.15|CrB
ι CrB|16 01.4|29 51|4.99|CrB
Kornephoros|16 30.2|21 29|2.77|Her
ζ Her|16 41.3|31 36|2.81|Her
η Her|16 42.9|38 55|3.53|Her
π Her|17 15.0|36 49|3.16|Her
ε Her|17 00.3|30 56|3.92|Her
Rasalgethi|17 14.6|14 23|3.31|Her
Deneb Algedi|21 47.0|-16 08|2.85|Cap
Dabih|20 21.0|-14 47|3.08|Cap
Algedi|20 18.1|-12 33|3.57|Cap
Nashira|21 40.1|-16 40|3.68|Cap
ψ Cap|20 46.1|-25 16|4.14|Cap
ω Cap|20 51.0|-26 55|4.11|Cap
ζ Cap|21 26.7|-22 25|3.74|Cap
θ Cap|21 06.9|-17 14|4.07|Cap
ι Cap|21 22.0|-16 50|4.28|Cap
Zubeneschamali|15 17.0|-09 23|2.61|Lib
Zubenelgenubi|14 50.9|-16 02|2.75|Lib
γ Lib|15 35.5|-14 47|3.91|Lib
σ Lib|15 04.1|-25 17|3.29|Lib
β TrA|15 55.1|-63 26|2.85|TrA
γ TrA|15 18.9|-68 41|2.89|TrA
Aspidiske|09 17.1|-59 16|2.25|Car
Suhail|09 08.0|-43 26|2.21|Vel
Regor|08 09.5|-47 20|1.78|Vel
Sadalsuud|21 31.6|-05 34|2.91|Aqr
Sadalmelik|22 05.8|-00 19|2.96|Aqr
Mira|02 19.3|-02 59|3.5|Cet
Alcyone|03 47.0|24 06|2.87|Tau
`.trim().split('\n');

  function parseHM(s) { const [h, m] = s.split(' ').map(Number); return (h + m / 60) * 15; }
  function parseDM(s) { const neg = s.trim().startsWith('-'); const [d, m] = s.replace('-', '').trim().split(' ').map(Number); return (neg ? -1 : 1) * (d + m / 60); }

  const NOW_YEARS = (Date.now() - Date.UTC(2000, 0, 1, 12)) / 31557600000;
  G.stars = STAR_TXT.map(l => {
    const p = l.split('|');
    const eq = G.astro.precess(parseHM(p[1]), parseDM(p[2]), NOW_YEARS);
    return { id: slug(p[0]), name: p[0], ra: eq.ra, dec: eq.dec, ra0: parseHM(p[1]), dec0: parseDM(p[2]), mag: parseFloat(p[3]), con: p[4], kind: 'star' };
  });
  G.starByName = {};
  G.stars.forEach(s => { G.starByName[s.name] = s; });

  // Constelaciones: id, nombre, abreviatura, polilíneas con nombres de estrellas
  const CONS = [
    ['orion', 'Orión', 'Ori', [['Meissa', 'Betelgeuse', 'Alnitak'], ['Meissa', 'Bellatrix', 'Mintaka'], ['Alnitak', 'Alnilam', 'Mintaka'], ['Alnitak', 'Saiph'], ['Mintaka', 'Rigel']]],
    ['osa-mayor', 'Osa Mayor', 'UMa', [['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Dubhe'], ['Megrez', 'Alioth', 'Mizar', 'Alkaid']]],
    ['osa-menor', 'Osa Menor', 'UMi', [['Polaris', 'Yildun', 'ε UMi', 'ζ UMi', 'η UMi', 'Pherkad', 'Kochab', 'ζ UMi']]],
    ['casiopea', 'Casiopea', 'Cas', [['Caph', 'Schedar', 'γ Cas', 'Ruchbah', 'Segin']]],
    ['cefeo', 'Cefeo', 'Cep', [['Alderamin', 'Alfirk', 'Errai', 'ι Cep', 'ζ Cep', 'Alderamin']]],
    ['cisne', 'Cisne', 'Cyg', [['Deneb', 'Sadr', 'Albireo'], ['δ Cyg', 'Sadr', 'Gienah']]],
    ['lira', 'Lira', 'Lyr', [['Vega', 'ζ Lyr', 'δ Lyr', 'Sulafat', 'Sheliak', 'ζ Lyr']]],
    ['aguila', 'Águila', 'Aql', [['Tarazed', 'Altair', 'Alshain'], ['Altair', 'δ Aql', 'θ Aql'], ['δ Aql', 'λ Aql'], ['ζ Aql', 'Tarazed']]],
    ['escorpio', 'Escorpio', 'Sco', [['Graffias', 'Dschubba', 'π Sco'], ['Dschubba', 'σ Sco', 'Antares', 'τ Sco', 'ε Sco', 'μ Sco', 'ζ Sco', 'η Sco', 'Sargas', 'ι Sco', 'Girtab', 'Shaula', 'Lesath']]],
    ['leo', 'Leo', 'Leo', [['Regulus', 'η Leo', 'Algieba', 'Adhafera', 'Rasalas', 'ε Leo'], ['Algieba', 'Zosma', 'Denebola', 'Chertan', 'Zosma'], ['Chertan', 'Regulus']]],
    ['tauro', 'Tauro', 'Tau', [['ζ Tau', 'Aldebaran', 'γ Tau', 'ε Tau', 'Elnath']]],
    ['geminis', 'Géminis', 'Gem', [['Castor', 'Mebsuda', 'Tejat', 'Propus'], ['Pollux', 'Wasat', 'Mekbuda', 'Alhena'], ['Castor', 'Pollux']]],
    ['can-mayor', 'Can Mayor', 'CMa', [['Mirzam', 'Sirius', 'Muliphein'], ['Sirius', 'Wezen', 'Adhara'], ['Wezen', 'Aludra'], ['Mirzam', 'Furud']]],
    ['can-menor', 'Can Menor', 'CMi', [['Procyon', 'Gomeisa']]],
    ['auriga', 'Auriga', 'Aur', [['Capella', 'Menkalinan', 'Mahasim', 'Elnath', 'Hassaleh', 'Capella']]],
    ['boyero', 'Boyero', 'Boo', [['Arcturus', 'Izar', 'δ Boo', 'Nekkar', 'Seginus', 'ρ Boo', 'Arcturus'], ['Arcturus', 'Muphrid']]],
    ['virgo', 'Virgo', 'Vir', [['Zavijava', 'Zaniah', 'Porrima', 'Heze', 'Spica'], ['Porrima', 'Minelauva', 'Vindemiatrix']]],
    ['corona-boreal', 'Corona Boreal', 'CrB', [['θ CrB', 'Nusakan', 'Alphecca', 'γ CrB', 'δ CrB', 'ε CrB', 'ι CrB']]],
    ['hercules', 'Hércules', 'Her', [['η Her', 'ζ Her', 'ε Her', 'π Her', 'η Her'], ['ζ Her', 'Kornephoros'], ['Kornephoros', 'Rasalgethi']]],
    ['dragon', 'Dragón', 'Dra', [['Eltanin', 'Rastaban', 'ν Dra', 'Grumium', 'Eltanin']]],
    ['perseo', 'Perseo', 'Per', [['η Per', 'γ Per', 'Mirfak', 'δ Per'], ['Mirfak', 'Algol'], ['Mirfak', 'ε Per', 'Atik']]],
    ['andromeda', 'Andrómeda', 'And', [['Alpheratz', 'δ And', 'Mirach', 'Almach'], ['Mirach', 'μ And', 'ν And']]],
    ['pegaso', 'Pegaso', 'Peg', [['Markab', 'Scheat', 'Alpheratz', 'Algenib', 'Markab'], ['Markab', 'Homam', 'Enif']]],
    ['aries', 'Aries', 'Ari', [['Hamal', 'Sheratan', 'Mesarthim']]],
    ['cruz-del-sur', 'Cruz del Sur', 'Cru', [['Acrux', 'Gacrux'], ['Mimosa', 'Imai']]],
    ['centauro', 'Centauro', 'Cen', [['Muhlifain', 'ε Cen', 'Hadar'], ['ε Cen', 'ζ Cen', 'Menkent', 'η Cen']]],
    ['sagitario', 'Sagitario', 'Sgr', [['Alnasl', 'Kaus Australis', 'Ascella', 'τ Sgr', 'Nunki', 'φ Sgr', 'Kaus Borealis', 'Kaus Media', 'Alnasl']]],
    ['capricornio', 'Capricornio', 'Cap', [['Algedi', 'Dabih', 'ψ Cap', 'ω Cap', 'ζ Cap', 'Nashira', 'Deneb Algedi', 'ι Cap', 'θ Cap', 'Algedi']]],
    ['libra', 'Libra', 'Lib', [['Zubenelgenubi', 'Zubeneschamali', 'γ Lib', 'σ Lib', 'Zubenelgenubi']]],
    ['triangulo-austral', 'Triángulo Austral', 'TrA', [['Atria', 'β TrA', 'γ TrA', 'Atria']]]
  ];
  G.cons = CONS.map(c => {
    const lines = c[3].map(pl => pl.map(n => G.starByName[n]));
    const used = new Set(); lines.forEach(pl => pl.forEach(s => used.add(s)));
    let x = 0, y = 0, z = 0;
    used.forEach(s => { const r = G.astro.RAD; x += Math.cos(s.dec * r) * Math.cos(s.ra * r); y += Math.cos(s.dec * r) * Math.sin(s.ra * r); z += Math.sin(s.dec * r); });
    const n = Math.hypot(x, y, z);
    const ra = G.astro.norm(Math.atan2(y, x) * G.astro.DEG), dec = Math.asin(z / n) * G.astro.DEG;
    return { id: c[0], name: c[1], abbr: c[2], lines, ra, dec, kind: 'constellation' };
  });

  // Cielo profundo: nombre | AR | Dec | mag | tipo | alias
  const DSO_TXT = `
Galaxia de Andrómeda (M31)|00 42.7|41 16|3.4|galaxy|M31
Galaxia del Triángulo (M33)|01 33.9|30 39|5.7|galaxy|M33
Galaxia de Bode (M81)|09 55.6|69 04|6.9|galaxy|M81
Galaxia del Remolino (M51)|13 29.9|47 12|8.4|galaxy|M51
Gran Nube de Magallanes|05 23.6|-69 45|0.9|galaxy|LMC
Pequeña Nube de Magallanes|00 52.7|-72 48|2.7|galaxy|SMC
Nebulosa de Orión (M42)|05 35.4|-05 23|4.0|nebula|M42
Nebulosa de la Laguna (M8)|18 03.8|-24 23|6.0|nebula|M8
Nebulosa Dumbbell (M27)|19 59.6|22 43|7.5|nebula|M27
Nebulosa del Anillo (M57)|18 53.6|33 02|8.8|nebula|M57
Nebulosa del Cangrejo (M1)|05 34.5|22 01|8.4|nebula|M1
Nebulosa de Eta Carinae|10 45.1|-59 41|3.0|nebula|NGC 3372
Pléyades (M45)|03 47.0|24 07|1.6|cluster|M45
Pesebre (M44)|08 40.4|19 40|3.7|cluster|M44
Cúmulo de Hércules (M13)|16 41.7|36 28|5.8|globular|M13
Cúmulo globular M22|18 36.4|-23 54|5.1|globular|M22
Cúmulo globular M4|16 23.6|-26 32|5.6|globular|M4
Omega Centauri|13 26.8|-47 29|3.7|globular|NGC 5139
47 Tucanae|00 24.1|-72 05|4.0|globular|NGC 104
Cúmulo de Ptolomeo (M7)|17 53.9|-34 47|3.3|cluster|M7
Doble Cúmulo de Perseo|02 20.0|57 08|4.0|cluster|NGC 869/884
`.trim().split('\n');
  G.dsos = DSO_TXT.map(l => {
    const p = l.split('|');
    const eq = G.astro.precess(parseHM(p[1]), parseDM(p[2]), NOW_YEARS);
    return { id: slug(p[0]), name: p[0], ra: eq.ra, dec: eq.dec, mag: parseFloat(p[3]), type: p[4], alias: p[5], kind: 'dso' };
  });

  G.CATS = [
    { id: 'planeta', name: 'Planetas', icon: '◉' },
    { id: 'satelite', name: 'Satélites', icon: '☾' },
    { id: 'estrella', name: 'Estrellas', icon: '✦' },
    { id: 'constelacion', name: 'Constelaciones', icon: '✧' },
    { id: 'cometa', name: 'Cometas', icon: '☄' },
    { id: 'objeto', name: 'Objetos', icon: '❂' },
    { id: 'galaxia', name: 'Galaxias', icon: '◌' }
  ];

  // Semillas del catálogo. Solo se rellenan datos medibles básicos; los textos los pones tú.
  function E(id, cat, name, sub, o) {
    return Object.assign({ id, cat, name, sub: sub || '', desc: '', info: '', myth: '', size: '', period: '', distSun: '', distLy: '', extra: [], notes: '', observed: false, seed: true }, o || {});
  }
  const seeds = [];
  seeds.push(E('sol', 'estrella', 'Sol', 'Estrella de tipo G2V', { size: '1 392 700 km de diámetro', distSun: '0 UA (es el centro)' , distLy: '0,0000158 años luz (1 UA)'}));
  [['mercurio', 'Mercurio', '4 879 km', '87,97 días', '0,387 UA (57,9 M km)'],
   ['venus', 'Venus', '12 104 km', '224,7 días', '0,723 UA (108,2 M km)'],
   ['tierra', 'Tierra', '12 742 km', '365,26 días', '1,000 UA (149,6 M km)'],
   ['marte', 'Marte', '6 779 km', '687 días (1,88 años)', '1,524 UA (227,9 M km)'],
   ['jupiter', 'Júpiter', '139 820 km', '11,86 años', '5,203 UA (778,5 M km)'],
   ['saturno', 'Saturno', '116 460 km', '29,45 años', '9,537 UA (1 433 M km)'],
   ['urano', 'Urano', '50 724 km', '84,0 años', '19,19 UA (2 871 M km)'],
   ['neptuno', 'Neptuno', '49 244 km', '164,8 años', '30,07 UA (4 495 M km)']
  ].forEach(p => seeds.push(E(p[0], 'planeta', p[1], 'Planeta del sistema solar', { size: p[2] + ' de diámetro', period: p[3], distSun: p[4] })));
  [['luna', 'Luna', 'Satélite de la Tierra', '3 474 km de diámetro', '27,32 días (alrededor de la Tierra)', '384 400 km de la Tierra'],
   ['fobos', 'Fobos', 'Satélite de Marte', '', '', ''], ['deimos', 'Deimos', 'Satélite de Marte', '', '', ''],
   ['io', 'Ío', 'Satélite de Júpiter', '', '', ''], ['europa', 'Europa', 'Satélite de Júpiter', '', '', ''],
   ['ganimedes', 'Ganímedes', 'Satélite de Júpiter', '', '', ''], ['calisto', 'Calisto', 'Satélite de Júpiter', '', '', ''],
   ['titan', 'Titán', 'Satélite de Saturno', '', '', ''], ['encelado', 'Encélado', 'Satélite de Saturno', '', '', ''],
   ['triton', 'Tritón', 'Satélite de Neptuno', '', '', '']
  ].forEach(p => seeds.push(E(p[0], 'satelite', p[1], p[2], { size: p[3], period: p[4], distSun: p[5] })));
  const starFacts = { sirius: '8,6', vega: '25', 'rigil-kent': '4,4', arcturus: '37', altair: '17', procyon: '11,5', fomalhaut: '25' };
  G.stars.filter(s => s.mag < 2.1).forEach(s => {
    seeds.push(E(s.id, 'estrella', s.name, 'Estrella · ' + s.con, { distLy: starFacts[s.id] ? starFacts[s.id] + ' años luz' : '' }));
  });
  G.cons.forEach(c => seeds.push(E(c.id, 'constelacion', c.name, 'Constelación · ' + c.abbr)));
  seeds.push(E('halley', 'cometa', 'Cometa Halley', 'Cometa periódico', { period: 'aprox. 76 años (próximo perihelio: 2061)' }));
  const dsoLy = { 'galaxia-de-andromeda-m31': 'aprox. 2,5 millones de años luz', 'galaxia-del-triangulo-m33': 'aprox. 2,7 millones de años luz', 'gran-nube-de-magallanes': 'aprox. 160 000 años luz', 'pequena-nube-de-magallanes': 'aprox. 200 000 años luz', 'galaxia-del-remolino-m51': 'aprox. 23 millones de años luz', 'galaxia-de-bode-m81': 'aprox. 12 millones de años luz' };
  G.dsos.forEach(o => seeds.push(E(o.id, o.type === 'galaxy' ? 'galaxia' : 'objeto', o.name, ({ galaxy: 'Galaxia', nebula: 'Nebulosa', cluster: 'Cúmulo abierto', globular: 'Cúmulo globular' })[o.type] + ' · ' + o.alias, { distLy: dsoLy[o.id] || '' })));
  G.catalogSeeds = seeds;

  // Retos fotográficos
  function C(id, lvl, title, how, tip) { return { id, lvl, title, how, tip, seed: true }; }
  G.challengeSeeds = [
    C('luna-llena', 1, 'Luna llena', 'Fotografía la Luna llena a simple vista o con zoom.', 'ISO 100, f/8, 1/250 s. Con móvil, usa el modo manual y baja la exposición.'),
    C('fases-luna', 1, 'Las fases de la Luna', 'Reúne al menos 4 fases distintas en días diferentes.', 'Mismo encuadre cada noche para poder hacer un collage.'),
    C('luna-ceniza', 1, 'Luz cenicienta', 'Luna creciente fina con la parte oscura apenas iluminada.', 'Mejor al atardecer, con trípode y 1–2 s de exposición.'),
    C('venus', 1, 'Venus brillante', 'Lucero del alba o de la tarde, el astro más brillante tras Sol y Luna.', 'Aparece cerca del horizonte, busca un paisaje bonito.'),
    C('orion-cinturon', 1, 'Orión y su cinturón', 'Constelación de Orión con las tres Marías bien visibles.', 'ISO 1600–3200, 15–20 s, objetivo ancho abierto.'),
    C('osa-mayor-polaris', 1, 'Osa Mayor y la Estrella Polar', 'Encuentra Polaris usando los extremos del carro.', 'Aprovecha para hacer una traza estelar alrededor de Polaris.'),
    C('casiopea', 1, 'Casiopea en W', 'La “W” de Casiopea en un cielo oscuro.', '20 s con ISO 1600 sin que se arrastren las estrellas.'),
    C('estrella-fugaz', 2, 'Una estrella fugaz', 'Captura un meteoro durante una lluvia de estrellas.', 'Disparo continuo de 15–20 s, gran angular, apunta lejos del radiante.'),
    C('pleyades', 2, 'Las Pléyades', 'El cúmulo M45, a simple vista o con prismáticos.', 'Mejor en otoño e invierno; 10 s con teleobjetivo ligero.'),
    C('jupiter-lunas', 2, 'Júpiter y sus lunas galileanas', 'Júpiter con al menos dos de sus lunas visibles.', 'Prismáticos estabilizados o telescopio pequeño; ISO bajo.'),
    C('saturno-anillos', 2, 'Saturno y sus anillos', 'El planeta con sus anillos reconocibles.', 'Necesita telescopio de 60 mm o más y unos 100× de aumento.'),
    C('marte', 2, 'Marte rojizo', 'Marte como un punto naranja brillante o con disco visible.', 'Cerca de la oposición se ve mucho mejor.'),
    C('conjuncion', 2, 'Conjunción cercana', 'Luna y planeta, o dos planetas, muy próximos en el cielo.', 'Consulta la Agenda para ver las fechas.'),
    C('via-lactea', 3, 'La Vía Láctea', 'Banda de la Vía Láctea desde un cielo oscuro.', 'Lejos de ciudades, ISO 3200, f/2.8, 15–20 s, sin Luna.'),
    C('nebulosa-orion', 3, 'Nebulosa de Orión (M42)', 'La nebulosa bajo la espada de Orión.', 'Teleobjetivo 200 mm+ y varias tomas apiladas.'),
    C('andromeda', 3, 'Galaxia de Andrómeda (M31)', 'Mancha alargada visible en noches oscuras.', 'Mejor en otoño; teleobjetivo y varias exposiciones apiladas.'),
    C('traza-estelar', 3, 'Trazas estelares', 'Círculos de estrellas girando alrededor de Polaris.', 'Muchas tomas de 30 s durante 1–2 horas y apílalas.'),
    C('doble-cumulo', 3, 'Doble Cúmulo de Perseo', 'Dos cúmulos juntos entre Perseo y Casiopea.', 'Prismáticos o telescopio con poco aumento.'),
    C('iss', 2, 'La Estación Espacial', 'Paso de la ISS como una línea brillante.', 'Exposición de 20–30 s en el momento del paso (Heavens-Above, NASA Spot the Station).'),
    C('eclipse', 3, 'Un eclipse', 'Cualquier eclipse de Sol (con filtro) o de Luna.', 'Nunca mires al Sol sin filtro solar homologado.'),
    C('cometa', 3, 'Un cometa', 'Un cometa con su cola, aunque sea tenue.', 'Cuando haya uno visible, consulta efemérides actualizadas.'),
    C('sol-manchas', 3, 'Manchas solares', 'El Sol con filtro solar mostrando alguna mancha.', 'Solo con filtro homologado delante del objetivo.')
  ];

  // Lluvias de estrellas: mes, día, nombre, ZHR, cuerpo origen, radiante
  G.showers = [
    [1, 3, 'Cuadrántidas', 80, '2003 EH1', 'Boyero'],
    [4, 22, 'Líridas', 18, 'C/1861 G1 Thatcher', 'Lira'],
    [5, 6, 'Eta Acuáridas', 50, 'Cometa Halley', 'Acuario'],
    [7, 30, 'Delta Acuáridas del Sur', 25, '96P/Machholz', 'Acuario'],
    [8, 12, 'Perseidas', 100, '109P/Swift-Tuttle', 'Perseo'],
    [10, 21, 'Oriónidas', 20, 'Cometa Halley', 'Orión'],
    [11, 5, 'Táuridas del Sur', 5, '2P/Encke', 'Tauro'],
    [11, 17, 'Leónidas', 15, '55P/Tempel-Tuttle', 'Leo'],
    [12, 14, 'Gemínidas', 150, '3200 Phaethon', 'Géminis'],
    [12, 22, 'Úrsidas', 10, '8P/Tuttle', 'Osa Menor']
  ];
  // Eclipses (fecha UTC aproximada del máximo, tipo, descripción)
  G.eclipses = [
    ['2027-02-06', 'Eclipse solar anular', 'Visible como anular desde el sur de América y parcial en el Atlántico sur y oeste de África.'],
    ['2027-02-20', 'Eclipse lunar penumbral', 'Visible desde América, Europa y África (muy sutil).'],
    ['2027-07-18', 'Eclipse lunar penumbral', 'Visible desde Asia, Australia y parte de América (muy sutil).'],
    ['2027-08-02', 'Eclipse solar total', 'Total en el norte de África y sur de la península ibérica/estrecho de Gibraltar; parcial en gran parte de Europa. Comprueba la franja exacta.'],
    ['2027-08-17', 'Eclipse lunar penumbral', 'Visible desde América (muy sutil).'],
    ['2028-01-12', 'Eclipse lunar parcial', 'Visible desde América, Europa y África.'],
    ['2028-01-26', 'Eclipse solar anular', 'Anular en el Atlántico y sur de Europa (comprueba visibilidad); parcial desde la península ibérica.'],
    ['2028-07-06', 'Eclipse lunar parcial', 'Visible desde Europa, África y Asia.'],
    ['2028-07-22', 'Eclipse solar total', 'Total en Australia y Nueva Zelanda.'],
    ['2028-12-31', 'Eclipse lunar total', 'Visible desde Europa, África y Asia.']
  ];
})(window.G);
