/* ##### CHAPTER ART 8 · Shared buildings and walls #####
   File: src/js/art/08-shared-buildings.js
   What it does: Walls, gates, farms, ports and other buildings every civ shares, and wall styles by age.
   ############################################################################ */
/* ------------------------------ buildings ------------------------------ */
/* one wall tile. mask: 1 N, 2 E, 4 S, 8 W neighbours of the same side; open: a gate with friends close by.
   Palisade: sharpened logs. Melaka Kubu: planked timber with a walkway. Majapahit: red brick, and the
   gate is a candi bentar, the split gate of Trowulan. */
function wallSprite(kind, team, mask, open, fine, locked) {
  // team here is the civ id: 0 Melaka, 1 Majapahit, AYU_CIV Ayutthaya. Walls and gates are plain timber until the
  // Age of Commerce (fine), then each civ builds its own; palisades keep the civ's own material from the start.
  const T = TEAMC[team] || TEAMC[0], maj = team === 1 && (fine || kind === 'palisade'), ayu = team === AYU_CIV && fine, mel = fine && !maj && !ayu;
  return sprite(`w|${kind}|${team}|${mask}|${open ? 1 : 0}|${fine ? 1 : 0}|${locked ? 1 : 0}`, 16, 34, 2, (P) => {
    const r = P.r, yc = 25, N = mask & 1, E = mask & 2, S = mask & 4, Wn = mask & 8;
    const mat = kind === 'palisade' ? (maj ? 'bamboo' : 'log') : maj ? 'brick' : ayu ? 'white' : mel ? 'timber' : 'plain';
    const hF = 11, top = yc - hF + 1;
    const C = mat === 'log' ? { face: '#9a6a3a', faceD: '#7a5030', cap: '#b4824a', capD: '#8a5a2b' }
      : mat === 'bamboo' ? { face: '#9c9a4a', faceD: '#6e7430', cap: '#b8b25c', capD: '#7a8034' }
      : mat === 'brick' ? { face: '#b5503a', faceD: '#7d2f22', cap: '#cf7050', capD: '#9a3e2a' }
      : mat === 'white' ? { face: '#e6dfcc', faceD: '#b2a88e', cap: '#f7f3e8', capD: '#c4bba2' }
      : { face: '#8a5a2b', faceD: '#5e3b1c', cap: '#b08050', capD: '#7a5030' };
    // a stretch of face (with its top) from x0 to x1
    const face = (x0, x1) => {
      for (let x = x0; x < x1; x++) {
        if (mat === 'plain') {
          r(x, top - 1, 1, 1, '#2a1a10'); r(x, top + hF + 4, 1, 1, '#2a1a10');
          r(x, top, 1, 3, C.cap); r(x, top + 3, 1, hF + 1, C.face);
          for (let y = top + 5; y < top + hF + 4; y += 3) r(x, y, 1, 1, C.faceD);
          if (x % 3 === 0) r(x, top - 1, 1, 1, C.capD);
          continue;
        }
        if (mat === 'log') {
          // two-pixel logs with a dark gap, each sharpened to a point
          const k = x % 3;
          if (k === 0) { r(x, top + 1, 1, hF + 3, '#4a2e16'); continue; }
          r(x, top + (k === 1 ? -2 : -1), 1, hF + 5 + (k === 1 ? 1 : 0), k === 1 ? C.face : C.faceD);
          r(x, top + (k === 1 ? -2 : -1), 1, 1, k === 1 ? '#d8b080' : '#b4824a'); if (k === 1) r(x, top - 3, 1, 1, '#2a1a10');
          r(x, top + hF + 3, 1, 1, '#4a2e16'); if (k === 2) r(x, top - 2, 1, 1, '#2a1a10');
        } else if (mat === 'bamboo') {
          // upright bamboo poles, cut on a slant, with nodes
          const k = x % 2, t0 = top - 2 + ((x * 3) % 3 === 0 ? 0 : 1);
          r(x, t0 - 1, 1, 1, '#2a2a10'); r(x, t0, 1, hF + 6 - (t0 - top + 2), k ? C.face : C.faceD); r(x, t0, 1, 1, '#d4cc84');
          for (let y = t0 + 3; y < top + hF + 3; y += 4) r(x, y, 1, 1, '#6a7428');
          r(x, top + hF + 3, 1, 1, '#3a3a18');
        } else {
          r(x, top - 1, 1, 1, '#2a1a10'); r(x, top + hF + 4, 1, 1, '#2a1a10');
          r(x, top, 1, 3, C.cap); r(x, top + 3, 1, hF + 1, C.face);
          if (mat === 'brick') { for (let y = top + 4; y < top + hF + 4; y += 2) r(x, y, 1, 1, ((x + (y >> 1)) % 4 === 0) ? C.faceD : '#a6452f'); }
          else if (mat === 'white') { for (let y = top + 5; y < top + hF + 3; y += 3) if ((x + y) % 5 === 0) r(x, y, 1, 1, C.faceD); r(x, top + hF + 2, 1, 2, '#a89a80'); }
          else {
            for (let y = top + 5; y < top + hF; y += 3) r(x, y, 1, 1, C.faceD);
            r(x, top + hF, 1, 4, (x * 7) % 5 === 0 ? '#6e5230' : '#8a6a3a');   // packed earth at the foot
          }
          // crenels: brick merlons, white bai sema points, sharpened timber tips
          if (mat === 'brick' && x % 4 < 2) { r(x, top - 3, 1, 2, C.cap); r(x, top - 4, 1, 1, '#2a1a10'); }
          else if (mat === 'white' && x % 4 === 1) { r(x, top - 3, 2, 2, C.cap); r(x + 1, top - 3, 1, 2, '#c9b6e0'); r(x, top - 4, 2, 1, '#2a1a10'); }
          else if (mat === 'timber' && x % 2 === 0) { r(x, top - 2, 1, 1, C.cap); r(x, top - 3, 1, 1, '#2a1a10'); }
          else if (x % 3 === 0) r(x, top - 1, 1, 1, C.capD);
        }
      }
      if (mat === 'timber') r(x0, top + 4, x1 - x0, 1, T.main);
      if (mat === 'log') r(x0, top + 5, x1 - x0, 1, '#5e3b1c');
      if (mat === 'bamboo') { r(x0, top + 2, x1 - x0, 1, '#6e4626'); r(x0, top + hF, x1 - x0, 1, '#6e4626'); }
      if (mat === 'brick') r(x0, top + 3, x1 - x0, 1, '#e0b070');
      if (mat === 'white') { r(x0, top + 2, x1 - x0, 1, '#d8cce8'); r(x0, top + 3, x1 - x0, 1, T.main); r(x0, top + hF + 1, x1 - x0, 1, '#8a6ab0'); }
    };
    // a north-south stretch seen from above: just the top surface
    const strip = (y0, y1) => {
      r(4, y0, 1, y1 - y0, '#2a1a10'); r(11, y0, 1, y1 - y0, '#2a1a10');
      r(5, y0, 6, y1 - y0, C.cap); r(5, y0, 1, y1 - y0, C.capD); r(10, y0, 1, y1 - y0, C.capD);
      if (mat === 'log' || mat === 'bamboo') for (let y = y0; y < y1; y += 2) { r(6 + (y % 4 ? 2 : 0), y, 1, 1, mat === 'log' ? '#d8b080' : '#e8e4a0'); r(8 - (y % 4 ? 2 : 0), y, 1, 1, C.capD); }
      if (mat === 'timber') r(7, y0, 2, y1 - y0, T.main);
      if (mat === 'white') for (let y = y0 + 1; y < y1; y += 4) r(7, y, 2, 1, C.capD);
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
      // candi bentar: two tall stepped brick towers with a gap between
      for (const x0 of [1, 10]) {
        r(x0, gt + 3, 5, 15, '#b5503a'); r(x0, gt + 3, 5, 1, '#e0b070'); r(x0 + 1, gt - 1, 3, 4, '#b5503a'); r(x0 + 1, gt - 1, 3, 1, '#e0b070'); r(x0 + 2, gt - 4, 1, 3, '#cf7050');
        for (let y = gt + 5; y < gt + 18; y += 3) r(x0, y, 5, 1, '#8e3624');
        r(x0 + (x0 < 8 ? 4 : 0), gt + 3, 1, 15, '#7d2f22');
      }
      if (!open) { r(6, gt + 7, 4, 11, '#5e3b1c'); r(6, gt + 7, 4, 1, T.main); r(7, gt + 10, 1, 1, '#f2c94c'); r(8, gt + 13, 1, 1, '#f2c94c'); r(7, gt + 8, 2, 9, '#6e4626'); }
      else { r(6, gt + 7, 1, 11, '#6e4626'); r(9, gt + 7, 1, 11, '#6e4626'); }
    } else if (ayu) {
      // pratu: whitewashed gate tower, an arched doorway and a stepped red roof with a gilt spire
      r(1, gt + 4, 14, 14, '#e6dfcc'); r(1, gt + 4, 1, 14, '#c4bba2'); r(14, gt + 4, 1, 14, '#b2a88e'); r(1, gt + 16, 14, 2, '#a89a80');
      r(1, gt + 4, 14, 1, T.main);
      for (const x of [1, 4, 11, 14]) r(x, gt + 2, 1, 2, '#f7f3e8');
      r(2, gt + 1, 12, 2, '#a8322a'); r(4, gt - 1, 8, 2, '#c0392b'); r(6, gt - 3, 4, 2, '#a8322a'); r(2, gt + 2, 12, 1, '#7a2018');
      r(7, gt - 7, 2, 4, '#e0b04a'); r(7, gt - 8, 1, 1, '#fff0a0'); r(9, gt - 8, 3, 2, T.main); r(9, gt - 8, 1, 6, '#6e4626');
      r(5, gt + 8, 6, 10, open ? '#1a120c' : '#6e4626'); r(6, gt + 7, 4, 1, open ? '#1a120c' : '#6e4626'); r(4, gt + 8, 1, 10, '#b2a88e'); r(11, gt + 8, 1, 10, '#b2a88e'); r(5, gt + 7, 1, 1, '#b2a88e'); r(10, gt + 7, 1, 1, '#b2a88e');
      if (!open) { r(7, gt + 8, 2, 10, '#4a2e16'); r(6, gt + 12, 1, 1, '#f2c94c'); r(9, gt + 12, 1, 1, '#f2c94c'); }
    } else {
      // timber gatehouse: a raised lookout with a railing and a team-colour roof over the doors
      r(1, gt + 5, 3, 13, WOOD_D); r(12, gt + 5, 3, 13, WOOD_D); r(1, gt + 5, 14, 3, WOOD); r(1, gt + 8, 14, 1, T.main);
      if (mel) {
        r(2, gt + 1, 1, 4, WOOD_D); r(13, gt + 1, 1, 4, WOOD_D); r(2, gt + 2, 12, 1, WOOD); for (let x = 4; x < 13; x += 2) r(x, gt + 3, 1, 2, WOOD_D);
        r(0, gt - 2, 16, 3, T.roofA); r(2, gt - 4, 12, 2, T.roofB); r(0, gt, 16, 1, T.roofR); r(7, gt - 6, 2, 2, T.trim);
      } else { r(0, gt + 2, 16, 3, T.roofA); r(2, gt, 12, 2, T.roofB); r(0, gt + 4, 16, 1, T.roofR); r(7, gt - 2, 2, 2, T.trim); }
      if (!open) { r(4, gt + 9, 8, 9, '#6e4626'); r(7, gt + 9, 2, 9, '#4a2e16'); r(5, gt + 12, 1, 1, '#f2c94c'); r(10, gt + 12, 1, 1, '#f2c94c'); }
      else { r(4, gt + 9, 8, 9, '#1a120c'); r(4, gt + 9, 1, 9, '#6e4626'); r(11, gt + 9, 1, 9, '#6e4626'); }
    }
    if (locked) {
      // closed to all: a dark barred door and a small red flag
      r(5, gt + 9, 6, 9, '#241812'); for (const y of [gt + 11, gt + 14]) r(5, y, 6, 1, '#9a9ea6'); r(7, gt + 9, 1, 9, '#7a7e86'); r(9, gt + 9, 1, 9, '#7a7e86');
      r(13, gt - 6, 1, 9, '#3a2416'); r(14, gt - 6, 2, 3, '#d9473b'); r(14, gt - 6, 2, 1, '#ff8a7a');
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
// the picture for a building
function buildingSprite(kind, team, level) { return civBuildingSprite(kind, CV(team), level); }
// the picture for a building by civ
function civBuildingSprite(kind, team, level) {
  if (team === AYU_CIV && !(BD[kind] && BD[kind].wall)) { const s = AYART.building(kind, level); if (s) return s; }
  if (kind === 'sawah') return sawahSprite(team);
  if (BD[kind] && BD[kind].wall) { const m = level >= 100 ? level - 100 : 10; return wallSprite(kind, team, m & 15, m & 16, m & 32, m & 64); }
  if (CIVB_KIND[kind]) return team === 1 ? CIVB.majapahitBuilding(CIVB_KIND[kind][1], team) : CIVB.melakaBuilding(CIVB_KIND[kind][0], team);
  if (kind === 'village') return CIVB.neutralSite('village');
  if (kind === 'rumahtabib' || kind === 'patirthan') return CIVB.healerBuilding(kind, team);
  if (team === 1 && ['towncentre', 'house', 'barracks', 'port', 'store'].includes(kind)) return CIVB.majapahitBase(kind, team);
  const T = TEAMC[team] || TEAMC[0], key = `b|${kind}|${team}|${level || 0}`;
  const dims = { towncentre: [48, 62], house: [32, 46], store: [32, 46], farm: [32, 32], barracks: [48, 58], port: [48, 54] }[kind];
  return sprite(key, dims[0], dims[1], 2, (P) => {
    const r = P.r;
    if (kind === 'house') {
      posts(P, [4, 11, 19, 26], 38, 45, 2); r(2, 36, 28, 3, '#8f6232'); r(2, 39, 28, 1, '#5a3a1e');
      planks(P, 4, 24, 24, 12, '#c99b5d', '#a97d45'); r(13, 26, 6, 10, '#3f2713'); r(6, 27, 4, 4, '#2b1a0c'); r(22, 27, 4, 4, '#2b1a0c'); r(12, 25, 8, 1, T.trim);
      roofGable(P, 16, 9, 24, 3, 15, T.roofA, T.roofB, T.roofR); r(2, 24, 28, 1, T.main); r(15, 5, 2, 5, WOOD_D); r(13, 6, 6, 1, WOOD_D);
    } else if (kind === 'store') {
      // Gudang: a raised plank warehouse with a log stack and a gold chest at the door
      posts(P, [3, 27], 26, 44, 2); r(1, 40, 30, 3, '#8f6232'); r(1, 43, 30, 1, '#5a3a1e');
      planks(P, 4, 24, 24, 16, '#b88a52', '#9a6e3c'); roofGable(P, 16, 8, 24, 5, 15, T.roofA, T.roofB, T.roofR); r(2, 24, 28, 1, T.main);
      r(12, 29, 8, 11, '#3f2713'); r(12, 28, 8, 1, T.trim);
      for (let i = 0; i < 3; i++) { r(22, 34 - i * 2, 8, 2, i % 2 ? '#a0693a' : '#8a5a2b'); r(29, 34 - i * 2, 1, 2, '#c99b5d'); }
      r(2, 34, 8, 6, '#5e3b1c'); r(2, 33, 8, 2, '#f2c94c'); r(4, 32, 3, 1, '#ffe27a'); r(5, 35, 2, 2, '#333');
      r(15, 4, 1, 5, WOOD_D); r(16, 4, 5, 3, T.main);
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

