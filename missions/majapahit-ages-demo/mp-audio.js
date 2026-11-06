
/* ===== mp-audio.js ===== */
/* chiptune sounds and music (WebAudio, no files). The synth and sound bank follow the Melaka ages demo;
   the music is a Javanese gamelan in slendro that grows with each age (from the Majapahit demo). */
const SFX = (() => {
  let ctx = null, master = null, sfxBus = null, musBus = null, muted = false, musicOff = false;
  try { muted = localStorage.getItem('mpa-mute') === '1'; musicOff = localStorage.getItem('mpa-music') === '0'; } catch (e) { /* no storage */ }
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
    // a new age: the bende signal gong struck three times, kendang, then the gong ageng
    nobat: () => { drum(0); tone('sine', 0, 0.5, 392, 388, 0.3); tone('sine', 0.25, 0.5, 392, 388, 0.3); tone('sine', 0.5, 0.7, 440, 436, 0.32); drum(0.7); drum(0.85, 1); tone('sine', 1.0, 2.4, 73, 72, 0.6); tone('sine', 1.0, 1.6, 147, 146, 0.18); }
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
    muted = m; try { localStorage.setItem('mpa-mute', m ? '1' : '0'); } catch (e) { /* no storage */ }
  }

  /* --- background music: a gamelan loop in slendro (five near-equal steps to the octave), from the
     Majapahit demo. It grows with the ages: the Village Age is only saron, kenong and gong, slow; the
     Kingdom Age adds the bonang running ahead; the Age of Commerce adds the kempul and a soft kendang;
     the Golden Age adds a gender shimmer an octave up and moves a little faster. Battle is a loud
     lancaran with the kendang driving it. --- */
  const BASE = 147;                                   // D3
  const deg = (d) => BASE * Math.pow(2, d / 5);       // five steps per octave
  // balungan in scale degrees (0 = D3, 5 = D4); four gatra of four beats per line
  const BAL = [
    6, 5, 3, 2,   3, 5, 6, 7,    8, 7, 6, 5,   3, 2, 1, 2,
    3, 5, 3, 2,   1, 2, 3, 5,    6, 5, 3, 2,   1, 0, 1, 0,
    5, 6, 7, 8,   7, 6, 5, 3,    5, 6, 5, 3,   2, 3, 2, 1,
    2, 3, 5, 6,   5, 3, 2, 1,    3, 2, 1, 2,   3, 1, 2, 0
  ];
  let musT = 0, step = 0, timer = null, battle = false, quiet = false, ageLvl = 1;
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const bpm = battle ? (ageLvl >= 3 ? 156 : 146) : (ageLvl >= 4 ? 92 : ageLvl >= 2 ? 84 : 76), beat = 60 / bpm, e8 = beat / 2;
    if (musT < ctx.currentTime) musT = ctx.currentTime + 0.05;
    while (musT < ctx.currentTime + 0.3) {
      const half = step % 2, bi = Math.floor(step / 2) % BAL.length, b = BAL[bi], nb = BAL[(bi + 1) % BAL.length], v = quiet ? 0.4 : 1;
      if (!half) {
        // saron: the core melody, one note a beat
        note('square', musT, beat * 0.8, deg(b + 5), 0, 0.07 * v, musBus);
        note('triangle', musT, beat * 0.9, deg(b + 5), 0, 0.16 * v, musBus);
        // kenong every fourth beat; kempul on the second of each four (battle, or from the Age of Commerce)
        if (bi % 4 === 3) note('sine', musT, beat * 1.6, deg(b + 5) / 2, 0, 0.24 * v, musBus);
        if ((battle || ageLvl >= 3) && bi % 4 === 1) note('sine', musT, beat * 1.2, deg(b), 0, 0.2 * v, musBus);
        // gender: a soft shimmer an octave up in the Golden Age
        if (!battle && ageLvl >= 4) note('sine', musT, beat * 1.4, deg(b + 10), deg(b + 10) * 1.004, 0.05 * v, musBus);
        // gong ageng at the end of each gongan (16 beats)
        if (bi % 16 === 15) { note('sine', musT, 2.4, deg(-5), deg(-5) * 0.985, 0.45 * v, musBus); note('sine', musT, 1.4, deg(0), 0, 0.12 * v, musBus); }
      }
      // bonang: runs ahead to the next note, an octave up (from the Kingdom Age, and always in battle)
      if ((battle || ageLvl >= 2) && !quiet) note('triangle', musT, e8 * 0.7, deg((half ? nb : b) + 10), 0, (battle ? 0.07 : 0.05) * v, musBus);
      // kendang: dhe (low) and tak (slap)
      if (battle) {
        if (step % 8 === 0 || step % 8 === 5) { note('triangle', musT, 0.16, 120, 60, 0.55 * v, musBus); noiseAt(musT, 0.06, 0.2 * v, 500, musBus); }
        if (step % 4 === 2) noiseAt(musT, 0.05, 0.22 * v, 3000, musBus, true);
      } else if (step % 16 === 14 || (ageLvl >= 3 && step % 16 === 6)) { note('triangle', musT, 0.14, 110, 70, 0.35 * v, musBus); }
      musT += e8; step++;
    }
  }
  function startMusic() { if (!timer) timer = setInterval(schedule, 90); }
  function setMood(b, q, a) { if (!!b !== battle) step = 0; battle = !!b; quiet = !!q; if (a) ageLvl = a; }
  function setMusic(on) {
    musicOff = !on; try { localStorage.setItem('mpa-music', on ? '1' : '0'); } catch (e) { /* no storage */ }
    if (musBus) musBus.gain.setTargetAtTime(on ? 0.4 : 0, ctx.currentTime, 0.1);
  }
  return { play, setMuted, get muted() { return muted; }, get music() { return !musicOff; }, setMusic, startMusic, setMood, unlock };
})();

// which sound goes with which message
function sfxForMsg(text) {
  if (text === 'We are under attack!') return 'attack';
  if (/^Raid \d+:|^Sadeng and Keta have risen/.test(text)) return 'wave';
  if (/^Scouts:/.test(text)) return 'warn';
  if (/^Raiders are ashore/.test(text)) return 'attack';
  if (/is broken!/.test(text)) return 'done';
  if (/is wounded and carried/.test(text)) return 'hero';
  if (/^Majapahit enters the /.test(text)) return 'nobat';
  if (/^The court begins the work/.test(text)) return 'gong';
  if (/^The lord of Sadeng has fallen/.test(text)) return 'rout';
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
  const foes = G.units.some(u => u.team === 1 && u.hp > 0 && !u.guard && (u.layer === 0 || u.order.t !== 'land'));
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
