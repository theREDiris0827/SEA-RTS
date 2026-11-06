/* ===== mp-scenes.js ===== */
/* Pixel-art scenes for the story cards and the short in-battle moments. Built from the game's own
   sprites on painted backdrops (helpers from the Melaka mission 1 demo). */
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
function putHero(x, id, fx, fy, anim, f, flip) {
  const spr = HEROART.heroSprite(id, anim || 'idle', f || 0);
  if (flip) { x.save(); x.translate(fx, 0); x.scale(-1, 1); x.drawImage(spr, -16, fy + 5 - spr.height); x.restore(); }
  else x.drawImage(spr, fx - 16, fy + 5 - spr.height);
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

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  const keep = SCENE_AGE;
  try {
    if (id === 'opening') {
      // 1293, the Tarik forest by the Brantas: Wijaya's followers clear the trees; a maja tree with its bitter fruit
      SCENE_AGE = 1;
      skyBands(x, W2, 0, 110, ['#7fb8d8', '#b6dbe6', '#e4f0e0']);
      x.fillStyle = '#f2f6ec'; x.fillRect(300, 26, 60, 10); x.fillRect(312, 18, 32, 8); x.fillRect(80, 40, 44, 8);
      x.fillStyle = '#3f6a34'; x.fillRect(0, 86, W2, 24);
      for (let i = 0; i < 9; i++) putBld(x, treeSprite(i % 3), 20 + i * 56, 112 + (i % 2) * 6);
      ground(x, W2, 108, H2, '#6fa55a', '#4f8a3e');
      river(x, W2, 186, H2);
      { const t = treeSprite(3); x.drawImage(t, 330, 172 - t.height * 2, t.width * 2, t.height * 2); }
      // the maja fruit: round, green going yellow
      for (const [fx, fy] of [[352, 104], [372, 116], [394, 100], [364, 128], [408, 122]]) { x.fillStyle = '#9ab83a'; x.fillRect(fx, fy, 6, 6); x.fillStyle = '#d8c84a'; x.fillRect(fx + 1, fy + 1, 3, 2); }
      for (const sx of [120, 200, 262]) { x.fillStyle = '#7a5530'; x.fillRect(sx, 166, 10, 6); x.fillStyle = '#c9a36a'; x.fillRect(sx + 1, 165, 8, 2); }
      putUnit(x, 'villager', 0, 150, 176, 'attack', 1); putUnit(x, 'villager', 0, 230, 178, 'attack', 2, true); putUnit(x, 'villager', 0, 290, 174, 'idle', 0);
      putUnit(x, 'keris', 0, 400, 180, 'idle', 0, true); putUnit(x, 'tombak', 0, 430, 176, 'idle', 0, true); putUnit(x, 'archer', 0, 60, 178);
      putShip(x, 'boat', 0, 90, 210);
    } else if (id === 'age2') {
      // the Kingdom Age: Wijaya is crowned Kertarajasa; the kraton rises and the guard gathers
      SCENE_AGE = 2;
      skyBands(x, W2, 0, 120, ['#7fb8d8', '#cfe6ec', '#f0f2dc']);
      ground(x, W2, 116, H2, '#6fa55a', '#4f8a3e');
      putBld(x, buildingSprite('palace', 0, 2), 240, 168, 1.2);
      putBld(x, buildingSprite('house', 0, 2), 70, 150); putBld(x, buildingSprite('house', 0, 2), 420, 154);
      putHero(x, 'hayamwuruk', 240, 196); putUnit(x, 'bhaya', 0, 196, 200, 'idle', 0); putUnit(x, 'bhaya', 0, 284, 200, 'idle', 0, true);
      putUnit(x, 'acaraki', 0, 150, 204); putUnit(x, 'villager', 0, 330, 206, 'idle', 0, true); putUnit(x, 'archer', 0, 120, 198); putUnit(x, 'keris', 0, 360, 198, 'idle', 0, true);
    } else if (id === 'age3') {
      // the Age of Commerce: the river port full of jong, cetbang on the quay
      SCENE_AGE = 3;
      skyBands(x, W2, 0, 100, ['#8cc0dc', '#cfe6ec', '#f6efd6']);
      x.fillStyle = '#7a9a6a'; x.fillRect(0, 84, W2, 16);
      seaBand(x, W2, 100, H2, '#2c6f8e', '#79b8c8', 4);
      putShip(x, 'trade', 0, 90, 150); putShip(x, 'frigate', 0, 230, 168); putShip(x, 'trade', 0, 380, 146, true);
      x.fillStyle = '#b8a56d'; x.fillRect(0, 188, W2, 28); x.fillStyle = '#8a7a50'; x.fillRect(0, 188, W2, 3);
      putUnit(x, 'meriam', 0, 120, 210); putUnit(x, 'pembedil', 0, 180, 212); putUnit(x, 'pembedil', 0, 206, 210); putUnit(x, 'keris', 0, 300, 212, 'idle', 0, true); putUnit(x, 'tombak', 0, 330, 210, 'idle', 0, true);
      putUnit(x, 'villager', 0, 420, 212, 'idle', 0, true);
    } else if (id === 'age4') {
      // the Golden Age: Queen Tribhuwana's court, Gajah Mada beside her, the guard in gold
      SCENE_AGE = 2;
      skyBands(x, W2, 0, 110, ['#e8b860', '#f4d890', '#f8ecc4']);
      glow(x, 240, 60, 140, 'rgba(255,230,150,.5)');
      ground(x, W2, 108, H2, '#6fa55a', '#4f8a3e');
      putBld(x, buildingSprite('palace', 0, 2), 240, 160, 1.3);
      putHero(x, 'tribhuwana', 210, 196); putHero(x, 'gajahmada', 274, 196, 'idle', 0, true);
      for (const [px, flip] of [[110, false], [140, false], [340, true], [370, true]]) putUnit(x, px < 240 ? 'bediraja' : 'bhaya', 0, px, 204, 'idle', 0, flip);
      putUnit(x, 'tombak', 0, 70, 206); putUnit(x, 'tombak', 0, 410, 206, 'idle', 0, true);
    } else if (id === 'yuan') {
      // the Yuan fleet comes up the river
      const [c2, y] = sceneCanvas(240, 96);
      skyBands(y, 240, 0, 40, ['#9cc4d8', '#e6eee0']); y.fillStyle = '#3f6a34'; y.fillRect(0, 34, 240, 10);
      seaBand(y, 240, 44, 72, '#2c6f8e', '#79b8c8', 9);
      putShip(y, 'yu_junk', 1, 70, 70); putShip(y, 'yu_lander', 1, 160, 66, true);
      ground(y, 240, 72, 96, '#6fa55a', '#4f8a3e');
      putUnit(y, 'yu_shield', 1, 120, 90, 'walk', 1, true); putUnit(y, 'yu_xbow', 1, 150, 92, 'walk', 2, true); putUnit(y, 'yu_spear', 1, 180, 88, 'walk', 0, true);
      return c2;
    } else if (id === 'rebels') {
      // old companions turned rebels: a column under a grey banner, fire arrows ready
      const [c2, y] = sceneCanvas(240, 96);
      skyBands(y, 240, 0, 44, ['#c4a888', '#e6d8c0']); ground(y, 240, 40, 96, '#5f8a4a', '#4a7038');
      y.fillStyle = WOOD_D; y.fillRect(40, 44, 1, 30); y.fillStyle = TEAMC[4].main; y.fillRect(41, 44, 12, 8);
      putUnit(y, 'rb_guard', 1, 52, 86, 'walk', 1); putUnit(y, 'rb_sword', 1, 90, 88, 'walk', 0); putUnit(y, 'rb_spear', 1, 120, 84, 'walk', 2); putUnit(y, 'rb_archer', 1, 152, 90, 'walk', 1); putUnit(y, 'rb_archer', 1, 182, 86, 'walk', 3);
      glow(y, 200, 70, 18, 'rgba(255,140,40,.5)');
      return c2;
    } else if (id === 'final') {
      // 1331: Sadeng and Keta rise; the rebel lord under his payung; the queen and Gajah Mada meet them
      SCENE_AGE = 2;
      skyBands(x, W2, 0, 110, ['#3a3e66', '#8a6a7a', '#e0a070']);
      x.fillStyle = '#2e3a34'; x.fillRect(0, 70, W2, 40); x.fillRect(60, 56, 140, 14); x.fillRect(300, 60, 120, 10);
      ground(x, W2, 108, H2, '#4f7a3e', '#3f6a30');
      putUnit(x, 'cmdr', 1, 340, 176, 'walk', 0, true); putUnit(x, 'rb_guard', 1, 410, 168, 'walk', 1, true); putUnit(x, 'rb_guard', 1, 290, 160, 'walk', 2, true);
      for (let i = 0; i < 6; i++) putUnit(x, ['rb_sword', 'rb_spear', 'rb_archer'][i % 3], 1, 250 + i * 34, 198 + (i % 2) * 8, 'walk', i % 4, true);
      putHero(x, 'tribhuwana', 70, 196); putUnit(x, 'archer', 0, 110, 200); putUnit(x, 'bhaya', 0, 36, 204); putHero(x, 'gajahmada', 144, 206);
    } else if (id === 'rout') {
      const [c2, y] = sceneCanvas(240, 96);
      skyBands(y, 240, 0, 44, ['#e8b860', '#f8ecc4']); ground(y, 240, 40, 96, '#5f8a4a', '#4a7038');
      SCENE_AGE = 2;
      putHero(y, 'gajahmada', 60, 88); putUnit(y, 'bhaya', 0, 30, 90); putUnit(y, 'tombak', 0, 92, 90);
      putUnit(y, 'rb_sword', 1, 170, 88, 'walk', 1); putUnit(y, 'rb_archer', 1, 214, 90, 'walk', 2);
      return c2;
    } else if (id === 'closing') {
      // 1336, the Palapa oath: Gajah Mada before the queen's court at dusk, the fleet ready for the islands
      SCENE_AGE = 2;
      skyBands(x, W2, 0, 104, ['#2a2c54', '#8a5a7a', '#f0a866', '#f8d890']);
      x.fillStyle = '#3a4a3a'; x.fillRect(250, 70, 230, 34); x.fillRect(300, 58, 120, 12);
      putBld(x, buildingSprite('palace', 0, 2), 360, 108, 0.9);
      glow(x, 360, 80, 70, 'rgba(255,200,120,.45)');
      ground(x, W2, 104, 150, '#5f8a4a', '#4a7038');
      putHero(x, 'tribhuwana', 330, 140); putHero(x, 'gajahmada', 270, 142, 'idle', 0, true);
      putUnit(x, 'bhaya', 0, 380, 140, 'idle', 0, true); putUnit(x, 'bhaya', 0, 410, 142, 'idle', 0, true);
      seaBand(x, W2, 150, H2, '#24506e', '#6aa8c0', 12);
      putShip(x, 'trade', 0, 120, 206); putShip(x, 'galley', 0, 260, 200); putShip(x, 'trade', 0, 420, 206, true);
    } else if (id === 'fall') {
      const [c2, y] = sceneCanvas(240, 96);
      skyBands(y, 240, 0, 50, ['#14121e', '#3a2430']); glow(y, 120, 50, 90, 'rgba(255,120,40,.4)');
      ground(y, 240, 46, 96, '#36572c', '#28441f');
      putBld(y, buildingSprite('towncentre', 0, 2), 120, 76, 0.6);
      putUnit(y, 'rb_sword', 1, 60, 92, 'attack', 1); putUnit(y, 'rb_archer', 1, 190, 92, 'attack', 0, true);
      return c2;
    }
  } finally { SCENE_AGE = keep; }
  return c;
}
