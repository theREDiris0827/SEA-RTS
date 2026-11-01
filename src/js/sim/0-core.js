/* ===== sim.js ===== */
/* ==========================================================================
   SEA RTS — simulation core. No DOM in here, so it can be tested in Node.
   Coordinates are in tile units. Units stand at tile centres (x+0.5, y+0.5).
   ========================================================================== */
const W = 96, H = 72, TILE = 32, MAXPOP = 100, STEP = 1 / 30;
/* Skirmish maps were laid out on a 64x48 grid; they now scale up to the map size, 96x72 (Iylia, 2026-10-31).
   MSX/MSY turn a layout point into tiles. Demo pages build on 64x48, where both are 1. */
const MSX = W / 64, MSY = H / 48;
const T = { GRASS: 0, DIRT: 1, SAND: 2, SHALLOW: 3, DEEP: 4, CLIFF: 5 };

const SAVE_VERSION = 1;
const SNAP_SKIP = new Set(['region', 'byId', 'hash', 'burning', 'claims', 'pSeen', 'pClosed', 'pG', 'pPar', 'visible', 'fx', 'arrows', 'floaters', 'msgs', 'alerts', 'rng']);
const SNAP_TA = { Uint8Array, Int32Array, Float32Array, Uint16Array, Int16Array, Float64Array };
// Sets, Maps and typed arrays survive JSON as tagged objects
function snapEnc(k, v) {
  if (v instanceof Set) return { $set: Array.from(v) };
  if (v instanceof Map) return { $map: Array.from(v) };
  if (ArrayBuffer.isView(v)) return { $ta: v.constructor.name, d: Array.from(v) };
  return v;
}
function snapDec(k, v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    if (v.$set) return new Set(v.$set);
    if (v.$map) return new Map(v.$map);
    if (v.$ta) return new (SNAP_TA[v.$ta])(v.d);
  }
  return v;
}
function mulberry32(a) {
  const f = function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  f.get = () => a; f.set = (v) => { a = v; };   // so a saved game resumes the same random sequence
  return f;
}
function hash2(x, y, s) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s) {
  return vnoise(x, y, s) * 0.6 + vnoise(x * 2.1, y * 2.1, s + 7) * 0.3 + vnoise(x * 4.3, y * 4.3, s + 13) * 0.1;
}

