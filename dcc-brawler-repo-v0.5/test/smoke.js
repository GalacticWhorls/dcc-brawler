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
js += ";globalThis.__T={update,game,Enemy,Dozer,makeEnemy,keys,PRESS,DEPTH_TOL,W,MAX_ATTACKERS};";
try { eval(js); }
catch (e) { console.error("[FAIL] index.html script did not load:\n" + (e && e.stack || e)); process.exit(1); }
const { update, game, Enemy, Dozer, makeEnemy, keys, PRESS, DEPTH_TOL, W, MAX_ATTACKERS } = globalThis.__T;

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
// CHECK 2 — floor progression: Enc1 -> Enc2 -> Enc3 all complete
// =====================================================================
check("floor progression chains Enc1 -> Enc2 -> Enc3", () => {
  game.reset();
  const cleared = [false, false, false];
  let sawDozer = false;
  for (let i = 0; i < 10000; i++) {
    game.player.invuln = 999; game.player.lives = 9; game.player.hp = game.player.cfg.max_hp;
    resetKeys(); keys.d = true;                       // march right
    for (const e of game.enemies) {                   // instantly clear each wave
      if (!e.dead) { if (e instanceof Dozer) sawDozer = true; e.hurt(9999, e.x - (e.facing || 1) * 250, 0); }
    }
    update(dt); clearPress();
    assert(finitePositions(), "non-finite position at frame " + i);
    game.encounters.forEach((e, ix) => { if (e.cleared) cleared[ix] = true; });
    if (cleared[2]) break;
  }
  assert(cleared[0] && cleared[1] && cleared[2], "encounters cleared = " + JSON.stringify(cleared));
  assert(sawDozer, "Dozer never spawned in Enc3");
  return "Enc1/Enc2/Enc3 all cleared; Dozer spawned";
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
  for (const e of game.enemies) if (!e.dead) e.hurt(9999, e.x - (e.facing || 1) * 200, 0); // clear the field
  for (let i = 0; i < 60; i++) { game.player.invuln = 999; update(dt); }
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
