-- ===========================================================================
-- merge_user(from_user_id, into_user_id)  (S14)
--
-- Re-points every dependent row from an anonymous user onto a canonical user,
-- then deletes the orphaned `from` row — all inside a single transaction (a
-- plpgsql function body is atomic within its calling statement).
--
-- agent_runs and products are global/shared and intentionally NOT re-pointed
-- (agent_runs.user_id is on delete set null, so deleting `from` won't fail).
-- ===========================================================================

create or replace function merge_user(from_user_id uuid, into_user_id uuid)
returns json
language plpgsql
as $$
declare
  merged_sessions     int := 0;
  merged_events       int := 0;
  merged_memories     int := 0;
  merged_hurls        int := 0;
  merged_artifacts    int := 0;
  merged_entitlements int := 0;
begin
  if from_user_id = into_user_id then
    return json_build_object('ok', true, 'note', 'noop');
  end if;

  update sessions set user_id = into_user_id where user_id = from_user_id;
  get diagnostics merged_sessions = row_count;

  update events set user_id = into_user_id where user_id = from_user_id;
  get diagnostics merged_events = row_count;

  update memories set user_id = into_user_id where user_id = from_user_id;
  get diagnostics merged_memories = row_count;

  update hurls set user_id = into_user_id where user_id = from_user_id;
  get diagnostics merged_hurls = row_count;

  update artifacts set user_id = into_user_id where user_id = from_user_id;
  get diagnostics merged_artifacts = row_count;

  -- Entitlements are unique per (user_id, key): drop any from-rows that would
  -- collide with an existing into-row, then re-point the rest.
  delete from entitlements e
   where e.user_id = from_user_id
     and exists (
       select 1 from entitlements e2
        where e2.user_id = into_user_id
          and e2.key = e.key
     );
  update entitlements set user_id = into_user_id where user_id = from_user_id;
  get diagnostics merged_entitlements = row_count;

  delete from users where id = from_user_id;

  return json_build_object(
    'ok', true,
    'merged', json_build_object(
      'sessions',     merged_sessions,
      'events',       merged_events,
      'memories',     merged_memories,
      'hurls',        merged_hurls,
      'artifacts',    merged_artifacts,
      'entitlements', merged_entitlements
    )
  );
end;
$$;
