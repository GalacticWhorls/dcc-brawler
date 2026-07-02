/* =====================================================================
   DCC Brawler — headless smoke test
   ---------------------------------------------------------------------
   Runs the game's logic with NO browser: it stubs out the canvas and
   related browser APIs, loads the <script> from ../index.html, and drives
   the simulation through thousands of update() frames looking for code-
   level breakage that a human playtester shouldn't have to hunt for:

     - crashes / thrown exceptions
     - non-finite (NaN) positions
     - attack-token leaks (the enemy attack-slot accounting)
     - broken floor progression (Enc1 -> Enc2 -> Enc3 chaining)
     - the Goblin Dozer elite's state machine + front-armor + stun window
     - Bad Llama projectiles firing and being culled

   This does NOT (and can't) judge how the game looks or feels — that's
   what your browser playtest is for. Think of it as a spell-checker for
   the code: green here means "nothing is obviously broken," then you
   open index.html and judge the fun.

   Usage (from the repo root):
       node test/smoke.js
   Exit code 0 = all checks passed; 1 = something failed.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");

// ---- locate & read the game ----------------------------------------
const gamePath = path.join(__dirname, "..", "index.html");
if (!fs.existsSync(gamePath)) {
  console.error("Could not find index.html at repo root (looked at " + gamePath + ").");
  console.error("Run this from your repo with: node test/smoke.js");
  process.exit(1);
}
const html = fs.readFileSync(gamePath, "utf8");
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error("No <script> block found in index.html."); process.exit(1); }
let js = m[1];

// ---- minimal browser stubs -----------------------------------------
const noop = () => {};
const gradient = { addColorStop: noop };
const ctxStub = new Proxy({}, {
  get: (t, p) => {
    if (p === "createLinearGradient" || p === "createRadialGradient") return () => gradient;
    if (p === "measureText") return () => ({ width: 10 });
    return () => {};
  },
  set: () => true
});
global.document = {
  getElementById: () => ({ width: 960, height: 540, getContext: () => ctxStub }),
  fonts: { ready: Promise.resolve(), load: () => Promise.resolve() }
};
global.addEventListener = noop;
global.performance = { now: () => 0 };
global.requestAnimationFrame = noop;   // stop the real render loop from starting
global.setTimeout = () => 0;           // keep deferred state changes from leaking across checks

// ---- load the game, exposing internals to the harness --------------
js += ";globalThis.__T={update,game,Enemy,Dozer,RotSticker,Hoarder,PoisonCloud,JunkPile,liveAdds,ADD_CAP,makeEnemy,keys,PRESS,DEPTH_TOL,W,MAX_ATTACKERS};";
try { eval(js); }
catch (e) { console.error("[FAIL] index.html script did not load:\n" + (e && e.stack || e)); process.exit(1); }
const { update, game, Enemy, Dozer, RotSticker, Hoarder, PoisonCloud, JunkPile, liveAdds, ADD_CAP, makeEnemy, keys, PRESS, DEPTH_TOL, W, MAX_ATTACKERS } = globalThis.__T;

const dt = 1 / 60;
const results = [];
function check(name, fn) {
  try { const detail = fn(); results.push({ name, ok: true, detail }); }
  catch (e) { results.push({ name, ok: false, detail: (e && e.message) || String(e) }); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function resetKeys() { keys.a = keys.d = keys.w = keys.s = false; }
function clearPress() { for (const k in PRESS) delete PRESS[k]; }
function finitePositions() {
  if (!isFinite(game.player.x) || !isFinite(game.player.y)) return false;
  for (const e of game.enemies) if (!isFinite(e.x) || !isFinite(e.y)) return false;
  return true;
}

// =====================================================================
// CHECK 1 — script loaded (implicitly true if we got here)
// =====================================================================
results.push({ name: "index.html script parses & loads", ok: true, detail: "ok" });

// =====================================================================
// CHECK 2 — floor progression: all encounters complete in order
// =====================================================================
check("floor progression chains all encounters to the end", () => {
  game.reset();
  const n = game.encounters.length;
  const cleared = new Array(n).fill(false);
  let sawDozer = false;
  for (let i = 0; i < 20000; i++) {
    game.player.invuln = 999; game.player.lives = 9; game.player.hp = game.player.cfg.max_hp;
    resetKeys(); keys.d = true;                       // march right
    for (const e of game.enemies) {                   // instantly clear each wave
      if (!e.dead) { if (e instanceof Dozer) sawDozer = true; e.hurt(9999, e.x - (e.facing || 1) * 250, 0); }
    }
    update(dt); clearPress();
    assert(finitePositions(), "non-finite position at frame " + i);
    game.encounters.forEach((e, ix) => { if (e.cleared) cleared[ix] = true; });
    if (cleared[n - 1]) break;
  }
  assert(cleared.every(Boolean), "encounters cleared = " + JSON.stringify(cleared));
  assert(sawDozer, "Dozer never spawned");
  return n + " encounters all cleared in order; Dozer spawned + wrecked";
});

// =====================================================================
// CHECK 3 — attack-token discipline (no leaks)
// =====================================================================
check("enemy attack tokens never exceed MAX_ATTACKERS, drain to 0", () => {
  game.reset();
  let tokMax = 0;
  for (let i = 0; i < 6000; i++) {
    game.player.invuln = 999; game.player.lives = 9; game.player.hp = game.player.cfg.max_hp;
    resetKeys();
    const alive = game.enemies.filter(e => !e.dead);
    if (alive.length) {
      let t = alive[0], best = 1e9;
      for (const e of alive) { const d = Math.abs(e.x - game.player.x) + Math.abs(e.y - game.player.y); if (d < best) { best = d; t = e; } }
      if (t.x > game.player.x + 40) keys.d = true; else if (t.x < game.player.x - 40) keys.a = true; // stay engaged
      if (i % 40 === 0) PRESS.j = true;
    } else keys.d = true;
    update(dt); clearPress();
    assert(finitePositions(), "non-finite position at frame " + i);
    tokMax = Math.max(tokMax, game.attackTokens);
    assert(game.attackTokens <= MAX_ATTACKERS, "token count " + game.attackTokens + " > MAX_ATTACKERS at frame " + i);
  }
  // drain: clear the whole field; every token-holder releases on hurt/death.
  // Check immediately, before any encounter can spawn a fresh (legitimate) attacker.
  for (const e of game.enemies) if (!e.dead) e.hurt(9999, e.x - (e.facing || 1) * 200, 0);
  assert(game.attackTokens === 0, "tokens did not drain to 0 (stuck at " + game.attackTokens + ")");
  return "peak tokens " + tokMax + " / " + MAX_ATTACKERS + ", drained to 0";
});

// =====================================================================
// CHECK 4 — Bad Llama fires projectiles, and they get culled
// =====================================================================
check("Bad Llama projectiles fire and are culled", () => {
  game.reset();
  const enc = game.encounters[1];
  game.encIndex = 1; game.camMin = enc.arenaCam; game.camMax = enc.arenaCam; game.camX = enc.arenaCam;
  game.player.x = enc.arenaCam + 300; game.player.y = 415;
  const llama = makeEnemy("bad_llama", enc.arenaCam + 660, 415); llama.entering = false;
  game.enemies = [llama];
  let sawProj = false;
  for (let i = 0; i < 500; i++) {
    game.player.invuln = 999; game.player.hp = 120; resetKeys();
    update(dt);
    if (game.projectiles.length > 0) sawProj = true;
  }
  assert(sawProj, "no lava projectiles were ever fired");
  game.enemies = [];                                  // remove the shooter
  for (let i = 0; i < 200; i++) update(dt);            // let in-flight bolts expire
  assert(game.projectiles.length === 0, "projectiles not culled (" + game.projectiles.length + " left)");
  return "projectiles fired and cleaned up";
});

// =====================================================================
// CHECK 5 — Goblin Dozer: modes cycle, front armor, stun window, death
// =====================================================================
check("Goblin Dozer mechanic (modes, front-armor, stun window, death)", () => {
  game.reset();
  const enc = game.encounters[2];
  game.encIndex = 2; game.camMin = enc.arenaCam; game.camMax = enc.arenaCam; game.camX = enc.arenaCam;
  game.player.x = enc.arenaCam + 400; game.player.y = 415;
  const dz = new Dozer("goblin_dozer", enc.arenaCam + W - 90, 415); dz.entering = true;
  game.enemies = [dz];
  const modes = new Set();
  let frontTry = 0, frontBlocked = 0, stunHits = 0, stunDamaged = 0;
  for (let i = 0; i < 3000 && !dz.dead; i++) {
    game.player.invuln = 999; game.player.hp = 120;
    modes.add(dz.mode);
    if (i % 25 === 0 && dz.mode !== "stunned") { frontTry++; const h = dz.hp; dz.hurt(20, dz.x + dz.facing * 120, 0); if (dz.hp === h) frontBlocked++; }
    if (dz.mode === "stunned") { stunHits++; const h = dz.hp; dz.hurt(20, dz.x - dz.facing * 120, 0); if (dz.hp < h) stunDamaged++; }
    update(dt);
  }
  for (const need of ["reposition", "telegraph", "charge", "stunned"]) assert(modes.has(need), "Dozer never entered '" + need + "' mode");
  assert(frontTry > 0 && frontBlocked === frontTry, "front armor failed (" + frontBlocked + "/" + frontTry + " blocked)");
  assert(stunDamaged > 0, "stun window dealt no damage");
  assert(dz.dead, "Dozer never died");
  const crew = game.enemies.filter(e => !e.dead && e.cfg.id === "goblin").length;
  assert(crew >= 3, "crew not ejected on wreck (found " + crew + ")");
  return "modes cycle; front blocked " + frontBlocked + "/" + frontTry + "; stun damaged " + stunDamaged + "x; wrecked + ejected " + crew + " crew";
});

// =====================================================================
// CHECK 6 — Rot Sticker: countdown -> leap -> explode on contact / land stunned
// =====================================================================
check("Rot Sticker leaps (explodes on contact) and whiffs to a stun", () => {
  // (a) contact: player parked right where the leap lands -> sticker explodes & dies
  game.reset();
  const enc = game.encounters[3];
  game.encIndex = 3; game.camMin = enc.arenaCam; game.camMax = enc.arenaCam; game.camX = enc.arenaCam;
  game.player.x = enc.arenaCam + 300; game.player.y = 415; game.player.invuln = 0; game.player.hp = 120;
  let s = new RotSticker("rot_sticker", game.player.x + 150, 415); s.entering = false;
  game.enemies = [s];
  const modes = new Set(); let exploded = false, hpBefore = game.player.hp;
  for (let i = 0; i < 600 && !s.dead; i++) {
    game.player.hp = 120;                       // soak the blast but observe the hit
    modes.add(s.mode); update(dt);
    assert(isFinite(s.x) && isFinite(s.y), "sticker NaN at frame " + i);
  }
  exploded = s.dead;
  assert(modes.has("wind"), "sticker never wound up its leap");
  assert(modes.has("leap"), "sticker never leapt");
  assert(exploded, "sticker never resolved its leap into an explosion on a hit");

  // (b) whiff: target yanked away mid-wind -> sticker lands and is stunned
  game.reset();
  game.encIndex = 3; game.camMin = enc.arenaCam; game.camMax = enc.arenaCam; game.camX = enc.arenaCam;
  game.player.x = enc.arenaCam + 300; game.player.y = 415; game.player.invuln = 999;
  let s2 = new RotSticker("rot_sticker", game.player.x + 140, 415); s2.entering = false;
  game.enemies = [s2];
  let landed = false;
  for (let i = 0; i < 600 && !s2.dead; i++) {
    game.player.hp = 120;
    // once it commits to the leap, teleport the player away so the pounce misses
    if (s2.mode === "leap") { game.player.x = enc.arenaCam + 700; game.player.y = 470; }
    update(dt);
    if (s2.mode === "land") { landed = true; break; }
  }
  assert(landed, "a whiffed leap did not leave the sticker stunned on the ground");
  return "leap explodes on contact; whiff -> ground stun";
});

// =====================================================================
// CHECK 7 — The Hoarder: swarm under cap, poison gas, victory clears the lair
// =====================================================================
check("The Hoarder floods (capped), poisons, and clears the lair on death", () => {
  game.reset();
  const enc = game.encounters[game.encounters.length - 1];
  game.encIndex = game.encounters.length - 1;
  game.camMin = enc.arenaCam; game.camMax = enc.arenaCam; game.camX = enc.arenaCam;
  game.player.x = enc.arenaCam + 450; game.player.y = 415;
  enc.trigger();                                   // queues + then spawns the Hoarder
  let maxAdds = 0, sawCloud = false, gotPoisoned = false, spawnedAny = false;
  for (let i = 0; i < 900; i++) {
    game.player.invuln = 999; game.player.hp = game.player.cfg.max_hp;
    update(dt);
    const adds = liveAdds();
    maxAdds = Math.max(maxAdds, adds);
    if (adds > 0) spawnedAny = true;
    assert(adds <= ADD_CAP, "swarm exceeded ADD_CAP (" + adds + ") at frame " + i);
    if (game.clouds.length > 0) { sawCloud = true; const c = game.clouds[0]; game.player.x = c.x; game.player.y = c.y; }
    if (game.player.poison > 0) gotPoisoned = true;
    assert(isFinite(game.player.x) && isFinite(game.player.hp), "NaN at frame " + i);
  }
  const hz = game.enemies.find(e => e instanceof Hoarder);
  assert(hz && !hz.dead, "Hoarder not present mid-fight");
  assert(spawnedAny, "Hoarder never spawned any adds");
  assert(sawCloud, "Hoarder never released a poison cloud");
  assert(gotPoisoned, "standing in the gas did not poison the player");
  hz.hurt(99999, hz.x - 100, 0);                   // finish her
  assert(hz.dead, "Hoarder did not die");
  assert(game.hoarder === null, "hoarder ref not cleared on death");
  assert(liveAdds() === 0, "swarm not cleared on victory (" + liveAdds() + " left)");
  return "swarm peaked " + maxAdds + "/" + ADD_CAP + "; gas poisons; death clears the lair";
});

// =====================================================================
// CHECK 8 — Boss-chamber door seals behind the player
// =====================================================================
check("Boss-chamber door seals and blocks retreat", () => {
  game.reset();
  const d = game.door;
  assert(d && d.state === "open", "door missing or not open at start");
  game.camMin = 0; game.camMax = d.x + 400; game.camX = d.x - 200;
  game.player.x = d.x - 60;
  for (let i = 0; i < 200 && d.state !== "closed"; i++) {
    game.player.invuln = 999; keys.a = keys.w = keys.s = false; keys.d = true;
    update(dt);
  }
  assert(d.state === "closed", "door never sealed (state=" + d.state + ")");
  keys.d = false; keys.a = true;                   // try to walk back out
  for (let i = 0; i < 120; i++) { game.player.invuln = 999; update(dt); }
  keys.a = false;
  assert(game.player.x >= d.x, "player slipped back through the sealed door");
  return "door seals on entry and blocks retreat";
});

// =====================================================================
// REPORT
// =====================================================================
console.log("\nDCC Brawler - headless smoke test\n");
let failed = 0;
for (const r of results) {
  console.log("  [" + (r.ok ? "PASS" : "FAIL") + "] " + r.name + (r.detail ? "  (" + r.detail + ")" : ""));
  if (!r.ok) failed++;
}
console.log("");
if (failed === 0) { console.log("ALL CHECKS PASSED\n"); process.exit(0); }
else { console.log(failed + " CHECK(S) FAILED\n"); process.exit(1); }
