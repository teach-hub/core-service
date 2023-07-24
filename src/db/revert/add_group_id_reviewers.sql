-- Revert teachhub:add_group_id_reviewers from pg

BEGIN;

ALTER TABLE teachhub.reviewers
DROP COLUMN reviewee_group_id,
ALTER COLUMN reviewee_user_id SET NOT NULL;

DROP INDEX teachhub.assignment_idx;

COMMIT;
