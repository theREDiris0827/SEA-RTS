class Game {
  constructor(opts) {
    opts = opts || {};
    this.seed = opts.seed == null ? 20241020 : opts.seed;
    this.diff = opts.diff || 'normal';
    this.map = MAPDEF[opts.map] ? opts.map : 'strait';
    this.civs = opts.civs ? opts.civs.slice() : opts.civ === 1 ? [1, 0] : [0, 1]; CIVMAP = this.civs.slice();
    this.init();
    // Start in: both sides begin in a later age, with a little more in store for each age skipped
    const sa = Math.min(AGE_MAX, opts.startAge || 1);
    if (sa > 1) for (let t = 0; t < 2; t++) { for (let n = 2; n <= sa; n++) this.applyAge(t, n, true); for (const k in AGE_START_BONUS) this.res[t][k] += AGE_START_BONUS[k] * (sa - 1); }
  }

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
    this.updateFog();
  }
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

  inb(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
  /* land masses: every land tile gets the number of the island (or river bank) it sits on */
  computeRegions() {
    const rg = this.region = new Int16Array(W * H); let n = 0;
    for (let i = 0; i < W * H; i++) {
      if (rg[i] || this.terrain[i] > T.SAND && this.terrain[i] !== T.CLIFF) continue;
      if (this.terrain[i] === T.CLIFF) continue;
      rg[i] = ++n; const q = [i];
      for (let k = 0; k < q.length; k++) {
        const c = q[k], cx = c % W, cy = (c / W) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const x = cx + dx, y = cy + dy, j = y * W + x;
          if (!this.inb(x, y) || rg[j] || this.terrain[j] > T.SAND) continue;
          rg[j] = n; q.push(j);
        }
      }
    }
  }
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

  isLand(x, y) { return this.inb(x, y) && this.terrain[y * W + x] <= T.SAND; }
  isWater(x, y) { if (!this.inb(x, y)) return false; const t = this.terrain[y * W + x]; return t === T.SHALLOW || t === T.DEEP; }
  freeTile(x, y) { return this.isLand(x, y) && !this.block[y * W + x] && !this.occ[y * W + x]; }

  addNode(kind, x, y, amt) {
    const d = NK[kind];
    const n = { id: this.nextId++, isNode: true, kind, type: d.type, x: x + 0.5, y: y + 0.5, tx: x, ty: y, amt: amt || d.amt, max: amt || d.amt, hp: 1, v: Math.floor(hash2(x, y, 77) * 4) };
    n.rect = rectOfTiles(x, y, 1, 1);
    if (kind !== 'carcass') { this.block[y * W + x] = 1; this.occ[y * W + x] = 1; }
    this.nodes.push(n); this.byId.set(n.id, n);
    return n;
  }
  removeNode(n) {
    n.hp = 0;
    if (n.kind !== 'carcass') { this.block[n.ty * W + n.tx] = 0; this.occ[n.ty * W + n.tx] = 0; }
    this.byId.delete(n.id);
  }

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

  /* ======================= entities ======================= */
  addUnit(kind, team, x, y) {
    const d = UD[kind], m0 = TEAMMOD[CV(team)] || TEAMMOD[0], nv = d.layer && CV(team) === 1 ? NAVMOD : null;
    const m = nv ? { hp: m0.hp * nv.hp, spd: m0.spd * nv.spd, arm: m0.arm } : m0;
    const arm = d.cls === 'vil' || d.cls === 'animal' || d.cls === 'boat' || d.cls === 'ship' ? 0 : m.arm;
    const hp0 = d.civHp ? d.civHp[CI(team)] || d.civHp[0] : d.hp;
    const u = {
      id: this.nextId++, isUnit: true, kind, team, x, y, layer: d.layer || 0, cls: d.cls,
      hp: Math.round(hp0 * m.hp), maxHp: Math.round(hp0 * m.hp), spd: d.spd * m.spd * (team === 2 ? 1 : 1),
      atk: d.civAtk ? d.civAtk[CI(team)] : d.atk, rate: d.rate, rng: d.rng, ma: Math.max(0, d.ma - arm), pa: Math.max(0, d.pa - arm),
      bonus: d.bonus, ranged: !!d.ranged, sight: d.sight, carryMax: (d.carry || 0) * (d.cls === 'vil' && CV(team) === AYU_CIV ? 1.25 : 1),
      order: { t: 'idle', hx: x, hy: y }, path: null, pi: 0, cd: 0, carry: { type: null, amt: 0 },
      face: 1, anim: Math.random() * 3, atkT: 0, scan: Math.random() * 0.5, rp: 0, wait: 0, hit: 0, moving: false, gt: 0,
      hx: 1, hy: 0, side: 1, stk: 0, stuckN: 0, sx: x, sy: y
    };
    this.units.push(u); this.byId.set(u.id, u);
    if (this.age) this.armForAge(u, this.teamAge(team));
    return u;
  }
  unitName(u) { return civName(u.kind, u.team); }
  costOf(kind, team) {
    const base = UD[kind] ? UD[kind].cost : BD[kind].cost, o = {};
    const m = UD[kind] && CV(team) === 1 ? TEAMMOD[1].cost * (UD[kind].layer ? NAVMOD.cost : 1) : 1;
    for (const k in base) o[k] = m !== 1 ? Math.ceil(base[k] * m) : base[k];
    return o;
  }
  /* what a building can train for this team (unique units and ships belong to one civ) */
  trainable(kind, team) { const t = BD[kind].train, age = this.teamAge(team); return t ? t.filter(k => civOk(UD[k], team) && ageFits(UD[k], age)) : null; }
  // what this building will train in a later age (shown greyed out with the age it needs)
  lockedTrain(kind, team) {
    const t = BD[kind].train, age = this.teamAge(team), top = this.maxAge || AGE_MAX;
    return t ? t.filter(k => civOk(UD[k], team) && (UD[k].age || 1) > age && UD[k].age <= top && !(UD[k].maxAge && UD[k].maxAge < (UD[k].age || 1))) : [];
  }
  countOf(team, kind) {
    let n = 0;
    for (const u of this.units) if (u.team === team && u.hp > 0 && u.kind === kind) n++;
    for (const b of this.buildings) if (b.team === team && b.hp > 0) { if (b.kind === kind) n++; for (const q of b.queue) if (q.kind === kind) n++; }
    return n;
  }
  canAfford(team, cost) { const r = this.res[team]; for (const k in cost) if (r[k] < cost[k]) return false; return true; }
  pay(team, cost) { const r = this.res[team]; for (const k in cost) r[k] -= cost[k]; }
  refund(team, cost) { const r = this.res[team]; for (const k in cost) r[k] += cost[k]; }

  /* ======================= ages ======================= */
  teamAge(team) { return this.age ? this.age[team] || 1 : AGE_MAX; }
  ageText(team, n) {
    const N = AGE_TABLE[n] && AGE_TABLE[n].need; if (!N) return '';
    if (N.all) return (CV(team) === AYU_CIV ? N.ayu : N.all).map(k => civName(k, team)).join(' and ');
    return N.n + ' of: ' + N.any.filter(k => civOk(BD[k], team)).map(k => civName(k, team)).join(', ');
  }
  ageNeedMet(team, n) {
    const A = AGE_TABLE[n]; if (!A || !A.need) return true;
    const have = (k) => this.buildings.some(b => b.team === team && b.kind === k && b.done && b.hp > 0);
    if (A.need.all) return (CV(team) === AYU_CIV ? A.need.ayu : A.need.all).every(have);
    return A.need.any.filter(have).length >= A.need.n;
  }
  startAge(team) {
    const n = this.teamAge(team) + 1, A = AGE_TABLE[n];
    if (!A || n > (this.maxAge || AGE_MAX)) return 'You have reached the last age.';
    if (this.aging[team]) return 'Already advancing to the ' + AGE_TABLE[this.aging[team].to].name + '.';
    if (!this.ageNeedMet(team, n)) return 'The ' + A.name + ' needs ' + this.ageText(team, n) + '.';
    if (!this.canAfford(team, A.cost)) return 'The ' + A.name + ' costs ' + costWords(A.cost) + '.';
    this.pay(team, A.cost); this.aging[team] = { to: n, left: A.time, tot: A.time };
    if (team === 0) this.msg('Your court begins the work of the ' + A.name + '.');
    return null;
  }
  cancelAge(team) {
    const a = this.aging && this.aging[team == null ? 0 : team]; if (!a) return;
    this.refund(team || 0, AGE_TABLE[a.to].cost); this.aging[team || 0] = null;
    if (!team) this.msg('Advancing to the next age is called off.');
  }
  ageTick(dt) {
    for (let t = 0; t < 2; t++) {
      const a = this.aging[t]; if (!a) continue;
      a.left -= dt; if (a.left <= 0) { this.aging[t] = null; this.applyAge(t, a.to); }
    }
  }
  applyAge(team, n, quiet) {
    const A = AGE_TABLE[n]; this.age[team] = n;
    this.navTier[team] = n >= 3 ? 2 : n >= 2 ? 1 : 0;
    for (const b of this.buildings) if (b.team === team && b.kind === 'towncentre' && b.hp > 0) { const add = A.tc - b.maxHp; b.maxHp = A.tc; b.hp += Math.max(0, add); }
    // the archer line re-arms on the spot, queued ones included
    const line = ARCHER_LINE[CI(team)], want = lineKind(team, n);
    for (const u of this.units) if (u.team === team && u.hp > 0) { if (line.includes(u.kind) && u.kind !== want) this.morphUnit(u, want); this.armForAge(u, n); }
    for (const b of this.buildings) if (b.team === team) for (const q of b.queue) if (line.includes(q.kind)) q.kind = want;
    if (quiet) return;
    if (team === 0) this.msg('You enter the ' + A.name + ' (' + A.local[CI(0)] + ')!');
    else this.msg(CIV_TITLE[CV(1)] + ' enters the ' + A.name + '.');
  }
  // swap a unit for another kind in place, keeping its share of health
  morphUnit(u, k) {
    const d = UD[k], m = TEAMMOD[CV(u.team)] || TEAMMOD[0], r = u.hp / u.maxHp;
    Object.assign(u, { kind: k, cls: d.cls, maxHp: Math.round(d.hp * m.hp), atk: d.civAtk ? d.civAtk[CI(u.team)] : d.atk, rate: d.rate, rng: d.rng,
      ma: Math.max(0, d.ma - m.arm), pa: Math.max(0, d.pa - m.arm), bonus: d.bonus, ranged: !!d.ranged, sight: d.sight, ageArm: 0, ageElite: false });
    u.hp = Math.max(1, Math.round(u.maxHp * r));
  }
  // foot soldiers get mail in the Age of Commerce and more in the Golden Age; light ranged units turn elite in the Golden Age
  armForAge(u, age) {
    const c = u.cls;
    if ((c === 'sword' || c === 'spear' || c === 'elite') && !UD[u.kind].big && !UD[u.kind].hero) {
      const want = age >= 4 ? 2 : age >= 3 ? 1 : 0, have = u.ageArm || 0;
      if (want !== have) { u.pa += want - have; u.ma += (want >= 2 ? 1 : 0) - (have >= 2 ? 1 : 0); u.ageArm = want; }
    } else if (c === 'skirm' && age >= 4 && !u.ageElite) { u.ageElite = true; u.atk += 1; u.pa += 1; u.maxHp += 6; u.hp += 6; }
  }

  addBuilding(kind, team, tx, ty, done) {
    const d = BD[kind], hp = d.civHp ? d.civHp[CI(team)] || d.civHp[0] : d.hp;
    const b = {
      id: this.nextId++, isBld: true, kind, team, tx, ty, size: d.size, h: d.fh || d.size, x: tx + d.size / 2, y: ty + (d.fh || d.size) / 2,
      maxHp: hp, hp: done ? hp : Math.round(hp * 0.1), done: !!done, progress: done ? 1 : 0,
      queue: [], qt: 0, rally: null, food: d.food || 0, cd: 0, nb: 0, _bn: 0, hit: 0, stall: false
    };
    b.rect = rectOfTiles(tx, ty, d.size, b.h);
    for (let y = ty; y < ty + b.h; y++) for (let x = tx; x < tx + d.size; x++) {
      this.occ[y * W + x] = 1; if (d.gate) this.gate[y * W + x] = team + 1; else if (!d.walk) this.block[y * W + x] = 1;
    }
    this.buildings.push(b); this.byId.set(b.id, b);
    if (!d.walk && !d.gate) this.evict(b);
    return b;
  }
  evict(b) {
    for (const u of this.units) {
      const x = Math.floor(u.x), y = Math.floor(u.y);
      if (x >= b.tx && x < b.tx + b.size && y >= b.ty && y < b.ty + (b.h || b.size)) {
        this.wt = u.team; const p = this.nearestFree(u.x, u.y, u.layer, 10);
        u.x = p.x + 0.5; u.y = p.y + 0.5; u.path = null;
      }
    }
  }

  /* an own gate: open lets your own people through and stops enemies, closed stops everyone */
  setGateLock(b, locked) {
    if (!b || !BD[b.kind].gate) return;
    b.locked = !!locked;
    for (let y = b.ty; y < b.ty + b.size; y++) for (let x = b.tx; x < b.tx + b.size; x++) this.gate[y * W + x] = locked ? 255 : b.team + 1;
    if (locked) this.evict(b);
  }
  walkable(x, y, layer) {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const i = y * W + x; if (this.block[i]) return false;
    if (this.gate[i] && this.gate[i] - 1 !== this.wt) return false;
    const t = this.terrain[i];
    return layer === 1 ? (t === T.SHALLOW || t === T.DEEP) : t <= T.SAND;
  }
  nearestFree(px, py, layer, maxR) {
    const cx = Math.floor(px), cy = Math.floor(py);
    let best = null, bd = 1e9;
    for (let r = 0; r <= (maxR || 8); r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx, y = cy + dy;
        if (!this.walkable(x, y, layer)) continue;
        const d = Math.hypot(x + 0.5 - px, y + 0.5 - py);
        if (d < bd) { bd = d; best = { x, y }; }
      }
      if (best) return best;
    }
    return { x: Math.max(0, Math.min(W - 1, cx)), y: Math.max(0, Math.min(H - 1, cy)) };
  }

  unitNear(x, y, r, layer, skip) {
    for (const o of this.units) if (o !== skip && o.hp > 0 && o.layer === layer && Math.hypot(o.x - x, o.y - y) < r) return o;
    return null;
  }
  /* centre of the nearest walkable tile nobody is standing on */
  openSpot(px, py, layer) {
    const cx = Math.floor(px), cy = Math.floor(py);
    for (let r = 0; r <= 8; r++) {
      let best = null, bd = 1e9;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx, y = cy + dy;
        if (!this.walkable(x, y, layer) || this.unitNear(x + 0.5, y + 0.5, 0.75, layer)) continue;
        const d = Math.hypot(x + 0.5 - px, y + 0.5 - py); if (d < bd) { bd = d; best = { x: x + 0.5, y: y + 0.5 }; }
      }
      if (best) return best;
    }
    const p = this.nearestFree(px, py, layer, 8); return { x: p.x + 0.5, y: p.y + 0.5 };
  }

  /* spawn tile next to a building, preferring the side facing 'toward' (and tiles nobody stands on) */
  findSpawn(b, toward, layer) {
    this.wt = b.team;
    const tx = toward ? toward.x : b.x, ty = toward ? toward.y : b.y + 6;
    let best = null, bd = 1e9;
    const bh = b.h || b.size;
    for (let y = b.ty - 1; y <= b.ty + bh; y++) for (let x = b.tx - 1; x <= b.tx + b.size; x++) {
      if (x >= b.tx && x < b.tx + b.size && y >= b.ty && y < b.ty + bh) continue;
      if (!this.walkable(x, y, layer)) continue;
      const d = Math.hypot(x + 0.5 - tx, y + 0.5 - ty) + (this.unitNear(x + 0.5, y + 0.5, 0.6, layer) ? 4 : 0);
      if (d < bd) { bd = d; best = { x: x + 0.5, y: y + 0.5 }; }
    }
    if (!best) { const p = this.nearestFree(b.x, b.y, layer, 12); best = { x: p.x + 0.5, y: p.y + 0.5 }; }
    // a port's ships don't wait hidden behind its hall: they come out past it
    const top = b.ty + bh - b.size;
    if (bh < b.size && best.y < b.ty && best.x > b.tx - 0.5 && best.x < b.tx + b.size + 0.5) {
      const p = this.openSpot(best.x, top - 0.5, layer); if (p.y < top) best = p;
    }
    return best;
  }

  /* ======================= pathfinding ======================= */
  findPath(sx, sy, layer, goal, h) {
    const st = ++this.pStamp, seen = this.pSeen, closed = this.pClosed, G = this.pG, par = this.pPar;
    const hi = [], hf = [];
    const push = (i, f) => {
      let k = hi.length; hi.push(i); hf.push(f);
      while (k > 0) { const p = (k - 1) >> 1; if (hf[p] <= f) break; hi[k] = hi[p]; hf[k] = hf[p]; k = p; }
      hi[k] = i; hf[k] = f;
    };
    const pop = () => {
      const top = hi[0], li = hi.pop(), lf = hf.pop(), n = hi.length;
      if (n > 0) {
        let k = 0;
        for (;;) { let c = 2 * k + 1; if (c >= n) break; if (c + 1 < n && hf[c + 1] < hf[c]) c++; if (hf[c] >= lf) break; hi[k] = hi[c]; hf[k] = hf[c]; k = c; }
        hi[k] = li; hf[k] = lf;
      }
      return top;
    };
    const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
    const s = sy * W + sx; seen[s] = st; G[s] = 0; par[s] = -1;
    const h0 = h(sx, sy); push(s, h0);
    let best = s, bestH = h0, found = -1, exp = 0;
    while (hi.length) {
      const cur = pop(); if (closed[cur] === st) continue; closed[cur] = st;
      const cx = cur % W, cy = (cur / W) | 0;
      if (goal(cx, cy)) { found = cur; break; }
      if (++exp > 4600 * MSX * MSY) break;
      for (let d = 0; d < 8; d++) {
        const nx = cx + DX[d], ny = cy + DY[d];
        if (!this.walkable(nx, ny, layer)) continue;
        if (d >= 4 && (!this.walkable(cx + DX[d], cy, layer) || !this.walkable(cx, cy + DY[d], layer))) continue;
        const ni = ny * W + nx; if (closed[ni] === st) continue;
        const ng = G[cur] + (d >= 4 ? 1.4142 : 1);
        if (seen[ni] !== st || ng < G[ni]) {
          seen[ni] = st; G[ni] = ng; par[ni] = cur;
          const hh = h(nx, ny); push(ni, ng + hh);
          if (hh < bestH) { bestH = hh; best = ni; }
        }
      }
    }
    const end = found >= 0 ? found : best;
    if (end === s) return found >= 0 ? { path: [], reached: true } : null;
    const tiles = [];
    for (let c = end; c !== s && c !== -1; c = par[c]) tiles.push([c % W, (c / W) | 0]);
    tiles.reverse();
    return { path: this.smooth(sx, sy, tiles, layer), reached: found >= 0 };
  }
  los(x0, y0, x1, y1, layer) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 0.01) return true;
    const nx = -dy / len * 0.28, ny = dx / len * 0.28, n = Math.ceil(len / 0.3);
    for (let i = 0; i <= n; i++) {
      const px = x0 + dx * i / n, py = y0 + dy * i / n;
      if (!this.walkable(Math.floor(px), Math.floor(py), layer)) return false;
      if (!this.walkable(Math.floor(px + nx), Math.floor(py + ny), layer)) return false;
      if (!this.walkable(Math.floor(px - nx), Math.floor(py - ny), layer)) return false;
    }
    return true;
  }
  smooth(sx, sy, tiles, layer) {
    const pts = tiles.map(t => [t[0] + 0.5, t[1] + 0.5]);
    const out = []; let ax = sx + 0.5, ay = sy + 0.5, i = 0;
    while (i < pts.length) {
      let j = i;
      while (j + 1 < pts.length && this.los(ax, ay, pts[j + 1][0], pts[j + 1][1], layer)) j++;
      out.push(pts[j]); ax = pts[j][0]; ay = pts[j][1]; i = j + 1;
    }
    return out;
  }
  /* path to within `reach` of a rectangle (continuous coords) */
  pathToRect(u, rect, reach) {
    this.wt = u.team;
    const px = (x) => x + 0.5;
    const goal = (x, y) => rectDist(px(x), px(y), rect) <= reach;
    const h = (x, y) => Math.max(0, rectDist(px(x), px(y), rect) - reach);
    const res = this.findPath(Math.floor(u.x), Math.floor(u.y), u.layer, goal, h);
    // the goal tile's centre can be in reach while the unit's real spot is not: finish with a short step towards the rect
    if (res && res.reached) {
      const last = res.path[res.path.length - 1], ex = last ? last[0] : u.x, ey = last ? last[1] : u.y;
      if (rectDist(ex, ey, rect) > reach) {
        const qx = Math.max(rect.ax, Math.min(rect.bx, ex)), qy = Math.max(rect.ay, Math.min(rect.by, ey));
        const dx = ex - qx, dy = ey - qy, l = Math.hypot(dx, dy) || 1, k = reach * 0.6 / l;
        res.path.push([qx + dx * k, qy + dy * k]);
      }
    }
    return res;
  }
  pathToPoint(u, gx, gy) {
    this.wt = u.team;
    const g = this.nearestFree(gx, gy, u.layer, 8);
    const goal = (x, y) => x === g.x && y === g.y;
    const h = (x, y) => { const dx = Math.abs(x - g.x), dy = Math.abs(y - g.y); return Math.max(dx, dy) + 0.4142 * Math.min(dx, dy); };
    const res = this.findPath(Math.floor(u.x), Math.floor(u.y), u.layer, goal, h);
    // finish on the exact point (e.g. a formation slot) rather than the tile centre, when that point is open ground
    if (res && res.reached && Math.floor(gx) === g.x && Math.floor(gy) === g.y) {
      const last = res.path[res.path.length - 1];
      if (last && Math.floor(last[0]) === g.x && Math.floor(last[1]) === g.y) res.path[res.path.length - 1] = [gx, gy];
      else res.path.push([gx, gy]);
    }
    return res;
  }
  setPath(u, res) {
    if (!res) { u.path = null; return false; }
    u.path = res.path; u.pi = 0; u.pr = res.reached; return true;
  }
  stepMove(u, dt) {
    if (!u.path || u.pi >= u.path.length) { u.moving = false; return true; }
    let rem = u.spd * dt;
    while (rem > 0 && u.pi < u.path.length) {
      const p = u.path[u.pi], dx = p[0] - u.x, dy = p[1] - u.y, d = Math.hypot(dx, dy);
      if (d > 1e-4) { u.hx = dx / d; u.hy = dy / d; }
      if (d <= rem) {
        u.x = p[0]; u.y = p[1]; rem -= d; u.pi++;
        if (u.pi < u.path.length) {
          const q = u.path[u.pi];
          if (!this.walkable(Math.floor(q[0]), Math.floor(q[1]), u.layer)) { u.path = null; u.moving = false; return false; }
        }
      } else { u.x += dx / d * rem; u.y += dy / d * rem; rem = 0; if (Math.abs(dx) > 0.02) u.face = dx > 0 ? 1 : -1; }
    }
    u.moving = true;
    return u.pi >= u.path.length;
  }

  /* ======================= spatial queries ======================= */
  rebuildHash() {
    for (const c of this.hash) c.length = 0;
    for (const u of this.units) {
      if (u.hp <= 0) continue;
      const cx = Math.max(0, Math.min(this.cw - 1, Math.floor(u.x / this.cell))), cy = Math.max(0, Math.min(this.ch - 1, Math.floor(u.y / this.cell)));
      this.hash[cy * this.cw + cx].push(u);
    }
  }
  unitsNear(x, y, r, fn) {
    const c0 = Math.max(0, Math.floor((x - r) / this.cell)), c1 = Math.min(this.cw - 1, Math.floor((x + r) / this.cell));
    const r0 = Math.max(0, Math.floor((y - r) / this.cell)), r1 = Math.min(this.ch - 1, Math.floor((y + r) / this.cell));
    for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) {
      const l = this.hash[cy * this.cw + cx];
      for (let i = 0; i < l.length; i++) fn(l[i]);
    }
  }
  isVisible(x, y) { const i = Math.floor(y) * W + Math.floor(x); return this.visible[i] === 1; }
  nearestEnemy(u, r) {
    let best = null, bs = 1e9;
    const team = u.team, sea = u.layer === 1;
    if (sea) r = Math.min(r, (UD[u.kind].scan || u.rng) + 1.5);
    this.unitsNear(u.x, u.y, r, (o) => {
      if (o.hp <= 0 || o.team === team || o.team === 2) return;
      if (o.layer === 1 && !u.ranged && !sea) return;
      if ((u.kind === 'fireship' || u.kind === 'raft' || (UD[u.kind].wpn === 'board' && !UD[u.kind].sec)) && o.layer !== 1) return;
      const d = Math.hypot(o.x - u.x, o.y - u.y); if (d > r) return;
      if (team === 0 && !this.isVisible(o.x, o.y)) return;
      const s = d + (o.cls === 'vil' || o.cls === 'boat' ? 3 : 0);
      if (s < bs) { bs = s; best = o; }
    });
    if (!best || best.cls === 'vil' || best.cls === 'boat') {
      for (const b of this.buildings) {
        if (b.hp <= 0 || b.team === team || b.team === 2) continue;
        const d = rectDist(u.x, u.y, b.rect); if (d > (sea ? r : r * 0.8)) continue;
        if (team === 0 && !this.explored[Math.floor(b.y) * W + Math.floor(b.x)]) continue;
        const s = d + 6; if (s < bs && !best) { bs = s; best = b; }
      }
    }
    return best;
  }

  /* ======================= orders ======================= */
  idleOrder(u) { u.order = { t: 'idle', hx: u.x, hy: u.y }; u.path = null; u.moving = false; }
  gatherInfo(o) {
    if (!o) return null;
    if (o.isNode) return { type: o.type, amt: o.amt, rate: NK[o.kind].rate, rect: o.rect };
    if (o.isBld && FIELD[o.kind] && o.done) return { type: 'food', amt: o.food, rate: FARM_RATE * (BD[o.kind].rate || 1), rect: o.rect };
    return null;
  }
  orderGather(u, target) {
    const gi = this.gatherInfo(target); if (!gi) return false;
    if (target.kind === 'fish' ? u.cls !== 'boat' : u.cls === 'boat') return false;
    if (u.carry.type && u.carry.type !== gi.type) u.carry = { type: null, amt: 0 };
    if (u.order.t === 'gather') this.claims.set(u.order.id, Math.max(0, (this.claims.get(u.order.id) || 0) - 1));
    this.claims.set(target.id, (this.claims.get(target.id) || 0) + 1);
    u.order = { t: 'gather', id: target.id, type: gi.type, s: 'go' }; u.path = null; u.wait = 0;
    return true;
  }
  orderAttack(u, target, extra) {
    if (u.isUnit && !u.atk && UD[u.kind].trader) { this.idleOrder(u); return; }
    u.order = Object.assign({ t: 'attack', id: target.id }, extra || {}); u.path = null; u.rp = 0;
  }
  orderBoard(u, g) { u.order = { t: 'board', id: g.id }; u.path = null; u.wait = 0; u.rp = 0; }
  /* garrison: villagers shelter in a Town Centre (15) or tower (5); each one inside adds an arrow */
  roomIn(b) { const d = BD[b.kind]; return b.done && b.hp > 0 && d.garrison ? d.garrison - (b.cargo || []).length : 0; }
  orderGarrison(u, b, back) { u.order = { t: 'garrison', id: b.id, back: back || null }; u.path = null; u.wait = 0; u.rp = 0; }
  doGarrison(u, dt) {
    const b = this.byId.get(u.order.id);
    if (!b || b.team !== u.team || this.roomIn(b) <= 0) {
      const alt = this.shelterFor(u); if (alt && alt !== b) { this.orderGarrison(u, alt, u.order.back); return; }
      this.idleOrder(u); return;
    }
    if (rectDist(u.x, u.y, b.rect) <= 0.9) {
      (b.cargo = b.cargo || []).push(u); u.aboard = b.id; u.back = u.order.back; u.order = { t: 'idle' }; u.path = null; return;
    }
    u.rp = (u.rp || 0) - dt;
    if (!u.path || u.rp <= 0) {
      if (u.wait > 0 && !u.path) return;
      u.rp = 1.2;
      if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; }
    }
    if (this.stepMove(u, dt)) u.path = null;
  }
  shelterFor(u) {
    let best = null, bd = 1e9;
    for (const b of this.buildings) if (b.team === u.team && this.roomIn(b) > 0) { const d = Math.hypot(b.x - u.x, b.y - u.y); if (d < bd) { bd = d; best = b; } }
    return best;
  }
  /* the town bell: every villager runs for the nearest shelter with room; All clear sends them back to work */
  ringBell(team) {
    const vils = this.units.filter(u => u.team === team && u.hp > 0 && u.cls === 'vil' && u.order.t !== 'garrison');
    const room = new Map(); for (const b of this.buildings) if (b.team === team) room.set(b, this.roomIn(b));
    let n = 0;
    for (const u of vils) {
      let best = null, bd = 1e9;
      for (const [b, r] of room) if (r > 0) { const d = Math.hypot(b.x - u.x, b.y - u.y); if (d < bd) { bd = d; best = b; } }
      if (!best) break;
      room.set(best, room.get(best) - 1);
      const o = u.order, back = o.t === 'gather' || o.t === 'build' || o.t === 'repair' || o.t === 'fishhouse' ? Object.assign({}, o) : null;
      this.orderGarrison(u, best, back); n++;
    }
    this.bell = this.bell || [false, false]; this.bell[team] = true;
    return n;
  }
  ungarrison(b, all) {
    if (!b.cargo || !b.cargo.length) return 0;
    const n = b.cargo.length; this.wt = b.team;
    for (const u of b.cargo) {
      const p = this.openSpot(b.x, b.y + b.size / 2 + 0.6, 0);
      u.x = p.x; u.y = p.y; u.aboard = null; u.path = null; u.order = { t: 'idle', hx: u.x, hy: u.y };
      this.units.push(u); this.byId.set(u.id, u);
      const o = u.back; u.back = null;
      if (o && o.id && this.byId.get(o.id)) { const t = this.byId.get(o.id); if (o.t === 'gather') this.orderGather(u, t); else if (o.t === 'build' || o.t === 'repair') { u.order = Object.assign({}, o); } else if (o.t === 'fishhouse') u.order = Object.assign({}, o); }
    }
    b.cargo = [];
    return n;
  }
  allClear(team) {
    let n = 0;
    for (const b of this.buildings) if (b.team === team) n += this.ungarrison(b);
    for (const u of this.units) if (u.team === team && u.order.t === 'garrison') { const o = u.order.back; this.idleOrder(u); if (o && o.t === 'gather' && this.byId.get(o.id)) this.orderGather(u, this.byId.get(o.id)); }
    if (this.bell) this.bell[team] = false;
    return n;
  }
  orderLand(g, x, y) { g.order = { t: 'land', x, y }; g.path = null; g.wait = 0; }
  /* the water tile next to a beach nearest (x, y), leaning towards (bx, by) */
  shoreTile(x, y, bx, by) {
    let best = null, bd = 1e9;
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
      if (!this.walkable(tx, ty, 1)) continue;
      let beach = false;
      for (let dy = -1; dy <= 1 && !beach; dy++) for (let dx = -1; dx <= 1; dx++) if (this.walkable(tx + dx, ty + dy, 0)) { beach = true; break; }
      if (!beach) continue;
      const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y) + (bx != null ? Math.hypot(tx + 0.5 - bx, ty + 0.5 - by) * 0.15 : 0);
      if (d < bd) { bd = d; best = { x: tx, y: ty }; }
    }
    return best;
  }
  /* a land unit climbs aboard once it reaches the galley */
  doBoard(u, dt) {
    const g = this.byId.get(u.order.id);
    if (!g || g.hp <= 0 || g.team !== u.team) { this.idleOrder(u); return; }
    if ((g.cargo || []).length >= UD[g.kind].troops) { if (u.team === 0) this.msg('The ' + civName(g.kind, g.team).split(' (')[0] + ' is full.'); this.idleOrder(u); return; }
    if (Math.hypot(g.x - u.x, g.y - u.y) <= (u.wade ? 3.2 : 1.9)) {
      u.wade = false; (g.cargo = g.cargo || []).push(u); u.aboard = g.id; u.order = { t: 'idle' }; u.path = null; u.carry = u.carry || { type: null, amt: 0 };
      return;
    }
    u.rp = (u.rp || 0) - dt;
    if (!u.path || u.rp <= 0) {
      if (u.wait > 0 && !u.path) return;
      u.rp = 1;
      if (!this.setPath(u, this.pathToRect(u, { ax: g.x, ay: g.y, bx: g.x, by: g.y }, 1.5))) {
        // the galley rides a little off the beach: wade out to it from the water's edge
        if (Math.hypot(g.x - u.x, g.y - u.y) <= 3.2) { u.wade = true; return; }
        u.wait = 0.8; return;
      }
    }
    if (this.stepMove(u, dt)) u.path = null;
  }
  /* a galley sails to the beach nearest (x, y) and puts its troops ashore */
  doLand(g, dt) {
    const o = g.order;
    if (!g.cargo || !g.cargo.length) { this.idleOrder(g); return; }
    let shore = null, sd = 1e9;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const tx = Math.floor(g.x) + dx, ty = Math.floor(g.y) + dy;
      if (!this.walkable(tx, ty, 0)) continue;
      const d = Math.hypot(tx + 0.5 - g.x, ty + 0.5 - g.y) + Math.hypot(tx + 0.5 - o.x, ty + 0.5 - o.y) * 0.2;
      if (d < sd && Math.hypot(tx + 0.5 - g.x, ty + 0.5 - g.y) <= 2.2) { sd = d; shore = { x: tx, y: ty }; }
    }
    const near = Math.hypot(g.x - o.x, g.y - o.y);
    if (shore && (near < 4 || (o.s && !g.path))) {
      this.wt = g.team;
      for (const u of g.cargo) {
        const p = this.openSpot(shore.x + 0.5, shore.y + 0.5, 0);
        u.x = p.x; u.y = p.y; u.aboard = null; u.path = null; u.order = { t: 'idle', hx: u.x, hy: u.y };
        this.units.push(u); this.byId.set(u.id, u);
        if (this.isLand(Math.floor(o.x), Math.floor(o.y)) && Math.hypot(o.x - u.x, o.y - u.y) > 1.5) this.orderMove(u, o.x, o.y);
      }
      if (g.team === 0) this.msg(g.cargo.length + ' landed.');
      g.cargo = []; this.idleOrder(g); return;
    }
    if (!g.path) {
      if (g.wait > 0) return;
      const w = this.shoreTile(o.x, o.y);
      if (!w || !this.setPath(g, this.pathToPoint(g, w.x + 0.5, w.y + 0.5))) { if (g.team === 0) this.msg('No beach the galley can reach there.'); this.idleOrder(g); return; }
      o.s = 1;
    }
    if (this.stepMove(g, dt)) g.path = null;
  }
  /* a Port pushes a burning raft out at the nearest enemy ship */
  launchRaft(b) {
    if (!b || b.kind !== 'port' || !b.done || b.hp <= 0) return 'Not available.';
    if (b.raftCd > 0) return 'Next fire raft in ' + Math.ceil(b.raftCd) + ' s.';
    if (!this.canAfford(b.team, UD.raft.cost)) return 'Not enough wood.';
    this.pay(b.team, UD.raft.cost); b.raftCd = RAFT.cd;
    const sp = this.findSpawn(b, null, 1), u = this.addUnit('raft', b.team, sp.x, sp.y);
    u.life = UD.raft.life;
    let t = null, td = RAFT.r;
    for (const o of this.units) if (o.hp > 0 && o.layer === 1 && o.team !== b.team && o.team !== 2 && o.kind !== 'raft') { const d = Math.hypot(o.x - b.x, o.y - b.y); if (d < td) { td = d; t = o; } }
    if (t) this.orderAttack(u, t);
    else { const dx = sp.x - b.x, dy = sp.y - b.y, l = Math.hypot(dx, dy) || 1; this.orderMove(u, sp.x + dx / l * 5, sp.y + dy / l * 5); }
    return null;
  }
  orderTrade(u, post) { u.order = { t: 'trade', post: post.id, s: 'out' }; u.path = null; u.wait = 0; }
  orderBuild(u, b) { u.order = { t: 'build', id: b.id }; u.path = null; u.wait = 0; }
  orderMove(u, x, y) { u.order = { t: 'move', x, y }; u.path = null; u.wait = 0; }
  orderAMove(u, x, y) { u.order = { t: 'amove', x, y }; u.path = null; u.wait = 0; }

  /* group order from the player (or the AI). ids -> units owned by `team` */
  command(ids, wx, wy, target, opts) {
    opts = opts || {};
    let us = ids.map(id => this.byId.get(id)).filter(u => u && u.isUnit && u.hp > 0 && (u.team === 0 || opts.any));
    if (!us.length) return;
    // a galley with troops aboard, sent to a beach, lands them
    const landing = us.filter(u => u.cargo && u.cargo.length);
    if (landing.length && this.isLand(Math.floor(wx), Math.floor(wy)) && !(target && target.hp > 0 && target.team !== landing[0].team && target.team !== 2)) {
      for (const g of landing) this.orderLand(g, wx, wy);
      us = us.filter(u => !landing.includes(u)); if (!us.length) return;
    }
    if (target && target.hp > 0) {
      const team = us[0].team;
      // land units tapped onto their own galley go aboard; the galley comes to the nearest beach
      if (target.isUnit && target.team === team && UD[target.kind].troops && us.some(u => u.layer === 0)) {
        const land = us.filter(u => u.layer === 0 && u.cls !== 'animal');
        for (const u of land) this.orderBoard(u, target);
        if (target.order.t === 'idle' || target.order.t === 'move') {
          const cx = land.reduce((a, u) => a + u.x, 0) / land.length, cy = land.reduce((a, u) => a + u.y, 0) / land.length;
          const w = this.shoreTile(cx, cy, target.x, target.y); if (w) this.orderMove(target, w.x + 0.5, w.y + 0.5);
        }
        return;
      }
      if (target.isUnit && target.team !== team) {
        for (const u of us) {
          if (u.cls === 'boat') this.orderMove(u, target.x, target.y);
          else if (target.team === 2) this.orderAttack(u, target, { hunt: u.cls === 'vil' });
          else this.orderAttack(u, target);
        }
        return;
      }
      if (target.isBld && target.team !== team && target.team !== 2) {
        for (const u of us) { if (u.cls === 'boat') this.orderMove(u, target.x, target.y); else this.orderAttack(u, target); }
        return;
      }
      if (target.isBld && target.team === team && target.kind === 'rafthouse' && target.done && us.some(u => u.cls === 'vil')) {
        const v = us.find(u => u.cls === 'vil'), rest = us.filter(u => u !== v);
        for (const o of this.units) if (o !== v && o.order.t === 'fishhouse' && o.order.id === target.id) this.idleOrder(o);
        v.order = { t: 'fishhouse', id: target.id }; v.path = null; v.wait = 0;
        if (rest.length) this.groupMove(rest, target.x, target.y, opts);
        return;
      }
      if (target.isBld && target.team === team && target.kind === 'tradepost' && target.done) {
        const movers = [];
        for (const u of us) { if (UD[u.kind].trader) this.orderTrade(u, target); else movers.push(u); }
        if (movers.length) this.groupMove(movers, target.x, target.y, opts);
        return;
      }
      if (target.isNode || (target.isBld && FIELD[target.kind] && target.done && target.team === team)) {
        const movers = [], gi = this.gatherInfo(target);
        this.countClaims();
        const workers = us.filter(u => u.cls === 'vil' || u.cls === 'boat').sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y));
        for (const u of workers) if (u.order.t === 'gather') { this.claims.set(u.order.id, Math.max(0, this.claimsOf({ id: u.order.id }) - 1)); u.order = { t: 'idle' }; }
        for (const u of workers) {
          let t = target;
          if (this.claimsOf(target) >= this.gatherCap(target) && gi) {
            const alt = this.freeSameKind(target, target.x, target.y, u.team, 9);
            if (alt) t = alt;
          }
          if (!this.orderGather(u, t)) movers.push(u);
        }
        for (const u of us) if (!(u.cls === 'vil' || u.cls === 'boat')) movers.push(u);
        if (movers.length) this.groupMove(movers, target.x, target.y, opts);
        return;
      }
      if (target.isBld && target.team === team && target.done && target.hp < target.maxHp && !FIELD[target.kind] && us.some(u => u.cls === 'vil')) {
        const movers = [];
        for (const u of us) { if (u.cls === 'vil') { u.order = { t: 'repair', id: target.id }; u.path = null; u.wait = 0; } else movers.push(u); }
        if (movers.length) this.groupMove(movers, target.x, target.y, opts);
        return;
      }
      if (target.isBld && target.team === team && !target.done) {
        const movers = [];
        for (const u of us) { if (u.cls === 'vil') this.orderBuild(u, target); else movers.push(u); }
        if (movers.length) this.groupMove(movers, target.x, target.y, opts);
        return;
      }
    }
    if (opts.amove) { this.groupMove(us, wx, wy, Object.assign({}, opts, { amove: true })); return; }
    this.groupMove(us, wx, wy, opts);
  }

  groupMove(us, wx, wy, opts) {
    if (us.length === 1) { const u = us[0]; if (opts.amove) this.orderAMove(u, wx, wy); else this.orderMove(u, wx, wy); return; }
    let cx = 0, cy = 0; for (const u of us) { cx += u.x; cy += u.y; } cx /= us.length; cy /= us.length;
    let fx = wx - cx, fy = wy - cy; const fl = Math.hypot(fx, fy);
    if (fl < 0.5) { fx = 1; fy = 0; } else { fx /= fl; fy /= fl; }
    const lx = -fy, ly = fx;
    // melee (and villagers) take the formation up front; ranged units always line up in rows behind them
    const sorted = us.slice().sort((a, b) => ORDER_CLS[a.cls] - ORDER_CLS[b.cls]);
    const n = sorted.length, sp = 0.95, form = opts.formation || 'box', slots = [];
    const nBack = sorted.filter(u => u.ranged || u.cls === 'boat' || u.cls === 'healer').length, nFront = n - nBack;
    const shape = (m, out) => {
      if (form === 'line') {
        const per = Math.min(m, 12);
        for (let i = 0; i < m; i++) out.push({ lat: ((i % per) - (Math.min(per, m - ((i / per | 0) * per)) - 1) / 2) * sp, depth: Math.floor(i / per) * sp });
      } else if (form === 'wedge') {
        let row = 0, left = m;
        while (left > 0) { const c = Math.min(left, row * 2 + 1); for (let i = 0; i < c; i++) out.push({ lat: (i - (c - 1) / 2) * sp * 1.05, depth: row * sp * 0.9 }); left -= c; row++; }
      } else {
        const cols = Math.ceil(Math.sqrt(m * 1.4));
        for (let i = 0; i < m; i++) { const c = i % cols, r = Math.floor(i / cols), rowN = Math.min(cols, m - r * cols); out.push({ lat: (c - (rowN - 1) / 2) * sp, depth: r * sp }); }
      }
      out.sort((a, b) => a.depth - b.depth);
    };
    if (!nFront || !nBack) shape(n, slots);
    else {
      shape(nFront, slots);
      let width = 0, back = 0;
      for (const s of slots) { width = Math.max(width, Math.abs(s.lat)); back = Math.max(back, s.depth); }
      const per = Math.max(3, Math.min(12, Math.round(width * 2 / sp) + 1));
      for (let i = 0; i < nBack; i++) {
        const r = Math.floor(i / per), rowN = Math.min(per, nBack - r * per);
        slots.push({ lat: ((i % per) - (rowN - 1) / 2) * sp, depth: back + sp * 1.15 + r * sp });
      }
    }
    for (let i = 0; i < n; i++) {
      const u = sorted[i], s = slots[i];
      const x = wx + lx * s.lat - fx * s.depth, y = wy + ly * s.lat - fy * s.depth;
      if (opts.amove) this.orderAMove(u, x, y); else this.orderMove(u, x, y);
    }
  }

  /* ======================= building / training ======================= */
  canPlace(kind, tx, ty, team) {
    const d = BD[kind];
    const dh = d.fh || d.size;
    if (tx < 1 || ty < 1 || tx + d.size > W - 1 || ty + dh > H - 1) return false;
    if (d.site && !this.siteAt(tx, ty)) return false;
    if (this.underPortArt(tx, ty, d.size, dh, kind)) return false;
    if (!d.site) for (let y = ty; y < ty + dh; y++) for (let x = tx; x < tx + d.size; x++) if (this.siteMask[y * W + x]) return false;
    for (let y = ty; y < ty + dh; y++) for (let x = tx; x < tx + d.size; x++) {
      if (!this.freeTile(x, y) && !(d.gate && this.wallPieceAt(x, y, team, true))) return false;
      if (team === 0 && !this.explored[y * W + x]) return false;
    }
    if (d.shore) {
      let water = 0;
      for (let y = ty - 1; y <= ty + dh; y++) for (let x = tx - 1; x <= tx + d.size; x++) {
        if (x >= tx && x < tx + d.size && y >= ty && y < ty + dh) continue;
        if (this.isWater(x, y) && !this.block[y * W + x]) water++;
      }
      if (water < 3) return false;
    }
    return true;
  }
  /* a port's hall stands up above its deck: nothing may be built where the hall's art goes, and a port's hall
     can't cover another building */
  underPortArt(tx, ty, w, h, kind) {
    const hit = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah;
    const d = BD[kind], art = d.fh && d.fh < d.size ? [tx, ty + h - d.size, w, d.size - h] : null;
    for (const b of this.buildings) {
      if (b.hp <= 0) continue;
      const bh = b.h || b.size;
      if (bh < b.size && hit(tx, ty, w, h, b.tx, b.ty + bh - b.size, b.size, b.size - bh)) return true;
      if (art && hit(art[0], art[1], art[2], art[3], b.tx, b.ty, b.size, bh)) return true;
    }
    return false;
  }
  /* water tiles around a footprint: an Ayutthaya house with 3 or more becomes a raft house */
  waterSide(tx, ty, size) {
    let water = 0;
    for (let y = ty - 1; y <= ty + size; y++) for (let x = tx - 1; x <= tx + size; x++) {
      if (x >= tx && x < tx + size && y >= ty && y < ty + size) continue;
      if (this.inb(x, y) && this.isWater(x, y) && !this.block[y * W + x]) water++;
    }
    return water >= 3;
  }
  /* the team's own palisade or wall (or any wall piece, gates included, unless plain) on a tile */
  wallPieceAt(x, y, team, plain) {
    if (!this.occ[y * W + x]) return null;
    for (const b of this.buildings) if (b.hp > 0 && b.tx === x && b.ty === y && b.team === team && BD[b.kind].wall && !(plain && BD[b.kind].gate)) return b;
    return null;
  }
  /* tiles of a wall line from (ax, ay) to (bx, by), stepping one axis at a time so there are no diagonal gaps */
  lineTiles(ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, sx = Math.sign(dx), sy = Math.sign(dy), n = Math.min(WALL_MAX - 1, Math.abs(dx) + Math.abs(dy));
    const out = [[ax, ay]]; let x = ax, y = ay;
    for (let i = 0; i < n; i++) {
      const ex = Math.abs((x + sx - ax) * dy - (y - ay) * dx), ey = Math.abs((x - ax) * dy - (y + sy - ay) * dx);
      if (sx && (!sy || ex <= ey)) x += sx; else y += sy;
      out.push([x, y]);
    }
    return out;
  }
  /* lay a palisade or wall line; own wall tiles on the way are kept, blocked tiles are skipped. returns {ok, n, why} */
  placeLine(team, kind, ax, ay, bx, by, builderIds) {
    const d = BD[kind];
    if (!d || !d.line) return { ok: false, why: 'Cannot build that.' };
    if (d.needs && !this.buildings.some(b => b.team === team && b.kind === d.needs && b.done && b.hp > 0)) return { ok: false, why: 'Build a ' + civName(d.needs, team) + ' first.' };
    const placed = [];
    for (const [x, y] of this.lineTiles(ax, ay, bx, by)) {
      if (!this.canPlace(kind, x, y, team)) continue;
      if (!this.canAfford(team, d.cost)) break;
      this.pay(team, d.cost); placed.push(this.addBuilding(kind, team, x, y, false));
    }
    if (!placed.length) return { ok: false, why: this.canAfford(team, d.cost) ? 'Cannot build there.' : 'Not enough resources.' };
    // each builder starts on the nearest piece; finishing one moves them on to the next
    for (const id of builderIds || []) {
      const u = this.byId.get(id); if (!u || u.hp <= 0 || u.cls !== 'vil') continue;
      let nb = placed[0], bd = 1e9;
      for (const b of placed) { const dd = Math.hypot(b.x - u.x, b.y - u.y); if (dd < bd) { bd = dd; nb = b; } }
      this.orderBuild(u, nb);
    }
    if (team === 0) this.stats.built += placed.length;
    return { ok: true, n: placed.length, b: placed[placed.length - 1] };
  }
  /* returns {ok, b, why} */
  placeBuilding(team, kind, tx, ty, builderIds) {
    if (kind === 'house' && CV(team) === AYU_CIV && this.waterSide(tx, ty, 2)) kind = 'rafthouse';
    const d = BD[kind];
    if (!d || !d.cost) return { ok: false, why: 'Cannot build that.' };
    if (!this.canAfford(team, d.cost)) return { ok: false, why: 'Not enough resources.' };
    if (d.needs && !this.buildings.some(b => b.team === team && b.kind === d.needs && b.done && b.hp > 0)) return { ok: false, why: 'Build a ' + civName(d.needs, team) + ' first.' };
    if (d.one && this.countOf(team, kind) > 0) return { ok: false, why: 'You can only have one ' + civName(kind, team) + '.' };
    if (!ageFits(d, this.teamAge(team))) return { ok: false, why: civName(kind, team) + ' comes with the ' + AGE_TABLE[d.age].name + '.' };
    if (!this.canPlace(kind, tx, ty, team)) return { ok: false, why: kind === 'port' ? 'Ports need a spot on the shore.' : d.site ? 'Build it on the landing beside a neutral village.' : 'Cannot build there.' };
    this.pay(team, d.cost);
    // a gate set into a wall takes that wall piece's place
    const old = d.gate && this.wallPieceAt(tx, ty, team, true);
    if (old) { old.hp = 0; this.burning.delete(old); this.byId.delete(old.id); this.buildings = this.buildings.filter(o => o !== old); const i = ty * W + tx; this.occ[i] = 0; this.block[i] = 0; }
    const b = this.addBuilding(kind, team, tx, ty, false);
    if (d.site) this.siteAt(tx, ty).post = b.id;
    for (const id of builderIds || []) { const u = this.byId.get(id); if (u && u.hp > 0 && u.cls === 'vil') this.orderBuild(u, b); }
    if (team === 0) this.stats.built++;
    return { ok: true, b };
  }
  queueUnit(b, kind, team) {
    if (!b || b.hp <= 0 || !b.done || b.team !== (team == null ? 0 : team)) return 'Not available.';
    const can = this.trainable(b.kind, b.team);
    if (!can || !can.includes(kind)) return 'Cannot train that here.';
    if (b.queue.length >= 5) return 'Queue is full.';
    if (UD[kind].one && this.countOf(b.team, kind) > 0) return 'Only one ' + civName(kind, b.team) + ' at a time.';
    const cap = UD[kind].civCap ? UD[kind].civCap[CI(b.team)] : UD[kind].cap;
    if (cap && this.countOf(b.team, kind) >= cap) return 'You can have ' + cap + ' ' + civName(kind, b.team) + ' at most.';
    const cost = this.costOf(kind, b.team);
    if (!this.canAfford(b.team, cost)) return 'Not enough resources.';
    this.pay(b.team, cost); b.queue.push({ kind, t: 0 });
    return null;
  }
  cancelQueue(b, idx) {
    if (!b || idx < 0 || idx >= b.queue.length) return;
    const q = b.queue.splice(idx, 1)[0];
    this.refund(b.team, this.costOf(q.kind, b.team));
    if (idx === 0) b.qt = 0;
  }
  popOf(team) { let n = 0; for (const u of this.units) if (u.team === team && u.hp > 0 && u.kind !== 'raft') { n++; if (u.cargo) n += u.cargo.length; } for (const b of this.buildings) if (b.team === team && b.cargo) n += b.cargo.length; return n; }
  popCap(team) { let c = 0; for (const b of this.buildings) if (b.team === team && b.done && b.hp > 0) c += BD[b.kind].pop || 0; return Math.min(CV(team) === AYU_CIV ? 120 : MAXPOP, c); }
  dropOffs(team, type, layer) {
    return this.buildings.filter(b => b.team === team && b.done && b.hp > 0 && BD[b.kind].drop && BD[b.kind].drop.includes(type) &&
      (layer === 1 ? b.kind === 'port' : b.kind !== 'port'));
  }
  nearestDrop(u, type) {
    let best = null, bd = 1e9;
    for (const b of this.dropOffs(u.team, type, u.layer)) { const d = rectDist(u.x, u.y, b.rect); if (d < bd) { bd = d; best = b; } }
    return best;
  }
  /* nearest resource of a type; one with a free gathering slot wins over a full one */
  nearestNode(x, y, type, layer, maxD, team, bad) {
    let best = null, bd = maxD || 1e9, full = null, fd = maxD || 1e9;
    const consider = (n) => {
      if (bad && bad.has(n.id)) return;
      const d = Math.hypot(n.x - x, n.y - y);
      if (this.claimsOf(n) < this.gatherCap(n)) { if (d < bd) { bd = d; best = n; } }
      else if (d < fd) { fd = d; full = n; }
    };
    const rg = layer === 1 || this.map === 'strait' ? 0 : this.regionAt(x, y);
    for (const n of this.nodes) {
      if (n.hp <= 0 || n.amt <= 0 || n.type !== type) continue;
      if ((n.kind === 'fish') !== (layer === 1)) continue;
      if (rg && n.tx != null && this.region[n.ty * W + n.tx] && this.region[n.ty * W + n.tx] !== rg) continue;
      consider(n);
    }
    if (type === 'food' && layer === 0) {
      for (const b of this.buildings) {
        if (!FIELD[b.kind] || b.hp <= 0 || !b.done || b.food <= 0 || b.team !== team) continue;
        consider(b);
      }
    }
    return best || full;
  }
  /* nearest other resource of the same kind as `like` (tree -> tree, farm -> own farm) with a free slot */
  freeSameKind(like, x, y, team, maxD) {
    let best = null, bd = maxD;
    const list = like.isBld ? this.buildings.filter(b => FIELD[b.kind] && b.team === team && b.done && b.food > 0) : this.nodes;
    for (const n of list) {
      if (n === like || n.hp <= 0 || (n.isNode && (n.amt <= 0 || n.kind !== like.kind))) continue;
      if (this.claimsOf(n) >= this.gatherCap(n)) continue;
      const d = Math.hypot(n.x - x, n.y - y); if (d < bd) { bd = d; best = n; }
    }
    return best;
  }
  /* how many villagers (or boats) may work one resource at once */
  gatherCap(n) { return n.isBld ? 2 : n.kind === 'fish' ? 2 : 3; }
  claimsOf(n) { return this.claims.get(n.id) || 0; }
  countClaims() {
    this.claims.clear();
    for (const u of this.units) if (u.hp > 0 && u.order.t === 'gather') this.claims.set(u.order.id, (this.claims.get(u.order.id) || 0) + 1);
  }
  setRally(b, x, y, target) {
    b.rally = target && (this.gatherInfo(target) || (target.kind === 'tradepost' && target.team === b.team)) ? { id: target.id } : { x, y };
  }

  /* ======================= per-tick update ======================= */
  update(dt) {
    if (this.over) return;
    this.t += dt; this.tickN++;
    this.rebuildHash(); this.countClaims();
    for (const b of this.buildings) this.updateBuilding(b, dt);
    for (const u of this.units) if (u.hp > 0) this.updateUnit(u, dt);
    this.separate();
    this.updateBurning(dt);
    this.cleanup();
    this.updateFx(dt);
    if (this.aging) this.ageTick(dt);
    this.aiAcc += dt; if (this.aiAcc >= 1) { this.aiAcc -= 1; this.aiTick(); }
    this.hhAcc = (this.hhAcc || 0) + dt; if (this.hhAcc >= HOUSEHOLD.every) { this.hhAcc -= HOUSEHOLD.every; this.householdTick(); }
    this.fogAcc += dt; if (this.fogAcc >= 0.2) { this.fogAcc = 0; this.updateFog(); }
    this.endAcc += dt; if (this.endAcc >= 0.5) { this.endAcc = 0; this.checkEnd(); }
  }

  /* fishing from a raft house's deck: no walking to a drop-off, the catch goes straight into the store */
  doFishHouse(u, dt) {
    const b = this.byId.get(u.order.id);
    if (!b || b.hp <= 0 || !b.done) { this.idleOrder(u); return; }
    if (rectDist(u.x, u.y, b.rect) <= 0.95) {
      u.path = null; u.working = true;
      const cx = b.x - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
      u.gt = (u.gt || 0) + dt * FISH_RATE;
      if (u.gt >= 10) { u.gt -= 10; this.res[u.team].food += 10; if (u.team === 0) this.floaters.push({ x: b.x, y: b.y - 1.2, text: '+10 food', type: 'food', t: 1.2 }); }
      return;
    }
    if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; } }
    if (this.stepMove(u, dt)) u.path = null;
  }
  /* Ayutthaya households: each house with a worked paddy beside it (or a raft house with a woman fishing) */
  households(team) {
    const out = [], worked = new Set(), fishing = new Set(), usedF = new Set();
    for (const u of this.units) if (u.team === team && u.hp > 0) { if (u.order.t === 'gather' && u.order.type === 'food') worked.add(u.order.id); if (u.order.t === 'fishhouse') fishing.add(u.order.id); }
    const farms = this.buildings.filter(b => b.team === team && b.done && b.hp > 0 && FIELD[b.kind] && worked.has(b.id));
    for (const h of this.buildings) {
      if (out.length >= HOUSEHOLD.max) break;
      if (h.team !== team || !h.done || h.hp <= 0) continue;
      if (h.kind === 'rafthouse') { if (fishing.has(h.id)) out.push(h); continue; }
      if (h.kind !== 'house') continue;
      const f = farms.find(f => !usedF.has(f.id) && Math.max(Math.abs(f.x - h.x), Math.abs(f.y - h.y)) <= (f.size + h.size) / 2 + 1.01);
      if (f) { usedF.add(f.id); out.push(h); }
    }
    return out;
  }
  householdTick() {
    for (const team of [0, 1]) {
      if (CV(team) !== AYU_CIV) continue;
      const hs = this.households(team); if (!hs.length) continue;
      this.res[team].food += hs.length * HOUSEHOLD.food;
      if (team === 0) for (const h of hs) this.floaters.push({ x: h.x, y: h.y - 1.4, text: '+' + HOUSEHOLD.food + ' food', type: 'food', t: 1.4 });
    }
  }

  updateBuilding(b, dt) {
    if (b.hp <= 0 || b.team === 2) return;
    b.hit = Math.max(0, b.hit - dt); if (b.raftCd > 0) b.raftCd -= dt;
    const d = BD[b.kind];
    if (!b.done) {
      b.nb = b._bn; b._bn = 0;
      return;
    }
    // Patirthan: units resting in the pool's area heal slowly
    if (d.aura) {
      b.acd = (b.acd || 0) - dt;
      if (b.acd <= 0) {
        b.acd = 1; let n = 0;
        this.unitsNear(b.x, b.y, d.aura.rng + b.size, (o) => { if (n < d.aura.max && this.canHeal(o, b.team) && rectDist(o.x, o.y, b.rect) <= d.aura.rng) { n++; this.healOne(o, d.aura.amt); } });
      }
    }
    // Majapahit Bandar: the village pays tribute, no ships needed
    if (b.kind === 'tradepost' && CV(b.team) === 1) this.res[b.team].gold += TRIBUTE * dt;
    // production
    if (b.queue.length) {
      const q = b.queue[0], need = UD[q.kind].time;
      b.stall = false;
      if (b.qt < need) b.qt += dt;
      if (b.qt >= need) {
        if (this.popOf(b.team) >= this.popCap(b.team)) { b.stall = true; if (b.team === 0 && this.t - (b.lastStallMsg || -99) > 8) { b.lastStallMsg = this.t; this.msg('Population limit reached. Build more Houses.'); } }
        else {
          b.queue.shift(); b.qt = 0;
          const layer = UD[q.kind].layer || 0;
          const toward = b.rally ? (b.rally.id ? this.byId.get(b.rally.id) : b.rally) : null;
          const sp = this.findSpawn(b, toward && toward.x != null ? { x: toward.x, y: toward.y } : null, layer);
          const u = this.addUnit(q.kind, b.team, sp.x, sp.y);
          if (b.team === 0) this.stats.trained++;
          if (b.rally) {
            if (b.rally.id) { const t = this.byId.get(b.rally.id); if (t && t.hp > 0 && t.kind === 'tradepost' && UD[u.kind].trader) this.orderTrade(u, t); else if (t && t.hp !== 0 && !this.orderGather(u, t)) this.orderMove(u, t.x, t.y); }
            else this.orderMove(u, b.rally.x, b.rally.y);
          }
        }
      }
    }
    // defensive fire
    if (d.atk) {
      b.cd = Math.max(0, b.cd - dt);
      if (b.cd <= 0) {
        let best = null, bd = d.atk.range;
        this.unitsNear(b.x, b.y, d.atk.range + 1, (o) => {
          if (o.hp <= 0 || o.team === b.team || o.team === 2) return;
          const dd = rectDist(o.x, o.y, b.rect); if (dd < bd) { bd = dd; best = o; }
        });
        if (best) {
          b.cd = d.atk.rate;
          const shots = 1 + (b.cargo ? b.cargo.length : 0);
          for (let i = 0; i < shots && best.hp > 0; i++) {
            this.arrows.push({ x0: b.x + (i ? (this.rng() - 0.5) * b.size * 0.6 : 0), y0: b.y - 0.8, x1: best.x, y1: best.y, t: 0, dur: 0.3 + i * 0.04 });
            this.damage({ atk: d.atk.dmg, ranged: true, team: b.team, isBld: true }, best);
          }
        }
      }
    }
  }

  finishBuilding(b) {
    b.done = true; b.progress = 1; b.hp = b.maxHp;
    if (b.team === 0) this.msg(civName(b.kind, 0) + ' complete.');
    for (const u of this.units) {
      if (u.hp <= 0 || u.order.t !== 'build' || u.order.id !== b.id) continue;
      this.idleOrder(u);
      if (b.kind === 'mill') { const n = this.nearestNode(b.x, b.y, 'wood', 0, 14, b.team); if (n) this.orderGather(u, n); }
      else if (b.kind === 'goldmine') { const n = this.nearestNode(b.x, b.y, 'gold', 0, 14, b.team); if (n) this.orderGather(u, n); }
      else if (b.kind === 'store') {
        const w = this.nearestNode(b.x, b.y, 'wood', 0, 14, b.team), g = this.nearestNode(b.x, b.y, 'gold', 0, 14, b.team);
        const d = (n) => n ? Math.hypot(n.x - b.x, n.y - b.y) : 1e9, n = d(g) < d(w) ? g : w;
        if (n) this.orderGather(u, n);
      }
      else if (FIELD[b.kind]) { this.orderGather(u, b); }
      else if (b.kind === 'rafthouse' && !this.units.some(o => o.hp > 0 && o.order.t === 'fishhouse' && o.order.id === b.id)) { u.order = { t: 'fishhouse', id: b.id }; u.path = null; }
      else {
        let nb = null, bd = 12;
        for (const o of this.buildings) { if (o.team === u.team && !o.done && o.hp > 0) { const d = Math.hypot(o.x - u.x, o.y - u.y); if (d < bd) { bd = d; nb = o; } } }
        if (nb) this.orderBuild(u, nb);
      }
    }
  }

  updateUnit(u, dt) {
    u.cd = Math.max(0, u.cd - dt); if (u.cd2) u.cd2 = Math.max(0, u.cd2 - dt); u.atkT = Math.max(0, u.atkT - dt); u.hit = Math.max(0, u.hit - dt);
    u.wait = Math.max(0, u.wait - dt); u.rp = Math.max(0, u.rp - dt);
    if (u.psn) { u.psn.t -= dt; u.hp -= u.psn.dps * dt; if (u.psn.t <= 0) u.psn = null; if (u.hp <= 0) { this.onKilled(u, { team: u.psnBy, isUnit: false }); return; } }
    if (u.life != null) {
      u.life -= dt;
      if ((this.tickN + u.id) % 12 === 0) this.fx.push({ k: 'flame', x: u.x + (this.rng() - 0.5) * 0.4, y: u.y - 0.3, n: 1, t: 0.6, max: 0.6 });
      if (u.life <= 0) { u.hp = 0; this.onKilled(u, null); return; }
    }
    u.still = u.moving ? 0 : (u.still || 0) + dt;
    u.anim += dt; u.moving = false; u.working = false; this.wt = u.team;
    const o = u.order;
    switch (o.t) {
      case 'idle': this.doIdle(u, dt); break;
      case 'move':
        if (!u.path) { if (u.wait > 0) break; if (!this.setPath(u, this.pathToPoint(u, o.x, o.y))) { u.wait = 0.5; this.idleOrder(u); break; } }
        if (this.stepMove(u, dt)) { if (u.path === null && u.order.t === 'move') { u.wait = 0.3; } else this.idleOrder(u); }
        break;
      case 'amove': this.doAMove(u, dt); break;
      case 'attack': this.doAttack(u, dt); break;
      case 'gather': this.doGather(u, dt); break;
      case 'build': this.doBuild(u, dt); break;
      case 'wander': this.doWander(u, dt); break;
      case 'flee': this.doFlee(u, dt); break;
      case 'trade': this.doTrade(u, dt); break;
      case 'heal': this.doHeal(u, dt); break;
      case 'board': this.doBoard(u, dt); break;
      case 'garrison': this.doGarrison(u, dt); break;
      case 'land': this.doLand(u, dt); break;
      case 'fishhouse': this.doFishHouse(u, dt); break;
      case 'repair': this.doRepair(u, dt); break;
    }
    // stuck check: walking but barely moved for a while -> try the other side, then re-path
    if (u.moving) {
      u.stk += dt;
      if (u.stk >= 0.6) {
        if (Math.hypot(u.x - u.sx, u.y - u.sy) < 0.25) { u.side = -u.side; if (++u.stuckN >= 3) { u.stuckN = 0; u.path = null; } }
        else u.stuckN = 0;
        u.stk = 0; u.sx = u.x; u.sy = u.y;
      }
    } else { u.stk = 0; u.sx = u.x; u.sy = u.y; }
  }

  doIdle(u, dt) {
    // drift back to where we stopped if others have shoved us (keeps formations and archer rows intact)
    const o = u.order;
    if (o.hx != null && u.cls !== 'animal') {
      const dx = o.hx - u.x, dy = o.hy - u.y, d = Math.hypot(dx, dy);
      // someone else is standing on our spot: settle where we are instead of shoving back forever
      const squatter = d > 0.3 && this.unitNear(o.hx, o.hy, 0.55, u.layer, u);
      if (squatter && !squatter.moving) { o.hx = u.x; o.hy = u.y; o.hk = 0; }
      else if (d > 0.3) {
        const k = Math.min(1, u.spd * 0.5 * dt / d), nx = u.x + dx * k, ny = u.y + dy * k;
        o.hk = (o.hk || 0) + dt;
        if (d < 2.5 && o.hk < 2 && this.walkable(Math.floor(nx), Math.floor(ny), u.layer)) { u.x = nx; u.y = ny; u.moving = true; u.hx = dx / d; u.hy = dy / d; if (Math.abs(dx) > 0.02) u.face = dx > 0 ? 1 : -1; }
        else { o.hx = u.x; o.hy = u.y; o.hk = 0; }
      } else o.hk = 0;
    }
    if (u.cls === 'healer') { this.healStep(u, dt); return; }
    if (u.cls === 'vil' || u.cls === 'boat' || u.cls === 'animal') return;
    u.scan -= dt;
    if (u.scan > 0) return;
    u.scan = 0.45;
    const t = this.nearestEnemy(u, u.sight);
    if (t) this.orderAttack(u, t, { leash: { x: u.x, y: u.y, r: 11 } });
  }
  /* a land soldier whose way is walled off attacks the enemy wall piece that is most in the way to (gx, gy) */
  breach(u, gx, gy) {
    if (u.layer !== 0 || u.cls === 'vil' || u.cls === 'healer' || u.cls === 'animal') return null;
    let best = null, bs = 1e9;
    for (const b of this.buildings) {
      if (b.hp <= 0 || b.team === u.team || b.team === 2 || !BD[b.kind].wall) continue;
      const du = rectDist(u.x, u.y, b.rect); if (du > 14) continue;
      const s = du + Math.hypot(b.x - gx, b.y - gy); if (s < bs) { bs = s; best = b; }
    }
    return best;
  }
  doAMove(u, dt) {
    const o = u.order;
    u.scan -= dt;
    if (u.scan <= 0 && u.cls !== 'vil' && u.cls !== 'boat' && u.cls !== 'healer') {
      u.scan = 0.4;
      const t = this.nearestEnemy(u, u.sight);
      if (t) { this.orderAttack(u, t, { amove: { x: o.x, y: o.y } }); return; }
    }
    if (!u.path) {
      if (u.wait > 0) return;
      if (!this.setPath(u, this.pathToPoint(u, o.x, o.y))) { u.wait = 0.6; this.idleOrder(u); return; }
      if (!u.pr) { const w = this.breach(u, o.x, o.y); if (w) { this.orderAttack(u, w, { amove: { x: o.x, y: o.y } }); return; } }
    }
    if (this.stepMove(u, dt)) { if (u.path === null) u.wait = 0.3; else this.idleOrder(u); }
  }
  doAttack(u, dt) {
    const o = u.order, t = this.byId.get(o.id);
    const done = () => { if (o.then) { u.order = o.then; u.path = null; return; } if (o.amove) u.order = { t: 'amove', x: o.amove.x, y: o.amove.y }; else if (o.leash) this.orderMove(u, o.leash.x, o.leash.y); else this.idleOrder(u); u.path = null; };
    if (!t || t.hp <= 0 || (t.isUnit && t.team === 0 && u.team === 0)) { done(); return; }
    if (u.team === 0 && t.isUnit && t.team !== 2 && !this.isVisible(t.x, t.y)) { done(); return; }
    if (o.leash && Math.hypot(u.x - o.leash.x, u.y - o.leash.y) > o.leash.r) { this.orderMove(u, o.leash.x, o.leash.y); return; }
    const rect = t.isUnit ? { ax: t.x, ay: t.y, bx: t.x, by: t.y } : t.rect;
    const D = UD[u.kind], board = D.wpn === 'board', secOnly = board && D.sec && (t.isBld || t.layer !== 1);
    const reach = (secOnly ? D.sec.rng : u.rng) + (t.isUnit ? 0.35 : 0);
    const dist = rectDist(u.x, u.y, rect);
    if (D.sec && !secOnly && dist <= D.sec.rng + 0.35) this.secShot(u, t, dist);
    if (dist <= reach) {
      u.path = null; u.moving = false;
      if (Math.abs(t.x - u.x) > 0.05) u.face = t.x > u.x ? 1 : -1;
      if (D.boom) { this.explode(u); return; }
      if (secOnly) { this.secShot(u, t, dist); return; }
      if (u.cd <= 0) {
        u.cd = u.rate; u.atkT = Math.min(0.28, u.rate * 0.6);
        if (D.wpn) { this.shipShot(u, t, dist); return; }
        const big = D.cls === 'siege';
        if (u.ranged) this.arrows.push({ k: big ? 'ball' : D.gun ? 'bullet' : t.isBld && this.teamAge(u.team) >= 2 ? 'fire' : null, x0: u.x, y0: u.y - 0.4, x1: t.x, y1: t.isBld ? t.y : t.y - 0.3, t: 0, dur: big ? 0.1 + dist * 0.03 : D.gun ? 0.04 + dist * 0.012 : 0.12 + dist * 0.035 });
        if (D.gun) this.gunFx(u, big);
        this.damage(u, t);
        if (t.isBld && t.hp > 0) this.fireOn(u, t);
      }
      return;
    }
    const tt = t.isUnit ? (Math.floor(t.x) + ',' + Math.floor(t.y)) : '';
    if (!u.path && u.wait > 0) return;
    if (!u.path || (t.isUnit && u.pt !== tt && u.rp <= 0)) {
      u.pt = tt; u.rp = 0.45;
      const res = this.pathToRect(u, rect, Math.max(0.6, reach - 0.12));
      if (!this.setPath(u, res)) { u.wait = 0.5; done(); return; }
      if (!res.reached && !o.leash && !(t.isBld && BD[t.kind].wall)) {
        const w = this.breach(u, t.x, t.y);
        if (w) { u.order = { t: 'attack', id: w.id, then: { t: 'attack', id: t.id, amove: o.amove } }; u.path = null; return; }
      }
    }
    if (this.stepMove(u, dt) && u.path !== null) { u.path = null; u.wait = 0.35; }
  }
  doWander(u, dt) {
    const o = u.order;
    if (u.path) { if (this.stepMove(u, dt)) u.path = null; return; }
    o.next -= dt;
    if (o.next <= 0) {
      o.next = 3 + this.rng() * 6;
      const tx = u.x + (this.rng() - 0.5) * 7, ty = u.y + (this.rng() - 0.5) * 7;
      const g = this.nearestFree(tx, ty, 0, 3);
      if (Math.hypot(g.x - u.x, g.y - u.y) < 9) this.setPath(u, this.pathToPoint(u, g.x + 0.5, g.y + 0.5));
    }
  }
  doFlee(u, dt) {
    const o = u.order; o.t0 -= dt;
    if (o.t0 <= 0) { u.order = { t: 'wander', next: 1 }; u.path = null; return; }
    if (!u.path) {
      let ax = u.x - o.fx, ay = u.y - o.fy; const l = Math.hypot(ax, ay) || 1; ax /= l; ay /= l;
      const g = this.nearestFree(u.x + ax * 6, u.y + ay * 6, 0, 3);
      if (!this.setPath(u, this.pathToPoint(u, g.x + 0.5, g.y + 0.5))) { u.path = null; return; }
    }
    const sp = u.spd; u.spd = sp * 1.9; if (this.stepMove(u, dt)) u.path = null; u.spd = sp;
  }

  /* trade ship: sail to the Trading Post, load goods, sail home to the nearest Port and get paid by distance */
  doTrade(u, dt) {
    const o = u.order, post = this.byId.get(o.post);
    if (!post || post.hp <= 0 || !post.done) { this.idleOrder(u); return; }
    const home = o.s === 'back' ? this.dropOffs(u.team, 'food', 1).sort((a, b) => rectDist(u.x, u.y, a.rect) - rectDist(u.x, u.y, b.rect))[0] : null;
    if (o.s === 'back' && !home) { if (u.team === 0 && this.t - (u.lastNoDrop || -99) > 10) { u.lastNoDrop = this.t; this.msg('Your trade ships need a Port to bring goods home.'); } return; }
    const goal = o.s === 'out' ? post : home;
    if (rectDist(u.x, u.y, goal.rect) <= 1.6) {
      u.path = null;
      if (o.s === 'out') { o.s = 'back'; o.from = { x: post.x, y: post.y }; u.carry = { type: 'gold', amt: 1 }; }
      else {
        const d = Math.hypot(o.from.x - home.x, o.from.y - home.y);
        const gold = Math.max(1, Math.round(d * d * TRADE.k * TRADE.civ[CI(u.team)]));
        this.res[u.team].gold += gold; u.carry = { type: null, amt: 0 }; o.s = 'out';
        if (u.team === 0) { this.tradeGold += gold; this.floaters.push({ x: u.x, y: u.y - 0.8, text: '+' + gold, type: 'gold', t: 1.4 }); }
      }
      return;
    }
    if (!u.path) {
      if (u.wait > 0) return;
      if (!this.setPath(u, this.pathToRect(u, goal.rect, 1.5))) { u.wait = 1; return; }
    }
    if (this.stepMove(u, dt)) u.path = null;
  }
  /* healing: allies on land, hurt, and out of combat for HEAL_CALM seconds */
  canHeal(o, team) { return o.isUnit && o.hp > 0 && o.team === team && o.layer !== 1 && o.cls !== 'animal' && o.hp < o.maxHp && this.t - (o.lastHit == null ? -99 : o.lastHit) >= HEAL_CALM; }
  healOne(o, amt) { o.hp = Math.min(o.maxHp, o.hp + amt); this.fx.push({ k: 'heal', x: o.x, y: o.y - 0.5, t: 0.7, max: 0.7 }); }
  /* idle healer: heal what's in reach, or walk over to the worst-hurt ally it can see */
  healStep(u, dt) {
    const H = UD[u.kind].heal;
    u.hcd = Math.max(0, (u.hcd || 0) - dt);
    u.scan -= dt;
    if (u.hcd > 0 && u.scan > 0) return;
    let worst = null, ws = 2, inReach = [];
    this.unitsNear(u.x, u.y, u.sight, (o) => {
      if (o === u || !this.canHeal(o, u.team)) return;
      const d = Math.hypot(o.x - u.x, o.y - u.y); if (d > u.sight) return;
      if (d <= H.rng) inReach.push(o);
      const f = o.hp / o.maxHp; if (f < ws) { ws = f; worst = o; }
    });
    if (inReach.length) {
      if (u.hcd > 0) return;
      u.hcd = H.rate; u.atkT = 0.45;
      if (H.area) { inReach.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp); for (const o of inReach.slice(0, H.max)) this.healOne(o, H.amt); }
      else { inReach.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp); this.healOne(inReach[0], H.amt); const t = inReach[0]; if (Math.abs(t.x - u.x) > 0.05) u.face = t.x > u.x ? 1 : -1; }
      return;
    }
    if (u.scan > 0) return;
    u.scan = 0.5;
    if (worst) { u.order = { t: 'heal', id: worst.id, hx: u.x, hy: u.y }; u.path = null; }
  }
  doHeal(u, dt) {
    const o = u.order, t = this.byId.get(o.id), H = UD[u.kind].heal;
    if (!t || !this.canHeal(t, u.team)) { this.idleOrder(u); return; }
    if (Math.hypot(t.x - u.x, t.y - u.y) <= H.rng - 0.4) { this.idleOrder(u); return; }
    if (!u.path || u.rp <= 0) { u.rp = 0.6; if (!this.setPath(u, this.pathToPoint(u, t.x, t.y))) { this.idleOrder(u); return; } }
    if (this.stepMove(u, dt)) u.path = null;
  }

  /* a ship's main weapon: arrows (fire arrows from tier 1), boarding, or cannon (tier 2) */
  shipShot(u, t, dist) {
    const D = UD[u.kind], tier = this.navTier[u.team] != null ? this.navTier[u.team] : NAVWPN.tierDefault;
    const w = { wpn: D.wpn, atk: u.atk, ranged: D.wpn !== 'board', kb: D.kb, swv: D.swivel && tier >= 1, fire: D.fireA && tier >= 1 };
    if (D.wpn === 'cannon' && tier < 2) { w.wpn = 'shot'; w.atk = Math.round(u.atk * NAVWPN.noCannonAtk); w.swv = true; }
    const y1 = t.isBld ? t.y : t.y - 0.3, dur = 0.12 + dist * 0.035;
    if (w.wpn === 'board') { this.fx.push({ k: 'spark', x: t.x, y: t.y - 0.4, t: 0.35, max: 0.35 }); }
    else if (w.wpn === 'cannon') {
      this.arrows.push({ k: 'ball', x0: u.x, y0: u.y - 0.4, x1: t.x, y1, t: 0, dur: dur * 1.3 });
      this.gunFx(u, true);
      if (D.miss && D.miss[t.kind] && this.rng() < D.miss[t.kind]) { this.fx.push({ k: 'splash', x: t.x + (this.rng() - 0.5), y: t.y + 0.4, t: 0.5, max: 0.5 }); return; }
    } else { this.arrows.push({ k: w.fire ? 'fire' : (w.swv ? 'bullet' : null), x0: u.x, y0: u.y - 0.4, x1: t.x, y1, t: 0, dur: w.swv && !w.fire ? 0.05 + Math.hypot(t.x - u.x, t.y - u.y) * 0.014 : dur }); if (w.swv && !w.fire) this.gunFx(u, false); }
    this.damage(u, t, w);
  }
  /* secondary weapon (galley archers, flagship arrows) on its own reload */
  secShot(u, t, dist) {
    const D = UD[u.kind], S = D.sec;
    if ((u.cd2 || 0) > 0) return;
    u.cd2 = S.rate;
    const tier = this.navTier[u.team] != null ? this.navTier[u.team] : NAVWPN.tierDefault;
    const fire = tier >= 1 && (D.fireA || D.wpn === 'board'), swv = D.swivel && tier >= 1;
    this.arrows.push({ k: fire ? 'fire' : (swv ? 'bullet' : null), x0: u.x, y0: u.y - 0.4, x1: t.x, y1: t.isBld ? t.y : t.y - 0.3, t: 0, dur: swv && !fire ? 0.05 + dist * 0.014 : 0.12 + dist * 0.035 });
    if (swv && !fire) this.gunFx(u, false);
    this.damage(u, t, { wpn: 'arrow', atk: S.atk, ranged: true, swv, fire: fire && D.wpn !== 'board' });
  }
  /* fire on buildings (lore/siege.md, Iylia 2026-10-25), all of it automatic: foot soldiers carry obor torches,
     gunners throw gunpowder fire pots (two fires at once), and from the Kingdom Age archers shoot fire arrows that
     sometimes catch. Villagers standing by or repairing put fires out */
  fireOn(u, t) {
    if (t.team === 2 || t.team === u.team || BD[t.kind].neutral) return;
    const D = UD[u.kind];
    if (!u.ranged) { if ((u.cls === 'sword' || u.cls === 'spear' || u.cls === 'elite') && !D.big) this.ignite(t, u.team); }
    else if (D.gun && u.cls === 'archer') { this.ignite(t, u.team); this.ignite(t, u.team); }
    else if (u.cls === 'archer' && this.teamAge(u.team) >= 2 && this.rng() < 0.2) this.ignite(t, u.team);
  }
  /* set a building or wooden ship burning; stacks up to BURN.max */
  ignite(t, team) {
    if (t.hp <= 0 || t.team === 2) return;
    if (t.isUnit && t.cls !== 'ship' && t.cls !== 'boat') return;
    if (!t.burn) t.burn = { n: 0, t: 0, by: team, tick: 0 };
    t.burn.n = Math.min(BURN.max, t.burn.n + 1); t.burn.t = BURN.dur; t.burn.by = team;
    this.burning.add(t);
  }
  updateBurning(dt) {
    for (const t of this.burning) {
      const B = t.burn;
      if (!B || t.hp <= 0) { this.burning.delete(t); continue; }
      B.t -= dt;
      if (t.isUnit) {
        const port = this.buildings.find(b => b.kind === 'port' && b.done && b.team === t.team && rectDist(t.x, t.y, b.rect) <= BURN.portR);
        if (port) B.t = 0;
      } else {
        let vil = false;
        this.unitsNear(t.x, t.y, t.size + 2, (o) => { if (!vil && o.hp > 0 && o.team === t.team && o.cls === 'vil' && rectDist(o.x, o.y, t.rect) <= 1.6) vil = true; });
        if (vil) B.t -= dt * 3;
      }
      if (B.t <= 0) { t.burn = null; this.burning.delete(t); continue; }
      const rate = (t.isUnit ? BURN.ship : BURN.bld * (BURNMAT[CV(t.team)] != null ? BURNMAT[CV(t.team)] : 1) * (BD[t.kind].burn || 1)) * B.n;
      t.hp -= rate * dt; t.lastHit = this.t;
      B.tick -= dt;
      if (B.tick <= 0) { B.tick = 0.5; this.fx.push({ k: 'flame', x: t.x + (this.rng() - 0.5) * (t.isBld ? t.size * 0.6 : 0.5), y: t.y - (t.isBld ? 0.2 : 0.5), n: B.n, t: 0.7, max: 0.7 }); }
      if (t.hp <= 0) { t.burn = null; this.burning.delete(t); this.onKilled(t, { team: B.by, isUnit: false }); }
    }
    // ships next to their own port are repaired slowly
    if (this.tickN % 15 === 0) for (const u of this.units) {
      if (u.layer !== 1 || u.hp <= 0 || u.hp >= u.maxHp || this.t - (u.lastHit == null ? -99 : u.lastHit) < HEAL_CALM) continue;
      if (this.buildings.some(b => b.kind === 'port' && b.done && b.team === u.team && rectDist(u.x, u.y, b.rect) <= BURN.portR)) u.hp = Math.min(u.maxHp, u.hp + BURN.portHeal * 0.5);
    }
  }
  /* fire ship: burns everything hostile around it and sinks itself */
  explode(u) {
    const B = UD[u.kind].boom;
    this.unitsNear(u.x, u.y, B.r + 0.5, (o) => {
      if (o.hp <= 0 || o.team === u.team || o.team === 2 || o.layer !== 1 || Math.hypot(o.x - u.x, o.y - u.y) > B.r) return;
      this.damage({ atk: B.dmg * (o.kind === 'frigate' || o.kind === 'flagship' ? B.big || 1 : 1), team: u.team, x: u.x, y: u.y, isUnit: true, kind: u.kind }, o);
      this.ignite(o, u.team); if (o.kind === 'frigate' || o.kind === 'flagship') this.ignite(o, u.team);
    });
    for (const b of this.buildings) if (b.hp > 0 && b.team !== u.team && b.team !== 2 && rectDist(u.x, u.y, b.rect) <= B.r * 0.8) { this.damage({ atk: B.dmg * 0.6, team: u.team, isUnit: true, kind: u.kind }, b); this.ignite(b, u.team); }
    for (let i = 0; i < 10; i++) this.fx.push({ k: 'smoke', x: u.x + (this.rng() - 0.5) * 1.6, y: u.y + (this.rng() - 0.5) * 1.2, vy: -0.7 - this.rng() * 0.8, t: 1.2 + this.rng(), max: 2.2 });
    this.fx.push({ k: 'fire', x: u.x, y: u.y, t: 0.9, max: 0.9 });
    u.hp = 0; this.onKilled(u, null);
  }

  doGather(u, dt) {
    const o = u.order;
    let node = this.byId.get(o.id);
    const info = this.gatherInfo(node);
    const cap = u.carryMax;
    const retarget = () => {
      if (!o.bad) o.bad = new Set();
      const n = this.nearestNode(u.x, u.y, o.type, u.layer, 14, u.team, o.bad);
      if (n) { o.id = n.id; o.s = 'go'; u.path = null; return true; }
      return false;
    };
    if (o.s === 'go' || o.s === 'work') {
      if (!node || node.hp <= 0 || !info || info.amt <= 0) {
        if (node && node.isBld && FIELD[node.kind] && node.hp > 0 && node.food <= 0) {
          // auto-reseed
          const cost = BD[node.kind].cost;
          if (this.canAfford(u.team, cost)) { this.pay(u.team, cost); node.food = BD[node.kind].food; return; }
        }
        if (retarget()) return;
        if (u.carry.amt > 0) { o.s = 'ret'; u.path = null; } else { this.idleOrder(u); }
        return;
      }
    }
    if (o.s === 'go' && this.claimsOf(node) > this.gatherCap(node) && (u.ovr = (u.ovr || 0) - dt) <= 0) {
      u.ovr = 0.5;
      const myD = Math.hypot(u.x - node.x, u.y - node.y);
      let closer = 0;
      for (const w of this.units) if (w !== u && w.hp > 0 && w.order.t === 'gather' && w.order.id === node.id && Math.hypot(w.x - node.x, w.y - node.y) <= myD) closer++;
      if (closer >= this.gatherCap(node)) {
        const alt = this.freeSameKind(node, u.x, u.y, u.team, 12);
        if (alt) { const keep = u.carry; this.orderGather(u, alt); u.carry = keep; return; }
      }
    }
    if (o.s === 'go') {
      const d = rectDist(u.x, u.y, info.rect);
      if (d <= 0.9) { o.s = 'work'; u.path = null; u.gt = 0; this.workSpot(u, node, info.rect); return; }
      if (!u.path) {
        if (u.wait > 0) return;
        const res = this.pathToRect(u, info.rect, 0.85);
        if (!this.setPath(u, res) || (!res.reached && res.path.length === 0)) {
          u.wait = 0.7; if (!o.bad) o.bad = new Set(); o.bad.add(o.id);
          if (!retarget() && u.carry.amt > 0) o.s = 'ret';
          else if (!node || o.bad.has(o.id)) { if (u.carry.amt <= 0 && o.bad.size > 6) this.idleOrder(u); }
          return;
        }
      }
      if (this.stepMove(u, dt)) u.path = null;
    } else if (o.s === 'work') {
      if (rectDist(u.x, u.y, info.rect) > 1.3) { o.s = 'go'; u.path = null; return; }
      u.atkT = 0;
      // step in from the path end to stand right at the resource (or on the farm)
      if (o.wx != null) {
        const dx = o.wx - u.x, dy = o.wy - u.y, dd = Math.hypot(dx, dy), st = u.spd * 0.7 * dt;
        o.wt = (o.wt || 0) + dt;
        if (dd > 0.06 && o.wt < 2.5) {
          const k = Math.min(1, st / dd), nx = u.x + dx * k, ny = u.y + dy * k;
          if (this.walkable(Math.floor(nx), Math.floor(ny), u.layer)) { u.x = nx; u.y = ny; u.moving = true; u.hx = dx / dd; u.hy = dy / dd; if (Math.abs(dx) > 0.02) u.face = dx > 0 ? 1 : -1; return; }
          o.wx = null;
        } else o.wx = null;
      }
      u.working = true;
      const cx = (info.rect.ax + info.rect.bx) / 2 - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
      u.gt += dt * info.rate;
      if (u.gt >= 1) {
        const take = Math.min(Math.floor(u.gt), info.amt, cap - u.carry.amt);
        u.gt -= Math.floor(u.gt);
        if (take > 0) {
          u.carry.type = info.type; u.carry.amt += take;
          if (node.isNode) { node.amt -= take; if (node.amt <= 0) this.removeNode(node); } else node.food -= take;
        }
        if (u.carry.amt >= cap) { o.s = 'ret'; u.path = null; u.working = false; }
      }
    } else if (o.s === 'ret') {
      u.working = false;
      const drop = this.nearestDrop(u, u.carry.type || o.type);
      if (!drop) {
        if (u.team === 0 && this.t - (u.lastNoDrop || -99) > 10) { u.lastNoDrop = this.t; this.msg(u.cls === 'boat' ? 'Build a Trading Port on the shore to unload fish.' : (o.type === 'food' ? 'Build a Granary' : 'Build a Storehouse') + ' or use the Town Centre.'); }
        u.wait = 1; return;
      }
      const d = rectDist(u.x, u.y, drop.rect);
      if (d <= 0.95) {
        const amt = u.carry.amt, type = u.carry.type;
        if (amt > 0) {
          this.res[u.team][type] += amt;
          if (u.team === 0) { this.stats.deposited += amt; if (type === 'wood') this.stats.wood += amt; this.floaters.push({ x: u.x, y: u.y - 0.6, text: '+' + amt, type, t: 1.1 }); }
        }
        u.carry = { type: null, amt: 0 };
        o.s = 'go'; u.path = null;
        return;
      }
      if (!u.path) {
        if (u.wait > 0) return;
        const res = this.pathToRect(u, drop.rect, 0.9);
        if (!this.setPath(u, res)) { u.wait = 0.8; return; }
      }
      if (this.stepMove(u, dt)) u.path = null;
    }
  }

  /* where a gatherer stands while working: inside a farm, or hugging the side of a node it walked up to */
  workSpot(u, node, r) {
    const o = u.order;
    o.wt = 0;
    if (node.isBld) {
      // each farmer gets their own patch of the field: the closest one nobody else is standing on
      const k = node.size / 2, spots = [[0.5, 0.95], [1.5, 1.05], [1.0, 0.45], [1.0, 1.55]].map(([a, b]) => [a * k, b * k]);
      let best = null, bd = 1e9;
      for (const sp of spots) {
        const sx = r.ax + sp[0], sy = r.ay + sp[1];
        let taken = false;
        for (const w of this.units) if (w !== u && w.hp > 0 && w.order.t === 'gather' && w.order.id === node.id && w.order.s === 'work' && w.order.wx != null && Math.hypot(w.order.wx - sx, w.order.wy - sy) < 0.3) { taken = true; break; }
        const d = Math.hypot(u.x - sx, u.y - sy) + (taken ? 100 : 0);
        if (d < bd) { bd = d; best = [sx, sy]; }
      }
      o.wx = best[0]; o.wy = best[1];
      return;
    }
    if (node.kind === 'carcass') {
      const dx = u.x - node.x, dy = u.y - node.y, l = Math.hypot(dx, dy) || 1;
      o.wx = node.x + dx / l * 0.45; o.wy = node.y + dy / l * 0.45;
      return;
    }
    const qx = Math.max(r.ax, Math.min(r.bx, u.x)), qy = Math.max(r.ay, Math.min(r.by, u.y));
    const dx = u.x - qx, dy = u.y - qy, l = Math.hypot(dx, dy);
    if (l < 1e-3) { o.wx = null; return; }
    o.wx = qx + dx / l * 0.22; o.wy = qy + dy / l * 0.22;
  }

  /* repair: a full fix takes 1.5x the build time for one villager (more help, faster) and costs half the
     building's price in wood (at least 25), paid as the work goes */
  doRepair(u, dt) {
    const b = this.byId.get(u.order.id);
    if (!b || b.hp <= 0 || !b.done || b.hp >= b.maxHp) { this.idleOrder(u); return; }
    if (rectDist(u.x, u.y, b.rect) <= 0.95) {
      u.path = null;
      const c = BD[b.kind].cost || {}, perHp = Math.max(b.kind === 'towncentre' ? 300 : 40, (c.wood || 0) + (c.gold || 0)) * 0.5 / b.maxHp, r = this.res[u.team];
      if (r.wood < 1) { u.working = false; if (u.team === 0 && !(u.noWood > 0)) { this.msg('Not enough wood to repair.'); u.noWood = 5; } u.noWood -= dt; return; }
      u.working = true; const cx = b.x - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
      b._bn++; if (b.burn) b.burn.t -= dt * 3;
      const f = Math.pow(Math.max(1, b.nb), -0.3), hp = Math.min(b.maxHp - b.hp, b.maxHp * dt / (Math.max(b.kind === 'towncentre' ? 60 : 20, BD[b.kind].time || 0) * 1.5) * f);
      b.hp += hp; b.rpw = (b.rpw || 0) + hp * perHp;
      if (b.rpw >= 1) { const w = Math.floor(b.rpw); r.wood = Math.max(0, r.wood - w); b.rpw -= w; }
      return;
    }
    u.working = false;
    if (!u.path) { if (u.wait > 0) return; if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; } }
    if (this.stepMove(u, dt)) u.path = null;
  }
  /* knock down your own building: nothing comes back. The Town Centre can't be (losing it loses the game) */
  canDemolish(b) { return b && b.isBld && b.hp > 0 && b.team === 0 && b.kind !== 'towncentre'; }
  demolish(b) {
    if (!this.canDemolish(b)) return false;
    for (let i = 0; i < 14; i++) this.fx.push({ k: 'smoke', x: b.x + (this.rng() - 0.5) * b.size, y: b.y + (this.rng() - 0.5) * b.size, vy: -0.6 - this.rng() * 0.8, t: 1.4 + this.rng(), max: 2.4 });
    this.fx.push({ k: 'rubble', x: b.x, y: b.y, size: b.size, t: 8, max: 8 });
    if (BD[b.kind].site) for (const v of this.villages) if (v.post === b.id) v.post = 0;
    b.hp = 0; this.msg(civName(b.kind, 0) + ' demolished.');
    return true;
  }
  doBuild(u, dt) {
    const o = u.order, b = this.byId.get(o.id);
    if (!b || b.hp <= 0 || b.done) { this.idleOrder(u); return; }
    const d = rectDist(u.x, u.y, b.rect);
    if (d <= 0.95) {
      u.path = null; u.working = true;
      const cx = b.x - u.x; if (Math.abs(cx) > 0.05) u.face = cx > 0 ? 1 : -1;
      b._bn++;
      const base = BD[b.kind].time, f = Math.pow(Math.max(1, b.nb), -0.3);
      const dp = dt / base * f;
      b.progress = Math.min(1, b.progress + dp);
      b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.9 * dp);
      if (b.progress >= 1) this.finishBuilding(b);
      return;
    }
    u.working = false;
    if (!u.path) {
      if (u.wait > 0) return;
      if (!this.setPath(u, this.pathToRect(u, b.rect, 0.85))) { u.wait = 0.8; return; }
    }
    if (this.stepMove(u, dt)) u.path = null;
  }

  separate() {
    const us = this.units;
    for (const u of us) {
      if (u.hp <= 0) continue;
      this.unitsNear(u.x, u.y, 0.6, (o) => {
        if (o === u || o.id < u.id || o.layer !== u.layer) return;
        const dx = o.x - u.x, dy = o.y - u.y, d2 = dx * dx + dy * dy;
        if (d2 > 0.3 * 0.3 * 4 || d2 < 1e-6) { if (d2 < 1e-6) { o.x += 0.02; } return; }
        const d = Math.sqrt(d2), push = (0.6 - d) * 0.18, nx = dx / d, ny = dy / d;
        const uw = u.moving ? 0.35 : 0.65, ow = o.moving ? 0.35 : 0.65, s = uw + ow;
        this.nudge(u, -nx * push * (uw / s) * 2, -ny * push * (uw / s) * 2);
        this.nudge(o, nx * push * (ow / s) * 2, ny * push * (ow / s) * 2);
        // a unit walking into another steps to its own right (or left, once it has been stuck), so head-on pairs slide past
        const side = Math.min(1, (0.6 - d) / 0.3) * 0.06;
        if (u.moving && u.hx * nx + u.hy * ny > 0.3) this.nudge(u, -u.hy * side * u.side, u.hx * side * u.side);
        if (o.moving && -(o.hx * nx + o.hy * ny) > 0.3) this.nudge(o, -o.hy * side * o.side, o.hx * side * o.side);
      });
    }
  }
  nudge(u, dx, dy) {
    const nx = u.x + dx, ny = u.y + dy; this.wt = u.team;
    if (this.walkable(Math.floor(nx), Math.floor(ny), u.layer)) { u.x = nx; u.y = ny; }
  }

  /* gunpowder at the muzzle: a flash, then thick pale smoke billowing forward and drifting up */
  gunFx(u, big) {
    const mx = u.x + u.face * (big ? 0.6 : 0.42), my = u.y - (big ? 0.15 : 0.4);
    this.fx.push({ k: 'spark', sub: 'flash', x: mx, y: my, face: u.face, big, t: big ? 0.14 : 0.09, max: big ? 0.14 : 0.09 });
    for (let i = 0, n = big ? 6 : 3; i < n; i++) this.fx.push({ k: 'smoke', sub: 'gun', x: mx + u.face * (0.1 + i * 0.12) + (this.rng() - 0.5) * 0.2, y: my + (this.rng() - 0.5) * 0.15, vy: -0.25 - this.rng() * 0.3, vx: u.face * (0.2 + this.rng() * 0.3), big, t: (big ? 1.6 : 1.0) + this.rng() * 0.5, max: big ? 2.1 : 1.5 });
  }
  damage(att, tgt, w) {
    let dmg = (w ? w.atk : att.atk) + ((att.bonus && att.bonus[tgt.cls]) || 0);
    if (w && w.kb && tgt.isUnit) dmg += w.kb[tgt.kind] || 0;
    if (w && w.swv && tgt.isUnit && (tgt.cls === 'ship' || tgt.cls === 'boat')) dmg += NAVWPN.swivelCrew;
    if (att.isUnit && att.cls === 'ship' && CV(att.team) === 0 && att.kind !== 'flagship' && this.units.some(f => f.kind === 'flagship' && f.team === att.team && f.hp > 0 && Math.hypot(f.x - att.x, f.y - att.y) < 5)) dmg += 2;
    const rg = w ? w.ranged : att.ranged;
    let arm = tgt.isBld ? (rg ? BARM.pa : BARM.ma) : (rg ? tgt.pa : tgt.ma);
    if (w && tgt.isBld) { if (w.wpn === 'cannon') { arm = 0; dmg *= NAVWPN.cannonBld; } else if (w.swv) arm = Math.floor(arm * NAVWPN.swivelArmCut); }
    const AD = !w && att.isUnit && UD[att.kind];
    if (AD && tgt.isBld) {
      if (AD.civBld) { dmg = AD.civBld[CI(att.team)]; arm = 0; }                                       // cannon
      else if (att.cls === 'archer' && !AD.gun && this.teamAge(att.team) >= 2) dmg += 2;              // fire arrows
    }
    if (AD && AD.gun && tgt.isUnit) {
      arm = Math.max(0, arm - GUN.pierce);
      if (att.cls !== 'siege' && (att.still || 0) >= GUN.stillT) dmg = Math.round(dmg * GUN.still);
    }
    dmg = Math.max(1, dmg - arm);
    if (w && w.fire) this.ignite(tgt, att.team);
    // blowpipe darts: ipoh poison, a little damage over a few seconds that ignores armour (doesn't stack)
    const PD = att.isUnit && UD[att.kind], a3 = PD && PD.cls === 'skirm' && this.teamAge(att.team) >= 3;
    const pz = PD && (PD.poison ? (a3 ? SUMPIT_PSN : PD.poison) : a3 ? SKIRM_PSN : null);
    if (pz && tgt.isUnit && tgt.layer !== 1 && tgt.cls !== 'animal') { tgt.psn = { t: pz.dur, dps: pz.dps }; tgt.psnBy = att.team; }
    tgt.hp -= dmg; tgt.hit = 0.15; tgt.lastHit = this.t;
    if (tgt.isUnit && tgt.cls === 'animal') { tgt.order = { t: 'flee', t0: 3, fx: att.x != null ? att.x : tgt.x, fy: att.y != null ? att.y : tgt.y }; tgt.path = null; }
    if (tgt.team === 0 && att.team === 1 && this.t - this.lastAlert > 5) {
      this.lastAlert = this.t; this.alerts.push({ x: tgt.x, y: tgt.y, t: 3 }); this.msg('We are under attack!');
    }
    if (tgt.isUnit && tgt.cls !== 'vil' && tgt.cls !== 'boat' && tgt.cls !== 'animal' && tgt.cls !== 'healer' && !UD[tgt.kind].trader && att.isUnit && att.hp > 0 && tgt.order.t === 'idle') {
      this.orderAttack(tgt, att, { leash: { x: tgt.x, y: tgt.y, r: 11 } });
    }
    this.fx.push({ k: 'spark', x: tgt.x + (tgt.isBld ? (this.rng() - 0.5) * tgt.size * 0.6 : 0), y: tgt.y - (tgt.isBld ? 0.3 : 0.3), t: 0.25, max: 0.25 });
    if (tgt.hp <= 0) this.onKilled(tgt, att);
    // cannon shot scatters: half damage to the enemy soldiers standing around the one it hit
    if (AD && AD.splash && tgt.isUnit) this.unitsNear(tgt.x, tgt.y, AD.splash + 0.5, (o) => {
      if (o !== tgt && o.hp > 0 && o.team !== att.team && o.team !== 2 && o.layer === tgt.layer && Math.hypot(o.x - tgt.x, o.y - tgt.y) <= AD.splash) this.damage({ atk: Math.round(att.atk * 0.5), team: att.team, x: att.x, y: att.y, isUnit: true, kind: '' }, o);
    });
  }
  onKilled(t, att) {
    if (t.isUnit) {
      if (t.team === 1 && att && att.team === 0) this.stats.kills++;
      if (t.team === 0 && t.kind !== 'raft') this.stats.lost++;
      if (t.cargo && t.cargo.length) {
        if (t.team === 0) { this.stats.lost += t.cargo.length; this.msg(t.cargo.length + ' soldiers went down with the ' + civName(t.kind, 0).split(' (')[0] + '.'); }
        else if (att && att.team === 0) this.stats.kills += t.cargo.length;
        t.cargo = [];
      }
      this.fx.push({ k: 'corpse', x: t.x, y: t.y, face: t.face, kind: t.kind, team: t.team, t: 3, max: 3 });
      if (t.cls === 'animal') {
        const c = this.addNode('carcass', Math.floor(t.x), Math.floor(t.y));
        c.x = t.x; c.y = t.y;
        for (const u of this.units) if (u.hp > 0 && u.order.t === 'attack' && u.order.id === t.id && u.order.hunt) { this.orderGather(u, c); }
      }
    } else if (t.isBld) {
      for (let i = 0; i < 14; i++) this.fx.push({ k: 'smoke', x: t.x + (this.rng() - 0.5) * t.size, y: t.y + (this.rng() - 0.5) * t.size, vy: -0.6 - this.rng() * 0.8, t: 1.4 + this.rng(), max: 2.4 });
      this.fx.push({ k: 'rubble', x: t.x, y: t.y, size: t.size, t: 8, max: 8 });
      if (t.team === 0) { this.msg(civName(t.kind, 0) + ' destroyed!'); }
      if (t.cargo && t.cargo.length) { const keep = t.hp; t.hp = 1; this.ungarrison(t); t.hp = keep; }
      if (BD[t.kind].site) for (const v of this.villages) if (v.post === t.id) v.post = 0;
    }
  }
  msg(text) { this.msgs.push({ text, t: 3.2 }); if (this.msgs.length > 4) this.msgs.shift(); }

  cleanup() {
    let dead = false;
    for (const u of this.units) if (u.hp <= 0 || u.aboard) { dead = true; this.byId.delete(u.id); }
    if (dead) this.units = this.units.filter(u => u.hp > 0 && !u.aboard);
    let bd = false;
    for (const b of this.buildings) if (b.hp <= 0) {
      bd = true; this.byId.delete(b.id);
      for (let y = b.ty; y < b.ty + (b.h || b.size); y++) for (let x = b.tx; x < b.tx + b.size; x++) { this.occ[y * W + x] = 0; this.block[y * W + x] = 0; this.gate[y * W + x] = 0; }
    }
    if (bd) this.buildings = this.buildings.filter(b => b.hp > 0);
    if (this.nodes.some(n => n.hp <= 0)) this.nodes = this.nodes.filter(n => n.hp > 0);
  }
  updateFx(dt) {
    for (const f of this.fx) f.t -= dt;
    this.fx = this.fx.filter(f => f.t > 0);
    for (const a of this.arrows) a.t += dt;
    this.arrows = this.arrows.filter(a => a.t < a.dur);
    for (const f of this.floaters) f.t -= dt;
    this.floaters = this.floaters.filter(f => f.t > 0);
    for (const m of this.msgs) m.t -= dt;
    this.msgs = this.msgs.filter(m => m.t > 0);
    for (const a of this.alerts) a.t -= dt;
    this.alerts = this.alerts.filter(a => a.t > 0);
  }

  updateFog() {
    this.fogV = (this.fogV || 0) + 1;
    this.visible.fill(0);
    const reveal = (x, y, r) => {
      const r2 = r * r, x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(W - 1, Math.ceil(x + r));
      const y0 = Math.max(0, Math.floor(y - r)), y1 = Math.min(H - 1, Math.ceil(y + r));
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
        const dx = tx + 0.5 - x, dy = ty + 0.5 - y;
        if (dx * dx + dy * dy <= r2) { this.visible[ty * W + tx] = 1; this.explored[ty * W + tx] = 1; }
      }
    };
    for (const u of this.units) if (u.team === 0 && u.hp > 0) reveal(u.x, u.y, u.sight);
    for (const b of this.buildings) if (b.team === 0 && b.hp > 0) reveal(b.x, b.y, (BD[b.kind].sight || 4) + (b.done ? 0 : -1));
  }

  checkEnd() {
    const has = (team) => this.buildings.some(b => b.team === team && b.kind === 'towncentre' && b.hp > 0);
    if (!has(1)) this.over = 'win'; else if (!has(0)) this.over = 'lose';
  }

  /* ======================= picking ======================= */
  pick(wx, wy, opts) {
    opts = opts || {};
    let best = null, bd = 0.62;
    for (const u of this.units) {
      if (u.hp <= 0) continue;
      if (u.team !== 0 && !this.isVisible(u.x, u.y)) continue;
      const d = Math.hypot(u.x - wx, u.y - 0.3 - wy); if (d < bd) { bd = d; best = u; }
    }
    if (best) return best;
    const tx = Math.floor(wx), ty = Math.floor(wy);
    for (const b of this.buildings) {
      if (b.hp <= 0) continue;
      if (b.team !== 0 && !this.explored[Math.floor(b.y) * W + Math.floor(b.x)]) continue;
      if (wx >= b.tx - 0.1 && wx < b.tx + b.size + 0.1 && wy >= b.ty + (b.h || b.size) - b.size * 1.45 && wy < b.ty + (b.h || b.size) + 0.1) { if (!best || b.y > best.y) best = b; }
    }
    if (best) return best;
    for (const n of this.nodes) {
      if (n.hp <= 0 || !this.explored[n.ty * W + n.tx]) continue;
      if (n.kind === 'carcass') { if (Math.hypot(n.x - wx, n.y - wy) < 0.7) return n; continue; }
      const top = n.kind === 'tree' ? 1.0 : 0.2;
      if (wx >= n.tx && wx < n.tx + 1 && wy >= n.ty - top && wy < n.ty + 1) { if (!best || n.y > best.y) best = n; }
    }
    return best;
  }

  /* ======================= enemy AI (Majapahit) ======================= */
  aiTick() {
    const D = DIFF[this.diff], ai = this.ai, r = this.res[1], mj = CV(1) === 1;
    const K = mj ? { field: 'sawah', heal: 'patirthan', healer: 'acaraki', elite: 'bhaya', skirm: 'lembing', fire: 'fireship' }
      : CV(1) === AYU_CIV ? { field: 'farm', heal: 'wat', healer: 'mo', elite: 'chang', skirm: 'namai', fire: 'frigate' }
      : { field: 'farm', heal: 'rumahtabib', healer: 'tabib', elite: 'pahlawan', skirm: 'sumpit', fire: 'frigate' };
    const tc = this.buildings.find(b => b.team === 1 && b.kind === 'towncentre' && b.done && b.hp > 0);
    if (!tc) return;
    // ageing up when the hour for this difficulty comes and the court can pay (lore/ages.md)
    const age = this.teamAge(1), nA = age + 1, AT = { easy: [480, 1000, 1600], normal: [330, 760, 1200], hard: [240, 580, 940] }[this.diff];
    const nextA = AGE_TABLE[nA] && nA <= (this.maxAge || AGE_MAX) ? AGE_TABLE[nA] : null;
    if (nextA && !this.aging[1] && this.t > AT[nA - 2]) this.startAge(1);
    const saving = nextA && !this.aging[1] && this.t > AT[nA - 2] - 150;
    const vils = this.units.filter(u => u.team === 1 && u.kind === 'villager' && u.hp > 0);
    const home = this.regionAt(tc.x, tc.y), isl = this.map === 'islands';
    const milAll = this.units.filter(u => u.team === 1 && u.hp > 0 && u.cls !== 'vil' && u.layer !== 1 && !u.aboard);
    const mil = isl ? milAll.filter(u => this.regionAt(u.x, u.y) === home) : milAll;
    const myB = (k) => this.buildings.filter(b => b.team === 1 && b.kind === k && b.hp > 0);
    const pop = this.popOf(1), cap = this.popCap(1);
    const barracks = myB('barracks').filter(b => b.done);
    for (const p of myB('port')) if (p.done && !(p.raftCd > 0) && r.wood >= 120 && this.units.some(o => o.team === 0 && o.hp > 0 && o.layer === 1 && o.kind !== 'raft' && Math.hypot(o.x - p.x, o.y - p.y) < 8)) this.launchRaft(p);

    // 1. train villagers
    const vq = tc.queue.length;
    if (vils.length + vq < D.vil && pop + vq < cap && vq < 2 && this.canAfford(1, this.costOf('villager', 1))) this.queueUnit(tc, 'villager', 1);

    // 2. housing
    const building = this.buildings.filter(b => b.team === 1 && !b.done && b.hp > 0);
    const queued = barracks.reduce((a, b) => a + b.queue.length, 0) + tc.queue.length;
    if (cap < MAXPOP && cap - pop - queued <= 3 && !building.some(b => b.kind === 'house') && r.wood >= BD.house.cost.wood) {
      this.aiBuild('house', tc, vils, 2);
    }
    // 3. barracks
    if (this.t > 55 && vils.length >= 6 && barracks.length + building.filter(b => b.kind === 'barracks').length < (this.t > 330 && this.diff !== 'easy' ? 2 : 1) && r.wood >= BD.barracks.cost.wood) {
      this.aiBuild('barracks', tc, vils, 3);
    }

    // 4. economy: idle villagers
    const counts = { food: 0, wood: 0, gold: 0 };
    for (const v of vils) { if (v.order.t === 'gather') counts[v.order.type]++; }
    const farms = myB(K.field);
    for (const v of vils) {
      if (v.order.t !== 'idle') continue;
      const w = saving && nextA.cost.gold ? { food: 0.4, wood: 0.25, gold: 0.35 } : { food: 0.4, wood: 0.38, gold: 0.22 };
      let pick = 'wood', bs = 1e9;
      for (const k in w) { const s = (counts[k] + 0.5) / w[k]; if (s < bs) { bs = s; pick = k; } }
      if (this.t > 100 && r.food > (saving ? nextA.cost.food + 150 : 400) && pick === 'food') pick = 'wood';
      let n = this.nearestNode(tc.x, tc.y, pick, 0, 30, 1);
      if (pick === 'food' && (!n || Math.hypot(n.x - tc.x, n.y - tc.y) > 16 || n.kind === 'carcass')) {
        const fm = farms.find(f => f.done && f.food > 0);
        if (fm) n = fm;
        else if (!building.some(b => FIELD[b.kind]) && r.wood >= BD[K.field].cost.wood && farms.length < 5) { this.aiBuild(K.field, tc, [v], 1, 3.5, 8); counts.food++; continue; }
      }
      if (!n) { pick = 'wood'; n = this.nearestNode(tc.x, tc.y, 'wood', 0, 40, 1); }
      if (!n) continue;
      // drop-off distance check
      if (n.isNode && (pick === 'wood' || pick === 'gold') && r.wood >= 100) {
        const kind = 'store';
        const near = this.buildings.some(b => b.team === 1 && BD[b.kind].drop && BD[b.kind].drop.includes(pick) && b.kind !== 'towncentre' && Math.hypot(b.x - n.x, b.y - n.y) < 7);
        if (!near && Math.hypot(n.x - tc.x, n.y - tc.y) > 9 && !building.some(b => b.kind === kind)) {
          if (this.aiBuildNear(kind, n, [v])) { counts[pick]++; continue; }
        }
      }
      this.orderGather(v, n); counts[pick]++;
    }

    // 4b. Majapahit buildings: Lumbung by the farms, a Bale Kulkul, the Kraton, a Bandar on a neutral village
    const has = (k) => myB(k).length > 0;
    const late = { easy: 1.4, normal: 1, hard: 0.75 }[this.diff];
    if (farms.length >= 2 && !has('granary') && r.wood >= 100 && !building.length) this.aiBuildNear('granary', farms[0], vils.slice(0, 1));
    // the Kingdom Age needs two of Barracks, Storehouse, Granary and Port: put up whichever is quickest
    if (nA === 2 && nextA && this.t > AT[0] - 200 && !this.ageNeedMet(1, 2) && r.wood >= 100 && !building.length) this.aiBuild(has('granary') ? 'store' : 'granary', tc, vils, 2, 4, 9);
    if (this.t > 200 * late && !has('tower') && r.wood >= 75 && r.gold >= 25 && !building.length) this.aiBuild('tower', tc, vils, 2, 4, 7);
    if (age >= 2 && this.t > 300 * late && !has('palace') && r.wood >= 400 && r.gold >= 200) this.aiBuild('palace', tc, vils, 4, 6, 12);
    if (civOk(BD.tradepost, 1) && age >= 2 && this.t > 360 * late && !has('tradepost') && r.wood >= 150 && r.gold >= 50) {
      const v = this.villages.filter(v => !v.post && v.hp > 0 && (!isl || this.regionAt(v.site.tx + 1, v.site.ty + 1) === home)).sort((a, b) => Math.hypot(a.x - tc.x, a.y - tc.y) - Math.hypot(b.x - tc.x, b.y - tc.y))[0];
      if (v) { const near = vils.slice().sort((p, q) => Math.hypot(p.x - v.x, p.y - v.y) - Math.hypot(q.x - v.x, q.y - v.y)).slice(0, 2); this.placeBuilding(1, 'tradepost', v.site.tx, v.site.ty, near.map(u => u.id)); }
    }

    if (barracks.length && age >= 2 && this.t > 240 * late && !has(K.heal) && r.wood >= BD[K.heal].cost.wood && r.gold >= 50 && !building.length) this.aiBuild(K.heal, tc, vils, 2, 5, 10);
    const pool = myB(K.heal).find(b => b.done);
    if (pool) {
      const heal = mil.filter(m => m.cls === 'healer').length + pool.queue.length;
      if (heal < Math.floor(mil.length / 8) && pop < cap) this.queueUnit(pool, K.healer, 1);
      if (!pool.rally) pool.rally = { x: tc.x - 6, y: tc.y + 2 };
    }

    // 5. train military (Bhayangkara come from the Kraton)
    const milCap = D.milBase + Math.floor(this.t / D.milRate);
    // saving for the next age: keep half the army's worth of training going, hold the rest back
    const hold = saving && !this.canAfford(1, nextA.cost) && mil.length >= Math.floor(milCap / 2);
    const palace = myB('palace').find(b => b.done);
    if (palace && !hold && palace.queue.length < 1 && mil.length < milCap && pop < cap && this.rng() < 0.5) this.queueUnit(palace, K.elite, 1);
    if (palace && !palace.rally) palace.rally = { x: tc.x - 6, y: tc.y + 2 };
    for (const b of barracks) {
      if (hold || b.queue.length >= 2 || mil.length + b.queue.length >= milCap) continue;
      const roll = this.rng(), kind = age >= 3 && roll > 0.9 ? 'cannon' : roll < 0.35 ? 'keris' : roll < 0.6 ? K.skirm : roll < 0.82 ? 'tombak' : lineKind(1, age);
      if (pop + b.queue.length < cap) this.queueUnit(b, kind, 1);
      if (!b.rally) b.rally = { x: tc.x - 6, y: tc.y + 2 };
    }

    // 5b. navy: a port on the southern shore, then swarms of fire ships and jukung perang
    if (this.t > (isl ? 150 : 330) * late && !has('port') && r.wood >= 120) this.aiBuildShore('port', vils);
    const port = myB('port').find(b => b.done);
    // island maps: galleys to carry the army across (two on easy, three otherwise)
    const galleys = this.units.filter(u => u.team === 1 && u.hp > 0 && u.kind === 'galley');
    if (isl && port && galleys.length + port.queue.filter(q => q.kind === 'galley').length < (this.diff === 'easy' ? 2 : 3) && port.queue.length < 2 && pop < cap && this.canAfford(1, this.costOf('galley', 1))) this.queueUnit(port, 'galley', 1);
    if (port) {
      const navy = this.units.filter(u => u.team === 1 && u.hp > 0 && u.cls === 'ship' && u.kind !== 'galley');
      const navCap = Math.min(this.diff === 'easy' ? 4 : 9, 2 + Math.floor((this.t - 300) / 80)) - (isl ? 1 : 0);
      if (port.queue.length < 2 && navy.length + port.queue.length < navCap && pop + port.queue.length < cap) this.queueUnit(port, this.rng() < 0.45 ? K.fire : 'light', 1);
      const idle = navy.filter(u => u.order.t === 'idle' || u.order.t === 'move');
      if (idle.length >= 3 && this.t >= Math.max(ai.navyNext || 0, D.wave0) && age >= 2) {
        const foes = this.buildings.filter(b => b.team === 0 && b.hp > 0 && b.kind === 'port');
        const ships = this.units.filter(u => u.team === 0 && u.hp > 0 && u.layer === 1);
        const goal = foes[0] || ships[0];
        const tc0 = this.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0), ph = this.portHint[0] || { x: 21, y: 31 };
        const gx = goal ? goal.x : tc0 && !isl ? ph.x : ph.x, gy = goal ? goal.y + (goal.isBld ? 2.5 : 0) : ph.y;
        this.groupMove(idle, gx, gy, { amove: true });
        ai.navyNext = this.t + 60;
      }
    }

    // 6. defend the base
    let threat = null;
    this.unitsNear(tc.x, tc.y, 15, (o) => { if (o.team === 0 && o.hp > 0 && !threat) threat = o; });
    if (threat && this.t - ai.defendT > 4) {
      ai.defendT = this.t;
      for (const m of mil) if (m.order.t === 'idle' || m.order.t === 'move') this.orderAMove(m, threat.x, threat.y);
    }

    // 7. launch attack waves (on the islands they go by galley: aiFerry)
    this.aiRetreat(tc);
    if (age < 2 && this.t < ai.next + 300) { /* not before the Kingdom Age (unless it is very late) */ }
    else if (isl) this.aiFerry(mil, milAll, galleys, home, D);
    else if (this.t >= ai.next && !ai.atk) {
      const army = mil.filter(m => (m.order.t === 'idle' || m.order.t === 'move') && m.cls !== 'healer' || m.cls === 'healer' && m.order.t === 'idle');
      const want = D.base + ai.wave * D.grow;
      if (army.length >= want || this.t > ai.next + 120 && army.length >= Math.ceil(want * 0.7)) {
        const targets = this.buildings.filter(b => b.team === 0 && b.hp > 0);
        const goal = targets.find(b => b.kind === 'towncentre') || targets[0];
        if (goal) {
          const gx = goal.x, gy = goal.y;
          const go = army.slice(0, want + 2);
          this.groupMove(go, gx, gy, { amove: true, formation: ai.wave % 2 ? 'wedge' : 'box' });
          ai.atk = { ids: go.map(u => u.id), n: go.length, t0: this.t };
          ai.wave++; ai.next = this.t + D.gap;
        }
      }
    }
  }
  /* Big Islands: board a wave onto the galleys, sail them over and land it by the enemy base; anyone already
     ashore over there marches on the nearest enemy building on that island */
  aiFerry(mil, milAll, galleys, home, D) {
    const ai = this.ai;
    for (const u of milAll) {
      if (this.regionAt(u.x, u.y) === home || (u.order.t !== 'idle' && u.order.t !== 'move')) continue;
      const rg = this.regionAt(u.x, u.y);
      let best = null, bd = 1e9;
      for (const b of this.buildings) if (b.team === 0 && b.hp > 0 && this.regionAt(b.x, b.y) === rg) { const d = Math.hypot(b.x - u.x, b.y - u.y); if (d < bd) { bd = d; best = b; } }
      if (best) this.orderAMove(u, best.x, best.y);
    }
    const f = ai.ferry;
    if (f) {
      const gs = f.gs.map(id => this.byId.get(id)).filter(g => g && g.hp > 0);
      const boarding = mil.some(u => u.order.t === 'board' && f.gs.includes(u.order.id));
      if (!f.sailed && (!boarding || this.t - f.t0 > 50)) {
        const goal = this.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0) || this.buildings.find(b => b.team === 0 && b.hp > 0);
        for (const u of mil) if (u.order.t === 'board') this.idleOrder(u);
        if (goal) for (const g of gs) if (g.cargo && g.cargo.length) this.orderLand(g, goal.x, goal.y);
        f.sailed = this.t;
      }
      if (!gs.some(g => g.cargo && g.cargo.length) && (f.sailed || !gs.length)) ai.ferry = null;
      else if (f.sailed && this.t - f.sailed > 120) ai.ferry = null;
      return;
    }
    if (this.t < ai.next) return;
    const ready = galleys.filter(g => !(g.cargo && g.cargo.length) && (g.order.t === 'idle' || g.order.t === 'move'));
    if (!ready.length) return;
    const army = mil.filter(m => m.order.t === 'idle' || m.order.t === 'move');
    const size = D.base + ai.wave * D.grow, want = Math.min(size, ready.length * UD.galley.troops);
    if (army.length < want && !(this.t > ai.next + 40 && army.length >= 3)) return;
    // fewer, bigger landings: wait a while for enough galleys to carry the whole force
    if (want < Math.min(size, army.length) && this.t < ai.next + 75) return;
    const cx = army.reduce((a, u) => a + u.x, 0) / army.length, cy = army.reduce((a, u) => a + u.y, 0) / army.length;
    const used = [];
    army.slice(0, want).forEach((u, i) => {
      const g = ready[Math.floor(i / UD.galley.troops)]; if (!g) return;
      this.orderBoard(u, g); if (!used.includes(g)) used.push(g);
    });
    for (const g of used) { const w = this.shoreTile(cx, cy, g.x, g.y); if (w) this.orderMove(g, w.x + 0.5, w.y + 0.5); }
    ai.ferry = { gs: used.map(g => g.id), t0: this.t, sailed: 0 };
    ai.atk = { ids: army.slice(0, want).map(u => u.id), n: Math.min(want, army.length), t0: this.t };
    ai.wave++; ai.next = this.t + D.gap;
  }
  /* an attack that has clearly failed comes home: under a third left, or still fighting after 3 minutes */
  aiRetreat(tc) {
    const a = this.ai.atk; if (!a) return;
    const left = a.ids.map(id => this.byId.get(id)).filter(u => u && u.hp > 0);
    const away = left.filter(u => Math.hypot(u.x - tc.x, u.y - tc.y) > 14);
    if (!away.length && this.t - a.t0 > 20) { this.ai.atk = null; return; }
    if (left.length <= a.n / 3 || this.t - a.t0 > 180) {
      for (const u of away) { this.orderMove(u, tc.x - 4 + this.rng() * 3, tc.y + 2 + this.rng() * 3); }
      this.ai.atk = null;
    }
  }
  aiBuild(kind, tc, vils, nBuilders, rmin, rmax) {
    const size = BD[kind].size;
    for (let i = 0; i < 70; i++) {
      const a = this.rng() * 6.283, d = (rmin || 5.5) + this.rng() * ((rmax || 11) - (rmin || 5.5));
      const tx = Math.round(tc.x + Math.cos(a) * d - size / 2), ty = Math.round(tc.y + Math.sin(a) * d - size / 2);
      if (!this.canPlace(kind, tx, ty, 1)) continue;
      const near = vils.slice().sort((p, q) => Math.hypot(p.x - tx, p.y - ty) - Math.hypot(q.x - tx, q.y - ty)).slice(0, nBuilders).map(v => v.id);
      this.placeBuilding(1, kind, tx, ty, near);
      return true;
    }
    return false;
  }
  aiBuildShore(kind, vils) {
    const h = this.portHint[1] || { x: 44, y: 31 }, cx = h.x, cy = h.y;
    for (let r = 0; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || !this.canPlace(kind, cx + dx, cy + dy, 1)) continue;
      const near = vils.slice().sort((p, q) => Math.hypot(p.x - cx, p.y - cy) - Math.hypot(q.x - cx, q.y - cy)).slice(0, 2);
      return this.placeBuilding(1, kind, cx + dx, cy + dy, near.map(v => v.id)).ok;
    }
    return false;
  }
  aiBuildNear(kind, node, vils) {
    const size = BD[kind].size;
    for (let i = 0; i < 40; i++) {
      const a = this.rng() * 6.283, d = 1.8 + this.rng() * 3;
      const tx = Math.round(node.x + Math.cos(a) * d - size / 2), ty = Math.round(node.y + Math.sin(a) * d - size / 2);
      if (!this.canPlace(kind, tx, ty, 1)) continue;
      return this.placeBuilding(1, kind, tx, ty, vils.map(v => v.id)).ok;
    }
    return false;
  }
}
const ORDER_CLS = { spear: 0, sword: 1, elite: 1, vil: 2, archer: 3, healer: 3.5, siege: 3.8, boat: 4, ship: 4, animal: 5 };
const HEAL_CALM = 3;   // a unit hit within the last 3 s can't be healed (no healing mid-fight)
if (typeof module !== 'undefined') module.exports = { Game, UD, BD, NK, W, H, T, STEP, STARTS, rectDist };

