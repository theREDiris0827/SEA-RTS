#!/usr/bin/env python3
"""SEA Kingdoms source tool.

The game is served as ONE file, index.html (GitHub Pages and the PWA load it).
To make it readable, the same code also lives in small files under src/.

  python3 tools/build.py          src/  ->  index.html   (glue the pieces together)
  python3 tools/build.py split    index.html  ->  src/   (cut index.html into pieces)
  python3 tools/build.py check    say whether src/ and index.html match

src/index.html is the page template. Each line '@@include <file>' in it is
replaced by that file's text, so building gives back index.html byte for byte.
Edit either side, then run build or split so the other side matches.
"""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'index.html')
INC = '@@include '

# The CSS is everything between the page's own '<style>' line and the next '</style>'.
CSS_FILE = 'css/game.css'

# The game script is cut where each of these lines starts (first match after the
# previous cut). The last piece runs up to the script's closing '</script>'.
JS_PARTS = [
    # sim: game rules, no drawing, runs in Node for tests
    ('/* ===== sim.js ===== */',                         'js/sim/0-core.js'),
    ('/* ---------- data ---------- */',                  'js/sim/1-data.js'),
    ('/* ---------- ages (lore/ages.md',                  'js/sim/2-ages-difficulty-maps.js'),
    ('class Game {',                                      'js/sim/3-game.js'),
    # art: every sprite drawn from code
    ('/* ===== art.js ===== */',                         'js/art/0-core.js'),
    ('/* ------------------------------ people',          'js/art/1-people.js'),
    ('/* ------------------------------ nature',          'js/art/2-nature.js'),
    ('/* ---------- naval roster and civ buildings',      'js/art/3-naval.js'),
    ('const CIVB = (() => {',                             'js/art/4-civ-buildings.js'),
    ('const AYART = (() => {',                            'js/art/5-ayutthaya.js'),
    ('/* ===== soldiers through the ages',               'js/art/6-ages-looks.js'),
    ('/* ------------------------------ buildings',       'js/art/7-buildings.js'),
    ('/* ------------------------------ icons',           'js/art/8-icons.js'),
    ('/* ------------------------------ terrain',         'js/art/9-terrain.js'),
    # ui: screen, camera, touch, menus, sound
    ('/* ===== ui.js ===== */',                          'js/ui/0-core-camera-fog.js'),
    ('/* ---------------- drawing',                       'js/ui/1-drawing.js'),
    ('/* ---------------- selection and orders',          'js/ui/2-orders.js'),
    ('/* ---------------- pointer input',                 'js/ui/3-input.js'),
    ('/* ---------------- panel',                         'js/ui/4-panel.js'),
    ('/* ---------------- HUD',                           'js/ui/5-hud-flow-save.js'),
    ('/* ---------------- main menu',                     'js/ui/6-menu.js'),
    ('/* ------------------------------ sound',           'js/ui/7-sound.js'),
    ('/* ---------------- main loop',                     'js/ui/8-main-loop.js'),
]


def read(p):
    with open(p, encoding='utf-8', newline='') as f:
        return f.read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(s)


def build_text():
    out = []
    for line in read(os.path.join(SRC, 'index.html')).splitlines(keepends=True):
        if line.startswith(INC):
            out.append(read(os.path.join(SRC, line[len(INC):].strip())))
        else:
            out.append(line)
    return ''.join(out)


def split():
    lines = read(OUT).splitlines(keepends=True)
    pieces, tpl, i = {}, [], 0

    def find(pred, start, what):
        for j in range(start, len(lines)):
            if pred(lines[j]):
                return j
        sys.exit('split: could not find ' + what)

    # CSS
    s = find(lambda l: l.rstrip('\r\n') == '<style>', 0, '<style>')
    e = find(lambda l: l.startswith('</style>'), s + 1, '</style>')
    tpl += lines[:s + 1] + [INC + CSS_FILE + '\n']
    pieces[CSS_FILE] = ''.join(lines[s + 1:e])
    i = e
    # JS
    starts = []
    for marker, name in JS_PARTS:
        j = find(lambda l, m=marker: l.startswith(m), (starts[-1][0] + 1) if starts else i, repr(marker))
        starts.append((j, name))
    end = find(lambda l: l.startswith('</script>'), starts[-1][0], '</script>')
    tpl += lines[i:starts[0][0]]
    for k, (j, name) in enumerate(starts):
        nxt = starts[k + 1][0] if k + 1 < len(starts) else end
        pieces[name] = ''.join(lines[j:nxt])
        tpl.append(INC + name + '\n')
    tpl += lines[end:]

    for name, text in pieces.items():
        write(os.path.join(SRC, name), text)
    write(os.path.join(SRC, 'index.html'), ''.join(tpl))
    if build_text() != read(OUT):
        sys.exit('split: rebuilding does not give back index.html')
    print('split index.html into %d files under src/' % (len(pieces) + 1))


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'build'
    if cmd == 'split':
        split()
    elif cmd == 'check':
        same = build_text() == read(OUT)
        print('src/ and index.html match' if same else 'src/ and index.html DIFFER: run build or split')
        sys.exit(0 if same else 1)
    elif cmd == 'build':
        write(OUT, build_text())
        print('built index.html from src/')
    else:
        sys.exit(__doc__)


if __name__ == '__main__':
    main()
