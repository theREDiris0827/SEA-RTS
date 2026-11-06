#!/usr/bin/env python3
"""Wire the new maps + calm look into main index.html (in place). Replaces an earlier wiring block if present.
usage: wire.py <index.html>"""
import sys, os, re
here = os.path.dirname(os.path.abspath(__file__)); nm = os.path.join(here, '..', 'newmaps')
p = sys.argv[1]; html = open(p, encoding='utf-8').read()
parts = [open(os.path.join(nm, f), encoding='utf-8').read() for f in ['calm.js', 'newmaps-core.js']] + [open(os.path.join(here, f), encoding='utf-8').read() for f in ['calm-old.js', 'menu-thumbs.js']]
block = '<script>\n/* ===== maps: calm look + new maps (sea-rts-fixes/maps/wiring/wire.py) ===== */\n' + '\n'.join(parts) + '\n/* ===== end maps ===== */\n</script>\n'
html = re.sub(r'<script>\n/\* ===== maps: calm look.*?/\* ===== end maps ===== \*/\n</script>\n', '', html, flags=re.S)
marker = "<script>\n/* app updates:"
assert marker in html
html = html.replace(marker, block + marker, 1)
open(p, 'w', encoding='utf-8').write(html); print('wired', len(html))
