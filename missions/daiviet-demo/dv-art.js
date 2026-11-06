/* ===== dv-art.js ===== */
/* Đại Việt imperial yellow for the player (lore: team colours), Ming crimson and iron for the enemy */
Object.assign(TEAMC[0], { name: 'Đại Việt', main: '#e0aa22', dark: '#9a6a10', trim: '#7a2418', roofA: '#6f7f6a', roofB: '#55645a', roofR: '#3a4038', ring: '#ffe27a' });
Object.assign(TEAMC[1], { name: 'Ming', main: '#b3202a', dark: '#7a1018', trim: '#e8b830', roofA: '#8a2a22', roofB: '#6e1e18', roofR: '#2a1814', ring: '#ff7a6b' });

/* ---------- people ---------- */
function unitSprite(kind, team, anim, f, tool) {
  const d = UD[kind];
  if (d && d.dv) return DVART.dvUnit(d.dv, anim, anim === 'walk' ? f : Math.min(2, f));
  if (d && d.aux) return AUX.auxUnitSprite('ming', d.aux, anim === 'work' ? 'idle' : anim, anim === 'walk' ? f : Math.min(2, f));
  if (d && d.big) return AUX.auxBigSprite('ming', d.big, anim === 'work' ? 'idle' : anim, anim === 'walk' ? f : Math.min(2, f));
  if (kind === 'daibac') return daiBacSprite(anim, f);
  return baseUnitSprite(kind, team, anim, f, tool);
}
/* Đại Bác: a cast-bronze gun on a two-wheeled carriage, its gunner in the lacquered war hat */
function daiBacSprite(anim, f) {
  const fire = anim === 'attack', walk = anim === 'walk';
  return sprite(`dvgun|${anim}|${f}`, 34, 22, 2, (P) => {
    const r = P.r, BR = '#b5893a', BRL = '#e0b860', BRD = '#7a5a22';
    // the gunner behind the breech
    const gx = walk ? 1 : 3, gy = walk && (f & 1) ? -1 : 0;
    for (const [x, h] of walk ? [[gx + 3, f & 1 ? 3 : 4], [gx + 6, f & 1 ? 4 : 3]] : [[gx + 3, 4], [gx + 6, 4]]) { r(x, 17, 2, h, '#3a2a1a'); r(x, 16 + h, 2, 1, '#2b1d12'); }
    r(gx + 2, 10 + gy, 7, 7, DVART.DV.main); r(gx + 2, 13 + gy, 7, 1, '#7a2418'); r(gx + 3, 5 + gy, 5, 5, SKIN); r(gx + 7, 7 + gy, 1, 1, HAIR);
    r(gx + 1, 5 + gy, 9, 1, '#2a2420'); r(gx + 2, 4 + gy, 7, 1, '#3d342d'); r(gx + 4, 3 + gy, 3, 1, '#2a2420'); r(gx + 5, 2 + gy, 1, 1, '#c0392b');
    if (walk) { r(gx + 9, 12 + gy, 4, 1, SKIN); }
    else { r(gx + 9, 8, 1, 8, WOOD); r(gx + 10, 7, 1, 1, fire && f === 0 ? '#fff3a0' : '#e2562c'); }
    // carriage and wheel
    const k = fire && f === 2 ? -1 : 0, o = 12 + k;
    r(o, 13, 16, 4, WOOD); r(o, 13, 16, 1, '#a8773c'); r(o + 2, 15, 12, 1, DVART.DV.main); r(o - 2, 16, 4, 2, WOOD_D);
    disc(P, o + 9, 18, 3, WOOD_D); disc(P, o + 9, 18, 2, WOOD); r(o + 9, 18, 1, 1, BR);
    if (walk) { r(o + 9 + ((f & 1) ? 1 : -1), 16, 1, 1, WOOD_D); r(o + 9 + ((f & 1) ? -1 : 1), 20, 1, 1, WOOD_D); }
    // barrel: rings and a flared muzzle
    r(o + 1, 10, 2, 3, BRD); r(o + 3, 9, 12, 4, BR); r(o + 3, 9, 12, 1, BRL); r(o + 3, 12, 12, 1, BRD);
    for (const x of [o + 6, o + 10, o + 14]) r(x, 8, 1, 5, BRD);
    r(o + 15, 8, 3, 6, BR); r(o + 15, 8, 3, 1, BRL); r(o + 17, 10, 1, 2, '#1e1a18');
    if (fire && f === 1) { r(o + 18, 8, 4, 5, '#fff3a0'); r(o + 20, 9, 3, 3, '#f6b33a'); r(o + 19, 6, 1, 2, '#e2562c'); r(o + 19, 13, 1, 2, '#e2562c'); }
    if (fire && f === 2) { r(o + 17, 6, 4, 4, '#d8d4cc'); r(o + 19, 3, 4, 4, '#bdb8ae'); }
  });
}

/* ---------- ships ---------- */
function shipSprite(u) { return u.kind === 'boat' ? DVART.dvShip('fishing') : baseShipSprite(u); }
function shipAnchor(kind, team) { return kind === 'boat' ? [24, 34] : baseShipAnchor(kind, team); }

/* ---------- buildings ---------- */
const DV_BASE = ['towncentre', 'house', 'barracks', 'port'], DV_SIG = ['tower', 'granary'];
function buildingSprite(kind, team, level) {
  if (kind === 'wall') return bambooWallSprite(level || 0);
  if (kind === 'gate') return villageGateSprite(level || 0);
  if (kind === 'dinh') return dinhSprite();
  if (kind === 'nhathuoc') return nhaThuocSprite();
  if (team === 0 && DV_BASE.includes(kind)) return MAINLAND.mainlandBase('dv', kind);
  if (team === 0 && DV_SIG.includes(kind)) return MAINLAND.mainlandBuilding('dv', kind);
  return baseBuildingSprite(kind, team, level);
}
const TILE_A = '#6f7f6a', TILE_B = '#55645a', TILE_R = '#3a4038', COL_R = '#8e2a1e', COL_D = '#5e1a12', LIME = '#d9ccb0', LIME_D = '#b8a888', STONE_G = '#9a948a', STONE_GD = '#77716a';
/* the curved roof of a đình: a wide sweep of grey tiles, the corners turned up like a boat's prow */
function dinhRoof(P, cx, y0, y1, hw0, hw1, lift) {
  const r = P.r;
  for (let y = y0; y <= y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0), hw = Math.round(hw0 + (hw1 - hw0) * t);
    r(cx - hw, y, hw * 2, 1, (y - y0) % 3 === 2 ? TILE_B : TILE_A);
    for (let x = cx - hw + 2 + ((y - y0) & 1); x < cx + hw - 1; x += 4) r(x, y, 1, 1, TILE_R);
  }
  r(cx - hw1, y1 + 1, hw1 * 2, 1, TILE_R);
  // upturned corners (đầu đao)
  for (let i = 0; i < lift; i++) { r(cx - hw1 - 1 - (i >> 1), y1 - i, 2, 1, TILE_A); r(cx + hw1 - 1 + (i >> 1), y1 - i, 2, 1, TILE_A); }
  r(cx - hw1 - 1 - (lift >> 1), y1 - lift, 1, 1, LIME); r(cx + hw1 + (lift >> 1), y1 - lift, 1, 1, LIME);
}
function dinhSprite() {
  return sprite('dv|dinh', 48, 58, 2, (P) => {
    const r = P.r;
    // stone plinth and steps
    r(1, 48, 46, 7, STONE_G); r(1, 48, 46, 1, '#b4aea4'); r(1, 54, 46, 1, STONE_GD); for (let x = 3; x < 46; x += 6) r(x, 50, 1, 4, STONE_GD);
    r(18, 55, 12, 2, STONE_G); r(20, 57, 8, 1, STONE_GD);
    // open hall: red columns on a dark floor, carved panels between them
    r(4, 34, 40, 14, '#3a2416'); r(4, 46, 40, 2, '#5a3a22');
    for (const x of [4, 11, 18, 23, 29, 36, 43]) { r(x, 33, 2, 15, COL_R); r(x, 33, 1, 15, '#a8382a'); r(x, 47, 2, 1, COL_D); }
    for (const x of [6, 31, 38]) { r(x, 36, 4, 4, '#6b4a2a'); r(x + 1, 37, 2, 2, '#8a6a3a'); }
    r(20, 37, 3, 8, '#2a180c'); r(25, 37, 3, 8, '#2a180c'); r(19, 35, 10, 1, GOLD_D);
    // altar glow in the middle, where the village guardian is honoured
    r(22, 40, 4, 3, '#c0392b'); r(23, 39, 2, 1, GOLD);
    // the great roof, then the ridge with two dragons facing the moon (lưỡng long chầu nguyệt)
    dinhRoof(P, 24, 15, 32, 16, 25, 6);
    r(8, 14, 32, 1, TILE_R); r(9, 13, 30, 1, '#2b2622');
    r(21, 9, 6, 5, '#c9b27a'); disc(P, 24, 9, 2, '#e8d070'); r(24, 9, 1, 1, '#fff6c0');
    for (const s of [-1, 1]) { const x = 24 + s * 7; r(x - 2, 11, 5, 2, '#3f8a5a'); r(x + (s > 0 ? -3 : 2), 10, 2, 1, '#3f8a5a'); r(x + s * 3, 12, 2, 1, '#3f8a5a'); r(x - 1, 10, 1, 1, '#7dbf8a'); }
    for (const x of [7, 40]) { r(x, 11, 2, 3, '#3f8a5a'); r(x + (x < 20 ? -1 : 1), 9, 2, 2, '#3f8a5a'); }
    // the drum that calls the village to arms, on its stand by the steps
    r(41, 44, 6, 1, WOOD_D); r(42, 45, 1, 3, WOOD_D); r(45, 45, 1, 3, WOOD_D); r(41, 39, 6, 5, '#a8382a'); r(41, 39, 6, 1, '#e8d9a0'); r(41, 43, 6, 1, '#e8d9a0'); r(42, 40, 4, 3, '#c0492b');
    // banner pole
    r(2, 18, 1, 30, WOOD_D); r(3, 19, 6, 5, DVART.DV.main); r(3, 19, 6, 1, '#7a2418'); r(5, 21, 2, 1, '#7a2418');
  });
}
function nhaThuocSprite() {
  return sprite('dv|nhathuoc', 32, 46, 2, (P) => {
    const r = P.r;
    MAINLAND.brick(P, 2, 38, 28, 6); r(2, 38, 28, 1, '#c97a5a');
    r(4, 26, 24, 12, LIME); for (const x of [4, 15, 27]) r(x, 26, 1, 12, COL_R);
    r(12, 29, 7, 9, '#3f2713'); r(11, 28, 9, 1, DVART.DV.main);
    r(6, 29, 4, 4, '#5a3a22'); r(7, 30, 2, 2, '#7a5a3a'); r(21, 29, 4, 4, '#5a3a22'); r(22, 30, 2, 2, '#7a5a3a');
    MAINLAND.vietRoof(P, 16, 14, 30, 12, TILE_A, TILE_B); r(1, 26, 30, 1, TILE_R);
    // drying rack of herbs and the medicine jars
    r(0, 32, 1, 8, WOOD_D); r(0, 32, 4, 1, WOOD_D); for (const x of [1, 3]) { r(x, 33, 1, 3, '#5a9a4a'); r(x, 36, 1, 1, '#3f7a38'); }
    for (const x of [24, 27]) { r(x, 35, 3, 3, '#8a5a3a'); r(x, 35, 3, 1, '#a87a4a'); r(x + 1, 34, 1, 1, '#5a3a22'); }
    // a green cross sign over the door
    r(14, 22, 4, 4, '#efe9d8'); r(15, 22, 2, 4, '#3f8a5a'); r(14, 23, 4, 2, '#3f8a5a');
  });
}
/* Lũy tre: the bamboo hedge on an earth bank that ringed every northern village. mask bits: 1 N, 2 E, 4 S, 8 W */
const BAM = '#6aa84a', BAM_D = '#3f7a38', BAM_L = '#9ccf6a', EARTH = '#7a5a38', EARTH_L = '#94704a', EARTH_D = '#5a4128';
function bambooWallSprite(mask) {
  return sprite('dvwall|' + mask, 16, 26, 2, (P) => {
    const r = P.r, n = mask & 1, e = mask & 2, s = mask & 4, w = mask & 8;
    const across = e || w || !(n || s);
    const clump = (x, top) => { for (let i = 0; i < 3; i++) { const cx = x + i * 2 - 2, h = 17 - top - (i === 1 ? 3 : 0); r(cx, top + (i === 1 ? 0 : 3), 1, h, i === 1 ? BAM_D : BAM); for (let y = top + 4; y < 20; y += 4) r(cx, y, 1, 1, BAM_L); } r(x - 4, top + 1, 3, 2, BAM_L); r(x + 2, top, 3, 2, BAM); r(x - 1, top - 1, 3, 2, BAM_L); };
    if (across) {
      const x0 = w ? 0 : 2, x1 = e ? 16 : 14;
      r(x0, 18, x1 - x0, 8, EARTH); r(x0, 18, x1 - x0, 1, EARTH_L); r(x0, 24, x1 - x0, 2, EARTH_D);
      clump(x0 + 4, 4); clump(x1 - 4, 6);
    }
    if (n || s) {
      const y0 = n ? 0 : 8, y1 = s ? 26 : 24;
      r(3, y0 + 6, 10, y1 - y0 - 6, EARTH); r(3, y0 + 6, 10, 1, EARTH_L); r(11, y0 + 6, 2, y1 - y0 - 6, EARTH_D);
      for (let y = y0 - 2; y < y1 - 12; y += 5) clump(8, Math.max(0, y + 2));
    }
  });
}
/* cổng làng: the village gate, brick piers under a small tiled roof. level 1 = open */
function villageGateSprite(level) {
  return sprite('dvgate|' + level, 16, 28, 2, (P) => {
    const r = P.r, open = level & 1;
    r(0, 20, 16, 8, EARTH); r(0, 20, 16, 1, EARTH_L); r(0, 26, 16, 2, EARTH_D);
    MAINLAND.brick(P, 0, 9, 4, 18); MAINLAND.brick(P, 12, 9, 4, 18);
    if (open) { r(4, 12, 8, 14, '#1e140b'); r(4, 24, 8, 2, '#3a2a1a'); }
    else { for (let x = 4; x < 12; x++) r(x, 12, 1, 14, x % 2 ? '#8a5a2b' : '#a0693a'); r(4, 16, 8, 1, WOOD_D); r(4, 22, 8, 1, WOOD_D); r(7, 18, 2, 2, GOLD); }
    r(0, 9, 16, 3, LIME); r(3, 10, 10, 1, '#7a2418');
    MAINLAND.vietRoof(P, 8, 2, 18, 6, TILE_A, TILE_B);
  });
}

/* ---------- world overlays ---------- */
function paintUnit(u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE;
  if (d.hero) { ctx.strokeStyle = u.team === 0 ? '#f2c94c' : '#ff7a6b'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, d.big ? 18 : 12, d.big ? 8 : 6); ctx.stroke(); ctx.globalAlpha = 1; }
  const faded = u.team === 0 && u.hidden;
  if (faded) ctx.globalAlpha = 0.55;
  basePaintUnit(u);
  ctx.globalAlpha = 1;
  if (faded) {
    // a leaf over the head: hidden in the forest
    const y = py - 40 - Math.sin(nowS * 2 + u.id) * 1.5;
    ctx.fillStyle = '#2c5a2a'; ctx.fillRect(px - 4, y - 1, 8, 4); ctx.fillStyle = '#7bc65a'; ctx.fillRect(px - 3, y, 6, 2); ctx.fillRect(px - 1, y - 2, 2, 1); ctx.fillStyle = '#3f8a3a'; ctx.fillRect(px + 2, y + 2, 2, 2);
  }
  if (d.hero) {
    const top = py - (d.big ? 56 : 46);
    hpBar(px - 13, top + 2, 26, u.hp / u.maxHp);
    ctx.fillStyle = '#17110c'; ctx.fillRect(px - 21, top - 1, 7, 7);
    ctx.fillStyle = u.team === 0 ? '#f2c94c' : '#ff7a6b'; ctx.fillRect(px - 19, top - 1, 3, 7); ctx.fillRect(px - 21, top + 1, 7, 3);
  }
  if (u.order.t === 'arm' || u.order.t === 'disarm') {
    const o = u.order; if (o.s === 'work') { const p = 1 - o.left / (o.t === 'arm' ? ARM_TIME : DISARM_TIME); hpBar(px - 8, py - 44, 16, Math.max(0, Math.min(1, p))); }
  }
}
function paintBuilding(b) {
  basePaintBuilding(b);
}
// Đình radius, forest hiding places, and the pass markers when a column is due
function paintMission() {
  const M = G.M; if (!M) return;
  const pulse = 0.5 + 0.5 * Math.sin(nowS * 3);
  const showD = (sel.length === 1 && sel[0].isBld && sel[0].kind === 'dinh') || (mode && mode.kind === 'place' && (mode.bkind === 'farm' || mode.bkind === 'dinh'));
  if (showD) {
    for (const b of G.buildings) if (b.kind === 'dinh' && b.team === 0 && b.hp > 0) {
      ctx.strokeStyle = 'rgba(255,226,122,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      ctx.strokeRect((b.tx - DINH_FARM.rng) * TILE, (b.ty - DINH_FARM.rng) * TILE, (b.size + DINH_FARM.rng * 2) * TILE, (b.size + DINH_FARM.rng * 2) * TILE); ctx.setLineDash([]);
    }
    if (mode && mode.bkind === 'dinh' && mode.tx != null) { ctx.strokeStyle = 'rgba(255,226,122,0.35)'; ctx.setLineDash([6, 5]); ctx.strokeRect((mode.tx - DINH_FARM.rng) * TILE, (mode.ty - DINH_FARM.rng) * TILE, (3 + DINH_FARM.rng * 2) * TILE, (3 + DINH_FARM.rng * 2) * TILE); ctx.setLineDash([]); }
  }
  // with soldiers selected, show where they could hide
  if (G.forest && selUnits().some(u => UD[u.kind].ambush)) {
    const x0 = Math.max(0, Math.floor(cam.x / TILE)), x1 = Math.min(W - 1, Math.ceil((cam.x + view.w / view.zoom) / TILE));
    const y0 = Math.max(0, Math.floor(cam.y / TILE)), y1 = Math.min(H - 1, Math.ceil((cam.y + view.h / view.zoom) / TILE));
    ctx.fillStyle = 'rgba(155,227,106,0.22)';
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (G.forest[ty * W + tx] && G.explored[ty * W + tx]) { ctx.fillRect(tx * TILE + 11, ty * TILE + 13, 10, 6); }
  }
  // the next column's passes, from 25 s out
  if (M.wave < WAVES.length && M.next - M.t <= 25) {
    for (const c of WAVES[M.wave].cols) {
      const x = PASSES[c.from].x * TILE + 16, y = 18.5 * TILE;
      ctx.fillStyle = 'rgba(224,82,74,' + (0.35 + 0.5 * pulse).toFixed(2) + ')';
      for (let k = 0; k < 3; k++) { const ay = y + k * 22 + ((nowS * 30) % 22); ctx.beginPath(); ctx.moveTo(x - 14, ay); ctx.lineTo(x + 14, ay); ctx.lineTo(x, ay + 12); ctx.closePath(); ctx.fill(); }
    }
  }
}

/* ---------- gunpowder: bullets, cannonballs, muzzle flash and white powder smoke ---------- */
const _drawArrowBase = drawArrow;
drawArrow = function (a) {
  if (!a.k) return _drawArrowBase(a);
  const p = a.t / a.dur, lift = a.k === 'ball' ? Math.sin(p * Math.PI) * 0.5 : 0;
  const x = (a.x0 + (a.x1 - a.x0) * p) * TILE, y = (a.y0 + (a.y1 - a.y0) * p - lift) * TILE - 8;
  if (a.k === 'bullet') {
    // a hot lead ball with a short tracer streak behind it
    const d = Math.hypot(a.x1 - a.x0, a.y1 - a.y0) || 1, ux = (a.x1 - a.x0) / d, uy = (a.y1 - a.y0) / d;
    ctx.fillStyle = 'rgba(255,214,120,0.55)';
    for (let i = 1; i <= 3; i++) ctx.fillRect(Math.round(x - ux * i * 3) - 1, Math.round(y - uy * i * 3) - 1, 2, 2);
    ctx.fillStyle = '#fff4c8'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  } else {
    // iron cannonball with a smoke trail
    ctx.fillStyle = 'rgba(200,196,186,0.45)';
    for (let i = 1; i <= 3; i++) { const q = Math.max(0, p - i * 0.06), tx = (a.x0 + (a.x1 - a.x0) * q) * TILE, ty = (a.y0 + (a.y1 - a.y0) * q - Math.sin(q * Math.PI) * 0.5) * TILE - 8; ctx.fillRect(Math.round(tx) - 2, Math.round(ty) - 2, 4, 4); }
    ctx.fillStyle = '#1e1e22'; ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    ctx.fillStyle = '#5a5a62'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 2, 2);
  }
};
const _paintTopBase = paintTop;
paintTop = function (f) {
  if (f.sub === 'flash') {
    // a bright pixel burst pointing out of the barrel
    const p = 1 - f.t / f.max, x = Math.round(f.x * TILE), y = Math.round(f.y * TILE - 8), s = f.big ? 2 : 1, dir = f.face || 1;
    ctx.globalAlpha = 1 - p * 0.6;
    ctx.fillStyle = '#ffb030'; ctx.fillRect(x - 2 * s, y - 2 * s, 4 * s, 4 * s);
    ctx.fillRect(x + dir * 2 * s - (dir < 0 ? 5 * s : 0), y - s, 5 * s, 2 * s);
    ctx.fillStyle = '#fff6c0'; ctx.fillRect(x - s, y - s, 2 * s, 2 * s); ctx.fillRect(x + dir * 2 * s - (dir < 0 ? 3 * s : 0), y - Math.ceil(s / 2), 3 * s, s);
    ctx.fillStyle = '#ffdc60'; ctx.fillRect(x - s, y - 4 * s, s, 2 * s); ctx.fillRect(x - s, y + 2 * s, s, 2 * s);
    ctx.globalAlpha = 1;
    return;
  }
  if (f.sub === 'gun') {
    // black-powder smoke is thick and pale: it billows forward and drifts up as it thins
    const p = 1 - f.t / f.max, x = (f.x + (f.vx || 0) * p) * TILE, y = f.y * TILE - 8 + f.vy * p * 30, s = Math.round((f.big ? 7 : 5) + p * (f.big ? 16 : 10));
    ctx.fillStyle = 'rgba(226,222,212,' + (0.85 * (1 - p)).toFixed(2) + ')'; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
    ctx.fillStyle = 'rgba(255,255,250,' + (0.4 * (1 - p)).toFixed(2) + ')'; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.ceil(s / 2), Math.ceil(s / 2));
    return;
  }
  _paintTopBase(f);
};
