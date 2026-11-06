/* ===== m5-art.js ===== */
/* The art book's Portuguese (AUX: auxUnitSprite/auxBigSprite/auxShipSprite), the campaign props and ambient life
   (PROPSET: propSprite/mobSprite), a Melaka masjid, the bridge, and the life of the city drawn round the battle. */

/* ---------- people and ships ---------- */
function unitSprite(kind, team, anim, f, tool) {
  const d = UD[kind];
  if (d && d.pt) {
    if (d.pt === 'berco') return AUX.auxBigSprite('pt', 'siege', anim === 'attack' ? 'attack' : 'idle', anim === 'attack' ? f : 0);
    return AUX.auxUnitSprite('pt', d.pt, anim === 'work' ? 'idle' : anim, f);
  }
  if (kind === 'rajaahmad') return baseUnitSprite('pahlawan', 0, anim, f, tool);
  return baseUnitSprite(kind, team, anim, f, tool);
}
function shipSprite(u) {
  const d = UD[u.kind];
  if (d && d.ptShip) return d.ptShip === 'boat' ? ptBoatSprite() : AUX.auxShipSprite('pt', d.ptShip);
  return baseShipSprite(u);
}
// a ship's boat: a plain rowing boat with the red cross on its stern flag
function ptBoatSprite() {
  return sprite('ptboat', 28, 16, 2, (P) => {
    const r = P.r;
    for (const x of [7, 11, 15, 19]) { r(x, 4, 2, 2, '#efe7d2'); r(x, 6, 2, 2, '#e8b48a'); r(x, 3, 2, 1, '#9a9488'); }
    r(2, 8, 24, 3, '#7a4a24'); r(3, 11, 22, 2, '#5e3b1c'); r(2, 8, 24, 1, '#a8773c'); r(4, 10, 20, 1, '#c0392b');
    for (let x = 6; x < 24; x += 4) { r(x, 13, 1, 2, '#a8773c'); }
    r(24, 3, 1, 6, '#5e3b1c'); r(21, 3, 3, 3, '#f4ecd4'); r(22, 3, 1, 3, '#c0392b'); r(21, 4, 3, 1, '#c0392b');
  });
}
unitIcon = function (kind, team) {
  return dataURL('ui|' + kind + '|' + team, () => fitIcon(UD[kind].layer ? shipSprite({ kind, team }) : unitSprite(kind, team, 'idle', 1, ''), 44));
};

/* ---------- the masjid: stone plinth, timber hall, three-tier roof and a gold mustaka ---------- */
function masjidSprite() {
  const T0 = TEAMC[0];
  return sprite('masjid-mel', 48, 64, 2, (P) => {
    const r = P.r;
    r(2, 52, 44, 8, '#d9d0bb'); r(2, 52, 44, 1, '#efe8d6'); r(2, 59, 44, 1, '#a39a86'); for (let x = 4; x < 44; x += 6) r(x, 55, 3, 2, '#b8ae98');
    r(19, 56, 10, 4, '#c7bea8'); r(18, 59, 12, 1, '#a39a86');
    r(5, 40, 38, 12, '#c99b5d'); for (let x = 6; x < 42; x += 3) r(x, 40, 1, 12, '#a97d45');
    r(20, 43, 8, 9, '#3f2713'); r(21, 42, 6, 1, T0.trim); for (const x of [8, 13, 32, 37]) { r(x, 44, 3, 5, '#2b1a0c'); r(x, 43, 3, 1, '#f2c94c'); }
    const tier = (y0, y1, w0, w1) => {
      for (let y = y0; y <= y1; y++) { const k = (y - y0) / (y1 - y0), w = Math.round(w0 + (w1 - w0) * k); r(24 - (w >> 1), y, w, 1, (y - y0) % 3 === 2 ? T0.roofB : T0.roofA); }
      r(24 - (w1 >> 1), y1, w1, 1, T0.roofR); r(24 - (w1 >> 1), y1 + 1, w1, 1, T0.main);
    };
    r(11, 30, 26, 10, '#a97d45'); r(15, 19, 18, 4, '#a97d45');
    tier(29, 38, 30, 48); tier(19, 28, 18, 34); tier(10, 18, 6, 22);
    r(22, 4, 4, 6, '#f2c94c'); r(23, 2, 2, 2, '#ffe27a'); r(21, 8, 6, 2, '#d4a530'); r(23, 0, 2, 2, '#f2c94c');
  });
}
function buildingSprite(kind, team, level) {
  if (kind === 'wat' && team === 0) return masjidSprite();
  return baseBuildingSprite(kind, team, level);
}

/* ---------- dressing: props, merchant ships at anchor, ambient life ---------- */
const DRESS = { props: [], decals: [], ships: [], mobs: [], built: false, lastT: 0 };
function dressMap(g) {
  const D = DRESS, t = g.terrain; D.props = []; D.decals = []; D.ships = []; D.mobs = [];
  const free = (x, y) => g.inb(x, y) && !g.block[y * W + x] && (t[y * W + x] === T.GRASS || t[y * W + x] === T.DIRT || t[y * W + x] === T.SAND);
  const P = (kind, x, y, f) => { if (g.inb(Math.floor(x), Math.floor(y))) D.props.push({ kind, x, y, f: f || 0 }); };
  const near = (x, y, r) => { for (let k = 0; k < 30; k++) { const a = hash2(x * 7 + k, y * 3, 5) * 6.283, d = hash2(x + k, y * 11, 6) * r; const px = Math.floor(x + Math.cos(a) * d), py = Math.floor(y + Math.sin(a) * d); if (free(px, py)) return [px + 0.5, py + 0.5]; } return null; };
  const at = (kind, x, y, f) => { const p = near(x, y, 2.5); if (p) P(kind, p[0], p[1], f); };
  // market by the north road and at the river mouth
  for (const [k, x, y] of [['stall', 31, 13], ['stall', 37, 13], ['spice', 34, 14], ['jars', 30, 15], ['crates', 38, 15], ['stall', 26, 31], ['crates', 24, 31], ['spice', 28, 30], ['jars', 21, 31]]) at(k, x, y);
  // the godowns along the river: crates, jars and spice sacks
  for (let x = 41; x <= 70; x += 3) { at(['crates', 'jars', 'spice'][x % 3], x + 1, 29.5); }
  // kampung life on both banks
  for (let i = 0; i < 26; i++) {
    const x = 24 + Math.floor(hash2(i, 1, 21) * 48), y = 9 + Math.floor(hash2(i, 2, 21) * 16);
    at(['banana', 'laundry', 'well', 'coop', 'cookfire', 'jars', 'banana', 'cart'][i % 8], x, y, i % 3);
  }
  for (let i = 0; i < 18; i++) {
    const x = 46 + Math.floor(hash2(i, 3, 22) * 22), y = 42 + Math.floor(hash2(i, 4, 22) * 21);
    at(['banana', 'cookfire', 'laundry', 'coop', 'well', 'ricemat', 'banana', 'fishrack'][i % 8], x, y, i % 3);
  }
  // something beside most houses: a garden, jars, a coop, washing, a cooking fire; chickens and children about
  const yard = ['banana', 'jars', 'coop', 'laundry', 'cookfire', 'banana', 'fishrack', 'well', 'cart', 'ricemat'];
  let hn = 0;
  for (const b of g.buildings) {
    if (b.kind !== 'house' || b.team !== 0) continue;
    const h = hash2(b.tx, b.ty, 61); hn++;
    if (h < 0.6) { const sx = b.tx + (h < 0.3 ? 2.4 : -0.4), sy = b.ty + 1.7; if (free(Math.floor(sx), Math.floor(sy))) P(yard[Math.floor(h * 97) % yard.length], sx, sy, hn % 3); }
  }
  // the Istana compound and the masjid yard
  for (const [k, x, y, f] of [['drum', 37, 50], ['bunting', 35, 49.6], ['lantern', 32, 51, 0], ['lantern', 38.5, 51, 1], ['jars', 30, 59], ['shrine', 43, 59], ['graves', 46, 41.3], ['lantern', 41.5, 46.3, 1], ['lantern', 45.5, 46.3, 0], ['banana', 40, 45.5]]) P(k, x, y, f);
  // river and sea
  for (const [k, x, y] of [['sampan', 47, 33.5], ['sampan', 58, 34.2], ['sampan', 66, 31.5], ['reeds', 72, 31.6], ['reeds', 80, 32.8], ['nipa', 78, 27.5], ['nipa', 62, 33.6], ['lotus', 52, 36], ['kelong', 9, 9], ['kelong', 10, 66], ['nets', 19.6, 15], ['nets', 19.6, 58], ['fishrack', 21.5, 64], ['driftwood', 18.6, 20], ['driftwood', 18.6, 45]]) P(k, x, y);
  // war preparations: ranjau stakes in the surf line, barricades in the streets
  for (const y of [11, 17, 23, 29, 47, 53, 59]) P('stakes', coastX(y, 9) + 0.6, y + 0.5);
  for (const [x, y] of [[30, 45], [40, 45], [34.5, 47.2]]) P('barricade', x, y);
  P('beacon', 21.5, 9.5); P('beacon', 22.5, 64.5);
  // ground: tufts and flowers on the grass, stones on the roads
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (g.block[y * W + x]) continue;
    const v = t[y * W + x], h = hash2(x, y, 77);
    if (v === T.GRASS && h < 0.16) D.decals.push({ kind: h < 0.11 ? 'tuft' : h < 0.14 ? 'flowers' : 'fern', x: x + 0.2 + hash2(x, y, 78) * 0.6, y: y + 0.3 + hash2(x, y, 79) * 0.6 });
    else if (v === T.DIRT && h < 0.07) D.decals.push({ kind: h < 0.04 ? 'stones' : 'ruts', x: x + 0.5, y: y + 0.6 });
  }
  // merchant ships of many nations riding at anchor (scenery: they take no part)
  for (const [x, y, civ, k] of [[11, 14, 'ming', 'fuchuan'], [12, 21, 'ming', 'baochuan'], [10, 33, 'jawa', 'jong'], [12, 55, 'jawa', 'jong'], [11, 62, 'ming', 'fuchuan'], [14, 30, 'mel', 'trade'], [14.5, 46, 'mel', 'trade']]) D.ships.push({ x, y, civ, k, ph: x * 0.7 });
  // ambient life: chickens, goats, dogs, children, merchants, a buffalo, egrets, fishermen
  const mob = (kind, x, y, r) => { const p = near(x, y, 2); if (p) D.mobs.push({ kind, x: p[0], y: p[1], hx: p[0], hy: p[1], r: r || 2.5, tx: p[0], ty: p[1], wait: hash2(x, y, 9) * 3, f: 0, fl: 0, dir: 1, ft: 0 }); };
  for (const b of g.buildings) if (b.kind === 'house' && b.team === 0 && hash2(b.tx, b.ty, 62) < 0.22) mob(['chicken', 'child', 'chicken', 'goat', 'dog'][(b.tx + b.ty) % 5], b.tx + 1, b.ty + 2.5, 2);
  for (let i = 0; i < 12; i++) mob(['chicken', 'chicken', 'goat', 'dog', 'child', 'child'][i % 6], 25 + hash2(i, 5, 23) * 46, 10 + hash2(i, 6, 23) * 14);
  for (let i = 0; i < 8; i++) mob(['chicken', 'goat', 'dog', 'child'][i % 4], 48 + hash2(i, 7, 24) * 18, 44 + hash2(i, 8, 24) * 18);
  for (const [k, x, y] of [['gujarati', 33, 14], ['chinese', 37, 14.5], ['gujarati', 27, 31], ['chinese', 50, 29.5], ['chinese', 62, 29.5], ['buffalo', 70, 46], ['buffalo', 72, 54], ['egret', 74, 32.5], ['egret', 83, 33], ['fisher', 20, 14.5], ['fisher', 20, 59], ['monkey', 80, 20], ['monkey', 84, 50]]) mob(k, x, y, k === 'egret' ? 1.5 : 3);
  D.built = true;
}
function propFrames(kind) { const e = PROPSET.PROPS.find(p => p[0] === kind); return e ? e[6] : 1; }
function drawAt(spr, x, y, flip) {
  const px = Math.round(x * TILE - spr.width / 2), py = Math.round(y * TILE - spr.height + 6);
  if (!flip) { ctx.drawImage(spr, px, py); return; }
  ctx.save(); ctx.translate(px + spr.width, py); ctx.scale(-1, 1); ctx.drawImage(spr, 0, 0); ctx.restore();
}
// mobs wander near home and scatter from soldiers; townsfolk run from the Portuguese
function updateMobs(dt) {
  const D = DRESS;
  for (const m of D.mobs) {
    m.ft += dt;
    let fear = null, fd = m.kind === 'egret' ? 3.5 : 3;
    for (const u of G.units) { if (u.hp <= 0 || u.layer !== 0 || u.cls === 'vil' || u.kind === 'deer') continue; const d = Math.hypot(u.x - m.x, u.y - m.y); if (d < fd && (u.team === 1 || u.moving)) { fd = d; fear = u; } }
    let spd = 0.7;
    if (fear) { const a = Math.atan2(m.y - fear.y, m.x - fear.x); m.tx = m.x + Math.cos(a) * 2.5; m.ty = m.y + Math.sin(a) * 2.5; spd = 2.6; m.wait = 0; }
    else if (m.wait > 0) { m.wait -= dt; continue; }
    const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy);
    if (d < 0.1) { m.wait = 1 + hash2(m.hx * 9, m.ft, 3) * 4; const a = hash2(m.hx, m.ft * 3, 4) * 6.283, r = hash2(m.ft, m.hy, 5) * m.r; m.tx = m.hx + Math.cos(a) * r; m.ty = m.hy + Math.sin(a) * r; continue; }
    const nx = m.x + dx / d * Math.min(d, spd * dt), ny = m.y + dy / d * Math.min(d, spd * dt);
    const tx = Math.floor(nx), ty = Math.floor(ny);
    const ok = G.inb(tx, ty) && !G.block[ty * W + tx] && (m.kind === 'egret' || !G.isWater(tx, ty) || G.bridge[ty * W + tx]);
    if (ok) { m.x = nx; m.y = ny; if (Math.abs(dx) > 0.01) m.dir = dx < 0 ? -1 : 1; m.f += dt * (spd > 1 ? 10 : 6); }
    else { m.tx = m.x; m.ty = m.y; m.wait = 0.5; }
    m.moving = ok;
  }
}
function paintGround(x0, x1, y0, y1) {
  if (!G || !G.M) return;
  if (!DRESS.built) dressMap(G);
  const dt = Math.min(0.1, Math.max(0, nowS - (DRESS.lastT || nowS))); DRESS.lastT = nowS;
  if (!paused && !ended) updateMobs(dt);
  const inView = (x, y, m) => x >= x0 - m && x <= x1 + m && y >= y0 - m && y <= y1 + m + 1;
  // the bridge: water under the planks, rails at the sides
  for (let ty = BRIDGE.y0; ty <= BRIDGE.y1; ty++) for (let tx = BRIDGE.x0; tx <= BRIDGE.x1; tx++) {
    if (!G.bridge[ty * W + tx] || !inView(tx, ty, 1)) continue;
    const X = tx * TILE, Y = ty * TILE;
    ctx.fillStyle = '#2f6f90'; ctx.fillRect(X, Y, TILE, TILE);
    for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? '#9a7442' : '#ae8650'; ctx.fillRect(X + 1, Y + k * 8, TILE - 2, 7); ctx.fillStyle = '#6e4e26'; ctx.fillRect(X + 1, Y + k * 8 + 6, TILE - 2, 1); }
    ctx.fillStyle = '#4e3418'; if (tx === BRIDGE.x0) ctx.fillRect(X, Y, 3, TILE); if (tx === BRIDGE.x1) ctx.fillRect(X + TILE - 3, Y, 3, TILE);
    if (ty % 2 === 0) { ctx.fillStyle = '#3a2610'; if (tx === BRIDGE.x0) ctx.fillRect(X - 2, Y + 12, 4, 8); if (tx === BRIDGE.x1) ctx.fillRect(X + TILE - 2, Y + 12, 4, 8); }
  }
  for (const d of DRESS.decals) if (inView(d.x, d.y, 1)) drawAt(PROPSET.propSprite(d.kind, 0), d.x, d.y);
  for (const s of DRESS.ships) {
    if (!inView(s.x, s.y, 4)) continue;
    const spr = s.civ === 'mel' ? baseShipSprite({ kind: 'trade', team: 0 }) : s.civ === 'jawa' ? NAVAL.navalSprite('jong', 1) : AUX.auxShipSprite(s.civ, s.k);
    const bob = Math.sin(nowS * 1.6 + s.ph) * 1.5;
    ctx.globalAlpha = 0.28; ctx.fillStyle = '#0d2a3a'; ell(s.x * TILE, s.y * TILE + 4, spr.width * 0.36, 6); ctx.fill(); ctx.globalAlpha = 1;
    ctx.drawImage(spr, Math.round(s.x * TILE - spr.width / 2), Math.round(s.y * TILE - spr.height * 0.72 + bob));
  }
  for (const p of DRESS.props) {
    if (!inView(p.x, p.y, 2)) continue;
    const n = propFrames(p.kind), f = n > 1 ? (Math.floor(nowS * 5) + p.f) % n : 0;
    drawAt(PROPSET.propSprite(p.kind, f), p.x, p.y);
  }
  for (const m of DRESS.mobs) {
    if (!inView(m.x, m.y, 1)) continue;
    const walk = m.moving && (m.tx !== m.x || m.ty !== m.y);
    const spr = PROPSET.mobSprite(m.kind, walk ? 'walk' : 'idle', walk ? Math.floor(m.f) % 4 : Math.floor(nowS * 1.5 + m.hx) % 2);
    drawAt(spr, m.x, m.y + 0.2, m.dir < 0);
  }
}

/* ---------- units: hero rings, boats with men aboard ---------- */
function paintUnit(u) {
  const d = UD[u.kind], px = u.x * TILE, py = u.y * TILE, star = d.hero || d.foeHero;
  if (star) { ctx.strokeStyle = u.team === 0 ? '#f2c94c' : '#ff8a6b'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85; ell(px, py + 3, 12, 6); ctx.stroke(); ctx.globalAlpha = 1; }
  basePaintUnit(u);
  if (star) {
    const top = py - 52;
    hpBar(px - 13, top + 2, 26, u.hp / u.maxHp);
    ctx.fillStyle = '#17110c'; ctx.fillRect(px - 21, top - 1, 7, 7);
    ctx.fillStyle = u.team === 0 ? '#f2c94c' : '#ff8a6b'; ctx.fillRect(px - 19, top - 1, 3, 7); ctx.fillRect(px - 21, top + 1, 7, 3);
  }
  if (u.team === 1 && u.order.t === 'rland' && u.order.troops && u.order.s === 'in') {
    const t = u.order.troops.length + ' aboard', y = py - 30;
    ctx.font = '700 12px "Barlow Semi Condensed", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#10201a'; ctx.strokeText(t, px, y); ctx.fillStyle = '#ffb3a8'; ctx.fillText(t, px, y);
  }
}

/* ---------- on top: the bridge meter, where the boats are heading ---------- */
function paintMission() {
  const M = G.M; if (!M) return;
  const pulse = 0.5 + 0.5 * Math.sin(nowS * 3);
  if (M.bridge > 0) {
    const x = (BR_MID.x) * TILE, y = BRIDGE.y0 * TILE - 30, w = 80, p = M.bridge / BRIDGE_HOLD;
    ctx.fillStyle = '#17110c'; ctx.fillRect(x - w / 2 - 2, y - 2, w + 4, 10);
    ctx.fillStyle = 'rgba(224,82,74,' + (0.7 + 0.3 * pulse).toFixed(2) + ')'; ctx.fillRect(x - w / 2, y, Math.round(w * p), 6);
  }
  // boats on their way in: a red arrow over the beach they make for
  if (M.next - M.t <= 15 && !M.retreat && M.wave < WAVES.length) {
    ctx.fillStyle = 'rgba(224,82,74,' + (0.35 + 0.5 * pulse).toFixed(2) + ')';
    for (const L of [LAND.n, LAND.s]) {
      const x = (L.x + 2) * TILE, y = (L.y - 2.5) * TILE;
      for (let k = 0; k < 2; k++) { const ax = x - k * 22 - ((nowS * 30) % 22); ctx.beginPath(); ctx.moveTo(ax, y - 12); ctx.lineTo(ax, y + 12); ctx.lineTo(ax + 12, y); ctx.closePath(); ctx.fill(); }
    }
  }
}
