# GALAGA

A Galaga clone in plain JavaScript and HTML5 canvas. No build step, no
dependencies, no bundler — open `index.html` and play.

```
┌──────────────────────────────┐
│  1UP        HIGH SCORE       │
│  7050         20000          │
│                              │
│      🟢 🟢 🟢 🟢             │  ← boss galaga
│    🦋🦋🦋🦋🦋🦋🦋🦋           │  ← butterflies
│    🦋🦋🦋🦋🦋🦋🦋🦋           │
│  🐝🐝🐝🐝🐝🐝🐝🐝🐝🐝         │  ← bees
│  🐝🐝🐝🐝🐝🐝🐝🐝🐝🐝         │
│                              │
│              🚀              │
└──────────────────────────────┘
```

## Play

Open `index.html` in any modern browser. That's it — it runs straight from
`file://` because everything is classic scripts and procedural assets.

If you'd rather serve it over HTTP:

```sh
npm start          # tiny zero-dependency static server on :8080
```

### Controls

| Key | Action |
| --- | --- |
| `←` `→` or `A` `D` | Move |
| `Space` / `↑` / `W` | Fire (hold to autofire) |
| `Enter` | Start |
| `P` | Pause |
| `M` | Mute |
| `F` | Fullscreen |

On phones and tablets, three touch zones appear along the bottom of the
screen: left, fire, right.

## What's in it

The mechanics that make Galaga *Galaga*, not just a Space Invaders variant:

- **Formation entrances.** Forty enemies fly in as five squadrons of eight,
  each looping along its own curved route before settling into the 5×10
  formation. Routes mirror on alternate stages.
- **Diving attacks.** Enemies peel out of formation in ones, twos and threes,
  swoop past you, exit the bottom of the screen and re-enter from the top.
  They're worth more points while diving than while parked in formation.
- **Tractor beam.** A Boss Galaga will break formation, hover above you and
  open a beam. Sit in it and your fighter is stolen — you lose a ship and it
  gets towed back to the formation underneath its captor.
- **Dual fighter.** Shoot the boss holding your captured ship and it drifts
  back down. Fly into it and you get a double-wide fighter with twice the
  firepower. (You can also shoot it by mistake. Don't.)
- **Challenging stages.** Every fourth stage from stage 3 is a bonus round:
  eight squadrons of five fly through in patterns, nothing shoots back, and
  hitting all forty pays a 10,000 point special bonus.
- **Score, badges and extra lives.** Stage badges accumulate bottom-right in
  the arcade's 50/30/20/10/5/1 denominations. Extra life at 20,000, then every
  70,000. High score persists in `localStorage`.

Every asset is generated at runtime: sprites are baked from character grids,
the 5×7 font is a bitmap table, and all sound is synthesised with WebAudio.
There are no image or audio files anywhere in the repository.

## Layout

```
index.html          markup, styling, script order
src/util.js         constants and math helpers
src/audio.js        WebAudio sound effects
src/sprites.js      pixel-art sprites baked to offscreen canvases
src/stars.js        scrolling, blinking starfield
src/paths.js        turtle-graphics flight-path builder
src/entities.js     player, projectiles, enemies, explosions
src/stages.js       formation layout, entrance choreography, difficulty
src/hud.js          bitmap font, score, lives, stage badges
src/game.js         state machine, attack scheduling, collisions, rendering
src/main.js         canvas scaling, input, fixed-timestep loop
```

### How the flight paths work

Enemies never move in straight lines, and hand-placing spline control points
for every entrance and dive gets unmanageable fast. Instead `paths.js` drives a
turtle that can only do two things — go forward, or turn along an arc of a
given radius:

```js
new Turtle(x, y, -90)   // start at (x, y) heading up
  .forward(110)         // climb
  .turn(360, 26)        // full loop, 26px radius
  .forward(70)          // keep climbing
  .done()               // → polyline sampled by arc length
```

Because every segment starts tangent to the previous one, the resulting path is
smooth by construction and an entity following it never snaps direction. Dive
routes are generated the same way from wherever the enemy happens to be sitting
in the formation when it launches.

## Simulation model

The game runs on a fixed timestep: `game.update(1, input)` advances exactly one
frame at 60fps, and the render loop accumulates real time and steps the
simulation up to five times per animation frame. All speeds in the source are
per-frame values, which is why they look like small numbers.

That also makes the whole thing scriptable — the game object is exposed as
`window.game`, so you can fast-forward thousands of frames headlessly:

```js
for (let i = 0; i < 600; i++) {
  game.update(1, { left: false, right: true, fire: true, firePressed: false, startPressed: false })
}
```

## Licence

MIT. Galaga is a trademark of Bandai Namco Entertainment; this is an
independent tribute, built from scratch, using no original assets or code.
