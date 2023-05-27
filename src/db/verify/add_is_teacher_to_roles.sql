-- Verify teachhub:add_is_teacher_to_roles on pg

BEGIN;

  SELECT is_teacher
  FROM teachhub.roles
  WHERE false;

ROLLBACK;
