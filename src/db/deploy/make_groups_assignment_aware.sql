-- Deploy teachhub:make_groups_assignment_aware to pg

BEGIN;

  ALTER TABLE teachhub.group_participants
  DROP COLUMN assignment_id;

  ALTER TABLE teachhub.groups
  ADD COLUMN assignment_id INTEGER REFERENCES teachhub.assignments(id) NOT NULL,
  -- No pueden haber dos grupos con el mismo nombre.
  ADD CONSTRAINT group_name_unique UNIQUE (name, course_id);

COMMIT;
