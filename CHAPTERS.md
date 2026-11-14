# Chapter map

Every chapter of the game: where it sits in `index.html`, what it does, the numbers that are safe to tweak, and every function in it with a one-line note. Made by `python3 tools/chapter_map.py`.

**How to use it:** find the chapter, open its file in `src/` (or jump to the line in `index.html`) and look for the `CHAPTER` box at the top. Functions have a `//` note just above them.

**After changing a number:** if you edited `index.html`, run `python3 tools/build.py split`. If you edited a file in `src/`, run `python3 tools/build.py`. Then open `index.html` in a browser to test.

| Chapter | File | Lines in index.html |
|---|---|---|
| [SIM 1 · Basics](#sim-1--basics) | `src/js/sim/01-core.js` | 603 to 671 |
| [SIM 2 · Units, civs and buildings](#sim-2--units-civs-and-buildings) | `src/js/sim/02-units-buildings.js` | 672 to 830 |
| [SIM 3 · Ages, resources, AI difficulty, maps](#sim-3--ages-resources-ai-difficulty-maps) | `src/js/sim/03-ages-resources-ai-maps.js` | 831 to 959 |
| [SIM 4 · Starting a game](#sim-4--starting-a-game) | `src/js/sim/04-game-setup.js` | 960 to 1406 |
| [SIM 5 · Units, costs and ages](#sim-5--units-costs-and-ages) | `src/js/sim/05-entities-ages.js` | 1407 to 1634 |
| [SIM 6 · Finding the way](#sim-6--finding-the-way) | `src/js/sim/06-paths-and-searching.js` | 1635 to 1816 |
| [SIM 7 · Orders](#sim-7--orders) | `src/js/sim/07-orders.js` | 1817 to 2164 |
| [SIM 8 · Building and training](#sim-8--building-and-training) | `src/js/sim/08-building-training.js` | 2165 to 2379 |
| [SIM 9 · Every tick: buildings, soldiers, fire](#sim-9--every-tick-buildings-soldiers-fire) | `src/js/sim/09-every-tick.js` | 2380 to 2862 |
| [SIM 10 · Gathering, repairing, damage](#sim-10--gathering-repairing-damage) | `src/js/sim/10-gather-repair-damage.js` | 2863 to 3203 |
| [SIM 11 · What you tapped, and the enemy AI](#sim-11--what-you-tapped-and-the-enemy-ai) | `src/js/sim/11-enemy-ai.js` | 3204 to 3488 |
| [ART 1 · Drawing basics](#art-1--drawing-basics) | `src/js/art/01-core.js` | 3489 to 3558 |
| [ART 2 · People](#art-2--people) | `src/js/art/02-people.js` | 3559 to 3771 |
| [ART 3 · Nature](#art-3--nature) | `src/js/art/03-nature.js` | 3772 to 3818 |
| [ART 4 · Ships](#art-4--ships) | `src/js/art/04-ships.js` | 3819 to 3990 |
| [ART 5 · Melaka and Majapahit buildings](#art-5--melaka-and-majapahit-buildings) | `src/js/art/05-melaka-majapahit-buildings.js` | 3991 to 4318 |
| [ART 6 · Ayutthaya](#art-6--ayutthaya) | `src/js/art/06-ayutthaya.js` | 4319 to 5220 |
| [ART 7 · Soldiers through the ages](#art-7--soldiers-through-the-ages) | `src/js/art/07-age-looks.js` | 5221 to 5565 |
| [ART 8 · Shared buildings and walls](#art-8--shared-buildings-and-walls) | `src/js/art/08-shared-buildings.js` | 5566 to 5787 |
| [ART 9 · Icons](#art-9--icons) | `src/js/art/09-icons.js` | 5788 to 5831 |
| [ART 10 · Ground](#art-10--ground) | `src/js/art/10-terrain.js` | 5832 to 5923 |
| [SCREEN 1 · Screen, camera, fog](#screen-1--screen-camera-fog) | `src/js/ui/01-screen-camera-fog.js` | 5924 to 6044 |
| [SCREEN 2 · Drawing the battlefield](#screen-2--drawing-the-battlefield) | `src/js/ui/02-drawing.js` | 6045 to 6545 |
| [SCREEN 3 · Selecting and giving orders](#screen-3--selecting-and-giving-orders) | `src/js/ui/03-selecting.js` | 6546 to 6747 |
| [SCREEN 4 · Touch, mouse and keys](#screen-4--touch-mouse-and-keys) | `src/js/ui/04-touch-mouse-keys.js` | 6748 to 6878 |
| [SCREEN 5 · Action panel](#screen-5--action-panel) | `src/js/ui/05-action-panel.js` | 6879 to 7115 |
| [SCREEN 6 · Top bar, game flow and saves](#screen-6--top-bar-game-flow-and-saves) | `src/js/ui/06-hud-saves.js` | 7116 to 7252 |
| [SCREEN 7 · Menus and encyclopedia](#screen-7--menus-and-encyclopedia) | `src/js/ui/07-menus-encyclopedia.js` | 7253 to 7635 |
| [SCREEN 8 · Sound](#screen-8--sound) | `src/js/ui/08-sound.js` | 7636 to 7892 |
| [SCREEN 9 · Main loop](#screen-9--main-loop) | `src/js/ui/09-main-loop.js` | 7893 to 7933 |
| [EXTRA 1 · Calm map look and new maps](#extra-1--calm-map-look-and-new-maps) | `src/js/extras/01-maps.js` | 7934 to 8462 |
| [EXTRA 2 · Animals and kerbau](#extra-2--animals-and-kerbau) | `src/js/extras/02-animals-kerbau.js` | 8463 to 8953 |
| [EXTRA 3 · Smarter AI](#extra-3--smarter-ai) | `src/js/extras/03-ai-plus.js` | 8954 to 9001 |
| [EXTRA 4 · Groups, facing and taps](#extra-4--groups-facing-and-taps) | `src/js/extras/04-groups-facing-taps.js` | 9002 to 9246 |
| [EXTRA 5 · Compact screen](#extra-5--compact-screen) | `src/js/extras/05-compact-hud.js` | 9247 to 9371 |
| [EXTRA 6 · Base footprints, wading, wet ports, house drop-off](#extra-6--base-footprints-wading-wet-ports-house-drop-off) | `src/js/extras/06-footprint-wading.js` | 9372 to 9419 |
| [EXTRA 7 · Fire Arrows research](#extra-7--fire-arrows-research) | `src/js/extras/07-fire-arrows.js` | 9420 to 9486 |
| [EXTRA 8 · Khmer](#extra-8--khmer) | `src/js/extras/08-khmer.js` | 9487 to 11631 |
| [EXTRA 9 · The computer's Ayutthaya households](#extra-9--the-computers-ayutthaya-households) | `src/js/extras/09-ai-households.js` | 11632 to 11706 |
| [EXTRA 10 · Computer-player fixes](#extra-10--computer-player-fixes) | `src/js/extras/10-ai-fixes.js` | 11707 to 11811 |
| Styles | `src/css/game.css` | inside `<style>` |
| Page layout (menus, HUD) | `src/index.html` | outside the script and styles |

## SIM 1 · Basics

`src/js/sim/01-core.js` · lines 603 to 671

Map size, tile types, saving helpers and random numbers. Everything in the SIM chapters is the game rules only: no drawing, so it can run in tests.

**Things you can tweak**

- W, H: map size in tiles (96 x 72). Missions change it in their own build.
- MAXPOP: population cap (100).
- STEP: the game ticks 30 times a second. Leave it.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `snapEnc` | 627 | Sets, Maps and typed arrays survive JSON as tagged objects |
| `snapDec` | 634 | turn saved data back into Sets, Maps and arrays |
| `mulberry32` | 643 | the seeded random number maker (same seed = same map) |
| `hash2` | 654 | a fixed pseudo-random number for a tile |
| `vnoise` | 661 | smooth noise for map shapes |
| `fbm` | 668 | layered noise for natural-looking coasts and woods |

## SIM 2 · Units, civs and buildings

`src/js/sim/02-units-buildings.js` · lines 672 to 830

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
| `CV` | 723 | which civ a team plays (0 Melaka, 1 Majapahit, 3 Ayutthaya) |
| `CI` | 728 | which column of a [Melaka, Majapahit, Ayutthaya, Khmer] table to read |
| `civOk` | 730 | can this civ use this unit or building? |
| `civEntry` | 768 | the civ's name entry for a unit or building |
| `civRole` | 770 | the English role name ("Spearman") |
| `civName` | 772 | the local name ("Tombak Warrior") |
| `shortName` | 774 | the short button label |
| `enName` | 790 | the English name, when the local name differs from it |
| `btnName` | 792 | button text: local name with (English) under it |
| `fullName` | 794 | "Local name (English)" |

## SIM 3 · Ages, resources, AI difficulty, maps

`src/js/sim/03-ages-resources-ai-maps.js` · lines 831 to 959

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
| `lineKind` | 885 | which archer-line unit a civ gets in an age |
| `ageFits` | 887 | is this unit allowed in this age? |
| `costWords` | 889 | cost as words ("50 food, 20 gold") |
| `rectOfTiles` | 940 | a rectangle from tile corners |
| `rectDist` | 942 | distance from a point to a rectangle |

## SIM 4 · Starting a game

`src/js/sim/04-game-setup.js` · lines 960 to 1406

The Game class begins here. Makes the map (genMap, rivers, islands), thins trees (openWoods), places villages, bases and resources (populate), and saves/loads (snapshot).

**Things you can tweak**

- populate(): what each side starts with and where resources go.
- openWoods(): how many trees get cleared. Missions turn it off.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `init` | 969 | ======================= setup ======================= |
| `openWoods` | 1006 | thin the woods so nothing gets trapped: no one-tile squeezes between trees, and no little clearings walled in by trees (a kerbau or deer could spawn in one... |
| `reserveRoute` | 1058 | keep a road clear of trees |
| `inb` | 1080 | is this tile inside the map? |
| `computeRegions` | 1082 | land masses: every land tile gets the number of the island (or river bank) it sits on |
| `regionAt` | 1100 | which island or river bank a point is on |
| `coastNear` | 1102 | a dry tile on the shore near (x, y), at least 5 tiles out: where a base's port road goes |
| `snapshot` | 1116 | Everything that can't be rebuilt goes into a plain JSON object. Lookup tables (byId, the spatial hash, path scratch, claims) and short-lived effects are... |
| `genMap` | 1143 | make the land, water and cliffs for a skirmish map |
| `genRiverlands` | 1208 | Riverlands: four rivers that meet in the middle; sandy fords are the only dry crossings |
| `genIslands` | 1232 | Big Islands: four large islands, one for each side and two to fight over, with deep channels between |
| `landConnected` | 1243 | can you walk from A to B? |
| `isLand` | 1258 | is the tile land? |
| `isWater` | 1260 | is the tile water? |
| `freeTile` | 1262 | is the tile empty land? |
| `addNode` | 1265 | put a tree, bush, gold or fish on the map |
| `removeNode` | 1274 | remove a used-up resource |
| `populate` | 1281 | place bases, villagers, resources and villages at the start |
| `addVillage` | 1374 | place a neutral Orang Laut village with its landing |
| `siteAt` | 1405 | the free village landing whose corner is at (tx, ty), if any |

## SIM 5 · Units, costs and ages

`src/js/sim/05-entities-ages.js` · lines 1407 to 1634

Adding units and buildings, working out prices (costOf), what a building can train, and climbing the ages.

**Things you can tweak**

- costOf(): where civ discounts are applied.
- applyAge(): what happens when an age finishes.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `addUnit` | 1416 | ======================= entities ======================= |
| `unitName` | 1435 | a unit's civ name |
| `costOf` | 1437 | price of a unit or building after civ discounts (MEL_LEVY, TEAMMOD) |
| `trainable` | 1445 | what a building can train for this team (unique units and ships belong to one civ) |
| `lockedTrain` | 1447 | what this building will train in a later age (shown greyed out with the age it needs) |
| `countOf` | 1452 | how many of a kind a team has |
| `canAfford` | 1459 | enough resources? |
| `pay` | 1461 | take the cost |
| `refund` | 1463 | give the cost back |
| `teamAge` | 1466 | ======================= ages ======================= |
| `ageText` | 1468 | what the next age still needs, as text |
| `ageNeedMet` | 1474 | are the next age's needed buildings built? |
| `startAge` | 1481 | begin researching the next age |
| `cancelAge` | 1492 | stop an age-up and refund it |
| `ageTick` | 1498 | count down age research |
| `applyAge` | 1505 | finish an age-up: Town Centre hp, unit looks, unlocks |
| `morphUnit` | 1518 | swap a unit for another kind in place, keeping its share of health |
| `armForAge` | 1525 | foot soldiers get mail in the Age of Commerce and more in the Golden Age; light ranged units turn elite in the Golden Age |
| `addBuilding` | 1534 | add a building to the map |
| `evict` | 1551 | push units off a new building's tiles |
| `setGateLock` | 1562 | an own gate: open lets your own people through and stops enemies, closed stops everyone |
| `walkable` | 1569 | can a unit stand on this tile? |
| `nearestFree` | 1577 | the closest empty tile |
| `unitNear` | 1594 | is another unit close to this spot? |
| `openSpot` | 1599 | centre of the nearest walkable tile nobody is standing on |
| `findSpawn` | 1615 | spawn tile next to a building, preferring the side facing 'toward' (and tiles nobody stands on) |

## SIM 6 · Finding the way

`src/js/sim/06-paths-and-searching.js` · lines 1635 to 1816

A* pathfinding, straight-line checks, and quick searches like "nearest enemy" or "units near here".

**Things you can tweak**

- Mostly leave alone. nearestEnemy() decides what idle soldiers notice.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `findPath` | 1643 | ======================= pathfinding ======================= |
| `los` | 1690 | straight line clear between two points? |
| `smooth` | 1703 | straighten a path so units don't zig-zag |
| `pathToRect` | 1714 | path to within `reach` of a rectangle (continuous coords) |
| `pathToPoint` | 1732 | find a path to a spot |
| `setPath` | 1747 | give a unit its new path |
| `stepMove` | 1752 | move a unit along its path for one tick |
| `rebuildHash` | 1773 | ======================= spatial queries ======================= |
| `unitsNear` | 1782 | all units within a radius (fast grid lookup) |
| `isVisible` | 1791 | is this spot out of the fog? |
| `nearestEnemy` | 1793 | the closest enemy a unit can see |

## SIM 7 · Orders

`src/js/sim/07-orders.js` · lines 1817 to 2164

What happens when you tap: gather, attack, board a ship, land, shelter in the Town Centre (town bell), trade, move in formation.

**Things you can tweak**

- BD.towncentre.garrison / BD.tower.garrison (chapter 2): how many villagers shelter.
- groupMove(): spacing of formations.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `idleOrder` | 1826 | ======================= orders ======================= |
| `gatherInfo` | 1828 | what a target gives and how fast, if it can be gathered |
| `orderGather` | 1835 | send a villager to gather |
| `orderAttack` | 1845 | send a unit to attack |
| `orderBoard` | 1850 | send a unit onto a ship |
| `roomIn` | 1852 | garrison: villagers shelter in a Town Centre (15) or tower (5); each one inside adds an arrow |
| `orderGarrison` | 1854 | send a villager to shelter in a building |
| `doGarrison` | 1856 | walk to the shelter and go inside |
| `shelterFor` | 1874 | nearest building with room to shelter |
| `ringBell` | 1880 | the town bell: every villager runs for the nearest shelter with room; All clear sends them back to work |
| `ungarrison` | 1896 | let sheltered villagers out |
| `allClear` | 1910 | end the town bell: everyone back to work |
| `orderLand` | 1918 | send a loaded ship to a beach |
| `shoreTile` | 1920 | the water tile next to a beach nearest (x, y), leaning towards (bx, by) |
| `waterReach` | 1935 | every water tile a ship can sail to from where it is |
| `doBoard` | 1949 | a land unit climbs aboard once it reaches the galley |
| `doLand` | 1970 | a galley sails to the beach nearest (x, y) and puts its troops ashore |
| `launchRaft` | 2001 | a Port pushes a burning raft out at the nearest enemy ship |
| `orderTrade` | 2015 | start a trade ship's route |
| `orderBuild` | 2017 | send a villager to build |
| `orderMove` | 2019 | plain move |
| `orderAMove` | 2021 | attack-move (fight anything on the way) |
| `command` | 2024 | group order from the player (or the AI). ids -> units owned by `team` |
| `groupMove` | 2115 | move a group in formation |

## SIM 8 · Building and training

`src/js/sim/08-building-training.js` · lines 2165 to 2379

Where a building may go, laying walls in lines, the build queue, population, and drop-off points.

**Things you can tweak**

- WALL_MAX (chapter 2) limits a wall drag.
- popCap(): MAXPOP from chapter 1.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `canPlace` | 2174 | ======================= building / training ======================= |
| `underPortArt` | 2198 | a port's hall stands up above its deck: nothing may be built where the hall's art goes, and a port's hall can't cover another building |
| `canFloat` | 2211 | Ayutthaya raft house moored out on the river: the whole 2x2 on water, its edge against the bank (a bamboo gangway), and open water on the river side so... |
| `houseKind` | 2226 | an Ayutthaya house set down on the water floats as a raft house; one built on land always stays a house (Iylia, 2026-11-08) |
| `waterSide` | 2228 | how many open water tiles ring a footprint |
| `wallPieceAt` | 2237 | the team's own palisade or wall (or any wall piece, gates included, unless plain) on a tile |
| `lineTiles` | 2243 | tiles of a wall line from (ax, ay) to (bx, by), stepping one axis at a time so there are no diagonal gaps |
| `placeLine` | 2254 | lay a palisade or wall line; own wall tiles on the way are kept, blocked tiles are skipped. returns {ok, n, why} |
| `placeBuilding` | 2276 | returns {ok, b, why} |
| `queueUnit` | 2296 | add a unit to a building's training queue |
| `cancelQueue` | 2310 | remove one from the queue and refund it |
| `popOf` | 2317 | how many people a team has |
| `popCap` | 2319 | housing limit |
| `dropOffs` | 2321 | buildings that take a resource |
| `nearestDrop` | 2326 | nearest drop-off for a resource |
| `nearestNode` | 2332 | nearest resource of a type; one with a free gathering slot wins over a full one |
| `freeSameKind` | 2356 | nearest other resource of the same kind as `like` (tree -> tree, farm -> own farm) with a free slot |
| `gatherCap` | 2367 | how many villagers (or boats) may work one resource at once |
| `claimsOf` | 2369 | how many villagers are on a resource |
| `countClaims` | 2371 | recount villagers per resource |
| `setRally` | 2376 | set where new units walk to |

## SIM 9 · Every tick: buildings, soldiers, fire

`src/js/sim/09-every-tick.js` · lines 2380 to 2862

Runs 30 times a second: buildings train and heal, soldiers pick fights by stance, healers heal, ships shoot, buildings burn.

**Things you can tweak**

- guardOrder(): how far Defensive soldiers chase (r: 11 tiles).
- fireOn(): who sets buildings alight and how often (archers 20% from Age 2).
- BURN (chapter 2) for fire strength.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `update` | 2390 | ======================= per-tick update ======================= |
| `doFishHouse` | 2408 | fishing from a raft house's deck: no walking to a drop-off, the catch goes straight into the store |
| `households` | 2425 | household while its paddy is worked, and a raft house while its woman fishes from the deck |
| `housePairs` | 2433 | one paddy per house: pair each finished land house with the nearest unused paddy touching it (farm id -> house) |
| `householdTick` | 2449 | Ayutthaya households pay food |
| `updateBuilding` | 2459 | one tick for a building: build, train, shoot, heal |
| `finishBuilding` | 2520 | a building is finished |
| `updateUnit` | 2542 | one tick for a unit: cooldowns, then its current order |
| `doIdle` | 2586 | what an idle unit does (look for enemies by stance) |
| `guardOrder` | 2612 | stances: 'agg' chases whatever it sees, 'def' (default) chases up to 11 tiles from its post then walks back, 'hold' never moves |
| `orderReturn` | 2614 | walk back to the post; a soldier hit on the way fights back instead of ignoring it |
| `breach` | 2616 | a land soldier whose way is walled off attacks the enemy wall piece that is most in the way to (gx, gy) |
| `doAMove` | 2627 | attack-move step |
| `doAttack` | 2643 | chase and hit a target |
| `doWander` | 2695 | animals wander |
| `doFlee` | 2707 | animals run from hunters |
| `doTrade` | 2719 | trade ship: sail to the Trading Post, load goods, sail home to the nearest Port and get paid by distance |
| `canHeal` | 2743 | healing: allies on land, hurt, and out of combat for HEAL_CALM seconds |
| `healOne` | 2745 | heal one unit |
| `healStep` | 2747 | idle healer: heal what's in reach, or walk over to the worst-hurt ally it can see |
| `doHeal` | 2771 | healer walks to and heals a target |
| `shipShot` | 2780 | a ship's main weapon: arrows (fire arrows from tier 1), boarding, or cannon (tier 2) |
| `secShot` | 2794 | secondary weapon (galley archers, flagship arrows) on its own reload |
| `fireOn` | 2807 | fire on buildings (lore/siege.md, Iylia 2026-10-25), all of it automatic: foot soldiers carry obor torches, gunners throw gunpowder fire pots (two fires at... |
| `ignite` | 2815 | set a building or wooden ship burning; stacks up to BURN.max |
| `updateBurning` | 2823 | burning buildings and ships lose hp |
| `explode` | 2850 | fire ship: burns everything hostile around it and sinks itself |

## SIM 10 · Gathering, repairing, damage

`src/js/sim/10-gather-repair-damage.js` · lines 2863 to 3203

Villagers gathering and carrying, repairing and demolishing, building, units pushing apart, and the damage formula. Also fog of war and the win/lose check.

**Things you can tweak**

- damage(): the damage formula (attack + bonus - armour).
- doRepair(): repair cost and speed.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `doGather` | 2872 | villager gathers, carries the load to a drop-off, and goes back |
| `workSpot` | 2972 | where a gatherer stands while working: inside a farm, or hugging the side of a node it walked up to |
| `doRepair` | 3002 | repair: a full fix takes 1.5x the build time for one villager (more help, faster) and costs half the building's price in wood (at least 25), paid as the... |
| `canDemolish` | 3021 | knock down your own building: nothing comes back. The Town Centre can't be (losing it loses the game) |
| `demolish` | 3023 | take down your own building |
| `doBuild` | 3032 | villager builds |
| `separate` | 3056 | push units apart so they don't stack |
| `nudge` | 3078 | small push for one unit |
| `gunFx` | 3084 | gunpowder at the muzzle: a flash, then thick pale smoke billowing forward and drifting up |
| `damage` | 3090 | the damage formula: attack + bonus - armour |
| `onKilled` | 3129 | something died: score, loot, messages |
| `msg` | 3153 | show a short message |
| `cleanup` | 3156 | remove the dead |
| `updateFx` | 3169 | age out effects |
| `updateFog` | 3183 | recompute what each side can see |
| `checkEnd` | 3199 | win or lose? |

## SIM 11 · What you tapped, and the enemy AI

`src/js/sim/11-enemy-ai.js` · lines 3204 to 3488

pick() finds what is under your finger. aiTick() is the computer player: it gathers, builds, trains, ages up, attacks and retreats.

**Things you can tweak**

- DIFF (chapter 3) is the safest place to change the AI.
- aiRetreat(): when a beaten attack falls back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pick` | 3213 | ======================= picking ======================= |
| `aiTick` | 3239 | ======================= enemy AI (Majapahit) ======================= |
| `aiFerry` | 3397 | Big Islands: board a wave onto the galleys, sail them over and land it by the enemy base; anyone already ashore over there marches on the nearest enemy... |
| `aiRetreat` | 3440 | an attack that has clearly failed comes home: under a third left, or still fighting after 3 minutes |
| `aiBuild` | 3451 | AI places a building near its Town Centre |
| `aiBuildShore` | 3464 | AI places a port on the coast |
| `aiBuildNear` | 3474 | AI places a drop-off near resources |

## ART 1 · Drawing basics

`src/js/art/01-core.js` · lines 3489 to 3558

All art is drawn by code, pixel by pixel, then cached as pictures. Team colours and the sprite helper live here.

**Things you can tweak**

- TEAMC: each team's colours. SKIN, HAIR, STEEL, WOOD: shared colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `cv` | 3511 | make a blank drawing canvas |
| `sprite` | 3513 | draw a picture once with the pixel painter P, then reuse the cached copy |
| `outlineCanvas` | 3524 | add the dark outline around a sprite |
| `whiteOf` | 3538 | a white copy of a sprite (flash when hit) |
| `disc` | 3545 | paint a filled pixel circle |
| `planks` | 3547 | paint a wooden plank wall |
| `roofGable` | 3549 | paint a sloped gable roof |
| `posts` | 3557 | paint wooden stilts or posts |

## ART 2 · People

`src/js/art/02-people.js` · lines 3559 to 3771

Villagers and soldiers: bodies, legs, weapons and the walk cycle.

**Things you can tweak**

- GOLD, LUK, LEGS: shared colours and leg poses.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `drawUnit` | 3579 | paint a Melaka/Majapahit person: body, clothes, weapon and pose |
| `unitAge` | 3707 | the team's age picks the look (AGEART, below); neutral and pre-age callers get the Kingdom Age roster |
| `unitSprite` | 3709 | the picture for a unit, with its age look |
| `civUnitSprite` | 3711 | the picture for a unit by civ (Ayutthaya has its own art) |
| `deerSprite` | 3717 | deer picture |
| `carcassSprite` | 3727 | hunted animal carcass picture |
| `hull` | 3736 | hull with upswept bow and stern; x0..x1 is the deck length, y the deck line |
| `tanja` | 3743 | tanja: slanted four-sided sail between two spars, the classic Nusantara rig |
| `boatSprite` | 3751 | fishing boat picture |

## ART 3 · Nature

`src/js/art/03-nature.js` · lines 3772 to 3818

Trees, bushes, gold, fish and deer.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `treeSprite` | 3777 | ------------------------------ nature ------------------------------ |
| `bushSprite` | 3803 | berry bush picture |
| `goldSprite` | 3811 | gold deposit picture |

## ART 4 · Ships

`src/js/art/04-ships.js` · lines 3819 to 3990

Every civ's ships, sails and hulls (NAVAL).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hull` | 3839 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 3847 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 3855 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 3863 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 3865 | paint a ship mast |
| `flag` | 3867 | paint a small flag |
| `oars` | 3869 | paint a row of oars |
| `crew` | 3871 | paint a crewman on deck |
| `flames` | 3873 | paint flames |
| `navalSprite` | 3887 | a ship picture by kind and civ |

## ART 5 · Melaka and Majapahit buildings

`src/js/art/05-melaka-majapahit-buildings.js` · lines 3991 to 4318

Town Centres, houses, barracks and other buildings for the first two civs (CIVB).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `weave` | 4005 | paint woven bamboo walls |
| `sacks` | 4007 | paint grain sacks |
| `crates` | 4009 | paint trade crates |
| `banner` | 4011 | paint a Melaka banner |
| `melakaBuilding` | 4014 | a Melaka building picture |
| `neutralSite` | 4064 | Neutral map sites. Pangkalan can only be built on a landing next to a settlement. |
| `brick` | 4092 | paint red brick courses |
| `meru` | 4094 | meru: stacked black thatch tiers, each narrower than the one below |
| `surya` | 4096 | sun of Majapahit (Surya Majapahit) emblem |
| `mjBanner` | 4098 | paint a Majapahit banner |
| `majapahitBuilding` | 4101 | a Majapahit building picture |
| `ijukRoof` | 4158 | black ijuk gable roof with a thick dark edge |
| `majapahitBase` | 4161 | Majapahit Town Centre and palace base |
| `pier` | 4203 | pier() and rack() from buildings-mainland.js, used by the Majapahit port and barracks |
| `rack` | 4205 | paint a drying rack |
| `drawHealer` | 4215 | paint a healer (Tabib, Acaraki, Mo) |
| `healerSprite` | 4262 | healer picture |
| `herbBed` | 4270 | paint a herb bed |
| `healerBuilding` | 4273 | healer building picture (Rumah Tabib, Patirthan) |

## ART 6 · Ayutthaya

`src/js/art/06-ayutthaya.js` · lines 4319 to 5220

All Ayutthaya art: people, elephants, buildings and boats (AYART).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ayUnit` | 4343 | an Ayutthaya unit picture |
| `ayuPerson` | 4351 | paint an Ayutthaya person |
| `ayuElephant` | 4469 | ---------- Chang Suek: war elephant, 32x32, facing right ---------- |
| `ayuCannon` | 4540 | ---------- bronze cannon on a field carriage, 26x18, with a purple pennant ---------- |
| `ayRoofTri` | 4580 | steep roof triangle seen from the gable end: tile courses, a coloured rim along both slopes |
| `ayChofa` | 4588 | chofa: slender gold hook rising from the gable apex |
| `ayHangHong` | 4590 | hang hong: small upturned gold curls at the lower ends of the gable boards |
| `ayGable` | 4592 | Thai gable: tiled triangle, dark gable face framed by gold pan lom boards, chofa on top, hang hong at the foot |
| `ayEave` | 4610 | eave skirt: a lower roof tier spreading out under a gable |
| `ayWhite` | 4618 | white-washed brick: lime plaster with faint courses and weathering |
| `ayLeaf` | 4624 | bai sema merlon: a leaf shape with a point on top |
| `ayBanner` | 4629 | purple thong banner with a little white elephant |
| `ayTeak` | 4635 | teak panel wall (fa pakon): framed panels |
| `ayHouse` | 4641 | small Ruean Thai, used by the house and the raft house |
| `ayBuilding` | 4661 | an Ayutthaya building picture |
| `hull` | 4802 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 4810 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 4818 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 4826 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 4828 | paint a ship mast |
| `flag` | 4830 | paint a small flag |
| `oars` | 4832 | paint a row of oars |
| `crew` | 4834 | paint a crewman on deck |
| `flames` | 4836 | paint flames |
| `navalSprite` | 4850 | a ship picture by kind and civ |
| `junk` | 4969 | Battened junk sail: a tall rectangle with battens and a rounded top-front corner. |
| `prow` | 4974 | Tall curving prow (Thai and Khmer barges). |
| `eye` | 4976 | Painted bow eye, the mark of Vietnamese boats. |
| `pavilion` | 4978 | Pavilion with a tiered pointed roof. |
| `mainlandShip` | 4984 | a Khmer/Dai Viet ship picture (battle demos) |
| `womanSprite` | 5098 | Phrai Ying: a village woman of Ayutthaya. Short hair (as European visitors noted of Siamese women), a sabai cloth across the chest, an ankle-length pha sin,... |
| `aySpears` | 5136 | rack of spears with red tassels |
| `ayShield` | 5138 | small purple round shield with a gold boss |
| `ayBuildingX` | 5140 | Ayutthaya barracks, port, granary, teak store and farm pictures |
| `unit` | 5208 | an Ayutthaya unit picture (falls back to the shared art) |
| `building` | 5216 | Ayutthaya building picture (shared entry point) |
| `ship` | 5218 | Ayutthaya ship picture (shared entry point) |

## ART 7 · Soldiers through the ages

`src/js/art/07-age-looks.js` · lines 5221 to 5565

How soldiers' dress changes each age (AGEART), plus guns and armour (XU).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hexRGB` | 5237 | Melaka age progression mockups. Runs in the game page after art.js (and heroes-art.js). melAge(kind, age, anim, f): keris / tombak / archer drawn with the... |
| `recolor` | 5239 | swap colours on a finished picture |
| `melAge` | 5247 | Melaka soldier picture for a given age |
| `melGunner` | 5273 | Melaka gunner picture |
| `melMeriam` | 5297 | Melaka bronze cannon picture |
| `xuFlash` | 5327 | muzzle flash pointing right, x = first pixel past the muzzle, y = bore centre |
| `xuSmoke` | 5330 | a few puffs drifting up from (x, y) |
| `xUnit` | 5336 | extra unit pictures (guns, armour) |
| `mpAge` | 5453 | ---------- Majapahit: the game's Majapahit drawing, a kere (mail coat) from age 2, a bronze helmet in age 3 ---------- |
| `helmet` | 5472 | paint a bronze helmet |
| `mpMusket` | 5477 | the Bedil Kraton (Golden Age): the bedil gunner in a kere with a gold belt |
| `lightAge` | 5487 | ---------- light ranged units: levy cloth in age 1, a gold sash and band in age 4, never mail ---------- |
| `canvasRecolor` | 5498 | copy a picture with colours swapped |
| `ayAge` | 5506 | Ayutthaya soldier picture for a given age |
| `unit` | 5525 | pick the right age look for any civ's soldier |
| `shipSprite` | 5550 | the picture for a ship on the map |
| `raftSprite` | 5552 | rakit api: a bamboo raft heaped with dry fronds and husks, already alight |
| `shipAnchor` | 5564 | where a ship picture sits on its tile |

## ART 8 · Shared buildings and walls

`src/js/art/08-shared-buildings.js` · lines 5566 to 5787

Walls, gates, farms, ports and other buildings every civ shares, and wall styles by age.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `wallSprite` | 5574 | one wall tile. mask: 1 N, 2 E, 4 S, 8 W neighbours of the same side; open: a gate with friends close by. Palisade: sharpened logs. Melaka Kubu: planked... |
| `sawahSprite` | 5700 | Sawah: stepped rice terraces with water between the rows, earth bunds and a dangau hut (lore/scenes/bld-extra.js, fitted to 3 tiles) |
| `buildingSprite` | 5724 | the picture for a building |
| `civBuildingSprite` | 5726 | the picture for a building by civ |

## ART 9 · Icons

`src/js/art/09-icons.js` · lines 5788 to 5831

Small pictures for buttons, and marks on the ground.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `iconSprite` | 5793 | ------------------------------ icons & decals ------------------------------ |
| `rubbleSprite` | 5822 | rubble left by a destroyed building |

## ART 10 · Ground

`src/js/art/10-terrain.js` · lines 5832 to 5923

Grass, sand, water and cliffs (PAL is the ground palette).

**Things you can tweak**

- PAL: ground colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `buildTerrain` | 5845 | paint the whole ground map once at the start |
| `buildMiniBase` | 5916 | paint the minimap ground |

## SCREEN 1 · Screen, camera, fog

`src/js/ui/01-screen-camera-fog.js` · lines 5924 to 6044

Everything the player sees and touches starts here: the canvas, the camera, the fog of war and the build list.

**Things you can tweak**

- setZoom(): zoom limits, clamp(z, 0.38, 2.6). 0.38 = furthest out.
- clampCam(): how far past the map edge you can pan (0.3 and 0.35 of the screen).
- BUILD_ORDER, ECO_BLD: the order of build buttons and which tab they sit in.
- FORMS: formation types.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `clamp` | 5958 | ---------------- helpers ---------------- |
| `s2w` | 5960 | screen point to map point |
| `w2s` | 5962 | map point to screen point |
| `fmtTime` | 5964 | seconds as m:ss |
| `dataURL` | 5967 | picture as an image link (cached) |
| `fitIcon` | 5972 | shrink a sprite into an icon |
| `unitIcon` | 5981 | button icon for a unit |
| `bldIcon` | 5983 | button icon for a building |
| `resIcon` | 5989 | icon for food, wood or gold |
| `nodeIcon` | 5991 | icon for a resource on the map |
| `toast` | 5996 | pop-up message on screen |
| `resize` | 6004 | ---------------- view and camera ---------------- |
| `clampCam` | 6012 | the camera may run a little past each edge, so the corners can be brought out from under the HUD |
| `setZoom` | 6018 | zoom the camera, kept between 0.38 (far) and 2.6 (close) |
| `centerOn` | 6025 | move the camera to a tile |
| `inView` | 6027 | is this on screen? |
| `initFog` | 6030 | ---------------- fog ---------------- |
| `refreshFog` | 6035 | repaint the fog layer |

## SCREEN 2 · Drawing the battlefield

`src/js/ui/02-drawing.js` · lines 6045 to 6545

Draws ground, buildings, units, health bars, fire, arrows and the minimap every frame, sorted so nearer things cover farther ones.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ell` | 6051 | ---------------- drawing ---------------- |
| `shadow` | 6053 | soft shadow under a unit |
| `hpBar` | 6055 | health bar |
| `isSel` | 6060 | is this selected? |
| `toolFor` | 6063 | which tool a villager holds for its job |
| `paintUnit` | 6070 | draw one unit |
| `torchFor` | 6118 | foot soldiers burn buildings with an obor (torch) rather than hacking at them with their weapons (lore/siege.md) |
| `paintTorch` | 6124 | draw the obor torch pose |
| `paintNode` | 6141 | draw a resource |
| `buildWallGrid` | 6165 | map of where wall pieces are |
| `wallMask` | 6171 | which neighbours a wall piece joins |
| `raftSide` | 6178 | which way a raft house leans to the water |
| `paintRaftHouse` | 6185 | draw a raft house |
| `paintFisher` | 6212 | draw the woman fishing from a raft house |
| `paintBuilding` | 6225 | draw one building with fire, flags and bars |
| `paintFx` | 6255 | draw effects (corpses, sparks) |
| `paintTop` | 6273 | draw top-layer effects (gun flashes) |
| `drawArrow` | 6317 | draw arrows and bullets in flight |
| `jobTarget` | 6346 | where a unit is headed for its job (gather / build / hunt target), if anywhere |
| `targetRing` | 6352 | ring around a target |
| `paintJobs` | 6358 | dashed trail from selected workers to their job |
| `paintMarkers` | 6373 | tap markers on the ground |
| `paintPlacement` | 6392 | the building ghost while placing |
| `paintLinePlacement` | 6412 | a wall line: every tile green (new), grey (already walled) or red (blocked), with the count and cost by its end |
| `placeButtons` | 6436 | touch placement: a ✓ (build) and ✗ (cancel) button under the ghost; their screen spots are kept for hit tests |
| `paintPlaceButtons` | 6443 | the Place/Cancel buttons on the ghost |
| `render` | 6455 | draw the whole frame |
| `drawMini` | 6521 | draw the minimap |

## SCREEN 3 · Selecting and giving orders

`src/js/ui/03-selecting.js` · lines 6546 to 6747

Turns taps into selections and orders (tap a unit, box select, double tap for all of a kind).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `selUnits` | 6551 | ---------------- selection and orders ---------------- |
| `select` | 6553 | change the selection |
| `addMarker` | 6555 | show where you tapped |
| `issue` | 6557 | give the selected units an order at a spot |
| `canRally` | 6573 | can this building have a rally point? |
| `setRallyFor` | 6575 | set a rally point from a tap |
| `contextCommand` | 6581 | the right order for what you tapped (gather, attack, repair...) |
| `selectSameKind` | 6587 | select all units of this kind on screen |
| `placeAt` | 6592 | move the building ghost |
| `nearestSite` | 6598 | nearest free village landing (trading post) |
| `tryPlace` | 6607 | place the building if the spot is OK |
| `startPlace` | 6624 | start placing a building |
| `nearWallPiece` | 6650 | nearest wall piece (for gates) |
| `findSpot` | 6656 | a good free spot for a building |
| `clearRallyTap` | 6667 | cancel a pending rally tap |
| `handleTap` | 6669 | what one tap does |
| `boxSelect` | 6717 | select everything inside a dragged box |
| `idleVillagers` | 6728 | list idle villagers |
| `cycleIdle` | 6731 | jump to the next idle villager |
| `selectArmy` | 6736 | select all soldiers |
| `selectNavy` | 6742 | every warship (fishing boats and trade ships keep working) |

## SCREEN 4 · Touch, mouse and keys

`src/js/ui/04-touch-mouse-keys.js` · lines 6748 to 6878

Finger drag to scroll, pinch to zoom, hold-drag to box select, mouse wheel, keyboard keys.

**Things you can tweak**

- The pinch zoom limit is also here (0.38, 2.6): keep it the same as setZoom().

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pos` | 6755 | ---------------- pointer input ---------------- |
| `endPointer` | 6820 | finger or mouse lifted: tap, drag or box |
| `miniGo` | 6844 | tap the minimap to move the camera |

## SCREEN 5 · Action panel

`src/js/ui/05-action-panel.js` · lines 6879 to 7115

The panel at the bottom: build tabs, train buttons, stance, bell, repair, demolish.

**Things you can tweak**

- STANCES: the stance names and order.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `costHTML` | 6888 | cost shown with icons |
| `costTitle` | 6893 | cost as text |
| `cmdBtn` | 6895 | make one panel button |
| `lockBtn` | 6899 | a button for something a later age brings: greyed out, tapping it says which age |
| `ageBtn` | 6904 | the Town Centre's age-up button: the next age and its cost, or the work under way (tap to call it off) |
| `describeOrder` | 6911 | what a unit is doing, as text |
| `bldNote` | 6934 | help line for a selected building |
| `pName` | 6948 | name line in the panel |
| `buildPanel` | 6950 | build the bottom panel for the selection |
| `structKey` | 7042 | panel layout key (rebuild only when it changes) |
| `updatePanel` | 7049 | refresh numbers on the panel |
| `stanceOfSel` | 7065 | stance of the selected soldiers |
| `cycleStance` | 7067 | Stance button |
| `cycleFormation` | 7075 | Formation button |
| `stopSel` | 7077 | Stop button |

## SCREEN 6 · Top bar, game flow and saves

`src/js/ui/06-hud-saves.js` · lines 7116 to 7252

Resource bar, messages, pause, win/lose screens, autosave and the 3 save slots.

**Things you can tweak**

- SAVE_KEY / SLOTS_KEY: where saves are kept on the phone.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hintText` | 7125 | the hint line at the top |
| `updateHud` | 7134 | refresh the top bar |
| `showOv` | 7151 | ---------------- game flow ---------------- |
| `startGame` | 7156 | start a skirmish |
| `enterGame` | 7165 | shared by a new game and a resumed one: rebuild the view state around G |
| `syncSpeedButtons` | 7173 | show which game speed is on |
| `lsGet` | 7178 | storage can be missing (private windows, previews): the game still runs, it just can't resume |
| `lsSet` | 7180 | save to the phone's storage |
| `lsDel` | 7182 | delete from the phone's storage |
| `saveSettings` | 7186 | save settings |
| `slotMetas` | 7193 | what is in the 3 save slots |
| `slotPick` | 7195 | which slot a new game uses |
| `slotWrite` | 7197 | write a save slot |
| `slotRead` | 7199 | read a save slot |
| `slotDel` | 7201 | delete a save slot |
| `slotNewest` | 7203 | most recent save |
| `slotLine` | 7205 | save slot label text |
| `saveGame` | 7209 | save the current game |
| `openSlot` | 7216 | a mission save opens its own page, which loads it |
| `continueGame` | 7223 | load a saved game |
| `quitToMenu` | 7232 | save and go to the menu |
| `discardGame` | 7234 | leave without keeping anything from this game: every slot it wrote goes back to what it held before |
| `confirmBox` | 7242 | a yes/no box over whatever is on screen |

## SCREEN 7 · Menus and encyclopedia

`src/js/ui/07-menus-encyclopedia.js` · lines 7253 to 7635

Home screen, Skirmish setup, Campaign and Battles lists, mission briefings, Encyclopedia text, Settings.

**Things you can tweak**

- BUILD: the version shown in Settings.
- ENCY_UNITS / ENCY_BLDS / ENCY_CIVS / ENCY_GUIDE: encyclopedia text.
- CAMPAIGNS / MISSIONS: mission lists, briefings and which are unlocked.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `showMenu` | 7269 | show a menu screen |
| `delAsk` | 7284 | two-tap Delete on the home screen |
| `refreshHome` | 7290 | update the home screen |
| `renderSlots` | 7299 | Load game screen |
| `setVerNote` | 7307 | version, updates and exit (the installed app has no browser bar to reload or close it) |
| `checkForUpdate` | 7309 | Settings > Check for updates |
| `showUpdateReady` | 7323 | bar saying a new version is ready |
| `exitApp` | 7331 | Exit button |
| `toastMenu` | 7337 | pop-up message on the menu |
| `syncMenuSegs` | 7342 | highlight the chosen Skirmish options |
| `portraitImg` | 7502 | hero portrait picture |
| `renderCampaign` | 7504 | Campaign screen |
| `showBrief` | 7519 | mission briefing screen |
| `renderHeroes` | 7533 | Encyclopedia heroes tab |
| `paintMenuArt` | 7546 | menu background art |
| `renderEncy` | 7553 | Encyclopedia screen |
| `renderEncyList` | 7558 | Encyclopedia list for the chosen tab |
| `togglePause` | 7631 | pause or resume |

## SCREEN 8 · Sound

`src/js/ui/08-sound.js` · lines 7636 to 7892

All sounds and music are made by code (SFX).

**Things you can tweak**

- master.gain.value (0.22): overall volume.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `unlock` | 7649 | start the sound system after the first tap (phones need a tap first) |
| `note` | 7663 | play one music note |
| `noiseAt` | 7674 | drum and splash noise |
| `play` | 7720 | play a named sound effect |
| `schedule` | 7744 | keep the music playing ahead of time |
| `menuTheme` | 7773 | the menus: the asli melody slowed right down on a soft triangle, a gambus pluck under it, the sea washing in every two bars and a gong every four |
| `setMood` | 7788 | switch music between calm and battle |
| `apply` | 7790 | fade to the new music mood |
| `sfxForMsg` | 7795 | which sound goes with which game message |
| `sfxTick` | 7850 | play sounds for what happened this frame |
| `endGame` | 7862 | game over: show the result |

## SCREEN 9 · Main loop

`src/js/ui/09-main-loop.js` · lines 7893 to 7933

Starts the game and keeps it ticking: 30 rule steps a second, drawing every frame.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `frame` | 7898 | ---------------- main loop ---------------- |

## EXTRA 1 · Calm map look and new maps

`src/js/extras/01-maps.js` · lines 7934 to 8462

Add-on: the quieter ground painting and the newer skirmish maps (Highlands, Deep Jungle, Mangrove Delta...).

**Things you can tweak**

- NEWMAPS entries: each new map's layout.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `paint` | 7969 | paint the calm ground look |
| `tree` | 8016 | paint a regional tree (palm, broadleaf...) |
| `plant` | 8036 | biome plants, same palette and outline as the game's trees |
| `wildSprite` | 8120 | ---------- sprites (game pixel style: 2x bake, auto outline) ---------- |
| `foodSprite` | 8138 | durian and wild banana pictures |
| `treeFor` | 8150 | which tree type grows at a spot |
| `fields` | 8160 | ---------- the three maps: terrain fields worked out from the seed only ---------- |
| `lookOf` | 8177 | which ground look a map uses |
| `clearStarts` | 8193 | clear space around the start bases |
| `linkStarts` | 8198 | make sure both bases can reach each other |
| `genHighlands` | 8207 | make the Highlands map |
| `genJungle` | 8234 | make the Deep Jungle map |
| `genDelta` | 8250 | make the Mangrove Delta map |

## EXTRA 2 · Animals and kerbau

`src/js/extras/02-animals-kerbau.js` · lines 8463 to 8953

Add-on: fruit groves, hunt animals (kancil, boar, seladang) and kerbau herding, fattening and ploughing.

**Things you can tweak**

- KB: cap 6 kerbau each, perGran 3 per granary, fat0 200 -> fatMax 400 food over fatTime 240 s, plough 1.3 (= 30% faster farm), buy 75 gold.
- NK.durian / NK.pisang: food in the new fruit trees.
- UD.seladang atk: how hard it fights back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `bananaSprite` | 8491 | ---------- art ---------- |
| `berryArt` | 8508 | banana grove or mango tree picture |
| `kerbauSprite` | 8511 | kerbau picture: standing, grazing (head down) or ploughing (yoke and plough) |
| `haySprite` | 8555 | hay pile at the granary |
| `syahbandarSprite` | 8561 | Syahbandar Port (Melaka, Kingdom Age on): the lore hall, same size and footing as the port |
| `homeFor` | 8603 | where an owned kerbau should stand (granary, Town Centre or farm) |
| `sendHome` | 8616 | walk a kerbau to its spot |
| `kbSide` | 8680 | the quietest side of a building for kerbau spots |
| `slotIndex` | 8697 | which standing spot a kerbau gets (by arrival time) |
| `slotPoint` | 8707 | map position of a standing spot |
| `kbTick` | 8722 | kerbau each tick: claim, fatten, plough, follow |

## EXTRA 3 · Smarter AI

`src/js/extras/03-ai-plus.js` · lines 8954 to 9001

Add-on: the computer runs trade ships, claims wild kerbau, and Melaka's AI ploughs with them.

**Things you can tweak**

- AIP.traders: trade ships per difficulty (2/3/4).
- AIP.claimEvery (8 s), AIP.claimR (26 tiles): how often and how far it looks for kerbau.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aiPlus` | 8971 | the AI's extra jobs: trade ships, claim kerbau, plough |

## EXTRA 4 · Groups, facing and taps

`src/js/extras/04-groups-facing-taps.js` · lines 9002 to 9246

group tabs 1-4 and Make group, the Face button, soldiers facing their move direction, one-tap orders with two-finger deselect (or double-tap orders).

**Things you can tweak**

- TAP_MODE: 'single' (one tap orders) or 'double'; players switch it in Settings > Orders on touch (saved as seak-tapmode).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aimable` | 9024 |  |
| `startAim` | 9029 |  |
| `setTapMode` | 9043 |  |
| `twoFingerTap` | 9044 |  |
| `faceSoldiers` | 9070 | the Face button: press where the soldiers should stand, drag to face, let go |
| `toggleFace` | 9071 |  |
| `faceAim` | 9076 |  |
| `faceIcon` | 9085 | pixel icon: a turning arrow around the spot where the soldiers stand |
| `aimMove` | 9118 |  |
| `aimDir` | 9119 |  |
| `aimEnd` | 9120 |  |
| `paintAim` | 9132 |  |
| `groupUnits` | 9164 |  |
| `soldiersSel` | 9165 |  |
| `grpPanelButtons` | 9166 |  |
| `saveGroup` | 9172 |  |
| `makeGroup` | 9179 |  |
| `pickGroup` | 9184 |  |
| `updateGroupBar` | 9205 |  |
| `closeGrpMenu` | 9219 |  |
| `openGrpMenu` | 9220 |  |

## EXTRA 5 · Compact screen

`src/js/extras/05-compact-hud.js` · lines 9247 to 9371

a bigger play area: no hint strip (small clock, tips pop up then fade), slim one-row panel, icon-only command buttons, smaller foldable minimap.

**Things you can tweak**

- the CSS sizes at the top (minimap 84x63) and how long a tip stays (5 s).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `nameOf` | 9319 |  |
| `boot` | 9333 |  |
| `compactRest` | 9356 | the parts every page gets: the minimap fold button and group tabs that appear once a group exists |

## EXTRA 6 · Base footprints, wading, wet ports, house drop-off

`src/js/extras/06-footprint-wading.js` · lines 9372 to 9419

buildings stand on their base only (the roof hangs over the tiles behind), land units wade through shallow water in Skirmish, a Port's deck may sit on shallow water, Ayutthaya paddy farmers drop rice at their paired house, and the panel button tidy-ups (centred icons, red Demolish, one-row queue).

**Things you can tweak**

- FOOT: how many tile rows each building really stands on.
- WADE / PORTWET: switch wading and ports-on-shallows off. Missions keep their own water rules (no wading).
- HOUSEDROP: Ayutthaya farmers drop rice at their house.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `wadeOn` | 9387 | wading is for Skirmish; campaign missions and battles (they have setupObj) keep their own water rules |

## EXTRA 7 · Fire Arrows research

`src/js/extras/07-fire-arrows.js` · lines 9420 to 9486

Panah Api (lore/siege.md): from Age 2 the Barracks can research Fire Arrows once. Archers then do extra damage to buildings and set them alight more often. Torches on melee hits stay automatic.

**Things you can tweak**

- FIRE_ARROWS.cost / time / age: price, research seconds and the age it opens in.
- FIRE_ARROWS.bld: extra damage per arrow on a building; FIRE_ARROWS.chance: chance an arrow lights it (20% before).
- FIRE_ARROWS.aiGold: gold the computer keeps spare before it researches.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `fireArrowBtn` | 9480 | the Barracks button: research, progress, or done |

## EXTRA 8 · Khmer

`src/js/extras/08-khmer.js` · lines 9487 to 11631

the fourth civ (civ id 4, column 3 of the per-civ tables). Groundwork: every per-civ table gets a Khmer column. Until Khmer's own roster lands, a missing Khmer value copies Melaka's, so nothing breaks.

**Things you can tweak**

- KHMER: Khmer's own values; anything set here wins over the Melaka copy.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `barayPlots` | 9519 | the 8 plots (top-left tile of a 2 x 2 farm): 3 above, 3 below, 1 at each end |
| `barayPlotOf` | 9524 | which plot of Baray b this farm stands on (-1: none) |
| `plotFarm` | 9529 | the farm standing on a plot, if any |
| `weave` | 9554 |  |
| `sacks` | 9555 |  |
| `crates` | 9556 |  |
| `banner` | 9557 |  |
| `melakaBuilding` | 9559 |  |
| `neutralSite` | 9609 | Neutral map sites. Pangkalan can only be built on a landing next to a settlement. |
| `brick` | 9637 |  |
| `meru` | 9639 | meru: stacked black thatch tiers, each narrower than the one below |
| `surya` | 9641 | sun of Majapahit (Surya Majapahit) emblem |
| `mjBanner` | 9642 |  |
| `majapahitBuilding` | 9644 |  |
| `ijukRoof` | 9701 | black ijuk gable roof with a thick dark edge |
| `majapahitBase` | 9703 |  |
| `hull` | 9751 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 9759 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 9767 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 9775 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 9776 |  |
| `flag` | 9777 |  |
| `oars` | 9778 |  |
| `crew` | 9779 |  |
| `flames` | 9780 |  |
| `navalSprite` | 9793 |  |
| `drawCivUnit` | 9898 |  |
| `civUnitSprite` | 9984 |  |
| `elephantSprite` | 9989 | Chang Suek: Ayutthaya war elephant with a mahout and a spearman in a gilded howdah. 28x26 logical. |
| `drawKhmerUnit` | 10025 |  |
| `khmerUnitSprite` | 10069 |  |
| `ballistaElephantSprite` | 10074 | Ballista Elephant: elephant with a large double-bow crossbow on its back, crewed by two. 28x26 logical. |
| `khmerCanoeSprite` | 10100 | River war canoe from the Bayon naval relief: long, low, many paddlers, a carved prow. 32x18 logical. |
| `junk` | 10128 | Battened junk sail: a tall rectangle with battens and a rounded top-front corner. |
| `prow` | 10133 | Tall curving prow (Thai and Khmer barges). |
| `eye` | 10135 | Painted bow eye, the mark of Vietnamese boats. |
| `pavilion` | 10137 | Pavilion with a tiered pointed roof. |
| `mainlandShip` | 10142 |  |
| `civTeam` | 10268 |  |
| `thaiRoof` | 10274 | Thai roof: steep layered gable with chofa horns at the ridge ends |
| `vietRoof` | 10280 | Vietnamese roof: low tiled hip roof with upturned corners |
| `prasat` | 10287 | Khmer prasat tower: stepped sandstone tower with a lotus-bud top |
| `mainlandBuilding` | 10292 |  |
| `pier` | 10379 |  |
| `rack` | 10380 |  |
| `mainlandBase` | 10382 |  |
| `kmHash` | 10470 | deterministic hash for pit/texture placement |
| `kmLaterite` | 10472 | laterite blocks: rusty orange-brown, staggered courses, dark pits |
| `kmSand` | 10487 | sandstone: smooth grey-tan ashlar |
| `kmCoping` | 10497 | sandstone coping / cornice band |
| `kmPrasat` | 10499 | corncob prasat tower: a body with a false door, then stacked tiers tapering to a lotus bud |
| `kmFace` | 10523 | carved Bayon face: crown, brows, closed eyes, broad nose, calm smile. s = 1 small (7x9) or 2 large (11x13) |
| `kmNaga` | 10545 | naga balustrade: a stone serpent body on little posts, ending in a fanned multi-headed hood |
| `kmBanner` | 10555 | blue team banner with a gold border and a small gold lotus |
| `kmTileRoof` | 10557 | steep tile roof with ribbed tile channels and upswept gold gable horns |
| `kmBuilding` | 10568 |  |
| `cartBallistaSprite` | 10686 |  |
| `kmHash` | 10734 | deterministic hash for pit/texture placement |
| `kmLaterite` | 10736 | laterite blocks: rusty orange-brown, staggered courses, dark pits |
| `kmSand` | 10751 | sandstone: smooth grey-tan ashlar |
| `kmCoping` | 10761 | sandstone coping / cornice band |
| `kmPrasat` | 10763 | corncob prasat tower: a body with a false door, then stacked tiers tapering to a lotus bud |
| `kmFace` | 10787 | carved Bayon face: crown, brows, closed eyes, broad nose, calm smile. s = 1 small (7x9) or 2 large (11x13) |
| `kmNaga` | 10809 | naga balustrade: a stone serpent body on little posts, ending in a fanned multi-headed hood |
| `kmBanner` | 10819 | blue team banner with a gold border and a small gold lotus |
| `kmTileRoof` | 10821 | steep tile roof with ribbed tile channels and upswept gold gable horns |
| `kmBuilding` | 10832 |  |
| `bxPaddy` | 10953 | rice paddy shared by both: water, bunds, rows of rice that grow with the level |
| `bxSpears` | 10965 | a rack of spears (tassel colour per civ) |
| `kmBuildingX` | 10967 |  |
| `building` | 11020 |  |
| `kmUnit` | 11139 |  |
| `kmuPerson` | 11147 |  |
| `kmuDoubleBow` | 11275 | Each bow is an arc with its tips bent back; the string runs to the nock (drawn) or straight across (shot). |
| `kmuCrew` | 11291 | small seated/standing figure: head at y, body below |
| `kmuElephant` | 11299 |  |
| `kmuCart` | 11342 |  |
| `guardUnit` | 11379 |  |
| `gduPerson` | 11384 |  |
| `kmShipFor` | 11500 |  |
| `baraySprite` | 11520 |  |
| `barayBasket` | 11547 | a basket of rice in logical pixels of the Baray art |

## EXTRA 9 · The computer's Ayutthaya households

`src/js/extras/09-ai-households.js` · lines 11632 to 11706

Add-on: when the computer plays Ayutthaya it builds each house touching a paddy (and each paddy touching a house) and keeps one farmer on every paired paddy, so its houses pay household food like yours. Skipped in campaign missions and battles (g.M set). Drafted and tested by the Game demos thread (Ayutthaya AI went from 12 wins, 23 losses to 25 wins, 10 losses over 72 matches).

**Things you can tweak**

- AYH.want: households the computer aims for by difficulty (2/4/6; the game's own cap is HOUSEHOLD.max).
- AYH.every (6 s) and AYH.farmWood (120): how often it checks, and the wood it needs before adding a paddy.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `spotBeside` | 11654 | a free spot for `kind` touching building `o`, nearest the town centre |
| `tend` | 11683 |  |

## EXTRA 10 · Computer-player fixes

`src/js/extras/10-ai-fixes.js` · lines 11707 to 11811

Add-on from the overnight computer-vs-computer test of v0.9.49 (Game demos thread): - Big Islands: a loaded galley left idle lands its troops again, and the port builds galleys first when it is short. - Economy: now and then one villager moves from the fullest stock to the emptiest (no more wood piles and no food). - Ages: when the next age is due and unaffordable, it stops training past a home guard until it can pay. - Trade ships with no water route to the trading post give up (the player gets a message too).

**Things you can tweak**

- AIFIX.every, rich, poor: how often it checks and when one stock counts as too full or too empty.
- AIFIX.farms (4), AIFIX.tradeStuck (25 s), AIFIX.ageArmy (4).
- AIFIX.ageAt copies the AT table in aiTick (age times by difficulty): keep the two in step.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aiFix` | 11735 |  |
