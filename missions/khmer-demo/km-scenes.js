/* ===== km-scenes.js ===== */
/* Pixel-art scenes for the story cards, built from the game's own sprites on painted backdrops
   (same approach as the other demos). */
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
function water(x, w, y0, y1, base, glint) {
  x.fillStyle = base; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = glint;
  for (let i = 0; i < 22; i++) x.fillRect((i * 67 + (i % 3) * 11) % w, y0 + 6 + (i % 6) * ((y1 - y0 - 10) / 6), 14 + (i % 3) * 6, 2);
}
function putUnit(x, kind, team, fx, fy, anim, f, flip, alpha) {
  const spr = unitSprite(kind, team, anim || 'idle', f || 0);
  x.save(); if (alpha) x.globalAlpha = alpha;
  if (flip) { x.translate(fx, 0); x.scale(-1, 1); x.drawImage(spr, -(spr.width >> 1), fy + 5 - spr.height); }
  else x.drawImage(spr, fx - (spr.width >> 1), fy + 5 - spr.height);
  x.restore();
}
function putShip(x, kind, team, cx, by, flip, s) {
  const spr = kmShip(kind, team); s = s || 1;
  x.save(); if (flip) { x.translate(cx, 0); x.scale(-1, 1); x.drawImage(spr, -spr.width * s / 2, by - spr.height * s, spr.width * s, spr.height * s); }
  else x.drawImage(spr, cx - spr.width * s / 2, by - spr.height * s, spr.width * s, spr.height * s);
  x.restore();
}
function putBld(x, spr, cx, by, s) { s = s || 1; x.drawImage(spr, Math.round(cx - spr.width * s / 2), by - spr.height * s, spr.width * s, spr.height * s); }
function palms(x, list) {
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
function banners(x, list, col) {
  for (const [bx, by] of list) { x.fillStyle = '#2a1d14'; x.fillRect(bx, by - 26, 2, 26); x.fillStyle = col; x.fillRect(bx + 2, by - 26, 10, 7); x.fillStyle = '#f2c94c'; x.fillRect(bx + 2, by - 26, 10, 1); }
}

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  if (id === 'opening') {
    // dusk on the wall of Angkor Thom: the defenders on the walk, Ayutthaya's camp fires beyond
    skyBands(x, W2, 0, 120, ['#1e2244', '#4a3a66', '#a0607a', '#e89a70']);
    glow(x, 360, 112, 80, 'rgba(255,170,110,.45)');
    x.fillStyle = '#3a2e44'; x.fillRect(0, 106, W2, 14);
    for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(255,170,80,.8)'; x.fillRect(250 + i * 24 + (i % 3) * 5, 108 + (i % 2) * 4, 3, 3); }
    banners(x, [[270, 112], [330, 110], [400, 113]], APURP);
    putUnit(x, 'chang', 1, 300, 116, 'idle', 0, true, 0.7); putUnit(x, 'chang', 1, 440, 118, 'idle', 0, true, 0.6);
    for (let i = 0; i < 16; i++) putBld(x, lateriteWallSprite(10), 15 + i * 32, 182);
    putUnit(x, 'sna', 0, 70, 128, 'idle', 0); putUnit(x, 'spear', 0, 110, 128, 'idle', 0); putUnit(x, 'sna', 0, 380, 128, 'attack', 0); putUnit(x, 'shield', 0, 420, 128, 'idle', 0);
    ground(x, W2, 180, H2, '#6a7a44', '#5a6a3a');
    putUnit(x, 'ponhea', 0, 230, 210, 'idle', 0);
    putUnit(x, 'l_monks', 0, 150, 208, 'idle', 0); putUnit(x, 'shield', 0, 290, 210, 'idle', 0, true); putUnit(x, 'spear', 0, 316, 210, 'idle', 0, true);
  } else if (id === 'postern') {
    // the small door beside the South Gate, and the road down to the landing
    skyBands(x, W2, 0, 120, ['#3a4a6a', '#8a9ab0', '#e0d0b0']);
    water(x, W2, 150, H2, '#3c6a86', '#6aa0b8');
    ground(x, W2, 120, 150, '#c8b47a', '#b8a46a');
    putBld(x, faceGateSprite(0), 120, 130);
    putBld(x, MAIN.mainlandBase('km', 'port'), 360, 160);
    putUnit(x, 'l_monks', 0, 200, 142, 'walk', 1); putUnit(x, 'l_treasury', 0, 260, 146, 'walk', 2);
    putShip(x, 'barge', 0, 300, 200);
  } else if (id === 'river') {
    // the barges on the great lake, war canoes beside them; Ayutthaya's boats on the far reach
    skyBands(x, W2, 0, 96, ['#2a3a5a', '#6a8aa0', '#d8c8a0']);
    prasatLine(x, 96, '#4a5060', [[70, 36, 20], [100, 50, 28], [130, 36, 20]]);
    x.fillStyle = '#4a5060'; x.fillRect(30, 92, 140, 6);
    water(x, W2, 98, H2, '#3c6a86', '#6aa0b8');
    putShip(x, 'barge', 0, 150, 168); putShip(x, 'barge', 0, 270, 200);
    putShip(x, 'canoe', 0, 230, 150); putShip(x, 'canoe', 0, 340, 176);
    putShip(x, 'light', 1, 440, 130, true, 0.8);
    x.globalAlpha = 0.95; cargoGlyphOn(x, 'monks', 150, 120); cargoGlyphOn(x, 'statue', 270, 150); x.globalAlpha = 1;
  } else if (id === 'fall') {
    // the gate gives way: the king of Ayutthaya on his elephant, the shield wall in the street
    skyBands(x, W2, 0, 120, ['#2a1a2a', '#6a2a2a', '#c0603a']);
    prasatLine(x, 140, '#4a3a42', [[380, 70, 34], [340, 50, 24], [420, 50, 24]]);
    ground(x, W2, 138, H2, '#8a7a5a', '#766a4c');
    putBld(x, faceGateSprite(2), 90, 196); x.fillStyle = 'rgba(170,140,100,.55)'; for (let i = 0; i < 7; i++) x.fillRect(60 + i * 10, 150 - i * 6, 22, 14);
    sceneFlames(x, [[40, 150, 7], [150, 146, 6]], 1);
    putUnit(x, 'king', 1, 170, 206, 'walk', 1); putUnit(x, 'chang', 1, 110, 200, 'walk', 0); putUnit(x, 'daab', 1, 220, 206, 'attack', 1);
    putUnit(x, 'shield', 0, 280, 206, 'attack', 1, true); putUnit(x, 'spear', 0, 306, 202, 'attack', 0, true); putUnit(x, 'shield', 0, 330, 208, 'idle', 0, true);
    putUnit(x, 'ponhea', 0, 380, 208, 'idle', 0, true); putUnit(x, 'bal', 0, 440, 206, 'attack', 0, true);
  } else if (id === 'closing') {
    // dawn on the Tonlé Sap: the royal barge rowing south, Angkor's towers small behind
    skyBands(x, W2, 0, 110, ['#2a2a52', '#7a5a7a', '#f0a070', '#f8d8a0']);
    glow(x, 380, 108, 90, 'rgba(255,220,150,.7)');
    prasatLine(x, 108, '#6a5a6a', [[90, 30, 18], [112, 42, 22], [134, 30, 18]]);
    water(x, W2, 108, H2, '#4a6a8a', '#e8c890');
    putShip(x, 'rbarge', 0, 280, 190, false, 1.2); putShip(x, 'canoe', 0, 180, 168); putShip(x, 'barge', 0, 400, 200, false, 0.9);
  } else if (id === 'barge') {
    skyBands(x, W2, 0, 90, ['#3a4a6a', '#8a9ab0', '#e0d0b0']);
    water(x, W2, 90, H2, '#3c6a86', '#6aa0b8');
    putBld(x, MAIN.mainlandBase('km', 'port'), 120, 150);
    putShip(x, 'barge', 0, 300, 190); cargoGlyphOn(x, 'monks', 300, 130);
  } else if (id === 'lost') {
    skyBands(x, W2, 0, 110, ['#2a2030', '#5a3a4a', '#a0605a']);
    ground(x, W2, 140, H2, '#6a6a3a', '#5a5a32');
    putUnit(x, 'l_statue', 0, 240, 200, 'walk', 1, true);
    putUnit(x, 'daab', 1, 170, 204, 'walk', 0); putUnit(x, 'daab', 1, 310, 204, 'walk', 2); banners(x, [[200, 190]], APURP);
  } else if (id === 'ruin') {
    skyBands(x, W2, 0, 120, ['#1a1420', '#3a1a20', '#6a2a20']);
    glow(x, 240, 150, 160, 'rgba(255,110,50,.5)');
    ground(x, W2, 140, H2, '#3a3a2a', '#2a2a1e');
    putBld(x, KMB.kmBuilding('towncentre'), 240, 186);
    sceneFlames(x, [[220, 120, 9], [260, 130, 7]], 0);
    banners(x, [[300, 200], [180, 204]], APURP);
    putUnit(x, 'chang', 1, 120, 206, 'walk', 1); putUnit(x, 'daab', 1, 360, 206, 'walk', 2);
  }
  return c;
}
function cargoGlyphOn(x, key, cx, cy) { cargoGlyph(key, cx, cy, x); }
