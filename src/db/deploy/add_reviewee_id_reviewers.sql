-- Deploy teachhub:add_reviewee_id_reviewers to pg

BEGIN;

ALTER TABLE teachhub.reviewers
DROP COLUMN reviewee_user_id,
DROP COLUMN reviewee_group_id,
ADD COLUMN reviewee_id INTEGER NOT NULL,

-- No podemos tener un reviewee con dos reviewers.
ADD CONSTRAINT unique_assigment_reviewee UNIQUE (assignment_id, reviewee_id);

COMMIT;
