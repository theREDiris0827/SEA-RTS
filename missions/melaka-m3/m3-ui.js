/* ===== m3-ui.js ===== */
const TIPS = [
  'The Sejarah Melayu tells how Tun Perak met a Siamese fleet at Batu Pahat with too few ships, and had torches tied to the mangroves at night.',
  'The Siamese saw lights without end, took them for a great fleet, and sailed home. Melaka\'s ships chased them as far as Singapura.',
  'Tun Perak was bendahara (chief minister) of Melaka for over thirty years and served four rulers.',
  'Mangroves stand on arching roots in the tidal mud. Their wood burns hot and long, and was cut for charcoal along the whole Malay coast.',
  'The Orang Laut, the sea people, knew every creek and shoal of the Straits. Melaka\'s rulers counted on their boats and their loyalty.',
  'The Penjajap was a fast Malay warship, rowed and sailed, that could slip through shallow water a big junk could not.',
  'Awi Dichu is the name the Sejarah Melayu gives the Siamese commander of this fleet.'
];
let storyOpen = null;

/* ---------- panel additions ---------- */
function mrPanelKey() { const M = G.M; return M ? M.phase + '|' + M.ol + '|' + Math.floor(G.res[0].gold / 25) : ''; }
function costBtn(act, icon, label, cost, title, on, no, extra) {
  return '<button class="cmd' + (on ? ' on' : '') + (no ? ' no' : '') + '" data-a="' + act + '"' + (extra || '') + ' title="' + title + '"><img alt="" src="' + icon + '"><span class="nm">' + label + '</span><span class="ct">' + (cost ? costHTML(cost) : '&nbsp;') + '</span></button>';
}
function mrUnitCmds(us) { return ''; }
function mrBldCmds(b) {
  const M = G.M; if (!M || b.hp <= 0) return '';
  if (b.kind === 'village' && b.ol && M.ol !== 'joined') return costBtn('olgift', resIcon('gold'), 'Gift', { gold: M3.giftGold }, 'Give the headman ' + M3.giftGold + ' gold: 2 Orang Laut boats join you', false, !G.canAfford(0, { gold: M3.giftGold }));
  return '';
}
function mrPanelAction(a, el) {
  if (a === 'olgift') { const e = G.olJoin('gift'); if (e) toast(e); panelKey = ''; return true; }
  return false;
}
describeOrder = (function (base) {
  return function (u) {
    const o = u.order;
    if (o.t === 'torch') return o.paid ? 'Tying a torch' : 'Wading to a torch tree';
    if (o.t === 'rland') return o.s === 'in' ? 'Rowing for the shore' : 'Rowing back';
    if (o.t === 'flee2') return 'Fleeing';
    return base(u);
  };
})(describeOrder);
bldNote = (function (base) {
  return function (b) {
    const M = G.M;
    if (b.kind === 'village' && b.ol && M) return M.ol === 'joined' ? 'The Orang Laut sail with Tun Perak.' : 'The Orang Laut. A gift of ' + M3.giftGold + ' gold wins their 2 boats, or drive off the Siamese scouts who raid them.';
    if (b.kind === 'towncentre' && b.team === 0) return 'Tun Perak\'s camp. If the Balai falls, the mission is lost.';
    if (b.kind === 'port' && b.stilts) return 'Built on stilts in the shallows. Trains Penjajap.';
    return base(b);
  };
})(bldNote);

/* ---------- story cards ---------- */
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>';
  const goal = (t) => '<p class="goal">' + t + '</p>', tip = (t) => '<p class="lead tipline">' + t + '</p>';
  if (id === 'opening') return {
    tag: 'Melaka · Mission 3 · c. 1456', title: 'Torches in the Mangroves',
    body: [P('Ten years after Melaka threw back the Siamese army on land, Ayutthaya sends a war fleet down the coast under Awi Dichu.'),
      P('Tun Perak, now bendahara, waits on the mangrove shore of Batu Pahat with too few ships to fight it.'),
      goal('Before nightfall: build a Port (it can stand on stilts in the shallows, gold flag), train 3 Penjajap, and win over the Orang Laut village on the west bank.'),
      tip('Keep Tun Perak and the Balai safe: if either falls, the mission is lost. People can wade through shallow water here, at half speed.')],
    btn: 'To the shore'
  };
  if (id === 'night') return {
    tag: 'Phase 2 · Night', title: 'Lights without end',
    body: [P('The Siamese anchor offshore and wait for morning. Tun Perak has a plan: tie torches in the mangroves all along the shore, so the enemy sees a fleet that is not there.'),
      goal('Select a villager and tap a marked mangrove (gold ring). She wades out and ties a torch in its crown: ' + M3.tieCost.wood + ' wood, ' + M3.tieTime + ' seconds.'),
      goal('Every burning torch wears down Siamese courage (the bar at the top). Their boats land parties to put torches out, so guard them with soldiers. Sinking ships helps too.'),
      tip(TIPS[0])],
    btn: 'Light the shore'
  };
  if (id === 'dawn') return {
    tag: 'Phase 3 · Dawn', title: 'The fleet turns back',
    body: [P('As the sky pales, the Siamese captains have seen enough. They weigh anchor and run for the open sea.'),
      goal('Chase the fleet: sink as many ships as you can before they leave by the far corners. Awi Dichu\'s flagship is the prize.'),
      tip(TIPS[1])],
    btn: 'Give chase'
  };
  if (id === 'force') return {
    tag: 'The Siamese fleet', title: 'Not one ship left',
    body: [P('No trick was needed. Melaka\'s boats have sunk the Siamese fleet ship by ship in the dark water off Batu Pahat.'),
      goal('The fleet is broken. The last Siamese soldiers ashore run for the sea.')],
    btn: 'Onward'
  };
  if (id === 'closing') {
    const M = G.M, all = M.fleet.length;
    return {
      tag: 'Batu Pahat, c. 1456', title: M.byForce ? 'The sea is Melaka\'s' : 'The trick of the torches',
      body: [P(M.byForce ? 'Tun Perak brings his boats home with the Siamese fleet sunk behind them.' : 'The Siamese saw lights without end along the mangroves, took them for a great fleet, and sailed home. Melaka\'s boats chased them as far as Singapura.'),
        P('Ships sunk: ' + M.sunk + ' of ' + all + (M.flagSunk ? ', the flagship among them.' : '.') + ' The chronicle remembers Tun Perak for winning with wit what he could not win with ships.'),
        P('Melaka would not face Siam\'s war fleets again for many years. Its golden age had begun.'),
        tip(TIPS[2])],
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
  if (id === 'closing') { G.M.won = true; G.checkEnd(); }
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
function portOf() { return G.buildings.find(b => b.team === 0 && b.kind === 'port' && b.hp > 0); }
function penjajap() { return G.units.filter(u => u.team === 0 && u.kind === 'light' && u.hp > 0 && !u.ol).length; }
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  if (M.phase === 1) {
    const p = portOf();
    if (!p) return 'Build a Pelabuhan (Port) by the water, or on stilts at the gold flag.';
    if (!p.done) return 'The Port is going up: ' + Math.floor(p.progress * 100) + '%.';
    if (penjajap() < 3) return 'Train Penjajap at the Port: ' + penjajap() + ' of 3.';
    if (M.ol !== 'joined') return M.scoutsOn ? 'Siamese scouts raid the Orang Laut village. Drive them off!' : 'Win over the Orang Laut village: select it and tap Gift.';
    return 'Night falls in ' + fmtTime(M3.duskLen - M.t) + '. Gather wood for the torches.';
  }
  if (M.phase === 2) {
    const lit = litTorches(G).length, n = M.torches.length;
    if (M.assault) return 'The Siamese attack! Hold the camp, and keep the torches burning.';
    if (lit === 0) return 'Select a villager and tap a gold-ringed mangrove to tie a torch.';
    const raid = G.units.filter(u => u.team === 1 && u.hp > 0 && u.layer === 0).length;
    if (raid) return raid + ' Siamese soldiers ashore. Guard the torches!';
    return lit + ' of ' + n + ' torches burn. Siamese courage: ' + Math.ceil(M.courage) + '.';
  }
  if (M.phase === 3) return 'Chase the fleet! Sunk ' + M.sunk + ', escaped ' + M.escaped + '.';
  return '';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'fallen';
  const items = [], hero = heroUnit(G), p = portOf();
  if (M.phase === 1) {
    items.push({ t: 'Build a Port' + (p && !p.done ? ' (' + Math.floor(p.progress * 100) + '%)' : ''), ok: !!(p && p.done),
      how: 'Select villagers and build a Pelabuhan (Port) from their build buttons, by the water or on stilts in the shallows at the gold flag.' });
    items.push({ t: 'Train 3 Penjajap (' + Math.min(3, penjajap()) + ' of 3)', ok: penjajap() >= 3, how: 'Select the Port and tap Penjajap. Each costs wood and a little gold.' });
    items.push({ t: 'Win over the Orang Laut village', ok: M.ol === 'joined', opt: M.ol !== 'joined',
      how: M.scoutsOn ? 'Siamese scouts are raiding it: send soldiers to drive them off, or select the village and tap Gift (' + M3.giftGold + ' gold).' : 'Select the village on the west bank and tap Gift (' + M3.giftGold + ' gold). Its 2 boats join you.' });
    items.push({ t: 'Night falls in ' + fmtTime(M3.duskLen - M.t), tip: true });
  }
  if (M.phase === 2) {
    const lit = litTorches(G).length;
    items.push({ t: 'Torches burning: ' + lit + ' of ' + M.torches.length, ok: lit === M.torches.length,
      how: 'Select a villager and tap a gold-ringed mangrove. She wades out and ties a torch (' + M3.tieCost.wood + ' wood, ' + M3.tieTime + ' s).' });
    items.push({ t: 'Break the Siamese courage (' + Math.ceil(M.courage) + ' left)', ok: M.courage <= 0,
      how: 'Keep torches burning: fewer than ' + M3.regainBelow + ' and they take heart again. Guard them from landing parties with soldiers; sinking ships helps too.' });
    items.push({ t: 'Or sink the whole fleet (' + fleetShips(G).length + ' ships left)', opt: true });
  }
  if (M.phase === 3) {
    items.push({ t: 'Chase the fleet: ' + M.chaseSunk + ' sunk, ' + M.escaped + ' escaped', ok: false, how: 'Send your Penjajap after the ships heading for the far corners of the sea.' });
    const f = G.byId.get(M.flag);
    items.push({ t: 'Bonus: sink Awi Dichu\'s flagship', ok: M.flagSunk, opt: !M.flagSunk });
    items.push({ t: 'The chase ends in ' + fmtTime(Math.max(0, M.dawnEnd - M.t)), tip: true });
  }
  items.push({ t: 'Keep Tun Perak alive (' + pct(hero) + ')', ok: false });
  return { title: 'Torches in the Mangroves · ' + ['', 'Dusk', 'Night', 'Dawn'][M.phase], items };
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
  // the courage meter
  const cg = document.createElement('div'); cg.id = 'courage'; cg.hidden = true;
  cg.innerHTML = '<span class="cg-l">Siamese courage</span><span class="cg-bar"><i></i></span><b class="cg-n"></b>';
  strip.insertBefore(cg, $('clock'));   // in the strip under the resources, beside the clock
}
function updateCourage() {
  const cg = $('courage'), M = G.M; if (!cg || !M) return;
  const on = M.fleetOn && M.phase === 2 && !G.over;
  cg.hidden = !on; if (!on) return;
  const v = Math.max(0, M.courage), f = v / M3.courage, lit = litTorches(G).length;
  cg.querySelector('i').style.width = (f * 100).toFixed(1) + '%';
  cg.querySelector('.cg-n').textContent = Math.ceil(v);
  cg.classList.toggle('falling', lit >= M3.regainBelow); cg.classList.toggle('rising', lit < M3.regainBelow && v < M3.courage);
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
  $('hint').textContent = hintText(); updateObj(); updateCourage();
  let clock = fmtTime(G.t);
  if (M) {
    if (M.phase === 1) clock = 'Night in ' + fmtTime(M3.duskLen - M.t);
    else if (M.phase === 2) clock = M.assault ? 'Attack!' : 'Night ' + fmtTime(M.t - M.phaseAt[2]);
    else clock = 'Chase ' + fmtTime(Math.max(0, M.dawnEnd - M.t));
  }
  $('clock').textContent = clock;
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); }
  if (sel.length === 1 && M) { const k = mrPanelKey(); if (k !== lastMKey) { lastMKey = k; panelKey = ''; } }
  if (M && M.cardQ.length && !G.over && !storyOpen) {
    const c = M.cardQ.shift();
    if (c === 'v-ol') vignette('ol', M.olHow === 'gift' ? 'The Orang Laut take the gift. Two of their boats join you.' : 'The scouts are driven off. The Orang Laut join you.');
    else if (c === 'v-assault') vignette('assault', 'The Siamese grow tired of waiting. Their ships come in to attack!');
    else showStory(c);
  }
};
let lastMKey = '';

/* ---------- game flow ---------- */
function newM3Game() { const g = new Game({ seed: M3.seed, diff, map: 'delta', civs: [MEL3, SIAM], startAge: 2 }); g.res[0] = Object.assign({}, M3.start); return g; }
startGame = function (seed) {
  seedUsed = seed; storyOpen = null;
  G = newM3Game();
  enterGame(); showMenu(null);
  objStarted = false; lastMKey = '';
  if (typeof RC !== 'undefined') for (const k in RC) delete RC[k];
  view.zoom = view.w > 700 ? 1.0 : 0.8; resize();
  const h = heroUnit(G); centerOn(h.x, h.y + 4);
  updateHud(); updatePanel();
  showStory('opening');
};
// practice: start at nightfall with what a player would have by then
function skipTo(which) {
  startGame(seedUsed);
  storyOpen = null; showOv(null); paused = false;
  const M = G.M, tc = G.byId.get(M.tc);
  const s = M.portSpot; if (s && G.canPlace('port', s.x, s.y, 0)) G.addBuilding('port', 0, s.x, s.y, true);
  const port = portOf();
  const putW = (k, n) => { for (let i = 0; i < n; i++) { const w = port ? G.findSpawn(port, null, 1) : G.openSpot(44, 44, 1); const p = G.openSpot(w.x + (i % 3), w.y + 1 + Math.floor(i / 3), 1); G.addUnit(k, 0, p.x, p.y); } };
  putW('light', 3);
  const put = (k, n) => { for (let i = 0; i < n; i++) { const p = G.openSpot(tc.x + 3 + (i % 5), tc.y + 4 + Math.floor(i / 5), 0); G.addUnit(k, 0, p.x, p.y); } };
  put('villager', 3); put('keris', 3); put('archer', 2);
  G.olJoin('gift'); G.res[0].gold += M3.giftGold; M.cardQ.length = 0;
  G.res[0] = { food: 300, wood: 420, gold: 150 };
  M.t = M3.duskLen - 2; M.warned.dusk = true; spawnFleet(G);
  for (const u of fleetShips(G)) { u.x = u.anchor.x; u.y = u.anchor.y; u.path = null; G.idleOrder(u); }
  select([]); centerOn(48, 50);
  G.msg('Practice: starting at nightfall.');
}
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
  $('end-title').textContent = win ? (M.byForce ? 'The fleet is sunk' : 'Lights without end') : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  const why = { hero: 'Tun Perak has fallen. Without him the defence of Melaka breaks apart.', tc: 'The camp has fallen. The Siamese have a foothold on the coast.' };
  $('end-sub').textContent = win ? (M.byForce ? 'Tun Perak\'s boats sank the Siamese fleet off Batu Pahat.' : 'Tun Perak\'s torches turned back the Siamese fleet without a pitched battle at sea.') : (why[M.why] || 'The camp has fallen.');
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + M.sunk + ' of ' + M.fleet.length + '</b><span>Ships sunk</span></div>' +
    '<div><b>' + M.tied + '</b><span>Torches tied</span></div><div><b>' + M.doused + '</b><span>Put out by Siam</span></div>' +
    '<div><b>' + (M.flagSunk ? 'Yes' : 'No') + '</b><span>Flagship sunk</span></div><div><b>' + G.stats.kills + '</b><span>Enemies defeated</span></div>';
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
  G = newM3Game(); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  view.zoom = view.w > 700 ? 0.7 : 0.5; centerOn(48, 40);
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
  const h = (location.hash || '').slice(1);
  if (h === 'night') skipTo(h);
}
Object.assign(BRIEF, { perak: 'Your hero, the bendahara. +2 attack to soldiers near him. If he falls, the mission is lost' });
