-- Verify teachhub:create_review_table on pg

BEGIN;

SELECT
    id, submission_id, reviewer_id, created_at, updated_at, grade, revision_requested
  FROM teachhub.reviews
  WHERE false;

ROLLBACK;
