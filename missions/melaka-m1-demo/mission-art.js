
/* ===== mission-art.js ===== */
/* Singapura's teal (aux civ sheet) for phases 1-2, Melaka green from phase 3 */
const SG_TEAM = { name: 'Singapura', main: '#1f9e9a', dark: '#146a67', trim: '#f2c94c', roofA: '#c9ae5e', roofB: '#a98f48', roofR: '#1d5a58', ring: '#7dfff0' };
const MELAKA_TEAM = Object.assign({}, TEAMC[0]);
const SG_AUX = Object.assign({}, AUX.AUXC.sg);
function setPlayerCiv(civ) {
  Object.assign(TEAMC[0], civ === 'sg' ? SG_TEAM : MELAKA_TEAM);
  // the Singapura soldiers who reach Melaka take its colours too
  Object.assign(AUX.AUXC.sg, civ === 'sg' ? SG_AUX : { main: MELAKA_TEAM.main, dark: MELAKA_TEAM.dark });
  for (const k in SPR) delete SPR[k];
  WHITE.clear(); urlCache.clear();
}

/* ---------- people ---------- */
function unitSprite(kind, team, anim, f, tool) {
  const d = UD[kind];
  if (d && d.aux) return AUX.auxUnitSprite('sg', d.aux, anim === 'work' ? 'idle' : anim, f);
  if (d && d.hero === 'parameswara') return HEROART.heroSprite('parameswara', anim === 'work' ? 'idle' : anim, f);
  if (d && d.hero === 'temenggung') return temenggungSprite(anim === 'work' ? 'idle' : anim, f);
  if (kind === 'obor') return SIEGE.torchSprite(team, anim === 'attack' ? 'light' : anim === 'walk' ? 'walk' : 'idle', anim === 'attack' ? Math.min(2, f) : f);
  return baseUnitSprite(kind, team, anim, f, tool);
}
/* the Temenggung, captain of the guard: black tengkolok with a gold peak, dark baju, spear and round shield.
   Built on drawUnit like the other hero sprites; 16x20 so it stands a little taller than his men. */
function temenggungSprite(anim, f) {
  return sprite(`hero|temenggung|${anim}|${f}`, 16, 20, 2, (P) => {
    const bob = (anim === 'walk' && (f === 1 || f === 3)) ? -1 : 0;
    drawUnit({ r: (x, y, w, h, c) => P.r(x, y + 2, w, h, c) }, 'tombak', 0, anim, f);
    const B = (x, y, w, h, c) => P.r(x, y + 4 + bob, w, h, c);
    P.x.clearRect(3, bob, 9, 7); P.x.clearRect(3, 7 + bob, 3, 4);
    B(6, 3, 4, 1, SKIN); B(6, 4, 4, 2, SKIN); B(9, 5, 1, 1, HAIR); B(8, 6, 2, 1, HAIR);
    const BLK = '#1c1c1c', BAJU = '#26302b';
    B(5, 1, 6, 3, BLK); B(5, 3, 6, 1, GOLD); B(6, 2, 1, 1, '#3a3a3a'); B(9, -2, 2, 3, BLK); B(10, -2, 1, 1, GOLD); B(4, 2, 1, 2, BLK);
    B(5, 7, 6, 2, BAJU); B(7, 7, 2, 1, GOLD); B(7, 8, 1, 1, GOLD_D); B(4, 8, 1, 3, BAJU); B(11, 8, 1, 3, BAJU);
    B(5, 9, 6, 1, GOLD); B(6, 10, 1, 1, GOLD); B(9, 10, 1, 1, GOLD);
  });
}

/* ---------- ships ---------- */
function shipSprite(u) {
  if (u.kind === 'olboat') return AUX.auxShipSprite('sg', 'orangLaut');
  if (UD[u.kind] && UD[u.kind].ayu) return MAINLAND.mainlandShip('ayu', UD[u.kind].ayu);
  return baseShipSprite(u);
}
function shipAnchor(kind, team) {
  if (kind === 'olboat') return [34, 42];
  if (UD[kind] && UD[kind].ayu) return SHIP_ANCHOR[UD[kind].ayu];
  return baseShipAnchor(kind, team);
}

/* ---------- walls and gates ---------- */
const EARTH = '#7a5a38', EARTH_L = '#94704a', EARTH_D = '#5a4128', STAKE = '#b08850', STAKE_D = '#7a5a30', SOOT = '#2a221c';
function buildingSprite(kind, team, level) {
  if (kind === 'wall') return wallSprite(level || 0);
  if (kind === 'gate') return gateSprite(level || 0);
  if (kind === 'bendahari') return baseBuildingSprite('house', team, 2);
  return baseBuildingSprite(kind, team, level);
}
// mask bits: 1 north, 2 east, 4 south, 8 west, 16 scorched (Ayutthaya's earlier attack)
function wallSprite(mask) {
  return sprite('wall|' + mask, 16, 24, 2, (P) => {
    const r = P.r, n = mask & 1, e = mask & 2, s = mask & 4, w = mask & 8, burnt = mask & 16;
    const across = e || w || !(n || s);
    if (across) {
      const x0 = w ? 0 : 2, x1 = e ? 16 : 14;
      r(x0, 15, x1 - x0, 9, EARTH); r(x0, 15, x1 - x0, 1, EARTH_L); r(x0, 22, x1 - x0, 2, EARTH_D);
      for (let x = x0 + (x0 ? 0 : 1); x < x1 - 1; x += 3) { const t = 5 + ((x * 7) % 3); r(x, t, 2, 15 - t + 1, STAKE); r(x + 1, t + 1, 1, 15 - t, STAKE_D); r(x, t - 1, 1, 1, STAKE); }
      r(x0, 10, x1 - x0, 1, STAKE_D);                                      // lashing rail
      if (n || s) { r(4, 6, 8, 10, EARTH); r(4, 6, 8, 1, EARTH_L); }       // a corner or a T
    }
    if (n || s) {
      // a run going north-south: seen end-on, the bank is a narrow ridge with stakes along its crest
      const y0 = n ? 0 : 8, y1 = s ? 24 : 22;
      r(3, y0 + 4, 10, y1 - y0 - 4, EARTH); r(3, y0 + 4, 10, 1, EARTH_L); r(11, y0 + 4, 2, y1 - y0 - 4, EARTH_D);
      for (let y = y0; y < y1 - 6; y += 3) { r(6, y, 4, 4, STAKE); r(8, y + 1, 2, 3, STAKE_D); r(6, y, 1, 1, '#d0aa6a'); }
    }
    if (burnt) { for (const [x, y, ww] of [[2, 7, 3], [8, 9, 2], [11, 6, 3], [4, 12, 4], [9, 13, 3]]) r(x, y, ww, 2, SOOT); r(6, 4, 2, 3, SOOT); }
  });
}
// level: +1 open, +2 the west postern (same gate, smaller roof)
function gateSprite(level) {
  return sprite('gate|' + level, 16, 26, 2, (P) => {
    const r = P.r, open = level & 1, post = level & 2;
    r(0, 17, 16, 9, EARTH); r(0, 17, 16, 1, EARTH_L); r(0, 24, 16, 2, EARTH_D);
    r(1, 6, 3, 19, WOOD_D); r(12, 6, 3, 19, WOOD_D); r(2, 6, 1, 19, WOOD); r(13, 6, 1, 19, WOOD);
    if (open) { r(4, 9, 8, 15, '#1e140b'); r(4, 9, 1, 15, '#8a5a2b'); r(11, 9, 1, 15, '#8a5a2b'); r(5, 22, 6, 2, '#3a2a1a'); }
    else { for (let x = 4; x < 12; x++) r(x, 9, 1, 15, x % 2 ? '#8a5a2b' : '#a0693a'); r(4, 13, 8, 1, WOOD_D); r(4, 19, 8, 1, WOOD_D); r(7, 15, 2, 2, '#d0b060'); }
    if (post) { r(0, 4, 16, 2, '#a98f48'); r(1, 3, 14, 1, '#c9ae5e'); }
    else { roofGable(P, 8, 0, 7, 1, 8, '#c9ae5e', '#a98f48', TEAMC[0].roofR); r(7, 0, 2, 1, TEAMC[0].trim); }
  });
}

/* ---------- world overlays ---------- */
function paintUnit(u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE;
  if (d.hero) { ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, 12, 6); ctx.stroke(); ctx.globalAlpha = 1; }
  basePaintUnit(u);
  if (d.hero) {
    hpBar(px - 13, py - 44, 26, u.hp / u.maxHp);
    ctx.fillStyle = '#17110c'; ctx.fillRect(px - 21, py - 47, 7, 7);
    ctx.fillStyle = '#f2c94c'; ctx.fillRect(px - 19, py - 47, 3, 7); ctx.fillRect(px - 21, py - 45, 7, 3);
  }
  if (u.poison > 0 && u.layer === 0) { ctx.fillStyle = '#9be36a'; ctx.globalAlpha = 0.8; ctx.fillRect(px + 5, py - 30 + (Math.floor(nowS * 4) % 3), 2, 2); ctx.globalAlpha = 1; }
  if (d.cap && u.cargo && u.cargo.length) {
    const an = shipAnchor(u.kind), y = py - an[1] - 4;
    ctx.font = '700 12px "Barlow Semi Condensed", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    const t = u.cargo.length + '/' + d.cap; ctx.strokeStyle = '#10201a'; ctx.strokeText(t, px, y); ctx.fillStyle = '#f3e8c9'; ctx.fillText(t, px, y);
    if (u.royal) { ctx.fillStyle = '#f2c94c'; ctx.fillRect(px - 6, y - 18, 12, 4); ctx.fillRect(px - 6, y - 22, 2, 4); ctx.fillRect(px - 1, y - 23, 2, 5); ctx.fillRect(px + 4, y - 22, 2, 4); }
  }
}
function paintBuilding(b) {
  basePaintBuilding(b);
  // the treasurer's house: gold trim and a strongbox sign
  if (b.kind === 'bendahari' && b.hp > 0) {
    const cx = (b.tx + b.size / 2) * TILE, cy = b.ty * TILE - 12;
    ctx.fillStyle = '#17110c'; ctx.fillRect(cx - 9, cy - 7, 18, 14); ctx.fillStyle = '#f2c94c'; ctx.fillRect(cx - 7, cy - 5, 14, 10); ctx.fillStyle = '#8a5a2b'; ctx.fillRect(cx - 7, cy - 1, 14, 2); ctx.fillStyle = '#17110c'; ctx.fillRect(cx - 1, cy - 2, 2, 4);
  }
  if (b.torch > G.t && b.hp > 0) {
    const w = b.size * TILE, px = b.tx * TILE, py = b.ty * TILE;
    for (let i = 0; i < 2 + b.size; i++) {
      const fx = px + 6 + hash2(b.id, i, 3) * (w - 12), fy = py + w * 0.25 + hash2(b.id, i, 4) * w * 0.4, h = 6 + ((Math.floor(nowS * 8) + i) % 3) * 3;
      ctx.fillStyle = '#e2562c'; ctx.fillRect(fx - 3, fy - h, 6, h); ctx.fillStyle = '#f6b33a'; ctx.fillRect(fx - 2, fy - h + 2, 4, h - 3); ctx.fillStyle = '#fff3a0'; ctx.fillRect(fx - 1, fy - 3, 2, 2);
    }
  }
}
function paintMission() {
  const M = G.M; if (!M) return;
  const pulse = 0.5 + 0.5 * Math.sin(nowS * 3);
  if (M.phase === 2) {
    // the open sea: the line the boats must cross
    const x = MS.exitX * TILE, y0 = MS.exitY * TILE, y1 = H * TILE;
    ctx.fillStyle = 'rgba(242,201,76,' + (0.08 + 0.08 * pulse).toFixed(3) + ')'; ctx.fillRect(0, y0, x, y1 - y0);
    ctx.strokeStyle = 'rgba(242,201,76,0.85)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -nowS * 20;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    for (let k = 0; k < 3; k++) {
      const ay = (MS.exitY + 3 + k * 3.5) * TILE, ax = x - 24 - ((nowS * 30 + k * 10) % 30);
      ctx.fillStyle = '#f2c94c'; ctx.fillRect(ax - 2, ay - 2, 12, 4); ctx.fillRect(ax - 5, ay - 6, 3, 12); ctx.fillRect(ax - 8, ay - 4, 3, 8); ctx.fillRect(ax - 10, ay - 2, 2, 4);
    }
    // boats waiting for the prince
    if (G.royalState() === 'land') for (const u of G.units) if (u.team === 0 && u.kind === 'olboat' && u.hp > 0) {
      ctx.strokeStyle = 'rgba(125,255,240,' + (0.4 + 0.5 * pulse).toFixed(2) + ')'; ctx.lineWidth = 2; ell(u.x * TILE, u.y * TILE + 2, 26 + pulse * 4, 11 + pulse * 2); ctx.stroke();
    }
  } else if (M.phase === 3 && !G.buildings.some(b => b.team === 0 && b.kind === 'towncentre')) {
    const x = 26 * TILE, y = 29 * TILE;
    ctx.strokeStyle = 'rgba(125,255,168,' + (0.35 + 0.4 * pulse).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
    ell(x, y, 58, 30); ctx.stroke(); ctx.setLineDash([]);
    ctx.drawImage(iconSprite('flag'), x - 8, y - 46);
  }
}
