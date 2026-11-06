#!/usr/bin/env python3
"""Builds Melaka mission 5, "The Last Sultan of Melaka" (demo part 1), as a standalone page from the main game.

Reads the main game (the repo's index.html, or sea-rts-fixes/index.html), swaps the title and cards,
renames the few functions the mission wraps, and adds the mission code. The main game file is only
read, never changed. Same approach as the Rise of Majapahit demo.

    python3 build.py [main-index.html] [out.html]
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PF = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(PF, 'sea-rts-fixes', 'index.html')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, '..', 'index.html')

html = open(SRC, encoding='utf-8').read()


def rep(old, new, count=1):
    global html
    n = html.count(old)
    if n != count:
        if os.environ.get('SOFT'): print('MISS', n, repr(old[:110])); return
        raise SystemExit('patch expected %d match(es), found %d: %r' % (count, n, old[:90]))
    html = html.replace(old, new)


def rep_between(start, end, new):
    global html
    a = html.index(start)
    b = html.index(end, a)
    html = html[:a] + new + html[b:]


def read(*p):
    return open(os.path.join(*p), encoding='utf-8').read()


# ---------- page head: a standalone page, no PWA bits ----------
rep('<title>SEA RTS Pixel Game</title>', '<title>The Last Sultan of Melaka</title>')
html = re.sub(r'<link rel="manifest"[^>]*>\n<link rel="icon"[^>]*>\n<link rel="apple-touch-icon"[^>]*>\n', '', html, count=1)
rep('<meta name="apple-mobile-web-app-title" content="SEA Kingdoms">', '<meta name="apple-mobile-web-app-title" content="Last Sultan">')
html = re.sub(r"<script>\n/\* app updates:.*?</script>\n", '', html, count=1, flags=re.S)
rep('</style>\n\n</head>', read(HERE, 'm5.css') + '</style>\n\n</head>')

# ---------- cards ----------
rep('  <div id="ov" hidden>\n    <div class="card" id="ov-pause" hidden>', '  <div id="ov" hidden>\n    ' + read(HERE, 'start-card.html') + '<div class="card" id="ov-pause" hidden>')
# saving goes through the shared mission save module (sea-rts-fixes/mission-save), never the skirmish save
rep('      <button class="btn alt" data-do="quit">Save and exit to menu</button>\n', '')
rep('      <button class="btn alt" data-do="home">Main menu</button>\n', '')
rep('function saveGame() {', 'function saveGame() { }\nfunction baseSaveGame() {')
rep('''      <div class="row">
        <button class="btn alt" data-do="restart">Restart</button>
        <button class="btn alt" data-do="newmap">New map</button>
      </div>''', '''      <button class="btn alt" data-do="restart">Restart</button>
      <p class="lead tipline" id="pause-tip"></p>''')
rep('''      <div class="row">
        <button class="btn" data-do="restart">Again</button>
        <button class="btn alt" data-do="newmap">New map</button>
      </div>''', '''      <button class="btn" data-do="restart">Play again</button>''')
rep('<div class="tag">Battle over</div>', '<div class="tag" id="end-tag">Battle over</div>')
rep_between('    <div class="card" id="ov-help" hidden>', '  </div>\n</div>\n\n<script>', read(HERE, 'help-card.html'))
rep("for (const n of ['pause', 'end', 'help'])", "for (const n of ['start', 'pause', 'end', 'help', 'story'])")
rep("  else if (a === 'start') startGame(seedUsed);", "  else if (a === 'start') startGame(seedUsed);\n  else if (a === 'skipwave') skipTo(el.dataset.v);")

# ---------- functions the mission wraps (the originals keep working under a base* name) ----------
for name in ['unitSprite(kind, team, anim, f, tool)', 'buildingSprite(kind, team, level)', 'shipSprite(u)',
             'paintUnit(u)', 'hintText()', 'updateHud()', 'startGame(seed)', 'endGame()',
             'togglePause()', 'bldNote(b)', 'describeOrder(u)']:
    rep('function ' + name, 'function base' + name[0].upper() + name[1:])

# ---------- map drawing hooks: the flood plain and bridges under everything, rain and markers on top ----------
rep("  const tall = [];\n  const expl = (x, y) =>", "  paintGround(x0, x1, y0, y1);\n  const tall = [];\n  const expl = (x, y) =>")
rep("  paintPlacement(); paintMarkers();\n", "  paintMission(); paintPlacement(); paintMarkers();\n")

# ---------- boot: the mission boots instead ----------
a = html.index('(function boot() {')
b = html.index('})();', a) + len('})();')
html = html[:a] + 'mrBoot();' + html[b:]
ART = os.path.join(PF, 'unit-art')
aux = ('/* ===== art book: campaign civs (unit-art/aux-civs.js) ===== */\nconst AUX = (function () {\n' + read(ART, 'aux-civs.js')
       + '\nreturn { auxUnitSprite, auxBigSprite, auxShipSprite };\n})();\n')
props = ('/* ===== art book: campaign props and ambient life (unit-art/campaign-props/src) ===== */\nconst PROPSET = (function () {\n'
         + read(ART, 'campaign-props', 'src', 'props.js') + read(ART, 'campaign-props', 'src', 'mobs.js')
         + '\nreturn { PROPS, MOBS, propSprite, mobSprite };\n})();\n')
code = aux + props + read(HERE, 'm5-sim.js') + read(HERE, 'm5-art.js') + read(HERE, 'm5-scenes.js') + read(HERE, 'm5-ui.js')
html = html.replace('mrBoot();', code + '\nmrBoot();', 1)

# ---------- the exit button every mission page has (start, pause and end cards) ----------
EXIT = '''<script>
/* Exit to main menu: on the start, pause and end cards of every mission */
(function () {
  const home = /github\\.io$/.test(location.hostname) ? '../../' : 'https://therediris0827.github.io/SEA-RTS/';
  for (const id of ['ov-start', 'ov-pause', 'ov-end']) {
    const c = document.getElementById(id); if (!c || c.querySelector('.exit-home')) continue;
    const b = document.createElement('button'); b.className = 'btn alt exit-home'; b.type = 'button'; b.textContent = 'Exit to main menu';
    b.addEventListener('click', () => { location.replace(home); });
    c.appendChild(b);
  }
})();
</script>
'''
SAVE = ('<script>\nwindow.MSAVE_CFG = { title: \'The Last Sultan of Melaka\', page: \'campaign/melaka-5/\', id: \'mel5\', opts: (g) => ({ civs: g.civs }) };\n'
        + read(PF, 'sea-rts-fixes', 'mission-save', 'mission-save.js') + '</script>\n')
rep('</body>\n</html>', SAVE + EXIT + '</body>\n</html>')

open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', os.path.abspath(OUT), len(html), 'bytes')
