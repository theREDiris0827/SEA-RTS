/* ##### CHAPTER SCREEN 5 · Action panel #####
   File: src/js/ui/05-action-panel.js
   What it does: The panel at the bottom: build tabs, train buttons, stance, bell, repair, demolish.
   Things you can tweak:
     - STANCES: the stance names and order.
   ############################################################################ */
/* ---------------- panel ---------------- */
let panelKey = '', pdyn = [], panelT = 0;
// cost shown with icons
function costHTML(cost) {
  let s = ''; for (const k of ['food', 'wood', 'gold']) if (cost[k]) s += '<b style="color:' + RESCOL[k] + '">' + cost[k] + '</b>';
  return s;
}
// cost as text
function costTitle(cost) { return Object.keys(cost).map(k => cost[k] + ' ' + k).join(', '); }
// make one panel button
function cmdBtn(act, key, icon, label, cost, title, extra) {
  return '<button class="cmd" data-a="' + act + '" data-k="' + key + '" title="' + (title || label) + '" ' + (extra || '') + '><img alt="" src="' + icon + '"><span class="nm">' + label + '</span><span class="ct">' + (cost ? costHTML(cost) : '&nbsp;') + '</span></button>';
}
/* a button for something a later age brings: greyed out, tapping it says which age */
function lockBtn(k, d, icon) {
  const A = AGE_TABLE[d.age || 1];
  return '<button class="cmd no lock" data-a="locked" data-k="' + k + '" title="' + civName(k, 0) + ' comes with the ' + A.name + '"><img alt="" src="' + icon + '"><span class="nm">' + btnName(k, 0) + '</span><span class="ct">' + A.name.replace('Age of ', '').replace(' Age', '') + '</span></button>';
}
/* the Town Centre's age-up button: the next age and its cost, or the work under way (tap to call it off) */
function ageBtn() {
  const a = G.aging && G.aging[0];
  if (a) { const A = AGE_TABLE[a.to]; return '<button class="cmd on" data-a="agecancel" title="Advancing to the ' + A.name + '. Tap to call it off and get the cost back."><img alt="" src="' + resIcon('flag') + '"><span class="nm">' + A.local[CI(0)] + '</span><span class="ct" id="p-age">0%</span></button>'; }
  const n = G.teamAge(0) + 1, A = AGE_TABLE[n]; if (!A || n > (G.maxAge || AGE_MAX)) return '';
  return cmdBtn('ageup', 'ageup', resIcon('flag'), A.local[CI(0)] + '<small class="en">(' + A.name + ')</small>', A.cost, 'Advance to the ' + A.name + ' (' + A.local[CI(0)] + '), ' + A.time + ' s. Needs ' + G.ageText(0, n) + '.', 'data-age="' + n + '"');
}
// what a unit is doing, as text
function describeOrder(u) {
  const o = u.order;
  switch (o.t) {
    case 'idle': return 'Idle';
    case 'move': return o.ret ? 'Returning' : 'Moving';
    case 'amove': return 'Attack-moving';
    case 'attack': return o.hunt ? 'Hunting' : 'Fighting';
    case 'build': return 'Building';
    case 'repair': return 'Repairing';
    case 'board': return 'Boarding';
    case 'garrison': return 'Taking shelter';
    case 'land': return 'Landing troops';
    case 'fishhouse': return 'Fishing from the deck';
    case 'wander': return 'Grazing';
    case 'gather': {
      const n = G.byId.get(o.id);
      if (!n) return 'Gathering';
      return n.kind === 'tree' ? 'Chopping wood' : n.kind === 'gold' ? 'Mining gold' : n.kind === 'fish' ? 'Fishing' : n.kind === 'berry' ? 'Foraging' : n.kind === 'carcass' ? 'Butchering' : FIELD[n.kind] ? 'Farming' : 'Gathering';
    }
    default: return '';
  }
}
// help line for a selected building
function bldNote(b) {
  const own = b.team === 0;
  if (b.kind === 'village') return b.post ? 'A trading post stands on its landing.' : 'Build a Trade Post on the landing beside it.';
  if (b.kind === 'tradepost') return own ? ((CV(0) === 1 ? 'The village pays you tribute: about 33 gold a minute. ' : '') + 'Tap it with a ' + civName('trade', 0) + ' to start a trade route. Trade gold so far: ' + G.tradeGold + '.') : 'This village pays tribute to ' + CIV_TITLE[CV(b.team)] + '.';
  if (b.kind === 'rafthouse' && own) return 'A woman fishing from the deck brings in food and makes a household. Tap it with a villager to send her.';
  if (b.kind === 'house' && own && CV(0) === AYU_CIV) return 'A villager farming a paddy beside it makes a household: +15 food every minute (up to 6).';
  if (b.kind === 'granary' && own) return 'Villagers drop food here.';
  if (b.kind === 'store' && own) return 'Villagers drop wood and gold here.';
  if (b.kind === 'tower' && own) return 'Shoots arrows at enemies in range.';
  if (b.kind === 'gate' && own) return b.locked ? 'Closed: no one passes. Tap Open to let your people through.' : 'Open to your own people, shut to enemies. Tap Close to bar it.';
  if (b.kind === 'patirthan') return 'Units resting by the pool heal slowly.';
  return '';
}
// name line in the panel
function pName(kind, team, base) { const e = enName(kind, team), n = base || civName(kind, team); return n + (e && n === civName(kind, team) ? ' <span class="en">(' + e + ')</span>' : ''); }
// build the bottom panel for the selection
function buildPanel() {
  const P = $('panel'); pdyn = [];
  let info = '', cmds = '', extra = '', tabs = '', extra2 = '';
  const us = selUnits(), single = sel.length === 1 ? sel[0] : null;
  if (mode && mode.kind === 'place') {
    const d = BD[mode.bkind];
    info = '<div class="p-head"><img alt="" src="' + bldIcon(mode.bkind, 0) + '"><div><div class="p-name">Place ' + pName(mode.bkind, 0) + '</div><div class="p-sub">' + (BRIEF[mode.bkind] ? BRIEF[mode.bkind] + ' \u00b7 ' : '') + costTitle(d.cost) + '</div></div></div>' +
      '<div class="p-line">' + (d.line ? ((hover && hover.mouse) ? 'Click where the wall starts, then click where it ends. Esc cancels.' : 'Drag either end of the wall (or tap near it), then tap the green tick to build.')
        : d.gate ? 'Set it into your own wall, or anywhere on open ground. Your people walk through; enemies have to break it.'
        : (hover && hover.mouse) ? 'Click to place. Shift-click keeps building. Esc cancels.' : 'Drag the building (or tap the map) to move it, then tap the green tick to build.') + '</div>';
    cmds = '<button class="cmd ok" data-a="place-ok" title="Place building"><img alt="" src="' + resIcon('check') + '"><span class="nm">Place</span><span class="ct">&nbsp;</span></button>' +
      '<button class="cmd" data-a="place-cancel" title="Cancel"><img alt="" src="' + resIcon('x') + '"><span class="nm">Cancel</span><span class="ct">&nbsp;</span></button>';
  } else if (!sel.length) {
    info = '<div class="p-head"><img alt="" src="' + bldIcon('towncentre', 0) + '"><div><div class="p-name">' + CIV_REALM[CV(0)] + '</div><div class="p-sub">Your settlement</div></div></div>' +
      '<div class="p-line">Tap a unit or building. Drag to scroll the map. Pinch to zoom. Hold, then drag to box-select.</div>';
    cmds = cmdBtn('tc', 'tc', bldIcon('towncentre', 0), 'Town', null, 'Jump to your Town Centre') + cmdBtn('idle', 'idle', resIcon('idle'), 'Idle', null, 'Next idle villager') + cmdBtn('army', 'army', resIcon('army'), 'Army', null, 'Select all warriors (not ships)') + cmdBtn('navy', 'navy', unitIcon('light', 0), 'Navy', null, 'Select all warships');
  } else if (us.length) {
    const kinds = {}; us.forEach(u => { kinds[u.kind] = (kinds[u.kind] || 0) + 1; });
    const first = us[0], names = Object.keys(kinds);
    if (us.length === 1) {
      info = '<div class="p-head"><img alt="" src="' + unitIcon(first.kind, 0) + '"><div><div class="p-name">' + pName(first.kind, 0, G.unitName(first)) + '</div><div class="p-sub" id="p-s1"></div></div></div>' +
        '<div class="bar"><i id="p-hp"></i></div>' + (BRIEF[first.kind] ? '<div class="p-line">' + BRIEF[first.kind] + '.</div>' : '') + '<div class="p-line" id="p-l1"></div>';
      pdyn.push(() => {
        const u = first; $('p-hp').style.width = Math.max(0, u.hp / u.maxHp * 100) + '%'; $('p-s1').textContent = describeOrder(u) + '  ' + Math.ceil(u.hp) + '/' + u.maxHp;
        $('p-l1').textContent = UD[u.kind].troops ? ((u.cargo && u.cargo.length) ? u.cargo.length + '/' + UD[u.kind].troops + ' aboard. Tap a beach to land them.' : 'Select soldiers, then tap this ship to take up to ' + UD[u.kind].troops + ' aboard.') : u.carry.amt > 0 ? 'Carrying ' + u.carry.amt + ' ' + u.carry.type : (u.cls === 'vil' ? 'Tap a tree, berries or gold to gather.' : u.cls === 'boat' ? 'Tap a school of fish.' : UD[u.kind].trader ? 'Tap your Trade Post to start a trade route.' : u.cls === 'healer' ? 'Heals hurt allies nearby once they are out of the fight.' : 'Tap an enemy to attack.');
      });
    } else {
      info = '<div class="p-head"><div class="chips">' + names.map(k => '<button class="chip" data-a="selkind" data-k="' + k + '" title="Select only this type"><img alt="" src="' + unitIcon(k, 0) + '"><b>' + kinds[k] + '</b></button>').join('') + '</div>' +
        '<div class="p-name sm">' + us.length + ' selected</div></div>';
    }
    const hasVil = us.some(u => u.cls === 'vil'), hasMil = us.some(u => u.cls !== 'vil' && u.cls !== 'boat');
    if (hasVil) {
      // villagers build from two tabs, Economy and Military; later-age buildings are one line of text under them
      const later = {};
      for (const k of BUILD_ORDER) {
        const d = BD[k]; if (!civOk(d, 0) || ECO_BLD.has(k) !== (buildTab === 'eco')) continue;
        if (!ageFits(d, G.teamAge(0))) { if (!G.M) { const A = AGE_TABLE[d.age || 1].name; const e = enName(k, 0); (later[A] = later[A] || []).push(shortName(k, 0) + (e ? ' (' + e + ')' : '')); } continue; }
        cmds += cmdBtn('build', k, bldIcon(k, 0), btnName(k, 0), d.cost, civName(k, 0) + ', ' + civRole(k, 0) + ' (' + costTitle(d.cost) + ')', 'data-bk="' + k + '"');
      }
      tabs = '<div class="p-tabs">' + [['eco', 'Economy'], ['mil', 'Military']].map(([t, l]) => '<button class="tab' + (buildTab === t ? ' on' : '') + '" data-a="btab" data-k="' + t + '">' + l + '</button>').join('') +
        '<button class="tab" data-a="stop" title="Stop (S)">Stop</button><button class="tab" data-a="desel" title="Deselect">Back</button></div>';
      const ln = Object.keys(later).map(A => A + ': ' + later[A].join(', ')).join(' \u00b7 ');
      if (ln) extra2 = '<div class="p-later">' + ln + '</div>';
    }
    if (hasMil) {
      cmds += grpPanelButtons();
      cmds += '<button class="cmd" data-a="fmt" title="Formation (F)"><img alt="" src="' + resIcon('form') + '"><span class="nm" id="p-fmt">' + formation + '</span><span class="ct">&nbsp;</span></button>';
      const st0 = stanceOfSel();
      cmds += '<button class="cmd" data-a="stance" title="Stance: Aggressive chases anything it sees, Defensive chases a little then returns to its post, Hold ground never moves"><img alt="" id="p-sti" src="' + resIcon(st0) + '"><span class="nm" id="p-st">' + STANCE_NAME[st0] + '</span><span class="ct">&nbsp;</span></button>';
    }
    if (us.some(u => UD[u.kind].troops)) cmds += cmdBtn('unload', 'unload', resIcon('army'), 'Land', null, 'Put the troops ashore at the nearest beach');
    if (!hasVil) {
      cmds += '<button class="cmd" data-a="stop" title="Stop (S)"><img alt="" src="' + resIcon('stop') + '"><span class="nm">Stop</span><span class="ct">&nbsp;</span></button>';
      cmds += '<button class="cmd" data-a="desel" title="Deselect"><img alt="" src="' + resIcon('x') + '"><span class="nm">Back</span><span class="ct">&nbsp;</span></button>';
    }
  } else if (single && single.isBld) {
    const b = single, d = BD[b.kind], own = b.team === 0;
    info = '<div class="p-head"><img alt="" src="' + bldIcon(b.kind, b.team) + '"><div><div class="p-name">' + pName(b.kind, b.team) + '</div><div class="p-sub">' + (b.team === 2 ? 'Neutral' : own ? (BRIEF[b.kind] || civRole(b.kind, b.team)) : CIV_TITLE[CV(b.team)] + ' \u00b7 ' + civRole(b.kind, b.team)) + '</div></div></div>' +
      '<div class="bar"><i id="p-hp"></i></div><div class="p-line" id="p-l1"></div>';
    pdyn.push(() => {
      $('p-hp').style.width = Math.max(0, (b.done ? b.hp / b.maxHp : b.progress) * 100) + '%';
      $('p-l1').textContent = !b.done ? 'Under construction ' + Math.floor(b.progress * 100) + '%' : own && b.cargo && b.cargo.length ? b.cargo.length + '/' + d.garrison + ' sheltering inside, +' + b.cargo.length + ' arrows' : b.stall ? 'Population limit. Build Houses.' : own && d.train ? ((hover && hover.mouse) ? 'Right-click the map to set a rally point.' : 'Double-tap the map to set a rally point.') : own && FIELD[b.kind] ? (FARM_ENDLESS ? 'Never runs out' : b.food + ' food left') : own && d.pop ? '+' + d.pop + ' population' : bldNote(b) || Math.ceil(b.hp) + '/' + b.maxHp + ' HP';
    });
    if (own && b.done && d.train) {
      for (const k of G.trainable(b.kind, 0)) { const c = G.costOf(k, 0); cmds += cmdBtn('train', k, unitIcon(k, 0), btnName(k, 0), c, civName(k, 0) + ', ' + civRole(k, 0) + ' (' + costTitle(c) + ')', 'data-tk="' + k + '"'); }
      extra = '<div class="queue" id="p-q">' + b.queue.map((q, i) => '<button class="qi" data-a="cancel" data-i="' + i + '" title="Cancel"><img alt="" src="' + unitIcon(q.kind, 0) + '"><i id="p-qb' + i + '"></i></button>').join('') + '</div>';
      for (const k of G.lockedTrain(b.kind, 0)) cmds += lockBtn(k, UD[k], unitIcon(k, 0));
      if (b.kind === 'towncentre' && !G.M) cmds += ageBtn();
      if (b.kind === 'towncentre') cmds += G.bell && G.bell[0] ? cmdBtn('allclear', 'allclear', resIcon('check'), 'All clear', null, 'All clear: everyone comes out and goes back to work') : cmdBtn('bell', 'bell', resIcon('bell'), 'Bell', null, 'Ring the town bell: every villager runs into the nearest Town Centre or tower');
      if (b.kind === 'port') cmds += cmdBtn('raft', 'raft', unitIcon('raft', 0), btnName('raft', 0), UD.raft.cost, civName('raft', 0) + ': push a burning raft at the nearest enemy ship (' + RAFT.cd + ' s between rafts)');
      pdyn.push(() => { const pa = $('p-age'), ag = G.aging && G.aging[0]; if (pa && ag) pa.textContent = Math.floor((1 - ag.left / ag.tot) * 100) + '%'; });
      pdyn.push(() => { b.queue.forEach((q, i) => { const e = $('p-qb' + i); if (e) e.style.width = (i === 0 ? Math.min(100, b.qt / UD[q.kind].time * 100) : 0) + '%'; }); });
    }
    if (own && b.cargo && b.cargo.length && !(b.kind === 'towncentre' && G.bell && G.bell[0])) cmds += cmdBtn('release', 'release', resIcon('check'), 'Release', null, 'Let everyone inside come out');
    if (own && b.done && d.gate) cmds += cmdBtn('gatelock', 'gatelock', bldIcon(b.kind, 0), b.locked ? 'Open' : 'Close', null, b.locked ? 'Open the gate: your own people can pass again' : 'Close the gate: no one passes, not even your own people');
    if (own && G.canDemolish(b)) cmds += '<button class="cmd demo" data-a="demolish" title="Demolish: tap twice. Nothing comes back."><img alt="" src="' + resIcon('x') + '"><span class="nm" id="p-demo">Demolish</span><span class="ct">&nbsp;</span></button>';
    if (own) cmds += '<button class="cmd" data-a="desel" title="Deselect"><img alt="" src="' + resIcon('x') + '"><span class="nm">Back</span><span class="ct">&nbsp;</span></button>';
  } else if (single && single.isNode) {
    const n = single;
    info = '<div class="p-head"><img alt="" src="' + nodeIcon(n) + '"><div><div class="p-name">' + (NODE_NAME[n.kind] || 'Resource') + '</div><div class="p-sub" id="p-s1"></div></div></div><div class="p-line">Send villagers here to gather ' + (n.kind === 'fish' ? '(needs a fishing boat).' : '.') + '</div>';
    pdyn.push(() => { $('p-s1').textContent = Math.max(0, n.amt) + ' ' + n.type + ' left'; });
    cmds = '<button class="cmd" data-a="desel" title="Deselect"><img alt="" src="' + resIcon('x') + '"><span class="nm">Back</span><span class="ct">&nbsp;</span></button>';
  } else if (single && single.isUnit) {
    const u = single;
    info = '<div class="p-head"><img alt="" src="' + unitIcon(u.kind, u.team === 2 ? 0 : u.team) + '"><div><div class="p-name">' + (u.team === 1 ? CIV_TITLE[CV(1)] + ' ' : '') + pName(u.kind, u.team, G.unitName(u)) + '</div><div class="p-sub" id="p-s1"></div></div></div><div class="bar foe"><i id="p-hp"></i></div>';
    pdyn.push(() => { $('p-hp').style.width = Math.max(0, u.hp / u.maxHp * 100) + '%'; $('p-s1').textContent = Math.ceil(u.hp) + '/' + u.maxHp + ' HP'; });
    cmds = '<button class="cmd" data-a="desel" title="Deselect"><img alt="" src="' + resIcon('x') + '"><span class="nm">Back</span><span class="ct">&nbsp;</span></button>';
  }
  P.innerHTML = '<div class="p-info">' + info + extra + '</div>' + (tabs ? '<div class="p-bld">' + tabs + '<div class="p-cmds bld">' + cmds + '</div>' + extra2 + '</div>' : '<div class="p-cmds">' + cmds + '</div>');
}
// panel layout key (rebuild only when it changes)
function structKey() {
  const us = selUnits();
  let k = sel.map(o => o.id + (o.isBld ? (o.done ? 'd' : 'u') + o.queue.length + 'g' + (o.cargo ? o.cargo.length : 0) : '')).join(',') + (G.bell && G.bell[0] ? 'B' : '') + '|' + G.teamAge(0) + (G.aging && G.aging[0] ? 'A' : '');
  k += '|' + (mode ? mode.kind + (mode.bkind || '') : '') + '|' + formation + '|' + us.some(u => u.cls === 'vil');
  return k;
}
// refresh numbers on the panel
function updatePanel() {
  sel = sel.filter(o => o.hp > 0 || (o.isNode && o.amt > 0));
  const k = structKey();
  if (k !== panelKey) { panelKey = k; buildPanel(); }
  for (const f of pdyn) { try { f(); } catch (_) { /* element replaced */ } }
  const fm = $('p-fmt'); if (fm) fm.textContent = formation;
  const r = G.res[0];
  document.querySelectorAll('#panel .cmd[data-bk]').forEach((el) => { const d = BD[el.dataset.bk]; el.classList.toggle('no', !G.canAfford(0, d.cost) || !!(d.needs && !G.buildings.some(b => b.team === 0 && b.kind === d.needs && b.done && b.hp > 0))); });
  document.querySelectorAll('#panel .cmd[data-age]').forEach((el) => { const n = +el.dataset.age; el.classList.toggle('no', !G.ageNeedMet(0, n) || !G.canAfford(0, AGE_TABLE[n].cost)); });
  document.querySelectorAll('#panel .cmd[data-tk]').forEach((el) => { el.classList.toggle('no', !G.canAfford(0, G.costOf(el.dataset.tk, 0))); });
  const place = document.querySelector('#panel .cmd.ok'); if (place) place.classList.toggle('no', !(mode && mode.valid));
  // a row of buttons wider than the panel scrolls sideways: fade its edge so the hidden ones are noticed
  const pc = document.querySelector('#panel .p-cmds'); if (pc) pc.classList.toggle('more', pc.scrollWidth > pc.clientWidth + 2 && pc.scrollLeft + pc.clientWidth < pc.scrollWidth - 4);
}
const STANCES = ['agg', 'def', 'hold'], STANCE_NAME = { agg: 'Aggressive', def: 'Defensive', hold: 'Hold' };
// stance of the selected soldiers
function stanceOfSel() { const m = selUnits().find(u => u.cls !== 'vil' && u.cls !== 'boat' && u.cls !== 'healer'); return (m && m.stance) || 'def'; }
// Stance button
function cycleStance() {
  const ms = selUnits().filter(u => u.cls !== 'vil' && u.cls !== 'healer'); if (!ms.length) return;
  const st = STANCES[(STANCES.indexOf(stanceOfSel()) + 1) % 3];
  for (const u of ms) { u.stance = st; if (u.order.t === 'attack' && (u.order.leash || u.order.agg || u.order.hold)) G.idleOrder(u); }
  const l = document.getElementById('p-st'), i = document.getElementById('p-sti'); if (l) l.textContent = STANCE_NAME[st]; if (i) i.src = resIcon(st);
  toast('Stance: ' + (st === 'hold' ? 'Hold ground' : STANCE_NAME[st]));
}
// Formation button
function cycleFormation() { formation = FORMS[(FORMS.indexOf(formation) + 1) % 3]; toast('Formation: ' + formation); }
// Stop button
function stopSel() { for (const u of selUnits()) G.idleOrder(u); }
$('panel').addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]'); if (!el || !started || paused) return;
  const a = el.dataset.a, k = el.dataset.k;
  if (a === 'build') startPlace(k);
  else if (a === 'demolish') {
    const b = sel[0]; if (!b || !b.isBld || b.team !== 0) return;
    if (b._demoT && performance.now() - b._demoT < 3000) { b._demoT = 0; if (G.demolish(b)) { select([]); panelKey = ''; } }
    else { b._demoT = performance.now(); const e = $('p-demo'); if (e) e.textContent = 'Tap again'; setTimeout(() => { const e2 = $('p-demo'); if (e2 && sel[0] === b) e2.textContent = 'Demolish'; }, 3000); }
  }
  else if (a === 'ageup') { const err = G.startAge(0); toast(err || 'Your court sets to work. The Town Centre keeps training villagers.'); panelKey = ''; }
  else if (a === 'agecancel') { G.cancelAge(0); panelKey = ''; }
  else if (a === 'locked') toast(el.title + '.');
  else if (a === 'gatelock') { const b = sel[0]; if (b && b.isBld && b.team === 0) { G.setGateLock(b, !b.locked); toast(b.locked ? 'Gate closed. No one passes.' : 'Gate open. Your people can pass, enemies cannot.'); } panelKey = ''; }
  else if (a === 'raft') { const b = sel[0]; const err = b && b.isBld ? G.launchRaft(b) : 'Not available.'; if (err) toast(err); }
  else if (a === 'bell') { const n = G.ringBell(0); toast(n ? 'The bell rings! ' + n + ' villagers run for shelter.' : 'No room to shelter: build a tower or Town Centre.'); panelKey = ''; }
  else if (a === 'allclear') { G.allClear(0); toast('All clear. Back to work.'); panelKey = ''; }
  else if (a === 'release') { const b = sel[0]; if (b && b.isBld) G.ungarrison(b); panelKey = ''; }
  else if (a === 'unload') { for (const g of selUnits()) if (g.cargo && g.cargo.length) G.orderLand(g, g.x, g.y); }
  else if (a === 'train') { const b = sel[0]; const err = b && b.isBld ? G.queueUnit(b, k) : 'Not available.'; if (err) toast(err); panelKey = ''; }
  else if (a === 'cancel') { const b = sel[0]; if (b && b.isBld) G.cancelQueue(b, +el.dataset.i); panelKey = ''; }
  else if (a === 'fmt') cycleFormation();
  else if (a === 'grpmake') makeGroup();
  else if (a === 'face') toggleFace();
  else if (a === 'btab') { buildTab = k; panelKey = ''; }
  else if (a === 'stance') cycleStance();
  else if (a === 'amove') { mode = mode && mode.kind === 'amove' ? null : { kind: 'amove' }; panelKey = ''; if (mode) toast('Tap where to attack-move.'); }
  else if (a === 'stop') stopSel();
  else if (a === 'desel') { select([]); mode = null; }
  else if (a === 'place-ok') { if (mode && mode.valid) tryPlace(false); else toast('Move the building to a green spot.'); }
  else if (a === 'place-cancel') { mode = null; panelKey = ''; }
  else if (a === 'selkind') select(selUnits().filter(u => u.kind === k));
  else if (a === 'tc') { const tc = G.buildings.find(b => b.team === 0 && b.kind === 'towncentre'); if (tc) { centerOn(tc.x, tc.y); select([tc]); } }
  else if (a === 'idle') cycleIdle();
  else if (a === 'army') selectArmy();
  else if (a === 'navy') selectNavy();
});

