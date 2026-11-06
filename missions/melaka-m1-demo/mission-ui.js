
/* ===== mission-ui.js ===== */
Object.assign(TRAIN_SHORT, { villager: 'Rakyat', sg_spear: 'Lembing', sg_sword: 'Hulubalang', sg_archer: 'Pemanah', sg_sumpit: 'Sumpit', olboat: 'Orang Laut', boat: 'Sampan' });
Object.assign(BUILD_SHORT, { wall: 'Wall', towncentre: 'Town' });
const PORTRAIT = '__PORTRAIT_PARAMESWARA__';
const TIPS = [
  'The Sejarah Melayu (Malay Annals) says Singapura fell to Majapahit when its treasurer opened the gates. The Portuguese writer Tomé Pires tells it differently: Siam drove Parameswara out. The sources disagree; this mission follows the Annals.',
  'Archaeologists have found Singapura\'s 14th-century earth wall and palace remains on Fort Canning Hill, the old Bukit Larangan, the Forbidden Hill.',
  'The Temenggung was a real office at Malay courts: the officer in charge of the guard, the city and its gates. This Temenggung is the game\'s own creation.',
  'The Orang Laut, the sea people of the Riau islands and the Strait, were sworn to Singapura\'s rulers and followed Parameswara to Melaka, where they became the core of its navy.',
  'The Annals say the strongman Badang served Singapura\'s second king, two generations before this night. The Singapore Stone is said to be part of the rock he threw.',
  'The sumpit (blowpipe) is a real weapon of the region. Its darts keep hurting for a few seconds after they hit.'
];
let storyOpen = null, missionSave = null;

/* ---------- small helpers the patched panel calls ---------- */
function civTitle() { return !G || !G.M || G.M.phase < 3 ? 'Singapura' : G.M.done.proclaim ? 'Melaka' : 'Singapura in exile'; }
function civSub() { return !G || !G.M || G.M.phase < 3 ? 'The Lion City' : G.M.done.proclaim ? 'A new kingdom' : 'Your new town at Bertam'; }
function homeKind() { return G && G.M && G.M.phase === 3 ? 'towncentre' : 'palace'; }
function homeBuilding() { return G.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0) || G.buildings.find(b => b.team === 0 && b.kind === 'palace' && b.hp > 0) || (G.M && G.M.royal && G.M.royal.hp > 0 && !G.M.royal.boarded ? G.M.royal : null); }
function canBoard(hit, us) { return !!(hit && UD[hit.kind].cap && us.some(u => u.layer === 0)); }
function missionBldCmds(b) {
  if (b.kind === 'towncentre' && b.team === 0 && b.done && G.M && G.M.phase === 3 && !G.M.done.proclaim) {
    const P = G.M.proclaim;
    if (P) return '<button class="cmd on" data-a="proclaim" title="The proclamation is under way"><img alt="" src="' + resIcon('check') + '"><span class="nm">Proclaim ' + Math.ceil(P.left) + 's</span><span class="ct">&nbsp;</span></button>';
    return cmdBtn('proclaim', 'proclaim', resIcon('check'), 'Proclaim', PROCLAIM_COST, 'Proclaim Melaka: your people and soldiers become Melaka');
  }
  if (b.kind !== 'gate' || b.team !== 0 || b.locked || b.hp <= 0) return '';
  return '<button class="cmd' + (b.open ? ' on' : '') + '" data-a="gate" title="' + (b.open ? 'Close the gate' : 'Open the gate') + '"><img alt="" src="' + bldIcon('gate', 0) + '"><span class="nm">' + (b.open ? 'Close' : 'Open') + '</span><span class="ct">&nbsp;</span></button>';
}
function doProclaim(b) {
  if (G.M.proclaim) { toast('The proclamation is under way.'); return; }
  const err = G.startProclaim(b); if (err) toast(err);
  panelKey = '';
}
function toggleGate(b) {
  if (!b || b.kind !== 'gate') return;
  if (b.locked) { toast('The treasurer keeps the key to this gate.'); return; }
  if (!G.setGate(b, !b.open)) toast('Clearing the gateway, then it closes.');
  panelKey = '';
}
function bldNote(b) {
  if (b.kind === 'wall') return 'Earth rampart and palisade. Villagers can repair it.';
  if (b.kind === 'gate') return b.betrayed ? 'Opened from inside, by the treasurer Sang Rajuna Tapa.' : b.locked ? 'The postern. The treasurer keeps its key.' : b.open ? 'Open: your people and the enemy can pass.' : 'Closed. Select it to open.';
  if (b.kind === 'village') return 'Batam, home of the Orang Laut, the sea people sworn to Singapura. Their boats wait in your harbour.';
  if (b.kind === 'bendahari') return 'The treasurer Sang Rajuna Tapa keeps the city\'s gold here, and the key to the west gate.';
  if (b.kind === 'palace' && b.team === 0) return 'Bukit Larangan, the Forbidden Hill. If it falls, Singapura falls.';
  return baseBldNote(b);
}

/* ---------- story cards ---------- */
function storyFor(id) {
  const M = G.M, P = (t) => '<p>' + t + '</p>';
  const portrait = '<img alt="Parameswara" src="' + PORTRAIT + '" style="width:72px;height:72px;flex:none;border:2px solid var(--edge-dark);image-rendering:pixelated">';
  const withPortrait = (t) => '<div style="display:flex;gap:10px;align-items:flex-start">' + portrait + '<p>' + t + '</p></div>';
  if (id === 'opening') return {
    tag: 'Melaka campaign · Mission 1 · c. 1398', title: 'The Treasurer\'s Gate',
    body: [withPortrait('Singapura, the old port of Temasek, has grown rich on the trade of the Strait and no longer sends homage to Java.'),
      P('Ayutthaya has already struck at the city once. Part of the south wall is still scorched and half-repaired.'),
      P('Now the sails of a Majapahit fleet fill the southern sea. The prince Parameswara holds Bukit Larangan, the Forbidden Hill. His Temenggung, captain of the guard, commands the walls.'),
      '<p class="goal">Objective: hold the walls until dawn.</p>',
      '<p class="lead tipline">' + TIPS[0] + '</p>'],
    btn: 'To the walls'
  };
  if (id === 'twist') return {
    tag: 'The fourth watch of the night', title: 'The Treasurer\'s Gate',
    body: [P('The royal treasurer, Sang Rajuna Tapa, had a daughter at court. On a rumour, the king had her put to death in the market place.'),
      P('A father\'s grief has become a door left open. Before dawn, the treasurer unbars the west gate, and Majapahit pours into the city.'),
      '<p class="quote">The Temenggung: "Go, Tuanku! The guard will hold the gate while you reach the boats."</p>',
      '<p class="goal">Objective: get Parameswara aboard an Orang Laut boat in the harbour, then sail west along the coast, past the Majapahit fleet, to the gold line.</p>',
      '<p class="lead tipline">' + TIPS[2] + ' Send him and his men to the west gate to buy time.</p>'],
    btn: 'Run'
  };
  if (id === 'strait') {
    const s = missionSave, n = s.saved.length - 1;
    const crew = Math.max(1, s.boats);
    return {
      tag: 'The Strait, at dawn', title: 'Up the Coast',
      body: [P('The Orang Laut, the sea people sworn to Singapura\'s kings, slip the boats through the Majapahit line. Behind them, the city burns.'),
        P((n > 0 ? n + ' of his people reached the boats with Parameswara' : 'Parameswara escaped almost alone') + (s.tempAlive ? ', and the Temenggung still lives.' : '. The Temenggung did not leave the gate.')),
        P('Ahead lies only coast, mangrove and the mouth of a quiet river. The Orang Laut crews (' + crew + ' spear-thrower' + (crew > 1 ? 's' : '') + ') come ashore with you. When the town is ready, Parameswara can proclaim it a new kingdom.'),
        '<p class="goal">Objective: build a Town Centre, two Houses and a fishing boat, defend the town, then save 400 food, wood and gold to proclaim Melaka.</p>',
        '<p class="lead tipline">' + TIPS[3] + '</p>'],
      btn: 'Land'
    };
  }
  if (id === 'closing') return {
    tag: 'Melaka, c. 1400', title: 'The Mouse Deer',
    body: [P('The exiles of Singapura are now the people of Melaka, and their colours are its green.'), withPortrait('Resting under a tree by the river, Parameswara watched his hunting dogs corner a small mouse deer. The little deer turned and kicked a dog into the water.'),
      P('The chronicles say he took it as a sign: here, the weak could stand against the strong. He asked the name of the tree. It was a melaka tree, and so the town was named.'),
      '<p class="legend">Told as legend: the founding story of the Sejarah Melayu.</p>',
      P('To the north, Ayutthaya already counts the new port among its vassals. Melaka will have to choose between paying homage and going to war.')],
    btn: 'Finish'
  };
  return null;
}
function showStory(id) {
  const s = storyFor(id); if (!s) return;
  storyOpen = id; paused = true; SFX.play(id === 'closing' ? 'nobat' : 'gong');
  $('st-tag').textContent = s.tag; $('st-title').textContent = s.title; $('st-art').innerHTML = '';
  try { $('st-art').appendChild(drawScene(id)); } catch (e) { console.warn('scene', id, e); }
  $('st-body').innerHTML = s.body.join(''); $('st-btn').textContent = s.btn || 'Continue';
  showOv('story');
}
function closeStory() {
  const id = storyOpen; if (!id) return;
  storyOpen = null; showOv(null); paused = false;
  if (id === 'twist') startPhase2(G);
  else if (id === 'strait') startPhase3();
  else if (id === 'closing') { G.M.won = true; G.checkEnd(); }
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-do="story"]')) closeStory(); });
window.addEventListener('keydown', (e) => { if (storyOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopImmediatePropagation(); closeStory(); } }, true);

/* ---------- HUD ---------- */
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  if (M.phase === 1) {
    const weak = G.buildings.find(b => b.team === 0 && (b.kind === 'wall' || b.kind === 'gate') && b.hp < b.maxHp * 0.5);
    const fixing = G.units.some(u => u.team === 0 && u.order.t === 'repair');
    if (weak && !fixing) return 'A wall is weakening! Select villagers and tap it to repair.';
    if (M.t < 25) return 'Majapahit will land on the south beach. Hold the walls until dawn.';
    return 'Hold the walls of Singapura until dawn.';
  }
  if (M.phase === 2) {
    const st = G.royalState();
    if (st === 'land') return 'Get Parameswara to the harbour: select him, then tap an Orang Laut boat.';
    return 'Sail Parameswara\'s boat west to the gold line. Hug the shore to stay out of the warships\' reach. Load others first if you can.';
  }
  const d = M.done;
  if (M.raid && M.raid.ids && !d.raid) return 'Raiders landing! Defend the new town (' + M.raid.left + ' left).';
  if (!d.tc) return 'Select villagers and build a Town Centre near the flag.';
  if ((d.houses || 0) < 2) return 'Build Houses for your people (' + Math.min(2, d.houses || 0) + '/2).';
  if (!d.boat) return 'Build a Port, then a fishing boat.';
  if (M.proclaim && !d.proclaim) return 'Proclaiming Melaka: ' + Math.ceil(M.proclaim.left) + 's. Guard the Town Centre.';
  if (!d.proclaim) return 'Save 400 food, wood and gold, then select the Town Centre and tap Proclaim.';
  return 'Melaka takes root. Keep your people safe.';
}
/* ---------- objectives panel (tap the bar under the resources to open or close it) ---------- */
let objOpen = true, objKey = '', objPhase = 0, objAuto = 0;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'fallen';
  if (M.phase === 1) {
    const pal = G.buildings.find(b => b.kind === 'palace' && b.team === 0);
    return { title: 'Defend Singapura', items: [
      { t: 'Hold the walls until dawn (' + fmtTime(Math.max(0, MS.dawn - M.t)) + ')', ok: false, how: 'Select villagers and tap a damaged wall to repair it. Train soldiers at the Barracks and send them where the enemy climbs.' },
      { t: 'Keep Bukit Larangan standing (' + pct(pal) + ')', ok: false, how: 'Keep a few soldiers by the palace to catch anyone who gets through the walls.' },
      { t: 'Keep Parameswara alive', ok: false, how: 'Keep him back from the fighting, behind the walls.' }] };
  }
  if (M.phase === 2) {
    const st = G.royalState(), tm = M.temenggung;
    return { title: 'Escape by sea', items: [
      { t: 'Get Parameswara aboard an Orang Laut boat', ok: st !== 'land', how: 'Select Parameswara, then tap an Orang Laut boat at the harbour.' },
      { t: 'Sail his boat west to the gold line', ok: st === 'out', how: 'Select his boat and tap the water past the gold line in the west. Hug the shore to stay out of the warships\' reach.' },
      { t: 'Optional: save more people (' + M.saved.length + ' safe, ' + G.units.filter(u => u.kind === 'olboat' && u.team === 0).reduce((a, b) => a + (b.cargo ? b.cargo.length : 0), 0) + ' aboard)', ok: false, opt: true, how: 'Select people, tap an empty boat to take them aboard, then sail it west too.' },
      { t: 'Optional: the Temenggung holds the gate (' + (M.tempDead == null ? pct(tm) : 'fallen') + ')', ok: false, opt: true }] };
  }
  const d = M.done, items = [
    { t: 'Build a Town Centre near the flag', ok: !!d.tc, how: 'Select villagers and build a Balai (Town Centre) next to the gold flag.' },
    { t: 'Build two Houses (' + Math.min(2, d.houses || 0) + '/2)', ok: (d.houses || 0) >= 2, how: 'Select villagers and build two Rumah (House).' },
    { t: 'Build a Port and a fishing boat', ok: !!d.boat, how: 'Build a Pelabuhan (Port) on the shore, then select it and train a Sampan (fishing boat).' },
    { t: M.raid && M.raid.ids ? 'Drive off the raiders' + (d.raid ? '' : ' (' + M.raid.left + ' left)') : 'Defend the new town', ok: !!d.raid, how: 'Gather your soldiers and send them at the raiders where they land.' },
    { t: M.proclaim && !d.proclaim ? 'Proclaiming Melaka (' + Math.ceil(M.proclaim.left) + 's)' : 'Proclaim Melaka at the Town Centre (400 food, wood, gold)', ok: !!d.proclaim,
      how: M.proclaim ? 'Guard the Balai until the count ends.' : 'Gather 400 food, wood and gold, then select the Balai and tap Proclaim.' },
    { t: 'Keep Parameswara alive', ok: false, how: 'Keep him away from the raiders.' }];
  return { title: 'Found Melaka', items };
}
function updateObj() {
  const box = $('obj'); if (!box) return;
  const M = G.M;
  if (M && M.phase !== objPhase) { objPhase = M.phase; objOpen = true; objAuto = performance.now() + 9000; }
  if (objAuto && performance.now() > objAuto) { objAuto = 0; if (view.w < 700) objOpen = false; }
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
function updateHud() {
  const r = G.res[0], M = G.M;
  sel = sel.filter(o => !o.boarded);
  $('v-food').textContent = Math.floor(r.food); $('v-wood').textContent = Math.floor(r.wood); $('v-gold').textContent = Math.floor(r.gold);
  const gn = { food: 0, wood: 0, gold: 0 };
  for (const u of G.units) if (u.team === 0 && u.hp > 0 && u.order.t === 'gather' && gn[u.order.type] != null) gn[u.order.type]++;
  for (const k in gn) { const e = $('g-' + k), t = '(' + gn[k] + ')'; if (e.textContent !== t) e.textContent = t; e.classList.toggle('zero', gn[k] === 0); }
  const pop = G.popOf(0), cap = G.popCap(0); $('v-pop').textContent = pop + '/' + cap;
  $('pop-chip').classList.toggle('warn', pop >= cap && M && M.phase !== 2);
  $('hint').textContent = hintText(); updateObj();
  if (M && M.proclaim && !M.done.proclaim && sel[0] && sel[0].kind === 'towncentre') panelKey = '';
  if (M && M.converted && !M.colourDone) { M.colourDone = 1; setPlayerCiv('melaka'); sel = []; panelKey = ''; vignette('proclaim', 'Parameswara proclaims Melaka. Its people take up its green.'); }
  if (M && M.tempDead != null && !M.vigFall) { M.vigFall = 1; vignette('fall', 'The Temenggung has fallen at the gate. His stand bought the prince his chance.'); }
  let clock = fmtTime(G.t);
  if (M && M.phase === 1) clock = 'Dawn in ' + fmtTime(MS.dawn - M.t);
  else if (M && M.phase === 2) { const tm = M.temenggung; clock = (M.tempDead == null && tm && tm.hp > 0 ? 'Gate holds ' + Math.ceil(tm.hp / tm.maxHp * 100) + '%' : 'Gate lost') + '  Dawn ' + fmtTime(Math.max(0, MS.dawn - M.t)); }
  else if (M && M.phase === 3) clock = fmtTime((missionSave ? missionSave.t : 0) + G.t);
  $('clock').textContent = clock;
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); const fx = sfxForMsg(m.text); if (fx) SFX.play(fx); }
  sfxTick();
  // the script asks for a card
  if (M && M.cardQ.length && !G.over && !storyOpen) {
    const c = M.cardQ.shift();
    if (c === 'siam') { SFX.play('warn'); vignette('siam', 'A scout: "Siamese sails to the north!" Ayutthaya is watching.'); G.alerts.push({ x: 60, y: 36, t: 3 }); }
    else showStory(c);
  }
}

/* ---------- game flow ---------- */
function loadMap(g) {
  G = g; objPhase = 0; terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  sel = []; mode = null; markers = []; boxRect = null; panelKey = ''; ended = false; acc = 0; seenMsgs = new WeakSet(); idleIdx = 0;
  view.zoom = view.w > 700 ? 1.5 : 1; resize();
}
function startGame(seed) {
  seedUsed = seed; missionSave = null; storyOpen = null;
  setPlayerCiv('sg');
  loadMap(new Game({ seed, diff, map: 'temasek' }));
  centerOn(mx(31), sy(12));
  select([G.M.temenggung]);
  started = true; paused = false; $('hud').hidden = false; showOv(null); updateHud(); updatePanel();
  showStory('opening');
}
function startPhase3() {
  const s = missionSave;
  setPlayerCiv('sg');
  const g = new Game({ seed: seedUsed + 7, diff, map: 'bertam', carry: { units: s.saved, boats: s.boats } });
  g.stats.kills = s.kills; g.stats.lost = s.lost; g.stats.trained = s.trained;
  loadMap(g);
  centerOn(mx(26), my(32));
  const v = G.units.find(u => u.team === 0 && u.kind === 'villager'); if (v) select([v]);
  started = true; paused = false; showOv(null); updateHud(); updatePanel();
}
function togglePause() {
  if (storyOpen) return;
  baseTogglePause();
  if (paused && !ended) $('pause-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
}
function endGame() {
  const M = G.M;
  if (G.over === 'next') {
    ended = true;
    missionSave = { saved: M.saved.slice(), boats: M.boatsOut, kills: G.stats.kills, lost: G.stats.lost, trained: G.stats.trained, t: G.t, held: M.heldFor, tempAlive: M.tempDead == null && M.saved.some(c => c.kind === 'temenggung') };
    showStory('strait');
    return;
  }
  ended = true; paused = true;
  const win = G.over === 'win', s = missionSave;
  $('end-tag').textContent = win ? 'Mission complete' : 'Mission failed';
  $('end-title').textContent = win ? 'Melaka is founded' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  $('end-sub').textContent = win ? 'A fishing village on a river mouth, and a prince with little left but his people. Within a lifetime it will be the greatest port of the age.'
    : M.why === 'palace' ? 'Bukit Larangan has fallen before dawn. Singapura is lost, and its prince with it.'
    : 'Parameswara has fallen. With him ends the line of Singapura\'s kings.';
  const total = (s && M.phase === 3 ? s.t : 0) + G.t;
  const saved = s ? s.saved.length : M.saved.length;
  const held = s ? s.held : M.heldFor;
  $('end-stats').innerHTML = '<div><b>' + fmtTime(total) + '</b><span>Time</span></div><div><b>' + saved + '</b><span>People saved</span></div>' +
    '<div><b>' + G.stats.kills + '</b><span>Enemies defeated</span></div><div><b>' + (M.phase === 1 ? '-' : fmtTime(held)) + '</b><span>Temenggung held the gate</span></div>';
  showOv('end');
  SFX.play(win ? 'victory' : 'defeat');
}
/* ---------- chapter select: start at the escape or the founding without replaying the siege ---------- */
let chapter = 1;
function startChapter(n) {
  chapter = n || 1;
  startGame(seedUsed);
  if (chapter === 1) return;
  storyOpen = null; showOv(null); paused = false;
  if (chapter === 2) { G.M.t = MS.twist - 1; G.M.wave = MS.waves.length; G.M.heldFor = 0; return; }
  // the founding: the usual escape, where the Temenggung falls at the gate and the prince gets away with a boatload of his people
  const saved = [{ kind: 'parameswara', hp: 240 }];
  for (const k of ['villager', 'villager', 'villager', 'villager', 'sg_spear', 'sg_archer']) saved.push({ kind: k, hp: UD[k].hp });
  missionSave = { saved, boats: 2, kills: 0, lost: 0, trained: 0, t: MS.dawn, held: 60, tempAlive: false };
  ended = true; paused = true;
  showStory('strait');
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-chap]'); if (b) startChapter(+b.dataset.chap); });

function missionBoot() {
  setupObj(); setupSound();
  const set = (id, name) => { const e = $(id); if (e) e.src = resIcon(name); };
  set('i-food', 'food'); set('i-wood', 'wood'); set('i-gold', 'gold'); set('i-pop', 'pop'); set('i-idle', 'idle'); set('i-army', 'army');
  set('i-zin', 'plus'); set('i-zout', 'minus'); set('i-menu', 'menu');
  $('hud').hidden = true; resize(); showOv('start');
  // a quiet preview of the city behind the title screen
  setPlayerCiv('sg');
  G = new Game({ seed: seedUsed, diff, map: 'temasek' }); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  view.zoom = view.w > 700 ? 1.5 : 1; centerOn(mx(31), sy(10));
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
  const h = (location.hash || '').slice(1);
  if (h === 'escape') startChapter(2); else if (h === 'founding') startChapter(3);
}
