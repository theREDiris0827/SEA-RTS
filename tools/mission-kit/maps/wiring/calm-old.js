/* Calm look for the three original skirmish maps (Iylia approved 2026-11-01, hub batch item 7-8):
   the art thread's CALM painter (soft edges, meadow patches, shade under trees, lalang grass) and
   about one broadleaf tree in three swapped for an angsana or a mango. Missions keep their own look. */
(function () {
  if (typeof Game === 'undefined' || !window.CALM) return;
  const OLD = { strait: 1, river: 1, islands: 1 };
  const isOld = (g) => g && !g.M && OLD[g.map || 'strait'];
  const _bt = buildTerrain;
  buildTerrain = function (g) {
    if (!isOld(g)) return _bt(g);
    const c = cv(W * TILE, H * TILE), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const dens = new Float32Array(W * H);
    for (const n of g.nodes) if (n.kind === 'tree' && n.hp > 0) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const X = n.tx + dx, Y = n.ty + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const d = dx * dx + (dy - 0.2) * (dy - 0.2); if (d < 2.6) dens[Y * W + X] += (1 - d / 2.6) / 2.2;
    }
    const shade = (fx, fy) => { const X = Math.floor(fx), Y = Math.floor(fy); return X < 0 || Y < 0 || X >= W || Y >= H ? 0 : dens[Y * W + X]; };
    CALM.paint(x, g.terrain, W, H, 0, 0, W, H, { seed: g.seed, shade });
    return c;
  };
  const hh = (a, b) => (((a * 73856093) ^ (b * 19349663)) >>> 0) % 1000 / 1000;
  const _pn = paintNode;
  paintNode = function (n) {
    if (n.kind === 'tree' && n.v >= 2 && isOld(G)) {
      const r = hh(n.tx, n.ty);
      if (r >= 0.66) {
        const px = n.tx * TILE, py = n.ty * TILE, spr = CALM.tree(r < 0.83 ? 'angsana' : 'mango');
        shadow(px + 16, py + 28, 11, 4, 0.25); ctx.drawImage(spr, px + 16 - spr.width / 2, py + 31 - spr.height);
        if (isSel(n)) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(px + 2, py + 2, 28, 28); }
        return;
      }
    }
    return _pn(n);
  };
})();
