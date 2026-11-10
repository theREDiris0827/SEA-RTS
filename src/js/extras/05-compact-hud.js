/* ##### CHAPTER EXTRA 5 · Compact screen #####
   File: src/js/extras/05-compact-hud.js
   What it does: a bigger play area: no hint strip (small clock, tips pop up then fade), slim one-row panel, icon-only command buttons, smaller foldable minimap.
   Things you can tweak:
     - the CSS sizes at the top (minimap 84x63) and how long a tip stays (5 s).
   ############################################################################ */
/* ===== compact.js: a bigger play area (Iylia, 2026-11-07), in the main game since v0.9.43 =====
   - the hint strip is gone: the clock sits small over the map and tips pop up for a few seconds, then fade
   - the command panel is slimmer: header and tabs share a row, buttons show the icon and price only
     (hold a button to see its name), the extra text lines are hidden
   - the minimap is smaller and can be folded away
   - group tabs only show once a group has been made */
(function () {
  const css = `
body.cmp:not(.cmp-m) #strip { display: none; }
body.cmp:not(.cmp-m) #clock { position: absolute; top: 0; left: 50%; transform: translateX(-50%); z-index: 3; pointer-events: none;
  font-size: 12px; padding: 1px 8px; background: rgba(11, 22, 18, .6); border: 1px solid var(--edge-dark); color: var(--muted); }
#hintpop { position: absolute; top: 24px; left: 50%; transform: translateX(-50%); z-index: 3; max-width: min(78%, 420px);
  background: rgba(11, 22, 18, .9); border: 2px solid var(--edge-dark); box-shadow: inset 0 0 0 1px var(--edge);
  color: var(--gold); font-size: 13px; line-height: 1.3; padding: 5px 10px; text-align: center; transition: opacity .6s; opacity: 0; pointer-events: none; }
#hintpop.on { opacity: 1; pointer-events: auto; }
body.cmp #mini { width: 84px; height: 63px; opacity: .92; }
body.cmp.nomini #mini { display: none; }
#minitog { position: absolute; top: 2px; left: 2px; z-index: 3; width: 26px; height: 26px; padding: 0; font: 700 14px var(--font-num, sans-serif);
  color: var(--text); background: rgba(11, 22, 18, .85); border: 2px solid var(--edge-dark); display: grid; place-items: center; }
body.cmp:not(.nomini) #minitog { left: 66px; top: 47px; width: 22px; height: 22px; font-size: 12px; }
body.cmp.nogrp #grps { display: none; }
body.cmp #panel { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 5px 8px; padding: 5px; }
body.cmp .p-info { min-width: 0; max-width: 46vw; gap: 2px; }
body.cmp .p-head { gap: 6px; }
body.cmp .p-head > div { min-width: 0; overflow: hidden; flex: 1 1 auto; }
body.cmp .p-info:has(.chips) { grid-column: 1 / -1; max-width: none; }
body.cmp #panel:not(:has(.p-tabs)) .p-info { max-width: none; width: auto; grid-column: 1 / -1; }   /* no tabs beside it: the title gets the full width */
body.cmp .p-head .chips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; gap: 4px; }
body.cmp .p-head .chip { padding: 1px 6px 1px 1px; flex: none; }
body.cmp .p-head > img { width: 28px; height: 28px; }
body.cmp .p-name { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
body.cmp .p-name .en { display: none; }   /* the title shows the local name; tap the header for the English name and what it does */
body.cmp .p-head { cursor: pointer; }
body.cmp .p-sub { font-size: 12px; min-height: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
body.cmp .p-line, body.cmp .p-later { display: none; }
body.cmp .bar { height: 5px; }
body.cmp .chip img { width: 22px; height: 22px; }
body.cmp .chip b { font-size: 14px; }
body.cmp .p-bld { display: contents; }
body.cmp .p-tabs { grid-column: 2; grid-row: 1; gap: 4px; }
body.cmp .tab { font-size: 11px; padding: 4px 1px; }
body.cmp .p-cmds, body.cmp .p-cmds.bld { grid-column: 1 / -1; grid-template-columns: repeat(auto-fill, minmax(46px, 1fr)); gap: 4px; }
body.cmp .cmd, body.cmp .p-cmds.bld .cmd { min-height: 0; padding: 3px 1px 2px; }
body.cmp .cmd img { width: 26px; height: 26px; }
body.cmp .cmd .nm, body.cmp .cmd .en { display: none; }
/* buildings and units keep their names (Iylia): players should see what each one is */
body.cmp .cmd[data-a="build"] .nm, body.cmp .cmd[data-a="build"] .en, body.cmp .cmd[data-a="train"] .nm, body.cmp .cmd[data-a="train"] .en, body.cmp .cmd.lock .nm, body.cmp .cmd.lock .en { display: block; }
body.cmp .p-cmds.bld, body.cmp .p-cmds:has([data-a="train"]) { grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); }
body.cmp .cmd[data-a="build"] .nm, body.cmp .cmd[data-a="train"] .nm { font-size: 11px; line-height: 1.1; text-align: center; }
/* building actions keep a short name too (Iylia, 2026-11-10): age up, bell, research, gate */
body.cmp .cmd[data-a="ageup"] .nm, body.cmp .cmd[data-a="ageup"] .en, body.cmp .cmd[data-a="agecancel"] .nm, body.cmp .cmd[data-a="agecancel"] .en, body.cmp .cmd[data-a="bell"] .nm, body.cmp .cmd[data-a="bell"] .en, body.cmp .cmd[data-a="allclear"] .nm, body.cmp .cmd[data-a="allclear"] .en, body.cmp .cmd[data-a="release"] .nm, body.cmp .cmd[data-a="release"] .en, body.cmp .cmd[data-a="firearrow"] .nm, body.cmp .cmd[data-a="firearrow"] .en, body.cmp .cmd[data-a="raft"] .nm, body.cmp .cmd[data-a="raft"] .en, body.cmp .cmd[data-a="gatelock"] .nm, body.cmp .cmd[data-a="gatelock"] .en, body.cmp .cmd[data-a="unload"] .nm, body.cmp .cmd[data-a="unload"] .en { display: block; }
body.cmp .cmd[data-a="ageup"] .nm, body.cmp .cmd[data-a="agecancel"] .nm, body.cmp .cmd[data-a="bell"] .nm, body.cmp .cmd[data-a="allclear"] .nm, body.cmp .cmd[data-a="release"] .nm, body.cmp .cmd[data-a="firearrow"] .nm, body.cmp .cmd[data-a="raft"] .nm, body.cmp .cmd[data-a="gatelock"] .nm, body.cmp .cmd[data-a="unload"] .nm { font-size: 11px; line-height: 1.1; text-align: center; }
body.cmp .cmd[data-a="build"] .en, body.cmp .cmd[data-a="train"] .en { font-size: 9px; }
body.cmp .cmd .ct { font-size: 11px; min-height: 0; }
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // tap the panel header: the full name and what it does (the title only has room for the local name)
  document.addEventListener('click', (e) => {
    const h = e.target.closest && e.target.closest('#panel .p-head'); if (!h || (e.target.closest && e.target.closest('.chip'))) return;
    const o = sel.length === 1 ? sel[0] : null; if (!o || !o.kind || (!o.isUnit && !o.isBld)) return;
    const e2 = enName(o.kind, o.team), br = BRIEF[o.kind];
    toast(civName(o.kind, o.team) + (e2 ? ' (' + e2 + ')' : '') + (br ? ': ' + br : ''));
  });
  // hold a button for its name (the labels are hidden)
  let holdT = 0, held = false;
  function nameOf(b) {
    const nm = b.querySelector('.nm'), en = b.querySelector('.en');
    const t = (nm ? nm.textContent : b.textContent).trim() + (en && en.textContent.trim() ? ' (' + en.textContent.trim() + ')' : '');
    return b.title ? b.title : t;
  }
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest && e.target.closest('#panel .cmd'); if (!b) return;
    held = false; clearTimeout(holdT);
    holdT = setTimeout(() => { held = true; toast(nameOf(b)); if (navigator.vibrate) { try { navigator.vibrate(10); } catch (_) { /* ignore */ } } }, 450);
  }, true);
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) document.addEventListener(ev, () => clearTimeout(holdT), true);
  document.addEventListener('click', (e) => { if (held && e.target.closest && e.target.closest('#panel .cmd')) { e.stopPropagation(); e.preventDefault(); held = false; } }, true);
  document.addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest('#panel .cmd')) e.preventDefault(); }, true);

  function boot() {
    document.body.classList.add('cmp');
    const mid = document.getElementById('mid'), clock = document.getElementById('clock'), hint = document.getElementById('hint');
    // campaign missions and battles keep their strip: the objectives open from it (and some show meters there)
    if (typeof setupObj === 'function') { document.body.classList.add('cmp-m'); return compactRest(mid); }
    if (mid && clock) mid.appendChild(clock);
    // tips: show when the advice changes (numbers ignored), fade after 5 s, tap to close
    const pop = document.createElement('div'); pop.id = 'hintpop'; if (mid) mid.appendChild(pop);
    pop.addEventListener('click', () => pop.classList.remove('on'));
    let lastKey = '', hideT = 0, popG = null; const seenTips = new Set();
    setInterval(() => {
      const t = hint ? hint.textContent.trim() : '', key = t.replace(/[0-9:]+/g, '#');
      if (t) pop.textContent = t;
      if (G !== popG) { popG = G; seenTips.clear(); }
      if (key === lastKey) return; lastKey = key;
      if (!t) { pop.classList.remove('on'); return; }
      // each tutorial tip pops up once a game; Face instructions every time
      if (!(mode && mode.kind === 'face')) { if (seenTips.has(key)) return; seenTips.add(key); }
      pop.classList.add('on'); clearTimeout(hideT); hideT = setTimeout(() => pop.classList.remove('on'), 5000);
    }, 250);
    compactRest(mid);
  }
  // the parts every page gets: the minimap fold button and group tabs that appear once a group exists
  function compactRest(mid) {
    const mini = document.getElementById('mini');
    if (mid && mini) {
      const b = document.createElement('button'); b.id = 'minitog'; b.setAttribute('aria-label', 'Show or hide the minimap');
      const label = () => { b.textContent = document.body.classList.contains('nomini') ? '▣' : '−'; };
      try { if (localStorage.getItem('seak-nomini') === '1') document.body.classList.add('nomini'); } catch (_) { /* ignore */ }
      b.addEventListener('click', (e) => { e.stopPropagation(); document.body.classList.toggle('nomini'); label(); try { localStorage.setItem('seak-nomini', document.body.classList.contains('nomini') ? '1' : '0'); } catch (_) { /* ignore */ } });
      label(); mid.appendChild(b);
    }
    // group tabs appear once a group exists
    setInterval(() => {
      const any = typeof GROUPS !== 'undefined' && GROUPS.some(g => g.length);
      document.body.classList.toggle('nogrp', !any);
    }, 300);
    if (typeof resize === 'function') resize();
  }
  if (document.readyState === 'complete') setTimeout(boot, 200); else window.addEventListener('load', () => setTimeout(boot, 200));
})();

