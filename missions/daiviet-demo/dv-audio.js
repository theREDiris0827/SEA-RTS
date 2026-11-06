
/* ---------- chiptune sounds and music (WebAudio, no files) ---------- */
const SFX = (() => {
  let ctx = null, master = null, sfxBus = null, musBus = null, muted = false, musicOff = false;
  try { muted = localStorage.getItem('dv-mute') === '1'; musicOff = localStorage.getItem('dv-music') === '0'; } catch (e) { /* no storage */ }
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
    boom: () => { noise(0, 0.35, 0.7, 450); tone('triangle', 0, 0.3, 110, 35, 0.8); }
  };
  // minimum seconds between repeats of the same sound
  const GAP = { attack: 9, citadel: 6, arm: 0.5, click: 0.05, ui: 0.04, selVil: 0.08, selMil: 0.08, selHero: 0.08, selBld: 0.08, move: 0.08, attackCmd: 0.08, work: 0.08, place: 0.1, train: 0.06, gun: 0.09, boom: 0.25 };
  function play(name) {
    if (muted || !ctx || ctx.state !== 'running' || !BANK[name]) return;
    const now = ctx.currentTime;
    if (last[name] != null && now - last[name] < (GAP[name] || 0.3)) return;
    last[name] = now;
    try { BANK[name](); } catch (e) { /* audio hiccup */ }
  }
  function setMuted(m) {
    muted = m; try { localStorage.setItem('dv-mute', m ? '1' : '0'); } catch (e) { /* no storage */ }
  }

  /* --- background music: a pentatonic loop on Đại Việt modes; calm in the valley, drums when a column is in it --- */
  const mid = n => 440 * Math.pow(2, (n - 69) / 12);
  // D minor pentatonic (D F G A C), eighth notes, 0 = rest
  const D4 = 62, F4 = 65, G4 = 67, A4 = 69, C5 = 72, D5 = 74, F5 = 77, G5 = 79, A5 = 81, C6 = 84;
  const LEAD = [
    D5, 0, F5, G5, A5, 0, G5, F5,   D5, 0, C5, 0, A4, 0, 0, 0,
    F5, 0, G5, A5, C6, 0, A5, G5,   A5, G5, F5, 0, D5, 0, 0, 0,
    A4, C5, D5, 0, F5, 0, D5, C5,   A4, 0, G4, 0, A4, 0, 0, 0,
    C5, D5, F5, G5, A5, 0, G5, F5,  G5, 0, F5, 0, D5, 0, 0, 0
  ];
  // a bar's root note (bass plays root and fifth in quarters)
  const ROOTS = [38, 36, 41, 38, 45, 43, 41, 38];
  // the counter line on the battle loop, an octave down, stabbing on the beats
  const STAB = [D4, 0, 0, A4, 0, 0, G4, 0];
  let musT = 0, step = 0, timer = null, battle = false, quiet = false;
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const bpm = battle ? 126 : 92, e8 = 60 / bpm / 2;
    if (musT < ctx.currentTime) musT = ctx.currentTime + 0.05;
    while (musT < ctx.currentTime + 0.3) {
      const s = step % LEAD.length, bar = Math.floor(s / 8), root = ROOTS[bar], q = s % 2 === 0;
      const v = quiet ? 0.4 : 1;
      if (LEAD[s]) note(battle ? 'square' : 'triangle', musT, e8 * (LEAD[s + 1] === 0 ? 1.7 : 0.9), mid(LEAD[s]), 0, (battle ? 0.13 : 0.32) * v, musBus);
      if (q) note('triangle', musT, e8 * 1.6, mid((s % 4 === 0) ? root : root + 7), 0, 0.42 * v, musBus);
      if (battle) {
        if (q) noiseAt(musT, 0.1, (s % 4 === 0 ? 0.5 : 0.3) * v, 500, musBus);
        else noiseAt(musT, 0.03, 0.12 * v, 6000, musBus, true);
        if (STAB[s % 8]) note('square', musT, e8 * 0.5, mid(STAB[s % 8]), 0, 0.07 * v, musBus);
      } else if (s % 8 === 0) {
        // a soft bamboo knock at the top of each bar
        noiseAt(musT, 0.05, 0.12 * v, 1800, musBus);
      }
      musT += e8; step++;
    }
  }
  function startMusic() { if (!timer) timer = setInterval(schedule, 90); }
  function setMood(b, q) { battle = !!b; quiet = !!q; }
  function setMusic(on) {
    musicOff = !on; try { localStorage.setItem('dv-music', on ? '1' : '0'); } catch (e) { /* no storage */ }
    if (musBus) musBus.gain.setTargetAtTime(on ? 0.4 : 0, ctx.currentTime, 0.1);
  }
  return { play, setMuted, get muted() { return muted; }, get music() { return !musicOff; }, setMusic, startMusic, setMood, unlock };
})();

// which sound goes with which message
function sfxForMsg(text) {
  if (text === 'We are under attack!') return 'attack';
  if (/^Scouts:/.test(text)) return 'warn';
  if (/^Wave \d+: the Ming come/.test(text)) return 'wave';
  if (/ is broken! Spoils/.test(text)) return 'done';
  if (/^Liễu Thăng has fallen/.test(text)) return 'rout';
  if (/is wounded and carried from the field/.test(text)) return 'hero';
  if (/is back on his feet/.test(text)) return 'arm';
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
}

// called from updateHud: sounds that are not tied to a message, and the music mood
function sfxTick() {
  const M = G && G.M; if (!M) return;
  SFX.setMood(M.active && !M.routed && !G.over, paused || !!storyOpen);
  if (G.over) return;
  // shots on screen make a sound (off-screen ones stay quiet so a big fight is not a wall of noise)
  if (G.sfxShots) {
    for (const sh of G.sfxShots.slice(-4)) if (inView(sh.x * TILE, sh.y * TILE, 40)) SFX.play(sh.big ? 'boom' : 'gun');
    G.sfxShots = null;
  }
  const tc = G.buildings.find(b => b.kind === 'towncentre' && b.team === 0);
  if (tc && tc.lastHit != null && tc.lastHit > (M.sndCit || -1) && G.t - tc.lastHit < 0.5) { M.sndCit = tc.lastHit; SFX.play('citadel'); }
  if (M.militia > (M.sndMil || 0)) { M.sndMil = M.militia; SFX.play('arm'); }
}
