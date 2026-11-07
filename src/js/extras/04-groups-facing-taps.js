/* ##### CHAPTER EXTRA 4 · Groups, facing and taps #####
   File: src/js/extras/04-groups-facing-taps.js
   What it does: group tabs 1-4 and Make group, the Face button, soldiers facing their move direction, one-tap orders with two-finger deselect (or double-tap orders).
   Things you can tweak:
     - TAP_MODE: 'single' (one tap orders) or 'double'; players switch it in Settings > Orders on touch (saved as seak-tapmode).
   ############################################################################ */
/* ===== features.js: unit groups (bookmark tabs), the Face button, facing after a move, double tap to deselect =====
   Proposed for the main game (Iylia, 2026-11-03). build.py also patches groupMove, the pointer code,
   the paint loop and the unit panel so these hooks are called. Charge archers was tried and dropped (Iylia: keep the micro). */

/* ---------- facing: soldiers turn to their move's direction (or the aimed arrow) once they stop ---------- */
const _fUpdateUnit = Game.prototype.updateUnit;
Game.prototype.updateUnit = function (u, dt) {
  _fUpdateUnit.call(this, u, dt);
  if (!u.isUnit || u.hp <= 0) return;
  const t = u.order.t;
  if (u.endFace && (t === 'gather' || t === 'build' || t === 'repair' || t === 'board')) u.endFace = 0;
  if (u.endFace && !u.moving && !(u.atkT > 0) && (t === 'idle' || (t === 'move' && !u.path))) u.face = u.endFace;
};

/* ---------- hold and drag to aim ---------- */
var aim = null;
function aimable(wx, wy) {
  if (!selUnits().some(u => u.cls !== 'vil' && u.layer !== 1)) return false;
  const hit = G.pick(wx, wy);
  return !hit || (hit.isNode && hit.kind !== 'tree' && hit.kind !== 'gold');
}
function startAim(p) {
  const w = s2w(p.sx, p.sy);
  if (!aimable(w.x, w.y) || (mode && mode.kind === 'place')) return false;
  gest.type = 'aim'; aim = { x: w.x, y: w.y, ex: w.x, ey: w.y };
  if (p.type !== 'mouse') { const q = s2w(p.x, p.y); aim.ex = q.x; aim.ey = q.y; }
  if (navigator.vibrate) { try { navigator.vibrate(15); } catch (_) { /* ignore */ } }
  return true;
}
// touch orders. Default 'single': a tap on the ground or an enemy gives the order (the selection stays),
// a two-finger tap anywhere deselects. Option 'double': one tap only selects or deselects, orders need a
// double tap (the first tap changes the selection at once; the second brings it back and gives the order).
// Attack and Face modes act on one tap either way.
let TAP_MODE = 'single';
try { const v = localStorage.getItem('seak-tapmode'); if (v === 'double' || v === 'single') TAP_MODE = v; } catch (_) { /* ignore */ }
function setTapMode(m) { TAP_MODE = m; try { localStorage.setItem('seak-tapmode', m); } catch (_) { /* ignore */ } }
function twoFingerTap(g) {
  if (!g || !g.t0 || performance.now() - g.t0 > 350) return;
  if (Math.abs(view.zoom - g.z0) > 0.04 || Math.hypot(cam.x - g.c0[0], cam.y - g.c0[1]) > 12) return;
  if (mode) { mode = null; panelKey = ''; }
  if (sel.length) { select([]); toast('Deselected.'); }
}
let pendTap = null;
const DT_MS = 380, DT_R = 1.3;
const _fTap = handleTap;
handleTap = function (wx, wy, o) {
  if (TAP_MODE !== 'double' || !o || !o.touch || mode) { pendTap = null; return _fTap.apply(this, arguments); }
  const now = performance.now();
  if (pendTap && now - pendTap.t < DT_MS && Math.hypot(wx - pendTap.wx, wy - pendTap.wy) < DT_R) {
    const prev = pendTap.sel.filter(u => u.hp > 0); pendTap = null;
    if (prev.length) { select(prev); lastTap = { id: 0, t: 0 }; return _fTap.apply(this, arguments); }
  }
  const us = selUnits(), hit = G.pick(wx, wy);
  if (us.length && !(sel.length === 1 && sel[0].isBld)) {
    if (hit && hit.isUnit && hit.team === 0) { pendTap = null; return _fTap.apply(this, arguments); }   // own unit: select it (double tap = all of that kind)
    pendTap = { t: now, wx, wy, sel: us.slice() };
    select(hit ? [hit] : []); return;
  }
  pendTap = null;
  return _fTap.apply(this, arguments);
};
// the Face button: press where the soldiers should stand, drag to face, let go
function faceSoldiers() { return selUnits().filter(u => u.cls !== 'vil' && u.layer !== 1); }
function toggleFace() {
  if (mode && mode.kind === 'face') { mode = null; panelKey = ''; return; }
  if (!faceSoldiers().length) return;
  mode = { kind: 'face' }; panelKey = '';
}
function faceAim(p, e) {
  if (!mode || mode.kind !== 'face' || (p.type === 'mouse' && e.button !== 0)) return false;
  if (!faceSoldiers().length) { mode = null; return false; }
  const w = s2w(p.sx, p.sy);
  gest = { type: 'aim', p }; aim = { x: w.x, y: w.y, ex: w.x, ey: w.y, face: true };
  return true;
}
let FACE_ICON = null;
// pixel icon: a turning arrow around the spot where the soldiers stand
function faceIcon() {
  if (FACE_ICON) return FACE_ICON;
  const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d');
  const cells = [], head = [];
  for (let j = 0; j < 12; j++) for (let i = 0; i < 12; i++) {
    const dx = i - 5.5, dy = j - 5.5, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx) * 180 / Math.PI;
    if (d >= 3.4 && d <= 4.9 && !(a > -75 && a < 0)) cells.push([i, j]);
  }
  // arrowhead at the end of the arc (top), pointing right
  for (const [i, j] of [[7, 0], [7, 1], [8, 1], [7, 2], [8, 2], [9, 2], [7, 3], [8, 3], [7, 4]]) head.push([i, j]);
  const dot = [[5, 5], [6, 5], [5, 6], [6, 6]];
  const all = cells.concat(head, dot);
  x.fillStyle = '#3a2a10'; for (const [i, j] of all) x.fillRect(i * 2 - 1, j * 2 - 1, 4, 4);
  x.fillStyle = '#f2c94c'; for (const [i, j] of cells.concat(head)) x.fillRect(i * 2, j * 2, 2, 2);
  x.fillStyle = '#ffffff'; for (const [i, j] of dot) x.fillRect(i * 2, j * 2, 2, 2);
  return (FACE_ICON = c.toDataURL());
}
// while Face is on, the hint bar says what to do (instead of a label on the map)
const _faceHint = hintText;
hintText = function () {
  if (mode && mode.kind === 'face') return aim ? 'Drag the way they should face, then let go.' : 'Face: press where they should stand, then drag the way to face.';
  return _faceHint.apply(this, arguments);
};
function aimMove(q) { if (!aim) return; const w = s2w(q.x, q.y); aim.ex = w.x; aim.ey = w.y; }
function aimDir() { if (!aim) return null; const dx = aim.ex - aim.x, dy = aim.ey - aim.y; return Math.hypot(dx, dy) < 0.7 ? null : [dx, dy]; }
function aimEnd() {
  const a = aim; aim = null; if (!a) return;
  const us = selUnits(); if (!us.length) return;
  const dir = Math.hypot(a.ex - a.x, a.ey - a.y) >= 0.7 ? [a.ex - a.x, a.ey - a.y] : null;
  if (a.face) { mode = null; panelKey = ''; }
  if (!dir) { issue(a.x, a.y, null); return; }
  const amove = !a.face && !!(mode && mode.kind === 'amove');
  G.command(us.map(u => u.id), a.x, a.y, null, { formation, amove, dir });
  addMarker(a.x, a.y, amove ? 'attack' : 'move');
  if (amove) mode = null;
  panelKey = '';
}
function paintAim() {
  const S = (x, y) => [(x * TILE - cam.x) * view.zoom, (y * TILE - cam.y) * view.zoom];
  if (!aim) {
    // Face mode waiting for a press: a ring under the selected soldiers and a hint
    if (!mode || mode.kind !== 'face') return;
    const us = faceSoldiers(); if (!us.length) { mode = null; panelKey = ''; return; }
    let cx = 0, cy = 0; for (const u of us) { cx += u.x; cy += u.y; } cx /= us.length; cy /= us.length;
    const [mx, my] = S(cx, cy), r = Math.max(22, Math.sqrt(us.length) * 0.6 * TILE * view.zoom);
    ctx.save(); ctx.strokeStyle = '#f2c94c'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -performance.now() / 60;
    ctx.beginPath(); ctx.arc(mx, my, r, 0, 7); ctx.stroke(); ctx.restore();
    return;
  }
  const dir = aimDir(), [ax, ay] = S(aim.x, aim.y);
  // ghost spots: where each soldier will stand
  if (dir) {
    const out = []; G.groupMove(selUnits(), aim.x, aim.y, { formation, dir, out });
    ctx.save(); ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5;
    for (const o of out) { const [sx, sy] = S(o.x, o.y); ctx.fillStyle = 'rgba(242,201,76,0.3)'; ctx.strokeStyle = '#f2c94c'; ctx.beginPath(); ctx.ellipse(sx, sy + 3 * view.zoom, 9 * view.zoom, 4.5 * view.zoom, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    const [bx, by] = S(aim.ex, aim.ey), ang = Math.atan2(by - ay, bx - ax);
    for (const [col, w] of [['#3a2a10', 9], ['#f2c94c', 5]]) {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      const h = w + 9; ctx.beginPath(); ctx.moveTo(bx + Math.cos(ang) * (w / 2 + 3), by + Math.sin(ang) * (w / 2 + 3));
      ctx.lineTo(bx + Math.cos(ang + 2.5) * h, by + Math.sin(ang + 2.5) * h); ctx.lineTo(bx + Math.cos(ang - 2.5) * h, by + Math.sin(ang - 2.5) * h); ctx.fill();
    }
  }
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(ax, ay, 8, 0, 7); ctx.stroke();
}

/* ---------- unit groups (1 to 4) ---------- */
const GROUPS = [[], [], [], []];
function groupUnits(i) { return GROUPS[i].map(id => G.byId.get(id)).filter(u => u && u.hp > 0 && u.team === 0); }
function soldiersSel() { return selUnits().filter(u => u.cls !== 'vil'); }
function grpPanelButtons() {
  const us = soldiersSel(); if (!us.length) return '';
  let s = '<button class="cmd" data-a="grpmake" title="Save these units as a group (or tap an empty tab above)"><img alt="" src="' + unitIcon(us[0].kind, 0) + '"><span class="nm">Make group</span><span class="ct">&nbsp;</span></button>';
  if (us.some(u => u.layer !== 1)) s += '<button class="cmd' + (mode && mode.kind === 'face' ? ' on' : '') + '" data-a="face" title="Press where they should stand, then drag to face"><img alt="" src="' + faceIcon() + '"><span class="nm">Face</span><span class="ct">&nbsp;</span></button>';
  return s;
}
function saveGroup(i, add) {
  const us = selUnits(); if (!us.length) { toast('Select some units first.'); return; }
  const ids = new Set(add ? groupUnits(i).map(u => u.id) : []); for (const u of us) ids.add(u.id);
  // a unit belongs to one group at a time
  for (let j = 0; j < 4; j++) if (j !== i) GROUPS[j] = GROUPS[j].filter(id => !ids.has(id));
  GROUPS[i] = [...ids]; toast((add ? 'Added to group ' : 'Saved as group ') + (i + 1) + '.'); updateGroupBar(true);
}
function makeGroup() {
  let i = GROUPS.findIndex((g, j) => !groupUnits(j).length);
  if (i < 0) { toast('All 4 groups are in use. Hold a tab to replace it.'); return; }
  saveGroup(i, false); panelKey = '';
}
function pickGroup(i) {
  const us = groupUnits(i);
  if (!us.length) { if (selUnits().length) saveGroup(i, false); else toast('Select units, then tap this tab to make group ' + (i + 1) + '.'); return; }
  const same = sel.length === us.length && us.every(u => sel.includes(u));
  if (same) { let x = 0, y = 0; for (const u of us) { x += u.x; y += u.y; } centerOn(x / us.length, y / us.length); }
  else select(us);
}
let grpEl = null, grpMenu = null, grpSig = '';
const tabCss = document.createElement('style');
tabCss.textContent = `
#grps { position: fixed; z-index: 4; display: flex; gap: 4px; align-items: flex-end; pointer-events: none; }
#grps .grp { pointer-events: auto; position: relative; width: 62px; height: 32px; padding: 0 6px 0 4px; display: flex; align-items: center; gap: 3px;
  background: var(--panel); border: 2px solid var(--edge-dark); border-bottom: 0; border-radius: 8px 8px 0 0; box-shadow: inset 0 2px 0 var(--edge); color: #fff4dc; touch-action: none; }
#grps .grp img { width: 22px; height: 22px; image-rendering: pixelated; }
#grps .grp b { font: 700 13px var(--font-num, sans-serif); margin-left: auto; }
#grps .grp i { font-style: normal; font: 700 12px var(--font-num, sans-serif); width: 17px; height: 17px; border-radius: 9px; background: #c83a30; color: #fff; display: grid; place-items: center; flex: none; }
#grps .grp.empty { opacity: .55; justify-content: flex-start; } #grps .grp.empty b { margin-left: 4px; font-size: 16px; color: var(--muted); }
#grps .grp.on { height: 38px; box-shadow: inset 0 2px 0 var(--gold); border-color: var(--gold); }
#grps .grp.on i { background: var(--gold); color: #3a2a10; }
#btn-zin, #btn-zout { display: none !important; }`;
document.head.appendChild(tabCss);
function updateGroupBar(force) {
  // the groups are bookmark tabs on the top edge of the action panel
  if (!grpEl) { grpEl = document.createElement('div'); grpEl.id = 'grps'; document.body.appendChild(grpEl); }
  const panel = document.getElementById('panel');
  if (typeof G === 'undefined' || !G || !panel || !started) { grpEl.hidden = true; return; }
  const r = panel.getBoundingClientRect(); grpEl.hidden = r.height < 10;
  grpEl.style.left = (r.left + 10) + 'px'; grpEl.style.bottom = (innerHeight - r.top - 2) + 'px';
  const parts = GROUPS.map((g, i) => { const us = groupUnits(i); if (!us.length) return [i, null, 0, false]; const cnt = {}; for (const u of us) cnt[u.kind] = (cnt[u.kind] || 0) + 1; const k = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0]; return [i, k, us.length, us.every(u => sel.includes(u)) && sel.length === us.length]; });
  const sig = JSON.stringify(parts); if (sig === grpSig && !force) return; grpSig = sig;
  grpEl.innerHTML = parts.map(([i, k, n, on]) => k
    ? '<button class="grp' + (on ? ' on' : '') + '" data-g="' + i + '" aria-label="Group ' + (i + 1) + '"><i>' + (i + 1) + '</i><img alt="" src="' + unitIcon(k, 0) + '"><b>' + n + '</b></button>'
    : '<button class="grp empty" data-g="' + i + '" aria-label="Empty group ' + (i + 1) + '"><i>' + (i + 1) + '</i><b>+</b></button>').join('');
}
setInterval(() => { if (typeof started !== 'undefined' && started) updateGroupBar(false); }, 250);
function closeGrpMenu() { if (grpMenu) { grpMenu.remove(); grpMenu = null; } }
function openGrpMenu(i, btn) {
  closeGrpMenu(); const r = btn.getBoundingClientRect();
  grpMenu = document.createElement('div');
  grpMenu.style.cssText = 'position:fixed;z-index:50;left:' + Math.min(r.left, innerWidth - 200) + 'px;bottom:' + (innerHeight - r.top + 8) + 'px;display:flex;flex-direction:column;gap:6px;padding:8px;background:var(--panel);border:2px solid var(--edge-dark);box-shadow:inset 0 0 0 2px var(--edge),0 3px 0 rgba(0,0,0,.45)';
  const b = (t, f) => { const e = document.createElement('button'); e.className = 'cmd'; e.style.cssText = 'width:auto;min-width:170px;height:40px;min-height:0;padding:0 10px;display:flex;align-items:center;justify-content:flex-start'; e.innerHTML = '<span class="nm" style="font-size:14px">' + t + '</span>'; e.onclick = (ev) => { ev.stopPropagation(); f(); closeGrpMenu(); }; grpMenu.appendChild(e); };
  b('Group ' + (i + 1) + ': add selected', () => saveGroup(i, true));
  b('Replace with selected', () => saveGroup(i, false));
  b('Clear group ' + (i + 1), () => { GROUPS[i] = []; updateGroupBar(true); });
  document.body.appendChild(grpMenu);
  setTimeout(() => document.addEventListener('pointerdown', function off(ev) { if (grpMenu && !grpMenu.contains(ev.target)) { closeGrpMenu(); document.removeEventListener('pointerdown', off, true); } }, true), 0);
}
document.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest && e.target.closest('.grp'); if (!btn) return;
  e.preventDefault(); const i = +btn.dataset.g; let held = false;
  const t = setTimeout(() => { if (!groupUnits(i).length) return; held = true; openGrpMenu(i, btn); }, 550);
  const up = () => { clearTimeout(t); btn.removeEventListener('pointerup', up); btn.removeEventListener('pointerleave', up); if (!held) pickGroup(i); updateGroupBar(true); };
  btn.addEventListener('pointerup', up); btn.addEventListener('pointerleave', () => clearTimeout(t), { once: true });
});
document.addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest('.grp')) e.preventDefault(); });
window.addEventListener('keydown', (e) => {
  if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (typeof started === 'undefined' || !started || paused) return;
  const n = '1234'.indexOf(e.key); if (n < 0) return;
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) saveGroup(n, e.shiftKey); else pickGroup(n);
});

