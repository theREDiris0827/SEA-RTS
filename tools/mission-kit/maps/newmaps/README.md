# New skirmish maps: Highlands, Deep Jungle, Mangrove Delta (draft patch, 2026-11-01)

Made in the art thread ("Unit, mob and map art style") for Iylia. **Not in index.html yet**: a game thread wires it in after Iylia's OK.

## Files
- `calm.js` - the calm map painter (window.CALM: paint, tree, plant), same as unit-art/map-art/src/calm.js.
- `newmaps-core.js` - the maps, new food/animals and drawing hooks (one IIFE, load after the main game script).
- `menu.js` - adds the three map buttons to the skirmish picker (#m-mapk).
- `thumbs.js` - picker thumbnails (window.NEWMAP_THUMBS), regenerate if a map's layout changes.
- `build.py <index.html> <out.html>` - injects calm + thumbs + core + menu as one <script> before the service-worker script. This is how the playable preview was made, and the simplest way to wire it in.

## What it adds
- MAPDEF: `highlands`, `jungle` (name "Deep Jungle"), `delta` ("Mangrove Delta"), all 96x72, plus MAP_NOTES.
  - Highlands: river valley (3 fords), rice terraces (grass, kept clear of trees for farms), two hill ridges with passes, 22 groups of karst towers (cliff tiles, drawn as tall limestone stacks), bamboo on the slopes, pines up high.
  - Deep Jungle: no sea. A stream with muddy fords and three pools, ~2800 trees, three trails between the bases, rock outcrops.
  - Mangrove Delta: dry north for both bases, a swamp belt (shallow water) crossed by mud causeways, four tidal creeks, mangroves on the mud, 3 Orang Laut villages, sea in the south.
- Food: NK `durian` (300 food, rate 1.1) and `pisang` wild bananas (200, rate 1.4), with NODE_NAME/BRIEF/nodeIcon.
- Hunt animals (team 2, cls 'animal', flee like deer): `kancil` (hp 8, 60 meat), `boar` (hp 30, 170 meat), `seladang` (hp 70, 320 meat); `UD.x.meat` sets the carcass size (deer 120).
- Ground looks (mud, swamp water, terraces, karst) are derived from terrain + seed when drawing, so saves need no new fields.
- Hooks (all fall through to the original for old maps): Game.prototype.genMap/populate/addNode, buildTerrain, buildMiniBase, paintNode, paintUnit, nodeIcon, unitIcon.

## Tested (headless, against v0.9.33 index.html)
Each map: generates in under 0.1 s, terrain draws in about 0.7 s, bases are land-connected, 20 minutes of hard AI with no errors, and the AI raid reaches an idle player's town centre at about 5.5 min. Animal and food panels open.
