-- Deploy teachhub:add_group_id_reviewers to pg

BEGIN;

ALTER TABLE teachhub.reviewers
DROP COLUMN reviewee_user_id,
ADD COLUMN reviewee_id INTEGER NOT NULL,

-- No podemos tener un reviewee con dos reviewers.
ADD CONSTRAINT unique_assigment_reviewee UNIQUE (assignment_id, reviewee_id);

CREATE INDEX assignment_idx ON teachhub.reviewers(assignment_id);

COMMIT;
