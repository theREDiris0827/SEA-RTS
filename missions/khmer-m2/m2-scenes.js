/* ===== m2-scenes.js ===== */
/* Pixel scenes for the story cards, built from the game's own sprites (Khmer people, boats and buildings,
   Ayutthaya raiders) on painted backdrops. Helpers as in Island City and Torches in the Mangroves. */
const SCENE_W = 480, SCENE_H = 216;
function sceneCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
function mixHex(a, b, t) { const p = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; }
function skyBands(x, w, y0, y1, cols) {
  const n = Math.ceil((y1 - y0) / 4);
  for (let i = 0; i < n; i++) { const t = i / Math.max(1, n - 1) * (cols.length - 1), k = Math.min(cols.length - 2, Math.floor(t)); x.fillStyle = mixHex(cols[k], cols[k + 1], t - k); x.fillRect(0, y0 + i * 4, w, 4); }
}
function seaBand(x, w, y0, y1, deep, light, seed) {
  x.fillStyle = deep; x.fillRect(0, y0, w, y1 - y0);
  let s = seed || 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  x.fillStyle = light;
  for (let i = 0; i < (y1 - y0) * w / 900; i++) { const yy = y0 + 4 + Math.floor(rnd() * (y1 - y0 - 6) / 2) * 2; x.fillRect(Math.floor(rnd() * w / 2) * 2, yy, 6 + Math.floor(rnd() * 4) * 2, 2); }
}
function putUnit(x, kind, team, fx, fy, anim, f, flip) {
  const spr = unitSprite(kind, team, anim || 'idle', f || 0);
  if (flip) { x.save(); x.translate(fx, 0); x.scale(-1, 1); x.drawImage(spr, -(spr.width >> 1), fy + 5 - spr.height); x.restore(); }
  else x.drawImage(spr, fx - (spr.width >> 1), fy + 5 - spr.height);
}
function putShip(x, kind, team, cx, wy, flip) {
  const spr = shipSprite({ kind, team }), a = shipAnchor(kind, team);
  if (flip) { x.save(); x.translate(cx, 0); x.scale(-1, 1); x.drawImage(spr, -a[0], wy - a[1]); x.restore(); }
  else x.drawImage(spr, cx - a[0], wy - a[1]);
}
function putBld(x, spr, cx, by, s) { s = s || 1; x.drawImage(spr, Math.round(cx - spr.width * s / 2), by - spr.height * s, spr.width * s, spr.height * s); }
function ground(x, w, y0, y1, c1, c2) { x.fillStyle = c1; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = c2; for (let i = 0; i < w; i += 18) x.fillRect(i + ((y0 / 2) % 9), y0 + 2 + (i % 5) * 2, 8, 2); }
function palms(x, list) { for (const [cx, by] of list) { x.fillStyle = '#5e3b1c'; x.fillRect(cx - 1, by - 34, 3, 34); x.fillStyle = '#2f6a34'; for (const [dx, dy, w] of [[-12, -38, 10], [2, -38, 10], [-8, -42, 16], [-14, -34, 6], [8, -34, 6]]) x.fillRect(cx + dx, by + dy, w, 3); } }

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  if (id === 'opening') {
    // morning on the wide brown river: the court's barges come down to Chaktomuk
    skyBands(x, W2, 0, 104, ['#7aa0c8', '#c8d8e0', '#f6e2b0']);
    x.fillStyle = '#6f8a5a'; x.fillRect(0, 96, W2, 10);
    palms(x, [[40, 104], [70, 102], [400, 104], [440, 102]]);
    seaBand(x, W2, 104, H2, '#5f7f86', '#a9c4c0', 4);
    putShip(x, 'boat', 0, 120, 160, false); putShip(x, 'boat', 0, 230, 182, false); putShip(x, 'boat', 0, 330, 150, false);
    putUnit(x, 'ponhea', 0, 236, 168, 'idle', 0); putUnit(x, 'sangha', 0, 128, 148);
    ground(x, W2, 196, H2, '#6f8a5a', '#5a7448');
  } else if (id === 'flood' || id === 'rise') {
    // the river spreads over the fields; farmers raise an earth dike
    skyBands(x, W2, 0, 96, ['#4a5a78', '#7a8aa0', '#a8b4c0']);
    for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(200,215,230,.45)'; x.fillRect((i * 53) % W2, (i * 29) % 90, 1, 6); }
    seaBand(x, W2, 96, H2, '#5a7a8a', '#9ab8c4', 8);
    x.fillStyle = '#7a5a38'; x.fillRect(250, 150, W2 - 250, 66); x.fillStyle = '#9a7448'; x.fillRect(250, 150, W2 - 250, 4);
    for (let i = 0; i < 6; i++) { x.fillStyle = '#6a4c2c'; x.fillRect(250 + i * 38, 156, 20, 2); }
    putUnit(x, 'villager', 0, 300, 196, 'work', 1); putUnit(x, 'villager', 0, 350, 200, 'work', 0); putUnit(x, 'villager', 0, 410, 194, 'walk', 2);
    putUnit(x, 'ponhea', 0, 450, 204, 'idle', 0, true);
    putShip(x, 'boat', 0, 120, 170, false);
  } else if (id === 'founded' || id === 'dry') {
    // the palace on its hill above the fields
    skyBands(x, W2, 0, 110, ['#8ab0d8', '#d8e4e8', '#f8e8c0']);
    ground(x, W2, 110, H2, '#7a9a62', '#678752');
    x.fillStyle = '#86a86c'; x.beginPath(); x.moveTo(130, 140); x.lineTo(240, 100); x.lineTo(350, 140); x.fill();
    try { putBld(x, buildingSprite('towncentre', 0, 1), 240, 132, 1); } catch (e) { /* no art */ }
    if (id === 'dry') { seaBand(x, 120, 150, H2, '#5a7a8a', '#9ab8c4', 3); x.fillStyle = '#7a5a38'; x.fillRect(116, 146, 10, 70); }
    putUnit(x, 'ponhea', 0, 280, 170, 'idle', 0); putUnit(x, 'sangha', 0, 330, 176);
  } else if (id === 'village') {
    // the monks at a river village
    skyBands(x, W2, 0, 100, ['#8ab0d8', '#e0e8e0', '#f8e0b0']);
    seaBand(x, W2, 150, H2, '#5f7f86', '#a9c4c0', 2);
    ground(x, W2, 100, 150, '#7a9a62', '#678752');
    try { putBld(x, buildingSprite('village', 2, 0), 300, 146, 1); } catch (e) { /* no art */ }
    putUnit(x, 'sangha', 0, 180, 146); putUnit(x, 'villager', 0, 230, 146, 'idle', 0, true);
  } else if (id === 'raid' || id === 'fall') {
    skyBands(x, W2, 0, 110, id === 'fall' ? ['#3a2a3a', '#7a4a3a', '#c07a4a'] : ['#8ab0d8', '#d8e4e8', '#f8e8c0']);
    ground(x, W2, 110, H2, '#7a9a62', '#678752');
    putUnit(x, 'keris', 1, 120, 180, 'walk', 1); putUnit(x, 'tombak', 1, 160, 190, 'walk', 2); putUnit(x, 'archer', 1, 90, 196, 'walk', 0);
    if (id === 'raid') { putUnit(x, 'sna', 0, 360, 186, 'attack', 1, true); putUnit(x, 'tombak', 0, 320, 194, 'idle', 0, true); }
    else { x.fillStyle = 'rgba(40,20,20,.35)'; x.fillRect(0, 0, W2, H2); }
  } else if (id === 'closing') {
    // Daun Penh's shrine on the hill; the log on the river
    skyBands(x, W2, 0, 110, ['#e8a070', '#f6c890', '#f8e8c0']);
    x.fillStyle = '#6f8a5a'; x.beginPath(); x.moveTo(200, 150); x.lineTo(300, 92); x.lineTo(400, 150); x.fill();
    // a small stupa on the hilltop
    x.fillStyle = '#e8dcc0'; x.fillRect(288, 70, 24, 24); x.fillRect(292, 60, 16, 10); x.fillRect(297, 46, 6, 14); x.fillStyle = '#e8b830'; x.fillRect(299, 40, 2, 6);
    x.fillStyle = '#c8b898'; x.fillRect(288, 90, 24, 4);
    seaBand(x, W2, 150, H2, '#5f7f86', '#a9c4c0', 5);
    x.fillStyle = '#6a4a2a'; x.fillRect(80, 176, 60, 8); x.fillStyle = '#8a6a40'; x.fillRect(84, 176, 52, 2); x.fillStyle = '#e8b830'; x.fillRect(104, 172, 4, 4); x.fillRect(112, 172, 4, 4);
    putUnit(x, 'villager', 0, 180, 168, 'idle', 0, true); putUnit(x, 'ponhea', 0, 360, 150); putUnit(x, 'sangha', 0, 420, 150);
  }
  return c;
}
