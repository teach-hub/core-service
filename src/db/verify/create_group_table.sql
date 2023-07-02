-- Verify teachhub:create_group_table on pg

BEGIN;

SELECT
  id, course_id, name, active
FROM teachhub.groups
WHERE false;

ROLLBACK;
