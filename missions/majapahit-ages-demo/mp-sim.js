/* ===== mp-sim.js ===== */
/* ==========================================================================
   Majapahit demo: "Rise of Majapahit", a raid-defence sandbox with ages (same frame as Rise of Melaka).
   A Javanese village (Wanua) grows to the empire of the Palapa oath (Nusantara) while raids come
   by land and sea. The player (team 0) is Majapahit: the main game's civ picks go through CV().
   Sim side only (no DOM): ages, units, raids, the raiders' AI, landings and heroes.
   ========================================================================== */

const DMUL = { easy: 0.7, normal: 1, hard: 1.3 };
const HERO_BACK = 60;                           // a fallen hero is carried home and returns this many seconds later
const AGE_SPEEDUP = 45;                          // ageing up brings the next raid this close, if it was further off

/* ---------- the ages (lore/ages.md, Old Javanese names) ----------
   This mission stops at the Kingdom Age: 1293-1336 is Majapahit's founding, before the guns, the trade
   empire and Hayam Wuruk's golden age. The later ages are kept in the table for later missions. */
const AGES = [null,
  { n: 1, name: 'Village Age', local: 'Wanua', tc: 1200 },
  { n: 2, name: 'Kingdom Age', local: 'Kadatwan', cost: { food: 500 }, time: 60, tc: 1700,
    need: { any: ['barracks', 'store', 'granary', 'port', 'tradepost'], n: 2, text: '2 of: Barracks, Gudang, Lumbung, Port, Bandar' } },
  { n: 3, name: 'Age of Commerce', local: 'Bandar', cost: { food: 800, gold: 200 }, time: 90, tc: 2200,
    need: { any: ['palace', 'patirthan', 'tower', 'tradepost'], n: 2, text: '2 of: Kraton, Patirthan, Bale Kulkul, Bandar' } },
  { n: 4, name: 'Golden Age', local: 'Nusantara', cost: { food: 1000, gold: 800 }, time: 120, tc: 2800,
    need: { all: ['palace', 'tradepost'], text: 'a Kraton and a Bandar (tribute post)' } }
];
const MAX_AGE = 2;
AGES.length = MAX_AGE + 1;

/* ---------- units ----------
   The kind keys are shared with the Melaka ages demo (pembedil, bediraja, meriam, tuah, perak) so the
   ageing code stays the same; names and art are Majapahit's. */
Object.assign(UD, {
  // Majapahit: the archer line takes up the bedil in the Age of Commerce
  pembedil: { name: 'Bedil Gunner', hp: 38, spd: 2.2, atk: 10, bonus: { sword: 2, eleph: 6 }, rng: 5.5, rate: 2.2, ma: 0, pa: 1, sight: 7.5, cost: { wood: 40, gold: 45 }, time: 11, cls: 'archer', ranged: true, gun: true, pierce: 2, age: 3, maxAge: 3, civ: 1 },
  bediraja: { name: 'Cetbang Handgunner', hp: 46, spd: 2.1, atk: 15, bonus: { sword: 3, eleph: 10 }, rng: 6.5, rate: 2.8, ma: 1, pa: 2, sight: 8, cost: { wood: 45, gold: 70 }, time: 13, cls: 'archer', ranged: true, gun: true, pierce: 3, age: 4, civ: 1 },
  meriam: { name: 'Cetbang (Bronze cannon)', hp: 140, spd: 1.5, atk: 18, rng: 7.5, rate: 4.5, ma: 2, pa: 5, sight: 8.5, cost: { wood: 150, gold: 120 }, time: 22, cls: 'siege', ranged: true, gun: true, cap: 3, splash: 1.1, bld: 40, age: 3, civ: 1 },
  tuah: { name: 'Gajah Mada', hp: 450, spd: 2.6, atk: 16, bonus: { elite: 6, eleph: 10 }, rng: 0.85, rate: 0.9, ma: 3, pa: 3, sight: 8, cost: { food: 200, gold: 150 }, time: 25, cls: 'elite', hero: 'tuah', art: 'gajahmada', aura: { r: 5, atk: 2 }, cap: 1, age: 2, civ: 1 },
  perak: { name: 'Tribhuwana', hp: 320, spd: 2.4, atk: 10, bonus: {}, rng: 0.85, rate: 1.0, ma: 2, pa: 2, sight: 9, cost: {}, time: 0, cls: 'sword', hero: 'perak', art: 'tribhuwana', aura: { r: 6, atk: 2 }, age: 9, civ: 1 },
  // Kediri: Jayakatwang's Javanese soldiers (the game's Majapahit drawing in Kediri brown, team colour 3)
  kd_sword: { name: 'Kediri swordsman', hp: 55, spd: 2.4, atk: 8, bonus: { archer: 3 }, rng: 0.85, rate: 1.0, ma: 1, pa: 2, sight: 6.5, cost: {}, time: 0, cls: 'sword', jv: 'keris', pal: 5, civ: 9 },
  kd_spear: { name: 'Kediri spearman', hp: 50, spd: 2.3, atk: 5, bonus: { sword: 5, elite: 4 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: {}, time: 0, cls: 'spear', jv: 'tombak', pal: 5, civ: 9 },
  kd_archer: { name: 'Kediri archer', hp: 30, spd: 2.2, atk: 6, bonus: { spear: 3 }, rng: 5.5, rate: 1.5, ma: 0, pa: 0, sight: 7.5, cost: {}, time: 0, cls: 'archer', ranged: true, jv: 'archer', pal: 5, civ: 9 },
  // the Yuan expedition of 1293 (the Ming soldiers' art from the aux civs, in Yuan blue)
  yu_shield: { name: 'Yuan shield soldier', hp: 60, spd: 2.3, atk: 8, bonus: { archer: 4 }, rng: 0.85, rate: 1.0, ma: 1, pa: 3, sight: 6.5, cost: {}, time: 0, cls: 'sword', aux: 'sword', civ: 9 },
  yu_spear: { name: 'Yuan spearman', hp: 55, spd: 2.2, atk: 6, bonus: { sword: 3, elite: 3 }, rng: 1.5, rate: 1.1, ma: 2, pa: 1, sight: 6.5, cost: {}, time: 0, cls: 'spear', aux: 'spear', civ: 9 },
  yu_xbow: { name: 'Yuan crossbowman', hp: 34, spd: 2.2, atk: 8, bonus: { spear: 3 }, rng: 6, rate: 2.3, ma: 0, pa: 0, sight: 7, cost: {}, time: 0, cls: 'archer', ranged: true, aux: 'xbow', civ: 9 },
  yu_junk: { name: 'Yuan war junk', hp: 170, spd: 2.8, atk: 7, rng: 5.5, rate: 1.8, ma: 2, pa: 2, sight: 7.5, cost: {}, time: 0, cls: 'ship', ranged: true, layer: 1, slot: 'light', auxShip: 'fuchuan', wpn: 'arrow', kb: { boat: 4, trade: 4 }, civ: 9 },
  yu_lander: { name: 'Yuan troop junk', hp: 260, spd: 2.4, atk: 0, rng: 0, rate: 1, ma: 2, pa: 2, sight: 6, cost: {}, time: 0, cls: 'ship', layer: 1, slot: 'galley', auxShip: 'fuchuan', civ: 9 },
  // rebels from inside the kingdom (Majapahit's own soldiers in rebel grey, team colour 4); their archers shoot fire
  rb_sword: { name: 'Rebel swordsman', hp: 58, spd: 2.4, atk: 9, bonus: { archer: 3 }, rng: 0.85, rate: 1.0, ma: 1, pa: 2, sight: 6.5, cost: {}, time: 0, cls: 'sword', jv: 'keris', pal: 4, civ: 9 },
  rb_spear: { name: 'Rebel spearman', hp: 52, spd: 2.3, atk: 5, bonus: { sword: 5, elite: 4 }, rng: 1.5, rate: 1.1, ma: 2, pa: 1, sight: 6.5, cost: {}, time: 0, cls: 'spear', jv: 'tombak', pal: 4, civ: 9 },
  rb_archer: { name: 'Rebel fire archer', hp: 32, spd: 2.2, atk: 6, bonus: { spear: 3 }, rng: 6, rate: 1.6, ma: 0, pa: 0, sight: 7.5, cost: {}, time: 0, cls: 'archer', ranged: true, fireA: true, jv: 'archer', pal: 4, civ: 9 },
  rb_guard: { name: 'Rebel lord\'s guard', hp: 80, spd: 2.6, atk: 9, bonus: { archer: 4, sword: 2 }, rng: 0.85, rate: 0.8, ma: 2, pa: 4, sight: 6.5, cost: {}, time: 0, cls: 'elite', jv: 'bhaya', pal: 4, civ: 9 },
  rb_boat: { name: 'Rebel jukung', hp: 110, spd: 3.3, atk: 6, rng: 5, rate: 1.6, ma: 1, pa: 1, sight: 7.5, cost: {}, time: 0, cls: 'ship', ranged: true, layer: 1, slot: 'light', pal: 4, wpn: 'arrow', swivel: true, kb: { boat: 4, trade: 4 }, civ: 9 },
  rb_galley: { name: 'Rebel kelulus', hp: 220, spd: 2.6, atk: 0, rng: 0, rate: 1, ma: 2, pa: 2, sight: 6, cost: {}, time: 0, cls: 'ship', layer: 1, slot: 'galley', pal: 4, civ: 9 },
  cmdr: { name: 'The lord of Sadeng', hp: 900, spd: 2.3, atk: 18, bonus: { sword: 4, elite: 4 }, rng: 0.95, rate: 1.2, ma: 4, pa: 5, sight: 8.5, cost: {}, time: 0, cls: 'elite', foeHero: true, aura: { r: 5, atk: 2 }, bld: 12, jv: 'bhaya', pal: 4, lord: true, civ: 9 }
});
// the ages of Majapahit's own units and ships
Object.assign(UD.acaraki, { age: 2 }); Object.assign(UD.bhaya, { age: 2 }); 
Object.assign(UD.galley, { age: 2 }); Object.assign(UD.trade, { age: 2 }); Object.assign(UD.frigate, { age: 3 }); Object.assign(UD.flagship, { age: 4 });
// Majapahit keeps its own civ bonuses from the main game and the Majapahit campaign demo (speed and numbers:
// cheaper, faster, a little frailer, +1 armour; cheaper, faster, weaker ships through NAVMOD)
Object.assign(ORDER_CLS, { eleph: 0.4, siege: 3.8 });
// [the raiders' name, Majapahit's name]; Majapahit's names are the ones the main game and the campaign use
Object.assign(CIV_NAMES, {
  villager: ['Raider', 'Kawula (Villager)'], keris: ['Raider swordsman', 'Golok Warrior'], tombak: ['Raider spearman', 'Galah Warrior'], archer: ['Raider archer', 'Panah (Archer)'],
  boat: [null, 'Jukung (Fishing boat)'], light: ['Raider boat', 'Jukung Perang (Sloop)'], galley: ['Landing galley', 'Kelulus (Galley)'],
  house: [null, 'Omah (House)'], port: [null, 'Dermaga (Jetty)'],
  barracks: [null, 'Asrama Prajurit (Barracks)']
});

/* ---------- buildings ---------- */
// the Bandar trades with the coast villages from the start; the Kingdom Age brings the rest
for (const k of ['patirthan', 'tower', 'palace']) BD[k].age = 2;
BD.palace.train = ['bhaya', 'tuah'];
BD.barracks.train = ['keris', 'tombak', 'archer', 'sumpit', 'lembing', 'pembedil', 'bediraja'];
delete BD.rumahtabib;
BUILD_ORDER.length = 0;
for (const k of ['house', 'sawah', 'store', 'granary', 'barracks', 'port', 'palisade', 'gate', 'wall', 'patirthan', 'tower', 'palace', 'tradepost']) BUILD_ORDER.push(k);
BD.wall.age = 2;
const ageOf = (d) => (d && d.age) || 1;
function ageOk(d, age) { return ageOf(d) <= age && (!d.maxAge || age <= d.maxAge); }

/* ---------- the raids ----------
   at: seconds after the previous raid (the first counts from the start).
   land: { ne | e: troops }, sea: { boats: {kind: n}, land: [{ at: landing, u: troops }] } */
const ENTRY = { ne: { x: 56.5, y: 9.5, name: 'the hill road' }, e: { x: 59.5, y: 24.5, name: 'the eastern road' } };
const SEA = { x: 62.5, y: 45.5 };
const LANDINGS = { bay: { x: 15.5, y: 35.5, name: 'the river landing' }, kuala: { x: 36.5, y: 37.5, name: 'the eastern shore' } };
const WHO = { kd: ['Kediri\'s soldiers', 'Kediri troops'], yu: ['the Yuan army', 'Yuan troops'], rb: ['rebels', 'rebel troops'], sd: ['the army of Sadeng and Keta', 'the rebel army'] };
const RAIDS = [
  // 1293: Jayakatwang of Kediri, who killed the last king of Singhasari, sends men against Raden Wijaya's clearing
  { at: 210, land: { ne: { kd_sword: 3, kd_archer: 2 } }, who: 'kd', note: 'Jayakatwang of Kediri sends men from his war camp to burn the new clearing.' },
  { at: 160, land: { e: { kd_sword: 3, kd_spear: 2, kd_archer: 2 } }, who: 'kd', note: 'Kediri comes again, by the eastern road.' },
  // 1293: the Yuan fleet. Wijaya used it to bring down Kediri, then turned on it
  { at: 160, sea: { boats: { yu_junk: 1 }, land: [{ at: 'bay', k: 'yu_lander', u: { yu_shield: 4, yu_xbow: 3 } }] }, who: 'yu', note: 'Yuan junks are coming up the river.', story: 'yuan' },
  { at: 165, land: { e: { yu_shield: 4, yu_spear: 3, yu_xbow: 4 } }, sea: { boats: { yu_junk: 2 } }, who: 'yu', note: 'A Yuan column marches inland, and junks guard the river.' },
  { at: 170, sea: { boats: { yu_junk: 2 }, land: [{ at: 'bay', k: 'yu_lander', u: { yu_shield: 4, yu_xbow: 3 } }, { at: 'kuala', k: 'yu_lander', u: { yu_spear: 4, yu_shield: 3 } }] }, who: 'yu', note: 'The last of the Yuan army comes ashore. Drive them back to their ships!' },
  // 1295 to 1319: the old companions of Wijaya rise one after another
  { at: 170, land: { ne: { rb_sword: 5, rb_spear: 4, rb_archer: 4 } }, who: 'rb', note: 'Ranggalawe of Tuban has risen against the king. His archers shoot fire.', story: 'rebels' },
  { at: 175, land: { ne: { rb_sword: 4, rb_spear: 3, rb_archer: 3 }, e: { rb_sword: 3, rb_spear: 3, rb_archer: 3 } }, who: 'rb', note: 'Lembu Sora\'s men come by both roads.' },
  { at: 180, land: { e: { rb_sword: 5, rb_archer: 5, rb_guard: 2 } }, sea: { boats: { rb_boat: 3 }, land: [{ at: 'kuala', k: 'rb_galley', u: { rb_spear: 5, rb_sword: 3 } }] }, who: 'rb', note: 'Nambi\'s rebellion comes by land and from the coast.' },
  { at: 185, land: { ne: { rb_sword: 7, rb_spear: 6, rb_archer: 6, rb_guard: 3 } }, who: 'rb', note: 'Ra Kuti marches on the capital itself.' }
];
// Kediri's war camp on the far side of the map, where the old enemy town stood. Burning it is optional:
// it pays well, and Kediri sends no more raids once it is gone
const CAMP = { tx: 49, ty: 10, guards: { kd_sword: 3, kd_spear: 2, kd_archer: 2 }, spoils: { gold: 250, food: 200 } };
// 1331: Sadeng and Keta rise together; Gajah Mada breaks them, and the queen comes to the field
const FINAL = { land: { ne: { cmdr: 1, rb_guard: 2, rb_sword: 6, rb_spear: 5, rb_archer: 5 }, e: { rb_guard: 1, rb_sword: 4, rb_spear: 4, rb_archer: 4 } },
  sea: { boats: { rb_boat: 4 }, land: [{ at: 'bay', k: 'rb_galley', u: { rb_sword: 3, rb_archer: 3 } }, { at: 'kuala', k: 'rb_galley', u: { rb_spear: 3, rb_sword: 3 } }] }, who: 'sd', final: true };
const REPEAT_GAP = 130;   // after the list runs out, the last raid comes again until Majapahit reaches the Kingdom Age
const FINAL_DELAY = 75;   // Sadeng and Keta rise this long after the last raid is broken, once Majapahit is a kingdom
function raidKinds(R, diff) {
  const out = [];
  const add = (u) => { for (const k in u) { const n = k === 'cmdr' ? 1 : Math.max(1, Math.round(u[k] * DMUL[diff])); for (let j = 0; j < n; j++) out.push(k); } };
  if (R.land) for (const e in R.land) add(R.land[e]);
  if (R.sea) { add(R.sea.boats || {}); for (const L of R.sea.land || []) add(L.u); }
  return out;
}
function raidSize(R, diff) { return raidKinds(R, diff).length; }

/* ---------- the map: the main game's coast, without the Majapahit town ---------- */
const _populate = Game.prototype.populate;
Game.prototype.populate = function () {
  this.civs = [1, 0]; CIVMAP = [1, 0];   // the player (team 0) is Majapahit, the raiders use Melaka's soldiers
  _populate.call(this);
  const g = this, M = g.M = newMission(g);
  for (const b of g.buildings) if (b.team === 1) b.hp = 0;
  for (const u of g.units) if (u.team === 1) u.hp = 0;
  g.cleanup();
  // clear the raiders' roads of the odd tree so columns don't snag
  for (const k in ENTRY) g.reserveRoute(Math.floor(ENTRY[k].x), Math.floor(ENTRY[k].y), STARTS[0].x + 1, STARTS[0].y + 1);
  for (const n of g.nodes) if (n.kind === 'tree' && g.reserve[n.ty * W + n.tx] && Math.hypot(n.tx - STARTS[0].x, n.ty - STARTS[0].y) > 9) g.removeNode(n);
  g.cleanup();
  // the founding party
  const tc = g.buildings.find(b => b.team === 0 && b.kind === 'towncentre'); M.tc = tc.id;
  const put = (kind, x, y) => { const p = g.openSpot(x, y, UD[kind].layer || 0); return g.addUnit(kind, 0, p.x, p.y); };
  for (let i = 0; i < 3; i++) put('villager', tc.x + 2 + i, tc.y + 3);
  put('keris', tc.x + 3.5, tc.y - 2.5); put('keris', tc.x + 4.5, tc.y - 2.5); put('archer', tc.x + 3.5, tc.y - 3.5); put('archer', tc.x + 4.5, tc.y - 3.5);
  if (g.canPlace('house', tc.tx - 3, tc.ty + 1, 0)) g.addBuilding('house', 0, tc.tx - 3, tc.ty + 1, true);
  else { const s = g.nearestFree(tc.tx - 3, tc.ty + 3, 0, 6); g.addBuilding('house', 0, s.x, s.y, true); }
  g.res[0] = { food: 300, wood: 300, gold: 150 };
  buildCamp(g);
  g.age = [1, 1]; g.navTier = [0, 1];
};

function buildCamp(g) {
  const M = g.M, c = CAMP, ids = [];
  const put = (kind, dx, dy) => { const tx = c.tx + dx, ty = c.ty + dy; if (!g.canPlace(kind, tx, ty, 1)) return; const b = g.addBuilding(kind, 1, tx, ty, true); b.camp = true; ids.push(b.id); };
  // clear the ground first: the camp stands in a felled clearing
  for (const n of g.nodes.slice()) if (n.kind === 'tree' && n.tx >= c.tx - 4 && n.tx <= c.tx + 7 && n.ty >= c.ty - 3 && n.ty <= c.ty + 6) g.removeNode(n);
  g.cleanup();
  put('barracks', 0, 0); put('house', 4, -1); put('house', -3, 1); put('tower', 4, 3);
  M.camp = { x: c.tx + 1.5, y: c.ty + 1.5, ids };
  for (const k in c.guards) for (let i = 0, n = Math.max(1, Math.round(c.guards[k] * DMUL[g.diff])); i < n; i++) {
    const p = g.openSpot(c.tx + 1 + (i % 3), c.ty + 4 + Math.floor(i / 3), 0), u = g.addUnit(k, 1, p.x, p.y);
    u.guard = { x: p.x, y: p.y };
  }
}
/* ---------- mission state ---------- */
function newMission(g) {
  return { t: 0, raid: 0, next: RAIDS[0].at, active: false, cols: [], cardQ: [], cards: {}, warned: -1, broken: 0, spoils: 0,
    aging: null, ageAt: [0, 0, 0, 0, 0], finalAt: 0, finalOn: false, cmdrDead: false, won: false, why: null, fled: 0,
    heroDown: {}, heroBack: {}, early: 0, repeats: 0, later: [] };
}

/* ---------- ages ---------- */
Game.prototype.ageNeedMet = function (team, n) {
  const A = AGES[n]; if (!A || !A.need) return true;
  const have = (k) => this.buildings.some(b => b.team === team && b.kind === k && b.done && b.hp > 0);
  if (A.need.all) return A.need.all.every(have);
  return A.need.any.filter(have).length >= A.need.n;
};
Game.prototype.startAge = function (team) {
  const M = this.M, n = this.age[team] + 1, A = AGES[n];
  if (!A) return 'Majapahit is at its height.';
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
  if (u.team !== 0 || !(u.cls === 'sword' || u.cls === 'spear' || u.cls === 'elite') || UD[u.kind].hero) return;
  // the Kingdom Age puts the soldiers in the kere, a mail coat
  const want = age >= 2 ? 1 : 0, have = u.ageArm || 0;
  if (want === have) return;
  u.pa += want - have; u.ageArm = want;
}
Game.prototype.applyAge = function (team, n) {
  const M = this.M, A = AGES[n];
  this.age[team] = n; M.ageAt[n] = M.t;
  this.navTier[team] = n >= 3 ? 2 : n >= 2 ? 1 : 0;
  for (const b of this.buildings) if (b.team === team && b.kind === 'towncentre' && b.hp > 0) { const add = A.tc - b.maxHp; b.maxHp = A.tc; b.hp += Math.max(0, add); }
  // the archer line turns to guns; existing archers re-arm on the spot
  for (const u of this.units) if (u.team === team && u.hp > 0) {
    if (n === 3 && u.kind === 'archer') convertUnit(u, 'pembedil');
    else if (n === 4 && u.kind === 'pembedil') convertUnit(u, 'bediraja');
    soldierArm(u, n);
  }
  // queued archers become the new kind too
  for (const b of this.buildings) if (b.team === team) for (const q of b.queue) {
    if (n >= 3 && q.kind === 'archer') q.kind = n >= 4 ? 'bediraja' : 'pembedil';
    if (n >= 4 && q.kind === 'pembedil') q.kind = 'bediraja';
  }
  if (n >= 3) { BD.tower.atk = { dmg: 8, range: 7.5, rate: 1.6 }; }
  // a new age brings the next raid closer: word of a new kingdom travels
  if (M.raid < RAIDS.length && !M.active && M.next - M.t > AGE_SPEEDUP) M.next = M.t + AGE_SPEEDUP;
  M.cardQ.push('age' + n);
};
const _addUnit = Game.prototype.addUnit;
Game.prototype.addUnit = function (kind, team, x, y) {
  const u = _addUnit.call(this, kind, team, x, y);
  if (team === 0 && this.age) soldierArm(u, this.age[0]);
  return u;
};
// only what this age allows can be trained or built
Game.prototype.trainable = function (kind, team) {
  const t = BD[kind].train; if (!t) return null;
  const age = this.age ? this.age[team] : 4;
  return t.filter(k => civOk(UD[k], team) && (team !== 0 || ageOk(UD[k], age)));
};
const _placeBuilding = Game.prototype.placeBuilding;
Game.prototype.placeBuilding = function (team, kind, tx, ty, ids) {
  if (team === 0 && this.age && !ageOk(BD[kind], this.age[0])) return { ok: false, why: civName(kind, 0) + ' comes with the ' + AGES[ageOf(BD[kind])].name + '.' };
  return _placeBuilding.call(this, team, kind, tx, ty, ids);
};
const _queueUnit = Game.prototype.queueUnit;
Game.prototype.queueUnit = function (b, kind, team) {
  const d = UD[kind];
  if (d && b.team === 0 && this.age && !ageOk(d, this.age[0])) return civName(kind, 0) + ' comes with the ' + AGES[ageOf(d)].name + '.';
  if (d && d.cap && this.countOf(b.team, kind) >= d.cap) return 'You can have ' + d.cap + ' ' + civName(kind, b.team).split(' (')[0] + ' at most.';
  if (d && d.hero && this.M && this.M.heroBack[kind]) return d.name + ' is recovering and comes back on his own.';
  return _queueUnit.call(this, b, kind, team);
};
// swap a unit for another kind in place, keeping its share of health
function convertUnit(u, k) {
  const d = UD[k], m = TEAMMOD[CV(u.team)] || TEAMMOD[0];
  const r = u.hp / u.maxHp;
  Object.assign(u, { kind: k, cls: d.cls, maxHp: Math.round(d.hp * m.hp), spd: d.spd * m.spd, atk: d.atk, rate: d.rate, rng: d.rng,
    ma: d.ma, pa: d.pa, bonus: d.bonus, ranged: !!d.ranged, sight: d.sight, carryMax: d.carry || 0 });
  u.ageArm = 0; u.hp = Math.max(1, Math.round(u.maxHp * r)); u.carry = { type: null, amt: 0 };
}

/* ---------- repair, landings ---------- */
const _command = Game.prototype.command;
Game.prototype.command = function (ids, wx, wy, target, opts) {
  opts = opts || {};
  const us = ids.map(id => this.byId.get(id)).filter(u => u && u.isUnit && u.hp > 0 && (u.team === 0 || opts.any));
  if (target && target.hp > 0 && us.length && target.isBld && target.team === us[0].team && target.done && target.hp < target.maxHp && !FIELD[target.kind] && us.some(u => u.cls === 'vil')) {
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
    if (b.burn) b.burn.t = 0;
    if (b.hp >= b.maxHp) this.idleOrder(u);
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
// a landing galley: row in to the beach, put its troops ashore, row back out to sea and leave the map
Game.prototype.doLand = function (u, dt) {
  const o = u.order;
  o.tt = (o.tt || 0) + dt;
  const gx = o.s === 'in' ? o.x : o.sx, gy = o.s === 'in' ? o.y : o.sy;
  const near = Math.hypot(u.x - gx, u.y - gy) < (o.s === 'in' ? 1.6 : 1.5);
  if (near || (o.tt > 50)) {
    u.path = null;
    if (o.s === 'in') { this.unload(u, o.troops, o.wave); o.s = 'out'; o.tt = 0; }
    else { u.hp = 0; u.silent = true; }
    return;
  }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, gx, gy))) { u.wait = 1; return; } }
  if (this.stepMove(u, dt)) u.path = null;
};
Game.prototype.unload = function (boat, kinds, wave) {
  const land = this.nearestFree(Math.floor(boat.x), Math.floor(boat.y - 1.5), 0, 7), goal = homeGoal(this), M = this.M;
  for (const k of kinds) {
    const p = this.openSpot(land.x + 0.5, land.y + 0.5, 0);
    const u = this.addUnit(k, 1, p.x, p.y); u.wave = wave;
    const col = M.cols.find(c => c.wave === wave); if (col) col.ids.add(u.id);
    if (goal) { this.orderAMove(u, goal.x, goal.y); u._amT = this.t; }
  }
  this.fx.push({ k: 'smoke', x: land.x + 0.5, y: land.y + 0.5, vy: -0.4, t: 0.8, max: 0.8 });
  this.msg('Raiders are ashore at ' + (boat.order.name || 'the beach') + '!');
  this.alerts.push({ x: land.x, y: land.y, t: 3 });
};
const _updateUnit = Game.prototype.updateUnit;
Game.prototype.updateUnit = function (u, dt) {
  const t = u.order.t, d = UD[u.kind];
  if (t === 'repair' || t === 'land' || t === 'flee2') {
    u.cd = Math.max(0, u.cd - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
    u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
    u.anim += dt; u.moving = false; u.working = false;
    if (t === 'repair') this.doRepair(u, dt); else if (t === 'land') this.doLand(u, dt); else this.doRetreat(u, dt);
  } else _updateUnit.call(this, u, dt);
  if (u.moving && d.trample) u.runT = (u.runT || 0) + dt; else if (!u.moving && u.order.t !== 'attack') u.runT = 0;
};
// a beaten army walks back the way it came and leaves the map
Game.prototype.doRetreat = function (u, dt) {
  const o = u.order;
  if (Math.hypot(u.x - o.x, u.y - o.y) < 2 || (o.tt = (o.tt || 0) + dt) > 45) { u.hp = 0; u.silent = true; this.M.fled++; return; }
  if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToPoint(u, o.x, o.y))) { u.wait = 1; return; } }
  const s = u.spd; u.spd = s * 1.2; if (this.stepMove(u, dt)) u.path = null; u.spd = s;
};

/* ---------- combat: guns, cannon splash, fire arrows, elephants, hero auras ---------- */
const _damage = Game.prototype.damage;
// gunpowder: the shot just fired becomes a bullet or a cannonball, with a flash and white smoke at the muzzle
Game.prototype.gunShot = function (att, ad) {
  let a = null;
  for (let i = this.arrows.length - 1; i >= 0 && i >= this.arrows.length - 6; i--) { const r = this.arrows[i]; if (r.t === 0 && r.x0 === att.x && !r.k) { a = r; break; } }
  if (!a) return;
  const big = !!ad.splash, d = Math.hypot(a.x1 - a.x0, a.y1 - a.y0);
  a.k = big ? 'mball' : 'bullet'; a.dur = big ? 0.1 + d * 0.03 : 0.04 + d * 0.012;
  const mx = att.x + att.face * (big ? 0.6 : 0.42), my = att.y - (big ? 0.15 : 0.4);
  this.fx.push({ k: 'spark', sub: 'flash', x: mx, y: my, face: att.face, big, t: big ? 0.14 : 0.09, max: big ? 0.14 : 0.09 });
  const n = big ? 6 : 3;
  for (let i = 0; i < n; i++) this.fx.push({ k: 'smoke', sub: 'gun', x: mx + att.face * (0.1 + i * 0.12) + (this.rng() - 0.5) * 0.2, y: my + (this.rng() - 0.5) * 0.15, vy: -0.25 - this.rng() * 0.3, vx: att.face * (0.2 + this.rng() * 0.3), big, t: (big ? 1.6 : 1.0) + this.rng() * 0.5, max: (big ? 2.1 : 1.5) });
  this.sfxShots = (this.sfxShots || []).concat([{ x: mx, y: my, big }]);
};
Game.prototype.damage = function (att, tgt, w) {
  const ad = att.kind && att.isUnit ? UD[att.kind] : null;
  if (ad && ad.gun) this.gunShot(att, ad);
  if (tgt.hp <= 0) return;
  if (!ad || w) { this.wallDamage(att, tgt, w); return; }
  let plus = 0;
  if (tgt.isBld && ad.bld) plus += ad.bld;
  const charge = ad.trample && (att.runT || 0) > 1.2 && tgt.isUnit;
  if (charge) { plus += ad.trample; att.runT = 0; }
  plus += this.auraFor(att);
  // rebel fire archers: the arrow catches in thatch and timber
  if (ad.fireA && tgt.isBld && !BD[tgt.kind].wall) {
    if (this.rng() < 0.35) this.ignite(tgt, att.team);
    for (let i = this.arrows.length - 1; i >= 0 && i >= this.arrows.length - 4; i--) { const r = this.arrows[i]; if (r.t === 0 && r.x0 === att.x && !r.k) { r.k = 'fire'; break; } }
  }
  const atk0 = att.atk, pa0 = tgt.pa;
  att.atk = Math.round(atk0 + plus);
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
  }
  // the elephant's charge runs on through the men around its target
  if (charge) {
    const x = tgt.x, y = tgt.y;
    this.unitsNear(x, y, 1.6, (o) => {
      if (o === tgt || o.hp <= 0 || o.team === att.team || o.team === 2 || o.layer !== 0 || Math.hypot(o.x - x, o.y - y) > 1.2) return;
      const a0 = att.atk; att.atk = Math.round(a0 * 0.6); _damage.call(this, att, o); att.atk = a0;
    });
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
    M.heroBack[t.kind] = M.t + HERO_BACK;
    this.msg(d.name + ' is wounded and carried from the field. Back in ' + HERO_BACK + 's.');
  }
  if (t.kind === 'cmdr') { M.cmdrDead = true; M.cmdrAt = M.t; }
};

/* ---------- the raiders: no economy, only columns and fleets ---------- */
Game.prototype.aiTick = function () { if (this.M) missionAI(this); };
Game.prototype.checkEnd = function () {
  const M = this.M; if (!M) return;
  if (!this.buildings.some(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0)) { M.why = 'tc'; this.over = 'lose'; return; }
  if (M.won) this.over = 'win';
};
const _update = Game.prototype.update;
Game.prototype.update = function (dt) {
  this.heroes = this.units.filter(u => u.hp > 0 && UD[u.kind].aura);
  _update.call(this, dt);
  if (this.M && !this.over) missionTick(this, dt);
};

function homeGoal(g) { return g.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0) || null; }
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
const isWall = (b) => !!BD[b.kind].wall;
function missionAI(g) {
  const goal = homeGoal(g); if (!goal) return;
  const reach = g._reachT === g.tickN >> 4 && g._reach ? g._reach : (g._reach = reachMap(g, goal));
  g._reachT = g.tickN >> 4;
  for (const u of g.units) {
    if (u.team !== 1 || u.hp <= 0) continue;
    const o = u.order, d = UD[u.kind];
    if (o.t === 'flee2' || o.t === 'land') continue;
    // the war camp's guards hold their ground and chase off anyone who comes close
    if (u.guard) {
      if (o.t === 'attack' && g.byId.get(o.id) && Math.hypot(u.x - u.guard.x, u.y - u.guard.y) < 10) continue;
      let foe = null, fd = 8;
      for (const v of g.units) if (v.team === 0 && v.hp > 0 && v.layer === 0) { const dd = Math.hypot(v.x - M_CAMP(g).x, v.y - M_CAMP(g).y); if (dd < fd) { fd = dd; foe = v; } }
      if (foe) g.orderAttack(u, foe);
      else if (Math.hypot(u.x - u.guard.x, u.y - u.guard.y) > 1.5 && o.t !== 'move') g.orderMove(u, u.guard.x, u.guard.y);
      continue;
    }
    if (u.layer === 1) {
      // war boats sweep the coast: ships and boats first, then anything near the water
      if (o.t === 'attack' && g.byId.get(o.id)) continue;
      let prey = null, pd = 18;
      for (const v of g.units) if (v.team === 0 && v.hp > 0 && v.layer === 1) { const dd = Math.hypot(v.x - u.x, v.y - u.y); if (dd < pd) { pd = dd; prey = v; } }
      if (!prey) prey = nearestOf(g, u, (b) => b.kind === 'port' || b.kind === 'tradepost', 22);
      if (prey) { g.orderAttack(u, prey); continue; }
      if (o.t !== 'amove' || g.t - (u._amT || 0) > 20) { const L = u.station || LANDINGS.bay; g.orderAMove(u, L.x + (u.id % 3) - 1, L.y + 1.5); u._amT = g.t; }
      continue;
    }
    if (o.t === 'attack' && g.byId.get(o.id) && !u._blocked) continue;
    if (o.t === 'amove' && !u._blocked && g.t - (u._amT || 0) < 6) continue;
    u._blocked = false;
    const inside = reach[Math.floor(u.y) * W + Math.floor(u.x)];
    // fire archers and elephants go for buildings; others for the town centre through any gap
    if (d.fireA && inside) {
      const b = nearestOf(g, u, (b) => !isWall(b) && !FIELD[b.kind], 9);
      if (b) { g.orderAttack(u, b); continue; }
    }
    if (inside) { g.orderAMove(u, goal.x, goal.y); u._amT = g.t; continue; }
    // walled out: break through the nearest bit of wall
    const wl = nearestOf(g, u, isWall, 40);
    if (wl) g.orderAttack(u, wl); else { g.orderAMove(u, goal.x, goal.y); u._amT = g.t; }
  }
}
function M_CAMP(g) { return g.M.camp || CAMP; }
// an enemy that can't reach what it wants marks itself so the AI can send it at the wall instead
const _ptr = Game.prototype.pathToRect, _ptp = Game.prototype.pathToPoint;
Game.prototype.pathToRect = function (u, rect, reach) { const r = _ptr.call(this, u, rect, reach); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };
Game.prototype.pathToPoint = function (u, gx, gy) { const r = _ptp.call(this, u, gx, gy); if (u.team === 1 && u.layer === 0 && (!r || !r.reached)) u._blocked = true; return r; };

/* ---------- the raid director ---------- */
function launchRaid(g, R, idx) {
  const M = g.M, goal = homeGoal(g), ids = new Set(), n = (k, v) => k === 'cmdr' ? 1 : Math.max(1, Math.round(v * DMUL[g.diff]));
  const vet = idx >= 8 ? 1.15 : idx >= 5 ? 1.08 : 1;
  const mk = (k, x, y, layer) => {
    const p = g.openSpot(x, y, layer || 0), u = g.addUnit(k, 1, p.x, p.y);
    if (vet !== 1 && !UD[k].layer) { u.maxHp = Math.round(u.maxHp * vet); u.hp = u.maxHp; }
    u.wave = idx; ids.add(u.id);
    if (k === 'cmdr') M.cmdr = u;
    return u;
  };
  const from = [];
  if (R.land) for (const e in R.land) {
    const E = ENTRY[e], kinds = [];
    for (const k in R.land[e]) for (let j = 0, c = n(k, R.land[e][k]); j < c; j++) kinds.push(k);
    kinds.sort((a, b) => (b === 'cmdr') - (a === 'cmdr'));
    kinds.forEach((k, j) => { const u = mk(k, E.x - 2 + (j % 5), E.y - 1 + Math.floor(j / 5) * 0.9); if (goal) { g.orderAMove(u, goal.x, goal.y); u._amT = g.t + 4; } });
    g.alerts.push({ x: E.x, y: E.y, t: 3 }); from.push(E.name);
    for (let y = Math.floor(E.y) - 3; y <= E.y + 3; y++) for (let x = Math.floor(E.x) - 3; x <= E.x + 3; x++) if (g.inb(x, y)) g.explored[y * W + x] = 1;
  }
  if (R.sea) {
    let j = 0;
    for (const k in R.sea.boats || {}) for (let i = 0, c = n(k, R.sea.boats[k]); i < c; i++, j++) {
      const u = mk(k, SEA.x - (j % 3) * 1.5, SEA.y - 1 - Math.floor(j / 3) * 1.4, 1);
      const L = j % 2 ? LANDINGS.kuala : LANDINGS.bay; u.station = L; g.orderAMove(u, L.x, L.y + 1.5); u._amT = g.t;
    }
    for (const L of R.sea.land || []) {
      const at = LANDINGS[L.at], troops = [];
      for (const k in L.u) for (let i = 0, c = n(k, L.u[k]); i < c; i++) troops.push(k);
      const p = g.openSpot(SEA.x - 2 - j++ * 1.6, SEA.y - 2.5, 1), s = g.addUnit(L.k, 1, p.x, p.y);
      s.order = { t: 'land', x: at.x, y: at.y, sx: SEA.x, sy: SEA.y, troops, wave: idx, s: 'in', name: at.name };
      ids.add(s.id);
    }
    from.push('the sea');
    g.alerts.push({ x: SEA.x - 4, y: SEA.y - 2, t: 3 });
  }
  M.cols.push({ wave: idx, ids, left: 0, done: false, kinds: raidSize(R, g.diff), final: !!R.final });
  if (R.final) g.msg('Sadeng and Keta have risen! Their army comes by ' + from.join(' and by ') + '!');
  else g.msg('Raid ' + (idx + 1) + ': ' + WHO[R.who][0] + ' come by ' + from.join(' and by ') + '!');
  if (R.story) M.cardQ.push(R.story);
}
function missionTick(g, dt) {
  const M = g.M;
  M.t += dt;
  // the court's work toward the next age
  if (M.aging) {
    M.aging.left -= dt;
    if (M.aging.left <= 0) { const n = M.aging.to; M.aging = null; g.applyAge(0, n); g.msg('Majapahit enters the ' + AGES[n].name + ': ' + AGES[n].local + '!'); }
  }
  // scouts warn of the next raid
  if (!M.finalOn && M.next - M.t <= 25 && M.warned < M.raid) {
    M.warned = M.raid;
    const R = RAIDS[Math.min(M.raid, RAIDS.length - 1)];
    const where = [...Object.keys(R.land || {}).map(e => ENTRY[e].name), ...(R.sea ? ['the sea'] : [])];
    g.msg('Scouts: ' + WHO[R.who][1] + ' coming by ' + where.join(' and by ') + '.');
    for (const e in R.land || {}) g.alerts.push({ x: ENTRY[e].x, y: ENTRY[e].y, t: 3 });
  }
  if (M.camp && !M.campDown && !g.buildings.some(b => b.camp && b.hp > 0)) {
    M.campDown = true;
    g.res[0].gold += CAMP.spoils.gold; g.res[0].food += CAMP.spoils.food; M.spoils += CAMP.spoils.gold;
    g.msg('Kediri\'s war camp burns! Spoils: +' + CAMP.spoils.gold + ' gold, +' + CAMP.spoils.food + ' food. Kediri sends no more raids.');
    g.alerts.push({ x: M.camp.x, y: M.camp.y, t: 3 });
  }
  if (!M.finalOn && M.t >= M.next) {
    const idx = M.raid, R = RAIDS[Math.min(idx, RAIDS.length - 1)];
    if (idx >= RAIDS.length) M.repeats++;
    if (M.campDown && R.who === 'kd') { M.broken++; g.msg('No raid comes from Kediri: its war camp is ash.'); }
    else launchRaid(g, R, idx);
    M.raid++;
    M.next = M.raid < RAIDS.length ? M.t + RAIDS[M.raid].at : M.t + REPEAT_GAP;
  }
  // once every raid is broken and Majapahit is a kingdom, Sadeng and Keta gather their army
  if (!M.finalAt && M.raid >= RAIDS.length && !M.active && g.age[0] >= MAX_AGE) {
    M.finalAt = M.t + FINAL_DELAY; M.next = 1e9;
    g.msg('Word comes from the east: Sadeng and Keta are gathering an army. It marches in ' + FINAL_DELAY + ' seconds.');
  }
  // Sadeng and Keta rise
  if (M.finalAt && !M.finalOn && M.t >= M.finalAt) {
    M.finalOn = true; M.next = 1e9;
    M.cardQ.push('final');
    launchRaid(g, FINAL, M.raid);
    // Queen Tribhuwana comes to the field with her Bhayangkara guard
    const tc = homeGoal(g);
    if (tc) {
      const sp = g.findSpawn(tc, null, 0), p = g.addUnit('perak', 0, sp.x, sp.y); M.perak = p;
      for (let i = 0; i < 4; i++) { const q = g.openSpot(sp.x + 1 + (i % 2), sp.y + 1 + (i >> 1), 0); g.addUnit(i < 2 ? 'bhaya' : 'tombak', 0, q.x, q.y); }
    }
  }
  // a raid is broken when every man in it is down (its baggage comes to Majapahit); its war boats then sail home
  const alive = new Map();
  for (const u of g.units) if (u.team === 1 && u.hp > 0) alive.set(u.id, u);
  const fights = (u) => u.layer !== 1 || (u.order.t === 'land' && u.order.s !== 'out' && u.order.troops && u.order.troops.length > 0);
  for (const c of M.cols) {
    if (c.done) continue;
    let n = 0; for (const id of c.ids) { const u = alive.get(id); if (u && fights(u)) n++; }
    c.left = n;
    if (n === 0 && g.t > 1) {
      c.done = true; M.broken++;
      for (const id of c.ids) { const u = alive.get(id); if (u && u.layer === 1) { u.order = { t: 'land', x: SEA.x, y: SEA.y, sx: SEA.x, sy: SEA.y, troops: [], s: 'out' }; u.path = null; } }
      const gold = 50 + Math.min(c.wave, 12) * 25, food = 40 + Math.min(c.wave, 12) * 20;
      g.res[0].gold += gold; g.res[0].food += food; M.spoils += gold;
      g.msg((c.final ? 'The army of Sadeng is broken!' : 'Raid ' + (c.wave + 1) + ' is broken!') + ' Spoils: +' + gold + ' gold, +' + food + ' food.');
      M.lastBroken = M.t;
      if (c.final && !M.cmdrDead) { M.cmdrDead = true; M.cmdrAt = M.t; }
    }
  }
  M.active = M.cols.some(c => !c.done);
  // heroes come back from the field
  for (const k in M.heroBack) if (M.heroBack[k] && M.t >= M.heroBack[k]) {
    const tc = homeGoal(g); if (!tc) break;
    M.heroBack[k] = 0;
    const sp = g.findSpawn(tc, null, 0), u = g.addUnit(k, 0, sp.x, sp.y);
    if (k === 'perak') M.perak = u;
    g.msg(UD[k].name + (k === 'perak' ? ' is back on her feet.' : ' is back on his feet.'));
  }
  // when the lord of Sadeng falls, his army loses heart and turns for home
  if (M.cmdrDead && !M.routed) {
    M.routed = true; M.cardQ.push('rout');
    for (const c of M.cols) if (!c.done) { c.done = true; M.broken++; }
    for (const u of g.units) if (u.team === 1 && u.hp > 0 && !u.guard) {
      if (u.layer === 1) { u.order = { t: 'land', x: SEA.x, y: SEA.y, sx: SEA.x, sy: SEA.y, troops: [], s: 'out' }; u.path = null; continue; }
      const E = Math.abs(u.y - ENTRY.ne.y) < Math.abs(u.y - ENTRY.e.y) ? ENTRY.ne : ENTRY.e;
      u.order = { t: 'flee2', x: E.x, y: E.y }; u.path = null;
    }
    g.msg('The lord of Sadeng has fallen! His army breaks and runs for home.');
  }
  if (M.routed && !M.cards.closing && M.t - M.cmdrAt > 8) { M.cards.closing = true; M.cardQ.push('closing'); }
}
// "Next raid now": bring the raiders early for a little bonus gold
Game.prototype.callRaid = function () {
  const M = this.M;
  if (!M || M.finalOn) return 'No more raids are coming.';
  if (M.active) return 'Break the raid that is here first.';
  const left = M.next - M.t;
  if (left < 8) return 'They are almost here.';
  const bonus = Math.round(left * 0.6);
  this.res[0].gold += bonus; M.early += bonus || 0;
  M.next = M.t + 6; M.warned = M.raid - 1;
  this.msg('You send word that Majapahit is ready for them. +' + bonus + ' gold.');
  return null;
};

/* naval combat by age: arrows and boarding in the Village Age, fire arrows and lela swivel guns
   in the Kingdom Age, ship cannon from the Age of Commerce. Majapahit builds in red brick, which burns
   at half the usual rate (lore/civ-playbook.md); the raiders' camps are timber. */
NAVWPN.tierDefault = 1;
BURNMAT[0] = 0.5; BURNMAT[1] = 1;
