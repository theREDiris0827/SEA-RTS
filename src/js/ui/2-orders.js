/* ---------------- selection and orders ---------------- */
function selUnits() { return sel.filter(o => o.isUnit && o.team === 0 && o.hp > 0 && !o.aboard); }
function select(list) { sel = list.filter(o => o && !(o.isUnit && UD[o.kind].nosel)); panelKey = ''; }
function addMarker(x, y, kind, o) { const t = o ? 1.3 : 0.7; markers.push({ x, y, kind, t, max: t, o }); }
function issue(wx, wy, hit) {
  const us = selUnits(); if (!us.length) return false;
  const amove = !!(mode && mode.kind === 'amove');
  const ids = us.map(u => u.id);
  G.command(ids, wx, wy, hit, { formation, amove });
  if (hit && hit.isUnit && hit.team !== 0) addMarker(hit.x, hit.y, 'attack');
  else if (hit && hit.isBld && hit.team === 1) addMarker(hit.x, hit.y, 'attack');
  else if (hit && (hit.isNode || (hit.isBld && FIELD[hit.kind]))) addMarker(hit.x, hit.y, 'gather', hit);
  else if (hit && hit.isBld && !hit.done) addMarker(hit.x, hit.y, 'build', hit);
  else if (hit && hit.kind === 'tradepost' && hit.team === 0) addMarker(hit.x, hit.y, 'gather', hit);
  else addMarker(wx, wy, amove ? 'attack' : 'move');
  if (amove) mode = null;
  panelKey = '';
  return true;
}
function canRally(b) { return b && b.isBld && b.team === 0 && b.done && BD[b.kind].train; }
function setRallyFor(b, wx, wy, hit) {
  const t = hit && (hit.isNode || (hit.kind === 'tradepost' && hit.team === 0 && b.kind === 'port')) ? hit : null;
  G.setRally(b, wx, wy, t);
  addMarker(t ? t.x : wx, t ? t.y : wy, 'gather');
}
function contextCommand(wx, wy) {
  const hit = G.pick(wx, wy);
  if (selUnits().length) { issue(wx, wy, hit); return; }
  if (sel.length === 1 && canRally(sel[0])) setRallyFor(sel[0], wx, wy, hit);
}
function selectSameKind(o) {
  const list = G.units.filter(u => u.team === 0 && u.kind === o.kind && u.hp > 0 && inView(u.x * TILE, u.y * TILE, -8));
  select(list.length ? list : [o]);
}
function placeAt(wx, wy) {
  const d = BD[mode.bkind];
  mode.tx = Math.round(wx - d.size / 2); mode.ty = Math.round(wy - (d.fh || d.size) / 2);
  if (d.site) { const v = nearestSite(wx, wy, 4); if (v) { mode.tx = v.site.tx; mode.ty = v.site.ty; } }
}
function nearestSite(wx, wy, maxD) {
  let best = null, bd = maxD;
  for (const v of G.villages) {
    if (v.post || !G.explored[(v.site.ty + 1) * W + v.site.tx + 1]) continue;
    const d = Math.hypot(v.site.tx + 1.5 - wx, v.site.ty + 1.5 - wy); if (d < bd) { bd = d; best = v; }
  }
  return best;
}
function tryPlace(keep) {
  if (!mode || mode.kind !== 'place' || mode.tx == null) return false;
  const ids = selUnits().filter(u => u.cls === 'vil').map(u => u.id);
  if (mode.line) {
    const r = G.placeLine(0, mode.bkind, mode.ax, mode.ay, mode.tx, mode.ty, ids);
    if (!r.ok) { toast(r.why); return false; }
    addMarker(r.b.x, r.b.y, 'build');
    if (keep && G.canAfford(0, BD[mode.bkind].cost)) { mode.anchored = false; mode.ax = mode.tx; mode.ay = mode.ty; } else mode = null;
    panelKey = ''; return true;
  }
  const r = G.placeBuilding(0, mode.bkind, mode.tx, mode.ty, ids);
  if (!r.ok) { toast(r.why); return false; }
  addMarker(r.b.x, r.b.y, 'build');
  if (keep && G.canAfford(0, BD[mode.bkind].cost)) { /* stay in placement */ } else mode = null;
  panelKey = ''; return true;
}
function startPlace(kind) {
  if (!selUnits().some(u => u.cls === 'vil')) { toast('Select a villager first.'); return; }
  const d = BD[kind];
  if (!G.canAfford(0, d.cost)) { toast('Not enough ' + (G.res[0].wood < (d.cost.wood || 0) ? 'wood' : 'resources') + '.'); return; }
  if (d.needs && !G.buildings.some(b => b.team === 0 && b.kind === d.needs && b.done && b.hp > 0)) { toast('Build a ' + civName(d.needs, 0) + ' first.'); return; }
  if (d.one && G.countOf(0, kind) > 0) { toast('You can only have one ' + civName(kind, 0) + '.'); return; }
  if (d.site) {
    const c = s2w(view.w / 2, view.h / 2), v = nearestSite(c.x, c.y, 999);
    if (!v) { toast('Explore the coast to find a neutral village with a free landing.'); return; }
    mode = { kind: 'place', bkind: kind, tx: v.site.tx, ty: v.site.ty, touch: !(hover && hover.mouse) };
    centerOn(v.site.tx + 1.5, v.site.ty + 1.5); panelKey = ''; return;
  }
  mode = { kind: 'place', bkind: kind, tx: null, ty: null, touch: !(hover && hover.mouse), line: !!d.line };
  if (hover && hover.mouse) placeAt(hover.wx, hover.wy); else { const c = s2w(view.w / 2, view.h * 0.4); placeAt(c.x, c.y); }
  // a gate starts on the nearest piece of your wall, where it is set into the line
  const wp = d.gate && nearWallPiece(mode.tx, mode.ty, 12);
  if (wp) { mode.tx = wp.tx; mode.ty = wp.ty; toast('Drag the gate onto any piece of your wall to set it in.'); }
  else { const spot = findSpot(kind, mode.tx, mode.ty); if (spot) { mode.tx = spot.tx; mode.ty = spot.ty; } }
  if (mode.line) {
    // start as a short line on touch screens so both ends show; with a mouse the first click sets the start
    mode.ax = mode.tx; mode.ay = mode.ty; mode.anchored = false;
    if (mode.touch) { let k = 0; while (k < 4 && G.canPlace(kind, mode.ax + k + 1, mode.ay, 0)) k++; mode.tx = mode.ax + k; }
  }
  panelKey = '';
}
function nearWallPiece(cx, cy, maxD) {
  let best = null, bd = maxD;
  for (const b of G.buildings) if (b.team === 0 && b.hp > 0 && BD[b.kind].wall && !BD[b.kind].gate && G.canPlace('gate', b.tx, b.ty, 0)) { const dd = Math.hypot(b.tx - cx, b.ty - cy); if (dd < bd) { bd = dd; best = b; } }
  return best;
}
function findSpot(kind, cx, cy) {
  const lim = kind === 'port' ? 26 : 10;
  for (let r = 0; r <= lim; r++)
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      if (G.canPlace(kind, cx + dx, cy + dy, 0)) return { tx: cx + dx, ty: cy + dy };
    }
  return null;
}
let rallyTap = null;
function clearRallyTap() { if (rallyTap) { clearTimeout(rallyTap.timer); rallyTap = null; } }
function handleTap(wx, wy, o) {
  if (mode && mode.kind === 'place') {
    const d = BD[mode.bkind];
    if (o.touch) {
      const B = placeButtons(), sp = w2s(wx, wy);
      if (B && Math.hypot(sp.x - B.ok.x, sp.y - B.ok.y) <= B.r + 6) { if (mode.valid) tryPlace(false); else toast('Move the building to a green spot.'); return; }
      if (B && Math.hypot(sp.x - B.no.x, sp.y - B.no.y) <= B.r + 6) { mode = null; panelKey = ''; return; }
      if (mode.line) {
        // a tap moves whichever end of the wall is nearer
        const nx = Math.floor(wx), ny = Math.floor(wy);
        if (Math.hypot(nx - mode.ax, ny - mode.ay) < Math.hypot(nx - mode.tx, ny - mode.ty)) { mode.ax = nx; mode.ay = ny; } else { mode.tx = nx; mode.ty = ny; }
        return;
      }
      const inside = mode.tx != null && wx >= mode.tx && wx < mode.tx + d.size && wy >= mode.ty && wy < mode.ty + (d.fh || d.size);
      if (!inside) placeAt(wx, wy);
    } else if (mode.line && !mode.anchored) { placeAt(wx, wy); mode.ax = mode.tx; mode.ay = mode.ty; mode.anchored = true; }
    else { placeAt(wx, wy); tryPlace(o.shift); }
    return;
  }
  const hit = G.pick(wx, wy), now = performance.now();
  if (hit && hit.isUnit && hit.team === 0 && lastTap.id === hit.id && now - lastTap.t < 420) { selectSameKind(hit); lastTap = { id: 0, t: 0 }; return; }
  lastTap = { id: hit ? hit.id : 0, t: now };
  if (mode && mode.kind === 'amove') { if (selUnits().length) { issue(wx, wy, hit); return; } mode = null; }
  if (!o.touch) {
    if (o.shift && hit && hit.isUnit && hit.team === 0) { const s = new Set(sel); s.has(hit) ? s.delete(hit) : s.add(hit); select([...s].filter(x => x.isUnit && x.team === 0)); return; }
    select(hit ? [hit] : []); return;
  }
  const us = selUnits(), single = sel.length === 1 ? sel[0] : null;
  if (us.length && !(single && single.isBld)) {
    if (hit && hit.isUnit && hit.team === 0 && !(UD[hit.kind].troops && us.some(u => u.layer === 0))) { select([hit]); return; }
    const hasVil = us.some(u => u.cls === 'vil');
    const trading = hit && hit.kind === 'tradepost' && hit.done && us.some(u => UD[u.kind].trader);
    if (hit && hit.isBld && hit.team === 0 && !trading && !(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse'))) { select([hit]); return; }
    issue(wx, wy, hit); return;
  }
  if (single && canRally(single)) {
    if (hit && hit.team === 0 && (hit.isUnit || hit.isBld)) { clearRallyTap(); select([hit]); return; }
    if (!hit || hit.isNode) {
      // one tap on the map deselects the building; a double tap sets its rally point
      if (rallyTap && rallyTap.b === single && now - rallyTap.t < 380 && Math.hypot(wx - rallyTap.wx, wy - rallyTap.wy) < 1.5) { clearRallyTap(); setRallyFor(single, wx, wy, hit); return; }
      clearRallyTap();
      rallyTap = { b: single, t: now, wx, wy, timer: setTimeout(() => { if (rallyTap && sel.length === 1 && sel[0] === rallyTap.b) select([]); rallyTap = null; }, 380) };
      return;
    }
  }
  select(hit ? [hit] : []);
}
function boxSelect(r, shift) {
  const a = s2w(r.x, r.y), b = s2w(r.x + r.w, r.y + r.h);
  const list = G.units.filter(u => u.team === 0 && u.hp > 0 && u.x >= a.x && u.x <= b.x && u.y - 0.3 >= a.y && u.y - 0.3 <= b.y);
  if (shift) { const s = new Set(sel.filter(o => o.isUnit && o.team === 0)); list.forEach(u => s.add(u)); select([...s]); }
  else if (list.length) select(list);
  else {
    const bl = G.buildings.filter(bb => bb.team === 0 && bb.x >= a.x && bb.x <= b.x && bb.y >= a.y && bb.y <= b.y);
    select(bl.length ? [bl[0]] : []);
  }
}
function idleVillagers() { return G.units.filter(u => u.team === 0 && u.kind === 'villager' && u.order.t === 'idle' && u.hp > 0); }
let idleIdx = 0;
function cycleIdle() {
  const l = idleVillagers(); if (!l.length) { toast('No idle villagers.'); return; }
  idleIdx = (idleIdx + 1) % l.length; const u = l[idleIdx]; select([u]); centerOn(u.x, u.y);
}
function selectArmy() {
  const l = G.units.filter(u => u.team === 0 && u.hp > 0 && u.cls !== 'vil' && u.layer !== 1);
  if (!l.length) { toast('You have no warriors yet. Build a Barracks.'); return; }
  select(l);
}
/* every warship (fishing boats and trade ships keep working) */
function selectNavy() {
  const l = G.units.filter(u => u.team === 0 && u.hp > 0 && u.cls === 'ship' && !UD[u.kind].trader && !UD[u.kind].nosel);
  if (!l.length) { toast('You have no warships yet. Build them at the Port.'); return; }
  select(l);
}

