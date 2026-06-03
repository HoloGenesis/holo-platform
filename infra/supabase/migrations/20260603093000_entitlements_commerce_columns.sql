-- ===========================================================================
-- Entitlements: commerce columns (S27)
--
-- The S14 entitlements table was minimal (id, user_id, key, source, granted_at).
-- Payment + soft-revoke need two more columns (per docs/memory-model.md).
-- Idempotent.
-- ===========================================================================

alter table entitlements add column if not exists stripe_ref text;       -- Stripe charge/subscription id
alter table entitlements add column if not exists revoked_at timestamptz; -- soft-revoke; NULL = active
