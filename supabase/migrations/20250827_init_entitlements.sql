-- supabase/migrations/20250827_init_entitlements.sql

create table if not exists deployments (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null,
  repo text not null,
  site_url text not null,
  status text not null default 'active' check (status in ('active','expired','deleted')),
  tier text not null default 'free' check (tier in ('free','supporter','business')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_extended_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create index if not exists deployments_fingerprint_idx on deployments(fingerprint);
create index if not exists deployments_expires_idx on deployments(expires_at);

create table if not exists usage (
  fingerprint text primary key,
  cv_exports int not null default 0,
  cl_exports int not null default 0,
  deployments int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists entitlements (
  fingerprint text primary key,
  supporter_until timestamptz,
  business_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id bigserial primary key,
  provider text not null,                         -- 'stripe' | 'bmc'
  external_id text not null,                      -- stripe session/payment id or bmc txn id
  fingerprint text not null,
  plan text not null,                             -- 'supporter-3m' | 'supporter-6m' | 'business-3m' | 'business-6m'
  months int not null,
  amount_cents int not null,
  currency text not null default 'GBP',
  created_at timestamptz not null default now()
);

-- (Optional) simple view for API usage responses
create or replace view v_profile as
select
  e.fingerprint,
  coalesce(e.supporter_until, to_timestamp(0)) as supporter_until,
  coalesce(e.business_until, to_timestamp(0)) as business_until,
  coalesce(u.cv_exports, 0) as cv_exports,
  coalesce(u.cl_exports, 0) as cl_exports,
  coalesce(u.deployments, 0) as deployments
from entitlements e
left join usage u using (fingerprint);
