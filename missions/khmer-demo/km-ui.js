/* ===== km-ui.js ===== */
Object.assign(TRAIN_SHORT, { villager: 'Neak Srae', shield: 'Shield', spear: 'Spear', sna: 'Sna', cart: 'Ballista', vaidya: 'Vaidya', bal: 'Bal. Eleph.', boat: 'Touk', canoe: 'Canoe', barge: 'Barge' });
Object.assign(BUILD_SHORT, { house: 'House', farm: 'Srae', granary: 'Rice store', barracks: 'Barracks', karogya: 'Arogyasala', baray: 'Baray', tower: 'Tower', wall: 'Wall', port: 'Landing' });
const TIPS = [
  'Angkor Thom\'s walls run about 3 km on each side, 8 m high, behind a moat 100 m wide. Its gates are crowned with great stone faces looking out in every direction.',
  'King Jayavarman VII built Angkor Thom and the Bayon in the late 1100s. He also built over a hundred hospitals, the arogyasala, across his kingdom.',
  'Laterite is a red stone dug soft from the ground that hardens in the air. Fire cannot burn it: only Ayutthaya\'s elephants can break the gates.',
  'The great reservoirs, the baray, held a lake\'s worth of water. The West Baray is about 8 km long and still holds water today.',
  'The Bayon\'s walls are carved with the Khmer army: spearmen with tall shields, crossbows mounted on elephants and on carts, and a battle of war canoes on the great lake.',
  'Cambodian tradition says Angkor fell in 1431 through treachery inside the walls. The Thai chronicles say Ayutthaya carried home people, treasure and bronze statues.',
  'Bronze statues taken from Angkor were carried to Ayutthaya, and later to Burma. Some are said to stand today in Mandalay.',
  'After the siege King Ponhea Yat moved the court south to the Mekong. A few years later he founded a new capital at Chaktomuk, where four rivers meet: today\'s Phnom Penh.',
  'The Tonlé Sap, the great lake below Angkor, swells to several times its size in the wet season, when the Mekong pushes its water back up the river.',
  'Angkor was never fully abandoned. Monks kept praying at Angkor Wat through all the centuries that followed, and it is on Cambodia\'s flag today.'
];
let storyOpen = null;

/* ---------- panel additions (the patched panel calls these) ---------- */
function kmPanelKey(us) {
  const M = G.M; if (!M) return '';
  const g = Object.keys(GATES).map(k => { const b = G.byId.get(M.gates[k]); return b ? (b.open ? 'o' : 'c') : 'x'; }).join('');
  return M.phase + '|' + LOADS.map(L => M.loads[L.key].st[0]).join('') + '|' + M.courtReady + '|' + g + '|' + !!M.king;
}
function kmUnitCmds(us) { return ''; }
function kmBldCmds(b) {
  if (b.team !== 0 || b.hp <= 0 || !b.done) return '';
  const M = G.M;
  if (b.kind === 'kgate') return '<button class="cmd' + (b.open ? ' on' : '') + '" data-a="gate" title="' + (b.open ? 'Close the gate' : 'Open the gate (Ayutthaya can come in too)') + '"><img alt="" src="' + bldIcon('kgate', 0) + '"><span class="nm">' + (b.open ? 'Close' : 'Open') + '</span><span class="ct">&nbsp;</span></button>';
  if (b.id === M.court) {
    let s = '';
    for (const L of LOADS) {
      const st = M.loads[L.key].st;
      if (st !== 'home' || M.phase < L.phase) continue;
      const ready = L.key !== 'royal' || (M.courtReady && M.king);
      const label = { monks: 'Monks', treasury: 'Treasury', statue1: 'Buddha', statue2: 'Vishnu', texts: 'Texts', royal: 'Royals' }[L.key];
      s += cmdBtn('load', L.key, unitIcon(L.kind, 0), label, L.key === 'royal' ? null : LOAD_COST, 'Send ' + L.name.toLowerCase().replace(/^the /, 'the ') + ' to the river', ready ? '' : 'disabled');
    }
    return s;
  }
  return '';
}
function kmPanelAction(a, el) {
  if (a === 'gate') { const b = sel[0]; if (!G.setGate(b, !b.open)) toast('Clearing the gateway, then it closes.'); else toast(b.open ? 'The ' + GATES[b.gk].name + ' is open. Ayutthaya can come in too!' : 'The ' + GATES[b.gk].name + ' is shut.'); panelKey = ''; return true; }
  if (a === 'load') {
    const err = G.sendLoad(el.dataset.k);
    if (err) toast(err); else { SFX.play('bell'); const u = G.byId.get(G.M.loads[el.dataset.k].id); if (u) centerOn(u.x, u.y + 4); }
    panelKey = ''; return true;
  }
  if (a === 'elephants') {
    const l = G.units.filter(u => u.team === 0 && u.hp > 0 && (u.cls === 'eleph' || u.cls === 'siege'));
    if (!l.length) { toast('No ballistae. Train Cart Ballistae at the Barracks and Ballista Elephants at the Prasat palace.'); return true; }
    select(l); centerOn(l[0].x, l[0].y); return true;
  }
  return false;
}
function describeOrder(u) {
  const o = u.order;
  if (o.t === 'repair') return 'Repairing';
  if (o.t === 'refuge') return 'Running for the gate';
  if (u.cls === 'load' && o.t !== 'move') return u.lst === 'wait' ? 'Waiting for a barge' : u.lst === 'dock' ? 'Going down to the landing' : 'On the road to the South Gate';
  if (u.cargo) return 'Rowing for the open lake';
  if (UD[u.kind].barge && o.t === 'idle') return 'Waiting at the landing';
  return baseDescribeOrder(u);
}
function bldNote(b) {
  const M = G.M;
  if (b.id === M.court) return 'The royal compound. Send the monks, the treasures and, last of all, the royal family to the river from here.';
  if (b.kind === 'kgate') return b.open ? 'Open: your people can go out, and Ayutthaya can come in.' : 'Sandstone and laterite. Fire will not catch. Only elephants break it. Rice farmers can repair it.';
  if (b.kind === 'kwall') return 'Laterite, 8 m high. Nothing breaks it.';
  if (b.kind === 'wall') return 'Laterite. Fire will not catch.';
  if (b.kind === 'kpalace') return 'Trains the Ballista Elephant: long range, deadly to elephants and boats near the shore.';
  if (b.kind === 'karogya') return 'Trains the Vaidya, physicians. Wounded units resting beside it heal.';
  if (b.kind === 'baray') return 'Worked rice fields within ' + BARAY.rng + ' tiles bring in +' + BARAY.food + ' food every ' + BARAY.every + ' s. Walls and towers near it are repaired faster.';
  if (b.kind === 'bayon') return 'The Bayon: the temple at the heart of the city, its towers carved with calm stone faces.';
  if (b.id === M.port) return 'The river landing. Build barges here: each carries one load to the far end of the lake. War canoes guard them.';
  if (b.outer) return 'Timber and thatch outside the moat: fire arrows set it alight.';
  if (b.outpost) return 'An outwork guarding the west causeway.';
  if (b.kind === 'towncentre' && b.team === 1) return 'Ayutthaya\'s royal camp. The attacks come from here.';
  return baseBldNote(b);
}

/* ---------- walls: tap ✓ at each corner and the blocks join up in a straight run ---------- */
function linePts(x0, y0, x1, y1) {
  const out = [[x0, y0]]; let x = x0, y = y0;
  while (x !== x1 || y !== y1) {
    const dx = x1 - x, dy = y1 - y;
    if (Math.abs(dx) * Math.abs(y1 - y0) >= Math.abs(dy) * Math.abs(x1 - x0) && dx) x += Math.sign(dx); else y += Math.sign(dy);
    out.push([x, y]);
  }
  return out;
}
function tryPlace(keep) {
  if (!mode || mode.kind !== 'place' || mode.bkind !== 'wall' || mode.tx == null) return baseTryPlace(keep);
  const ids = selUnits().filter(u => u.cls === 'vil').map(u => u.id), a = mode.anchor;
  const pts = a && Math.hypot(a.x - mode.tx, a.y - mode.ty) < 24 ? linePts(a.x, a.y, mode.tx, mode.ty).slice(1) : [[mode.tx, mode.ty]];
  let placed = 0, last = null, why = null;
  for (const [x, y] of pts) {
    if (!G.canPlace('wall', x, y, 0)) continue;
    const r = G.placeBuilding(0, 'wall', x, y, ids);
    if (!r.ok) { why = r.why; break; }
    placed++; last = [x, y];
  }
  if (!placed) { toast(why || 'Cannot build there.'); return false; }
  mode.anchor = { x: last[0], y: last[1] };
  addMarker(last[0] + 0.5, last[1] + 0.5, 'build');
  toast(placed + ' block' + (placed > 1 ? 's' : '') + ' of wall. Move on and tap ✓ for the next run, ✗ to stop.');
  panelKey = ''; return true;
}

/* ---------- story cards ---------- */
function savedList() {
  const M = G.M, s = [], l = [];
  for (const L of LOADS) { if (L.key === 'royal') continue; (M.loads[L.key].st === 'saved' ? s : l).push(L.name.replace(/^The /, 'the ')); }
  return { s, l };
}
function stars() { const n = G.M.saved; return n >= 5 ? 3 : n >= 3 ? 2 : 1; }
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>', M = G.M;
  if (id === 'opening') return {
    tag: 'Khmer · Kingdom Age · Srok · 1431', title: 'The Gates of Angkor',
    body: [P('For centuries Yasodharapura, the city of Angkor, was the greatest city on the mainland. Now the army of Ayutthaya, the river kingdom to the west, is camped before its walls.'),
      P('King Ponhea Yat knows the city cannot hold for ever. Before it falls, he will send its monks, its treasures and its sacred statues south by river, and then go himself.'),
      P('Ayutthaya is not your villain. It is a young kingdom, growing strong, fighting for the same river plains.'),
      '<p class="goal">Objective: hold the gates. From the royal compound, send each load to the South Gate. It slips out by the postern door and boards a barge at the landing. Get the royal family out last.</p>',
      '<p class="lead tipline">Fire arrows barely scorch your stone. The war elephants are the danger: only they break a gate. Meet them with spearmen and ballistae, and send rice farmers to repair a battered gate.</p>'],
    btn: 'Man the walls'
  };
  if (id === 'river') return {
    tag: 'The siege · 1431', title: 'The River',
    body: [P('The siege has lasted months. Ayutthaya\'s war boats have come up the lake to cut the city off from the south, and its army now attacks the North and South gates as well.'),
      P('The two great bronze statues and the sacred texts are ready to leave. The barges must get past the boats on the far reach of the lake.'),
      '<p class="goal">Objective: send the statues and the texts down the river. Build war canoes at the landing to clear the way, and keep the South Gate standing.</p>',
      '<p class="lead tipline">' + TIPS[4] + '</p>'],
    btn: 'To the river'
  };
  if (id === 'fall') return {
    tag: 'Yasodharapura · 1431', title: 'The City Falls',
    body: [P(M.breach ? 'The ' + GATES[M.breach].name + ' has given way, and Ayutthaya pours into the city. King Borommarachathirat II rides at its head.' : 'King Borommarachathirat II himself rides against the walls with every elephant he has. The council tells Ponhea Yat the city cannot hold another day.'),
      P('The court gathers at the royal compound. When it is ready, Ponhea Yat and the royal family will walk to the river. The royal barge is waiting at the landing.'),
      '<p class="goal">Objective: hold the royal compound until the court is ready, then send the royal family to the royal barge. Anything still in the city will be lost.</p>',
      '<p class="lead tipline">If Ponhea Yat falls now, the kingdom falls with him.</p>'],
    btn: 'Hold the court'
  };
  if (id === 'closing') {
    const L = savedList();
    return {
      tag: 'The Tonlé Sap, 1431', title: 'The Kingdom Goes On',
      body: [P('The royal barge reaches the open lake at dawn. Behind it, the towers of Angkor grow small.'),
        P(L.s.length ? 'Saved: ' + L.s.join(', ') + '.' : 'Nothing else was saved but the royal family.'),
        L.l.length ? P('Taken west to Ayutthaya: ' + L.l.join(', ') + '.') : P('Nothing was left behind for Ayutthaya.'),
        P('Ponhea Yat went south to where four rivers meet, and there built a new capital. The kingdom lived on.'),
        '<p class="quote">The city fell. The kingdom went on.</p>',
        P('Neither side was a villain. Two neighbouring kingdoms fought for the same river plains. Their dances, their scripts and their royal courts still share much of what Angkor began.')],
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
  SFX.play('conch');
}
function closeStory() {
  const id = storyOpen; if (!id) return;
  storyOpen = null; showOv(null); paused = false;
  if (id === 'closing') { G.M.won = true; G.checkEnd(); }
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-do="story"]')) closeStory(); });
window.addEventListener('keydown', (e) => { if (storyOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopImmediatePropagation(); closeStory(); } }, true);
function vignette(id, text) {
  const box = $('vignette'); if (!box) return;
  box.innerHTML = ''; try { box.appendChild(drawScene(id)); } catch (e) { /* text only */ }
  const p = document.createElement('div'); p.textContent = text; box.appendChild(p);
  box.hidden = false; clearTimeout(vignette.t);
  vignette.t = setTimeout(() => { box.hidden = true; }, 6500);
}

/* ---------- HUD ---------- */
function gateWord(k) { const b = G.byId.get(G.M.gates[k]); return b ? Math.ceil(b.hp / b.maxHp * 100) + '%' + (b.open ? ' open' : '') : 'broken'; }
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  const idle = idleVillagers().length;
  const L = (k) => M.loads[k].st;
  const wait = LOADS.find(l => L(l.key) === 'road' && (G.byId.get(M.loads[l.key].id) || {}).lst === 'wait' && l.key !== 'royal');
  const bargeFree = G.units.some(u => u.team === 0 && u.hp > 0 && u.kind === 'barge' && !u.cargo);
  if (M.gateHitT && G.t - M.gateHitT < 4) return 'Elephants are battering the ' + GATES[M.gateHitK].name + ' (' + gateWord(M.gateHitK) + '). Spearmen and ballistae kill them; rice farmers repair the gate.';
  if (wait && !bargeFree) return L(wait.key) && wait.name + ' wait at the landing. Select the River landing and build a barge.';
  if (M.phase >= 3) {
    if (L('royal') === 'home') return M.courtReady ? (M.king ? 'The court is ready! Select the royal compound and tap Royals to send them to the royal barge.' : 'The court is ready, but Ponhea Yat is wounded. He returns soon.') : 'The court gathers: ready in ' + Math.ceil(M.courtAt - M.t) + 's. Hold the royal compound!';
    if (L('royal') === 'road') return 'Guard the royal family on the road to the South Gate and the landing.';
    return 'The royal barge is on the lake. Keep Ayutthaya\'s boats away from it!';
  }
  const open = LOADS.find(l => L(l.key) === 'home' && M.phase >= l.phase && l.key !== 'royal');
  if (M.t > 25 && open) return 'Select the royal compound and send ' + open.name.replace(/^The /, 'the ') + ' to the river.';
  if (idle > 2) return idle + ' rice farmers are idle. Tap the idle button to put them to work.';
  if (M.phase === 2 && !G.units.some(u => u.team === 0 && u.kind === 'canoe' && u.hp > 0)) return 'Ayutthaya\'s war boats hold the far reach. Build war canoes at the River landing.';
  return 'Hold the gates. Next attack in ' + fmtTime(Math.max(0, M.next - M.t)) + '.';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function loadLine(L) {
  const M = G.M, s = M.loads[L.key], u = G.byId.get(s.id);
  if (s.st === 'saved') return { t: L.name + ': saved', ok: true };
  if (s.st === 'lost') return { t: L.name + ': lost', opt: true, lost: true };
  if (s.st === 'river') return { t: L.name + ': on the lake' };
  if (s.st === 'road') return { t: L.name + ': ' + (u && u.lst === 'wait' ? 'waiting for a barge' : 'on the road'), how: u && u.lst === 'wait' ? 'Build a river barge at the landing.' : '' };
  if (M.phase < L.phase) return { t: L.name + ': ' + (L.phase === 2 ? 'not ready (the river phase)' : 'last of all'), opt: true };
  if (L.key === 'royal' && !M.courtReady) return { t: L.name + ': the court gathers (' + Math.max(0, Math.ceil(M.courtAt - M.t)) + 's)' };
  return { t: L.name + ': ready to send', how: 'Select the royal compound and tap this load, then build a barge at the river landing for it.' };
}
function objList() {
  const M = G.M; if (!M) return null;
  const items = LOADS.map(loadLine);
  items.push({ t: 'Gates: West ' + gateWord('w') + ' · North ' + gateWord('n') + ' · South ' + gateWord('s'), opt: true });
  items.push({ t: 'Ponhea Yat: ' + (M.heroBack.ponhea ? 'wounded, back in ' + Math.ceil(M.heroBack.ponhea - M.t) + 's' : M.king ? Math.ceil(M.king.hp / M.king.maxHp * 100) + '%' : M.loads.royal.st !== 'home' ? 'with his family' : '-') + (M.phase < 3 ? ' · Next attack ' + fmtTime(Math.max(0, M.next - M.t)) : ''), opt: true });
  items.push({ t: M.phase === 1 ? 'Each load walks to the South Gate, slips out by the postern, and boards a barge at the landing. Each needs its own barge.' : M.phase === 2 ? 'Barges row east along the lake. Ayutthaya\'s boats wait on the far reach: clear them with war canoes and ballistae on the shore.' : 'Lose if the royal compound falls before the royal family leaves, or if Ponhea Yat falls.', tip: true });
  return { title: M.phase === 1 ? 'Hold the gates' : M.phase === 2 ? 'The river' : 'The city falls', items };
}
function updateObj() {
  const box = $('obj'); if (!box) return;
  if (!objStarted && G.M && started) { objStarted = true; objOpen = true; objAuto = performance.now() + 10000; }
  if (objAuto && performance.now() > objAuto) { objAuto = 0; if (view.w < 700 || view.h < 520) objOpen = false; }
  const L = !G.over && objList();
  $('obj-tog').textContent = objOpen ? '▴' : '▾';
  if (!L || !objOpen) { if (!box.hidden) box.hidden = true; objKey = ''; return; }
  const html = '<div class="obj-h">' + L.title + '</div>' + L.items.map(i =>
    '<div class="obj-i' + (i.ok ? ' ok' : '') + (i.opt ? ' opt' : '') + (i.tip ? ' tip' : '') + (i.lost ? ' lost' : '') + '"><span>' + (i.tip ? '·' : i.ok ? '✓' : i.lost ? '✗' : '○') + '</span><div>' + i.t + (i.how && !i.ok ? '<div class="obj-how">' + i.how + '</div>' : '') + '</div></div>').join('');
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
  $('v-food').textContent = Math.floor(r.food); $('v-wood').textContent = Math.floor(r.wood); $('v-gold').textContent = Math.floor(r.gold);
  const gn = { food: 0, wood: 0, gold: 0 };
  for (const u of G.units) if (u.team === 0 && u.hp > 0 && u.order.t === 'gather' && gn[u.order.type] != null) gn[u.order.type]++;
  for (const k in gn) { const e = $('g-' + k), t = '(' + gn[k] + ')'; if (e.textContent !== t) e.textContent = t; e.classList.toggle('zero', gn[k] === 0); }
  const pop = G.popOf(0), cap = G.popCap(0); $('v-pop').textContent = pop + '/' + cap;
  $('pop-chip').classList.toggle('warn', pop >= cap);
  $('hint').textContent = hintText(); updateObj();
  let clock = fmtTime(G.t);
  if (M) clock = M.phase >= 3 ? (M.loads.royal.st === 'home' ? (M.courtReady ? 'Court ready' : 'Court ' + fmtTime(Math.max(0, M.courtAt - M.t))) : 'To the lake') : 'Attack in ' + fmtTime(Math.max(0, M.next - M.t));
  $('clock').textContent = clock;
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); const fx = sfxForMsg(m.text); if (fx) SFX.play(fx); }
  sfxTick();
  if (M && M.cardQ.length && !G.over && !storyOpen) {
    const c = M.cardQ.shift();
    if (c === 'postern') vignette('postern', 'The great doors stay shut. Each load slips out by the small postern door beside the South Gate, then down to the landing.');
    else if (c === 'vig-barge') vignette('barge', 'The first barge pushes off from the landing and rows east along the lake.');
    else showStory(c);
  }
  if (M && M.lostNote && M.lostNote !== M.lostShown) { M.lostShown = M.lostNote; vignette('lost', LOADS.find(L => L.key === M.lostNote.key).name + (M.lostNote.where === 'river' ? ' went down with its barge.' : ' is taken. It will go west to Ayutthaya.')); }
}

/* ---------- game flow ---------- */
function loadMap(g) {
  G = g; terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  sel = []; mode = null; markers = []; boxRect = null; panelKey = ''; ended = false; acc = 0; seenMsgs = new WeakSet(); idleIdx = 0; objStarted = false;
  view.zoom = view.w > 700 ? 1.3 : 1; resize();
}
function startGame(seed) {
  seedUsed = seed; storyOpen = null;
  loadMap(new Game({ seed, diff }));
  centerOn(46, 20);
  select([G.M.king]);
  started = true; paused = false; $('hud').hidden = false; showOv(null); updateHud(); updatePanel();
  showStory('opening');
}
// practice: start later in the siege with what a player would have by then
function skipTo(stage) {
  startGame(seedUsed);
  storyOpen = null; showOv(null); paused = false;
  const M = G.M, put = (k, x, y) => { const p = G.openSpot(x, y, UD[k].layer || 0); return G.addUnit(k, 0, p.x, p.y); };
  for (const id of M.outer.concat(M.outposts)) { const b = G.byId.get(id); if (b) { b.hp = 0; G.onKilled(b, { team: 1 }); } }
  G.cleanup();
  for (const u of G.units) if (u.outerFarmer || u.outerGuard) { u.hp = 0; u.silent = true; }
  for (const u of G.units) if (u.team === 1 && u.guard) { /* the camp guard stays */ }
  G.res[0] = { food: 700, wood: 600, gold: 500 };
  M.loads.monks.st = 'saved'; M.loads.treasury.st = 'saved'; M.saved = 2; M.firstSent = true;
  const army = { spear: 4, sna: 3, shield: 2 };
  let i = 0; for (const k in army) for (let j = 0; j < army[k]; j++, i++) put(k, 44 + (i % 5) * 0.9, 33 + Math.floor(i / 5) * 0.9);
  put('canoe', M.dockW.x + 1, M.dockW.y + 1); put('barge', M.dockW.x - 1, M.dockW.y);
  M.t = PHASE.river - 1; M.wave = 4; M.next = M.t + 50;
  if (stage === 'fall') {
    const g = G.byId.get(M.gates.w); g.hp = 0; G.onKilled(g, { team: 1 }); G.cleanup();
    M.loads.statue1.st = 'saved'; M.saved = 3;
    M.t = PHASE.river + 200; M.phase = 2; M.wave = 6;
    centerOn(46, 18); G.msg('Practice: the West Gate is broken. Hold the court and get the royal family out.');
  } else { centerOn(48, 36); G.msg('Practice: the monks and the treasury are away. Now the river.'); }
}
function togglePause() {
  if (storyOpen) return;
  baseTogglePause();
  if (paused && !ended) $('pause-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
}
function endGame() {
  const M = G.M;
  ended = true; paused = true;
  const win = G.over === 'win', st = win ? stars() : 0;
  $('end-tag').textContent = win ? 'Demo complete' : 'The court is lost';
  $('end-title').textContent = win ? 'The Kingdom Goes On' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  $('end-sub').textContent = win ? '★'.repeat(st) + '☆'.repeat(3 - st) + '  ' + M.saved + ' of 5 loads saved with the royal family. The court has gone south, and the temples stand.'
    : M.why === 'king' ? 'Ponhea Yat has fallen in the streets of his city. There is no one left to lead the court south.'
    : M.why === 'royal' ? 'The royal family is taken before it can reach the open lake.'
    : 'The royal compound has fallen with the court still inside it.';
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + M.saved + '/5</b><span>Loads saved</span></div>' +
    '<div><b>' + G.stats.kills + '</b><span>Ayutthaya defeated</span></div><div><b>' + M.wave + '</b><span>Attacks held</span></div>' +
    '<div><b>' + Object.keys(GATES).filter(k => G.byId.get(M.gates[k])).length + '/4</b><span>Gates standing</span></div><div><b>' + M.lost + '</b><span>Loads lost</span></div>';
  const old = $('ov-end').querySelector('.end-art'); if (old) old.remove();
  const art = document.createElement('div'); try { art.appendChild(drawScene(win ? 'closing' : 'ruin')); } catch (e) { /* no art */ } art.className = 'end-art'; $('end-title').after(art);
  SFX.play(win ? 'victory' : 'defeat');
  showOv('end');
}

function kmBoot() {
  setupObj(); setupSound(); setupFullscreen();
  const relayout = () => setTimeout(() => { resize(); if (G && G.M) updateHud(); }, 250);
  window.addEventListener('orientationchange', relayout);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
  const set = (id, name) => { const e = $(id); if (e) e.src = resIcon(name); };
  set('i-food', 'food'); set('i-wood', 'wood'); set('i-gold', 'gold'); set('i-pop', 'pop'); set('i-idle', 'idle'); set('i-army', 'army');
  set('i-zin', 'plus'); set('i-zout', 'minus'); set('i-menu', 'menu');
  $('hud').hidden = true; resize(); showOv('start');
  G = new Game({ seed: seedUsed, diff }); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  view.zoom = view.w > 700 ? 1.3 : 1; centerOn(46, 24);
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
  const h = (location.hash || '').slice(1);
  if (h === 'river' || h === 'fall') skipTo(h);
}

/* ---------- full screen: a button on the start card and in the pause menu; phones try it on Begin ---------- */
function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
function fsCan() { const d = document.documentElement; return !!(d.requestFullscreen || d.webkitRequestFullscreen) && document.fullscreenEnabled !== false && document.webkitFullscreenEnabled !== false; }
function fsToggle(quiet) {
  const d = document.documentElement;
  let p = null;
  try {
    if (fsEl()) p = (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else if (fsCan()) p = (d.requestFullscreen || d.webkitRequestFullscreen).call(d, { navigationUI: 'hide' });
    else throw new Error('blocked');
  } catch (e) { if (!quiet) fsNote(); return; }
  if (p && p.catch) p.catch(() => { if (!quiet) fsNote(); });
}
function fsNote() {
  for (const n of document.querySelectorAll('.fs-note')) n.hidden = false;
  if (started) toast('This viewer does not allow full screen. Open the link in Chrome, or turn the phone sideways.');
}
function setupFullscreen() {
  if ($('fs-start')) return;
  const mk = (id, where, before) => {
    const b = document.createElement('button'); b.id = id; b.className = 'btn alt';
    b.addEventListener('click', (e) => { e.stopPropagation(); fsToggle(false); });
    const note = document.createElement('p'); note.className = 'lead tipline fs-note'; note.hidden = true;
    note.textContent = 'This viewer does not allow full screen. Open the link in Chrome, or turn the phone sideways for more room.';
    const card = $(where), ref = card.querySelector(before);
    if (ref) { ref.before(b); b.after(note); } else { card.appendChild(b); card.appendChild(note); }
    return b;
  };
  const btns = [mk('fs-start', 'ov-start', '[data-do="help"]'), mk('fs-pause', 'ov-pause', '[data-do="restart"]')];
  const label = () => { for (const b of btns) b.textContent = fsEl() ? 'Exit full screen' : 'Full screen'; };
  label();
  document.addEventListener('fullscreenchange', () => { label(); setTimeout(resize, 120); });
  document.addEventListener('webkitfullscreenchange', () => { label(); setTimeout(resize, 120); });
  const begin = document.querySelector('#ov-start [data-do="start"]');
  if (begin) begin.addEventListener('click', () => { if (!fsEl() && matchMedia('(pointer: coarse)').matches) fsToggle(true); }, true);
}
