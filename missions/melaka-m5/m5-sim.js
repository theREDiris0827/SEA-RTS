/* ===== m5-sim.js ===== */
/* ==========================================================================
   Melaka campaign, mission 5: "The Last Sultan of Melaka" (1511). Plan: claude.ai/artifact/BV4BopPHdGsczrooWSgc83
   Step 1 demo: the dressed city and phase 1, the St James' Day assault (25 July 1511). Albuquerque's men land on
   both beaches and fight for the bridge over the Melaka river. Hold it until they fall back to their ships.
   Phases 2 (the junk battery, 10 August) and 3 (the sultan's escape upriver) come in step 2.
   Team 0 is Melaka (age 4). Team 1 is Portugal, drawn from the art book (unit-art/aux-civs.js) in m5-art.js.
   Sim side only (no DOM).
   ========================================================================== */

const DMUL = { easy: 0.7, normal: 1, hard: 1.3 };
CIVMAP = [0, 1];

/* ---------- the map: the strait on the west, the river through the middle, the bridge joining the two halves ---------- */
const RIVER = [[97, 29], [86, 31], [76, 28], [66, 31], [56, 35], [46, 36], [38, 37], [30, 38], [20, 39]];
const BRIDGE = { x0: 34, x1: 35, y0: 33, y1: 41 };               // plank road over the river (both tiles wide)
const BR_N = { x: 35, y: 31.5 }, BR_S = { x: 35, y: 42.5 }, BR_MID = { x: 35, y: 37 };
const ISTANA = { tx: 33, ty: 52 };
const LAND = { n: { x: 16.5, y: 25, name: 'the Upeh beach' }, s: { x: 16.5, y: 50, name: 'the beach below the hill' } };
const SEA_IN = { n: { x: 2.5, y: 22 }, s: { x: 2.5, y: 52 } };
function coastX(y, s) { return 19 + Math.sin(y * 0.13) * 2 + (fbm(1.5, y * 0.15, s) - 0.5) * 3; }
function riverDist(x, y) {
  let m = 99;
  for (let i = 0; i + 1 < RIVER.length; i++) {
    const [ax, ay] = RIVER[i], [bx, by] = RIVER[i + 1], dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    let k = ((x - ax) * dx + (y - ay) * dy) / l; k = Math.max(0, Math.min(1, k));
    m = Math.min(m, Math.hypot(x - ax - dx * k, y - ay - dy * k));
  }
  return m;
}
const onBridge = (x, y) => x >= BRIDGE.x0 && x <= BRIDGE.x1 && y >= BRIDGE.y0 && y <= BRIDGE.y1;

Game.prototype.genMap = function () {
  const t = this.terrain, s = 9;
  this.bridge = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = x + 0.5 - coastX(y, s), rd = riverDist(x + 0.5, y + 0.5), w = 2.3 + (x < 40 ? 0.6 : 0);
    let v = fbm(x * 0.12, y * 0.12, s + 3) > 0.72 ? T.DIRT : T.GRASS;
    if (d < -2.5) v = T.DEEP; else if (d < 0) v = T.SHALLOW; else if (d < 1.2) v = T.SAND;
    if (rd < w - 1) v = T.DEEP; else if (rd < w) v = T.SHALLOW;
    if (Math.hypot((x - 35) / 9, (y - 53) / 7) < 1 && v <= T.SAND) v = T.DIRT;      // Bukit Melaka, trodden ground round the Istana
    t[y * W + x] = v;
  }
  // the bridge: land for men, still open water underneath for boats (walkable() below)
  for (let y = BRIDGE.y0; y <= BRIDGE.y1; y++) for (let x = BRIDGE.x0; x <= BRIDGE.x1; x++) if (t[y * W + x] === T.SHALLOW || t[y * W + x] === T.DEEP) { t[y * W + x] = T.DIRT; this.bridge[y * W + x] = 1; }
  // streets
  for (let y = 12; y < 64; y++) for (const x of [34, 35]) if (t[y * W + x] === T.GRASS) t[y * W + x] = T.DIRT;
  for (let x = 23; x <= 72; x++) for (const y of [20, 21]) if (t[y * W + x] === T.GRASS) t[y * W + x] = T.DIRT;
  for (let x = 46; x < 68; x++) for (const y of [45, 46]) if (t[y * W + x] === T.GRASS) t[y * W + x] = T.DIRT;
};
const _walkable = Game.prototype.walkable;
Game.prototype.walkable = function (x, y, layer) {
  if (layer === 1 && this.bridge && x >= 0 && y >= 0 && x < W && y < H && this.bridge[y * W + x]) return true;
  return _walkable.call(this, x, y, layer);
};
Game.prototype.reserveRoute = function () { };
// the whole city is yours and the fleet lies in plain sight: no fog in this mission
Game.prototype.updateFog = function () { this.visible.fill(1); this.explored.fill(1); };

/* ---------- units ---------- */
Object.assign(UD, {
  // Raja Ahmad, the sultan's son, led the defence of the bridge
  rajaahmad: { name: 'Raja Ahmad', hp: 520, spd: 2.4, atk: 15, bonus: { sword: 5, elite: 4 }, rng: 0.85, rate: 0.9, ma: 3, pa: 3, sight: 8, cost: {}, time: 0, cls: 'elite', hero: true, aura: { r: 5, atk: 2 }, civ: 0 },
  // Portugal, 1511 (roster: unit-art/aux-civs.md)
  pt_pike: { name: 'Piqueiro', hp: 70, spd: 2.0, atk: 7, bonus: { sword: 4, elite: 6 }, rng: 1.6, rate: 1.2, ma: 3, pa: 2, sight: 6.5, cost: {}, time: 0, cls: 'spear', pt: 'pike', civ: 9 },
  pt_sword: { name: 'Rodeleiro', hp: 78, spd: 2.1, atk: 10, bonus: { archer: 4 }, rng: 0.85, rate: 1.0, ma: 3, pa: 4, sight: 6.5, cost: {}, time: 0, cls: 'sword', pt: 'sword', civ: 9 },
  pt_xbow: { name: 'Besteiro', hp: 40, spd: 2.0, atk: 9, bonus: { elite: 3 }, rng: 6, rate: 2.2, ma: 1, pa: 1, sight: 7.5, cost: {}, time: 0, cls: 'archer', ranged: true, pt: 'xbow', civ: 9 },
  pt_gun: { name: 'Espingardeiro', hp: 46, spd: 2.0, atk: 15, bonus: { sword: 3, elite: 6 }, rng: 6.5, rate: 3.0, ma: 1, pa: 2, sight: 8, cost: {}, time: 0, cls: 'archer', ranged: true, gun: true, pt: 'gun', civ: 9 },
  pt_berco: { name: 'Berço', hp: 120, spd: 1.4, atk: 12, rng: 7, rate: 3.6, ma: 2, pa: 5, sight: 8, cost: {}, time: 0, cls: 'siege', ranged: true, gun: true, splash: 1.0, bld: 30, pt: 'berco', civ: 9 },
  albuquerque: { name: 'Afonso de Albuquerque', hp: 700, spd: 2.0, atk: 16, bonus: { elite: 4 }, rng: 0.85, rate: 1.0, ma: 4, pa: 5, sight: 8.5, cost: {}, time: 0, cls: 'elite', foeHero: true, aura: { r: 5, atk: 2 }, pt: 'hero', civ: 9 },
  pt_boat: { name: 'Batel', hp: 160, spd: 2.8, atk: 0, rng: 0, rate: 1, ma: 1, pa: 2, sight: 6, cost: {}, time: 0, cls: 'ship', layer: 1, slot: 'galley', ptShip: 'boat', civ: 9 },
  pt_caravel: { name: 'Caravela', hp: 320, spd: 2.6, atk: 20, rng: 7, rate: 3.6, ma: 2, pa: 3, sight: 8, cost: {}, time: 0, cls: 'ship', ranged: true, layer: 1, slot: 'frigate', wpn: 'cannon', ptShip: 'caravel', civ: 9 },
  pt_nau: { name: 'Nau', hp: 1400, spd: 1.6, atk: 30, rng: 7.5, rate: 3.5, ma: 3, pa: 5, sight: 9, cost: {}, time: 0, cls: 'ship', ranged: true, layer: 1, slot: 'flagship', wpn: 'cannon', ptShip: 'nau', civ: 9 }
});
Object.assign(CIV_NAMES, { rajaahmad: [['Raja Ahmad']], wat: [['Masjid'], ['Pura'], ['Wat']] });
Object.assign(BRIEF, { rajaahmad: 'Your hero, the sultan\'s son. If he falls, the mission is lost', wat: 'The great mosque of Melaka, by the bridge' });
BD.wat = Object.assign({}, BD.wat, { civ: undefined, hp: 1800 });
UD.cannon.civCap = [6, 6, 6];
BUILD_ORDER.length = 0;
for (const k of ['house', 'barracks', 'port', 'palisade', 'gate', 'tower', 'rumahtabib']) BUILD_ORDER.push(k);

/* ---------- the waves: [time from start (s), beach, troops, extra] ---------- */
const WAVES = [
  { at: 25, n: { pt_sword: 4, pt_pike: 3, pt_gun: 2 }, s: { pt_sword: 4, pt_pike: 3, pt_gun: 2 } },
  { at: 150, n: { pt_sword: 5, pt_pike: 4, pt_gun: 3, pt_xbow: 2 }, s: { pt_sword: 4, pt_pike: 3, pt_gun: 3, pt_berco: 1 } },
  { at: 285, n: { pt_sword: 5, pt_pike: 5, pt_gun: 4, pt_xbow: 3, pt_berco: 1 }, s: { pt_sword: 5, pt_pike: 4, pt_gun: 4, pt_xbow: 2 } },
  { at: 430, n: { albuquerque: 1, pt_sword: 7, pt_pike: 6, pt_gun: 5, pt_xbow: 3, pt_berco: 1 }, s: { pt_sword: 6, pt_pike: 5, pt_gun: 5, pt_xbow: 3, pt_berco: 1 }, final: true }
];
const BRIDGE_HOLD = 25;          // seconds of Portuguese on the bridge with no Melaka men near it, and the bridge is lost

/* ---------- mission state ---------- */
function newMission() {
  return { t: 0, phase: 1, cardQ: [], wave: 0, next: WAVES[0].at, cols: [], ashore: 0, kills: 0, lost: 0, bridge: 0, hero: 0, istana: 0,
    finalOn: false, retreat: false, retreatAt: 0, won: false, why: null, peak: 0, alb: 0, albOut: false };
}

Game.prototype.populate = function () {
  const g = this, t = g.terrain, M = g.M = newMission();
  const B = (k, tm, x, y) => { if (!g.inb(x, y)) return null; try { return g.addBuilding(k, tm, x, y, true); } catch (e) { return null; } };
  const U = (k, tm, x, y) => { const p = g.openSpot(x, y, UD[k].layer || 0); return p ? g.addUnit(k, tm, p.x, p.y) : null; };
  const land = (x, y) => g.inb(x, y) && (t[y * W + x] === T.GRASS || t[y * W + x] === T.DIRT);
  // ---------- the royal hill: the Istana in its walled compound ----------
  const ring = (x0, y0, x1, y1, gates) => {
    const put = (x, y) => gates.some(([gx, gy]) => gx === x && gy === y) ? B('gate', 0, x, y) : B('wall', 0, x, y);
    for (let x = x0; x <= x1; x++) { put(x, y0); put(x, y1); }
    for (let y = y0 + 1; y < y1; y++) { put(x0, y); put(x1, y); }
  };
  ring(27, 47, 45, 61, [[34, 47], [35, 47], [45, 54]]);
  M.istana = B('palace', 0, ISTANA.tx, ISTANA.ty).id;
  B('granary', 0, 29, 49); B('granary', 0, 41, 49); B('store', 0, 29, 57); B('house', 0, 41, 57); B('house', 0, 38, 57); B('tower', 0, 29, 53); B('tower', 0, 42, 53);
  // the great mosque by the bridge, barracks, healer, the royal port at the river mouth
  B('wat', 0, 42, 43); B('barracks', 0, 47, 47); B('barracks', 0, 24, 49); B('rumahtabib', 0, 48, 51);
  B('port', 0, 23, 42); B('port', 0, 27, 41);
  for (const [x, y] of [[38, 43], [47, 43], [50, 43], [53, 43], [56, 42], [59, 41], [47, 55], [50, 55], [53, 47], [56, 47], [59, 46], [53, 51], [56, 51], [59, 50], [62, 45], [62, 49], [53, 55], [56, 55],
    [24, 53], [24, 56], [24, 59], [27, 63], [30, 63], [33, 63], [36, 63], [39, 63], [42, 63], [45, 63], [48, 59], [51, 59], [54, 59], [65, 44], [65, 48]]) B('house', 0, x, y);
  // stockades at both ends of the bridge
  for (let x = 29; x <= 41; x++) if (x !== 34 && x !== 35) B('palisade', 0, x, 42); B('gate', 0, 34, 42); B('gate', 0, 35, 42);
  // ---------- Upeh, the merchants' city on the north bank ----------
  for (let x = 40; x <= 70; x += 3) B('store', 0, x, 27);
  for (let yy = 9; yy <= 24; yy += 3) for (let xx = 23; xx <= 72; xx += 3) {
    if (xx === 32 || xx === 35 || yy === 18) continue;
    const h = hash2(xx, yy, 7);
    if (yy > 9 + 12 * hash2(xx, 3, 9) - 6 + (xx > 62 ? 4 : 0) && h < 0.12) continue;
    if (h > 0.93) { B('granary', 0, xx, yy); continue; }
    if (h > 0.86) { g.addNode('tree', xx, yy); continue; }
    B('house', 0, xx + (h < 0.25 ? 1 : 0), yy + (h > 0.6 && h < 0.7 ? 1 : 0));
  }
  B('tradepost', 0, 32, 15); B('tradepost', 0, 22, 33); B('tradepost', 0, 20, 26); B('granary', 0, 74, 14); B('granary', 0, 74, 20);
  B('tower', 0, 30, 31); B('tower', 0, 39, 31);
  for (let x = 32; x <= 38; x++) if (x !== 34 && x !== 35) B('palisade', 0, x, 32); B('gate', 0, 34, 32); B('gate', 0, 35, 32);
  // ---------- 1511: no stone walls, but stockades all along the beach, packed with guns ----------
  M.beach = [];
  for (let y = 6; y < 66; y++) {
    if (y >= 36 && y <= 43) continue;                                   // the river mouth and the royal port
    let x = 1; while (x < W && !land(x, y)) x++; x += 1;
    if (g.freeTile(x, y)) B('palisade', 0, x, y);
    M.beach.push([x, y]);
  }
  // ---------- defenders ----------
  M.hero = U('rajaahmad', 0, 35, 44).id;
  for (let i = 0; i < 5; i++) U('pahlawan', 0, 33.5 + (i % 3), 44.5 + (i / 3 | 0));
  for (let i = 0; i < 6; i++) U('musket', 0, 30 + i * 2, 43.4);
  for (const x of [31, 39]) U('cannon', 0, x, 44.5);
  for (let i = 0; i < 6; i++) U('keris', 0, 32 + i, 30.5);
  for (let i = 0; i < 4; i++) U('musket', 0, 31 + i * 2.2, 29.6);
  for (let i = 0; i < 4; i++) U('tombak', 0, 33 + i, 29);
  for (const [x, y] of [[21, 12], [21, 19], [21, 30], [21, 46], [21, 55], [21, 62]]) U('cannon', 0, x, y);    // beach batteries
  for (const [x, y] of [[23, 24], [23, 27], [23, 51], [23, 48]]) U('musket', 0, x, y);
  for (let i = 0; i < 4; i++) U('archer', 0, 22.5, 22 + i);
  for (let i = 0; i < 4; i++) U('archer', 0, 22.5, 52 + i);
  for (let i = 0; i < 6; i++) U('villager', 0, 37 + (i % 3), 50 + (i / 3 | 0));
  // Melaka's fleet in the river mouth
  U('flagship', 0, 24, 39.5); U('frigate', 0, 28.5, 37.6); U('light', 0, 22, 37.5);
  // ---------- Albuquerque's fleet in the roads ----------
  for (const [k, x, y] of [['pt_nau', 5, 40], ['pt_nau', 4, 28], ['pt_nau', 5, 50], ['pt_caravel', 3, 18], ['pt_caravel', 4, 60], ['pt_caravel', 7, 45]]) {
    const u = U(k, 1, x, y); if (u) u.post = { x: u.x, y: u.y };
  }
  // ---------- jungle beyond the town ----------
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!g.freeTile(x, y) || t[y * W + x] !== T.GRASS) continue;
    const town = x < 78 && y > 6 && y < 66;
    if (!town && hash2(x, y, 41) < 0.33) g.addNode('tree', x, y);
  }
  // fish in the strait
  for (let i = 0, n = 0; i < 3000 && n < 10; i++) {
    const x = 2 + Math.floor(g.rng() * 14), y = 3 + Math.floor(g.rng() * (H - 6));
    if (!g.isWater(x, y) || g.block[y * W + x]) continue; g.addNode('fish', x, y); n++;
  }
  g.res[0] = { food: 500, wood: 700, gold: 450 };
  g.res[1] = { food: 0, wood: 0, gold: 0 };
  g.age = [4, 4]; g.maxAge = 4; g.navTier = [2, 2];
};

/* ---------- landings: a ship's boat rows in, puts the men ashore, rows back out ---------- */
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
Game.prototype.doRaidLand = function (u, dt) {
  const o = u.order;
  o.tt = (o.tt || 0) + dt;
  const gx = o.s === 'in' ? o.x : o.sx, gy = o.s === 'in' ? o.y : o.sy;
  if (Math.hypot(u.x - gx, u.y - gy) < (o.s === 'in' ? 1.8 : 1.5) || o.tt > 70) {
    u.path = null;
    if (o.s === 'in') { this.raidUnload(u, o.troops, o.wave, o.side); o.s = 'out'; o.tt = 0; }
    else { u.hp = 0; u.silent = true; }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, gx, gy))) { u.wait = 1; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
Game.prototype.raidUnload = function (boat, kinds, wave, side) {
  const land = this.nearestFree(Math.floor(boat.x) + 1, Math.floor(boat.y), 0, 7), M = this.M;
  if (!land) return;
  const col = M.cols.find(c => c.wave === wave);
  for (const k of kinds) {
    const p = this.openSpot(land.x + 0.5, land.y + 0.5, 0), u = this.addUnit(k, 1, p.x, p.y); u.wave = wave; u.side = side;
    if (col) col.ids.add(u.id);
    if (k === 'albuquerque') M.alb = u.id;
    const goal = side === 'n' ? BR_N : BR_S; this.orderAMove(u, goal.x, goal.y); u._amT = this.t;
  }
  this.msg('The Portuguese are ashore on ' + LAND[side].name + '!');
  this.alerts.push({ x: land.x, y: land.y, t: 3 });
};
Game.prototype.doRetreat = function (u, dt) {
  const o = u.order;
  if (Math.hypot(u.x - o.x, u.y - o.y) < 2 || (o.tt = (o.tt || 0) + dt) > 50) { u.hp = 0; u.silent = true; return; }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, o.x, o.y))) { u.wait = 1; return; } }
  const s = u.spd; u.spd = s * 1.15; if (this.stepMove(u, dt)) u.path = null; u.spd = s;
};

/* ---------- hero auras ---------- */
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
  const M = this.M; if (!M || !t.isUnit) return;
  if (t.team === 1 && t.layer === 0 && !t.silent) M.kills++;
  if (t.team === 0 && !t.silent) M.lost++;
};
Game.prototype.aiTick = function () { if (this.M) missionAI(this); };
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (M.why) { this.over = 'lose'; return; }
  if (!heroUnit(this)) { M.why = 'hero'; this.over = 'lose'; return; }
  if (!this.buildings.some(b => b.id === M.istana && b.hp > 0)) { M.why = 'istana'; this.over = 'lose'; return; }
  if (M.won) this.over = 'win';
};
const _update = Game.prototype.update;
Game.prototype.update = function (dt) {
  this.heroes = this.units.filter(u => u.hp > 0 && UD[u.kind].aura);
  _update.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};
function heroUnit(g) { const u = g.byId.get(g.M.hero); return u && u.hp > 0 ? u : null; }

/* ---------- the Portuguese: make for the bridge, break what is in the way ---------- */
const isWall = (b) => !!BD[b.kind].wall;
function nearestOf(g, u, ok, maxD) {
  let best = null, bd = maxD || 1e9;
  for (const b of g.buildings) { if (b.team !== 0 || b.hp <= 0 || !ok(b)) continue; const d = rectDist(u.x, u.y, b.rect); if (d < bd) { bd = d; best = b; } }
  return best;
}
function goalFor(g, u) {
  // each column takes its own end of the bridge, then crosses it and makes for the Istana
  const end = u.side === 'n' ? BR_N : BR_S;
  if (!u.reached && Math.hypot(u.x - end.x, u.y - end.y) < 3) u.reached = true;
  if (!u.reached) return end;
  if (u.side === 'n') return onBridge(Math.floor(u.x), Math.floor(u.y)) || u.y > 36 ? BR_S : BR_MID;
  const ist = g.byId.get(g.M.istana); return ist ? { x: ist.x, y: ist.y } : BR_S;
}
function missionAI(g) {
  const M = g.M;
  for (const u of g.units) {
    if (u.team !== 1 || u.hp <= 0) continue;
    const o = u.order;
    if (o.t === 'flee2' || o.t === 'rland') continue;
    if (u.layer === 1) {
      // the naus hold the roads; the caravels come in to duel the beach guns once a landing is under way
      if (o.t === 'attack' && g.byId.get(o.id)) continue;
      if (UD[u.kind].ptShip === 'caravel' && M.wave > 0 && !M.retreat) {
        if (o.t !== 'amove' || g.t - (u._amT || 0) > 25) { const L = u.post.y < 36 ? LAND.n : LAND.s; g.orderAMove(u, L.x - 2.5, L.y + (u.id % 5) - 2); u._amT = g.t; }
      } else if (u.post && Math.hypot(u.x - u.post.x, u.y - u.post.y) > 2 && o.t !== 'move') g.orderMove(u, u.post.x, u.post.y);
      continue;
    }
    if (o.t === 'attack' && g.byId.get(o.id) && !u._blocked) continue;
    if (o.t === 'amove' && !u._blocked && g.t - (u._amT || 0) < 6) continue;
    const blocked = u._blocked; u._blocked = false;
    const goal = goalFor(g, u);
    if (blocked) { const wl = nearestOf(g, u, isWall, 12); if (wl) { g.orderAttack(u, wl); continue; } }
    g.orderAMove(u, goal.x + ((u.id % 3) - 1) * 0.6, goal.y); u._amT = g.t;
  }
}
const _ptr = Game.prototype.pathToRect, _ptp = Game.prototype.pathToPoint;
Game.prototype.pathToRect = function (u, rect, reach) { const r = _ptr.call(this, u, rect, reach); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };
Game.prototype.pathToPoint = function (u, gx, gy) { const r = _ptp.call(this, u, gx, gy); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };

/* ---------- the landing director ---------- */
function launchWave(g, idx) {
  const M = g.M, W0 = WAVES[idx], ids = new Set(), m = DMUL[g.diff];
  M.cols.push({ wave: idx, ids, final: !!W0.final });
  for (const side of ['n', 's']) {
    const troops = [];
    for (const k in W0[side]) for (let j = 0, c = k === 'albuquerque' ? 1 : Math.max(1, Math.round(W0[side][k] * m)); j < c; j++) troops.push(k);
    // a boat carries up to 6 men
    for (let b = 0; b * 6 < troops.length; b++) {
      const S = SEA_IN[side], L = LAND[side];
      const p = g.openSpot(S.x + (b % 2) * 1.5, S.y + b * 1.6 - 2, 1), s = g.addUnit('pt_boat', 1, p.x, p.y);
      const at = g.nearestFree(Math.floor(L.x), Math.floor(L.y + b * 1.3 - 2), 1, 5) || { x: L.x, y: L.y };
      s.order = { t: 'rland', x: at.x + 0.5, y: at.y + 0.5, sx: S.x, sy: S.y, troops: troops.slice(b * 6, b * 6 + 6), wave: idx, side, s: 'in' };
      ids.add(s.id);
    }
    g.alerts.push({ x: LAND[side].x, y: LAND[side].y, t: 3 });
  }
  if (W0.final) { M.finalOn = true; M.cardQ.push('final'); }
  g.msg(idx === 0 ? 'The Portuguese boats are pulling for the beaches!' : 'More boats put out from the carracks!');
}
function sideAshore(g) { let n = 0; for (const u of g.units) if (u.team === 1 && u.hp > 0 && u.layer === 0) n++; return n; }
function soundRetreat(g, why) {
  const M = g.M; if (M.retreat) return;
  M.retreat = true; M.retreatAt = M.t;
  for (const u of g.units) {
    if (u.team !== 1 || u.hp <= 0) continue;
    if (u.layer === 1) { if (u.post) g.orderMove(u, u.post.x, u.post.y); continue; }
    const S = u.side === 's' ? LAND.s : LAND.n;
    u.order = { t: 'flee2', x: S.x + 1.5, y: S.y }; u.path = null;
  }
  M.cardQ.push(why === 'alb' ? 'albhurt' : 'withdraw');
}
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  // landings
  if (!M.retreat && M.wave < WAVES.length && M.t >= M.next) {
    launchWave(g, M.wave); M.wave++;
    M.next = M.wave < WAVES.length ? WAVES[M.wave].at : 1e9;
  }
  // the treasury and the city's men keep coming while the bridge holds
  if (!M.retreat && M.t >= (M.payAt || 30)) { M.payAt = M.t + 30; const r = g.res[0]; r.food += 60; r.wood += 40; r.gold += 60; }
  M.ashore = sideAshore(g); M.peak = Math.max(M.peak, M.ashore);
  // the bridge: Portuguese on the planks with no Melaka men close by fills the meter; Melaka men there drain it
  let pt = 0, ml = 0;
  for (const u of g.units) {
    if (u.hp <= 0 || u.layer !== 0) continue;
    const near = Math.abs(u.x - BR_MID.x) < 3 && u.y > BRIDGE.y0 - 1.5 && u.y < BRIDGE.y1 + 1.5;
    if (!near) continue; if (u.team === 1) pt++; else if (u.team === 0) ml++;
  }
  if (pt > 0 && ml === 0) M.bridge = Math.min(BRIDGE_HOLD, M.bridge + dt);
  else if (ml > 0) M.bridge = Math.max(0, M.bridge - dt * (pt ? 0.5 : 1.5));
  if (M.bridge >= BRIDGE_HOLD && !M.retreat) { M.why = 'bridge'; return; }
  // Albuquerque wounded: he has himself carried back to the boats, and the attack goes with him
  const alb = M.alb && g.byId.get(M.alb);
  if (alb && alb.hp > 0 && alb.hp < alb.maxHp * 0.4 && !M.retreat) { soundRetreat(g, 'alb'); }
  // the final assault broken: few left ashore once the last boats have landed
  if (M.finalOn && !M.retreat) {
    const boats = g.units.some(u => u.team === 1 && u.hp > 0 && u.order.t === 'rland' && u.order.s === 'in');
    if (!boats && M.t - WAVES[WAVES.length - 1].at > 30 && M.ashore <= Math.max(3, Math.round(M.peak * 0.2))) soundRetreat(g, 'broken');
  }
  if (M.retreat && !M.won && M.t - M.retreatAt > 12 && !M.cardQ.includes('won') && !M.wonQ) { M.wonQ = true; M.cardQ.push('won'); }
}

/* hand-made map: keep every tree (the main game thins woods on random maps, v0.9.40) */
Game.prototype.openWoods = function () {};
