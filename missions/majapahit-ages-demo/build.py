#!/usr/bin/env python3
"""Builds the standalone Majapahit raids-and-ages demo ("Rise of Majapahit") from the main game.

Takes the main game (sea-rts-fixes/index.html), swaps the title and menus, renames the few
functions the demo wraps, and adds the age art, heroes and Siamese art plus the demo code. The main game
file is only read, never changed. Same approach as melaka-m1-demo/src/build.py.

    python3 build.py [main-index.html] [out.html]
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PF = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(PF, 'sea-rts-fixes', 'index.html')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, '..', 'index.html')

html = open(SRC, encoding='utf-8').read()
# demo maps are laid out on 64x48; the main game's skirmish maps are 96x72 since 2026-10-31
html = html.replace('const W = 96, H = 72,', 'const W = 64, H = 48,').replace('<canvas id="mini" width="192" height="144">', '<canvas id="mini" width="128" height="96">')


def rep(old, new, count=1):
    global html
    n = html.count(old)
    if n != count:
        if os.environ.get('SOFT'): print('MISS', n, repr(old[:110])); return
        raise SystemExit('patch expected %d match(es), found %d: %r' % (count, n, old[:90]))
    html = html.replace(old, new)


def rep_between(start, end, new):
    """replace everything from `start` up to (not including) `end`"""
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


# ---------- the main game's own sounds: the demo brings its own SFX, music and hooks ----------
if '/* ------------------------------ sound ------------------------------ */' in html:
    rep_between('/* ------------------------------ sound ------------------------------ */', 'function endGame() {', '')
    rep("SFX.apply();", "SFX.apply && SFX.apply();")

# ---------- page head: a standalone page, no PWA bits ----------
rep('<title>SEA RTS Pixel Game</title>', '<title>Rise of Majapahit</title>')
html = re.sub(r'<link rel="manifest"[^>]*>\n<link rel="icon"[^>]*>\n<link rel="apple-touch-icon"[^>]*>\n', '', html, count=1)
rep('<meta name="apple-mobile-web-app-title" content="SEA Kingdoms">', '<meta name="apple-mobile-web-app-title" content="Rise of Majapahit">')
html = re.sub(r'<script>if\("serviceWorker".*?</script>\n', '', html, count=1, flags=re.S)
rep('</style>\n\n</head>', read(HERE, 'mp.css') + '</style>\n\n</head>')

# ---------- menus ----------
rep('  <div id="ov" hidden>\n    <div class="card" id="ov-pause" hidden>', '  <div id="ov" hidden>\n    ' + read(HERE, 'start-card.html') + '<div class="card" id="ov-pause" hidden>')
# a demo has no main menu and never touches the main game's saved game (same site, same storage)
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

# ---------- functions the demo wraps (the originals keep working under a base* name) ----------
for name in ['unitSprite(kind, team, anim, f, tool)', 'buildingSprite(kind, team, level)', 'shipSprite(u)', 'shipAnchor(kind, team)',
             'paintUnit(u)', 'paintBuilding(b)', 'hintText()', 'updateHud()', 'startGame(seed)', 'endGame()',
             'togglePause()', 'bldNote(b)', 'describeOrder(u)']:
    rep('function ' + name, 'function base' + name[0].upper() + name[1:])

# sprites of any size (horsemen, cannon) stand centred on the same feet line as normal units
rep("  if (selected || u.hp < u.maxHp || settings.bars === 'always') hpBar(px - 8, py - 6 - spr.height, 16, u.hp / u.maxHp);\n}",
    "  if ((selected || u.hp < u.maxHp || settings.bars === 'always') && !UD[u.kind].hero) hpBar(px - 8, py - 6 - spr.height, 16, u.hp / u.maxHp);\n}")
rep("  paintPlacement(); paintMarkers();\n", "  paintMission(); paintPlacement(); paintMarkers();\n")
# units hidden in the forest: drawn faded for the player, not at all for the enemy's side
rep("    if (u.team !== 0 && !G.isVisible(u.x, u.y)) continue;\n    tall.push(",
    "    if (u.team !== 0 && !G.isVisible(u.x, u.y)) continue;\n    if (u.team !== 0 && u.hidden) continue;\n    tall.push(")

# touch taps: villagers on a damaged building repair it

# panel: Melaka names and the current age, a call-raid button, the age-up and gate buttons
rep('''<div class="p-sub">Your settlement</div>''', '''<div class="p-sub">' + ageLabel() + '</div>''')
rep("cmdBtn('tc', 'tc', bldIcon('towncentre', 0), 'Town', null, 'Jump to your Town Centre')",
    "cmdBtn('tc', 'tc', bldIcon('towncentre', 0), 'Town', null, 'Jump to your Town Centre')")
rep("+ cmdBtn('navy', 'navy', unitIcon('light', 0), 'Navy', null, 'Select all warships')",
    "+ cmdBtn('navy', 'navy', unitIcon('light', 0), 'Navy', null, 'Select all warships') + (G.M && !G.M.finalOn && !G.M.active ? cmdBtn('callraid', 'callraid', resIcon('amove'), 'Next raid', null, 'Bring the next raid now (bonus gold)') : '')")
rep("    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"", "    cmds += mrBldCmds(b);\n    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"")
rep("    cmds += '<button class=\"cmd\" data-a=\"stop\" title=\"Stop (S)\">", "    cmds += mrUnitCmds(us);\n    cmds += '<button class=\"cmd\" data-a=\"stop\" title=\"Stop (S)\">")
rep("  else if (a === 'desel') { select([]); mode = null; }",
    "  else if (mrPanelAction(a, el)) { /* handled */ }\n  else if (a === 'desel') { select([]); mode = null; }")
rep("(u.team === 1 ? CIV_TITLE[CV(1)] + ' ' : '')", "''")
rep("const hasVil = us.some(u => u.cls === 'vil'), hasMil = us.some(u => u.cls !== 'vil' && u.cls !== 'boat');",
    "const hasVil = us.some(u => u.cls === 'vil'), hasMil = us.some(u => u.cls !== 'vil' && u.cls !== 'boat' && u.cls !== 'healer');")
rep("k += '|' + (mode ? mode.kind + (mode.bkind || '') : '') + '|' + formation + '|' + us.some(u => u.cls === 'vil');",
    "k += '|' + (mode ? mode.kind + (mode.bkind || '') : '') + '|' + formation + '|' + us.some(u => u.cls === 'vil') + '|' + mrPanelKey(us);")
rep("  else if (a === 'start') startGame(seedUsed);", "  else if (a === 'start') startGame(seedUsed);\n  else if (a === 'skipwave') skipTo(el.dataset.v);")
rep("else if (a === 'newmap') startGame(1 + Math.floor(Math.random() * 900000));", "")

# build menu only lists what the current age allows
rep('for (const k of BUILD_ORDER) {', 'for (const k of BUILD_ORDER) { if (!ageOk(BD[k], G.age[0])) continue;')

# ---------- zoom out further (from the Melaka demo playtest); the main game pans past the edges itself ----------
# zoom-out limit now comes from the main game (0.38, same in every mode)

# selection: tap a selected unit again to deselect it; double-tap empty ground to deselect the group
rep("""  lastTap = { id: hit ? hit.id : 0, t: now };
  if (mode && mode.kind === 'amove')""", """  if (o.touch && hit && sel.length === 1 && sel[0] === hit && !mode) { select([]); lastTap = { id: hit.id, t: now }; return; }
  lastTap = { id: hit ? hit.id : 0, t: now };
  if (mode && mode.kind === 'amove')""")
rep("""    if (hit && hit.isBld && hit.team === 0 && !trading && !(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse'))) { select([hit]); return; }
    issue(wx, wy, hit); return;""", """    if (hit && hit.isBld && hit.team === 0 && !trading && !(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse'))) { select([hit]); return; }
    if (!hit && groundTap && now - groundTap.t < 380 && Math.hypot(wx - groundTap.wx, wy - groundTap.wy) < 1.5) { groundTap = null; select([]); return; }
    groundTap = hit ? null : { t: now, wx, wy };
    issue(wx, wy, hit); return;""")
rep("let rallyTap = null;", "let rallyTap = null, groundTap = null;")

# ---------- boot: the demo boots instead ----------
a = html.index('(function boot() {')
b = html.index('})();', a) + len('})();')
html = html[:a] + 'mrBoot();' + html[b:]

# ---------- art + demo code, before the boot call ----------
art = (scoped('MAIN', ['unit-art/buildings-melaka.js', 'unit-art/buildings-majapahit.js', 'unit-art/ships.js',
                       'unit-art/civs-ayutthaya-daiviet.js', 'unit-art/civs-khmer.js', 'unit-art/ships-mainland.js',
                       'unit-art/buildings-mainland.js'],
              ['civUnitSprite', 'elephantSprite', 'mainlandShip', 'CIVC']) +
       scoped('HEROART', ['lore/scenes/heroes-art.js'], ['heroSprite', 'HEROES_DEF']) +
       scoped('MELAGE', ['lore/scenes/melaka-ages-art.js'], ['melAge', 'melGunner', 'melMeriam', 'recolor', 'MAIL', 'MAIL_D']) +
       scoped('XU', ['lore/scenes/units-extra.js'], ['xUnit']) +
       scoped('AUX', ['unit-art/aux-civs.js'], ['auxUnitSprite', 'auxShipSprite', 'AUXC']))
code = art + read(PF, 'sea-rts-fixes', 'demo-compat', 'demo-compat.js') + read(HERE, 'mp-sim.js') + read(HERE, 'mp-art.js') + read(HERE, 'mp-scenes.js') + read(HERE, 'mp-audio.js') + read(HERE, 'mp-ui.js')
html = html.replace('mrBoot();', code + '\ndemoNames(1); demoOwnArmour();\nmrBoot();', 1)

open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', os.path.abspath(OUT), len(html), 'bytes')
