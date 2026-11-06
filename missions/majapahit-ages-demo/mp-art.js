/* ===== mp-art.js ===== */
/* The player (team 0) is Majapahit, drawn with the game's Majapahit art in its red; the game's art
   draws team 0 as Melaka and team 1 as Majapahit, so team 0 is painted as team 1 here. Raiders (team 1)
   are drawn per raid kind. Soldiers change their look with each age, like the Melaka ages demo. */
const MJ_RED = Object.assign({}, TEAMC[1]);
Object.assign(TEAMC[0], MJ_RED, { name: 'Majapahit', ring: '#ffb28a' });
// raiders: Kediri in brown, the rebels in grey, both on the game's Majapahit drawing (any team but 0 draws
// Majapahit shapes in TEAMC[team]); the Yuan army is the Ming soldiers' art in Yuan blue
TEAMC[5] = { name: 'Kediri', main: '#9a6a34', dark: '#634220', trim: '#e8d6a8', roofA: '#8a6a3a', roofB: '#6e5230', roofR: '#3a2a16', ring: '#e0b878' };
TEAMC[4] = { name: 'Rebels', main: '#6e6a86', dark: '#47435a', trim: '#d8d0b0', roofA: '#7a7484', roofB: '#5e5a68', roofR: '#2e2a36', ring: '#c8c0e8' };
Object.assign(AUX.AUXC.ming, { name: 'Yuan', main: '#2f5d8a', dark: '#1d3d5e' });
Object.assign(TEAMC[1], { ring: '#e8e0ff' });
let SCENE_AGE = 0;   // story scenes set this to draw soldiers of a given age

/* ---------- people ---------- */
function curAge() { return SCENE_AGE || (typeof G !== 'undefined' && G && G.age ? G.age[0] : 2); }
function unitSprite(kind, team, anim, f, tool) {
  const d = UD[kind], a = anim === 'work' ? 'idle' : anim, ff = anim === 'walk' ? f : Math.min(2, f);
  if (d && d.lord) return lordSprite(anim, f);
  if (d && d.jv) return jvFoe(d.jv, d.pal, anim, f);
  if (d && d.aux) return AUX.auxUnitSprite('ming', d.aux, a, a === 'walk' ? f : Math.min(2, f));
  if (kind === 'pembedil' || kind === 'bediraja') return mpGunner(a, ff, kind === 'bediraja');
  if (kind === 'meriam') return XU.xUnit('cetbang', a === 'attack' ? 'attack' : 'idle', a === 'attack' ? Math.min(2, f) : 0);
  if (d && d.art) return HEROART.heroSprite(d.art, a, f);
  if (team === 0 && (kind === 'keris' || kind === 'tombak' || kind === 'archer')) return mpAge(kind, Math.min(4, curAge()), a, ff);
  if (team === 0) return baseUnitSprite(kind, 0, anim, f, tool);       // CIVMAP makes team 0 Majapahit
  if (team === 1) return civUnitSprite(kind, 0, anim, f, tool);
  return baseUnitSprite(kind, team, anim, f, tool);
}
/* Majapahit soldiers by age, on the game's own Majapahit drawUnit:
   age 1 plain village levy, age 2 on a kere (mail coat), age 4 mail with gold, like the palace guard */
function mpAge(kind, age, anim, f) {
  return sprite(`mpage|${kind}|${age}|${anim}|${f}`, 16, 18, 2, (P) => {
    const T = TEAMC[1], bob = (anim === 'walk' && (f === 1 || f === 3)) ? -1 : 0;
    const B = (x, y, w, h, c) => P.r(x, y + 2 + bob, w, h, c);
    drawUnit(P, kind, 1, anim, f);
    if (age === 1) MELAGE.recolor(P, { [GOLD]: T.main, [GOLD_D]: WOOD_D, [CREAM]: '#d8c9a0' });
    if (age >= 2) {
      for (let y = 7; y < 9; y++) for (let x = 5; x < 11; x++) B(x, y, 1, 1, (x + y) % 2 ? MELAGE.MAIL : MELAGE.MAIL_D);
      B(4, 8, 1, 2, MELAGE.MAIL); if (!(anim === 'attack' && f === 1 && kind === 'keris')) B(11, 8, 1, 2, MELAGE.MAIL);
      B(6, 7, 4, 1, age === 4 ? GOLD : MELAGE.MAIL_D);
    }
    if (age === 4) {
      B(4, 9, 1, 1, GOLD); if (!(anim === 'attack' && f === 1 && kind === 'keris')) B(11, 9, 1, 1, GOLD);
      B(5, 9, 6, 1, GOLD); B(7, 9, 2, 1, T.main);
    }
  });
}
/* the bedil gunner (lore/scenes/units-extra.js); the Golden Age guard adds a gold sash and belt */
function mpGunner(anim, f, elite) {
  const base = XU.xUnit('mjgunner', anim === 'attack' ? 'attack' : 'idle', anim === 'attack' ? f : 0);
  if (!elite) return base;
  return sprite(`mpgun|${anim}|${f}`, base.width / 2, base.height / 2, 2, (P) => {
    P.x.drawImage(base, 0, 0, base.width / 2, base.height / 2);
    P.r(5, 11, 6, 1, GOLD); P.r(6, 9, 1, 1, GOLD); P.r(7, 10, 1, 1, GOLD); P.r(8, 11, 1, 1, GOLD_D);
  }, false);
}
/* Kediri and rebel soldiers: the Majapahit drawing in their colours, with a baju (jacket) over the
   bare chest so they read apart from your own men at a glance */
function jvFoe(kind, pal, anim, f) {
  return sprite(`jvfoe|${kind}|${pal}|${anim}|${f}`, 16, 18, 2, (P) => {
    const T = TEAMC[pal], bob = (anim === 'walk' && (f === 1 || f === 3)) ? -1 : 0;
    const B = (x, y, w, h, c) => P.r(x, y + 2 + bob, w, h, c);
    drawUnit(P, kind, pal, anim, f);
    if (kind !== 'bhaya') { B(5, 7, 6, 3, T.main); B(5, 7, 6, 1, T.dark); B(7, 7, 2, 1, T.trim); }
    else { B(5, 10, 6, 2, T.main); B(5, 10, 6, 1, T.trim); }
  });
}
/* the lord of Sadeng: a rebel guard captain under a gilded red payung (state parasol) */
function lordSprite(anim, f) {
  const base = jvFoe('bhaya', 4, anim, f);
  return sprite('sdlord|' + anim + '|' + f, 16, 25, 2, (P) => {
    P.x.drawImage(base, 0, 7, base.width / 2, base.height / 2);
    const r = P.r;
    r(12, 1, 1, 12, WOOD_D);
    r(7, 2, 11, 2, '#b3202a'); r(8, 1, 9, 1, '#d0392f'); r(7, 4, 11, 1, GOLD); r(7, 4, 1, 1, GOLD_D); r(17, 4, 1, 1, GOLD_D);
    r(12, 0, 1, 1, GOLD);
  }, false);
}

/* ---------- ships ---------- */
function shipSprite(u) {
  const d = UD[u.kind];
  if (d && d.auxShip) return AUX.auxShipSprite('ming', d.auxShip);
  if (d && d.pal) return baseShipSprite({ kind: u.kind, team: d.pal });
  return baseShipSprite(u);
}
function shipAnchor(kind, team) {
  const d = UD[kind];
  if (d && d.auxShip) { const s = AUX.auxShipSprite('ming', d.auxShip); return [s.width >> 1, Math.round(s.height * 0.82)]; }
  return baseShipAnchor(kind, team);
}

/* ---------- buildings (walls, palisades and gates are the main game's own) ---------- */
function buildingSprite(kind, team, level) {
  if (team === 0) return baseBuildingSprite(kind, 0, level);
  // the raiders' only buildings are Kediri's war camp: Javanese timber in Kediri brown
  if (team === 1) return civBuildingSprite(kind, 5, level);
  return baseBuildingSprite(kind, team, level);
}

/* ---------- world overlays ---------- */
function paintUnit(u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE, star = d.hero || d.foeHero;
  if (star) { ctx.strokeStyle = u.team === 0 ? '#f2c94c' : '#e8e0ff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, d.big ? 20 : 12, d.big ? 9 : 6); ctx.stroke(); ctx.globalAlpha = 1; }
  basePaintUnit(u);
  if (star) {
    const top = py - (d.big ? 72 : 46);
    hpBar(px - 13, top + 2, 26, u.hp / u.maxHp);
    ctx.fillStyle = '#17110c'; ctx.fillRect(px - 21, top - 1, 7, 7);
    ctx.fillStyle = u.team === 0 ? '#f2c94c' : '#e8e0ff'; ctx.fillRect(px - 19, top - 1, 3, 7); ctx.fillRect(px - 21, top + 1, 7, 3);
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
