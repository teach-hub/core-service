-- Revert teachhub:add_is_teacher_to_roles from pg

BEGIN;

  ALTER TABLE teachhub.roles
  DROP COLUMN is_teacher;

COMMIT;
