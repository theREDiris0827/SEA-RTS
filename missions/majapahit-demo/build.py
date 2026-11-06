#!/usr/bin/env python3
"""Builds the standalone Majapahit naval demo ("The Treasurer's Gate", 1398) from the main game.

Takes the main game (sea-rts-fixes/index.html), swaps the title and menus, renames the few
functions the demo wraps, and adds the Singapura, Ayutthaya and Orang Laut art plus the demo code. The main game
file is only read, never changed. Same approach as daiviet-demo/src/build.py.

    python3 build.py [main-index.html] [out.html]
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PF = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(PF, 'sea-rts-fixes', 'index.html')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, '..', 'index.html')

html = open(SRC, encoding='utf-8').read()
# Singapura is 96x72 like skirmish (Iylia, 2026-11-01): the map is laid out on 64x48 and scaled by MX/MY/sy in mj-sim.js.
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
rep('<title>SEA RTS Pixel Game</title>', "<title>Majapahit Treasurer's Gate</title>")
html = re.sub(r'<link rel="manifest"[^>]*>\n<link rel="icon"[^>]*>\n<link rel="apple-touch-icon"[^>]*>\n', '', html, count=1)
rep('<meta name="apple-mobile-web-app-title" content="SEA Kingdoms">', '<meta name="apple-mobile-web-app-title" content="Treasurer\'s Gate">')
html = re.sub(r'<script>if\("serviceWorker".*?</script>\n', '', html, count=1, flags=re.S)
rep('</style>\n\n</head>', read(HERE, 'mj.css') + '</style>\n\n</head>')

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


# ---------- sim: the player (team 0) is Majapahit here (CIVMAP [1, 0], set in populate) ----------
# a disguised messenger is just another trader to every enemy, and to the towers
rep("""      if (o.hp <= 0 || o.team === team || o.team === 2) return;
      if (o.layer === 1 && !u.ranged && !sea) return;""", """      if (o.hp <= 0 || o.team === team || o.team === 2 || (o.disguise && team !== 0)) return;
      if (o.layer === 1 && !u.ranged && !sea) return;""")
rep("""          if (o.hp <= 0 || o.team === b.team || o.team === 2) return;
          const dd = rectDist(o.x, o.y, b.rect);""", """          if (o.hp <= 0 || o.team === b.team || o.team === 2 || (o.disguise && b.team !== 0)) return;
          const dd = rectDist(o.x, o.y, b.rect);""")
rep("if (tgt.team === 0 && att.team === 1 && this.t - this.lastAlert > 5)", "if (tgt.team === 0 && att.team !== 0 && this.t - this.lastAlert > 5)")
rep("if (t.team === 1 && att && att.team === 0) this.stats.kills++;", "if (t.team !== 0 && t.team !== 2 && att && att.team === 0) this.stats.kills++;")
# drops: the Orang Laut add a fifth to wood; the fleet drops everything at its Lumbung
rep("const amt = u.carry.amt, type = u.carry.type;", "const type = u.carry.type, amt = Math.round(u.carry.amt * this.dropMul(u.team, type));")
rep("this.msg(u.cls === 'boat' ? 'Build a Trading Port on the shore to unload fish.' : (o.type === 'food' ? 'Build a Granary' : 'Build a Storehouse') + ' or use the Town Centre.');",
    "this.msg(u.cls === 'boat' ? 'Build a Dermaga (jetty) on Batam\\'s shore to unload fish.' : 'Build a Lumbung (supply hut) on Batam to drop what they carry.');")
# minimap: every side but yours stays hidden in the fog (colours come from MINIC, set in mj-art.js)
rep("if (u.team === 2) continue; if (u.team === 1 && !G.isVisible(u.x, u.y)) continue;", "if (u.team === 2) continue; if (u.team !== 0 && !G.isVisible(u.x, u.y)) continue;")

# ---------- functions the demo wraps (the originals keep working under a base* name) ----------
for name in ['unitSprite(kind, team, anim, f, tool)', 'buildingSprite(kind, team, level)', 'shipSprite(u)', 'shipAnchor(kind, team)',
             'paintUnit(u)', 'paintBuilding(b)', 'hintText()', 'updateHud()', 'startGame(seed)', 'endGame()',
             'togglePause()', 'bldNote(b)', 'describeOrder(u)', 'tryPlace(keep)']:
    rep('function ' + name, 'function base' + name[0].upper() + name[1:])

# sprites of any size (horsemen, cannon) stand centred on the same feet line as normal units
rep("  if (selected || u.hp < u.maxHp || settings.bars === 'always') hpBar(px - 8, py - 6 - spr.height, 16, u.hp / u.maxHp);\n}",
    '  if ((selected || u.hp < u.maxHp) && !UD[u.kind].hero) hpBar(px - 8, py - 6 - spr.height, 16, u.hp / u.maxHp);\n}')
# walls join up with their neighbours, gates show open or shut
rep("let lvl = 2; if (flat)", "let lvl = (b.kind === 'wall' || b.kind === 'cwall') ? (b.mask || 0) : b.kind === 'gate' ? (b.open ? 1 : 0) : 2; if (flat)")
rep("  paintPlacement(); paintMarkers();\n", "  paintMission(); paintPlacement(); paintMarkers();\n")
# touch taps: land units tapped onto one of your boats climb aboard; villagers on a damaged building repair it
rep("if (hit && hit.isUnit && hit.team === 0 && !(UD[hit.kind].troops && us.some(u => u.layer === 0))) { select([hit]); return; }\n    const hasVil",
    "if (hit && hit.isUnit && hit.team === 0 && !(hit.cargo && UD[hit.kind].cap && us.some(u => u.layer === 0))) { select([hit]); return; }\n    const hasVil")
rep("!(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse'))", "!(hasVil && (!hit.done || FIELD[hit.kind] || hit.kind === 'rafthouse' || hit.hp < hit.maxHp))")

# panel: Majapahit names; the Jong Raya instead of a Town Centre
rep('''bldIcon('towncentre', 0) + '"><div><div class="p-name">' + CIV_REALM[CV(0)] + '</div><div class="p-sub">Your settlement</div>''',
    '''unitIcon('flagship', 0) + '"><div><div class="p-name">The Majapahit fleet</div><div class="p-sub">Off Singapura, 1398</div>''')
rep("cmdBtn('tc', 'tc', bldIcon('towncentre', 0), 'Town', null, 'Jump to your Town Centre')",
    "cmdBtn('tc', 'tc', unitIcon('flagship', 0), 'Jong', null, 'Select the Jong Raya to launch boats (H)')")
rep("G.buildings.find(b => b.team === 0 && b.kind === 'towncentre')", "mjHome()", count=3)
rep("(b.team === 2 ? 'Neutral' : own ? (BRIEF[b.kind] || civRole(b.kind, b.team)) : CIV_TITLE[CV(b.team)] + ' \\u00b7 ' + civRole(b.kind, b.team))", "(own ? 'Majapahit' : b.team === 2 ? (b.ol ? 'Orang Laut' : 'Neutral') : b.team === 3 ? 'Ayutthaya' : b.ol ? 'Orang Laut, for Singapura' : 'Singapura')")
rep("    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"", "    cmds += mjBldCmds(b);\n    if (own) cmds += '<button class=\"cmd\" data-a=\"desel\"")
rep("    cmds += '<button class=\"cmd\" data-a=\"stop\" title=\"Stop (S)\">", "    cmds += mjUnitCmds(us);\n    cmds += '<button class=\"cmd\" data-a=\"stop\" title=\"Stop (S)\">")
rep("  else if (a === 'desel') { select([]); mode = null; }",
    "  else if (mjPanelAction(a, el)) { /* handled */ }\n  else if (a === 'desel') { select([]); mode = null; }")
rep("(u.team === 1 ? CIV_TITLE[CV(1)] + ' ' : '')", "(u.team === 1 && !u.ol ? 'Singapura ' : '')")
rep("const hasVil = us.some(u => u.cls === 'vil'), hasMil = us.some(u => u.cls !== 'vil' && u.cls !== 'boat');",
    "const hasVil = us.some(u => u.cls === 'vil'), hasMil = us.some(u => u.cls !== 'vil' && u.cls !== 'boat' && u.cls !== 'healer');")
rep("k += '|' + (mode ? mode.kind + (mode.bkind || '') : '') + '|' + formation + '|' + us.some(u => u.cls === 'vil');",
    "k += '|' + (mode ? mode.kind + (mode.bkind || '') : '') + '|' + formation + '|' + us.some(u => u.cls === 'vil') + '|' + mjPanelKey(us);")
rep("  else if (a === 'start') startGame(seedUsed);", "  else if (a === 'start') startGame(seedUsed);\n  else if (a === 'skipto') skipTo(el.dataset.v);")
rep("else if (a === 'newmap') startGame(1 + Math.floor(Math.random() * 900000));", "")

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
html = html[:a] + 'mjBoot();' + html[b:]

# ---------- art + demo code, before the boot call ----------
art = (scoped('MAIN', ['unit-art/buildings-melaka.js', 'unit-art/buildings-majapahit.js', 'unit-art/ships.js',
                       'unit-art/civs-ayutthaya-daiviet.js', 'unit-art/civs-khmer.js', 'unit-art/ships-mainland.js'],
              ['civUnitSprite', 'elephantSprite', 'mainlandShip', 'CIVC']) +
       scoped('AUX', ['unit-art/aux-civs.js'], ['auxUnitSprite', 'auxShipSprite', 'AUXC']) +
       scoped('SIEGE', ['unit-art/siege.js'], ['torchSprite', 'fireArrowSprite', 'flamePx']))
code = art + read(PF, 'sea-rts-fixes', 'demo-compat', 'demo-compat.js') + read(HERE, 'mj-sim.js') + read(HERE, 'mj-art.js') + read(HERE, 'mj-scenes.js') + read(HERE, 'mj-audio.js') + read(HERE, 'mj-ui.js')
html = html.replace('mjBoot();', code + '\ndemoNames(1); demoAge(2); Game.prototype.fireOn = function () {};\nmjBoot();', 1)

# ---------- campaign props and ambient life on Singapura (sea-rts-fixes/campaign-dress) ----------
DRESS_ITEMS_JS = read(PF, 'sea-rts-fixes', 'campaign-dress', 'singapura-items.js')
exec(open(os.path.join(PF, 'sea-rts-fixes', 'campaign-dress', 'dress_patch.py'), encoding='utf-8').read())
# Singapura's unique building and unit: Bukit Larangan on its hill, the Orang Laut crew (sea-rts-fixes/singapura)
exec(open(os.path.join(PF, 'sea-rts-fixes', 'singapura', 'sg_patch.py'), encoding='utf-8').read())

open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', os.path.abspath(OUT), len(html), 'bytes')
