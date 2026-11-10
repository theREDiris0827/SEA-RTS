/* ##### CHAPTER SCREEN 2 · Drawing the battlefield #####
   File: src/js/ui/02-drawing.js
   What it does: Draws ground, buildings, units, health bars, fire, arrows and the minimap every frame, sorted
   so nearer things cover farther ones.
   ############################################################################ */
/* ---------------- drawing ---------------- */
function ell(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.2832); }
// soft shadow under a unit
function shadow(x, y, rx, ry, a) { ctx.fillStyle = 'rgba(10,18,12,' + (a || 0.28) + ')'; ell(x, y, rx, ry); ctx.fill(); }
// health bar
function hpBar(x, y, w, frac, team) {
  ctx.fillStyle = '#17110c'; ctx.fillRect(x - 1, y - 1, w + 2, 5);
  ctx.fillStyle = frac > 0.6 ? '#5fd37a' : frac > 0.3 ? '#f2c94c' : '#e0524a'; ctx.fillRect(x, y, Math.max(1, w * frac), 3);
}
// is this selected?
function isSel(o) { return sel.indexOf(o) >= 0; }

// which tool a villager holds for its job
function toolFor(u) {
  const o = u.order;
  if (o.t === 'build' || o.t === 'repair') return 'hammer';
  if (o.t === 'gather') { const n = G.byId.get(o.id); if (!n) return 'hand'; return n.kind === 'tree' ? 'axe' : n.kind === 'gold' ? 'pick' : FIELD[n.kind] ? 'hoe' : 'hand'; }
  return 'hand';
}
// draw one unit
function paintUnit(u) {
  if (u.order.t === 'fishhouse' && u.working && !u.moving && G.byId.get(u.order.id) && G.byId.get(u.order.id).kind !== 'baray') return;   // drawn on her raft house's deck
  const px = u.x * TILE, py = u.y * TILE;
  const selected = isSel(u);
  if (u.layer === 1) {
    const bob = Math.sin(nowS * 3 + u.id) * 1.4, spr = shipSprite(u), an = shipAnchor(u.kind, u.team), rx = Math.max(15, spr.width * 0.34);
    ctx.strokeStyle = 'rgba(240,250,255,0.55)'; ctx.lineWidth = 1.5; ell(px, py + 1, rx, 5); ctx.stroke();
    if (u.moving) { ctx.strokeStyle = 'rgba(240,250,255,0.35)'; ell(px - u.face * rx * 0.6, py + 3, rx * 0.8, 4); ctx.stroke(); }
    if (selected) { ctx.strokeStyle = TEAMC[CV(u.team)].ring; ctx.lineWidth = 2; ell(px, py + 3, rx + 2, 7); ctx.stroke(); }
    ctx.save(); ctx.translate(px, py + bob); if (u.face < 0) ctx.scale(-1, 1); ctx.drawImage(spr, -an[0], -an[1]); ctx.restore();
    if (u.hit > 0) { ctx.save(); ctx.globalAlpha = 0.5; ctx.translate(px, py + bob); if (u.face < 0) ctx.scale(-1, 1); ctx.drawImage(whiteOf(spr), -an[0], -an[1]); ctx.restore(); }
    if (u.cargo && u.cargo.length) {
      const n = u.cargo.length, x0 = px - n * 4;
      for (let i = 0; i < n; i++) { ctx.fillStyle = '#17110c'; ctx.fillRect(x0 + i * 8, py - an[1] - 6, 7, 8); ctx.fillStyle = SKIN; ctx.fillRect(x0 + i * 8 + 1, py - an[1] - 3, 5, 4); ctx.fillStyle = TEAMC[CV(u.team)].main; ctx.fillRect(x0 + i * 8 + 1, py - an[1] - 5, 5, 2); }
    }
    if (u.carry.amt > 0) { ctx.fillStyle = '#17110c'; ctx.fillRect(px - 4, py - an[1] - 8, 8, 8); ctx.fillStyle = RESCOL[u.carry.type]; ctx.fillRect(px - 3, py - an[1] - 7, 6, 6); }
    if (selected || u.hp < u.maxHp || settings.bars === 'always') { const hw = Math.max(20, rx * 1.2); hpBar(px - hw / 2, py - an[1] - 12, hw, u.hp / u.maxHp); }
    return;
  }
  if (u.kind === 'deer') {
    const spr = deerSprite(u.moving ? Math.floor(u.anim * 6) % 2 : 0);
    shadow(px, py + 4, 9, 3);
    if (selected) { ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5; ell(px, py + 4, 11, 5); ctx.stroke(); }
    ctx.save(); ctx.translate(px, py); if (u.face < 0) ctx.scale(-1, 1); ctx.drawImage(spr, -18, -26); ctx.restore();
    if (u.hp < u.maxHp || settings.bars === 'always') hpBar(px - 8, py - 30, 16, u.hp / u.maxHp);
    return;
  }
  let anim = 'idle', f = 0, tool = '';
  const fighting = u.order.t === 'attack';
  const torch = torchFor(u);
  if (torch) { anim = 'idle'; f = 0; }
  else if (u.atkT > 0 && u.cls === 'healer') { anim = 'attack'; f = u.atkT > 0.3 ? 0 : u.atkT > 0.15 ? 1 : 2; }
  else if (u.atkT > 0 && u.cls !== 'vil') { anim = 'attack'; f = u.ranged ? 1 : (u.atkT > 0.18 ? 1 : 2); }
  else if (u.ranged && fighting && u.cd > 0 && u.cd < 0.35) { anim = 'attack'; f = 0; }
  else if (u.moving) { anim = 'walk'; f = Math.floor(u.anim * 9) % 4; }
  else if (u.working) { anim = 'work'; f = Math.floor(u.anim * 3.5) % 2; tool = toolFor(u); }
  const spr = unitSprite(u.kind, u.team, anim, f, tool);
  shadow(px, py + 3, 7, 3);
  if (selected) { ctx.strokeStyle = TEAMC[CV(u.team)].ring; ctx.lineWidth = 1.6; ell(px, py + 3, 10, 5); ctx.stroke(); }
  ctx.save(); ctx.translate(px, py); if (u.face < 0) ctx.scale(-1, 1); ctx.drawImage(spr, -(spr.width >> 1), 5 - spr.height);
  if (u.hit > 0) { ctx.globalAlpha = 0.55; ctx.drawImage(whiteOf(spr), -(spr.width >> 1), 5 - spr.height); }
  if (torch) paintTorch(u, spr);
  ctx.restore();
  if (u.stance === 'hold' && u.team === 0) { const ty = py - spr.height - 4; ctx.fillStyle = '#1a120c'; ctx.fillRect(px + 3, ty - 1, 9, 7); ctx.fillRect(px + 3, ty, 2, 12); ctx.fillStyle = '#6e4626'; ctx.fillRect(px + 3.5, ty, 1, 11); ctx.fillStyle = '#f2c94c'; ctx.fillRect(px + 4.5, ty, 6.5, 5); ctx.fillStyle = '#fff0a0'; ctx.fillRect(px + 4.5, ty, 6.5, 1); }   // on Hold: a small flag
  if (u.carry.amt > 0) { ctx.fillStyle = '#17110c'; ctx.fillRect(px + 2, py - 34, 8, 8); ctx.fillStyle = RESCOL[u.carry.type]; ctx.fillRect(px + 3, py - 33, 6, 6); }
  if (selected || u.hp < u.maxHp || settings.bars === 'always') hpBar(px - 8, py - 6 - spr.height, 16, u.hp / u.maxHp);
}
/* foot soldiers burn buildings with an obor (torch) rather than hacking at them with their weapons (lore/siege.md) */
function torchFor(u) {
  if (u.ranged || u.moving || u.order.t !== 'attack' || !(u.cls === 'sword' || u.cls === 'spear' || u.cls === 'elite') || UD[u.kind].big) return false;
  const t = G.byId.get(u.order.id);
  return !!(t && t.isBld && t.hp > 0 && t.team !== u.team && t.team !== 2 && !BD[t.kind].neutral && rectDist(u.x, u.y, t.rect) < 1.6);
}
// draw the obor torch pose
function paintTorch(u, spr) {
  // drawn in the unit's own frame (already flipped to face the building): the obor is held out in front and thrust in on each blow
  const thrust = u.atkT > 0 ? Math.round(Math.min(1, u.atkT / 0.14) * 5) : 0;
  const hx = 8 + thrust, hy = 5 - Math.round(spr.height * 0.42);
  ctx.fillStyle = '#17110c'; ctx.fillRect(hx - 2, hy - 11, 5, 16);
  ctx.fillStyle = '#7a4a22'; ctx.fillRect(hx - 1, hy - 10, 3, 15);
  ctx.fillStyle = '#5a3418'; ctx.fillRect(hx + 1, hy - 10, 1, 15);
  ctx.fillStyle = '#c9a060'; ctx.fillRect(hx - 2, hy - 12, 5, 3);   // oiled rag binding
  const fl = Math.floor(nowS * 10 + u.id) % 3, fh = 10 + fl * 2;
  ctx.fillStyle = '#17110c'; ctx.fillRect(hx - 4, hy - 12 - fh, 9, fh + 1);
  ctx.fillStyle = '#c23a1a'; ctx.fillRect(hx - 3, hy - 12 - fh, 7, fh);
  ctx.fillStyle = '#f08a24'; ctx.fillRect(hx - 2, hy - 12 - fh + 3, 5, fh - 3);
  ctx.fillStyle = '#ffe27a'; ctx.fillRect(hx - 1, hy - 12 - fh + 6 + (fl === 1 ? 1 : 0), 3, fh - 7);
  ctx.fillStyle = '#f08a24'; ctx.fillRect(hx + (fl === 0 ? 2 : fl === 1 ? -2 : 0), hy - 15 - fh, 2, 3);
  if (thrust) { ctx.fillStyle = '#ffe27a'; for (let i = 0; i < 4; i++) ctx.fillRect(hx + 6 + i * 2, hy - 14 - fh + ((i * 5 + fl * 3) % 11), 1, 1); }
}
// draw a resource
function paintNode(n) {
  const px = n.tx * TILE, py = n.ty * TILE;
  if (n.kind === 'tree') {
    const spr = treeSprite(n.v); shadow(px + 16, py + 28, 11, 4, 0.25);
    ctx.drawImage(spr, px + 16 - spr.width / 2, py + 31 - spr.height);
  } else if (n.kind === 'berry') {
    shadow(px + 16, py + 27, 12, 4, 0.25); ctx.drawImage(bushSprite(), px, py + 6);
  } else if (n.kind === 'gold') {
    shadow(px + 16, py + 27, 12, 4, 0.25); ctx.drawImage(goldSprite(), px, py + 6);
  } else if (n.kind === 'fish') {
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ell(px + 16, py + 17, 13, 6); ctx.fill();
    for (let i = 0; i < 4; i++) {
      const a = nowS * 1.1 + i * 1.6, fx = px + 16 + Math.cos(a) * 8, fy = py + 16 + Math.sin(a * 1.3) * 5, dir = Math.sin(a) > 0 ? 1 : -1;
      ctx.fillStyle = '#e4f4fa'; ctx.fillRect(fx - 3, fy - 1, 6, 3); ctx.fillStyle = '#9fd0e0'; ctx.fillRect(fx - dir * 4, fy - 2, 2, 5);
      ctx.fillStyle = '#17110c'; ctx.fillRect(fx + dir * 2, fy - 1, 1, 1);
    }
  } else if (n.kind === 'carcass') {
    ctx.drawImage(carcassSprite(), n.x * TILE - 18, n.y * TILE - 20);
  }
  if (isSel(n)) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(px + 2, py + 2, 28, 28); }
}
/* which sides of a wall tile join another wall piece of the same side; gates open when their own people are close */
let wallGrid = null;
// map of where wall pieces are
function buildWallGrid() {
  if (!wallGrid) wallGrid = new Int32Array(W * H);
  wallGrid.fill(0);
  for (const b of G.buildings) if (b.hp > 0 && BD[b.kind].wall) wallGrid[b.ty * W + b.tx] = b.team + 1;
}
// which neighbours a wall piece joins
function wallMask(b) {
  const at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && wallGrid[y * W + x] === b.team + 1;
  let m = (at(b.tx, b.ty - 1) ? 1 : 0) | (at(b.tx + 1, b.ty) ? 2 : 0) | (at(b.tx, b.ty + 1) ? 4 : 0) | (at(b.tx - 1, b.ty) ? 8 : 0);
  if (BD[b.kind].gate && b.done && !b.locked && G.units.some(u => u.team === b.team && u.hp > 0 && u.layer === 0 && Math.abs(u.x - b.x) < 1.6 && Math.abs(u.y - b.y) < 1.6)) m |= 16;
  return m;
}
// which way a raft house leans to the water
function raftSide(b) {
  if (b.wd) return b.wd;
  let sx = 0, sy = 0;
  for (let y = b.ty - 1; y <= b.ty + b.size; y++) for (let x = b.tx - 1; x <= b.tx + b.size; x++) if (G.isWater(x, y)) { sx += x + 0.5 - b.x; sy += y + 0.5 - b.y; }
  const l = Math.hypot(sx, sy) || 1; return (b.wd = { x: sx / l, y: sy / l });
}
// draw a raft house
function paintRaftHouse(b) {
  const d = b.float ? { x: 0, y: 0 } : raftSide(b), spr = buildingSprite(b.kind, b.team, 2), w = b.size * TILE;
  const cx = b.x * TILE + d.x * 12, by = b.ty * TILE + w + Math.max(0, d.y) * 12;
  if (b.float) {
    // moored out on the river: mooring poles and a bamboo gangway to the bank
    if (!b.gw) { let sx = 0, sy = 0; for (let y = b.ty - 1; y <= b.ty + 2; y++) for (let x = b.tx - 1; x <= b.tx + 2; x++) if (G.inb(x, y) && !G.isWater(x, y)) { sx += x + 0.5 - b.x; sy += y + 0.5 - b.y; } b.gw = Math.abs(sx) >= Math.abs(sy) ? { x: Math.sign(sx) || -1, y: 0 } : { x: 0, y: Math.sign(sy) }; }
    const g = b.gw, mx = b.x * TILE, my = (b.ty + 1.5) * TILE;
    ctx.fillStyle = '#5a3a1e';
    if (g.x) { const x0 = g.x < 0 ? mx - w / 2 - 14 : mx + w / 2 - 6; ctx.fillRect(x0, my - 4, 20, 9); ctx.fillStyle = '#a07a44'; for (let i = 0; i < 5; i++) ctx.fillRect(x0 + 1 + i * 4, my - 3, 3, 7); }
    else { const y0 = g.y < 0 ? b.ty * TILE - 6 : (b.ty + 2) * TILE - 6; ctx.fillRect(mx - 5, y0, 10, 20); ctx.fillStyle = '#a07a44'; for (let i = 0; i < 5; i++) ctx.fillRect(mx - 4, y0 + 1 + i * 4, 8, 3); }
    ctx.fillStyle = '#3a2416'; for (const [px, py] of [[-w / 2 + 2, -w + 10], [w / 2 - 5, -w + 10], [-w / 2 + 2, -6], [w / 2 - 5, -6]]) ctx.fillRect(mx + px, by + py - 6, 3, 18);
  }
  // ripples where the floats meet the water
  ctx.strokeStyle = 'rgba(235,248,255,0.45)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 2; i++) { const p = ((nowS * 0.5 + i * 0.5) % 1); ctx.globalAlpha = 1 - p; ell(cx, by - 6, 30 + p * 8, 6 + p * 3); ctx.stroke(); }
  ctx.globalAlpha = 1;
  shadow(cx, by - 6, 30, 6, 0.22);
  ctx.save(); ctx.translate(cx, by - spr.height + 2 + Math.sin(nowS * 1.6 + b.id) * 0.8);
  if (d.x < -0.2) ctx.scale(-1, 1);
  ctx.drawImage(spr, -spr.width / 2, 0);
  if (b.hit > 0) { ctx.globalAlpha = 0.4; ctx.drawImage(whiteOf(spr), -spr.width / 2, 0); }
  ctx.restore();
  const fu = G.units.find(u => u.hp > 0 && u.order.t === 'fishhouse' && u.order.id === b.id && u.working && !u.moving);
  if (fu) paintFisher(fu, cx, by - spr.height + 2, d.x < -0.2 ? -1 : 1);
  if (isSel(b)) { const px = b.tx * TILE, py = b.ty * TILE; ctx.strokeStyle = TEAMC[CV(b.team)].ring; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(px - 1, py - 1, w + 2, w + 2); ctx.setLineDash([]); }
}
// draw the woman fishing from a raft house
function paintFisher(u, x0, y0, f) {
  // she sits at the end of the veranda deck, rod out over the water
  const t = nowS + u.id, px = x0 + f * 17, py = y0 + 55;
  const spr = unitSprite(u.kind, u.team, 'idle', 0, '');
  ctx.save(); ctx.translate(px, py); if (f < 0) ctx.scale(-1, 1); ctx.drawImage(spr, -(spr.width >> 1), 5 - spr.height); ctx.restore();
  const sway = Math.sin(t * 1.3) * 1.5, tipX = px + f * 18, tipY = py - 22 + sway, fx = px + f * 26, fy = py + 14 + Math.sin(t * 2.4) * 1.2;
  ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px + f * 3, py - 9); ctx.lineTo(tipX, tipY); ctx.stroke();
  ctx.strokeStyle = 'rgba(240,240,230,0.75)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(fx, fy); ctx.stroke();
  ctx.fillStyle = '#e8463a'; ctx.fillRect(fx - 1.5, fy - 2, 3, 3);
  const p = (t * 0.7) % 1; ctx.strokeStyle = 'rgba(235,248,255,' + (0.6 * (1 - p)).toFixed(2) + ')'; ctx.lineWidth = 1; ell(fx, fy + 1, 3 + p * 6, 1.5 + p * 2.5); ctx.stroke();
  const c = (u.gt || 0) / 10; if (c > 0.8) { const q = (c - 0.8) / 0.2; ctx.fillStyle = '#d8e4ea'; ctx.fillRect(fx - 3, fy - 4 - q * 12, 6, 3); ctx.fillStyle = '#8fa4b0'; ctx.fillRect(fx + 2, fy - 4 - q * 12, 2, 3); }
}
// draw one building with fire, flags and bars
function paintBuilding(b) {
  if (b.kind === 'rafthouse' && b.done) { paintRaftHouse(b); return; }
  const bh = b.h || b.size, px = b.tx * TILE, py = (b.ty + bh - b.size) * TILE, size = b.size, w = size * TILE, flat = FIELD[b.kind];
  let lvl = 2; if (flat) { const f = b.food / BD[b.kind].food; lvl = !b.done ? 0 : f > 0.66 ? 2 : f > 0.33 ? 1 : 0; }
  if (BD[b.kind].wall) lvl = 100 + wallMask(b) + (G.teamAge(b.team) >= 3 ? 32 : 0) + (b.locked ? 64 : 0);
  const spr = buildingSprite(b.kind, b.team, lvl);
  const dx = px + (w - spr.width) / 2, dy = flat ? py : py + w - spr.height + 2;
  if (!flat) shadow(px + w / 2, py + w - 6, w * 0.46, w * 0.2, 0.26);
  if (b.done || flat) {
    if (flat && !b.done) ctx.globalAlpha = 0.35 + 0.4 * b.progress;
    ctx.drawImage(spr, dx, dy);
    ctx.globalAlpha = 1;
    if (flat && !b.done) hpBar(px + 4, py + w + 2, w - 8, b.progress);
    if (b.hit > 0) { ctx.globalAlpha = 0.4; ctx.drawImage(whiteOf(spr), dx, dy); ctx.globalAlpha = 1; }
  } else {
    ctx.fillStyle = 'rgba(70,46,24,0.55)'; ctx.fillRect(px + 2, py + w - 12, w - 4, 10);
    const vh = Math.max(6, Math.floor(spr.height * (0.1 + 0.9 * b.progress)));
    ctx.globalAlpha = 0.9; ctx.drawImage(spr, 0, spr.height - vh, spr.width, vh, dx, dy + spr.height - vh, spr.width, vh); ctx.globalAlpha = 1;
    ctx.strokeStyle = '#5e3b1c'; ctx.lineWidth = 2;
    const top = Math.max(py + w - spr.height * (0.1 + 0.9 * b.progress) - 8, py - 4);
    ctx.beginPath(); ctx.moveTo(px + 4, py + w - 4); ctx.lineTo(px + 4, top + 6); ctx.moveTo(px + w - 4, py + w - 4); ctx.lineTo(px + w - 4, top + 6);
    ctx.moveTo(px + 4, top + 6); ctx.lineTo(px + w - 4, top + 6); ctx.moveTo(px + 4, py + w - 4); ctx.lineTo(px + w - 4, top + 6); ctx.stroke();
    hpBar(px + 4, py + w + 2, w - 8, b.progress);
  }
  if (isSel(b)) {
    ctx.strokeStyle = TEAMC[CV(b.team)].ring; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(px - 1, b.ty * TILE - 1, w + 2, bh * TILE + 2); ctx.setLineDash([]);
  }
  if (b.done && (isSel(b) || b.hp < b.maxHp)) hpBar(px + w * 0.15, flat ? py - 4 : dy + 2, w * 0.7, b.hp / b.maxHp);
}
// draw effects (corpses, sparks)
function paintFx(f) {
  if (f.k === 'corpse' && UD[f.kind] && UD[f.kind].layer) {
    const spr = shipSprite(f), an = shipAnchor(f.kind, f.team), p = 1 - f.t / f.max;
    ctx.save(); ctx.globalAlpha = Math.min(1, f.t / 1.5) * 0.85; ctx.translate(f.x * TILE, f.y * TILE + p * 14); ctx.rotate((f.face || 1) * p * 0.35);
    ctx.beginPath(); ctx.rect(-an[0], -an[1], spr.width, an[1] - p * an[1] * 0.6); ctx.clip(); ctx.drawImage(spr, -an[0], -an[1]); ctx.restore();
    return;
  }
  if (f.k === 'corpse') {
    if (f.kind === 'deer') return;
    const spr = unitSprite(f.kind, f.team, 'idle', 1, ''), a = Math.min(1, f.t / 1.2);
    ctx.save(); ctx.globalAlpha = a * 0.9; ctx.translate(f.x * TILE, f.y * TILE + 6); ctx.rotate((f.face || 1) * 1.45);
    ctx.drawImage(spr, -(spr.width >> 1), 12 - spr.height); ctx.restore();
  } else if (f.k === 'rubble') {
    const spr = rubbleSprite(f.size); ctx.save(); ctx.globalAlpha = Math.min(1, f.t / 2.5);
    ctx.drawImage(spr, f.x * TILE - spr.width / 2, f.y * TILE - spr.height / 2 + 4); ctx.restore();
  }
}
// draw top-layer effects (gun flashes)
function paintTop(f) {
  if (f.sub === 'flash') {
    // a bright pixel burst pointing out of the barrel
    const p = 1 - f.t / f.max, x = Math.round(f.x * TILE), y = Math.round(f.y * TILE - 8), s = f.big ? 2 : 1, dir = f.face || 1;
    ctx.globalAlpha = 1 - p * 0.6;
    ctx.fillStyle = '#ffb030'; ctx.fillRect(x - 2 * s, y - 2 * s, 4 * s, 4 * s);
    ctx.fillRect(x + dir * 2 * s - (dir < 0 ? 5 * s : 0), y - s, 5 * s, 2 * s);
    ctx.fillStyle = '#fff6c0'; ctx.fillRect(x - s, y - s, 2 * s, 2 * s); ctx.fillRect(x + dir * 2 * s - (dir < 0 ? 3 * s : 0), y - Math.ceil(s / 2), 3 * s, s);
    ctx.fillStyle = '#ffdc60'; ctx.fillRect(x - s, y - 4 * s, s, 2 * s); ctx.fillRect(x - s, y + 2 * s, s, 2 * s);
    ctx.globalAlpha = 1;
    return;
  }
  if (f.sub === 'gun') {
    // black-powder smoke is thick and pale: it billows forward and drifts up as it thins
    const p = 1 - f.t / f.max, x = (f.x + (f.vx || 0) * p) * TILE, y = f.y * TILE - 8 + f.vy * p * 30, s = Math.round((f.big ? 7 : 5) + p * (f.big ? 16 : 10));
    ctx.fillStyle = 'rgba(226,222,212,' + (0.85 * (1 - p)).toFixed(2) + ')'; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
    ctx.fillStyle = 'rgba(255,255,250,' + (0.4 * (1 - p)).toFixed(2) + ')'; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.ceil(s / 2), Math.ceil(s / 2));
    return;
  }
  if (f.k === 'spark') {
    const p = 1 - f.t / f.max, x = f.x * TILE, y = f.y * TILE - 10;
    ctx.fillStyle = '#fff3b0'; for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.6; ctx.fillRect(x + Math.cos(a) * p * 10, y + Math.sin(a) * p * 10, 2, 2); }
  } else if (f.k === 'heal') {
    const p = 1 - f.t / f.max, x = f.x * TILE, y = f.y * TILE - 6 - p * 14;
    ctx.globalAlpha = 1 - p; ctx.fillStyle = '#8fd06a'; ctx.fillRect(x - 1, y - 4, 3, 9); ctx.fillRect(x - 4, y - 1, 9, 3); ctx.globalAlpha = 1;
  } else if (f.k === 'fire') {
    const p = 1 - f.t / f.max, x = f.x * TILE, y = f.y * TILE - 6, s = 10 + p * 34;
    ctx.fillStyle = 'rgba(246,179,58,' + (0.75 * (1 - p)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(x, y, s, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(226,86,44,' + (0.6 * (1 - p)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(x, y, s * 0.6, 0, 6.2832); ctx.fill();
  } else if (f.k === 'flame') {
    // a building or ship on fire: small flickering tongues, more of them per stacked fire
    const p = 1 - f.t / f.max, x = f.x * TILE, y = f.y * TILE - 4 - p * 10;
    ctx.globalAlpha = 1 - p;
    for (let i = 0; i < f.n; i++) { const ox = (i - (f.n - 1) / 2) * 7; ctx.fillStyle = '#e2562c'; ctx.fillRect(x + ox - 3, y - 6, 6, 8); ctx.fillStyle = '#f6b33a'; ctx.fillRect(x + ox - 2, y - 3, 4, 5); }
    ctx.globalAlpha = 1;
  } else if (f.k === 'splash') {
    const p = 1 - f.t / f.max, x = f.x * TILE, y = f.y * TILE;
    ctx.globalAlpha = 1 - p; ctx.fillStyle = '#e8f4fb'; ctx.fillRect(x - 2, y - 4 - p * 10, 4, 6 + p * 6); ctx.fillRect(x - 7, y - p * 5, 3, 3); ctx.fillRect(x + 5, y - p * 5, 3, 3); ctx.globalAlpha = 1;
  } else if (f.k === 'smoke') {
    const p = 1 - f.t / f.max, x = f.x * TILE, y = f.y * TILE + f.vy * p * 40;
    ctx.fillStyle = 'rgba(80,76,70,' + (0.55 * (1 - p)).toFixed(2) + ')'; const s = 5 + p * 9; ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }
}
// draw arrows and bullets in flight
function drawArrow(a) {
  if (a.k === 'bullet' || a.k === 'ball') {
    const p = a.t / a.dur, lift = a.k === 'ball' ? Math.sin(p * Math.PI) * 0.5 : 0;
    const x = (a.x0 + (a.x1 - a.x0) * p) * TILE, y = (a.y0 + (a.y1 - a.y0) * p - lift) * TILE - 8;
    if (a.k === 'bullet') {
      // a hot lead ball with a short tracer streak behind it
      const d = Math.hypot(a.x1 - a.x0, a.y1 - a.y0) || 1, ux = (a.x1 - a.x0) / d, uy = (a.y1 - a.y0) / d;
      ctx.fillStyle = 'rgba(255,214,120,0.55)';
      for (let i = 1; i <= 3; i++) ctx.fillRect(Math.round(x - ux * i * 3) - 1, Math.round(y - uy * i * 3) - 1, 2, 2);
      ctx.fillStyle = '#fff4c8'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
      ctx.fillStyle = '#3a3a3a'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    } else {
      // an iron or stone ball with a smoke trail
      ctx.fillStyle = 'rgba(200,196,186,0.45)';
      for (let i = 1; i <= 3; i++) { const q = Math.max(0, p - i * 0.06), tx = (a.x0 + (a.x1 - a.x0) * q) * TILE, ty = (a.y0 + (a.y1 - a.y0) * q - Math.sin(q * Math.PI) * 0.5) * TILE - 8; ctx.fillRect(Math.round(tx) - 2, Math.round(ty) - 2, 4, 4); }
      ctx.fillStyle = '#1e1e22'; ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
      ctx.fillStyle = '#5a5a62'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 2, 2);
    }
    return;
  }
  const p = a.t / a.dur, x = a.x0 + (a.x1 - a.x0) * p, y = a.y0 + (a.y1 - a.y0) * p - Math.sin(p * Math.PI) * 0.9;
  const ang = Math.atan2((a.y1 - a.y0) - Math.cos(p * Math.PI) * 0.9 * Math.PI * 0.3, a.x1 - a.x0);
  ctx.save(); ctx.translate(x * TILE, y * TILE - 8); ctx.rotate(ang);
  if (a.k === 'ball') { ctx.fillStyle = '#1c1a18'; ctx.fillRect(-3, -3, 6, 6); ctx.fillStyle = '#6a625a'; ctx.fillRect(-2, -2, 2, 2); }
  else if (a.k === 'shot') { ctx.fillStyle = '#2a2622'; ctx.fillRect(-2, -1, 3, 3); ctx.fillStyle = 'rgba(200,196,188,.6)'; ctx.fillRect(-7, 0, 5, 1); }
  else { ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-5, -1, 10, 2); ctx.fillStyle = a.k === 'fire' ? '#f6b33a' : '#e8eef4'; ctx.fillRect(5, -1, 2, 2); if (a.k === 'fire') { ctx.fillStyle = '#e2562c'; ctx.fillRect(6, -2, 3, 4); } }
  ctx.restore();
}
/* where a unit is headed for its job (gather / build / hunt target), if anywhere */
function jobTarget(u) {
  const o = u.order;
  if (o.t === 'gather' || o.t === 'build' || (o.t === 'attack' && o.hunt)) { const t = G.byId.get(o.id); return t && t.hp > 0 ? t : null; }
  return null;
}
// ring around a target
function targetRing(t, col, grow, alpha) {
  const big = t.isBld ? t.size * 0.62 : 0.62, x = t.x * TILE, y = (t.isBld ? t.y + (FIELD[t.kind] ? 0 : t.size * 0.32) : t.y + 0.3) * TILE;
  ctx.strokeStyle = col; ctx.globalAlpha = alpha; ctx.lineWidth = 2;
  ell(x, y, big * TILE * grow, big * TILE * 0.5 * grow); ctx.stroke(); ctx.globalAlpha = 1;
}
// dashed trail from selected workers to their job
function paintJobs() {
  // selected workers: a dashed trail to the job they are walking to, and a ring on everything they are working on
  const done = new Set();
  for (const u of selUnits()) {
    const t = jobTarget(u); if (!t) continue;
    const col = u.order.t === 'build' ? '#9be3ff' : '#f2c94c';
    if (u.moving && Math.hypot(t.x - u.x, t.y - u.y) > 1.2) {
      ctx.strokeStyle = col; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]); ctx.lineDashOffset = -nowS * 14;
      ctx.beginPath(); ctx.moveTo(u.x * TILE, u.y * TILE); ctx.lineTo(t.x * TILE, t.y * TILE); ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.globalAlpha = 1;
    }
    if (!done.has(t)) { done.add(t); targetRing(t, col, 1, 0.7); }
  }
}
// tap markers on the ground
function paintMarkers() {
  paintJobs();
  for (const m of markers) {
    if (m.o) {
      // target flash: two expanding rings and the resource popping up above it
      const p = 1 - m.t / m.max, col = m.kind === 'build' ? '#9be3ff' : '#f2c94c';
      targetRing(m.o, col, 0.8 + (p * 2 % 1) * 0.7, 1 - (p * 2 % 1));
      if (m.o.hp > 0 && m.kind === 'gather') {
        const ty = (m.o.isBld ? m.o.ty : m.o.ty - (m.o.kind === 'tree' ? 1.1 : 0.2)) * TILE - p * 10;
        ctx.globalAlpha = Math.min(1, (1 - p) * 2.5); ctx.drawImage(iconSprite(m.o.type || 'food'), m.o.x * TILE - 8, ty - 8, 16, 16); ctx.globalAlpha = 1;
      }
      continue;
    }
    const p = 1 - m.t / m.max, x = m.x * TILE, y = m.y * TILE + 4;
    ctx.strokeStyle = m.kind === 'attack' ? '#ff6a5a' : m.kind === 'gather' ? '#f2c94c' : m.kind === 'build' ? '#9be3ff' : '#ffffff';
    ctx.globalAlpha = 1 - p; ctx.lineWidth = 2; ell(x, y, 5 + p * 12, 2.5 + p * 6); ctx.stroke(); ctx.globalAlpha = 1;
  }
}
// the building ghost while placing
function paintPlacement() {
  if (!mode || mode.kind !== 'place') return;
  const d = BD[mode.bkind];
  if (mode.tx == null) return;
  if (mode.line) { paintLinePlacement(d); return; }
  const tx = mode.tx, ty = mode.ty;
  const dh = d.fh || d.size, raftHere = mode.bkind === 'house' && G.houseKind(0, tx, ty) === 'rafthouse';
  for (let y = ty; y < ty + dh; y++) for (let x = tx; x < tx + d.size; x++) {
    const ok = (G.freeTile(x, y) || G.wetOk(mode.bkind, x, y) || (raftHere && G.isWater(x, y) && !G.block[y * W + x])) && G.explored[y * W + x];
    ctx.fillStyle = ok ? 'rgba(90,255,150,0.38)' : 'rgba(255,80,70,0.45)'; ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
  }
  const valid = G.canPlace(mode.bkind, tx, ty, 0); mode.valid = valid;
  const raft = mode.bkind === 'house' && G.houseKind(0, tx, ty) === 'rafthouse';
  const spr = buildingSprite(raft ? 'rafthouse' : mode.bkind, 0, 2), w = d.size * TILE, px = tx * TILE, py = ty * TILE;
  ctx.globalAlpha = valid ? 0.72 : 0.4;
  ctx.drawImage(spr, px + (w - spr.width) / 2, d.walk ? py : py + dh * TILE - spr.height + 2); ctx.globalAlpha = 1;
  ctx.strokeStyle = valid ? '#7dffa8' : '#ff7a6b'; ctx.lineWidth = 2; ctx.strokeRect(px, py, w, dh * TILE);
}

/* a wall line: every tile green (new), grey (already walled) or red (blocked), with the count and cost by its end */
function paintLinePlacement(d) {
  const tiles = G.lineTiles(mode.ax, mode.ay, mode.tx, mode.ty), inLine = new Set(tiles.map(([x, y]) => y * W + x));
  let n = 0;
  for (const [x, y] of tiles) {
    const own = G.wallPieceAt(x, y, 0), ok = !own && G.canPlace(mode.bkind, x, y, 0);
    if (ok) n++;
    ctx.fillStyle = own ? 'rgba(255,255,255,0.18)' : ok ? 'rgba(90,255,150,0.38)' : 'rgba(255,80,70,0.45)'; ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    if (!ok) continue;
    const join = (xx, yy) => inLine.has(yy * W + xx) || (xx >= 0 && yy >= 0 && xx < W && yy < H && wallGrid && wallGrid[yy * W + xx] === 1);
    const m = (join(x, y - 1) ? 1 : 0) | (join(x + 1, y) ? 2 : 0) | (join(x, y + 1) ? 4 : 0) | (join(x - 1, y) ? 8 : 0);
    const spr = buildingSprite(mode.bkind, 0, 100 + m + (G.teamAge(0) >= 3 ? 32 : 0));
    ctx.globalAlpha = 0.72; ctx.drawImage(spr, x * TILE, y * TILE + TILE - spr.height + 2); ctx.globalAlpha = 1;
  }
  const afford = Math.min(n, ...Object.keys(d.cost).map(k => Math.floor(G.res[0][k] / d.cost[k])));
  mode.valid = n > 0 && afford > 0; mode.n = n;
  if (mode.touch) for (const [x, y] of [[mode.ax, mode.ay], [mode.tx, mode.ty]]) {
    ctx.beginPath(); ctx.arc(x * TILE + 16, y * TILE + 16, 9, 0, 6.2832); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
  }
  const cost = Object.keys(d.cost).map(k => d.cost[k] * n + ' ' + k).join(', ');
  const label = n ? n + ' \u00d7 ' + civName(mode.bkind, 0).split(' (')[0] + ': ' + cost + (afford < n ? ' (can afford ' + afford + ')' : '') : 'Nothing to build here';
  ctx.font = 'bold ' + Math.round(13 / view.zoom) + 'px sans-serif'; const tw = ctx.measureText(label).width, lx = mode.tx * TILE + 16 - tw / 2, ly = mode.ty * TILE - 30, fh = 13 / view.zoom;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = 'rgba(20,12,6,0.8)'; ctx.fillRect(lx - 6, ly - fh, tw + 12, fh * 1.45); ctx.fillStyle = afford < n ? '#ffb0a0' : '#fbe3a5'; ctx.fillText(label, lx, ly);
}
/* touch placement: a ✓ (build) and ✗ (cancel) button under the ghost; their screen spots are kept for hit tests */
function placeButtons() {
  if (!mode || mode.kind !== 'place' || !mode.touch || mode.tx == null) return null;
  const d = BD[mode.bkind], c = w2s(mode.tx + d.size / 2, mode.ty + (d.fh || d.size));
  const y = clamp(c.y + 30, 30, view.h - 30), x = clamp(c.x, 50, view.w - 50);
  return { ok: { x: x - 30, y }, no: { x: x + 30, y }, r: 22 };
}
// the Place/Cancel buttons on the ghost
function paintPlaceButtons() {
  const B = placeButtons(); if (!B) return;
  for (const k of ['ok', 'no']) {
    const b = B[k], on = k === 'no' || mode.valid;
    ctx.beginPath(); ctx.arc(b.x, b.y + 2, B.r, 0, 6.2832); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
    ctx.beginPath(); ctx.arc(b.x, b.y, B.r, 0, 6.2832);
    ctx.fillStyle = k === 'ok' ? (on ? '#1e6b42' : '#3a4a42') : '#7a2620'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = k === 'ok' ? (on ? '#7dffa8' : '#6b7a72') : '#ff8a7a'; ctx.stroke();
    ctx.globalAlpha = on ? 1 : 0.45; ctx.drawImage(iconSprite(k === 'ok' ? 'check' : 'x'), b.x - 12, b.y - 12, 24, 24); ctx.globalAlpha = 1;
  }
}
// draw the whole frame
function render() {
  const sc = view.zoom * view.dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0b1612'; ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.setTransform(sc, 0, 0, sc, -cam.x * sc, -cam.y * sc); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(terrainC, 0, 0);
  const x0 = Math.max(0, Math.floor(cam.x / TILE) - 1), x1 = Math.min(W - 1, Math.ceil((cam.x + view.w / view.zoom) / TILE) + 1);
  const y0 = Math.max(0, Math.floor(cam.y / TILE) - 1), y1 = Math.min(H - 1, Math.ceil((cam.y + view.h / view.zoom) / TILE) + 1);
  // water sparkle
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const t = G.terrain[ty * W + tx]; if (t !== T.SHALLOW && t !== T.DEEP) continue;
    const h = hash2(tx, ty, 42), ph = (nowS * 0.8 + h * 7) % 2;
    if (ph < 0.6) ctx.fillRect(tx * TILE + Math.floor(h * 22) + 3, ty * TILE + Math.floor(hash2(tx, ty, 43) * 24) + 4, 4, 2);
  }
  const tall = [];
  const expl = (x, y) => G.explored[Math.floor(y) * W + Math.floor(x)];
  buildWallGrid();
  for (const b of G.buildings) {
    if (!inView(b.x * TILE, b.y * TILE, 160)) continue;
    if (b.team !== 0 && !expl(b.x, b.y)) continue;
    if (FIELD[b.kind]) paintBuilding(b); else tall.push({ y: (b.ty + (b.h || b.size)) * TILE, t: 0, o: b });
  }
  for (const v of G.villages) if (!v.post && expl(v.site.tx + 1.5, v.site.ty + 1.5)) { const spr = CIVB.neutralSite('landing'); ctx.drawImage(spr, v.site.tx * TILE + (96 - spr.width) / 2, (v.site.ty + 3) * TILE - spr.height + 2); }
  for (const f of G.fx) if ((f.k === 'corpse' || f.k === 'rubble') && inView(f.x * TILE, f.y * TILE, 100)) paintFx(f);
  for (const n of G.nodes) {
    const px = n.tx * TILE, py = n.ty * TILE;
    if (!inView(px, py, 60) || !expl(n.x, n.y)) continue;
    if (n.kind === 'fish' || n.kind === 'carcass') paintNode(n); else tall.push({ y: py + 32, t: 1, o: n });
  }
  for (const u of G.units) {
    const px = u.x * TILE, py = u.y * TILE;
    if (!inView(px, py, 50)) continue;
    if (u.team !== 0 && !G.isVisible(u.x, u.y)) continue;
    tall.push({ y: u.wallow ? u.wallow : py + (u.layer === 1 ? 4 : 3), t: 2, o: u });
  }
  tall.sort((a, b) => a.y - b.y);
  for (const e of tall) { if (e.t === 0) paintBuilding(e.o); else if (e.t === 1) paintNode(e.o); else paintUnit(e.o); }
  // rally flag of the selected building
  if (sel.length === 1 && sel[0].isBld && sel[0].team === 0 && sel[0].rally) {
    const r = sel[0].rally, t = r.id ? G.byId.get(r.id) : r;
    if (t) {
      const rx = t.x * TILE, ry = t.y * TILE;
      ctx.strokeStyle = 'rgba(242,201,76,0.6)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(sel[0].x * TILE, sel[0].y * TILE); ctx.lineTo(rx, ry); ctx.stroke(); ctx.setLineDash([]);
      ctx.drawImage(iconSprite('flag'), rx - 8, ry - 30);
    }
  }
  paintPlacement(); paintMarkers();
  for (const a of G.arrows) drawArrow(a);
  for (const f of G.fx) if ((f.k === 'spark' || f.k === 'smoke' || f.k === 'fire' || f.k === 'heal' || f.k === 'flame' || f.k === 'splash') && inView(f.x * TILE, f.y * TILE, 60)) paintTop(f);
  ctx.font = '700 13px "Barlow Semi Condensed", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  for (const fl of G.floaters) {
    const p = 1 - fl.t / 1.1, x = fl.x * TILE, y = fl.y * TILE - p * 16;
    ctx.globalAlpha = Math.min(1, fl.t * 2.2); ctx.strokeStyle = '#10201a'; ctx.strokeText(fl.text, x, y); ctx.fillStyle = RESCOL[fl.type] || '#fff'; ctx.fillText(fl.text, x, y); ctx.globalAlpha = 1;
  }
  // fog of war, softened by smooth upscaling
  refreshFog(); ctx.imageSmoothingEnabled = true; ctx.drawImage(fogC, 0, 0, W * TILE, H * TILE); ctx.imageSmoothingEnabled = false;
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  paintPlaceButtons();
  if (typeof paintAim === 'function') paintAim();
  if (boxRect) {
    const r = boxRect; ctx.fillStyle = 'rgba(125,255,168,0.14)'; ctx.strokeStyle = '#7dffa8'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]);
    ctx.fillRect(r.x, r.y, r.w, r.h); ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.setLineDash([]);
  }
}

// draw the minimap
function drawMini() {
  const S = 2;
  mctx.imageSmoothingEnabled = false; mctx.drawImage(miniBase, 0, 0, W * S, H * S);
  for (const n of G.nodes) {
    if (!G.explored[n.ty * W + n.tx] || n.kind === 'fish' || n.kind === 'carcass') continue;
    mctx.fillStyle = n.kind === 'tree' ? '#2f6a34' : n.kind === 'gold' ? '#f2c94c' : '#d6303a'; mctx.fillRect(n.tx * S, n.ty * S, S, S);
  }
  for (const b of G.buildings) {
    if (b.team !== 0 && !G.explored[Math.floor(b.y) * W + Math.floor(b.x)]) continue;
    mctx.fillStyle = b.team === 2 ? '#d8d0b8' : MINIC[CV(b.team)][0]; mctx.fillRect(b.tx * S, b.ty * S, b.size * S, (b.h || b.size) * S);
    mctx.strokeStyle = '#10201a'; mctx.lineWidth = 1; mctx.strokeRect(b.tx * S + 0.5, b.ty * S + 0.5, b.size * S - 1, (b.h || b.size) * S - 1);
  }
  for (const u of G.units) {
    if (u.team === 2) continue; if (u.team === 1 && !G.isVisible(u.x, u.y)) continue;
    mctx.fillStyle = (MINIC[CV(u.team)] || MINIC[2])[1]; mctx.fillRect(Math.floor(u.x * S) - 1, Math.floor(u.y * S) - 1, 3, 3);
  }
  mctx.globalAlpha = 0.9; mctx.imageSmoothingEnabled = true; mctx.drawImage(fogC, 0, 0, W * S, H * S); mctx.globalAlpha = 1;
  mctx.strokeStyle = '#ffffff'; mctx.lineWidth = 1;
  mctx.strokeRect(cam.x / TILE * S + 0.5, cam.y / TILE * S + 0.5, view.w / view.zoom / TILE * S, view.h / view.zoom / TILE * S);
  for (const a of G.alerts) {
    const p = 1 - a.t / 3; mctx.strokeStyle = 'rgba(255,90,74,' + (1 - p).toFixed(2) + ')'; mctx.lineWidth = 2;
    mctx.beginPath(); mctx.arc(a.x * S, a.y * S, 3 + p * 12, 0, 6.2832); mctx.stroke();
  }
}

