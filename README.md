# Shuffleboard

A browser-based 3D table shuffleboard game built with a custom GLB table and red/blue pucks. The playing surface is 20 inches wide by 252 inches long.

## Play

- Slide sideways to position your puck, then push up and release.
- A deliberate diagonal forward stroke adds up to 3 degrees of angle; the blue line previews direction.
- On phones, push distance sets throw weight. With a mouse, forward speed sets throw weight.
- Keyboard: left/right arrows position the puck, Q/E adjust angle, and hold/release Space sets throw weight.
- Tap the scoring-area inset or use **End view** to inspect the full scoring area.
- Play the computer or switch to solo practice.

Four pucks per side, alternating shots. Only the leading color scores; first to 15 wins. The previous frame's scorer leads the next frame. A blank frame switches the hammer (last shot). A coin toss selects the opening player.

The camera follows the puck and rises into an overhead scoring view. The table includes rounded wood rails, textured gutter lining, puck collisions, and gutter-wall containment. Desktop has a vintage slide scorer; phones keep the scoreboard with the bottom controls.

## Rooms

Use the **Room** button and chooser below the controls to choose **Roadside Bar** or **Classic Room**. Roadside Bar is a modeled 24-by-36-foot neighborhood bar inspired by supplied reference photos, with dark beams, hanging pewter mugs, bottle shelves, brass draft hardware and foot rail, a framed antique sailing ship print, and backless red leather stools. The ceiling fittings hide as the camera rises into scoring view. Classic Room retains the personal black-and-white boat photographs. Room choice is saved in this browser; switching rooms preserves scores, pucks, and turn. Both rooms vary the floor stain for each new game.

## Analytics

GoatCounter is connected to `https://shuffleboard.goatcounter.com/count` for pageviews, game/practice starts, room changes, and human/computer wins. The site code lives in `analytics-config.js`. Local previews are excluded. A blocked counter cannot interrupt gameplay, and no player names or detailed puck input are collected.

## Run locally

From this directory:

```sh
python -m http.server 8000
```

Open http://localhost:8000. A local server is required to load ES modules and the GLB model.

## Hosting

This is a static site with no build step. Upload this directory to a static host, or configure GitHub Pages to serve the `main` branch from `/ (root)`.

## Files

- `index.html`, `style.css`: interface and responsive layout
- `game.js`: input, physics, scoring, computer player, cameras, and room selection
- `room.js`, `roadside-room.js`: modeled rooms and procedural materials
- `table.glb`: custom table and puck model
- `table-finish.js`: rounded woodwork and procedural materials
- `software-renderer.js`: fallback for browsers without WebGL
- `vendor/`: bundled Three.js 0.180.0 and its MIT license

Rule reference: https://www.shuffleboardfederation.com/shuffleboard-federation-official-table-shuffleboard-rules.html
