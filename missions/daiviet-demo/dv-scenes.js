/* ===== dv-scenes.js ===== */
/* Pixel-art scenes for the story cards, built from the game's own sprites on painted backdrops
   (same approach as the Melaka demo's mission-scenes.js). */
const SCENE_W = 480, SCENE_H = 216;
function sceneCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  return [c, x];
}
function mixHex(a, b, t) {
  const p = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b);
  return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')';
}
function skyBands(x, w, y0, y1, cols) {
  const n = Math.ceil((y1 - y0) / 4);
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1) * (cols.length - 1), k = Math.min(cols.length - 2, Math.floor(t));
    x.fillStyle = mixHex(cols[k], cols[k + 1], t - k); x.fillRect(0, y0 + i * 4, w, 4);
  }
}
function glow(x, cx, cy, r, col) {
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
}
// a row of karst peaks: steep limestone towers, drawn in 4px steps
function peaks(x, w, base, col, seed, hMin, hMax, step) {
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  x.fillStyle = col;
  let px = -10;
  while (px < w + 10) {
    const pw = (step || 40) + Math.floor(rnd() * 30), ph = hMin + Math.floor(rnd() * (hMax - hMin));
    for (let i = 0; i < pw; i += 4) { const t = Math.abs(i / pw - 0.5) * 2, hh = Math.floor(ph * (1 - Math.pow(t, 2.2)) / 4) * 4; x.fillRect(px + i, base - hh, 4, hh + 2); }
    px += Math.floor(pw * 0.7);
  }
}
function mist(x, w, y, h, a) { x.fillStyle = 'rgba(220,232,224,' + a + ')'; x.fillRect(0, y, w, h); }
function putUnit(x, kind, team, fx, fy, anim, f, flip, alpha) {
  const spr = unitSprite(kind, team, anim || 'idle', f || 0);
  x.save(); if (alpha) x.globalAlpha = alpha;
  if (flip) { x.translate(fx, 0); x.scale(-1, 1); x.drawImage(spr, -(spr.width >> 1), fy + 5 - spr.height); }
  else x.drawImage(spr, fx - (spr.width >> 1), fy + 5 - spr.height);
  x.restore();
}
function putBld(x, spr, cx, by, s) { s = s || 1; x.drawImage(spr, Math.round(cx - spr.width * s / 2), by - spr.height * s, spr.width * s, spr.height * s); }
function putTree(x, cx, by, v) { const spr = treeSprite(v); x.drawImage(spr, cx - spr.width / 2, by - spr.height); }
function ground(x, w, y0, y1, top, base) { x.fillStyle = base; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = top; x.fillRect(0, y0, w, 4); }

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  if (id === 'opening') {
    // dawn over the karst hills of Thanh Hóa; the Đình in the valley, Lê Lợi's band before it
    skyBands(x, W2, 0, 120, ['#2a3a5a', '#7a7a8a', '#e8b880', '#f4dca8']);
    glow(x, 360, 96, 90, 'rgba(255,220,150,.6)');
    peaks(x, W2, 104, '#6a7a8a', 5, 40, 80); mist(x, W2, 90, 14, 0.35);
    peaks(x, W2, 124, '#3f5a4a', 17, 30, 60, 50); mist(x, W2, 112, 10, 0.3);
    ground(x, W2, 122, H2, '#5b8c4a', '#4a7a3c');
    for (let i = 0; i < 8; i++) putTree(x, 10 + i * 18 + (i % 2) * 6, 150 + (i % 3) * 3, i % 4);
    for (let i = 0; i < 6; i++) putTree(x, 380 + i * 17, 150 + (i % 2) * 4, (i + 2) % 4);
    putBld(x, dinhSprite(), 250, 166);
    x.fillStyle = '#7a5632'; x.fillRect(120, 168, 90, 30); x.fillStyle = '#7bc65a'; for (let i = 0; i < 5; i++) x.fillRect(124, 171 + i * 6, 82, 2);
    putUnit(x, 'leloi', 0, 300, 196, 'idle', 0); putUnit(x, 'nguyentrai', 0, 330, 198, 'idle', 0, true);
    putUnit(x, 'dao', 0, 356, 200); putUnit(x, 'thuong', 0, 378, 198); putUnit(x, 'hoadong', 0, 400, 201); putUnit(x, 'hoadong', 0, 422, 199, 'idle', 0, true);
    putUnit(x, 'villager', 0, 150, 190, 'work', 1); putUnit(x, 'villager', 0, 182, 194, 'work', 0, true);
  } else if (id === 'totdong') {
    // grey rain on the marsh road; the Ming column marches past a wood where the Đại Việt wait
    skyBands(x, W2, 0, 110, ['#3a4048', '#5a6068', '#7a8088']);
    peaks(x, W2, 100, '#4a5658', 9, 30, 50, 60);
    ground(x, W2, 98, H2, '#56794a', '#46663c');
    x.fillStyle = '#6a7a72'; x.fillRect(0, 150, W2, 26); x.fillStyle = '#7a8a82'; for (let i = 0; i < 12; i++) x.fillRect(i * 44 + 10, 158 + (i % 2) * 6, 26, 2);
    for (let i = 0; i < 12; i++) putTree(x, 14 + i * 22 + (i % 2) * 8, 132 + (i % 3) * 4, i % 4);
    putUnit(x, 'hoadong', 0, 80, 140, 'idle', 0, false, 0.6); putUnit(x, 'thuong', 0, 150, 136, 'idle', 0, false, 0.6); putUnit(x, 'danbinh', 0, 210, 140, 'idle', 0, false, 0.6);
    const col = ['m_shield', 'm_spear', 'm_xbow', 'm_spear', 'm_gun', 'm_shield', 'm_xbow'];
    col.forEach((k, i) => putUnit(x, k, 1, 150 + i * 40, 196 + (i % 2) * 6, 'walk', i % 4, true));
    putUnit(x, 'm_cav', 1, 448, 194, 'walk', 1, true);
    x.fillStyle = 'rgba(200,210,220,.35)'; for (let i = 0; i < 90; i++) { const rx = (i * 53) % W2, ry = (i * 37) % H2; x.fillRect(rx, ry, 1, 6); }
  } else if (id === 'chilang') {
    // the Chi Lăng pass: cliffs either side, the relief army in the gap, eyes in the woods above
    skyBands(x, W2, 0, 100, ['#4a5a7a', '#9aa4b0', '#d8d0b8']);
    x.fillStyle = '#5a5e66'; for (let i = 0; i < 40; i++) { const h = 150 - Math.abs(i - 4) * 6; if (h > 40) x.fillRect(i * 4, 216 - h, 4, h); }
    for (let i = 0; i < 44; i++) { const h = 160 - Math.abs(i - 36) * 5; if (h > 40) x.fillRect(300 + i * 4, 216 - h, 4, h); }
    x.fillStyle = '#4a4e56'; x.fillRect(0, 120, 60, 96); x.fillRect(430, 110, 50, 106);
    ground(x, W2, 176, H2, '#6a7a52', '#5a6a44');
    for (const [tx, ty] of [[40, 96], [70, 110], [100, 126], [360, 100], [392, 116], [420, 128], [140, 150], [340, 150]]) putTree(x, tx, ty, (tx >> 3) % 4);
    putUnit(x, 'hoadong', 0, 72, 112, 'idle', 0, false, 0.6); putUnit(x, 'thuong', 0, 120, 132, 'idle', 0, false, 0.6); putUnit(x, 'danbinh', 0, 402, 118, 'idle', 0, true, 0.6); putUnit(x, 'dao', 0, 372, 132, 'idle', 0, true, 0.6);
    putUnit(x, 'm_hero', 1, 250, 196, 'walk', 1);
    for (let i = 0; i < 5; i++) putUnit(x, i % 2 ? 'm_cav' : 'm_spear', 1, 180 - i * 4 + (i % 2) * 70, 206 - (i % 3) * 4, 'walk', i % 4);
  } else if (id === 'rout') {
    skyBands(x, W2, 0, 120, ['#6a5a6a', '#c89a7a', '#f0d8a8']);
    ground(x, W2, 140, H2, '#6a7a52', '#5a6a44');
    putUnit(x, 'leloi', 0, 200, 190, 'attack', 2); putUnit(x, 'thuong', 0, 230, 194, 'attack', 1); putUnit(x, 'thuong', 0, 170, 196, 'attack', 0);
    x.save(); x.globalAlpha = 0.8; x.translate(290, 200); x.rotate(1.2); const spr = unitSprite('m_hero', 1, 'idle', 1); x.drawImage(spr, -spr.width / 2, -spr.height + 8); x.restore();
    for (let i = 0; i < 4; i++) putUnit(x, ['m_spear', 'm_xbow', 'm_shield', 'm_gun'][i], 1, 360 + i * 28, 178 + (i % 2) * 8, 'walk', i, false);
  } else if (id === 'closing') {
    // a river at dawn: the beaten Ming soldiers are given boats and food to go home
    skyBands(x, W2, 0, 110, ['#3a4a6a', '#c48a7a', '#f4c890', '#fae6b8']);
    glow(x, 110, 96, 80, 'rgba(255,230,170,.6)');
    peaks(x, W2, 104, '#6a7a8a', 23, 30, 64); mist(x, W2, 94, 12, 0.35);
    ground(x, W2, 104, 128, '#5b8c4a', '#4a7a3c');
    x.fillStyle = '#3c7896'; x.fillRect(0, 128, W2, 50); x.fillStyle = '#79b8c8'; for (let i = 0; i < 16; i++) x.fillRect((i * 61) % W2, 134 + (i % 4) * 10, 18, 2);
    ground(x, W2, 176, H2, '#c9b47c', '#a8925c');
    const boat = DVART.dvShip('trade'); x.drawImage(boat, 90, 92); x.drawImage(DVART.dvShip('trade'), 230, 98);
    putUnit(x, 'm_spear', 1, 170, 200, 'walk', 1); putUnit(x, 'm_xbow', 1, 196, 204, 'walk', 2); putUnit(x, 'm_shield', 1, 144, 206, 'walk', 3);
    putUnit(x, 'villager', 0, 250, 200, 'idle', 0, true); x.fillStyle = '#d9c79a'; x.fillRect(236, 196, 6, 5); x.fillRect(258, 198, 6, 5);
    putUnit(x, 'nguyentrai', 0, 330, 204, 'attack', 1, true); putUnit(x, 'leloi', 0, 362, 206, 'idle', 0, true);
    putUnit(x, 'hoadong', 0, 400, 204, 'idle', 0, true); putUnit(x, 'thuong', 0, 428, 206, 'idle', 0, true);
  } else if (id === 'fall') {
    skyBands(x, W2, 0, 120, ['#1a1420', '#3a1a20', '#6a2a20']);
    glow(x, 240, 150, 160, 'rgba(255,110,50,.5)');
    ground(x, W2, 140, H2, '#3a3a2a', '#2a2a1e');
    putBld(x, MAINLAND.mainlandBase('dv', 'towncentre'), 240, 186);
    x.fillStyle = 'rgba(60,40,40,.6)'; for (let i = 0; i < 6; i++) x.fillRect(220 + i * 6 - i * i, 70 - i * 10, 20 + i * 4, 10);
    for (let i = 0; i < 5; i++) putUnit(x, ['m_spear', 'm_shield', 'm_xbow', 'm_gun', 'm_spear'][i], 1, 120 + i * 60, 206 - (i % 2) * 6, 'walk', i % 4);
  }
  return c;
}
