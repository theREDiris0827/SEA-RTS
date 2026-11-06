/* ===== mr-art.js ===== */
/* Melaka stays the game's own green; Majapahit raiders keep their red; Siam wears Ayutthaya purple
   (MAIN.CIVC.ayu). Soldiers change their look with each age (lore/scenes/melaka-ages-art.js). */
Object.assign(MAIN.CIVC.ayu, { main: '#7b4bb3', dark: '#4e2d78', ring: '#c9a3ff' });
let SCENE_AGE = 0;   // story scenes set this to draw soldiers of a given age

/* ---------- people ---------- */
function curAge() { return SCENE_AGE || (typeof G !== 'undefined' && G && G.age ? G.age[0] : 2); }
function unitSprite(kind, team, anim, f, tool) {
  const d = UD[kind], a = anim === 'work' ? 'idle' : anim, ff = anim === 'walk' ? f : Math.min(2, f);
  if (d && d.ayu) return MAIN.civUnitSprite('ayu', d.ayu, a, ff);
  if (d && d.big === 'chang') return MAIN.elephantSprite(a === 'attack' ? 'attack' : a, Math.min(a === 'walk' ? 3 : 1, f));
  if (d && d.big === 'king') return kingSprite(a, a === 'walk' ? f : Math.min(1, f));
  if (kind === 'pembedil' || kind === 'bediraja') return MELAGE.melGunner(a, ff, kind === 'bediraja');
  if (kind === 'meriam') return MELAGE.melMeriam();
  if (d && (d.hero === 'tuah' || d.hero === 'perak')) return HEROART.heroSprite(d.hero, a, f);
  if (team === 0 && (kind === 'keris' || kind === 'tombak' || kind === 'archer')) { const age = curAge(); if (age !== 2) return MELAGE.melAge(kind, Math.min(4, age), a, ff); }
  return baseUnitSprite(kind, team, anim, f, tool);
}
/* the Siamese commander on his war elephant, under a tiered white parasol (from the Ayutthaya demo) */
function kingSprite(anim, f) {
  return sprite('ayking|' + anim + '|' + f, 28, 33, 2, (P) => {
    const el = MAIN.elephantSprite(anim, f);
    P.x.drawImage(el, 0, 7, el.width / 2, el.height / 2);
    const r = P.r, WH = '#f6f2e6', WD = '#cfc8b4';
    r(13, 1, 1, 13, GOLD_D);
    for (let i = 0; i < 3; i++) { const w = 11 - i * 3, y = 6 - i * 2; r(13 - (w >> 1), y, w, 2, WH); r(13 - (w >> 1), y + 1, w, 1, WD); r(13 - (w >> 1), y + 1, 1, 1, GOLD); r(13 + (w >> 1) - (w & 1 ? 0 : 1), y + 1, 1, 1, GOLD); }
    r(13, 0, 1, 1, GOLD);
    r(12, 11, 3, 2, GOLD); r(12, 10, 3, 1, '#7b4bb3');
  });
}

/* ---------- ships ---------- */
function shipSprite(u) {
  const d = UD[u.kind];
  if (d && d.ayuShip) return MAIN.mainlandShip('ayu', d.ayuShip);
  return baseShipSprite(u);
}
function shipAnchor(kind, team) {
  const d = UD[kind];
  if (d && d.ayuShip) { const s = MAIN.mainlandShip('ayu', d.ayuShip); return [s.width >> 1, Math.round(s.height * 0.82)]; }
  return baseShipAnchor(kind, team);
}

/* ---------- buildings (walls, palisades and gates are the main game's own) ---------- */
function buildingSprite(kind, team, level) {
  return baseBuildingSprite(kind, team, level);
}

/* ---------- world overlays ---------- */
function paintUnit(u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE, star = d.hero || d.foeHero;
  if (star) { ctx.strokeStyle = u.team === 0 ? '#f2c94c' : '#c9a3ff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, d.big ? 20 : 12, d.big ? 9 : 6); ctx.stroke(); ctx.globalAlpha = 1; }
  basePaintUnit(u);
  if (star) {
    const top = py - (d.big ? 72 : 46);
    hpBar(px - 13, top + 2, 26, u.hp / u.maxHp);
    ctx.fillStyle = '#17110c'; ctx.fillRect(px - 21, top - 1, 7, 7);
    ctx.fillStyle = u.team === 0 ? '#f2c94c' : '#c9a3ff'; ctx.fillRect(px - 19, top - 1, 3, 7); ctx.fillRect(px - 21, top + 1, 7, 3);
  }
  if (u.order.t === 'land' && u.order.troops && u.order.s === 'in') {
    // a landing galley shows how many men it carries
    const an = shipAnchor(u.kind, u.team), y = py - an[1] - 4, t = u.order.troops.length + ' aboard';
    ctx.font = '700 12px "Barlow Semi Condensed", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#10201a'; ctx.strokeText(t, px, y); ctx.fillStyle = '#ffb3a8'; ctx.fillText(t, px, y);
  }
}
function paintBuilding(b) {
  basePaintBuilding(b);
  // the town centre shows the court's progress toward the next age
  if (b.team === 0 && b.kind === 'towncentre' && G.M && G.M.aging) {
    const A = G.M.aging, p = 1 - A.left / A.tot, w = b.size * TILE, x = b.tx * TILE, y = b.ty * TILE - 14;
    ctx.fillStyle = '#17110c'; ctx.fillRect(x + 6, y, w - 12, 6); ctx.fillStyle = '#f2c94c'; ctx.fillRect(x + 7, y + 1, Math.round((w - 14) * p), 4);
  }
}
// where the next raid comes from, from 25 s out
function paintMission() {
  const M = G.M; if (!M) return;
  const pulse = 0.5 + 0.5 * Math.sin(nowS * 3);
  if (!M.finalOn && (M.finalAt ? M.finalAt : M.next) - M.t <= 25) {
    const R = M.finalAt ? FINAL : RAIDS[Math.min(M.raid, RAIDS.length - 1)];
    const marks = Object.keys(R.land || {}).map(e => ENTRY[e]);
    if (R.sea) marks.push({ x: SEA.x - 3, y: SEA.y - 3 });
    ctx.fillStyle = 'rgba(224,82,74,' + (0.35 + 0.5 * pulse).toFixed(2) + ')';
    for (const E of marks) {
      const x = E.x * TILE, y = (E.y - 2.5) * TILE;
      for (let k = 0; k < 3; k++) { const ay = y + k * 22 + ((nowS * 30) % 22); ctx.beginPath(); ctx.moveTo(x - 14, ay); ctx.lineTo(x + 14, ay); ctx.lineTo(x, ay + 12); ctx.closePath(); ctx.fill(); }
    }
  }
}

/* ---------- gunpowder: bullets, cannonballs, muzzle flash and white powder smoke (Dai Viet demo) ---------- */
const _drawArrowBase = drawArrow;
drawArrow = function (a) {
  if (a.k !== 'bullet' && a.k !== 'mball') return _drawArrowBase(a);
  const p = a.t / a.dur, lift = a.k === 'mball' ? Math.sin(p * Math.PI) * 0.5 : 0;
  const x = (a.x0 + (a.x1 - a.x0) * p) * TILE, y = (a.y0 + (a.y1 - a.y0) * p - lift) * TILE - 8;
  if (a.k === 'bullet') {
    const d = Math.hypot(a.x1 - a.x0, a.y1 - a.y0) || 1, ux = (a.x1 - a.x0) / d, uy = (a.y1 - a.y0) / d;
    ctx.fillStyle = 'rgba(255,214,120,0.55)';
    for (let i = 1; i <= 3; i++) ctx.fillRect(Math.round(x - ux * i * 3) - 1, Math.round(y - uy * i * 3) - 1, 2, 2);
    ctx.fillStyle = '#fff4c8'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  } else {
    ctx.fillStyle = 'rgba(200,196,186,0.45)';
    for (let i = 1; i <= 3; i++) { const q = Math.max(0, p - i * 0.06), tx = (a.x0 + (a.x1 - a.x0) * q) * TILE, ty = (a.y0 + (a.y1 - a.y0) * q - Math.sin(q * Math.PI) * 0.5) * TILE - 8; ctx.fillRect(Math.round(tx) - 2, Math.round(ty) - 2, 4, 4); }
    ctx.fillStyle = '#1e1e22'; ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    ctx.fillStyle = '#5a5a62'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 2, 2);
  }
};
const _paintTopBase = paintTop;
paintTop = function (f) {
  if (f.sub === 'flash') {
    const p = 1 - f.t / f.max, x = Math.round(f.x * TILE), y = Math.round(f.y * TILE - 8), s = f.big ? 2 : 1, dir = f.face || 1;
    ctx.globalAlpha = 1 - p * 0.6;
    ctx.fillStyle = '#ffb030'; ctx.fillRect(x - 2 * s, y - 2 * s, 4 * s, 4 * s);
    ctx.fillRect(x + dir * 2 * s - (dir < 0 ? 5 * s : 0), y - s, 5 * s, 2 * s);
    ctx.fillStyle = '#fff6c0'; ctx.fillRect(x - s, y - s, 2 * s, 2 * s); ctx.fillRect(x + dir * 2 * s - (dir < 0 ? 3 * s : 0), y - Math.ceil(s / 2), 3 * s, s);
    ctx.globalAlpha = 1;
    return;
  }
  if (f.sub === 'gun') {
    const p = 1 - f.t / f.max, x = (f.x + (f.vx || 0) * p) * TILE, y = f.y * TILE - 8 + f.vy * p * 30, s = Math.round((f.big ? 7 : 5) + p * (f.big ? 16 : 10));
    ctx.fillStyle = 'rgba(226,222,212,' + (0.85 * (1 - p)).toFixed(2) + ')'; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
    ctx.fillStyle = 'rgba(255,255,250,' + (0.4 * (1 - p)).toFixed(2) + ')'; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.ceil(s / 2), Math.ceil(s / 2));
    return;
  }
  _paintTopBase(f);
};
