-- Verify teachhub:create_subjects_table on pg

BEGIN;

SELECT
  id, name, code, active
FROM teachhub.subjects
WHERE false;

ROLLBACK;
