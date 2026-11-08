  /* ##### CHAPTER SIM 4 · Starting a game #####
     File: src/js/sim/04-game-setup.js
     What it does: The Game class begins here. Makes the map (genMap, rivers, islands), thins trees (openWoods),
     places villages, bases and resources (populate), and saves/loads (snapshot).
     Things you can tweak:
       - populate(): what each side starts with and where resources go.
       - openWoods(): how many trees get cleared. Missions turn it off.
     ############################################################################ */
  /* ======================= setup ======================= */
  init() {
    this.t = 0; this.tickN = 0; this.nextId = 1; this.over = null;
    this.terrain = new Uint8Array(W * H); this.block = new Uint8Array(W * H); this.occ = new Uint8Array(W * H);
    this.gate = new Uint8Array(W * H); this.wt = -1;   // gate tiles hold team + 1; wt is the team whose move is being worked out
    this.visible = new Uint8Array(W * H); this.explored = new Uint8Array(W * H);
    this.units = []; this.buildings = []; this.nodes = []; this.byId = new Map();
    this.fx = []; this.arrows = []; this.floaters = []; this.msgs = []; this.alerts = [];
    this.navTier = [0, 0]; this.burning = new Set();
    this.age = [1, 1]; this.aging = [null, null];
    this.res = [{ food: 200, wood: 200, gold: 100 }, { food: 200, wood: 200, gold: 100 }];
    this.stats = { deposited: 0, kills: 0, lost: 0, built: 0, trained: 0, wood: 0 };
    this.pStamp = 0; this.pSeen = new Int32Array(W * H); this.pClosed = new Int32Array(W * H);
    this.pG = new Float32Array(W * H); this.pPar = new Int32Array(W * H);
    this.cell = 2; this.cw = Math.ceil(W / 2); this.ch = Math.ceil(H / 2);
    this.hash = []; for (let i = 0; i < this.cw * this.ch; i++) this.hash.push([]);
    this.rng = mulberry32(this.seed);
    this.claims = new Map();
    this.villages = []; this.siteMask = new Uint8Array(W * H); this.tradeGold = 0;
    this.tradeAcc = 0; this.aiAcc = 0; this.fogAcc = 0; this.endAcc = 0; this.lastAlert = -99;
    this.ai = { wave: 0, next: DIFF[this.diff].wave0, lastBuild: 0, defendT: 0 };
    this.starts = MAPDEF[this.map].starts.map(st => ({ x: st.x, y: st.y }));
    this.genMap();
    this.computeRegions();
    // keep roads between the bases and down to the shore free of trees
    this.reserve = new Uint8Array(W * H);
    const S = this.starts;
    const ms = (x, y) => ({ x: Math.round(x * MSX), y: Math.round(y * MSY) }), road = [ms(21, 27), ms(44, 33)];
    this.portHint = this.map === 'strait' ? [ms(21, 27), ms(44, 31)] : S.map(st => this.coastNear(st.x + 1.5, st.y + 1.5));
    this.reserveRoute(S[0].x + 1, S[0].y + 1, S[1].x + 1, S[1].y + 1);
    if (this.map === 'strait') { this.reserveRoute(S[0].x + 1, S[0].y + 2, road[0].x, road[0].y); this.reserveRoute(S[1].x + 1, S[1].y + 2, road[1].x, road[1].y); }
    else S.forEach((st, i) => { const h = this.portHint[i]; if (h) this.reserveRoute(st.x + 1, st.y + 2, h.x, h.y); });
    this.populate();
    this.openWoods();
    this.updateFog();
  }
  /* thin the woods so nothing gets trapped: no one-tile squeezes between trees, and no little clearings
     walled in by trees (a kerbau or deer could spawn in one and never get out). Only trees are removed. */
  openWoods() {
    const tree = new Map();
    for (const n of this.nodes) if (n.kind === 'tree' && n.hp > 0) tree.set(n.ty * W + n.tx, n);
    const cut = (i) => { const n = tree.get(i); if (n) { this.removeNode(n); tree.delete(i); return true; } return false; };
    const open = (x, y) => this.inb(x, y) && this.walkable(x, y, 0);
    const isT = (x, y) => this.inb(x, y) && tree.has(y * W + x);
    // 1. squeezes: an open tile with trees (or a tree and a wall of rock/water) on both sides gets one of them cut
    for (let pass = 0; pass < 2; pass++) for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!open(x, y)) continue;
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        if (open(x - dx, y - dy) || open(x + dx, y + dy)) continue;
        const a = isT(x - dx, y - dy), b = isT(x + dx, y + dy);
        if (!a && !b) continue;
        const pick = a && b ? (hash2(x, y, this.seed + 7) < 0.5 ? -1 : 1) : a ? -1 : 1;
        cut((y + dy * pick) * W + x + dx * pick);
      }
    }
    // 2. walled-in clearings: cut the fewest trees that join each small open patch to the open country around it
    const comp = new Int32Array(W * H).fill(-1), size = [];
    for (let i = 0; i < W * H; i++) {
      if (comp[i] >= 0 || !open(i % W, (i / W) | 0)) continue;
      const id = size.length, q = [i]; comp[i] = id;
      for (let k = 0; k < q.length; k++) { const c = q[k], cx = c % W, cy = (c / W) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = cx + dx, Y = cy + dy, j = Y * W + X; if (!open(X, Y) || comp[j] >= 0) continue; comp[j] = id; q.push(j); } }
      size.push(q.length);
    }
    const BIG = 40, done = new Uint8Array(size.length);
    for (let i = 0; i < W * H; i++) {
      const id = comp[i]; if (id < 0 || size[id] >= BIG || done[id]) continue;
      done[id] = 1;
      // 0-1 search: open tiles cost nothing, tree tiles cost one cut; stop at the first tile of a big open patch
      const dist = new Int32Array(W * H).fill(1e9), from = new Int32Array(W * H).fill(-1), dq = [];
      for (let j = 0; j < W * H; j++) if (comp[j] === id) { dist[j] = 0; dq.push(j); }
      let goal = -1;
      for (let h = 0; h < dq.length && goal < 0; h++) {
        const c = dq[h], cx = c % W, cy = (c / W) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const X = cx + dx, Y = cy + dy, j = Y * W + X; if (!this.inb(X, Y)) continue;
          const o = open(X, Y), t = tree.has(j); if (!o && !t) continue;
          const nd = dist[c] + (t ? 1 : 0); if (nd >= dist[j] || nd > 6) continue;
          dist[j] = nd; from[j] = c;
          if (o && comp[j] >= 0 && size[comp[j]] >= BIG) { goal = j; break; }
          dq.push(j);
        }
        // keep the queue roughly in cost order (cheap paths first)
        if (h % 64 === 63) { const rest = dq.splice(h + 1).sort((p, q) => dist[p] - dist[q]); dq.push(...rest); }
      }
      for (let j = goal; j >= 0 && dist[j] > 0; j = from[j]) cut(j);
    }
    this.nodes = this.nodes.filter(n => n.hp > 0);
  }
  // keep a road clear of trees
  reserveRoute(ax, ay, bx, by) {
    const dummy = { x: ax + 0.5, y: ay + 0.5, layer: 0 };
    const g = this.nearestFree(bx, by, 0, 8);
    const res = this.findPath(ax, ay, 0, (x, y) => x === g.x && y === g.y,
      (x, y) => { const dx = Math.abs(x - g.x), dy = Math.abs(y - g.y); return Math.max(dx, dy) + 0.4142 * Math.min(dx, dy); });
    if (!res) return;
    let px = dummy.x, py = dummy.y;
    const mark = (cx, cy) => {
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (dx * dx + dy * dy > 5) continue;
        const x = Math.floor(cx) + dx, y = Math.floor(cy) + dy;
        if (this.inb(x, y)) this.reserve[y * W + x] = 1;
      }
    };
    for (const p of res.path) {
      const n = Math.max(1, Math.ceil(Math.hypot(p[0] - px, p[1] - py) / 0.5));
      for (let i = 1; i <= n; i++) mark(px + (p[0] - px) * i / n, py + (p[1] - py) * i / n);
      px = p[0]; py = p[1];
    }
  }

  // is this tile inside the map?
  inb(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
  /* land masses: every land tile gets the number of the island (or river bank) it sits on */
  computeRegions() {
    const rg = this.region = new Int16Array(W * H); let n = 0;
    for (let i = 0; i < W * H; i++) {
      const LANDMAX = (typeof wadeOn === 'function' && wadeOn()) ? T.SHALLOW : T.SAND;
      if (rg[i] || this.terrain[i] > LANDMAX && this.terrain[i] !== T.CLIFF) continue;
      if (this.terrain[i] === T.CLIFF) continue;
      rg[i] = ++n; const q = [i];
      for (let k = 0; k < q.length; k++) {
        const c = q[k], cx = c % W, cy = (c / W) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const x = cx + dx, y = cy + dy, j = y * W + x;
          if (!this.inb(x, y) || rg[j] || (this.terrain[j] > LANDMAX && this.terrain[j] !== T.CLIFF) || this.terrain[j] === T.CLIFF) continue;
          rg[j] = n; q.push(j);
        }
      }
    }
  }
  // which island or river bank a point is on
  regionAt(x, y) { const tx = Math.floor(x), ty = Math.floor(y); return this.region && this.inb(tx, ty) ? this.region[ty * W + tx] : 0; }
  /* a dry tile on the shore near (x, y), at least 5 tiles out: where a base's port road goes */
  coastNear(x, y) {
    let best = null, bd = 1e9;
    for (let ty = 1; ty < H - 1; ty++) for (let tx = 1; tx < W - 1; tx++) {
      if (!this.isLand(tx, ty) || this.terrain[ty * W + tx] === T.CLIFF) continue;
      const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y); if (d < 5 || d >= bd) continue;
      let wet = false;
      for (let dy = -1; dy <= 1 && !wet; dy++) for (let dx = -1; dx <= 1; dx++) if (this.isWater(tx + dx, ty + dy)) { wet = true; break; }
      if (wet) { bd = d; best = { x: tx, y: ty }; }
    }
    return best;
  }
  /* ======================= save / resume ======================= */
  /* Everything that can't be rebuilt goes into a plain JSON object. Lookup tables (byId, the spatial
     hash, path scratch, claims) and short-lived effects are rebuilt or dropped on load. */
  snapshot() {
    const skip = SNAP_SKIP, o = { v: SAVE_VERSION, rngA: this.rng.get() };
    for (const k of Object.keys(this)) if (!skip.has(k)) o[k] = this[k];
    return JSON.parse(JSON.stringify(o, snapEnc));
  }
  static restore(o) {
    if (!o || o.v !== SAVE_VERSION) return null;
    const g = new Game({ seed: o.seed, diff: o.diff, map: o.map, civs: o.civs });
    o = JSON.parse(JSON.stringify(o), snapDec);
    for (const k of Object.keys(o)) if (k !== 'v' && k !== 'rngA') g[k] = o[k];
    if (!g.terrain || g.terrain.length !== W * H) return null;   // a game saved on another map size
    g.rng.set(o.rngA);
    if (!o.age) { g.age = [AGE_MAX, AGE_MAX]; g.aging = [null, null]; g.navTier = [2, 2]; }   // saves from before ages
    if (!g.gate) { g.gate = new Uint8Array(W * H); g.wt = -1; }
    for (const b of g.buildings) if (b.kind === 'mill' || b.kind === 'goldmine') b.kind = 'store';   // old saves
    g.byId = new Map(); for (const e of g.units.concat(g.buildings, g.nodes)) g.byId.set(e.id, e);
    g.burning = new Set(); for (const e of g.units.concat(g.buildings)) if (e.burn) g.burning.add(e);
    for (const b of g.buildings) if (b.cargo && b.cargo.length) { g.ungarrison(b); }
    for (const c of g.units.slice()) if (c.cargo && c.cargo.length && !UD[c.kind].troops) {
      for (const u of c.cargo) { const p = g.openSpot(c.x, c.y, 0); u.x = p.x; u.y = p.y; u.aboard = null; u.order = { t: 'idle', hx: u.x, hy: u.y }; g.units.push(u); g.byId.set(u.id, u); }
      c.cargo = [];
    }
    g.rebuildHash(); g.updateFog();
    return g;
  }

  // make the land, water and cliffs for a skirmish map
  genMap() {
    const s = this.seed, terr = this.terrain, rng = this.rng, M = MAPDEF[this.map], STARTS = this.starts;
    const bx = 21 * MSX, by = 33 * MSY;
    if (this.map === 'river') this.genRiverlands(M);
    else if (this.map === 'islands') this.genIslands(M);
    else for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const lx = x / MSX;
      let coast = (35.5 + Math.sin(lx * 0.22 + 1) * 2.2 + (fbm(lx * 0.09, 5, s) - 0.5) * 6) * MSY;
      const ddx = (x - bx) / (5.5 * MSX);
      if (Math.abs(ddx) < 1) coast = Math.min(coast, by - 4.2 * MSY * Math.sqrt(1 - ddx * ddx));
      const dy = y - coast;
      let t;
      if (dy >= 3) t = T.DEEP; else if (dy >= 0) t = T.SHALLOW; else if (dy > -1.6) t = T.SAND;
      else t = fbm(x * 0.12, y * 0.12, s + 3) > 0.7 ? T.DIRT : T.GRASS;
      terr[y * W + x] = t;
    }
    // sand on any land tile touching water
    const snap = terr.slice();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (snap[y * W + x] > T.SAND) continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!this.inb(x + dx, y + dy)) continue;
        const o = snap[(y + dy) * W + x + dx];
        if (o === T.SHALLOW || o === T.DEEP) terr[y * W + x] = T.SAND;
      }
    }
    // cliff ridges (with deliberate gaps between them)
    const ridges = this.map === 'strait' ? [[31, 16, 2.3, 5.2], [33, 30.5, 2.2, 3.2], [29, 5.5, 2.6, 3.4], [45, 27, 2.4, 3.2], [18, 9, 2.6, 2.4], [54, 22, 2.2, 2.6], [24, 41, 1, 1]].map(c => [c[0] * MSX, c[1] * MSY, c[2] * MSX, c[3] * MSY]) : (M.cliffs || []);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (terr[y * W + x] > T.SAND) continue;
      for (const r of ridges) {
        const d = Math.hypot((x + 0.5 - r[0]) / r[2], (y + 0.5 - r[1]) / r[3]) + (hash2(x, y, s + 9) - 0.5) * 0.45;
        if (d < 1) { terr[y * W + x] = T.CLIFF; break; }
      }
    }
    // mountain border on N / W / E
    if (this.map === 'strait') for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const e = Math.min(x, W - 1 - x, y) + (hash2(x, y, s + 21) - 0.5) * 1.6;
      if (e < 1.4 && terr[y * W + x] <= T.SAND) terr[y * W + x] = T.CLIFF;
    }
    // clear the start areas
    for (const st of STARTS) {
      for (let y = st.y - 7; y <= st.y + 10; y++) for (let x = st.x - 7; x <= st.x + 10; x++) {
        if (!this.inb(x, y)) continue;
        if (Math.hypot(x - st.x - 1, y - st.y - 1) < 8 && terr[y * W + x] !== T.SHALLOW && terr[y * W + x] !== T.DEEP) {
          terr[y * W + x] = (hash2(x, y, s + 5) > 0.93) ? T.DIRT : T.GRASS;
        }
      }
    }
    // guarantee a land route between the bases (islands are meant to be cut off)
    if (this.map !== 'islands' && !this.landConnected(STARTS[0].x + 1, STARTS[0].y + 3, STARTS[1].x + 1, STARTS[1].y + 3)) {
      let x = STARTS[0].x + 1, y = STARTS[0].y + 1;
      const gx = STARTS[1].x + 1, gy = STARTS[1].y + 1;
      while (Math.abs(x - gx) + Math.abs(y - gy) > 1) {
        if (x !== gx && (Math.abs(x - gx) > Math.abs(y - gy) || y === gy)) x += Math.sign(gx - x); else y += Math.sign(gy - y);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!this.inb(x + dx, y + dy)) continue;
          const o = terr[(y + dy) * W + x + dx];
          if (o === T.CLIFF) terr[(y + dy) * W + x + dx] = T.GRASS; else if (o === T.SHALLOW || o === T.DEEP) terr[(y + dy) * W + x + dx] = T.SAND;
        }
      }
    }
  }

  /* Riverlands: four rivers that meet in the middle; sandy fords are the only dry crossings */
  genRiverlands(M) {
    const s = this.seed, terr = this.terrain;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) terr[y * W + x] = fbm(x * 0.12, y * 0.12, s + 3) > 0.7 ? T.DIRT : T.GRASS;
    const jit = (p) => (p[0] < 0 || p[0] >= W || p[1] < 0 || p[1] >= H) ? p : [p[0] + (hash2(p[0], p[1], s + 11) - 0.5) * 4, p[1] + (hash2(p[1], p[0], s + 12) - 0.5) * 4];
    const rivers = M.rivers.map(([pts, w]) => [pts.map(jit), w]);
    for (const [pts, w] of rivers) for (let i = 0; i + 1 < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2);
      for (let k = 0; k <= n; k++) {
        const px = ax + (bx - ax) * k / n, py = ay + (by - ay) * k / n;
        for (let y = Math.floor(py - w - 1); y <= py + w + 1; y++) for (let x = Math.floor(px - w - 1); x <= px + w + 1; x++) {
          if (!this.inb(x, y)) continue;
          const d = Math.hypot(x + 0.5 - px, y + 0.5 - py);
          if (d <= w - 1.1) terr[y * W + x] = T.DEEP; else if (d <= w && terr[y * W + x] !== T.DEEP) terr[y * W + x] = T.SHALLOW;
        }
      }
    }
    for (const [ri, si] of M.fords) {
      const [pts, w] = rivers[ri], a = pts[si], b = pts[si + 1], fx = (a[0] + b[0]) / 2, fy = (a[1] + b[1]) / 2;
      for (let y = Math.floor(fy - w - 2); y <= fy + w + 2; y++) for (let x = Math.floor(fx - w - 2); x <= fx + w + 2; x++) {
        if (this.inb(x, y) && Math.hypot(x + 0.5 - fx, y + 0.5 - fy) <= w + 0.9 && terr[y * W + x] >= T.SHALLOW && terr[y * W + x] <= T.DEEP) terr[y * W + x] = T.SAND;
      }
    }
  }
  /* Big Islands: four large islands, one for each side and two to fight over, with deep channels between */
  genIslands(M) {
    const s = this.seed, terr = this.terrain;
    const isles = M.isles.map((c, i) => [c[0] + (hash2(i, 1, s + 13) - 0.5) * 3, c[1] + (hash2(i, 2, s + 13) - 0.5) * 2, c[2], c[3]]);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let m = 9;
      for (const [cx, cy, rx, ry] of isles) m = Math.min(m, Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry));
      const dep = (m - 1 + (fbm(x * 0.2, y * 0.2, s + 7) - 0.5) * 0.45) * 6;
      terr[y * W + x] = dep > 2.5 ? T.DEEP : dep > 0 ? T.SHALLOW : fbm(x * 0.12, y * 0.12, s + 3) > 0.7 ? T.DIRT : T.GRASS;
    }
  }
  // can you walk from A to B?
  landConnected(ax, ay, bx, by) {
    const seen = new Uint8Array(W * H), q = [ay * W + ax]; seen[q[0]] = 1;
    for (let i = 0; i < q.length; i++) {
      const c = q[i], cx = c % W, cy = (c / W) | 0;
      if (cx === bx && cy === by) return true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (!this.inb(nx, ny) || seen[ny * W + nx] || this.terrain[ny * W + nx] > T.SAND) continue;
        seen[ny * W + nx] = 1; q.push(ny * W + nx);
      }
    }
    return false;
  }

  // is the tile land?
  isLand(x, y) { return this.inb(x, y) && this.terrain[y * W + x] <= T.SAND; }
  // is the tile water?
  isWater(x, y) { if (!this.inb(x, y)) return false; const t = this.terrain[y * W + x]; return t === T.SHALLOW || t === T.DEEP; }
  // is the tile empty land?
  freeTile(x, y) { return this.isLand(x, y) && !this.block[y * W + x] && !this.occ[y * W + x]; }

  // put a tree, bush, gold or fish on the map
  addNode(kind, x, y, amt) {
    const d = NK[kind];
    const n = { id: this.nextId++, isNode: true, kind, type: d.type, x: x + 0.5, y: y + 0.5, tx: x, ty: y, amt: amt || d.amt, max: amt || d.amt, hp: 1, v: Math.floor(hash2(x, y, 77) * 4) };
    n.rect = rectOfTiles(x, y, 1, 1);
    if (kind !== 'carcass') { this.block[y * W + x] = 1; this.occ[y * W + x] = 1; }
    this.nodes.push(n); this.byId.set(n.id, n);
    return n;
  }
  // remove a used-up resource
  removeNode(n) {
    n.hp = 0;
    if (n.kind !== 'carcass') { this.block[n.ty * W + n.tx] = 0; this.occ[n.ty * W + n.tx] = 0; }
    this.byId.delete(n.id);
  }

  // place bases, villagers, resources and villages at the start
  populate() {
    const rng = this.rng, self = this;
    const place = (kind, cx, cy, spread, count, test, ignoreRoad) => {
      let placed = 0;
      for (let i = 0; i < count * 14 && placed < count; i++) {
        const a = rng() * 6.283, r = Math.sqrt(rng()) * spread;
        const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
        if (!this.freeTile(x, y) || (!ignoreRoad && this.reserve[y * W + x]) || (test && !test(x, y))) continue;
        this.addNode(kind, x, y); placed++;
      }
      return placed;
    };
    const STARTS = this.starts, M = MAPDEF[this.map], strait = this.map === 'strait';
    const notNearStart = (x, y) => STARTS.every(st => Math.hypot(x - st.x - 1, y - st.y - 1) > 7.5);
    const notBeach = (x, y) => this.terrain[y * W + x] !== T.SAND;
    // neutral Orang Laut villages on the coast, each with an empty landing where a Trading Post can go
    if (strait) for (const gx of [6, 33, 57]) this.addVillage(Math.round(gx * MSX));
    else for (const [gx, gy] of M.villages) this.addVillage(gx, gy);
    // Starting buildings and people
    const mk = (team) => {
      const st = STARTS[team];
      const tc = this.addBuilding('towncentre', team, st.x, st.y, true);
      const cx = st.x + 1.5, cy = st.y + 1.5;
      const ang0 = team === 0 ? -0.3 : 3.0;
      // berries, gold, woodlines near the base
      const spots = [[ang0 + 0.9, 6.6], [ang0 - 1.0, 9], [ang0 + 2.6, 8.5], [ang0 + 3.9, 8], [ang0 + 5.1, 11]];
      place('berry', cx + Math.cos(spots[0][0]) * spots[0][1], cy + Math.sin(spots[0][0]) * spots[0][1], 1.8, 5, null, true);
      place('gold', cx + Math.cos(spots[1][0]) * spots[1][1], cy + Math.sin(spots[1][0]) * spots[1][1], 1.9, 6, null, true);
      place('tree', cx + Math.cos(spots[2][0]) * spots[2][1], cy + Math.sin(spots[2][0]) * spots[2][1], 3.4, 24);
      place('tree', cx + Math.cos(spots[3][0]) * spots[3][1], cy + Math.sin(spots[3][0]) * spots[3][1], 3.0, 18);
      place('tree', cx + Math.cos(spots[4][0]) * spots[4][1], cy + Math.sin(spots[4][0]) * spots[4][1], 3.2, 16);
      // starting people each get their own tile, so nobody spawns on top of anyone else
      const sp = this.findSpawn(tc, null, 0);
      for (let i = 0; i < 5; i++) {
        const p = this.openSpot(sp.x + (i % 3) * 1.1, sp.y + ((i / 3) | 0) * 1.1, 0);
        this.addUnit('villager', team, p.x, p.y);
      }
      const p = this.openSpot(sp.x + 3.4, sp.y + 0.5, 0);
      this.addUnit('tombak', team, p.x, p.y);
    };
    mk(0); mk(1);
    // forests across the map
    const AREA = MSX * MSY;
    for (let k = 0; k < Math.round(26 * AREA); k++) {
      const cx = 4 + rng() * (W - 8), cy = 4 + rng() * (strait ? 30 * MSY : H - 8);
      if (!notNearStart(Math.round(cx), Math.round(cy))) continue;
      place('tree', cx, cy, 2.2 + rng() * 3.4, 10 + Math.floor(rng() * 16), notNearStart);
    }
    // scattered palms along beaches and everywhere else
    for (let i = 0; i < Math.round(90 * AREA); i++) {
      const x = 2 + Math.floor(rng() * (W - 4)), y = 2 + Math.floor(rng() * (strait ? 38 * MSY : H - 4));
      if (!this.freeTile(x, y) || !notNearStart(x, y) || this.reserve[y * W + x]) continue;
      if (hash2(x, y, 31) < 0.45) this.addNode('tree', x, y);
    }
    // gold in the middle, wild deer
    if (strait) {
      for (const [gx, gy, r, n] of [[32, 24, 1.8, 5], [40, 33, 1.6, 4], [22, 8, 1.6, 4], [52, 30, 1.6, 4], [10, 9, 1.6, 4], [44, 14, 1.6, 4]]) place('gold', gx * MSX, gy * MSY, r, n, notNearStart);
    } else for (const [gx, gy] of M.gold) { const c = this.nearestFree(gx, gy, 0, 6); if (c) place('gold', c.x, c.y, 1.6, 4, notNearStart); }
    for (const g of strait ? [[24, 14], [36, 36], [44, 20], [16, 30], [34, 8], [52, 28], [6, 14]].map(p => [Math.round(p[0] * MSX), Math.round(p[1] * MSY)]) : M.deer) {
      const c = this.nearestFree(g[0], g[1], 0, 6); if (!c) continue;
      for (let i = 0; i < 3; i++) {
        const p = this.nearestFree(c.x + i, c.y + (i % 2), 0, 4); if (!p) continue;
        const d = this.addUnit('deer', 2, p.x + 0.5, p.y + 0.5); d.order = { t: 'wander', next: 2 + rng() * 5 };
      }
    }
    // fish in the sea
    let placed = 0;
    if (!strait) {
      // rivers and channels: fish anywhere near a shore, plus a school by each side's port road
      const nearShore = (x, y) => { for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (this.isLand(x + dx, y + dy)) return true; return false; };
      for (let i = 0; i < 1500 * AREA && placed < 18 * AREA; i++) {
        const x = 2 + Math.floor(rng() * (W - 4)), y = 2 + Math.floor(rng() * (H - 4));
        if (!this.isWater(x, y) || this.block[y * W + x] || !nearShore(x, y) || !notNearStart(x, y)) continue;
        if (this.nodes.some(n => n.kind === 'fish' && Math.abs(n.tx - x) + Math.abs(n.ty - y) < 3)) continue;
        this.addNode('fish', x, y); placed++;
      }
      for (const h of this.portHint) if (h) for (let k = 0, got = 0; k < 40 && got < 3; k++) {
        const x = h.x + Math.round((rng() - 0.5) * 8), y = h.y + Math.round((rng() - 0.5) * 8);
        if (this.isWater(x, y) && !this.block[y * W + x]) { this.addNode('fish', x, y); got++; }
      }
      return;
    }
    for (let i = 0; i < 700 * AREA && placed < 16 * AREA; i++) {
      const x = 3 + Math.floor(rng() * (W - 6)), y = Math.round(30 * MSY) + Math.floor(rng() * (H - 2 - 30 * MSY));
      if (!this.isWater(x, y) || this.block[y * W + x]) continue;
      if (placed < 8 && Math.abs(x - 21 * MSX) > 14 * MSX) continue;
      this.addNode('fish', x, y); placed++;
    }
    // one bay-side school close to the player's port site
    for (const p of [[19, 31], [23, 31], [21, 32]].map(q => [Math.round(q[0] * MSX), Math.round(q[1] * MSY)])) if (this.isWater(p[0], p[1]) && !this.block[p[1] * W + p[0]]) this.addNode('fish', p[0], p[1]);
  }

  // place a neutral Orang Laut village with its landing
  addVillage(gx, gy) {
    const land3 = (tx, ty) => { for (let y = ty; y < ty + 3; y++) for (let x = tx; x < tx + 3; x++) if (!this.freeTile(x, y) || this.siteMask[y * W + x]) return false; return true; };
    const shore = (tx, ty) => {
      let water = 0;
      for (let y = ty - 1; y <= ty + 3; y++) for (let x = tx - 1; x <= tx + 3; x++) if ((x < tx || x > tx + 2 || y < ty || y > ty + 2) && this.isWater(x, y)) water++;
      return water >= 4;
    };
    let best = null, bd = 1e9;
    const y0 = gy == null ? Math.round(22 * MSY) : Math.max(2, gy - 10), y1 = gy == null ? H - 4 : Math.min(H - 4, gy + 10), gr = Math.round(8 * MSX);
    for (let ty = y0; ty < y1; ty++) for (let tx = Math.max(2, gx - gr); tx <= Math.min(W - 5, gx + gr); tx++) {
      if (!land3(tx, ty) || !shore(tx, ty)) continue;
      if (this.starts.some(st => Math.hypot(tx + 1.5 - st.x - 1.5, ty + 1.5 - st.y - 1.5) < 9)) continue;
      for (const vx of [tx - 3, tx + 3]) {
        // the village stands on dry land beside the landing (it may lean a row inland)
        for (const vy of [ty, ty - 1, ty - 2]) {
          if (!land3(vx, vy)) continue;
          const d = Math.abs(tx - gx) + (gy == null ? 0 : Math.abs(ty - gy)) + (vy !== ty ? 0.5 : 0);
          if (d < bd) { bd = d; best = { tx, ty, vx, vy }; }
          break;
        }
      }
    }
    if (!best) return null;
    const v = this.addBuilding('village', 2, best.vx, best.vy, true);
    v.site = { tx: best.tx, ty: best.ty }; v.post = 0;
    for (let y = best.ty - 1; y <= best.ty + 3; y++) for (let x = best.tx - 1; x <= best.tx + 3; x++) if (this.inb(x, y)) { this.reserve[y * W + x] = 1; if (x >= best.tx && x < best.tx + 3 && y >= best.ty && y < best.ty + 3) this.siteMask[y * W + x] = 1; }
    for (let y = best.vy - 1; y <= best.vy + 3; y++) for (let x = best.vx - 1; x <= best.vx + 3; x++) if (this.inb(x, y)) this.reserve[y * W + x] = 1;
    this.villages.push(v);
    return v;
  }
  /* the free village landing whose corner is at (tx, ty), if any */
  siteAt(tx, ty) { return this.villages.find(v => v.hp > 0 && !v.post && v.site.tx === tx && v.site.ty === ty) || null; }

