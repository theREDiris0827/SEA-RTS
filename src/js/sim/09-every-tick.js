  /* ##### CHAPTER SIM 9 · Every tick: buildings, soldiers, fire #####
     File: src/js/sim/09-every-tick.js
     What it does: Runs 30 times a second: buildings train and heal, soldiers pick fights by stance, healers
     heal, ships shoot, buildings burn.
     Things you can tweak:
       - guardOrder(): how far Defensive soldiers chase (r: 11 tiles).
       - fireOn(): who sets buildings alight and how often (archers 20% from Age 2).
       - BURN (chapter 2) for fire strength.
     ############################################################################ */
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
    // once she is on the deck she stays there (o.deck), even if someone brushes past on the bank
    if (rectDist(u.x, u.y, b.rect) <= (u.order.deck ? 1.5 : 0.95)) {
      u.path = null; u.working = true; u.order.deck = 1;
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
  // Ayutthaya households pay food
  householdTick() {
    for (const team of [0, 1]) {
      if (CV(team) !== AYU_CIV) continue;
      const hs = this.households(team); if (!hs.length) continue;
      this.res[team].food += hs.length * HOUSEHOLD.food;
      if (team === 0) for (const h of hs) this.floaters.push({ x: h.x, y: h.y - 1.4, text: '+' + HOUSEHOLD.food + ' food', type: 'food', t: 1.4 });
    }
  }

  // one tick for a building: build, train, shoot, heal
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

  // a building is finished
  finishBuilding(b) {
    b.done = true; b.progress = 1; b.hp = b.maxHp;
    if (b.team === 0) this.msg(civName(b.kind, 0) + ' complete.');
    for (const u of this.units) {
      if (u.hp <= 0 || u.order.t !== 'build' || u.order.id !== b.id) continue;
      this.idleOrder(u);
      if (b.kind === 'store') {
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

  // one tick for a unit: cooldowns, then its current order
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

  // what an idle unit does (look for enemies by stance)
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
    const st = u.stance || 'def';
    if (st === 'hold') { const t = this.nearestEnemy(u, u.rng + 0.6); if (t) this.orderAttack(u, t, { hold: true }); return; }
    const t = this.nearestEnemy(u, u.sight);
    if (t) this.orderAttack(u, t, this.guardOrder(u));
  }
  /* stances: 'agg' chases whatever it sees, 'def' (default) chases up to 11 tiles from its post then walks back, 'hold' never moves */
  guardOrder(u, home) { const st = u.stance || 'def'; return st === 'agg' ? { agg: true } : st === 'hold' ? { hold: true } : { leash: home || { x: u.x, y: u.y, r: 11 } }; }
  /* walk back to the post; a soldier hit on the way fights back instead of ignoring it */
  orderReturn(u, l) { u.order = { t: 'move', x: l.x, y: l.y, ret: l }; u.path = null; u.wait = 0; }
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
  // attack-move step
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
  // chase and hit a target
  doAttack(u, dt) {
    const o = u.order, t = this.byId.get(o.id);
    const done = () => {
      if (o.then) { u.order = o.then; u.path = null; return; }
      if (o.amove) { u.order = { t: 'amove', x: o.amove.x, y: o.amove.y }; u.path = null; return; }
      // still enemies about? take the next one (inside the leash) before walking home
      if ((o.leash || o.agg || u.stance === 'agg') && u.cls !== 'vil' && !o.hunt) {
        const n = this.nearestEnemy(u, u.sight);
        if (n && n.id !== o.id && (!o.leash || Math.hypot(n.x - o.leash.x, n.y - o.leash.y) <= o.leash.r)) { this.orderAttack(u, n, o.leash ? { leash: o.leash } : { agg: true }); return; }
      }
      if (o.leash) this.orderReturn(u, o.leash); else this.idleOrder(u);
      u.path = null;
    };
    if (!t || t.hp <= 0 || (t.isUnit && t.team === 0 && u.team === 0)) { done(); return; }
    if (u.team === 0 && t.isUnit && t.team !== 2 && !this.isVisible(t.x, t.y)) { done(); return; }
    if (o.leash && Math.hypot(u.x - o.leash.x, u.y - o.leash.y) > o.leash.r) { this.orderReturn(u, o.leash); return; }
    const rect = t.isUnit ? { ax: t.x, ay: t.y, bx: t.x, by: t.y } : t.rect;
    const D = UD[u.kind], board = D.wpn === 'board', secOnly = board && D.sec && (t.isBld || t.layer !== 1);
    const reach = (secOnly ? D.sec.rng : u.rng) + (t.isUnit ? 0.35 : 0);
    const dist = rectDist(u.x, u.y, rect);
    if (o.hold && dist > reach) { done(); return; }
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
  // animals wander
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
  // animals run from hunters
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
  // heal one unit
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
  // healer walks to and heals a target
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
  // burning buildings and ships lose hp
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

