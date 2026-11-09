/* ##### CHAPTER EXTRA 8 · Khmer #####
   File: src/js/extras/08-khmer.js
   What it does: the fourth civ (civ id 4, column 3 of the per-civ tables). Groundwork: every per-civ table gets a
     Khmer column. Until Khmer's own roster lands, a missing Khmer value copies Melaka's, so nothing breaks.
   Things you can tweak:
     - KHMER: Khmer's own values; anything set here wins over the Melaka copy.
   ############################################################################ */
const KHMER = {
  team: { name: 'Khmer', main: '#2f6fb3', dark: '#1d4a7a', trim: '#d8cfb8', roofA: '#b8a27a', roofB: '#94805c', roofR: '#3a3a44', ring: '#8ec2ff' },
  mini: ['#6fb0ff', '#b8d8ff'],
  mod: { hp: 1, spd: 1, cost: 1, arm: 0 },
  burn: 0.25,  // stone and laterite: a quarter of the normal burn
  // Encyclopedia lines for the Khmer group where the shared line names another civ
  ency: {
    tabib: 'Khmer physician from the Arogyasala. Heals one wounded soldier at a time.',
    rumahtabib: 'The Arogyasala, a royal hospital as Jayavarman VII built them: trains the Vaidya.',
    palace: 'One only. The Prasat trains the Damrei Sna, the ballista elephant.',
    bal: 'A war elephant carrying a twin-bow ballista. Long range, hits elephants, ships and siege hard. Trained at the Prasat from the Kingdom Age.',
    kcart: 'A great crossbow on an ox cart. Very long range and heavy bolts, slow to move. Up to 3, from the Barracks in the Kingdom Age.',
    baray: 'A stone-banked reservoir. Farms within 6 tiles gather 25% faster. Kingdom Age.',
  }
};
(function khmerColumns() {
  const pad = (a) => { if (Array.isArray(a) && a.length === 3) a.push(a[0]); };
  for (const k in CIV_NAMES) pad(CIV_NAMES[k]);
  for (const k in CIV_ROLE) { const r = CIV_ROLE[k]; while (r.length < 3) r.push(null); pad(r); }
  for (const A of AGE_TABLE) if (A) pad(A.local);
  pad(ARCHER_LINE); pad(TRADE.civ); pad(FIRE_ARROWS.local);
  for (const D of [UD, BD]) for (const k in D) for (const f of ['civHp', 'civAtk', 'civCap', 'civBld']) pad(D[k][f]);
  // civ-id tables (indexed by CV, not CI); a battle page that already uses slot 4 for its own side keeps it
  if (typeof setupObj === 'function') return;
  TEAMC[KHM_CIV] = KHMER.team; MINIC[KHM_CIV] = KHMER.mini; TEAMMOD[KHM_CIV] = KHMER.mod; BURNMAT[KHM_CIV] = KHMER.burn;
  // Khmer builds and trains what Melaka does, apart from what the roster below changes
  for (const D of [UD, BD]) for (const k in D) { const c = D[k].civ; if (Array.isArray(c) ? c.includes(0) && !c.includes(KHM_CIV) : c === 0) D[k].civ = Array.isArray(c) ? c.concat(KHM_CIV) : [0, KHM_CIV]; }
})();
/* Khmer art (unit-art/civs-khmer.js, ships.js, civs-ayutthaya-daiviet.js, ships-mainland.js, buildings-mainland.js,
   lore/scenes/bld-khmer.js, and the Cart Ballista from the Gates of Angkor battle), kept in its own scope */
const KMART = (() => {
/* Melaka building mockups, same style as buildingSprite() in art.js (stilts, planks, thatch gables).
   Needs sprite(), disc(), planks(), roofGable(), posts(), TEAMC and the palette constants from art.js,
   and GOLD/GOLD_D from drawUnit.js.
   melakaBuilding(kind, team): kind jelapang | pangkalan | menara | istana
   neutralSite(kind): kind village (Orang Laut settlement) | landing (empty Pangkalan site) */
const MB_DIMS = { jelapang: [32, 50], pangkalan: [48, 54], menara: [32, 64], istana: [64, 78] };
const THATCH = '#c9ae5e', THATCH_D = '#a98f48', BAMBOO = '#c9b27a', BAMBOO_D = '#9c8450';

function weave(P, x, y, w, h) { P.r(x, y, w, h, BAMBOO); for (let j = 0; j < h; j += 2) for (let i = (j >> 1) & 1; i < w; i += 2) P.r(x + i, y + j, 1, 1, BAMBOO_D); }
function sacks(P, x, y, n) { for (let i = 0; i < n; i++) { P.r(x + i * 4, y, 3, 3, '#d9c79a'); P.r(x + i * 4, y, 3, 1, '#efe3c0'); P.r(x + i * 4 + 1, y - 1, 1, 1, '#a08a5a'); } }
function crates(P, x, y) { P.r(x, y, 5, 4, '#a8773c'); P.r(x, y + 2, 5, 1, '#7d5b30'); P.r(x + 5, y + 1, 4, 3, '#8a5a2b'); P.r(x + 2, y - 3, 4, 3, '#b88a52'); P.r(x + 2, y - 2, 4, 1, '#8a5a2b'); }
function banner(P, x, y, h, T) { P.r(x, y, 1, h, WOOD_D); P.r(x + 1, y + 1, 6, 4, T.main); P.r(x + 1, y + 1, 6, 1, GOLD); P.r(x + 3, y + 3, 2, 1, GOLD); }

function melakaBuilding(kind, team) {
  const T = KTEAMC[team] || KTEAMC[0], d = MB_DIMS[kind];
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

function brick(P, x, y, w, h) { P.r(x, y, w, h, BRICK); for (let j = 1; j < h; j += 2) P.r(x, y + j, w, 1, BRICK_D); for (let j = 0; j < h; j += 2) for (let i = (j & 2) ? 1 : 3; i < w; i += 4) P.r(x + i, y + j, 1, 1, BRICK_D); P.r(x, y, w, 1, BRICK_L); }
// meru: stacked black thatch tiers, each narrower than the one below
function meru(P, cx, yBottom, tiers, w0, step) { for (let t = 0; t < tiers; t++) { const w = w0 - t * step, y = yBottom - t * 4; P.r(cx - (w >> 1), y - 2, w, 2, IJUK); P.r(cx - (w >> 1) + 1, y - 3, w - 2, 1, IJUK_L); if (t < tiers - 1) P.r(cx - 2, y - 4, 4, 1, '#5a3a1e'); } P.r(cx - 1, yBottom - tiers * 4 - 2, 2, 3, GOLD); }
// sun of Majapahit (Surya Majapahit) emblem
function surya(P, cx, cy) { P.r(cx - 1, cy - 1, 3, 3, GOLD); P.r(cx, cy - 3, 1, 7, GOLD); P.r(cx - 3, cy, 7, 1, GOLD); P.r(cx - 2, cy - 2, 1, 1, GOLD); P.r(cx + 2, cy - 2, 1, 1, GOLD); P.r(cx - 2, cy + 2, 1, 1, GOLD); P.r(cx + 2, cy + 2, 1, 1, GOLD); }
function mjBanner(P, x, y, h, T) { P.r(x, y, 1, h, WOOD_D); P.r(x + 1, y + 1, 7, 5, T.main); P.r(x + 1, y + 1, 7, 1, GOLD); surya({ r: P.r }, x + 4, y + 3); }

function majapahitBuilding(kind, team) {
  const T = KTEAMC[team] || KTEAMC[1], d = MJ_DIMS[kind];
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
const MJBASE_DIMS = { towncentre: [48, 62], house: [32, 46], barracks: [48, 58], port: [48, 54] };
// black ijuk gable roof with a thick dark edge
function ijukRoof(P, cx, y0, y1, hw0, hw1) { roofGable(P, cx, y0, y1, hw0, hw1, IJUK, IJUK_L, '#241c19'); }

function majapahitBase(kind, team) {
  const T = KTEAMC[team == null ? 1 : team], d = MJBASE_DIMS[kind];
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

const NAVAL_DIMS = { fishing: [24, 22], trade: [36, 30], light: [30, 24], galley: [38, 29], frigate: [44, 36], flagship: [54, 42] };
const NAVAL_NAMES = [
  { fishing: 'Sampan', trade: 'Jong Dagang', light: 'Penjajap', galley: 'Lancaran', frigate: 'Ghali', flagship: 'Mendam Berahi' },
  { fishing: 'Jukung', trade: 'Perahu Api', light: 'Jukung Perang', galley: 'Kelulus', frigate: 'Jong Perang', flagship: 'Jong Raya' }
];

const NAVAL_CLASS = [
  { fishing: 'Fishing Boat', trade: 'Armed Trade Ship', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' },
  { fishing: 'Fishing Boat', trade: 'Fire Ship', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' }
];

function navalSprite(kind, team) {
  const T = KTEAMC[team] || KTEAMC[0], mel = team === 0;
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

/* Ayutthaya and Dai Viet unit art mockups, same style as drawUnit.js (16x18 logical, 2x scale).
   Uses sprite(), disc(), LEGS, GOLD/GOLD_D and the palette constants from art.js/drawUnit.js.
   Roster follows /mnt/project-files/lore/civs-and-timeline.md.
   kinds: villager, sword, spear, archer, unique (Ayutthaya's unique is the elephant, see elephantSprite). */
const CIVC = {
  ayu: { name: 'Ayutthaya', main: '#7a3f9e', dark: '#4e2468', trim: GOLD, ring: '#d3a8ff' },
  dv: { name: 'Dai Viet', main: '#e0b52c', dark: '#9a6e12', trim: '#c0392b', ring: '#ffe08a' }
};
const IRON = '#4a4e57', IRON_L = '#7c818c', SMOKE = '#d8d8d8';

function drawCivUnit(P, civ, kind, anim, f) {
  const C = CIVC[civ], r = P.r, ayu = civ === 'ayu', vil = kind === 'villager';
  const walk = anim === 'walk', atk = anim === 'attack';
  const bob = (walk && (f === 1 || f === 3)) ? -1 : 0;
  const B = (x, y, w, h, c) => r(x, y + 2 + bob, w, h, c);
  const S = (x, y, w, h, c) => r(x, y + 2, w, h, c);
  // legs: Ayutthaya bare-legged under the chong kraben, Dai Viet in dark trousers
  const legC = ayu ? SKIN_D : '#2b2622';
  for (const l of LEGS[walk ? f : 1]) { S(l[0], l[1], l[2], l[3], legC); S(l[0], l[1] + l[3] - 1, l[2], 1, '#2b1d12'); }
  if (kind === 'archer' && ayu) { B(3, 5, 2, 6, WOOD_D); B(3, 4, 1, 1, '#f4ecd4'); B(4, 4, 1, 1, C.main); }

  // torso
  if (ayu) {
    if (vil) { B(5, 7, 6, 3, SKIN); B(5, 9, 6, 1, SKIN_D); B(5, 10, 6, 2, '#6b8a9a'); B(5, 10, 6, 1, '#d9cfa8'); }
    else {
      // short fitted jacket (suea) with gold edge, chong kraben wrap below
      B(5, 7, 6, 3, C.main); B(7, 7, 2, 3, GOLD); B(5, 9, 6, 1, C.dark);
      B(5, 10, 6, 2, kind === 'unique' ? GOLD : C.dark); B(5, 10, 6, 1, GOLD);
    }
  } else {
    if (vil) { B(5, 7, 6, 4, '#8a6b4a'); B(5, 10, 6, 1, '#6a4e33'); }
    else {
      // long ao tunic to the knee, dark sash
      B(5, 7, 6, 6, C.main); B(5, 10, 6, 1, '#2b2622'); B(8, 7, 1, 3, C.dark); B(5, 12, 6, 1, C.dark);
    }
  }
  // arms
  const sleeve = ayu ? (vil ? SKIN : C.main) : (vil ? '#8a6b4a' : C.main);
  const holdFront = (!ayu && (kind === 'archer' || kind === 'unique'));
  B(4, 8, 1, 3, sleeve);
  if (holdFront) B(10, 9, 2, 1, sleeve);
  else if (atk && f === 1 && kind !== 'spear' && kind !== 'archer') B(11, 8, 3, 1, sleeve); else B(11, 8, 1, 3, sleeve);
  if (ayu && !vil) { B(4, 10, 1, 1, SKIN); B(11, 10, 1, 1, SKIN); }

  // head
  B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR);
  // headgear
  if (ayu) {
    if (vil) { B(4, 2, 8, 1, '#d9b45a'); B(5, 1, 6, 1, '#e8c97a'); B(6, 0, 4, 1, '#d9b45a'); }          // ngob, a rounded farmer's hat
    else if (kind === 'archer') { B(6, 2, 4, 1, HAIR); B(5, 3, 6, 1, '#c0392b'); B(4, 4, 1, 2, '#c0392b'); }
    else {
      // tall pointed cap with a gold spike, the Ayutthaya soldier's silhouette
      B(5, 2, 6, 2, C.main); B(5, 3, 6, 1, GOLD); B(6, 1, 4, 1, C.main); B(7, 0, 2, 1, C.main); B(7, -1, 2, 1, GOLD); B(8, -2, 1, 1, GOLD);
    }
  } else {
    if (vil) { B(3, 3, 10, 1, '#efe0b0'); B(4, 2, 8, 1, '#e2d09a'); B(5, 1, 6, 1, '#efe0b0'); B(6, 0, 4, 1, '#e2d09a'); B(7, -1, 2, 1, '#efe0b0'); }  // non la, steep and pale
    else {
      // lacquered conical helmet (non chop), black with a red tip
      B(4, 3, 8, 1, '#1e1a18'); B(5, 2, 6, 1, '#2b2622'); B(6, 1, 4, 1, '#2b2622'); B(7, 0, 2, 1, '#2b2622'); B(7, -1, 2, 1, C.trim);
      if (kind === 'unique') B(4, 3, 8, 1, C.main);
    }
  }

  // weapons
  if (kind === 'sword') {
    if (ayu) {
      // daab song mue: a sword in each hand
      if (atk && f === 1) { B(12, 7, 4, 1, STEEL); B(0, 8, 4, 1, STEEL); B(11, 8, 1, 1, WOOD_D); B(4, 8, 1, 1, WOOD_D); }
      else { B(12, 3, 1, 6, STEEL); B(12, 9, 1, 2, WOOD_D); B(3, 4, 1, 6, STEEL); B(3, 10, 1, 1, WOOD_D); }
    } else {
      // dao saber and a round rattan shield
      disc({ r: B }, 4, 10, 2, '#a8803c'); B(4, 10, 1, 1, C.trim); B(3, 9, 1, 1, '#c9a05a');
      if (atk && f === 1) { B(13, 7, 3, 1, STEEL); B(15, 6, 1, 1, STEEL); }
      else { B(12, 4, 1, 5, STEEL); B(13, 3, 1, 2, STEEL); B(11, 9, 3, 1, '#2b2622'); }
    }
  } else if (kind === 'spear') {
    // Ayutthaya: long spear; Dai Viet: spear with a red pennant
    if (!atk || f === 2) { S(12, 0, 1, 16, WOOD); S(12, -1, 1, 2, STEEL); if (!ayu) { S(13, 1, 2, 2, C.trim); S(15, 2, 1, 1, C.trim); } else S(11, 2, 1, 1, GOLD); }
    else if (f === 0) { B(6, 9, 8, 1, WOOD); B(14, 9, 1, 1, STEEL); }
    else { B(8, 9, 7, 1, WOOD); B(15, 9, 1, 1, STEEL); }
  } else if (kind === 'archer') {
    if (ayu) {
      B(13, 4, 1, 1, WOOD); B(14, 5, 1, 8, WOOD); B(13, 13, 1, 1, WOOD);
      if (atk && f === 0) { B(9, 9, 5, 1, WOOD); B(13, 5, 1, 8, '#d8d0b0'); B(14, 9, 1, 1, STEEL); } else B(13, 5, 1, 8, '#d8d0b0');
    } else {
      // no (crossbow), held level across the body
      B(9, 9, 6, 1, WOOD); B(14, 7, 1, 5, WOOD_D); B(13, 7, 1, 1, '#d8d0b0'); B(13, 11, 1, 1, '#d8d0b0');
      if (atk && f === 1) B(15, 9, 1, 1, STEEL);
    }
  } else if (kind === 'unique' && !ayu) {
    // hoa dong: hand cannon, an iron tube on a wooden pole; smoke puff when it fires
    B(8, 9, 4, 1, WOOD); B(12, 8, 4, 2, IRON); B(12, 8, 4, 1, IRON_L); B(15, 8, 1, 2, '#2b2622');
    if (atk && f === 1) { B(14, 5, 2, 2, SMOKE); B(13, 4, 2, 1, '#eeeeee'); B(15, 7, 1, 1, '#f6b33a'); }
  }
}

function civUnitSprite(civ, kind, anim, f) {
  return sprite(`cu|${civ}|${kind}|${anim}|${f}`, 16, 18, 2, (P) => drawCivUnit(P, civ, kind, anim, f));
}

// Chang Suek: Ayutthaya war elephant with a mahout and a spearman in a gilded howdah. 28x26 logical.
function elephantSprite(anim, f) {
  const C = CIVC.ayu;
  return sprite(`eleph|${anim}|${f}`, 28, 26, 2, (P) => {
    const r = P.r, GREY = '#8c8a8f', GREY_D = '#6b696e', GREY_L = '#a9a7ab';
    const walk = anim === 'walk', atk = anim === 'attack', step = walk ? (f & 1) : 0;
    // legs
    for (const [x, ph] of [[5, 0], [9, 1], [16, 0], [20, 1]]) { const h = (walk && ph === step) ? 4 : 5; r(x, 21 - (5 - h), 3, h, GREY_D); r(x, 25 - (5 - h), 3, 1, '#4a4850'); }
    // body
    r(4, 12, 19, 9, GREY); r(5, 11, 17, 1, GREY); r(4, 19, 19, 2, GREY_D); r(6, 13, 4, 1, GREY_L);
    // caparison
    r(8, 12, 11, 5, C.main); r(8, 16, 11, 1, GOLD); r(8, 12, 11, 1, GOLD); r(12, 14, 3, 1, GOLD);
    // head, ear, trunk, tusk
    r(21, 9, 5, 7, GREY); r(20, 10, 2, 5, GREY_D); r(24, 11, 1, 1, '#1e1a18');
    if (atk && f === 1) { r(26, 7, 2, 2, GREY); r(26, 5, 1, 2, GREY); }   // trunk raised
    else { r(25, 15, 2, 4, GREY); r(26, 19, 1, 2, GREY); }
    r(24, 16, 3, 1, '#f4ecd4'); r(27, 15, 1, 1, '#f4ecd4');
    r(22, 8, 3, 1, GOLD); r(23, 7, 1, 1, '#c0392b');                     // gold headpiece
    // howdah with a pointed gold roof
    r(9, 7, 9, 5, '#a8803c'); r(9, 7, 9, 1, GOLD); r(10, 8, 7, 3, C.dark);
    r(10, 4, 7, 1, GOLD); r(11, 3, 5, 1, GOLD); r(12, 2, 3, 1, GOLD); r(13, 0, 1, 2, GOLD);
    r(9, 5, 1, 2, WOOD_D); r(17, 5, 1, 2, WOOD_D);
    // spearman in the howdah
    r(12, 6, 3, 2, SKIN); r(12, 5, 3, 1, C.main);
    if (atk && f === 0) { r(15, 6, 9, 1, WOOD); r(24, 6, 1, 1, STEEL); } else { r(16, 0, 1, 8, WOOD); r(16, -1, 1, 1, STEEL); }
    // mahout on the neck with an elephant hook
    r(20, 6, 2, 3, SKIN); r(20, 5, 2, 1, '#c0392b'); r(20, 9, 2, 1, C.main); r(22, 6, 2, 1, WOOD_D);
  });
}

/* Khmer unit art mockups, same style as drawUnit.js (16x18 logical, 2x scale).
   Uses sprite(), disc(), LEGS, GOLD/GOLD_D, hull() and the palette constants from art.js/drawUnit.js.
   Look taken from the Bayon temple reliefs: bare chests, sampot wraps, topknots, spears and tall shields.
   kinds: villager, sword, spear, archer; plus ballistaElephantSprite() and khmerCanoeSprite(). */
const KHC = { name: 'Khmer', main: '#3a5fc8', dark: '#25408c', trim: '#cfc6b0', ring: '#8fb0ff' };
const STONE = '#b8ab92', STONE_D = '#8c8170';

function drawKhmerUnit(P, kind, anim, f, tool) {
  const C = KHC, r = P.r, vil = kind === 'villager';
  const walk = anim === 'walk', atk = anim === 'attack';
  const bob = (walk && (f === 1 || f === 3)) ? -1 : 0;
  const B = (x, y, w, h, c) => r(x, y + 2 + bob, w, h, c);
  const S = (x, y, w, h, c) => r(x, y + 2, w, h, c);
  for (const l of LEGS[walk ? f : 1]) { S(l[0], l[1], l[2], l[3], SKIN_D); S(l[0], l[1] + l[3] - 1, l[2], 1, '#2b1d12'); }
  if (kind === 'archer') { B(3, 5, 2, 6, WOOD_D); B(3, 4, 1, 1, '#f4ecd4'); B(4, 4, 1, 1, C.main); }

  // bare chest and a sampot wrap; soldiers wear a stone-coloured cross strap
  B(5, 7, 6, 3, SKIN); B(5, 9, 6, 1, SKIN_D);
  if (vil) { B(5, 10, 6, 2, '#6a5a48'); B(5, 7, 6, 1, '#c0392b'); B(6, 7, 1, 1, '#f4ecd4'); B(9, 7, 1, 1, '#f4ecd4'); }   // red-and-white krama over the shoulders
  else { B(5, 10, 6, 2, C.main); B(5, 10, 6, 1, STONE); B(7, 11, 2, 1, C.dark); B(6, 7, 1, 1, STONE); B(7, 8, 1, 1, STONE); B(8, 9, 1, 1, STONE); }
  B(4, 8, 1, 3, SKIN);
  if (atk && f === 1 && kind === 'sword') B(11, 8, 3, 1, SKIN); else B(11, 8, 1, 3, SKIN);

  // head: soldiers wear the hair in a tall bound topknot; villagers have short hair
  B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR); B(6, 6, 1, 1, GOLD);   // earring
  if (vil) { B(6, 2, 4, 1, HAIR); B(5, 3, 1, 2, HAIR); }
  else { B(6, 2, 4, 1, HAIR); B(7, 0, 2, 2, HAIR); B(7, -1, 2, 1, STONE); B(5, 3, 6, 1, C.main); }

  if (kind === 'sword') {
    // straight sword and a small round shield
    disc({ r: B }, 4, 10, 2, STONE_D); B(4, 10, 1, 1, C.main); B(3, 9, 1, 1, STONE);
    if (atk && f === 1) { B(14, 8, 2, 1, STEEL); }
    else { B(12, 3, 1, 6, STEEL); B(12, 2, 1, 1, STEEL_D); B(11, 9, 3, 1, GOLD_D); }
  } else if (kind === 'spear') {
    // long spear and a tall shield, the most common soldier on the Bayon walls
    B(2, 6, 3, 8, STONE_D); B(2, 6, 3, 1, STONE); B(3, 7, 1, 6, C.main); B(2, 13, 3, 1, STONE);
    if (!atk || f === 2) { S(12, 0, 1, 16, WOOD); S(12, -1, 1, 2, STEEL); S(11, 2, 1, 1, C.main); }
    else if (f === 0) { B(6, 9, 8, 1, WOOD); B(14, 9, 1, 1, STEEL); }
    else { B(8, 9, 7, 1, WOOD); B(15, 9, 1, 1, STEEL); }
  } else if (kind === 'archer') {
    B(13, 4, 1, 1, WOOD); B(14, 5, 1, 8, WOOD); B(13, 13, 1, 1, WOOD);
    if (atk && f === 0) { B(9, 9, 5, 1, WOOD); B(13, 5, 1, 8, '#d8d0b0'); B(14, 9, 1, 1, STEEL); } else B(13, 5, 1, 8, '#d8d0b0');
  } else if (vil && anim === 'work') {
    // villager at work: the tool swings up (frame 0) and down (frame 1), as in the other civs
    if (tool === 'axe') { if (f === 0) { B(12, 2, 1, 7, WOOD); B(12, 1, 3, 2, STEEL); } else { B(12, 9, 3, 1, WOOD); B(14, 8, 2, 3, STEEL); } }
    else if (tool === 'pick') { if (f === 0) { B(12, 2, 1, 7, WOOD); B(10, 1, 5, 1, STEEL_D); } else { B(12, 9, 3, 1, WOOD); B(14, 7, 1, 5, STEEL_D); } }
    else if (tool === 'hoe') { if (f === 0) { B(12, 3, 1, 7, WOOD); B(12, 2, 3, 1, STEEL_D); } else { B(12, 8, 3, 1, WOOD); B(14, 9, 1, 3, STEEL_D); } }
    else if (tool === 'hammer') { if (f === 0) { B(12, 3, 1, 6, WOOD); B(11, 1, 4, 2, STEEL_D); } else { B(12, 9, 3, 1, WOOD); B(14, 8, 2, 3, STEEL_D); } }
    else { if (f === 0) B(11, 6, 1, 3, SKIN); else B(11, 9, 2, 2, SKIN); }
  }
}
function khmerUnitSprite(kind, anim, f, tool) {
  return sprite(`km|${kind}|${anim}|${f}|${tool || ''}`, 16, 18, 2, (P) => drawKhmerUnit(P, kind, anim, f, tool));
}

// Ballista Elephant: elephant with a large double-bow crossbow on its back, crewed by two. 28x26 logical.
function ballistaElephantSprite(anim, f) {
  const C = KHC;
  return sprite(`kmel|${anim}|${f}`, 28, 26, 2, (P) => {
    const r = P.r, GREY = '#8c8a8f', GREY_D = '#6b696e', GREY_L = '#a9a7ab';
    const walk = anim === 'walk', atk = anim === 'attack', step = walk ? (f & 1) : 0;
    for (const [x, ph] of [[5, 0], [9, 1], [16, 0], [20, 1]]) { const h = (walk && ph === step) ? 4 : 5; r(x, 21 - (5 - h), 3, h, GREY_D); r(x, 25 - (5 - h), 3, 1, '#4a4850'); }
    r(4, 12, 19, 9, GREY); r(5, 11, 17, 1, GREY); r(4, 19, 19, 2, GREY_D); r(6, 13, 4, 1, GREY_L);
    r(8, 12, 11, 5, C.main); r(8, 12, 11, 1, STONE); r(8, 16, 11, 1, STONE);
    r(21, 9, 5, 7, GREY); r(20, 10, 2, 5, GREY_D); r(24, 11, 1, 1, '#1e1a18');
    r(25, 15, 2, 4, GREY); r(26, 19, 1, 2, GREY); r(24, 16, 3, 1, '#f4ecd4'); r(27, 15, 1, 1, '#f4ecd4');
    r(22, 8, 3, 1, STONE);
    // flat platform with the double-bow ballista pointing forward
    r(7, 10, 13, 2, WOOD); r(7, 10, 13, 1, '#a8773c');
    r(10, 8, 11, 1, WOOD_D);                                            // stock
    r(19, 4, 1, 4, WOOD); r(19, 9, 1, 3, WOOD); r(20, 3, 1, 1, WOOD); r(20, 12, 1, 1, WOOD);   // front bow
    r(16, 5, 1, 2, WOOD); r(16, 9, 1, 2, WOOD);                         // rear bow
    if (atk && f === 0) { r(18, 8, 1, 1, '#d8d0b0'); } else { r(18, 4, 1, 8, '#d8d0b0'); }
    if (!(atk && f === 1)) { r(13, 8, 9, 1, '#d8d0b0'); r(22, 8, 1, 1, STEEL); }  // bolt loaded
    else { r(24, 7, 4, 1, '#d8d0b0'); r(27, 7, 1, 1, STEEL); }          // bolt flying
    // crew: gunner behind the ballista, mahout on the neck
    r(9, 6, 2, 2, SKIN); r(9, 5, 2, 1, HAIR); r(9, 4, 1, 1, HAIR);
    r(21, 6, 2, 3, SKIN); r(21, 5, 2, 1, HAIR); r(21, 9, 2, 1, C.main);
  });
}

// River war canoe from the Bayon naval relief: long, low, many paddlers, a carved prow. 32x18 logical.
function khmerCanoeSprite() {
  return sprite('kmcanoe', 32, 18, 2, (P) => {
    const r = P.r;
    for (const x of [7, 11, 15, 19, 23]) { r(x, 8, 2, 1, HAIR); r(x, 9, 2, 2, SKIN); r(x + 1, 11, 1, 1, WOOD); r(x + 2, 12, 1, 3, WOOD); }   // paddlers
    r(4, 6, 1, 4, WOOD_D); r(3, 6, 3, 1, KHC.main);                    // steersman's post with a pennant
    hull({ r }, 3, 28, 11, 3, KHC);
    r(29, 6, 1, 5, STONE); r(30, 5, 1, 2, STONE); r(28, 5, 2, 1, STONE_D);   // carved prow
    r(5, 12, 22, 1, STONE);
  });
}

/* Naval roster sprites for Ayutthaya, Dai Viet and Khmer, same slots as ships.js.
   Needs ships.js (hull, mast, flag, oars, crew, tanja, colours), civs-ayutthaya-daiviet.js (CIVC)
   and civs-khmer.js (KHC, STONE). All ships face right.
   mainlandShip(civ, kind): civ 'ayu' | 'dv' | 'km', kind fishing | trade | light | galley | frigate | flagship. */
const MAIN_NAMES = {
  ayu: { fishing: 'Ruea Pramong', trade: 'Samphao', light: 'Ruea Chai', galley: 'Ruea Rop', frigate: 'Samphao Rop', flagship: 'Suphannahong' },
  dv: { fishing: 'Thuyen Thung', trade: 'Mong Dong', light: 'Khinh Thuyen', galley: 'Thuyen Chien', frigate: 'Lau Thuyen', flagship: 'Long Thuyen' },
  km: { fishing: 'Touk', trade: 'Touk Ngo', light: 'River Skiff', galley: 'Bayon Galley', frigate: 'Ballista Barge', flagship: 'Naga Barge' }
};
const MAIN_CLASS = {
  ayu: { fishing: 'Fishing Boat', trade: 'Trade Junk', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' },
  dv: { fishing: 'Fishing Boat', trade: 'Armoured Gunboat', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' },
  km: { fishing: 'Fishing Boat', trade: 'War Canoe', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' }
};
const JUNK = '#b0563a', JUNK_D = '#8a3f2a', DVSAIL = '#c98a3a', DVSAIL_D = '#a06a26';

// Battened junk sail: a tall rectangle with battens and a rounded top-front corner.
function junk(P, x, y, w, h, col, colD) {
  for (let i = 0; i < h; i++) { const cut = i < 2 ? 2 - i : 0; P.r(x, y + i, w - cut, 1, (i % 3 === 2) ? colD : col); }
  P.r(x - 1, y + h, w + 1, 1, WOOD_D);
}
// Tall curving prow (Thai and Khmer barges).
function prow(P, x, y, h, col, colD) { P.r(x, y + 2, 1, h - 2, col); P.r(x + 1, y + 1, 1, 2, col); P.r(x + 1, y, 2, 1, colD); P.r(x - 1, y + h - 1, 1, 1, colD); }
// Painted bow eye, the mark of Vietnamese boats.
function eye(P, x, y) { P.r(x, y, 2, 1, '#f4ecd4'); P.r(x + 1, y, 1, 1, '#1e1a18'); }
// Pavilion with a tiered pointed roof.
function pavilion(P, x, y, w, h, roof, roofD, wall) {
  P.r(x, y, w, h, wall); for (let i = 0; i < 3; i++) P.r(x - 1 + i, y - 1 - i, w + 2 - i * 2, 1, i & 1 ? roofD : roof);
  P.r(x + (w >> 1), y - 5, 1, 2, GOLD);
}

function mainlandShip(civ, kind) {
  const T = civ === 'km' ? KHC : CIVC[civ];
  const d = (civ === 'dv' && kind === 'fishing') ? [20, 18] : (civ === 'km' && kind === 'trade') ? [32, 18] : NAVAL_DIMS[kind];
  return sprite('ml|' + civ + '|' + kind, d[0], d[1], 2, (P) => {
    const r = P.r;
    if (civ === 'ayu') {
      if (kind === 'fishing') {
        // small canoe with a square mat lug sail
        mast(P, 11, 3, 13); r(7, 4, 8, 8, MAT); r(7, 7, 8, 1, MAT_D); r(7, 10, 8, 1, MAT_D); r(6, 3, 10, 1, WOOD_D);
        crew(P, 4, 9, '#d9b45a', T.main); hull(P, 3, 17, 13, 3, T);
      } else if (kind === 'trade') {
        // samphao: Siamese trading junk, high stern, red battened sails
        mast(P, 15, 2, 20); mast(P, 25, 6, 20); junk(P, 10, 3, 10, 14, JUNK, JUNK_D); junk(P, 22, 7, 8, 10, JUNK, JUNK_D);
        r(3, 14, 7, 5, WOOD); r(3, 13, 7, 1, T.main); flag(P, 16, 0, T.main, GOLD);
        hull(P, 3, 32, 19, 6, T);
      } else if (kind === 'light') {
        // ruea chai: slim war barge, tall prow, small canopy, many paddles
        prow(P, 26, 6, 10, GOLD, GOLD_D); pavilion(P, 8, 11, 6, 4, T.main, T.dark, WOOD);
        hull(P, 3, 26, 15, 3, T); oars(P, [9, 14, 19, 24], 18, 4);
      } else if (kind === 'galley') {
        // ruea rop: long troop barge, pavilion amidships, tall prow
        prow(P, 34, 9, 12, GOLD, GOLD_D); pavilion(P, 13, 12, 10, 6, T.main, T.dark, WOOD); r(4, 13, 1, 5, WOOD_D); flag(P, 5, 12, T.main, GOLD);
        hull(P, 3, 34, 18, 5, T); oars(P, [9, 14, 19, 24, 29], 23, 4);
      } else if (kind === 'frigate') {
        // samphao rop: big armed junk, three red battened sails, gunports
        mast(P, 12, 4, 24); mast(P, 22, 1, 24); mast(P, 32, 5, 24);
        junk(P, 7, 6, 9, 13, JUNK, JUNK_D); junk(P, 17, 2, 11, 17, JUNK, JUNK_D); junk(P, 29, 7, 8, 12, JUNK, JUNK_D);
        r(3, 18, 7, 6, WOOD); r(3, 17, 7, 1, T.main); flag(P, 23, -1, T.main, GOLD);
        hull(P, 3, 40, 24, 8, T, true);
      } else {
        // suphannahong: golden royal swan barge, tiered pavilion, rows of oars
        r(48, 12, 2, 16, GOLD); r(49, 9, 2, 4, GOLD); r(50, 8, 3, 2, GOLD); r(52, 9, 1, 1, '#c0392b'); r(47, 22, 1, 6, GOLD_D);   // swan neck and head
        r(4, 20, 2, 8, GOLD); r(3, 18, 2, 3, GOLD);                                                                               // tail
        pavilion(P, 22, 20, 12, 7, GOLD, GOLD_D, T.main); r(24, 22, 2, 3, T.dark); r(30, 22, 2, 3, T.dark);
        for (let x = 10; x < 46; x += 3) r(x, 27, 1, 1, '#c0392b');
        hull(P, 4, 47, 28, 7, { main: GOLD, trim: GOLD }); r(6, 30, 38, 1, T.main);
        oars(P, [10, 15, 20, 25, 30, 35, 40], 35, 5);
      }
    } else if (civ === 'dv') {
      if (kind === 'fishing') {
        // thuyen thung: round woven basket boat with one rower
        r(4, 11, 12, 4, '#a8803c'); r(3, 12, 14, 2, '#a8803c'); r(5, 15, 10, 1, '#7a5a2a'); for (let x = 4; x < 16; x += 2) r(x, 12, 1, 1, '#8a6a32');
        r(9, 7, 2, 1, '#efe0b0'); r(8, 8, 4, 1, '#efe0b0'); r(9, 9, 2, 2, SKIN); r(11, 8, 1, 7, WOOD); r(12, 14, 1, 2, WOOD_D);
      } else if (kind === 'trade') {
        // mong dong: armoured gunboat, a covered deck with a bow cannon and one junk sail
        mast(P, 18, 3, 19); junk(P, 13, 4, 9, 11, DVSAIL, DVSAIL_D);
        r(5, 15, 24, 4, '#5e3b1c'); r(5, 15, 24, 1, '#3a2a1c'); for (let x = 7; x < 28; x += 4) r(x, 17, 2, 1, '#2a1a10');
        r(29, 16, 4, 2, IRON); r(29, 16, 4, 1, IRON_L); flag(P, 19, 1, T.trim, T.main);
        hull(P, 3, 32, 19, 6, T); eye(P, 29, 21);
      } else if (kind === 'light') {
        // khinh thuyen: small fast boat, one junk sail, oars
        mast(P, 14, 2, 15); junk(P, 10, 3, 8, 11, DVSAIL, DVSAIL_D);
        hull(P, 3, 26, 15, 4, T); eye(P, 23, 16); oars(P, [9, 15, 21], 19, 4);
      } else if (kind === 'galley') {
        // thuyen chien: oared war galley with two junk sails and a painted eye
        mast(P, 13, 3, 18); mast(P, 24, 6, 18); junk(P, 9, 4, 8, 12, DVSAIL, DVSAIL_D); junk(P, 21, 7, 7, 9, DVSAIL, DVSAIL_D);
        r(3, 14, 6, 4, WOOD); r(3, 13, 6, 1, T.trim); flag(P, 14, 1, T.trim, T.main);
        hull(P, 3, 34, 18, 6, T); eye(P, 30, 19); oars(P, [10, 15, 20, 25, 30], 24, 4);
      } else if (kind === 'frigate') {
        // lau thuyen: tower ship, two-storey castle and two junk sails, gun row
        mast(P, 26, 2, 24); mast(P, 36, 7, 24); junk(P, 21, 3, 10, 16, DVSAIL, DVSAIL_D); junk(P, 32, 8, 8, 11, DVSAIL, DVSAIL_D);
        r(5, 15, 13, 9, WOOD); r(6, 10, 11, 5, WOOD); r(4, 14, 15, 1, T.trim); r(5, 9, 13, 1, T.trim); r(8, 12, 2, 2, PORT); r(13, 12, 2, 2, PORT); r(8, 18, 2, 2, PORT); r(13, 18, 2, 2, PORT);
        flag(P, 27, 0, T.trim, T.main);
        hull(P, 3, 40, 24, 8, T, true); eye(P, 37, 25);
      } else {
        // long thuyen: imperial dragon ship, red and gold, dragon prow and tail, gun row
        mast(P, 20, 3, 28); mast(P, 33, 6, 28); junk(P, 15, 4, 11, 18, DVSAIL, DVSAIL_D); junk(P, 29, 7, 9, 14, DVSAIL, DVSAIL_D);
        r(49, 18, 2, 10, T.trim); r(50, 15, 3, 4, T.trim); r(52, 16, 2, 1, GOLD); r(51, 15, 1, 1, '#1e1a18'); r(49, 14, 2, 1, GOLD);   // dragon head
        r(3, 19, 2, 9, T.trim); r(2, 17, 2, 3, GOLD);                                                                                  // tail
        r(7, 21, 9, 7, WOOD); r(6, 20, 11, 1, GOLD); r(9, 23, 2, 2, PORT); r(13, 23, 2, 2, PORT);
        flag(P, 21, 1, T.trim, GOLD); flag(P, 34, 4, T.trim, GOLD);
        hull(P, 4, 48, 28, 10, { main: T.trim, trim: GOLD }, true); r(6, 30, 40, 1, GOLD);
      }
    } else {
      if (kind === 'fishing') {
        // touk: dugout canoe, a paddler under a krama
        r(9, 8, 2, 1, '#c0392b'); r(9, 9, 2, 2, SKIN); r(9, 11, 2, 1, T.main); r(12, 9, 1, 5, WOOD); r(13, 14, 1, 2, WOOD_D);
        hull(P, 3, 18, 13, 3, T);
      } else if (kind === 'trade') {
        // touk ngo: long war canoe with many paddlers and a carved prow (Bayon naval relief)
        for (const x of [7, 11, 15, 19, 23]) { r(x, 8, 2, 1, HAIR); r(x, 9, 2, 2, SKIN); r(x + 1, 11, 1, 1, WOOD); r(x + 2, 12, 1, 3, WOOD); }
        r(4, 6, 1, 4, WOOD_D); r(3, 6, 3, 1, T.main);
        hull(P, 3, 28, 11, 3, T); r(29, 6, 1, 5, STONE); r(30, 5, 1, 2, STONE); r(28, 5, 2, 1, STONE_D); r(5, 12, 22, 1, STONE);
      } else if (kind === 'light') {
        // river skiff: small canoe, one archer, a small mat sail
        mast(P, 15, 4, 15); r(11, 5, 7, 7, MAT); r(11, 8, 7, 1, MAT_D); r(10, 4, 9, 1, WOOD_D);
        r(6, 10, 2, 1, HAIR); r(6, 11, 2, 2, SKIN); r(8, 10, 1, 4, WOOD);
        hull(P, 3, 26, 15, 3, T); prow(P, 27, 9, 7, STONE, STONE_D);
      } else if (kind === 'galley') {
        // bayon galley: long oared galley, warriors under a canopy, carved prow
        r(10, 12, 18, 1, T.main); r(10, 13, 1, 5, WOOD_D); r(27, 13, 1, 5, WOOD_D);
        for (const x of [13, 17, 21, 24]) { r(x, 14, 2, 1, HAIR); r(x, 15, 2, 3, SKIN); }
        hull(P, 3, 34, 18, 5, T); prow(P, 35, 10, 10, STONE, STONE_D); r(5, 19, 28, 1, STONE);
        oars(P, [9, 14, 19, 24, 29], 23, 4);
      } else if (kind === 'frigate') {
        // ballista barge: broad barge with a big double-bow ballista and a mat sail
        mast(P, 12, 3, 24); r(7, 4, 10, 12, MAT); r(7, 8, 10, 1, MAT_D); r(7, 12, 10, 1, MAT_D); r(6, 3, 12, 1, WOOD_D);
        r(22, 21, 14, 3, WOOD); r(22, 21, 14, 1, '#a8773c');
        r(24, 19, 12, 1, WOOD_D); r(34, 14, 1, 5, WOOD); r(34, 20, 1, 3, WOOD); r(31, 16, 1, 2, WOOD); r(31, 20, 1, 2, WOOD); r(26, 19, 10, 1, '#d8d0b0'); r(36, 19, 1, 1, STEEL);
        r(24, 17, 2, 2, SKIN); r(24, 16, 2, 1, HAIR);
        hull(P, 3, 40, 24, 7, T); prow(P, 41, 16, 9, STONE, STONE_D);
      } else {
        // naga barge: royal barge with a five-headed naga prow and a tiered pavilion
        pavilion(P, 20, 20, 14, 7, T.main, T.dark, STONE); r(23, 22, 2, 3, T.dark); r(30, 22, 2, 3, T.dark);
        r(47, 16, 2, 12, STONE); for (const [dx, dy] of [[0, 0], [2, 1], [4, 3], [-2, 1], [-1, 3]]) r(48 + dx, 12 + dy, 2, 2, STONE); r(49, 12, 1, 1, '#1e1a18');   // naga heads
        r(4, 20, 2, 8, STONE); r(3, 18, 2, 3, STONE_D);
        hull(P, 4, 47, 28, 8, T); r(6, 30, 38, 1, STONE);
        oars(P, [10, 15, 20, 25, 30, 35, 40], 36, 5);
      }
    }
  });
}

/* Building mockups for Ayutthaya, Dai Viet and Khmer.
   Common buildings (town centre, house, barracks, port, farm) reuse buildingSprite() with each civ's
   roof colours via civTeam(); the signature buildings are drawn here.
   Needs art.js helpers, GOLD from drawUnit.js, CIVC (civs-ayutthaya-daiviet.js), KHC/STONE (civs-khmer.js)
   and brick()/weave()/sacks() from the Melaka/Majapahit building files.
   mainlandBuilding(civ, kind): civ ayu | dv | km, kind granary | tower | palace | trade */

// Team slots 3-5 for the mockups: roofA/roofB are the roof tones, roofR the eave edge.
const CIV_TEAM = { ayu: 3, dv: 5, km: 4 };
// local copy so the art's own team slots never change the game's colours (Khmer = 4, Dai Viet = 5 here)
const KTEAMC = TEAMC.slice();
KTEAMC[4] = { name: 'Khmer', main: '#3a5fc8', dark: '#25408c', trim: '#cfc6b0', roofA: '#b8ab92', roofB: '#9c8f78', roofR: '#6e6454', ring: '#8fb0ff' };
KTEAMC[5] = { name: 'Dai Viet', main: '#e0b52c', dark: '#9a6e12', trim: '#c0392b', roofA: '#6f7f6a', roofB: '#55645a', roofR: '#3a4038', ring: '#ffe08a' };
function civTeam(civ) { return CIV_TEAM[civ]; }

const MLB_DIMS = { granary: [32, 50], tower: [32, 64], palace: [64, 80], trade: [48, 54] };
const WHITE_W = '#ece6d6', WHITE_D = '#c9c1ac', TILE_G = '#3f8a5a', TILE_O = '#d0702e';

// Thai roof: steep layered gable with chofa horns at the ridge ends
function thaiRoof(P, cx, y0, y1, hw0, hw1, cA, cB) {
  for (let y = y0; y <= y1; y++) { const t = (y - y0) / Math.max(1, y1 - y0), hw = Math.round(hw0 + (hw1 - hw0) * t); P.r(cx - hw, y, hw * 2, 1, ((y - y0) % 4 < 2) ? cA : cB); }
  P.r(cx - hw1 - 1, y1, 2, 1, GOLD); P.r(cx + hw1 - 1, y1, 2, 1, GOLD); P.r(cx - hw1 - 2, y1 - 1, 1, 1, GOLD); P.r(cx + hw1 + 1, y1 - 1, 1, 1, GOLD);
  P.r(cx - hw0 - 1, y0 - 2, 1, 2, GOLD); P.r(cx + hw0, y0 - 2, 1, 2, GOLD);
}
// Vietnamese roof: low tiled hip roof with upturned corners
function vietRoof(P, cx, y, w, h, cA, cB) {
  for (let i = 0; i < h; i++) P.r(cx - (w >> 1) + (h - i), y + i, w - (h - i) * 2, 1, i % 2 ? cB : cA);
  P.r(cx - (w >> 1) - 1, y + h - 2, 2, 1, cA); P.r(cx + (w >> 1) - 1, y + h - 2, 2, 1, cA);
  P.r(cx - (w >> 1) - 2, y + h - 3, 1, 1, cA); P.r(cx + (w >> 1) + 1, y + h - 3, 1, 1, cA);
  P.r(cx - (w >> 1) + h, y - 1, w - h * 2, 1, '#2b2622');
}
// Khmer prasat tower: stepped sandstone tower with a lotus-bud top
function prasat(P, cx, yBase, h, w) {
  for (let i = 0; i < h; i++) { const t = i / h, ww = Math.max(2, Math.round(w * (1 - t * 0.75) - (i % 4 === 0 ? 0 : 1))); P.r(cx - (ww >> 1), yBase - i, ww, 1, (i % 4 === 0) ? STONE_D : STONE); }
  P.r(cx - 1, yBase - h - 2, 2, 3, STONE); P.r(cx, yBase - h - 3, 1, 1, GOLD);
}

function mainlandBuilding(civ, kind) {
  const T = KTEAMC[CIV_TEAM[civ]], d = MLB_DIMS[kind];
  return sprite(`mlb|${civ}|${kind}`, d[0], d[1], 2, (P) => {
    const r = P.r;
    if (civ === 'ayu') {
      if (kind === 'granary') {
        // yung khao: raised teak rice barn, steep Thai roof
        posts(P, [5, 12, 19, 25], 34, 48, 2); r(3, 32, 26, 2, '#8f6232');
        planks(P, 5, 20, 22, 12, '#9a6a3a', '#7a5028'); r(13, 23, 6, 9, '#3f2713');
        thaiRoof(P, 16, 6, 20, 3, 14, T.roofA, T.roofB); r(2, 20, 28, 1, T.main);
        sacks(P, 2, 45, 2);
      } else if (kind === 'tower') {
        // whitewashed brick fort tower with crenels
        r(7, 22, 18, 40, WHITE_W); for (let y = 26; y < 60; y += 6) r(7, y, 18, 1, WHITE_D); r(13, 50, 6, 12, '#3f2713');
        r(5, 18, 22, 4, WHITE_W); for (let x = 5; x < 27; x += 4) r(x, 15, 2, 3, WHITE_W); r(5, 21, 22, 1, WHITE_D);
        r(14, 9, 3, 6, SKIN); r(14, 8, 3, 1, T.main); r(18, 8, 1, 7, WOOD);
        r(16, 0, 1, 8, WOOD_D); r(17, 0, 5, 3, T.main); r(17, 0, 5, 1, GOLD);
      } else if (kind === 'palace') {
        // Wang: royal hall with stacked Thai roofs beside a white bell-shaped chedi
        r(2, 62, 60, 4, WHITE_W); r(2, 66, 60, 2, WHITE_D);
        r(8, 46, 34, 16, WHITE_W); for (const x of [11, 18, 25, 32, 38]) r(x, 48, 3, 12, '#3f2713'); r(8, 46, 34, 1, GOLD);
        thaiRoof(P, 25, 32, 46, 6, 19, T.roofA, T.roofB); thaiRoof(P, 25, 20, 32, 3, 12, T.roofA, T.roofB); r(24, 12, 2, 8, GOLD);
        // chedi
        r(46, 54, 14, 8, WHITE_W); r(47, 48, 12, 6, WHITE_W); disc(P, 53, 42, 6, WHITE_W); r(51, 30, 4, 8, WHITE_W); r(52, 22, 2, 8, WHITE_D); r(52, 20, 2, 2, GOLD);
        r(46, 54, 14, 1, WHITE_D); r(47, 48, 12, 1, WHITE_D);
      } else {
        // trading post: teak warehouse on a pier with a Thai roof
        r(0, 40, 48, 12, '#a47a45'); for (let x = 0; x < 48; x += 4) r(x, 40, 1, 12, '#7d5b30'); posts(P, [1, 12, 24, 36, 46], 48, 53, 2);
        planks(P, 4, 26, 26, 14, '#9a6a3a', '#7a5028'); r(11, 29, 12, 11, '#3f2713'); thaiRoof(P, 17, 12, 26, 3, 15, T.roofA, T.roofB);
        sacks(P, 33, 37, 3); r(42, 8, 1, 22, WOOD_D); r(43, 9, 5, 4, T.main);
      }
    } else if (civ === 'dv') {
      if (kind === 'granary') {
        // tiled granary on a brick plinth
        brick(P, 3, 40, 26, 8); r(6, 26, 20, 14, '#b8a080'); r(13, 30, 6, 10, '#3f2713'); for (let y = 28; y < 40; y += 4) r(6, y, 20, 1, '#9c8668');
        vietRoof(P, 16, 16, 30, 10, T.roofA, T.roofB); r(1, 26, 30, 1, T.main);
        sacks(P, 1, 45, 1);
      } else if (kind === 'tower') {
        // brick watchtower with a small curved tile roof
        brick(P, 8, 24, 16, 38); r(13, 50, 6, 12, '#2b1a0c'); r(12, 49, 8, 1, T.trim);
        r(6, 20, 20, 4, '#6b4a2a'); r(14, 13, 3, 7, SKIN); r(14, 12, 3, 1, '#2b2622'); r(18, 13, 4, 1, WOOD);
        vietRoof(P, 16, 6, 28, 8, T.roofA, T.roofB); r(16, 0, 1, 5, WOOD_D); r(17, 0, 5, 3, T.main); r(17, 0, 5, 1, T.trim);
      } else if (kind === 'palace') {
        // citadel gate: thick brick gate with three arches and a two-tier pavilion on top
        brick(P, 2, 48, 60, 26); r(2, 48, 60, 1, BRICK_L);
        for (const [x, w] of [[12, 8], [28, 8], [44, 8]]) { r(x, 60, w, 14, '#2b1a0c'); r(x + 1, 58, w - 2, 2, '#2b1a0c'); }
        r(10, 38, 44, 10, '#a8452f'); for (const x of [12, 20, 28, 36, 44, 51]) r(x, 38, 2, 10, '#5a2a1e');
        vietRoof(P, 32, 28, 52, 10, T.roofA, T.roofB);
        r(18, 22, 28, 6, '#a8452f'); vietRoof(P, 32, 12, 38, 10, T.roofA, T.roofB); r(31, 7, 2, 5, GOLD);
        for (const x of [4, 57]) { r(x, 20, 1, 28, WOOD_D); r(x + 1, 21, 5, 4, T.main); r(x + 1, 21, 5, 1, T.trim); }
      } else {
        r(0, 40, 48, 12, '#a47a45'); for (let x = 0; x < 48; x += 4) r(x, 40, 1, 12, '#7d5b30'); posts(P, [1, 12, 24, 36, 46], 48, 53, 2);
        r(4, 28, 26, 12, '#b8a080'); r(12, 31, 10, 9, '#3f2713'); vietRoof(P, 17, 18, 34, 10, T.roofA, T.roofB);
        sacks(P, 33, 37, 3); r(42, 8, 1, 22, WOOD_D); r(43, 9, 5, 4, T.main); r(43, 9, 5, 1, T.trim);
      }
    } else {
      if (kind === 'granary') {
        // palm-thatch stilt barn
        posts(P, [5, 12, 19, 25], 34, 48, 2); r(3, 32, 26, 2, '#8f6232');
        weave(P, 6, 22, 20, 10); r(13, 25, 6, 7, '#3f2713');
        roofGable(P, 16, 6, 22, 3, 15, '#a89060', '#8a7448', '#5e5038'); r(2, 22, 28, 1, T.main);
        sacks(P, 2, 45, 2);
      } else if (kind === 'tower') {
        // sandstone gate tower (gopura) with a carved face band
        r(7, 30, 18, 32, STONE); for (let y = 34; y < 60; y += 5) r(7, y, 18, 1, STONE_D); r(13, 48, 6, 14, '#2b1a0c');
        r(11, 36, 10, 6, STONE_D); r(13, 38, 2, 1, '#2b2622'); r(17, 38, 2, 1, '#2b2622'); r(14, 40, 4, 1, '#2b2622');   // face of the Bayon
        prasat(P, 16, 30, 20, 16); r(14, 20, 3, 5, SKIN);
      } else if (kind === 'palace') {
        // prasat: temple-mountain on stepped terraces, five towers in a quincunx
        for (let i = 0; i < 4; i++) r(4 + i * 4, 70 - i * 6, 56 - i * 8, 6, i % 2 ? STONE_D : STONE);
        r(28, 52, 8, 24, STONE_D); for (let y = 54; y < 76; y += 3) r(28, y, 8, 1, STONE);   // central stair
        prasat(P, 12, 52, 16, 10); prasat(P, 52, 52, 16, 10); prasat(P, 20, 46, 20, 12); prasat(P, 44, 46, 20, 12);
        prasat(P, 32, 46, 34, 18);
        r(30, 34, 4, 3, '#2b2622');
        for (const x of [2, 59]) { r(x, 30, 1, 28, WOOD_D); r(x + 1, 31, 4, 6, T.main); }
      } else {
        r(0, 40, 48, 12, '#a47a45'); for (let x = 0; x < 48; x += 4) r(x, 40, 1, 12, '#7d5b30'); posts(P, [1, 12, 24, 36, 46], 48, 53, 2);
        weave(P, 4, 28, 26, 12); r(12, 31, 10, 9, '#3f2713'); roofGable(P, 17, 14, 28, 3, 15, '#a89060', '#8a7448', '#5e5038');
        sacks(P, 33, 37, 3); r(42, 8, 1, 22, WOOD_D); r(43, 9, 5, 4, T.main);
      }
    }
  });
}

/* ---------- common buildings in each civ's own style ----------
   mainlandBase(civ, kind): kind towncentre | house | barracks | port, same canvas sizes as buildingSprite(). */
const MLBASE_DIMS = { towncentre: [48, 62], house: [32, 46], barracks: [48, 58], port: [48, 54] };
function pier(P) { P.r(0, 40, 48, 12, '#a47a45'); for (let x = 0; x < 48; x += 4) P.r(x, 40, 1, 12, '#7d5b30'); P.r(0, 40, 48, 1, '#c99b5d'); P.r(0, 51, 48, 1, '#5a3a1e'); posts(P, [1, 14, 28, 44], 48, 53, 3); }
function rack(P, x, y) { for (let i = 0; i < 4; i++) { P.r(x + i * 3, y, 1, 10, '#8a5a2b'); P.r(x + i * 3, y - 1, 1, 1, STEEL); } P.r(x - 1, y + 4, 12, 1, WOOD_D); }

function mainlandBase(civ, kind) {
  const T = KTEAMC[CIV_TEAM[civ]], d = MLBASE_DIMS[kind];
  return sprite(`mlbase|${civ}|${kind}`, d[0], d[1], 2, (P) => {
    const r = P.r;
    if (civ === 'ayu') {
      // Ayutthaya: teak halls raised on white plinths, steep layered orange-and-green roofs with gold chofa
      if (kind === 'towncentre') {
        r(2, 50, 44, 8, WHITE_W); r(2, 57, 44, 2, WHITE_D); r(19, 58, 10, 4, WHITE_D);
        planks(P, 6, 34, 36, 16, '#9a6a3a', '#7a5028'); r(19, 38, 10, 12, '#3f2713'); r(18, 37, 12, 1, GOLD);
        for (const x of [9, 33]) r(x, 38, 5, 6, '#2b1a0c');
        thaiRoof(P, 24, 20, 34, 6, 22, T.roofA, T.roofB); thaiRoof(P, 24, 8, 20, 3, 13, T.roofA, T.roofB);
        r(23, 0, 2, 8, GOLD); r(25, 1, 8, 4, T.main); r(25, 1, 8, 1, GOLD);
      } else if (kind === 'house') {
        posts(P, [5, 12, 19, 25], 36, 45, 2); r(3, 34, 26, 2, '#8f6232');
        planks(P, 6, 24, 20, 10, '#9a6a3a', '#7a5028'); r(13, 26, 6, 8, '#3f2713');
        thaiRoof(P, 16, 6, 24, 2, 13, T.roofA, T.roofB);
      } else if (kind === 'barracks') {
        r(2, 48, 44, 6, WHITE_W); r(2, 53, 44, 2, WHITE_D);
        planks(P, 5, 32, 38, 16, '#9a6a3a', '#7a5028'); r(16, 36, 16, 12, '#2f1d0e'); rack(P, 18, 37);
        disc(P, 10, 40, 3, T.main); disc(P, 10, 40, 1, GOLD); disc(P, 38, 40, 3, T.main); disc(P, 38, 40, 1, GOLD);
        thaiRoof(P, 24, 14, 32, 6, 22, T.roofA, T.roofB); r(23, 4, 1, 10, WOOD_D); r(24, 4, 8, 4, T.main); r(24, 4, 8, 1, GOLD);
      } else {
        pier(P); planks(P, 4, 26, 24, 14, '#9a6a3a', '#7a5028'); r(11, 29, 8, 11, '#3f2713'); thaiRoof(P, 16, 12, 26, 3, 14, T.roofA, T.roofB);
        r(40, 14, 1, 26, WOOD_D); junk(P, 32, 16, 8, 14, JUNK, JUNK_D); r(41, 12, 5, 3, T.main);
        r(32, 34, 6, 5, '#a8773c');
      }
    } else if (civ === 'dv') {
      // Dai Viet: built on the ground, brick and lime walls, red columns, low grey tile roofs with upturned corners
      if (kind === 'towncentre') {
        brick(P, 2, 52, 44, 8); r(2, 52, 44, 1, BRICK_L);
        r(6, 36, 36, 16, '#d9ccb0'); for (const x of [6, 14, 22, 26, 34, 41]) r(x, 36, 1, 16, '#a8352a');
        r(19, 40, 10, 12, '#3f2713'); r(18, 39, 12, 1, T.trim); for (const x of [9, 33]) r(x, 40, 5, 6, '#2b1a0c');
        vietRoof(P, 24, 24, 48, 12, T.roofA, T.roofB); r(10, 22, 28, 2, '#d9ccb0'); vietRoof(P, 24, 12, 32, 10, T.roofA, T.roofB);
        r(22, 8, 4, 2, T.trim); r(23, 0, 1, 8, WOOD_D); r(24, 0, 8, 4, T.main); r(24, 0, 8, 1, T.trim);
      } else if (kind === 'house') {
        r(4, 42, 24, 3, '#8a7a60'); r(5, 28, 22, 14, '#c9b48a'); r(13, 32, 6, 10, '#3f2713'); r(7, 32, 4, 4, '#2b1a0c'); r(21, 32, 4, 4, '#2b1a0c');
        vietRoof(P, 16, 18, 30, 10, T.roofA, T.roofB);
      } else if (kind === 'barracks') {
        brick(P, 2, 50, 44, 6);
        r(5, 34, 38, 16, '#d9ccb0'); for (const x of [5, 13, 34, 42]) r(x, 34, 1, 16, '#a8352a'); r(16, 37, 16, 13, '#2f1d0e'); rack(P, 18, 38);
        vietRoof(P, 24, 22, 48, 12, T.roofA, T.roofB);
        for (const x of [3, 43]) { r(x, 6, 1, 28, WOOD_D); r(x + 1, 7, 4, 8, T.main); r(x + 1, 7, 4, 1, T.trim); }
      } else {
        pier(P); r(4, 28, 24, 12, '#d9ccb0'); r(11, 31, 8, 9, '#3f2713'); vietRoof(P, 16, 18, 30, 10, T.roofA, T.roofB);
        r(40, 14, 1, 26, WOOD_D); junk(P, 32, 16, 8, 14, DVSAIL, DVSAIL_D); r(41, 12, 5, 3, T.main);
        r(32, 34, 6, 5, '#a8773c'); eye(P, 34, 36);
      }
    } else {
      // Khmer: houses on tall stilts with woven walls and palm thatch; public buildings on sandstone bases with prasat finials
      const PA = '#a89060', PB = '#8a7448', PR = '#5e5038';
      if (kind === 'towncentre') {
        for (let i = 0; i < 2; i++) r(2 + i * 3, 52 + i * 4, 44 - i * 6, 4, i ? STONE_D : STONE); r(2, 60, 44, 2, STONE_D);
        posts(P, [7, 15, 33, 40], 40, 52, 2); r(5, 38, 38, 2, '#8f6232');
        weave(P, 8, 26, 32, 12); r(19, 29, 10, 9, '#3f2713'); r(18, 28, 12, 1, T.main);
        roofGable(P, 24, 8, 26, 4, 22, PA, PB, PR); r(2, 26, 44, 1, T.main);
        prasat(P, 24, 8, 6, 6);
        r(44, 6, 1, 30, WOOD_D); r(45, 7, 3, 6, T.main);
      } else if (kind === 'house') {
        posts(P, [5, 12, 19, 25], 32, 45, 2); r(3, 30, 26, 2, '#8f6232');
        weave(P, 6, 20, 20, 10); r(13, 22, 6, 8, '#3f2713');
        roofGable(P, 16, 6, 20, 2, 14, PA, PB, PR); r(23, 32, 1, 13, WOOD); r(26, 32, 1, 13, WOOD); for (let y = 34; y < 45; y += 3) r(23, y, 4, 1, WOOD);
      } else if (kind === 'barracks') {
        r(2, 46, 44, 10, STONE); for (let x = 2; x < 46; x += 6) r(x, 46, 1, 10, STONE_D); r(2, 46, 44, 1, '#cfc6b0'); r(19, 48, 10, 8, '#2b1a0c');
        posts(P, [8, 20, 28, 40], 30, 46, 2); weave(P, 9, 30, 30, 8); rack(P, 18, 33);
        roofGable(P, 24, 14, 30, 5, 22, PA, PB, PR); r(2, 30, 44, 1, T.main);
        r(4, 30, 3, 16, STONE_D); r(4, 31, 3, 1, T.main); r(41, 30, 3, 16, STONE_D);   // tall shields at the gate
      } else {
        pier(P); weave(P, 4, 28, 24, 12); r(11, 31, 8, 9, '#3f2713'); roofGable(P, 16, 14, 28, 3, 14, PA, PB, PR);
        r(32, 32, 14, 3, '#7a4a24'); r(44, 29, 1, 4, STONE); r(45, 28, 1, 2, STONE);   // a moored canoe
        r(40, 10, 1, 22, WOOD_D); r(41, 11, 4, 5, T.main);
      }
    }
  });
}

/* Khmer building art (post-Angkor Cambodia, 1400s-1500s). Same style as CIVB melakaBuilding/majapahitBuilding.
   Needs sprite(), planks(), posts(), WOOD/WOOD_D/CREAM and GOLD from the game (art.js / drawUnit.js).
   kmBuilding(kind): kind towncentre | house | tower | palisade | wall | gate | healer | palace | baray
   Team colour is blue (KMC). Lore: lore/buildings.md (Khmer), lore/khmer.md. */
const KMC = { main: '#2f6fd0', dark: '#1c4590', trim: '#f2c94c', ring: '#8ab8ff' };
const KM_DIMS = { towncentre: [48, 62], house: [32, 46], tower: [32, 64], palisade: [32, 30], wall: [32, 34], gate: [48, 48], healer: [48, 52], palace: [64, 78], baray: [64, 48] };
const KM_LAT = '#a0522d', KM_LAT_D = '#7a3c22', KM_LAT_L = '#b96a3e', KM_PIT = '#4e2414';
const KM_SAND = '#b8ad8f', KM_SAND_D = '#8f866c', KM_SAND_L = '#d4cbab', KM_SAND_S = '#6f6852';
const KM_TILE = '#b4583a', KM_TILE_D = '#8a3f27', KM_TILE_E = '#4a2416';
const KM_WATER = '#4ba3bf', KM_WATER_D = '#2c6f90', KM_WATER_L = '#9fd6e2';
const KM_GOLD = (typeof GOLD !== 'undefined') ? GOLD : '#e8b830';

// deterministic hash for pit/texture placement
function kmHash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
// laterite blocks: rusty orange-brown, staggered courses, dark pits
function kmLaterite(P, x, y, w, h) {
  P.r(x, y, w, h, KM_LAT);
  for (let j = 0; j < h; j++) {
    const row = Math.floor(j / 3), off = (row & 1) ? 3 : 0;
    if (j % 3 === 2) P.r(x, y + j, w, 1, KM_LAT_D);
    else for (let i = off; i < w; i += 6) P.r(x + i, y + j, 1, 1, KM_LAT_D);
  }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (j % 3 === 2) continue;
    const v = kmHash(x + i, y + j);
    if (v < 0.09) P.r(x + i, y + j, 1, 1, KM_PIT); else if (v > 0.95) P.r(x + i, y + j, 1, 1, KM_LAT_L);
  }
  P.r(x, y, w, 1, KM_LAT_L);
}
// sandstone: smooth grey-tan ashlar
function kmSand(P, x, y, w, h) {
  P.r(x, y, w, h, KM_SAND);
  for (let j = 0; j < h; j++) {
    const row = Math.floor(j / 3), off = (row & 1) ? 2 : 5;
    if (j % 3 === 2) P.r(x, y + j, w, 1, KM_SAND_D);
    else for (let i = off; i < w; i += 7) P.r(x + i, y + j, 1, 1, KM_SAND_D);
  }
  P.r(x, y, w, 1, KM_SAND_L);
}
// sandstone coping / cornice band
function kmCoping(P, x, y, w) { P.r(x - 1, y, w + 2, 2, KM_SAND); P.r(x - 1, y, w + 2, 1, KM_SAND_L); P.r(x, y + 2, w, 1, KM_SAND_S); }
// corncob prasat tower: a body with a false door, then stacked tiers tapering to a lotus bud
function kmPrasat(P, cx, yBase, w, bodyH, spireH, door) {
  const hw = w >> 1, yb = yBase - bodyH;
  kmSand(P, cx - hw, yb, w, bodyH);
  P.r(cx - hw, yb, 1, bodyH, KM_SAND_L); P.r(cx + hw - 1, yb, 1, bodyH, KM_SAND_D);
  P.r(cx - hw - 1, yBase - 2, w + 2, 2, KM_SAND_D); P.r(cx - hw - 1, yBase - 2, w + 2, 1, KM_SAND);   // plinth
  kmCoping(P, cx - hw, yb, w);
  if (door) {
    const dw = Math.max(2, (w >> 2) | 1), dh = Math.min(bodyH - 4, Math.max(4, dw * 2));
    P.r(cx - (dw >> 1) - 1, yBase - 2 - dh - 2, dw + 2, 2, KM_SAND_D);          // lintel
    P.r(cx - (dw >> 1), yBase - 2 - dh, dw, dh, '#2a1d14');
  }
  // the corncob spire: tiers of 3 rows, each tier a bit narrower, bulging slightly, notched edges
  const top = yb - spireH, hw0 = hw - 1;
  for (let y = yb - 1; y >= top + 3; y--) {
    const t = (yb - 1 - y) / Math.max(1, spireH - 3);
    const hwy = Math.max(1, Math.round(hw0 * Math.pow(Math.cos(t * Math.PI / 2), 0.55)));
    const k = (yb - 1 - y) % 3;
    P.r(cx - hwy, y, hwy * 2, 1, k === 0 ? KM_SAND_D : k === 1 ? KM_SAND : KM_SAND_L);
    P.r(cx + hwy - 1, y, 1, 1, k === 2 ? KM_SAND : KM_SAND_D);                   // shaded right side
    if (k === 1 && hwy > 2) { P.r(cx - hwy - 1, y, 1, 1, KM_SAND_L); P.r(cx + hwy, y, 1, 1, KM_SAND_D); }   // antefix notches
  }
  P.r(cx - 1, top + 1, 2, 2, KM_SAND_L); P.r(cx, top, 1, 1, KM_GOLD); P.r(cx - 1, top + 2, 2, 1, KM_GOLD);   // lotus bud
}
// carved Bayon face: crown, brows, closed eyes, broad nose, calm smile. s = 1 small (7x9) or 2 large (11x13)
function kmFace(P, cx, y, s) {
  const r = P.r;
  if (s === 1) {
    r(cx - 3, y, 7, 2, KM_SAND_D); r(cx - 2, y - 1, 5, 1, KM_SAND_D); r(cx, y - 2, 1, 1, KM_SAND_D);   // diadem
    r(cx - 3, y + 2, 7, 7, KM_SAND_L); r(cx + 2, y + 2, 1, 7, KM_SAND);
    r(cx - 3, y + 3, 2, 1, KM_SAND_S); r(cx + 1, y + 3, 2, 1, KM_SAND_S);                                // brows
    r(cx - 2, y + 4, 1, 1, '#3a3024'); r(cx + 2, y + 4, 1, 1, '#3a3024');                                 // eyes
    r(cx, y + 4, 1, 3, KM_SAND_D);                                                                         // nose
    r(cx - 1, y + 7, 3, 1, '#5e4a3a');                                                                     // lips
    r(cx - 4, y + 3, 1, 4, KM_SAND_D); r(cx + 4, y + 3, 1, 4, KM_SAND_D);                                 // ears
  } else {
    r(cx - 5, y, 11, 3, KM_SAND_D); r(cx - 4, y - 2, 9, 2, KM_SAND_D); r(cx - 1, y - 4, 3, 2, KM_SAND_D);   // diadem
    for (let i = -4; i <= 4; i += 2) r(cx + i, y + 1, 1, 1, KM_SAND_L);
    r(cx - 5, y + 3, 11, 10, KM_SAND_L); r(cx + 4, y + 3, 1, 10, KM_SAND); r(cx - 4, y + 12, 9, 1, KM_SAND);
    r(cx - 4, y + 4, 3, 1, KM_SAND_S); r(cx + 2, y + 4, 3, 1, KM_SAND_S);                                // brows
    r(cx - 4, y + 6, 3, 1, '#3a3024'); r(cx + 2, y + 6, 3, 1, '#3a3024');                                 // lowered eyes
    r(cx, y + 5, 1, 4, KM_SAND_D); r(cx - 1, y + 8, 3, 1, KM_SAND_D);                                     // nose
    r(cx - 2, y + 10, 5, 1, '#5e4a3a'); r(cx - 3, y + 9, 1, 1, '#5e4a3a'); r(cx + 3, y + 9, 1, 1, '#5e4a3a');   // smile
    r(cx - 6, y + 4, 1, 6, KM_SAND_D); r(cx + 6, y + 4, 1, 6, KM_SAND_D); r(cx - 6, y + 9, 1, 3, KM_SAND_S); r(cx + 6, y + 9, 1, 3, KM_SAND_S);   // long ears
  }
}
// naga balustrade: a stone serpent body on little posts, ending in a fanned multi-headed hood
function kmNaga(P, x, y, len, dir) {
  const r = P.r;
  r(x, y, len, 2, KM_SAND); r(x, y, len, 1, KM_SAND_L);
  for (let i = 2; i < len; i += 4) r(x + i, y + 2, 1, 2, KM_SAND_D);
  const hx = dir > 0 ? x + len : x - 5;
  r(hx, y - 3, 5, 5, KM_SAND); r(hx, y - 4, 5, 1, KM_SAND_L);
  for (let i = 0; i < 5; i += 2) r(hx + i, y - 5, 1, 1, KM_SAND_L);
  r(hx + 1, y - 2, 1, 1, '#3a3024'); r(hx + 3, y - 2, 1, 1, '#3a3024');
}
// blue team banner with a gold border and a small gold lotus
function kmBanner(P, x, y, h) { P.r(x, y, 1, h, WOOD_D); P.r(x, y - 1, 1, 1, KM_GOLD); P.r(x + 1, y + 1, 6, 5, KMC.main); P.r(x + 1, y + 1, 6, 1, KM_GOLD); P.r(x + 1, y + 5, 6, 1, KMC.dark); P.r(x + 3, y + 3, 2, 1, KM_GOLD); P.r(x + 4, y + 2, 1, 1, KM_GOLD); }
// steep tile roof with ribbed tile channels and upswept gold gable horns
function kmTileRoof(P, cx, y0, y1, hw0, hw1) {
  for (let y = y0; y <= y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0), hw = Math.round(hw0 + (hw1 - hw0) * t);
    P.r(cx - hw, y, hw * 2, 1, ((y - y0) % 3 === 2) ? KM_TILE_D : KM_TILE);
    for (let i = cx - hw + 1 + ((y - y0) & 1); i < cx + hw - 1; i += 3) if ((y - y0) % 3 !== 2) P.r(i, y, 1, 1, KM_TILE_D);
  }
  P.r(cx - hw1 - 1, y1, hw1 * 2 + 2, 1, KM_TILE_E);
  P.r(cx - hw1 - 2, y1 - 2, 1, 2, KM_GOLD); P.r(cx + hw1 + 1, y1 - 2, 1, 2, KM_GOLD);       // upswept eave horns
  P.r(cx - 1, y0 - 2, 2, 2, KM_GOLD);
}

function kmBuilding(kind) {
  const d = KM_DIMS[kind];
  return sprite('km|' + kind, d[0], d[1], 2, (P) => {
    const r = P.r;
    if (kind === 'towncentre') {
      // Royal compound: sandstone prasat rising at the back, a wooden hall with a tile roof, low laterite wall in front
      kmPrasat(P, 30, 36, 12, 10, 24, false);
      planks(P, 6, 34, 30, 12, '#b88a52', '#9a6f3a');
      r(16, 37, 10, 9, '#3f2713'); r(15, 36, 12, 1, KMC.trim); r(20, 37, 1, 9, '#2a190a');
      r(9, 38, 4, 4, '#2b1a0c'); r(29, 38, 4, 4, '#2b1a0c');
      kmTileRoof(P, 21, 20, 34, 4, 18); r(2, 34, 38, 1, KMC.main);
      r(20, 14, 2, 4, WOOD_D);
      kmLaterite(P, 1, 48, 46, 12); kmCoping(P, 1, 46, 46); r(1, 59, 46, 2, KM_LAT_D);
      r(19, 49, 10, 12, '#2a1d14'); r(18, 48, 12, 1, KM_SAND_D); r(19, 60, 10, 1, KM_SAND);          // gate opening
      kmBanner(P, 41, 24, 23);
    } else if (kind === 'house') {
      // Stilt house: tall posts, plank walls with shutters, steep tile roof, ladder
      posts(P, [4, 11, 19, 26], 36, 45, 2); r(2, 34, 28, 3, '#8f6232'); r(2, 37, 28, 1, '#5a3a1e');
      planks(P, 4, 24, 24, 10, '#c99b5d', '#a97d45');
      r(13, 26, 6, 8, '#3f2713'); r(6, 27, 4, 3, '#2b1a0c'); r(22, 27, 4, 3, '#2b1a0c'); r(12, 25, 8, 1, KMC.trim);
      kmTileRoof(P, 16, 6, 24, 2, 15); r(2, 24, 28, 1, KMC.main);
      r(14, 38, 1, 8, WOOD); r(18, 38, 1, 8, WOOD); for (let y = 39; y < 46; y += 2) r(14, y, 5, 1, WOOD);
      r(27, 41, 4, 4, '#a8803c'); r(27, 41, 4, 1, '#c9a05a');                                              // rice jar
    } else if (kind === 'tower') {
      // Face tower: laterite base, sandstone shaft with a carved face, corncob tiers to a lotus bud
      kmLaterite(P, 5, 44, 22, 18); r(4, 60, 24, 2, KM_LAT_D); kmCoping(P, 5, 42, 22);
      r(13, 51, 6, 11, '#2a1d14'); r(12, 50, 8, 1, KM_SAND_D);
      r(5, 48, 22, 1, KMC.main);
      kmSand(P, 8, 24, 16, 18); r(8, 24, 1, 18, KM_SAND_L); r(23, 24, 1, 18, KM_SAND_D);
      kmFace(P, 16, 29, 1);
      r(9, 38, 14, 1, KM_SAND_S);
      r(6, 26, 2, 5, KM_SAND_D); r(24, 26, 2, 5, KM_SAND_D); r(6, 25, 2, 1, KM_SAND_L); r(24, 25, 2, 1, KM_SAND_L);   // side faces in profile
      kmCoping(P, 8, 22, 16);
      for (let i = 0; i < 6; i++) { const w = 14 - i * 2, y = 19 - i * 3; r(16 - (w >> 1), y, w, 3, KM_SAND); r(16 - (w >> 1), y, w, 1, KM_SAND_L); r(16 + (w >> 1) - 1, y, 1, 3, KM_SAND_D); r(16 - (w >> 1) - 1, y + 2, w + 2, 1, KM_SAND_D); }
      r(15, 2, 2, 3, KM_SAND_L); r(15, 1, 2, 1, KM_GOLD); r(15, 0, 1, 1, KM_GOLD);
      r(26, 4, 1, 18, WOOD_D); r(27, 5, 4, 4, KMC.main); r(27, 5, 4, 1, KM_GOLD);
    } else if (kind === 'palisade') {
      // Wooden stockade: sharpened log stakes with a lashed rail
      for (let i = 0; i < 8; i++) {
        const x = i * 4, top = 6 + ((i * 5) % 3);
        r(x, top, 4, 30 - top - 2, '#8a5a2b'); r(x, top, 1, 30 - top - 2, '#a9733c'); r(x + 3, top, 1, 30 - top - 2, '#5e3b1c');
        r(x + 1, top - 2, 2, 2, '#8a5a2b'); r(x + 1, top - 3, 1, 1, '#a9733c');
        for (let y = top + 3; y < 26; y += 5) r(x + 1, y, 2, 1, '#6e4521');
      }
      r(0, 13, 32, 2, '#5e3b1c'); r(0, 13, 32, 1, '#8a6a3a'); r(0, 21, 32, 2, '#5e3b1c'); r(0, 21, 32, 1, '#8a6a3a');
      r(0, 28, 32, 2, '#6b5a3a');
      r(14, 15, 4, 4, KMC.main); r(14, 15, 4, 1, KM_GOLD);
    } else if (kind === 'wall') {
      // Laterite wall: big pitted blocks, sandstone coping with a crest of lotus merlons
      kmLaterite(P, 1, 10, 30, 22); r(1, 31, 30, 2, KM_LAT_D);
      r(1, 10, 1, 22, KM_LAT_L);
      kmCoping(P, 1, 8, 30);
      for (let x = 2; x < 30; x += 6) { r(x, 4, 4, 4, KM_SAND); r(x, 4, 4, 1, KM_SAND_L); r(x + 3, 5, 1, 3, KM_SAND_D); r(x + 1, 3, 2, 1, KM_SAND_L); }
      r(1, 20, 30, 1, KMC.main);
    } else if (kind === 'gate') {
      // Face gate (Angkor Thom): laterite wall stubs, an arched sandstone gateway, a tower with a big carved face
      kmLaterite(P, 0, 26, 12, 20); kmCoping(P, 0, 24, 12); kmLaterite(P, 36, 26, 12, 20); kmCoping(P, 36, 24, 12);
      r(0, 45, 12, 2, KM_LAT_D); r(36, 45, 12, 2, KM_LAT_D);
      kmSand(P, 11, 22, 26, 25); r(11, 22, 1, 25, KM_SAND_L); r(36, 22, 1, 25, KM_SAND_D);
      // corbelled arch
      r(18, 34, 12, 13, '#2a1d14'); r(19, 32, 10, 2, '#2a1d14'); r(21, 30, 6, 2, '#2a1d14'); r(23, 29, 2, 1, '#2a1d14');
      r(17, 34, 1, 13, KM_SAND_S); r(30, 34, 1, 13, KM_SAND_S); r(18, 46, 12, 1, KM_SAND_D);
      r(12, 34, 4, 12, KM_SAND_D); r(32, 34, 4, 12, KM_SAND_D);                               // elephant-trunk piers
      r(13, 40, 2, 6, KM_SAND_S); r(33, 40, 2, 6, KM_SAND_S);
      // tower with a big face
      kmSand(P, 13, 8, 22, 14); r(13, 8, 1, 14, KM_SAND_L); r(34, 8, 1, 14, KM_SAND_D);
      kmFace(P, 24, 9, 2);
      r(10, 12, 3, 8, KM_SAND_D); r(35, 12, 3, 8, KM_SAND_D); r(10, 11, 3, 1, KM_SAND_L); r(35, 11, 3, 1, KM_SAND_L);   // side faces
      kmCoping(P, 13, 21, 22); r(12, 23, 24, 1, KMC.main);
      for (let i = 0; i < 3; i++) { const w = 16 - i * 5, y = 5 - i * 2; r(24 - (w >> 1), y, w, 2, KM_SAND); r(24 - (w >> 1), y, w, 1, KM_SAND_L); r(24 + (w >> 1) - 1, y, 1, 2, KM_SAND_D); }
      r(23, 0, 2, 1, KM_GOLD);
      kmBanner(P, 2, 12, 12);
    } else if (kind === 'healer') {
      // Arogyasala: a small sandstone prasat chapel, a gopura-like porch in front, herb pots, blue banner
      kmPrasat(P, 32, 44, 16, 16, 22, true);
      r(4, 46, 40, 4, KM_LAT); kmLaterite(P, 4, 44, 40, 6); r(4, 50, 40, 1, KM_LAT_D);           // laterite terrace
      kmSand(P, 8, 34, 20, 10); r(8, 34, 1, 10, KM_SAND_L);
      r(15, 36, 6, 8, '#2a1d14'); r(14, 35, 8, 1, KM_SAND_D);
      r(10, 37, 3, 4, '#2b1a0c'); r(23, 37, 3, 4, '#2b1a0c');
      for (const x of [10, 11, 23, 24]) r(x, 37, 1, 4, KM_SAND_D);                               // balustered windows
      kmTileRoof(P, 18, 26, 33, 4, 12); r(5, 34, 26, 1, KMC.main);
      r(14, 50, 8, 1, KM_SAND); r(15, 51, 6, 1, KM_SAND_D);                                      // steps
      for (const x of [2, 40]) { r(x, 41, 5, 4, '#a8803c'); r(x, 41, 5, 1, '#c9a05a'); r(x + 1, 38, 1, 3, '#4e9a3c'); r(x + 3, 39, 1, 2, '#8fd06a'); }   // herb pots
      kmBanner(P, 40, 14, 27);
    } else if (kind === 'palace') {
      // Prasat palace: stepped laterite/sandstone platform, central corncob prasat with two smaller ones, a wooden pavilion in blue and gold
      kmLaterite(P, 2, 64, 60, 12); r(2, 75, 60, 2, KM_LAT_D);
      kmCoping(P, 2, 62, 60); kmLaterite(P, 7, 54, 50, 8); kmCoping(P, 7, 52, 50);
      r(26, 54, 12, 23, KM_SAND_D); for (let y = 55; y < 77; y += 2) r(27, y, 10, 1, KM_SAND);  // central stair
      kmNaga(P, 8, 66, 17, -1); kmNaga(P, 39, 66, 17, 1);
      kmPrasat(P, 13, 52, 10, 10, 16, true); kmPrasat(P, 51, 52, 10, 10, 16, true);
      kmPrasat(P, 32, 40, 16, 12, 30, true);
      // wooden pavilion in front of the central tower: red-gold posts, blue frieze, tile roof
      for (const x of [21, 26, 37, 42]) { r(x, 44, 2, 10, '#7a2a1e'); r(x, 44, 1, 10, '#5a1c14'); r(x, 44, 2, 1, KM_GOLD); }
      r(28, 46, 8, 8, '#3f2713'); r(31, 47, 2, 2, KM_GOLD);
      r(19, 43, 26, 1, KMC.main); r(19, 42, 26, 1, KM_GOLD);
      kmTileRoof(P, 32, 34, 42, 5, 14);
      kmBanner(P, 1, 38, 24); kmBanner(P, 56, 38, 24);
    } else if (kind === 'baray') {
      // Baray: 3/4 top view of a laterite-banked reservoir, stepped inner edges, an island shrine in the middle
      kmLaterite(P, 0, 8, 64, 38); r(0, 8, 64, 1, KM_LAT_L);
      r(0, 42, 64, 5, KM_LAT_D); kmLaterite(P, 0, 42, 64, 4); r(0, 46, 64, 1, '#5a2a16');        // front embankment face
      for (let i = 0; i < 3; i++) { const c = i & 1 ? KM_SAND : KM_SAND_D; r(3 + i, 11 + i, 58 - i * 2, 1, KM_SAND_L); r(3 + i, 11 + i, 1, 29 - i * 2, c); r(60 - i, 11 + i, 1, 29 - i * 2, c); r(3 + i, 39 - i, 58 - i * 2, 1, c); }
      r(6, 14, 52, 24, KM_WATER); r(6, 14, 52, 2, KM_WATER_D); r(6, 14, 2, 24, KM_WATER_D);
      for (const [x, y, w] of [[10, 19, 5], [44, 18, 6], [14, 30, 6], [46, 31, 4], [36, 24, 3], [22, 34, 4], [50, 25, 3], [9, 25, 3]]) { r(x, y, w, 1, KM_WATER_L); r(x + 1, y + 1, w - 2, 1, '#6fbfd3'); }
      // island with a tiny prasat
      r(25, 26, 14, 6, KM_LAT_D); r(24, 25, 16, 5, KM_LAT); r(24, 25, 16, 1, KM_LAT_L); r(26, 30, 12, 1, KM_SAND_D);
      r(22, 31, 20, 1, '#7fc3d6');
      kmPrasat(P, 32, 27, 8, 6, 12, true);
      for (const x of [2, 8]) { r(x + 1, 3, 1, 6, '#5e3b1c'); r(x - 1, 1, 5, 1, '#3f7a3a'); r(x, 0, 3, 1, '#5a9a4a'); r(x - 1, 2, 1, 1, '#3f7a3a'); r(x + 3, 2, 1, 1, '#3f7a3a'); }   // sugar palms on the bank
      kmBanner(P, 56, 0, 10);
    }
  });
}
if (typeof window !== 'undefined') window.kmBuilding = kmBuilding;

const KBLUE = '#2f6fd0', KBLUE_D = '#1c4590';
const SAFF = '#e0882a', SAFF_D = '#b8661c', SAFF_L = '#f2a64a', BRONZE = '#a8803c', BRONZE_L = '#d4a85a', BRONZE_D = '#7a5a26';
function cartBallistaSprite(anim, f) {
  return sprite('kcart|' + anim + '|' + f, 30, 20, 2, (P) => {
    const r = P.r, walk = anim === 'walk', fire = anim === 'attack';
    const C = KHC, K = KBLUE;
    for (const [x, ph] of [[2, 0], [7, 1]]) {
      const bob = walk && ((f + ph) & 1) ? -1 : 0;
      r(x + 1, 15, 1, 4, SKIN_D); r(x + 3, 15, 1, 4, SKIN_D);
      r(x, 9 + bob, 5, 6, SKIN); r(x, 12 + bob, 5, 3, K); r(x + 1, 5 + bob, 3, 4, SKIN); r(x + 1, 4 + bob, 3, 1, HAIR); r(x + 2, 2 + bob, 1, 2, HAIR);
    }
    r(9, 12, 18, 3, WOOD); r(9, 12, 18, 1, '#a8773c'); r(10, 14, 16, 1, K);
    for (const cx of [12, 23]) { disc(P, cx, 16, 3, WOOD_D); disc(P, cx, 16, 2, WOOD); r(cx, 16, 1, 1, GOLD_D); if (walk) r(cx + ((f & 1) ? 1 : -1), 14, 1, 1, WOOD_D); }
    r(12, 9, 15, 2, WOOD_D); r(12, 9, 15, 1, '#8a5a2b');
    r(25, 3, 1, 6, WOOD); r(25, 11, 1, 1, WOOD); r(26, 2, 1, 1, WOOD); r(21, 5, 1, 4, WOOD); r(22, 4, 1, 1, WOOD);
    if (!(fire && f === 1)) { r(14, 8, 13, 1, '#d8d0b0'); r(27, 8, 1, 1, STEEL); r(24, 3, 1, 5, '#d8d0b0'); }
    else { r(24, 4, 1, 4, '#d8d0b0'); r(27, 7, 3, 1, '#d8d0b0'); }
    r(15, 7, 3, 2, C.dark); r(15, 7, 3, 1, '#cfc6b0');
  });
}

return { khmerUnitSprite, ballistaElephantSprite, cartBallistaSprite, mainlandShip, mainlandBuilding, mainlandBase, kmBuilding, KHC };
})();

// Encyclopedia entries for the Khmer-only units and buildings
Object.assign(ENCY_UNITS, { bal: KHMER.ency.bal, kcart: KHMER.ency.kcart }); ENCY_BLDS.baray = KHMER.ency.baray;
/* Khmer buildings (unit-art/khmer-buildings/km-bld-patch.js, art thread 2026-11-09) */
const KMBLD = (() => {
/* Khmer buildings patch (art thread, 2026-11-09), for playable Khmer. Paste-ready, like unit-art/ayutthaya-buildings/ayu-bld-patch.js.
   Made by make.py from lore/scenes/bld-khmer.js (kmBuilding) and lore/scenes/bld-econ-dv-km.js (kmBuildingX); edit those and re-run.
   Needs the game's sprite(), planks(), posts(), disc(), WOOD/WOOD_D/STEEL/GOLD. Wrap it in its own scope (e.g. const KMART = (() => { ...; return { building }; })())
   because it defines KMC, KM_*, BX_* and helper names.
   building(kind, level) returns the Khmer sprite or null (null = let the game draw its shared art). Sizes match the shared ones.
     towncentre 48x62, house 32x46, tower 32x64, palace 64x78, healer 48x52 (Arogyasala), baray 64x48 (unique),
     barracks 48x58, port 48x54, granary 32x46, store 32x46, farm 32x32 (level 0..2 = growth).
   Walls: palisade/wall/gate art is here as kmBuilding('palisade'|'wall'|'gate') for reference only; in game the shared
   wallSprite draws walls (plain timber until Age 3), so the civ wall style for Khmer would be added there. */
/* Khmer building art (post-Angkor Cambodia, 1400s-1500s). Same style as CIVB melakaBuilding/majapahitBuilding.
   Needs sprite(), planks(), posts(), WOOD/WOOD_D/CREAM and GOLD from the game (art.js / drawUnit.js).
   kmBuilding(kind): kind towncentre | house | tower | palisade | wall | gate | healer | palace | baray
   Team colour is blue (KMC). Lore: lore/buildings.md (Khmer), lore/khmer.md. */
const KMC = { main: '#2f6fd0', dark: '#1c4590', trim: '#f2c94c', ring: '#8ab8ff' };
const KM_DIMS = { towncentre: [48, 62], house: [32, 46], tower: [32, 64], palisade: [32, 30], wall: [32, 34], gate: [48, 48], healer: [48, 52], palace: [64, 78], baray: [64, 48] };
const KM_LAT = '#a0522d', KM_LAT_D = '#7a3c22', KM_LAT_L = '#b96a3e', KM_PIT = '#4e2414';
const KM_SAND = '#b8ad8f', KM_SAND_D = '#8f866c', KM_SAND_L = '#d4cbab', KM_SAND_S = '#6f6852';
const KM_TILE = '#b4583a', KM_TILE_D = '#8a3f27', KM_TILE_E = '#4a2416';
const KM_WATER = '#4ba3bf', KM_WATER_D = '#2c6f90', KM_WATER_L = '#9fd6e2';
const KM_GOLD = (typeof GOLD !== 'undefined') ? GOLD : '#e8b830';

// deterministic hash for pit/texture placement
function kmHash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
// laterite blocks: rusty orange-brown, staggered courses, dark pits
function kmLaterite(P, x, y, w, h) {
  P.r(x, y, w, h, KM_LAT);
  for (let j = 0; j < h; j++) {
    const row = Math.floor(j / 3), off = (row & 1) ? 3 : 0;
    if (j % 3 === 2) P.r(x, y + j, w, 1, KM_LAT_D);
    else for (let i = off; i < w; i += 6) P.r(x + i, y + j, 1, 1, KM_LAT_D);
  }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (j % 3 === 2) continue;
    const v = kmHash(x + i, y + j);
    if (v < 0.09) P.r(x + i, y + j, 1, 1, KM_PIT); else if (v > 0.95) P.r(x + i, y + j, 1, 1, KM_LAT_L);
  }
  P.r(x, y, w, 1, KM_LAT_L);
}
// sandstone: smooth grey-tan ashlar
function kmSand(P, x, y, w, h) {
  P.r(x, y, w, h, KM_SAND);
  for (let j = 0; j < h; j++) {
    const row = Math.floor(j / 3), off = (row & 1) ? 2 : 5;
    if (j % 3 === 2) P.r(x, y + j, w, 1, KM_SAND_D);
    else for (let i = off; i < w; i += 7) P.r(x + i, y + j, 1, 1, KM_SAND_D);
  }
  P.r(x, y, w, 1, KM_SAND_L);
}
// sandstone coping / cornice band
function kmCoping(P, x, y, w) { P.r(x - 1, y, w + 2, 2, KM_SAND); P.r(x - 1, y, w + 2, 1, KM_SAND_L); P.r(x, y + 2, w, 1, KM_SAND_S); }
// corncob prasat tower: a body with a false door, then stacked tiers tapering to a lotus bud
function kmPrasat(P, cx, yBase, w, bodyH, spireH, door) {
  const hw = w >> 1, yb = yBase - bodyH;
  kmSand(P, cx - hw, yb, w, bodyH);
  P.r(cx - hw, yb, 1, bodyH, KM_SAND_L); P.r(cx + hw - 1, yb, 1, bodyH, KM_SAND_D);
  P.r(cx - hw - 1, yBase - 2, w + 2, 2, KM_SAND_D); P.r(cx - hw - 1, yBase - 2, w + 2, 1, KM_SAND);   // plinth
  kmCoping(P, cx - hw, yb, w);
  if (door) {
    const dw = Math.max(2, (w >> 2) | 1), dh = Math.min(bodyH - 4, Math.max(4, dw * 2));
    P.r(cx - (dw >> 1) - 1, yBase - 2 - dh - 2, dw + 2, 2, KM_SAND_D);          // lintel
    P.r(cx - (dw >> 1), yBase - 2 - dh, dw, dh, '#2a1d14');
  }
  // the corncob spire: tiers of 3 rows, each tier a bit narrower, bulging slightly, notched edges
  const top = yb - spireH, hw0 = hw - 1;
  for (let y = yb - 1; y >= top + 3; y--) {
    const t = (yb - 1 - y) / Math.max(1, spireH - 3);
    const hwy = Math.max(1, Math.round(hw0 * Math.pow(Math.cos(t * Math.PI / 2), 0.55)));
    const k = (yb - 1 - y) % 3;
    P.r(cx - hwy, y, hwy * 2, 1, k === 0 ? KM_SAND_D : k === 1 ? KM_SAND : KM_SAND_L);
    P.r(cx + hwy - 1, y, 1, 1, k === 2 ? KM_SAND : KM_SAND_D);                   // shaded right side
    if (k === 1 && hwy > 2) { P.r(cx - hwy - 1, y, 1, 1, KM_SAND_L); P.r(cx + hwy, y, 1, 1, KM_SAND_D); }   // antefix notches
  }
  P.r(cx - 1, top + 1, 2, 2, KM_SAND_L); P.r(cx, top, 1, 1, KM_GOLD); P.r(cx - 1, top + 2, 2, 1, KM_GOLD);   // lotus bud
}
// carved Bayon face: crown, brows, closed eyes, broad nose, calm smile. s = 1 small (7x9) or 2 large (11x13)
function kmFace(P, cx, y, s) {
  const r = P.r;
  if (s === 1) {
    r(cx - 3, y, 7, 2, KM_SAND_D); r(cx - 2, y - 1, 5, 1, KM_SAND_D); r(cx, y - 2, 1, 1, KM_SAND_D);   // diadem
    r(cx - 3, y + 2, 7, 7, KM_SAND_L); r(cx + 2, y + 2, 1, 7, KM_SAND);
    r(cx - 3, y + 3, 2, 1, KM_SAND_S); r(cx + 1, y + 3, 2, 1, KM_SAND_S);                                // brows
    r(cx - 2, y + 4, 1, 1, '#3a3024'); r(cx + 2, y + 4, 1, 1, '#3a3024');                                 // eyes
    r(cx, y + 4, 1, 3, KM_SAND_D);                                                                         // nose
    r(cx - 1, y + 7, 3, 1, '#5e4a3a');                                                                     // lips
    r(cx - 4, y + 3, 1, 4, KM_SAND_D); r(cx + 4, y + 3, 1, 4, KM_SAND_D);                                 // ears
  } else {
    r(cx - 5, y, 11, 3, KM_SAND_D); r(cx - 4, y - 2, 9, 2, KM_SAND_D); r(cx - 1, y - 4, 3, 2, KM_SAND_D);   // diadem
    for (let i = -4; i <= 4; i += 2) r(cx + i, y + 1, 1, 1, KM_SAND_L);
    r(cx - 5, y + 3, 11, 10, KM_SAND_L); r(cx + 4, y + 3, 1, 10, KM_SAND); r(cx - 4, y + 12, 9, 1, KM_SAND);
    r(cx - 4, y + 4, 3, 1, KM_SAND_S); r(cx + 2, y + 4, 3, 1, KM_SAND_S);                                // brows
    r(cx - 4, y + 6, 3, 1, '#3a3024'); r(cx + 2, y + 6, 3, 1, '#3a3024');                                 // lowered eyes
    r(cx, y + 5, 1, 4, KM_SAND_D); r(cx - 1, y + 8, 3, 1, KM_SAND_D);                                     // nose
    r(cx - 2, y + 10, 5, 1, '#5e4a3a'); r(cx - 3, y + 9, 1, 1, '#5e4a3a'); r(cx + 3, y + 9, 1, 1, '#5e4a3a');   // smile
    r(cx - 6, y + 4, 1, 6, KM_SAND_D); r(cx + 6, y + 4, 1, 6, KM_SAND_D); r(cx - 6, y + 9, 1, 3, KM_SAND_S); r(cx + 6, y + 9, 1, 3, KM_SAND_S);   // long ears
  }
}
// naga balustrade: a stone serpent body on little posts, ending in a fanned multi-headed hood
function kmNaga(P, x, y, len, dir) {
  const r = P.r;
  r(x, y, len, 2, KM_SAND); r(x, y, len, 1, KM_SAND_L);
  for (let i = 2; i < len; i += 4) r(x + i, y + 2, 1, 2, KM_SAND_D);
  const hx = dir > 0 ? x + len : x - 5;
  r(hx, y - 3, 5, 5, KM_SAND); r(hx, y - 4, 5, 1, KM_SAND_L);
  for (let i = 0; i < 5; i += 2) r(hx + i, y - 5, 1, 1, KM_SAND_L);
  r(hx + 1, y - 2, 1, 1, '#3a3024'); r(hx + 3, y - 2, 1, 1, '#3a3024');
}
// blue team banner with a gold border and a small gold lotus
function kmBanner(P, x, y, h) { P.r(x, y, 1, h, WOOD_D); P.r(x, y - 1, 1, 1, KM_GOLD); P.r(x + 1, y + 1, 6, 5, KMC.main); P.r(x + 1, y + 1, 6, 1, KM_GOLD); P.r(x + 1, y + 5, 6, 1, KMC.dark); P.r(x + 3, y + 3, 2, 1, KM_GOLD); P.r(x + 4, y + 2, 1, 1, KM_GOLD); }
// steep tile roof with ribbed tile channels and upswept gold gable horns
function kmTileRoof(P, cx, y0, y1, hw0, hw1) {
  for (let y = y0; y <= y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0), hw = Math.round(hw0 + (hw1 - hw0) * t);
    P.r(cx - hw, y, hw * 2, 1, ((y - y0) % 3 === 2) ? KM_TILE_D : KM_TILE);
    for (let i = cx - hw + 1 + ((y - y0) & 1); i < cx + hw - 1; i += 3) if ((y - y0) % 3 !== 2) P.r(i, y, 1, 1, KM_TILE_D);
  }
  P.r(cx - hw1 - 1, y1, hw1 * 2 + 2, 1, KM_TILE_E);
  P.r(cx - hw1 - 2, y1 - 2, 1, 2, KM_GOLD); P.r(cx + hw1 + 1, y1 - 2, 1, 2, KM_GOLD);       // upswept eave horns
  P.r(cx - 1, y0 - 2, 2, 2, KM_GOLD);
}

function kmBuilding(kind) {
  const d = KM_DIMS[kind];
  return sprite('km|' + kind, d[0], d[1], 2, (P) => {
    const r = P.r;
    if (kind === 'towncentre') {
      // Royal compound: sandstone prasat rising at the back, a wooden hall with a tile roof, low laterite wall in front
      kmPrasat(P, 30, 36, 12, 10, 24, false);
      planks(P, 6, 34, 30, 12, '#b88a52', '#9a6f3a');
      r(16, 37, 10, 9, '#3f2713'); r(15, 36, 12, 1, KMC.trim); r(20, 37, 1, 9, '#2a190a');
      r(9, 38, 4, 4, '#2b1a0c'); r(29, 38, 4, 4, '#2b1a0c');
      kmTileRoof(P, 21, 20, 34, 4, 18); r(2, 34, 38, 1, KMC.main);
      r(20, 14, 2, 4, WOOD_D);
      kmLaterite(P, 1, 48, 46, 12); kmCoping(P, 1, 46, 46); r(1, 59, 46, 2, KM_LAT_D);
      r(19, 49, 10, 12, '#2a1d14'); r(18, 48, 12, 1, KM_SAND_D); r(19, 60, 10, 1, KM_SAND);          // gate opening
      kmBanner(P, 41, 24, 23);
    } else if (kind === 'house') {
      // Stilt house: tall posts, plank walls with shutters, steep tile roof, ladder
      posts(P, [4, 11, 19, 26], 36, 45, 2); r(2, 34, 28, 3, '#8f6232'); r(2, 37, 28, 1, '#5a3a1e');
      planks(P, 4, 24, 24, 10, '#c99b5d', '#a97d45');
      r(13, 26, 6, 8, '#3f2713'); r(6, 27, 4, 3, '#2b1a0c'); r(22, 27, 4, 3, '#2b1a0c'); r(12, 25, 8, 1, KMC.trim);
      kmTileRoof(P, 16, 6, 24, 2, 15); r(2, 24, 28, 1, KMC.main);
      r(14, 38, 1, 8, WOOD); r(18, 38, 1, 8, WOOD); for (let y = 39; y < 46; y += 2) r(14, y, 5, 1, WOOD);
      r(27, 41, 4, 4, '#a8803c'); r(27, 41, 4, 1, '#c9a05a');                                              // rice jar
    } else if (kind === 'tower') {
      // Face tower: laterite base, sandstone shaft with a carved face, corncob tiers to a lotus bud
      kmLaterite(P, 5, 44, 22, 18); r(4, 60, 24, 2, KM_LAT_D); kmCoping(P, 5, 42, 22);
      r(13, 51, 6, 11, '#2a1d14'); r(12, 50, 8, 1, KM_SAND_D);
      r(5, 48, 22, 1, KMC.main);
      kmSand(P, 8, 24, 16, 18); r(8, 24, 1, 18, KM_SAND_L); r(23, 24, 1, 18, KM_SAND_D);
      kmFace(P, 16, 29, 1);
      r(9, 38, 14, 1, KM_SAND_S);
      r(6, 26, 2, 5, KM_SAND_D); r(24, 26, 2, 5, KM_SAND_D); r(6, 25, 2, 1, KM_SAND_L); r(24, 25, 2, 1, KM_SAND_L);   // side faces in profile
      kmCoping(P, 8, 22, 16);
      for (let i = 0; i < 6; i++) { const w = 14 - i * 2, y = 19 - i * 3; r(16 - (w >> 1), y, w, 3, KM_SAND); r(16 - (w >> 1), y, w, 1, KM_SAND_L); r(16 + (w >> 1) - 1, y, 1, 3, KM_SAND_D); r(16 - (w >> 1) - 1, y + 2, w + 2, 1, KM_SAND_D); }
      r(15, 2, 2, 3, KM_SAND_L); r(15, 1, 2, 1, KM_GOLD); r(15, 0, 1, 1, KM_GOLD);
      r(26, 4, 1, 18, WOOD_D); r(27, 5, 4, 4, KMC.main); r(27, 5, 4, 1, KM_GOLD);
    } else if (kind === 'palisade') {
      // Wooden stockade: sharpened log stakes with a lashed rail
      for (let i = 0; i < 8; i++) {
        const x = i * 4, top = 6 + ((i * 5) % 3);
        r(x, top, 4, 30 - top - 2, '#8a5a2b'); r(x, top, 1, 30 - top - 2, '#a9733c'); r(x + 3, top, 1, 30 - top - 2, '#5e3b1c');
        r(x + 1, top - 2, 2, 2, '#8a5a2b'); r(x + 1, top - 3, 1, 1, '#a9733c');
        for (let y = top + 3; y < 26; y += 5) r(x + 1, y, 2, 1, '#6e4521');
      }
      r(0, 13, 32, 2, '#5e3b1c'); r(0, 13, 32, 1, '#8a6a3a'); r(0, 21, 32, 2, '#5e3b1c'); r(0, 21, 32, 1, '#8a6a3a');
      r(0, 28, 32, 2, '#6b5a3a');
      r(14, 15, 4, 4, KMC.main); r(14, 15, 4, 1, KM_GOLD);
    } else if (kind === 'wall') {
      // Laterite wall: big pitted blocks, sandstone coping with a crest of lotus merlons
      kmLaterite(P, 1, 10, 30, 22); r(1, 31, 30, 2, KM_LAT_D);
      r(1, 10, 1, 22, KM_LAT_L);
      kmCoping(P, 1, 8, 30);
      for (let x = 2; x < 30; x += 6) { r(x, 4, 4, 4, KM_SAND); r(x, 4, 4, 1, KM_SAND_L); r(x + 3, 5, 1, 3, KM_SAND_D); r(x + 1, 3, 2, 1, KM_SAND_L); }
      r(1, 20, 30, 1, KMC.main);
    } else if (kind === 'gate') {
      // Face gate (Angkor Thom): laterite wall stubs, an arched sandstone gateway, a tower with a big carved face
      kmLaterite(P, 0, 26, 12, 20); kmCoping(P, 0, 24, 12); kmLaterite(P, 36, 26, 12, 20); kmCoping(P, 36, 24, 12);
      r(0, 45, 12, 2, KM_LAT_D); r(36, 45, 12, 2, KM_LAT_D);
      kmSand(P, 11, 22, 26, 25); r(11, 22, 1, 25, KM_SAND_L); r(36, 22, 1, 25, KM_SAND_D);
      // corbelled arch
      r(18, 34, 12, 13, '#2a1d14'); r(19, 32, 10, 2, '#2a1d14'); r(21, 30, 6, 2, '#2a1d14'); r(23, 29, 2, 1, '#2a1d14');
      r(17, 34, 1, 13, KM_SAND_S); r(30, 34, 1, 13, KM_SAND_S); r(18, 46, 12, 1, KM_SAND_D);
      r(12, 34, 4, 12, KM_SAND_D); r(32, 34, 4, 12, KM_SAND_D);                               // elephant-trunk piers
      r(13, 40, 2, 6, KM_SAND_S); r(33, 40, 2, 6, KM_SAND_S);
      // tower with a big face
      kmSand(P, 13, 8, 22, 14); r(13, 8, 1, 14, KM_SAND_L); r(34, 8, 1, 14, KM_SAND_D);
      kmFace(P, 24, 9, 2);
      r(10, 12, 3, 8, KM_SAND_D); r(35, 12, 3, 8, KM_SAND_D); r(10, 11, 3, 1, KM_SAND_L); r(35, 11, 3, 1, KM_SAND_L);   // side faces
      kmCoping(P, 13, 21, 22); r(12, 23, 24, 1, KMC.main);
      for (let i = 0; i < 3; i++) { const w = 16 - i * 5, y = 5 - i * 2; r(24 - (w >> 1), y, w, 2, KM_SAND); r(24 - (w >> 1), y, w, 1, KM_SAND_L); r(24 + (w >> 1) - 1, y, 1, 2, KM_SAND_D); }
      r(23, 0, 2, 1, KM_GOLD);
      kmBanner(P, 2, 12, 12);
    } else if (kind === 'healer') {
      // Arogyasala: a small sandstone prasat chapel, a gopura-like porch in front, herb pots, blue banner
      kmPrasat(P, 32, 44, 16, 16, 22, true);
      r(4, 46, 40, 4, KM_LAT); kmLaterite(P, 4, 44, 40, 6); r(4, 50, 40, 1, KM_LAT_D);           // laterite terrace
      kmSand(P, 8, 34, 20, 10); r(8, 34, 1, 10, KM_SAND_L);
      r(15, 36, 6, 8, '#2a1d14'); r(14, 35, 8, 1, KM_SAND_D);
      r(10, 37, 3, 4, '#2b1a0c'); r(23, 37, 3, 4, '#2b1a0c');
      for (const x of [10, 11, 23, 24]) r(x, 37, 1, 4, KM_SAND_D);                               // balustered windows
      kmTileRoof(P, 18, 26, 33, 4, 12); r(5, 34, 26, 1, KMC.main);
      r(14, 50, 8, 1, KM_SAND); r(15, 51, 6, 1, KM_SAND_D);                                      // steps
      for (const x of [2, 40]) { r(x, 41, 5, 4, '#a8803c'); r(x, 41, 5, 1, '#c9a05a'); r(x + 1, 38, 1, 3, '#4e9a3c'); r(x + 3, 39, 1, 2, '#8fd06a'); }   // herb pots
      kmBanner(P, 40, 14, 27);
    } else if (kind === 'palace') {
      // Prasat palace: stepped laterite/sandstone platform, central corncob prasat with two smaller ones, a wooden pavilion in blue and gold
      kmLaterite(P, 2, 64, 60, 12); r(2, 75, 60, 2, KM_LAT_D);
      kmCoping(P, 2, 62, 60); kmLaterite(P, 7, 54, 50, 8); kmCoping(P, 7, 52, 50);
      r(26, 54, 12, 23, KM_SAND_D); for (let y = 55; y < 77; y += 2) r(27, y, 10, 1, KM_SAND);  // central stair
      kmNaga(P, 8, 66, 17, -1); kmNaga(P, 39, 66, 17, 1);
      kmPrasat(P, 13, 52, 10, 10, 16, true); kmPrasat(P, 51, 52, 10, 10, 16, true);
      kmPrasat(P, 32, 40, 16, 12, 30, true);
      // wooden pavilion in front of the central tower: red-gold posts, blue frieze, tile roof
      for (const x of [21, 26, 37, 42]) { r(x, 44, 2, 10, '#7a2a1e'); r(x, 44, 1, 10, '#5a1c14'); r(x, 44, 2, 1, KM_GOLD); }
      r(28, 46, 8, 8, '#3f2713'); r(31, 47, 2, 2, KM_GOLD);
      r(19, 43, 26, 1, KMC.main); r(19, 42, 26, 1, KM_GOLD);
      kmTileRoof(P, 32, 34, 42, 5, 14);
      kmBanner(P, 1, 38, 24); kmBanner(P, 56, 38, 24);
    } else if (kind === 'baray') {
      // Baray: 3/4 top view of a laterite-banked reservoir, stepped inner edges, an island shrine in the middle
      kmLaterite(P, 0, 8, 64, 38); r(0, 8, 64, 1, KM_LAT_L);
      r(0, 42, 64, 5, KM_LAT_D); kmLaterite(P, 0, 42, 64, 4); r(0, 46, 64, 1, '#5a2a16');        // front embankment face
      for (let i = 0; i < 3; i++) { const c = i & 1 ? KM_SAND : KM_SAND_D; r(3 + i, 11 + i, 58 - i * 2, 1, KM_SAND_L); r(3 + i, 11 + i, 1, 29 - i * 2, c); r(60 - i, 11 + i, 1, 29 - i * 2, c); r(3 + i, 39 - i, 58 - i * 2, 1, c); }
      r(6, 14, 52, 24, KM_WATER); r(6, 14, 52, 2, KM_WATER_D); r(6, 14, 2, 24, KM_WATER_D);
      for (const [x, y, w] of [[10, 19, 5], [44, 18, 6], [14, 30, 6], [46, 31, 4], [36, 24, 3], [22, 34, 4], [50, 25, 3], [9, 25, 3]]) { r(x, y, w, 1, KM_WATER_L); r(x + 1, y + 1, w - 2, 1, '#6fbfd3'); }
      // island with a tiny prasat
      r(25, 26, 14, 6, KM_LAT_D); r(24, 25, 16, 5, KM_LAT); r(24, 25, 16, 1, KM_LAT_L); r(26, 30, 12, 1, KM_SAND_D);
      r(22, 31, 20, 1, '#7fc3d6');
      kmPrasat(P, 32, 27, 8, 6, 12, true);
      for (const x of [2, 8]) { r(x + 1, 3, 1, 6, '#5e3b1c'); r(x - 1, 1, 5, 1, '#3f7a3a'); r(x, 0, 3, 1, '#5a9a4a'); r(x - 1, 2, 1, 1, '#3f7a3a'); r(x + 3, 2, 1, 1, '#3f7a3a'); }   // sugar palms on the bank
      kmBanner(P, 56, 0, 10);
    }
  });
}
if (typeof window !== 'undefined') window.kmBuilding = kmBuilding;

/* ---- economy and army buildings ---- */
const KMX_DIMS = { barracks: [48, 58], port: [48, 54], granary: [32, 46], store: [32, 46], farm: [32, 32] };
const BX_WATER = '#3f8fb0', BX_WATER_D = '#2c6f90', BX_WATER_L = '#8fd0e0', BX_MUD = '#8a6a3e', BX_MUD_L = '#a8885e', BX_MUD_D = '#5e4025';

// rice paddy shared by both: water, bunds, rows of rice that grow with the level
function bxPaddy(P, level, rice) {
  const r = P.r;
  r(0, 0, 32, 32, BX_MUD); r(2, 2, 28, 28, BX_WATER_D); r(2, 2, 28, 1, BX_WATER);
  r(2, 15, 28, 2, BX_MUD); r(15, 2, 2, 28, BX_MUD); r(0, 0, 32, 1, BX_MUD_L); r(0, 31, 32, 1, BX_MUD_D);
  const g = level === 2 ? 4 : level === 1 ? 3 : 2;
  for (const [ox, oy] of [[3, 3], [18, 3], [3, 18], [18, 18]])
    for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) {
      const px = ox + x * 3 + (y & 1), py = oy + 2 + y * 4;
      r(px, py - g + 1, 1, g, (x + y) & 1 ? rice[0] : rice[1]); r(px, py + 1, 1, 1, BX_WATER);
    }
}
// a rack of spears (tassel colour per civ)
function bxSpears(P, x, y, n, tassel, base) { for (let i = 0; i < n; i++) { P.r(x + i * 3, y, 1, 10, WOOD_D); P.r(x + i * 3, y - 1, 1, 1, STEEL); P.r(x + i * 3, y + 2, 1, 1, tassel); } P.r(x - 1, y + 5, n * 3 + 1, 1, base); }

function kmBuildingX(kind, level) {
  const d = KMX_DIMS[kind];
  return sprite(`kmbx|${kind}|${level || 0}`, d[0], d[1], 2, (P) => {
    const r = P.r;
    if (kind === 'barracks') {
      // a timber drill hall on a laterite terrace, steep tile roof with gold horns, tall Bayon shields and spears
      kmLaterite(P, 2, 44, 44, 10); kmCoping(P, 2, 42, 44); r(2, 53, 44, 2, KM_LAT_D);
      r(18, 46, 12, 9, '#2a1d14');                                                       // steps up
      for (let y = 46; y < 55; y += 2) r(18, y, 12, 1, KM_SAND_D);
      planks(P, 6, 28, 36, 14, '#b88a52', '#9a6f3a');
      r(18, 30, 12, 12, '#3f2713'); r(17, 29, 14, 1, KMC.trim);
      bxSpears(P, 20, 31, 3, KMC.main, '#5e3b1c');
      for (const x of [9, 35]) { r(x, 30, 4, 10, KMC.main); r(x, 30, 1, 10, KMC.dark); r(x + 1, 33, 2, 1, KM_GOLD); r(x + 1, 36, 2, 1, KM_GOLD); }   // tall shields
      kmTileRoof(P, 24, 12, 28, 4, 22); r(1, 28, 46, 1, KMC.main);
      kmBanner(P, 42, 6, 36);
    } else if (kind === 'port') {
      // river landing: plank jetty on posts, an open sala with a tile roof, a war canoe with a naga prow tied up
      r(0, 40, 48, 12, '#b08a56'); for (let x = 0; x < 48; x += 4) r(x, 40, 1, 12, '#7a5a34'); r(0, 40, 48, 1, '#cfa870'); r(0, 51, 48, 1, '#5a3a1e');
      posts(P, [1, 14, 28, 44], 48, 54, 3);
      for (const x of [4, 20]) { r(x, 28, 2, 12, '#6a3a1a'); r(x, 28, 1, 12, '#4a2810'); }
      r(4, 37, 18, 3, '#8a5a34'); r(4, 37, 18, 1, '#a97a4a');
      kmTileRoof(P, 13, 18, 28, 2, 11);
      // canoe alongside, naga head at the prow
      r(26, 36, 20, 3, '#6a4426'); r(27, 35, 18, 1, '#8a5a34'); r(45, 32, 2, 4, KM_GOLD); r(46, 31, 2, 2, KM_GOLD); r(47, 33, 1, 1, '#2a190a');
      for (let x = 29; x < 44; x += 4) r(x, 34, 1, 2, WOOD_D);
      r(24, 34, 4, 6, '#a8803c'); r(24, 34, 4, 1, '#c9a05a');                                              // rice jar
      kmBanner(P, 8, 6, 22);
    } else if (kind === 'granary') {
      // rice store: a stilt barn with a steep tile roof, ladder and sacks, on a laterite footing against floods
      kmLaterite(P, 3, 40, 26, 5);
      posts(P, [5, 12, 19, 25], 32, 40, 2); r(3, 30, 26, 2, '#8f6232'); r(3, 32, 26, 1, '#5a3a1e');
      planks(P, 5, 18, 22, 12, '#c99b5d', '#a97d45');
      r(13, 21, 6, 9, '#3f2713'); r(12, 20, 8, 1, KMC.trim);
      kmTileRoof(P, 16, 4, 18, 2, 15); r(1, 18, 30, 1, KMC.main);
      for (let y = 33; y < 40; y += 2) r(18, y, 4, 1, WOOD); r(18, 32, 1, 8, WOOD); r(21, 32, 1, 8, WOOD);
      r(4, 34, 5, 5, '#e6dcc4'); r(4, 34, 5, 1, '#fff6e0'); r(6, 33, 1, 1, '#b8ac90');
    } else if (kind === 'store') {
      // store shed: laterite walls with a sandstone door frame, tile roof, log pile and a chest
      kmLaterite(P, 4, 24, 24, 16); kmCoping(P, 4, 22, 24);
      r(12, 28, 8, 12, '#2a1d14'); r(11, 27, 1, 13, KM_SAND); r(20, 27, 1, 13, KM_SAND); r(11, 26, 10, 1, KM_SAND_L);
      kmTileRoof(P, 16, 8, 21, 3, 15);
      for (let i = 0; i < 3; i++) { r(22, 40 - i * 2, 9, 2, i % 2 ? '#a07a4a' : '#8a6438'); r(30, 40 - i * 2, 1, 2, '#cfa870'); }
      r(1, 39, 8, 6, '#5e3b1c'); r(1, 38, 8, 2, KM_GOLD); r(3, 37, 3, 1, '#fff3a0'); r(4, 40, 2, 2, '#333');
    } else if (kind === 'farm') {
      // rice field with a sugar palm (thnot) at the corner, the tree of the Cambodian countryside
      bxPaddy(P, level, ['#6bbf4f', '#8ed06a']);
      r(26, 12, 1, 18, '#6a4a2a'); r(27, 12, 1, 18, '#5a3a1e');
      disc(P, 27, 9, 4, '#3f7a34'); disc(P, 27, 8, 2, '#62a046'); r(22, 9, 2, 1, '#2b5a26'); r(31, 9, 2, 1, '#2b5a26'); r(26, 4, 2, 1, '#2b5a26');
    }
  });
}

const KM_GAME = { towncentre: 'towncentre', house: 'house', tower: 'tower', palace: 'palace', healer: 'healer', arogyasala: 'healer', baray: 'baray' };
function building(kind, level) {
  if (KMX_DIMS[kind]) return kmBuildingX(kind, level);
  if (KM_GAME[kind]) return kmBuilding(KM_GAME[kind]);
  return null;
}

return { building };
})();
// campaign missions and battles (they have setupObj) keep their own rosters: Khmer only joins Skirmish
if (typeof setupObj !== 'function') {
// ---------- Khmer roster (lore/khmer.md); Melaka's shared kinds carry Khmer names and looks ----------
Object.assign(UD, {
  bal: { name: 'Ballista Elephant', hp: 380, spd: 1.8, atk: 13, bonus: { eleph: 12, ship: 6, siege: 6 }, rng: 7, rate: 3.2, ma: 3, pa: 4, sight: 8, cost: { food: 180, gold: 120 }, time: 26, cls: 'elite', ranged: true, big: 'kbal', pop: 3, civ: KHM_CIV, age: 2 },
  kcart: { name: 'Cart Ballista', hp: 150, spd: 1.4, atk: 16, bonus: { eleph: 18, ship: 8 }, rng: 8, rate: 4.5, ma: 2, pa: 5, sight: 8.5, cost: { wood: 150, gold: 60 }, time: 22, cls: 'siege', ranged: true, big: 'kcart', cap: 3, civ: KHM_CIV, age: 2 }
});
Object.assign(BD, {
  baray: { name: 'Reservoir', size: 4, hp: 2500, cost: { wood: 200, gold: 80 }, time: 40, sight: 4, civ: KHM_CIV, age: 2, baray: { r: 6, farm: 1.25 } }
});
BD.palace.train = BD.palace.train.concat('bal');
BUILD_ORDER.splice(BUILD_ORDER.indexOf('farm') + 1, 0, 'baray');   // Economy tab, after the farm
BD.barracks.train = BD.barracks.train.concat('kcart');
// Melaka-only units stay Melaka's; no guns or cannon for the Khmer
UD.sumpit.civ = 0; UD.pahlawan.civ = 0; UD.gunner.civ = [0, 3];
for (const k of ['musket', 'cannon']) if (UD[k]) UD[k].civ = [0, 1, 3];
// the archer line turns to crossbows, never guns (lore/khmer.md): bow, then Sna (light, fast), Heavy Sna (longest infantry
// range, slow reload), and the Golden Age's Royal Sna with still more range
Object.assign(UD, {
  sna: { name: 'Crossbowman', hp: 32, spd: 2.4, atk: 6, bonus: { spear: 3, elite: 3 }, rng: 6, rate: 1.3, ma: 0, pa: 0, sight: 8, cost: { wood: 30, gold: 35 }, time: 10, cls: 'archer', ranged: true, civ: KHM_CIV, age: 2, maxAge: 2 },
  heavysna: { name: 'Heavy Crossbowman', hp: 40, spd: 2.0, atk: 10, bonus: { spear: 3, elite: 4 }, rng: 7.5, rate: 2.4, ma: 0, pa: 1, sight: 8.5, cost: { wood: 40, gold: 45 }, time: 11, cls: 'archer', ranged: true, civ: KHM_CIV, age: 3, maxAge: 3 },
  elitesna: { name: 'Royal Crossbowman', hp: 44, spd: 2.0, atk: 12, bonus: { spear: 4, elite: 5 }, rng: 8.5, rate: 2.4, ma: 1, pa: 2, sight: 9, cost: { wood: 45, gold: 60 }, time: 12, cls: 'archer', ranged: true, civ: KHM_CIV, age: 4 }
});
{ const tr = BD.barracks.train, i = tr.indexOf('archer'); tr.splice(i + 1, 0, 'sna', 'heavysna', 'elitesna'); }
ARCHER_LINE[3] = ['archer', 'sna', 'heavysna', 'elitesna'];
// the bow is Age 1 only for the Khmer
const _kmTrainable = Game.prototype.trainable;
Game.prototype.trainable = function (kind, team) {
  const t = _kmTrainable.apply(this, arguments);
  if (t && CV(team) === KHM_CIV && this.teamAge(team) >= 2) { const i = t.indexOf('archer'); if (i >= 0) t.splice(i, 1); }
  return t;
};
// Laksamana's Guard (lore/khmer.md, unit-art/khmer-guard): Golden Age hired gunners from the Prasat, Malay and Cham in turn, 6 at most
UD.lguard = { name: "Laksamana's Guard", hp: 58, spd: 2.1, atk: 17, bonus: { sword: 3, elite: 7 }, rng: 6.5, rate: 2.6, ma: 1, pa: 2, sight: 8.5,
  cost: { wood: 40, gold: 160 }, time: 16, cls: 'archer', ranged: true, gun: true, age: 4, cap: 6, civ: KHM_CIV };
BD.palace.train.push('lguard');
{ const _add = Game.prototype.addUnit;
  Game.prototype.addUnit = function (kind, team) {
    const u = _add.apply(this, arguments);
    if (u && kind === 'lguard') { this.lgN = this.lgN || {}; const n = this.lgN[team] = (this.lgN[team] || 0) + 1; u.gk = n % 2 ? 'malay' : 'cham'; }
    return u;
  }; }
// villagers repair 25% faster, and towers, walls and gates near a Baray another 25%
{ const _rep = Game.prototype.doRepair;
  Game.prototype.doRepair = function (u, dt) {
    const b = this.byId.get(u.order.id), h0 = b ? b.hp : 0;
    _rep.apply(this, arguments);
    if (!b || CV(u.team) !== KHM_CIV || b.hp <= h0) return;
    const wallish = b.kind === 'tower' || (BD[b.kind] && BD[b.kind].wall);
    const nearBaray = wallish && this.buildings.some(o => o.kind === 'baray' && o.team === b.team && o.done && o.hp > 0 && Math.hypot(o.x - b.x, o.y - b.y) <= BD.baray.baray.r + 2);
    b.hp = Math.min(b.maxHp, b.hp + (b.hp - h0) * (nearBaray ? 0.5 : 0.25));
  }; }
// the Arogyasala: wounded units standing beside it heal slowly
{ const _ub = Game.prototype.updateBuilding;
  Game.prototype.updateBuilding = function (b, dt) {
    _ub.apply(this, arguments);
    if (b.kind !== 'rumahtabib' || CV(b.team) !== KHM_CIV || !b.done || b.hp <= 0) return;
    b.kacd = (b.kacd || 0) - dt; if (b.kacd > 0) return;
    b.kacd = 1; let n = 0;
    this.unitsNear(b.x, b.y, 2 + b.size, (o) => { if (n < 6 && this.canHeal(o, b.team) && rectDist(o.x, o.y, b.rect) <= 2) { n++; this.healOne(o, 1); } });
  }; }
// the Khmer column of the name table: [local name, button label]
Object.assign(KHMER, { names: {
  villager: ['Neak Srae'], keris: ['Neak Kheal', 'Kheal'], tombak: ['Neak Lompeng', 'Lompeng'], archer: ['Neak Thnu', 'Thnu'], sna: ['Sna'], heavysna: ['Sna Thom'], elitesna: ['Sna Reach'], lguard: ["Laksamana's Guard", 'Laksamana'], tabib: ['Vaidya'],
  bal: ['Damrei Sna', 'Damrei Sna'], kcart: ['Rotes Sna', 'Rotes Sna'],
  boat: ['Touk'], trade: ['Touk Ngo'], light: ['Touk Chambang'], galley: ['Touk Bayon'], frigate: ['Ballista Barge'], flagship: ['Naga Barge'],
  towncentre: ['Preah Reachea Veang'], house: ['Phteah'], farm: ['Srae'], granary: ['Chhang'], store: ['Khleang'], barracks: ['Banteay Kang'],
  port: ['Kampong'], tower: ['Prang'], rumahtabib: ['Arogyasala'], palace: ['Prasat'], tradepost: ['Psar'], baray: ['Baray'],
  palisade: ['Robang Chheu'], wall: ['Kampaeng'], gate: ['Tvear Nokor'], raft: ['Kboun Phleung']
}, roles: { keris: 'Shield Infantry', tombak: 'Spearman', archer: 'Archer', lguard: 'Hired Gunners', tabib: 'Physician', bal: 'Ballista Elephant', kcart: 'Cart Ballista', baray: 'Reservoir', tradepost: 'Market', trade: 'Trade Ship' } });
for (const k in KHMER.names) { const n = CIV_NAMES[k] || (CIV_NAMES[k] = [null, null, null, null]); while (n.length < 4) n.push(null); n[3] = KHMER.names[k]; }
for (const k in KHMER.roles) { const r = CIV_ROLE[k] || (CIV_ROLE[k] = [null, null, null, null]); while (r.length < 4) r.push(null); r[3] = KHMER.roles[k]; }
['Phum', 'Srok', 'Nokor', 'Moha Nokor'].forEach((n, i) => { AGE_TABLE[i + 1].local[3] = n; });
FIRE_ARROWS.local[3] = 'Sna Phleung';
// a weak, river navy: the Touk Ngo is an unarmed river trader and earns like Ayutthaya's
UD.trade.civAtk[3] = 0; TRADE.civ[3] = 1;
Object.assign(BRIEF, { sna: 'Light, fast crossbow', heavysna: 'Longest-range foot archer, slow reload', elitesna: 'Golden Age crossbow, longer range still',
  lguard: 'Hired Malay and Cham gunners, six at most', baray: 'Farms nearby gather 25% faster' });
Object.assign(ENCY_UNITS, {
  sna: 'Khmer crossbowman from the Kingdom Age: light and quick to shoot. Strong against spearmen, weak when swords reach it.',
  heavysna: 'From the Age of Commerce: a heavy crossbow with the longest range of any foot soldier, but slow to reload.',
  elitesna: 'Golden Age royal crossbowmen: heavy bolts and even more range. The Khmer never take up the matchlock.',
  lguard: 'Golden Age hired gunners trained at the Prasat for a lot of gold, Malay and Cham in turn: the only guns the Khmer have. Six at most.'
});
// stone and laterite: towers, walls and gates +20% hp
for (const k of ['tower', 'wall', 'gate']) { const h = BD[k].civHp; if (h) h[3] = Math.round(h[0] * 1.2); }
// the Baray: farms near it gather faster
const _kmGather = Game.prototype.gatherInfo;
Game.prototype.gatherInfo = function (o) {
  const g = _kmGather.apply(this, arguments);
  if (g && o && o.isBld && FIELD[o.kind] && CV(o.team) === KHM_CIV && this.buildings.some(b => b.kind === 'baray' && b.team === o.team && b.done && b.hp > 0 && Math.hypot(b.x - o.x, b.y - o.y) <= BD.baray.baray.r + 2)) g.rate *= BD.baray.baray.farm;
  return g;
};
// ---------- Khmer looks ----------
/* art book soldiers (lore/scenes/units-khmer.js) and the hired gunners (lore/scenes/units-guard.js), kept in their own scope */
const KMU_ART = (() => {
/* Khmer unit sprites, in the game's style (same sprite(), auto outline, LEGS, palette).
   Runs inside the game page after art.js. Look from the Bayon and Angkor Wat reliefs:
   bare-chested soldiers in a short blue sampot, gold armbands, bare feet, lotus-petal
   helmets, pointed crowns or hair buns.
   kmUnit(kind, anim, f): anim 'idle' (f 0) or 'attack' (f 0, 1, 2); 'walk' f 0..3 also works for people.
     16x18: shield, spear, archer, sna, heavysna, vaidya
     32x32: ballista (Ballista Elephant)      30x20: cart (Cart Ballista) */
const KMU = { main: '#2f6fd0', dark: '#1c4590', trim: '#f2c94c' };
const KMU_GOLD = (typeof GOLD !== 'undefined') ? GOLD : '#e8b830', KMU_GOLD_D = (typeof GOLD_D !== 'undefined') ? GOLD_D : '#a87a1c';
const KMU_QUILT = '#3a7ad8', KMU_SAFF = '#e0902a', KMU_SAFF_D = '#b86c1a', KMU_WHITE = '#f1ece0', KMU_WHITE_D = '#cfc6b0';
const KMU_STRING = '#d8d0b0', KMU_SHAFT = '#c8b088';
const KMU_BOW = '#b8823e';
const KMU_ELE = '#8e9198', KMU_ELE_D = '#6c6f77', KMU_ELE_L = '#aeb1b8', KMU_IVORY = '#f4ecd4';
const KMU_DIMS = { ballista: [32, 32], cart: [30, 20] };

function kmUnit(kind, anim, f) {
  f = f || 0;
  const d = KMU_DIMS[kind];
  if (kind === 'ballista') return sprite(`kmu|${kind}|${anim}|${f}`, d[0], d[1], 2, (P) => kmuElephant(P, anim, f));
  if (kind === 'cart') return sprite(`kmu|${kind}|${anim}|${f}`, d[0], d[1], 2, (P) => kmuCart(P, anim, f));
  return sprite(`kmu|${kind}|${anim}|${f}`, 16, 18, 2, (P) => kmuPerson(P, kind, anim, f));
}

function kmuPerson(P, kind, anim, f) {
  const T = KMU, walk = anim === 'walk', atk = anim === 'attack';
  const bob = (walk && (f === 1 || f === 3)) ? -1 : 0;
  const B = (x, y, w, h, c) => P.r(x, y + 2 + bob, w, h, c);
  const S = (x, y, w, h, c) => P.r(x, y + 2, w, h, c);
  const vd = kind === 'vaidya', hv = kind === 'heavysna';

  // bare legs and feet
  const L = LEGS[walk ? f : 1];
  for (const l of L) { S(l[0], l[1], l[2], l[3], SKIN); S(l[0], l[1] + l[3] - 1, l[2], 1, SKIN_D); }

  // quiver for the archer, bolt case for the crossbowmen
  if (kind === 'archer') { B(3, 5, 2, 6, WOOD_D); B(3, 4, 1, 1, KMU_WHITE); B(4, 3, 1, 2, T.main); B(4, 10, 1, 1, KMU_GOLD); }
  if (kind === 'sna' || hv) { B(3, 7, 2, 4, WOOD_D); B(3, 6, 2, 1, KMU_SHAFT); B(3, 9, 2, 1, T.dark); }

  // torso
  if (vd) {
    // saffron robe to the shins, white cloth over one shoulder
    B(5, 7, 6, 3, SKIN); B(5, 9, 6, 1, SKIN_D);
    B(5, 10, 6, 4, KMU_SAFF); B(5, 10, 6, 1, KMU_SAFF_D); B(7, 12, 1, 2, KMU_SAFF_D);
    B(5, 7, 2, 1, KMU_WHITE); B(6, 8, 2, 1, KMU_WHITE); B(7, 9, 2, 1, KMU_WHITE); B(8, 10, 3, 1, KMU_WHITE); B(10, 11, 1, 2, KMU_WHITE_D);
  } else if (hv) {
    // quilted blue tunic with stitch pattern, sampot below
    B(4, 7, 8, 4, KMU_QUILT); B(4, 7, 8, 1, T.main);
    for (let y = 8; y < 11; y++) for (let x = 4 + (y % 2); x < 12; x += 2) B(x, y, 1, 1, T.dark);
    B(4, 10, 8, 1, KMU_GOLD); B(5, 11, 6, 1, T.main); B(7, 12, 2, 1, T.dark);
  } else {
    // bare chest, gold collar for officers, blue sampot with gold belt and front drape
    B(5, 7, 6, 3, SKIN); B(5, 9, 6, 1, SKIN_D);
    if (kind === 'shield') B(7, 7, 3, 1, KMU_GOLD);
    B(5, 10, 6, 2, T.main); B(5, 10, 6, 1, KMU_GOLD); B(6, 11, 1, 1, T.dark); B(9, 11, 1, 1, T.dark);
    B(7, 12, 2, 1, T.dark);
  }
  if (kind === 'archer') { B(5, 7, 1, 1, WOOD_D); B(6, 8, 1, 1, WOOD_D); B(7, 9, 1, 1, WOOD_D); }

  // arms with gold armbands
  const ax0 = hv ? 3 : 4, ax1 = hv ? 12 : 11, sleeve = hv ? KMU_QUILT : SKIN;
  const reach = atk && f === 1 && (kind === 'shield' || vd);
  B(ax0, 8, 1, 3, sleeve);
  if (reach) { B(ax1, 8, 3, 1, SKIN); } else B(ax1, 8, 1, 3, sleeve);
  if (!vd) { B(ax0, 8, 1, 1, KMU_GOLD); B(ax1, 8, 1, 1, KMU_GOLD); }
  if (hv) { B(ax0, 10, 1, 1, SKIN); B(ax1, 10, 1, 1, SKIN); }

  // head
  B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR);
  // headgear
  if (kind === 'shield') {
    // pointed gold helmet-crown (mukuta) with a blue jewel
    B(5, 3, 6, 1, KMU_GOLD); B(6, 2, 4, 1, KMU_GOLD); B(6, 1, 4, 1, KMU_GOLD_D); B(7, 0, 2, 1, KMU_GOLD); B(7, -1, 1, 1, KMU_GOLD);
    B(7, 2, 2, 1, T.main); B(5, 4, 1, 1, HAIR);
  } else if (kind === 'spear') {
    // lotus-petal helmet: three gold petals over a band
    B(5, 3, 6, 1, KMU_GOLD_D); B(6, 2, 4, 1, KMU_GOLD);
    B(5, 1, 1, 2, KMU_GOLD); B(7, 0, 2, 2, KMU_GOLD); B(10, 1, 1, 2, KMU_GOLD); B(8, 0, 1, 1, KMU_GOLD_D); B(5, 4, 1, 1, HAIR);
  } else if (kind === 'archer') {
    // hair tied in a bun at the back with a blue headband and a white flower
    B(6, 2, 4, 1, HAIR); B(5, 3, 6, 1, T.main); B(4, 1, 3, 2, HAIR); B(4, 1, 1, 1, KMU_WHITE); B(5, 4, 1, 1, HAIR);
  } else if (kind === 'sna') {
    // small blue cloth cap, bun showing behind
    B(5, 2, 6, 2, T.main); B(5, 3, 6, 1, T.dark); B(6, 2, 1, 1, KMU_GOLD); B(3, 2, 2, 2, HAIR); B(5, 4, 1, 1, HAIR);
  } else if (hv) {
    // tall dark-blue cone helmet with a gold band and finial
    B(5, 2, 6, 2, T.dark); B(5, 3, 6, 1, KMU_GOLD); B(6, 1, 4, 1, T.dark); B(7, 0, 2, 1, T.main); B(7, -1, 2, 1, KMU_GOLD); B(4, 3, 1, 2, T.dark);
  } else if (vd) {
    // Brahmin's high chignon bound with white cloth
    B(6, 2, 4, 1, HAIR); B(7, 0, 2, 2, HAIR); B(7, 1, 2, 1, KMU_WHITE); B(5, 3, 1, 2, HAIR);
  }

  // weapons and tools
  if (kind === 'shield') {
    // short straight blade
    if (!atk || f === 2) { B(12, 5, 1, 4, STEEL); B(13, 5, 1, 4, STEEL_D); B(12, 4, 1, 1, STEEL); B(11, 9, 3, 1, KMU_GOLD); B(12, 10, 1, 1, WOOD_D); }
    else if (f === 0) { B(12, 2, 1, 5, STEEL); B(13, 2, 1, 5, STEEL_D); B(12, 1, 1, 1, STEEL); B(11, 7, 3, 1, KMU_GOLD); }
    else { B(14, 8, 2, 1, STEEL); B(14, 9, 1, 1, STEEL_D); B(13, 7, 1, 3, KMU_GOLD); }
    // TALL oblong shield covering the left side, gold rim, rib and boss
    const sx = (atk && f === 1) ? 2 : 1, top = 3, h = 12;
    B(sx + 1, top, 4, 1, KMU_GOLD); B(sx, top + 1, 6, h - 2, T.main); B(sx + 1, top + h - 1, 4, 1, KMU_GOLD);
    B(sx, top + 1, 1, h - 2, T.dark); B(sx + 5, top + 1, 1, h - 2, T.dark);
    B(sx + 2, top + 2, 1, h - 4, '#5a93ea');
    B(sx + 2, top + 4, 2, 3, KMU_GOLD); B(sx + 3, top + 5, 1, 1, KMU_GOLD_D); B(sx + 1, top + 5, 1, 1, KMU_GOLD); B(sx + 4, top + 5, 1, 1, KMU_GOLD);
    B(sx + 2, top + 1, 2, 1, KMU_GOLD_D); B(sx + 2, top + h - 2, 2, 1, KMU_GOLD_D);
  } else if (kind === 'spear') {
    // small round shield on the left arm
    disc({ r: B }, 4, 10, 2, T.main); disc({ r: B }, 4, 10, 1, T.dark); B(4, 10, 1, 1, KMU_GOLD); B(3, 8, 2, 1, '#4f8ae6');
    // long spear with a blue pennon under the head
    if (!atk || f === 2) { S(12, 0, 1, 16, WOOD); S(12, -1, 1, 2, STEEL); S(13, 2, 2, 1, T.main); S(13, 3, 1, 1, T.main); }
    else if (f === 0) { B(6, 9, 8, 1, WOOD); B(14, 9, 1, 1, STEEL); B(9, 8, 2, 1, T.main); }
    else { B(8, 9, 7, 1, WOOD); B(15, 9, 1, 1, STEEL); B(11, 8, 2, 1, T.main); }
  } else if (kind === 'archer') {
    B(13, 4, 1, 1, WOOD); B(14, 5, 1, 8, WOOD); B(13, 13, 1, 1, WOOD); B(14, 8, 1, 2, KMU_GOLD_D);
    if (atk && f === 0) { B(9, 9, 5, 1, WOOD); B(13, 5, 1, 8, KMU_STRING); B(14, 9, 1, 1, STEEL); B(11, 9, 1, 1, SKIN); }
    else if (atk && f === 1) { B(13, 5, 1, 8, KMU_STRING); B(15, 8, 1, 1, STEEL); }
    else B(13, 5, 1, 8, KMU_STRING);
  } else if (kind === 'sna') {
    // light crossbow: carried upright, levelled at the chest to shoot fast
    if (!atk) { B(11, 5, 1, 7, WOOD); B(10, 5, 3, 1, WOOD_D); B(9, 6, 1, 1, WOOD_D); B(13, 6, 1, 1, WOOD_D); }
    else {
      B(8, 9, 6, 1, WOOD); B(13, 7, 1, 5, WOOD_D); B(12, 7, 1, 1, WOOD_D); B(12, 11, 1, 1, WOOD_D); B(10, 10, 1, 1, WOOD_D);
      if (f === 0) { B(11, 8, 1, 3, KMU_STRING); B(10, 9, 1, 1, KMU_STRING); B(10, 8, 4, 1, KMU_SHAFT); B(14, 8, 1, 1, STEEL); }
      else if (f === 1) { B(12, 8, 1, 3, KMU_STRING); B(14, 8, 2, 1, KMU_SHAFT); B(15, 8, 1, 1, STEEL); }
      else { B(10, 8, 1, 3, KMU_STRING); B(12, 8, 1, 1, SKIN); B(9, 8, 3, 1, KMU_SHAFT); }
    }
  } else if (hv) {
    // heavy crossbow with a wide bow, braced on the hip over a forked rest
    if (!atk) {
      B(13, 0, 1, 11, WOOD); B(13, 11, 1, 1, WOOD_D);
      B(10, 1, 7, 1, WOOD_D); B(10, 2, 1, 1, WOOD_D); B(16, 2, 1, 1, WOOD_D); B(11, 2, 5, 1, KMU_STRING); B(13, 1, 1, 1, STEEL_D);
    } else {
      S(13, 10, 1, 6, WOOD_D); S(12, 10, 1, 1, WOOD_D); S(14, 10, 1, 1, WOOD_D);             // the rest
      B(7, 9, 8, 1, WOOD); B(6, 10, 2, 1, WOOD_D); B(10, 9, 1, 2, STEEL_D);                    // stock and trigger
      B(15, 4, 1, 11, WOOD_D); B(14, 4, 1, 1, WOOD_D); B(14, 14, 1, 1, WOOD_D); B(15, 9, 1, 1, KMU_GOLD_D);
      if (f === 0) { B(14, 5, 1, 4, KMU_STRING); B(14, 10, 1, 4, KMU_STRING); B(11, 9, 3, 1, KMU_STRING); B(9, 8, 6, 1, KMU_SHAFT); B(15, 8, 1, 1, STEEL); }
      else if (f === 1) { B(14, 5, 1, 9, KMU_STRING); B(13, 8, 1, 1, '#e0e0e0'); }
      else { B(12, 5, 1, 3, KMU_STRING); B(12, 10, 1, 4, KMU_STRING); B(11, 8, 1, 3, KMU_STRING); B(12, 8, 1, 2, SKIN); }
    }
  } else if (vd) {
    // bowl of herbal medicine; raised, steaming and with a green cross when healing
    if (atk) {
      B(13, 8, 3, 1, '#8a5a3a'); B(13, 7, 3, 1, '#5a9a3a'); B(14, 6, 1, 1, '#7ac84a');
      if (f === 1) { B(13, 5, 1, 1, '#d8e8d0'); B(14, 4, 1, 1, '#d8e8d0'); }
      if (f >= 1) { B(13, 0, 1, 3, '#7dffa8'); B(12, 1, 3, 1, '#7dffa8'); }
    } else { B(11, 11, 3, 1, '#8a5a3a'); B(11, 10, 3, 1, '#5a9a3a'); B(12, 9, 1, 1, '#7ac84a'); }
    if (atk && f !== 1) { B(11, 8, 2, 1, SKIN); B(12, 8, 1, 1, SKIN); }
  }
}

// Double-bow crossbow: two bows one behind the other on a long stock. y = stock row.
// Each bow is an arc with its tips bent back; the string runs to the nock (drawn) or straight across (shot).
function kmuDoubleBow(P, x0, x1, y, b1, b2, half, state) {
  const r = P.r;
  r(x0, y, x1 - x0, 1, WOOD); r(x0, y + 1, x1 - x0, 1, WOOD_D);
  for (const bx of [b1, b2]) {
    for (let i = -half; i <= half + 1; i++) {
      const k = i <= 0 ? -i : i - 1, off = Math.round(2 * k * k / (half * half));
      r(bx - off, y + i, 1, 1, k === half ? KMU_GOLD : KMU_BOW); if (k < half - 1) r(bx - off + 1, y + i, 1, 1, WOOD_D);
    }
    if (state === 'shot') r(bx - 3, y - half + 1, 1, half * 2, KMU_STRING);
    else for (let i = 1; i < half; i++) { const sx = bx - 2 - Math.round(3 * (half - i) / half); r(sx, y - i, 1, 1, KMU_STRING); r(sx, y + 1 + i, 1, 1, KMU_STRING); }
  }
  if (state === 'loaded') { r(b1 - 5, y - 1, x1 - b1 + 6, 1, KMU_SHAFT); r(x1 + 1, y - 1, 2, 1, STEEL); r(x1 + 3, y - 1, 1, 1, STEEL_D); r(b1 - 6, y - 2, 2, 1, KMU_FLETCH); }
  if (state === 'reload') { r(x0 + 1, y - 1, 5, 1, KMU_SHAFT); r(x0, y - 2, 2, 1, KMU_FLETCH); }
}
const KMU_FLETCH = '#f4ecd4';

function kmuCrew(P, x, y, hat) {   // small seated/standing figure: head at y, body below
  const r = P.r;
  r(x, y, 2, 2, SKIN); r(x + 1, y + 1, 1, 1, SKIN_D);
  if (hat === 'bun') { r(x, y - 1, 2, 1, HAIR); r(x - 1, y - 1, 1, 1, HAIR); }
  else { r(x - 1, y - 1, 4, 1, KMU_GOLD); r(x, y - 2, 2, 1, KMU_GOLD); }
  r(x, y + 2, 2, 2, SKIN); r(x, y + 2, 1, 1, KMU_GOLD);
}

function kmuElephant(P, anim, f) {
  const r = P.r, T = KMU, atk = anim === 'attack';
  // tail
  r(4, 15, 1, 6, KMU_ELE_D); r(3, 20, 2, 2, '#4a4c52');
  // far legs (darker)
  r(9, 23, 3, 7, KMU_ELE_D); r(21, 23, 3, 7, KMU_ELE_D);
  // body
  for (let y = 11; y <= 24; y++) {
    const t = (y - 17.5) / 7, hw = Math.round(10 * Math.sqrt(Math.max(0, 1 - t * t)));
    r(15 - hw, y, hw * 2 + 1, 1, y > 21 ? KMU_ELE_D : KMU_ELE);
  }
  // near legs with toenails
  r(6, 22, 4, 8, KMU_ELE); r(18, 22, 4, 8, KMU_ELE);
  r(6, 22, 1, 8, KMU_ELE_D); r(18, 22, 1, 8, KMU_ELE_D);
  for (const x of [6, 9, 18, 21]) { r(x, 30, 1, 1, KMU_IVORY); }
  r(10, 29, 2, 1, KMU_ELE_D); r(22, 29, 2, 1, KMU_ELE_D);
  // head, ear, trunk, tusk, eye
  disc(P, 25, 15, 4, KMU_ELE); r(24, 11, 3, 1, KMU_ELE_L);
  r(26, 17, 3, 4, KMU_ELE); r(27, 21, 2, 3, KMU_ELE); r(28, 24, 2, 3, KMU_ELE); r(29, 27, 1, 2, KMU_ELE); r(28, 28, 1, 1, KMU_ELE_L);
  r(27, 18, 1, 1, KMU_ELE_D); r(28, 21, 1, 1, KMU_ELE_D); r(29, 24, 1, 1, KMU_ELE_D);
  r(20, 12, 4, 8, KMU_ELE_D); r(20, 12, 4, 1, KMU_ELE); r(23, 13, 1, 6, KMU_ELE_L);
  r(25, 19, 4, 1, KMU_IVORY); r(29, 18, 1, 1, KMU_IVORY);
  r(26, 14, 1, 1, '#1a1a1a');
  // gold headpiece with a blue jewel
  r(23, 11, 5, 1, KMU_GOLD); r(25, 12, 1, 2, T.main); r(28, 12, 1, 1, KMU_GOLD);
  // blue caparison with gold border and fringe
  r(8, 13, 12, 8, T.main); r(8, 13, 12, 1, T.dark); r(8, 19, 12, 1, KMU_GOLD);
  for (let x = 8; x < 20; x += 2) r(x, 20, 1, 1, KMU_GOLD_D);
  for (const x of [10, 14, 18]) { r(x, 15, 1, 1, KMU_GOLD); r(x - 1, 16, 3, 1, KMU_GOLD); r(x, 17, 1, 1, KMU_GOLD); }
  // platform and the ballista frame
  r(7, 10, 15, 2, WOOD); r(7, 11, 15, 1, WOOD_D); r(14, 8, 3, 2, WOOD_D); r(15, 7, 1, 1, WOOD_D); r(9, 7, 1, 3, WOOD_D);
  const state = !atk ? 'loaded' : f === 1 ? 'shot' : f === 2 ? 'reload' : 'loaded';
  // crewman at the trigger, behind the frame
  kmuCrew(P, 6, 4, 'bun'); r(6, 8, 2, 2, T.main);
  if (atk && f !== 2) r(8, 6, 2, 1, SKIN); else r(8, 7, 1, 1, SKIN);
  kmuDoubleBow(P, 8, 22, 5, 14, 19, 4, state);
  // mahout on the neck with the hook
  kmuCrew(P, 22, 7, 'crown'); r(21, 11, 3, 1, T.main); r(22, 12, 1, 2, SKIN);
  r(24, 9, 1, 3, WOOD_D); r(25, 9, 1, 1, STEEL);
  // the bolt in flight
  if (state === 'shot') { r(25, 3, 4, 1, KMU_SHAFT); r(29, 3, 2, 1, STEEL); r(24, 2, 1, 1, KMU_FLETCH); r(24, 4, 1, 1, KMU_FLETCH); }
}

function kmuCart(P, anim, f) {
  const r = P.r, T = KMU, atk = anim === 'attack';
  // shafts and the front rest (lowered when deployed)
  r(21, 11, 6, 1, WOOD_D); r(27, 12, 2, 1, WOOD_D);
  if (atk) { r(22, 12, 1, 6, WOOD_D); r(21, 17, 3, 1, WOOD_D); }
  // pennant on the rear pole, streaming back
  r(3, 0, 1, 9, WOOD_D); r(0, 0, 3, 1, T.main); r(1, 1, 2, 1, T.main); r(2, 2, 1, 1, T.dark); r(2, 0, 1, 1, KMU_GOLD);
  // cart bed with a blue cloth along the side
  r(2, 8, 21, 1, WOOD_D); r(2, 9, 21, 3, WOOD); for (let x = 4; x < 22; x += 3) r(x, 9, 1, 3, WOOD_D);
  r(3, 11, 19, 2, T.main); r(3, 12, 19, 1, KMU_GOLD); for (let x = 4; x < 22; x += 3) r(x, 13, 1, 1, KMU_GOLD_D);
  // crossbow posts and the double-bow crossbow
  r(14, 6, 3, 2, WOOD_D);
  const state = !atk ? 'loaded' : f === 1 ? 'shot' : f === 2 ? 'reload' : 'loaded';
  kmuDoubleBow(P, 7, 22, 4, 13, 18, 3, state);
  // crewman standing at the back of the cart
  kmuCrew(P, 4, 2, 'bun'); r(4, 6, 2, 1, T.main); r(4, 7, 1, 1, SKIN); r(5, 7, 1, 1, SKIN);
  if (atk && f !== 2) r(6, 4, 2, 1, SKIN); else r(6, 5, 1, 1, SKIN);
  // big spoked wheel
  disc(P, 12, 14, 5, WOOD_D); disc(P, 12, 14, 4, WOOD);
  r(12, 10, 1, 9, WOOD_D); r(8, 14, 9, 1, WOOD_D); r(9, 11, 1, 1, WOOD_D); r(10, 12, 1, 1, WOOD_D); r(14, 16, 1, 1, WOOD_D); r(15, 17, 1, 1, WOOD_D);
  r(15, 11, 1, 1, WOOD_D); r(14, 12, 1, 1, WOOD_D); r(10, 16, 1, 1, WOOD_D); r(9, 17, 1, 1, WOOD_D);
  r(11, 13, 3, 3, WOOD_D); r(12, 14, 1, 1, KMU_GOLD);
  if (state === 'shot') { r(24, 3, 3, 1, KMU_SHAFT); r(27, 3, 2, 1, STEEL); r(23, 2, 1, 1, KMU_FLETCH); r(23, 4, 1, 1, KMU_FLETCH); }
}

if (typeof window !== 'undefined') window.kmUnit = kmUnit;

/* Khmer hired gunners (lore/khmer.md, "Hired guns"), in the game's style (sprite(), auto outline, LEGS, palette).
   Runs inside the game page after art.js.
   guardUnit(kind, anim, f): anim 'idle' (f 0) or 'attack' (f 0, 1, 2), 16x18.
     Option 3 (chosen): malay, cham     Option 2 (for comparison): portuguese, spanish, japanese
   Each wears a small Khmer-blue mark (sash, band or tassel) to show whose service they are in. */
const GDU = { main: '#2f6fd0', dark: '#1c4590' };
const GDU_MET = '#4a4a52', GDU_MET_L = '#6a6a74', GDU_RED = '#c0392b', GDU_FLASH = '#f6d04a', GDU_FLASH_L = '#fff3a0';
const GDU_SMOKE = '#c8c8c8', GDU_SMOKE_L = '#e0e0e0', GDU_WH = '#f1ece0', GDU_WH_D = '#cfc6b2';
const GDU_GOLD = (typeof GOLD !== 'undefined') ? GOLD : '#e8b830';

function guardUnit(kind, anim, f) {
  f = f | 0; anim = anim || 'idle';
  return sprite(`gdu|${kind}|${anim}|${f}`, 16, 18, 2, (P) => gduPerson(P, kind, anim, f));
}

function gduPerson(P, kind, anim, f) {
  const walk = anim === 'walk', atk = anim === 'attack';
  const bob = (walk && (f === 1 || f === 3)) ? -1 : 0;
  const B = (x, y, w, h, c) => P.r(x, y + 2 + bob, w, h, c);
  const S = (x, y, w, h, c) => P.r(x, y + 2, w, h, c);
  const eur = kind === 'portuguese' || kind === 'spanish', jp = kind === 'japanese';

  // ---- legs
  for (const [x, y, w, h] of LEGS[walk ? f : 1]) {
    if (eur) { S(x, y, w, h, kind === 'spanish' ? '#5a3a2a' : '#2a2228'); S(x, y + h - 1, w, 1, '#1a1410'); }
    else if (jp) { S(x, y, w, h, '#2c3450'); S(x, y + h - 1, w, 1, '#d8ccb0'); }          // hakama, tabi
    else if (kind === 'malay') { S(x, y, w, h, '#2a2a3a'); S(x, y + h - 1, w, 1, SKIN_D); } // seluar
    else { S(x, y, w, h, SKIN); S(x, y + h - 1, w, 1, SKIN_D); }                           // Cham: bare shins under sarong
  }

  // ---- body
  if (kind === 'portuguese') {
    // steel breastplate, white collar, slashed breeches, blue sash
    B(5, 7, 6, 3, STEEL); B(5, 7, 6, 1, '#f4f8fc'); B(7, 8, 1, 2, STEEL_D); B(6, 6, 4, 1, GDU_WH);
    B(10, 7, 1, 1, GDU.main); B(9, 8, 1, 1, GDU.main); B(8, 9, 1, 1, GDU.main); B(7, 10, 1, 1, GDU.main);
    B(4, 10, 8, 2, '#4a3a2a'); B(5, 10, 1, 2, '#c8a050'); B(8, 10, 1, 2, '#c8a050'); B(10, 10, 1, 2, '#c8a050');
  } else if (kind === 'spanish') {
    // buff leather coat with a red cross-sash of the Spanish crown, blue band at the waist
    B(5, 7, 6, 3, '#c8a468'); B(5, 7, 6, 1, '#dcbc84'); B(8, 8, 1, 2, '#a8844c'); B(6, 6, 4, 1, GDU_WH);
    B(5, 7, 1, 1, GDU_RED); B(6, 8, 1, 1, GDU_RED); B(7, 9, 1, 1, GDU_RED);
    B(5, 10, 6, 1, GDU.main); B(4, 11, 8, 1, '#7a5a3a'); B(5, 11, 1, 1, '#5a3a2a'); B(10, 11, 1, 1, '#5a3a2a');
  } else if (jp) {
    // dark kosode crossed at the neck, blue obi, wide hakama
    B(5, 7, 6, 3, '#3a3a4a'); B(6, 7, 1, 1, GDU_WH); B(7, 8, 1, 1, GDU_WH); B(9, 7, 1, 1, GDU_WH);
    B(5, 10, 6, 1, GDU.main); B(4, 11, 8, 1, '#2c3450'); B(6, 11, 1, 1, '#3e4868'); B(9, 11, 1, 1, '#3e4868');
  } else if (kind === 'malay') {
    // baju (short jacket) in cream, blue songket sampin over the trousers, kris at the waist
    B(5, 7, 6, 3, '#e8dcc0'); B(5, 7, 6, 1, '#f4ecd8'); B(7, 7, 2, 1, SKIN); B(8, 8, 1, 2, '#c8bca0');
    B(4, 10, 8, 2, GDU.main); B(5, 10, 1, 1, GDU_GOLD); B(8, 11, 1, 1, GDU_GOLD); B(10, 10, 1, 1, GDU_GOLD);
    B(6, 9, 1, 2, '#5a3a20'); B(5, 9, 1, 1, GDU_GOLD);
  } else {
    // Cham: open dark-red jacket over a white shirt, checked sarong, blue cloth belt
    B(5, 7, 6, 3, '#8a2a2a'); B(7, 7, 2, 3, GDU_WH); B(5, 7, 6, 1, '#a83a3a'); B(7, 7, 2, 1, GDU_WH);
    B(4, 10, 8, 2, '#6a3a5a'); B(5, 11, 1, 1, '#9a5a7a'); B(7, 10, 1, 1, '#9a5a7a'); B(9, 11, 1, 1, '#9a5a7a'); B(11, 10, 1, 1, '#9a5a7a');
    B(5, 10, 6, 1, GDU.main);
  }

  // ---- arms
  const sleeve = kind === 'portuguese' ? STEEL_D : kind === 'spanish' ? '#c8a468' : jp ? '#3a3a4a'
    : kind === 'malay' ? '#e8dcc0' : '#8a2a2a';
  B(4, 8, 1, 3, sleeve); B(4, 11, 1, 1, SKIN);
  if (!atk) { B(11, 8, 1, 3, sleeve); B(11, 11, 1, 1, SKIN); }

  // ---- head
  B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR);
  if (eur) { B(6, 6, 4, 1, '#5a3a20'); B(9, 6, 1, 1, '#5a3a20'); B(6, 5, 1, 1, '#5a3a20'); }   // beard

  // ---- headgear
  if (kind === 'portuguese') {
    // morion: curved brim, tall comb
    B(4, 3, 8, 1, STEEL_D); B(3, 2, 1, 1, STEEL_D); B(12, 2, 1, 1, STEEL_D);
    B(5, 1, 6, 2, STEEL); B(6, 0, 4, 1, STEEL); B(7, -1, 2, 1, STEEL_D); B(6, 1, 1, 1, '#f4f8fc');
  } else if (kind === 'spanish') {
    // cabasset: pear-shaped helmet with a narrow flat brim and a little stalk, red plume
    B(5, 3, 6, 1, STEEL_D); B(6, 1, 4, 2, STEEL); B(7, 0, 2, 1, STEEL); B(8, -1, 1, 1, STEEL_D);
    B(6, 1, 1, 1, '#f4f8fc'); B(9, 0, 1, 1, GDU_RED); B(10, -1, 1, 1, GDU_RED);
  } else if (jp) {
    // jingasa: wide shallow conical lacquered hat, blue mon, chin cord
    B(3, 3, 10, 1, '#2a2226'); B(4, 2, 8, 1, '#3a3036'); B(6, 1, 4, 1, '#3a3036'); B(7, 0, 2, 1, '#2a2226');
    B(7, 2, 2, 1, GDU.main); B(6, 4, 1, 2, HAIR); B(9, 6, 1, 1, '#c8a050');
  } else if (kind === 'malay') {
    // tengkolok: folded blue-and-gold headcloth with a peak
    B(5, 2, 6, 2, GDU.dark); B(5, 3, 6, 1, GDU_GOLD); B(9, 1, 2, 1, GDU.dark); B(10, 0, 1, 1, GDU.main);
  } else {
    // Cham: white wrapped turban with a tail, blue tassel
    B(5, 2, 6, 2, GDU_WH); B(5, 3, 6, 1, GDU_WH_D); B(6, 1, 4, 1, GDU_WH); B(4, 3, 1, 2, GDU_WH_D); B(3, 4, 1, 2, GDU.main);
  }

  // ---- matchlock (Europeans carry the long arquebus on a forked rest; the rest a lighter gun)
  if (eur) {
    if (!atk || f === 2) {
      B(12, -3, 1, 12, GDU_MET); B(12, 8, 1, 3, WOOD); B(13, 6, 1, 1, GDU_RED);
      B(14, 0, 1, 12, WOOD_D); B(13, -1, 1, 1, WOOD_D); B(15, -1, 1, 1, WOOD_D);
      if (atk) { B(13, -4, 2, 1, GDU_SMOKE); B(14, -5, 1, 1, GDU_SMOKE_L); }
    } else {
      B(4, 7, 11, 1, GDU_MET); B(4, 6, 1, 1, GDU_MET_L); B(3, 7, 2, 2, WOOD); B(8, 8, 1, 1, GDU_RED); B(11, 8, 1, 1, SKIN);
      B(13, 8, 1, 5, WOOD_D);
      if (f === 1) { B(15, 6, 1, 3, GDU_FLASH); B(15, 7, 1, 1, GDU_FLASH_L); B(13, 4, 2, 1, GDU_SMOKE); B(14, 3, 2, 1, GDU_SMOKE_L); }
    }
  } else {
    const stock = jp ? '#6a2a1a' : WOOD;   // tanegashima: red-lacquered stock
    if (!atk || f === 2) {
      B(12, -1, 1, 10, GDU_MET); B(12, 8, 1, 3, stock); B(13, 6, 1, 1, GDU_RED);
      if (atk) { B(13, -2, 2, 1, GDU_SMOKE); B(14, -3, 1, 1, GDU_SMOKE_L); }
    } else {
      B(6, 8, 9, 1, GDU_MET); B(6, 7, 1, 1, GDU_MET_L); B(5, 8, 2, 2, stock); B(9, 9, 1, 1, GDU_RED); B(11, 9, 1, 1, SKIN);
      if (f === 1) { B(15, 7, 1, 3, GDU_FLASH); B(15, 8, 1, 1, GDU_FLASH_L); B(13, 5, 2, 1, GDU_SMOKE); B(14, 4, 2, 1, GDU_SMOKE_L); }
    }
  }
}

  return { kmUnit, guardUnit };
})();
// game kind -> art book kind; the villager keeps the KMART drawing (kmUnit has none)
const KMU_KIND = { keris: 'shield', tombak: 'spear', archer: 'archer', sna: 'sna', heavysna: 'heavysna', elitesna: 'heavysna', tabib: 'vaidya', bal: 'ballista', kcart: 'cart' };
let kmCur = null;
{ const _pu = paintUnit; paintUnit = function (u) { kmCur = u; try { return _pu.apply(this, arguments); } finally { kmCur = null; } }; }
const KM_UNIT = { villager: 'villager' };
const _kmUnitSprite = unitSprite;
unitSprite = function (kind, team, anim, f, tool) {
  if (CV(team) === KHM_CIV) {
    // at work (chopping, mining, farming, building) villagers swing their tool (axe, pick, hoe or hammer)
    const a = anim === 'work' ? (kind === 'villager' ? 'work' : 'idle') : anim, ff = anim === 'walk' ? f : Math.min(2, f);
    if (KM_UNIT[kind]) return KMART.khmerUnitSprite(KM_UNIT[kind], a, ff, a === 'work' ? tool : '');
    const ak = a === 'heal' ? 'attack' : a === 'work' ? 'idle' : a;
    if (KMU_KIND[kind]) return KMU_ART.kmUnit(KMU_KIND[kind], ak, ak === 'walk' ? f % 4 : ak === 'attack' ? Math.min(2, f) : 0);
    if (kind === 'lguard') return KMU_ART.guardUnit(kmCur && kmCur.gk || 'malay', ak, ak === 'walk' ? f % 4 : ak === 'attack' ? Math.min(2, f) : 0);
  }
  return _kmUnitSprite.apply(this, arguments);
};
const _kmShipSprite = shipSprite, _kmShipAnchor = shipAnchor;
function kmShipFor(kind) { return kind === 'raft' || kind === 'fireship' ? null : KMART.mainlandShip('km', kind === 'boat' ? 'fishing' : UD[kind].slot); }
shipSprite = function (u) { return (CV(u.team) === KHM_CIV && kmShipFor(u.kind)) || _kmShipSprite(u); };
shipAnchor = function (kind, team) { const s = CV(team) === KHM_CIV && kmShipFor(kind); return s ? [s.width >> 1, Math.round(s.height * 0.82)] : _kmShipAnchor(kind, team); };
const KM_BLD = { towncentre: 'towncentre', house: 'house', tower: 'tower', rumahtabib: 'healer', palace: 'palace', baray: 'baray' };
const _kmBld = civBuildingSprite;
civBuildingSprite = function (kind, team, level) {
  if (team === KHM_CIV && !(BD[kind] && BD[kind].wall)) {
    const kb = KMBLD.building(kind === 'rumahtabib' ? 'healer' : kind, level); if (kb) return kb;
    if (KM_BLD[kind]) return KMART.kmBuilding(KM_BLD[kind]);
    if (kind === 'granary') return KMART.mainlandBuilding('km', 'granary');
    if (kind === 'tradepost') return KMART.mainlandBuilding('km', 'trade');
    if (kind === 'barracks' || kind === 'port') return KMART.mainlandBase('km', kind);
  }
  return _kmBld.apply(this, arguments);
};
}
