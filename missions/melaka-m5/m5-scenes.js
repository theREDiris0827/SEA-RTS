/* ===== m5-scenes.js ===== */
/* Story-card scenes built from the game sprites (helpers from the Island City). */
const SCENE_W = 480, SCENE_H = 216;

function sceneCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  return [c, x];
}
function skyBands(x, w, y0, y1, cols) {
  const n = Math.ceil((y1 - y0) / 4);
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1) * (cols.length - 1), k = Math.min(cols.length - 2, Math.floor(t));
    x.fillStyle = mixHex(cols[k], cols[k + 1], t - k); x.fillRect(0, y0 + i * 4, w, 4);
  }
}
function mixHex(a, b, t) {
  const p = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b);
  return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')';
}
function seaBand(x, w, y0, y1, deep, light, seed) {
  x.fillStyle = deep; x.fillRect(0, y0, w, y1 - y0);
  let s = seed || 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  x.fillStyle = light;
  for (let i = 0; i < (y1 - y0) * w / 900; i++) { const yy = y0 + 4 + Math.floor(rnd() * (y1 - y0 - 6) / 2) * 2; x.fillRect(Math.floor(rnd() * w / 2) * 2, yy, 6 + Math.floor(rnd() * 4) * 2, 2); }
}
function glow(x, cx, cy, r, col) {
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
}
function putUnit(x, kind, team, fx, fy, anim, f, flip) {
  const spr = unitSprite(kind, team, anim || 'idle', f || 0);
  if (flip) { x.save(); x.translate(fx, 0); x.scale(-1, 1); x.drawImage(spr, -(spr.width >> 1), fy + 5 - spr.height); x.restore(); }
  else x.drawImage(spr, fx - (spr.width >> 1), fy + 5 - spr.height);
}
function putShip(x, kind, team, cx, wy, flip) {
  const u = { kind, team }, spr = shipSprite(u), a = shipAnchor(kind, team);
  if (flip) { x.save(); x.translate(cx, 0); x.scale(-1, 1); x.drawImage(spr, -a[0], wy - a[1]); x.restore(); }
  else x.drawImage(spr, cx - a[0], wy - a[1]);
}
function putBld(x, spr, cx, by, s) { s = s || 1; x.drawImage(spr, Math.round(cx - spr.width * s / 2), by - spr.height * s, spr.width * s, spr.height * s); }
function ground(x, w, y0, y1, top, base) { x.fillStyle = base; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = top; x.fillRect(0, y0, w, 4); }
function river(x, w, y0, y1) {
  x.fillStyle = '#4a8fb0'; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = '#7cc4d8'; for (let i = 0; i < 14; i++) x.fillRect((i * 53) % w, y0 + 6 + (i % 4) * 7, 14, 2);
  x.fillStyle = '#b8a56d'; x.fillRect(0, y0 - 4, w, 6);
}
function flames(x, cx, by, s) { glow(x, cx, by - 14 * s, 36 * s, 'rgba(255,130,40,.55)'); for (const [dx, hh, c] of [[-8, 14, '#e8582a'], [-2, 22, '#f2a33a'], [5, 16, '#e8582a'], [0, 10, '#ffe08a']]) { x.fillStyle = c; x.fillRect(cx + dx * s, by - hh * s, 5 * s, hh * s); } }
function smokeCol(x, cx, by) { for (let i = 0; i < 7; i++) { x.fillStyle = 'rgba(70,64,60,' + (0.55 - i * 0.06).toFixed(2) + ')'; x.fillRect(cx - 6 - i * 2 + i * i, by - 12 - i * 12, 14 + i * 3, 12); } }
function ptShip(x, k, cx, wy) { const s = AUX.auxShipSprite('pt', k); x.drawImage(s, Math.round(cx - s.width / 2), Math.round(wy - s.height * 0.72)); }
function ptMan(x, kind, fx, fy, anim, f, flip) { const s = AUX.auxUnitSprite('pt', kind, anim || 'idle', f || 0); if (flip) { x.save(); x.translate(fx, 0); x.scale(-1, 1); x.drawImage(s, -(s.width >> 1), fy + 5 - s.height); x.restore(); } else x.drawImage(s, fx - (s.width >> 1), fy + 5 - s.height); }
function bridgeSide(x, x0, x1, y) { x.fillStyle = '#ae8650'; x.fillRect(x0, y, x1 - x0, 10); x.fillStyle = '#6e4e26'; for (let i = x0; i < x1; i += 8) x.fillRect(i, y, 1, 10); x.fillStyle = '#4e3418'; x.fillRect(x0, y - 8, x1 - x0, 3); for (let i = x0; i < x1; i += 24) x.fillRect(i, y - 8, 3, 18); }
function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  if (id === 'opening' || id === 'final') {
    // the carracks in the roads, the boats pulling for the beach, the stockade and the guns waiting
    skyBands(x, W2, 0, 100, id === 'final' ? ['#e8a060', '#f2c48a', '#f6dcb0'] : ['#7ab8d8', '#a8d4e4', '#dcecef']);
    seaBand(x, W2, 96, 168, '#2f6f90', '#5aa0c0', 3);
    ptShip(x, 'nau', 70, 120); ptShip(x, 'nau', 190, 112); ptShip(x, 'caravel', 300, 118);
    for (const bx of [120, 250, 360]) { x.drawImage(ptBoatSprite(), bx, 140); }
    ground(x, W2, 168, H2, '#e6d6a0', '#d4c088');
    x.fillStyle = '#5e3b1c'; for (let i = 0; i < W2; i += 7) x.fillRect(i, 176, 5, 22); x.fillStyle = '#7a4a24'; x.fillRect(0, 184, W2, 3);
    for (const fx of [60, 200, 340]) putUnit(x, 'cannon', 0, fx, 210, 'idle', 0);
    for (const fx of [110, 150, 250, 290, 400, 440]) putUnit(x, 'musket', 0, fx, 210, 'idle', 0);
    if (id === 'final') { glow(x, 240, 80, 120, 'rgba(255,170,90,.25)'); }
  } else if (id === 'withdraw' || id === 'albhurt' || id === 'won') {
    // the bridge held: Melaka men on the planks, the boats rowing back to the ships
    skyBands(x, W2, 0, 90, ['#3a3a5a', '#a86a5a', '#e8a070']);
    seaBand(x, W2, 86, 140, '#2a5a78', '#4a88a8', 5);
    ptShip(x, 'nau', 90, 110); ptShip(x, 'nau', 380, 104);
    x.drawImage(ptBoatSprite(), 210, 112); x.drawImage(ptBoatSprite(), 290, 118);
    river(x, W2, 160, H2);
    bridgeSide(x, 0, W2, 150);
    putUnit(x, 'rajaahmad', 0, 240, 152, 'idle', 0);
    for (const fx of [140, 180, 300, 340]) putUnit(x, 'pahlawan', 0, fx, 152, 'idle', 0);
    for (const fx of [60, 100, 380, 420]) putUnit(x, 'musket', 0, fx, 152, 'idle', 0);
    smokeCol(x, 30, 140); flames(x, 450, 150, 1);
  } else {
    // the bridge lost: the cross flies over the planks, smoke over the city
    skyBands(x, W2, 0, 150, ['#2a2224', '#6a4a40', '#a86a50']);
    for (const cx of [60, 180, 330, 430]) smokeCol(x, cx, 150);
    river(x, W2, 160, H2); bridgeSide(x, 0, W2, 150);
    for (const fx of [120, 170, 220, 270, 320, 370]) ptMan(x, ['sword', 'pike', 'gun'][fx % 3], fx, 152, 'idle', 0);
    x.fillStyle = '#5e3b1c'; x.fillRect(240, 70, 2, 70); x.fillStyle = '#f4ecd4'; x.fillRect(242, 70, 26, 18); x.fillStyle = '#c0392b'; x.fillRect(252, 72, 6, 14); x.fillRect(245, 76, 20, 6);
  }
  return c;
}
