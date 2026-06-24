# Changelog

All notable changes to this project are recorded here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
this project uses simple `vMAJOR.MINOR` milestones while it's a prototype.

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
