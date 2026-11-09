/* ##### CHAPTER SCREEN 1 · Screen, camera, fog #####
   File: src/js/ui/01-screen-camera-fog.js
   What it does: Everything the player sees and touches starts here: the canvas, the camera, the fog of war and
   the build list.
   Things you can tweak:
     - setZoom(): zoom limits, clamp(z, 0.38, 2.6). 0.38 = furthest out.
     - clampCam(): how far past the map edge you can pan (0.3 and 0.35 of the screen).
     - BUILD_ORDER, ECO_BLD: the order of build buttons and which tab they sit in.
     - FORMS: formation types.
   ############################################################################ */
/* ===== ui.js ===== */
/* ==========================================================================
   UI — drawing the world, camera, touch + mouse input, HUD and menus.
   ========================================================================== */
const $ = (id) => document.getElementById(id);
const cvs = $('view'), ctx = cvs.getContext('2d');
const miniEl = $('mini'), mctx = miniEl.getContext('2d');
const RESCOL = { food: '#ff8f7a', wood: '#d9a66a', gold: '#f2c94c' };
const NODE_NAME = { tree: 'Tree', berry: 'Berry bush', gold: 'Gold deposit', fish: 'School of fish', carcass: 'Deer carcass' };
const ECO_BLD = new Set(['house', 'farm', 'sawah', 'baray', 'store', 'granary', 'port', 'tradepost']);
let buildTab = 'eco';
const BUILD_ORDER = ['house', 'farm', 'sawah', 'store', 'granary', 'barracks', 'rumahtabib', 'patirthan', 'wat', 'port', 'tower', 'palisade', 'wall', 'gate', 'tradepost', 'palace'];
const FORMS = ['box', 'line', 'wedge'];

let G = null, terrainC = null, miniBase = null, fogC = null, fogCtx = null, fogImg = null, fogSeen = -1;
const cam = { x: 0, y: 0 }, view = { w: 800, h: 600, dpr: 1, zoom: 1 };
let sel = [], mode = null, formation = 'box', speed = 1, paused = true, started = false;
let diff = 'normal', seedUsed = 20241020, markers = [], hover = null, lastTap = { id: 0, t: 0 };
let boxRect = null, acc = 0, lastTs = 0, nowS = 0, ended = false;
const keys = {};
const ptrs = new Map();
let gest = null;

/* ---------------- helpers ---------------- */
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
// screen point to map point
function s2w(sx, sy) { return { x: (sx / view.zoom + cam.x) / TILE, y: (sy / view.zoom + cam.y) / TILE }; }
// map point to screen point
function w2s(wx, wy) { return { x: (wx * TILE - cam.x) * view.zoom, y: (wy * TILE - cam.y) * view.zoom }; }
// seconds as m:ss
function fmtTime(t) { t = Math.max(0, Math.floor(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
const urlCache = new Map();
// picture as an image link (cached)
function dataURL(key, make) {
  let u = urlCache.get(key); if (u) return u;
  const c = make(); u = c.toDataURL('image/png'); urlCache.set(key, u); return u;
}
// shrink a sprite into an icon
function fitIcon(spr, size) {
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const k = Math.min(size / spr.width, size / spr.height), w = Math.round(spr.width * k), h = Math.round(spr.height * k);
  x.drawImage(spr, Math.floor((size - w) / 2), Math.floor((size - h) / 2), w, h);
  return c;
}
const MINIC = [['#7dffa8', '#c8ffd9'], ['#ff5a4a', '#ff8a7a'], ['#d8d0b8', '#e8e0c8'], ['#c9a3ff', '#e4d0ff']];
// button icon for a unit
function unitIcon(kind, team) { return dataURL('ui|' + kind + CV(team) + '|a' + unitAge(team), () => fitIcon(UD[kind].layer ? shipSprite({ kind, team }) : kind === 'deer' ? deerSprite(0) : unitSprite(kind, team, 'idle', 1, ''), 44)); }
// button icon for a building
function bldIcon(kind, team, fine) {
  // wall and gate buttons show the civ's own style once the owner reaches the Age of Commerce
  if (BD[kind] && BD[kind].wall && kind !== 'palisade' && (fine || (typeof G !== 'undefined' && G && G.teamAge && G.teamAge(team) >= 3))) return dataURL('bi|' + kind + CV(team) + 'f', () => fitIcon(buildingSprite(kind, team, 100 + 10 + 32), 44));
  return dataURL('bi|' + kind + CV(team), () => fitIcon(buildingSprite(kind, team, 2), 44));
}
// icon for food, wood or gold
function resIcon(name) { return dataURL('ri|' + name, () => iconSprite(name)); }
// icon for a resource on the map
function nodeIcon(n) {
  const k = n.kind;
  return dataURL('ni|' + k, () => fitIcon(k === 'tree' ? treeSprite(0) : k === 'berry' ? bushSprite() : k === 'gold' ? goldSprite() : k === 'carcass' ? carcassSprite() : iconSprite('food'), 44));
}
// pop-up message on screen
function toast(text) {
  const box = $('toasts'); if (!box) return;
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = text; box.appendChild(d);
  while (box.children.length > 3) box.removeChild(box.firstChild);
  setTimeout(() => { if (d.parentNode) d.parentNode.removeChild(d); }, 3200);
}

/* ---------------- view and camera ---------------- */
function resize() {
  const r = cvs.getBoundingClientRect();
  view.w = Math.max(200, r.width); view.h = Math.max(200, r.height);
  view.dpr = Math.min(window.devicePixelRatio || 1, 3);
  cvs.width = Math.round(view.w * view.dpr); cvs.height = Math.round(view.h * view.dpr);
  clampCam();
}
// the camera may run a little past each edge, so the corners can be brought out from under the HUD
function clampCam() {
  const vw = view.w / view.zoom, vh = view.h / view.zoom, WW = W * TILE, HH = H * TILE, mx = vw * 0.3, my = vh * 0.35;
  cam.x = WW + 2 * mx > vw ? clamp(cam.x, -mx, WW - vw + mx) : (WW - vw) / 2;
  cam.y = HH + 2 * my > vh ? clamp(cam.y, -my, HH - vh + my) : (HH - vh) / 2;
}
// zoom the camera, kept between 0.38 (far) and 2.6 (close)
function setZoom(z, sx, sy) {
  z = clamp(z, 0.38, 2.6);
  if (sx == null) { sx = view.w / 2; sy = view.h / 2; }
  const wx = sx / view.zoom + cam.x, wy = sy / view.zoom + cam.y;
  view.zoom = z; cam.x = wx - sx / z; cam.y = wy - sy / z; clampCam();
}
// move the camera to a tile
function centerOn(tx, ty) { cam.x = tx * TILE - view.w / view.zoom / 2; cam.y = ty * TILE - view.h / view.zoom / 2; clampCam(); }
// is this on screen?
function inView(px, py, m) { return px > cam.x - m && px < cam.x + view.w / view.zoom + m && py > cam.y - m - 40 && py < cam.y + view.h / view.zoom + m; }

/* ---------------- fog ---------------- */
function initFog() {
  fogC = document.createElement('canvas'); fogC.width = W; fogC.height = H;
  fogCtx = fogC.getContext('2d'); fogImg = fogCtx.createImageData(W, H); fogSeen = -1;
}
// repaint the fog layer
function refreshFog() {
  if (fogSeen === G.fogV) return; fogSeen = G.fogV;
  const d = fogImg.data;
  for (let i = 0; i < W * H; i++) {
    const k = i * 4; d[k] = 6; d[k + 1] = 14; d[k + 2] = 12;
    d[k + 3] = G.visible[i] ? 0 : (G.explored[i] ? 118 : 255);
  }
  fogCtx.putImageData(fogImg, 0, 0);
}

