/* ---------- naval roster and civ buildings (approved art from the art thread) ----------
   Each file is kept whole inside its own scope so its helpers don't clash with the ones above. */
const NAVAL = (() => {
  /* Naval roster sprite mockups. Uses sprite(), TEAMC and the palette constants
     from art.js. All ships face right (bow on the right).
     navalSprite(kind, team), kinds by roster slot:
       fishing  - Melaka Sampan            / Majapahit Jukung
       trade    - Melaka Jong Dagang (armed trader, unique) / Majapahit Perahu Api (fire ship, unique)
       light    - Melaka Penjajap          / Majapahit Jukung Perang
       galley   - Melaka Lancaran          / Majapahit Kelulus      (both carry troops)
       frigate  - Melaka Ghali             / Majapahit Jong Perang
       flagship - Melaka Mendam Berahi     / Majapahit Jong Raya */
  const SAIL = '#efe3c0', SAIL_D = '#cbbd92', MAT = '#c9a96a', MAT_D = '#a4844a', JSAIL = '#6f8a52', JSAIL_D = '#52683c';
  const HULL = '#7a4a24', HULL_D = '#5e3b1c', HULL_L = '#a8773c', PORT = '#2a1a10', FIRE = '#e2562c', FIRE_L = '#f6b33a';

  // Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line.
  function hull(P, x0, x1, y, depth, T, ports) {
    for (let i = 0; i < depth; i++) P.r(x0 + i, y + i, x1 - x0 - i * 2, 1, i === 0 ? HULL_L : i === depth - 1 ? HULL_D : HULL);
    P.r(x0 + 1, y + 1, x1 - x0 - 2, 1, T.main);
    if (ports) for (let x = x0 + 4; x < x1 - 4; x += 4) P.r(x, y + 3, 2, 1, PORT);
    P.r(x0 - 1, y - 1, 2, 1, HULL); P.r(x0 - 2, y - 2, 1, 1, HULL);
    P.r(x1 - 1, y - 1, 2, 1, HULL); P.r(x1 + 1, y - 3, 1, 3, HULL); P.r(x1 + 1, y - 4, 1, 1, T.trim);
  }
  // Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig.
  function tanja(P, x, y, w, h, col, colD, T, mark) {
    const mat = col === MAT;
    for (let i = 0; i < h; i++) { const sx = x + Math.round(i * 0.5); P.r(sx, y + i, w, 1, (mat && i % 4 === 3) ? colD : col); if (!mat) P.r(sx + w - 1, y + i, 1, 1, colD); }
    P.r(x - 1, y - 1, w + 2, 1, WOOD_D);
    P.r(x + Math.round(h * 0.5) - 1, y + h, w + 2, 1, WOOD_D);
    if (mark) P.r(x + Math.round(h * 0.25) + (w >> 1) - 1, y + (h >> 1) - 1, 2, 2, T.main);
  }
  // Junk-style battened fan sail (the green sails of the great Jong).
  function fan(P, x, y, w, h) {
    for (let i = 0; i < h; i++) {
      const t = i / (h - 1), ww = Math.max(2, Math.round(w * (0.55 + 0.45 * Math.sin(Math.min(1, t * 1.4) * Math.PI / 2))));
      P.r(x + Math.round(i * 0.35), y + i, ww, 1, (i % 3 === 2) ? JSAIL_D : JSAIL);
    }
    P.r(x - 1, y - 1, Math.round(w * 0.6), 1, WOOD_D);
  }
  // Square sail with a darker belly edge (European-influenced late ships).
  function sq(P, x, y, w, h) { P.r(x, y, w, h, SAIL); P.r(x + w - 1, y + 1, 1, h - 1, SAIL_D); P.r(x, y + h - 1, w, 1, SAIL_D); P.r(x - 1, y - 1, w + 2, 1, WOOD_D); }
  function mast(P, x, y0, y1) { P.r(x, y0, 1, y1 - y0, WOOD_D); }
  function flag(P, x, y, c1, c2) { P.r(x, y, 4, 2, c1); P.r(x + 1, y, 2, 1, c2); }
  function oars(P, xs, y, len) { for (const x of xs) for (let i = 0; i < len; i++) P.r(x - i, y + i, 1, 1, i === len - 1 ? HULL_L : WOOD); }
  function crew(P, x, y, head, body) { P.r(x, y, 2, 1, head); P.r(x, y + 1, 2, 2, SKIN); P.r(x, y + 3, 2, 1, body); }
  function flames(P, list, base) { for (const [x, h] of list) { P.r(x, base - h, 2, h, FIRE); P.r(x, base - h + 2, 1, h - 3, FIRE_L); P.r(x, base - h + 3, 1, 1, '#fff0a0'); } }

  const NAVAL_DIMS = { fishing: [24, 22], trade: [36, 30], jong: [36, 30], light: [30, 24], galley: [38, 29], frigate: [44, 36], flagship: [54, 42] };
  const NAVAL_NAMES = [
    { fishing: 'Sampan', trade: 'Jong Dagang', light: 'Penjajap', galley: 'Lancaran', frigate: 'Ghali', flagship: 'Mendam Berahi' },
    { fishing: 'Jukung', trade: 'Perahu Api', light: 'Jukung Perang', galley: 'Kelulus', frigate: 'Jong Perang', flagship: 'Jong Raya' }
  ];

  const NAVAL_CLASS = [
    { fishing: 'Fishing Boat', trade: 'Armed Trade Ship', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' },
    { fishing: 'Fishing Boat', trade: 'Fire Ship', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' }
  ];

  function navalSprite(kind, team) {
    const T = TEAMC[team] || TEAMC[0], mel = team === 0;
    const d = (kind === 'trade' && !mel) ? [24, 24] : NAVAL_DIMS[kind];
    return sprite('naval|' + kind + '|' + team, d[0], d[1], 2, (P) => {
      const r = P.r, S1 = mel ? SAIL : MAT, S2 = mel ? SAIL_D : MAT_D;
      if (kind === 'fishing') {
        if (mel) {
          // Sampan: one small tanja sail, fisherman under a terendak
          mast(P, 10, 3, 14); tanja(P, 8, 3, 8, 9, SAIL, SAIL_D, T, true);
          r(4, 9, 4, 1, '#e8c97a'); r(5, 10, 2, 2, SKIN); r(5, 12, 2, 1, T.main);
          hull(P, 3, 17, 13, 4, T); r(2, 11, 1, 2, '#cfc3a0'); r(1, 12, 1, 1, '#cfc3a0');
        } else {
          // Jukung: outrigger canoe with a crab-claw sail
          mast(P, 10, 4, 14);
          for (let i = 0; i < 9; i++) r(11, 4 + i, Math.max(1, 7 - Math.abs(i - 3)), 1, (i % 3 === 2) ? MAT_D : MAT);
          r(11, 4, 1, 9, T.main);
          crew(P, 5, 9, HAIR, T.main);
          hull(P, 3, 17, 13, 3, T);
          r(4, 17, 14, 1, WOOD); r(6, 15, 1, 3, WOOD_D); r(14, 15, 1, 3, WOOD_D); r(3, 18, 16, 1, '#c8b88a');
        }
      } else if (kind === 'jong') {
        // Jong Jawa: the great Javanese merchant ship, three masts of woven-mat tanja sails, a high stern, two side rudders
        mast(P, 9, 2, 20); mast(P, 18, 0, 20); mast(P, 27, 4, 20);
        tanja(P, 6, 2, 7, 12, MAT, MAT_D, T, true); tanja(P, 15, 0, 8, 14, MAT, MAT_D, T, true); tanja(P, 24, 4, 7, 10, MAT, MAT_D, T, false);
        flag(P, 19, 0, T.main, '#f1ece0');
        r(2, 13, 7, 1, T.main); r(2, 14, 7, 4, WOOD_D); r(3, 15, 2, 1, '#e8c97a'); r(12, 17, 4, 2, '#a07040'); r(21, 17, 3, 2, '#8a6030');
        hull(P, 2, 33, 19, 6, T, true);
        r(4, 20, 1, 5, WOOD_D); r(6, 20, 1, 4, WOOD_D);
      } else if (kind === 'trade' && mel) {
        // Jong Dagang: broad Malay merchant junk, two big tanja sails, swivel guns (lela) on the rail
        mast(P, 13, 2, 20); mast(P, 24, 5, 20);
        tanja(P, 9, 2, 9, 14, SAIL, SAIL_D, T, true); tanja(P, 21, 5, 8, 11, SAIL, SAIL_D, T, false);
        flag(P, 14, 0, T.main, T.trim);
        // stern deckhouse with a gold-trimmed roof, crates midships
        r(3, 15, 7, 1, T.main); r(3, 16, 7, 3, WOOD); r(16, 17, 4, 2, '#a07040');
        hull(P, 3, 32, 19, 6, T, true);
        for (const x of [12, 22, 28]) { r(x, 18, 1, 1, STEEL_D); r(x + 1, 18, 1, 1, STEEL); }
      } else if (kind === 'trade') {
        // Perahu Api: fire ship packed with oiled brush
        r(11, 3, 3, 2, '#5a5560'); r(9, 1, 3, 2, '#77727c'); r(12, 0, 2, 1, '#77727c');
        flames(P, [[6, 6], [8, 9], [10, 7], [12, 10], [14, 6], [16, 8]], 16);
        r(5, 13, 13, 3, '#6a4a2a'); r(6, 14, 2, 1, '#8a6b3a'); r(11, 13, 3, 1, '#8a6b3a');
        hull(P, 3, 19, 16, 4, T);
        r(18, 12, 1, 4, WOOD_D); r(19, 12, 2, 1, T.main);
      } else if (kind === 'light') {
        if (mel) {
          // Penjajap: slim fast raider, one tall tanja sail, bow gun
          mast(P, 14, 1, 16); tanja(P, 11, 1, 9, 13, SAIL, SAIL_D, T, true); flag(P, 15, -1, T.main, T.trim);
          r(25, 13, 3, 1, STEEL_D);
          hull(P, 3, 27, 16, 4, T);
        } else {
          // Jukung Perang: cheap outrigger war canoe, crab-claw sail, spearmen
          mast(P, 13, 2, 15);
          for (let i = 0; i < 11; i++) r(14, 2 + i, Math.max(1, 8 - Math.abs(i - 4)), 1, (i % 3 === 2) ? MAT_D : MAT);
          r(14, 2, 1, 11, T.main);
          hull(P, 3, 25, 14, 3, T);
          r(4, 19, 22, 1, WOOD); r(7, 17, 1, 3, WOOD_D); r(21, 17, 1, 3, WOOD_D); r(3, 20, 24, 1, '#c8b88a');
        }
      } else if (kind === 'galley') {
        // Lancaran / Kelulus: oared war galley with two tanja sails and a fighting deck; carries troops
        mast(P, 13, 2, 18); mast(P, 25, 4, 18);
        tanja(P, 10, 2, 9, 12, S1, S2, T, true); tanja(P, 22, 4, 8, 10, S1, S2, T, false);
        flag(P, 14, 0, T.main, T.trim);
        hull(P, 3, 34, 18, 6, T);
        oars(P, [10, 15, 20, 25, 30], 24, 4);
      } else if (kind === 'frigate') {
        if (mel) {
          // Ghali: big gunned galley-ship, square sails forward, tanja aft, row of gunports
          mast(P, 15, 1, 24); mast(P, 28, 4, 24); mast(P, 8, 9, 24);
          sq(P, 10, 3, 11, 14); sq(P, 24, 6, 9, 11); r(15, 9, 2, 2, T.main);
          tanja(P, 4, 10, 5, 7, SAIL, SAIL_D, T, false);
          flag(P, 16, -1, T.main, T.trim); flag(P, 28, 1, T.main, T.trim);
          hull(P, 3, 40, 24, 8, T, true);
        } else {
          // Jong Perang: two-masted Javanese war jong, mat tanja sails, castle aft, archers on deck
          mast(P, 15, 0, 24); mast(P, 29, 4, 24);
          tanja(P, 10, 1, 12, 16, MAT, MAT_D, T, true); tanja(P, 25, 5, 10, 13, MAT, MAT_D, T, false);
          flag(P, 16, -2, T.main, GOLD);
          r(3, 17, 8, 1, T.main); r(3, 18, 8, 6, WOOD);
          hull(P, 3, 40, 24, 7, T);
        }
      } else if (kind === 'flagship') {
        if (mel) {
          // Mendam Berahi: Hang Tuah's legendary flagship. Three tall tanja masts, two gun decks,
          // a Malay-roofed stern castle and royal yellow pennants.
          mast(P, 16, 2, 28); mast(P, 28, 4, 28); mast(P, 39, 8, 28);
          tanja(P, 11, 3, 11, 17, SAIL, SAIL_D, T, true); tanja(P, 24, 5, 10, 15, SAIL, SAIL_D, T, true); tanja(P, 35, 9, 8, 11, SAIL, SAIL_D, T, false);
          flag(P, 17, 0, GOLD, T.main); flag(P, 29, 2, GOLD, T.main); flag(P, 40, 6, GOLD, T.main);
          // stern castle with a layered Malay roof
          r(3, 16, 10, 1, T.dark); r(4, 15, 8, 1, T.main); r(6, 14, 4, 1, GOLD); r(3, 17, 10, 11, WOOD);
          hull(P, 3, 49, 28, 10, T, true); r(5, 30, 42, 1, GOLD);
        } else {
          // Jong Raya: the great Javanese jong. Four green battened fan sails, towering hull,
          // wooden castles fore and aft, sweeps along the side.
          for (const [mx, top] of [[10, 4], [21, 1], [32, 2], [43, 6]]) { mast(P, mx, top, 26); fan(P, mx - 5, top + 1, 8, 17 - (top >> 1)); }
          flag(P, 23, -1, T.main, GOLD); flag(P, 13, 1, T.main, GOLD);
          r(3, 19, 8, 1, T.main); r(3, 20, 8, 6, WOOD); r(43, 21, 7, 1, T.main); r(44, 22, 6, 4, WOOD);
          hull(P, 3, 50, 26, 11, T); r(6, 30, 42, 1, GOLD);
        }
      }
    });
  }
  return { navalSprite };
})();
