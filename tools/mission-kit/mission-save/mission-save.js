/* Save and continue for a mission or battle page: an autosave every 30 s and on leaving the app,
   "Save and exit" on the pause card, "Continue saved game" on the start card. Saves go into the game's
   3 shared slots (seak-slots / seak-slot-N), which the main menu's Load game lists; the menu opens a
   mission save as this page with ?slot=N. Works on any page built
   from the game: it saves the whole Game, writing units, buildings and resources that point at each
   other as {$r: id} and joining them up again on load. Page-specific state goes through MSAVE_CFG. */
(function () {
  const CFG = window.MSAVE_CFG || {};
  const folder = location.pathname.replace(/index\.html$/, '').split('/').filter(Boolean).pop() || 'page';
  const OLDKEY = 'seak-mission-' + (CFG.id || folder);
  const PAGE = CFG.page || ((location.pathname.match(/\/SEA-RTS\/(.*?)(index\.html)?$/i) || [])[1] || folder + '/');
  const TITLE = CFG.title || document.title;
  const SLOTS = 'seak-slots', SLOT_N = 3;
  const SKIP = new Set(['byId', 'hash', 'claims', 'pSeen', 'pClosed', 'pG', 'pPar', 'pOpen', 'fx', 'arrows', 'floaters', 'msgs', 'alerts', 'rng', 'burning']);
  const TA = { Uint8Array, Int8Array, Uint16Array, Int16Array, Int32Array, Uint32Array, Float32Array, Float64Array, Uint8ClampedArray };
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }, del: (k) => { try { localStorage.removeItem(k); } catch (e) { /* none */ } } };

  /* the 3 save slots, shared with the main menu */
  function metas() { try { const a = JSON.parse(ls.get(SLOTS)); if (Array.isArray(a)) return a.concat([null, null, null]).slice(0, SLOT_N); } catch (e) { /* none yet */ } return [null, null, null]; }
  function pick(cur) { if (cur != null) return cur; const m = metas(), free = m.findIndex((x) => !x); if (free >= 0) return free; let o = 0; m.forEach((x, i) => { if (x.when < m[o].when) o = i; }); return o; }
  const bak = {};   // what each slot held before this visit first wrote to it, for Exit without saving
  function slotWrite(i, meta, rec) { if (!(i in bak)) bak[i] = [metas()[i], ls.get('seak-slot-' + i)]; if (!ls.set('seak-slot-' + i, JSON.stringify(rec))) return false; const m = metas(); m[i] = Object.assign(meta, { when: Date.now() }); ls.set(SLOTS, JSON.stringify(m)); return true; }
  function slotRead(i) { try { const r = JSON.parse(ls.get('seak-slot-' + i)); return r && r.snap ? r : null; } catch (e) { return null; } }
  function slotDel(i) { ls.del('seak-slot-' + i); const m = metas(); m[i] = null; ls.set(SLOTS, JSON.stringify(m)); }
  // this page's newest save
  function latest() { let b = -1; metas().forEach((x, i) => { if (x && x.page === PAGE && (b < 0 || x.when > metas()[b].when)) b = i; }); return b; }
  let cur = null;   // the slot this game saves into; a new game takes a free slot (or the oldest) on its first save
  // a save from before the slots: move it into one
  (function migrate() { const old = ls.get(OLDKEY); if (!old) return; try { const r = JSON.parse(old); if (r && r.snap && latest() < 0) { if (!r.opts) r.opts = { seed: r.snap.seed, diff: r.snap.diff, map: r.snap.map, civs: r.snap.civs }; slotWrite(pick(null), { kind: 'mission', page: PAGE, title: TITLE, t: r.snap.t || 0, diff: r.diff }, r); } } catch (e) { /* drop it */ } ls.del(OLDKEY); })();

  let ENT = new Set(), stack = new Set();
  function enc(v, own) {
    if (v === null || typeof v !== 'object') return typeof v === 'function' ? undefined : v;
    if (!own && ENT.has(v)) return { $r: v.id };
    if (ArrayBuffer.isView(v)) return { $ta: v.constructor.name, d: Array.from(v) };
    if (v instanceof WeakSet || v instanceof WeakMap || (typeof Node !== 'undefined' && v instanceof Node) || (typeof ImageBitmap !== 'undefined' && v instanceof ImageBitmap)) return undefined;
    if (stack.has(v)) return null;
    stack.add(v);
    let out;
    if (v instanceof Set) out = { $set: Array.from(v, (x) => enc(x)) };
    else if (v instanceof Map) out = { $map: Array.from(v, ([a, b]) => [enc(a), enc(b)]) };
    else if (Array.isArray(v)) out = v.map((x) => { const e = enc(x); return e === undefined ? null : e; });
    else {
      out = {};
      for (const k of Object.keys(v)) {
        const e = k === 'cargo' && Array.isArray(v[k]) ? v[k].map((x) => enc(x, true)) : enc(v[k]);
        if (e !== undefined) out[k] = e;
      }
    }
    stack.delete(v);
    return out;
  }
  function collect(g) {
    ENT = new Set();
    const add = (e) => { if (!e || typeof e !== 'object' || ENT.has(e)) return; ENT.add(e); if (Array.isArray(e.cargo)) e.cargo.forEach(add); };
    for (const k of ['units', 'buildings', 'nodes']) (g[k] || []).forEach(add);
  }
  function dec(v) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(dec);
    if (v.$ta) return new (TA[v.$ta] || Float64Array)(v.d);
    if (v.$set) return new Set(v.$set.map(dec));
    if (v.$map) return new Map(v.$map.map(([a, b]) => [dec(a), dec(b)]));
    const o = {}; for (const k of Object.keys(v)) o[k] = dec(v[k]); return o;
  }
  function relink(v, byId, seen) {
    if (v === null || typeof v !== 'object' || ArrayBuffer.isView(v) || seen.has(v)) return v;
    if (v.$r !== undefined && Object.keys(v).length === 1) return byId.get(v.$r) || null;
    seen.add(v);
    if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) v[i] = relink(v[i], byId, seen); }
    else if (v instanceof Set) { const a = Array.from(v); v.clear(); for (const x of a) v.add(relink(x, byId, seen)); }
    else if (v instanceof Map) { const a = Array.from(v); v.clear(); for (const [p, q] of a) v.set(relink(p, byId, seen), relink(q, byId, seen)); }
    else for (const k of Object.keys(v)) v[k] = relink(v[k], byId, seen);
    return v;
  }

  let discarded = false;
  function save() {
    try {
      if (discarded || !started || ended || !G || G.over) return;
      collect(G);
      const snap = {};
      for (const k of Object.keys(G)) {
        if (SKIP.has(k)) continue;
        const e = (k === 'units' || k === 'buildings' || k === 'nodes') && Array.isArray(G[k]) ? G[k].map((x) => enc(x, true)) : enc(G[k]);
        if (e !== undefined) snap[k] = e;
      }
      const rec = { v: 1, snap, opts: Object.assign({ seed: G.seed, diff: G.diff, map: G.map }, CFG.opts ? CFG.opts(G) : {}), extra: CFG.extra ? enc(CFG.extra()) : null,
        seed: seedUsed, diff, cam: { x: cam.x, y: cam.y }, zoom: view.zoom, t: G.t, when: Date.now() };
      ENT = new Set();
      cur = pick(cur);
      if (!slotWrite(cur, { kind: 'mission', page: PAGE, title: TITLE, t: G.t, diff }, rec) && typeof toast === 'function') toast('Could not save: the phone\'s storage for this app is full.');
    } catch (e) { console.warn('save', e); }
  }
  function read(i) { return i != null && i >= 0 ? slotRead(i) : null; }
  function restore(r) {
    const g = new Game(r.opts);
    const s = dec(r.snap), extra = dec(r.extra);
    if (s.terrain && s.terrain.length !== W * H) throw new Error('saved on a map of another size');   // e.g. Singapura went 64x48 -> 96x72
    for (const k of Object.keys(s)) g[k] = s[k];
    g.byId = new Map();
    const reg = (e) => { if (!e || typeof e !== 'object' || e.id === undefined) return; g.byId.set(e.id, e); if (Array.isArray(e.cargo)) e.cargo.forEach(reg); };
    for (const k of ['units', 'buildings', 'nodes']) (g[k] || []).forEach(reg);
    const seen = new Set();
    for (const k of Object.keys(s)) g[k] = relink(g[k], g.byId, seen);
    const ex = relink(extra, g.byId, seen);
    if (g.burning instanceof Set) { g.burning.clear(); for (const e of g.units.concat(g.buildings)) if (e.burn) g.burning.add(e); }
    if (g.rebuildHash) g.rebuildHash();
    if (g.updateFog) g.updateFog();
    return [g, ex];
  }
  function cont(slot) {
    const i = typeof slot === 'number' ? slot : latest(), r = read(i); if (!r) return;
    let g, ex;
    try { [g, ex] = restore(r); } catch (e) { console.warn('load', e); slotDel(i); sync(); if (typeof toast === 'function') toast('That saved game could not be loaded.'); return; }
    cur = i;
    diff = r.diff; seedUsed = r.seed;
    if (CFG.before) CFG.before(ex, g);
    // older pages have loadMap; pages built from the newer game set the view up inline (as its enterGame does)
    if (typeof loadMap === 'function') loadMap(g);
    else { G = g; terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog(); sel = []; mode = null; markers = []; boxRect = null; panelKey = ''; ended = false; acc = 0; seenMsgs = new WeakSet(); idleIdx = 0; }
    storyOpen = null; try { objStarted = false; } catch (e) { /* not on this page */ }
    started = true; paused = false; ended = false; $('hud').hidden = false; showOv(null);
    view.zoom = r.zoom || view.zoom; resize(); cam.x = r.cam.x; cam.y = r.cam.y; clampCam();
    if (CFG.after) CFG.after(ex, g);
    updateHud(); updatePanel();
    G.msg('Saved game loaded.');
  }
  function sync() {
    const b = document.getElementById('msave-cont'); if (!b) return;
    const r = read(latest()); b.hidden = !r;
    if (r) b.textContent = 'Continue saved game (' + fmtTime(r.t || 0) + ' in, ' + r.diff + ')';
  }
  // the start card: Continue sits above Begin
  const start = document.querySelector('#ov-start [data-do="start"]');
  if (start) {
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'msave-cont'; b.type = 'button'; b.hidden = true;
    b.addEventListener('click', () => cont()); start.before(b); sync();
  }
  // anything else on the start card begins a new game, which gets its own slot
  document.addEventListener('click', (e) => { const c = e.target.closest && e.target.closest('#ov-start [data-do]'); if (c && c.dataset.do !== 'diff' && c.dataset.do !== 'help') cur = null; }, true);
  // opened from the main menu's Load game
  const want = +new URLSearchParams(location.search).get('slot');
  if (location.search.includes('slot=')) {
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* keep the address */ }
    const m = metas()[want];
    if (m && m.page === PAGE) setTimeout(() => cont(want), 300);
  }
  // leaving: every exit-to-menu button saves first; the one on the pause card says so
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.exit-home')) save(); }, true);
  setTimeout(() => { const p = document.querySelector('#ov-pause .exit-home'); if (p) { p.textContent = 'Save and exit to main menu'; p.classList.remove('alt'); } }, 0);
  // Exit without saving: asks first, then puts every slot this visit wrote back as it was and leaves
  function discard() {
    discarded = true; started = false;
    const m = metas();
    for (const i of Object.keys(bak)) { const [meta, rec] = bak[i]; if (rec == null) ls.del('seak-slot-' + i); else ls.set('seak-slot-' + i, rec); m[i] = meta || null; }
    ls.set(SLOTS, JSON.stringify(m));
    const home = /github\.io$/.test(location.hostname) ? new URL('../'.repeat(Math.max(1, PAGE.split('/').filter(Boolean).length)), location.href).href : 'https://therediris0827.github.io/SEA-RTS/';
    location.replace(home);
  }
  function ask() {
    if (!document.getElementById('xconf-css')) { const st = document.createElement('style'); st.id = 'xconf-css'; st.textContent = '.xconf{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,11,9,.72)}.xconf .card{max-width:340px}.xconf .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}'; document.head.appendChild(st); }
    const o = document.createElement('div'); o.className = 'xconf';
    o.innerHTML = '<div class="card"><h2>Exit without saving?</h2><p class="lead">Nothing from this game will be saved. Your saved games stay as they were before you started it.</p><div class="row"><button class="btn alt" type="button">Cancel</button><button class="btn" type="button">Exit</button></div></div>';
    const [no, yes] = o.querySelectorAll('button');
    no.addEventListener('click', () => o.remove()); yes.addEventListener('click', discard);
    o.addEventListener('click', (e) => { if (e.target === o) o.remove(); });
    document.body.appendChild(o);
  }
  setTimeout(() => {
    const p = document.getElementById('ov-pause'); if (!p) return;
    p.querySelectorAll('[data-do="discard"]').forEach((b) => b.remove());   // the main game's own button goes to its menu, not the site's
    const b = document.createElement('button'); b.className = 'btn alt exit-nosave'; b.type = 'button'; b.textContent = 'Exit without saving';
    b.addEventListener('click', ask); p.appendChild(b);
  }, 0);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  window.addEventListener('pagehide', save);
  // every 30 s of play; a finished mission clears its save
  let last = Date.now();
  setInterval(() => {
    if (typeof G === 'undefined' || !G) return;
    if (started && G.over) { if (cur != null && metas()[cur] && metas()[cur].page === PAGE) slotDel(cur); cur = null; return; }
    if (started && !paused && Date.now() - last > 30000) { last = Date.now(); save(); }
  }, 2000);
  window.MSAVE = { save, cont, metas, slot: () => cur, page: PAGE, discard };
})();
