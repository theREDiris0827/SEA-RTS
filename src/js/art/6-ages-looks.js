/* ===== soldiers through the ages (unit-art/ages-all-civs, Iylia 2026-10-25) =====
   One look per age in every mode. Age 1 a plain levy with no gold, age 2 the roster as drawn, age 3 mail (Melaka's
   baju rantai, Majapahit's kere and bronze helmet, Ayutthaya's lacquered leather), age 4 royal-guard gold. Light
   ranged units stay lightly dressed: plain in age 1, gold trim in age 4. Also the archer line's guns and the
   cannon for each civ. Melaka art from lore/scenes/melaka-ages-art.js, guns from lore/scenes/units-extra.js. */
const AGEART = (() => {
/* ---------- Melaka (MELAGE) ---------- */
/* Melaka age progression mockups. Runs in the game page after art.js (and heroes-art.js).
   melAge(kind, age, anim, f): keris / tombak / archer drawn with the game's drawUnit, then
     age 1: plain (no gold, simple headband)   age 2: as in the game today
     age 3: baju rantai (mail shirt)           age 4: mail with gold trim, gold armbands and a taller gold-tipped tengkolok
   melGunner(anim, f): age 3 Penembak (matchlock gunner)     melMeriam(): age 3 capped bronze cannon */
function hexRGB(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function recolor(P, map) {
  const c = P.x.canvas, img = P.x.getImageData(0, 0, c.width, c.height), d = img.data;
  const m = Object.entries(map).map(([a, b]) => [hexRGB(a), hexRGB(b)]);
  for (let i = 0; i < d.length; i += 4) for (const [a, b] of m) if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; }
  P.x.putImageData(img, 0, 0);
}
const MAIL = '#9aa4ae', MAIL_D = '#6e7882';
function melAge(kind, age, anim, f) {
  return sprite(`melage|${kind}|${age}|${anim}|${f}`, 16, 18, 2, (P) => {
    const T = TEAMC[0], bob = (anim === 'walk' && (f === 1 || f === 3)) ? -1 : 0;
    const B = (x, y, w, h, c) => P.r(x, y + 2 + bob, w, h, c);
    drawUnit(P, kind, 0, anim, f);
    if (age === 1) {
      // village levy: no gold thread, plain wooden hilts, a simple headband instead of the tengkolok
      recolor(P, { [GOLD]: T.main, [GOLD_D]: WOOD_D, [CREAM]: '#d8c9a0' });
      if (kind !== 'archer') { P.x.clearRect(3, 0 + bob + 0, 9, 6); B(6, 2, 4, 1, HAIR); B(6, 3, 4, 1, SKIN); B(5, 3, 6, 1, T.dark); B(4, 3, 1, 2, T.dark); }
    }
    if (age >= 3) {
      // baju rantai: a mail shirt over the baju, mail on the sleeves
      for (let y = 7; y < 9; y++) for (let x = 5; x < 11; x++) B(x, y, 1, 1, (x + y) % 2 ? MAIL : MAIL_D);
      B(4, 8, 1, 2, MAIL); if (!(anim === 'attack' && f === 1 && kind === 'keris')) B(11, 8, 1, 2, MAIL);
      B(6, 7, 4, 1, age === 4 ? GOLD : MAIL_D);
    }
    if (age === 4) {
      // royal guard: gold armbands, gold belt, tall gold-tipped peak on the tengkolok
      B(4, 9, 1, 1, GOLD); if (!(anim === 'attack' && f === 1 && kind === 'keris')) B(11, 9, 1, 1, GOLD);
      B(5, 9, 6, 1, GOLD); B(7, 9, 2, 1, '#c0392b');
      if (kind !== 'archer') { B(9, -1, 2, 1, T.main); B(10, -2, 1, 1, GOLD); B(5, 3, 6, 1, GOLD); }
      else { B(5, 3, 6, 1, GOLD); B(3, 4, 1, 3, T.main); }
    }
  });
}
function melGunner(anim, f, elite) {
  return sprite(`melgun|${anim}|${f}|${elite ? 1 : 0}`, 16, 18, 2, (P) => {
    const bob = (anim === 'walk' && (f === 1 || f === 3)) ? -1 : 0, atk = anim === 'attack';
    const B = (x, y, w, h, c) => P.r(x, y + 2 + bob, w, h, c);
    drawUnit(P, 'keris', 0, anim === 'attack' ? 'idle' : anim, f);
    P.x.clearRect(11, 0, 5, 14);                                  // drop the keris
    for (let y = 7; y < 9; y++) for (let x = 5; x < 11; x++) B(x, y, 1, 1, (x + y) % 2 ? MAIL : MAIL_D);
    B(11, 8, 1, 3, MAIL);
    const BR = '#7a5a2a', MET = '#4a4a52';
    if (elite) {
      // musketeer: gold belt and armbands, tall gold-tipped tengkolok, heavier gun on a forked rest
      B(6, 7, 4, 1, GOLD); B(5, 9, 6, 1, GOLD); B(7, 9, 2, 1, '#c0392b'); B(4, 9, 1, 1, GOLD);
      B(9, -1, 2, 1, TEAMC[0].main); B(10, -2, 1, 1, GOLD); B(5, 3, 6, 1, GOLD);
      if (!atk) { B(12, -3, 1, 12, MET); B(12, 8, 1, 3, BR); B(13, 6, 1, 1, '#c0392b'); B(14, 2, 1, 11, WOOD_D); B(13, 1, 1, 1, WOOD_D); B(15, 1, 1, 1, WOOD_D); }
      else { B(5, 7, 11, 1, MET); B(5, 6, 1, 1, '#6a6a74'); B(4, 7, 2, 2, BR); B(8, 8, 1, 1, '#c0392b'); B(13, 8, 1, 5, WOOD_D);
        if (f === 1) { P.r(15, 6 + 2 + bob, 1, 3, '#f6d04a'); B(13, 4, 2, 1, '#c8c8c8'); B(14, 3, 2, 1, '#e0e0e0'); B(12, 5, 1, 1, '#c8c8c8'); } }
      return;
    }
    if (!atk) { B(12, -1, 1, 10, MET); B(12, 8, 1, 3, BR); B(13, 6, 1, 1, '#c0392b'); }   // matchlock shouldered, slow-match glowing
    else { B(6, 8, 9, 1, MET); B(6, 7, 1, 1, '#6a6a74'); B(5, 8, 2, 2, BR); B(9, 9, 1, 1, '#c0392b');
      if (f === 1) { B(15, 7, 1, 3, '#f6d04a'); B(15, 8, 1, 1, '#fff3a0'); B(13, 5, 2, 1, '#c8c8c8'); B(14, 4, 2, 1, '#e0e0e0'); } }
  });
}
function melMeriam() {
  return sprite('melmeriam', 26, 18, 2, (P) => {
    const r = P.r, BZ = '#b8862c', BZ_L = '#e0b04a', BZ_D = '#7a5418';
    r(3, 11, 18, 3, WOOD); r(3, 13, 18, 1, WOOD_D); r(1, 13, 3, 2, WOOD_D);                 // carriage and trail
    disc(P, 8, 14, 3, '#3a2a1a'); disc(P, 8, 14, 1, WOOD); disc(P, 17, 14, 3, '#3a2a1a'); disc(P, 17, 14, 1, WOOD);
    r(6, 7, 17, 4, BZ); r(6, 7, 17, 1, BZ_L); r(6, 10, 17, 1, BZ_D);                        // bronze barrel
    r(5, 6, 2, 6, BZ_D); r(22, 6, 2, 6, BZ); r(23, 7, 1, 4, '#2a1a10');                     // breech ring and muzzle
    for (const x of [10, 14, 18]) r(x, 7, 1, 4, BZ_D);                                        // reinforcing rings
    r(12, 5, 3, 2, BZ_L); r(13, 4, 1, 1, BZ);                                               // ornamental handle (like a lela's)
    r(1, 2, 1, 9, WOOD_D); r(2, 2, 4, 3, TEAMC[0].main); r(3, 3, 2, 1, GOLD);                // team pennant
  });
}


/* ---------- extra units (XU) ---------- */
const XU = (() => {
/* Extra unit sprites in the game's style. Runs in the game page after art.js (uses sprite, drawUnit, disc,
   TEAMC, palette constants, GOLD/GOLD_D).
   xUnit(kind, anim, f): anim 'idle' (f 0) or 'attack' (f 0, 1, 2). Returns a sprite canvas (scale 2).
     penyumpit  (Melaka, 16x18)    blowpipe warrior
     lembing    (Majapahit, 16x18) javelin thrower
     mjgunner   (Majapahit, 16x18) age-3 bedil gunner
     cetbang    (Majapahit, 26x18) bronze cetbang on a wooden stand
     dvcannon   (Đại Việt, 26x18)  bronze cannon on a lacquered carriage */
const XU_DV = { main: '#e0aa22', dark: '#9a6a10', trim: '#7a2418', light: '#f4cc5a' };
const XU_BAMBOO = '#c9b468', XU_BAMBOO_D = '#8a7a3a', XU_PIPE = '#6a4a22', XU_PIPE_L = '#8e6a34';
const XU_GUN = '#4a4a52', XU_GUN_L = '#6a6a74', XU_STOCK = '#7a5a2a', XU_MATCH = '#c0392b';
const XU_FLASH = '#f6d04a', XU_FLASH_W = '#fff3a0', XU_FIRE = '#e2562c', XU_SMOKE = '#c8c8c8', XU_SMOKE_L = '#e0e0e0', XU_SMOKE_D = '#9a9a9a';
const XU_LACQ = '#2a2420', XU_LACQ_L = '#3d342d';

function xuFlash(r, x, y) {       // muzzle flash pointing right, x = first pixel past the muzzle, y = bore centre
  r(x, y - 1, 1, 3, XU_FIRE); r(x + 1, y - 2, 1, 5, XU_FLASH); r(x, y, 2, 1, XU_FLASH_W); r(x + 2, y - 1, 1, 3, XU_FLASH); r(x + 2, y, 1, 1, XU_FLASH_W);
}
function xuSmoke(r, x, y, late) {  // a few puffs drifting up from (x, y)
  if (!late) { r(x, y - 3, 2, 2, XU_SMOKE); r(x + 1, y - 5, 2, 2, XU_SMOKE_L); r(x - 2, y - 4, 2, 1, XU_SMOKE); }
  else { r(x - 1, y - 5, 3, 2, XU_SMOKE_D); r(x + 1, y - 7, 2, 2, XU_SMOKE); r(x - 3, y - 6, 2, 1, XU_SMOKE_D); }
}

function xUnit(kind, anim, f) {
  anim = anim === 'attack' ? 'attack' : 'idle'; f = anim === 'attack' ? (f | 0) : 0;
  const atk = anim === 'attack', big = kind === 'cetbang' || kind === 'dvcannon';
  return sprite(`xu|${kind}|${anim}|${f}`, big ? 26 : 16, 18, 2, (P) => {
    const r = P.r, B = (x, y, w, h, c) => r(x, y + 2, w, h, c), S = B;
    if (kind === 'penyumpit') {
      const T = TEAMC[0];
      drawUnit(P, 'keris', 0, 'idle', 0);
      P.x.clearRect(11, 0, 5, 14);                                  // drop the keris
      P.x.clearRect(3, 0, 9, 6);                                    // drop the tengkolok
      B(6, 3, 4, 1, SKIN); B(6, 2, 4, 1, HAIR);
      // light clothing: bare shoulders, a pale sash over a green sarong
      B(5, 7, 6, 2, SKIN); B(5, 8, 6, 1, SKIN_D); B(6, 7, 1, 1, '#e9dcb4'); B(7, 8, 1, 1, '#e9dcb4');
      B(5, 9, 6, 3, T.main); B(5, 9, 6, 1, T.dark); B(7, 10, 1, 2, T.dark); B(10, 11, 1, 1, T.dark);
      B(4, 8, 1, 3, SKIN);
      // simple green headcloth knotted at the back
      B(6, 2, 4, 1, T.main); B(5, 3, 5, 1, T.main); B(6, 3, 1, 1, T.dark); B(4, 3, 1, 1, T.dark); B(3, 4, 1, 2, T.dark);
      // bamboo dart quiver at the hip
      B(3, 9, 2, 4, XU_BAMBOO); B(3, 10, 2, 1, XU_BAMBOO_D); B(3, 12, 2, 1, XU_BAMBOO_D); B(3, 8, 1, 1, '#f4ecd4'); B(4, 8, 1, 1, WOOD_D);
      if (!atk || f === 2) {
        // sumpit held upright, 13 px, with a spear-blade tip lashed on
        B(11, 8, 1, 3, SKIN);
        S(12, -2, 1, 14, XU_PIPE); S(12, -2, 1, 1, STEEL); S(12, 3, 1, 1, XU_PIPE_L); S(12, 8, 1, 1, SKIN);
        if (atk) S(13, -2, 1, 1, XU_PIPE_L);
      } else {
        // pipe at the lips, aimed level, both hands on it
        B(10, 6, 6, 1, XU_PIPE); B(10, 5, 1, 1, XU_PIPE_L); B(14, 6, 1, 1, XU_PIPE_L);
        B(11, 7, 1, 1, SKIN); B(12, 6, 1, 1, SKIN); B(11, 8, 1, 2, SKIN);
        if (f === 1) { B(9, 6, 1, 1, SKIN_D); B(15, 5, 1, 1, '#f4ecd4'); B(14, 5, 1, 1, '#e05a4a'); }   // cheek puff, dart leaving
      }
    } else if (kind === 'lembing') {
      const T = TEAMC[1];
      drawUnit(P, 'keris', 1, 'idle', 0);
      P.x.clearRect(11, 0, 5, 14);
      // two spare javelins in the off hand
      S(2, -1, 1, 15, WOOD); S(2, -2, 1, 1, STEEL); S(3, 0, 1, 14, WOOD_D); S(3, -1, 1, 1, STEEL);
      B(2, 9, 3, 1, SKIN); B(4, 8, 1, 1, GOLD);
      if (!atk) {
        B(11, 8, 1, 3, SKIN); B(11, 8, 1, 1, GOLD);
        S(12, 0, 1, 14, WOOD); S(12, -1, 1, 2, STEEL); S(12, 9, 1, 1, SKIN);
      } else if (f === 0) {
        // arm cocked back overhead, javelin level above the head
        B(11, 3, 1, 5, SKIN); B(11, 7, 1, 1, GOLD); B(11, 8, 1, 1, SKIN);
        B(5, 1, 9, 1, WOOD); B(14, 1, 2, 1, STEEL); B(5, 0, 1, 1, T.main);
        B(11, 1, 1, 1, SKIN);
      } else if (f === 1) {
        // released: arm thrown forward, javelin leaving the frame
        B(11, 7, 1, 1, GOLD); B(11, 6, 1, 1, SKIN); B(12, 5, 1, 1, SKIN); B(13, 4, 1, 1, SKIN);
        B(13, 3, 2, 1, WOOD); B(15, 3, 1, 1, STEEL); B(12, 2, 1, 1, '#f3ead0'); B(11, 1, 1, 1, '#f3ead0');
      } else {
        // follow-through: arm down and forward
        B(11, 8, 1, 1, GOLD); B(12, 9, 2, 1, SKIN); B(11, 8, 1, 2, SKIN);
      }
    } else if (kind === 'mjgunner') {
      const T = TEAMC[1];
      drawUnit(P, 'keris', 1, 'idle', 0);
      P.x.clearRect(11, 0, 5, 14);
      // red padded baju with gold collar and a crossing powder belt; kain stays below
      B(5, 7, 6, 3, T.main); B(5, 9, 6, 1, T.dark); B(6, 7, 4, 1, GOLD); B(7, 8, 2, 1, GOLD_D);
      B(5, 8, 1, 1, '#5a3a1e'); B(10, 9, 1, 1, '#5a3a1e');
      B(4, 8, 1, 2, T.main); B(4, 10, 1, 1, SKIN);
      B(3, 11, 2, 2, '#6a4a2a'); B(3, 11, 2, 1, GOLD_D);               // powder horn at the hip
      B(5, 2, 6, 1, T.dark);                                           // red iket band under the diadem
      if (!atk || f === 2) {
        B(11, 8, 1, 2, T.main); B(11, 10, 1, 1, SKIN);
        B(12, -1, 1, 10, XU_GUN); B(12, -1, 1, 1, XU_GUN_L); B(12, 8, 1, 3, XU_STOCK); B(13, 6, 1, 1, XU_MATCH);
        if (atk) { B(13, -3, 2, 2, XU_SMOKE_D); B(11, -4, 2, 1, XU_SMOKE); }
      } else {
        B(11, 8, 1, 1, T.main);
        B(6, 8, 9, 1, XU_GUN); B(6, 7, 1, 1, XU_GUN_L); B(5, 8, 2, 2, XU_STOCK); B(9, 9, 1, 1, XU_MATCH); B(11, 9, 1, 1, SKIN);
        if (f === 1) { B(15, 7, 1, 3, XU_FLASH); B(15, 8, 1, 1, XU_FLASH_W); B(13, 5, 2, 1, XU_SMOKE); B(14, 4, 2, 1, XU_SMOKE_L); }
        else B(10, 7, 1, 1, '#ffb040');                                // match touching the pan
      }
    } else if (kind === 'cetbang') {
      const T = TEAMC[1], BZ = '#b07a30', BZ_L = '#dca452', BZ_D = '#6e4618';
      // low wooden stand: sill beam on two feet, a forked post carrying the trunnions
      r(4, 14, 18, 2, WOOD); r(4, 15, 18, 1, WOOD_D); r(5, 16, 2, 2, WOOD_D); r(19, 16, 2, 2, WOOD_D);
      r(11, 10, 3, 4, WOOD); r(11, 10, 1, 4, WOOD_D); r(10, 13, 5, 1, WOOD_D);
      // tiller at the breech
      r(2, 10, 3, 1, WOOD); r(1, 11, 2, 1, WOOD); r(0, 12, 1, 1, WOOD_D);
      // slim bronze barrel with a flared mouth and rings
      r(5, 7, 15, 3, BZ); r(5, 7, 15, 1, BZ_L); r(5, 9, 15, 1, BZ_D);
      r(4, 7, 2, 3, BZ_D); r(3, 8, 1, 1, BZ_D);
      for (const x of [8, 15, 18]) r(x, 7, 1, 3, BZ_D);
      r(20, 6, 3, 5, BZ); r(20, 6, 3, 1, BZ_L); r(20, 10, 3, 1, BZ_D); r(22, 7, 1, 3, '#2a1a10');
      r(11, 7, 3, 1, GOLD); r(12, 6, 1, 1, GOLD);                     // gilt Surya boss on the trunnion
      // red Majapahit pennant (with a white stripe) on a pole behind the breech
      r(2, 1, 1, 9, WOOD_D); r(3, 1, 5, 2, T.main); r(3, 3, 4, 1, '#f3ead0'); r(3, 4, 3, 1, T.main); r(8, 1, 1, 1, T.main);
      if (atk && f === 0) { r(5, 5, 1, 2, '#ffb040'); r(5, 4, 1, 1, XU_FLASH_W); }
      if (atk && f === 1) { xuFlash(r, 23, 8); xuSmoke(r, 22, 6, false); r(5, 6, 1, 1, XU_SMOKE); }
      if (atk && f === 2) xuSmoke(r, 22, 6, true);
    } else if (kind === 'dvcannon') {
      const BZ = '#a8803a', BZ_L = '#d4ac5a', BZ_D = '#6a4c1c';
      // dark lacquered box carriage with red trim on two spoked wheels, trail to the ground
      r(4, 11, 16, 3, XU_LACQ); r(4, 11, 16, 1, XU_LACQ_L); r(4, 13, 16, 1, XU_DV.trim);
      r(1, 13, 4, 2, XU_LACQ); r(0, 14, 2, 1, XU_LACQ_L);
      for (const cx of [8, 16]) { disc(P, cx, 14, 3, '#3a2a1a'); disc(P, cx, 14, 2, WOOD); disc(P, cx, 14, 1, '#3a2a1a'); r(cx, 14, 1, 1, XU_DV.main); }
      // bronze barrel: thick stepped breech, hoops, tapering to a lipped muzzle
      r(5, 6, 6, 5, BZ); r(5, 6, 6, 1, BZ_L); r(5, 10, 6, 1, BZ_D);
      r(11, 7, 9, 3, BZ); r(11, 7, 9, 1, BZ_L); r(11, 9, 9, 1, BZ_D);
      r(4, 7, 1, 3, BZ_D); r(3, 8, 1, 1, BZ_D);
      for (const x of [7, 10, 14, 17]) r(x, x < 11 ? 6 : 7, 1, x < 11 ? 5 : 3, BZ_D);
      r(20, 6, 2, 5, BZ); r(20, 6, 2, 1, BZ_L); r(21, 7, 1, 3, '#2a1a10');
      r(12, 7, 2, 1, XU_DV.trim);                                     // red cord at the trunnion
      // yellow pennant with a red border and tail
      r(2, 0, 1, 11, WOOD_D); r(3, 0, 5, 4, XU_DV.main); r(3, 0, 5, 1, XU_DV.trim); r(3, 3, 5, 1, XU_DV.trim); r(8, 1, 1, 2, XU_DV.trim);
      r(4, 1, 1, 2, XU_DV.light); r(6, 2, 1, 1, XU_DV.dark);
      if (atk && f === 0) { r(5, 4, 1, 2, '#ffb040'); r(5, 3, 1, 1, XU_FLASH_W); }
      if (atk && f === 1) { xuFlash(r, 22, 8); xuSmoke(r, 21, 6, false); r(5, 5, 1, 1, XU_SMOKE); }
      if (atk && f === 2) xuSmoke(r, 21, 6, true);
    }
  });
}

return { xUnit };
})();
/* ---------- Majapahit: the game's Majapahit drawing, a kere (mail coat) from age 2, a bronze helmet in age 3 ---------- */
function mpAge(kind, age, anim, f) {
  return sprite(`mpage|${kind}|${age}|${anim}|${f}`, 16, 18, 2, (P) => {
    const T = TEAMC[1], bob = (anim === 'walk' && (f === 1 || f === 3)) ? -1 : 0;
    const B = (x, y, w, h, c) => P.r(x, y + 2 + bob, w, h, c);
    drawUnit(P, kind, 1, anim, f);
    if (age === 1) recolor(P, { [GOLD]: T.main, [GOLD_D]: WOOD_D, [CREAM]: '#d8c9a0' });
    if (age >= 2) {
      for (let y = 7; y < 9; y++) for (let x = 5; x < 11; x++) B(x, y, 1, 1, (x + y) % 2 ? MAIL : MAIL_D);
      B(4, 8, 1, 2, MAIL); if (!(anim === 'attack' && f === 1 && kind === 'keris')) B(11, 8, 1, 2, MAIL);
      B(6, 7, 4, 1, age === 4 ? GOLD : MAIL_D);
    }
    if (age === 3) helmet(P, bob);
    if (age === 4) {
      B(4, 9, 1, 1, GOLD); if (!(anim === 'attack' && f === 1 && kind === 'keris')) B(11, 9, 1, 1, GOLD);
      B(5, 9, 6, 1, GOLD); B(7, 9, 2, 1, T.main);
    }
  });
}
function helmet(P, bob) {
  const BZ = '#b8862c', BZL = '#e0b04a', BZD = '#7a5418', y = bob || 0;
  P.r(6, 3 + y, 4, 1, BZ); P.r(5, 4 + y, 6, 1, BZD); P.r(7, 3 + y, 2, 1, BZL); P.r(7, 2 + y, 2, 1, BZ); P.r(8, 1 + y, 1, 1, '#c0392b');
}
// the Bedil Kraton (Golden Age): the bedil gunner in a kere with a gold belt
function mpMusket(anim, f) {
  const a = anim === 'attack' ? 'attack' : 'idle', ff = a === 'attack' ? Math.min(2, f) : 0, base = XU.xUnit('mjgunner', a, ff);
  return sprite('mpmusket|' + a + '|' + ff, base.width / 2, base.height / 2, 2, (P) => {
    P.x.drawImage(base, 0, 0, base.width / 2, base.height / 2);
    const B = (x, y, w, h, c) => P.r(x, y + 2, w, h, c);
    for (let y = 7; y < 9; y++) for (let x = 5; x < 11; x++) B(x, y, 1, 1, (x + y) % 2 ? MAIL : MAIL_D);
    B(6, 7, 4, 1, GOLD); B(5, 9, 6, 1, GOLD); B(7, 9, 2, 1, TEAMC[1].main);
  }, false);
}
/* ---------- light ranged units: levy cloth in age 1, a gold sash and band in age 4, never mail ---------- */
function lightAge(kind, civ, age, anim, f) {
  return sprite(`ltage|${kind}|${civ}|${age}|${anim}|${f}`, 16, 18, 2, (P) => {
    const T = TEAMC[civ], bob = (anim === 'walk' && (f === 1 || f === 3)) ? -1 : 0;
    drawUnit(P, kind, civ, anim, f);
    if (age === 1) recolor(P, { [GOLD]: T.main, [GOLD_D]: WOOD_D, [CREAM]: '#d8c9a0' });
    if (age >= 4) { P.r(5, 11 + bob, 6, 1, GOLD); P.r(5, 5 + bob, 6, 1, GOLD); }
  });
}
/* ---------- Ayutthaya: copies of the AYART roster, recoloured and dressed by age ---------- */
const AYC = {}, AY_LEVY_MAP = { '#7b4bb3': '#8a6b4a', '#9b6fd0': '#a8885e', '#4e2d78': '#5e4630', '#3a1f5c': '#4a3424', [GOLD]: '#a8885e', [GOLD_D]: '#5e3b1c' };
function canvasRecolor(src, map) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.drawImage(src, 0, 0);
  if (!map) return c;
  const img = x.getImageData(0, 0, c.width, c.height), d = img.data, m = Object.entries(map).map(([a, b]) => [hexRGB(a), hexRGB(b)]);
  for (let i = 0; i < d.length; i += 4) for (const [a, b] of m) if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; }
  x.putImageData(img, 0, 0); return c;
}
function ayAge(kind, age, anim, f) {
  const key = kind + '|' + age + '|' + anim + '|' + f; if (AYC[key]) return AYC[key];
  const base = AYART.unit(kind, anim, f); if (!base) return null;
  const c = canvasRecolor(base, age === 1 ? AY_LEVY_MAP : null), x = c.getContext('2d');
  const reach = anim === 'attack' && f === 1 && kind === 'keris';
  const B = (lx, ly, w, h, col) => { x.fillStyle = col; x.fillRect(lx * 2, (ly + 2) * 2, w * 2, h * 2); };
  const soldier = kind === 'keris' || kind === 'tombak' || kind === 'gunner' || kind === 'musket';
  if (age >= 3 && soldier) {
    const L = '#5a3a22', LL = '#7a5232';
    for (let y = 7; y < 10; y++) for (let xx = 5; xx < 11; xx++) B(xx, y, 1, 1, y === 8 ? LL : L);   // lacquered leather plates
    B(5, 7, 1, 1, GOLD); B(10, 7, 1, 1, GOLD); B(7, 9, 2, 1, GOLD); B(4, 7, 1, 2, L); if (!reach) B(11, 7, 1, 2, L);
    if (age >= 4) { B(6, 7, 4, 1, GOLD); B(5, 9, 6, 1, GOLD); B(7, 9, 2, 1, '#b8322a'); B(4, 9, 1, 1, GOLD); if (!reach) B(11, 9, 1, 1, GOLD); B(7, -1, 2, 1, GOLD); B(8, -2, 1, 1, '#fff3a0'); }
  }
  if (age >= 4 && (kind === 'namai' || kind === 'archer')) { B(5, 9, 6, 1, GOLD); B(5, 3, 6, 1, GOLD); }
  return (AYC[key] = c);
}
/* ---------- the look for a unit of this civ in this age, or null for the plain roster ---------- */
const CORE = { keris: 1, tombak: 1, archer: 1 }, LIGHT = { sumpit: 1, lembing: 1, namai: 1 };
function unit(kind, civ, age, anim, f) {
  age = Math.max(1, Math.min(4, age || 2));
  const a = anim === 'work' ? 'idle' : anim, ff = a === 'walk' ? f & 3 : Math.min(2, f);
  if (civ === AYU_CIV) {
    if (CORE[kind] || LIGHT[kind] || kind === 'gunner' || kind === 'musket') return age === 2 && kind !== 'musket' && kind !== 'gunner' ? null : ayAge(kind, kind === 'musket' ? 4 : kind === 'gunner' ? Math.max(3, age) : age, a, ff);
    return null;
  }
  if (kind === 'cannon') return civ === 1 ? XU.xUnit('cetbang', a === 'attack' ? 'attack' : 'idle', a === 'attack' ? ff : 0) : melMeriam();
  if (civ === 1) {
    if (kind === 'musket') return mpMusket(a, ff);
    if (kind === 'kerearcher') return mpAge('archer', 3, a, ff);
    if (CORE[kind]) return mpAge(kind, age, a, ff);
  } else if (civ === 0) {
    if (kind === 'gunner' || kind === 'musket') return melGunner(a, ff, kind === 'musket');
    if (CORE[kind]) return age === 2 ? null : melAge(kind, age, a, ff);
  }
  if (LIGHT[kind] && (age === 1 || age >= 4)) return lightAge(kind, civ, age, a, ff);
  return null;
}
return { unit };
})();
const CIVB_KIND = { granary: ['jelapang', 'lumbung'], tower: ['menara', 'kulkul'], palace: ['istana', 'kraton'], tradepost: ['pangkalan', 'bandar'] };
/* where each ship sprite sits on the water: [hull centre x, waterline y] in sprite pixels (Majapahit fire ship differs) */
const SHIP_ANCHOR = { trade: [35, 50], fire: [22, 40], light: [30, 40], galley: [37, 48], frigate: [43, 64], flagship: [53, 76] };
function shipSprite(u) { const tm = CV(u.team); if (tm === AYU_CIV && u.kind !== 'raft') return AYART.ship(u.kind === 'boat' ? 'fishing' : UD[u.kind].slot); return u.kind === 'boat' ? boatSprite(tm) : u.kind === 'raft' ? raftSprite(tm) : NAVAL.navalSprite(u.kind === 'trade' && tm === 1 ? 'jong' : UD[u.kind].slot, tm); }
/* rakit api: a bamboo raft heaped with dry fronds and husks, already alight */
function raftSprite(team) {
  const T = TEAMC[team] || TEAMC[0];
  return sprite('raft|' + team, 18, 14, 2, (P) => {
    const r = P.r;
    for (let i = 0; i < 3; i++) { r(1, 9 + i * 1, 16, 1, i % 2 ? '#a08040' : '#c9a85a'); }
    r(1, 12, 16, 1, '#7a6030'); r(4, 9, 1, 4, '#5e3b1c'); r(13, 9, 1, 4, '#5e3b1c');
    r(4, 7, 10, 2, '#7a5a2a'); r(5, 6, 8, 1, '#5e3b1c'); r(6, 5, 2, 1, '#8a6a32'); r(10, 5, 2, 1, '#8a6a32');
    r(6, 2, 2, 4, '#e8522f'); r(9, 1, 2, 5, '#f2a23a'); r(11, 3, 2, 3, '#e8522f'); r(9, 3, 1, 2, '#ffe27a'); r(7, 4, 1, 1, '#ffe27a');
    r(15, 4, 1, 5, WOOD_D); r(16, 4, 2, 2, T.main);
  });
}
function shipAnchor(kind, team) { if (kind === 'boat' && CV(team) === AYU_CIV) return [24, 36]; return kind === 'boat' ? [20, 34] : kind === 'raft' ? [18, 22] : kind === 'fireship' ? SHIP_ANCHOR.fire : SHIP_ANCHOR[UD[kind].slot]; }

