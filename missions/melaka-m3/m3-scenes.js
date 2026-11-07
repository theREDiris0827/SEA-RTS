/* ===== m3-scenes.js ===== */
/* Pixel scenes for the story cards, built from the game's own sprites (Melaka people and Penjajap,
   Ayutthaya ships, the Mangrove Delta's own mangrove trees) on painted backdrops. Helpers as in Island City. */
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
function mangrove(x, cx, by, s) { const spr = CALM.plant('mangrove'); putBld(x, spr, cx, by, s || 2); return spr.height * (s || 2); }
// a torch tied in a crown: pole and a three-colour pixel flame, with a stepped glow
function sceneTorch(x, cx, cy, big) {
  const s = big ? 2 : 1;
  for (const [r, a] of [[15, 0.10], [10, 0.14], [6, 0.2]]) { x.fillStyle = 'rgba(255,150,60,' + a + ')'; x.fillRect(cx - r * s, cy - r * s, r * 2 * s, r * 2 * s); }
  x.fillStyle = '#5e3b1c'; x.fillRect(cx - s, cy, 2 * s, 10 * s);
  for (const [dx, dy, w, h, c] of [[-2, -7, 4, 7, '#e8582a'], [-1, -9, 2, 3, '#e8582a'], [-1, -6, 3, 5, '#f2a33a'], [0, -4, 2, 3, '#ffe08a']]) { x.fillStyle = c; x.fillRect(cx + dx * s, cy + dy * s, w * s, h * s); }
}
function darken(x, w, h, a) { x.fillStyle = 'rgba(8,14,38,' + a + ')'; x.fillRect(0, 0, w, h); }
function stars(x, w, h, n) { let s = 3; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280; x.fillStyle = '#e8e4c8'; for (let i = 0; i < n; i++) x.fillRect(Math.floor(rnd() * w / 2) * 2, Math.floor(rnd() * h / 2) * 2, 2, 2); }
function mud(x, w, y0, y1) { x.fillStyle = '#5c4a34'; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = '#74603f'; for (let i = 0; i < w; i += 22) x.fillRect(i, y0, 12, 2); }

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  if (id === 'opening') {
    // dusk at Batu Pahat: Tun Perak on the mud among the mangroves, sails on the horizon
    skyBands(x, W2, 0, 112, ['#3e3a6a', '#a8586a', '#f0a060', '#f6d08a']);
    x.fillStyle = '#ffd88a'; x.fillRect(318, 92, 36, 18); x.fillStyle = '#ffe9b0'; x.fillRect(324, 88, 24, 4);
    seaBand(x, W2, 112, H2, '#4a5a88', '#e8a070', 4);
    for (const [k, sx] of [['light', 300], ['galley', 360], ['flagship', 410], ['light', 455]]) putShip(x, k, 1, sx, 124, true);
    mud(x, 230, 168, H2);
    for (const [mx, s] of [[30, 2], [92, 2], [196, 2]]) mangrove(x, mx, 178, s);
    putUnit(x, 'perak', 0, 140, 190, 'idle', 0); putUnit(x, 'keris', 0, 110, 194); putUnit(x, 'tombak', 0, 170, 196); putUnit(x, 'villager', 0, 60, 200, 'walk', 1);
    putShip(x, 'light', 0, 290, 206);
  } else if (id === 'night' || id === 'assault') {
    // night: torches burn in a whole line of mangrove crowns; a villager wades out with another
    skyBands(x, W2, 0, 112, ['#060a1e', '#101a3a', '#1c2a50']); stars(x, W2, 90, 40);
    seaBand(x, W2, 112, H2, '#16244a', '#2c4470', 9);
    const ships = [['light', 70], ['galley', 140], ['flagship', 210]];
    for (const [k, sx] of ships) putShip(x, k, 1, sx, 124, false);
    let n = 0; const tops = [];
    for (let mx = 250; mx < W2 + 20; mx += 46, n++) { const h = mangrove(x, mx, 168 + (n % 2) * 6, 2); if (id === 'night' || n % 2) tops.push([mx - 4, 168 + (n % 2) * 6 - h + 8]); }
    if (id === 'night') { putUnit(x, 'villager', 0, 330, 196, 'walk', 1); x.fillStyle = 'rgba(40,70,110,.85)'; x.fillRect(318, 192, 26, 8); putUnit(x, 'perak', 0, 420, 204, 'idle', 0, true); }
    else { putUnit(x, 'keris', 1, 300, 198, 'attack', 1); putUnit(x, 'tombak', 1, 330, 202, 'walk', 2); putUnit(x, 'keris', 0, 380, 200, 'attack', 2, true); x.fillStyle = 'rgba(40,70,110,.85)'; x.fillRect(288, 196, 60, 8); }
    // night falls over everything; then the lights
    darken(x, W2, H2, 0.42);
    for (const [sx] of ships) { x.fillStyle = '#ffd27a'; x.fillRect(sx - 1, 104, 3, 3); }
    for (const [tx, ty] of tops) sceneTorch(x, tx, ty, true);
  } else if (id === 'dawn' || id === 'force' || id === 'closing') {
    // dawn: the Siamese fleet runs for the open sea; Penjajap give chase
    skyBands(x, W2, 0, 112, ['#6a7aa8', '#e8a0a0', '#f8d8a8']);
    x.fillStyle = '#fff0c0'; x.fillRect(60, 96, 30, 16);
    seaBand(x, W2, 112, H2, '#3f6a98', '#c8d8e0', 6);
    if (id !== 'force') for (const [k, sx] of [['light', 40], ['flagship', 110], ['galley', 180]]) putShip(x, k, 1, sx, 140, true);
    else { x.fillStyle = '#3a2a1a'; for (const sx of [70, 150]) { x.fillRect(sx, 150, 30, 4); x.fillRect(sx + 12, 138, 3, 14); } }
    for (const [sx, wy] of [[290, 176], [360, 190], [430, 172]]) putShip(x, 'light', 0, sx, wy, true);
    if (id === 'closing') { mud(x, W2, 200, H2); putUnit(x, 'perak', 0, 240, 208); }
  } else if (id === 'ol') {
    // the Orang Laut boats come out from the creek
    skyBands(x, W2, 0, 100, ['#6a6aa0', '#e8a070', '#f6d08a']);
    seaBand(x, W2, 100, H2, '#3a5a88', '#e8b080', 3);
    mangrove(x, 60, 150, 2); mangrove(x, 420, 150, 2);
    putShip(x, 'light', 0, 200, 180); putShip(x, 'light', 0, 290, 192, true);
  } else if (id === 'fall') {
    // the torches are out, Siamese soldiers on the shore
    skyBands(x, W2, 0, 112, ['#060a1e', '#101a3a', '#1c2a50']);
    seaBand(x, W2, 112, H2, '#16244a', '#2c4470', 9);
    for (let mx = 40; mx < W2; mx += 70) mangrove(x, mx, 170, 2);
    putUnit(x, 'keris', 1, 200, 200, 'attack', 1); putUnit(x, 'tombak', 1, 240, 204, 'idle', 0); putUnit(x, 'archer', 1, 280, 200, 'idle', 0, true);
    putShip(x, 'galley', 1, 380, 150, true);
    darken(x, W2, H2, 0.42);
  }
  return c;
}
