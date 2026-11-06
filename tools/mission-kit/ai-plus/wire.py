#!/usr/bin/env python3
"""Puts ai-plus.js into the main game after the animal pack. Re-run safe.  python3 wire.py <index.html>"""
import sys, os
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
pack = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ai-plus.js'), encoding='utf-8').read().rstrip() + '\n'
a = s.find('/* ===== ai plus')
if a >= 0:
    e = s.index('/* ===== end ai plus ===== */', a) + len('/* ===== end ai plus ===== */\n'); s = s[:a] + pack + s[e:]
else:
    k = '/* ===== end animal pack ===== */\n'; assert s.count(k) == 1; s = s.replace(k, k + pack)
open(p, 'w', encoding='utf-8').write(s); print('wired', p)
