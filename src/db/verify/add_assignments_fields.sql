-- Verify teachhub:add_assignments_fields on pg

BEGIN;

SELECT
  id, allow_late_submissions, description, active
FROM teachhub.assignments
WHERE false;


ROLLBACK;
