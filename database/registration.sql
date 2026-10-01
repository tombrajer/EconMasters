BEGIN;
CREATE TABLE IF NOT EXISTS registration_capacity (
  id integer PRIMARY KEY CHECK (id = 1),
  used integer NOT NULL DEFAULT 0 CHECK (used BETWEEN 0 AND 33)
);
INSERT INTO registration_capacity(id) VALUES (1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY,
  slot integer NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 33),
  team text NOT NULL CHECK (length(btrim(team)) BETWEEN 1 AND 250),
  school text NOT NULL CHECK (length(btrim(school)) BETWEEN 1 AND 250),
  members text[] NOT NULL CHECK (
    cardinality(members) = 3 AND array_ndims(members) = 1
    AND array_position(members, NULL) IS NULL
    AND length(btrim(members[1])) BETWEEN 1 AND 250
    AND length(btrim(members[2])) BETWEEN 1 AND 250
    AND length(btrim(members[3])) BETWEEN 1 AND 250
    AND lower(btrim(members[1])) <> lower(btrim(members[2]))
    AND lower(btrim(members[1])) <> lower(btrim(members[3]))
    AND lower(btrim(members[2])) <> lower(btrim(members[3]))
  ),
  captain text NOT NULL CHECK (length(btrim(captain)) BETWEEN 1 AND 250),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 250),
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS registrations_team_school ON registrations (lower(btrim(team)), lower(btrim(school)));

CREATE OR REPLACE FUNCTION register_team(entry jsonb, request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  occupied integer;
  saved registrations%ROWTYPE;
BEGIN
  -- Serializes capacity reservation, duplicate detection and retries across all instances.
  SELECT used INTO occupied FROM registration_capacity WHERE id = 1 FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Capacity configuration missing'; END IF;
  SELECT * INTO saved FROM registrations WHERE id = request_id;
  IF FOUND THEN
    IF saved.team <> entry->>'team' OR saved.school <> entry->>'school'
      OR saved.members <> ARRAY[entry->>'m1', entry->>'m2', entry->>'m3']
      OR saved.email <> entry->>'email' THEN
      RETURN jsonb_build_object('code', 'duplicate');
    END IF;
    RETURN jsonb_build_object('code', 'saved', 'id', saved.id);
  END IF;
  IF EXISTS (SELECT 1 FROM registrations WHERE lower(btrim(team)) = lower(btrim(entry->>'team')) AND lower(btrim(school)) = lower(btrim(entry->>'school'))) THEN
    RETURN jsonb_build_object('code', 'duplicate');
  END IF;
  IF occupied >= 33 THEN RETURN jsonb_build_object('code', 'full'); END IF;
  INSERT INTO registrations(id, slot, team, school, members, captain, email, details)
  VALUES (request_id, occupied + 1, entry->>'team', entry->>'school',
    ARRAY[entry->>'m1', entry->>'m2', entry->>'m3'], entry->>'captain', entry->>'email',
    entry - ARRAY['team','school','m1','m2','m3','captain','email']);
  UPDATE registration_capacity SET used = occupied + 1 WHERE id = 1;
  RETURN jsonb_build_object('code', 'saved', 'id', request_id);
END;
$$;
REVOKE ALL ON registrations, registration_capacity FROM PUBLIC;
REVOKE ALL ON FUNCTION register_team(jsonb, uuid) FROM PUBLIC;
COMMIT;
