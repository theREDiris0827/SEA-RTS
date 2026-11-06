/* ===== m5-ui.js ===== */
const TIPS = [
  'Melaka in 1511 had no stone walls. It was defended by timber stockades, street barricades, caltrops on the beach, and a great many guns: the Portuguese said they took some 3,000 after the city fell.',
  'The bridge over the Melaka river joined the royal hill to Upeh, the merchants\' quarter. Whoever held it could cut the city in two.',
  'Albuquerque\'s first assault came on 25 July 1511, St James\' Day. His men took the bridge but could not hold it in the heat, and fell back to their ships.',
  'Raja Ahmad, son of Sultan Mahmud Shah, led the defence of the city. He later took the throne in exile for a time.',
  'Gujarati, Chinese, Javanese and Tamil merchants all lived in Melaka. Some of them sided with the Portuguese; many fled.',
  'The Portuguese said Melaka\'s defenders sent fire rafts drifting down the river at their ships.',
  'The stone fortress A Famosa was built by the Portuguese after they took the city, partly from the stones of Melaka\'s mosques and tombs.'
];
let storyOpen = null;

/* ---------- panel hooks the main game calls (nothing extra in this mission) ---------- */
function ageLabel() { return 'Golden Age · Kesultanan'; }
function mrPanelKey() { return ''; }
function mrUnitCmds() { return ''; }
function mrBldCmds() { return ''; }
function mrPanelAction() { return false; }
function describeOrder(u) { if (UD[u.kind].hero) return 'Leading the defence'; return baseDescribeOrder(u); }
function bldNote(b) {
  if (b.id === G.M.istana) return 'The sultan\'s palace. If it falls, the mission is lost.';
  if (b.kind === 'wat') return 'The great mosque of Melaka, by the bridge.';
  return baseBldNote(b);
}

/* ---------- story cards ---------- */
function storyFor(id) {
  const P = (t) => '<p>' + t + '</p>', goal = (t) => '<p class="goal">' + t + '</p>', tip = (t) => '<p class="lead tipline">' + t + '</p>';
  if (id === 'opening') return {
    tag: 'Melaka · Golden Age · 25 July 1511', title: 'St James\' Day',
    body: [P('For weeks Afonso de Albuquerque\'s carracks have lain off the city, flying the red cross. Sultan Mahmud Shah would not hand over the Portuguese held in Melaka, nor pay for the ships lost two years before. Now the talking is over.'),
      P('At dawn the ships\' boats put out for both beaches. They want the bridge: whoever holds it cuts Melaka in two, the Istana on its hill from Upeh and its warehouses.'),
      goal('Objective: hold the bridge. Meet the landings on the Upeh beach (north) and below the hill (south). Keep Raja Ahmad and the Istana safe.'),
      tip(TIPS[0])],
    btn: 'To the bridge'
  };
  if (id === 'final') return {
    tag: 'The last assault', title: 'Albuquerque comes ashore',
    body: [P('The Governor himself is in the boats this time, under his plumed helmet, with every man the carracks can spare and the bronze guns.'),
      goal('Objective: break this assault. If Albuquerque is badly wounded, his men will carry him back to the ships.'),
      tip(TIPS[2])],
    btn: 'Hold'
  };
  if (id === 'albhurt') return {
    tag: 'The assault falters', title: 'The Governor is hurt',
    body: [P('Albuquerque is wounded in the fighting. His captains have him carried back to the boats, and the men around him follow. The trumpets sound the withdrawal.')], btn: 'Continue'
  };
  if (id === 'withdraw') return {
    tag: 'The assault is broken', title: 'Back to the ships',
    body: [P('Too few Portuguese are left on the beaches to hold anything in this heat. The trumpets call them back to the boats, and they pull away under the beach guns.')], btn: 'Continue'
  };
  if (id === 'won') return {
    tag: 'Evening, 25 July 1511', title: 'The bridge still stands',
    body: [P('Melaka has held. The boats row back to the carracks, and in the city the dead are counted and the stockades mended.'),
      P('But the ships do not leave. Albuquerque is waiting, and he is building something: a tall junk, packed with guns, to come up the river to the bridge itself.'),
      tip('This is the end of part 1 of the demo. Part 2 adds the junk battery (10 August) and the sultan\'s escape upriver.')],
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
  if (id === 'won') { G.M.won = true; G.checkEnd(); }
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-do="story"]')) closeStory(); });
window.addEventListener('keydown', (e) => { if (storyOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopImmediatePropagation(); closeStory(); } }, true);

/* ---------- hint and objectives ---------- */
function hintText() {
  const M = G && G.M; if (!M) return '';
  if (M.retreat) return 'The Portuguese are falling back to their ships.';
  if (M.bridge > 0) return 'The Portuguese are on the bridge! Send men onto it to push them off.';
  if (M.ashore > 0) return M.ashore + ' Portuguese ashore. Meet them before they reach the bridge.';
  if (M.wave === 0) return 'Boats will come for both beaches. Get your men ready behind the stockades.';
  return 'Mend the stockades with villagers and train more men while the boats are away.';
}
let objOpen = true, objKey = '', objAuto = 0, objStarted = false;
function objList() {
  const M = G.M; if (!M) return null;
  const pct = (u) => u && u.hp > 0 ? Math.ceil(u.hp / u.maxHp * 100) + '%' : 'fallen';
  const ist = G.byId.get(M.istana), items = [];
  items.push({ t: 'Hold the bridge' + (M.bridge > 0 ? ' (lost in ' + Math.ceil(BRIDGE_HOLD - M.bridge) + ' s)' : ''), ok: M.retreat,
    how: 'Keep some of your men on or beside the bridge. If only Portuguese stand there, the red bar fills and the bridge is lost.' });
  items.push({ t: 'Beat the landings (' + Math.min(M.wave, WAVES.length) + ' of ' + WAVES.length + ' have come)', ok: M.retreat,
    how: 'Red arrows show the beach the boats are heading for. Fight them at the stockade, where the beach guns help.' });
  items.push({ t: 'Keep Raja Ahmad alive (' + pct(heroUnit(G)) + ')', ok: false, how: 'He makes the men near him fight harder. Pull him back if his bar gets low.' });
  items.push({ t: 'Keep the Istana standing (' + (ist && ist.hp > 0 ? Math.ceil(ist.hp / ist.maxHp * 100) + '%' : 'fallen') + ')', ok: false, how: 'Villagers can repair it: select them and tap the Istana.' });
  if (M.finalOn && M.alb) { const a = G.byId.get(M.alb); if (a && a.hp > 0 && !M.retreat) items.push({ t: 'Optional: wound Albuquerque (' + pct(a) + ')', opt: true, how: 'Bring him under 40% and his men carry him back to the ships.' }); }
  return { title: 'St James\' Day · 25 July 1511', items };
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
}
function updateHud() {
  baseUpdateHud();
  const M = G && G.M; if (!M) return;
  updateObj();
  let clock = fmtTime(G.t);
  if (M.retreat) clock = 'Withdrawing';
  else if (M.bridge > 0) clock = 'Bridge ' + Math.ceil(BRIDGE_HOLD - M.bridge) + 's';
  else if (M.ashore > 0) clock = 'Landing!';
  else if (M.wave < WAVES.length) clock = 'Boats in ' + fmtTime(Math.max(0, M.next - M.t));
  $('clock').textContent = clock;
  if (M.cardQ.length && !G.over && !storyOpen) showStory(M.cardQ.shift());
}

/* ---------- game flow ---------- */
function startGame(seed) {
  seedUsed = seed; storyOpen = null;
  G = new Game({ seed, diff, civs: [0, 1] });
  DRESS.built = false;
  enterGame(); showMenu(null);
  objStarted = false;
  view.zoom = view.w > 700 ? 0.9 : 0.75; resize();
  centerOn(30, 40);
  updateHud(); updatePanel();
  showStory('opening');
}
function skipTo(which) {
  startGame(seedUsed);
  storyOpen = null; showOv(null); paused = false;
  const M = G.M;
  if (which === 'final') {
    M.wave = WAVES.length - 1; M.next = M.t + 8;
    G.res[0] = { food: 900, wood: 900, gold: 800 };
    G.msg('Practice: starting at the last assault.');
  }
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
  $('end-tag').textContent = win ? 'Part 1 complete' : 'The mission is lost';
  $('end-title').textContent = win ? 'The bridge holds' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  const why = { hero: 'Raja Ahmad has fallen. Without him the defence breaks.', istana: 'The Istana has fallen.', bridge: 'The Portuguese hold the bridge. Melaka is cut in two.' };
  $('end-sub').textContent = win ? 'Melaka beat back the St James\' Day assault. Albuquerque\'s men are back on their ships, but the fleet has not sailed.' : (why[M.why] || 'The city has fallen.');
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + Math.min(M.wave, WAVES.length) + ' of ' + WAVES.length + '</b><span>Landings</span></div>' +
    '<div><b>' + M.kills + '</b><span>Portuguese defeated</span></div><div><b>' + M.lost + '</b><span>Men lost</span></div>' +
    '<div><b>' + G.stats.trained + '</b><span>Trained</span></div><div><b>' + diff + '</b><span>Difficulty</span></div>';
  const old = $('ov-end').querySelector('.end-art'); if (old) old.remove();
  const art = document.createElement('div'); art.className = 'end-art';
  try { art.appendChild(drawScene(win ? 'won' : 'fall')); } catch (e) { /* no art */ }
  $('end-title').after(art);
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
  G = new Game({ seed: seedUsed, diff, civs: [0, 1] }); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  for (let i = 0; i < W * H; i++) G.explored[i] = 1;
  view.zoom = view.w > 700 ? 0.8 : 0.6; centerOn(32, 40);
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
  const h = (location.hash || '').slice(1);
  if (h === 'final') skipTo(h);
}
