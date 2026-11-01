/* ------------------------------ nature ------------------------------ */
function treeSprite(v) {
  return sprite('tree|' + v, 20, 28, 2, (P) => {
    const r = P.r;
    if (v < 2) {
      const lean = v === 0 ? 1 : -1; let tx = 9, ty = 12;
      for (let i = 0; i < 16; i++) {
        const x = 8 + Math.round(Math.sin(i * 0.2 + v) * 1.6 + i * 0.12 * lean), y = 26 - i;
        r(x, y, 2, 1, i % 3 === 0 ? '#6e5230' : '#8d6c3d'); tx = x; ty = y;
      }
      const fr = (dx, dy, len, dr) => {
        for (let t = 1; t <= len; t++) {
          const x = Math.round(tx + dx * t), y = Math.round(ty + dy * t + dr * t * t * 0.07);
          r(x, y, 2, 1, t % 2 ? '#3f8a3a' : '#5ca84a'); r(x, y + 1, 1, 1, '#2d6a2c');
        }
      };
      fr(-1, -0.15, 8, 1); fr(1, -0.15, 8, 1); fr(-0.7, -0.7, 7, 0.6); fr(0.7, -0.7, 7, 0.6); fr(-0.45, 0.3, 6, 1.4); fr(0.45, 0.3, 6, 1.4); fr(0, -1, 5, 0);
      r(tx - 1, ty + 1, 2, 2, WOOD_D); r(tx + 1, ty + 2, 2, 2, '#4a2e14');
    } else {
      const big = v === 2;
      r(9, 17, 3, 10, '#6b4a2a'); r(9, 17, 1, 10, '#4d3320'); r(7, 25, 2, 2, '#6b4a2a'); r(12, 25, 2, 2, '#6b4a2a');
      disc(P, 10, big ? 10 : 11, big ? 8 : 7, '#2f7a3a'); disc(P, 6, 12, 5, '#3a8a42'); disc(P, 14, 10, 5, '#46994a');
      disc(P, 9, big ? 6 : 8, 3, '#5fb35a'); r(5, 15, 11, 2, '#245f2d'); r(7, 7, 2, 1, '#79c871');
    }
  });
}
function bushSprite() {
  return sprite('berry', 16, 14, 2, (P) => {
    const r = P.r;
    disc(P, 8, 8, 5, '#2e7a3a'); disc(P, 5, 9, 3, '#3a8a42'); disc(P, 11, 9, 3, '#3a8a42'); r(3, 11, 10, 1, '#24602c');
    for (const p of [[4, 6], [9, 4], [11, 8], [6, 9], [8, 7], [3, 9]]) { r(p[0], p[1], 2, 2, '#d6303a'); r(p[0], p[1], 1, 1, '#ff8a8a'); }
  });
}
function goldSprite() {
  return sprite('gold', 16, 14, 2, (P) => {
    const r = P.r;
    disc(P, 8, 9, 5, '#7b7f88'); disc(P, 5, 10, 3, '#8b9099'); disc(P, 11, 10, 3, '#6d717a'); r(3, 12, 10, 1, '#555960');
    r(6, 6, 3, 2, '#f2c94c'); r(10, 8, 3, 2, '#e0a82a'); r(4, 9, 2, 2, '#ffe27a'); r(7, 6, 1, 1, '#fff6b0'); r(8, 10, 2, 1, '#f2c94c');
  });
}

