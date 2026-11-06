/* ===== km-sim.js ===== */
/* ==========================================================================
   Khmer demo: "The Gates of Angkor" (1431), a Kingdom Age defence.
   The player holds Yasodharapura (Angkor Thom) against King Borommarachathirat II of Ayutthaya,
   and gets the monks, the treasury, two bronze statues, the sacred texts and, last of all,
   King Ponhea Yat and the royal family out of the city by river before it falls.
   The city cannot be saved. Every load that reaches the far end of the lake is saved;
   every load left behind goes west to Ayutthaya.
   Sim side only (no DOM): data, map, gates, loads, barges, waves and the river.
   ========================================================================== */

const DMUL = { easy: 0.7, normal: 1, hard: 1.35 };
const HERO_BACK = 60;                 // Ponhea Yat is carried to the palace and returns after this many seconds
const POP_CAP = 100;
const LBURN = { rate: 6, stone: 0.25 };   // Khmer stone burns at a quarter of the rate of timber
const PHASE = { river: 360, fall: { easy: 840, normal: 780, hard: 720 } };
const COURT = { easy: 45, normal: 60, hard: 70 };   // seconds after the fall begins before the royal family is ready
const BARAY = { every: 30, food: 12, rng: 6 };
const REPAIR = 12;                    // hp a second for one rice farmer (Khmer +25% on top)
const LOAD_COST = { food: 30 };
STARTS[0] = { x: 47, y: 18 }; STARTS[1] = { x: 5, y: 21 };

/* ---------- the city (same map as the Ayutthaya demo, seen from inside) ---------- */
const CITY = { x0: 37, y0: 8, x1: 58, y1: 38 };
const GATES = {
  w: { tx: 36, ty: 22, name: 'West Gate', out: [33.5, 23.5], in: [40.5, 23.5] },
  n: { tx: 47, ty: 7, name: 'North Gate', out: [48.5, 3.5], in: [48.5, 11.5] },
  s: { tx: 47, ty: 37, name: 'South Gate', out: [48.5, 42.5], in: [48.5, 35] },
  e: { tx: 57, ty: 22, name: 'Gate of Victory', out: [62.5, 23.5], in: [55, 23.5] }
};
const KMS = { camp: [5, 21], court: [47, 13], prasat: [52, 9], bayon: [46, 21] };
const LAKE_Y = 44;
const LOADS = [
  { key: 'monks', kind: 'l_monks', name: 'The monks', phase: 1 },
  { key: 'treasury', kind: 'l_treasury', name: 'The temple treasury', phase: 1 },
  { key: 'statue1', kind: 'l_statue', name: 'Bronze statue of the Buddha', phase: 2 },
  { key: 'statue2', kind: 'l_statue2', name: 'Bronze statue of Vishnu', phase: 2 },
  { key: 'texts', kind: 'l_texts', name: 'The sacred texts', phase: 2 },
  { key: 'royal', kind: 'l_royal', name: 'Ponhea Yat and the royal family', phase: 3 }
];

/* ---------- units ---------- */
Object.assign(UD, {
  // the Khmer (lore/khmer.md)
  villager: Object.assign({}, UD.villager, { name: 'Neak Srae (Rice farmer)', km: 'villager' }),
  shield: { name: 'Shield infantry', hp: 62, spd: 2.3, atk: 8, bonus: { archer: 3 }, rng: 0.85, rate: 1.0, ma: 2, pa: 5, sight: 6.5, cost: { food: 55, gold: 15 }, time: 9, cls: 'sword', km: 'sword' },
  spear: { name: 'Spearman', hp: 52, spd: 2.3, atk: 5, bonus: { eleph: 14, sword: 3 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: { food: 45, wood: 15 }, time: 9, cls: 'spear', km: 'spear' },
  sna: { name: 'Sna (Crossbowman)', hp: 32, spd: 2.2, atk: 7, bonus: { spear: 3 }, rng: 6.5, rate: 2.0, ma: 0, pa: 1, sight: 7.5, cost: { wood: 35, gold: 25 }, time: 10, cls: 'archer', ranged: true, km: 'archer' },
  vaidya: { name: 'Vaidya (Physician)', hp: 30, spd: 2.2, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 7, cost: { food: 40, gold: 40 }, time: 11, cls: 'healer', heal: { amt: 5, rate: 1, rng: 3 }, healer: 1 },
  cart: { name: 'Cart Ballista', hp: 150, spd: 1.4, atk: 16, bonus: { eleph: 18, ship: 8 }, rng: 8, rate: 4.5, ma: 2, pa: 5, sight: 8.5, cost: { wood: 150, gold: 60 }, time: 22, cls: 'siege', ranged: true, big: 'kcart', pierce: true, cap: 3 },
  bal: { name: 'Ballista Elephant', hp: 420, spd: 1.8, atk: 14, bonus: { eleph: 14, ship: 6 }, rng: 7, rate: 3.2, ma: 3, pa: 4, sight: 8, cost: { food: 180, gold: 120 }, time: 26, cls: 'eleph', ranged: true, big: 'kbal', pop: 3 },
  ponhea: { name: 'King Ponhea Yat', hp: 420, spd: 2.3, atk: 12, bonus: { eleph: 6 }, rng: 0.85, rate: 1.0, ma: 3, pa: 3, sight: 8, cost: {}, time: 0, cls: 'sword', hero: 'ponhea', aura: { r: 6, atk: 2 }, big: 'ponhea' },
  boat: Object.assign({}, UD.boat, { name: 'Touk (Fishing boat)', civ: null }),
  canoe: { name: 'War canoe', hp: 100, spd: 3.3, atk: 5, rng: 4.5, rate: 1.6, ma: 1, pa: 1, sight: 7, cost: { wood: 60, gold: 25 }, time: 12, cls: 'ship', ranged: true, layer: 1, slot: 'light' },
  barge: { name: 'River barge', hp: 180, spd: 2.4, atk: 0, rng: 0, rate: 1, ma: 1, pa: 2, sight: 6, cost: { wood: 50, gold: 10 }, time: 12, cls: 'boat', layer: 1, slot: 'galley', barge: true },
  rbarge: { name: 'Royal barge', hp: 500, spd: 2.5, atk: 0, rng: 0, rate: 1, ma: 2, pa: 4, sight: 7, cost: {}, time: 0, cls: 'boat', layer: 1, slot: 'flagship', barge: true, royal: true },
  // what must leave the city
  l_monks: { name: 'The monks', hp: 160, spd: 1.9, atk: 0, rng: 0, rate: 1, ma: 0, pa: 1, sight: 4, cost: {}, time: 0, cls: 'load', load: 'monks' },
  l_treasury: { name: 'The temple treasury', hp: 260, spd: 1.4, atk: 0, rng: 0, rate: 1, ma: 2, pa: 3, sight: 4, cost: {}, time: 0, cls: 'load', load: 'treasury' },
  l_statue: { name: 'Bronze statue of the Buddha', hp: 300, spd: 1.3, atk: 0, rng: 0, rate: 1, ma: 2, pa: 3, sight: 4, cost: {}, time: 0, cls: 'load', load: 'statue' },
  l_statue2: { name: 'Bronze statue of Vishnu', hp: 300, spd: 1.3, atk: 0, rng: 0, rate: 1, ma: 2, pa: 3, sight: 4, cost: {}, time: 0, cls: 'load', load: 'statue' },
  l_texts: { name: 'The sacred texts', hp: 140, spd: 1.9, atk: 0, rng: 0, rate: 1, ma: 0, pa: 1, sight: 4, cost: {}, time: 0, cls: 'load', load: 'texts' },
  l_royal: { name: 'Ponhea Yat and the royal family', hp: 700, spd: 1.7, atk: 0, rng: 0, rate: 1, ma: 2, pa: 3, sight: 6, cost: {}, time: 0, cls: 'load', load: 'royal' },
  // Ayutthaya (the same army as the Ayutthaya demo)
  ay_vil: Object.assign({}, UD.villager, { name: 'Phrai Ying (Village woman)', ayu: 'villager', cost: {} }),
  daab: { name: 'Daab Song Mue (Twin swords)', hp: 60, spd: 2.5, atk: 9, bonus: { archer: 4, load: 6 }, rng: 0.85, rate: 1.0, ma: 1, pa: 2, sight: 6.5, cost: {}, time: 0, cls: 'sword', ayu: 'sword' },
  hok: { name: 'Phon Hok (Spearman)', hp: 52, spd: 2.3, atk: 5, bonus: { sword: 4, eleph: 14, siege: 6 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: {}, time: 0, cls: 'spear', ayu: 'spear' },
  thanu: { name: 'Phon Thanu (Fire archer)', hp: 32, spd: 2.2, atk: 6, bonus: { spear: 3 }, rng: 6, rate: 1.6, ma: 0, pa: 0, sight: 7.5, cost: {}, time: 0, cls: 'archer', ranged: true, ayu: 'archer', fire: { dmg: 5, burn: 7 } },
  mo: { name: 'Mo (Physician)', hp: 30, spd: 2.2, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 7, cost: {}, time: 0, cls: 'healer', heal: { amt: 5, rate: 1, rng: 3 }, healer: 0 },
  chang: { name: 'Chang Suek (War elephant)', hp: 520, spd: 2.0, atk: 15, bonus: { sword: 4, archer: 4 }, rng: 1.15, rate: 1.6, ma: 3, pa: 4, sight: 7, cost: {}, time: 0, cls: 'eleph', pop: 3, bld: 28, gate: 20, trample: 12, big: 'chang' },
  king: { name: 'King Borommarachathirat II', hp: 1000, spd: 2.1, atk: 20, bonus: { sword: 4 }, rng: 1.15, rate: 1.5, ma: 4, pa: 5, sight: 8.5, cost: {}, time: 0, cls: 'eleph', foeHero: true, aura: { r: 5, atk: 2 }, bld: 28, gate: 20, trample: 14, big: 'king' },
  light: Object.assign({}, UD.light, { name: 'Ruea Chai (War boat)', civ: null })
});
TEAMMOD[1] = { hp: 1, spd: 1, cost: 1, arm: 0 };
Object.assign(NAVMOD, { hp: 1, spd: 1, cost: 1 });
Object.assign(ORDER_CLS, { eleph: 0.4, siege: 3.8, load: 4.5 });
Object.assign(CIV_NAMES, {
  villager: ['Neak Srae (Rice farmer)', 'Phrai (Villager)'], boat: ['Touk (Fishing boat)', 'Ruea Pramong (Fishing boat)'], light: [null, 'Ruea Chai (War boat)'],
  house: ['Stilt house', 'Ruean Thai (Stilt house)'], farm: ['Srae (Rice field)', 'Na (Rice paddy)'], granary: ['Rice store', 'Yung Khao (Granary)'],
  barracks: ['Barracks', 'Rong Thahan (Barracks)'], port: ['River landing', 'Tha Ruea (Landing)'], tower: ['Face tower', 'Pom (Bastion)'],
  towncentre: ['Royal compound', 'Khai Luang (Royal camp)']
});

/* ---------- buildings ---------- */
Object.assign(BD, {
  // the Khmer city
  kwall: { name: 'Laterite wall', size: 1, hp: 4800, cost: null, time: 0, sight: 3, arm: { ma: 14, pa: 30 }, stone: true, noburn: true },
  kgate: { name: 'Face gate', size: 3, hp: 5400, cost: null, time: 0, sight: 7, arm: { ma: 10, pa: 30 }, stone: true, noburn: true, atk: { dmg: 6, range: 6.5, rate: 2.0 } },
  kpalace: { name: 'Prasat palace', size: 4, hp: 2600, pop: 10, cost: null, time: 0, sight: 8, stone: true, train: ['bal'] },
  bayon: { name: 'The Bayon', size: 4, hp: 99999, cost: null, time: 0, neutral: true, sight: 0 },
  karogya: { name: 'Arogyasala (Hospital)', size: 3, hp: 1100, cost: { wood: 120, gold: 40 }, time: 28, sight: 5, stone: true, train: ['vaidya'], aura: { rng: 3, amt: 2, max: 8 } },
  baray: { name: 'Baray (Reservoir)', size: 4, hp: 2500, cost: { wood: 200, gold: 80 }, time: 40, sight: 4, noburn: true, water: true },
  khouse: { name: 'Stilt house (outer town)', size: 2, hp: 420, cost: null, time: 0, sight: 4, timber: true },
  kgranary: { name: 'Rice store (outer town)', size: 2, hp: 480, cost: null, time: 0, sight: 4, timber: true, drop: ['food'] },
  // Ayutthaya's camp
  phaniat: { name: 'Phaniat (Elephant kraal)', size: 3, hp: 1400, cost: null, time: 0, sight: 6 },
  wat: { name: 'Wat (Temple)', size: 3, hp: 1100, cost: null, time: 0, sight: 5 },
  rong: { name: 'Rong (Storehouse)', size: 2, hp: 600, cost: null, time: 0, sight: 4 }
});
Object.assign(BD.towncentre, { name: 'Royal compound', hp: 3000, pop: 15, atk: { dmg: 7, range: 7, rate: 1.7 }, train: ['villager'], stone: true });
Object.assign(BD.tower, { name: 'Face tower', hp: 900, civHp: null, atk: { dmg: 7, range: 7.5, rate: 1.7 }, cost: { wood: 90, gold: 40 }, stone: true });
Object.assign(BD.wall = BD.wall || {}, { name: 'Laterite wall', size: 1, hp: 1200, cost: { wood: 10, gold: 2 }, time: 5, sight: 3, arm: { ma: 10, pa: 25 }, stone: true, noburn: true });
BD.house.stone = true; BD.barracks.stone = true; BD.granary.stone = true; BD.port.stone = false;
BD.barracks.train = ['shield', 'spear', 'sna', 'cart'];
BD.port.train = ['boat', 'canoe', 'barge']; BD.port.cost = { wood: 100 };
BD.granary.cost = { wood: 80 };
BD.farm.food = 600;
for (const k of ['palace', 'tradepost', 'rumahtabib', 'patirthan', 'mill', 'goldmine']) delete BD[k];
BUILD_ORDER.length = 0;
for (const k of ['house', 'farm', 'granary', 'barracks', 'karogya', 'baray', 'tower', 'wall', 'port']) BUILD_ORDER.push(k);
// what burns: the outer town is timber, every other Khmer building is stone or brick and only scorches
const burnMult = (b) => BD[b.kind].noburn ? 0 : (BD[b.kind].timber || b.team !== 0 || !BD[b.kind].stone) ? 1 : LBURN.stone;

/* ---------- Ayutthaya's waves ---------- */
const WAVES = [
  { daab: 3, thanu: 4 },
  { daab: 4, hok: 2, thanu: 4, chang: 1 },
  { daab: 4, hok: 3, thanu: 5, chang: 1, mo: 1 },
  { daab: 5, hok: 3, thanu: 5, chang: 2, mo: 1 },
  { daab: 5, hok: 4, thanu: 6, chang: 2, mo: 1 },
  { daab: 6, hok: 4, thanu: 6, chang: 3, mo: 2 },
  { daab: 7, hok: 5, thanu: 7, chang: 3, mo: 2 }
];
const KING_WAVE = { king: 1, chang: 3, daab: 8, hok: 6, thanu: 6, mo: 2 };
const WAVE = { first: 75, gap: 95, fallGap: 62 };
const GATE_ORDER = ['n', 'w', 's', 'w', 'n', 's', 'w'];
const NAVY = { easy: 1, normal: 2, hard: 2 };
const NAVY_CAP = { easy: 2, normal: 4, hard: 5 };   // war boats on the lake at once

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
  // the West Baray, banked with earth
  for (let y = 16; y <= 26; y++) for (let x = 16; x <= 27; x++) {
    const rim = x === 16 || x === 27 || y === 16 || y === 26, edge = x === 17 || x === 26 || y === 17 || y === 25;
    terr[y * W + x] = rim ? T.DIRT : edge ? T.SHALLOW : T.DEEP;
  }
  terr[21 * W + 21] = T.SAND; terr[21 * W + 22] = T.SAND;
  // the moat around Angkor Thom, crossed by a causeway at each gate
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = cityDist(x, y);
    if (d === 2 || d === 3) terr[y * W + x] = onCauseway(x, y) ? T.DIRT : (d === 3 ? T.SHALLOW : T.DEEP);
    else if (d === 1 || (d === 0)) terr[y * W + x] = T.DIRT;
    else if (inCity(x, y) && terr[y * W + x] === T.DIRT && hash2(x, y, s) < 0.5) terr[y * W + x] = T.GRASS;
  }
  // the landing below the South Gate: a strip of dry ground down to the lake
  for (let y = CITY.y1 + 4; y < LAKE_Y; y++) for (let x = 44; x <= 54; x++) if (terr[y * W + x] > T.SAND) terr[y * W + x] = T.SAND;
  const snap = terr.slice();
  for (let y = 1; y < H - 1; y++) for (let x = 0; x < W; x++) {
    if (snap[y * W + x] > T.SAND || y < LAKE_Y - 3) continue;
    if (snap[(y + 1) * W + x] === T.SHALLOW) terr[y * W + x] = T.SAND;
  }
}
function popAngkor(g) {
  const rng = g.rng, M = g.M = newMission(g);
  for (let i = 0; i < W * H; i++) g.explored[i] = 1;
  const free = (x, y) => g.freeTile(x, y) && !g.reserve[y * W + x];
  const camp = (x, y) => Math.hypot(x - 7, y - 22) < 9;
  const place = (kind, cx, cy, spread, count, inside) => {
    let n = 0;
    for (let i = 0; i < count * 20 && n < count; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * spread, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (!free(x, y) || (inside ? !inCity(x, y) : (inCity(x, y) || cityDist(x, y) < 4))) continue;
      g.addNode(kind, x, y); n++;
    }
  };
  g.reserveRoute(8, 21, 33, 23); g.reserveRoute(8, 20, 48, 3); g.reserveRoute(8, 24, 48, 42);
  g.reserveRoute(16, 14, 33, 23); g.reserveRoute(16, 28, 33, 23); g.reserveRoute(48, 3, 62, 23);
  /* --- the walls and the five face gates (four on this map) --- */
  const gateTiles = (x, y) => { for (const k in GATES) { const q = GATES[k]; if (x >= q.tx && x <= q.tx + 2 && y >= q.ty && y <= q.ty + 2) return true; } return false; };
  for (let y = CITY.y0; y <= CITY.y1; y++) for (let x = CITY.x0; x <= CITY.x1; x++) {
    if (x !== CITY.x0 && x !== CITY.x1 && y !== CITY.y0 && y !== CITY.y1) continue;
    if (gateTiles(x, y)) continue;
    g.addBuilding('kwall', 0, x, y, true);
  }
  M.gates = {};
  for (const k in GATES) { const q = GATES[k]; const b = g.addBuilding('kgate', 0, q.tx, q.ty, true); b.gk = k; M.gates[k] = b.id; }
  /* --- inside: the royal compound, the prasat palace, the Bayon, the hospital, barracks, houses, towers and fields --- */
  g.addBuilding('bayon', 2, KMS.bayon[0], KMS.bayon[1], true);
  const court = g.addBuilding('towncentre', 0, KMS.court[0], KMS.court[1], true); M.court = court.id;
  M.prasat = g.addBuilding('kpalace', 0, KMS.prasat[0], KMS.prasat[1], true).id;
  g.addBuilding('karogya', 0, 52, 28, true);
  g.addBuilding('barracks', 0, 41, 30, true);
  g.addBuilding('granary', 0, 42, 17, true);
  for (const [x, y] of [[39, 10], [42, 10], [39, 13], [55, 17], [55, 33]]) g.addBuilding('house', 0, x, y, true);
  for (const [x, y] of [[40, 19], [40, 26], [44, 35], [55, 25], [56, 9]]) g.addBuilding('tower', 0, x, y, true);
  const farmsIn = [];
  for (const [x, y] of [[44, 10], [44, 13], [39, 16], [43, 24], [43, 27]]) farmsIn.push(g.addBuilding('farm', 0, x, y, true));
  /* --- the outer town outside the moat: timber houses, rice stores and fields --- */
  M.outer = [];
  const outer = (kind, x, y) => { if (!g.canPlace(kind, x, y, 0)) return null; const b = g.addBuilding(kind, 0, x, y, true); b.outer = true; M.outer.push(b.id); return b; };
  /* --- the landing below the South Gate --- */
  let port = null;
  for (const [x, y] of [[50, 42], [51, 42], [50, 43], [44, 42], [45, 42], [52, 42], [43, 42]]) if (!port && g.canPlace('port', x, y, 0)) port = g.addBuilding('port', 0, x, y, true);
  if (!port) port = g.addBuilding('port', 0, 50, 42, true);
  M.port = port.id;
  M.dock = landBeside(g, port, GATES.s.out);
  M.dockW = waterBeside(g, port);
  port.rally = { x: M.dockW.x, y: M.dockW.y };
  M.exit = (() => { for (let x = W - 1; x > 40; x--) for (const y of [46, 45, 47, 44]) if (g.walkable(x, y, 1)) return { x: x + 0.5, y: y + 0.5 }; return { x: 62.5, y: 46.5 }; })();
  M.navyIn = (() => { for (let x = 0; x < 20; x++) for (const y of [46, 45, 47]) if (g.walkable(x, y, 1)) return { x: x + 0.5, y: y + 0.5 }; return { x: 0.5, y: 46.5 }; })();
  M.block = { x: M.exit.x - 6, y: M.exit.y };
  for (const [x, y] of [[30, 9], [30, 13], [28, 29], [31, 32], [30, 36], [40, 1], [55, 1], [41, 42]]) outer('khouse', x, y);
  for (const [x, y] of [[29, 16], [29, 27], [45, 1]]) outer('kgranary', x, y);
  const kf = [];
  for (const [x, y] of [[27, 11], [27, 33], [51, 1]]) { const f = outer('farm', x, y); if (f) kf.push(f); }
  // the outworks: two face towers guarding the west causeway
  M.outposts = [];
  for (const [x, y] of [[31, 20], [31, 25]]) { const b = g.addBuilding('tower', 0, x, y, true); b.outpost = true; b.maxHp = b.hp = 1400; M.outposts.push(b.id); }
  /* --- Ayutthaya's royal camp to the west --- */
  const tc = g.addBuilding('towncentre', 1, KMS.camp[0], KMS.camp[1], true); tc.maxHp = tc.hp = 6000; M.camp = tc.id;
  for (const [hx, hy, fx, fy] of [[2, 16, 2, 18], [2, 26, 2, 28], [9, 27, 11, 27], [9, 15, 11, 15]]) { g.addBuilding('house', 1, hx, hy, true); g.addBuilding('farm', 1, fx, fy, true); }
  g.addBuilding('barracks', 1, 10, 20, true);
  g.addBuilding('phaniat', 1, 5, 11, true);
  g.addBuilding('wat', 1, 5, 30, true);
  g.addBuilding('rong', 1, 9, 31, true);
  // trees: woods to the north-west and south-west, groves between the Baray and the moat, palms inside the walls
  const grove = (cx, cy, rx, ry, dens) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!g.inb(x, y) || Math.hypot((x - cx) / rx, (y - cy) / ry) > 1 || !free(x, y) || camp(x, y) || inCity(x, y) || cityDist(x, y) < 4) continue;
      if (hash2(x, y, g.seed + 61) < dens) g.addNode('tree', x, y);
    }
  };
  for (const [cx, cy, rx, ry, d] of [[6, 4, 6, 3.5, 0.75], [6, 38.5, 6, 3, 0.75], [20, 6, 4.5, 3, 0.55], [21, 35, 4.5, 3, 0.55], [16, 1.5, 3, 1.5, 0.6],
    [33, 4, 2, 2, 0.4], [33, 40, 2, 2, 0.4], [13, 11, 2, 1.5, 0.5], [13, 33, 2, 1.5, 0.5], [62, 8, 1.5, 4, 0.6], [62, 36, 1.5, 4, 0.6]]) grove(cx, cy, rx, ry, d);
  for (let i = 0; i < 70; i++) { const x = 1 + Math.floor(rng() * (W - 2)), y = 1 + Math.floor(rng() * (H - 2)); if (free(x, y) && !camp(x, y) && !inCity(x, y) && cityDist(x, y) > 4 && hash2(x, y, 31) < 0.4) g.addNode('tree', x, y); }
  // the city's own groves: enough wood for barges and repairs, if you spend it well
  for (const [cx, cy] of [[56, 13], [39, 20], [51, 35], [56, 30], [39, 28], [53, 21], [44, 19]]) place('tree', cx, cy, 1.7, 7, true);
  place('gold', 56.5, 20.5, 1.2, 4, true); place('gold', 39.5, 33.5, 1.2, 4, true);
  place('berry', 51, 18, 1.3, 4, true);
  place('gold', 14, 12.5, 1.3, 5); place('gold', 24, 40, 1.4, 5);
  for (let i = 0, n = 0; i < 600 && n < 12; i++) { const x = 30 + Math.floor(rng() * 33), y = LAKE_Y + 1 + Math.floor(rng() * 3); if (g.inb(x, y) && g.isWater(x, y) && !g.block[y * W + x] && g.terrain[y * W + x] === T.DEEP && Math.hypot(x - M.dockW.x, y - M.dockW.y) > 2.5) { g.addNode('fish', x, y); n++; } }
  /* --- people --- */
  const put = (kind, team, x, y) => { const p = g.openSpot(x, y, UD[kind].layer || 0); return g.addUnit(kind, team, p.x, p.y); };
  for (const f of farmsIn) { const v = put('villager', 0, f.x, f.y + 1); g.orderGather(v, f); }
  for (let i = 0; i < 2; i++) { const v = put('villager', 0, 54 + i, 21); const n = g.nearestNode(56.5, 20.5, 'gold', 0, 6, 0); if (n) g.orderGather(v, n); }
  for (let i = 0; i < 2; i++) { const v = put('villager', 0, 50 + i, 34); const n = g.nearestNode(51, 35, 'wood', 0, 6, 0); if (n) g.orderGather(v, n); }
  put('villager', 0, 46, 17);
  for (const f of kf) for (let i = 0; i < 2; i++) { const v = put('villager', 0, f.x, f.y + 1.5); g.orderGather(v, f); v.outerFarmer = true; }
  M.king = put('ponhea', 0, 47.5, 18.2);
  const squad = (kind, n, x, y) => { for (let i = 0; i < n; i++) put(kind, 0, x + (i % 3) * 0.9, y + Math.floor(i / 3) * 0.9); };
  squad('shield', 5, 41.5, 21); squad('spear', 5, 43.5, 21); squad('sna', 6, 41.5, 28.5);
  squad('spear', 2, 47.5, 33); squad('sna', 2, 46, 32.8);
  put('cart', 0, 42.5, 24.5); put('bal', 0, 50.5, 17.5); put('vaidya', 0, 44.5, 22.5);
  // the outwork's small guard
  for (let i = 0; i < 3; i++) { const u = put('shield', 0, 33 + (i % 2), 22.5 + i * 0.9); u.outerGuard = true; }
  for (let i = 0; i < 2; i++) { const u = put('sna', 0, 34.5, 22 + i * 3); u.outerGuard = true; }
  // a war canoe and a barge already at the landing
  put('canoe', 0, M.dockW.x + 2, M.dockW.y + 1);
  put('barge', 0, M.dockW.x, M.dockW.y);
  // Ayutthaya: women in the paddies, the camp guard
  for (const f of g.buildings.filter(b => b.team === 1 && b.kind === 'farm')) { const v = put('ay_vil', 1, f.x, f.y + 1); g.orderGather(v, f); }
  for (const [k, n] of [['daab', 4], ['hok', 3], ['thanu', 4], ['chang', 1]]) for (let i = 0; i < n; i++) { const u = put(k, 1, 12 + (i % 3) * 0.9, 19 + Math.floor(i / 3) * 0.9 + (k === 'thanu' ? 5 : 0)); u.guard = true; }
  g.res[0] = { food: 400, wood: 550, gold: 300 };
  g.wallMasks();
}
// the land tile beside a building nearest a point, and the open water beside it
function landBeside(g, b, toward) {
  let best = null, bd = 1e9;
  for (let y = b.ty - 1; y <= b.ty + b.size; y++) for (let x = b.tx - 1; x <= b.tx + b.size; x++) {
    if (x >= b.tx && x < b.tx + b.size && y >= b.ty && y < b.ty + b.size) continue;
    if (!g.walkable(x, y, 0)) continue;
    const d = Math.hypot(x + 0.5 - toward[0], y + 0.5 - toward[1]); if (d < bd) { bd = d; best = { x: x + 0.5, y: y + 0.5 }; }
  }
  return best || { x: toward[0], y: toward[1] + 1 };
}
function waterBeside(g, b) {
  let best = null, bd = 1e9;
  for (let y = b.ty; y <= b.ty + b.size + 2; y++) for (let x = b.tx - 1; x <= b.tx + b.size; x++) {
    if (!g.walkable(x, y, 1) || y < LAKE_Y - 1) continue;
    const d = Math.hypot(x + 0.5 - b.x, y + 0.5 - (b.ty + b.size + 0.5)); if (d < bd) { bd = d; best = { x: x + 0.5, y: y + 0.5 }; }
  }
  return best || { x: b.x, y: b.ty + b.size + 1.5 };
}

/* ---------- mission state ---------- */
function newMission(g) {
  const loads = {};
  for (const L of LOADS) loads[L.key] = { st: 'home', id: 0 };
  return { t: 0, phase: 1, next: WAVE.first, wave: 0, warned: -1, cardQ: [], cards: {}, burned: 0, outDown: 0,
    heroBack: {}, won: false, why: null, loads, saved: 0, lost: 0, breach: null, gateHits: 0, courtAt: 0, courtReady: false,
    barayT: BARAY.every, rbargeAt: 0, firstSent: false, kingDown: 0 };
}

/* ---------- walls join up; the face gates open and shut ---------- */
const isWallKind = (k) => k === 'wall' || k === 'kwall' || k === 'kgate';
Game.prototype.wallMasks = function () {
  this.wallGrid = new Int32Array(W * H);
  for (const b of this.buildings) if (b.hp > 0 && isWallKind(b.kind)) for (let y = b.ty; y < b.ty + b.size; y++) for (let x = b.tx; x < b.tx + b.size; x++) this.wallGrid[y * W + x] = b.id;
  const at = (x, y) => this.inb(x, y) && this.wallGrid[y * W + x] > 0;
  for (const b of this.buildings) if (b.kind === 'wall' || b.kind === 'kwall') b.mask = (at(b.tx, b.ty - 1) ? 1 : 0) | (at(b.tx + 1, b.ty) ? 2 : 0) | (at(b.tx, b.ty + 1) ? 4 : 0) | (at(b.tx - 1, b.ty) ? 8 : 0);
};
function gateLine(b) {
  const out = [];
  if (b.gk === 'w' || b.gk === 'e') for (let x = b.tx; x < b.tx + 3; x++) out.push([x, b.ty + 1]);
  else for (let y = b.ty; y < b.ty + 3; y++) out.push([b.tx + 1, y]);
  return out;
}
Game.prototype.setGate = function (b, open) {
  if (!b || b.kind !== 'kgate' || b.hp <= 0) return false;
  const line = gateLine(b);
  if (!open && this.units.some(u => u.hp > 0 && u.layer === 0 && line.some(([x, y]) => Math.floor(u.x) === x && Math.floor(u.y) === y))) { b.closing = true; return false; }
  b.open = open; b.closing = false;
  for (const [x, y] of line) this.block[y * W + x] = open ? 0 : 1;
  for (const u of this.units) if (u.path) u.path = null;
  this.regV = (this.regV || 0) + 1;
  this.sfx('creak', b.x, b.y);
  return true;
};
const _addBuilding = Game.prototype.addBuilding;
Game.prototype.addBuilding = function (kind, team, tx, ty, done) {
  const b = _addBuilding.call(this, kind, team, tx, ty, done);
  if (isWallKind(kind) && this.wallGrid) this.wallMasks();
  this.regV = (this.regV || 0) + 1;
  return b;
};
const _cleanup = Game.prototype.cleanup;
Game.prototype.cleanup = function () {
  const n = this.buildings.length;
  _cleanup.call(this);
  if (this.buildings.length !== n) { if (this.wallGrid) this.wallMasks(); this.regV = (this.regV || 0) + 1; }
};
// only river landings below the walls: the moat does not reach the lake
const _canPlace = Game.prototype.canPlace;
Game.prototype.canPlace = function (kind, tx, ty, team) {
  if (kind === 'port' && ty < LAKE_Y - 3) return false;
  return _canPlace.call(this, kind, tx, ty, team);
};

/* ---------- who can reach whom: walls split the map into regions ---------- */
Game.prototype.regions = function () {
  if (this._reg && this._regV === this.regV) return this._reg;
  const R = new Int32Array(W * H); let n = 0;
  for (let i = 0; i < W * H; i++) {
    if (R[i]) continue;
    const x0 = i % W, y0 = (i / W) | 0; if (!this.walkable(x0, y0, 0)) continue;
    n++; const q = [i]; R[i] = n;
    for (let k = 0; k < q.length; k++) {
      const c = q[k], x = c % W, y = (c / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, ni = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || R[ni] || !this.walkable(nx, ny, 0)) continue;
        R[ni] = n; q.push(ni);
      }
    }
  }
  this._reg = R; this._regV = this.regV;
  return R;
};
Game.prototype.regionAt = function (x, y) { const R = this.regions(); return R[Math.floor(y) * W + Math.floor(x)] || 0; };
Game.prototype.canReach = function (u, t) {
  if (u.layer !== 0) return true;
  const ru = this.regionAt(u.x, u.y); if (!ru) return true;
  if (t.isUnit) { if (t.layer !== 0) return false; const rt = this.regionAt(t.x, t.y); return !rt || rt === ru; }
  const R = this.regions();
  for (let y = t.ty - 1; y <= t.ty + t.size; y++) for (let x = t.tx - 1; x <= t.tx + t.size; x++) {
    if (x >= t.tx && x < t.tx + t.size && y >= t.ty && y < t.ty + t.size) continue;
    if (this.inb(x, y) && R[y * W + x] === ru) return true;
  }
  return false;
};
const _nearestEnemy = Game.prototype.nearestEnemy;
Game.prototype.nearestEnemy = function (u, r) {
  const t = _nearestEnemy.call(this, u, r);
  if (!t) return null;
  if (t.isBld && t.kind === 'kwall') return null;
  if (t.isUnit && t.layer === 1 && u.layer === 0) return u.ranged && Math.hypot(t.x - u.x, t.y - u.y) <= u.rng + 0.4 ? t : null;
  if (!this.canReach(u, t)) {
    // over the wall: archers shoot what is already in range, everyone else leaves it alone
    if (u.ranged && (t.isUnit ? Math.hypot(t.x - u.x, t.y - u.y) : rectDist(u.x, u.y, t.rect)) <= u.rng + 0.3) return t;
    return null;
  }
  return t;
};

/* ---------- population: elephants take 3 ---------- */
Game.prototype.popOf = function (team) { let n = 0; for (const u of this.units) if (u.team === team && u.hp > 0 && u.cls !== 'load' && !UD[u.kind].royal) n += UD[u.kind].pop || 1; return n; };
Game.prototype.popCap = function (team) {
  let c = 0; for (const b of this.buildings) if (b.team === team && b.done && b.hp > 0) c += BD[b.kind].pop || 0;
  return Math.min(team === 0 ? POP_CAP : MAXPOP, c);
};
const _queueUnit = Game.prototype.queueUnit;
Game.prototype.queueUnit = function (b, kind, team) {
  const d = UD[kind];
  if (d && d.pop > 1 && this.popOf(b.team) + d.pop > this.popCap(b.team) && b.team === 0) return 'A Ballista Elephant needs room for 3 population. Build more houses.';
  if (d && d.cap && this.countOf(b.team, kind) >= d.cap) return 'You can field ' + d.cap + ' ' + d.name + 's at most.';
  return _queueUnit.call(this, b, kind, team);
};

/* ---------- repair: rice farmers mend walls and gates; the king and a Baray nearby speed it up ---------- */
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
  // loads and barges take orders like anyone else; they pick up their own job again once idle
  _command.call(this, ids, wx, wy, target, opts);
};
Game.prototype.repairRate = function (b) {
  let r = REPAIR * 1.25;
  const k = this.M && this.M.king;
  if (k && k.hp > 0 && Math.hypot(k.x - b.x, k.y - b.y) < 7) r *= 1.5;
  if ((b.kind === 'kgate' || b.kind === 'kwall' || b.kind === 'wall' || b.kind === 'tower') && this.buildings.some(o => o.kind === 'baray' && o.team === 0 && o.done && o.hp > 0 && rectDist(b.x, b.y, o.rect) < BARAY.rng + 4)) r *= 1.25;
  return r;
};
Game.prototype.doRepair = function (u, dt) {
  const b = this.byId.get(u.order.id);
  if (!b || b.hp <= 0 || (b.hp >= b.maxHp && !(b.burnT > 0))) { this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, b.rect) <= 0.95) {
    u.path = null; u.working = true;
    const cx = b.x - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
    b.hp = Math.min(b.maxHp, b.hp + this.repairRate(b) * dt); b.burnT = 0;
    if (b.hp >= b.maxHp) this.idleOrder(u);
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};

/* ---------- per-unit update: repair, refugees, loads on the road, barges on the river ---------- */
const _updateUnit = Game.prototype.updateUnit;
Game.prototype.updateUnit = function (u, dt) {
  const t = u.order.t, d = UD[u.kind];
  const own = t === 'repair' || t === 'refuge' || (u.cls === 'load' && t !== 'move') || (d.barge && u.cargo);
  if (own) {
    u.cd = Math.max(0, u.cd - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
    u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
    u.anim += dt; u.moving = false; u.working = false;
    if (t === 'repair') this.doRepair(u, dt);
    else if (t === 'refuge') this.doRefuge(u, dt);
    else if (u.cls === 'load') this.doLoad(u, dt);
    else this.doSail(u, dt);
  } else {
    _updateUnit.call(this, u, dt);
    // a player-moved load or an empty barge falls back into its own job when it stops
    if (u.cls === 'load' && u.order.t === 'idle') u.order = { t: 'load' };
  }
  if (u.moving && d.trample) u.runT = (u.runT || 0) + dt; else if (!u.moving && u.order.t !== 'attack') u.runT = 0;
};
// walk to a point; returns true on arrival
Game.prototype.walkTo = function (u, x, y, dt, near) {
  if (Math.hypot(u.x - x, u.y - y) < (near || 1)) { u.path = null; return true; }
  if (!u.path) { if (u.wait > 0) return false; if (!this.setPath(u, this.pathToPoint(u, x, y))) { u.wait = 1; return false; } }
  if (this.stepMove(u, dt)) { u.path = null; u.wait = 0.3; }
  return false;
};
// the postern: a small door beside a face gate that lets people through without opening the gate
Game.prototype.postern = function (u, k, toOut) {
  const q = GATES[k], p = this.openSpot(toOut ? q.out[0] : q.in[0], toOut ? q.out[1] : q.in[1], 0);
  u.x = p.x; u.y = p.y; u.path = null; u.wait = 0;
  this.fx.push({ k: 'smoke', sub: 'dust', x: u.x, y: u.y, vy: -0.2, t: 0.5, max: 0.5 });
};
// a load: walk to the South Gate, through the postern, down to the landing, wait for a barge
Game.prototype.doLoad = function (u, dt) {
  const M = this.M; if (!M) return;
  u.lst = u.lst || 'gate';
  const sameSide = this.regionAt(u.x, u.y) && this.regionAt(u.x, u.y) === this.regionAt(M.dock.x, M.dock.y);
  if (u.lst === 'gate' && sameSide) u.lst = 'dock';
  if (u.lst === 'gate') {
    const q = GATES.s;
    if (this.walkTo(u, q.in[0], q.in[1], dt, 1.3)) { this.postern(u, 's', true); u.lst = 'dock'; }
    return;
  }
  if (u.lst === 'dock') { if (this.walkTo(u, M.dock.x, M.dock.y, dt, 1.4)) u.lst = 'wait'; return; }
  if (u.lst === 'wait' && Math.hypot(u.x - M.dock.x, u.y - M.dock.y) > 2.6) u.lst = 'dock';
};
// a loaded barge rows for the far end of the lake
Game.prototype.doSail = function (u, dt) {
  const M = this.M; if (!M) return;
  if (Math.hypot(u.x - M.exit.x, u.y - M.exit.y) < 1.6) { saveLoad(this, u); return; }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, M.exit.x, M.exit.y))) { u.wait = 0.8; return; } }
  if (this.stepMove(u, dt)) { u.path = null; u.wait = 0.2; }
};
// an outer-town farmer runs for the nearest gate and slips in by the postern
Game.prototype.doRefuge = function (u, dt) {
  const o = u.order, q = GATES[o.k];
  if (!q || this.regionAt(u.x, u.y) === this.regionAt(q.in[0], q.in[1])) { this.idleOrder(u); return; }
  const s = u.spd; u.spd = s * 1.2;
  const there = this.walkTo(u, q.out[0], q.out[1], dt, 1.4);
  u.spd = s;
  if (there) { this.postern(u, o.k, false); this.idleOrder(u); u.outerFarmer = false; if (this.M) this.M.fled++; }
};
const _doIdle = Game.prototype.doIdle;
Game.prototype.doIdle = function (u, dt) {
  const M = this.M, d = UD[u.kind];
  // an empty barge goes back to the landing to wait for the next load
  if (d.barge && u.team === 0 && M && !u.cargo) {
    if (Math.hypot(u.x - M.dockW.x, u.y - M.dockW.y) > 3.5 && !(u.parkT > this.t)) { this.orderMove(u, M.dockW.x + (this.rng() - 0.5) * 2, M.dockW.y + this.rng()); u.parkT = this.t + 6; }
    return;
  }
  // Ayutthaya's war boats hold the far reach of the lake
  if (u.team === 1 && u.navy && M) {
    u.scan -= dt; if (u.scan > 0) return; u.scan = 0.5;
    const t = this.nearestEnemy(u, u.sight); if (t) { this.orderAttack(u, t, { leash: { x: M.block.x, y: M.block.y, r: 16 } }); return; }
    if (Math.hypot(u.x - u.post.x, u.y - u.post.y) > 1.5) this.orderMove(u, u.post.x, u.post.y);
    return;
  }
  _doIdle.call(this, u, dt);
};

/* ---------- buildings: fire, the Baray's fields ---------- */
const _updateBuilding = Game.prototype.updateBuilding;
Game.prototype.updateBuilding = function (b, dt) {
  _updateBuilding.call(this, b, dt);
  if (b.closing && b.kind === 'kgate') this.setGate(b, false);
  if (b.hp <= 0 || !(b.burnT > 0)) return;
  b.burnT -= dt;
  b.hp -= b.burnR * dt;
  if (this.rng() < dt * 3) this.fx.push({ k: 'smoke', x: b.x + (this.rng() - 0.5) * b.size * 0.7, y: b.y - 0.3 - b.size * 0.2, vy: -0.7 - this.rng() * 0.6, t: 1.5, max: 1.5 });
  if (b.hp <= 0) { b.hp = 0; this.onKilled(b, { team: 1, isUnit: false }); }
};
Game.prototype.igniteB = function (b, secs, mult) {
  const was = b.burnT > 0;
  if (!mult) return;
  b.burnT = Math.max(b.burnT || 0, secs); b.burnR = LBURN.rate * mult;
  if (!was && mult >= 1) {
    this.fx.push({ k: 'fire', x: b.x, y: b.y, t: 0.6, max: 0.6 });
    this.sfx('ignite', b.x, b.y);
  }
};
Game.prototype.sfx = function (name, x, y) { (this.sfxQ || (this.sfxQ = [])).push({ name, x, y }); };

/* ---------- combat: fire arrows, elephants against gates, trample, auras, ballista bolts ---------- */
const _damage = Game.prototype.damage;
Game.prototype.damage = function (att, tgt, w) {
  const ad = att.kind && att.isUnit ? UD[att.kind] : null;
  if (tgt.isUnit && tgt.cls === 'load' && tgt.order.t === 'attack') tgt.order = { t: 'load' };
  if (!ad) { this.wallDamage(att, tgt, w); return; }
  let plus = 0;
  if (tgt.isBld && ad.bld) plus += ad.bld;
  if (tgt.isBld && tgt.kind === 'kgate' && ad.gate) {
    plus += ad.gate;
    this.fx.push({ k: 'smoke', sub: 'dust', x: tgt.x + (this.rng() - 0.5) * 1.2, y: tgt.y + 0.6, vy: -0.4, t: 1.0, max: 1.0 });
    this.fx.push({ k: 'smoke', sub: 'chip', x: tgt.x + (this.rng() - 0.5) * 1.6, y: tgt.y + 0.2, vy: -0.9, t: 0.6, max: 0.6 });
    this.sfx('ram', tgt.x, tgt.y);
    if (this.M) { this.M.gateHits++; this.M.gateHitT = this.t; this.M.gateHitK = tgt.gk; }
  } else if (tgt.isBld && (ad.bld || 0) > 20) this.sfx('thud', tgt.x, tgt.y);
  const charge = ad.trample && (att.runT || 0) > 1.2 && tgt.isUnit;
  if (charge) { plus += ad.trample; att.runT = 0; }
  plus += this.auraFor(att);
  // fire arrows: timber catches, Khmer stone only scorches
  let fireArrow = false;
  if (ad.fire && tgt.isBld) {
    fireArrow = true;
    const mult = burnMult(tgt);
    plus += Math.round(ad.fire.dmg * mult);
    this.igniteB(tgt, ad.fire.burn, mult);
    for (let i = this.arrows.length - 1; i >= 0 && i >= this.arrows.length - 4; i--) { const r = this.arrows[i]; if (r.t === 0 && r.x0 === att.x && !r.k) { r.k = 'fire'; break; } }
    this.sfx('bow', att.x, att.y);
    if (tgt.team === 0 && mult < 1 && this.t - (this.lastStoneMsg || -99) > 60) { this.lastStoneMsg = this.t; this.msg('Their fire arrows only scorch our stone. The elephants are the danger.'); }
  }
  if (ad.pierce || (ad.ranged && ad.big === 'kbal')) {
    for (let i = this.arrows.length - 1; i >= 0 && i >= this.arrows.length - 4; i--) { const r = this.arrows[i]; if (r.t === 0 && r.x0 === att.x && (!r.k || r.k === 'shot')) { r.k = 'bolt'; break; } }
    this.sfx('bolt', att.x, att.y);
  }
  const atk0 = att.atk;
  att.atk = Math.round(atk0 + plus);
  this.wallDamage(att, tgt, w);
  att.atk = atk0;
  // a cart ballista's bolt goes on through the men behind its target
  if (ad.pierce && tgt.isUnit) {
    const dx = tgt.x - att.x, dy = tgt.y - att.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    let n = 0;
    this.unitsNear(tgt.x + ux * 1.3, tgt.y + uy * 1.3, 2, (o) => {
      if (n >= 2 || o === tgt || o.hp <= 0 || o.team === att.team || o.team === 2 || o.layer !== tgt.layer) return;
      const px = o.x - tgt.x, py = o.y - tgt.y, along = px * ux + py * uy, off = Math.abs(px * uy - py * ux);
      if (along < 0 || along > 2.6 || off > 0.6) return;
      const a0 = att.atk; att.atk = Math.round(atk0 * 0.6); _damage.call(this, att, o); att.atk = a0; n++;
    });
  }
  // the charge: the elephant runs on through the men around its target
  if (charge) {
    const x = tgt.x, y = tgt.y;
    this.unitsNear(x, y, 1.6, (o) => {
      if (o === tgt || o.hp <= 0 || o.team === att.team || o.team === 2 || o.layer !== 0 || Math.hypot(o.x - x, o.y - y) > 1.2) return;
      const a0 = att.atk; att.atk = Math.round(a0 * 0.6); _damage.call(this, att, o); att.atk = a0;
    });
    for (let i = 0; i < 4; i++) this.fx.push({ k: 'smoke', sub: 'dust', x: x + (this.rng() - 0.5) * 1.4, y: y + 0.2, vy: -0.25, t: 0.8, max: 0.8 });
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
  if (t.isUnit && t.team === 0) {
    const d = UD[t.kind];
    if (d.hero) {
      if (M.phase >= 3 && !M.loads.royal.left) { M.why = 'king'; }
      else { M.heroBack[t.kind] = M.t + HERO_BACK; this.msg('Ponhea Yat is wounded and carried to the palace. Back in ' + HERO_BACK + 's.'); }
    }
    if (d.cls === 'load') loseLoad(this, d.load === 'royal' ? 'royal' : t.lkey, 'road');
    if (d.barge && t.cargo) loseLoad(this, t.cargo, 'river');
    if (d.royal && !t.cargo && M.phase >= 3) { M.rbargeAt = M.t + 40; this.msg('The royal barge is sunk! Another is being poled down from the north channel.'); }
  }
  if (t.isUnit && t.team === 1 && t.kind === 'king') {
    M.kingDown++; M.next = Math.max(M.next, M.t + 40);
    this.msg('King Borommarachathirat II is carried from the field. Ayutthaya\'s assault falters.');
  }
  if (t.isBld && t.team === 0) {
    if (t.outer) { M.burned++; if (M.burned === 1) this.msg('The outer town is burning. Its people run for the gates.'); }
    if (t.outpost) { M.outDown++; this.msg(M.outDown >= 2 ? 'The outworks have fallen. The west causeway is open to them.' : 'A face tower of the outworks falls.'); }
    if (t.kind === 'kgate') {
      M.breach = M.breach || t.gk; M.lastBreach = t.gk;
      this.msg('The ' + GATES[t.gk].name + ' is broken! Ayutthaya is in the city!');
      this.sfx('crash', t.x, t.y);
      for (let i = 0; i < 18; i++) this.fx.push({ k: 'smoke', sub: 'dust', x: t.x + (this.rng() - 0.5) * 3, y: t.y + (this.rng() - 0.5) * 2, vy: -0.3 - this.rng() * 0.5, t: 1.6 + this.rng(), max: 2.6 });
    }
    if (t.id === M.port) this.msg('The river landing is burnt! No more barges can be built.');
  }
};
function loadKey(kind) { const L = LOADS.find(L => L.kind === kind); return L ? L.key : null; }
function saveLoad(g, barge) {
  const M = g.M, key = barge.cargo;
  barge.hp = 0; barge.silent = true; barge._dead = true;
  if (key === 'royal') { M.loads.royal.st = 'saved'; M.loads.royal.left = true; if (!M.cards.closing) { M.cards.closing = true; M.cardQ.push('closing'); } return; }
  M.loads[key].st = 'saved'; M.saved++;
  g.msg(LOADS.find(L => L.key === key).name + ' reached the Tonlé Sap. Saved!');
  g.sfx('bell', barge.x, barge.y);
}
function loseLoad(g, key, where) {
  const M = g.M; if (!key || !M.loads[key] || M.loads[key].st === 'lost' || M.loads[key].st === 'saved') return;
  M.loads[key].st = 'lost';
  if (key === 'royal') { M.why = 'royal'; return; }
  M.lost++;
  const L = LOADS.find(L => L.key === key);
  g.msg(L.name + (where === 'river' ? ' sank with its barge.' : ' is taken by Ayutthaya.'));
  M.lostNote = { key, where, t: M.t };
}

/* ---------- sending a load out of the city ---------- */
function loadOpen(M, L) { return M.loads[L.key].st === 'home' && M.phase >= L.phase && (L.key !== 'royal' || M.courtReady); }
Game.prototype.sendLoad = function (key) {
  const M = this.M, L = LOADS.find(L => L.key === key); if (!M || !L) return 'Not available.';
  if (!loadOpen(M, L)) return M.phase < L.phase ? 'Not yet.' : key === 'royal' && !M.courtReady ? 'The court is not ready yet.' : 'Already sent.';
  const court = this.byId.get(M.court); if (!court || court.hp <= 0) return 'The royal compound is gone.';
  if (key === 'royal') {
    const k = M.king;
    if (!k || k.hp <= 0) return 'Wait for Ponhea Yat to return.';
  } else if (!this.canAfford(0, LOAD_COST)) return 'Not enough food for the journey (' + LOAD_COST.food + ' food).';
  if (key !== 'royal') this.pay(0, LOAD_COST);
  const sp = this.findSpawn(court, { x: GATES.s.in[0], y: GATES.s.in[1] }, 0);
  const u = this.addUnit(L.kind, 0, sp.x, sp.y); u.lkey = key; u.order = { t: 'load' };
  M.loads[key].st = 'road'; M.loads[key].id = u.id;
  if (key === 'royal') {
    // the king walks with his family: he leaves the field
    const k = M.king; k.hp = 0; k.silent = true; k._dead = true; M.king = null;
    this.msg('Ponhea Yat and the royal family leave the palace for the river.');
  } else this.msg(L.name + ' set out for the South Gate.');
  if (!M.firstSent) { M.firstSent = true; M.cardQ.push('postern'); }
  return null;
};

/* ---------- the mission ---------- */
Game.prototype.aiTick = function () { if (this.M) missionAI(this); };
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (!this.buildings.some(b => b.id === M.court && b.hp > 0) && !M.loads.royal.left && M.loads.royal.st !== 'road' && M.loads.royal.st !== 'river') M.why = M.why || 'court';
  if (M.why) { this.over = 'lose'; return; }
  if (M.won) this.over = 'win';
};
const _update = Game.prototype.update;
Game.prototype.update = function (dt) {
  this.heroes = this.units.filter(u => u.hp > 0 && UD[u.kind].aura);
  _update.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};
function courtPos(g) { const c = g.byId.get(g.M.court); return c && c.hp > 0 ? c : { x: KMS.court[0] + 1.5, y: KMS.court[1] + 1.5, hp: 1 }; }
function gateAlive(g, k) { const b = g.byId.get(g.M.gates[k]); return b && b.hp > 0 ? b : null; }
// a gap into the city: a broken gate, or one left open
function wayIn(g) {
  for (const k in GATES) { const b = gateAlive(g, k); if (!b || b.open) return k; }
  return null;
}
function missionAI(g) {
  const M = g.M, court = courtPos(g), inK = wayIn(g);
  for (const u of g.units) {
    if (u.hp <= 0) continue;
    if (u.team === 0) {
      // outer-town farmers run for the gates when soldiers come near
      if (u.outerFarmer && u.order.t !== 'refuge') {
        let near = false;
        g.unitsNear(u.x, u.y, 6, (o) => { if (o.team === 1 && o.hp > 0 && o.cls !== 'vil' && Math.hypot(o.x - u.x, o.y - u.y) < 6) near = true; });
        if (near || u.hp < u.maxHp) {
          let best = null, bd = 1e9;
          for (const k in GATES) { const q = GATES[k], d = Math.hypot(q.out[0] - u.x, q.out[1] - u.y); if (d < bd && gateAlive(g, k)) { bd = d; best = k; } }
          if (best) { u.order = { t: 'refuge', k: best }; u.path = null; }
        }
      }
      // an attack on something across the wall is dropped
      if (u.order.t === 'attack' && u.layer === 0 && !u.ranged) { const t = g.byId.get(u.order.id); if (t && t.hp > 0 && !g.canReach(u, t)) g.idleOrder(u); }
      continue;
    }
    if (u.team !== 1 || !u.wave) continue;
    if (u.navy) continue;
    const d = UD[u.kind];
    if (u.order.t === 'attack') {
      const t = g.byId.get(u.order.id);
      if (t && t.hp > 0 && (d.ranged || g.canReach(u, t))) continue;
      g.idleOrder(u);
    }
    const busy = u.order.t === 'amove' && (u.path || u.wait > 0);
    // inside the city, or a way in: go for the royal compound
    const inside = inCity(u.x, u.y);
    const k = u.wk, q = GATES[k], gate = gateAlive(g, k);
    if (inside || (M.phase >= 3 && inK && (u.goIn || Math.hypot(u.x - GATES[inK].out[0], u.y - GATES[inK].out[1]) < 14)) || (inK && Math.hypot(u.x - GATES[inK].out[0], u.y - GATES[inK].out[1]) < 7)) {
      u.goIn = true;
      if (!(u.order.t === 'amove' && u.order.court && busy)) { g.orderAMove(u, court.x + (g.rng() - 0.5) * 2, court.y + 2.2); u.order.court = true; }
      continue;
    }
    if (d.gate && gate) { g.orderAttack(u, gate); continue; }
    if (d.fire && M.phase < 3) {
      let best = null, bd = 30;
      for (const id of M.outer) { const b = g.byId.get(id); if (b && b.hp > 0) { const dd = rectDist(u.x, u.y, b.rect); if (dd < bd) { bd = dd; best = b; } } }
      if (best) { g.orderAttack(u, best); continue; }
    }
    if (!gate && !inK) { if (!busy) g.orderAMove(u, court.x, court.y + 2); continue; }
    if (busy) continue;
    if (Math.hypot(u.x - q.out[0], u.y - q.out[1]) > 3.5) g.orderAMove(u, q.out[0] + (g.rng() - 0.5) * 3, q.out[1] + (g.rng() - 0.5) * 3);
    else {
      // at the gate with nothing to hit: the outworks, then any Khmer within reach
      const t = g.nearestEnemy(u, 9);
      if (t) g.orderAttack(u, t);
    }
  }
  // the war boats
  for (const u of g.units) {
    if (u.team !== 1 || !u.navy || u.hp <= 0 || u.order.t === 'attack') continue;
    let best = null, bd = 18;
    for (const o of g.units) if (o.team === 0 && o.hp > 0 && o.layer === 1) { const dd = Math.hypot(o.x - u.x, o.y - u.y) - (o.cargo ? 6 : 0); if (dd < bd) { bd = dd; best = o; } }
    if (best) g.orderAttack(u, best, { leash: { x: M.block.x, y: M.block.y, r: 22 } });
  }
}
function waveGate(g, n) {
  const M = g.M;
  if (M.phase >= 3) return M.breach && !gateAlive(g, M.breach) ? M.breach : ['w', 's', 'n'].find(k => gateAlive(g, k)) || 'w';
  if (M.phase === 1) return 'w';
  const ks = GATE_ORDER.filter(k => gateAlive(g, k));
  return ks.length ? ks[n % ks.length] : 'w';
}
function launchWave(g, king) {
  const M = g.M, comp = king ? KING_WAVE : WAVES[Math.min(M.wave, WAVES.length - 1)], extra = king ? 0 : Math.max(0, M.wave - WAVES.length + 1);
  const camp = g.byId.get(M.camp), from = camp && camp.hp > 0 ? { x: camp.x + 4, y: camp.y + 1 } : { x: 2, y: 22 };
  const k = waveGate(g, M.wave);
  const kinds = [];
  for (const key in comp) {
    const base = comp[key] + (key === 'daab' || key === 'thanu' ? extra : 0);
    const n = key === 'king' ? 1 : Math.max(key === 'chang' || key === 'mo' ? 1 : 0, Math.round(base * DMUL[g.diff]));
    for (let j = 0; j < n; j++) kinds.push(key);
  }
  // from the sixth attack of the river phase, the army splits and strikes two gates at once
  const k2 = M.phase === 2 && !king && M.wave >= 5 ? ['w', 'n', 's'].find(o => o !== k && gateAlive(g, o)) : null;
  kinds.sort((a, b) => (a === 'chang') - (b === 'chang'));
  kinds.forEach((kind, j) => {
    const p = g.openSpot(from.x + ((j % 4) - 1.5) * 0.9, from.y + (((j / 4) | 0) - 2) * 0.9, 0);
    const u = g.addUnit(kind, 1, p.x, p.y); u.wave = M.wave + 1; u.wk = k2 && j % 2 ? k2 : k;
  });
  if (M.phase >= 2 && !king) spawnNavy(g);
  g.alerts.push({ x: GATES[k].out[0], y: GATES[k].out[1], t: 3 });
  if (k2) g.alerts.push({ x: GATES[k2].out[0], y: GATES[k2].out[1], t: 3 });
  M.lastWave = { gate: k, t: M.t, n: kinds.length };
  g.msg(king ? 'The king of Ayutthaya himself rides against the ' + GATES[k].name + '!' : 'Ayutthaya attacks! ' + kinds.length + ' men march on the ' + GATES[k].name + (k2 ? ' and the ' + GATES[k2].name : '') + '.');
  if (!king) M.wave++;
}
// war boats come up the lake and hold its far reach
function spawnNavy(g) {
  const M = g.M, afloat = g.units.filter(u => u.team === 1 && u.navy && u.hp > 0).length;
  for (let i = 0; i < Math.min(NAVY[g.diff], NAVY_CAP[g.diff] - afloat); i++) {
    const p = g.openSpot(M.navyIn.x, M.navyIn.y + i * 0.6, 1);
    const b = g.addUnit('light', 1, p.x, p.y); b.navy = true; b.wave = M.wave + 1;
    b.post = { x: M.block.x - i * 1.2, y: M.block.y + (i % 2 ? 0.8 : -0.4) };
    g.orderMove(b, b.post.x, b.post.y);
  }
}
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  // the Baray: every worked rice field in its reach brings in a little more
  M.barayT -= dt;
  if (M.barayT <= 0) {
    M.barayT = BARAY.every;
    const barays = g.buildings.filter(b => b.kind === 'baray' && b.team === 0 && b.done && b.hp > 0);
    if (barays.length) {
      const worked = new Set(); for (const u of g.units) if (u.team === 0 && u.hp > 0 && u.order.t === 'gather' && u.order.type === 'food') worked.add(u.order.id);
      for (const f of g.buildings) if (f.kind === 'farm' && f.team === 0 && f.done && worked.has(f.id) && barays.some(b => rectDist(f.x, f.y, b.rect) <= BARAY.rng)) {
        g.res[0].food += BARAY.food; g.floaters.push({ x: f.x, y: f.y - 0.8, text: '+' + BARAY.food, type: 'food', t: 1.3 });
      }
    }
  }
  // waves
  if (M.next - M.t <= 15 && M.warned < M.wave) { M.warned = M.wave; g.msg('Drums from the camp: Ayutthaya is forming up to attack.'); }
  if (M.t >= M.next) {
    launchWave(g, false);
    M.next = M.t + (M.phase >= 3 ? WAVE.fallGap : WAVE.gap - Math.min(25, M.wave * 3));
  }
  // phase 1 -> 2: the river
  if (M.phase === 1 && M.t >= PHASE.river) { M.phase = 2; M.phaseAt = M.t; M.cardQ.push('river'); spawnNavy(g); g.msg('War boats of Ayutthaya are coming up the lake!'); }
  // phase 2 -> 3: a gate is broken, or the siege has lasted long enough
  if (M.phase < 3 && (M.breach || M.t >= PHASE.fall[g.diff])) {
    if (M.phase === 1) { M.phaseAt2 = M.t; }
    M.phase = 3; M.phaseAt = M.t; M.cardQ.push('fall');
    M.courtAt = M.t + COURT[g.diff];
    const k = M.king; if (k && k.hp > 0) { k.hp = k.maxHp; const c = g.byId.get(M.court); if (c) g.orderMove(k, c.x, c.y + 2.5); }
    M.rbargeAt = M.t + 2;
    launchWave(g, true);
    M.next = M.t + WAVE.fallGap;
  }
  if (M.courtAt && !M.courtReady && M.t >= M.courtAt) { M.courtReady = true; g.msg('The court is ready. Send Ponhea Yat and the royal family to the river.'); g.sfx('bell', 0, 0); }
  // the royal barge comes down to the landing
  if (M.rbargeAt && M.t >= M.rbargeAt && !g.units.some(u => u.kind === 'rbarge' && u.hp > 0)) {
    M.rbargeAt = 0;
    const p = g.openSpot(M.dockW.x + 1.5, M.dockW.y + 0.5, 1); g.addUnit('rbarge', 0, p.x, p.y);
    g.msg('The royal barge has come down to the landing.');
  }
  // boarding: a load waiting at the landing goes aboard an empty barge there
  for (const L of LOADS) {
    const s = M.loads[L.key]; if (s.st !== 'road') continue;
    const u = g.byId.get(s.id); if (!u || u.hp <= 0 || u.lst !== 'wait') continue;
    const b = g.units.find(b => b.team === 0 && b.hp > 0 && UD[b.kind].barge && !b.cargo && !!UD[b.kind].royal === (L.key === 'royal') && Math.hypot(b.x - M.dockW.x, b.y - M.dockW.y) < 4.5);
    if (!b) { if (!s.waitMsg || M.t - s.waitMsg > 25) { s.waitMsg = M.t; g.msg(L.key === 'royal' ? 'The royal family waits at the landing for the royal barge.' : L.name + ' wait' + (L.key === 'monks' || L.key === 'texts' ? '' : 's') + ' at the landing. Build a river barge.'); } continue; }
    u.hp = 0; u.silent = true; u._dead = true;
    b.cargo = L.key; b.path = null; b.order = { t: 'sail' };
    s.st = 'river'; s.id = b.id;
    g.msg(L.key === 'royal' ? 'The royal barge casts off!' : L.name + (L.key === 'monks' || L.key === 'texts' ? ' are' : ' is') + ' aboard. The barge rows for the open lake.');
    g.sfx('bell', b.x, b.y);
    if (!M.cards.barge) { M.cards.barge = true; M.cardQ.push('vig-barge'); }
  }
  // Ponhea Yat comes back from the palace
  for (const k in M.heroBack) if (M.heroBack[k] && M.t >= M.heroBack[k]) {
    const c = g.byId.get(M.court); if (!c || c.hp <= 0) break;
    M.heroBack[k] = 0;
    const sp = g.findSpawn(c, null, 0), u = g.addUnit(k, 0, sp.x, sp.y);
    M.king = u;
    g.msg('Ponhea Yat takes up his sword again.');
  }
}

/* ---------- naval combat at the mission's date (1431): no ship cannon yet ----------
   Khmer war canoes shoot ballista bolts that pass through a line of boats but barely mark buildings;
   Ayutthaya war boats loose crossbow volleys, without fire arrows (kept near their old strength so the river
   phase stays fair). Khmer stone burns at a quarter of timber. */
NAVWPN.tierDefault = 1;
BURNMAT[0] = 0.25; BURNMAT[1] = 1;
Object.assign(UD.canoe, { wpn: 'arrow', swivel: true, pierce: true, kb: { light: 3, boat: 4 } });
Object.assign(UD.light, { atk: 5, rate: 1.6, rng: 5, fireA: false, kb: { boat: 4 } });

/* hand-made map: keep every tree (the main game thins woods on random maps, v0.9.40) */
Game.prototype.openWoods = function () {};
