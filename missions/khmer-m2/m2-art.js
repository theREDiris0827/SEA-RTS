/* ===== m2-art.js ===== */
/* Drawing for mission 2: King Ponhea Yat and the monks (from the Gates of Angkor battle, khmer-demo/src/km-art.js),
   the flood plain, the flood water as it spreads, and the marks for the palace spot and the villages.
   Every function here wraps the game's own one and falls back to it. */

/* ---------- Things you can tweak ---------- */
const FLOODART = {
  plain: 'rgba(70,140,200,0.22)',     // the tint on ground that floods
  edge: 'rgba(150,215,240,0.55)',     // the dotted line where the flood plain ends
  water: [75, 150, 185],              // flood water colour
  waterA: 0.62,                       // how see-through the flood water is
  warnA: 0.35                         // the red tint on buildings that would flood, while the river rises
};
const KBLUE = '#2f6fd0', KBLUE_D = '#1c4590';
const SAFF = '#e0882a', SAFF_D = '#b8661c', SAFF_L = '#f2a64a';

/* King Ponhea Yat on foot: a Bayon swordsman with a gold mukuta crown, under a gold royal parasol. 20x30 */
function ponheaSprite(anim, f) {
  return sprite('ponhea|' + anim + '|' + f, 20, 30, 2, (P) => {
    const s = KMART.khmerUnitSprite('sword', anim, f);
    P.x.drawImage(s, 2, 11, s.width / 2, s.height / 2);
    const r = P.r, bob = anim === 'walk' && (f === 1 || f === 3) ? -1 : 0;
    r(7, 20 + bob, 6, 1, GOLD); r(7, 23 + bob, 6, 1, GOLD_D);
    r(8, 12 + bob, 4, 2, GOLD); r(9, 10 + bob, 2, 2, GOLD); r(9, 9 + bob, 2, 1, GOLD_D); r(10, 8 + bob, 1, 1, GOLD);
    r(8, 14 + bob, 4, 1, GOLD_D);
    r(4, 3, 1, 18 + bob, WOOD_D);
    r(0, 3, 10, 2, GOLD); r(1, 2, 8, 1, GOLD); r(2, 1, 6, 1, '#f6e08a'); r(4, 0, 2, 1, GOLD_D);
    for (let x = 0; x < 10; x += 2) r(x, 5, 1, 1, KBLUE);
  });
}
/* the monks: shaven heads, saffron robes, one bare shoulder; the abbot carries his fan. 26x18 */
function monksSprite(f) {
  // abbot at the back and centre, a monk on each side a little in front; a clear gap between them so the group reads at a glance
  return sprite('monks3|' + f, 28, 20, 2, (P) => {
    const r = P.r, SK = '#d9a066', SKD = '#b97a46';
    const monk = (x, y, ph, abbot) => {
      const ff = (f + ph) & 3, bob = (ff === 1 || ff === 3) ? -1 : 0, y0 = y + bob;
      const st = [[1, 4], [2, 3], [2, 4], [1, 3]][ff];
      r(x + st[0], y + 13, 2, 1, SKD); r(x + st[1], y + 13, 2, 1, SKD);              // bare feet
      r(x + 1, y0 + 4, 7, 9, SAFF); r(x + 1, y0 + 12, 7, 1, SAFF_D);                  // robe, hem
      r(x + 3, y0 + 4, 1, 8, SAFF_L); r(x + 6, y0 + 6, 1, 6, SAFF_D);                 // folds
      for (let k = 0; k < 5; k++) r(x + 1 + k, y0 + 5 + k, 2, 1, SAFF_D);             // sash from the left shoulder to the right hip
      r(x + 6, y0 + 4, 2, 3, SK); r(x + 7, y0 + 6, 1, 2, SKD);                        // bare right shoulder and arm
      r(x + 3, y0 + 3, 2, 1, SKD);                                                    // neck
      r(x + 2, y0, 4, 4, SK); r(x + 2, y0, 4, 1, '#c08a5a'); r(x + 1, y0 + 2, 1, 1, SKD); r(x + 6, y0 + 2, 1, 1, SKD); r(x + 5, y0 + 2, 1, 1, HAIR); // shaven head, ears, eye
      if (abbot) { r(x, y0 + 4, 1, 9, WOOD_D); r(x - 1, y0 + 2, 3, 1, SAFF_D); r(x - 1, y0 + 3, 3, 1, SAFF); }  // the abbot's staff and fan
      else r(x + 7, y0 + 9, 2, 2, '#3a2a1c');                                         // alms bowl
    };
    monk(10, 0, 1, true);
    monk(1, 4, 0, false);
    monk(19, 4, 2, false);
  });
}

/* ---------- people ---------- */
const _m2us = unitSprite;
unitSprite = function (kind, team, anim, f, tool) {
  const a = anim === 'work' ? 'idle' : anim === 'heal' ? 'attack' : anim;
  if (kind === 'ponhea') return ponheaSprite(a, a === 'walk' ? f % 4 : Math.min(2, f));
  if (kind === 'sangha') return monksSprite(a === 'walk' ? f % 4 : 0);
  return _m2us(kind, team, anim, f, tool);
};
const _m2ui = unitIcon;
unitIcon = function (kind, team) {
  if (kind === 'ponhea') return dataURL('ui|ponhea', () => fitIcon(ponheaSprite('idle', 0), 44));
  if (kind === 'sangha') return dataURL('ui|sangha', () => fitIcon(monksSprite(0), 44));
  return _m2ui(kind, team);
};
const _m2pu = paintUnit;
paintUnit = function (u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE;
  if (d.hero) { ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, 12, 6); ctx.stroke(); ctx.globalAlpha = 1; }
  if (u.kind === 'sangha') { ctx.strokeStyle = '#f2a64a'; ctx.lineWidth = 2; ctx.globalAlpha = 0.7; ell(px, py + 3, 15, 6); ctx.stroke(); ctx.globalAlpha = 1; }
  _m2pu(u);
  // wading through flood water
  if (u.layer === 0 && G.M && G.M.flood && isWet(G, Math.floor(u.x), Math.floor(u.y))) {
    const ph = Math.floor(nowS * 3 + u.id) % 2;
    ctx.fillStyle = 'rgba(75,150,185,0.85)'; ctx.fillRect(px - 9, py + 1, 18, 5);
    ctx.fillStyle = 'rgba(220,240,248,0.75)'; ctx.fillRect(px - 8 + ph * 2, py + 1, 6, 1); ctx.fillRect(px + 2 - ph * 2, py + 1, 5, 1);
  }
  if (d.hero) { const top = py - 46; hpBar(px - 13, top + 2, 26, u.hp / u.maxHp); }
  // the monks blessing a village
  if (u.order.t === 'bless' && u.order.w > 0) { ctx.fillStyle = '#17110c'; ctx.fillRect(px - 11, py - 30, 22, 4); ctx.fillStyle = '#f2a64a'; ctx.fillRect(px - 10, py - 29, Math.round(20 * Math.min(1, u.order.w / KM2.blessTime)), 2); }
};

/* ---------- the flood plain and the flood ---------- */
function paintGround(x0, x1, y0, y1) {
  const M = G && G.M; if (!M) return;
  const pm = plainMask(G), reach = floodReach(G);
  const d = reach >= 0 ? floodDepth(G) : null;
  const [r, g, b] = FLOODART.water;
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const i = ty * W + tx; if (!pm[i]) continue;
    const px = tx * TILE, py = ty * TILE;
    if (d && d[i] >= 0 && d[i] <= reach) {
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + FLOODART.waterA + ')'; ctx.fillRect(px, py, TILE, TILE);
      const h = hash2(tx, ty, 9), ph = (nowS * 0.9 + h * 5) % 2;
      if (ph < 0.8) { ctx.fillStyle = 'rgba(225,245,250,0.55)'; ctx.fillRect(px + Math.floor(h * 20) + 4, py + Math.floor(hash2(tx, ty, 10) * 22) + 4, 6, 2); }
      // the water's leading edge
      if (d[i] > reach - 1) { ctx.fillStyle = 'rgba(240,250,255,0.5)'; ctx.fillRect(px, py, TILE, 2); }
    } else {
      ctx.fillStyle = FLOODART.plain; ctx.fillRect(px, py, TILE, TILE);
      // a fine diagonal hatch: wet, low ground
      if ((tx + ty) % 2 === 0) { ctx.fillStyle = 'rgba(170,220,245,0.30)'; ctx.fillRect(px + 6, py + 22, 8, 2); ctx.fillRect(px + 18, py + 10, 8, 2); }
    }
    // the dotted edge of the plain
    ctx.fillStyle = FLOODART.edge;
    const dot = (ax, ay, w, h) => { for (let k = 0; k < Math.max(w, h); k += 8) ctx.fillRect(ax + (w > h ? k : 0), ay + (h > w ? k : 0), w > h ? 4 : 2, h > w ? 4 : 2); };
    if (tx > 0 && !pm[i - 1] && G.isLand(tx - 1, ty)) dot(px, py, 2, TILE);
    if (tx < W - 1 && !pm[i + 1] && G.isLand(tx + 1, ty)) dot(px + TILE - 2, py, 2, TILE);
    if (ty > 0 && !pm[i - W] && G.isLand(tx, ty - 1)) dot(px, py, TILE, 2);
    if (ty < H - 1 && !pm[i + W] && G.isLand(tx, ty + 1)) dot(px, py + TILE - 2, TILE, 2);
  }
}
function flagAt(x, y, bob) { ctx.drawImage(iconSprite('flag'), x - 8, y - 46 + (bob || 0)); }
function paintMission() {
  const M = G.M; if (!M) return;
  const b4 = Math.sin(nowS * 4) * 4;
  // where the palace should go, until it is placed
  if (!G.buildings.some(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0)) {
    ctx.globalAlpha = 0.6; ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.strokeRect(TC_SPOT.x * TILE + 2, TC_SPOT.y * TILE + 2, 3 * TILE - 4, 3 * TILE - 4); ctx.setLineDash([]); ctx.globalAlpha = 1;
    flagAt((TC_SPOT.x + 1.5) * TILE, (TC_SPOT.y + 1.5) * TILE, b4);
  }
  // villages: a gold flag over those still to win, a blue Khmer pennant over those won
  for (const id of M.villages) {
    const v = G.byId.get(id); if (!v || v.hp <= 0) continue;
    const x = v.x * TILE, y = (v.ty - 0.2) * TILE;
    if (M.won.includes(id)) { ctx.fillStyle = '#3a2408'; ctx.fillRect(x - 1, y - 30, 2, 26); ctx.fillStyle = KBLUE; ctx.fillRect(x + 1, y - 30, 12, 8); ctx.fillStyle = '#f2c94c'; ctx.fillRect(x + 5, y - 28, 4, 4); }
    else flagAt(x, y + 18, b4);
  }
  // while the river rises (and during the flood), buildings that would go under get a red wash
  const rising = !M.flood && M.t >= M.nextFlood - KM2.floodWarn;
  if (rising || M.flood) {
    const pulse = 0.6 + 0.4 * Math.sin(nowS * 5);
    for (const b of G.buildings) {
      if (b.team !== 0 || b.hp <= 0 || !(M.flood ? bldWet(G, b) : wouldFlood(G, b))) continue;
      const h = b.h || b.size;
      ctx.globalAlpha = FLOODART.warnA * pulse; ctx.fillStyle = '#d0402a'; ctx.fillRect(b.tx * TILE, b.ty * TILE, b.size * TILE, h * TILE); ctx.globalAlpha = 1;
    }
  }
}
