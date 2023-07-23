-- Deploy teachhub:add_reviewers_table to pg

BEGIN;

CREATE TABLE teachhub.reviewers (
  id SERIAL PRIMARY KEY,
  reviewer_user_id INTEGER REFERENCES teachhub.users(id) NOT NULL,
  assignment_id INTEGER REFERENCES teachhub.assignments(id) NOT NULL,
  reviewee_user_id INTEGER REFERENCES teachhub.users(id) NOT NULL
);

CREATE INDEX reviewer_user_id_idx ON teachhub.reviewers(reviewer_user_id, reviewee_user_id, assignment_id);

COMMIT;
