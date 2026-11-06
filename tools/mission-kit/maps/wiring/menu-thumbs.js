/* the three new maps in the skirmish picker; thumbnails are drawn from the maps themselves when the
   picker first opens (keeps index.html small instead of embedding pictures) */
(function () {
  const seg = document.getElementById('m-mapk'); if (!seg) return;
  const NEW = [['highlands', 'Highlands'], ['jungle', 'Deep Jungle'], ['delta', 'Mangrove Delta']];
  for (const [k, n] of NEW) {
    if (seg.querySelector('[data-v="' + k + '"]')) continue;
    const b = document.createElement('button'); b.className = 'px m-map'; b.dataset.m = 'mapk'; b.dataset.v = k;
    b.innerHTML = '<img alt=""><b>' + n + '</b>'; seg.appendChild(b);
  }
  let done = false;
  const draw = () => {
    if (done) return; done = true;
    NEW.forEach(([k], i) => setTimeout(() => {
      try {
        const g = new Game({ seed: 7, diff: 'normal', map: k, civs: [0, 1] }), base = buildMiniBase(g);
        const c = cv(W * 2, H * 2), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0, W * 2, H * 2);
        x.fillStyle = 'rgba(30,70,35,.75)'; for (const n of g.nodes) if (n.kind === 'tree') x.fillRect(n.tx * 2, n.ty * 2, 2, 2);
        for (const b of g.buildings) if (b.kind === 'towncentre') { x.fillStyle = b.team === 0 ? '#f2c94c' : b.team === 1 ? '#e8463a' : '#ddd'; x.fillRect(b.tx * 2 - 1, b.ty * 2 - 1, 8, 8); }
        const img = seg.querySelector('[data-v="' + k + '"] img'); if (img) img.src = c.toDataURL();
      } catch (e) { }
    }, 50 + i * 120));
  };
  const obs = new MutationObserver(() => { if (seg.offsetParent) { draw(); obs.disconnect(); } });
  obs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['hidden', 'class'] });
  if (seg.offsetParent) draw();
})();
