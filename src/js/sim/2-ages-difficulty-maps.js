/* ---------- ages (lore/ages.md, Iylia 2026-10-25) ----------
   Every civ climbs Village > Kingdom > Commerce > Golden at its Town Centre. A unit or building's `age` is the
   first age it can be made in and `maxAge` the last: the archer line turns to guns (Majapahit's into armoured
   archers first). Names stay clear of AGES / ageOf / ageOk, which the missions declare for themselves. */
const AGE_TABLE = [null,
  { name: 'Village Age', local: ['Kampung', 'Wanua', 'Ban'], tc: 1200 },
  { name: 'Kingdom Age', local: ['Kerajaan', 'Kadatwan', 'Mueang'], cost: { food: 500 }, time: 60, tc: 1700, need: { any: ['barracks', 'store', 'granary', 'port'], n: 2 } },
  { name: 'Age of Commerce', local: ['Bandar', 'Bandar', 'Nakhon'], cost: { food: 800, gold: 200 }, time: 90, tc: 2200, need: { any: ['palace', 'rumahtabib', 'patirthan', 'wat', 'tower', 'tradepost'], n: 2 } },
  { name: 'Golden Age', local: ['Kesultanan', 'Nusantara', 'Krung'], cost: { food: 1000, gold: 800 }, time: 120, tc: 2800, need: { all: ['palace', 'tradepost'], ayu: ['palace', 'wat'] } }
];
const AGE_MAX = 4;
const AGE_START_BONUS = { food: 300, wood: 300, gold: 200 };   // per age above the first, for Start in
Object.assign(UD, {
  // Age of Commerce: Melaka's Pembedil and Ayutthaya's Phon Puen take up the matchlock. Majapahit armours its
  // bowmen in the kere and gets guns only in the Golden Age (lore/ranged-units.md)
  gunner: { name: 'Arquebusier', hp: 38, spd: 2.2, atk: 10, bonus: { sword: 2, elite: 4 }, rng: 5.5, rate: 2.2, ma: 0, pa: 1, sight: 7.5, cost: { wood: 40, gold: 45 }, time: 11, cls: 'archer', ranged: true, gun: true, age: 3, maxAge: 3, civ: [0, 3] },
  kerearcher: { name: 'Armoured Archer', hp: 42, spd: 2.2, atk: 7, bonus: { spear: 3, elite: 3 }, rng: 6.5, rate: 1.5, ma: 1, pa: 2, sight: 8, cost: { wood: 35, gold: 40 }, time: 10, cls: 'archer', ranged: true, age: 3, maxAge: 3, civ: 1 },
  musket: { name: 'Royal Musketeer', hp: 46, spd: 2.1, atk: 15, bonus: { sword: 3, elite: 6 }, rng: 6.5, rate: 2.8, ma: 1, pa: 2, sight: 8, cost: { wood: 45, gold: 70 }, time: 13, cls: 'archer', ranged: true, gun: true, age: 4 },
  // bronze cannon: Melaka's Meriam and Ayutthaya's Puen Yai break walls; Majapahit's lighter cetbang is a gun
  // for shooting troops, weaker against buildings but one more allowed
  cannon: { name: 'Bronze Cannon', hp: 140, spd: 1.5, atk: 14, rng: 7.5, rate: 4.5, ma: 2, pa: 5, sight: 8.5, cost: { wood: 150, gold: 120 }, time: 22, cls: 'siege', ranged: true, gun: true, splash: 1.1, age: 3, civCap: [3, 4, 3], civBld: [45, 22, 45], civAtk: [14, 20, 14] }
});
UD.archer.maxAge = 2;
for (const k of ['tabib', 'mo', 'acaraki', 'pahlawan', 'bhaya', 'chang', 'galley', 'fireship']) UD[k].age = 2;
UD.frigate.age = 3; UD.flagship.age = 4;
for (const k of ['rumahtabib', 'patirthan', 'wat', 'palace', 'tradepost', 'wall']) BD[k].age = 2;
BD.barracks.train.push('kerearcher', 'gunner', 'musket', 'cannon');
BD.wall.burn = 0.25; BD.gate.burn = 0.25;
Object.assign(CIV_NAMES, {
  gunner: [['Pembedil'], null, ['Phon Puen', 'Puen']], kerearcher: [null, ['Pamanah Kere', 'Kere']],
  musket: [['Bedil Diraja', 'Diraja'], ['Bedil Kraton', 'Kraton'], ['Phon Puen Luang', 'P. Luang']], cannon: [['Meriam'], ['Cetbang'], ['Puen Yai']]
});
Object.assign(BRIEF, {
  gunner: 'Matchlock gunner, hits armour and elites hard', kerearcher: 'Archer in a mail coat, longer range',
  musket: 'Heavy musket, long range, slow to reload', cannon: 'Bronze gun, few allowed'
});
// the archer line by age, per civ column [Melaka, Majapahit, Ayutthaya]
const ARCHER_LINE = [['archer', 'archer', 'gunner', 'musket'], ['archer', 'archer', 'kerearcher', 'musket'], ['archer', 'archer', 'gunner', 'musket']];
function lineKind(team, age) { return ARCHER_LINE[CI(team)][Math.min(AGE_MAX, Math.max(1, age)) - 1]; }
function ageFits(d, age) { return ((d && d.age) || 1) <= age && !(d && d.maxAge && age > d.maxAge); }
function costWords(c) { return Object.keys(c).map(k => c[k] + ' ' + k).join(', '); }
// light ranged units never get guns: from the Age of Commerce their darts, javelins and bolts are poisoned
// gunpowder rules from the Lam Son Stand: shots ignore 3 armour; a gunner standing still 1.5 s hits 35% harder
const GUN = { pierce: 3, still: 1.35, stillT: 1.5 };
const SKIRM_PSN = { dps: 1.2, dur: 4 }, SUMPIT_PSN = { dps: 2, dur: 5 };   // Port fire raft: cooldown in seconds, how far it looks for ships   // longest wall line laid in one go, in tiles
const NK = {
  tree: { type: 'wood', amt: 200, rate: 1.2 }, berry: { type: 'food', amt: 250, rate: 1.3 },
  gold: { type: 'gold', amt: 1000, rate: 1.0 }, fish: { type: 'food', amt: 400, rate: 1.4 },
  carcass: { type: 'food', amt: 120, rate: 1.8 }
};
const FARM_RATE = 0.9;
const FIELD = { farm: 1, sawah: 1 };   // buildings villagers farm
const DIFF = {
  // wave0: the quiet start (never shown): no attacks before it, nor before the Kingdom Age. gap: the least time between attacks
  easy: { wave0: 600, gap: 240, base: 6, grow: 2, vil: 9, milBase: 4, milRate: 70 },
  normal: { wave0: 420, gap: 180, base: 8, grow: 3, vil: 12, milBase: 7, milRate: 45 },
  hard: { wave0: 300, gap: 120, base: 10, grow: 3, vil: 15, milBase: 10, milRate: 30 }
};
const STARTS = [{ x: 10, y: 21 }, { x: 50, y: 11 }];
/* skirmish maps (Iylia, 2026-10-24): the Strait, Riverlands and Big Islands. Each has its own start corners
   and the spots where gold, deer and Orang Laut villages are looked for. */
const MAPDEF = {
  strait: { name: 'The Strait', starts: STARTS },
  river: { name: 'Riverlands', starts: [{ x: 7, y: 25 }, { x: 52, y: 5 }],
    rivers: [[[[-1, 16], [12, 18], [24, 13], [34, 19], [46, 16], [65, 20]], 2.0], [[[30, -1], [28, 8], [34, 19], [31, 29], [36, 39], [33, 49]], 2.0],
      [[[-1, 38], [10, 35], [20, 39], [31, 29]], 1.6], [[[46, 16], [52, 27], [60, 31], [65, 35]], 1.6]],
    fords: [[0, 0], [0, 3], [1, 0], [1, 4], [2, 1], [3, 1]],
    cliffs: [[18, 27, 2, 3], [44, 31, 2.5, 2], [20, 6, 2, 2], [56, 41, 2, 2.5], [40, 8, 2, 1.6]],
    gold: [[20, 7], [44, 27], [22, 43], [55, 42], [36, 12]], deer: [[22, 24], [42, 9], [12, 44], [50, 38], [16, 8], [30, 44], [58, 20]],
    villages: [[22, 30], [42, 22], [10, 42]] },
  islands: { name: 'Big Islands', starts: [{ x: 11, y: 32 }, { x: 49, y: 8 }],
    isles: [[14, 34, 11.5, 9], [50, 11, 11.5, 9], [14, 11, 10.5, 8], [50, 36, 10.5, 8.5]],
    gold: [[14, 10], [50, 37], [18, 14], [46, 33], [22, 38], [42, 7]], deer: [[10, 12], [52, 34], [20, 30], [44, 14]],
    villages: [[14, 6], [52, 42], [22, 16]] }
};
(function scaleMaps() {
  if (MSX === 1 && MSY === 1) return;
  const pt = (p) => [p[0] * MSX, p[1] * MSY], el = (c) => [c[0] * MSX, c[1] * MSY, c[2] * MSX, c[3] * MSY];
  for (const k in MAPDEF) {
    const m = MAPDEF[k];
    // a start is the corner of a 3x3 Town Centre: scale its middle
    for (const st of m.starts) { st.x = Math.round((st.x + 1.5) * MSX - 1.5); st.y = Math.round((st.y + 1.5) * MSY - 1.5); }
    if (m.rivers) m.rivers = m.rivers.map(([pts, w]) => [pts.map(pt), w * 1.3]);
    if (m.cliffs) m.cliffs = m.cliffs.map(el);
    if (m.isles) m.isles = m.isles.map(el);
    for (const f of ['gold', 'deer', 'villages']) if (m[f]) m[f] = m[f].map(p => pt(p).map(Math.round));
  }
})();

function rectOfTiles(tx, ty, w, h) { return { ax: tx, ay: ty, bx: tx + w, by: ty + h }; }
function rectDist(px, py, r) {
  const dx = Math.max(r.ax - px, 0, px - r.bx), dy = Math.max(r.ay - py, 0, py - r.by);
  return Math.sqrt(dx * dx + dy * dy);
}

