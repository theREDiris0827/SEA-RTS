# Campaign props (and, with DRESS_LIFE = True, ambient people and animals) for a mission page. Run from a page's build.py, just before it writes the page:
#     DRESS_ITEMS_JS = '[...]'   (optional: hand-placed items for this map, see dress.js)
#     exec(open(os.path.join(PF, 'sea-rts-fixes', 'campaign-dress', 'dress_patch.py'), encoding='utf-8').read())
# Needs the build script's html, PF and read(). Adds PROPSET (the art book's props.js + mobs.js), dress.js,
# and a call from render() just before buildings and units are drawn.
_ART = os.path.join(PF, 'unit-art', 'campaign-props', 'src')
_items = globals().get('DRESS_ITEMS_JS') or '[]'
_js = ('<script>\n/* ===== art book: campaign props and ambient life (unit-art/campaign-props/src) ===== */\nconst PROPSET = (function () {\n'
       + read(_ART, 'props.js') + (read(_ART, 'mobs.js') if globals().get('DRESS_LIFE') else 'const MOBS = [], mobSprite = null;\n')
       + '\nreturn { PROPS, MOBS, propSprite, mobSprite };\n})();\n'
       + 'const DRESS_ITEMS = ' + _items + ';\n'
       + read(PF, 'sea-rts-fixes', 'campaign-dress', 'dress.js') + '</script>\n')
_hook = '  const tall = [];\n  const expl = (x, y) =>'
if html.count(_hook) != 1: raise SystemExit('dress: render hook not found once')
html = html.replace(_hook, "  if (typeof campaignDress === 'function') campaignDress(x0, x1, y0, y1);\n" + _hook)
_i = html.rindex('</body>')
html = html[:_i] + _js + html[_i:]
