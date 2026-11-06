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
    ('/* ##### CHAPTER SIM 1 · Basics #####', 'js/sim/01-core.js'),
    ('/* ##### CHAPTER SIM 2 · Units, civs and buildings #####', 'js/sim/02-units-buildings.js'),
    ('/* ##### CHAPTER SIM 3 · Ages, resources, AI difficulty, maps #####', 'js/sim/03-ages-resources-ai-maps.js'),
    ('  /* ##### CHAPTER SIM 4 · Starting a game #####', 'js/sim/04-game-setup.js'),
    ('  /* ##### CHAPTER SIM 5 · Units, costs and ages #####', 'js/sim/05-entities-ages.js'),
    ('  /* ##### CHAPTER SIM 6 · Finding the way #####', 'js/sim/06-paths-and-searching.js'),
    ('  /* ##### CHAPTER SIM 7 · Orders #####', 'js/sim/07-orders.js'),
    ('  /* ##### CHAPTER SIM 8 · Building and training #####', 'js/sim/08-building-training.js'),
    ('  /* ##### CHAPTER SIM 9 · Every tick: buildings, soldiers, fire #####', 'js/sim/09-every-tick.js'),
    ('  /* ##### CHAPTER SIM 10 · Gathering, repairing, damage #####', 'js/sim/10-gather-repair-damage.js'),
    ('  /* ##### CHAPTER SIM 11 · What you tapped, and the enemy AI #####', 'js/sim/11-enemy-ai.js'),
    ('/* ##### CHAPTER ART 1 · Drawing basics #####', 'js/art/01-core.js'),
    ('/* ##### CHAPTER ART 2 · People #####', 'js/art/02-people.js'),
    ('/* ##### CHAPTER ART 3 · Nature #####', 'js/art/03-nature.js'),
    ('/* ##### CHAPTER ART 4 · Ships #####', 'js/art/04-ships.js'),
    ('/* ##### CHAPTER ART 5 · Melaka and Majapahit buildings #####', 'js/art/05-melaka-majapahit-buildings.js'),
    ('/* ##### CHAPTER ART 6 · Ayutthaya #####', 'js/art/06-ayutthaya.js'),
    ('/* ##### CHAPTER ART 7 · Soldiers through the ages #####', 'js/art/07-age-looks.js'),
    ('/* ##### CHAPTER ART 8 · Shared buildings and walls #####', 'js/art/08-shared-buildings.js'),
    ('/* ##### CHAPTER ART 9 · Icons #####', 'js/art/09-icons.js'),
    ('/* ##### CHAPTER ART 10 · Ground #####', 'js/art/10-terrain.js'),
    ('/* ##### CHAPTER SCREEN 1 · Screen, camera, fog #####', 'js/ui/01-screen-camera-fog.js'),
    ('/* ##### CHAPTER SCREEN 2 · Drawing the battlefield #####', 'js/ui/02-drawing.js'),
    ('/* ##### CHAPTER SCREEN 3 · Selecting and giving orders #####', 'js/ui/03-selecting.js'),
    ('/* ##### CHAPTER SCREEN 4 · Touch, mouse and keys #####', 'js/ui/04-touch-mouse-keys.js'),
    ('/* ##### CHAPTER SCREEN 5 · Action panel #####', 'js/ui/05-action-panel.js'),
    ('/* ##### CHAPTER SCREEN 6 · Top bar, game flow and saves #####', 'js/ui/06-hud-saves.js'),
    ('/* ##### CHAPTER SCREEN 7 · Menus and encyclopedia #####', 'js/ui/07-menus-encyclopedia.js'),
    ('/* ##### CHAPTER SCREEN 8 · Sound #####', 'js/ui/08-sound.js'),
    ('/* ##### CHAPTER SCREEN 9 · Main loop #####', 'js/ui/09-main-loop.js'),
    ('/* ##### CHAPTER EXTRA 1 · Calm map look and new maps #####', 'js/extras/01-maps.js'),
    ('/* ##### CHAPTER EXTRA 2 · Animals and kerbau #####', 'js/extras/02-animals-kerbau.js'),
    ('/* ##### CHAPTER EXTRA 3 · Smarter AI #####', 'js/extras/03-ai-plus.js'),
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
