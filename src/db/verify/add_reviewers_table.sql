-- Verify teachhub:add_reviewers_table on pg

BEGIN;

  SELECT
    id, reviewer_user_id, assignment_id, reviewee_user_id
  FROM teachhub.reviewers
  WHERE false;

ROLLBACK;
