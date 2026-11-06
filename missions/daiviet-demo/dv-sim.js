/* ===== dv-sim.js ===== */
/* ==========================================================================
   Đại Việt demo: "The Lam Sơn Stand" (1426–1427), an Age of Commerce sandbox.
   The player holds a valley in the hills of Thanh Hóa with a Citadel and a Đình village,
   while ten Ming columns, each bigger than the last, come down three mountain passes.
   The tenth is Liễu Thăng's relief army at Chi Lăng: kill him and the war is won.
   Sim side only (no DOM): data, map, Đình and militia, forest ambush, waves and the Ming AI.
   ========================================================================== */

const DMUL = { easy: 0.7, normal: 1, hard: 1.35 };
const MILITIA_COST = { wood: 15, gold: 10 }, ARM_TIME = 3, DISARM_TIME = 5, DISARM_WAIT = 30;
const DINH_FARM = { rng: 5, mult: 1.25 };     // farms this close to a Đình gather 25% faster
const HERO_BACK = 60;                          // a fallen hero is carried home and returns this many seconds later
STARTS[0] = { x: 29, y: 33 }; STARTS[1] = { x: 32, y: 3 };

/* ---------- units ---------- */
Object.assign(UD, {
  villager: Object.assign({}, UD.villager, { name: 'Nông Dân (Villager)', dv: 'villager' }),
  dao: { name: 'Đao Thủ (Saber and shield)', hp: 58, spd: 2.4, atk: 8, bonus: { archer: 4 }, rng: 0.85, rate: 1.0, ma: 1, pa: 3, sight: 6.5, cost: { food: 50, gold: 20 }, time: 9, cls: 'sword', dv: 'dao', ambush: true },
  thuong: { name: 'Thương Thủ (Spearman)', hp: 52, spd: 2.3, atk: 5, bonus: { sword: 4, cav: 12, elite: 6 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: { food: 40, wood: 25 }, time: 9, cls: 'spear', dv: 'thuong', ambush: true },
  hoadong: { name: 'Hỏa Đồng (Handgunner)', hp: 38, spd: 2.2, atk: 11, bonus: { sword: 3, cav: 4 }, rng: 6, rate: 2.2, ma: 0, pa: 1, sight: 7.5, cost: { wood: 40, gold: 50 }, time: 12, cls: 'archer', ranged: true, dv: 'hoadong', pierce: 3, still: 1.35, ambush: true, gun: true },
  danbinh: { name: 'Dân Binh (Village militia)', hp: 32, spd: 2.3, atk: 7, bonus: {}, rng: 5, rate: 2.5, ma: 0, pa: 0, sight: 7, cost: {}, time: 0, cls: 'archer', ranged: true, dv: 'danbinh3', pierce: 2, ambush: true, militia: true, gun: true },
  thaythuoc: { name: 'Thầy Thuốc (Physician)', hp: 30, spd: 2.2, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 7, cost: { food: 40, gold: 40 }, time: 11, cls: 'healer', dv: 'thaythuoc', heal: { amt: 4, rate: 1, rng: 3 } },
  daibac: { name: 'Đại Bác (Cannon)', hp: 130, spd: 1.6, atk: 18, rng: 7.5, rate: 4.5, ma: 2, pa: 5, sight: 8.5, cost: { wood: 140, gold: 110 }, time: 22, cls: 'siege', ranged: true, cap: 3, splash: 1.1, bld: 50, gun: true },
  leloi: { name: 'Lê Lợi', hp: 420, spd: 2.5, atk: 14, bonus: { cav: 8, elite: 6 }, rng: 0.85, rate: 1.0, ma: 3, pa: 3, sight: 8, cost: {}, time: 0, cls: 'sword', hero: 'leloi', dv: 'leloi', aura: { r: 5, atk: 2 }, ambush: true },
  nguyentrai: { name: 'Nguyễn Trãi', hp: 160, spd: 2.4, atk: 4, rng: 0.85, rate: 1.2, ma: 1, pa: 1, sight: 8, cost: {}, time: 0, cls: 'sword', hero: 'nguyentrai', dv: 'nguyentrai', heart: { r: 4.5, below: 0.35, cd: 6 } },
  boat: Object.assign({}, UD.boat, { name: 'Thuyền Thúng (Basket boat)' }),
  // the Ming army (aux-civs.md): a big disciplined force with shields, crossbows, early guns, cavalry and cannon
  m_spear: { name: 'Qiang Bing (Spearman)', hp: 55, spd: 2.2, atk: 6, bonus: { sword: 3, elite: 3 }, rng: 1.5, rate: 1.1, ma: 2, pa: 1, sight: 6.5, cost: {}, time: 0, cls: 'spear', aux: 'spear' },
  m_shield: { name: 'Tengpai Shou (Rattan shield)', hp: 60, spd: 2.4, atk: 8, bonus: { archer: 4 }, rng: 0.85, rate: 1.0, ma: 1, pa: 5, sight: 6.5, cost: {}, time: 0, cls: 'sword', aux: 'sword' },
  m_xbow: { name: 'Nu Shou (Crossbowman)', hp: 34, spd: 2.2, atk: 8, bonus: { spear: 3 }, rng: 6, rate: 2.3, ma: 0, pa: 0, sight: 7, cost: {}, time: 0, cls: 'archer', ranged: true, aux: 'xbow' },
  m_gun: { name: 'Shenji Huochong (Handgunner)', hp: 40, spd: 2.2, atk: 11, bonus: { sword: 2 }, rng: 4.5, rate: 2.7, ma: 1, pa: 1, sight: 6.5, cost: {}, time: 0, cls: 'archer', ranged: true, aux: 'gun', pierce: 2, gun: true },
  m_cav: { name: 'Qi Bing (Lancer cavalry)', hp: 100, spd: 3.4, atk: 9, bonus: { archer: 3 }, rng: 0.95, rate: 1.2, ma: 2, pa: 2, sight: 7, cost: {}, time: 0, cls: 'cav', big: 'cav', charge: 10 },
  m_cannon: { name: 'Wankou Chong (Bowl-mouth cannon)', hp: 150, spd: 1.5, atk: 14, rng: 7, rate: 5, ma: 3, pa: 6, sight: 8, cost: {}, time: 0, cls: 'siege', ranged: true, big: 'siege', splash: 1.0, bld: 60, gun: true },
  m_hero: { name: 'Liễu Thăng (Liu Sheng)', hp: 950, spd: 3.0, atk: 16, bonus: { archer: 4 }, rng: 1.0, rate: 1.0, ma: 4, pa: 4, sight: 8, cost: {}, time: 0, cls: 'cav', big: 'hero', hero: 'liusheng', aura: { r: 5, atk: 2 }, charge: 12 }
});
UD.boat.time = 9;
TEAMMOD[1] = { hp: 1, spd: 1, cost: 1, arm: 0 };
Object.assign(ORDER_CLS, { cav: 0.5, siege: 3.8 });
Object.assign(CIV_NAMES, {
  villager: ['Nông Dân (Villager)', null], boat: ['Thuyền Thúng (Basket boat)', null],
  house: ['Nhà (House)', null], farm: ['Ruộng Lúa (Rice field)', null], store: ['Kho (Storehouse)', null],
  barracks: ['Trại Lính (Barracks)', null], port: ['Bến Thuyền (Landing)', null], tower: ['Vọng Lâu (Watchtower)', null],
  towncentre: ['Thành (Citadel)', 'Ming camp'], granary: ['Kho Lúa (Granary)', null]
});

/* ---------- buildings ---------- */
Object.assign(BD, {
  dinh: { name: 'Đình (Village hall)', size: 3, hp: 1000, pop: 25, garrison: 10, drop: ['food', 'wood', 'gold'], cost: { wood: 200, gold: 50 }, time: 35, sight: 7 },
  nhathuoc: { name: 'Nhà Thuốc (Physician\'s house)', size: 2, hp: 450, cost: { wood: 100, gold: 40 }, time: 22, train: ['thaythuoc'], sight: 5 },
  wall: { name: 'Lũy (Earth rampart)', size: 1, hp: 500, cost: { wood: 12 }, time: 5, sight: 3, arm: { ma: 5, pa: 10 } },
  gate: { name: 'Cổng (Gate)', size: 1, hp: 900, cost: { wood: 40 }, time: 10, sight: 4, arm: { ma: 5, pa: 10 } }
});
// Age of Commerce: the Citadel fires handguns, towers are brick, and the Citadel casts the cannon
Object.assign(BD.towncentre, { hp: 2400, pop: 10, atk: { dmg: 8, range: 7, rate: 1.6 }, train: ['villager', 'daibac'] });
Object.assign(BD.tower, { hp: 700, civHp: null, atk: { dmg: 8, range: 7.5, rate: 1.6 }, cost: { wood: 90, gold: 40 } });
BD.barracks.train = ['dao', 'thuong', 'hoadong'];
BD.port.train = ['boat']; BD.port.cost = { wood: 100 };
BD.granary.cost = { wood: 80 };
for (const k of ['palace', 'tradepost', 'rumahtabib', 'patirthan']) delete BD[k];
BUILD_ORDER.length = 0;
for (const k of ['farm', 'dinh', 'store', 'granary', 'barracks', 'nhathuoc', 'tower', 'wall', 'gate', 'port']) BUILD_ORDER.push(k);

/* ---------- the waves ----------
   at: seconds after the previous wave (the first counts from the start). from: w | c | e (pass).
   Each column lists its troops; the director scales the numbers by difficulty. */
const PASSES = { w: { x: 11, name: 'western pass' }, c: { x: 32, name: 'Chi Lăng pass' }, e: { x: 53, name: 'eastern pass' } };
const WAVES = [
  { at: 150, cols: [{ from: 'c', u: { m_spear: 5, m_xbow: 3 } }], note: 'A Ming patrol comes down to find the rebels.' },
  { at: 95, cols: [{ from: 'w', u: { m_shield: 5, m_spear: 3, m_xbow: 3 } }], note: 'Rattan shields: Đao Thủ and spears break them, not guns.' },
  { at: 95, cols: [{ from: 'c', u: { m_spear: 5, m_xbow: 4, m_shield: 2 } }, { from: 'e', u: { m_cav: 3 }, raid: true }], note: 'Cavalry raiders! Spears stop horses.' },
  { at: 100, cols: [{ from: 'c', u: { m_shield: 6, m_xbow: 4, m_gun: 3, m_cannon: 1 } }], note: 'The Ming bring a bowl-mouth cannon. Kill it before it reaches your walls.' },
  { at: 100, cols: [{ from: 'c', u: { m_spear: 6, m_shield: 5, m_xbow: 5, m_gun: 3, m_cav: 2, m_cannon: 2 } }], note: 'Tốt Động, late 1426: Vương Thông marches out of Đông Quan with his main army.', story: 'totdong' },
  { at: 100, cols: [{ from: 'w', u: { m_shield: 6, m_xbow: 4, m_cav: 4 } }, { from: 'e', u: { m_spear: 6, m_gun: 4 } }], note: 'Two columns at once, west and east.' },
  { at: 105, cols: [{ from: 'c', u: { m_spear: 8, m_shield: 6, m_xbow: 6, m_gun: 4, m_cannon: 2 } }, { from: 'e', u: { m_cav: 5 }, raid: true }], note: 'A heavy column, and horsemen riding for your fields.' },
  { at: 105, cols: [{ from: 'w', u: { m_shield: 6, m_xbow: 5, m_gun: 4 } }, { from: 'c', u: { m_spear: 6, m_cav: 4, m_cannon: 1 } }, { from: 'e', u: { m_shield: 6, m_xbow: 4 } }], note: 'All three passes at once.' },
  { at: 110, cols: [{ from: 'c', u: { m_shield: 8, m_spear: 8, m_xbow: 6, m_gun: 6, m_cav: 4, m_cannon: 3 } }, { from: 'w', u: { m_cav: 4 }, raid: true }], note: 'The garrisons empty their forts for one great push.' },
  { at: 100, cols: [{ from: 'c', u: { m_hero: 1, m_cav: 10, m_spear: 10, m_shield: 8, m_xbow: 8, m_gun: 6, m_cannon: 2 } }, { from: 'e', u: { m_shield: 6, m_xbow: 4, m_gun: 3 }, delay: 30 }], note: 'Chi Lăng, 1427: Liễu Thăng leads the relief army into the pass.', story: 'chilang', final: true }
];
function waveSize(i, diff) { let n = 0; for (const c of WAVES[i].cols) for (const k in c.u) n += k === 'm_hero' ? 1 : Math.max(1, Math.round(c.u[k] * DMUL[diff])); return n; }

/* ---------- maps ---------- */
Game.prototype.genMap = function () { genLamSon(this); };
Game.prototype.populate = function () { popLamSon(this); };
const LS = { tc: [29, 33], dinh: [21, 31] };
function passX(p, y) { return PASSES[p].x + Math.round(Math.sin(y * 0.55 + PASSES[p].x) * 1.2); }
function genLamSon(g) {
  const terr = g.terrain, s = g.seed;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) terr[y * W + x] = fbm(x * 0.12, y * 0.12, s + 3) > 0.72 ? T.DIRT : T.GRASS;
  // a mountain lake in the south-west
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot((x + 0.5 - 9) / 6.8, (y + 0.5 - 40.5) / 4.4) + (fbm(x * 0.3, y * 0.3, s + 11) - 0.5) * 0.3;
    if (d < 0.6) terr[y * W + x] = T.DEEP; else if (d < 1) terr[y * W + x] = T.SHALLOW;
  }
  const snap = terr.slice();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (snap[y * W + x] > T.SAND) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const o = g.inb(x + dx, y + dy) ? snap[(y + dy) * W + x + dx] : 0;
      if (o === T.SHALLOW || o === T.DEEP) terr[y * W + x] = T.SAND;
    }
  }
  const cliff = (x, y) => { if (g.inb(x, y) && terr[y * W + x] <= T.SAND) terr[y * W + x] = T.CLIFF; };
  // the mountain border
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const e = Math.min(x, W - 1 - x, y, H - 1 - y) + (hash2(x, y, s + 21) - 0.5) * 1.6;
    if (e < 1.4) cliff(x, y);
  }
  // the great ridge across the north, broken only by three passes
  for (let y = 11; y <= 18; y++) for (let x = 0; x < W; x++) {
    const top = 12 + Math.round((fbm(x * 0.2, 1, s) - 0.5) * 2.4), bot = 16 + Math.round((fbm(x * 0.2, 9, s) - 0.5) * 2.6);
    if (y < top || y > bot) continue;
    if (Object.keys(PASSES).some(p => Math.abs(x - passX(p, y)) <= 2)) continue;
    cliff(x, y);
  }
  // spurs running south from the ridge, so each pass opens into its own valley
  const blobs = [[21.5, 20, 2.6, 4.6], [42.5, 20, 2.6, 4.6], [3, 21, 2.2, 3], [61, 21, 2.2, 3], [44, 30.5, 1.8, 1.3], [14.5, 27, 1.6, 1.2], [52, 38, 1.6, 1.3], [31, 44.5, 4, 1.2]];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const r of blobs) {
    const d = Math.hypot((x + 0.5 - r[0]) / r[2], (y + 0.5 - r[1]) / r[3]) + (hash2(x, y, s + 9) - 0.5) * 0.45;
    if (d < 1) { cliff(x, y); break; }
  }
  // keep the passes themselves open all the way through
  for (const p in PASSES) for (let y = 2; y <= 24; y++) for (let dx = -1; dx <= 1; dx++) {
    const x = passX(p, y) + dx; if (g.inb(x, y) && terr[y * W + x] === T.CLIFF) terr[y * W + x] = T.GRASS;
  }
}
function popLamSon(g) {
  const rng = g.rng, M = g.M = newMission(g);
  const base = (x, y) => Math.hypot(x - 28, y - 34) < 10.5;
  const free = (x, y) => g.freeTile(x, y) && !g.reserve[y * W + x];
  const place = (kind, cx, cy, spread, count, ok) => {
    let n = 0;
    for (let i = 0; i < count * 16 && n < count; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * spread, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (!free(x, y) || (ok && !ok(x, y))) continue;
      g.addNode(kind, x, y); n++;
    }
  };
  // open roads down each pass
  for (const p in PASSES) g.reserveRoute(PASSES[p].x, 3, LS.tc[0] + 1, LS.tc[1] - 1);
  // the home valley
  const tc = g.addBuilding('towncentre', 0, LS.tc[0], LS.tc[1], true);
  const dinh = g.addBuilding('dinh', 0, LS.dinh[0], LS.dinh[1], true);
  for (const [x, y] of [[17, 30], [17, 32], [21, 28], [24, 31], [21, 34]]) g.addBuilding('farm', 0, x, y, true);
  // no houses in Dai Viet: the Đình houses the village (+25 population) (lore, civ-doctrines)
  g.addBuilding('barracks', 0, 34, 30, true);
  // groves in the mouth of each pass: sparse enough to stand in, thick enough to hide in
  const grove = (cx, cy, rx, ry, dens) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!g.inb(x, y) || Math.hypot((x - cx) / rx, (y - cy) / ry) > 1 || !g.freeTile(x, y) || base(x, y)) continue;
      if (y <= 25 && Object.keys(PASSES).some(p => Math.abs(x - passX(p, y)) <= 1)) continue;   // the road down each pass stays open
      if (hash2(x, y, g.seed + 61) < dens) g.addNode('tree', x, y);
    }
  };
  for (const p in PASSES) { const x = PASSES[p].x; grove(x - 4.2, 21, 3, 3.6, 0.5); grove(x + 4.2, 21, 3, 3.6, 0.5); grove(x - 5, 7, 3.5, 3, 0.4); grove(x + 6, 8, 3, 2.5, 0.35); }
  // wood lines and scattered jungle
  for (const [cx, cy, rx, ry, d] of [[57, 33, 4.5, 7, 0.75], [6, 29, 3.5, 4, 0.7], [44, 41, 3, 2.5, 0.6], [16, 42.5, 3, 2, 0.6], [38, 24, 3, 2, 0.45], [26, 24, 2.5, 2, 0.45],
    [12, 25, 2.5, 2, 0.5], [50, 24, 2.5, 2, 0.5], [6, 37, 2, 2, 0.5], [47, 35, 2, 2, 0.4], [20, 4, 3, 2, 0.4], [44, 4, 3, 2, 0.4]]) grove(cx, cy, rx, ry, d);
  for (let i = 0; i < 160; i++) { const x = 2 + Math.floor(rng() * (W - 4)), y = 2 + Math.floor(rng() * (H - 4)); if (free(x, y) && !base(x, y) && hash2(x, y, 31) < 0.4) g.addNode('tree', x, y); }
  // food and gold
  place('berry', 25, 41, 1.6, 6);
  place('gold', 38, 40.5, 1.6, 6); place('gold', 15, 36.5, 1.5, 5); place('gold', 47, 27, 1.6, 6); place('gold', 27, 21.5, 1.3, 4); place('gold', 58, 44, 1.4, 4);
  for (const [x, y] of [[40, 34], [12, 24]]) for (let i = 0; i < 3; i++) { const p = g.nearestFree(x + i, y + (i % 2), 0, 4); const d = g.addUnit('deer', 2, p.x + 0.5, p.y + 0.5); d.order = { t: 'wander', next: 2 + rng() * 5 }; }
  for (let i = 0, n = 0; i < 400 && n < 9; i++) { const x = 3 + Math.floor(rng() * 14), y = 36 + Math.floor(rng() * 9); if (g.isWater(x, y) && !g.block[y * W + x] && g.terrain[y * W + x] === T.DEEP) { g.addNode('fish', x, y); n++; } }
  // the people of Lam Sơn
  const put = (kind, x, y) => { const p = g.openSpot(x, y, UD[kind].layer || 0); return g.addUnit(kind, 0, p.x, p.y); };
  const farms = g.buildings.filter(b => b.kind === 'farm');
  for (let i = 0; i < 5; i++) { const v = put('villager', farms[i].x, farms[i].y + 1); g.orderGather(v, farms[i]); }
  for (let i = 0; i < 3; i++) { const v = put('villager', 36 + i, 38); const n = g.nearestNode(v.x, v.y, 'gold', 0, 12, 0); if (n) g.orderGather(v, n); }
  for (let i = 0; i < 3; i++) { const v = put('villager', 33 + i, 35); const n = g.nearestNode(52, 33, 'wood', 0, 20, 0); if (n) g.orderGather(v, n); }
  for (let i = 0; i < 2; i++) put('villager', 27 + i, 36.5);
  M.leloi = put('leloi', 31, 30.5); M.trai = put('nguyentrai', 27, 31.5);
  for (let i = 0; i < 4; i++) put('dao', 29 + i * 1.1, 29.5);
  for (let i = 0; i < 4; i++) put('thuong', 29 + i * 1.1, 28.4);
  for (let i = 0; i < 4; i++) put('hoadong', 29 + i * 1.1, 27.3);
  g.res[0] = { food: 450, wood: 450, gold: 300 };
  for (let y = 18; y < H; y++) for (let x = 0; x < W; x++) g.explored[y * W + x] = 1;
  for (const p in PASSES) for (let y = 10; y < 18; y++) for (let x = PASSES[p].x - 3; x <= PASSES[p].x + 3; x++) if (g.inb(x, y)) g.explored[y * W + x] = 1;
  g.wallMasks(); g.forestMap();
}

/* ---------- mission state ---------- */
function newMission(g) {
  return { t: 0, wave: 0, next: WAVES[0].at, active: false, cols: [], cardQ: [], cards: {}, warned: -1, broken: 0, spoils: 0, early: 0,
    heroDown: {}, heroBack: {}, generalDead: false, won: false, why: null, fled: 0, ambushes: 0, militia: 0, surrendered: 0 };
}

/* ---------- forest: walkable tiles with at least three trees around them ---------- */
Game.prototype.forestMap = function () {
  const f = this.forest || (this.forest = new Uint8Array(W * H)), tree = new Uint8Array(W * H);
  for (const n of this.nodes) if (n.hp > 0 && n.kind === 'tree') tree[n.ty * W + n.tx] = 1;
  f.fill(0);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (tree[y * W + x] || !this.isLand(x, y)) continue;
    let c = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) c += tree[(y + dy) * W + x + dx];
    if (c >= 3) f[y * W + x] = 1;
  }
};
Game.prototype.inForest = function (u) { return !!(this.forest && this.forest[Math.floor(u.y) * W + Math.floor(u.x)]); };

/* ---------- walls and gates (from the Melaka demo) ---------- */
Game.prototype.wallMasks = function () {
  this.wallGrid = new Int32Array(W * H);
  for (const b of this.buildings) if (b.hp > 0 && (b.kind === 'wall' || b.kind === 'gate')) this.wallGrid[b.ty * W + b.tx] = b.id;
  const at = (x, y) => this.inb(x, y) && this.wallGrid[y * W + x] > 0;
  for (const b of this.buildings) if (b.kind === 'wall') b.mask = (at(b.tx, b.ty - 1) ? 1 : 0) | (at(b.tx + 1, b.ty) ? 2 : 0) | (at(b.tx, b.ty + 1) ? 4 : 0) | (at(b.tx - 1, b.ty) ? 8 : 0);
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
  if ((kind === 'wall' || kind === 'gate') && this.wallGrid) this.wallMasks();
  return b;
};
const _finishBuilding = Game.prototype.finishBuilding;
Game.prototype.finishBuilding = function (b) {
  _finishBuilding.call(this, b);
  // a finished gate stands open for your own people; close it from its panel
  if (b.kind === 'gate') { b.open = true; this.block[b.ty * W + b.tx] = 0; }
};
const _cleanup = Game.prototype.cleanup;
Game.prototype.cleanup = function () {
  const n = this.buildings.length, k = this.nodes.length;
  _cleanup.call(this);
  if (this.buildings.length !== n && this.wallGrid) this.wallMasks();
  if (this.nodes.length !== k) this.forestDirty = true;
};
// gates that are shut keep everyone out; open ones are walkable for both sides (as in the Melaka demo)

/* ---------- gathering: farms near a Đình work faster ---------- */
const _gatherInfo = Game.prototype.gatherInfo;
Game.prototype.gatherInfo = function (o) {
  const gi = _gatherInfo.call(this, o);
  if (gi && o.isBld && o.kind === 'farm' && this.nearDinh(o)) gi.rate *= DINH_FARM.mult;
  return gi;
};
Game.prototype.nearDinh = function (b) {
  if (b._dinhT === this.tickN >> 6) return b._dinh;
  b._dinhT = this.tickN >> 6;
  return (b._dinh = this.buildings.some(d => d.kind === 'dinh' && d.team === b.team && d.done && d.hp > 0 && rectDist(b.x, b.y, d.rect) <= DINH_FARM.rng));
};

/* ---------- training: caps, and the heroes can't be trained ---------- */
const _queueUnit = Game.prototype.queueUnit;
Game.prototype.queueUnit = function (b, kind, team) {
  const d = UD[kind];
  if (d && d.cap && this.countOf(b.team, kind) >= d.cap) return 'You can have ' + d.cap + ' ' + civName(kind, b.team).split(' (')[0] + ' at most.';
  return _queueUnit.call(this, b, kind, team);
};

/* ---------- Dân Binh: villagers take up arms at a Đình, and may go back to the fields after 30 s ---------- */
Game.prototype.nearestDinh = function (u) {
  let best = null, bd = 1e9;
  for (const b of this.buildings) if (b.kind === 'dinh' && b.team === u.team && b.done && b.hp > 0) { const d = rectDist(u.x, u.y, b.rect); if (d < bd) { bd = d; best = b; } }
  return best;
};
Game.prototype.orderArm = function (u, dinh) {
  dinh = dinh || this.nearestDinh(u);
  if (!dinh) return 'Build a Đình first.';
  if (u.kind === 'villager') { u.order = { t: 'arm', id: dinh.id, left: ARM_TIME, s: 'go' }; u.carry = { type: null, amt: 0 }; }
  else if (u.kind === 'danbinh') {
    const wait = DISARM_WAIT - (this.t - (u.armedAt || -99));
    if (wait > 0) return 'Militia can go back to the fields ' + Math.ceil(wait) + 's from now.';
    u.order = { t: 'disarm', id: dinh.id, left: DISARM_TIME, s: 'go' };
  } else return 'Only villagers and militia.';
  u.path = null; u.wait = 0;
  return null;
};
Game.prototype.doArm = function (u, dt) {
  const o = u.order, b = this.byId.get(o.id);
  if (!b || b.hp <= 0) { const nb = this.nearestDinh(u); if (nb) { o.id = nb.id; u.path = null; return; } this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, b.rect) <= 1.0) {
    u.path = null;
    if (o.s === 'go') {
      if (o.t === 'arm') {
        if (!this.canAfford(u.team, MILITIA_COST)) { if (u.team === 0 && this.t - (this.lastArmMsg || -99) > 4) { this.lastArmMsg = this.t; this.msg('Arming a villager needs 15 wood and 10 gold.'); } this.idleOrder(u); return; }
        this.pay(u.team, MILITIA_COST);
      }
      o.s = 'work';
    }
    u.working = true; o.left -= dt;
    if (o.left <= 0) {
      const hx = u.x, hy = u.y;
      convertUnit(u, o.t === 'arm' ? 'danbinh' : 'villager');
      if (o.t === 'arm') { u.armedAt = this.t; this.M.militia++; this.floaters.push({ x: u.x, y: u.y - 1, text: 'Dân Binh', type: 'gold', t: 1.1 }); }
      this.idleOrder(u); u.order.hx = hx; u.order.hy = hy;
      if (o.then) this.orderAMove(u, o.then.x, o.then.y);
    }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.9))) { u.wait = 0.8; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
// the drum at the Đình: every villager in earshot runs to take up arms
Game.prototype.soundDrum = function (b) {
  let n = 0;
  for (const u of this.units) if (u.team === b.team && u.hp > 0 && u.kind === 'villager' && u.order.t !== 'arm' && rectDist(u.x, u.y, b.rect) <= 10) { if (!this.orderArm(u, b)) n++; }
  return n;
};
Game.prototype.sendHome = function (b) {
  let n = 0, wait = 0;
  for (const u of this.units) if (u.team === b.team && u.hp > 0 && u.kind === 'danbinh' && u.order.t !== 'disarm' && rectDist(u.x, u.y, b.rect) <= 12) { if (!this.orderArm(u, b)) n++; else wait++; }
  return { n, wait };
};
// swap a unit for another kind in place, keeping its share of health
function convertUnit(u, k) {
  const d = UD[k], m = TEAMMOD[u.team] || TEAMMOD[0];
  const r = u.hp / u.maxHp;
  Object.assign(u, { kind: k, cls: d.cls, maxHp: Math.round(d.hp * m.hp), spd: d.spd * m.spd, atk: d.atk, rate: d.rate, rng: d.rng,
    ma: d.ma, pa: d.pa, bonus: d.bonus, ranged: !!d.ranged, sight: d.sight, carryMax: d.carry || 0 });
  u.hp = Math.max(1, Math.round(u.maxHp * r)); u.carry = { type: null, amt: 0 };
}

/* ---------- repair (villagers fix damaged buildings and walls) ---------- */
const _command = Game.prototype.command;
Game.prototype.command = function (ids, wx, wy, target, opts) {
  opts = opts || {};
  const us = ids.map(id => this.byId.get(id)).filter(u => u && u.isUnit && u.hp > 0 && (u.team === 0 || opts.any));
  if (target && target.hp > 0 && us.length && target.isBld && target.team === us[0].team && target.done && target.hp < target.maxHp && target.kind !== 'farm' && us.some(u => u.cls === 'vil')) {
    const movers = [];
    for (const u of us) { if (u.cls === 'vil') { u.order = { t: 'repair', id: target.id }; u.path = null; u.wait = 0; } else movers.push(u); }
    if (movers.length) this.groupMove(movers, target.x, target.y, opts);
    return;
  }
  _command.call(this, ids, wx, wy, target, opts);
};
Game.prototype.doRepair = function (u, dt) {
  const b = this.byId.get(u.order.id);
  if (!b || b.hp <= 0 || b.hp >= b.maxHp) { this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, b.rect) <= 0.95) {
    u.path = null; u.working = true;
    const cx = b.x - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
    b.hp = Math.min(b.maxHp, b.hp + 14 * dt);
    if (b.hp >= b.maxHp) this.idleOrder(u);
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};

/* ---------- per-unit update: new orders, stillness, hiding in the forest ---------- */
const _updateUnit = Game.prototype.updateUnit;
Game.prototype.updateUnit = function (u, dt) {
  const t = u.order.t, d = UD[u.kind];
  if (t === 'arm' || t === 'disarm' || t === 'repair' || t === 'flee2') {
    u.cd = Math.max(0, u.cd - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
    u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
    u.anim += dt; u.moving = false; u.working = false;
    if (t === 'repair') this.doRepair(u, dt); else if (t === 'flee2') this.doRetreat(u, dt); else this.doArm(u, dt);
  } else _updateUnit.call(this, u, dt);
  // how long it has stood still (Hỏa Đồng volley, forest ambush)
  if (u.moving) u.still = 0; else u.still = (u.still || 0) + dt;
  if (u.moving && d.charge) u.runT = (u.runT || 0) + dt; else if (!u.moving && u.order.t !== 'attack') u.runT = 0;
  const hid = u.team === 0 && d.ambush && u.layer === 0 && u.still >= 1 && this.t - (u.shotAt || -99) > 3 && this.inForest(u);
  if (hid && !u.hidden) u.hidT = this.t;
  u.hidden = hid;
};
// speed: militia move faster through the forest, Ming horses slower
const _stepMove = Game.prototype.stepMove;
Game.prototype.stepMove = function (u, dt) {
  const d = UD[u.kind];
  let m = 1;
  if (this.forest && (d.militia || d.cls === 'cav') && this.inForest(u)) m = d.militia ? 1.15 : 0.55;
  if (m === 1) return _stepMove.call(this, u, dt);
  const s = u.spd; u.spd = s * m; const r = _stepMove.call(this, u, dt); u.spd = s; return r;
};
// in a forest, an ambusher holds its ground: it fires on what comes in range and doesn't give chase
const _doIdle = Game.prototype.doIdle;
Game.prototype.doIdle = function (u, dt) {
  const d = UD[u.kind];
  if (u.team === 0 && d.ambush && this.inForest(u) && u.cls !== 'vil') {
    u.scan -= dt; if (u.scan > 0) return; u.scan = 0.35;
    const t = this.nearestEnemy(u, u.ranged ? u.rng + 0.3 : 2.6);
    if (t) this.orderAttack(u, t, { leash: { x: u.x, y: u.y, r: u.ranged ? 1.2 : 5 } });
    return;
  }
  if (d.heart) { this.heartStep(u, dt); }
  _doIdle.call(this, u, dt);
};
// the enemy can't see what hides in the forest until it is very close
const _nearestEnemy = Game.prototype.nearestEnemy;
Game.prototype.nearestEnemy = function (u, r) {
  if (u.team !== 1) return _nearestEnemy.call(this, u, r);
  // hidden units are skipped by flipping their health for the length of the search
  const hidden = [];
  for (const o of this.hiddenList || []) if (o.hidden && o.hp > 0 && Math.hypot(o.x - u.x, o.y - u.y) > 1.6) { hidden.push(o); o.hp = -o.hp; }
  const t = _nearestEnemy.call(this, u, r);
  for (const o of hidden) o.hp = -o.hp;
  return t;
};
const _doAttack = Game.prototype.doAttack;
Game.prototype.doAttack = function (u, dt) {
  if (u.team === 1) {
    const t = this.byId.get(u.order.id);
    if (t && t.hidden && Math.hypot(t.x - u.x, t.y - u.y) > 1.6) { this.idleOrder(u); return; }
  }
  _doAttack.call(this, u, dt);
};
// a column ordered home walks back up its pass and leaves the map
Game.prototype.doRetreat = function (u, dt) {
  const o = u.order;
  if (u.y < 4 || (o.tt = (o.tt || 0) + dt) > 40) { u.hp = 0; u.silent = true; this.M.fled++; return; }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, o.x, o.y))) { u.wait = 1; return; } }
  const s = u.spd; u.spd = s * 1.2; if (this.stepMove(u, dt)) u.path = null; u.spd = s;
};

/* ---------- Nguyễn Trãi: "attacking the heart". A beaten Ming soldier near him lays down his arms ---------- */
Game.prototype.heartStep = function (u, dt) {
  const H = UD[u.kind].heart;
  u.hcd = Math.max(0, (u.hcd || 0) - dt);
  u.hscan = (u.hscan || 0) - dt;
  if (u.hcd > 0 || u.hscan > 0 || this.t - (u.lastHit || -99) < 3) return;
  u.hscan = 0.5;
  let best = null, bf = H.below;
  this.unitsNear(u.x, u.y, H.r, (o) => {
    if (o.team !== 1 || o.hp <= 0 || UD[o.kind].hero || o.cls === 'siege' || Math.hypot(o.x - u.x, o.y - u.y) > H.r) return;
    const f = o.hp / o.maxHp; if (f < bf) { bf = f; best = o; }
  });
  if (!best) return;
  u.hcd = H.cd; u.atkT = 0.5;
  best.hp = 0; best.silent = true; this.M.surrendered++;
  this.res[0].gold += 8;
  this.floaters.push({ x: best.x, y: best.y - 1, text: 'surrenders +8', type: 'gold', t: 1.4 });
  this.fx.push({ k: 'heal', x: best.x, y: best.y - 0.5, t: 0.7, max: 0.7 });
  if (this.M.surrendered === 1) this.msg('Nguyễn Trãi talks a beaten Ming soldier into laying down his arms.');
};

/* ---------- combat: ambush, standing volleys, guns through armour, cannon splash, charges, hero auras ---------- */
const _damage = Game.prototype.damage;
// gunpowder: the shot just fired becomes a bullet or a cannonball, with a flash and a puff of white smoke at the muzzle
Game.prototype.gunShot = function (att, ad) {
  let a = null;
  for (let i = this.arrows.length - 1; i >= 0 && i >= this.arrows.length - 6; i--) { const r = this.arrows[i]; if (r.t === 0 && r.x0 === att.x && !r.k) { a = r; break; } }
  if (!a) return;
  const big = !!ad.splash, d = Math.hypot(a.x1 - a.x0, a.y1 - a.y0);
  a.k = big ? 'ball' : 'bullet'; a.dur = big ? 0.1 + d * 0.03 : 0.04 + d * 0.012;
  const mx = att.x + att.face * (big ? 0.6 : 0.42), my = att.y - (big ? 0.15 : 0.4);
  this.fx.push({ k: 'spark', sub: 'flash', x: mx, y: my, face: att.face, big, t: big ? 0.14 : 0.09, max: big ? 0.14 : 0.09 });
  const n = big ? 6 : 3;
  for (let i = 0; i < n; i++) this.fx.push({ k: 'smoke', sub: 'gun', x: mx + att.face * (0.1 + i * 0.12) + (this.rng() - 0.5) * 0.2, y: my + (this.rng() - 0.5) * 0.15, vy: -0.25 - this.rng() * 0.3, vx: att.face * (0.2 + this.rng() * 0.3), big, t: (big ? 1.6 : 1.0) + this.rng() * 0.5, max: (big ? 2.1 : 1.5) });
  if (att.team !== 2 && typeof SFX !== 'undefined') this.sfxShots = (this.sfxShots || []).concat([{ x: mx, y: my, big }]);
};
Game.prototype.damage = function (att, tgt, w) {
  const ad = att.kind && att.isUnit ? UD[att.kind] : null;
  if (ad && ad.gun) this.gunShot(att, ad);
  if (tgt.hp <= 0) return;
  if (!ad) { this.wallDamage(att, tgt, w); return; }
  let mult = 1, plus = 0;
  if (att.hidden) {
    mult *= 1.5; att.hidden = false; this.M && this.M.ambushes++;
    if (att.team === 0 && this.t - (this.lastAmbush || -99) > 6) { this.lastAmbush = this.t; this.floaters.push({ x: att.x, y: att.y - 1.2, text: 'Ambush!', type: 'gold', t: 1.2 }); }
  }
  if (ad.still && att.still >= 1.5) mult *= ad.still;
  if (ad.charge && (att.runT || 0) > 1.2 && tgt.isUnit) { plus += ad.charge; att.runT = 0; }
  if (tgt.isBld && ad.bld) plus += ad.bld;
  const aura = this.auraFor(att); plus += aura;
  att.shotAt = this.t;
  const atk0 = att.atk, pa0 = tgt.pa;
  att.atk = Math.round(atk0 * mult + plus);
  if (ad.pierce && tgt.isUnit) tgt.pa = Math.max(0, tgt.pa - ad.pierce);
  this.wallDamage(att, tgt, w);
  att.atk = atk0; if (tgt.isUnit) tgt.pa = pa0;
  // cannon: the shot bounces through the crowd around the target
  if (ad.splash && tgt.isUnit) {
    const x = tgt.x, y = tgt.y;
    this.unitsNear(x, y, ad.splash + 0.5, (o) => {
      if (o === tgt || o.hp <= 0 || o.team === att.team || o.team === 2 || o.layer !== 0 || Math.hypot(o.x - x, o.y - y) > ad.splash) return;
      const a0 = att.atk; att.atk = Math.round(a0 * 0.5); _damage.call(this, att, o); att.atk = a0;
    });
    this.fx.push({ k: 'smoke', x, y: y - 0.2, vy: -0.5, t: 0.9, max: 0.9 });
  }
};
// walls and gates are tough: they use their own armour instead of the building default
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
  _onKilled.call(this, t, att);
  const M = this.M; if (!M || !t.isUnit) return;
  const d = UD[t.kind];
  if (t.team === 0 && d.hero) {
    M.heroDown[t.kind] = this.t; M.heroBack[t.kind] = this.t + HERO_BACK;
    this.msg(d.name + ' is wounded and carried from the field. Back in ' + HERO_BACK + 's.');
  }
  if (t.kind === 'm_hero') { M.generalDead = true; M.generalAt = this.t; }
};

/* ---------- the Ming AI: no economy, only columns marching on the valley ---------- */
Game.prototype.aiTick = function () { if (this.M) missionAI(this); };
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (!this.buildings.some(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0)) { M.why = 'citadel'; this.over = 'lose'; return; }
  if (M.won) this.over = 'win';
};
const _update = Game.prototype.update;
Game.prototype.update = function (dt) {
  this.heroes = this.units.filter(u => u.hp > 0 && UD[u.kind].aura);
  this.hiddenList = this.units.filter(u => u.hidden && u.hp > 0);
  _update.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};

function homeGoal(g) {
  return g.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0) || null;
}
// which land tiles can walk to the goal right now (walls and closed gates block)
function reachMap(g, goal) {
  const seen = new Uint8Array(W * H), q = [];
  const push = (x, y) => { if (g.inb(x, y) && !seen[y * W + x] && g.walkable(x, y, 0)) { seen[y * W + x] = 1; q.push(y * W + x); } };
  for (let y = goal.ty - 1; y <= goal.ty + goal.size; y++) for (let x = goal.tx - 1; x <= goal.tx + goal.size; x++) push(x, y);
  for (let i = 0; i < q.length; i++) { const c = q[i], x = c % W, y = (c / W) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  return seen;
}
function nearestOf(g, u, ok, maxD) {
  let best = null, bd = maxD || 1e9;
  for (const b of g.buildings) { if (b.team !== 0 || b.hp <= 0 || !ok(b)) continue; const d = rectDist(u.x, u.y, b.rect); if (d < bd) { bd = d; best = b; } }
  return best;
}
const isWall = (b) => b.kind === 'wall' || b.kind === 'gate';
function missionAI(g) {
  const goal = homeGoal(g); if (!goal) return;
  const reach = g._reachT === g.tickN >> 4 && g._reach ? g._reach : (g._reach = reachMap(g, goal));
  g._reachT = g.tickN >> 4;
  for (const u of g.units) {
    if (u.team !== 1 || u.hp <= 0 || u.layer !== 0) continue;
    const o = u.order, d = UD[u.kind];
    if (o.t === 'flee2') continue;
    if (o.t === 'attack' && g.byId.get(o.id) && !u._blocked) continue;
    if (o.t === 'amove' && !u._blocked && g.t - (u._amT || 0) < 6) continue;
    u._blocked = false;
    const inside = reach[Math.floor(u.y) * W + Math.floor(u.x)];
    // cannon go for towers and walls first, then any building
    if (d.cls === 'siege') {
      const b = nearestOf(g, u, (b) => b.kind === 'tower' || isWall(b), 12) || nearestOf(g, u, () => true, inside ? 16 : 10);
      if (b) { g.orderAttack(u, b); continue; }
    }
    // raiders ride for the fields and the people working them
    if (u.raid && !inside) { /* fall through to walls */ }
    else if (u.raid) {
      let prey = null, pd = 22;
      for (const v of g.units) if (v.team === 0 && v.hp > 0 && v.layer === 0 && !v.hidden && (v.cls === 'vil' || v.cls === 'healer')) { const dd = Math.hypot(v.x - u.x, v.y - u.y); if (dd < pd) { pd = dd; prey = v; } }
      const farm = prey ? null : nearestOf(g, u, (b) => b.kind === 'farm' || b.kind === 'dinh' || b.kind === 'house', 26);
      if (prey || farm) { g.orderAttack(u, prey || farm); continue; }
    }
    if (inside) { g.orderAMove(u, goal.x, goal.y); u._amT = g.t; continue; }
    // walled out: break through the nearest bit of wall
    const w = nearestOf(g, u, isWall, 40);
    if (w) g.orderAttack(u, w); else { g.orderAMove(u, goal.x, goal.y); u._amT = g.t; }
  }
}
// an enemy that can't reach what it wants marks itself so the AI can send it at the wall instead
const _ptr = Game.prototype.pathToRect, _ptp = Game.prototype.pathToPoint;
Game.prototype.pathToRect = function (u, rect, reach) { const r = _ptr.call(this, u, rect, reach); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };
Game.prototype.pathToPoint = function (u, gx, gy) { const r = _ptp.call(this, u, gx, gy); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };

/* ---------- the wave director ---------- */
function launchWave(g, i) {
  const M = g.M, W_ = WAVES[i], vet = i >= 8 ? 1.2 : i >= 5 ? 1.1 : 1, arm = i >= 8 ? 1 : 0;
  const goal = homeGoal(g);
  const ids = new Set();
  for (const c of W_.cols) {
    const spawn = () => {
      const px = PASSES[c.from].x, kinds = [];
      for (const k in c.u) { const n = k === 'm_hero' ? 1 : Math.max(1, Math.round(c.u[k] * DMUL[g.diff])); for (let j = 0; j < n; j++) kinds.push(k); }
      // cavalry and the general up front, cannon at the back
      kinds.sort((a, b) => (UD[a].cls === 'siege') - (UD[b].cls === 'siege'));
      kinds.forEach((k, j) => {
        const p = g.openSpot(px - 2.5 + (j % 6), 2.5 + Math.floor(j / 6) * 0.9, 0);
        const u = g.addUnit(k, 1, p.x, p.y);
        if (vet !== 1) { u.maxHp = Math.round(u.maxHp * vet); u.hp = u.maxHp; }
        u.ma += arm; u.pa += arm; u.wave = i; u.raid = !!c.raid;
        ids.add(u.id);
        if (k === 'm_hero') M.general = u;
        if (goal) { g.orderAMove(u, PASSES[c.from].x + 0.5, 22); u._amT = g.t + 6; }
      });
      g.alerts.push({ x: px, y: 14, t: 3 });
      for (let y = 2; y < 20; y++) for (let x = px - 3; x <= px + 3; x++) if (g.inb(x, y)) g.explored[y * W + x] = 1;
    };
    if (c.delay) M.later = (M.later || []).concat([{ at: M.t + c.delay, fn: spawn }]); else spawn();
  }
  M.cols.push({ wave: i, ids, left: 0, done: false, kinds: waveSize(i, g.diff) });
  const from = W_.cols.map(c => PASSES[c.from].name);
  g.msg('Wave ' + (i + 1) + ': the Ming come down the ' + from.filter((v, k) => from.indexOf(v) === k).join(' and the ') + '!');
  if (W_.story) M.cardQ.push(W_.story);
}
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  if (g.forestDirty && (g.tickN % 30) === 0) { g.forestDirty = false; g.forestMap(); }
  // scouts warn of the next column
  if (M.wave < WAVES.length && M.next - M.t <= 25 && M.warned < M.wave) {
    M.warned = M.wave;
    const W_ = WAVES[M.wave], from = W_.cols.map(c => c.from);
    g.msg('Scouts: Ming troops on the road to the ' + PASSES[from[0]].name + (from.length > 1 ? ' and ' + (from.length - 1) + ' more' : '') + '.');
    for (const p of from) g.alerts.push({ x: PASSES[p].x, y: 12, t: 3 });
  }
  if (M.wave < WAVES.length && M.t >= M.next) {
    launchWave(g, M.wave);
    M.wave++;
    M.next = M.wave < WAVES.length ? M.t + WAVES[M.wave].at : 1e9;
  }
  if (M.later) { for (const L of M.later) if (!L.done && M.t >= L.at) { L.done = true; L.fn(); for (const u of g.units) if (u.team === 1 && u.wave === M.wave - 1) M.cols[M.cols.length - 1].ids.add(u.id); } M.later = M.later.filter(L => !L.done); }
  // a column is broken when every man in it is down (spoils go to the villages)
  const alive = new Map();
  for (const u of g.units) if (u.team === 1 && u.hp > 0) alive.set(u.id, 1);
  for (const c of M.cols) {
    if (c.done) continue;
    let n = 0; for (const id of c.ids) if (alive.has(id)) n++;
    c.left = n;
    if (n === 0 && !(M.later && M.later.length && c.wave === M.wave - 1)) {
      c.done = true; M.broken++;
      const gold = 60 + c.wave * 30, food = 40 + c.wave * 20;
      g.res[0].gold += gold; g.res[0].food += food; M.spoils += gold;
      g.msg('Wave ' + (c.wave + 1) + ' is broken! Spoils: +' + gold + ' gold, +' + food + ' food.');
      M.lastBroken = M.t;
    }
  }
  M.active = M.cols.some(c => !c.done);
  // the heroes come back from the field
  for (const k in M.heroBack) if (M.heroBack[k] && M.t >= M.heroBack[k]) {
    const tc = homeGoal(g); if (!tc) break;
    M.heroBack[k] = 0;
    const sp = g.findSpawn(tc, null, 0), u = g.addUnit(k, 0, sp.x, sp.y);
    if (k === 'leloi') M.leloi = u; else M.trai = u;
    g.msg(UD[k].name + ' is back on his feet.');
  }
  // Chi Lăng: when Liễu Thăng falls, his army loses heart and turns for home
  if (M.generalDead && !M.routed) {
    M.routed = true; M.cardQ.push('rout');
    for (const c of M.cols) if (!c.done) { c.done = true; M.broken++; }
    M.later = [];
    for (const u of g.units) if (u.team === 1 && u.hp > 0 && u.layer === 0) {
      let p = 'c', pd = 1e9; for (const k in PASSES) { const dd = Math.abs(PASSES[k].x - u.x); if (dd < pd) { pd = dd; p = k; } }
      u.order = { t: 'flee2', x: PASSES[p].x + 0.5, y: 2.5 }; u.path = null;
    }
    g.msg('Liễu Thăng has fallen in the pass! The Ming army breaks and runs for home.');
  }
  if (M.routed && !M.cards.closing && M.t - M.generalAt > 9) { M.cards.closing = true; M.cardQ.push('closing'); }
}
// "Next wave now": bring the column early for a little bonus gold
Game.prototype.callWave = function () {
  const M = this.M;
  if (!M || M.wave >= WAVES.length) return 'No more waves are coming.';
  if (M.active) return 'Break the column in the valley first.';
  const left = M.next - M.t;
  if (left < 8) return 'They are almost here.';
  const bonus = Math.round(left * 0.6);
  this.res[0].gold += bonus; M.early += bonus;
  M.next = M.t + 6; M.warned = M.wave - 1;
  this.msg('Drums on the ridge: you call the Ming on. +' + bonus + ' gold.');
  return null;
};

/* naval combat at the date of the demo (1427): no ship cannon (there are no warships in this demo) */
NAVWPN.tierDefault = 1;

/* hand-made map: keep every tree (the main game thins woods on random maps, v0.9.40) */
Game.prototype.openWoods = function () {};
