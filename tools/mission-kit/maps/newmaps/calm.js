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
