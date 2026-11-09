/* ##### CHAPTER SIM 2 · Units, civs and buildings #####
   File: src/js/sim/02-units-buildings.js
   What it does: The big tables. UD lists every unit, BD every building. Each civ's names and bonuses live here
   too.
   Things you can tweak:
     - UD.<unit>: hp, spd (tiles/s), atk, rng (range in tiles), rate (seconds between hits), ma/pa
       (melee/pierce armour), sight, cost, time (seconds to train), bonus (extra damage vs a class).
     - BD.<building>: hp, size (tiles), cost, time, pop (housing), train (what it makes), atk (towers).
     - TEAMMOD: per-civ multipliers (Majapahit: hp 0.92, speed 1.12, cost 0.85, armour -1).
     - NAVMOD: Majapahit ship multipliers. MEL_LEVY: Melaka land soldiers' price (0.9 = 10% off).
     - BURN / BURNMAT: how fast fire hurts and burns per civ's building material.
     - CIV_NAMES / BRIEF: the local names and the short help text on buttons.
     - TRADE, HOUSEHOLD, FISH_RATE, TRIBUTE, WALL_MAX, RAFT: trade gold, Ayutthaya household food, Majapahit
       tribute, longest wall drag, fire raft cooldown.
   ############################################################################ */
/* ---------- data ---------- */
const UD = {
  villager: { name: 'Villager', hp: 25, spd: 2.1, atk: 3, rng: 0.85, rate: 1.5, ma: 0, pa: 0, sight: 5, cost: { food: 50 }, time: 8, cls: 'vil', carry: 10 },
  // counters: Tombak beats Keris, Keris beats Archer, Archer beats Tombak; elites have their own jobs
  keris: { name: 'Swordsman', hp: 55, spd: 2.4, atk: 8, bonus: { archer: 3, skirm: 4 }, rng: 0.85, rate: 1.0, ma: 1, pa: 2, sight: 6.5, cost: { food: 50, gold: 20 }, time: 9, cls: 'sword' },
  tombak: { name: 'Spearman', hp: 50, spd: 2.3, atk: 5, bonus: { sword: 5, elite: 4 }, rng: 1.5, rate: 1.1, ma: 2, pa: 0, sight: 6.5, cost: { food: 40, wood: 25 }, time: 9, cls: 'spear' },
  archer: { name: 'Archer', hp: 30, spd: 2.2, atk: 6, bonus: { spear: 3, elite: 3 }, rng: 5.5, rate: 1.5, ma: 0, pa: 0, sight: 7.5, cost: { wood: 30, gold: 35 }, time: 10, cls: 'archer', ranged: true },
  // light ranged: no gold, quick shots; kills archers and spearmen, melts against swords and armour (lore/ranged-units.md)
  sumpit: { name: 'Blowpipe', hp: 32, spd: 2.4, atk: 3, bonus: { archer: 3, spear: 2 }, rng: 5, rate: 0.9, ma: 0, pa: 0, sight: 7.5, cost: { food: 30, wood: 25 }, time: 8, cls: 'skirm', ranged: true, civ: 0, poison: { dps: 1.2, dur: 4 } },
  lembing: { name: 'Javelin Thrower', hp: 40, spd: 2.4, atk: 5, bonus: { archer: 3, spear: 3 }, rng: 4, rate: 1.3, ma: 0, pa: 0, sight: 7, cost: { food: 35, wood: 25 }, time: 8, cls: 'skirm', ranged: true, civ: 1 },
  namai: { name: 'Crossbowman', hp: 34, spd: 2.3, atk: 5, bonus: { archer: 3, spear: 2 }, rng: 5.5, rate: 1.6, ma: 0, pa: 1, sight: 7.5, cost: { food: 35, wood: 25 }, time: 9, cls: 'skirm', ranged: true, civ: 3 },
  pahlawan: { name: 'Champion', hp: 80, spd: 2.3, atk: 11, bonus: { sword: 5, elite: 4 }, rng: 0.85, rate: 1.0, ma: 2, pa: 0, sight: 6.5, cost: { food: 90, gold: 60 }, time: 14, cls: 'elite', civ: 0 },
  bhaya: { name: 'Royal Guard', hp: 75, spd: 3.5, atk: 6, bonus: { archer: 4, sword: 2 }, rng: 0.85, rate: 0.55, ma: 1, pa: 4, sight: 6.5, cost: { food: 70, gold: 40 }, time: 12, cls: 'elite', civ: 1 },
  // healers: herbal medicine. Melaka heals one unit well, Majapahit heals a crowd a little
  tabib: { name: 'Physician', hp: 30, spd: 2.2, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 7, cost: { food: 40, gold: 45 }, time: 11, cls: 'healer', civ: 0, heal: { amt: 5, rate: 1, rng: 3 } },
  mo: { name: 'Physician', hp: 30, spd: 2.2, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 7, cost: { food: 40, gold: 40 }, time: 11, cls: 'healer', civ: 3, heal: { amt: 4, rate: 1, rng: 3 } },
  // Ayutthaya's royal war elephant: slow, huge and hard to stop; spears and massed archers bring it down
  chang: { name: 'War Elephant', hp: 300, spd: 2.0, atk: 14, bonus: { sword: 4, archer: 4, spear: 2 }, rng: 1.15, rate: 1.6, ma: 3, pa: 4, sight: 7, cost: { food: 140, gold: 90 }, time: 22, cls: 'elite', civ: 3, big: true },
  acaraki: { name: 'Herbalist', hp: 25, spd: 2.4, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 7, cost: { food: 35, gold: 15 }, time: 8, cls: 'healer', civ: 1, heal: { amt: 2, rate: 1.5, rng: 2.5, area: true, max: 6 } },
  boat: { name: 'Fishing Boat', hp: 40, spd: 3.0, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 6, cost: { wood: 50 }, time: 10, cls: 'boat', carry: 14, layer: 1, slot: 'fishing' },
  // navy (Melaka numbers; Majapahit ships get NAVMOD on top: cheaper, faster, weaker)
  // every civ trades (Iylia, 2026-10-31); only Melaka's Jong Dagang is armed. Gold per trip: TRADE.civ
  trade: { name: 'Trade Ship', hp: 150, civHp: [150, 140, 190], spd: 2.6, atk: 4, civAtk: [4, 0, 0], rng: 4.5, rate: 2.0, ma: 1, pa: 2, sight: 7, cost: { wood: 100, gold: 60 }, time: 18, cls: 'ship', ranged: true, layer: 1, slot: 'trade', civ: [0, 1, 3], trader: true, wpn: 'arrow', swivel: true, kb: { boat: 4 } },
  fireship: { name: 'Fire Ship', hp: 55, spd: 3.5, atk: 0, rng: 0.7, rate: 1, ma: 0, pa: 0, sight: 6, cost: { wood: 70, gold: 10 }, time: 10, cls: 'ship', layer: 1, slot: 'trade', civ: 1, boom: { dmg: 105, r: 1.7, big: 1.8 } },
  light: { name: 'Sloop', hp: 90, spd: 3.4, atk: 7, rng: 5.5, rate: 1.2, ma: 1, pa: 1, sight: 7.5, cost: { wood: 70, gold: 20 }, time: 14, cls: 'ship', ranged: true, layer: 1, slot: 'light', wpn: 'arrow', fireA: true, swivel: true, kb: { fireship: 40, trade: 6, boat: 6 } },
  galley: { name: 'Galley', hp: 170, spd: 2.9, atk: 22, rng: 1.2, rate: 2.0, ma: 1, pa: 2, sight: 7.5, cost: { wood: 120, gold: 40 }, time: 20, cls: 'ship', layer: 1, slot: 'galley', wpn: 'board', scan: 5.5, sec: { atk: 4, rng: 4, rate: 1.5 }, swivel: true, kb: { light: 8, trade: 8, boat: 8 }, troops: 5 },
  // a burning raft a Port pushes out at enemy ships; it can't be steered and burns out on its own
  raft: { name: 'Fire Raft', hp: 60, spd: 1.7, atk: 0, rng: 0.6, rate: 1, ma: 0, pa: 3, sight: 6, cost: { wood: 40 }, time: 0, cls: 'ship', layer: 1, scan: 8, boom: { dmg: 35, r: 1.4 }, life: 30, nosel: true },
  frigate: { name: 'Frigate', hp: 300, spd: 2.4, atk: 30, rng: 7, rate: 4.0, ma: 2, pa: 3, sight: 8, cost: { wood: 200, gold: 120 }, time: 30, cls: 'ship', ranged: true, layer: 1, slot: 'frigate', wpn: 'cannon', kb: { galley: 10 }, miss: { light: 0.35, fireship: 0.35, raft: 0.5 } },
  flagship: { name: 'Flagship', hp: 650, spd: 2.0, atk: 24, rng: 7, rate: 3.5, ma: 3, pa: 4, sight: 9, cost: { wood: 450, gold: 300 }, time: 45, cls: 'ship', ranged: true, layer: 1, slot: 'flagship', one: true, civHp: [650, 1100, 800], wpn: 'cannon', sec: { atk: 6, rng: 7, rate: 1.5 }, fireA: true },
  deer: { name: 'Deer', hp: 14, spd: 1.3, atk: 0, rng: 0, rate: 1, ma: 0, pa: 0, sight: 3, cost: {}, time: 0, cls: 'animal' }
};
/* which civ each side plays: team 0 is always you and team 1 the AI, but either can be Melaka (civ 0)
   or Majapahit (civ 1). Set by the Game; read by stats, names and art through CV(team). */
let CIVMAP = [0, 1];
// which civ a team plays (0 Melaka, 1 Majapahit, 3 Ayutthaya)
function CV(team) { return team === 0 || team === 1 ? CIVMAP[team] : team; }
/* civ ids: 0 Melaka, 1 Majapahit, 3 Ayutthaya, 4 Khmer (2 stays the neutral team). CI(team) is the column in the
   [Melaka, Majapahit, Ayutthaya, Khmer] name and stat tables; a unit or building's `civ` is one id or a list */
const AYU_CIV = 3, KHM_CIV = 4;
// which column of a [Melaka, Majapahit, Ayutthaya, Khmer] table to read
function CI(team) { const c = CV(team); return c === 1 ? 1 : c === AYU_CIV ? 2 : c === KHM_CIV ? 3 : 0; }
// can this civ use this unit or building?
function civOk(d, team) { return d.civ == null || (Array.isArray(d.civ) ? d.civ.includes(CV(team)) : d.civ === CV(team)); }
const CIV_TITLE = ['Melaka', 'Majapahit', 'Neutral', 'Ayutthaya', 'Khmer'];
const CIV_REALM = ['Melaka Sultanate', 'Majapahit Empire', '', 'Kingdom of Ayutthaya', 'Khmer Empire'];
const TEAMMOD = [{ hp: 1, spd: 1, cost: 1, arm: 0 }, { hp: 0.92, spd: 1.12, cost: 0.85, arm: 1 }, { hp: 1, spd: 1, cost: 1, arm: 0 }, { hp: 1, spd: 1, cost: 1, arm: 0 }];
/* Majapahit naval doctrine on top of TEAMMOD: about 25% cheaper, 18% faster and 20% weaker ships */
const NAVMOD = { hp: 0.87, spd: 1.05, cost: 0.88 };
/* Melaka land soldiers cost 10% less (kerah levies; balance test 2026-11-04: civs 45/47/48% with it) */
const MEL_LEVY = 0.9;
/* naval weapons (lore/naval-combat.md). navTier per team is the age at sea: 0 arrows and boarding,
   1 adds fire arrows and swivel guns (lela/rentaka, cetbang) or crossbow volleys, 2 adds cannon.
   Burning ignores armour; buildings burn by material (timber, brick, stone), demos can change BURNMAT. */
const NAVWPN = { tierDefault: 2, swivelArmCut: 0.5, swivelCrew: 2, cannonBld: 1.5, noCannonAtk: 0.45 };
const BURN = { bld: 3, ship: 1, dur: 15, max: 3, portR: 4, portHeal: 2 };
const BURNMAT = [1, 0.5, 1, 0.8];
/* the civ rosters (unit-art field guide, lore/buildings.md, lore/ranged-units.md):
   [Melaka, Majapahit, Ayutthaya], each [local name, short button label]. A missing entry falls back to the
   English role, which is the `name` in UD/BD; civRole() gives that role, shown under the local name. */
const CIV_NAMES = {
  villager: [['Rakyat'], ['Kawula'], ['Phrai Ying']], archer: [['Pemanah'], ['Pamanah'], ['Phon Thanu', 'Thanu']],
  keris: [['Keris Warrior', 'Keris'], ['Golok Warrior', 'Golok'], ['Daab Song Mue', 'Daab']],
  tombak: [['Tombak Warrior', 'Tombak'], ['Galah Warrior', 'Galah'], ['Hok Warrior', 'Hok']],
  sumpit: [['Penyumpit', 'Sumpit']], lembing: [null, ['Lembing']], namai: [null, null, ['Na Mai']],
  pahlawan: [['Pahlawan']], bhaya: [null, ['Bhayangkara', 'Bhaya']], chang: [null, null, ['Chang Suek', 'Chang']],
  tabib: [['Tabib']], acaraki: [null, ['Acaraki']], mo: [null, null, ['Mo']],
  boat: [['Sampan'], ['Jukung'], ['Ruea Pramong', 'Pramong']], trade: [['Jong Dagang', 'Jong'], ['Jong Jawa', 'Jong'], ['Samphao']], fireship: [null, ['Perahu Api', 'Api']],
  light: [['Penjajap'], ['Jukung Perang', 'Perang'], ['Ruea Chai', 'Chai']], raft: [['Rakit Api'], ['Rakit Api'], ['Phae Fai']],
  galley: [['Lancaran'], ['Kelulus'], ['Ruea Rop', 'Rop']], frigate: [['Ghali'], ['Jong Perang', 'J. Perang'], ['Samphao Rop', 'Samphao']],
  flagship: [['Mendam Berahi', 'Berahi'], ['Jong Raya'], ['Suphannahong', 'Hong']],
  towncentre: [['Balai'], ['Pendopo'], ['Sala Klang']], house: [['Rumah'], ['Omah'], ['Ruean Thai', 'Ruean']], rafthouse: [null, null, ['Ruean Phae']], wat: [null, null, ['Wat']],
  farm: [['Ladang'], null, ['Na']], sawah: [null, ['Sawah']], store: [['Gudang'], ['Gudang'], ['Rong']],
  granary: [['Jelapang'], ['Lumbung'], ['Yung Khao']], barracks: [['Balai Laskar', 'Laskar'], ['Bale Prajurit', 'Prajurit'], ['Rong Thahan', 'Thahan']],
  port: [['Pelabuhan'], ['Pelabuhan'], ['Tha Ruea']], tower: [['Menara Kawal', 'Menara'], ['Bale Kulkul', 'Kulkul'], ['Pom']],
  palisade: [['Pagar Kayu'], ['Pagar Bambu'], ['Khai']], wall: [['Kubu'], ['Benteng Bata', 'Benteng'], ['Kamphaeng']],
  gate: [['Pintu Kota'], ['Candi Bentar'], ['Pratu']], rumahtabib: [['Rumah Tabib']], patirthan: [null, ['Patirthan']],
  palace: [['Istana'], ['Kraton'], ['Wang']], tradepost: [['Pangkalan'], ['Bandar'], ['Tha', 'Tha']]
};
const CIV_ROLE = { tradepost: [null, 'Tribute Post'], trade: ['Armed Trade Ship', 'Trade Ship', 'Trade Junk'] };
// the civ's name entry for a unit or building
function civEntry(kind, team) { const n = CIV_NAMES[kind]; return n && n[CI(team)]; }
// the English role name ("Spearman")
function civRole(kind, team) { const r = CIV_ROLE[kind]; return (r && r[CI(team)]) || (UD[kind] || BD[kind]).name; }
// the local name ("Tombak Warrior")
function civName(kind, team) { const e = civEntry(kind, team); return e ? e[0] : civRole(kind, team); }
// the short button label
function shortName(kind, team) { const e = civEntry(kind, team); return e ? e[1] || e[0] : civRole(kind, team); }
/* what each unit and building is for, in a few words: shown beside its English name in the panel */
const BRIEF = {
  villager: 'Gathers food, wood and gold, and builds', keris: 'Fast swordsman, runs down archers', tombak: 'Spearman, holds the line against elites',
  archer: 'Shoots from range, beats spearmen', sumpit: 'Poison darts, no gold needed', lembing: 'Heavy javelins, no gold needed', namai: 'Quick crossbow bolts, no gold needed',
  pahlawan: 'Champion warrior, few and deadly', bhaya: 'Royal guard, tough to shoot down', tabib: 'Heals one soldier at a time', mo: 'Heals one soldier at a time',
  acaraki: 'Slowly heals everyone nearby', chang: 'War elephant, huge and armoured', boat: 'Fishes at sea', trade: 'Sails to a trading post for gold',
  fireship: 'Burns enemy ships it rams', light: 'Fast raider, hunts fire and trade ships', galley: 'Boards enemy ships, carries 5 soldiers',
  raft: 'Burning raft pushed at enemy ships', frigate: 'Cannon ship, breaks harbours', flagship: 'One only, cannon and archers',
  towncentre: 'Trains villagers, takes every resource', house: 'Room for 10 more people', rafthouse: 'House on the water, a woman fishes from it',
  store: 'Stores wood and gold', granary: 'Stores food, build near farms',
  farm: 'Endless food', sawah: 'Rice terraces, more endless food', barracks: 'Trains troops', port: 'Builds ships, takes fish', tower: 'Shoots arrows at enemies',
  rumahtabib: 'Trains healers', patirthan: 'Heals units nearby, trains healers', wat: 'Trains healers, monks tend the wounded', palace: 'One only, trains the elite unit',
  tradepost: 'Trade ships bring gold here', palisade: 'Cheap wooden wall', wall: 'Strong wall, needs a Barracks', gate: 'Lets your people through the wall'
};
// the English name, when the local name differs from it
function enName(kind, team) { const r = civRole(kind, team); return r !== civName(kind, team) && r !== shortName(kind, team) ? r : ''; }
// button text: local name with (English) under it
function btnName(kind, team) { const e = enName(kind, team); return shortName(kind, team) + (e ? '<small class="en">(' + e + ')</small>' : ''); }
// "Local name (English)"
function fullName(kind, team) { const e = enName(kind, team); return civName(kind, team) + (e ? ' (' + e + ')' : ''); }

const BD = {
  towncentre: { name: 'Town Centre', size: 3, hp: 1200, pop: 8, drop: ['food', 'wood', 'gold'], train: ['villager'], atk: { dmg: 5, range: 7, rate: 2 }, sight: 10, cost: {}, time: 0, garrison: 15 },
  house: { name: 'House', size: 2, hp: 300, pop: 10, cost: { wood: 30 }, time: 14, sight: 4 },
  // one drop-off for wood and gold (the old Timber Mill and Gold Mine became Storehouses)
  store: { name: 'Storehouse', size: 2, hp: 400, cost: { wood: 100 }, time: 18, drop: ['wood', 'gold'], sight: 4 },
  farm: { name: 'Farm', size: 2, hp: 180, cost: { wood: 60 }, time: 10, walk: true, food: 400, sight: 3, civ: [0, 3] },
  // Majapahit rice terraces: cheaper, richer and faster to work than a farm, but they take more room
  sawah: { name: 'Rice Terrace', size: 3, hp: 270, cost: { wood: 45 }, time: 12, walk: true, food: 500, rate: 1.2, sight: 3, civ: 1 },
  barracks: { name: 'Barracks', size: 3, hp: 800, cost: { wood: 150 }, time: 30, train: ['keris', 'tombak', 'archer', 'sumpit', 'lembing', 'namai'], sight: 6 },
  port: { name: 'Port', size: 3, hp: 900, cost: { wood: 120 }, time: 30, drop: ['food'], train: ['boat', 'trade', 'fireship', 'light', 'galley', 'frigate', 'flagship'], shore: true, fh: 1, sight: 8 },
  granary: { name: 'Granary', size: 2, hp: 350, cost: { wood: 100 }, time: 18, drop: ['food'], sight: 4 },
  tower: { name: 'Watchtower', size: 2, hp: 600, civHp: [600, 800, 750], cost: { wood: 75, gold: 25 }, time: 25, atk: { dmg: 5, range: 7, rate: 1.8 }, sight: 11, civSight: [11, 9, 10], garrison: 5 },
  rumahtabib: { name: 'Physician\'s House', size: 3, hp: 500, cost: { wood: 120, gold: 30 }, time: 30, train: ['tabib'], needs: 'barracks', civ: 0, sight: 5 },
  patirthan: { name: 'Bathing Pool', size: 3, hp: 900, cost: { wood: 150, gold: 50 }, time: 40, train: ['acaraki'], needs: 'barracks', civ: 1, aura: { rng: 3, amt: 1, max: 10 }, sight: 5 },
  // Ayutthaya: the Wat trains the Mo and its monks tend the wounded nearby
  wat: { name: 'Temple', size: 3, hp: 700, cost: { wood: 120, gold: 40 }, time: 30, train: ['mo'], needs: 'barracks', civ: 3, aura: { rng: 2.5, amt: 1, max: 6 }, sight: 5 },
  // Ruean Phae: an Ayutthaya house built out on the water floats on a raft; a woman fishes from its deck
  rafthouse: { name: 'Raft House', size: 2, hp: 220, pop: 10, drop: ['food'], cost: { wood: 30 }, time: 12, sight: 4, civ: 3 },
  palace: { name: 'Palace', size: 4, hp: 2400, cost: { wood: 400, gold: 200 }, time: 60, train: ['pahlawan', 'bhaya', 'chang'], one: true, sight: 9 },
  tradepost: { name: 'Trading Post', size: 3, hp: 700, cost: { wood: 150, gold: 50 }, time: 30, site: true, sight: 7, civ: [0, 1, 3] },
  // walls are one tile each, laid in lines; gates let your own side through and stop everyone else
  palisade: { name: 'Palisade', size: 1, hp: 200, cost: { wood: 3 }, time: 3, wall: true, line: true, burn: 2, sight: 1 },
  wall: { name: 'Wall', size: 1, hp: 900, civHp: [900, 1200, 1100], cost: { wood: 5, gold: 2 }, time: 6, wall: true, line: true, needs: 'barracks', sight: 1 },
  gate: { name: 'Gate', size: 1, hp: 1100, civHp: [1100, 1400, 1300], cost: { wood: 30, gold: 10 }, time: 12, wall: true, gate: true, sight: 2 },
  village: { name: 'Orang Laut Village', size: 3, hp: 99999, cost: null, time: 0, neutral: true, sight: 0 }
};
/* gold a trade ship earns per round trip, by straight-line distance between Port and Trading Post */
const TRADE = { k: 1 / 40 / (MSX * MSY), civ: [1.2, 0.8, 1] };   // per civ column [Melaka, Majapahit, Ayutthaya]
/* Ayutthaya households: a house beside a worked paddy (or a raft house with a woman fishing) pays food */
const HOUSEHOLD = { every: 60, food: 15, max: 6 };
const FISH_RATE = 0.5;   // raft-house fishing, food per second
const TRIBUTE = 0.55;   // gold per second from each Majapahit Bandar
const BARM = { ma: 2, pa: 6 };
const WALL_MAX = 24;
const RAFT = { cd: 45, r: 12 };
