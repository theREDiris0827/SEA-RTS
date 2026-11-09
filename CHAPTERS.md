# Chapter map

Every chapter of the game: where it sits in `index.html`, what it does, the numbers that are safe to tweak, and every function in it with a one-line note. Made by `python3 tools/chapter_map.py`.

**How to use it:** find the chapter, open its file in `src/` (or jump to the line in `index.html`) and look for the `CHAPTER` box at the top. Functions have a `//` note just above them.

**After changing a number:** if you edited `index.html`, run `python3 tools/build.py split`. If you edited a file in `src/`, run `python3 tools/build.py`. Then open `index.html` in a browser to test.

| Chapter | File | Lines in index.html |
|---|---|---|
| [SIM 1 · Basics](#sim-1--basics) | `src/js/sim/01-core.js` | 591 to 659 |
| [SIM 2 · Units, civs and buildings](#sim-2--units-civs-and-buildings) | `src/js/sim/02-units-buildings.js` | 660 to 818 |
| [SIM 3 · Ages, resources, AI difficulty, maps](#sim-3--ages-resources-ai-difficulty-maps) | `src/js/sim/03-ages-resources-ai-maps.js` | 819 to 947 |
| [SIM 4 · Starting a game](#sim-4--starting-a-game) | `src/js/sim/04-game-setup.js` | 948 to 1394 |
| [SIM 5 · Units, costs and ages](#sim-5--units-costs-and-ages) | `src/js/sim/05-entities-ages.js` | 1395 to 1622 |
| [SIM 6 · Finding the way](#sim-6--finding-the-way) | `src/js/sim/06-paths-and-searching.js` | 1623 to 1804 |
| [SIM 7 · Orders](#sim-7--orders) | `src/js/sim/07-orders.js` | 1805 to 2144 |
| [SIM 8 · Building and training](#sim-8--building-and-training) | `src/js/sim/08-building-training.js` | 2145 to 2359 |
| [SIM 9 · Every tick: buildings, soldiers, fire](#sim-9--every-tick-buildings-soldiers-fire) | `src/js/sim/09-every-tick.js` | 2360 to 2842 |
| [SIM 10 · Gathering, repairing, damage](#sim-10--gathering-repairing-damage) | `src/js/sim/10-gather-repair-damage.js` | 2843 to 3183 |
| [SIM 11 · What you tapped, and the enemy AI](#sim-11--what-you-tapped-and-the-enemy-ai) | `src/js/sim/11-enemy-ai.js` | 3184 to 3462 |
| [ART 1 · Drawing basics](#art-1--drawing-basics) | `src/js/art/01-core.js` | 3463 to 3532 |
| [ART 2 · People](#art-2--people) | `src/js/art/02-people.js` | 3533 to 3745 |
| [ART 3 · Nature](#art-3--nature) | `src/js/art/03-nature.js` | 3746 to 3792 |
| [ART 4 · Ships](#art-4--ships) | `src/js/art/04-ships.js` | 3793 to 3964 |
| [ART 5 · Melaka and Majapahit buildings](#art-5--melaka-and-majapahit-buildings) | `src/js/art/05-melaka-majapahit-buildings.js` | 3965 to 4292 |
| [ART 6 · Ayutthaya](#art-6--ayutthaya) | `src/js/art/06-ayutthaya.js` | 4293 to 5194 |
| [ART 7 · Soldiers through the ages](#art-7--soldiers-through-the-ages) | `src/js/art/07-age-looks.js` | 5195 to 5539 |
| [ART 8 · Shared buildings and walls](#art-8--shared-buildings-and-walls) | `src/js/art/08-shared-buildings.js` | 5540 to 5747 |
| [ART 9 · Icons](#art-9--icons) | `src/js/art/09-icons.js` | 5748 to 5791 |
| [ART 10 · Ground](#art-10--ground) | `src/js/art/10-terrain.js` | 5792 to 5883 |
| [SCREEN 1 · Screen, camera, fog](#screen-1--screen-camera-fog) | `src/js/ui/01-screen-camera-fog.js` | 5884 to 6004 |
| [SCREEN 2 · Drawing the battlefield](#screen-2--drawing-the-battlefield) | `src/js/ui/02-drawing.js` | 6005 to 6505 |
| [SCREEN 3 · Selecting and giving orders](#screen-3--selecting-and-giving-orders) | `src/js/ui/03-selecting.js` | 6506 to 6707 |
| [SCREEN 4 · Touch, mouse and keys](#screen-4--touch-mouse-and-keys) | `src/js/ui/04-touch-mouse-keys.js` | 6708 to 6838 |
| [SCREEN 5 · Action panel](#screen-5--action-panel) | `src/js/ui/05-action-panel.js` | 6839 to 7075 |
| [SCREEN 6 · Top bar, game flow and saves](#screen-6--top-bar-game-flow-and-saves) | `src/js/ui/06-hud-saves.js` | 7076 to 7212 |
| [SCREEN 7 · Menus and encyclopedia](#screen-7--menus-and-encyclopedia) | `src/js/ui/07-menus-encyclopedia.js` | 7213 to 7547 |
| [SCREEN 8 · Sound](#screen-8--sound) | `src/js/ui/08-sound.js` | 7548 to 7804 |
| [SCREEN 9 · Main loop](#screen-9--main-loop) | `src/js/ui/09-main-loop.js` | 7805 to 7845 |
| [EXTRA 1 · Calm map look and new maps](#extra-1--calm-map-look-and-new-maps) | `src/js/extras/01-maps.js` | 7846 to 8373 |
| [EXTRA 2 · Animals and kerbau](#extra-2--animals-and-kerbau) | `src/js/extras/02-animals-kerbau.js` | 8374 to 8858 |
| [EXTRA 3 · Smarter AI](#extra-3--smarter-ai) | `src/js/extras/03-ai-plus.js` | 8859 to 8906 |
| [EXTRA 4 · Groups, facing and taps](#extra-4--groups-facing-and-taps) | `src/js/extras/04-groups-facing-taps.js` | 8907 to 9141 |
| [EXTRA 5 · Compact screen](#extra-5--compact-screen) | `src/js/extras/05-compact-hud.js` | 9142 to 9252 |
| [EXTRA 6 · Base footprints, wading, wet ports, house drop-off](#extra-6--base-footprints-wading-wet-ports-house-drop-off) | `src/js/extras/06-footprint-wading.js` | 9253 to 9300 |
| [EXTRA 7 · Fire Arrows research](#extra-7--fire-arrows-research) | `src/js/extras/07-fire-arrows.js` | 9301 to 9367 |
| [EXTRA 8 · Khmer](#extra-8--khmer) | `src/js/extras/08-khmer.js` | 9368 to 9392 |
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
| `CI` | 716 | which column of a [Melaka, Majapahit, Ayutthaya, Khmer] table to read |
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

`src/js/sim/04-game-setup.js` · lines 948 to 1394

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
| `regionAt` | 1088 | which island or river bank a point is on |
| `coastNear` | 1090 | a dry tile on the shore near (x, y), at least 5 tiles out: where a base's port road goes |
| `snapshot` | 1104 | Everything that can't be rebuilt goes into a plain JSON object. Lookup tables (byId, the spatial hash, path scratch, claims) and short-lived effects are... |
| `genMap` | 1131 | make the land, water and cliffs for a skirmish map |
| `genRiverlands` | 1196 | Riverlands: four rivers that meet in the middle; sandy fords are the only dry crossings |
| `genIslands` | 1220 | Big Islands: four large islands, one for each side and two to fight over, with deep channels between |
| `landConnected` | 1231 | can you walk from A to B? |
| `isLand` | 1246 | is the tile land? |
| `isWater` | 1248 | is the tile water? |
| `freeTile` | 1250 | is the tile empty land? |
| `addNode` | 1253 | put a tree, bush, gold or fish on the map |
| `removeNode` | 1262 | remove a used-up resource |
| `populate` | 1269 | place bases, villagers, resources and villages at the start |
| `addVillage` | 1362 | place a neutral Orang Laut village with its landing |
| `siteAt` | 1393 | the free village landing whose corner is at (tx, ty), if any |

## SIM 5 · Units, costs and ages

`src/js/sim/05-entities-ages.js` · lines 1395 to 1622

Adding units and buildings, working out prices (costOf), what a building can train, and climbing the ages.

**Things you can tweak**

- costOf(): where civ discounts are applied.
- applyAge(): what happens when an age finishes.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `addUnit` | 1404 | ======================= entities ======================= |
| `unitName` | 1423 | a unit's civ name |
| `costOf` | 1425 | price of a unit or building after civ discounts (MEL_LEVY, TEAMMOD) |
| `trainable` | 1433 | what a building can train for this team (unique units and ships belong to one civ) |
| `lockedTrain` | 1435 | what this building will train in a later age (shown greyed out with the age it needs) |
| `countOf` | 1440 | how many of a kind a team has |
| `canAfford` | 1447 | enough resources? |
| `pay` | 1449 | take the cost |
| `refund` | 1451 | give the cost back |
| `teamAge` | 1454 | ======================= ages ======================= |
| `ageText` | 1456 | what the next age still needs, as text |
| `ageNeedMet` | 1462 | are the next age's needed buildings built? |
| `startAge` | 1469 | begin researching the next age |
| `cancelAge` | 1480 | stop an age-up and refund it |
| `ageTick` | 1486 | count down age research |
| `applyAge` | 1493 | finish an age-up: Town Centre hp, unit looks, unlocks |
| `morphUnit` | 1506 | swap a unit for another kind in place, keeping its share of health |
| `armForAge` | 1513 | foot soldiers get mail in the Age of Commerce and more in the Golden Age; light ranged units turn elite in the Golden Age |
| `addBuilding` | 1522 | add a building to the map |
| `evict` | 1539 | push units off a new building's tiles |
| `setGateLock` | 1550 | an own gate: open lets your own people through and stops enemies, closed stops everyone |
| `walkable` | 1557 | can a unit stand on this tile? |
| `nearestFree` | 1565 | the closest empty tile |
| `unitNear` | 1582 | is another unit close to this spot? |
| `openSpot` | 1587 | centre of the nearest walkable tile nobody is standing on |
| `findSpawn` | 1603 | spawn tile next to a building, preferring the side facing 'toward' (and tiles nobody stands on) |

## SIM 6 · Finding the way

`src/js/sim/06-paths-and-searching.js` · lines 1623 to 1804

A* pathfinding, straight-line checks, and quick searches like "nearest enemy" or "units near here".

**Things you can tweak**

- Mostly leave alone. nearestEnemy() decides what idle soldiers notice.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `findPath` | 1631 | ======================= pathfinding ======================= |
| `los` | 1678 | straight line clear between two points? |
| `smooth` | 1691 | straighten a path so units don't zig-zag |
| `pathToRect` | 1702 | path to within `reach` of a rectangle (continuous coords) |
| `pathToPoint` | 1720 | find a path to a spot |
| `setPath` | 1735 | give a unit its new path |
| `stepMove` | 1740 | move a unit along its path for one tick |
| `rebuildHash` | 1761 | ======================= spatial queries ======================= |
| `unitsNear` | 1770 | all units within a radius (fast grid lookup) |
| `isVisible` | 1779 | is this spot out of the fog? |
| `nearestEnemy` | 1781 | the closest enemy a unit can see |

## SIM 7 · Orders

`src/js/sim/07-orders.js` · lines 1805 to 2144

What happens when you tap: gather, attack, board a ship, land, shelter in the Town Centre (town bell), trade, move in formation.

**Things you can tweak**

- BD.towncentre.garrison / BD.tower.garrison (chapter 2): how many villagers shelter.
- groupMove(): spacing of formations.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `idleOrder` | 1814 | ======================= orders ======================= |
| `gatherInfo` | 1816 | what a target gives and how fast, if it can be gathered |
| `orderGather` | 1823 | send a villager to gather |
| `orderAttack` | 1833 | send a unit to attack |
| `orderBoard` | 1838 | send a unit onto a ship |
| `roomIn` | 1840 | garrison: villagers shelter in a Town Centre (15) or tower (5); each one inside adds an arrow |
| `orderGarrison` | 1842 | send a villager to shelter in a building |
| `doGarrison` | 1844 | walk to the shelter and go inside |
| `shelterFor` | 1862 | nearest building with room to shelter |
| `ringBell` | 1868 | the town bell: every villager runs for the nearest shelter with room; All clear sends them back to work |
| `ungarrison` | 1884 | let sheltered villagers out |
| `allClear` | 1898 | end the town bell: everyone back to work |
| `orderLand` | 1906 | send a loaded ship to a beach |
| `shoreTile` | 1908 | the water tile next to a beach nearest (x, y), leaning towards (bx, by) |
| `waterReach` | 1923 | every water tile a ship can sail to from where it is |
| `doBoard` | 1937 | a land unit climbs aboard once it reaches the galley |
| `doLand` | 1958 | a galley sails to the beach nearest (x, y) and puts its troops ashore |
| `launchRaft` | 1989 | a Port pushes a burning raft out at the nearest enemy ship |
| `orderTrade` | 2003 | start a trade ship's route |
| `orderBuild` | 2005 | send a villager to build |
| `orderMove` | 2007 | plain move |
| `orderAMove` | 2009 | attack-move (fight anything on the way) |
| `command` | 2012 | group order from the player (or the AI). ids -> units owned by `team` |
| `groupMove` | 2095 | move a group in formation |

## SIM 8 · Building and training

`src/js/sim/08-building-training.js` · lines 2145 to 2359

Where a building may go, laying walls in lines, the build queue, population, and drop-off points.

**Things you can tweak**

- WALL_MAX (chapter 2) limits a wall drag.
- popCap(): MAXPOP from chapter 1.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `canPlace` | 2154 | ======================= building / training ======================= |
| `underPortArt` | 2178 | a port's hall stands up above its deck: nothing may be built where the hall's art goes, and a port's hall can't cover another building |
| `canFloat` | 2191 | Ayutthaya raft house moored out on the river: the whole 2x2 on water, its edge against the bank (a bamboo gangway), and open water on the river side so... |
| `houseKind` | 2206 | an Ayutthaya house set down on the water floats as a raft house; one built on land always stays a house (Iylia, 2026-11-08) |
| `waterSide` | 2208 | how many open water tiles ring a footprint |
| `wallPieceAt` | 2217 | the team's own palisade or wall (or any wall piece, gates included, unless plain) on a tile |
| `lineTiles` | 2223 | tiles of a wall line from (ax, ay) to (bx, by), stepping one axis at a time so there are no diagonal gaps |
| `placeLine` | 2234 | lay a palisade or wall line; own wall tiles on the way are kept, blocked tiles are skipped. returns {ok, n, why} |
| `placeBuilding` | 2256 | returns {ok, b, why} |
| `queueUnit` | 2276 | add a unit to a building's training queue |
| `cancelQueue` | 2290 | remove one from the queue and refund it |
| `popOf` | 2297 | how many people a team has |
| `popCap` | 2299 | housing limit |
| `dropOffs` | 2301 | buildings that take a resource |
| `nearestDrop` | 2306 | nearest drop-off for a resource |
| `nearestNode` | 2312 | nearest resource of a type; one with a free gathering slot wins over a full one |
| `freeSameKind` | 2336 | nearest other resource of the same kind as `like` (tree -> tree, farm -> own farm) with a free slot |
| `gatherCap` | 2347 | how many villagers (or boats) may work one resource at once |
| `claimsOf` | 2349 | how many villagers are on a resource |
| `countClaims` | 2351 | recount villagers per resource |
| `setRally` | 2356 | set where new units walk to |

## SIM 9 · Every tick: buildings, soldiers, fire

`src/js/sim/09-every-tick.js` · lines 2360 to 2842

Runs 30 times a second: buildings train and heal, soldiers pick fights by stance, healers heal, ships shoot, buildings burn.

**Things you can tweak**

- guardOrder(): how far Defensive soldiers chase (r: 11 tiles).
- fireOn(): who sets buildings alight and how often (archers 20% from Age 2).
- BURN (chapter 2) for fire strength.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `update` | 2370 | ======================= per-tick update ======================= |
| `doFishHouse` | 2388 | fishing from a raft house's deck: no walking to a drop-off, the catch goes straight into the store |
| `households` | 2405 | household while its paddy is worked, and a raft house while its woman fishes from the deck |
| `housePairs` | 2413 | one paddy per house: pair each finished land house with the nearest unused paddy touching it (farm id -> house) |
| `householdTick` | 2429 | Ayutthaya households pay food |
| `updateBuilding` | 2439 | one tick for a building: build, train, shoot, heal |
| `finishBuilding` | 2500 | a building is finished |
| `updateUnit` | 2522 | one tick for a unit: cooldowns, then its current order |
| `doIdle` | 2566 | what an idle unit does (look for enemies by stance) |
| `guardOrder` | 2592 | stances: 'agg' chases whatever it sees, 'def' (default) chases up to 11 tiles from its post then walks back, 'hold' never moves |
| `orderReturn` | 2594 | walk back to the post; a soldier hit on the way fights back instead of ignoring it |
| `breach` | 2596 | a land soldier whose way is walled off attacks the enemy wall piece that is most in the way to (gx, gy) |
| `doAMove` | 2607 | attack-move step |
| `doAttack` | 2623 | chase and hit a target |
| `doWander` | 2675 | animals wander |
| `doFlee` | 2687 | animals run from hunters |
| `doTrade` | 2699 | trade ship: sail to the Trading Post, load goods, sail home to the nearest Port and get paid by distance |
| `canHeal` | 2723 | healing: allies on land, hurt, and out of combat for HEAL_CALM seconds |
| `healOne` | 2725 | heal one unit |
| `healStep` | 2727 | idle healer: heal what's in reach, or walk over to the worst-hurt ally it can see |
| `doHeal` | 2751 | healer walks to and heals a target |
| `shipShot` | 2760 | a ship's main weapon: arrows (fire arrows from tier 1), boarding, or cannon (tier 2) |
| `secShot` | 2774 | secondary weapon (galley archers, flagship arrows) on its own reload |
| `fireOn` | 2787 | fire on buildings (lore/siege.md, Iylia 2026-10-25), all of it automatic: foot soldiers carry obor torches, gunners throw gunpowder fire pots (two fires at... |
| `ignite` | 2795 | set a building or wooden ship burning; stacks up to BURN.max |
| `updateBurning` | 2803 | burning buildings and ships lose hp |
| `explode` | 2830 | fire ship: burns everything hostile around it and sinks itself |

## SIM 10 · Gathering, repairing, damage

`src/js/sim/10-gather-repair-damage.js` · lines 2843 to 3183

Villagers gathering and carrying, repairing and demolishing, building, units pushing apart, and the damage formula. Also fog of war and the win/lose check.

**Things you can tweak**

- damage(): the damage formula (attack + bonus - armour).
- doRepair(): repair cost and speed.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `doGather` | 2852 | villager gathers, carries the load to a drop-off, and goes back |
| `workSpot` | 2952 | where a gatherer stands while working: inside a farm, or hugging the side of a node it walked up to |
| `doRepair` | 2982 | repair: a full fix takes 1.5x the build time for one villager (more help, faster) and costs half the building's price in wood (at least 25), paid as the... |
| `canDemolish` | 3001 | knock down your own building: nothing comes back. The Town Centre can't be (losing it loses the game) |
| `demolish` | 3003 | take down your own building |
| `doBuild` | 3012 | villager builds |
| `separate` | 3036 | push units apart so they don't stack |
| `nudge` | 3058 | small push for one unit |
| `gunFx` | 3064 | gunpowder at the muzzle: a flash, then thick pale smoke billowing forward and drifting up |
| `damage` | 3070 | the damage formula: attack + bonus - armour |
| `onKilled` | 3109 | something died: score, loot, messages |
| `msg` | 3133 | show a short message |
| `cleanup` | 3136 | remove the dead |
| `updateFx` | 3149 | age out effects |
| `updateFog` | 3163 | recompute what each side can see |
| `checkEnd` | 3179 | win or lose? |

## SIM 11 · What you tapped, and the enemy AI

`src/js/sim/11-enemy-ai.js` · lines 3184 to 3462

pick() finds what is under your finger. aiTick() is the computer player: it gathers, builds, trains, ages up, attacks and retreats.

**Things you can tweak**

- DIFF (chapter 3) is the safest place to change the AI.
- aiRetreat(): when a beaten attack falls back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pick` | 3193 | ======================= picking ======================= |
| `aiTick` | 3219 | ======================= enemy AI (Majapahit) ======================= |
| `aiFerry` | 3371 | Big Islands: board a wave onto the galleys, sail them over and land it by the enemy base; anyone already ashore over there marches on the nearest enemy... |
| `aiRetreat` | 3414 | an attack that has clearly failed comes home: under a third left, or still fighting after 3 minutes |
| `aiBuild` | 3425 | AI places a building near its Town Centre |
| `aiBuildShore` | 3438 | AI places a port on the coast |
| `aiBuildNear` | 3448 | AI places a drop-off near resources |

## ART 1 · Drawing basics

`src/js/art/01-core.js` · lines 3463 to 3532

All art is drawn by code, pixel by pixel, then cached as pictures. Team colours and the sprite helper live here.

**Things you can tweak**

- TEAMC: each team's colours. SKIN, HAIR, STEEL, WOOD: shared colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `cv` | 3485 | make a blank drawing canvas |
| `sprite` | 3487 | draw a picture once with the pixel painter P, then reuse the cached copy |
| `outlineCanvas` | 3498 | add the dark outline around a sprite |
| `whiteOf` | 3512 | a white copy of a sprite (flash when hit) |
| `disc` | 3519 | paint a filled pixel circle |
| `planks` | 3521 | paint a wooden plank wall |
| `roofGable` | 3523 | paint a sloped gable roof |
| `posts` | 3531 | paint wooden stilts or posts |

## ART 2 · People

`src/js/art/02-people.js` · lines 3533 to 3745

Villagers and soldiers: bodies, legs, weapons and the walk cycle.

**Things you can tweak**

- GOLD, LUK, LEGS: shared colours and leg poses.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `drawUnit` | 3553 | paint a Melaka/Majapahit person: body, clothes, weapon and pose |
| `unitAge` | 3681 | the team's age picks the look (AGEART, below); neutral and pre-age callers get the Kingdom Age roster |
| `unitSprite` | 3683 | the picture for a unit, with its age look |
| `civUnitSprite` | 3685 | the picture for a unit by civ (Ayutthaya has its own art) |
| `deerSprite` | 3691 | deer picture |
| `carcassSprite` | 3701 | hunted animal carcass picture |
| `hull` | 3710 | hull with upswept bow and stern; x0..x1 is the deck length, y the deck line |
| `tanja` | 3717 | tanja: slanted four-sided sail between two spars, the classic Nusantara rig |
| `boatSprite` | 3725 | fishing boat picture |

## ART 3 · Nature

`src/js/art/03-nature.js` · lines 3746 to 3792

Trees, bushes, gold, fish and deer.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `treeSprite` | 3751 | ------------------------------ nature ------------------------------ |
| `bushSprite` | 3777 | berry bush picture |
| `goldSprite` | 3785 | gold deposit picture |

## ART 4 · Ships

`src/js/art/04-ships.js` · lines 3793 to 3964

Every civ's ships, sails and hulls (NAVAL).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hull` | 3813 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 3821 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 3829 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 3837 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 3839 | paint a ship mast |
| `flag` | 3841 | paint a small flag |
| `oars` | 3843 | paint a row of oars |
| `crew` | 3845 | paint a crewman on deck |
| `flames` | 3847 | paint flames |
| `navalSprite` | 3861 | a ship picture by kind and civ |

## ART 5 · Melaka and Majapahit buildings

`src/js/art/05-melaka-majapahit-buildings.js` · lines 3965 to 4292

Town Centres, houses, barracks and other buildings for the first two civs (CIVB).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `weave` | 3979 | paint woven bamboo walls |
| `sacks` | 3981 | paint grain sacks |
| `crates` | 3983 | paint trade crates |
| `banner` | 3985 | paint a Melaka banner |
| `melakaBuilding` | 3988 | a Melaka building picture |
| `neutralSite` | 4038 | Neutral map sites. Pangkalan can only be built on a landing next to a settlement. |
| `brick` | 4066 | paint red brick courses |
| `meru` | 4068 | meru: stacked black thatch tiers, each narrower than the one below |
| `surya` | 4070 | sun of Majapahit (Surya Majapahit) emblem |
| `mjBanner` | 4072 | paint a Majapahit banner |
| `majapahitBuilding` | 4075 | a Majapahit building picture |
| `ijukRoof` | 4132 | black ijuk gable roof with a thick dark edge |
| `majapahitBase` | 4135 | Majapahit Town Centre and palace base |
| `pier` | 4177 | pier() and rack() from buildings-mainland.js, used by the Majapahit port and barracks |
| `rack` | 4179 | paint a drying rack |
| `drawHealer` | 4189 | paint a healer (Tabib, Acaraki, Mo) |
| `healerSprite` | 4236 | healer picture |
| `herbBed` | 4244 | paint a herb bed |
| `healerBuilding` | 4247 | healer building picture (Rumah Tabib, Patirthan) |

## ART 6 · Ayutthaya

`src/js/art/06-ayutthaya.js` · lines 4293 to 5194

All Ayutthaya art: people, elephants, buildings and boats (AYART).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ayUnit` | 4317 | an Ayutthaya unit picture |
| `ayuPerson` | 4325 | paint an Ayutthaya person |
| `ayuElephant` | 4443 | ---------- Chang Suek: war elephant, 32x32, facing right ---------- |
| `ayuCannon` | 4514 | ---------- bronze cannon on a field carriage, 26x18, with a purple pennant ---------- |
| `ayRoofTri` | 4554 | steep roof triangle seen from the gable end: tile courses, a coloured rim along both slopes |
| `ayChofa` | 4562 | chofa: slender gold hook rising from the gable apex |
| `ayHangHong` | 4564 | hang hong: small upturned gold curls at the lower ends of the gable boards |
| `ayGable` | 4566 | Thai gable: tiled triangle, dark gable face framed by gold pan lom boards, chofa on top, hang hong at the foot |
| `ayEave` | 4584 | eave skirt: a lower roof tier spreading out under a gable |
| `ayWhite` | 4592 | white-washed brick: lime plaster with faint courses and weathering |
| `ayLeaf` | 4598 | bai sema merlon: a leaf shape with a point on top |
| `ayBanner` | 4603 | purple thong banner with a little white elephant |
| `ayTeak` | 4609 | teak panel wall (fa pakon): framed panels |
| `ayHouse` | 4615 | small Ruean Thai, used by the house and the raft house |
| `ayBuilding` | 4635 | an Ayutthaya building picture |
| `hull` | 4776 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 4784 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 4792 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 4800 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 4802 | paint a ship mast |
| `flag` | 4804 | paint a small flag |
| `oars` | 4806 | paint a row of oars |
| `crew` | 4808 | paint a crewman on deck |
| `flames` | 4810 | paint flames |
| `navalSprite` | 4824 | a ship picture by kind and civ |
| `junk` | 4943 | Battened junk sail: a tall rectangle with battens and a rounded top-front corner. |
| `prow` | 4948 | Tall curving prow (Thai and Khmer barges). |
| `eye` | 4950 | Painted bow eye, the mark of Vietnamese boats. |
| `pavilion` | 4952 | Pavilion with a tiered pointed roof. |
| `mainlandShip` | 4958 | a Khmer/Dai Viet ship picture (battle demos) |
| `womanSprite` | 5072 | Phrai Ying: a village woman of Ayutthaya. Short hair (as European visitors noted of Siamese women), a sabai cloth across the chest, an ankle-length pha sin,... |
| `aySpears` | 5110 | rack of spears with red tassels |
| `ayShield` | 5112 | small purple round shield with a gold boss |
| `ayBuildingX` | 5114 | Ayutthaya barracks, port, granary, teak store and farm pictures |
| `unit` | 5182 | an Ayutthaya unit picture (falls back to the shared art) |
| `building` | 5190 | Ayutthaya building picture (shared entry point) |
| `ship` | 5192 | Ayutthaya ship picture (shared entry point) |

## ART 7 · Soldiers through the ages

`src/js/art/07-age-looks.js` · lines 5195 to 5539

How soldiers' dress changes each age (AGEART), plus guns and armour (XU).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hexRGB` | 5211 | Melaka age progression mockups. Runs in the game page after art.js (and heroes-art.js). melAge(kind, age, anim, f): keris / tombak / archer drawn with the... |
| `recolor` | 5213 | swap colours on a finished picture |
| `melAge` | 5221 | Melaka soldier picture for a given age |
| `melGunner` | 5247 | Melaka gunner picture |
| `melMeriam` | 5271 | Melaka bronze cannon picture |
| `xuFlash` | 5301 | muzzle flash pointing right, x = first pixel past the muzzle, y = bore centre |
| `xuSmoke` | 5304 | a few puffs drifting up from (x, y) |
| `xUnit` | 5310 | extra unit pictures (guns, armour) |
| `mpAge` | 5427 | ---------- Majapahit: the game's Majapahit drawing, a kere (mail coat) from age 2, a bronze helmet in age 3 ---------- |
| `helmet` | 5446 | paint a bronze helmet |
| `mpMusket` | 5451 | the Bedil Kraton (Golden Age): the bedil gunner in a kere with a gold belt |
| `lightAge` | 5461 | ---------- light ranged units: levy cloth in age 1, a gold sash and band in age 4, never mail ---------- |
| `canvasRecolor` | 5472 | copy a picture with colours swapped |
| `ayAge` | 5480 | Ayutthaya soldier picture for a given age |
| `unit` | 5499 | pick the right age look for any civ's soldier |
| `shipSprite` | 5524 | the picture for a ship on the map |
| `raftSprite` | 5526 | rakit api: a bamboo raft heaped with dry fronds and husks, already alight |
| `shipAnchor` | 5538 | where a ship picture sits on its tile |

## ART 8 · Shared buildings and walls

`src/js/art/08-shared-buildings.js` · lines 5540 to 5747

Walls, gates, farms, ports and other buildings every civ shares, and wall styles by age.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `wallSprite` | 5548 | one wall tile. mask: 1 N, 2 E, 4 S, 8 W neighbours of the same side; open: a gate with friends close by. Palisade: sharpened logs. Melaka Kubu: planked... |
| `sawahSprite` | 5660 | Sawah: stepped rice terraces with water between the rows, earth bunds and a dangau hut (lore/scenes/bld-extra.js, fitted to 3 tiles) |
| `buildingSprite` | 5684 | the picture for a building |
| `civBuildingSprite` | 5686 | the picture for a building by civ |

## ART 9 · Icons

`src/js/art/09-icons.js` · lines 5748 to 5791

Small pictures for buttons, and marks on the ground.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `iconSprite` | 5753 | ------------------------------ icons & decals ------------------------------ |
| `rubbleSprite` | 5782 | rubble left by a destroyed building |

## ART 10 · Ground

`src/js/art/10-terrain.js` · lines 5792 to 5883

Grass, sand, water and cliffs (PAL is the ground palette).

**Things you can tweak**

- PAL: ground colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `buildTerrain` | 5805 | paint the whole ground map once at the start |
| `buildMiniBase` | 5876 | paint the minimap ground |

## SCREEN 1 · Screen, camera, fog

`src/js/ui/01-screen-camera-fog.js` · lines 5884 to 6004

Everything the player sees and touches starts here: the canvas, the camera, the fog of war and the build list.

**Things you can tweak**

- setZoom(): zoom limits, clamp(z, 0.38, 2.6). 0.38 = furthest out.
- clampCam(): how far past the map edge you can pan (0.3 and 0.35 of the screen).
- BUILD_ORDER, ECO_BLD: the order of build buttons and which tab they sit in.
- FORMS: formation types.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `clamp` | 5918 | ---------------- helpers ---------------- |
| `s2w` | 5920 | screen point to map point |
| `w2s` | 5922 | map point to screen point |
| `fmtTime` | 5924 | seconds as m:ss |
| `dataURL` | 5927 | picture as an image link (cached) |
| `fitIcon` | 5932 | shrink a sprite into an icon |
| `unitIcon` | 5941 | button icon for a unit |
| `bldIcon` | 5943 | button icon for a building |
| `resIcon` | 5949 | icon for food, wood or gold |
| `nodeIcon` | 5951 | icon for a resource on the map |
| `toast` | 5956 | pop-up message on screen |
| `resize` | 5964 | ---------------- view and camera ---------------- |
| `clampCam` | 5972 | the camera may run a little past each edge, so the corners can be brought out from under the HUD |
| `setZoom` | 5978 | zoom the camera, kept between 0.38 (far) and 2.6 (close) |
| `centerOn` | 5985 | move the camera to a tile |
| `inView` | 5987 | is this on screen? |
| `initFog` | 5990 | ---------------- fog ---------------- |
| `refreshFog` | 5995 | repaint the fog layer |

## SCREEN 2 · Drawing the battlefield

`src/js/ui/02-drawing.js` · lines 6005 to 6505

Draws ground, buildings, units, health bars, fire, arrows and the minimap every frame, sorted so nearer things cover farther ones.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ell` | 6011 | ---------------- drawing ---------------- |
| `shadow` | 6013 | soft shadow under a unit |
| `hpBar` | 6015 | health bar |
| `isSel` | 6020 | is this selected? |
| `toolFor` | 6023 | which tool a villager holds for its job |
| `paintUnit` | 6030 | draw one unit |
| `torchFor` | 6078 | foot soldiers burn buildings with an obor (torch) rather than hacking at them with their weapons (lore/siege.md) |
| `paintTorch` | 6084 | draw the obor torch pose |
| `paintNode` | 6101 | draw a resource |
| `buildWallGrid` | 6125 | map of where wall pieces are |
| `wallMask` | 6131 | which neighbours a wall piece joins |
| `raftSide` | 6138 | which way a raft house leans to the water |
| `paintRaftHouse` | 6145 | draw a raft house |
| `paintFisher` | 6172 | draw the woman fishing from a raft house |
| `paintBuilding` | 6185 | draw one building with fire, flags and bars |
| `paintFx` | 6215 | draw effects (corpses, sparks) |
| `paintTop` | 6233 | draw top-layer effects (gun flashes) |
| `drawArrow` | 6277 | draw arrows and bullets in flight |
| `jobTarget` | 6306 | where a unit is headed for its job (gather / build / hunt target), if anywhere |
| `targetRing` | 6312 | ring around a target |
| `paintJobs` | 6318 | dashed trail from selected workers to their job |
| `paintMarkers` | 6333 | tap markers on the ground |
| `paintPlacement` | 6352 | the building ghost while placing |
| `paintLinePlacement` | 6372 | a wall line: every tile green (new), grey (already walled) or red (blocked), with the count and cost by its end |
| `placeButtons` | 6396 | touch placement: a ✓ (build) and ✗ (cancel) button under the ghost; their screen spots are kept for hit tests |
| `paintPlaceButtons` | 6403 | the Place/Cancel buttons on the ghost |
| `render` | 6415 | draw the whole frame |
| `drawMini` | 6481 | draw the minimap |

## SCREEN 3 · Selecting and giving orders

`src/js/ui/03-selecting.js` · lines 6506 to 6707

Turns taps into selections and orders (tap a unit, box select, double tap for all of a kind).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `selUnits` | 6511 | ---------------- selection and orders ---------------- |
| `select` | 6513 | change the selection |
| `addMarker` | 6515 | show where you tapped |
| `issue` | 6517 | give the selected units an order at a spot |
| `canRally` | 6533 | can this building have a rally point? |
| `setRallyFor` | 6535 | set a rally point from a tap |
| `contextCommand` | 6541 | the right order for what you tapped (gather, attack, repair...) |
| `selectSameKind` | 6547 | select all units of this kind on screen |
| `placeAt` | 6552 | move the building ghost |
| `nearestSite` | 6558 | nearest free village landing (trading post) |
| `tryPlace` | 6567 | place the building if the spot is OK |
| `startPlace` | 6584 | start placing a building |
| `nearWallPiece` | 6610 | nearest wall piece (for gates) |
| `findSpot` | 6616 | a good free spot for a building |
| `clearRallyTap` | 6627 | cancel a pending rally tap |
| `handleTap` | 6629 | what one tap does |
| `boxSelect` | 6677 | select everything inside a dragged box |
| `idleVillagers` | 6688 | list idle villagers |
| `cycleIdle` | 6691 | jump to the next idle villager |
| `selectArmy` | 6696 | select all soldiers |
| `selectNavy` | 6702 | every warship (fishing boats and trade ships keep working) |

## SCREEN 4 · Touch, mouse and keys

`src/js/ui/04-touch-mouse-keys.js` · lines 6708 to 6838

Finger drag to scroll, pinch to zoom, hold-drag to box select, mouse wheel, keyboard keys.

**Things you can tweak**

- The pinch zoom limit is also here (0.38, 2.6): keep it the same as setZoom().

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pos` | 6715 | ---------------- pointer input ---------------- |
| `endPointer` | 6780 | finger or mouse lifted: tap, drag or box |
| `miniGo` | 6804 | tap the minimap to move the camera |

## SCREEN 5 · Action panel

`src/js/ui/05-action-panel.js` · lines 6839 to 7075

The panel at the bottom: build tabs, train buttons, stance, bell, repair, demolish.

**Things you can tweak**

- STANCES: the stance names and order.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `costHTML` | 6848 | cost shown with icons |
| `costTitle` | 6853 | cost as text |
| `cmdBtn` | 6855 | make one panel button |
| `lockBtn` | 6859 | a button for something a later age brings: greyed out, tapping it says which age |
| `ageBtn` | 6864 | the Town Centre's age-up button: the next age and its cost, or the work under way (tap to call it off) |
| `describeOrder` | 6871 | what a unit is doing, as text |
| `bldNote` | 6894 | help line for a selected building |
| `pName` | 6908 | name line in the panel |
| `buildPanel` | 6910 | build the bottom panel for the selection |
| `structKey` | 7002 | panel layout key (rebuild only when it changes) |
| `updatePanel` | 7009 | refresh numbers on the panel |
| `stanceOfSel` | 7025 | stance of the selected soldiers |
| `cycleStance` | 7027 | Stance button |
| `cycleFormation` | 7035 | Formation button |
| `stopSel` | 7037 | Stop button |

## SCREEN 6 · Top bar, game flow and saves

`src/js/ui/06-hud-saves.js` · lines 7076 to 7212

Resource bar, messages, pause, win/lose screens, autosave and the 3 save slots.

**Things you can tweak**

- SAVE_KEY / SLOTS_KEY: where saves are kept on the phone.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hintText` | 7085 | the hint line at the top |
| `updateHud` | 7094 | refresh the top bar |
| `showOv` | 7111 | ---------------- game flow ---------------- |
| `startGame` | 7116 | start a skirmish |
| `enterGame` | 7125 | shared by a new game and a resumed one: rebuild the view state around G |
| `syncSpeedButtons` | 7133 | show which game speed is on |
| `lsGet` | 7138 | storage can be missing (private windows, previews): the game still runs, it just can't resume |
| `lsSet` | 7140 | save to the phone's storage |
| `lsDel` | 7142 | delete from the phone's storage |
| `saveSettings` | 7146 | save settings |
| `slotMetas` | 7153 | what is in the 3 save slots |
| `slotPick` | 7155 | which slot a new game uses |
| `slotWrite` | 7157 | write a save slot |
| `slotRead` | 7159 | read a save slot |
| `slotDel` | 7161 | delete a save slot |
| `slotNewest` | 7163 | most recent save |
| `slotLine` | 7165 | save slot label text |
| `saveGame` | 7169 | save the current game |
| `openSlot` | 7176 | a mission save opens its own page, which loads it |
| `continueGame` | 7183 | load a saved game |
| `quitToMenu` | 7192 | save and go to the menu |
| `discardGame` | 7194 | leave without keeping anything from this game: every slot it wrote goes back to what it held before |
| `confirmBox` | 7202 | a yes/no box over whatever is on screen |

## SCREEN 7 · Menus and encyclopedia

`src/js/ui/07-menus-encyclopedia.js` · lines 7213 to 7547

Home screen, Skirmish setup, Campaign and Battles lists, mission briefings, Encyclopedia text, Settings.

**Things you can tweak**

- BUILD: the version shown in Settings.
- ENCY_UNITS / ENCY_BLDS / ENCY_CIVS / ENCY_GUIDE: encyclopedia text.
- CAMPAIGNS / MISSIONS: mission lists, briefings and which are unlocked.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `showMenu` | 7228 | show a menu screen |
| `delAsk` | 7243 | two-tap Delete on the home screen |
| `refreshHome` | 7249 | update the home screen |
| `renderSlots` | 7258 | Load game screen |
| `setVerNote` | 7266 | version, updates and exit (the installed app has no browser bar to reload or close it) |
| `checkForUpdate` | 7268 | Settings > Check for updates |
| `showUpdateReady` | 7282 | bar saying a new version is ready |
| `exitApp` | 7290 | Exit button |
| `toastMenu` | 7296 | pop-up message on the menu |
| `syncMenuSegs` | 7301 | highlight the chosen Skirmish options |
| `portraitImg` | 7425 | hero portrait picture |
| `renderCampaign` | 7427 | Campaign screen |
| `showBrief` | 7440 | mission briefing screen |
| `renderHeroes` | 7454 | Encyclopedia heroes tab |
| `paintMenuArt` | 7466 | menu background art |
| `renderEncy` | 7473 | Encyclopedia screen |
| `renderEncyList` | 7478 | Encyclopedia list for the chosen tab |
| `togglePause` | 7543 | pause or resume |

## SCREEN 8 · Sound

`src/js/ui/08-sound.js` · lines 7548 to 7804

All sounds and music are made by code (SFX).

**Things you can tweak**

- master.gain.value (0.22): overall volume.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `unlock` | 7561 | start the sound system after the first tap (phones need a tap first) |
| `note` | 7575 | play one music note |
| `noiseAt` | 7586 | drum and splash noise |
| `play` | 7632 | play a named sound effect |
| `schedule` | 7656 | keep the music playing ahead of time |
| `menuTheme` | 7685 | the menus: the asli melody slowed right down on a soft triangle, a gambus pluck under it, the sea washing in every two bars and a gong every four |
| `setMood` | 7700 | switch music between calm and battle |
| `apply` | 7702 | fade to the new music mood |
| `sfxForMsg` | 7707 | which sound goes with which game message |
| `sfxTick` | 7762 | play sounds for what happened this frame |
| `endGame` | 7774 | game over: show the result |

## SCREEN 9 · Main loop

`src/js/ui/09-main-loop.js` · lines 7805 to 7845

Starts the game and keeps it ticking: 30 rule steps a second, drawing every frame.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `frame` | 7810 | ---------------- main loop ---------------- |

## EXTRA 1 · Calm map look and new maps

`src/js/extras/01-maps.js` · lines 7846 to 8373

Add-on: the quieter ground painting and the newer skirmish maps (Highlands, Deep Jungle, Mangrove Delta...).

**Things you can tweak**

- NEWMAPS entries: each new map's layout.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `paint` | 7881 | paint the calm ground look |
| `tree` | 7928 | paint a regional tree (palm, broadleaf...) |
| `plant` | 7948 | biome plants, same palette and outline as the game's trees |
| `wildSprite` | 8032 | ---------- sprites (game pixel style: 2x bake, auto outline) ---------- |
| `foodSprite` | 8050 | durian and wild banana pictures |
| `treeFor` | 8062 | which tree type grows at a spot |
| `fields` | 8072 | ---------- the three maps: terrain fields worked out from the seed only ---------- |
| `lookOf` | 8089 | which ground look a map uses |
| `clearStarts` | 8105 | clear space around the start bases |
| `linkStarts` | 8110 | make sure both bases can reach each other |
| `genHighlands` | 8119 | make the Highlands map |
| `genJungle` | 8146 | make the Deep Jungle map |
| `genDelta` | 8162 | make the Mangrove Delta map |

## EXTRA 2 · Animals and kerbau

`src/js/extras/02-animals-kerbau.js` · lines 8374 to 8858

Add-on: fruit groves, hunt animals (kancil, boar, seladang) and kerbau herding, fattening and ploughing.

**Things you can tweak**

- KB: cap 6 kerbau each, perGran 3 per granary, fat0 200 -> fatMax 400 food over fatTime 240 s, plough 1.3 (= 30% faster farm), buy 75 gold.
- NK.durian / NK.pisang: food in the new fruit trees.
- UD.seladang atk: how hard it fights back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `bananaSprite` | 8402 | ---------- art ---------- |
| `berryArt` | 8419 | banana grove or mango tree picture |
| `kerbauSprite` | 8422 | kerbau picture: standing, grazing (head down) or ploughing (yoke and plough) |
| `haySprite` | 8466 | hay pile at the granary |
| `syahbandarSprite` | 8472 | Syahbandar Port (Melaka, Kingdom Age on): the lore hall, same size and footing as the port |
| `homeFor` | 8514 | where an owned kerbau should stand (granary, Town Centre or farm) |
| `sendHome` | 8527 | walk a kerbau to its spot |
| `kbSide` | 8591 | the quietest side of a building for kerbau spots |
| `slotIndex` | 8608 | which standing spot a kerbau gets (by arrival time) |
| `slotPoint` | 8618 | map position of a standing spot |
| `kbTick` | 8632 | kerbau each tick: claim, fatten, plough, follow |

## EXTRA 3 · Smarter AI

`src/js/extras/03-ai-plus.js` · lines 8859 to 8906

Add-on: the computer runs trade ships, claims wild kerbau, and Melaka's AI ploughs with them.

**Things you can tweak**

- AIP.traders: trade ships per difficulty (2/3/4).
- AIP.claimEvery (8 s), AIP.claimR (26 tiles): how often and how far it looks for kerbau.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aiPlus` | 8876 | the AI's extra jobs: trade ships, claim kerbau, plough |

## EXTRA 4 · Groups, facing and taps

`src/js/extras/04-groups-facing-taps.js` · lines 8907 to 9141

group tabs 1-4 and Make group, the Face button, soldiers facing their move direction, one-tap orders with two-finger deselect (or double-tap orders).

**Things you can tweak**

- TAP_MODE: 'single' (one tap orders) or 'double'; players switch it in Settings > Orders on touch (saved as seak-tapmode).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aimable` | 8929 |  |
| `startAim` | 8934 |  |
| `setTapMode` | 8948 |  |
| `twoFingerTap` | 8949 |  |
| `faceSoldiers` | 8975 | the Face button: press where the soldiers should stand, drag to face, let go |
| `toggleFace` | 8976 |  |
| `faceAim` | 8981 |  |
| `faceIcon` | 8990 | pixel icon: a turning arrow around the spot where the soldiers stand |
| `aimMove` | 9013 |  |
| `aimDir` | 9014 |  |
| `aimEnd` | 9015 |  |
| `paintAim` | 9027 |  |
| `groupUnits` | 9059 |  |
| `soldiersSel` | 9060 |  |
| `grpPanelButtons` | 9061 |  |
| `saveGroup` | 9067 |  |
| `makeGroup` | 9074 |  |
| `pickGroup` | 9079 |  |
| `updateGroupBar` | 9100 |  |
| `closeGrpMenu` | 9114 |  |
| `openGrpMenu` | 9115 |  |

## EXTRA 5 · Compact screen

`src/js/extras/05-compact-hud.js` · lines 9142 to 9252

a bigger play area: no hint strip (small clock, tips pop up then fade), slim one-row panel, icon-only command buttons, smaller foldable minimap.

**Things you can tweak**

- the CSS sizes at the top (minimap 84x63) and how long a tip stays (5 s).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `nameOf` | 9200 |  |
| `boot` | 9214 |  |
| `compactRest` | 9234 | the parts every page gets: the minimap fold button and group tabs that appear once a group exists |

## EXTRA 6 · Base footprints, wading, wet ports, house drop-off

`src/js/extras/06-footprint-wading.js` · lines 9253 to 9300

buildings stand on their base only (the roof hangs over the tiles behind), land units wade through shallow water in Skirmish, a Port's deck may sit on shallow water, Ayutthaya paddy farmers drop rice at their paired house, and the panel button tidy-ups (centred icons, red Demolish, one-row queue).

**Things you can tweak**

- FOOT: how many tile rows each building really stands on.
- WADE / PORTWET: switch wading and ports-on-shallows off. Missions keep their own water rules (no wading).
- HOUSEDROP: Ayutthaya farmers drop rice at their house.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `wadeOn` | 9268 | wading is for Skirmish; campaign missions and battles (they have setupObj) keep their own water rules |

## EXTRA 7 · Fire Arrows research

`src/js/extras/07-fire-arrows.js` · lines 9301 to 9367

Panah Api (lore/siege.md): from Age 2 the Barracks can research Fire Arrows once. Archers then do extra damage to buildings and set them alight more often. Torches on melee hits stay automatic.

**Things you can tweak**

- FIRE_ARROWS.cost / time / age: price, research seconds and the age it opens in.
- FIRE_ARROWS.bld: extra damage per arrow on a building; FIRE_ARROWS.chance: chance an arrow lights it (20% before).
- FIRE_ARROWS.aiGold: gold the computer keeps spare before it researches.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `fireArrowBtn` | 9361 | the Barracks button: research, progress, or done |

## EXTRA 8 · Khmer

`src/js/extras/08-khmer.js` · lines 9368 to 9392

the fourth civ (civ id 4, column 3 of the per-civ tables). Groundwork: every per-civ table gets a Khmer column. Until Khmer's own roster lands, a missing Khmer value copies Melaka's, so nothing breaks.

**Things you can tweak**

- KHMER: Khmer's own values; anything set here wins over the Melaka copy.

