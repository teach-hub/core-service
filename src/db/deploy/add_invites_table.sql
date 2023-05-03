-- Deploy teachhub:add_invites_table to pg

BEGIN;

  CREATE TABLE teachhub.invites (
    id                    SERIAL PRIMARY KEY,
    course_id             INTEGER REFERENCES teachhub.courses(id) NOT NULL,
    role_id               INTEGER REFERENCES teachhub.roles(id) NOT NULL,
    used_at               DATE
  );

COMMIT;
