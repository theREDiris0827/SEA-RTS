/* ===== km-art.js ===== */
/* Khmer blue for the player, Ayutthaya royal purple for the besiegers (Iylia, 2026-10-23) */
Object.assign(TEAMC[0], { name: 'Khmer', main: '#2f6fd0', dark: '#1c4590', trim: '#f2c94c', roofA: '#a8573a', roofB: '#86432c', roofR: '#2a1810', ring: '#8ab8ff' });
Object.assign(TEAMC[1], { name: 'Ayutthaya', main: '#7b4bb3', dark: '#4e2d78', trim: '#f2c94c', roofA: '#b5523a', roofB: '#8e3d2a', roofR: '#3a1e14', ring: '#c9a3ff' });
// the shared art files carry their own palettes: set them before any sprite is made
Object.assign(MAIN.CIVC.ayu, { main: '#7b4bb3', dark: '#4e2d78', ring: '#c9a3ff' });
Object.assign(MAIN.KHC, { main: '#2f6fd0', dark: '#1c4590', ring: '#8ab8ff' });
if (TEAMC[5]) Object.assign(TEAMC[5], { main: '#2f6fd0', dark: '#1c4590', ring: '#8ab8ff' });
if (TEAMC[3]) Object.assign(TEAMC[3], { main: '#7b4bb3', dark: '#4e2d78', ring: '#c9a3ff' });
MINIC[0] = ['#2f6fd0', '#8ab8ff']; MINIC[1] = ['#a77ad6', '#d8c0ff'];   // minimap: Khmer blue, Ayutthaya purple
const KBLUE = '#2f6fd0', KBLUE_D = '#1c4590', APURP = '#7b4bb3';
const SAFF = '#e0882a', SAFF_D = '#b8661c', SAFF_L = '#f2a64a', BRONZE = '#a8803c', BRONZE_L = '#d4a85a', BRONZE_D = '#7a5a26';

/* ---------- people ---------- */
function unitSprite(kind, team, anim, f, tool) {
  const d = UD[kind], a = anim === 'work' ? 'idle' : anim, ff = anim === 'walk' ? f : Math.min(2, f);
  if (!d) return baseUnitSprite(kind, team, anim, f, tool);
  if (d.ayu === 'villager') return kmWomanSprite(anim, anim === 'walk' ? f : Math.min(2, f));
  if (d.ayu) return MAIN.civUnitSprite('ayu', d.ayu, a, ff);
  if (d.km) return MAIN.khmerUnitSprite(d.km, a, ff);
  if (d.healer != null) return HEAL.healerSprite(d.healer, anim === 'attack' ? 'heal' : anim === 'walk' ? 'walk' : 'idle', anim === 'walk' ? f : Math.min(2, f));
  if (d.big === 'chang') return MAIN.elephantSprite(a === 'attack' ? 'attack' : a, Math.min(a === 'walk' ? 3 : 1, f));
  if (d.big === 'king') return kingSprite(a, a === 'walk' ? f : Math.min(1, f));
  if (d.big === 'kbal') return MAIN.ballistaElephantSprite(a, a === 'walk' ? f : Math.min(1, f));
  if (d.big === 'kcart') return cartBallistaSprite(a, a === 'walk' ? f : Math.min(1, f));
  if (d.big === 'ponhea') return ponheaSprite(a, ff);
  if (d.load === 'monks' || d.load === 'texts') return monksSprite(d.load === 'texts', a === 'walk' ? f : 0);
  if (d.load === 'treasury' || d.load === 'statue') return oxCartSprite(kind, a === 'walk' ? f : 0);
  if (d.load === 'royal') return palanquinSprite(a === 'walk' ? f : 0);
  return baseUnitSprite(kind, team, anim, f, tool);
}
/* Phrai Ying: a village woman of Ayutthaya (from the Ayutthaya demo). 16x18 */
function kmWomanSprite(anim, f) {
  return sprite('ayw|' + anim + '|' + f, 16, 18, 2, (P) => {
    const r = P.r, walk = anim === 'walk', work = anim === 'work';
    const bob = (walk && (f === 1 || f === 3)) ? -1 : 0, low = work && f === 1 ? 1 : 0;
    const B = (x, y, w, h, c) => r(x, y + 2 + bob, w, h, c);
    const SIN = '#7a3b2e', SIN_L = '#a85a3a', SABAI = APURP, SABAI_L = '#a77ad6';
    const st = walk ? [[5, 9], [6, 8], [6, 9], [5, 8]][f] : [6, 8];
    r(st[0], 16, 2, 1, SKIN_D); r(st[1], 16, 2, 1, SKIN_D);
    B(5, 10, 6, 5, SIN); B(5, 14, 6, 1, SIN_L); B(5, 12, 6, 1, SIN_L);
    B(5, 7, 6, 3, SKIN); B(5, 8, 6, 2, SABAI); B(5, 7, 2, 1, SABAI); B(6, 9, 5, 1, SABAI_L); B(5, 10, 6, 1, GOLD_D);
    B(4, 8, 1, 3 + low, SKIN);
    if (work) { B(11, 9 + low, 1, 3, SKIN); B(10, 12 + low, 3, 2, '#c9a35a'); }
    else { B(11, 8, 1, 3, SKIN); B(11, 10, 3, 3, '#c9a35a'); B(11, 10, 3, 1, '#e0c07a'); }
    B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR);
    B(6, 2, 4, 1, HAIR); B(5, 3, 1, 2, HAIR); B(7, 1, 2, 1, HAIR); B(9, 6, 1, 1, GOLD);
  });
}
/* the king of Ayutthaya on his royal elephant, under the white tiered umbrella of a Thai king */
function kingSprite(anim, f) {
  return sprite('ayking|' + anim + '|' + f, 28, 33, 2, (P) => {
    const el = MAIN.elephantSprite(anim, f);
    P.x.drawImage(el, 0, 7, el.width / 2, el.height / 2);
    const r = P.r, WH = '#f6f2e6', WD = '#cfc8b4';
    r(13, 1, 1, 13, GOLD_D);
    for (let i = 0; i < 3; i++) { const w = 11 - i * 3, y = 6 - i * 2; r(13 - (w >> 1), y, w, 2, WH); r(13 - (w >> 1), y + 1, w, 1, WD); r(13 - (w >> 1), y + 1, 1, 1, GOLD); }
    r(13, 0, 1, 1, GOLD);
    r(12, 11, 3, 2, GOLD); r(12, 10, 3, 1, APURP);
  });
}
/* King Ponhea Yat on foot: a Bayon swordsman with a gold mukuta crown, under a gold royal parasol. 20x30 */
function ponheaSprite(anim, f) {
  return sprite('ponhea|' + anim + '|' + f, 20, 30, 2, (P) => {
    const s = MAIN.khmerUnitSprite('sword', anim, f);
    P.x.drawImage(s, 2, 11, s.width / 2, s.height / 2);
    const r = P.r, bob = anim === 'walk' && (f === 1 || f === 3) ? -1 : 0;
    // gold collar and a gilded sampot hem
    r(7, 20 + bob, 6, 1, GOLD); r(7, 23 + bob, 6, 1, GOLD_D);
    // the mukuta: a tall tiered gold crown in place of the topknot
    r(8, 12 + bob, 4, 2, GOLD); r(9, 10 + bob, 2, 2, GOLD); r(9, 9 + bob, 2, 1, GOLD_D); r(10, 8 + bob, 1, 1, GOLD);
    r(8, 14 + bob, 4, 1, GOLD_D);
    // the parasol: a staff carried at his back, a gold canopy with a fringe
    r(4, 3, 1, 18 + bob, WOOD_D);
    r(0, 3, 10, 2, GOLD); r(1, 2, 8, 1, GOLD); r(2, 1, 6, 1, '#f6e08a'); r(4, 0, 2, 1, GOLD_D);
    for (let x = 0; x < 10; x += 2) r(x, 5, 1, 1, KBLUE);
  });
}
/* the monks of the royal temples: shaven heads, saffron robes, one bare shoulder. With the
   sacred texts, each carries a bundle of palm-leaf manuscripts wrapped in cloth. 26x18 */
function monksSprite(texts, f) {
  return sprite('monks|' + (texts ? 1 : 0) + '|' + f, 26, 18, 2, (P) => {
    const r = P.r;
    for (const [x, ph] of [[1, 0], [9, 1], [17, 2]]) {
      const ff = (f + ph) & 3, bob = (ff === 1 || ff === 3) ? -1 : 0;
      const st = [[2, 4], [3, 3], [3, 4], [2, 3]][ff];
      r(x + st[0], 16, 2, 1, SKIN_D); r(x + st[1] + 2, 16, 2, 1, SKIN_D);
      r(x + 1, 7 + bob, 7, 9, SAFF); r(x + 1, 7 + bob, 2, 3, SKIN); r(x + 3, 8 + bob, 4, 1, SAFF_L); r(x + 6, 9 + bob, 1, 7, SAFF_D); r(x + 1, 15 + bob, 7, 1, SAFF_D);
      r(x + 2, 3 + bob, 4, 4, SKIN); r(x + 2, 3 + bob, 4, 1, '#c08a5a'); r(x + 5, 5 + bob, 1, 1, HAIR); r(x + 2, 6 + bob, 4, 1, SKIN_D);
      if (texts) { r(x + 1, 0 + bob, 6, 2, '#c9a35a'); r(x + 1, 0 + bob, 6, 1, '#e8cf8a'); r(x + 3, 0 + bob, 2, 2, '#8a2e22'); r(x + 2, 2 + bob, 1, 1, SKIN); r(x + 5, 2 + bob, 1, 1, SKIN); }
      else if (ph === 0) { r(x + 8, 4 + bob, 1, 12, WOOD_D); r(x + 6, 3 + bob, 5, 1, SAFF_D); r(x + 7, 2 + bob, 3, 1, SAFF); }   // the abbot's fan
    }
  });
}
/* a zebu ox and a two-wheeled cart, with the temple treasury or a bronze statue lashed on. 34x22 */
function oxCartSprite(kind, f) {
  return sprite('oxcart|' + kind + '|' + f, 34, 22, 2, (P) => {
    const r = P.r, walk = f & 1;
    // the cart
    r(1, 13, 16, 2, WOOD); r(1, 13, 16, 1, '#a8773c'); r(16, 13, 6, 1, WOOD_D);
    for (const cx of [9]) { disc(P, cx, 16, 4, WOOD_D); disc(P, cx, 16, 3, WOOD); r(cx, 13, 1, 7, WOOD_D); r(cx - 3, 16, 7, 1, WOOD_D); r(cx, 16, 1, 1, GOLD_D); }
    if (kind === 'l_treasury') {
      r(3, 7, 11, 6, '#7a2e1e'); r(3, 7, 11, 1, '#a0442a'); r(3, 9, 11, 1, GOLD); r(3, 12, 11, 1, '#5a1e12'); r(8, 9, 2, 3, GOLD); r(4, 6, 9, 1, '#5a1e12');
      r(12, 5, 3, 2, '#c9a35a'); r(2, 5, 3, 2, '#c9a35a');
    } else if (kind === 'l_statue') {
      // the seated Buddha on a lotus base, wrapped against the road
      r(3, 11, 11, 2, BRONZE_D); r(4, 9, 9, 2, BRONZE); r(5, 5, 7, 4, BRONZE); r(6, 5, 1, 4, BRONZE_L);
      r(7, 1, 3, 4, BRONZE); r(7, 1, 1, 3, BRONZE_L); r(8, 0, 1, 1, BRONZE_D); r(4, 9, 9, 1, BRONZE_L);
      r(3, 7, 2, 4, SAFF); r(12, 7, 2, 4, SAFF);
    } else {
      // standing four-armed Vishnu
      r(5, 11, 7, 2, BRONZE_D); r(7, 4, 3, 7, BRONZE); r(7, 4, 1, 7, BRONZE_L);
      r(5, 5, 2, 1, BRONZE); r(10, 5, 2, 1, BRONZE); r(4, 7, 2, 1, BRONZE); r(11, 7, 2, 1, BRONZE); r(4, 4, 1, 1, BRONZE_L); r(12, 4, 1, 1, BRONZE_L);
      r(7, 0, 3, 4, BRONZE); r(8, 0, 1, 1, BRONZE_L); r(7, 0, 3, 1, BRONZE_D);
      r(3, 9, 2, 3, SAFF); r(12, 9, 2, 3, SAFF);
    }
    // the ox, a pale humped zebu
    const lg = walk ? [[22, 2], [27, 0], [29, 2], [24, 0]] : [[22, 1], [25, 1], [27, 1], [30, 1]];
    for (const [x, o] of lg) r(x, 16 + o, 1, 4 - o, '#8c8170');
    r(21, 10, 11, 6, '#d8cfb8'); r(21, 15, 11, 1, '#b8ab92'); r(23, 8, 3, 2, '#d8cfb8'); r(24, 7, 2, 1, '#b8ab92');
    r(31, 9, 3, 4, '#d8cfb8'); r(33, 11, 1, 2, '#8c8170'); r(31, 8, 1, 1, '#4a3a2a'); r(33, 8, 1, 1, '#4a3a2a'); r(32, 10, 1, 1, HAIR);
    r(20, 11, 1, 3, '#8c8170'); r(26, 10, 1, 6, '#b8ab92');
    r(21, 12, 2, 1, KBLUE);   // a blue cloth on the yoke
  });
}
/* the royal palanquin: four bearers, a gilded box with a tiered roof, the white parasol above. 32x28 */
function palanquinSprite(f) {
  return sprite('palanquin|' + f, 32, 28, 2, (P) => {
    const r = P.r;
    for (const [x, ph] of [[2, 0], [9, 1], [19, 1], [26, 0]]) {
      const ff = (f + ph) & 3, bob = (ff === 1 || ff === 3) ? -1 : 0;
      r(x + 1, 25, 1, 3, SKIN_D); r(x + 3, 25 - (ff & 1), 1, 3, SKIN_D);
      r(x, 19 + bob, 5, 3, SKIN); r(x, 21 + bob, 5, 3, KBLUE); r(x, 22 + bob, 5, 1, KBLUE_D);
      r(x + 1, 15 + bob, 3, 4, SKIN); r(x + 1, 14 + bob, 3, 1, HAIR);
    }
    r(0, 17, 32, 1, WOOD_D); r(0, 16, 32, 1, '#c9973a');                          // the carrying poles
    r(8, 9, 16, 7, KBLUE); r(8, 9, 16, 1, GOLD); r(8, 15, 16, 1, GOLD_D); r(10, 10, 12, 5, KBLUE_D); r(15, 10, 2, 5, GOLD);
    for (let i = 0; i < 3; i++) { const w = 18 - i * 5; r(16 - (w >> 1), 7 - i * 2, w, 2, i % 2 ? GOLD_D : GOLD); }
    r(15, 1, 2, 2, GOLD);
    // the parasol over the king
    r(26, 0, 1, 16, WOOD_D); r(22, 0, 9, 2, '#f6f2e6'); r(23, 2, 7, 1, '#cfc8b4'); r(26, 0, 1, 1, GOLD);
  });
}
/* Cart Ballista: the wheeled double-bow crossbow of the Bayon reliefs, two Khmer crew */
function cartBallistaSprite(anim, f) {
  return sprite('kcart|' + anim + '|' + f, 30, 20, 2, (P) => {
    const r = P.r, walk = anim === 'walk', fire = anim === 'attack';
    const C = MAIN.KHC, K = KBLUE;
    for (const [x, ph] of [[2, 0], [7, 1]]) {
      const bob = walk && ((f + ph) & 1) ? -1 : 0;
      r(x + 1, 15, 1, 4, SKIN_D); r(x + 3, 15, 1, 4, SKIN_D);
      r(x, 9 + bob, 5, 6, SKIN); r(x, 12 + bob, 5, 3, K); r(x + 1, 5 + bob, 3, 4, SKIN); r(x + 1, 4 + bob, 3, 1, HAIR); r(x + 2, 2 + bob, 1, 2, HAIR);
    }
    r(9, 12, 18, 3, WOOD); r(9, 12, 18, 1, '#a8773c'); r(10, 14, 16, 1, K);
    for (const cx of [12, 23]) { disc(P, cx, 16, 3, WOOD_D); disc(P, cx, 16, 2, WOOD); r(cx, 16, 1, 1, GOLD_D); if (walk) r(cx + ((f & 1) ? 1 : -1), 14, 1, 1, WOOD_D); }
    r(12, 9, 15, 2, WOOD_D); r(12, 9, 15, 1, '#8a5a2b');
    r(25, 3, 1, 6, WOOD); r(25, 11, 1, 1, WOOD); r(26, 2, 1, 1, WOOD); r(21, 5, 1, 4, WOOD); r(22, 4, 1, 1, WOOD);
    if (!(fire && f === 1)) { r(14, 8, 13, 1, '#d8d0b0'); r(27, 8, 1, 1, STEEL); r(24, 3, 1, 5, '#d8d0b0'); }
    else { r(24, 4, 1, 4, '#d8d0b0'); r(27, 7, 3, 1, '#d8d0b0'); }
    r(15, 7, 3, 2, C.dark); r(15, 7, 3, 1, '#cfc6b0');
  });
}

/* ---------- ships ---------- */
function kmShip(kind, team) {
  if (kind === 'boat') return MAIN.mainlandShip('km', 'fishing');
  if (kind === 'canoe') return MAIN.khmerCanoeSprite();
  if (kind === 'barge') return MAIN.mainlandShip('km', 'galley');
  if (kind === 'rbarge') return MAIN.mainlandShip('km', 'flagship');
  if (kind === 'light' && team === 1) return MAIN.mainlandShip('ayu', 'light');
  return null;
}
function shipSprite(u) { return kmShip(u.kind, u.team) || baseShipSprite(u); }
function shipAnchor(kind, team) {
  const spr = kmShip(kind, kind === 'light' ? 1 : 0);
  return spr ? [spr.width >> 1, Math.round(spr.height * 0.82)] : baseShipAnchor(kind, team);
}

/* ---------- buildings ---------- */
const KM_BLD = { towncentre: 'towncentre', house: 'house', khouse: 'house', tower: 'tower', karogya: 'healer', baray: 'baray', bayon: 'palace' };
const AY_BLD = { towncentre: 'towncentre', house: 'house', tower: 'tower', wat: 'healer' };
function buildingSprite(kind, team, level) {
  if (kind === 'wall' || kind === 'kwall') return lateriteWallSprite(level || 0);
  if (kind === 'kgate') return faceGateSprite(level || 0);
  if (kind === 'phaniat') return kraalSprite();
  if (kind === 'rong') return XB.storehouse(0);
  if (team === 1) {
    if (AY_BLD[kind]) return AYB.ayBuilding(AY_BLD[kind]);
    if (kind === 'barracks') return MAIN.mainlandBase('ayu', 'barracks');
    return baseBuildingSprite(kind, team, level);
  }
  if (kind === 'granary' || kind === 'kgranary') return MAIN.mainlandBuilding('km', 'granary');
  if (kind === 'barracks' || kind === 'port') return MAIN.mainlandBase('km', kind);
  if (kind === 'kpalace') return MAIN.mainlandBuilding('km', 'palace');
  if (KM_BLD[kind]) return KMB.kmBuilding(KM_BLD[kind]);
  return baseBuildingSprite(kind, team, level);
}
/* Angkor Thom's laterite wall: pitted blocks under a sandstone coping, run by run */
function lateriteWallSprite(mask) {
  return sprite('kmwall|' + mask, 16, 26, 2, (P) => {
    const r = P.r, n = mask & 1, e = mask & 2, s = mask & 4, w = mask & 8;
    const across = e || w || !(n || s);
    if (n || s) {
      const y0 = n ? 0 : 6, y1 = s ? 26 : 22;
      KMB.kmLaterite(P, 2, y0 + 4, 12, y1 - y0 - 4); r(2, y0 + 4, 1, y1 - y0 - 4, KMB.KM_LAT_L); r(13, y0 + 4, 1, y1 - y0 - 4, KMB.KM_LAT_D);
      r(2, y0 + 2, 12, 2, KMB.KM_SAND); r(2, y0 + 2, 12, 1, KMB.KM_SAND_L);
    }
    if (across) {
      const x0 = w ? 0 : 1, x1 = e ? 16 : 15;
      KMB.kmLaterite(P, x0, 8, x1 - x0, 16); r(x0, 23, x1 - x0, 2, KMB.KM_LAT_D);
      KMB.kmCoping(P, x0 + 1, 6, x1 - x0 - 2);
      for (let x = x0 + 1; x < x1 - 2; x += 5) { r(x, 3, 3, 3, KMB.KM_SAND); r(x, 3, 3, 1, KMB.KM_SAND_L); r(x + 1, 2, 1, 1, KMB.KM_SAND_L); }
    }
  });
}
/* the face gate: teak doors shut (0), swung open (1), or cracked and scorched (2) */
const _gateC = {};
function faceGateSprite(level) {
  if (_gateC[level]) return _gateC[level];
  const base = KMB.kmBuilding('gate'), c = document.createElement('canvas'); c.width = base.width; c.height = base.height;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0);
  const R = (px, py, w, h, col) => { x.fillStyle = col; x.fillRect(px * 2, py * 2, w * 2, h * 2); };
  if (level !== 1) {
    for (let i = 18; i < 30; i++) R(i, 34, 1, 12, i % 3 === 0 ? '#5e3a1c' : '#7a4d26');
    R(19, 32, 10, 2, '#6b4422'); R(23, 34, 2, 12, '#3a2412'); R(18, 38, 12, 1, '#4a3018'); R(18, 43, 12, 1, '#4a3018');
    R(21, 40, 1, 1, '#c9973a'); R(26, 40, 1, 1, '#c9973a');
    if (level === 2) { R(22, 36, 4, 6, '#1e140b'); R(20, 35, 2, 2, '#2a1d14'); R(26, 41, 3, 2, '#2a1d14'); R(30, 30, 3, 2, '#5a3a2a'); }
  } else { R(18, 34, 2, 12, '#7a4d26'); R(28, 34, 2, 12, '#7a4d26'); }
  return (_gateC[level] = c);
}
/* Phaniat: Ayutthaya's elephant kraal, a ring of teak logs with a royal pavilion */
function kraalSprite() {
  return sprite('ay|phaniat', 48, 52, 2, (P) => {
    const r = P.r;
    r(1, 30, 46, 18, '#9a7a4a'); r(1, 30, 46, 1, '#b8955a');
    const log = (x, top, bot) => { r(x, top, 2, bot - top, '#7a4d26'); r(x, top, 1, bot - top, '#9c6a36'); r(x, top - 1, 2, 1, '#c9a56a'); };
    for (let x = 2; x < 46; x += 3) log(x, 22, 34);
    const el = MAIN.elephantSprite('idle', 0);
    P.x.drawImage(el, 9, 17, el.width / 2, el.height / 2);
    r(30, 20, 14, 10, '#c9b27a'); for (const x of [30, 36, 43]) r(x, 20, 1, 10, '#744620');
    for (let i = 0; i < 8; i++) { const w = 3 + i * 1.2; r(37 - Math.round(w), 11 + i, Math.round(w * 2), 1, i % 3 === 2 ? '#8e3322' : '#b8452c'); }
    r(36, 8, 2, 3, GOLD); r(37, 6, 1, 2, GOLD);
    for (let x = 2; x < 46; x += 3) log(x, 38, 48);
    r(1, 42, 46, 1, '#5a3a1e'); r(1, 46, 46, 1, '#5a3a1e');
    r(3, 10, 1, 28, WOOD_D); r(4, 11, 7, 5, APURP); r(4, 11, 7, 1, GOLD); r(6, 13, 3, 1, GOLD);
  });
}

/* ---------- world overlays ---------- */
function paintUnit(u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE;
  if (d.hero) { ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, 16, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  if (d.cls === 'load') { const p = 0.5 + 0.5 * Math.sin(nowS * 4); ctx.strokeStyle = 'rgba(242,201,76,' + (0.5 + 0.4 * p).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ell(px, py + 4, 24, 9); ctx.stroke(); ctx.setLineDash([]); }
  if (d.foeHero) { ctx.strokeStyle = '#c9a3ff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.8; ell(px, py + 3, 22, 9); ctx.stroke(); ctx.globalAlpha = 1; }
  basePaintUnit(u);
  if (d.hero || d.foeHero || d.cls === 'load' || d.royal) {
    const spr = u.layer ? null : unitSprite(u.kind, u.team, 'idle', 0);
    const top = py - (spr ? spr.height : 40) + 2;
    hpBar(px - 13, top - 6, 26, u.hp / u.maxHp);
    if (d.hero) { ctx.fillStyle = '#17110c'; ctx.fillRect(px - 21, top - 9, 7, 7); ctx.fillStyle = '#f2c94c'; ctx.fillRect(px - 19, top - 9, 3, 7); ctx.fillRect(px - 21, top - 7, 7, 3); }
  }
  // a barge's cargo rides on its deck
  if (u.cargo) cargoGlyph(u.cargo, px, py - 30);
}
function cargoGlyph(key, x, y, c) {
  c = c || ctx;
  c.fillStyle = 'rgba(12,18,16,0.82)'; c.fillRect(x - 9, y - 9, 18, 16);
  c.strokeStyle = '#f2c94c'; c.lineWidth = 1; c.strokeRect(x - 9.5, y - 9.5, 19, 17);
  if (key === 'monks' || key === 'texts') { c.fillStyle = SAFF; c.fillRect(x - 5, y - 2, 10, 7); c.fillStyle = SKIN; c.fillRect(x - 3, y - 7, 6, 5); if (key === 'texts') { c.fillStyle = '#c9a35a'; c.fillRect(x - 5, y - 8, 10, 3); } }
  else if (key === 'treasury') { c.fillStyle = '#7a2e1e'; c.fillRect(x - 6, y - 4, 12, 8); c.fillStyle = GOLD; c.fillRect(x - 6, y - 1, 12, 2); c.fillRect(x - 1, y - 1, 2, 4); }
  else if (key === 'royal') { c.fillStyle = GOLD; c.fillRect(x - 5, y - 2, 10, 6); c.fillRect(x - 3, y - 5, 6, 3); c.fillRect(x - 1, y - 8, 2, 3); }
  else { c.fillStyle = BRONZE; c.fillRect(x - 4, y - 1, 8, 6); c.fillRect(x - 2, y - 7, 4, 6); c.fillStyle = BRONZE_L; c.fillRect(x - 2, y - 7, 1, 6); }
}
function paintBuilding(b) {
  const lvl0 = b.kind === 'kgate' ? (b.open ? 1 : b.hp < b.maxHp * 0.5 ? 2 : 0) : null;
  if (lvl0 != null) {
    const px = b.tx * TILE, py = b.ty * TILE, w = b.size * TILE, spr = faceGateSprite(lvl0);
    const dx = px + (w - spr.width) / 2, dy = py + w - spr.height + 2;
    shadow(px + w / 2, py + w - 6, w * 0.46, w * 0.2, 0.26);
    ctx.drawImage(spr, dx, dy);
    if (b.hit > 0) { ctx.globalAlpha = 0.4; ctx.drawImage(whiteOf(spr), dx, dy); ctx.globalAlpha = 1; }
    if (isSel(b)) { ctx.strokeStyle = TEAMC[b.team].ring; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(px - 1, py - 1, w + 2, w + 2); ctx.setLineDash([]); }
    if (isSel(b) || b.hp < b.maxHp) hpBar(px + w * 0.15, dy + 2, w * 0.7, b.hp / b.maxHp);
  } else basePaintBuilding(b);
  if (b.burnT > 0 && b.hp > 0) {
    const w = b.size * TILE, px = b.tx * TILE, py = b.ty * TILE, big = b.burnR >= LBURN.rate;
    for (let i = 0; i < (big ? 2 + b.size : 1); i++) {
      const fx = px + 6 + hash2(b.id, i, 3) * (w - 12), fy = py + w * 0.25 + hash2(b.id, i, 4) * w * 0.4, h = (big ? 6 : 3) + ((Math.floor(nowS * 8) + i) % 3) * 3;
      ctx.fillStyle = '#e2562c'; ctx.fillRect(fx - 3, fy - h, 6, h); ctx.fillStyle = '#f6b33a'; ctx.fillRect(fx - 2, fy - h + 2, 4, h - 3); ctx.fillStyle = '#fff3a0'; ctx.fillRect(fx - 1, fy - 3, 2, 2);
    }
  }
}
// markers: the gate under attack, the road to the landing, the way out across the lake, the royal compound
function paintMission() {
  const M = G.M; if (!M) return;
  const pulse = 0.5 + 0.5 * Math.sin(nowS * 3);
  const ring = (x, y, rx, ry, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.lineDashOffset = -nowS * 18; ell(x, y, rx, ry); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; };
  // the gate the elephants are battering
  if (M.gateHitT && G.t - M.gateHitT < 3 && M.gateHitK) {
    const b = G.byId.get(M.gates[M.gateHitK]);
    if (b && b.hp > 0) ring(b.x * TILE, b.y * TILE + 10, 64 + pulse * 6, 32 + pulse * 3, 'rgba(226,86,44,' + (0.45 + 0.45 * pulse).toFixed(2) + ')');
  }
  // the road: South Gate postern to the landing, while anything is on it
  const onRoad = LOADS.some(L => M.loads[L.key].st === 'road');
  if (onRoad || M.loads.royal.st === 'home' && M.courtReady) {
    const q = GATES.s, a = [q.in[0] * TILE, q.in[1] * TILE], b = [q.out[0] * TILE, q.out[1] * TILE], c = [M.dock.x * TILE, M.dock.y * TILE];
    ctx.strokeStyle = 'rgba(242,201,76,' + (0.35 + 0.35 * pulse).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -nowS * 24;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ring(c[0], c[1] + 4, 30, 14, 'rgba(242,201,76,0.8)');
  }
  // the way out: a gold chevron at the far end of the lake
  const ex = M.exit.x * TILE, ey = M.exit.y * TILE;
  if (G.units.some(u => u.cargo) || M.phase >= 2) {
    ctx.fillStyle = 'rgba(242,201,76,' + (0.5 + 0.4 * pulse).toFixed(2) + ')';
    for (let i = 0; i < 3; i++) { const x = ex - 30 + i * 10 + pulse * 4; ctx.beginPath(); ctx.moveTo(x, ey - 8); ctx.lineTo(x + 7, ey); ctx.lineTo(x, ey + 8); ctx.lineTo(x + 3, ey); ctx.closePath(); ctx.fill(); }
  }
  // the royal compound while the court gathers
  if (M.phase >= 3 && M.loads.royal.st === 'home') {
    const c = G.byId.get(M.court); if (c) ring(c.x * TILE, c.y * TILE + 8, 74, 40, M.courtReady ? 'rgba(138,184,255,0.9)' : 'rgba(242,201,76,' + (0.35 + 0.4 * pulse).toFixed(2) + ')');
  }
}

/* ---------- fire arrows, ballista bolts, dust and stone chips ---------- */
const _drawArrowBase = drawArrow;
drawArrow = function (a) {
  if (a.k === 'bolt') {
    const p = a.t / a.dur, x = (a.x0 + (a.x1 - a.x0) * p) * TILE, y = (a.y0 + (a.y1 - a.y0) * p) * TILE - 10;
    const ang = Math.atan2(a.y1 - a.y0, a.x1 - a.x0);
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(ang);
    ctx.fillStyle = '#5e3b1c'; ctx.fillRect(-16, -1, 18, 3); ctx.fillStyle = '#dfe6ee'; ctx.fillRect(2, -2, 5, 5); ctx.fillStyle = '#e8e0c8'; ctx.fillRect(-18, -3, 4, 7);
    ctx.restore(); return;
  }
  if (a.k !== 'fire') return _drawArrowBase(a);
  const p = a.t / a.dur, lift = Math.sin(p * Math.PI) * 0.6;
  const x = (a.x0 + (a.x1 - a.x0) * p) * TILE, y = (a.y0 + (a.y1 - a.y0) * p - lift) * TILE - 8;
  const spr = SIEGE.fireArrowSprite(Math.floor(nowS * 12) & 1);
  const ang = Math.atan2((a.y1 - a.y0) * TILE - Math.cos(p * Math.PI) * 0.6 * Math.PI * TILE, (a.x1 - a.x0) * TILE);
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(ang); ctx.drawImage(spr, -spr.width + 4, -spr.height / 2, spr.width * 0.75, spr.height * 0.75); ctx.restore();
};
const _paintTopBase = paintTop;
paintTop = function (f) {
  if (f.sub === 'dust') {
    const p = 1 - f.t / f.max, x = f.x * TILE, y = f.y * TILE - 6 + f.vy * p * 30, s = Math.round(6 + p * 14);
    ctx.fillStyle = 'rgba(170,140,100,' + (0.7 * (1 - p)).toFixed(2) + ')'; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
    return;
  }
  if (f.sub === 'chip') {
    const p = 1 - f.t / f.max, x = f.x * TILE, y = f.y * TILE - 20 + f.vy * p * 30 + p * p * 40;
    ctx.fillStyle = 'rgba(160,82,45,' + (1 - p).toFixed(2) + ')'; ctx.fillRect(Math.round(x - 2), Math.round(y - 2), 4, 4); ctx.fillRect(Math.round(x + 6), Math.round(y + 3), 3, 3);
    ctx.fillStyle = 'rgba(184,173,143,' + (1 - p).toFixed(2) + ')'; ctx.fillRect(Math.round(x - 7), Math.round(y + 1), 3, 3);
    return;
  }
  _paintTopBase(f);
};
