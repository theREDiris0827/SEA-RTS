/* ===== m3-art.js ===== */
/* Drawing for mission 3: Tun Perak's sprite (lore/scenes/heroes-art.js), torches tied in the mangrove crowns,
   people wading, the Port on stilts, and the night: a pixel darkness with pools of torchlight.
   Every function here wraps the game's own one and falls back to it. */

/* ---------- Things you can tweak ---------- */
const NIGHT = {
  dark: 0.56,              // how dark the night is (0 = day, 1 = black); 'medium dark' so units stay readable on a phone
  col: [8, 14, 38],        // the colour of the dark (deep blue)
  duskRamp: 90,            // seconds before nightfall that the light starts to go
  dawnRamp: 60,            // seconds after dawn that it takes to be full day again
  px: 4                    // darkness pixels per tile (bigger blocks look more 'pixel')
};

/* ---------- people ---------- */
const _m3us = unitSprite;
unitSprite = function (kind, team, anim, f, tool) {
  if (kind === 'perak') return HEROART.heroSprite('perak', anim === 'work' ? 'idle' : anim, f);
  return _m3us(kind, team, anim, f, tool);
};
const _m3ui = unitIcon;
unitIcon = function (kind, team) {
  if (kind === 'perak') return dataURL('ui|perak', () => fitIcon(HEROART.heroSprite('perak', 'idle', 0), 44));
  return _m3ui(kind, team);
};
const _m3pu = paintUnit;
paintUnit = function (u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE;
  if (d.hero) { ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, 12, 6); ctx.stroke(); ctx.globalAlpha = 1; }
  _m3pu(u);
  // wading: the water comes up over their legs
  if (u.layer === 0 && G.terrain[Math.floor(u.y) * W + Math.floor(u.x)] === T.SHALLOW) {
    const ph = Math.floor(nowS * 3 + u.id) % 2;
    ctx.fillStyle = 'rgba(75,163,191,0.86)'; ctx.fillRect(px - 9, py + 1, 18, 5);
    ctx.fillStyle = 'rgba(220,240,248,0.75)'; ctx.fillRect(px - 8 + ph * 2, py + 1, 6, 1); ctx.fillRect(px + 2 - ph * 2, py + 1, 5, 1);
  }
  if (d.hero) { const top = py - 46; hpBar(px - 13, top + 2, 26, u.hp / u.maxHp); ctx.fillStyle = '#17110c'; ctx.fillRect(px - 21, top - 1, 7, 7); ctx.fillStyle = '#f2c94c'; ctx.fillRect(px - 19, top - 1, 3, 7); ctx.fillRect(px - 21, top + 1, 7, 3); }
  // a Siamese soldier putting out a torch shows how far along he is
  if (u.team === 1 && u.dT > 0) { ctx.fillStyle = '#17110c'; ctx.fillRect(px - 9, py - 34, 18, 4); ctx.fillStyle = '#9ad0ff'; ctx.fillRect(px - 8, py - 33, Math.round(16 * Math.min(1, u.dT / M3.douseTime)), 2); }
  // the villager tying a torch
  if (u.order.t === 'torch' && u.order.paid) { ctx.fillStyle = '#17110c'; ctx.fillRect(px - 9, py - 34, 18, 4); ctx.fillStyle = '#ffb347'; ctx.fillRect(px - 8, py - 33, Math.round(16 * Math.min(1, u.order.w / M3.tieTime)), 2); }
};

/* ---------- torches in the mangrove crowns ---------- */
function torchFlame(x, y, t, s) {
  // a little pixel flame on a pole; s = size in px per block
  const f = Math.floor(t * 8) % 3;
  ctx.fillStyle = '#5e3b1c'; ctx.fillRect(x - 1, y, 2, 9);
  ctx.fillStyle = '#c9a24a'; ctx.fillRect(x - 2, y + 1, 4, 2);
  const H = [[0, -6 - f, 2, 6 + f, '#e8582a'], [-2, -4, 2, 4, '#e8582a'], [2, -4 + (f === 1 ? -1 : 0), 2, 4, '#f2a33a'], [-1, -5, 2, 5, '#f2a33a'], [0, -3, 2, 3, '#ffe08a']];
  for (const [dx, dy, w, h, c] of H) { ctx.fillStyle = c; ctx.fillRect(x + dx - 1, y + dy, w * (s || 1), h); }
}
const _m3pn = paintNode;
paintNode = function (n) {
  if (!n.torch || !G.M) return _m3pn(n);
  const px = n.tx * TILE, py = n.ty * TILE, M = G.M;
  // a torch tree is always a full mangrove (the map's own sprite), never a nipa palm
  const spr = CALM.plant('mangrove'), top = py + 31 - spr.height;
  shadow(px + 16, py + 28, 11, 4, 0.25); ctx.drawImage(spr, px + 16 - spr.width / 2, top);
  if (isSel(n)) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(px + 2, py + 2, 28, 28); }
  if (n.torch.lit) {
    torchFlame(px + 12, top + 3, nowS + n.id * 0.37); torchFlame(px + 21, top + 6, nowS + n.id * 0.61 + 1.3);
  } else if (M.phase <= 2) {
    // the marked trees: their bright ring and arrow are drawn over the night by torchMarks()
    // a bundle of torches waiting at its foot
    ctx.fillStyle = '#5e3b1c'; ctx.fillRect(px + 22, py + 20, 2, 8); ctx.fillRect(px + 25, py + 21, 2, 7); ctx.fillStyle = '#c9a24a'; ctx.fillRect(px + 21, py + 22, 7, 2);
  }
};

/* ---------- the Port on stilts ---------- */
const _m3pb = paintBuilding;
paintBuilding = function (b) {
  if (b.stilts) {
    const y = (b.ty + (b.h || b.size)) * TILE;
    for (let i = 0; i < b.size * 2 + 1; i++) { const x = b.tx * TILE + 4 + i * 15; ctx.fillStyle = '#3e2a16'; ctx.fillRect(x, y - 6, 4, 13); ctx.fillStyle = 'rgba(220,240,248,.6)'; ctx.fillRect(x - 2, y + 6, 8, 1); }
  }
  _m3pb(b);
};

/* ---------- the night ---------- */
let nightC = null, nightX = null;
function nightLevel() {
  const M = G && G.M; if (!M) return 0;
  if (M.phase === 1) return NIGHT.dark * Math.max(0, Math.min(1, (M.t - (M3.duskLen - NIGHT.duskRamp)) / NIGHT.duskRamp));
  if (M.phase === 2) return NIGHT.dark;
  return NIGHT.dark * Math.max(0, 1 - (M.t - M.phaseAt[3]) / NIGHT.dawnRamp);
}
function lightsNow() {
  const L = [], M = G.M;
  for (const n of litTorches(G)) L.push([n.tx + 0.5, n.ty + 0.2, M3.torchSight * (0.92 + 0.08 * Math.sin(nowS * 9 + n.id)), 1]);
  for (const b of G.buildings) if (b.hp > 0 && b.team === 0) L.push([b.x, b.y, b.kind === 'towncentre' ? 4 : b.kind === 'port' ? 3 : 2, 0.8]);
  for (const b of G.buildings) if (b.hp > 0 && b.kind === 'village') L.push([b.x, b.y, 2.6, 0.7]);
  for (const u of G.units) if (u.hp > 0 && u.layer === 1 && u.team !== 2) L.push([u.x, u.y, u.team === 0 ? 1.8 : 2.2, 0.7]);
  for (const u of G.units) if (u.hp > 0 && u.kind === 'perak') L.push([u.x, u.y, 2.2, 0.6]);
  for (const f of G.fx) if (f.k === 'fire' || f.k === 'flame') L.push([f.x, f.y, 1.6, 0.5]);
  // the marked trees still waiting for a torch sit in a soft pool of light, so they can be found
  if (M.phase <= 2) for (const n of unlitTorches()) L.push([n.tx + 0.5, n.ty + 0.6, 2.4, 0.75]);
  return L;
}
function unlitTorches() { return G.nodes.filter(n => n.torch && !n.torch.lit); }
// drawn above the darkness: a solid pulsing gold ring at the roots and a bobbing arrow over the crown
function torchMarks() {
  const M = G.M; if (!M || M.phase > 2) return;
  const pulse = 0.5 + 0.5 * Math.sin(nowS * 4), bob = Math.round(Math.sin(nowS * 4) * 3);
  for (const n of unlitTorches()) {
    const px = n.tx * TILE, py = n.ty * TILE, cx = px + 16;
    ctx.globalAlpha = 0.35 + 0.25 * pulse; ctx.fillStyle = '#f2c94c'; ell(cx, py + 26, 15, 6.5); ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = '#3a2408'; ctx.lineWidth = 4; ell(cx, py + 26, 15, 6.5); ctx.stroke();
    ctx.strokeStyle = pulse > 0.5 ? '#ffe08a' : '#f2c94c'; ctx.lineWidth = 2; ell(cx, py + 26, 15, 6.5); ctx.stroke();
    // a pixel arrow pointing down at the tree
    const ay = py + 31 - CALM.plant('mangrove').height - 30 + bob, Z = 2;
    const A = [[-1, 0, 2, 7], [-4, 6, 8, 2], [-3, 8, 6, 2], [-2, 10, 4, 2], [-1, 12, 2, 1]];
    ctx.fillStyle = '#3a2408'; for (const [dx, dy, w, h] of A) ctx.fillRect(cx + dx * Z - 2, ay + dy * Z - 2, w * Z + 4, h * Z + 4);
    ctx.fillStyle = '#ffd24a'; for (const [dx, dy, w, h] of A) ctx.fillRect(cx + dx * Z, ay + dy * Z, w * Z, h * Z);
    ctx.fillStyle = '#fff2b0'; ctx.fillRect(cx - 2, ay, 2, 12);
  }
}
function paintMission() {
  const M = G.M; if (!M) return;
  // where a Port fits on stilts, until you build one
  if (M.phase === 1 && !G.buildings.some(b => b.team === 0 && b.kind === 'port' && b.hp > 0) && M.portSpot) {
    const s = M.portSpot, x = (s.x + 1.5) * TILE, y = (s.y + 0.5) * TILE, b = Math.sin(nowS * 4) * 4;
    ctx.globalAlpha = 0.55; ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.strokeRect(s.x * TILE + 2, s.y * TILE + 2, 3 * TILE - 4, TILE - 4); ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.drawImage(iconSprite('flag'), x - 8, y - 46 + b);
  }
  const lv = nightLevel();
  if (lv <= 0.01) return torchMarks();
  const P = NIGHT.px, cw = W * P, ch = H * P;
  if (!nightC) { nightC = document.createElement('canvas'); nightC.width = cw; nightC.height = ch; nightX = nightC.getContext('2d'); nightX.imageSmoothingEnabled = false; }
  const x = nightX, [r, g, b] = NIGHT.col;
  x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cw, ch);
  x.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + lv.toFixed(3) + ')'; x.fillRect(0, 0, cw, ch);
  // dusk and dawn: a warm sky over the dark
  if (M.phase !== 2) { x.fillStyle = M.phase === 1 ? 'rgba(255,120,60,' + (0.10 * (1 - lv / NIGHT.dark)).toFixed(3) + ')' : 'rgba(255,170,120,' + (0.12 * lv / NIGHT.dark).toFixed(3) + ')'; x.fillRect(0, 0, cw, ch); }
  // pools of light: stepped rings, so the edges stay pixel-hard
  x.globalCompositeOperation = 'destination-out';
  const L = lightsNow();
  for (const [lx, ly, rad, k] of L) for (const [f, a] of [[1, 0.35], [0.72, 0.35], [0.45, 0.3]]) {
    x.globalAlpha = a * k; x.fillStyle = '#000'; x.beginPath(); x.arc(lx * P, ly * P, rad * f * P, 0, 6.2832); x.fill();
  }
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  ctx.drawImage(nightC, 0, 0, W * TILE, H * TILE);
  // warm glow round the torches
  ctx.globalCompositeOperation = 'lighter';
  for (const n of litTorches(G)) {
    const cx = (n.tx + 0.5) * TILE, cy = (n.ty + 0.1) * TILE, rr = 2.2 * TILE * (0.94 + 0.06 * Math.sin(nowS * 11 + n.id));
    for (const [f, a] of [[1, 0.07], [0.66, 0.08], [0.36, 0.11]]) { ctx.fillStyle = 'rgba(255,150,60,' + (a * lv / NIGHT.dark) + ')'; ctx.beginPath(); ctx.arc(cx, cy, rr * f, 0, 6.2832); ctx.fill(); }
  }
  ctx.globalCompositeOperation = 'source-over';
  torchMarks();
}
// after the fog: the fleet's lanterns can be seen far out on the water at night
function paintAfterFog() {
  const M = G && G.M; if (!M || nightLevel() < 0.2) return;
  for (const u of G.units) {
    if (u.team !== 1 || u.hp <= 0 || u.layer !== 1 || G.isVisible(u.x, u.y)) continue;
    const x = u.x * TILE, y = u.y * TILE - 22, on = (Math.floor(nowS * 1.5 + u.id) % 5) !== 0;
    ctx.fillStyle = 'rgba(255,190,90,.22)'; ctx.fillRect(x - 5, y - 5, 10, 10);
    if (on) { ctx.fillStyle = '#ffd27a'; ctx.fillRect(x - 2, y - 2, 4, 4); }
  }
}

// the minimap: blinking gold squares on the trees still waiting for a torch
const _m3dm = drawMini;
drawMini = function () {
  _m3dm();
  const M = G && G.M; if (!M || M.phase > 2 || typeof mctx === 'undefined') return;
  if (Math.floor(performance.now() / 400) % 2) return;
  const S = mctx.canvas.width / W;
  for (const n of unlitTorches()) { mctx.fillStyle = '#3a2408'; mctx.fillRect(n.tx * S - 2, n.ty * S - 2, S + 4, S + 4); mctx.fillStyle = '#ffd24a'; mctx.fillRect(n.tx * S - 1, n.ty * S - 1, S + 2, S + 2); }
};
