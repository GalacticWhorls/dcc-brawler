# Tests

A headless smoke test for the game's logic. It runs `index.html` with **no browser**
— stubbing out the canvas — and drives the simulation through thousands of frames,
watching for code-level breakage so you don't have to hunt for it by hand.

## Run it

From the repo root (needs [Node.js](https://nodejs.org) installed):

```bash
node test/smoke.js
```

or, equivalently:

```bash
npm test
```

It prints a `[PASS]`/`[FAIL]` line per check and exits `0` if everything passed,
`1` if anything failed.

## What it checks

- **Loads cleanly** — the game script parses and runs without throwing.
- **Floor progression** — the encounter chain advances Enc1 → Enc2 → Enc3 and each
  one completes (and the Dozer actually spawns in Enc3).
- **Attack tokens** — the enemy attack-slot accounting never exceeds the cap and
  always drains back to zero (guards against the "everyone freezes" leak bug).
- **Bad Llama projectiles** — lava bolts fire and then get cleaned up (no leak).
- **Goblin Dozer** — the elite cycles through all its states
  (enter → reposition → telegraph → charge → stunned), blocks hits from the front,
  takes damage during the stun window, and dies properly.

## What it does NOT check

Anything visual or about *feel*: rendering, animation, input responsiveness, balance,
fun. That's what playing it in a browser is for. Green here means "nothing is
obviously broken in the code" — then you open `index.html` and judge the rest.

## Workflow

Before committing a new build: drop in the updated `index.html`, run `node test/smoke.js`,
and if it's green, playtest in the browser and commit.
