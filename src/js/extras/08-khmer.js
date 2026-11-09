/* ##### CHAPTER EXTRA 8 · Khmer #####
   File: src/js/extras/08-khmer.js
   What it does: the fourth civ (civ id 4, column 3 of the per-civ tables). Groundwork: every per-civ table gets a
     Khmer column. Until Khmer's own roster lands, a missing Khmer value copies Melaka's, so nothing breaks.
   Things you can tweak:
     - KHMER: Khmer's own values; anything set here wins over the Melaka copy.
   ############################################################################ */
const KHMER = {
  team: { name: 'Khmer', main: '#2f6fb3', dark: '#1d4a7a', trim: '#d8cfb8', roofA: '#b8a27a', roofB: '#94805c', roofR: '#3a3a44', ring: '#8ec2ff' },
  mini: ['#6fb0ff', '#b8d8ff'],
  mod: { hp: 1, spd: 1, cost: 1, arm: 0 },
  burn: 0.25   // stone and laterite: a quarter of the normal burn
};
(function khmerColumns() {
  const pad = (a) => { if (Array.isArray(a) && a.length === 3) a.push(a[0]); };
  for (const k in CIV_NAMES) pad(CIV_NAMES[k]);
  for (const k in CIV_ROLE) { const r = CIV_ROLE[k]; while (r.length < 3) r.push(null); pad(r); }
  for (const A of AGE_TABLE) if (A) pad(A.local);
  pad(ARCHER_LINE); pad(TRADE.civ); pad(FIRE_ARROWS.local);
  for (const D of [UD, BD]) for (const k in D) for (const f of ['civHp', 'civAtk', 'civCap', 'civBld']) pad(D[k][f]);
  // civ-id tables (indexed by CV, not CI)
  TEAMC[KHM_CIV] = KHMER.team; MINIC[KHM_CIV] = KHMER.mini; TEAMMOD[KHM_CIV] = KHMER.mod; BURNMAT[KHM_CIV] = KHMER.burn;
  // until Khmer has its own roster it builds and trains what Melaka does
  for (const D of [UD, BD]) for (const k in D) { const c = D[k].civ; if (Array.isArray(c) ? c.includes(0) && !c.includes(KHM_CIV) : c === 0) D[k].civ = Array.isArray(c) ? c.concat(KHM_CIV) : [0, KHM_CIV]; }
})();
