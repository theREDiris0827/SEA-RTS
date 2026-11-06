#!/usr/bin/env python3
"""Builds the standalone Khmer defence demo ("The Gates of Angkor") from the main game.

Takes the main game (sea-rts-fixes/index.html), swaps the title and menus, renames the few
functions the demo wraps, and adds the Ayutthaya and Khmer art plus the demo code. The main game
file is only read, never changed. Same approach as ayutthaya-demo/src/build.py.

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
    if os.environ.get('SOFT') and (start not in html or end not in html[html.find(start):]): print('MISS-BETWEEN', repr(start[:60]), repr(end[:60])); return
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
rep('<title>SEA RTS Pixel Game</title>', '<title>The Gates of Angkor</title>')
html = re.sub(r'<link rel="manifest"[^>]*>\n<link rel="icon"[^>]*>\n<link rel="apple-touch-icon"[^>]*>\n', '', html, count=1)
rep('<meta name="apple-mobile-web-app-title" content="SEA Kingdoms">', '<meta name="apple-mobile-web-app-title" content="Gates of Angkor">')
html = re.sub(r'<script>if\("serviceWorker".*?</script>\n', '', html, count=1, flags=re.S)
rep('</style>\n\n</head>', read(HERE, 'km.css') + '</style>\n\n</head>')

# ---------- menus ----------
rep('  <div id="ov" hidden>\n    <div class="card" id="ov-pause" hidden>', '  <div id="ov" hidden>\n    ' + read(HERE, 'start-card.html') + '<div class="card" id="ov-pause" hidden>')
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
             'togglePause()', 'bldNote(b)', 'describeOrder(u)', 'tryPlace(keep)']:
    rep('function ' + name, 'function base' + name[0].upper() + name[1:])

# sprites of any size (horsemen, cannon) stand centred on the same feet line as normal units
rep("  if (selected || u.hp < u.maxHp || settings.bars === 'always') hpBar(px - 8, py - 6 - spr.height, 16, u.hp / u.maxHp);\n}",
    '  if ((selected || u.hp < u.maxHp) && !UD[u.kind].hero) hpBar(px - 8, py - 6 - spr.height, 16, u.hp / u.maxHp);\n}')
# walls join up with their neighbours, gates show open or shut
rep("let lvl = 2; if (flat)", "let lvl = (b.kind === 'wall' || b.kind === 'kwall') ? (b.mask || 0) : b.kind === 'gate' ? (b.open ? 1 : 0) : 2; if (flat)")
rep("  paintPlacement(); paintMarkers();\n", "  paintMission(); paintPlacement(); paintMarkers();\n")
# touch taps: villagers on a damaged building repair it
rep("!(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse'))", "!(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse' || hit.hp < hit.maxHp))")

# panel: Ayutthaya names, the royal camp, an Elephants button
rep('''bldIcon('towncentre', 0) + '"><div><div class="p-name">' + CIV_REALM[CV(0)] + '</div><div class="p-sub">Your settlement</div>''',
    '''bldIcon('towncentre', 0) + '"><div><div class="p-name">Khmer</div><div class="p-sub">Kingdom Age · Srok</div>''')
rep("cmdBtn('tc', 'tc', bldIcon('towncentre', 0), 'Town', null, 'Jump to your Town Centre')",
    "cmdBtn('tc', 'tc', bldIcon('towncentre', 0), 'Court', null, 'Jump to the royal compound')")
rep("+ cmdBtn('navy', 'navy', unitIcon('light', 0), 'Navy', null, 'Select all warships')",
    "+ cmdBtn('navy', 'navy', unitIcon('canoe', 0), 'Canoes', null, 'Select all war canoes') + cmdBtn('elephants', 'elephants', unitIcon('cart', 0), 'Ballistae', null, 'Select all ballistae')")
rep("(b.team === 2 ? 'Neutral' : own ? (BRIEF[b.kind] || civRole(b.kind, b.team)) : CIV_TITLE[CV(b.team)] + ' \\u00b7 ' + civRole(b.kind, b.team))", "(own ? 'Khmer' : b.team === 2 ? 'Temple' : 'Ayutthaya')")
rep("    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"", "    cmds += kmBldCmds(b);\n    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"")
rep("    cmds += '<button class=\"cmd\" data-a=\"stop\" title=\"Stop (S)\">", "    cmds += kmUnitCmds(us);\n    cmds += '<button class=\"cmd\" data-a=\"stop\" title=\"Stop (S)\">")
rep("  else if (a === 'desel') { select([]); mode = null; }",
    "  else if (kmPanelAction(a, el)) { /* handled */ }\n  else if (a === 'desel') { select([]); mode = null; }")
rep("(u.team === 1 ? CIV_TITLE[CV(1)] + ' ' : '')", "(u.team === 1 ? 'Ayutthaya ' : '')")
rep("const hasVil = us.some(u => u.cls === 'vil'), hasMil = us.some(u => u.cls !== 'vil' && u.cls !== 'boat');",
    "const hasVil = us.some(u => u.cls === 'vil'), hasMil = us.some(u => u.cls !== 'vil' && u.cls !== 'boat' && u.cls !== 'healer' && u.cls !== 'load');")
rep("k += '|' + (mode ? mode.kind + (mode.bkind || '') : '') + '|' + formation + '|' + us.some(u => u.cls === 'vil');",
    "k += '|' + (mode ? mode.kind + (mode.bkind || '') : '') + '|' + formation + '|' + us.some(u => u.cls === 'vil') + '|' + kmPanelKey(us);")
rep("  else if (a === 'start') startGame(seedUsed);", "  else if (a === 'start') startGame(seedUsed);\n  else if (a === 'skipto') skipTo(el.dataset.v);")
rep("else if (a === 'newmap') startGame(1 + Math.floor(Math.random() * 900000));", "")

# selecting the army leaves the loads alone; a load or barge says what it is doing
rep("const l = G.units.filter(u => u.team === 0 && u.hp > 0 && u.cls !== 'vil' && u.layer !== 1);", "const l = G.units.filter(u => u.team === 0 && u.hp > 0 && u.cls !== 'vil' && u.cls !== 'load' && u.layer !== 1);")
rep("u.cls === 'boat' ? 'Tap a school of fish.'", "u.cls === 'load' ? 'Walks to the landing by itself. You can move it to dodge danger.' : UD[u.kind].barge ? (u.cargo ? 'Rowing for the end of the lake.' : 'Waits at the landing for a load.') : u.cls === 'boat' ? 'Tap a school of fish.'")

# ---------- camera can reach the map edges past the HUD, zoom out further (from the Melaka demo playtest) ----------
# zoom-out limit now comes from the main game (0.38, same in every mode)

# selection: tap a selected unit again to deselect it; double-tap empty ground to deselect the group
rep("""  lastTap = { id: hit ? hit.id : 0, t: now };
  if (mode && mode.kind === 'amove')""", """  if (o.touch && hit && sel.length === 1 && sel[0] === hit && !mode) { select([]); lastTap = { id: hit.id, t: now }; return; }
  lastTap = { id: hit ? hit.id : 0, t: now };
  if (mode && mode.kind === 'amove')""")
rep("""    if (hit && hit.isBld && hit.team === 0 && !trading && !(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse' || hit.hp < hit.maxHp))) { select([hit]); return; }
    issue(wx, wy, hit); return;""", """    if (hit && hit.isBld && hit.team === 0 && !trading && !(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse' || hit.hp < hit.maxHp))) { select([hit]); return; }
    if (!hit && groundTap && now - groundTap.t < 380 && Math.hypot(wx - groundTap.wx, wy - groundTap.wy) < 1.5) { groundTap = null; select([]); return; }
    groundTap = hit ? null : { t: now, wx, wy };
    issue(wx, wy, hit); return;""")
rep("let rallyTap = null;", "let rallyTap = null, groundTap = null;")

# ---------- boot: the demo boots instead ----------
a = html.index('(function boot() {')
b = html.index('})();', a) + len('})();')
html = html[:a] + 'kmBoot();' + html[b:]

# ---------- art + demo code, before the boot call ----------
art = (scoped('MAIN', ['unit-art/buildings-melaka.js', 'unit-art/buildings-majapahit.js', 'unit-art/ships.js',
                       'unit-art/civs-ayutthaya-daiviet.js', 'unit-art/civs-khmer.js', 'unit-art/ships-mainland.js',
                       'unit-art/buildings-mainland.js'],
              ['civUnitSprite', 'elephantSprite', 'khmerUnitSprite', 'ballistaElephantSprite', 'khmerCanoeSprite', 'mainlandShip', 'mainlandBuilding', 'mainlandBase', 'CIVC', 'KHC']) +
       scoped('HEAL', ['unit-art/buildings-melaka.js', 'unit-art/buildings-majapahit.js', 'unit-art/healers.js'], ['healerSprite']) +
       scoped('SIEGE', ['unit-art/siege.js'], ['fireArrowSprite', 'flamePx']) +
       scoped('XB', ['lore/scenes/bld-extra.js'], ['storehouse']) +
       scoped('AYB', ['lore/scenes/bld-ayutthaya.js'], ['ayBuilding', 'AYC']) +
       scoped('KMB', ['lore/scenes/bld-khmer.js'], ['kmBuilding', 'kmLaterite', 'kmCoping', 'KMC', 'KM_LAT', 'KM_LAT_D', 'KM_LAT_L', 'KM_SAND', 'KM_SAND_D', 'KM_SAND_L']))
code = art + read(PF, 'sea-rts-fixes', 'demo-compat', 'demo-compat.js') + read(HERE, 'km-sim.js') + read(HERE, 'km-art.js') + read(HERE, 'km-scenes.js') + read(HERE, 'km-audio.js') + read(HERE, 'km-ui.js')
html = html.replace('kmBoot();', code + '\ndemoNames(0); demoAge(2); Game.prototype.fireOn = function () {};\nkmBoot();', 1)

open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', os.path.abspath(OUT), len(html), 'bytes')
