-- Deploy teachhub:add_reviewers_table to pg

BEGIN;

-- Create a table that contains an id, a id pointing to user_roles table
-- an id_asignment and group_id

CREATE TABLE teachhub.reviewers (
  id SERIAL PRIMARY KEY,
  reviewer_id INTEGER REFERENCES teachhub.user_roles(id),
  assignment_id INTEGER REFERENCES teachhub.assignments(id) NOT NULL
);


COMMIT;
