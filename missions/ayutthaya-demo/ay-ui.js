/* ===== ay-ui.js ===== */
Object.assign(TRAIN_SHORT, { villager: 'Phrai Ying', daab: 'Daab', hok: 'Hok', thanu: 'Thanu', mo: 'Mo', chang: 'Chang Suek', boat: 'Pramong', light: 'Ruea Chai' });
Object.assign(BUILD_SHORT, { house: 'Ruean', raft: 'Raft', farm: 'Na', granary: 'Granary', rong: 'Rong', barracks: 'Barracks', phaniat: 'Kraal', wat: 'Wat', tower: 'Pom', wall: 'Khai', gate: 'Gate', port: 'Landing' });
const TIPS = [
  'Thai houses stand on stilts above the flood. A family\'s house, its rice paddy and the fish in that paddy fed it all year.',
  '"In the water there are fish, in the fields there is rice." From the Sukhothai inscription, written about 150 years before this siege.',
  'Ayutthaya caught wild elephants in a great kraal, the Phaniat, and trained the best of them for war. A kraal still stands outside the old city.',
  'Kings and princes fought from the neck of a war elephant. Single combat on elephants was the noblest fight a Thai or Khmer prince could fight.',
  'The West Baray, the reservoir beside your camp, was dug in the 1000s. It is about 8 km long and still holds water today.',
  'Angkor Thom\'s walls run about 3 km on each side, 8 m high, behind a moat 100 m wide. Its gates are crowned with great stone faces.',
  'King Jayavarman VII built Angkor Thom and the Bayon in the late 1100s. He also built over a hundred hospitals, the arogyasala, across his kingdom.',
  'Laterite is a red stone dug soft from the ground that hardens in the air. Fire cannot burn it. That is why the elephants are needed at the gates.',
  'People say the town of Siem Reap, beside Angkor, is named "Siam flattened", after a Khmer victory. Historians doubt it, so it is told as a story.',
  'Ayutthaya\'s women ran much of the farming and the markets while the men served the crown, as later European visitors noted.'
];
let storyOpen = null;

/* ---------- panel additions (the patched panel calls these) ---------- */
function ayPanelKey(us) { const M = G.M; return M ? M.phase + '|' + M.households : ''; }
function ayUnitCmds(us) { return ''; }
function ayBldCmds(b) {
  if (b.team !== 0 || b.hp <= 0 || !b.done) return '';
  if (b.kind === 'gate') return '<button class="cmd' + (b.open ? ' on' : '') + '" data-a="gate" title="' + (b.open ? 'Close the gate' : 'Open the gate') + '"><img alt="" src="' + bldIcon('gate', 0) + '"><span class="nm">' + (b.open ? 'Close' : 'Open') + '</span><span class="ct">&nbsp;</span></button>';
  return '';
}
function ayPanelAction(a, el) {
  if (a === 'gate') { const b = sel[0]; if (!G.setGate(b, !b.open)) toast('Clearing the gateway, then it closes.'); panelKey = ''; return true; }
  if (a === 'elephants') {
    const l = G.units.filter(u => u.team === 0 && u.hp > 0 && u.cls === 'eleph');
    if (!l.length) { toast('You have no elephants. Train Chang Suek at the Phaniat.'); return true; }
    select(l); centerOn(l[0].x, l[0].y); return true;
  }
  return false;
}
function describeOrder(u) {
  const o = u.order;
  if (o.t === 'repair') return 'Repairing';
  if (o.t === 'refuge') return 'Fleeing into the city';
  if (o.t === 'fishhouse') return u.working ? 'Fishing from the raft house' : 'Going to fish from the raft house';
  return baseDescribeOrder(u);
}
function bldNote(b) {
  const M = G.M;
  if (b.kind === 'raft' && b.team === 0) {
    const hh = G.households().some(h => h.house === b);
    return (hh ? 'A fishing household: a woman fishes from its deck, about 30 food a minute, plus ' + HOUSEHOLD.food + ' a minute as a household. ' : 'Send a village woman to it and she will fish from its deck (+' + HOUSEHOLD.food + ' a minute as a household, up to 6). ') + 'Takes food.';
  }
  if (b.kind === 'house' && b.team === 0) {
    const hh = G.households().some(h => h.house === b);
    return (hh ? 'A household: its paddy is worked, so it brings in ' + HOUSEHOLD.food + ' fish every minute. ' : 'Put a worked paddy next to it to make a household (+' + HOUSEHOLD.food + ' fish a minute, up to 6). Build it on the water\'s edge and it becomes a raft house instead. ') + 'Takes food.';
  }
  if (b.kind === 'phaniat') return 'Trains Chang Suek war elephants: they break gates and trample infantry. Khmer spears are their bane.';
  if (b.kind === 'wat') return 'Trains the Mo, physicians who heal the wounded. Units resting beside it heal slowly.';
  if (b.kind === 'rong') return 'Takes wood and gold.';
  if (b.kind === 'wall') return 'Teak stakes. Cheap, and they burn.';
  if (b.kind === 'gate') return b.open ? 'Open: your people and the enemy can pass.' : 'Closed. Select it to open.';
  if (b.kind === 'towncentre' && b.team === 0) return 'If the royal camp falls, the siege is lost.';
  if (b.kind === 'kgate') return 'Sandstone and laterite. Fire will not catch. Only war elephants break it.';
  if (b.kind === 'kwall') return 'Laterite, 8 m high. Too thick to break: go through a gate.';
  if (b.kind === 'kpalace') return 'The royal palace. Clear its guard and bring the king into its court to raise his banner.';
  if (b.kind === 'bayon') return 'The Bayon: the temple at the heart of the city, its towers carved with calm stone faces. Nobody fights over it.';
  if (b.outer) return 'Timber and thatch: fire arrows set it alight.';
  if (b.outpost) return 'An outwork guarding the west causeway.';
  if (b.kind === 'karogya') return 'A Khmer hospital. Their wounded heal beside it.';
  return baseBldNote(b);
}

/* ---------- palisade: tap ✓ at each corner and the stakes join up in a straight run ---------- */
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
  toast(placed + ' section' + (placed > 1 ? 's' : '') + ' of palisade. Move on and tap ✓ for the next run, ✗ to stop.');
  panelKey = ''; return true;
}

/* ---------- story cards ---------- */
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>', M = G.M;
  if (id === 'opening') return {
    tag: 'Ayutthaya · Kingdom Age · Mueang · 1431', title: 'The Fall of Angkor',
    body: [P('For centuries Yasodharapura, the city of Angkor, was the greatest city on the mainland. Its temples are stone, its walls laterite, its reservoirs hold a lake\'s worth of water.'),
      P('Ayutthaya, the river kingdom to the west, has grown strong. In 1431 King Borommarachathirat II has led its army east and laid siege to the city. The chronicles say the siege lasted seven months.'),
      P('The Khmer are not your villains. They are a proud old kingdom, defending their home.'),
      '<p class="goal">Objective: burn the timber town outside the moat, take the outworks, break a gate with your war elephants, and raise the king\'s banner over the royal palace. Keep the royal camp standing.</p>',
      '<p class="lead tipline">Fire arrows set timber alight, but laterite and sandstone barely scorch. Only Chang Suek break the gates, and Khmer spears are deadly to elephants: send Daab swordsmen in first.</p>'],
    btn: 'To the siege'
  };
  if (id === 'gates') return {
    tag: 'The siege · 1431', title: 'The Gates of Angkor',
    body: [P(M.burned >= BURN_GOAL ? 'The rice stores outside the walls are ash, and the outworks have fallen. Now the walls themselves.' : 'The siege has dragged on for months. The king will wait no longer: now the walls themselves.'),
      P('Angkor Thom has five gates, each crowned with great stone faces looking out in every direction. Behind them wait the Khmer spearmen, and Ballista Elephants that shoot bolts as long as a man.'),
      '<p class="goal">Objective: break one of the gates with Chang Suek war elephants. Fire will not touch it.</p>',
      '<p class="lead tipline">' + TIPS[7] + '</p>'],
    btn: 'To the gates'
  };
  if (id === 'breach') return {
    tag: 'Yasodharapura · 1431', title: 'Through the Gate',
    body: [P('The doors give way under the elephants, and the army pours into the city of temples.'),
      P('At its heart stands the Bayon. Beyond it is the royal palace, where the last of the palace guard will make its stand.'),
      '<p class="goal">Objective: clear the palace guard and bring the king into the palace court. Hold it for ' + BANNER_T + ' seconds to raise his banner. The palace is to be taken, not razed.</p>',
      '<p class="lead tipline">' + TIPS[6] + '</p>'],
    btn: 'Into the city'
  };
  if (id === 'closing') return {
    tag: 'Yasodharapura, 1431', title: 'Angkor Falls',
    body: [P('The banner of Ayutthaya flies over the royal palace. The chronicles say the king set his own son over the city, and carried statues and many people home to Ayutthaya.'),
      P('The Khmer court did not surrender. It went south to where four rivers meet, and there King Ponhea Yat built a new capital. The kingdom lived on.'),
      '<p class="quote">The temples were never torn down. Angkor Wat still stands, and it is on the flag of Cambodia today.</p>',
      P('Neither side was a villain. Two neighbouring kingdoms fought for the same river plains. Their dances, their scripts and their royal courts still share much of what Angkor began.')],
    btn: 'Finish'
  };
  return null;
}
function showStory(id) {
  const s = storyFor(id); if (!s) return;
  storyOpen = id; paused = true;
  $('st-tag').textContent = s.tag; $('st-title').textContent = s.title; $('st-art').innerHTML = '';
  try { $('st-art').appendChild(drawScene(id)); } catch (e) { console.warn('scene', id, e); }
  $('st-body').innerHTML = s.body.join(''); $('st-btn').textContent = s.btn || 'Continue';
  showOv('story');
  SFX.play(id === 'closing' ? 'conch' : 'conch');
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
function gatesLeft() { return Object.keys(GATES).filter(k => { const b = G.byId.get(G.M.gates[k]); return b && b.hp > 0; }); }
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  const idle = idleVillagers().length;
  const sortie = G.units.filter(u => u.team === 1 && u.hp > 0 && u.sortie).length;
  if (sortie) return sortie + ' Khmer from the sortie are out. Break them before they reach the camp.';
  if (M.phase === 1) {
    if (M.t < 45) return 'Select your Phon Thanu and attack the timber houses beyond the Baray: fire arrows set them alight.';
    if (idle > 2) return idle + ' village women are idle. Tap the idle button to put them to work.';
    if (M.burned < BURN_GOAL) return 'Burn the outer town (' + M.burned + '/' + BURN_GOAL + '). Next sortie in ' + fmtTime(M.next - M.t) + '.';
    return 'Take the two face towers guarding the west causeway (' + M.outDown + '/2). Elephants and swords break towers.';
  }
  if (M.phase === 2) {
    const g = G.byId.get(M.gates.w), ch = G.units.filter(u => u.team === 0 && u.hp > 0 && u.cls === 'eleph').length;
    if (ch < 3) return 'Train more Chang Suek at the Phaniat. Elephants are the only way through a gate.';
    if (idle > 2) return idle + ' village women are idle. Tap the idle button to put them to work.';
    return 'Send the elephants at a gate' + (g && g.hp > 0 ? ' (West Gate ' + Math.ceil(g.hp / g.maxHp * 100) + '%)' : '') + ', with spears and swords to screen them.';
  }
  if (M.heroBack.king) return 'The king is being carried back to the camp. Clear the palace guard while you wait.';
  if (M.kingAt && M.bannerFoes) return M.bannerFoes + ' Khmer still guard the palace court. Clear them to raise the banner.';
  if (M.kingAt) return 'Raising the banner: ' + Math.ceil(BANNER_T - M.banner) + 's. Hold the court!';
  return 'Bring the king into the royal palace court, north of the Bayon.';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'fallen';
  const tc = G.buildings.find(b => b.team === 0 && b.kind === 'towncentre');
  const items = [
    { t: 'Burn the outer town (' + Math.min(M.burned, BURN_GOAL) + '/' + BURN_GOAL + ')', ok: M.burned >= BURN_GOAL, opt: M.phase > 1 && M.burned < BURN_GOAL, how: 'Phon Thanu archers set timber houses alight; soldiers burn them with torches.' },
    { t: 'Take the outworks on the west causeway (' + M.outDown + '/2)', ok: M.outDown >= 2, opt: M.phase > 1 && M.outDown < 2, how: 'Attack the two towers on the west causeway with swordsmen and elephants.' }
  ];
  if (M.phase >= 2) items.push({ t: 'Break a gate with Chang Suek' + (M.breach ? ': the ' + GATES[M.breach].name : ''), ok: !!M.breach, how: 'Train Chang Suek at the Phaniat kraal and send them at a gate. Guard them from Khmer spears.' });
  if (M.phase >= 3) items.push({ t: 'Raise the king\'s banner over the royal palace' + (M.banner > 0 ? ' (' + Math.floor(M.banner / BANNER_T * 100) + '%)' : ''), ok: !!M.cards.closing, how: 'Bring the king into the royal palace court and hold it for 20 seconds.' });
  items.push({ t: 'Keep the royal camp standing (' + pct(tc) + ')', ok: false, how: 'Keep some troops near the camp for the Khmer sorties.' });
  items.push({ t: 'The king: ' + (M.heroBack.king ? 'carried off, back in ' + Math.ceil(M.heroBack.king - M.t) + 's' : pct(M.king)) + ' · Households: ' + M.households + '/' + HOUSEHOLD.max, opt: true });
  if (M.phase < 3) items.push({ t: 'Next Khmer sortie in ' + fmtTime(Math.max(0, M.next - M.t)) + (M.burned ? ' (smaller: ' + M.burned + ' stores burnt)' : ''), tip: true });
  items.push({ t: M.phase === 1 ? 'A house beside a worked paddy, or a raft house with a woman fishing, is a household: +' + HOUSEHOLD.food + ' food a minute. A gold ring marks each one.' : 'Elephants charging into a fight trample the men around their target.', tip: true });
  return { title: M.phase === 1 ? 'The siege: the outer town' : M.phase === 2 ? 'The gates of Angkor' : 'The royal palace', items };
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
  if (M) clock = M.phase === 3 ? (M.banner > 0 ? 'Banner ' + Math.floor(M.banner / BANNER_T * 100) + '%' : 'In the city') : 'Sortie in ' + fmtTime(Math.max(0, M.next - M.t));
  $('clock').textContent = clock;
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); const fx = sfxForMsg(m.text); if (fx) SFX.play(fx); }
  sfxTick();
  if (M && M.cardQ.length && !G.over && !storyOpen) {
    const c = M.cardQ.shift();
    if (c === 'court') vignette('court', 'Through the far gate, the Khmer court slips away across the great lake, with its monks and sacred statues.');
    else showStory(c);
  }
  if (M && M.burned > (M.vigBurn || 0)) { M.vigBurn = M.burned; if (M.burned === 1) vignette('burn', 'The first house of the outer town catches. Its people run for the gates.'); }
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
  centerOn(14, 22);
  select([G.M.king]);
  started = true; paused = false; $('hud').hidden = false; showOv(null); updateHud(); updatePanel();
  showStory('opening');
}
// practice: start later in the siege with the army a player would have by then
function skipTo(stage) {
  startGame(seedUsed);
  storyOpen = null; showOv(null); paused = false;
  const M = G.M, put = (k, x, y) => { const p = G.openSpot(x, y, 0); return G.addUnit(k, 0, p.x, p.y); };
  for (const id of M.outer.concat(M.outposts)) { const b = G.byId.get(id); if (b) { b.hp = 0; G.onKilled(b, { team: 0 }); } }
  G.cleanup();
  for (const u of G.units) if (u.kv) { u.hp = 0; u.silent = true; }
  G.res[0] = { food: 900, wood: 800, gold: 700 };
  for (const [x, y] of [[2, 31], [2, 34], [9, 34], [12, 9]]) if (G.canPlace('house', x, y, 0)) G.addBuilding('house', 0, x, y, true);
  const army = { chang: 3, daab: 6, hok: 6, thanu: 6, mo: 2 };
  let i = 0; for (const k in army) for (let j = 0; j < army[k]; j++, i++) put(k, 30 + (i % 6) * 1.1, 20 + Math.floor(i / 6) * 1.1);
  M.king.x = 31; M.king.y = 23.5;
  M.sortie = 3; M.next = M.t + 80;
  M.phase = 2; M.phaseAt = 0;
  if (stage === 'palace') {
    const g = G.byId.get(M.gates.w); g.hp = 0; G.onKilled(g, { team: 0 }); G.cleanup();
    M.phase = 3; M.breach = 'w'; M.courtAt = M.t + 20;
    for (const u of G.units) if (u.team === 0 && u.cls !== 'vil' && u.x > 20) { u.x += 9; u.y = Math.max(19, Math.min(28, u.y)); const p = G.openSpot(u.x, u.y, 0); u.x = p.x; u.y = p.y; G.idleOrder(u); }
    centerOn(40, 23); G.msg('Practice: the West Gate is broken. Take the palace.');
  } else { centerOn(30, 22); G.msg('Practice: the outer town is ash. Break a gate.'); }
  M.cardQ.push(stage === 'palace' ? 'breach' : 'gates');
}
function togglePause() {
  if (storyOpen) return;
  baseTogglePause();
  if (paused && !ended) $('pause-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
}
function endGame() {
  const M = G.M;
  ended = true; paused = true;
  const win = G.over === 'win';
  $('end-tag').textContent = win ? 'Demo complete' : 'The siege is broken';
  $('end-title').textContent = win ? 'Angkor Has Fallen' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  $('end-sub').textContent = win ? 'Ayutthaya\'s banner flies over Yasodharapura. The Khmer court has gone south, and the temples stand.'
    : 'The royal camp has burned. The army of Ayutthaya falls back west across the plain, and Angkor holds, for now.';
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + M.burned + '</b><span>Outer buildings burnt</span></div>' +
    '<div><b>' + G.stats.kills + '</b><span>Khmer defeated</span></div><div><b>' + M.tramples + '</b><span>Elephant charges</span></div>' +
    '<div><b>' + M.sortie + '</b><span>Sorties faced</span></div><div><b>' + M.households + '</b><span>Households</span></div>';
  const old = $('ov-end').querySelector('.end-art'); if (old) old.remove();
  if (!win) { const art = document.createElement('div'); try { art.appendChild(drawScene('fall')); } catch (e) { /* no art */ } art.className = 'end-art'; $('end-title').after(art); }
  SFX.play(win ? 'victory' : 'defeat');
  showOv('end');
}

function ayBoot() {
  setupObj(); setupSound(); setupFullscreen();
  // folding or unfolding a Fold swaps the screen: lay the game out again once it settles
  const relayout = () => setTimeout(() => { resize(); if (G && G.M) updateHud(); }, 250);
  window.addEventListener('orientationchange', relayout);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
  const set = (id, name) => { const e = $(id); if (e) e.src = resIcon(name); };
  set('i-food', 'food'); set('i-wood', 'wood'); set('i-gold', 'gold'); set('i-pop', 'pop'); set('i-idle', 'idle'); set('i-army', 'army');
  set('i-zin', 'plus'); set('i-zout', 'minus'); set('i-menu', 'menu');
  $('hud').hidden = true; resize(); showOv('start');
  // a quiet view of the city behind the title screen
  G = new Game({ seed: seedUsed, diff }); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  view.zoom = view.w > 700 ? 1.3 : 1; centerOn(40, 22);
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
  const h = (location.hash || '').slice(1);
  if (h === 'gates' || h === 'palace') skipTo(h);
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

/* the placement ghost shows the raft house when the spot is on the water's edge */
const _ayPaintPlacement = paintPlacement;
paintPlacement = function () {
  if (mode && mode.kind === 'place' && mode.bkind === 'house' && mode.tx != null && G.houseForm('house', mode.tx, mode.ty, 0) === 'raft') {
    mode.bkind = 'raft'; try { _ayPaintPlacement(); } finally { mode.bkind = 'house'; }
    return;
  }
  _ayPaintPlacement();
};
