-- Verify teachhub:add_assignments_table on pg

BEGIN;

SELECT
  id, course_id, start_date, end_date, link, title
FROM teachhub.assignments
WHERE false;

ROLLBACK;
