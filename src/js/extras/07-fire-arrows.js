/* ##### CHAPTER EXTRA 7 · Fire Arrows research #####
   File: src/js/extras/07-fire-arrows.js
   What it does: Panah Api (lore/siege.md): from Age 2 the Barracks can research Fire Arrows once. Archers then
     do extra damage to buildings and set them alight more often. Torches on melee hits stay automatic.
   Things you can tweak:
     - FIRE_ARROWS.cost / time / age: price, research seconds and the age it opens in.
     - FIRE_ARROWS.bld: extra damage per arrow on a building; FIRE_ARROWS.chance: chance an arrow lights it (20% before).
     - FIRE_ARROWS.aiGold: gold the computer keeps spare before it researches.
   ############################################################################ */
const FIRE_ARROWS = { cost: { wood: 50, gold: 150 }, time: 40, age: 2, bld: 4, chance: 0.35, aiGold: 100, local: ['Panah Api', 'Panah Api', 'Sorn Fai'] };
// research state per team, kept on the game so saves carry it: fireArr[t] true once done, fireRes[t] = seconds left
Game.prototype.fireState = function () { if (!this.fireArr) { this.fireArr = [false, false]; this.fireRes = [null, null]; } return this; };
Game.prototype.startFireArrows = function (team) {
  this.fireState(); const F = FIRE_ARROWS;
  if (this.fireArr[team]) return 'Your archers already shoot fire arrows.';
  if (this.fireRes[team] != null) return 'Already being researched.';
  if (this.teamAge(team) < F.age) return 'Fire Arrows come with the ' + AGE_TABLE[F.age].name + '.';
  if (!this.buildings.some(b => b.team === team && b.kind === 'barracks' && b.done && b.hp > 0)) return 'Needs a Barracks.';
  if (!this.canAfford(team, F.cost)) return 'Fire Arrows cost ' + costWords(F.cost) + '.';
  this.pay(team, F.cost); this.fireRes[team] = F.time; return null;
};
// count the research down beside the age research
const _faAgeTick = Game.prototype.ageTick;
Game.prototype.ageTick = function (dt) {
  _faAgeTick.call(this, dt); this.fireState();
  for (let t = 0; t < 2; t++) {
    if (this.fireRes[t] == null) continue;
    if (!this.buildings.some(b => b.team === t && b.kind === 'barracks' && b.hp > 0)) { this.refund(t, FIRE_ARROWS.cost); this.fireRes[t] = null; if (t === 0) this.msg('The Barracks is lost: Fire Arrows research stopped, cost returned.'); continue; }
    this.fireRes[t] -= dt;
    if (this.fireRes[t] <= 0) { this.fireRes[t] = null; this.fireArr[t] = true; if (t === 0) this.msg('Fire Arrows ready: your archers now burn buildings.'); }
  }
};
// archers with fire arrows light buildings more often (foot soldiers' torches unchanged)
const _faFireOn = Game.prototype.fireOn;
Game.prototype.fireOn = function (u, t) {
  this.fireState();
  if (u.ranged && u.cls === 'archer' && !UD[u.kind].gun && this.fireArr[u.team] && t.team !== 2 && t.team !== u.team && !BD[t.kind].neutral) { if (this.rng() < FIRE_ARROWS.chance) this.ignite(t, u.team); return; }
  return _faFireOn.call(this, u, t);
};
// and every arrow does extra damage to a building
const _faDamage = Game.prototype.damage;
Game.prototype.damage = function (att, tgt, w) {
  const r = _faDamage.apply(this, arguments);
  if (tgt && tgt.isBld && tgt.hp > 0 && att && att.isUnit && att.cls === 'archer' && att.ranged && !UD[att.kind].gun && this.fireArr && this.fireArr[att.team]) {
    tgt.hp -= FIRE_ARROWS.bld; tgt.lastHit = this.t;
    if (tgt.hp <= 0) this.onKilled(tgt, att);
  }
  return r;
};
// the computer researches it once it has a Barracks in Age 2 and gold to spare
const _faAi = Game.prototype.aiTick;
Game.prototype.aiTick = function (dt) {
  const r = _faAi.apply(this, arguments); this.fireState();
  if (this.t - (this.faLast || 0) >= 5 && (this.faLast = this.t) && !this.fireArr[1] && this.fireRes[1] == null && this.teamAge(1) >= FIRE_ARROWS.age && this.res[1].gold >= FIRE_ARROWS.cost.gold + FIRE_ARROWS.aiGold) this.startFireArrows(1);
  return r;
};
// the panel rebuilds when the research starts or ends, or the age changes
const _faKey = structKey;
structKey = function () { const g = G && G.fireArr ? G : null; return _faKey() + '|fa' + (g ? (g.fireArr[0] ? 2 : g.fireRes[0] != null ? 1 : 0) : 0) + (G ? G.teamAge(0) : 0); };
// the Barracks button: research, progress, or done
function fireArrowBtn() {
  G.fireState(); const F = FIRE_ARROWS, nm = F.local[CI(0)] + '<small class="en">(Fire Arrows)</small>';
  if (G.fireArr[0]) return '';
  if (G.teamAge(0) < F.age) return '<button class="cmd no lock" data-a="locked" title="Fire Arrows come with the ' + AGE_TABLE[F.age].name + '"><img alt="" src="' + resIcon('firearrow') + '"><span class="nm">' + nm + '</span><span class="ct">' + AGE_TABLE[F.age].name.replace('Age of ', '').replace(' Age', '') + '</span></button>';
  if (G.fireRes[0] != null) { pdyn.push(() => { const e = $('p-fa'); if (e && G.fireRes[0] != null) e.textContent = Math.floor((1 - G.fireRes[0] / F.time) * 100) + '%'; }); return '<button class="cmd on" data-a="locked" title="Researching Fire Arrows"><img alt="" src="' + resIcon('firearrow') + '"><span class="nm">' + nm + '</span><span class="ct" id="p-fa">0%</span></button>'; }
  return cmdBtn('firearrow', 'firearrow', resIcon('firearrow'), nm, F.cost, 'Research Fire Arrows (' + F.time + ' s): archers do +' + F.bld + ' damage to buildings and set them alight more often.');
}
