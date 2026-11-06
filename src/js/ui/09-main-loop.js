/* ##### CHAPTER SCREEN 9 · Main loop #####
   File: src/js/ui/09-main-loop.js
   What it does: Starts the game and keeps it ticking: 30 rule steps a second, drawing every frame.
   ############################################################################ */
/* ---------------- main loop ---------------- */
function frame(ts) {
  const dt = Math.min(0.1, (ts - lastTs) / 1000 || 0); lastTs = ts; nowS = ts / 1000;
  if (started) {
    if (!paused && !G.over) {
      acc += dt * speed; let n = 0;
      while (acc >= STEP && n < 9) { G.update(STEP); acc -= STEP; n++; }
      if (n >= 9) acc = 0;
      const kx = (keys.arrowright || keys.d ? 1 : 0) - (keys.arrowleft ? 1 : 0);
      const ky = (keys.arrowdown ? 1 : 0) - (keys.arrowup || keys.w ? 1 : 0);
      if (kx || ky) { cam.x += kx * 700 * dt / view.zoom; cam.y += ky * 700 * dt / view.zoom; clampCam(); }
      for (const m of markers) m.t -= dt; markers = markers.filter(m => m.t > 0);
    }
    if (G.over && !ended) endGame();
    if (!paused && !ended) { saveT += dt; if (saveT > 30) { saveT = 0; saveGame(); } }
    render();
    hudT += dt; if (hudT > 0.12) { hudT = 0; updateHud(); updatePanel(); drawMini(); }
  }
  requestAnimationFrame(frame);
}
window.addEventListener('resize', () => { resize(); });
(function boot() {
  const set = (id, name) => { const e = $(id); if (e) e.src = resIcon(name); };
  set('i-food', 'food'); set('i-wood', 'wood'); set('i-gold', 'gold'); set('i-pop', 'pop'); set('i-idle', 'idle'); set('i-army', 'army');
  set('i-zin', 'plus'); set('i-zout', 'minus'); set('i-menu', 'menu');
  $('hud').hidden = true; resize(); paintMenuArt(); showMenu('home');
  // a quiet preview behind the title screen
  G = new Game({ seed: seedUsed, diff }); terrainC = buildTerrain(G); miniBase = buildMiniBase(G); initFog(); refreshFog();
  view.zoom = view.w > 700 ? 1.5 : 1; const tc = G.buildings[0]; centerOn(tc.x, tc.y + 1);
  started = false;
  requestAnimationFrame(function pre(ts) { if (!started) { nowS = ts / 1000; render(); requestAnimationFrame(pre); } });
  requestAnimationFrame(frame);
})();

</script>

<script>
