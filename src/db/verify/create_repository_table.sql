-- Verify teachhub:create_repository_table on pg

BEGIN;

SELECT
  id, course_id, user_id, name, github_id, active
FROM teachhub.repositories
WHERE false;

ROLLBACK;
