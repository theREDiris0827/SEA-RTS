
/* ===== mr-audio.js ===== */
/* chiptune sounds and music (WebAudio, no files). The synth and sound bank follow the Dai Viet demo;
   the music is Melaka's own: a Malay asli/ghazal melody over rebana and gong, nobat drums in battle. */
const SFX = (() => {
  let ctx = null, master = null, sfxBus = null, musBus = null, muted = false, musicOff = false;
  try { muted = localStorage.getItem('mr-mute') === '1'; musicOff = localStorage.getItem('mr-music') === '0'; } catch (e) { /* no storage */ }
  const last = {};
  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.connect(master);
      musBus = ctx.createGain(); musBus.gain.value = musicOff ? 0 : 0.4; musBus.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, unlock, { passive: true }));
  // one note at absolute time t0: wave type, length (s), frequency (Hz), optional slide-to frequency, volume, output
  function note(type, t0, len, f, f2, vol, out) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + len);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.5, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    o.connect(g); g.connect(out || sfxBus); o.start(t0); o.stop(t0 + len + 0.02);
  }
  const tone = (type, at, len, f, f2, vol) => note(type, ctx.currentTime + at, len, f, f2, vol);
  // a short noise burst for drums and hats
  let noiseBuf = null;
  function noiseAt(t0, len, vol, cut, out, high) {
    if (!noiseBuf) {
      const n = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = high ? 'highpass' : 'lowpass'; f.frequency.value = cut || 900;
    g.gain.setValueAtTime(vol || 0.6, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    s.buffer = noiseBuf; s.connect(f); f.connect(g); g.connect(out || sfxBus); s.start(t0); s.stop(t0 + len + 0.02);
  }
  const noise = (at, len, vol, cut) => noiseAt(ctx.currentTime + at, len, vol, cut);
  const drum = (at, v) => { tone('triangle', at, 0.22, 140, 50, v || 0.9); noise(at, 0.12, 0.35, 600); };
  const notes = (type, seq, step, vol) => seq.forEach((f, i) => f && tone(type, i * step, step * 0.95, f, 0, vol));
  const BANK = {
    // alarm: two-tone square klaxon
    attack: () => { notes('square', [880, 660, 880, 660], 0.11, 0.28); },
    // the Citadel itself is hit: lower, longer
    citadel: () => { notes('square', [523, 392, 523, 392, 523, 392], 0.14, 0.32); },
    // scouts sight the column: three soft gong pings
    warn: () => { [0, 0.28, 0.56].forEach(a => tone('triangle', a, 0.45, 392, 370, 0.45)); },
    // a wave comes down the pass: war drums
    wave: () => { drum(0); drum(0.18); drum(0.36, 1); drum(0.7, 1); tone('sawtooth', 0.7, 0.5, 196, 185, 0.18); },
    // a column is broken / an objective met: rising arpeggio
    done: () => { notes('square', [523, 659, 784, 1047], 0.09, 0.3); tone('triangle', 0.36, 0.4, 1047, 0, 0.35); },
    // militia armed
    arm: () => { notes('square', [392, 523], 0.07, 0.2); },
    // a hero falls
    hero: () => { notes('triangle', [440, 349, 262], 0.16, 0.45); },
    // story moment (general falls, rout)
    rout: () => { drum(0); drum(0.2); notes('square', [0, 0, 392, 523, 659, 784, 659, 784, 1047], 0.1, 0.3); },
    victory: () => { notes('square', [523, 523, 523, 659, 784, 0, 659, 784, 1047, 1047], 0.13, 0.3); notes('triangle', [262, 0, 262, 0, 392, 0, 330, 0, 523, 523], 0.13, 0.4); },
    defeat: () => { notes('triangle', [392, 370, 330, 294, 262, 0, 196], 0.22, 0.45); drum(0); drum(1.3, 0.7); },
    // combat: what happens on screen, kept soft so it sits under the music
    clash: () => { tone('square', 0, 0.05, 1760, 1320, 0.1); noise(0, 0.05, 0.18, 4000); },
    thud: () => { tone('triangle', 0, 0.1, 130, 60, 0.35); noise(0, 0.07, 0.22, 500); },
    twang: () => { tone('triangle', 0, 0.07, 620, 300, 0.22); noise(0.02, 0.05, 0.08, 5000); },
    die: () => { tone('square', 0, 0.16, 330, 110, 0.12); },
    collapse: () => { noise(0, 0.7, 0.55, 320); tone('triangle', 0, 0.6, 90, 30, 0.6); noise(0.25, 0.4, 0.3, 900); },
    sink: () => { tone('triangle', 0, 0.8, 360, 70, 0.4); noise(0, 0.5, 0.3, 1500); noise(0.3, 0.6, 0.2, 700); },
    splash: () => { noise(0, 0.18, 0.3, 1800); tone('sine', 0, 0.12, 500, 250, 0.15); },
    raft: () => { noise(0, 0.5, 0.25, 1200); tone('sawtooth', 0.05, 0.3, 200, 400, 0.08); },
    fire: () => { [0, 0.07, 0.16, 0.22].forEach(a => noise(a, 0.04, 0.25, 2500)); noise(0, 0.5, 0.12, 400); },
    click: () => { tone('square', 0, 0.04, 1200, 0, 0.12); },
    // selection: villagers chirp, soldiers grunt, heroes ring, buildings knock
    selVil: () => { tone('square', 0, 0.05, 988, 0, 0.14); tone('square', 0.05, 0.06, 1319, 0, 0.12); },
    selMil: () => { tone('square', 0, 0.07, 330, 0, 0.18); tone('square', 0.06, 0.08, 440, 0, 0.16); },
    selHero: () => { tone('square', 0, 0.06, 587, 0, 0.16); tone('triangle', 0.06, 0.25, 880, 0, 0.3); },
    selBld: () => { tone('triangle', 0, 0.08, 220, 160, 0.4); noise(0, 0.05, 0.2, 1200); },
    // orders
    move: () => { tone('square', 0, 0.05, 659, 0, 0.14); tone('square', 0.05, 0.07, 784, 0, 0.13); },
    attackCmd: () => { tone('sawtooth', 0, 0.09, 220, 330, 0.16); tone('square', 0.08, 0.08, 440, 0, 0.14); },
    work: () => { noise(0, 0.04, 0.3, 2500); tone('triangle', 0, 0.06, 523, 0, 0.25); tone('triangle', 0.07, 0.06, 659, 0, 0.22); },
    place: () => { tone('triangle', 0, 0.12, 180, 90, 0.5); noise(0, 0.08, 0.35, 700); tone('square', 0.1, 0.06, 784, 0, 0.12); },
    train: () => { tone('square', 0, 0.04, 1568, 0, 0.12); tone('square', 0.045, 0.08, 2093, 0, 0.1); },
    ui: () => { tone('square', 0, 0.025, 1400, 0, 0.08); },
    // a handgun crack and a cannon boom
    gun: () => { noise(0, 0.07, 0.4, 3000); tone('square', 0, 0.04, 180, 70, 0.12); },
    boom: () => { noise(0, 0.35, 0.7, 450); tone('triangle', 0, 0.3, 110, 35, 0.8); },
    // a big hanging gong: story cards, the proclamation
    gong: () => { tone('triangle', 0, 2.2, 98, 92, 0.7); tone('sine', 0, 1.6, 196, 190, 0.25); noise(0, 0.08, 0.25, 400); },
    // the treasurer opens the gate: gong and a falling serunai wail
    betray: () => { tone('triangle', 0, 2, 98, 90, 0.7); notes('sawtooth', [622, 587, 554, 523, 466], 0.18, 0.12); },
    // nobat: royal drums and a rising nafiri call
    nobat: () => { drum(0); drum(0.15); drum(0.3, 1); notes('sawtooth', [0, 0, 0, 440, 466, 554, 587, 0, 880], 0.12, 0.13); tone('triangle', 0.4, 2, 98, 92, 0.6); }
  };
  // minimum seconds between repeats of the same sound
  const GAP = { attack: 9, citadel: 6, arm: 0.5, click: 0.05, ui: 0.04, selVil: 0.08, selMil: 0.08, selHero: 0.08, selBld: 0.08, move: 0.08, attackCmd: 0.08, work: 0.08, place: 0.1, train: 0.06, gun: 0.09, boom: 0.25, clash: 0.16, thud: 0.25, twang: 0.18, die: 0.18, collapse: 0.6, sink: 0.6, splash: 0.3, raft: 1, fire: 1.5 };
  function play(name) {
    if (muted || !ctx || ctx.state !== 'running' || !BANK[name]) return;
    const now = ctx.currentTime;
    if (last[name] != null && now - last[name] < (GAP[name] || 0.3)) return;
    last[name] = now;
    try { BANK[name](); } catch (e) { /* audio hiccup */ }
  }
  function setMuted(m) {
    muted = m; try { localStorage.setItem('mr-mute', m ? '1' : '0'); } catch (e) { /* no storage */ }
  }

  /* --- background music. Melodies in the Malay ghazal mode (D Eb F# G A Bb C), the Middle Eastern colour
     that came into Malay court music with the trade; calm loop is a slow asli with rebana (frame drum) and
     a gong every four bars; the battle loop is a faster joget with nobat-style gendang drums. --- */
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
  // rebana pattern for asli (1 = dum, 2 = tak), eighths in a bar
  const REBANA = [1, 0, 0, 2, 1, 0, 2, 0];
  let musT = 0, step = 0, timer = null, battle = false, quiet = false, ageLvl = 1;
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const bpm = battle ? (ageLvl >= 3 ? 144 : 132) : (ageLvl >= 4 ? 90 : 84), e8 = 60 / bpm / 2;
    if (musT < ctx.currentTime) musT = ctx.currentTime + 0.05;
    while (musT < ctx.currentTime + 0.3) {
      const v = quiet ? 0.4 : 1, b8 = step % 8;
      if (battle) {
        const s = step % FIGHT.length, root = ROOTS[Math.floor(s / 8) * 2 % 8];
        if (FIGHT[s]) note('square', musT, e8 * 0.9, mid(FIGHT[s]), 0, 0.12 * v, musBus);
        // from the Age of Commerce a serunai answers the melody a fifth below, every other step
        if (ageLvl >= 3 && FIGHT[s] && s % 2 === 1) note('sawtooth', musT, e8 * 0.8, mid(FIGHT[s] - 5), 0, 0.05 * v, musBus);
        if (b8 % 2 === 0) note('triangle', musT, e8 * 1.5, mid(b8 % 4 === 0 ? root : root + 7), 0, 0.4 * v, musBus);
        // gendang: low on the beat, slaps between
        if (b8 % 2 === 0) noiseAt(musT, 0.11, (b8 % 4 === 0 ? 0.55 : 0.32) * v, 450, musBus);
        else noiseAt(musT, 0.03, 0.14 * v, 5000, musBus, true);
        if (s === 0) note('triangle', musT, 1.6, mid(43), mid(42), 0.5 * v, musBus);
      } else {
        const s = step % LEAD.length, bar = Math.floor(s / 8), root = ROOTS[bar];
        if (LEAD[s]) note('sawtooth', musT, e8 * (LEAD[s + 1] === 0 ? 1.8 : 0.95), mid(LEAD[s]), 0, 0.09 * v, musBus);
        if (LEAD[s]) note('triangle', musT, e8 * 0.9, mid(LEAD[s]), 0, 0.18 * v, musBus);
        // the Kingdom Age adds a gambus-like pluck an octave down; the Golden Age a bright bell an octave up
        if (ageLvl >= 2 && LEAD[s] && b8 % 2 === 0) note('triangle', musT, e8 * 0.6, mid(LEAD[s] - 12), 0, 0.12 * v, musBus);
        if (ageLvl >= 4 && LEAD[s] && b8 === 0) note('sine', musT, e8 * 2, mid(LEAD[s] + 12), 0, 0.08 * v, musBus);
        if (b8 === 0 || b8 === 4) note('triangle', musT, e8 * 3, mid(b8 === 0 ? root : root + 7), 0, 0.38 * v, musBus);
        if (REBANA[b8] === 1) noiseAt(musT, 0.12, 0.3 * v, 380, musBus);
        else if (REBANA[b8] === 2) noiseAt(musT, 0.04, 0.16 * v, 3200, musBus, true);
        if (s % 32 === 0) note('triangle', musT, 2.4, mid(43), mid(42), 0.55 * v, musBus);
      }
      musT += e8; step++;
    }
  }
  function startMusic() { if (!timer) timer = setInterval(schedule, 90); }
  function setMood(b, q, a) { if (!!b !== battle) step = 0; battle = !!b; quiet = !!q; if (a) ageLvl = a; }
  function setMusic(on) {
    musicOff = !on; try { localStorage.setItem('mr-music', on ? '1' : '0'); } catch (e) { /* no storage */ }
    if (musBus) musBus.gain.setTargetAtTime(on ? 0.4 : 0, ctx.currentTime, 0.1);
  }
  return { play, setMuted, get muted() { return muted; }, get music() { return !musicOff; }, setMusic, startMusic, setMood, unlock };
})();

// which sound goes with which message
function sfxForMsg(text) {
  if (text === 'We are under attack!') return 'attack';
  if (/^Raid \d+:|^The Siamese army of 1446 is here/.test(text)) return 'wave';
  if (/^Scouts:/.test(text)) return 'warn';
  if (/^Raiders are ashore/.test(text)) return 'attack';
  if (/is broken!/.test(text)) return 'done';
  if (/is wounded and carried/.test(text)) return 'hero';
  if (/^Melaka enters the /.test(text)) return 'nobat';
  if (/^The court begins the work/.test(text)) return 'gong';
  if (/^The Siamese commander has fallen/.test(text)) return 'rout';
  return null;
}

function setupSound() {
  const card = $('ov-pause'); if (!card || $('snd-btn')) return;
  const mk = (id, get, set) => {
    const b = document.createElement('button');
    b.id = id; b.className = 'btn alt';
    const label = () => { b.textContent = (id === 'snd-btn' ? 'Sound: ' : 'Music: ') + (get() ? 'on' : 'off'); b.setAttribute('aria-pressed', get() ? 'true' : 'false'); };
    b.addEventListener('click', (e) => { e.stopPropagation(); SFX.unlock(); set(!get()); label(); SFX.play('click'); });
    label();
    card.querySelector('[data-do="restart"]').before(b);
  };
  mk('snd-btn', () => !SFX.muted, on => SFX.setMuted(!on));
  mk('mus-btn', () => SFX.music, on => SFX.setMusic(on));
  SFX.startMusic();

  // selection: one sound for what was picked, only when the pick changes
  const _select = select;
  let lastPick = '';
  select = function (list) {
    _select(list);
    const key = sel.map(o => o.id).join(',');
    if (key === lastPick) return; lastPick = key;
    const o = sel[0]; if (!o || o.team !== 0 || !started) return;
    if (o.isBld) SFX.play('selBld');
    else if (UD[o.kind] && UD[o.kind].hero) SFX.play('selHero');
    else if (o.cls === 'vil') SFX.play('selVil');
    else SFX.play('selMil');
  };
  // orders: move, attack, or work (gather, build, repair)
  const _issue = issue;
  issue = function (wx, wy, hit) {
    const had = selUnits().length, am = !!(mode && mode.kind === 'amove');
    const r = _issue(wx, wy, hit);
    if (had) {
      if (hit && hit.team === 1) SFX.play('attackCmd');
      else if (hit && (hit.isNode || (hit.isBld && hit.team === 0))) SFX.play('work');
      else if (am) SFX.play('attackCmd');
      else SFX.play('move');
    }
    return r;
  };
  const _tryPlace = tryPlace;
  tryPlace = function (keep) { const r = _tryPlace(keep); if (r) SFX.play('place'); return r; };
  const _queue = Game.prototype.queueUnit;
  Game.prototype.queueUnit = function (b, kind, team) {
    const err = _queue.call(this, b, kind, team);
    if (!err && !team && b && b.team === 0) SFX.play('train');
    return err;
  };
  // every button in the command panel gives a small tick
  $('panel').addEventListener('click', (e) => { if (e.target.closest('[data-a]')) SFX.play('ui'); }, true);
  // combat sounds: the sim notes what happened and where, sfxTick plays the ones on screen
  const ev = (g, k, o) => { if (o && o.x != null) (g.sfxEv || (g.sfxEv = [])).push({ k, x: o.x, y: o.y }); };
  const _damage = Game.prototype.damage;
  Game.prototype.damage = function (att, tgt, w) {
    if (att && att.isUnit && tgt) {
      const rg = w ? w.ranged : att.ranged, gun = att.isUnit && UD[att.kind] && UD[att.kind].gun;
      if (w && w.wpn === 'cannon') { /* boom comes from the gun queue */ }
      else if (rg) { if (!gun) ev(this, 'twang', att); }
      else ev(this, tgt.isBld ? 'thud' : 'clash', tgt);
    }
    return _damage.call(this, att, tgt, w);
  };
  const _killed = Game.prototype.onKilled;
  Game.prototype.onKilled = function (t, att) {
    if (t.isBld) ev(this, 'collapse', t);
    else if (t.layer === 1 || t.cls === 'ship' || t.cls === 'boat') ev(this, t.kind === 'raft' ? 'fire' : 'sink', t);
    else if (t.cls !== 'animal') ev(this, 'die', t);
    return _killed.call(this, t, att);
  };
  if (Game.prototype.launchRaft) {
    const _raft = Game.prototype.launchRaft;
    Game.prototype.launchRaft = function (b) { const r = _raft.apply(this, arguments); ev(this, 'raft', b); return r; };
  }
  if (Game.prototype.ignite) {
    const _ign = Game.prototype.ignite;
    Game.prototype.ignite = function (t) { const was = t && t.burn; const r = _ign.apply(this, arguments); if (t && t.burn && !was) ev(this, 'fire', t); return r; };
  }
}

// called from updateHud: the music mood and sounds that are not tied to a message
function sfxTick() {
  const M = G && G.M; if (!M) return;
  const foes = G.units.some(u => u.team === 1 && u.hp > 0 && (u.layer === 0 || u.order.t !== 'land'));
  SFX.setMood(!G.over && (M.active || foes), paused || !!storyOpen, G.age ? G.age[0] : 1);
  if (G.over) return;
  const home = G.buildings.find(b => b.team === 0 && b.kind === 'towncentre' && b.hp > 0);
  if (home && home.lastHit != null && home.lastHit > (M.sndCit || -1) && G.t - home.lastHit < 0.5) { M.sndCit = home.lastHit; SFX.play('citadel'); }
  // gunfire on screen: a crack for handguns, a boom for cannon
  if (G.sfxShots && G.sfxShots.length) {
    const vx0 = cam.x / TILE, vy0 = cam.y / TILE, vx1 = vx0 + view.w / view.zoom / TILE, vy1 = vy0 + view.h / view.zoom / TILE;
    for (const s of G.sfxShots) if (s.x >= vx0 - 2 && s.x <= vx1 + 2 && s.y >= vy0 - 2 && s.y <= vy1 + 2) SFX.play(s.big ? 'boom' : 'gun');
    G.sfxShots.length = 0;
  }
  // combat sounds on screen, plus troops climbing on or off a galley
  const vx0 = cam.x / TILE - 2, vy0 = cam.y / TILE - 2, vx1 = vx0 + view.w / view.zoom / TILE + 4, vy1 = vy0 + view.h / view.zoom / TILE + 4;
  if (G.sfxEv && G.sfxEv.length) {
    for (const e of G.sfxEv) if (e.x >= vx0 && e.x <= vx1 && e.y >= vy0 && e.y <= vy1) SFX.play(e.k);
    G.sfxEv.length = 0;
  }
  for (const u of G.units) if (u.cargo) {
    const n = u.cargo.length; if (u.sndN != null && n !== u.sndN && u.hp > 0 && u.x >= vx0 && u.x <= vx1 && u.y >= vy0 && u.y <= vy1) SFX.play('splash'); u.sndN = n;
  }
}
