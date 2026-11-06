#!/usr/bin/env python3
"""Build a playable preview: main index.html + the new-maps patch, injected before the service-worker script.
usage: build.py <main index.html> <out.html>"""
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
html = open(src, encoding='utf-8').read()
parts = [open(os.path.join(here, f), encoding='utf-8').read() for f in ['calm.js', 'thumbs.js', 'newmaps-core.js', 'menu.js'] if os.path.exists(os.path.join(here, f))]
patch = '<script>\n/* ===== newmaps patch (maps/newmaps) ===== */\n' + '\n'.join(parts) + '\n</script>\n'
marker = "<script>\n/* app updates:"
assert marker in html, 'service-worker script marker not found'
html = html.replace(marker, patch + marker, 1)
if len(sys.argv) > 3: html = html.replace('<title>SEA RTS Pixel Game</title>', '<title>' + sys.argv[3] + '</title>', 1)
open(out, 'w', encoding='utf-8').write(html)
print('wrote', out, len(html))
