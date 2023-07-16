-- Verify teachhub:add_group_id_reviewers on pg

BEGIN;

SELECT reviewee_group_id
FROM teachhub.reviewers
WHERE false;

ROLLBACK;
