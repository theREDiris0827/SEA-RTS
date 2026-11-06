/* ===== a1-scenes.js ===== */
/* Pixel-art scenes for the story cards, built from the game's own Ayutthaya sprites on painted backdrops
   (helpers from the Rise of Majapahit demo). */
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


const hallSpr = (town) => recolor(civBuildingSprite('towncentre', AYU_CIV, 1), TOWNS[town].col, 'b|hall');
const oldSpr = (kind) => recolor(civBuildingSprite(kind, AYU_CIV, 1), 'rival', 'b|old|' + kind, true);
function rain(x, w, h, n, col) { x.fillStyle = col || 'rgba(200,220,240,.55)'; let s = 11; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < n; i++) { const rx = Math.floor(rnd() * w), ry = Math.floor(rnd() * h); x.fillRect(rx, ry, 1, 6); x.fillRect(rx - 1, ry + 6, 1, 3); } }
function flames(x, cx, by, s) { glow(x, cx, by - 14 * s, 36 * s, 'rgba(255,130,40,.55)'); for (const [dx, hh, c] of [[-8, 14, '#e8582a'], [-2, 22, '#f2a33a'], [5, 16, '#e8582a'], [0, 10, '#ffe08a']]) { x.fillStyle = c; x.fillRect(cx + dx * s, by - hh * s, 5 * s, hh * s); } }
function paddy(x, x0, y0, w, h, wet) { x.fillStyle = wet ? '#5f9ab4' : '#8ab84e'; x.fillRect(x0, y0, w, h); x.fillStyle = wet ? '#8cc4d4' : '#a8d064'; for (let yy = y0 + 3; yy < y0 + h; yy += 5) for (let xx = x0 + 2; xx < x0 + w; xx += 6) x.fillRect(xx, yy, 2, wet ? 1 : 3); x.fillStyle = '#6a5a3a'; x.fillRect(x0, y0, w, 1); x.fillRect(x0, y0 + h - 1, w, 1); }
function umbrella(x, cx, top) { x.fillStyle = GOLD_D; x.fillRect(cx, top, 1, 22); for (let i = 0; i < 3; i++) { const w = 18 - i * 6; x.fillStyle = '#f1ece0'; x.fillRect(cx - (w >> 1), top + 4 - i * 3, w, 2); x.fillStyle = GOLD; x.fillRect(cx - (w >> 1), top + 5 - i * 3, w, 1); } }
function flagRed(x, fx, fy) { x.fillStyle = '#5e3b1c'; x.fillRect(fx, fy, 2, 30); x.fillStyle = '#c8322a'; x.fillRect(fx + 2, fy, 16, 10); x.fillStyle = '#8a2018'; x.fillRect(fx + 2, fy + 9, 16, 1); }

function drawScene(id) {
  const [c, x] = sceneCanvas(SCENE_W, SCENE_H), W2 = SCENE_W, H2 = SCENE_H;
  const keep = SCENE_AGE;
  try {
    if (id === 'opening') {
      // 1351: sickness in the old town. The houses stand empty; the families carry what they can down to the barges
      SCENE_AGE = 1;
      skyBands(x, W2, 0, 110, ['#8a8a94', '#b4aca0', '#d8c8a8']);
      x.fillStyle = '#5a6a50'; x.fillRect(0, 84, W2, 26);
      for (let i = 0; i < 6; i++) putBld(x, treeSprite(i % 3), 30 + i * 84, 110);
      ground(x, W2, 106, 168, '#7a8a5a', '#66784a');
      putBld(x, oldSpr('house'), 70, 140); putBld(x, oldSpr('house'), 150, 132); putBld(x, oldSpr('towncentre'), 250, 138, 0.9);
      river(x, W2, 168, H2);
      putShip(x, 'barge', 0, 330, 206); putShip(x, 'barge', 0, 430, 210, true);
      putUnit(x, 'villager', 0, 300, 172, 'walk', 1); putUnit(x, 'villager', 0, 330, 166, 'walk', 2); putUnit(x, 'villager', 0, 270, 164, 'walk', 3);
      putUnit(x, 'uthong', 0, 380, 168, 'idle', 0, true); putUnit(x, 'keris', 0, 410, 164, 'idle', 0, true); putUnit(x, 'archer', 0, 200, 162);
    } else if (id === 'island') {
      // where three rivers meet: the island, the barges pulled up, the Sala Klang staked out
      SCENE_AGE = 1;
      skyBands(x, W2, 0, 96, ['#7fb8d8', '#b6dbe6', '#eef2dc']);
      x.fillStyle = '#4f7a40'; x.fillRect(0, 80, W2, 16);
      seaBand(x, W2, 96, H2, '#3f86a8', '#8ccbe0', 5);
      x.fillStyle = '#6fa55a'; x.fillRect(70, 124, 340, 60); x.fillRect(96, 116, 288, 8); x.fillRect(96, 184, 288, 8);
      x.fillStyle = '#c8b47a'; x.fillRect(70, 182, 340, 4);
      putBld(x, civBuildingSprite('towncentre', AYU_CIV, 1), 240, 172, 0.9);
      x.fillStyle = 'rgba(30,20,10,.25)'; x.fillRect(196, 120, 88, 52);
      putUnit(x, 'villager', 0, 170, 176, 'attack', 1); putUnit(x, 'villager', 0, 310, 178, 'attack', 2, true); putUnit(x, 'villager', 0, 140, 168, 'walk', 0);
      putUnit(x, 'uthong', 0, 350, 172, 'idle', 0, true);
      putShip(x, 'barge', 0, 60, 212); putShip(x, 'barge', 0, 440, 210, true);
    } else if (id === 'houses') {
      // a raft house on the water, a stilt house by the paddy: Ayutthaya's two kinds of household
      SCENE_AGE = 1;
      skyBands(x, W2, 0, 100, ['#86bcd8', '#c4e0e6', '#f0f0d8']);
      x.fillStyle = '#4f7a40'; x.fillRect(0, 86, W2, 14);
      ground(x, W2, 100, 150, '#6fa55a', '#5a9048');
      paddy(x, 250, 112, 210, 36);
      putBld(x, civBuildingSprite('house', AYU_CIV, 1), 190, 146);
      putUnit(x, 'villager', 0, 300, 140, 'work', 1); putUnit(x, 'villager', 0, 380, 142, 'work', 2, true);
      seaBand(x, W2, 150, H2, '#3f86a8', '#8ccbe0', 8);
      putBld(x, civBuildingSprite('rafthouse', AYU_CIV, 1), 90, 196); putBld(x, civBuildingSprite('rafthouse', AYU_CIV, 1), 330, 204);
      putShip(x, 'boat', 0, 220, 210);
    } else if (id === 'rains') {
      // the rains: the plain goes under, the raft houses ride the flood
      SCENE_AGE = 1;
      skyBands(x, W2, 0, 110, ['#3e4656', '#5e6878', '#8a929a']);
      x.fillStyle = '#3e5a40'; x.fillRect(0, 90, W2, 20);
      seaBand(x, W2, 110, H2, '#4a7f9a', '#7fb0c4', 3);
      paddy(x, 40, 130, 160, 30, true); paddy(x, 280, 138, 170, 26, true);
      putBld(x, civBuildingSprite('house', AYU_CIV, 1), 120, 150); putBld(x, civBuildingSprite('rafthouse', AYU_CIV, 1), 250, 196); putBld(x, civBuildingSprite('rafthouse', AYU_CIV, 1), 400, 200);
      putShip(x, 'barge', 0, 110, 210);
      rain(x, W2, H2, 260);
    } else if (id === 'age2') {
      // the Kingdom Age: the royal purple, a Wat on the island, towers over the bridges
      SCENE_AGE = 2;
      skyBands(x, W2, 0, 110, ['#7fb8d8', '#cfe6ec', '#f0f2dc']);
      ground(x, W2, 108, H2, '#6fa55a', '#4f8a3e');
      putBld(x, civBuildingSprite('wat', AYU_CIV, 2), 120, 168); putBld(x, civBuildingSprite('towncentre', AYU_CIV, 2), 330, 166);
      putBld(x, civBuildingSprite('tower', AYU_CIV, 2), 450, 150);
      putUnit(x, 'uthong', 0, 230, 194); putUnit(x, 'keris', 0, 190, 200); putUnit(x, 'tombak', 0, 268, 200, 'idle', 0, true); putUnit(x, 'archer', 0, 300, 206, 'idle', 0, true);
      putUnit(x, 'mo', 0, 150, 206); putUnit(x, 'villager', 0, 400, 204, 'idle', 0, true);
    } else if (id === 'lavo-join' || id === 'lavo-force') {
      // Lavo up the Lopburi river: its gold hall, its kraals, an elephant led out
      const force = id === 'lavo-force'; SCENE_AGE = 0;
      skyBands(x, W2, 0, 104, force ? ['#4a3a44', '#8a5a4a', '#c88a5a'] : ['#e8c890', '#f4dca8', '#f8ecd0']);
      x.fillStyle = '#4f7040'; x.fillRect(0, 86, W2, 18);
      ground(x, W2, 104, 176, '#7aa65a', '#62904a');
      putBld(x, hallSpr('lavo'), 250, 160, 1.0);
      x.fillStyle = '#7a5530'; for (let i = 0; i < 9; i++) x.fillRect(360 + i * 12, 140, 3, 24); x.fillRect(356, 146, 112, 2); x.fillRect(356, 156, 112, 2);
      if (force) { flames(x, 250, 120, 1.4); putUnit(x, 'keris', 0, 140, 172, 'attack', 1); putUnit(x, 'tombak', 0, 110, 176, 'attack', 2); putUnit(x, 'uthong', 0, 170, 176); }
      else { flagRed(x, 296, 98); putUnit(x, 'chang', 0, 160, 178); putUnit(x, 'uthong', 0, 330, 176, 'idle', 0, true); putUnit(x, 'villager', 0, 210, 174, 'idle', 0, true); }
      river(x, W2, 180, H2);
      if (!force) putShip(x, 'goldboat', 0, 120, 214);
    } else if (id === 'suphan-join' || id === 'suphan-force') {
      // Suphanburi in the western fields: the wedding at its green hall
      const force = id === 'suphan-force'; SCENE_AGE = 0;
      skyBands(x, W2, 0, 104, force ? ['#4a3a44', '#8a5a4a', '#c88a5a'] : ['#8cc0dc', '#cfe6ec', '#f6efd6']);
      x.fillStyle = '#4f7040'; x.fillRect(0, 86, W2, 18);
      ground(x, W2, 104, H2, '#7aa65a', '#62904a');
      paddy(x, 20, 120, 120, 30);
      putBld(x, hallSpr('suphan'), 300, 160, 1.0);
      if (force) { flames(x, 300, 120, 1.4); putUnit(x, 'keris', 0, 190, 190, 'attack', 1); putUnit(x, 'tombak', 0, 160, 196, 'attack', 2); putUnit(x, 'uthong', 0, 220, 196); }
      else {
        flagRed(x, 346, 98);
        putUnit(x, 'bride', 0, 250, 190); putUnit(x, 'uthong', 0, 220, 192);
        umbrella(x, 236, 150);
        putUnit(x, 'villager', 0, 180, 196, 'walk', 1); putUnit(x, 'villager', 0, 150, 198, 'walk', 2);
        recolorPut(x, 'archer', 'suphan', 380, 196, true); recolorPut(x, 'tombak', 'suphan', 410, 200, true); recolorPut(x, 'archer', 'suphan', 440, 194, true);
      }
    } else if (id === 'crown') {
      // both towns stand with Ayutthaya: the Wang is to be raised
      SCENE_AGE = 2;
      skyBands(x, W2, 0, 110, ['#e8b860', '#f4d890', '#f8ecc4']);
      ground(x, W2, 108, H2, '#6fa55a', '#4f8a3e');
      { const s = civBuildingSprite('palace', AYU_CIV, 2); x.globalAlpha = 0.45; putBld(x, s, 240, 170, 1.1); x.globalAlpha = 1; }
      x.fillStyle = '#7a5530'; for (const px of [170, 200, 280, 310]) x.fillRect(px, 112, 3, 58); x.fillRect(166, 124, 150, 2);
      putUnit(x, 'villager', 0, 190, 190, 'attack', 1); putUnit(x, 'villager', 0, 290, 192, 'attack', 2, true);
      putUnit(x, 'uthong', 0, 240, 200); recolorPut(x, 'archer', 'suphan', 80, 198); recolorPut(x, 'tombak', 'suphan', 110, 202); putUnit(x, 'chang', 0, 400, 204, 'idle', 0, true);
    } else if (id === 'final') {
      // the rival lord comes on his war elephant under the red umbrella
      SCENE_AGE = 2;
      skyBands(x, W2, 0, 110, ['#3a3e66', '#8a6a7a', '#e0a070']);
      x.fillStyle = '#2e3a34'; x.fillRect(0, 70, W2, 40); x.fillRect(300, 58, 140, 12);
      ground(x, W2, 108, H2, '#4f7a3e', '#3f6a30');
      putUnit(x, 'cmdr', 1, 360, 182, 'walk', 0, true); putUnit(x, 'rv_eleph', 1, 440, 172, 'walk', 1, true);
      for (let i = 0; i < 6; i++) putUnit(x, ['rv_sword', 'rv_spear', 'rv_archer'][i % 3], 1, 250 + i * 34, 200 + (i % 2) * 8, 'walk', i % 4, true);
      putUnit(x, 'uthong', 0, 90, 196); putUnit(x, 'keris', 0, 130, 200); putUnit(x, 'tombak', 0, 56, 204); putUnit(x, 'archer', 0, 30, 198); putUnit(x, 'chang', 0, 160, 186);
    } else if (id === 'closing') {
      // 1351: U Thong is crowned Ramathibodi before the Wang; Lavo and Suphanburi kneel beside Ayutthaya's own
      SCENE_AGE = 2;
      skyBands(x, W2, 0, 128, ['#e8a860', '#f4d08a', '#f8ecc4']);
      glow(x, 240, 80, 150, 'rgba(255,230,150,.55)');
      x.fillStyle = '#7a9a6a'; x.fillRect(0, 110, W2, 18);
      putBld(x, civBuildingSprite('palace', AYU_CIV, 2), 240, 132, 0.85);
      ground(x, W2, 124, 170, '#6fa55a', '#5a9048');
      putUnit(x, 'uthong', 0, 240, 160); umbrella(x, 254, 118);
      putUnit(x, 'mo', 0, 200, 164); putUnit(x, 'mo', 0, 282, 164, 'idle', 0, true);
      flagRed(x, 120, 116); flagRed(x, 350, 116);
      recolorPut(x, 'archer', 'suphan', 90, 166); recolorPut(x, 'villager', 'lavo', 400, 166, true); putUnit(x, 'keris', 0, 150, 168); putUnit(x, 'tombak', 0, 330, 168, 'idle', 0, true);
      seaBand(x, W2, 170, H2, '#3f86a8', '#8ccbe0', 12);
      putShip(x, 'barge', 0, 110, 210); putShip(x, 'goldboat', 0, 260, 212); putShip(x, 'galley', 0, 410, 208, true);
    } else if (id === 'rout') {
      const [c2, y] = sceneCanvas(240, 96); SCENE_AGE = 2;
      skyBands(y, 240, 0, 44, ['#e8b860', '#f8ecc4']); ground(y, 240, 40, 96, '#5f8a4a', '#4a7038');
      putUnit(y, 'uthong', 0, 60, 88); putUnit(y, 'keris', 0, 30, 90); putUnit(y, 'chang', 0, 100, 86);
      putUnit(y, 'rv_sword', 1, 180, 88, 'walk', 1); putUnit(y, 'rv_archer', 1, 216, 90, 'walk', 2);
      return c2;
    } else if (id === 'bride') {
      const [c2, y] = sceneCanvas(240, 96); SCENE_AGE = 0;
      skyBands(y, 240, 0, 44, ['#9a8a7a', '#d8c8a8']); ground(y, 240, 40, 96, '#6a8a4a', '#567840');
      for (let i = 0; i < 4; i++) putBld(y, treeSprite(i % 3), 20 + i * 64, 50);
      putUnit(y, 'bd_sword', 1, 150, 88, 'attack', 1, true); putUnit(y, 'bd_sword', 1, 190, 90, 'walk', 2, true); putUnit(y, 'bd_archer', 1, 220, 84, 'attack', 0, true);
      umbrella(y, 92, 50); y.globalAlpha = 0.5; putUnit(y, 'bride', 0, 90, 90); y.globalAlpha = 1;
      return c2;
    } else if (id === 'fall') {
      const [c2, y] = sceneCanvas(240, 96); SCENE_AGE = 1;
      skyBands(y, 240, 0, 50, ['#14121e', '#3a2430']); glow(y, 120, 50, 90, 'rgba(255,120,40,.4)');
      ground(y, 240, 46, 96, '#36572c', '#28441f');
      putBld(y, civBuildingSprite('towncentre', AYU_CIV, 1), 120, 76, 0.6); flames(y, 120, 70, 0.8);
      putUnit(y, 'rv_sword', 1, 60, 92, 'attack', 1); putUnit(y, 'rv_archer', 1, 190, 92, 'attack', 0, true);
      return c2;
    }
  } finally { SCENE_AGE = keep; }
  return c;
}
// a townsman of Lavo or Suphanburi: the Ayutthaya sprite in his town's colour
function recolorPut(x, kind, town, fx, fy, flip) {
  const keep = SCENE_AGE; SCENE_AGE = 2;
  const spr = recolor(baseUnitSprite(kind, 0, 'idle', 0, ''), town, 'u|' + kind + '|town'); SCENE_AGE = keep;
  if (flip) { x.save(); x.translate(fx, 0); x.scale(-1, 1); x.drawImage(spr, -(spr.width >> 1), fy + 5 - spr.height); x.restore(); }
  else x.drawImage(spr, fx - (spr.width >> 1), fy + 5 - spr.height);
}
