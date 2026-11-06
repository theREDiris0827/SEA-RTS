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

  function clearStarts(g, r) {
    for (const st of g.starts) for (let y = st.y - r; y <= st.y + r + 3; y++) for (let x = st.x - r; x <= st.x + r + 3; x++)
      if (g.inb(x, y) && Math.hypot(x - st.x - 1, y - st.y - 1) < r + 1) g.terrain[y * W + x] = hash2(x, y, g.seed + 5) > 0.93 ? T.DIRT : T.GRASS;
  }
  function linkStarts(g, mat) {
    const S = g.starts; if (g.landConnected(S[0].x + 1, S[0].y + 3, S[1].x + 1, S[1].y + 3)) return;
    let x = S[0].x + 1, y = S[0].y + 1; const gx = S[1].x + 1, gy = S[1].y + 1;
    while (Math.abs(x - gx) + Math.abs(y - gy) > 1) {
      if (x !== gx && (Math.abs(x - gx) > Math.abs(y - gy) || y === gy)) x += Math.sign(gx - x); else y += Math.sign(gy - y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (g.inb(x + dx, y + dy) && g.terrain[(y + dy) * W + x + dx] > T.SAND) g.terrain[(y + dy) * W + x + dx] = mat;
    }
  }
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
