-- Verify teachhub:add_reviewers_table on pg

BEGIN;

  SELECT id, reviewer_id, assignment_id
  FROM teachhub.reviewers
  WHERE false;

ROLLBACK;
