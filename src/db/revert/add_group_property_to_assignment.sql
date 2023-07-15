-- Revert teachhub:add_group_property_to_assignment from pg

BEGIN;

  ALTER TABLE teachhub.assignments
  DROP COLUMN is_group;

COMMIT;
