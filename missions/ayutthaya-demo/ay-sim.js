/* ===== ay-sim.js ===== */
/* ==========================================================================
   Ayutthaya demo: "The Fall of Angkor" (1431), a Kingdom Age siege.
   The player's royal camp lies west of Yasodharapura (Angkor Thom). Burn the timber town outside
   the moat, take the outworks, break a gate with the Chang Suek war elephants, then carry the
   king to the royal palace and raise his banner. The Khmer walls are laterite and sandstone:
   fire barely touches them, and only elephants break the gates.
   Sim side only (no DOM): data, map, households, fire, gates, sorties and the Khmer garrison.
   ========================================================================== */

const DMUL = { easy: 0.7, normal: 1, hard: 1.35 };
const HERO_BACK = 60;              // the fallen king is carried to the camp and returns this many seconds later
const POP_CAP = 120;               // Ayutthaya's sakdina registers call up more men than its neighbours
// HOUSEHOLD ({ every: 60, food: 15, max: 6 }) comes from the main game
const LBURN = { rate: 6, stone: 0.25 };   // damage per second while a building burns; stone burns at a quarter
const BURN_GOAL = 9;               // timber buildings to burn in the outer town
const BANNER_T = 20;               // seconds the king must hold the palace court
STARTS[0] = { x: 5, y: 21 }; STARTS[1] = { x: 47, y: 13 };

/* ---------- the city ---------- */
const CITY = { x0: 37, y0: 8, x1: 58, y1: 38 };
const GATES = {
  w: { tx: 36, ty: 22, name: 'West Gate', out: [33.5, 23.5], in: [40.5, 23.5] },
  n: { tx: 47, ty: 7, name: 'North Gate', out: [48.5, 3.5], in: [48.5, 11.5] },
  s: { tx: 47, ty: 37, name: 'South Gate', out: [48.5, 42.5], in: [48.5, 35] },
  e: { tx: 57, ty: 22, name: 'Gate of Victory', out: [62.5, 23.5], in: [55, 23.5] }
};
const AYS = { tc: [5, 21], palace: [47, 13], bayon: [46, 21] };
const LAKE_Y = 44;

/* ---------- units ---------- */
Object.assign(UD, {
  // Ayutthaya's village workers are women, who carry a quarter more (lore/civ-playbook.md)
  villager: Object.assign({}, UD.villager, { name: 'Phrai Ying (Village woman)', carry: 12.5, ayu: 'villager' }),
  daab: { name: 'Daab Song Mue (Twin swords)', hp: 60, spd: 2.5, atk: 9, bonus: { archer: 4 }, rng: 0.85, rate: 1.0, ma: 1, pa: 2, sight: 6.5, cost: { food: 55, gold: 20 }, time: 9, cls: 'sword', ayu: 'sword' },
  hok: { name: 'Phon Hok (Spearman)', hp: 52, spd: 2.3, atk: 5, bonus: { sword: 4, eleph: 14, siege: 6 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: { food: 40, wood: 25 }, time: 9, cls: 'spear', ayu: 'spear' },
  thanu: { name: 'Phon Thanu (Fire archer)', hp: 32, spd: 2.2, atk: 6, bonus: { spear: 3 }, rng: 6, rate: 1.6, ma: 0, pa: 0, sight: 7.5, cost: { wood: 30, gold: 30 }, time: 10, cls: 'archer', ranged: true, ayu: 'archer', fire: { dmg: 5, burn: 7 } },
  mo: { name: 'Mo (Physician)', hp: 30, spd: 2.2, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 7, cost: { food: 40, gold: 40 }, time: 11, cls: 'healer', heal: { amt: 5, rate: 1, rng: 3 }, healer: 0 },
  chang: { name: 'Chang Suek (War elephant)', hp: 520, spd: 2.0, atk: 15, bonus: { sword: 4, archer: 4 }, rng: 1.15, rate: 1.6, ma: 3, pa: 4, sight: 7, cost: { food: 160, gold: 110 }, time: 24, cls: 'eleph', pop: 3, bld: 28, gate: 20, trample: 12, big: 'chang' },
  king: { name: 'King Borommarachathirat II', hp: 1000, spd: 2.1, atk: 20, bonus: { sword: 4 }, rng: 1.15, rate: 1.5, ma: 4, pa: 5, sight: 8.5, cost: {}, time: 0, cls: 'eleph', hero: 'king', aura: { r: 5, atk: 2 }, bld: 28, gate: 20, trample: 14, big: 'king' },
  boat: Object.assign({}, UD.boat, { name: 'Ruea Pramong (Fishing boat)', civ: null }),
  light: Object.assign({}, UD.light, { name: 'Ruea Chai (War boat)', civ: null }),
  // the Khmer of Yasodharapura (lore/khmer.md)
  k_vil: { name: 'Neak Srae (Rice farmer)', hp: 25, spd: 2.1, atk: 2, rng: 0.85, rate: 1.5, ma: 0, pa: 0, sight: 5, cost: {}, time: 0, cls: 'vil', carry: 10, km: 'villager' },
  k_shield: { name: 'Shield infantry', hp: 62, spd: 2.3, atk: 8, bonus: { archer: 3 }, rng: 0.85, rate: 1.0, ma: 2, pa: 4, sight: 6.5, cost: {}, time: 0, cls: 'sword', km: 'sword' },
  k_spear: { name: 'Khmer spearman', hp: 52, spd: 2.3, atk: 5, bonus: { eleph: 10, sword: 3 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: {}, time: 0, cls: 'spear', km: 'spear' },
  k_archer: { name: 'Sna (Crossbowman)', hp: 32, spd: 2.2, atk: 7, bonus: { spear: 3 }, rng: 6.5, rate: 2.2, ma: 0, pa: 1, sight: 7.5, cost: {}, time: 0, cls: 'archer', ranged: true, km: 'archer' },
  k_bal: { name: 'Ballista Elephant', hp: 400, spd: 1.8, atk: 14, bonus: { eleph: 14 }, rng: 7, rate: 3.2, ma: 3, pa: 4, sight: 8, cost: {}, time: 0, cls: 'eleph', ranged: true, big: 'kbal', bld: 15 },
  k_cart: { name: 'Cart Ballista', hp: 150, spd: 1.4, atk: 16, bonus: { eleph: 18 }, rng: 8, rate: 4.5, ma: 2, pa: 5, sight: 8.5, cost: {}, time: 0, cls: 'siege', ranged: true, big: 'kcart' },
  k_vaidya: { name: 'Vaidya (Physician)', hp: 30, spd: 2.2, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 7, cost: {}, time: 0, cls: 'healer', heal: { amt: 4, rate: 1, rng: 3 }, healer: 1 },
  k_canoe: { name: 'Khmer war canoe', hp: 90, spd: 3.2, atk: 5, rng: 4.5, rate: 1.8, ma: 1, pa: 1, sight: 7, cost: {}, time: 0, cls: 'ship', ranged: true, layer: 1, slot: 'light' }
});
TEAMMOD[1] = { hp: 1, spd: 1, cost: 1, arm: 0 };
Object.assign(ORDER_CLS, { eleph: 0.4, siege: 3.8 });
Object.assign(CIV_NAMES, {
  villager: ['Phrai Ying (Village woman)', null], boat: ['Ruea Pramong (Fishing boat)', null], light: ['Ruea Chai (War boat)', null],
  house: ['Ruean Thai (Stilt house)', null], farm: ['Na (Rice paddy)', 'Khmer rice field'], granary: ['Yung Khao (Granary)', null],
  barracks: ['Rong Thahan (Barracks)', null], port: ['Tha Ruea (Landing)', null], tower: ['Pom (Bastion)', null],
  towncentre: ['Khai Luang (Royal camp)', null]
});

/* ---------- buildings ---------- */
Object.assign(BD, {
  // Ayutthaya
  raft: { name: 'Ruean Phae (Raft house)', size: 2, hp: 220, pop: 5, drop: ['food'], cost: { wood: 25 }, time: 12, shore: true, sight: 4 },
  rong: { name: 'Rong (Storehouse)', size: 2, hp: 380, drop: ['wood', 'gold'], cost: { wood: 100 }, time: 18, sight: 4 },
  wat: { name: 'Wat (Temple)', size: 3, hp: 700, cost: { wood: 120, gold: 40 }, time: 28, train: ['mo'], aura: { rng: 3, amt: 1, max: 8 }, sight: 5 },
  phaniat: { name: 'Phaniat (Elephant kraal)', size: 3, hp: 900, cost: { wood: 180, gold: 60 }, time: 35, train: ['chang'], needs: 'barracks', sight: 6 },
  wall: { name: 'Khai (Palisade)', size: 1, hp: 260, cost: { wood: 8 }, time: 4, sight: 3, arm: { ma: 3, pa: 8 } },
  gate: { name: 'Pratu Khai (Palisade gate)', size: 1, hp: 500, cost: { wood: 30 }, time: 8, sight: 4, arm: { ma: 3, pa: 8 } },
  // Khmer
  kwall: { name: 'Laterite wall', size: 1, hp: 4000, cost: null, time: 0, sight: 3, arm: { ma: 14, pa: 30 }, stone: true, noburn: true },
  kgate: { name: 'Face gate', size: 3, hp: 4500, cost: null, time: 0, sight: 6, arm: { ma: 10, pa: 30 }, stone: true, noburn: true, atk: { dmg: 6, range: 6.5, rate: 2.0 } },
  ktower: { name: 'Face tower', size: 2, hp: 900, cost: null, time: 0, sight: 9, arm: { ma: 4, pa: 10 }, stone: true, atk: { dmg: 7, range: 7.5, rate: 1.7 } },
  kpalace: { name: 'Royal Palace', size: 3, hp: 3000, cost: null, time: 0, sight: 7, stone: true, keep: true },
  bayon: { name: 'The Bayon', size: 4, hp: 99999, cost: null, time: 0, neutral: true, sight: 0 },
  karogya: { name: 'Arogyasala (Hospital)', size: 3, hp: 1100, cost: null, time: 0, sight: 5, stone: true, aura: { rng: 3, amt: 2, max: 8 } },
  kbarracks: { name: 'Khmer barracks', size: 3, hp: 900, cost: null, time: 0, sight: 6 },
  khouse: { name: 'Stilt house', size: 2, hp: 420, cost: null, time: 0, sight: 4, timber: true },
  kgranary: { name: 'Rice store', size: 2, hp: 480, cost: null, time: 0, sight: 4, timber: true, drop: ['food'] }
});
// Kingdom Age: the royal camp shoots arrows, towers are brick bastions; houses are household drop-offs
Object.assign(BD.towncentre, { name: 'Khai Luang (Royal camp)', hp: 2400, pop: 15, atk: { dmg: 7, range: 7, rate: 1.7 }, train: ['villager'] });
Object.assign(BD.tower, { hp: 750, civHp: null, atk: { dmg: 7, range: 7.5, rate: 1.7 }, cost: { wood: 90, gold: 40 } });
BD.house.drop = ['food'];
BD.barracks.train = ['daab', 'hok', 'thanu'];
BD.port.train = ['boat', 'light']; BD.port.cost = { wood: 100 };
BD.granary.cost = { wood: 80 };
BD.farm.food = 600;
for (const k of ['palace', 'tradepost', 'rumahtabib', 'patirthan', 'mill', 'goldmine']) delete BD[k];
BUILD_ORDER.length = 0;
for (const k of ['house', 'farm', 'granary', 'rong', 'barracks', 'phaniat', 'wat', 'tower', 'wall', 'gate', 'port']) BUILD_ORDER.push(k);
const TIMBER = (b) => !BD[b.kind].stone;

/* ---------- Khmer sorties: who comes out of a gate, in order ---------- */
const SORTIES = [
  { k_shield: 3, k_spear: 2 },
  { k_shield: 3, k_spear: 2, k_archer: 2 },
  { k_shield: 4, k_spear: 3, k_archer: 3 },
  { k_shield: 4, k_spear: 4, k_archer: 3, k_bal: 1 },
  { k_shield: 5, k_spear: 4, k_archer: 4, k_bal: 1 },
  { k_shield: 6, k_spear: 5, k_archer: 4, k_bal: 1, k_cart: 1 }
];
const SORTIE = { first: 110, gap: 95 };
const LEVY = { every: 30, cap: 80 };   // the city musters a fresh soldier this often while its barracks stand
const GATE_MEND = { calm: 6, rate: 6 };   // Khmer workers shore up a gate that has not been struck for a while

/* ---------- map ---------- */
Game.prototype.genMap = function () { genAngkor(this); };
Game.prototype.populate = function () { popAngkor(this); };
function cityDist(x, y) { return Math.max(CITY.x0 - x, 0, x - CITY.x1, CITY.y0 - y, 0, y - CITY.y1); }
function inCity(x, y) { return x > CITY.x0 && x < CITY.x1 && y > CITY.y0 && y < CITY.y1; }
function onCauseway(x, y) {
  for (const k in GATES) {
    const g = GATES[k];
    if (k === 'w' || k === 'e') { if (y >= g.ty && y <= g.ty + 2) return true; }
    else if (x >= g.tx && x <= g.tx + 2) return true;
  }
  return false;
}
function genAngkor(g) {
  const terr = g.terrain, s = g.seed;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) terr[y * W + x] = fbm(x * 0.13, y * 0.13, s + 3) > 0.7 ? T.DIRT : T.GRASS;
  // the Tonlé Sap's floodplain to the south
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const edge = LAKE_Y + Math.max(0, Math.round((fbm(x * 0.25, 2, s + 5) - 0.5) * 2.4));
    if (y >= edge + 1) terr[y * W + x] = T.DEEP; else if (y >= edge) terr[y * W + x] = T.SHALLOW;
  }
  // the West Baray: a great rectangular reservoir, banked with earth
  for (let y = 16; y <= 26; y++) for (let x = 16; x <= 27; x++) {
    const rim = x === 16 || x === 27 || y === 16 || y === 26, edge = x === 17 || x === 26 || y === 17 || y === 25;
    terr[y * W + x] = rim ? T.DIRT : edge ? T.SHALLOW : T.DEEP;
  }
  terr[21 * W + 21] = T.SAND; terr[21 * W + 22] = T.SAND;   // the island of the West Mebon
  // the moat around Angkor Thom, crossed by a causeway at each gate
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = cityDist(x, y);
    if (d === 2 || d === 3) terr[y * W + x] = onCauseway(x, y) ? T.DIRT : (d === 3 ? T.SHALLOW : T.DEEP);
    else if (d === 1 || (d === 0)) terr[y * W + x] = T.DIRT;
    else if (inCity(x, y) && terr[y * W + x] === T.DIRT && hash2(x, y, s) < 0.5) terr[y * W + x] = T.GRASS;
  }
  // sand where the lake meets the land
  const snap = terr.slice();
  for (let y = 1; y < H - 1; y++) for (let x = 0; x < W; x++) {
    if (snap[y * W + x] > T.SAND || y < LAKE_Y - 3) continue;
    if (snap[(y + 1) * W + x] === T.SHALLOW) terr[y * W + x] = T.SAND;
  }
}
function popAngkor(g) {
  const rng = g.rng, M = g.M = newMission(g);
  const free = (x, y) => g.freeTile(x, y) && !g.reserve[y * W + x];
  const camp = (x, y) => Math.hypot(x - 7, y - 22) < 9;
  const place = (kind, cx, cy, spread, count) => {
    let n = 0;
    for (let i = 0; i < count * 16 && n < count; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * spread, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (!free(x, y) || inCity(x, y) || cityDist(x, y) < 4) continue;
      g.addNode(kind, x, y); n++;
    }
  };
  // roads: camp to each gate, round both sides of the Baray
  g.reserveRoute(8, 21, 33, 23); g.reserveRoute(8, 20, 48, 3); g.reserveRoute(8, 24, 48, 42);
  g.reserveRoute(16, 14, 33, 23); g.reserveRoute(16, 28, 33, 23); g.reserveRoute(48, 3, 62, 23);
  /* --- the city: laterite walls with four gates --- */
  const gateTiles = (x, y) => { for (const k in GATES) { const q = GATES[k]; if (x >= q.tx && x <= q.tx + 2 && y >= q.ty && y <= q.ty + 2) return true; } return false; };
  for (let y = CITY.y0; y <= CITY.y1; y++) for (let x = CITY.x0; x <= CITY.x1; x++) {
    if (x !== CITY.x0 && x !== CITY.x1 && y !== CITY.y0 && y !== CITY.y1) continue;
    if (gateTiles(x, y)) continue;
    g.addBuilding('kwall', 1, x, y, true);
  }
  M.gates = {};
  for (const k in GATES) { const q = GATES[k]; const b = g.addBuilding('kgate', 1, q.tx, q.ty, true); b.gk = k; M.gates[k] = b.id; }
  // inside: the Bayon, the royal palace, the hospital, barracks and houses
  const bay = g.addBuilding('bayon', 2, AYS.bayon[0], AYS.bayon[1], true);
  const pal = g.addBuilding('kpalace', 1, AYS.palace[0], AYS.palace[1], true); M.palace = pal.id;
  g.addBuilding('karogya', 1, 52, 28, true);
  g.addBuilding('kbarracks', 1, 41, 30, true);
  for (const [x, y] of [[54, 11], [41, 11], [53, 33], [41, 15], [53, 15]]) g.addBuilding('khouse', 1, x, y, true);
  for (const [x, y] of [[40, 19], [40, 26], [51, 10], [44, 35], [55, 26]]) g.addBuilding('ktower', 1, x, y, true);
  /* --- the outer town: timber houses and rice stores outside the moat --- */
  M.outer = [];
  const outer = (kind, x, y) => { const b = g.addBuilding(kind, 1, x, y, true); b.outer = true; M.outer.push(b.id); return b; };
  for (const [x, y] of [[30, 9], [30, 13], [28, 29], [31, 32], [30, 36], [40, 1], [55, 1], [41, 42], [54, 42]]) outer('khouse', x, y);
  for (const [x, y] of [[29, 16], [29, 27], [45, 1]]) outer('kgranary', x, y);
  const kf = [];
  for (const [x, y] of [[27, 11], [27, 33], [51, 1]]) kf.push(g.addBuilding('farm', 1, x, y, true));
  // the outworks: two face towers guarding the west causeway
  M.outposts = [];
  for (const [x, y] of [[31, 20], [31, 25]]) { const b = g.addBuilding('ktower', 1, x, y, true); b.outpost = true; b.maxHp = b.hp = 1400; M.outposts.push(b.id); }
  /* --- the royal camp of Ayutthaya --- */
  const tc = g.addBuilding('towncentre', 0, AYS.tc[0], AYS.tc[1], true);
  // households: a stilt house beside its paddy
  for (const [hx, hy, fx, fy] of [[2, 16, 2, 18], [2, 26, 2, 28], [9, 27, 11, 27], [9, 15, 11, 15]]) { g.addBuilding('house', 0, hx, hy, true); g.addBuilding('farm', 0, fx, fy, true); }
  for (const [x, y] of [[2, 12], [2, 33]]) g.addBuilding('house', 0, x, y, true);
  g.addBuilding('barracks', 0, 10, 20, true);
  g.addBuilding('phaniat', 0, 5, 11, true);
  g.addBuilding('wat', 0, 5, 30, true);
  g.addBuilding('rong', 0, 9, 31, true);
  // trees: woods to the north-west and south-west, groves between the Baray and the moat
  const grove = (cx, cy, rx, ry, dens) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!g.inb(x, y) || Math.hypot((x - cx) / rx, (y - cy) / ry) > 1 || !free(x, y) || camp(x, y) || inCity(x, y) || cityDist(x, y) < 4) continue;
      if (hash2(x, y, g.seed + 61) < dens) g.addNode('tree', x, y);
    }
  };
  for (const [cx, cy, rx, ry, d] of [[6, 4, 6, 3.5, 0.75], [6, 38.5, 6, 3, 0.75], [20, 6, 4.5, 3, 0.55], [21, 35, 4.5, 3, 0.55], [16, 1.5, 3, 1.5, 0.6],
    [33, 4, 2, 2, 0.4], [33, 40, 2, 2, 0.4], [13, 11, 2, 1.5, 0.5], [13, 33, 2, 1.5, 0.5], [62, 8, 1.5, 4, 0.6], [62, 36, 1.5, 4, 0.6]]) grove(cx, cy, rx, ry, d);
  // sugar palms dotted over the plain
  for (let i = 0; i < 70; i++) { const x = 1 + Math.floor(rng() * (W - 2)), y = 1 + Math.floor(rng() * (H - 2)); if (free(x, y) && !camp(x, y) && !inCity(x, y) && cityDist(x, y) > 4 && hash2(x, y, 31) < 0.4) g.addNode('tree', x, y); }
  for (let i = 0; i < 26; i++) { const x = CITY.x0 + 2 + Math.floor(rng() * 18), y = CITY.y0 + 2 + Math.floor(rng() * 27); if (free(x, y) && hash2(x, y, 37) < 0.5 && Math.hypot(x - 48, y - 18) > 7) g.addNode('tree', x, y); }
  // food and gold
  place('berry', 2, 22, 1.4, 5);
  place('gold', 14, 12.5, 1.3, 5); place('gold', 14, 29, 1.3, 5); place('gold', 24, 2.5, 1.5, 5); place('gold', 24, 40, 1.4, 5);
  for (const [x, y] of [[18, 12], [18, 30]]) for (let i = 0; i < 3; i++) { const p = g.nearestFree(x + i, y + (i % 2), 0, 4); const d = g.addUnit('deer', 2, p.x + 0.5, p.y + 0.5); d.order = { t: 'wander', next: 2 + rng() * 5 }; }
  for (let i = 0, n = 0; i < 600 && n < 10; i++) { const x = 2 + Math.floor(rng() * 34), y = LAKE_Y + 1 + Math.floor(rng() * 3); if (g.inb(x, y) && g.isWater(x, y) && !g.block[y * W + x] && g.terrain[y * W + x] === T.DEEP) { g.addNode('fish', x, y); n++; } }
  for (let i = 0, n = 0; i < 300 && n < 4; i++) { const x = 18 + Math.floor(rng() * 8), y = 18 + Math.floor(rng() * 7); if (g.terrain[y * W + x] === T.DEEP && !g.block[y * W + x]) { g.addNode('fish', x, y); n++; } }
  /* --- people --- */
  const put = (kind, team, x, y) => { const p = g.openSpot(x, y, UD[kind].layer || 0); return g.addUnit(kind, team, p.x, p.y); };
  const farms = g.buildings.filter(b => b.kind === 'farm' && b.team === 0);
  for (const f of farms) { const v = put('villager', 0, f.x, f.y + 1); g.orderGather(v, f); }
  for (let i = 0; i < 3; i++) { const v = put('villager', 0, 12 + i, 21); const n = g.nearestNode(14, 12.5, 'gold', 0, 8, 0); if (n) g.orderGather(v, n); }
  for (let i = 0; i < 3; i++) { const v = put('villager', 0, 12 + i, 26); const n = g.nearestNode(9, 37, 'wood', 0, 12, 0); if (n) g.orderGather(v, n); }
  put('villager', 0, 4, 25); put('villager', 0, 6, 25);
  M.king = put('king', 0, 14.5, 22.5);
  for (let i = 0; i < 2; i++) put('chang', 0, 14.5, 19.5 + i * 6);
  for (let i = 0; i < 5; i++) put('daab', 0, 12.6 + (i % 3) * 0.9, 17.6 + Math.floor(i / 3) * 0.9);
  for (let i = 0; i < 5; i++) put('hok', 0, 12.6 + (i % 3) * 0.9, 23.6 + Math.floor(i / 3) * 0.9);
  for (let i = 0; i < 6; i++) put('thanu', 0, 12.6 + (i % 3) * 0.9, 26.4 + Math.floor(i / 3) * 0.9);
  put('mo', 0, 13, 21.5);
  // the Khmer: farmers in the outer town, the garrison at each gate, the palace guard, canoes on the lake
  for (const f of kf) for (let i = 0; i < 2; i++) { const v = put('k_vil', 1, f.x, f.y + 1.5); g.orderGather(v, f); v.kv = true; }
  const garrison = (comp, x, y, r) => {
    for (const k in comp) {
      const n = Math.max(1, Math.round(comp[k] * DMUL[g.diff]));
      for (let i = 0; i < n; i++) { const u = put(k, 1, x + (rng() - 0.5) * 2.5, y + (rng() - 0.5) * 2.5); u.post = { x: u.x, y: u.y, r: r || 8 }; }
    }
  };
  M.posts = [[41.5, 23.5], [48.5, 12], [48.5, 34.5], [54.5, 23.5], [48.5, 17.5]];
  garrison({ k_shield: 6, k_spear: 4, k_archer: 3, k_cart: 1 }, 41.5, 23.5);
  garrison({ k_shield: 3, k_spear: 3, k_archer: 3 }, 48.5, 12);
  garrison({ k_shield: 3, k_spear: 3, k_archer: 3 }, 48.5, 34.5);
  garrison({ k_shield: 3, k_archer: 3 }, 54.5, 23.5);
  garrison({ k_shield: 6, k_spear: 5, k_archer: 4, k_bal: 2, k_vaidya: 1 }, 48.5, 17.5, 6);
  garrison({ k_spear: 3, k_bal: 1, k_vaidya: 1 }, 44, 28, 6);
  // the outwork's guard at the head of the west causeway
  garrison({ k_shield: 4, k_archer: 2 }, 31.5, 23.5, 7);
  for (const [x, y] of [[20, 46], [44, 46.5]]) { const c = put('k_canoe', 1, x, y); c.patrol = [[8, 46], [56, 46.5]]; c.pi = x < 30 ? 0 : 1; }
  g.res[0] = { food: 500, wood: 500, gold: 400 };
  for (let i = 0; i < W * H; i++) g.explored[i] = 1;
  g.wallMasks();
}

/* ---------- mission state ---------- */
function newMission(g) {
  return { t: 0, phase: 1, next: SORTIE.first, sortie: 0, warned: -1, cardQ: [], cards: {}, burned: 0, outDown: 0,
    heroBack: {}, banner: 0, won: false, why: null, fled: 0, tramples: 0, households: 0, hhT: HOUSEHOLD.every, breach: null, gateHits: 0 };
}

/* ---------- walls (player palisade + Khmer laterite) join up with their neighbours ---------- */
const isWallKind = (k) => k === 'wall' || k === 'gate' || k === 'kwall' || k === 'kgate';
Game.prototype.wallMasks = function () {
  this.wallGrid = new Int32Array(W * H);
  for (const b of this.buildings) if (b.hp > 0 && isWallKind(b.kind)) for (let y = b.ty; y < b.ty + b.size; y++) for (let x = b.tx; x < b.tx + b.size; x++) this.wallGrid[y * W + x] = b.id;
  const at = (x, y) => this.inb(x, y) && this.wallGrid[y * W + x] > 0;
  for (const b of this.buildings) if (b.kind === 'wall' || b.kind === 'kwall') b.mask = (at(b.tx, b.ty - 1) ? 1 : 0) | (at(b.tx + 1, b.ty) ? 2 : 0) | (at(b.tx, b.ty + 1) ? 4 : 0) | (at(b.tx - 1, b.ty) ? 8 : 0);
};
Game.prototype.setGate = function (b, open) {
  if (!b || b.kind !== 'gate' || b.hp <= 0 || !b.done) return false;
  if (!open && this.units.some(u => u.hp > 0 && u.layer === 0 && Math.floor(u.x) === b.tx && Math.floor(u.y) === b.ty)) { b.closing = true; return false; }
  b.open = open; b.closing = false;
  this.block[b.ty * W + b.tx] = open ? 0 : 1;
  for (const u of this.units) if (u.path) u.path = null;
  return true;
};
const _addBuilding = Game.prototype.addBuilding;
Game.prototype.addBuilding = function (kind, team, tx, ty, done) {
  const b = _addBuilding.call(this, kind, team, tx, ty, done);
  if (isWallKind(kind) && this.wallGrid) this.wallMasks();
  return b;
};
const _finishBuilding = Game.prototype.finishBuilding;
Game.prototype.finishBuilding = function (b) {
  _finishBuilding.call(this, b);
  if (b.kind === 'gate') { b.open = true; this.block[b.ty * W + b.tx] = 0; }
};
const _cleanup = Game.prototype.cleanup;
Game.prototype.cleanup = function () {
  const n = this.buildings.length;
  _cleanup.call(this);
  if (this.buildings.length !== n) { if (this.wallGrid) this.wallMasks(); this._reachIn = null; }
};

/* ---------- population: elephants take 3, Ayutthaya can field 120 ---------- */
Game.prototype.popOf = function (team) { let n = 0; for (const u of this.units) if (u.team === team && u.hp > 0) n += UD[u.kind].pop || 1; return n; };
Game.prototype.popCap = function (team) {
  let c = 0; for (const b of this.buildings) if (b.team === team && b.done && b.hp > 0) c += BD[b.kind].pop || 0;
  return Math.min(team === 0 ? POP_CAP : MAXPOP, c);
};
const _queueUnit = Game.prototype.queueUnit;
Game.prototype.queueUnit = function (b, kind, team) {
  const d = UD[kind];
  if (d && d.pop > 1 && this.popOf(b.team) + d.pop > this.popCap(b.team) && b.team === 0) return 'A war elephant needs room for 3 population. Build more houses.';
  return _queueUnit.call(this, b, kind, team);
};

/* ---------- households: a house, the paddy beside it, and a villager working that paddy ---------- */
Game.prototype.households = function () {
  const out = [];
  const houses = this.buildings.filter(b => b.team === 0 && b.done && b.hp > 0 && (b.kind === 'house' || b.kind === 'raft'));
  const farms = this.buildings.filter(b => b.team === 0 && b.done && b.hp > 0 && b.kind === 'farm');
  const worked = new Set();
  for (const u of this.units) if (u.team === 0 && u.hp > 0 && u.order.t === 'gather' && u.order.type === 'food') worked.add(u.order.id);
  const usedF = new Set();
  for (const h of houses) {
    if (out.length >= HOUSEHOLD.max) break;
    const f = farms.find(f => !usedF.has(f.id) && worked.has(f.id) && Math.max(Math.abs(f.x - h.x), Math.abs(f.y - h.y)) <= (f.size + h.size) / 2 + 1.01);
    if (h.kind === 'raft') { if (this.units.some(u => u.team === 0 && u.hp > 0 && u.order.t === 'fishhouse' && u.order.id === h.id && u.working)) out.push({ house: h, fish: true }); continue; }
    if (f) { usedF.add(f.id); out.push({ house: h, farm: f }); }
  }
  return out;
};

/* ---------- one house, two forms: on the water's edge it is built as a raft house ---------- */
Game.prototype.waterSide = function (tx, ty, size) {
  let water = 0;
  for (let y = ty - 1; y <= ty + size; y++) for (let x = tx - 1; x <= tx + size; x++) {
    if (x >= tx && x < tx + size && y >= ty && y < ty + size) continue;
    if (this.inb(x, y) && this.isWater(x, y) && !this.block[y * W + x]) water++;
  }
  return water >= 3;
};
Game.prototype.houseForm = function (kind, tx, ty, team) {
  return kind === 'house' && team === 0 && this.waterSide(tx, ty, BD.house.size) ? 'raft' : kind;
};
const _placeBuilding = Game.prototype.placeBuilding;
Game.prototype.placeBuilding = function (team, kind, tx, ty, builderIds) {
  const k = this.houseForm(kind, tx, ty, team);
  const r = _placeBuilding.call(this, team, k, tx, ty, builderIds);
  if (r.ok && k === 'raft' && this.M && !this.M.raftTold) { this.M.raftTold = true; this.msg('On the water\'s edge the house is built as a Ruean Phae raft house. A woman fishes from its deck.'); }
  return r;
};
// the raft house's builder stays on to fish from it
const _finishRaft = Game.prototype.finishBuilding;
Game.prototype.finishBuilding = function (b) {
  const first = b.kind === 'raft' && b.team === 0 ? this.units.find(u => u.hp > 0 && u.cls === 'vil' && u.order.t === 'build' && u.order.id === b.id) : null;
  _finishRaft.call(this, b);
  if (first && !this.units.some(u => u.order.t === 'fishhouse' && u.order.id === b.id)) { first.order = { t: 'fishhouse', id: b.id }; first.path = null; first.wait = 0; }
};
// fishing from the deck: no walking to a drop-off, the catch goes straight into the store
// FISH_RATE (0.5 food a second) comes from the main game
Game.prototype.doFishHouse = function (u, dt) {
  const b = this.byId.get(u.order.id);
  if (!b || b.hp <= 0 || !b.done) { this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, b.rect) <= 0.95) {
    u.path = null; u.working = true;
    const cx = b.x - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
    u.gt = (u.gt || 0) + dt * FISH_RATE;
    if (u.gt >= 10) { u.gt -= 10; this.res[u.team].food += 10; if (u.team === 0) this.floaters.push({ x: b.x, y: b.y - 1.2, text: '+10 food', type: 'food', t: 1.2 }); }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};

/* ---------- repair (villagers fix damaged buildings and put out fires) ---------- */
const _command = Game.prototype.command;
Game.prototype.command = function (ids, wx, wy, target, opts) {
  opts = opts || {};
  const us = ids.map(id => this.byId.get(id)).filter(u => u && u.isUnit && u.hp > 0 && (u.team === 0 || opts.any));
  if (target && target.hp > 0 && us.length && target.isBld && target.team === us[0].team && target.done && (target.hp < target.maxHp || target.burnT > 0) && target.kind !== 'farm' && us.some(u => u.cls === 'vil')) {
    const movers = [];
    for (const u of us) { if (u.cls === 'vil') { u.order = { t: 'repair', id: target.id }; u.path = null; u.wait = 0; } else movers.push(u); }
    if (movers.length) this.groupMove(movers, target.x, target.y, opts);
    return;
  }
  // a woman sent to a raft house fishes from it; one to a house
  if (target && target.hp > 0 && us.length && target.isBld && target.kind === 'raft' && target.team === us[0].team && target.done && us.some(u => u.cls === 'vil')) {
    const vils = us.filter(u => u.cls === 'vil'), rest = us.filter(u => u.cls !== 'vil');
    const busy = this.units.find(u => u.hp > 0 && u.order.t === 'fishhouse' && u.order.id === target.id && !vils.includes(u));
    const fisher = busy ? null : vils[0];
    if (fisher) { fisher.order = { t: 'fishhouse', id: target.id }; fisher.path = null; fisher.wait = 0; fisher.carry = { type: null, amt: 0 }; }
    else if (us[0].team === 0) this.msg('Someone already fishes from that raft house.');
    const others = vils.filter(u => u !== fisher).concat(rest);
    if (others.length) this.groupMove(others, target.x, target.y, opts);
    return;
  }
  _command.call(this, ids, wx, wy, target, opts);
};
Game.prototype.doRepair = function (u, dt) {
  const b = this.byId.get(u.order.id);
  if (!b || b.hp <= 0 || (b.hp >= b.maxHp && !(b.burnT > 0))) { this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, b.rect) <= 0.95) {
    u.path = null; u.working = true;
    const cx = b.x - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
    b.hp = Math.min(b.maxHp, b.hp + 14 * dt); b.burnT = 0;
    if (b.hp >= b.maxHp) this.idleOrder(u);
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};

/* ---------- per-unit update: new orders, charge run-up, Khmer farmers fleeing, canoe patrols ---------- */
const _updateUnit = Game.prototype.updateUnit;
Game.prototype.updateUnit = function (u, dt) {
  const t = u.order.t, d = UD[u.kind];
  if (t === 'repair' || t === 'refuge' || t === 'fishhouse') {
    u.cd = Math.max(0, u.cd - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
    u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
    u.anim += dt; u.moving = false; u.working = false;
    if (t === 'repair') this.doRepair(u, dt); else if (t === 'fishhouse') this.doFishHouse(u, dt); else this.doRefuge(u, dt);
  } else _updateUnit.call(this, u, dt);
  if (u.moving && d.trample) u.runT = (u.runT || 0) + dt; else if (!u.moving && u.order.t !== 'attack') u.runT = 0;
};
// a Khmer farmer runs for the nearest unbroken gate and slips inside
Game.prototype.doRefuge = function (u, dt) {
  const o = u.order;
  if (Math.hypot(u.x - o.x, u.y - o.y) < 1.6 || (o.tt = (o.tt || 0) + dt) > 40) { u.hp = 0; u.silent = true; if (this.M) this.M.fled++; return; }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, o.x, o.y))) { u.wait = 1; return; } }
  const s = u.spd; u.spd = s * 1.25; if (this.stepMove(u, dt)) u.path = null; u.spd = s;
};
const _doIdle = Game.prototype.doIdle;
Game.prototype.doIdle = function (u, dt) {
  if (u.team === 1 && u.post) { this.guardStep(u, dt); return; }
  if (u.team === 1 && u.patrol) {
    u.scan -= dt; if (u.scan > 0) return; u.scan = 0.5;
    const t = this.nearestEnemy(u, u.sight); if (t) { this.orderAttack(u, t, { leash: { x: u.x, y: u.y, r: 9 } }); return; }
    u.pi = (u.pi + 1) % u.patrol.length; const p = u.patrol[u.pi]; this.orderMove(u, p[0], p[1]); return;
  }
  _doIdle.call(this, u, dt);
};
// the garrison holds its post: it fights what comes near and walks back when the fight moves on
Game.prototype.guardStep = function (u, dt) {
  u.scan -= dt; if (u.scan > 0) return; u.scan = 0.4;
  if (u.cls === 'healer') { this.healStep(u, 0.4); if (u.order.t !== 'idle') return; }
  const P = u.post, M = this.M, wide = M && M.phase === 3;
  const R = u.ranged ? u.rng + 0.5 : (wide ? 14 : P.r);
  const reach = this.reachIn();
  let best = null, bd = 1e9;
  this.unitsNear(u.x, u.y, R + 1, (o) => {
    if (o.hp <= 0 || o.team !== 0 || o.layer !== 0) return;
    const d = Math.hypot(o.x - u.x, o.y - u.y); if (d > R) return;
    if (!u.ranged && !reach[Math.floor(o.y) * W + Math.floor(o.x)]) return;
    if (Math.hypot(o.x - P.x, o.y - P.y) > (wide ? 22 : P.r + 3) && !u.ranged) return;
    if (d < bd) { bd = d; best = o; }
  });
  if (best) { this.orderAttack(u, best, { leash: { x: P.x, y: P.y, r: u.ranged ? 1.5 : (wide ? 24 : P.r + 4) } }); return; }
  if (Math.hypot(u.x - P.x, u.y - P.y) > 1.2) this.orderMove(u, P.x, P.y);
};
// the tiles a Khmer foot soldier inside the walls can walk to
Game.prototype.reachIn = function () {
  if (this._reachIn && this._reachInT === this.tickN >> 5) return this._reachIn;
  const pal = this.byId.get(this.M && this.M.palace), seen = new Uint8Array(W * H), q = [];
  const push = (x, y) => { if (this.inb(x, y) && !seen[y * W + x] && this.walkable(x, y, 0)) { seen[y * W + x] = 1; q.push(y * W + x); } };
  if (pal) for (let y = pal.ty - 1; y <= pal.ty + pal.size; y++) for (let x = pal.tx - 1; x <= pal.tx + pal.size; x++) push(x, y);
  for (let i = 0; i < q.length; i++) { const c = q[i], x = c % W, y = (c / W) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  this._reachIn = seen; this._reachInT = this.tickN >> 5;
  return seen;
};

const _nearestEnemy = Game.prototype.nearestEnemy;
Game.prototype.nearestEnemy = function (u, r) {
  const t = _nearestEnemy.call(this, u, r);
  if (t && t.isBld && (t.kind === 'kwall' || BD[t.kind].keep)) return null;
  return t;
};

/* ---------- buildings: fire, the hospital's aura, the gate swinging open for a sortie ---------- */
const _updateBuilding = Game.prototype.updateBuilding;
Game.prototype.updateBuilding = function (b, dt) {
  _updateBuilding.call(this, b, dt);
  if (b.hp <= 0 || !(b.burnT > 0)) return;
  b.burnT -= dt;
  b.hp -= b.burnR * dt;
  if (this.rng() < dt * 3) this.fx.push({ k: 'smoke', x: b.x + (this.rng() - 0.5) * b.size * 0.7, y: b.y - 0.3 - b.size * 0.2, vy: -0.7 - this.rng() * 0.6, t: 1.5, max: 1.5 });
  if (b.hp <= 0) { b.hp = 0; this.onKilled(b, { team: 0, isUnit: false }); }
};
Game.prototype.igniteB = function (b, secs, mult) {
  const was = b.burnT > 0;
  if (!mult) return;
  b.burnT = Math.max(b.burnT || 0, secs); b.burnR = LBURN.rate * mult;
  if (!was && mult >= 1) {
    this.fx.push({ k: 'fire', x: b.x, y: b.y, t: 0.6, max: 0.6 });
    if (b.team === 1) this.sfx('ignite', b.x, b.y);
  }
};
Game.prototype.sfx = function (name, x, y) { (this.sfxQ || (this.sfxQ = [])).push({ name, x, y }); };

/* ---------- combat: fire arrows, elephants against gates, trample, hero aura, stone walls ---------- */
const _damage = Game.prototype.damage;
Game.prototype.damage = function (att, tgt, w) {
  const ad = att.kind && att.isUnit ? UD[att.kind] : null;
  if (tgt.isBld && BD[tgt.kind].keep) {   // the palace is to be taken, not razed
    tgt.hit = 0.15;
    if (att.team === 0 && this.t - (this.lastKeepMsg || -99) > 20) { this.lastKeepMsg = this.t; this.msg('The palace is to be taken, not razed. Bring the king into its court.'); }
    return;
  }
  if (!ad) { this.wallDamage(att, tgt, w); return; }
  let plus = 0;
  if (tgt.isBld && ad.bld) plus += ad.bld;
  if (tgt.isBld && tgt.kind === 'kgate' && ad.gate) {
    plus += ad.gate;
    this.fx.push({ k: 'smoke', x: tgt.x + (this.rng() - 0.5) * 1.2, y: tgt.y + 0.6, vy: -0.4, t: 1.0, max: 1.0 });
    this.sfx('ram', tgt.x, tgt.y);
    if (this.M) this.M.gateHits++;
  } else if (tgt.isBld && (ad.bld || 0) > 20 && att.team === 0) this.sfx('thud', tgt.x, tgt.y);
  const charge = ad.trample && (att.runT || 0) > 1.2 && tgt.isUnit;
  if (charge) { plus += ad.trample; att.runT = 0; }
  plus += this.auraFor(att);
  // fire arrows: a timber building catches, stone only scorches
  let fireArrow = false;
  if (ad.fire && tgt.isBld) {
    fireArrow = true;
    const mult = TIMBER(tgt) ? 1 : BD[tgt.kind].noburn ? 0 : LBURN.stone;
    plus += Math.round(ad.fire.dmg * mult);
    this.igniteB(tgt, ad.fire.burn, mult);
    for (let i = this.arrows.length - 1; i >= 0 && i >= this.arrows.length - 4; i--) { const r = this.arrows[i]; if (r.t === 0 && r.x0 === att.x && !r.k) { r.k = 'fire'; break; } }
    this.sfx('bow', att.x, att.y);
  }
  const atk0 = att.atk;
  att.atk = Math.round(atk0 + plus);
  this.wallDamage(att, tgt, w);
  att.atk = atk0;
  if (fireArrow && tgt.hp > 0 && tgt.team === 1 && !TIMBER(tgt) && this.t - (this.lastStoneMsg || -99) > 25) {
    this.lastStoneMsg = this.t; this.msg('Fire arrows only scorch the laterite. Elephants break stone.');
  }
  // the charge: the elephant runs on through the men around its target
  if (charge) {
    const x = tgt.x, y = tgt.y; let n = 0;
    this.unitsNear(x, y, 1.6, (o) => {
      if (o === tgt || o.hp <= 0 || o.team === att.team || o.team === 2 || o.layer !== 0 || Math.hypot(o.x - x, o.y - y) > 1.2) return;
      const a0 = att.atk; att.atk = Math.round(a0 * 0.6); _damage.call(this, att, o); att.atk = a0; n++;
    });
    for (let i = 0; i < 4; i++) this.fx.push({ k: 'smoke', sub: 'dust', x: x + (this.rng() - 0.5) * 1.4, y: y + 0.2, vy: -0.25, t: 0.8, max: 0.8 });
    if (att.team === 0 && this.M) { this.M.tramples++; if (n) this.floaters.push({ x: att.x, y: att.y - 1.6, text: 'Trample!', type: 'gold', t: 1 }); }
    this.sfx('trumpet', att.x, att.y);
  }
};
Game.prototype.wallDamage = function (att, tgt, w) {
  const arm = tgt.isBld && BD[tgt.kind].arm;
  if (arm) { const keep = { ma: BARM.ma, pa: BARM.pa }; BARM.ma = arm.ma; BARM.pa = arm.pa; _damage.call(this, att, tgt, w); BARM.ma = keep.ma; BARM.pa = keep.pa; }
  else _damage.call(this, att, tgt, w);
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
  if (t._dead) return; t._dead = true;
  _onKilled.call(this, t, att);
  const M = this.M; if (!M) return;
  if (t.isUnit && t.team === 0 && UD[t.kind].hero) {
    M.heroBack[t.kind] = this.t + HERO_BACK;
    this.msg('The king is wounded and carried from the field. Back in ' + HERO_BACK + 's.');
  }
  if (t.isBld && t.team === 1) {
    if (t.outer) {
      M.burned++;
      const gold = 25, food = 40; this.res[0].gold += gold; this.res[0].food += food;
      this.floaters.push({ x: t.x, y: t.y - 1, text: '+' + food + ' food +' + gold + ' gold', type: 'gold', t: 1.5 });
      if (M.burned === BURN_GOAL) this.msg('The outer town burns. Angkor\'s rice stores are gone: its sorties will grow weaker.');
    }
    if (t.outpost) { M.outDown++; this.msg(M.outDown >= 2 ? 'The outworks have fallen. The west causeway is open.' : 'A face tower of the outworks falls.'); }
    if (t.kind === 'kgate') {
      M.breach = M.breach || t.gk; M.lastBreach = t.gk;
      this.msg('The ' + GATES[t.gk].name + ' is broken!');
      this.sfx('crash', t.x, t.y);
      for (let i = 0; i < 18; i++) this.fx.push({ k: 'smoke', sub: 'dust', x: t.x + (this.rng() - 0.5) * 3, y: t.y + (this.rng() - 0.5) * 2, vy: -0.3 - this.rng() * 0.5, t: 1.6 + this.rng(), max: 2.6 });
    }
  }
};

/* ---------- the mission ---------- */
Game.prototype.aiTick = function () { if (this.M) missionAI(this); };
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (!this.buildings.some(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0)) { M.why = 'camp'; this.over = 'lose'; return; }
  if (M.won) this.over = 'win';
};
const _update = Game.prototype.update;
Game.prototype.update = function (dt) {
  this.heroes = this.units.filter(u => u.hp > 0 && UD[u.kind].aura);
  _update.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};
function campGoal(g) { return g.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0) || null; }
function openGates(g) { const out = []; for (const k in GATES) { const b = g.byId.get(g.M.gates[k]); if (b && b.hp > 0) out.push(k); } return out; }
function nearestGateOut(g, x, y) {
  let best = null, bd = 1e9;
  for (const k of openGates(g)) { const o = GATES[k].out, d = Math.hypot(o[0] - x, o[1] - y); if (d < bd) { bd = d; best = k; } }
  return best;
}
function missionAI(g) {
  const M = g.M, goal = campGoal(g);
  for (const u of g.units) {
    if (u.team !== 1 || u.hp <= 0) continue;
    // farmers run for the city when soldiers come near
    if (u.kv && u.order.t !== 'refuge') {
      let near = false;
      g.unitsNear(u.x, u.y, 6, (o) => { if (o.team === 0 && o.hp > 0 && o.cls !== 'vil' && Math.hypot(o.x - u.x, o.y - u.y) < 6) near = true; });
      if (near || u.hp < u.maxHp) {
        const k = nearestGateOut(g, u.x, u.y);
        if (k) { u.order = { t: 'refuge', x: GATES[k].out[0], y: GATES[k].out[1] }; u.path = null; }
      }
      continue;
    }
    // a sortie marches on the camp
    if (u.sortie && goal && (u.order.t === 'idle' || (u.order.t === 'move' && !u.path && u.wait <= 0))) { g.orderAMove(u, goal.x, goal.y + 1.5); }
  }
}
function launchSortie(g) {
  const M = g.M, comp = SORTIES[Math.min(M.sortie, SORTIES.length - 1)], extra = Math.max(0, M.sortie - SORTIES.length + 1);
  const ks = openGates(g).filter(k => k !== 'e');
  if (!ks.length) return;
  const k = ks[(M.sortie + (g.seed & 3)) % ks.length], gate = g.byId.get(M.gates[k]), q = GATES[k];
  const supply = Math.max(0.45, 1 - M.burned * 0.055);
  const kinds = [];
  for (const key in comp) { const n = Math.max(key === 'k_bal' || key === 'k_cart' ? 0 : 1, Math.round((comp[key] + extra) * DMUL[g.diff] * supply)); for (let j = 0; j < n; j++) kinds.push(key); }
  kinds.sort((a, b) => (UD[a].cls === 'siege') - (UD[b].cls === 'siege'));
  kinds.forEach((kind, j) => {
    const row = (j / 3) | 0, col = (j % 3) - 1;
    const p = k === 'w' ? g.openSpot(q.out[0] - row * 0.8, q.out[1] + col * 0.8, 0) : g.openSpot(q.out[0] + col * 0.8, q.out[1] + (k === 'n' ? -1 : 1) * row * 0.8, 0);
    const u = g.addUnit(kind, 1, p.x, p.y); u.sortie = true;
    const goal = campGoal(g); if (goal) g.orderAMove(u, goal.x, goal.y + 1.5);
  });
  if (gate) gate.openT = g.t + 4;
  g.alerts.push({ x: q.out[0], y: q.out[1], t: 3 });
  M.lastSortie = { gate: k, t: M.t, n: kinds.length };
  g.msg('A sortie! ' + kinds.length + ' Khmer pour out of the ' + q.name + '.');
  M.sortie++;
}
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  // households: a share of fish from every working paddy
  M.hhT -= dt;
  if (M.hhT <= 0) {
    M.hhT = HOUSEHOLD.every;
    const hh = g.households(); M.households = hh.length; M.hhList = hh;
    for (const h of hh) { g.res[0].food += HOUSEHOLD.food; g.floaters.push({ x: h.house.x, y: h.house.y - 1.2, text: '+' + HOUSEHOLD.food + ' food', type: 'food', t: 1.4 }); }
  } else if ((g.tickN % 30) === 0) { M.hhList = g.households(); M.households = M.hhList.length; }
  // the city musters fresh soldiers while its barracks stand
  M.levyT = (M.levyT == null ? LEVY.every : M.levyT) - dt;
  if (M.levyT <= 0) {
    M.levyT = LEVY.every * (g.diff === 'easy' ? 1.4 : g.diff === 'hard' ? 0.75 : 1);
    const bk = g.buildings.find(b => b.kind === 'kbarracks' && b.hp > 0);
    if (bk && M.phase < 3 && g.units.filter(u => u.team === 1 && u.hp > 0).length < LEVY.cap) {
      const kind = ['k_shield', 'k_spear', 'k_archer', 'k_shield', 'k_spear'][(M.levy = (M.levy || 0) + 1) % 5];
      const post = M.phase === 3 ? M.posts[4] : M.posts[M.levy % 4];
      const sp = g.findSpawn(bk, { x: post[0], y: post[1] }, 0), u = g.addUnit(kind, 1, sp.x, sp.y);
      u.post = { x: post[0] + (g.rng() - 0.5) * 2, y: post[1] + (g.rng() - 0.5) * 2, r: 8 };
    }
  }
  // a gate left alone is shored up again
  if (M.phase < 3) for (const k in M.gates) {
    const b = g.byId.get(M.gates[k]);
    if (b && b.hp > 0 && b.hp < b.maxHp && g.t - (b.lastHit || -99) > GATE_MEND.calm) b.hp = Math.min(b.maxHp, b.hp + GATE_MEND.rate * dt);
  }
  // sorties until a gate breaks
  if (M.phase < 3) {
    if (M.next - M.t <= 20 && M.warned < M.sortie) { M.warned = M.sortie; g.msg('Drums on the walls: the Khmer are mustering behind a gate.'); }
    if (M.t >= M.next) { launchSortie(g); M.next = M.t + SORTIE.gap - Math.min(25, M.sortie * 3); }
  }
  // phase 1 -> 2: the outer town burnt and the outworks down, or the siege drags on for ten minutes
  if (M.phase === 1 && ((M.burned >= BURN_GOAL && M.outDown >= 2) || M.t >= 600)) {
    M.phase = 2; M.phaseAt = M.t; M.cardQ.push('gates');
    if (M.t >= 600 && M.burned < BURN_GOAL) g.msg('The siege has lasted months. The king orders the elephants to the gates.');
  }
  // a gate is broken: into the city
  if (M.breach && M.phase < 3) { M.phase = 3; M.phaseAt = M.t; M.cardQ.push('breach'); M.courtAt = M.t + 30; }
  if (M.courtAt && M.t >= M.courtAt) { M.courtAt = 0; M.cardQ.push('court'); }
  // the king returns from the camp
  for (const k in M.heroBack) if (M.heroBack[k] && M.t >= M.heroBack[k]) {
    const tc = campGoal(g); if (!tc) break;
    M.heroBack[k] = 0;
    const sp = g.findSpawn(tc, null, 0), u = g.addUnit(k, 0, sp.x, sp.y);
    M.king = u;
    g.msg('The king mounts his elephant again.');
  }
  // the banner at the palace: the king in the court, no Khmer soldier close by
  if (M.phase === 3 && !M.cards.closing) {
    const pal = g.byId.get(M.palace), k = M.king;
    let ok = !!(pal && k && k.hp > 0 && rectDist(k.x, k.y, pal.rect) <= 3.2), foes = 0;
    if (ok) for (const u of g.units) if (u.team === 1 && u.hp > 0 && u.layer === 0 && u.cls !== 'vil' && u.cls !== 'healer' && rectDist(u.x, u.y, pal.rect) <= 6) foes++;
    M.bannerFoes = foes; M.kingAt = ok;
    if (ok && !foes) M.banner = Math.min(BANNER_T, M.banner + dt);
    else M.banner = Math.max(0, M.banner - dt * 0.5);
    if (M.banner >= BANNER_T) { M.cards.closing = true; M.cardQ.push('closing'); g.msg('The banner of Ayutthaya flies over the royal palace of Yasodharapura.'); }
  }
}

/* ---------- naval combat at the mission's date (1431): no ship cannon yet ----------
   Ayutthaya war boats loose crossbow volleys and fire arrows; Khmer war canoes shoot ballista bolts
   that pass through a line of boats but barely mark buildings. Khmer stone burns at a quarter. */
NAVWPN.tierDefault = 1;
BURNMAT[0] = 1; BURNMAT[1] = 0.25;
UD.light.rng = 5; UD.light.kb = { fireship: 40, trade: 6, boat: 6 };
Object.assign(UD.k_canoe, { wpn: 'arrow', swivel: true, kb: { light: 3, boat: 4 } });

/* hand-made map: keep every tree (the main game thins woods on random maps, v0.9.40) */
Game.prototype.openWoods = function () {};
