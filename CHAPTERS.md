# Chapter map

Every chapter of the game: where it sits in `index.html`, what it does, the numbers that are safe to tweak, and every function in it with a one-line note. Made by `python3 tools/chapter_map.py`.

**How to use it:** find the chapter, open its file in `src/` (or jump to the line in `index.html`) and look for the `CHAPTER` box at the top. Functions have a `//` note just above them.

**After changing a number:** if you edited `index.html`, run `python3 tools/build.py split`. If you edited a file in `src/`, run `python3 tools/build.py`. Then open `index.html` in a browser to test.

| Chapter | File | Lines in index.html |
|---|---|---|
| [SIM 1 · Basics](#sim-1--basics) | `src/js/sim/01-core.js` | 591 to 659 |
| [SIM 2 · Units, civs and buildings](#sim-2--units-civs-and-buildings) | `src/js/sim/02-units-buildings.js` | 660 to 818 |
| [SIM 3 · Ages, resources, AI difficulty, maps](#sim-3--ages-resources-ai-difficulty-maps) | `src/js/sim/03-ages-resources-ai-maps.js` | 819 to 947 |
| [SIM 4 · Starting a game](#sim-4--starting-a-game) | `src/js/sim/04-game-setup.js` | 948 to 1393 |
| [SIM 5 · Units, costs and ages](#sim-5--units-costs-and-ages) | `src/js/sim/05-entities-ages.js` | 1394 to 1621 |
| [SIM 6 · Finding the way](#sim-6--finding-the-way) | `src/js/sim/06-paths-and-searching.js` | 1622 to 1801 |
| [SIM 7 · Orders](#sim-7--orders) | `src/js/sim/07-orders.js` | 1802 to 2141 |
| [SIM 8 · Building and training](#sim-8--building-and-training) | `src/js/sim/08-building-training.js` | 2142 to 2354 |
| [SIM 9 · Every tick: buildings, soldiers, fire](#sim-9--every-tick-buildings-soldiers-fire) | `src/js/sim/09-every-tick.js` | 2355 to 2825 |
| [SIM 10 · Gathering, repairing, damage](#sim-10--gathering-repairing-damage) | `src/js/sim/10-gather-repair-damage.js` | 2826 to 3164 |
| [SIM 11 · What you tapped, and the enemy AI](#sim-11--what-you-tapped-and-the-enemy-ai) | `src/js/sim/11-enemy-ai.js` | 3165 to 3443 |
| [ART 1 · Drawing basics](#art-1--drawing-basics) | `src/js/art/01-core.js` | 3444 to 3513 |
| [ART 2 · People](#art-2--people) | `src/js/art/02-people.js` | 3514 to 3726 |
| [ART 3 · Nature](#art-3--nature) | `src/js/art/03-nature.js` | 3727 to 3773 |
| [ART 4 · Ships](#art-4--ships) | `src/js/art/04-ships.js` | 3774 to 3945 |
| [ART 5 · Melaka and Majapahit buildings](#art-5--melaka-and-majapahit-buildings) | `src/js/art/05-melaka-majapahit-buildings.js` | 3946 to 4273 |
| [ART 6 · Ayutthaya](#art-6--ayutthaya) | `src/js/art/06-ayutthaya.js` | 4274 to 5175 |
| [ART 7 · Soldiers through the ages](#art-7--soldiers-through-the-ages) | `src/js/art/07-age-looks.js` | 5176 to 5520 |
| [ART 8 · Shared buildings and walls](#art-8--shared-buildings-and-walls) | `src/js/art/08-shared-buildings.js` | 5521 to 5728 |
| [ART 9 · Icons](#art-9--icons) | `src/js/art/09-icons.js` | 5729 to 5769 |
| [ART 10 · Ground](#art-10--ground) | `src/js/art/10-terrain.js` | 5770 to 5861 |
| [SCREEN 1 · Screen, camera, fog](#screen-1--screen-camera-fog) | `src/js/ui/01-screen-camera-fog.js` | 5862 to 5982 |
| [SCREEN 2 · Drawing the battlefield](#screen-2--drawing-the-battlefield) | `src/js/ui/02-drawing.js` | 5983 to 6482 |
| [SCREEN 3 · Selecting and giving orders](#screen-3--selecting-and-giving-orders) | `src/js/ui/03-selecting.js` | 6483 to 6684 |
| [SCREEN 4 · Touch, mouse and keys](#screen-4--touch-mouse-and-keys) | `src/js/ui/04-touch-mouse-keys.js` | 6685 to 6815 |
| [SCREEN 5 · Action panel](#screen-5--action-panel) | `src/js/ui/05-action-panel.js` | 6816 to 7050 |
| [SCREEN 6 · Top bar, game flow and saves](#screen-6--top-bar-game-flow-and-saves) | `src/js/ui/06-hud-saves.js` | 7051 to 7187 |
| [SCREEN 7 · Menus and encyclopedia](#screen-7--menus-and-encyclopedia) | `src/js/ui/07-menus-encyclopedia.js` | 7188 to 7522 |
| [SCREEN 8 · Sound](#screen-8--sound) | `src/js/ui/08-sound.js` | 7523 to 7779 |
| [SCREEN 9 · Main loop](#screen-9--main-loop) | `src/js/ui/09-main-loop.js` | 7780 to 7820 |
| [EXTRA 1 · Calm map look and new maps](#extra-1--calm-map-look-and-new-maps) | `src/js/extras/01-maps.js` | 7821 to 8348 |
| [EXTRA 2 · Animals and kerbau](#extra-2--animals-and-kerbau) | `src/js/extras/02-animals-kerbau.js` | 8349 to 8833 |
| [EXTRA 3 · Smarter AI](#extra-3--smarter-ai) | `src/js/extras/03-ai-plus.js` | 8834 to 8881 |
| [EXTRA 4 · Groups, facing and taps](#extra-4--groups-facing-and-taps) | `src/js/extras/04-groups-facing-taps.js` | 8882 to 9116 |
| [EXTRA 5 · Compact screen](#extra-5--compact-screen) | `src/js/extras/05-compact-hud.js` | 9117 to 9227 |
| Styles | `src/css/game.css` | inside `<style>` |
| Page layout (menus, HUD) | `src/index.html` | outside the script and styles |

## SIM 1 · Basics

`src/js/sim/01-core.js` · lines 591 to 659

Map size, tile types, saving helpers and random numbers. Everything in the SIM chapters is the game rules only: no drawing, so it can run in tests.

**Things you can tweak**

- W, H: map size in tiles (96 x 72). Missions change it in their own build.
- MAXPOP: population cap (100).
- STEP: the game ticks 30 times a second. Leave it.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `snapEnc` | 615 | Sets, Maps and typed arrays survive JSON as tagged objects |
| `snapDec` | 622 | turn saved data back into Sets, Maps and arrays |
| `mulberry32` | 631 | the seeded random number maker (same seed = same map) |
| `hash2` | 642 | a fixed pseudo-random number for a tile |
| `vnoise` | 649 | smooth noise for map shapes |
| `fbm` | 656 | layered noise for natural-looking coasts and woods |

## SIM 2 · Units, civs and buildings

`src/js/sim/02-units-buildings.js` · lines 660 to 818

The big tables. UD lists every unit, BD every building. Each civ's names and bonuses live here too.

**Things you can tweak**

- UD.<unit>: hp, spd (tiles/s), atk, rng (range in tiles), rate (seconds between hits), ma/pa (melee/pierce armour), sight, cost, time (seconds to train), bonus (extra damage vs a class).
- BD.<building>: hp, size (tiles), cost, time, pop (housing), train (what it makes), atk (towers).
- TEAMMOD: per-civ multipliers (Majapahit: hp 0.92, speed 1.12, cost 0.85, armour -1).
- NAVMOD: Majapahit ship multipliers. MEL_LEVY: Melaka land soldiers' price (0.9 = 10% off).
- BURN / BURNMAT: how fast fire hurts and burns per civ's building material.
- CIV_NAMES / BRIEF: the local names and the short help text on buttons.
- TRADE, HOUSEHOLD, FISH_RATE, TRIBUTE, WALL_MAX, RAFT: trade gold, Ayutthaya household food, Majapahit tribute, longest wall drag, fire raft cooldown.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `CV` | 711 | which civ a team plays (0 Melaka, 1 Majapahit, 3 Ayutthaya) |
| `CI` | 716 | which column of a [Melaka, Majapahit, Ayutthaya] table to read |
| `civOk` | 718 | can this civ use this unit or building? |
| `civEntry` | 756 | the civ's name entry for a unit or building |
| `civRole` | 758 | the English role name ("Spearman") |
| `civName` | 760 | the local name ("Tombak Warrior") |
| `shortName` | 762 | the short button label |
| `enName` | 778 | the English name, when the local name differs from it |
| `btnName` | 780 | button text: local name with (English) under it |
| `fullName` | 782 | "Local name (English)" |

## SIM 3 · Ages, resources, AI difficulty, maps

`src/js/sim/03-ages-resources-ai-maps.js` · lines 819 to 947

The four ages, gunpowder rules, how much each tree/bush/gold holds, AI difficulty, and the skirmish map layouts.

**Things you can tweak**

- AGE_TABLE: cost, research time, Town Centre hp and needed buildings per age. AGE_START_BONUS: resources for Start in.
- ARCHER_LINE: what each civ's archer becomes in each age.
- GUN: gun armour-pierce and the stand-still bonus. SKIRM_PSN / SUMPIT_PSN: poison damage.
- NK: resource amounts and gather speed (tree 200 wood, berry 250, gold 1000, fish 400).
- FARM_RATE, FARM_ENDLESS: farm speed, and whether farms run out.
- DIFF: AI per difficulty. wave0 = quiet start (s), gap = least time between attacks, base/grow = attack size, vil = AI villagers.
- MAPDEF: each skirmish map's starts, gold, deer and village spots.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `lineKind` | 873 | which archer-line unit a civ gets in an age |
| `ageFits` | 875 | is this unit allowed in this age? |
| `costWords` | 877 | cost as words ("50 food, 20 gold") |
| `rectOfTiles` | 928 | a rectangle from tile corners |
| `rectDist` | 930 | distance from a point to a rectangle |

## SIM 4 · Starting a game

`src/js/sim/04-game-setup.js` · lines 948 to 1393

The Game class begins here. Makes the map (genMap, rivers, islands), thins trees (openWoods), places villages, bases and resources (populate), and saves/loads (snapshot).

**Things you can tweak**

- populate(): what each side starts with and where resources go.
- openWoods(): how many trees get cleared. Missions turn it off.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `init` | 957 | ======================= setup ======================= |
| `openWoods` | 994 | thin the woods so nothing gets trapped: no one-tile squeezes between trees, and no little clearings walled in by trees (a kerbau or deer could spawn in one... |
| `reserveRoute` | 1046 | keep a road clear of trees |
| `inb` | 1068 | is this tile inside the map? |
| `computeRegions` | 1070 | land masses: every land tile gets the number of the island (or river bank) it sits on |
| `regionAt` | 1087 | which island or river bank a point is on |
| `coastNear` | 1089 | a dry tile on the shore near (x, y), at least 5 tiles out: where a base's port road goes |
| `snapshot` | 1103 | Everything that can't be rebuilt goes into a plain JSON object. Lookup tables (byId, the spatial hash, path scratch, claims) and short-lived effects are... |
| `genMap` | 1130 | make the land, water and cliffs for a skirmish map |
| `genRiverlands` | 1195 | Riverlands: four rivers that meet in the middle; sandy fords are the only dry crossings |
| `genIslands` | 1219 | Big Islands: four large islands, one for each side and two to fight over, with deep channels between |
| `landConnected` | 1230 | can you walk from A to B? |
| `isLand` | 1245 | is the tile land? |
| `isWater` | 1247 | is the tile water? |
| `freeTile` | 1249 | is the tile empty land? |
| `addNode` | 1252 | put a tree, bush, gold or fish on the map |
| `removeNode` | 1261 | remove a used-up resource |
| `populate` | 1268 | place bases, villagers, resources and villages at the start |
| `addVillage` | 1361 | place a neutral Orang Laut village with its landing |
| `siteAt` | 1392 | the free village landing whose corner is at (tx, ty), if any |

## SIM 5 · Units, costs and ages

`src/js/sim/05-entities-ages.js` · lines 1394 to 1621

Adding units and buildings, working out prices (costOf), what a building can train, and climbing the ages.

**Things you can tweak**

- costOf(): where civ discounts are applied.
- applyAge(): what happens when an age finishes.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `addUnit` | 1403 | ======================= entities ======================= |
| `unitName` | 1422 | a unit's civ name |
| `costOf` | 1424 | price of a unit or building after civ discounts (MEL_LEVY, TEAMMOD) |
| `trainable` | 1432 | what a building can train for this team (unique units and ships belong to one civ) |
| `lockedTrain` | 1434 | what this building will train in a later age (shown greyed out with the age it needs) |
| `countOf` | 1439 | how many of a kind a team has |
| `canAfford` | 1446 | enough resources? |
| `pay` | 1448 | take the cost |
| `refund` | 1450 | give the cost back |
| `teamAge` | 1453 | ======================= ages ======================= |
| `ageText` | 1455 | what the next age still needs, as text |
| `ageNeedMet` | 1461 | are the next age's needed buildings built? |
| `startAge` | 1468 | begin researching the next age |
| `cancelAge` | 1479 | stop an age-up and refund it |
| `ageTick` | 1485 | count down age research |
| `applyAge` | 1492 | finish an age-up: Town Centre hp, unit looks, unlocks |
| `morphUnit` | 1505 | swap a unit for another kind in place, keeping its share of health |
| `armForAge` | 1512 | foot soldiers get mail in the Age of Commerce and more in the Golden Age; light ranged units turn elite in the Golden Age |
| `addBuilding` | 1521 | add a building to the map |
| `evict` | 1538 | push units off a new building's tiles |
| `setGateLock` | 1549 | an own gate: open lets your own people through and stops enemies, closed stops everyone |
| `walkable` | 1556 | can a unit stand on this tile? |
| `nearestFree` | 1564 | the closest empty tile |
| `unitNear` | 1581 | is another unit close to this spot? |
| `openSpot` | 1586 | centre of the nearest walkable tile nobody is standing on |
| `findSpawn` | 1602 | spawn tile next to a building, preferring the side facing 'toward' (and tiles nobody stands on) |

## SIM 6 · Finding the way

`src/js/sim/06-paths-and-searching.js` · lines 1622 to 1801

A* pathfinding, straight-line checks, and quick searches like "nearest enemy" or "units near here".

**Things you can tweak**

- Mostly leave alone. nearestEnemy() decides what idle soldiers notice.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `findPath` | 1630 | ======================= pathfinding ======================= |
| `los` | 1677 | straight line clear between two points? |
| `smooth` | 1690 | straighten a path so units don't zig-zag |
| `pathToRect` | 1701 | path to within `reach` of a rectangle (continuous coords) |
| `pathToPoint` | 1719 | find a path to a spot |
| `setPath` | 1734 | give a unit its new path |
| `stepMove` | 1739 | move a unit along its path for one tick |
| `rebuildHash` | 1758 | ======================= spatial queries ======================= |
| `unitsNear` | 1767 | all units within a radius (fast grid lookup) |
| `isVisible` | 1776 | is this spot out of the fog? |
| `nearestEnemy` | 1778 | the closest enemy a unit can see |

## SIM 7 · Orders

`src/js/sim/07-orders.js` · lines 1802 to 2141

What happens when you tap: gather, attack, board a ship, land, shelter in the Town Centre (town bell), trade, move in formation.

**Things you can tweak**

- BD.towncentre.garrison / BD.tower.garrison (chapter 2): how many villagers shelter.
- groupMove(): spacing of formations.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `idleOrder` | 1811 | ======================= orders ======================= |
| `gatherInfo` | 1813 | what a target gives and how fast, if it can be gathered |
| `orderGather` | 1820 | send a villager to gather |
| `orderAttack` | 1830 | send a unit to attack |
| `orderBoard` | 1835 | send a unit onto a ship |
| `roomIn` | 1837 | garrison: villagers shelter in a Town Centre (15) or tower (5); each one inside adds an arrow |
| `orderGarrison` | 1839 | send a villager to shelter in a building |
| `doGarrison` | 1841 | walk to the shelter and go inside |
| `shelterFor` | 1859 | nearest building with room to shelter |
| `ringBell` | 1865 | the town bell: every villager runs for the nearest shelter with room; All clear sends them back to work |
| `ungarrison` | 1881 | let sheltered villagers out |
| `allClear` | 1895 | end the town bell: everyone back to work |
| `orderLand` | 1903 | send a loaded ship to a beach |
| `shoreTile` | 1905 | the water tile next to a beach nearest (x, y), leaning towards (bx, by) |
| `waterReach` | 1920 | every water tile a ship can sail to from where it is |
| `doBoard` | 1934 | a land unit climbs aboard once it reaches the galley |
| `doLand` | 1955 | a galley sails to the beach nearest (x, y) and puts its troops ashore |
| `launchRaft` | 1986 | a Port pushes a burning raft out at the nearest enemy ship |
| `orderTrade` | 2000 | start a trade ship's route |
| `orderBuild` | 2002 | send a villager to build |
| `orderMove` | 2004 | plain move |
| `orderAMove` | 2006 | attack-move (fight anything on the way) |
| `command` | 2009 | group order from the player (or the AI). ids -> units owned by `team` |
| `groupMove` | 2092 | move a group in formation |

## SIM 8 · Building and training

`src/js/sim/08-building-training.js` · lines 2142 to 2354

Where a building may go, laying walls in lines, the build queue, population, and drop-off points.

**Things you can tweak**

- WALL_MAX (chapter 2) limits a wall drag.
- popCap(): MAXPOP from chapter 1.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `canPlace` | 2151 | ======================= building / training ======================= |
| `underPortArt` | 2175 | a port's hall stands up above its deck: nothing may be built where the hall's art goes, and a port's hall can't cover another building |
| `canFloat` | 2188 | Ayutthaya raft house moored out on the river: the whole 2x2 on water, its edge against the bank (a bamboo gangway), and open water on the river side so... |
| `waterSide` | 2203 | water tiles around a footprint: an Ayutthaya house with 3 or more becomes a raft house |
| `wallPieceAt` | 2212 | the team's own palisade or wall (or any wall piece, gates included, unless plain) on a tile |
| `lineTiles` | 2218 | tiles of a wall line from (ax, ay) to (bx, by), stepping one axis at a time so there are no diagonal gaps |
| `placeLine` | 2229 | lay a palisade or wall line; own wall tiles on the way are kept, blocked tiles are skipped. returns {ok, n, why} |
| `placeBuilding` | 2251 | returns {ok, b, why} |
| `queueUnit` | 2271 | add a unit to a building's training queue |
| `cancelQueue` | 2285 | remove one from the queue and refund it |
| `popOf` | 2292 | how many people a team has |
| `popCap` | 2294 | housing limit |
| `dropOffs` | 2296 | buildings that take a resource |
| `nearestDrop` | 2301 | nearest drop-off for a resource |
| `nearestNode` | 2307 | nearest resource of a type; one with a free gathering slot wins over a full one |
| `freeSameKind` | 2331 | nearest other resource of the same kind as `like` (tree -> tree, farm -> own farm) with a free slot |
| `gatherCap` | 2342 | how many villagers (or boats) may work one resource at once |
| `claimsOf` | 2344 | how many villagers are on a resource |
| `countClaims` | 2346 | recount villagers per resource |
| `setRally` | 2351 | set where new units walk to |

## SIM 9 · Every tick: buildings, soldiers, fire

`src/js/sim/09-every-tick.js` · lines 2355 to 2825

Runs 30 times a second: buildings train and heal, soldiers pick fights by stance, healers heal, ships shoot, buildings burn.

**Things you can tweak**

- guardOrder(): how far Defensive soldiers chase (r: 11 tiles).
- fireOn(): who sets buildings alight and how often (archers 20% from Age 2).
- BURN (chapter 2) for fire strength.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `update` | 2365 | ======================= per-tick update ======================= |
| `doFishHouse` | 2383 | fishing from a raft house's deck: no walking to a drop-off, the catch goes straight into the store |
| `households` | 2397 | Ayutthaya households: each house with a worked paddy beside it (or a raft house with a woman fishing) |
| `householdTick` | 2412 | Ayutthaya households pay food |
| `updateBuilding` | 2422 | one tick for a building: build, train, shoot, heal |
| `finishBuilding` | 2483 | a building is finished |
| `updateUnit` | 2505 | one tick for a unit: cooldowns, then its current order |
| `doIdle` | 2549 | what an idle unit does (look for enemies by stance) |
| `guardOrder` | 2575 | stances: 'agg' chases whatever it sees, 'def' (default) chases up to 11 tiles from its post then walks back, 'hold' never moves |
| `orderReturn` | 2577 | walk back to the post; a soldier hit on the way fights back instead of ignoring it |
| `breach` | 2579 | a land soldier whose way is walled off attacks the enemy wall piece that is most in the way to (gx, gy) |
| `doAMove` | 2590 | attack-move step |
| `doAttack` | 2606 | chase and hit a target |
| `doWander` | 2658 | animals wander |
| `doFlee` | 2670 | animals run from hunters |
| `doTrade` | 2682 | trade ship: sail to the Trading Post, load goods, sail home to the nearest Port and get paid by distance |
| `canHeal` | 2706 | healing: allies on land, hurt, and out of combat for HEAL_CALM seconds |
| `healOne` | 2708 | heal one unit |
| `healStep` | 2710 | idle healer: heal what's in reach, or walk over to the worst-hurt ally it can see |
| `doHeal` | 2734 | healer walks to and heals a target |
| `shipShot` | 2743 | a ship's main weapon: arrows (fire arrows from tier 1), boarding, or cannon (tier 2) |
| `secShot` | 2757 | secondary weapon (galley archers, flagship arrows) on its own reload |
| `fireOn` | 2770 | fire on buildings (lore/siege.md, Iylia 2026-10-25), all of it automatic: foot soldiers carry obor torches, gunners throw gunpowder fire pots (two fires at... |
| `ignite` | 2778 | set a building or wooden ship burning; stacks up to BURN.max |
| `updateBurning` | 2786 | burning buildings and ships lose hp |
| `explode` | 2813 | fire ship: burns everything hostile around it and sinks itself |

## SIM 10 · Gathering, repairing, damage

`src/js/sim/10-gather-repair-damage.js` · lines 2826 to 3164

Villagers gathering and carrying, repairing and demolishing, building, units pushing apart, and the damage formula. Also fog of war and the win/lose check.

**Things you can tweak**

- damage(): the damage formula (attack + bonus - armour).
- doRepair(): repair cost and speed.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `doGather` | 2835 | villager gathers, carries the load to a drop-off, and goes back |
| `workSpot` | 2935 | where a gatherer stands while working: inside a farm, or hugging the side of a node it walked up to |
| `doRepair` | 2965 | repair: a full fix takes 1.5x the build time for one villager (more help, faster) and costs half the building's price in wood (at least 25), paid as the... |
| `canDemolish` | 2984 | knock down your own building: nothing comes back. The Town Centre can't be (losing it loses the game) |
| `demolish` | 2986 | take down your own building |
| `doBuild` | 2995 | villager builds |
| `separate` | 3019 | push units apart so they don't stack |
| `nudge` | 3039 | small push for one unit |
| `gunFx` | 3045 | gunpowder at the muzzle: a flash, then thick pale smoke billowing forward and drifting up |
| `damage` | 3051 | the damage formula: attack + bonus - armour |
| `onKilled` | 3090 | something died: score, loot, messages |
| `msg` | 3114 | show a short message |
| `cleanup` | 3117 | remove the dead |
| `updateFx` | 3130 | age out effects |
| `updateFog` | 3144 | recompute what each side can see |
| `checkEnd` | 3160 | win or lose? |

## SIM 11 · What you tapped, and the enemy AI

`src/js/sim/11-enemy-ai.js` · lines 3165 to 3443

pick() finds what is under your finger. aiTick() is the computer player: it gathers, builds, trains, ages up, attacks and retreats.

**Things you can tweak**

- DIFF (chapter 3) is the safest place to change the AI.
- aiRetreat(): when a beaten attack falls back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pick` | 3174 | ======================= picking ======================= |
| `aiTick` | 3200 | ======================= enemy AI (Majapahit) ======================= |
| `aiFerry` | 3352 | Big Islands: board a wave onto the galleys, sail them over and land it by the enemy base; anyone already ashore over there marches on the nearest enemy... |
| `aiRetreat` | 3395 | an attack that has clearly failed comes home: under a third left, or still fighting after 3 minutes |
| `aiBuild` | 3406 | AI places a building near its Town Centre |
| `aiBuildShore` | 3419 | AI places a port on the coast |
| `aiBuildNear` | 3429 | AI places a drop-off near resources |

## ART 1 · Drawing basics

`src/js/art/01-core.js` · lines 3444 to 3513

All art is drawn by code, pixel by pixel, then cached as pictures. Team colours and the sprite helper live here.

**Things you can tweak**

- TEAMC: each team's colours. SKIN, HAIR, STEEL, WOOD: shared colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `cv` | 3466 | make a blank drawing canvas |
| `sprite` | 3468 | draw a picture once with the pixel painter P, then reuse the cached copy |
| `outlineCanvas` | 3479 | add the dark outline around a sprite |
| `whiteOf` | 3493 | a white copy of a sprite (flash when hit) |
| `disc` | 3500 | paint a filled pixel circle |
| `planks` | 3502 | paint a wooden plank wall |
| `roofGable` | 3504 | paint a sloped gable roof |
| `posts` | 3512 | paint wooden stilts or posts |

## ART 2 · People

`src/js/art/02-people.js` · lines 3514 to 3726

Villagers and soldiers: bodies, legs, weapons and the walk cycle.

**Things you can tweak**

- GOLD, LUK, LEGS: shared colours and leg poses.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `drawUnit` | 3534 | paint a Melaka/Majapahit person: body, clothes, weapon and pose |
| `unitAge` | 3662 | the team's age picks the look (AGEART, below); neutral and pre-age callers get the Kingdom Age roster |
| `unitSprite` | 3664 | the picture for a unit, with its age look |
| `civUnitSprite` | 3666 | the picture for a unit by civ (Ayutthaya has its own art) |
| `deerSprite` | 3672 | deer picture |
| `carcassSprite` | 3682 | hunted animal carcass picture |
| `hull` | 3691 | hull with upswept bow and stern; x0..x1 is the deck length, y the deck line |
| `tanja` | 3698 | tanja: slanted four-sided sail between two spars, the classic Nusantara rig |
| `boatSprite` | 3706 | fishing boat picture |

## ART 3 · Nature

`src/js/art/03-nature.js` · lines 3727 to 3773

Trees, bushes, gold, fish and deer.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `treeSprite` | 3732 | ------------------------------ nature ------------------------------ |
| `bushSprite` | 3758 | berry bush picture |
| `goldSprite` | 3766 | gold deposit picture |

## ART 4 · Ships

`src/js/art/04-ships.js` · lines 3774 to 3945

Every civ's ships, sails and hulls (NAVAL).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hull` | 3794 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 3802 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 3810 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 3818 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 3820 | paint a ship mast |
| `flag` | 3822 | paint a small flag |
| `oars` | 3824 | paint a row of oars |
| `crew` | 3826 | paint a crewman on deck |
| `flames` | 3828 | paint flames |
| `navalSprite` | 3842 | a ship picture by kind and civ |

## ART 5 · Melaka and Majapahit buildings

`src/js/art/05-melaka-majapahit-buildings.js` · lines 3946 to 4273

Town Centres, houses, barracks and other buildings for the first two civs (CIVB).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `weave` | 3960 | paint woven bamboo walls |
| `sacks` | 3962 | paint grain sacks |
| `crates` | 3964 | paint trade crates |
| `banner` | 3966 | paint a Melaka banner |
| `melakaBuilding` | 3969 | a Melaka building picture |
| `neutralSite` | 4019 | Neutral map sites. Pangkalan can only be built on a landing next to a settlement. |
| `brick` | 4047 | paint red brick courses |
| `meru` | 4049 | meru: stacked black thatch tiers, each narrower than the one below |
| `surya` | 4051 | sun of Majapahit (Surya Majapahit) emblem |
| `mjBanner` | 4053 | paint a Majapahit banner |
| `majapahitBuilding` | 4056 | a Majapahit building picture |
| `ijukRoof` | 4113 | black ijuk gable roof with a thick dark edge |
| `majapahitBase` | 4116 | Majapahit Town Centre and palace base |
| `pier` | 4158 | pier() and rack() from buildings-mainland.js, used by the Majapahit port and barracks |
| `rack` | 4160 | paint a drying rack |
| `drawHealer` | 4170 | paint a healer (Tabib, Acaraki, Mo) |
| `healerSprite` | 4217 | healer picture |
| `herbBed` | 4225 | paint a herb bed |
| `healerBuilding` | 4228 | healer building picture (Rumah Tabib, Patirthan) |

## ART 6 · Ayutthaya

`src/js/art/06-ayutthaya.js` · lines 4274 to 5175

All Ayutthaya art: people, elephants, buildings and boats (AYART).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ayUnit` | 4298 | an Ayutthaya unit picture |
| `ayuPerson` | 4306 | paint an Ayutthaya person |
| `ayuElephant` | 4424 | ---------- Chang Suek: war elephant, 32x32, facing right ---------- |
| `ayuCannon` | 4495 | ---------- bronze cannon on a field carriage, 26x18, with a purple pennant ---------- |
| `ayRoofTri` | 4535 | steep roof triangle seen from the gable end: tile courses, a coloured rim along both slopes |
| `ayChofa` | 4543 | chofa: slender gold hook rising from the gable apex |
| `ayHangHong` | 4545 | hang hong: small upturned gold curls at the lower ends of the gable boards |
| `ayGable` | 4547 | Thai gable: tiled triangle, dark gable face framed by gold pan lom boards, chofa on top, hang hong at the foot |
| `ayEave` | 4565 | eave skirt: a lower roof tier spreading out under a gable |
| `ayWhite` | 4573 | white-washed brick: lime plaster with faint courses and weathering |
| `ayLeaf` | 4579 | bai sema merlon: a leaf shape with a point on top |
| `ayBanner` | 4584 | purple thong banner with a little white elephant |
| `ayTeak` | 4590 | teak panel wall (fa pakon): framed panels |
| `ayHouse` | 4596 | small Ruean Thai, used by the house and the raft house |
| `ayBuilding` | 4616 | an Ayutthaya building picture |
| `hull` | 4757 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 4765 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 4773 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 4781 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 4783 | paint a ship mast |
| `flag` | 4785 | paint a small flag |
| `oars` | 4787 | paint a row of oars |
| `crew` | 4789 | paint a crewman on deck |
| `flames` | 4791 | paint flames |
| `navalSprite` | 4805 | a ship picture by kind and civ |
| `junk` | 4924 | Battened junk sail: a tall rectangle with battens and a rounded top-front corner. |
| `prow` | 4929 | Tall curving prow (Thai and Khmer barges). |
| `eye` | 4931 | Painted bow eye, the mark of Vietnamese boats. |
| `pavilion` | 4933 | Pavilion with a tiered pointed roof. |
| `mainlandShip` | 4939 | a Khmer/Dai Viet ship picture (battle demos) |
| `womanSprite` | 5053 | Phrai Ying: a village woman of Ayutthaya. Short hair (as European visitors noted of Siamese women), a sabai cloth across the chest, an ankle-length pha sin,... |
| `aySpears` | 5091 | rack of spears with red tassels |
| `ayShield` | 5093 | small purple round shield with a gold boss |
| `ayBuildingX` | 5095 | Ayutthaya barracks, port, granary, teak store and farm pictures |
| `unit` | 5163 | an Ayutthaya unit picture (falls back to the shared art) |
| `building` | 5171 | Ayutthaya building picture (shared entry point) |
| `ship` | 5173 | Ayutthaya ship picture (shared entry point) |

## ART 7 · Soldiers through the ages

`src/js/art/07-age-looks.js` · lines 5176 to 5520

How soldiers' dress changes each age (AGEART), plus guns and armour (XU).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hexRGB` | 5192 | Melaka age progression mockups. Runs in the game page after art.js (and heroes-art.js). melAge(kind, age, anim, f): keris / tombak / archer drawn with the... |
| `recolor` | 5194 | swap colours on a finished picture |
| `melAge` | 5202 | Melaka soldier picture for a given age |
| `melGunner` | 5228 | Melaka gunner picture |
| `melMeriam` | 5252 | Melaka bronze cannon picture |
| `xuFlash` | 5282 | muzzle flash pointing right, x = first pixel past the muzzle, y = bore centre |
| `xuSmoke` | 5285 | a few puffs drifting up from (x, y) |
| `xUnit` | 5291 | extra unit pictures (guns, armour) |
| `mpAge` | 5408 | ---------- Majapahit: the game's Majapahit drawing, a kere (mail coat) from age 2, a bronze helmet in age 3 ---------- |
| `helmet` | 5427 | paint a bronze helmet |
| `mpMusket` | 5432 | the Bedil Kraton (Golden Age): the bedil gunner in a kere with a gold belt |
| `lightAge` | 5442 | ---------- light ranged units: levy cloth in age 1, a gold sash and band in age 4, never mail ---------- |
| `canvasRecolor` | 5453 | copy a picture with colours swapped |
| `ayAge` | 5461 | Ayutthaya soldier picture for a given age |
| `unit` | 5480 | pick the right age look for any civ's soldier |
| `shipSprite` | 5505 | the picture for a ship on the map |
| `raftSprite` | 5507 | rakit api: a bamboo raft heaped with dry fronds and husks, already alight |
| `shipAnchor` | 5519 | where a ship picture sits on its tile |

## ART 8 · Shared buildings and walls

`src/js/art/08-shared-buildings.js` · lines 5521 to 5728

Walls, gates, farms, ports and other buildings every civ shares, and wall styles by age.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `wallSprite` | 5529 | one wall tile. mask: 1 N, 2 E, 4 S, 8 W neighbours of the same side; open: a gate with friends close by. Palisade: sharpened logs. Melaka Kubu: planked... |
| `sawahSprite` | 5641 | Sawah: stepped rice terraces with water between the rows, earth bunds and a dangau hut (lore/scenes/bld-extra.js, fitted to 3 tiles) |
| `buildingSprite` | 5665 | the picture for a building |
| `civBuildingSprite` | 5667 | the picture for a building by civ |

## ART 9 · Icons

`src/js/art/09-icons.js` · lines 5729 to 5769

Small pictures for buttons, and marks on the ground.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `iconSprite` | 5734 | ------------------------------ icons & decals ------------------------------ |
| `rubbleSprite` | 5760 | rubble left by a destroyed building |

## ART 10 · Ground

`src/js/art/10-terrain.js` · lines 5770 to 5861

Grass, sand, water and cliffs (PAL is the ground palette).

**Things you can tweak**

- PAL: ground colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `buildTerrain` | 5783 | paint the whole ground map once at the start |
| `buildMiniBase` | 5854 | paint the minimap ground |

## SCREEN 1 · Screen, camera, fog

`src/js/ui/01-screen-camera-fog.js` · lines 5862 to 5982

Everything the player sees and touches starts here: the canvas, the camera, the fog of war and the build list.

**Things you can tweak**

- setZoom(): zoom limits, clamp(z, 0.38, 2.6). 0.38 = furthest out.
- clampCam(): how far past the map edge you can pan (0.3 and 0.35 of the screen).
- BUILD_ORDER, ECO_BLD: the order of build buttons and which tab they sit in.
- FORMS: formation types.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `clamp` | 5896 | ---------------- helpers ---------------- |
| `s2w` | 5898 | screen point to map point |
| `w2s` | 5900 | map point to screen point |
| `fmtTime` | 5902 | seconds as m:ss |
| `dataURL` | 5905 | picture as an image link (cached) |
| `fitIcon` | 5910 | shrink a sprite into an icon |
| `unitIcon` | 5919 | button icon for a unit |
| `bldIcon` | 5921 | button icon for a building |
| `resIcon` | 5927 | icon for food, wood or gold |
| `nodeIcon` | 5929 | icon for a resource on the map |
| `toast` | 5934 | pop-up message on screen |
| `resize` | 5942 | ---------------- view and camera ---------------- |
| `clampCam` | 5950 | the camera may run a little past each edge, so the corners can be brought out from under the HUD |
| `setZoom` | 5956 | zoom the camera, kept between 0.38 (far) and 2.6 (close) |
| `centerOn` | 5963 | move the camera to a tile |
| `inView` | 5965 | is this on screen? |
| `initFog` | 5968 | ---------------- fog ---------------- |
| `refreshFog` | 5973 | repaint the fog layer |

## SCREEN 2 · Drawing the battlefield

`src/js/ui/02-drawing.js` · lines 5983 to 6482

Draws ground, buildings, units, health bars, fire, arrows and the minimap every frame, sorted so nearer things cover farther ones.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ell` | 5989 | ---------------- drawing ---------------- |
| `shadow` | 5991 | soft shadow under a unit |
| `hpBar` | 5993 | health bar |
| `isSel` | 5998 | is this selected? |
| `toolFor` | 6001 | which tool a villager holds for its job |
| `paintUnit` | 6008 | draw one unit |
| `torchFor` | 6056 | foot soldiers burn buildings with an obor (torch) rather than hacking at them with their weapons (lore/siege.md) |
| `paintTorch` | 6062 | draw the obor torch pose |
| `paintNode` | 6079 | draw a resource |
| `buildWallGrid` | 6103 | map of where wall pieces are |
| `wallMask` | 6109 | which neighbours a wall piece joins |
| `raftSide` | 6116 | which way a raft house leans to the water |
| `paintRaftHouse` | 6123 | draw a raft house |
| `paintFisher` | 6150 | draw the woman fishing from a raft house |
| `paintBuilding` | 6163 | draw one building with fire, flags and bars |
| `paintFx` | 6193 | draw effects (corpses, sparks) |
| `paintTop` | 6211 | draw top-layer effects (gun flashes) |
| `drawArrow` | 6255 | draw arrows and bullets in flight |
| `jobTarget` | 6284 | where a unit is headed for its job (gather / build / hunt target), if anywhere |
| `targetRing` | 6290 | ring around a target |
| `paintJobs` | 6296 | dashed trail from selected workers to their job |
| `paintMarkers` | 6311 | tap markers on the ground |
| `paintPlacement` | 6330 | the building ghost while placing |
| `paintLinePlacement` | 6349 | a wall line: every tile green (new), grey (already walled) or red (blocked), with the count and cost by its end |
| `placeButtons` | 6373 | touch placement: a ✓ (build) and ✗ (cancel) button under the ghost; their screen spots are kept for hit tests |
| `paintPlaceButtons` | 6380 | the Place/Cancel buttons on the ghost |
| `render` | 6392 | draw the whole frame |
| `drawMini` | 6458 | draw the minimap |

## SCREEN 3 · Selecting and giving orders

`src/js/ui/03-selecting.js` · lines 6483 to 6684

Turns taps into selections and orders (tap a unit, box select, double tap for all of a kind).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `selUnits` | 6488 | ---------------- selection and orders ---------------- |
| `select` | 6490 | change the selection |
| `addMarker` | 6492 | show where you tapped |
| `issue` | 6494 | give the selected units an order at a spot |
| `canRally` | 6510 | can this building have a rally point? |
| `setRallyFor` | 6512 | set a rally point from a tap |
| `contextCommand` | 6518 | the right order for what you tapped (gather, attack, repair...) |
| `selectSameKind` | 6524 | select all units of this kind on screen |
| `placeAt` | 6529 | move the building ghost |
| `nearestSite` | 6535 | nearest free village landing (trading post) |
| `tryPlace` | 6544 | place the building if the spot is OK |
| `startPlace` | 6561 | start placing a building |
| `nearWallPiece` | 6587 | nearest wall piece (for gates) |
| `findSpot` | 6593 | a good free spot for a building |
| `clearRallyTap` | 6604 | cancel a pending rally tap |
| `handleTap` | 6606 | what one tap does |
| `boxSelect` | 6654 | select everything inside a dragged box |
| `idleVillagers` | 6665 | list idle villagers |
| `cycleIdle` | 6668 | jump to the next idle villager |
| `selectArmy` | 6673 | select all soldiers |
| `selectNavy` | 6679 | every warship (fishing boats and trade ships keep working) |

## SCREEN 4 · Touch, mouse and keys

`src/js/ui/04-touch-mouse-keys.js` · lines 6685 to 6815

Finger drag to scroll, pinch to zoom, hold-drag to box select, mouse wheel, keyboard keys.

**Things you can tweak**

- The pinch zoom limit is also here (0.38, 2.6): keep it the same as setZoom().

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pos` | 6692 | ---------------- pointer input ---------------- |
| `endPointer` | 6757 | finger or mouse lifted: tap, drag or box |
| `miniGo` | 6781 | tap the minimap to move the camera |

## SCREEN 5 · Action panel

`src/js/ui/05-action-panel.js` · lines 6816 to 7050

The panel at the bottom: build tabs, train buttons, stance, bell, repair, demolish.

**Things you can tweak**

- STANCES: the stance names and order.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `costHTML` | 6825 | cost shown with icons |
| `costTitle` | 6830 | cost as text |
| `cmdBtn` | 6832 | make one panel button |
| `lockBtn` | 6836 | a button for something a later age brings: greyed out, tapping it says which age |
| `ageBtn` | 6841 | the Town Centre's age-up button: the next age and its cost, or the work under way (tap to call it off) |
| `describeOrder` | 6848 | what a unit is doing, as text |
| `bldNote` | 6871 | help line for a selected building |
| `pName` | 6885 | name line in the panel |
| `buildPanel` | 6887 | build the bottom panel for the selection |
| `structKey` | 6978 | panel layout key (rebuild only when it changes) |
| `updatePanel` | 6985 | refresh numbers on the panel |
| `stanceOfSel` | 7001 | stance of the selected soldiers |
| `cycleStance` | 7003 | Stance button |
| `cycleFormation` | 7011 | Formation button |
| `stopSel` | 7013 | Stop button |

## SCREEN 6 · Top bar, game flow and saves

`src/js/ui/06-hud-saves.js` · lines 7051 to 7187

Resource bar, messages, pause, win/lose screens, autosave and the 3 save slots.

**Things you can tweak**

- SAVE_KEY / SLOTS_KEY: where saves are kept on the phone.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hintText` | 7060 | the hint line at the top |
| `updateHud` | 7069 | refresh the top bar |
| `showOv` | 7086 | ---------------- game flow ---------------- |
| `startGame` | 7091 | start a skirmish |
| `enterGame` | 7100 | shared by a new game and a resumed one: rebuild the view state around G |
| `syncSpeedButtons` | 7108 | show which game speed is on |
| `lsGet` | 7113 | storage can be missing (private windows, previews): the game still runs, it just can't resume |
| `lsSet` | 7115 | save to the phone's storage |
| `lsDel` | 7117 | delete from the phone's storage |
| `saveSettings` | 7121 | save settings |
| `slotMetas` | 7128 | what is in the 3 save slots |
| `slotPick` | 7130 | which slot a new game uses |
| `slotWrite` | 7132 | write a save slot |
| `slotRead` | 7134 | read a save slot |
| `slotDel` | 7136 | delete a save slot |
| `slotNewest` | 7138 | most recent save |
| `slotLine` | 7140 | save slot label text |
| `saveGame` | 7144 | save the current game |
| `openSlot` | 7151 | a mission save opens its own page, which loads it |
| `continueGame` | 7158 | load a saved game |
| `quitToMenu` | 7167 | save and go to the menu |
| `discardGame` | 7169 | leave without keeping anything from this game: every slot it wrote goes back to what it held before |
| `confirmBox` | 7177 | a yes/no box over whatever is on screen |

## SCREEN 7 · Menus and encyclopedia

`src/js/ui/07-menus-encyclopedia.js` · lines 7188 to 7522

Home screen, Skirmish setup, Campaign and Battles lists, mission briefings, Encyclopedia text, Settings.

**Things you can tweak**

- BUILD: the version shown in Settings.
- ENCY_UNITS / ENCY_BLDS / ENCY_CIVS / ENCY_GUIDE: encyclopedia text.
- CAMPAIGNS / MISSIONS: mission lists, briefings and which are unlocked.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `showMenu` | 7203 | show a menu screen |
| `delAsk` | 7218 | two-tap Delete on the home screen |
| `refreshHome` | 7224 | update the home screen |
| `renderSlots` | 7233 | Load game screen |
| `setVerNote` | 7241 | version, updates and exit (the installed app has no browser bar to reload or close it) |
| `checkForUpdate` | 7243 | Settings > Check for updates |
| `showUpdateReady` | 7257 | bar saying a new version is ready |
| `exitApp` | 7265 | Exit button |
| `toastMenu` | 7271 | pop-up message on the menu |
| `syncMenuSegs` | 7276 | highlight the chosen Skirmish options |
| `portraitImg` | 7400 | hero portrait picture |
| `renderCampaign` | 7402 | Campaign screen |
| `showBrief` | 7415 | mission briefing screen |
| `renderHeroes` | 7429 | Encyclopedia heroes tab |
| `paintMenuArt` | 7441 | menu background art |
| `renderEncy` | 7448 | Encyclopedia screen |
| `renderEncyList` | 7453 | Encyclopedia list for the chosen tab |
| `togglePause` | 7518 | pause or resume |

## SCREEN 8 · Sound

`src/js/ui/08-sound.js` · lines 7523 to 7779

All sounds and music are made by code (SFX).

**Things you can tweak**

- master.gain.value (0.22): overall volume.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `unlock` | 7536 | start the sound system after the first tap (phones need a tap first) |
| `note` | 7550 | play one music note |
| `noiseAt` | 7561 | drum and splash noise |
| `play` | 7607 | play a named sound effect |
| `schedule` | 7631 | keep the music playing ahead of time |
| `menuTheme` | 7660 | the menus: the asli melody slowed right down on a soft triangle, a gambus pluck under it, the sea washing in every two bars and a gong every four |
| `setMood` | 7675 | switch music between calm and battle |
| `apply` | 7677 | fade to the new music mood |
| `sfxForMsg` | 7682 | which sound goes with which game message |
| `sfxTick` | 7737 | play sounds for what happened this frame |
| `endGame` | 7749 | game over: show the result |

## SCREEN 9 · Main loop

`src/js/ui/09-main-loop.js` · lines 7780 to 7820

Starts the game and keeps it ticking: 30 rule steps a second, drawing every frame.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `frame` | 7785 | ---------------- main loop ---------------- |

## EXTRA 1 · Calm map look and new maps

`src/js/extras/01-maps.js` · lines 7821 to 8348

Add-on: the quieter ground painting and the newer skirmish maps (Highlands, Deep Jungle, Mangrove Delta...).

**Things you can tweak**

- NEWMAPS entries: each new map's layout.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `paint` | 7856 | paint the calm ground look |
| `tree` | 7903 | paint a regional tree (palm, broadleaf...) |
| `plant` | 7923 | biome plants, same palette and outline as the game's trees |
| `wildSprite` | 8007 | ---------- sprites (game pixel style: 2x bake, auto outline) ---------- |
| `foodSprite` | 8025 | durian and wild banana pictures |
| `treeFor` | 8037 | which tree type grows at a spot |
| `fields` | 8047 | ---------- the three maps: terrain fields worked out from the seed only ---------- |
| `lookOf` | 8064 | which ground look a map uses |
| `clearStarts` | 8080 | clear space around the start bases |
| `linkStarts` | 8085 | make sure both bases can reach each other |
| `genHighlands` | 8094 | make the Highlands map |
| `genJungle` | 8121 | make the Deep Jungle map |
| `genDelta` | 8137 | make the Mangrove Delta map |

## EXTRA 2 · Animals and kerbau

`src/js/extras/02-animals-kerbau.js` · lines 8349 to 8833

Add-on: fruit groves, hunt animals (kancil, boar, seladang) and kerbau herding, fattening and ploughing.

**Things you can tweak**

- KB: cap 6 kerbau each, perGran 3 per granary, fat0 200 -> fatMax 400 food over fatTime 240 s, plough 1.3 (= 30% faster farm), buy 75 gold.
- NK.durian / NK.pisang: food in the new fruit trees.
- UD.seladang atk: how hard it fights back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `bananaSprite` | 8377 | ---------- art ---------- |
| `berryArt` | 8394 | banana grove or mango tree picture |
| `kerbauSprite` | 8397 | kerbau picture: standing, grazing (head down) or ploughing (yoke and plough) |
| `haySprite` | 8441 | hay pile at the granary |
| `syahbandarSprite` | 8447 | Syahbandar Port (Melaka, Kingdom Age on): the lore hall, same size and footing as the port |
| `homeFor` | 8489 | where an owned kerbau should stand (granary, Town Centre or farm) |
| `sendHome` | 8502 | walk a kerbau to its spot |
| `kbSide` | 8566 | the quietest side of a building for kerbau spots |
| `slotIndex` | 8583 | which standing spot a kerbau gets (by arrival time) |
| `slotPoint` | 8593 | map position of a standing spot |
| `kbTick` | 8607 | kerbau each tick: claim, fatten, plough, follow |

## EXTRA 3 · Smarter AI

`src/js/extras/03-ai-plus.js` · lines 8834 to 8881

Add-on: the computer runs trade ships, claims wild kerbau, and Melaka's AI ploughs with them.

**Things you can tweak**

- AIP.traders: trade ships per difficulty (2/3/4).
- AIP.claimEvery (8 s), AIP.claimR (26 tiles): how often and how far it looks for kerbau.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aiPlus` | 8851 | the AI's extra jobs: trade ships, claim kerbau, plough |

## EXTRA 4 · Groups, facing and taps

`src/js/extras/04-groups-facing-taps.js` · lines 8882 to 9116

group tabs 1-4 and Make group, the Face button, soldiers facing their move direction, one-tap orders with two-finger deselect (or double-tap orders).

**Things you can tweak**

- TAP_MODE: 'single' (one tap orders) or 'double'; players switch it in Settings > Orders on touch (saved as seak-tapmode).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aimable` | 8904 |  |
| `startAim` | 8909 |  |
| `setTapMode` | 8923 |  |
| `twoFingerTap` | 8924 |  |
| `faceSoldiers` | 8950 | the Face button: press where the soldiers should stand, drag to face, let go |
| `toggleFace` | 8951 |  |
| `faceAim` | 8956 |  |
| `faceIcon` | 8965 | pixel icon: a turning arrow around the spot where the soldiers stand |
| `aimMove` | 8988 |  |
| `aimDir` | 8989 |  |
| `aimEnd` | 8990 |  |
| `paintAim` | 9002 |  |
| `groupUnits` | 9034 |  |
| `soldiersSel` | 9035 |  |
| `grpPanelButtons` | 9036 |  |
| `saveGroup` | 9042 |  |
| `makeGroup` | 9049 |  |
| `pickGroup` | 9054 |  |
| `updateGroupBar` | 9075 |  |
| `closeGrpMenu` | 9089 |  |
| `openGrpMenu` | 9090 |  |

## EXTRA 5 · Compact screen

`src/js/extras/05-compact-hud.js` · lines 9117 to 9227

a bigger play area: no hint strip (small clock, tips pop up then fade), slim one-row panel, icon-only command buttons, smaller foldable minimap.

**Things you can tweak**

- the CSS sizes at the top (minimap 84x63) and how long a tip stays (5 s).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `nameOf` | 9175 |  |
| `boot` | 9189 |  |
| `compactRest` | 9209 | the parts every page gets: the minimap fold button and group tabs that appear once a group exists |
