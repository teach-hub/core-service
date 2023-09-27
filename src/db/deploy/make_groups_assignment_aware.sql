-- Deploy teachhub:make_groups_assignment_aware to pg

BEGIN;

  ALTER TABLE teachhub.group_participants
  DROP COLUMN assignment_id;

  ALTER TABLE teachhub.groups
  ADD COLUMN assignment_id INTEGER REFERENCES teachhub.assignments(id) NOT NULL;

COMMIT;
