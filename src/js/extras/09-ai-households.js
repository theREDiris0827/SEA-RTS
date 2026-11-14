/* ##### CHAPTER EXTRA 9 · The computer's Ayutthaya households #####
   File: src/js/extras/09-ai-households.js
   What it does: Add-on: when the computer plays Ayutthaya it builds each house touching a paddy (and each paddy
   touching a house) and keeps one farmer on every paired paddy, so its houses pay household food like yours.
   Skipped in campaign missions and battles (g.M set). Drafted and tested by the Game demos thread (Ayutthaya AI
   went from 12 wins, 23 losses to 25 wins, 10 losses over 72 matches).
   Things you can tweak:
     - AYH.want: households the computer aims for by difficulty (2/4/6; the game's own cap is HOUSEHOLD.max).
     - AYH.every (6 s) and AYH.farmWood (120): how often it checks, and the wood it needs before adding a paddy.
   ############################################################################ */
(function () {
  const AYH = {
    want: { easy: 2, normal: 4, hard: 6 },   // households the computer aims for (the game's own cap is HOUSEHOLD.max)
    every: 6,                                // s between checks
    farmWood: 120                            // it adds a paddy for a household only with this much wood in hand
  };
  window.AYH = AYH;
  const T1 = 1, isAyu = (g) => CV(T1) === AYU_CIV && !g.M;
  const alive = (g, k) => g.buildings.filter(b => b.team === T1 && b.hp > 0 && b.kind === k);
  // do two buildings touch (edge or corner), the same test Game.housePairs uses
  const touch = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) <= (a.size + b.size) / 2 + 1.01;
  // a free spot for `kind` touching building `o`, nearest the town centre
  function spotBeside(g, kind, o, tc) {
    const s = BD[kind].size; let best = null, bd = 1e9;
    for (let ty = o.ty - s; ty <= o.ty + o.size; ty++) for (let tx = o.tx - s; tx <= o.tx + o.size; tx++) {
      const onEdge = tx === o.tx - s || tx === o.tx + o.size || ty === o.ty - s || ty === o.ty + o.size; if (!onEdge) continue;
      if (!g.canPlace(kind, tx, ty, T1)) continue;
      const d = Math.hypot(tx + s / 2 - tc.x, ty + s / 2 - tc.y); if (d < bd) { bd = d; best = { tx, ty }; }
    }
    return best;
  }
  const _ab = Game.prototype.aiBuild;
  Game.prototype.aiBuild = function (kind, tc, vils, nBuilders) {
    if (isAyu(this) && (kind === 'house' || kind === 'farm')) {
      const other = kind === 'house' ? 'farm' : 'house', mine = alive(this, kind);
      // partners that have no building of this kind touching them yet, nearest home first
      const lone = alive(this, other).filter(o => !mine.some(m => touch(m, o))).sort((a, b) => Math.hypot(a.x - tc.x, a.y - tc.y) - Math.hypot(b.x - tc.x, b.y - tc.y));
      for (const o of lone) {
        const sp = spotBeside(this, kind, o, tc); if (!sp) continue;
        const near = vils.slice().sort((p, q) => Math.hypot(p.x - sp.tx, p.y - sp.ty) - Math.hypot(q.x - sp.tx, q.y - sp.ty)).slice(0, nBuilders).map(v => v.id);
        if (this.placeBuilding(T1, kind, sp.tx, sp.ty, near).ok) return true;
      }
    }
    return _ab.apply(this, arguments);
  };
  const _ai = Game.prototype.aiTick;
  Game.prototype.aiTick = function () {
    const r = _ai.apply(this, arguments);
    try { if (isAyu(this)) tend(this); } catch (e) { if (!this._ayhErr) { this._ayhErr = 1; console.warn('ai households', e); } }
    return r;
  };
  function tend(g) {
    const ai = g.ai; if (g.t - (ai.ayhT || 0) < AYH.every) return; ai.ayhT = g.t;
    const tc = g.buildings.find(b => b.team === T1 && b.kind === 'towncentre' && b.done && b.hp > 0); if (!tc) return;
    const want = Math.min(AYH.want[g.diff] || 4, HOUSEHOLD.max);
    const vils = g.units.filter(u => u.team === T1 && u.kind === 'villager' && u.hp > 0);
    const on = (f) => vils.filter(v => v.order.t === 'gather' && v.order.id === f.id);
    const pairs = g.housePairs(T1), paired = [...pairs.keys()].map(id => g.byId.get(id)).filter(Boolean).slice(0, want);
    // 1. one farmer on every paired paddy: take a second farmer from a crowded paddy, else a wood cutter
    for (const f of paired) {
      if (on(f).length) continue;
      const farms = alive(g, 'farm').filter(x => x.done);
      const crowded = farms.map(x => on(x)).filter(w => w.length >= 2).sort((a, b) => b.length - a.length)[0];
      const spareFarm = farms.find(x => !pairs.has(x.id) && on(x).length);
      const v = crowded ? crowded[0] : spareFarm ? on(spareFarm)[0] : vils.filter(u => u.order.t === 'gather' && u.order.type === 'wood')[3];
      if (v) g.orderGather(v, f);
      return;   // one move per check
    }
    // 2. short of households and every paired paddy is worked: add a paddy beside a house that has none
    if (paired.length < want && g.res[T1].wood >= AYH.farmWood && !g.buildings.some(b => b.team === T1 && b.hp > 0 && !b.done && FIELD[b.kind])) {
      const v = vils.filter(u => u.order.t === 'gather' && u.order.type === 'wood')[0] || vils.find(u => u.order.t === 'idle');
      if (v && alive(g, 'house').some(h => h.done && ![...pairs.values()].includes(h))) g.aiBuild('farm', tc, [v], 1, 3.5, 8);
    }
  }
})();
