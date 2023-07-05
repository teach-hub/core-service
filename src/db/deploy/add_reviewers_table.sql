-- Deploy teachhub:add_reviewers_table to pg

BEGIN;

CREATE TABLE teachhub.reviewers (
  id SERIAL PRIMARY KEY,
  reviewer_id INTEGER REFERENCES teachhub.user_roles(id),
  assignment_id INTEGER REFERENCES teachhub.assignments(id) NOT NULL,
  reviewee_user_id INTEGER REFERENCES teachhub.users(id) NOT NULL
);

COMMIT;
