/* ===== mp-ui.js ===== */
Object.assign(TRAIN_SHORT, { villager: 'Kawula', keris: 'Golok', tombak: 'Galah', archer: 'Panah', pembedil: 'Bedil', bediraja: 'Cetbang Gun', meriam: 'Cetbang', tuah: 'Gajah Mada', bhaya: 'Bhayangkara', acaraki: 'Acaraki', light: 'Jukung Perang', galley: 'Kelulus', fireship: 'Perahu Api', trade: 'Jong', frigate: 'Jong Perang', flagship: 'Jong Raya' });
Object.assign(BUILD_SHORT, { granary: 'Lumbung', tower: 'Bale Kulkul', palace: 'Kraton', tradepost: 'Bandar', patirthan: 'Patirthan', sawah: 'Sawah' });
const TIPS = [
  'The story goes that one of Wijaya\'s men, clearing the Tarik forest, bit into the fruit of a maja tree and found it bitter (pahit). The new village was named after it: Majapahit.',
  'In 1292 Jayakatwang of Kediri killed King Kertanegara of Singhasari. Kertanegara\'s son-in-law, Raden Wijaya, made peace with him and was given the Tarik forest to clear.',
  'Kublai Khan sent a great fleet to Java in 1293 to punish Kertanegara, who had sent back his envoy with a scarred face. Kertanegara was already dead when it arrived.',
  'Wijaya joined the Yuan army to bring down Kediri, then turned on it. The Yuan lost thousands of men and sailed home. Wijaya was crowned Kertarajasa Jayawardhana that same year.',
  'Majapahit built in red brick. The ruins of its capital at Trowulan, in East Java, still show its gates, bathing pools and temples.',
  'The cetbang was Majapahit\'s bronze cannon, loaded from the back and often mounted on ships. Bedil is the old Javanese word for a gun.',
  'The Bhayangkara were the king\'s guard. When Ra Kuti seized the capital in 1319, their young commander Gajah Mada led King Jayanegara to safety, then took the city back.',
  'Ranggalawe, Lembu Sora and Nambi had fought beside Wijaya. Their risings came from inside the kingdom, from old comrades who felt wronged.',
  'Tribhuwana Wijayatunggadewi, Wijaya\'s daughter, ruled as queen in her own right from 1328 to 1350. Majapahit began to grow into an empire under her.',
  'In 1336 Gajah Mada swore the Sumpah Palapa: he would not taste palapa until the islands of Nusantara were united.'
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
    return 'The Kingdom Age: Majapahit is a kingdom now. If the Town Centre falls, all is lost.';
  }
  if (b.kind === 'palace' && b.team === 0) return 'Trains Bhayangkara and Gajah Mada.';
  return baseBldNote(b);
}

/* ---------- story cards ---------- */
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>';
  if (id === 'opening') return {
    tag: 'Majapahit · Village Age · Wanua · 1293', title: 'Rise of Majapahit',
    body: [P('King Kertanegara of Singhasari is dead, killed by Jayakatwang of Kediri. His son-in-law, Raden Wijaya, has made his peace with the new king and been given a stretch of wild forest at Tarik, by the Brantas river.'),
      P('His followers are clearing it now. They named the place after a bitter fruit they found there: Majapahit.'),
      P('Kediri is watching. And across the sea, the Yuan emperor has sent a fleet to punish a king who is already dead.'),
      '<p class="goal">Objective: grow the village into the Kingdom of Majapahit, hold out against Kediri, the Yuan and the rebels, then break the great rising of Sadeng and Keta. Keep the Town Centre standing.</p>',
      '<p class="lead tipline">Select the Town Centre to advance to the Kingdom Age. It needs certain buildings first and brings new units and ships. Ageing up also draws the next raid closer.</p>'],
    btn: 'Clear the forest'
  };
  if (id === 'age2') return {
    tag: 'Kingdom Age · Kadatwan', title: 'Kertarajasa',
    body: [P('Kediri has fallen and the Yuan have sailed home. Raden Wijaya is crowned Kertarajasa Jayawardhana, first king of Majapahit. A kraton of red brick rises at the heart of the town.'),
      P('The Bhayangkara guard the king, and the acaraki, healers who know the jamu herbs, tend the wounded.'),
      P('In the Bhayangkara a young guard named Gajah Mada will one day save a king, and then command the queen\'s armies.'),
      '<p class="goal">New: Kraton (Bhayangkara, Gajah Mada), Patirthan (Acaraki healers), Bale Kulkul watchtower, stone Wall, Kelulus galleys and Jong traders. Fire arrows at sea. Soldiers +1 armour. This is the last age in this mission.</p>',
      '<p class="lead tipline">' + TIPS[4] + '</p>'],
    btn: 'Onward'
  };
  if (id === 'age3') return {
    tag: 'Age of Commerce · Bandar', title: 'The river ports',
    body: [P('Rice comes down the Brantas and goes out from the ports of the north coast, Tuban and Gresik. Spices from the eastern islands come back. Majapahit grows rich on the trade between them.'),
      P('Bronze smiths cast the cetbang, and your archers take up the bedil. Your soldiers now wear the kere, a mail coat.'),
      '<p class="goal">New: Bedil Gunners, Cetbang bronze cannon (3 at most), Jong Perang warships with ship cannon. Towers fire swivel guns. Soldiers +1 armour.</p>',
      '<p class="lead tipline">' + TIPS[5] + '</p>'],
    btn: 'Onward'
  };
  if (id === 'age4') return {
    tag: 'Golden Age · Nusantara', title: 'The queen and her commander',
    body: [P('Queen Tribhuwana rules Majapahit, and Gajah Mada, who once saved a king with a handful of guards, commands her armies.'),
      P('Gajah Mada now serves at the Kraton. Your Bedil Gunners become Cetbang Handgunners.'),
      '<p class="goal">New: Gajah Mada (hero, at the Kraton), Cetbang Handgunners, the Jong Raya flagship. Soldiers +1 armour more. Sadeng and Keta are gathering an army: it marches in ' + FINAL_DELAY + ' seconds.</p>',
      '<p class="lead tipline">' + TIPS[8] + '</p>'],
    btn: 'Make ready'
  };
  if (id === 'yuan') return {
    tag: 'Raid 3 · 1293', title: 'The Yuan fleet',
    body: [P('The Yuan fleet has come to punish Kertanegara and found him dead. Wijaya used it against Kediri. Now he has turned on it, and the Yuan army is coming for him.'),
      P('Their troops land from big war junks. Shield soldiers lead, and crossbowmen shoot from behind them.'),
      '<p class="goal">Keep spears and archers near the river landing. Break each landing party as it comes ashore.</p>'],
    btn: 'Defend Majapahit'
  };
  if (id === 'rebels') return {
    tag: 'Raid 6 · 1295', title: 'Old comrades',
    body: [P('Ranggalawe of Tuban fought beside Wijaya against Kediri and the Yuan. Now he thinks the king has passed him over, and he has taken up arms.'),
      P('Other old comrades will rise after him: Lembu Sora, Nambi, Ra Kuti. Their archers shoot fire.'),
      '<p class="goal">Fire: villagers standing next to a burning building put it out. Red brick burns at half the usual rate.</p>'],
    btn: 'Defend Majapahit'
  };
  if (id === 'final') return {
    tag: 'The great rising · 1331', title: 'Sadeng and Keta',
    body: [P('Sadeng and Keta, in the far east of Java, have risen together. Their army comes by both roads, and their boats are on the coast.'),
      P('History: Gajah Mada broke the rising. The queen herself came to the field, and afterwards she made Gajah Mada her mahapatih, chief minister.'),
      '<p class="goal">Objective: kill the lord of Sadeng under his red parasol, or break his whole army. Queen Tribhuwana has come to the Town Centre with her guard, and her presence gives +2 attack nearby.</p>',
      '<p class="lead tipline">' + TIPS[6] + '</p>'],
    btn: 'To the walls'
  };
  if (id === 'closing') return {
    tag: 'Majapahit, 1336', title: 'The Palapa oath',
    body: [P('Sadeng and Keta were brought back under the crown. In 1336, before the queen and her court, Gajah Mada swore an oath.'),
      '<p class="quote">"Only when Nusantara is united will I taste palapa." From the Pararaton.</p>',
      P('Under Tribhuwana\'s son Hayam Wuruk, Majapahit\'s influence spread across the islands, from Sumatra to the Moluccas. For many of those islands it came as conquest, and in our time the oath is remembered as a call to unity.'),
      P('Kediri, the Yuan and the rebels were not villains: each fought for its own place in a changing Java.')],
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
const FOE_SHORT = { kd_sword: 'sword', kd_spear: 'spear', kd_archer: 'archer', yu_shield: 'shield', yu_spear: 'spear', yu_xbow: 'crossbow', yu_junk: 'war junk', yu_lander: 'troop junk', rb_sword: 'sword', rb_spear: 'spear', rb_archer: 'fire archer', rb_guard: 'guard', rb_boat: 'boat', rb_galley: 'galley', cmdr: 'lord' };
function raidPreview(i) {
  const R = RAIDS[Math.min(i, RAIDS.length - 1)], tot = {};
  for (const k of raidKinds(R, G.diff)) tot[k] = (tot[k] || 0) + 1;
  for (const L of (R.sea && R.sea.land) || []) tot[L.k] = (tot[L.k] || 0) + 1;
  return Object.keys(tot).map(k => tot[k] + ' ' + FOE_SHORT[k] + (tot[k] > 1 ? 's' : '')).join(', ');
}
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  const idle = idleVillagers().length, n = G.age[0] + 1;
  if (M.routed) return 'The army of Sadeng breaks and runs for home!';
  if (M.finalOn && M.cmdr && M.cmdr.hp > 0) return 'Sadeng and Keta are here. Kill the lord of Sadeng under the red parasol!';
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
  if (M.finalAt && !M.finalOn) return 'Sadeng and Keta march in ' + fmtTime(M.finalAt - M.t) + '. Make ready!';
  return 'Next raid: ' + raidPreview(M.raid) + '.';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'fallen';
  const tc = G.buildings.find(b => b.team === 0 && b.kind === 'towncentre');
  const a = G.age[0], items = [];
  for (let n = 2; n <= MAX_AGE; n++) items.push({ t: 'Reach the ' + AGES[n].name + ' (' + AGES[n].local + ')' + (M.aging && M.aging.to === n ? ': ' + Math.floor((1 - M.aging.left / M.aging.tot) * 100) + '%' : ''), ok: a >= n, how: 'Select the Town Centre and tap the age button once you have the buildings and resources it asks for.' });
  items.push({ t: 'Break the raids (' + Math.min(M.broken, RAIDS.length) + ' of ' + RAIDS.length + ')', ok: M.broken >= RAIDS.length, how: 'Meet each raid with spears in front and archers behind. Towers and walls on the road in help.' });
  if (M.camp) items.push({ t: 'Optional: burn Kediri\'s war camp in the north-east', ok: !!M.campDown, opt: !M.campDown, how: 'Send a group of soldiers north-east; their torches burn the camp\u2019s buildings.' });
  items.push({ t: 'Break the rising of Sadeng and Keta' + (M.finalOn && M.cmdr && M.cmdr.hp > 0 ? ' (lord ' + pct(M.cmdr) + ')' : ''), ok: !!M.routed, how: 'Kill the rebel lord. The rising comes after the last raid.' });
  items.push({ t: 'Keep the Town Centre standing (' + pct(tc) + ')', ok: false, how: 'Ring the bell to shelter villagers inside, and send villagers to repair it between raids.' });
  const heroes = [];
  if (G.units.some(u => u.kind === 'tuah' && u.team === 0) || M.heroBack.tuah) heroes.push('Gajah Mada: ' + (M.heroBack.tuah ? 'back in ' + Math.ceil(M.heroBack.tuah - M.t) + 's' : pct(G.units.find(u => u.kind === 'tuah'))));
  if (M.perak || M.heroBack.perak) heroes.push('Tribhuwana: ' + (M.heroBack.perak ? 'back in ' + Math.ceil(M.heroBack.perak - M.t) + 's' : pct(M.perak)));
  if (heroes.length) items.push({ t: heroes.join(' · '), opt: true });
  if (!M.active && !M.finalAt) items.push({ t: 'Raid ' + (M.raid + 1) + ' in ' + fmtTime(M.next - M.t) + ': ' + raidPreview(M.raid), tip: true });
  if (M.finalAt && !M.finalOn) items.push({ t: 'Sadeng and Keta march in ' + fmtTime(M.finalAt - M.t), tip: true });
  items.push({ t: a < 2 ? 'Ages: select the Town Centre. The Kingdom Age needs 2 of Barracks, Gudang, Lumbung, Port or Bandar. A Bandar stands on a village landing.' : 'Gajah Mada trains at the Kraton.', tip: true });
  return { title: 'Rise of Majapahit · ' + AGES[a].local, items };
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
    else if (M.finalOn) clock = 'Sadeng and Keta';
    else if (M.finalAt) clock = 'Sadeng rises in ' + fmtTime(M.finalAt - M.t);
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
    if (c === 'rout') vignette('rout', 'The lord of Sadeng falls. His army breaks and runs back the way it came.');
    else if ((c === 'yuan' || c === 'rebels') && M.cards[c]) { /* once */ }
    else { if (c === 'yuan' || c === 'rebels') M.cards[c] = true; showStory(c); }
  }
  if (M && M.broken > (M.vigBroken || 0)) { M.vigBroken = M.broken; if (M.broken === 1) toast('The first raid is broken. Its baggage is carried into Majapahit.'); }
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
  const age = MAX_AGE;
  for (let n = 2; n <= age; n++) { G.applyAge(0, n); }
  M.cardQ.length = 0;
  M.raid = late ? RAIDS.length : 5; M.broken = M.raid; M.warned = M.raid - 1; M.next = M.t + 40;
  if (late) { M.raid = RAIDS.length; M.finalAt = M.t + 30; M.next = 1e9; }
  G.res[0] = late ? { food: 1000, wood: 1000, gold: 600 } : { food: 800, wood: 800, gold: 400 };
  const spot = (kind, dx, dy) => { const p = G.nearestFree(tc.tx + dx, tc.ty + dy, 0, 8); for (let r = 0; r < 6; r++) for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (G.canPlace(kind, p.x + xx, p.y + yy, 0)) return G.addBuilding(kind, 0, p.x + xx, p.y + yy, true); return null; };
  spot('barracks', 6, -4); spot('palace', -6, -6); spot('patirthan', 6, 3); spot('house', -4, 4); spot('house', -2, 6); spot('house', 2, 7); spot('house', 5, 6); spot('house', -6, 2);
  for (const [dx, dy] of [[1, 5], [4, 5], [-3, -3], [0, -4]]) spot('sawah', dx, dy);
  if (late) spot('tower', 10, -1);
  const put = (k, x, y) => { const p = G.openSpot(x, y, 0); return G.addUnit(k, 0, p.x, p.y); };
  const army = late ? { keris: 7, tombak: 9, archer: 9, bhaya: 4, acaraki: 2, tuah: 1 } : { keris: 4, tombak: 5, archer: 5, bhaya: 2, acaraki: 1 };
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
  $('end-tag').textContent = win ? 'Demo complete' : 'Majapahit has fallen';
  $('end-title').textContent = win ? 'The Palapa Oath' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  $('end-sub').textContent = win ? 'Majapahit grew from a forest clearing to the kingdom of the Palapa oath.'
    : 'The Town Centre has fallen. Wijaya\'s people scatter into the forest. They will clear it again.';
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
  if (h === 'age2' || h === 'final') skipTo(h);
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
