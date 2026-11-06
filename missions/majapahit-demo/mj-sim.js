
/* ===== mj-sim.js ===== */
/* ==========================================================================
   Majapahit demo: "The Treasurer's Gate" (c. 1398), the attacker's side.
   The fleet has no town centre: the Jong Raya flagship is the base and launches boats on cooldowns.
   Batam, an island in the Strait with a neutral Orang Laut village, is where the fleet gathers
   wood and food. Singapura holds its earth walls; Ayutthaya races Majapahit for the city.
   Phase 1: land on Batam, build a Lumbung, win the Orang Laut, burn the harbour.
   Phase 2: get the messenger to the treasurer (or break a gate by force).
   Phase 3: the south gate opens; raise the Majapahit banner over Bukit Larangan.
   Sim side only (no DOM). Teams: 0 Majapahit (player), 1 Singapura, 2 neutral, 3 Ayutthaya.
   ========================================================================== */

const DMUL = { easy: 0.7, normal: 1, hard: 1.3 };
/* the map is laid out on a 64x48 grid and scaled to the page's W x H (96x72 since 2026-11-01: Iylia wanted more room in Singapura).
   mx/my scale a design x / length, sy scales a design y (the land, rows 0-18, gets more of the extra height than the sea); ix/isy round to a tile.
   Keep in step with Melaka m1's mission-sim.js, which shares this map. */
const MX = W / 64, MY = H / 48, mx = v => v * MX, my = v => v * MY, ix = v => Math.round(v * MX);
const SG_LAND = Math.round(H * 0.46), sy = v => v <= 18 ? v * SG_LAND / 18 : SG_LAND + (v - 18) * (H - SG_LAND) / 30, isy = v => Math.round(sy(v));
const SIAM_CAP = { easy: 14, normal: 18, hard: 26 };          // most of Ayutthaya's army on the land at once
const RACE_MIN = { easy: 28, normal: 24, hard: 21 };          // minutes until Ayutthaya takes the city on its own
const TALK = { easy: 45, normal: 60, hard: 75 };              // seconds the messenger must talk with the treasurer
const SPOT = { easy: 0.025, normal: 0.045, hard: 0.075 };     // chance every 4 s inside the walls that the messenger is found out
const LEVY_CAP = { easy: 24, normal: 32, hard: 40 };        // Singapura tops its garrison up to this many inside the walls
const BANNER_T = 20, POP_CAP = 90, FLAG_POP = 30;
const SUPPLY = { every: 5, food: 4, wood: 4 };                 // the fleet's own stores
const PLUNDER = { outer: { food: 40, gold: 25 }, farm: { food: 30, gold: 0 }, boat: { food: 15, gold: 5 }, port: { food: 60, gold: 80 }, soldier: { food: 0, gold: 3 } };
const GIFT = { food: 150, wood: 100 };
/* Singapura is laid out the same as in Melaka's mission 1 (Iylia, 2026-10-31): a bigger walled city in rows,
   the harbour in its south-east corner where the walls stop at the water */
const CITY = { x0: ix(14), x1: ix(48), y0: isy(2), y1: isy(15) };
const GATE_S = { tx: ix(31), ty: isy(15), out: [ix(31) + 0.5, isy(15) + 1.6], inn: [ix(31) + 0.5, isy(15) - 1.1] };
const GATE_W = { tx: ix(14), ty: isy(8), out: [ix(14) - 1.6, isy(8) + 0.5], inn: [ix(14) + 1.6, isy(8) + 0.5] };
const HARBOUR = { inlet: [ix(44), ix(48), isy(11)], port: [ix(44), isy(11) - 1], tower: [ix(50), isy(12)] };
const ISLE = { cx: mx(30), cy: sy(33), rx: mx(9.5), ry: my(4.8) };
const VILLAGE = [ix(33), isy(30)];
const FLAG_START = [mx(55), sy(41)];
// the flagship's launches: what each boat carries, its cost and its cooldown group
const LAUNCH = {
  workers: { boat: 'light', cargo: { villager: 4 }, cost: { food: 50, wood: 20 }, grp: 'jukung', label: 'Kawula', tip: 'A Jukung Perang with 4 Kawula workers' },
  swords: { boat: 'light', cargo: { keris: 4 }, cost: { food: 90, gold: 20 }, grp: 'jukung', label: 'Golok', tip: 'A Jukung Perang with 4 Golok swordsmen' },
  spears: { boat: 'light', cargo: { tombak: 4 }, cost: { food: 70, wood: 30 }, grp: 'jukung', label: 'Galah', tip: 'A Jukung Perang with 4 Galah spearmen' },
  archers: { boat: 'light', cargo: { archer: 4 }, cost: { food: 30, wood: 40, gold: 35 }, grp: 'jukung', label: 'Panah', tip: 'A Jukung Perang with 4 archers' },
  fire: { boat: 'fireship', cargo: {}, cost: { wood: 60, gold: 10 }, grp: 'fire', label: 'Perahu Api', tip: 'A fire ship: sail it into the enemy and it burns everything around' },
  kelulus: { boat: 'galley', cargo: { bhaya: 2, keris: 3, tombak: 3 }, cost: { food: 140, wood: 100, gold: 50 }, grp: 'kelulus', label: 'Kelulus', tip: 'A Kelulus galley with 2 Bhayangkara, 3 Golok and 3 Galah. Needs the Orang Laut' },
  messenger: { boat: 'msgboat', cargo: { utusan: 1 }, cost: {}, grp: 'msg', label: 'Utusan', tip: 'The messenger, dressed as a trader, in a small trading boat' }
};
const TORCH = { sword: 7, spear: 5, elite: 8, archer: 4 };   // fire damage a hit does to a building
const COOLDOWN = { jukung: 22, fire: 40, kelulus: 70, msg: 0 };

/* ---------- units ---------- */
Object.assign(UD, {
  // Majapahit (player): the fleet's boats carry troops
  obor: { name: 'Obor (Torch bearer)', hp: 42, spd: 2.4, atk: 2, rng: 2.2, rate: 1.0, ma: 0, pa: 1, sight: 6, cost: { food: 40, wood: 30 }, time: 8, cls: 'sword', fire: 10 },
  utusan: { name: 'Utusan (Messenger)', hp: 40, spd: 2.7, atk: 0, rng: 0, rate: 1, ma: 0, pa: 1, sight: 6, cost: {}, time: 0, cls: 'scout', msgr: true },
  msgboat: Object.assign({}, UD.boat, { name: 'Perahu Dagang (Trader\'s boat)', cls: 'ship', carry: 0, hp: 70, spd: 3.3, cap: 1, slot: 'fishing', cost: {} }),
  // Singapura's own soldiers (the aux civ sheet)
  sg_spear: { name: 'Pembawa Lembing (Spearman)', hp: 50, spd: 2.3, atk: 5, bonus: { sword: 5, elite: 4, eleph: 10 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: {}, time: 0, cls: 'spear', aux: 'spear' },
  sg_sword: { name: 'Hulubalang (Keris and shield)', hp: 60, spd: 2.4, atk: 8, bonus: { archer: 3 }, rng: 0.85, rate: 1.0, ma: 2, pa: 2, sight: 6.5, cost: {}, time: 0, cls: 'sword', aux: 'sword' },
  sg_archer: { name: 'Pemanah (Archer)', hp: 30, spd: 2.2, atk: 6, bonus: { spear: 3, elite: 3 }, rng: 5.5, rate: 1.5, ma: 0, pa: 0, sight: 7.5, cost: {}, time: 0, cls: 'archer', ranged: true, aux: 'archer' },
  sg_sumpit: { name: 'Penyumpit (Blowpipe)', hp: 28, spd: 2.5, atk: 3, rng: 4.2, rate: 1.3, ma: 0, pa: 1, sight: 7, cost: {}, time: 0, cls: 'archer', ranged: true, aux: 'sumpit', poison: 6 },
  // the Orang Laut: sea people sworn to Singapura's kings
  olboat: { name: 'Perahu Orang Laut', hp: 160, spd: 4.6, atk: 5, rng: 4.2, rate: 1.6, ma: 1, pa: 3, sight: 7.5, cost: {}, time: 0, cls: 'ship', ranged: true, layer: 1, slot: 'light' },
  // Ayutthaya: a third side racing for the same port
  ay_daab: { name: 'Thahan Daab (Ayutthaya swordsman)', hp: 58, spd: 2.4, atk: 8, bonus: { archer: 3 }, rng: 0.85, rate: 1.0, ma: 1, pa: 2, sight: 6.5, cost: {}, time: 0, cls: 'sword', ayu: 'sword' },
  ay_hok: { name: 'Thahan Hok (Ayutthaya spearman)', hp: 52, spd: 2.3, atk: 5, bonus: { sword: 5, elite: 4 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: {}, time: 0, cls: 'spear', ayu: 'spear' },
  ay_thanu: { name: 'Phon Thanu (Ayutthaya archer)', hp: 30, spd: 2.2, atk: 6, bonus: { spear: 3 }, rng: 5.5, rate: 1.5, ma: 0, pa: 0, sight: 7.5, cost: {}, time: 0, cls: 'archer', ranged: true, ayu: 'archer' },
  ay_chang: { name: 'Chang Suek (Ayutthaya war elephant)', hp: 520, spd: 1.9, atk: 16, rng: 1.2, rate: 1.6, ma: 3, pa: 3, sight: 7, cost: {}, time: 0, cls: 'eleph', big: 'chang', bld: 30, pop: 3 },
  ay_boat: { name: 'Ruea Chai (Siamese war boat)', hp: 110, spd: 3.4, atk: 6, rng: 5, rate: 1.7, ma: 1, pa: 1, sight: 7.5, cost: {}, time: 0, cls: 'ship', ranged: true, layer: 1, slot: 'light', ayuShip: 'light' },
  ay_galley: { name: 'Ruea Rop (Siamese galley)', hp: 220, spd: 2.6, atk: 0, rng: 0, rate: 1, ma: 2, pa: 2, sight: 6, cost: {}, time: 0, cls: 'ship', layer: 1, slot: 'galley', ayuShip: 'galley' }
});
UD.light.cap = 4; UD.galley.cap = 8;
UD.keris.bonus = Object.assign({}, UD.keris.bonus, { eleph: 2 });
UD.tombak.bonus = Object.assign({}, UD.tombak.bonus, { eleph: 12 });
UD.flagship.atk = 14; UD.flagship.rng = 6.5;
Object.assign(ORDER_CLS, { scout: 0.5, eleph: 0.4 });
// the fleet's people are Majapahit; Singapura and Ayutthaya are no one's villains
TEAMMOD[3] = { hp: 1, spd: 1, cost: 1, arm: 0 };
// civ names: index 0 = Melaka / Singapura names, 1 = Majapahit (CV() below picks by team)
Object.assign(CIV_NAMES, {
  villager: ['Rakyat (Villager)', 'Kawula (Villager)'], archer: ['Pemanah (Archer)', 'Panah (Archer)'],
  boat: ['Sampan (Fishing boat)', 'Jukung (Fishing boat)'], light: ['Penjajap (War boat)', 'Jukung Perang (Troop boat)'],
  galley: ['Lancaran (Galley)', 'Kelulus (Troop galley)'], palace: ['Bukit Larangan (Palace)', 'Kraton (Palace)'],
  granary: ['Jelapang (Granary)', 'Lumbung (Supply hut)'], port: ['Pelabuhan (Harbour)', 'Dermaga (Jetty)'],
  tower: ['Menara Kawal (Watchtower)', 'Bale Kulkul (Watchtower)'], house: ['Rumah (House)', 'Omah (House)'],
  barracks: ['Balai Hulubalang (Barracks)', 'Asrama Prajurit (Barracks)'], wall: ['Kota Tanah (Earth wall)', 'Pagar (Palisade)'],
  gate: ['Pintu Kota (City gate)', 'Lawang (Gate)'], bendahari: ['Rumah Bendahari (Treasurer\'s house)', null]
});

/* ---------- buildings ---------- */
Object.assign(BD, {
  wall: { name: 'Palisade', size: 1, hp: 300, cost: { wood: 10 }, time: 5, sight: 3, arm: { ma: 3, pa: 8 } },
  gate: { name: 'Gate', size: 1, hp: 2000, cost: null, time: 0, sight: 4, arm: { ma: 3, pa: 10 } },
  cwall: { name: 'Earth wall', size: 1, hp: 1400, cost: null, time: 0, sight: 3, arm: { ma: 6, pa: 12 } },
  bendahari: { name: 'Treasurer\'s house', size: 2, hp: 600, cost: null, time: 0, sight: 4, keep: true }
});
Object.assign(BD.granary, { drop: ['food', 'wood', 'gold'], cost: { wood: 60 }, time: 16 });
Object.assign(BD.house, { cost: { wood: 30 }, pop: 5 });
Object.assign(BD.port, { train: ['boat', 'light'], cost: { wood: 110 }, time: 25 });
Object.assign(BD.barracks, { train: ['keris', 'tombak', 'archer'], cost: { wood: 140 } });
Object.assign(BD.patirthan, { cost: { wood: 120, gold: 30 }, time: 30 });
Object.assign(BD.palace, { keep: true, train: [] });
for (const k of ['tradepost', 'rumahtabib', 'mill', 'goldmine']) delete BD[k];
BUILD_ORDER.length = 0;
for (const k of ['house', 'granary', 'port', 'barracks', 'patirthan', 'tower', 'wall']) BUILD_ORDER.push(k);

/* ---------- map: the Strait, Singapura's shore to the north, Batam in the middle ---------- */
Game.prototype.genMap = function () { genStrait(this); };
Game.prototype.populate = function () { this.civs = [1, 0]; CIVMAP = [1, 0]; popStrait(this); };
function coastY(g, x) { return isy(18) + Math.round((fbm(x * 0.15 / MX, 1.5, g.seed + 2) - 0.5) * 3 * MY); }
function cityStreet(x, y) { return (x >= GATE_S.tx - 1 && x <= GATE_S.tx && y >= isy(7)) || y === isy(8) || y === isy(8) + 1 || (y === isy(12) && x > CITY.x0 && x < HARBOUR.inlet[0]); }
function inCity(x, y) { return x > CITY.x0 && x < CITY.x1 && y > CITY.y0 && y < CITY.y1; }
function onIsle(x, y, s) { return Math.hypot((x + 0.5 - ISLE.cx) / ISLE.rx, (y + 0.5 - ISLE.cy) / ISLE.ry) + (hash2(x, y, s + 7) - 0.5) * 0.12 < 1; }
function onIslet(x, y) { return Math.hypot((x + 0.5 - mx(51)) / MX, (y + 0.5 - sy(31)) / MY) < 2.3; }
function genStrait(g) {
  const terr = g.terrain, s = g.seed;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const cy = coastY(g, x);
    let t;
    if (y < cy) t = fbm(x * 0.13, y * 0.13, s + 3) > 0.7 ? T.DIRT : T.GRASS;
    else t = y < cy + 2 ? T.SHALLOW : T.DEEP;
    if (onIsle(x, y, s) || onIslet(x, y)) t = T.GRASS;
    terr[y * W + x] = t;
  }
  // inside the walls and along the walls: open ground
  for (let y = CITY.y0 - 1; y <= CITY.y1 + 1; y++) for (let x = CITY.x0 - 1; x <= CITY.x1 + 1; x++) if (g.inb(x, y)) terr[y * W + x] = (inCity(x, y) && !cityStreet(x, y) && hash2(x, y, s) < 0.85) ? T.GRASS : T.DIRT;
  // the harbour inlet in the city's south-east corner, open to the sea
  { const [ix0, ix1, iy0] = HARBOUR.inlet;
    for (let x = ix0; x <= ix1; x++) for (let y = iy0; y < H && terr[y * W + x] <= T.SAND; y++) terr[y * W + x] = (y > iy0 && x > ix0 && x < ix1) ? T.DEEP : T.SHALLOW; }
  // shallows ring the islands; sand where land meets water
  const snap = terr.slice();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (snap[y * W + x] !== T.DEEP) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const o = g.inb(x + dx, y + dy) ? snap[(y + dy) * W + x + dx] : T.DEEP; if (o <= T.SAND) { terr[y * W + x] = T.SHALLOW; dy = 2; break; } }
  }
  const snap2 = terr.slice();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (snap2[y * W + x] > T.SAND || (y <= CITY.y1 + 1 && x >= CITY.x0 - 1 && x <= CITY.x1 + 1)) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!g.inb(x + dx, y + dy)) continue; const o = snap2[(y + dy) * W + x + dx]; if (o === T.SHALLOW || o === T.DEEP) terr[y * W + x] = T.SAND; }
  }
}
function popStrait(g) {
  const rng = g.rng, M = g.M = newMission(g);
  g.res[0] = { food: 250, wood: 150, gold: 120 }; g.res[1] = { food: 0, wood: 0, gold: 0 }; g.res[2] = { food: 0, wood: 0, gold: 0 }; g.res[3] = { food: 0, wood: 0, gold: 0 };
  const isleMask = M.isle = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (onIsle(x, y, g.seed) && g.isLand(x, y)) isleMask[y * W + x] = 1;
  // roads that stay clear of trees: Ayutthaya's track from the north-west, the coast path, the gates
  g.reserveRoute(0, isy(6), GATE_W.tx - 1, GATE_W.ty); g.reserveRoute(ix(2), isy(14), ix(62), isy(14)); g.reserveRoute(GATE_S.tx, GATE_S.ty + 1, GATE_S.tx, isy(17) + 1);
  /* --- Singapura: earth walls with a south gate (the treasurer's) and a west gate --- */
  for (let y = CITY.y0; y <= CITY.y1; y++) for (let x = CITY.x0; x <= CITY.x1; x++) {
    if (x !== CITY.x0 && x !== CITY.x1 && y !== CITY.y0 && y !== CITY.y1) continue;
    if (!g.isLand(x, y)) continue;                                // the walls stop at the harbour
    if (x === GATE_S.tx && y === GATE_S.ty) { const b = g.addBuilding('gate', 1, x, y, true); b.gk = 's'; M.gateS = b.id; continue; }
    if (x === GATE_W.tx && y === GATE_W.ty) { const b = g.addBuilding('gate', 1, x, y, true); b.gk = 'w'; b.maxHp = b.hp = 3600; M.gateW = b.id; continue; }
    g.addBuilding('cwall', 1, x, y, true);
  }
  const B = (kind, x, y) => g.addBuilding(kind, 1, ix(x), isy(y), true);
  const pal = B('palace', 29, 3); M.palace = pal.id;
  const tre = B('bendahari', 16, 5); M.treasury = tre.id;
  B('barracks', 34, 4);
  for (const [x, y] of [[38, 4], [41, 4]]) B('granary', x, y);
  for (const x of [19, 22, 25]) { B('house', x, 3); B('house', x, 6); }
  B('house', 16, 3); B('house', 44, 4);
  for (const x of [16, 19, 22, 25, 34, 37, 40]) B('house', x, 10);
  for (const [x, y] of [[17, 13], [26, 13], [35, 13], [41, 13]]) B('tower', x, y);
  const ht = g.addBuilding('tower', 1, HARBOUR.tower[0], HARBOUR.tower[1], true); ht.outer = true;
  const port = g.addBuilding('port', 1, HARBOUR.port[0], HARBOUR.port[1], true); port.harbour = true; M.port = port.id;
  /* --- the kampung outside the walls: timber houses, rice stores and fields --- */
  M.outer = [];
  const outer = (kind, x, y) => { x = ix(x); y = isy(y); if (!g.canPlace(kind, x, y, 1)) return null; const b = g.addBuilding(kind, 1, x, y, true); b.outer = true; M.outer.push(b.id); return b; };
  for (const [x, y] of [[3, 15], [7, 15], [23, 17], [54, 14], [58, 14]]) outer('house', x, y);
  for (const [x, y] of [[10, 12], [52, 4]]) outer('granary', x, y);
  const farms = [];
  for (const [x, y] of [[4, 11], [7, 11], [4, 4], [55, 7], [58, 7], [55, 3]]) { const f = outer('farm', x, y); if (f) { f.food = 300; farms.push(f); } }
  /* --- Batam: the Orang Laut village and the shore where the fleet may build --- */
  const vil = g.addBuilding('village', 2, VILLAGE[0], VILLAGE[1], true); vil.ol = true; vil.maxHp = vil.hp = 1600; M.village = vil.id;
  /* --- trees: jungle behind the shore, mangrove on the islands --- */
  const outerB = g.buildings.filter(b => b.outer || b.kind === 'farm');
  const keep = (x, y) => (x >= CITY.x0 - 2 && x <= CITY.x1 + 2 && y >= CITY.y0 - 1 && y <= CITY.y1 + 2) || (y >= isy(14) && y <= isy(17) + 1) || outerB.some(b => rectDist(x + 0.5, y + 0.5, b.rect) < 1.6);
  const nearVil = (x, y) => x >= VILLAGE[0] - 2 && x <= VILLAGE[0] + 4 && y >= VILLAGE[1] - 2 && y <= VILLAGE[1] + 4;
  for (let y = 0; y < isy(18); y++) for (let x = 0; x < W; x++) if (g.freeTile(x, y) && !g.reserve[y * W + x] && !keep(x, y) && hash2(x, y, g.seed + 61) < (y < 2 ? 0.8 : y < isy(10) ? 0.7 : 0.4)) g.addNode('tree', x, y);
  for (let y = isy(26); y < isy(40); y++) for (let x = ix(18); x < ix(42); x++) {
    if (!isleMask[y * W + x] || !g.freeTile(x, y) || nearVil(x, y)) continue;
    const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !isleMask[(y + dy) * W + x + dx]);
    if (hash2(x, y, g.seed + 17) < (edge ? 0.42 : x < ix(26) ? 0.38 : 0.08)) g.addNode('tree', x, y);
  }
  for (let y = isy(28); y < isy(35); y++) for (let x = ix(48); x < ix(55); x++) if (onIslet(x, y) && g.freeTile(x, y) && hash2(x, y, 5) < 0.7) g.addNode('tree', x, y);
  const place = (kind, cx, cy, spread, count, ok) => {
    let n = 0;
    for (let i = 0; i < count * 20 && n < count; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * spread, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (!g.freeTile(x, y) || (ok && !ok(x, y))) continue;
      g.addNode(kind, x, y); n++;
    }
  };
  place('berry', mx(27), sy(35), 1.6, 6, (x, y) => isleMask[y * W + x]);
  place('berry', mx(33), sy(35), 1.4, 5, (x, y) => isleMask[y * W + x]);
  place('berry', mx(22), sy(34), 1.4, 5, (x, y) => isleMask[y * W + x]);
  place('gold', mx(24), sy(31), 1.2, 3, (x, y) => isleMask[y * W + x]);     // an old tin and gold cache of the sea people
  for (let i = 0, n = 0; i < 1400 && n < 22; i++) {
    const x = ix(14) + Math.floor(rng() * mx(36)), y = isy(24) + Math.floor(rng() * (sy(42) - sy(24)));
    if (g.terrain[y * W + x] === T.DEEP && !g.block[y * W + x] && !onIsle(x, y, g.seed) && Math.hypot((x - ISLE.cx) / MX, (y - ISLE.cy) * 1.6 / MY) < 15) { g.addNode('fish', x, y); n++; }
  }
  for (let i = 0, n = 0; i < 600 && n < 6; i++) { const x = ix(38) + Math.floor(rng() * mx(12)), y = isy(19) + Math.floor(rng() * (sy(23) - sy(19))); if (g.terrain[y * W + x] === T.DEEP && !g.block[y * W + x]) { g.addNode('fish', x, y); n++; } }
  /* --- people --- */
  const putAt = (kind, team, x, y) => { const p = g.openSpot(x, y, UD[kind].layer || 0); return g.addUnit(kind, team, p.x, p.y); };
  const put = (kind, team, x, y) => putAt(kind, team, mx(x), sy(y));
  for (const f of farms) for (let i = 0; i < 2; i++) { const v = putAt('villager', 1, f.x, f.y + 1.5); g.orderGather(v, f); v.kv = true; }
  for (let i = 0; i < 3; i++) { const b = put('boat', 1, 40 + i * 2.5, 20.5); const n = g.nearestNode(b.x, b.y, 'food', 1, 10, 1); if (n) g.orderGather(b, n); b.kv = true; }
  M.posts = {};
  const garrison = (name, comp, x, y, r, out) => {
    r = (r || 7) * MX; M.posts[name] = { x: mx(x), y: sy(y), r, out: !!out };
    for (const k in comp) {
      const n = Math.max(1, Math.round(comp[k] * DMUL[g.diff]));
      for (let i = 0; i < n; i++) { const u = putAt(k, 1, mx(x) + (rng() - 0.5) * 2.4 * MX, sy(y) + (rng() - 0.5) * 2 * MY); u.post = { x: u.x, y: u.y, r, out: !!out, name }; }
    }
  };
  garrison('south', { sg_sword: 4, sg_spear: 3, sg_archer: 3 }, 31.5, 13.2, 7);
  garrison('west', { sg_sword: 3, sg_spear: 4, sg_archer: 3 }, 17.5, 8.8, 7);
  garrison('palace', { sg_sword: 4, sg_spear: 3, sg_archer: 2, sg_sumpit: 2 }, 30.9, 9, 6);
  garrison('harbour', { sg_spear: 2, sg_archer: 2, sg_sumpit: 1 }, 42.5, 9, 6);
  garrison('kw', { sg_sword: 2, sg_sumpit: 2 }, 8.5, 13.6, 6, true);
  garrison('ke', { sg_sword: 2, sg_spear: 1, sg_sumpit: 1 }, 55.5, 12.8, 6, true);
  for (const [x, y] of [[40, 22], [24, 23]]) { const s = put('light', 1, x, y); s.patrol = [[45, 21.5], [26, 23.5], [12, 22.5]].map(([a, b]) => [mx(a), sy(b)]); s.pi = x > 30 ? 0 : 1; }
  // the Orang Laut boats ride at their moorings
  for (const [x, y] of [[37.5, 28.5], [39, 30.5]]) { const b = put('olboat', 2, x, y); b.ol = true; b.order = { t: 'idle' }; }
  // the fleet
  M.flag = putAt('flagship', 0, FLAG_START[0], FLAG_START[1]);
  const boats = [put('light', 0, 52, 39.5), put('light', 0, 54, 37.5), put('light', 0, 58, 38.5)];
  const load = (boat, kind, n) => { boat.cargo = boat.cargo || []; for (let i = 0; i < n; i++) { const u = g.addUnit(kind, 0, boat.x, boat.y); g.loadUnit(boat, u, true); } };
  load(boats[0], 'villager', 4); load(boats[1], 'keris', 4); load(boats[2], 'tombak', 2);
  put('fireship', 0, 59, 41); put('fireship', 0, 51, 42.5);
  M.siamPts = { land: [1.5, sy(6.5)], sea: [1.5, sy(33)] };
  for (let i = 0; i < W * H; i++) g.explored[i] = 1;
  g.wallMasks();
}

/* ---------- mission state ---------- */
function newMission(g) {
  return { t: 0, phase: 1, cardQ: [], cards: {}, cd: { jukung: 0, fire: 0, kelulus: 0, msg: 0 }, ol: 'neutral', olRaid: null,
    burned: 0, plunder: { food: 0, gold: 0 }, harbourDown: false, hut: false, talk: 0, msgr: null, msgLost: 0, spotted: 0,
    siam: 0, siamWave: 0, siamNext: 300, raidNext: 180, raidN: 0, sgRaidNext: 420, sgRaids: 0, navyT: 80, levyT: 30,
    banner: 0, bannerFoes: 0, bannerAt: false, won: false, why: null, supplyT: SUPPLY.every, crippled: false, launched: 0, forced: false };
}

/* ---------- walls and gates ---------- */
const isWallKind = (k) => k === 'wall' || k === 'gate' || k === 'cwall';
Game.prototype.wallMasks = function () {
  this.wallGrid = new Int32Array(W * H);
  for (const b of this.buildings) if (b.hp > 0 && isWallKind(b.kind)) this.wallGrid[b.ty * W + b.tx] = b.id;
  const at = (x, y) => this.inb(x, y) && this.wallGrid[y * W + x] > 0;
  for (const b of this.buildings) if (b.kind === 'wall' || b.kind === 'cwall') b.mask = (at(b.tx, b.ty - 1) ? 1 : 0) | (at(b.tx + 1, b.ty) ? 2 : 0) | (at(b.tx, b.ty + 1) ? 4 : 0) | (at(b.tx - 1, b.ty) ? 8 : 0);
};
Game.prototype.setGate = function (b, open) {
  if (!b || b.kind !== 'gate' || b.hp <= 0) return false;
  b.open = open;
  this.block[b.ty * W + b.tx] = open ? 0 : 1;
  for (const u of this.units) if (u.path) u.path = null;
  this._reachIn = null;
  return true;
};
const _addBuilding = Game.prototype.addBuilding;
Game.prototype.addBuilding = function (kind, team, tx, ty, done) {
  const b = _addBuilding.call(this, kind, team, tx, ty, done);
  if (isWallKind(kind) && this.wallGrid) this.wallMasks();
  return b;
};
const _cleanup = Game.prototype.cleanup;
Game.prototype.cleanup = function () {
  const n = this.buildings.length;
  for (const u of this.units) if (u.hp <= 0 && u.cargo && u.cargo.length) this.loseCargo(u);
  _cleanup.call(this);
  if (this.buildings.length !== n) { if (this.wallGrid) this.wallMasks(); this._reachIn = null; }
};

/* ---------- where the fleet may build: on Batam, clear of the Orang Laut village ---------- */
const _canPlace = Game.prototype.canPlace;
Game.prototype.canPlace = function (kind, tx, ty, team) {
  if (!_canPlace.call(this, kind, tx, ty, team)) return false;
  if (team !== 0 || !this.M || !this.M.isle) return true;
  const d = BD[kind];
  for (let y = ty; y < ty + d.size; y++) for (let x = tx; x < tx + d.size; x++) {
    if (!this.M.isle[y * W + x]) return false;
    if (x >= VILLAGE[0] - 1 && x <= VILLAGE[0] + 3 && y >= VILLAGE[1] - 1 && y <= VILLAGE[1] + 3) return false;
  }
  return true;
};
const _placeBuilding = Game.prototype.placeBuilding;
Game.prototype.placeBuilding = function (team, kind, tx, ty, builderIds) {
  const r = _placeBuilding.call(this, team, kind, tx, ty, builderIds);
  if (!r.ok && team === 0 && this.M && r.why === 'Cannot build there.') r.why = BD[kind].shore ? 'A Dermaga needs a spot on Batam\'s shore.' : 'The fleet can only build on Batam, away from the Orang Laut village.';
  return r;
};

/* ---------- population: the flagship carries 20; people aboard boats still count ---------- */
Game.prototype.popOf = function (team) {
  let n = 0;
  for (const u of this.units) if (u.team === team && u.hp > 0) { n += UD[u.kind].pop || 1; if (u.cargo) n += u.cargo.length; }
  return n;
};
Game.prototype.popCap = function (team) {
  let c = 0; for (const b of this.buildings) if (b.team === team && b.done && b.hp > 0) c += BD[b.kind].pop || 0;
  if (team === 0 && this.M && this.M.flag && this.M.flag.hp > 0) c += FLAG_POP;
  return Math.min(team === 0 ? POP_CAP : MAXPOP, c);
};
// the Orang Laut's help: a fifth more wood at every drop
Game.prototype.dropMul = function (team, type) { return team === 0 && type === 'wood' && this.M && this.M.ol === 'ally' ? 1.2 : 1; };

/* ---------- boats: board, carry, put troops ashore ---------- */
Game.prototype.loadUnit = function (boat, u, quiet) {
  boat.cargo = boat.cargo || [];
  boat.cargo.push(u); u.boarded = true; u.path = null; u.order = { t: 'idle' };
  this.units = this.units.filter(o => o !== u); this.byId.delete(u.id);
  if (!quiet && u.team === 0) this.floaters.push({ x: boat.x, y: boat.y - 1, text: boat.cargo.length + '/' + UD[boat.kind].cap, type: 'gold', t: 1.1 });
};
Game.prototype.loseCargo = function (boat) {
  if (boat.team === 0 && boat.cargo.length) this.msg('A boat went down with ' + boat.cargo.length + ' aboard.');
  if (this.M && boat.cargo.some(c => UD[c.kind].msgr)) this.messengerLost('drowned');
  if (boat.team === 0) this.stats.lost += boat.cargo.length;
  boat.cargo = [];
};
// a water tile next to land, as close as possible to where the troops should go
Game.prototype.beachSpot = function (boat, wx, wy) {
  let best = null, bd = 1e9;
  const cx = Math.floor(wx), cy = Math.floor(wy);
  for (let r = 0; r <= 12 && !best; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = cx + dx, y = cy + dy;
      if (!this.walkable(x, y, 1)) continue;
      let land = null;
      for (const [ax, ay] of [[0, -1], [1, 0], [0, 1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (this.walkable(x + ax, y + ay, 0)) { land = { x: x + ax, y: y + ay }; break; }
      if (!land) continue;
      const d = Math.hypot(x + 0.5 - wx, y + 0.5 - wy) + Math.hypot(x + 0.5 - boat.x, y + 0.5 - boat.y) * 0.05;
      if (d < bd) { bd = d; best = { x: x + 0.5, y: y + 0.5, land }; }
    }
  }
  return best;
};
Game.prototype.unloadBoat = function (boat, goal) {
  if (!boat.cargo || !boat.cargo.length) return 0;
  const land = this.nearestFree(boat.x, boat.y, 0, 3);
  if (!this.walkable(land.x, land.y, 0) || Math.hypot(land.x + 0.5 - boat.x, land.y + 0.5 - boat.y) > 2.6) return 0;
  const n = boat.cargo.length;
  for (const u of boat.cargo) {
    const p = this.openSpot(land.x + 0.5, land.y + 0.5, 0);
    u.x = p.x; u.y = p.y; u.boarded = false; u.path = null; u.order = { t: 'idle', hx: p.x, hy: p.y };
    this.units.push(u); this.byId.set(u.id, u);
    if (goal && u.team === 0) {
      if (u.cls === 'vil') { const n2 = goal.gather && this.nearestNode(goal.x, goal.y, goal.gather, 0, 6, 0); if (n2) this.orderGather(u, n2); else this.orderMove(u, goal.x, goal.y); }
      else if (u.cls === 'scout') { const gt = this.byId.get(this.M && this.M.gateS); if (gt && gt.hp > 0 && !gt.open) this.orderMove(u, GATE_S.out[0], GATE_S.out[1]); else this.orderMove(u, goal.x, goal.y); }
      else this.orderAMove(u, goal.x, goal.y);
    }
  }
  boat.cargo = [];
  // a ferry from the flagship rows back to her once it is empty
  if (boat.ferry && this.M && this.M.flag && this.M.flag.hp > 0) { boat.order = { t: 'idle' }; boat.path = null; boat.home = true; }
  this.fx.push({ k: 'smoke', sub: 'dust', x: land.x + 0.5, y: land.y + 0.5, vy: -0.3, t: 0.8, max: 0.8 });
  if (boat.team === 0) { this.sfx('land', boat.x, boat.y); if (this.M) this.M.landed = (this.M.landed || 0) + n; }
  return n;
};

/* ---------- orders: board a boat, beach a boat, repair ---------- */
const _command = Game.prototype.command;
Game.prototype.command = function (ids, wx, wy, target, opts) {
  opts = opts || {};
  const us = ids.map(id => this.byId.get(id)).filter(u => u && u.isUnit && u.hp > 0 && (u.team === 0 || opts.any));
  if (!us.length) return;
  const team = us[0].team;
  // land troops tapped onto one of your boats climb aboard
  if (target && target.hp > 0 && target.isUnit && target.team === team && UD[target.kind].cap && us.some(u => u.layer === 0)) {
    const movers = [];
    for (const u of us) { if (u.layer === 0) { u.order = { t: 'board', id: target.id }; u.path = null; u.wait = 0; u.rp = 0; } else movers.push(u); }
    if (movers.length) this.groupMove(movers, target.x, target.y, opts);
    return;
  }
  // a laden boat sent at the land sails to the nearest beach and puts its people ashore
  const laden = us.filter(u => u.layer === 1 && u.cargo && u.cargo.length);
  const onLand = target ? (target.isBld || (target.isUnit && target.layer === 0) || (target.isNode && this.isLand(Math.floor(target.x), Math.floor(target.y)))) : this.isLand(Math.floor(wx), Math.floor(wy));
  if (laden.length && onLand && !(target && target.isUnit && target.team !== team && target.layer === 1)) {
    const gx = target ? target.x : wx, gy = target ? target.y : wy;
    for (const u of laden) u.order = { t: 'beach', x: gx, y: gy, gather: target && target.isNode ? target.type : null };
    const rest = us.filter(u => !laden.includes(u));
    if (rest.length) _command.call(this, rest.map(u => u.id), wx, wy, target, opts);
    return;
  }
  // villagers on a damaged building of yours repair it
  if (target && target.hp > 0 && target.isBld && target.team === team && target.done && target.hp < target.maxHp && target.kind !== 'farm' && us.some(u => u.cls === 'vil')) {
    const movers = [];
    for (const u of us) { if (u.cls === 'vil') { u.order = { t: 'repair', id: target.id }; u.path = null; u.wait = 0; } else movers.push(u); }
    if (movers.length) this.groupMove(movers, target.x, target.y, opts);
    return;
  }
  // the messenger never fights: an attack order is a walk
  const msg = us.filter(u => u.cls === 'scout');
  if (msg.length && target && target.team !== team && !target.isNode) { for (const u of msg) this.orderMove(u, target.x, target.y); const rest = us.filter(u => u.cls !== 'scout'); if (rest.length) _command.call(this, rest.map(u => u.id), wx, wy, target, opts); return; }
  _command.call(this, ids, wx, wy, target, opts);
};
const _updateUnit = Game.prototype.updateUnit;
const OWN_ORDERS = { board: 1, beach: 1, repair: 1, refuge: 1, land: 1, talk: 1 };
Game.prototype.updateUnit = function (u, dt) {
  const t = u.order.t;
  if (u.poison > 0) {
    u.poison -= dt; u.pacc = (u.pacc || 0) + dt;
    if (u.pacc >= 1) { u.pacc -= 1; u.hp -= 1; u.hit = 0.1; if (u.hp <= 0) { this.onKilled(u, null); return; } }
  }
  if (!OWN_ORDERS[t]) { _updateUnit.call(this, u, dt); return; }
  u.cd = Math.max(0, u.cd - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
  u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
  u.anim += dt; u.moving = false; u.working = false;
  if (t === 'board') this.doBoard(u, dt);
  else if (t === 'beach') this.doBeach(u, dt);
  else if (t === 'repair') this.doRepair(u, dt);
  else if (t === 'refuge') this.doRefuge(u, dt);
  else if (t === 'land') this.doLand(u, dt);
  else if (t === 'talk') this.doTalk(u, dt);
};
Game.prototype.doBoard = function (u, dt) {
  const boat = this.byId.get(u.order.id);
  if (!boat || boat.hp <= 0) { this.idleOrder(u); return; }
  boat.cargo = boat.cargo || [];
  if (boat.cargo.length >= UD[boat.kind].cap) { if (u.team === 0) this.msg('That boat is full.'); this.idleOrder(u); return; }
  if (Math.hypot(boat.x - u.x, boat.y - u.y) <= 2.4) { this.loadUnit(boat, u); return; }
  if (!u.path || u.rp <= 0) {
    u.rp = 1.2;
    const res = this.pathToRect(u, { ax: boat.x, ay: boat.y, bx: boat.x, by: boat.y }, 2.2);
    if (!this.setPath(u, res)) { u.wait = 0.5; return; }
    if (res && !res.reached && u.team === 0 && this.t - (this.lastBoardMsg || -99) > 6) { this.lastBoardMsg = this.t; this.msg('Bring the boat in to the shore so they can climb aboard.'); }
  }
  if (this.stepMove(u, dt)) u.path = null;
};
Game.prototype.doBeach = function (u, dt) {
  const o = u.order;
  if (!u.cargo || !u.cargo.length) { this.idleOrder(u); return; }
  if (!o.spot) { o.spot = this.beachSpot(u, o.x, o.y); if (!o.spot) { if (u.team === 0) this.msg('There is no beach there.'); this.idleOrder(u); return; } }
  if (Math.hypot(u.x - o.spot.x, u.y - o.spot.y) < 1.1 || (o.near && Math.hypot(u.x - o.spot.x, u.y - o.spot.y) < 2)) {
    u.path = null;
    if (!this.unloadBoat(u, { x: o.x, y: o.y, gather: o.gather })) { o.spot = null; o.tries = (o.tries || 0) + 1; if (o.tries > 3) this.idleOrder(u); return; }
    this.idleOrder(u); return;
  }
  if (!u.path) {
    if (u.wait > 0) return;
    const res = this.pathToPoint(u, o.spot.x, o.spot.y);
    if (!this.setPath(u, res)) { u.wait = 0.8; o.near = true; return; }
    if (res && !res.reached) o.near = true;
  }
  if (this.stepMove(u, dt)) { u.path = null; o.near = true; }
};
Game.prototype.doRepair = function (u, dt) {
  const b = this.byId.get(u.order.id);
  if (!b || b.hp <= 0 || b.hp >= b.maxHp) { this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, b.rect) <= 0.95) {
    u.path = null; u.working = true;
    const cx = b.x - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
    b.hp = Math.min(b.maxHp, b.hp + 14 * dt); b.torch = 0; if (b.burn) b.burn.t = 0;
    if (b.hp >= b.maxHp) this.idleOrder(u);
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
// a Singapura farmer runs for the south gate and slips inside
Game.prototype.doRefuge = function (u, dt) {
  const o = u.order;
  if (Math.hypot(u.x - o.x, u.y - o.y) < 1.6 || (o.tt = (o.tt || 0) + dt) > 40) { u.hp = 0; u.silent = true; return; }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, o.x, o.y))) { u.wait = 1; return; } }
  const s = u.spd; u.spd = s * 1.25; if (this.stepMove(u, dt)) u.path = null; u.spd = s;
};
// scripted landing boats (Singapura's counter-raids, the Siamese raid on the village): row in, unload, row away
Game.prototype.doLand = function (u, dt) {
  const o = u.order;
  o.tt = (o.tt || 0) + dt;
  const gx = o.s === 'in' ? o.x : o.sx, gy = o.s === 'in' ? o.y : o.sy;
  if (Math.hypot(u.x - gx, u.y - gy) < (o.s === 'in' ? 1.4 : 1.6) || (o.s === 'in' && o.tt > 50)) {
    u.path = null;
    if (o.s === 'in') {
      const land = this.nearestFree(u.x, u.y, 0, 4), out = [];
      for (const k of o.troops) { const p = this.openSpot(land.x + 0.5, land.y + 0.5, 0); const t = this.addUnit(k, u.team, p.x, p.y); out.push(t); if (o.raid) t.raid = o.raid; if (o.goalId) { const gb = this.byId.get(o.goalId); if (gb) this.orderAttack(t, gb); } else if (o.goal) this.orderAMove(t, o.goal.x, o.goal.y); }
      if (o.onLand) o.onLand(out);
      o.s = 'out'; o.tt = 0;
    } else { u.hp = 0; u.silent = true; }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, gx, gy))) { u.wait = 1; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};

/* ---------- the messenger ---------- */
// he walks up to the south gate dressed as a trader; the guards let him in
Game.prototype.doTalk = function (u, dt) {
  const M = this.M, tr = this.byId.get(M.treasury);
  if (!tr) { this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, tr.rect) <= 1.3) {
    u.path = null; u.working = true;
    const foes = u.disguise ? 0 : this.foesNear(u, 3.5);
    if (!foes) { M.talk = Math.min(TALK[this.diff], M.talk + dt); u.face = tr.x > u.x ? 1 : -1; }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, tr.rect, 1.1))) { u.wait = 0.6; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
Game.prototype.foesNear = function (u, r) { let n = 0; this.unitsNear(u.x, u.y, r, (o) => { if (o.hp > 0 && o.team === 1 && o.layer === 0 && o.cls !== 'vil' && Math.hypot(o.x - u.x, o.y - u.y) <= r) n++; }); return n; };
Game.prototype.messengerTick = function (dt) {
  const M = this.M, u = M.msgr;
  if (!u || u.hp <= 0) return;
  if (u.boarded) return;
  const gate = this.byId.get(M.gateS), inside = inCity(u.x, u.y);
  // at the south gate: a trader is let through
  if (!inside && gate && gate.hp > 0 && !gate.open && Math.hypot(u.x - GATE_S.out[0], u.y - GATE_S.out[1]) < 1.8 && u.disguise) {
    const p = this.openSpot(GATE_S.inn[0], GATE_S.inn[1], 0); u.x = p.x; u.y = p.y; u.path = null;
    u.order = { t: 'talk' };
    this.msg('The guards wave the trader through the south gate.');
  }
  if (inside && u.order.t !== 'talk' && u.order.t !== 'move') u.order = { t: 'talk' };
  if (inside && u.disguise) {
    u.spotT = (u.spotT || 0) + dt;
    if (u.spotT >= 4) {
      u.spotT = 0;
      if (this.rng() < SPOT[this.diff] * (u.order.t === 'talk' && u.working ? 0.6 : 1)) {
        u.disguise = false; M.spotted++;
        this.msg('The messenger has been found out! The guards are after him.');
        this.alerts.push({ x: u.x, y: u.y, t: 3 });
      }
    }
  }
  if (M.talk >= TALK[this.diff] && !M.cards.betray) { M.cards.betray = true; M.cardQ.push('treasurer'); this.msg('The treasurer has given his word. Tonight the south gate opens.'); }
};
Game.prototype.messengerLost = function (how) {
  const M = this.M; if (!M || M.msgLostAt === this.t) return;
  M.msgLostAt = this.t; M.msgr = null; M.msgLost++; M.cd.msg = 60;
  if (M.talk < TALK[this.diff]) this.msg(how === 'drowned' ? 'The messenger\'s boat has gone down. Another can sail in 60 s.' : 'The messenger is dead. Another can be sent in 60 s. The treasurer remembers what was said.');
};

/* ---------- the flagship: launches, healing, stores ---------- */
Game.prototype.canLaunch = function (key) {
  const M = this.M, L = LAUNCH[key], f = M && M.flag;
  if (!f || f.hp <= 0) return 'The Jong Raya is lost.';
  if (M.crippled) return 'The Jong Raya is badly holed. No launches until it is mended above 60%.';
  if (key === 'kelulus' && M.ol !== 'ally') return 'The Kelulus galleys need Orang Laut pilots. Win them over first.';
  if (key === 'messenger') {
    if (M.phase < 2) return 'The messenger sails once the siege begins.';
    if (M.phase >= 3 || M.talk >= TALK[this.diff]) return 'The treasurer has already given his word.';
    if (M.msgr && M.msgr.hp > 0) return 'The messenger is already on his way.';
  }
  if (M.cd[L.grp] > 0) return 'Ready in ' + Math.ceil(M.cd[L.grp]) + ' s.';
  let n = 1; for (const k in L.cargo) n += L.cargo[k];
  if (key !== 'messenger' && this.popOf(0) + n > this.popCap(0)) return 'Not enough room in the fleet. Build an Omah (house) on Batam.';
  if (!this.canAfford(0, L.cost)) return 'Not enough resources.';
  return null;
};
Game.prototype.launch = function (key) {
  const err = this.canLaunch(key); if (err) return err;
  const M = this.M, L = LAUNCH[key], f = M.flag;
  this.pay(0, L.cost);
  M.cd[L.grp] = COOLDOWN[L.grp];
  const ang = (M.launched * 2.1) % 6.283, p = this.openSpot(f.x + Math.cos(ang) * 1.8, f.y + Math.sin(ang) * 1.4, 1);
  const boat = this.addUnit(L.boat, 0, p.x, p.y);
  boat.cargo = []; boat.ferry = true;
  for (const k in L.cargo) for (let i = 0; i < L.cargo[k]; i++) {
    const u = this.addUnit(k, 0, boat.x, boat.y);
    if (UD[k].msgr) { u.disguise = true; M.msgr = u; boat.disguise = true; }
    this.loadUnit(boat, u, true);
  }
  M.launched++;
  this.fx.push({ k: 'smoke', sub: 'dust', x: boat.x, y: boat.y, vy: -0.2, t: 0.7, max: 0.7 });
  this.sfx('launch', boat.x, boat.y);
  return { boat };
};
Game.prototype.flagTick = function (dt) {
  const M = this.M, f = M.flag;
  for (const k in M.cd) M.cd[k] = Math.max(0, M.cd[k] - dt);
  if (!f || f.hp <= 0) return;
  if (!M.crippled && f.hp < f.maxHp * 0.3) { M.crippled = true; this.msg('The Jong Raya is badly holed! Launches stop until she is mended. Pull her back.'); }
  if (M.crippled && f.hp > f.maxHp * 0.6) { M.crippled = false; this.msg('The Jong Raya is mended. Launches resume.'); }
  // empty ferries row home and are hauled aboard, freeing their crews
  for (const u of this.units) {
    if (!u.ferry || u.team !== 0 || u.hp <= 0 || (u.cargo && u.cargo.length)) continue;
    if (u.home && u.order.t === 'idle') this.orderMove(u, f.x, f.y);
    if (u.home && Math.hypot(u.x - f.x, u.y - f.y) < 3.2) { u.hp = 0; u.silent = true; }
  }
  // the fleet's own stores
  M.supplyT -= dt;
  if (M.supplyT <= 0) { M.supplyT = SUPPLY.every; if (!M.crippled) { this.res[0].food += SUPPLY.food; this.res[0].wood += SUPPLY.wood; } }
  // the shipwrights mend her when no enemy is close; ships alongside are patched too
  if ((this.tickN % 15) === 0) {
    const calm = this.t - (f.lastHit == null ? -99 : f.lastHit) > 6;
    if (calm) f.hp = Math.min(f.maxHp, f.hp + (M.crippled ? 6 : 3) * 0.5);
    for (const u of this.units) if (u !== f && u.team === 0 && u.layer === 1 && u.hp > 0 && u.hp < u.maxHp && Math.hypot(u.x - f.x, u.y - f.y) < 4.5 && this.t - (u.lastHit == null ? -99 : u.lastHit) > 4) u.hp = Math.min(u.maxHp, u.hp + 2);
  }
};

/* ---------- combat: torches burn timber, darts poison, walls are tough, the palace is to be taken ---------- */
const _damage = Game.prototype.damage;
Game.prototype.damage = function (att, tgt, w) {
  const ad = att.kind && att.isUnit !== false ? UD[att.kind] : null, M = this.M;
  // the Orang Laut remember who struck first
  if (M && tgt.ol && att.team === 0 && M.ol !== 'hostile' && M.ol !== 'ally') this.olHostile();
  if (tgt.isBld && BD[tgt.kind].keep) {
    tgt.hit = 0.15;
    if (att.team === 0 && this.t - (this.lastKeepMsg || -99) > 20) { this.lastKeepMsg = this.t; this.msg(tgt.kind === 'palace' ? 'Bukit Larangan is to be taken, not razed. Clear its guard and hold the hill.' : 'The treasurer\'s house is not to be touched.'); }
    return;
  }
  // the fleet's foot soldiers throw torches (obor) at buildings, its archers shoot fire arrows (panah api)
  const fire = tgt.isBld && ad && att.team === 0 && att.isUnit ? (ad.fire || TORCH[ad.cls] || 0) : 0;
  if (fire) {
    // earth banks barely catch; the stakes on top and the timber gates burn on
    const mul = tgt.kind === 'cwall' ? 0.45 : tgt.kind === 'gate' ? 0.7 : 1, arrow = ad.cls === 'archer';
    if (arrow) { const last = this.arrows[this.arrows.length - 1]; if (last && last.x0 === att.x && last.y0 === att.y - 0.4) last.k = 'fire'; }
    else this.arrows.push({ k: 'torch', x0: att.x, y0: att.y - 0.5, x1: tgt.x + (this.rng() - 0.5) * 0.6, y1: tgt.y - 0.2, t: 0, dur: 0.3 });
    tgt.hp -= fire * mul; tgt.hit = 0.15; tgt.lastHit = this.t; tgt.torch = this.t + 6; tgt.torchDps = Math.max(tgt.torchDps && tgt.torch > this.t ? tgt.torchDps : 0, (arrow ? 1.5 : 2.5) * mul); tgt.torchBy = att;
    if (this.rng() < 0.5) this.fx.push({ k: 'smoke', x: tgt.x + (this.rng() - 0.5) * tgt.size * 0.6, y: tgt.y - 0.2, vy: -0.8 - this.rng() * 0.6, t: 1.4, max: 1.4 });
    if (!tgt._ign || this.t - tgt._ign > 3) { tgt._ign = this.t; this.sfx('ignite', tgt.x, tgt.y); }
    if (tgt.hp <= 0) this.onKilled(tgt, att);
    return;
  }
  let plus = 0;
  if (tgt.isBld && ad && ad.bld) plus += ad.bld;
  if (tgt.isBld && tgt.kind === 'gate' && ad && ad.cls === 'eleph') { this.sfx('ram', tgt.x, tgt.y); this.fx.push({ k: 'smoke', sub: 'dust', x: tgt.x + (this.rng() - 0.5), y: tgt.y + 0.6, vy: -0.4, t: 1.0, max: 1.0 }); }
  const atk0 = att.atk; if (plus) att.atk = Math.round(atk0 + plus);
  const arm = tgt.isBld && BD[tgt.kind].arm;
  if (arm) { const keep = { ma: BARM.ma, pa: BARM.pa }; BARM.ma = arm.ma; BARM.pa = arm.pa; _damage.call(this, att, tgt, w); BARM.ma = keep.ma; BARM.pa = keep.pa; }
  else _damage.call(this, att, tgt, w);
  att.atk = atk0;
  if (ad && ad.poison && tgt.isUnit && tgt.hp > 0 && tgt.layer === 0) tgt.poison = ad.poison;
  if (tgt.isUnit && tgt.disguise && tgt.layer === 0 && tgt.hp > 0 && att.team === 1) { tgt.disguise = false; }
};
const _onKilled = Game.prototype.onKilled;
Game.prototype.onKilled = function (t, att) {
  if (t._dead) return; t._dead = true;
  _onKilled.call(this, t, att);
  const M = this.M; if (!M) return;
  const loot = (L, x, y) => { this.res[0].food += L.food; this.res[0].gold += L.gold; M.plunder.food += L.food; M.plunder.gold += L.gold; if (L.food + L.gold >= 10) this.floaters.push({ x, y: y - 1, text: (L.food ? '+' + L.food + ' food ' : '') + (L.gold ? '+' + L.gold + ' gold' : ''), type: 'gold', t: 1.5 }); };
  const byUs = att && att.team === 0;
  if (t.isUnit && UD[t.kind].msgr) this.messengerLost('killed');
  if (t.isUnit && t.kind === 'flagship' && t.team === 0) { M.why = 'flagship'; }
  if (t.team === 1 && byUs) {
    if (t.isBld && t.harbour) { M.harbourDown = true; loot(PLUNDER.port, t.x, t.y); this.msg('Singapura\'s harbour burns! Its war boats have nowhere to come home to.'); this.sfx('crash', t.x, t.y); }
    else if (t.isBld && t.kind === 'farm') { M.burned++; loot(PLUNDER.farm, t.x, t.y); }
    else if (t.isBld && t.outer) { M.burned++; loot(PLUNDER.outer, t.x, t.y); }
    else if (t.isUnit && t.kind === 'boat') loot(PLUNDER.boat, t.x, t.y);
    else if (t.isUnit && t.cls !== 'vil' && t.layer === 0) loot(PLUNDER.soldier, t.x, t.y);
  }
  if (t.isBld && t.kind === 'gate' && t.team === 1) {
    this.msg(t.gk === 's' ? 'The south gate is broken!' : 'The west gate is broken!');
    this.sfx('crash', t.x, t.y);
    for (let i = 0; i < 16; i++) this.fx.push({ k: 'smoke', sub: 'dust', x: t.x + (this.rng() - 0.5) * 3, y: t.y + (this.rng() - 0.5) * 2, vy: -0.3 - this.rng() * 0.5, t: 1.6 + this.rng(), max: 2.6 });
    if (M.phase < 3) { M.forced = true; M.breach = t.gk; M.breachBy = byUs ? 'us' : att && att.team === 3 ? 'siam' : 'other'; }
    if (att && att.team === 3) { M.siamIn = true; this.msg('Ayutthaya\'s elephants have broken the ' + (t.gk === 's' ? 'south' : 'west') + ' gate. The way in is open, for them and for you!'); }
  }
  if (t.isBld && t.ol) { M.ol = 'gone'; this.msg('The Orang Laut village burns. Its people take to their boats and are gone.'); for (const u of this.units) if (u.ol && u.team !== 0) { u.hp = 0; u.silent = true; } M.cardQ.push('olburn'); }
  if (t.isBld && t.team === 0 && t.kind === 'granary' && !this.buildings.some(b => b !== t && b.team === 0 && b.kind === 'granary' && b.hp > 0)) this.msg('The Lumbung has burned! Build another on Batam.');
};
Game.prototype.olHostile = function () {
  const M = this.M; M.ol = 'hostile';
  for (const b of this.buildings) if (b.ol) { b.team = 1; }
  for (const u of this.units) if (u.ol) { u.team = 1; u.patrol = [[38, 27], [26, 24], [44, 22]].map(([a, b]) => [mx(a), sy(b)]); u.pi = 0; }
  this.msg('You struck the Orang Laut! They are sworn to Singapura, and now they fight for it.');
  this.alerts.push({ x: VILLAGE[0] + 1.5, y: VILLAGE[1] + 1.5, t: 3 });
  M.cardQ.push('olhostile');
};
Game.prototype.olJoin = function (how) {
  const M = this.M; if (M.ol !== 'neutral') return;
  M.ol = 'ally';
  for (const u of this.units) if (u.ol && u.hp > 0) { u.team = 0; u.order = { t: 'idle' }; }
  this.msg(how === 'gift' ? 'The Orang Laut accept the gifts. Their pilots will guide the Kelulus galleys.' : 'The Orang Laut saw you drive off the Siamese. They join the fleet!');
  M.cardQ.push('olally');
};
Game.prototype.giftOL = function () {
  const M = this.M;
  if (M.ol !== 'neutral') return M.ol === 'ally' ? 'The Orang Laut already sail with you.' : 'The Orang Laut will not take your gifts now.';
  if (!this.canAfford(0, GIFT)) return 'A gift fit for the Batin: 150 food and 100 wood.';
  this.pay(0, GIFT); this.olJoin('gift'); return null;
};

/* ---------- targeting: a disguised messenger is just another trader; walls are not worth shooting ---------- */
const _nearestEnemy = Game.prototype.nearestEnemy;
Game.prototype.nearestEnemy = function (u, r) {
  const t = _nearestEnemy.call(this, u, r);
  if (t && t.isBld && (BD[t.kind].keep || t.kind === 'cwall')) return null;
  return t;
};

/* ---------- the mission loop ---------- */
Game.prototype.aiTick = function () { if (this.M) missionAI(this); };
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (M.why === 'flagship' || !M.flag || M.flag.hp <= 0) { M.why = 'flagship'; this.over = 'lose'; return; }
  if (M.siam >= 100) { M.why = 'siam'; this.over = 'lose'; return; }
  if (M.won) this.over = 'win';
};
const _update = Game.prototype.update;
Game.prototype.update = function (dt) {
  _update.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};
Game.prototype.sfx = function (name, x, y) { (this.sfxQ || (this.sfxQ = [])).push({ name, x, y }); };

// the Singapura garrison holds its posts; inside the walls it only chases what has got in
const _doIdle = Game.prototype.doIdle;
Game.prototype.doIdle = function (u, dt) {
  if (u.team !== 0 && u.post) { this.guardStep(u, dt); return; }
  if (u.team !== 0 && u.patrol && u.layer === 1) {
    u.scan -= dt; if (u.scan > 0) return; u.scan = 0.5;
    const t = this.nearestEnemy(u, u.sight + 1); if (t && t.layer === 1 && !t.disguise) { this.orderAttack(u, t, { leash: { x: u.x, y: u.y, r: 10 } }); return; }
    u.pi = (u.pi + 1) % u.patrol.length; const p = u.patrol[u.pi]; this.orderMove(u, p[0], p[1]); return;
  }
  if (u.ol && u.team === 2) return;
  _doIdle.call(this, u, dt);
};
Game.prototype.guardStep = function (u, dt) {
  u.scan -= dt; if (u.scan > 0) return; u.scan = 0.4;
  const P = u.post, M = this.M, wide = M && M.phase === 3 && !P.out;
  const R = u.ranged ? u.rng + 0.5 : (wide ? 12 : P.r);
  const reach = P.out ? null : this.reachIn();
  let best = null, bd = 1e9;
  this.unitsNear(u.x, u.y, R + 1, (o) => {
    if (o.hp <= 0 || o.team === u.team || o.team === 2 || o.layer !== 0 || (o.disguise && u.team === 1)) return;
    const d = Math.hypot(o.x - u.x, o.y - u.y); if (d > R) return;
    if (!u.ranged && reach && !reach[Math.floor(o.y) * W + Math.floor(o.x)]) return;
    if (Math.hypot(o.x - P.x, o.y - P.y) > (wide ? 20 : P.r + 3) && !u.ranged) return;
    if (d < bd) { bd = d; best = o; }
  });
  if (best) { this.orderAttack(u, best, { leash: { x: P.x, y: P.y, r: u.ranged ? 1.5 : (wide ? 22 : P.r + 4) } }); return; }
  if (Math.hypot(u.x - P.x, u.y - P.y) > 1.2) this.orderMove(u, P.x, P.y);
};
// the tiles a Singapura foot soldier inside the walls can walk to
Game.prototype.reachIn = function () {
  if (this._reachIn && this._reachInT === this.tickN >> 5) return this._reachIn;
  const pal = this.byId.get(this.M && this.M.palace), seen = new Uint8Array(W * H), q = [];
  const push = (x, y) => { if (this.inb(x, y) && !seen[y * W + x] && this.walkable(x, y, 0)) { seen[y * W + x] = 1; q.push(y * W + x); } };
  if (pal) for (let y = pal.ty - 1; y <= pal.ty + pal.size; y++) for (let x = pal.tx - 1; x <= pal.tx + pal.size; x++) push(x, y);
  for (let i = 0; i < q.length && q.length < 2200; i++) { const c = q[i], x = c % W, y = (c / W) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  this._reachIn = seen; this._reachInT = this.tickN >> 5;
  return seen;
};

function missionAI(g) {
  const M = g.M;
  const gateW = g.byId.get(M.gateW), pal = g.byId.get(M.palace);
  for (const u of g.units) {
    if (u.hp <= 0) continue;
    // Singapura farmers and fishermen run for the gate when soldiers come close
    if (u.team === 1 && u.kv && u.order.t !== 'refuge') {
      let near = false;
      g.unitsNear(u.x, u.y, 6, (o) => { if (o.team === 0 && o.hp > 0 && o.cls !== 'vil' && !o.disguise && Math.hypot(o.x - u.x, o.y - u.y) < 6) near = true; });
      if ((near || u.hp < u.maxHp) && u.layer === 0) { u.order = { t: 'refuge', x: GATE_S.out[0], y: GATE_S.out[1] + 0.4 }; u.path = null; }
      continue;
    }
    // Ayutthaya's column: break the west gate, then go for the palace
    if (u.team === 3 && u.layer === 0 && !u.raid) {
      if (u.order.t === 'attack' && u.order.id && g.byId.get(u.order.id)) continue;
      if (gateW && gateW.hp > 0) {
        const foe = g.nearestEnemy(u, 4);
        if (foe && !(foe.isBld && foe.kind === 'cwall')) { g.orderAttack(u, foe); continue; }
        g.orderAttack(u, gateW);
      } else if (pal) { if (u.order.t !== 'amove' || g.t - (u._amT || 0) > 8) { g.orderAMove(u, pal.x, pal.y + 3); u._amT = g.t; } }
      continue;
    }
    // Siamese raiders on the island and at sea
    if (u.team === 3 && u.raid) {
      if (u.order.t === 'attack' && g.byId.get(u.order.id) && g.byId.get(u.order.id).hp > 0) continue;
      if (u.order.t === 'land') continue;
      const vil = g.byId.get(M.village);
      if (u.layer === 0) {
        const foe = g.nearestEnemy(u, 6);
        if (foe) g.orderAttack(u, foe);
        else if (u.raid === 'village' && vil && vil.hp > 0 && M.ol === 'neutral') g.orderAttack(u, vil);
        else { const b = nearestOf(g, u, (b) => b.team === 0 && b.isBld); if (b) g.orderAttack(u, b); }
      } else {
        const prey = nearestOf(g, u, (o) => o.isUnit && o.team === 0 && o.layer === 1 && o.hp > 0, 18) || (u.raid === 'village' && vil && vil.hp > 0 && M.ol === 'neutral' ? null : nearestOf(g, u, (o) => o.isUnit && o.team === 0 && o.layer === 1 && o.hp > 0));
        if (prey) g.orderAttack(u, prey);
        else if (vil && u.raid === 'village') g.orderMove(u, VILLAGE[0] + 4, VILLAGE[1] - 1.5);
      }
      continue;
    }
    // Singapura raiders landed on Batam go for the Lumbung and the people
    if (u.team === 1 && u.raid && u.layer === 0) {
      if (u.order.t === 'attack' && g.byId.get(u.order.id) && g.byId.get(u.order.id).hp > 0) continue;
      const foe = g.nearestEnemy(u, 6);
      if (foe) g.orderAttack(u, foe);
      else { const b = nearestOf(g, u, (b) => b.team === 0 && b.isBld); if (b) g.orderAttack(u, b); }
    }
  }
}
function nearestOf(g, u, ok, maxD) {
  let best = null, bd = maxD || 1e9;
  for (const o of g.units) if (ok(o)) { const d = Math.hypot(o.x - u.x, o.y - u.y); if (d < bd) { bd = d; best = o; } }
  for (const b of g.buildings) if (b.hp > 0 && ok(b)) { const d = rectDist(u.x, u.y, b.rect); if (d < bd) { bd = d; best = b; } }
  return best;
}

/* ---------- the script ---------- */
function siamColumn(g) {
  const M = g.M, i = M.siamWave, n = Math.round((5 + i * 1.2) * DMUL[g.diff]), kinds = [];
  for (let k = 0; k < n; k++) { const r = g.rng(); kinds.push(r < 0.4 ? 'ay_daab' : r < 0.7 ? 'ay_hok' : 'ay_thanu'); }
  if (i >= 1) kinds.push('ay_chang');
  if (i >= 3 && g.diff !== 'easy') kinds.push('ay_chang');
  kinds.forEach((k, j) => { const p = g.openSpot(M.siamPts.land[0] + (j % 3) * 0.9, M.siamPts.land[1] + Math.floor(j / 3) * 0.9 - 1, 0); g.addUnit(k, 3, p.x, p.y); });
  M.siamWave++;
  g.msg(i === 0 ? 'Elephants on the north-west track: Ayutthaya\'s army has come for Singapura too!' : 'More of Ayutthaya\'s army comes down the north-west track.');
  g.alerts.push({ x: 3, y: sy(6), t: 3 });
  if (i === 0) M.cardQ.push('siam');
}
function siamRaid(g) {
  const M = g.M, i = M.raidN, vil = g.byId.get(M.village);
  const toVillage = i === 0 && vil && vil.hp > 0 && M.ol === 'neutral';
  const nb = Math.max(2, Math.round((toVillage ? 2 : 2 + i * 0.7) * DMUL[g.diff]));
  const ids = new Set();
  for (let k = 0; k < nb; k++) { const p = g.openSpot(M.siamPts.sea[0] + 0.5, M.siamPts.sea[1] + (k - nb / 2) * 1.6, 1); const s = g.addUnit('ay_boat', 3, p.x, p.y); s.raid = toVillage ? 'village' : 'sea'; ids.add(s.id); }
  if (toVillage) {
    const p = g.openSpot(M.siamPts.sea[0] + 1, M.siamPts.sea[1] - 3, 1), s = g.addUnit('ay_galley', 3, p.x, p.y);
    const troops = []; for (let k = 0; k < Math.round(4 * DMUL[g.diff]); k++) troops.push(['ay_daab', 'ay_hok', 'ay_thanu', 'ay_daab'][k % 4]);
    s.order = { t: 'land', x: mx(40.5), y: sy(31.5), sx: 1.5, sy: sy(30), troops, goalId: M.village, raid: 'village', s: 'in', onLand: (out) => { for (const t of out) ids.add(t.id); } };
    ids.add(s.id);
    M.olRaid = { ids, kills: 0, start: M.t };
    g.msg('Siamese war boats are sailing for the Orang Laut village on Batam!');
  } else g.msg('Siamese war boats are hunting the fleet!');
  g.alerts.push({ x: 4, y: M.siamPts.sea[1], t: 3 });
  M.raidN++;
}
function sgRaid(g) {
  const M = g.M, port = g.byId.get(M.port);
  const hut = g.buildings.find(b => b.team === 0 && b.kind === 'granary' && b.hp > 0) || g.buildings.find(b => b.team === 0 && b.hp > 0);
  if (!hut) return;
  const n = Math.round((4 + M.sgRaids) * DMUL[g.diff]), troops = [];
  for (let k = 0; k < n; k++) troops.push(['sg_sword', 'sg_spear', 'sg_sumpit', 'sg_sword', 'sg_archer'][k % 5]);
  const sx = mx(port && port.hp > 0 ? 45 : 63), sy0 = sy(port && port.hp > 0 ? 19.5 : 24);
  const spot = g.beachSpot({ x: hut.x, y: hut.y - 6 }, hut.x, hut.y - 3) || { x: hut.x, y: hut.y - 4 };
  const p = g.openSpot(sx, sy0, 1), s = g.addUnit('galley', 1, p.x, p.y);
  s.order = { t: 'land', x: spot.x, y: spot.y, sx, sy: sy0, troops, goalId: hut.id, raid: 'isle', s: 'in' };
  M.sgRaids++;
  g.msg('A Lancaran galley puts out from Singapura, making for Batam!');
  g.alerts.push({ x: spot.x, y: spot.y, t: 3 });
}
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  g.flagTick(dt);
  g.messengerTick(dt);
  // buildings set alight keep burning for a few seconds after the torch lands
  if ((g.tickN % 30) === 0) for (const b of g.buildings) if (b.torchDps && b.torch > g.t && b.hp > 0 && b.team !== 0) { b.hp -= b.torchDps; b.lastHit = g.t; if (b.hp <= 0) g.onKilled(b, b.torchBy && b.torchBy.hp > 0 ? b.torchBy : { team: 0 }); }
  M.hut = g.buildings.some(b => b.team === 0 && b.kind === 'granary' && b.done && b.hp > 0) || M.hut;
  // the Orang Laut raid: drive the Siamese off before they burn the village
  if (M.olRaid && M.ol === 'neutral') {
    const alive = g.units.filter(u => u.hp > 0 && M.olRaid.ids.has(u.id)).length;
    const pending = g.units.some(u => u.hp > 0 && u.team === 3 && u.order.t === 'land' && u.order.raid === 'village' && u.order.s === 'in');
    if (!alive && !pending) { M.olRaid = null; const v = g.byId.get(M.village); if (v && v.hp > 0) g.olJoin('defend'); }
  }
  // Ayutthaya's race: the bar fills on its own, faster once its men are inside the walls
  let inside = false;
  for (const u of g.units) if (u.team === 3 && u.hp > 0 && u.layer === 0 && inCity(u.x, u.y)) { inside = true; break; }
  M.siamInside = inside;
  M.siam = Math.min(100, M.siam + dt * 100 / (RACE_MIN[g.diff] * 60) * (inside ? 1.6 : 1));
  if (M.siam >= 75 && !M.warn75) { M.warn75 = true; g.msg('Ayutthaya is close to taking the city. Hurry!'); }
  if (M.t >= M.siamNext) {
    M.siamNext = M.t + Math.max(80, 115 - M.siamWave * 4);
    if (g.units.filter(u => u.team === 3 && u.hp > 0 && u.layer === 0 && !u.raid).length < SIAM_CAP[g.diff]) siamColumn(g);
  }
  if (M.t >= M.raidNext) { siamRaid(g); M.raidNext = M.t + (g.diff === 'hard' ? 130 : 155); }
  if (M.t >= M.sgRaidNext && M.phase < 3) { sgRaid(g); M.sgRaidNext = M.t + (g.diff === 'easy' ? 360 : 280); }
  // Singapura musters fresh soldiers while its barracks stand, and sends war boats out while the harbour stands
  M.levyT -= dt;
  if (M.levyT <= 0) {
    M.levyT = 30 * (g.diff === 'easy' ? 1.35 : g.diff === 'hard' ? 0.8 : 1);
    const bk = g.buildings.find(b => b.team === 1 && b.kind === 'barracks' && b.hp > 0);
    const inside = g.units.filter(u => u.team === 1 && u.hp > 0 && u.layer === 0 && u.post && !u.post.out).length;
    if (bk && !M.noLevy && inside < LEVY_CAP[g.diff]) {
      const kind = ['sg_sword', 'sg_spear', 'sg_archer', 'sg_sword', 'sg_sumpit'][(M.levy = (M.levy || 0) + 1) % 5];
      const name = M.phase === 3 ? 'palace' : ['south', 'west', 'palace', 'south'][M.levy % 4], P = M.posts[name];
      const sp = g.findSpawn(bk, { x: P.x, y: P.y }, 0), u = g.addUnit(kind, 1, sp.x, sp.y);
      u.post = { x: P.x + (g.rng() - 0.5) * 2, y: P.y + (g.rng() - 0.5) * 2, r: P.r, name };
    }
  }
  M.navyT -= dt;
  if (M.navyT <= 0) {
    M.navyT = 85;
    const port = g.byId.get(M.port);
    if (port && port.hp > 0 && g.units.filter(u => u.team === 1 && u.kind === 'light' && u.hp > 0).length < (g.diff === 'hard' ? 4 : 3)) {
      const sp = g.findSpawn(port, { x: mx(45), y: sy(22) }, 1), s = g.addUnit('light', 1, sp.x, sp.y);
      s.patrol = [[45, 21.5], [26, 23.5], [12, 22.5]].map(([a, b]) => [mx(a), sy(b)]); s.pi = 0;
    }
  }
  // phase 1 -> 2: a Lumbung stands on Batam and the fleet has had time to settle, or too long has passed
  if (M.phase === 1 && ((M.hut && M.t >= 360 && (M.harbourDown || M.t >= 480)) || M.t >= 600)) { M.phase = 2; M.phaseAt = M.t; M.cardQ.push('siege'); }
  // a gate broken by force opens the way as well
  if (M.breach && M.phase < 3) startPhase3(g, 'force');
  // the banner on Bukit Larangan: your soldiers on the hill, none of Singapura's close by
  if (M.phase === 3 && !M.cards.closing) {
    const pal = g.byId.get(M.palace);
    let ours = 0, foes = 0;
    if (pal) for (const u of g.units) {
      if (u.hp <= 0 || u.layer !== 0 || u.cls === 'vil' || u.cls === 'healer' || u.cls === 'scout') continue;
      const d = rectDist(u.x, u.y, pal.rect);
      if (u.team === 0 && d <= 3.2) ours++;
      else if ((u.team === 1 || u.team === 3) && d <= 6) foes++;
    }
    M.bannerFoes = foes; M.bannerAt = ours > 0; M.bannerOurs = ours;
    if (ours && !foes) M.banner = Math.min(BANNER_T, M.banner + dt);
    else M.banner = Math.max(0, M.banner - dt * 0.5);
    if (M.banner >= BANNER_T) { M.cards.closing = true; M.cardQ.push('closing'); g.msg('The red and white banner of Majapahit flies over Bukit Larangan.'); }
  }
}
// called when the treasurer's card closes (or a gate is broken): into the city
function startPhase3(g, how) {
  const M = g.M; if (M.phase >= 3) return;
  M.phase = 3; M.phaseAt = M.t; M.how = how;
  const gate = g.byId.get(M.gateS);
  if (how === 'treasurer' && gate && gate.hp > 0) { g.setGate(gate, true); gate.betrayed = true; g.msg('The south gate swings open in the night. Into the city!'); g.sfx('betray', gate.x, gate.y); }
  if (how === 'force') M.cardQ.push('breach');
  // the treasurer let the rice stores run empty: hungry, unpaid guards slip away and no more are mustered
  if (how === 'treasurer') {
    M.noLevy = true;
    let n = 0; for (const u of g.units) if (u.team === 1 && u.hp > 0 && u.layer === 0 && u.post && !u.post.out && (n++ % 4) === 0) { u.hp = 0; u.silent = true; }
    g.msg('Hungry and unpaid, many of the guards have slipped away in the night.');
  }
  // the palace guard gathers on the hill
  const P = M.posts.palace;
  for (const u of g.units) if (u.team === 1 && u.post && (u.post.name === 'west' || u.post.name === 'south') && g.rng() < 0.5) u.post = { x: P.x + (g.rng() - 0.5) * 3, y: P.y + (g.rng() - 0.5) * 2, r: P.r, name: 'palace' };
  if (M.msgr && M.msgr.hp > 0) M.msgr.disguise = false;
  // the king's household guard musters on the hill for the last stand
  const pal = g.byId.get(M.palace), HG = { sg_sword: 4, sg_spear: 3, sg_archer: 2, sg_sumpit: 2 };
  if (pal) for (const k in HG) for (let i = 0, n = Math.max(1, Math.round(HG[k] * DMUL[g.diff])); i < n; i++) {
    const sp = g.openSpot(pal.x + (g.rng() - 0.5) * 5, pal.y + 2.2 + g.rng() * 1.5, 0), u = g.addUnit(k, 1, sp.x, sp.y);
    u.post = { x: sp.x, y: sp.y, r: 6, name: 'palace' };
  }
  g.msg('The king\'s household guard musters on Bukit Larangan.');
}

/* ---------- naval combat at the mission's date (1398): no ship cannon yet ----------
   The Jong Raya and Majapahit sloops carry cetbang swivel guns and fire arrows; Orang Laut boats
   shoot arrows and rentaka; Siamese war boats loose crossbow volleys. Majapahit builds in brick,
   Singapura in timber. */
NAVWPN.tierDefault = 1;
BURNMAT[0] = 0.5; BURNMAT[1] = 1;
Object.assign(UD.flagship, { wpn: 'arrow', swivel: true, fireA: true, kb: { fireship: 30, galley: 4 } });
Object.assign(UD.olboat, { wpn: 'arrow', fireA: true, swivel: true, kb: { fireship: 40, boat: 6 } });
Object.assign(UD.ay_boat, { wpn: 'arrow', swivel: true, rng: 4.6, kb: { fireship: 40, boat: 6 } });

/* hand-made map: keep every tree (the main game thins woods on random maps, v0.9.40) */
Game.prototype.openWoods = function () {};
