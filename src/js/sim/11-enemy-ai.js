  /* ##### CHAPTER SIM 11 · What you tapped, and the enemy AI #####
     File: src/js/sim/11-enemy-ai.js
     What it does: pick() finds what is under your finger. aiTick() is the computer player: it gathers, builds,
     trains, ages up, attacks and retreats.
     Things you can tweak:
       - DIFF (chapter 3) is the safest place to change the AI.
       - aiRetreat(): when a beaten attack falls back.
     ############################################################################ */
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
      : CV(1) === KHM_CIV ? { field: 'farm', heal: 'rumahtabib', healer: 'tabib', elite: 'bal', skirm: 'tombak', fire: 'frigate' }
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
    // Khmer: a Baray beside the Town Centre once the farms are going
    if (CV(1) === KHM_CIV && age >= 2 && this.t > 280 * late && !has('baray') && r.wood >= 200 && r.gold >= 80 && !building.length) this.aiBuild('baray', tc, vils, 3, 5, 9);
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
      const roll = this.rng(), kind = CV(1) === KHM_CIV && age >= 2 && roll > 0.88 ? 'kcart' : age >= 3 && roll > 0.9 ? 'cannon' : roll < 0.35 ? 'keris' : roll < 0.6 ? K.skirm : roll < 0.82 ? 'tombak' : lineKind(1, age);
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
    for (const g of used) { const w = this.shoreTile(cx, cy, g.x, g.y, g); if (w) this.orderMove(g, w.x + 0.5, w.y + 0.5); }
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
  // AI places a building near its Town Centre
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
  // AI places a port on the coast
  aiBuildShore(kind, vils) {
    const h = this.portHint[1] || { x: 44, y: 31 }, cx = h.x, cy = h.y;
    for (let r = 0; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || !this.canPlace(kind, cx + dx, cy + dy, 1)) continue;
      const near = vils.slice().sort((p, q) => Math.hypot(p.x - cx, p.y - cy) - Math.hypot(q.x - cx, q.y - cy)).slice(0, 2);
      return this.placeBuilding(1, kind, cx + dx, cy + dy, near.map(v => v.id)).ok;
    }
    return false;
  }
  // AI places a drop-off near resources
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

