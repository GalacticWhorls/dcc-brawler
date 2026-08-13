# Floor 1 — Design Notes

Living design doc for Floor 1's enemy roster, elites, and build sequence.
Mechanics and flavor here are this project's own; names are DCC-flavored labels.
Numbers are set at build time and tuned by feel during playtests.

## Combat verbs (what each enemy makes the player *do*)

### Mobs
- **Goblin** *(built)* — baseline melee bruiser. Telegraphed swing.
- **Rat** *(built)* — fast, fragile melee. Swarms.
- **Bad Llama** *(built)* — ranged kiter; lobs dodgeable lava bolts. Stops you camping.
- **Cockroach** *(v0.7)* — tiny, very fast, very weak skittering melee. Pure swarm
  pressure; the Hoarder's signature spawn.
- **Rot Sticker** *(v0.7)* — countdown leaper. Closes in, then **flashes on a visible
  countdown** (flash speeds up) and **leaps at Carl**. Contact on the leap = it
  **explodes** for damage and dies; a miss leaves it **stunned ~1s on the ground**,
  open for a free kill. Verb: read the tell, sidestep, punish.
- **Chilly Goat** *(later)* — melee; hit applies a movement **slow (chill)**. Low
  direct damage, but a slowed Carl gets caught by everything else.
- **Vine Creeper** *(later, infrequent)* — rooted plant; ranged lash **roots** Carl in
  place ~1s (can still attack/turn). Low priority; sprinkled in occasionally, not a
  wave anchor.
- **Gym Lizard** *(v0.13, built)* — the Juicer's minions; small, fast, fragile, with an extended-reach **tongue lash** (pokes from just outside punching range).

### Roster mixing
From v0.7 onward, encounters **blend old and new types** (goblins/rats with roaches,
stickers, etc.) rather than introducing one type in isolation. New verbs still get a
gentle first touch, then the floor's back half should feel like a varied ecosystem.

## Elites

### The Hoarder — spawner siege *(v0.11, built)*
- **Lock-in door:** her lair is entered through a hallway door with "BOSS CHAMBER" in
  slow-pulsing yellow neon above it; crossing the threshold drops the door shut behind
  Carl so he can't retreat into the hallway (true to the book's boss lock-ins).
- Enormously fat, **very high health**, slow, largely stationary.
- **Spawns cockroaches and rats continuously**; her **junk piles also birth them**.
- **Junk piles are smashable** — destroying a pile removes a spawn source, so clearing
  them is the lever that slows the flood.
- **Poison attack:** she **swells over ~0.6s** (inflating, telegraph), then **releases a
  noxious green cloud** in an arc in front of her. Standing in it applies **Poison**
  (damage-over-time, sickly-green tint on Carl, rising stink marks); the cloud lingers
  briefly as soft area denial. Counter: don't be in front of her when she finishes
  swelling. (Fart vs. burp = flavor only.)
- **Approach ramp:** rats and cockroaches grow steadily more prevalent in the
  encounters leading to her lair, so the infestation is felt before you arrive.
- New tech: cockroach mob, enemy-spawner behavior, smashable spawn points, player
  Poison status.

### The Juicer — roided gym lizard *(next)*
- Hugely muscular, vein-bulging **bipedal lizard-person**; fights in a gym.
- **Fast and strong**, distance-gated kit: **throws weight plates** at range,
  **smashes with a barbell** up close. Punishes both spacing extremes.
- Minions: several **small bipedal lizards**.
- New tech: small-lizard mob, two-mode (ranged/melee) AI keyed off distance (reuses
  Llama ranged + Dozer telegraph patterns).

## Hazard
- **Explosive barrels** *(later)* — smashable; detonate in a radius hurting enemies
  **and** Carl, chaining to nearby barrels. Risk/reward zoning.

## Floor 1 layout (left → right)
Section 0 tutorial → Enc1 Goblins/Rats *(built)* → Enc2 Bad Llamas/Goblins *(built)*
→ Enc3 Goblin Dozer *(built)* → **Enc4/Enc5 roach+sticker infestation ramp (v0.7–v0.8)**
→ Hoarder's lair *(built)* → gym approach *(built)* → the Juicer *(next)* → Ball of Swine *(later)*.

## Build order (one playtested increment per version; never over-reach)

Shipped:
- **v0.7** — Rot Sticker + Cockroach mobs; Enc4/Enc5 approach encounters
- **v0.8** — Readability & mix tuning pass (breakable scatter, encounter mix, roach/rat sprites)
- **v0.9** — Arcade HUD, multiplayer-ready: per-player panels across the top, boss bar bottom
- **v0.10** — HUD & breakable polish (vending-machine sprite, bigger HUD, READY-on-bar,
  heart lives, melee-multiplier badge)
- **v0.11** — The Hoarder (lock-in door, spawner, smashable junk piles, swell→poison
  cloud, poison status system, huge HP; death clears the lair)
- **v0.13** — Gym Lizard mob + gym-approach encounters (Enc7/Enc8); TEMP 2x breakables

Planned (numbers assigned when shipped, since small polish passes may slot in between):
- **Next** — The Juicer (weight-plate throws at range, barbell smash up close; his Gym
  Lizards already built)
- **Later** — Ball of Swine boss; then playable characters (Donut/Florin/Elle), one at a
  time, so each new character debuts against a finished floor
