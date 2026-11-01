/* ------------------------------ sound ------------------------------ */
/* chiptune sounds and music made in WebAudio (no files), from the Rise of Melaka demo: a Malay asli melody
   over rebana and gong in peace, a faster joget with gendang drums when the enemy is in sight. */
const SFX = (() => {
  let ac = null, master = null, sfxBus = null, musBus = null;
  const last = {};
  function unlock() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ac = new AC(); master = ac.createGain(); master.gain.value = 0.22; master.connect(ac.destination);
      sfxBus = ac.createGain(); sfxBus.connect(master);
      musBus = ac.createGain(); musBus.gain.value = settings.music === 'off' ? 0 : 0.4; musBus.connect(master);
      setInterval(schedule, 90);
    }
    if (ac.state === 'suspended') ac.resume();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, unlock, { passive: true }));
  // phones suspend audio in the background; wake it again on return
  document.addEventListener('visibilitychange', () => { if (ac && !document.hidden && ac.state === 'suspended') ac.resume(); });
  function note(type, t0, len, f, f2, vol, out) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + len);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.5, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    o.connect(g); g.connect(out || sfxBus); o.start(t0); o.stop(t0 + len + 0.02);
  }
  const tone = (type, at, len, f, f2, vol) => note(type, ac.currentTime + at, len, f, f2, vol);
  let noiseBuf = null;
  function noiseAt(t0, len, vol, cut, out, high) {
    if (!noiseBuf) {
      const n = ac.sampleRate; noiseBuf = ac.createBuffer(1, n, ac.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    f.type = high ? 'highpass' : 'lowpass'; f.frequency.value = cut || 900;
    g.gain.setValueAtTime(vol || 0.6, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    src.buffer = noiseBuf; src.connect(f); f.connect(g); g.connect(out || sfxBus); src.start(t0); src.stop(t0 + len + 0.02);
  }
  const noise = (at, len, vol, cut, high) => noiseAt(ac.currentTime + at, len, vol, cut, null, high);
  const drum = (at, v) => { tone('triangle', at, 0.22, 140, 50, v || 0.9); noise(at, 0.12, 0.35, 600); };
  const notes = (type, seq, step, vol) => seq.forEach((f, i) => f && tone(type, i * step, step * 0.95, f, 0, vol));
  const BANK = {
    attack: () => { notes('square', [880, 660, 880, 660], 0.11, 0.28); },
    wave: () => { drum(0); drum(0.18); drum(0.36, 1); drum(0.7, 1); tone('sawtooth', 0.7, 0.5, 196, 185, 0.18); },
    done: () => { notes('square', [523, 659, 784], 0.07, 0.2); },
    warn: () => { tone('triangle', 0, 0.3, 392, 370, 0.35); },
    victory: () => { notes('square', [523, 523, 523, 659, 784, 0, 659, 784, 1047, 1047], 0.13, 0.3); notes('triangle', [262, 0, 262, 0, 392, 0, 330, 0, 523, 523], 0.13, 0.4); },
    defeat: () => { notes('triangle', [392, 370, 330, 294, 262, 0, 196], 0.22, 0.45); drum(0); drum(1.3, 0.7); },
    click: () => { tone('square', 0, 0.04, 1200, 0, 0.12); },
    selVil: () => { tone('square', 0, 0.05, 988, 0, 0.14); tone('square', 0.05, 0.06, 1319, 0, 0.12); },
    selMil: () => { tone('square', 0, 0.07, 330, 0, 0.18); tone('square', 0.06, 0.08, 440, 0, 0.16); },
    selShip: () => { tone('triangle', 0, 0.12, 262, 247, 0.3); tone('square', 0.08, 0.07, 523, 0, 0.1); },
    selBld: () => { tone('triangle', 0, 0.08, 220, 160, 0.4); noise(0, 0.05, 0.2, 1200); },
    move: () => { tone('square', 0, 0.05, 659, 0, 0.14); tone('square', 0.05, 0.07, 784, 0, 0.13); },
    attackCmd: () => { tone('sawtooth', 0, 0.09, 220, 330, 0.16); tone('square', 0.08, 0.08, 440, 0, 0.14); },
    work: () => { noise(0, 0.04, 0.3, 2500); tone('triangle', 0, 0.06, 523, 0, 0.25); tone('triangle', 0.07, 0.06, 659, 0, 0.22); },
    place: () => { tone('triangle', 0, 0.12, 180, 90, 0.5); noise(0, 0.08, 0.35, 700); tone('square', 0.1, 0.06, 784, 0, 0.12); },
    train: () => { tone('square', 0, 0.04, 1568, 0, 0.12); tone('square', 0.045, 0.08, 2093, 0, 0.1); },
    ui: () => { tone('square', 0, 0.025, 1400, 0, 0.08); },
    // combat on screen
    hit: () => { noise(0, 0.05, 0.28, 1800); tone('square', 0, 0.03, 260, 180, 0.07); },
    arrow: () => { noise(0, 0.09, 0.12, 4000, true); },
    gun: () => { noise(0, 0.07, 0.4, 3000); tone('square', 0, 0.04, 180, 70, 0.12); },
    boom: () => { noise(0, 0.35, 0.7, 450); tone('triangle', 0, 0.3, 110, 35, 0.8); },
    death: () => { tone('square', 0, 0.12, 330, 150, 0.1); },
    collapse: () => { noise(0, 0.6, 0.6, 500); tone('triangle', 0, 0.5, 90, 40, 0.6); },
    sink: () => { noise(0, 0.5, 0.3, 700); tone('sine', 0, 0.6, 330, 80, 0.3); },
    fire: () => { noise(0, 0.4, 0.35, 900); tone('sawtooth', 0, 0.25, 140, 90, 0.08); },
    splash: () => { noise(0, 0.25, 0.25, 1200); },
    land: () => { noise(0, 0.15, 0.2, 900); notes('square', [392, 523], 0.08, 0.14); }
  };
  const GAP = { attack: 9, click: 0.05, ui: 0.04, selVil: 0.08, selMil: 0.08, selShip: 0.08, selBld: 0.08, move: 0.08, attackCmd: 0.08, work: 0.08, place: 0.1, train: 0.06,
    hit: 0.11, arrow: 0.14, gun: 0.09, boom: 0.25, death: 0.15, collapse: 0.5, sink: 0.5, fire: 0.6, splash: 0.2, done: 0.5 };
  function play(name) {
    if (settings.sound === 'off' || !ac || ac.state !== 'running' || !BANK[name]) return;
    const now = ac.currentTime;
    if (last[name] != null && now - last[name] < (GAP[name] || 0.3)) return;
    last[name] = now;
    try { BANK[name](); } catch (e) { /* audio hiccup */ }
  }
  // music: Malay ghazal mode (D Eb F# G A Bb C)
  const mid = n => 440 * Math.pow(2, (n - 69) / 12);
  const D4 = 62, Eb4 = 63, Fs4 = 66, G4 = 67, A4 = 69, Bb4 = 70, C5 = 72, D5 = 74, Eb5 = 75, Fs5 = 78, G5 = 79;
  const LEAD = [
    A4, Bb4, A4, G4, Fs4, 0, G4, A4,   D5, 0, C5, Bb4, A4, 0, 0, 0,
    Bb4, C5, D5, 0, Eb5, D5, C5, Bb4,  A4, 0, G4, Fs4, G4, A4, 0, 0,
    A4, D5, 0, D5, Eb5, D5, C5, Bb4,   C5, Bb4, A4, G4, A4, 0, 0, 0,
    G4, A4, Bb4, 0, A4, G4, Fs4, Eb4,  D4, 0, 0, 0, Fs4, G4, A4, 0
  ];
  const FIGHT = [
    D5, Eb5, Fs5, G5, Fs5, Eb5, D5, 0,  C5, D5, Eb5, D5, C5, Bb4, A4, 0,
    A4, Bb4, A4, G4, Fs4, G4, A4, 0,    D5, 0, A4, 0, D5, Eb5, D5, 0
  ];
  const ROOTS = [50, 48, 43, 50, 50, 51, 43, 50];
  const REBANA = [1, 0, 0, 2, 1, 0, 2, 0];
  let musT = 0, step = 0, battle = false, quiet = true;
  function schedule() {
    if (!ac || ac.state !== 'running') return;
    if (!started) { menuTheme(); return; }
    const e8 = 60 / (battle ? 132 : 84) / 2;
    if (musT < ac.currentTime) musT = ac.currentTime + 0.05;
    while (musT < ac.currentTime + 0.3) {
      const v = quiet ? 0.45 : 1, b8 = step % 8;
      if (battle) {
        const i = step % FIGHT.length, root = ROOTS[Math.floor(i / 8) * 2 % 8];
        if (FIGHT[i]) note('square', musT, e8 * 0.9, mid(FIGHT[i]), 0, 0.12 * v, musBus);
        if (b8 % 2 === 0) note('triangle', musT, e8 * 1.5, mid(b8 % 4 === 0 ? root : root + 7), 0, 0.4 * v, musBus);
        if (b8 % 2 === 0) noiseAt(musT, 0.11, (b8 % 4 === 0 ? 0.55 : 0.32) * v, 450, musBus);
        else noiseAt(musT, 0.03, 0.14 * v, 5000, musBus, true);
        if (i === 0) note('triangle', musT, 1.6, mid(43), mid(42), 0.5 * v, musBus);
      } else {
        const i = step % LEAD.length, root = ROOTS[Math.floor(i / 8)];
        if (LEAD[i]) note('sawtooth', musT, e8 * (LEAD[i + 1] === 0 ? 1.8 : 0.95), mid(LEAD[i]), 0, 0.09 * v, musBus);
        if (LEAD[i]) note('triangle', musT, e8 * 0.9, mid(LEAD[i]), 0, 0.18 * v, musBus);
        if (LEAD[i] && b8 % 2 === 0) note('triangle', musT, e8 * 0.6, mid(LEAD[i] - 12), 0, 0.12 * v, musBus);
        if (b8 === 0 || b8 === 4) note('triangle', musT, e8 * 3, mid(b8 === 0 ? root : root + 7), 0, 0.38 * v, musBus);
        if (REBANA[b8] === 1) noiseAt(musT, 0.12, 0.3 * v, 380, musBus);
        else if (REBANA[b8] === 2) noiseAt(musT, 0.04, 0.16 * v, 3200, musBus, true);
        if (i % 32 === 0) note('triangle', musT, 2.4, mid(43), mid(42), 0.55 * v, musBus);
      }
      musT += e8; step++;
    }
  }
  /* the menus: the asli melody slowed right down on a soft triangle, a gambus pluck under it,
     the sea washing in every two bars and a gong every four */
  function menuTheme() {
    const e8 = 60 / 66 / 2;
    if (musT < ac.currentTime) musT = ac.currentTime + 0.05;
    while (musT < ac.currentTime + 0.3) {
      const i = step % LEAD.length, b8 = step % 8, root = ROOTS[Math.floor(i / 8)];
      if (LEAD[i]) note('triangle', musT, e8 * (LEAD[i + 1] === 0 ? 2.4 : 1.2), mid(LEAD[i]), 0, 0.22, musBus);
      if (LEAD[i] && b8 % 2 === 0) note('triangle', musT, e8 * 0.5, mid(LEAD[i] - 12), 0, 0.1, musBus);
      if (b8 === 0) note('sine', musT, e8 * 7.5, mid(root), 0, 0.3, musBus);
      if (b8 === 4) note('sine', musT, e8 * 3.5, mid(root + 7), 0, 0.18, musBus);
      if (i % 16 === 0) noiseAt(musT, e8 * 6, 0.09, 520, musBus);
      if (i % 32 === 0) note('triangle', musT, 3.2, mid(43), mid(42), 0.45, musBus);
      musT += e8; step++;
    }
  }
  function setMood(b, q) { if (!!b !== battle) step = 0; battle = !!b; quiet = !!q; }
  function apply() { if (musBus) musBus.gain.setTargetAtTime(settings.music === 'off' ? 0 : 0.4, ac.currentTime, 0.1); }
  return { play, setMood, apply, unlock };
})();

// which sound goes with which game message
function sfxForMsg(text) {
  if (text === 'We are under attack!') return 'attack';
  if (/destroyed!$/.test(text)) return 'collapse';
  if (/ complete\.$/.test(text)) return 'done';
  if (/landed\.$/.test(text)) return 'land';
  if (/^Population limit|is full\.$|^No beach|need a Port/.test(text)) return 'warn';
  if (/went down with/.test(text)) return 'sink';
  return null;
}
(function hookSound() {
  const seen = (x, y) => inView(x * TILE, y * TILE, 60) && (!G || G.isVisible(x, y));
  const _select = select;
  let lastPick = '';
  select = function (list) {
    _select(list);
    const key = sel.map(o => o.id).join(',');
    if (key === lastPick) return; lastPick = key;
    const o = sel[0]; if (!o || o.team !== 0 || !started) return;
    SFX.play(o.isBld ? 'selBld' : o.cls === 'vil' ? 'selVil' : o.layer === 1 ? 'selShip' : 'selMil');
  };
  const _issue = issue;
  issue = function (wx, wy, hit) {
    const had = selUnits().length, am = !!(mode && mode.kind === 'amove');
    const r = _issue(wx, wy, hit);
    if (had) SFX.play(hit && hit.team === 1 ? 'attackCmd' : hit && (hit.isNode || (hit.isBld && hit.team === 0)) ? 'work' : am ? 'attackCmd' : 'move');
    return r;
  };
  const _tryPlace = tryPlace;
  tryPlace = function (keep) { const r = _tryPlace(keep); if (r) SFX.play('place'); return r; };
  const P = Game.prototype;
  const _queue = P.queueUnit;
  P.queueUnit = function (b, kind, team) { const err = _queue.call(this, b, kind, team); if (!err && b && b.team === 0 && this === G) SFX.play('train'); return err; };
  const _msg = P.msg;
  P.msg = function (text) { _msg.call(this, text); if (this === G) { const k = sfxForMsg(text); if (k) SFX.play(k); } };
  const _dmg = P.damage;
  P.damage = function (att, tgt, w) {
    _dmg.call(this, att, tgt, w);
    if (this === G && att && !att.ranged && !(w && w.ranged) && tgt && seen(tgt.x, tgt.y)) SFX.play('hit');
  };
  const _kill = P.onKilled;
  P.onKilled = function (t, att) {
    _kill.call(this, t, att);
    if (this !== G || !seen(t.x, t.y)) return;
    if (t.isBld) SFX.play('collapse'); else if (t.kind === 'fireship' || t.kind === 'raft') SFX.play('fire'); else if (t.layer === 1) SFX.play('sink'); else if (t.cls !== 'animal') SFX.play('death');
  };
  const _ign = P.ignite;
  P.ignite = function (t, team) { const was = !!t.burn; _ign.call(this, t, team); if (this === G && !was && t.burn && seen(t.x, t.y)) SFX.play('fire'); };
  const _end = endGame;
  endGame = function () { _end(); SFX.play(G.over === 'win' ? 'victory' : 'defeat'); };
  $('panel').addEventListener('click', (e) => { if (e.target.closest('[data-a]')) SFX.play('ui'); }, true);
  $('menu').addEventListener('click', (e) => { if (e.target.closest('button, a')) SFX.play('click'); }, true);
})();
// once a frame: shots that just left the bow or gun on screen, and the music's mood
const sfxArrows = new WeakSet();
function sfxTick() {
  if (!started || !G) { SFX.setMood(false, true); return; }
  for (const a of G.arrows) {
    if (sfxArrows.has(a)) continue; sfxArrows.add(a);
    if (!inView(a.x0 * TILE, a.y0 * TILE, 60)) continue;
    SFX.play(a.k === 'ball' ? 'boom' : a.k === 'shot' || a.k === 'bullet' ? 'gun' : 'arrow');
  }
  const foes = !G.over && G.units.some(u => u.team === 1 && u.hp > 0 && u.cls !== 'vil' && u.cls !== 'boat' && G.isVisible(u.x, u.y));
  SFX.setMood(foes, paused);
}

function endGame() {
  ended = true; paused = true; if (curSlot != null) { slotDel(curSlot); curSlot = null; }
  const win = G.over === 'win';
  $('end-title').textContent = win ? 'Victory' : 'Defeat';
  $('end-title').className = win ? 'win' : 'lose';
  $('end-sub').textContent = win ? 'The ' + CIV_TITLE[CV(1)] + ' ' + civName('towncentre', 1) + ' has fallen. ' + CIV_TITLE[CV(0)] + ' rises.' : 'Your ' + civName('towncentre', 0) + ' has fallen. ' + CIV_TITLE[CV(1)] + ' holds the field.';
  $('end-stats').innerHTML = '<div><b>' + fmtTime(G.t) + '</b><span>Time</span></div><div><b>' + G.stats.kills + '</b><span>Enemies defeated</span></div><div><b>' + G.stats.lost + '</b><span>Units lost</span></div><div><b>' + G.stats.trained + '</b><span>Units trained</span></div>';
  showOv('end');
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-do]'); if (!el) return;
  const a = el.dataset.do;
  if (a === 'diff') { diff = el.dataset.v; document.querySelectorAll('[data-do="diff"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === diff ? 'true' : 'false')); }
  else if (a === 'start') startGame(seedUsed);
  else if (a === 'resume') togglePause();
  else if (a === 'restart') startGame(seedUsed);
  else if (a === 'newmap') startGame(1 + Math.floor(Math.random() * 900000));
  else if (a === 'speed') { speed = +el.dataset.v; document.querySelectorAll('[data-do="speed"]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.v === speed ? 'true' : 'false')); }
  else if (a === 'help') { helpBack = !$('ov-pause').hidden ? 'pause' : (!$('ov-end').hidden ? 'end' : 'menu'); showOv('help'); }
  else if (a === 'back') { if (helpBack === 'menu') showOv(null); else showOv(helpBack); }
  else if (a === 'quit') quitToMenu();
  else if (a === 'discard') confirmBox('Exit without saving?', 'Nothing from this game will be saved. Your saved games stay as they were before you started it.', 'Exit', discardGame);
  else if (a === 'home') { started = false; showOv(null); $('hud').hidden = true; showMenu('home'); }
});
let helpBack = 'menu';
$('btn-menu').addEventListener('click', togglePause);
$('btn-idle').addEventListener('click', () => { if (started && !paused) cycleIdle(); });
$('btn-army').addEventListener('click', () => { if (started && !paused) selectArmy(); });
$('btn-zin').addEventListener('click', () => setZoom(view.zoom * 1.25));
$('btn-zout').addEventListener('click', () => setZoom(view.zoom / 1.25));

