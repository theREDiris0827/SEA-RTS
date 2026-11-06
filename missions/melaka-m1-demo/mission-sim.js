
/* ===== mission-sim.js ===== */
/* ==========================================================================
   Melaka campaign, mission 1 demo: "The Treasurer's Gate" (c. 1398).
   Phase 1: hold the walls of Singapura against Majapahit landings until dawn.
   Phase 2: the treasurer opens the west gate; the Temenggung holds while
            Parameswara reaches the Orang Laut boats and sails out east.
   Phase 3: a new map up the coast; the player becomes Melaka and founds a town.
   Sim side only (no DOM): map, units, scripts and the enemy AI.
   ========================================================================== */

const DMUL = { easy: 0.65, normal: 1, hard: 1.35 };
/* both maps are laid out on a 64x48 grid and scaled to the page's W x H (96x72 since 2026-11-01: Iylia wanted more room in Singapura).
   mx/my scale a design coordinate, ix/iy round it to a tile. */
const MX = W / 64, MY = H / 48, mx = v => v * MX, my = v => v * MY, ix = v => Math.round(v * MX), iy = v => Math.round(v * MY);
/* Singapura's own y: the land (design rows 0-18) gets more of the extra height than the sea, so the city has room (design row 18 -> 33). */
const SG_LAND = Math.round(H * 0.46), sy = v => v <= 18 ? v * SG_LAND / 18 : SG_LAND + (v - 18) * (H - SG_LAND) / 30, isy = v => Math.round(sy(v));
const MS = {
  waves: [28, 88, 148, 208, 266, 324, 380],    // phase 1 landings (mission seconds)
  twist: 420,                                   // the gate opens at the fourth watch
  dawn: 510,                                    // what the clock counts down to
  exitX: mx(3.5), exitY: sy(19),                        // boats west of this line (along the south coast) have escaped
  trickle: [18, 11],                            // phase 2 west-gate reinforcements: while the Temenggung lives / after
  boatCap: 6
};

/* ---------- campaign units and buildings ---------- */
Object.assign(UD, {
  sg_spear: { name: 'Pembawa Lembing (Spearman)', hp: 50, spd: 2.3, atk: 5, bonus: { sword: 5, elite: 4 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: { food: 40, wood: 25 }, time: 9, cls: 'spear', aux: 'spear' },
  sg_sword: { name: 'Hulubalang (Keris and shield)', hp: 60, spd: 2.4, atk: 8, bonus: { archer: 3 }, rng: 0.85, rate: 1.0, ma: 2, pa: 2, sight: 6.5, cost: { food: 50, gold: 20 }, time: 9, cls: 'sword', aux: 'sword' },
  sg_archer: { name: 'Pemanah (Archer)', hp: 30, spd: 2.2, atk: 6, bonus: { spear: 3, elite: 3 }, rng: 5.5, rate: 1.5, ma: 0, pa: 0, sight: 7.5, cost: { wood: 30, gold: 35 }, time: 10, cls: 'archer', ranged: true, aux: 'archer' },
  sg_sumpit: { name: 'Penyumpit (Blowpipe)', hp: 28, spd: 2.5, atk: 3, rng: 4.2, rate: 1.3, ma: 0, pa: 1, sight: 7, cost: { food: 30, wood: 20 }, time: 8, cls: 'archer', ranged: true, aux: 'sumpit', poison: 6 },
  parameswara: { name: 'Parameswara', hp: 240, spd: 2.5, atk: 9, rng: 0.85, rate: 1.0, ma: 2, pa: 3, sight: 7, cost: {}, time: 0, cls: 'sword', hero: 'parameswara' },
  temenggung: { name: 'The Temenggung', hp: 620, spd: 2.4, atk: 13, bonus: { sword: 4, elite: 4 }, rng: 1.5, rate: 1.0, ma: 4, pa: 4, sight: 7.5, cost: {}, time: 0, cls: 'spear', hero: 'temenggung' },
  olboat: { name: 'Perahu Orang Laut', hp: 160, spd: 4.6, atk: 5, rng: 4.2, rate: 1.6, ma: 1, pa: 3, sight: 7.5, cost: { wood: 80, gold: 20 }, time: 14, cls: 'ship', ranged: true, layer: 1, slot: 'light', cap: MS.boatCap },
  obor: { name: 'Obor (Torch bearer)', hp: 42, spd: 2.4, atk: 2, rng: 0.85, rate: 1.0, ma: 0, pa: 1, sight: 6, cost: {}, time: 0, cls: 'sword', fire: 12 },
  ayu_galley: { name: 'Ruea Rop (Galley)', hp: 200, spd: 2.4, atk: 0, rng: 0, rate: 1, ma: 2, pa: 2, sight: 6, cost: {}, time: 0, cls: 'ship', layer: 1, slot: 'galley', ayu: 'galley' },
  ayu_frigate: { name: 'Samphao Rop (Frigate)', hp: 320, spd: 2.2, atk: 0, rng: 0, rate: 1, ma: 2, pa: 3, sight: 6, cost: {}, time: 0, cls: 'ship', layer: 1, slot: 'frigate', ayu: 'frigate' }
});
Object.assign(BD, {
  bendahari: { name: 'Treasurer\'s house', size: 2, hp: 600, cost: null, time: 0, sight: 4 },
  wall: { name: 'Palisade Wall', size: 1, hp: 450, cost: { wood: 15 }, time: 6, sight: 3, arm: { ma: 5, pa: 10 } },
  gate: { name: 'Gate', size: 1, hp: 900, cost: null, time: 0, sight: 4, arm: { ma: 5, pa: 10 } }
});
Object.assign(CIV_NAMES, {
  palace: ['Bukit Larangan (Palace)', 'Kraton (Palace)'], bendahari: ['Rumah Bendahari (Treasurer\'s house)', null],
  tower: ['Menara Kawal (Watchtower)', 'Bale Kulkul (Watchtower)'],
  olboat: ['Perahu Orang Laut (Raider)', null], galley: [null, 'Kelulus (Landing galley)'], frigate: [null, 'Jong Perang (Warship)'],
  villager: ['Rakyat (Villager)', null]
});
// what the player can make depends on the phase (see setPhaseRoster)
function setPhaseRoster(phase) {
  BD.barracks.train = ['sg_spear', 'sg_sword', 'sg_archer', 'sg_sumpit'];
  BD.palace.train = ['villager']; BD.palace.pop = 12; BD.palace.drop = ['food', 'wood', 'gold'];
  BD.port.train = phase === 3 ? ['boat'] : ['olboat'];
  BD.towncentre.cost = { wood: 200 }; BD.towncentre.time = 35;
  BUILD_ORDER.length = 0;
  // the full Singapura / Melaka roster: Jelapang granary, Menara Kawal tower, Rumah Tabib for healers, palisade walls
  const town = ['house', 'farm', 'store', 'granary', 'barracks', 'rumahtabib', 'tower', 'wall'];
  for (const k of (phase === 3 ? ['towncentre'].concat(town, ['port']) : town)) BUILD_ORDER.push(k);
}
setPhaseRoster(1);

/* ---------- maps ---------- */
const _genMap = Game.prototype.genMap, _populate = Game.prototype.populate;
Game.prototype.genMap = function () {
  if (this.map === 'temasek') genTemasek(this); else if (this.map === 'bertam') genBertam(this); else _genMap.call(this);
};
Game.prototype.populate = function () {
  if (this.map === 'temasek') popTemasek(this); else if (this.map === 'bertam') popBertam(this); else _populate.call(this);
};
function seaCoast(g, sy, ex) {
  // sea to the south (y >= sy) and east (x >= ex), with a little noise on the open coasts
  const terr = g.terrain, s = g.seed;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const south = sy + Math.round((fbm(x * 0.17, 3, s) - 0.5) * 2.4), east = ex + Math.round((fbm(4, y * 0.17, s) - 0.5) * 2.4);
    const d = Math.max(y - south, x - east);
    terr[y * W + x] = d >= 3 ? T.DEEP : d >= 0 ? T.SHALLOW : (fbm(x * 0.12, y * 0.12, s + 3) > 0.72 ? T.DIRT : T.GRASS);
  }
}
function sandAndCliffs(g, ridges) {
  const terr = g.terrain, s = g.seed, snap = terr.slice();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (snap[y * W + x] > T.SAND) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!g.inb(x + dx, y + dy)) continue;
      const o = snap[(y + dy) * W + x + dx];
      if (o === T.SHALLOW || o === T.DEEP) terr[y * W + x] = T.SAND;
    }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (terr[y * W + x] > T.SAND) continue;
    const e = Math.min(x, y) + (hash2(x, y, s + 21) - 0.5) * 1.6;
    if (e < 1.4) { terr[y * W + x] = T.CLIFF; continue; }
    for (const r of ridges || []) {
      const d = Math.hypot((x + 0.5 - r[0]) / r[2], (y + 0.5 - r[1]) / r[3]) + (hash2(x, y, s + 9) - 0.5) * 0.45;
      if (d < 1) { terr[y * W + x] = T.CLIFF; break; }
    }
  }
}

/* Temasek: the same map as Majapahit's Treasurer's Gate (Iylia, 2026-10-31). Singapura's walls on the north shore,
   the harbour inlet east of them, Batam and its Orang Laut village out in the Strait, the Majapahit fleet to the south. */
/* the harbour (Iylia, 2026-10-31): an inlet cut into the city's south-east corner, open to the sea; the walls stop at the water.
   inlet [x0, x1, y0]: it runs from y0 down to the shore; the dock's deck sits on its north edge */
const TM_HB = { inlet: [ix(44), ix(48), isy(11)], port: [ix(44), isy(11) - 1], tower: [ix(50), isy(12)] };
const TM = { x0: ix(14), x1: ix(48), y0: isy(2), y1: isy(15), gate: [ix(31), isy(15)], postern: [ix(14), isy(8)], isle: { cx: mx(30), cy: sy(33), rx: mx(9.5), ry: my(4.8) }, village: [ix(33), isy(30)] };
function tmCoastY(g, x) { return isy(18) + Math.round((fbm(x * 0.15 / MX, 1.5, g.seed + 2) - 0.5) * 3 * MY); }
function tmStreet(x, y) { return (x >= TM.gate[0] - 1 && x <= TM.gate[0] && y >= isy(7)) || y === isy(8) || y === isy(8) + 1 || (y === isy(12) && x > TM.x0 && x < TM_HB.inlet[0]); }
function tmInCity(x, y) { return x > TM.x0 && x < TM.x1 && y > TM.y0 && y < TM.y1; }
function tmOnIsle(x, y, s) { const I = TM.isle; return Math.hypot((x + 0.5 - I.cx) / I.rx, (y + 0.5 - I.cy) / I.ry) + (hash2(x, y, s + 7) - 0.5) * 0.12 < 1; }
function tmOnIslet(x, y) { return Math.hypot((x + 0.5 - mx(51)) / MX, (y + 0.5 - sy(31)) / MY) < 2.3; }
function genTemasek(g) {
  const terr = g.terrain, s = g.seed;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const cy = tmCoastY(g, x);
    let t;
    if (y < cy) t = fbm(x * 0.13, y * 0.13, s + 3) > 0.7 ? T.DIRT : T.GRASS;
    else t = y < cy + 2 ? T.SHALLOW : T.DEEP;
    if (tmOnIsle(x, y, s) || tmOnIslet(x, y)) t = T.GRASS;
    terr[y * W + x] = t;
  }
  // the harbour inlet east of the walls

  // inside the walls: trodden ground and grass; a dirt berm along the walls
  for (let y = TM.y0 - 1; y <= TM.y1 + 1; y++) for (let x = TM.x0 - 1; x <= TM.x1 + 1; x++) if (g.inb(x, y)) terr[y * W + x] = (tmInCity(x, y) && !tmStreet(x, y) && hash2(x, y, s) < 0.85) ? T.GRASS : T.DIRT;
  // the harbour inlet in the city's south-east corner, open to the sea
  { const [ix0, ix1, iy0] = TM_HB.inlet;
    for (let x = ix0; x <= ix1; x++) for (let y = iy0; y < H && terr[y * W + x] <= T.SAND; y++) terr[y * W + x] = (y > iy0 && x > ix0 && x < ix1) ? T.DEEP : T.SHALLOW; }
  // shallows ring the islands; sand where land meets water
  const snap = terr.slice();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (snap[y * W + x] !== T.DEEP) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const o = g.inb(x + dx, y + dy) ? snap[(y + dy) * W + x + dx] : T.DEEP; if (o <= T.SAND) { terr[y * W + x] = T.SHALLOW; dy = 2; break; } }
  }
  const snap2 = terr.slice();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (snap2[y * W + x] > T.SAND || (y <= TM.y1 + 1 && x >= TM.x0 - 1 && x <= TM.x1 + 1)) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!g.inb(x + dx, y + dy)) continue; const o = snap2[(y + dy) * W + x + dx]; if (o === T.SHALLOW || o === T.DEEP) terr[y * W + x] = T.SAND; }
  }
}
function popTemasek(g) {
  const rng = g.rng;
  const M = g.M = newMission(g, 1);
  g.explored.fill(1);
  // roads that stay clear of trees: the track from the west to the postern, the coast path, the south gate
  g.reserve = g.reserve || new Uint8Array(W * H);
  g.reserveRoute(0, isy(6), TM.postern[0] - 1, TM.postern[1]); g.reserveRoute(ix(2), isy(14), ix(62), isy(14)); g.reserveRoute(TM.gate[0], TM.gate[1] + 1, TM.gate[0], isy(18));
  /* --- the walls: the south gate, and the west postern whose key the treasurer keeps --- */
  for (let y = TM.y0; y <= TM.y1; y++) for (let x = TM.x0; x <= TM.x1; x++) {
    if (x !== TM.x0 && x !== TM.x1 && y !== TM.y0 && y !== TM.y1) continue;
    if (!g.isLand(x, y)) continue;                                // the walls stop at the harbour
    if (x === TM.gate[0] && y === TM.gate[1]) { const b = g.addBuilding('gate', 0, x, y, true); b.main = true; continue; }
    if (x === TM.postern[0] && y === TM.postern[1]) { const b = g.addBuilding('gate', 0, x, y, true); b.postern = true; b.locked = true; continue; }
    const b = g.addBuilding('wall', 0, x, y, true);
    // Ayutthaya's earlier attack: a stretch of the south wall is still half-burnt
    if (y === TM.y1 && x >= ix(18) && x <= ix(23)) { b.hp = Math.round(b.maxHp * 0.55); b.scorch = true; }
  }
  /* --- the city --- */
  // laid out in rows along the streets: the palace at the head of the royal road, houses facing the cross street
  const B = (kind, x, y) => g.addBuilding(kind, 0, ix(x), isy(y), true);
  B('palace', 29, 3);
  M.treasury = B('bendahari', 16, 5).id;      // the treasurer lives by the postern
  B('barracks', 34, 4);
  for (const [x, y] of [[38, 4], [41, 4]]) B('granary', x, y);
  for (const x of [19, 22, 25]) { B('house', x, 3); B('house', x, 6); }
  B('house', 16, 2 + 1);
  for (const x of [16, 19, 22, 25, 34, 37, 40]) B('house', x, 10);
  for (const x of [44]) B('house', x, 4);
  for (const [x, y] of [[17, 13], [26, 13], [35, 13], [41, 13]]) B('tower', x, y);
  const ht = g.addBuilding('tower', 0, TM_HB.tower[0], TM_HB.tower[1], true); ht.outer = true;
  g.addBuilding('port', 0, TM_HB.port[0], TM_HB.port[1], true);
  /* --- the kampung outside the walls: timber houses, a rice store by each group of fields --- */
  const outer = (kind, x, y) => { x = ix(x); y = isy(y); if (!g.canPlace(kind, x, y, 0)) return null; const b = g.addBuilding(kind, 0, x, y, true); b.outer = true; return b; };
  for (const [x, y] of [[3, 15], [7, 15], [23, 17], [54, 14], [58, 14]]) outer('house', x, y);
  for (const [x, y] of [[10, 12], [52, 4]]) outer('granary', x, y);
  const farms = [];
  for (const [x, y] of [[4, 11], [7, 11], [4, 4], [55, 7], [58, 7], [55, 3]]) { const f = outer('farm', x, y); if (f) { f.food = 260; farms.push(f); } }
  /* --- Batam: the Orang Laut village, Singapura's friends --- */
  g.addBuilding('village', 2, TM.village[0], TM.village[1], true);
  /* --- trees: jungle behind the shore, mangrove on the islands --- */
  const outerB = g.buildings.filter(b => b.outer || b.kind === 'farm');
  const keep = (x, y) => (x >= TM.x0 - 2 && x <= TM.x1 + 2 && y >= TM.y0 - 1 && y <= TM.y1 + 2) || (y >= isy(14) && y <= isy(17) + 1) || outerB.some(b => rectDist(x + 0.5, y + 0.5, b.rect) < 1.6);
  const nearVil = (x, y) => x >= TM.village[0] - 2 && x <= TM.village[0] + 4 && y >= TM.village[1] - 2 && y <= TM.village[1] + 4;
  for (let y = 0; y < isy(18); y++) for (let x = 0; x < W; x++) if (g.freeTile(x, y) && !g.reserve[y * W + x] && !keep(x, y) && hash2(x, y, g.seed + 61) < (y < 2 ? 0.8 : y < isy(10) ? 0.7 : 0.4)) g.addNode('tree', x, y);
  for (let y = isy(26); y < isy(40); y++) for (let x = ix(18); x < ix(42); x++) {
    if (!tmOnIsle(x, y, g.seed) || !g.isLand(x, y) || !g.freeTile(x, y) || nearVil(x, y)) continue;
    const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !tmOnIsle(x + dx, y + dy, g.seed));
    if (hash2(x, y, g.seed + 17) < (edge ? 0.42 : x < ix(26) ? 0.38 : 0.08)) g.addNode('tree', x, y);
  }
  for (let y = isy(28); y < isy(35); y++) for (let x = ix(48); x < ix(55); x++) if (tmOnIslet(x, y) && g.freeTile(x, y) && hash2(x, y, 5) < 0.7) g.addNode('tree', x, y);
  // inside the walls: a grove, berries in the palace garden, the treasury's gold
  const place = (kind, cx, cy, spread, count, ok) => {
    let n = 0;
    for (let i = 0; i < count * 16 && n < count; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * spread, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (!g.freeTile(x, y) || (ok && !ok(x, y))) continue;
      g.addNode(kind, x, y); n++;
    }
  };
  const inWalls = (x, y) => tmInCity(x, y);
  place('berry', mx(33), sy(7), 1.2, 3, inWalls);   // the palace garden
  place('berry', mx(27), sy(7), 1.2, 3, inWalls);
  place('gold', mx(37), sy(7), 1.3, 3, inWalls);    // the treasury's store
  for (let i = 0, n = 0; i < 1400 && n < 20; i++) {
    const x = ix(6) + Math.floor(rng() * mx(52)), y = isy(21) + Math.floor(rng() * (sy(45) - sy(21)));
    if (g.isWater(x, y) && !g.block[y * W + x]) { g.addNode('fish', x, y); n++; }
  }
  /* --- people of Singapura --- */
  const put = (kind, x, y) => { const p = g.openSpot(mx(x), sy(y), UD[kind].layer || 0); return g.addUnit(kind, 0, p.x, p.y); };
  M.royal = put('parameswara', 30.9, 7.8);
  M.temenggung = put('temenggung', 31, 14);
  for (let i = 0; i < 4; i++) put('sg_sword', 28.6 + i * 1.2, 13.6);
  for (let i = 0; i < 3; i++) put('sg_spear', 29.2 + i * 1.2, 12.6);
  for (let i = 0; i < 4; i++) put('sg_archer', 21 + i * 2, 14.2);
  for (let i = 0; i < 2; i++) put('sg_sumpit', 37 + i * 1.2, 14.2);
  for (const f of farms) { const p = g.openSpot(f.x, f.y + 1.5, 0), v = g.addUnit('villager', 0, p.x, p.y); g.orderGather(v, f); }
  for (let i = 0; i < 3; i++) put('villager', 27 + i, 8.5);
  put('olboat', 46, 13.5); put('olboat', 46.5, 16.5);
  g.res[0] = { food: 300, wood: 250, gold: 150 };
  // the Majapahit fleet, south of Batam
  for (const [x, y] of [[50, 40], [55, 42]]) g.addUnit('frigate', 1, mx(x), sy(y));
  g.wallMasks();
}

/* Muara Bertam: a river mouth up the coast, mangrove, a beach, the open Strait */
function genBertam(g) {
  seaCoast(g, iy(39), ix(55));
  for (let y = 0; y < iy(40); y++) {
    const cx = ix(37) + Math.round(Math.sin(y * 0.18 / MY) * 1.6 * MX);
    for (let x = cx - 1; x <= cx + 1; x++) g.terrain[y * W + x] = T.SHALLOW;
  }
  sandAndCliffs(g, [[mx(13), my(9), mx(2.6), my(2)], [mx(7), my(26), mx(2), my(2.4)]]);
}
function popBertam(g) {
  const rng = g.rng, M = g.M = newMission(g, 3), carry = g.carry || { units: [], boats: 0 };
  const keep = (x, y) => Math.hypot((x - mx(26)) / MX, (y - my(29)) / MY) < 9 || (y >= iy(33) && y <= iy(38) && x >= ix(16) && x <= ix(34));
  const place = (kind, cx, cy, spread, count, ok) => {
    let n = 0;
    for (let i = 0; i < count * 16 && n < count; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * spread, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (!g.freeTile(x, y) || keep(x, y) || (ok && !ok(x, y))) continue;
      g.addNode(kind, x, y); n++;
    }
  };
  for (const [cx, cy, n] of [[8, 14, 26], [7, 33, 18], [18, 6, 22], [28, 8, 18], [16, 20, 12], [45, 10, 30], [47, 24, 30], [44, 34, 16], [33, 20, 10]]) place('tree', mx(cx), my(cy), 3.4 * MX, Math.round(n * MX * MY));
  for (let i = 0; i < Math.round(80 * MX * MY); i++) { const x = 2 + Math.floor(rng() * (W - 4)), y = 2 + Math.floor(rng() * my(36)); if (g.freeTile(x, y) && !keep(x, y) && hash2(x, y, 31) < 0.4) g.addNode('tree', x, y); }
  place('berry', mx(18), my(25), 1.6, 5);
  place('gold', mx(12), my(30), 1.6, 5);
  for (const [x, y] of [[22, 15], [28, 22]]) for (let i = 0; i < 3; i++) { const p = g.nearestFree(ix(x) + i, iy(y) + (i % 2), 0, 4); const d = g.addUnit('deer', 2, p.x + 0.5, p.y + 0.5); d.order = { t: 'wander', next: 2 + rng() * 5 }; }
  for (let i = 0, n = 0; i < 1000 && n < 16; i++) { const x = ix(6) + Math.floor(rng() * mx(46)), y = iy(41) + Math.floor(rng() * my(5)); if (g.isWater(x, y) && !g.block[y * W + x]) { g.addNode('fish', x, y); n++; } }
  // the survivors come ashore
  const put = (kind, x, y, hp) => { const p = g.openSpot(mx(x), my(y), UD[kind].layer || 0); const u = g.addUnit(kind, 0, p.x, p.y); if (hp) u.hp = Math.max(1, Math.min(u.maxHp, hp)); return u; };
  let i = 0;
  for (const c of carry.units) {
    const u = put(c.kind, 22 + (i % 8) * 1.1, 35.5 - Math.floor(i / 8)); i++;
    if (c.kind === 'parameswara') M.royal = u;
  }
  if (!M.royal) M.royal = put('parameswara', 26, 35.5);
  const vil = carry.units.filter(c => c.kind === 'villager').length;
  M.locals = Math.max(0, 3 - vil);
  for (let k = 0; k < M.locals; k++) put('villager', 30 + k, 34);
  for (let k = 0; k < Math.max(1, carry.boats); k++) { put('olboat', 25 + k * 2.4, 40.5); put('sg_spear', 27 + k, 34.5); }
  M.crew = Math.max(1, carry.boats);
  g.res[0] = { food: 150 + 10 * carry.units.length, wood: 260, gold: 60 };
  for (let y = iy(18); y < H; y++) for (let x = ix(10); x < ix(44); x++) g.explored[y * W + x] = 1;
  g.wallMasks();
}

/* ---------- mission state ---------- */
function newMission(g, phase) {
  setPhaseRoster(phase);
  return { phase, t: 0, wave: 0, cardQ: [], cards: {}, saved: [], boatsOut: 0, escaped: false, why: null, tempDead: null, heldFor: 0,
    nextTrickle: 0, kills0: 0, raid: null, siam: null, won: false, done: {} };
}
// the player's prince: on land, aboard a boat, or already at sea
Game.prototype.royalState = function () {
  const M = this.M, r = M.royal;
  if (r && r.hp > 0 && !r.boarded) return 'land';
  if (M.royalOut) return 'out';
  if (this.units.some(b => b.hp > 0 && b.cargo && b.cargo.includes(r))) return 'boat';
  return 'dead';
};

/* ---------- walls and gates ---------- */
Game.prototype.wallMasks = function () {
  this.wallGrid = new Int32Array(W * H);
  for (const b of this.buildings) if (b.hp > 0 && (b.kind === 'wall' || b.kind === 'gate')) this.wallGrid[b.ty * W + b.tx] = b.id;
  const at = (x, y) => this.inb(x, y) && this.wallGrid[y * W + x] > 0;
  for (const b of this.buildings) if (b.kind === 'wall') b.mask = (at(b.tx, b.ty - 1) ? 1 : 0) | (at(b.tx + 1, b.ty) ? 2 : 0) | (at(b.tx, b.ty + 1) ? 4 : 0) | (at(b.tx - 1, b.ty) ? 8 : 0);
};
Game.prototype.setGate = function (b, open) {
  if (!b || b.kind !== 'gate' || b.hp <= 0) return false;
  if (!open && this.units.some(u => u.hp > 0 && u.layer === 0 && Math.floor(u.x) === b.tx && Math.floor(u.y) === b.ty)) { this.evictGate = b; b.closing = true; return false; }
  b.open = open; b.closing = false;
  this.block[b.ty * W + b.tx] = open ? 0 : 1;
  for (const u of this.units) if (u.path) u.path = null;
  return true;
};
const _addBuilding = Game.prototype.addBuilding;
Game.prototype.addBuilding = function (kind, team, tx, ty, done) {
  const b = _addBuilding.call(this, kind, team, tx, ty, done);
  if ((kind === 'wall' || kind === 'gate') && this.wallGrid) this.wallMasks();
  return b;
};
const _cleanup = Game.prototype.cleanup;
Game.prototype.cleanup = function () {
  const n = this.buildings.length;
  for (const u of this.units) if (u.hp <= 0 && u.cargo && u.cargo.length) this.loseCargo(u);
  _cleanup.call(this);
  if (this.buildings.length !== n && this.wallGrid) this.wallMasks();
};

/* ---------- combat additions: torches burn timber, blowpipe darts poison, walls are tough ---------- */
const _damage = Game.prototype.damage;
Game.prototype.damage = function (att, tgt, w) {
  const ad = att.kind ? UD[att.kind] : null;
  if (tgt.isBld && ad && ad.fire) {
    tgt.hp -= ad.fire; tgt.hit = 0.15; tgt.lastHit = this.t; tgt.torch = this.t + 4;
    if (tgt.team === 0 && this.t - this.lastAlert > 5) { this.lastAlert = this.t; this.alerts.push({ x: tgt.x, y: tgt.y, t: 3 }); this.msg('Torches! They are burning the ' + (tgt.kind === 'wall' || tgt.kind === 'gate' ? 'wall' : civName(tgt.kind, 0)) + '.'); }
    if (this.rng() < 0.5) this.fx.push({ k: 'smoke', x: tgt.x + (this.rng() - 0.5) * tgt.size * 0.6, y: tgt.y - 0.2, vy: -0.8 - this.rng() * 0.6, t: 1.4, max: 1.4 });
    if (tgt.hp <= 0) this.onKilled(tgt, att);
    return;
  }
  const arm = tgt.isBld && BD[tgt.kind].arm;
  if (arm) { const keep = { ma: BARM.ma, pa: BARM.pa }; BARM.ma = arm.ma; BARM.pa = arm.pa; _damage.call(this, att, tgt, w); BARM.ma = keep.ma; BARM.pa = keep.pa; }
  else _damage.call(this, att, tgt, w);
  if (ad && ad.poison && tgt.isUnit && tgt.hp > 0 && tgt.layer === 0) tgt.poison = ad.poison;
};
const _onKilled = Game.prototype.onKilled;
Game.prototype.onKilled = function (t, att) {
  _onKilled.call(this, t, att);
  const M = this.M; if (!M) return;
  if (t.kind === 'temenggung' && t.team === 0) { M.tempDead = this.t; this.msg('The Temenggung has fallen at the gate!'); }
  if (t.kind === 'parameswara') M.why = 'parameswara';
  if (t.team === 1 && M.raid && M.raid.ids && M.raid.ids.has(t.id)) M.raid.left--;
};
Game.prototype.loseCargo = function (boat) {
  const M = this.M;
  if (M && boat.cargo.includes(M.royal)) { M.why = 'parameswara'; M.royal.hp = 0; }
  if (boat.team === 0) this.msg('A boat went down with ' + boat.cargo.length + ' aboard.');
  this.stats.lost += boat.cargo.length;
  boat.cargo = [];
};

/* ---------- new orders: repair, board, land (galleys), sail away (scripted ships) ---------- */
const _command = Game.prototype.command;
Game.prototype.command = function (ids, wx, wy, target, opts) {
  opts = opts || {};
  const us = ids.map(id => this.byId.get(id)).filter(u => u && u.isUnit && u.hp > 0 && (u.team === 0 || opts.any));
  if (target && target.hp > 0 && us.length && target.team === us[0].team) {
    if (target.isUnit && UD[target.kind].cap && us.some(u => u.layer === 0)) {
      if (!this.M || !this.M.boarding) { this.msg(this.M && this.M.phase === 3 ? 'There is nowhere left to sail. Build the new town.' : 'The Orang Laut will not sail until the order is given.'); return; }
      const movers = [];
      for (const u of us) { if (u.layer === 0) { u.order = { t: 'board', id: target.id }; u.path = null; u.wait = 0; u.rp = 0; } else movers.push(u); }
      if (movers.length) this.groupMove(movers, target.x, target.y, opts);
      return;
    }
    if (target.isBld && target.done && target.hp < target.maxHp && target.kind !== 'farm' && us.some(u => u.cls === 'vil')) {
      const movers = [];
      for (const u of us) { if (u.cls === 'vil') { u.order = { t: 'repair', id: target.id }; u.path = null; u.wait = 0; } else movers.push(u); }
      if (movers.length) this.groupMove(movers, target.x, target.y, opts);
      return;
    }
  }
  _command.call(this, ids, wx, wy, target, opts);
};
const _updateUnit = Game.prototype.updateUnit;
Game.prototype.updateUnit = function (u, dt) {
  const t = u.order.t;
  if (u.poison > 0) {
    u.poison -= dt; u.pacc = (u.pacc || 0) + dt;
    if (u.pacc >= 1) { u.pacc -= 1; u.hp -= 1; u.hit = 0.1; if (u.hp <= 0) { this.onKilled(u, null); return; } }
  }
  if (t !== 'board' && t !== 'repair' && t !== 'land' && t !== 'sail') { _updateUnit.call(this, u, dt); return; }
  u.cd = Math.max(0, u.cd - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
  u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
  u.anim += dt; u.moving = false; u.working = false;
  if (t === 'board') this.doBoard(u, dt);
  else if (t === 'repair') this.doRepair(u, dt);
  else if (t === 'land') this.doLand(u, dt);
  else this.doSail(u, dt);
};
// from the twist on, the Orang Laut boats hold the harbour for the prince: they shoot what comes in range but don't give chase
const _doIdle = Game.prototype.doIdle;
Game.prototype.doIdle = function (u, dt) {
  if (u.kind === 'olboat' && u.team === 0 && this.M && this.M.phase >= 2) {
    u.scan -= dt; if (u.scan > 0) return; u.scan = 0.4;
    const t = this.nearestEnemy(u, u.rng + 0.3);
    if (t) this.orderAttack(u, t, { leash: { x: u.x, y: u.y, r: 1.2 } });
    return;
  }
  _doIdle.call(this, u, dt);
};
Game.prototype.doRepair = function (u, dt) {
  const b = this.byId.get(u.order.id);
  if (!b || b.hp <= 0 || b.hp >= b.maxHp) { this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, b.rect) <= 0.95) {
    u.path = null; u.working = true;
    const cx = b.x - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
    b.hp = Math.min(b.maxHp, b.hp + 14 * dt); b.torch = 0; if (b.burn) b.burn.t = 0;
    if (b.hp >= b.maxHp) { b.scorch = false; this.idleOrder(u); }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
Game.prototype.doBoard = function (u, dt) {
  const boat = this.byId.get(u.order.id);
  if (!boat || boat.hp <= 0) { this.idleOrder(u); return; }
  boat.cargo = boat.cargo || [];
  if (boat.cargo.length >= UD[boat.kind].cap) { if (u.team === 0) this.msg('That boat is full.'); this.idleOrder(u); return; }
  if (Math.hypot(boat.x - u.x, boat.y - u.y) <= 3.2) { this.loadUnit(boat, u); return; }
  if (!u.path || u.rp <= 0) {
    u.rp = 1.2;
    const res = this.pathToRect(u, { ax: boat.x, ay: boat.y, bx: boat.x, by: boat.y }, 2.9);
    if (!this.setPath(u, res)) { u.wait = 0.5; return; }
  }
  if (this.stepMove(u, dt)) u.path = null;
};
Game.prototype.loadUnit = function (boat, u) {
  boat.cargo.push(u); u.boarded = true; u.path = null;
  this.units = this.units.filter(o => o !== u); this.byId.delete(u.id);
  if (this.M && u === this.M.royal) { boat.royal = true; this.msg('Parameswara is aboard. Sail west to the gold line!'); }
  else if (u.team === 0) this.floaters.push({ x: boat.x, y: boat.y - 1, text: boat.cargo.length + '/' + UD[boat.kind].cap, type: 'gold', t: 1.1 });
};
// a landing galley: row in to the beach, put its troops ashore, row back out to sea and leave the map
Game.prototype.doLand = function (u, dt) {
  const o = u.order;
  o.tt = (o.tt || 0) + dt;
  const gx = o.s === 'in' ? o.x : o.sx, gy = o.s === 'in' ? o.y : o.sy;
  const near = Math.hypot(u.x - gx, u.y - gy) < (o.s === 'in' ? 1.3 : 1.5);
  if (near || (o.s === 'in' && o.tt > 45)) {
    u.path = null;
    if (o.s === 'in') { this.unload(u, o.troops, o.goal); o.s = 'out'; o.tt = 0; }
    else { u.hp = 0; u.silent = true; }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, gx, gy))) { u.wait = 1; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
Game.prototype.unload = function (boat, kinds, goal) {
  const land = this.nearestFree(boat.x, boat.y - 1.5, 0, 6), out = [];
  for (const k of kinds) {
    const p = this.openSpot(land.x + 0.5, land.y + 0.5, 0);
    const u = this.addUnit(k, 1, p.x, p.y); out.push(u);
    if (goal) this.orderAMove(u, goal.x, goal.y);
  }
  this.fx.push({ k: 'smoke', x: land.x + 0.5, y: land.y + 0.5, vy: -0.4, t: 0.8, max: 0.8 });
  return out;
};
// scripted ships that just pass through (the Siamese sails) follow a list of waypoints, then leave
Game.prototype.doSail = function (u, dt) {
  const o = u.order, p = o.pts[o.i];
  if (!p) { u.hp = 0; u.silent = true; return; }
  if (Math.hypot(u.x - p[0], u.y - p[1]) < 1.4) { o.i++; u.path = null; return; }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, p[0], p[1]))) { u.wait = 1; o.i++; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
/* the Siamese sails are seen from the shore even out at sea */
const _updateFog = Game.prototype.updateFog;
Game.prototype.updateFog = function () {
  _updateFog.call(this);
  for (const u of this.units) {
    if (u.hp <= 0 || !UD[u.kind].ayu) continue;
    for (let ty = Math.max(0, Math.floor(u.y - 4)); ty <= Math.min(H - 1, Math.ceil(u.y + 4)); ty++)
      for (let tx = Math.max(0, Math.floor(u.x - 4)); tx <= Math.min(W - 1, Math.ceil(u.x + 4)); tx++)
        if (Math.hypot(tx + 0.5 - u.x, ty + 0.5 - u.y) <= 4) { this.visible[ty * W + tx] = 1; this.explored[ty * W + tx] = 1; }
  }
};

/* an enemy that can't reach what it wants marks itself so the AI can send it at the wall instead */
const _ptr = Game.prototype.pathToRect, _ptp = Game.prototype.pathToPoint;
Game.prototype.pathToRect = function (u, rect, reach) { const r = _ptr.call(this, u, rect, reach); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };
Game.prototype.pathToPoint = function (u, gx, gy) { const r = _ptp.call(this, u, gx, gy); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };

/* ---------- the enemy AI: scripted waves instead of an economy ---------- */
Game.prototype.aiTick = function () { if (this.M) missionAI(this); };
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (M.why === 'parameswara' || this.royalState() === 'dead') { M.why = 'parameswara'; this.over = 'lose'; return; }
  if (M.phase === 1 && !this.buildings.some(b => b.team === 0 && b.kind === 'palace' && b.hp > 0)) { M.why = 'palace'; this.over = 'lose'; return; }
  if (M.phase === 2 && M.escaped) { this.over = 'next'; return; }
  if (M.phase === 3 && M.won) this.over = 'win';
};
const _update = Game.prototype.update;
Game.prototype.update = function (dt) {
  _update.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};

function missionGoal(g) {
  const M = g.M;
  if (M.phase === 1) return g.buildings.find(b => b.team === 0 && b.kind === 'palace' && b.hp > 0) || null;
  if (M.phase === 2) {
    if (M.royal && M.royal.hp > 0 && !M.royal.boarded) return M.royal;
    return g.buildings.find(b => b.team === 0 && b.kind === 'port' && b.hp > 0) || g.buildings.find(b => b.team === 0 && b.hp > 0 && b.kind !== 'wall' && b.kind !== 'gate') || null;
  }
  return g.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0) || g.buildings.find(b => b.team === 0 && b.hp > 0) || (M.royal && M.royal.hp > 0 ? M.royal : null);
}
// which land tiles can walk to the goal right now (walls and closed gates block)
function reachMap(g, goal) {
  const seen = new Uint8Array(W * H), q = [];
  const push = (x, y) => { if (g.inb(x, y) && !seen[y * W + x] && g.walkable(x, y, 0)) { seen[y * W + x] = 1; q.push(y * W + x); } };
  if (goal.isBld) { for (let y = goal.ty - 1; y <= goal.ty + goal.size; y++) for (let x = goal.tx - 1; x <= goal.tx + goal.size; x++) push(x, y); }
  else push(Math.floor(goal.x), Math.floor(goal.y));
  for (let i = 0; i < q.length; i++) {
    const c = q[i], x = c % W, y = (c / W) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return seen;
}
function nearestWall(g, u) {
  const list = [];
  for (const b of g.buildings) {
    if (b.team !== 0 || b.hp <= 0 || (b.kind !== 'wall' && b.kind !== 'gate')) continue;
    list.push([Math.hypot(b.x - u.x, b.y - u.y) + (b.kind === 'gate' ? -1.5 : 0) + (b.scorch ? -1 : 0), b]);
  }
  list.sort((a, b) => a[0] - b[0]);
  const pick = list.slice(0, 3);
  return pick.length ? pick[Math.floor(g.rng() * pick.length)][1] : null;
}
function nearestBuilding(g, u, maxD) {
  let best = null, bd = maxD || 1e9;
  for (const b of g.buildings) { if (b.team !== 0 || b.hp <= 0) continue; const d = rectDist(u.x, u.y, b.rect); if (d < bd) { bd = d; best = b; } }
  return best;
}
function missionAI(g) {
  const goal = missionGoal(g);
  if (!goal) return;
  const reach = reachMap(g, goal);
  for (const u of g.units) {
    if (u.team !== 1 || u.hp <= 0) continue;
    const o = u.order;
    if (u.layer === 1) {
      // warships: hold station, the light boats chase anything that comes near
      if (o.t === 'land' || o.t === 'sail') continue;
      if (u.station && u.kind !== 'frigate' && o.t !== 'attack') {
        let prey = null, pd = u.kind === 'fireship' ? 9 : 11;
        for (const p of g.units) if (p.team === 0 && p.layer === 1 && p.hp > 0) { const d = Math.hypot(p.x - u.x, p.y - u.y); if (d < pd) { pd = d; prey = p; } }
        if (prey) { g.orderAttack(u, prey, { leash: { x: u.station.x, y: u.station.y, r: 16 } }); continue; }
      }
      if (o.t === 'idle' && u.station && Math.hypot(u.x - u.station.x, u.y - u.station.y) > 3) g.orderMove(u, u.station.x, u.station.y);
      continue;
    }
    if (o.t === 'attack' && !u._blocked) continue;
    if (o.t === 'amove' && !u._blocked && g.t - (u._amT || 0) < 5) continue;
    if (u.wait > 0 && o.t === 'attack') continue;
    u._blocked = false;
    const inside = reach[Math.floor(u.y) * W + Math.floor(u.x)];
    if (UD[u.kind].fire) {
      const b = inside ? nearestBuilding(g, u, 30 * MX) : (nearestWall(g, u) || nearestBuilding(g, u, 40 * MX));
      if (b) { g.orderAttack(u, b); continue; }
    }
    if (inside) { g.orderAMove(u, goal.x, goal.y); u._amT = g.t; continue; }
    const w = nearestWall(g, u);
    if (w) g.orderAttack(u, w); else { g.orderAMove(u, goal.x, goal.y); u._amT = g.t; }
  }
}

/* ---------- the script ---------- */
function waveKinds(g, i) {
  const n = Math.max(3, Math.round((4 + i * 2) * DMUL[g.diff])), out = [];
  for (let k = 0; k < n; k++) {
    const r = g.rng();
    out.push(i >= 4 && r < 0.12 ? 'bhaya' : i >= 1 && r < 0.3 ? 'obor' : r < 0.55 ? 'keris' : r < 0.78 ? 'tombak' : 'archer');
  }
  return out;
}
function launchWave(g, i) {
  const kinds = waveKinds(g, i), goal = { x: TM.gate[0] + 0.5, y: TM.gate[1] + 1.5 };
  const per = 6, boats = Math.ceil(kinds.length / per);
  for (let b = 0; b < boats; b++) {
    let bx = mx(10) + g.rng() * mx(44); if (bx > TM_HB.inlet[0] - 3 && bx < TM_HB.inlet[1] + 3) bx = g.rng() < 0.5 ? TM_HB.inlet[0] - 5 : TM_HB.inlet[1] + 5;   // the beach, never into the harbour
    const sx = Math.max(mx(4), Math.min(mx(60), bx + (g.rng() - 0.5) * mx(10)));
    const s = g.addUnit('galley', 1, sx, sy(46.5));
    s.order = { t: 'land', x: bx, y: tmCoastY(g, Math.round(bx)) + 1.2, sx, sy: sy(46.5), troops: kinds.slice(b * per, b * per + per), goal, s: 'in' };
  }
  g.msg(i === 0 ? 'Majapahit galleys are rowing for the beach!' : 'More galleys from the Majapahit fleet!');
  g.alerts.push({ x: mx(31), y: sy(19), t: 3 });
}
function spawnWest(g, kinds) {
  const goal = missionGoal(g);
  for (const k of kinds) {
    const p = g.openSpot(mx(2.5) + g.rng() * mx(3), sy(6) + g.rng() * sy(4), 0);
    const u = g.addUnit(k, 1, p.x, p.y);
    if (goal) { g.orderAMove(u, TM.postern[0] + 2, TM.postern[1] + 0.5); u._amT = g.t; }
  }
}
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  if (M.phase === 1) {
    while (M.wave < MS.waves.length && M.t >= MS.waves[M.wave]) { launchWave(g, M.wave); M.wave++; }
    if (M.t >= MS.twist && !M.cards.twist) { M.cards.twist = true; M.cardQ.push('twist'); }
  } else if (M.phase === 2) {
    if (M.tempDead == null && M.temenggung && M.temenggung.hp > 0) M.heldFor = M.t - M.t2;
    if (M.t >= M.nextTrickle && g.units.filter(u => u.team === 1 && u.layer === 0 && u.hp > 0).length < 46) {
      const fallen = M.tempDead != null, n = Math.round((fallen ? 6 : 4) * DMUL[g.diff]), kinds = [];
      for (let k = 0; k < n; k++) { const r = g.rng(); kinds.push(fallen && r < 0.35 ? 'bhaya' : r < 0.55 ? 'keris' : r < 0.8 ? 'tombak' : 'archer'); }
      spawnWest(g, kinds);
      M.nextTrickle = M.t + MS.trickle[fallen ? 1 : 0];
    }
    // boats past the line have escaped
    for (const u of g.units) {
      if (u.team !== 0 || u.layer !== 1 || u.hp <= 0 || u.x > MS.exitX || u.y < MS.exitY) continue;
      const cargo = u.cargo || [];
      for (const c of cargo) M.saved.push({ kind: c.kind, hp: c.hp });
      M.boatsOut++;
      if (cargo.includes(M.royal)) { M.royalOut = true; M.escaped = true; }
      u.cargo = []; u.hp = 0; u.silent = true;
      g.msg(cargo.length ? (cargo.length === 1 ? 'One more slips' : cargo.length + ' people slip') + ' away to sea.' : 'A boat slips away to sea.');
    }
  } else if (M.phase === 3) {
    const tc = g.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0);
    M.done.tc = !!(tc && tc.done);
    M.done.houses = g.buildings.filter(b => b.team === 0 && b.kind === 'house' && b.done && b.hp > 0).length;
    M.done.boat = g.units.some(u => u.team === 0 && u.kind === 'boat' && u.hp > 0) || M.done.boat;
    // the Siamese sails pass on the horizon
    if (!M.siam && M.t >= 55) {
      M.siam = { t: M.t };
      const pts = [[60, 30], [60, 14], [62, 1.5]].map(([x, y]) => [mx(x), my(y)]);
      [['ayu_frigate', 62.5, 46], ['ayu_galley', 61, 44], ['ayu_galley', 63, 42.5]].forEach(([k, x, y], i) => {
        const s = g.addUnit(k, 2, mx(x), my(y)); s.order = { t: 'sail', pts: pts.map(p => [p[0] - (i % 2) * 1.5, p[1] + i * 1.2]), i: 0 };
      });
      M.cardQ.push('siam');
    }
    if (M.siam && !M.siam.gone && M.t - M.siam.t > 14) { M.siam.gone = true; g.msg('The Siamese ships turn north and are gone. For now.'); }
    // a small band of pursuers lands once the town stands
    if (M.done.tc && !M.raid) M.raid = { at: M.t + 40, left: 0 };
    if (M.raid && !M.raid.ids && M.t >= M.raid.at) {
      const n = { easy: 3, normal: 4, hard: 6 }[g.diff], kinds = [];
      for (let k = 0; k < n; k++) kinds.push(['keris', 'tombak', 'keris', 'archer', 'tombak', 'archer', 'keris'][k % 7]);
      const s = g.addUnit('galley', 1, mx(46), my(46.5));
      s.order = { t: 'land', x: mx(31), y: my(40), sx: mx(46), sy: my(46.5), troops: kinds, goal: tc ? { x: tc.x, y: tc.y } : null, s: 'in' };
      M.raid.ids = new Set(); M.raid.galley = s; M.raid.left = n; M.raid.kinds = n;
      g.msg('Sails from the south: Majapahit has followed you!');
      g.alerts.push({ x: mx(31), y: my(40), t: 3 });
    }
    if (M.raid && M.raid.ids && !M.raid.tagged && M.raid.galley.order.s === 'out') {
      M.raid.tagged = true;
      for (const u of g.units) if (u.team === 1 && u.layer === 0 && u.hp > 0) M.raid.ids.add(u.id);
      M.raid.left = M.raid.ids.size;
    }
    if (M.raid && M.raid.ids && M.raid.galley.hp <= 0 && !M.raid.tagged) { M.raid.tagged = true; M.raid.left = 0; }
    M.done.raid = !!(M.raid && M.raid.tagged && M.raid.left <= 0);
    // the proclamation at the Town Centre: when it completes, Singapura's exiles become Melaka
    const P = M.proclaim;
    if (P && !M.done.proclaim) {
      if (!tc) { M.proclaim = null; for (const k in PROCLAIM_COST) g.res[0][k] += PROCLAIM_COST[k]; g.msg('The Town Centre has fallen. The proclamation is called off.'); }
      else if ((P.left -= dt) <= 0) {
        for (const u of g.units) if (u.team === 0 && u.hp > 0 && CONVERT[u.kind]) convertUnit(u, CONVERT[u.kind]);
        M.done.proclaim = true; M.converted = true; M.proclaimAt = M.t;
        g.msg('Parameswara proclaims Melaka. Singapura\'s exiles are now its people.');
      }
    }
    if (M.done.tc && M.done.houses >= 2 && M.done.boat && M.done.raid && M.done.proclaim && M.t - M.proclaimAt > 6 && M.siam && M.siam.gone && !M.cards.closing) { M.cards.closing = true; M.cardQ.push('closing'); }
  }
}
const PROCLAIM_COST = { food: 400, wood: 400, gold: 400 }, PROCLAIM_TIME = 25;
const CONVERT = { sg_spear: 'tombak', sg_sword: 'keris', sg_archer: 'archer', sg_sumpit: 'archer', olboat: 'light' };
Game.prototype.startProclaim = function (b) {
  const M = this.M;
  if (!M || M.phase !== 3 || M.proclaim || M.done.proclaim) return 'Already proclaimed.';
  if (!b || b.kind !== 'towncentre' || !b.done || b.team !== 0) return 'Finish the Town Centre first.';
  if (!this.canAfford(0, PROCLAIM_COST)) return 'You need 400 food, 400 wood and 400 gold.';
  for (const k in PROCLAIM_COST) this.res[0][k] -= PROCLAIM_COST[k];
  M.proclaim = { left: PROCLAIM_TIME, b };
  this.msg('The proclamation begins at the Town Centre.');
  return null;
};
// swap a unit for its Melaka counterpart in place, keeping its share of health and its orders
function convertUnit(u, k) {
  const d = UD[k], m = TEAMMOD[0], arm = d.cls === 'vil' || d.cls === 'ship' || d.cls === 'boat' ? 0 : m.arm;
  const r = u.hp / u.maxHp, hp0 = d.civHp ? d.civHp[0] : d.hp;
  Object.assign(u, { kind: k, cls: d.cls, maxHp: Math.round(hp0 * m.hp), spd: d.spd * m.spd, atk: d.atk, rate: d.rate, rng: d.rng,
    ma: Math.max(0, d.ma - arm), pa: Math.max(0, d.pa - arm), bonus: d.bonus, ranged: !!d.ranged, sight: d.sight });
  u.hp = Math.max(1, Math.round(u.maxHp * r)); u.cargo = null;
}
// called when the twist card closes: the treasurer has opened the west gate
function startPhase2(g) {
  const M = g.M;
  M.phase = 2; M.t2 = M.t; M.boarding = true; M.nextTrickle = M.t + 7;
  const post = g.buildings.find(b => b.postern && b.hp > 0);
  if (post) { post.locked = false; g.setGate(post, true); post.locked = true; post.betrayed = true; }
  const n = Math.round(9 * DMUL[g.diff]), kinds = [];
  for (let k = 0; k < n; k++) kinds.push(['keris', 'tombak', 'keris', 'bhaya', 'archer', 'tombak', 'keris', 'archer', 'obor'][k % 9]);
  spawnWest(g, kinds);
  // the Orang Laut gather in the harbour: at least three boats
  const have = g.units.filter(u => u.team === 0 && u.kind === 'olboat' && u.hp > 0).length;
  for (let k = have; k < 3; k++) { const p = g.openSpot(mx(45.5) + (k % 2) * 1.4, sy(13) + k * 1.5, 1); g.addUnit('olboat', 0, p.x, p.y); }
  // the Majapahit fleet closes the harbour mouth
  const nf = { easy: 2, normal: 3, hard: 4 }[g.diff];
  for (const [x, y] of [[14, 27], [6, 26], [22, 29], [10, 31]].slice(0, nf).map(([x, y]) => [mx(x), sy(y)])) { const s = g.addUnit('light', 1, x, y); s.station = { x, y }; }
  if (g.diff !== 'easy') { const f = g.addUnit('fireship', 1, mx(17), sy(25)); f.station = { x: mx(17), y: sy(25) }; }
  // and a last landing at the south beach, aimed at the harbour
  const port = g.buildings.find(b => b.team === 0 && b.kind === 'port');
  for (const bx of [ix(34), ix(56)]) { const s = g.addUnit('galley', 1, bx + mx(6), sy(46.5)); s.order = { t: 'land', x: bx, y: tmCoastY(g, bx) + 1.2, sx: bx + mx(6), sy: sy(46.5), troops: waveKinds(g, 3).slice(0, 5), goal: port ? { x: port.x, y: port.y } : null, s: 'in' }; }
  for (const u of g.units) if (u.team === 1 && u.kind === 'frigate') { u.station = { x: u.x, y: u.y }; }
  g.msg('The west gate is open! Majapahit is inside the walls!');
  const tre = g.byId.get(M.treasury); if (tre && tre.hp > 0) g.alerts.push({ x: tre.x, y: tre.y, t: 3 });
  g.alerts.push({ x: TM.postern[0], y: TM.postern[1], t: 3 });
}

/* ---------- naval combat at the mission's date (1398): no ship cannon yet ----------
   Orang Laut raiders shoot arrows, fire arrows and lela/rentaka swivel guns; Majapahit warships
   fire cetbang light guns (main-game frigates fall back to light shot below navTier 2).
   Singapura builds in timber, Majapahit in brick. */
NAVWPN.tierDefault = 1;
BURNMAT[0] = 1; BURNMAT[1] = 0.5;
Object.assign(UD.olboat, { wpn: 'arrow', fireA: true, swivel: true, kb: { fireship: 40, galley: 3, boat: 6 } });

/* hand-made map: keep every tree (the main game thins woods on random maps, v0.9.40) */
Game.prototype.openWoods = function () {};
