  /* ##### CHAPTER SIM 8 · Building and training #####
     File: src/js/sim/08-building-training.js
     What it does: Where a building may go, laying walls in lines, the build queue, population, and drop-off
     points.
     Things you can tweak:
       - WALL_MAX (chapter 2) limits a wall drag.
       - popCap(): MAXPOP from chapter 1.
     ############################################################################ */
  /* ======================= building / training ======================= */
  canPlace(kind, tx, ty, team) {
    const d = BD[kind];
    if ((kind === 'house' || kind === 'rafthouse') && CV(team) === AYU_CIV && this.isWater(tx, ty)) return this.canFloat(tx, ty, team);
    const dh = d.fh || d.size;
    if (tx < 1 || ty < 1 || tx + d.size > W - 1 || ty + dh > H - 1) return false;
    if (d.site && !this.siteAt(tx, ty)) return false;
    if (this.underPortArt(tx, ty, d.size, dh, kind)) return false;
    if (!d.site) for (let y = ty; y < ty + dh; y++) for (let x = tx; x < tx + d.size; x++) if (this.siteMask[y * W + x]) return false;
    for (let y = ty; y < ty + dh; y++) for (let x = tx; x < tx + d.size; x++) {
      if (!this.freeTile(x, y) && !(d.gate && this.wallPieceAt(x, y, team, true)) && !(this.wetOk && this.wetOk(kind, x, y))) return false;
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
  /* Ayutthaya raft house moored out on the river: the whole 2x2 on water, its edge against the bank
     (a bamboo gangway), and open water on the river side so boats can pass */
  canFloat(tx, ty, team) {
    if (tx < 1 || ty < 1 || tx + 2 > W - 1 || ty + 2 > H - 1) return false;
    for (let y = ty; y < ty + 2; y++) for (let x = tx; x < tx + 2; x++) {
      const i = y * W + x; if (!this.isWater(x, y) || this.occ[i] || this.block[i]) return false;
      if (team === 0 && !this.explored[i]) return false;
    }
    let land = 0, open = 0;
    for (let y = ty - 1; y <= ty + 2; y++) for (let x = tx - 1; x <= tx + 2; x++) {
      if (x >= tx && x < tx + 2 && y >= ty && y < ty + 2) continue;
      if (!this.inb(x, y)) continue;
      if (this.isWater(x, y)) { if (!this.block[y * W + x]) open++; } else if (!this.block[y * W + x]) land++;
    }
    return land >= 2 && open >= 4;
  }
  // an Ayutthaya house set down on the water floats as a raft house; one built on land always stays a house (Iylia, 2026-11-08)
  houseKind(team, tx, ty) { return CV(team) === AYU_CIV && this.isWater(tx, ty) ? 'rafthouse' : 'house'; }
  // how many open water tiles ring a footprint
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
    if (kind === 'house') kind = this.houseKind(team, tx, ty);
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
  // add a unit to a building's training queue
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
  // remove one from the queue and refund it
  cancelQueue(b, idx) {
    if (!b || idx < 0 || idx >= b.queue.length) return;
    const q = b.queue.splice(idx, 1)[0];
    this.refund(b.team, this.costOf(q.kind, b.team));
    if (idx === 0) b.qt = 0;
  }
  // how many people a team has
  popOf(team) { let n = 0; for (const u of this.units) if (u.team === team && u.hp > 0 && u.kind !== 'raft') { n++; if (u.cargo) n += u.cargo.length; } for (const b of this.buildings) if (b.team === team && b.cargo) n += b.cargo.length; return n; }
  // housing limit
  popCap(team) { let c = 0; for (const b of this.buildings) if (b.team === team && b.done && b.hp > 0) c += BD[b.kind].pop || 0; return Math.min(CV(team) === AYU_CIV ? 120 : MAXPOP, c); }
  // buildings that take a resource
  dropOffs(team, type, layer) {
    return this.buildings.filter(b => b.team === team && b.done && b.hp > 0 && BD[b.kind].drop && BD[b.kind].drop.includes(type) &&
      (layer === 1 ? b.kind === 'port' : b.kind !== 'port'));
  }
  // nearest drop-off for a resource
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
  // how many villagers are on a resource
  claimsOf(n) { return this.claims.get(n.id) || 0; }
  // recount villagers per resource
  countClaims() {
    this.claims.clear();
    for (const u of this.units) if (u.hp > 0 && u.order.t === 'gather') this.claims.set(u.order.id, (this.claims.get(u.order.id) || 0) + 1);
  }
  // set where new units walk to
  setRally(b, x, y, target) {
    b.rally = target && (this.gatherInfo(target) || (target.kind === 'tradepost' && target.team === b.team)) ? { id: target.id } : { x, y };
  }

