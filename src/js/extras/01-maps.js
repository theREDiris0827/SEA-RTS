/* ##### CHAPTER EXTRA 1 · Calm map look and new maps #####
   File: src/js/extras/01-maps.js
   What it does: Add-on: the quieter ground painting and the newer skirmish maps (Highlands, Deep Jungle,
   Mangrove Delta...).
   Things you can tweak:
     - NEWMAPS entries: each new map's layout.
   ############################################################################ */
/* ===== maps: calm look + new maps (sea-rts-fixes/maps/wiring/wire.py) ===== */
/* Calm map painter (art thread, 2026-11-01, round 2 after Iylia: "too complicated, keep it simple yet diverse").
   Same six grounds as the game, same 4px blocks, with three quiet changes:
   1. big soft patches of a second green (and a darker forest green under tree clusters), low contrast;
   2. one-block fray where two grounds meet, no noise;
   3. a few regional tree types picked by place: palms on the coast, a broadleaf mix inland.
   Wrapped so it can run inside the game page without name clashes. Exposes window.CALM. */
(function () {
  const h = (x, y, s) => { let v = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; v = (v ^ (v >>> 13)) * 1274126177; v ^= v >>> 16; return ((v >>> 0) % 100000) / 100000; };
  const vn = (x, y, s) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return (h(ix, iy, s) * (1 - sx) + h(ix + 1, iy, s) * sx) * (1 - sy) + (h(ix, iy + 1, s) * (1 - sx) + h(ix + 1, iy + 1, s) * sx) * sy; };
  // 0 grass 1 dirt 2 sand 3 shallow 4 deep 5 cliff (game's T)
  const PALS = [
    ['#5b8c4a', '#608f4e', '#56853f', '#64954f'],      // grass (game)
    ['#8d6e4b', '#846643', '#977755', '#7f6140'],      // dirt (game)
    ['#d6c58b', '#cdbb80', '#ded09a', '#d0bf86'],      // sand (game)
    ['#4ba3bf', '#4499b6', '#53aac6', '#4fa0bb'],      // shallow (game)
    ['#2c6f90', '#28678a', '#31779a', '#2a6c8d'],      // deep (game)
    ['#7f8a7a', '#76806f', '#89937f', '#717b6b'],      // cliff: same grey, nudged toward moss green
    ['#7a6e58', '#716550', '#837760', '#6b604c'],      // 6 mud flat
    ['#4f7a6a', '#4a7364', '#55806f', '#46705f'],      // 7 swamp water (green-brown, shallow)
    ['#86b48c', '#8cba92', '#7eac84', '#92c098'],      // 8 flooded rice terrace
    ['#8a9284', '#80887a', '#949c8c', '#78806f']       // 9 karst limestone
  ];
  const WET = (t) => t === 3 || t === 4 || t === 7;
  const MEADOW = ['#62934e', '#679752', '#5d8c48', '#6a9b54'];   // sunlit grass patches
  const FOREST = ['#4c7c3e', '#507f42', '#48763a', '#548446'];   // shade under tree clusters
  // paint the calm ground look
  function paint(ctx, terr, W, H, x0, y0, w, hh, opt) {
    const T = 32, s = opt.seed || 1, at = (tx, ty) => terr[Math.max(0, Math.min(H - 1, ty)) * W + Math.max(0, Math.min(W - 1, tx))];
    const shade = opt.shade || (() => 0);
    for (let by = 0; by < hh * 8; by++) for (let bx = 0; bx < w * 8; bx++) {
      const gx = x0 * 8 + bx, gy = y0 * 8 + by, tx = x0 + (bx >> 3), ty = y0 + (by >> 3), ix = bx & 7, iy = by & 7;
      let t = at(tx, ty);
      // fray: an edge block may take the neighbour's ground (only the outer ring, about 1 in 3)
      const edge = ix === 0 ? [-1, 0] : ix === 7 ? [1, 0] : iy === 0 ? [0, -1] : iy === 7 ? [0, 1] : null;
      if (edge) { const n = at(tx + edge[0], ty + edge[1]); if (n !== t && h(gx, gy, s + 3) < 0.38 && !(t === 5 || n === 5 || t === 9 || n === 9 || t === 8 || n === 8)) t = n; }
      let pal = PALS[t];
      if (t === 0) { const sh = shade(gx / 8, gy / 8); if (sh > 0.5 + (h(gx, gy, s + 8) - 0.5) * 0.4) pal = FOREST; else if (vn(gx / 40, gy / 40, s + 5) + (h(gx, gy, s + 6) - 0.5) * 0.12 > 0.6) pal = MEADOW; }
      const r = h(gx, gy, s); ctx.fillStyle = pal[Math.min(3, Math.floor(r * r * 4))]; ctx.fillRect(bx * 4, by * 4, 4, 4);
    }
    for (let ty = y0; ty < y0 + hh; ty++) for (let tx = x0; tx < x0 + w; tx++) {
      const t = at(tx, ty), X = (tx - x0) * T, Y = (ty - y0) * T, R = (i) => h(tx, ty, s + 100 + i), f = (x, y, ww, hh2, c) => { ctx.fillStyle = c; ctx.fillRect(X + x, Y + y, ww, hh2); };
      if (t === 0) {
        const cx = tx * 8 + 4, cy = ty * 8 + 4, sh = shade(tx + 0.5, ty + 0.5), mead = vn(cx / 40, cy / 40, s + 5) > 0.58;
        for (let i = 0; i < 3; i++) { const x = Math.floor(R(i) * 26) + 3, y = Math.floor(R(i + 9) * 24) + 5; f(x, y - 1, 1, 2, '#477a38'); f(x - 1, y - 3, 1, 2, '#6a9e55'); f(x + 1, y - 3, 1, 2, '#6a9e55'); f(x, y - 2, 1, 1, '#527f3e'); }
        if (opt.texture !== false && sh > 0.4) {          // undergrowth: small fern sprigs in the shade
          for (let i = 0; i < 3; i++) { const x = Math.floor(R(40 + i) * 26) + 3, y = Math.floor(R(50 + i) * 24) + 6; f(x, y, 1, 2, '#3a6630'); f(x - 2, y - 1, 2, 1, '#3e6e34'); f(x + 1, y - 1, 2, 1, '#3e6e34'); f(x - 1, y - 2, 1, 1, '#5a8a48'); f(x + 1, y - 2, 1, 1, '#5a8a48'); }
        } else if (opt.texture !== false && (mead || opt.lalang)) {   // lalang: thin pale blades in sunny patches
          const n = opt.lalang ? 6 : 4;
          for (let i = 0; i < n; i++) { const x = Math.floor(R(60 + i) * 24) + 4, y = Math.floor(R(70 + i) * 20) + 10, tip = R(80 + i) < 0.55;
            f(x - 2, y - 3, 1, 3, '#5f8a44'); f(x - 1, y - 5, 1, 5, '#78a050'); f(x, y - 6, 1, 6, '#8cb25c'); f(x + 1, y - 5, 1, 4, '#78a050'); f(x + 2, y - 3, 1, 3, '#5f8a44'); f(x - 2, y, 5, 1, '#4a7a3a');
            if (tip) { f(x, y - 8, 1, 2, '#ece6c4'); f(x - 1, y - 7, 1, 1, '#d8d2ac'); f(x + 1, y - 6, 1, 1, '#d8d2ac'); }}
        }
        if (R(30) < 0.06) f(Math.floor(R(31) * 26) + 2, Math.floor(R(32) * 26) + 2, 2, 2, ['#f4f1da', '#f2c94c', '#e58bb0'][Math.floor(R(33) * 3)]); }
      else if (t === 6) { for (let i = 0; i < 3; i++) { const x = Math.floor(R(i) * 26) + 2, y = Math.floor(R(i + 9) * 26) + 2; f(x, y, 2, 2, '#4e4436'); f(x - 1, y - 1, 1, 1, '#9a8e74'); } f(Math.floor(R(20) * 16) + 2, Math.floor(R(21) * 24) + 4, 8, 1, '#8e9a90'); }
      else if (t === 7) { f(Math.floor(R(1) * 20) + 2, Math.floor(R(2) * 26) + 2, 6, 1, '#6e9a86'); if (R(3) < 0.5) { const x = Math.floor(R(4) * 22) + 4, y = Math.floor(R(5) * 20) + 6; f(x, y, 4, 2, '#5a8a3e'); f(x + 1, y, 2, 1, '#7ab050'); } }
      else if (t === 8) { f(0, 0, 32, 3, '#6a8a4c'); f(0, 0, 32, 1, '#8aa862'); if (at(tx, ty + 1) !== 8) f(0, 30, 32, 2, '#5a7a44');
        for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const x = 3 + i * 6 + (j % 2) * 3, y = 8 + j * 7; f(x, y, 2, 3, '#4e8a3c'); f(x, y - 1, 1, 1, '#6aa64e'); }
        f(Math.floor(R(5) * 18) + 4, Math.floor(R(6) * 16) + 8, 5, 1, '#b4dcc8'); }
      else if (t === 9) { const top = at(tx, ty - 1) !== 9; for (let i = 0; i < 2; i++) { const x = Math.floor(R(i) * 20) + 4, y = Math.floor(R(i + 9) * 18) + 8; f(x, y, 2, 8, '#6e7666'); f(x + 2, y, 1, 6, '#a4ac9a'); }
        if (top) { f(0, 0, 32, 6, '#4e8a3e'); for (let x = 0; x < 32; x += 4) f(x + (R(x) < 0.5 ? 0 : 2), 6, 2, 2 + Math.floor(R(x + 1) * 4), '#3e7434'); f(4, 1, 6, 2, '#6aa452'); }
        if (at(tx, ty + 1) !== 9) { f(0, 26, 32, 6, '#5c6456'); f(0, 30, 32, 2, '#454c40'); } }
      else if (t === 1 || t === 2) { for (let i = 0; i < 3; i++) f(Math.floor(R(i) * 28) + 1, Math.floor(R(i + 9) * 28) + 1, 2, 2, t === 2 ? '#b8a56d' : '#6e5236'); }
      else if (t === 3 || t === 4) { f(Math.floor(R(1) * 22) + 2, Math.floor(R(2) * 28) + 2, 6, 2, t === 3 ? '#7cc4d8' : '#4a8fb0'); }
      else if (t === 5) { for (let i = 0; i < 2; i++) { const x = Math.floor(R(i) * 22) + 2, y = Math.floor(R(i + 9) * 16) + 2; f(x, y, 7, 4, '#9aa290'); f(x, y + 4, 7, 1, '#545c4c'); } if (R(20) < 0.5) f(Math.floor(R(21) * 24) + 2, Math.floor(R(22) * 24) + 2, 5, 2, '#5f8a48'); }
      // shore: foam on water next to land, broken a little
      if (t === 3 || t === 4) for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { const n = at(tx + dx, ty + dy); if (WET(n) || n === 6) continue;
        for (let i = 0; i < 32; i += 4) { if (h(tx * 40 + i, ty * 3 + dx + dy * 2, s + 9) < 0.25) continue; const d = 2 + (h(i, tx + ty, s) < 0.5 ? 0 : 2); ctx.fillStyle = '#d4ecf0';
          if (dy) ctx.fillRect(X + i, dy < 0 ? Y : Y + 32 - d, 4, d); else ctx.fillRect(dx < 0 ? X : X + 32 - d, Y + i, d, 4); } }
    }
  }
  // trees: the game's two plus three simple regional ones, same size and palette
  const L1 = '#245f2d', L2 = '#2f7a3a', L3 = '#3a8a42', L4 = '#5fb35a', L5 = '#79c871';
  // paint a regional tree (palm, broadleaf...)
  function tree(kind) {
    return sprite('calm|' + kind, 20, 28, 2, (P) => {
      const r = P.r;
      if (kind === 'angsana') {   // flat umbrella crown: shade tree of roads and squares
        r(9, 15, 3, 12, '#6b4a2a'); r(9, 15, 1, 12, '#4d3320'); r(7, 26, 7, 1, '#4d3320');
        disc(P, 5, 12, 5, L2); disc(P, 15, 12, 5, L2); disc(P, 10, 10, 6, L3); r(1, 13, 19, 3, L2); r(2, 15, 17, 1, L1); disc(P, 8, 8, 2, L4); r(6, 7, 2, 1, L5);
      } else if (kind === 'pinang') {   // slim areca palm by houses
        for (let y = 9; y < 27; y++) r(10, y, 1, 1, y % 4 ? '#a89a6a' : '#7a6e4a');
        r(9, 9, 3, 3, '#5a9a3a'); r(9, 12, 1, 2, '#e07a2a');
        for (const [dx, l] of [[-1, 6], [1, 6]]) for (let t = 1; t <= l; t++) r(10 + dx * t, 8 + Math.round(t * t * 0.12), 2, 1, t % 2 ? L3 : L4);
        for (let t = 1; t <= 4; t++) { r(10 - t, 8 - t, 1, 1, L3); r(11 + t, 8 - t, 1, 1, L3); }
        r(9, 26, 3, 1, '#4d3320');
      } else if (kind === 'mango') {   // dense round orchard tree with a few fruit
        r(9, 18, 3, 9, '#6b4a2a'); r(9, 18, 1, 9, '#4d3320');
        disc(P, 10, 11, 8, '#2a6e36'); disc(P, 8, 9, 5, '#347a3c'); disc(P, 7, 7, 2, '#4e9a4a');
        for (const [x, y] of [[5, 13], [13, 14], [15, 9]]) { r(x, y, 2, 2, '#e8b830'); r(x, y + 1, 1, 1, '#c86a2a'); }
      }
    });
  }
  // biome plants, same palette and outline as the game's trees
  function plant(kind) {
    const D = { jungle: [22, 34], bamboo: [18, 32], mangrove: [24, 24], nipa: [20, 16], fern: [14, 10], pine: [16, 32], lalang: [14, 10], karstTree: [14, 16], karst: [30, 44], karstS: [20, 34] }[kind];
    return sprite('calmp|' + kind, D[0], D[1], 2, (P) => {
      const r = P.r;
      if (kind === 'jungle') {        // tall rainforest tree: straight pale trunk, buttress, dark crown with a lit edge
        r(10, 14, 3, 19, '#8a7a5e'); r(10, 14, 1, 19, '#6a5a44'); r(7, 30, 3, 3, '#8a7a5e'); r(13, 30, 3, 3, '#8a7a5e');
        disc(P, 6, 11, 5, '#245f2d'); disc(P, 16, 11, 5, '#245f2d'); disc(P, 11, 8, 7, '#2a6a32'); disc(P, 9, 6, 3, '#3a8a42'); r(2, 13, 18, 2, '#1e4e26'); r(7, 3, 2, 1, '#5fb35a');
      } else if (kind === 'bamboo') {  // clump of canes with joints, feathery leaves leaning out
        for (const [x, top, c] of [[4, 6, '#7aa040'], [7, 2, '#8ab048'], [10, 4, '#6e9638'], [13, 8, '#7aa040']]) { for (let y = top; y < 31; y++) r(x, y, 1, 1, y % 5 === 0 ? '#4e6e28' : c); }
        for (const [x, y, d] of [[4, 6, -1], [7, 2, 1], [10, 4, 1], [13, 8, 1], [7, 10, -1], [10, 13, 1], [4, 15, -1]]) for (let t = 1; t <= 4; t++) r(x + d * t, y + Math.floor(t / 2), 2, 1, t % 2 ? '#5a9a3c' : '#7cc05a');
        r(2, 30, 14, 2, '#4a6a30');
      } else if (kind === 'mangrove') { // arching stilt roots into water, a low round crown
        for (const [x0, dir] of [[8, -1], [10, -1], [13, 1], [15, 1]]) for (let t = 0; t < 7; t++) r(x0 + dir * Math.floor(t / 2), 14 + t, 1, 1, '#6a5a40');
        r(11, 10, 2, 6, '#5e4e36');
        disc(P, 12, 8, 7, '#2a6236'); disc(P, 7, 9, 4, '#2f6e3a'); disc(P, 17, 9, 4, '#2f6e3a'); disc(P, 10, 6, 3, '#4a8a4a'); r(5, 12, 15, 1, '#1e4a28');
        r(3, 21, 18, 1, '#9ad0c8'); r(5, 22, 14, 1, '#6aa8a0');
      } else if (kind === 'nipa') {
        for (const [x0, dx, l] of [[10, -1, 8], [10, 1, 8], [10, -0.5, 7], [10, 0.5, 7], [10, 0, 6]]) for (let t = 1; t <= l; t++) r(Math.round(x0 + dx * t), 13 - Math.round(t * (1 - Math.abs(dx) * 0.6)) + Math.round(t * t * 0.05 * Math.abs(dx) * 2), 2, 1, t % 2 ? '#4e8a3c' : '#6aa850');
        r(4, 14, 13, 1, '#9ad0c8');
      } else if (kind === 'fern') {
        for (const [x, d] of [[3, -1], [6, 0], [9, 1]]) for (let t = 0; t < 5; t++) { r(x + d * t, 8 - t, 2, 1, '#3e7a34'); r(x + d * t + (d >= 0 ? -1 : 1), 8 - t - 1, 1, 1, '#5a9a44'); }
        r(2, 8, 10, 1, '#2e5a28');
      } else if (kind === 'lalang') {
        for (let i = 0; i < 6; i++) { const x = 2 + i * 2; r(x, 3 + (i % 3), 1, 7 - (i % 3), i % 2 ? '#a8b866' : '#8aa04a'); r(x, 2 + (i % 3), 1, 1, '#ece8c8'); }
      } else if (kind === 'pine') {     // highland pine (thông), tiers of dark needles
        r(7, 20, 2, 11, '#6b4a2a'); r(7, 20, 1, 11, '#4d3320');
        for (let k = 0; k < 5; k++) { const y = 2 + k * 4, w = 2 + k * 1.3; r(Math.round(8 - w), y + 2, Math.round(w * 2), 3, k % 2 ? '#2a5a3a' : '#2f6640'); r(Math.round(8 - w) + 1, y + 2, 2, 1, '#4e8a5a'); }
        r(7, 0, 2, 3, '#2f6640');
      } else if (kind === 'karst' || kind === 'karstS') {  // limestone tower (Ninh Binh / Ha Long): grey pillar, vertical streaks, green cap and ledges
        const big = kind === 'karst', w = big ? 30 : 20, hgt = big ? 44 : 34;
        const J = (y, k) => Math.round(Math.sin(y * 0.9 + k) * 1.2 + Math.sin(y * 0.37 + k * 2) * 1.5);
        for (let y = 3; y < hgt; y++) { const f = y / hgt, half = (big ? 6 : 4) + f * (big ? 8 : 5) + (y > hgt - 6 ? 1 : 0), l = Math.round(w / 2 - half + J(y, 1)), rr = Math.round(w / 2 + half + J(y, 4));
          r(l, y, rr - l, 1, '#7c8476'); r(l, y, 1, 1, '#9aa290'); r(l + 1, y, 2, 1, '#8e9688'); r(rr - 3, y, 3, 1, '#626a5c'); }
        for (const [x, y0, len] of (big ? [[10, 12, 18], [15, 8, 26], [20, 14, 16]] : [[8, 10, 14], [12, 14, 12]])) for (let y = y0; y < y0 + len; y++) if ((y * 3 + x) % 5) r(x + (y % 9 < 4 ? 0 : 1), y, 1, 1, '#687062');
        for (const [x, y] of (big ? [[8, 18], [19, 23], [12, 30]] : [[6, 16], [12, 22]])) r(x, y, 4, 1, '#565e50');
        disc(P, w / 2 - 1, 6, big ? 6 : 4, '#2f6e34'); disc(P, w / 2 + 2, 5, big ? 4 : 3, '#3a7a3a'); disc(P, w / 2 - 3, 4, 2, '#4e8a3e'); r(w / 2 - 4, 2, 3, 1, '#6aa452');
        for (const [x, y, s] of (big ? [[7, 17, 2], [21, 22, 2], [11, 29, 2], [18, 34, 1]] : [[5, 15, 1], [14, 21, 2]])) { disc(P, x, y, s, '#3a7034'); r(x - 1, y - s, 2, 1, '#5a9a4a'); for (let d = 1; d < 4; d++) r(x + (d % 2), y + s + d - 1, 1, 1, '#3a7034'); }
        r(2, hgt - 2, w - 4, 2, '#5c6456');
      } else if (kind === 'karstTree') {
        r(6, 10, 2, 6, '#5e4e36'); disc(P, 7, 6, 5, '#3a7a3a'); disc(P, 5, 5, 2, '#5a9a4a');
      }
    });
  }
  window.CALM = { paint, tree, plant };
})();

/* New skirmish maps (art thread "Unit, mob and map art style", 2026-11-01, Iylia):
   Highlands (northern Vietnam), Deep Jungle (landlocked) and Mangrove Delta.
   Load AFTER the main game script and after calm.js (window.CALM). Touches the game only through
   MAPDEF, UD, NK, MAP_NOTES and by wrapping: Game.prototype.genMap / populate / addNode,
   buildTerrain, buildMiniBase, paintNode, paintUnit, nodeIcon, unitIcon. Old maps are untouched.
   Gameplay grounds stay the game's six (T); the new looks (mud, swamp water, terraces, karst) are
   worked out again from the seed whenever the terrain is drawn, so saves need nothing new. */
(function () {
  if (typeof Game === 'undefined' || !window.CALM) return;
  const NEWMAP = { highlands: 1, jungle: 1, delta: 1 };
  const isNew = (g) => g && NEWMAP[g.map];
  const D2 = (a, b, x, y) => (a - x) * (a - x) + (b - y) * (b - y);

  /* ---------- new food sources and wild animals ---------- */
  NK.durian = { type: 'food', amt: 300, rate: 1.1 };      // durian tree: lots of food, a bit slow
  NK.pisang = { type: 'food', amt: 200, rate: 1.4 };      // wild banana clump: quick food
  const deer = UD.deer;
  UD.kancil = Object.assign({}, deer, { name: 'Kancil (mouse-deer)', hp: 8, spd: 1.6, meat: 60 });
  UD.boar = Object.assign({}, deer, { name: 'Babi hutan (wild boar)', hp: 30, spd: 1.15, meat: 170 });
  UD.seladang = Object.assign({}, deer, { name: 'Seladang (wild cattle)', hp: 70, spd: 0.9, meat: 320 });
  UD.deer.meat = UD.deer.meat || 120;
  const WILD = { kancil: 1, boar: 1, seladang: 1 };
  if (typeof NODE_NAME !== 'undefined') Object.assign(NODE_NAME, { durian: 'Durian tree', pisang: 'Wild bananas (pisang)', carcass: 'Carcass' });
  if (typeof BRIEF !== 'undefined') Object.assign(BRIEF, { kancil: 'Tiny and quick, a little meat', boar: 'Tough hide, good meat', seladang: 'Huge wild cattle, a lot of meat', durian: 'Durian tree: a lot of food', pisang: 'Wild bananas: quick food' });

  // meat by animal: the carcass the game drops gets the dead animal's meat
  const _addNode = Game.prototype.addNode;
  Game.prototype.addNode = function (kind, x, y, amt) {
    const n = _addNode.call(this, kind, x, y, amt);
    if (kind === 'carcass' && amt == null) {
      const a = this.units.find(u => u.cls === 'animal' && u.hp <= 0 && Math.floor(u.x) === x && Math.floor(u.y) === y);
      if (a && UD[a.kind].meat) { n.amt = n.max = UD[a.kind].meat; }
      if (a && WILD[a.kind]) for (let i = this.fx.length - 1; i >= 0; i--) { const f = this.fx[i]; if (f.k === 'corpse' && f.kind === a.kind) { f.kind = 'deer'; break; } }
    }
    return n;
  };

  /* ---------- sprites (game pixel style: 2x bake, auto outline) ---------- */
  function wildSprite(kind, f) {
    const l = f ? 1 : 0;
    if (kind === 'kancil') return sprite('wild|kancil|' + f, 14, 12, 2, (P) => { const r = P.r, c = '#b8743a';
      r(3, 5, 7, 3, c); r(4, 7, 5, 1, '#e0b07a'); r(9, 3, 2, 3, c); r(10, 2, 3, 2, '#a8682f'); r(12, 3, 1, 1, '#2a1a10'); r(11, 3, 1, 1, '#17110c');
      r(9, 6, 2, 1, '#f4ecd4'); r(10, 7, 1, 1, '#f4ecd4');
      r(4, 8, 1, 3 - l, '#7a4a22'); r(6, 8, 1, 2 + l, '#7a4a22'); r(8, 8, 1, 2 + l, '#7a4a22'); r(9, 8, 1, 3 - l, '#7a4a22'); });
    if (kind === 'boar') return sprite('wild|boar|' + f, 18, 14, 2, (P) => { const r = P.r, c = '#4e4440';
      r(3, 5, 11, 5, c); r(3, 4, 9, 1, '#3a322e'); for (let x = 4; x < 12; x += 2) r(x, 3, 1, 1, '#2a2422');
      r(12, 5, 4, 4, '#5a504a'); r(15, 7, 2, 2, '#8a6e66'); r(14, 6, 1, 1, '#17110c'); r(15, 9, 1, 1, '#f0e8d0'); r(13, 3, 1, 2, '#3a322e');
      r(4, 9, 8, 1, '#6a5e58'); r(2, 5, 1, 2, '#3a322e');
      r(4, 10, 2, 3 - l, '#2e2826'); r(7, 10, 1, 2 + l, '#2e2826'); r(10, 10, 1, 2 + l, '#2e2826'); r(12, 10, 2, 3 - l, '#2e2826'); });
    return sprite('wild|seladang|' + f, 24, 18, 2, (P) => { const r = P.r, c = '#3a2a22';
      r(4, 6, 14, 7, c); r(7, 4, 7, 3, '#46342a'); r(5, 12, 12, 1, '#2a1e18'); r(3, 7, 1, 4, '#2a1e18');
      r(17, 6, 4, 5, '#46342a'); r(20, 8, 2, 3, '#5a463a'); r(19, 7, 1, 1, '#17110c'); r(17, 4, 4, 2, '#8a7a5a');
      r(16, 3, 1, 2, '#e6d6aa'); r(21, 3, 1, 2, '#e6d6aa'); r(15, 2, 1, 1, '#e6d6aa'); r(22, 2, 1, 1, '#e6d6aa');
      for (const [x, d] of [[5, -l], [8, l], [13, l], [16, -l]]) { r(x, 13, 2, 3 + d, c); r(x, 15 + d, 2, 1, '#f0e8d8'); } });
  }
  // durian and wild banana pictures
  function foodSprite(kind) {
    if (kind === 'durian') return sprite('food|durian', 20, 30, 2, (P) => { const r = P.r;
      r(9, 15, 3, 14, '#6b4a2a'); r(9, 15, 1, 14, '#4d3320'); r(7, 27, 2, 2, '#6b4a2a'); r(12, 27, 2, 2, '#6b4a2a');
      disc(P, 10, 9, 8, '#2a6a32'); disc(P, 5, 11, 5, '#2f7a3a'); disc(P, 15, 10, 5, '#3a8a42'); disc(P, 9, 6, 3, '#4e9a4a'); r(4, 15, 13, 2, '#1e4e26');
      for (const [x, y] of [[5, 14], [11, 15], [15, 13], [8, 11]]) { r(x, y, 3, 4, '#a8a03a'); r(x, y, 1, 1, '#d8cc5a'); r(x + 2, y + 2, 1, 1, '#6e6a22'); r(x + 1, y - 1, 1, 1, '#4d3320'); } });
    return sprite('food|pisang', 18, 22, 2, (P) => { const r = P.r;
      for (const [x, h] of [[5, 14], [9, 18], [12, 12]]) r(x, 21 - h, 2, h, '#6a8a3a');
      const leaf = (x, y, d, n) => { for (let t = 0; t < n; t++) { r(x + d * t, y - Math.round(t * 0.5) + (t > n - 3 ? t - n + 3 : 0), 2, 3, t % 2 ? '#5aa04a' : '#6ab456'); r(x + d * t, y + 1 - Math.round(t * 0.5), 1, 1, '#3e7a34'); } };
      leaf(9, 5, -1, 8); leaf(10, 4, 1, 8); leaf(6, 9, -1, 6); leaf(13, 8, 1, 5); leaf(9, 2, 0, 1);
      r(10, 10, 1, 3, '#4e6e2a'); for (let i = 0; i < 3; i++) r(9 + (i % 2), 12 + i, 3, 1, i ? '#c8c040' : '#a8b040'); r(10, 15, 2, 2, '#7a2a4a'); });
  }
  // which tree type grows at a spot
  function treeFor(n, g) {
    const r = hash2(n.tx, n.ty, 4242), lk = lookOf(g), t = lk.look[n.ty * W + n.tx];
    if (g.map === 'jungle') { if (lk.bam && lk.bam(n.tx, n.ty)) return CALM.plant('bamboo'); return r < 0.45 ? CALM.plant('jungle') : r < 0.8 ? treeSprite(2 + (n.v & 1)) : r < 0.9 ? CALM.tree('angsana') : r < 0.95 ? CALM.tree('mango') : treeSprite(n.v & 1); }
    if (g.map === 'highlands') { const e = lk.e(n.tx, n.ty); if (e > 0.56) return r < 0.65 ? CALM.plant('pine') : treeSprite(2 + (n.v & 1)); if (e > 0.33) return r < 0.6 ? CALM.plant('bamboo') : r < 0.85 ? treeSprite(2 + (n.v & 1)) : CALM.plant('jungle'); return r < 0.6 ? treeSprite(2 + (n.v & 1)) : r < 0.8 ? CALM.tree('mango') : CALM.plant('bamboo'); }
    // delta: mangroves on the mud, palms and broadleaf on dry ground
    if (t === 6) return r < 0.75 ? CALM.plant('mangrove') : CALM.plant('nipa');
    return r < 0.55 ? treeSprite(n.v & 1) : r < 0.9 ? treeSprite(2 + (n.v & 1)) : CALM.tree('angsana');
  }

  /* ---------- the three maps: terrain fields worked out from the seed only ---------- */
  function fields(map, s) {
    if (map === 'highlands') {
      const rx = (y) => 47 + 10 * Math.sin(y / 11 + s % 7) + 3 * Math.sin(y / 4.3 + 1);
      const e = (x, y) => Math.min(1, Math.abs(x - rx(y)) / 40) * 0.8 + fbm(x * 0.06, y * 0.06, s + 4) * 0.5 - 0.15;
      return { rx, e, terrace: (x, y) => { const v = e(x, y), d = Math.abs(x - rx(y)); return v > 0.08 && v < 0.36 && d > 3.2 && d < 17 && fbm(x * 0.15, y * 0.15, s + 3) > 0.42; } };
    }
    if (map === 'jungle') {
      const rx = (y) => 48 + 11 * Math.sin(y / 9 + s % 5) + 4 * Math.sin(y / 3.7);
      return { rx, dense: (x, y) => fbm(x * 0.08, y * 0.08, s + 7), bam: (x, y) => fbm(x * 0.1, y * 0.1, s + 19) > 0.68 };
    }
    // delta
    const wl = (x, y) => (y - 20) / 45 + (fbm(x * 0.07, y * 0.07, s) - 0.5) * 0.4;   // 'water level': dry north, swamp belt, then sea
    const creeks = [[22, 0.4], [40, 1.8], [58, 3.0], [76, 4.4]].map(([x0, ph]) => (y) => x0 + 3.5 * Math.sin(y / 4 + ph + s % 3) + 2 * Math.sin(y / 1.9 + ph));
    return { wl, creeks };
  }
  const LOOKC = new WeakMap();
  // which ground look a map uses
  function lookOf(g) {
    let L = LOOKC.get(g); if (L && L.ver === g.terrain) return L;
    const F = fields(g.map, g.seed), terr = g.terrain, look = new Uint8Array(W * H);
    const at = (x, y) => terr[Math.max(0, Math.min(H - 1, y)) * W + Math.max(0, Math.min(W - 1, x))];
    const wetN = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const t = at(x + a, y + b); return t === T.SHALLOW || t === T.DEEP; });
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = terr[y * W + x]; let k = t;
      if (g.map === 'highlands') { if (t === T.GRASS && F.terrace(x, y)) k = 8; else if (t === T.CLIFF) k = 9; }
      else if (g.map === 'jungle') { if ((t === T.DIRT && wetN(x, y)) || t === T.SAND) k = 6; }
      else { if (t === T.DIRT || t === T.SAND) k = 6; else if (t === T.SHALLOW && F.wl(x, y) < 0.76 && !F.creeks.some(c => Math.abs(x + 0.5 - c(y)) < 1.4)) k = 7; }
      look[y * W + x] = k;
    }
    L = { ver: terr, look, e: F.e, bam: F.bam }; LOOKC.set(g, L); return L;
  }

  // clear space around the start bases
  function clearStarts(g, r) {
    for (const st of g.starts) for (let y = st.y - r; y <= st.y + r + 3; y++) for (let x = st.x - r; x <= st.x + r + 3; x++)
      if (g.inb(x, y) && Math.hypot(x - st.x - 1, y - st.y - 1) < r + 1) g.terrain[y * W + x] = hash2(x, y, g.seed + 5) > 0.93 ? T.DIRT : T.GRASS;
  }
  // make sure both bases can reach each other
  function linkStarts(g, mat) {
    const S = g.starts; if (g.landConnected(S[0].x + 1, S[0].y + 3, S[1].x + 1, S[1].y + 3)) return;
    let x = S[0].x + 1, y = S[0].y + 1; const gx = S[1].x + 1, gy = S[1].y + 1;
    while (Math.abs(x - gx) + Math.abs(y - gy) > 1) {
      if (x !== gx && (Math.abs(x - gx) > Math.abs(y - gy) || y === gy)) x += Math.sign(gx - x); else y += Math.sign(gy - y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (g.inb(x + dx, y + dy) && g.terrain[(y + dy) * W + x + dx] > T.SAND) g.terrain[(y + dy) * W + x + dx] = mat;
    }
  }
  // make the Highlands map
  function genHighlands() {
    const s = this.seed, terr = this.terrain, F = fields('highlands', s);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d = Math.abs(x + 0.5 - F.rx(y));
      terr[y * W + x] = d < 0.9 ? T.DEEP : d < 2.0 ? T.SHALLOW : fbm(x * 0.12, y * 0.12, s + 3) > 0.74 ? T.DIRT : T.GRASS;
    }
    // three stony fords across the river
    for (const fy of [14, 37, 58]) for (let y = fy - 1; y <= fy + 1; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (terr[i] === T.SHALLOW || terr[i] === T.DEEP) terr[i] = T.SAND; }
    // karst towers: groups of one to three limestone stacks on the high ground (impassable)
    const sites = [];
    for (let i = 0; i < 400 && sites.length < 22; i++) {
      const cx = 3 + Math.floor(hash2(i, 1, s + 30) * (W - 6)), cy = 3 + Math.floor(hash2(i, 2, s + 30) * (H - 6));
      if (F.e(cx, cy) < 0.45 || Math.abs(cx - F.rx(cy)) < 6) continue;
      if (this.starts.some(st => Math.hypot(cx - st.x - 1, cy - st.y - 1) < 13) || sites.some(p => D2(p[0], p[1], cx, cy) < 49)) continue;
      sites.push([cx, cy]);
    }
    for (const [cx, cy] of sites) {
      const n = 1 + Math.floor(hash2(cx, cy, s + 31) * 3);
      for (let k = 0; k < n; k++) { const x = cx + [0, 3, -2][k], y = cy + [0, 1, 2][k], big = hash2(x, y, s + 32) < 0.5;
        for (let dx = 0; dx <= (big ? 1 : 0); dx++) if (this.inb(x + dx, y)) terr[y * W + x + dx] = T.CLIFF; }
    }
    // two long hill ridges with passes, upland on either side of the valley
    for (const [ax, ay, bx, by, gaps] of [[8, 34, 34, 22, [0.3, 0.75]], [62, 50, 90, 38, [0.25, 0.7]]]) for (let k = 0; k <= 80; k++) { const f = k / 80; if (gaps.some(g => Math.abs(f - g) < 0.06)) continue;
      const x = Math.round(ax + (bx - ax) * f + Math.sin(f * 9) * 1.5), y = Math.round(ay + (by - ay) * f); for (const dy of [0, 1]) if (this.inb(x, y + dy) && terr[(y + dy) * W + x] <= T.DIRT) terr[(y + dy) * W + x] = T.CLIFF; }
    clearStarts(this, 8); linkStarts(this, T.SAND);
  }
  // make the Deep Jungle map
  function genJungle() {
    const s = this.seed, terr = this.terrain, F = fields('jungle', s);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d = Math.abs(x + 0.5 - F.rx(y));
      terr[y * W + x] = d < 1.3 ? T.SHALLOW : (d < 2.3 && hash2(x, y, s + 1) < 0.55) ? T.DIRT : T.GRASS;
    }
    for (const [cx, cy, r] of [[26, 38, 3.4], [72, 48, 3], [60, 16, 2.6]]) for (let y = cy - 4; y <= cy + 4; y++) for (let x = cx - 4; x <= cx + 4; x++)
      if (this.inb(x, y) && Math.hypot(x + 0.5 - cx, (y + 0.5 - cy) * 1.2) < r + (hash2(x, y, s + 2) - 0.5) * 0.8) terr[y * W + x] = T.SHALLOW;
    // muddy fords where the trails cross the stream
    for (const fy of [12, 34, 56]) for (let y = fy - 1; y <= fy + 1; y++) for (let x = 0; x < W; x++) if (terr[y * W + x] === T.SHALLOW && Math.abs(x - F.rx(y)) < 3) terr[y * W + x] = T.SAND;
    // a few mossy rock outcrops
    for (const [cx, cy] of [[36, 22], [64, 58], [18, 18], [80, 36]]) for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 2; x++)
      if (this.inb(x, y) && Math.hypot(x - cx, y - cy) < 1.6 + hash2(x, y, s + 6) * 0.8 && terr[y * W + x] === T.GRASS) terr[y * W + x] = T.CLIFF;
    clearStarts(this, 8); linkStarts(this, T.SAND);
  }
  // make the Mangrove Delta map
  function genDelta() {
    const s = this.seed, terr = this.terrain, F = fields('delta', s);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let w = F.wl(x, y);
      for (const st of this.starts) w -= Math.max(0, 1 - Math.hypot(x - st.x - 1, y - st.y - 1) / 14) * 0.4;
      terr[y * W + x] = w > 0.92 ? T.DEEP : w > 0.46 ? T.SHALLOW : w > 0.36 ? T.DIRT : T.GRASS;
    }
    // tidal creeks wind up from the sea; they stop short of the dry north so the bases stay linked by land
    for (const c of F.creeks) for (let y = H - 1; y >= 22; y--) { const x = c(y); for (let tx = Math.floor(x - 1.2); tx <= x + 1.2; tx++) if (this.inb(tx, y) && terr[y * W + tx] !== T.DEEP) terr[y * W + tx] = Math.abs(tx + 0.5 - x) < 0.6 && y > 40 ? T.DEEP : T.SHALLOW; }
    // mud banks along every creek and pool
    const snap = terr.slice();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (snap[y * W + x] === T.GRASS && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => snap[(y + b) * W + x + a] === T.SHALLOW) && hash2(x, y, s + 8) < 0.7) terr[y * W + x] = T.DIRT;
    // mud causeways and dry hummocks through the swamp belt, so the coast can be reached on foot
    for (const [x0, ph] of [[13, 0.5], [31, 2], [49, 3.5], [67, 5], [85, 1]]) for (let y = 18; y < H - 6; y++) { const x = Math.round(x0 + 2.5 * Math.sin(y / 5 + ph));
      if (F.wl(x, y) > 0.86) break; for (const dx of [0, 1]) if (this.inb(x + dx, y) && terr[y * W + x + dx] === T.SHALLOW && !F.creeks.some(c => Math.abs(x + dx + 0.5 - c(y)) < 1.4)) terr[y * W + x + dx] = T.DIRT; }
    for (let i = 0; i < 26; i++) { const cx = 4 + hash2(i, 5, s) * (W - 8), cy = 30 + hash2(i, 6, s) * 22, r = 1.2 + hash2(i, 7, s) * 1.8;
      for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if (this.inb(x, y) && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < r && terr[y * W + x] === T.SHALLOW && F.wl(x, y) < 0.76) terr[y * W + x] = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < r - 1 ? T.GRASS : T.DIRT; }
    // two mud causeways across the swamp belt in the middle
    for (const [ax, bx, yy] of [[14, 80, 30], [26, 68, 44]]) for (let x = ax; x <= bx; x++) { const y = Math.round(yy + 2 * Math.sin(x / 5)); for (const dy of [0, 1]) if (this.inb(x, y + dy) && terr[(y + dy) * W + x] === T.SHALLOW && !F.creeks.some(c => Math.abs(x + 0.5 - c(y)) < 1.3)) terr[(y + dy) * W + x] = T.DIRT; }
    clearStarts(this, 8); linkStarts(this, T.DIRT);
  }

  Object.assign(MAPDEF, {
    highlands: { name: 'Highlands', starts: [{ x: 10, y: 56 }, { x: 82, y: 10 }],
      gold: [[24, 44], [70, 26], [30, 12], [64, 60], [14, 26], [84, 46]], deer: [], villages: [],
      wild: [['deer', 22, 30, 3], ['deer', 72, 44, 3], ['boar', 34, 60, 2], ['boar', 60, 8, 2], ['seladang', 86, 64, 2], ['seladang', 8, 8, 2], ['kancil', 40, 24, 2], ['kancil', 54, 50, 2]],
      food: [['pisang', 30, 50, 3], ['pisang', 64, 18, 3], ['berry', 20, 14, 4], ['berry', 74, 58, 4]] },
    jungle: { name: 'Deep Jungle', starts: [{ x: 9, y: 58 }, { x: 83, y: 9 }],
      gold: [[22, 30], [70, 40], [40, 60], [54, 10], [10, 10], [84, 62]], deer: [], villages: [],
      wild: [['deer', 30, 52, 3], ['deer', 64, 18, 3], ['kancil', 18, 40, 2], ['kancil', 74, 28, 2], ['kancil', 44, 30, 2], ['boar', 38, 12, 2], ['boar', 56, 62, 2], ['boar', 86, 40, 2], ['seladang', 12, 8, 2], ['seladang', 84, 64, 2]],
      food: [['durian', 26, 22, 3], ['durian', 68, 50, 3], ['durian', 46, 46, 3], ['durian', 50, 24, 3], ['pisang', 20, 50, 4], ['pisang', 74, 20, 4], ['pisang', 34, 64, 3], ['pisang', 62, 6, 3], ['berry', 40, 40, 4], ['berry', 56, 32, 4]],
      trails: [[[11, 58], [20, 40], [36, 34], [48, 34], [62, 26], [84, 12]], [[12, 60], [30, 58], [50, 56], [70, 44], [86, 13]], [[10, 56], [14, 30], [34, 12], [60, 12], [83, 10]]] },
    delta: { name: 'Mangrove Delta', starts: [{ x: 10, y: 10 }, { x: 81, y: 10 }],
      gold: [[30, 8], [62, 8], [46, 18], [20, 40], [74, 40]], deer: [], villages: [[30, 34], [66, 34], [48, 36]],
      wild: [['deer', 40, 10, 3], ['deer', 56, 12, 3], ['boar', 20, 26, 2], ['boar', 74, 26, 2], ['kancil', 46, 28, 2]],
      food: [['pisang', 24, 16, 3], ['pisang', 70, 16, 3], ['berry', 48, 6, 4]] }
  });
  if (typeof MAP_NOTES !== 'undefined') Object.assign(MAP_NOTES, {
    highlands: 'A river valley with rice terraces, bamboo slopes and limestone towers. Three fords cross the river.',
    jungle: 'Thick jungle with no sea. Three trails link the bases; fruit trees and wild animals feed you.',
    delta: 'A mangrove coast. Creeks and swamp cut the south; mud causeways cross it, the north stays dry.'
  });

  const _gen = Game.prototype.genMap;
  Game.prototype.genMap = function () {
    if (this.map === 'highlands') return genHighlands.call(this);
    if (this.map === 'jungle') return genJungle.call(this);
    if (this.map === 'delta') return genDelta.call(this);
    return _gen.call(this);
  };

  const _pop = Game.prototype.populate;
  Game.prototype.populate = function () {
    if (!isNew(this)) return _pop.call(this);
    const M = MAPDEF[this.map], rng = this.rng, S = this.starts;
    const far = (x, y, r) => S.every(st => Math.hypot(x - st.x - 1, y - st.y - 1) > r);
    // keep the jungle trails open before the forests go in
    const trail = new Uint8Array(W * H);
    for (const pts of M.trails || []) for (let i = 0; i + 1 < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2);
      for (let k = 0; k <= n; k++) { const px = ax + (bx - ax) * k / n + Math.sin(k * 0.7 + i) * 0.8, py = ay + (by - ay) * k / n;
        for (let y = Math.floor(py - 2); y <= py + 2; y++) for (let x = Math.floor(px - 2); x <= px + 2; x++) if (this.inb(x, y) && Math.hypot(x + 0.5 - px, y + 0.5 - py) < 1.8) {
          trail[y * W + x] = 1; this.reserve[y * W + x] = 1; if (this.terrain[y * W + x] === T.GRASS && hash2(x, y, this.seed + 40) < 0.55) this.terrain[y * W + x] = T.DIRT; } }
    }
    _pop.call(this);
    const free = (x, y) => this.freeTile(x, y) && !this.reserve[y * W + x] && !trail[y * W + x];
    const near = (kind, cx, cy, spread, count) => { let got = 0; for (let i = 0; i < count * 14 && got < count; i++) { const a = rng() * 6.283, r = Math.sqrt(rng()) * spread, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r); if (!this.inb(x, y) || !free(x, y) || !far(x, y, 7.5)) continue; this.addNode(kind, x, y); got++; } };
    for (const [kind, x, y, n] of M.food) { const c = this.nearestFree(x, y, 0, 6); if (c) near(kind, c.x, c.y, 2, n); }
    for (const [kind, x, y, n] of M.wild) {
      const c = this.nearestFree(x, y, 0, 6); if (!c) continue;
      for (let i = 0; i < n; i++) { const p = this.nearestFree(c.x + i, c.y + (i % 2), 0, 4); if (!p) continue;
        const d = this.addUnit(kind, 2, p.x + 0.5, p.y + 0.5); d.order = { t: 'wander', next: 2 + rng() * 5 }; }
    }
    if (this.map === 'jungle') {
      const F = fields('jungle', this.seed);
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const n = F.dense(x, y);
        if (n > 0.44 && hash2(x, y, this.seed + 41) < 0.82 && free(x, y) && far(x, y, 9.5) && this.terrain[y * W + x] === T.GRASS) this.addNode('tree', x, y); }
    } else if (this.map === 'highlands') {
      const F = fields('highlands', this.seed);
      for (let k = 0; k < 40; k++) { const x = 3 + Math.floor(rng() * (W - 6)), y = 3 + Math.floor(rng() * (H - 6)); const e = F.e(x, y); if (e < 0.33 || !far(x, y, 9)) continue; near('tree', x, y, 2.4, 8 + Math.floor(rng() * 8)); }
      // terraces stay open for farming
      for (const nd of this.nodes) if (nd.kind === 'tree' && nd.hp > 0 && F.terrace(nd.tx, nd.ty) && this.terrain[nd.ty * W + nd.tx] === T.GRASS) this.removeNode(nd);
      this.nodes = this.nodes.filter(nd => nd.hp > 0);
    } else {
      // mangroves crowd the mud along the creeks
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (this.terrain[y * W + x] === T.DIRT && hash2(x, y, this.seed + 42) < 0.42 && free(x, y) && far(x, y, 9) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => this.isWater(x + a, y + b))) this.addNode('tree', x, y);
    }
  };

  /* ---------- drawing ---------- */
  const _bt = buildTerrain;
  buildTerrain = function (g) {
    if (!isNew(g)) return _bt(g);
    const c = cv(W * TILE, H * TILE), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const L = lookOf(g), dens = new Float32Array(W * H);
    for (const n of g.nodes) if (n.kind === 'tree' && n.hp > 0) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X = n.tx + dx, Y = n.ty + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const d = dx * dx + (dy - 0.2) * (dy - 0.2); if (d < 2.6) dens[Y * W + X] += (1 - d / 2.6) / 2.2; }
    const shade = (fx, fy) => { const X = Math.floor(fx), Y = Math.floor(fy); return X < 0 || Y < 0 || X >= W || Y >= H ? 0 : dens[Y * W + X]; };
    CALM.paint(x, L.look, W, H, 0, 0, W, H, { seed: g.seed, shade });
    if (g.map === 'highlands') {   // limestone towers standing on their cliff tiles
      const done = new Uint8Array(W * H), list = [];
      for (let y = 0; y < H; y++) for (let tx = 0; tx < W; tx++) { if (g.terrain[y * W + tx] !== T.CLIFF || done[y * W + tx]) continue;
        const big = tx + 1 < W && g.terrain[y * W + tx + 1] === T.CLIFF && !done[y * W + tx + 1]; done[y * W + tx] = 1; if (big) done[y * W + tx + 1] = 1; list.push([tx, y, big]); }
      for (const [tx, y, big] of list) { const s = CALM.plant(big ? 'karst' : 'karstS'), cx = tx * TILE + (big ? 32 : 16), by = y * TILE + 31;
        x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(cx, by - 2, big ? 28 : 16, 6, 0, 0, 7); x.fill(); x.drawImage(s, Math.round(cx - s.width / 2), by - s.height); }
    }
    return c;
  };
  const _mm = buildMiniBase;
  buildMiniBase = function (g) {
    if (!isNew(g)) return _mm(g);
    const c = cv(W, H), x = c.getContext('2d'), L = lookOf(g);
    const col = ['#5b8c4a', '#8d6e4b', '#d6c58b', '#4ba3bf', '#2c6f90', '#7b7f87', '#7a6e58', '#4f7a6a', '#86b48c', '#8a9284'];
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { x.fillStyle = col[L.look[y * W + xx]]; x.fillRect(xx, y, 1, 1); }
    return c;
  };
  const _pn = paintNode;
  paintNode = function (n) {
    const px = n.tx * TILE, py = n.ty * TILE;
    if (n.kind === 'durian' || n.kind === 'pisang') {
      const spr = foodSprite(n.kind); shadow(px + 16, py + 28, 11, 4, 0.25); ctx.drawImage(spr, px + 16 - spr.width / 2, py + 31 - spr.height);
      if (isSel(n)) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(px + 2, py + 2, 28, 28); } return;
    }
    if (n.kind === 'tree' && isNew(G)) {
      const spr = treeFor(n, G); shadow(px + 16, py + 28, 11, 4, 0.25); ctx.drawImage(spr, px + 16 - spr.width / 2, py + 31 - spr.height);
      if (isSel(n)) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(px + 2, py + 2, 28, 28); } return;
    }
    return _pn(n);
  };
  const _pu = paintUnit;
  paintUnit = function (u) {
    if (!WILD[u.kind]) return _pu(u);
    const px = u.x * TILE, py = u.y * TILE, spr = wildSprite(u.kind, u.moving ? Math.floor(u.anim * 6) % 2 : 0), big = u.kind === 'seladang';
    shadow(px, py + 4, big ? 13 : 9, 3);
    if (isSel(u)) { ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5; ell(px, py + 4, big ? 15 : 11, 5); ctx.stroke(); }
    ctx.save(); ctx.translate(px, py); if (u.face < 0) ctx.scale(-1, 1); ctx.drawImage(spr, -spr.width / 2, 6 - spr.height); ctx.restore();
    if (u.hp < u.maxHp || settings.bars === 'always') hpBar(px - 8, py - spr.height + 2, 16, u.hp / u.maxHp);
  };
  const _ni = nodeIcon;
  nodeIcon = function (n) { if (n.kind === 'durian' || n.kind === 'pisang') return dataURL('ni|' + n.kind, () => fitIcon(foodSprite(n.kind), 44)); return _ni(n); };
  const _ui = unitIcon;
  unitIcon = function (kind, team) { if (WILD[kind]) return dataURL('ui|' + kind, () => fitIcon(wildSprite(kind, 0), 44)); return _ui(kind, team); };

  window.NEWMAPS = { fields, lookOf, wildSprite, foodSprite, treeFor };
})();

/* Calm look for the three original skirmish maps (Iylia approved 2026-11-01, hub batch item 7-8):
   the art thread's CALM painter (soft edges, meadow patches, shade under trees, lalang grass) and
   about one broadleaf tree in three swapped for an angsana or a mango. Campaign missions get it too (Iylia 2026-11-01). */
(function () {
  if (typeof Game === 'undefined' || !window.CALM) return;
  const OLD = { strait: 1, river: 1, islands: 1 };
  const NEWMAPS = { highlands: 1, jungle: 1, delta: 1 };
  const isOld = (g) => g && (g.M ? !NEWMAPS[g.map] : OLD[g.map || 'strait']);
  const _bt = buildTerrain;
  buildTerrain = function (g) {
    if (!isOld(g)) return _bt(g);
    const c = cv(W * TILE, H * TILE), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const dens = new Float32Array(W * H);
    for (const n of g.nodes) if (n.kind === 'tree' && n.hp > 0) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const X = n.tx + dx, Y = n.ty + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const d = dx * dx + (dy - 0.2) * (dy - 0.2); if (d < 2.6) dens[Y * W + X] += (1 - d / 2.6) / 2.2;
    }
    const shade = (fx, fy) => { const X = Math.floor(fx), Y = Math.floor(fy); return X < 0 || Y < 0 || X >= W || Y >= H ? 0 : dens[Y * W + X]; };
    CALM.paint(x, g.terrain, W, H, 0, 0, W, H, { seed: g.seed, shade });
    return c;
  };
  const hh = (a, b) => (((a * 73856093) ^ (b * 19349663)) >>> 0) % 1000 / 1000;
  const _pn = paintNode;
  paintNode = function (n) {
    if (n.kind === 'tree' && n.v >= 2 && isOld(G)) {
      const r = hh(n.tx, n.ty);
      if (r >= 0.66) {
        const px = n.tx * TILE, py = n.ty * TILE, spr = CALM.tree(r < 0.83 ? 'angsana' : 'mango');
        shadow(px + 16, py + 28, 11, 4, 0.25); ctx.drawImage(spr, px + 16 - spr.width / 2, py + 31 - spr.height);
        if (isSel(n)) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(px + 2, py + 2, 28, 28); }
        return;
      }
    }
    return _pn(n);
  };
})();

/* the three new maps in the skirmish picker; thumbnails are drawn from the maps themselves when the
   picker first opens (keeps index.html small instead of embedding pictures) */
(function () {
  const seg = document.getElementById('m-mapk'); if (!seg) return;
  const NEW = [['highlands', 'Highlands'], ['jungle', 'Deep Jungle'], ['delta', 'Mangrove Delta']];
  const ALL = [['strait'], ['river'], ['islands']].concat(NEW);
  for (const [k, n] of NEW) {
    if (seg.querySelector('[data-v="' + k + '"]')) continue;
    const b = document.createElement('button'); b.className = 'px m-map'; b.dataset.m = 'mapk'; b.dataset.v = k;
    b.innerHTML = '<img alt=""><b>' + n + '</b>'; seg.appendChild(b);
  }
  let done = false;
  const draw = () => {
    if (done) return; done = true;
    ALL.forEach(([k], i) => setTimeout(() => {
      try {
        const g = new Game({ seed: 7, diff: 'normal', map: k, civs: [0, 1] }), base = buildMiniBase(g);
        const c = cv(W * 2, H * 2), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0, W * 2, H * 2);
        x.fillStyle = 'rgba(30,70,35,.75)'; for (const n of g.nodes) if (n.kind === 'tree') x.fillRect(n.tx * 2, n.ty * 2, 2, 2);
        for (const b of g.buildings) if (b.kind === 'towncentre') { x.fillStyle = b.team === 0 ? '#f2c94c' : b.team === 1 ? '#e8463a' : '#ddd'; x.fillRect(b.tx * 2 - 1, b.ty * 2 - 1, 8, 8); }
        const img = seg.querySelector('[data-v="' + k + '"] img'); if (img) img.src = c.toDataURL();
      } catch (e) { }
    }, 50 + i * 120));
  };
  const obs = new MutationObserver(() => { if (seg.offsetParent) { draw(); obs.disconnect(); } });
  obs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['hidden', 'class'] });
  if (seg.offsetParent) draw();
})();

/* ===== end maps ===== */
