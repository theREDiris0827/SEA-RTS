/* ===== mr-ui.js ===== */
Object.assign(TRAIN_SHORT, { villager: 'Rakyat', archer: 'Pemanah', pembedil: 'Pembedil', bediraja: 'Bedil Diraja', meriam: 'Meriam', tuah: 'Hang Tuah', light: 'Penjajap', galley: 'Lancaran', trade: 'Jong', frigate: 'Ghali', flagship: 'Mendam' });
Object.assign(BUILD_SHORT, { granary: 'Jelapang', tower: 'Menara', palace: 'Istana', tradepost: 'Pangkalan', rumahtabib: 'Tabib' });
const TIPS = [
  'The Sejarah Melayu tells how Parameswara, resting under a tree by the river at Bertam, saw a mouse deer kick one of his hunting dogs into the water. He took it as a good sign and founded his city there, naming it after the tree: melaka.',
  'Melaka grew because of the monsoon winds. Ships from India and the Arab lands came on one monsoon and ships from China on the other, and they met halfway, at Melaka.',
  'Admiral Zheng He\'s Ming fleets called at Melaka several times between 1405 and 1433. Ming protection helped the young port stand up to Siam.',
  'Melaka had four syahbandar, harbour masters, one for each group of foreign merchants: Gujaratis; other Indians and Burmese; Southeast Asians; and Chinese and Ryukyuans.',
  'The lela and rentaka were light bronze swivel guns mounted on a ship\'s rail. The Portuguese found hundreds of guns in Melaka in 1511.',
  'Bedil is the old Malay and Javanese word for a gun, older than the Portuguese istinggar.',
  'Tun Perak was bendahara (chief minister) of Melaka for over thirty years and served four rulers. Many call him the architect of Melaka\'s golden age.',
  'In about 1446 a Siamese army marched on Melaka overland. Tun Perak, then headman of Kelang, came with his men to defend the city, and the Siamese were driven back.',
  'Hang Tuah is the great hero of the Malay epics. Whether he lived is debated; in the Hikayat Hang Tuah he serves Sultan Mansur Shah as admiral.',
  'Takkan Melayu hilang di dunia: "the Malays will never vanish from the earth", a line the Hikayat Hang Tuah gives to its hero.'
];
let storyOpen = null;

/* ---------- panel additions (the patched panel calls these) ---------- */
function ageLabel() { const a = G && G.age ? G.age[0] : 1; return AGES[a].name + ' · ' + AGES[a].local; }
function mrPanelKey(us) {
  const M = G.M;
  return (G.age ? G.age[0] : 1) + '|' + (M && M.aging ? 'A' + Math.floor(M.aging.left / 3) : '') + '|' + (M ? M.raid + (M.active ? 'a' : 'q') : '');
}
function costBtn(act, icon, label, cost, title, on, no) {
  return '<button class="cmd' + (on ? ' on' : '') + (no ? ' no' : '') + '" data-a="' + act + '" title="' + title + '"><img alt="" src="' + icon + '"><span class="nm">' + label + '</span><span class="ct">' + (cost ? costHTML(cost) : '&nbsp;') + '</span></button>';
}
function mrUnitCmds(us) { return ''; }
function mrBldCmds(b) {
  if (b.team !== 0 || b.hp <= 0 || !b.done) return '';
  const M = G.M;
  if (b.kind === 'towncentre') {
    if (M.aging) {
      const A = AGES[M.aging.to], p = Math.floor((1 - M.aging.left / M.aging.tot) * 100);
      return costBtn('agecancel', resIcon('flag'), A.local + ' ' + p + '%', null, 'Advancing to the ' + A.name + ' (' + Math.ceil(M.aging.left) + 's). Tap to call it off and get the cost back.', true);
    }
    const n = G.age[0] + 1, A = AGES[n];
    if (!A) return '';
    const ok = G.ageNeedMet(0, n);
    return costBtn('ageup', resIcon('flag'), 'Age: ' + A.local, A.cost, 'Advance to the ' + A.name + ' (' + A.local + '), ' + A.time + 's. Needs ' + A.need.text + '.', false, !ok || !G.canAfford(0, A.cost));
  }
  return '';
}
function mrPanelAction(a, el) {
  if (a === 'ageup') { const e = G.startAge(0); toast(e || 'The court sets to work. Your Town Centre keeps training villagers.'); panelKey = ''; return true; }
  if (a === 'agecancel') { G.cancelAge(); panelKey = ''; return true; }
  if (a === 'callraid') { const e = G.callRaid(); if (e) toast(e); panelKey = ''; return true; }
  return false;
}
function describeOrder(u) {
  const o = u.order;
  if (o.t === 'repair') return 'Repairing';
  if (o.t === 'land') return o.s === 'in' ? 'Rowing for the beach' : 'Rowing away';
  if (o.t === 'flee2') return 'Fleeing';
  return baseDescribeOrder(u);
}
function bldNote(b) {
  const M = G.M;
  if (b.kind === 'towncentre' && b.team === 0) {
    const n = G.age[0] + 1;
    if (M && M.aging) return 'Advancing to the ' + AGES[M.aging.to].name + ': ' + Math.ceil(M.aging.left) + 's.';
    if (AGES[n]) return 'Next: ' + AGES[n].name + '. Needs ' + AGES[n].need.text + (G.ageNeedMet(0, n) ? ' (done).' : '.');
    return 'The Golden Age: Melaka at its height. If the Town Centre falls, all is lost.';
  }
  if (b.kind === 'palace' && b.team === 0) return G.age[0] >= 4 ? 'Trains Pahlawan and Hang Tuah.' : 'Trains Pahlawan. Hang Tuah comes with the Golden Age.';
  if (b.kind === 'barracks' && b.team === 0 && G.age[0] < 3) return 'In the Age of Commerce, Pemanah become Pembedil and the Meriam is cast here.';
  return baseBldNote(b);
}

/* ---------- story cards ---------- */
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>', D = G.diff;
  if (id === 'opening') return {
    tag: 'Melaka · Village Age · Kampung · c. 1400', title: 'Rise of Melaka',
    body: [P('Driven out of Singapura, the prince Parameswara has come up the coast with his people and the Orang Laut who stayed loyal. At the river mouth of Bertam he has founded a new town.'),
      P('It is only a fishing village with a few warriors. But it stands on the narrowest part of the Strait, where the monsoon ships of China and India must pass.'),
      P('Others want that crossing too. Raiders from Majapahit\'s coasts will come first. Later, Siam, which claims the whole peninsula, will send its armies.'),
      '<p class="goal">Objective: grow Melaka through four ages to the Golden Age, and break the great Siamese army that comes for it. Keep the Town Centre standing.</p>',
      '<p class="lead tipline">Select the Town Centre to advance an age. Each age needs certain buildings first, and brings new units, guns and ships. Ageing up also draws the next raid closer.</p>'],
    btn: 'To the river mouth'
  };
  if (id === 'age2') return {
    tag: 'Kingdom Age · Kerajaan', title: 'A kingdom on the Strait',
    body: [P('Parameswara rules as raja. An Istana rises above the town, merchants start to call, and the court takes shape: a bendahara, a temenggung, the warriors of the royal guard.'),
      P('In 1405 the Ming admiral Zheng He came to Melaka with the first of his great fleets. Two years later the raja sailed to China himself. Ming friendship kept Siam at a distance, for a time.'),
      '<p class="goal">New: Istana (Pahlawan), Rumah Tabib (Tabib), Menara Kawal, Pangkalan trading post, Lancaran galleys and Jong Dagang traders. Fire arrows at sea.</p>',
      '<p class="lead tipline">' + TIPS[2] + '</p>'],
    btn: 'Onward'
  };
  if (id === 'age3') return {
    tag: 'Age of Commerce · Bandar', title: 'The great port',
    body: [P('Melaka is now the busiest port in Asia. Gujarati, Tamil, Javanese, Chinese and Ryukyuan ships crowd the roads, and the Malay of Melaka becomes the language of trade from Sumatra to the Moluccas.'),
      P('Guns come with the trade: bronze lela and rentaka for the ships, and handguns for the warriors. Your Pemanah take up the bedil and become Pembedil. Your soldiers wear the baju rantai, a mail shirt.'),
      '<p class="goal">New: Pembedil (arquebusiers), Meriam bronze cannon (3 at most), Ghali warships with ship cannon. Towers fire swivel guns. Soldiers +1 armour.</p>',
      '<p class="lead tipline">' + TIPS[3] + '</p>'],
    btn: 'Onward'
  };
  if (id === 'age4') return {
    tag: 'Golden Age · Kesultanan', title: 'The Sultanate',
    body: [P('Melaka has become a sultanate, and Tun Perak is building its golden age. Pahang, Kampar and Siak will come under its rule; its admirals will be sung of for centuries.'),
      P('Hang Tuah, greatest of the Sultan\'s warriors, now serves at the Istana. Your Pembedil become the Bedil Diraja, the royal musketeers.'),
      '<p class="goal">New: Hang Tuah (hero, at the Istana), Bedil Diraja, the Mendam Berahi flagship. Soldiers +1 armour more. Siam is gathering an army: it marches in ' + FINAL_DELAY + ' seconds.</p>',
      '<p class="lead tipline">' + TIPS[8] + '</p>'],
    btn: 'Make ready'
  };
  if (id === 'siam') return {
    tag: 'Raid 4', title: 'Siam',
    body: [P('Ayutthaya counts the whole Malay peninsula as its tributary, and Melaka has stopped sending it the gold flower. Its vassal lords in the north send their armies south.'),
      P('Their twin-sword fighters are fast, their fire archers set thatch alight, and before long they will bring war elephants.'),
      '<p class="goal">Fire: villagers standing next to a burning building put it out. Spears and guns bring elephants down.</p>'],
    btn: 'Defend Melaka'
  };
  if (id === 'final') return {
    tag: 'The final raid · c. 1446', title: 'The army from Pahang',
    body: [P('A great Siamese army has marched down through Pahang, with elephants and a commander under a white parasol. It means to take Melaka for good.'),
      P('History: Tun Perak, then headman of Kelang, brought his men to Melaka, and the Siamese were thrown back. The Sultan made him bendahara soon after.'),
      '<p class="goal">Objective: kill the Siamese commander, or break his whole army. Tun Perak has come to the Town Centre with his men, and his presence gives +2 attack nearby.</p>',
      '<p class="lead tipline">' + TIPS[7] + '</p>'],
    btn: 'To the walls'
  };
  if (id === 'closing') return {
    tag: 'Melaka, 1459', title: 'The Golden Age',
    body: [P('The Siamese did not take Melaka. In 1456 they came again by sea, and again they were turned back. That same year Sultan Muzaffar Shah sent an envoy to Ayutthaya, and the two kingdoms made peace.'),
      P('In 1459 Sultan Mansur Shah came to the throne. With Tun Perak as his bendahara and Hang Tuah as his admiral, Melaka was at its height: the greatest port of Southeast Asia, and the heart of the Malay world.'),
      '<p class="quote">"Takkan Melayu hilang di dunia." The Malays will never vanish from the earth. From the Hikayat Hang Tuah.</p>',
      P('Siam and Melaka were not hero and villain: two kingdoms competing for the same sea. Fifty years later both would face the Portuguese.')],
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
  if (typeof SFX !== 'undefined') SFX.play(id.startsWith('age') ? 'nobat' : 'gong');
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
const FOE_SHORT = { keris: 'golok', tombak: 'galah', archer: 'archer', daab: 'sword', hok: 'spear', thanu: 'fire archer', chang: 'elephant', cmdr: 'commander', light: 'boat', ay_boat: 'war boat', galley: 'galley', ay_galley: 'galley' };
function raidPreview(i) {
  const R = RAIDS[Math.min(i, RAIDS.length - 1)], tot = {};
  for (const k of raidKinds(R, G.diff)) tot[k] = (tot[k] || 0) + 1;
  for (const L of (R.sea && R.sea.land) || []) tot[L.k] = (tot[L.k] || 0) + 1;
  return Object.keys(tot).map(k => tot[k] + ' ' + FOE_SHORT[k] + (tot[k] > 1 ? 's' : '')).join(', ');
}
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  const idle = idleVillagers().length, n = G.age[0] + 1;
  if (M.routed) return 'The Siamese army breaks and runs for home!';
  if (M.finalOn && M.cmdr && M.cmdr.hp > 0) return 'The army of 1446 is here. Kill the Siamese commander under the white parasol!';
  const burning = G.buildings.some(b => b.team === 0 && b.burn && b.hp > 0);
  if (burning) return 'A building is on fire! Send villagers to stand beside it and put it out.';
  if (M.active) {
    const left = M.cols.reduce((a, c) => a + (c.done ? 0 : c.left), 0);
    return 'Raid ' + M.cols.filter(c => !c.done).map(c => c.wave + 1).join(', ') + ': ' + left + ' raiders left. Break them!';
  }
  if (M.t < 45 && M.raid === 0) return 'Put villagers to work and build Houses before the first raid comes.';
  if (idle > 2) return idle + ' villagers are idle. Tap the idle button to put them to work.';
  if (M.aging) return 'The court works toward the ' + AGES[M.aging.to].name + ': ' + Math.ceil(M.aging.left) + 's.';
  if (AGES[n] && G.ageNeedMet(0, n) && G.canAfford(0, AGES[n].cost)) return 'You can advance to the ' + AGES[n].name + '. Select the Town Centre.';
  if (AGES[n] && !G.ageNeedMet(0, n)) return 'The ' + AGES[n].name + ' needs ' + AGES[n].need.text + '.';
  if (M.finalAt && !M.finalOn) return 'The Siamese army marches in ' + fmtTime(M.finalAt - M.t) + '. Make ready!';
  return 'Next raid: ' + raidPreview(M.raid) + '.';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'fallen';
  const tc = G.buildings.find(b => b.team === 0 && b.kind === 'towncentre');
  const a = G.age[0], items = [];
  for (let n = 2; n <= 4; n++) items.push({ t: 'Reach the ' + AGES[n].name + ' (' + AGES[n].local + ')' + (M.aging && M.aging.to === n ? ': ' + Math.floor((1 - M.aging.left / M.aging.tot) * 100) + '%' : ''), ok: a >= n, how: 'Select the Town Centre and tap the age button once you have the buildings and resources it asks for.' });
  items.push({ t: 'Break the Siamese army of 1446' + (M.finalOn && M.cmdr && M.cmdr.hp > 0 ? ' (commander ' + pct(M.cmdr) + ')' : ''), ok: !!M.routed, how: 'Kill the commander on his elephant: tombak spears and guns beat elephants. The army comes after the last raid.' });
  items.push({ t: 'Keep the Town Centre standing (' + pct(tc) + ')', ok: false, how: 'Ring the bell to shelter villagers inside, and send villagers to repair it between raids.' });
  const heroes = [];
  if (G.units.some(u => u.kind === 'tuah' && u.team === 0) || M.heroBack.tuah) heroes.push('Hang Tuah: ' + (M.heroBack.tuah ? 'back in ' + Math.ceil(M.heroBack.tuah - M.t) + 's' : pct(G.units.find(u => u.kind === 'tuah'))));
  if (M.perak || M.heroBack.perak) heroes.push('Tun Perak: ' + (M.heroBack.perak ? 'back in ' + Math.ceil(M.heroBack.perak - M.t) + 's' : pct(M.perak)));
  if (heroes.length) items.push({ t: heroes.join(' · '), opt: true });
  if (!M.active && !M.finalAt) items.push({ t: 'Raid ' + (M.raid + 1) + ' in ' + fmtTime(M.next - M.t) + ': ' + raidPreview(M.raid), tip: true });
  if (M.finalAt && !M.finalOn) items.push({ t: 'The army of 1446 marches in ' + fmtTime(M.finalAt - M.t), tip: true });
  items.push({ t: a < 2 ? 'Ages: select the Town Centre. The Kingdom Age needs 2 of Barracks, Gudang, Jelapang or Port.' : a < 3 ? 'The Age of Commerce needs 2 of Istana, Rumah Tabib, Menara Kawal, Pangkalan. A Pangkalan stands on an Orang Laut village landing.' : a < 4 ? 'The Golden Age needs an Istana and a Pangkalan.' : 'Hang Tuah trains at the Istana. Spears and guns beat elephants.', tip: true });
  return { title: 'Rise of Melaka · ' + AGES[a].local, items };
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
  if (M) {
    if (M.routed) clock = 'Victory';
    else if (M.finalOn) clock = 'The army of 1446';
    else if (M.finalAt) clock = 'Siam marches in ' + fmtTime(M.finalAt - M.t);
    else if (M.active) clock = 'Raid ' + M.raid + ' attacking';
    else clock = 'Raid ' + (M.raid + 1) + ' in ' + fmtTime(M.next - M.t);
  }
  $('clock').textContent = clock;
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); const fx = sfxForMsg(m.text); if (fx) SFX.play(fx); }
  sfxTick();
  if (sel.length === 1 && sel[0].kind === 'towncentre' && M && M.aging) updatePanelKeyOnly();
  if (M && M.cardQ.length && !G.over && !storyOpen) {
    const c = M.cardQ.shift();
    if (c === 'rout') vignette('rout', 'The Siamese commander falls. His army breaks and runs back the way it came.');
    else if (c === 'siam' && M.cards.siam) { /* once */ }
    else { if (c === 'siam') M.cards.siam = true; showStory(c); }
  }
  if (M && M.broken > (M.vigBroken || 0)) { M.vigBroken = M.broken; if (M.broken === 1) toast('The first raid is broken. Its baggage is carried into Melaka.'); }
}
let lastAgeKey = '';
function updatePanelKeyOnly() { const k = mrPanelKey([]); if (k !== lastAgeKey) { lastAgeKey = k; panelKey = ''; } }

/* ---------- game flow ---------- */
function loadMap(g) {
  G = g; terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  sel = []; mode = null; markers = []; boxRect = null; panelKey = ''; ended = false; acc = 0; seenMsgs = new WeakSet(); idleIdx = 0; objStarted = false;
  for (const k in SPR) if (k.startsWith('melage|')) delete SPR[k];
  view.zoom = view.w > 700 ? 1.4 : 1; resize();
}
function startGame(seed) {
  seedUsed = seed; storyOpen = null;
  loadMap(new Game({ seed, diff }));
  const tc = G.byId.get(G.M.tc);
  centerOn(tc.x + 1, tc.y + 1);
  select([tc]);
  started = true; paused = false; $('hud').hidden = false; showOv(null); updateHud(); updatePanel();
  showStory('opening');
}
// practice: start at a later age with the town and army a player would have by then
function skipTo(which) {
  startGame(seedUsed);
  storyOpen = null; showOv(null); paused = false;
  const M = G.M, tc = G.byId.get(M.tc), late = which === 'final';
  const age = late ? 4 : 3;
  for (let n = 2; n <= age; n++) { G.applyAge(0, n); }
  M.cardQ.length = 0;
  M.raid = late ? 11 : 6; M.broken = M.raid; M.warned = M.raid - 1; M.next = M.t + 40;
  if (late) { M.finalAt = M.t + 30; M.next = 1e9; }
  G.res[0] = late ? { food: 1200, wood: 1200, gold: 900 } : { food: 900, wood: 900, gold: 600 };
  const spot = (kind, dx, dy) => { const p = G.nearestFree(tc.tx + dx, tc.ty + dy, 0, 8); for (let r = 0; r < 6; r++) for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (G.canPlace(kind, p.x + xx, p.y + yy, 0)) return G.addBuilding(kind, 0, p.x + xx, p.y + yy, true); return null; };
  spot('barracks', 6, -4); spot('palace', -6, -6); spot('rumahtabib', 6, 3); spot('house', -4, 4); spot('house', -2, 6); spot('house', 2, 7); spot('house', 5, 6); spot('house', -6, 2);
  for (const [dx, dy] of [[1, 5], [4, 5], [-3, -3], [0, -4]]) spot('farm', dx, dy);
  if (late) spot('tower', 10, -1);
  const put = (k, x, y) => { const p = G.openSpot(x, y, 0); return G.addUnit(k, 0, p.x, p.y); };
  const army = late ? { keris: 6, tombak: 8, bediraja: 8, pahlawan: 3, tabib: 2, meriam: 2, tuah: 1 } : { keris: 4, tombak: 5, pembedil: 5, pahlawan: 2, tabib: 1, meriam: 1 };
  let i = 0; for (const k in army) for (let j = 0; j < army[k]; j++, i++) put(k, tc.x + 5 + (i % 8) * 1.1, tc.y - 2 + Math.floor(i / 8));
  for (let j = 0; j < (late ? 10 : 8); j++) put('villager', tc.x - 2 + (j % 5), tc.y + 3 + Math.floor(j / 5));
  for (const u of G.units) if (u.team === 0) soldierArm(u, G.age[0]);
  G.msg('Practice: starting in the ' + AGES[age].name + '.');
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
  $('end-tag').textContent = win ? 'Demo complete' : 'Melaka has fallen';
  $('end-title').textContent = win ? 'The Golden Age' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  $('end-sub').textContent = win ? 'Melaka grew from a fishing village to the greatest port of Southeast Asia, and Siam was turned back.'
    : 'The Town Centre has fallen. Parameswara\'s people scatter along the coast. Takkan Melayu hilang di dunia: they will build again.';
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + AGES[G.age[0]].local + '</b><span>Age reached</span></div>' +
    '<div><b>' + M.broken + '</b><span>Raids broken</span></div><div><b>' + G.stats.kills + '</b><span>Raiders defeated</span></div>' +
    '<div><b>' + G.stats.trained + '</b><span>Trained</span></div><div><b>' + M.spoils + '</b><span>Spoils (gold)</span></div>';
  const old = $('ov-end').querySelector('.end-art'); if (old) old.remove();
  if (!win) { const art = document.createElement('div'); try { art.appendChild(drawScene('fall')); } catch (e) { /* no art */ } art.className = 'end-art'; $('end-title').after(art); }
  SFX.play(win ? 'victory' : 'defeat');
  showOv('end');
}

function mrBoot() {
  setupObj(); setupSound(); setupFullscreen();
  const relayout = () => setTimeout(() => { resize(); if (G && G.M) updateHud(); }, 250);
  window.addEventListener('orientationchange', relayout);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
  const set = (id, name) => { const e = $(id); if (e) e.src = resIcon(name); };
  set('i-food', 'food'); set('i-wood', 'wood'); set('i-gold', 'gold'); set('i-pop', 'pop'); set('i-idle', 'idle'); set('i-army', 'army');
  set('i-zin', 'plus'); set('i-zout', 'minus'); set('i-menu', 'menu');
  $('hud').hidden = true; resize(); showOv('start');
  G = new Game({ seed: seedUsed, diff }); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  view.zoom = view.w > 700 ? 1.4 : 1; centerOn(STARTS[0].x + 4, STARTS[0].y + 4);
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
  const h = (location.hash || '').slice(1);
  if (h === 'age3' || h === 'final') skipTo(h);
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
