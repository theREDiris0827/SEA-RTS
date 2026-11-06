/* ===== ay-art.js ===== */
/* Ayutthaya royal purple for the player, Khmer blue for Angkor (lore: team colours, 2026-10-22) */
Object.assign(TEAMC[0], { name: 'Ayutthaya', main: '#7b4bb3', dark: '#4e2d78', trim: '#f2c94c', roofA: '#b5523a', roofB: '#8e3d2a', roofR: '#3a1e14', ring: '#c9a3ff' });
Object.assign(TEAMC[1], { name: 'Khmer', main: '#2f6fd0', dark: '#1c4590', trim: '#f2c94c', roofA: '#a8573a', roofB: '#86432c', roofR: '#2a1810', ring: '#8ab8ff' });
// the unit mockups were drawn before the colours were settled: swap them before any sprite is made
Object.assign(MAIN.CIVC.ayu, { main: '#7b4bb3', dark: '#4e2d78', ring: '#c9a3ff' });
MINIC[0] = ['#a77ad6', '#d8c0ff']; MINIC[1] = ['#2f6fd0', '#8ab8ff'];   // minimap: Ayutthaya purple, Khmer blue
Object.assign(MAIN.KHC, { main: '#2f6fd0', dark: '#1c4590', ring: '#8ab8ff' });

/* ---------- people ---------- */
function unitSprite(kind, team, anim, f, tool) {
  const d = UD[kind], a = anim === 'work' ? 'idle' : anim, ff = anim === 'walk' ? f : Math.min(2, f);
  if (d && d.ayu === 'villager') return ayWomanSprite(anim, anim === 'walk' ? f : Math.min(2, f));
  if (d && d.ayu === 'sword') return AYN.ayUnit('dap', a, a === 'idle' ? 0 : ff);   // Daab Song Mue: the roster's two-dap swordsman
  if (d && d.ayu) return MAIN.civUnitSprite('ayu', d.ayu, a, ff);
  if (d && d.km) return MAIN.khmerUnitSprite(d.km, a, ff);
  if (d && d.healer != null) return HEAL.healerSprite(d.healer, anim === 'attack' ? 'heal' : anim === 'walk' ? 'walk' : 'idle', anim === 'walk' ? f : Math.min(2, f));
  if (d && d.big === 'chang') return MAIN.elephantSprite(a === 'attack' ? 'attack' : a, Math.min(a === 'walk' ? 3 : 1, f));
  if (d && d.big === 'king') return kingSprite(a, a === 'walk' ? f : Math.min(1, f));
  if (d && d.big === 'kbal') return MAIN.ballistaElephantSprite(a, a === 'walk' ? f : Math.min(1, f));
  if (d && d.big === 'kcart') return cartBallistaSprite(a, a === 'walk' ? f : Math.min(1, f));
  return baseUnitSprite(kind, team, anim, f, tool);
}
/* Phrai Ying: a village woman of Ayutthaya. Short hair (as European visitors noted of Siamese
   women), a sabai cloth across the chest, an ankle-length pha sin, a woven basket at the hip. 16x18 */
function ayWomanSprite(anim, f) {
  return sprite('ayw|' + anim + '|' + f, 16, 18, 2, (P) => {
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
    if (work) { B(11, 9 + low, 1, 3, SKIN); B(10, 12 + low, 3, 2, '#c9a35a'); B(10, 12 + low, 3, 1, '#e0c07a'); }
    else if (atk && f === 1) { B(11, 8, 3, 1, SKIN); B(14, 7, 1, 2, WOOD_D); }
    else { B(11, 8, 1, 3, SKIN); B(11, 10, 3, 3, '#c9a35a'); B(11, 10, 3, 1, '#e0c07a'); B(12, 11, 1, 1, '#9a7838'); }
    // head: short cropped hair, a gold earring
    B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR);
    B(6, 2, 4, 1, HAIR); B(5, 3, 1, 2, HAIR); B(6, 3, 1, 1, HAIR); B(7, 1, 2, 1, HAIR); B(9, 6, 1, 1, GOLD);
  });
}
/* the king on his royal elephant, under the white tiered umbrella of a Thai king */
function kingSprite(anim, f) {
  return sprite('ayking|' + anim + '|' + f, 28, 33, 2, (P) => {
    const el = MAIN.elephantSprite(anim, f);
    P.x.drawImage(el, 0, 7, el.width / 2, el.height / 2);
    const r = P.r, WH = '#f6f2e6', WD = '#cfc8b4';
    r(13, 1, 1, 13, GOLD_D);                                                   // the umbrella's staff
    for (let i = 0; i < 3; i++) { const w = 11 - i * 3, y = 6 - i * 2; r(13 - (w >> 1), y, w, 2, WH); r(13 - (w >> 1), y + 1, w, 1, WD); r(13 - (w >> 1), y + 1, 1, 1, GOLD); r(13 + (w >> 1) - (w & 1 ? 0 : 1), y + 1, 1, 1, GOLD); }
    r(13, 0, 1, 1, GOLD);
    r(12, 11, 3, 2, GOLD); r(12, 10, 3, 1, '#7b4bb3');                       // the king in the howdah, gold crown
  });
}
/* Cart Ballista: the wheeled double-bow crossbow of the Bayon reliefs, two Khmer crew */
function cartBallistaSprite(anim, f) {
  return sprite('kcart|' + anim + '|' + f, 30, 20, 2, (P) => {
    const r = P.r, walk = anim === 'walk', fire = anim === 'attack';
    const C = MAIN.KHC, K = '#2f6fd0';
    // crew behind
    for (const [x, ph] of [[2, 0], [7, 1]]) {
      const bob = walk && ((f + ph) & 1) ? -1 : 0;
      r(x + 1, 15, 1, 4, SKIN_D); r(x + 3, 15, 1, 4, SKIN_D);
      r(x, 9 + bob, 5, 6, SKIN); r(x, 12 + bob, 5, 3, K); r(x + 1, 5 + bob, 3, 4, SKIN); r(x + 1, 4 + bob, 3, 1, HAIR); r(x + 2, 2 + bob, 1, 2, HAIR);
    }
    // cart bed and wheels
    r(9, 12, 18, 3, WOOD); r(9, 12, 18, 1, '#a8773c'); r(10, 14, 16, 1, K);
    for (const cx of [12, 23]) { disc(P, cx, 16, 3, WOOD_D); disc(P, cx, 16, 2, WOOD); r(cx, 16, 1, 1, GOLD_D); if (walk) r(cx + ((f & 1) ? 1 : -1), 14, 1, 1, WOOD_D); }
    // stock and the two bows
    r(12, 9, 15, 2, WOOD_D); r(12, 9, 15, 1, '#8a5a2b');
    r(25, 3, 1, 6, WOOD); r(25, 11, 1, 1, WOOD); r(26, 2, 1, 1, WOOD); r(21, 5, 1, 4, WOOD); r(22, 4, 1, 1, WOOD);
    if (!(fire && f === 1)) { r(14, 8, 13, 1, '#d8d0b0'); r(27, 8, 1, 1, STEEL); r(24, 3, 1, 5, '#d8d0b0'); }
    else { r(24, 4, 1, 4, '#d8d0b0'); r(27, 7, 3, 1, '#d8d0b0'); }
    r(15, 7, 3, 2, C.dark); r(15, 7, 3, 1, '#cfc6b0');
  });
}

/* ---------- ships ---------- */
function shipSprite(u) {
  if (u.kind === 'boat') return MAIN.mainlandShip('ayu', 'fishing');
  if (u.kind === 'light' && u.team === 0) return MAIN.mainlandShip('ayu', 'light');
  if (u.kind === 'k_canoe') return MAIN.khmerCanoeSprite();
  return baseShipSprite(u);
}
function shipAnchor(kind, team) {
  const spr = kind === 'boat' ? MAIN.mainlandShip('ayu', 'fishing') : kind === 'light' ? MAIN.mainlandShip('ayu', 'light') : kind === 'k_canoe' ? MAIN.khmerCanoeSprite() : null;
  return spr ? [spr.width >> 1, Math.round(spr.height * 0.82)] : baseShipAnchor(kind, team);
}

/* ---------- buildings ---------- */
const AY_BLD = { towncentre: 'towncentre', house: 'house', raft: 'raft', tower: 'tower', wat: 'healer' };
const KM_BLD = { ktower: 'tower', kpalace: 'towncentre', bayon: 'palace', karogya: 'healer', khouse: 'house' };
function buildingSprite(kind, team, level) {
  if (kind === 'wall') return palisadeSprite(level || 0);
  if (kind === 'gate') return palisadeGateSprite(level || 0);
  if (kind === 'kwall') return lateriteWallSprite(level || 0);
  if (kind === 'kgate') return faceGateSprite(level || 0);
  if (kind === 'phaniat') return kraalSprite();
  if (kind === 'rong') return AYB.ayBuildingX('store', 0);   // teak storehouse
  if (kind === 'kbarracks') return baseBuildingSprite('barracks', 1, level);
  if (kind === 'kgranary') return baseBuildingSprite('granary', 1, level);
  if (team === 0 && AY_BLD[kind]) return AYB.ayBuilding(AY_BLD[kind]);
  if (team === 0 && AYB.AYX_DIMS[kind]) return AYB.ayBuildingX(kind, level);   // Ayutthaya's own barracks, port, granary, farm, mill
  if (KM_BLD[kind]) return KMB.kmBuilding(KM_BLD[kind]);
  return baseBuildingSprite(kind, team, level);
}
/* Khai: a palisade of sharpened teak stakes. mask bits: 1 N, 2 E, 4 S, 8 W */
function palisadeSprite(mask) {
  return sprite('aywall|' + mask, 16, 24, 2, (P) => {
    const r = P.r, n = mask & 1, e = mask & 2, s = mask & 4, w = mask & 8;
    const stake = (x, top) => { r(x, top + 2, 2, 20 - top, (x & 2) ? '#8a5a2b' : '#9c6a36'); r(x, top + 1, 1, 1, '#c9a56a'); r(x + 1, top, 1, 2, '#b98a50'); r(x, top + 2, 1, 20 - top, '#a8773c'); };
    if (e || w || !(n || s)) { const x0 = w ? 0 : 2, x1 = e ? 16 : 14; for (let x = x0; x < x1; x += 2) stake(x, 4 + ((x >> 1) & 1)); r(x0, 13, x1 - x0, 1, '#5a3a1e'); r(x0, 18, x1 - x0, 1, '#5a3a1e'); }
    if (n || s) { const y0 = n ? 0 : 6; for (let y = y0; y < (s ? 18 : 12); y += 4) { stake(6, Math.max(0, y)); stake(8, Math.max(0, y + 1)); } }
    r(2, 22, 12, 2, '#5a3e22');
  });
}
function palisadeGateSprite(level) {
  return sprite('aygate|' + level, 16, 28, 2, (P) => {
    const r = P.r, open = level & 1;
    for (const x of [0, 2, 12, 14]) { r(x, 4, 2, 22, '#8a5a2b'); r(x, 4, 1, 22, '#a8773c'); r(x + 1, 3, 1, 1, '#c9a56a'); }
    r(0, 2, 16, 2, '#6b4422'); r(0, 1, 16, 1, '#7b4bb3'); r(7, 0, 2, 1, GOLD);
    if (open) { r(4, 6, 8, 20, '#1e140b'); }
    else { for (let x = 4; x < 12; x++) r(x, 6, 1, 20, x % 2 ? '#8a5a2b' : '#a0693a'); r(4, 11, 8, 1, WOOD_D); r(4, 20, 8, 1, WOOD_D); }
    r(0, 26, 16, 2, '#5a3e22');
  });
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
/* the face gate, with teak doors that swing open for a sortie (level 1) or stand cracked and scorched (level 2) */
const _gateC = {};
function faceGateSprite(level) {
  if (_gateC[level]) return _gateC[level];
  const base = KMB.kmBuilding('gate'), c = document.createElement('canvas'); c.width = base.width; c.height = base.height;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0);
  const R = (px, py, w, h, col) => { x.fillStyle = col; x.fillRect(px * 2, py * 2, w * 2, h * 2); };
  if (level !== 1) {
    // two heavy doors in the arch
    for (let i = 18; i < 30; i++) R(i, 34, 1, 12, i % 3 === 0 ? '#5e3a1c' : '#7a4d26');
    R(19, 32, 10, 2, '#6b4422'); R(23, 34, 2, 12, '#3a2412'); R(18, 38, 12, 1, '#4a3018'); R(18, 43, 12, 1, '#4a3018');
    R(21, 40, 1, 1, '#c9973a'); R(26, 40, 1, 1, '#c9973a');
    if (level === 2) { R(22, 36, 4, 6, '#1e140b'); R(20, 35, 2, 2, '#2a1d14'); R(26, 41, 3, 2, '#2a1d14'); }
  }
  return (_gateC[level] = c);
}
/* Phaniat: the elephant kraal, a ring of great teak logs with a royal pavilion over the gate */
function kraalSprite() {
  return sprite('ay|phaniat', 48, 52, 2, (P) => {
    const r = P.r;
    r(1, 30, 46, 18, '#9a7a4a'); r(1, 30, 46, 1, '#b8955a');
    const log = (x, top, bot) => { r(x, top, 2, bot - top, '#7a4d26'); r(x, top, 1, bot - top, '#9c6a36'); r(x, top - 1, 2, 1, '#c9a56a'); };
    for (let x = 2; x < 46; x += 3) log(x, 22, 34);
    // an elephant inside the ring
    const el = MAIN.elephantSprite('idle', 0);
    P.x.drawImage(el, 9, 17, el.width / 2, el.height / 2);
    // the pavilion where the king watched the round-up
    r(30, 20, 14, 10, '#c9b27a'); for (const x of [30, 36, 43]) r(x, 20, 1, 10, '#744620');
    for (let i = 0; i < 8; i++) { const w = 3 + i * 1.2; r(37 - Math.round(w), 11 + i, Math.round(w * 2), 1, i % 3 === 2 ? '#8e3322' : '#b8452c'); }
    r(36, 8, 2, 3, GOLD); r(37, 6, 1, 2, GOLD);
    r(29, 19, 16, 1, '#3f8a52');
    for (let x = 2; x < 46; x += 3) log(x, 38, 48);
    r(1, 42, 46, 1, '#5a3a1e'); r(1, 46, 46, 1, '#5a3a1e');
    r(3, 10, 1, 28, WOOD_D); r(4, 11, 7, 5, '#7b4bb3'); r(4, 11, 7, 1, GOLD); r(6, 13, 3, 1, GOLD);
  });
}

/* ---------- world overlays ---------- */
function paintUnit(u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE;
  if (d.hero) { ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, 20, 9); ctx.stroke(); ctx.globalAlpha = 1; }
  basePaintUnit(u);
  if (d.hero) {
    const top = py - 72;
    hpBar(px - 13, top + 2, 26, u.hp / u.maxHp);
    ctx.fillStyle = '#17110c'; ctx.fillRect(px - 21, top - 1, 7, 7);
    ctx.fillStyle = '#f2c94c'; ctx.fillRect(px - 19, top - 1, 3, 7); ctx.fillRect(px - 21, top + 1, 7, 3);
  }
}
function paintBuilding(b) {
  const lvl0 = b.kind === 'kgate' ? (b.openT > G.t ? 1 : b.hp < b.maxHp * 0.5 ? 2 : 0) : null;
  if (lvl0 != null) {
    // same as the base painter, with the gate's door state
    const px = b.tx * TILE, py = b.ty * TILE, w = b.size * TILE, spr = faceGateSprite(lvl0);
    const dx = px + (w - spr.width) / 2, dy = py + w - spr.height + 2;
    shadow(px + w / 2, py + w - 6, w * 0.46, w * 0.2, 0.26);
    ctx.drawImage(spr, dx, dy);
    if (b.hit > 0) { ctx.globalAlpha = 0.4; ctx.drawImage(whiteOf(spr), dx, dy); ctx.globalAlpha = 1; }
    if (isSel(b)) { ctx.strokeStyle = TEAMC[b.team].ring; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(px - 1, py - 1, w + 2, w + 2); ctx.setLineDash([]); }
    if (isSel(b) || b.hp < b.maxHp) hpBar(px + w * 0.15, dy + 2, w * 0.7, b.hp / b.maxHp);
  } else basePaintBuilding(b);
  if (b.team === 0 && G.M && G.M.hhList && b.hp > 0) paintHousehold(b);
  if (b.burnT > 0 && b.hp > 0) {
    const w = b.size * TILE, px = b.tx * TILE, py = b.ty * TILE, big = b.burnR >= LBURN.rate;
    for (let i = 0; i < (big ? 2 + b.size : 1); i++) {
      const fx = px + 6 + hash2(b.id, i, 3) * (w - 12), fy = py + w * 0.25 + hash2(b.id, i, 4) * w * 0.4, h = (big ? 6 : 3) + ((Math.floor(nowS * 8) + i) % 3) * 3;
      ctx.fillStyle = '#e2562c'; ctx.fillRect(fx - 3, fy - h, 6, h); ctx.fillStyle = '#f6b33a'; ctx.fillRect(fx - 2, fy - h + 2, 4, h - 3); ctx.fillStyle = '#fff3a0'; ctx.fillRect(fx - 1, fy - 3, 2, 2);
    }
  }
}
/* households: a soft gold glow round the house and its paddy, a badge over the house with the time to the next +15 */
function paintHousehold(b) {
  const h = G.M.hhList.find(h => h.house === b || h.farm === b); if (!h) return;
  const px = b.tx * TILE, py = b.ty * TILE, w = b.size * TILE, pulse = 0.5 + 0.5 * Math.sin(nowS * 2.5);
  ctx.save();
  ctx.strokeStyle = 'rgba(242,201,76,' + (0.45 + 0.35 * pulse).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.ellipse(px + w / 2, py + w - 4, w * 0.58, w * 0.24, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
  if (h.house === b) {
    // the badge: a fish over the roof, and a ring that fills as the next share comes in
    const cx = px + w / 2, cy = py - 22 - pulse * 2, k = 1 - Math.max(0, G.M.hhT) / HOUSEHOLD.every;
    ctx.fillStyle = 'rgba(16,24,20,0.82)'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 9, -1.5708, -1.5708 + 6.2832 * k); ctx.stroke();
    ctx.fillStyle = h.fish ? '#8fd3ff' : '#cfe8a0';
    ctx.fillRect(cx - 5, cy - 2, 7, 4); ctx.fillRect(cx + 2, cy - 3, 1, 6); ctx.fillRect(cx + 3, cy - 4, 2, 2); ctx.fillRect(cx + 3, cy + 2, 2, 2);
    ctx.fillStyle = '#10181a'; ctx.fillRect(cx - 3, cy - 1, 1, 1);
    if (h.farm) { ctx.strokeStyle = 'rgba(242,201,76,0.35)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx, py + w - 4); ctx.lineTo(h.farm.x * TILE, h.farm.y * TILE); ctx.stroke(); ctx.setLineDash([]); }
  }
  ctx.restore();
}
// objective markers: torches over the outer town, rings at the gates, the palace court and its banner
function paintMission() {
  const M = G.M; if (!M) return;
  const pulse = 0.5 + 0.5 * Math.sin(nowS * 3);
  const flag = (x, y, col) => {
    const fy = y - 6 - pulse * 3;
    ctx.fillStyle = '#2a1d14'; ctx.fillRect(x - 1, fy - 14, 2, 14);
    ctx.fillStyle = col; ctx.fillRect(x + 1, fy - 14, 9, 6); ctx.fillStyle = '#f2c94c'; ctx.fillRect(x + 1, fy - 14, 9, 1);
  };
  if (M.phase === 1) {
    for (const id of M.outer.concat(M.outposts)) {
      const b = G.byId.get(id); if (!b || b.hp <= 0) continue;
      const x = b.x * TILE, y = (b.ty) * TILE - 18;
      ctx.fillStyle = 'rgba(246,179,58,' + (0.5 + 0.4 * pulse).toFixed(2) + ')';
      ctx.fillRect(x - 3, y - 6, 6, 8); ctx.fillStyle = '#e2562c'; ctx.fillRect(x - 2, y - 9 - Math.round(pulse * 2), 4, 4); ctx.fillStyle = '#fff3a0'; ctx.fillRect(x - 1, y - 6, 2, 2);
    }
  }
  if (M.phase >= 2 && M.phase < 3) {
    for (const k in GATES) {
      const b = G.byId.get(M.gates[k]); if (!b || b.hp <= 0) continue;
      ctx.strokeStyle = 'rgba(242,201,76,' + (0.35 + 0.5 * pulse).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.lineDashOffset = -nowS * 18;
      ell(b.x * TILE, b.y * TILE + 10, 62 + pulse * 6, 30 + pulse * 3); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
  }
  if (M.phase === 3) {
    const pal = G.byId.get(M.palace); if (!pal) return;
    const x = pal.x * TILE, y = pal.y * TILE, R = (pal.size / 2 + 3.2) * TILE;
    ctx.strokeStyle = M.kingAt && !M.bannerFoes ? 'rgba(201,163,255,0.9)' : 'rgba(242,201,76,' + (0.35 + 0.4 * pulse).toFixed(2) + ')';
    ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -nowS * 20; ell(x, y + 8, R, R * 0.55); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    if (M.banner > 0) { hpBar(x - 30, pal.ty * TILE - 30, 60, M.banner / BANNER_T); flag(x - 4, pal.ty * TILE - 34, '#7b4bb3'); }
  }
}

/* ---------- fire arrows and dust ---------- */
const _drawArrowBase = drawArrow;
drawArrow = function (a) {
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
  _paintTopBase(f);
};
