/* ===== m3-sim.js ===== */
/* ==========================================================================
   Melaka campaign, mission 3: "Torches in the Mangroves" (c. 1456).
   Plan: claude.ai/artifact/1aAzdAGUK3hP91NcWbTKEx
   A Siamese war fleet anchors off the mangrove coast. Tun Perak has too few ships, so at night his people
   tie torches in the mangrove crowns: the Siamese see lights without end, lose heart and sail home.
   The player (team 0) is Melaka; the fleet (team 1) is Ayutthaya, drawn with the game's own Ayutthaya art.
   Sim side only (no DOM). Runs after the main game's add-on chapters, so it wraps their functions.
   ========================================================================== */

/* ---------- Things you can tweak (times in seconds) ---------- */
const M3 = {
  seed: 5,                         // the Mangrove Delta layout this mission is designed on
  duskLen: 300,                    // phase 1: from the start to nightfall
  fleetIn: 100,                    // the fleet appears this long before nightfall and sails in
  nightMax: 480,                   // if courage still holds after this much night, the fleet attacks in force
  dawnLen: 240,                    // phase 3: the longest the chase can last
  weigh: 30,                       // at dawn each ship takes this long (plus up to 12 s) to weigh anchor before it runs
  fleeSpd: 0.6,                    // the fleeing ships' speed, compared with normal (their crews are worn out)
  courage: 100,                    // Siamese courage at nightfall
  perTorch: 0.05,                  // courage lost each second for every burning torch (8 torches: about 4 minutes)
  regain: 0.2, regainBelow: 3,     // with fewer than 3 torches burning they win back heart, this much a second
  sinkHit: 8,                      // courage lost for every Siamese ship sunk at night
  tieCost: { wood: 40 }, tieTime: 10,   // tying one torch into a mangrove crown
  douseTime: 5,                    // how long Siamese soldiers need beside a torch to put it out
  fleet: { easy: 8, normal: 10, hard: 13 },          // ships in the Siamese fleet (the flagship included)
  landGap: { easy: 90, normal: 60, hard: 45 },       // seconds between landing parties at night
  landN: { easy: 2, normal: 3, hard: 4 },            // soldiers in each landing party
  giftGold: 100, olBoats: 2,       // the Orang Laut village: the gift it wants, and the boats that join you
  scoutAt: 70,                     // when Siamese scouts land at the village
  scoutN: { easy: 2, normal: 3, hard: 4 },
  start: { food: 300, wood: 350, gold: 200 },   // what Tun Perak's camp starts with
  wade: 0.5,                       // speed in shallow water (people only, this mission only)
  nightSight: 0.6,                 // how far everyone sees at night, compared with by day
  torchSight: 4.5                  // a burning torch lights this many tiles around it
};

const MEL3 = 0, SIAM = AYU_CIV;
CIVMAP = [MEL3, SIAM];
// where things are (tiles, on the 96 x 72 Mangrove Delta map, seed 5)
const CAMP = { tx: 44, ty: 25 };                                   // Tun Perak's camp: the Balai (Town Centre)
const LANES = [[29, 32, 40, 57], [49, 52, 43, 58], [64, 67, 47, 58]];   // three lanes cut through the mangroves
const TORCH_AT = [[29, 57], [34, 58], [41, 58], [46, 59], [51, 58], [57, 58], [65, 59], [71, 57]];   // the 8 torch trees, west to east
const EXITS = [{ x: 1.5, y: 70.5 }, { x: 94.5, y: 70.5 }];         // the fleet comes in by both far corners, and flees by the south-east one
const PORT_HINT = { x: 44, y: 41 };                                // near here a Port fits on stilts in the shallows
const VILLAGE_NEAR = [31, 36];                                     // the Orang Laut village on the west bank
const SCOUT_FROM = { x: 1.5, y: 50.5 };

/* ---------- units ---------- */
Object.assign(UD, {
  perak: { name: 'Tun Perak', hp: 340, spd: 2.4, atk: 10, bonus: {}, rng: 0.85, rate: 1.0, ma: 2, pa: 2, sight: 9, cost: {}, time: 0, cls: 'sword', hero: 'perak', aura: { r: 6, atk: 2 }, age: 9, civ: 0 }
});
Object.assign(CIV_NAMES, { perak: [['Tun Perak'], null, null] });
// in 1456 the fleets fight with arrows, boarding and swivel guns: no ship cannon yet
NAVWPN.tierDefault = 1;

/* ---------- the map ---------- */
// people wade through shallow water here (at half speed); boats still sail it
const _m3walk = Game.prototype.walkable;
Game.prototype.walkable = function (x, y, layer) {
  if (layer === 0 && this.M && x >= 0 && y >= 0 && x < W && y < H && this.terrain[y * W + x] === T.SHALLOW) {
    const i = y * W + x; if (this.block[i]) return false;
    return !(this.gate[i] && this.gate[i] - 1 !== this.wt);
  }
  return _m3walk.call(this, x, y, layer);
};
// so the shallows join the land into one piece for searching
Game.prototype.computeRegions = function () {
  const rg = this.region = new Int16Array(W * H); let n = 0;
  const ok = (i) => { const t = this.terrain[i]; return t <= T.SAND || t === T.SHALLOW; };
  for (let i = 0; i < W * H; i++) {
    if (rg[i] || !ok(i)) continue;
    rg[i] = ++n; const q = [i];
    for (let k = 0; k < q.length; k++) {
      const c = q[k], cx = c % W, cy = (c / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = cx + dx, y = cy + dy, j = y * W + x;
        if (!this.inb(x, y) || rg[j] || !ok(j)) continue;
        rg[j] = n; q.push(j);
      }
    }
  }
};
const _m3step = Game.prototype.stepMove;
Game.prototype.stepMove = function (u, dt) {
  if (u.layer === 0 && this.M && this.terrain[Math.floor(u.y) * W + Math.floor(u.x)] === T.SHALLOW) return _m3step.call(this, u, dt * M3.wade);
  return _m3step.call(this, u, dt);
};
// the Port may stand on stilts in the shallows (land or shallow water under its deck, never deep water)
const _m3canPlace = Game.prototype.canPlace;
Game.prototype.canPlace = function (kind, tx, ty, team) {
  if (kind !== 'port' || !this.M) return _m3canPlace.call(this, kind, tx, ty, team);
  const d = BD.port, dh = d.fh || d.size;
  if (tx < 1 || ty < 1 || tx + d.size > W - 1 || ty + dh > H - 1) return false;
  if (this.underPortArt(tx, ty, d.size, dh, kind)) return false;
  let wet = 0;
  for (let y = ty; y < ty + dh; y++) for (let x = tx; x < tx + d.size; x++) {
    const i = y * W + x, t = this.terrain[i];
    if (this.block[i] || this.occ[i] || this.siteMask[i] || t === T.DEEP || t === T.CLIFF) return false;
    if (team === 0 && !this.explored[i]) return false;
    if (t === T.SHALLOW) wet++;
  }
  let water = 0;
  for (let y = ty - 1; y <= ty + dh; y++) for (let x = tx - 1; x <= tx + d.size; x++) {
    if (x >= tx && x < tx + d.size && y >= ty && y < ty + dh) continue;
    if (this.isWater(x, y) && !this.block[y * W + x]) water++;
  }
  return water >= 3;
};
const _m3addB = Game.prototype.addBuilding;
Game.prototype.addBuilding = function (kind, team, tx, ty, done) {
  const b = _m3addB.call(this, kind, team, tx, ty, done);
  if (kind === 'port' && this.isWater(tx + 1, ty)) b.stilts = 1;   // drawn standing on posts
  return b;
};
// torch trees are never cut for wood
const _m3gi = Game.prototype.gatherInfo;
Game.prototype.gatherInfo = function (o) { if (o && o.torch) return null; return _m3gi.call(this, o); };
// a hand-made map: keep every tree
Game.prototype.openWoods = function () {};

const _m3pop = Game.prototype.populate;
Game.prototype.populate = function () {
  const g = this, M = g.M = newMission(g);
  _m3pop.call(g);                     // the Mangrove Delta: mangroves, fruit, wild animals (and skirmish bases, cleared next)
  for (const b of g.buildings) if (b.kind !== 'village') b.hp = 0;
  for (const u of g.units) if (u.team !== 2) u.hp = 0;
  g.cleanup();
  // one Orang Laut village stays: the one on the west bank
  let keep = null, kd = 1e9;
  for (const v of g.villages) { const d = Math.hypot(v.x - VILLAGE_NEAR[0], v.y - VILLAGE_NEAR[1]); if (d < kd) { kd = d; keep = v; } }
  for (const v of g.villages) if (v !== keep) { v.hp = 0; for (let y = v.site.ty; y < v.site.ty + 3; y++) for (let x = v.site.tx; x < v.site.tx + 3; x++) g.siteMask[y * W + x] = 0; }
  g.cleanup(); g.villages = keep ? [keep] : [];
  if (keep) { keep.ol = true; M.village = keep.id; }
  // the lanes: mangroves cleared from the camp down to the coast
  for (const n of g.nodes) if (n.kind === 'tree' && LANES.some(([x0, x1, y0, y1]) => n.tx >= x0 && n.tx <= x1 && n.ty >= y0 && n.ty <= y1)) g.removeNode(n);
  // the camp: a cleared rise in the middle of the dry land
  for (const n of g.nodes) if (n.kind !== 'fish' && Math.abs(n.tx - CAMP.tx - 1) < 7 && Math.abs(n.ty - CAMP.ty - 1) < 6) g.removeNode(n);
  for (const u of g.units) if (u.team === 2 && Math.hypot(u.x - CAMP.tx, u.y - CAMP.ty) < 9) u.hp = 0;
  g.cleanup();
  for (let y = CAMP.ty - 1; y < CAMP.ty + 4; y++) for (let x = CAMP.tx - 1; x < CAMP.tx + 4; x++) if (g.inb(x, y) && g.terrain[y * W + x] > T.SAND) g.terrain[y * W + x] = T.GRASS;
  const tc = g.addBuilding('towncentre', 0, CAMP.tx, CAMP.ty, true); M.tc = tc.id;
  for (const [dx, dy] of [[-4, 0], [4, 0], [-4, 3], [4, 3], [-3, -3], [4, -3], [0, -4]]) if (g.canPlace('house', CAMP.tx + dx, CAMP.ty + dy, 2)) { g.addBuilding('house', 0, CAMP.tx + dx, CAMP.ty + dy, true); if (g.buildings.filter(b => b.kind === 'house').length >= 4) break; }
  // the torch trees: real mangroves on mud hummocks at the sea's edge
  M.torches = [];
  for (const [x, y] of TORCH_AT) {
    let best = null, bd = 1e9;
    for (let ty = y - 3; ty <= y + 2; ty++) for (let tx = x - 2; tx <= x + 2; tx++) {
      if (!g.inb(tx, ty)) continue; const t = g.terrain[ty * W + tx];
      if (t === T.DEEP || t === T.CLIFF || g.block[ty * W + tx] && !g.nodes.some(n => n.tx === tx && n.ty === ty && n.kind === 'tree')) continue;
      const d = Math.hypot(tx - x, ty - y); if (d < bd) { bd = d; best = { tx, ty }; }
    }
    if (!best) continue;
    let n = g.nodes.find(o => o.tx === best.tx && o.ty === best.ty && o.hp > 0);
    if (n && n.kind !== 'tree') { g.removeNode(n); g.cleanup(); n = null; }
    if (!n) { g.terrain[best.ty * W + best.tx] = T.DIRT; n = g.addNode('tree', best.tx, best.ty); }
    n.torch = { lit: 0, i: M.torches.length }; M.torches.push(n.id);
  }
  // Tun Perak and his people
  const put = (kind, x, y) => { const p = g.openSpot(x, y, UD[kind].layer || 0); return g.addUnit(kind, 0, p.x, p.y); };
  const sx = CAMP.tx + 1.5, sy = CAMP.ty + 4.5;
  M.hero = put('perak', sx, sy).id;
  for (let i = 0; i < 6; i++) put('villager', sx - 3 + (i % 3), sy + 1 + Math.floor(i / 3));
  for (let i = 0; i < 4; i++) put('keris', sx + 2 + i, sy + 1);
  for (let i = 0; i < 4; i++) put('tombak', sx + 2 + i, sy + 2);
  for (let i = 0; i < 3; i++) put('archer', sx + 2 + i, sy + 3);
  g.res[0] = { food: 200, wood: 260, gold: 160 };
  g.res[1] = { food: 0, wood: 0, gold: 0 };
  g.maxAge = 2;
  for (let i = 0; i < W * H; i++) g.explored[i] = 1;
  // the suggested Port spot: on stilts in the shallows, as close to the camp's coast as it fits
  let ps = null, pd = 1e9;
  for (let y = PORT_HINT.y - 8; y <= PORT_HINT.y + 8; y++) for (let x = PORT_HINT.x - 10; x <= PORT_HINT.x + 10; x++) {
    if (!g.canPlace('port', x, y, 0)) continue;
    let wet = 0; for (let k = 0; k < 3; k++) if (g.terrain[y * W + x + k] === T.SHALLOW) wet++;
    if (wet < 2) continue;
    const d = Math.hypot(x + 1.5 - PORT_HINT.x, y - PORT_HINT.y); if (d < pd) { pd = d; ps = { x, y }; }
  }
  M.portSpot = ps;
};

/* ---------- mission state ---------- */
function newMission(g) {
  return { t: 0, phase: 1, phaseAt: [0, 0, 0, 0], cardQ: [], hero: 0, tc: 0, village: 0, ol: 'open', torches: [],
    courage: M3.courage, fleetOn: false, fleet: [], nextLand: 1e9, assault: false, flee: false, dawnEnd: 0,
    sunk: 0, chaseSunk: 0, escaped: 0, flagSunk: false, tied: 0, doused: 0, landings: 0, scouts: [], scoutsOn: false,
    byForce: false, won: false, why: null, ended: false, warned: {} };
}
function heroUnit(g) { const u = g.byId.get(g.M.hero); return u && u.hp > 0 ? u : null; }
function torchNodes(g) { return g.M.torches.map(id => g.byId.get(id)).filter(n => n && n.hp > 0); }
function litTorches(g) { return torchNodes(g).filter(n => n.torch.lit); }
function fleetShips(g) { return g.units.filter(u => u.team === 1 && u.hp > 0 && u.layer === 1 && u.fleet); }
function isNight(g) { return g.M && g.M.phase === 2; }

/* ---------- night: everyone sees less, burning torches light the shore ---------- */
const _m3fog = Game.prototype.updateFog;
Game.prototype.updateFog = function () {
  if (!this.M || this.M.phase !== 2) return _m3fog.call(this);
  this.fogV = (this.fogV || 0) + 1;
  this.visible.fill(0);
  const reveal = (x, y, r) => {
    const r2 = r * r, x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(W - 1, Math.ceil(x + r));
    const y0 = Math.max(0, Math.floor(y - r)), y1 = Math.min(H - 1, Math.ceil(y + r));
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) { const dx = tx + 0.5 - x, dy = ty + 0.5 - y; if (dx * dx + dy * dy <= r2) { this.visible[ty * W + tx] = 1; this.explored[ty * W + tx] = 1; } }
  };
  const k = M3.nightSight;
  for (const u of this.units) if (u.team === 0 && u.hp > 0) reveal(u.x, u.y, Math.max(2.5, u.sight * k));
  for (const b of this.buildings) if (b.team === 0 && b.hp > 0) reveal(b.x, b.y, Math.max(2.5, ((BD[b.kind].sight || 4) + (b.done ? 0 : -1)) * k));
  for (const n of litTorches(this)) reveal(n.tx + 0.5, n.ty + 0.5, M3.torchSight);
};

/* ---------- tying a torch: a villager wades out to a torch tree ---------- */
const _m3cmd = Game.prototype.command;
Game.prototype.command = function (ids, wx, wy, target, opts) {
  if (target && target.isNode && target.torch && this.M) {
    const us = ids.map(id => this.byId.get(id)).filter(u => u && u.isUnit && u.hp > 0 && u.team === 0);
    const vil = us.filter(u => u.cls === 'vil'), rest = us.filter(u => u.cls !== 'vil');
    if (vil.length) { const v = vil.sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y))[0]; v.order = { t: 'torch', id: target.id, w: 0 }; v.path = null; v.wait = 0; for (const o of vil) if (o !== v) rest.push(o); }
    if (rest.length) this.groupMove(rest, target.x + 0.5, target.y - 1, opts || {});
    return;
  }
  return _m3cmd.call(this, ids, wx, wy, target, opts);
};
Game.prototype.doTorch = function (u, dt) {
  const o = u.order, n = this.byId.get(o.id), M = this.M;
  if (!n || n.hp <= 0 || n.torch.lit) { this.idleOrder(u); return; }
  if (M.phase !== 2) { if (u.team === 0 && !o.told) { o.told = true; this.msg('Torches are tied at nightfall, so the Siamese see them all light up at once.'); } this.idleOrder(u); return; }
  if (rectDist(u.x, u.y, n.rect) > 1.25) {
    if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, n.rect, 0.9))) { u.wait = 1; return; } }
    if (this.stepMove(u, dt)) u.path = null;
    return;
  }
  u.path = null;
  if (!o.paid) {
    if (!this.canAfford(u.team, M3.tieCost)) { this.msg('A torch needs ' + M3.tieCost.wood + ' wood.'); this.idleOrder(u); return; }
    this.pay(u.team, M3.tieCost); o.paid = true;
  }
  u.working = true; u.face = n.tx + 0.5 > u.x ? 1 : -1;
  o.w += dt;
  if (o.w >= M3.tieTime) {
    n.torch.lit = 1; n.torch.at = M.t; M.tied++;
    const lit = litTorches(this).length;
    this.msg('A torch burns in the mangroves (' + lit + ' of ' + M.torches.length + ').');
    this.idleOrder(u);
  }
};
const _m3uu = Game.prototype.updateUnit;
Game.prototype.updateUnit = function (u, dt) {
  const t = u.order.t;
  if (t === 'torch' || t === 'rland' || t === 'flee2') {
    u.cd = Math.max(0, u.cd - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
    u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
    u.anim += dt; u.moving = false; u.working = false; this.wt = u.team;
    if (t === 'torch') this.doTorch(u, dt); else if (t === 'rland') this.doRaidLand(u, dt); else this.doRetreat(u, dt);
    return;
  }
  _m3uu.call(this, u, dt);
};
// a Siamese boat rows in to the shore, puts its men ashore, and rows back to its anchor
Game.prototype.doRaidLand = function (u, dt) {
  const o = u.order;
  o.tt = (o.tt || 0) + dt;
  const gx = o.s === 'in' ? o.x : o.sx, gy = o.s === 'in' ? o.y : o.sy;
  if (Math.hypot(u.x - gx, u.y - gy) < (o.s === 'in' ? 1.6 : 1.5) || o.tt > 70) {
    u.path = null;
    if (o.s === 'in') { m3Unload(this, u, o); o.s = 'out'; o.tt = 0; }
    else { this.idleOrder(u); }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, gx, gy))) { u.wait = 1; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
function m3Unload(g, boat, o) {
  const M = g.M, ids = [];
  for (const k of o.troops) {
    const p = g.openSpot(boat.x, boat.y, 0), u = g.addUnit(k, 1, p.x, p.y);
    u.douse = o.torch || 0; u.raid = o.what || 'torch'; ids.push(u.id);
    if (o.what === 'village') { u.guard = { x: o.gx, y: o.gy, r: 6 }; M.scouts.push(u.id); }
    else if (o.what === 'camp') { const tc = g.byId.get(M.tc); if (tc) { g.orderAMove(u, tc.x, tc.y); u._amT = g.t; } }
  }
  o.troops = [];
  if (o.what === 'village') { g.msg('Siamese scouts have landed at the Orang Laut village!'); }
  else if (o.what === 'camp') { g.msg('Siamese soldiers are wading ashore!'); }
  else g.msg('A Siamese landing party is wading in to put out the torches!');
  g.alerts.push({ x: boat.x, y: boat.y, t: 3 });
}
Game.prototype.doRetreat = function (u, dt) {
  const o = u.order;
  if (Math.hypot(u.x - o.x, u.y - o.y) < 2.5 || (o.tt = (o.tt || 0) + dt) > 45) { u.hp = 0; u.silent = true; if (u.layer === 1 && u.fleet) this.M.escaped++; return; }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, o.x, o.y))) { u.wait = 1; return; } }
  if (this.stepMove(u, u.fleet ? dt * M3.fleeSpd : dt)) u.path = null;
};

/* ---------- combat: Tun Perak's aura; ships sunk break the Siamese heart ---------- */
const _m3dmg = Game.prototype.damage;
Game.prototype.damage = function (att, tgt, w) {
  if (!att || !att.isUnit || w || !tgt || tgt.hp <= 0) return _m3dmg.apply(this, arguments);
  const plus = this.auraFor(att);
  if (!plus) return _m3dmg.apply(this, arguments);
  const a0 = att.atk; att.atk = Math.round(a0 + plus); try { return _m3dmg.apply(this, arguments); } finally { att.atk = a0; }
};
Game.prototype.auraFor = function (u) {
  let best = 0;
  for (const h of this.heroes || []) {
    if (h === u || h.team !== u.team || h.hp <= 0) continue;
    const A = UD[h.kind].aura; if (A && Math.hypot(h.x - u.x, h.y - u.y) <= A.r && A.atk > best) best = A.atk;
  }
  return best;
};
const _m3kill = Game.prototype.onKilled;
Game.prototype.onKilled = function (t, att) {
  _m3kill.call(this, t, att);
  const M = this.M; if (!M || !t.isUnit) return;
  if (t.kind === 'perak') M.why = 'hero';
  if (t.team === 1 && t.layer === 1 && t.fleet) {
    M.sunk++;
    if (M.phase === 2) { M.courage = Math.max(0, M.courage - M3.sinkHit); }
    if (M.phase === 3) M.chaseSunk++;
    if (t.kind === 'flagship') { M.flagSunk = true; this.msg('Awi Dichu\'s flagship goes down!'); }
  }
};

/* ---------- the fleet ---------- */
function spawnFleet(g) {
  const M = g.M, n = M3.fleet[g.diff] || 10;
  const kinds = ['flagship'];
  const galleys = Math.max(2, Math.round((n - 1) * 0.4));
  for (let i = 0; i < galleys; i++) kinds.push('galley');
  while (kinds.length < n) kinds.push('light');
  // anchors spread along the deep water offshore
  const anchors = [];
  for (let i = 0; i < n; i++) {
    const ax = 12 + (72 * (i + 0.5)) / n, ay = 68 + (i % 3);   // far enough out (10+ tiles) that their arrows can't reach the torches
    const w = g.nearestFree(ax, ay, 1, 5); anchors.push({ x: w.x + 0.5, y: w.y + 0.5 });
  }
  // the flagship anchors in the middle, the galleys beside it
  const order = anchors.map((a, i) => i).sort((a, b) => Math.abs(anchors[a].x - 48) - Math.abs(anchors[b].x - 48));
  kinds.forEach((k, j) => {
    const A = anchors[order[j]], E = A.x < 48 ? EXITS[0] : EXITS[1];
    const p = g.openSpot(E.x + (E.x < 48 ? 1 : -1) * (j % 3), E.y - Math.floor(j / 3) * 0.9, 1), u = g.addUnit(k, 1, p.x, p.y);
    u.fleet = true; u.anchor = A; if (k === 'flagship') { u.flag = true; M.flag = u.id; }
    g.orderMove(u, A.x, A.y);
    M.fleet.push(u.id);
  });
  M.fleetOn = true;
  g.msg('Sails on the horizon: the Siamese fleet is coming in!');
  g.alerts.push({ x: EXITS[0].x + 4, y: EXITS[0].y - 2, t: 3 }); g.alerts.push({ x: EXITS[1].x - 4, y: EXITS[1].y - 2, t: 3 });
}
function landKinds(g) {
  const n = M3.landN[g.diff] || 4, out = [];
  for (let i = 0; i < n; i++) out.push(['keris', 'tombak', 'keris', 'archer', 'tombak'][i % 5]);
  return out;
}
// send a galley to put a party ashore by a torch (or, in the assault, by the camp)
function sendLanding(g, what) {
  const M = g.M, galleys = fleetShips(g).filter(u => u.kind === 'galley' && u.order.t !== 'rland' && !u.fleeing);
  if (!galleys.length) return false;
  let tgt = null, tx, ty;
  if (what === 'camp') { const tc = g.byId.get(M.tc); const ts = torchNodes(g).sort((a, b) => Math.hypot(a.x - (tc ? tc.x : 48), a.y - 30) - Math.hypot(b.x - (tc ? tc.x : 48), b.y - 30)); tgt = ts[Math.floor(g.rng() * Math.min(3, ts.length))]; }
  else { const lit = litTorches(g); if (!lit.length) return false; tgt = lit[Math.floor(g.rng() * lit.length)]; }
  if (!tgt) return false;
  const boat = galleys.sort((a, b) => Math.hypot(a.x - tgt.x, a.y - tgt.y) - Math.hypot(b.x - tgt.x, b.y - tgt.y))[0];
  // the boat comes as close as the water lets it, a few tiles off the torch tree
  let best = null, bd = 1e9;
  for (let y = tgt.ty - 4; y <= tgt.ty + 4; y++) for (let x = tgt.tx - 4; x <= tgt.tx + 4; x++) {
    if (!g.walkable(x, y, 1)) continue; const d = Math.hypot(x - tgt.tx, y - tgt.ty); if (d < 2 || d >= bd) continue; bd = d; best = { x: x + 0.5, y: y + 0.5 };
  }
  if (!best) return false;
  tx = best.x; ty = best.y;
  const troops = what === 'camp' ? landKinds(g).concat(landKinds(g).slice(0, 2)) : landKinds(g);
  boat.order = { t: 'rland', x: tx, y: ty, sx: boat.anchor.x, sy: boat.anchor.y, troops, torch: what === 'camp' ? 0 : tgt.id, what, s: 'in' }; boat.path = null;
  M.landings++;
  return true;
}
// the scouts' boat to the Orang Laut village
function sendScouts(g) {
  const M = g.M, v = g.byId.get(M.village); if (!v) return;
  const site = v.site, wx = site.tx + 1.5, wy = site.ty + 1.5;
  let best = null, bd = 1e9;
  for (let y = site.ty - 3; y <= site.ty + 6; y++) for (let x = site.tx - 3; x <= site.tx + 6; x++) { if (!g.walkable(x, y, 1)) continue; const d = Math.hypot(x - wx, y - wy); if (d < bd) { bd = d; best = { x: x + 0.5, y: y + 0.5 }; } }
  if (!best) return;
  const p = g.openSpot(SCOUT_FROM.x, SCOUT_FROM.y, 1), b = g.addUnit('galley', 1, p.x, p.y);
  const troops = []; for (let i = 0; i < (M3.scoutN[g.diff] || 3); i++) troops.push(i % 3 === 2 ? 'archer' : 'keris');
  b.scoutBoat = true;
  b.order = { t: 'rland', x: best.x, y: best.y, sx: SCOUT_FROM.x, sy: SCOUT_FROM.y, troops, what: 'village', gx: v.x, gy: v.y, s: 'in' };
  M.scoutsOn = true; M.scoutBoat = b.id;
}
// the Orang Laut join Melaka: by a gift, or because you drove the scouts off
Game.prototype.olJoin = function (how) {
  const M = this.M; if (!M || M.ol === 'joined') return 'The Orang Laut already sail with you.';
  if (how === 'gift') { if (!this.canAfford(0, { gold: M3.giftGold })) return 'The headman asks ' + M3.giftGold + ' gold.'; this.pay(0, { gold: M3.giftGold }); }
  M.ol = 'joined'; M.olHow = how;
  const v = this.byId.get(M.village);
  if (v) for (let i = 0; i < M3.olBoats; i++) { const w = this.nearestFree(v.site.tx + 1 + i, v.site.ty + 3, 1, 6), u = this.addUnit('light', 0, w.x + 0.5, w.y + 0.5); u.ol = true; }
  this.msg(how === 'gift' ? 'The Orang Laut take the gift. Two of their boats join Tun Perak.' : 'The scouts are driven off! The Orang Laut send two boats to fight beside you.');
  M.cardQ.push('v-ol');
  if (v) this.alerts.push({ x: v.x, y: v.y, t: 3 });
  return null;
};

/* ---------- the fleet's AI ---------- */
Game.prototype.aiTick = function () { if (this.M) m3AI(this); };
function m3AI(g) {
  const M = g.M, lit = litTorches(g);
  for (const u of g.units) {
    if (u.team !== 1 || u.hp <= 0) continue;
    const o = u.order;
    if (o.t === 'flee2' || o.t === 'rland') continue;
    if (u.layer === 1) {
      if (u.scoutBoat) { u.order = { t: 'flee2', x: SCOUT_FROM.x, y: SCOUT_FROM.y }; u.path = null; continue; }
      if (u.fleeing || !u.anchor) continue;
      if (o.t === 'move' && Math.hypot(u.x - u.anchor.x, u.y - u.anchor.y) > 3 && !M.assault) continue;   // still sailing in
      if (M.assault && !u.flag && u.kind === 'light') {
        if (o.t === 'attack' && g.byId.get(o.id)) continue;
        const port = g.buildings.find(b => b.team === 0 && b.kind === 'port' && b.hp > 0);
        const goal = port || g.byId.get(M.tc);
        if (goal && (o.t !== 'amove' || g.t - (u._amT || 0) > 15)) { g.orderAMove(u, goal.x, goal.y + 2); u._amT = g.t; }
        continue;
      }
      // at anchor: chase off any ship that comes close, then come back
      if (o.t === 'attack' && g.byId.get(o.id) && Math.hypot(u.x - u.anchor.x, u.y - u.anchor.y) < 10) continue;
      let foe = null, fd = 7.5;
      for (const v of g.units) if (v.team === 0 && v.hp > 0 && v.layer === 1) { const d = Math.hypot(v.x - u.anchor.x, v.y - u.anchor.y); if (d < fd) { fd = d; foe = v; } }
      if (foe) g.orderAttack(u, foe);
      else if (Math.hypot(u.x - u.anchor.x, u.y - u.anchor.y) > 1.5 && o.t !== 'move') g.orderMove(u, u.anchor.x, u.anchor.y);
      continue;
    }
    // soldiers on land
    if (u.guard) {
      if (o.t === 'attack' && g.byId.get(o.id) && Math.hypot(u.x - u.guard.x, u.y - u.guard.y) < u.guard.r + 4) continue;
      let foe = null, fd = u.guard.r;
      for (const v of g.units) if (v.team === 0 && v.hp > 0 && v.layer === 0) { const d = Math.hypot(v.x - u.guard.x, v.y - u.guard.y); if (d < fd) { fd = d; foe = v; } }
      if (foe) g.orderAttack(u, foe); else if (Math.hypot(u.x - u.guard.x, u.y - u.guard.y) > 2 && o.t !== 'move') g.orderMove(u, u.guard.x + (u.id % 3) - 1, u.guard.y + 2);
      continue;
    }
    if (o.t === 'attack' && g.byId.get(o.id)) continue;
    if (u.raid === 'camp' || !lit.length) {
      const tc = g.byId.get(M.tc);
      if (tc && (o.t !== 'amove' || g.t - (u._amT || 0) > 12)) { g.orderAMove(u, tc.x, tc.y); u._amT = g.t; }
      continue;
    }
    // the torch party: the torch it came for, or the nearest one still burning
    let n = u.douse ? g.byId.get(u.douse) : null;
    if (!n || !n.torch || !n.torch.lit) { n = lit.slice().sort((a, b) => Math.hypot(a.x - u.x, a.y - u.y) - Math.hypot(b.x - u.x, b.y - u.y))[0]; u.douse = n.id; }
    const d = Math.hypot(n.tx + 0.5 - u.x, n.ty + 0.5 - u.y);
    if (d > 1.7 && (o.t !== 'amove' || g.t - (u._amT || 0) > 8)) { g.orderAMove(u, n.tx + 0.5 + ((u.id % 3) - 1) * 0.7, n.ty + 0.5 + 0.8); u._amT = g.t; }
  }
}

/* ---------- winning and losing ---------- */
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (M.why) { this.over = 'lose'; return; }
  if (!this.buildings.some(b => b.id === M.tc && b.hp > 0)) { M.why = 'tc'; this.over = 'lose'; return; }
  if (M.won) this.over = 'win';
};
const _m3upd = Game.prototype.update;
Game.prototype.update = function (dt) {
  this.heroes = this.units.filter(u => u.hp > 0 && UD[u.kind].aura);
  _m3upd.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};
function setPhase(g, n) {
  const M = g.M; if (M.phase >= n) return;
  M.phase = n; M.phaseAt[n] = M.t;
  if (n === 2) {
    M.cardQ.push('night'); M.nextLand = M.t + 40;
    g.msg('Night falls. Tie torches in the marked mangroves!');
  }
  if (n === 3) {
    M.flee = true; M.dawnEnd = M.t + M3.dawnLen;
    for (const u of g.units) if (u.team === 1 && u.hp > 0) {
      // the ships weigh anchor (it takes a while), then the whole fleet runs south-east, towards Singapura
      if (u.layer === 1) { u.fleeing = true; u.weigh = M.t + M3.weigh + g.rng() * 12; if (u.order.t === 'rland') { u.order = { t: 'idle' }; u.path = null; } }
      else { const E = u.x < 48 ? EXITS[0] : EXITS[1]; u.order = { t: 'flee2', x: E.x, y: E.y - 6 }; u.path = null; }
    }
    M.cardQ.push(M.byForce ? 'force' : 'dawn');
    g.msg(M.byForce ? 'The Siamese fleet is broken!' : 'Dawn: the Siamese have lost heart. Their fleet turns for home. Chase it!');
  }
}
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  // Orang Laut: drive off the scouts and they join you
  if (M.scoutsOn && M.ol !== 'joined' && M.scouts.length && M.scouts.every(id => { const u = g.byId.get(id); return !u || u.hp <= 0; })) { M.scoutsOn = false; g.olJoin('fight'); }
  if (M.ol === 'joined') for (const id of M.scouts) { const u = g.byId.get(id); if (u && u.hp > 0 && u.guard && u.guard.r < 9) { delete u.guard; } }
  if (M.phase === 1) {
    if (!M.scoutSent && M.t >= M3.scoutAt && M.ol !== 'joined') { M.scoutSent = true; sendScouts(g); }
    if (!M.fleetOn && M.t >= M3.duskLen - M3.fleetIn) spawnFleet(g);
    if (M.t >= M3.duskLen - 20 && !M.warned.dusk) { M.warned.dusk = true; g.msg('The sun is setting. Have villagers ready by the mangroves.'); }
    if (M.t >= M3.duskLen) setPhase(g, 2);
  }
  if (M.phase === 2) {
    const nl = litTorches(g).length, nightT = M.t - M.phaseAt[2];
    M.courage -= nl * M3.perTorch * dt;
    if (nl < M3.regainBelow) M.courage = Math.min(M3.courage, M.courage + M3.regain * dt);
    // landing parties come for the torches
    if (M.t >= M.nextLand) {
      if (M.assault ? sendLanding(g, 'camp') : sendLanding(g, 'torch')) M.nextLand = M.t + (M3.landGap[g.diff] || 60) * (M.assault ? 0.8 : 1);
      else M.nextLand = M.t + 8;
    }
    // a party beside a burning torch puts it out
    for (const u of g.units) {
      if (u.team !== 1 || u.hp <= 0 || u.layer !== 0 || !u.douse) continue;
      const n = g.byId.get(u.douse);
      if (!n || !n.torch || !n.torch.lit) { u.dT = 0; continue; }
      if (Math.hypot(n.tx + 0.5 - u.x, n.ty + 0.5 - u.y) < 1.8) {
        u.dT = (u.dT || 0) + dt;
        if (u.dT >= M3.douseTime) { n.torch.lit = 0; n.torch.out = M.t; u.dT = 0; M.doused++; g.msg('Siamese soldiers have put out a torch!'); g.alerts.push({ x: n.tx + 0.5, y: n.ty + 0.5, t: 3 }); }
      } else u.dT = 0;
    }
    // too long: the Siamese come in to fight
    if (!M.assault && nightT >= M3.nightMax && M.courage > 0) {
      M.assault = true; M.nextLand = M.t + 2; M.cardQ.push('v-assault');
      g.msg('The Siamese grow tired of waiting. Their ships come in to attack!');
    }
    if (M.courage <= 20 && !M.warned.low) { M.warned.low = true; g.msg('The Siamese are wavering! Get your Penjajap ready to chase them.'); }
    if (M.courage <= 0) { M.courage = 0; setPhase(g, 3); }
  }
  // by force: the whole fleet sunk
  if (M.fleetOn && M.phase < 3 && M.fleet.length && !fleetShips(g).length) { M.byForce = true; M.courage = 0; setPhase(g, 3); }
  if (M.phase === 3) for (const u of g.units) if (u.fleeing && u.hp > 0 && u.order.t !== 'flee2' && M.t >= u.weigh) { const E = EXITS[1]; u.order = { t: 'flee2', x: E.x, y: E.y, tt: -9999 }; u.path = null; }
  if (M.phase === 3 && !M.ended && (M.t >= M.dawnEnd || !g.units.some(u => u.team === 1 && u.hp > 0 && u.layer === 1 && u.fleet))) {
    M.ended = true; M.cardQ.push('closing');
  }
}
