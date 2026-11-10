#!/usr/bin/env python3
"""Builds the standalone Melaka mission 1 demo from the main game.

Takes the main game (sea-rts-fixes/index.html), swaps the title and menus, renames the few
functions the mission wraps, and adds the campaign-only art (Singapura, heroes, torches,
Ayutthaya ships) plus the mission code. The main game file is only read, never changed.

    python3 build.py [main-index.html] [out.html]
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PF = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(PF, 'sea-rts-fixes', 'index.html')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, '..', 'index.html')

html = open(SRC, encoding='utf-8').read()
# Singapura is 96x72 like skirmish (Iylia, 2026-11-01): the maps are laid out on 64x48 and scaled by MX/MY in the sim.
if 'const W = 96, H = 72,' not in html: raise SystemExit('main map size line not found')


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
rep('<title>SEA RTS Pixel Game</title>', "<title>The Treasurer's Gate</title>")
html = re.sub(r'<link rel="manifest"[^>]*>\n<link rel="icon"[^>]*>\n<link rel="apple-touch-icon"[^>]*>\n', '', html, count=1)
rep('<meta name="apple-mobile-web-app-title" content="SEA Kingdoms">', '<meta name="apple-mobile-web-app-title" content="Treasurer\'s Gate">')
html = re.sub(r'<script>if\("serviceWorker".*?</script>\n', '', html, count=1, flags=re.S)
rep('</style>\n\n</head>', read(HERE, 'mission.css') + '</style>\n\n</head>')

# ---------- menus ----------
rep('  <div id="ov" hidden>\n    <div class="card" id="ov-pause" hidden>', '  <div id="ov" hidden>\n    ' + read(HERE, 'start-card.html') + '<div class="card" id="ov-pause" hidden>')
rep('''      <div class="row">
        <button class="btn alt" data-do="restart">Restart</button>
        <button class="btn alt" data-do="newmap">New map</button>
      </div>''', '''      <button class="btn alt" data-do="restart">Restart mission</button>
      <p class="lead tipline" id="pause-tip"></p>''')
rep('''      <div class="row">
        <button class="btn" data-do="restart">Again</button>
        <button class="btn alt" data-do="newmap">New map</button>
      </div>''', '''      <button class="btn" data-do="restart">Play again</button>''')
rep('<div class="tag">Battle over</div>', '<div class="tag" id="end-tag">Mission over</div>')
rep_between('    <div class="card" id="ov-help" hidden>', '  </div>\n</div>\n\n<script>', read(HERE, 'help-card.html'))
rep("for (const n of ['pause', 'end', 'help'])", "for (const n of ['start', 'pause', 'end', 'help', 'story'])")

# ---------- sim hooks ----------
rep("    this.diff = opts.diff || 'normal';\n", "    this.diff = opts.diff || 'normal';\n    this.map = opts.map || null; this.carry = opts.carry || null;\n")

# ---------- functions the mission wraps (the originals keep working under a base* name) ----------
for name in ['unitSprite(kind, team, anim, f, tool)', 'buildingSprite(kind, team, level)', 'shipSprite(u)', 'shipAnchor(kind, team)',
             'paintUnit(u)', 'paintBuilding(b)', 'hintText()', 'updateHud()', 'startGame(seed)', 'endGame()',
             'togglePause()', 'bldNote(b)']:
    rep('function ' + name, 'function base' + name[0].upper() + name[1:])

# taller sprites (heroes, torch bearers) stand on the same feet line as normal units
rep("  if (selected || u.hp < u.maxHp || settings.bars === 'always') hpBar(px - 8, py - 6 - spr.height, 16, u.hp / u.maxHp);\n}",
    "  if ((selected || u.hp < u.maxHp || settings.bars === 'always') && !UD[u.kind].hero) hpBar(px - 8, py - 6 - spr.height, 16, u.hp / u.maxHp);\n}")
rep("let lvl = 2; if (flat)", "let lvl = b.kind === 'wall' ? (b.mask || 0) : b.kind === 'gate' ? (b.open ? 1 : 0) + (b.postern ? 2 : 0) : 2; if (flat)")
rep("  paintPlacement(); paintMarkers();\n", "  paintMission(); paintPlacement(); paintMarkers();\n")

# touch taps: villagers on a damaged building repair it; land units on an Orang Laut boat board it
rep("if (hit && hit.isUnit && hit.team === 0 && !(UD[hit.kind].troops && us.some(u => u.layer === 0))) { select([hit]); return; }\n    const hasVil",
    "if (hit && hit.isUnit && hit.team === 0 && !canBoard(hit, us)) { select([hit]); return; }\n    const hasVil")
rep("!(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse'))", "!(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse' || hit.hp < hit.maxHp))")

# panel: the player's civ changes mid-mission, and there is no Town Centre at first
rep('''bldIcon('towncentre', 0) + '"><div><div class="p-name">' + CIV_REALM[CV(0)] + '</div><div class="p-sub">Your settlement</div>''',
    '''bldIcon(homeKind(), 0) + '"><div><div class="p-name">' + civTitle() + '</div><div class="p-sub">' + civSub() + '</div>''')
rep("cmdBtn('tc', 'tc', bldIcon('towncentre', 0), 'Town', null, 'Jump to your Town Centre')",
    "cmdBtn('tc', 'tc', bldIcon(homeKind(), 0), 'Home', null, 'Jump to your palace or Town Centre')")
rep("(b.team === 2 ? 'Neutral' : own ? civRole(b.kind, b.team) + ' \\u00b7 tap for more' : CIV_TITLE[CV(b.team)] + ' \\u00b7 ' + civRole(b.kind, b.team))", "(own ? civTitle() : b.team === 2 ? 'Neutral' : 'Majapahit')")
rep("    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"", "    cmds += missionBldCmds(b);\n    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"")
rep("  else if (a === 'desel') { select([]); mode = null; }", "  else if (a === 'gate') toggleGate(sel[0]);\n  else if (a === 'proclaim') doProclaim(sel[0]);\n  else if (a === 'desel') { select([]); mode = null; }")
rep("G.buildings.find(b => b.team === 0 && b.kind === 'towncentre')", "homeBuilding()", count=3)
rep("(u.team === 1 ? CIV_TITLE[CV(1)] + ' ' : '')", "(u.team === 1 ? 'Majapahit ' : u.team === 2 && UD[u.kind].ayu ? 'Ayutthaya ' : '')")
rep("  else if (a === 'start') startGame(seedUsed);", "  else if (a === 'start') { chapter = 1; startGame(seedUsed); }")
rep("  else if (a === 'restart') startGame(seedUsed);", "  else if (a === 'restart') startChapter(chapter);")
rep("else if (a === 'newmap') startGame(1 + Math.floor(Math.random() * 900000));", "")


# ---------- playtest round 1: camera can reach the map edges past the HUD, zoom out further ----------
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

# ---------- boot: the mission boots instead ----------
a = html.index('(function boot() {')
b = html.index('})();', a) + len('})();')
html = html[:a] + 'missionBoot();' + html[b:]

# ---------- campaign art + mission code, before the boot call ----------
art = (scoped('AUX', ['unit-art/aux-civs.js'], ['auxUnitSprite', 'auxShipSprite', 'AUXC']) +
       scoped('HEROART', ['lore/scenes/heroes-art.js'], ['heroSprite', 'HEROES_DEF']) +
       scoped('SIEGE', ['unit-art/siege.js'], ['torchSprite', 'flamePx']) +
       scoped('MAINLAND', ['unit-art/ships.js', 'unit-art/civs-ayutthaya-daiviet.js', 'unit-art/civs-khmer.js', 'unit-art/ships-mainland.js'], ['mainlandShip']))
code = art + read(PF, 'sea-rts-fixes', 'demo-compat', 'demo-compat.js') + read(HERE, 'mission-sim.js') + read(HERE, 'mission-art.js') + read(HERE, 'mission-scenes.js') + read(HERE, 'mission-audio.js') + read(HERE, 'mission-ui.js')
html = html.replace('missionBoot();', code + '\ndemoNames(0); demoAge(2); demoMaps("temasek", "bertam");\nmissionBoot();', 1)

import base64
png = open(os.path.join(PF, 'lore', 'scenes', 'portrait-parameswara.png'), 'rb').read()
html = html.replace('__PORTRAIT_PARAMESWARA__', 'data:image/png;base64,' + base64.b64encode(png).decode(), 1)

# ---------- campaign props and ambient life on Singapura (sea-rts-fixes/campaign-dress) ----------
DRESS_ITEMS_JS = read(PF, 'sea-rts-fixes', 'campaign-dress', 'singapura-items.js')
exec(open(os.path.join(PF, 'sea-rts-fixes', 'campaign-dress', 'dress_patch.py'), encoding='utf-8').read())
# Singapura's unique building and unit: Bukit Larangan on its hill, the Orang Laut crew (sea-rts-fixes/singapura)
exec(open(os.path.join(PF, 'sea-rts-fixes', 'singapura', 'sg_patch.py'), encoding='utf-8').read())

open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', os.path.abspath(OUT), len(html), 'bytes')
