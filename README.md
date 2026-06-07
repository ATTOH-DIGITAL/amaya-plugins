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
