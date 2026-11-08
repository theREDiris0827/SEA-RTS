/* ##### CHAPTER EXTRA 6 · Base footprints, wading, wet ports, house drop-off #####
   File: src/js/extras/06-footprint-wading.js
   What it does: buildings stand on their base only (the roof hangs over the tiles behind), land units wade
     through shallow water in Skirmish, a Port's deck may sit on shallow water, Ayutthaya paddy farmers drop
     rice at their paired house, and the panel button tidy-ups (centred icons, red Demolish, one-row queue).
   Things you can tweak:
     - FOOT: how many tile rows each building really stands on.
     - WADE / PORTWET: switch wading and ports-on-shallows off. Missions keep their own water rules (no wading).
     - HOUSEDROP: Ayutthaya farmers drop rice at their house.
   ############################################################################ */
// buildings take only their base: fh = rows the building stands on (Iylia, 2026-11-08)
const FOOT = { towncentre: 2, house: 1, store: 1, granary: 1, tower: 1, barracks: 2, rumahtabib: 2, patirthan: 2, wat: 2, tradepost: 2, palace: 3 };
for (const k in FOOT) if (BD[k] && !BD[k].fh) BD[k].fh = FOOT[k];
var WADE = true, PORTWET = true, HOUSEDROP = true;
// wading is for Skirmish; campaign missions and battles (they have setupObj) keep their own water rules
function wadeOn() { return WADE && typeof setupObj !== 'function'; }
// a Port's deck may stand on free shallow water (never deep)
Game.prototype.wetOk = function (kind, x, y) {
  const d = BD[kind]; if (!PORTWET || !d || !d.shore || !this.inb(x, y)) return false;
  const i = y * W + x; return this.terrain[i] === T.SHALLOW && !this.block[i] && !this.occ[i];
};
// Ayutthaya: a farmer on a paddy paired with a house drops the rice at that house if it is the nearer drop-off
const _hdDrop = Game.prototype.nearestDrop;
Game.prototype.nearestDrop = function (u, type) {
  const best = _hdDrop.call(this, u, type), o = u.order;
  if (!HOUSEDROP || type !== 'food' || u.layer === 1 || CV(u.team) !== AYU_CIV || !o || o.t !== 'gather') return best;
  const h = this.housePairs(u.team).get(o.id);
  if (!h) return best;
  return !best || rectDist(u.x, u.y, h.rect) < rectDist(u.x, u.y, best.rect) ? h : best;
};
(function () {
  const css = document.createElement('style');
  css.textContent = `
  body.cmp .cmd.demo .nm { display: block; color: #ff8a7a; }
  #panel .cmd { justify-content: center; }
  #panel .cmd .ct.noct { display: none; }
  #panel .cmd.demo { container-type: inline-size; overflow: hidden; }
  @container (max-width: 62px) { .cmd.demo .nm, .cmd.demo .en { display: none !important; } }
  body.cmp .p-info:has(.queue) { grid-column: 1 / -1; max-width: none; }
  .queue { flex-wrap: nowrap !important; overflow-x: auto; scrollbar-width: none; gap: 4px; }
  body.cmp .qi { width: 34px; height: 34px; flex: none; } body.cmp .qi img { width: 26px; height: 26px; }
  #panel .cmd img { display: block; margin: 0 auto; }
  .cmd.demo { border-color: #6e1510; box-shadow: inset 0 0 0 1px #c83a30, 0 3px 0 rgba(0, 0, 0, .45); }`;
  document.head.appendChild(css);
  // mark empty price lines so the icon can centre
  const _fpPanel = updatePanel;
  updatePanel = function () { const r = _fpPanel.apply(this, arguments); for (const c of document.querySelectorAll('#panel .cmd .ct')) c.classList.toggle('noct', !c.textContent.trim()); return r; };
})();
