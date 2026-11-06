/* ===== campaign-dress/dress.js ===== */
/* Campaign map dressing for mission pages: props, ground detail and ambient life from the art book
   (unit-art/campaign-props/src, wrapped as PROPSET by the page's build.py). Looks only: nothing here
   blocks movement, can be selected, or changes the rules.
   The page calls campaignDress(x0, x1, y0, y1) from render(), just before buildings and units are drawn.
   Placement is automatic, from what stands on the map (houses, farms, granaries, ports, palaces, shores),
   plus an optional hand-placed list in DRESS_ITEMS: [kind, tx, ty, frame] (props) or [mobKind, tx, ty, 'm'] (life).
   Kept tight (Iylia, 2026-11-01): ambient people and animals only appear if the page bundles mobs.js
   (DRESS_LIFE = True in its build.py); otherwise a few props sit by key buildings and the ground stays calm. */
const CDRESS = { g: null, props: [], decals: [], mobs: [], lastT: 0 };
function cdBuild(g) {
  const D = CDRESS, t = g.terrain; D.g = g; D.props = []; D.decals = []; D.mobs = [];
  const land = (x, y) => g.inb(x, y) && (t[y * W + x] === T.GRASS || t[y * W + x] === T.DIRT || t[y * W + x] === T.SAND);
  const free = (x, y) => land(x, y) && !g.block[y * W + x] && !(g.reserve && g.reserve[y * W + x] && t[y * W + x] === T.DIRT);
  const taken = new Set();
  const near = (x, y, r, ok) => {
    for (let k = 0; k < 40; k++) {
      const a = hash2(Math.floor(x * 7) + k, Math.floor(y * 3), 5) * 6.283, d = k === 0 ? 0 : 0.6 + hash2(Math.floor(x) + k, Math.floor(y * 11), 6) * r;
      const px = Math.floor(x + Math.cos(a) * d), py = Math.floor(y + Math.sin(a) * d);
      if ((ok || free)(px, py) && !taken.has(py * W + px)) { taken.add(py * W + px); return [px + 0.5, py + 0.6]; }
    }
    return null;
  };
  const P = (kind, x, y, f, anchor) => { const p = near(x, y, 2.2); if (p) D.props.push({ kind, x: p[0], y: p[1], f: f || 0, b: anchor || null }); };
  const mob = (kind, x, y, r, anchor) => {
    if (!PROPSET.MOBS.length) return;
    const p = near(x, y, 2); if (!p) return;
    D.mobs.push({ kind, x: p[0], y: p[1], hx: p[0], hy: p[1], r: r || 2.5, tx: p[0], ty: p[1], wait: hash2(Math.floor(x * 3), Math.floor(y * 5), 9) * 3, f: 0, dir: 1, ft: 0, b: anchor || null });
  };
  const yard = ['banana', 'jars', 'ricemat', 'banana', 'banana', 'well'];
  let n = 0;
  for (const b of g.buildings) {
    if (b.hp <= 0) continue;
    const h = hash2(b.tx, b.ty, 61), cx = b.tx + b.size / 2, cy = b.ty + (b.h || b.size) / 2, by = b.ty + (b.h || b.size);
    n++;
    if (b.kind === 'house') {
      if (h < 0.25) P(yard[Math.floor(h * 97) % yard.length], b.tx + (h < 0.32 ? b.size + 0.4 : -0.6), by - 0.3, n % 3, b);
      if (h > 0.72) mob(['chicken', 'child', 'chicken', 'goat', 'dog'][(b.tx + b.ty) % 5], cx, by + 0.8, 2, b);
    } else if (b.kind === 'granary') { if (h < 0.5) P('ricemat', b.tx + b.size + 0.5, by - 0.4, 0, b); }
    else if (b.kind === 'farm' || b.kind === 'sawah') { if (h < 0.45) mob(h < 0.2 ? 'buffalo' : 'egret', cx, cy, 2.5); }
    else if (b.kind === 'port' || b.kind === 'tradepost') { P('crates', b.tx - 0.5, by, 0, b); }
    else if (b.kind === 'store') { P('crates', b.tx + b.size + 0.4, by - 0.4, 0, b); }
    else if (b.kind === 'palace' || b.kind === 'towncentre' || b.kind === 'bendahari') {
      P('lantern', b.tx - 0.4, by, 0, b); P('lantern', b.tx + b.size + 0.4, by, 1, b);
    }
  }
  // the shore: nets, driftwood, a fisherman; a kelong and leaping fish out on the water
  let shoreN = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (t[y * W + x] !== T.SAND || g.block[y * W + x]) continue;
    const h = hash2(x, y, 83);
    if (h < 0.012) { D.props.push({ kind: h < 0.007 ? 'nets' : 'driftwood', x: x + 0.5, y: y + 0.7, f: 0 }); shoreN++; }
    else if (h > 0.985) mob('fisher', x + 0.5, y + 0.5, 1.2);
  }
  for (let i = 0, k = 0; i < 400 && k < 1; i++) {
    const x = 2 + Math.floor(hash2(i, 1, 84) * (W - 4)), y = 2 + Math.floor(hash2(i, 2, 84) * (H - 4));
    if (t[y * W + x] !== T.DEEP || g.block[y * W + x]) continue;
    let shore = 99; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) if (land(x + dx, y + dy)) shore = Math.min(shore, Math.hypot(dx, dy));
    if (shore < 3 || shore > 6) continue;
    D.props.push({ kind: 'kelong', x: x + 0.5, y: y + 0.7, f: 0, water: true }); k++;
  }
  // macaques and a few goats at the forest edge
  for (let i = 0, k = 0; i < 600 && k < 4; i++) {
    const nd = g.nodes[Math.floor(hash2(i, 3, 85) * g.nodes.length)]; if (!nd || nd.kind !== 'tree') continue;
    if (!free(nd.tx + 1, nd.ty) && !free(nd.tx, nd.ty + 1)) continue;
    mob(k % 2 ? 'goat' : 'monkey', nd.tx + 1, nd.ty + 0.5, 2); k++;
  }
  // greenery on open grass, clear of buildings and walls: bamboo, banana, nipa, ferns, the odd log or rock
  const green = ['bamboo', 'banana', 'fern', 'bamboo', 'nipa', 'banana', 'log', 'rock'];
  // not inside a walled town: the streets stay clear
  const walls = g.buildings.filter(b => b.kind === 'wall' || b.kind === 'gate' || b.kind === 'cwall');
  const wb = walls.length > 8 ? walls.reduce((r, b) => [Math.min(r[0], b.tx), Math.min(r[1], b.ty), Math.max(r[2], b.tx), Math.max(r[3], b.ty)], [W, H, 0, 0]) : null;
  const walled = (x, y) => wb && x >= wb[0] && x <= wb[2] && y >= wb[1] && y <= wb[3];
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    if (t[y * W + x] !== T.GRASS) continue;
    const h = hash2(x, y, 91); if (h > 0.09) continue;
    let clear = true; for (let dy = -1; dy <= 1 && clear; dy++) for (let dx = -1; dx <= 1; dx++) if (g.block[(y + dy) * W + x + dx]) { clear = false; break; }
    if (!clear || walled(x, y) || taken.has(y * W + x)) continue;
    let kind = green[Math.floor(hash2(x, y, 92) * green.length)];
    if (kind === 'nipa' && !(g.isWater(x + 2, y) || g.isWater(x - 2, y) || g.isWater(x, y + 2) || g.isWater(x, y - 2))) kind = 'bamboo';
    taken.add(y * W + x); D.props.push({ kind, x: x + 0.5, y: y + 0.7, f: 0 });
  }
  // the page's own hand-placed items
  for (const it of (typeof DRESS_ITEMS !== 'undefined' ? DRESS_ITEMS : [])) {
    if (it[3] === 'm') mob(it[0], it[1], it[2], it[4] || 2.5); else P(it[0], it[1], it[2], it[3] || 0);
  }
  // ground: tufts and flowers on grass, stones and ruts on dirt
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (g.block[y * W + x]) continue;
    const v = t[y * W + x], h = hash2(x, y, 77);
    if (v === T.GRASS && h < 0.16) D.decals.push({ kind: h < 0.11 ? 'tuft' : h < 0.14 ? 'flowers' : 'fern', x: x + 0.2 + hash2(x, y, 78) * 0.6, y: y + 0.3 + hash2(x, y, 79) * 0.6 });
    else if (v === T.DIRT && h < 0.02) D.decals.push({ kind: h < 0.012 ? 'stones' : 'ruts', x: x + 0.5, y: y + 0.6 });
  }
}
function cdFrames(kind) { const e = PROPSET.PROPS.find(p => p[0] === kind); return e ? e[6] : 1; }
function cdDraw(spr, x, y, flip) {
  const px = Math.round(x * TILE - spr.width / 2), py = Math.round(y * TILE - spr.height + 6);
  if (!flip) { ctx.drawImage(spr, px, py); return; }
  ctx.save(); ctx.translate(px + spr.width, py); ctx.scale(-1, 1); ctx.drawImage(spr, 0, 0); ctx.restore();
}
// animals and townsfolk wander near home and scatter from soldiers on the move or from the enemy
function cdUpdate(g, dt) {
  for (const m of CDRESS.mobs) {
    if (m.b && m.b.hp <= 0) { m.gone = true; continue; }
    m.ft += dt;
    let fear = null, fd = m.kind === 'egret' ? 3.5 : 3;
    for (const u of g.units) {
      if (u.hp <= 0 || u.layer !== 0 || u.cls === 'vil' || u.kind === 'deer' || u.team === 2) continue;
      const d = Math.hypot(u.x - m.x, u.y - m.y); if (d < fd && (u.team !== 0 || u.moving)) { fd = d; fear = u; }
    }
    let spd = 0.7;
    if (fear) { const a = Math.atan2(m.y - fear.y, m.x - fear.x); m.tx = m.x + Math.cos(a) * 2.5; m.ty = m.y + Math.sin(a) * 2.5; spd = 2.6; m.wait = 0; }
    else if (m.wait > 0) { m.wait -= dt; m.moving = false; continue; }
    const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy);
    if (d < 0.1) { m.moving = false; m.wait = 1 + hash2(Math.floor(m.hx * 9), Math.floor(m.ft), 3) * 4; const a = hash2(Math.floor(m.hx), Math.floor(m.ft * 3), 4) * 6.283, r = hash2(Math.floor(m.ft), Math.floor(m.hy), 5) * m.r; m.tx = m.hx + Math.cos(a) * r; m.ty = m.hy + Math.sin(a) * r; continue; }
    const nx = m.x + dx / d * Math.min(d, spd * dt), ny = m.y + dy / d * Math.min(d, spd * dt), tx = Math.floor(nx), ty = Math.floor(ny);
    const ok = g.inb(tx, ty) && !g.block[ty * W + tx] && (m.kind === 'egret' || !g.isWater(tx, ty));
    if (ok) { m.x = nx; m.y = ny; if (Math.abs(dx) > 0.01) m.dir = dx < 0 ? -1 : 1; m.f += dt * (spd > 1 ? 10 : 6); m.moving = true; }
    else { m.tx = m.x; m.ty = m.y; m.wait = 0.5; m.moving = false; }
  }
}
function campaignDress(x0, x1, y0, y1) {
  const g = typeof G !== 'undefined' ? G : null; if (!g || !g.terrain || typeof PROPSET === 'undefined') return;
  if (CDRESS.g !== g) cdBuild(g);
  const dt = Math.min(0.1, Math.max(0, nowS - (CDRESS.lastT || nowS))); CDRESS.lastT = nowS;
  if (!paused && !ended) cdUpdate(g, dt);
  const inView = (x, y, m) => x >= x0 - m && x <= x1 + m && y >= y0 - m && y <= y1 + m + 1;
  const seen = (x, y) => { const i = Math.floor(y) * W + Math.floor(x); return !g.explored || g.explored[i]; };
  for (const d of CDRESS.decals) if (inView(d.x, d.y, 1) && seen(d.x, d.y)) cdDraw(PROPSET.propSprite(d.kind, 0), d.x, d.y);
  for (const p of CDRESS.props) {
    if (!inView(p.x, p.y, 2) || !seen(p.x, p.y) || (p.b && p.b.hp <= 0)) continue;
    const n = cdFrames(p.kind), f = n > 1 ? (Math.floor(nowS * 5) + p.f) % n : 0;
    cdDraw(PROPSET.propSprite(p.kind, f), p.x, p.y);
  }
  for (const m of CDRESS.mobs) {
    if (m.gone || !inView(m.x, m.y, 1)) continue;
    const i = Math.floor(m.y) * W + Math.floor(m.x); if (g.visible && !g.visible[i]) continue;
    const spr = PROPSET.mobSprite(m.kind, m.moving ? 'walk' : 'idle', m.moving ? Math.floor(m.f) % 4 : Math.floor(nowS * 1.5 + m.hx) % 2);
    cdDraw(spr, m.x, m.y + 0.2, m.dir < 0);
  }
}
