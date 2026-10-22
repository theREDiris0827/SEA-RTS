# The Treasurer's Gate: Melaka campaign, mission 1 (demo)

A standalone, playable demo of the first Melaka campaign mission. It runs on the same engine as the main game but in its own single file, `index.html`, with no other files needed.

Singapura, c. 1398. Hold the walls against Majapahit. When the treasurer opens the gate, get Parameswara out by sea. Then found a new town at Bertam and proclaim Melaka.

## Parts

1. **The siege:** hold the walls until dawn. Villagers can repair walls and gates.
2. **The escape:** the postern is betrayed. The Temenggung makes his stand while you get Parameswara onto an Orang Laut boat and sail west past the fleet.
3. **Founding Melaka:** build a Town Centre, two Houses and a fishing boat, and drive off the raid. Then save 400 food, 400 wood and 400 gold to proclaim Melaka. The proclamation turns your people and soldiers into Melaka units.

You can jump straight to a part from the title screen, or with a link:
- `.../campaign/melaka-1/#escape`
- `.../campaign/melaka-1/#founding`

## Notes

- Sound effects and music are generated in the browser, with no audio files. The music uses the Malay ghazal mode over rebana frame drums and a gong, with nobat-style drums in battle. You can turn sound and music on or off in the pause menu.

- History follows the Sejarah Melayu. Loading tips give other sources, such as Tomé Pires. The Temenggung is an invented person holding a real title.
- Ayutthaya appears only in teases: the scorched wall, a loading tip, Siamese sails in part 3, and the closing line.
- The demo source is kept in the project files under `melaka-m1-demo/src/`. `build.py` there builds this file from the main game's `index.html`.
