# Changelog

All notable changes to this project are recorded here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
this project uses simple `vMAJOR.MINOR` milestones while it's a prototype.

## [v0.4] — Llama/Dozer pass, Carl glow-up

First gameplay iteration after live playtesting.

### Added
- Goblin Dozer is now a **crewed construction roller**: bigger, with three goblins
  riding on top. Same charge → wall-slam → stun mechanic as before. When the vehicle
  is wrecked, the three-goblin crew is **ejected** and you brawl them — turning the
  elite into two beats (wreck the machine, then mop up the crew)
- Carl now sports a **black cape and heart boxers**

### Changed
- Encounter 3 is now the Dozer alone (its ejected crew replaces the two escort goblins)

### Fixed
- First-fight camera lock no longer snaps: the arena only locks once the camera has
  fully settled on its mark, so entering the fight is seamless

### Notes
- Bad Llama left as-is — it's landing well as the floor's first real difficulty spike
- See `BACKLOG.md` for the deferred item-drop balance note

## [v0.3] — Test tooling

No gameplay changes. Added an automated, code-level safety net.

### Added
- Headless smoke test (`test/smoke.js`): runs the game logic with no browser and
  checks for crashes, NaN positions, attack-token leaks, broken encounter
  progression, Bad Llama projectile firing/culling, and the full Goblin Dozer
  state machine (modes, front-armor, stun window, death)
- `npm test` script in root `package.json`
- `test/README.md` documenting how to run it and what it does / doesn't cover

## [v0.2] — Deployment fix

No gameplay changes.

### Fixed
- Added `.nojekyll` so GitHub Pages serves `index.html` (the game) directly instead
  of running Jekyll and rendering `README.md` as the homepage

## [v0.1] — Floor 1 vertical slice

First saved milestone. A complete, verified slice of Floor 1.

### Added
- Core brawler combat: melee attack, special-meter AoE, lives + respawn, i-frames
- 2.5D depth-plane movement with depth-sorted rendering
- Hit feedback pass: hit flash, knockback, hitstop, screen shake, particles, floating text
- Three-encounter traversable floor with transit corridors and a "GO" prompt between arenas
- Per-arena camera locks and barriers; smooth approach so room transitions don't lurch
- Enemies:
  - Goblin and Rat — melee MOBs with telegraphed attacks
  - Bad Llama — ranged MOB that kites and fires dodgeable lava projectiles
  - Goblin Dozer — ELITE with a charge → wall-slam → stun-window mechanic;
    armored from the front (flank it or punish the stun)
- Elite health bar
- Breakables (trash can, vending machine, supply crate) with weighted item drops
- Items: heals, extra life, special-meter refills, melee buff
- Arcade / CRT presentation (scanlines, vignette, pixel fonts, announcer flavor text)

### Tuning
- Guaranteed-spread enemy flanking so pressure is consistent run to run (not RNG-swingy)
- Breakables spread evenly along corridors rather than clustered at the start

### Verified
- Headless simulation: no runtime errors across the full floor
- Encounter chain completes Enc1 → Enc2 → Enc3
- Dozer cycles through all states and resolves correctly; no attack-token leaks

[v0.1]: #
