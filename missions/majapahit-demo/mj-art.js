
/* ===== mj-art.js ===== */
/* Colours: Majapahit red for the fleet, Singapura teal (the Melaka art in Singapura's colours),
   Ayutthaya purple, the Orang Laut in the sea people's teal. The game's art draws team 0 as Melaka
   and team 1 as Majapahit, so the fleet (team 0) is drawn with the Majapahit art and Singapura
   (team 1) with the Melaka art, swapped in only while each sprite is painted. */
const MJ_RED = Object.assign({}, TEAMC[1]);
const SG_TEAM = { name: 'Singapura', main: '#1f9e9a', dark: '#146a67', trim: '#f2c94c', roofA: '#c9ae5e', roofB: '#a98f48', roofR: '#1d5a58', ring: '#7dfff0' };
// the current game picks art by civ: the player's Majapahit is civ 1 (red), Singapura stands in civ 0's place (teal)
Object.assign(TEAMC[0], SG_TEAM);
Object.assign(TEAMC[1], { ring: '#ffb28a' });
MINIC[0] = ['#1f9e9a', '#7dfff0']; MINIC[1] = ['#ff8a6a', '#ffd0b8'];
TEAMC[3] = { name: 'Ayutthaya', main: '#7b4bb3', dark: '#4e2d78', trim: '#f2c94c', roofA: '#b5523a', roofB: '#8e3d2a', roofR: '#3a1e14', ring: '#c9a3ff' };
Object.assign(MAIN.CIVC.ayu, { main: '#7b4bb3', dark: '#4e2d78', ring: '#c9a3ff' });
function sgArt(fn) {
  return fn();
}

/* ---------- people ---------- */
function unitSprite(kind, team, anim, f, tool) {
  const d = UD[kind], a = anim === 'work' ? 'idle' : anim, ff = anim === 'walk' ? f : Math.min(2, f);
  if (d && d.ayu) return MAIN.civUnitSprite('ayu', d.ayu, a, ff);
  if (d && d.big === 'chang') return MAIN.elephantSprite(a === 'attack' ? 'attack' : a, Math.min(a === 'walk' ? 3 : 1, f));
  if (d && d.aux) return AUX.auxUnitSprite('sg', d.aux, a, f);
  if (d && d.msgr) return messengerSprite(anim, anim === 'walk' ? f : Math.min(1, f));
  if (kind === 'obor') return SIEGE.torchSprite(1, anim === 'attack' ? 'light' : anim === 'walk' ? 'walk' : 'idle', anim === 'attack' ? Math.min(2, f) : f);
  return baseUnitSprite(kind, team, anim, f, tool);
}
/* the Utusan: a messenger dressed as a trader. Plain baju, a checked sarong, a batik headcloth,
   a carrying pole with two baskets of goods over his shoulder. 16x18 */
function messengerSprite(anim, f) {
  return sprite('utusan|' + anim + '|' + f, 16, 18, 2, (P) => {
    const r = P.r, walk = anim === 'walk', bob = walk && (f & 1) ? -1 : 0;
    const B = (x, y, w, h, c) => r(x, y + 2 + bob, w, h, c);
    for (const l of LEGS[walk ? f : 1]) { r(l[0], l[1] + 2, l[2], l[3], SKIN_D); r(l[0], l[1] + l[3] + 1, l[2], 1, '#2b1d12'); }
    // sarong, checked brown and cream
    B(5, 9, 6, 4, '#6b4a2e'); for (let x = 5; x < 11; x += 2) B(x, 10, 1, 1, '#c9b08a'); for (let x = 6; x < 11; x += 2) B(x, 12, 1, 1, '#c9b08a');
    // plain baju and arms
    B(5, 7, 6, 3, '#d8cfb4'); B(5, 9, 6, 1, '#b8ae92'); B(4, 8, 1, 3, '#d8cfb4'); B(11, 7, 1, 3, '#d8cfb4');
    // head with a batik headcloth (destar)
    B(6, 3, 4, 4, SKIN); B(6, 6, 4, 1, SKIN_D); B(9, 5, 1, 1, HAIR);
    B(5, 2, 6, 2, '#7a3b2e'); B(6, 1, 4, 1, '#7a3b2e'); B(6, 2, 1, 1, '#d9b45a'); B(9, 2, 1, 1, '#d9b45a'); B(10, 1, 2, 1, '#7a3b2e');
    // carrying pole over the shoulder, a basket at each end
    B(0, 6, 16, 1, WOOD); B(0, 7, 3, 3, '#c9a35a'); B(0, 7, 3, 1, '#e0c07a'); B(13, 7, 3, 3, '#c9a35a'); B(13, 7, 3, 1, '#e0c07a');
    B(1, 6, 1, 1, '#9a7838'); B(14, 6, 1, 1, '#9a7838');
  });
}

/* ---------- ships ---------- */
function shipSprite(u) {
  const d = UD[u.kind];
  if (u.kind === 'olboat') return AUX.auxShipSprite('sg', 'orangLaut');
  if (d && d.ayuShip) return MAIN.mainlandShip('ayu', d.ayuShip);
  if (u.kind === 'msgboat') return baseShipSprite({ kind: 'boat', team: 0 });
  return baseShipSprite(u);
}
function shipAnchor(kind, team) {
  const d = UD[kind];
  if (kind === 'olboat') return [34, 42];
  if (d && d.ayuShip) { const s = MAIN.mainlandShip('ayu', d.ayuShip); return [s.width >> 1, Math.round(s.height * 0.82)]; }
  if (kind === 'msgboat') return baseShipAnchor('boat', 0);
  return baseShipAnchor(kind, team);
}

/* ---------- buildings ---------- */
const EARTH = '#7a5a38', EARTH_L = '#94704a', EARTH_D = '#5a4128', STAKE = '#b08850', STAKE_D = '#7a5a30';
function buildingSprite(kind, team, level) {
  if (kind === 'cwall') return earthWallSprite(level || 0);
  if (kind === 'wall') return palisadeSprite(level || 0);
  if (kind === 'gate') return sgArt(() => cityGateSprite(level || 0));
  if (kind === 'bendahari') return baseBuildingSprite('house', 1, 2);
  if (kind === 'village') return baseBuildingSprite('village', 2, level);
  return baseBuildingSprite(kind, team, level);
}
// Singapura's earth rampart with a stake fence along its crest (the 14th-century earth wall on Fort Canning)
// mask bits: 1 north, 2 east, 4 south, 8 west
function earthWallSprite(mask) {
  return sprite('cwall|' + mask, 16, 24, 2, (P) => {
    const r = P.r, n = mask & 1, e = mask & 2, s = mask & 4, w = mask & 8;
    const across = e || w || !(n || s);
    if (across) {
      const x0 = w ? 0 : 2, x1 = e ? 16 : 14;
      r(x0, 13, x1 - x0, 11, EARTH); r(x0, 13, x1 - x0, 1, EARTH_L); r(x0, 22, x1 - x0, 2, EARTH_D); r(x0, 17, x1 - x0, 1, EARTH_D);
      for (let x = x0 + (x0 ? 0 : 1); x < x1 - 1; x += 3) { const t = 5 + ((x * 7) % 3); r(x, t, 2, 13 - t + 1, STAKE); r(x + 1, t + 1, 1, 13 - t, STAKE_D); r(x, t - 1, 1, 1, STAKE); }
      r(x0, 9, x1 - x0, 1, STAKE_D);
      if (n || s) { r(4, 5, 8, 10, EARTH); r(4, 5, 8, 1, EARTH_L); }
    }
    if (n || s) {
      const y0 = n ? 0 : 8, y1 = s ? 24 : 22;
      r(2, y0 + 4, 12, y1 - y0 - 4, EARTH); r(2, y0 + 4, 12, 1, EARTH_L); r(12, y0 + 4, 2, y1 - y0 - 4, EARTH_D);
      for (let y = y0; y < y1 - 6; y += 3) { r(6, y, 4, 4, STAKE); r(8, y + 1, 2, 3, STAKE_D); r(6, y, 1, 1, '#d0aa6a'); }
    }
  });
}
// the fleet's own palisade on Batam: a light fence of sharpened stakes
function palisadeSprite(mask) {
  return sprite('mjpal|' + mask, 16, 22, 2, (P) => {
    const r = P.r, n = mask & 1, e = mask & 2, s = mask & 4, w = mask & 8;
    const across = e || w || !(n || s);
    if (across) {
      const x0 = w ? 0 : 3, x1 = e ? 16 : 13;
      for (let x = x0; x < x1; x += 2) { const t = 6 + ((x * 5) % 3); r(x, t, 2, 20 - t, STAKE); r(x + 1, t + 1, 1, 19 - t, STAKE_D); r(x, t - 1, 1, 1, '#d0aa6a'); }
      r(x0, 11, x1 - x0, 1, '#5a3a1e'); r(x0, 16, x1 - x0, 1, '#5a3a1e');
    }
    if (n || s) { const y0 = n ? 0 : 6, y1 = s ? 22 : 20; for (let y = y0; y < y1 - 3; y += 2) { r(6, y, 4, 3, STAKE); r(8, y + 1, 2, 2, STAKE_D); } }
  });
}
// a city gate in the rampart: timber towers either side, a pitched roof; level 1 = open
function cityGateSprite(level) {
  return sprite('cgate|' + level, 16, 26, 2, (P) => {
    const r = P.r, open = level & 1;
    r(0, 17, 16, 9, EARTH); r(0, 17, 16, 1, EARTH_L); r(0, 24, 16, 2, EARTH_D);
    r(1, 6, 3, 19, WOOD_D); r(12, 6, 3, 19, WOOD_D); r(2, 6, 1, 19, WOOD); r(13, 6, 1, 19, WOOD);
    if (open) { r(4, 9, 8, 15, '#1e140b'); r(4, 9, 1, 15, '#8a5a2b'); r(11, 9, 1, 15, '#8a5a2b'); r(5, 22, 6, 2, '#3a2a1a'); }
    else { for (let x = 4; x < 12; x++) r(x, 9, 1, 15, x % 2 ? '#8a5a2b' : '#a0693a'); r(4, 13, 8, 1, WOOD_D); r(4, 19, 8, 1, WOOD_D); r(7, 15, 2, 2, '#d0b060'); }
    roofGable(P, 8, 0, 7, 1, 8, '#c9ae5e', '#a98f48', TEAMC[0].roofR); r(7, 0, 2, 1, TEAMC[0].trim);
  });
}

/* ---------- world overlays ---------- */
function paintUnit(u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE, M = G.M;
  // the flagship: a gold ring so it is easy to find
  if (M && u === M.flag) { ctx.strokeStyle = 'rgba(242,201,76,0.8)'; ctx.lineWidth = 2; ell(px, py + 4, 34, 14); ctx.stroke(); }
  basePaintUnit(u);
  if (d.cap && u.cargo && u.cargo.length) {
    const an = shipAnchor(u.kind), y = py - an[1] - 4;
    ctx.font = '700 12px "Barlow Semi Condensed", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    const t = u.cargo.length + '/' + d.cap; ctx.strokeStyle = '#10201a'; ctx.strokeText(t, px, y); ctx.fillStyle = '#f3e8c9'; ctx.fillText(t, px, y);
  }
  if (u.poison > 0 && u.layer === 0) { ctx.fillStyle = '#9be36a'; ctx.globalAlpha = 0.8; ctx.fillRect(px + 5, py - 30 + (Math.floor(nowS * 4) % 3), 2, 2); ctx.globalAlpha = 1; }
  // the messenger: a little scroll over his head, grey once he has been found out
  if (d.msgr || (u.cargo && u.cargo.some(c => UD[c.kind].msgr))) {
    const y = py - (u.layer === 1 ? shipAnchor(u.kind)[1] + 16 : 46);
    ctx.fillStyle = '#17110c'; ctx.fillRect(px - 7, y - 1, 14, 9);
    ctx.fillStyle = u.disguise === false || (M && M.msgr && M.msgr.disguise === false) ? '#8a8a8a' : '#f3e8c9'; ctx.fillRect(px - 5, y + 1, 10, 5);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(px - 1, y + 2, 2, 3);
  }
}
function paintBuilding(b) {
  basePaintBuilding(b);
  const w = b.size * TILE, px = b.tx * TILE, py = b.ty * TILE;
  if (b.torch > G.t && b.hp > 0) {
    for (let i = 0; i < 2 + b.size; i++) {
      const fx = px + 6 + hash2(b.id, i, 3) * (w - 12), fy = py + w * 0.25 + hash2(b.id, i, 4) * w * 0.4, h = (b.size === 1 ? 10 : 6) + ((Math.floor(nowS * 8) + i) % 3) * 3;
      ctx.fillStyle = '#e2562c'; ctx.fillRect(fx - 3, fy - h, 6, h); ctx.fillStyle = '#f6b33a'; ctx.fillRect(fx - 2, fy - h + 2, 4, h - 3); ctx.fillStyle = '#fff3a0'; ctx.fillRect(fx - 1, fy - 3, 2, 2);
    }
  }
  // the treasurer's house: gold trim and a strongbox sign
  if (b.kind === 'bendahari') {
    const cx = px + w / 2, cy = py - 12;
    ctx.fillStyle = '#17110c'; ctx.fillRect(cx - 9, cy - 7, 18, 14); ctx.fillStyle = '#f2c94c'; ctx.fillRect(cx - 7, cy - 5, 14, 10); ctx.fillStyle = '#8a5a2b'; ctx.fillRect(cx - 7, cy - 1, 14, 2); ctx.fillStyle = '#17110c'; ctx.fillRect(cx - 1, cy - 2, 2, 4);
  }
  // the Orang Laut village shows whose side it is on
  if (b.kind === 'village' && G.M) {
    const st = G.M.ol, col = st === 'ally' ? '#d0392f' : st === 'hostile' ? '#1f9e9a' : '#f3e8c9';
    const fx = px + w - 10, fy = py - 18;
    ctx.fillStyle = '#2a1d14'; ctx.fillRect(fx, fy, 2, 30);
    ctx.fillStyle = col; ctx.fillRect(fx + 2, fy, 14, 9); if (st === 'ally') { ctx.fillStyle = '#f3e8c9'; ctx.fillRect(fx + 2, fy + 5, 14, 4); }
  }
}
function paintMission() {
  const M = G.M; if (!M) return;
  const pulse = 0.5 + 0.5 * Math.sin(nowS * 3);
  const ring = (x, y, rx, ry, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -nowS * 12; ell(x * TILE, y * TILE, rx, ry); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; };
  const flag = (x, y, red) => {
    const fx = x * TILE, fy = y * TILE - 30 - pulse * 3;
    ctx.fillStyle = '#2a1d14'; ctx.fillRect(fx, fy, 2, 28);
    ctx.fillStyle = red ? '#d0392f' : '#f2c94c'; ctx.fillRect(fx + 2, fy, 14, 5); ctx.fillStyle = '#f3e8c9'; ctx.fillRect(fx + 2, fy + 5, 14, 5);
  };
  if (M.phase === 1 && !M.hut) { ring(ISLE.cx - 3, ISLE.cy + 0.5, 120, 54, 'rgba(242,201,76,' + (0.35 + 0.4 * pulse).toFixed(2) + ')'); flag(ISLE.cx - 3, ISLE.cy + 0.5); }
  if (M.phase === 2 && M.talk < TALK[G.diff]) {
    const u = M.msgr, tr = G.byId.get(M.treasury);
    if (u && u.hp > 0 && !u.boarded && inCity(u.x, u.y) && tr) {
      // the talk: an arc over the treasurer's house
      const cx = tr.x * TILE, cy = tr.ty * TILE - 30, k = M.talk / TALK[G.diff];
      ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 12, -1.5708, -1.5708 + 6.2832 * k); ctx.stroke();
    } else ring(GATE_S.out[0], GATE_S.out[1] + 0.3, 30, 14, 'rgba(242,201,76,' + (0.35 + 0.45 * pulse).toFixed(2) + ')');
  }
  if (M.phase === 3 && !M.cards.closing) {
    const pal = G.byId.get(M.palace);
    if (pal) {
      ring(pal.x, pal.y + 0.6, 92 + pulse * 6, 48 + pulse * 3, M.bannerFoes ? 'rgba(255,122,107,.7)' : 'rgba(242,201,76,.8)');
      if (M.banner > 0) {
        const x = pal.x * TILE - 30, y = pal.ty * TILE - 58;
        ctx.fillStyle = '#17110c'; ctx.fillRect(x, y, 60, 8); ctx.fillStyle = '#d0392f'; ctx.fillRect(x + 1, y + 1, 58 * M.banner / BANNER_T, 3); ctx.fillStyle = '#f3e8c9'; ctx.fillRect(x + 1, y + 4, 58 * M.banner / BANNER_T, 3);
      }
      flag(pal.x + 1.5, pal.y - 1, true);
    }
  }
}

/* ---------- a thrown torch: a spinning stick with a flame on its end ---------- */
const _drawArrowBase = drawArrow;
drawArrow = function (a) {
  if (a.k === 'fire') {
    const p = a.t / a.dur, lift = Math.sin(p * Math.PI) * 0.6;
    const x = (a.x0 + (a.x1 - a.x0) * p) * TILE, y = (a.y0 + (a.y1 - a.y0) * p - lift) * TILE - 8;
    const spr = SIEGE.fireArrowSprite(Math.floor(nowS * 12) & 1);
    const ang = Math.atan2((a.y1 - a.y0) * TILE - Math.cos(p * Math.PI) * 0.6 * Math.PI * TILE, (a.x1 - a.x0) * TILE);
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(ang); ctx.drawImage(spr, -spr.width + 4, -spr.height / 2, spr.width * 0.75, spr.height * 0.75); ctx.restore();
    return;
  }
  if (a.k !== 'torch') return _drawArrowBase(a);
  const p = a.t / a.dur, lift = Math.sin(p * Math.PI) * 0.8;
  const x = (a.x0 + (a.x1 - a.x0) * p) * TILE, y = (a.y0 + (a.y1 - a.y0) * p - lift) * TILE - 8;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(p * 9);
  ctx.fillStyle = '#6a4424'; ctx.fillRect(-5, -1, 8, 2);
  ctx.fillStyle = '#e2562c'; ctx.fillRect(3, -3, 5, 6); ctx.fillStyle = '#f6b33a'; ctx.fillRect(4, -2, 3, 4); ctx.fillStyle = '#fff3a0'; ctx.fillRect(5, -1, 1, 2);
  ctx.restore();
};
