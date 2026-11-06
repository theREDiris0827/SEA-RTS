/* ===== dv-ui.js ===== */
Object.assign(TRAIN_SHORT, { villager: 'Nông Dân', dao: 'Đao Thủ', thuong: 'Thương', hoadong: 'Hỏa Đồng', thaythuoc: 'Thầy Thuốc', daibac: 'Đại Bác', boat: 'Thúng', danbinh: 'Dân Binh' });
Object.assign(BUILD_SHORT, { house: 'House', farm: 'Rice', dinh: 'Đình', store: 'Storehouse', granary: 'Granary', barracks: 'Barracks', nhathuoc: 'Physician', tower: 'Tower', wall: 'Bamboo', gate: 'Gate', port: 'Landing' });
const TIPS = [
  'Every northern village had its đình, the communal house where the village honoured its guardian spirit, held meetings and feasts. In this game it is also where villagers take up arms.',
  'Lũy tre, the hedge of thorny bamboo on an earth bank, ringed the villages of the Red River delta. People still say the bamboo hedge is the village\'s wall.',
  'Hồ Nguyên Trừng, son of the Hồ king, cast Đại Việt\'s first cannon. Taken north by the Ming in 1407, he ended his life making guns for the Ming emperor.',
  'Fire lances and handguns came into Đại Việt from Ming China, the same empire it was fighting. By the 1420s the Lam Sơn army used them well.',
  'In 1419 Lê Lai put on Lê Lợi\'s royal clothes and charged the Ming so his lord could escape. Vietnamese families still honour Lê Lai the day before Lê Lợi.',
  'Legend says Nguyễn Trãi wrote "Lê Lợi will be king" in honey on leaves, and the ants ate the words out, so people took it as a sign from heaven. Told as a story, nothing more.',
  'Nguyễn Trãi\'s strategy was tâm công, "attacking the heart": letters urging Ming garrisons to give up. Many forts surrendered without a fight.',
  'The legend of An Dương Vương tells of a magic crossbow that shot a thousand bolts. In the game the crossbow is only a weapon: the legend stays a story.',
  'Chi Lăng, 1427: the Ming relief army marched into a mountain pass. Its general Liễu Thăng was killed there, near Mã Yên mountain, and the war was decided.',
  'After the war, the Lam Sơn army gave the defeated Ming soldiers boats and food so they could go home. Nguyễn Trãi wrote that it was better to end the war than to take revenge.'
];
let storyOpen = null;

/* ---------- panel additions (the patched panel calls these) ---------- */
function readyMilitia(us) { return us.filter(u => u.kind === 'danbinh' && G.t - (u.armedAt || -99) >= DISARM_WAIT).length; }
function dvPanelKey(us) {
  const M = G.M;
  return (us.length ? readyMilitia(us) + ',' + us.filter(u => u.kind === 'danbinh').length : '') + '|' + (M ? M.wave + (M.active ? 'a' : 'q') : '');
}
function costBtn(act, icon, label, cost, title, on) {
  return '<button class="cmd' + (on ? ' on' : '') + '" data-a="' + act + '" title="' + title + '"><img alt="" src="' + icon + '"><span class="nm">' + label + '</span><span class="ct">' + (cost ? costHTML(cost) : '&nbsp;') + '</span></button>';
}
function dvUnitCmds(us) {
  let s = '';
  if (us.some(u => u.kind === 'villager')) s += costBtn('arm', unitIcon('danbinh', 0), 'Arm', MILITIA_COST, 'Walk to the nearest Đình and take up arms as Dân Binh (15 wood, 10 gold each)');
  const db = us.filter(u => u.kind === 'danbinh');
  if (db.length) {
    const ready = readyMilitia(db);
    s += costBtn('disarm', unitIcon('villager', 0), ready ? 'To fields' : 'Fields ' + Math.ceil(Math.min(...db.map(u => DISARM_WAIT - (G.t - (u.armedAt || -99))))) + 's', null, 'Go back to a Đình and return to work as villagers (30 s after arming)', false);
  }
  return s;
}
function dvBldCmds(b) {
  if (b.team !== 0 || b.hp <= 0 || !b.done) return '';
  if (b.kind === 'dinh') {
    const near = G.units.filter(u => u.team === 0 && u.hp > 0 && u.kind === 'villager' && rectDist(u.x, u.y, b.rect) <= 10).length;
    return costBtn('drum', unitIcon('danbinh', 0), 'Drum (' + near + ')', MILITIA_COST, 'Sound the drum: every villager within earshot runs here to take up arms (15 wood, 10 gold each)') +
      costBtn('sendhome', unitIcon('villager', 0), 'To fields', null, 'Send nearby militia (armed for 30 s or more) back to work');
  }
  if (b.kind === 'gate') return '<button class="cmd' + (b.open ? ' on' : '') + '" data-a="gate" title="' + (b.open ? 'Close the gate' : 'Open the gate') + '"><img alt="" src="' + bldIcon('gate', 0) + '"><span class="nm">' + (b.open ? 'Close' : 'Open') + '</span><span class="ct">&nbsp;</span></button>';
  return '';
}
function dvPanelAction(a, el) {
  if (a === 'arm' || a === 'disarm') {
    let n = 0, err = null;
    for (const u of selUnits()) if ((a === 'arm' && u.kind === 'villager') || (a === 'disarm' && u.kind === 'danbinh')) { const e = G.orderArm(u); if (e) err = e; else n++; }
    toast(n ? (a === 'arm' ? n + ' villager' + (n > 1 ? 's' : '') + ' head to the Đình to take up arms.' : n + ' militia head back to the fields.') : (err || 'Nobody to send.'));
    panelKey = ''; return true;
  }
  if (a === 'drum') { const n = G.soundDrum(sel[0]); toast(n ? 'The drum sounds! ' + n + ' villagers run to take up arms.' : 'No villagers within earshot.'); panelKey = ''; return true; }
  if (a === 'sendhome') { const r = G.sendHome(sel[0]); toast(r.n ? r.n + ' militia go back to the fields.' : r.wait ? 'The militia nearby armed less than 30 s ago.' : 'No militia nearby.'); panelKey = ''; return true; }
  if (a === 'gate') { const b = sel[0]; if (!G.setGate(b, !b.open)) toast('Clearing the gateway, then it closes.'); panelKey = ''; return true; }
  if (a === 'dinhs') {
    const l = G.buildings.filter(b => b.team === 0 && b.kind === 'dinh' && b.hp > 0); if (!l.length) { toast('You have no Đình.'); return true; }
    dinhIdx = (dinhIdx + 1) % l.length; centerOn(l[dinhIdx].x, l[dinhIdx].y); select([l[dinhIdx]]); return true;
  }
  if (a === 'callwave') { const e = G.callWave(); if (e) toast(e); panelKey = ''; return true; }
  return false;
}
let dinhIdx = -1;
function describeOrder(u) {
  const o = u.order;
  if (o.t === 'arm') return o.s === 'work' ? 'Taking up arms' : 'To the Đình';
  if (o.t === 'disarm') return o.s === 'work' ? 'Laying down arms' : 'To the Đình';
  if (o.t === 'repair') return 'Repairing';
  if (u.hidden) return 'Hidden in the forest';
  return baseDescribeOrder(u);
}
function bldNote(b) {
  if (b.kind === 'dinh') return 'Houses the village: +25 population, and 10 villagers can shelter inside. Takes food, wood and gold. Farms nearby gather 25% faster. Villagers take up arms here.';
  if (b.kind === 'farm' && b.team === 0 && G.nearDinh(b)) return b.food + ' food left · Đình bonus +25%';
  if (b.kind === 'wall') return 'Bamboo hedge on an earth bank. Villagers can repair it. Cannon break it fast.';
  if (b.kind === 'gate') return b.open ? 'Open: your people and the enemy can pass.' : 'Closed. Select it to open.';
  if (b.kind === 'nhathuoc') return 'Trains Thầy Thuốc, physicians who heal the wounded.';
  if (b.kind === 'towncentre' && b.team === 0) return 'If the Citadel falls, the valley is lost. It casts Đại Bác cannon (3 at most).';
  return baseBldNote(b);
}

/* ---------- walls: tap ✓ at each corner and the hedge joins up in a straight run ---------- */
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
  toast(placed + ' section' + (placed > 1 ? 's' : '') + ' of bamboo hedge. Move on and tap ✓ for the next run, ✗ to stop.');
  panelKey = ''; return true;
}

/* ---------- story cards ---------- */
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>', M = G.M;
  if (id === 'opening') return {
    tag: 'Đại Việt · Age of Commerce · 1426', title: 'The Lam Sơn Stand',
    body: [P('Twenty years ago the Ming empire took Đại Việt, saying it came to restore the old dynasty. It stayed as a ruler.'),
      P('In 1418 a landowner of Lam Sơn, Lê Lợi, swore an oath with a small band in the hills of Thanh Hóa. Now his army holds the valleys, and his strategist Nguyễn Trãi is winning the villages over one by one.'),
      P('The Ming will not let the hills go. Columns are marching on your valley down three mountain passes, each one bigger than the last.'),
      '<p class="goal">Objective: hold the valley through ten Ming waves. Keep the Citadel standing.</p>',
      '<p class="lead tipline">Build up between waves. Arm villagers at the Đình when the enemy comes, and hide soldiers in the forest at the pass mouths: standing still among the trees, they can\'t be seen until they strike.</p>'],
    btn: 'To the passes'
  };
  if (id === 'totdong') return {
    tag: 'Wave 5 · Late 1426', title: 'Tốt Động',
    body: [P('The Ming commander Vương Thông has marched out of Đông Quan, the occupied capital, with his main army. Near Tốt Động and Chúc Động his columns struggle through the wet fields.'),
      P('History: the Lam Sơn army waited for them in ambush and broke them. Vương Thông fell back into Đông Quan and was besieged there.'),
      '<p class="goal">Five cannon and a mixed column are coming down the Chi Lăng pass. Hold the woods at its mouth.</p>',
      '<p class="lead tipline">' + TIPS[3] + '</p>'],
    btn: 'Hold'
  };
  if (id === 'chilang') return {
    tag: 'Wave 10 · Autumn 1427', title: 'Chi Lăng',
    body: [P('The Ming emperor has sent a great relief army south to save Đông Quan. Its vanguard, under the general Liễu Thăng, is marching through the narrow pass of Chi Lăng.'),
      P('The Lam Sơn army has hidden men in the forests on both sides of the pass. Liễu Thăng rides at the head of the column, on a white horse.'),
      '<p class="goal">Objective: kill Liễu Thăng. If the general falls, his army breaks. Spears stop horses.</p>',
      '<p class="lead tipline">' + TIPS[8] + '</p>'],
    btn: 'Spring the ambush'
  };
  if (id === 'closing') return {
    tag: 'Đông Quan, 1428', title: 'The Great Proclamation',
    body: [P('With Liễu Thăng dead at Chi Lăng, the relief army broke. Vương Thông made peace and left Đông Quan. The Ming soldiers were given boats and food to go home.'),
      P('In 1428 Nguyễn Trãi wrote the Bình Ngô đại cáo, the Great Proclamation of Victory over the Ming. Lê Lợi became king and founded the Later Lê dynasty.'),
      '<p class="quote">"Our Đại Việt has long been a land of ancient culture, with its own mountains and rivers, its own customs, north and south." From the Bình Ngô đại cáo.</p>',
      '<p class="legend">The people say that after the war Lê Lợi returned his sword to a golden turtle in a lake in Thăng Long. The lake is still called Hồ Hoàn Kiếm, the Lake of the Returned Sword. Told plainly as legend.</p>',
      P('The Ming were an empire that reached too far, not villains. Both sides\' soldiers were far from home. The kingdoms changed. The lake still keeps the sword.')],
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
const MING_SHORT = { m_spear: 'spear', m_shield: 'shield', m_xbow: 'crossbow', m_gun: 'gun', m_cav: 'horse', m_cannon: 'cannon', m_hero: 'general' };
function wavePreview(i) {
  const W_ = WAVES[i], tot = {};
  for (const c of W_.cols) for (const k in c.u) tot[k] = (tot[k] || 0) + (k === 'm_hero' ? 1 : Math.max(1, Math.round(c.u[k] * DMUL[G.diff])));
  return Object.keys(tot).map(k => tot[k] + ' ' + MING_SHORT[k] + (tot[k] > 1 && k !== 'm_hero' ? (k === 'm_cav' ? 's' : k === 'm_cannon' ? '' : 's') : '')).join(', ');
}
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  const idle = idleVillagers().length;
  if (M.routed) return 'The Ming army breaks and runs back up the passes!';
  if (M.wave === 10 && M.general && M.general.hp > 0 && !M.routed) return 'Liễu Thăng rides in the Chi Lăng pass. Kill the general!';
  if (M.active) {
    const left = M.cols.reduce((a, c) => a + (c.done ? 0 : c.left), 0);
    const raided = G.units.some(u => u.team === 1 && u.hp > 0 && u.y > 27);
    if (raided && !G.units.some(u => u.team === 0 && u.kind === 'danbinh')) return 'The Ming are in the valley! Select a Đình and sound the drum to arm villagers.';
    return 'Wave ' + M.cols.filter(c => !c.done).map(c => c.wave + 1).join(', ') + ': ' + left + ' Ming left. Break them!';
  }
  if (M.t < 40) return 'Build up: more villagers and a second Đình for room to grow. The first Ming column comes in ' + fmtTime(M.next - M.t) + '.';
  if (idle > 2) return idle + ' villagers are idle. Tap the idle button to put them to work.';
  if (M.wave === 0 && M.t < 120) return 'Hide soldiers in the woods at a pass mouth: stand still among the trees to vanish.';
  if (M.wave < WAVES.length) return 'Next: ' + wavePreview(M.wave) + ' via the ' + WAVES[M.wave].cols.map(c => PASSES[c.from].name).filter((v, k, a) => a.indexOf(v) === k).join(' and ') + '.';
  return 'Hold the valley.';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'fallen';
  const tc = G.buildings.find(b => b.team === 0 && b.kind === 'towncentre');
  const hero = (k, u) => M.heroBack[k] ? 'carried off, back in ' + Math.ceil(M.heroBack[k] - M.t) + 's' : pct(u);
  const items = [
    { t: 'Hold through ten Ming waves (' + M.broken + '/10 broken)', ok: M.broken >= 10 || M.routed, how: 'Hide troops in the forests by the passes and strike from cover. Arm villagers with the Đình drum when a wave is big.' },
    { t: 'Keep the Citadel standing (' + pct(tc) + ')', ok: false, how: 'Send villagers to repair it, and build bamboo hedges across the road in.' }
  ];
  if (M.wave >= 10) items.push({ t: 'Kill Liễu Thăng at Chi Lăng' + (M.general && M.general.hp > 0 ? ' (' + pct(M.general) + ')' : ''), ok: !!M.generalDead, how: 'Thương Thủ spears beat the general and his cavalry.' });
  items.push({ t: 'Lê Lợi: ' + hero('leloi', M.leloi) + ' · Nguyễn Trãi: ' + hero('nguyentrai', M.trai), opt: true });
  if (M.wave < WAVES.length && !M.active) items.push({ t: 'Wave ' + (M.wave + 1) + ' in ' + fmtTime(M.next - M.t) + ': ' + wavePreview(M.wave), tip: true });
  items.push({ t: M.t < 200 ? 'Dân Binh: select a Đình and sound the drum, or select villagers and tap Arm.' : M.t < 420 ? 'Units standing still in a forest are hidden and strike 50% harder from cover.' : 'Hỏa Đồng hit harder when they have stood still a moment. Keep them behind spears.', tip: true });
  return { title: 'The Lam Sơn Stand', items };
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
    if (M.routed) clock = 'Victory at Chi Lăng';
    else if (M.active) clock = 'Wave ' + Math.min(10, M.wave) + '/10 attacking';
    else if (M.wave < WAVES.length) clock = 'Wave ' + (M.wave + 1) + '/10 in ' + fmtTime(M.next - M.t);
    else clock = 'Wave 10/10';
  }
  $('clock').textContent = clock;
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); const fx = sfxForMsg(m.text); if (fx) SFX.play(fx); }
  sfxTick();
  if (sel.length && (sel[0].kind === 'danbinh' || sel[0].kind === 'dinh')) panelKey = '';
  if (M && M.cardQ.length && !G.over && !storyOpen) {
    const c = M.cardQ.shift();
    if (c === 'rout') vignette('rout', 'Liễu Thăng falls in the pass of Chi Lăng. His army breaks and runs for home.');
    else showStory(c);
  }
  if (M && M.broken > (M.vigBroken || 0)) { M.vigBroken = M.broken; if (M.broken === 1) vignette('totdong', 'The first column is broken. Spoils from the Ming baggage are carried to the villages.'); }
}

/* ---------- game flow ---------- */
function loadMap(g) {
  G = g; terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  sel = []; mode = null; markers = []; boxRect = null; panelKey = ''; ended = false; acc = 0; seenMsgs = new WeakSet(); idleIdx = 0; objStarted = false;
  view.zoom = view.w > 700 ? 1.4 : 1; resize();
}
function startGame(seed) {
  seedUsed = seed; storyOpen = null;
  loadMap(new Game({ seed, diff }));
  centerOn(29, 29);
  select([G.M.leloi]);
  started = true; paused = false; $('hud').hidden = false; showOv(null); updateHud(); updatePanel();
  showStory('opening');
}
// practice: start at a later wave with the army and buildings a player would have by then
function skipToWave(n) {
  startGame(seedUsed);
  storyOpen = null; showOv(null); paused = false;
  const M = G.M; if (n <= 1) return;
  M.wave = n - 1; M.broken = n - 1; M.warned = n - 2; M.next = M.t + 30;
  const tc = G.buildings.find(b => b.kind === 'towncentre'), extra = n >= 9 ? 2 : 1;
  G.res[0] = { food: 900 * extra, wood: 900 * extra, gold: 700 * extra };
  for (const [x, y] of [[33, 37], [24, 36], [36, 34]]) if (G.canPlace('dinh', x, y, 0)) { G.addBuilding('dinh', 0, x, y, true); break; }
  const put = (k, x, y) => { const p = G.openSpot(x, y, 0); return G.addUnit(k, 0, p.x, p.y); };
  const army = n >= 9 ? { dao: 6, thuong: 8, hoadong: 8, thaythuoc: 2, daibac: 2 } : { dao: 3, thuong: 4, hoadong: 4, thaythuoc: 1, daibac: 1 };
  let i = 0; for (const k in army) for (let j = 0; j < army[k]; j++, i++) put(k, 27 + (i % 10) * 1.1, 26 - Math.floor(i / 10));
  for (let j = 0; j < 6 * extra; j++) put('villager', tc.x - 2 + (j % 5), tc.y + 3);
  if (G.canPlace('tower', 30, 24, 0)) G.addBuilding('tower', 0, 30, 24, true);
  G.msg('Practice: starting at wave ' + n + '.');
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
  $('end-tag').textContent = win ? 'Demo complete' : 'The valley is lost';
  $('end-title').textContent = win ? 'Victory at Chi Lăng' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  $('end-sub').textContent = win ? 'The hills held. Within a year Đại Việt was free, and Lê Lợi was king.'
    : 'The Citadel has fallen. Lê Lợi\'s men scatter into the hills of Lam Sơn, to fight again another year.';
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + M.broken + '/10</b><span>Waves broken</span></div>' +
    '<div><b>' + G.stats.kills + '</b><span>Ming defeated</span></div><div><b>' + M.ambushes + '</b><span>Ambush strikes</span></div>' +
    '<div><b>' + M.militia + '</b><span>Militia raised</span></div><div><b>' + M.surrendered + '</b><span>Talked into surrender</span></div>';
  if (!win) { const art = document.createElement('div'); try { art.appendChild(drawScene('fall')); } catch (e) { /* no art */ } art.className = 'end-art'; const old = $('ov-end').querySelector('.end-art'); if (old) old.remove(); $('end-title').after(art); }
  else { const old = $('ov-end').querySelector('.end-art'); if (old) old.remove(); }
  SFX.play(win ? 'victory' : 'defeat');
  showOv('end');
}

function dvBoot() {
  setupObj(); setupSound(); setupFullscreen();
  // folding or unfolding a Fold swaps the screen: lay the game out again once it settles
  const relayout = () => setTimeout(() => { resize(); if (G && G.M) updateHud(); }, 250);
  window.addEventListener('orientationchange', relayout);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
  const set = (id, name) => { const e = $(id); if (e) e.src = resIcon(name); };
  set('i-food', 'food'); set('i-wood', 'wood'); set('i-gold', 'gold'); set('i-pop', 'pop'); set('i-idle', 'idle'); set('i-army', 'army');
  set('i-zin', 'plus'); set('i-zout', 'minus'); set('i-menu', 'menu');
  $('hud').hidden = true; resize(); showOv('start');
  // a quiet view of the valley behind the title screen
  G = new Game({ seed: seedUsed, diff }); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  view.zoom = view.w > 700 ? 1.4 : 1; centerOn(29, 27);
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
  const h = (location.hash || '').slice(1), m = /^wave(\d+)$/.exec(h);
  if (m) skipToWave(Math.max(1, Math.min(10, +m[1])));
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
  // on a phone, Begin also asks for full screen (quietly: if the viewer says no, the game just starts)
  const begin = document.querySelector('#ov-start [data-do="start"]');
  if (begin) begin.addEventListener('click', () => { if (!fsEl() && matchMedia('(pointer: coarse)').matches) fsToggle(true); }, true);
}
