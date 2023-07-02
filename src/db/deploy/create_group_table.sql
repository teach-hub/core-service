-- Deploy teachhub:create_group_table to pg

BEGIN;

CREATE TABLE teachhub.groups (
    id                    SERIAL PRIMARY KEY,
    course_id             INTEGER REFERENCES teachhub.courses(id) NOT NULL,
    name                  TEXT NOT NULL,
    active                  BOOLEAN NOT NULL
  );

COMMIT;
