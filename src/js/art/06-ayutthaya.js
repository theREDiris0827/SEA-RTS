/* ##### CHAPTER ART 6 · Ayutthaya #####
   File: src/js/art/06-ayutthaya.js
   What it does: All Ayutthaya art: people, elephants, buildings and boats (AYART).
   ############################################################################ */
const AYART = (() => {
  /* Ayutthaya art from the art and lore threads: units (lore/scenes/units-ayutthaya.js), buildings
     (lore/scenes/bld-ayutthaya.js), ships (unit-art/ships.js + ships-mainland.js) and the village woman
     from the Fall of Angkor demo. Royal purple and gold. */
  const CIVC = { ayu: { name: 'Ayutthaya', main: '#7b4bb3', dark: '#4e2d78', trim: GOLD, ring: '#c9a3ff' } };
  const IRON = '#4a4e57', IRON_L = '#7c818c';
/* Ayutthaya (Siam) unit sprite mockups, in the game's style (same sprite(), auto outline, LEGS, palette).
   Runs inside the game page after art.js. Not merged into the game.
   ayUnit(kind, anim, f): anim 'idle' (f 0) or 'attack' (f 0, 1, 2). 'walk' (f 0-3) also works for the people.
     16x18: dap, spear, namai, archer, gunner, mo      32x32: changsuek      26x18: cannon
   Team colour royal purple; soldiers in sleeveless purple tunics over a dark chong kraben, bare arms and shins. */
const AYU = { main: '#7b4bb3', dark: '#4e2d78', trim: '#f2c94c', ring: '#c9a3ff' };
const AYU_LT = '#9b6fd0', AYU_DD = '#3a1f5c', AYU_RED = '#b8322a', AYU_RED_D = '#8a2018';
const AYU_G = (typeof GOLD !== 'undefined' ? GOLD : '#e8b830'), AYU_GD = (typeof GOLD_D !== 'undefined' ? GOLD_D : '#a87a1c');
const AYU_WH = '#f1ece0', AYU_WH_D = '#cfc6b2', AYU_HERB = '#5a8a3a', AYU_BAG = '#8a6a3a';
const AYU_MET = '#4a4a52', AYU_MET_L = '#6a6a74', AYU_BR = '#7a5a2a', AYU_STRING = '#d8d0b0';
const AYU_FLASH = '#f6d04a', AYU_FLASH_L = '#fff3a0', AYU_SMOKE = '#c8c8c8', AYU_SMOKE_L = '#e0e0e0';
const AYU_DIMS = { changsuek: [32, 32], cannon: [26, 18] };

// an Ayutthaya unit picture
function ayUnit(kind, anim, f) {
  f = f | 0;
  if (kind === 'changsuek') return ayuElephant(anim, f);
  if (kind === 'cannon') return ayuCannon(anim, f);
  return sprite(`ayu|${kind}|${anim}|${f}`, 16, 18, 2, (P) => ayuPerson(P, kind, anim, f));
}

// paint an Ayutthaya person
function ayuPerson(P, kind, anim, f) {
  const walk = anim === 'walk', atk = anim === 'attack';
  const bob = (walk && (f === 1 || f === 3)) ? -1 : 0;
  const B = (x, y, w, h, c) => P.r(x, y + 2 + bob, w, h, c);
  const S = (x, y, w, h, c) => P.r(x, y + 2, w, h, c);
  const mo = kind === 'mo', light = kind === 'namai';

  // legs: chong kraben to the knee, bare shins; soldiers (not the skirmisher or healer) wear pale leg wraps
  const L = LEGS[walk ? f : 1];
  for (const l of L) {
    const [lx, ly, lw, lh] = l;
    S(lx, ly, lw, lh, SKIN);
    S(lx, ly, lw, 1, mo ? AYU_WH_D : AYU.dark);
    if (lh === 3 && !mo && !light) S(lx, ly + 1, lw, 1, '#e6dcc4');
    S(lx, ly + lh - 1, lw, 1, mo ? SKIN_D : '#2b1d12');
  }

  // things worn on the back
  if (kind === 'archer') { B(3, 5, 2, 6, WOOD_D); B(3, 4, 1, 1, '#f4ecd4'); B(4, 3, 1, 2, AYU_RED); B(4, 10, 1, 1, AYU_G); }
  if (kind === 'namai') { B(3, 6, 2, 5, AYU_BAG); B(3, 5, 1, 1, STEEL_D); B(4, 5, 1, 1, '#f4ecd4'); B(3, 10, 2, 1, WOOD_D); }

  // torso
  if (mo) {
    // white cloth robe and wrap, herb bag on a strap across the chest
    B(5, 7, 6, 5, AYU_WH); B(5, 7, 6, 1, '#fffaf0'); B(5, 11, 6, 1, AYU_WH_D); B(7, 9, 1, 3, AYU_WH_D);
    B(9, 7, 1, 1, AYU_BAG); B(8, 8, 1, 1, AYU_BAG); B(7, 9, 1, 1, AYU_BAG); B(6, 10, 1, 1, AYU_BAG);
    B(3, 10, 3, 3, AYU_BAG); B(3, 10, 3, 1, '#a8885e'); B(4, 9, 1, 1, AYU_HERB); B(3, 9, 1, 1, '#7aa84a');
  } else if (light) {
    // skirmisher: bare chest, a red cloth sash, dark kraben
    B(5, 7, 6, 3, SKIN); B(5, 9, 6, 1, SKIN_D); B(5, 9, 6, 1, AYU_RED); B(5, 10, 6, 2, AYU.dark); B(7, 11, 1, 1, AYU_DD);
    B(6, 7, 1, 1, WOOD_D); B(7, 8, 1, 1, WOOD_D);   // quiver strap
  } else {
    // sleeveless purple tunic, red or gold sash, dark purple chong kraben with a front fold
    const gold = kind === 'dap' || kind === 'gunner';
    B(5, 7, 6, 3, AYU.main); B(5, 7, 6, 1, AYU_LT); B(6, 7, 4, 1, gold ? AYU_G : AYU_LT); B(7, 8, 2, 1, gold ? AYU_GD : AYU.main);
    B(5, 9, 6, 1, gold ? AYU_G : AYU_RED);
    B(5, 10, 6, 2, AYU.dark); B(7, 10, 2, 2, AYU_DD); B(5, 11, 1, 1, AYU_DD); B(10, 11, 1, 1, AYU_DD);
    if (kind === 'archer') { B(6, 8, 1, 1, WOOD_D); B(7, 9, 1, 1, WOOD_D); }
  }

  // arms: bare, with gold armbands on the swordsman and gunner, white sleeves on the healer
  const arm = mo ? AYU_WH : SKIN;
  const reach = atk && f === 1 && (kind === 'dap' || mo);
  B(4, 8, 1, 3, arm); if (mo) B(4, 11, 1, 1, SKIN);
  if (reach) { B(11, 8, 3, 1, arm); B(14, 8, 1, 1, SKIN); }
  else { B(11, 8, 1, 3, arm); B(11, 11, 1, 1, SKIN); }
  if (kind === 'dap' || kind === 'gunner') { B(4, 8, 1, 1, AYU_G); if (!reach) B(11, 8, 1, 1, AYU_G); }

  // head
  B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR);

  // headgear
  if (kind === 'dap') {
    // red headcloth tied in a knot on top, gold band
    B(6, 2, 4, 1, AYU_RED); B(5, 3, 6, 1, AYU_RED); B(5, 3, 6, 1, AYU_G); B(6, 2, 4, 1, AYU_RED); B(7, 0, 2, 2, AYU_RED); B(7, 0, 1, 1, AYU_RED_D); B(4, 3, 1, 2, AYU_RED_D);
  } else if (kind === 'spear') {
    // pointed red cloth cap
    B(5, 2, 6, 2, AYU_RED); B(5, 3, 6, 1, AYU_RED_D); B(6, 1, 4, 1, AYU_RED); B(7, 0, 2, 1, AYU_RED); B(8, -1, 1, 1, AYU_G); B(4, 3, 1, 1, AYU_RED_D);
  } else if (kind === 'namai') {
    // red headband with trailing ends over bare hair
    B(6, 2, 4, 1, HAIR); B(5, 3, 6, 1, AYU_RED); B(4, 3, 1, 1, AYU_RED); B(3, 4, 1, 2, AYU_RED); B(5, 4, 1, 1, HAIR);
  } else if (kind === 'archer') {
    // purple headcloth with a tied tail
    B(6, 2, 4, 1, AYU.main); B(5, 3, 6, 1, AYU.dark); B(6, 2, 1, 1, AYU_LT); B(4, 3, 1, 1, AYU.dark); B(3, 4, 1, 2, AYU.main);
  } else if (kind === 'gunner') {
    // tall conical lomphok-style cap with a gold band
    B(5, 3, 6, 1, AYU_G); B(6, 2, 4, 1, AYU.dark); B(6, 1, 4, 1, AYU.main); B(7, 0, 2, 1, AYU.dark); B(7, -1, 2, 1, AYU.main); B(8, -2, 1, 1, AYU_G);
  } else if (mo) {
    // white head wrap
    B(5, 2, 6, 2, AYU_WH); B(5, 3, 6, 1, AYU_WH_D); B(6, 1, 4, 1, AYU_WH); B(4, 3, 1, 2, AYU_WH_D);
  }

  // weapons
  if (kind === 'dap') {
    // daab song mue: a second dap in the left hand, raised while the right blade strikes
    if (atk && f === 1) { B(3, 1, 1, 7, STEEL); B(2, 2, 1, 6, STEEL_D); B(2, 8, 3, 1, AYU_G); B(3, 9, 1, 1, WOOD_D); }
    else { B(3, 3, 1, 7, STEEL); B(2, 4, 1, 6, STEEL_D); B(2, 10, 3, 1, AYU_G); B(3, 11, 1, 1, WOOD_D); }
    // dap: long straight single-edged blade (light edge, darker back), gold guard, wrapped grip
    if (!atk || f === 2) { B(12, 2, 1, 7, STEEL); B(13, 3, 1, 6, STEEL_D); B(11, 9, 3, 1, AYU_G); B(12, 10, 1, 1, WOOD_D); }
    else if (f === 0) { B(12, 0, 1, 7, STEEL); B(13, 1, 1, 6, STEEL_D); B(11, 7, 3, 1, AYU_G); B(12, 8, 1, 1, WOOD_D); }
    else { B(13, 7, 3, 1, STEEL); B(13, 8, 3, 1, STEEL_D); B(15, 7, 1, 1, STEEL); B(12, 7, 1, 3, AYU_G); }
  } else if (kind === 'spear') {
    // long spear with a red tassel
    if (!atk || f === 2) { S(12, 0, 1, 16, WOOD); S(12, -1, 1, 2, STEEL); S(11, 2, 1, 2, AYU_RED); S(13, 2, 1, 1, AYU_RED); S(12, 2, 1, 1, AYU_RED_D); }
    else if (f === 0) { B(6, 9, 8, 1, WOOD); B(14, 9, 1, 1, STEEL); B(9, 8, 1, 1, AYU_RED); B(9, 10, 1, 1, AYU_RED); }
    else { B(8, 9, 7, 1, WOOD); B(15, 9, 1, 1, STEEL); B(11, 8, 1, 1, AYU_RED); B(11, 10, 1, 1, AYU_RED); }
  } else if (kind === 'namai') {
    // na mai: a simple wooden crossbow, held upright at rest and levelled to shoot
    if (!atk || f === 2) { B(12, 5, 1, 7, WOOD); B(10, 5, 5, 1, WOOD_D); B(10, 6, 1, 1, WOOD_D); B(14, 6, 1, 1, WOOD_D); B(11, 6, 3, 1, AYU_STRING); }
    else {
      B(8, 9, 6, 1, WOOD); B(14, 6, 1, 7, WOOD_D); B(13, 6, 1, 1, WOOD_D); B(13, 12, 1, 1, WOOD_D);
      if (f === 0) { B(12, 7, 1, 2, AYU_STRING); B(12, 10, 1, 2, AYU_STRING); B(13, 9, 2, 1, STEEL); }
      else { B(13, 7, 1, 5, AYU_STRING); B(15, 9, 1, 1, STEEL); }
    }
  } else if (kind === 'archer') {
    B(13, 4, 1, 1, WOOD); B(14, 5, 1, 8, WOOD); B(13, 13, 1, 1, WOOD); B(14, 8, 1, 2, AYU_RED);
    if (atk && f === 0) { B(9, 9, 5, 1, WOOD); B(13, 5, 1, 8, AYU_STRING); B(14, 9, 1, 1, STEEL); }
    else if (atk && f === 1) { B(13, 5, 1, 8, AYU_STRING); B(15, 9, 1, 1, STEEL); }
    else B(13, 5, 1, 8, AYU_STRING);
  } else if (kind === 'gunner') {
    // matchlock, shouldered with the slow-match glowing; levelled to fire, flash and smoke on f 1
    if (!atk || f === 2) { B(12, -1, 1, 10, AYU_MET); B(12, 8, 1, 3, AYU_BR); B(13, 6, 1, 1, AYU_RED); if (atk) { B(13, -2, 2, 1, AYU_SMOKE); B(14, -3, 1, 1, AYU_SMOKE_L); } }
    else {
      B(6, 8, 9, 1, AYU_MET); B(6, 7, 1, 1, AYU_MET_L); B(5, 8, 2, 2, AYU_BR); B(9, 9, 1, 1, AYU_RED);
      if (f === 1) { B(15, 7, 1, 3, AYU_FLASH); B(15, 8, 1, 1, AYU_FLASH_L); B(13, 5, 2, 1, AYU_SMOKE); B(14, 4, 2, 1, AYU_SMOKE_L); }
    }
  } else if (mo) {
    // healer: offers a bowl of herbal medicine; steam and a green cross while healing
    if (atk) {
      B(13, 8, 2, 1, '#8a5a3a'); B(12, 9, 1, 1, '#6a4428'); B(13, 7, 2, 1, AYU_HERB);
      if (f >= 1) { B(13, 5, 1, 1, '#d8e8d0'); B(14, 4, 1, 1, '#d8e8d0'); }
      if (f === 1) { B(13, 0, 1, 3, '#7dffa8'); B(12, 1, 3, 1, '#7dffa8'); }
      if (f === 2) { B(14, 1, 1, 1, '#7dffa8'); B(12, 3, 1, 1, '#7dffa8'); }
    } else { B(11, 11, 2, 1, '#8a5a3a'); B(11, 10, 2, 1, AYU_HERB); }
  }
}

/* ---------- Chang Suek: war elephant, 32x32, facing right ---------- */
function ayuElephant(anim, f) {
  return sprite(`ayu|changsuek|${anim}|${f}`, 32, 32, 2, (P) => {
    const r = P.r, atk = anim === 'attack', walk = anim === 'walk';
    const charge = atk && f === 1, up = atk;         // trunk raised on all attack frames
    const dx = charge ? 2 : 0, dy = charge ? 1 : 0;   // lunge forward and down on the charge
    const R = (x, y, w, h, c) => r(x + dx, y + dy, w, h, c);
    const G = '#8a8a90', G_D = '#6a6a72', G_L = '#a6a6ac', G_DD = '#55555c', TUSK = '#f4ecd4';
    // legs (back pair darker); stride on the charge and while walking
    const st = charge ? 1 : (walk ? (f % 2) : 0);
    const leg = (x, y0, len, c) => { R(x, y0, 3, len, c); R(x, y0 + len - 1, 3, 1, '#c8c0b0'); };
    leg(6 - st, 21, 9 - dy, G_D); leg(16 + st, 21, 9 - dy, G_D);
    leg(9 + st, 22, 8 - dy, G); leg(19 - st, 22, 8 - dy, G);
    // tail
    R(3, 14, 1, 6, G_D); R(2, 19, 2, 1, G_DD);
    // body
    R(4, 11, 19, 11, G); R(5, 10, 16, 1, G); R(6, 9, 12, 1, G);
    R(4, 19, 19, 3, G_D); R(5, 22, 17, 1, G_D);
    // head and forehead dome
    R(19, 6, 7, 12, G); R(20, 5, 5, 1, G); R(21, 4, 3, 1, G_L); R(20, 6, 4, 1, G_L);
    R(25, 9, 2, 8, G);
    // ear
    R(18, 8, 4, 8, G_D); R(18, 9, 1, 6, G_DD); R(19, 15, 2, 1, G_DD);
    // eye
    R(24, 9, 1, 1, '#1a120c');
    // trunk: hanging and curled at rest, raised and curled above the head when attacking
    if (!up) {
      R(25, 16, 3, 3, G); R(26, 19, 2, 4, G); R(27, 23, 2, 3, G); R(28, 26, 2, 1, G_D); R(28, 25, 1, 1, G_D); R(26, 16, 1, 7, G_L);
    } else {
      R(26, 7, 3, 4, G); R(27, 4, 3, 3, G); R(28, 2, 3, 2, G); R(30, 1, 1, 2, G_D); R(29, 0, 2, 1, G_D); R(27, 5, 1, 4, G_L);
      R(26, 11, 1, 4, G_D);  // open mouth
      R(25, 14, 2, 1, '#c86a6a');
    }
    // tusks with gold caps
    R(26, 15, 3, 1, TUSK); R(28, 14, 2, 1, TUSK); R(29, 13, 2, 1, AYU_G); R(31 - dx, 13, 1, 1, AYU_G);
    // caparison: purple cloth over the back with a gold border and tassels
    R(6, 10, 14, 9, AYU.main); R(6, 10, 14, 1, AYU_G); R(6, 18, 14, 1, AYU_G);
    R(6, 11, 1, 7, AYU_G); R(19, 11, 1, 7, AYU_G);
    for (let x = 8; x < 19; x += 3) { R(x, 13, 2, 2, AYU.dark); R(x, 13, 1, 1, AYU_G); }
    for (let x = 7; x < 20; x += 3) R(x, 19, 1, 1, AYU_RED);
    R(12, 15, 3, 2, AYU_G); R(13, 16, 1, 1, AYU_RED);           // gold medallion
    // head cloth and forehead ornament
    R(20, 5, 4, 1, AYU.main); R(20, 4, 4, 1, AYU_G); R(21, 3, 2, 1, AYU_G);
    // howdah: a small gold-roofed seat on the back with a rider (bow/flag)
    R(8, 5, 9, 5, AYU_GD); R(8, 5, 9, 1, AYU_G); R(8, 9, 9, 1, AYU_G); R(9, 6, 1, 3, AYU.dark); R(15, 6, 1, 3, AYU.dark);
    R(11, 2, 3, 3, SKIN); R(11, 4, 3, 1, SKIN_D); R(13, 3, 1, 1, HAIR); R(10, 1, 5, 1, AYU_G); R(11, 0, 3, 1, AYU_G); R(12, -1, 1, 1, AYU_G);
    R(10, 5, 5, 1, AYU.main);
    R(7, -1, 1, 10, WOOD_D); R(4, -1, 3, 2, AYU.main); R(5, -1, 1, 1, AYU_G);  // banner pole at the back of the howdah
    // mahout on the neck: purple tunic, red headcloth, bare legs over the ear
    R(19, 2, 3, 3, SKIN); R(19, 4, 3, 1, SKIN_D); R(21, 3, 1, 1, HAIR); R(18, 1, 5, 1, AYU_RED); R(18, 2, 1, 1, AYU_RED_D);
    R(18, 5, 4, 3, AYU.main); R(18, 5, 4, 1, AYU_LT); R(18, 8, 4, 1, AYU.dark); R(21, 9, 2, 2, SKIN); R(21, 11, 2, 1, SKIN_D);
    // ngao: a long polearm with a hooked blade
    if (!atk || f === 2) {
      // held upright, hooked blade at the top
      R(22, 6, 1, 1, SKIN); R(23, 2, 1, 9, WOOD);
      R(23, 0, 1, 2, STEEL); R(24, -1, 1, 2, STEEL); R(24, 1, 1, 1, STEEL_D); R(22, 2, 1, 1, AYU_RED);
    } else if (f === 0) {
      // drawn back over the shoulder
      R(17, 5, 1, 1, SKIN);
      for (let i = 0; i < 9; i++) R(17 - i, 5 - Math.floor(i / 3), 1, 1, WOOD);
      R(8, 1, 1, 2, STEEL); R(7, 0, 1, 2, STEEL); R(9, 2, 1, 1, AYU_RED);
    } else {
      // swung forward and down over the trunk
      R(22, 6, 1, 1, SKIN);
      for (let i = 0; i < 9; i++) r(23 + dx + i, 6 + dy - Math.floor(i / 3) + 1, 1, 1, WOOD);
      r(31, 3 + dy, 1, 3, STEEL); r(30, 3 + dy, 1, 1, STEEL); r(30, 6 + dy, 1, 1, AYU_RED);
    }
    if (charge) { r(0, 28, 3, 2, '#c8bca0'); r(1, 27, 2, 1, '#d8ccb0'); r(3, 29, 2, 1, '#b8a888'); }   // dust kicked up behind
  });
}

/* ---------- bronze cannon on a field carriage, 26x18, with a purple pennant ---------- */
function ayuCannon(anim, f) {
  const fire = anim === 'attack' && f === 1, after = anim === 'attack' && f === 2;
  return sprite(`ayu|cannon|${anim}|${f}`, 26, 18, 2, (P) => {
    const r = P.r, BZ = '#b8862c', BZ_L = '#e0b04a', BZ_D = '#7a5418', rec = fire ? -1 : 0;
    r(3, 11, 17, 3, WOOD); r(3, 13, 17, 1, WOOD_D); r(1, 13, 3, 2, WOOD_D); r(2, 15, 2, 1, WOOD_D);   // carriage and trail
    disc(P, 8 + rec, 14, 3, '#3a2a1a'); disc(P, 8 + rec, 14, 1, WOOD); r(8 + rec, 14, 1, 1, AYU_G);
    disc(P, 16 + rec, 14, 3, '#3a2a1a'); disc(P, 16 + rec, 14, 1, WOOD); r(16 + rec, 14, 1, 1, AYU_G);
    const R = (x, y, w, h, c) => r(x + rec, y, w, h, c);
    R(6, 7, 15, 4, BZ); R(6, 7, 15, 1, BZ_L); R(6, 10, 15, 1, BZ_D);             // bronze barrel
    R(4, 6, 3, 6, BZ_D); R(3, 8, 1, 2, BZ_D); R(5, 7, 1, 4, BZ);                    // cascabel and breech
    R(20, 6, 2, 6, BZ); R(20, 6, 2, 1, BZ_L); R(21, 7, 1, 4, '#2a1a10');            // muzzle swell
    for (const x of [10, 14, 17]) R(x, 7, 1, 4, BZ_D);                               // reinforcing rings
    R(11, 5, 4, 2, BZ_L); R(11, 5, 1, 1, BZ); R(14, 5, 1, 1, BZ);                   // ornamental lifting handle
    R(7, 6, 1, 1, AYU_RED);                                                          // touch-hole with smouldering match
    r(1, 1, 1, 10, WOOD_D); r(2, 1, 5, 2, AYU.main); r(2, 3, 3, 1, AYU.main); r(2, 4, 1, 1, AYU.dark); r(3, 1, 2, 1, AYU_G);   // swallow-tail pennant
    if (fire) {
      r(21, 7, 2, 4, AYU_FLASH); r(23, 6, 2, 6, AYU_FLASH); r(25, 8, 1, 2, AYU_FLASH_L); r(22, 8, 2, 2, AYU_FLASH_L);
      r(19, 3, 3, 2, AYU_SMOKE); r(21, 1, 3, 2, AYU_SMOKE_L); r(6, 4, 2, 1, AYU_SMOKE);
    } else if (after) {
      r(21, 6, 3, 2, AYU_SMOKE); r(22, 3, 3, 3, AYU_SMOKE_L); r(24, 1, 2, 2, AYU_SMOKE); r(23, 9, 2, 1, '#9a9a9a');
    }
  });
}

if (typeof window !== 'undefined') window.ayUnit = ayUnit;
/* Ayutthaya building art (Siamese kingdom, 1351-1767). Same style as CIVB melakaBuilding/majapahitBuilding:
   drawn in code with sprite(key, w, h, 2, draw) at logical resolution, outline on, ground at the bottom.
   Needs art.js helpers (sprite, posts, planks, WOOD/WOOD_D) and GOLD from drawUnit.js.
   ayBuilding(kind): kind towncentre | house | raft | tower | palisade | wall | gate | healer | palace
   Lore: lore/buildings.md (Ayutthaya). Team colour royal purple (AYC). */
const AYC = { main: '#7b4bb3', dark: '#4e2d78', trim: '#f2c94c', ring: '#c9a3ff' };
const AY_DIMS = { towncentre: [48, 62], house: [32, 46], raft: [32, 40], tower: [32, 64], palisade: [32, 30], wall: [32, 34], gate: [48, 48], healer: [48, 52], palace: [64, 78] };
const AY = {
  TILE: '#b8452c', TILE_D: '#8e3322', TILE_L: '#d0613c', GRN: '#3f8a52', GRN_D: '#2a6639', ORG: '#d97a2b', ORG_D: '#a95a1c',
  WH: '#f1ece0', WH_D: '#d6cebe', WH_S: '#b5ac9c', TEAK: '#9a6232', TEAK_D: '#744620', TEAK_L: '#b97f45', FACE: '#5e2318',
  WATER: '#4ba3bf', WATER_D: '#2c6f90', WATER_L: '#8fd0e0', BAMB: '#c9b27a', BAMB_D: '#9c8450', DOOR: '#3f2713',
  G: (typeof GOLD !== 'undefined' ? GOLD : '#e8b830'), GL: '#fff2b0', GD: (typeof GOLD_D !== 'undefined' ? GOLD_D : '#a87a1c')
};

// steep roof triangle seen from the gable end: tile courses, a coloured rim along both slopes
function ayRoofTri(P, cx, y0, y1, hw, tile, tileD, rim) {
  for (let y = y0; y <= y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0), w = Math.max(1, Math.round(1 + (hw - 1) * t));
    P.r(cx - w, y, w * 2, 1, ((y - y0) % 3 === 2) ? tileD : tile);
    if (w >= 2) { P.r(cx - w, y, 1, 1, rim); P.r(cx + w - 1, y, 1, 1, rim); }
  }
}
// chofa: slender gold hook rising from the gable apex
function ayChofa(P, cx, y) { P.r(cx - 1, y - 1, 2, 1, AY.G); P.r(cx - 1, y - 3, 1, 2, AY.G); P.r(cx, y - 4, 1, 1, AY.G); P.r(cx + 1, y - 4, 1, 1, AY.GL); }
// hang hong: small upturned gold curls at the lower ends of the gable boards
function ayHangHong(P, xl, xr, y) { P.r(xl, y - 1, 1, 1, AY.G); P.r(xl - 1, y - 2, 1, 1, AY.G); P.r(xr, y - 1, 1, 1, AY.G); P.r(xr + 1, y - 2, 1, 1, AY.G); }
// Thai gable: tiled triangle, dark gable face framed by gold pan lom boards, chofa on top, hang hong at the foot
function ayGable(P, cx, y0, y1, hw, o) {
  o = o || {};
  const tile = o.tile || AY.TILE, tileD = o.tileD || AY.TILE_D, rim = o.rim || AY.GRN, face = o.face || AY.FACE, trim = o.trim || AY.G;
  if (o.sep) ayRoofTri(P, cx, y0 - 1, y1, hw + 1, '#4a1a12', '#4a1a12', '#4a1a12');
  ayRoofTri(P, cx, y0, y1, hw, tile, tileD, rim);
  const ins = hw >= 12 ? 3 : 2;
  for (let y = y0 + ins + 1; y < y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0), w = Math.round(1 + (hw - 1) * t) - ins;
    if (w < 1) continue;
    P.r(cx - w, y, w * 2, 1, face); P.r(cx - w, y, 1, 1, trim); P.r(cx + w - 1, y, 1, 1, trim);
  }
  const wb = hw - ins;
  P.r(cx - wb, y1, wb * 2, 1, trim);
  if (o.emblem !== false && y1 - y0 >= 10) { const ey = y1 - Math.round((y1 - y0) * 0.35); P.r(cx - 1, ey, 2, 2, trim); P.r(cx - 1, ey - 1, 2, 1, AY.GL); }
  if (o.chofa !== false) ayChofa(P, cx, y0);
  if (o.hong !== false) ayHangHong(P, cx - wb - 1, cx + wb, y1);
}
// eave skirt: a lower roof tier spreading out under a gable
function ayEave(P, cx, y0, y1, hw0, hw1, tile, tileD, rim) {
  for (let y = y0; y <= y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0), w = Math.round(hw0 + (hw1 - hw0) * t);
    P.r(cx - w, y, w * 2, 1, ((y - y0) % 2) ? tileD : tile); P.r(cx - w, y, 1, 1, rim); P.r(cx + w - 1, y, 1, 1, rim);
  }
  P.r(cx - hw1, y1 + 1, hw1 * 2, 1, '#4a1a12');
}
// white-washed brick: lime plaster with faint courses and weathering
function ayWhite(P, x, y, w, h) {
  P.r(x, y, w, h, AY.WH);
  for (let j = 2; j < h; j += 3) for (let i = ((j / 3) & 1) * 3; i < w; i += 6) P.r(x + i, y + j, 3, 1, AY.WH_D);
  P.r(x, y, w, 1, '#fffaf0'); P.r(x, y + h - 1, w, 1, AY.WH_S); P.r(x + w - 1, y, 1, h, AY.WH_D);
}
// bai sema merlon: a leaf shape with a point on top
function ayLeaf(P, x, y) {
  P.r(x + 2, y, 1, 1, AY.WH); P.r(x + 1, y + 1, 3, 1, AY.WH); P.r(x, y + 2, 5, 2, AY.WH); P.r(x + 1, y + 4, 3, 2, AY.WH);
  P.r(x + 3, y + 1, 1, 1, AY.WH_D); P.r(x + 4, y + 2, 1, 2, AY.WH_D); P.r(x + 3, y + 4, 1, 2, AY.WH_D); P.r(x + 1, y + 2, 1, 1, '#fffaf0');
}
// purple thong banner with a little white elephant
function ayBanner(P, x, y, h) {
  P.r(x, y, 1, h, WOOD_D); P.r(x, y - 1, 1, 1, AY.G);
  P.r(x + 1, y + 1, 7, 5, AYC.main); P.r(x + 1, y + 1, 7, 1, AYC.trim); P.r(x + 1, y + 5, 7, 1, AYC.dark); P.r(x + 7, y + 3, 1, 1, AYC.dark);
  P.r(x + 3, y + 2, 3, 2, '#f4f0e2'); P.r(x + 6, y + 3, 1, 1, '#f4f0e2'); P.r(x + 3, y + 4, 1, 1, '#f4f0e2'); P.r(x + 5, y + 4, 1, 1, '#f4f0e2');
}
// teak panel wall (fa pakon): framed panels
function ayTeak(P, x, y, w, h) {
  P.r(x, y, w, h, AY.TEAK);
  for (let i = 0; i < w; i += 4) P.r(x + i, y, 1, h, AY.TEAK_D);
  P.r(x, y + (h >> 1), w, 1, AY.TEAK_D); P.r(x, y, w, 1, AY.TEAK_L);
}
// small Ruean Thai, used by the house and the raft house
function ayHouse(P, ox, oy, veranda) {
  const r = P.r;
  ayTeak(P, ox + 3, oy + 12, 16, 10); r(ox + 2, oy + 12, 1, 10, AY.TEAK_D); r(ox + 19, oy + 12, 1, 10, AY.TEAK_D);
  r(ox + 8, oy + 14, 5, 8, AY.DOOR); r(ox + 7, oy + 13, 7, 1, AY.G); r(ox + 4, oy + 15, 3, 3, '#2b1a0c'); r(ox + 15, oy + 15, 3, 3, '#2b1a0c');
  r(ox + 4, oy + 15, 3, 1, AYC.main); r(ox + 15, oy + 15, 3, 1, AYC.main);
  // steep roof with pinched, curved gable boards (pan lom) crossing at the top
  ayRoofTri(P, ox + 11, oy - 2, oy + 12, 11, '#8a4a2e', '#6e3820', '#4a2a18');
  for (let y = oy + 2; y < oy + 12; y++) { const t = (y - oy + 2) / 14, w = Math.round(1 + 10 * t) - 3; if (w > 0) { r(ox + 11 - w, y, w * 2, 1, AY.TEAK_L); r(ox + 11 - w + 1, y, w * 2 - 2, 1, (y & 1) ? AY.TEAK : AY.TEAK_L); } }
  for (let i = 0; i < 13; i++) { const x = Math.round(i * 10 / 13); r(ox + 11 - 1 - x - 1, oy - 1 + i, 1, 1, AY.TEAK_D); r(ox + 11 + x + 1, oy - 1 + i, 1, 1, AY.TEAK_D); }
  r(ox + 9, oy - 4, 1, 2, AY.TEAK_D); r(ox + 13, oy - 4, 1, 2, AY.TEAK_D); r(ox + 8, oy - 5, 1, 1, AY.TEAK_D); r(ox + 14, oy - 5, 1, 1, AY.TEAK_D);   // crossed ngao tips
  r(ox - 1, oy + 11, 1, 1, AY.TEAK_D); r(ox - 2, oy + 10, 1, 1, AY.TEAK_D); r(ox + 23, oy + 11, 1, 1, AY.TEAK_D); r(ox + 24, oy + 10, 1, 1, AY.TEAK_D);   // hang hong curls
  r(ox + 1, oy + 12, 20, 1, AYC.main);
  if (veranda) {
    // open chan veranda with a low rail and a potted plant
    r(ox + 20, oy + 22, 9, 1, AY.TEAK_L); r(ox + 20, oy + 18, 9, 1, AY.TEAK_D); for (const x of [21, 24, 27]) r(ox + x, oy + 18, 1, 4, AY.TEAK_D);
    r(ox + 25, oy + 20, 3, 2, '#a0532c'); r(ox + 25, oy + 18, 1, 2, '#4e9a3c'); r(ox + 26, oy + 17, 1, 3, '#6bbf4f'); r(ox + 27, oy + 18, 1, 1, '#4e9a3c');
  }
}

// an Ayutthaya building picture
function ayBuilding(kind) {
  const d = AY_DIMS[kind] || AY_DIMS.house;
  return sprite(`ay|${kind}`, d[0], d[1], 2, (P) => {
    const r = P.r, G = AY.G;
    if (kind === 'towncentre') {
      // Sala Klang: teak hall raised on a white-washed brick base, two-tier tiled roof with chofa, purple banner
      ayWhite(P, 3, 50, 42, 10); r(2, 49, 44, 1, AY.WH_D); r(2, 60, 44, 1, AY.WH_S);
      for (let i = 0; i < 4; i++) r(18 + i, 52 + i * 2, 12 - i * 2, 2, i & 1 ? AY.WH_D : AY.WH);      // front steps
      r(17, 50, 1, 10, AY.WH_S); r(30, 50, 1, 10, AY.WH_S);
      ayTeak(P, 6, 36, 36, 13); r(4, 48, 40, 1, AY.TEAK_D);
      for (const x of [5, 13, 33, 41]) { r(x, 34, 2, 15, '#6a3a1a'); r(x, 34, 1, 15, '#4a2810'); r(x - 1, 34, 4, 1, G); }   // columns
      r(20, 39, 8, 10, AY.DOOR); r(19, 38, 10, 1, G); r(23, 39, 1, 10, '#2a190a'); r(19, 37, 10, 1, AYC.main);
      for (const x of [8, 28, 36]) { r(x, 40, 4, 4, '#2b1a0c'); r(x, 39, 4, 1, G); }
      r(15, 40, 3, 7, AYC.main); r(15, 40, 3, 1, AYC.trim);
      ayEave(P, 24, 30, 33, 20, 24, AY.TILE, AY.TILE_D, AY.GRN);
      ayGable(P, 24, 6, 26, 13);
      ayGable(P, 24, 14, 30, 18, { sep: true });
      ayBanner(P, 40, 6, 28);
    } else if (kind === 'house') {
      // Ruean Thai: teak stilt house, steep roof with curved gable boards, open veranda, ladder
      posts(P, [4, 11, 18, 22, 28], 32, 45, 2);
      r(2, 30, 28, 2, '#8f6232'); r(2, 32, 28, 1, '#5a3a1e');
      ayHouse(P, 1, 8, true);
      for (let y = 34; y < 45; y += 3) r(12, y, 5, 1, WOOD); r(12, 33, 1, 12, WOOD); r(16, 33, 1, 12, WOOD);   // ladder
      r(23, 41, 4, 4, '#7a4a24'); r(23, 41, 4, 1, '#a0693a'); r(1, 43, 3, 2, '#c9a05a');                       // water jar, rice basket
    } else if (kind === 'raft') {
      // Ruean Phae: the same house on a bamboo raft, moored on the river
      for (let i = 0; i < 6; i++) { r(1 + i * 5, 30, 5, 3, AY.BAMB); r(1 + i * 5, 32, 5, 1, AY.BAMB_D); r(1 + i * 5, 30, 1, 3, AY.BAMB_D); }   // bamboo floats
      r(1, 28, 30, 2, '#8f6232'); r(1, 28, 30, 1, AY.TEAK_L);
      ayHouse(P, 1, 6, true);
      r(30, 14, 1, 20, WOOD_D); r(29, 13, 3, 1, WOOD_D);                                                     // mooring pole
    } else if (kind === 'tower') {
      // Pom: white-washed brick bastion, tapered, bai sema merlons, cannon ports, small tiled pavilion on top
      for (let y = 32; y < 62; y++) { const inset = Math.round((61 - y) / 10); r(4 + inset, y, 24 - inset * 2, 1, AY.WH); }
      for (let y = 34; y < 62; y += 3) for (let x = 6 + ((y / 3) & 1) * 3; x < 26; x += 6) r(x, y, 3, 1, AY.WH_D);
      r(25, 32, 2, 30, AY.WH_D); r(26, 40, 2, 22, AY.WH_S); r(3, 61, 26, 2, AY.WH_S);
      r(13, 50, 6, 12, '#2b1a0c'); r(14, 49, 4, 1, '#2b1a0c'); r(12, 50, 1, 12, AY.WH_S); r(19, 50, 1, 12, AY.WH_S);   // arched door
      r(13, 51, 6, 11, AY.TEAK_D); r(16, 51, 1, 11, '#4a2810'); r(14, 54, 1, 1, G); r(17, 54, 1, 1, G); r(14, 58, 1, 1, G); r(17, 58, 1, 1, G);
      for (const x of [8, 21]) { r(x, 40, 3, 3, '#2b1a0c'); r(x, 39, 3, 1, AY.WH_S); r(x + 1, 41, 2, 1, '#5e5a52'); }   // cannon ports
      r(2, 28, 28, 4, AY.WH); r(2, 28, 28, 1, '#fffaf0'); r(2, 31, 28, 1, AY.WH_S); r(2, 29, 28, 1, AY.WH_D);       // parapet
      for (const x of [2, 8.5, 13.5, 19, 25]) ayLeaf(P, Math.round(x), 22);
      posts(P, [9, 21], 16, 28, 2); r(14, 19, 3, 6, '#d9a066'); r(14, 18, 3, 1, AYC.main); r(13, 22, 5, 1, AYC.dark);   // sentry
      ayGable(P, 16, 5, 16, 9, { emblem: false });
      r(4, 16, 24, 1, AYC.main);
      ayBanner(P, 24, 0, 16);
    } else if (kind === 'palisade') {
      // Khai: wooden stockade of sharpened logs, lashed to two rails
      const hs = [5, 3, 6, 2, 4, 5, 3, 6];
      for (let i = 0; i < 8; i++) {
        const x = i * 4, top = hs[i] + 2;
        r(x, top + 2, 4, 28 - top, '#8a5a2b'); r(x, top + 2, 1, 28 - top, '#a8773c'); r(x + 3, top + 2, 1, 28 - top, '#5e3b1c');
        r(x + 1, top, 2, 2, '#a8773c'); r(x + 1, top - 1, 1, 1, '#c99b5d'); r(x + 2, top + 1, 1, 1, '#c99b5d');   // sharpened tip
        r(x + 1, top + 6, 1, 2, '#5e3b1c');
      }
      for (const y of [14, 23]) { r(0, y, 32, 2, '#6b4a2a'); r(0, y, 32, 1, '#8f6232'); for (let x = 1; x < 32; x += 4) r(x, y, 2, 2, '#c9b27a'); }   // rails and rattan lashings
      r(0, 29, 32, 1, '#4a3420');
      r(13, 5, 1, 9, WOOD_D); r(14, 6, 4, 3, AYC.main); r(14, 6, 4, 1, AYC.trim);
    } else if (kind === 'wall') {
      // Kamphaeng: white-washed brick city wall with bai sema merlons
      ayWhite(P, 0, 12, 32, 20); r(0, 12, 32, 2, AY.WH); r(0, 13, 32, 1, AY.WH_D);
      r(0, 30, 32, 3, AY.WH_S); r(0, 30, 32, 1, AY.WH_D);
      for (const [x, y] of [[5, 20], [22, 25], [14, 17]]) { r(x, y, 3, 1, '#c8bfae'); r(x + 1, y + 1, 2, 1, '#c8bfae'); }   // weathering
      for (const x of [1, 9, 17, 25]) ayLeaf(P, x, 6);
      r(0, 11, 32, 1, AY.WH_S);
      r(14, 22, 4, 2, '#2b1a0c');                                                                            // loophole
    } else if (kind === 'gate') {
      // Pratu: arched gate in the brick wall under a tall tiered spire, teak doors studded with gold
      ayWhite(P, 0, 30, 48, 16); r(0, 44, 48, 3, AY.WH_S);
      for (const x of [0, 6, 37, 43]) ayLeaf(P, x, 24);
      ayWhite(P, 12, 22, 24, 24); r(11, 44, 26, 3, AY.WH_S);
      // arch opening with teak doors
      r(17, 32, 14, 14, '#2b1a0c'); r(18, 30, 12, 2, '#2b1a0c'); r(20, 29, 8, 1, '#2b1a0c');
      r(18, 33, 12, 13, AY.TEAK_D); r(18, 32, 12, 1, AY.TEAK); r(24, 32, 1, 14, '#3f2713');
      for (const y of [35, 39, 43]) for (const x of [19, 22, 26, 29]) r(x, y, 1, 1, G);
      r(16, 29, 1, 17, G); r(31, 29, 1, 17, G); r(17, 28, 14, 1, G); r(19, 27, 10, 1, G);
      r(14, 23, 20, 3, AY.FACE); r(14, 23, 20, 1, G); r(14, 25, 20, 1, G); r(22, 24, 4, 1, G);                     // lintel panel
      // tiered spire (yod) over the arch
      ayEave(P, 24, 19, 21, 11, 14, AY.TILE, AY.TILE_D, AY.GRN);
      ayGable(P, 24, 11, 19, 9, { emblem: false, chofa: false });
      for (let i = 0; i < 5; i++) { const w = 5 - i, y = 10 - i * 2; r(24 - w, y, w * 2, 2, i & 1 ? AY.TILE_D : AY.TILE); r(24 - w, y, w * 2, 1, G); }
      r(23, 0, 2, 2, G); r(23, 0, 1, 1, AY.GL);
      ayBanner(P, 2, 10, 16); ayBanner(P, 38, 10, 16);
    } else if (kind === 'healer') {
      // Wat: ordination hall (ubosot) with red/green tiered roof and chofa, gold doors, white chedi beside it
      ayWhite(P, 1, 46, 34, 5); r(0, 45, 36, 1, AY.WH_D);
      ayWhite(P, 4, 30, 28, 15);
      for (const x of [3, 31]) { r(x, 30, 2, 15, AY.WH_D); r(x, 30, 2, 1, G); }
      r(14, 33, 8, 12, G); r(14, 33, 8, 1, AY.GL); r(18, 33, 1, 12, AY.GD); r(15, 36, 2, 3, AY.GD); r(19, 36, 2, 3, AY.GD); r(13, 32, 10, 1, AY.TILE);   // gold doors
      for (const x of [7, 25]) { r(x, 35, 4, 5, '#2b1a0c'); r(x, 34, 4, 1, G); r(x + 1, 33, 2, 1, G); }
      ayEave(P, 18, 27, 29, 15, 18, AY.GRN, AY.GRN_D, AY.TILE);
      ayGable(P, 18, 4, 24, 12, { rim: AY.GRN });
      ayGable(P, 18, 12, 28, 16, { tile: AY.GRN, tileD: AY.GRN_D, rim: AY.ORG, sep: true });
      r(10, 47, 2, 3, AY.WH_D); r(25, 47, 2, 3, AY.WH_D);                                                     // sema stones
      // chedi: square base tiers, bell, rings, spire
      ayWhite(P, 35, 44, 12, 6); r(34, 49, 14, 2, AY.WH_S);
      ayWhite(P, 36, 41, 10, 3);
      for (let y = 32; y <= 41; y++) { const w = Math.max(1, Math.round(5.5 * Math.sqrt(Math.max(0, 1 - ((41 - y) / 9.5) ** 2)))); r(41 - w, y, w * 2, 1, AY.WH); r(41 + w - 2, y, 2, 1, AY.WH_D); r(41 - w, y, 1, 1, '#fffaf0'); }   // bell
      r(36, 41, 10, 1, AY.WH_S);
      r(39, 29, 4, 3, AY.WH); r(42, 29, 1, 3, AY.WH_D); r(38, 29, 6, 1, AY.WH_D);                            // harmika
      for (let i = 0; i < 6; i++) { const w = i < 3 ? 2 : 1; r(41 - w, 23 + i, w * 2, 1, i & 1 ? AY.WH_D : AY.WH); }   // rings
      r(40, 17, 2, 6, AY.G); r(41, 17, 1, 6, AY.GD); r(40, 15, 1, 2, AY.GL);
      r(36, 40, 10, 1, AYC.main);                                                     // purple sash at the foot of the bell
      ayBanner(P, 1, 12, 18);
    } else if (kind === 'palace') {
      // Wang: prasat-style throne hall, white walls, tiered roofs, gilded central spire, purple banners
      ayWhite(P, 2, 66, 60, 10); r(1, 65, 62, 1, AY.WH_D); r(1, 76, 62, 1, AY.WH_S);
      for (let i = 0; i < 5; i++) r(24 + i, 66 + i * 2, 16 - i * 2, 2, i & 1 ? AY.WH_D : AY.WH);               // grand stair
      r(23, 66, 1, 10, AY.WH_S); r(40, 66, 1, 10, AY.WH_S);
      for (const x of [4, 52]) { ayWhite(P, x, 50, 8, 15); r(x + 2, 54, 4, 6, '#2b1a0c'); r(x + 1, 53, 6, 1, G); r(x + 2, 54, 4, 1, AYC.main); }   // side wings
      ayWhite(P, 14, 46, 36, 19);
      for (const x of [13, 49]) { r(x, 46, 2, 19, AY.WH_D); r(x, 46, 2, 1, G); }
      r(28, 50, 8, 15, G); r(28, 50, 8, 1, AY.GL); r(32, 50, 1, 15, AY.GD); r(29, 53, 2, 4, AY.GD); r(33, 53, 2, 4, AY.GD); r(27, 49, 10, 1, AYC.main);
      for (const x of [17, 22, 39, 44]) { r(x, 52, 3, 6, '#2b1a0c'); r(x, 51, 3, 1, G); r(x + 1, 50, 1, 1, G); }
      r(14, 60, 36, 1, AYC.main); r(14, 61, 36, 1, AYC.dark);
      // wing roofs (seen from the long side) then the stacked front gables
      for (const cx of [8, 56]) { ayEave(P, cx, 46, 48, 5, 7, AY.TILE, AY.TILE_D, AY.GRN); ayGable(P, cx, 37, 46, 6, { emblem: false }); }
      ayEave(P, 32, 41, 45, 18, 22, AY.TILE, AY.TILE_D, AY.GRN);
      ayGable(P, 32, 22, 38, 14);
      ayGable(P, 32, 30, 42, 18, { sep: true });
      // gilded prasat spire rising from the crossing
      for (let i = 0; i < 5; i++) { const w = 7 - i, y = 22 - i * 3; r(32 - w, y, w * 2, 3, i & 1 ? AY.TILE_D : AY.TILE); r(32 - w, y, w * 2, 1, G); r(32 - w, y + 2, 1, 1, AY.GRN); r(32 + w - 1, y + 2, 1, 1, AY.GRN); }
      for (let y = 2; y < 10; y++) { const w = y < 5 ? 1 : 2; r(32 - w, y, w * 2, 1, (y & 1) ? AY.G : AY.GD); }
      r(31, 0, 2, 2, AY.GL);
      ayBanner(P, 0, 22, 26); ayBanner(P, 56, 22, 26);
    }
  });
}
if (typeof window !== 'undefined') { window.ayBuilding = ayBuilding; window.AYC = AYC; }
/* Naval roster sprite mockups. Uses sprite(), TEAMC and the palette constants
   from art.js. All ships face right (bow on the right).
   navalSprite(kind, team), kinds by roster slot:
     fishing  - Melaka Sampan            / Majapahit Jukung
     trade    - Melaka Jong Dagang (armed trader, unique) / Majapahit Perahu Api (fire ship, unique)
     light    - Melaka Penjajap          / Majapahit Jukung Perang
     galley   - Melaka Lancaran          / Majapahit Kelulus      (both carry troops)
     frigate  - Melaka Ghali             / Majapahit Jong Perang
     flagship - Melaka Mendam Berahi     / Majapahit Jong Raya */
const SAIL = '#efe3c0', SAIL_D = '#cbbd92', MAT = '#c9a96a', MAT_D = '#a4844a', JSAIL = '#6f8a52', JSAIL_D = '#52683c';
const HULL = '#7a4a24', HULL_D = '#5e3b1c', HULL_L = '#a8773c', PORT = '#2a1a10', FIRE = '#e2562c', FIRE_L = '#f6b33a';

// Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line.
function hull(P, x0, x1, y, depth, T, ports) {
  for (let i = 0; i < depth; i++) P.r(x0 + i, y + i, x1 - x0 - i * 2, 1, i === 0 ? HULL_L : i === depth - 1 ? HULL_D : HULL);
  P.r(x0 + 1, y + 1, x1 - x0 - 2, 1, T.main);
  if (ports) for (let x = x0 + 4; x < x1 - 4; x += 4) P.r(x, y + 3, 2, 1, PORT);
  P.r(x0 - 1, y - 1, 2, 1, HULL); P.r(x0 - 2, y - 2, 1, 1, HULL);
  P.r(x1 - 1, y - 1, 2, 1, HULL); P.r(x1 + 1, y - 3, 1, 3, HULL); P.r(x1 + 1, y - 4, 1, 1, T.trim);
}
// Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig.
function tanja(P, x, y, w, h, col, colD, T, mark) {
  const mat = col === MAT;
  for (let i = 0; i < h; i++) { const sx = x + Math.round(i * 0.5); P.r(sx, y + i, w, 1, (mat && i % 4 === 3) ? colD : col); if (!mat) P.r(sx + w - 1, y + i, 1, 1, colD); }
  P.r(x - 1, y - 1, w + 2, 1, WOOD_D);
  P.r(x + Math.round(h * 0.5) - 1, y + h, w + 2, 1, WOOD_D);
  if (mark) P.r(x + Math.round(h * 0.25) + (w >> 1) - 1, y + (h >> 1) - 1, 2, 2, T.main);
}
// Junk-style battened fan sail (the green sails of the great Jong).
function fan(P, x, y, w, h) {
  for (let i = 0; i < h; i++) {
    const t = i / (h - 1), ww = Math.max(2, Math.round(w * (0.55 + 0.45 * Math.sin(Math.min(1, t * 1.4) * Math.PI / 2))));
    P.r(x + Math.round(i * 0.35), y + i, ww, 1, (i % 3 === 2) ? JSAIL_D : JSAIL);
  }
  P.r(x - 1, y - 1, Math.round(w * 0.6), 1, WOOD_D);
}
// Square sail with a darker belly edge (European-influenced late ships).
function sq(P, x, y, w, h) { P.r(x, y, w, h, SAIL); P.r(x + w - 1, y + 1, 1, h - 1, SAIL_D); P.r(x, y + h - 1, w, 1, SAIL_D); P.r(x - 1, y - 1, w + 2, 1, WOOD_D); }
// paint a ship mast
function mast(P, x, y0, y1) { P.r(x, y0, 1, y1 - y0, WOOD_D); }
// paint a small flag
function flag(P, x, y, c1, c2) { P.r(x, y, 4, 2, c1); P.r(x + 1, y, 2, 1, c2); }
// paint a row of oars
function oars(P, xs, y, len) {   // OARPH (0-3) set while a moving ship is drawn: oar j is at stroke (OARPH + j) % 4: mid, steep, mid, flat
  const ph = window.OARPH;
  xs.forEach((x, j) => { const q = ph == null ? 0 : [0, 1, 0, 2][(ph + j) % 4];
    for (let i = 0; i < len; i++) P.r(x - (q === 1 ? i >> 1 : i), y + (q === 2 ? i >> 1 : i), 1, 1, i === len - 1 ? HULL_L : WOOD); });
}
// paint a crewman on deck
function crew(P, x, y, head, body) { P.r(x, y, 2, 1, head); P.r(x, y + 1, 2, 2, SKIN); P.r(x, y + 3, 2, 1, body); }
// paint flames
function flames(P, list, base) { for (const [x, h] of list) { P.r(x, base - h, 2, h, FIRE); P.r(x, base - h + 2, 1, h - 3, FIRE_L); P.r(x, base - h + 3, 1, 1, '#fff0a0'); } }

const NAVAL_DIMS = { fishing: [24, 22], trade: [36, 30], jong: [36, 30], light: [30, 24], galley: [38, 29], frigate: [44, 36], flagship: [54, 42] };
const NAVAL_NAMES = [
  { fishing: 'Sampan', trade: 'Jong Dagang', light: 'Penjajap', galley: 'Lancaran', frigate: 'Ghali', flagship: 'Mendam Berahi' },
  { fishing: 'Jukung', trade: 'Perahu Api', light: 'Jukung Perang', galley: 'Kelulus', frigate: 'Jong Perang', flagship: 'Jong Raya' }
];

const NAVAL_CLASS = [
  { fishing: 'Fishing Boat', trade: 'Armed Trade Ship', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' },
  { fishing: 'Fishing Boat', trade: 'Fire Ship', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' }
];

// a ship picture by kind and civ
function navalSprite(kind, team) {
  const T = TEAMC[team] || TEAMC[0], mel = team === 0;
  const d = (kind === 'trade' && !mel) ? [24, 24] : NAVAL_DIMS[kind];
  return sprite('naval|' + kind + '|' + team, d[0], d[1], 2, (P) => {
    const r = P.r, S1 = mel ? SAIL : MAT, S2 = mel ? SAIL_D : MAT_D;
    if (kind === 'fishing') {
      if (mel) {
        // Sampan: one small tanja sail, fisherman under a terendak
        mast(P, 10, 3, 14); tanja(P, 8, 3, 8, 9, SAIL, SAIL_D, T, true);
        r(4, 9, 4, 1, '#e8c97a'); r(5, 10, 2, 2, SKIN); r(5, 12, 2, 1, T.main);
        hull(P, 3, 17, 13, 4, T); r(2, 11, 1, 2, '#cfc3a0'); r(1, 12, 1, 1, '#cfc3a0');
      } else {
        // Jukung: outrigger canoe with a crab-claw sail
        mast(P, 10, 4, 14);
        for (let i = 0; i < 9; i++) r(11, 4 + i, Math.max(1, 7 - Math.abs(i - 3)), 1, (i % 3 === 2) ? MAT_D : MAT);
        r(11, 4, 1, 9, T.main);
        crew(P, 5, 9, HAIR, T.main);
        hull(P, 3, 17, 13, 3, T);
        r(4, 17, 14, 1, WOOD); r(6, 15, 1, 3, WOOD_D); r(14, 15, 1, 3, WOOD_D); r(3, 18, 16, 1, '#c8b88a');
      }
    } else if (kind === 'jong') {
      // Jong Jawa: the great Javanese merchant ship, three masts of woven-mat tanja sails, a high stern, two side rudders
      mast(P, 9, 2, 20); mast(P, 18, 0, 20); mast(P, 27, 4, 20);
      tanja(P, 6, 2, 7, 12, MAT, MAT_D, T, true); tanja(P, 15, 0, 8, 14, MAT, MAT_D, T, true); tanja(P, 24, 4, 7, 10, MAT, MAT_D, T, false);
      flag(P, 19, 0, T.main, '#f1ece0');
      r(2, 13, 7, 1, T.main); r(2, 14, 7, 4, WOOD_D); r(3, 15, 2, 1, '#e8c97a'); r(12, 17, 4, 2, '#a07040'); r(21, 17, 3, 2, '#8a6030');
      hull(P, 2, 33, 19, 6, T, true);
      r(4, 20, 1, 5, WOOD_D); r(6, 20, 1, 4, WOOD_D);
    } else if (kind === 'trade' && mel) {
      // Jong Dagang: broad Malay merchant junk, two big tanja sails, swivel guns (lela) on the rail
      mast(P, 13, 2, 20); mast(P, 24, 5, 20);
      tanja(P, 9, 2, 9, 14, SAIL, SAIL_D, T, true); tanja(P, 21, 5, 8, 11, SAIL, SAIL_D, T, false);
      flag(P, 14, 0, T.main, T.trim);
      // stern deckhouse with a gold-trimmed roof, crates midships
      r(3, 15, 7, 1, T.main); r(3, 16, 7, 3, WOOD); r(16, 17, 4, 2, '#a07040');
      hull(P, 3, 32, 19, 6, T, true);
      for (const x of [12, 22, 28]) { r(x, 18, 1, 1, STEEL_D); r(x + 1, 18, 1, 1, STEEL); }
    } else if (kind === 'trade') {
      // Perahu Api: fire ship packed with oiled brush
      r(11, 3, 3, 2, '#5a5560'); r(9, 1, 3, 2, '#77727c'); r(12, 0, 2, 1, '#77727c');
      flames(P, [[6, 6], [8, 9], [10, 7], [12, 10], [14, 6], [16, 8]], 16);
      r(5, 13, 13, 3, '#6a4a2a'); r(6, 14, 2, 1, '#8a6b3a'); r(11, 13, 3, 1, '#8a6b3a');
      hull(P, 3, 19, 16, 4, T);
      r(18, 12, 1, 4, WOOD_D); r(19, 12, 2, 1, T.main);
    } else if (kind === 'light') {
      if (mel) {
        // Penjajap: slim fast raider, one tall tanja sail, bow gun
        mast(P, 14, 1, 16); tanja(P, 11, 1, 9, 13, SAIL, SAIL_D, T, true); flag(P, 15, -1, T.main, T.trim);
        r(25, 13, 3, 1, STEEL_D);
        hull(P, 3, 27, 16, 4, T);
      } else {
        // Jukung Perang: cheap outrigger war canoe, crab-claw sail, spearmen
        mast(P, 13, 2, 15);
        for (let i = 0; i < 11; i++) r(14, 2 + i, Math.max(1, 8 - Math.abs(i - 4)), 1, (i % 3 === 2) ? MAT_D : MAT);
        r(14, 2, 1, 11, T.main);
        hull(P, 3, 25, 14, 3, T);
        r(4, 19, 22, 1, WOOD); r(7, 17, 1, 3, WOOD_D); r(21, 17, 1, 3, WOOD_D); r(3, 20, 24, 1, '#c8b88a');
      }
    } else if (kind === 'galley') {
      // Lancaran / Kelulus: oared war galley with two tanja sails and a fighting deck; carries troops
      mast(P, 13, 2, 18); mast(P, 25, 4, 18);
      tanja(P, 10, 2, 9, 12, S1, S2, T, true); tanja(P, 22, 4, 8, 10, S1, S2, T, false);
      flag(P, 14, 0, T.main, T.trim);
      hull(P, 3, 34, 18, 6, T);
      oars(P, [10, 15, 20, 25, 30], 24, 4);
    } else if (kind === 'frigate') {
      if (mel) {
        // Ghali: big gunned galley-ship, square sails forward, tanja aft, row of gunports
        mast(P, 15, 1, 24); mast(P, 28, 4, 24); mast(P, 8, 9, 24);
        sq(P, 10, 3, 11, 14); sq(P, 24, 6, 9, 11); r(15, 9, 2, 2, T.main);
        tanja(P, 4, 10, 5, 7, SAIL, SAIL_D, T, false);
        flag(P, 16, -1, T.main, T.trim); flag(P, 28, 1, T.main, T.trim);
        hull(P, 3, 40, 24, 8, T, true);
      } else {
        // Jong Perang: two-masted Javanese war jong, mat tanja sails, castle aft, archers on deck
        mast(P, 15, 0, 24); mast(P, 29, 4, 24);
        tanja(P, 10, 1, 12, 16, MAT, MAT_D, T, true); tanja(P, 25, 5, 10, 13, MAT, MAT_D, T, false);
        flag(P, 16, -2, T.main, GOLD);
        r(3, 17, 8, 1, T.main); r(3, 18, 8, 6, WOOD);
        hull(P, 3, 40, 24, 7, T);
      }
    } else if (kind === 'flagship') {
      if (mel) {
        // Mendam Berahi: Hang Tuah's legendary flagship. Three tall tanja masts, two gun decks,
        // a Malay-roofed stern castle and royal yellow pennants.
        mast(P, 16, 2, 28); mast(P, 28, 4, 28); mast(P, 39, 8, 28);
        tanja(P, 11, 3, 11, 17, SAIL, SAIL_D, T, true); tanja(P, 24, 5, 10, 15, SAIL, SAIL_D, T, true); tanja(P, 35, 9, 8, 11, SAIL, SAIL_D, T, false);
        flag(P, 17, 0, GOLD, T.main); flag(P, 29, 2, GOLD, T.main); flag(P, 40, 6, GOLD, T.main);
        // stern castle with a layered Malay roof
        r(3, 16, 10, 1, T.dark); r(4, 15, 8, 1, T.main); r(6, 14, 4, 1, GOLD); r(3, 17, 10, 11, WOOD);
        hull(P, 3, 49, 28, 10, T, true); r(5, 30, 42, 1, GOLD);
      } else {
        // Jong Raya: the great Javanese jong. Four green battened fan sails, towering hull,
        // wooden castles fore and aft, sweeps along the side.
        for (const [mx, top] of [[10, 4], [21, 1], [32, 2], [43, 6]]) { mast(P, mx, top, 26); fan(P, mx - 5, top + 1, 8, 17 - (top >> 1)); }
        flag(P, 23, -1, T.main, GOLD); flag(P, 13, 1, T.main, GOLD);
        r(3, 19, 8, 1, T.main); r(3, 20, 8, 6, WOOD); r(43, 21, 7, 1, T.main); r(44, 22, 6, 4, WOOD);
        hull(P, 3, 50, 26, 11, T); r(6, 30, 42, 1, GOLD);
      }
    }
  });
}
/* Naval roster sprites for Ayutthaya, Dai Viet and Khmer, same slots as ships.js.
   Needs ships.js (hull, mast, flag, oars, crew, tanja, colours), civs-ayutthaya-daiviet.js (CIVC)
   and civs-khmer.js (KHC, STONE). All ships face right.
   mainlandShip(civ, kind): civ 'ayu' | 'dv' | 'km', kind fishing | trade | light | galley | frigate | flagship. */
const MAIN_NAMES = {
  ayu: { fishing: 'Ruea Pramong', trade: 'Samphao', light: 'Ruea Chai', galley: 'Ruea Rop', frigate: 'Samphao Rop', flagship: 'Suphannahong' },
  dv: { fishing: 'Thuyen Thung', trade: 'Mong Dong', light: 'Khinh Thuyen', galley: 'Thuyen Chien', frigate: 'Lau Thuyen', flagship: 'Long Thuyen' },
  km: { fishing: 'Touk', trade: 'Touk Ngo', light: 'River Skiff', galley: 'Bayon Galley', frigate: 'Ballista Barge', flagship: 'Naga Barge' }
};
const MAIN_CLASS = {
  ayu: { fishing: 'Fishing Boat', trade: 'Trade Junk', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' },
  dv: { fishing: 'Fishing Boat', trade: 'Armoured Gunboat', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' },
  km: { fishing: 'Fishing Boat', trade: 'War Canoe', light: 'Sloop', galley: 'Galley', frigate: 'Frigate', flagship: 'Flagship' }
};
const JUNK = '#b0563a', JUNK_D = '#8a3f2a', DVSAIL = '#c98a3a', DVSAIL_D = '#a06a26';

// Battened junk sail: a tall rectangle with battens and a rounded top-front corner.
function junk(P, x, y, w, h, col, colD) {
  for (let i = 0; i < h; i++) { const cut = i < 2 ? 2 - i : 0; P.r(x, y + i, w - cut, 1, (i % 3 === 2) ? colD : col); }
  P.r(x - 1, y + h, w + 1, 1, WOOD_D);
}
// Tall curving prow (Thai and Khmer barges).
function prow(P, x, y, h, col, colD) { P.r(x, y + 2, 1, h - 2, col); P.r(x + 1, y + 1, 1, 2, col); P.r(x + 1, y, 2, 1, colD); P.r(x - 1, y + h - 1, 1, 1, colD); }
// Painted bow eye, the mark of Vietnamese boats.
function eye(P, x, y) { P.r(x, y, 2, 1, '#f4ecd4'); P.r(x + 1, y, 1, 1, '#1e1a18'); }
// Pavilion with a tiered pointed roof.
function pavilion(P, x, y, w, h, roof, roofD, wall) {
  P.r(x, y, w, h, wall); for (let i = 0; i < 3; i++) P.r(x - 1 + i, y - 1 - i, w + 2 - i * 2, 1, i & 1 ? roofD : roof);
  P.r(x + (w >> 1), y - 5, 1, 2, GOLD);
}

// a Khmer/Dai Viet ship picture (battle demos)
function mainlandShip(civ, kind) {
  const T = civ === 'km' ? KHC : CIVC[civ];
  const d = (civ === 'dv' && kind === 'fishing') ? [20, 18] : (civ === 'km' && kind === 'trade') ? [32, 18] : NAVAL_DIMS[kind];
  return sprite('ml|' + civ + '|' + kind, d[0], d[1], 2, (P) => {
    const r = P.r;
    const kman = (x, top, col, spear) => { if (spear) { r(x + 2, top + 1, 1, 1, STEEL); r(x + 2, top + 2, 1, 5, WOOD); } top += 3; r(x, top, 2, 1, HAIR); r(x, top + 1, 2, 2, SKIN); r(x, top + 3, 2, 1, col); };   // same figure as crew(): 2 wide, 4 tall, feet where the old 7-tall one stood
    if (civ === 'ayu') {
      if (kind === 'fishing') {
        // small canoe with a square mat lug sail
        mast(P, 11, 3, 13); r(7, 4, 8, 8, MAT); r(7, 7, 8, 1, MAT_D); r(7, 10, 8, 1, MAT_D); r(6, 3, 10, 1, WOOD_D);
        crew(P, 4, 9, '#d9b45a', T.main); hull(P, 3, 17, 13, 3, T);
      } else if (kind === 'trade') {
        // samphao: Siamese trading junk, high stern, red battened sails
        mast(P, 15, 2, 20); mast(P, 25, 6, 20); junk(P, 10, 3, 10, 14, JUNK, JUNK_D); junk(P, 22, 7, 8, 10, JUNK, JUNK_D);
        r(3, 14, 7, 5, WOOD); r(3, 13, 7, 1, T.main); flag(P, 16, 0, T.main, GOLD);
        hull(P, 3, 32, 19, 6, T);
      } else if (kind === 'light') {
        // ruea chai: slim war barge, tall prow, small canopy, many paddles
        prow(P, 26, 6, 10, GOLD, GOLD_D); pavilion(P, 8, 11, 6, 4, T.main, T.dark, WOOD);
        hull(P, 3, 26, 15, 3, T); oars(P, [9, 14, 19, 24], 18, 4);
      } else if (kind === 'galley') {
        // ruea rop: long troop barge, pavilion amidships, tall prow
        prow(P, 34, 9, 12, GOLD, GOLD_D); pavilion(P, 13, 12, 10, 6, T.main, T.dark, WOOD); r(4, 13, 1, 5, WOOD_D); flag(P, 5, 12, T.main, GOLD);
        hull(P, 3, 34, 18, 5, T); oars(P, [9, 14, 19, 24, 29], 23, 4);
      } else if (kind === 'frigate') {
        // samphao rop: big armed junk, three red battened sails, gunports
        mast(P, 12, 4, 24); mast(P, 22, 1, 24); mast(P, 32, 5, 24);
        junk(P, 7, 6, 9, 13, JUNK, JUNK_D); junk(P, 17, 2, 11, 17, JUNK, JUNK_D); junk(P, 29, 7, 8, 12, JUNK, JUNK_D);
        r(3, 18, 7, 6, WOOD); r(3, 17, 7, 1, T.main); flag(P, 23, -1, T.main, GOLD);
        hull(P, 3, 40, 24, 8, T, true);
      } else {
        // suphannahong: golden royal swan barge, tiered pavilion, rows of oars
        r(48, 12, 2, 16, GOLD); r(49, 9, 2, 4, GOLD); r(50, 8, 3, 2, GOLD); r(52, 9, 1, 1, '#c0392b'); r(47, 22, 1, 6, GOLD_D);   // swan neck and head
        r(4, 20, 2, 8, GOLD); r(3, 18, 2, 3, GOLD);                                                                               // tail
        pavilion(P, 22, 20, 12, 7, GOLD, GOLD_D, T.main); r(24, 22, 2, 3, T.dark); r(30, 22, 2, 3, T.dark);
        for (let x = 10; x < 46; x += 3) r(x, 27, 1, 1, '#c0392b');
        hull(P, 4, 47, 28, 7, { main: GOLD, trim: GOLD }); r(6, 30, 38, 1, T.main);
        oars(P, [10, 15, 20, 25, 30, 35, 40], 35, 5);
      }
    } else if (civ === 'dv') {
      if (kind === 'fishing') {
        // thuyen thung: round woven basket boat with one rower
        r(4, 11, 12, 4, '#a8803c'); r(3, 12, 14, 2, '#a8803c'); r(5, 15, 10, 1, '#7a5a2a'); for (let x = 4; x < 16; x += 2) r(x, 12, 1, 1, '#8a6a32');
        r(9, 7, 2, 1, '#efe0b0'); r(8, 8, 4, 1, '#efe0b0'); r(9, 9, 2, 2, SKIN); r(11, 8, 1, 7, WOOD); r(12, 14, 1, 2, WOOD_D);
      } else if (kind === 'trade') {
        // mong dong: armoured gunboat, a covered deck with a bow cannon and one junk sail
        mast(P, 18, 3, 19); junk(P, 13, 4, 9, 11, DVSAIL, DVSAIL_D);
        r(5, 15, 24, 4, '#5e3b1c'); r(5, 15, 24, 1, '#3a2a1c'); for (let x = 7; x < 28; x += 4) r(x, 17, 2, 1, '#2a1a10');
        r(29, 16, 4, 2, IRON); r(29, 16, 4, 1, IRON_L); flag(P, 19, 1, T.trim, T.main);
        hull(P, 3, 32, 19, 6, T); eye(P, 29, 21);
      } else if (kind === 'light') {
        // khinh thuyen: small fast boat, one junk sail, oars
        mast(P, 14, 2, 15); junk(P, 10, 3, 8, 11, DVSAIL, DVSAIL_D);
        hull(P, 3, 26, 15, 4, T); eye(P, 23, 16); oars(P, [9, 15, 21], 19, 4);
      } else if (kind === 'galley') {
        // thuyen chien: oared war galley with two junk sails and a painted eye
        mast(P, 13, 3, 18); mast(P, 24, 6, 18); junk(P, 9, 4, 8, 12, DVSAIL, DVSAIL_D); junk(P, 21, 7, 7, 9, DVSAIL, DVSAIL_D);
        r(3, 14, 6, 4, WOOD); r(3, 13, 6, 1, T.trim); flag(P, 14, 1, T.trim, T.main);
        hull(P, 3, 34, 18, 6, T); eye(P, 30, 19); oars(P, [10, 15, 20, 25, 30], 24, 4);
      } else if (kind === 'frigate') {
        // lau thuyen: tower ship, two-storey castle and two junk sails, gun row
        mast(P, 26, 2, 24); mast(P, 36, 7, 24); junk(P, 21, 3, 10, 16, DVSAIL, DVSAIL_D); junk(P, 32, 8, 8, 11, DVSAIL, DVSAIL_D);
        r(5, 15, 13, 9, WOOD); r(6, 10, 11, 5, WOOD); r(4, 14, 15, 1, T.trim); r(5, 9, 13, 1, T.trim); r(8, 12, 2, 2, PORT); r(13, 12, 2, 2, PORT); r(8, 18, 2, 2, PORT); r(13, 18, 2, 2, PORT);
        flag(P, 27, 0, T.trim, T.main);
        hull(P, 3, 40, 24, 8, T, true); eye(P, 37, 25);
      } else {
        // long thuyen: imperial dragon ship, red and gold, dragon prow and tail, gun row
        mast(P, 20, 3, 28); mast(P, 33, 6, 28); junk(P, 15, 4, 11, 18, DVSAIL, DVSAIL_D); junk(P, 29, 7, 9, 14, DVSAIL, DVSAIL_D);
        r(49, 18, 2, 10, T.trim); r(50, 15, 3, 4, T.trim); r(52, 16, 2, 1, GOLD); r(51, 15, 1, 1, '#1e1a18'); r(49, 14, 2, 1, GOLD);   // dragon head
        r(3, 19, 2, 9, T.trim); r(2, 17, 2, 3, GOLD);                                                                                  // tail
        r(7, 21, 9, 7, WOOD); r(6, 20, 11, 1, GOLD); r(9, 23, 2, 2, PORT); r(13, 23, 2, 2, PORT);
        flag(P, 21, 1, T.trim, GOLD); flag(P, 34, 4, T.trim, GOLD);
        hull(P, 4, 48, 28, 10, { main: T.trim, trim: GOLD }, true); r(6, 30, 40, 1, GOLD);
      }
    } else {
      if (kind === 'fishing') {
        // touk: dugout canoe, a paddler under a krama
        kman(8, 6, '#c0392b', false); r(7, 8, 4, 1, '#c0392b'); r(12, 10, 1, 7, WOOD); r(13, 15, 1, 2, WOOD_D);
        hull(P, 3, 18, 13, 3, T);
      } else if (kind === 'trade') {
        // touk ngo: long war canoe with many paddlers and a carved prow (Bayon naval relief)
        for (const x of [7, 11, 15, 19, 23]) { kman(x, 4, x === 15 ? T.main : '#c0392b', false); r(x + 3, 9, 1, 6, WOOD); r(x + 3, 14, 1, 2, WOOD_D); }
        r(4, 6, 1, 4, WOOD_D); r(3, 6, 3, 1, T.main);
        hull(P, 3, 28, 11, 3, T); r(29, 6, 1, 5, STONE); r(30, 5, 1, 2, STONE); r(28, 5, 2, 1, STONE_D); r(5, 12, 22, 1, STONE);
      } else if (kind === 'light') {
        // river skiff: small canoe, one archer, a small mat sail
        mast(P, 15, 4, 15); r(11, 5, 7, 7, MAT); r(11, 8, 7, 1, MAT_D); r(10, 4, 9, 1, WOOD_D);
        kman(6, 6, T.main, false); r(9, 6, 1, 8, WOOD); r(9, 5, 1, 1, STEEL);
        hull(P, 3, 26, 15, 3, T); prow(P, 27, 9, 7, STONE, STONE_D);
      } else if (kind === 'galley') {
        // bayon galley: long oared galley, warriors under a canopy, carved prow
        r(10, 9, 20, 1, T.main); r(10, 10, 20, 1, T.dark); r(10, 11, 1, 7, WOOD_D); r(29, 11, 1, 7, WOOD_D);
        for (const x of [12, 16, 20, 24]) kman(x, 10, x === 16 ? T.main : '#c0392b', x !== 20);
        hull(P, 3, 34, 18, 5, T); prow(P, 35, 10, 10, STONE, STONE_D); r(5, 19, 28, 1, STONE);
        oars(P, [9, 14, 19, 24, 29], 23, 4);
      } else if (kind === 'frigate') {
        // ballista barge: broad barge with a big double-bow ballista and a mat sail
        mast(P, 12, 3, 24); r(7, 4, 10, 12, MAT); r(7, 8, 10, 1, MAT_D); r(7, 12, 10, 1, MAT_D); r(6, 3, 12, 1, WOOD_D);
        r(22, 21, 14, 3, WOOD); r(22, 21, 14, 1, '#a8773c');
        r(24, 19, 12, 1, WOOD_D); r(34, 14, 1, 5, WOOD); r(34, 20, 1, 3, WOOD); r(31, 16, 1, 2, WOOD); r(31, 20, 1, 2, WOOD); r(26, 19, 10, 1, '#d8d0b0'); r(36, 19, 1, 1, STEEL);
        kman(9, 17, '#c0392b', false); kman(14, 17, T.main, false); kman(24, 14, '#c0392b', false);
        hull(P, 3, 40, 24, 7, T); prow(P, 41, 16, 9, STONE, STONE_D);
      } else {
        // naga barge: royal barge with a five-headed naga prow and a tiered pavilion
        pavilion(P, 20, 20, 14, 7, T.main, T.dark, STONE); r(23, 22, 2, 3, T.dark); r(30, 22, 2, 3, T.dark);
        r(47, 16, 2, 12, STONE); for (const [dx, dy] of [[0, 0], [2, 1], [4, 3], [-2, 1], [-1, 3]]) r(48 + dx, 12 + dy, 2, 2, STONE); r(49, 12, 1, 1, '#1e1a18');   // naga heads
        r(4, 20, 2, 8, STONE); r(3, 18, 2, 3, STONE_D);
        hull(P, 4, 47, 28, 8, T); r(6, 30, 38, 1, STONE);
        oars(P, [10, 15, 20, 25, 30, 35, 40], 36, 5);
      }
    }
  });
}
/* Phrai Ying: a village woman of Ayutthaya. Short hair (as European visitors noted of Siamese
   women), a sabai cloth across the chest, an ankle-length pha sin, a woven basket at the hip. 16x18 */
function womanSprite(anim, f, tool) {
  const tl = anim === 'work' && tool && tool !== 'hand' ? tool : '';
  return sprite('ayw|' + anim + '|' + f + '|' + tl, 16, 18, 2, (P) => {
    const r = P.r, walk = anim === 'walk', work = anim === 'work', atk = anim === 'attack';
    const bob = (walk && (f === 1 || f === 3)) ? -1 : 0, low = work && f === 1 ? 1 : 0;
    const B = (x, y, w, h, c) => r(x, y + 2 + bob, w, h, c);
    const SIN = '#7a3b2e', SIN_L = '#a85a3a', SABAI = '#7b4bb3', SABAI_L = '#a77ad6';
    // bare feet under the hem
    const st = walk ? [[5, 9], [6, 8], [6, 9], [5, 8]][f] : [6, 8];
    r(st[0], 16, 2, 1, SKIN_D); r(st[1], 16, 2, 1, SKIN_D);
    // pha sin: a tube skirt to the ankle, a woven band at the hem
    B(5, 10, 6, 5, SIN); B(5, 14, 6, 1, SIN_L); B(5, 12, 6, 1, SIN_L); B(4, 14, 1, 1, SIN);
    // bare shoulders and arms, the sabai wrapped across the chest, one end over the left shoulder
    B(5, 7, 6, 3, SKIN); B(5, 8, 6, 2, SABAI); B(5, 7, 2, 1, SABAI); B(6, 9, 5, 1, SABAI_L); B(5, 10, 6, 1, GOLD_D);
    B(4, 8, 1, 3 + low, SKIN);
    // with a tool she swings it like the other villagers (axe at a tree, pick at gold, hoe in a field, mallet when building);
    // empty-handed work (berries, fish) keeps the basket
    if (work && tl) {
      if (f === 0) {
        B(11, 6, 1, 3, SKIN); B(12, 2, 1, 7, WOOD);
        if (tl === 'axe') B(12, 1, 3, 2, STEEL); else if (tl === 'pick') B(10, 1, 5, 1, STEEL_D); else if (tl === 'hoe') B(12, 2, 3, 1, STEEL_D); else B(11, 1, 4, 2, STEEL_D);
      } else {
        B(11, 9, 1, 2, SKIN); B(12, 9, 3, 1, WOOD);
        if (tl === 'axe') B(14, 8, 2, 3, STEEL); else if (tl === 'pick') B(14, 7, 1, 5, STEEL_D); else if (tl === 'hoe') B(14, 9, 1, 3, STEEL_D); else B(14, 8, 2, 3, STEEL_D);
      }
    }
    else if (work) { B(11, 9 + low, 1, 3, SKIN); B(10, 12 + low, 3, 2, '#c9a35a'); B(10, 12 + low, 3, 1, '#e0c07a'); }
    else if (atk && f === 1) { B(11, 8, 3, 1, SKIN); B(14, 7, 1, 2, WOOD_D); }
    else { B(11, 8, 1, 3, SKIN); B(11, 10, 3, 3, '#c9a35a'); B(11, 10, 3, 1, '#e0c07a'); B(12, 11, 1, 1, '#9a7838'); }
    // head: short cropped hair, a gold earring
    B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR);
    B(6, 2, 4, 1, HAIR); B(5, 3, 1, 2, HAIR); B(6, 3, 1, 1, HAIR); B(7, 1, 2, 1, HAIR); B(9, 6, 1, 1, GOLD);
  });
}
  /* Ayutthaya economy and army buildings (art thread, 2026-10-25), so none of them fall back to Melaka's art.
     Same helpers and palette as ayBuilding. ayBuildingX(kind, level): barracks | port | granary | store | farm */
  const AYX_DIMS = { barracks: [48, 58], port: [48, 54], granary: [32, 46], store: [32, 46], farm: [32, 32] };
  // rack of spears with red tassels
  function aySpears(P, x, y, n) { for (let i = 0; i < n; i++) { P.r(x + i * 3, y, 1, 10, WOOD_D); P.r(x + i * 3, y - 1, 1, 1, STEEL); P.r(x + i * 3, y + 2, 1, 1, '#b8322a'); } P.r(x - 1, y + 5, n * 3 + 1, 1, AY.TEAK_D); }
  // small purple round shield with a gold boss
  function ayShield(P, cx, cy) { disc(P, cx, cy, 3, AYC.dark); disc(P, cx, cy, 2, AYC.main); P.r(cx, cy, 1, 1, AY.G); P.r(cx - 1, cy - 2, 1, 1, '#9a5fc0'); }
  // Ayutthaya barracks, port, granary, teak store and farm pictures
  function ayBuildingX(kind, level) {
    const d = AYX_DIMS[kind];
    return sprite(`ayx|${kind}|${level || 0}`, d[0], d[1], 2, (P) => {
      const r = P.r, G = AY.G;
      if (kind === 'barracks') {
        // Rong Thahan: a long, low teak drill hall on stilts, wide tiled roof, shields on the walls, spear racks and a war drum out front
        posts(P, [4, 12, 20, 28, 36, 43], 50, 57, 2); r(2, 48, 44, 3, '#8f6232'); r(2, 51, 44, 1, '#5a3a1e');
        ayTeak(P, 5, 34, 38, 14);
        r(16, 37, 16, 11, '#2f1d0e'); r(16, 36, 16, 1, G);                                   // open front
        aySpears(P, 18, 38, 5);
        ayShield(P, 10, 40); ayShield(P, 38, 40);
        ayEave(P, 24, 29, 33, 20, 25, AY.TILE, AY.TILE_D, AY.GRN);
        ayGable(P, 24, 15, 29, 13);
        // klong yao drum on a stand, left; tall spear rack, right
        r(0, 42, 4, 5, '#b8322a'); r(0, 42, 4, 1, '#e6dcc4'); r(0, 46, 4, 1, '#e6dcc4'); r(1, 47, 1, 3, WOOD_D); r(3, 47, 1, 3, WOOD_D);
        ayBanner(P, 40, 6, 28);
      } else if (kind === 'port') {
        // Tha Ruea: teak landing on posts, an open sala with a tiled Thai roof, rope coils and water jars
        r(0, 40, 48, 12, AY.TEAK_L); for (let x = 0; x < 48; x += 4) r(x, 40, 1, 12, AY.TEAK_D); r(0, 40, 48, 1, '#d8a868'); r(0, 51, 48, 1, '#5a3a1e');
        posts(P, [1, 14, 28, 44], 48, 54, 3);
        for (const x of [5, 22]) { r(x, 26, 2, 14, '#6a3a1a'); r(x, 26, 1, 14, '#4a2810'); }
        r(4, 37, 20, 3, AY.TEAK); r(4, 37, 20, 1, AY.TEAK_L);                               // bench
        ayEave(P, 14, 22, 25, 9, 13, AY.TILE, AY.TILE_D, AY.GRN);
        ayGable(P, 14, 6, 22, 9, { emblem: false });
        // jars, rope coil, a stack of crates
        r(27, 34, 4, 6, '#9a5a32'); r(28, 33, 2, 1, '#6e3e20'); r(27, 35, 4, 1, '#b8744a');
        r(32, 35, 4, 5, '#8a4a28'); r(33, 34, 2, 1, '#6e3e20');
        disc(P, 39, 38, 2, '#c9b27a'); r(39, 38, 1, 1, '#9c8450');
        ayBanner(P, 39, 10, 30);
      } else if (kind === 'granary') {
        // Yung Khao: a teak rice barn on tall stilts, walls flaring out toward the eaves, steep roof, ladder
        posts(P, [5, 12, 19, 25], 34, 45, 2);
        r(3, 32, 26, 2, '#8f6232'); r(3, 34, 26, 1, '#5a3a1e');
        for (let y = 20; y < 32; y++) { const w = 10 + Math.round((31 - y) * 0.25); r(16 - w, y, w * 2, 1, (y & 1) ? AY.TEAK : AY.TEAK_L); r(16 - w, y, 1, 1, AY.TEAK_D); r(15 + w, y, 1, 1, AY.TEAK_D); }
        for (let x = 9; x < 24; x += 4) r(x, 20, 1, 12, AY.TEAK_D);
        r(13, 23, 6, 9, AY.DOOR); r(12, 22, 8, 1, G);
        ayRoofTri(P, 16, 3, 20, 15, '#8a4a2e', '#6e3820', '#4a2a18'); r(1, 20, 30, 1, AYC.main);
        r(15, 0, 1, 3, AY.TEAK_D); r(14, 1, 3, 1, AY.TEAK_D);
        for (let y = 36; y < 45; y += 3) r(18, y, 4, 1, WOOD); r(18, 35, 1, 10, WOOD); r(21, 35, 1, 10, WOOD);
        // rice sacks at the foot
        r(4, 40, 5, 5, '#e6dcc4'); r(4, 40, 5, 1, '#fff6e0'); r(6, 39, 1, 1, '#b8ac90'); r(9, 41, 4, 4, '#d6cab0');
      } else if (kind === 'store') {
        // Rong Sinkha: a teak plank godown on low stilts with a tiled roof, a log stack and a gold chest at the door
        posts(P, [3, 27], 38, 44, 2); r(1, 40, 30, 3, '#8f6232'); r(1, 43, 30, 1, '#5a3a1e');
        ayTeak(P, 4, 24, 24, 16); r(3, 24, 1, 16, AY.TEAK_D); r(28, 24, 1, 16, AY.TEAK_D);
        r(12, 29, 8, 11, AY.DOOR); r(11, 28, 10, 1, G); r(15, 29, 1, 11, '#2a190a');
        r(5, 28, 4, 4, '#2b1a0c'); r(5, 27, 4, 1, AYC.main);
        ayEave(P, 16, 21, 23, 13, 16, AY.TILE, AY.TILE_D, AY.GRN);
        ayGable(P, 16, 6, 21, 11, { emblem: false });
        for (let i = 0; i < 3; i++) { r(22, 38 - i * 2, 9, 2, i % 2 ? AY.TEAK_L : AY.TEAK); r(30, 38 - i * 2, 1, 2, '#d8a868'); }
        r(2, 38, 8, 6, '#5e3b1c'); r(2, 37, 8, 2, G); r(4, 36, 3, 1, AY.GL); r(5, 39, 2, 2, '#333');
      } else if (kind === 'farm') {
        // Na: a flooded rice paddy inside earth bunds; the rice grows taller with the field's level
        r(0, 0, 32, 32, '#8a6a3e'); r(2, 2, 28, 28, AY.WATER_D); r(2, 2, 28, 1, AY.WATER);
        r(2, 15, 28, 2, '#8a6a3e'); r(15, 2, 2, 28, '#8a6a3e');                               // bunds
        r(0, 0, 32, 1, '#a8885e'); r(0, 31, 32, 1, '#5e4025');
        const g = level === 2 ? 4 : level === 1 ? 3 : 2;
        for (const [ox, oy] of [[3, 3], [18, 3], [3, 18], [18, 18]])
          for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) {
            const px = ox + x * 3 + (y & 1), py = oy + 2 + y * 4;
            r(px, py - g + 1, 1, g, (x + y) & 1 ? '#6bbf4f' : '#8ed06a'); r(px, py + 1, 1, 1, AY.WATER);
          }
        r(25, 6, 2, 1, AY.WATER_L); r(6, 24, 2, 1, AY.WATER_L);
      }
    });
  }
  const UNIT = { keris: 'dap', tombak: 'spear', archer: 'archer', namai: 'namai', mo: 'mo', chang: 'changsuek', gunner: 'gunner', musket: 'gunner', cannon: 'cannon' };
  // an Ayutthaya unit picture (falls back to the shared art)
  function unit(kind, anim, f, tool) {
    if (kind === 'villager') return womanSprite(anim, anim === 'walk' ? f & 3 : Math.min(1, f), tool);
    const k = UNIT[kind]; if (!k) return null;
    const a = anim === 'work' ? 'idle' : anim;
    return ayUnit(k, a, a === 'walk' ? f & 3 : a === 'attack' ? Math.min(2, f) : 0);
  }
  const BLD = { towncentre: 'towncentre', house: 'house', rafthouse: 'raft', tower: 'tower', palace: 'palace', wat: 'healer' };
  // Ayutthaya building picture (shared entry point)
  function building(kind, level) { return AYX_DIMS[kind] ? ayBuildingX(kind, level) : BLD[kind] ? ayBuilding(BLD[kind]) : null; }
  // Ayutthaya ship picture (shared entry point)
  function ship(slot) { return mainlandShip('ayu', slot); }
  return { unit, building, ship };
})();
