/* ##### CHAPTER EXTRA 10 · Computer-player fixes #####
   File: src/js/extras/10-ai-fixes.js
   What it does: Add-on from the overnight computer-vs-computer test of v0.9.49 (Game demos thread):
     - Big Islands: a loaded galley left idle lands its troops again, and the port builds galleys first when it is short.
     - Economy: now and then one villager moves from the fullest stock to the emptiest (no more wood piles and no food).
     - Ages: when the next age is due and unaffordable, it stops training past a home guard until it can pay.
     - Trade ships with no water route to the trading post give up (the player gets a message too).
   Things you can tweak:
     - AIFIX.every, rich, poor: how often it checks and when one stock counts as too full or too empty.
     - AIFIX.farms (4), AIFIX.tradeStuck (25 s), AIFIX.ageArmy (4).
     - AIFIX.ageAt copies the AT table in aiTick (age times by difficulty): keep the two in step.
   ############################################################################ */
(function () {
  const AIFIX = {
    every: 10,          // s between economy checks
    rich: 500, poor: 120,   // move a villager when one stock is above `rich` while another is under `poor`
    farms: 4,           // the AI keeps building fields up to this many while food is short
    tradeStuck: 25,     // s a trade ship may sit still on its way before the route is called off
    ageAt: { easy: [480, 1000, 1600], normal: [330, 760, 1200], hard: [240, 580, 940] },   // same hours as aiTick
    ageArmy: 4          // while saving for an age that is due, the AI keeps an army of DIFF.base + this and trains no more
  };
  window.AIFIX = AIFIX;
  const T1 = 1;
  const _ai = Game.prototype.aiTick;
  Game.prototype.aiTick = function () {
    try { aiFix(this); } catch (e) { if (!this._aifErr) { this._aifErr = 1; console.warn('ai fixes', e); } }
    return _ai.apply(this, arguments);
  };
  function aiFix(g) {
    const ai = g.ai, tc = g.buildings.find(b => b.team === T1 && b.kind === 'towncentre' && b.done && b.hp > 0); if (!tc) return;
    /* 1. Big Islands: a loaded galley left idle (its landing was called off or timed out) used to sit there for the
          rest of the game, and the AI never ferried again. Send it in again. */
    if (g.map === 'islands' && g.t - (ai.fxLand || -99) > 8) {
      ai.fxLand = g.t;
      const inFerry = ai.ferry ? ai.ferry.gs : [];
      const goal = g.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0) || g.buildings.find(b => b.team === 0 && b.hp > 0);
      if (goal) for (const s of g.units) if (s.team === T1 && s.hp > 0 && s.kind === 'galley' && s.cargo && s.cargo.length && s.order.t === 'idle' && !inFerry.includes(s.id)) g.orderLand(s, goal.x, goal.y);
    }
    /* 2. Economy: villagers only changed job when their tree or mine ran out, so the AI could sit on thousands of wood
          with no food and stop training. Now and then move one villager from the fullest stock to the emptiest. */
    if (g.t - (ai.fxEco || 0) < AIFIX.every) return; ai.fxEco = g.t;
    const r = g.res[T1], vils = g.units.filter(u => u.team === T1 && u.kind === 'villager' && u.hp > 0);
    const keys = ['food', 'wood', 'gold'], lo = keys.slice().sort((a, b) => r[a] - r[b])[0], hi = keys.slice().sort((a, b) => r[b] - r[a])[0];
    if (r[lo] >= AIFIX.poor || r[hi] <= AIFIX.rich || lo === hi) return;
    const from = vils.filter(v => v.order.t === 'gather' && v.order.type === hi), on = vils.filter(v => v.order.t === 'gather' && v.order.type === lo);
    if (from.length <= 2 || on.length >= Math.ceil(vils.length * 0.6)) return;
    const v = from[0];
    let n = null;
    if (lo === 'food') {
      const kf = CV(T1) === 1 ? 'sawah' : 'farm';
      const fields = g.buildings.filter(b => b.team === T1 && FIELD[b.kind] && b.hp > 0);
      const workers = (f) => vils.filter(o => o.order.t === 'gather' && o.order.id === f.id).length;
      n = g.nearestNode(tc.x, tc.y, 'food', 0, 16, T1);
      if (n && n.kind === 'carcass') n = null;
      if (!n) {
        const free = fields.filter(f => f.done && workers(f) === 0)[0];
        if (free) n = free;
        else if (fields.length < AIFIX.farms && !fields.some(f => !f.done) && r.wood >= BD[kf].cost.wood) { g.aiBuild(kf, tc, [v], 1, 3.5, 8); return; }
        else n = fields.filter(f => f.done).sort((a, b) => workers(a) - workers(b))[0];
      }
    } else n = g.nearestNode(tc.x, tc.y, lo, 0, 30, T1);
    if (n) g.orderGather(v, n);
  }
  /* 3. Big Islands: fire ships and sloops used up the wood, so sunk galleys were never replaced and the landings stopped.
        While the AI is short of galleys, its port builds nothing else. */
  const _q = Game.prototype.queueUnit;
  Game.prototype.queueUnit = function (b, kind, team) {
    if (team === T1 && b && b.kind === 'port' && this.ai) {
      if (this.map === 'islands' && kind !== 'galley' && UD[kind].cls === 'ship') {
        const need = this.diff === 'easy' ? 2 : 3;
        const have = this.units.filter(u => u.team === T1 && u.hp > 0 && u.kind === 'galley').length + this.buildings.reduce((a, p) => a + (p.team === T1 && p.kind === 'port' && p.hp > 0 ? p.queue.filter(q => q.kind === 'galley').length : 0), 0);
        if (have < need && this.t > 300) return 'Saving for galleys.';
      }
      if (kind === 'trade' && this.ai.noSea) return 'No sea route.';
    }
    /* 5. Ages: once food stopped piling up, the AI spent it all on soldiers and reached the later ages less often.
          When the next age is due and it cannot pay yet, it stops training past a home guard until it can. */
    if (team === T1 && b && (b.kind === 'barracks' || b.kind === 'palace') && this.ai && !this.M) {
      const nA = this.teamAge(T1) + 1, nx = AGE_TABLE[nA] && nA <= (this.maxAge || AGE_MAX) ? AGE_TABLE[nA] : null;
      if (nx && !this.aging[T1] && this.t > AIFIX.ageAt[this.diff][nA - 2] && this.ageNeedMet(T1, nA) && !this.canAfford(T1, nx.cost)) {
        const army = this.units.filter(u => u.team === T1 && u.hp > 0 && u.cls !== 'vil' && u.layer !== 1).length;
        const foe = this.units.some(u => u.team === 0 && u.hp > 0 && u.cls !== 'vil' && Math.hypot(u.x - b.x, u.y - b.y) < 16);
        if (!foe && army >= DIFF[this.diff].base + AIFIX.ageArmy) return 'Saving for the next age.';
      }
    }
    return _q.apply(this, arguments);
  };
  /* 4. Trade ships whose trading post cannot be reached by water (a village up a river past a ford) sat still for ever.
        Now the route is called off: the player gets a message, and the AI stops buying trade ships for it. */
  const _dt = Game.prototype.doTrade;
  Game.prototype.doTrade = function (u, dt) {
    _dt.apply(this, arguments);
    if (u.order.t !== 'trade') return;
    // progress = the leg changed (out/back) or the ship is more than 2 tiles from where it was last noted
    const a = u.fxAt;
    if (!a || a.s !== u.order.s || a.post !== u.order.post || Math.hypot(u.x - a.x, u.y - a.y) > 2) { u.fxAt = { x: u.x, y: u.y, s: u.order.s, post: u.order.post }; u.fxStill = 0; }
    else u.fxStill = (u.fxStill || 0) + dt;
    if (u.fxStill > AIFIX.tradeStuck) {
      u.fxStill = 0; this.idleOrder(u);
      if (u.team === 0) this.msg('No sea route to that trading post.'); else if (this.ai) this.ai.noSea = 1;
    }
  };
  const _ot = Game.prototype.orderTrade;
  Game.prototype.orderTrade = function (u, post) { if (u.team === T1 && this.ai && this.ai.noSea) return; return _ot.apply(this, arguments); };
})();
