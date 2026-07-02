# Backlog / Notes

Deferred ideas and noted-but-not-yet-actioned tuning. Nothing here is committed work
— it's a parking lot so good observations don't get lost between sessions.

## Item drop balance (noted v0.4)

Playtest read: breakables drop **too many strong items** (one run yielded ~4 heals,
1 extra life, 2 special refills). Floor 1 should feel a bit more scarce, with most
breakables giving points rather than power-ups.

Status: **deferred** — flagged as a maybe, not a definite. Left unchanged for now.

Proposed one-shot change when we decide to do it (edit `BREAKABLES` drop tables in
`index.html`): bias the weighted drops toward "nothing / points," e.g.

- `supply_crate`: add a `{item:null, w:3-4}` weight so crates often give just points,
  and trim the heal/buff weights
- `vending`: increase the existing `{item:null}` weight relative to `special50` / `life`
- consider making `life` rare floor-wide (single low weight in one container type)

Easy to A/B by playtesting; revisit whenever item economy feels off.

## Future content (from the design doc, not yet built)

- Remaining Floor 1 elites: the Hoarder, the Juicer
- Floor 1 boss: Ball of Swine (multi-phase — a deliberate, separate build)
- Other playable characters: Donut, Florin, Elle (data-driven via `CHARACTERS`)
- Real art and audio passes (currently programmer-art shapes)
