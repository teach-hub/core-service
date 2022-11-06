-- Verify teachhub:create_course_table on pg

BEGIN;

SELECT
  id, name, github_organization, period, year, active, subject_id
FROM teachhub.courses
WHERE false;


ROLLBACK;
