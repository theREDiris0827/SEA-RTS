#!/usr/bin/env python3
"""Adds mission-save.js to built mission and battle pages, just before the Exit to main menu script.
Re-run after rebuilding a page from its src.   python3 inject.py <repo>"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = sys.argv[1] if len(sys.argv) > 1 else '.'
MOD = open(os.path.join(HERE, 'mission-save.js'), encoding='utf-8').read()
CFG = {
    'campaign/melaka-1': "window.MSAVE_CFG = { opts: (g) => g.map === 'bertam' ? { carry: { units: [], boats: 1 } } : {}, extra: () => ({ chapter, missionSave }),\n"
                         "  before: (x, g) => { if (x) { chapter = x.chapter; missionSave = x.missionSave; } setPlayerCiv(g.M && g.M.colourDone ? 'melaka' : 'sg'); } };\n",
}
PAGES = ['campaign/melaka-1', 'daiviet', 'majapahit', 'ayutthaya', 'khmer', 'majapahit-ages', 'melaka-ages']
MARK = '<script>\n/* Exit to main menu'
for page in PAGES:
    p = os.path.join(REPO, page, 'index.html'); s = open(p, encoding='utf-8').read()
    assert s.count(MARK) == 1, page
    if 'window.MSAVE = ' in s:   # replace the earlier copy
        m = s.index(MARK); a = s.rindex('<script>\n', 0, s.rindex('/* Save and continue for a mission', 0, m))
        s = s[:a] + s[m:]
    s = s.replace(MARK, '<script>\n' + CFG.get(page, '') + MOD + '</script>\n' + MARK)
    open(p, 'w', encoding='utf-8').write(s); print('added', page)
