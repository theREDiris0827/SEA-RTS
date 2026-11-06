#!/usr/bin/env python3
"""Builds Ayutthaya mission 1, "The Island City", as a standalone page from the main game.

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
rep('<title>SEA RTS Pixel Game</title>', '<title>The Island City</title>')
html = re.sub(r'<link rel="manifest"[^>]*>\n<link rel="icon"[^>]*>\n<link rel="apple-touch-icon"[^>]*>\n', '', html, count=1)
rep('<meta name="apple-mobile-web-app-title" content="SEA Kingdoms">', '<meta name="apple-mobile-web-app-title" content="The Island City">')
html = re.sub(r"<script>\n/\* app updates:.*?</script>\n", '', html, count=1, flags=re.S)
rep('</style>\n\n</head>', read(HERE, 'a1.css') + '</style>\n\n</head>')

# ---------- a bigger map than skirmish (96 x 72), and room to zoom further out ----------
html = html.replace('const W = 64, H = 48,', 'const W = 96, H = 72,')   # main is 96x72 since 2026-10-31
# zoom-out limit now comes from the main game (0.38, same in every mode)
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

# ---------- functions the mission wraps (the originals keep working under a base* name) ----------
for name in ['unitSprite(kind, team, anim, f, tool)', 'buildingSprite(kind, team, level)', 'shipSprite(u)',
             'paintUnit(u)', 'paintBuilding(b)', 'hintText()', 'updateHud()', 'startGame(seed)', 'endGame()',
             'togglePause()', 'bldNote(b)', 'describeOrder(u)']:
    rep('function ' + name, 'function base' + name[0].upper() + name[1:])

# ---------- map drawing hooks: the flood plain and bridges under everything, rain and markers on top ----------
rep("  const tall = [];\n  const expl = (x, y) =>", "  paintGround(x0, x1, y0, y1);\n  const tall = [];\n  const expl = (x, y) =>")
rep("  paintPlacement(); paintMarkers();\n", "  paintMission(); paintPlacement(); paintMarkers();\n")
# icons are cached per side, since both sides are Ayutthaya here
rep("dataURL('ui|' + kind + CV(team) + '|a' + unitAge(team),", "dataURL('ui|' + kind + CV(team) + '|a' + unitAge(team) + '|' + team,")

# ---------- panel ----------
rep("<div class=\"p-sub\">Your settlement</div>", "<div class=\"p-sub\">' + ageLabel() + '</div>")
rep("    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"", "    cmds += mrBldCmds(b);\n    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"")
rep("    cmds += '<button class=\"cmd\" data-a=\"stop\"", "    cmds += mrUnitCmds(us);\n    cmds += '<button class=\"cmd\" data-a=\"stop\"")
rep("  else if (a === 'desel') { select([]); mode = null; }", "  else if (mrPanelAction(a, el)) { /* handled */ }\n  else if (a === 'desel') { select([]); mode = null; }")
rep("(u.team === 1 ? CIV_TITLE[CV(1)] + ' ' : '')", "''")
rep("<div class=\"p-name\">' + pName(b.kind, b.team) + '</div><div class=\"p-sub\">' + (b.team === 2 ? 'Neutral' : own ?",
    "<div class=\"p-name\">' + (b.town ? TOWNS[b.town].name : pName(b.kind, b.team)) + '</div><div class=\"p-sub\">' + (b.town ? 'Town hall' : b.team === 2 ? 'Neutral' : b.team === 1 ? 'Enemy \\u00b7 ' + civRole(b.kind, b.team) : own ?")
rep("const d = BD[k]; if (!civOk(d, 0) || ECO_BLD.has(k)", "const d = BD[k]; if (!civOk(d, 0) || !ageOk(d, G.age[0]) || ECO_BLD.has(k)")

# ---------- music: a Thai pentatonic tune (C D E G A) in place of the Malay asli ----------
rep_between('  const LEAD = [', '  const REBANA = ', '''  const LEAD = [
    76, 74, 72, 74, 76, 0, 79, 76,   74, 0, 72, 69, 72, 74, 0, 0,
    69, 72, 74, 0, 76, 74, 72, 69,   67, 0, 69, 72, 69, 0, 0, 0,
    72, 74, 76, 79, 81, 79, 76, 74,  76, 74, 72, 69, 72, 0, 0, 0,
    69, 67, 64, 0, 67, 69, 72, 74,   72, 0, 0, 0, 69, 72, 74, 0
  ];
  const FIGHT = [
    76, 79, 81, 79, 76, 74, 76, 0,   72, 74, 76, 74, 72, 69, 67, 0,
    69, 72, 69, 67, 64, 67, 69, 0,   76, 0, 72, 0, 76, 79, 76, 0
  ];
  const ROOTS = [48, 45, 43, 48, 48, 50, 43, 48];
''')

# ---------- boot: the mission boots instead ----------
a = html.index('(function boot() {')
b = html.index('})();', a) + len('})();')
html = html[:a] + 'mrBoot();' + html[b:]
code = read(HERE, 'a1-sim.js') + read(HERE, 'a1-art.js') + read(HERE, 'a1-scenes.js') + read(HERE, 'a1-ui.js')
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
SAVE = ('<script>\nwindow.MSAVE_CFG = { title: \'The Island City\', page: \'campaign/ayutthaya-1/\', id: \'ayu1\', opts: (g) => ({ civs: g.civs }) };\n'
        + read(PF, 'sea-rts-fixes', 'mission-save', 'mission-save.js') + '</script>\n')
rep('</body>\n</html>', SAVE + EXIT + '</body>\n</html>')

open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', os.path.abspath(OUT), len(html), 'bytes')
