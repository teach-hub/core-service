-- Verify teachhub:add_submissions_table on pg

BEGIN;

  SELECT
    id, user_id, assignment_id, created_at, updated_at, description
  FROM teachhub.submissions
  WHERE false;

ROLLBACK;
