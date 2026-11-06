#!/usr/bin/env python3
"""Puts animals/pack.js into the main game, right after the maps block. Re-run safe.
   python3 wire.py <index.html>"""
import sys, os, re
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
pack = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pack.js'), encoding='utf-8').read().rstrip() + '\n'
start = s.find('/* ===== animal pack ')
if start >= 0:
    end = s.index('/* ===== end animal pack ===== */', start) + len('/* ===== end animal pack ===== */\n')
    s = s[:start] + pack + s[end:]
else:
    k = '/* ===== end maps ===== */\n'
    assert s.count(k) == 1
    s = s.replace(k, k + pack)
open(p, 'w', encoding='utf-8').write(s); print('wired', p)
