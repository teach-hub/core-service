-- Deploy teachhub:create_group_participant_table to pg

BEGIN;

CREATE TABLE teachhub.group_participants (
    id                    SERIAL PRIMARY KEY,
    assignment_id             INTEGER REFERENCES teachhub.assignments(id) NOT NULL,
    group_id             INTEGER REFERENCES teachhub.groups(id) NOT NULL,
    user_role_id             INTEGER REFERENCES teachhub.user_roles(id) NOT NULL,
    name                  TEXT NOT NULL,
    active                  BOOLEAN NOT NULL
  );

COMMIT;
