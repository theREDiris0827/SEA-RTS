/* ##### CHAPTER ART 9 · Icons #####
   File: src/js/art/09-icons.js
   What it does: Small pictures for buttons, and marks on the ground.
   ############################################################################ */
/* ------------------------------ icons & decals ------------------------------ */
function iconSprite(name) {
  return sprite('i|' + name, 16, 16, 2, (P) => {
    const r = P.r;
    if (name === 'food') { disc(P, 8, 9, 5, '#d6303a'); r(7, 3, 2, 3, '#4a7a2a'); r(9, 3, 3, 2, '#5ca84a'); r(5, 7, 2, 2, '#ff8a8a'); }
    else if (name === 'wood') { r(2, 5, 11, 7, '#8a5a2b'); r(3, 6, 8, 1, '#6e451f'); r(3, 9, 8, 1, '#6e451f'); disc(P, 12, 8, 3, '#c99b5d'); disc(P, 12, 8, 1, '#8a5a2b'); }
    else if (name === 'gold') { disc(P, 8, 8, 6, '#e0a82a'); disc(P, 8, 8, 4, '#f2c94c'); r(7, 5, 2, 6, '#e0a82a'); r(6, 5, 1, 1, '#fff6b0'); }
    else if (name === 'pop') { r(6, 2, 4, 4, SKIN); r(6, 2, 4, 1, HAIR); r(4, 6, 8, 6, '#efe3c0'); r(4, 9, 8, 1, '#2f9e5b'); r(5, 12, 2, 3, '#3f6a50'); r(9, 12, 2, 3, '#3f6a50'); }
    else if (name === 'idle') { r(6, 2, 4, 4, SKIN); r(3, 1, 10, 2, '#e8c97a'); r(4, 6, 8, 6, '#efe3c0'); r(5, 12, 2, 3, '#8a6b4a'); r(9, 12, 2, 3, '#8a6b4a'); r(13, 1, 2, 5, '#f2c94c'); r(13, 7, 2, 2, '#f2c94c'); }
    else if (name === 'army') { r(7, 1, 2, 10, STEEL); r(5, 10, 6, 2, '#f2c94c'); r(7, 12, 2, 3, WOOD_D); r(2, 4, 1, 8, WOOD); r(2, 3, 1, 1, STEEL); r(13, 4, 1, 8, WOOD); r(13, 3, 1, 1, STEEL); }
    else if (name === 'plus') { r(7, 3, 2, 10, CREAM); r(3, 7, 10, 2, CREAM); }
    else if (name === 'minus') { r(3, 7, 10, 2, CREAM); }
    else if (name === 'menu') { r(3, 4, 10, 2, CREAM); r(3, 7, 10, 2, CREAM); r(3, 10, 10, 2, CREAM); }
    else if (name === 'x') { for (let i = 0; i < 9; i++) { r(3 + i, 3 + i, 2, 2, CREAM); r(11 - i, 3 + i, 2, 2, CREAM); } }
    else if (name === 'stop') { r(4, 4, 8, 8, '#d9473b'); r(4, 4, 8, 1, '#ff8a7a'); }
    else if (name === 'amove') { r(7, 1, 2, 9, STEEL); r(4, 9, 8, 2, '#d9473b'); r(7, 11, 2, 3, WOOD_D); r(2, 13, 12, 1, '#d9473b'); }
    else if (name === 'agg') { r(3, 2, 10, 9, '#d9473b'); r(4, 11, 8, 2, '#d9473b'); r(6, 13, 4, 2, '#d9473b'); r(3, 2, 10, 1, '#ff8a7a'); r(7, 3, 2, 8, STEEL); r(5, 9, 6, 1, '#f2c94c'); }
    else if (name === 'def') { r(3, 2, 10, 9, '#2f9e5b'); r(4, 11, 8, 2, '#2f9e5b'); r(6, 13, 4, 2, '#2f9e5b'); r(3, 2, 10, 1, '#7dffa8'); r(7, 4, 2, 7, CREAM); r(5, 6, 6, 2, CREAM); }
    else if (name === 'hold') { r(1, 6, 14, 9, '#8a8478'); r(1, 6, 14, 1, '#c9c2b0'); r(1, 10, 14, 1, '#5e594f'); r(5, 6, 1, 4, '#5e594f'); r(10, 10, 1, 5, '#5e594f'); r(1, 2, 3, 4, '#8a8478'); r(6, 2, 4, 4, '#8a8478'); r(12, 2, 3, 4, '#8a8478'); }
    else if (name === 'form') { r(2, 3, 3, 3, CREAM); r(7, 3, 3, 3, CREAM); r(12, 3, 3, 3, CREAM); r(2, 8, 3, 3, CREAM); r(7, 8, 3, 3, CREAM); r(12, 8, 3, 3, CREAM); }
    else if (name === 'flag') { r(4, 1, 1, 14, WOOD_D); r(5, 2, 8, 5, '#f2c94c'); r(5, 2, 8, 1, '#fff6b0'); }
    else if (name === 'check') { for (let i = 0; i < 4; i++) r(2 + i, 8 + i, 2, 2, '#7dffa8'); for (let i = 0; i < 7; i++) r(5 + i, 11 - i, 2, 2, '#7dffa8'); }
    else if (name === 'bell') { r(7, 1, 2, 2, '#c9a05a'); r(5, 3, 6, 2, '#e0b04a'); r(4, 5, 8, 5, '#e0b04a'); r(3, 10, 10, 2, '#c9902a'); r(5, 4, 2, 6, '#fff0a0'); r(7, 12, 2, 2, '#8a5a2b'); }
    else if (name === 'ring') { disc(P, 8, 8, 6, '#fff'); disc(P, 8, 8, 4, '#00000000'); }
  }, name !== 'ring');
}
// rubble left by a destroyed building
function rubbleSprite(size) {
  return sprite('rubble|' + size, size * 16, size * 12, 2, (P) => {
    const r = P.r, w = size * 16, h = size * 12;
    for (let i = 0; i < size * 14; i++) {
      const x = Math.floor(hash2(i, 1, 5) * (w - 6)), y = Math.floor(hash2(i, 2, 5) * (h - 4)) + 2;
      r(x, y, 2 + (i % 3), 1 + (i % 2), i % 3 ? '#5e3b1c' : (i % 5 ? '#7a5a38' : '#3a2a1a'));
    }
  });
}

