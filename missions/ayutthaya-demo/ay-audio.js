
/* ---------- chiptune sounds and music (WebAudio, no files) ---------- */
const SFX = (() => {
  let ctx = null, master = null, sfxBus = null, musBus = null, muted = false, musicOff = false;
  try { muted = localStorage.getItem('ay-mute') === '1'; musicOff = localStorage.getItem('ay-music') === '0'; } catch (e) { /* no storage */ }
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
    // elephants: a trumpet call; the gate shaking under them; the gate giving way
    trumpet: () => { const o = ctx.currentTime; note('sawtooth', o, 0.18, 330, 520, 0.2); note('sawtooth', o + 0.16, 0.32, 520, 470, 0.22); note('square', o + 0.16, 0.32, 1040, 940, 0.06); },
    ram: () => { noise(0, 0.22, 0.6, 380); tone('triangle', 0, 0.25, 90, 45, 0.8); tone('square', 0.02, 0.06, 140, 80, 0.12); },
    thud: () => { noise(0, 0.12, 0.35, 500); tone('triangle', 0, 0.14, 120, 60, 0.5); },
    crash: () => { noise(0, 0.9, 0.8, 600); tone('triangle', 0, 0.6, 100, 30, 0.9); noise(0.25, 0.6, 0.5, 1800); notes('square', [0, 0, 0, 0, 392, 523, 659, 784], 0.1, 0.25); },
    // a building catches fire: a soft whoosh
    ignite: () => { const o = ctx.currentTime; noiseAt(o, 0.45, 0.35, 1400); note('triangle', o, 0.3, 180, 360, 0.15); },
    // the conch (sang) blown for a new stage of the siege
    conch: () => { const o = ctx.currentTime; note('triangle', o, 0.9, 233, 262, 0.5); note('sine', o, 0.9, 466, 523, 0.18); noiseAt(o, 0.9, 0.05, 900); },
    // a sortie: the gate creaks and the Khmer drums roll
    sortie: () => { tone('sawtooth', 0, 0.35, 70, 55, 0.18); drum(0.3); drum(0.45); drum(0.6, 1); drum(0.9, 1); },
    // an arrow loosed, and a fire arrow
    bow: () => { tone('triangle', 0, 0.05, 900, 400, 0.12); noise(0, 0.04, 0.12, 4000); }
  };
  // minimum seconds between repeats of the same sound
  const GAP = { attack: 9, citadel: 6, arm: 0.5, click: 0.05, ui: 0.04, selVil: 0.08, selMil: 0.08, selHero: 0.08, selBld: 0.08, move: 0.08, attackCmd: 0.08, work: 0.08, place: 0.1, train: 0.06, trumpet: 1.2, ram: 0.35, thud: 0.3, crash: 1, ignite: 0.4, conch: 2, sortie: 4, bow: 0.12 };
  function play(name) {
    if (muted || !ctx || ctx.state !== 'running' || !BANK[name]) return;
    const now = ctx.currentTime;
    if (last[name] != null && now - last[name] < (GAP[name] || 0.3)) return;
    last[name] = now;
    try { BANK[name](); } catch (e) { /* audio hiccup */ }
  }
  function setMuted(m) {
    muted = m; try { localStorage.setItem('ay-mute', m ? '1' : '0'); } catch (e) { /* no storage */ }
  }

  /* --- background music: a piphat-style loop in Thai seven-tone tuning (each step 1/7 of an octave).
     Calm: the pi (reed) and ranat (xylophone) over the ching's soft open/closed strokes.
     Battle: faster, the klong that drums and the khong wong gong circle join in. --- */
  const BASE = 196;                                   // G3
  const deg = (d) => BASE * Math.pow(2, d / 7);       // seven equal steps per octave
  // melody in scale degrees (0 = G3, 7 = G4, 14 = G5); null = rest. A pentatonic subset 0 1 2 4 5 of the seven
  const _ = null;
  const LEAD = [
    9, _, 11, 12, 14, _, 12, 11,    9, _, 8, _, 7, _, _, _,
    11, _, 12, 14, 15, _, 14, 12,   14, 12, 11, _, 9, _, _, _,
    7, 8, 9, _, 11, _, 9, 8,        7, _, 5, _, 7, _, _, _,
    8, 9, 11, 12, 14, _, 12, 11,    12, _, 11, _, 7, _, _, _
  ];
  const ROOTS = [0, -3, 2, 0, 4, 2, -2, 0];          // a bar's bass degree
  const GONG = [14, 16, 18, 21, 18, 16, 14, 12];      // khong wong pattern
  let musT = 0, step = 0, timer = null, battle = false, quiet = false;
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    const bpm = battle ? 132 : 96, e8 = 60 / bpm / 2;
    if (musT < ctx.currentTime) musT = ctx.currentTime + 0.05;
    while (musT < ctx.currentTime + 0.3) {
      const s = step % LEAD.length, bar = Math.floor(s / 8), root = ROOTS[bar], q = s % 2 === 0;
      const v = quiet ? 0.4 : 1, L = LEAD[s];
      // pi: a reedy lead with a little bend into each note
      if (L != null) note(battle ? 'square' : 'sawtooth', musT, e8 * (LEAD[s + 1] == null ? 1.7 : 0.9), deg(L) * 0.985, deg(L), (battle ? 0.1 : 0.12) * v, musBus);
      // ranat ek: running sixteenths an octave up, quietly
      if (L != null) note('triangle', musT + e8 / 2, e8 * 0.4, deg(L + 7), 0, 0.1 * v, musBus);
      if (q) note('triangle', musT, e8 * 1.6, deg(root - 7) , 0, 0.4 * v, musBus);
      // ching: open stroke off the beat, closed stroke on it
      if (s % 4 === 2) noiseAt(musT, 0.22, 0.13 * v, 7000, musBus, true);
      else if (s % 4 === 0) noiseAt(musT, 0.04, 0.12 * v, 7000, musBus, true);
      if (battle) {
        if (s % 4 === 0) { note('triangle', musT, 0.18, 110, 55, 0.6 * v, musBus); noiseAt(musT, 0.08, 0.3 * v, 500, musBus); }
        if (s % 8 === 6) note('triangle', musT, 0.12, 150, 80, 0.4 * v, musBus);
        note('sine', musT, e8 * 0.8, deg(GONG[s % 8]), 0, 0.08 * v, musBus);
      } else if (s % 16 === 0) {
        // a deep gong at the top of every second bar
        note('sine', musT, 1.2, deg(-7), deg(-7) * 0.99, 0.25 * v, musBus);
      }
      musT += e8; step++;
    }
  }
  function startMusic() { if (!timer) timer = setInterval(schedule, 90); }
  function setMood(b, q) { battle = !!b; quiet = !!q; }
  function setMusic(on) {
    musicOff = !on; try { localStorage.setItem('ay-music', on ? '1' : '0'); } catch (e) { /* no storage */ }
    if (musBus) musBus.gain.setTargetAtTime(on ? 0.4 : 0, ctx.currentTime, 0.1);
  }
  return { play, setMuted, get muted() { return muted; }, get music() { return !musicOff; }, setMusic, startMusic, setMood, unlock };
})();

// which sound goes with which message
function sfxForMsg(text) {
  if (text === 'We are under attack!') return 'attack';
  if (/^Drums on the walls/.test(text)) return 'warn';
  if (/^A sortie!/.test(text)) return 'sortie';
  if (/^The outer town burns|^The outworks have fallen/.test(text)) return 'done';
  if (/is wounded and carried from the field/.test(text)) return 'hero';
  if (/mounts his elephant again/.test(text)) return 'trumpet';
  if (/^The banner of Ayutthaya/.test(text)) return 'rout';
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
    else if (UD[o.kind] && UD[o.kind].hero) { SFX.play('selHero'); SFX.play('trumpet'); }
    else if (o.cls === 'eleph') SFX.play('trumpet');
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
  const fight = G.units.some(u => u.team === 1 && u.hp > 0 && u.layer === 0 && (u.sortie || (u.order.t === 'attack' && u.cls !== 'vil')));
  SFX.setMood(fight && !G.over, paused || !!storyOpen);
  if (G.over) return;
  // effects on screen make a sound (off-screen ones stay quiet so a big fight is not a wall of noise)
  if (G.sfxQ) {
    for (const e of G.sfxQ.slice(-5)) if (e.name === 'crash' || inView(e.x * TILE, e.y * TILE, 60)) SFX.play(e.name);
    G.sfxQ = null;
  }
  const tc = G.buildings.find(b => b.kind === 'towncentre' && b.team === 0);
  if (tc && tc.lastHit != null && tc.lastHit > (M.sndCit || -1) && G.t - tc.lastHit < 0.5) { M.sndCit = tc.lastHit; SFX.play('citadel'); }
}
