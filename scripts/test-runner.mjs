// Zero-dependency smoke checks for the Sovereign 5-Pillar layout (node:test).
// Run: node scripts/test-runner.mjs   (or: npm test)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const FILES = walk(ROOT);
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

// node --check on the real file, so .js is judged in its actual module context.
function syntaxOk(file) {
  return spawnSync(process.execPath, ['--check', file]).status === 0;
}

const manifest = fs.existsSync(path.join(ROOT, 'snap_modules/manifest.json'))
  ? readJson('snap_modules/manifest.json')
  : null;

test('pillar 3: snap_modules/manifest.json parses and names the repo', () => {
  assert.ok(manifest, 'snap_modules/manifest.json is missing');
  assert.ok(manifest.repository || manifest.name || manifest.title, 'manifest has no repository/name/title');
});

test('pillar 3: modules listed as on disk exist', (t) => {
  const listed = (manifest && manifest.modules_on_disk) || [];
  if (!listed.length) return t.skip('manifest lists no modules on disk');
  for (const m of listed) {
    const name = typeof m === 'string' ? m : m.file || m.path || m.name || m.id;
    if (!name) continue;
    const hit = FILES.some((f) => [name, 'snap_modules/' + name, 'runtime/' + name].includes(rel(f)));
    assert.ok(hit, `manifest lists ${name} but no such file is in the repo`);
  }
});

test('pillar 3: snap module ids (when listed) are unique', (t) => {
  const mods = manifest && Array.isArray(manifest.snap_modules) ? manifest.snap_modules : [];
  if (!mods.length) return t.skip('manifest has no snap_modules id list');
  const ids = mods.map((m) => (typeof m === 'string' ? m : m.id)).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, 'duplicate snap module ids');
  assert.ok(ids.length > 0, 'snap_modules lists no ids');
});

test('pillar 3: primary_module (when present on disk) is syntactically valid', (t) => {
  const name = manifest && manifest.free_tool && manifest.free_tool.primary_module;
  if (!name) return t.skip('manifest names no primary_module');
  const hits = FILES.filter((f) => path.basename(f) === name);
  if (!hits.length) return t.skip(`${name} is declared in the manifest but not on disk`);
  for (const f of hits) {
    if (/\.json$/.test(f)) JSON.parse(fs.readFileSync(f, 'utf8'));
    else assert.ok(syntaxOk(f), `${rel(f)} fails node --check`);
  }
});

test('callable entry files (snap modules, functions, workers) pass node --check', (t) => {
  const entry = FILES.map(rel).filter((f) =>
    /\.(m?js|cjs)$/.test(f) &&
    (/^snap_modules\/[^/]+$/.test(f) ||
      /^functions\/(?!.*\/_)(?!_)/.test(f) ||
      /^netlify\/functions\/[^/]+$/.test(f) ||
      /^(worker\.js|src\/worker\.js|worker\/index\.js)$/.test(f)));
  if (!entry.length) return t.skip('no callable entry files in the tree');
  for (const f of entry) assert.ok(syntaxOk(path.join(ROOT, f)), `${f} fails node --check`);
});

test('pillar 2: runtime/ exists and its manifests parse', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'runtime')), 'runtime/ is missing');
  for (const f of ['runtime/manifest.json', 'runtime/SNAP_MANIFEST.json']) {
    if (fs.existsSync(path.join(ROOT, f))) readJson(f);
  }
});

test('pillar 1: docs/ holds at least five .md/.html files', () => {
  const docs = FILES.map(rel).filter((f) => /^docs\/.+\.(md|html)$/.test(f));
  assert.ok(docs.length >= 5, `docs/ has ${docs.length} .md/.html files, need 5`);
});

test('pillar 4: supabase_migrations contain ENABLE ROW LEVEL SECURITY', () => {
  const sql = FILES.map(rel).filter((f) => /^supabase_migrations\/.+\.sql$/.test(f));
  assert.ok(sql.length > 0, 'no supabase_migrations/*.sql files');
  const all = sql.map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  assert.match(all, /ENABLE\s+ROW\s+LEVEL\s+SECURITY/i);
});
