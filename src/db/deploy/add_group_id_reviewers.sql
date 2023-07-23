-- Deploy teachhub:add_group_id_reviewers to pg

BEGIN;

ALTER TABLE teachhub.reviewers
DROP COLUMN reviewee_user_id,
ADD COLUMN reviewee_id INTEGER NOT NULL;

CREATE INDEX assignment_idx ON teachhub.reviewers(assignment_id);

COMMIT;
