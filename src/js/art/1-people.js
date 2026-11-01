/* ------------------------------ people ------------------------------ */
/* Approved unit art (Oct 2026): distinct silhouettes + cultural detail.
   MERGE: in the art.js section of index.html, replace everything from `const LEGS = ...`
   through the end of `function drawUnit(...)` with PART 1, and replace `function boatSprite(team)`
   with PART 2. Same canvas sizes and signatures as before (the boat canvas grows from 20x22 to 24x22 with the
   hull still centred at x=10 so paintUnit's drawImage(spr, -20, -34) needs no change).
   Also draws 'pahlawan' (Melaka unique unit) for when it is added to UD. */

/* ---------- PART 1: people ---------- */
const GOLD = '#e8b830', GOLD_D = '#a87a1c';
const LUK = [0, 0, 1, 1, 0, 0, 1];
const LEGS = [[[5, 12, 2, 3], [9, 12, 2, 2]], [[6, 12, 2, 3], [8, 12, 2, 3]], [[6, 12, 2, 2], [10, 12, 2, 3]], [[6, 12, 2, 3], [8, 12, 2, 3]]];

function drawUnit(P, kind, team, anim, f, tool) {
  const T = TEAMC[team] || TEAMC[0], r = P.r, mel = team === 0, vil = kind === 'villager', bh = kind === 'bhaya';
  const walk = anim === 'walk', atk = anim === 'attack';
  const bob = (walk && (f === 1 || f === 3)) ? -1 : 0;
  const B = (x, y, w, h, c) => r(x, y + 2 + bob, w, h, c);
  const S = (x, y, w, h, c) => r(x, y + 2, w, h, c);
  // legs and feet
  const L = LEGS[walk ? f : 1];
  const pw = kind === 'pahlawan', legC = bh ? '#3a1c1c' : pw ? '#1d2b22' : (mel ? '#3f6a50' : SKIN_D);
  for (const l of L) { const lx = l[0]; S(lx, l[1], l[2], l[3], legC); S(lx, l[1] + l[3] - 1, l[2], 1, '#2b1d12'); }
  // javelin thrower: a bundle of spare lembing on the back
  if (kind === 'lembing') { S(3, 0, 1, 12, WOOD); S(4, 1, 1, 11, WOOD_D); S(3, -1, 1, 1, STEEL); S(4, 0, 1, 1, STEEL); }
  // quiver on the back, with fletching showing over the shoulder
  if (kind === 'archer') { B(3, 5, 2, 6, WOOD_D); B(3, 4, 1, 1, '#f4ecd4'); B(4, 3, 1, 2, T.main); B(4, 10, 1, 1, GOLD); }

  // torso
  if (bh) {
    // dark leather cuirass with a gold collar, red kain with a gold belt
    B(5, 7, 6, 3, '#3a1c1c'); B(6, 7, 4, 1, GOLD); B(7, 8, 2, 1, GOLD_D);
    B(5, 10, 6, 2, T.main); B(5, 10, 6, 1, GOLD); B(7, 11, 2, 1, T.dark);
  } else if (pw) {
    // Pahlawan: black baju with gold collar, rich songket sampin
    B(5, 7, 6, 2, '#1f2a24'); B(6, 7, 4, 1, GOLD);
    B(4, 9, 8, 3, T.main); B(4, 9, 8, 1, GOLD); B(5, 10, 1, 1, GOLD); B(7, 10, 1, 1, GOLD); B(9, 10, 1, 1, GOLD); B(6, 11, 1, 1, GOLD); B(8, 11, 1, 1, GOLD); B(10, 11, 1, 1, GOLD);
  } else if (mel) {
    if (vil) {
      // plain baju and a checked sarong
      B(5, 7, 6, 3, '#e9dcb4'); B(5, 10, 6, 2, T.main); B(6, 10, 1, 2, T.dark); B(9, 10, 1, 2, T.dark); B(5, 11, 6, 1, T.dark);
    } else {
      // baju Melayu with a songket sampin: gold belt and gold thread dots
      B(5, 7, 6, 2, kind === 'archer' || kind === 'sumpit' ? '#d4c796' : CREAM); B(7, 7, 2, 1, T.trim);
      B(5, 9, 6, 3, T.main); B(5, 9, 6, 1, GOLD); B(6, 11, 1, 1, GOLD); B(9, 11, 1, 1, GOLD);
    }
  } else {
    // Majapahit: bare chest, gold necklace, patterned kain
    B(5, 7, 6, 3, SKIN); B(5, 9, 6, 1, SKIN_D);
    if (vil) { B(5, 10, 6, 2, '#8a6b4a'); B(6, 11, 1, 1, '#6a4e33'); B(9, 11, 1, 1, '#6a4e33'); }
    else { B(6, 7, 4, 1, GOLD); B(7, 8, 2, 1, GOLD_D); B(5, 10, 6, 2, T.main); B(5, 10, 6, 1, GOLD); B(6, 11, 1, 1, T.trim); B(9, 11, 1, 1, T.trim); }
  }
  // archer: bowstring strap across the chest
  if (kind === 'archer') { B(5, 7, 1, 1, WOOD_D); B(6, 8, 1, 1, WOOD_D); B(7, 9, 1, 1, WOOD_D); B(8, 10, 1, 1, WOOD_D); }

  // arms (Majapahit soldiers wear gold armbands)
  const sleeve = pw ? '#1f2a24' : (mel && !vil) ? CREAM : SKIN, ax0 = 4, ax1 = 11;
  B(ax0, 8, 1, 3, sleeve);
  if (atk && f === 1 && kind !== 'tombak' && kind !== 'archer' && kind !== 'sumpit') B(ax1, 8, 3, 1, sleeve); else B(ax1, 8, 1, 3, sleeve);
  if (!mel && !vil) { B(ax0, 8, 1, 1, GOLD); B(ax1, 8, 1, 1, GOLD); }

  // head
  B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR);
  // headgear
  if (vil) {
    // terendak, the wide conical straw hat
    B(3, 3, 10, 1, '#e8c97a'); B(5, 2, 6, 1, '#d9b45a'); B(6, 1, 4, 1, '#e8c97a'); B(7, 0, 2, 1, '#d9b45a'); B(3, 3, 1, 1, '#c4a050'); B(12, 3, 1, 1, '#c4a050');
  } else if (pw) {
    // grand tengkolok: gold band, tall peak with gold tip, trailing end
    B(5, 1, 6, 3, T.dark); B(5, 3, 6, 1, GOLD); B(6, 2, 4, 1, T.main);
    B(9, -1, 2, 3, T.dark); B(10, -1, 1, 1, GOLD); B(4, 2, 1, 2, T.main);
  } else if (mel) {
    if (kind === 'archer' || kind === 'sumpit') {
      // tied headband with trailing ends
      B(6, 2, 4, 1, HAIR); B(5, 3, 6, 1, T.main); B(4, 3, 1, 1, T.main); B(3, 4, 1, 2, T.main);
    } else {
      // tengkolok: folded headcloth with a tall peak and gold edge
      B(5, 2, 6, 2, T.main); B(5, 3, 6, 1, GOLD); B(6, 2, 1, 1, T.dark); B(8, 2, 1, 1, T.dark);
      B(9, 0, 2, 2, T.main); B(10, 0, 1, 1, GOLD); B(4, 3, 1, 1, T.dark);
    }
  } else if (bh) {
    // tall gold crown (jamang) over the hair, red jewel at the front
    B(6, 2, 4, 1, HAIR); B(5, 3, 6, 1, GOLD); B(6, 1, 4, 1, GOLD); B(7, 0, 2, 1, GOLD); B(7, 1, 2, 1, T.main); B(5, 4, 1, 2, HAIR);
  } else {
    // topknot (gelung) and a gold diadem
    B(7, 0, 2, 2, HAIR); B(6, 2, 4, 1, HAIR); B(5, 3, 6, 1, GOLD); B(7, 3, 2, 1, T.main); B(5, 4, 1, 1, GOLD);
  }

  // shields: Melaka round wooden, Majapahit tall painted tameng
  if (kind === 'tombak') {
    if (mel) { disc({ r: B }, 4, 10, 2, T.main); disc({ r: B }, 4, 10, 1, '#c9ae5e'); B(4, 10, 1, 1, GOLD); }
    else { B(2, 7, 3, 7, T.main); B(2, 7, 3, 1, GOLD); B(2, 13, 3, 1, GOLD); B(3, 9, 1, 3, GOLD); B(2, 7, 1, 7, T.dark); }
  }

  // hands: weapons and tools
  if (kind === 'keris' || pw) {
    // wavy (luk) blade: two pixels wide, swaying a pixel left and right every two rows
    const hilt = mel ? GOLD : WOOD_D, len = (mel && !pw) ? 6 : 7;
    const blade = (base) => {
      B(12 + LUK[0], base - len, 1, 1, STEEL);
      for (let i = 1; i < len; i++) { const o = LUK[i]; B(12 + o, base - len + i, 1, 1, STEEL); B(13 + o, base - len + i, 1, 1, STEEL_D); }
    };
    if (!atk || f === 2) { blade(9); B(11, 9, 3, 1, hilt); B(12, 10, 1, 1, hilt); }
    else if (f === 0) { blade(8); B(11, 8, 3, 1, hilt); }
    else { B(12, 8, 2, 1, STEEL); B(12, 9, 2, 1, STEEL_D); B(14, 7, 1, 1, STEEL); B(14, 8, 1, 1, STEEL_D); B(15, 8, 1, 1, STEEL); B(11, 8, 1, 3, hilt); }
  } else if (kind === 'tombak') {
    // spear with a red tassel under the head
    if (!atk || f === 2) { S(12, 1, 1, 15, WOOD); S(12, 0, 1, 2, STEEL); S(11, 3, 1, 2, '#c0392b'); S(13, 3, 1, 1, '#c0392b'); }
    else if (f === 0) { B(7, 9, 7, 1, WOOD); B(14, 9, 1, 1, STEEL); B(9, 8, 1, 1, '#c0392b'); }
    else { B(9, 9, 6, 1, WOOD); B(15, 9, 1, 1, STEEL); B(11, 8, 1, 1, '#c0392b'); }
  } else if (kind === 'archer') {
    // tall curved bow
    B(13, 4, 1, 1, WOOD); B(14, 5, 1, 8, WOOD); B(13, 13, 1, 1, WOOD); B(14, 8, 1, 2, GOLD_D);
    if (atk && f === 0) { B(9, 9, 5, 1, WOOD); B(13, 5, 1, 8, '#d8d0b0'); B(14, 9, 1, 1, STEEL); }
    else B(13, 5, 1, 8, '#d8d0b0');
  } else if (kind === 'sumpit') {
    // long bamboo blowpipe: upright at rest, raised to the lips to shoot; a dart pouch at the hip
    B(4, 11, 2, 2, '#8a5a2b'); B(4, 11, 2, 1, GOLD_D);
    if (atk && f === 0) { B(9, 5, 7, 1, '#b8a060'); B(15, 5, 1, 1, '#6a5a30'); B(11, 6, 1, 2, sleeve); }
    else { S(12, 0, 1, 14, '#b8a060'); S(12, 0, 1, 1, '#6a5a30'); S(12, 6, 1, 1, '#8a7a40'); }
  } else if (kind === 'lembing') {
    // a javelin in the throwing hand, drawn back then thrown
    if (!atk) { S(12, 1, 1, 13, WOOD); S(12, 0, 1, 2, STEEL); }
    else if (f === 0) { B(6, 5, 8, 1, WOOD); B(14, 5, 1, 1, STEEL); B(11, 6, 1, 2, sleeve); }
    else B(13, 7, 2, 1, sleeve);
  } else if (bh) {
    // small round shield on the left arm, broad gold-hilted blade in the right hand
    disc({ r: B }, 4, 10, 2, '#6a2e20'); B(4, 10, 1, 1, GOLD); B(3, 9, 1, 1, '#8e4a30');
    if (!atk || f === 2) { B(12, 4, 2, 5, STEEL); B(13, 4, 1, 5, STEEL_D); B(12, 3, 1, 1, STEEL); B(11, 9, 3, 1, GOLD); B(12, 10, 1, 1, WOOD_D); }
    else if (f === 0) { B(12, 2, 2, 5, STEEL); B(13, 2, 1, 5, STEEL_D); B(12, 1, 1, 1, STEEL); B(11, 7, 3, 1, GOLD); }
    else { B(14, 7, 2, 2, STEEL); B(14, 8, 2, 1, STEEL_D); B(13, 7, 1, 2, GOLD); }
  } else if (vil && anim === 'work') {
    if (tool === 'axe') { if (f === 0) { B(12, 2, 1, 7, WOOD); B(12, 1, 3, 2, STEEL); } else { B(12, 9, 3, 1, WOOD); B(14, 8, 2, 3, STEEL); } }
    else if (tool === 'pick') { if (f === 0) { B(12, 2, 1, 7, WOOD); B(10, 1, 5, 1, STEEL_D); } else { B(12, 9, 3, 1, WOOD); B(14, 7, 1, 5, STEEL_D); } }
    else if (tool === 'hoe') { if (f === 0) { B(12, 3, 1, 7, WOOD); B(12, 2, 3, 1, STEEL_D); } else { B(12, 8, 3, 1, WOOD); B(14, 9, 1, 3, STEEL_D); } }
    else if (tool === 'hammer') { if (f === 0) { B(12, 3, 1, 6, WOOD); B(11, 1, 4, 2, STEEL_D); } else { B(12, 9, 3, 1, WOOD); B(14, 8, 2, 3, STEEL_D); } }
    else { if (f === 0) B(11, 6, 1, 3, SKIN); else B(11, 9, 2, 2, SKIN); }
  }
}

// the team's age picks the look (AGEART, below); neutral and pre-age callers get the Kingdom Age roster
function unitAge(team) { return typeof G !== 'undefined' && G && G.age && started && (team === 0 || team === 1) ? G.teamAge(team) : 2; }
function unitSprite(kind, team, anim, f, tool) { return AGEART.unit(kind, CV(team), unitAge(team), anim, f) || civUnitSprite(kind, CV(team), anim, f, tool); }
function civUnitSprite(kind, team, anim, f, tool) {
  if (team === AYU_CIV) { const s = AYART.unit(kind, anim, f); if (s) return s; }
  if (UD[kind] && UD[kind].cls === 'healer') return CIVB.healerSprite(UD[kind].civ, anim === 'attack' ? 'heal' : anim === 'work' ? 'idle' : anim, anim === 'attack' ? f : anim === 'walk' ? f : 0);
  return sprite(`u|${kind}|${team}|${anim}|${f}|${tool || ''}`, 16, 18, 2, (P) => drawUnit(P, kind, team, anim, f, tool));
}
function deerSprite(f) {
  return sprite('deer|' + f, 18, 16, 2, (P) => {
    const r = P.r, c = '#b0733f', l = f ? 1 : 0;
    r(4, 6, 9, 4, c); r(5, 9, 7, 1, '#d4a771'); r(7, 7, 1, 1, '#f0dcb0'); r(10, 7, 1, 1, '#f0dcb0');
    r(5, 10, 1, 4 - l, '#8a5a2b'); r(7, 10, 1, 3 + l, '#8a5a2b'); r(10, 10, 1, 3 + l, '#8a5a2b'); r(12, 10, 1, 4 - l, '#8a5a2b');
    r(12, 4, 2, 3, c); r(13, 3, 3, 3, '#b98048'); r(15, 4, 1, 2, '#d9b789'); r(14, 4, 1, 1, HAIR);
    r(13, 0, 1, 3, '#e6d6aa'); r(15, 0, 1, 3, '#e6d6aa'); r(14, 1, 1, 1, '#e6d6aa'); r(3, 6, 1, 2, '#f4ecd4');
  });
}
function carcassSprite() {
  return sprite('carcass', 18, 14, 2, (P) => {
    const r = P.r; r(3, 7, 11, 4, '#a56d3b'); r(4, 10, 9, 1, '#d4a771'); r(13, 8, 3, 2, '#b98048'); r(5, 6, 1, 1, '#8a5a2b'); r(9, 6, 1, 1, '#8a5a2b'); r(14, 6, 1, 2, '#e6d6aa'); r(6, 8, 3, 1, '#c4894d');
  });
}
/* ---------- PART 2: fishing boat (Melaka sampan / Majapahit jukung) ---------- */
const SAIL = '#efe3c0', SAIL_D = '#cbbd92', MAT = '#c9a96a', MAT_D = '#a4844a';
const HULL = '#7a4a24', HULL_D = '#5e3b1c', HULL_L = '#a8773c';
// hull with upswept bow and stern; x0..x1 is the deck length, y the deck line
function hull(P, x0, x1, y, depth, T) {
  for (let i = 0; i < depth; i++) P.r(x0 + i, y + i, x1 - x0 - i * 2, 1, i === 0 ? HULL_L : i === depth - 1 ? HULL_D : HULL);
  P.r(x0 + 1, y + 1, x1 - x0 - 2, 1, T.main);
  P.r(x0 - 1, y - 1, 2, 1, HULL); P.r(x0 - 2, y - 2, 1, 1, HULL);
  P.r(x1 - 1, y - 1, 2, 1, HULL); P.r(x1 + 1, y - 3, 1, 3, HULL); P.r(x1 + 1, y - 4, 1, 1, T.trim);
}
// tanja: slanted four-sided sail between two spars, the classic Nusantara rig
function tanja(P, x, y, w, h, col, colD, T, mark) {
  const mat = col === MAT;
  for (let i = 0; i < h; i++) { const sx = x + Math.round(i * 0.5); P.r(sx, y + i, w, 1, (mat && i % 4 === 3) ? colD : col); if (!mat) P.r(sx + w - 1, y + i, 1, 1, colD); }
  P.r(x - 1, y - 1, w + 2, 1, WOOD_D);
  P.r(x + Math.round(h * 0.5) - 1, y + h, w + 2, 1, WOOD_D);
  if (mark) P.r(x + Math.round(h * 0.25) + (w >> 1) - 1, y + (h >> 1) - 1, 2, 2, T.main);
}
function boatSprite(team) {
  const T = TEAMC[team] || TEAMC[0];
  return sprite('boat|' + team, 24, 22, 2, (P) => {
    const r = P.r;
    if (team !== 1) {
      // sampan: one small tanja sail, fisherman under a terendak
      r(10, 3, 1, 11, WOOD_D); tanja(P, 8, 3, 8, 9, SAIL, SAIL_D, T, true);
      r(4, 9, 4, 1, '#e8c97a'); r(5, 10, 2, 2, SKIN); r(5, 12, 2, 1, T.main);
      hull(P, 3, 17, 13, 4, T); r(2, 11, 1, 2, '#cfc3a0'); r(1, 12, 1, 1, '#cfc3a0');
    } else {
      // jukung: outrigger canoe with a crab-claw sail
      r(10, 4, 1, 10, WOOD_D);
      for (let i = 0; i < 9; i++) r(11, 4 + i, Math.max(1, 7 - Math.abs(i - 3)), 1, (i % 3 === 2) ? MAT_D : MAT);
      r(11, 4, 1, 9, T.main);
      r(5, 9, 2, 1, HAIR); r(5, 10, 2, 2, SKIN); r(5, 12, 2, 1, T.main);
      hull(P, 3, 17, 13, 3, T);
      r(4, 17, 14, 1, WOOD); r(6, 15, 1, 3, WOOD_D); r(14, 15, 1, 3, WOOD_D); r(3, 18, 16, 1, '#c8b88a');
    }
  });
}

