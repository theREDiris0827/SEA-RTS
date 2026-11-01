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

The game ships as one file, `index.html`. For reading and editing, the same code is cut into pieces in `src/`:

```
src/
  index.html            the page: menus and HUD markup, plus '@@include' lines for the pieces below
  css/game.css          all the styling
  js/sim/               THE RULES (no drawing, so it can be tested without a screen)
    0-core.js             map size, tile types, save helpers, random noise for maps
    1-data.js             UD = units, BD = buildings, civ names, civ bonuses
    2-ages-difficulty-maps.js   the 4 ages, resources (NK), AI difficulty (DIFF), skirmish maps
    3-game.js             class Game: everything that happens each tick (30 times a second):
                          moving, gathering, building, fighting, fire, ships, the AI
  js/art/               THE LOOK (every sprite is drawn pixel by pixel in code, no image files)
    0-core.js             team colours, the sprite() helper, outlines
    1-people.js           villagers and soldiers
    2-nature.js           trees, bushes, gold, deer
    3-naval.js            ships
    4-civ-buildings.js    Melaka and Majapahit buildings
    5-ayutthaya.js        all Ayutthaya art
    6-ages-looks.js       how soldiers change from age to age
    7-buildings.js        building sprites shared by everyone
    8-icons.js            small icons
    9-terrain.js          grass, sand, water, cliffs
  js/ui/                THE SCREEN AND CONTROLS
    0-core-camera-fog.js  helpers, camera, fog of war
    1-drawing.js          draws the world each frame
    2-orders.js           selecting units and giving orders
    3-input.js            touch and mouse
    4-panel.js            the bottom panel (train, build buttons)
    5-hud-flow-save.js    resource bar, win/lose, saving
    6-menu.js             main menu, skirmish setup, encyclopedia
    7-sound.js            sound effects and music, made in code
    8-main-loop.js        starts the game and runs every frame
```

Think of it like a C++ project: many `.cpp` files that get built into one program.
Here `tools/build.py` glues the pieces into `index.html`:

```
python3 tools/build.py          src/ -> index.html
python3 tools/build.py split    index.html -> src/
python3 tools/build.py check    do they match?
```

Some key names you'll see everywhere:
- `G`: the running game (a `Game` object). `G.units` and `G.buildings` hold everything on the map.
- `UD.spear`, `BD.barracks`, ...: the stats table for each unit or building (cost, hp, attack, speed).
- `team`: 0 is you, 1 is the AI, 2 is neutral villages.

Other folders in this repo are the missions and battles (`campaign/`, `ayutthaya/`, `khmer/`, ...).
Each is its own built page. Their source is kept in the project files and built the same way.

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
