# AMAYA Plugins

A Claude Code plugin marketplace from **AMAYA Holdings** — practical UK business-formation and SME-operations skills for founders and builders.

## Add the marketplace

```
/plugin marketplace add ATTOH-DIGITAL/amaya-plugins
```

Then browse and install:

```
/plugin install amaya@amaya
```

## Plugins

| Plugin | Description |
|--------|-------------|
| **amaya** | UK company formation guidance — choose the right structure, incorporate correctly, and stay compliant after day one. |

## Principles

- **Genuinely useful, public-safe.** Every skill is accurate general guidance — no internal strategy, no credentials, no telemetry, no network calls. Just Markdown.
- **Information, not advice.** Verify current fees, thresholds, and deadlines on GOV.UK; check your own situation with a qualified professional.

## Develop / test locally

```
claude --plugin-dir ./plugins/amaya
claude plugin validate
```

---
Maintained by [AMAYA Holdings](https://amayaholdings.co.uk).

## Office agents

<!-- office-agents-section: generated 2026-10-28 from register reads (builder_blocks, product_parts) where a row exists, and this repo's git tree; ledger task d5583ba1-530c-4a55-b38f-fd19563cb83a -->

**Owner agent:** UNASSIGNED (no register row, checked 2026-10-28)

**How to call** (entries below are files that exist in this repo; no hosted URL is claimed here):

- Verify entry: `node scripts/bot_verify.mjs` (pillar check) and `npm test` (smoke checks) via `scripts/test-runner.mjs`
- Note: `plugin_manifest_auditor.mjs` is declared as the manifest's primary_module but is not on disk in this repo.
- Note: no callable module, function, worker or workflow exists in this repo tree yet; only the verify entry above is callable.

Example call:

```bash
node scripts/bot_verify.mjs
```
