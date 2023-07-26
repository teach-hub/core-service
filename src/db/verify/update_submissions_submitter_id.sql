-- Verify teachhub:update_submissions_submitter_id on pg

BEGIN;

SELECT submitter_id
FROM teachhub.submissions
WHERE false;

ROLLBACK;

