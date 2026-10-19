# 4. User Stories & Gherkin Acceptance Criteria — AmayaPlugins — Modular AI Agent Skill, MCP & Vertical Compliance Plugin Registry

```gherkin
Feature: Deterministic Assessment & Tenant-Isolated Persistence
  As a Director, Principal, or Operator using AmayaPlugins — Modular AI Agent Skill, MCP & Vertical Compliance Plugin Registry
  I want every calculation and workflow output to be deterministically validated and tenant-isolated
  So that our organisation remains 100% compliant with UK Product Security and Telecommunications Infrastructure Act 2022 (PSTI Supply-Chain Software Integrity)

  Scenario: Anonymous prospect runs the embeddable Snap Module diagnostic
    Given a visitor opens the "Agent Skill Manifest Security Auditor & Token-Footprint Estimator" widget
    When they submit valid domain parameters
    Then the Snap Module computes the deterministic outcome in <50ms without external network dependencies
    And returns explicit citations referencing "UK Product Security and Telecommunications Infrastructure Act 2022 (PSTI Supply-Chain Software Integrity)"
    And prompts the user to persist their pack into an authenticated workspace

  Scenario: Authenticated tenant executes a protected workflow mutation
    Given an authenticated tenant with a valid JWT validated via auth.getUser()
    When they POST to the vertical operational endpoint
    Then the runtime enforces per-tenant rate limiting and schema validation
    And writes the resulting record and audit event scoped strictly to the caller's tenant_id
    And Row-Level Security (RLS) blocks any cross-tenant read or mutation

  Scenario: Deep health probe fails closed on missing token or degraded dependency
    Given the "/api/health?deep=1" endpoint is invoked
    When the Authorization bearer token is missing or HEALTH_DEEP_TOKEN is unset
    Then the runtime responds with HTTP 503/401 using constant-time crypto.timingSafeEqual comparison
    And never leaks environment variable values in the response payload

  Scenario: Sovereign bot_verify gate validates repository integrity and Investability Pack A-J
    Given a developer or autonomous agent runs "node scripts/bot_verify.mjs"
    When all 5 Sovereign Pillars, Rule 20 (zero GitHub Actions workflows), and the 2026-10-19 Investability Pack (Sections A-J + Cross-Estate Proof) are inspected
    Then every assertion passes with exit code 0
```
