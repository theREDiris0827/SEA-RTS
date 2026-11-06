  /* ##### CHAPTER SIM 7 · Orders #####
     File: src/js/sim/07-orders.js
     What it does: What happens when you tap: gather, attack, board a ship, land, shelter in the Town Centre
     (town bell), trade, move in formation.
     Things you can tweak:
       - BD.towncentre.garrison / BD.tower.garrison (chapter 2): how many villagers shelter.
       - groupMove(): spacing of formations.
     ############################################################################ */
  /* ======================= orders ======================= */
  idleOrder(u) { u.order = { t: 'idle', hx: u.x, hy: u.y }; u.path = null; u.moving = false; }
  // what a target gives and how fast, if it can be gathered
  gatherInfo(o) {
    if (!o) return null;
    if (o.isNode) return { type: o.type, amt: o.amt, rate: NK[o.kind].rate, rect: o.rect };
    if (o.isBld && FIELD[o.kind] && o.done) return { type: 'food', amt: o.food, rate: FARM_RATE * (BD[o.kind].rate || 1), rect: o.rect };
    return null;
  }
  // send a villager to gather
  orderGather(u, target) {
    const gi = this.gatherInfo(target); if (!gi) return false;
    if (target.kind === 'fish' ? u.cls !== 'boat' : u.cls === 'boat') return false;
    if (u.carry.type && u.carry.type !== gi.type) u.carry = { type: null, amt: 0 };
    if (u.order.t === 'gather') this.claims.set(u.order.id, Math.max(0, (this.claims.get(u.order.id) || 0) - 1));
    this.claims.set(target.id, (this.claims.get(target.id) || 0) + 1);
    u.order = { t: 'gather', id: target.id, type: gi.type, s: 'go' }; u.path = null; u.wait = 0;
    return true;
  }
  // send a unit to attack
  orderAttack(u, target, extra) {
    if (u.isUnit && !u.atk && UD[u.kind].trader) { this.idleOrder(u); return; }
    u.order = Object.assign({ t: 'attack', id: target.id }, extra || {}); u.path = null; u.rp = 0;
  }
  // send a unit onto a ship
  orderBoard(u, g) { u.order = { t: 'board', id: g.id }; u.path = null; u.wait = 0; u.rp = 0; }
  /* garrison: villagers shelter in a Town Centre (15) or tower (5); each one inside adds an arrow */
  roomIn(b) { const d = BD[b.kind]; return b.done && b.hp > 0 && d.garrison ? d.garrison - (b.cargo || []).length : 0; }
  // send a villager to shelter in a building
  orderGarrison(u, b, back) { u.order = { t: 'garrison', id: b.id, back: back || null }; u.path = null; u.wait = 0; u.rp = 0; }
  // walk to the shelter and go inside
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
  // nearest building with room to shelter
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
  // let sheltered villagers out
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
  // end the town bell: everyone back to work
  allClear(team) {
    let n = 0;
    for (const b of this.buildings) if (b.team === team) n += this.ungarrison(b);
    for (const u of this.units) if (u.team === team && u.order.t === 'garrison') { const o = u.order.back; this.idleOrder(u); if (o && o.t === 'gather' && this.byId.get(o.id)) this.orderGather(u, this.byId.get(o.id)); }
    if (this.bell) this.bell[team] = false;
    return n;
  }
  // send a loaded ship to a beach
  orderLand(g, x, y) { g.order = { t: 'land', x, y }; g.path = null; g.wait = 0; }
  /* the water tile next to a beach nearest (x, y), leaning towards (bx, by) */
  shoreTile(x, y, bx, by, ship) {
    let best = null, bd = 1e9;
    // only water the ship can sail to (a river or lake cut off from its sea is no use)
    const reach = ship ? this.waterReach(ship) : null;
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
      if (!this.walkable(tx, ty, 1) || (reach && !reach[ty * W + tx])) continue;
      let beach = false;
      for (let dy = -1; dy <= 1 && !beach; dy++) for (let dx = -1; dx <= 1; dx++) if (this.walkable(tx + dx, ty + dy, 0)) { beach = true; break; }
      if (!beach) continue;
      const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y) + (bx != null ? Math.hypot(tx + 0.5 - bx, ty + 0.5 - by) * 0.15 : 0);
      if (d < bd) { bd = d; best = { x: tx, y: ty }; }
    }
    return best;
  }
  /* every water tile a ship can sail to from where it is */
  waterReach(ship) {
    const seen = new Uint8Array(W * H), sx = Math.floor(ship.x), sy = Math.floor(ship.y), q = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = sx + dx, y = sy + dy; if (this.inb(x, y) && this.walkable(x, y, 1) && !seen[y * W + x]) { seen[y * W + x] = 1; q.push(y * W + x); } }
    for (let k = 0; k < q.length; k++) {
      const c = q[k], cx = c % W, cy = (c / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = cx + dx, y = cy + dy, j = y * W + x;
        if (!this.inb(x, y) || seen[j] || !this.walkable(x, y, 1)) continue;
        seen[j] = 1; q.push(j);
      }
    }
    return seen;
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
      const w = this.shoreTile(o.x, o.y, null, null, g);
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
  // start a trade ship's route
  orderTrade(u, post) { u.order = { t: 'trade', post: post.id, s: 'out' }; u.path = null; u.wait = 0; }
  // send a villager to build
  orderBuild(u, b) { u.order = { t: 'build', id: b.id }; u.path = null; u.wait = 0; }
  // plain move
  orderMove(u, x, y) { u.order = { t: 'move', x, y }; u.path = null; u.wait = 0; }
  // attack-move (fight anything on the way)
  orderAMove(u, x, y) { u.order = { t: 'amove', x, y }; u.path = null; u.wait = 0; }

  /* group order from the player (or the AI). ids -> units owned by `team` */
  command(ids, wx, wy, target, opts) {
    opts = opts || {};
    let us = ids.map(id => this.byId.get(id)).filter(u => u && u.isUnit && u.hp > 0 && (u.team === 0 || opts.any));
    if (!us.length) return;
    // a galley with troops aboard, sent to a beach, lands them
    const landing = us.filter(u => u.cargo && u.cargo.length);
    // a tree, bush or gold mine on the beach counts as the beach; only an enemy to fight stops the landing
    if (landing.length && this.isLand(Math.floor(wx), Math.floor(wy)) && !(target && target.hp > 0 && (target.isUnit || target.isBld) && target.team !== landing[0].team && target.team !== 2)) {
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
          const w = this.shoreTile(cx, cy, target.x, target.y, target); if (w) this.orderMove(target, w.x + 0.5, w.y + 0.5);
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

  // move a group in formation
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

