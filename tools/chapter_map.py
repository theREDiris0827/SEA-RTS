#!/usr/bin/env python3
"""Write CHAPTERS.md: every chapter of index.html, its lines, what it does, what to tweak, and its functions.

Reads the CHAPTER boxes and the // notes above functions straight from index.html, so after any change run:
    python3 tools/chapter_map.py
"""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read().split('\n')
SKIP = {'if', 'for', 'while', 'switch', 'catch', 'constructor', 'draw', 'setTimeout', 'requestAnimationFrame'}

chs = []   # (start line index, title, file, what, tweaks)
for i, l in enumerate(L):
    m = re.match(r'^\s*/\* ##### CHAPTER (.+?) #####', l)
    if not m: continue
    j, box = i + 1, []
    while not L[j].strip().startswith('####'): box.append(L[j].strip()); j += 1
    f = box[0].replace('File: ', '')
    what, tweaks, mode = [], [], 'what'
    for b in box[1:]:
        if b.startswith('Things you can tweak'): mode = 'tw'; continue
        if mode == 'what': what.append(b.replace('What it does: ', ''))
        elif b.startswith('- '): tweaks.append(b[2:])
        else: tweaks[-1] += ' ' + b
    chs.append((i, m.group(1), f, ' '.join(what), tweaks))
end = next(i for i in range(chs[-1][0], len(L)) if L[i].startswith('</script>'))

def anchor(t): return re.sub(r'[^a-z0-9 -]', '', t.lower()).replace(' ', '-')

out = ['# Chapter map', '',
       'Every chapter of the game: where it sits in `index.html`, what it does, the numbers that are safe to tweak, '
       'and every function in it with a one-line note. Made by `python3 tools/chapter_map.py`.', '',
       '**How to use it:** find the chapter, open its file in `src/` (or jump to the line in `index.html`) and look for the '
       '`CHAPTER` box at the top. Functions have a `//` note just above them.', '',
       '**After changing a number:** if you edited `index.html`, run `python3 tools/build.py split`. If you edited a file in '
       '`src/`, run `python3 tools/build.py`. Then open `index.html` in a browser to test.', '',
       '| Chapter | File | Lines in index.html |', '|---|---|---|']
for k, (s, t, f, w, tw) in enumerate(chs):
    e = chs[k + 1][0] if k + 1 < len(chs) else end
    out.append('| [%s](#%s) | `%s` | %d to %d |' % (t, anchor(t), f, s + 1, e))
out += ['| Styles | `src/css/game.css` | inside `<style>` |', '| Page layout (menus, HUD) | `src/index.html` | outside the script and styles |']
for k, (s, t, f, w, tw) in enumerate(chs):
    e = chs[k + 1][0] if k + 1 < len(chs) else end
    out += ['', '## ' + t, '', '`%s` · lines %d to %d' % (f, s + 1, e), '', w, '']
    if tw: out += ['**Things you can tweak**', ''] + ['- ' + x for x in tw] + ['']
    fn = []
    for i in range(s, e):
        l = L[i]
        m = re.match(r'^(\s*)function (\w+)\s*\(|^  (\w+)\(.*\)\s*\{', l)
        if not m: continue
        name = m.group(2) or m.group(3)
        if name in SKIP or (m.group(1) and len(m.group(1)) > 2): continue
        prev, note = L[i - 1].strip(), ''
        if prev.startswith('//'): note = prev[2:].strip()
        elif prev.endswith('*/'):
            j = i - 1
            while j > 0 and '/*' not in L[j]: j -= 1
            note = ' '.join(x.strip() for x in L[j:i]).replace('/*', '').replace('*/', '').strip()
        elif '//' in l[l.find('{'):]: note = l[l.find('//', l.find('{')) + 2:].strip()
        if note.startswith('#####'): note = ''
        if len(note) > 160: note = note[:157].rsplit(' ', 1)[0] + '...'
        fn.append('| `%s` | %d | %s |' % (name, i + 1, note.replace('|', '/')))
    if fn: out += ['**Functions**', '', '| Name | Line | What it does |', '|---|---|---|'] + fn
open(os.path.join(ROOT, 'CHAPTERS.md'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('wrote CHAPTERS.md:', len(chs), 'chapters')
