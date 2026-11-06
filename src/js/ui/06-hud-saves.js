/* ##### CHAPTER SCREEN 6 · Top bar, game flow and saves #####
   File: src/js/ui/06-hud-saves.js
   What it does: Resource bar, messages, pause, win/lose screens, autosave and the 3 save slots.
   Things you can tweak:
     - SAVE_KEY / SLOTS_KEY: where saves are kept on the phone.
   ############################################################################ */
/* ---------------- HUD ---------------- */
let hudT = 0, seenMsgs = new WeakSet();
// the hint line at the top
function hintText() {
  if (G.over) return '';
  const vSel = selUnits().some(u => u.cls === 'vil');
  if (G.stats.wood === 0) return !sel.length ? 'Tap one of your villagers to select it.' : vSel ? 'Now tap a tree to chop wood.' : 'Tap one of your villagers to select it.';
  if (!G.buildings.some(b => b.team === 0 && b.kind === 'barracks')) return 'Good. Select villagers and build a House, then a Barracks.';
  if (G.units.filter(u => u.team === 0 && u.cls !== 'vil' && u.cls !== 'boat').length < 4) return 'Train warriors at the Barracks. The enemy will come once it has built up.';
  return 'Destroy the ' + CIV_TITLE[CV(1)] + ' ' + civName('towncentre', 1) + ' to win.';
}
// refresh the top bar
function updateHud() {
  sfxTick();
  const r = G.res[0];
  $('v-food').textContent = Math.floor(r.food); $('v-wood').textContent = Math.floor(r.wood); $('v-gold').textContent = Math.floor(r.gold);
  const gn = { food: 0, wood: 0, gold: 0 };
  for (const u of G.units) if (u.team === 0 && u.hp > 0 && u.order.t === 'gather' && gn[u.order.type] != null) gn[u.order.type]++;
  for (const k in gn) { const e = $('g-' + k), t = '(' + gn[k] + ')'; if (e.textContent !== t) e.textContent = t; e.classList.toggle('zero', gn[k] === 0); }
  const pop = G.popOf(0), cap = G.popCap(0); $('v-pop').textContent = pop + '/' + cap;
  $('pop-chip').classList.toggle('warn', pop >= cap);
  $('hint').textContent = hintText();
  const AG = AGE_TABLE[G.teamAge(0)];
  $('clock').textContent = (AG ? AG.local[CI(0)] + '  ' : '') + fmtTime(G.t) + '';
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); }
}

/* ---------------- game flow ---------------- */
function showOv(name) {
  $('ov').hidden = !name;
  for (const n of ['pause', 'end', 'help']) $('ov-' + n).hidden = n !== name;
}
// start a skirmish
function startGame(seed) {
  seedUsed = seed; G = new Game({ seed, diff, map: mapKind, civs: [pciv, pfoe], startAge });
  enterGame();
  const tc = G.buildings.find(b => b.team === 0 && b.kind === 'towncentre');
  view.zoom = view.w > 700 ? 1.5 : 1; resize(); centerOn(tc.x, tc.y + 1);
  const v = G.units.find(u => u.team === 0 && u.kind === 'villager'); if (v) select([v]);
  updateHud(); updatePanel(); saveGame();
}
/* shared by a new game and a resumed one: rebuild the view state around G */
function enterGame() {
  slotBak = {};
  terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  sel = []; mode = null; markers = []; boxRect = null; panelKey = ''; ended = false; acc = 0; seenMsgs = new WeakSet(); idleIdx = 0;
  speed = settings.speed; syncSpeedButtons(); saveT = 0;
  started = true; paused = false; $('hud').hidden = false; showOv(null); showMenu(null);
}
// show which game speed is on
function syncSpeedButtons() { document.querySelectorAll('[data-do="speed"]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.v === speed ? 'true' : 'false')); }

/* ---------------- save / resume ---------------- */
const SAVE_KEY = 'seak-save-v1', SET_KEY = 'seak-settings';
// storage can be missing (private windows, previews): the game still runs, it just can't resume
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
// save to the phone's storage
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
// delete from the phone's storage
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* nothing to do */ } }
let saveT = 0;
const settings = Object.assign({ speed: 1, bars: 'auto', sound: 'on', music: 'on' }, (() => { try { return JSON.parse(lsGet(SET_KEY)) || {}; } catch (e) { return {}; } })());
// save settings
function saveSettings() { lsSet(SET_KEY, JSON.stringify(settings)); }
/* three save slots, shared with the mission pages (sea-rts-fixes/mission-save): seak-slots holds a short
   description of each, seak-slot-N the game itself. A new game takes a free slot, or the oldest. */
const SLOTS_KEY = 'seak-slots', SLOT_N = 3;
let curSlot = null;
let slotBak = {};   // what each slot held before this game first wrote to it, so Exit without saving can put it back
// what is in the 3 save slots
function slotMetas() { try { const a = JSON.parse(lsGet(SLOTS_KEY)); if (Array.isArray(a)) return a.concat([null, null, null]).slice(0, SLOT_N); } catch (e) { /* none yet */ } return [null, null, null]; }
// which slot a new game uses
function slotPick(cur) { if (cur != null) return cur; const m = slotMetas(), free = m.findIndex((x) => !x); if (free >= 0) return free; let o = 0; m.forEach((x, i) => { if (x.when < m[o].when) o = i; }); return o; }
// write a save slot
function slotWrite(i, meta, rec) { if (!(i in slotBak)) slotBak[i] = [slotMetas()[i], lsGet('seak-slot-' + i)]; if (!lsSet('seak-slot-' + i, JSON.stringify(rec))) return false; const m = slotMetas(); m[i] = Object.assign(meta, { when: Date.now() }); lsSet(SLOTS_KEY, JSON.stringify(m)); return true; }
// read a save slot
function slotRead(i) { try { const r = JSON.parse(lsGet('seak-slot-' + i)); return r && r.snap ? r : null; } catch (e) { return null; } }
// delete a save slot
function slotDel(i) { lsDel('seak-slot-' + i); const m = slotMetas(); m[i] = null; lsSet(SLOTS_KEY, JSON.stringify(m)); }
// most recent save
function slotNewest() { const m = slotMetas(); let b = -1; m.forEach((x, i) => { if (x && (b < 0 || x.when > m[b].when)) b = i; }); return b; }
// save slot label text
function slotLine(x) { return (x.kind === 'skirmish' ? x.sub + ' \u00b7 ' : '') + fmtTime(x.t || 0) + ' \u00b7 ' + x.diff[0].toUpperCase() + x.diff.slice(1) + ' \u00b7 ' + new Date(x.when).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); }
// the skirmish save from before the slots moves into one
(function () { const old = lsGet(SAVE_KEY); if (!old) return; try { const r = JSON.parse(old); if (r && r.snap) slotWrite(slotPick(null), { kind: 'skirmish', title: 'Skirmish', sub: CIV_TITLE[r.snap.civs ? r.snap.civs[0] : 0] + ' vs ' + CIV_TITLE[r.snap.civs ? r.snap.civs[1] : 1], t: r.snap.t, diff: r.diff }, r); } catch (e) { /* drop it */ } lsDel(SAVE_KEY); })();
// save the current game
function saveGame() {
  if (!started || ended || !G || G.over) return;
  const rec = { snap: G.snapshot(), seed: seedUsed, diff, cam: { x: cam.x, y: cam.y }, zoom: view.zoom, when: Date.now() };
  curSlot = slotPick(curSlot);
  slotWrite(curSlot, { kind: 'skirmish', title: 'Skirmish', sub: CIV_TITLE[CV(0)] + ' vs ' + CIV_TITLE[CV(1)] + ' \u00b7 ' + MAPDEF[G.map || 'strait'].name, t: G.t, diff }, rec);
}
// a mission save opens its own page, which loads it
function openSlot(i) {
  const m = slotMetas()[i]; if (!m) return;
  if (m.kind !== 'mission') { continueGame(i); return; }
  const url = SITE + m.page + '?slot=' + i;
  if (SITE === './') location.replace(url); else window.open(url, '_blank', 'noopener');
}
// load a saved game
function continueGame(i) {
  const r = slotRead(i); const g = r && Game.restore(r.snap);
  if (!g) { slotDel(i); refreshHome(); toastMenu('That saved game could not be loaded.'); return; }
  curSlot = i; G = g; seedUsed = r.seed; diff = r.diff; mapKind = g.map || 'strait'; pciv = g.civs ? g.civs[0] : 0; pfoe = g.civs ? g.civs[1] : 1;
  enterGame();
  view.zoom = r.zoom || view.zoom; resize(); cam.x = r.cam.x; cam.y = r.cam.y; clampCam();
  updateHud(); updatePanel();
}
// save and go to the menu
function quitToMenu() { saveGame(); started = false; paused = true; showOv(null); $('hud').hidden = true; showMenu('home'); }
// leave without keeping anything from this game: every slot it wrote goes back to what it held before
function discardGame() {
  started = false; paused = true;
  const m = slotMetas();
  for (const i of Object.keys(slotBak)) { const [meta, rec] = slotBak[i]; if (rec == null) lsDel('seak-slot-' + i); else lsSet('seak-slot-' + i, rec); m[i] = meta || null; }
  lsSet(SLOTS_KEY, JSON.stringify(m)); slotBak = {}; curSlot = null;
  showOv(null); $('hud').hidden = true; showMenu('home');
}
/* a yes/no box over whatever is on screen */
function confirmBox(title, text, okLabel, onOk) {
  const o = document.createElement('div'); o.className = 'xconf';
  o.innerHTML = '<div class="card"><h2></h2><p class="lead"></p><div class="row"><button class="btn alt" type="button">Cancel</button><button class="btn" type="button"></button></div></div>';
  o.querySelector('h2').textContent = title; o.querySelector('.lead').textContent = text; const [no, yes] = o.querySelectorAll('button'); yes.textContent = okLabel;
  no.addEventListener('click', () => o.remove()); yes.addEventListener('click', () => { o.remove(); onOk(); });
  o.addEventListener('click', (e) => { if (e.target === o) o.remove(); });
  document.body.appendChild(o);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveGame(); });
window.addEventListener('pagehide', saveGame);

