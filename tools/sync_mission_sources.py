#!/usr/bin/env python3
"""Back up the mission and battle source files into this repo (missions/ and tools/mission-kit/).

The working copies live in the project's shared files (/mnt/project-files); each mission's build.py
reads the main index.html and writes that mission's page. This script only copies text sources
(.py .js .html .css .md) so GitHub keeps a safe copy. Run it before pushing after a mission change:

    python3 tools/sync_mission_sources.py
"""
import os, shutil
PF = '/mnt/project-files'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MISSIONS = {   # repo page -> source folder
    'campaign/melaka-1': 'melaka-m1-demo', 'melaka-ages': 'melaka-ages-demo', 'campaign/melaka-5': 'melaka-m5', 'campaign/melaka-3': 'melaka-m3',
    'majapahit-ages': 'majapahit-ages-demo', 'majapahit': 'majapahit-demo', 'campaign/ayutthaya-1': 'ayutthaya-m1',
    'ayutthaya': 'ayutthaya-demo', 'daiviet': 'daiviet-demo', 'khmer': 'khmer-demo',
}
KIT = ['demo-compat', 'mission-save', 'campaign-dress', 'animals', 'ai-plus', 'maps/newmaps', 'maps/wiring']
EXT = ('.py', '.js', '.html', '.css', '.md')

def copy_tree(src, dst):
    n = 0
    for base, _, files in os.walk(src):
        for f in files:
            if not f.endswith(EXT) or f == 'index.html' and base == src and 'src' not in src: continue
            s = os.path.join(base, f); d = os.path.join(dst, os.path.relpath(s, src))
            os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copy2(s, d); n += 1
    return n

for page, folder in MISSIONS.items():
    print(page, copy_tree(os.path.join(PF, folder, 'src'), os.path.join(ROOT, 'missions', folder)))
for k in KIT:
    print('kit', k, copy_tree(os.path.join(PF, 'sea-rts-fixes', k), os.path.join(ROOT, 'tools', 'mission-kit', k)))
