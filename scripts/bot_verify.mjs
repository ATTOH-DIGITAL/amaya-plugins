#!/usr/bin/env node
/**
 * scripts/bot_verify.mjs — Unified Estate 5-Pillar, Rule 20 & 2026-10-19 Investability Verification Harness
 * Repository: amaya-plugins
 *
 * Enforces:
 *   1. Pillar 1 (docs/): 1_ICP_PROFILES.md .. 5_INVESTOR_DOSSIER.md present & non-empty
 *   2. Pillar 2 (runtime/): runtime directory present
 *   3. Pillar 3 (snap_modules/): snap_modules directory & manifest.json present
 *   4. Pillar 4 (supabase_migrations/): SQL migrations present with ENABLE ROW LEVEL SECURITY
 *   5. Pillar 5 (scripts/bot_verify.mjs): self-verifying entrypoint wired
 *   6. Rule 20 Guard: zero .yml/.yaml files in .github/workflows/ (GitHub Actions decommissioned)
 *   7. 2026-10-19 Investability Pack (Sections A–J) & Cross-Estate Proof in docs/5_INVESTOR_DOSSIER.md
 *   8. Runtime Verification Suite: executes runtime/scripts/verify.mjs if present
 */

import { existsSync, realpathSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let passed = 0;
let failed = 0;

// The date is fixed on purpose (PILLARS-STANDARD.md): every repo flips from WARN to FAIL on the same day, so there is no per-environment override.
const WARN_UNTIL = '2026-11-04';
const enforcing = new Date().toISOString().slice(0, 10) >= WARN_UNTIL;
function warn(label, detail = '') {
  if (enforcing) { failed += 1; console.error(`  [FAIL] ${label} — ${detail}`); }
  else console.log(`  [WARN] ${label} — ${detail} (becomes a hard fail on ${WARN_UNTIL})`);
}
function check(label, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  [PASS] ${label}`);
  } else {
    failed += 1;
    console.error(`  [FAIL] ${label}${detail ? ' — ' + detail : ''}`);
  }
}

console.log(`=== Sovereign 5-Pillar, Rule 20 & Investability Verification (${ROOT}) ===`);

// Pillar 1: docs/
const requiredDocs = [
  '1_ICP_PROFILES.md',
  '2_COMPETITOR_LANDSCAPE.md',
  '3_PRODUCT_STRATEGY_MOAT.md',
  '4_USER_STORIES_GHERKIN.md',
  '5_INVESTOR_DOSSIER.md',
];
for (const doc of requiredDocs) {
  const p = join(ROOT, 'docs', doc);
  const ok = existsSync(p) && statSync(p).isFile() && statSync(p).size > 100;
  check(`Pillar 1 (docs/${doc})`, ok, 'missing or empty');
}

// 2026-10-19 Investability Pack (A–J) & Cross-Estate 5-Point Proof check
const dossierPath = join(ROOT, 'docs', '5_INVESTOR_DOSSIER.md');
if (existsSync(dossierPath)) {
  const dossier = readFileSync(dossierPath, 'utf8');
  const requiredHeadings = [
    '## A. Product Identity',
    '## B. Capability Truth',
    '## C. Operating-System Inheritance',
    "## D. Ballon d'Or Top-Five Benchmark",
    '## E. Market Maturity Classification',
    '## F. Capital Evidence',
    '## G. Lead / Lag Score',
    '## H. Gap-to-Money',
    '## I. Investability Score (0–100)',
    '## J. Capital Case',
  ];
  const allHeadingsPresent = requiredHeadings.every((h) => dossier.includes(h));
  check('Investability Pack (Sections A–J in docs/5_INVESTOR_DOSSIER.md)', allHeadingsPresent, 'missing A–J sections');

  const requiredReasoningLines = [
    'This product is stronger because it can also use:',
    'This product should not rebuild:',
    'This product can sell through:',
    'The current public presentation misses:',
    'The highest-value next action is:',
  ];
  const allReasoningPresent = requiredReasoningLines.every((l) => dossier.includes(l));
  check('Cross-Estate 5-Point Reasoning Proof (docs/5_INVESTOR_DOSSIER.md)', allReasoningPresent, 'missing mandatory reasoning lines');
}

// Pillar 2: runtime/
const runtimeDir = join(ROOT, 'runtime');
check('Pillar 2 (runtime/ directory)', existsSync(runtimeDir) && statSync(runtimeDir).isDirectory());

// Pillar 3: snap_modules/
const snapDir = join(ROOT, 'snap_modules');
const snapManifest = join(snapDir, 'manifest.json');
check('Pillar 3 (snap_modules/ directory & manifest.json)', existsSync(snapDir) && existsSync(snapManifest));

// Pillar 4: supabase_migrations/
const migDir = join(ROOT, 'supabase_migrations');
const migFiles = existsSync(migDir) ? readdirSync(migDir).filter((f) => f.endsWith('.sql')) : [];
const hasRls = migFiles.some((f) => /ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(readFileSync(join(migDir, f), 'utf8')));
check('Pillar 4 (supabase_migrations/ with RLS)', migFiles.length > 0 && hasRls, `found ${migFiles.length} sql files`);

// Pillar 5: scripts/bot_verify.mjs
check('Pillar 5 (scripts/bot_verify.mjs)', existsSync(join(ROOT, 'scripts', 'bot_verify.mjs')));

// Rule 20: Zero .yml/.yaml files in .github/workflows/
const wfDir = join(ROOT, '.github', 'workflows');
const wfYmls = existsSync(wfDir)
  ? readdirSync(wfDir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
  : [];
check('Rule 20 (zero .yml/.yaml in .github/workflows/)', wfYmls.length === 0, `found: ${wfYmls.join(', ')}`);

// Execute runtime/scripts/verify.mjs if present
const runtimeVerify = join(ROOT, 'runtime', 'scripts', 'verify.mjs');
if (existsSync(runtimeVerify)) {
  console.log('  [INFO] Running runtime/scripts/verify.mjs ...');
  const res = spawnSync(process.execPath, [runtimeVerify], {
    cwd: join(ROOT, 'runtime'),
    stdio: 'inherit',
  });
  check('Runtime verify suite (runtime/scripts/verify.mjs)', res.status === 0, `exit code ${res.status}`);
}

// Run n8n table-ref and schema-coverage suites if present
for (const s of ['scripts/verify-n8n-table-refs.mjs', 'scripts/verify-schema-coverage.mjs']) {
  const sp = join(ROOT, s);
  if (existsSync(sp)) {
    const res = spawnSync(process.execPath, [sp], { cwd: ROOT, stdio: 'inherit' });
    check(`${s} exits 0`, res.status === 0);
  }
}

// scripts/test-runner.mjs is run once, by P6 below (WARN until WARN_UNTIL, then hard fail).

// P6-P10 (PILLARS-STANDARD.md): WARN until WARN_UNTIL, then hard fail. Offline file checks only; the P9 probe and P10 register need scripts/pillar_scan.mjs.
{
  const readme = existsSync(join(ROOT, 'README.md')) ? readFileSync(join(ROOT, 'README.md'), 'utf8') : '';
  let rt = {};
  try { rt = JSON.parse(readFileSync(join(ROOT, 'runtime', 'manifest.json'), 'utf8')); } catch { /* absent or invalid */ }
  const CODE_RE = /\.(mjs|cjs|js|jsx|ts|tsx|py|sh|go|rs|rb|php|java)$/i;
  const hasCode = (d) => readdirSync(d, { withFileTypes: true }).some((e) => !e.isSymbolicLink() && (e.isDirectory() ? !['node_modules', '.git'].includes(e.name) && hasCode(join(d, e.name)) : CODE_RE.test(e.name)));
  const runner = join(ROOT, 'scripts', 'test-runner.mjs');
  if (!existsSync(runner)) warn('P6 scripts/test-runner.mjs missing', 'add a runner that exits 0');
  else {
    const tr = spawnSync(process.execPath, [runner], { cwd: ROOT, stdio: 'inherit', timeout: 120000 });
    if (tr.status === 0) check('P6 scripts/test-runner.mjs exits 0', true);
    else warn('P6 scripts/test-runner.mjs did not exit 0', `exit ${tr.status}`);
  }
  const sec = readme.match(/^#{1,3}\s*(?:Office agent|Agent contract)[^\n]*\n([\s\S]*?)(?=^#{1,3}\s|$(?![\s\S]))/im);
  if (!sec) warn('P7 README office-agent section missing', 'name the owner agent and the entry path');
  else {
    const owner = /Owner agent:\s*\S+/i.test(sec[1]);
    const entry = (sec[1].match(/[\w./-]+\.[a-z]{1,4}\b/gi) || []).some((f) => !/\.(md|json|txt|ya?ml|lock)$/i.test(f) && (() => { try { const p = realpathSync(resolve(ROOT, f)); const r = realpathSync(ROOT); return p.startsWith(r + sep) && statSync(p).isFile(); } catch { return false; } })());
    if (owner && entry) check('P7 README office-agent section names an owner agent and an existing entry file', true);
    else warn('P7 office-agent section needs an "Owner agent:" line (UNASSIGNED is allowed) and an existing entry file', `owner ${owner ? 'ok' : 'missing'}, entry ${entry ? 'ok' : 'missing'}`);
  }
  const cp = typeof rt.code_path === 'string' ? rt.code_path.trim() : '';
  const rk = typeof rk === 'string' ? rk.trim() : '';
  if (!cp) warn('P8 runtime/manifest.json has no code_path', 'point it at code that exists');
  else if (/^[\w.-]+\/[\w.-]+:/.test(cp)) warn('P8 code_path points at another repo', 'not verified offline');
  else {
    let abs = resolve(ROOT, cp);
    try { abs = realpathSync(abs); } catch { /* absent: existsSync below fails */ }
    const rootReal = realpathSync(ROOT);
    const inside = abs === rootReal || abs.startsWith(rootReal + sep);
    const ok = inside && existsSync(abs) && (statSync(abs).isDirectory() ? hasCode(abs) : CODE_RE.test(cp));
    if (ok) check(`P8 code_path ${cp} exists and holds code`, true);
    else warn(`P8 code_path ${cp} is not code that exists`, 'fix the pointer');
  }
  if (!/^https?:\/\//.test(rt.health_url || '')) warn('P9 no http(s) health URL in runtime/manifest.json', 'name one that returns 2xx/3xx to a plain GET');
  else console.log('  [INFO] P9 health URL named; the live GET is made by scripts/pillar_scan.mjs, not offline');
  if (!rk) warn('P10 runtime/manifest.json has no register_key', 'set it to the products.product_key (or source_repo) row; scripts/pillar_scan.mjs with CODE_SUPA verifies the row exists');
  else console.log(`  [INFO] P10 register_key ${rk} named; scripts/pillar_scan.mjs with CODE_SUPA verifies the row exists`);
  const draftDocs = (existsSync(join(ROOT, 'docs')) ? readdirSync(join(ROOT, 'docs')) : []).filter((f) => f.endsWith('.md') && /^> DRAFT — /m.test(readFileSync(join(ROOT, 'docs', f), 'utf8')));
  if (draftDocs.length) warn(`Docs are still DRAFT stubs (${draftDocs.length} of them)`, 'replace with evidenced content');
}

console.log(`\n=== Summary: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
