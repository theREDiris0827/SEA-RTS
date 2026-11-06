/* ===== mj-ui.js ===== */
Object.assign(TRAIN_SHORT, { villager: 'Kawula', keris: 'Golok', tombak: 'Galah', archer: 'Panah', obor: 'Obor', boat: 'Jukung', light: 'Jukung P.' });
Object.assign(BUILD_SHORT, { house: 'Omah', granary: 'Lumbung', port: 'Dermaga', barracks: 'Asrama', patirthan: 'Patirthan', tower: 'Kulkul', wall: 'Pagar' });
const TIPS = [
  'The Sejarah Melayu says Sang Rajuna Tapa, Singapura\'s treasurer, opened the gates after the king had his daughter shamed and put to death on a false charge.',
  'Majapahit\'s jong were huge ships of several masts and layered hulls. A Portuguese writer a century later said the largest carried a thousand men.',
  'Gajah Mada\'s Sumpah Palapa: he swore to taste no spice until the islands of the archipelago were united. Temasek is named among them.',
  'The Nagarakretagama, a Majapahit court poem of 1365, lists Tumasik (Singapura) among the lands that owed tribute to Majapahit.',
  'The Orang Laut, the sea people of the Riau islands, crewed the boats and kept the sea lanes of the Malay kings for centuries.',
  'Archaeologists have found the line of Singapura\'s 14th-century earth rampart, and gold ornaments in the Javanese style on Fort Canning Hill, once Bukit Larangan, the Forbidden Hill.',
  'Ayutthaya also claimed the Malay ports. A Portuguese account says Singapura was attacked by Siam around this time too.',
  'Majapahit\'s banner was red over white. Indonesia\'s flag today is the same two colours.',
  'Neither side is the villain here. Singapura was a young port defending its home; Majapahit was an old empire holding its sea lanes.',
  'After the fall, Parameswara, Singapura\'s last king, fled up the coast. A few years later he founded Melaka.'
];
let storyOpen = null;

/* ---------- panel additions (the patched panel calls these) ---------- */
function mjHome() { const f = G && G.M && G.M.flag; return f && f.hp > 0 ? f : null; }
function mjPanelKey(us) {
  const M = G.M; if (!M) return '';
  return M.phase + '|' + M.ol + '|' + M.crippled + '|' + (M.msgr ? 1 : 0) + '|' + us.map(u => u.cargo ? u.cargo.length : '').join('');
}
function launchIcon(key) {
  const L = LAUNCH[key], k = Object.keys(L.cargo);
  return key === 'workers' || key === 'swords' || key === 'spears' || key === 'archers' || key === 'messenger' ? unitIcon(k[0], 0) : unitIcon(L.boat, 0);
}
function mjUnitCmds(us) {
  const M = G.M; if (!M) return '';
  let cmds = '';
  if (us.length === 1 && us[0] === M.flag) {
    for (const key in LAUNCH) {
      if (key === 'messenger' && M.phase !== 2) continue;
      const L = LAUNCH[key], cost = Object.keys(L.cost).length ? L.cost : null;
      cmds += '<button class="cmd" data-a="launch" data-k="' + key + '" id="lb-' + key + '" title="' + L.tip + (cost ? ' (' + costTitle(cost) + ')' : '') + '"><img alt="" src="' + launchIcon(key) + '"><span class="nm">' + L.label + '</span><span class="ct" id="lc-' + key + '">' + (cost ? costHTML(cost) : 'free') + '</span></button>';
      pdyn.push(() => {
        const b = $('lb-' + key), c = $('lc-' + key); if (!b || !c) return;
        const cd = M.cd[L.grp], why = G.canLaunch(key);
        b.classList.toggle('cool', !!why);
        const t = cd > 0 ? 'ready ' + Math.ceil(cd) + 's' : null;
        if (t) { if (c.dataset.cd !== t) { c.dataset.cd = t; c.textContent = t; } }
        else if (c.dataset.cd) { c.dataset.cd = ''; c.innerHTML = cost ? costHTML(cost) : 'free'; }
      });
    }
  }
  if (us.some(u => u.layer === 1 && u.cargo && u.cargo.length)) cmds += '<button class="cmd" data-a="unload" title="Put the troops ashore here (the boat must be beside a beach)"><img alt="" src="' + resIcon('check') + '"><span class="nm">Land</span><span class="ct">&nbsp;</span></button>';
  return cmds;
}
function mjBldCmds(b) {
  const M = G.M;
  if (M && b.kind === 'village' && b.ol && M.ol === 'neutral' && b.hp > 0)
    return '<button class="cmd" data-a="gift" title="Gifts for the Batin (150 food, 100 wood): the Orang Laut join you"><img alt="" src="' + resIcon('food') + '"><span class="nm">Gift</span><span class="ct">' + costHTML(GIFT) + '</span></button>';
  return '';
}
function mjPanelAction(a, el) {
  if (a === 'launch') {
    const r = G.launch(el.dataset.k);
    if (typeof r === 'string') { toast(r); return true; }
    select([r.boat]);
    const L = LAUNCH[el.dataset.k];
    toast(el.dataset.k === 'fire' ? 'A fire ship is in the water. Sail it into Singapura\'s boats or the harbour.' : el.dataset.k === 'messenger' ? 'The messenger\'s boat is ready. Tap the beach below the south gate to land him.' : L.label + ' launched. Tap the shore where they should land.');
    return true;
  }
  if (a === 'unload') {
    let n = 0;
    for (const u of selUnits()) if (u.layer === 1 && u.cargo && u.cargo.length) n += G.unloadBoat(u, null);
    if (!n) toast('Too far from a beach. Tap the shore where they should land.');
    panelKey = ''; return true;
  }
  if (a === 'gift') { const err = G.giftOL(); if (err) toast(err); else vignette('gift', 'The Batin of the Orang Laut accepts rice and timber. His pilots will guide your galleys.'); panelKey = ''; return true; }
  return false;
}
function describeOrder(u) {
  const o = u.order;
  if (o.t === 'repair') return 'Repairing';
  if (o.t === 'board') return 'Going aboard';
  if (o.t === 'beach') return 'Sailing to the beach';
  if (o.t === 'talk') return u.working ? 'Talking with the treasurer' : 'Going to the treasurer';
  if (o.t === 'land') return 'Landing troops';
  if (o.t === 'refuge') return 'Fleeing into the city';
  return baseDescribeOrder(u);
}
function bldNote(b) {
  const M = G.M, own = b.team === 0;
  if (b.kind === 'village') return !M ? '' : M.ol === 'neutral' ? 'The Orang Laut, sworn to Singapura\'s kings. Give gifts, or drive off a raid on them, and they join you. Do not strike them.' : M.ol === 'ally' ? 'The Orang Laut sail with you: +20% wood at every drop, and the Kelulus galleys can launch.' : 'The Orang Laut fight for Singapura now.';
  if (b.kind === 'bendahari') return 'The house of Sang Rajuna Tapa, the king\'s treasurer. Send the messenger here. Not to be touched.';
  if (b.kind === 'cwall') return 'An earth rampart topped with stakes. Too thick to break: go through a gate.';
  if (b.kind === 'gate') return b.open ? 'Open.' : 'Timber doors in the rampart. Torches and fire arrows burn them slowly; the treasurer can open the south one.';
  if (b.kind === 'palace' && !own) return 'Bukit Larangan, the Forbidden Hill. Clear its guard and hold the hill to raise the banner.';
  if (b.kind === 'port' && !own) return 'Singapura\'s harbour. Burn it and its war boats have nowhere to come home to.';
  if (b.outer) return 'Timber and thatch outside the walls: your soldiers\' torches and fire arrows burn it fast. Food and gold for the fleet.';
  if (b.kind === 'granary' && own) return 'The Lumbung: the fleet\'s supply hut on Batam. Kawula drop food, wood and gold here.';
  if (b.kind === 'port' && own) return 'A jetty: Jukung fishing boats unload fish here.';
  if (b.kind === 'wall' && own) return 'A stake fence. Cheap, and it burns.';
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
  toast(placed + ' section' + (placed > 1 ? 's' : '') + ' of stakes. Move on and tap ✓ for the next run, ✗ to stop.');
  panelKey = ''; return true;
}

/* ---------- story cards ---------- */
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>', M = G.M;
  if (id === 'opening') return {
    tag: 'Majapahit · The Strait · 1398', title: 'The Treasurer\'s Gate',
    body: [P('Singapura, the Lion City on its hill above the Strait, has grown rich on the trade between China and India. It no longer sends tribute to Majapahit, the great kingdom of Java.'),
      P('Now the Majapahit fleet rides off its shore: three hundred jong, the chronicles say, with the great Jong Raya at their head. But Singapura\'s earth walls are strong, and its sea people, the Orang Laut, know every reef.'),
      P('And Ayutthaya, to the north, wants the same port.'),
      '<p class="goal">Objective: land your Kawula on Batam island and build a Lumbung (supply hut). Win over the Orang Laut, and burn Singapura\'s harbour. Keep the Jong Raya afloat.</p>',
      '<p class="lead tipline">The Jong Raya is your base. Select it to launch boats of troops; select a boat and tap the shore to land them.</p>'],
    btn: 'To the Strait'
  };
  if (id === 'siege') return {
    tag: 'The siege · 1398', title: 'A Word at the South Gate',
    body: [P('A message has come to the fleet in secret. Sang Rajuna Tapa, the king\'s own treasurer, has a grievance against his king: his daughter was shamed and put to death on a false charge.'),
      P('Send a messenger dressed as a trader. The guards let traders in by the south gate. If he reaches the treasurer\'s house and they talk long enough, the gate may open from the inside.'),
      '<p class="goal">Objective: launch the Utusan from the Jong Raya, land him by the south gate and keep him alive while he talks. Or break a gate by force.</p>',
      '<p class="lead tipline">Keep your soldiers away from the messenger: a trader walking with an army is no trader.</p>'],
    btn: 'Send the messenger'
  };
  if (id === 'siam') return {
    tag: 'The north-west track', title: 'Ayutthaya Comes',
    body: [P('War elephants on the jungle track: the army of Ayutthaya has come south for Singapura too. Siamese war boats are out in the Strait.'),
      P('They are not your allies. If their men take the palace first, Singapura is theirs.'),
      '<p class="goal">Watch the Ayutthaya bar at the top. It fills faster once their soldiers are inside the walls. Take the city before it is full.</p>'],
    btn: 'Hurry'
  };
  if (id === 'olally') return {
    tag: 'Batam', title: 'The Sea People',
    body: [P('The Orang Laut\'s Batin has made his choice. His boats will sail with the fleet, and his pilots know every channel of the Strait.'),
      '<p class="goal">Kelulus galleys can now launch from the Jong Raya. Wood dropped at the Lumbung gives a fifth more.</p>',
      '<p class="lead tipline">' + TIPS[4] + '</p>'],
    btn: 'Onward'
  };
  if (id === 'olhostile') return {
    tag: 'Batam', title: 'An Old Oath',
    body: [P('You struck the Orang Laut. They are sworn to Singapura\'s kings, and now their fast boats hunt your fleet.'),
      '<p class="goal">The Kelulus galleys will not launch without their pilots. Guard your boats.</p>'],
    btn: 'Continue'
  };
  if (id === 'olburn') return {
    tag: 'Batam', title: 'Smoke over Batam',
    body: [P('The Orang Laut village burns. Its people take to their boats and are gone among the islands.'),
      P('The sea people will remember who was there when their homes burned.')],
    btn: 'Continue'
  };
  if (id === 'treasurer') return {
    tag: 'Singapura · night', title: 'The Gate Opens',
    body: [P('Sang Rajuna Tapa has given his word. In the dead of night the bar of the south gate is drawn, and the doors swing open.'),
      P('The Sejarah Melayu says the treasurer also let the city\'s rice stores run empty, so the defenders were already starving.'),
      '<p class="goal">Objective: through the south gate. Clear the guard on Bukit Larangan and hold the hill for ' + BANNER_T + ' seconds to raise the Majapahit banner. The palace is to be taken, not razed.</p>'],
    btn: 'Into the city'
  };
  if (id === 'breach') return {
    tag: 'Singapura · 1398', title: 'Through the Gate',
    body: [P(M.breachBy === 'siam' ? 'Ayutthaya\'s war elephants have broken a gate. The city is open, and now it is a race to the palace hill.' : 'The gate has given way. There was no need for a traitor after all, only time and fire.'),
      '<p class="goal">Objective: clear the guard on Bukit Larangan and hold the hill for ' + BANNER_T + ' seconds to raise the Majapahit banner.</p>',
      '<p class="lead tipline">' + TIPS[5] + '</p>'],
    btn: 'Into the city'
  };
  if (id === 'closing') return {
    tag: 'Singapura, 1398', title: 'The Lion City Falls',
    body: [P('The red and white banner of Majapahit flies over Bukit Larangan. Singapura is taken, and Ayutthaya\'s army turns back north.'),
      P('At dawn a small boat slips away west along the coast. On it is Parameswara, Singapura\'s last king. A few years later, at a river mouth where a mouse deer once turned on a hunting dog, he founds a new port: Melaka.'),
      '<p class="quote">Legend says Sang Rajuna Tapa and his wife were turned to stone for their betrayal. Majapahit\'s own sun was setting too: within a century Java\'s great empire was gone.</p>',
      P('Neither side was a villain. An old empire held its sea lanes, and a young port fought for its home. Their peoples still share the same sea, the same language roots and much of the same story.')],
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
  SFX.play('gong');
}
function closeStory() {
  const id = storyOpen; if (!id) return;
  storyOpen = null; showOv(null); paused = false;
  if (id === 'treasurer') startPhase3(G, 'treasurer');
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
function hintText() {
  const M = G.M; if (!M || G.over) return '';
  const idle = idleVillagers().length, us = selUnits();
  if (us.some(u => u.layer === 1 && u.cargo && u.cargo.length)) return 'Tap the shore where the troops should land. Land units tapped onto a boat climb aboard.';
  if (M.crippled) return 'The Jong Raya is badly holed. Pull her back out of range; she mends when no enemy is close.';
  const raiders = G.units.filter(u => u.hp > 0 && u.raid && u.layer === 0 && (u.team === 1 || u.team === 3)).length;
  if (raiders) return raiders + ' raiders are ashore on Batam. Defend the Lumbung!';
  if (M.phase === 1) {
    if (!M.landed) return 'Select the boat marked 4/4 with your Kawula, then tap Batam\'s shore to land them.';
    if (!M.hut) return 'Select your Kawula and build a Lumbung (supply hut) on Batam.';
    if (idle > 2) return idle + ' Kawula are idle. Tap the idle button to put them to work.';
    if (M.ol === 'neutral') return 'Win over the Orang Laut: select their village and give gifts, or drive off the Siamese raid on it.';
    if (!M.harbourDown) return 'Burn Singapura\'s harbour (on the water, in the south-east corner of the walls). Your soldiers throw torches, archers shoot fire arrows, and fire ships burn timber fast.';
    return 'Plunder the kampung outside the walls for food and gold. The siege begins soon.';
  }
  if (M.phase === 2) {
    const u = M.msgr;
    if (!u || u.hp <= 0) return M.cd.msg > 0 ? 'Another messenger can sail in ' + Math.ceil(M.cd.msg) + ' s. Or break a gate by force.' : 'Select the Jong Raya and launch the Utusan (messenger). Or break a gate by force.';
    if (u.boarded) return 'Sail the trader\'s boat to the beach below the south gate and tap the shore.';
    if (inCity(u.x, u.y)) return u.disguise ? 'The messenger is talking with the treasurer (' + Math.floor(M.talk / TALK[G.diff] * 100) + '%). Keep your soldiers away from him.' : 'He has been found out! Get him to the treasurer before the guards catch him.';
    return 'Walk the messenger to the south gate. The guards let traders in.';
  }
  if (M.bannerAt && M.bannerFoes) return M.bannerFoes + ' defenders still hold Bukit Larangan. Clear them to raise the banner.';
  if (M.bannerAt) return 'Raising the banner: ' + Math.ceil(BANNER_T - M.banner) + 's. Hold the hill!';
  return 'Bring soldiers up Bukit Larangan, the palace hill at the north of the city.';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'sunk';
  const items = [];
  items.push({ t: 'Land on Batam and build a Lumbung', ok: M.hut, how: 'Launch Kawula from the Jong Raya, tap the Batam shore to land them, then build a Lumbung there.' });
  items.push({ t: 'Win over the Orang Laut' + (M.ol === 'hostile' ? ': they fight for Singapura' : M.ol === 'gone' ? ': gone' : ''), ok: M.ol === 'ally', opt: true, how: 'Select the Orang Laut village and give a gift, or drive off the Siamese raid on it. Don\u2019t attack it.' });
  items.push({ t: 'Burn Singapura\'s harbour', ok: M.harbourDown, opt: true, how: 'Fire ships and soldiers with torches burn the harbour outside the walls.' });
  if (M.phase >= 2) items.push({ t: M.how === 'force' ? 'Break a gate by force' : 'Get the messenger to the treasurer' + (M.talk > 0 && M.talk < TALK[G.diff] ? ' (' + Math.floor(M.talk / TALK[G.diff] * 100) + '%)' : ''), ok: M.phase >= 3 || M.talk >= TALK[G.diff], how: M.how === 'force' ? 'Bring soldiers to a gate and break it.' : 'Launch the messenger and walk him in at the south gate. Keep your soldiers away from him.' });
  if (M.phase >= 3) items.push({ t: 'Raise the banner on Bukit Larangan' + (M.banner > 0 ? ' (' + Math.floor(M.banner / BANNER_T * 100) + '%)' : ''), ok: !!M.cards.closing, how: 'Hold the palace hill for 20 seconds with no defenders near.' });
  items.push({ t: 'Keep the Jong Raya afloat (' + pct(M.flag) + ')', ok: false, how: 'Pull her back out of range when she is hurt: she mends herself when no enemy is near.' });
  items.push({ t: 'Ayutthaya\'s race for the city: ' + Math.floor(M.siam) + '%' + (M.siamInside ? ' (they are inside!)' : ''), tip: true });
  items.push({ t: 'Plunder: ' + M.plunder.food + ' food, ' + M.plunder.gold + ' gold · ' + M.burned + ' buildings burnt', tip: true });
  if (M.phase === 1) items.push({ t: 'The Jong Raya also brings in ' + SUPPLY.food + ' food and ' + SUPPLY.wood + ' wood every ' + SUPPLY.every + ' s from the fleet\'s stores.', tip: true });
  return { title: M.phase === 1 ? 'The Strait: a foothold on Batam' : M.phase === 2 ? 'The siege of Singapura' : 'Bukit Larangan', items };
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
  if (M) clock = M.phase === 3 && M.banner > 0 ? 'Banner ' + Math.floor(M.banner / BANNER_T * 100) + '%' : 'Ayutthaya ' + Math.floor(M.siam) + '%';
  const ck = $('clock'); ck.textContent = clock; ck.classList.toggle('race', !!M && M.siam >= 75);
  const n = idleVillagers().length; const b = $('idle-n'); b.textContent = n; b.hidden = n === 0;
  for (const m of G.msgs) if (!seenMsgs.has(m)) { seenMsgs.add(m); toast(m.text); const fx = sfxForMsg(m.text); if (fx) SFX.play(fx); }
  sfxTick();
  if (M && M.cardQ.length && !G.over && !storyOpen) showStory(M.cardQ.shift());
  if (M && M.harbourDown && !M.vigHarbour) { M.vigHarbour = true; vignette('harbour', 'Singapura\'s harbour burns. Its war boats have nowhere to come home to.'); }
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
  centerOn(mx(48), sy(36));
  select([G.M.flag]);
  started = true; paused = false; $('hud').hidden = false; showOv(null); updateHud(); updatePanel();
  showStory('opening');
}
// the nearest spot around (cx, cy) where the fleet may put a building
function placeNear(kind, cx, cy) {
  for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    if (G.canPlace(kind, cx + dx, cy + dy, 0)) return G.addBuilding(kind, 0, cx + dx, cy + dy, true);
  }
  return null;
}
// practice: start later in the siege with what a player would have by then
function skipTo(stage) {
  startGame(seedUsed);
  storyOpen = null; showOv(null); paused = false;
  const M = G.M, put = (k, x, y) => { const p = G.openSpot(x, y, 0); return G.addUnit(k, 0, p.x, p.y); };
  // unload the starting boats onto Batam
  for (const u of G.units.slice()) if (u.team === 0 && u.cargo && u.cargo.length) { for (const c of u.cargo) { const p = G.openSpot(mx(28), sy(34), 0); c.x = p.x; c.y = p.y; c.boarded = false; G.units.push(c); G.byId.set(c.id, c); G.idleOrder(c); } u.cargo = []; }
  placeNear('granary', 27, 33); placeNear('house', 24, 31); placeNear('house', 24, 35); placeNear('house', 30, 36);
  for (const u of G.units) if (u.team === 0 && u.kind === 'villager') { const n = G.nearestNode(u.x, u.y, 'wood', 0, 10, 0); if (n) G.orderGather(u, n); }
  G.res[0] = { food: 700, wood: 500, gold: 350 };
  M.t = 240; M.hut = true; M.landed = 10; M.siam = 18; M.siamNext = M.t + 30; M.raidNext = M.t + 90; M.sgRaidNext = M.t + 200;
  const army = { keris: 8, tombak: 7, archer: 6 };
  let i = 0; for (const k in army) for (let j = 0; j < army[k]; j++, i++) put(k, 34 + (i % 7) * 1.1, 15.6 + Math.floor(i / 7) * 0.8);
  { const p = G.openSpot(mx(33), sy(24), 1); M.flag.x = p.x; M.flag.y = p.y; M.flag.path = null; G.idleOrder(M.flag); }
  M.phase = 2; M.phaseAt = M.t;
  if (stage === 'palace') {
    M.talk = TALK[G.diff]; M.cards.betray = true;
    centerOn(mx(32), sy(14)); G.msg('Practice: the treasurer has given his word.');
    M.cardQ.push('treasurer');
  } else { centerOn(mx(32), sy(18)); G.msg('Practice: the fleet holds Batam. Send the messenger.'); M.cardQ.push('siege'); }
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
  $('end-tag').textContent = win ? 'Demo complete' : M.why === 'siam' ? 'Ayutthaya was first' : 'The flagship is lost';
  $('end-title').textContent = win ? 'Singapura Has Fallen' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  $('end-sub').textContent = win ? 'The banner of Majapahit flies over Bukit Larangan. Parameswara has slipped away west, toward a river called Bertam.'
    : M.why === 'siam' ? 'Ayutthaya\'s soldiers hold the palace hill. The Majapahit fleet sails home to Java with nothing.'
    : 'The Jong Raya burns and sinks in the Strait. Without her the fleet turns for home.';
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + M.launched + '</b><span>Boats launched</span></div>' +
    '<div><b>' + G.stats.kills + '</b><span>Enemies defeated</span></div><div><b>' + M.burned + '</b><span>Buildings burnt</span></div>' +
    '<div><b>' + (M.plunder.food + M.plunder.gold) + '</b><span>Plunder</span></div><div><b>' + Math.floor(M.siam) + '%</b><span>Ayutthaya\'s race</span></div>';
  const old = $('ov-end').querySelector('.end-art'); if (old) old.remove();
  if (!win) { const art = document.createElement('div'); try { art.appendChild(drawScene('fall')); } catch (e) { /* no art */ } art.className = 'end-art'; $('end-title').after(art); }
  SFX.play(win ? 'victory' : 'defeat');
  showOv('end');
}
// a fire ship going up makes a bang
const _explode = Game.prototype.explode;
Game.prototype.explode = function (u) { this.sfx('boom', u.x, u.y); return _explode.call(this, u); };

function mjBoot() {
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
  view.zoom = view.w > 700 ? 1.3 : 1; centerOn(mx(32), sy(14));
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
  const h = (location.hash || '').slice(1);
  if (h === 'siege' || h === 'palace') skipTo(h);
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
