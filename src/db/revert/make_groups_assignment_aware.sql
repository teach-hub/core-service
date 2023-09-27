-- Revert teachhub:make_groups_assignment_aware from pg

BEGIN;

  ALTER TABLE teachhub.group_participants
  ADD COLUMN assignment_id INTEGER REFERENCES teachhub.assignments(id) NOT NULL;

  ALTER TABLE teachhub.groups
  DROP COLUMN assignment_id,
  DROP CONSTRAINT group_name_unique;

COMMIT;
