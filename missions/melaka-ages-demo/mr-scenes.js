/* ===== mr-scenes.js ===== */
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
function dogSprite(f) {
  return sprite('dog|' + f, 16, 12, 2, (P) => {
    const r = P.r, c = '#c9b07a', d = '#8e7448', l = f ? 1 : 0;
    r(3, 4, 8, 4, c); r(3, 7, 8, 1, d); r(10, 2, 4, 4, c); r(13, 4, 2, 1, '#3a2a1a'); r(10, 1, 2, 2, d); r(12, 3, 1, 1, '#1c1c1c');
    r(1, 3, 2, 1, c); r(0, 2, 1, 1, c);
    r(4, 8, 1, 3 - l, d); r(6, 8, 1, 2 + l, d); r(8, 8, 1, 2 + l, d); r(10, 8, 1, 3 - l, d);
  });
}
function river(x, w, y0, y1) {
  x.fillStyle = '#4a8fb0'; x.fillRect(0, y0, w, y1 - y0); x.fillStyle = '#7cc4d8'; for (let i = 0; i < 14; i++) x.fillRect((i * 53) % w, y0 + 6 + (i % 4) * 7, 14, 2);
  x.fillStyle = '#b8a56d'; x.fillRect(0, y0 - 4, w, 6);
}

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  const keep = SCENE_AGE;
  try {
    if (id === 'opening') {
      // by the river at Bertam: the mouse deer kicks the hound, Parameswara watches under the melaka tree
      SCENE_AGE = 1;
      skyBands(x, W2, 0, 110, ['#7fb8d8', '#b6dbe6', '#e4f0e0']);
      x.fillStyle = '#f2f6ec'; x.fillRect(300, 26, 60, 10); x.fillRect(312, 18, 32, 8); x.fillRect(80, 40, 44, 8);
      x.fillStyle = '#5f8a4a'; x.fillRect(0, 92, W2, 18);
      ground(x, W2, 108, H2, '#6fa55a', '#4f8a3e');
      river(x, W2, 178, H2);
      { const t = treeSprite(3); x.drawImage(t, 330, 170 - t.height * 2, t.width * 2, t.height * 2); }
      putBld(x, treeSprite(2), 460, 140); putBld(x, treeSprite(0), 40, 136); putBld(x, treeSprite(1), 120, 120);
      x.drawImage(deerSprite(1), 190, 132);
      x.save(); x.translate(160, 156); x.rotate(-0.5); x.drawImage(dogSprite(0), -16, -12); x.restore();
      x.drawImage(dogSprite(1), 236, 148);
      putHero(x, 'parameswara', 352, 168, 'idle', 0, true); putUnit(x, 'villager', 0, 400, 172, 'idle', 0, true); putUnit(x, 'tombak', 0, 424, 160, 'idle', 0, true);
      putShip(x, 'boat', 0, 90, 206);
    } else if (id === 'age2') {
      // the Kingdom Age: the Istana rises and the court gathers
      SCENE_AGE = 2;
      skyBands(x, W2, 0, 120, ['#7fb8d8', '#cfe6ec', '#f0f2dc']);
      ground(x, W2, 116, H2, '#6fa55a', '#4f8a3e');
      putBld(x, buildingSprite('palace', 0, 2), 240, 168, 1.2);
      putBld(x, buildingSprite('house', 0, 2), 70, 150); putBld(x, buildingSprite('house', 0, 2), 420, 154);
      putHero(x, 'parameswara', 240, 196); putUnit(x, 'pahlawan', 0, 196, 200, 'idle', 0); putUnit(x, 'pahlawan', 0, 284, 200, 'idle', 0, true);
      putUnit(x, 'tabib', 0, 150, 204); putUnit(x, 'villager', 0, 330, 206, 'idle', 0, true); putUnit(x, 'archer', 0, 120, 198); putUnit(x, 'keris', 0, 360, 198, 'idle', 0, true);
    } else if (id === 'age3') {
      // the Age of Commerce: the harbour full of ships, bronze guns on the quay
      SCENE_AGE = 3;
      skyBands(x, W2, 0, 100, ['#8cc0dc', '#cfe6ec', '#f6efd6']);
      x.fillStyle = '#7a9a6a'; x.fillRect(0, 84, W2, 16);
      seaBand(x, W2, 100, H2, '#2c6f8e', '#79b8c8', 4);
      putShip(x, 'trade', 0, 90, 150); putShip(x, 'frigate', 0, 230, 168); putShip(x, 'trade', 0, 380, 146, true);
      x.fillStyle = '#b8a56d'; x.fillRect(0, 188, W2, 28); x.fillStyle = '#8a7a50'; x.fillRect(0, 188, W2, 3);
      putUnit(x, 'meriam', 0, 120, 210); putUnit(x, 'pembedil', 0, 180, 212); putUnit(x, 'pembedil', 0, 206, 210); putUnit(x, 'keris', 0, 300, 212, 'idle', 0, true); putUnit(x, 'tombak', 0, 330, 210, 'idle', 0, true);
      putUnit(x, 'villager', 0, 420, 212, 'idle', 0, true);
    } else if (id === 'age4') {
      // the Golden Age: the Sultan's court, Tun Perak and Hang Tuah, the royal guard
      SCENE_AGE = 4;
      skyBands(x, W2, 0, 110, ['#e8b860', '#f4d890', '#f8ecc4']);
      glow(x, 240, 60, 140, 'rgba(255,230,150,.5)');
      ground(x, W2, 108, H2, '#6fa55a', '#4f8a3e');
      putBld(x, buildingSprite('palace', 0, 2), 240, 160, 1.3);
      putHero(x, 'perak', 200, 196); putHero(x, 'tuah', 280, 196, 'idle', 0, true);
      for (const [px, flip] of [[110, false], [140, false], [340, true], [370, true]]) putUnit(x, px < 240 ? 'bediraja' : 'keris', 0, px, 204, 'idle', 0, flip);
      putUnit(x, 'tombak', 0, 70, 206); putUnit(x, 'tombak', 0, 410, 206, 'idle', 0, true);
    } else if (id === 'siam') {
      // a Siamese army in the hills: elephants and twin swords
      const [c2, y] = sceneCanvas(240, 96);
      skyBands(y, 240, 0, 44, ['#9cc4d8', '#e6eee0']); ground(y, 240, 40, 96, '#5f8a4a', '#4a7038');
      putUnit(y, 'chang', 1, 60, 84, 'walk', 1); putUnit(y, 'daab', 1, 120, 88, 'walk', 0); putUnit(y, 'hok', 1, 146, 84, 'walk', 2); putUnit(y, 'thanu', 1, 176, 90, 'walk', 1); putUnit(y, 'daab', 1, 204, 86, 'walk', 3);
      return c2;
    } else if (id === 'final') {
      // 1446: the Siamese army comes down from Pahang, the commander under his white parasol
      SCENE_AGE = 4;
      skyBands(x, W2, 0, 110, ['#3a3e66', '#8a6a7a', '#e0a070']);
      x.fillStyle = '#2e3a34'; x.fillRect(0, 70, W2, 40); x.fillRect(60, 56, 140, 14); x.fillRect(300, 60, 120, 10);
      ground(x, W2, 108, H2, '#4f7a3e', '#3f6a30');
      putUnit(x, 'cmdr', 1, 330, 170, 'walk', 0, true); putUnit(x, 'chang', 1, 420, 160, 'walk', 1, true); putUnit(x, 'chang', 1, 250, 150, 'walk', 2, true);
      for (let i = 0; i < 6; i++) putUnit(x, ['daab', 'hok', 'thanu'][i % 3], 1, 230 + i * 36, 196 + (i % 2) * 8, 'walk', i % 4, true);
      putHero(x, 'perak', 70, 196); putUnit(x, 'bediraja', 0, 110, 200); putUnit(x, 'tombak', 0, 40, 204); putHero(x, 'tuah', 140, 206);
    } else if (id === 'rout') {
      const [c2, y] = sceneCanvas(240, 96);
      skyBands(y, 240, 0, 44, ['#e8b860', '#f8ecc4']); ground(y, 240, 40, 96, '#5f8a4a', '#4a7038');
      SCENE_AGE = 4;
      putHero(y, 'perak', 60, 88); putUnit(y, 'keris', 0, 30, 90); putUnit(y, 'bediraja', 0, 92, 90);
      putUnit(y, 'chang', 1, 170, 80, 'walk', 1); putUnit(y, 'daab', 1, 214, 90, 'walk', 2);
      return c2;
    } else if (id === 'closing') {
      // Melaka at its height: the port at dusk, the flagship at anchor, the Istana lit on the hill
      SCENE_AGE = 4;
      skyBands(x, W2, 0, 104, ['#2a2c54', '#8a5a7a', '#f0a866', '#f8d890']);
      x.fillStyle = '#3a4a3a'; x.fillRect(250, 70, 230, 34); x.fillRect(300, 58, 120, 12);
      putBld(x, buildingSprite('palace', 0, 2), 360, 92, 0.8);
      glow(x, 360, 70, 60, 'rgba(255,200,120,.45)');
      seaBand(x, W2, 104, H2, '#24506e', '#6aa8c0', 12);
      putShip(x, 'flagship', 0, 150, 170); putShip(x, 'trade', 0, 330, 150, true); putShip(x, 'frigate', 0, 420, 190, true); putShip(x, 'boat', 0, 40, 200);
    } else if (id === 'fall') {
      const [c2, y] = sceneCanvas(240, 96);
      skyBands(y, 240, 0, 50, ['#14121e', '#3a2430']); glow(y, 120, 50, 90, 'rgba(255,120,40,.4)');
      ground(y, 240, 46, 96, '#36572c', '#28441f');
      putBld(y, buildingSprite('towncentre', 0, 2), 120, 76, 0.6);
      putUnit(y, 'chang', 1, 60, 92, 'attack', 1); putUnit(y, 'thanu', 1, 190, 92, 'attack', 0, true);
      return c2;
    }
  } finally { SCENE_AGE = keep; }
  return c;
}
