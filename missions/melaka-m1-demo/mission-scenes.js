/* ===== mission-scenes.js ===== */
/* Pixel-art scenes for the story cards and the two mid-battle moments (the Temenggung's fall,
   Siamese sails). Built from the game's own sprites on painted backdrops, so they match the map. */
const SCENE_W = 480, SCENE_H = 216;

function sceneCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  return [c, x];
}
// horizontal bands, 4px tall, blending top -> bottom through the given colours
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
function stars(x, w, h, n, seed) {
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  x.fillStyle = '#e8eedd';
  for (let i = 0; i < n; i++) x.fillRect(Math.floor(rnd() * w / 2) * 2, Math.floor(rnd() * h / 2) * 2, 2, 2);
}
function glow(x, cx, cy, r, col) {
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
}
// a unit standing with its feet at (fx, fy); flip faces it left
function putUnit(x, kind, team, fx, fy, anim, f, flip) {
  const spr = unitSprite(kind, team, anim || 'idle', f || 0);
  if (flip) { x.save(); x.translate(fx, 0); x.scale(-1, 1); x.drawImage(spr, -16, fy + 5 - spr.height); x.restore(); }
  else x.drawImage(spr, fx - 16, fy + 5 - spr.height);
}
function putShip(x, kind, team, cx, wy, flip) {
  const u = { kind, team }, spr = shipSprite(u), a = shipAnchor(kind);
  if (flip) { x.save(); x.translate(cx, 0); x.scale(-1, 1); x.drawImage(spr, -a[0], wy - a[1]); x.restore(); }
  else x.drawImage(spr, cx - a[0], wy - a[1]);
}
function putBld(x, spr, cx, by) { x.drawImage(spr, Math.round(cx - spr.width / 2), by - spr.height); }
function dogSprite(f) {
  return sprite('dog|' + f, 16, 12, 2, (P) => {
    const r = P.r, c = '#c9b07a', d = '#8e7448', l = f ? 1 : 0;
    r(3, 4, 8, 4, c); r(3, 7, 8, 1, d); r(10, 2, 4, 4, c); r(13, 4, 2, 1, '#3a2a1a'); r(10, 1, 2, 2, d); r(12, 3, 1, 1, '#1c1c1c');
    r(1, 3, 2, 1, c); r(0, 2, 1, 1, c);
    r(4, 8, 1, 3 - l, d); r(6, 8, 1, 2 + l, d); r(8, 8, 1, 2 + l, d); r(10, 8, 1, 3 - l, d);
  });
}
function ground(x, w, y0, y1, top, base) { x.fillStyle = base; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = top; x.fillRect(0, y0, w, 4); }
function wallRun(x, from, to, y, burnt) {
  for (let px = from; px < to; px += 32) putBld(x, wallSprite(2 | 8 | (burnt && px > from + 40 && px < from + 140 ? 16 : 0)), px + 16, y);
}

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  if (id === 'opening') {
    // night: Singapura's south wall above the beach, the Majapahit fleet coming in
    skyBands(x, W2, 0, 112, ['#0b1424', '#16243a', '#28405a']); stars(x, W2, 80, 46, 11);
    x.fillStyle = '#f4ecc8'; x.fillRect(404, 18, 16, 16); x.fillStyle = '#d8cfa4'; x.fillRect(408, 22, 4, 4); x.fillRect(414, 28, 2, 2);
    x.fillStyle = '#1a2a22'; x.fillRect(0, 64, 180, 48); x.fillRect(20, 52, 120, 12); x.fillRect(50, 44, 60, 8);
    { const pal = buildingSprite('palace', 0, 2); x.drawImage(pal, 80 - pal.width * 0.3, 92 - pal.height * 0.6, pal.width * 0.6, pal.height * 0.6); }
    ground(x, W2, 108, 136, '#3f6b33', '#2e5226');
    wallRun(x, -8, 470, 132, true);
    putBld(x, gateSprite(0), 232, 134);
    putBld(x, buildingSprite('tower', 0, 2), 170, 136); putBld(x, buildingSprite('tower', 0, 2), 440, 136);
    ground(x, W2, 136, 150, '#c9b47c', '#a8925c');
    seaBand(x, W2, 150, H2, '#1f4f6e', '#3c7896', 5);
    putUnit(x, 'temenggung', 0, 268, 146); putUnit(x, 'sg_spear', 0, 292, 147); putUnit(x, 'sg_archer', 0, 210, 147, 'idle', 0, true);
    putShip(x, 'frigate', 1, 380, 200, true); putShip(x, 'galley', 1, 250, 210, true); putShip(x, 'galley', 1, 110, 206, true);
  } else if (id === 'twist') {
    // the postern stands open: torches pour through while the Temenggung's guard turns to meet them
    skyBands(x, W2, 0, 120, ['#0a1020', '#1c1a2c', '#3a2430']); stars(x, W2, 70, 30, 23);
    glow(x, 150, 120, 150, 'rgba(255,140,50,.45)');
    ground(x, W2, 116, H2, '#36572c', '#28441f');
    wallRun(x, -8, 120, 140); wallRun(x, 184, 300, 140);
    putBld(x, gateSprite(1 | 2), 152, 142);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 150, W2, 66);
    putUnit(x, 'obor', 1, 140, 176, 'walk', 1); putUnit(x, 'obor', 1, 170, 186, 'walk', 2); putUnit(x, 'tombak', 1, 110, 192, 'walk', 0); putUnit(x, 'tombak', 1, 196, 200, 'walk', 3);
    putUnit(x, 'temenggung', 0, 330, 194, 'attack', 1, true); putUnit(x, 'sg_spear', 0, 362, 184, 'idle', 0, true); putUnit(x, 'sg_sword', 0, 372, 206, 'idle', 0, true);
    putUnit(x, 'parameswara', 0, 446, 180, 'walk', 1); putUnit(x, 'villager', 0, 468, 196, 'walk', 2);
  } else if (id === 'strait') {
    // dawn on the Strait: the boats slip west while the city burns on the horizon
    skyBands(x, W2, 0, 104, ['#3a3e66', '#b8666a', '#f0b46a', '#f8dca0']);
    x.fillStyle = '#ffe9b0'; x.fillRect(60, 84, 28, 20); x.fillStyle = '#ffd27a'; x.fillRect(56, 92, 36, 12);
    x.fillStyle = '#3a2a2e'; x.fillRect(330, 88, 150, 16); x.fillRect(360, 80, 70, 8); x.fillRect(392, 72, 18, 8);
    glow(x, 400, 92, 70, 'rgba(255,90,40,.55)');
    x.fillStyle = 'rgba(60,50,60,.55)'; for (let i = 0; i < 6; i++) x.fillRect(370 + i * 8 - i * i * 2, 64 - i * 10, 22 + i * 4, 10);
    seaBand(x, W2, 104, H2, '#2c6f8e', '#79b8c8', 9);
    x.fillStyle = 'rgba(255,220,150,.35)'; for (let i = 0; i < 9; i++) x.fillRect(64 + (i % 3) * 6, 108 + i * 8, 24 - (i % 3) * 6, 2);
    putShip(x, 'frigate', 1, 412, 150, true);
    putShip(x, 'olboat', 0, 120, 176); putShip(x, 'olboat', 0, 210, 196); putShip(x, 'olboat', 0, 260, 160);
    x.fillStyle = '#e8b830'; x.fillRect(118, 124, 8, 4); x.fillRect(118, 120, 2, 4); x.fillRect(121, 120, 2, 4); x.fillRect(124, 120, 2, 4);
  } else if (id === 'closing') {
    // by the river at Bertam: the mouse deer kicks the hound, Parameswara watches under the melaka tree
    skyBands(x, W2, 0, 110, ['#7fb8d8', '#b6dbe6', '#e4f0e0']);
    x.fillStyle = '#f2f6ec'; x.fillRect(300, 26, 60, 10); x.fillRect(312, 18, 32, 8); x.fillRect(80, 40, 44, 8);
    x.fillStyle = '#5f8a4a'; x.fillRect(0, 92, W2, 18);
    ground(x, W2, 108, H2, '#6fa55a', '#4f8a3e');
    x.fillStyle = '#4a8fb0'; x.fillRect(0, 176, W2, 40); x.fillStyle = '#7cc4d8'; for (let i = 0; i < 12; i++) x.fillRect((i * 53) % W2, 184 + (i % 4) * 7, 14, 2);
    x.fillStyle = '#b8a56d'; x.fillRect(0, 172, W2, 6);
    { const t = treeSprite(3); x.drawImage(t, 330, 170 - t.height * 2, t.width * 2, t.height * 2); }
    putBld(x, treeSprite(2), 460, 140); putBld(x, treeSprite(0), 40, 136); putBld(x, treeSprite(1), 120, 120);
    x.drawImage(deerSprite(1), 190, 132);
    x.save(); x.translate(160, 156); x.rotate(-0.5); x.drawImage(dogSprite(0), -16, -12); x.restore();
    x.drawImage(dogSprite(1), 236, 148);
    putUnit(x, 'parameswara', 0, 352, 168, 'idle', 0, true); putUnit(x, 'villager', 0, 400, 172, 'idle', 0, true); putUnit(x, 'sg_spear', 0, 424, 160, 'idle', 0, true);
  } else if (id === 'fall') {
    const [c2, y] = sceneCanvas(240, 96);
    skyBands(y, 240, 0, 50, ['#14121e', '#3a2430']); glow(y, 120, 50, 90, 'rgba(255,120,40,.4)');
    ground(y, 240, 46, 96, '#36572c', '#28441f');
    wallRun(y, -8, 90, 70); wallRun(y, 150, 250, 70); putBld(y, gateSprite(1 | 2), 120, 72);
    y.save(); y.translate(120, 78); y.rotate(-Math.PI / 2); y.drawImage(unitSprite('temenggung', 0, 'idle', 0), -20, -16); y.restore();
    putUnit(y, 'obor', 1, 80, 90, 'idle', 0); putUnit(y, 'tombak', 1, 168, 92, 'idle', 0, true);
    return c2;
  } else if (id === 'proclaim') {
    const [c2, y] = sceneCanvas(240, 96);
    skyBands(y, 240, 0, 44, ['#7fb8d8', '#e4f0e0']); ground(y, 240, 40, 96, '#6fa55a', '#4f8a3e');
    { const t = buildingSprite('towncentre', 0, 2); y.drawImage(t, 120 - t.width * 0.3, 70 - t.height * 0.6, t.width * 0.6, t.height * 0.6); }
    putUnit(y, 'parameswara', 0, 120, 88); putUnit(y, 'tombak', 0, 70, 90, 'idle', 0); putUnit(y, 'keris', 0, 92, 92); putUnit(y, 'villager', 0, 150, 92, 'idle', 0, true); putUnit(y, 'archer', 0, 174, 90, 'idle', 0, true);
    return c2;
  } else if (id === 'siam') {
    const [c2, y] = sceneCanvas(240, 96);
    skyBands(y, 240, 0, 40, ['#8cc0dc', '#d6ecf0']); seaBand(y, 240, 40, 96, '#2c6f8e', '#79b8c8', 3);
    putShip(y, 'ayu_frigate', 2, 70, 76); putShip(y, 'ayu_galley', 2, 160, 84); putShip(y, 'ayu_galley', 2, 210, 62);
    return c2;
  }
  return c;
}

// a short picture-and-caption moment that doesn't pause the game
function vignette(id, text) {
  const box = $('vignette'); if (!box) return;
  box.innerHTML = ''; const cnv = drawScene(id); box.appendChild(cnv);
  const p = document.createElement('div'); p.textContent = text; box.appendChild(p);
  box.hidden = false; clearTimeout(vignette.t);
  vignette.t = setTimeout(() => { box.hidden = true; }, 5000);
}
