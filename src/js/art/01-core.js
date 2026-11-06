/* ##### CHAPTER ART 1 · Drawing basics #####
   File: src/js/art/01-core.js
   What it does: All art is drawn by code, pixel by pixel, then cached as pictures. Team colours and the sprite
   helper live here.
   Things you can tweak:
     - TEAMC: each team's colours. SKIN, HAIR, STEEL, WOOD: shared colours.
   ############################################################################ */
/* ===== art.js ===== */
/* ==========================================================================
   ART — every sprite is drawn from code (no image files), at a logical
   resolution and scaled 2x so the pixels stay chunky: 16x16 logical = 32x32.
   ========================================================================== */
const TEAMC = [
  { name: 'Melaka', main: '#2f9e5b', dark: '#1d6b3d', trim: '#f2c94c', roofA: '#c9ae5e', roofB: '#a98f48', roofR: '#2f6e4a', ring: '#7dffa8' },
  { name: 'Majapahit', main: '#d0392f', dark: '#8e231c', trim: '#f3dca2', roofA: '#a8402e', roofB: '#8a3324', roofR: '#2a1814', ring: '#ff7a6b' },
  { name: 'Wild', main: '#888888', dark: '#555555', trim: '#cccccc', roofA: '#999999', roofB: '#777777', roofR: '#444444', ring: '#dddddd' },
  { name: 'Ayutthaya', main: '#7b4bb3', dark: '#4e2d78', trim: '#f2c94c', roofA: '#b5523a', roofB: '#8e3d2a', roofR: '#3a1e14', ring: '#c9a3ff' }
];
const SKIN = '#d9a066', SKIN_D = '#b97a46', HAIR = '#2a1c14', CREAM = '#efe3c0', STEEL = '#dfe6ee', STEEL_D = '#97a3b0', WOOD = '#8a5a2b', WOOD_D = '#5e3b1c';
const SPR = {};

// make a blank drawing canvas
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// draw a picture once with the pixel painter P, then reuse the cached copy
function sprite(key, lw, lh, scale, draw, outline) {
  if (SPR[key]) return SPR[key];
  const c = cv(lw, lh), x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  draw({ r(px, py, w, h, col) { x.fillStyle = col; x.fillRect(px, py, w, h); }, x });
  if (outline !== false) outlineCanvas(c, x);
  const o = cv(lw * scale, lh * scale), ox = o.getContext('2d');
  ox.imageSmoothingEnabled = false; ox.drawImage(c, 0, 0, lw * scale, lh * scale);
  SPR[key] = o; return o;
}
// add the dark outline around a sprite
function outlineCanvas(c, x) {
  const w = c.width, h = c.height, img = x.getImageData(0, 0, w, h), d = img.data, out = new Uint8ClampedArray(d.length);
  out.set(d);
  const a = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? 0 : d[(j * w + i) * 4 + 3];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (d[(j * w + i) * 4 + 3] > 40) continue;
    if (a(i + 1, j) > 200 || a(i - 1, j) > 200 || a(i, j + 1) > 200 || a(i, j - 1) > 200) {
      const k = (j * w + i) * 4; out[k] = 28; out[k + 1] = 20; out[k + 2] = 14; out[k + 3] = 230;
    }
  }
  img.data.set(out); x.putImageData(img, 0, 0);
}
const WHITE = new Map();
// a white copy of a sprite (flash when hit)
function whiteOf(spr) {
  let w = WHITE.get(spr); if (w) return w;
  w = cv(spr.width, spr.height); const x = w.getContext('2d');
  x.drawImage(spr, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#ffffff'; x.fillRect(0, 0, w.width, w.height);
  WHITE.set(spr, w); return w;
}
// paint a filled pixel circle
function disc(P, cx, cy, rad, col) { for (let y = -rad; y <= rad; y++) { const w = Math.floor(Math.sqrt(rad * rad - y * y) + 0.5); P.r(cx - w, cy + y, w * 2 + 1, 1, col); } }
// paint a wooden plank wall
function planks(P, x, y, w, h, base, line) { P.r(x, y, w, h, base); for (let i = 2; i < w; i += 3) P.r(x + i, y, 1, h, line); }
// paint a sloped gable roof
function roofGable(P, cx, y0, y1, hw0, hw1, cA, cB, edge) {
  for (let y = y0; y <= y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0), hw = Math.round(hw0 + (hw1 - hw0) * t);
    P.r(cx - hw, y, hw * 2, 1, ((y - y0) % 3 === 2) ? cB : cA);
  }
  P.r(cx - hw1 - 1, y1, hw1 * 2 + 2, 1, edge);
}
// paint wooden stilts or posts
function posts(P, xs, y0, y1, w) { for (const x of xs) { P.r(x, y0, w, y1 - y0, '#5a3a1e'); P.r(x, y0, 1, y1 - y0, '#40270f'); } }

