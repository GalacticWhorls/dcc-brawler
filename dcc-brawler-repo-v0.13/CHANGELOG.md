# Changelog

All notable changes to this project are recorded here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
this project uses simple `vMAJOR.MINOR` milestones while it's a prototype.

## [v0.13] — Gym approach

The lead-up to the Juicer (his fight is next). Same pattern as the Hoarder: new mob
plus approach encounters first, boss after.

### Added
- **Gym Lizard** — fast, fragile mob with an **extended-reach tongue lash**: darts to
  just outside punching range and flicks its tongue out (telegraphed poke with more
  reach than a goblin), so you have to close *past* it
- **Encounters 7 & 8** past the Hoarder's lair: Gym Lizards mixed with existing types,
  ramping toward the Juicer's gym
- Floor extended to eight encounters

### Temporary
- **2× breakables** for easier testing — a duplicate set is appended in `reset()`.
  Marked `TEMP (v0.13)`; logged in `BACKLOG.md` to revert before the floor ships

## [v0.12] — Special juice & door redesign

### Changed
- Special ("Daddy Tax!") reworked: hits harder (52, up from 34), now **stuns** everything
  in range, throws a **red** shockwave instead of blue, and pops a yellow "DADDY TAX!"
  callout when triggered
- Boss-chamber door redrawn as an actual gated doorway — heavy posts and lintel, a
  descending hazard-striped blast shutter, a dark passage behind — and the "BOSS CHAMBER"
  neon now visibly pulses
- "READY" is now properly centered (vertically and horizontally) on the special bar

## [v0.11] — The Hoarder

Floor 1's spawner boss and the systems her fight needed.

### Added
- **The Hoarder** (BOSS): enormously fat, very high HP, rooted. She floods the lair
  with cockroaches and rats — both from herself and from smashable junk piles — up to a
  live cap, and periodically **swells then belches a lingering poison cloud** in front
  of her. Beating her clears the lair (death = victory, no mop-up)
- **Smashable junk piles** — spawn sources you can destroy to throttle the flood
- **Poison status** on the player: damage-over-time with a green tint, on-sprite stink,
  and a HUD pip. First piece of a reusable status system (chill/root later)
- **Poison gas clouds** — lingering area-denial hazards that apply poison on contact
- **Boss-chamber lock-in door**: a hallway door with slow-pulsing yellow "BOSS CHAMBER"
  neon that seals behind Carl on entry, so there's no retreat (per the book)
- Floor extended to six encounters (the Hoarder's lair caps the built floor for now)

### Tested
- Smoke test now covers the Hoarder (swarm respects the cap, gas poisons, death clears
  the lair) and the door (seals on entry, blocks retreat)

## [v0.10] — HUD & breakable polish

### Changed
- Vending machines now have their own sprite (stocked glass front, header, coin panel,
  dispenser) instead of the generic box; trash cans and supply crates also got distinct
  silhouettes
- HUD panels are a bit larger overall; "READY" now flashes in the centre of the special
  bar (in a complementary colour) instead of being hidden behind it
- Extra lives are red hearts now, matching Carl's boxers
- Melee-multiplier pickups have a visible badge on the panel again ("MELEE x2")

## [v0.9] — Arcade HUD, multiplayer-ready

### Changed
- HUD reworked into an arcade layout: each player gets a compact panel (colored tag,
  character name, HP, special, lives, and their own score) and the panels sit across
  the top; the boss bar keeps the bottom to itself. Fixes the score/special overlap
- Score now lives on the player (each panel shows its own), via a `players[]` list and
  a `drawPanel(player, slot, total)` renderer — one player today, but the layout is
  architected for up to four so co-op is a drop-in later (no netcode yet)

### Fixed
- Smoke test: token-drain check is now deterministic (clears the field and checks
  before any respawn), so it no longer false-fails on RNG

## [v0.8] — Readability & mix pass

Tuning/polish on v0.7 (no new systems).

### Changed
- Breakables no longer sit in two rigid rows: vending machines line the back wall,
  and loose junk/crates are scattered at randomized depth across the floor
- Enc4/Enc5 rebalanced for a real range+melee mix — Bad Llamas woven back in
  throughout, with only the **final wave** collapsing to a pure rat+roach swarm to
  signal the approaching Hoarder
- Cockroach redrawn (flat segmented shell, splayed legs, long sweeping antennae) and
  the rat given a curling pink tail, so the two read as clearly different creatures

## [v0.7] — Infestation begins

First slice of the back half of Floor 1: two new mobs and the encounters that
introduce them on the approach to the Hoarder's lair. (No Hoarder yet — she's v0.8.)

### Added
- **Cockroach** — tiny, very fast, very weak skittering melee swarm mob
- **Rot Sticker** — countdown leaper: closes in, flashes on a ramping countdown, then
  leaps at Carl. Contact = it explodes for damage and dies; a miss leaves it stunned
  on the ground ~1s, open for a free kill
- **Encounters 4 & 5** past the Dozer: a mixed roach+goblin skirmish, then a thicker
  roach/rat wave with leapers — escalating the infestation toward the lair
- Floor extended to five encounters; world length and breakable spread updated
- Versioned design doc at `docs/floor1-design.md` (roster, elite reworks, build order)
- Smoke test: floor-progression check now verifies all five encounters; added a Rot
  Sticker check (countdown, leap, explode-on-contact, whiff-to-stun)

## [v0.6] — Dozer bite

### Changed
- Goblin Dozer charge now deals 40 damage (up from 22) — eating a charge is a real
  punish for misreading the wind-up

## [v0.5] — Carl finishing touches

### Changed
- Carl gains a **black vest** (open over the chest) and his forehead band is now a
  **bandit bandana** across the lower half of his face, with a knot trailing at the back

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
