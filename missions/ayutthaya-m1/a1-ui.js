/* ===== a1-ui.js ===== */
const TIPS = [
  'The chronicles say U Thong left his old town when a plague broke out there, and founded Ayutthaya on an island in the Chao Phraya in 1351.',
  'Ayutthaya is named after Ayodhya, the city of Rama in the Ramayana. Its full name begins Krung Thep Dvaravati Si Ayutthaya.',
  'Three rivers meet at Ayutthaya: the Chao Phraya, the Lopburi and the Pa Sak. A canal cut later made the city a true island.',
  'U Thong was crowned Ramathibodi I. He is remembered for laws, some of which were still in use in the 1800s.',
  'Lavo, today Lopburi, had long been a Khmer centre. Suphanburi was the seat of a powerful family. Ayutthaya joined their two houses.',
  'In the rainy season the plains round Ayutthaya flooded. The city lived on the water: raft houses, boats and markets afloat.',
  'Ayutthaya was ruled from its island for 417 years, until 1767.',
  'Elephants were caught in the wild and trained in kraals. The war elephant, chang suek, carried a lord, a driver and a guard.'
];
let storyOpen = null;

/* ---------- panel additions ---------- */
function ageLabel() { const a = G && G.age ? G.age[0] : 1; return AGES[a].name + ' · ' + AGES[a].local; }
function mrPanelKey() {
  const M = G.M; if (!M) return '';
  return (G.age ? G.age[0] : 1) + '|' + (M.settled ? 'S' : '') + '|' + (M.aging ? 'A' + Math.floor(M.aging.left / 3) : '') + '|' + M.phase + '|' + Object.values(M.towns).map(t => t.st + t.n).join(',');
}
function costBtn(act, icon, label, cost, title, on, no, extra) {
  return '<button class="cmd' + (on ? ' on' : '') + (no ? ' no' : '') + '" data-a="' + act + '"' + (extra || '') + ' title="' + title + '"><img alt="" src="' + icon + '"><span class="nm">' + label + '</span><span class="ct">' + (cost ? costHTML(cost) : '&nbsp;') + '</span></button>';
}
function mrUnitCmds(us) {
  // a barge near the families: take the nearest people aboard in one tap
  if (us.length === 1 && us[0].kind === 'barge') return cmdBtn('loadup', 'loadup', unitIcon('villager', 0), 'Load', null, 'Take the nearest people aboard (up to ' + UD.barge.troops + ')');
  return '';
}
function mrBldCmds(b) {
  const M = G.M; if (!M || b.hp <= 0) return '';
  if (b.kind === 'hall' && b.town) {
    const T0 = M.towns[b.town]; if (!T0 || T0.st === 'joined' || T0.st === 'force' || M.phase < 3) return '';
    let h = '';
    if (b.town === 'lavo') h += costBtn('town', resIcon('gold'), 'Gift boat', { gold: 100 }, 'Send a gift boat up the Lopburi river (' + T0.n + ' of 3 delivered)', false, !G.canAfford(0, { gold: 100 }) || G.units.some(u => u.kind === 'goldboat' && u.hp > 0), ' data-v="lavo" data-h="trade"');
    else h += costBtn('town', unitIcon('bride', 0), 'Wedding', { food: 100, gold: 60 }, 'Send the wedding procession to Suphanburi', false, T0.st === 'wed' || !G.canAfford(0, { food: 100, gold: 60 }), ' data-v="suphan" data-h="wed"');
    h += costBtn('town', resIcon('amove'), 'By force', null, 'Take ' + TOWNS[b.town].name + ' by force: faster, but fewer troops join and its people work slowly', false, false, ' data-v="' + b.town + '" data-h="force"');
    return h;
  }
  if (b.team !== 0 || !b.done) return '';
  if (b.kind === 'towncentre') {
    if (M.aging) {
      const A = AGES[M.aging.to], p = Math.floor((1 - M.aging.left / M.aging.tot) * 100);
      return costBtn('agecancel', resIcon('flag'), A.local + ' ' + p + '%', null, 'Advancing to the ' + A.name + ' (' + Math.ceil(M.aging.left) + 's). Tap to call it off and get the cost back.', true);
    }
    const n = G.age[0] + 1, A = AGES[n];
    if (!A) return '';
    return costBtn('ageup', resIcon('flag'), 'Age: ' + A.local, A.cost, 'Advance to the ' + A.name + ' (' + A.local + '), ' + A.time + 's. Needs ' + A.need.text + '.', false, !G.ageNeedMet(0, n) || !G.canAfford(0, A.cost));
  }
  return '';
}
let forceAsk = null;
function mrPanelAction(a, el) {
  if (a === 'ageup') { const e = G.startAge(0); toast(e || 'The court sets to work. The Sala Klang keeps training villagers.'); panelKey = ''; return true; }
  if (a === 'agecancel') { G.cancelAge(); panelKey = ''; return true; }
  if (a === 'town') {
    const id = el.dataset.v, how = el.dataset.h;
    if (how === 'force' && forceAsk !== id) { forceAsk = id; toast('Tap By force again to take ' + TOWNS[id].name + ' by the sword. Its people will work slowly afterwards.'); return true; }
    forceAsk = null;
    const e = G.townAct(id, how); if (e) toast(e); panelKey = ''; return true;
  }
  if (a === 'loadup') {
    const s = selUnits()[0]; if (!s) return true;
    const room = UD[s.kind].troops - (s.cargo ? s.cargo.length : 0);
    const near = G.units.filter(u => u.team === 0 && u.hp > 0 && u.layer === 0 && !UD[u.kind].vip && u.order.t !== 'board' && Math.hypot(u.x - s.x, u.y - s.y) < 9)
      .sort((p, q) => (p.cls === 'vil' ? 0 : 1) - (q.cls === 'vil' ? 0 : 1) || Math.hypot(p.x - s.x, p.y - s.y) - Math.hypot(q.x - s.x, q.y - s.y)).slice(0, room);
    if (!near.length) { toast(room ? 'No one is close enough. Bring the barge to the bank where your people wait.' : 'The barge is full. Tap the island\'s shore to land them.'); return true; }
    G.command(near.map(u => u.id), s.x, s.y, s);
    toast(near.length + ' going aboard. Then tap the island\'s shore to land them.');
    return true;
  }
  return false;
}
function describeOrder(u) {
  const o = u.order;
  if (o.t === 'rland') return o.s === 'in' ? 'Rowing for the shore' : 'Rowing away';
  if (o.t === 'flee2') return 'Fleeing';
  if (u.kind === 'goldboat') return 'Sailing for Lavo';
  if (u.kind === 'bride') return o.t === 'move' ? 'Walking to Suphanburi' : 'Waiting';
  return baseDescribeOrder(u);
}
function bldNote(b) {
  const M = G.M;
  if (b.kind === 'hall' && b.town && M) {
    const T0 = M.towns[b.town], nm = TOWNS[b.town].name;
    if (T0.st === 'joined') return nm + ' stands with Ayutthaya.';
    if (T0.st === 'force') return 'Break the town hall to take ' + nm + '.';
    if (M.phase < 3) return nm + ': found your city first, then win it over.';
    if (b.town === 'lavo') return T0.st === 'trade' ? 'Gift boats delivered: ' + T0.n + ' of 3. Guard them on the river.' : 'Lavo trades by river. Three gift boats will win it, or take it by force.';
    return T0.st === 'wed' ? 'The procession is on the road. Guard the bride.' : 'A marriage will join Suphanburi to you, or take it by force.';
  }
  if (b.old) return 'The old town. The sickness has emptied it.';
  if (b.camp) return 'The rival lord\'s stockade. Burn it to thin his raids.';
  if (b.kind === 'towncentre' && b.team === 0) {
    const n = G.age[0] + 1;
    if (M && M.aging) return 'Advancing to the ' + AGES[M.aging.to].name + ': ' + Math.ceil(M.aging.left) + 's.';
    if (AGES[n]) return 'Next: ' + AGES[n].name + '. Needs ' + AGES[n].need.text + (G.ageNeedMet(0, n) ? ' (done).' : '.');
    return 'The Sala Klang of Ayutthaya. If it falls, all is lost.';
  }
  if (b.kind === 'palace' && b.team === 0) return M && M.kraals ? 'Trains Chang Suek. U Thong is crowned here.' : 'U Thong is crowned here. Win Lavo to train Chang Suek.';
  return baseBldNote(b);
}

/* ---------- story cards ---------- */
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>';
  const goal = (t) => '<p class="goal">' + t + '</p>', tip = (t) => '<p class="lead tipline">' + t + '</p>';
  if (id === 'opening') return {
    tag: 'Ayutthaya · Village Age · Ban · 1351', title: 'The Island City',
    body: [P('A sickness has come to U Thong\'s town on the upper river. The markets are empty and the smoke of the burning grounds hangs over the houses.'),
      P('U Thong has made up his mind. His people will go down the Chao Phraya by barge to the island where three rivers meet, and build a new city there.'),
      goal('Objective: ferry the families to the island. Select a barge and tap Load, then tap the island\'s shore to land them. Bandits watch the river.'),
      tip('Keep U Thong alive: if he falls, the mission is lost.')],
    btn: 'To the barges'
  };
  if (id === 'island') return {
    tag: 'Phase 2 · Founding the city', title: 'Where three rivers meet',
    body: [P('The barges ground on the island\'s mud. The water runs past on every side: the Chao Phraya, the Lopburi from the north-east, the Pa Sak from the east. A city here would be hard to reach by land and easy to reach by boat.'),
      goal('Objective: build the Sala Klang, then make two households: a raft house with a woman fishing from it, and a house beside a worked paddy field.'),
      tip('A house set down on the water floats as a raft house; on land it stays a house. Tap the raft house with a villager to send her fishing. Every household pays 15 food a minute.')],
    btn: 'Build'
  };
  if (id === 'houses') return {
    tag: 'Phase 3 · Two houses, one crown', title: 'Lavo and Suphanburi',
    body: [P('Bamboo bridges now cross to both banks. Up the Lopburi river lies Lavo, old and rich, which keeps the elephant kraals. Across the western fields lies Suphanburi, seat of a proud family.'),
      P('Neither will bow to a new city easily. Lavo trades by river; Suphanburi might be won by a marriage.'),
      goal('Objective: win over Lavo and Suphanburi, in either order. Select a town hall to choose how: by gifts, by marriage, or by force.'),
      tip(TIPS[4])],
    btn: 'Onward'
  };
  if (id === 'rains') return {
    tag: 'Phase 4 · The rains', title: 'The water rises',
    body: [P('The monsoon breaks over the plain. The rivers spill over their banks and the low fields go under water.'),
      goal('The paddy fields on the flood plain stop working until the water goes down, and men wading through it are slowed. Raft houses float and keep fishing.'),
      tip(TIPS[5])],
    btn: 'Weather it'
  };
  if (id === 'age2') return {
    tag: 'Kingdom Age · Mueang', title: 'A kingdom on the water',
    body: [P('Ayutthaya is no longer a camp of refugees. Its men take the royal purple, monks come to found a Wat, and towers rise over the bridges.'),
      goal('New: Wang (palace), Wat (Mo healers), Pom watchtowers, brick walls and gates, Ruea Rop war galleys. Soldiers +1 armour.')],
    btn: 'Onward'
  };
  if (id === 'lavo-join' || id === 'lavo-force') return {
    tag: 'Lavo', title: id === 'lavo-join' ? 'The kraals of Lavo' : 'Lavo is taken',
    body: [id === 'lavo-join' ? P('The gifts of cloth and silver have done their work. Lavo\'s lords will stand with Ayutthaya, and their elephant kraals are open to you.') : P('Lavo\'s hall is broken and its lords have fled. The elephant kraals are yours, but its people will remember.'),
      goal('Chang Suek, the war elephant, can be trained at the Wang.' + (id === 'lavo-join' ? ' One comes to you now.' : ' Your people work 10% slower.')),
      tip(TIPS[7])],
    btn: 'Onward'
  };
  if (id === 'suphan-join' || id === 'suphan-force') return {
    tag: 'Suphanburi', title: id === 'suphan-join' ? 'A wedding' : 'Suphanburi is taken',
    body: [id === 'suphan-join' ? P('The bride reaches Suphanburi to the sound of drums and pipes. The two houses are joined, and Suphanburi\'s archers and spearmen march to Ayutthaya.') : P('Suphanburi\'s hall burns. A few of its spearmen come over to you; the rest go home sullen.'),
      goal(id === 'suphan-join' ? '4 archers and 4 spearmen join you.' : '2 spearmen join you. Your people work 10% slower.')],
    btn: 'Onward'
  };
  if (id === 'crown') return {
    tag: 'Phase 5 · The coronation', title: 'Ramathibodi',
    body: [P('Lavo and Suphanburi stand with the new city. The Brahmins have chosen an auspicious day: U Thong will be crowned in his own palace.'),
      goal('Objective: reach the Kingdom Age, build the Wang (palace), then keep U Thong beside it for 90 seconds while he is crowned. The rival lord will try to stop it.'),
      tip(TIPS[3])],
    btn: 'Raise the Wang'
  };
  if (id === 'final') return {
    tag: 'Phase 5 · The rival lord', title: 'An elephant at the gate',
    body: [P('A lord of the south-east hills will not see a new king crowned on the river. He comes himself on his war elephant, under a red umbrella, with his whole army.'),
      goal('Objective: keep U Thong by the Wang until the coronation is done. Kill the rival lord and his army will run. If the Wang falls, all is lost.')],
    btn: 'Hold the Wang'
  };
  if (id === 'closing') return {
    tag: 'Ayutthaya, 1351', title: 'Two houses, one city',
    body: [P('U Thong is crowned King Ramathibodi I in his new city on the island. Lavo and Suphanburi kneel together before the throne.'),
      '<p class="quote">"Two houses, one city. For four hundred years, Ayutthaya would be ruled from this island."</p>',
      P('But Lavo and Suphanburi did not forget their rivalry. Within a generation their princes would fight over the throne.'),
      tip(TIPS[6])],
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
  if (typeof SFX !== 'undefined') SFX.play(id === 'closing' || id === 'crown' ? 'victory' : 'ui');
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
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  const hero = heroUnit(G);
  if (M.routed && M.phase === 5) return 'The rival lord\'s army runs. Keep U Thong by the Wang until he is crowned.';
  if (G.buildings.some(b => b.team === 0 && b.burn && b.hp > 0)) return 'A building is on fire! Send villagers to stand beside it and put it out.';
  if (M.phase === 1) {
    const s = selUnits();
    if (s.length === 1 && s[0].kind === 'barge') return s[0].cargo && s[0].cargo.length ? 'Tap the island\'s shore (the gold arrow) to land them.' : 'Tap Load to take the nearest people aboard.';
    return 'Ferry the families to the island: ' + M.landed + ' of ' + M.need + ' there. Select a barge on the river.';
  }
  if (M.phase === 2) {
    const tc = G.byId.get(M.tc);
    if (tc && !tc.done) return 'Villagers on the island: build the Sala Klang (' + Math.floor(tc.progress * 100) + '%).';
    if (!M.hhFish) return 'Build a house out on the water: it floats as a raft house. Then send a villager to fish from it.';
    if (!M.hhPaddy) return 'Build a Na (paddy field) beside a house and put a villager to work in it.';
  }
  if (M.active) { const left = M.cols.reduce((a, c) => a + (c.done ? 0 : c.left), 0); return 'Raiders: ' + left + ' left. Break them!'; }
  if (M.phase === 3 || M.phase === 4) {
    const open = Object.keys(M.towns).filter(k => M.towns[k].st !== 'joined');
    if (M.towns.suphan.st === 'wed') return 'Guard the bride on the road to Suphanburi.';
    if (G.units.some(u => u.kind === 'goldboat' && u.hp > 0)) return 'A gift boat is on the Lopburi river. Guard it from bandit boats.';
    return 'Win over ' + open.map(k => TOWNS[k].name).join(' and ') + ': select a town hall (gold arrow).';
  }
  if (M.phase === 5) {
    if (G.age[0] < 2) return M.aging ? 'The court works toward the Kingdom Age: ' + Math.ceil(M.aging.left) + 's.' : 'Advance to the Kingdom Age at the Sala Klang. It needs ' + AGES[2].need.text + '.';
    const pal = G.buildings.find(b => b.team === 0 && b.kind === 'palace' && b.hp > 0);
    if (!pal) return 'Build the Wang (palace) for the coronation.';
    if (!pal.done) return 'The Wang is being built: ' + Math.floor(pal.progress * 100) + '%.';
    if (hero && Math.hypot(hero.x - pal.x, hero.y - pal.y) >= pal.size / 2 + 5) return 'Bring U Thong to the Wang to be crowned!';
    return 'The coronation: ' + Math.floor(M.crown) + ' of ' + CROWN + ' s. Hold the Wang!';
  }
  const idle = idleVillagers().length;
  if (idle > 2) return idle + ' villagers are idle. Tap the idle button to put them to work.';
  return '';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'fallen';
  const items = [], hero = heroUnit(G);
  items.push({ t: 'Ferry the families to the island' + (M.phase === 1 ? ' (' + M.landed + ' of ' + M.need + ')' : ''), ok: M.phase > 1,
    how: 'Select a barge and tap Load to take people aboard, then tap the island shore (gold arrow) to land them.' });
  if (M.phase >= 2) {
    const tc = G.byId.get(M.tc);
    items.push({ t: 'Build the Sala Klang' + (tc && !tc.done ? ' (' + Math.floor(tc.progress * 100) + '%)' : ''), ok: !!(tc && tc.done), how: 'Select villagers on the island and tap the building site to help build it.' });
    items.push({ t: 'A fishing household (raft house)', ok: M.hhFish, how: 'Place a Ruean (House) on the water (by a shore, a khlong or a pond): it floats as a raft house. Then tap it with a villager to fish.' });
    items.push({ t: 'A paddy household (house by a worked field)', ok: M.hhPaddy, how: 'Build a Na (Field) right next to a house, then put a villager to work in it.' });
  }
  if (M.phase >= 3) {
    for (const id in M.towns) {
      const T0 = M.towns[id], st = T0.st === 'joined' ? (T0.how === 'force' ? 'taken' : 'joined') : T0.st === 'trade' ? T0.n + ' of 3 gift boats' : T0.st === 'wed' ? 'procession on the road' : T0.st === 'force' ? 'break the hall' : 'select its hall';
      const how = T0.st === 'trade' ? 'Send more gift boats from the hall, and guard them from bandit boats on the river.' : T0.st === 'wed' ? 'Guard the bride on the road with soldiers until she reaches Suphanburi.' : T0.st === 'force' ? 'Send soldiers to break the town hall.'
        : 'Tap the town hall (gold arrow), then choose ' + (id === 'lavo' ? 'Gift boat (3 boats, 100 gold each)' : 'Wedding (100 food, 60 gold)') + ' or By force.';
      items.push({ t: 'Win over ' + TOWNS[id].name + ' (' + st + ')', ok: T0.st === 'joined', how });
    }
    if (M.rainOn) items.push({ t: 'The rains: ' + fmtTime(M.rainEnd - M.t) + ' left', tip: true });
    else if (!M.rainDone && M.rainAt) items.push({ t: 'The rains come in ' + fmtTime(Math.max(0, M.rainAt - M.t)), tip: true });
  }
  if (M.phase >= 5) {
    items.push({ t: 'Reach the Kingdom Age (Mueang)' + (M.aging ? ': ' + Math.floor((1 - M.aging.left / M.aging.tot) * 100) + '%' : ''), ok: G.age[0] >= 2, how: 'Select the Sala Klang and tap Age. It needs ' + AGES[2].need.text + '.' });
    items.push({ t: 'Build the Wang', ok: !!M.palace, how: 'Select villagers and build the Wang (Palace) from their build buttons.' });
    items.push({ t: 'Crown U Thong at the Wang (' + Math.floor(M.crown) + ' of ' + CROWN + ' s)', ok: M.crown >= CROWN, how: 'Move U Thong next to the Wang and keep him there. Hold off the raiders until the time fills.' });
    if (M.finalOn && M.cmdr && M.cmdr.hp > 0) items.push({ t: 'The rival lord: ' + pct(M.cmdr), opt: true });
  }
  if (M.camp && M.phase >= 3) items.push({ t: 'Optional: burn the rival lord\'s stockade (south-east hills)', ok: !!M.campDown, opt: !M.campDown, how: 'Send an army to the south-east hills and burn the stockade. His raids get smaller after that.' });
  items.push({ t: 'Keep U Thong alive (' + pct(hero) + ')', ok: false });
  return { title: 'The Island City · ' + AGES[G.age[0]].local, items };
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
  sfxTick();
  const r = G.res[0], M = G.M;
  if (G.terrainDirty) { G.terrainDirty = false; terrainC = buildTerrain(G); miniBase = buildMiniBase(G); }
  $('v-food').textContent = Math.floor(r.food); $('v-wood').textContent = Math.floor(r.wood); $('v-gold').textContent = Math.floor(r.gold);
  const gn = { food: 0, wood: 0, gold: 0 };
  for (const u of G.units) if (u.team === 0 && u.hp > 0 && u.order.t === 'gather' && gn[u.order.type] != null) gn[u.order.type]++;
  for (const k in gn) { const e = $('g-' + k), t = '(' + gn[k] + ')'; if (e.textContent !== t) e.textContent = t; e.classList.toggle('zero', gn[k] === 0); }
  const pop = G.popOf(0), cap = G.popCap(0); $('v-pop').textContent = pop + '/' + cap;
  $('pop-chip').classList.toggle('warn', pop >= cap && M && M.phase >= 2);
  $('hint').textContent = hintText(); updateObj();
  let clock = fmtTime(G.t);
  if (M) {
    if (M.phase === 5 && M.palace) clock = 'Coronation ' + Math.floor(M.crown) + '/' + CROWN + 's';
    else if (M.rainOn) clock = 'Rains ' + fmtTime(M.rainEnd - M.t);
    else if (M.active) clock = 'Raid!';
    else if (M.phase >= 2 && M.next < 1e8) clock = 'Raid in ' + fmtTime(Math.max(0, M.next - M.t));
  }
  $('clock').textContent = clock;
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); }
  if (sel.length === 1 && M) { const k = mrPanelKey(); if (k !== lastMKey) { lastMKey = k; panelKey = ''; } }
  if (M && M.cardQ.length && !G.over && !storyOpen) {
    const c = M.cardQ.shift();
    if (c === 'rout') vignette('rout', 'The rival lord falls from his elephant. His army breaks and runs for the hills.');
    else if (c === 'v-bride') vignette('bride', 'The bride has been killed on the road. You may send another procession.');
    else showStory(c);
  }
}
let lastMKey = '';

/* ---------- game flow ---------- */
function startGame(seed) {
  seedUsed = seed; storyOpen = null;
  G = new Game({ seed, diff, map: 'river', civs: [AYU_CIV, AYU_CIV] });
  enterGame(); showMenu(null);
  objStarted = false; lastMKey = '';
  for (const k in RC) delete RC[k];
  view.zoom = view.w > 700 ? 1.0 : 0.8; resize();
  const h = heroUnit(G); centerOn(h.x + 3, h.y + 2);
  const barge = G.units.find(u => u.kind === 'barge'); if (barge) select([barge]);
  updateHud(); updatePanel();
  showStory('opening');
}
// practice: jump to a later phase with what a player would have by then
function skipTo(which) {
  startGame(seedUsed);
  storyOpen = null; showOv(null); paused = false;
  const M = G.M;
  for (const u of G.units) if (u.team === 0 && u.layer === 0) { const p = G.openSpot(ISLE.x - 3 + Math.random() * 6, ISLE.y + 1 + Math.random() * 2, 0); u.x = p.x; u.y = p.y; u.order = { t: 'idle', hx: u.x, hy: u.y }; u.path = null; }
  for (const u of G.units) if (u.team === 1 && u.guard && !u.guard.camp) u.hp = 0;
  setPhase(G, 2); M.cardQ.length = 0;
  const tc = G.byId.get(M.tc); G.finishBuilding(tc);
  const spot = (kind, dx, dy, team) => { for (let r = 0; r < 7; r++) for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (G.canPlace(kind, tc.tx + dx + xx, tc.ty + dy + yy, 2)) return G.addBuilding(kind, team || 0, tc.tx + dx + xx, tc.ty + dy + yy, true); return null; };
  spot('farm', -5, 2); spot('barracks', 3, -3);
  for (let i = 0; i < (which === 'crown' ? 9 : 7); i++) spot('house', [-5, 4, -2, 2][i % 4], [0, 0, -4, 4][i % 4]);
  M.hhFish = M.hhPaddy = true; setPhase(G, 3); M.cardQ.length = 0;
  G.res[0] = { food: 700, wood: 700, gold: 400 };
  const put = (k, n) => { for (let i = 0; i < n; i++) { const p = G.openSpot(tc.x + 3 + (i % 5), tc.y + 3 + Math.floor(i / 5), 0); G.addUnit(k, 0, p.x, p.y); } };
  put('keris', 4); put('tombak', 4); put('archer', 4); put('villager', 4);
  if (which === 'crown') {
    G.joinTown('lavo', 'trade'); G.joinTown('suphan', 'wed'); M.cardQ.length = 0;
    G.applyAge(0, 2); M.cardQ.length = 0; M.rainDone = true;
    spot('store', -1, 4); G.res[0] = { food: 800, wood: 900, gold: 500 };
    setPhase(G, 5); M.cardQ.length = 0;
  }
  for (const u of G.units) if (u.kind === 'barge' && u.hp > 0) { const w = G.nearestFree(ISLE.x - 21, ISLE.y + (u.id % 2 ? 2 : -2), 1, 6); if (w) { u.x = w.x + 0.5; u.y = w.y + 0.5; u.order = { t: 'idle' }; u.path = null; } }
  select([]); centerOn(ISLE.x, ISLE.y);
  G.msg('Practice: starting at ' + (which === 'crown' ? 'the coronation.' : 'the two towns.'));
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
  $('end-tag').textContent = win ? 'Mission complete' : 'The mission is lost';
  $('end-title').textContent = win ? 'Ramathibodi I' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  const why = { hero: 'U Thong has fallen. Without him his people scatter along the river.', tc: 'The Sala Klang has fallen. The new city is abandoned before it is born.',
    palace: 'The Wang has fallen. U Thong will not be crowned this year.', people: 'The families are lost on the river.' };
  $('end-sub').textContent = win ? 'U Thong founded Ayutthaya on its island, joined Lavo and Suphanburi, and was crowned King Ramathibodi I.' : (why[M.why] || 'The new city has fallen.');
  const joined = Object.values(M.towns).filter(t => t.st === 'joined');
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + joined.filter(t => t.how !== 'force').length + ' of 2</b><span>Towns won peacefully</span></div>' +
    '<div><b>' + M.broken + '</b><span>Raids broken</span></div><div><b>' + G.stats.kills + '</b><span>Enemies defeated</span></div>' +
    '<div><b>' + G.stats.trained + '</b><span>Trained</span></div><div><b>' + M.spoils + '</b><span>Spoils (gold)</span></div>';
  const old = $('ov-end').querySelector('.end-art'); if (old) old.remove();
  if (!win) { const art = document.createElement('div'); try { art.appendChild(drawScene('fall')); } catch (e) { /* no art */ } art.className = 'end-art'; $('end-title').after(art); }
  showOv('end');
}
function mrBoot() {
  setupObj();
  const relayout = () => setTimeout(() => { resize(); if (G && G.M) updateHud(); }, 250);
  window.addEventListener('orientationchange', relayout);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
  const set = (id, name) => { const e = $(id); if (e) e.src = resIcon(name); };
  set('i-food', 'food'); set('i-wood', 'wood'); set('i-gold', 'gold'); set('i-pop', 'pop'); set('i-idle', 'idle'); set('i-army', 'army');
  set('i-zin', 'plus'); set('i-zout', 'minus'); set('i-menu', 'menu');
  $('hud').hidden = true; showMenu(null); resize(); showOv('start');
  G = new Game({ seed: seedUsed, diff, map: 'river', civs: [AYU_CIV, AYU_CIV] }); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  for (let i = 0; i < W * H; i++) G.explored[i] = 1;
  view.zoom = view.w > 700 ? 0.9 : 0.7; centerOn(ISLE.x, ISLE.y);
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
  const h = (location.hash || '').slice(1);
  if (h === 'towns' || h === 'crown') skipTo(h);
}
// what the mission's own people and boats are for, beside their names in the panel
Object.assign(BRIEF, { uthong: 'Your hero. If he falls, the mission is lost', barge: 'Carries your people and goods on the river', goldboat: 'Carries the gifts to Lavo', bride: 'The bride, on her way to Suphanburi' });
