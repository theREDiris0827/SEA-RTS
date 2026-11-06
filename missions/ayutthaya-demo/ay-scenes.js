/* ===== ay-scenes.js ===== */
/* Pixel-art scenes for the story cards, built from the game's own sprites on painted backdrops
   (same approach as the Melaka and Đại Việt demos). */
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
// a far skyline of Angkor: stepped prasat towers shaped like lotus buds
function prasatLine(x, base, col, list) {
  x.fillStyle = col;
  for (const [cx, h, w] of list) {
    for (let i = 0; i < h; i += 4) { const t = i / h, hw = Math.max(2, Math.round(w * (1 - Math.pow(t, 1.6)) / 2 / 2) * 2); x.fillRect(cx - hw, base - i - 4, hw * 2, 4); }
    x.fillRect(cx - 1, base - h - 6, 2, 6);
  }
}
function ground(x, w, y0, y1, top, base) { x.fillStyle = base; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = top; x.fillRect(0, y0, w, 4); }
function putUnit(x, kind, team, fx, fy, anim, f, flip, alpha) {
  const spr = unitSprite(kind, team, anim || 'idle', f || 0);
  x.save(); if (alpha) x.globalAlpha = alpha;
  if (flip) { x.translate(fx, 0); x.scale(-1, 1); x.drawImage(spr, -(spr.width >> 1), fy + 5 - spr.height); }
  else x.drawImage(spr, fx - (spr.width >> 1), fy + 5 - spr.height);
  x.restore();
}
function putBld(x, spr, cx, by, s) { s = s || 1; x.drawImage(spr, Math.round(cx - spr.width * s / 2), by - spr.height * s, spr.width * s, spr.height * s); }
function putTree(x, cx, by, v) { const spr = treeSprite(v); x.drawImage(spr, cx - spr.width / 2, by - spr.height); }
function palms(x, list) {
  // sugar palms: a straight trunk and a round burst of fronds
  for (const [px, by, h] of list) {
    x.fillStyle = '#5a4128'; x.fillRect(px, by - h, 2, h);
    x.fillStyle = '#2f5a2a'; x.fillRect(px - 7, by - h - 4, 16, 5); x.fillRect(px - 4, by - h - 8, 10, 4); x.fillRect(px - 9, by - h, 4, 3); x.fillRect(px + 7, by - h, 4, 3);
    x.fillStyle = '#4a8a3a'; x.fillRect(px - 5, by - h - 5, 6, 2); x.fillRect(px + 1, by - h - 7, 4, 2);
  }
}
function sceneFlames(x, list, f) {
  for (const [fx, fy, s] of list) {
    x.fillStyle = '#a8301c'; x.fillRect(fx - s, fy - s * 2, s * 2, s * 2);
    x.fillStyle = '#e2562c'; x.fillRect(fx - s + 2, fy - s * 3 + (f & 1) * 2, s * 2 - 4, s * 2);
    x.fillStyle = '#f6b33a'; x.fillRect(fx - 2, fy - s * 2 - 2, 4, s);
    x.fillStyle = '#fff3a0'; x.fillRect(fx - 1, fy - 4, 2, 2);
  }
}

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  if (id === 'opening') {
    // dawn over the plain: Angkor's towers on the horizon, the king's elephants before the camp
    skyBands(x, W2, 0, 130, ['#2a2a52', '#7a5a7a', '#e8a070', '#f4d8a0']);
    glow(x, 120, 112, 90, 'rgba(255,220,150,.6)');
    prasatLine(x, 120, '#6a5a6a', [[300, 40, 22], [330, 58, 30], [360, 40, 22], [404, 30, 16], [250, 24, 14], [440, 22, 12]]);
    x.fillStyle = '#6a5a6a'; x.fillRect(220, 112, 260, 8);
    ground(x, W2, 118, H2, '#7a8a4a', '#677a3e');
    palms(x, [[30, 160, 34], [60, 152, 28], [210, 140, 26], [460, 150, 30]]);
    putBld(x, AYB.ayBuilding('towncentre'), 70, 190);
    putUnit(x, 'king', 0, 200, 202, 'idle', 0);
    putUnit(x, 'chang', 0, 270, 198, 'idle', 0); putUnit(x, 'chang', 0, 330, 202, 'walk', 1);
    putUnit(x, 'daab', 0, 380, 204); putUnit(x, 'hok', 0, 402, 202); putUnit(x, 'thanu', 0, 424, 205); putUnit(x, 'thanu', 0, 446, 203);
    putUnit(x, 'villager', 0, 130, 206, 'idle', 0, true);
  } else if (id === 'gates') {
    // a face gate of Angkor Thom over the moat; elephants on the causeway, Khmer bowmen on the wall
    skyBands(x, W2, 0, 120, ['#3a4a6a', '#8a9ab0', '#e0d0b0']);
    x.fillStyle = '#3c7896'; x.fillRect(0, 168, W2, 22); x.fillStyle = '#79b8c8'; for (let i = 0; i < 10; i++) x.fillRect((i * 53) % W2, 174 + (i % 3) * 5, 16, 2);
    for (let i = 0; i < 6; i++) putBld(x, lateriteWallSprite(10), 40 + i * 32, 170);
    for (let i = 0; i < 5; i++) putBld(x, lateriteWallSprite(10), 312 + i * 32, 170);
    putBld(x, faceGateSprite(0), 240, 172);
    putUnit(x, 'k_archer', 1, 120, 120, 'attack', 1, true); putUnit(x, 'k_archer', 1, 360, 120, 'attack', 0, true);
    x.fillStyle = '#9a7a4a'; x.fillRect(200, 168, 80, 22);
    ground(x, W2, 190, H2, '#7a8a4a', '#677a3e');
    putUnit(x, 'chang', 0, 250, 210, 'attack', 1, true); putUnit(x, 'king', 0, 330, 214, 'walk', 1, true);
    putUnit(x, 'daab', 0, 160, 214, 'walk', 2, true); putUnit(x, 'hok', 0, 400, 214, 'walk', 0, true);
  } else if (id === 'breach') {
    skyBands(x, W2, 0, 120, ['#4a3a4a', '#a0705a', '#f0c090']);
    prasatLine(x, 140, '#5a4a52', [[240, 70, 34], [200, 50, 24], [280, 50, 24], [160, 36, 18], [320, 36, 18]]);
    ground(x, W2, 138, H2, '#8a7a5a', '#766a4c');
    putBld(x, faceGateSprite(2), 90, 196); x.fillStyle = 'rgba(170,140,100,.55)'; for (let i = 0; i < 7; i++) x.fillRect(60 + i * 10, 150 - i * 6, 22, 14);
    putUnit(x, 'chang', 0, 190, 200, 'walk', 0); putUnit(x, 'king', 0, 250, 204, 'walk', 2);
    putUnit(x, 'daab', 0, 300, 204, 'attack', 1); putUnit(x, 'hok', 0, 320, 200, 'attack', 0);
    putUnit(x, 'k_shield', 1, 360, 202, 'attack', 1, true); putUnit(x, 'k_spear', 1, 392, 206, 'attack', 0, true); putUnit(x, 'k_bal', 1, 440, 204, 'idle', 0, true);
  } else if (id === 'court') {
    // the Khmer court leaves by boat across the great lake, with its monks and its statues
    skyBands(x, W2, 0, 100, ['#2a3050', '#6a6a8a', '#c8a080']);
    prasatLine(x, 100, '#4a4a5a', [[80, 34, 20], [110, 46, 26], [140, 34, 20]]);
    x.fillStyle = '#4a4a5a'; x.fillRect(40, 96, 140, 6);
    x.fillStyle = '#3c6a86'; x.fillRect(0, 102, W2, H2 - 102); x.fillStyle = '#6aa0b8'; for (let i = 0; i < 18; i++) x.fillRect((i * 67) % W2, 112 + (i % 5) * 18, 20, 2);
    for (let i = 0; i < 3; i++) { const s = MAIN.khmerCanoeSprite(); x.drawImage(s, 220 + i * 70, 130 + i * 18); }
    x.fillStyle = '#f2c94c'; x.fillRect(254, 120, 10, 8); x.fillRect(258, 116, 2, 4);
    x.fillStyle = '#e08a2a'; x.fillRect(320, 142, 4, 6); x.fillRect(328, 142, 4, 6);
  } else if (id === 'closing') {
    // sunset over the temples; the king's banner on the palace, the temple faces untouched
    skyBands(x, W2, 0, 130, ['#3a2a4a', '#a0506a', '#f09060', '#f8d090']);
    glow(x, 380, 120, 100, 'rgba(255,200,130,.6)');
    putBld(x, KMB.kmBuilding('palace'), 240, 168, 1.1);
    putBld(x, KMB.kmBuilding('towncentre'), 400, 172);
    x.fillStyle = '#2a1d14'; x.fillRect(420, 70, 2, 40); x.fillStyle = '#7b4bb3'; x.fillRect(422, 70, 20, 12); x.fillStyle = '#f2c94c'; x.fillRect(422, 70, 20, 2);
    ground(x, W2, 168, H2, '#8a7a5a', '#766a4c');
    palms(x, [[40, 176, 40], [90, 172, 32]]);
    putUnit(x, 'king', 0, 340, 206, 'idle', 0, true); putUnit(x, 'hok', 0, 300, 208, 'idle', 0, true); putUnit(x, 'daab', 0, 280, 210, 'idle', 0, true);
    putUnit(x, 'k_vil', 1, 140, 206, 'idle', 0); putUnit(x, 'k_vil', 1, 168, 208, 'idle', 0);
  } else if (id === 'burn') {
    skyBands(x, W2, 0, 120, ['#2a1a2a', '#6a2a2a', '#c0603a']);
    ground(x, W2, 140, H2, '#6a6a3a', '#5a5a32');
    putBld(x, KMB.kmBuilding('house'), 160, 186); putBld(x, KMB.kmBuilding('house'), 300, 182);
    sceneFlames(x, [[150, 140, 8], [170, 148, 6], [300, 136, 9], [316, 146, 6]], 1);
    putUnit(x, 'thanu', 0, 60, 200, 'attack', 1); putUnit(x, 'thanu', 0, 90, 204, 'attack', 0);
    putUnit(x, 'k_vil', 1, 420, 204, 'walk', 1); putUnit(x, 'k_vil', 1, 446, 200, 'walk', 3);
  } else if (id === 'fall') {
    skyBands(x, W2, 0, 120, ['#1a1420', '#3a1a20', '#6a2a20']);
    glow(x, 240, 150, 160, 'rgba(255,110,50,.5)');
    ground(x, W2, 140, H2, '#3a3a2a', '#2a2a1e');
    putBld(x, AYB.ayBuilding('towncentre'), 240, 186);
    sceneFlames(x, [[220, 120, 9], [260, 130, 7]], 0);
    for (let i = 0; i < 5; i++) putUnit(x, ['k_spear', 'k_shield', 'k_archer', 'k_shield', 'k_spear'][i], 1, 110 + i * 60, 206 - (i % 2) * 6, 'walk', i % 4);
  }
  return c;
}
