  /* ##### CHAPTER SIM 6 · Finding the way #####
     File: src/js/sim/06-paths-and-searching.js
     What it does: A* pathfinding, straight-line checks, and quick searches like "nearest enemy" or "units near
     here".
     Things you can tweak:
       - Mostly leave alone. nearestEnemy() decides what idle soldiers notice.
     ############################################################################ */
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
  // straight line clear between two points?
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
  // straighten a path so units don't zig-zag
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
  // find a path to a spot
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
  // give a unit its new path
  setPath(u, res) {
    if (!res) { u.path = null; return false; }
    u.path = res.path; u.pi = 0; u.pr = res.reached; return true;
  }
  // move a unit along its path for one tick
  stepMove(u, dt) {
    if (!u.path || u.pi >= u.path.length) { u.moving = false; return true; }
    let rem = u.spd * dt;
    // wading through shallow water is slower
    if (u.layer !== 1 && this.terrain[Math.floor(u.y) * W + Math.floor(u.x)] === T.SHALLOW && (typeof wadeOn === 'function' && wadeOn())) rem *= 0.55;
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
  // all units within a radius (fast grid lookup)
  unitsNear(x, y, r, fn) {
    const c0 = Math.max(0, Math.floor((x - r) / this.cell)), c1 = Math.min(this.cw - 1, Math.floor((x + r) / this.cell));
    const r0 = Math.max(0, Math.floor((y - r) / this.cell)), r1 = Math.min(this.ch - 1, Math.floor((y + r) / this.cell));
    for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) {
      const l = this.hash[cy * this.cw + cx];
      for (let i = 0; i < l.length; i++) fn(l[i]);
    }
  }
  // is this spot out of the fog?
  isVisible(x, y) { const i = Math.floor(y) * W + Math.floor(x); return this.visible[i] === 1; }
  // the closest enemy a unit can see
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

