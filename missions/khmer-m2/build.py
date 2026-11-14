#!/usr/bin/env python3
"""Builds Khmer mission 2, "Where Four Rivers Meet", as a standalone page from the main game.

Reads the main game (the repo's index.html, or sea-rts-fixes/index.html), swaps the title and cards,
and adds the mission code at the very end of the page, after the main game's add-on chapters (the
Mangrove Delta map lives in one of them), so the mission wraps their functions. The main game file is
only read, never changed. Same kit as Island City (ayutthaya-m1/src/build.py).

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


def scoped(name, files, exports):
    """wrap art files in one scope so their helper names don't clash with the game's"""
    body = '\n'.join(read(PF, f) for f in files)
    return '/* ---------- %s (from %s) ---------- */\nconst %s = (() => {\n%s\nreturn { %s };\n})();\n' % (
        name, ', '.join(files), name, body, ', '.join(exports))


TITLE = 'Where Four Rivers Meet'
# ---------- page head: a standalone page, no PWA bits ----------
rep('<title>SEA RTS Pixel Game</title>', '<title>%s</title>' % TITLE)
html = re.sub(r'<link rel="manifest"[^>]*>\n<link rel="icon"[^>]*>\n<link rel="apple-touch-icon"[^>]*>\n', '', html, count=1)
rep('<meta name="apple-mobile-web-app-title" content="SEA Kingdoms">', '<meta name="apple-mobile-web-app-title" content="%s">' % TITLE)
html = re.sub(r"<script>\n/\* app updates:.*?</script>\n", '', html, count=1, flags=re.S)
rep('</style>\n\n</head>', read(HERE, 'm2.css') + '</style>\n\n</head>')
html = html.replace('<canvas id="mini" width="128" height="96">', '<canvas id="mini" width="192" height="144">')

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

# ---------- the Chaktomuk map uses the Riverlands river painter ----------
rep("if (this.map === 'river') this.genRiverlands(M);", "if (this.map === 'river' || this.map === 'chaktomuk') this.genRiverlands(M);")
rep("  const tall = [];\n  const expl = (x, y) =>", "  paintGround(x0, x1, y0, y1);\n  const tall = [];\n  const expl = (x, y) =>")

# ---------- drawing hooks: torches and night under the markers, the fleet's lanterns over the fog ----------
rep("  paintPlacement(); paintMarkers();\n", "  paintMission(); paintPlacement(); paintMarkers();\n")
rep("ctx.drawImage(fogC, 0, 0, W * TILE, H * TILE); ctx.imageSmoothingEnabled = false;\n",
    "ctx.drawImage(fogC, 0, 0, W * TILE, H * TILE); ctx.imageSmoothingEnabled = false;\n  if (typeof paintAfterFog === 'function') paintAfterFog();\n")

# ---------- panel ----------
rep("    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"", "    cmds += mrBldCmds(b);\n    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"")
rep("  else if (a === 'desel') { select([]); mode = null; }", "  else if (mrPanelAction(a, el)) { /* handled */ }\n  else if (a === 'desel') { select([]); mode = null; }")

# ---------- boot: the mission boots at the end of the page instead ----------
a = html.index('(function boot() {')
b = html.index('})();', a) + len('})();')
html = html[:a] + '/* the mission boots at the end of the page (m2-ui.js mrBoot) */' + html[b:]

code = read(HERE, 'm2-sim.js') + read(HERE, 'm2-art.js') + read(HERE, 'm2-scenes.js') + read(HERE, 'm2-ui.js')
MISSION = '<script>\n/* ===== Khmer mission 2: Where Four Rivers Meet (khmer-m2/src) ===== */\n' + code + '\nmrBoot();\n</script>\n'

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
SAVE = ('<script>\nwindow.MSAVE_CFG = { title: \'%s\', page: \'campaign/khmer-2/\', id: \'khm2\', opts: (g) => ({ seed: KM2.seed, diff: g.diff, map: \'chaktomuk\', civs: g.civs, startAge: 2 }), after: (ex, g) => { g.computeRegions(); plainG = null; } };\n' % TITLE.replace("'", "\\'")
        + read(PF, 'sea-rts-fixes', 'mission-save', 'mission-save.js') + '</script>\n')
rep('</body>\n</html>', MISSION + SAVE + EXIT + '</body>\n</html>')

open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', os.path.abspath(OUT), len(html), 'bytes')
