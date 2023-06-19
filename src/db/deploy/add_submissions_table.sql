-- Deploy teachhub:add_submissions_table to pg

BEGIN;

  CREATE TABLE teachhub.submissions (
    id                    SERIAL PRIMARY KEY,
    user_id               INTEGER REFERENCES teachhub.users(id) NOT NULL,
    assignment_id         INTEGER REFERENCES teachhub.assignments(id) NOT NULL,
    description           TEXT,
    created_at            TIMESTAMP WITH TIME ZONE,
    updated_at            TIMESTAMP WITH TIME ZONE
  );

  -- ADD CONSTRAINT empty_link CHECK (link <> '');

COMMIT;
