/* adds the three new maps to the skirmish map picker (thumbnails from thumbs.js when present) */
(function () {
  const seg = document.getElementById('m-mapk'); if (!seg) return;
  for (const [k, n] of [['highlands', 'Highlands'], ['jungle', 'Deep Jungle'], ['delta', 'Mangrove Delta']]) {
    if (seg.querySelector('[data-v="' + k + '"]')) continue;
    const b = document.createElement('button'); b.className = 'px m-map'; b.dataset.m = 'mapk'; b.dataset.v = k;
    const src = (window.NEWMAP_THUMBS || {})[k];
    b.innerHTML = (src ? '<img alt="" src="' + src + '">' : '<span class="q">?</span>') + '<b>' + n + '</b>';
    seg.appendChild(b);
  }
})();
