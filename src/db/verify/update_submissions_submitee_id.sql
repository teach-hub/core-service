-- Verify teachhub:update_submissions_submitee_id on pg

BEGIN;

SELECT submitee_id
FROM submissions
WHERE false;

ROLLBACK;

