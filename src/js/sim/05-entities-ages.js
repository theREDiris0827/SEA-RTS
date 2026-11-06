  /* ##### CHAPTER SIM 5 · Units, costs and ages #####
     File: src/js/sim/05-entities-ages.js
     What it does: Adding units and buildings, working out prices (costOf), what a building can train, and
     climbing the ages.
     Things you can tweak:
       - costOf(): where civ discounts are applied.
       - applyAge(): what happens when an age finishes.
     ############################################################################ */
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
  // a unit's civ name
  unitName(u) { return civName(u.kind, u.team); }
  // price of a unit or building after civ discounts (MEL_LEVY, TEAMMOD)
  costOf(kind, team) {
    const base = UD[kind] ? UD[kind].cost : BD[kind].cost, o = {};
    const m = UD[kind] && CV(team) === 1 ? TEAMMOD[1].cost * (UD[kind].layer ? NAVMOD.cost : 1)
      : UD[kind] && CV(team) === 0 && !UD[kind].layer && kind !== 'villager' ? MEL_LEVY : 1;   // Melaka kerah: chiefs call up cheap levies
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
  // how many of a kind a team has
  countOf(team, kind) {
    let n = 0;
    for (const u of this.units) if (u.team === team && u.hp > 0 && u.kind === kind) n++;
    for (const b of this.buildings) if (b.team === team && b.hp > 0) { if (b.kind === kind) n++; for (const q of b.queue) if (q.kind === kind) n++; }
    return n;
  }
  // enough resources?
  canAfford(team, cost) { const r = this.res[team]; for (const k in cost) if (r[k] < cost[k]) return false; return true; }
  // take the cost
  pay(team, cost) { const r = this.res[team]; for (const k in cost) r[k] -= cost[k]; }
  // give the cost back
  refund(team, cost) { const r = this.res[team]; for (const k in cost) r[k] += cost[k]; }

  /* ======================= ages ======================= */
  teamAge(team) { return this.age ? this.age[team] || 1 : AGE_MAX; }
  // what the next age still needs, as text
  ageText(team, n) {
    const N = AGE_TABLE[n] && AGE_TABLE[n].need; if (!N) return '';
    if (N.all) return (CV(team) === AYU_CIV ? N.ayu : N.all).map(k => civName(k, team)).join(' and ');
    return N.n + ' of: ' + N.any.filter(k => civOk(BD[k], team)).map(k => civName(k, team)).join(', ');
  }
  // are the next age's needed buildings built?
  ageNeedMet(team, n) {
    const A = AGE_TABLE[n]; if (!A || !A.need) return true;
    const have = (k) => this.buildings.some(b => b.team === team && b.kind === k && b.done && b.hp > 0);
    if (A.need.all) return (CV(team) === AYU_CIV ? A.need.ayu : A.need.all).every(have);
    return A.need.any.filter(have).length >= A.need.n;
  }
  // begin researching the next age
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
  // stop an age-up and refund it
  cancelAge(team) {
    const a = this.aging && this.aging[team == null ? 0 : team]; if (!a) return;
    this.refund(team || 0, AGE_TABLE[a.to].cost); this.aging[team || 0] = null;
    if (!team) this.msg('Advancing to the next age is called off.');
  }
  // count down age research
  ageTick(dt) {
    for (let t = 0; t < 2; t++) {
      const a = this.aging[t]; if (!a) continue;
      a.left -= dt; if (a.left <= 0) { this.aging[t] = null; this.applyAge(t, a.to); }
    }
  }
  // finish an age-up: Town Centre hp, unit looks, unlocks
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

  // add a building to the map
  addBuilding(kind, team, tx, ty, done) {
    const d = BD[kind], hp = d.civHp ? d.civHp[CI(team)] || d.civHp[0] : d.hp;
    const b = {
      id: this.nextId++, isBld: true, kind, team, tx, ty, size: d.size, h: d.fh || d.size, x: tx + d.size / 2, y: ty + (d.fh || d.size) / 2,
      maxHp: hp, hp: done ? hp : Math.round(hp * 0.1), done: !!done, progress: done ? 1 : 0,
      queue: [], qt: 0, rally: null, food: d.food || 0, cd: 0, nb: 0, _bn: 0, hit: 0, stall: false
    };
    b.rect = rectOfTiles(tx, ty, d.size, b.h);
    if (kind === 'rafthouse' && this.isWater(tx, ty)) b.float = 1;   // moored out on the river
    for (let y = ty; y < ty + b.h; y++) for (let x = tx; x < tx + d.size; x++) {
      this.occ[y * W + x] = 1; if (d.gate) this.gate[y * W + x] = team + 1; else if (!d.walk) this.block[y * W + x] = 1;
    }
    this.buildings.push(b); this.byId.set(b.id, b);
    if (!d.walk && !d.gate) this.evict(b);
    return b;
  }
  // push units off a new building's tiles
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
  // can a unit stand on this tile?
  walkable(x, y, layer) {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const i = y * W + x; if (this.block[i]) return false;
    if (this.gate[i] && this.gate[i] - 1 !== this.wt) return false;
    const t = this.terrain[i];
    return layer === 1 ? (t === T.SHALLOW || t === T.DEEP) : t <= T.SAND;
  }
  // the closest empty tile
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

  // is another unit close to this spot?
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

