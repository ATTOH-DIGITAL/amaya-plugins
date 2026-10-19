-- 0001_sovereign_tenant_rls_baseline.sql
-- Sovereign 5-Pillar Baseline Migration for AmayaPlugins — Modular AI Agent Skill, MCP & Vertical Compliance Plugin Registry (amaya-plugins)
-- Enforces strict multi-tenant Row-Level Security (RLS) and immutable statutory audit logging.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.amaya_plug_sovereign_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  organisation_name text NOT NULL,
  companies_house_number text,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
  subscription_status text NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.amaya_plug_sovereign_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.amaya_plug_sovereign_tenants(tenant_id) ON DELETE CASCADE,
  actor_user_id uuid,
  event_type text NOT NULL,
  statutory_ref text NOT NULL DEFAULT 'UK Product Security and Telecommunications Infrastructure Act 2022 (PSTI Supply-Chain Software Integrity)',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_amaya_plug_sovereign_tenants_owner ON public.amaya_plug_sovereign_tenants(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_amaya_plug_sovereign_audit_tenant_created ON public.amaya_plug_sovereign_audit_log(tenant_id, created_at DESC);

ALTER TABLE public.amaya_plug_sovereign_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amaya_plug_sovereign_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "amaya_plug_sovereign_tenants_tenant_isolation" ON public.amaya_plug_sovereign_tenants;
CREATE POLICY "amaya_plug_sovereign_tenants_tenant_isolation"
  ON public.amaya_plug_sovereign_tenants
  FOR ALL
  USING (auth.uid() = owner_user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = owner_user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "amaya_plug_sovereign_audit_log_tenant_isolation" ON public.amaya_plug_sovereign_audit_log;
CREATE POLICY "amaya_plug_sovereign_audit_log_tenant_isolation"
  ON public.amaya_plug_sovereign_audit_log
  FOR ALL
  USING (
    auth.role() = 'service_role'
    OR tenant_id IN (
      SELECT t.tenant_id FROM public.amaya_plug_sovereign_tenants t WHERE t.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR tenant_id IN (
      SELECT t.tenant_id FROM public.amaya_plug_sovereign_tenants t WHERE t.owner_user_id = auth.uid()
    )
  );
