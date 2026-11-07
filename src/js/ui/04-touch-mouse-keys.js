/* ##### CHAPTER SCREEN 4 · Touch, mouse and keys #####
   File: src/js/ui/04-touch-mouse-keys.js
   What it does: Finger drag to scroll, pinch to zoom, hold-drag to box select, mouse wheel, keyboard keys.
   Things you can tweak:
     - The pinch zoom limit is also here (0.38, 2.6): keep it the same as setZoom().
   ############################################################################ */
/* ---------------- pointer input ---------------- */
function pos(e) { const r = cvs.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
cvs.addEventListener('contextmenu', (e) => e.preventDefault());
cvs.addEventListener('pointerdown', (e) => {
  if (!started || paused) return;
  try { cvs.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  const q = pos(e), p = { id: e.pointerId, sx: q.x, sy: q.y, x: q.x, y: q.y, lx: q.x, ly: q.y, type: e.pointerType, moved: false, shift: e.shiftKey };
  ptrs.set(e.pointerId, p);
  if (ptrs.size === 2) {
    if (gest && gest.timer) clearTimeout(gest.timer);
    boxRect = null;
    const [a, b] = [...ptrs.values()], cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    gest = { type: 'pinch', d0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), z0: view.zoom, ax: cam.x + cx / view.zoom, ay: cam.y + cy / view.zoom, t0: performance.now(), c0: [cam.x, cam.y] };
    return;
  }
  if (ptrs.size > 2) return;
  if (faceAim(p, e)) return;
  if (p.type === 'mouse') {
    if (e.button === 2) { const w = s2w(q.x, q.y); if (mode) { mode = null; panelKey = ''; ptrs.delete(e.pointerId); return; } if (aimable(w.x, w.y)) { gest = { type: 'raim', p }; return; } contextCommand(w.x, w.y); ptrs.delete(e.pointerId); return; }
    if (e.button === 1) { gest = { type: 'pan', p }; return; }
    gest = { type: 'press', p };
  } else if (mode && mode.kind === 'place' && mode.line && mode.tx != null && (() => { const w = s2w(q.x, q.y); return Math.hypot(w.x - mode.ax - 0.5, w.y - mode.ay - 0.5) < 0.9 && Math.hypot(w.x - mode.ax - 0.5, w.y - mode.ay - 0.5) <= Math.hypot(w.x - mode.tx - 0.5, w.y - mode.ty - 0.5); })()) {
    gest = { type: 'ghost', p, end: 'a', ox: 0, oy: 0 };
  } else if (mode && mode.kind === 'place' && mode.tx != null && (() => { const w = s2w(q.x, q.y), d = BD[mode.bkind]; return w.x >= mode.tx - 0.3 && w.x < mode.tx + d.size + 0.3 && w.y >= mode.ty - 0.3 && w.y < mode.ty + (d.fh || d.size) + 0.3; })()) {
    const w = s2w(q.x, q.y); gest = { type: 'ghost', p, ox: w.x - mode.tx, oy: w.y - mode.ty };
  } else {
    gest = { type: 'press', p, timer: setTimeout(() => { if (gest && gest.p === p && !p.moved && gest.type === 'press') { gest.type = 'box'; boxRect = { x: p.sx, y: p.sy, w: 0, h: 0 }; if (navigator.vibrate) { try { navigator.vibrate(12); } catch (_) { /* ignore */ } } } }, 360) };
  }
});
cvs.addEventListener('pointermove', (e) => {
  const q = pos(e), p = ptrs.get(e.pointerId);
  if (e.pointerType === 'mouse') {
    const w = s2w(q.x, q.y); hover = { mouse: true, wx: w.x, wy: w.y, sx: q.x, sy: q.y };
    if (mode && mode.kind === 'place' && !ptrs.size) { placeAt(w.x, w.y); if (mode.line && !mode.anchored) { mode.ax = mode.tx; mode.ay = mode.ty; } }
  }
  if (!p) return;
  p.x = q.x; p.y = q.y;
  if (!gest) return;
  if (gest.type === 'pinch' && ptrs.size >= 2) {
    const [a, b] = [...ptrs.values()], cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    view.zoom = clamp(gest.z0 * Math.hypot(a.x - b.x, a.y - b.y) / gest.d0, 0.38, 2.6);
    cam.x = gest.ax - cx / view.zoom; cam.y = gest.ay - cy / view.zoom; clampCam(); return;
  }
  if (gest.p !== p) return;
  const dist = Math.hypot(q.x - p.sx, q.y - p.sy);
  if (gest.type === 'ghost') {
    if (dist > 6) p.moved = true;
    if (p.moved && mode && mode.kind === 'place') {
      const w = s2w(q.x, q.y);
      if (gest.end === 'a') { mode.ax = Math.floor(w.x); mode.ay = Math.floor(w.y); }
      else if (mode.line) { mode.tx = Math.floor(w.x); mode.ty = Math.floor(w.y); }
      else { mode.tx = Math.round(w.x - gest.ox); mode.ty = Math.round(w.y - gest.oy); }
    }
    p.lx = q.x; p.ly = q.y; return;
  }
  if (gest.type === 'raim' && dist > 12) { p.moved = true; startAim(p); }
  if (gest.type === 'aim') { aimMove(q); p.lx = q.x; p.ly = q.y; return; }
  if (gest.type === 'press') {
    if (p.type === 'mouse') { if (dist > 5) { gest.type = 'box'; p.moved = true; } }
    else if (dist > 9) { p.moved = true; clearTimeout(gest.timer); gest.type = 'pan'; }
  }
  if (gest.type === 'pan') { cam.x -= (q.x - p.lx) / view.zoom; cam.y -= (q.y - p.ly) / view.zoom; clampCam(); }
  if (gest.type === 'box') { boxRect = { x: Math.min(p.sx, q.x), y: Math.min(p.sy, q.y), w: Math.abs(q.x - p.sx), h: Math.abs(q.y - p.sy) }; }
  p.lx = q.x; p.ly = q.y;
});
// finger or mouse lifted: tap, drag or box
function endPointer(e, cancelled) {
  const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId);
  if (!gest) return;
  if (gest.type === 'pinch') { if (ptrs.size < 2) { if (typeof twoFingerTap === 'function') twoFingerTap(gest); gest = ptrs.size === 1 ? { type: 'dead' } : null; } return; }
  if (gest.type === 'dead') { if (!ptrs.size) gest = null; return; }
  if (!p || gest.p !== p) return;
  if (gest.timer) clearTimeout(gest.timer);
  const g0 = gest; gest = null;
  if (cancelled) { boxRect = null; aim = null; return; }
  if (g0.type === 'aim') { aimEnd(); return; }
  if (g0.type === 'raim') { const w = s2w(p.x, p.y); if (mode) { mode = null; panelKey = ''; } else contextCommand(w.x, w.y); return; }
  if (g0.type === 'box') {
    const r = boxRect; boxRect = null;
    if (r && (r.w > 6 || r.h > 6)) boxSelect(r, p.shift); else { const w = s2w(p.x, p.y); handleTap(w.x, w.y, { touch: p.type !== 'mouse', shift: p.shift }); }
  } else if (g0.type === 'press' || (g0.type === 'ghost' && !p.moved)) {
    const w = s2w(p.x, p.y); handleTap(w.x, w.y, { touch: p.type !== 'mouse', shift: p.shift });
  }
}
cvs.addEventListener('pointerup', (e) => endPointer(e, false));
cvs.addEventListener('pointercancel', (e) => endPointer(e, true));
cvs.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hover = null; });
cvs.addEventListener('wheel', (e) => { e.preventDefault(); const q = pos(e); setZoom(view.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12), q.x, q.y); }, { passive: false });
let miniDrag = false;
// tap the minimap to move the camera
function miniGo(e) {
  const r = miniEl.getBoundingClientRect();
  centerOn(clamp((e.clientX - r.left) / r.width, 0, 1) * W, clamp((e.clientY - r.top) / r.height, 0, 1) * H);
}
miniEl.addEventListener('pointerdown', (e) => {
  if (!started || paused) return;
  e.preventDefault();
  if (e.pointerType === 'mouse' && e.button === 2) {
    const r = miniEl.getBoundingClientRect(); const wx = clamp((e.clientX - r.left) / r.width, 0, 1) * W, wy = clamp((e.clientY - r.top) / r.height, 0, 1) * H;
    if (selUnits().length) issue(wx, wy, null); return;
  }
  miniDrag = true; try { miniEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } miniGo(e);
});
miniEl.addEventListener('pointermove', (e) => { if (miniDrag) miniGo(e); });
miniEl.addEventListener('pointerup', () => { miniDrag = false; });
miniEl.addEventListener('pointercancel', () => { miniDrag = false; });
miniEl.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('keydown', (e) => {
  if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  keys[e.key.toLowerCase()] = true;
  if (!started) return;
  if (e.key === 'Escape') { if (mode) { mode = null; panelKey = ''; } else if (sel.length) select([]); else togglePause(); }
  else if (e.key === ' ') { e.preventDefault(); togglePause(); }
  else if (paused) return;
  else if (e.key === '.') cycleIdle();
  else if (e.key.toLowerCase() === 'h') { const tc = G.buildings.find(b => b.team === 0 && b.kind === 'towncentre'); if (tc) centerOn(tc.x, tc.y); }
  else if (e.key.toLowerCase() === 'a' && selUnits().some(u => u.cls !== 'vil')) { mode = mode && mode.kind === 'amove' ? null : { kind: 'amove' }; panelKey = ''; }
  else if (e.key.toLowerCase() === 'f') cycleFormation();
  else if (e.key.toLowerCase() === 's' && selUnits().length) stopSel();
  else if (e.key === 'Enter' && mode && mode.kind === 'place') tryPlace(false);
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

