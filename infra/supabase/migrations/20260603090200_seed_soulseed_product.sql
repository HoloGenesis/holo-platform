-- ===========================================================================
-- Seed: the soulseed-compass product row (S14)
--
-- Idempotent. The authoritative manifest lives in @holo/product-manifests;
-- this row is metadata + a pointer. `products/manifest` (S4b) sources the real
-- typed manifest from code, not from this column.
-- ===========================================================================

insert into products (product_key, name, version, manifest)
values (
  'soulseed',
  'SoulSeed Compass',
  '1.0.0',
  jsonb_build_object(
    'productKey', 'soulseed',
    'version', '1.0.0',
    'source', '@holo/product-manifests',
    'chamberOrder', jsonb_build_array(
      'threshold',
      'identity-seed',
      'present-state',
      'memory-root',
      'trajectory-branch',
      'living-invitation'
    )
  )
)
on conflict (product_key) do update
  set name     = excluded.name,
      version  = excluded.version,
      manifest = excluded.manifest;
