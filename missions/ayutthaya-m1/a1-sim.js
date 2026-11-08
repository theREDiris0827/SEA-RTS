/* ===== a1-sim.js ===== */
/* ==========================================================================
   Ayutthaya campaign, mission 1: "The Island City" (1351). Plan: claude.ai/artifact/2CruDSk4A96thUc3ZfVSws
   U Thong leads his people out of a plague-struck town, ferries them to the island where three rivers
   meet, founds Ayutthaya, wins over Lavo and Suphanburi (by trade, marriage or force), weathers the
   rains and holds the new palace while he is crowned Ramathibodi I.
   The player (team 0) is Ayutthaya; bandits and the rival lord's men (team 1) are Tai too, so both
   sides play civ 3 and the enemy is recoloured in a1-art.js. Sim side only (no DOM).
   ========================================================================== */

const DMUL = { easy: 0.7, normal: 1, hard: 1.3 };
CIVMAP = [AYU_CIV, AYU_CIV];

/* ---------- the map: three rivers meet round an island ---------- */
// a 96 x 72 map (build.py widens the main game's 64 x 48). Like the real Ayutthaya, the island is the land
// the rivers wrap: the Lopburi round the north, the Chao Phraya down the west and south, the Pa Sak on the east.
// Its shore is an irregular, lobed outline and every river meanders, so nothing reads as a drawn circle.
// v0.9.44 (Iylia, 2026-11-08: "still a bit small"): about twice the land of the old 18.5 x 11.5 island
const ISLE = { x: 48, y: 38, rx: 25, ry: 16.5 };
// island features were laid out on the old island: IS() stretches a point out from the centre to the new size
const IS_K = { x: 25 / 18.5, y: 16.5 / 11.5 };
function IS(x, y) { return [ISLE.x + (x - ISLE.x) * IS_K.x, ISLE.y + (y - ISLE.y) * IS_K.y]; }
const FLOODP = { x: 21, y: 59, rx: 18, ry: 9 };
// the island's radius at angle a: an east-west oval pushed in and out by a few slow waves
function isleR(a) {
  const k = 1 + 0.11 * Math.sin(2 * a + 0.7) + 0.08 * Math.sin(3 * a + 2.1) + 0.06 * Math.sin(5 * a + 0.4) + 0.035 * Math.sin(7 * a + 1.3);
  return k / Math.hypot(Math.cos(a) / ISLE.rx, Math.sin(a) / ISLE.ry);
}
// the channel round it: narrow in places, wide where the rivers come in
function chanW(a) { return 2.3 + 1.0 * (0.5 + 0.5 * Math.sin(3 * a + 1.1)) + 0.5 * (0.5 + 0.5 * Math.sin(5 * a + 2.6)); }
function isleDist(x, y) { const dx = x - ISLE.x, dy = y - ISLE.y; return Math.hypot(dx, dy) - isleR(Math.atan2(dy, dx)); }   // < 0 on the island
function onIsle(x, y) { return isleDist(x + 0.5, y + 0.5) < -0.5; }
MAPDEF.river = {
  name: 'The Island City', starts: [{ x: 12, y: 10 }, { x: 80, y: 62 }],
  rivers: [[[[21, -1], [23, 8], [25, 16], [31, 23], [40, 27]], 2.3],                        // Chao Phraya, from the old town in the north, into the channel
    [[[46, 49], [47, 56], [48, 63], [50, 73]], 2.5],                                           // ... and on south out of it
    [[[97, 9], [90, 12], [78, 18], [68, 24], [60, 27.5]], 1.9],                                // Lopburi, from Lavo
    [[[97, 46], [91, 45.5], [80, 46], [70, 43]], 1.9]],                                        // Pa Sak, from the east
  fords: [[0, 0], [2, 0], [3, 0], [1, 2]],     // upriver of every boat route: barges, gift boats and raiders never cross one
  ponds: [[13, 57, 2.6, 1.7], [79, 29, 2.2, 1.4], [33, 9, 1.6, 1.2], [62, 64, 1.8, 1.2]],
  cliffs: [[86, 64, 4.5, 3], [8, 66, 4, 2.6], [64, 5, 3, 2]],
  // khlongs: small canals and streams across the island, shallow, with plank crossings; boats can't enter them
  khlongs: [[[[39, 23], [40, 31], [42, 35], [43, 37.5]].map(p => IS(...p)), 1.2, [0.5]],   // north khlong down into the Bueng
    [[[42.5, 39.5], [40, 42.5], [37.5, 46], [36.5, 52]].map(p => IS(...p)), 1.1, []],              // and on to the south-west channel
    [[[72, 39], [64, 38.8], [60, 40.5]].map(p => IS(...p)), 1.0, []]],                             // a stream in from the east to a pond
  isPonds: [[44, 38.5, 3.6, 2.2], [58.5, 41.5, 2.3, 1.6], [54, 31.5, 1.8, 1.2]].map(([x, y, rx, ry]) => IS(x, y).concat([rx, ry])),   // Bueng Phra Ram and two small ponds
  gold: [], deer: [], villages: []
};
// a river's course: the given points with smooth bends added between them (the same bends every game)
function meander(pts, seed) {
  const out = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.ceil(L / 1.5)), nx = -(by - ay) / L, ny = (bx - ax) / L;
    for (let k = 0; k < n; k++) {
      const t = k / n, env = Math.sin(Math.PI * t), wob = (Math.sin(t * L * 0.33 + seed + i * 1.7) * 1.6 + Math.sin(t * L * 0.71 + seed * 2.3) * 0.7) * env;
      out.push([ax + (bx - ax) * t + nx * wob, ay + (by - ay) * t + ny * wob]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
Game.prototype.genRiverlands = function (M) {
  const s = this.seed, terr = this.terrain;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) terr[y * W + x] = fbm(x * 0.12, y * 0.12, s + 3) > 0.72 ? T.DIRT : T.GRASS;
  const wet = (x, y, deep) => { if (!this.inb(x, y)) return; const i = y * W + x; if (deep) terr[i] = T.DEEP; else if (terr[i] !== T.DEEP) terr[i] = T.SHALLOW; };
  const stamp = (pts, w0, seed) => {
    pts.forEach(([px, py], j) => {
      const w = w0 * (1 + 0.16 * Math.sin(j * 0.21 + seed));
      for (let y = Math.floor(py - w - 1); y <= py + w + 1; y++) for (let x = Math.floor(px - w - 1); x <= px + w + 1; x++) {
        const d = Math.hypot(x + 0.5 - px, y + 0.5 - py); if (d <= w) wet(x, y, d <= w - 1.1);
      }
    });
  };
  M.course = M.rivers.map(([pts, w], i) => meander(pts, 3 + i * 2.9));
  M.course.forEach((c, i) => stamp(c, M.rivers[i][1], i * 1.3));
  // the channel round the island, then the island itself
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x + 0.5 - ISLE.x, dy = y + 0.5 - ISLE.y, a = Math.atan2(dy, dx), d = Math.hypot(dx, dy) - isleR(a), w = chanW(a);
    if (d < 0) terr[y * W + x] = fbm(x * 0.12, y * 0.12, s + 3) > 0.78 ? T.DIRT : T.GRASS;
    else if (d <= w) wet(x, y, d > 0.8 && d < w - 0.7);
  }
  // still ponds and old river loops on the banks
  for (const [px, py, rx, ry] of M.ponds || []) for (let y = Math.floor(py - ry - 1); y <= py + ry + 1; y++) for (let x = Math.floor(px - rx - 1); x <= px + rx + 1; x++) {
    const d = Math.hypot((x + 0.5 - px) / rx, (y + 0.5 - py) / ry) + (hash2(x, y, 17) - 0.5) * 0.35; if (d < 1) wet(x, y, d < 0.45);
  }
  // khlongs and ponds on the island: shallow, open to raft houses; the mouths are plank crossings so boats stay out
  const shallow = (x, y) => { if (this.inb(x, y) && terr[y * W + x] <= T.DIRT) terr[y * W + x] = T.SHALLOW; };
  for (const [px, py, rx, ry] of M.isPonds || []) for (let y = Math.floor(py - ry - 1); y <= py + ry + 1; y++) for (let x = Math.floor(px - rx - 1); x <= px + rx + 1; x++) {
    if (Math.hypot((x + 0.5 - px) / rx, (y + 0.5 - py) / ry) + (hash2(x, y, 23) - 0.5) * 0.3 < 1) shallow(x, y);
  }
  // each khlong stops a tile short of the channel, so boats stay out and the bank between is a footpath
  M.khlongCourse = (M.khlongs || []).map(([pts], i) => meander(pts, 11 + i * 3.7).filter(([x, y]) => isleDist(x, y) < -1.7));
  M.khlongCourse.forEach((c, i) => {
    const w = M.khlongs[i][1];
    c.forEach(([px, py]) => { for (let y = Math.floor(py - 2); y <= py + 2; y++) for (let x = Math.floor(px - 2); x <= px + 2; x++) if (Math.hypot(x + 0.5 - px, y + 0.5 - py) <= w && isleDist(x + 0.5, y + 0.5) < -1.4) shallow(x, y); });
    // plank crossings partway along
    for (const t of M.khlongs[i][2]) { const [px, py] = c[Math.floor(t * (c.length - 1))]; for (let y = Math.floor(py - 2); y <= py + 2; y++) for (let x = Math.floor(px - 2); x <= px + 2; x++) if (this.inb(x, y) && Math.abs(y + 0.5 - py) < 0.9 && Math.abs(x + 0.5 - px) <= w + 0.6 && terr[y * W + x] === T.SHALLOW) terr[y * W + x] = T.SAND; }
  });
  // fords: sandy shallows where a river can be waded, on its bending course
  for (const [ri, si] of M.fords) {
    const [pts, w] = M.rivers[ri], a = pts[si], b = pts[si + 1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let f = M.course[ri][0], fd = 1e9; for (const q of M.course[ri]) { const d = Math.hypot(q[0] - mx, q[1] - my); if (d < fd) { fd = d; f = q; } }
    for (let y = Math.floor(f[1] - w - 2); y <= f[1] + w + 2; y++) for (let x = Math.floor(f[0] - w - 2); x <= f[0] + w + 2; x++) {
      if (this.inb(x, y) && Math.hypot(x + 0.5 - f[0], y + 0.5 - f[1]) <= w + 1.2 && terr[y * W + x] >= T.SHALLOW && terr[y * W + x] <= T.DEEP) terr[y * W + x] = T.SAND;
    }
  }
};
// the flood plain: low fields west and south-west of the island that go under water in the rains
function floodMask(g) {
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = g.terrain[y * W + x]; if (t > T.SAND) continue;
    if (Math.hypot((x + 0.5 - FLOODP.x) / FLOODP.rx, (y + 0.5 - FLOODP.y) / FLOODP.ry) + (hash2(x, y, 41) - 0.5) * 0.25 < 1) m[y * W + x] = 1;
  }
  return m;
}
// bamboo bridges from the island to the west bank and the east bank, laid once the city is founded
const BRIDGES = [{ y: 38, dx: -1 }, { y: 34, dx: 1 }];
Game.prototype.layBridges = function () {
  const terr = this.terrain, isWet = (j) => terr[j] === T.SHALLOW || terr[j] === T.DEEP;
  for (const B of BRIDGES) {
    let x = Math.round(ISLE.x + B.dx * (isleR(B.dx < 0 ? Math.PI : 0) - 3)), y = B.y, wet = false;
    for (let i = 0; i < 40 && x > 0 && x < W - 1; i++, x += B.dx) {
      if (isWet(y * W + x) || isWet((y + 1) * W + x)) { wet = true; for (const yy of [y, y + 1]) if (isWet(yy * W + x)) { terr[yy * W + x] = T.SAND; this.bridge[yy * W + x] = 1; } }
      else if (wet) break;
    }
  }
  this.computeRegions();
  this.terrainDirty = true;
};
// boats pass under the bridges: a bridge tile is open to both layers
const _walkable = Game.prototype.walkable;
Game.prototype.walkable = function (x, y, layer) {
  if (layer === 1 && this.bridge && x >= 0 && y >= 0 && x < W && y < H && this.bridge[y * W + x]) return !this.block[y * W + x];
  return _walkable.call(this, x, y, layer);
};

/* ---------- units ---------- */
Object.assign(UD, {
  uthong: { name: 'U Thong', hp: 420, spd: 2.5, atk: 13, bonus: { elite: 4, eleph: 8 }, rng: 0.85, rate: 0.9, ma: 3, pa: 3, sight: 8, cost: {}, time: 0, cls: 'elite', hero: true, aura: { r: 5, atk: 2 }, civ: 3 },
  // river barges: the families and their goods go down the Chao Phraya in these
  barge: { name: 'River Barge', hp: 200, spd: 2.7, atk: 0, rng: 0, rate: 1, ma: 1, pa: 3, sight: 6, cost: { wood: 80 }, time: 14, cls: 'ship', layer: 1, slot: 'galley', troops: 6, civ: 3 },
  // the gift boats for Lavo and the wedding procession for Suphanburi
  goldboat: { name: 'Gift Boat', hp: 150, spd: 2.5, atk: 0, rng: 0, rate: 1, ma: 1, pa: 2, sight: 6, cost: {}, time: 0, cls: 'ship', layer: 1, slot: 'trade', vip: true, civ: 3 },
  bride: { name: 'The Bride', hp: 110, spd: 1.0, atk: 0, rng: 0, rate: 1, ma: 1, pa: 1, sight: 6, cost: {}, time: 0, cls: 'sword', vip: true, civ: 3 },
  // bandits on the rivers: Tai men in undyed cotton, drawn on the Ayutthaya roster
  bd_sword: { name: 'Bandit', hp: 45, spd: 2.4, atk: 7, bonus: { archer: 3 }, rng: 0.85, rate: 1.0, ma: 0, pa: 1, sight: 6.5, cost: {}, time: 0, cls: 'sword', ay: 'keris', pal: 'bandit', civ: 9 },
  bd_archer: { name: 'Bandit archer', hp: 30, spd: 2.2, atk: 5, bonus: { spear: 2 }, rng: 5.5, rate: 1.6, ma: 0, pa: 0, sight: 7.5, cost: {}, time: 0, cls: 'archer', ranged: true, ay: 'archer', pal: 'bandit', civ: 9 },
  bd_boat: { name: 'Bandit boat', hp: 90, spd: 3.2, atk: 5, rng: 5, rate: 1.6, ma: 1, pa: 1, sight: 7.5, cost: {}, time: 0, cls: 'ship', ranged: true, layer: 1, slot: 'light', pal: 'bandit', wpn: 'arrow', kb: { boat: 4, trade: 6 }, civ: 9 },
  bd_lander: { name: 'Bandit raft', hp: 140, spd: 2.6, atk: 0, rng: 0, rate: 1, ma: 1, pa: 1, sight: 6, cost: {}, time: 0, cls: 'ship', layer: 1, slot: 'galley', pal: 'bandit', civ: 9 },
  // the rival lord's men, in his dark red
  rv_sword: { name: 'Rival swordsman', hp: 55, spd: 2.4, atk: 8, bonus: { archer: 3 }, rng: 0.85, rate: 1.0, ma: 1, pa: 2, sight: 6.5, cost: {}, time: 0, cls: 'sword', ay: 'keris', pal: 'rival', civ: 9 },
  rv_spear: { name: 'Rival spearman', hp: 52, spd: 2.3, atk: 5, bonus: { sword: 5, elite: 4, eleph: 8 }, rng: 1.5, rate: 1.1, ma: 2, pa: 1, sight: 6.5, cost: {}, time: 0, cls: 'spear', ay: 'tombak', pal: 'rival', civ: 9 },
  rv_archer: { name: 'Rival archer', hp: 32, spd: 2.2, atk: 6, bonus: { spear: 3 }, rng: 5.5, rate: 1.5, ma: 0, pa: 0, sight: 7.5, cost: {}, time: 0, cls: 'archer', ranged: true, ay: 'archer', pal: 'rival', civ: 9 },
  rv_eleph: { name: 'Rival war elephant', hp: 300, spd: 1.9, atk: 16, bonus: { sword: 4, archer: 6 }, rng: 1.1, rate: 1.8, ma: 2, pa: 3, sight: 7, cost: {}, time: 0, cls: 'eleph', bld: 20, ay: 'chang', pal: 'rival', civ: 9 },
  cmdr: { name: 'The rival lord', hp: 900, spd: 2.0, atk: 20, bonus: { sword: 4, archer: 6, elite: 4 }, rng: 1.1, rate: 1.6, ma: 3, pa: 4, sight: 8.5, cost: {}, time: 0, cls: 'eleph', foeHero: true, aura: { r: 5, atk: 2 }, bld: 20, ay: 'chang', pal: 'rival', lord: true, civ: 9 }
});
// the townsfolk of Suphanburi and Lavo who join you are your own roster
Object.assign(ORDER_CLS || {}, { eleph: 0.4 });
Object.assign(CIV_NAMES, { uthong: [null, null, ['U Thong']], barge: [null, null, ['Ruea Khon', 'Barge']], goldboat: [null, null, ['Ruea Kamnan', 'Gifts']], bride: [null, null, ['Chao Sao', 'Bride']] });

/* ---------- buildings ---------- */
// the Sala Klang is raised by the settlers on the island; towns are neutral halls until they join
BD.towncentre.time = 40;
BD.hall = { name: 'Town Hall', size: 3, hp: 1600, cost: null, time: 0, sight: 5, train: [] };
BD.palace = Object.assign({}, BD.palace, { cost: { wood: 300, gold: 120 }, time: 45, hp: 3200, train: ['chang'], age: 2 });
BD.port.train = ['boat', 'barge', 'light', 'galley'];
for (const k of ['wat', 'tower', 'wall', 'gate']) BD[k].age = 2;
UD.galley.age = 2; UD.chang.age = 2;
BUILD_ORDER.length = 0;
for (const k of ['house', 'farm', 'store', 'granary', 'barracks', 'port', 'palisade', 'gate', 'wall', 'wat', 'tower', 'palace']) BUILD_ORDER.push(k);
const ageOf = (d) => (d && d.age) || 1;
function ageOk(d, age) { return ageOf(d) <= age; }

/* ---------- ages (lore/ages.md, Thai names) ---------- */
const AGES = [null,
  { n: 1, name: 'Village Age', local: 'Ban', tc: 1200 },
  { n: 2, name: 'Kingdom Age', local: 'Mueang', cost: { food: 400, gold: 60 }, time: 50, tc: 1600,
    need: { any: ['barracks', 'store', 'granary', 'port'], n: 2, text: '2 of: Barracks, Rong, Yung Khao, Tha Ruea' } }
];
const MAX_AGE = 2;

/* ---------- where things are ---------- */
const OLD = { x: 12, y: 11 };                                   // the old town, upriver
const TOWNS = {
  lavo: { name: 'Lavo', tx: 78, ty: 6, land: { x: 80.5, y: 16.5 }, how: 'trade', col: 'lavo' },
  suphan: { name: 'Suphanburi', tx: 6, ty: 33, how: 'wed', col: 'suphan' }
};
const RIVAL = { tx: 78, ty: 59 };                             // the rival lord's stockade in the south-east hills
const ENTRY = { se: { x: 93.5, y: 69.5, name: 'the south-east hills' }, w: { x: 1.5, y: 50.5, name: 'the western fields' }, n: { x: 50.5, y: 1.5, name: 'the northern road' } };
const RIVERIN = { s: { x: 47.5, y: 58.5 }, e: { x: 87.5, y: 45.3 }, ne: { x: 86.5, y: 14 } };   // just below the fords
const LANDINGS = { n: { x: 48.5, y: 23.5, name: 'the north shore' }, s: { x: 48.5, y: 52.5, name: 'the south shore' } };
const RAIN = { len: 180, slow: 0.55 };
const CROWN = 90;
// raids. Phase 2: bandits on rafts land on the island. Phase 3 on: the rival lord's men on the roads
const BANDIT_RAIDS = [
  { at: 100, sea: { from: 's', boats: { bd_boat: 1 }, land: [{ at: 's', k: 'bd_lander', u: { bd_sword: 3, bd_archer: 1 } }] } },
  { at: 110, sea: { from: 'e', boats: { bd_boat: 1 }, land: [{ at: 'n', k: 'bd_lander', u: { bd_sword: 3, bd_archer: 2 } }] } }
];
const RIVAL_RAIDS = [
  { at: 120, land: { se: { rv_sword: 3, rv_archer: 2 } } },
  { at: 125, land: { w: { rv_sword: 3, rv_spear: 2, rv_archer: 2 } } },
  { at: 130, land: { se: { rv_sword: 3, rv_spear: 3, rv_archer: 3 } } },
  { at: 130, land: { n: { rv_sword: 3, rv_archer: 3 }, se: { rv_eleph: 1, rv_spear: 2 } } },
  { at: 140, land: { se: { rv_sword: 4, rv_spear: 3, rv_archer: 4, rv_eleph: 1 } } }
];
const FINAL = { land: { se: { cmdr: 1, rv_eleph: 2, rv_sword: 5, rv_spear: 5, rv_archer: 5 }, w: { rv_sword: 3, rv_spear: 3, rv_archer: 3 } },
  sea: { from: 's', boats: { bd_boat: 2 }, land: [] } };
function raidKinds(R, diff, cut) {
  const out = [], m = DMUL[diff] * (cut || 1);
  const add = (u) => { for (const k in u) { const n = k === 'cmdr' ? 1 : Math.max(1, Math.round(u[k] * m)); for (let j = 0; j < n; j++) out.push(k); } };
  if (R.land) for (const e in R.land) add(R.land[e]);
  if (R.sea) { add(R.sea.boats || {}); for (const L of R.sea.land || []) add(L.u); }
  return out;
}

/* ---------- setting the map ---------- */
Game.prototype.populate = function () {
  const g = this, rng = g.rng, M = g.M = newMission(g);
  g.bridge = new Uint8Array(W * H);
  g.flood = floodMask(g);
  const place = (kind, cx, cy, spread, count, test) => {
    let placed = 0;
    for (let i = 0; i < count * 14 && placed < count; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * spread;
      const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (!g.freeTile(x, y) || g.reserve[y * W + x] || (test && !test(x, y))) continue;
      g.addNode(kind, x, y); placed++;
    }
    return placed;
  };
  // the river points boats aim for sit on the bending rivers: put each on the nearest open water
  const toWater = (p) => { const w = g.nearestFree(p.x, p.y, 1, 7); if (w) { p.x = w.x + 0.5; p.y = w.y + 0.5; } };
  for (const [L, a] of [[LANDINGS.n, -Math.PI / 2], [LANDINGS.s, Math.PI / 2]]) { const r = isleR(a) + 1.3; L.x = ISLE.x + Math.cos(a) * r; L.y = ISLE.y + Math.sin(a) * r; }
  for (const p of Object.values(RIVERIN).concat(Object.values(LANDINGS), [TOWNS.lavo.land])) toWater(p);
  const keepClear = (x, y) => !onIsle(x, y) && !g.flood[y * W + x] && Math.hypot(x - OLD.x, y - OLD.y) > 5;
  // roads the towns and raiders use stay clear of trees
  g.reserveRoute(TOWNS.suphan.tx + 1, TOWNS.suphan.ty + 4, 18, 38);   // to the west bridgehead
  g.reserveRoute(ENTRY.se.x | 0, ENTRY.se.y | 0, 78, 35);             // to the east bridgehead
  g.reserveRoute(ENTRY.w.x | 0, ENTRY.w.y | 0, 18, 38);
  g.reserveRoute(ENTRY.n.x | 0, ENTRY.n.y | 0, 78, 33);
  g.reserveRoute(OLD.x, OLD.y + 2, 20, 26);
  for (const T0 of Object.values(TOWNS)) for (let y = T0.ty - 2; y <= T0.ty + 6; y++) for (let x = T0.tx - 3; x <= T0.tx + 7; x++) if (g.inb(x, y)) g.reserve[y * W + x] = 1;
  for (let y = RIVAL.ty - 2; y <= RIVAL.ty + 6; y++) for (let x = RIVAL.tx - 3; x <= RIVAL.tx + 8; x++) if (g.inb(x, y)) g.reserve[y * W + x] = 1;
  // the island: room for a whole city, with groves, berries and a little gold; more wood on the banks
  const isl = (kind, x, y, r, n) => { const [cx, cy] = IS(x, y); place(kind, cx, cy, r, n, onIsle); };
  isl('berry', 40, 43, 1.8, 6); isl('berry', 57, 33, 1.6, 5);
  isl('tree', 61, 43, 3.0, 18); isl('tree', 35, 33, 2.8, 16); isl('tree', 50, 48, 2.2, 10); isl('tree', 54, 28, 2.0, 8); isl('tree', 42, 31, 2.2, 10); isl('tree', 62, 35, 2.0, 9); isl('berry', 47, 45, 1.4, 4);
  isl('tree', 33, 42, 2.0, 8); isl('tree', 65, 30, 1.8, 6);
  { const [gx, gy] = IS(58, 39), c = g.nearestFree(Math.round(gx), Math.round(gy), 0, 4); if (c) place('gold', c.x, c.y, 1.4, 4, onIsle); }
  // forests on the banks, gold in the hills
  for (const [cx, cy, r, n] of [[31, 9, 5, 40], [5, 21, 4.5, 32], [17, 30, 4, 24], [64, 14, 5, 36], [81, 30, 4, 24], [42, 15, 3.5, 18],
    [64, 61, 4.5, 28], [33, 66, 3.5, 14], [88, 27, 4.5, 24], [88, 56, 4, 18], [10, 47, 3, 12], [55, 66, 3, 12]]) place('tree', cx, cy, r, n, keepClear);
  for (let i = 0; i < 160; i++) {
    const x = 2 + Math.floor(rng() * (W - 4)), y = 2 + Math.floor(rng() * (H - 4));
    if (g.freeTile(x, y) && !g.reserve[y * W + x] && keepClear(x, y) && hash2(x, y, 31) < 0.45) g.addNode('tree', x, y);
  }
  for (const [x, y] of [[15, 24], [80, 39], [54, 11], [70, 66]]) { const c = g.nearestFree(x, y, 0, 5); if (c) place('gold', c.x, c.y, 1.6, 5, (X, Y) => !g.flood[Y * W + X]); }
  place('berry', 17, 15, 1.6, 5, keepClear); place('berry', 20, 42, 1.6, 5, keepClear);
  // deer graze the dry banks, never the flood plain (it goes under in the rains)
  const dryNear = (x, y, r) => { for (let k = 0; k <= r; k++) for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) { const X = x + dx, Y = y + dy; if (g.inb(X, Y) && g.freeTile(X, Y) && !g.flood[Y * W + X] && !onIsle(X, Y)) return { x: X, y: Y }; } return null; };
  for (const [gx, gy] of [[17, 44], [72, 22], [40, 64], [86, 36]]) {
    const c = dryNear(gx, gy, 6); if (!c) continue;
    for (let i = 0; i < 3; i++) { const p = dryNear(c.x + i, c.y + (i % 2), 4); if (!p) continue; const d = g.addUnit('deer', 2, p.x + 0.5, p.y + 0.5); d.order = { t: 'wander', next: 2 + rng() * 5 }; }
  }
  // fish in the rivers round the island
  for (let i = 0, n = 0; i < 4000 && n < 24; i++) {
    const x = 2 + Math.floor(rng() * (W - 4)), y = 2 + Math.floor(rng() * (H - 4));
    if (!g.isWater(x, y) || g.block[y * W + x] || Math.hypot(x - ISLE.x, y - ISLE.y) > 34) continue;
    if (g.nodes.some(o => o.kind === 'fish' && Math.abs(o.tx - x) + Math.abs(o.ty - y) < 4)) continue;
    g.addNode('fish', x, y); n++;
  }
  // the old town: houses emptied by the sickness (team 2, they take no part)
  for (const [x, y] of [[7, 6], [12, 5], [6, 11], [16, 6]]) if (g.canPlace('house', x, y, 2)) { const b = g.addBuilding('house', 2, x, y, true); b.old = true; }
  // the towns
  for (const id in TOWNS) buildTown(g, id);
  buildRival(g);
  // U Thong's people: the families, a few men-at-arms, and the barges on the river
  const put = (kind, x, y) => { const p = g.openSpot(x, y, UD[kind].layer || 0); return g.addUnit(kind, 0, p.x, p.y); };
  M.hero = put('uthong', OLD.x + 2, OLD.y + 1).id;
  for (let i = 0; i < 12; i++) put('villager', OLD.x - 1 + (i % 4), OLD.y + 2 + Math.floor(i / 4));
  put('keris', OLD.x + 3, OLD.y + 3); put('keris', OLD.x + 4, OLD.y + 3); put('archer', OLD.x + 3, OLD.y + 4); put('archer', OLD.x + 4, OLD.y + 4);
  for (const [x, y] of [[24, 14], [25, 17]]) { const w = g.nearestFree(x, y, 1, 4); if (w) g.addUnit('barge', 0, w.x + 0.5, w.y + 0.5); }
  // bandits waiting on the banks downriver
  for (const [x, y, u] of [[25, 24, { bd_archer: 2, bd_sword: 1 }], [34, 19, { bd_archer: 2, bd_sword: 2 }]]) {
    let i = 0;
    for (const k in u) for (let j = 0, n = Math.max(1, Math.round(u[k] * DMUL[g.diff])); j < n; j++, i++) {
      const p = g.openSpot(x + (i % 2), y + Math.floor(i / 2), 0), b = g.addUnit(k, 1, p.x, p.y); b.guard = { x: p.x, y: p.y, r: 7 };
    }
  }
  g.res[0] = { food: 150, wood: 250, gold: 60 };
  g.res[1] = { food: 0, wood: 0, gold: 0 };
  g.age = [1, 2]; g.maxAge = 2; g.navTier = [0, 0];   // the enemy keeps the Kingdom Age look; their own colours go on top
  M.isle = g.regionAt(ISLE.x + 0.5, ISLE.y + 0.5);
  for (const L of Object.values(LANDINGS)) scout(g, L.x, L.y, 4);
};
function buildTown(g, id) {
  const T0 = TOWNS[id], ids = [];
  for (const n of g.nodes.slice()) if (n.kind === 'tree' && n.tx >= T0.tx - 2 && n.tx <= T0.tx + 6 && n.ty >= T0.ty - 1 && n.ty <= T0.ty + 5) g.removeNode(n);
  g.cleanup();
  const hall = g.addBuilding('hall', 2, T0.tx, T0.ty, true); hall.town = id; ids.push(hall.id);
  for (const [dx, dy] of [[4, 0], [-2, 3], [4, 3]]) if (g.canPlace('house', T0.tx + dx, T0.ty + dy, 2)) { const b = g.addBuilding('house', 2, T0.tx + dx, T0.ty + dy, true); b.town = id; ids.push(b.id); }
  g.M.towns[id] = { st: 'open', hall: hall.id, ids, n: 0, x: T0.tx + 1.5, y: T0.ty + 1.5 };
}
function buildRival(g) {
  const c = RIVAL, ids = [];
  for (const n of g.nodes.slice()) if (n.kind === 'tree' && n.tx >= c.tx - 3 && n.tx <= c.tx + 7 && n.ty >= c.ty - 2 && n.ty <= c.ty + 6) g.removeNode(n);
  g.cleanup();
  const put = (kind, dx, dy) => { const tx = c.tx + dx, ty = c.ty + dy; if (!g.canPlace(kind, tx, ty, 1)) return; const b = g.addBuilding(kind, 1, tx, ty, true); b.camp = true; ids.push(b.id); };
  put('barracks', 0, 0); put('house', 4, -1); put('house', -3, 1); put('tower', 4, 2);
  g.M.camp = { x: c.tx + 1.5, y: c.ty + 1.5, ids };
  const guards = { rv_sword: 2, rv_spear: 2, rv_archer: 3 };
  let i = 0;
  for (const k in guards) for (let j = 0, n = Math.max(1, Math.round(guards[k] * DMUL[g.diff])); j < n; j++, i++) {
    const p = g.openSpot(c.tx + 1 + (i % 3), c.ty + 4 + Math.floor(i / 3), 0), u = g.addUnit(k, 1, p.x, p.y);
    u.guard = { x: p.x, y: p.y, r: 8, camp: true };
  }
}

/* ---------- mission state ---------- */
function newMission(g) {
  return { t: 0, phase: 1, phaseAt: [0, 0, 0, 0, 0, 0], cardQ: [], cards: {}, towns: {}, hero: 0, isle: 0,
    landed: 0, tc: 0, hhFish: false, hhPaddy: false, raid: 0, next: 1e9, cols: [], broken: 0, spoils: 0, kills: 0,
    rainAt: 0, rainOn: false, rainEnd: 0, rainDone: false, aging: null, ageAt: [0, 0, 0], palace: 0, crown: 0,
    finalOn: false, cmdrDead: false, routed: false, won: false, why: null, slow: 1, sends: 0 };
}

/* ---------- ages ---------- */
Game.prototype.ageNeedMet = function (team, n) {
  const A = AGES[n]; if (!A || !A.need) return true;
  const have = (k) => this.buildings.some(b => b.team === team && b.kind === k && b.done && b.hp > 0);
  return A.need.any.filter(have).length >= A.need.n;
};
Game.prototype.startAge = function (team) {
  const M = this.M, n = this.age[team] + 1, A = AGES[n];
  if (!A) return 'Ayutthaya is a kingdom now.';
  if (M.aging) return 'Already advancing to the ' + AGES[M.aging.to].name + '.';
  if (!this.ageNeedMet(team, n)) return 'The ' + A.name + ' needs ' + A.need.text + '.';
  if (!this.canAfford(team, A.cost)) return 'The ' + A.name + ' costs ' + Object.keys(A.cost).map(k => A.cost[k] + ' ' + k).join(', ') + '.';
  this.pay(team, A.cost);
  M.aging = { to: n, left: A.time, tot: A.time };
  this.msg('The court begins the work of the ' + A.name + ' (' + A.local + ').');
  return null;
};
Game.prototype.cancelAge = function () {
  const M = this.M; if (!M.aging) return;
  const A = AGES[M.aging.to]; for (const k in A.cost) this.res[0][k] += A.cost[k];
  M.aging = null; this.msg('Advancing to the next age is called off.');
};
function soldierArm(u, age) {
  if (u.team !== 0 || !(u.cls === 'sword' || u.cls === 'spear' || u.cls === 'elite' || u.cls === 'archer') || UD[u.kind].hero || UD[u.kind].vip) return;
  const want = age >= 2 ? 1 : 0, have = u.ageArm || 0;
  if (want === have) return;
  u.pa += want - have; u.ma += want - have; u.ageArm = want;
}
Game.prototype.applyAge = function (team, n) {
  const M = this.M, A = AGES[n];
  this.age[team] = n; M.ageAt[n] = M.t; this.navTier[team] = n >= 2 ? 1 : 0;
  for (const b of this.buildings) if (b.team === team && b.kind === 'towncentre' && b.hp > 0 && b.done) { const add = A.tc - b.maxHp; b.maxHp = A.tc; b.hp += Math.max(0, add); }
  for (const u of this.units) if (u.team === team && u.hp > 0) soldierArm(u, n);
  M.cardQ.push('age' + n);
};
const _addUnit = Game.prototype.addUnit;
Game.prototype.addUnit = function (kind, team, x, y) {
  const u = _addUnit.call(this, kind, team, x, y);
  if (team === 0 && this.age) soldierArm(u, this.age[0]);
  return u;
};
Game.prototype.trainable = function (kind, team) {
  const t = BD[kind].train; if (!t) return null;
  const age = this.age ? this.age[team] : 2;
  return t.filter(k => civOk(UD[k], team) && (team !== 0 || ageOk(UD[k], age)));
};
const _placeBuilding = Game.prototype.placeBuilding;
Game.prototype.placeBuilding = function (team, kind, tx, ty, ids) {
  if (team === 0 && this.age && !ageOk(BD[kind], this.age[0])) return { ok: false, why: civName(kind, 0) + ' comes with the ' + AGES[ageOf(BD[kind])].name + '.' };
  if (team === 0 && this.M && this.M.phase < 2) return { ok: false, why: 'First bring the families to the island.' };
  return _placeBuilding.call(this, team, kind, tx, ty, ids);
};
const _queueUnit = Game.prototype.queueUnit;
Game.prototype.queueUnit = function (b, kind, team) {
  const d = UD[kind];
  if (d && b.team === 0 && this.age && !ageOk(d, this.age[0])) return civName(kind, 0) + ' comes with the ' + AGES[ageOf(d)].name + '.';
  if (kind === 'chang' && b.team === 0 && this.M && !this.M.kraals) return 'Lavo keeps the elephant kraals. Win Lavo over to train Chang Suek.';
  return _queueUnit.call(this, b, kind, team);
};

/* ---------- the rains: the flood plain goes under water ---------- */
Game.prototype.flooded = function (x, y) { return !!(this.M && this.M.rainOn && this.flood[Math.floor(y) * W + Math.floor(x)]); };
const _gatherInfo = Game.prototype.gatherInfo;
Game.prototype.gatherInfo = function (o) {
  const gi = _gatherInfo.call(this, o);
  if (!gi || !this.M) return gi;
  if (o.isBld && FIELD[o.kind]) {
    if (this.flooded(o.x, o.y)) return null;                         // the paddy is under water
    if (this.flood[Math.floor(o.y) * W + Math.floor(o.x)]) gi.rate *= 1.3;   // silt from last year's flood makes it rich
  }
  if (o.team !== 1) gi.rate *= this.M.slow;
  return gi;
};
const _stepMove = Game.prototype.stepMove;
Game.prototype.stepMove = function (u, dt) {
  if (u.layer === 0 && this.M && this.M.rainOn && this.flood[Math.floor(u.y) * W + Math.floor(u.x)]) return _stepMove.call(this, u, dt * RAIN.slow);
  return _stepMove.call(this, u, dt);
};

/* ---------- people who never fight: the bride walks on, the gift boats sail on ---------- */
const _doIdle = Game.prototype.doIdle;
Game.prototype.doIdle = function (u, dt) {
  if (UD[u.kind].vip) return;
  _doIdle.call(this, u, dt);
};
const _updateUnit = Game.prototype.updateUnit;
Game.prototype.updateUnit = function (u, dt) {
  const t = u.order.t;
  if (t === 'rland' || t === 'flee2') {
    u.cd = Math.max(0, u.cd - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
    u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
    u.anim += dt; u.moving = false; u.working = false; this.wt = u.team;
    if (t === 'rland') this.doRaidLand(u, dt); else this.doRetreat(u, dt);
    return;
  }
  _updateUnit.call(this, u, dt);
};
// a raiders' raft: row in to the island, put the men ashore, row back out and leave the map
Game.prototype.doRaidLand = function (u, dt) {
  const o = u.order;
  o.tt = (o.tt || 0) + dt;
  const gx = o.s === 'in' ? o.x : o.sx, gy = o.s === 'in' ? o.y : o.sy;
  if (Math.hypot(u.x - gx, u.y - gy) < (o.s === 'in' ? 1.8 : 1.5) || o.tt > 60) {
    u.path = null;
    if (o.s === 'in') { this.raidUnload(u, o.troops, o.wave); o.s = 'out'; o.tt = 0; }
    else { u.hp = 0; u.silent = true; }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, gx, gy))) { u.wait = 1; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
Game.prototype.raidUnload = function (boat, kinds, wave) {
  const land = this.nearestFree(Math.floor(boat.x), Math.floor(boat.y), 0, 7), goal = homeGoal(this), M = this.M;
  if (!land) return;
  for (const k of kinds) {
    const p = this.openSpot(land.x + 0.5, land.y + 0.5, 0), u = this.addUnit(k, 1, p.x, p.y); u.wave = wave;
    const col = M.cols.find(c => c.wave === wave); if (col) col.ids.add(u.id);
    if (goal) { this.orderAMove(u, goal.x, goal.y); u._amT = this.t; }
  }
  this.msg('Bandits are ashore at ' + (boat.order.name || 'the island') + '!');
  this.alerts.push({ x: land.x, y: land.y, t: 3 });
};
Game.prototype.doRetreat = function (u, dt) {
  const o = u.order;
  if (Math.hypot(u.x - o.x, u.y - o.y) < 2 || (o.tt = (o.tt || 0) + dt) > 45) { u.hp = 0; u.silent = true; return; }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, o.x, o.y))) { u.wait = 1; return; } }
  const s = u.spd; u.spd = s * 1.2; if (this.stepMove(u, dt)) u.path = null; u.spd = s;
};

/* ---------- combat: hero auras, elephant charges, building-breakers ---------- */
const _damage = Game.prototype.damage;
Game.prototype.damage = function (att, tgt, w) {
  const ad = att.isUnit ? UD[att.kind] : null;
  if (!ad || w || tgt.hp <= 0) return _damage.call(this, att, tgt, w);
  let plus = this.auraFor(att);
  if (tgt.isBld && ad.bld) plus += ad.bld;
  if (!plus) return _damage.call(this, att, tgt, w);
  const a0 = att.atk; att.atk = Math.round(a0 + plus); _damage.call(this, att, tgt, w); att.atk = a0;
};
Game.prototype.auraFor = function (u) {
  if (!u.isUnit) return 0;
  let best = 0;
  for (const h of this.heroes || []) {
    if (h === u || h.team !== u.team || h.hp <= 0) continue;
    const A = UD[h.kind].aura; if (A && Math.hypot(h.x - u.x, h.y - u.y) <= A.r && A.atk > best) best = A.atk;
  }
  return best;
};
const _onKilled = Game.prototype.onKilled;
Game.prototype.onKilled = function (t, att) {
  _onKilled.call(this, t, att);
  const M = this.M; if (!M) return;
  if (t.isUnit) {
    if (t.kind === 'uthong') { M.why = 'hero'; }
    if (t.kind === 'cmdr') { M.cmdrDead = true; M.cmdrAt = M.t; }
    if (t.kind === 'bride') { const s = M.towns.suphan; if (s.st === 'wed') { s.st = 'open'; this.msg('The bride has been killed on the road. Suphanburi mourns. You may send another procession.'); M.cardQ.push('v-bride'); } }
    if (t.kind === 'goldboat') { const s = M.towns.lavo; if (s.st === 'trade') this.msg('A gift boat has gone down on the Lopburi river.'); }
  }
};

/* ---------- winning the towns ---------- */
Game.prototype.townAct = function (id, how) {
  const M = this.M, T0 = M.towns[id], tc = homeGoal(this);
  if (!T0 || T0.st === 'joined' || T0.st === 'force') return 'Done.';
  if (M.phase < 3) return 'Found the city first.';
  if (how === 'force') {
    T0.st = 'force';
    for (const bid of T0.ids) { const b = this.byId.get(bid); if (b && b.hp > 0) { b.team = 1; b.done = true; } }
    const hall = this.byId.get(T0.hall); hall.maxHp = 1200; hall.hp = 1200;
    const g = { rv_sword: 3, rv_spear: 2, rv_archer: 3 };
    let i = 0;
    for (const k in g) for (let j = 0, n = Math.max(1, Math.round(g[k] * DMUL[this.diff])); j < n; j++, i++) {
      const p = this.openSpot(T0.x + (i % 4) - 1, T0.y + 3 + Math.floor(i / 4), 0), u = this.addUnit(k, 1, p.x, p.y);
      u.guard = { x: p.x, y: p.y, r: 9, town: id }; u.townGuard = id;
    }
    this.msg(TOWNS[id].name + ' shuts its gates and arms its men. Break its town hall to take it.');
    return null;
  }
  if (id === 'lavo') {
    if (T0.st === 'trade' && this.units.some(u => u.kind === 'goldboat' && u.hp > 0)) return 'A gift boat is already on the river.';
    const cost = { gold: 100 };
    if (!this.canAfford(0, cost)) return 'A gift boat carries 100 gold of cloth and silver.';
    if (!tc) return 'You need the Sala Klang.';
    const sp = this.findSpawn(tc, null, 1); if (!sp) return 'No water near the Sala Klang.';
    this.pay(0, cost); T0.st = 'trade'; M.sends++;
    const u = this.addUnit('goldboat', 0, sp.x, sp.y); this.orderMove(u, TOWNS.lavo.land.x, TOWNS.lavo.land.y);
    // bandit boats come down the Lopburi to rob it
    const n = Math.max(1, Math.round((T0.n === 0 ? 1 : 2) * DMUL[this.diff]));
    for (let i = 0; i < n; i++) { const p = this.openSpot(RIVERIN.ne.x - i * 1.5, RIVERIN.ne.y, 1), b = this.addUnit('bd_boat', 1, p.x, p.y); b.prey = u.id; b.robber = true; }
    this.msg('A gift boat sets out up the Lopburi river for Lavo (' + (T0.n + 1) + ' of 3). Bandit boats are on the river!');
    return null;
  }
  if (id === 'suphan') {
    if (T0.st === 'wed') return 'The procession is already on the road.';
    const cost = { food: 100, gold: 60 };
    if (!this.canAfford(0, cost)) return 'The wedding gifts cost 100 food and 60 gold.';
    if (!tc) return 'You need the Sala Klang.';
    this.pay(0, cost); T0.st = 'wed'; M.sends++;
    const sp = this.findSpawn(tc, null, 0), b = this.addUnit('bride', 0, sp.x, sp.y);
    T0.bride = b.id; T0.ambush = false;
    this.orderMove(b, T0.x + 1, T0.y + 3.5);
    this.msg('The wedding procession sets out for Suphanburi. Guard the bride on the road!');
    return null;
  }
  return 'Not available.';
};
Game.prototype.joinTown = function (id, how) {
  const M = this.M, T0 = M.towns[id];
  T0.st = 'joined'; T0.how = how;
  const put = (k, n) => { for (let i = 0; i < n; i++) { const p = this.openSpot(T0.x + 2 + (i % 4), T0.y + 4 + Math.floor(i / 4), 0); this.addUnit(k, 0, p.x, p.y); } };
  if (how === 'force') {
    for (const bid of T0.ids) { const b = this.byId.get(bid); if (b && b.hp > 0) { b.hp = 0; } }
    M.slow = Math.max(0.8, M.slow - 0.1);
    for (const u of this.units) if (u.townGuard === id && u.hp > 0) u.hp = 0;
  } else for (const bid of T0.ids) { const b = this.byId.get(bid); if (b && b.hp > 0) b.joined = true; }
  if (id === 'lavo') {
    M.kraals = true;
    if (how !== 'force') put('chang', 1);
    this.msg(how === 'force' ? 'Lavo is taken. Its elephant kraals are yours, but its people work for you sullenly.' : 'Lavo joins Ayutthaya! Its elephant kraals are yours: a Chang Suek comes to you, and the Wang can train more.');
  } else {
    if (how === 'force') put('tombak', 2); else { put('archer', 4); put('tombak', 4); }
    this.msg(how === 'force' ? 'Suphanburi is taken. Two spearmen join you, and its people work slowly.' : 'Suphanburi joins Ayutthaya! Its archers and spearmen march to you.');
  }
  M.cardQ.push(id + '-' + (how === 'force' ? 'force' : 'join'));
  this.alerts.push({ x: T0.x, y: T0.y, t: 3 });
};

/* ---------- the raiders' AI ---------- */
Game.prototype.aiTick = function () { if (this.M) missionAI(this); };
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (M.why) { this.over = 'lose'; return; }
  if (M.tc && !this.buildings.some(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0)) { M.why = 'tc'; this.over = 'lose'; return; }
  if (M.palace && !M.crowned && !this.buildings.some(b => b.id === M.palace && b.hp > 0)) { M.why = 'palace'; this.over = 'lose'; return; }
  if (M.phase === 1 && !this.units.some(u => u.team === 0 && u.cls === 'vil' && u.hp > 0) && !this.units.some(u => u.cargo && u.cargo.some(c => c.cls === 'vil'))) { M.why = 'people'; this.over = 'lose'; return; }
  if (M.won) this.over = 'win';
};
const _update = Game.prototype.update;
Game.prototype.update = function (dt) {
  this.heroes = this.units.filter(u => u.hp > 0 && UD[u.kind].aura);
  _update.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};
function heroUnit(g) { const u = g.byId.get(g.M.hero); return u && u.hp > 0 ? u : null; }
function homeGoal(g) {
  return g.buildings.find(b => b.team === 0 && b.kind === 'palace' && b.hp > 0 && b.done && g.M.finalOn)
    || g.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0) || heroUnit(g);
}
function reachMap(g, goal) {
  const seen = new Uint8Array(W * H), q = [];
  const push = (x, y) => { if (g.inb(x, y) && !seen[y * W + x] && g.walkable(x, y, 0)) { seen[y * W + x] = 1; q.push(y * W + x); } };
  const tx = goal.isBld ? goal.tx : Math.floor(goal.x), ty = goal.isBld ? goal.ty : Math.floor(goal.y), sz = goal.isBld ? goal.size : 1;
  for (let y = ty - 1; y <= ty + sz; y++) for (let x = tx - 1; x <= tx + sz; x++) push(x, y);
  for (let i = 0; i < q.length; i++) { const c = q[i], x = c % W, y = (c / W) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  return seen;
}
function nearestOf(g, u, ok, maxD) {
  let best = null, bd = maxD || 1e9;
  for (const b of g.buildings) { if (b.team !== 0 || b.hp <= 0 || !ok(b)) continue; const d = rectDist(u.x, u.y, b.rect); if (d < bd) { bd = d; best = b; } }
  return best;
}
const isWall = (b) => !!BD[b.kind].wall;
function missionAI(g) {
  const M = g.M, goal = homeGoal(g);
  let reach = null;
  if (goal) { reach = g._reachT === g.tickN >> 4 && g._reach ? g._reach : (g._reach = reachMap(g, goal)); g._reachT = g.tickN >> 4; }
  for (const u of g.units) {
    if (u.team !== 1 || u.hp <= 0) continue;
    const o = u.order, d = UD[u.kind];
    if (o.t === 'flee2' || o.t === 'rland') continue;
    // guards hold their post and chase off anyone who comes close
    if (u.guard) {
      if (o.t === 'attack' && g.byId.get(o.id) && Math.hypot(u.x - u.guard.x, u.y - u.guard.y) < u.guard.r + 4) continue;
      let foe = null, fd = u.guard.r;
      for (const v of g.units) if (v.team === 0 && v.hp > 0 && (v.layer === 0 || u.ranged)) { const dd = Math.hypot(v.x - u.guard.x, v.y - u.guard.y); if (dd < fd) { fd = dd; foe = v; } }
      if (foe) g.orderAttack(u, foe);
      else if (Math.hypot(u.x - u.guard.x, u.y - u.guard.y) > 1.5 && o.t !== 'move') g.orderMove(u, u.guard.x, u.guard.y);
      continue;
    }
    if (u.layer === 1) {
      if (o.t === 'attack' && g.byId.get(o.id)) continue;
      // robbers go for the gift boat first, then any ship, then the shore
      let prey = u.prey ? g.byId.get(u.prey) : null; if (prey && prey.hp <= 0) prey = null;
      if (!prey) { let pd = 16; for (const v of g.units) if (v.team === 0 && v.hp > 0 && v.layer === 1) { const dd = Math.hypot(v.x - u.x, v.y - u.y) - (v.kind === 'goldboat' ? 6 : 0); if (dd < pd) { pd = dd; prey = v; } } }
      if (prey) { g.orderAttack(u, prey); continue; }
      if (u.robber) { u.order = { t: 'rland', x: RIVERIN.ne.x, y: RIVERIN.ne.y, sx: RIVERIN.ne.x, sy: RIVERIN.ne.y, troops: [], s: 'out' }; u.path = null; continue; }
      if (o.t !== 'amove' || g.t - (u._amT || 0) > 20) { const L = u.station || LANDINGS.s; g.orderAMove(u, L.x + (u.id % 3) - 1, L.y); u._amT = g.t; }
      continue;
    }
    if (!goal) continue;
    if (o.t === 'attack' && g.byId.get(o.id) && !u._blocked) continue;
    if (o.t === 'amove' && !u._blocked && g.t - (u._amT || 0) < 6) continue;
    u._blocked = false;
    // the procession is the bandits' prize on the Suphanburi road
    const bride = M.towns.suphan && g.byId.get(M.towns.suphan.bride);
    if (u.ambush && bride && bride.hp > 0) { g.orderAttack(u, bride); continue; }
    const inside = reach[Math.floor(u.y) * W + Math.floor(u.x)];
    if (inside) { g.orderAMove(u, goal.x, goal.y); u._amT = g.t; continue; }
    const wl = nearestOf(g, u, isWall, 40);
    if (wl) g.orderAttack(u, wl); else { g.orderAMove(u, goal.x, goal.y); u._amT = g.t; }
  }
}
const _ptr = Game.prototype.pathToRect, _ptp = Game.prototype.pathToPoint;
Game.prototype.pathToRect = function (u, rect, reach) { const r = _ptr.call(this, u, rect, reach); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };
Game.prototype.pathToPoint = function (u, gx, gy) { const r = _ptp.call(this, u, gx, gy); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };

/* ---------- the raid director ---------- */
function launchRaid(g, R, idx, cut) {
  const M = g.M, goal = homeGoal(g), ids = new Set(), m = DMUL[g.diff] * (cut || 1), n = (k, v) => k === 'cmdr' ? 1 : Math.max(1, Math.round(v * m));
  const mk = (k, x, y, layer) => { const p = g.openSpot(x, y, layer || 0), u = g.addUnit(k, 1, p.x, p.y); u.wave = idx; ids.add(u.id); if (k === 'cmdr') M.cmdr = u; return u; };
  const from = [];
  if (R.land) for (const e in R.land) {
    const E = ENTRY[e], kinds = [];
    for (const k in R.land[e]) for (let j = 0, c = n(k, R.land[e][k]); j < c; j++) kinds.push(k);
    kinds.sort((a, b) => (b === 'cmdr') - (a === 'cmdr'));
    kinds.forEach((k, j) => { const u = mk(k, E.x - 2 + (j % 5) * 0.9, E.y - 1 + Math.floor(j / 5) * 0.9); if (goal) { g.orderAMove(u, goal.x, goal.y); u._amT = g.t + 4; } });
    g.alerts.push({ x: E.x, y: E.y, t: 3 }); from.push(E.name);
    for (let y = Math.floor(E.y) - 3; y <= E.y + 3; y++) for (let x = Math.floor(E.x) - 3; x <= E.x + 3; x++) if (g.inb(x, y)) g.explored[y * W + x] = 1;
  }
  if (R.sea) {
    const S = RIVERIN[R.sea.from || 's']; let j = 0;
    for (const k in R.sea.boats || {}) for (let i = 0, c = n(k, R.sea.boats[k]); i < c; i++, j++) {
      const u = mk(k, S.x - (j % 2) * 1.2, S.y - Math.floor(j / 2) * 1.2, 1);
      const L = j % 2 ? LANDINGS.n : LANDINGS.s; u.station = L; g.orderAMove(u, L.x, L.y); u._amT = g.t;
    }
    for (const L of R.sea.land || []) {
      const at = LANDINGS[L.at], troops = [];
      for (const k in L.u) for (let i = 0, c = n(k, L.u[k]); i < c; i++) troops.push(k);
      const p = g.openSpot(S.x - j++ * 1.2, S.y - 1, 1), s = g.addUnit(L.k, 1, p.x, p.y);
      s.order = { t: 'rland', x: at.x, y: at.y, sx: S.x, sy: S.y, troops, wave: idx, s: 'in', name: at.name };
      ids.add(s.id);
    }
    from.push('the river');
    g.alerts.push({ x: S.x, y: S.y - 2, t: 3 });
  }
  M.cols.push({ wave: idx, ids, left: 0, done: false, final: !!R.final });
  return from;
}
// the towns you are winning over stay in plain view (lit, not greyed by the fog) until they join
const _a1Fog = Game.prototype.updateFog;
Game.prototype.updateFog = function () {
  _a1Fog.apply(this, arguments);
  const M = this.M; if (!M || M.phase < 3 || M.phase >= 5) return;
  for (const id in M.towns) { const T0 = M.towns[id]; if (T0.st === 'joined') continue;
    for (let y = Math.floor(T0.y - 5); y <= T0.y + 6; y++) for (let x = Math.floor(T0.x - 6); x <= T0.x + 6; x++) if (this.inb(x, y) && Math.hypot(x + 0.5 - T0.x, (y + 0.5 - T0.y - 1) * 1.2) <= 6) { this.visible[y * W + x] = 1; this.explored[y * W + x] = 1; } }
};
// scouts have been there: the place shows through the fog (the objective rings sit on it)
function scout(g, x, y, r) { for (let yy = Math.floor(y - r); yy <= y + r; yy++) for (let xx = Math.floor(x - r); xx <= x + r; xx++) if (g.inb(xx, yy) && Math.hypot(xx + 0.5 - x, yy + 0.5 - y) <= r) g.explored[yy * W + xx] = 1; }
function setPhase(g, n) {
  const M = g.M; if (M.phase >= n) return;
  M.phase = n; M.phaseAt[n] = M.t;
  if (n === 3) { for (const id in M.towns) scout(g, M.towns[id].x, M.towns[id].y + 1, 6); if (M.camp) scout(g, M.camp.x, M.camp.y + 1, 5.5); }
  if (n === 2) {
    M.cardQ.push('island');
    // the settlers stake out the Sala Klang in the middle of the island
    const tx = ISLE.x - 2, ty = ISLE.y - 1;
    let spot = null;
    for (let r = 0; r < 6 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r; dx++) if (g.canPlace('towncentre', tx + dx, ty + dy, 2)) { spot = { x: tx + dx, y: ty + dy }; break; }
    if (!spot) { for (const n of g.nodes) if (n.hp > 0 && n.tx >= tx && n.tx < tx + 3 && n.ty >= ty && n.ty < ty + 3) g.removeNode(n); g.cleanup(); spot = { x: tx, y: ty }; }
    const tc = g.addBuilding('towncentre', 0, spot.x, spot.y, false); M.tc = tc.id;
    for (const u of g.units) if (u.team === 0 && u.cls === 'vil' && u.hp > 0 && g.regionAt(u.x, u.y) === M.isle && (u.order.t === 'idle' || u.order.t === 'move')) g.orderBuild(u, tc);
    M.next = M.t + BANDIT_RAIDS[0].at;
    g.msg('The families are on the island. Build the Sala Klang!');
  }
  if (n === 3) {
    g.layBridges();
    M.cardQ.push('houses');
    M.raid = 0; M.next = M.t + RIVAL_RAIDS[0].at; M.rainAt = M.t + 220;
    g.msg('Bamboo bridges now join the island to both banks. Win over Lavo and Suphanburi.');
  }
  if (n === 5) { M.cardQ.push('crown'); M.next = 1e9; g.msg('Lavo and Suphanburi stand with you. Raise the Wang, the royal palace, for the coronation.'); }
}
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  if (M.aging) {
    M.aging.left -= dt;
    if (M.aging.left <= 0) { const n = M.aging.to; M.aging = null; g.applyAge(0, n); g.msg('Ayutthaya enters the ' + AGES[n].name + ': ' + AGES[n].local + '!'); }
  }
  const hero = heroUnit(g);
  // phase 1: the families reach the island
  if (M.phase === 1) {
    const vil = g.units.filter(u => u.team === 0 && u.cls === 'vil' && u.hp > 0);
    const aboard = g.units.reduce((a, s) => a + (s.cargo ? s.cargo.filter(c => c.cls === 'vil').length : 0), 0);
    M.landed = vil.filter(u => g.regionAt(u.x, u.y) === M.isle).length;
    M.need = Math.max(4, Math.min(10, vil.length + aboard));
    if (M.landed >= M.need) setPhase(g, 2);
  }
  // phase 2: the city and its first households
  if (M.phase === 2) {
    const tc = g.byId.get(M.tc);
    if (tc && tc.done && !M.settled) { M.settled = true; g.msg('The Sala Klang stands. U Thong\'s levies take up the purple of Ayutthaya.'); }
    if (tc && !tc.done && !tc.helped && M.t - M.phaseAt[2] > 2) tc.helped = true;
    const hs = g.households(0);
    if (hs.some(h => h.kind === 'rafthouse')) M.hhFish = true;
    if (hs.some(h => h.kind === 'house')) M.hhPaddy = true;
    if (tc && tc.done && M.hhFish && M.hhPaddy) setPhase(g, 3);
  }
  // raids: bandits by river in phase 2, the rival lord's men by road from phase 3 until the coronation
  if ((M.phase === 2 || M.phase === 3 || M.phase === 4) && M.t >= M.next) {
    if (M.phase === 2) {
      const R = BANDIT_RAIDS[Math.min(M.raid, BANDIT_RAIDS.length - 1)];
      const from = launchRaid(g, R, M.raid); g.msg('Bandit rafts are coming down ' + from.join(' and ') + '!');
      M.raid++; M.next = M.t + (BANDIT_RAIDS[Math.min(M.raid, BANDIT_RAIDS.length - 1)].at);
    } else {
      const R = RIVAL_RAIDS[Math.min(M.raid, RIVAL_RAIDS.length - 1)], cut = M.campDown ? 0.6 : 1;
      const from = launchRaid(g, R, 100 + M.raid, cut); g.msg('The rival lord\'s men come by ' + from.join(' and by ') + '!');
      M.raid++; M.next = M.t + (RIVAL_RAIDS[Math.min(M.raid, RIVAL_RAIDS.length - 1)].at) * (M.campDown ? 1.3 : 1);
    }
  }
  if (!M.finalOn && M.next - M.t <= 20 && M.warned !== M.raid + '|' + M.phase && M.phase >= 2) {
    M.warned = M.raid + '|' + M.phase;
    g.msg(M.phase === 2 ? 'Scouts: bandit rafts on the river.' : 'Scouts: the rival lord\'s men are gathering.');
  }
  // the procession: bandits wait in the trees by the road
  const S = M.towns.suphan;
  if (S && S.st === 'wed') {
    const b = g.byId.get(S.bride);
    if (b && b.hp > 0) {
      if (!S.ambush && Math.hypot(b.x - S.x, b.y - S.y) < 17) {
        S.ambush = true;
        const kinds = { bd_sword: 3, bd_archer: 2 }; let i = 0;
        for (const k in kinds) for (let j = 0, n = Math.max(1, Math.round(kinds[k] * DMUL[g.diff])); j < n; j++, i++) {
          const p = g.openSpot(16 + (i % 3), 44 + Math.floor(i / 3), 0), u = g.addUnit(k, 1, p.x, p.y); u.ambush = true; g.orderAttack(u, b);
        }
        g.msg('Bandits break from the trees to seize the bride!'); g.alerts.push({ x: 16, y: 44, t: 3 });
      }
      if (b.order.t === 'idle' && Math.hypot(b.x - S.x, b.y - S.y) > 4) g.orderMove(b, S.x + 1, S.y + 3.5);
      if (Math.hypot(b.x - S.x, b.y - (S.y + 2)) < 3.2) { b.hp = 0; b.silent = true; g.joinTown('suphan', 'wed'); }
    }
  }
  // the gift boats
  const L = M.towns.lavo;
  for (const u of g.units) if (u.kind === 'goldboat' && u.hp > 0) {
    if (Math.hypot(u.x - TOWNS.lavo.land.x, u.y - TOWNS.lavo.land.y) < 2.6) {
      u.hp = 0; u.silent = true; L.n++;
      if (L.n >= 3) g.joinTown('lavo', 'trade');
      else { L.st = 'trade'; g.msg('The gifts reach Lavo (' + L.n + ' of 3). Lavo\'s lords are listening.'); }
    } else if (u.order.t === 'idle') g.orderMove(u, TOWNS.lavo.land.x, TOWNS.lavo.land.y);
  }
  // a town taken by force falls with its hall
  for (const id in M.towns) {
    const T0 = M.towns[id];
    if (T0.st === 'force') { const h = g.byId.get(T0.hall); if (!h || h.hp <= 0) g.joinTown(id, 'force'); }
  }
  // the rival lord's stockade: burning it pays and thins his raids
  if (M.camp && !M.campDown && !g.buildings.some(b => b.camp && b.hp > 0)) {
    M.campDown = true; g.res[0].gold += 200; g.res[0].food += 150; M.spoils += 200;
    g.msg('The rival lord\'s stockade burns! Spoils: +200 gold, +150 food. His raids will be fewer and smaller.');
  }
  // phase 3 to 5: both towns joined
  if (M.phase >= 3 && M.phase < 5 && Object.values(M.towns).every(t => t.st === 'joined')) setPhase(g, 5);
  // the rains
  if (M.phase >= 3 && !M.rainOn && !M.rainDone) {
    if (!M.rainAt) M.rainAt = M.t + 220;
    if (Object.values(M.towns).some(t => t.st === 'joined') && M.rainAt > M.t + 30) M.rainAt = M.t + 30;
    if (M.rainAt - M.t <= 20 && !M.rainWarned) { M.rainWarned = true; g.msg('The sky darkens over the hills: the rains are coming. The fields on the plain will flood.'); }
    if (M.t >= M.rainAt) { M.rainOn = true; M.rainEnd = M.t + RAIN.len; if (M.phase === 3) M.phase = 4, M.phaseAt[4] = M.t; M.cardQ.push('rains'); }
  }
  if (M.rainOn && M.t >= M.rainEnd) { M.rainOn = false; M.rainDone = true; if (M.phase === 4) M.phase = 3; g.msg('The rains end. The water goes down and leaves rich silt on the fields.'); }
  if (M.rainOn && M.phase === 3) M.phase = 4;
  // phase 5: the Wang and the coronation
  if (M.phase === 5) {
    const pal = g.buildings.find(b => b.team === 0 && b.kind === 'palace' && b.hp > 0);
    if (pal && pal.done && !M.palace) {
      M.palace = pal.id; M.finalOn = true; M.cardQ.push('final');
      launchRaid(g, FINAL, 200, M.campDown ? 0.65 : 1);
      g.msg('The rival lord comes himself, on his war elephant, to stop the coronation!');
    }
    if (M.palace && pal && pal.id === M.palace && hero && Math.hypot(hero.x - pal.x, hero.y - pal.y) < pal.size / 2 + 5) {
      M.crown = Math.min(CROWN, M.crown + dt);
      if (M.crown >= CROWN && !M.cards.closing) { M.cards.closing = true; M.crowned = true; M.cardQ.push('closing'); }
    }
  }
  // raids broken: spoils
  const alive = new Map();
  for (const u of g.units) if (u.team === 1 && u.hp > 0) alive.set(u.id, u);
  const fights = (u) => u.layer !== 1 || (u.order.t === 'rland' && u.order.s !== 'out' && u.order.troops && u.order.troops.length > 0);
  for (const c of M.cols) {
    if (c.done) continue;
    let n = 0; for (const id of c.ids) { const u = alive.get(id); if (u && fights(u)) n++; }
    c.left = n;
    if (n === 0 && g.t > 1) {
      c.done = true; M.broken++;
      for (const id of c.ids) { const u = alive.get(id); if (u && u.layer === 1) { const E = RIVERIN.s; u.order = { t: 'rland', x: E.x, y: E.y, sx: E.x, sy: E.y, troops: [], s: 'out' }; u.path = null; } }
      const gold = 40 + Math.min(M.broken, 8) * 15, food = 40 + Math.min(M.broken, 8) * 15;
      g.res[0].gold += gold; g.res[0].food += food; M.spoils += gold;
      g.msg((c.final ? 'The rival lord\'s army is broken!' : 'The raid is broken!') + ' Spoils: +' + gold + ' gold, +' + food + ' food.');
    }
  }
  M.active = M.cols.some(c => !c.done);
  if (M.cmdrDead && !M.routed) {
    M.routed = true; M.cardQ.push('rout');
    for (const c of M.cols) c.done = true;
    for (const u of g.units) if (u.team === 1 && u.hp > 0 && !u.guard) {
      if (u.layer === 1) { const E = RIVERIN.s; u.order = { t: 'rland', x: E.x, y: E.y, sx: E.x, sy: E.y, troops: [], s: 'out' }; u.path = null; continue; }
      u.order = { t: 'flee2', x: ENTRY.se.x, y: ENTRY.se.y }; u.path = null;
    }
    g.msg('The rival lord has fallen! His men break and run for the hills.');
  }
}
// "Next raid now" is not offered here: the story sets the pace

/* naval combat: arrows and boarding only in 1351. Ayutthaya builds in teak */
NAVWPN.tierDefault = 0;
BURNMAT[0] = 1; BURNMAT[1] = 1;
// on the river the families have no houses yet: room for everyone who set out
const _popCap = Game.prototype.popCap;
Game.prototype.popCap = function (team) { const c = _popCap.call(this, team); return team === 0 && this.M && this.M.phase === 1 ? Math.max(c, 25) : c; };

// The Wang Luang can't be demolished (the Sala Klang is a town centre, blocked in main).
const _a1CanDemolish = Game.prototype.canDemolish;
Game.prototype.canDemolish = function (b) { return _a1CanDemolish.call(this, b) && !(this.M && b.id === this.M.palace); };

/* hand-made map: keep every tree (the main game thins woods on random maps, v0.9.40) */
Game.prototype.openWoods = function () {};
