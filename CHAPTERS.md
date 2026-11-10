# Chapter map

Every chapter of the game: where it sits in `index.html`, what it does, the numbers that are safe to tweak, and every function in it with a one-line note. Made by `python3 tools/chapter_map.py`.

**How to use it:** find the chapter, open its file in `src/` (or jump to the line in `index.html`) and look for the `CHAPTER` box at the top. Functions have a `//` note just above them.

**After changing a number:** if you edited `index.html`, run `python3 tools/build.py split`. If you edited a file in `src/`, run `python3 tools/build.py`. Then open `index.html` in a browser to test.

| Chapter | File | Lines in index.html |
|---|---|---|
| [SIM 1 · Basics](#sim-1--basics) | `src/js/sim/01-core.js` | 595 to 663 |
| [SIM 2 · Units, civs and buildings](#sim-2--units-civs-and-buildings) | `src/js/sim/02-units-buildings.js` | 664 to 822 |
| [SIM 3 · Ages, resources, AI difficulty, maps](#sim-3--ages-resources-ai-difficulty-maps) | `src/js/sim/03-ages-resources-ai-maps.js` | 823 to 951 |
| [SIM 4 · Starting a game](#sim-4--starting-a-game) | `src/js/sim/04-game-setup.js` | 952 to 1398 |
| [SIM 5 · Units, costs and ages](#sim-5--units-costs-and-ages) | `src/js/sim/05-entities-ages.js` | 1399 to 1626 |
| [SIM 6 · Finding the way](#sim-6--finding-the-way) | `src/js/sim/06-paths-and-searching.js` | 1627 to 1808 |
| [SIM 7 · Orders](#sim-7--orders) | `src/js/sim/07-orders.js` | 1809 to 2156 |
| [SIM 8 · Building and training](#sim-8--building-and-training) | `src/js/sim/08-building-training.js` | 2157 to 2371 |
| [SIM 9 · Every tick: buildings, soldiers, fire](#sim-9--every-tick-buildings-soldiers-fire) | `src/js/sim/09-every-tick.js` | 2372 to 2854 |
| [SIM 10 · Gathering, repairing, damage](#sim-10--gathering-repairing-damage) | `src/js/sim/10-gather-repair-damage.js` | 2855 to 3195 |
| [SIM 11 · What you tapped, and the enemy AI](#sim-11--what-you-tapped-and-the-enemy-ai) | `src/js/sim/11-enemy-ai.js` | 3196 to 3480 |
| [ART 1 · Drawing basics](#art-1--drawing-basics) | `src/js/art/01-core.js` | 3481 to 3550 |
| [ART 2 · People](#art-2--people) | `src/js/art/02-people.js` | 3551 to 3763 |
| [ART 3 · Nature](#art-3--nature) | `src/js/art/03-nature.js` | 3764 to 3810 |
| [ART 4 · Ships](#art-4--ships) | `src/js/art/04-ships.js` | 3811 to 3982 |
| [ART 5 · Melaka and Majapahit buildings](#art-5--melaka-and-majapahit-buildings) | `src/js/art/05-melaka-majapahit-buildings.js` | 3983 to 4310 |
| [ART 6 · Ayutthaya](#art-6--ayutthaya) | `src/js/art/06-ayutthaya.js` | 4311 to 5212 |
| [ART 7 · Soldiers through the ages](#art-7--soldiers-through-the-ages) | `src/js/art/07-age-looks.js` | 5213 to 5557 |
| [ART 8 · Shared buildings and walls](#art-8--shared-buildings-and-walls) | `src/js/art/08-shared-buildings.js` | 5558 to 5779 |
| [ART 9 · Icons](#art-9--icons) | `src/js/art/09-icons.js` | 5780 to 5823 |
| [ART 10 · Ground](#art-10--ground) | `src/js/art/10-terrain.js` | 5824 to 5915 |
| [SCREEN 1 · Screen, camera, fog](#screen-1--screen-camera-fog) | `src/js/ui/01-screen-camera-fog.js` | 5916 to 6036 |
| [SCREEN 2 · Drawing the battlefield](#screen-2--drawing-the-battlefield) | `src/js/ui/02-drawing.js` | 6037 to 6537 |
| [SCREEN 3 · Selecting and giving orders](#screen-3--selecting-and-giving-orders) | `src/js/ui/03-selecting.js` | 6538 to 6739 |
| [SCREEN 4 · Touch, mouse and keys](#screen-4--touch-mouse-and-keys) | `src/js/ui/04-touch-mouse-keys.js` | 6740 to 6870 |
| [SCREEN 5 · Action panel](#screen-5--action-panel) | `src/js/ui/05-action-panel.js` | 6871 to 7107 |
| [SCREEN 6 · Top bar, game flow and saves](#screen-6--top-bar-game-flow-and-saves) | `src/js/ui/06-hud-saves.js` | 7108 to 7244 |
| [SCREEN 7 · Menus and encyclopedia](#screen-7--menus-and-encyclopedia) | `src/js/ui/07-menus-encyclopedia.js` | 7245 to 7612 |
| [SCREEN 8 · Sound](#screen-8--sound) | `src/js/ui/08-sound.js` | 7613 to 7869 |
| [SCREEN 9 · Main loop](#screen-9--main-loop) | `src/js/ui/09-main-loop.js` | 7870 to 7910 |
| [EXTRA 1 · Calm map look and new maps](#extra-1--calm-map-look-and-new-maps) | `src/js/extras/01-maps.js` | 7911 to 8439 |
| [EXTRA 2 · Animals and kerbau](#extra-2--animals-and-kerbau) | `src/js/extras/02-animals-kerbau.js` | 8440 to 8930 |
| [EXTRA 3 · Smarter AI](#extra-3--smarter-ai) | `src/js/extras/03-ai-plus.js` | 8931 to 8978 |
| [EXTRA 4 · Groups, facing and taps](#extra-4--groups-facing-and-taps) | `src/js/extras/04-groups-facing-taps.js` | 8979 to 9213 |
| [EXTRA 5 · Compact screen](#extra-5--compact-screen) | `src/js/extras/05-compact-hud.js` | 9214 to 9325 |
| [EXTRA 6 · Base footprints, wading, wet ports, house drop-off](#extra-6--base-footprints-wading-wet-ports-house-drop-off) | `src/js/extras/06-footprint-wading.js` | 9326 to 9373 |
| [EXTRA 7 · Fire Arrows research](#extra-7--fire-arrows-research) | `src/js/extras/07-fire-arrows.js` | 9374 to 9440 |
| [EXTRA 8 · Khmer](#extra-8--khmer) | `src/js/extras/08-khmer.js` | 9441 to 11585 |
| Styles | `src/css/game.css` | inside `<style>` |
| Page layout (menus, HUD) | `src/index.html` | outside the script and styles |

## SIM 1 · Basics

`src/js/sim/01-core.js` · lines 595 to 663

Map size, tile types, saving helpers and random numbers. Everything in the SIM chapters is the game rules only: no drawing, so it can run in tests.

**Things you can tweak**

- W, H: map size in tiles (96 x 72). Missions change it in their own build.
- MAXPOP: population cap (100).
- STEP: the game ticks 30 times a second. Leave it.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `snapEnc` | 619 | Sets, Maps and typed arrays survive JSON as tagged objects |
| `snapDec` | 626 | turn saved data back into Sets, Maps and arrays |
| `mulberry32` | 635 | the seeded random number maker (same seed = same map) |
| `hash2` | 646 | a fixed pseudo-random number for a tile |
| `vnoise` | 653 | smooth noise for map shapes |
| `fbm` | 660 | layered noise for natural-looking coasts and woods |

## SIM 2 · Units, civs and buildings

`src/js/sim/02-units-buildings.js` · lines 664 to 822

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
| `CV` | 715 | which civ a team plays (0 Melaka, 1 Majapahit, 3 Ayutthaya) |
| `CI` | 720 | which column of a [Melaka, Majapahit, Ayutthaya, Khmer] table to read |
| `civOk` | 722 | can this civ use this unit or building? |
| `civEntry` | 760 | the civ's name entry for a unit or building |
| `civRole` | 762 | the English role name ("Spearman") |
| `civName` | 764 | the local name ("Tombak Warrior") |
| `shortName` | 766 | the short button label |
| `enName` | 782 | the English name, when the local name differs from it |
| `btnName` | 784 | button text: local name with (English) under it |
| `fullName` | 786 | "Local name (English)" |

## SIM 3 · Ages, resources, AI difficulty, maps

`src/js/sim/03-ages-resources-ai-maps.js` · lines 823 to 951

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
| `lineKind` | 877 | which archer-line unit a civ gets in an age |
| `ageFits` | 879 | is this unit allowed in this age? |
| `costWords` | 881 | cost as words ("50 food, 20 gold") |
| `rectOfTiles` | 932 | a rectangle from tile corners |
| `rectDist` | 934 | distance from a point to a rectangle |

## SIM 4 · Starting a game

`src/js/sim/04-game-setup.js` · lines 952 to 1398

The Game class begins here. Makes the map (genMap, rivers, islands), thins trees (openWoods), places villages, bases and resources (populate), and saves/loads (snapshot).

**Things you can tweak**

- populate(): what each side starts with and where resources go.
- openWoods(): how many trees get cleared. Missions turn it off.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `init` | 961 | ======================= setup ======================= |
| `openWoods` | 998 | thin the woods so nothing gets trapped: no one-tile squeezes between trees, and no little clearings walled in by trees (a kerbau or deer could spawn in one... |
| `reserveRoute` | 1050 | keep a road clear of trees |
| `inb` | 1072 | is this tile inside the map? |
| `computeRegions` | 1074 | land masses: every land tile gets the number of the island (or river bank) it sits on |
| `regionAt` | 1092 | which island or river bank a point is on |
| `coastNear` | 1094 | a dry tile on the shore near (x, y), at least 5 tiles out: where a base's port road goes |
| `snapshot` | 1108 | Everything that can't be rebuilt goes into a plain JSON object. Lookup tables (byId, the spatial hash, path scratch, claims) and short-lived effects are... |
| `genMap` | 1135 | make the land, water and cliffs for a skirmish map |
| `genRiverlands` | 1200 | Riverlands: four rivers that meet in the middle; sandy fords are the only dry crossings |
| `genIslands` | 1224 | Big Islands: four large islands, one for each side and two to fight over, with deep channels between |
| `landConnected` | 1235 | can you walk from A to B? |
| `isLand` | 1250 | is the tile land? |
| `isWater` | 1252 | is the tile water? |
| `freeTile` | 1254 | is the tile empty land? |
| `addNode` | 1257 | put a tree, bush, gold or fish on the map |
| `removeNode` | 1266 | remove a used-up resource |
| `populate` | 1273 | place bases, villagers, resources and villages at the start |
| `addVillage` | 1366 | place a neutral Orang Laut village with its landing |
| `siteAt` | 1397 | the free village landing whose corner is at (tx, ty), if any |

## SIM 5 · Units, costs and ages

`src/js/sim/05-entities-ages.js` · lines 1399 to 1626

Adding units and buildings, working out prices (costOf), what a building can train, and climbing the ages.

**Things you can tweak**

- costOf(): where civ discounts are applied.
- applyAge(): what happens when an age finishes.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `addUnit` | 1408 | ======================= entities ======================= |
| `unitName` | 1427 | a unit's civ name |
| `costOf` | 1429 | price of a unit or building after civ discounts (MEL_LEVY, TEAMMOD) |
| `trainable` | 1437 | what a building can train for this team (unique units and ships belong to one civ) |
| `lockedTrain` | 1439 | what this building will train in a later age (shown greyed out with the age it needs) |
| `countOf` | 1444 | how many of a kind a team has |
| `canAfford` | 1451 | enough resources? |
| `pay` | 1453 | take the cost |
| `refund` | 1455 | give the cost back |
| `teamAge` | 1458 | ======================= ages ======================= |
| `ageText` | 1460 | what the next age still needs, as text |
| `ageNeedMet` | 1466 | are the next age's needed buildings built? |
| `startAge` | 1473 | begin researching the next age |
| `cancelAge` | 1484 | stop an age-up and refund it |
| `ageTick` | 1490 | count down age research |
| `applyAge` | 1497 | finish an age-up: Town Centre hp, unit looks, unlocks |
| `morphUnit` | 1510 | swap a unit for another kind in place, keeping its share of health |
| `armForAge` | 1517 | foot soldiers get mail in the Age of Commerce and more in the Golden Age; light ranged units turn elite in the Golden Age |
| `addBuilding` | 1526 | add a building to the map |
| `evict` | 1543 | push units off a new building's tiles |
| `setGateLock` | 1554 | an own gate: open lets your own people through and stops enemies, closed stops everyone |
| `walkable` | 1561 | can a unit stand on this tile? |
| `nearestFree` | 1569 | the closest empty tile |
| `unitNear` | 1586 | is another unit close to this spot? |
| `openSpot` | 1591 | centre of the nearest walkable tile nobody is standing on |
| `findSpawn` | 1607 | spawn tile next to a building, preferring the side facing 'toward' (and tiles nobody stands on) |

## SIM 6 · Finding the way

`src/js/sim/06-paths-and-searching.js` · lines 1627 to 1808

A* pathfinding, straight-line checks, and quick searches like "nearest enemy" or "units near here".

**Things you can tweak**

- Mostly leave alone. nearestEnemy() decides what idle soldiers notice.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `findPath` | 1635 | ======================= pathfinding ======================= |
| `los` | 1682 | straight line clear between two points? |
| `smooth` | 1695 | straighten a path so units don't zig-zag |
| `pathToRect` | 1706 | path to within `reach` of a rectangle (continuous coords) |
| `pathToPoint` | 1724 | find a path to a spot |
| `setPath` | 1739 | give a unit its new path |
| `stepMove` | 1744 | move a unit along its path for one tick |
| `rebuildHash` | 1765 | ======================= spatial queries ======================= |
| `unitsNear` | 1774 | all units within a radius (fast grid lookup) |
| `isVisible` | 1783 | is this spot out of the fog? |
| `nearestEnemy` | 1785 | the closest enemy a unit can see |

## SIM 7 · Orders

`src/js/sim/07-orders.js` · lines 1809 to 2156

What happens when you tap: gather, attack, board a ship, land, shelter in the Town Centre (town bell), trade, move in formation.

**Things you can tweak**

- BD.towncentre.garrison / BD.tower.garrison (chapter 2): how many villagers shelter.
- groupMove(): spacing of formations.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `idleOrder` | 1818 | ======================= orders ======================= |
| `gatherInfo` | 1820 | what a target gives and how fast, if it can be gathered |
| `orderGather` | 1827 | send a villager to gather |
| `orderAttack` | 1837 | send a unit to attack |
| `orderBoard` | 1842 | send a unit onto a ship |
| `roomIn` | 1844 | garrison: villagers shelter in a Town Centre (15) or tower (5); each one inside adds an arrow |
| `orderGarrison` | 1846 | send a villager to shelter in a building |
| `doGarrison` | 1848 | walk to the shelter and go inside |
| `shelterFor` | 1866 | nearest building with room to shelter |
| `ringBell` | 1872 | the town bell: every villager runs for the nearest shelter with room; All clear sends them back to work |
| `ungarrison` | 1888 | let sheltered villagers out |
| `allClear` | 1902 | end the town bell: everyone back to work |
| `orderLand` | 1910 | send a loaded ship to a beach |
| `shoreTile` | 1912 | the water tile next to a beach nearest (x, y), leaning towards (bx, by) |
| `waterReach` | 1927 | every water tile a ship can sail to from where it is |
| `doBoard` | 1941 | a land unit climbs aboard once it reaches the galley |
| `doLand` | 1962 | a galley sails to the beach nearest (x, y) and puts its troops ashore |
| `launchRaft` | 1993 | a Port pushes a burning raft out at the nearest enemy ship |
| `orderTrade` | 2007 | start a trade ship's route |
| `orderBuild` | 2009 | send a villager to build |
| `orderMove` | 2011 | plain move |
| `orderAMove` | 2013 | attack-move (fight anything on the way) |
| `command` | 2016 | group order from the player (or the AI). ids -> units owned by `team` |
| `groupMove` | 2107 | move a group in formation |

## SIM 8 · Building and training

`src/js/sim/08-building-training.js` · lines 2157 to 2371

Where a building may go, laying walls in lines, the build queue, population, and drop-off points.

**Things you can tweak**

- WALL_MAX (chapter 2) limits a wall drag.
- popCap(): MAXPOP from chapter 1.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `canPlace` | 2166 | ======================= building / training ======================= |
| `underPortArt` | 2190 | a port's hall stands up above its deck: nothing may be built where the hall's art goes, and a port's hall can't cover another building |
| `canFloat` | 2203 | Ayutthaya raft house moored out on the river: the whole 2x2 on water, its edge against the bank (a bamboo gangway), and open water on the river side so... |
| `houseKind` | 2218 | an Ayutthaya house set down on the water floats as a raft house; one built on land always stays a house (Iylia, 2026-11-08) |
| `waterSide` | 2220 | how many open water tiles ring a footprint |
| `wallPieceAt` | 2229 | the team's own palisade or wall (or any wall piece, gates included, unless plain) on a tile |
| `lineTiles` | 2235 | tiles of a wall line from (ax, ay) to (bx, by), stepping one axis at a time so there are no diagonal gaps |
| `placeLine` | 2246 | lay a palisade or wall line; own wall tiles on the way are kept, blocked tiles are skipped. returns {ok, n, why} |
| `placeBuilding` | 2268 | returns {ok, b, why} |
| `queueUnit` | 2288 | add a unit to a building's training queue |
| `cancelQueue` | 2302 | remove one from the queue and refund it |
| `popOf` | 2309 | how many people a team has |
| `popCap` | 2311 | housing limit |
| `dropOffs` | 2313 | buildings that take a resource |
| `nearestDrop` | 2318 | nearest drop-off for a resource |
| `nearestNode` | 2324 | nearest resource of a type; one with a free gathering slot wins over a full one |
| `freeSameKind` | 2348 | nearest other resource of the same kind as `like` (tree -> tree, farm -> own farm) with a free slot |
| `gatherCap` | 2359 | how many villagers (or boats) may work one resource at once |
| `claimsOf` | 2361 | how many villagers are on a resource |
| `countClaims` | 2363 | recount villagers per resource |
| `setRally` | 2368 | set where new units walk to |

## SIM 9 · Every tick: buildings, soldiers, fire

`src/js/sim/09-every-tick.js` · lines 2372 to 2854

Runs 30 times a second: buildings train and heal, soldiers pick fights by stance, healers heal, ships shoot, buildings burn.

**Things you can tweak**

- guardOrder(): how far Defensive soldiers chase (r: 11 tiles).
- fireOn(): who sets buildings alight and how often (archers 20% from Age 2).
- BURN (chapter 2) for fire strength.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `update` | 2382 | ======================= per-tick update ======================= |
| `doFishHouse` | 2400 | fishing from a raft house's deck: no walking to a drop-off, the catch goes straight into the store |
| `households` | 2417 | household while its paddy is worked, and a raft house while its woman fishes from the deck |
| `housePairs` | 2425 | one paddy per house: pair each finished land house with the nearest unused paddy touching it (farm id -> house) |
| `householdTick` | 2441 | Ayutthaya households pay food |
| `updateBuilding` | 2451 | one tick for a building: build, train, shoot, heal |
| `finishBuilding` | 2512 | a building is finished |
| `updateUnit` | 2534 | one tick for a unit: cooldowns, then its current order |
| `doIdle` | 2578 | what an idle unit does (look for enemies by stance) |
| `guardOrder` | 2604 | stances: 'agg' chases whatever it sees, 'def' (default) chases up to 11 tiles from its post then walks back, 'hold' never moves |
| `orderReturn` | 2606 | walk back to the post; a soldier hit on the way fights back instead of ignoring it |
| `breach` | 2608 | a land soldier whose way is walled off attacks the enemy wall piece that is most in the way to (gx, gy) |
| `doAMove` | 2619 | attack-move step |
| `doAttack` | 2635 | chase and hit a target |
| `doWander` | 2687 | animals wander |
| `doFlee` | 2699 | animals run from hunters |
| `doTrade` | 2711 | trade ship: sail to the Trading Post, load goods, sail home to the nearest Port and get paid by distance |
| `canHeal` | 2735 | healing: allies on land, hurt, and out of combat for HEAL_CALM seconds |
| `healOne` | 2737 | heal one unit |
| `healStep` | 2739 | idle healer: heal what's in reach, or walk over to the worst-hurt ally it can see |
| `doHeal` | 2763 | healer walks to and heals a target |
| `shipShot` | 2772 | a ship's main weapon: arrows (fire arrows from tier 1), boarding, or cannon (tier 2) |
| `secShot` | 2786 | secondary weapon (galley archers, flagship arrows) on its own reload |
| `fireOn` | 2799 | fire on buildings (lore/siege.md, Iylia 2026-10-25), all of it automatic: foot soldiers carry obor torches, gunners throw gunpowder fire pots (two fires at... |
| `ignite` | 2807 | set a building or wooden ship burning; stacks up to BURN.max |
| `updateBurning` | 2815 | burning buildings and ships lose hp |
| `explode` | 2842 | fire ship: burns everything hostile around it and sinks itself |

## SIM 10 · Gathering, repairing, damage

`src/js/sim/10-gather-repair-damage.js` · lines 2855 to 3195

Villagers gathering and carrying, repairing and demolishing, building, units pushing apart, and the damage formula. Also fog of war and the win/lose check.

**Things you can tweak**

- damage(): the damage formula (attack + bonus - armour).
- doRepair(): repair cost and speed.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `doGather` | 2864 | villager gathers, carries the load to a drop-off, and goes back |
| `workSpot` | 2964 | where a gatherer stands while working: inside a farm, or hugging the side of a node it walked up to |
| `doRepair` | 2994 | repair: a full fix takes 1.5x the build time for one villager (more help, faster) and costs half the building's price in wood (at least 25), paid as the... |
| `canDemolish` | 3013 | knock down your own building: nothing comes back. The Town Centre can't be (losing it loses the game) |
| `demolish` | 3015 | take down your own building |
| `doBuild` | 3024 | villager builds |
| `separate` | 3048 | push units apart so they don't stack |
| `nudge` | 3070 | small push for one unit |
| `gunFx` | 3076 | gunpowder at the muzzle: a flash, then thick pale smoke billowing forward and drifting up |
| `damage` | 3082 | the damage formula: attack + bonus - armour |
| `onKilled` | 3121 | something died: score, loot, messages |
| `msg` | 3145 | show a short message |
| `cleanup` | 3148 | remove the dead |
| `updateFx` | 3161 | age out effects |
| `updateFog` | 3175 | recompute what each side can see |
| `checkEnd` | 3191 | win or lose? |

## SIM 11 · What you tapped, and the enemy AI

`src/js/sim/11-enemy-ai.js` · lines 3196 to 3480

pick() finds what is under your finger. aiTick() is the computer player: it gathers, builds, trains, ages up, attacks and retreats.

**Things you can tweak**

- DIFF (chapter 3) is the safest place to change the AI.
- aiRetreat(): when a beaten attack falls back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pick` | 3205 | ======================= picking ======================= |
| `aiTick` | 3231 | ======================= enemy AI (Majapahit) ======================= |
| `aiFerry` | 3389 | Big Islands: board a wave onto the galleys, sail them over and land it by the enemy base; anyone already ashore over there marches on the nearest enemy... |
| `aiRetreat` | 3432 | an attack that has clearly failed comes home: under a third left, or still fighting after 3 minutes |
| `aiBuild` | 3443 | AI places a building near its Town Centre |
| `aiBuildShore` | 3456 | AI places a port on the coast |
| `aiBuildNear` | 3466 | AI places a drop-off near resources |

## ART 1 · Drawing basics

`src/js/art/01-core.js` · lines 3481 to 3550

All art is drawn by code, pixel by pixel, then cached as pictures. Team colours and the sprite helper live here.

**Things you can tweak**

- TEAMC: each team's colours. SKIN, HAIR, STEEL, WOOD: shared colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `cv` | 3503 | make a blank drawing canvas |
| `sprite` | 3505 | draw a picture once with the pixel painter P, then reuse the cached copy |
| `outlineCanvas` | 3516 | add the dark outline around a sprite |
| `whiteOf` | 3530 | a white copy of a sprite (flash when hit) |
| `disc` | 3537 | paint a filled pixel circle |
| `planks` | 3539 | paint a wooden plank wall |
| `roofGable` | 3541 | paint a sloped gable roof |
| `posts` | 3549 | paint wooden stilts or posts |

## ART 2 · People

`src/js/art/02-people.js` · lines 3551 to 3763

Villagers and soldiers: bodies, legs, weapons and the walk cycle.

**Things you can tweak**

- GOLD, LUK, LEGS: shared colours and leg poses.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `drawUnit` | 3571 | paint a Melaka/Majapahit person: body, clothes, weapon and pose |
| `unitAge` | 3699 | the team's age picks the look (AGEART, below); neutral and pre-age callers get the Kingdom Age roster |
| `unitSprite` | 3701 | the picture for a unit, with its age look |
| `civUnitSprite` | 3703 | the picture for a unit by civ (Ayutthaya has its own art) |
| `deerSprite` | 3709 | deer picture |
| `carcassSprite` | 3719 | hunted animal carcass picture |
| `hull` | 3728 | hull with upswept bow and stern; x0..x1 is the deck length, y the deck line |
| `tanja` | 3735 | tanja: slanted four-sided sail between two spars, the classic Nusantara rig |
| `boatSprite` | 3743 | fishing boat picture |

## ART 3 · Nature

`src/js/art/03-nature.js` · lines 3764 to 3810

Trees, bushes, gold, fish and deer.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `treeSprite` | 3769 | ------------------------------ nature ------------------------------ |
| `bushSprite` | 3795 | berry bush picture |
| `goldSprite` | 3803 | gold deposit picture |

## ART 4 · Ships

`src/js/art/04-ships.js` · lines 3811 to 3982

Every civ's ships, sails and hulls (NAVAL).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hull` | 3831 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 3839 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 3847 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 3855 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 3857 | paint a ship mast |
| `flag` | 3859 | paint a small flag |
| `oars` | 3861 | paint a row of oars |
| `crew` | 3863 | paint a crewman on deck |
| `flames` | 3865 | paint flames |
| `navalSprite` | 3879 | a ship picture by kind and civ |

## ART 5 · Melaka and Majapahit buildings

`src/js/art/05-melaka-majapahit-buildings.js` · lines 3983 to 4310

Town Centres, houses, barracks and other buildings for the first two civs (CIVB).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `weave` | 3997 | paint woven bamboo walls |
| `sacks` | 3999 | paint grain sacks |
| `crates` | 4001 | paint trade crates |
| `banner` | 4003 | paint a Melaka banner |
| `melakaBuilding` | 4006 | a Melaka building picture |
| `neutralSite` | 4056 | Neutral map sites. Pangkalan can only be built on a landing next to a settlement. |
| `brick` | 4084 | paint red brick courses |
| `meru` | 4086 | meru: stacked black thatch tiers, each narrower than the one below |
| `surya` | 4088 | sun of Majapahit (Surya Majapahit) emblem |
| `mjBanner` | 4090 | paint a Majapahit banner |
| `majapahitBuilding` | 4093 | a Majapahit building picture |
| `ijukRoof` | 4150 | black ijuk gable roof with a thick dark edge |
| `majapahitBase` | 4153 | Majapahit Town Centre and palace base |
| `pier` | 4195 | pier() and rack() from buildings-mainland.js, used by the Majapahit port and barracks |
| `rack` | 4197 | paint a drying rack |
| `drawHealer` | 4207 | paint a healer (Tabib, Acaraki, Mo) |
| `healerSprite` | 4254 | healer picture |
| `herbBed` | 4262 | paint a herb bed |
| `healerBuilding` | 4265 | healer building picture (Rumah Tabib, Patirthan) |

## ART 6 · Ayutthaya

`src/js/art/06-ayutthaya.js` · lines 4311 to 5212

All Ayutthaya art: people, elephants, buildings and boats (AYART).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ayUnit` | 4335 | an Ayutthaya unit picture |
| `ayuPerson` | 4343 | paint an Ayutthaya person |
| `ayuElephant` | 4461 | ---------- Chang Suek: war elephant, 32x32, facing right ---------- |
| `ayuCannon` | 4532 | ---------- bronze cannon on a field carriage, 26x18, with a purple pennant ---------- |
| `ayRoofTri` | 4572 | steep roof triangle seen from the gable end: tile courses, a coloured rim along both slopes |
| `ayChofa` | 4580 | chofa: slender gold hook rising from the gable apex |
| `ayHangHong` | 4582 | hang hong: small upturned gold curls at the lower ends of the gable boards |
| `ayGable` | 4584 | Thai gable: tiled triangle, dark gable face framed by gold pan lom boards, chofa on top, hang hong at the foot |
| `ayEave` | 4602 | eave skirt: a lower roof tier spreading out under a gable |
| `ayWhite` | 4610 | white-washed brick: lime plaster with faint courses and weathering |
| `ayLeaf` | 4616 | bai sema merlon: a leaf shape with a point on top |
| `ayBanner` | 4621 | purple thong banner with a little white elephant |
| `ayTeak` | 4627 | teak panel wall (fa pakon): framed panels |
| `ayHouse` | 4633 | small Ruean Thai, used by the house and the raft house |
| `ayBuilding` | 4653 | an Ayutthaya building picture |
| `hull` | 4794 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 4802 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 4810 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 4818 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 4820 | paint a ship mast |
| `flag` | 4822 | paint a small flag |
| `oars` | 4824 | paint a row of oars |
| `crew` | 4826 | paint a crewman on deck |
| `flames` | 4828 | paint flames |
| `navalSprite` | 4842 | a ship picture by kind and civ |
| `junk` | 4961 | Battened junk sail: a tall rectangle with battens and a rounded top-front corner. |
| `prow` | 4966 | Tall curving prow (Thai and Khmer barges). |
| `eye` | 4968 | Painted bow eye, the mark of Vietnamese boats. |
| `pavilion` | 4970 | Pavilion with a tiered pointed roof. |
| `mainlandShip` | 4976 | a Khmer/Dai Viet ship picture (battle demos) |
| `womanSprite` | 5090 | Phrai Ying: a village woman of Ayutthaya. Short hair (as European visitors noted of Siamese women), a sabai cloth across the chest, an ankle-length pha sin,... |
| `aySpears` | 5128 | rack of spears with red tassels |
| `ayShield` | 5130 | small purple round shield with a gold boss |
| `ayBuildingX` | 5132 | Ayutthaya barracks, port, granary, teak store and farm pictures |
| `unit` | 5200 | an Ayutthaya unit picture (falls back to the shared art) |
| `building` | 5208 | Ayutthaya building picture (shared entry point) |
| `ship` | 5210 | Ayutthaya ship picture (shared entry point) |

## ART 7 · Soldiers through the ages

`src/js/art/07-age-looks.js` · lines 5213 to 5557

How soldiers' dress changes each age (AGEART), plus guns and armour (XU).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hexRGB` | 5229 | Melaka age progression mockups. Runs in the game page after art.js (and heroes-art.js). melAge(kind, age, anim, f): keris / tombak / archer drawn with the... |
| `recolor` | 5231 | swap colours on a finished picture |
| `melAge` | 5239 | Melaka soldier picture for a given age |
| `melGunner` | 5265 | Melaka gunner picture |
| `melMeriam` | 5289 | Melaka bronze cannon picture |
| `xuFlash` | 5319 | muzzle flash pointing right, x = first pixel past the muzzle, y = bore centre |
| `xuSmoke` | 5322 | a few puffs drifting up from (x, y) |
| `xUnit` | 5328 | extra unit pictures (guns, armour) |
| `mpAge` | 5445 | ---------- Majapahit: the game's Majapahit drawing, a kere (mail coat) from age 2, a bronze helmet in age 3 ---------- |
| `helmet` | 5464 | paint a bronze helmet |
| `mpMusket` | 5469 | the Bedil Kraton (Golden Age): the bedil gunner in a kere with a gold belt |
| `lightAge` | 5479 | ---------- light ranged units: levy cloth in age 1, a gold sash and band in age 4, never mail ---------- |
| `canvasRecolor` | 5490 | copy a picture with colours swapped |
| `ayAge` | 5498 | Ayutthaya soldier picture for a given age |
| `unit` | 5517 | pick the right age look for any civ's soldier |
| `shipSprite` | 5542 | the picture for a ship on the map |
| `raftSprite` | 5544 | rakit api: a bamboo raft heaped with dry fronds and husks, already alight |
| `shipAnchor` | 5556 | where a ship picture sits on its tile |

## ART 8 · Shared buildings and walls

`src/js/art/08-shared-buildings.js` · lines 5558 to 5779

Walls, gates, farms, ports and other buildings every civ shares, and wall styles by age.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `wallSprite` | 5566 | one wall tile. mask: 1 N, 2 E, 4 S, 8 W neighbours of the same side; open: a gate with friends close by. Palisade: sharpened logs. Melaka Kubu: planked... |
| `sawahSprite` | 5692 | Sawah: stepped rice terraces with water between the rows, earth bunds and a dangau hut (lore/scenes/bld-extra.js, fitted to 3 tiles) |
| `buildingSprite` | 5716 | the picture for a building |
| `civBuildingSprite` | 5718 | the picture for a building by civ |

## ART 9 · Icons

`src/js/art/09-icons.js` · lines 5780 to 5823

Small pictures for buttons, and marks on the ground.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `iconSprite` | 5785 | ------------------------------ icons & decals ------------------------------ |
| `rubbleSprite` | 5814 | rubble left by a destroyed building |

## ART 10 · Ground

`src/js/art/10-terrain.js` · lines 5824 to 5915

Grass, sand, water and cliffs (PAL is the ground palette).

**Things you can tweak**

- PAL: ground colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `buildTerrain` | 5837 | paint the whole ground map once at the start |
| `buildMiniBase` | 5908 | paint the minimap ground |

## SCREEN 1 · Screen, camera, fog

`src/js/ui/01-screen-camera-fog.js` · lines 5916 to 6036

Everything the player sees and touches starts here: the canvas, the camera, the fog of war and the build list.

**Things you can tweak**

- setZoom(): zoom limits, clamp(z, 0.38, 2.6). 0.38 = furthest out.
- clampCam(): how far past the map edge you can pan (0.3 and 0.35 of the screen).
- BUILD_ORDER, ECO_BLD: the order of build buttons and which tab they sit in.
- FORMS: formation types.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `clamp` | 5950 | ---------------- helpers ---------------- |
| `s2w` | 5952 | screen point to map point |
| `w2s` | 5954 | map point to screen point |
| `fmtTime` | 5956 | seconds as m:ss |
| `dataURL` | 5959 | picture as an image link (cached) |
| `fitIcon` | 5964 | shrink a sprite into an icon |
| `unitIcon` | 5973 | button icon for a unit |
| `bldIcon` | 5975 | button icon for a building |
| `resIcon` | 5981 | icon for food, wood or gold |
| `nodeIcon` | 5983 | icon for a resource on the map |
| `toast` | 5988 | pop-up message on screen |
| `resize` | 5996 | ---------------- view and camera ---------------- |
| `clampCam` | 6004 | the camera may run a little past each edge, so the corners can be brought out from under the HUD |
| `setZoom` | 6010 | zoom the camera, kept between 0.38 (far) and 2.6 (close) |
| `centerOn` | 6017 | move the camera to a tile |
| `inView` | 6019 | is this on screen? |
| `initFog` | 6022 | ---------------- fog ---------------- |
| `refreshFog` | 6027 | repaint the fog layer |

## SCREEN 2 · Drawing the battlefield

`src/js/ui/02-drawing.js` · lines 6037 to 6537

Draws ground, buildings, units, health bars, fire, arrows and the minimap every frame, sorted so nearer things cover farther ones.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ell` | 6043 | ---------------- drawing ---------------- |
| `shadow` | 6045 | soft shadow under a unit |
| `hpBar` | 6047 | health bar |
| `isSel` | 6052 | is this selected? |
| `toolFor` | 6055 | which tool a villager holds for its job |
| `paintUnit` | 6062 | draw one unit |
| `torchFor` | 6110 | foot soldiers burn buildings with an obor (torch) rather than hacking at them with their weapons (lore/siege.md) |
| `paintTorch` | 6116 | draw the obor torch pose |
| `paintNode` | 6133 | draw a resource |
| `buildWallGrid` | 6157 | map of where wall pieces are |
| `wallMask` | 6163 | which neighbours a wall piece joins |
| `raftSide` | 6170 | which way a raft house leans to the water |
| `paintRaftHouse` | 6177 | draw a raft house |
| `paintFisher` | 6204 | draw the woman fishing from a raft house |
| `paintBuilding` | 6217 | draw one building with fire, flags and bars |
| `paintFx` | 6247 | draw effects (corpses, sparks) |
| `paintTop` | 6265 | draw top-layer effects (gun flashes) |
| `drawArrow` | 6309 | draw arrows and bullets in flight |
| `jobTarget` | 6338 | where a unit is headed for its job (gather / build / hunt target), if anywhere |
| `targetRing` | 6344 | ring around a target |
| `paintJobs` | 6350 | dashed trail from selected workers to their job |
| `paintMarkers` | 6365 | tap markers on the ground |
| `paintPlacement` | 6384 | the building ghost while placing |
| `paintLinePlacement` | 6404 | a wall line: every tile green (new), grey (already walled) or red (blocked), with the count and cost by its end |
| `placeButtons` | 6428 | touch placement: a ✓ (build) and ✗ (cancel) button under the ghost; their screen spots are kept for hit tests |
| `paintPlaceButtons` | 6435 | the Place/Cancel buttons on the ghost |
| `render` | 6447 | draw the whole frame |
| `drawMini` | 6513 | draw the minimap |

## SCREEN 3 · Selecting and giving orders

`src/js/ui/03-selecting.js` · lines 6538 to 6739

Turns taps into selections and orders (tap a unit, box select, double tap for all of a kind).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `selUnits` | 6543 | ---------------- selection and orders ---------------- |
| `select` | 6545 | change the selection |
| `addMarker` | 6547 | show where you tapped |
| `issue` | 6549 | give the selected units an order at a spot |
| `canRally` | 6565 | can this building have a rally point? |
| `setRallyFor` | 6567 | set a rally point from a tap |
| `contextCommand` | 6573 | the right order for what you tapped (gather, attack, repair...) |
| `selectSameKind` | 6579 | select all units of this kind on screen |
| `placeAt` | 6584 | move the building ghost |
| `nearestSite` | 6590 | nearest free village landing (trading post) |
| `tryPlace` | 6599 | place the building if the spot is OK |
| `startPlace` | 6616 | start placing a building |
| `nearWallPiece` | 6642 | nearest wall piece (for gates) |
| `findSpot` | 6648 | a good free spot for a building |
| `clearRallyTap` | 6659 | cancel a pending rally tap |
| `handleTap` | 6661 | what one tap does |
| `boxSelect` | 6709 | select everything inside a dragged box |
| `idleVillagers` | 6720 | list idle villagers |
| `cycleIdle` | 6723 | jump to the next idle villager |
| `selectArmy` | 6728 | select all soldiers |
| `selectNavy` | 6734 | every warship (fishing boats and trade ships keep working) |

## SCREEN 4 · Touch, mouse and keys

`src/js/ui/04-touch-mouse-keys.js` · lines 6740 to 6870

Finger drag to scroll, pinch to zoom, hold-drag to box select, mouse wheel, keyboard keys.

**Things you can tweak**

- The pinch zoom limit is also here (0.38, 2.6): keep it the same as setZoom().

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pos` | 6747 | ---------------- pointer input ---------------- |
| `endPointer` | 6812 | finger or mouse lifted: tap, drag or box |
| `miniGo` | 6836 | tap the minimap to move the camera |

## SCREEN 5 · Action panel

`src/js/ui/05-action-panel.js` · lines 6871 to 7107

The panel at the bottom: build tabs, train buttons, stance, bell, repair, demolish.

**Things you can tweak**

- STANCES: the stance names and order.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `costHTML` | 6880 | cost shown with icons |
| `costTitle` | 6885 | cost as text |
| `cmdBtn` | 6887 | make one panel button |
| `lockBtn` | 6891 | a button for something a later age brings: greyed out, tapping it says which age |
| `ageBtn` | 6896 | the Town Centre's age-up button: the next age and its cost, or the work under way (tap to call it off) |
| `describeOrder` | 6903 | what a unit is doing, as text |
| `bldNote` | 6926 | help line for a selected building |
| `pName` | 6940 | name line in the panel |
| `buildPanel` | 6942 | build the bottom panel for the selection |
| `structKey` | 7034 | panel layout key (rebuild only when it changes) |
| `updatePanel` | 7041 | refresh numbers on the panel |
| `stanceOfSel` | 7057 | stance of the selected soldiers |
| `cycleStance` | 7059 | Stance button |
| `cycleFormation` | 7067 | Formation button |
| `stopSel` | 7069 | Stop button |

## SCREEN 6 · Top bar, game flow and saves

`src/js/ui/06-hud-saves.js` · lines 7108 to 7244

Resource bar, messages, pause, win/lose screens, autosave and the 3 save slots.

**Things you can tweak**

- SAVE_KEY / SLOTS_KEY: where saves are kept on the phone.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hintText` | 7117 | the hint line at the top |
| `updateHud` | 7126 | refresh the top bar |
| `showOv` | 7143 | ---------------- game flow ---------------- |
| `startGame` | 7148 | start a skirmish |
| `enterGame` | 7157 | shared by a new game and a resumed one: rebuild the view state around G |
| `syncSpeedButtons` | 7165 | show which game speed is on |
| `lsGet` | 7170 | storage can be missing (private windows, previews): the game still runs, it just can't resume |
| `lsSet` | 7172 | save to the phone's storage |
| `lsDel` | 7174 | delete from the phone's storage |
| `saveSettings` | 7178 | save settings |
| `slotMetas` | 7185 | what is in the 3 save slots |
| `slotPick` | 7187 | which slot a new game uses |
| `slotWrite` | 7189 | write a save slot |
| `slotRead` | 7191 | read a save slot |
| `slotDel` | 7193 | delete a save slot |
| `slotNewest` | 7195 | most recent save |
| `slotLine` | 7197 | save slot label text |
| `saveGame` | 7201 | save the current game |
| `openSlot` | 7208 | a mission save opens its own page, which loads it |
| `continueGame` | 7215 | load a saved game |
| `quitToMenu` | 7224 | save and go to the menu |
| `discardGame` | 7226 | leave without keeping anything from this game: every slot it wrote goes back to what it held before |
| `confirmBox` | 7234 | a yes/no box over whatever is on screen |

## SCREEN 7 · Menus and encyclopedia

`src/js/ui/07-menus-encyclopedia.js` · lines 7245 to 7612

Home screen, Skirmish setup, Campaign and Battles lists, mission briefings, Encyclopedia text, Settings.

**Things you can tweak**

- BUILD: the version shown in Settings.
- ENCY_UNITS / ENCY_BLDS / ENCY_CIVS / ENCY_GUIDE: encyclopedia text.
- CAMPAIGNS / MISSIONS: mission lists, briefings and which are unlocked.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `showMenu` | 7260 | show a menu screen |
| `delAsk` | 7275 | two-tap Delete on the home screen |
| `refreshHome` | 7281 | update the home screen |
| `renderSlots` | 7290 | Load game screen |
| `setVerNote` | 7298 | version, updates and exit (the installed app has no browser bar to reload or close it) |
| `checkForUpdate` | 7300 | Settings > Check for updates |
| `showUpdateReady` | 7314 | bar saying a new version is ready |
| `exitApp` | 7322 | Exit button |
| `toastMenu` | 7328 | pop-up message on the menu |
| `syncMenuSegs` | 7333 | highlight the chosen Skirmish options |
| `portraitImg` | 7490 | hero portrait picture |
| `renderCampaign` | 7492 | Campaign screen |
| `showBrief` | 7505 | mission briefing screen |
| `renderHeroes` | 7519 | Encyclopedia heroes tab |
| `paintMenuArt` | 7531 | menu background art |
| `renderEncy` | 7538 | Encyclopedia screen |
| `renderEncyList` | 7543 | Encyclopedia list for the chosen tab |
| `togglePause` | 7608 | pause or resume |

## SCREEN 8 · Sound

`src/js/ui/08-sound.js` · lines 7613 to 7869

All sounds and music are made by code (SFX).

**Things you can tweak**

- master.gain.value (0.22): overall volume.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `unlock` | 7626 | start the sound system after the first tap (phones need a tap first) |
| `note` | 7640 | play one music note |
| `noiseAt` | 7651 | drum and splash noise |
| `play` | 7697 | play a named sound effect |
| `schedule` | 7721 | keep the music playing ahead of time |
| `menuTheme` | 7750 | the menus: the asli melody slowed right down on a soft triangle, a gambus pluck under it, the sea washing in every two bars and a gong every four |
| `setMood` | 7765 | switch music between calm and battle |
| `apply` | 7767 | fade to the new music mood |
| `sfxForMsg` | 7772 | which sound goes with which game message |
| `sfxTick` | 7827 | play sounds for what happened this frame |
| `endGame` | 7839 | game over: show the result |

## SCREEN 9 · Main loop

`src/js/ui/09-main-loop.js` · lines 7870 to 7910

Starts the game and keeps it ticking: 30 rule steps a second, drawing every frame.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `frame` | 7875 | ---------------- main loop ---------------- |

## EXTRA 1 · Calm map look and new maps

`src/js/extras/01-maps.js` · lines 7911 to 8439

Add-on: the quieter ground painting and the newer skirmish maps (Highlands, Deep Jungle, Mangrove Delta...).

**Things you can tweak**

- NEWMAPS entries: each new map's layout.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `paint` | 7946 | paint the calm ground look |
| `tree` | 7993 | paint a regional tree (palm, broadleaf...) |
| `plant` | 8013 | biome plants, same palette and outline as the game's trees |
| `wildSprite` | 8097 | ---------- sprites (game pixel style: 2x bake, auto outline) ---------- |
| `foodSprite` | 8115 | durian and wild banana pictures |
| `treeFor` | 8127 | which tree type grows at a spot |
| `fields` | 8137 | ---------- the three maps: terrain fields worked out from the seed only ---------- |
| `lookOf` | 8154 | which ground look a map uses |
| `clearStarts` | 8170 | clear space around the start bases |
| `linkStarts` | 8175 | make sure both bases can reach each other |
| `genHighlands` | 8184 | make the Highlands map |
| `genJungle` | 8211 | make the Deep Jungle map |
| `genDelta` | 8227 | make the Mangrove Delta map |

## EXTRA 2 · Animals and kerbau

`src/js/extras/02-animals-kerbau.js` · lines 8440 to 8930

Add-on: fruit groves, hunt animals (kancil, boar, seladang) and kerbau herding, fattening and ploughing.

**Things you can tweak**

- KB: cap 6 kerbau each, perGran 3 per granary, fat0 200 -> fatMax 400 food over fatTime 240 s, plough 1.3 (= 30% faster farm), buy 75 gold.
- NK.durian / NK.pisang: food in the new fruit trees.
- UD.seladang atk: how hard it fights back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `bananaSprite` | 8468 | ---------- art ---------- |
| `berryArt` | 8485 | banana grove or mango tree picture |
| `kerbauSprite` | 8488 | kerbau picture: standing, grazing (head down) or ploughing (yoke and plough) |
| `haySprite` | 8532 | hay pile at the granary |
| `syahbandarSprite` | 8538 | Syahbandar Port (Melaka, Kingdom Age on): the lore hall, same size and footing as the port |
| `homeFor` | 8580 | where an owned kerbau should stand (granary, Town Centre or farm) |
| `sendHome` | 8593 | walk a kerbau to its spot |
| `kbSide` | 8657 | the quietest side of a building for kerbau spots |
| `slotIndex` | 8674 | which standing spot a kerbau gets (by arrival time) |
| `slotPoint` | 8684 | map position of a standing spot |
| `kbTick` | 8699 | kerbau each tick: claim, fatten, plough, follow |

## EXTRA 3 · Smarter AI

`src/js/extras/03-ai-plus.js` · lines 8931 to 8978

Add-on: the computer runs trade ships, claims wild kerbau, and Melaka's AI ploughs with them.

**Things you can tweak**

- AIP.traders: trade ships per difficulty (2/3/4).
- AIP.claimEvery (8 s), AIP.claimR (26 tiles): how often and how far it looks for kerbau.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aiPlus` | 8948 | the AI's extra jobs: trade ships, claim kerbau, plough |

## EXTRA 4 · Groups, facing and taps

`src/js/extras/04-groups-facing-taps.js` · lines 8979 to 9213

group tabs 1-4 and Make group, the Face button, soldiers facing their move direction, one-tap orders with two-finger deselect (or double-tap orders).

**Things you can tweak**

- TAP_MODE: 'single' (one tap orders) or 'double'; players switch it in Settings > Orders on touch (saved as seak-tapmode).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aimable` | 9001 |  |
| `startAim` | 9006 |  |
| `setTapMode` | 9020 |  |
| `twoFingerTap` | 9021 |  |
| `faceSoldiers` | 9047 | the Face button: press where the soldiers should stand, drag to face, let go |
| `toggleFace` | 9048 |  |
| `faceAim` | 9053 |  |
| `faceIcon` | 9062 | pixel icon: a turning arrow around the spot where the soldiers stand |
| `aimMove` | 9085 |  |
| `aimDir` | 9086 |  |
| `aimEnd` | 9087 |  |
| `paintAim` | 9099 |  |
| `groupUnits` | 9131 |  |
| `soldiersSel` | 9132 |  |
| `grpPanelButtons` | 9133 |  |
| `saveGroup` | 9139 |  |
| `makeGroup` | 9146 |  |
| `pickGroup` | 9151 |  |
| `updateGroupBar` | 9172 |  |
| `closeGrpMenu` | 9186 |  |
| `openGrpMenu` | 9187 |  |

## EXTRA 5 · Compact screen

`src/js/extras/05-compact-hud.js` · lines 9214 to 9325

a bigger play area: no hint strip (small clock, tips pop up then fade), slim one-row panel, icon-only command buttons, smaller foldable minimap.

**Things you can tweak**

- the CSS sizes at the top (minimap 84x63) and how long a tip stays (5 s).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `nameOf` | 9273 |  |
| `boot` | 9287 |  |
| `compactRest` | 9307 | the parts every page gets: the minimap fold button and group tabs that appear once a group exists |

## EXTRA 6 · Base footprints, wading, wet ports, house drop-off

`src/js/extras/06-footprint-wading.js` · lines 9326 to 9373

buildings stand on their base only (the roof hangs over the tiles behind), land units wade through shallow water in Skirmish, a Port's deck may sit on shallow water, Ayutthaya paddy farmers drop rice at their paired house, and the panel button tidy-ups (centred icons, red Demolish, one-row queue).

**Things you can tweak**

- FOOT: how many tile rows each building really stands on.
- WADE / PORTWET: switch wading and ports-on-shallows off. Missions keep their own water rules (no wading).
- HOUSEDROP: Ayutthaya farmers drop rice at their house.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `wadeOn` | 9341 | wading is for Skirmish; campaign missions and battles (they have setupObj) keep their own water rules |

## EXTRA 7 · Fire Arrows research

`src/js/extras/07-fire-arrows.js` · lines 9374 to 9440

Panah Api (lore/siege.md): from Age 2 the Barracks can research Fire Arrows once. Archers then do extra damage to buildings and set them alight more often. Torches on melee hits stay automatic.

**Things you can tweak**

- FIRE_ARROWS.cost / time / age: price, research seconds and the age it opens in.
- FIRE_ARROWS.bld: extra damage per arrow on a building; FIRE_ARROWS.chance: chance an arrow lights it (20% before).
- FIRE_ARROWS.aiGold: gold the computer keeps spare before it researches.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `fireArrowBtn` | 9434 | the Barracks button: research, progress, or done |

## EXTRA 8 · Khmer

`src/js/extras/08-khmer.js` · lines 9441 to 11585

the fourth civ (civ id 4, column 3 of the per-civ tables). Groundwork: every per-civ table gets a Khmer column. Until Khmer's own roster lands, a missing Khmer value copies Melaka's, so nothing breaks.

**Things you can tweak**

- KHMER: Khmer's own values; anything set here wins over the Melaka copy.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `barayPlots` | 9473 | the 8 plots (top-left tile of a 2 x 2 farm): 3 above, 3 below, 1 at each end |
| `barayPlotOf` | 9478 | which plot of Baray b this farm stands on (-1: none) |
| `plotFarm` | 9483 | the farm standing on a plot, if any |
| `weave` | 9508 |  |
| `sacks` | 9509 |  |
| `crates` | 9510 |  |
| `banner` | 9511 |  |
| `melakaBuilding` | 9513 |  |
| `neutralSite` | 9563 | Neutral map sites. Pangkalan can only be built on a landing next to a settlement. |
| `brick` | 9591 |  |
| `meru` | 9593 | meru: stacked black thatch tiers, each narrower than the one below |
| `surya` | 9595 | sun of Majapahit (Surya Majapahit) emblem |
| `mjBanner` | 9596 |  |
| `majapahitBuilding` | 9598 |  |
| `ijukRoof` | 9655 | black ijuk gable roof with a thick dark edge |
| `majapahitBase` | 9657 |  |
| `hull` | 9705 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 9713 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 9721 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 9729 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 9730 |  |
| `flag` | 9731 |  |
| `oars` | 9732 |  |
| `crew` | 9733 |  |
| `flames` | 9734 |  |
| `navalSprite` | 9747 |  |
| `drawCivUnit` | 9852 |  |
| `civUnitSprite` | 9938 |  |
| `elephantSprite` | 9943 | Chang Suek: Ayutthaya war elephant with a mahout and a spearman in a gilded howdah. 28x26 logical. |
| `drawKhmerUnit` | 9979 |  |
| `khmerUnitSprite` | 10023 |  |
| `ballistaElephantSprite` | 10028 | Ballista Elephant: elephant with a large double-bow crossbow on its back, crewed by two. 28x26 logical. |
| `khmerCanoeSprite` | 10054 | River war canoe from the Bayon naval relief: long, low, many paddlers, a carved prow. 32x18 logical. |
| `junk` | 10082 | Battened junk sail: a tall rectangle with battens and a rounded top-front corner. |
| `prow` | 10087 | Tall curving prow (Thai and Khmer barges). |
| `eye` | 10089 | Painted bow eye, the mark of Vietnamese boats. |
| `pavilion` | 10091 | Pavilion with a tiered pointed roof. |
| `mainlandShip` | 10096 |  |
| `civTeam` | 10222 |  |
| `thaiRoof` | 10228 | Thai roof: steep layered gable with chofa horns at the ridge ends |
| `vietRoof` | 10234 | Vietnamese roof: low tiled hip roof with upturned corners |
| `prasat` | 10241 | Khmer prasat tower: stepped sandstone tower with a lotus-bud top |
| `mainlandBuilding` | 10246 |  |
| `pier` | 10333 |  |
| `rack` | 10334 |  |
| `mainlandBase` | 10336 |  |
| `kmHash` | 10424 | deterministic hash for pit/texture placement |
| `kmLaterite` | 10426 | laterite blocks: rusty orange-brown, staggered courses, dark pits |
| `kmSand` | 10441 | sandstone: smooth grey-tan ashlar |
| `kmCoping` | 10451 | sandstone coping / cornice band |
| `kmPrasat` | 10453 | corncob prasat tower: a body with a false door, then stacked tiers tapering to a lotus bud |
| `kmFace` | 10477 | carved Bayon face: crown, brows, closed eyes, broad nose, calm smile. s = 1 small (7x9) or 2 large (11x13) |
| `kmNaga` | 10499 | naga balustrade: a stone serpent body on little posts, ending in a fanned multi-headed hood |
| `kmBanner` | 10509 | blue team banner with a gold border and a small gold lotus |
| `kmTileRoof` | 10511 | steep tile roof with ribbed tile channels and upswept gold gable horns |
| `kmBuilding` | 10522 |  |
| `cartBallistaSprite` | 10640 |  |
| `kmHash` | 10688 | deterministic hash for pit/texture placement |
| `kmLaterite` | 10690 | laterite blocks: rusty orange-brown, staggered courses, dark pits |
| `kmSand` | 10705 | sandstone: smooth grey-tan ashlar |
| `kmCoping` | 10715 | sandstone coping / cornice band |
| `kmPrasat` | 10717 | corncob prasat tower: a body with a false door, then stacked tiers tapering to a lotus bud |
| `kmFace` | 10741 | carved Bayon face: crown, brows, closed eyes, broad nose, calm smile. s = 1 small (7x9) or 2 large (11x13) |
| `kmNaga` | 10763 | naga balustrade: a stone serpent body on little posts, ending in a fanned multi-headed hood |
| `kmBanner` | 10773 | blue team banner with a gold border and a small gold lotus |
| `kmTileRoof` | 10775 | steep tile roof with ribbed tile channels and upswept gold gable horns |
| `kmBuilding` | 10786 |  |
| `bxPaddy` | 10907 | rice paddy shared by both: water, bunds, rows of rice that grow with the level |
| `bxSpears` | 10919 | a rack of spears (tassel colour per civ) |
| `kmBuildingX` | 10921 |  |
| `building` | 10974 |  |
| `kmUnit` | 11093 |  |
| `kmuPerson` | 11101 |  |
| `kmuDoubleBow` | 11229 | Each bow is an arc with its tips bent back; the string runs to the nock (drawn) or straight across (shot). |
| `kmuCrew` | 11245 | small seated/standing figure: head at y, body below |
| `kmuElephant` | 11253 |  |
| `kmuCart` | 11296 |  |
| `guardUnit` | 11333 |  |
| `gduPerson` | 11338 |  |
| `kmShipFor` | 11454 |  |
| `baraySprite` | 11474 |  |
| `barayBasket` | 11501 | a basket of rice in logical pixels of the Baray art |
