# Chapter map

Every chapter of the game: where it sits in `index.html`, what it does, the numbers that are safe to tweak, and every function in it with a one-line note. Made by `python3 tools/chapter_map.py`.

**How to use it:** find the chapter, open its file in `src/` (or jump to the line in `index.html`) and look for the `CHAPTER` box at the top. Functions have a `//` note just above them.

**After changing a number:** if you edited `index.html`, run `python3 tools/build.py split`. If you edited a file in `src/`, run `python3 tools/build.py`. Then open `index.html` in a browser to test.

| Chapter | File | Lines in index.html |
|---|---|---|
| [SIM 1 · Basics](#sim-1--basics) | `src/js/sim/01-core.js` | 594 to 662 |
| [SIM 2 · Units, civs and buildings](#sim-2--units-civs-and-buildings) | `src/js/sim/02-units-buildings.js` | 663 to 821 |
| [SIM 3 · Ages, resources, AI difficulty, maps](#sim-3--ages-resources-ai-difficulty-maps) | `src/js/sim/03-ages-resources-ai-maps.js` | 822 to 950 |
| [SIM 4 · Starting a game](#sim-4--starting-a-game) | `src/js/sim/04-game-setup.js` | 951 to 1397 |
| [SIM 5 · Units, costs and ages](#sim-5--units-costs-and-ages) | `src/js/sim/05-entities-ages.js` | 1398 to 1625 |
| [SIM 6 · Finding the way](#sim-6--finding-the-way) | `src/js/sim/06-paths-and-searching.js` | 1626 to 1807 |
| [SIM 7 · Orders](#sim-7--orders) | `src/js/sim/07-orders.js` | 1808 to 2155 |
| [SIM 8 · Building and training](#sim-8--building-and-training) | `src/js/sim/08-building-training.js` | 2156 to 2370 |
| [SIM 9 · Every tick: buildings, soldiers, fire](#sim-9--every-tick-buildings-soldiers-fire) | `src/js/sim/09-every-tick.js` | 2371 to 2853 |
| [SIM 10 · Gathering, repairing, damage](#sim-10--gathering-repairing-damage) | `src/js/sim/10-gather-repair-damage.js` | 2854 to 3194 |
| [SIM 11 · What you tapped, and the enemy AI](#sim-11--what-you-tapped-and-the-enemy-ai) | `src/js/sim/11-enemy-ai.js` | 3195 to 3479 |
| [ART 1 · Drawing basics](#art-1--drawing-basics) | `src/js/art/01-core.js` | 3480 to 3549 |
| [ART 2 · People](#art-2--people) | `src/js/art/02-people.js` | 3550 to 3762 |
| [ART 3 · Nature](#art-3--nature) | `src/js/art/03-nature.js` | 3763 to 3809 |
| [ART 4 · Ships](#art-4--ships) | `src/js/art/04-ships.js` | 3810 to 3981 |
| [ART 5 · Melaka and Majapahit buildings](#art-5--melaka-and-majapahit-buildings) | `src/js/art/05-melaka-majapahit-buildings.js` | 3982 to 4309 |
| [ART 6 · Ayutthaya](#art-6--ayutthaya) | `src/js/art/06-ayutthaya.js` | 4310 to 5211 |
| [ART 7 · Soldiers through the ages](#art-7--soldiers-through-the-ages) | `src/js/art/07-age-looks.js` | 5212 to 5556 |
| [ART 8 · Shared buildings and walls](#art-8--shared-buildings-and-walls) | `src/js/art/08-shared-buildings.js` | 5557 to 5778 |
| [ART 9 · Icons](#art-9--icons) | `src/js/art/09-icons.js` | 5779 to 5822 |
| [ART 10 · Ground](#art-10--ground) | `src/js/art/10-terrain.js` | 5823 to 5914 |
| [SCREEN 1 · Screen, camera, fog](#screen-1--screen-camera-fog) | `src/js/ui/01-screen-camera-fog.js` | 5915 to 6035 |
| [SCREEN 2 · Drawing the battlefield](#screen-2--drawing-the-battlefield) | `src/js/ui/02-drawing.js` | 6036 to 6536 |
| [SCREEN 3 · Selecting and giving orders](#screen-3--selecting-and-giving-orders) | `src/js/ui/03-selecting.js` | 6537 to 6738 |
| [SCREEN 4 · Touch, mouse and keys](#screen-4--touch-mouse-and-keys) | `src/js/ui/04-touch-mouse-keys.js` | 6739 to 6869 |
| [SCREEN 5 · Action panel](#screen-5--action-panel) | `src/js/ui/05-action-panel.js` | 6870 to 7106 |
| [SCREEN 6 · Top bar, game flow and saves](#screen-6--top-bar-game-flow-and-saves) | `src/js/ui/06-hud-saves.js` | 7107 to 7243 |
| [SCREEN 7 · Menus and encyclopedia](#screen-7--menus-and-encyclopedia) | `src/js/ui/07-menus-encyclopedia.js` | 7244 to 7606 |
| [SCREEN 8 · Sound](#screen-8--sound) | `src/js/ui/08-sound.js` | 7607 to 7863 |
| [SCREEN 9 · Main loop](#screen-9--main-loop) | `src/js/ui/09-main-loop.js` | 7864 to 7904 |
| [EXTRA 1 · Calm map look and new maps](#extra-1--calm-map-look-and-new-maps) | `src/js/extras/01-maps.js` | 7905 to 8432 |
| [EXTRA 2 · Animals and kerbau](#extra-2--animals-and-kerbau) | `src/js/extras/02-animals-kerbau.js` | 8433 to 8923 |
| [EXTRA 3 · Smarter AI](#extra-3--smarter-ai) | `src/js/extras/03-ai-plus.js` | 8924 to 8971 |
| [EXTRA 4 · Groups, facing and taps](#extra-4--groups-facing-and-taps) | `src/js/extras/04-groups-facing-taps.js` | 8972 to 9206 |
| [EXTRA 5 · Compact screen](#extra-5--compact-screen) | `src/js/extras/05-compact-hud.js` | 9207 to 9318 |
| [EXTRA 6 · Base footprints, wading, wet ports, house drop-off](#extra-6--base-footprints-wading-wet-ports-house-drop-off) | `src/js/extras/06-footprint-wading.js` | 9319 to 9366 |
| [EXTRA 7 · Fire Arrows research](#extra-7--fire-arrows-research) | `src/js/extras/07-fire-arrows.js` | 9367 to 9433 |
| [EXTRA 8 · Khmer](#extra-8--khmer) | `src/js/extras/08-khmer.js` | 9434 to 11578 |
| Styles | `src/css/game.css` | inside `<style>` |
| Page layout (menus, HUD) | `src/index.html` | outside the script and styles |

## SIM 1 · Basics

`src/js/sim/01-core.js` · lines 594 to 662

Map size, tile types, saving helpers and random numbers. Everything in the SIM chapters is the game rules only: no drawing, so it can run in tests.

**Things you can tweak**

- W, H: map size in tiles (96 x 72). Missions change it in their own build.
- MAXPOP: population cap (100).
- STEP: the game ticks 30 times a second. Leave it.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `snapEnc` | 618 | Sets, Maps and typed arrays survive JSON as tagged objects |
| `snapDec` | 625 | turn saved data back into Sets, Maps and arrays |
| `mulberry32` | 634 | the seeded random number maker (same seed = same map) |
| `hash2` | 645 | a fixed pseudo-random number for a tile |
| `vnoise` | 652 | smooth noise for map shapes |
| `fbm` | 659 | layered noise for natural-looking coasts and woods |

## SIM 2 · Units, civs and buildings

`src/js/sim/02-units-buildings.js` · lines 663 to 821

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
| `CV` | 714 | which civ a team plays (0 Melaka, 1 Majapahit, 3 Ayutthaya) |
| `CI` | 719 | which column of a [Melaka, Majapahit, Ayutthaya, Khmer] table to read |
| `civOk` | 721 | can this civ use this unit or building? |
| `civEntry` | 759 | the civ's name entry for a unit or building |
| `civRole` | 761 | the English role name ("Spearman") |
| `civName` | 763 | the local name ("Tombak Warrior") |
| `shortName` | 765 | the short button label |
| `enName` | 781 | the English name, when the local name differs from it |
| `btnName` | 783 | button text: local name with (English) under it |
| `fullName` | 785 | "Local name (English)" |

## SIM 3 · Ages, resources, AI difficulty, maps

`src/js/sim/03-ages-resources-ai-maps.js` · lines 822 to 950

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
| `lineKind` | 876 | which archer-line unit a civ gets in an age |
| `ageFits` | 878 | is this unit allowed in this age? |
| `costWords` | 880 | cost as words ("50 food, 20 gold") |
| `rectOfTiles` | 931 | a rectangle from tile corners |
| `rectDist` | 933 | distance from a point to a rectangle |

## SIM 4 · Starting a game

`src/js/sim/04-game-setup.js` · lines 951 to 1397

The Game class begins here. Makes the map (genMap, rivers, islands), thins trees (openWoods), places villages, bases and resources (populate), and saves/loads (snapshot).

**Things you can tweak**

- populate(): what each side starts with and where resources go.
- openWoods(): how many trees get cleared. Missions turn it off.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `init` | 960 | ======================= setup ======================= |
| `openWoods` | 997 | thin the woods so nothing gets trapped: no one-tile squeezes between trees, and no little clearings walled in by trees (a kerbau or deer could spawn in one... |
| `reserveRoute` | 1049 | keep a road clear of trees |
| `inb` | 1071 | is this tile inside the map? |
| `computeRegions` | 1073 | land masses: every land tile gets the number of the island (or river bank) it sits on |
| `regionAt` | 1091 | which island or river bank a point is on |
| `coastNear` | 1093 | a dry tile on the shore near (x, y), at least 5 tiles out: where a base's port road goes |
| `snapshot` | 1107 | Everything that can't be rebuilt goes into a plain JSON object. Lookup tables (byId, the spatial hash, path scratch, claims) and short-lived effects are... |
| `genMap` | 1134 | make the land, water and cliffs for a skirmish map |
| `genRiverlands` | 1199 | Riverlands: four rivers that meet in the middle; sandy fords are the only dry crossings |
| `genIslands` | 1223 | Big Islands: four large islands, one for each side and two to fight over, with deep channels between |
| `landConnected` | 1234 | can you walk from A to B? |
| `isLand` | 1249 | is the tile land? |
| `isWater` | 1251 | is the tile water? |
| `freeTile` | 1253 | is the tile empty land? |
| `addNode` | 1256 | put a tree, bush, gold or fish on the map |
| `removeNode` | 1265 | remove a used-up resource |
| `populate` | 1272 | place bases, villagers, resources and villages at the start |
| `addVillage` | 1365 | place a neutral Orang Laut village with its landing |
| `siteAt` | 1396 | the free village landing whose corner is at (tx, ty), if any |

## SIM 5 · Units, costs and ages

`src/js/sim/05-entities-ages.js` · lines 1398 to 1625

Adding units and buildings, working out prices (costOf), what a building can train, and climbing the ages.

**Things you can tweak**

- costOf(): where civ discounts are applied.
- applyAge(): what happens when an age finishes.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `addUnit` | 1407 | ======================= entities ======================= |
| `unitName` | 1426 | a unit's civ name |
| `costOf` | 1428 | price of a unit or building after civ discounts (MEL_LEVY, TEAMMOD) |
| `trainable` | 1436 | what a building can train for this team (unique units and ships belong to one civ) |
| `lockedTrain` | 1438 | what this building will train in a later age (shown greyed out with the age it needs) |
| `countOf` | 1443 | how many of a kind a team has |
| `canAfford` | 1450 | enough resources? |
| `pay` | 1452 | take the cost |
| `refund` | 1454 | give the cost back |
| `teamAge` | 1457 | ======================= ages ======================= |
| `ageText` | 1459 | what the next age still needs, as text |
| `ageNeedMet` | 1465 | are the next age's needed buildings built? |
| `startAge` | 1472 | begin researching the next age |
| `cancelAge` | 1483 | stop an age-up and refund it |
| `ageTick` | 1489 | count down age research |
| `applyAge` | 1496 | finish an age-up: Town Centre hp, unit looks, unlocks |
| `morphUnit` | 1509 | swap a unit for another kind in place, keeping its share of health |
| `armForAge` | 1516 | foot soldiers get mail in the Age of Commerce and more in the Golden Age; light ranged units turn elite in the Golden Age |
| `addBuilding` | 1525 | add a building to the map |
| `evict` | 1542 | push units off a new building's tiles |
| `setGateLock` | 1553 | an own gate: open lets your own people through and stops enemies, closed stops everyone |
| `walkable` | 1560 | can a unit stand on this tile? |
| `nearestFree` | 1568 | the closest empty tile |
| `unitNear` | 1585 | is another unit close to this spot? |
| `openSpot` | 1590 | centre of the nearest walkable tile nobody is standing on |
| `findSpawn` | 1606 | spawn tile next to a building, preferring the side facing 'toward' (and tiles nobody stands on) |

## SIM 6 · Finding the way

`src/js/sim/06-paths-and-searching.js` · lines 1626 to 1807

A* pathfinding, straight-line checks, and quick searches like "nearest enemy" or "units near here".

**Things you can tweak**

- Mostly leave alone. nearestEnemy() decides what idle soldiers notice.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `findPath` | 1634 | ======================= pathfinding ======================= |
| `los` | 1681 | straight line clear between two points? |
| `smooth` | 1694 | straighten a path so units don't zig-zag |
| `pathToRect` | 1705 | path to within `reach` of a rectangle (continuous coords) |
| `pathToPoint` | 1723 | find a path to a spot |
| `setPath` | 1738 | give a unit its new path |
| `stepMove` | 1743 | move a unit along its path for one tick |
| `rebuildHash` | 1764 | ======================= spatial queries ======================= |
| `unitsNear` | 1773 | all units within a radius (fast grid lookup) |
| `isVisible` | 1782 | is this spot out of the fog? |
| `nearestEnemy` | 1784 | the closest enemy a unit can see |

## SIM 7 · Orders

`src/js/sim/07-orders.js` · lines 1808 to 2155

What happens when you tap: gather, attack, board a ship, land, shelter in the Town Centre (town bell), trade, move in formation.

**Things you can tweak**

- BD.towncentre.garrison / BD.tower.garrison (chapter 2): how many villagers shelter.
- groupMove(): spacing of formations.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `idleOrder` | 1817 | ======================= orders ======================= |
| `gatherInfo` | 1819 | what a target gives and how fast, if it can be gathered |
| `orderGather` | 1826 | send a villager to gather |
| `orderAttack` | 1836 | send a unit to attack |
| `orderBoard` | 1841 | send a unit onto a ship |
| `roomIn` | 1843 | garrison: villagers shelter in a Town Centre (15) or tower (5); each one inside adds an arrow |
| `orderGarrison` | 1845 | send a villager to shelter in a building |
| `doGarrison` | 1847 | walk to the shelter and go inside |
| `shelterFor` | 1865 | nearest building with room to shelter |
| `ringBell` | 1871 | the town bell: every villager runs for the nearest shelter with room; All clear sends them back to work |
| `ungarrison` | 1887 | let sheltered villagers out |
| `allClear` | 1901 | end the town bell: everyone back to work |
| `orderLand` | 1909 | send a loaded ship to a beach |
| `shoreTile` | 1911 | the water tile next to a beach nearest (x, y), leaning towards (bx, by) |
| `waterReach` | 1926 | every water tile a ship can sail to from where it is |
| `doBoard` | 1940 | a land unit climbs aboard once it reaches the galley |
| `doLand` | 1961 | a galley sails to the beach nearest (x, y) and puts its troops ashore |
| `launchRaft` | 1992 | a Port pushes a burning raft out at the nearest enemy ship |
| `orderTrade` | 2006 | start a trade ship's route |
| `orderBuild` | 2008 | send a villager to build |
| `orderMove` | 2010 | plain move |
| `orderAMove` | 2012 | attack-move (fight anything on the way) |
| `command` | 2015 | group order from the player (or the AI). ids -> units owned by `team` |
| `groupMove` | 2106 | move a group in formation |

## SIM 8 · Building and training

`src/js/sim/08-building-training.js` · lines 2156 to 2370

Where a building may go, laying walls in lines, the build queue, population, and drop-off points.

**Things you can tweak**

- WALL_MAX (chapter 2) limits a wall drag.
- popCap(): MAXPOP from chapter 1.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `canPlace` | 2165 | ======================= building / training ======================= |
| `underPortArt` | 2189 | a port's hall stands up above its deck: nothing may be built where the hall's art goes, and a port's hall can't cover another building |
| `canFloat` | 2202 | Ayutthaya raft house moored out on the river: the whole 2x2 on water, its edge against the bank (a bamboo gangway), and open water on the river side so... |
| `houseKind` | 2217 | an Ayutthaya house set down on the water floats as a raft house; one built on land always stays a house (Iylia, 2026-11-08) |
| `waterSide` | 2219 | how many open water tiles ring a footprint |
| `wallPieceAt` | 2228 | the team's own palisade or wall (or any wall piece, gates included, unless plain) on a tile |
| `lineTiles` | 2234 | tiles of a wall line from (ax, ay) to (bx, by), stepping one axis at a time so there are no diagonal gaps |
| `placeLine` | 2245 | lay a palisade or wall line; own wall tiles on the way are kept, blocked tiles are skipped. returns {ok, n, why} |
| `placeBuilding` | 2267 | returns {ok, b, why} |
| `queueUnit` | 2287 | add a unit to a building's training queue |
| `cancelQueue` | 2301 | remove one from the queue and refund it |
| `popOf` | 2308 | how many people a team has |
| `popCap` | 2310 | housing limit |
| `dropOffs` | 2312 | buildings that take a resource |
| `nearestDrop` | 2317 | nearest drop-off for a resource |
| `nearestNode` | 2323 | nearest resource of a type; one with a free gathering slot wins over a full one |
| `freeSameKind` | 2347 | nearest other resource of the same kind as `like` (tree -> tree, farm -> own farm) with a free slot |
| `gatherCap` | 2358 | how many villagers (or boats) may work one resource at once |
| `claimsOf` | 2360 | how many villagers are on a resource |
| `countClaims` | 2362 | recount villagers per resource |
| `setRally` | 2367 | set where new units walk to |

## SIM 9 · Every tick: buildings, soldiers, fire

`src/js/sim/09-every-tick.js` · lines 2371 to 2853

Runs 30 times a second: buildings train and heal, soldiers pick fights by stance, healers heal, ships shoot, buildings burn.

**Things you can tweak**

- guardOrder(): how far Defensive soldiers chase (r: 11 tiles).
- fireOn(): who sets buildings alight and how often (archers 20% from Age 2).
- BURN (chapter 2) for fire strength.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `update` | 2381 | ======================= per-tick update ======================= |
| `doFishHouse` | 2399 | fishing from a raft house's deck: no walking to a drop-off, the catch goes straight into the store |
| `households` | 2416 | household while its paddy is worked, and a raft house while its woman fishes from the deck |
| `housePairs` | 2424 | one paddy per house: pair each finished land house with the nearest unused paddy touching it (farm id -> house) |
| `householdTick` | 2440 | Ayutthaya households pay food |
| `updateBuilding` | 2450 | one tick for a building: build, train, shoot, heal |
| `finishBuilding` | 2511 | a building is finished |
| `updateUnit` | 2533 | one tick for a unit: cooldowns, then its current order |
| `doIdle` | 2577 | what an idle unit does (look for enemies by stance) |
| `guardOrder` | 2603 | stances: 'agg' chases whatever it sees, 'def' (default) chases up to 11 tiles from its post then walks back, 'hold' never moves |
| `orderReturn` | 2605 | walk back to the post; a soldier hit on the way fights back instead of ignoring it |
| `breach` | 2607 | a land soldier whose way is walled off attacks the enemy wall piece that is most in the way to (gx, gy) |
| `doAMove` | 2618 | attack-move step |
| `doAttack` | 2634 | chase and hit a target |
| `doWander` | 2686 | animals wander |
| `doFlee` | 2698 | animals run from hunters |
| `doTrade` | 2710 | trade ship: sail to the Trading Post, load goods, sail home to the nearest Port and get paid by distance |
| `canHeal` | 2734 | healing: allies on land, hurt, and out of combat for HEAL_CALM seconds |
| `healOne` | 2736 | heal one unit |
| `healStep` | 2738 | idle healer: heal what's in reach, or walk over to the worst-hurt ally it can see |
| `doHeal` | 2762 | healer walks to and heals a target |
| `shipShot` | 2771 | a ship's main weapon: arrows (fire arrows from tier 1), boarding, or cannon (tier 2) |
| `secShot` | 2785 | secondary weapon (galley archers, flagship arrows) on its own reload |
| `fireOn` | 2798 | fire on buildings (lore/siege.md, Iylia 2026-10-25), all of it automatic: foot soldiers carry obor torches, gunners throw gunpowder fire pots (two fires at... |
| `ignite` | 2806 | set a building or wooden ship burning; stacks up to BURN.max |
| `updateBurning` | 2814 | burning buildings and ships lose hp |
| `explode` | 2841 | fire ship: burns everything hostile around it and sinks itself |

## SIM 10 · Gathering, repairing, damage

`src/js/sim/10-gather-repair-damage.js` · lines 2854 to 3194

Villagers gathering and carrying, repairing and demolishing, building, units pushing apart, and the damage formula. Also fog of war and the win/lose check.

**Things you can tweak**

- damage(): the damage formula (attack + bonus - armour).
- doRepair(): repair cost and speed.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `doGather` | 2863 | villager gathers, carries the load to a drop-off, and goes back |
| `workSpot` | 2963 | where a gatherer stands while working: inside a farm, or hugging the side of a node it walked up to |
| `doRepair` | 2993 | repair: a full fix takes 1.5x the build time for one villager (more help, faster) and costs half the building's price in wood (at least 25), paid as the... |
| `canDemolish` | 3012 | knock down your own building: nothing comes back. The Town Centre can't be (losing it loses the game) |
| `demolish` | 3014 | take down your own building |
| `doBuild` | 3023 | villager builds |
| `separate` | 3047 | push units apart so they don't stack |
| `nudge` | 3069 | small push for one unit |
| `gunFx` | 3075 | gunpowder at the muzzle: a flash, then thick pale smoke billowing forward and drifting up |
| `damage` | 3081 | the damage formula: attack + bonus - armour |
| `onKilled` | 3120 | something died: score, loot, messages |
| `msg` | 3144 | show a short message |
| `cleanup` | 3147 | remove the dead |
| `updateFx` | 3160 | age out effects |
| `updateFog` | 3174 | recompute what each side can see |
| `checkEnd` | 3190 | win or lose? |

## SIM 11 · What you tapped, and the enemy AI

`src/js/sim/11-enemy-ai.js` · lines 3195 to 3479

pick() finds what is under your finger. aiTick() is the computer player: it gathers, builds, trains, ages up, attacks and retreats.

**Things you can tweak**

- DIFF (chapter 3) is the safest place to change the AI.
- aiRetreat(): when a beaten attack falls back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pick` | 3204 | ======================= picking ======================= |
| `aiTick` | 3230 | ======================= enemy AI (Majapahit) ======================= |
| `aiFerry` | 3388 | Big Islands: board a wave onto the galleys, sail them over and land it by the enemy base; anyone already ashore over there marches on the nearest enemy... |
| `aiRetreat` | 3431 | an attack that has clearly failed comes home: under a third left, or still fighting after 3 minutes |
| `aiBuild` | 3442 | AI places a building near its Town Centre |
| `aiBuildShore` | 3455 | AI places a port on the coast |
| `aiBuildNear` | 3465 | AI places a drop-off near resources |

## ART 1 · Drawing basics

`src/js/art/01-core.js` · lines 3480 to 3549

All art is drawn by code, pixel by pixel, then cached as pictures. Team colours and the sprite helper live here.

**Things you can tweak**

- TEAMC: each team's colours. SKIN, HAIR, STEEL, WOOD: shared colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `cv` | 3502 | make a blank drawing canvas |
| `sprite` | 3504 | draw a picture once with the pixel painter P, then reuse the cached copy |
| `outlineCanvas` | 3515 | add the dark outline around a sprite |
| `whiteOf` | 3529 | a white copy of a sprite (flash when hit) |
| `disc` | 3536 | paint a filled pixel circle |
| `planks` | 3538 | paint a wooden plank wall |
| `roofGable` | 3540 | paint a sloped gable roof |
| `posts` | 3548 | paint wooden stilts or posts |

## ART 2 · People

`src/js/art/02-people.js` · lines 3550 to 3762

Villagers and soldiers: bodies, legs, weapons and the walk cycle.

**Things you can tweak**

- GOLD, LUK, LEGS: shared colours and leg poses.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `drawUnit` | 3570 | paint a Melaka/Majapahit person: body, clothes, weapon and pose |
| `unitAge` | 3698 | the team's age picks the look (AGEART, below); neutral and pre-age callers get the Kingdom Age roster |
| `unitSprite` | 3700 | the picture for a unit, with its age look |
| `civUnitSprite` | 3702 | the picture for a unit by civ (Ayutthaya has its own art) |
| `deerSprite` | 3708 | deer picture |
| `carcassSprite` | 3718 | hunted animal carcass picture |
| `hull` | 3727 | hull with upswept bow and stern; x0..x1 is the deck length, y the deck line |
| `tanja` | 3734 | tanja: slanted four-sided sail between two spars, the classic Nusantara rig |
| `boatSprite` | 3742 | fishing boat picture |

## ART 3 · Nature

`src/js/art/03-nature.js` · lines 3763 to 3809

Trees, bushes, gold, fish and deer.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `treeSprite` | 3768 | ------------------------------ nature ------------------------------ |
| `bushSprite` | 3794 | berry bush picture |
| `goldSprite` | 3802 | gold deposit picture |

## ART 4 · Ships

`src/js/art/04-ships.js` · lines 3810 to 3981

Every civ's ships, sails and hulls (NAVAL).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hull` | 3830 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 3838 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 3846 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 3854 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 3856 | paint a ship mast |
| `flag` | 3858 | paint a small flag |
| `oars` | 3860 | paint a row of oars |
| `crew` | 3862 | paint a crewman on deck |
| `flames` | 3864 | paint flames |
| `navalSprite` | 3878 | a ship picture by kind and civ |

## ART 5 · Melaka and Majapahit buildings

`src/js/art/05-melaka-majapahit-buildings.js` · lines 3982 to 4309

Town Centres, houses, barracks and other buildings for the first two civs (CIVB).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `weave` | 3996 | paint woven bamboo walls |
| `sacks` | 3998 | paint grain sacks |
| `crates` | 4000 | paint trade crates |
| `banner` | 4002 | paint a Melaka banner |
| `melakaBuilding` | 4005 | a Melaka building picture |
| `neutralSite` | 4055 | Neutral map sites. Pangkalan can only be built on a landing next to a settlement. |
| `brick` | 4083 | paint red brick courses |
| `meru` | 4085 | meru: stacked black thatch tiers, each narrower than the one below |
| `surya` | 4087 | sun of Majapahit (Surya Majapahit) emblem |
| `mjBanner` | 4089 | paint a Majapahit banner |
| `majapahitBuilding` | 4092 | a Majapahit building picture |
| `ijukRoof` | 4149 | black ijuk gable roof with a thick dark edge |
| `majapahitBase` | 4152 | Majapahit Town Centre and palace base |
| `pier` | 4194 | pier() and rack() from buildings-mainland.js, used by the Majapahit port and barracks |
| `rack` | 4196 | paint a drying rack |
| `drawHealer` | 4206 | paint a healer (Tabib, Acaraki, Mo) |
| `healerSprite` | 4253 | healer picture |
| `herbBed` | 4261 | paint a herb bed |
| `healerBuilding` | 4264 | healer building picture (Rumah Tabib, Patirthan) |

## ART 6 · Ayutthaya

`src/js/art/06-ayutthaya.js` · lines 4310 to 5211

All Ayutthaya art: people, elephants, buildings and boats (AYART).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ayUnit` | 4334 | an Ayutthaya unit picture |
| `ayuPerson` | 4342 | paint an Ayutthaya person |
| `ayuElephant` | 4460 | ---------- Chang Suek: war elephant, 32x32, facing right ---------- |
| `ayuCannon` | 4531 | ---------- bronze cannon on a field carriage, 26x18, with a purple pennant ---------- |
| `ayRoofTri` | 4571 | steep roof triangle seen from the gable end: tile courses, a coloured rim along both slopes |
| `ayChofa` | 4579 | chofa: slender gold hook rising from the gable apex |
| `ayHangHong` | 4581 | hang hong: small upturned gold curls at the lower ends of the gable boards |
| `ayGable` | 4583 | Thai gable: tiled triangle, dark gable face framed by gold pan lom boards, chofa on top, hang hong at the foot |
| `ayEave` | 4601 | eave skirt: a lower roof tier spreading out under a gable |
| `ayWhite` | 4609 | white-washed brick: lime plaster with faint courses and weathering |
| `ayLeaf` | 4615 | bai sema merlon: a leaf shape with a point on top |
| `ayBanner` | 4620 | purple thong banner with a little white elephant |
| `ayTeak` | 4626 | teak panel wall (fa pakon): framed panels |
| `ayHouse` | 4632 | small Ruean Thai, used by the house and the raft house |
| `ayBuilding` | 4652 | an Ayutthaya building picture |
| `hull` | 4793 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 4801 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 4809 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 4817 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 4819 | paint a ship mast |
| `flag` | 4821 | paint a small flag |
| `oars` | 4823 | paint a row of oars |
| `crew` | 4825 | paint a crewman on deck |
| `flames` | 4827 | paint flames |
| `navalSprite` | 4841 | a ship picture by kind and civ |
| `junk` | 4960 | Battened junk sail: a tall rectangle with battens and a rounded top-front corner. |
| `prow` | 4965 | Tall curving prow (Thai and Khmer barges). |
| `eye` | 4967 | Painted bow eye, the mark of Vietnamese boats. |
| `pavilion` | 4969 | Pavilion with a tiered pointed roof. |
| `mainlandShip` | 4975 | a Khmer/Dai Viet ship picture (battle demos) |
| `womanSprite` | 5089 | Phrai Ying: a village woman of Ayutthaya. Short hair (as European visitors noted of Siamese women), a sabai cloth across the chest, an ankle-length pha sin,... |
| `aySpears` | 5127 | rack of spears with red tassels |
| `ayShield` | 5129 | small purple round shield with a gold boss |
| `ayBuildingX` | 5131 | Ayutthaya barracks, port, granary, teak store and farm pictures |
| `unit` | 5199 | an Ayutthaya unit picture (falls back to the shared art) |
| `building` | 5207 | Ayutthaya building picture (shared entry point) |
| `ship` | 5209 | Ayutthaya ship picture (shared entry point) |

## ART 7 · Soldiers through the ages

`src/js/art/07-age-looks.js` · lines 5212 to 5556

How soldiers' dress changes each age (AGEART), plus guns and armour (XU).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hexRGB` | 5228 | Melaka age progression mockups. Runs in the game page after art.js (and heroes-art.js). melAge(kind, age, anim, f): keris / tombak / archer drawn with the... |
| `recolor` | 5230 | swap colours on a finished picture |
| `melAge` | 5238 | Melaka soldier picture for a given age |
| `melGunner` | 5264 | Melaka gunner picture |
| `melMeriam` | 5288 | Melaka bronze cannon picture |
| `xuFlash` | 5318 | muzzle flash pointing right, x = first pixel past the muzzle, y = bore centre |
| `xuSmoke` | 5321 | a few puffs drifting up from (x, y) |
| `xUnit` | 5327 | extra unit pictures (guns, armour) |
| `mpAge` | 5444 | ---------- Majapahit: the game's Majapahit drawing, a kere (mail coat) from age 2, a bronze helmet in age 3 ---------- |
| `helmet` | 5463 | paint a bronze helmet |
| `mpMusket` | 5468 | the Bedil Kraton (Golden Age): the bedil gunner in a kere with a gold belt |
| `lightAge` | 5478 | ---------- light ranged units: levy cloth in age 1, a gold sash and band in age 4, never mail ---------- |
| `canvasRecolor` | 5489 | copy a picture with colours swapped |
| `ayAge` | 5497 | Ayutthaya soldier picture for a given age |
| `unit` | 5516 | pick the right age look for any civ's soldier |
| `shipSprite` | 5541 | the picture for a ship on the map |
| `raftSprite` | 5543 | rakit api: a bamboo raft heaped with dry fronds and husks, already alight |
| `shipAnchor` | 5555 | where a ship picture sits on its tile |

## ART 8 · Shared buildings and walls

`src/js/art/08-shared-buildings.js` · lines 5557 to 5778

Walls, gates, farms, ports and other buildings every civ shares, and wall styles by age.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `wallSprite` | 5565 | one wall tile. mask: 1 N, 2 E, 4 S, 8 W neighbours of the same side; open: a gate with friends close by. Palisade: sharpened logs. Melaka Kubu: planked... |
| `sawahSprite` | 5691 | Sawah: stepped rice terraces with water between the rows, earth bunds and a dangau hut (lore/scenes/bld-extra.js, fitted to 3 tiles) |
| `buildingSprite` | 5715 | the picture for a building |
| `civBuildingSprite` | 5717 | the picture for a building by civ |

## ART 9 · Icons

`src/js/art/09-icons.js` · lines 5779 to 5822

Small pictures for buttons, and marks on the ground.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `iconSprite` | 5784 | ------------------------------ icons & decals ------------------------------ |
| `rubbleSprite` | 5813 | rubble left by a destroyed building |

## ART 10 · Ground

`src/js/art/10-terrain.js` · lines 5823 to 5914

Grass, sand, water and cliffs (PAL is the ground palette).

**Things you can tweak**

- PAL: ground colours.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `buildTerrain` | 5836 | paint the whole ground map once at the start |
| `buildMiniBase` | 5907 | paint the minimap ground |

## SCREEN 1 · Screen, camera, fog

`src/js/ui/01-screen-camera-fog.js` · lines 5915 to 6035

Everything the player sees and touches starts here: the canvas, the camera, the fog of war and the build list.

**Things you can tweak**

- setZoom(): zoom limits, clamp(z, 0.38, 2.6). 0.38 = furthest out.
- clampCam(): how far past the map edge you can pan (0.3 and 0.35 of the screen).
- BUILD_ORDER, ECO_BLD: the order of build buttons and which tab they sit in.
- FORMS: formation types.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `clamp` | 5949 | ---------------- helpers ---------------- |
| `s2w` | 5951 | screen point to map point |
| `w2s` | 5953 | map point to screen point |
| `fmtTime` | 5955 | seconds as m:ss |
| `dataURL` | 5958 | picture as an image link (cached) |
| `fitIcon` | 5963 | shrink a sprite into an icon |
| `unitIcon` | 5972 | button icon for a unit |
| `bldIcon` | 5974 | button icon for a building |
| `resIcon` | 5980 | icon for food, wood or gold |
| `nodeIcon` | 5982 | icon for a resource on the map |
| `toast` | 5987 | pop-up message on screen |
| `resize` | 5995 | ---------------- view and camera ---------------- |
| `clampCam` | 6003 | the camera may run a little past each edge, so the corners can be brought out from under the HUD |
| `setZoom` | 6009 | zoom the camera, kept between 0.38 (far) and 2.6 (close) |
| `centerOn` | 6016 | move the camera to a tile |
| `inView` | 6018 | is this on screen? |
| `initFog` | 6021 | ---------------- fog ---------------- |
| `refreshFog` | 6026 | repaint the fog layer |

## SCREEN 2 · Drawing the battlefield

`src/js/ui/02-drawing.js` · lines 6036 to 6536

Draws ground, buildings, units, health bars, fire, arrows and the minimap every frame, sorted so nearer things cover farther ones.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `ell` | 6042 | ---------------- drawing ---------------- |
| `shadow` | 6044 | soft shadow under a unit |
| `hpBar` | 6046 | health bar |
| `isSel` | 6051 | is this selected? |
| `toolFor` | 6054 | which tool a villager holds for its job |
| `paintUnit` | 6061 | draw one unit |
| `torchFor` | 6109 | foot soldiers burn buildings with an obor (torch) rather than hacking at them with their weapons (lore/siege.md) |
| `paintTorch` | 6115 | draw the obor torch pose |
| `paintNode` | 6132 | draw a resource |
| `buildWallGrid` | 6156 | map of where wall pieces are |
| `wallMask` | 6162 | which neighbours a wall piece joins |
| `raftSide` | 6169 | which way a raft house leans to the water |
| `paintRaftHouse` | 6176 | draw a raft house |
| `paintFisher` | 6203 | draw the woman fishing from a raft house |
| `paintBuilding` | 6216 | draw one building with fire, flags and bars |
| `paintFx` | 6246 | draw effects (corpses, sparks) |
| `paintTop` | 6264 | draw top-layer effects (gun flashes) |
| `drawArrow` | 6308 | draw arrows and bullets in flight |
| `jobTarget` | 6337 | where a unit is headed for its job (gather / build / hunt target), if anywhere |
| `targetRing` | 6343 | ring around a target |
| `paintJobs` | 6349 | dashed trail from selected workers to their job |
| `paintMarkers` | 6364 | tap markers on the ground |
| `paintPlacement` | 6383 | the building ghost while placing |
| `paintLinePlacement` | 6403 | a wall line: every tile green (new), grey (already walled) or red (blocked), with the count and cost by its end |
| `placeButtons` | 6427 | touch placement: a ✓ (build) and ✗ (cancel) button under the ghost; their screen spots are kept for hit tests |
| `paintPlaceButtons` | 6434 | the Place/Cancel buttons on the ghost |
| `render` | 6446 | draw the whole frame |
| `drawMini` | 6512 | draw the minimap |

## SCREEN 3 · Selecting and giving orders

`src/js/ui/03-selecting.js` · lines 6537 to 6738

Turns taps into selections and orders (tap a unit, box select, double tap for all of a kind).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `selUnits` | 6542 | ---------------- selection and orders ---------------- |
| `select` | 6544 | change the selection |
| `addMarker` | 6546 | show where you tapped |
| `issue` | 6548 | give the selected units an order at a spot |
| `canRally` | 6564 | can this building have a rally point? |
| `setRallyFor` | 6566 | set a rally point from a tap |
| `contextCommand` | 6572 | the right order for what you tapped (gather, attack, repair...) |
| `selectSameKind` | 6578 | select all units of this kind on screen |
| `placeAt` | 6583 | move the building ghost |
| `nearestSite` | 6589 | nearest free village landing (trading post) |
| `tryPlace` | 6598 | place the building if the spot is OK |
| `startPlace` | 6615 | start placing a building |
| `nearWallPiece` | 6641 | nearest wall piece (for gates) |
| `findSpot` | 6647 | a good free spot for a building |
| `clearRallyTap` | 6658 | cancel a pending rally tap |
| `handleTap` | 6660 | what one tap does |
| `boxSelect` | 6708 | select everything inside a dragged box |
| `idleVillagers` | 6719 | list idle villagers |
| `cycleIdle` | 6722 | jump to the next idle villager |
| `selectArmy` | 6727 | select all soldiers |
| `selectNavy` | 6733 | every warship (fishing boats and trade ships keep working) |

## SCREEN 4 · Touch, mouse and keys

`src/js/ui/04-touch-mouse-keys.js` · lines 6739 to 6869

Finger drag to scroll, pinch to zoom, hold-drag to box select, mouse wheel, keyboard keys.

**Things you can tweak**

- The pinch zoom limit is also here (0.38, 2.6): keep it the same as setZoom().

**Functions**

| Name | Line | What it does |
|---|---|---|
| `pos` | 6746 | ---------------- pointer input ---------------- |
| `endPointer` | 6811 | finger or mouse lifted: tap, drag or box |
| `miniGo` | 6835 | tap the minimap to move the camera |

## SCREEN 5 · Action panel

`src/js/ui/05-action-panel.js` · lines 6870 to 7106

The panel at the bottom: build tabs, train buttons, stance, bell, repair, demolish.

**Things you can tweak**

- STANCES: the stance names and order.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `costHTML` | 6879 | cost shown with icons |
| `costTitle` | 6884 | cost as text |
| `cmdBtn` | 6886 | make one panel button |
| `lockBtn` | 6890 | a button for something a later age brings: greyed out, tapping it says which age |
| `ageBtn` | 6895 | the Town Centre's age-up button: the next age and its cost, or the work under way (tap to call it off) |
| `describeOrder` | 6902 | what a unit is doing, as text |
| `bldNote` | 6925 | help line for a selected building |
| `pName` | 6939 | name line in the panel |
| `buildPanel` | 6941 | build the bottom panel for the selection |
| `structKey` | 7033 | panel layout key (rebuild only when it changes) |
| `updatePanel` | 7040 | refresh numbers on the panel |
| `stanceOfSel` | 7056 | stance of the selected soldiers |
| `cycleStance` | 7058 | Stance button |
| `cycleFormation` | 7066 | Formation button |
| `stopSel` | 7068 | Stop button |

## SCREEN 6 · Top bar, game flow and saves

`src/js/ui/06-hud-saves.js` · lines 7107 to 7243

Resource bar, messages, pause, win/lose screens, autosave and the 3 save slots.

**Things you can tweak**

- SAVE_KEY / SLOTS_KEY: where saves are kept on the phone.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `hintText` | 7116 | the hint line at the top |
| `updateHud` | 7125 | refresh the top bar |
| `showOv` | 7142 | ---------------- game flow ---------------- |
| `startGame` | 7147 | start a skirmish |
| `enterGame` | 7156 | shared by a new game and a resumed one: rebuild the view state around G |
| `syncSpeedButtons` | 7164 | show which game speed is on |
| `lsGet` | 7169 | storage can be missing (private windows, previews): the game still runs, it just can't resume |
| `lsSet` | 7171 | save to the phone's storage |
| `lsDel` | 7173 | delete from the phone's storage |
| `saveSettings` | 7177 | save settings |
| `slotMetas` | 7184 | what is in the 3 save slots |
| `slotPick` | 7186 | which slot a new game uses |
| `slotWrite` | 7188 | write a save slot |
| `slotRead` | 7190 | read a save slot |
| `slotDel` | 7192 | delete a save slot |
| `slotNewest` | 7194 | most recent save |
| `slotLine` | 7196 | save slot label text |
| `saveGame` | 7200 | save the current game |
| `openSlot` | 7207 | a mission save opens its own page, which loads it |
| `continueGame` | 7214 | load a saved game |
| `quitToMenu` | 7223 | save and go to the menu |
| `discardGame` | 7225 | leave without keeping anything from this game: every slot it wrote goes back to what it held before |
| `confirmBox` | 7233 | a yes/no box over whatever is on screen |

## SCREEN 7 · Menus and encyclopedia

`src/js/ui/07-menus-encyclopedia.js` · lines 7244 to 7606

Home screen, Skirmish setup, Campaign and Battles lists, mission briefings, Encyclopedia text, Settings.

**Things you can tweak**

- BUILD: the version shown in Settings.
- ENCY_UNITS / ENCY_BLDS / ENCY_CIVS / ENCY_GUIDE: encyclopedia text.
- CAMPAIGNS / MISSIONS: mission lists, briefings and which are unlocked.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `showMenu` | 7259 | show a menu screen |
| `delAsk` | 7274 | two-tap Delete on the home screen |
| `refreshHome` | 7280 | update the home screen |
| `renderSlots` | 7289 | Load game screen |
| `setVerNote` | 7297 | version, updates and exit (the installed app has no browser bar to reload or close it) |
| `checkForUpdate` | 7299 | Settings > Check for updates |
| `showUpdateReady` | 7313 | bar saying a new version is ready |
| `exitApp` | 7321 | Exit button |
| `toastMenu` | 7327 | pop-up message on the menu |
| `syncMenuSegs` | 7332 | highlight the chosen Skirmish options |
| `portraitImg` | 7484 | hero portrait picture |
| `renderCampaign` | 7486 | Campaign screen |
| `showBrief` | 7499 | mission briefing screen |
| `renderHeroes` | 7513 | Encyclopedia heroes tab |
| `paintMenuArt` | 7525 | menu background art |
| `renderEncy` | 7532 | Encyclopedia screen |
| `renderEncyList` | 7537 | Encyclopedia list for the chosen tab |
| `togglePause` | 7602 | pause or resume |

## SCREEN 8 · Sound

`src/js/ui/08-sound.js` · lines 7607 to 7863

All sounds and music are made by code (SFX).

**Things you can tweak**

- master.gain.value (0.22): overall volume.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `unlock` | 7620 | start the sound system after the first tap (phones need a tap first) |
| `note` | 7634 | play one music note |
| `noiseAt` | 7645 | drum and splash noise |
| `play` | 7691 | play a named sound effect |
| `schedule` | 7715 | keep the music playing ahead of time |
| `menuTheme` | 7744 | the menus: the asli melody slowed right down on a soft triangle, a gambus pluck under it, the sea washing in every two bars and a gong every four |
| `setMood` | 7759 | switch music between calm and battle |
| `apply` | 7761 | fade to the new music mood |
| `sfxForMsg` | 7766 | which sound goes with which game message |
| `sfxTick` | 7821 | play sounds for what happened this frame |
| `endGame` | 7833 | game over: show the result |

## SCREEN 9 · Main loop

`src/js/ui/09-main-loop.js` · lines 7864 to 7904

Starts the game and keeps it ticking: 30 rule steps a second, drawing every frame.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `frame` | 7869 | ---------------- main loop ---------------- |

## EXTRA 1 · Calm map look and new maps

`src/js/extras/01-maps.js` · lines 7905 to 8432

Add-on: the quieter ground painting and the newer skirmish maps (Highlands, Deep Jungle, Mangrove Delta...).

**Things you can tweak**

- NEWMAPS entries: each new map's layout.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `paint` | 7940 | paint the calm ground look |
| `tree` | 7987 | paint a regional tree (palm, broadleaf...) |
| `plant` | 8007 | biome plants, same palette and outline as the game's trees |
| `wildSprite` | 8091 | ---------- sprites (game pixel style: 2x bake, auto outline) ---------- |
| `foodSprite` | 8109 | durian and wild banana pictures |
| `treeFor` | 8121 | which tree type grows at a spot |
| `fields` | 8131 | ---------- the three maps: terrain fields worked out from the seed only ---------- |
| `lookOf` | 8148 | which ground look a map uses |
| `clearStarts` | 8164 | clear space around the start bases |
| `linkStarts` | 8169 | make sure both bases can reach each other |
| `genHighlands` | 8178 | make the Highlands map |
| `genJungle` | 8205 | make the Deep Jungle map |
| `genDelta` | 8221 | make the Mangrove Delta map |

## EXTRA 2 · Animals and kerbau

`src/js/extras/02-animals-kerbau.js` · lines 8433 to 8923

Add-on: fruit groves, hunt animals (kancil, boar, seladang) and kerbau herding, fattening and ploughing.

**Things you can tweak**

- KB: cap 6 kerbau each, perGran 3 per granary, fat0 200 -> fatMax 400 food over fatTime 240 s, plough 1.3 (= 30% faster farm), buy 75 gold.
- NK.durian / NK.pisang: food in the new fruit trees.
- UD.seladang atk: how hard it fights back.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `bananaSprite` | 8461 | ---------- art ---------- |
| `berryArt` | 8478 | banana grove or mango tree picture |
| `kerbauSprite` | 8481 | kerbau picture: standing, grazing (head down) or ploughing (yoke and plough) |
| `haySprite` | 8525 | hay pile at the granary |
| `syahbandarSprite` | 8531 | Syahbandar Port (Melaka, Kingdom Age on): the lore hall, same size and footing as the port |
| `homeFor` | 8573 | where an owned kerbau should stand (granary, Town Centre or farm) |
| `sendHome` | 8586 | walk a kerbau to its spot |
| `kbSide` | 8650 | the quietest side of a building for kerbau spots |
| `slotIndex` | 8667 | which standing spot a kerbau gets (by arrival time) |
| `slotPoint` | 8677 | map position of a standing spot |
| `kbTick` | 8692 | kerbau each tick: claim, fatten, plough, follow |

## EXTRA 3 · Smarter AI

`src/js/extras/03-ai-plus.js` · lines 8924 to 8971

Add-on: the computer runs trade ships, claims wild kerbau, and Melaka's AI ploughs with them.

**Things you can tweak**

- AIP.traders: trade ships per difficulty (2/3/4).
- AIP.claimEvery (8 s), AIP.claimR (26 tiles): how often and how far it looks for kerbau.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aiPlus` | 8941 | the AI's extra jobs: trade ships, claim kerbau, plough |

## EXTRA 4 · Groups, facing and taps

`src/js/extras/04-groups-facing-taps.js` · lines 8972 to 9206

group tabs 1-4 and Make group, the Face button, soldiers facing their move direction, one-tap orders with two-finger deselect (or double-tap orders).

**Things you can tweak**

- TAP_MODE: 'single' (one tap orders) or 'double'; players switch it in Settings > Orders on touch (saved as seak-tapmode).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `aimable` | 8994 |  |
| `startAim` | 8999 |  |
| `setTapMode` | 9013 |  |
| `twoFingerTap` | 9014 |  |
| `faceSoldiers` | 9040 | the Face button: press where the soldiers should stand, drag to face, let go |
| `toggleFace` | 9041 |  |
| `faceAim` | 9046 |  |
| `faceIcon` | 9055 | pixel icon: a turning arrow around the spot where the soldiers stand |
| `aimMove` | 9078 |  |
| `aimDir` | 9079 |  |
| `aimEnd` | 9080 |  |
| `paintAim` | 9092 |  |
| `groupUnits` | 9124 |  |
| `soldiersSel` | 9125 |  |
| `grpPanelButtons` | 9126 |  |
| `saveGroup` | 9132 |  |
| `makeGroup` | 9139 |  |
| `pickGroup` | 9144 |  |
| `updateGroupBar` | 9165 |  |
| `closeGrpMenu` | 9179 |  |
| `openGrpMenu` | 9180 |  |

## EXTRA 5 · Compact screen

`src/js/extras/05-compact-hud.js` · lines 9207 to 9318

a bigger play area: no hint strip (small clock, tips pop up then fade), slim one-row panel, icon-only command buttons, smaller foldable minimap.

**Things you can tweak**

- the CSS sizes at the top (minimap 84x63) and how long a tip stays (5 s).

**Functions**

| Name | Line | What it does |
|---|---|---|
| `nameOf` | 9266 |  |
| `boot` | 9280 |  |
| `compactRest` | 9300 | the parts every page gets: the minimap fold button and group tabs that appear once a group exists |

## EXTRA 6 · Base footprints, wading, wet ports, house drop-off

`src/js/extras/06-footprint-wading.js` · lines 9319 to 9366

buildings stand on their base only (the roof hangs over the tiles behind), land units wade through shallow water in Skirmish, a Port's deck may sit on shallow water, Ayutthaya paddy farmers drop rice at their paired house, and the panel button tidy-ups (centred icons, red Demolish, one-row queue).

**Things you can tweak**

- FOOT: how many tile rows each building really stands on.
- WADE / PORTWET: switch wading and ports-on-shallows off. Missions keep their own water rules (no wading).
- HOUSEDROP: Ayutthaya farmers drop rice at their house.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `wadeOn` | 9334 | wading is for Skirmish; campaign missions and battles (they have setupObj) keep their own water rules |

## EXTRA 7 · Fire Arrows research

`src/js/extras/07-fire-arrows.js` · lines 9367 to 9433

Panah Api (lore/siege.md): from Age 2 the Barracks can research Fire Arrows once. Archers then do extra damage to buildings and set them alight more often. Torches on melee hits stay automatic.

**Things you can tweak**

- FIRE_ARROWS.cost / time / age: price, research seconds and the age it opens in.
- FIRE_ARROWS.bld: extra damage per arrow on a building; FIRE_ARROWS.chance: chance an arrow lights it (20% before).
- FIRE_ARROWS.aiGold: gold the computer keeps spare before it researches.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `fireArrowBtn` | 9427 | the Barracks button: research, progress, or done |

## EXTRA 8 · Khmer

`src/js/extras/08-khmer.js` · lines 9434 to 11578

the fourth civ (civ id 4, column 3 of the per-civ tables). Groundwork: every per-civ table gets a Khmer column. Until Khmer's own roster lands, a missing Khmer value copies Melaka's, so nothing breaks.

**Things you can tweak**

- KHMER: Khmer's own values; anything set here wins over the Melaka copy.

**Functions**

| Name | Line | What it does |
|---|---|---|
| `barayPlots` | 9466 | the 8 plots (top-left tile of a 2 x 2 farm): 3 above, 3 below, 1 at each end |
| `barayPlotOf` | 9471 | which plot of Baray b this farm stands on (-1: none) |
| `plotFarm` | 9476 | the farm standing on a plot, if any |
| `weave` | 9501 |  |
| `sacks` | 9502 |  |
| `crates` | 9503 |  |
| `banner` | 9504 |  |
| `melakaBuilding` | 9506 |  |
| `neutralSite` | 9556 | Neutral map sites. Pangkalan can only be built on a landing next to a settlement. |
| `brick` | 9584 |  |
| `meru` | 9586 | meru: stacked black thatch tiers, each narrower than the one below |
| `surya` | 9588 | sun of Majapahit (Surya Majapahit) emblem |
| `mjBanner` | 9589 |  |
| `majapahitBuilding` | 9591 |  |
| `ijukRoof` | 9648 | black ijuk gable roof with a thick dark edge |
| `majapahitBase` | 9650 |  |
| `hull` | 9698 | Hull with an upswept bow and stern. x0..x1 is the deck length, y the deck line. |
| `tanja` | 9706 | Tanja sail: slanted four-sided sail between two spars, the classic Nusantara rig. |
| `fan` | 9714 | Junk-style battened fan sail (the green sails of the great Jong). |
| `sq` | 9722 | Square sail with a darker belly edge (European-influenced late ships). |
| `mast` | 9723 |  |
| `flag` | 9724 |  |
| `oars` | 9725 |  |
| `crew` | 9726 |  |
| `flames` | 9727 |  |
| `navalSprite` | 9740 |  |
| `drawCivUnit` | 9845 |  |
| `civUnitSprite` | 9931 |  |
| `elephantSprite` | 9936 | Chang Suek: Ayutthaya war elephant with a mahout and a spearman in a gilded howdah. 28x26 logical. |
| `drawKhmerUnit` | 9972 |  |
| `khmerUnitSprite` | 10016 |  |
| `ballistaElephantSprite` | 10021 | Ballista Elephant: elephant with a large double-bow crossbow on its back, crewed by two. 28x26 logical. |
| `khmerCanoeSprite` | 10047 | River war canoe from the Bayon naval relief: long, low, many paddlers, a carved prow. 32x18 logical. |
| `junk` | 10075 | Battened junk sail: a tall rectangle with battens and a rounded top-front corner. |
| `prow` | 10080 | Tall curving prow (Thai and Khmer barges). |
| `eye` | 10082 | Painted bow eye, the mark of Vietnamese boats. |
| `pavilion` | 10084 | Pavilion with a tiered pointed roof. |
| `mainlandShip` | 10089 |  |
| `civTeam` | 10215 |  |
| `thaiRoof` | 10221 | Thai roof: steep layered gable with chofa horns at the ridge ends |
| `vietRoof` | 10227 | Vietnamese roof: low tiled hip roof with upturned corners |
| `prasat` | 10234 | Khmer prasat tower: stepped sandstone tower with a lotus-bud top |
| `mainlandBuilding` | 10239 |  |
| `pier` | 10326 |  |
| `rack` | 10327 |  |
| `mainlandBase` | 10329 |  |
| `kmHash` | 10417 | deterministic hash for pit/texture placement |
| `kmLaterite` | 10419 | laterite blocks: rusty orange-brown, staggered courses, dark pits |
| `kmSand` | 10434 | sandstone: smooth grey-tan ashlar |
| `kmCoping` | 10444 | sandstone coping / cornice band |
| `kmPrasat` | 10446 | corncob prasat tower: a body with a false door, then stacked tiers tapering to a lotus bud |
| `kmFace` | 10470 | carved Bayon face: crown, brows, closed eyes, broad nose, calm smile. s = 1 small (7x9) or 2 large (11x13) |
| `kmNaga` | 10492 | naga balustrade: a stone serpent body on little posts, ending in a fanned multi-headed hood |
| `kmBanner` | 10502 | blue team banner with a gold border and a small gold lotus |
| `kmTileRoof` | 10504 | steep tile roof with ribbed tile channels and upswept gold gable horns |
| `kmBuilding` | 10515 |  |
| `cartBallistaSprite` | 10633 |  |
| `kmHash` | 10681 | deterministic hash for pit/texture placement |
| `kmLaterite` | 10683 | laterite blocks: rusty orange-brown, staggered courses, dark pits |
| `kmSand` | 10698 | sandstone: smooth grey-tan ashlar |
| `kmCoping` | 10708 | sandstone coping / cornice band |
| `kmPrasat` | 10710 | corncob prasat tower: a body with a false door, then stacked tiers tapering to a lotus bud |
| `kmFace` | 10734 | carved Bayon face: crown, brows, closed eyes, broad nose, calm smile. s = 1 small (7x9) or 2 large (11x13) |
| `kmNaga` | 10756 | naga balustrade: a stone serpent body on little posts, ending in a fanned multi-headed hood |
| `kmBanner` | 10766 | blue team banner with a gold border and a small gold lotus |
| `kmTileRoof` | 10768 | steep tile roof with ribbed tile channels and upswept gold gable horns |
| `kmBuilding` | 10779 |  |
| `bxPaddy` | 10900 | rice paddy shared by both: water, bunds, rows of rice that grow with the level |
| `bxSpears` | 10912 | a rack of spears (tassel colour per civ) |
| `kmBuildingX` | 10914 |  |
| `building` | 10967 |  |
| `kmUnit` | 11086 |  |
| `kmuPerson` | 11094 |  |
| `kmuDoubleBow` | 11222 | Each bow is an arc with its tips bent back; the string runs to the nock (drawn) or straight across (shot). |
| `kmuCrew` | 11238 | small seated/standing figure: head at y, body below |
| `kmuElephant` | 11246 |  |
| `kmuCart` | 11289 |  |
| `guardUnit` | 11326 |  |
| `gduPerson` | 11331 |  |
| `kmShipFor` | 11447 |  |
| `baraySprite` | 11467 |  |
| `barayBasket` | 11494 | a basket of rice in logical pixels of the Baray art |
