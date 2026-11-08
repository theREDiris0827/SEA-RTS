  /* ##### CHAPTER SIM 10 · Gathering, repairing, damage #####
     File: src/js/sim/10-gather-repair-damage.js
     What it does: Villagers gathering and carrying, repairing and demolishing, building, units pushing apart,
     and the damage formula. Also fog of war and the win/lose check.
     Things you can tweak:
       - damage(): the damage formula (attack + bonus - armour).
       - doRepair(): repair cost and speed.
     ############################################################################ */
  // villager gathers, carries the load to a drop-off, and goes back
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
          if (node.isNode) { node.amt -= take; if (node.amt <= 0) this.removeNode(node); } else if (!FARM_ENDLESS) node.food -= take;
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
  // take down your own building
  demolish(b) {
    if (!this.canDemolish(b)) return false;
    for (let i = 0; i < 14; i++) this.fx.push({ k: 'smoke', x: b.x + (this.rng() - 0.5) * b.size, y: b.y + (this.rng() - 0.5) * b.size, vy: -0.6 - this.rng() * 0.8, t: 1.4 + this.rng(), max: 2.4 });
    this.fx.push({ k: 'rubble', x: b.x, y: b.y, size: b.size, t: 8, max: 8 });
    if (BD[b.kind].site) for (const v of this.villages) if (v.post === b.id) v.post = 0;
    b.hp = 0; this.msg(civName(b.kind, 0) + ' demolished.');
    return true;
  }
  // villager builds
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

  // push units apart so they don't stack
  separate() {
    const us = this.units;
    // a woman fishing from her raft house's deck is out of everyone's way
    const deck = (v) => v.order.t === 'fishhouse' && v.order.deck;
    for (const u of us) {
      if (u.hp <= 0 || deck(u)) continue;
      this.unitsNear(u.x, u.y, 0.6, (o) => {
        if (o === u || o.id < u.id || o.layer !== u.layer || deck(o)) return;
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
  // small push for one unit
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
  // the damage formula: attack + bonus - armour
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
    if (tgt.isUnit && tgt.cls !== 'vil' && tgt.cls !== 'boat' && tgt.cls !== 'animal' && tgt.cls !== 'healer' && !UD[tgt.kind].trader && att.isUnit && att.hp > 0 && (tgt.order.t === 'idle' || tgt.order.t === 'move' && tgt.order.ret && Math.hypot(att.x - tgt.order.ret.x, att.y - tgt.order.ret.y) <= tgt.order.ret.r)) {
      this.orderAttack(tgt, att, this.guardOrder(tgt, tgt.order.ret));
    }
    this.fx.push({ k: 'spark', x: tgt.x + (tgt.isBld ? (this.rng() - 0.5) * tgt.size * 0.6 : 0), y: tgt.y - (tgt.isBld ? 0.3 : 0.3), t: 0.25, max: 0.25 });
    if (tgt.hp <= 0) this.onKilled(tgt, att);
    // cannon shot scatters: half damage to the enemy soldiers standing around the one it hit
    if (AD && AD.splash && tgt.isUnit) this.unitsNear(tgt.x, tgt.y, AD.splash + 0.5, (o) => {
      if (o !== tgt && o.hp > 0 && o.team !== att.team && o.team !== 2 && o.layer === tgt.layer && Math.hypot(o.x - tgt.x, o.y - tgt.y) <= AD.splash) this.damage({ atk: Math.round(att.atk * 0.5), team: att.team, x: att.x, y: att.y, isUnit: true, kind: '' }, o);
    });
  }
  // something died: score, loot, messages
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
  // show a short message
  msg(text) { this.msgs.push({ text, t: 3.2 }); if (this.msgs.length > 4) this.msgs.shift(); }

  // remove the dead
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
  // age out effects
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

  // recompute what each side can see
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

  // win or lose?
  checkEnd() {
    const has = (team) => this.buildings.some(b => b.team === team && b.kind === 'towncentre' && b.hp > 0);
    if (!has(1)) this.over = 'win'; else if (!has(0)) this.over = 'lose';
  }

