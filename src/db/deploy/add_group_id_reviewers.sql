-- Deploy teachhub:add_group_id_reviewers to pg

BEGIN;

ALTER TABLE teachhub.reviewers
ADD COLUMN reviewee_group_id INTEGER REFERENCES teachhub.groups(id),
ALTER COLUMN reviewee_user_id DROP NOT NULL,
ADD CONSTRAINT reviewers_reviewee_group_id_reviewee_user_id_key
  CHECK (reviewee_group_id <> NULL OR reviewee_user_id <> NULL);

CREATE INDEX assignment_idx ON teachhub.reviewers(assignment_id);

COMMIT;
