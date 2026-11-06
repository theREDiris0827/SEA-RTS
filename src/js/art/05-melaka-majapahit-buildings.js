/* ##### CHAPTER ART 5 · Melaka and Majapahit buildings #####
   File: src/js/art/05-melaka-majapahit-buildings.js
   What it does: Town Centres, houses, barracks and other buildings for the first two civs (CIVB).
   ############################################################################ */
const CIVB = (() => {
  /* Melaka building mockups, same style as buildingSprite() in art.js (stilts, planks, thatch gables).
     Needs sprite(), disc(), planks(), roofGable(), posts(), TEAMC and the palette constants from art.js,
     and GOLD/GOLD_D from drawUnit.js.
     melakaBuilding(kind, team): kind jelapang | pangkalan | menara | istana
     neutralSite(kind): kind village (Orang Laut settlement) | landing (empty Pangkalan site) */
  const MB_DIMS = { jelapang: [32, 50], pangkalan: [48, 54], menara: [32, 64], istana: [64, 78] };
  const THATCH = '#c9ae5e', THATCH_D = '#a98f48', BAMBOO = '#c9b27a', BAMBOO_D = '#9c8450';

  // paint woven bamboo walls
  function weave(P, x, y, w, h) { P.r(x, y, w, h, BAMBOO); for (let j = 0; j < h; j += 2) for (let i = (j >> 1) & 1; i < w; i += 2) P.r(x + i, y + j, 1, 1, BAMBOO_D); }
  // paint grain sacks
  function sacks(P, x, y, n) { for (let i = 0; i < n; i++) { P.r(x + i * 4, y, 3, 3, '#d9c79a'); P.r(x + i * 4, y, 3, 1, '#efe3c0'); P.r(x + i * 4 + 1, y - 1, 1, 1, '#a08a5a'); } }
  // paint trade crates
  function crates(P, x, y) { P.r(x, y, 5, 4, '#a8773c'); P.r(x, y + 2, 5, 1, '#7d5b30'); P.r(x + 5, y + 1, 4, 3, '#8a5a2b'); P.r(x + 2, y - 3, 4, 3, '#b88a52'); P.r(x + 2, y - 2, 4, 1, '#8a5a2b'); }
  // paint a Melaka banner
  function banner(P, x, y, h, T) { P.r(x, y, 1, h, WOOD_D); P.r(x + 1, y + 1, 6, 4, T.main); P.r(x + 1, y + 1, 6, 1, GOLD); P.r(x + 3, y + 3, 2, 1, GOLD); }

  // a Melaka building picture
  function melakaBuilding(kind, team) {
    const T = TEAMC[team] || TEAMC[0], d = MB_DIMS[kind];
    return sprite(`mb|${kind}|${team}`, d[0], d[1], 2, (P) => {
      const r = P.r;
      if (kind === 'jelapang') {
        // Jelapang (Granary): rice barn on tall stilts with rat guards, woven walls, steep thatch, sacks below
        posts(P, [5, 12, 19, 25], 34, 48, 2);
        for (const x of [5, 12, 19, 25]) { r(x - 1, 38, 4, 1, '#5e5a52'); }          // rat-guard discs on the posts
        r(3, 32, 26, 2, '#8f6232'); r(3, 34, 26, 1, '#5a3a1e');
        weave(P, 6, 22, 20, 10); r(13, 25, 6, 7, '#3f2713'); r(12, 24, 8, 1, T.trim);
        roofGable(P, 16, 4, 22, 2, 15, THATCH, THATCH_D, T.roofR); r(2, 22, 28, 1, T.main);
        r(15, 1, 2, 4, WOOD_D);
        r(21, 34, 1, 14, WOOD); r(24, 34, 1, 14, WOOD); for (let y = 36; y < 48; y += 3) r(21, y, 4, 1, WOOD);   // ladder
        sacks(P, 2, 45, 2); sacks(P, 26, 45, 1);
      } else if (kind === 'pangkalan') {
        // Pangkalan (Trading Post): godown on a pier, wide doors, stacked goods, trade canopy and banner
        r(0, 40, 48, 12, '#a47a45'); for (let x = 0; x < 48; x += 4) r(x, 40, 1, 12, '#7d5b30'); r(0, 40, 48, 1, '#c99b5d'); r(0, 51, 48, 1, '#5a3a1e');
        posts(P, [1, 12, 24, 36, 46], 48, 53, 2);
        planks(P, 3, 24, 28, 16, '#c99b5d', '#a97d45'); r(10, 28, 14, 12, '#3f2713'); r(16, 28, 1, 12, '#2a190a'); r(9, 27, 16, 1, T.trim);
        roofGable(P, 17, 10, 24, 5, 17, T.roofA, T.roofB, T.roofR); r(1, 24, 32, 1, T.main);
        r(34, 28, 12, 1, T.main); r(34, 29, 12, 1, CREAM); r(35, 30, 1, 10, WOOD_D); r(44, 30, 1, 10, WOOD_D);    // canopy
        crates(P, 36, 35); sacks(P, 2, 37, 1);
        r(40, 32, 1, 3, STEEL_D); r(38, 32, 5, 1, STEEL_D);                                  // trade scales
        banner(P, 42, 10, 18, T);
      } else if (kind === 'menara') {
        // Menara Kawal (Watchtower): tall braced timber tower, roofed lookout with an archer, team flag
        posts(P, [7, 23], 26, 62, 2);
        for (let y = 30; y < 60; y += 8) { for (let i = 0; i < 7; i++) { r(9 + i * 2, y + i, 2, 1, '#6b4a2a'); r(21 - i * 2, y + i, 2, 1, '#5a3a1e'); } }   // cross bracing
        r(4, 20, 24, 6, '#8f6232'); planks(P, 5, 20, 22, 6, '#b88a52', '#9a6f3a'); r(4, 26, 24, 1, '#5a3a1e'); r(4, 20, 24, 1, T.main);
        r(14, 15, 3, 5, SKIN); r(14, 14, 3, 1, T.main); r(18, 13, 1, 7, WOOD); r(17, 12, 1, 1, WOOD); r(17, 20, 1, 1, WOOD);   // archer with bow
        r(5, 12, 1, 8, WOOD_D); r(26, 12, 1, 8, WOOD_D);
        roofGable(P, 16, 3, 12, 2, 13, THATCH, THATCH_D, T.roofR); r(2, 12, 28, 1, T.main);
        r(16, 0, 1, 4, WOOD_D); r(17, 0, 5, 3, T.main); r(17, 0, 5, 1, GOLD);
      } else if (kind === 'istana') {
        // Istana (Palace): long hall on stilts, three-tiered roof with gold finials, steps, royal banners
        posts(P, [4, 12, 20, 28, 36, 44, 52, 59], 62, 75, 2); r(2, 60, 60, 3, '#8f6232'); r(2, 63, 60, 1, '#5a3a1e');
        r(26, 64, 12, 2, '#a8773c'); r(27, 66, 10, 2, '#a8773c'); r(28, 68, 8, 2, '#a8773c'); r(29, 70, 6, 2, '#a8773c');   // steps
        planks(P, 5, 44, 54, 16, '#c99b5d', '#a97d45');
        r(26, 47, 12, 13, '#3f2713'); r(25, 46, 14, 1, GOLD); r(31, 50, 2, 10, '#2a190a');
        for (const x of [8, 16, 42, 50]) { r(x, 48, 5, 6, '#2b1a0c'); r(x - 1, 47, 7, 1, GOLD); }
        roofGable(P, 32, 34, 44, 20, 31, T.roofA, T.roofB, T.roofR); r(0, 44, 64, 1, T.main); r(0, 45, 64, 1, GOLD);
        roofGable(P, 32, 21, 34, 10, 22, T.roofA, T.roofB, T.roofR); r(9, 34, 46, 1, T.main);
        roofGable(P, 32, 10, 21, 3, 13, T.roofA, T.roofB, T.roofR); r(18, 21, 28, 1, T.main);
        for (const [x, y] of [[31, 4], [9, 32], [54, 32], [18, 19], [45, 19]]) { r(x, y, 2, 4, GOLD); r(x, y - 1, 2, 1, '#fff2b0'); }   // gold finials
        banner(P, 1, 26, 34, T); banner(P, 56, 26, 34, T);
      }
    });
  }

  // Neutral map sites. Pangkalan can only be built on a landing next to a settlement.
  function neutralSite(kind) {
    const N = { main: '#8a8070', trim: '#e9e3d0', roofA: THATCH, roofB: THATCH_D, roofR: '#6b5a3a' };
    return sprite('ns|' + kind, 48, 44, 2, (P) => {
      const r = P.r;
      if (kind === 'village') {
        // Orang Laut settlement: two stilt huts over the water, a moored perahu, a white neutral banner
        for (const [x, s] of [[2, 18], [26, 16]]) {
          posts(P, [x + 1, x + s - 3], 30, 42, 2); r(x, 28, s, 2, '#8f6232');
          weave(P, x + 2, 20, s - 4, 8); r(x + (s >> 1) - 2, 22, 4, 6, '#3f2713');
          roofGable(P, x + (s >> 1), 10, 20, 2, (s >> 1) + 1, N.roofA, N.roofB, N.roofR);
        }
        r(10, 38, 14, 2, '#7a4a24'); r(11, 40, 12, 1, '#5e3b1c'); r(16, 31, 1, 7, WOOD_D); r(17, 32, 4, 5, N.trim);   // perahu
        r(44, 6, 1, 20, WOOD_D); r(45, 7, 3, 4, N.trim);
      } else {
        // empty landing: old pier stubs and a marker post where a Pangkalan can go
        r(4, 30, 40, 6, '#a47a4566'); for (const x of [6, 14, 22, 30, 38]) { r(x, 28, 2, 12, '#6b4a2a'); r(x, 27, 2, 1, '#8f6232'); }
        r(22, 10, 2, 18, WOOD_D); r(20, 10, 6, 2, N.trim); r(21, 12, 4, 1, GOLD);
      }
    });
  }
  /* Majapahit building mockups: the counterparts of buildings-melaka.js.
     Majapahit style: red Trowulan brick, split gates (candi bentar), black ijuk-thatch tiered meru roofs,
     open pendopo halls. Needs art.js helpers, GOLD from drawUnit.js and weave()/sacks()/banner() from buildings-melaka.js.
     majapahitBuilding(kind, team): kind lumbung | bandar | kulkul | kraton */
  const MJ_DIMS = { lumbung: [32, 50], bandar: [48, 54], kulkul: [32, 64], kraton: [64, 78] };
  const BRICK = '#b0533a', BRICK_D = '#843a27', BRICK_L = '#c96d4f', IJUK = '#3a2e2a', IJUK_L = '#54443c';

  // paint red brick courses
  function brick(P, x, y, w, h) { P.r(x, y, w, h, BRICK); for (let j = 1; j < h; j += 2) P.r(x, y + j, w, 1, BRICK_D); for (let j = 0; j < h; j += 2) for (let i = (j & 2) ? 1 : 3; i < w; i += 4) P.r(x + i, y + j, 1, 1, BRICK_D); P.r(x, y, w, 1, BRICK_L); }
  // meru: stacked black thatch tiers, each narrower than the one below
  function meru(P, cx, yBottom, tiers, w0, step) { for (let t = 0; t < tiers; t++) { const w = w0 - t * step, y = yBottom - t * 4; P.r(cx - (w >> 1), y - 2, w, 2, IJUK); P.r(cx - (w >> 1) + 1, y - 3, w - 2, 1, IJUK_L); if (t < tiers - 1) P.r(cx - 2, y - 4, 4, 1, '#5a3a1e'); } P.r(cx - 1, yBottom - tiers * 4 - 2, 2, 3, GOLD); }
  // sun of Majapahit (Surya Majapahit) emblem
  function surya(P, cx, cy) { P.r(cx - 1, cy - 1, 3, 3, GOLD); P.r(cx, cy - 3, 1, 7, GOLD); P.r(cx - 3, cy, 7, 1, GOLD); P.r(cx - 2, cy - 2, 1, 1, GOLD); P.r(cx + 2, cy - 2, 1, 1, GOLD); P.r(cx - 2, cy + 2, 1, 1, GOLD); P.r(cx + 2, cy + 2, 1, 1, GOLD); }
  // paint a Majapahit banner
  function mjBanner(P, x, y, h, T) { P.r(x, y, 1, h, WOOD_D); P.r(x + 1, y + 1, 7, 5, T.main); P.r(x + 1, y + 1, 7, 1, GOLD); surya({ r: P.r }, x + 4, y + 3); }

  // a Majapahit building picture
  function majapahitBuilding(kind, team) {
    const T = TEAMC[team] || TEAMC[1], d = MJ_DIMS[kind];
    return sprite(`mj|${kind}|${team}`, d[0], d[1], 2, (P) => {
      const r = P.r;
      if (kind === 'lumbung') {
        // Lumbung (Granary): Javanese rice barn, posts on a brick footing, a tall bulging black-thatch roof
        brick(P, 3, 44, 26, 4);
        posts(P, [6, 13, 19, 25], 32, 44, 2); for (const x of [6, 13, 19, 25]) r(x - 1, 36, 4, 1, '#5e5a52');
        r(4, 30, 24, 2, '#8f6232');
        planks(P, 8, 22, 16, 8, '#b88a52', '#9a6f3a'); r(14, 24, 4, 6, '#3f2713');
        for (let y = 4; y <= 22; y++) { const t = (y - 4) / 18, hw = Math.round(3 + 12 * Math.sin(t * Math.PI * 0.6)); r(16 - hw, y, hw * 2, 1, (y % 3 === 1) ? IJUK_L : IJUK); }
        r(2, 22, 28, 1, T.main); r(15, 1, 2, 3, GOLD);
        sacks(P, 26, 41, 1); r(1, 40, 4, 3, '#a8803c'); r(1, 40, 4, 1, '#c9a05a');
      } else if (kind === 'bandar') {
        // Bandar (Tribute Post): open pendopo hall on a brick base over a pier, tribute baskets, sun banner
        r(0, 40, 48, 12, '#a47a45'); for (let x = 0; x < 48; x += 4) r(x, 40, 1, 12, '#7d5b30'); r(0, 40, 48, 1, '#c99b5d'); r(0, 51, 48, 1, '#5a3a1e');
        posts(P, [1, 12, 24, 36, 46], 48, 53, 2);
        brick(P, 3, 34, 30, 6);
        for (const x of [5, 13, 21, 29]) { r(x, 22, 2, 12, '#5a3a1e'); r(x, 22, 1, 12, '#40270f'); }            // open pillars
        r(10, 30, 4, 4, '#a8803c'); r(16, 31, 4, 3, '#c9a05a'); r(22, 30, 4, 4, '#a8803c'); r(17, 29, 2, 2, GOLD);   // tribute
        for (let i = 0; i < 6; i++) r(2 + i, 16 + i, 32 - i * 2, 1, i & 1 ? IJUK_L : IJUK);                      // joglo roof, wide eaves
        for (let i = 0; i < 5; i++) r(12 + i, 11 + i, 12 - i * 2 + 2 * i, 1, IJUK);
        r(13, 10, 10, 6, IJUK); r(12, 15, 12, 1, IJUK_L); r(1, 22, 34, 1, T.main);
        r(38, 34, 6, 5, '#a8803c'); r(38, 34, 6, 1, '#c9a05a'); sacks(P, 37, 31, 1);
        mjBanner(P, 40, 8, 20, T);
      } else if (kind === 'kulkul') {
        // Bale Kulkul (Watchtower): stepped brick tower, a timber lookout with the kulkul alarm drum, small meru roof
        brick(P, 6, 34, 20, 28); r(5, 33, 22, 2, BRICK_L); r(4, 60, 24, 2, BRICK_D); r(8, 46, 16, 1, BRICK_L); r(8, 50, 16, 1, BRICK_L);
        r(13, 52, 6, 10, '#2b1a0c'); r(12, 51, 8, 1, GOLD);                                                       // doorway
        posts(P, [7, 23], 20, 33, 2); r(6, 30, 20, 3, '#8f6232'); r(6, 30, 20, 1, T.main);
        r(9, 22, 1, 6, WOOD_D); r(8, 26, 3, 5, '#6b4a2a'); r(8, 26, 3, 1, '#8a5a2b');                             // hanging kulkul drum
        r(15, 25, 3, 5, SKIN); r(15, 24, 3, 1, HAIR); r(19, 23, 1, 7, WOOD); r(18, 22, 1, 1, WOOD); r(18, 30, 1, 1, WOOD);   // archer
        meru(P, 16, 20, 2, 28, 10);
      } else if (kind === 'kraton') {
        // Kraton (Palace): brick-walled compound, candi bentar split gate in front, five-tier meru hall behind
        brick(P, 2, 52, 60, 22); r(2, 52, 60, 1, BRICK_L); r(2, 72, 60, 2, BRICK_D);
        for (let x = 4; x < 60; x += 8) r(x, 50, 4, 2, BRICK_L);                                                  // wall crenels
        // inner hall and meru behind the wall
        r(14, 36, 36, 16, '#c99b5d'); for (const x of [16, 24, 39, 46]) r(x, 38, 2, 14, '#5a3a1e');
        meru(P, 32, 36, 5, 40, 7);
        r(6, 34, 10, 1, IJUK); r(48, 34, 10, 1, IJUK); r(7, 33, 8, 1, IJUK_L); r(49, 33, 8, 1, IJUK_L); r(9, 35, 4, 17, '#c99b5d'); r(51, 35, 4, 17, '#c99b5d');  // side pavilions
        // candi bentar: one stepped tower split down the middle, the two halves either side of the gate
        for (const [x, flip] of [[21, 0], [35, 1]]) {
          brick(P, x, 46, 8, 28);
          for (let i = 0; i < 4; i++) { const w = 8 - i * 2, ox = flip ? x : x + i * 2; brick(P, ox, 42 - i * 3, w, 4); }
        }
        r(30, 52, 4, 22, '#2b1a0c'); r(29, 74, 6, 2, '#a8773c');
        mjBanner(P, 2, 28, 24, T); mjBanner(P, 54, 28, 24, T);
      }
    });
  }

  /* ---------- common buildings in Majapahit style ----------
     majapahitBase(kind, team): kind towncentre | house | barracks | port, same canvas sizes as buildingSprite().
     Needs pier() and rack() from buildings-mainland.js. */
  const MJBASE_DIMS = { towncentre: [48, 62], house: [32, 46], barracks: [48, 58], port: [48, 54], store: [32, 46] };
  // black ijuk gable roof with a thick dark edge
  function ijukRoof(P, cx, y0, y1, hw0, hw1) { roofGable(P, cx, y0, y1, hw0, hw1, IJUK, IJUK_L, '#241c19'); }

  // Majapahit Town Centre and palace base
  function majapahitBase(kind, team) {
    const T = TEAMC[team == null ? 1 : team], d = MJBASE_DIMS[kind];
    return sprite(`mjbase|${kind}|${T.name}`, d[0], d[1], 2, (P) => {
      const r = P.r;
      if (kind === 'towncentre') {
        // high brick platform (batur), an open pendopo hall on red pillars, two-tier black meru-style roof
        brick(P, 2, 46, 44, 14); r(2, 46, 44, 1, BRICK_L); r(2, 59, 44, 2, BRICK_D);
        r(19, 52, 10, 9, BRICK_D); r(20, 54, 8, 2, BRICK_L); r(21, 57, 6, 2, BRICK_L);   // front stair
        for (const x of [6, 14, 22, 26, 33, 41]) { r(x, 32, 2, 14, '#8a2a1e'); r(x, 32, 1, 14, '#5e1c14'); }
        r(10, 38, 6, 8, '#a8803c'); r(32, 38, 6, 8, '#a8803c'); r(20, 40, 8, 6, '#3f2713');
        ijukRoof(P, 24, 20, 32, 8, 24); r(0, 32, 48, 1, T.main);
        ijukRoof(P, 24, 8, 20, 3, 13); r(10, 20, 28, 1, T.main); r(23, 2, 2, 6, GOLD);
        mjBanner(P, 38, 0, 18, T);
      } else if (kind === 'house') {
        // brick footing, timber walls, steep black thatch
        brick(P, 3, 38, 26, 6);
        planks(P, 6, 26, 20, 12, '#b88a52', '#9a6f3a'); r(13, 28, 6, 10, '#3f2713'); r(8, 29, 3, 3, '#2b1a0c'); r(21, 29, 3, 3, '#2b1a0c');
        ijukRoof(P, 16, 8, 26, 2, 14); r(2, 26, 28, 1, T.main); r(15, 5, 2, 4, GOLD);
      } else if (kind === 'store') {
        // Gudang: a brick-footed timber store under black ijuk, a log stack and a gold chest at the door
        brick(P, 1, 38, 30, 6); r(1, 38, 30, 1, BRICK_L);
        planks(P, 4, 25, 24, 13, '#b88a52', '#9a6f3a'); r(12, 28, 8, 10, '#3f2713'); r(12, 27, 8, 1, GOLD);
        ijukRoof(P, 16, 9, 25, 3, 15); r(2, 25, 28, 1, T.main);
        for (let i = 0; i < 3; i++) { r(22, 35 - i * 2, 8, 2, i % 2 ? '#a0693a' : '#8a5a2b'); r(29, 35 - i * 2, 1, 2, '#c99b5d'); }
        r(2, 33, 8, 5, '#5e3b1c'); r(2, 32, 8, 2, '#f2c94c'); r(4, 31, 3, 1, '#ffe27a'); r(5, 34, 2, 2, '#333');
      } else if (kind === 'barracks') {
        // brick-walled hall with a long black roof, painted tameng shields and a weapon rack
        brick(P, 2, 36, 44, 18); r(2, 36, 44, 1, BRICK_L); r(16, 40, 16, 14, '#2f1d0e'); rack(P, 18, 41);
        for (const x of [5, 37]) { r(x, 38, 5, 12, T.main); r(x, 38, 5, 1, GOLD); r(x + 2, 40, 1, 8, GOLD); }
        ijukRoof(P, 24, 16, 36, 8, 25); r(0, 36, 48, 1, T.main);
        r(23, 6, 1, 10, WOOD_D); mjBanner(P, 23, 4, 12, T);
      } else {
        // brick-based pendopo on the pier, and a jong mast with a mat sail
        pier(P); brick(P, 3, 34, 28, 6);
        for (const x of [5, 12, 20, 27]) r(x, 24, 2, 10, '#8a2a1e');
        r(10, 29, 5, 5, '#a8803c'); r(17, 30, 5, 4, '#c9a05a');
        ijukRoof(P, 17, 12, 24, 4, 16); r(1, 24, 32, 1, T.main);
        r(40, 12, 1, 28, WOOD_D); tanja(P, 33, 13, 8, 13, MAT, MAT_D, T, true); r(41, 10, 5, 3, T.main);
      }
    });
  }
  // pier() and rack() from buildings-mainland.js, used by the Majapahit port and barracks
  function pier(P) { P.r(0, 40, 48, 12, '#a47a45'); for (let x = 0; x < 48; x += 4) P.r(x, 40, 1, 12, '#7d5b30'); P.r(0, 40, 48, 1, '#c99b5d'); P.r(0, 51, 48, 1, '#5a3a1e'); posts(P, [1, 14, 28, 44], 48, 53, 3); }
  // paint a drying rack
  function rack(P, x, y) { for (let i = 0; i < 4; i++) { P.r(x + i * 3, y, 1, 10, '#8a5a2b'); P.r(x + i * 3, y - 1, 1, 1, STEEL); } P.r(x - 1, y + 4, 12, 1, WOOD_D); }
  // healers.js: Tabib / Acaraki and their buildings
  /* Healers: Melaka Tabib + Rumah Tabib, Majapahit Acaraki + Patirthan. Lore: lore/healers.md.
     Same style and canvas as unitSprite() (16x18 at 2x) and the civ buildings. Needs art.js helpers,
     GOLD/GOLD_D and LEGS from drawUnit.js, and weave()/sacks() from buildings-melaka.js, brick()/IJUK from buildings-majapahit.js.
     healerSprite(team, anim, f): team 0 Tabib, 1 Acaraki; anim idle | walk (f 0-3) | heal (f 0-2)
     healerBuilding(kind, team): kind rumahtabib | patirthan | perigi */
  const HERB = '#4e9a3c', HERB_L = '#8fd06a', BRASS = '#c9973a', BRASS_D = '#8e6624', JAMU = '#d9a521';

  // paint a healer (Tabib, Acaraki, Mo)
  function drawHealer(P, team, anim, f) {
    const T = TEAMC[team] || TEAMC[0], r = P.r, mel = team === 0;
    const walk = anim === 'walk', heal = anim === 'heal';
    const bob = (walk && (f === 1 || f === 3)) ? -1 : 0;
    const B = (x, y, w, h, c) => r(x, y + 2 + bob, w, h, c);
    const S = (x, y, w, h, c) => r(x, y + 2, w, h, c);
    const L = LEGS[walk ? f : 1];
    if (mel) {
      // Tabib: long white baju over a dark green sarong, herb bag on the hip
      for (const l of L) { S(l[0], l[1], l[2], l[3], '#1f3a2a'); S(l[0], l[1] + l[3] - 1, l[2], 1, '#2b1d12'); }
      B(5, 7, 6, 4, '#f4f0e2'); B(5, 10, 6, 1, '#d8d2bc'); B(7, 7, 2, 1, '#d8d2bc');
      B(5, 11, 6, 1, T.main); B(5, 11, 6, 1, T.main);
      B(3, 9, 2, 3, '#a8803c'); B(3, 9, 2, 1, '#c9a05a'); B(3, 8, 1, 1, HERB);                 // cloth herb bag
      B(4, 8, 1, 3, '#f4f0e2');                                                                  // left sleeve
      // head: short beard, black songkok
      B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, '#3a2a1e'); B(9, 5, 1, 1, HAIR);
      B(6, 1, 4, 2, '#1c1c1c'); B(6, 1, 4, 1, '#2e2e2e');
    } else {
      // Acaraki: jamu maker in a batik kain and kemben, hair in a bun, gendong sling of jamu bottles on the back
      for (const l of L) { S(l[0], l[1], l[2], l[3], SKIN_D); S(l[0], l[1] + l[3] - 1, l[2], 1, '#2b1d12'); }
      B(1, 5, 4, 7, '#b88a52'); B(1, 5, 4, 1, '#d6b072'); B(1, 8, 4, 1, '#8f6232');             // gendong basket on the back
      B(1, 3, 1, 2, JAMU); B(2, 2, 1, 3, '#7a4a24'); B(3, 3, 1, 2, '#efe3c0'); B(4, 4, 1, 1, '#4e9a3c');   // bottle necks over the shoulder
      B(5, 7, 6, 3, '#2f4a46'); B(5, 7, 6, 1, SKIN);                                              // dark kemben, bare shoulders
      B(5, 8, 1, 1, T.main); B(6, 9, 1, 1, T.main); B(7, 10, 1, 1, T.main); B(8, 11, 1, 1, T.main); B(4, 7, 1, 1, T.main);   // selendang sling across the body
      B(5, 10, 6, 2, '#6a3e22'); B(5, 10, 6, 1, '#c9a05a'); B(6, 11, 1, 1, '#c9a05a'); B(9, 11, 1, 1, '#c9a05a');   // batik kain
      B(4, 8, 1, 3, SKIN);
      B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 4, 1, 1, HAIR);
      B(6, 2, 4, 1, HAIR); B(5, 2, 1, 3, HAIR); B(5, 1, 3, 1, HAIR); B(4, 3, 1, 2, HAIR);          // hair pulled back to a bun
      B(8, 1, 1, 1, '#f4ecd4'); B(9, 2, 1, 1, '#e8c97a');                                         // jasmine in the hair
    }
    // right arm and hand: idle holds the mortar or a cup; heal raises it with green herb sparks
    const sleeve = mel ? '#f4f0e2' : SKIN;
    if (!heal) {
      B(11, 8, 1, 3, sleeve);
      if (mel) { B(11, 11, 2, 2, BRASS); B(11, 11, 2, 1, BRASS_D); B(12, 10, 1, 1, '#6b4a2a'); }  // brass mortar and pestle
      else { B(11, 11, 2, 2, '#e8dcb8'); B(11, 11, 2, 1, JAMU); }                                  // cup of jamu
    } else {
      const up = f === 1 ? 1 : 0;
      B(11, 7 - up, 1, 2, sleeve); B(12, 6 - up, 1, 2, sleeve);
      if (mel) { B(12, 4 - up, 2, 2, BRASS); B(12, 4 - up, 2, 1, BRASS_D); }
      else { B(12, 4 - up, 2, 2, '#e8dcb8'); B(12, 4 - up, 2, 1, JAMU); }
      const sp = [[14, 1], [15, 4], [13, 0], [15, 2]];
      for (let i = 0; i <= f; i++) { const [sx, sy] = sp[i]; r(sx, sy + 1, 1, 1, i & 1 ? HERB : HERB_L); }
      if (f === 2) { r(14, -1 + 2, 1, 3, HERB_L); r(13, 0 + 2, 3, 1, HERB_L); }                     // small green cross: heal lands
    }
  }
  // healer picture
  function healerSprite(team, anim, f) {
    return sprite(`heal|${team}|${anim}|${f}`, 16, 18, 2, (P) => drawHealer(P, team, anim, f));
  }

  const HB_DIMS = { rumahtabib: [48, 54], patirthan: [56, 50], perigi: [32, 34] };
  const WATER = '#3d86a3', WATER_L = '#7fb7b8', WATER_D = '#2d6f8f';

  // paint a herb bed
  function herbBed(P, x, y, w) { P.r(x, y, w, 3, '#6b4a2a'); for (let i = 0; i < w; i += 2) { P.r(x + i, y - 1, 1, 2, HERB); if (i % 4 === 0) P.r(x + i, y - 2, 1, 1, HERB_L); } }

  // healer building picture (Rumah Tabib, Patirthan)
  function healerBuilding(kind, team) {
    const T = TEAMC[team] || TEAMC[kind === 'patirthan' ? 1 : 0], d = HB_DIMS[kind];
    return sprite(`hb|${kind}|${team}`, d[0], d[1], 2, (P) => {
      const r = P.r;
      if (kind === 'rumahtabib') {
        // Rumah Tabib: Malay house on stilts, a serambi veranda with drying herbs, herb beds and a mortar out front
        posts(P, [6, 14, 22, 30, 36], 36, 48, 2);
        r(4, 34, 36, 2, '#8f6232'); r(4, 36, 36, 1, '#5a3a1e');
        planks(P, 8, 22, 26, 12, '#b88a52', '#9a6f3a'); r(18, 25, 6, 9, '#3f2713'); r(11, 25, 4, 4, '#2b1a0c'); r(27, 25, 4, 4, '#2b1a0c');
        r(34, 28, 8, 6, '#c99b5d'); r(34, 28, 8, 1, '#a8773c');                                    // serambi
        for (const x of [35, 38, 41]) { r(x, 24, 1, 3, HERB); r(x, 27, 1, 1, HERB_L); }             // herb bundles hanging to dry
        r(34, 23, 9, 1, WOOD_D);
        roofGable(P, 21, 6, 22, 2, 18, '#c9ae5e', '#a98f48', T.roofR); r(2, 22, 38, 1, T.main);
        r(36, 20, 8, 3, '#c9ae5e'); r(36, 20, 8, 1, '#a98f48');                                     // veranda roof
        r(20, 3, 2, 3, WOOD_D);
        for (let y = 37; y < 48; y += 3) r(16, y, 5, 1, WOOD); r(16, 36, 1, 12, WOOD); r(20, 36, 1, 12, WOOD);   // ladder
        herbBed(P, 1, 49, 12); herbBed(P, 27, 49, 16);
        r(40, 44, 4, 3, BRASS); r(40, 44, 4, 1, BRASS_D); r(42, 42, 1, 3, '#6b4a2a');                // big mortar
        r(1, 40, 1, 9, WOOD_D); r(2, 41, 5, 3, '#f4f0e2'); r(3, 42, 3, 1, HERB);                     // white sign with a green leaf
      } else if (kind === 'patirthan') {
        // Patirthan: stepped red-brick bathing pool like Candi Tikus, a small shrine at the back, water spouts
        const P0 = P; P = { r: (x, y, w, h, c) => P0.r(x, y + 6, w, h, c) }; const r = P.r;
        brick(P, 2, 10, 52, 30); r(2, 10, 52, 1, BRICK_L);
        brick(P, 6, 14, 44, 22); r(6, 14, 44, 1, BRICK_D);
        r(10, 18, 36, 14, WATER_D); r(10, 18, 36, 1, BRICK_D);
        r(12, 20, 32, 10, WATER); for (const [wx, wy] of [[15, 23], [28, 26], [36, 22], [20, 28]]) r(wx, wy, 4, 1, WATER_L);
        for (let i = 0; i < 3; i++) r(24 + i, 32 + i, 8 - i * 2, 1, BRICK_L);                     // steps down into the water
        brick(P, 22, 36, 12, 6);
        // central shrine with a small meru roof
        brick(P, 23, 4, 10, 10); r(26, 8, 4, 6, '#2b1a0c'); meru(P, 28, 4, 2, 14, 6);
        for (const x of [14, 40]) { r(x, 16, 2, 2, '#843a27'); r(x, 18, 2, 1, WATER_L); r(x + 1, 19, 1, 3, WATER_L); }   // spouts
        for (const x of [3, 50]) { brick(P, x, 4, 4, 8); r(x, 2, 4, 2, IJUK); r(x + 1, 0, 2, 2, GOLD); }               // corner posts
        r(8, 40, 6, 3, '#d6c79a'); r(42, 40, 6, 3, '#d6c79a'); r(9, 39, 1, 1, '#e8c97a'); r(44, 39, 1, 1, '#d0392f'); // offerings
        r(50, 13, 1, 12, WOOD_D); r(51, 14, 3, 3, T.main); r(51, 14, 3, 1, GOLD);
      } else {
        // Perigi Raja (optional): the royal well of Bukit Cina, brick-rimmed with a little roof
        brick(P, 6, 20, 20, 10); r(6, 20, 20, 1, BRICK_L); r(9, 21, 14, 3, WATER_D); r(11, 22, 6, 1, WATER_L);
        r(8, 8, 2, 13, WOOD_D); r(22, 8, 2, 13, WOOD_D); r(8, 12, 16, 1, WOOD);
        r(15, 12, 1, 8, '#d8d0b0'); r(14, 18, 3, 3, '#8a5a2b');
        roofGable(P, 16, 1, 9, 1, 11, '#c9ae5e', '#a98f48', T.roofR);
        r(1, 29, 5, 3, '#d9c79a'); r(26, 30, 4, 2, '#a8803c');
      }
    });
  }
  return { melakaBuilding, majapahitBuilding, majapahitBase, neutralSite, healerSprite, healerBuilding };
})();
