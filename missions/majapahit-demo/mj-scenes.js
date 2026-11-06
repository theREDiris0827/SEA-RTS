/* ===== mj-scenes.js ===== */
/* Pixel-art scenes for the story cards and the short mid-battle moments. Built from the game's own
   sprites on painted backdrops (same approach as the Melaka, Đại Việt and Ayutthaya demos). */
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
// horizontal bands, 4px tall, blending top -> bottom through the given colours
function skyBands(x, w, y0, y1, cols) {
  const n = Math.ceil((y1 - y0) / 4);
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1) * (cols.length - 1), k = Math.min(cols.length - 2, Math.floor(t));
    x.fillStyle = mixHex(cols[k], cols[k + 1], t - k); x.fillRect(0, y0 + i * 4, w, 4);
  }
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
function ground(x, w, y0, y1, top, base) { x.fillStyle = base; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = top; x.fillRect(0, y0, w, 4); }
// a unit standing with its feet at (fx, fy); flip faces it left
function putUnit(x, kind, team, fx, fy, anim, f, flip) {
  const spr = unitSprite(kind, team, anim || 'idle', f || 0);
  if (flip) { x.save(); x.translate(fx, 0); x.scale(-1, 1); x.drawImage(spr, -(spr.width >> 1), fy + 5 - spr.height); x.restore(); }
  else x.drawImage(spr, fx - (spr.width >> 1), fy + 5 - spr.height);
}
function putShip(x, kind, team, cx, wy, flip) {
  const u = { kind, team }, spr = shipSprite(u), a = shipAnchor(kind);
  if (flip) { x.save(); x.translate(cx, 0); x.scale(-1, 1); x.drawImage(spr, -a[0], wy - a[1]); x.restore(); }
  else x.drawImage(spr, cx - a[0], wy - a[1]);
}
function putBld(x, spr, cx, by, s) { s = s || 1; x.drawImage(spr, Math.round(cx - spr.width * s / 2), by - spr.height * s, spr.width * s, spr.height * s); }
function flames(x, list, f) {
  for (const [fx, fy, s] of list) {
    x.fillStyle = '#a8301c'; x.fillRect(fx - s, fy - s * 2, s * 2, s * 2);
    x.fillStyle = '#e2562c'; x.fillRect(fx - s + 2, fy - s * 3 + (f & 1) * 2, s * 2 - 4, s * 2);
    x.fillStyle = '#f6b33a'; x.fillRect(fx - 2, fy - s * 2 - 2, 4, s);
    x.fillStyle = '#fff3a0'; x.fillRect(fx - 1, fy - 4, 2, 2);
  }
}
// Singapura's hill: Bukit Larangan with the palace on top, the earth rampart along its foot
function sgHill(x, y, palScale) {
  x.fillStyle = '#2f4a2a'; x.fillRect(120, y - 20, 240, 20); x.fillRect(160, y - 34, 160, 14); x.fillRect(200, y - 44, 80, 10);
  const pal = buildingSprite('palace', 1, 2); putBld(x, pal, 240, y - 36, palScale || 0.6);
}
function rampart(x, from, to, y) { for (let px = from; px < to; px += 32) putBld(x, earthWallSprite(2 | 8), px + 16, y); }
// the red and white banner of Majapahit (gula kelapa)
function banner(x, fx, fy, h) {
  x.fillStyle = '#2a1d14'; x.fillRect(fx, fy, 2, h);
  x.fillStyle = '#d0392f'; x.fillRect(fx + 2, fy, 20, 6); x.fillStyle = '#f3e8c9'; x.fillRect(fx + 2, fy + 6, 20, 6);
}

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  if (id === 'opening') {
    // dawn on the Strait: the Majapahit fleet rides off Singapura's hill
    skyBands(x, W2, 0, 112, ['#2a2f55', '#8a5a7a', '#e89a6a', '#f6d29a']);
    glow(x, 400, 104, 80, 'rgba(255,214,140,.65)');
    x.fillStyle = '#ffe2a0'; x.fillRect(390, 92, 20, 12);
    sgHill(x, 112); rampart(x, 100, 380, 116);
    x.fillStyle = '#c9b47c'; x.fillRect(0, 112, W2, 6);
    seaBand(x, W2, 118, H2, '#2a5f7e', '#6aa8c0', 4);
    x.fillStyle = 'rgba(255,220,150,.35)'; for (let i = 0; i < 8; i++) x.fillRect(388 + (i % 3) * 6, 124 + i * 9, 26 - (i % 3) * 6, 2);
    putShip(x, 'flagship', 0, 140, 196); putShip(x, 'light', 0, 300, 172, true); putShip(x, 'light', 0, 380, 190, true);
    putShip(x, 'fireship', 0, 250, 206, true); putShip(x, 'galley', 0, 40, 168);
  } else if (id === 'siege') {
    // the siege begins: troops wade ashore below the rampart while the trader's boat slips toward the south gate
    skyBands(x, W2, 0, 110, ['#5a7aa0', '#a8c0d0', '#e8e0c8']);
    sgHill(x, 108, 0.55); rampart(x, -8, 220, 120); rampart(x, 260, 480, 120); putBld(x, cityGateSprite(0), 240, 122);
    putUnit(x, 'sg_archer', 1, 140, 98, 'attack', 1, true); putUnit(x, 'sg_spear', 1, 330, 98, 'idle', 0, true);
    ground(x, W2, 120, 150, '#c9b47c', '#a8925c');
    seaBand(x, W2, 150, H2, '#2a6a8a', '#79b8c8', 6);
    putUnit(x, 'keris', 0, 110, 148, 'walk', 1); putUnit(x, 'tombak', 0, 140, 146, 'walk', 2); putUnit(x, 'keris', 0, 170, 150, 'walk', 0); putUnit(x, 'archer', 0, 80, 150, 'attack', 0);
    putShip(x, 'light', 0, 120, 194); putShip(x, 'msgboat', 0, 320, 186, true);
    putUnit(x, 'utusan', 0, 268, 146, 'walk', 1, true);
  } else if (id === 'siam') {
    // Ayutthaya's column on the north-west track: elephants and spears under purple banners
    skyBands(x, W2, 0, 110, ['#7a9ac0', '#c0d0d8', '#e8e0c0']);
    x.fillStyle = '#3e5a36'; x.fillRect(0, 84, W2, 30); x.fillStyle = '#2f4a2a'; for (let i = 0; i < 14; i++) x.fillRect(i * 36, 78 - (i % 3) * 6, 30, 10);
    ground(x, W2, 110, H2, '#8a7a4a', '#6f6238');
    x.fillStyle = '#a08a58'; x.fillRect(0, 160, W2, 18);
    putUnit(x, 'ay_chang', 3, 140, 186, 'walk', 1); putUnit(x, 'ay_chang', 3, 260, 180, 'walk', 3);
    putUnit(x, 'ay_daab', 3, 340, 190, 'walk', 0); putUnit(x, 'ay_hok', 3, 370, 184, 'walk', 2); putUnit(x, 'ay_thanu', 3, 400, 192, 'walk', 1); putUnit(x, 'ay_hok', 3, 60, 192, 'walk', 0);
    for (const fx of [200, 316]) { x.fillStyle = '#2a1d14'; x.fillRect(fx, 120, 2, 50); x.fillStyle = '#7b4bb3'; x.fillRect(fx + 2, 120, 16, 10); x.fillStyle = '#f2c94c'; x.fillRect(fx + 2, 120, 16, 2); }
  } else if (id === 'olally' || id === 'olhostile') {
    // the Orang Laut village on its stilts at the water's edge
    const ally = id === 'olally';
    skyBands(x, W2, 0, 128, ally ? ['#7fb8d8', '#c8e0e6', '#eef2e0'] : ['#3a3a52', '#6a5a6a', '#b08070']);
    x.fillStyle = '#4f8a3e'; x.fillRect(0, 86, 260, 34); x.fillStyle = '#2f5a2a'; for (let i = 0; i < 8; i++) x.fillRect(i * 32, 76 - (i % 2) * 6, 28, 12);
    x.fillStyle = '#c9b47c'; x.fillRect(0, 118, 280, 8);
    putBld(x, buildingSprite('village', 2, 2), 150, 140);
    seaBand(x, W2, 126, H2, '#2a6a8a', '#79b8c8', 12);
    if (ally) { banner(x, 210, 70, 50); putShip(x, 'olboat', 2, 320, 180); putShip(x, 'olboat', 2, 410, 196, true); putShip(x, 'galley', 0, 250, 206, true); }
    else { putShip(x, 'olboat', 1, 300, 176, true); putShip(x, 'olboat', 1, 400, 196, true); x.fillStyle = '#1f9e9a'; x.fillRect(212, 70, 2, 50); x.fillRect(214, 70, 18, 12); }
  } else if (id === 'olburn') {
    skyBands(x, W2, 0, 128, ['#2a1a2a', '#6a2a2a', '#c0603a']);
    x.fillStyle = '#2a3a22'; x.fillRect(0, 96, 280, 24);
    putBld(x, buildingSprite('village', 2, 2), 150, 140);
    flames(x, [[130, 108, 9], [160, 116, 7], [182, 104, 8]], 1);
    x.fillStyle = 'rgba(60,50,60,.55)'; for (let i = 0; i < 6; i++) x.fillRect(140 + i * 6, 80 - i * 12, 22 + i * 4, 10);
    seaBand(x, W2, 126, H2, '#24506a', '#5a90a8', 5);
    putShip(x, 'olboat', 2, 360, 176); putShip(x, 'olboat', 2, 440, 196);
  } else if (id === 'treasurer') {
    // night: the south gate stands open, a lamp in the treasurer's window, the fleet's men creep up the beach
    skyBands(x, W2, 0, 120, ['#0a1020', '#141c34', '#26304a']); stars(x, W2, 80, 46, 7);
    x.fillStyle = '#f4ecc8'; x.beginPath(); x.arc(68, 28, 8, 0, 6.2832); x.fill(); x.fillStyle = '#0c1424'; x.beginPath(); x.arc(72, 25, 7, 0, 6.2832); x.fill();
    sgHill(x, 118, 0.5);
    putBld(x, buildingSprite('bendahari', 1, 2), 380, 112);
    glow(x, 384, 92, 30, 'rgba(255,200,100,.6)');
    rampart(x, -8, 220, 140); rampart(x, 260, 480, 140); putBld(x, cityGateSprite(1), 240, 142);
    glow(x, 240, 128, 26, 'rgba(255,170,80,.45)');
    x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(0, 140, W2, 76);
    ground(x, W2, 142, H2, '#3a5030', '#2a3c24');
    putUnit(x, 'keris', 0, 200, 186, 'walk', 1); putUnit(x, 'tombak', 0, 168, 196, 'walk', 2); putUnit(x, 'keris', 0, 230, 200, 'walk', 0); putUnit(x, 'bhaya', 0, 136, 204, 'walk', 3);
    putUnit(x, 'utusan', 0, 270, 170, 'idle', 0, true);
  } else if (id === 'breach') {
    skyBands(x, W2, 0, 120, ['#4a3a4a', '#a0705a', '#f0c090']);
    sgHill(x, 120, 0.55);
    rampart(x, -8, 200, 150); rampart(x, 280, 480, 150);
    ground(x, W2, 150, H2, '#7a6a48', '#665a3c');
    x.fillStyle = 'rgba(170,140,100,.55)'; for (let i = 0; i < 7; i++) x.fillRect(206 + i * 9, 140 - i * 6, 22, 14);
    flames(x, [[214, 146, 7], [262, 150, 6]], 0);
    putUnit(x, 'keris', 0, 200, 196, 'attack', 1); putUnit(x, 'tombak', 0, 236, 202, 'walk', 0); putUnit(x, 'keris', 0, 170, 200, 'attack', 0);
    putUnit(x, 'sg_sword', 1, 300, 196, 'attack', 1, true); putUnit(x, 'sg_spear', 1, 330, 202, 'attack', 0, true);
  } else if (id === 'closing') {
    // dawn: the red and white banner flies on Bukit Larangan; a small boat slips away west along the coast
    skyBands(x, W2, 0, 110, ['#3a3e66', '#b8666a', '#f0b46a', '#f8dca0']);
    x.fillStyle = '#ffe9b0'; x.fillRect(420, 86, 26, 18);
    sgHill(x, 110, 0.6);
    banner(x, 262, 40, 34);
    x.fillStyle = 'rgba(60,50,60,.45)'; for (let i = 0; i < 5; i++) x.fillRect(150 + i * 8, 78 - i * 10, 20 + i * 4, 8);
    x.fillStyle = '#c9b47c'; x.fillRect(0, 110, W2, 6);
    seaBand(x, W2, 116, H2, '#2c6f8e', '#79b8c8', 9);
    putShip(x, 'flagship', 0, 330, 186, true);
    putShip(x, 'boat', 1, 70, 150, true);
    x.fillStyle = '#e8b830'; x.fillRect(62, 128, 8, 4); x.fillRect(62, 124, 2, 4); x.fillRect(65, 124, 2, 4); x.fillRect(68, 124, 2, 4);
  } else if (id === 'fall') {
    const [c2, y] = sceneCanvas(240, 96);
    if (G && G.M && G.M.why === 'siam') {
      skyBands(y, 240, 0, 50, ['#3a2a4a', '#a0705a']);
      ground(y, 240, 46, 96, '#6a5a3a', '#5a4c30');
      { const p = buildingSprite('palace', 1, 2); y.drawImage(p, 120 - p.width * 0.25, 60 - p.height * 0.5, p.width * 0.5, p.height * 0.5); }
      y.fillStyle = '#2a1d14'; y.fillRect(150, 10, 2, 30); y.fillStyle = '#7b4bb3'; y.fillRect(152, 10, 16, 10); y.fillStyle = '#f2c94c'; y.fillRect(152, 10, 16, 2);
      putUnit(y, 'ay_chang', 3, 60, 90, 'idle', 0); putUnit(y, 'ay_hok', 3, 190, 92, 'idle', 0, true);
    } else {
      skyBands(y, 240, 0, 44, ['#14121e', '#3a2430']); glow(y, 120, 60, 90, 'rgba(255,120,40,.45)');
      seaBand(y, 240, 44, 96, '#1f3f56', '#3c6a86', 2);
      y.save(); y.translate(120, 74); y.rotate(0.35); { const s = shipSprite({ kind: 'flagship', team: 0 }), a = shipAnchor('flagship'); y.drawImage(s, -a[0], -a[1]); } y.restore();
      flames(y, [[110, 60, 7], [134, 66, 5]], 1);
      y.fillStyle = '#1f3f56'; y.fillRect(0, 78, 240, 18);
    }
    return c2;
  } else if (id === 'harbour') {
    const [c2, y] = sceneCanvas(240, 96);
    skyBands(y, 240, 0, 46, ['#2a1a2a', '#a04a2a']); seaBand(y, 240, 60, 96, '#24506a', '#5a90a8', 3);
    putBld(y, buildingSprite('port', 1, 2), 120, 76, 0.5);
    flames(y, [[100, 52, 7], [130, 58, 6], [146, 50, 5]], 0);
    return c2;
  } else if (id === 'gift') {
    const [c2, y] = sceneCanvas(240, 96);
    skyBands(y, 240, 0, 50, ['#7fb8d8', '#e4f0e0']); ground(y, 240, 50, 96, '#c9b47c', '#a8925c');
    putUnit(y, 'villager', 0, 80, 84, 'idle', 0); putUnit(y, 'keris', 0, 54, 86);
    y.fillStyle = '#c9a35a'; y.fillRect(104, 76, 12, 8); y.fillStyle = '#8a5a2b'; y.fillRect(118, 78, 10, 6);
    putUnit(y, 'villager', 1, 160, 84, 'idle', 0, true);
    return c2;
  }
  return c;
}
