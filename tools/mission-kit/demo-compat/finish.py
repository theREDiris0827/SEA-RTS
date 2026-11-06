#!/usr/bin/env python3
"""Puts a freshly built demo page into the repo with the Exit to main menu script from the page it replaces.
Run inject.py (mission-save) afterwards.   python3 finish.py <built.html> <repo page index.html>"""
import sys
built, dest = sys.argv[1], sys.argv[2]
old = open(dest, encoding='utf-8').read(); new = open(built, encoding='utf-8').read()
m = old.index('<script>\n/* Exit to main menu'); e = old.index('</script>', m) + len('</script>')
assert '/* Exit to main menu' not in new
i = new.rindex('</body>')
new = new[:i] + old[m:e] + '\n' + new[i:]
open(dest, 'w', encoding='utf-8').write(new); print('ok', dest, len(new))
