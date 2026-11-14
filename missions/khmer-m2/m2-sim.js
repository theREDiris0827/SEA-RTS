/* ===== m2-sim.js ===== */
/* ==========================================================================
   Khmer campaign, mission 2: "Where Four Rivers Meet" (1432-34).
   Plan: claude.ai/artifact/EPbXfsimekMqC6qMNGR6Du
   Angkor is emptied. King Ponhea Yat brings the court downriver to Chaktomuk, where the Tonle Sap, the
   Mekong and the Bassac meet. The ground floods every year: found the city on the hill, raise dikes,
   dig the first Baray, win the river villages and hold off raiders from the west.
   The player (team 0) is Khmer; the raiders (team 1) are Ayutthaya, drawn with the game's own art.
   Sim side only (no DOM). Runs after the main game's add-on chapters, so it wraps their functions.
   ========================================================================== */

/* ---------- Things you can tweak (times in seconds) ---------- */
const KM2 = {
  seed: 7,
  start: { food: 250, wood: 520, gold: 220 },     // what the court brings from Angkor
  tcCost: { wood: 250, food: 100 }, tcTime: 40,   // the Preah Reachea Veang (Royal Palace = Town Centre) the court builds
  plainW: 11,                      // the flood plain: land this many tiles or fewer from the rivers (the hill stays dry)
  floodAt: 330,                    // the first flood comes at 5:30
  floodEvery: 260,                 // then one every 4:20
  floodLen: 55,                    // each flood lasts this long
  floodRise: 12,                   // seconds for the water to spread across the plain
  floodWarn: 45,                   // a warning this long before each flood
  floodDmg: 0.012,                 // a flooded building loses this share of its hp each second (55 s: about 2/3)
  wetSpd: 0.6,                     // people walk this fast in flood water
  blessTime: 20,                   // the monks bless a village this long
  villageJoin: 3,                  // farmers who join you from each village won over
  monkBack: 30,                    // if the monks fall, new ones come from the palace after this long
  plotsNeeded: 4,                  // Baray plots to plant
  silt: 1.2,                       // farms on the flood plain gather 20% faster (the river leaves rich silt)
  repairAura: { r: 6, k: 0.5 },    // Ponhea Yat: villagers repairing within 6 tiles of him work 50% faster
  waves: [                         // raiders from the west (K keris, T tombak, A archer, E war elephant)
    { at: 270, easy: 'KKA', normal: 'KKKTAA', hard: 'KKKKTTAA' },
    { at: 600, easy: 'KKKTAA', normal: 'KKKKTTAAAA', hard: 'KKKKKTTTAAAAE' },
    { at: 900, easy: 'KKKKTAAA', normal: 'KKKKKTTTAAAAE', hard: 'KKKKKKTTTTAAAAAEE' }
  ],
  waveWarn: 30,                    // the warning before each wave
  lastEarly: 40                    // with everything else done, the last wave comes within this long
};

const KHM2 = KHM_CIV, RAID = AYU_CIV;
CIVMAP = [KHM2, RAID];
// where things are (tiles, 96 x 72)
const CONF = { x: 55, y: 30 };                       // Chaktomuk: the four arms meet here
const HILL = { x: 41, y: 31, rx: 7.5, ry: 6 };       // the dry rise where Wat Phnom will stand
const TC_SPOT = { x: 39, y: 29 };                    // the suggested palace spot (top-left of 3 x 3)
const LANDING = { x: 49, y: 33 };                    // where the barges put the court ashore
const RAID_FROM = [{ x: 1.5, y: 46.5 }, { x: 1.5, y: 24.5 }, { x: 1.5, y: 60.5 }];
MAPDEF.chaktomuk = { name: 'Chaktomuk', starts: [{ x: TC_SPOT.x, y: TC_SPOT.y }, { x: 3, y: 45 }],
  rivers: [
    [[[CONF.x, CONF.y], [46, 23], [36, 15], [25, 9], [14, 3], [8, -1]], 2.7],     // Tonle Sap, from the great lake (north-west)
    [[[CONF.x, CONF.y], [62, 21], [67, 11], [71, -1]], 3.4],                       // the upper Mekong (north)
    [[[CONF.x, CONF.y], [65, 40], [77, 50], [88, 59], [97, 66]], 3.4],             // the lower Mekong (south-east)
    [[[CONF.x, CONF.y], [54, 42], [50, 54], [47, 64], [45, 73]], 2.4]              // the Bassac (south)
  ],
  fords: [[0, 3], [3, 2], [2, 2]],
  cliffs: [],
  gold: [[20, 36], [30, 58], [78, 22], [62, 60], [16, 14]],
  deer: [[12, 30], [24, 52], [80, 30], [70, 62], [34, 6]],
  villages: [[29, 15], [45, 52]] };

/* ---------- units ---------- */
Object.assign(UD, {
  ponhea: { name: 'King Ponhea Yat', hp: 420, spd: 2.3, atk: 12, bonus: { eleph: 6 }, rng: 0.85, rate: 1.0, ma: 3, pa: 3, sight: 8, cost: {}, time: 0, cls: 'sword', hero: 'ponhea', age: 9, civ: KHM_CIV },
  sangha: { name: 'Monks', hp: 70, spd: 2.0, atk: 0, rng: 0, rate: 1, ma: 0, pa: 1, sight: 6, cost: {}, time: 0, cls: 'monk', age: 9, civ: KHM_CIV }
});
for (const [k, n] of [['ponhea', ['Ponhea Yat']], ['sangha', ['Sangha', 'Monks']]]) { const a = CIV_NAMES[k] = [null, null, null, null, null]; a[3] = n; }
Object.assign(CIV_ROLE, { ponhea: [null, null, null, 'Hero King'], sangha: [null, null, null, 'Monks'] });
// the earth dike: the Khmer palisade line, renamed, and cheap
CIV_NAMES.palisade[3] = ['Thnal', 'Thnal']; CIV_ROLE.palisade = CIV_ROLE.palisade || [null, null, null, null]; CIV_ROLE.palisade[3] = 'Earth Dike';
// the court builds its own palace: the Town Centre can be built here, one only, from the Economy tab
Object.assign(BD.towncentre, { cost: KM2.tcCost, time: KM2.tcTime, one: true });
if (!BUILD_ORDER.includes('towncentre')) BUILD_ORDER.unshift('towncentre');
ECO_BLD.add('towncentre');
// the Baray and the dike in the Economy tab, so everything for the flood sits together
ECO_BLD.add('palisade');

/* ---------- the flood plain ---------- */
// land within plainW tiles of the river, apart from the hill: it floods. Made from the terrain, so never saved.
let plainG = null, plainM = null;
function plainMask(g) {
  if (plainG === g && plainM) return plainM;
  const dist = new Int16Array(W * H).fill(-1), q = [];
  for (let i = 0; i < W * H; i++) if (g.terrain[i] === T.SHALLOW || g.terrain[i] === T.DEEP) { dist[i] = 0; q.push(i); }
  for (let k = 0; k < q.length; k++) {
    const c = q[k], cx = c % W, cy = (c / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = cx + dx, y = cy + dy; if (!g.inb(x, y)) continue; const j = y * W + x;
      if (dist[j] >= 0 || g.terrain[j] > T.SAND) continue;
      dist[j] = dist[c] + 1; if (dist[j] < KM2.plainW + 2) q.push(j);
    }
  }
  const m = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const x = i % W, y = (i / W) | 0;
    if (dist[i] < 1 || dist[i] > KM2.plainW + (hash2(x, y, 61) < 0.5 ? 0 : 1)) continue;
    if (Math.hypot((x + 0.5 - HILL.x) / HILL.rx, (y + 0.5 - HILL.y) / HILL.ry) < 1) continue;
    m[i] = 1;
  }
  plainG = g; plainM = m; return m;
}
function onHill(x, y) { return Math.hypot((x + 0.5 - HILL.x) / HILL.rx, (y + 0.5 - HILL.y) / HILL.ry) < 1; }
// the water's reach in this flood: spreads from the river over the plain, stopped by dikes and walls
let wetG = null, wetD = null, wetAt = -1;
function floodDepth(g) {
  if (wetG === g && wetAt === g.tickN) return wetD;
  const pm = plainMask(g), dike = new Uint8Array(W * H), d = new Int16Array(W * H).fill(-1), q = [];
  for (const b of g.buildings) if (b.hp > 0 && b.done && BD[b.kind].wall) dike[b.ty * W + b.tx] = 1;
  for (let i = 0; i < W * H; i++) {
    if (!pm[i] || dike[i]) continue;
    const x = i % W, y = (i / W) | 0;
    if (g.isWater(x + 1, y) || g.isWater(x - 1, y) || g.isWater(x, y + 1) || g.isWater(x, y - 1)) { d[i] = 0; q.push(i); }
  }
  for (let k = 0; k < q.length; k++) {
    const c = q[k], cx = c % W, cy = (c / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = cx + dx, y = cy + dy; if (!g.inb(x, y)) continue; const j = y * W + x;
      if (d[j] >= 0 || !pm[j] || dike[j]) continue;
      d[j] = d[c] + 1; q.push(j);
    }
  }
  wetG = g; wetD = d; wetAt = g.tickN; return d;
}
// how far the water has spread now (in tiles from the river), 0 when there is no flood
function floodReach(g) {
  const M = g.M; if (!M || !M.flood) return -1;
  const t = M.t - M.floodStart, left = M.floodEnd - M.t;
  return Math.min(t, left, KM2.floodRise) / KM2.floodRise * (KM2.plainW + 2);
}
function isWet(g, x, y) {
  const r = floodReach(g); if (r < 0) return false;
  const d = floodDepth(g)[y * W + x]; return d >= 0 && d <= r;
}
// a building is flooded if water stands on any of its tiles
function bldWet(g, b) {
  if (BD[b.kind].wall || b.kind === 'baray') return false;   // dikes hold the water back; the Baray is meant to hold it
  const r = floodReach(g); if (r < 0) return false;
  const d = floodDepth(g), h = b.h || b.size;
  for (let y = b.ty; y < b.ty + h; y++) for (let x = b.tx; x < b.tx + b.size; x++) { const v = d[y * W + x]; if (v >= 0 && v <= r) return true; }
  return false;
}
// what floods if the river rose now (the preview drawn before each flood)
function wouldFlood(g, b) {
  if (BD[b.kind].wall || b.kind === 'baray') return false;
  const d = floodDepth(g), h = b.h || b.size;
  for (let y = b.ty; y < b.ty + h; y++) for (let x = b.tx; x < b.tx + b.size; x++) if (d[y * W + x] >= 0) return true;
  return false;
}

/* ---------- movement: flood water slows people; the monks never pick fights ---------- */
const _m2step = Game.prototype.stepMove;
Game.prototype.stepMove = function (u, dt) {
  if (u.layer === 0 && this.M && this.M.flood && isWet(this, Math.floor(u.x), Math.floor(u.y))) return _m2step.call(this, u, dt * KM2.wetSpd);
  return _m2step.call(this, u, dt);
};
const _m2idle = Game.prototype.doIdle;
Game.prototype.doIdle = function (u, dt) { if (u.kind === 'sangha') u.scan = 9; return _m2idle.call(this, u, dt); };
// farms under water give nothing
const _m2gi = Game.prototype.gatherInfo;
Game.prototype.gatherInfo = function (o) {
  const g = _m2gi.call(this, o);
  if (g && o && o.isBld && FIELD[o.kind] && this.M) {
    if (this.M.flood && bldWet(this, o)) g.rate = 0.0001;
    else if (plainMask(this)[Math.floor(o.y) * W + Math.floor(o.x)]) g.rate *= KM2.silt;
  }
  return g;
};
// Ponhea Yat: villagers repairing near him work faster
const _m2rep = Game.prototype.doRepair;
Game.prototype.doRepair = function (u, dt) {
  const b = this.byId.get(u.order.id), h0 = b ? b.hp : 0;
  _m2rep.call(this, u, dt);
  if (!b || b.hp <= h0 || u.team !== 0) return;
  const h = heroUnit(this);
  if (h && Math.hypot(h.x - u.x, h.y - u.y) <= KM2.repairAura.r) b.hp = Math.min(b.maxHp, b.hp + (b.hp - h0) * KM2.repairAura.k);
};

/* ---------- the map and the court ---------- */
const _m2pop = Game.prototype.populate;
Game.prototype.populate = function () {
  const g = this, M = g.M = newMission(g);
  _m2pop.call(g);                     // forests, gold, deer, fish and the villages (and skirmish bases, cleared next)
  for (const b of g.buildings) if (b.kind !== 'village') b.hp = 0;
  for (const u of g.units) if (u.team !== 2) u.hp = 0;
  g.cleanup();
  M.villages = g.villages.map(v => v.id);
  for (const v of g.villages) v.rv = true;
  // the hill and the landing: open ground, a few old trees left on the hill
  for (const n of g.nodes) if (n.kind !== 'fish' && (onHill(n.tx, n.ty) && hash2(n.tx, n.ty, 5) < 0.85 || Math.hypot(n.tx - LANDING.x, n.ty - LANDING.y) < 5)) g.removeNode(n);
  for (const n of g.nodes) if (n.kind === 'tree' && RAID_FROM.some(r => Math.hypot(n.tx + 0.5 - r.x, n.ty + 0.5 - r.y) < 4)) g.removeNode(n);
  for (const u of g.units) if (u.team === 2 && u.cls === 'animal' && Math.hypot(u.x - HILL.x, u.y - HILL.y) < 12) u.hp = 0;
  g.cleanup();
  // the court comes ashore
  const put = (kind, x, y) => { const p = g.openSpot(x, y, UD[kind].layer || 0); return g.addUnit(kind, 0, p.x, p.y); };
  const sx = LANDING.x - 1, sy = LANDING.y;
  M.hero = put('ponhea', sx - 2, sy).id;
  for (let i = 0; i < 7; i++) put('villager', sx - 4 + (i % 4), sy + 1 + Math.floor(i / 4));
  for (let i = 0; i < 4; i++) put('sna', sx - 4 + i, sy - 2);
  for (let i = 0; i < 2; i++) put('tombak', sx - 5 + i, sy - 1);
  M.monks = put('sangha', sx - 3, sy + 3).id;
  // the barges they came in, moored at the landing
  for (let i = 0; i < 2; i++) { const w = g.nearestFree(LANDING.x + 2 + i, LANDING.y + i, 1, 6); if (w) g.addUnit('boat', 0, w.x + 0.5, w.y + 0.5); }
  g.age = [2, 2]; g.maxAge = 2;
  for (let i = 0; i < W * H; i++) g.explored[i] = 1;
  plainG = null;
};

/* ---------- mission state ---------- */
function newMission(g) {
  return { t: 0, hero: 0, monks: 0, monkDown: 0, tc: 0, villages: [], won: [], bless: null,
    flood: false, floodStart: 0, floodEnd: 0, floodN: 0, nextFlood: KM2.floodAt, floodHit: [], dryOk: false, lastHit: -1,
    wave: 0, waveSent: 0, raiders: [], nextWave: KM2.waves[0].at, wavesDone: false, warned: {},
    why: null, done: false, ended: false, cardQ: [] };
}
function heroUnit(g) { const u = g.byId.get(g.M.hero); return u && u.hp > 0 ? u : null; }
function monksUnit(g) { const u = g.byId.get(g.M.monks); return u && u.hp > 0 ? u : null; }
function palaceOf(g) { return g.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0) || null; }
function barayOf(g) { return g.buildings.find(b => b.team === 0 && b.kind === 'baray' && b.hp > 0) || null; }
function plotsPlanted(g) {
  const b = barayOf(g); if (!b || !b.done) return 0;
  return barayPlots(b).filter(([x, y]) => g.buildings.some(o => FIELD[o.kind] && o.team === 0 && o.hp > 0 && o.done && o.tx === x && o.ty === y)).length;
}
function raidersLeft(g) { return g.units.filter(u => u.team === 1 && u.hp > 0).length; }

/* ---------- the monks bless a village ---------- */
const _m2cmd = Game.prototype.command;
Game.prototype.command = function (ids, wx, wy, target, opts) {
  if (target && target.isBld && target.kind === 'village' && this.M) {
    const us = ids.map(id => this.byId.get(id)).filter(u => u && u.isUnit && u.hp > 0 && u.team === 0);
    const mk = us.filter(u => u.kind === 'sangha'), rest = us.filter(u => u.kind !== 'sangha');
    for (const m of mk) { m.order = { t: 'bless', id: target.id, w: 0 }; m.path = null; m.wait = 0; }
    if (rest.length) this.groupMove(rest, target.x, target.y + 2.5, opts || {});
    if (mk.length) return;
    if (!rest.length) return;
    return;
  }
  return _m2cmd.call(this, ids, wx, wy, target, opts);
};
Game.prototype.doBless = function (u, dt) {
  const o = u.order, v = this.byId.get(o.id), M = this.M;
  if (!v || v.hp <= 0 || M.won.includes(v.id)) { this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, v.rect) > 1.3) {
    if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, v.rect, 1.0))) { u.wait = 1; return; } }
    if (this.stepMove(u, dt)) u.path = null;
    return;
  }
  u.path = null; u.working = true; u.face = v.x > u.x ? 1 : -1;
  o.w += dt; M.bless = { id: v.id, w: o.w };
  if (o.w >= KM2.blessTime) {
    M.won.push(v.id); M.bless = null;
    for (let i = 0; i < KM2.villageJoin; i++) { const p = this.openSpot(v.x + (i - 1) * 1.1, v.y + 2.2, 0); this.addUnit('villager', 0, p.x, p.y); }
    this.msg('The village takes the blessing. ' + KM2.villageJoin + ' farmers join the new city.');
    this.alerts.push({ x: v.x, y: v.y, t: 3 });
    M.cardQ.push('v-village');
    this.idleOrder(u);
  }
};
const _m2uu = Game.prototype.updateUnit;
Game.prototype.updateUnit = function (u, dt) {
  if (u.order.t === 'bless') {
    u.cd = Math.max(0, u.cd - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
    u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
    u.anim += dt; u.moving = false; u.working = false; this.wt = u.team;
    this.doBless(u, dt);
    return;
  }
  _m2uu.call(this, u, dt);
};

/* ---------- the king and the monks ---------- */
const _m2kill = Game.prototype.onKilled;
Game.prototype.onKilled = function (t, att) {
  _m2kill.call(this, t, att);
  const M = this.M; if (!M || !t.isUnit) return;
  if (t.kind === 'ponhea') M.why = 'hero';
  if (t.kind === 'sangha') { M.monkDown = M.t; this.msg('The monks have fallen. New monks will come from the palace.'); }
};

/* ---------- the raiders ---------- */
function sendWave(g, i) {
  const M = g.M, W0 = KM2.waves[i], kinds = (W0[g.diff] || W0.normal).split('').map(c => ({ K: 'keris', T: 'tombak', A: 'archer', E: 'chang' })[c]), from = RAID_FROM[i % RAID_FROM.length];
  kinds.forEach((k, j) => {
    const p = g.openSpot(from.x + (j % 3) * 1.1, from.y + Math.floor(j / 3) * 1.1 - 1, 0), u = g.addUnit(k, 1, p.x, p.y);
    u.raid = i + 1; M.raiders.push(u.id);
  });
  M.waveSent = i + 1; M.wave = i + 1;
  g.msg('Raiders from the west are coming! (' + (i + 1) + ' of ' + KM2.waves.length + ')');
  g.alerts.push({ x: from.x + 3, y: from.y, t: 4 });
  M.cardQ.push('v-raid');
}
Game.prototype.aiTick = function () { if (this.M) m2AI(this); };
function m2AI(g) {
  // each raider goes for the nearest of your buildings (dikes in the way get broken), fighting what it meets
  const targets = g.buildings.filter(b => b.team === 0 && b.hp > 0 && !BD[b.kind].wall);
  for (const u of g.units) {
    if (u.team !== 1 || u.hp <= 0 || !u.raid) continue;
    const o = u.order;
    if (o.t === 'attack' && g.byId.get(o.id)) continue;
    let goal = null, gd = 1e9;
    for (const b of targets) { const d = Math.hypot(b.x - u.x, b.y - u.y) - (b.kind === 'towncentre' ? 6 : 0); if (d < gd) { gd = d; goal = b; } }
    if (!goal) { const h = heroUnit(g); if (h) goal = h; }
    if (goal && (o.t !== 'amove' || g.t - (u._amT || 0) > 10)) { g.orderAMove(u, goal.x, goal.y); u._amT = g.t; }
  }
}

/* ---------- winning and losing ---------- */
function allDone(g) {
  const M = g.M;
  return !!palaceOf(g) && palaceOf(g).done && M.dryOk && plotsPlanted(g) >= KM2.plotsNeeded && M.won.length >= 2 && M.wavesDone;
}
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (M.why) { this.over = 'lose'; return; }
  if (M.tc && !this.buildings.some(b => b.id === M.tc && b.hp > 0)) { M.why = 'tc'; this.over = 'lose'; return; }
  if (M.won2) this.over = 'win';
};
const _m2upd = Game.prototype.update;
Game.prototype.update = function (dt) {
  _m2upd.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  // the palace: once it stands, the city is founded
  const pal = palaceOf(g);
  if (pal && pal.done && !M.tc) { M.tc = pal.id; M.cardQ.push('v-founded'); g.msg('The Preah Reachea Veang stands. The court has a home again.'); }
  if (pal && !pal.done && !M.warned.tcUp) M.warned.tcUp = true;
  // new monks if they fell
  if (!monksUnit(g) && M.monkDown && M.t - M.monkDown >= KM2.monkBack && M.won.length < 2) {
    const at = pal && pal.done ? g.findSpawn(pal, null, 0) : heroUnit(g);
    if (at) { const p = g.openSpot(at.x, at.y, 0); M.monks = g.addUnit('sangha', 0, p.x, p.y).id; M.monkDown = 0; g.msg('New monks have come to the city.'); }
  }
  // the flood
  if (!M.flood && M.t >= M.nextFlood - KM2.floodWarn && !M.warned['f' + M.floodN]) {
    M.warned['f' + M.floodN] = true;
    g.msg(M.floodN ? 'The river is rising again. Check your dikes!' : 'The river is rising! The blue ground will be under water soon. Raise dikes!');
    M.cardQ.push(M.floodN ? 'v-rise' : 'flood');
  }
  if (!M.flood && M.t >= M.nextFlood) {
    M.flood = true; M.floodStart = M.t; M.floodEnd = M.t + KM2.floodLen; M.floodHit = [];
    g.msg('The flood is here!');
  }
  if (M.flood) {
    for (const b of g.buildings) {
      if (b.team !== 0 || b.hp <= 0 || !bldWet(g, b)) continue;
      if (!M.floodHit.includes(b.id)) M.floodHit.push(b.id);
      b.hp -= b.maxHp * KM2.floodDmg * dt;
      if (b.hp <= 0) { b.hp = 0; g.msg(civName(b.kind, 0) + ' was washed away.'); }
      if ((g.tickN + b.id) % 20 === 0) g.fx.push({ k: 'splash', x: b.x + (g.rng() - 0.5) * b.size, y: b.y + (g.rng() - 0.5) * b.size, t: 0.6, max: 0.6 });
    }
    if (M.t >= M.floodEnd) {
      M.flood = false; M.floodN++; M.nextFlood = M.t + KM2.floodEvery;
      const n = M.floodHit.length, own = g.buildings.some(b => b.team === 0 && !BD[b.kind].wall && (b.done || b.progress > 0));
      M.lastHit = n;
      if (n === 0 && own && pal) { M.dryOk = true; g.msg('The water goes down. Not one building was flooded!'); M.cardQ.push('v-dry'); }
      else g.msg('The water goes down. ' + n + ' building' + (n === 1 ? ' was' : 's were') + ' flooded.');
    }
  }
  // the raiders
  if (M.waveSent < KM2.waves.length) {
    const i = M.waveSent;
    // with everything else done, the last wave comes soon
    if (i === KM2.waves.length - 1 && !raidersLeft(g) && pal && pal.done && M.dryOk && plotsPlanted(g) >= KM2.plotsNeeded && M.won.length >= 2) M.nextWave = Math.min(M.nextWave, M.t + KM2.lastEarly);
    if (!M.warned['w' + i] && M.t >= M.nextWave - KM2.waveWarn) { M.warned['w' + i] = true; g.msg('Scouts see raiders gathering in the west!'); }
    if (M.t >= M.nextWave) { sendWave(g, i); M.nextWave = i + 1 < KM2.waves.length ? Math.max(KM2.waves[i + 1].at, M.t + 120) : 1e9; }
  } else if (!M.wavesDone && !raidersLeft(g)) { M.wavesDone = true; g.msg('The last raiders are beaten!'); }
  // the mission ends when all is done
  if (!M.done && allDone(g)) { M.done = true; M.cardQ.push('closing'); }
}
