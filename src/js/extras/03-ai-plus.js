/* ##### CHAPTER EXTRA 3 · Smarter AI #####
   File: src/js/extras/03-ai-plus.js
   What it does: Add-on: the computer runs trade ships, claims wild kerbau, and Melaka's AI ploughs with them.
   Things you can tweak:
     - AIP.traders: trade ships per difficulty (2/3/4).
     - AIP.claimEvery (8 s), AIP.claimR (26 tiles): how often and how far it looks for kerbau.
   ############################################################################ */
/* ===== ai plus: the computer uses trade ships and kerbau (Kerbau Minang for Melaka) ===== */
(function () {
  const AIP = { traders: { easy: 2, normal: 3, hard: 4 }, claimEvery: 8, claimR: 26 };
  window.AI_PLUS = AIP;
  const _ai = Game.prototype.aiTick;
  Game.prototype.aiTick = function () {
    _ai.apply(this, arguments);
    try { aiPlus(this, 1); } catch (e) { if (!this._aipErr) { this._aipErr = 1; console.warn('ai plus', e); } }
  };
  // the AI's extra jobs: trade ships, claim kerbau, plough
  function aiPlus(g, t) {
    const tc = g.buildings.find(b => b.team === t && b.kind === 'towncentre' && b.done && b.hp > 0); if (!tc) return;
    const r = g.res[t], pop = g.popOf(t), cap = g.popCap(t);
    // trade: keep a few ships sailing between a port and the trading post (Majapahit's post already pays tribute)
    const post = g.buildings.find(b => b.team === t && b.kind === 'tradepost' && b.done && b.hp > 0);
    const ports = g.buildings.filter(b => b.team === t && b.kind === 'port' && b.done && b.hp > 0);
    if (post && ports.length && CV(t) !== 1) {
      const traders = g.units.filter(u => u.team === t && u.kind === 'trade' && u.hp > 0);
      const want = AIP.traders[g.diff] || 3, queued = ports.reduce((a, p) => a + p.queue.filter(q => q.kind === 'trade').length, 0);
      const port = ports.slice().sort((a, b) => a.queue.length - b.queue.length)[0];
      if (traders.length + queued < want && port.queue.length < 2 && pop < cap && g.canAfford(t, g.costOf('trade', t)) && r.gold >= 120) g.queueUnit(port, 'trade', t);
      for (const u of traders) if (!u.order || u.order.t === 'idle') g.orderTrade(u, post);
    }
    // kerbau: claim wild ones near home; Melaka ploughs its worked farms with them
    if (typeof KERBAU === 'undefined' || !g.claimKerbau) return;
    const herd = g.units.filter(u => u.kind === 'kerbau' && u.hp > 0 && u.own === t);
    if (herd.length < KERBAU.cap && g.t - (g.ai.kbT || -99) > AIP.claimEvery) {
      const wild = g.units.filter(u => u.kind === 'kerbau' && u.hp > 0 && (u.own == null || u.own < 0) && Math.hypot(u.x - tc.x, u.y - tc.y) < AIP.claimR && g.regionAt(u.x, u.y) === g.regionAt(tc.x, tc.y))
        .sort((a, b) => Math.hypot(a.x - tc.x, a.y - tc.y) - Math.hypot(b.x - tc.x, b.y - tc.y))[0];
      const goer = wild && g.units.filter(u => u.team === t && u.kind === 'villager' && u.hp > 0 && u.order && u.order.t !== 'build' && !u.kbGo)
        .sort((a, b) => Math.hypot(a.x - wild.x, a.y - wild.y) - Math.hypot(b.x - wild.x, b.y - wild.y))[0];
      if (goer) { g.ai.kbT = g.t; goer.kbGo = wild.id; g.orderMove(goer, wild.x, wild.y); }
    }
    for (const v of g.units) if (v.kbGo && v.team === t) { const k = g.byId.get(v.kbGo); if (!k || k.hp <= 0 || k.own === t || v.order.t !== 'move') { v.kbGo = 0; if (v.order.t === 'move' || v.order.t === 'idle') g.idleOrder(v); } }
    if (CV(t) === 0) for (const k of herd) if (k.job !== 'plough' && k.job !== 'stay') {
      const free = g.buildings.some(b => b.team === t && FIELD[b.kind] && b.done && b.hp > 0 && (!b.kb || !g.byId.get(b.kb) || g.byId.get(b.kb).hp <= 0) && g.units.some(v => v.hp > 0 && v.team === t && v.order.t === 'gather' && v.order.id === b.id));
      if (free) g.kerbauPlough(k, null); else break;
    }
  }
})();
/* ===== end ai plus ===== */
