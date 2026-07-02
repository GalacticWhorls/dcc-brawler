# Dungeon Crawler Brawler

A web-native, single-file arcade beat-'em-up — an old-school side-scrolling brawler
in the spirit of the classic *TMNT* and *Simpsons* arcade cabinets, themed around the
*Dungeon Crawler Carl* setting. Built with plain HTML5 Canvas + vanilla JavaScript,
no build step and no dependencies.

**Play it:** open `index.html` in any modern browser, or play the live build at
**https://galacticwhorls.github.io/dcc-brawler/** once GitHub Pages is enabled (see below).

## Controls

- **Move:** WASD or Arrow keys (you can move along the floor's depth, not just left/right)
- **Attack:** J or Z
- **Special** (when the meter is full): K or X
- **Start / Restart:** Enter

## Current build — v0.10

The playable game is the **v0.1** Floor 1 vertical slice (gameplay unchanged since);
v0.2 and v0.3 added project infrastructure around it (see `CHANGELOG.md`).

A verified vertical slice of Floor 1:

- Core brawler feel: melee, a special-meter AoE, lives + respawn, invulnerability frames
- A three-encounter traversable floor with transit corridors between locked arenas
- Enemies: Goblin and Rat (melee), Bad Llama (ranged — lobs lava you have to dodge)
- **Goblin Dozer** elite: telegraphs, charges across the arena, slams the wall, and is
  stunned for a moment — armored from the front, so flank it or punish the stun window
- Breakables with item drops, an elite health bar, and an arcade / CRT presentation

See `CHANGELOG.md` for version history.

## Running locally

It's a static file, so you can just double-click `index.html`. If your browser is fussy
about fonts or local files, serve the folder instead:

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying (GitHub Pages)

1. Push this repo to GitHub.
2. Repo **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**.
4. Set **Branch** to `main` and the folder to `/ (root)`, then **Save**.
5. After a minute or two the live URL appears: `https://galacticwhorls.github.io/dcc-brawler/`

Because the game is `index.html` at the repo root, Pages serves it with no extra config.

## Status & notes

This is a personal / fan project and a work in progress — a learning-and-tinkering build,
not affiliated with or endorsed by the authors or publishers of *Dungeon Crawler Carl*.
Character and enemy names are used as flavor; all in-game text is original.
Art and audio are placeholder programmer-art for now.
