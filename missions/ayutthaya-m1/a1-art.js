/* ===== a1-art.js ===== */
/* Both sides are Tai, drawn on the game's Ayutthaya roster (AYART). The enemy is told apart by colour:
   bandits in dusty undyed cotton, the rival lord's men in his dark red. U Thong's soldiers set out as brown levies and
   take up Ayutthaya's purple once the Sala Klang stands on the island. */
const AY_PURPLE = ['#7b4bb3', '#9b6fd0', '#4e2d78', '#3a1f5c'];
const APAL = {
  bandit: ['#5f5c48', '#7a7660', '#403e30', '#2e2d24'],
  rival: ['#9a3426', '#b84a38', '#6a2018', '#4e1610'],
  lavo: ['#c08a2a', '#d8a848', '#7a5418', '#5a3e12'],
  suphan: ['#2f8a5a', '#4aa874', '#1d5a3a', '#14402a'],
  levy: ['#8a6b4a', '#a8885e', '#5e4630', '#4a3424']
};
const RC = {};
function hexRGB(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
// swap exact palette colours in a sprite (cached); `grey` washes everything toward stone grey instead
function recolor(src, pal, key, grey) {
  const k = key + '|' + pal; if (RC[k]) return RC[k];
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const x = c.getContext('2d'); x.drawImage(src, 0, 0);
  const img = x.getImageData(0, 0, c.width, c.height), d = img.data;
  const from = AY_PURPLE.map(hexRGB), to = (APAL[pal] || APAL.rival).map(hexRGB);
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    if (grey) { const v = (d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15) * 0.85 + 18; d[i] = d[i] * 0.3 + v * 0.7; d[i + 1] = d[i + 1] * 0.3 + v * 0.7; d[i + 2] = d[i + 2] * 0.3 + v * 0.72; continue; }
    for (let j = 0; j < from.length; j++) if (d[i] === from[j][0] && d[i + 1] === from[j][1] && d[i + 2] === from[j][2]) { d[i] = to[j][0]; d[i + 1] = to[j][1]; d[i + 2] = to[j][2]; break; }
  }
  x.putImageData(img, 0, 0);
  return (RC[k] = c);
}
let SCENE_AGE = 0;
function curAge() { return SCENE_AGE || (typeof G !== 'undefined' && G && G.age ? G.age[0] : 2); }
// brown levies until the city is founded (story scenes set SCENE_AGE 1 for the journey)
const LEVY = { keris: 1, tombak: 1, archer: 1, namai: 1 };
function levyLook() { if (SCENE_AGE) return SCENE_AGE === 1; const M = typeof G !== 'undefined' && G && G.M; return !!M && !M.settled && M.phase < 3; }

/* ---------- people ---------- */
function unitSprite(kind, team, anim, f, tool) {
  const d = UD[kind];
  if (kind === 'uthong') return uThongSprite(anim, f);
  if (kind === 'bride') return brideSprite(anim, f);
  if (d && d.lord) return lordSprite(anim, f);
  if (d && d.ay) return recolor(baseUnitSprite(d.ay, team, anim, f, tool), d.pal, 'u|' + d.ay + '|' + anim + '|' + f);
  if (team === 1) return recolor(baseUnitSprite(kind, team, anim, f, tool), 'rival', 'u|' + kind + '|' + anim + '|' + f);
  if (team === 0 && LEVY[kind] && levyLook()) return recolor(baseUnitSprite(kind, team, anim, f, tool), 'levy', 'u|' + kind + '|' + anim + '|' + f + '|' + (tool || ''));
  return baseUnitSprite(kind, team, anim, f, tool);
}
/* U Thong: the twin-sword fighter in white and gold, with a tall gold chada crown */
// button and panel pictures follow the levy look as well: the main game caches them per kind, so the key carries the look
unitIcon = function (kind, team) {
  const lv = team === 0 && LEVY[kind] && levyLook();
  return dataURL('ui|' + kind + CV(team) + (lv ? '|levy' : ''), () => fitIcon(UD[kind].layer ? shipSprite({ kind, team }) : unitSprite(kind, team, 'idle', 1, ''), 44));
};
function uThongSprite(anim, f) {
  const a = anim === 'work' ? 'idle' : anim;
  const base = baseUnitSprite('keris', 0, a, f, '');
  return sprite('uthong|' + a + '|' + f, 16, 22, 2, (P) => {
    P.x.drawImage(base, 0, 4, base.width / 2, base.height / 2);
    const r = P.r, bob = (a === 'walk' && (f === 1 || f === 3)) ? -1 : 0;
    // white jacket with a gold collar over the purple
    r(5, 11 + bob, 6, 3, '#f1ece0'); r(5, 11 + bob, 6, 1, GOLD); r(7, 12 + bob, 2, 1, GOLD); r(5, 14 + bob, 6, 1, GOLD_D);
    // the chada: gold tiers rising to a spire
    r(6, 6 + bob, 4, 2, GOLD); r(6, 7 + bob, 4, 1, GOLD_D); r(7, 4 + bob, 2, 2, GOLD); r(7, 2 + bob, 2, 2, '#fff0a0'); r(8, 1 + bob, 1, 1, GOLD); r(7, 5 + bob, 1, 1, '#c8322a');
  });
}
/* the bride of Suphanburi: a village woman in red silk with a gold headdress */
function brideSprite(anim, f) {
  const a = anim === 'work' || anim === 'attack' ? 'idle' : anim;
  const base = baseUnitSprite('villager', 0, a, a === 'walk' ? f : 0, '');
  return sprite('bride|' + a + '|' + f, 16, 20, 2, (P) => {
    P.x.drawImage(base, 0, 2, base.width / 2, base.height / 2);
    const r = P.r, bob = (a === 'walk' && (f === 1 || f === 3)) ? -1 : 0;
    r(5, 9 + bob, 6, 4, '#b8322a'); r(5, 9 + bob, 6, 1, GOLD); r(6, 13 + bob, 4, 2, '#8a2018'); r(6, 12 + bob, 1, 1, GOLD);
    r(6, 3 + bob, 4, 1, GOLD); r(7, 2 + bob, 2, 1, GOLD); r(7, 1 + bob, 2, 1, '#fff0a0');
  });
}
/* the rival lord on his war elephant under a red tiered umbrella */
function lordSprite(anim, f) {
  const a = anim === 'work' ? 'idle' : anim;
  const el = recolor(baseUnitSprite('chang', 1, a, f, ''), 'rival', 'u|chang|' + a + '|' + f);
  return sprite('rvlord|' + a + '|' + f, el.width / 2, el.height / 2 + 8, 2, (P) => {
    P.x.drawImage(el, 0, 8, el.width / 2, el.height / 2);
    const r = P.r, cx = (el.width / 4) | 0;
    r(cx, 1, 1, 13, GOLD_D);
    for (let i = 0; i < 2; i++) { const w = 9 - i * 4, y = 5 - i * 2; r(cx - (w >> 1), y, w, 2, '#b3202a'); r(cx - (w >> 1), y + 1, w, 1, '#7a1414'); r(cx - (w >> 1), y + 1, 1, 1, GOLD); r(cx + (w >> 1), y + 1, 1, 1, GOLD); }
    r(cx, 0, 1, 1, GOLD);
  }, false);
}

/* ---------- ships ---------- */
function shipSprite(u) {
  const d = UD[u.kind], base = baseShipSprite(u);
  if (u.team === 1) return recolor(base, (d && d.pal) || 'bandit', 's|' + u.kind);
  if (u.kind === 'goldboat') return goldBoat(base);
  return base;
}
function goldBoat(base) {
  return sprite('goldboat', base.width / 2, base.height / 2, 2, (P) => {
    P.x.drawImage(base, 0, 0, base.width / 2, base.height / 2);
    const w = base.width / 2, h = base.height / 2, y = Math.round(h * 0.62);
    for (const dx of [-6, -1, 4]) { P.r((w >> 1) + dx, y - 3, 4, 3, '#c9a35a'); P.r((w >> 1) + dx, y - 3, 4, 1, GOLD); }
  }, false);
}

/* ---------- buildings ---------- */
let CUR_B = null;
function buildingSprite(kind, team, level) {
  const b = CUR_B;
  if (kind === 'hall') { const s = civBuildingSprite('towncentre', AYU_CIV, level); return b && b.town ? recolor(s, TOWNS[b.town].col, 'b|hall') : s; }
  const s = team === 2 ? civBuildingSprite(kind, AYU_CIV, level) : baseBuildingSprite(kind, team, level);
  if (b && b.old) return recolor(s, 'rival', 'b|old|' + kind, true);
  if (b && b.town) return recolor(s, TOWNS[b.town].col, 'b|' + kind);
  if (team === 1 && !BD[kind].wall) return recolor(s, 'rival', 'b|' + kind);
  return s;
}

/* ---------- world overlays ---------- */
function paintBuilding(b) {
  CUR_B = b; try { basePaintBuilding(b); } finally { CUR_B = null; }
  const M = G.M; if (!M) return;
  const w = b.size * TILE, x = b.tx * TILE, y = b.ty * TILE;
  if (b.team === 0 && b.kind === 'towncentre' && M.aging) {
    const A = M.aging, p = 1 - A.left / A.tot;
    ctx.fillStyle = '#17110c'; ctx.fillRect(x + 6, y - 14, w - 12, 6); ctx.fillStyle = '#f2c94c'; ctx.fillRect(x + 7, y - 13, Math.round((w - 14) * p), 4);
  }
  // a town that has joined flies Ayutthaya's red flag beside its hall
  if (b.kind === 'hall' && b.town && M.towns[b.town] && M.towns[b.town].st === 'joined') {
    const fx = x + w - 4, fy = y - 18;
    ctx.fillStyle = '#5e3b1c'; ctx.fillRect(fx, fy, 2, 30); ctx.fillStyle = '#c8322a'; ctx.fillRect(fx + 2, fy, 14, 9); ctx.fillStyle = '#8a2018'; ctx.fillRect(fx + 2, fy + 8, 14, 1);
  }
  // the coronation: a gold ring fills round the Wang while U Thong stands there
  if (b.id === M.palace && M.crown > 0 && M.crown < CROWN) {
    const p = M.crown / CROWN;
    ctx.fillStyle = '#17110c'; ctx.fillRect(x + 4, y - 16, w - 8, 7); ctx.fillStyle = '#f2c94c'; ctx.fillRect(x + 5, y - 15, Math.round((w - 10) * p), 5);
  }
}
function paintUnit(u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE, star = d.hero || d.foeHero, big = d.lord;
  if (star) { ctx.strokeStyle = u.team === 0 ? '#f2c94c' : '#ff8a6b'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, big ? 20 : 12, big ? 9 : 6); ctx.stroke(); ctx.globalAlpha = 1; }
  if (d.vip && u.layer === 0) { ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ell(px, py + 3, 12, 6); ctx.stroke(); ctx.setLineDash([]); }
  basePaintUnit(u);
  if (star) {
    const top = py - (big ? 84 : 52);
    hpBar(px - 13, top + 2, 26, u.hp / u.maxHp);
    ctx.fillStyle = '#17110c'; ctx.fillRect(px - 21, top - 1, 7, 7);
    ctx.fillStyle = u.team === 0 ? '#f2c94c' : '#ff8a6b'; ctx.fillRect(px - 19, top - 1, 3, 7); ctx.fillRect(px - 21, top + 1, 7, 3);
  }
  if (u.team === 1 && u.order.t === 'rland' && u.order.troops && u.order.s === 'in') {
    const t = u.order.troops.length + ' aboard', y = py - 40;
    ctx.font = '700 12px "Barlow Semi Condensed", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#10201a'; ctx.strokeText(t, px, y); ctx.fillStyle = '#ffb3a8'; ctx.fillText(t, px, y);
  }
}
// under everything: the flood plain (pale paddy, or water in the rains) and the bamboo bridges
function paintGround(x0, x1, y0, y1) {
  const M = G.M; if (!M || !G.flood) return;
  const wet = M.rainOn, rise = wet ? Math.min(1, (M.t - (M.rainEnd - RAIN.len)) / 8, (M.rainEnd - M.t) / 8) : 0;
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const i = ty * W + tx;
    if (G.flood[i]) {
      if (wet) {
        ctx.fillStyle = 'rgba(74,143,176,' + (0.62 * rise).toFixed(2) + ')'; ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
        const h = hash2(tx, ty, 52), ph = (nowS * 0.9 + h * 5) % 2;
        if (ph < 0.7) { ctx.fillStyle = 'rgba(200,236,246,' + (0.6 * rise).toFixed(2) + ')'; ctx.fillRect(tx * TILE + Math.floor(h * 20) + 4, ty * TILE + Math.floor(hash2(tx, ty, 53) * 22) + 5, 6, 2); }
      } else if ((tx + ty) % 2 === 0) { ctx.fillStyle = 'rgba(216,232,112,0.10)'; ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE); }
    }
    if (G.bridge && G.bridge[i]) {
      ctx.fillStyle = '#4a8fb0'; ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
      for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? '#b89a52' : '#c9ae62'; ctx.fillRect(tx * TILE + k * 8, ty * TILE + 2, 7, TILE - 4); ctx.fillStyle = '#7a5a2a'; ctx.fillRect(tx * TILE + k * 8 + 6, ty * TILE + 2, 1, TILE - 4); }
      ctx.fillStyle = '#5e3b1c'; ctx.fillRect(tx * TILE, ty * TILE + 1, TILE, 2); ctx.fillRect(tx * TILE, ty * TILE + TILE - 3, TILE, 2);
    }
  }
}
// on top: rain, where to go next, where raids come from
function paintMission() {
  const M = G.M; if (!M) return;
  const pulse = 0.5 + 0.5 * Math.sin(nowS * 3);
  const arrow = (wx, wy, col) => {
    ctx.fillStyle = col;
    const x = wx * TILE, y = wy * TILE - 40 - pulse * 8;
    ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.lineTo(x, y + 14); ctx.closePath(); ctx.fill();
    ctx.fillRect(x - 4, y - 12, 8, 12);
  };
  const gold = 'rgba(242,201,76,' + (0.55 + 0.4 * pulse).toFixed(2) + ')';
  if (M.phase === 1) arrow(ISLE.x, ISLE.y, gold);
  if (M.phase >= 3 && M.phase < 5) for (const id in M.towns) { const T0 = M.towns[id]; if (T0.st !== 'joined') arrow(T0.x, T0.y - 1, gold); }
  if (M.phase === 5 && M.palace) { const p = G.byId.get(M.palace); if (p && M.crown < CROWN) arrow(p.x, p.y - 1.5, gold); }
  // raid warning arrows at the map edge, from 20 s out
  if ((M.phase === 3 || M.phase === 4) && M.next - M.t <= 20) {
    const R = RIVAL_RAIDS[Math.min(M.raid, RIVAL_RAIDS.length - 1)];
    ctx.fillStyle = 'rgba(224,82,74,' + (0.35 + 0.5 * pulse).toFixed(2) + ')';
    for (const e of Object.keys(R.land || {})) {
      const E = ENTRY[e], x = E.x * TILE, y = (E.y - 2.5) * TILE;
      for (let k = 0; k < 3; k++) { const ay = y + k * 22 + ((nowS * 30) % 22); ctx.beginPath(); ctx.moveTo(x - 14, ay); ctx.lineTo(x + 14, ay); ctx.lineTo(x, ay + 12); ctx.closePath(); ctx.fill(); }
    }
  }
  if (M.rainOn || (M.rainAt && M.rainAt - M.t < 6 && !M.rainDone)) {
    const k = M.rainOn ? 1 : Math.max(0, 1 - (M.rainAt - M.t) / 6);
    const vx = cam.x, vy = cam.y, vw = view.w / view.zoom, vh = view.h / view.zoom;
    ctx.fillStyle = 'rgba(20,34,48,' + (0.18 * k).toFixed(2) + ')'; ctx.fillRect(vx, vy, vw, vh);
    ctx.fillStyle = 'rgba(190,220,236,' + (0.45 * k).toFixed(2) + ')';
    const n = Math.floor(vw * vh / 2600 * k);
    for (let i = 0; i < n; i++) {
      const h1 = hash2(i, 7, 11), h2 = hash2(i, 9, 13), sp = 300 + h2 * 160;
      const x = vx + ((h1 * vw + nowS * 60) % vw), y = vy + ((h2 * vh + nowS * sp) % vh);
      ctx.fillRect(Math.round(x), Math.round(y), 1, 7);
    }
  }
}
