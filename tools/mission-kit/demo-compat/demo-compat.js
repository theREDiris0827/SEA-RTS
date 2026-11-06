/* ===== demo-compat.js (sea-rts-fixes/demo-compat): lets a demo written for an older main game run on the current one =====
   Older demos name things the old way: CIV_NAMES[kind] = ['Local (English)', ...] per civ, and short button labels in
   TRAIN_SHORT / BUILD_SHORT. The main game now keeps [local, short] per civ with the English role in CIV_ROLE.
   demoNames(col) turns the old entries into the new ones; col is the player's civ column (0 Melaka, 1 Majapahit, 2 Ayutthaya). */
const TRAIN_SHORT = {}, BUILD_SHORT = {};
function demoNames(col) {
  const split = (s) => { const m = /^(.*?) \((.*)\)$/.exec(s || ''); return m ? [m[1], m[2]] : [s, null]; };
  const role = (k, i, r) => { if (r) (CIV_ROLE[k] = (CIV_ROLE[k] || []).slice())[i] = r; };
  for (const k of Object.keys(CIV_NAMES)) {
    const e = CIV_NAMES[k]; if (!Array.isArray(e)) continue;
    CIV_NAMES[k] = e.map((v, i) => { if (typeof v !== 'string') return v; const [l, r] = split(v); role(k, i, r); return [l]; });
  }
  // the demo's own units and buildings, named 'Local (English)' in UD / BD
  for (const T of [UD, BD]) for (const k in T) {
    if (CIV_NAMES[k] && CIV_NAMES[k][col]) continue;
    const [l, r] = split(T[k].name); if (!r) continue;
    (CIV_NAMES[k] = (CIV_NAMES[k] || []).slice())[col] = [l]; role(k, col, r);
  }
  for (const S of [TRAIN_SHORT, BUILD_SHORT]) for (const k in S) {
    if (!UD[k] && !BD[k]) continue;
    const e = CIV_NAMES[k] = (CIV_NAMES[k] || []).slice(), cur = e[col];
    e[col] = [cur ? cur[0] : S[k], S[k]];
  }
}
/* a demo with its own ages and armour (soldierArm) keeps them: the main game's age armour would count twice */
function demoOwnArmour() { Game.prototype.armForAge = function () {}; }
/* a battle without ages of its own plays in one age of the main game's: demoAge(2) is the Kingdom Age
   (the roster as drawn, walls and healers allowed, no guns); the main game would start everyone in the Village Age */
function demoAge(n) {
  // called after the demo's code, so it wraps the demo's own populate too
  const _pop = Game.prototype.populate;
  Game.prototype.populate = function () { this.age = [n, n]; this.maxAge = n; return _pop.apply(this, arguments); };
}
/* a demo's own maps (genMap/populate overrides keyed on g.map): the main game only keeps a map name it knows */
function demoMaps(...names) { for (const n of names) if (!MAPDEF[n]) MAPDEF[n] = Object.assign({}, MAPDEF.strait, { name: n }); }
