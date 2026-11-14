/* ===== m2-ui.js ===== */
const TIPS = [
  'After Angkor fell in 1431, King Ponhea Yat moved the court south. By 1434 it was at Chaktomuk, the "Four Faces", where Phnom Penh stands today.',
  'Every rainy season the Mekong swells so much that the Tonle Sap river runs backwards, filling the great lake. In the dry season it flows out again.',
  'Khmer kings built dikes and raised roads (thnal) across the flood plain. Some of them still carry roads today.',
  'A baray is a stone-banked reservoir. Angkor\'s West Baray is 8 km long, and still holds water.',
  'Legend says a rich widow, Daun Penh, found Buddha images inside a floating log and built a shrine for them on a hill: Wat Phnom.',
  'Phnom Penh means "Penh\'s hill", after Daun Penh.',
  'The river villages fished and farmed rice in the flood plain long before the court arrived.'
];
let storyOpen = null;

/* ---------- panel additions ---------- */
function mrPanelKey() { const M = G.M; return M ? M.won.length + '|' + (M.tc ? 1 : 0) + '|' + (M.flood ? 1 : 0) : ''; }
function mrUnitCmds(us) { return ''; }
function mrBldCmds(b) { return ''; }
function mrPanelAction(a, el) { return false; }
describeOrder = (function (base) {
  return function (u) {
    const o = u.order;
    if (o.t === 'bless') return o.w > 0 ? 'Blessing the village' : 'Walking to the village';
    return base(u);
  };
})(describeOrder);
bldNote = (function (base) {
  return function (b) {
    const M = G.M;
    if (b.kind === 'village' && M) return M.won.includes(b.id) ? 'A river village that has joined the new city.' : 'A river village. Select the monks and tap it: after their blessing, ' + KM2.villageJoin + ' farmers join you.';
    if (b.kind === 'towncentre' && b.team === 0) return 'The Preah Reachea Veang, the royal palace of the new city. If it falls, the mission is lost.';
    if (b.kind === 'palisade' && b.team === 0) return 'An earth dike. Flood water cannot pass it.';
    return base(b);
  };
})(bldNote);
// the village is a river village here, not an Orang Laut one
const _m2pName = pName;
pName = function (kind, team) { return kind === 'village' ? 'River Village' : _m2pName(kind, team); };

/* ---------- story cards ---------- */
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>';
  const goal = (t) => '<p class="goal">' + t + '</p>', tip = (t) => '<p class="lead tipline">' + t + '</p>';
  if (id === 'opening') return {
    tag: 'Khmer · Mission 1 · 1432', title: 'Where Four Rivers Meet',
    body: [P('Angkor stands empty. King Ponhea Yat has brought the court, the monks and the farmers down the Tonle Sap by barge, to the place where four rivers meet: Chaktomuk.'),
      P('The land is rich, but every year the Mekong rises and the low ground goes under water.'),
      goal('Build the royal palace on the hill (gold flag), raise dikes before the flood, dig the first Baray, win over the river villages, and hold off raiders from the west.'),
      tip('Keep Ponhea Yat alive. Villagers repairing near him work 50% faster.')],
    btn: 'Go ashore'
  };
  if (id === 'flood') return {
    tag: 'The rainy season', title: 'The river is rising',
    body: [P('The water climbs a little more each day. Soon all the low ground by the rivers, tinted blue on the map, will be under water.'),
      goal('Flooded buildings lose health and flooded farms give no food. Build Thnal (earth dikes) between the river and your fields: water cannot pass them. Buildings that would flood glow red.'),
      P('The flood is also a gift: it leaves rich silt behind, so farms on the blue ground gather 20% faster while they are dry.'),
      tip(TIPS[1])],
    btn: 'To the dikes'
  };
  if (id === 'closing') {
    const M = G.M;
    return {
      tag: 'Chaktomuk, 1434', title: 'Penh\'s Hill',
      body: [P('The dikes held, the Baray is full, and the river villages have joined the court. Ponhea Yat names the new city his capital.'),
        P('People tell how a widow called Daun Penh found Buddha images inside a log floating down the river, and built a shrine for them on the hill. The city takes her name: Phnom Penh.'),
        P('Angkor was lost, but the kingdom lives on by the rivers.'),
        tip(TIPS[3])],
      btn: 'Finish'
    };
  }
  return null;
}
function showStory(id) {
  const s = storyFor(id); if (!s) return;
  storyOpen = id; paused = true;
  $('st-tag').textContent = s.tag; $('st-title').textContent = s.title; $('st-art').innerHTML = '';
  try { $('st-art').appendChild(drawScene(id)); } catch (e) { console.warn('scene', id, e); }
  $('st-body').innerHTML = s.body.join(''); $('st-btn').textContent = s.btn || 'Continue';
  showOv('story');
  if (typeof SFX !== 'undefined' && SFX.play) SFX.play(id === 'closing' ? 'victory' : 'ui');
}
function closeStory() {
  const id = storyOpen; if (!id) return;
  storyOpen = null; showOv(null); paused = false;
  if (id === 'closing') { G.M.won2 = true; G.checkEnd(); }
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-do="story"]')) closeStory(); });
window.addEventListener('keydown', (e) => { if (storyOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopImmediatePropagation(); closeStory(); } }, true);
function vignette(id, text) {
  const box = $('vignette'); if (!box) return;
  box.innerHTML = ''; try { box.appendChild(drawScene(id)); } catch (e) { /* text only */ }
  const p = document.createElement('div'); p.textContent = text; box.appendChild(p);
  box.hidden = false; clearTimeout(vignette.t);
  vignette.t = setTimeout(() => { box.hidden = true; }, 5500);
}

/* ---------- HUD ---------- */
function floodClock() { const M = G.M; return M.flood ? 'Flood! ' + fmtTime(Math.max(0, M.floodEnd - M.t)) : 'Flood in ' + fmtTime(Math.max(0, M.nextFlood - M.t)); }
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  const pal = palaceOf(G);
  if (!pal) return 'Select villagers and build the Preah Reachea Veang at the gold flag on the hill.';
  if (!pal.done) return 'The palace is going up: ' + Math.floor(pal.progress * 100) + '%.';
  if (M.flood) return 'The flood is here. ' + M.floodHit.length + ' building' + (M.floodHit.length === 1 ? '' : 's') + ' under water.';
  if (M.t >= M.nextFlood - KM2.floodWarn) return 'The river is rising! Close the dikes before the water comes.';
  const raid = raidersLeft(G);
  if (raid) return raid + ' raiders in the city lands. Drive them off!';
  if (!barayOf(G)) return 'Dig the Baray: Economy tab, then plant farms on its plots.';
  if (M.won.length < 2) return 'Send the monks to the river villages (gold flags).';
  return floodClock() + '. Keep the town dry.';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'fallen';
  const items = [], pal = palaceOf(G), by = barayOf(G), pl = plotsPlanted(G);
  items.push({ t: 'Build the royal palace on the hill' + (pal && !pal.done ? ' (' + Math.floor(pal.progress * 100) + '%)' : ''), ok: !!(pal && pal.done),
    how: 'Select villagers, Economy tab, Preah Reachea Veang (' + costTitle(KM2.tcCost) + '). Build it at the gold flag: the hill stays dry in a flood.' });
  items.push({ t: 'Keep the town dry through a flood' + (M.lastHit > 0 && !M.dryOk ? ' (last time ' + M.lastHit + ' flooded)' : ''), ok: M.dryOk,
    how: 'The blue ground floods. Build Thnal (dikes, Economy tab) in a line between the river and your buildings, closing the gaps: water cannot pass them. Farms on the blue ground gather 20% faster.' });
  items.push({ t: 'Dig the Baray and plant ' + KM2.plotsNeeded + ' of its plots (' + Math.min(KM2.plotsNeeded, pl) + ' of ' + KM2.plotsNeeded + ')', ok: pl >= KM2.plotsNeeded,
    how: by ? 'Build farms: they snap to the dotted plots around the Baray, and gather 25% faster there.' : 'Economy tab, Baray (' + costTitle(BD.baray.cost) + '). Leave room for the farm plots around it.' });
  items.push({ t: 'Win over 2 river villages (' + M.won.length + ' of 2)', ok: M.won.length >= 2,
    how: monksUnit(G) ? 'Select the monks (saffron ring) and tap a village with a gold flag. They bless it for ' + KM2.blessTime + ' s and ' + KM2.villageJoin + ' farmers join you.' : 'The monks have fallen. New ones come from the palace soon.' });
  items.push({ t: 'Drive off the raiders (' + Math.min(M.waveSent, KM2.waves.length) + ' of ' + KM2.waves.length + ' raids)', ok: M.wavesDone,
    how: 'Raiders come from the west edge. Train Sna at a Barracks and keep them behind your dikes and towers.' });
  items.push({ t: floodClock(), tip: true });
  items.push({ t: 'Keep Ponhea Yat alive (' + pct(heroUnit(G)) + ')', ok: false });
  return { title: 'Where Four Rivers Meet', items };
}
function updateObj() {
  const box = $('obj'); if (!box) return;
  if (!objStarted && G.M && started) { objStarted = true; objOpen = true; objAuto = performance.now() + 10000; }
  if (objAuto && performance.now() > objAuto) { objAuto = 0; if (view.w < 700 || view.h < 520) objOpen = false; }
  const L = !G.over && objList();
  $('obj-tog').textContent = objOpen ? '▴' : '▾';
  if (!L || !objOpen) { if (!box.hidden) box.hidden = true; objKey = ''; return; }
  const html = '<div class="obj-h">' + L.title + '</div>' + L.items.map(i =>
    '<div class="obj-i' + (i.ok ? ' ok' : '') + (i.opt ? ' opt' : '') + (i.tip ? ' tip' : '') + '"><span>' + (i.tip ? '·' : i.ok ? '✓' : '○') + '</span><div>' + i.t + (i.how && !i.ok ? '<div class="obj-how">' + i.how + '</div>' : '') + '</div></div>').join('');
  if (html !== objKey) { objKey = html; box.innerHTML = html; }
  box.hidden = false;
}
function setupObj() {
  if ($('obj')) return;
  const strip = $('strip'), tog = document.createElement('span');
  tog.id = 'obj-tog'; tog.textContent = '▾'; strip.insertBefore(tog, strip.firstChild);
  const box = document.createElement('div'); box.id = 'obj'; box.hidden = true;
  strip.parentNode.insertBefore(box, strip.nextSibling);
  const flip = (e) => { e.preventDefault(); e.stopPropagation(); objOpen = !objOpen; objAuto = 0; updateObj(); };
  strip.addEventListener('click', flip); box.addEventListener('click', flip);
  const vg = document.createElement('div'); vg.id = 'vignette'; vg.hidden = true; $('mid').appendChild(vg);
}
updateHud = function () {
  sfxTick();
  const r = G.res[0], M = G.M;
  if (G.terrainDirty) { G.terrainDirty = false; terrainC = buildTerrain(G); miniBase = buildMiniBase(G); }
  $('v-food').textContent = Math.floor(r.food); $('v-wood').textContent = Math.floor(r.wood); $('v-gold').textContent = Math.floor(r.gold);
  const gn = { food: 0, wood: 0, gold: 0 };
  for (const u of G.units) if (u.team === 0 && u.hp > 0 && u.order.t === 'gather' && gn[u.order.type] != null) gn[u.order.type]++;
  for (const k in gn) { const e = $('g-' + k), t = '(' + gn[k] + ')'; if (e.textContent !== t) e.textContent = t; e.classList.toggle('zero', gn[k] === 0); }
  const pop = G.popOf(0), cap = G.popCap(0); $('v-pop').textContent = pop + '/' + cap;
  $('pop-chip').classList.toggle('warn', pop >= cap);
  $('hint').textContent = hintText(); updateObj();
  $('clock').textContent = M ? floodClock() : fmtTime(G.t);
  $('clock').classList.toggle('flood', !!(M && (M.flood || M.t >= M.nextFlood - KM2.floodWarn)));
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); }
  if (sel.length === 1 && M) { const k = mrPanelKey(); if (k !== lastMKey) { lastMKey = k; panelKey = ''; } }
  if (M && M.cardQ.length && !G.over && !storyOpen) {
    const c = M.cardQ.shift();
    if (c === 'v-village') vignette('village', 'A river village joins the new city.');
    else if (c === 'v-founded') vignette('founded', 'The royal palace stands on the hill.');
    else if (c === 'v-dry') vignette('dry', 'The dikes held: the town stayed dry.');
    else if (c === 'v-rise') vignette('rise', 'The river is rising again.');
    else if (c === 'v-raid') vignette('raid', 'Raiders from the west!');
    else showStory(c);
  }
};
let lastMKey = '';

/* ---------- game flow ---------- */
function newM2Game() { const g = new Game({ seed: KM2.seed, diff, map: 'chaktomuk', civs: [KHM2, RAID], startAge: 2 }); g.res[0] = Object.assign({}, KM2.start); g.res[1] = { food: 0, wood: 0, gold: 0 }; return g; }
startGame = function (seed) {
  seedUsed = seed; storyOpen = null;
  G = newM2Game();
  enterGame(); showMenu(null);
  objStarted = false; lastMKey = '';
  if (typeof RC !== 'undefined') for (const k in RC) delete RC[k];
  view.zoom = view.w > 700 ? 1.0 : 0.8; resize();
  const h = heroUnit(G); centerOn(h.x - 3, h.y);
  updateHud(); updatePanel();
  showStory('opening');
};
togglePause = (function (base) {
  return function () {
    if (storyOpen) return;
    base();
    if (paused && !ended) $('pause-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  };
})(togglePause);
endGame = function () {
  const M = G.M;
  ended = true; paused = true;
  const win = G.over === 'win';
  $('end-tag').textContent = win ? 'Mission complete' : 'The mission is lost';
  $('end-title').textContent = win ? 'A new capital' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  const why = { hero: 'Ponhea Yat has fallen. Without their king the court scatters.', tc: 'The royal palace has fallen. The court cannot stay at Chaktomuk.' };
  $('end-sub').textContent = win ? 'Ponhea Yat founded his new capital where four rivers meet.' : (why[M.why] || 'The new city is lost.');
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + M.floodN + '</b><span>Floods</span></div>' +
    '<div><b>' + plotsPlanted(G) + ' of 8</b><span>Baray plots</span></div><div><b>' + M.won.length + '</b><span>Villages won</span></div>' +
    '<div><b>' + G.stats.kills + '</b><span>Raiders beaten</span></div><div><b>' + G.stats.built + '</b><span>Built</span></div>';
  const old = $('ov-end').querySelector('.end-art'); if (old) old.remove();
  if (!win) { const art = document.createElement('div'); try { art.appendChild(drawScene('fall')); } catch (e) { /* no art */ } art.className = 'end-art'; $('end-title').after(art); }
  showOv('end');
};
function mrBoot() {
  setupObj();
  const relayout = () => setTimeout(() => { resize(); if (G && G.M) updateHud(); }, 250);
  window.addEventListener('orientationchange', relayout);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
  const set = (id, name) => { const e = $(id); if (e) e.src = resIcon(name); };
  set('i-food', 'food'); set('i-wood', 'wood'); set('i-gold', 'gold'); set('i-pop', 'pop'); set('i-idle', 'idle'); set('i-army', 'army');
  set('i-zin', 'plus'); set('i-zout', 'minus'); set('i-menu', 'menu');
  $('hud').hidden = true; showMenu(null); resize(); showOv('start');
  G = newM2Game(); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  view.zoom = view.w > 700 ? 0.7 : 0.5; centerOn(HILL.x + 4, HILL.y);
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
}
Object.assign(BRIEF, { ponhea: 'Your hero. Villagers repairing near him work 50% faster. If he falls, the mission is lost',
  sangha: 'Tap a river village to bless it and win it over', palisade: 'Earth dike: flood water cannot pass', towncentre: 'The royal palace of the new city' });
