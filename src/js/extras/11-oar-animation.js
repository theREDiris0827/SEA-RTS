/* ##### CHAPTER EXTRA 11 · Rowing oars #####
   File: src/js/extras/11-oar-animation.js   (drafted by the demos thread, added in v0.9.53)
   What it does: ships under way (u.moving) swing their oars in a slow ripple; a ship at rest keeps the still picture.
   How: oars() in the ship-art files reads window.OARPH. While a moving ship's picture is built, this chapter sets
   OARPH to the stroke frame (0-3) and adds it to the sprite cache key, so each ship is drawn once per frame, then reused.
   Things you can tweak:
     - OARANIM.fps: strokes per second (frames must stay 4 unless oars() changes).
   ############################################################################ */
(function () {
  const OARANIM = { fps: 6, frames: 4 };   // strokes per second; the picture cycle (do not change frames without changing oars())
  window.OARANIM = OARANIM;
  let on = false;
  const _sprite = sprite;
  sprite = function (key, lw, lh, scale, draw, outline) { return _sprite(on ? key + '|o' + window.OARPH : key, lw, lh, scale, draw, outline); };
  const _ship = shipSprite;
  shipSprite = function (u) {
    if (!u || !u.moving || u.kind === 'raft' || typeof nowS === 'undefined') return _ship(u);
    on = true; window.OARPH = Math.floor(nowS * OARANIM.fps + (u.id || 0)) % OARANIM.frames;
    try { return _ship(u); } finally { on = false; window.OARPH = null; }
  };
})();
/* ===== end rowing oars ===== */
