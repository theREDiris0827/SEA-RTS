/* ------------------------------ buildings ------------------------------ */
/* one wall tile. mask: 1 N, 2 E, 4 S, 8 W neighbours of the same side; open: a gate with friends close by.
   Palisade: sharpened logs. Melaka Kubu: planked timber with a walkway. Majapahit: red brick, and the
   gate is a candi bentar, the split gate of Trowulan. */
function wallSprite(kind, team, mask, open) {
  const T = TEAMC[team] || TEAMC[0], maj = team === 1 || team === AYU_CIV;
  return sprite(`w|${kind}|${team}|${mask}|${open ? 1 : 0}`, 16, 34, 2, (P) => {
    const r = P.r, yc = 25, N = mask & 1, E = mask & 2, S = mask & 4, Wn = mask & 8;
    const mat = kind === 'palisade' ? 'log' : maj ? 'brick' : 'timber';
    const hF = mat === 'log' ? 9 : 11, top = yc - hF + 1;
    const C = mat === 'log' ? { face: '#9a6a3a', faceD: '#7a5030', cap: '#b4824a', capD: '#8a5a2b' }
      : mat === 'brick' ? { face: '#b5503a', faceD: '#7d2f22', cap: '#cf7050', capD: '#9a3e2a' }
      : { face: '#8a5a2b', faceD: '#5e3b1c', cap: '#b08050', capD: '#7a5030' };
    // a stretch of face (with its top) from x0 to x1
    const face = (x0, x1) => {
      for (let x = x0; x < x1; x++) {
        if (mat === 'log') {
          // two-pixel logs with a dark gap, each sharpened to a point
          const k = x % 3;
          if (k === 0) { r(x, top + 1, 1, hF + 3, '#4a2e16'); continue; }
          r(x, top + (k === 1 ? -1 : 0), 1, hF + 4 + (k === 1 ? 1 : 0), k === 1 ? C.face : C.faceD);
          r(x, top + (k === 1 ? -1 : 0), 1, 1, k === 1 ? '#d8b080' : '#b4824a'); if (k === 1) r(x, top - 2, 1, 1, '#2a1a10');
          r(x, top + hF + 3, 1, 1, '#4a2e16'); if (k === 2) r(x, top - 1, 1, 1, '#2a1a10');
        } else {
          r(x, top - 1, 1, 1, '#2a1a10'); r(x, top + hF + 4, 1, 1, '#2a1a10');
          r(x, top, 1, 3, C.cap); r(x, top + 3, 1, hF + 1, C.face);
          if (mat === 'brick') { for (let y = top + 4; y < top + hF + 4; y += 2) r(x, y, 1, 1, ((x + (y >> 1)) % 4 === 0) ? C.faceD : '#a6452f'); }
          else { for (let y = top + 5; y < top + hF + 4; y += 3) r(x, y, 1, 1, C.faceD); }
          if (x % 3 === 0) r(x, top - 1, 1, 1, C.capD);
        }
      }
      if (mat === 'timber') r(x0, top + 4, x1 - x0, 1, T.main);
      if (mat === 'log') r(x0, top + 5, x1 - x0, 1, '#5e3b1c');
      if (mat === 'brick') r(x0, top + 3, x1 - x0, 1, '#e0b070');
    };
    // a north-south stretch seen from above: just the top surface
    const strip = (y0, y1) => {
      r(4, y0, 1, y1 - y0, '#2a1a10'); r(11, y0, 1, y1 - y0, '#2a1a10');
      r(5, y0, 6, y1 - y0, C.cap); r(5, y0, 1, y1 - y0, C.capD); r(10, y0, 1, y1 - y0, C.capD);
      if (mat === 'log') for (let y = y0; y < y1; y += 2) { r(6 + (y % 4 ? 2 : 0), y, 1, 1, '#d8b080'); r(8 - (y % 4 ? 2 : 0), y, 1, 1, C.capD); }
      if (mat === 'timber') r(7, y0, 2, y1 - y0, T.main);
    };
    if (N) strip(top - 9, top + 1);
    if (S) strip(top, top + 17);
    if (kind !== 'gate') {
      if (Wn || E) face(Wn ? 0 : 5, E ? 16 : 11);
      if (!S || Wn || E) face(5, 11); else strip(top, top + 3);
      return;
    }
    // gates: wall stubs either side, then the gatehouse
    if (Wn) face(0, 4); if (E) face(12, 16);
    const gt = yc - 13;
    if (maj) {
      // candi bentar: two stepped brick towers with a gap between
      for (const x0 of [1, 10]) {
        r(x0, gt + 3, 5, 15, '#b5503a'); r(x0, gt + 3, 5, 1, '#e0b070'); r(x0 + 1, gt, 3, 3, '#b5503a'); r(x0 + 2, gt - 2, 1, 2, '#cf7050');
        for (let y = gt + 5; y < gt + 18; y += 3) r(x0, y, 5, 1, '#8e3624');
        r(x0 + (x0 < 8 ? 4 : 0), gt + 3, 1, 15, '#7d2f22');
      }
      if (!open) { r(6, gt + 7, 4, 11, '#5e3b1c'); r(6, gt + 7, 4, 1, T.main); r(7, gt + 10, 1, 1, '#f2c94c'); r(8, gt + 13, 1, 1, '#f2c94c'); r(7, gt + 8, 2, 9, '#6e4626'); }
      else { r(6, gt + 7, 1, 11, '#6e4626'); r(9, gt + 7, 1, 11, '#6e4626'); }
    } else {
      // timber gatehouse with a small roof in the team colour
      r(1, gt + 5, 3, 13, WOOD_D); r(12, gt + 5, 3, 13, WOOD_D); r(1, gt + 5, 14, 3, WOOD); r(1, gt + 8, 14, 1, T.main);
      r(0, gt + 2, 16, 3, T.roofA); r(2, gt, 12, 2, T.roofB); r(0, gt + 4, 16, 1, T.roofR); r(7, gt - 2, 2, 2, T.trim);
      if (!open) { r(4, gt + 9, 8, 9, '#6e4626'); r(7, gt + 9, 2, 9, '#4a2e16'); r(5, gt + 12, 1, 1, '#f2c94c'); r(10, gt + 12, 1, 1, '#f2c94c'); }
      else { r(4, gt + 9, 8, 9, '#1a120c'); r(4, gt + 9, 1, 9, '#6e4626'); r(11, gt + 9, 1, 9, '#6e4626'); }
    }
  }, kind === 'gate');
}
/* Sawah: stepped rice terraces with water between the rows, earth bunds and a dangau hut (lore/scenes/bld-extra.js, fitted to 3 tiles) */
function sawahSprite(team) {
  const T = TEAMC[team] || TEAMC[1];
  return sprite('sawah|' + team, 48, 48, 2, (P) => {
    const r = P.r, EA = '#7a5634', EA_D = '#5a3e22', EA_L = '#94703f';
    const terr = [[2, 13, 40], [16, 27, 45], [30, 41, 47]];
    for (let t = 0; t < 3; t++) {
      const [y0, yb, xr] = terr[t], xl = 3 - t;
      r(xl, y0, xr - xl, yb - y0, '#5cbf3a');
      for (let y = y0 + 1; y < yb; y++) {
        if ((y - y0) % 3 === 0) { r(xl, y, xr - xl, 1, '#4b9fb5'); for (let x = xl + ((y * 5) % 7); x < xr; x += 9) r(x, y, 2, 1, '#cdeef0'); }
        else for (let x = xl + (y & 1); x < xr; x += 3) r(x, y, 1, 1, (y - y0) % 3 === 1 ? '#8fdc4a' : '#46a32e');
      }
      r(xl, y0, xr - xl, 1, EA_L); r(xl, yb, xr - xl, 1, EA_L); r(xl, yb + 1, xr - xl, 1, EA); r(xl, yb + 2, xr - xl, 1, EA_D);
      r(xl - 1, y0, 1, yb - y0 + 3, EA); r(xr, y0, 1, yb - y0 + 3, EA_D);
    }
    r(0, 44, 48, 2, '#3d86a3'); r(6, 44, 4, 1, '#7fb7b8'); r(28, 45, 4, 1, '#7fb7b8'); r(0, 46, 48, 2, EA); r(0, 46, 48, 1, EA_L);
    r(22, 14, 1, 2, '#cdeef0'); r(34, 28, 1, 2, '#cdeef0');
    // dangau: a little thatched watch hut on the top terrace, a farmer in a caping
    posts(P, [39, 46], 6, 13, 1); r(37, 10, 11, 1, '#8f6232');
    r(36, 2, 12, 1, '#54443c'); r(37, 3, 10, 3, '#3a2e2a'); r(36, 5, 12, 1, '#241c19');
    r(42, 7, 2, 3, SKIN); r(42, 6, 2, 1, '#c9ae5e'); r(47, 0, 1, 9, WOOD_D); r(46, 1, 1, 3, T.main);
  }, false);
}
function buildingSprite(kind, team, level) { return civBuildingSprite(kind, CV(team), level); }
function civBuildingSprite(kind, team, level) {
  if (team === AYU_CIV && !(BD[kind] && BD[kind].wall)) { const s = AYART.building(kind, level); if (s) return s; }
  if (kind === 'sawah') return sawahSprite(team);
  if (BD[kind] && BD[kind].wall) { const m = level >= 100 ? level - 100 : 10; return wallSprite(kind, team, m & 15, m & 16); }
  if (CIVB_KIND[kind]) return team === 1 ? CIVB.majapahitBuilding(CIVB_KIND[kind][1], team) : CIVB.melakaBuilding(CIVB_KIND[kind][0], team);
  if (kind === 'village') return CIVB.neutralSite('village');
  if (kind === 'rumahtabib' || kind === 'patirthan') return CIVB.healerBuilding(kind, team);
  if (team === 1 && ['towncentre', 'house', 'barracks', 'port', 'store'].includes(kind)) return CIVB.majapahitBase(kind, team);
  const T = TEAMC[team] || TEAMC[0], key = `b|${kind}|${team}|${level || 0}`;
  const dims = { towncentre: [48, 62], house: [32, 46], mill: [32, 46], store: [32, 46], goldmine: [32, 44], farm: [32, 32], barracks: [48, 58], port: [48, 54] }[kind];
  return sprite(key, dims[0], dims[1], 2, (P) => {
    const r = P.r;
    if (kind === 'house') {
      posts(P, [4, 11, 19, 26], 38, 45, 2); r(2, 36, 28, 3, '#8f6232'); r(2, 39, 28, 1, '#5a3a1e');
      planks(P, 4, 24, 24, 12, '#c99b5d', '#a97d45'); r(13, 26, 6, 10, '#3f2713'); r(6, 27, 4, 4, '#2b1a0c'); r(22, 27, 4, 4, '#2b1a0c'); r(12, 25, 8, 1, T.trim);
      roofGable(P, 16, 9, 24, 3, 15, T.roofA, T.roofB, T.roofR); r(2, 24, 28, 1, T.main); r(15, 5, 2, 5, WOOD_D); r(13, 6, 6, 1, WOOD_D);
    } else if (kind === 'mill') {
      posts(P, [3, 27], 24, 44, 2); r(1, 40, 30, 3, '#8f6232'); r(1, 43, 30, 1, '#5a3a1e');
      r(5, 24, 22, 16, '#3a2a1a'); roofGable(P, 16, 8, 24, 5, 15, T.roofA, T.roofB, T.roofR); r(2, 24, 28, 1, T.main);
      for (let i = 0; i < 3; i++) { r(17 + i * 3, 36 - (i % 2), 3, 4, '#a0693a'); r(17 + i * 3, 38 - (i % 2), 3, 1, '#c99b5d'); }
      r(18, 32, 9, 3, '#8a5a2b'); r(19, 29, 7, 3, '#a0693a'); r(7, 33, 8, 1, STEEL); r(6, 34, 10, 6, '#7a4a24'); r(8, 30, 1, 4, WOOD_D); r(8, 29, 3, 1, STEEL);
      r(15, 4, 1, 5, WOOD_D); r(16, 4, 5, 3, T.main);
    } else if (kind === 'store') {
      // Gudang: a raised plank warehouse with a log stack and a gold chest at the door
      posts(P, [3, 27], 26, 44, 2); r(1, 40, 30, 3, '#8f6232'); r(1, 43, 30, 1, '#5a3a1e');
      planks(P, 4, 24, 24, 16, '#b88a52', '#9a6e3c'); roofGable(P, 16, 8, 24, 5, 15, T.roofA, T.roofB, T.roofR); r(2, 24, 28, 1, T.main);
      r(12, 29, 8, 11, '#3f2713'); r(12, 28, 8, 1, T.trim);
      for (let i = 0; i < 3; i++) { r(22, 34 - i * 2, 8, 2, i % 2 ? '#a0693a' : '#8a5a2b'); r(29, 34 - i * 2, 1, 2, '#c99b5d'); }
      r(2, 34, 8, 6, '#5e3b1c'); r(2, 33, 8, 2, '#f2c94c'); r(4, 32, 3, 1, '#ffe27a'); r(5, 35, 2, 2, '#333');
      r(15, 4, 1, 5, WOOD_D); r(16, 4, 5, 3, T.main);
    } else if (kind === 'goldmine') {
      disc(P, 16, 26, 14, '#7b7f88'); disc(P, 9, 29, 8, '#8b9099'); disc(P, 24, 29, 8, '#6d717a'); r(2, 36, 28, 4, '#6d717a');
      r(9, 22, 2, 16, '#6b4a2a'); r(21, 22, 2, 16, '#6b4a2a'); r(8, 20, 16, 3, '#8a5a2b'); r(11, 24, 10, 14, '#1d150d');
      r(10, 36, 12, 1, '#555'); r(12, 37, 8, 1, '#6b4a2a');
      r(3, 32, 6, 5, '#5e3b1c'); r(3, 31, 6, 2, '#f2c94c'); r(5, 30, 2, 1, '#ffe27a'); r(4, 37, 2, 2, '#333'); r(7, 37, 2, 2, '#333');
      r(24, 33, 3, 2, '#f2c94c'); r(26, 35, 3, 2, '#e0a82a'); r(15, 10, 1, 11, WOOD_D); r(16, 10, 6, 3, T.main); r(16, 10, 6, 1, T.trim);
    } else if (kind === 'farm') {
      r(1, 1, 30, 30, '#7a5632'); r(0, 0, 32, 1, '#5e3b1c'); r(0, 31, 32, 1, '#5e3b1c'); r(0, 0, 1, 32, '#5e3b1c'); r(31, 0, 1, 32, '#5e3b1c');
      const g = level === 2 ? 3 : level === 1 ? 2 : 1;
      for (let i = 0; i < 5; i++) {
        r(2, 3 + i * 6, 28, 3, '#5e4025');
        for (let x = 3; x < 29; x += 3) { r(x, 3 + i * 6 - g + 1, 2, g + 1, i % 2 ? '#59a64a' : '#7bc65a'); }
      }
      r(0, 0, 2, 2, WOOD_D); r(30, 0, 2, 2, WOOD_D); r(0, 30, 2, 2, WOOD_D); r(30, 30, 2, 2, WOOD_D);
    } else if (kind === 'barracks') {
      posts(P, [4, 12, 20, 28, 36, 43], 50, 57, 2); r(2, 48, 44, 3, '#8f6232'); r(2, 51, 44, 1, '#5a3a1e');
      planks(P, 5, 32, 38, 16, '#b88a52', '#9a6f3a'); r(16, 36, 16, 12, '#2f1d0e');
      for (let i = 0; i < 3; i++) { disc(P, 10 + i * 0, 41, 0, '#000'); }
      disc(P, 10, 40, 3, T.main); disc(P, 10, 40, 1, T.trim); disc(P, 38, 40, 3, T.main); disc(P, 38, 40, 1, T.trim);
      r(18, 38, 1, 10, '#8a5a2b'); r(21, 38, 1, 10, '#8a5a2b'); r(24, 38, 1, 10, '#8a5a2b'); r(27, 38, 1, 10, '#8a5a2b'); r(30, 38, 1, 10, '#8a5a2b');
      r(18, 37, 1, 1, STEEL); r(21, 37, 1, 1, STEEL); r(24, 37, 1, 1, STEEL); r(27, 37, 1, 1, STEEL); r(30, 37, 1, 1, STEEL);
      roofGable(P, 24, 14, 33, 8, 25, T.roofA, T.roofB, T.roofR); r(0, 33, 48, 1, T.main); r(0, 34, 48, 1, T.trim);
      r(22, 8, 4, 6, WOOD_D); r(23, 2, 1, 8, WOOD_D); r(24, 2, 9, 5, T.main); r(24, 2, 9, 1, T.trim); r(27, 4, 3, 1, T.trim);
    } else if (kind === 'port') {
      r(0, 40, 48, 12, '#a47a45'); for (let x = 0; x < 48; x += 4) r(x, 40, 1, 12, '#7d5b30'); r(0, 40, 48, 1, '#c99b5d'); r(0, 51, 48, 1, '#5a3a1e');
      posts(P, [1, 14, 28, 44], 48, 53, 3);
      planks(P, 4, 26, 24, 14, '#c99b5d', '#a97d45'); r(11, 29, 8, 11, '#3f2713'); roofGable(P, 16, 12, 26, 4, 15, T.roofA, T.roofB, T.roofR); r(3, 26, 26, 1, T.main);
      r(32, 33, 9, 7, '#a8773c'); r(32, 36, 9, 1, '#7d5b30'); r(36, 33, 1, 7, '#7d5b30'); r(34, 31, 3, 2, '#f2c94c'); r(35, 31, 1, 1, '#fff6b0');
      r(41, 36, 5, 4, '#8a5a2b'); r(41, 37, 5, 1, STEEL_D);
      r(44, 14, 1, 26, WOOD_D); r(30, 16, 14, 2, T.trim); r(31, 18, 12, 6, CREAM); r(31, 18, 12, 1, T.main); r(40, 8, 7, 5, T.main); r(40, 8, 7, 1, T.trim);
    } else { // town centre
      posts(P, [5, 12, 19, 27, 34, 41], 50, 61, 2); r(3, 48, 42, 3, '#8f6232'); r(3, 51, 42, 1, '#5a3a1e');
      r(20, 52, 8, 2, '#a8773c'); r(21, 54, 6, 2, '#a8773c'); r(22, 56, 4, 2, '#a8773c');
      planks(P, 7, 32, 34, 16, '#c99b5d', '#a97d45');
      r(19, 36, 10, 12, '#3f2713'); r(18, 35, 12, 1, T.trim); r(23, 40, 2, 8, '#2a190a'); r(10, 36, 5, 6, '#2b1a0c'); r(33, 36, 5, 6, '#2b1a0c'); r(9, 35, 7, 1, T.trim); r(32, 35, 7, 1, T.trim);
      roofGable(P, 24, 25, 34, 13, 26, T.roofA, T.roofB, T.roofR); r(0, 34, 48, 1, T.main); r(0, 35, 48, 1, T.trim);
      roofGable(P, 24, 11, 25, 4, 15, T.roofA, T.roofB, T.roofR); r(8, 25, 32, 1, T.main);
      r(9, 12, 2, 3, WOOD_D); r(37, 12, 2, 3, WOOD_D); r(23, 6, 2, 6, WOOD_D); r(21, 7, 6, 1, WOOD_D);
      if (team === 1) { roofGable(P, 24, 4, 11, 2, 7, T.roofA, T.roofB, T.roofR); r(16, 11, 16, 1, T.main); }
      r(24, 0, 1, 8, '#4a2e14'); r(25, 1, 9, 5, T.main); r(25, 1, 9, 1, T.trim); r(28, 3, 3, 1, T.trim);
    }
  });
}

