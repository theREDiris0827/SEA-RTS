/* ##### CHAPTER EXTRA 2 · Animals and kerbau #####
   File: src/js/extras/02-animals-kerbau.js
   What it does: Add-on: fruit groves, hunt animals (kancil, boar, seladang) and kerbau herding, fattening and
   ploughing.
   Things you can tweak:
     - KB: cap 6 kerbau each, perGran 3 per granary, fat0 200 -> fatMax 400 food over fatTime 240 s, plough 1.3
       (= 30% faster farm), buy 75 gold.
     - NK.durian / NK.pisang: food in the new fruit trees.
     - UD.seladang atk: how hard it fights back.
   ############################################################################ */
/* ===== animal pack (2026-11-02, lore thread design, Iylia approved) =====
   Banana groves and mango trees in place of berry bushes (same 'berry' node, new look).
   Hunt animals: rusa (sambar deer), kancil and seladang on every skirmish map; seladang fights back;
   no wild boar when Melaka is playing.
   Kerbau (water buffalo): neutral herd animals. A soldier or villager who walks up to one claims it,
   its halter turns team colour and it walks home. Send it to a granary to fatten (200 -> 400 food in
   about 4 minutes, 3 per granary), butcher it any time for what it is worth. Enemies can lead it away
   when no owner is near. At most 6 per player. Melaka only: Kerbau Minang (a kerbau ploughing a worked
   farm makes it 30% faster) and, from the Kingdom Age, the Syahbandar Port, which sells kerbau.
   Loaded after the maps block (uses window.NEWMAPS and CALM). Missions (G.M) get the new look only. */
(function () {
  if (typeof Game === 'undefined') return;
  const KB = { cap: 6, perGran: 3, fat0: 200, fatMax: 400, fatTime: 240, plough: 1.3, buy: { gold: 75 }, buyT: 15, claimR: 1.2, guardR: 4 };
  window.KERBAU = KB;
  const MEL = 0;
  const melaka = (team) => team !== 2 && CV(team) === MEL;

  /* ---------- art ---------- */
  function bananaSprite() {
    return sprite('sea|banana', 24, 24, 2, (P) => {
      const r = P.r;
      for (const [x, h] of [[5, 13], [10, 17], [15, 15], [19, 11]]) { r(x, 23 - h, 2, h, '#6a8a3a'); r(x, 23 - h, 1, h, '#55702e'); }
      const leaf = (x, y, d, n) => { for (let t = 0; t < n; t++) { const yy = y - Math.round(t * 0.45) + (t > n - 3 ? t - n + 3 : 0); r(x + d * t, yy, 2, 3, t % 2 ? '#5aa04a' : '#6ab456'); r(x + d * t, yy + 1, 1, 1, '#3e7a34'); } };
      leaf(10, 6, -1, 9); leaf(11, 5, 1, 9); leaf(6, 10, -1, 6); leaf(16, 8, 1, 7); leaf(19, 12, 1, 4); leaf(4, 12, -1, 4);
      r(9, 1, 3, 4, '#7ac45e'); r(10, 0, 1, 1, '#7ac45e');
      for (const [bx, by] of [[10, 9], [16, 10]]) {
        r(bx + 1, by, 1, 2, '#4e6e2a');
        for (let i = 0; i < 4; i++) r(bx + (i % 2), by + 2 + i, 3, 1, i % 2 ? '#e8d23a' : '#c8c040');
        r(bx + 1, by + 6, 2, 2, '#8a2a4a'); r(bx + 1, by + 6, 1, 1, '#b04a6a');
      }
      r(3, 22, 19, 1, '#2e5a24');
    });
  }
  const isMango = (n) => hash2(n.tx, n.ty, 9191) < 0.33;
  // banana grove or mango tree picture
  function berryArt(n) { return isMango(n) && window.CALM ? CALM.tree('mango') : bananaSprite(); }

  // kerbau picture: standing, grazing (head down) or ploughing (yoke and plough)
  function kerbauSprite(col, f, fat, pose) {
    pose = pose || 0;
    const l = pose === 1 ? 0 : (f ? 1 : 0), M = col ? col.main : '#b89a60', D = col ? col.dark : '#8a7438', OX = pose === 2 ? 10 : 0;
    return sprite('kerbau|' + (col ? col.main : 'n') + '|' + f + '|' + fat + '|' + pose, 24 + OX, 20, 2, (P) => {
      const r0 = P.r, c = '#4c4c54', cl = '#60606a', cd = '#36363c', horn = '#a89e88', hornT = '#e2dac2';
      const W = '#7a5228', WL = '#a0703a';
      if (pose === 2) {           // tenggala: wooden plough dragged behind, shaft runs under the belly to the yoke
        r0(4, 12, 20, 1, W); r0(1, 14, 5, 2, W); r0(1, 14, 5, 1, WL); r0(0, 16, 4, 1, '#b8b8b0');
        r0(2, 10, 1, 4, W); r0(1, 8, 1, 2, W); r0(0, 7, 1, 1, WL);
        r0(1 + (f ? 1 : 0), 17, 2, 1, '#6a4a2a'); r0(4 - (f ? 1 : 0), 18, 1, 1, '#8a6a42');   // turned earth
      }
      const r = (x, y, w, h, k) => r0(x + OX, y, w, h, k);
      const HD = pose === 1 ? 5 : 0, hx = pose === 1 ? 1 : 0;      // head lowered to the grass
      const rh = (x, y, w, h, k) => r(x + hx, y + HD, w, h, k);
      if (fat === 0) {
        r(5, 8, 11, 5, c); r(6, 7, 3, 1, c); r(11, 7, 4, 1, c); r(6, 7, 1, 1, cl); r(12, 6, 2, 1, cl);
        for (const x of [9, 11, 13]) r(x, 9, 1, 3, cl);
        r(6, 12, 9, 1, cd); r(4, 9, 1, 3, cd); r(3, 9, 1, 4, cd); r(3, 13, 1, 2, '#22222a');
      } else if (fat === 1) {
        r(4, 8, 13, 6, c); r(5, 7, 11, 1, c); r(7, 6, 7, 1, cl); r(6, 7, 6, 1, cl); r(5, 13, 11, 1, cd); r(3, 9, 1, 4, cd);
        r(2, 9, 1, 4, cd); r(2, 13, 1, 2, '#22222a');
      } else {
        r(3, 7, 14, 7, c); r(4, 6, 12, 1, c); r(6, 5, 8, 1, c); r(4, 14, 12, 1, c); r(5, 15, 10, 1, cd);
        r(7, 5, 6, 1, '#7a7a86'); r(5, 6, 9, 1, cl); r(9, 7, 3, 1, cl); r(2, 8, 1, 5, cd);
        r(1, 8, 1, 4, cd); r(1, 12, 1, 2, '#22222a');
      }
      if (pose === 1) { r(16, 8, 3, 5, c); r(17, 10, 3, 6, c); r(18, 13, 2, 3, cd); } else r(16, 8, 3, 5, c);
      rh(18, 10, 4, 4, c); rh(21, 12, 2, 2, '#72727a'); rh(22, 12 + (pose === 1 && f ? 1 : 0), 1, 1, '#22222a'); rh(19, 11, 1, 1, '#17110c');
      if (pose !== 1) { r(18, 14, 3, 1, '#c8c0b0'); r(17, 13, 1, 1, '#c8c0b0'); }
      rh(18, 9, 4, 1, horn); rh(16, 8, 3, 1, horn); rh(14, 7, 3, 1, horn); rh(13, 6, 2, 1, horn); rh(12, 5, 2, 1, horn); rh(12, 4, 1, 1, hornT);
      rh(21, 8, 1, 1, horn); rh(22, 7, 1, 1, horn); rh(22, 6, 1, 1, hornT);
      // two pairs seen from the side: the far leg darker and half hidden behind the near one
      const top = fat === 2 ? 15 : fat === 0 ? 13 : 14, w = fat === 0 ? 1 : 2, rearX = fat === 2 ? 4 : 5, frontX = 14;
      for (const [x, far] of [[rearX, 1], [frontX, 1], [rearX, 0], [frontX, 0]]) {
        const sx = far ? (l ? -1 : 1) : (l ? 1 : -1) * (l ? 1 : 0), lx = x + (far ? 1 : 0) + sx;
        r(lx, top, w, 17 - top, far ? cd : c); r(lx, 17, w, 1, '#26262a');
      }
      r(16, 8, 2, 6, M); r(16, 13, 2, 1, D);
      r(16, 14, 2, 2, '#8a5a2b'); r(16, 14, 2, 1, '#a8773c');
      rh(21, 11, 1, 1, M); rh(20, 13, 2, 1, M); rh(19, 14, 1, 1, D);
      if (pose === 2) { r(14, 5, 2, 6, W); r(14, 5, 2, 1, WL); r(13, 4, 4, 1, W); }   // kuk (yoke) on the neck
    });
  }
  // hay pile at the granary
  function haySprite() {
    return sprite('kb|hay', 9, 6, 2, (P) => { const r = P.r; r(1, 2, 7, 4, '#c9a24a'); r(0, 4, 9, 2, '#b08a36'); r(2, 1, 4, 1, '#e0bf62'); r(3, 3, 1, 2, '#e8cf7a'); r(6, 2, 1, 2, '#9a7a2e'); r(1, 5, 7, 1, '#7d6226'); });
  }
  const fatStage = (u) => u.fat >= 360 ? 2 : u.fat >= 270 ? 1 : 0;

  // Syahbandar Port (Melaka, Kingdom Age on): the lore hall, same size and footing as the port
  function syahbandarSprite(team) {
    const T = TEAMC[team] || TEAMC[0];
    return sprite('xmel|syahbandar|' + team, 48, 54, 2, (P) => {
      const r = P.r;
      r(0, 40, 48, 12, '#a47a45'); for (let x = 0; x < 48; x += 4) r(x, 40, 1, 12, '#7d5b30'); r(0, 40, 48, 1, '#c99b5d'); r(0, 51, 48, 1, '#5a3a1e');
      posts(P, [1, 12, 24, 36, 46], 48, 53, 2);
      planks(P, 2, 24, 34, 16, '#c99b5d', '#a97d45');
      r(13, 28, 12, 12, '#3f2713'); r(18, 28, 2, 12, '#2a190a'); r(12, 27, 14, 1, GOLD);
      r(4, 28, 5, 5, '#2b1a0c'); r(3, 27, 7, 1, T.trim); r(29, 28, 5, 5, '#2b1a0c'); r(28, 27, 7, 1, T.trim);
      roofGable(P, 19, 16, 24, 11, 19, T.roofA, T.roofB, T.roofR); r(0, 24, 38, 1, T.main); r(0, 25, 38, 1, GOLD);
      roofGable(P, 19, 6, 16, 3, 12, T.roofA, T.roofB, T.roofR); r(7, 16, 24, 1, T.main);
      r(18, 2, 2, 4, GOLD); r(18, 1, 2, 1, '#fff2b0');
      r(38, 36, 5, 4, '#a8773c'); r(38, 38, 5, 1, '#7d5b30'); r(43, 37, 4, 3, '#8a5a2b'); r(40, 33, 4, 3, '#b88a52');
      for (const sx of [2, 6, 26, 30]) { r(sx, 37, 3, 3, '#d9c79a'); r(sx, 37, 3, 1, '#efe3c0'); }
      r(44, 32, 3, 3, '#7a4a24'); r(44, 32, 3, 1, '#a8773c');
      r(37, 22, 1, 10, WOOD_D); r(33, 22, 9, 1, STEEL_D); r(33, 23, 1, 3, STEEL_D); r(41, 23, 1, 3, STEEL_D);
      r(32, 26, 3, 1, GOLD); r(40, 26, 3, 1, GOLD_D); r(36, 31, 3, 1, WOOD_D);
      r(40, 6, 1, 16, WOOD_D); r(47, 10, 1, 12, WOOD_D);
      const fl = [['#3a7bd5', '#ffffff'], ['#e8b830', '#c0392b'], ['#ffffff', '#c0392b'], ['#8e44ad', '#f2c94c']];
      for (let i = 0; i < 4; i++) { const y = 8 + i * 3; r(41, y, 3, 2, fl[i][0]); r(41, y + 1, 3, 1, fl[i][1]); }
      r(44, 11, 3, 2, '#e67e22'); r(44, 14, 3, 2, '#2c3e50'); r(44, 17, 3, 2, '#16a085');
      r(0, 0, 1, 22, WOOD_D); r(1, 1, 8, 9, T.main); r(1, 1, 8, 1, GOLD); r(1, 9, 8, 1, GOLD); r(4, 4, 3, 3, GOLD); r(5, 5, 1, 1, T.main);
    });
  }
  const isSyah = (b) => b && b.kind === 'port' && b.team !== 2 && melaka(b.team) && G && G.teamAge && G.teamAge(b.team) >= 2;

  /* ---------- units and names ---------- */
  const deer = UD.deer;
  UD.deer.name = 'Rusa (sambar deer)';
  UD.kerbau = Object.assign({}, deer, { name: 'Kerbau (water buffalo)', hp: 60, spd: 0.75, meat: KB.fat0 });
  if (UD.seladang) Object.assign(UD.seladang, { atk: 6, rng: 0.9, rate: 1.6 });
  NODE_NAME.berry = 'Fruit grove (banana, mango)';
  if (typeof BRIEF !== 'undefined') Object.assign(BRIEF, {
    deer: 'Wild deer, quick meat', kerbau: 'Claim it, fatten it at a granary, then butcher it',
    seladang: 'Huge wild cattle: lots of meat, but it fights back'
  });

  /* ---------- sim ---------- */
  const own = (g, team) => g.units.filter(u => u.kind === 'kerbau' && u.hp > 0 && u.own === team);
  Game.prototype.kerbauCount = function (team) { return own(this, team).length; };
  const center = (b) => ({ x: b.tx + b.size / 2, y: b.ty + (b.h || b.size) / 2 });
  // where an owned kerbau should stand (granary, Town Centre or farm)
  function homeFor(g, u) {
    const grans = g.buildings.filter(b => b.team === u.own && b.done && b.hp > 0 && (b.kind === 'granary' || b.kind === 'baray'));
    let best = null, bd = 1e9;
    for (const b of grans) {
      const n = g.units.filter(k => k !== u && k.kind === 'kerbau' && k.hp > 0 && k.own === u.own && k.job === 'granary' && k.bid === b.id).length;
      if (n >= KB.perGran) continue;
      const c = center(b), d = Math.hypot(c.x - u.x, c.y - u.y) - (b.kind === 'baray' ? 60 : 0); if (d < bd) { bd = d; best = b; }
    }
    if (best) return { job: 'granary', b: best };
    const tc = g.buildings.find(b => b.team === u.own && b.kind === 'towncentre' && b.hp > 0);
    return { job: 'home', b: tc || null };
  }
  // walk a kerbau to its spot
  function sendHome(g, u) { const h = homeFor(g, u); u.job = h.job; u.bid = h.b ? h.b.id : 0; u.path = null; u.arrived = false; u.order = { t: 'kb' }; }
  Game.prototype.kerbauStay = function (u, x, y) { const f = this.byId.get(u.bid); if (f && f.kb === u.id) f.kb = 0; u.job = 'stay'; u.bid = 0; u.sx = x; u.sy = y; u.path = null; u.arrived = false; u.order = { t: 'kb' }; };
  Game.prototype.claimKerbau = function (u, team) {
    if (u.own === team) return false;
    if (this.kerbauCount(team) >= KB.cap) { if (team === 0 && this.t - (this._kbMsg || -9) > 8) { this._kbMsg = this.t; this.msg('You already keep ' + KB.cap + ' kerbau.'); } return false; }
    const was = u.own; u.own = team; if (u.fat == null) u.fat = KB.fat0;
    const f = this.byId.get(u.bid); if (f && f.kb === u.id) f.kb = 0;
    sendHome(this, u);
    if (team === 0) this.msg(was === 1 ? 'You took a kerbau from the enemy.' : 'A kerbau joins your herd.');
    else if (was === 0) this.msg('The enemy led away one of your kerbau!');
    return true;
  };
  Game.prototype.kerbauPlough = function (u, farm) {
    if (u.own == null || u.own < 0 || !melaka(u.own)) return false;
    if (!farm) {
      let bd = 1e9;
      for (const b of this.buildings) if (b.team === u.own && FIELD[b.kind] && b.done && b.hp > 0 && (!b.kb || b.kb === u.id || !this.byId.get(b.kb) || this.byId.get(b.kb).hp <= 0)) {
        const worked = this.units.some(v => v.hp > 0 && v.team === u.own && v.order.t === 'gather' && v.order.id === b.id);
        const c = center(b), d = Math.hypot(c.x - u.x, c.y - u.y) - (worked ? 100 : 0); if (d < bd) { bd = d; farm = b; }
      }
    }
    if (!farm) return false;
    const other = farm.kb && this.byId.get(farm.kb);
    if (other && other !== u && other.hp > 0) return false;     // one kerbau per plot
    const f = this.byId.get(u.bid); if (f && f.kb === u.id) f.kb = 0;
    farm.kb = u.id; if (u.bid !== farm.id) u.arrived = false; u.job = 'plough'; u.bid = farm.id; u.path = null; u.order = { t: 'kb' };
    return true;
  };
  Game.prototype.kerbauToGranary = function (u, b) {
    const f = this.byId.get(u.bid); if (f && f.kb === u.id) f.kb = 0;
    if (b) {
      const n = this.units.filter(k => k !== u && k.kind === 'kerbau' && k.hp > 0 && k.own === u.own && k.job === 'granary' && k.bid === b.id).length;
      if (n >= KB.perGran) return false;
      u.job = 'granary'; u.bid = b.id; u.path = null; u.arrived = false; u.order = { t: 'kb' }; return true;
    }
    sendHome(this, u); return true;
  };
  Game.prototype.butcherKerbau = function (u) { if (u.hp <= 0 || u.job === 'plough') return false; u.hp = 0; this.onKilled(u, null); return true; };

  // carcass of a kerbau holds what it has grown to
  const _addNode = Game.prototype.addNode;
  Game.prototype.addNode = function (kind, x, y, amt) {
    const n = _addNode.call(this, kind, x, y, amt);
    if (kind === 'carcass' && amt == null) {
      const a = this.units.find(u => u.kind === 'kerbau' && u.hp <= 0 && !u._meat && Math.floor(u.x) === x && Math.floor(u.y) === y);
      if (a) { a._meat = 1; n.amt = n.max = Math.round(a.fat || KB.fat0); for (let i = this.fx.length - 1; i >= 0; i--) { const f = this.fx[i]; if (f.k === 'corpse' && f.kind === 'kerbau') { f.kind = 'deer'; break; } } }
    }
    return n;
  };
  // a kerbau doesn't bolt when hit; a seladang turns on whoever hurt it
  const _dmg = Game.prototype.damage;
  Game.prototype.damage = function (att, tgt) {
    const prev = tgt && tgt.isUnit && tgt.cls === 'animal' ? tgt.order : null;
    const r = _dmg.apply(this, arguments);
    if (prev && tgt.hp > 0) {
      if (tgt.kind === 'kerbau') { tgt.order = prev; }
      else if (tgt.kind === 'seladang' && att && att.isUnit && att.hp > 0 && att.layer === 0) { this.orderAttack(tgt, att, {}); tgt.angry = 8; }
    }
    return r;
  };

  /* standing spots: a row on the quietest side of the granary (3) or behind the Town Centre (2 rows of 3) */
  const SIDES = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  // the quietest side of a building for kerbau spots
  function kbSide(g, b) {
    if (b.kbSide != null && g.t - (b.kbSideT || 0) < 20) return b.kbSide;
    const bw = b.size || 2, bh = b.h || bw; let best = 0, bs = 1e9;
    SIDES.forEach(([sx, sy], i) => {
      // the strip two tiles deep along that side
      const x0 = sx > 0 ? b.tx + bw : sx < 0 ? b.tx - 3 : b.tx - 1, x1 = sx > 0 ? b.tx + bw + 3 : sx < 0 ? b.tx : b.tx + bw + 1;
      const y0 = sy > 0 ? b.ty + bh : sy < 0 ? b.ty - 3 : b.ty - 1, y1 = sy > 0 ? b.ty + bh + 3 : sy < 0 ? b.ty : b.ty + bh + 1;
      let sc = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { g.wt = b.team; if (x < 0 || y < 0 || x >= W || y >= H || !g.walkable(x, y, 0)) sc += 3; }
      for (const o of g.buildings) if (o !== b && o.hp > 0 && o.tx < x1 && o.tx + (o.size || 2) > x0 && o.ty < y1 && o.ty + (o.h || o.size || 2) > y0) sc += FIELD[o.kind] ? 8 : 4;
      for (const n of g.nodes) if (n.amt > 0 && n.tx >= x0 - 1 && n.tx < x1 + 1 && n.ty >= y0 - 1 && n.ty < y1 + 1) sc += 2;
      if (sy < 0) sc += 0.5;              // north last: kerbau there hide behind the roof
      if (sc < bs) { bs = sc; best = i; }
    });
    b.kbSide = best; b.kbSideT = g.t; return best;
  }
  // which standing spot a kerbau gets (by arrival time)
  function slotIndex(g, u, b) {
    // spots fill in order of arrival at this building, and close up when one leaves
    if (u.slotB !== b.id || u.slot == null) {
      const used = new Set(); for (const k of g.units) if (k !== u && k.kind === 'kerbau' && k.hp > 0 && k.own === u.own && k.bid === b.id && k.slotB === b.id && k.slot != null) used.add(k.slot);
      let i = 0; while (used.has(i)) i++;
      u.slotB = b.id; u.slotT = g.t + u.id * 1e-6; u.slot = i;
    }
    return u.slot;
  }
  // map position of a standing spot
  function slotPoint(g, u, b) {
    if (b.kind === 'baray') { const i = slotIndex(g, u, b); return { x: b.tx + KBARAY.wallow[i % 3][0], y: b.ty + KBARAY.wallow[i % 3][1], face: i % 2 ? 1 : -1 }; }
    const i = slotIndex(g, u, b), side = kbSide(g, b), [sx, sy] = SIDES[side];
    const bw = b.size || 2, bh = b.h || bw, cx = b.tx + bw / 2, cy = b.ty + bh / 2;
    const row = Math.floor(i / 3), col = (i % 3) - 1;
    let x, y;
    if (sy) { x = cx + col * 1.5; y = sy > 0 ? b.ty + bh + 0.9 + row * 1.1 : b.ty - 0.4 - row * 1.1; }
    else { y = cy + col * 1.05 + 0.3; x = sx > 0 ? b.tx + bw + 0.9 + row * 1.6 : b.tx - 0.9 - row * 1.6; }
    g.wt = u.own;
    if (!g.walkable(Math.floor(x), Math.floor(y), 0)) { const p = g.nearestFree(x, y, 0, 3); if (p) { x = p.x + 0.5; y = p.y + 0.5; } }
    const face = sx ? -sx : (col < 0 ? 1 : col > 0 ? -1 : (u.id % 2 ? 1 : -1));
    return { x, y, face };
  }

  // kerbau each tick: claim, fatten, plough, follow
  function kbTick(g, dt) {
    g._kbT = (g._kbT || 0) + dt; const scan = g._kbT >= 0.4; if (scan) g._kbT = 0;
    for (const u of g.units) {
      if (u.hp <= 0) continue;
      if (u.kind === 'seladang' && u.angry != null) { u.angry -= dt; if (u.angry <= 0 || u.order.t !== 'attack') { u.angry = null; if (u.order.t !== 'flee') u.order = { t: 'wander', next: 2 }; } continue; }
      if (u.kind !== 'kerbau') continue;
      if (u.own == null) u.own = -1;
      if (scan) {
        // claim (wild) or lead away (no owner close by)
        let who = null, wd = KB.claimR;
        for (const v of g.units) {
          if (v.hp <= 0 || v.team === 2 || v.layer !== 0 || v.aboard || v.cls === 'boat' || v.cls === 'ship' || v.team === u.own) continue;
          const d = Math.hypot(v.x - u.x, v.y - u.y); if (d < wd) { wd = d; who = v; }
        }
        if (who) {
          const guarded = u.own >= 0 && g.units.some(v => v.hp > 0 && v.team === u.own && v.layer === 0 && v.cls !== 'animal' && Math.hypot(v.x - u.x, v.y - u.y) < KB.guardR);
          if (!guarded) g.claimKerbau(u, who.team);
        }
      }
      if (u.own < 0) continue;
      u.wallow = 0;
      if (u.order.t !== 'kb') { if (u.order.t === 'flee' || u.order.t === 'wander' || u.order.t === 'idle') u.order = { t: 'kb' }; else continue; }
      u.pose = 0;
      if (u.job === 'stay') {      // led to a spot by the player: walk there, then graze
        const d = Math.hypot(u.sx - u.x, u.sy - u.y);
        if (d > 0.35) { if (!u.path && !g.setPath(u, g.pathToPoint(u, u.sx, u.sy))) { u.sx = u.x; u.sy = u.y; continue; } if (g.stepMove(u, dt)) u.path = null; u.arrived = false; }
        else { u.path = null; u.arrived = true; u.pose = ((g.t + u.id * 3.7) % 9) < 5 ? 1 : 0; }
        continue;
      }
      let b = g.byId.get(u.bid);
      if (!b || b.hp <= 0 || b.team !== u.own) { sendHome(g, u); b = g.byId.get(u.bid); }
      if (!b) continue;
      const c = center(b), d = Math.hypot(c.x - u.x, c.y - u.y), near = (b.size || 2) / 2 + 1.9;
      if (u.job === 'plough' && (u.arrived || d <= near)) {     // walk furrows up and down the plot
        u.path = null; u.arrived = true; u.pose = 2;
        const bw = b.size || 2, bh = b.h || bw, x0 = b.tx + 0.55, x1 = b.tx + bw - 0.55, rows = Math.max(2, Math.round(bh * 1.5));
        if (u.fr == null || u.fb !== b.id) { u.fb = b.id; u.fr = 0; u.fd = 1; }
        const ty = b.ty + 0.55 + (bh - 0.9) * (u.fr / (rows - 1)), tx = u.fd > 0 ? x1 : x0;
        const dx = tx - u.x, dy = ty - u.y, dd = Math.hypot(dx, dy), st = 0.4 * dt;
        if (dd <= st) { u.x = tx; u.y = ty; u.fd = -u.fd; u.fr = (u.fr + 1) % rows; }
        else { u.x += dx / dd * st; u.y += dy / dd * st; if (Math.abs(dx) > 0.02) u.face = dx > 0 ? 1 : -1; }
        u.moving = true;
        continue;
      }
      // a newly free granary pulls kerbau waiting at the Town Centre
      if (scan && u.job === 'home') { const h = homeFor(g, u); if (h.job === 'granary') { sendHome(g, u); continue; } }
      const sp = slotPoint(g, u, b);
      if ((!u.arrived || Math.hypot(sp.x - u.x, sp.y - u.y) > 0.6) && !(b.kind === 'baray' && rectDist(u.x, u.y, b.rect) <= 1.0)) {
        if (Math.hypot(sp.x - u.x, sp.y - u.y) > 0.25) {
          if (!u.path && !g.setPath(u, (b.kind === 'baray' ? g.pathToRect(u, b.rect, 0.85) : g.pathToPoint(u, sp.x, sp.y)))) { u.path = null; continue; }
          if (g.stepMove(u, dt)) u.path = null;
          u.arrived = false; continue;
        }
      }
      {
        u.path = null; u.arrived = true; u.x += (sp.x - u.x) * Math.min(1, dt * 4); u.y += (sp.y - u.y) * Math.min(1, dt * 4);
        u.face = sp.face;
        u.wallow = b.kind === 'baray' ? (b.ty + (b.h || b.size)) * TILE + 1 : 0;
        if (u.job === 'granary') { u.pose = u.fat < KB.fatMax ? 1 : (((g.t + u.id * 3.7) % 9) < 3 ? 1 : 0); }
        else u.pose = ((g.t + u.id * 3.7) % 9) < 4 ? 1 : 0;
        if (u.job === 'granary' && u.fat < KB.fatMax) u.fat = Math.min(KB.fatMax, u.fat + (KB.fatMax - KB.fat0) / KB.fatTime * dt * (b.kind === 'baray' ? KBARAY.fatten : 1));
        // the computer player eats its kerbau once they are fat
        if (u.own === 1 && u.job !== 'plough' && u.fat >= KB.fatMax) { g.butcherKerbau(u); }
      }
    }
  }
  const _sep = Game.prototype.separate;
  Game.prototype.separate = function () {
    const ks = []; for (const u of this.units) if (u.kind === 'kerbau' && u.hp > 0 && u.own >= 0 && u.layer === 0) { u.layer = 9; ks.push(u); }
    try { return _sep.apply(this, arguments); } finally { for (const u of ks) u.layer = 0; }
  };
  const _upd = Game.prototype.update;
  Game.prototype.update = function (dt) { const r = _upd.apply(this, arguments); try { kbTick(this, dt); } catch (e) { if (!this._kbErr) { this._kbErr = 1; console.warn('kerbau', e); } } return r; };

  // Kerbau Minang: a worked Melaka farm with its kerbau ploughing gathers 30% faster
  const _gi = Game.prototype.gatherInfo;
  Game.prototype.gatherInfo = function (o) {
    const gi = _gi.call(this, o);
    if (gi && o && o.isBld && FIELD[o.kind] && o.kb) { const k = this.byId.get(o.kb); if (k && k.hp > 0 && k.job === 'plough' && k.bid === o.id && k.arrived) gi.rate *= KB.plough; }
    return gi;
  };

  // Syahbandar Port: buy a kerbau (one at a time)
  Game.prototype.buyKerbau = function (port) {
    const t = port.team;
    if (!isSyah(port) || port.kbBuy > 0) return 'busy';
    if (this.kerbauCount(t) + 1 > KB.cap) return 'cap';
    if (!this.canAfford(t, KB.buy)) return 'cost';
    this.pay(t, KB.buy); port.kbBuy = KB.buyT; return 'ok';
  };
  const _upd2 = Game.prototype.update;
  Game.prototype.update = function (dt) {
    const r = _upd2.apply(this, arguments);
    for (const b of this.buildings) if (b.kbBuy > 0 && b.hp > 0) {
      b.kbBuy -= dt;
      if (b.kbBuy <= 0) {
        b.kbBuy = 0;
        const p = this.nearestFree(b.tx + b.size / 2, b.ty - 0.5, 0, 5) || this.nearestFree(b.tx + b.size / 2, b.ty + (b.h || b.size) + 0.5, 0, 5);
        if (p && this.kerbauCount(b.team) < KB.cap) {
          const k = this.addUnit('kerbau', 2, p.x + 0.5, p.y + 0.5); k.own = b.team; k.fat = KB.fat0; sendHome(this, k);
          if (b.team === 0) this.msg('A kerbau arrives at the Syahbandar Port.');
        }
      }
    }
    return r;
  };

  // map placement: wild kerbau on every skirmish map, kancil and seladang on the old three, no boar with Melaka
  const _pop = Game.prototype.populate;
  Game.prototype.populate = function () {
    const def = MAPDEF[this.map || 'strait'];
    const melIn = [0, 1].some(t => CV(t) === MEL);
    let saved = null;
    if (def && def.wild && melIn) { saved = def.wild; def.wild = def.wild.filter(w => w[0] !== 'boar'); }
    try { _pop.apply(this, arguments); } finally { if (saved) def.wild = saved; }
    if (this.M) return;
    const S = this.starts || [], rng = this.rng;
    const farFromStarts = (x, y, r) => S.every(st => Math.hypot(x - st.x - 1, y - st.y - 1) > r);
    const land = (x, y) => this.inb(x, y) && this.freeTile(x, y) && !(this.reserve && this.reserve[y * W + x]);
    const spot = (x, y, r) => { for (let k = 0; k < 40; k++) { const a = rng() * 6.283, d = rng() * r, px = Math.round(x + Math.cos(a) * d), py = Math.round(y + Math.sin(a) * d); if (land(px, py) && farFromStarts(px, py, 9)) return { x: px, y: py }; } return null; };
    const herd = (kind, x, y, n) => { const c = spot(x, y, 6); if (!c) return; for (let i = 0; i < n; i++) { const p = this.nearestFree(c.x + (i % 2), c.y + (i >> 1), 0, 3); if (!p) continue; const a = this.addUnit(kind, 2, p.x + 0.5, p.y + 0.5); a.order = { t: 'wander', next: 2 + rng() * 5 }; if (kind === 'kerbau') { a.own = -1; a.fat = KB.fat0; } } };
    if (S.length >= 2) {
      const [A, B] = S, dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const at = (f, o) => [A.x + 1 + dx * f + nx * o, A.y + 1 + dy * f + ny * o];
      // kerbau: a pair on each side, a pair in the middle (fair for both players)
      for (const [f, o] of [[0.3, 10], [0.7, -10], [0.5, 0]]) { const [x, y] = at(f, o); herd('kerbau', x, y, 2); }
      if (!NEW_MAPS[this.map]) {
        for (const [f, o] of [[0.3, -12], [0.7, 12]]) { const [x, y] = at(f, o); herd('kancil', x, y, 2); }
        for (const [f, o] of [[0.42, 16], [0.58, -16]]) { const [x, y] = at(f, o); herd('seladang', x, y, 1); }
      }
    }
  };
  const NEW_MAPS = { highlands: 1, jungle: 1, delta: 1 };

  /* ---------- drawing ---------- */
  const _pn = paintNode;
  paintNode = function (n) {
    if (n.kind !== 'berry') return _pn(n);
    const px = n.tx * TILE, py = n.ty * TILE, spr = berryArt(n);
    shadow(px + 16, py + 28, 11, 4, 0.25); ctx.drawImage(spr, px + 16 - spr.width / 2, py + 31 - spr.height);
    if (isSel(n)) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(px + 2, py + 2, 28, 28); }
  };
  const _ni = nodeIcon;
  nodeIcon = function (n) { if (n.kind === 'berry') return dataURL('ni|banana', () => fitIcon(bananaSprite(), 44)); return _ni(n); };
  const _pu = paintUnit;
  paintUnit = function (u) {
    if (u.kind !== 'kerbau') return _pu(u);
    const px = u.x * TILE, py = u.y * TILE, col = u.own >= 0 ? (TEAMC[CV(u.own)] || TEAMC[0]) : null;
    const pose = u.own >= 0 ? (u.pose || 0) : 0, fr = pose === 1 ? Math.floor((u.anim || 0) * 2.5) % 2 : u.moving ? Math.floor(u.anim * (pose === 2 ? 3 : 5)) % 2 : 0;
    const spr = kerbauSprite(col, fr, fatStage(u), pose), ox = pose === 2 ? 20 : 0;
    const wal = !!u.wallow; if (!wal) shadow(px, py + 4, 12, 3);
    if (isSel(u)) { ctx.strokeStyle = col ? col.ring : '#ddd'; ctx.lineWidth = 1.5; ell(px, py + 4, 14, 5); ctx.stroke(); }
    ctx.save(); ctx.translate(px, py); if (u.face < 0) ctx.scale(-1, 1);
    if (pose === 1 && u.job === 'granary' && !wal) { ctx.drawImage(haySprite(), 19, 6 - 11); }     // padi straw from the granary
    if (wal) { ctx.save(); ctx.beginPath(); ctx.rect(-80, -90, 160, 89); ctx.clip(); }
    ctx.drawImage(spr, -(spr.width - ox) / 2 - ox, 6 - spr.height);
    if (wal) { ctx.restore(); const ph = Math.sin(nowS * 2 + u.id) * 1.5; ctx.fillStyle = 'rgba(214,240,255,0.8)'; ctx.fillRect(-15 + ph, -2, 10, 2); ctx.fillRect(3 - ph, -1, 12, 2); }
    ctx.restore();
    if (u.own >= 0 && u.job === 'granary' && u.arrived && u.fat < KB.fatMax) {   // gold fattening bar
      const f = (u.fat - KB.fat0) / (KB.fatMax - KB.fat0);
      const by = py + 6 - spr.height + 6; ctx.fillStyle = '#17110c'; ctx.fillRect(px - 9, by, 18, 4); ctx.fillStyle = GOLD; ctx.fillRect(px - 8, by + 1, Math.round(16 * f), 2);
    } else if (u.hp < u.maxHp || settings.bars === 'always') hpBar(px - 8, py + 6 - spr.height + 6, 16, u.hp / u.maxHp);
  };
  const _ui = unitIcon;
  unitIcon = function (kind, team) { if (kind === 'kerbau') return dataURL('ui|kerbau', () => fitIcon(kerbauSprite(null, 0, 1), 44)); return _ui(kind, team); };
  const _bs = buildingSprite;
  buildingSprite = function (kind, team, level) { if (kind === 'port' && team !== 2 && melaka(team) && typeof G !== 'undefined' && G && G.teamAge && G.teamAge(team) >= 2) return syahbandarSprite(CV(team)); return _bs(kind, team, level); };

  /* ---------- panel and commands ---------- */
  const mine = (o) => o && o.isUnit && o.kind === 'kerbau' && o.hp > 0 && o.own === 0;
  const _bp = buildPanel;
  buildPanel = function () {
    _bp();
    const single = sel.length === 1 ? sel[0] : null, P = $('panel'); if (!single || !P) return;
    const cm = P.querySelector('.p-cmds'), nm = P.querySelector('.p-name'), sub = P.querySelector('.p-sub');
    if (single.isUnit && single.kind === 'kerbau') {
      const k = single, cnt = G.kerbauCount(0);
      const subTxt = () => k.own === 0 ? (k.job === 'plough' ? (k.arrived ? 'Ploughing \u00b7 ' : 'Going to plough \u00b7 ') : k.job === 'stay' ? (k.arrived ? 'Grazing \u00b7 ' : 'Walking \u00b7 ') : k.job === 'granary' ? (k.arrived && k.fat < KB.fatMax ? 'Fattening ' : 'Granary ') + Math.round(k.fat) + ' food \u00b7 ' : Math.round(k.fat) + ' food \u00b7 ') + 'Kerbau ' + G.kerbauCount(0) + '/' + KB.cap : k.own === 1 ? 'Enemy kerbau: walk a unit up to lead it away' : 'Wild: walk any unit up to it to claim it';
      pdyn.push(() => { const e = P.querySelector('.p-sub'); if (e) e.textContent = subTxt(); });
      if (k.own === 0 && cm) {
        let h = '<button class="cmd" data-a="kb-gran" title="Fatten it at a granary"><img alt="" src="' + bldIcon('granary', 0) + '"><span class="nm">Granary</span><span class="ct">fatten</span></button>';
        if (melaka(0)) h += '<button class="cmd" data-a="kb-plough" title="Kerbau Minang: plough a worked farm, +30% food"><img alt="" src="' + bldIcon('farm', 0) + '"><span class="nm">Plough</span><span class="ct">+30%</span></button>';
        if (k.job !== 'plough') h += '<button class="cmd" data-a="kb-butcher" title="Butcher it now for its food"><img alt="" src="' + resIcon('food') + '"><span class="nm">Butcher</span><span class="ct" id="kb-food">' + Math.round(k.fat) + '</span></button>';
        cm.innerHTML = h;
        pdyn.push(() => { const e = $('kb-food'); if (e) e.textContent = Math.round(k.fat); });
      }
      const line = document.createElement('div'); line.className = 'p-line';
      line.textContent = k.own === 0 ? (k.job === 'plough' ? 'Ploughing: the farm gathers 30% faster while a villager works it.' : k.job === 'granary' ? 'Fattening at the granary: 200 to 400 food over about 4 minutes. Tap Butcher when you want it.' : k.job === 'stay' ? 'Grazing here. Tap a granary or farm to put it to work.' : 'Build a granary to fatten it.') + ' Tap the ground to lead it.' : 'Kerbau give 200 food, or up to 400 after fattening at a granary.';
      const info = P.querySelector('.p-info'); if (info) info.appendChild(line);
    } else if (single.isBld && isSyah(single) && single.team === 0) {
      if (nm) nm.innerHTML = 'Syahbandar Port <span class="en">(Harbour Master)</span>';
      if (cm && single.done) {
        cm.insertAdjacentHTML('afterbegin', '<button class="cmd" data-a="kb-buy" data-tk="kb" title="Buy a kerbau from Java or Siam (75 gold)"><img alt="" src="' + unitIcon('kerbau', 0) + '"><span class="nm">Kerbau <span id="kb-cnt">' + G.kerbauCount(0) + '/' + KB.cap + '</span></span><span class="ct">' + KB.buy.gold + 'g</span></button>');
        pdyn.push(() => { const e = $('kb-cnt'); if (e) e.textContent = single.kbBuy > 0 ? Math.ceil(single.kbBuy) + 's' : G.kerbauCount(0) + '/' + KB.cap; const bt = document.querySelector('#panel [data-a="kb-buy"]'); if (bt) bt.classList.toggle('no', single.kbBuy > 0 || G.kerbauCount(0) >= KB.cap || !G.canAfford(0, KB.buy)); });
      }
    }
  };
  const _co = Game.prototype.costOf;
  if (_co) Game.prototype.costOf = function (k, t) { return k === 'kb' ? KB.buy : _co.apply(this, arguments); };
  $('panel').addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]'); if (!el || !started || paused) return;
    const a = el.dataset.a; if (!a.startsWith('kb-')) return;
    const s = sel[0];
    if (a === 'kb-buy') { const r = G.buyKerbau(s); toast(r === 'ok' ? 'A kerbau is on its way.' : r === 'cap' ? 'You already keep ' + KB.cap + ' kerbau.' : r === 'cost' ? 'Not enough gold.' : 'One kerbau at a time.'); panelKey = ''; return; }
    if (!mine(s)) return;
    if (a === 'kb-gran') { G.kerbauToGranary(s, null); toast(s.job === 'granary' ? 'Off to the granary to fatten.' : 'Every granary is full: build another.'); }
    else if (a === 'kb-plough') { toast(G.kerbauPlough(s, null) ? 'Ploughing the nearest worked farm.' : 'No free farm to plough.'); }
    else if (a === 'kb-butcher') { if (G.butcherKerbau(s)) { toast('Send villagers to gather the meat.'); select([]); } }
    panelKey = '';
  });
  // tap a granary or a farm with your kerbau selected
  const _cc = contextCommand;
  contextCommand = function (wx, wy) {
    const ks = sel.length && sel.every(mine) ? sel.slice() : null;
    if (ks) {
      const hit = G.pick(wx, wy);
      if (hit && hit.isBld && hit.team === 0 && (hit.kind === 'granary' || hit.kind === 'baray')) {
        let n = 0; for (const k of ks) if (G.kerbauToGranary(k, hit)) n++; else G.kerbauToGranary(k, null);
        toast(n ? (hit.kind === 'baray' ? 'Off to wallow in the Baray: they fatten 50% faster there.' : 'Off to the granary to fatten.') : 'That ' + (hit.kind === 'baray' ? 'Baray' : 'granary') + ' already has ' + KB.perGran + ' kerbau.'); addMarker(hit.x, hit.y, 'gather', hit); panelKey = ''; return;
      }
      if (hit && hit.isBld && hit.team === 0 && FIELD[hit.kind] && melaka(0)) {
        const ok = G.kerbauPlough(ks[0], hit); for (const k of ks.slice(1)) G.kerbauPlough(k, null);
        toast(ok ? 'Ploughing this farm.' : 'That farm already has a kerbau.'); addMarker(hit.x, hit.y, 'gather', hit); panelKey = ''; return;
      }
      ks.forEach((k, i) => G.kerbauStay(k, wx + (i % 3 - 1) * 0.9, wy + Math.floor(i / 3) * 0.9));
      addMarker(wx, wy, 'move'); panelKey = ''; return;
    }
    return _cc.apply(this, arguments);
  };
  window.KERBAU_ART = { kerbauSprite, bananaSprite, syahbandarSprite, haySprite };
})();
/* ===== end animal pack ===== */
