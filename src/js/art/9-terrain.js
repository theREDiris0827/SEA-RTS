/* ------------------------------ terrain ------------------------------ */
const PAL = {
  grass: ['#5b8c4a', '#608f4e', '#56853f', '#64954f'], dirt: ['#8d6e4b', '#846643', '#977755', '#7f6140'],
  sand: ['#d6c58b', '#cdbb80', '#ded09a', '#d0bf86'], shallow: ['#4ba3bf', '#4499b6', '#53aac6', '#4fa0bb'],
  deep: ['#2c6f90', '#28678a', '#31779a', '#2a6c8d'], cliff: ['#80848c', '#767a82', '#8b8f97', '#7b7f87']
};
function buildTerrain(g) {
  const c = cv(W * TILE, H * TILE), x = c.getContext('2d'), s = g.seed, T_ = g.terrain;
  const tt = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? T.DEEP : T_[j * W + i];
  const isW = (v) => v === T.SHALLOW || v === T.DEEP;
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    const t = T_[ty * W + tx], px = tx * TILE, py = ty * TILE;
    const pal = t === T.GRASS ? PAL.grass : t === T.DIRT ? PAL.dirt : t === T.SAND ? PAL.sand : t === T.SHALLOW ? PAL.shallow : t === T.DEEP ? PAL.deep : PAL.cliff;
    for (let by = 0; by < 8; by++) for (let bx = 0; bx < 8; bx++) {
      const h = hash2(tx * 8 + bx, ty * 8 + by, s);
      x.fillStyle = pal[Math.min(3, Math.floor(h * h * 4))];
      x.fillRect(px + bx * 4, py + by * 4, 4, 4);
    }
    if (t === T.GRASS) {
      for (let i = 0; i < 3; i++) {
        const hx = hash2(tx, ty, 100 + i), hy = hash2(tx, ty, 200 + i);
        x.fillStyle = '#477a38'; x.fillRect(px + Math.floor(hx * 28) + 1, py + Math.floor(hy * 26) + 3, 2, 4);
        x.fillStyle = '#6fa55a'; x.fillRect(px + Math.floor(hx * 28) + 1, py + Math.floor(hy * 26) + 2, 2, 2);
      }
      if (hash2(tx, ty, 300) < 0.05) {
        x.fillStyle = ['#f4f1da', '#f2c94c', '#e58bb0'][Math.floor(hash2(tx, ty, 301) * 3)];
        x.fillRect(px + Math.floor(hash2(tx, ty, 302) * 26) + 2, py + Math.floor(hash2(tx, ty, 303) * 26) + 2, 2, 2);
      }
    } else if (t === T.DIRT || t === T.SAND) {
      for (let i = 0; i < 4; i++) {
        x.fillStyle = t === T.SAND ? '#b8a56d' : '#6e5236';
        x.fillRect(px + Math.floor(hash2(tx, ty, 400 + i) * 28) + 1, py + Math.floor(hash2(tx, ty, 500 + i) * 28) + 1, 2, 2);
      }
    } else if (t === T.SHALLOW || t === T.DEEP) {
      x.fillStyle = t === T.SHALLOW ? '#7cc4d8' : '#4a8fb0';
      for (let i = 0; i < 2; i++) x.fillRect(px + Math.floor(hash2(tx, ty, 600 + i) * 22) + 2, py + Math.floor(hash2(tx, ty, 700 + i) * 28) + 2, 6, 2);
    } else if (t === T.CLIFF) {
      const below = tt(tx, ty + 1) === T.CLIFF;
      for (let i = 0; i < 3; i++) {
        x.fillStyle = '#9a9ea6'; x.fillRect(px + Math.floor(hash2(tx, ty, 800 + i) * 24) + 2, py + Math.floor(hash2(tx, ty, 900 + i) * 14) + 2, 6, 3);
        x.fillStyle = '#5f636b'; x.fillRect(px + Math.floor(hash2(tx, ty, 810 + i) * 24) + 2, py + Math.floor(hash2(tx, ty, 910 + i) * 14) + 6, 4, 2);
      }
      if (!below) {
        x.fillStyle = '#50545c'; x.fillRect(px, py + 20, 32, 12);
        x.fillStyle = '#41454d'; x.fillRect(px, py + 28, 32, 4);
        x.fillStyle = '#63676f'; for (let i = 0; i < 4; i++) x.fillRect(px + 3 + i * 8 + Math.floor(hash2(tx, ty, 950 + i) * 3), py + 21, 2, 7);
        x.fillStyle = '#979ba3'; x.fillRect(px, py + 18, 32, 2);
      }
    }
  }
  // soft edges: shorelines, shadows under cliffs
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    const t = T_[ty * W + tx], px = tx * TILE, py = ty * TILE;
    if (isW(t)) {
      const nb = [[0, -1, 0, 0, 32, 3], [0, 1, 0, 29, 32, 3], [-1, 0, 0, 0, 3, 32], [1, 0, 29, 0, 3, 32]];
      for (const n of nb) {
        if (!(tt(tx + n[0], ty + n[1]) <= T.SAND)) continue;
        x.fillStyle = '#eaf7fa';
        if (n[4] === 32) for (let i = 0; i < 32; i += 8) x.fillRect(px + i + (ty % 2) * 2, py + n[3], 6, 3);
        else for (let i = 0; i < 32; i += 8) x.fillRect(px + n[2], py + i + (tx % 2) * 2, 3, 6);
        x.fillStyle = 'rgba(255,255,255,0.28)';
        if (n[4] === 32) x.fillRect(px, py + n[3] + (n[1] > 0 ? -3 : 3), 32, 3); else x.fillRect(px + n[2] + (n[0] > 0 ? -3 : 3), py, 3, 32);
      }
    } else if (t === T.SAND) {
      x.fillStyle = 'rgba(120,98,50,0.22)';
      if (isW(tt(tx, ty + 1))) x.fillRect(px, py + 26, 32, 6);
      if (isW(tt(tx, ty - 1))) x.fillRect(px, py, 32, 6);
      if (isW(tt(tx - 1, ty))) x.fillRect(px, py, 6, 32);
      if (isW(tt(tx + 1, ty))) x.fillRect(px + 26, py, 6, 32);
    } else if (t !== T.CLIFF && tt(tx, ty - 1) === T.CLIFF) {
      x.fillStyle = 'rgba(15,25,18,0.30)'; x.fillRect(px, py, 32, 7);
      x.fillStyle = 'rgba(15,25,18,0.16)'; x.fillRect(px, py + 7, 32, 5);
    }
  }
  return c;
}
function buildMiniBase(g) {
  const c = cv(W, H), x = c.getContext('2d');
  const col = ['#5b8c4a', '#8d6e4b', '#d6c58b', '#4ba3bf', '#2c6f90', '#7b7f87'];
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { x.fillStyle = col[g.terrain[y * W + xx]]; x.fillRect(xx, y, 1, 1); }
  return c;
}
if (typeof module !== 'undefined') module.exports = { unitSprite, buildingSprite, treeSprite, bushSprite, goldSprite, deerSprite, carcassSprite, boatSprite, iconSprite, buildTerrain, TEAMC };

