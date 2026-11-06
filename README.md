# SEA Kingdoms: how the code works

A pixel-art strategy game set in Southeast Asia (Melaka, Majapahit, Ayutthaya and more).
Play it here: https://therediris0827.github.io/SEA-RTS/

## 1. What language?

- **JavaScript** for the game itself: the rules, the drawing and the controls. It reads a lot like C++
  (`if`, `for`, functions, classes) but you don't have to write types, and nothing needs compiling.
- **HTML** for the page: the buttons, panels and menus.
- **CSS** for how the page looks: colours, fonts and sizes.
- **Python** only for small helper scripts like `tools/build.py`. The player never runs these.

## 2. How the code is grouped

The game ships as one file, `index.html`. For reading, the same code is cut into 33 chapters in `src/`.
Every chapter starts with a `CHAPTER` box saying what it does and which numbers are safe to tweak, and
every function has a `//` note above it. **[CHAPTERS.md](CHAPTERS.md)** lists them all with line numbers.

```
src/
  index.html               the page: menus and HUD markup, plus '@@include' lines for the chapters
  css/game.css             all the styling
  js/sim/                  THE RULES (no drawing, so it can be tested without a screen)
    01-core.js               map size, tile types, save helpers, random noise
    02-units-buildings.js    UD = units, BD = buildings, civ names and bonuses   <- most balance tweaks
    03-ages-resources-ai-maps.js   ages, resource amounts, AI difficulty (DIFF), skirmish maps
    04-game-setup.js         starting a game: map, trees, bases, villages, saving
    05-entities-ages.js      adding units, prices, training lists, ageing up
    06-paths-and-searching.js   pathfinding and "what's near me"
    07-orders.js             gather, attack, board, land, town bell, formations
    08-building-training.js  placing buildings and walls, training queues, population
    09-every-tick.js         what buildings and soldiers do each tick, stances, healing, fire
    10-gather-repair-damage.js  gathering, repair, demolish, damage formula, fog, win/lose
    11-enemy-ai.js           what you tapped, and the computer player
  js/art/                  THE LOOK (every sprite is drawn pixel by pixel in code)
    01-core.js .. 10-terrain.js   colours, people, nature, ships, each civ's buildings, age looks, icons, ground
  js/ui/                   THE SCREEN AND CONTROLS
    01-screen-camera-fog.js  camera, zoom limits, fog                              <- zoom and pan
    02-drawing.js            draws the world each frame
    03-selecting.js          selecting and giving orders
    04-touch-mouse-keys.js   touch, pinch, mouse and keys
    05-action-panel.js       the bottom panel
    06-hud-saves.js          top bar, win/lose, saves
    07-menus-encyclopedia.js menus, campaign list, encyclopedia text
    08-sound.js              sound and music, made in code
    09-main-loop.js          starts the game and runs every frame
  js/extras/               ADD-ONS
    01-maps.js               calm map look and the newer skirmish maps
    02-animals-kerbau.js     groves, hunting, kerbau                               <- kerbau numbers
    03-ai-plus.js            AI trade ships and kerbau
```

Think of it like a C++ project: many `.cpp` files that get built into one program.
Here `tools/build.py` glues the pieces into `index.html`:

```
python3 tools/build.py          src/ -> index.html
python3 tools/build.py split    index.html -> src/
python3 tools/build.py check    do they match?
```

After any change to `index.html`, run `python3 tools/build.py split` and `python3 tools/chapter_map.py`
so the chapters and the map stay up to date.

Some key names you'll see everywhere:
- `G`: the running game (a `Game` object). `G.units` and `G.buildings` hold everything on the map.
- `UD.spear`, `BD.barracks`, ...: the stats table for each unit or building (cost, hp, attack, speed).
- `team`: 0 is you, 1 is the AI, 2 is neutral villages.

Other folders in this repo are the missions and battles (`campaign/`, `ayutthaya/`, `khmer/`, ...).
Each is its own built page: its `build.py` takes the main `index.html`, adds that mission's own rules, map and
story, and writes the page. A copy of every mission's source is kept in `missions/`, and the shared mission
helpers in `tools/mission-kit/` (refresh them with `python3 tools/sync_mission_sources.py`).

## 3. Where it's hosted and compiled

- **Nothing is compiled.** JavaScript runs directly in the browser, which reads it and runs it on the spot
  (the browser itself is the "compiler").
- **Hosting:** GitHub Pages serves the files in this repo for free, at the link above.
  When a change is pushed to `main`, the site updates within about a minute.
- **App:** it's a PWA, a website that installs like an app. `manifest.webmanifest` gives it a name and icon,
  and `sw.js` (the service worker) keeps a copy on the phone so it works offline and checks for updates.
- **Saves** stay on your device, in the browser's storage (3 slots). There is no server.

## 4. From code to app

1. Edit a file in `src/`.
2. Run `python3 tools/build.py` to make `index.html`.
3. Open `index.html` in any browser to test, or push to GitHub.
4. GitHub Pages publishes it. Phones get the new version next time they open the app.

## Reading the code

- **Phone:** the GitHub app, or `github.dev/theREDiris0827/SEA-RTS` in Chrome (a full code editor in the
  browser; works best with the Fold open). Acode (Android) can open files with colours.
- **PC:** VS Code (free). Clone the repo, open the folder, and use Ctrl+P to jump to any file.
